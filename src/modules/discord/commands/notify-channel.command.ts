import { channelMention, EmbedBuilder } from '@discordjs/builders';
import { ChannelType, MessageMentions, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, TextChannel } from 'discord.js';
import DiscordConfig from '../../../class/DiscordConfig.class';
import CommandDiscord from '../class/Command.class';

const data = new SlashCommandBuilder()
    .setName('notifychannel')
    .setDescription('Manage notify channel.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription(
                'Makes the current channel as notification channel.'
            )
            .addChannelOption(option => {
                return option
                .setName("channel")
                .setDescription("Channel to make notification channel")
                .addChannelTypes(ChannelType.GuildText)
            })
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('view')
            .setDescription('Shows the current notification channel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export default new CommandDiscord({
    data: data,
    execute: (interaction) => {
        const discordConfig = DiscordConfig.getInstance();

        if (interaction.options.getSubcommand() == 'view') {
            const notifChannel = discordConfig.notificationChannel;
            
            if (notifChannel == "null" || !notifChannel) {
                const embed = new EmbedBuilder({
                    title: 'The notification channel was not configured.',
                });
                embed.setColor([52, 152, 219]);

                interaction.reply({
                    embeds: [embed],
                });

                return;
            }

            const channel = interaction.channel;

            if(!channel) {
                interaction.reply("Channel not found!");
                return;
            }

            const notifChannelID = discordConfig.notificationChannel;

            if (channel.id == notifChannelID) {
                const embed = new EmbedBuilder({
                    title: 'This is the notification channel!',
                }).setColor([52, 152, 219]);

                interaction.reply({
                    embeds: [embed],
                });

                return;
            } else {
                const notifChannel = interaction.guild?.channels.cache.find(
                    (channel) => channel.id == notifChannelID
                );

                if (!notifChannel) {
                    const embed = new EmbedBuilder({
                        title: 'The channel not exists or not is of this guild.',
                    }).setColor([231, 76, 60]);

                    interaction.reply({
                        embeds: [embed],
                    });

                    return;
                }

                const embed = new EmbedBuilder({
                    title:
                        'The notification channel is ' +
                        channelMention(notifChannel.id),
                }).setColor([52, 152, 219]);

                interaction.reply({
                    embeds: [embed],
                });

                return;
            }
        } else if (interaction.options.getSubcommand() == 'set') {
            const channel = !interaction.options.getChannel("channel") ? interaction.channel : interaction.options.getChannel("channel");

            if (!channel) {
                interaction.reply('No channel found!');
                return;
            }

            if(!(channel instanceof TextChannel)) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: "The channel must be an Text Channel!"
                        }).setColor([231, 76, 60])
                    ]
                })
                return;
            }

            if(discordConfig.notificationChannel == channel.id) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: channel.name+" already is the notification channel!"
                        }).setColor([231, 76, 60])
                    ]
                })
                return;
            }

            discordConfig.notificationChannel = channel.id;

            const embed = new EmbedBuilder({
                title:
                    'The notification channel set to ' +
                    channelMention(channel.id),
            }).setColor([52, 152, 219]);

            interaction.reply({
                embeds: [embed],
            });
            
            return;

        }

        interaction.reply('OK');
    },
});
