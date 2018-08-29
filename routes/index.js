let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
let apiControllers = require('../controllers/apis');

var colors = require('colors');
var emoji = require('node-emoji')

var google_data = function (user, done) {
    Async.waterfall([
        function (cb) {
            user.getGoogle().then(function (gUser) {
                if (gUser) {
                    cb(null, gUser)
                }
                else cb({error: 'User is not connected with Google'}, false)
            });
        }, function (gUser, cb) {
            if (gUser.view_id && gUser.property_id && gUser.account_id) {
                apiControllers.getGoogleMatrics(gUser, function (err, data) {
                    cb(null, {metric_data: data, dialog_data: null});
                });
            }
            else {
                apiControllers.getGoogleSummaries(gUser, function (err, data) {
                    cb(null, {dialog_data: data, metric_data: null})
                });
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err.error);
        }
        done(result);
    })
}

var facebook_data = function (user, cb) {
    Async.waterfall([
        function (cb) {
            user.getFacebook().then(function (fUser) {
                if (fUser) {
                    cb(null, fUser)
                }
                else cb({'error': 'User is not connected with Facebook'})
            })
        }, function (fUser, cb) {
            if (fUser.token && fUser.property_id && fUser.property_name) {
                apiControllers.getFacebookMetrics(fUser, function (err, data) {
                    cb(null, {metric_data: data, dialog_data: null});
                });
            }
            else {
                apiControllers.getFacebookSummaries(gUser, function (err, data) {
                    cb(null, {dialog_data: data, metric_data: null})
                });
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err.error);
        }
        done(result);
    })
}

router.get('/google/setprofile', function (req, res) {
    console.log(req.query);
    if (req.user) {
        if (req.query.view_id && req.query.account_id && req.query.property_id) {
            req.user.getGoogle().then(function (gUser) {
                gUser.updateAttributes({
                    view_id: req.query.view_id,
                    account_id: req.query.account_id,
                    property_id: req.query.property_id
                }).then(function (updatedResult) {
                    console.log(updatedResult);
                    res.redirect('/');
                })
            });
        }
        else res.redirect('/');
    }
    else res.redirect('signin');
})

router.get('/',  function (req, res) {
    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    
    if ( redirectTo !== "/") {
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {
        Async.parallel({
            google_data: function (cb) {

                google_data(req.user, function (data) {
                    cb(null, data);
                })
            },
            
            facebook_data: function (cb) {
                req.user.getFacebook().then(function (fUser) {
                    if (fUser) {
                        apiControllers.getFacebookMetrics(fUser, function (err, data) {
                            cb(null, data);
                        });
                    }
                    else cb(null, false);
                })
            }
        }, function (err, results) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }

            console.log('\n', emoji.get("smile"), '***** Results: ', results);
            console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company_name);

            req.session.currentVersion = 'fingertips'
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'fingertips.handlebars',
                register_version: 'none',
                user : req.user,
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

router.get('/schedule', function (req, res, next) {
    if (req.user) {
        req.user.getMeetings().then(function (meetings) {
            console.log('==========meeting==========');
            
            res.render('schdule_jobs', {
                meetings: meetings,
                layout: false
            })
        });
    }
    else res.redirect('/signin');
});

router.get('/allschedule', function (req, res, next) {
    /*if (req.user) {*/
        Model.Meeting.findAll({}).then(function (meetings) {
            res.render('schdule_jobs', {
                meetings: meetings,
                layout: false
            })
        });
   /* }
    else res.redirect('/signin');*/
});


module.exports = router