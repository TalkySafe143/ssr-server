const passport = require('passport');
const axios = require('axios').default;
const loadash = require('lodash');
const boom = require('@hapi/boom');
const { Strategy: TwitterStrategy } = require('passport-twitter');

const config = require('../../../config/index');

passport.use(new TwitterStrategy({
    consumerKey: config.twitterConsumerKey,
    consumerSecret: config.twitterConsumerSecret,
    callbackURL: '/auth/twitter/callback',
    includeEmail: true
}, async (token, tokenSecret, profile, cb) => {
    const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-provider`,
        method: 'POST',
        data: {
            name: profile.displayName,
            email: loadash.get(profile, '.emails.0.value', `${profile.username}@twitter.com`),
            password: profile.id,
            apiKeyToken: config.apiKeyToken
        }
    })

    if (!data || status !== 200) return cb(boom.unauthorized(), null);

    return cb(null, data);
}))
