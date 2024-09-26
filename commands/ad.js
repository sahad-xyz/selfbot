const fs = require('fs');
const path = './adData.json';

// Function to dynamically import nanoid
async function loadNanoid() {
    const { customAlphabet } = await import('nanoid');
    return customAlphabet;
}

function loadAdData() {
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path);
        return JSON.parse(data);
    }
    return { bought: [], sold: [] };
}

function saveAdData(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function shortenURL(url) {
    return url.replace(/^(https?:\/\/)?(www\.)?(discord\.(gg|com)\/invite\/|invite\/)?/i, '.gg/');
}

async function generateUniqueID(adData) {
    const usedIDs = new Set([...adData.bought, ...adData.sold].map(ad => ad.id));
    const customAlphabet = await loadNanoid();
    const generateID = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);
    let id;
    do {
        const length = usedIDs.size < 100 ? 2 : usedIDs.size < 1000 ? 3 : 4;
        id = generateID().slice(0, length);
    } while (usedIDs.has(id));
    return id;
}

function formatAd(ad) {
    return `**ID:** ${ad.id}\n**Server:** ${ad.serverURL}\n**Amount:** $${ad.amount.toFixed(1)}\n**Status:** ${ad.status}\n**Payment:** ${ad.paymentMethod}\n**Info:** ${ad.adInfo}`;
}

function roundToTenth(value) {
    return Math.round(value * 10) / 10;
}

module.exports = {
    name: 'ad',
    description: 'Manage paid advertisements',
    async execute(message, args) {
        const subcommand = args[0];
        if (!subcommand) {
            return message.reply('Please specify a subcommand: bought, sold, remove, start, end, list, profit, spent, made, mark, info');
        }

        const adData = loadAdData();

        if (subcommand === 'bought') {
            const [serverURL, amt, paymentMethod, ...adInfo] = args.slice(1);
            if (!serverURL || !amt || !paymentMethod || !adInfo.length) {
                return message.reply('Please provide all required parameters: <server URL> <amt in USD> <ca/pp/crypto> <ad info>');
            }

            const newAd = {
                id: await generateUniqueID(adData),
                serverURL: shortenURL(serverURL),
                amount: parseFloat(amt),
                paymentMethod: paymentMethod.toUpperCase(),
                adInfo: adInfo.join(' '),
                status: 'pending'
            };
            adData.bought.push(newAd);
            saveAdData(adData);
            message.channel.send(`Advertisement bought logged:\n${formatAd(newAd)}`);

        } else if (subcommand === 'sold') {
            const [serverURL, amt, paymentMethod, ...adInfo] = args.slice(1);
            if (!serverURL || !amt || !paymentMethod || !adInfo.length) {
                return message.reply('Please provide all required parameters: <server URL> <amt in USD> <ca/pp/crypto> <ad info>');
            }

            const newAd = {
                id: await generateUniqueID(adData),
                serverURL: shortenURL(serverURL),
                amount: parseFloat(amt),
                paymentMethod: paymentMethod.toUpperCase(),
                adInfo: adInfo.join(' '),
                status: 'pending'
            };
            adData.sold.push(newAd);
            saveAdData(adData);
            message.channel.send(`Advertisement sold logged:\n${formatAd(newAd)}`);

        } else if (subcommand === 'remove') {
            const adID = args[1];
            if (!adID) {
                return message.reply('Please provide the ad ID to remove.');
            }

            const beforeCount = adData.bought.length + adData.sold.length;
            adData.bought = adData.bought.filter(ad => ad.id !== adID);
            adData.sold = adData.sold.filter(ad => ad.id !== adID);
            const afterCount = adData.bought.length + adData.sold.length;

            if (beforeCount === afterCount) {
                return message.reply(`Advertisement with ID ${adID} not found.`);
            }

            saveAdData(adData);
            message.channel.send(`Advertisement with ID ${adID} removed.`);

        } else if (subcommand === 'start') {
            const adID = args[1];
            if (!adID) {
                return message.reply('Please provide the ad ID to start.');
            }

            const ad = adData.bought.find(ad => ad.id === adID) || adData.sold.find(ad => ad.id === adID);
            if (ad) {
                ad.status = 'started';
                saveAdData(adData);
                message.channel.send(`Advertisement with ID ${adID} marked as started:\n${formatAd(ad)}`);
            } else {
                message.reply(`Advertisement with ID ${adID} not found.`);
            }

        } else if (subcommand === 'end') {
            const adID = args[1];
            if (!adID) {
                return message.reply('Please provide the ad ID to end.');
            }

            const ad = adData.bought.find(ad => ad.id === adID) || adData.sold.find(ad => ad.id === adID);
            if (ad) {
                ad.status = 'ended';
                saveAdData(adData);
                message.channel.send(`Advertisement with ID ${adID} marked as ended:\n${formatAd(ad)}`);
            } else {
                message.reply(`Advertisement with ID ${adID} not found.`);
            }

        } else if (subcommand === 'list') {
            let response = 'Advertisements:\n\n**Bought:**\n';
            let spent = 0;
            let made = 0;

            adData.bought.forEach(ad => {
                response += `${formatAd(ad)}\n\n`;
                spent += ad.amount;
            });

            response += '\n**Sold:**\n';
            adData.sold.forEach(ad => {
                response += `${formatAd(ad)}\n\n`;
                made += ad.amount;
            });

            response += `\n**Total Spent:** $${roundToTenth(spent)}\n**Total Made:** $${roundToTenth(made)}`;
            message.channel.send(response);

        } else if (subcommand === 'profit') {
            const spent = roundToTenth(adData.bought.reduce((acc, ad) => acc + ad.amount, 0));
            const made = roundToTenth(adData.sold.reduce((acc, ad) => acc + ad.amount, 0));
            const profit = roundToTenth(made - spent);
            message.channel.send(`**Total profit:** $${profit}`);

        } else if (subcommand === 'spent') {
            let response = '**Money Spent on Ads:**\n';
            const spentByServer = {};

            adData.bought.forEach(ad => {
                if (!spentByServer[ad.serverURL]) {
                    spentByServer[ad.serverURL] = 0;
                }
                spentByServer[ad.serverURL] += ad.amount;
            });

            for (const [server, amount] of Object.entries(spentByServer)) {
                response += `**Server:** ${server}, **Amount:** $${roundToTenth(amount)}\n`;
            }

            const totalSpent = roundToTenth(adData.bought.reduce((acc, ad) => acc + ad.amount, 0));
            response += `\n**Total Spent:** $${totalSpent}`;
            message.channel.send(response);

        } else if (subcommand === 'made') {
            let response = '**Money Made from Ads:**\n';
            const madeByServer = {};

            adData.sold.forEach(ad => {
                if (!madeByServer[ad.serverURL]) {
                    madeByServer[ad.serverURL] = 0;
                }
                madeByServer[ad.serverURL] += ad.amount;
            });

            for (const [server, amount] of Object.entries(madeByServer)) {
                response += `**Server:** ${server}, **Amount:** $${roundToTenth(amount)}\n`;
            }

            const totalMade = roundToTenth(adData.sold.reduce((acc, ad) => acc + ad.amount, 0));
            response += `\n**Total Made:** $${totalMade}`;
            message.channel.send(response);

        } else if (subcommand === 'mark') {
            const newStatus = args[1];
            if (newStatus !== 'ended' && newStatus !== 'pending' && newStatus !== 'started') {
                return message.reply('Please provide a valid status: ended, pending, started');
            }

            adData.bought.forEach(ad => {
                ad.status = newStatus;
            });
            adData.sold.forEach(ad => {
                ad.status = newStatus;
            });
            saveAdData(adData);
            message.channel.send(`All advertisements marked as ${newStatus}.`);

        } else if (subcommand === 'info') {
            const adID = args[1];
            if (!adID) {
                return message.reply('Please provide the ad ID to show info.');
            }

            const ad = adData.bought.find(ad => ad.id === adID) || adData.sold.find(ad => ad.id === adID);
            if (ad) {
                message.channel.send(`Advertisement with ID ${adID} info:\n${formatAd(ad)}`);
            } else {
                message.reply(`Advertisement with ID ${adID} not found.`);
            }

        } else {
            message.reply('Unknown subcommand.');
        }
    },
};
