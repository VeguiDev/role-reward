import chalk from "chalk";

export default class HelpCommand {

    commands = [
        {
            name: "help",
            description: "This help message."
        },
        {
            name: "disconnect [module]",
            description: "Disconnect discord and twitch modules. Or the specificated module."
        },
        {
            name: "status [module]",
            description: "Get global status or status of an module."
        },
        {
            name: "reconnect [module]",
            description: "Reconnect application or reconnect an module."
        },
        {
            name: "action create",
            description: "Created a new action."
        },
        {
            name: "action list|ls",
            description: "List all actions"
        },
        {
            name: "action get|find <id>",
            description: "Get an action"
        },
        {
            name: "login <refresh_token>",
            description: "Login using a refresh_token."
        },
        {
            name: "scopes",
            description: "Show the required scopes for the user access token."
        }
    ]

    constructor(cmd:string) {

        const args = cmd.split(" ");

        console.log(chalk.blueBright(":=================================: "+chalk.bold.blue("HELP MENU")+" :=================================:"))
        console.log();
        console.log(chalk.blueBright("Commands:"))
        this.commands.forEach(command => {

            console.log(`${chalk.cyan(command.name+":")} ${chalk.cyanBright(command.description)}`);

        });

    }

}