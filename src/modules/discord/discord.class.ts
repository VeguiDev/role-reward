import { Client, GatewayIntentBits } from "discord.js";

export default class DiscordModule {

    private static instance:DiscordModule;

    client_id?:string = process.env.DISCORD_CLIENT_ID;
    guild_id?:string = process.env.DISCORD_GUILD_ID;

    private bot_token?:string = process.env.DISCORD_BOT_TOKEN;
    private initialized:boolean = false;

    client:Client;

    constructor() {

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.events();

    }

    isInitialized() {
        return this.initialized;
    }

    async close() {
        this.initialized = false;
        return this.client.destroy();
    }

    private events() {
        this.client.on("ready", (client) => {
            
            let guild = client.guilds.cache.find(guild => this.guild_id == guild.id);

            if(!guild) {
                this.close();
                return console.log("[DISCORD]: You must specify a guild in the configuration. Read the documentation.")
            }

            console.log("[DISCORD]: Successfully logged in as "+client.user.username+` (${client.user.id}) working for the guild ${guild.name} (${guild.id})`);

        });

    }

    async start() {

        if(!this.bot_token) return console.log("You have not configured the discord module, it has skipped its start. Read the documentation.");

        await this.client.login(this.bot_token);
        this.initialized = true;
    }

    async getGuild() {

        let guild = this.client.guilds.cache.find(guild => this.guild_id == guild.id);

        if(!guild) return null;

        return guild;

    }

    async getRoleS() {
        let guild = await this.getGuild();

        if(!guild) throw "cant_get::guild";

        return guild.roles.cache.filter(role => !role.managed);

    }

    async getRole(id:string) {
        
        let guild = await this.getGuild();

        if(!guild) throw "cant_get::guild";

        return await guild.roles.cache.find(role => role.id == String(id));

    }

    async getMemberByTag(tag:string) {

        const guild = await this.getGuild();

        if(!guild) return null;

        let tagParts = tag.split("#");

        let members = await guild.members.fetch({
            query: tagParts[0]
        });

        return members.find(member => member.user.discriminator == tagParts[1]);

    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new DiscordModule();
        }

        return this.instance;
    }

}