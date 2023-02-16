import inquirer from 'inquirer';
import { StatusCommand } from './commands/status.command';
import chalk from 'chalk';
import ActionCommand from './commands/action.comand';
import DisconnectCommand from './commands/disconnect.command';
import Application from '../../class/Application.class';

export default class CLIModule {
    private static instance: CLIModule;

    private async command(command: string) {
        console.log("RAW COMMAND:", command);
        command = command.trim();

        const commandParts = command.split(" ");

        const cmdName = commandParts[0].toLowerCase();

        if (commandParts[0] == "status") {
            await StatusCommand(command);
        } else if(cmdName == "action" || cmdName == "actions") {
            await new ActionCommand().cmd(command);
        } else if(cmdName == "disconnect") {
            await new DisconnectCommand().cmd(command);
        } else if(cmdName == "close" || cmdName == "exit") {

            const {close} =await inquirer.prompt([
                {
                    type: "confirm",
                    message: "Are you sure you want to exit?",
                    name: "close"
                }
            ])

            if(close) {
                await Application.getInstance().stop()
                await Application.getInstance().saveAll();
                console.log(chalk.greenBright("Goodbye :)"));
                process.exit(0);
            }

        } else if(cmdName == "save-all") {
            await Application.getInstance().saveAll();
        } else if(cmdName == "reconnect") {
            await Application.getInstance().reconnect();
        } else if(command.length > 0) {
            let fristPart = command.split(' ')[0];

            console.log(
                chalk.gray(fristPart),
                chalk.redBright('Command not found!')
            );
        }

        this.prompt();
    }

    async prompt() {
        console.log();

        let ans = await inquirer.prompt({
            type: 'input',
            name: 'command',
            message: chalk.green('>'),
            prefix: '',
        });

        console.log();

        await this.command(ans.command);
    }

    start() {
        this.prompt();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new CLIModule();
        }

        return this.instance;
    }
}
