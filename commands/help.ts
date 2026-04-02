import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient } from '../index.ts';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands')

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const commands = (interaction.client as ExtendedClient).commands;

    // Build command list with spacing + bold
    let commandList = '';
    commands?.forEach(cmd => {
        commandList += `**/${cmd.data.name}**\n> ${cmd.data.description}\n\n`;
    });

    const now = new Date();
    const formattedTime = now.toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription(`**Here are all available commands:**\n\n${commandList}`)
        .setColor(0x5865F2)

        // Server icon
        .setThumbnail(interaction?.guild?.iconURL() as string | null)

        // Footer (cleaner spacing)
        .setFooter({
            text: `Requested by ${interaction.user.tag} • ${formattedTime}`,
            iconURL: interaction.user.displayAvatarURL()
        })

        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}