const editSnipes = new Map();

module.exports = {
    name: 'editsnipe',
    description: 'Snipe the most recent edited message',
    async execute(message) {
        const channelEditSnipes = editSnipes.get(message.channel.id);
        if (!channelEditSnipes || !channelEditSnipes.length) {
            return message.channel.send('There are no edited messages sniped in this channel.');
        }

        const editSnipe = channelEditSnipes[channelEditSnipes.length - 1];

        message.channel.send(`**Edit Sniped Message:**\n**Author:** ${editSnipe.author.tag} (ID: ${editSnipe.author.id})\n**Original Content:** ${editSnipe.oldContent}\n**Edited Content:** ${editSnipe.newContent}`);
    },
};

// Listener for message edits
module.exports.messageUpdateListener = async (oldMessage, newMessage) => {
    if (!editSnipes.has(oldMessage.channel.id)) {
        editSnipes.set(oldMessage.channel.id, []);
    }

    editSnipes.get(oldMessage.channel.id).push({
        oldContent: oldMessage.content,
        newContent: newMessage.content,
        author: oldMessage.author,
        timestamp: new Date(),
    });

    // Limit the edit snipe history to the most recent 10 messages
    if (editSnipes.get(oldMessage.channel.id).length > 10) {
        editSnipes.get(oldMessage.channel.id).shift();
    }
};
