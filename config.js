var port = 1337;

module.exports = {
    'port' : port,
    'facebookAuth' : {
        'clientID'      : '123456',
        'clientSecret'  : 'abc123',
        'callbackURL'   : 'http://localhost:' + port + '/auth/facebook/callback'
    },
    'twitterAuth' : {
        'consumerKey'   : '987654',
        'consumerSecret': 'abc456',
        'callbackURL'   : 'http://localhost:' + port + '/auth/twitter/callback'
    },
    'googleAuth' : {
        'clientID'      : '456789',
        'clientSecret'  : 'abc789',
        'callbackURL'   : 'http://localhost:' + port + '/auth/google/callback'
    }
};
