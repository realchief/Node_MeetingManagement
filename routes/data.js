let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');

let facebookApi = require('../controllers/facebook-api');
let googleApi = require('../controllers/google-analytics-api');

var colors = require('colors');
var emoji = require('node-emoji')

var userInfo = require('../controllers/users')

var facebookMetrics = require('../controllers/facebook-metrics')
var googleAnalyticsMetrics = require('../controllers/google-analytics-metrics')

var _ = require('lodash');

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

    userInfo.getLinkedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        googleAnalyticsMetrics.process(accountResults.googleUser, function( err, results ) {

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: accountResults,
                user: accountResults.user,
                googleUser: accountResults.googleUser,
                facebookUser: null,
                metrics : results.metrics.both,
                dateRange : results.metrics.both.dateRange,
                metricsTable : results.metricsTable,
                dataSource : results.dataSource
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

    userInfo.getLinkedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        facebookMetrics.process(accountResults.facebookUser, function( err, results ) {

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
                metricsTable : results.metricsTable,
                dataSource : results.dataSource
            });

        })

    })
    
});


router.get('/data/combined/:company',  function (req, res) {
    
    var userId = req.params.company ? req.params.company : req.user.id

    if ( req.params.company == "loggedin") {

       if ( req.user ) {
           userId = req.user.id
        } else {
            req.session.redirectTo = "/data/combined/loggedin"
            res.redirect('/signin');
            return
       }

    }

    userInfo.getLinkedAccountsFromId( userId, function( err, credentials ) {

        userInfo.getMetricsFromLinkedAccounts( credentials, function( err, metrics ) {

            userInfo.getInsightsFromMetrics( metrics, function( err, results ) {

                console.log( "\n", emoji.get("moneybag"), 'Combined insights made from', results.dataSourcesList.join(','), 'for user:', credentials.user.username, 'company id:', credentials.user.company_id )

                res.render('fingertips', {
                    version: 'fingertips',
                    layout: 'data.handlebars',
                    accountResults: credentials,
                    user: credentials.user,
                    platform : results.platforms,
                    insights : results.insights
                });

            })

        })

    })

});


module.exports = router