import {GetChannelReward, GetChannelRewardRedemption, GetChannelRewards} from '../../../api/users.service';
import AuthStore from '../../../class/AuthStore.class';

export default class ChannelService {

    async getChannelRewards() {

        const credentials = await AuthStore.getInstance().getCredentials();

        if(!credentials) {
            throw "not_credentials";
        }

        const {error, data, res} = await GetChannelRewards(credentials.user.user_id);

        if(!error) {

            return data.data;

        }
        
        console.error(error);
        return null;

    }

    async getChannelReward(id:string) {

        const credentials = await AuthStore.getInstance().getCredentials();

        if(!credentials) {
            throw "not_credentials";
        }

        const {error, data, res} = await GetChannelReward(credentials.user.user_id, id);

        if(!error) {

            return data.data[0];

        }
        
        console.error(error);
        return null;

    }


    async getChannelRewardRedemptions(id:string) {

        const credentials = await AuthStore.getInstance().getCredentials();

        if(!credentials) {
            throw "not_credentials";
        }

        const {error, data, res} = await GetChannelRewardRedemption(credentials.user.user_id, id);

        if(!error) {

            return data.data[0];

        }
        
        console.error(error);
        return null;

    }

}