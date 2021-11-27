const fs = require('fs');
const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});
const WebSocket = require('ws');
let ws;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function connectToPlayground() {
    ws = new WebSocket('wss://cup-lang.org');
    ws.on('message', (data) => {
        data = data.toString();
        const type = data.charCodeAt();
        data = data.substr(1).split('\u0000');
        switch (type) {
            case 2: // Compilation result
                const out = data[1].split(data[0])[1];
                client.guilds.fetch('842863266585903144').then(guild => {
                    guild.channels.cache.get('842869766422003802').send(out);
                });
                break;
        }
    });
    ws.onclose = () => {
        setTimeout(connectToPlayground, 1000);
    };
}
connectToPlayground();

function playgroundRunCode(code) {
    ws.send(`\u0000${code}`);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.guilds.fetch('842863266585903144').then(guild => {
        guild.channels.cache.get('842863477818523708').messages.fetch('842864078790721577');
    });

    client.user.setPresence({
        activities: [{
            name: 'discord.gg/cup',
            type: 'PLAYING',
        }]
    });
});

client.on('messageCreate', message => {
    if (message.content[0] === '!') {
        if (message.content.substr(1, 4) === 'help') {
            message.channel.send(
                'Available commands:\n' +
                '\t`build [CODE]`     Compile given code\n' +
                '\t`run [CODE]`       Compile and run given code'
            );
        } else if (message.content.substr(1, 4) === 'run ') {
            playgroundRunCode(message.content.substr(5));
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id === '842864078790721577') {
        const guild = reaction.message.guild;
        const role = reaction.message.guild.roles.cache.find(r => r.id === '842870468598824981');
        guild.members.cache.find(member => member.id === user.id).roles.add(role);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.id === '842864078790721577') {
        const guild = reaction.message.guild;
        const role = guild.roles.cache.find(r => r.id === '842870468598824981');
        guild.members.cache.find(member => member.id === user.id).roles.remove(role);
    }
});

client.login(fs.readFileSync('token').toString());