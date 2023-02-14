import axios from "axios";
import { SetChannelRewardRedemptionStatus } from "../../../api/users.service";
import { Action, ActionConfig, ActionReward, ActionRewardDiscordI } from "../../../class/Action.class";
import TwitchUserI from "../../../interfaces/TwitchUser.interface";
import DiscordModule from '../../discord/discord.class';
import {replaceData} from '../../../api/lib/RequestDataReplacer.lib';

const actionsConfig = new ActionConfig();

export class Reward {

    twitch_data:TwitchUserI;
    reward_id:string;

    redemption_id:string;
    broadcaster_id:number;

    constructor(user:TwitchUserI, reward_id:string, redemption_id:string, broadcaster_id:number) {
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
        // console.log(error);
        return !error;

    }

    private async cancel() {
        const {error} = await SetChannelRewardRedemptionStatus(this.broadcaster_id, this.reward_id, this.redemption_id, "CANCELED");
        // console.log(error);
        return !error; 
    }

    private async applyDiscord(action:ActionReward, usertag:string) {

        const roles = action.roles;

        if(!roles) return;

        const discordModule = DiscordModule.getInstance();
        
        const member = await discordModule.getMemberByTag(usertag);

        if(!member) {
            this.cancel();
            return console.log(usertag, "Not found in the guild!")
        }

        if(member.roles.cache.hasAll(...roles)) {
            await this.cancel();
            console.log("The role cannot be applied to the user ("+this.twitch_data.name+") because they already have it.")
            return false;
        }

        await member.roles.add(roles);

        console.log("[REWARD]: Applying all roles for '"+this.twitch_data.name+" ("+this.twitch_data.user_id+")' in twitch");

        return await this.completed();

    }

    private async makeFetch(reward:ActionReward, userinput:string) {
        console.log("MAKING FETCH");
        let config = reward.config;

        if(!config) return;

        config = await replaceData("BROADCASTER_ID", this.broadcaster_id, config);
        config = await replaceData("REDEMPTION_ID", this.redemption_id, config);
        config = await replaceData("REWARD_ID", this.reward_id, config);
        config = await replaceData("USER_DATA", JSON.stringify(this.twitch_data), config);
        config = await replaceData("USER_INPUT", userinput, config);

        try {

            const {status, data} = await axios({
                ...config
            });

            this.completed();

        } catch(e) {
            console.error(e);
            this.cancel();
        }
    }

    async apply(usertag:string) {
        
        let action = actionsConfig.find(this.reward_id);
        
        if(!this.isRegistered() || !action) return;

        action.rewards.forEach(reward => {
            switch(reward.type) {

                case "DISCORD_ROLE":
                    this.applyDiscord(reward, usertag);
                    break;
                case "FETCH":
                    this.makeFetch(reward, usertag);
                    break;

            }
        });

    }

}