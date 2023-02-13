import { ModulesConfig } from './lib/modules.lib';
import { WebServer } from './modules/webserver/WebServer.class';
import dotenv from 'dotenv';
import DiscordModule from './modules/discord/discord.class';
import TwitchModule from './modules/twitch/Twitch.class';
import AuthStore from './class/AuthStore.class';

dotenv.config();

const authStore = AuthStore.getInstance();

if (ModulesConfig.webserver.enabled) {
    const webserver = new WebServer();

    webserver.listen();
}

if (ModulesConfig.discord.enabled) {
    const discordModule = DiscordModule.getInstance();

    discordModule.start();
}

if (authStore.haveCredentials()) {
    if (ModulesConfig.twitch.enabled) {
        const twitchModule = TwitchModule.getInstance();

        twitchModule.start();
    }
}

declare global {
    namespace Express {
        export interface Request {
            requestedReward?: any;
        }
    }
}
