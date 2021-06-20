const fs = require('fs');
const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.NON_PRIVILEGED,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{
            name: 'you 👀',
            type: 'WATCHING',
        }]
    });
});

client.on('message', message => {
    if (message.content[0] === '!' || message.content[0] === '?') {
        switch (message.content.substr(1)) {
            case 'help':
                message.channel.send(
                    'Available commands:\n' +
                    '\t`build [CODE]`\0\0\0\0\0\0Compile given code\n' +
                    '\t`run [CODE]`\0\0\0\0\0\0\0\0\0Compile and run given code'
                );
                break;
        }
    }
});

client.login(fs.readFileSync('token').toString());