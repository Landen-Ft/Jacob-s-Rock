require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load the logger
require('./logger')(client);

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.execute) {
        console.warn(`[WARNING] Command file ${file} is missing a 'data' or 'execute' property`);
        continue; // skip this file
    }

    client.commands.set(command.data.name, command);
}

// Bot ready
client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// Welcome new members
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle('👋 Welcome!')
        .setDescription(`Welcome to **${member.guild.name}**, ${member}!`)
        .setColor(0x57F287)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields({ name: 'Member Count', value: `${member.guild.memberCount}`, inline: true })
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
});

// Login
client.login(process.env.BOT_TOKEN);