require('dotenv').config({path: '../variables.env'})

var port = process.env.PORT

module.exports = {
    'port' : port,
    'facebookAuth' : {
        'clientID'      : process.env.FACEBOOK_CLIENTID,
        'clientSecret'  : process.env.FACEBOOK_CLIENTSECRET,
        'callbackURL'   : process.env.FACEBOOK_CALLBACKURL
    },
    'googleAuth' : {
        'clientID'      : process.env.GOOGLE_CLIENTID,
        'clientSecret'  : process.env.GOOGLE_CLIENTSECRET,
        'callbackURL'   : process.env.GOOGLE_CALLBACKURL
    },
    
};
