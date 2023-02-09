import { client as WebSocketClient, Message } from 'websocket';
import { EventSubSubscribe } from '../../api/eventSub.service';
import ClassEvents from '../../class/ClassEvent.class';
import { Reward } from './class/Reward.class';

export type TwitchModuleEvents = ("subscribed"|"reward_redemption_add");

export default class TwitchModule extends ClassEvents<TwitchModuleEvents>  {
    private static instance: TwitchModule;

    client: WebSocketClient = new WebSocketClient();
    old_client: WebSocketClient = new WebSocketClient();

    session_id: string | null = null;

    is_reconnecting:boolean = false;
    reconnect_url:string = "";

    private async processNotification(data:any) {
        console.log(data);
        if(data.subscription.type == "channel.channel_points_custom_reward_redemption.add") {

            const reward = new Reward({
                user_id: data.event.user_id,
                name: data.event.user_login
            }, data.event.reward.id, data.event.id, data.event.broadcaster_id);

            reward.apply(data.event.user_input);

        }

    }

    private async reconnect(url:string) {
        this.is_reconnecting = true;
        await this.listen(url);
    }

    private async processMessage(message: Message) {

        if(message.type == "binary") return;

        let data = JSON.parse(message.utf8Data);

        if (data.metadata.message_type == 'session_welcome') {
            this.session_id = data.payload.session.id;
            
            if(this.is_reconnecting) {

                this.is_reconnecting = false;

                this.old_client.abort();

                console.log("[TWITCH]: Webhook reconnected!");

            } else {

                if(await this.subscribeEvent()) {
                    this.emit("subscribed", this);
                    console.log("[TWITCH]: Connected to EventSub event");
                } else {
                    console.log("[TWITCH]: Can't connect to EventSub event");
                }

            }

        } else if(data.metadata.message_type == "session_reconnect") {
            await this.reconnect(data.event.session.reconnect_url);
        } else if(data.metadata.message_type == 'notification') {
            return this.processNotification(data.payload);
        }

        console.log(data);
    }

    async subscribeEvent() {
        if(!this.session_id) return false;

        const {error, data} = await EventSubSubscribe("channel.channel_points_custom_reward_redemption.add", this.session_id);

        if(!error) {
            return true;
        }

        console.log(error);
        return false;

    }

    async listen(reconnect_url?:string) {
        if(reconnect_url) {
            this.old_client = this.client;
            this.client = new WebSocketClient();
        }

        this.client.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });

        this.client.on('connect', (connection) => {
            console.log('WebSocket Client Connected');
            connection.on('error', function (error) {
                console.log('Connection Error: ' + error.toString());
            });
            connection.on('close', function () {
                console.log('echo-protocol Connection Closed');
            });
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    try {
                        this.processMessage(message);
                    } catch (e) {
                        console.error(e);
                        console.log("Received: '" + message.utf8Data + "'");
                    }
                }
            });
        });

        this.client.connect(reconnect_url || 'wss://eventsub-beta.wss.twitch.tv/ws');
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TwitchModule();
        }

        return this.instance;
    }
}