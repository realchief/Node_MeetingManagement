var express = require('express'),
    router = express.Router(),
    passport = require('passport');

router.get('/facebook', passport.authenticate('facebook', {scope : ['email']}));

router.get('/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/signin'}));

    
router.get('/google', passport.authenticate('google', {scope : ['https://www.googleapis.com/auth/analytics.readonly']}));

router.get('/google/callback',
    passport.authenticate('google', { successRedirect: '/', failureRedirect: '/signin'}));

router.get('/twitter', passport.authenticate('twitter'));   

router.get('/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
        })
);

module.exports = router;