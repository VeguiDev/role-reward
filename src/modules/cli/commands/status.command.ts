import Application from '../../../class/Application.class';
import chalk from 'chalk';

export async function StatusCommand(cmd: string) {
    let actualAppStatus = Application.getInstance().status();

    let args = cmd.split(" ");
    args.splice(0, 1);

    if(args.length < 1) {

        console.log(chalk.bold.blueBright("Modulos:"))
        console.log(StatusForConsole(actualAppStatus));

        return true;

    } else if(args[0] == "list" || args[0] == "ls" ) {
        for(let key of Object.keys(actualAppStatus.modules)) {
            console.log(chalk.green("- "), chalk.whiteBright(key));
        }
    } else {

        let moduleName:string = args[0];
        let modules = Object.keys(actualAppStatus.modules);
        let moduleKey = modules.findIndex(mod => mod.toLowerCase() == moduleName.toLowerCase());

        if(!modules[moduleKey]) {

            return console.log(chalk.redBright(moduleName, "module not found!"));

        }

        let moduleStatusKey = modules[moduleKey];
        let moduleStatus:any = actualAppStatus.modules;

        console.log(StatusForConsole(moduleStatus[moduleStatusKey]));

    }
}

export function jumpsToSpaces(jumps: number) {
    let spaces: string = '';

    for (let i = 0; i < jumps; i++) {
        spaces += ' ';
    }

    return spaces;
}

export function StatusForConsole(data: any, jumps: number = 0): string {
    let lines = [],
        spaces = jumpsToSpaces(jumps);

    if (typeof data != 'object') return '';

    let modules = Object.keys(data);

    for (let module of modules) {
        let mod = data[module];

        if (mod.status) {
            let displayName = module;

            if (mod.display) displayName = mod.display;

            lines.push(`${spaces}${chalk.green("-")} ${displayName} ${mod.status ? chalk.green("•") : chalk.redBright("•")}`);
        } else {
            let modContents = Object.keys(mod);
            let childrenJumps = jumps;

            if (modContents.includes('display')) {
                let displayName = mod.display;

                lines.push(`${spaces}${chalk.green("-")} ${displayName}${chalk.blueBright(":")}`);
                childrenJumps = jumps+1;
            }

            lines.push(StatusForConsole(mod, childrenJumps));
        }
    }
    lines = lines.filter(line => line != "");
    return lines.join('\n');
}
