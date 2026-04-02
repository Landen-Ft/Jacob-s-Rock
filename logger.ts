import { Client, TextChannel, DMChannel, NonThreadGuildBasedChannel, EmbedBuilder, Events, AuditLogEvent } from 'discord.js';

export const Logger = (client: Client) => {
    if (!process.env.LOGGER_CHANNEL_ID) {
        console.log("[WARN] Log channel not set, logging will not happen");
        return;
    }
    const loggerChannelId = process.env.LOGGER_CHANNEL_ID;
    const loggedMessages = new Set(); // prevent duplicate message logs

    const log = async (embed: EmbedBuilder) => {
        const channel = client.channels.cache.get(loggerChannelId) as TextChannel | undefined;
        if (!channel) return console.warn('[Logger] Logger channel not found');
        await channel.send({ embeds: [embed] }).catch(console.error);
    };

    // -------------------------------
    // Message Deleted
    // -------------------------------
    client.on(Events.MessageDelete, async (message) => {
        if (message.partial || message.author?.bot || loggedMessages.has(message.id)) return;
        loggedMessages.add(message.id);
        if (!message.guild) return;

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Deleted')
            .setDescription(
                `\`\`\`${message.content || '[No text]'}\`\`\`\n` +
                `**Message Author:** <@${message.author.id}>\n` +
                `**Channel:** <#${message.channel.id}>\n` +
                `[Jump to context](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
            )
            .setColor(0xFAA61A)
            .setFooter({ text: `ID: ${message.id}` })
            .setTimestamp();

        log(embed);
    });

    // -------------------------------
    // Message Edited
    // -------------------------------
    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (oldMessage.partial || newMessage.partial || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setTitle('✏️ Message Edited')
            .setDescription(
                `**Before:**\n\`\`\`${oldMessage.content || '[No text]'}\`\`\`\n` +
                `**After:**\n\`\`\`${newMessage.content || '[No text]'}\`\`\`\n` +
                `**Message Author:** <@${oldMessage.author.id}>\n` +
                `**Channel:** <#${oldMessage.channel.id}>\n` +
                `[Jump to context](https://discord.com/channels/${oldMessage?.guild?.id}/${oldMessage.channel.id}/${oldMessage.id})`
            )
            .setColor(0xFAA61A)
            .setFooter({ text: `ID: ${oldMessage.id}` })
            .setTimestamp();

        log(embed);
    });

    // -------------------------------
    // Channel Updates
    // -------------------------------
    client.on(
        Events.ChannelUpdate,
        async (
            oldChannel: DMChannel | NonThreadGuildBasedChannel,
            newChannel: DMChannel | NonThreadGuildBasedChannel
        ) => {
            // We only care about guild channels here — ignore DMs
            if (!('guild' in oldChannel) || !('guild' in newChannel)) return;
            if (!oldChannel.guild || !newChannel.guild) return;

            const embed = new EmbedBuilder()
                .setTitle('🛠️ Channel Updated')
                .setDescription(
                    `\`\`\`${oldChannel.name} → ${newChannel.name}\`\`\`\n` +
                    `**Channel:** <#${newChannel.id}>\n` +
                    `[Jump to channel](https://discord.com/channels/${newChannel.guild.id}/${newChannel.id})`
                )
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${newChannel.id}` })
                .setTimestamp();

            log(embed);
        }
    );

    // -------------------------------
    // Member Updates (nickname, username, roles)
    // -------------------------------
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (oldMember.user.bot) return;

        // Nickname
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setTitle('📝 Nickname Changed')
                .setDescription(
                    `\`\`\`${oldMember.nickname || '[None]'} → ${newMember.nickname || '[None]'}\`\`\`\n` +
                    `**User:** <@${newMember.id}>`
                )
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${newMember.id}` })
                .setTimestamp();
            log(embed);
        }

        // Username
        if (oldMember.user.username !== newMember.user.username) {
            const embed = new EmbedBuilder()
                .setTitle('🆔 Username Changed')
                .setDescription(
                    `\`\`\`${oldMember.user.username} → ${newMember.user.username}\`\`\`\n` +
                    `**User:** <@${newMember.id}>`
                )
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${newMember.id}` })
                .setTimestamp();
            log(embed);
        }

        // Role changes
        const oldRoles = oldMember.roles.cache.map(r => r);
        const newRoles = newMember.roles.cache.map(r => r);
        const addedRoles = newRoles.filter(r => !oldRoles.includes(r));
        const removedRoles = oldRoles.filter(r => !newRoles.includes(r));

        if (addedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle('➕ Role Added')
                .setDescription(
                    `**User:** <@${newMember.id}>\n` +
                    `**Roles Added:** \`\`\`${addedRoles.map(r => r.name).join(', ')}\`\`\``
                )
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${newMember.id}` })
                .setTimestamp();
            log(embed);
        }

        if (removedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle('➖ Role Removed')
                .setDescription(
                    `**User:** <@${newMember.id}>\n` +
                    `**Roles Removed:** \`\`\`${removedRoles.map(r => r.name).join(', ')}\`\`\``
                )
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${newMember.id}` })
                .setTimestamp();
            log(embed);
        }
    });

    // -------------------------------
    // Member Bans
    // -------------------------------
    client.on(Events.GuildBanAdd, async (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('⛔ Member Banned')
            .setDescription(`**User:** <@${ban.user.id}>`)
            .setColor(0xFAA61A)
            .setFooter({ text: `ID: ${ban.user.id}` })
            .setTimestamp();
        log(embed);
    });

    client.on(Events.GuildBanRemove, async (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('✅ Member Unbanned')
            .setDescription(`**User:** <@${ban.user.id}>`)
            .setColor(0xFAA61A)
            .setFooter({ text: `ID: ${ban.user.id}` })
            .setTimestamp();
        log(embed);
    });

    // -------------------------------
    // Member Kicks
    // -------------------------------
    client.on(Events.GuildMemberRemove, async (member) => {
        if (member.user.bot) return;
        const audit = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
        const kickLog = audit?.entries.first();
        const executor = kickLog ? `<@${kickLog?.executor?.id}>` : 'Unknown';
        if (kickLog && kickLog.target !== null && kickLog.target.id === member.id) {
            const embed = new EmbedBuilder()
                .setTitle('👢 Member Kicked')
                .setDescription(`**User:** <@${member.id}>\n**By:** ${executor}`)
                .setColor(0xFAA61A)
                .setFooter({ text: `ID: ${member.id}` })
                .setTimestamp();
            log(embed);
        }
    });

    console.log('[Logger] Event logger loaded.');
};