import axios from 'axios';
import path from 'path';

const apiClient = axios.create({
    baseURL: "https://id.twitch.tv",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
});

export function getAuthorizeUrl() {
    let query = new URLSearchParams();

    query.set('response_type', 'code');
    query.set('client_id', process.env.CLIENT_ID as string);
    query.set(
        'scope',
        'channel:read:redemptions moderator:manage:banned_users moderator:manage:chat_messages user:read:email chat:read whispers:edit'
    );
    query.set('redirect_uri', 'http://localhost:4000/auth/oauth');

    let authorize = new URL(
        path.posix.join('oauth2', 'authorize'),
        "https://id.twitch.tv"
    );

    authorize.search = query.toString();

    return authorize.href;
}

export async function getAccessTokenByCode(code:string) {

    try {

        let res = await apiClient({
            url: "oauth2/token",
            method: "POST",
            data: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type:"authorization_code",
                redirect_uri: "http://localhost:4000",
                code
            }
        })
        
        return {error:null, data:res.data, res:res};

    } catch(e) {

        if(axios.isAxiosError(e)) {
            let res = null;

            if(e.response) {
                res = e.response;
            }

            return {
                error: e,
                data: null,
                res
            };

        }

        return {
            error: e,
            data:null,
            res:null
        }

    }
}

export async function getAccessTokenByRefreshToken(refresh_token:string) {

    try {

        let res = await apiClient({
            url: "oauth2/token",
            method: "POST",
            data: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type:"refresh_token",
                redirect_uri: "http://localhost:4000",
                refresh_token
            }
        })
        
        return {error:null, data:res.data, res:res};

    } catch(e) {

        if(axios.isAxiosError(e)) {
            let res = null;

            if(e.response) {
                res = e.response;
            }

            return {
                error: e,
                data: null,
                res
            };

        }

        return {
            error: e,
            data:null,
            res:null
        }

    }
}

export async function getCurrentUser(token:string) {
    try {

        let res = await apiClient({
            url:"oauth2/validate",
            method: "GET",
            headers: {
                Authorization: "Bearer "+token
            }
        })

        return {
            error: null,
            data: res.data,
            res
        };

    } catch(e) {

        if(axios.isAxiosError(e)) {

            if(e.response) {

                return {
                    error: e,
                    data: e.response.data,
                    res: e.response
                }

            }

        }

        return {
            error: e,
            data: null,
            res: null
        }

    }
}