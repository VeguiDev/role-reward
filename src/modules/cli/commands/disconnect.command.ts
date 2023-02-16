import chalk from "chalk";
import Application from "../../../class/Application.class";
import DiscordModule from "../../discord/discord.class";
import TwitchModule from "../../twitch/Twitch.class";

export default class DisconnectCommand {

    async cmd(command:string) {

        let args = command.split(" ");

        if(args.length > 1) {

            let module = args[1].toLowerCase();

            if(module == "twitch") {

                TwitchModule.getInstance().disconnect();

            } else if(module == "discord") {

                DiscordModule.getInstance().close();

            } else {
                console.log(chalk.redBright("Module not found!"));
            }

            return true;
        }

        await Application.getInstance().stop();

        console.log(chalk.yellow("All modules are disabled!"));

        return true;

    }

}