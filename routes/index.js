let express = require('express');
let router = express.Router();
let request = require('request')
let passport = require('passport');
let bcrypt = require('bcrypt');
let Model = require('../models');

router.get('/',  function (req, res) {
    if (req.isAuthenticated()) {
        req.session.currentVersion = 'fingertips'
        res.render('fingertips', {
            version: 'fingertips',
            layout: 'fingertips.handlebars',
            register_version: 'none'
        });
    }
    else res.redirect('/signin');
});

router.get('/signin', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signin', { title: 'Sign In', layout: false });
    }
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope : ['email']}));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/signin' }));

// Add user to database.
router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin'
}));

router.get('/signup', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signup', { title: 'Sign Up', layout: false });
    }
});

router.post('/signup', function(req, res) {
    
    let newUser = req.body;

    Model.User.create(newUser).then(function (user) {
        console.log(user);
        res.redirect('signin');
    }).catch(function (err) {
        console.log(err);
        res.render('signup', {errorMessage: 'Can not signup!'});
    });
});

router.get('/signout', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin', { errorMessage: 'You are not logged in' });
    } else {
        req.logout();
        res.redirect('/signin');
    }
});

module.exports = router