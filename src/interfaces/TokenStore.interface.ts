import TwitchUserI from "./TwitchUser.interface";

export interface TokenStoreI {

    access_token:string;
    refresh_token:string;
    expires_at:number;

    user:TwitchUserI;
    
}