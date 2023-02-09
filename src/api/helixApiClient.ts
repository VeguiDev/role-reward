import axios from "axios";
import AuthStore from "../class/AuthStore.class";
import { replaceDataInConfig } from "./lib/RequestDataReplacer.lib";

export const HelixApiClient = axios.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
        "Content-Type": "application/json"
    }
})

HelixApiClient.interceptors.request.use(async function(config) {

    let credentials = await AuthStore.getInstance().getCredentials();

    config = await replaceDataInConfig(config);

    if(process.env.CLIENT_ID) {
        config.headers["Client-Id"] = process.env.CLIENT_ID;
    }

    if(credentials) {
        config.headers.Authorization = "Bearer "+credentials.access_token
    }

    return config;
    
});