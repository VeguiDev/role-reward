import axios from "axios";
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