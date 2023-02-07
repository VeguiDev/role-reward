export interface ModulesConfigI {

    [key:string]: ModuleI;

}

export interface ModuleI {

    name?:string;
    enabled:boolean;
    submodules:ModuleI[];

}