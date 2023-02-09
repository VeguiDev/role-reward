import { ModulesConfig } from "./lib/modules.lib";
import { WebServer } from "./modules/webserver/WebServer.class";
import dotenv from 'dotenv';
import DiscordModule from "./modules/discord/discord.class";
import ModulesConfigC from "./class/ModulesConfig.class";
import TwitchModule from "./modules/twitch/Twitch.class";

dotenv.config();

if(ModulesConfig.webserver.enabled) {

    const webserver = new WebServer();

    webserver.listen();

}

if(ModulesConfig.discord.enabled) {
    const discordModule = DiscordModule.getInstance();
    
    discordModule.start();
}

if(ModulesConfig.twitch.enabled) {

    const twitchModule = TwitchModule.getInstance();

    twitchModule.listen();

}