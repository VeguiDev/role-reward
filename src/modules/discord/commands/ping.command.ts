import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";
import CommandDiscord from "../class/Command.class";

export default new CommandDiscord({
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Send a ping message."),
    
    execute: async (interaction) => {
        await interaction.reply("pong");
    }
})