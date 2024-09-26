const { Permissions } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'channel',
    description: 'Channel management commands',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("Please specify a subcommand: create, delete, rename, info.");
        }

        const subCommand = args[0].toLowerCase();
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;

        switch (subCommand) {
            case 'create':
                const name = args[1];
                const categoryID = args[2];
                const channelDescription = args.slice(3).join(' ');

                if (!name) {
                    return message.reply("Please provide a name for the new channel.");
                }

                try {
                    const options = { type: 'GUILD_TEXT' };
                    if (categoryID) {
                        options.parent = categoryID;
                    }
                    if (channelDescription) {
                        options.topic = channelDescription;
                    }
                    const newChannel = await message.guild.channels.create(name, options);
                    return message.reply(`Channel ${newChannel.name} created successfully.`);
                } catch (error) {
                    console.error('Error creating channel:', error);
                    return message.reply('There was an error trying to create the channel.');
                }
                break;

            case 'delete':
                if (!channel) {
                    return message.reply("Please provide a valid channel mention or ID.");
                }

                await message.reply(`Are you sure you want to delete ${channel}? Type YES to confirm.`)
                    .then(() => {
                        const filter = response => response.content === 'YES' && response.author.id === message.author.id;
                        message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                            .then(async collected => {
                                await channel.delete();
                                message.reply(`Channel ${channel.name} deleted successfully.`);
                            })
                            .catch(() => {
                                message.reply('Channel deletion canceled.');
                            });
                    });
                break;

            case 'rename':
                const newName = args.slice(1).join(' ');
                if (!newName) {
                    return message.reply("Please provide a new name for the channel.");
                }
                try {
                    await channel.setName(newName);
                    message.reply(`Channel renamed to ${newName} successfully.`);
                } catch (error) {
                    console.error('Error renaming channel:', error);
                    message.reply('There was an error trying to rename the channel.');
                }
                break;

            case 'info':
                try {
                    const category = channel.parent ? channel.parent.name : 'None';
                    const createdAt = channel.createdAt.toISOString().replace('T', ' ').replace(/\..+/, '') + ' (UTC)';
                    let info = `**Channel Information**\nName: ${channel.name}\nID: ${channel.id}\nType: ${channel.type.toUpperCase()}\nCategory: ${category}\nDescription: ${channel.topic || 'None'}\nCreated At: ${createdAt}`;
                    await message.reply(info);
                    await message.reply('Would you like to see the channel permissions? Type YES to view.');

                    const filter = response => response.author.id === message.author.id;
                    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 });
                    collector.on('collect', async m => {
                        if (m.content.toUpperCase() === 'YES') {
                            let permissionsInfo = `**Permissions for '${channel.name}'**\n`;
channel.permissionOverwrites.map(overwrite => {
    const roleOrUser = overwrite.type === 'role' ? `@${message.guild.roles.cache.get(overwrite.id)?.name}` : `${message.guild.members.cache.get(overwrite.id)?.user.tag}`;
    const allowed = overwrite.allow.toArray().join(', ') || 'None';
    const denied = overwrite.deny.toArray().join(', ') || 'None';
    permissionsInfo += `${roleOrUser}\nAllowed: ${allowed}\nDenied: ${denied}\n`;
});
await message.reply(permissionsInfo);

                            
                        } else {
                            await message.reply('Cancelled viewing permissions.');
                        }
                    });
                    collector.on('end', collected => {
                        if (collected.size === 0) message.reply('No response received, viewing permissions cancelled.');
                    });
                } catch (error) {
                    console.error('Error fetching channel info:', error);
                    message.reply('There was an error trying to fetch the channel information.');
                }
                break;

            default:
                message.reply("Unknown subcommand. Please use create, delete, rename, or info.");
                break;
        }
    },
};