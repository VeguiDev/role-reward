import { InternalAxiosRequestConfig } from "axios";
import AuthStore from "../../class/AuthStore.class";

export async function replaceData(name:string, value:string|number|boolean, target:any):Promise<any> {
    if(Array.isArray(target)) {

        return await Promise.all(target.map(tar => {
            return replaceData(name, value, tar);
        }));

    } else if(typeof target == 'object' && target != null) {
        
        const keys = Object.keys(target);

        for(const key of keys) {

            target[key] = await replaceData(name, value, target[key]);

        }

        return target;

    } else if(typeof target == 'string') {

        if(target == "::"+name.toUpperCase()+"::") {
            return value;
        }

        return target.replace(new RegExp("::"+name+"::", "g"), String(value));
    } else {
        return target;
    }
}

export async function replaceDataInConfig(config:InternalAxiosRequestConfig) {
    const cred = await AuthStore.getInstance().getCredentials();

    let muttatedConfig = config;

    if(cred) {

        muttatedConfig = await replaceData("ACCESS_TOKEN", cred.access_token, config);
        muttatedConfig = await replaceData("REFRESH_TOKEN", cred.refresh_token, config);
        muttatedConfig = await replaceData("USER_ID", cred.user.user_id, config);
        muttatedConfig = await replaceData("USER_NAME", cred.user.name, config);
        
        if(process.env.CLIENT_ID) {

            muttatedConfig = await replaceData("CLIENT_ID", process.env.CLIENT_ID, config);

        }

        if(process.env.CLIENT_SECRET) {

            muttatedConfig = await replaceData("CLIENT_SECRET", process.env.CLIENT_SECRET, config);

        }
    }

    return muttatedConfig;

}