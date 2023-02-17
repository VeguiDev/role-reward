import { Router } from "express";
import { getAccessTokenByCode, getAuthorizeUrl } from "../../../api/auth.service";
import AuthStore from "../../../class/AuthStore.class";

const app = Router();

app.get("/", async (req, res) => {
    let cred = await AuthStore.getInstance().getCredentials();
    res.json(cred);
});

app.get("/authorize", async (req, res) => {
    
    res.redirect(getAuthorizeUrl());

});

app.get("/oauth", async (req, r) => {

    if(!req.query.code || typeof req.query.code != 'string') {
        r.json({
            error: "invalid::body",
            message: "'Code' not found in search params!"
        });
        return;
    }

    try {
        const data = await AuthStore.getInstance().login(req.query.code);

        r.json({
            code: "success::login",
            message: "Login successfully",
            user: data.user
        });

    } catch (error) {

        if(error == "invalid_code") {
            r.status(400).json({
                error: "invalid::code",
                message: "The provided code is invalid!"
            });
            return;
        }

        r.status(500).json({
            error: "cant_complete::login",
            message: "Can't complete the login process"
        })

        return r.status(500).json({
            error: "internal::error",
            message: "Internal server error"
        })
    }
});

app.get("/logout", async (req, res) => {

    const authStore = AuthStore.getInstance();

    try {

        if(await authStore.logout()) {
            res.json({
                success:true,
                code: "logout_success"
            });
        } else {

            res.status(500).json({
                error: "cant::logout",
                message: "Can't close session"
            });

        }

    } catch(e) {

        if(e == "cant_you_dont_have_session") {

            res.status(400).json({
                error: "dont_have::session",
                message: "You dont have session"
            });

        } else {
            res.status(500).json({
                error: "cant::logout",
                message: "Can't close session"
            });
        }

    }
});

export {
    app as AuthController
}