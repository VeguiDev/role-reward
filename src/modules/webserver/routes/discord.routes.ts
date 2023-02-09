import { Router } from "express";
import DiscordModule from "../../discord/discord.class";

const app = Router();

app.get('/bot', async (req, res) => {

    if(!process.env.DISCORD_CLIENT_ID) {
        return res.status(500).json({
            error: "not_found::DISCORD_CLIENT_ID__ENV_VAR",
            message: "The discord client ID is not in the .env file!"
        })
    }

    res.redirect("https://discord.com/api/oauth2/authorize?client_id="+process.env.DISCORD_CLIENT_ID+"&permissions=1099780063264&scope=bot");
});

app.get('/roles', async (req, res) => {
    let discordMoudle = DiscordModule.getInstance();

    if(!discordMoudle.isInitialized()) return res.status(500).json({
        status: 500,
        error: "not_initialized::discordModule",
        message: "The discord module is not initialized!"
    })

    res.json(await discordMoudle.getRoleS());
});

app.get('/roles/:id', async (req, res) => {
    let discordMoudle = DiscordModule.getInstance();

    if(!discordMoudle.isInitialized()) return res.status(500).json({
        status: 500,
        error: "not_initialized::discordModule",
        message: "The discord module is not initialized!"
    })
    let role = await discordMoudle.getRole(req.params.id);

    if(!role) {
        return res.status(404).json({
            status: 404,
            error: "not_found::role",
            message: "The role can't be found"
        })
    }

    res.json(role);
});

export {
    app as DiscordController
}