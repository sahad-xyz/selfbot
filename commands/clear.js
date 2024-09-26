module.exports = {
    name: 'clear',
    description: 'Delete your own messages',
    async execute(message, args) {
        const amount = args[0];
        if (!amount || (amount !== 'all' && isNaN(amount))) {
            return message.reply('Please provide a valid number of messages to delete or "all" to delete all your messages.');
        }

        const limit = amount === 'all' ? Infinity : parseInt(amount, 10);
        let delay = 0;
        let fetchedAll = false;
        let lastMessageId = message.id;
        let messagesDeleted = 0;

        async function deleteMessages(messages) {
            for (let i = 0; i < messages.length; i++) {
                if (messagesDeleted >= limit) return;
                try {
                    await messages[i].delete();
                    messagesDeleted++;
                    await new Promise(resolve => setTimeout(resolve, delay * 1000));
                } catch (error) {
                    if (error.code === 429) { // Rate limit error
                        delay = delay >= 5 ? 1 : delay + 1;
                        await new Promise(resolve => setTimeout(resolve, delay * 1000));
                        i--; // Retry the current message
                    } else {
                        console.error('Failed to delete message:', error);
                    }
                }
            }
        }

        async function fetchMessagesAndDelete() {
            while (!fetchedAll && messagesDeleted < limit) {
                try {
                    const fetchedMessages = await message.channel.messages.fetch({ limit: 100, before: lastMessageId });
                    const userMessages = fetchedMessages.filter(msg => msg.author.id === message.author.id);

                    if (userMessages.size > 0) {
                        await deleteMessages(Array.from(userMessages.values()));
                    }

                    if (fetchedMessages.size < 100) {
                        fetchedAll = true;
                    } else {
                        lastMessageId = fetchedMessages.last().id;
                    }
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                }
            }
        }

        // Delete the command message
        try {
            await message.delete();
            fetchMessagesAndDelete();
        } catch (error) {
            console.error('Failed to delete command message:', error);
        }
    },
};
