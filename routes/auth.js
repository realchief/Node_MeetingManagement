var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    Async = require('async');

var facebookApi = require('../controllers/facebook-api');
var googleApi = require('../controllers/google-analytics-api');

var colors = require('colors');
var emoji = require('node-emoji');

router.get('/facebook', passport.authenticate('facebook', {
        scope : ['email,read_insights,manage_pages']
    })

);

router.get('/facebook/callback', passport.authenticate('facebook', { 
        successRedirect: '/data-sources', 
        failureRedirect: '/signin'
    })
);

    
router.get('/google', passport.authenticate('google', {
        scope : ['https://www.googleapis.com/auth/analytics.readonly', 'profile', 'email'],
        accessType: 'offline', 
        prompt: 'consent'
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        successRedirect: '/data-sources', 
        failureRedirect: '/signin'
    })
);

router.get('/facebook/unlink',  function (req, res) {
    if (!req.user) {
        return res.redirect('/signin')
    }
    else {
        Async.waterfall([
            function ( cb ) {

                req.user.getCompany().then( function ( company ){

                    if ( company ) {

                        company.getFacebook().then(function ( fAccount) {
                            if ( fAccount) {
                                cb(null, fAccount, company)
                            }
                            else {
                                cb({error: 'This user is not connected with facebook account.'});
                            }
                        })
                    }

                })


            }, function ( fAccount, company, cb ) {

                facebookApi.deauthorize( fAccount, function(result) {

                    console.log("\n", emoji.get("bomb"), '>>>>>> facebook app deauthorize response:', result)

                    company.setFacebook(null).then(function () {
                        cb(null, fAccount, company);
                    })

                })

            }, function ( fAccount, company, cb) {
                fAccount.destroy().then(function () {
                    cb(null);
                })
            }
        ], function (err, result) {
            if (err) {

                req.flash('facebook_error', err.error);
           
            } else {

                req.session.sessionFlash = {
                    type: 'info',
                    message: 'Facebook has been disconnected'
                }

                req.session.redirectTo = "/data-sources"
                res.redirect('/data-sources');

            }
            
        })
    }
});

router.get('/google/unlink',  function (req, res) {
    if (!req.user) {
        return res.redirect('/signin')
    }
    else {
        Async.waterfall([
            function ( cb ) {


                req.user.getCompany().then( function ( company ){

                    if ( company ) {

                        company.getGoogle().then(function (gAccount) {
                            if (gAccount) {
                                cb(null, gAccount, company)
                            }
                            else {
                                cb({error: 'This user is not connected with google account.'});
                            }
                        })
                    }
                })

            }, function (gAccount, company, cb) {
                company.setGoogle(null).then(function () {
                    cb(null, gAccount, company);
                })
            }, function (gAccount, company, cb) {
                gAccount.destroy().then(function () {
                    cb(null);
                })
            }
        ], function (err, result) {
            if (err) {
        
                req.flash('google_error', err.error);
        
            } else {

                req.session.sessionFlash = {
                    type: 'info',
                    message: 'Google Analytics has been disconnected'
                }

                res.redirect('/data-sources');

            }
           
        })
    }
});

module.exports = router;