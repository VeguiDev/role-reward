import { Router } from "express";
import { ModulesConfig } from "../../../lib/modules.lib";
import HomeService from "../service/home.service";

const app = Router();

const homeService = new HomeService();

app.get("/", (req, res) => {

    res.json({
        message: "Hello World"
    });

});

app.get("/modules", (req, res) => {

    res.json(ModulesConfig);

});

app.get('/actions', async (req, res) => {
    res.json(await homeService.getActions());
});

app.post('/actions', async (req,res) => {

    if(!req.body.roles) {
        res.status(400).json({
            status: 400,
            error:"not_found_in_body::roles"
        });
        return;
    }

    try {

        const reward = await homeService.createAction(req.body.reward, req.body.roles);

        res.json(reward);

    } catch(e) {
        console.error(e);

        if(e == "no_credentials") {

            res.status(401).json({
                error:"not_have::credentials",
                message: "You don't have any credentials"
            });

        } else {
            res.status(500).json({
                error:"internal::error",
                message: "An unknow server error ocurred!"
            });
        }
    }

});

export {
    app as HomeController
}