import { ConfigFile } from "./ConfigFile.class";
import path from 'path';
import { DiscordConfigFile } from "../interfaces/DisconfigFile.interface";

export default class DiscordConfig extends ConfigFile<DiscordConfigFile> {

    private static instance:DiscordConfig;

    constructor() {

        super(path.join(process.cwd(), 'config', 'discord.yml'), {
            notification_channel_id:null
        })

    }

    get notificationChannel() {
        return this.data.notification_channel_id;
    }

    set notificationChannel(value:string|null) {
        this.setData({
            notification_channel_id: value
        });
    }


    static getInstance() {

        if(!this.instance) {

            this.instance = new DiscordConfig();

        }

        return this.instance;

    }

}