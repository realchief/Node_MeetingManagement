let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-api');

var colors = require('colors');
var emoji = require('node-emoji')

router.get('/data/google',  function (req, res) {
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

            
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'googledata.handlebars',
                register_version: 'none',
                user : req.user,
                google_data: JSON.stringify(results.google_summaries)                
            });
        
        });
    }
    else res.redirect('/signin');
});


router.get('/data/facebook',  function (req, res) {
    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    
    if ( redirectTo !== "/") {
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {
        Async.parallel({        
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

            
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'facebookdata.handlebars',
                register_version: 'none',
                user : req.user,            
                facebook_data: JSON.stringify(results.facebook_summaries)
            });
        
        });
    }
    else res.redirect('/signin');
});


module.exports = router