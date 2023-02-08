import axios from "axios";
import AuthStore from "../class/AuthStore.class";

export const HelixApiClient = axios.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
        "Content-Type": "application/json"
    }
})

HelixApiClient.interceptors.request.use(async function(config) {

    let credentials = await AuthStore.getInstance().getCredentials();

    if(process.env.CLIENT_ID) {
        config.headers["Client-Id"] = process.env.CLIENT_ID;
    }

    if(credentials) {
        config.headers.Authorization = "Bearer "+credentials.access_token
    }

    return config;
    
});