let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var colors = require('colors');
var emoji = require('node-emoji')


router.get('/google/setprofile', function (req, res) {   
    if (req.user) {
        if (req.query.view_id && req.query.account_name && req.query.property_id) {
            req.user.getGoogle().then(function (gUser) {
                gUser.updateAttributes({
                    view_id: req.query.view_id,
                    account_id: req.query.account_id,
                    property_id: req.query.property_id,
                    property_name: req.query.property_name,
                    view_name: req.query.view_name,
                    property_name: req.query.property_name,
                    account_name: req.query.account_name
                }).then(function (updatedResult) {
                    res.redirect('/');
                    console.log('========updated result======');
                    console.log(updatedResult);
                })
            });
        }
        else res.redirect('/');
    }
    else res.redirect('signin');
})

router.get('/facebook/setprofile', function (req, res) {
    if (req.user) {
        console.log('--------------- Account id ---------------- ', req.query.account_id);
        console.log('--------------- Account name ---------------- ', req.query.account_name);
        console.log('--------------- account_token ---------------- ', req.query.account_token);   
        if (req.query.account_id && req.query.account_name && req.query.account_token) {
            req.user.getFacebook().then(function (fUser) {                
                fUser.updateAttributes({
                    account_id: req.query.account_id,
                    account_name: req.query.account_name,
                    account_token: req.query.account_token
                }).then(function (updatedResult) {                        
                    res.redirect('/');
                    console.log('========updated result======');
                    console.log(updatedResult);             
                })
            });
        }
        else res.redirect('/');
    }
    else res.redirect('signin');
})

router.get('/signin', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signin', { title: 'Sign In', layout: false, errorMessage: req.flash('errMessage') });
    }
});

// Add user to database.
router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash : true
}));

router.get('/signup', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signup', { title: 'Sign Up', layout: false });
    }
});

router.post('/signup', function(req, res) {
    
    // validation of signup form

    let newUser = req.body;   
    let new_password = newUser.password;
    let new_confirm_password = req.body.confirm_password;
    let new_email = req.body.email;

    if (new_password != new_confirm_password) {
        console.log('Not matched');
        res.render('signup', {errorMessage: { password_match:'Password is not matched. Try again'}, layout: false} );
    }

    else {
        Model.User.findOne({
            where: {
                'email': new_email
            }
        }).then(function (user) {
            if (user) {
                res.render('signup', {errorMessage: { email:'Duplicated User, This email was already used. Use other email.'}, layout: false} );
            }
            else {
                Model.User.create(newUser).then(function (user) {
                    console.log(user);
                    res.redirect('signin');
                }).catch(function (err) {
                    console.log(err);
                    res.render('signup', {errorMessage: { signout:'You can not logout', layout: false }});
                });
            }
        })
    }       
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