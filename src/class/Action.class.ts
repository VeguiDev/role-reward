import { ConfigFile } from "./ConfigFile.class";
import os from 'os';
import path from 'path';


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
    headers:{
        [header:string]: string
    };

}

export type ActionRewardI = (ActionRewardDiscordI|ActionRewardFetchI);

export class ActionConfig extends ConfigFile<ActionFile> {

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

    addAction(reward_id:string, data:ActionRewardI) {

        let newReward = {
            on: reward_id,
            rewards: [
                new ActionReward(data)
            ]
        };

        this.data.actions.push(newReward);
        this.save();
        return newReward;
    }

}

export class ActionReward {

    data:ActionRewardI;

    constructor(
        data:ActionRewardI
    ) {

        this.data = data;

    }

    toJSON() {
        return this.data;
    }

}