const { Client, Collection } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client();
const token = ''; // Replace with your actual Discord user token

// Ensure config directory and config.json exist
const configDir = './config';
const configPath = `${configDir}/config.json`;

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        globallog: {
            deletion: '',
            ping: '',
            edit: ''
        }
    }, null, 2));
}

// Load commands from the commands folder
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    if (command.aliases) {
        command.aliases.forEach(alias => {
            client.commands.set(alias, command);
        });
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) {
        // Notify users when they mention someone who is AFK
        const afkCommand = client.commands.get('afk');
        if (afkCommand) afkCommand.notifyAFK(message);

        // Handle Karuta and analysis bot messages for kdrop
        const kdropCommand = client.commands.get('kdrop');
        if (kdropCommand) kdropCommand.messageCreateListener(message);

        // Handle ping logging
        const globallogCommand = client.commands.get('globallog');
        if (globallogCommand) await globallogCommand.handlePing(message);
        return;
    }

    const prefix = '.';
    if (!message.content.startsWith(prefix)) {
        // Monitor messages to clear AFK status if auto-clear is on
        const afkCommand = client.commands.get('afk');
        if (afkCommand) afkCommand.monitor(message);
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) {
        // Notify users when they mention someone who is AFK
        const afkCommand = client.commands.get('afk');
        if (afkCommand) afkCommand.notifyAFK(message);
        return;
    }

    const command = client.commands.get(commandName);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error('Error executing command:', error);
        message.reply('There was an error trying to execute that command!').catch(console.error);
    }
});

// Set up listeners for message deletions and edits
client.on('messageDelete', async message => {
    const snipeCommand = client.commands.get('snipe');
    if (snipeCommand) snipeCommand.messageDeleteListener(message);

    // Handle deletion logging
    const globallogCommand = client.commands.get('globallog');
    if (globallogCommand) await globallogCommand.handleDeletion(message);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    const editSnipeCommand = client.commands.get('editsnipe');
    if (editSnipeCommand) editSnipeCommand.messageUpdateListener(oldMessage, newMessage);

    // Handle edit logging
    const globallogCommand = client.commands.get('globallog');
    if (globallogCommand) await globallogCommand.handleEdit(oldMessage, newMessage);
});


client.login(token).catch(console.error);
