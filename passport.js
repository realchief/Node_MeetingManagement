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
        clientID        : auth.facebookAuth.clientID,
        clientSecret    : auth.facebookAuth.clientSecret,
        callbackURL     : auth.facebookAuth.callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'profileUrl'],
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
        console.log('profile: ', profile);
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
                        const expiry_date = moment().format('X');

                        let newFBUser = {
                            token       : token,
                            profile_id : profile.id,
                            email       : profile.emails[0].value,
                            given_name  :  profile.name.givenName,
                            family_name : profile.name.familyName,
                            expiry_date : expiry_date
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
                        done(null, req.user, fbUser);
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
        clientID     : auth.googleAuth.clientID,
        clientSecret : auth.googleAuth.clientSecret,
        callbackURL  : auth.googleAuth.callbackURL,
    }, function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
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
                        cb(null, goUser)
                    }
                    else {
                        const expiry_date = moment().add(refreshToken.expires_in, "s").format("X");
                        let newGoUser = {
                            token           : refreshToken.access_token,
                            refresh_token   : refreshToken.id_token,
                            profile_id      : profile.id,
                            email           : profile.emails[0].value,
                            display_name    : profile.displayName,
                            expiry_date     : expiry_date
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
                        done(null, req.user, goUser);
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
        consumerKey    : auth.twitterAuth.consumerKey,
        consumerSecret : auth.twitterAuth.consumerSecret,
        callbackURL    : auth.twitterAuth.callbackURL
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