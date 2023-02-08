import { Router } from "express";
import { ModulesConfig } from "../../../lib/modules.lib";

const app = Router();

app.get("/", (req, res) => {

    res.json({
        message: "Hello World"
    });

});

app.get("/modules", (req, res) => {

    res.json(ModulesConfig);

});

export {
    app as HomeController
}