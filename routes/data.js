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

var platform = require('../controllers/platform')
var insights = require('../controllers/insights')

var facebookProcessor = require('../controllers/facebook-process')
var googleAnalyticsProcessor = require('../controllers/google-analytics-process')

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

    userInfo.getConnectedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        googleAnalyticsProcessor.process(accountResults.googleUser, function( err, results ) {

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

    userInfo.getConnectedAccountsFromId(userId, function( err, results ) {

        var accountResults = results;

        Async.parallel({

            google_analytics: ( cb ) => {

                googleAnalyticsProcessor.process(accountResults.googleUser, function( err, results ) {

                    cb ( null, results )

                })

            },

            facebook: ( cb ) => {

                facebookProcessor.process(accountResults.facebookUser, function( err, results ) {
                   
                    cb ( null, results )

                })


            },


        }, function( err, results ) {

            //console.log( emoji.get("moneybag"), 'Google Analytics>>>', results.google_analytics.dataSource.metric_assets )
            //console.log( emoji.get("moneybag"), 'Facebook>>>', results.facebook.dataSource.metric_assets )

            var dataSources = {}
            _.forEach ( results, function( dataSource, index ) {
                dataSources[index] = dataSource.dataSource;
            })

            // now that we have the data sources set, move to platform
            var platformData = platform.setPlatform( dataSources )

            // now that we have platform, get insights.
            var allInsights = insights.getInsights( platformData, dataSources )

            res.render('fingertips', {
                version: 'fingertips',
                layout: 'data.handlebars',
                accountResults: accountResults,
                user: accountResults.user,
                platform : platformData,
                insights : allInsights
            });

        })

        

    })



    
});


module.exports = router