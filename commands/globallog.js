const { MessageEmbed, WebhookClient } = require('discord.js-selfbot-v13');
const fs = require('fs');
const configPath = './config/config.json';

module.exports = {
    name: 'globallog',
    aliases: ['gl'],
    description: 'Global logging for deletions, pings, and edits',
    execute: async (message, args) => {
        const [type, webhookURL] = args;
        if (!type || !webhookURL) {
            return message.reply('Usage: .gl <deletion|ping|edit> <webhookURL>').catch(console.error);
        }

        const validTypes = ['deletion', 'ping', 'edit'];
        if (!validTypes.includes(type)) {
            return message.reply('Invalid type. Use one of: deletion, ping, edit').catch(console.error);
        }

        let config;

        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            config = { globallog: {} };
        }

        config.globallog[type] = webhookURL;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

        message.reply(`Global log for ${type} set to ${webhookURL}`).catch(console.error);
    },
    handleDeletion: async (message) => {
        if (message.guild) return; // Only handle DMs and group chats

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')).globallog;
        const webhookURL = config.deletion;
        if (!webhookURL) return;

        const embed = new MessageEmbed()
            .setTitle('Message Deleted')
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: message.channel.type === 'dm' ? 'DM' : 'Group Chat', inline: true },
                { name: 'Content', value: message.content || 'No content', inline: false },
                { name: 'Message Link', value: `[Jump to message](https://discord.com/channels/@me/${message.channel.id}/${message.id})`, inline: false }
            )
            .setTimestamp()
            .setColor('RED');

        const webhookClient = new WebhookClient({ url: webhookURL });
        await webhookClient.send({ embeds: [embed] });
    },
    handleEdit: async (oldMessage, newMessage) => {
        if (oldMessage.guild) return; // Only handle DMs and group chats

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')).globallog;
        const webhookURL = config.edit;
        if (!webhookURL) return;

        const embed = new MessageEmbed()
            .setTitle('Message Edited')
            .addFields(
                { name: 'Author', value: `${oldMessage.author.tag} (${oldMessage.author.id})`, inline: true },
                { name: 'Channel', value: oldMessage.channel.type === 'dm' ? 'DM' : 'Group Chat', inline: true },
                { name: 'Old Content', value: oldMessage.content || 'No content', inline: false },
                { name: 'New Content', value: newMessage.content || 'No content', inline: false },
                { name: 'Message Link', value: `[Jump to message](https://discord.com/channels/@me/${oldMessage.channel.id}/${oldMessage.id})`, inline: false }
            )
            .setTimestamp()
            .setColor('ORANGE');

        const webhookClient = new WebhookClient({ url: webhookURL });
        await webhookClient.send({ embeds: [embed] });
    },
    handlePing: async (message) => {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')).globallog;
        const webhookURL = config.ping;
        if (!webhookURL) return;

        if (message.mentions.users.has(message.client.user.id)) {
            const embed = new MessageEmbed()
                .setTitle('Ping Detected')
                .addFields(
                    { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Channel', value: message.guild ? `${message.guild.name} / ${message.channel.name}` : (message.channel.type === 'dm' ? 'DM' : 'Group Chat'), inline: true },
                    { name: 'Content', value: message.content || 'No content', inline: false },
                    { name: 'Message Link', value: message.guild ? `[Jump to message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})` : `[Jump to message](https://discord.com/channels/@me/${message.channel.id}/${message.id})`, inline: false }
                )
                .setTimestamp()
                .setColor('BLUE');

            const webhookClient = new WebhookClient({ url: webhookURL });
            await webhookClient.send({ embeds: [embed] });
        }
    }
};
