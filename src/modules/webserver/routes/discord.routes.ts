import { Router } from "express";

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

export {
    app as DiscordController
}