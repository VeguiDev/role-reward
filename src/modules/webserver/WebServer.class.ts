import express from 'express';
import morgan from 'morgan';
import DiscordModule from '../discord/discord.class';
import TwitchModule from '../twitch/Twitch.class';
import { AuthController } from './routes/auth.routes';
import { ChannelController } from './routes/channel.routes';
import { DiscordController } from './routes/discord.routes';
import { HomeController } from './routes/home.routes';

export class WebServer {

    app:express.Application = express();

    started:boolean = false;

    constructor() {

        this.settings();
        this.middlewares();
        this.routes();

    }

    private settings() {

        this.app.set("port", process.env.PORT || 4000);

    }

    private middlewares() {

        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(morgan('dev'));

    }

    private routes() {

        this.app.use(HomeController);
        this.app.use("/auth", AuthController);
        this.app.use("/channel", ChannelController);
        this.app.use("/discord", DiscordController);

    }

    status() {

        let discord = DiscordModule.getInstance();

        let twitch = TwitchModule.getInstance();

        return {
            webserver: {

                discord: {
                    display: "Discord Endpoint",
                    status: discord.status().discord.status
                },
                twitch: {
                    display: "Twitch Endpoint",
                    status: twitch.status().twitch.status
                },
                actions: {
                    display: "Actions Endpoint",
                    status: this.started && twitch.status().twitch.status && discord.status().discord.status
                },
                auth: {
                    display: "Authentication Endpoint",
                    status: this.started
                }

            }
        }

    }

    listen() {

        if(this.started) return;
        this.started = true;

        this.app.listen(this.app.get("port"), () => {
            console.log("Server listening on port "+this.app.get("port"));
        });

    }

}