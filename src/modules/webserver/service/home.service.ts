import { ActionConfig } from "../../../class/Action.class"



export default class HomeService {

    async getActions() {

        const action = new ActionConfig();
        return action.actions;

    }

}