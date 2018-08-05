var express = require('express');
var router = express.Router();
var request = require('request')
var passport = require('passport');

// Used to encrypt user password before adding it to db.
var bcrypt = require('bcrypt');

// Bookshelf postgres db ORM object. Basically it makes 
// it simple and less error port to insert/query the db.
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
router.post('/signin', function(req, res, next) {
    passport.authenticate('local', {
                         successRedirect: '/',
                         failureRedirect: '/signin'
    }, function(err, user, info) {
        if (err) {
            return res.render('signin', { title: 'Sign In', errorMessage: err.message });
        }

        if (!user) {
            return res.render('signin', { title: 'Sign In', errorMessage: info.message });
        }

        return req.logIn(user, function(err) {
            if (err) {
                return res.render('signin', { title: 'Sign In', errorMessage: err.message });
            } else {
                return res.redirect('/');
            }
        });
    })(req, res, next);
});

router.get('/signup', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signup', { title: 'Sign Up', layout: false });
    }
});

router.post('/signup', function(req, res) {
    // Here, req.body is { username, password }
    var user = req.body;
    console.log(req.body);
    console.log('====================');
    console.log(user.username);   
    

    try {
        var newUser = new Model.User(user);
        bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (err) return next(err);
                newUser.password = hash; // Or however suits your setup

                // Store the user to the database, then send the response
                newUser.save(function (err, user) {
                    if (err) {
                        res.render('signup', { title: 'Sign Up', layout: false }, { errorMessage: 'Can not signup' })
                    }
                    res.render('signin');
                });
            });
        });
    }
    catch (ex){
        console.log(ex);
    }
    
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