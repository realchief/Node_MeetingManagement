let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

router.get('/',  function (req, res) {
    console.log('dashboard');
    if (req.isAuthenticated()) {
        Async.parallel({
            google_token: function (cb) {
                req.user.getGoogle().then(function (gUser) {
                    if (gUser) {
                        cb(null, gUser.token);
                    }
                    else cb(null, false);
                });
            },
            facebook_token: function (cb) {
                req.user.getFacebook().then(function (fUser) {
                  if (fUser) {
                      cb(null, fUser.token);
                  }
                  else cb(null, false);
                })
            }
        }, function (err, results) {
            console.log('tokens: ', results);
            req.session.currentVersion = 'fingertips'
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'fingertips.handlebars',
                register_version: 'none',
                google_token: results.google_token,
                facebook_token: results.facebook_token
            });
        });
    }
    else res.redirect('/signin');
});

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