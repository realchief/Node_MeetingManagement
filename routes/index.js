let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

var userInfo = require('../controllers/users')

var colors = require('colors');
var emoji = require('node-emoji')

router.get('/',  function (req, res) {

    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    
    if ( redirectTo !== "/") {

        if ( res.locals.sessionFlash ) {
            req.session.sessionFlash = res.locals.sessionFlash
        } 
        
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {

        //console.log('\n', emoji.get("smile"), '***** Results: ', results);
        console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company.company_name);

        res.render('fingertips', {
            version: 'fingertips',
            layout: 'fingertips.handlebars',
            user : req.user,
        });

    }

    else res.redirect('/signin');
});



router.get('/data-sources',  function (req, res) {

    var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/data-sources';
    
    if ( redirectTo !== "/data-sources") {

        if ( res.locals.sessionFlash ) {
            req.session.sessionFlash = res.locals.sessionFlash
        } 
        
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {

        userInfo.getSummaries(req.user.user_id, function ( err, summaries ) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }

            //console.log('\n', emoji.get("smile"), '***** Results: ', results);
            //console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company.company_name);

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data-sources.handlebars',
                user : req.user,
                summaries : summaries.accounts,
                numConnections: summaries.numberOfConnectedAccounts,
                numAccountLists: summaries.numberOfAccountLists
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