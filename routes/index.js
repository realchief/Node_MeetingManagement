var express = require('express');
var router = express.Router();
var request = require('request')
var passport = require('passport');
var bcrypt = require('bcrypt');
var Model = require('../models');

router.get('/', function (req, res) {

    req.session.currentVersion = process.env.HOME_VERSION
    res.render(process.env.HOME_VERSION, {
    	version: process.env.HOME_VERSION,
        layout: process.env.HOME_VERSION + '.handlebars',
        register_version: 'none'
    });
});

router.get('/signin', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signin', { title: 'Sign In', layout: false });
    }
});

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
    // Here, req.body is { username, password }
    var newUser = req.body;

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
        res.redirect('/', { errorMessage: 'You are not logged in' });
    } else {
        req.logout();
        res.redirect('/signin');
    }
});

module.exports = router