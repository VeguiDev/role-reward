import chalk from 'chalk';
import { CronJob } from 'cron';
import { EventSubSubscribe } from '../../api/eventSub.service';
import { GetChannelRewardRedemption } from '../../api/users.service';
import { ActionConfig } from '../../class/Action.class';
import AuthStore from '../../class/AuthStore.class';
import ClassEvents from '../../class/ClassEvent.class';
import { RewardRedemption } from '../../interfaces/TwtichRedemption.interface';
import TwitchEventSub from './class/EventSub.class';
import { Reward } from './class/Reward.class';

export type TwitchModuleEvents = ("subscribed"|"reward_redemption_add");

export default class TwitchModule extends ClassEvents<TwitchModuleEvents>  {
    private static instance: TwitchModule;

    eventsub:TwitchEventSub = new TwitchEventSub(this);

    started:boolean = false;

    job:CronJob = new CronJob(
        "* */30 * * * *", function() {
            const twitchMod = TwitchModule.getInstance();

            if(twitchMod && twitchMod.started) {

                twitchMod.checkRedemptionNotFinished();

            }
        })

    async subscribeEvent(session_id:string) {
        const {error, data} = await EventSubSubscribe("channel.channel_points_custom_reward_redemption.add", session_id);

        if(!error) {
            return true;
        }
        console.error(error);
        return false;

    }

    private async checkRedemptionNotFinished() {
        const actions = new ActionConfig().actions;

        const credentials = await AuthStore.getInstance().getCredentials();

        if(!credentials) return;
        
        actions.forEach(async (action) => {

            console.log(action);

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

    private startCronJobs() {

        this.log("Starting cron jobs.");
        this.job.start();

    }
    
    private stopCronJobs() {

        this.log("Stopping cron jobs.");
        this.job.stop();

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

        AuthStore.getInstance().on("login", () => {
            this.log(chalk.yellow("Logout event detected, connecting!"));
            this.eventsub.connect();
            
        });

        this.eventsub.connect();
        this.checkRedemptionNotFinished();
        this.startCronJobs();
    }

    log(...msg:any) {
        console.log(chalk.magenta("["+chalk.magentaBright("TWITCH")+"]"), ...msg);
    }

    async disconnect() {
        if(!this.started) return false;
        this.started = false;
        this.log("Disconnecting from event sub!");
        this.eventsub.disconnect();
        this.stopCronJobs();
        return true;

    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TwitchModule();
        }

        return this.instance;
    }
}
