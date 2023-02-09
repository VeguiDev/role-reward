export type RedemptionStatus = ("CANCELED"|"FULFILLED"|"UNFULFILLED");

export interface RewardRedemption {
    broadcaster_id:string;
    broadcaster_login:string;
    broadcaster_name:string;
    id:string;
    user_login:string;
    user_id:string;
    user_name:string;
    user_input:string;
    status:RedemptionStatus;
    redeemed_at:string;
    reward:RewardI;
}

export interface RewardI {
    id:string;
    title:string;
    prompt:string;
    cost:number;
}