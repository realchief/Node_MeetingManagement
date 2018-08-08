// const Model = require('./models')

var config           = require('./config/passport.js'),
    LocalStrategy    = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy  = require('passport-twitter').Strategy,
    GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    Model            = require('./models'),
    bcrypt           = require('bcrypt'),
    User             = Model.User,
    Async            = require('async');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Model.User.findById(id).then(function (user) {
            done(null, user);
        });
    });

    passport.use(new LocalStrategy(
        function(email, password, done) {
            Model.User.findOne({
                where: {
                    'email': email
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, { message: 'Incorrect credentials.' })
                }
                
                if (bcrypt.compareSync(password, user.password)) {
                    console.log("success!");
                    return done(null, user)
                   } 
                else {
                    return done(null, false, { message: 'Incorrect credentials.' })
                }
            })
        }
    ));

    passport.use(new FacebookStrategy({
        clientID        : config.facebookAuth.clientID,
        clientSecret    : config.facebookAuth.clientSecret,
        callbackURL     : config.facebookAuth.callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'profileUrl']
    }, function(req, token, refreshToken, profile, done) {
        console.log('profile: ', profile);
        process.nextTick(function() {
            Async.waterfall([
                function (cb) {
                    Model.Facebook.findOne({ profile_id: profile.id }).then(function(fbUser) {
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
                            family_name : profile.name.familyName
                        };
                        Model.Facebook.create(newFBUser).then(function(fbUser) {
                            if (!fbUser) {
                                cb({error: 'can not create new facebook user'})
                            }
                            else cb(null, fbUser);
                        });
                    }
                }, function (fbUser, cb) {
                    if (req.user) {
                        don(null, req.user, fbUser);
                    }
                    else {
                        User.create({}).then(function(user) {
                            if (!user)cb({error: 'can not create new user'})
                            else cb(null, user, fbUser)
                        });
                    }
                }, function (user, fbUser, cb) {
                    user.setFacebook(fbUser).then(function () {
                        cb(null, user);
                    });
                }
            ], function (err, user) {
                return done(null, user);
            });
        });
    }));

    passport.use(new GoogleStrategy({
        clientID     : config.googleAuth.clientID,
        clientSecret : config.googleAuth.clientSecret,
        callbackURL  : config.googleAuth.callbackURL
    }, function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
            Async.waterfall([
                function (cb) {
                    Model.Google.findOne({ profile_id: profile.id }).then(function(goUser) {
                        cb(null, goUser);
                    });
                }, function (goUser, cb) {
                    if (goUser) {
                        cb(null, goUser)
                    }
                    else {
                        let newGoUser = {
                            token           : token,
                            refresh_token   : refreshToken,
                            profile_id      : profile.id,
                            email           : profile.emails[0].value,
                            display_name    : profile.displayName
                        };
                        Model.Google.create(newGoUser).then(function(goUser) {
                            if (!goUser) {
                                cb({error: 'can not create new google user'})
                            }
                            else cb(null, goUser);
                        });
                    }
                }, function (goUser, cb) {
                    if (req.user) {
                        don(null, req.user, goUser);
                    }
                    else {
                        User.create({}).then(function(user) {
                            if (!user) cb({error: 'can not create new user'})
                            else cb(null, user, goUser)
                        });
                    }
                }, function (user, goUser, cb) {
                    user.setGoogle(goUser).then(function () {
                        cb(null, user);
                    });
                }
            ], function (err, user) {
                return done(null, user);
            });
        });
    }));


    passport.use(new TwitterStrategy({
        consumerKey    : config.twitterAuth.consumerKey,
        consumerSecret : config.twitterAuth.consumerSecret,
        callbackURL    : config.twitterAuth.callbackURL
    }, function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
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