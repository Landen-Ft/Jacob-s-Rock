// commands/quote.js
require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Submit a quote to the quotes channel')
        .addStringOption(option =>
            option.setName('quote')
                .setDescription('The text of the quote')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The person who said the quote')
                .setRequired(true)),
    async execute(interaction) {
        const quoteChannel = interaction.guild.channels.cache.get(process.env.QUOTES_CHANNEL_ID);
        if (!quoteChannel) {
            return interaction.reply({ content: 'Cannot find the quotes channel! Check QUOTES_CHANNEL_ID in .env', ephemeral: true });
        }

        const quoteText = interaction.options.getString('quote');
        const authorUser = interaction.options.getUser('user');

        // Build the embed
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('New Quote!')
            .setDescription(`"${quoteText}"`)
            .setAuthor({ name: authorUser.username, iconURL: authorUser.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: `Submitted by ${interaction.user.tag}` })
            .setTimestamp();

        // Send to the quotes channel
        await quoteChannel.send({ embeds: [embed] });

        // Confirm to the user
        await interaction.reply({ content: 'Quote submitted successfully!', ephemeral: true });
    },
};