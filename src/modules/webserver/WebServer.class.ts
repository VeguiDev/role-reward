import express from 'express';
import morgan from 'morgan';
import { AuthController } from './routes/auth.routes';
import { ChannelController } from './routes/channel.routes';
import { HomeController } from './routes/home.routes';

export class WebServer {

    app:express.Application = express();

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

    }

    listen() {

        this.app.listen(this.app.get("port"), () => {
            console.log("Server listening on port "+this.app.get("port"));
        });

    }

}