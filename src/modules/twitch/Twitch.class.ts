import chalk from 'chalk';
import { client as WebSocketClient, Message } from 'websocket';
import { EventSubSubscribe } from '../../api/eventSub.service';
import { GetChannelRewardRedemption } from '../../api/users.service';
import { ActionConfig } from '../../class/Action.class';
import AuthStore from '../../class/AuthStore.class';
import ClassEvents from '../../class/ClassEvent.class';
import { RewardRedemption } from '../../interfaces/TwtichRedemption.interface';
import { Reward } from './class/Reward.class';

export type TwitchModuleEvents = ("subscribed"|"reward_redemption_add");

export default class TwitchModule extends ClassEvents<TwitchModuleEvents>  {
    private static instance: TwitchModule;

    client: WebSocketClient = new WebSocketClient();
    old_client: WebSocketClient = new WebSocketClient();

    session_id: string | null = null;

    is_reconnecting:boolean = false;
    reconnect_url:string = "";

    started:boolean = false;

    private async processNotification(data:any) {
        
        if(data.subscription.type == "channel.channel_points_custom_reward_redemption.add") {

            const reward = new Reward({
                user_id: data.event.user_id,
                name: data.event.user_login
            }, data.event.reward.id, data.event.id, data.event.broadcaster_user_id);

            reward.apply(data.event.user_input);

        }

    }

    private async reconnect(url:string) {
        this.log(chalk.yellow("Reconnecting..."));
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

                this.log("Webhook reconnected!");

            } else {

                if(await this.subscribeEvent()) {
                    this.emit("subscribed", this);
                    this.log("Connected to EventSub event");
                } else {
                    this.log("Can't connect to EventSub event");
                }

            }

        } else if(data.metadata.message_type == "session_reconnect") {
            await this.reconnect(data.payload.session.reconnect_url);
        } else if(data.metadata.message_type == 'notification') {
            return this.processNotification(data.payload);
        } else if(data.metadata.message_type == "session_keepalive") {
            return;
        }

        // console.log(data);
    }

    async subscribeEvent() {
        if(!this.session_id) return false;

        const {error, data} = await EventSubSubscribe("channel.channel_points_custom_reward_redemption.add", this.session_id);

        if(!error) {
            return true;
        }
        console.error(error);
        return false;

    }

    async listen(reconnect_url?:string) {
        console.log("Con");
        if(reconnect_url) {
            this.old_client = this.client;
            this.client = new WebSocketClient();
        }

        this.client.on('connectFailed', (error) => {
            this.log(chalk.redBright('Connect Error: ' + error.toString()));
        });

        this.client.on('connect', (connection) => {
            this.log('WebSocket Client Connected');
            connection.on('error', function (error) {
                console.log(chalk.redBright('Connection Error: ' + error.toString()));
            });
            connection.on('close', (code, desc) => {
                console.log(code, desc);
                this.log('Connection closed reconnecting!');;
                if(!this.is_reconnecting) {
                    this.listen();
                }
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
        return true;
    }

    private async checkUnFinished() {
        const actions = new ActionConfig().actions;

        const credentials = await AuthStore.getInstance().getCredentials();

        if(!credentials) return;
        
        actions.forEach(async (action) => {
            
            const {error, data, res} = await GetChannelRewardRedemption(credentials.user.user_id, action.on);
            
            if(error) return this.log(chalk.yellow("We cannot obtain all redemptions that have not been applied."));
            
            const redemptions:RewardRedemption[] = data.data;
            
            this.log(chalk.blueBright("Found "+redemptions.length+" unredeemed rewards."))

            redemptions.forEach(async (redemption) => {

                const reward = new Reward({
                    user_id: redemption.user_id,
                    name: redemption.user_login
                }, redemption.reward.id, redemption.id, redemption.broadcaster_id);

                await reward.apply(redemption.user_input);

            })

        })

    }

    status() {
        return {
            twitch: {
                display: "Twitch Module",
                status: this.started
            }
        };
    }

    async start() {

        if(this.started) return;
        this.started = true;
        const cred = await AuthStore.getInstance().getCredentials();

        if(!cred) {
            return this.log(chalk.redBright("Can't use Twitch module if you not logged in!"));
        }
        
        AuthStore.getInstance().on("logout", () => {
            this.log(chalk.yellow("Logout event detected, disconnecting!"));
            this.disconnect();
        });

        this.listen();
        this.checkUnFinished();
    }

    log(...msg:any) {
        console.log(chalk.magenta("["+chalk.magentaBright("TWITCH")+"]"), ...msg);
    }

    async disconnect() {
        if(!this.started) return false;

        this.log("Disconnecting from event sub!");
        this.client.abort();
        this.client = new WebSocketClient();
        this.old_client = new WebSocketClient();
        this.session_id = null;
        this.is_reconnecting = false;
        this.started = false;
        return true;

    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TwitchModule();
        }

        return this.instance;
    }
}
