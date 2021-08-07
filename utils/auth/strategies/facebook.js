const passport = require('passport');
const boom = require('@hapi/boom');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const axios = require('axios').default;
const config = require('../../../config/index');

passport.use(new FacebookStrategy({
    clientID: config.facebookClientId,
    clientSecret: config.facebookClientSecret,
    callbackURL: '/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, cb) => {
    const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-provider`,
        method: 'POST',
        data: {
            name: profile.name,
            password: profile.id,
            email: profile.emails[0].value,
            apiKeyToken: config.apiKeyToken
        }
    })

    if (!data || status !== 200) return cb(boom.unauthorized(), null);

    return cb(null, data);
}))

