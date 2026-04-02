import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about this server')

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const { guild } = interaction;
    if (guild === null) {
        interaction.reply({content: "idk what it was this time but we ran out of budget for it, pls let an admin know so we can allocate funds", ephemeral: true})
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle(`${guild.name}`)
        .setColor(0x5865F2)

        // Server icon
        .setThumbnail(guild.iconURL())

        // Main info
        .addFields(
            {
                name: 'Server ID',
                value: guild.id,
                inline: true
            },
            {
                name: 'Owner',
                value: `<@${guild.ownerId}>`,
                inline: true
            },
            {
                name: 'Members',
                value: `${guild.memberCount}`,
                inline: true
            },
            {
                name: 'Created On',
                value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                inline: false
            }
        )

        // Footer
        .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
        })

        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}