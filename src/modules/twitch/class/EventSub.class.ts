import chalk from 'chalk';
import WebSocket from 'ws';
import ClassEvents from '../../../class/ClassEvent.class';
import TwitchModule from '../Twitch.class';
import { Reward } from './Reward.class';

export default class TwitchEventSub extends ClassEvents<string> {
    client?: WebSocket;
    old_client?: WebSocket;

    session_id:string|null = null;

    is_reconnecting:boolean  = false;  

    connection_lost:boolean = false;
    connection_lost_timer:NodeJS.Timeout|null = null;
    connection_lost_tries:number = 0;
    
    is_disconnecting = false;
    connecting:boolean = false;

    private twitchModule: TwitchModule;

    log(...msg:any) {
        this.twitchModule.log(...msg);
    }

    constructor(twitchModule: TwitchModule) {
        super();
        this.twitchModule = twitchModule;

        this.connection_lost_timer = setInterval(() => {
            if(this.connection_lost && !this.connecting && !this.is_disconnecting) {
                this.connection_lost_tries++;

                this.log("Try "+this.connection_lost_tries+" to reconnect websocket!");
                this.reconnect();

            }
        }, 2000);

    }

    private async processMessage(data: any) {
        if (data.metadata.message_type == 'session_welcome') {
            this.session_id = data.payload.session.id;

            if (this.is_reconnecting && this.old_client) {

                this.is_reconnecting = false;

                this.old_client.removeAllListeners();
                this.old_client.close();

                this.log('Websocket reconnected!');
            } else {

                if(this.connection_lost) {
                    this.connection_lost = false;
                    this.connection_lost_tries = 0;
                    this.log("Connection resume!");
                }

                if (this.session_id && await this.twitchModule.subscribeEvent(this.session_id)) {
                    this.emit('subscribed', this);
                    this.log('Successfully subscribed to event!');
                } else {
                    this.log("Can't subscribe to event");
                }
            }
        } else if (data.metadata.message_type == 'session_reconnect') {
            this.is_reconnecting = true;
            await this.reconnect(data.payload.session.reconnect_url);
        } else if (data.metadata.message_type == 'notification') {
            return this.processNotification(data.payload);
        } else if(data.metadata.message_type == 'revocation') {

            this.log(chalk.redBright("Session revocated, disconnecting."));
            this.disconnect();
            
        } else if (data.metadata.message_type == 'session_keepalive') {
            return;
        }
    }

    private async processNotification(data:any) {
        
        if(data.subscription.type == "channel.channel_points_custom_reward_redemption.add") {

            const reward = new Reward({
                user_id: data.event.user_id,
                name: data.event.user_login,
            }, data.event.reward.id, data.event.id, data.event.broadcaster_user_id);
            console.log(reward);
            reward.apply(data.event.user_input);

        }

    }

    async reconnect(reconnect_url?:string) {
        
        if(reconnect_url) {

            this.old_client = this.client;

        }

        this.connect(reconnect_url);
    }

    async unsubscribe() {
        if(!this.session_id) return false;

        this.log("Unsubscribed from event sub.");

        if(await this.twitchModule.unSubscribeEvent(this.session_id)) {
            this.log("Successfully unsubscripbed from event sub.");
        } else {
            this.log("Can't unsubscripbe from event sub.");
        }


    }

    pingTimeout:NodeJS.Timeout|null = null;

    async connect(url?:string) {
        this.connecting = true;

        this.client = new WebSocket(url || 'wss://eventsub-beta.wss.twitch.tv/ws');

        this.client.on('open', () => {

            this.connecting = false;
                
            this.log('Connected to twitch websocket');

            if(this.old_client && this.old_client.readyState != this.old_client.CLOSED) {
                this.old_client.removeAllListeners();
                this.old_client.close();
            }

        });

        this.client.on('ping', () => {
            if(this.pingTimeout) {
                clearTimeout(this.pingTimeout);
            }

            this.pingTimeout = setTimeout(() => {
                this.connection_lost = true;
                this.log("Websocket Connection Lost!");
                this.client?.close();
            }, 7000);
        });

        this.client.on('message', (data) => {
            try {
                const json = JSON.parse(data.toString());

                this.processMessage(json);
            } catch {
                console.log(data);
            }
        });

        this.client.on('error', (error) => {
            console.log(error);
            this.connecting = false;
        });


        this.client.on('close', (code, reason) => {
            this.connecting = false;
            if(!this.is_reconnecting && !this.is_disconnecting && !this.connection_lost) {
                this.unsubscribe();
                this.reconnect();
            }
        })
    }

    async disconnect() {

        this.is_disconnecting = true;
        this.session_id = null;
        this.is_reconnecting = false;

        if(this.pingTimeout) {
            clearTimeout(this.pingTimeout);
        }

        if(this.client && this.client.readyState == 1) {

            this.client.close();

        }

        if(this.old_client && this.old_client.readyState == 1) {

            this.old_client.close();

        }

    }

}
