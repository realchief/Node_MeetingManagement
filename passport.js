// const Model = require('./models')

var auth             = require('./config/auth.js'),
    LocalStrategy    = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    Model            = require('./models'),
	bcrypt           = require('bcrypt'),
    User             = Model.User,
    Async            = require('async'),
    moment           = require('moment');

var colors = require('colors');
var emoji = require('node-emoji');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
    
        // console.log('>>> serialize user')
        done(null, user.id);
    
    });

    passport.deserializeUser(function(id, done) {
    
       
        Model.User.findById(id).then(function (user) {

            if ( user ) {

                user.getCompany().then( function( company) {
                    user.company = company
                    done(null, user);
                })

            } else {

                done( null, user)
            }

        });
    
    });

    passport.use('local', new LocalStrategy(
        {
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, email, password, done) {
         
            Model.User.findOne({
                
                where: {
                    'email': email
                }

            }).then(function (user) {
              
                if (!user) {
                    return done(null, false, req.flash('errMessage', 'Username or password is incorrect'))
                }
                
                if ( bcrypt.compareSync(password, user.password) ) {
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
    
        process.nextTick(function() {
    
            Async.waterfall([
                function ( cb ) {
                    
                    /*Model.Facebook.findOne({
                        where: {
                            profile_id: profile.id
                        }
                    }).then(function(fbUser) {
                        cb(null, fbUser);
                    });*/

                    if ( req.user ) {

                        req.user.getCompany().then( function ( company ){

                            if ( company ) {
                            
                                company.getFacebook().then(function ( fAccount ) {
                                
                                    cb( null, fAccount, company )
                                
                                })

                            } else {
                                cb ( null, null, null ) 
                            }

                        })

                    } else {
                        cb ( null, null, null )
                    }
 
                }, function ( fbUser, company, cb ) {
                    
                    if ( fbUser ) {

                        var facebookApi = require('./controllers/facebook-api');

                        console.log("\n", emoji.get("sparkles"), '>>> found an existing facebook account for this user, lets re-authenticate, and update the tokens')
                    
                        // update the current access token //

                        fbUser.updateAttributes({
                        
                            token: token,
                            expiry_date: moment().format('X')
                        
                        }).then(function ( result ) {
                             
                            // now we need to get a new page token

                            if ( fbUser.account_id ) {

                                facebookApi.getAccountList( fbUser, function ( err, accounts ) {
                                    
                                    var currentAccount = accounts.filter( function(account){
                                        return account.account_id == fbUser.account_id
                                    })

                                    fbUser.updateAttributes({
                        
                                        account_token: currentAccount[0].account_token,
                                   
                                    }).then(function ( result ) {
                                            console.log("\n", emoji.get("beer"), '>>> just updated the user and page access tokens for', req.user.company.company_name, 'to:', token, currentAccount[0].account_token)

                                            cb( null, fbUser, company )

                                    })

                                });

                            }

                        });

                    } else {

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
                            else cb(null, fbUser, company);
                        });
                    
                    }

                }, function ( fbUser, company, cb ) {
                    
                    if (req.user) {
                    
                        cb(null, req.user, fbUser, company);
                    
                    }

                    else {

                        // I DONT THINK WE EVER GET HERE //

                        fbUser.getUser().then(function (user) {
                            if (! user) {
                                User.create({}).then(function(user) {
                                    if (!user) cb(req.flash('error', 'can not create new user'));
                                    else cb(null, user, fbUser);
                                });
                            }
                            else cb(null, user, fbUser);
                        });
                        
                        // END NEVER GET HERE //

                    }
                
                }, function ( user, fbUser, company, cb ) {
                  
                    company.setFacebook(fbUser).then(function (user) {
                        
                        cb(null, req.user);
                    
                    });
                
                }

            ], function (err, user) {
               // console.log('err:', err);

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

        //console.log( 'GOOGLE THINGS>>>>', 'token', token, 'refresh token', refreshToken, 'params', params)

        process.nextTick(function() {
            Async.waterfall([
                function ( cb ) {
                    
                   /* Model.Google.findOne({
                        where: {
                            profile_id: profile.id
                        }
                    }).then(function(goUser) {

                        cb(null, goUser);
                    });
                    */

                    if ( req.user ) {

                        req.user.getCompany().then( function ( company ){

                            if ( company ) {
                            
                                company.getGoogle().then(function ( goUser ) {
                                
                                    cb( null, goUser, company )
                                
                                })

                            } else {
                                cb ( null, null, null ) 
                            }

                        })

                    } else {
                        cb ( null, null, null )
                    }


                }, function (goUser, company, cb) {
                  
                    //if (goUser) {
                    //    console.log('>>> found an existing google user')
                    //    cb(null, goUser);
                   // }
                    //else {
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
                            else cb(null, goUser, company);
                        });
                    //}
                
                }, function (goUser, company, cb) {
                  
                    if (req.user) {
                    
                        cb(null, req.user, goUser, company);
                    }

                    else {
                    
                        // I DONT THINK WE EVER GET HERE //

                        goUser.getUser().then(function (user) {
                            if (user) cb(null, user, goUser);
                            else User.create({}).then(function(user) {
                                if (!user) cb(req.flash('error', 'can not create new user'));
                                else cb(null, user, goUser);
                            });
                        });
                        
                       // END NEVER GET HERE //

                    }
                
                }, function (user, goUser, company, cb) {
                  
                    company.setGoogle(goUser).then(function () {
                      
                        cb(null, user);
                    
                    });
                
                }
            ], function (err, user) {                
                return done(err, user);
            });
        });
    }));

}