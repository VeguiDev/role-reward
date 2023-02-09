import axios from "axios";
import { RedemptionStatus, RewardRedemption } from "../interfaces/TwtichRedemption.interface";
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

export async function GetChannelRewardRedemption(broadcaster_id:string, reward_id:string, status:RedemptionStatus = "UNFULFILLED", redemption_id?:string) {
    
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

export async function SetChannelRewardRedemptionStatus(broadcaster_id:string, reward_id:string, redemption_id:string, status:RedemptionStatus) {
    
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