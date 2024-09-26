module.exports = {
    name: 'status',
    usage: '.status <online/dnd/invisible/idle>',
    description: 'Switches the user\'s status mode to the mentioned one.',
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply("Please provide a status to set. Usage: `.status <online/dnd/invisible/idle>`");
        }

        const status = args[0].toLowerCase();

        // Valid statuses in Discord
        const validStatuses = ['online', 'dnd', 'idle', 'invisible'];

        if (!validStatuses.includes(status)) {
            return message.reply("Invalid status provided. Please use one of the following: `online`, `dnd`, `idle`, `invisible`.");
        }

        try {
            // Set the user's status
            client.user.setPresence({ status: status });
            message.reply(`Your status has been changed to **${status}**.`);
        } catch (error) {
            console.error('Error changing status:', error);
            message.reply('There was an error trying to change your status.');
        }
    },
};
