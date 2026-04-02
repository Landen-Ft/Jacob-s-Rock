const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),

    async execute(interaction) {
        const commands = interaction.client.commands;

        // Build command list with spacing + bold
        let commandList = '';
        commands.forEach(cmd => {
            commandList += `**/${cmd.data.name}**\n> ${cmd.data.description}\n\n`;
        });

        const now = new Date();
        const formattedTime = now.toLocaleString();

        const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription(`**Here are all available commands:**\n\n${commandList}`)
            .setColor(0x5865F2)

            // Server icon
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

            // Footer (cleaner spacing)
            .setFooter({
                text: `Requested by ${interaction.user.tag} • ${formattedTime}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};