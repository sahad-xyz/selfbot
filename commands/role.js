const { Util } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'role',
    description: 'Manage roles with subcommands: create, add, remove, delete, rename, icon, parent, hoist',
    async execute(message, args) {
        const subcommand = args[0];
        if (!subcommand) {
            return message.reply('Please specify a subcommand: create, add, remove, delete, rename, icon, parent, hoist.');
        }

        switch (subcommand) {
            case 'create':
                return createRole(message, args.slice(1));
            case 'add':
                return addRole(message, args.slice(1));
            case 'remove':
                return removeRole(message, args.slice(1));
            case 'delete':
                return deleteRole(message, args.slice(1));
            case 'rename':
                return renameRole(message, args.slice(1));
            case 'icon':
                return setRoleIcon(message, args.slice(1));
            case 'parent':
                return setRoleParent(message, args.slice(1));
            case 'hoist':
                return setRoleHoist(message, args.slice(1));
            default:
                return message.reply('Invalid subcommand. Use create, add, remove, delete, rename, icon, parent, or hoist.');
        }
    }
};

async function createRole(message, args) {
    const name = args[0];
    const color = args[1] ? Util.resolveColor(args[1]) : 'DEFAULT';
    const icon = args[2] || null;
    const hoisted = args[3] && args[3].toLowerCase() === 'hoisted';

    if (!name) {
        return message.reply('Please provide a name for the role.');
    }

    try {
        const newRole = await message.guild.roles.create({
            name: name,
            color: color,
            icon: icon,
            hoist: hoisted,
            permissions: [] // Create role with no permissions
        });
        message.reply(`Role ${newRole.name} created successfully with no permissions.`);
    } catch (error) {
        console.error('Failed to create role:', error);
        message.reply('Failed to create role. Please check the console for more details.');
    }
}

async function addRole(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();
    const members = message.mentions.members;

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }
    if (members.size === 0) {
        return message.reply('Please mention the members to add the role to.');
    }

    // Ask for confirmation
    const confirmationMessage = await message.channel.send(`Are you sure you want to add the role ${role.name} to the mentioned members? Type \`YES\` to confirm.`);
    const filter = response => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', async response => {
        if (response.content === 'YES') {
            collector.stop('confirmed');
            try {
                for (const member of members.values()) {
                    await member.roles.add(role);
                }
                message.reply(`Role ${role.name} added to the mentioned members.`);
            } catch (error) {
                console.error('Failed to add role to members:', error);
                message.reply('Failed to add role to members. Please check the console for more details.');
            }
        } else {
            collector.stop('cancelled');
            message.channel.send('Role add command cancelled.');
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            message.channel.send('Role add command timed out.');
        }
    });
}

async function removeRole(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();
    const members = message.mentions.members;

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }
    if (members.size === 0) {
        return message.reply('Please mention the members to remove the role from.');
    }

    // Ask for confirmation
    const confirmationMessage = await message.channel.send(`Are you sure you want to remove the role ${role.name} from the mentioned members? Type \`YES\` to confirm.`);
    const filter = response => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', async response => {
        if (response.content === 'YES') {
            collector.stop('confirmed');
            try {
                for (const member of members.values()) {
                    await member.roles.remove(role);
                }
                message.reply(`Role ${role.name} removed from the mentioned members.`);
            } catch (error) {
                console.error('Failed to remove role from members:', error);
                message.reply('Failed to remove role from members. Please check the console for more details.');
            }
        } else {
            collector.stop('cancelled');
            message.channel.send('Role remove command cancelled.');
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            message.channel.send('Role remove command timed out.');
        }
    });
}

async function deleteRole(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }

    // Ask for confirmation
    const confirmationMessage = await message.channel.send(`Are you sure you want to delete the role ${role.name}? Type \`YES\` to confirm.`);
    const filter = response => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', async response => {
        if (response.content === 'YES') {
            collector.stop('confirmed');
            try {
                await role.delete();
                message.reply(`Role ${role.name} deleted successfully.`);
            } catch (error) {
                console.error('Failed to delete role:', error);
                message.reply('Failed to delete role. Please check the console for more details.');
            }
        } else {
            collector.stop('cancelled');
            message.channel.send('Role delete command cancelled.');
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            message.channel.send('Role delete command timed out.');
        }
    });
}

async function renameRole(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();
    const newName = args.slice(1).join(' ');

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }
    if (!newName) {
        return message.reply('Please provide a new name for the role.');
    }

    try {
        await role.setName(newName);
        message.reply(`Role ${role.name} renamed to ${newName} successfully.`);
    } catch (error) {
        console.error('Failed to rename role:', error);
        message.reply('Failed to rename role. Please check the console for more details.');
    }
}

async function setRoleIcon(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();
    const emoji = args[1];

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }
    if (!emoji) {
        return message.reply('Please provide an emoji for the role icon.');
    }

    try {
        await role.setIcon(emoji);
        message.reply(`Role ${role.name} icon set to ${emoji} successfully.`);
    } catch (error) {
        console.error('Failed to set role icon:', error);
        message.reply('Failed to set role icon. Please check the console for more details.');
    }
}

async function setRoleParent(message, args) {
    const targetRoleId = args[0]?.replace(/[^0-9]/g, '');
    const parentRoleId = args[1]?.replace(/[^0-9]/g, '');

    const targetRole = message.guild.roles.cache.get(targetRoleId) || message.mentions.roles.first();
    const parentRole = message.guild.roles.cache.get(parentRoleId) || message.mentions.roles.at(1);

    if (!targetRole || !parentRole) {
        let missingRoles = [];
        if (!targetRole) missingRoles.push('target role');
        if (!parentRole) missingRoles.push('parent role');
        return message.reply(`Please provide valid role IDs or mentions for the following: ${missingRoles.join(', ')}.`);
    }

    try {
        const roles = Array.from(message.guild.roles.cache.sort((a, b) => a.position - b.position).values());
        const parentRoleIndex = roles.findIndex(role => role.id === parentRole.id);

        if (parentRoleIndex === -1) {
            return message.reply('Parent role not found in the guild roles.');
        }

        await targetRole.setPosition(parentRole.position + 1);

        message.reply(`Role ${targetRole.name} moved to be directly below ${parentRole.name} successfully.`);
    } catch (error) {
        console.error('Failed to set role parent:', error);
        message.reply('Failed to set role parent. Please check the console for more details.');
    }
}

async function setRoleHoist(message, args) {
    const role = message.guild.roles.cache.get(args[0]?.replace(/[^0-9]/g, '')) || message.mentions.roles.first();
    const hoist = args[1]?.toLowerCase() === 'true';

    if (!role) {
        return message.reply('Please provide a valid role ID or mention.');
    }

    try {
        await role.setHoist(hoist);
        message.reply(`Role ${role.name} hoist set to ${hoist} successfully.`);
    } catch (error) {
        console.error('Failed to set role hoist:', error);
        message.reply('Failed to set role hoist. Please check the console for more details.');
    }
}
