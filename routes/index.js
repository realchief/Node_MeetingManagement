let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-api');

var colors = require('colors');
var emoji = require('node-emoji')

var google_summaries = function (user, done) {
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
                cb(null, {display_content: {
                    view_name: gUser.view_name,
                    account_name: gUser.account_name,
                    property_name: gUser.property_name,
                    email: gUser.email
                }, dialog_content: null});
            }
            else {
                googleApi.getSummaries(gUser, function (err, data) {
                    console.log('There is no gUser data');
                    cb(null, {dialog_content: data, display_content: null})
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

var facebook_summaries = function (user, done) {
    Async.waterfall([
        function (cb) {
            user.getFacebook().then(function (fUser) {
                if (fUser) {
                    cb(null, fUser)
                }
                else cb({'error': 'User is not connected with Facebook'})
            })
        }, function (fUser, cb) {
            if (fUser.account_id && fUser.account_name && fUser.account_token) {
                cb(null, {display_content: {
                    account_name: fUser.account_name,
                    email: fUser.email
                }, dialog_content: null});
            }
            else {
                facebookApi.getSummaries(fUser, function (data) {
                    cb(null, {dialog_content: data, display_content: null})
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

router.get('/',  function (req, res) {
    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    
    if ( redirectTo !== "/") {
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {
        Async.parallel({
            google_summaries: function (cb) {
                google_summaries(req.user, function (data) {
                    cb(null, data);
                })
            },
            
            facebook_summaries: function (cb) {
                facebook_summaries(req.user, function (data) {
                    cb(null, data);
                })
            }
        }, function (err, results) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }

            console.log('\n', emoji.get("smile"), '***** Results: ', results);
            console.log('\n', emoji.get("smile"), '***** Google data in Results: ', results.google_summaries);
            console.log('\n', emoji.get("smile"), '***** Facebook data in Results: ', results.facebook_summaries);
            console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company_name);

            req.session.currentVersion = 'fingertips'
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'fingertips.handlebars',
                register_version: 'none',
                user : req.user,
                google_summaries: results.google_summaries,
                facebook_summaries: results.facebook_summaries
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


module.exports = router