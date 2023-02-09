import { ConfigFile } from "./ConfigFile.class";
import os from 'os';
import path from 'path';


export interface Action {

    on:string;
    rewards:string[];

}

export interface ActionFile {

    actions:Action[];

}

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

}