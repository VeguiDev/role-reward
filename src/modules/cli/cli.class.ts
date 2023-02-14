import inquirer from 'inquirer';
import { StatusCommand } from './commands/status.command';
import chalk from 'chalk';

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
        command = command.trim();

        if (command.startsWith('status')) {
            StatusCommand(command);
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
