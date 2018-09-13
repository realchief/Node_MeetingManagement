'use strict';
const Async = require('async');
const graph = require('fbgraph');
const auth = require('../config/auth');
const moment = require('moment');
var dates = require('../controllers/dates');
const querystring = require('querystring');

var colors = require('colors');
var emoji = require('node-emoji');
var _ = require('lodash');



exports.getMetrics = (fUser, timeframe, done) => {
    const token = fUser.token;

    /* dates and timeframes */

    var defaultNumDays = 7
    var range = dates.getDateRangeNumDays(defaultNumDays);
    var dateWindow = dates.setDateWindow(range)

    var facebookDatePreset = 'today';
    

    /*

    when giving dates for the since and until parameters,
    best to use unix epochs or make sure to include seconds.

    2018-03-01 will default to  Thu March 1, 2018 - 12:00:00 am
    with the last metric being from 2-27-2018 (with aggregated end_date as 2-28-2018 at 3AM) 2018-02-28T08:00:00+0000

    2018-03-01 reads as 12AM - make the 27th the last day reported.
    2018-03-01 08:01:00 will make the 28th the last day reported.
    REMEMBER, facebook uses "end_date" on the metrics, so the "current day" for the value is the day previous on the data.

    */

    if ( timeframe == "current") {

        // MAKE INLINE WITH FB SUMMARY
        var since = moment(dateWindow.currentFromDate).subtract(1, 'day').format( "YYYY-MM-DD 00:00" );
        var until = moment(dateWindow.currentToDate).format( "YYYY-MM-DD 23:59" );

        var sinceForPosts = moment(dateWindow.currentFromDate).format( "YYYY-MM-DD 00:00" );
        var untilForPosts = moment(dateWindow.currentToDate).format( "YYYY-MM-DD 23:59" );

        var sinceDisplay = dateWindow.currentFromDate;
        var untilDisplay = dateWindow.currentToDate;


    } else {


        // MAKE INLINE WITH FB SUMMARY
        var since = moment( dateWindow.comparedFromDate).subtract(1, 'day').format( "YYYY-MM-DD 00:00" );
        var until = moment( dateWindow.comparedToDate ).format( "YYYY-MM-DD 23:59" );

        var sinceForPosts = moment(dateWindow.comparedFromDate).format( "YYYY-MM-DD 00:00" );
        var untilForPosts = moment(dateWindow.comparedToDate).format( "YYYY-MM-DD 23:59" );

        var sinceDisplay = dateWindow.comparedFromDate;
        var untilDisplay = dateWindow.comparedToDate;

    }


    graph.setAccessToken(token);
    Async.parallel({
        page_info: function (cb) {
            graph.get(fUser.account_id, {
                access_token : fUser.account_token,
                fields : 'fan_count,engagement,global_brand_page_name,name,name_with_location_descriptor,posts'
            }, function(err, response) {
            
                var aggregationPeriod = 'lifetime'
                 console.log("\n", emoji.get("sparkles"), '>>>>>> facebook page_info', ' ', timeframe)
        
                 var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
        insights_aggregation: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
                period: 'day',
                date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {

                var aggregationPeriod = 'day'
              
                console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_aggregation', ' ', timeframe)
               
               var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_daily: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
                period : 'day',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                 var aggregationPeriod = 'day'

                console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_daily', ' ', timeframe)
                
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
        insights_lifetime: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fans',
			    period : 'lifetime',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                var aggregationPeriod = 'lifetime'

                console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_lifetime', ' ', timeframe)
                
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_posts: function(cb) {
            graph.get(fUser.account_id + '/posts/', {
            
                access_token : fUser.account_token,
                limit : 50,
			    fields : 'created_time,message,id,type,link,permalink_url',
			    date_preset : facebookDatePreset,
			    since : sinceForPosts,
			    until : untilForPosts,
			    show_description_from_api_doc : 'true'
            
            }, function(err, response) {

                if ( response.error ) {
                    console.log("\n", emoji.get("sparkles"), '>>>>>> facebook posts pre', err, response, ' ', timeframe)
                }

                var aggregationPeriod = 'lifetime'

                var postListing = response;

                if (response && !response.error) {

                    var batchPosts = [];

                    if (response.paging && response.paging.next) {
                        console.log("\n", emoji.get("book"), 'THERE ARE MORE PAGING ITEMS FOR POSTS >>>', response.paging.next )
                    }

                    _.forEach( response.data, function( post, index ) {

                        var postObject = {
                            access_token : fUser.account_token,
                            period : 'lifetime',
                            metric : 'post_impressions_unique,post_engaged_users,post_video_avg_time_watched,post_video_length,post_video_views,post_video_view_time,post_impressions_paid_unique,post_clicks,post_clicks_by_type_unique,post_activity,post_activity_by_action_type',
                            show_description_from_api_doc : 'true',
                            include_headers: 'false'
                        }

                        var queryParams = querystring.stringify(postObject)

                        batchPosts.push({
                            method : 'get',
                            relative_url : post.id + "/insights/" + '?' + queryParams
                        })

                    })

                    graph.batch( batchPosts, function( err, response ) {

                        var postInsights = response;

                        var aggregationPeriod = 'day'

                        console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_posts', ' ', timeframe)
                        cb(null, {
                            postListing: postListing,
                            postInsights: postInsights,
                            aggregationPeriod : aggregationPeriod
                        });

                    })


                    

                }

                
            

            });
        },

        insights_7days: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'week',
                date_preset : facebookDatePreset,
                since : since,
                until : until,
                show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                var aggregationPeriod = 'week'

                console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_7days', ' ', timeframe)
                
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_28days: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'days_28',
                date_preset : facebookDatePreset,
                since : since,
                until : until,
                show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                var aggregationPeriod = '28_days'

                console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_28days', ' ', timeframe)
                
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);

            });
        },
       
    },
    (err, data) => {

        var resultsObject = {
            results : data,
            dateRange : range,
            timeframe : timeframe,
            timeWindow : sinceDisplay + ' - ' + untilDisplay,
            dateWindow : dateWindow
        }

        done(null, resultsObject);
    });
};


exports.getAllMetrics = ( fUser, done ) => {

    var thisModule = this

    Async.parallel({

        metrics : ( cb ) => {

            Async.parallel({

                current : ( cb ) => {

                    thisModule.getMetrics(fUser, 'current', function( err, response ) {
                        cb( null, response )
                    })

                },

                compared : ( cb ) => {

                    thisModule.getMetrics(fUser, 'compared', function( err, response ) {
                        cb( null, response )
                    })

                }

            }, function( err, results ) {

                var metricTimeframes = {
                    current: results.current,
                    compared: results.compared
                }

                cb( null, metricTimeframes )

            })
           

        }

    }, function( err, results ) {

        /* returns {
        results.metrics.current
        results.metrics.compared
        } */
        
        done( null, results )

    })


}

exports.getAccountList = (fUser, done) => {
    const token = fUser.token;
    graph.setAccessToken(token);
    
    graph.get(fUser.profile_id, {
        fields: 'name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}'
    }, (err, response) => {
        var data = [];
        
        console.log("\n", emoji.get("rain_cloud"), '>>>>>> facebook summary response:', response)
        
        if ( typeof response.accounts !== 'undefined') {

            for (var i = 0; i < response.accounts.data.length; i ++) {
                var account_name_assert = response.accounts.data[i].global_brand_page_name       
                account_name_assert = account_name_assert.replace('&', 'and'); 
                     
                var datum = {
                    'account_id': response.accounts.data[i].id,
                    'account_name': account_name_assert,
                    'account_token': response.accounts.data[i].access_token
                };
                data.push(datum)
            }

        }

        done(data);
    });

}

exports.getAccountListOrSelectView = function (user, done) {
    Async.waterfall([
        function (cb) {
            user.getFacebook().then(function (fUser) {
                if (fUser) {
                    cb(null, fUser)
                }
                else cb({'error': 'User is not connected with Facebook'})
            })
        }, function (fUser, cb) {
            if (fUser.account_id && fUser.account_name && fUser.account_token) {
                cb(null, {
                    chosen_account: {
                        account_name: fUser.account_name,
                        email: fUser.email
                    }, 
                    account_list: null
                });
            }
            else {
                facebookApi.getAccountList(fUser, function (data) {
                    cb(null, {
                        account_list: data, 
                        user : fUser,
                        chosen_account: null
                    })
                });
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err.error);
        }
        done(err, result);
    })
}

exports.deauthorize = (fUser, done) => {
    const token = fUser.token;
    const profileId = fUser.profile_id;
    graph.setAccessToken(token);

    graph.del(profileId + "/permissions", {
        access_token : fUser.account_token
    }, function (err, response) {
         console.log("\n", emoji.get("rain_cloud"), '>>>>>> deauthorized app on facebook:', response)
        done(response);
    });

}

exports.checkToken = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    req.user.getFacebook().then(function (fUser) {

        if ( fUser ) {
            console.log("\n", emoji.get("moneybag"), '>>>>>> facebook refresh token:', fUser.token, 'seconds since refresh', moment().subtract(fUser.expiry_date, "s").format("X"))
        }

        if (fUser && moment().subtract(fUser.expiry_date, "s").format("X") > 86400) {

            graph.extendAccessToken({
                "access_token": fUser.token,
                "client_id": auth.facebookAuth.clientID,
                "client_secret": auth.facebookAuth.clientSecret
            }, function (err, facebookRes) {

                console.log("\n", emoji.get("moneybag"), 'extended facebook access token', facebookRes)

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


exports.extendToken = (req, res, next) => {
    //write this
};
