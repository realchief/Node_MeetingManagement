var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    Async = require('async');

var facebookApi = require('../controllers/facebook-api');
var googleApi = require('../controllers/google-analytics-api');

var colors = require('colors');
var emoji = require('node-emoji');

router.get('/facebook', passport.authenticate('facebook', {scope : ['email,read_insights,manage_pages']}));

router.get('/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/signin'}));

    
router.get('/google', passport.authenticate('google', {
    scope : ['https://www.googleapis.com/auth/analytics.readonly', 'profile', 'email'],
    accessType: 'offline', prompt: 'consent'
}));

router.get('/google/callback',
    passport.authenticate('google', { successRedirect: '/', failureRedirect: '/signin'}));

router.get('/facebook/unlink',  function (req, res) {
    if (!req.user) {
        return res.redirect('/signin')
    }
    else {
        Async.waterfall([
            function ( cb ) {
                req.user.getFacebook().then(function ( fAccount) {
                    if ( fAccount) {
                        cb(null, fAccount)
                    }
                    else {
                        cb({error: 'This user is not connected with facebook account.'});
                    }
                })
            }, function ( fAccount, cb ) {

                facebookApi.deauthorize( fAccount, function(result) {

                    console.log("\n", emoji.get("bomb"), '>>>>>> facebook app deauthorize response:', result)

                    req.user.setFacebook(null).then(function () {
                        cb(null, fAccount);
                    })

                })

            }, function ( fAccount, cb) {
                fAccount.destroy().then(function () {
                    cb(null);
                })
            }
        ], function (err, result) {
            if (err) {
                req.flash('facebook_error', err.error);
            }
            res.redirect('/');
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
                req.user.getGoogle().then(function (gAccount) {
                    if (gAccount) {
                        cb(null, gAccount)
                    }
                    else {
                        cb({error: 'This user is not connected with google account.'});
                    }
                })
            }, function (gAccount, cb) {
                req.user.setGoogle(null).then(function () {
                    cb(null, gAccount);
                })
            }, function (gAccount, cb) {
                gAccount.destroy().then(function () {
                    cb(null);
                })
            }
        ], function (err, result) {
            if (err) {
                req.flash('google_error', err.error);
            }
            res.redirect('/');
        })
    }
});

module.exports = router;