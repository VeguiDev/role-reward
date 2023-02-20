import { EmbedBuilder, roleMention, userMention } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { GetTwitchUser } from "../../../api/users.service";
import { Action } from "../../../class/Action.class";
import TwitchUserI, { CannonTwitchUserI } from "../../../interfaces/TwitchUser.interface";
import { Reward } from "../../twitch/class/Reward.class";
import DiscordModule from "../discord.class";

export default class NotificationsManager {

    static async sendNotApplicableReward(reward:Reward, member:GuildMember, roles:string[]) {
        const dsModule = DiscordModule.getInstance();

        const {error, data} = await GetTwitchUser(reward.twitch_data.user_id);

        let user = reward.twitch_data;

        let author = {
            name: user.name+" ("+user.user_id+")",
            icon_url: undefined
        }

        if(!error) {

            let user = data.data[0];

            author = {
                name: user.display_name+" ("+user.id+")",
                icon_url: user.profile_image_url
            }
        }
        
        const embed = new EmbedBuilder({
            author,
            title: "Can't complete action `"+reward.reward_id+"`",
            description: "The action could not apply the rewards so the channel points will be returned.",
            fields: [
                {   
                    name: "Roles to apply",
                    value: roles.map(role => {
                        return roleMention(role)
                    }).join(" ")
                }
            ],
            footer: {
                text: member.user.tag,
                icon_url: member.displayAvatarURL()
            },
            timestamp: new Date().toISOString()
        }).setColor([231, 76, 60]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

    static async sendMemberNotFoundReward(reward:Reward, usertag:string) {
        const dsModule = DiscordModule.getInstance();

        const {error, data} = await GetTwitchUser(reward.twitch_data.user_id);

        let user = reward.twitch_data;

        let author = {
            name: user.name+" ("+user.user_id+")",
            icon_url: undefined
        }

        if(!error) {

            let user = data.data[0];

            author = {
                name: user.display_name+" ("+user.id+")",
                icon_url: user.profile_image_url
            }
        }
        
        const embed = new EmbedBuilder({
            author,
            title: "Can't complete action `"+reward.reward_id+"`",
            description: "The provided user tag "+usertag+" by user is not found!",
            timestamp: new Date().toISOString()
        }).setColor([231, 76, 60]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

    static async sendCancelReward(reward:Reward) {
        const dsModule = DiscordModule.getInstance();

        const {error, data} = await GetTwitchUser(reward.twitch_data.user_id);

        let user = reward.twitch_data;

        let author = {
            name: user.name+" ("+user.user_id+")",
            icon_url: undefined
        }

        if(!error) {

            let user = data.data[0];

            author = {
                name: user.display_name+" ("+user.id+")",
                icon_url: user.profile_image_url
            }
        }
        
        const embed = new EmbedBuilder({
            author,
            title: "Can't complete action `"+reward.reward_id+"`",
            description: "The redemption canceled!",
            timestamp: new Date().toISOString()
        }).setColor([231, 76, 60]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

    static async sendAppliedRoles(reward:Reward, member:GuildMember, roles:string[]) {
        const dsModule = DiscordModule.getInstance();

        const {error, data} = await GetTwitchUser(reward.twitch_data.user_id);

        let user = reward.twitch_data;

        let author = {
            name: user.name+" ("+user.user_id+")",
            icon_url: undefined
        }

        if(!error) {

            let user = data.data[0];

            author = {
                name: user.display_name+" ("+user.id+")",
                icon_url: user.profile_image_url
            }
        }
        
        const embed = new EmbedBuilder({
            author,
            title: "Action successfully applied `"+reward.reward_id+"`",
            description: "The action was applied and the redemption maked as finished!",
            fields: [
                {   
                    name: "Roles Applied",
                    value: roles.map(role => {
                        return roleMention(role)
                    }).join(" ")
                }
            ],
            footer: {
                text: member.user.tag,
                icon_url: member.displayAvatarURL()
            },
            timestamp: new Date().toISOString()
        }).setColor([46, 204, 113]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

    static async sendAppliedReward(reward:Reward) {
        const dsModule = DiscordModule.getInstance();

        const {error, data} = await GetTwitchUser(reward.twitch_data.user_id);

        let user = reward.twitch_data;

        let author = {
            name: user.name+" ("+user.user_id+")",
            icon_url: undefined
        }

        if(!error) {

            let user = data.data[0];

            author = {
                name: user.display_name+" ("+user.id+")",
                icon_url: user.profile_image_url
            }
        }
        
        const embed = new EmbedBuilder({
            author,
            title: "Action successfully applied `"+reward.reward_id+"`",
            description: "The action was applied and the redemption maked as finished!",
            timestamp: new Date().toISOString()
        }).setColor([46, 204, 113]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

    static async sendDetectedNotClaimedRedemptions(action:Action, redemptions:number) {
        const dsModule = DiscordModule.getInstance();

    
        const embed = new EmbedBuilder({
            title: "The application has detected "+redemptions+" unattended redemptions for the action "+action.on,
            description: "They will be resolved automatically!",
            timestamp: new Date().toISOString()
        }).setColor([52, 152, 219]);
    
        dsModule.sendToNotificationChannel({
            embeds: [embed]
        });
    
    }

}