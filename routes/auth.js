var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    Async = require('async');
    apiControllers = require('../controllers/apis');

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
            function (cb) {
                req.user.getFacebook().then(function (fUser) {
                    if (fUser) {
                        cb(null, fUser)
                    }
                    else {
                        cb({error: 'This user is not connected with facebook account.'});
                    }
                })
            }, function (fUser, cb ) {

                apiControllers.deauthorizeFacebook(fUser, function(result) {

                    console.log("\n", emoji.get("rain_cloud"), '>>>>>> facebook app deauthorize response:', result)

                    req.user.setFacebook(null).then(function () {
                        cb(null, fUser);
                    })

                })

            }, function (fUser, cb) {
                fUser.destroy().then(function () {
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
            function (cb) {
                req.user.getGoogle().then(function (gUser) {
                    if (gUser) {
                        cb(null, gUser)
                    }
                    else {
                        cb({error: 'This user is not connected with google account.'});
                    }
                })
            }, function (gUser, cb) {
                req.user.setGoogle(null).then(function () {
                    cb(null, gUser);
                })
            }, function (gUser, cb) {
                gUser.destroy().then(function () {
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