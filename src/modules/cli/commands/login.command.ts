import chalk from "chalk";
import { getAccessTokenByRefreshToken, getCurrentUser, TokenScopes } from "../../../api/auth.service";
import AuthStore from "../../../class/AuthStore.class";
import { IncludeAll } from "../../../lib/utils.lib";

export default class LoginCommand {

    usage() {
        return "login <refresh_token>";
    }

    private async validateToken(accesstoken:string) {

        const {error, data} = await getCurrentUser(accesstoken);
        
        if(error) return false;
    
        if(!data.scopes) return false;
        
        if(!IncludeAll(TokenScopes, data.scopes)) {
            console.log(chalk.redBright("The access token does not have the necessary scopes!"));
            console.log(chalk.yellow("Necessary scopes: ", TokenScopes.join(" ")));
            return false;
        }

        return data;

    }

    async cmd(command:string) {

        if(await AuthStore.getInstance().getCredentials()) {

            console.log(chalk.redBright("You can't login!", " You are logged in!"));

            return false;
        }

        // login <refresh_token>
        let args = command.split(" ");

        if(args.length < 2) {

            console.log(chalk.redBright("Invalid command sintax!"));
            console.log(chalk.redBright(this.usage()));
            return false;
        }

        const [commandName, refreshToken] = args;
        
        const {error, data} = await getAccessTokenByRefreshToken(refreshToken);

        if(error) {
            console.log(chalk.redBright("The provided refresh_token is invalid!"));
            return false;
        }
        
        const accessToken = data.access_token;
        const expires_in = data.expires_in;
        const expires_at = Date.now() + expires_in;

        const validation = await this.validateToken(accessToken);

        if(!validation) return false;

        AuthStore.getInstance().setData({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expires_at,
            user: {
                user_id: validation.user_id,
                name: validation.login
            }
        });

        return true;

    }

    scopes() {
        console.log(chalk.blueBright("The required scopes for user access tokens are:"));
        console.log(TokenScopes.join(" "));
        return true;
    }

    async logout() {
        if(!AuthStore.getInstance().haveCredentials()) {
            console.log(chalk.redBright("You don't have a session!"));
            return false;
        }

        if(!await AuthStore.getInstance().logout()) {
            console.log(chalk.redBright("We can't close the session. Please try again later!"));
            return false;
        }

        console.log(chalk.greenBright("Session Closed!"));
    }

}