let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-api');

var colors = require('colors');
var emoji = require('node-emoji')

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
                googleApi.getAccountListOrSelectView(req.user, function (err, data) {
                    cb(null, data);
                })
            },
            
            facebook_summaries: function (cb) {
                facebookApi.getAccountListOrSelectView(req.user, function (err, data) {
                    cb(null, data);
                })
            }
        }, function (err, results) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }

            console.log('\n', emoji.get("smile"), '***** Results: ', results);
            //console.log('\n', emoji.get("smile"), '***** Google data in Results: ', results.google_summaries);
            //console.log('\n', emoji.get("smile"), '***** Facebook data in Results: ', results.facebook_summaries);
            console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company_name);

            
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
            
            res.render('fingertips', {
                version: 'fingertips',
                layout: 'frontend.handlebars'
            });
        
});


module.exports = router