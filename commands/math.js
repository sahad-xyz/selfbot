const { evaluate } = require('mathjs');

module.exports = {
    name: 'math',
    aliases: ['calc'],
    description: 'Calculate a mathematical expression',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a mathematical expression to evaluate.');
        }

        // Join the args into a single expression string
        let expression = args.join(' ');

        // Replace suffixes with their numerical equivalents
        const suffixes = {
            k: 'e3',
            m: 'e6',
            b: 'e9',
            t: 'e12'
        };

        expression = expression.replace(/(\d+)([kmbt])/gi, (match, num, suffix) => {
            return num + suffixes[suffix.toLowerCase()];
        });

        try {
            // Evaluate the expression using mathjs
            const result = evaluate(expression);

            // Format the result with commas
            const formattedResult = result.toLocaleString();

            // Convert result to suffix format
            let suffixResult;
            if (result >= 1e12) {
                suffixResult = (result / 1e12).toFixed(2) + 't';
            } else if (result >= 1e9) {
                suffixResult = (result / 1e9).toFixed(2) + 'b';
            } else if (result >= 1e6) {
                suffixResult = (result / 1e6).toFixed(2) + 'm';
            } else if (result >= 1e3) {
                suffixResult = (result / 1e3).toFixed(2) + 'k';
            } else {
                suffixResult = result.toString();
            }

            // Construct the message
            const resultMessage = `
**Result:** \`${formattedResult}\`
**Suffix Notation:** \`${suffixResult}\`
            `;

            message.channel.send(resultMessage);
        } catch (error) {
            message.reply('There was an error evaluating the expression. Please ensure it is a valid mathematical expression.');
        }
    },
};
