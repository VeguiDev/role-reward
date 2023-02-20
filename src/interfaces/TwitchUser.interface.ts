export default interface TwitchUserI {

    name:string;
    user_id:number;

}

export interface CannonTwitchUserI {
    name?:string;
    user_id?:number;
    id:number;
    login:string;
    display_name:string;
    type:("admin"|"global_mod"|"staff"|string);
    broadcaster_type:("affiliate"|"parther"|string);
    description:string;
    profile_image_url:string;
    offline_image_url:string;
    view_count:number;
    email:string;
    created_at:string;
}