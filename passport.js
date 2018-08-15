// const Model = require('./models')

var auth             = require('./config/auth.js'),
    LocalStrategy    = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy  = require('passport-twitter').Strategy,
    GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    Model            = require('./models'),
    bcrypt           = require('bcrypt'),
    User             = Model.User,
    Async            = require('async'),
    moment           = require('moment');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
         console.log('>>> serialize user')
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log('>>> deserializeUser')
        Model.User.findById(id).then(function (user) {
            done(null, user);
        });
    });

    passport.use('local', new LocalStrategy(
        {
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, email, password, done) {
            req.usedStrategy = 'local';
            Model.User.findOne({
                where: {
                    'email': email
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, req.flash('errMessage', 'Username or password is incorrect'))
                }
                
                if (bcrypt.compareSync(password, user.password)) {
                    return done(null, user);
                   } 
                else {
                    return done(null, false, req.flash('errMessage', 'Username or password is incorrect'))
                }
            })
        }
    ));

    passport.use(new FacebookStrategy({
        clientID        : auth.facebookAuth.clientID,
        clientSecret    : auth.facebookAuth.clientSecret,
        callbackURL     : auth.facebookAuth.callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'profileUrl'],
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
        req.usedStrategy = 'facebook';
        process.nextTick(function() {
            Async.waterfall([
                function (cb) {
                    Model.Facebook.findOne({
                        where: {
                            profile_id: profile.id
                        }
                    }).then(function(fbUser) {
                        cb(null, fbUser);
                    });
                }, function (fbUser, cb) {
                    if (fbUser) {
                        cb(null, fbUser)
                    }
                    else {

                        let newFBUser = {
                            token       : token,
                            profile_id : profile.id,
                            email       : profile.emails[0].value,
                            given_name  :  profile.name.givenName,
                            family_name : profile.name.familyName,
                            expiry_date : moment().format('X')
                        };
                        Model.Facebook.create(newFBUser).then(function(fbUser) {
                            if (!fbUser) {
                                cb(req.flash('error', 'can not create new facebook user'));
                            }
                            else cb(null, fbUser);
                        });
                    }
                }, function (fbUser, cb) {
                    if (req.user) {
                        cb(null, req.user, fbUser);
                    }
                    else {
                        fbUser.getUser().then(function (user) {
                            if (! user) {
                                User.create({}).then(function(user) {
                                    if (!user) cb(req.flash('error', 'can not create new user'));
                                    else cb(null, user, fbUser);
                                });
                            }
                            else cb(null, user, fbUser);
                        });
                        
                    }
                }, function (user, fbUser, cb) {
                    user.setFacebook(fbUser).then(function (user) {
                        cb(null, user);
                    });
                }
            ], function (err, user) {
                console.log('err:', err);
                return done(err, user);
            });
        });
    }));

    passport.use(new GoogleStrategy({
        clientID     : auth.googleAuth.clientID,
        clientSecret : auth.googleAuth.clientSecret,
        callbackURL  : auth.googleAuth.callbackURL,
        passReqToCallback: true
    }, function(req, token, refreshToken, params, profile, done) {

        console.log( 'GOOGLE THINGS>>>>', 'token', token, 'refresh token', refreshToken, 'params', params)

        process.nextTick(function() {
            req.usedStrategy = 'google';
            Async.waterfall([
                function (cb) {
                    Model.Google.findOne({
                        where: {
                            profile_id: profile.id
                        }
                    }).then(function(goUser) {
                        cb(null, goUser);
                    });
                }, function (goUser, cb) {
                    if (goUser) {
                        cb(null, goUser);
                    }
                    else {
                        let newGoUser = {
                            token           : token,
                            refresh_token   : refreshToken,
                            profile_id      : profile.id,
                            email           : profile.emails[0].value,
                            display_name    : profile.displayName,
                            expiry_date     : moment().add(params.expires_in, "s").format("X"),
                            id_token        : params.id_token,
                            token_type      : params.token_type
                        };
                        
                        Model.Google.create(newGoUser).then(function(goUser) {
                            if (!goUser) {
                                cb(req.flash('error', 'can not create new google user'));
                            }
                            else cb(null, goUser);
                        });
                    }
                }, function (goUser, cb) {
                    if (req.user) {
                        cb(null, req.user, goUser);
                    }
                    else {
                        goUser.getUser().then(function (user) {
                            if (user) cb(null, user, goUser);
                            else User.create({}).then(function(user) {
                                if (!user) cb(req.flash('error', 'can not create new user'));
                                else cb(null, user, goUser);
                            });
                        });
                    }
                }, function (user, goUser, cb) {
                    user.setGoogle(goUser).then(function () {
                        cb(null, user);
                    });
                }
            ], function (err, user) {                
                return done(err, user);
            });
        });
    }));


    passport.use(new TwitterStrategy({
        consumerKey    : auth.twitterAuth.consumerKey,
        consumerSecret : auth.twitterAuth.consumerSecret,
        callbackURL    : auth.twitterAuth.callbackURL
    }, function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
            req.usedStrategy = 'twitter';
            new Model.Twitter({twitter_id: profile.id}).fetch().then(function(twUser) {
                if (twUser) {
                    return done(null, twUser);
                } else {
                    // Twitter user not found. Create a new one.
                    new User().save().then(function(user) {
                        var newUserId = user.toJSON().id;

                        var newTWUser = {
                            id           : newUserId,
                            token        : token,
                            twitter_id   : profile.id,
                            username     : profile.username,
                            display_name : profile.displayName
                        };

                        // Create new Facebook user with token.
                        new Model.Twitter(newTWUser).save({}, { method: 'insert' }).then(function(newlyMadeTWUser) {
                            return done(null, newTWUser);
                        });
                    });
                }
            });
        });
    }));
}