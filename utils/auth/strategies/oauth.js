//
const jwt = require('jsonwebtoken');
const passport = require('passport');
const boom = require('@hapi/boom');
const axios = require('axios').default;
const { OAuth2Strategy } = require('passport-oauth');

const config = require('../../../config/index');

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
// const GOOGLE_URSERINFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';

const oAuth2Strategy = new OAuth2Strategy({
    authorizationURL: GOOGLE_AUTHORIZATION_URL,
    tokenURL: GOOGLE_TOKEN_URL,
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: '/auth/google-oauth/callback',
}, async (accessToken, refreshToken, params ,profile, cb) => {

    const profileUser = jwt.decode(params.id_token)

    const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-provider`,
        method: 'POST',
        data: {
            name: profileUser.name,
            email: profileUser.email,
            password: profileUser.sub,
            apiKeyToken: config.apiKeyToken
        }
    });

    if (!data && status !== 200) return cb(boom.unauthorized(), null);

    return cb(null, data);
})

// oAuth2Strategy.userProfile = async function(accessToken, done) {

//     const { data: profile, status } = await axios({
//         url: `${GOOGLE_URSERINFO_URL}`,
//         method: 'GET',
//         headers: {
//             Authorization: `Bearer ${accessToken}`
//         }
//     })

//     console.log(profile);

//     if (!profile && status !== 200) return done(boom.unauthorized('Failed to get user information'));

//     try {
//         const { id, name, email } = profile;

//         const googleProfile = {
//             id,
//             name,
//             email
//         }

//         done(null, googleProfile);
//     } catch(e) {
//         return done(e)
//     }
// }

passport.use('google-oauth', oAuth2Strategy);