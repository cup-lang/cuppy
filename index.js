const fs = require('fs');
const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});

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