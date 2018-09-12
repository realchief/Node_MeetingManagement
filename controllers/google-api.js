'use strict';
const Async = require('async');
const {
    google
} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const auth = require('../config/auth');
const moment = require('moment');

var colors = require('colors');
var emoji = require('node-emoji');
var _ = require('lodash');


let oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
);

exports.getMetrics = (gUser, done) => {
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
    
    var currentSince = moment().subtract(5, 'days').format( "YYYY-MM-DD" );
    var currentUntil = moment().format( "YYYY-MM-DD" );

    
    var comparedSince = moment().subtract(5, 'days').format( "YYYY-MM-DD" );
    var comparedUntil = moment().format( "YYYY-MM-DD" );
    
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
        metrics : (cb) => {

            /* METRICS ==== */

            const analyticsreporting = google.analyticsreporting({
                version: 'v4',
            });

            var currentSince = moment('2018-08-14').format( "YYYY-MM-DD" );
            var currentUntil = moment('2018-08-20').format( "YYYY-MM-DD" );
            var comparedSince = moment( '2018-08-07' ).format( "YYYY-MM-DD" );
            var comparedUntil = moment( '2018-08-13' ).format( "YYYY-MM-DD" );

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

            analyticsreporting.reports.batchGet({
                "requestBody": {
                    reportRequests: [{
                        viewId: gUser.view_id,
                        dateRanges: dateRanges,
                        metrics: [
                            {
                            expression: 'ga:users'
                            }
                        ]
                    }]
                }}, function ( err, response ) {
              
                if (err) {
                    console.log('Google API error:', err);
                }

                cb(null, response.data.reports);
                //console.log('Google API Metrics response:', response.data.reports)

            })
        },
          
        // events: function (cb) {
        //     google.reportRequests({
        //         path: '/v4/reports:batchGet',
        //         root: 'https://analyticsreporting.googleapis.com/',
        //         method: 'POST',
        //         body: {
        //             reportRequests: [{
        //                 "viewId": gUser.view_id,
        //                 "dateRanges": dateRanges,
        //                 "dimensions": [{
        //                     "name": "ga:eventCategory"
        //                 }, ],
        //                 "metrics": [{
        //                     expression: 'ga:eventValue'
        //                 }, ],
        //                 "dimensionFilterClauses": [{
        //                     "filters": [{
        //                         "dimensionName": "ga:eventCategory",
        //                         "operator": "REGEXP",
        //                         "expressions": ["Riveted"]
        //                     }]
        //                 }],
        //                 pageSize: 20,
        //                 "orderBys": [{
        //                     fieldName: "ga:eventValue",
        //                     sortOrder: 'DESCENDING',
        //                     orderType: "VALUE"
        //                 }, ]
        //             }, ]
        //         }
        //     }).then(function (response) {
        //         cb(null, response)
        //     })
        // },
        // lists: function (cb) {
        //     google.reportRequests({
        //         path: '/v4/reports:batchGet',
        //         root: 'https://analyticsreporting.googleapis.com/',
        //         method: 'POST',
        //         body: {
        //             reportRequests: [

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [
        //                         //{ "name" : "ga:pageTitle" },
        //                         {
        //                             "name": "ga:pagePath"
        //                         }
        //                     ],
        //                     "metrics": [{
        //                             expression: 'ga:pageviews'
        //                         },
        //                         {
        //                             expression: 'ga:sessions'
        //                         },
        //                         {
        //                             expression: 'ga:entrances'
        //                         },
        //                         {
        //                             expression: 'ga:newUsers'
        //                         },
        //                         {
        //                             expression: 'ga:bounceRate'
        //                         },
        //                         {
        //                             expression: 'ga:avgTimeOnPage'
        //                         },
        //                         {
        //                             expression: 'ga:timeOnPage'
        //                         },
        //                     ],
        //                     pageSize: 100,
        //                     "orderBys": [{
        //                         fieldName: "ga:pageviews",
        //                         sortOrder: 'DESCENDING',
        //                         //orderType : "DELTA"
        //                     }, ]
        //                 },

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [
        //                         //{ "name" : "ga:pageTitle" },
        //                         {
        //                             "name": "ga:pagePath"
        //                         },
        //                         {
        //                             "name": "ga:userType"
        //                         },
        //                     ],
        //                     "metrics": [{
        //                         expression: 'ga:sessions'
        //                     }, ],
        //                     pageSize: 200,
        //                     "orderBys": [{
        //                         fieldName: "ga:sessions",
        //                         sortOrder: 'DESCENDING',
        //                         //orderType : "DELTA"
        //                     }, ],
        //                     "dimensionFilterClauses": [{
        //                         "filters": [{
        //                             "dimensionName": "ga:userType",
        //                             "operator": "REGEXP",
        //                             "expressions": ["Returning"]
        //                         }]
        //                     }]
        //                 },


        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [{
        //                         "name": "ga:userType"
        //                     }, ],
        //                     "metrics": [
        //                         //{ expression: 'ga:users' },
        //                         {
        //                             expression: 'ga:sessions'
        //                         },
        //                         {
        //                             expression: 'ga:bounceRate'
        //                         }
        //                     ],
        //                     pageSize: 20,
        //                     "orderBys": [{
        //                         fieldName: "ga:sessions",
        //                         sortOrder: 'DESCENDING'
        //                     }, ]
        //                 },

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [{
        //                         "name": "ga:channelGrouping"
        //                     }, ],
        //                     "metrics": [
        //                         //{ expression: 'ga:users' },
        //                         {
        //                             expression: 'ga:sessions'
        //                         },
        //                         {
        //                             expression: 'ga:bounceRate'
        //                         }
        //                     ],
        //                     pageSize: 20,
        //                     "orderBys": [{
        //                         fieldName: "ga:sessions",
        //                         sortOrder: 'DESCENDING',
        //                         // orderType : "DELTA"
        //                     }, ]
        //                 },

        //             ]
        //         }
        //     }).then(function (response) {
        //         cb(null, response)
        //     })
        // },

        goals : (cb) => {

            /* GOALS ==== */
            
            google.analytics('v3').management.goals.list({
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
                    cb(null, { goals : goals, metricNames : metrics });                              
                }
                if (response.error) {
                    cb (null, {error: response.error})
                }
                //console.log('Google API goals response:', goals, metrics)
            });
        },

        // matchups: function (cb) {
        //     google.reportRequests({
        //         path: '/v4/reports:batchGet',
        //         root: 'https://analyticsreporting.googleapis.com/',
        //         method: 'POST',
        //         body: {
        //             reportRequests: [
        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [
        //                         //{ "name" : "ga:pageTitle" },
        //                         {
        //                             "name": "ga:pagePath"
        //                         },
        //                         {
        //                             "name": "ga:pageTitle"
        //                         },
        //                         {
        //                             "name": "ga:hostname"
        //                         }
        //                     ],
        //                     "metrics": [{
        //                         expression: 'ga:pageviews'
        //                     }, ],
        //                     pageSize: 200,
        //                     "orderBys": [{
        //                         fieldName: "ga:pageviews",
        //                         sortOrder: 'DESCENDING',
        //                     }, ]
        //                 },

        //             ]
        //         }
        //     }).then(function (response) {
        //         cb(null, response)
        //     })
        // }
    }, function (err, result) {
        done(err, result);
    });

}

exports.getSummaries = (gUser, cb) => {

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
        users: function (done) {

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
                    done(null, data);
                } else {
                    // console.log('get google data - account summary error', response.data)
                    done(null, response);
                }
            });
        },
        gaColumns: function (done) {
            google.analytics('v3').metadata.columns.list({
                'reportType': 'ga'
            }, function (err, response) {

                //console.log('get google data - columns all', response.data)

                if (err) {
                    console.log('Google API error:', err);
                    return;
                }

                let gaColumns = {};

                if (typeof response.items !== 'undefined') {

                    for (var i = 0; i < response.items.length; i++) {
                        let column = response.result.items[i];
                        gaColumns[column.id] = column.attributes;
                    }


                }
                done(null, response.data);
            });
        }
    }, function (err, data) {
        console.log('Google Users ',
            data.users
        );
        cb(null, data)
    });


};

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

