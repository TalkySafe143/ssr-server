const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const axios = require('axios').default;
const config = require('../../../config/index');

passport.use(new BasicStrategy(async (email, password, done) => {
    try {
        const { data, status } = await axios({
            url: `${config.apiUrl}/api/auth/sign-in`,
            method: 'POST',
            auth: {
                password,
                username: email
            },
            data: {
                apiKeyToken: config.apiKeyToken
            }
        })

        if (!data || status !== 200) done(boom.unauthorized(), null)

        return done(null, data); // JSON Web Token and basic info

    } catch(e) {
        done(e)
    }
}))