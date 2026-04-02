// commands/clear.js
import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages in this channel')
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Number of messages to delete')
            .setRequired(true))

export const execute = async (interaction: ChatInputCommandInteraction) => {
    // Check if the user has the Manage Messages permission
    if (!interaction || !interaction.member || !interaction.channel) return;

    if (!(interaction.member.permissions as Readonly<PermissionsBitField>).has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount') as number;

    // Validate amount
    if (amount < 1 || amount > 100) {
        return interaction.reply({ content: 'You can only delete between 1 and 100 messages at a time!', ephemeral: true });
    }

    try {
        const deleted = await (interaction.channel as TextChannel).bulkDelete(amount, true);

        // Send temporary confirmation
        await interaction.reply({ content: `✅ Deleted ${deleted.size} messages!`, fetchReply: true });

    } catch (error) {
        console.error(error);
        interaction.reply({ content: '❌ Unable to delete messages. Make sure I have the correct permissions.', ephemeral: true });
    }
}