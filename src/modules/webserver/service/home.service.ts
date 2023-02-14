import { CreateChannelReward } from "../../../api/users.service";
import { ActionConfig, ActionReward, ActionRewardI, ActionRewardType } from "../../../class/Action.class"
import AuthStore from "../../../class/AuthStore.class";
import { RewardI } from "../../../interfaces/TwtichRedemption.interface";



export default class HomeService {

    async getActions() {

        const action = new ActionConfig();
        return action.actions;

    }

    async createAction(rawReward:Partial<RewardI>, actionReward:ActionRewardI) {
        console.log(rawReward);
        const cred = await AuthStore.getInstance().getCredentials();

        if(!cred) throw "not_credentials";
        
        const {error, data} = await CreateChannelReward(cred.user.user_id, rawReward);
        console.log(error,data);
        if(error) {
            throw error;
        }

        let reward = data.data[0];

        console.log(reward);

        return new ActionConfig().addAction(reward.id, actionReward);

    }

}