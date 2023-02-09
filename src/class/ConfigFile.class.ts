import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import ClassEvents from './ClassEvent.class';
import { AllKeys } from '../interfaces/AllKeys.type';

export type ConfigFileEvents = "load"|"updated";

export class ConfigFile<T extends object, E = ConfigFileEvents> extends ClassEvents<E|ConfigFileEvents> {

    path:string;
    dirpath:string;

    data:T;

    constructor(fpath:string, data:any = {}) {
        super();
        if(!path.isAbsolute(fpath)) {
            fpath = path.resolve(__dirname, fpath);
        }

        this.path = fpath;

        this.dirpath = path.dirname(fpath);

        this.data = data;

        this.load();
    }

    protected load() {

        if(!fs.existsSync(this.path)) {
            return this.save();
        }
    
        this.data = yaml.parse(fs.readFileSync(this.path).toString('utf-8'),  { schema: 'failsafe' });

        this.emit("load", this);

    }

    getData() {
        return this.data;
    }

    save() {
        
        if(!fs.existsSync(this.dirpath)) {
            fs.mkdirSync(this.dirpath, {recursive: true});
        }

        fs.writeFileSync(this.path, yaml.stringify(this.data), 'utf-8');
        this.emit("updated", this);
    }  

    setData(data:Partial<T>) {

        if(JSON.stringify(data) == "{}") {
            this.data = {} as any;
            this.save();
            return;
        }

        Object.assign(this.data, data);

        this.save();

    }

}