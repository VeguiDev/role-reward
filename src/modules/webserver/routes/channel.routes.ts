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



export {
    app as ChannelController
}