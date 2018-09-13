'use strict';
const Async = require('async');
const {
    google
} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const auth = require('../config/auth');
const moment = require('moment');
var dates = require('../controllers/dates');

var colors = require('colors');
var emoji = require('node-emoji');
var _ = require('lodash');


let oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
);

exports.getMetrics = (gUser, timeframe, cb) => {
    
    oauth2Client.credentials = {
        refresh_token: gUser.refresh_token,
        expiry_date: gUser.expiry_date,
        access_token: gUser.token,
        token_type: gUser.token_type,
        id_token: gUser.id_token
    }
    
    google.options({
        auth: oauth2Client
    });
    
     const analyticsreporting = google.analyticsreporting({
        version: 'v4',
    });

     const analytics = google.analytics({
        version: 'v3',
      });
    

     /* dates and timeframes */

    var defaultNumDays = 7
    var range = dates.getDateRangeNumDays(defaultNumDays);
    var dateWindow = dates.setDateWindow(range)

    var currentSince = moment( dateWindow.currentFromDate ).format( "YYYY-MM-DD" );
    var currentUntil = moment( dateWindow.currentToDate ).format( "YYYY-MM-DD" );
    var comparedSince = moment( dateWindow.comparedFromDate ).format( "YYYY-MM-DD" );
    var comparedUntil = moment( dateWindow.comparedToDate ).format( "YYYY-MM-DD" );

    var dateRanges = [
    {
      startDate: currentSince,
      endDate: currentUntil
    },
    {
     startDate: comparedSince,
      endDate: comparedUntil
    }
    ]
       

    Async.parallel({

        gaColumns: ( cb ) => {

            analytics.metadata.columns.list({
                'reportType': 'ga'

            
            }, function (err, response) {

            
                if (err) {
                    console.log('Google API error:', err);
                    return;
                }

                let gaColumns = {};

                if (typeof response.data.items !== 'undefined') {

                    for (var i = 0; i < response.data.items.length; i++) {
                        let column = response.data.items[i];
                        gaColumns[column.id] = column.attributes;
                    }


                }

                cb(null, gaColumns);
                //cb(null, null);
            });
        },

        goals : ( cb ) => {

            /* GOALS ==== */
            
            Async.waterfall([

                function ( cb ) {

                    analytics.management.goals.list({
                      'accountId': gUser.account_id,
                      'webPropertyId': gUser.property_id,
                      'profileId': gUser.view_id },
                       
                        function (err, response) {

                            if (err) {
                                console.log('Google API error:', err);
                                cb(err);
                            }

                            var goals = [];
                            var metrics = [];

                            if ( typeof response.data != 'undefined') {

                                //console.log(response.result.items)

                                _.each( response.data.items, function(goal, index) {
                                    
                                    var details = ""
                                    if (goal.urlDestinationDetails) {
                                        details = goal.urlDestinationDetails
                                        } else if (goal.eventDetails) {
                                        details = goal.eventDetails
                                    }

                                    goals.push( {
                                        id : goal.id,
                                        name : goal.name,
                                        type : goal.type,
                                        details : details
                                    })

                                    metrics.push( {  
                                        metricName: 'ga:goal' + goal.id + 'Completions',
                                        name : goal.name
                                    })

                            })
                        
                            cb(null, { 
                                goals : goals, 
                                metricsList : metrics 
                            });        

                            //console.log('Google API goals response:', goals, metrics)                      
                        }
                    });

                },

                function ( goalsObject ) {

                    var goalExpressions = [];

                    // console.log("\n", emoji.get("medal"), '>>>>>> google goals list:', goalsObject.goals )
     
                    _.forEach( goalsObject.metricsList, function( goal, index ) {
                        goalExpressions.push( { 
                            expression: goal.metricName,
                            //alias : goal.name
                        })
                    })

                    goalExpressions = goalExpressions.slice(0,9)

                    goalExpressions.push( { 
                       expression: 'ga:goalCompletionsAll', 
                       //alias: 'All Completions' 
                    })

                    analyticsreporting.reports.batchGet({
                        "requestBody": {
                            reportRequests: [
                                
                                {
                                "viewId" : gUser.view_id,
                                "dateRanges" : dateRanges,
                                "metrics" : goalExpressions.slice(0,10),
                                 pageSize : 10,
                                includeEmptyRows : 'true'
                              },

                              {
                                "viewId" : gUser.view_id,
                                "dateRanges" : dateRanges,
                                 "metrics" : [
                                    { expression: 'ga:transactionRevenue' },
                                    { expression: 'ga:transactions' },
                                    
                                ],
                                 pageSize : 200,
                                includeEmptyRows : 'true'
                              },

                              {
                                "viewId" : gUser.view_id,
                                "dateRanges" : dateRanges,
                                 "dimensions" : [
                                    { "name" : "ga:productName" },
                               ],
                                 "metrics" : [
                                    { expression: 'ga:itemRevenue' },
                                    
                                ],
                                 "orderBys" : [
                                    {
                                      fieldName : "ga:itemRevenue",
                                      sortOrder : 'DESCENDING',
                                     // orderType : "DELTA"
                                    }
                                 ],

                                 pageSize : 200,
                                includeEmptyRows : 'true'
                              }

                            ]
                        }
                    }, function ( err, response ) {

                        response.goals = goalsObject.goals
                        response.metricsList = goalsObject.metricsList
                        cb ( null, response )

                    })

                    

                }

            ], function ( err, result ) {

                cb( null, result )

            })
        },

        metrics : ( cb ) => {

            /* METRICS ==== */

            analyticsreporting.reports.batchGet({
                "requestBody": {
                    reportRequests: [

                        {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                "dimensions" : [],
                "metrics" : [
                    { expression: 'ga:pageviews' },
                    { expression: 'ga:users' },
                    { expression: 'ga:entrances' },
                    { expression: 'ga:sessions' },
                    { expression: 'ga:exits' },
                    { expression: 'ga:bounceRate' },
                    { expression: 'ga:avgSessionDuration' },
                    { expression: 'ga:sessionDuration' },
                    { expression: 'ga:avgTimeOnPage' },
                    { expression: 'ga:timeOnPage' },

                ],
                 "orderBys" : [],
               
              pageSize : 1
              },


              {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                "dimensions" : [
                    { "name" : "ga:hostname" },
                ],
                "metrics" : [
                    { expression: 'ga:sessions' },
               
                ],
                 "orderBys" : [
                 {
                      fieldName : "ga:sessions",
                      sortOrder : 'DESCENDING',
                    },
                ],
               
              pageSize : 1
              },


                    ]
                }}, function ( err, response ) {
              
                if (err) {
                    console.log('Google API error:', err);
                }

                cb(null, response);
                //console.log('Google API Metrics response:', response.data.reports)

            })
        },

        events : ( cb ) => {

            /* METRICS ==== */

            analyticsreporting.reports.batchGet({
                "requestBody": {
                    reportRequests: [{
                         "viewId": gUser.view_id,
                         "dateRanges": dateRanges,
                         "dimensions": [{
                             "name": "ga:eventCategory"
                         }, ],
                         "metrics": [{
                             expression: 'ga:eventValue'
                         }, ],
                         "dimensionFilterClauses": [{
                             "filters": [{
                                 "dimensionName": "ga:eventCategory",
                                 "operator": "REGEXP",
                                 "expressions": ["Riveted"]
                             }]
                         }],
                         pageSize: 20,
                         "orderBys": [{
                             fieldName: "ga:eventValue",
                             sortOrder: 'DESCENDING',
                             orderType: "VALUE"
                         }, ]
                     }]
                }}, function ( err, response ) {
              
                if (err) {
                    console.log('Google API error:', err);
                }

                cb(null, response);
                //console.log('Google API Metrics response:', response.data.reports)

            })
        },
          
        lists : ( cb ) => {

            /* METRICS ==== */

            analyticsreporting.reports.batchGet({
                "requestBody": {
                    reportRequests: [

                        {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                 "dimensions" : [
                    //{ "name" : "ga:pageTitle" },
                    { "name" : "ga:pagePath"}
               ],
                "metrics" : [
                    { expression: 'ga:pageviews' },
                    { expression: 'ga:sessions' },
                    { expression: 'ga:entrances' },
                    { expression: 'ga:newUsers' },
                    { expression: 'ga:bounceRate' },
                    { expression: 'ga:avgTimeOnPage' },                 
                    { expression: 'ga:timeOnPage' },           
                ],
                 pageSize : 100,
                 "orderBys" : [
                    {
                      fieldName : "ga:pageviews",
                      sortOrder : 'DESCENDING',
                      //orderType : "DELTA"
                    },
                 ]
              },


              //https://developers.google.com/analytics/devguides/reporting/core/v4/basics#filtering

             
              {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                 "dimensions" : [
                    //{ "name" : "ga:pageTitle" },
                    { "name" : "ga:pagePath"},
                    { "name" : "ga:userType" },
               ],
                "metrics" : [
                    { expression: 'ga:sessions' },
                ],
                 pageSize : 200,
                 "orderBys" : [
                    {
                      fieldName : "ga:sessions",
                      sortOrder : 'DESCENDING',
                      //orderType : "DELTA"
                    },
                 ],
                "dimensionFilterClauses": [{
                      "filters": [{
                          "dimensionName": "ga:userType",
                          "operator": "REGEXP",
                          "expressions" : ["Returning"]
                      }]
                  }]
              },


              {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                 "dimensions" : [
                    { "name" : "ga:userType" },
               ],
                "metrics" : [
                    //{ expression: 'ga:users' },
                    { expression: 'ga:sessions' },
                    { expression: 'ga:bounceRate' }                 
                ],
                 pageSize : 20,
                 "orderBys" : [
                    {
                      fieldName : "ga:sessions",
                      sortOrder : 'DESCENDING'
                    },
                 ]
              },

            {
                "viewId" : gUser.view_id,
                "dateRanges" : dateRanges,
                 "dimensions" : [
                    { "name" : "ga:channelGrouping" },
               ],
                "metrics" : [
                    //{ expression: 'ga:users' },
                    { expression: 'ga:sessions' },
                    { expression: 'ga:bounceRate' }                 
                ],
                 pageSize : 20,
                 "orderBys" : [
                    {
                      fieldName : "ga:sessions",
                      sortOrder : 'DESCENDING',
                     // orderType : "DELTA"
                    },
                 ]
              },  

                    ]
                }}, function ( err, response ) {
              
                    if (err) {
                        console.log('Google API error:', err);
                    }

                    cb(null, response);
                //console.log('Google API Metrics response:', response.data.reports)

                })
        },     



         matchups: function ( cb ) {
             analyticsreporting.reports.batchGet({
                "requestBody": {
                     reportRequests: [
                         {
                            "viewId" : gUser.view_id,
                            "dateRanges" : dateRanges,
                             "dimensions" : [
                                //{ "name" : "ga:pageTitle" },
                                { "name" : "ga:pagePath" },
                                { "name" : "ga:pageTitle" },
                                { "name" : "ga:hostname" }
                           ],
                            "metrics" : [
                                { expression: 'ga:pageviews' },
                            ],
                             pageSize : 200,
                             "orderBys" : [
                                {
                                  fieldName : "ga:pageviews",
                                  sortOrder : 'DESCENDING',      
                                },
                             ]
                          },
                     ]
                 }
        
        
             }, function( err, response ){

                cb(null, response);
             
             })
         
         }
    }, function (err, responses) {

        var resultsObject = {
            responses : responses,
            dateRange : range,
            timeframe : timeframe,
            dateWindow : dateWindow
        }

        cb(err, resultsObject);

    });
}

exports.getAllMetrics = ( gUser, cb ) => {

    var thisModule = this

    Async.parallel({

        metrics : ( cb ) => {

            Async.parallel({

                both : ( cb ) => {

                    thisModule.getMetrics(gUser, 'both', function( err, response ) {
                        cb( null, response )
                    })

                },

            }, function( err, results ) {

                var metricTimeframes = {
                    both: results.both,
                }

                cb( null, metricTimeframes )

            })
           

        }

    }, function( err, results ) {

        /* returns {
        results.metrics.current
        results.metrics.compared
        } */

        cb( null, results )

    })


}

exports.getAccountList = (gUser, cb) => {

    oauth2Client.credentials = {
        refresh_token: gUser.refresh_token,
        expiry_date: gUser.expiry_date,
        access_token: gUser.token,
        token_type: gUser.token_type,
        id_token: gUser.id_token
    }
    google.options({
        auth: oauth2Client
    });
    Async.parallel({
        users: function ( cb ) {

            google.analytics('v3').management.accountSummaries.list(function (err, response) {

                if (err) {
                    console.log('Google API error:', err);
                    return;
                }

                // console.log('get google data - account all', response.data)

                if (response && !response.error) {
                    // console.log('get google data - account summary', response.data)
                    var data = [];
                    for (var i = 0; i < response.data.items.length; i++) {
                        var datum = {
                            account_name: response.data.items[i].name,
                            account_id: response.data.items[i].id,
                            web_properties: []
                        };
                        for (var j = 0; j < response.data.items[i].webProperties.length; j++) {
                            var property = {
                                property_id: response.data.items[i].webProperties[j].id,
                                internal_id: response.data.items[i].webProperties[j].internalWebPropertyId,
                                property_name: response.data.items[i].webProperties[j].name,
                                views: []
                            }
                            for (var k = 0; k < response.data.items[i].webProperties[j].profiles.length; k++) {
                                var view = {
                                    view_id: response.data.items[i].webProperties[j].profiles[k].id,
                                    view_name: response.data.items[i].webProperties[j].profiles[k].name
                                };
                                property.views.push(view);
                            }
                            datum.web_properties.push(property);
                        }
                        data.push(datum);
                    }
                    cb(null, data);
                } else {
                    // console.log('get google data - account summary error', response.data)
                    cb(null, response);
                }
            });
        }
    }, function (err, data) {
        console.log('Google Users ',
            data.users
        );
        cb(null, data)
    });
};


exports.getAccountListOrSelectView = function (user, cb) {
    Async.waterfall([
        function ( cb ) {
            user.getGoogle().then(function (gUser) {
                if (gUser) {
                    cb(null, gUser)
                }
                else cb({error: 'User is not connected with Google'}, false)
            });
        }, function (gUser, cb) {
            if (gUser.view_id && gUser.property_id && gUser.account_id) {               
                cb(null, {
                    chosen_account: {
                        view_name: gUser.view_name,
                        account_name: gUser.account_name,
                        property_name: gUser.property_name,
                        email: gUser.email
                    }, 
                    account_list: null
                });
            }
            else {
                googleApi.getAccountList(gUser, function (err, data) {
                    console.log('There is no gUser data');
                    cb(null, {
                        account_list: data, 
                        user : gUser,
                        chosen_account: null
                    })
                });
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err.error);
        }
        cb(err, result);
    })
}


exports.checkToken = (req, res, next) => {

    //console.log('checking google token')

    // check for user
    if (!req.user) {
        return next();
    }
    req.user.getGoogle().then(function (gUser) {

        if ( gUser ) {
            console.log("\n", emoji.get("rain_cloud"), '>>>>>> google refresh token:', gUser.refresh_token, 'seconds before expiry', moment().subtract(gUser.expiry_date, "s").format("X"))
        }

        if (gUser && moment().subtract(gUser.expiry_date, "s").format("X") > -300) {
            // subtract current time from stored expiry_date and see if less than 5 minutes (300s) remain
            console.log('we passed the expiry_date and trying to update google access token')

            oauth2Client.setCredentials({
                access_token: gUser.token,
                refresh_token: gUser.refresh_token
            });

            oauth2Client.refreshAccessToken(function (err, tokens) {

                if (err) {
                    console.log('Refresh Token Error>>>', err)
                    return next(err);
                }

                console.log('trying to update google access token', tokens)

                // google returns timestamp with milliseconds, so fix that //
                var expiry_date = parseInt(tokens.expiry_date / 1000)

                gUser.updateAttributes({
                    token: tokens.access_token,
                    expiry_date: expiry_date
                }).then(function (result) {
                    console.log('token updated!');
                    next();
                });
            });
        } else next();
    });
};



