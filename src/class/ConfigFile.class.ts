import path from 'path';
import fs from 'fs';
import yaml from 'yaml';

export class ConfigFile<T = any> {

    path:string;
    dirpath:string;

    data:T;

    constructor(fpath:string, data:any = {}) {
        this.path = fpath;

        this.dirpath = path.dirname(fpath);

        this.data = data;

        this.load();
    }

    protected load() {

        if(!fs.existsSync(this.path)) {
            return this.save();
        }

        this.data = yaml.parse(fs.readFileSync(this.path).toString());

    }

    getData() {
        return this.data;
    }

    save() {
        
        if(!fs.existsSync(this.dirpath)) {
            fs.mkdirSync(this.dirpath, {recursive: true});
        }

        fs.writeFileSync(this.path, yaml.stringify(this.data));

    }

}