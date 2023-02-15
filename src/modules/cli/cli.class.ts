import inquirer from 'inquirer';
import { StatusCommand } from './commands/status.command';
import chalk from 'chalk';
import ActionCommand from './commands/action.comand';

export default class CLIModule {
    private static instance: CLIModule;

    private loop: boolean = true;

    setLoop(value: boolean) {
        this.loop = value;
    }

    isInLoop() {
        return this.loop;
    }

    private async command(command: string) {
        console.log("RAW COMMAND:", command);
        command = command.trim();

        const commandParts = command.split(" ");

        const cmdName = commandParts[0].toLowerCase();

        if (commandParts[0] == "status") {
            await StatusCommand(command);
        } else if(cmdName == "action" || cmdName == "actions") {
            await new ActionCommand().cmd(command);
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
