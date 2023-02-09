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

export {
    app as HomeController
}