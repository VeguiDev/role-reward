import axios from "axios";
import TwitchUserI, { CannonTwitchUserI } from "../interfaces/TwitchUser.interface";
import { RedemptionStatus, RewardI, RewardRedemption } from "../interfaces/TwtichRedemption.interface";
import { HelixApiClient as apiClient, HelixApiClient } from "./helixApiClient";
import { ResponseWrapper } from "./lib/ResponseWreapper.lib";

export async function GetChannelRewards(id:number) {
    
    return await ResponseWrapper(apiClient({
        url: "channel_points/custom_rewards",
        method: "GET",
        params: {
            broadcaster_id: id
        }
    }))

}

export async function GetChannelReward(user_id:number, reward_id:string) {
    
    return await ResponseWrapper(apiClient({
        url: "channel_points/custom_rewards",
        method: "GET",
        params: {
            broadcaster_id: user_id,
            id: reward_id
        }
    }))

}

export async function GetChannelRewardRedemption(broadcaster_id:number, reward_id:string, status:RedemptionStatus = "UNFULFILLED", redemption_id?:string) {
    
    return await ResponseWrapper<{
        data: RewardRedemption[]
    }>(apiClient({
        url: "channel_points/custom_rewards/redemptions",
        method: "GET",
        params: {
            broadcaster_id: broadcaster_id,
            reward_id,
            status,
            id: redemption_id
        }
    }))

}

export async function SetChannelRewardRedemptionStatus(broadcaster_id:number, reward_id:string, redemption_id:string, status:RedemptionStatus) {
    
    return await ResponseWrapper<{
        data: RewardRedemption[]
    }>(apiClient({
        url: "channel_points/custom_rewards/redemptions",
        method: "PATCH",
        params: {
            broadcaster_id: broadcaster_id,
            reward_id,
            id: redemption_id
        },
        data: {
            status
        }
    }))

}

export async function CreateChannelReward(broadcaster_id:number, reward:Partial<Omit<RewardI, "is_user_input_required">>) {
    
    return await ResponseWrapper<{
        data: RewardRedemption[]
    }>(apiClient({
        url: "channel_points/custom_rewards",
        method: "POST",
        params: {
            broadcaster_id: broadcaster_id
        },
        data: {
            is_user_input_required: true,
            ...reward
        }
    }))

}

export async function UpdateChannelReward(broadcaster_id:number, reward_id:string, reward:Partial<RewardI>) {
    
    return await ResponseWrapper<{
        data: RewardRedemption[]
    }>(apiClient({
        url: "channel_points/custom_rewards",
        method: "PATCH",
        params: {
            broadcaster_id: broadcaster_id,
            id: reward_id
        },
        data: {
            ...reward
        }
    }))

}

export async function DeleteChannelReward(broadcaster_id:number, reward_id:string) {
    
    return await ResponseWrapper<{
        data: RewardRedemption[]
    }>(apiClient({
        url: "channel_points/custom_rewards",
        method: "DELETE",
        params: {
            broadcaster_id: broadcaster_id,
            id: reward_id
        }
    }))

}

export async function GetTwitchUser(user_id:number) {
    
    return await ResponseWrapper<{
        data: CannonTwitchUserI[]
    }>(apiClient({
        url: "users",
        method: "GET",
        params: {
            id: user_id
        }
    }))

}