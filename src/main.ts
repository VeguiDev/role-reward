import { ModulesConfig } from "./lib/modules.lib";
import { WebServer } from "./modules/webserver/WebServer.class";
import dotenv from 'dotenv';

dotenv.config();

if(ModulesConfig.webserver.enabled) {

    const webserver = new WebServer();

    webserver.listen();

}