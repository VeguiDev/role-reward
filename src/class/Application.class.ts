import chalk from 'chalk';
import CLIModule from '../modules/cli/cli.class';
import DiscordModule from '../modules/discord/discord.class';
import TwitchModule from '../modules/twitch/Twitch.class';
import { WebServer } from '../modules/webserver/WebServer.class';
import { ActionConfig } from './Action.class';
import AuthStore from './AuthStore.class';
import ClassEvents from './ClassEvent.class';

export default class Application extends ClassEvents<string> {
    private static instance: Application;

    authStore: AuthStore = AuthStore.getInstance();
    webserver: WebServer = new WebServer();
    discordModule: DiscordModule = DiscordModule.getInstance();
    twitchModule: TwitchModule = TwitchModule.getInstance();
    cliModule: CLIModule = CLIModule.getInstance();

    disconnected: boolean = false;

    constructor() {
        super();
    }

    status() {
        return {
            modules: {
                twitch: this.twitchModule.status(),
                discord: this.discordModule.status(),
                webserver: this.webserver.status(),
            },
        };
    }

    private async setupDiscord() {
        if (
            process.env.DISCORD_BOT_TOKEN &&
            process.env.DISCORD_CLIENT_ID &&
            process.env.DISCORD_GUILD_ID
        ) {
            await this.discordModule.start();
        }

        return true;
    }

    private async setupTwitch() {
        const cred = await this.authStore.getCredentials();

        if (cred) {
            await this.twitchModule.start();
        }

        return true;
    }

    log(...msg: any) {
        console.log(
            `${chalk.yellow('[')}${chalk.yellowBright('CORE')}${chalk.yellow(
                ']'
            )}`,
            ...msg
        );
    }

    async saveAll() {
        this.log('Authentication data saved!');
        this.authStore.save();
        this.log('Actions config saved!');
        ActionConfig.getInstance().save();
    }

    async start() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET)
            throw new Error(
                'You need create a .env file with CLIENT_ID and CLIENT_SECRET of TWITCH APP to use this service.'
            );

        await this.setupDiscord();

        await this.setupTwitch();

        if (!this.disconnected) {
            await this.webserver.listen();

            this.authStore.on('updated', () => {
                this.emit('reload');
            });

            await this.cliModule.start();
        }

        this.disconnected = false;

        return true;
    }

    async stop() {
        if (this.disconnected) return;
        this.disconnected = true;
        await this.twitchModule.disconnect();
        await this.discordModule.close();
        return true;
    }

    async reconnect() {
        if (!this.disconnected) {
            await this.stop();
        }
        await this.start();
        this.log(chalk.greenBright('Successfully reconnected!'));
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Application();
        }

        return this.instance;
    }
}
