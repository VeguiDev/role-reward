import Application from "../../../class/Application.class"
import chalk from 'chalk';
import inquirer from 'inquirer';
import HomeService from "../../webserver/service/home.service";
import prettyjson from 'prettyjson';
import DiscordModule from "../../discord/discord.class";
import { isValidUrl } from "../../../lib/utils.lib";

export default class ActionCommand {

    private readonly homeService:HomeService = new HomeService();

    help() {
        return chalk.red(`action <list|create|get>`);
    }

    private async list() {
        let actions = await this.homeService.getActions();

        if(actions.length == 0) return console.log(
            `${chalk.greenBright(`You don't have any action.`)} ${chalk.blueBright("Can you create one using")} ${chalk.cyan("actions create!")}`
        );
    
        console.log(
            prettyjson.render(actions)
        );

    }

    private async rewardPrompt() {
        console.log(chalk.cyan("You are about to create a reward for an action!"));
        let {reward_type} = await inquirer.prompt([
            {
                type: "list",
                message: "Custom Reward cost:",
                name: "reward_type",
                choices: [
                    {
                        value: "DISCORD_ROLE",
                        name: "Discord Role"
                    },
                    {
                        value: "FETCH",
                        name: "Fetch Request"
                    }
                ]
            }
        ])

        if(reward_type == "DISCORD_ROLE") {

            let roles = await DiscordModule.getInstance().getRoleS();

            let roleChoices = roles.map(role => {
                return {
                    value: role.id,
                    name: `${chalk.hex(role.hexColor)(role.name)} ${chalk.greenBright(`(${role.id})`)}`
                }
            })

            let {selectedRoles} = await inquirer.prompt([
                {
                    type: "checkbox",
                    name: "selectedRoles",
                    choices: roleChoices,
                    message: "Select the ranks you want to reward",
                    validate: (answer) => {
                        if(answer.length > 0) return true;

                        return "It's necessary to select at least one role."
                    }
                },
            ])

            return {
                type: reward_type,
                roles: selectedRoles
            };

        } else {

            let config = await inquirer.prompt([
                {
                    type: "input",
                    name: "url",
                    message: "URL to request: ",
                    validate: (url) => {

                        if(url != '' || isValidUrl(url)) return true;

                        return "The url is not valid!";

                    }
                },
                {
                    type: "list",
                    name: "method",
                    message: "Select the method of request: ",
                    choices: ["GET", "POST", "PUT", "PATCH", "DELETE"]
                }
            ])

            return {
                type: reward_type,
                config
            };

        }

    }

    private async create(title?:string, cost?:number):Promise<boolean> {
        console.clear();
        console.log(chalk.blueBright(
            `To create a new action you need to create a new Custom Reward (TWITCH).`
        ))
        console.log();

        let reward = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Custom Reward Title:",
                validate: function(text) {
                    if(text != "") return true;

                    return chalk.redBright("The title cannot be empty!");
                },
                default: title
            },
            {
                type: "input",
                name: "cost",
                message: "Custom Reward cost:",
                validate: (text, ans) => {
                    if(text != "" && !Number.isNaN(text) && Number(text) > 0) return true;

                    return chalk.redBright("The cost must be an number greater than zero!");
                },
                default: cost
            }
        ])

        if(reward.title == '' || reward.cost == '') {
            console.clear();
            console.log(chalk.redBright("The title or cost can't be empty."));
            return false;
        }

        let rewards = [];

        let isAdding = true;

        while(isAdding) {

            rewards.push(await this.rewardPrompt());

            let {completed} = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "completed",
                    message: "You want add more rewards for this action?"
                }
            ]);

            isAdding = completed;

        }
        
        if(rewards.length == 0) {

            console.error(chalk.redBright("To create an action you need rewards!"));
            return false;

        }

        let finalReward = {
            triggerer: reward,
            rewards: rewards
        }

        console.log(prettyjson.render(finalReward));

        let {completed} = await inquirer.prompt([
            {
                type: "confirm",
                name: "completed",
                message: "Is the configuration correct?"
            }
        ]) 

        if(!completed) return this.create(reward.title, reward.cost);

        try {
            const creationProcess = await this.homeService.createAction(finalReward.triggerer, finalReward.rewards);

            console.log(chalk.greenBright(`Action created successfully.`), chalk.blueBright(`ID: ${creationProcess.on}`))

            return true;
        } catch(e) {

            if(e == "not_credentials") {
                console.log(chalk.redBright("Unauthorized!"));
                return false;
            } else {
                console.log(chalk.redBright("Unknow error!"));
                return false;
            }

        }
    }

    async getAction(args:string[]) {

        if(args.length <= 2) {
            console.log(
                chalk.redBright(`Invalid syntax`)
            );

            console.log(
                chalk.redBright(`action get <id>`)
            );
            return false;
        }

        let actions = await this.homeService.getActions();

        let action = actions.find(action => action.on == args[2]);

        if(!action) {
            return console.error(chalk.redBright("Action not found!"));
        }

        console.log(prettyjson.render(action));

    }

    async cmd(command:string) {

        let args = command.split(" ");
        
        if(!args[1]) return console.error(this.help());

        switch(args[1].toLowerCase()) {

            case "ls":
            case "list":
                return await this.list();
            case "create":
                return await this.create();
            case "get":
            case "find":
                return await this.getAction(args);
            default:
                console.error(this.help());
                break;

        }

    }

}