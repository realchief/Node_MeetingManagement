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

exports.getMetrics = ( fAccount, dateWindow, timeframe, done) => {
    
    const token = fAccount.token;

    /* dates and timeframes */

    var range = dates.getDateRangeNumDays();
    //var dateWindow = dates.setDateWindow()

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
    
        page_info: function ( cb ) {
    
            graph.get( fAccount.account_id, {
                access_token : fAccount.account_token,
                fields : 'fan_count,engagement,global_brand_page_name,name,name_with_location_descriptor,posts'
            }, function(err, response) {
            
                if ( err || response.error ) {

                    var errorMessage = err || response.error

                    console.log("\n", emoji.get("sparkles"), '>>>>>> general page_info ERROR', ' ', timeframe, ' ', errorMessage)
                }

                var aggregationPeriod = 'lifetime'
                
                //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook page_info', ' ', timeframe)

                
                 var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
        insights_aggregation: function( cb ) {
            graph.get( fAccount.account_id + "/insights", {
                access_token : fAccount.account_token,
                metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
                period: 'day',
                date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {

                 if ( err || response.error ) {

                    var errorMessage = err || response.error
                    
                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_aggregation ERROR', ' ', timeframe, ' ', errorMessage)
                }

                var aggregationPeriod = 'day'
              
                //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_aggregation', ' ', timeframe)

               
               var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_daily: function( cb ) {
            graph.get( fAccount.account_id + "/insights", {
                access_token : fAccount.account_token,
                metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
                period : 'day',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                 if ( err || response.error ) {

                    var errorMessage = err || response.error
                    
                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_daily ERROR', ' ', timeframe, ' ', errorMessage)
                }

                var aggregationPeriod = 'day'

                //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_daily', ' ', timeframe)
                
            
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
        insights_lifetime: function( cb ) {
            graph.get( fAccount.account_id + "/insights", {
                access_token : fAccount.account_token,
                metric : 'page_fans',
			    period : 'lifetime',
			    date_preset : facebookDatePreset,
			    since : since,
			    until : until,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                if ( err || response.error ) {

                    var errorMessage = err || response.error
                    
                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_lifetime ERROR', ' ', timeframe, ' ', errorMessage)
                }

                var aggregationPeriod = 'lifetime'

               //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_lifetime', ' ', timeframe)
                
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_posts: function( cb ) {
            graph.get( fAccount.account_id + '/posts/', {
            
                access_token : fAccount.account_token,
                limit : 50,
			    fields : 'created_time,message,id,type,link,permalink_url',
			    date_preset : facebookDatePreset,
			    since : sinceForPosts,
			    until : untilForPosts,
			    show_description_from_api_doc : 'true'
            
            }, function(err, response) {

                 if ( err || response.error ) {

                    var errorMessage = err || response.error
                    
                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_posts ERROR', ' ', timeframe, ' ', errorMessage)

                    var postListing = {};
                    postListing.data = [];
                    var postInsights =  {}
                    postInsights.data = [];

                    cb(null, {
                            postListing: postListing,
                            postInsights: postInsights,
                            aggregationPeriod : aggregationPeriod
                        });

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
                            access_token : fAccount.account_token,
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

                        if ( err || response.error ) {

                            var errorMessage = err || response.error 

                            console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_posts_batch ERROR', ' ', timeframe, ' ', errorMessage)
                        }

                        var postInsights = response;

                        var aggregationPeriod = 'day'

                        //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_posts_batch', ' ', timeframe)

                      
                        cb(null, {
                            postListing: postListing,
                            postInsights: postInsights,
                            aggregationPeriod : aggregationPeriod
                        });

                    })


                    

                }

                
            

            });
        },

        insights_7days: function( cb ) {
            graph.get( fAccount.account_id + "/insights", {
                access_token : fAccount.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'week',
                date_preset : facebookDatePreset,
                since : since,
                until : until,
                show_description_from_api_doc : 'true'
            }, function(err, response) {
              
                if ( err || response.error ) {

                    var errorMessage = err || response.error

                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_7days ERROR', ' ', timeframe, ' ', errorMessage)
                }

                var aggregationPeriod = 'week'

                //console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_7days', ' ', timeframe)
                
             
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);
            
            });
        },
       
        insights_28days: function( cb ) {
            graph.get( fAccount.account_id + "/insights", {
                access_token : fAccount.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'days_28',
                date_preset : facebookDatePreset,
                since : since,
                until : until,
                show_description_from_api_doc : 'true'
            }, function(err, response) {

               if ( err || response.error ) {

                    var errorMessage = err || response.error

                    console.log("\n", emoji.get("sparkles"), '>>>>>> general insights_28days ERROR', ' ', timeframe, ' ', errorMessage)
                }
              
                var aggregationPeriod = '28_days'

               // console.log("\n", emoji.get("sparkles"), '>>>>>> facebook insights_28days', ' ', timeframe)
                
            
                var responseObject = {
                    aggregationPeriod : aggregationPeriod,
                    response : response
                 }

                cb(null, responseObject);

            });
        },
       
    },

    (err, responses) => {

        var resultsObject = {
            responses : responses,
            dateRange : range,
            timeframe : timeframe,
            timeWindow : sinceDisplay + ' - ' + untilDisplay,
            dateWindow : dateWindow
        }

        done(null, resultsObject);
    });
};


exports.getAllMetrics = ( fAccount, dateWindow, done ) => {

    var thisModule = this

    var filePath = './responses/';
    var readableDate = dateWindow.currentReadable + "--" + dateWindow.comparedReadable
        readableDate = readableDate.replace(/\s/g, '');
    var filename = 'fb' + '-' + fAccount.account_id + '-' + readableDate + '.json'
  
    var fs = require('fs');

    fs.readFile(filePath+filename, "utf8", function( err, data ) {
      
        if (err) {
        
            console.log("\n", emoji.get('hand'), 'Facebook file does not exist, pull from API' );

            Async.parallel({

                metrics : ( cb ) => {

                    Async.parallel({

                        current : ( cb ) => {

                            thisModule.getMetrics( fAccount, dateWindow, 'current', function( err, response ) {
                                cb( null, response )
                            })

                        },

                        compared : ( cb ) => {

                            thisModule.getMetrics( fAccount, dateWindow, 'compared', function( err, response ) {
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
        
        } else {

            console.log("\n", emoji.get("popcorn"), '>>>>>> facebook API file cache.')
            data = JSON.parse(data)
            done( null, data )
        
        }

    })


    
}

exports.getAccountList = ( fAccount, done ) => {
    const token = fAccount.token;
    graph.setAccessToken(token);
    
    graph.get( fAccount.profile_id, {
        fields: 'name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}'
    }, (err, response) => {
        var data = [];
        
       // console.log("\n", emoji.get("beer"), '>>>>>> facebook summary response:', response)
        
        if ( typeof response.accounts !== 'undefined') {

            for (var i = 0; i < response.accounts.data.length; i ++) {
                var account_name_assert = response.accounts.data[i].global_brand_page_name       
                account_name_assert = account_name_assert.replace('&', 'and'); 
                     
                var datum = {
                    'account_id': response.accounts.data[i].id,
                    'account_name': account_name_assert,
                    'account_token': response.accounts.data[i].access_token
                };

                var utilities = require('../controllers/utilities');

                datum.property_link = utilities.serialize({
                  account_id: datum.account_id,
                  account_name: datum.account_name,
                  account_token: datum.account_token
                })

                data.push(datum)
            }

        }

        done( null, data );
    });

}

exports.getAccountListOrSelectView = function ( user, done ) {
    
    var thisModule = this

    Async.waterfall([

        function ( cb ) {
            
            user.getFacebook().then(function ( fAccount) {
                if ( fAccount) {
                    cb(null, fAccount)
                }
                else cb({'error': 'User is not connected with Facebook'})
            })
        
        }, function ( fAccount, cb ) {

            if ( fAccount.account_id && fAccount.account_name && fAccount.account_token) {
                cb(null, {
                    chosen_account: {
                        account_name: fAccount.account_name,
                        user : fAccount,
                        email: fAccount.email
                    }, 
                    account_list: null
                });
            }
            
            else {
                thisModule.getAccountList( fAccount, function ( err, accounts ) {
                    cb(null, {
                        account_list: accounts, 
                        user : fAccount,
                        email: fAccount.email,
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

exports.deauthorize = ( fAccount, done) => {
    const token = fAccount.token;
    const profileId = fAccount.profile_id;
    graph.setAccessToken(token);

    graph.del(profileId + "/permissions", {
        access_token : fAccount.account_token
    }, function (err, response) {
         console.log("\n", emoji.get("bomb"), '>>>>>> deauthorized app on facebook:', response)
        done(response);
    });

}

exports.checkToken = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    req.user.getCompany().then( function( company ) {

      if ( !company ) {
          console.log("\n", emoji.get("sparkles"), 'no related company found:')
          next();
          return;
      }

        company.getFacebook().then(function ( fAccount) {

            if ( fAccount ) {
                // console.log("\n", emoji.get("moneybag"), '>>>>>> facebook check refresh token:', fAccount.token, 'seconds since refresh', moment().subtract( fAccount.expiry_date, "s").format("X"))
            }

            if ( fAccount && moment().subtract( fAccount.expiry_date, "s").format("X") > 86400) {

                graph.extendAccessToken({
                    "access_token": fAccount.token,
                    "client_id": auth.facebookAuth.clientID,
                    "client_secret": auth.facebookAuth.clientSecret
                }, function (err, facebookRes) {

                    console.log("\n", emoji.get("moneybag"), 'we extended facebook access token', facebookRes)

                    fAccount.updateAttributes({
                        token: facebookRes.access_token,
                        expiry_date: moment().format('X')
                    }).then(function (result) {
                        next();
                    });
                });
            } else return next();
        });
    })

};


exports.extendToken = (fAccount, res, cb ) => {
    //write this

    if ( fAccount ) {
       // console.log("\n", emoji.get("moneybag"), '>>>>>> facebook try to extend refresh token:', fAccount.token, 'seconds since refresh', moment().subtract( fAccount.expiry_date, "s").format("X"))
    }

    if ( fAccount ) {

        graph.extendAccessToken({
        
            "access_token": fAccount.token,
            "client_id": auth.facebookAuth.clientID,
            "client_secret": auth.facebookAuth.clientSecret
        }
        , function (err, facebookRes) {

            if ( facebookRes.error ) {
                console.log("\n", emoji.get("moneybag"), 'ERROR - lets re-authenticate?')
            } else {
                console.log("\n", emoji.get("moneybag"), 'extended facebook access token', facebookRes)
            }
        
            fAccount.updateAttributes({
                token: facebookRes.access_token,
                expiry_date: moment().format('X')
            }).then(function (result) {
                cb ( result )
            });
        });
    }


};
