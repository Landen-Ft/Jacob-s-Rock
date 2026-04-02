const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about this server'),

    async execute(interaction) {
        const { guild } = interaction;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name}`)
            .setColor(0x5865F2)

            // Server icon
            .setThumbnail(guild.iconURL({ dynamic: true }))

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
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};