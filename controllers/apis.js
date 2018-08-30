'use strict';
const Async = require('async');
const graph = require('fbgraph');
const {
    google
} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const auth = require('../config/auth');
const sgMail = require('@sendgrid/mail');
const schedule = require('node-schedule');
const moment = require('moment');

var colors = require('colors');
var emoji = require('node-emoji');



let oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
);

exports.getFacebookMetrics = (fUser, done) => {
    const token = fUser.token;

    var since = moment().format( "YYYY-MM-DD" );
    var until = moment().subtract(5, 'days').format( "YYYY-MM-DD" );

    var sinceForPosts = moment().format( "YYYY-MM-DD" );
    var untilForPosts = moment().subtract(5, 'days').format( "YYYY-MM-DD" );

    var facebookDatePreset = moment().format( "YYYY-MM-DD" );

    graph.setAccessToken(token);
    Async.parallel({
        fan: function (cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                fields : 'fan_count,engagement,global_brand_page_name,name,name_with_location_descriptor,posts'
            }, function(err, response) {
                console.log('err1:', err);
                cb(null, response);
            });
        },
        insights_aggregation: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
                period: 'day',
                date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err2:', err);
                cb(null, response);
            });
        },
        insights_daily: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
                period : 'day',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                cb(null, response);
            });
        },
        insights_lifetime: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                metric : 'page_fans',
			    period : 'lifetime',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                cb(null, response);
            });
        },
        insights_posts: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                limit : 50,
			    fields : 'created_time,message,id,type,link,permalink_url',
			    date_preset : facebookDatePreset,
			    since : sinceForPosts,
			    until : untilForPosts,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                cb(null, response);
            });
        },
        insights_28days: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'days_28',
                date_preset : facebookDatePreset,
                since : since,
                until : until,
                show_description_from_api_doc : 'true'
            }, function(err, response) {
                cb(null, response);
            });
        },
        insights_28days: function(cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
			    period : 'week',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                cb(null, response);
            });
        },
    },
    (err, data) => {
        done(null, data);
    });
};

exports.getFacebookSummaries = (fUser, done) => {
    const token = fUser.token;
    graph.setAccessToken(token);
    
    graph.get(`${fUser.profile_id}?fields=name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}`, (err, response) => {
        var data = [];
        for (var i = 0; i < response.accounts.data.length; i ++) {
            var datum = {
                'account_id': response.accounts.data[i].id,
                'account_name': response.accounts.data[i].global_brand_page_name,
                'account_token': response.accounts.data[i].access_token
            };
            data.push(datum)
        }
        done(data);
    });

}

exports.getGoogleMatrics = (gUser, done) => {
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
    var currentSince = moment().format( "YYYY-MM-DD" );
    var currentUntil = moment().subtract(5, 'days').format( "YYYY-MM-DD" );

    var comparedSince = moment().format( "YYYY-MM-DD" );
    var comparedUntil = moment().subtract(5, 'days').format( "YYYY-MM-DD" );
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
        metrices: function (cb) {
            google.reportRequests({
                path: '/v4/reports:batchGet',
                root: 'https://analyticsreporting.googleapis.com/',
                method: 'POST',
                body: {
                    reportRequests: [{
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [],
                            "metrics": [{
                                    expression: 'ga:pageviews'
                                },
                                {
                                    expression: 'ga:users'
                                },
                                {
                                    expression: 'ga:entrances'
                                },
                                {
                                    expression: 'ga:sessions'
                                },
                                {
                                    expression: 'ga:exits'
                                },
                                {
                                    expression: 'ga:bounceRate'
                                },
                                {
                                    expression: 'ga:avgSessionDuration'
                                },
                                {
                                    expression: 'ga:sessionDuration'
                                },
                                {
                                    expression: 'ga:avgTimeOnPage'
                                },
                                {
                                    expression: 'ga:timeOnPage'
                                },

                            ],
                            "orderBys": [],
                            pageSize: 1
                        },
                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [{
                                "name": "ga:hostname"
                            }, ],
                            "metrics": [{
                                    expression: 'ga:sessions'
                                },

                            ],
                            "orderBys": [{
                                fieldName: "ga:sessions",
                                sortOrder: 'DESCENDING',
                            }, ],

                            pageSize: 1
                        },

                    ]
                }
            }).then(function (response) {
                cb(null, response);
            })
        },
        events: function (cb) {
            google.reportRequests({
                path: '/v4/reports:batchGet',
                root: 'https://analyticsreporting.googleapis.com/',
                method: 'POST',
                body: {
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
                    }, ]
                }
            }).then(function (response) {
                cb(null, response)
            })
        },
        lists: function (cb) {
            google.reportRequests({
                path: '/v4/reports:batchGet',
                root: 'https://analyticsreporting.googleapis.com/',
                method: 'POST',
                body: {
                    reportRequests: [

                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [
                                //{ "name" : "ga:pageTitle" },
                                {
                                    "name": "ga:pagePath"
                                }
                            ],
                            "metrics": [{
                                    expression: 'ga:pageviews'
                                },
                                {
                                    expression: 'ga:sessions'
                                },
                                {
                                    expression: 'ga:entrances'
                                },
                                {
                                    expression: 'ga:newUsers'
                                },
                                {
                                    expression: 'ga:bounceRate'
                                },
                                {
                                    expression: 'ga:avgTimeOnPage'
                                },
                                {
                                    expression: 'ga:timeOnPage'
                                },
                            ],
                            pageSize: 100,
                            "orderBys": [{
                                fieldName: "ga:pageviews",
                                sortOrder: 'DESCENDING',
                                //orderType : "DELTA"
                            }, ]
                        },

                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [
                                //{ "name" : "ga:pageTitle" },
                                {
                                    "name": "ga:pagePath"
                                },
                                {
                                    "name": "ga:userType"
                                },
                            ],
                            "metrics": [{
                                expression: 'ga:sessions'
                            }, ],
                            pageSize: 200,
                            "orderBys": [{
                                fieldName: "ga:sessions",
                                sortOrder: 'DESCENDING',
                                //orderType : "DELTA"
                            }, ],
                            "dimensionFilterClauses": [{
                                "filters": [{
                                    "dimensionName": "ga:userType",
                                    "operator": "REGEXP",
                                    "expressions": ["Returning"]
                                }]
                            }]
                        },


                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [{
                                "name": "ga:userType"
                            }, ],
                            "metrics": [
                                //{ expression: 'ga:users' },
                                {
                                    expression: 'ga:sessions'
                                },
                                {
                                    expression: 'ga:bounceRate'
                                }
                            ],
                            pageSize: 20,
                            "orderBys": [{
                                fieldName: "ga:sessions",
                                sortOrder: 'DESCENDING'
                            }, ]
                        },

                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [{
                                "name": "ga:channelGrouping"
                            }, ],
                            "metrics": [
                                //{ expression: 'ga:users' },
                                {
                                    expression: 'ga:sessions'
                                },
                                {
                                    expression: 'ga:bounceRate'
                                }
                            ],
                            pageSize: 20,
                            "orderBys": [{
                                fieldName: "ga:sessions",
                                sortOrder: 'DESCENDING',
                                // orderType : "DELTA"
                            }, ]
                        },

                    ]
                }
            }).then(function (response) {
                cb(null, response)
            })
        },
        // goals: function (cb) {
        //     google.reportRequests({
        //         path: '/v4/reports:batchGet',
        //         root: 'https://analyticsreporting.googleapis.com/',
        //         method: 'POST',
        //         body: {
        //             reportRequests: [

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "metrics": goalExpressions.slice(0, 10),
        //                     pageSize: 10,
        //                     includeEmptyRows: 'true'
        //                 },

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "metrics": [{
        //                             expression: 'ga:transactionRevenue'
        //                         },
        //                         {
        //                             expression: 'ga:transactions'
        //                         },

        //                     ],
        //                     pageSize: 200,
        //                     includeEmptyRows: 'true'
        //                 },

        //                 {
        //                     "viewId": gUser.view_id,
        //                     "dateRanges": dateRanges,
        //                     "dimensions": [{
        //                         "name": "ga:productName"
        //                     }, ],
        //                     "metrics": [{
        //                             expression: 'ga:itemRevenue'
        //                         },

        //                     ],
        //                     "orderBys": [{
        //                         fieldName: "ga:itemRevenue",
        //                         sortOrder: 'DESCENDING',
        //                         // orderType : "DELTA"
        //                     }],

        //                     pageSize: 200,
        //                     includeEmptyRows: 'true'
        //                 },

        //             ]
        //         }
        //     }).then(function (response) {
        //         cb(null, response)
        //     })
        // },
        matchups: function (cb) {
            google.reportRequests({
                path: '/v4/reports:batchGet',
                root: 'https://analyticsreporting.googleapis.com/',
                method: 'POST',
                body: {
                    reportRequests: [
                        {
                            "viewId": gUser.view_id,
                            "dateRanges": dateRanges,
                            "dimensions": [
                                //{ "name" : "ga:pageTitle" },
                                {
                                    "name": "ga:pagePath"
                                },
                                {
                                    "name": "ga:pageTitle"
                                },
                                {
                                    "name": "ga:hostname"
                                }
                            ],
                            "metrics": [{
                                expression: 'ga:pageviews'
                            }, ],
                            pageSize: 200,
                            "orderBys": [{
                                fieldName: "ga:pageviews",
                                sortOrder: 'DESCENDING',
                            }, ]
                        },

                    ]
                }
            }).then(function (response) {
                cb(null, response)
            })
        }
    }, function (err, result) {
        console.log(result);
        done(result);
    });

}

exports.getGoogleSummaries = (gUser, cb) => {

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

exports.checkGoogleToken = (req, res, next) => {

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

exports.checkFacebookToken = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    req.user.getFacebook().then(function (fUser) {

        if ( fUser ) {
            console.log("\n", emoji.get("rain_cloud"), '>>>>>> facebook refresh token:', fUser.token, 'seconds since refresh', moment().subtract(fUser.expiry_date, "s").format("X"))
        }

        if (fUser && moment().subtract(fUser.expiry_date, "s").format("X") > 86400) {

            graph.extendAccessToken({
                "access_token": fUser.token,
                "client_id": auth.facebookAuth.reportRequestsID,
                "client_secret": auth.facebookAuth.reportRequestsSecret
            }, function (err, facebookRes) {

                console.log('extend facebook access token', facebookRes)

                fUser.updateAttributes({
                    token: facebookRes.token,
                    expiry_date: moment().format('X')
                }).then(function (result) {
                    next();
                });
            });
        } else return next();
    });
};
