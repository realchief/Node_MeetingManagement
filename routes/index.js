let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
let apiControllers = require('../controllers/apis');

router.get('/',  function (req, res) {

    if (req.user) {
        Async.parallel({
            google_data: function (cb) {
                req.user.getGoogle().then(function (gUser) {
                    if (gUser) {
                         apiControllers.getGoogleMatrics(gUser, function (err, data) {
                             cb(null, data);
                         });
                        //cb(null, true);
                    }
                    else cb(null, false);
                });
            },
            facebook_data: function (cb) {
                req.user.getFacebook().then(function (fUser) {
                    if (fUser) {
                        apiControllers.getFacebook(fUser, function (err, data) {
                            cb(null, data);
                        });
                    }
                    else cb(null, false);
                })
            }
        }, function (err, results) {
            
            console.log('***** Error: ', err);
             console.log('***** Results: ', results);


            req.session.currentVersion = 'fingertips'
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'fingertips.handlebars',
                register_version: 'none',
                google_data: results.google_data,
                facebook_data: results.facebook_data
            });
        
        });
    }
    else res.redirect('/signin');
});


router.get('/frontend', function(req, res, next) {
            req.session.currentVersion = 'fingertips'
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'frontend.handlebars'
            });
        
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