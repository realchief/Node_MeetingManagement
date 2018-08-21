var port = 3001;

module.exports = {
    'port' : port,
    'facebookAuth' : {
        'clientID'      : '860749457453507',
        'clientSecret'  : 'e2fd5e0b3e81e4e9061bb325859b56f1',
        'callbackURL'   : 'http://localhost:' + port + '/auth/facebook/callback'
    },
    'twitterAuth' : {
        'consumerKey'   : '987654',
        'consumerSecret': 'abc456',
        'callbackURL'   : 'http://localhost:' + port + '/auth/twitter/callback'
    },
    'googleAuth' : {
        'clientID'      : '542032120426-5mi2jcld1sn6k2qprbejtt0ci4p275np.apps.googleusercontent.com',
        'clientSecret'  : '2DuMSm4de1iXSl8jdF9sdP5Q',
        'callbackURL'   : 'http://localhost:' + port + '/auth/google/callback'
    },
    
};
