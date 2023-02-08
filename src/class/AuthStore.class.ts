import { TokenStoreI } from "../interfaces/TokenStore.interface";
import { ConfigFile } from "./ConfigFile.class";

import path from 'path';
import os from 'os';
import { getAccessTokenByCode, getCurrentUser, getAccessTokenByRefreshToken } from "../api/auth.service";

export default class AuthStore extends ConfigFile<TokenStoreI> {

    private static instance:AuthStore;

    constructor() {
        super(path.join(os.homedir(), ".config", "auth.yml"), {});
    }

    setData(data:Partial<TokenStoreI>) {

        Object.assign(this.data, data);

        this.save();

    }

    async getCurrentUser() {
        const {error, data} = await getCurrentUser(this.data.access_token);
        console.log(error, data)
        if(error) return null;
        
        return {
            name: data.login,
            user_id: data.user_id
        };

    }

    async login(code:string) {

        const {error, data, res} = await getAccessTokenByCode(code);

        if(!error) {

            let accessToken = data.access_token,
                refreshToken = data.refresh_token,
                expires_at = Date.now() + data.expires_in
            
            this.setData({
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expires_at
            });

            let user = await this.getCurrentUser();

            if(!user) throw "cant_get_user";

            this.setData({
                user
            });

            return {
                user
            }

        }

        if(error || res?.status == 400) {

            throw "invalid_code";

        }
        throw "internal_error";
    }

    tokenExpired() {

        return Date.now() >= this.data.expires_at;

    }

    private async refresh() {

        if(!this.tokenExpired()) return;

        const {error, data} = await getAccessTokenByRefreshToken(this.data.refresh_token);

        if(!error) {

            this.setData({
                refresh_token: data.refresh_token,
                access_token: data.access_token,
                expires_at: Date.now() + data.expires_in
            });
            return data;
        }

        this.setData({});

        return false;

    }

    async getCredentials() {
        if(!this.data.access_token && !this.data.refresh_token) return null;

        if(!this.data.refresh_token) return null;

        if(this.tokenExpired()) await this.refresh();

        return this.data;

    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new AuthStore();
        }

        return this.instance;
    }

}