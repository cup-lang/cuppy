const fs = require('fs');
const { MessageEmbed, Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
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
                data[0] = data[0].replaceAll('\033[0m', '').replaceAll('\033[35m', '').replaceAll('\033[32m', '').replaceAll('\033[0;31m', '');
                const error = data.length === 1;
                const embed = new MessageEmbed()
                    .setColor(error ? '#7f0000' : '#008000')
                    .setAuthor(`Requested by: ${message.author.username}`, message.author.avatarURL())
                    .setDescription(`\`\`\`${data[0]}\`\`\``);
                let output = '';
                if (data.length > 1 && data[1].length > 0) {
                    output = `\`\`\`${data[1].replaceAll('`', '\\`')}\`\`\``;
                } else if (error) {
                    output = '**Compilation error** 😢';
                } else {
                    output = '**No program output** 🧐';
                }
                if (output.length > 2000) {
                    output = output.substr(0, 1953) + '``` **Discord\'s max message length exceeded** 👀';
                }
                message.channel.send({ content: output, embeds: [embed] });
                ws.close();
                break;
        }
    });
}

let logs_channel;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.guilds.fetch('842863266585903144').then(guild => {
        logs_channel = guild.channels.cache.get('844039591223623741');

        logs_channel.send(`${client.user} is now online.`);
    });

    client.user.setPresence({
        activities: [{
            name: 'discord.gg/cup',
            type: 'PLAYING',
        }]
    });
});

client.on('messageCreate', message => {
    if (message.author.id === client.user.id) {
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

client.on('guildMemberAdd', member => {
    logs_channel.send(`${member} joined the server.`);
});

client.on('guildMemberRemove', member => {
    logs_channel.send(`${member} left the server.`);
});

client.on('guildBanAdd', ban => {
    logs_channel.send(`${ban.user} was banned from the server.`);
});

client.on('guildBanRemove', ban => {
    logs_channel.send(`${ban.user} was unbanned from the server.`);
});

client.login(fs.readFileSync('token').toString());