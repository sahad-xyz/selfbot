const fs = require('fs');
const path = require('path');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    name: 'exportchat',
    description: 'Exports all chat data in a group chat or DM to a file',
    async execute(message, args) {
        // Check if the channel is a DM or Group DM
        if (message.channel.type !== 'DM' && message.channel.type !== 'GROUP_DM') {
            return message.reply('This command can only be used in a DM or group chat.');
        }

        const exportType = args[0]?.toLowerCase();
        if (!['txt', 'html'].includes(exportType)) {
            return message.reply('Please specify a valid export type: txt or html.');
        }

        try {
            const exportDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            const messages = await message.channel.messages.fetch({ limit: 100 });
            const messagesArray = Array.from(messages.values()).reverse();

            if (exportType === 'txt') {
                const filePath = path.join(exportDir, `chat_${message.channel.id}.txt`);
                const fileStream = fs.createWriteStream(filePath);
                messagesArray.forEach(msg => {
                    fileStream.write(`[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}\n`);
                });
                fileStream.end();
                await message.reply({ files: [filePath] });
            } else if (exportType === 'html') {
                const transcript = await createTranscript(message.channel, {
                    limit: -1,
                    returnType: 'buffer'
                });
                const filePath = path.join(exportDir, `chat_${message.channel.id}.html`);
                fs.writeFileSync(filePath, transcript);
                await message.reply({ files: [filePath] });
            }
        } catch (error) {
            console.error('Error exporting chat:', error);
            message.reply('There was an error trying to export the chat.');
        }
    },
};
