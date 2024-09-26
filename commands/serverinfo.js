module.exports = {
    name: 'serverinfo',
    description: 'Get information about the server',
    async execute(message) {
        const { guild } = message;

        if (!guild) {
            return message.reply('This command can only be used in a server.');
        }

        // Fetch the guild owner
        const owner = await guild.fetchOwner();

        const serverInfo = `
**Server Information: ${guild.name}**
**ID:** ${guild.id}
**Owner:** ${owner.user.tag}
**Region:** ${guild.region}
**Created At:** ${guild.createdAt.toDateString()}
**Member Count:** ${guild.memberCount}
**Verification Level:** ${guild.verificationLevel}
**Boost Level:** ${guild.premiumTier}
**Boosts:** ${guild.premiumSubscriptionCount}
**Roles:** ${guild.roles.cache.size}
**Channels:** ${guild.channels.cache.size}
**Emojis:** ${guild.emojis.cache.size}
        `;

        message.channel.send(serverInfo);
    },
};
