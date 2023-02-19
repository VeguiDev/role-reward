import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default class CommandDiscord {

    data:SlashCommandBuilder;
    execute:(interaction:ChatInputCommandInteraction) => any

    constructor(partial:CommandDiscord) {
        this.data = partial.data;
        this.execute = partial.execute;
    }

}