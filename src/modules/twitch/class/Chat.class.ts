import {Client} from 'tmi.js';
import AuthStore from '../../../class/AuthStore.class';
import TwitchModule from '../Twitch.class';

export default class TwitchChat {

    client?:Client;

    log(...text:any) {
        TwitchModule.getInstance().log(...text);
    }

    async wisper(user_login:string, message:string) {
        try {

            if(!this.client) return;

            console.log(await this.client.whisper(user_login, message));

        } catch {
            console.log("ERROR");
        }
    }

    async connect() {

        const cred = await AuthStore.getInstance().getCredentials();

        if(!cred) return;

        this.client = new Client({
            identity: {
                username: "RoleReward",
                password: "oauth:"+cred.access_token
            },
            channels: ["santyhauser"]
        })

        await this.client.connect();

        this.client.on("message", (channel, state, message, self) => {
            if(self) return;

            if(message.startsWith("!ping")) {
                this.client?.say(channel, "pong");
            }
        })

        this.client.on("connected", () => {
            this.log("Conencted to IRC!");
        });

    }

}