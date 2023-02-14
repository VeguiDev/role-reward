import { Router } from "express";
import Application from "../../../class/Application.class";
import HomeService from "../service/home.service";

const app = Router();

const homeService = new HomeService();

app.get("/", (req, res) => {

    res.json({
        message: "Hello World"
    });

});

app.get('/actions', async (req, res) => {
    res.json(await homeService.getActions());
});

app.post('/actions', async (req,res) => {

    const {action_trigger, reward} = req.body;

    if(!action_trigger || !reward) {
        res.status(400).json({
            status: 400,
            error:"invalid::body"
        });
        return;
    }

    try {

        const action = await homeService.createAction(action_trigger, reward);

        res.json(action);

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

app.get("/status", (req,res) => {

    res.json(Application.getInstance().status())

});

export {
    app as HomeController
}