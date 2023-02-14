import DiscordModule from "../modules/discord/discord.class";
import TwitchModule from "../modules/twitch/Twitch.class";
import { WebServer } from "../modules/webserver/WebServer.class";
import AuthStore from "./AuthStore.class";
import ClassEvents from "./ClassEvent.class";

export default class Application extends ClassEvents<string> {

    private static instance:Application;

    authStore:AuthStore = AuthStore.getInstance();
    webserver:WebServer = new WebServer();
    discordModule:DiscordModule = DiscordModule.getInstance();
    twitchModule:TwitchModule = TwitchModule.getInstance();

    constructor() {
        super();
        
        this.on("reload", () => {
            this.setupTwitch();
        });
    
    }

    status() {

        return {
            modules: {
                twitch: this.twitchModule.status(),
                discord: this.discordModule.status(),
                webserver: this.webserver.status()
            }
        }

    }

    private async setupDiscord() {

        if(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CLIENT_ID && process.env.DISCORD_GUILD_ID) {

            this.discordModule.start();

        }

    }

    private async setupTwitch() {

        const cred = await this.authStore.getCredentials();

        if(cred) {

            this.twitchModule.start();

        }

    }

    async start() {

        if(!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) throw new Error("You need create a .env file with CLIENT_ID and CLIENT_SECRET of TWITCH APP to use this service.");

        this.webserver.listen();
        
        this.setupDiscord();

        this.setupTwitch();

        this.authStore.on("updated", () => {
            this.emit("reload");
        });

    }

    static getInstance() {

        if(!this.instance) {
            this.instance = new Application();
        }

        return this.instance;

    }

}