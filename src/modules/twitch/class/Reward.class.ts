import { SetChannelRewardRedemptionStatus } from "../../../api/users.service";
import { ActionConfig } from "../../../class/Action.class";
import TwitchUserI from "../../../interfaces/TwitchUser.interface";
import DiscordModule from '../../discord/discord.class';

const actionsConfig = new ActionConfig();

export class Reward {

    twitch_data:TwitchUserI;
    reward_id:string;

    redemption_id:string;
    broadcaster_id:string;

    constructor(user:TwitchUserI, reward_id:string, redemption_id:string, broadcaster_id:string) {
        this.twitch_data = user;
        this.reward_id = reward_id;
        this.redemption_id = redemption_id;
        this.broadcaster_id = broadcaster_id;
    }

    isRegistered() {
        return !!actionsConfig.find(this.reward_id);
    }

    private async completed() {

        const {error} = await SetChannelRewardRedemptionStatus(this.broadcaster_id, this.reward_id, this.redemption_id, "FULFILLED");

        return !error;

    }

    private async cancel() {
        const {error} = await SetChannelRewardRedemptionStatus(this.broadcaster_id, this.reward_id, this.redemption_id, "CANCELED");

        return !error;
    }

    async apply(usertag:string) {
        
        let action = actionsConfig.find(this.reward_id);
        
        if(!this.isRegistered() || !action) return;

        const discordModule = DiscordModule.getInstance();

        const member = await discordModule.getMemberByTag(usertag);

        if(!member) return console.log(usertag, " Not found in the guild!");

        if(member.roles.cache.hasAll(...action.rewards)) {
            await this.cancel();
            console.log("The role cannot be applied to the user ("+this.twitch_data.name+") because they already have it.")
            return false;
        }

        await member.roles.add(action.rewards);

        console.log("[REWARD]: Applying all roles for '"+this.twitch_data.name+" ("+this.twitch_data.user_id+")' in twitch");

        return await this.completed();

    }

}