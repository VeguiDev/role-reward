import { TokenStoreI } from "../interfaces/TokenStore.interface";
import { ConfigFile } from "./ConfigFile.class";

import path from 'path';
import os from 'os';
import { getAccessTokenByCode, getCurrentUser, getAccessTokenByRefreshToken, revokeToken } from "../api/auth.service";
import ClassEvents from "./ClassEvent.class";

export type AuthStoreEvents = ("login"|"logout"|"refresh");

export default class AuthStore extends ConfigFile<TokenStoreI, AuthStoreEvents> {

    private static instance:AuthStore;

    constructor() {
        super(path.join(os.homedir(), ".config", "auth.yml"), {});
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

            this.emit("login", this);

            return {
                user
            }

        }

        if(error || res?.status == 400) {

            throw "invalid_code";

        }
        throw "internal_error";
    }

    async logout() {

        const cred = await this.getCredentials();

        if(!cred) throw "cant_you_dont_have_session";

        const {error, data} = await revokeToken(cred.access_token);
        
        if(!error) {
            this.clear();
            this.emit("logout", this);
            return true;
        }
        
        throw "cant_revoke";
        
    }

    private clear() {
        this.setData({});
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

            if(!this.data.user) {
                let user = await this.getCurrentUser();

                if(!user) {
                    this.clear();
                    this.emit("logout", this);
                    return null;
                }

                this.setData({
                    user: user
                })
            }

            this.emit("refresh", this);
            return data;
        }

        this.setData({});
        this.emit("logout", this);
        return false;

    }

    async getCredentials() {
        if(!this.data.access_token && !this.data.refresh_token) return null;

        if(!this.data.refresh_token) return null;

        if(this.tokenExpired()) await this.refresh();

        return this.data;

    }

    haveCredentials() {
        return !!this.data.refresh_token;
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new AuthStore();
        }

        return this.instance;
    }

}