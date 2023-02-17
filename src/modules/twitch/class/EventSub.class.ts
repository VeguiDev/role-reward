import WebSocket from 'ws';
import ClassEvents from '../../../class/ClassEvent.class';
import TwitchModule from '../Twitch.class';
import { Reward } from './Reward.class';

export default class TwitchEventSub extends ClassEvents<string> {
    client?: WebSocket;
    old_client?: WebSocket;

    session_id:string|null = null;

    is_reconnecting:boolean  = false;  
    try_reconnect:boolean = false;
    is_disconnecting:boolean = false;

    recieved_pong:boolean = true;

    private twitchModule: TwitchModule;

    constructor(twitchModule: TwitchModule) {
        super();
        this.twitchModule = twitchModule;


        setInterval(() => {
            if(this.is_reconnecting && !this.try_reconnect) {

                this.log("Trying to reconnect!");
                this.reconnect();

            }
        }, 1000)

        setInterval(() => {
            if(this.client && this.client.readyState == this.client.OPEN) {

                if(!this.recieved_pong) {

                    this.log("Connection closed!");
                    this.client.close();

                    this.is_reconnecting = true;

                } else {
                    this.recieved_pong = false;
                }

                this.client.ping();
            }
        }, 5000);
    }

    log(...msg:any) {
        this.twitchModule.log(...msg);
    }

    private async processMessage(data: any) {
        if (data.metadata.message_type == 'session_welcome') {
            this.session_id = data.payload.session.id;

            if (this.is_reconnecting && this.old_client) {
                this.is_reconnecting = false;

                this.old_client.close();

                this.log('Webhook reconnected!');
            } else {
                if (this.session_id && await this.twitchModule.subscribeEvent(this.session_id)) {
                    this.emit('subscribed', this);
                    this.log('Connected to EventSub event');
                } else {
                    this.log("Can't connect to EventSub event");
                }
            }
        } else if (data.metadata.message_type == 'session_reconnect') {
            this.is_reconnecting = true;
            await this.reconnect(data.payload.session.reconnect_url);
        } else if (data.metadata.message_type == 'notification') {
            return this.processNotification(data.payload);
        } else if (data.metadata.message_type == 'session_keepalive') {
            return;
        }
    }

    private async processNotification(data:any) {
        
        if(data.subscription.type == "channel.channel_points_custom_reward_redemption.add") {

            const reward = new Reward({
                user_id: data.event.user_id,
                name: data.event.user_login
            }, data.event.reward.id, data.event.id, data.event.broadcaster_user_id);

            reward.apply(data.event.user_input);

        }

    }

    async reconnect(reconnect_url?:string) {
        if(this.is_reconnecting) {
            this.try_reconnect = true;
        }

        this.old_client = this.client;
        this.connect(reconnect_url);
    }

    async connect(url?:string) {
        this.is_disconnecting = false;

        this.client = new WebSocket(url || 'wss://eventsub-beta.wss.twitch.tv/ws');

        this.client.on('open', () => {
            this.log('Connect to websocket');
            
            if(this.is_reconnecting) {
                this.is_reconnecting = false;
                this.try_reconnect = false;
            }

            if(this.old_client && this.old_client.readyState == this.old_client.OPEN) {
                this.old_client.close();
            }

        });

        this.client.on('pong', () => {
            this.recieved_pong = true;
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
            if(this.is_reconnecting && this.try_reconnect) {
                this.try_reconnect = false;
            }
        });


        this.client.on('close', (code, reason) => {
            if(!this.is_reconnecting && !this.is_disconnecting) {
                this.reconnect();
            }
        })
    }

    async disconnect() {

        this.is_disconnecting = true;
        this.session_id = null;
        this.is_reconnecting = false;
        this.try_reconnect = false;

        if(this.client && this.client.readyState == 1) {

            this.client.close();

        }

        if(this.old_client && this.old_client.readyState == 1) {

            this.old_client.close();

        }

    }

}
