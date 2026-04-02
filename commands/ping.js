const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows bot latency'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            );

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};