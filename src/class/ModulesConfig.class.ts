import { ConfigFile } from "./ConfigFile.class";
import path from 'path';
import { ModulesConfigI } from "../interfaces/ModulesConfigFile.interface";

export default class ModulesConfigC extends ConfigFile<ModulesConfigI> { 

    private static instance:ModulesConfigC;

    constructor(default_config:any = {
        webserver: {
            enabled: true
        },
        discord: {
            enabled: true
        }
    }) {
        super(path.join("..", "..", "config", "modules.yml"), default_config);
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new ModulesConfigC();
        }

        return this.instance;
    }

}