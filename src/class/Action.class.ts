import { ConfigFile } from "./ConfigFile.class";
import os from 'os';
import path from 'path';
import { AxiosRequestConfig } from "axios";


export type ActionRewardType = ("DISCORD_ROLE"|"FETCH");

export interface Action {

    on:string;
    rewards:ActionReward[];

}

export interface ActionFile {

    actions:Action[];

}

export interface ActionRewardDiscordI {

    type:"DISCORD_ROLE";
    roles:string[];

}

export interface ActionRewardFetchI {

    type:"FETCH";
    config:AxiosRequestConfig;

}

export type ActionRewardI = (ActionRewardDiscordI|ActionRewardFetchI);

export class ActionConfig extends ConfigFile<ActionFile> {

    private static instance:ActionConfig;

    constructor(default_config:{
        actions: Action[]
    } = {actions: []}) {
        super(path.join("..", "..", "config", "actions.yml"), default_config);
    }

    get actions() {
        return this.data.actions;
    }

    find(reward_id:string) {
        return this.data.actions.find(action => action.on == reward_id);
    }

    addAction(reward_id:string, data:ActionRewardI|ActionRewardI[]) {

        let rewards:ActionReward[] = [];

        if(!Array.isArray(data)) {
            rewards = [new ActionReward(data)];
        } else {
            rewards = data.map(reward => {
                return new ActionReward(reward)
            })
        }

        let newReward = {
            on: reward_id,
            rewards
        };

        this.data.actions.push(newReward);
        this.save();
        return newReward;
    }

    async removeAction(id:string) {

        let action = this.data.actions.findIndex(act => act.on == id);

        if(action == -1) {
            return false;
        }

        this.data.actions.splice(action, 1);
        this.save();
        
        return true;

    }
    
    static getInstance() {

        if(!this.instance) {

            this.instance = new ActionConfig();

        }

        return this.instance;

    }

}

export class Action {

    on:string;
    rewards:ActionReward[];

    constructor(
        on:string,
        rewards:ActionReward[]
    ) {
        this.on = on;
        this.rewards = rewards.map(reward => {
            if(reward instanceof ActionReward) {
                return reward;
            }

            return new ActionReward(reward);
        });
    }

}

export class ActionReward {

    data:ActionRewardI;

    constructor(
        data:ActionRewardI
    ) {

        this.data = data;

    }

    get details() {

        const {type, ...rest} = this.data;

        return rest;

    }

    get roles() {

        if(this.data.type != "DISCORD_ROLE") return null;;

        return this.data.roles;

    }

    get config() {

        if(this.data.type != "FETCH") return null;

        return this.data.config;

    }

    get type() {

        return this.data.type;

    }

    toJSON() {
        return this.data;
    }

}