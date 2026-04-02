// commands/clear.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a number of messages in this channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user has the Manage Messages permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        // Validate amount
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You can only delete between 1 and 100 messages at a time!', ephemeral: true });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);

            // Send temporary confirmation
            const reply = await interaction.reply({ content: `✅ Deleted ${deleted.size} messages!`, fetchReply: true });

            setTimeout(() => reply.delete().catch(() => {}), 3000);

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Unable to delete messages. Make sure I have the correct permissions.', ephemeral: true });
        }
    },
};