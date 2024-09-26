module.exports = {
    name: 'userinfo',
    aliases: ['ui'],
    description: 'Get information about a user',
    async execute(message, args) {
        let user;
        if (args[0]) {
            // Check if the argument is a mention
            if (message.mentions.users.size) {
                user = message.mentions.users.first();
            } else {
                // Try to find the user by ID
                try {
                    user = await message.client.users.fetch(args[0]);
                } catch (error) {
                    return message.reply('User not found.');
                }
            }
        } else {
            // If no argument is provided, use the message author
            user = message.author;
        }

        // General user information
        let userInfo = `**User Information: ${user.tag}**\n`;
        userInfo += `**Username:** ${user.username}\n`;
        userInfo += `**Discriminator:** #${user.discriminator}\n`;
        userInfo += `**ID:** ${user.id}\n`;
        userInfo += `**Bot:** ${user.bot ? 'Yes' : 'No'}\n`;
        userInfo += `**Created At:** ${user.createdAt.toDateString()}\n`;

        // User Badges
        const flags = user.flags ? user.flags.toArray() : [];
        const badges = {
            DISCORD_EMPLOYEE: 'Discord Employee',
            PARTNERED_SERVER_OWNER: 'Partnered Server Owner',
            HYPESQUAD_EVENTS: 'HypeSquad Events',
            BUGHUNTER_LEVEL_1: 'Bug Hunter Level 1',
            HOUSE_BRAVERY: 'House of Bravery',
            HOUSE_BRILLIANCE: 'House of Brilliance',
            HOUSE_BALANCE: 'House of Balance',
            EARLY_SUPPORTER: 'Early Supporter',
            TEAM_USER: 'Team User',
            SYSTEM: 'System',
            BUGHUNTER_LEVEL_2: 'Bug Hunter Level 2',
            VERIFIED_BOT: 'Verified Bot',
            VERIFIED_DEVELOPER: 'Early Verified Bot Developer',
            NITRO_SUBSCRIBER: 'Nitro Subscriber',
            BOOSTER: 'Server Booster'
        };
        userInfo += '**Badges:** ' + (flags.length ? flags.map(flag => badges[flag]).join(', ') : 'None') + '\n';

        if (message.guild) {
            // Guild-specific information
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                userInfo += `**Joined Server:** ${member.joinedAt.toDateString()}\n`;
                userInfo += `**Nickname:** ${member.nickname ? member.nickname : 'None'}\n`;
                userInfo += `**Highest Role:** ${member.roles.highest.name}\n`;
                userInfo += `**Roles:** ${member.roles.cache.map(role => role.name).join(', ')}\n`;

                // Dangerous permissions
                const dangerousPermissions = [
                    'ADMINISTRATOR',
                    'MANAGE_GUILD',
                    'MANAGE_ROLES',
                    'MANAGE_CHANNELS',
                    'KICK_MEMBERS',
                    'BAN_MEMBERS',
                    'MANAGE_NICKNAMES',
                    'MANAGE_WEBHOOKS',
                    'MANAGE_MESSAGES',
                    'MENTION_EVERYONE'
                ];

                if (member.permissions.has('ADMINISTRATOR')) {
                    userInfo += '**Permissions:** ADMINISTRATOR\n';
                } else {
                    const userPermissions = member.permissions.toArray().filter(perm => dangerousPermissions.includes(perm));
                    userInfo += '**Permissions:** ' + (userPermissions.length ? userPermissions.join(', ') : 'None') + '\n';
                }

                userInfo += `\n*Information about ${user.tag} in ${message.guild.name}*`;
            } else {
                userInfo += `\n*Information about ${user.tag}*`;
            }
        } else {
            userInfo += `\n*Information about ${user.tag}*`;
        }

        message.channel.send(userInfo);
    },
};
