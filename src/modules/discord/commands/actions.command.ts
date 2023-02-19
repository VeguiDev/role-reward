import { EmbedBuilder, roleMention, SlashCommandBuilder } from 'discord.js';
import { ActionConfig } from '../../../class/Action.class';
import CommandDiscord from '../class/Command.class';
import prettyjson from 'prettyjson';

export default new CommandDiscord({
    data: new SlashCommandBuilder()
        .setName('actions')
        .setDescription('Actions commands'),
    execute: async (interaction) => {
        const actions = await ActionConfig.getInstance().actions;

        const embeds = [];

        for (const action of actions) {

            let fields = [];

            for(const reward of action.rewards) {
                fields.push(
                    {
                        name: 'Type',
                        value: reward.type
                    }
                );

                if(reward.type == "DISCORD_ROLE" && reward.roles) {
                    fields.push({
                        name: "Roles",
                        value: reward.roles.map(role => roleMention(role)).join(" ")
                    })
                }
            }

            const embed = new EmbedBuilder({
                title: action.on,
                fields: fields
            });

            embeds.push(embed);
        }

        interaction.reply({
            embeds
        });
    },
});
