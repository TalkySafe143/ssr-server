const express = require('express');
const config = require('./config');
const session = require('express-session'); // 
const passport = require('passport');
const boom = require('@hapi/boom');
const cookieParser = require('cookie-parser');
const axios = require('axios').default;

const app = express();

// body parser
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: config.sessionSecret })) //
app.use(passport.initialize()); // 
app.use(passport.session()); //

// Basic strategie
require('./utils/auth/strategies/basic');
// OAuth Strategy
require('./utils/auth/strategies/oauth');
// Twitter Strategy
require('./utils/auth/strategies/twitter'); 
// Facebook Strategy
require('./utils/auth/strategies/facebook');

app.post("/auth/sign-in", async (req, res, next) => {
    passport.authenticate('basic', (error, data) => {
        try {
            if (error || !data) next(boom.unauthorized());

            req.login(data, { session: false }, async err => {
                if (err) next(err);

                res.cookie('token', data.token, {
                    httpOnly: !config.dev,
                    secure: !config.dev
                })

                res.status(200).json(data.user)
            })

        } catch(e) {
            next(e);
        }
    })(req, res, next)
});

app.post("/auth/sign-up", async (req, res, next) => {
    const user = req.body;

    try {
        await axios({
            url: `${config.apiUrl}/api/auth/sign-up`,
            method: 'POST',
            data: user
        })

        res.status(201).json({
            message: 'User created!'
        })
        
    } catch(e) {
        next(e);
    }
});

app.get("/movies", async (req, res, next) => {

});

app.post("/user-movies", async (req, res, next) => {
    try {
        const userMovie = req.body;
        const { token } = req.cookies;

        console.log(userMovie)

        const { data, status } = await axios({
            url: `${config.apiUrl}/api/user-movies`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'POST',
            data: userMovie
        })

        if (status !== 201) next(boom.badImplementation());

        res.status(201).json(data)

    } catch(e) {
        next(e);
    }
});

app.delete("/user-movies/:userMovieId", async (req, res, next) => {
    try {
        const { userMovieId } = req.params;
        const { token } = req.cookies;

        const { data, status } = await axios({
            url: `${config.apiUrl}/api/user-movies/${userMovieId}`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'DELETE',
        })

        if (status !== 200) next(boom.badImplementation());

        res.status(200).json(data);

    } catch(e) {
        next(e);
    }
});

app.get('/auth/google-oauth', passport.authenticate('google-oauth', { 
    scope: ['email', 'profile', 'openid']
}));

app.get('/auth/google-oauth/callback', passport.authenticate('google-oauth', { session: false }), (req, res, next) => {
    if (!req.user) next(boom.unauthorized());

    const { token, ...user } = req.user;

    res.cookie('token', token, {
        httpOnly: !config.dev,
        secure: !config.dev
    })

    res.status(200).json(user)
})

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { session: false }), async (req, res, next) => {
    if (!req.user) next(boom.unauthorized());

    const { token, ...user } = req.user;

    res.cookie('token', token, {
        httpOnly: !config.dev,
        secure: !config.dev
    });

    res.status(200).json(user);
})

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), async (req, res, next) => {
    if (!req.user) next(boom.unauthorized());

    const { token, ...user } = req.user;

    res.cookie('token', token, {
        httpOnly: !config.dev,
        secure: !config.dev
    });

    res.status(200).json(user);
})

app.listen(config.port, () => {
    console.log(`[SSR SERVER] Listening on: http://localhost:${config.port}`)
})