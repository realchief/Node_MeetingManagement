'use strict';
const Async = require('async');
const graph = require('fbgraph');
const auth = require('../config/auth');
const moment = require('moment');

var colors = require('colors');
var emoji = require('node-emoji');
var _ = require('lodash');



exports.getMetrics = (fUser, done) => {
    const token = fUser.token;

    var since_current = moment().subtract(5, 'days').format( "YYYY-MM-DD 00:00" );
    var until_current = moment().format( "YYYY-MM-DD 23:59" );

    var sinceForPosts_current = moment().format( "YYYY-MM-DD 00:00" );
    var untilForPosts_current = moment().format( "YYYY-MM-DD 23:59" );

    var since_compare = moment().subtract(5, 'days').format( "YYYY-MM-DD 00:00" );
    var until_compare = moment().format( "YYYY-MM-DD 23:59" );

    var sinceForPosts_compare = moment().format( "YYYY-MM-DD 00:00" );
    var untilForPosts_compare = moment().format( "YYYY-MM-DD 23:59" );

    var facebookDatePreset = 'today';

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
        insights_aggregation_current: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
                period: 'day',
                date_preset : facebookDatePreset,
			    since : since_current,
			    until : until_current,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err2:', err);
                cb(null, response);
            });
        },
        insights_aggregation_compare: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
                period: 'day',
                date_preset : facebookDatePreset,
			    since : since_compare,
			    until : until_compare,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err3:', err);
                cb(null, response);
            });
        },
        insights_daily_current: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
                period : 'day',
			    date_preset : facebookDatePreset,
			    since : since_current,
			    until : until_current,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err4:', err);
                cb(null, response);
            });
        },
        insights_daily_compare: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
                period : 'day',
			    date_preset : facebookDatePreset,
			    since : since_compare,
			    until : until_compare,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err5:', err);
                cb(null, response);
            });
        },
        insights_lifetime_current: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fans',
			    period : 'lifetime',
			    date_preset : facebookDatePreset,
			    since : since_current,
			    until : until_current,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err6:', err);
                cb(null, response);
            });
        },
        insights_lifetime_compare: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_fans',
			    period : 'lifetime',
			    date_preset : facebookDatePreset,
			    since : since_compare,
			    until : until_compare,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err7:', err);
                cb(null, response);
            });
        },
        insights_posts_current: function(cb) {
            graph.get(fUser.account_id + '/posts/', {
                access_token : fUser.account_token,
                limit : 50,
			    fields : 'created_time,message,id,type,link,permalink_url',
			    date_preset : facebookDatePreset,
			    since : sinceForPosts_current,
			    until : untilForPosts_current,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err8:', err);
                cb(null, response);
            });
        },
        insights_posts_compare: function(cb) {
            graph.get(fUser.account_id + '/posts/', {
                access_token : fUser.account_token,
                limit : 50,
			    fields : 'created_time,message,id,type,link,permalink_url',
			    date_preset : facebookDatePreset,
			    since : sinceForPosts_compare,
			    until : untilForPosts_compare,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err9:', err);
                cb(null, response);
            });
        },
        insights_28days_current: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
                period : 'days_28',
                date_preset : facebookDatePreset,
                since : since_current,
                until : until_current,
                show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err10:', err);
                cb(null, response);
            });
        },
        insights_28days_compare: function(cb) {
            graph.get(fUser.account_id + "/insights", {
                access_token : fUser.account_token,
                metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
			    period : 'week',
			    date_preset : facebookDatePreset,
			    since : since_compare,
			    until : until_compare,
			    show_description_from_api_doc : 'true'
            }, function(err, response) {
                console.log('err12:', err);
                cb(null, response);
            });
        },
    },
    (err, data) => {
        done(null, data);
    });
};

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
            console.log("\n", emoji.get("rain_cloud"), '>>>>>> facebook refresh token:', fUser.token, 'seconds since refresh', moment().subtract(fUser.expiry_date, "s").format("X"))
        }

        if (fUser && moment().subtract(fUser.expiry_date, "s").format("X") > 86400) {

            graph.extendAccessToken({
                "access_token": fUser.token,
                "client_id": auth.facebookAuth.clientID,
                "client_secret": auth.facebookAuth.clientSecret
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
