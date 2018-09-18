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

    userInfo.getLinkedAccountsFromId(userId, function( err, credentials ) {

        if ( !credentials.accounts.google_analytics ) {
            res.send('No Google Analytics Account')
            return
        }

        var googleAnalyticsMetrics = require('../controllers/google-analytics-metrics')
        googleAnalyticsMetrics.process(credentials.accounts.google_analytics, function( err, results ) {

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: credentials,
                user: credentials.user,
                googleAccount: credentials.accounts.google_analytics,
                facebookAccount: null,
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

    userInfo.getLinkedAccountsFromId(userId, function( err, credentials ) {

        if ( !credentials.accounts.facebook ) {
            res.send('No Facebook Account')
            return
        }

        var facebookMetrics = require('../controllers/facebook-metrics')
        facebookMetrics.process(credentials.accounts.facebook, function( err, results ) {

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: credentials,
                user: credentials.user,
                googleAccount: null,
                facebookAccount: credentials.accounts.facebook,
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