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
        'clientID'      : '53991449399-gf3t1i4f26o7sqeipl1ok0crmmhptcbo.apps.googleusercontent.com',
        'clientSecret'  : 'focTjpmNrh1FPiHo1IZU8FXf',
        'callbackURL'   : 'http://localhost:' + port + '/auth/google/callback'
    },
    
};
