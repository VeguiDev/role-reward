import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export default class CommandDiscord {

    data:any;
    execute:(interaction:ChatInputCommandInteraction) => any

    constructor(partial:CommandDiscord) {
        this.data = partial.data;
        this.execute = partial.execute;
    }

}