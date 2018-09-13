let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-api');

var colors = require('colors');
var emoji = require('node-emoji')

var userInfo = require('../controllers/users')

var facebookProcessor = require('../controllers/facebook-process')
var googleProcessor = require('../controllers/google-process')


router.get('/data/google/:company',  function (req, res) {
    
    var userId = req.params.company ? req.params.company : req.user.id

    if ( req.params.company == "loggedin") {

       if ( req.user ) {
           userId = req.user.id
        } else {
            req.session.redirectTo = "/data/google/loggedin"
            res.redirect('/signin');
            return
       }

    }

    userInfo.getConnectedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        googleProcessor.process(accountResults.googleUser, function( err, results ) {

            console.log(results.metrics.both)

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: accountResults,
                user: accountResults.user,
                googleUser: accountResults.googleUser,
                facebookUser: null,
                metrics : results.metrics.both,
                dateRange : results.metrics.both.dateRange,
                metricsTable : results.metricsTable
            });

        })

    })



    
});


router.get('/data/facebook/:company',  function (req, res) {
    
    var userId = req.params.company ? req.params.company : req.user.id

    if ( req.params.company == "loggedin") {

       if ( req.user ) {
           userId = req.user.id
        } else {
            req.session.redirectTo = "/data/facebook/loggedin"
            res.redirect('/signin');
            return
       }

    }

    userInfo.getConnectedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        facebookProcessor.process(accountResults.facebookUser, function( err, results ) {

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: accountResults,
                user: accountResults.user,
                googleUser: null,
                facebookUser: accountResults.facebookUser,
                metrics : results.metrics,
                dateRange : results.metrics.current.dateRange,
                postsTable : results.postsTable,
                metricsTable : results.metricsTable
            });

        })

    })
    
});


module.exports = router