module.exports = {
    name: 'nuke',
    description: 'Nuke the current channel and recreate it with the same properties',
    async execute(message, args) {
        // Ask for confirmation
        const confirmationMessage = await message.channel.send('Are you sure you want to nuke this channel? Type `YES` to confirm.');
        
        // Create a message collector to wait for the user's response
        const filter = response => response.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 15000 }); // 15 seconds to respond

        collector.on('collect', async response => {
            if (response.content === 'YES') {
                collector.stop('confirmed');
                await nukeChannel(message);
            } else {
                collector.stop('cancelled');
                message.channel.send('Nuke command cancelled.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.channel.send('Nuke command timed out.');
            }
        });
    }
};

async function nukeChannel(message) {
    try {
        const channel = message.channel;

        // Fetch current channel details
        const channelDetails = {
            name: channel.name,
            type: channel.type,
            parentID: channel.parentId,
            permissionOverwrites: Array.from(channel.permissionOverwrites.cache.values()).map(overwrite => {
                return {
                    id: overwrite.id,
                    allow: overwrite.allow.toArray(),
                    deny: overwrite.deny.toArray()
                };
            }),
            topic: channel.topic,
            position: channel.position,
            nsfw: channel.nsfw,
            rateLimitPerUser: channel.rateLimitPerUser
        };

        // Delete the channel
        await channel.delete();

        // Create a new channel with the same details
        const newChannel = await channel.guild.channels.create(channelDetails.name, {
            type: channelDetails.type,
            parent: channelDetails.parentID,
            permissionOverwrites: channelDetails.permissionOverwrites,
            topic: channelDetails.topic,
            nsfw: channelDetails.nsfw,
            rateLimitPerUser: channelDetails.rateLimitPerUser
        });

        // Set the position of the new channel
        await newChannel.setPosition(channelDetails.position);

        newChannel.send(`Channel nuked and recreated by ${message.author.tag}`);
    } catch (error) {
        console.error('Failed to nuke the channel:', error);
        message.channel.send('Failed to nuke the channel. Please check the console for more details.');
    }
}
