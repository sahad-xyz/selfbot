const axios = require('axios');

module.exports = {
    name: 'vanity',
    aliases: ['vanitychecker'],
    description: 'Checks if a vanity URL is available on Discord.',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("Please provide a vanity URL to check. Usage: `.vanitycheck <vanityURL>`");
        }

        const vanityURL = args[0];

        try {
            const response = await axios.get(`https://discord.com/api/v9/invites/${vanityURL}`, {
                validateStatus: false // Prevent axios from throwing for non-2xx statuses
            });

            if (response.status === 404) {
                message.reply(`The vanity URL \`${vanityURL}\` is **available** for use!`);
            } else if (response.status === 200) {
                message.reply(`The vanity URL \`${vanityURL}\` is **already in use**.`);
            } else {
                message.reply(`There was an error checking the vanity URL. Status Code: ${response.status}`);
            }
        } catch (error) {
            console.error('Error checking vanity URL:', error);
            message.reply('There was an error while checking the vanity URL.');
        }
    },
};
