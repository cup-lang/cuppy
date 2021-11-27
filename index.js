const fs = require('fs');
const { MessageEmbed, Client, Intents } = require('discord.js');
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
                data = data[1].split(data[0]);
                client.guilds.fetch('842863266585903144').then(guild => {
                    out = data[1].replaceAll('\033[0m', '**');
                    out = data[1].replaceAll('\033[32m', '**');
                    const embed = new MessageEmbed()
                        .setColor('#008000')
                        .setAuthor('Requested by: ___', 'https://cdn.discordapp.com/embed/avatars/0.png')
                        .setDescription(data[0])
                        .setTimestamp();
                    guild.channels.cache.get('842869766422003802').send(`\`\`\`${out}\`\`\``, { embeds: [embed] });
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
    let msg = message.content;
    if (msg[0] === '!') {
        msg = msg.substr(1);
        if (msg.startsWith('help')) {
            message.channel.send(
                'Available commands:\n' +
                '\t`!build [CODE]`     Compile given code\n' +
                '\t`!run [CODE]`       Compile and run given code'
            );
        } else if (msg.startsWith('run')) {
            if (msg.length < 5) {
                message.channel.send('error: missing [CODE]');
            } else {
                playgroundRunCode(msg.substr(4));
            }
        }
    }
});

const ADD_SIPPER_ROLE_MESSAGE_ID = '842864078790721577';
const SIPPER_ROLE_ID = '842870468598824981';
client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id === ADD_SIPPER_ROLE_MESSAGE_ID) {
        const guild = reaction.message.guild;
        const role = reaction.message.guild.roles.cache.find(r => r.id === SIPPER_ROLE_ID);
        guild.members.cache.find(member => member.id === user.id).roles.add(role);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.id === ADD_SIPPER_ROLE_MESSAGE_ID) {
        const guild = reaction.message.guild;
        const role = guild.roles.cache.find(r => r.id === SIPPER_ROLE_ID);
        guild.members.cache.find(member => member.id === user.id).roles.remove(role);
    }
});

client.login(fs.readFileSync('token').toString());