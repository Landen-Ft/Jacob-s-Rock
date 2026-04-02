import { Client, GatewayIntentBits, Collection, EmbedBuilder, TextBasedChannel, TextChannel, NewsChannel } from "discord.js";
import { readdirSync } from "fs";
import { Logger } from "./logger.ts";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExtendedClient extends Client {
    commands?: Collection<string, any>;
}

const client: ExtendedClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load the logger
Logger(client);

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.ts'));

async function loadCommands() {
    for (const file of commandFiles) {
        const modulePath = path.join(commandsPath, file);
        const commandModule = await import(modulePath);
        const command = commandModule?.default ?? commandModule;

        if (!command?.data || !command?.execute) {
            console.warn(`[WARN] Command file ${file} is missing a 'data' or 'execute' property`);
            continue; // skip this file
        }

        client.commands!.set(command.data.name, command);
    }
}

loadCommands().catch(err => console.error('[ERROR] Loading commands failed', err));

// Bot ready
client.once('clientReady', () => {
    console.log(`Bot is online as ${client.user?.tag}`);
});

// Welcome new members if and only if WELCOME_CHANNEL_ID environment variable is set
if (process.env.WELCOME_CHANNEL_ID) {
    client.on('guildMemberAdd', async (member) => {
        const channel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID as string) as TextChannel | undefined;
        if (!channel || !channel.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle('👋 Welcome!')
            .setDescription(`Welcome to **${member.guild.name}**, ${member}!`)
            .setColor(0x57F287)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: 'Member Count', value: `${member.guild.memberCount}`, inline: true })
            .setFooter({ text: `User ID: ${member.id}` })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    });
} else {
    console.log("[WARN] WELCOME_CHANNEL_ID environment variable not set, welcome messages will not be sent")
}

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands?.get(interaction.commandName);
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