export default class CLIModule {

    private static instance:CLIModule;

    start() {
        
    }

    static getInstance() {

        if(!this.instance) {

            this.instance = new CLIModule();

        }

        return this.instance;

    }

}