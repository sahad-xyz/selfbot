const { Collection } = require('discord.js-selfbot-v13');

const afkData = new Collection();
const autoClearAfk = new Collection();

module.exports = {
    name: 'afk',
    description: 'Set your AFK status with a custom message',
    async execute(message, args) {
        const subcommand = args[0];
        
        if (subcommand === 'off') {
            afkData.delete(message.author.id);
            message.channel.send(`**Welcome back, ${message.author.username}! You are no longer AFK.**`);
        } else if (subcommand === 'autoclear') {
            const option = args[1];
            if (option === 'on') {
                autoClearAfk.set(message.author.id, true);
                message.channel.send(`**AFK auto-clear is now ON, ${message.author.username}.**`);
            } else if (option === 'off') {
                autoClearAfk.set(message.author.id, false);
                message.channel.send(`**AFK auto-clear is now OFF, ${message.author.username}.**`);
            } else {
                message.reply('Please specify "on" or "off" for the auto-clear option.');
            }
        } else {
            const afkMessage = args.join(' ') || 'AFK';
            const timestamp = new Date();
            afkData.set(message.author.id, { message: afkMessage, timestamp: timestamp });
            message.channel.send(`**${message.author.username} is now AFK:** ${afkMessage}`);
        }
    },
};

// Monitor messages to clear AFK status if auto-clear is on
module.exports.monitor = async (message) => {
    const afkInfo = afkData.get(message.author.id);
    if (afkInfo) {
        const currentTime = new Date();
        const afkTime = Math.floor((currentTime - afkInfo.timestamp) / 1000);

        if (autoClearAfk.get(message.author.id) !== false && afkTime > 60) {
            afkData.delete(message.author.id);
            message.channel.send(`**Welcome back, ${message.author.username}! You are no longer AFK.**`);
        }
    }
};

// Notify users when they mention someone who is AFK
module.exports.notifyAFK = async (message) => {
    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (afkData.has(user.id)) {
                const afkInfo = afkData.get(user.id);
                const afkTime = Math.floor((new Date() - afkInfo.timestamp) / 1000);
                const afkTimeString = new Date(afkTime * 1000).toISOString().substr(11, 8);
                message.reply(`**${user.username} is AFK:** ${afkInfo.message} (since ${afkTimeString} ago)`);
            }
        });
    }
};
