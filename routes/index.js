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
        delete req.session.redirectTo;
        res.redirect(redirectTo);
        return
    }

    if (req.user) {

        userInfo.getSummaries(req.user.company_id, function ( err, summaries ) {
            
            if (err) {
                console.log('***** Error: ', err);
                return;
            }
            
            //console.log('\n', emoji.get("smile"), '***** Results: ', results);
            console.log('\n', emoji.get("smile"), '***** User: ', req.user.username, req.user.email, req.user.company_name);

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'fingertips.handlebars',
                user : req.user,
                summaries : summaries.accounts
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