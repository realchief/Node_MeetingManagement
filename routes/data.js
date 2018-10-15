let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');


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

            if ( err ) {

                console.log("\n", emoji.get("bangbang"), emoji.get("bangbang"), emoji.get("bangbang"), emoji.get("bangbang"), 'google analytics metrics process from /data/google/:company', err.message);

                res.send( err.message )

            } else {

                res.render('data', {
                    layout: 'main',
                    accountResults: credentials,
                    user: credentials.user,
                    googleAccount: credentials.accounts.google_analytics,
                    facebookAccount: null,
                    metrics : results.metrics.both,
                    dateRange : results.metrics.both.dateRange,
                    metricsTable : results.metricsTable,
                    dataSource : results.dataSource
                });

            }

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

            res.render('data', {
                layout: 'main',
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

    userInfo.getInsightsFromId( userId, function( err, results ) {

        if ( err ) {

            console.log("\n", emoji.get("bangbang"), emoji.get("bangbang"), emoji.get("bangbang"), emoji.get("bangbang"), 'metrics process from /data/combined/:company', err.message);

                res.send( err.message )

        } else {

            console.log( "\n", emoji.get("moneybag"), 'Display insights', results.results.dataSourcesList.join(','), 'for user:', results.credentials.user.username, 'company id:', results.credentials.user.user_id )

            res.render('data', {
                layout: 'main',
                accountResults: results.credentials,
                user: results.credentials.user,
                platform : results.results.platforms,
                insights : results.results.insights
            });

        }
        

    })


});


module.exports = router