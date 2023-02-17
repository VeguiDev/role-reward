import chalk from "chalk";
import Application from "../../../class/Application.class";
import DiscordModule from "../../discord/discord.class";
import TwitchModule from "../../twitch/Twitch.class";

export async function ReconnectCommand(cmd:string) {

    const args = cmd.split(" ");

    if(args.length == 1) {
        await Application.getInstance().reconnect();

        return true;
    }

    if(args.length > 1) {

        let modules = ["twitch","discord","all"];

        if(modules.includes(args[1].toLowerCase())) {

            switch(args[1].toLowerCase()) {

                case "twitch":
                    if(TwitchModule.getInstance().started) {
                        await TwitchModule.getInstance().disconnect();
                    }
                    await TwitchModule.getInstance().start();

                    return true;

                case "discord":
                    if(DiscordModule.getInstance().isInitialized()) {
                        await DiscordModule.getInstance().close();
                    }
                    await DiscordModule.getInstance().start();

                    return true;

                case "all":
                    await Application.getInstance().reconnect();

                    return true;

            }

        } else {
            console.log(chalk.redBright("Invalid module!"));
        }

    }

}