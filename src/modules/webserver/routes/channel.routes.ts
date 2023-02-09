import { Router } from "express";
import ChannelService from "../service/channel.service";

const app = Router();
const channelService = new ChannelService();

app.get('/rewards', async (req, res) => {
    try {
        return res.json(await channelService.getChannelRewards());
    } catch(e) {

        if(e == "not_credentials") {

            return res.status(401).json({
                status: 401,
                message: "Unauthorized"
            });

        }

        res.status(500).json({
            status: 500,
            error: "internal::error",
            message: "Internal server error"
        })

    }
})

app.use('/rewards/:id', async (req, res, next) => {
    const reward = await channelService.getChannelReward(req.params.id);

    if(!reward) {
        res.status(404).json({
            status:404,
            error: "not_found::reward",
            message: "Can't found the requested reward"
        });
        return;
    }

    req.requestedReward = reward;
    next();
})

app.get('/rewards/:id', (req, res) => {
    res.json(req.requestedReward);
});

app.get('/rewards/:id/redemptions', async (req, res) => {

    const redemptions = await channelService.getChannelRewardRedemptions(req.requestedReward.id);
    
    res.json(redemptions);
});

export {
    app as ChannelController
}