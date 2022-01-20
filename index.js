const fs = require('fs');
const { MessageEmbed, Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});
const WebSocket = require('ws');

function playgroundRunCode(message, code) {
    let ws = new WebSocket('wss://cup-lang.org');
    ws.on('open', () => {
        ws.send(`\u0000${code}`);
    });
    ws.on('message', data => {
        data = data.toString();
        const type = data.charCodeAt();
        data = data.substr(1).split('\u0000');
        switch (type) {
            case 2: // Compilation result
                data = data[1].split(data[0]);
                data[0] = data[0].replaceAll('\033[0m', '**');
                data[0] = data[0].replaceAll('\033[32m', '**');
                const embed = new MessageEmbed()
                    .setColor('#008000')
                    .setAuthor(`Requested by: ${message.author.username}`, message.author.avatarURL())
                    .setDescription(data[0]);
                if (data[1].length > 0) {
                    data[1] = '```' + data[1].replaceAll('`', '\\`') + '```';
                }
                message.channel.send({ content: data[1], embeds: [embed] });
                ws.close();
                break;
        }
    });
}

const BOT_ID = '855932735138168852';
const GUILD_ID = '842863266585903144';
const INFO_CHANNEL_ID = '842863477818523708';
const INFO_MESSAGE_ID = '842864078790721577';
const SIPPER_ROLE_ID = '842870468598824981';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.guilds.fetch(GUILD_ID).then(guild => {
        guild.channels.cache.get(INFO_CHANNEL_ID).messages.fetch(INFO_MESSAGE_ID);
    });

    client.user.setPresence({
        activities: [{
            name: 'discord.gg/cup',
            type: 'PLAYING',
        }]
    });
});

client.on('messageCreate', message => {
    if (message.author.id === BOT_ID) {
        return;
    }
    let content = message.content;
    if (content.length <= 1 || content[0] !== '!') {
        return;
    }
    const command = content.substr(1);
    if (command.startsWith('help')) {
        message.channel.send(
            'Available commands:\n' +
            '\t`!build [CODE]`     Compile given code\n' +
            '\t`!run [CODE]`       Compile and run given code'
        );
    } else if ((command.length === 3 && command.startsWith('run')) || command.startsWith('run ')) {
        if (command.length <= 4) {
            message.channel.send('error: missing argument [CODE]');
        } else {
            let code = command.substr(4);
            if (code[0] == '`' && code[code.length - 1] == '`') {
                if (code[1] == '`' && code[code.length - 2] == '`' && code[2] == '`' && code[code.length - 3] == '`') {
                    code = code.substring(3, code.length - 3);
                } else {
                    code = code.substring(1, code.length - 1);
                }
            }
            playgroundRunCode(message, code);
        }
    } else {
        message.channel.send(`Command \`!${command.split(' ')[0]}\` was not recognized. Type \`!help\` too see available commands.`);
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id === INFO_MESSAGE_ID) {
        const guild = reaction.message.guild;
        const role = reaction.message.guild.roles.cache.find(r => r.id === SIPPER_ROLE_ID);
        guild.members.cache.find(member => member.id === user.id).roles.add(role);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.id === INFO_MESSAGE_ID) {
        const guild = reaction.message.guild;
        const role = guild.roles.cache.find(r => r.id === SIPPER_ROLE_ID);
        guild.members.cache.find(member => member.id === user.id).roles.remove(role);
    }
});

client.login(fs.readFileSync('token').toString());