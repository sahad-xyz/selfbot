const snipes = new Map();

module.exports = {
    name: 'snipe',
    description: 'Snipe the most recent deleted message',
    async execute(message) {
        const channelSnipes = snipes.get(message.channel.id);
        if (!channelSnipes || !channelSnipes.length) {
            return message.channel.send('There are no sniped messages in this channel.');
        }

        const snipe = channelSnipes[channelSnipes.length - 1];

        message.channel.send(`**Sniped Message:**\n**Author:** ${snipe.author.tag} (ID: ${snipe.author.id})\n**Content:** ${snipe.content}`);
    },
};

// Listener for message deletions
module.exports.messageDeleteListener = async (message) => {
    if (!snipes.has(message.channel.id)) {
        snipes.set(message.channel.id, []);
    }

    snipes.get(message.channel.id).push({
        content: message.content,
        author: message.author,
        timestamp: new Date(),
    });

    // Limit the snipe history to the most recent 10 messages
    if (snipes.get(message.channel.id).length > 10) {
        snipes.get(message.channel.id).shift();
    }
};
