let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
const moment = require("moment");

let facebookApi = require('../controllers/facebook-api');

var colors = require('colors');
var emoji = require('node-emoji')
var _ = require('lodash');


exports.process = ( fUser, cb ) => {

    var thisModule = this

    facebookApi.getAllMetrics( fUser, function( err, results ) {
      
        var insightGroups = [ 'page_info', 'insights_aggregation', 'insights_daily', 'insights_lifetime', 'insights_7days', 'insights_28days' ]

        var postsTable = thisModule.listPostsTable(results.metrics.current.responses.insights_posts, results.metrics.compared.responses.insights_posts, null)

       results.postsTable = postsTable.join('')

        var metricsOutputTable = []

        _.forEach( insightGroups, function( insightGroup, index ) {

            var tableResponse = thisModule.metricsTable(results.metrics.current.responses, results.metrics.compared.responses, insightGroup)

             metricsOutputTable.push(tableResponse)
        })

        results.metricsTable = metricsOutputTable.join('')
       
        cb ( null, results )
    

    })
    
}


exports.metricsTable = ( current, compared, insightGroup ) => {

    //console.log('IG>>>', insightGroup)

        var rows = [];
        var table = [];

        switch ( insightGroup ) {

            case "page_info" :
                
                var results = current[insightGroup].response
                //console.log(results)
                var values = [results.name + ' Fan Count', "fan_count", results.engagement.count, "&nbsp;", "&nbsp;",  "&nbsp;", current[insightGroup].aggregationPeriod];
                table.push('<tr><td>', values.join('</td><td>'), '</td>');
                table.push('</tr>');
                rows.push(table.join(''));

            break

         }

        _.forEach( current[insightGroup].response.data, function( metric, index ) {
            
            table = [];

            /**
             * compared and current values
            */
            
            var comparedMetric = compared[insightGroup].response.data[index]
            var attributedDateIndex = (metric.values.length > 1) ? metric.values.length-2 : metric.values.length-1
            var value = metric.values[metric.values.length-1].value 
            var date = (metric.values.length > 1) ? moment(metric.values[attributedDateIndex].end_time).format('MM/DD/YYYY') : moment(metric.values[attributedDateIndex].end_time).subtract(1, 'day').format('MM/DD/YYYY')
            
            var comparedAttributedDateIndex = (comparedMetric.values.length > 1) ? comparedMetric.values.length-2 : comparedMetric.values.length-1
            var comparedValue = comparedMetric.values[comparedMetric.values.length-1].value 
            var comparedDate = (comparedMetric.values.length > 1) ? moment(comparedMetric.values[comparedAttributedDateIndex].end_time).format('MM/DD/YYYY') : moment(comparedMetric.values[comparedAttributedDateIndex].end_time).subtract(1, 'day').format('MM/DD/YYYY')

            var values = [];
            var aggregationPeriod = current[insightGroup].aggregationPeriod


            switch ( insightGroup ) {

                default: 

                    /**
                     *
                     * if there are multiple actions for an insight, the data comes in an object
                     *
                    */

                    if ( typeof value == 'object') {

                        values = [metric.title, metric.name, "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp"];
                        table.push('<tr><td>', values.join('</td><td>'), '</td>');
                        table.push('</tr>');

                         // sum of individual action ONLY IF we are aggregating by day

                        if ( aggregationPeriod == 'day' ) {

                            var typeSum = {}
                            var comparedTypeSum = {}

                            _.forEach ( metric.values, function( day, index ) {

                                var comparedDay = 0;
                                if ( typeof comparedMetric.values[index] !== 'undefined' ) {
                                    comparedDay = comparedMetric.values[index].value
                                }
                        
                                //console.log('+++', 'end_time:', day.end_time, metric.name)

                                var numActions = 0;
                                var comparedNumActions = 0;

                                 _.forEach( day.value, function( numActions, type ) {
                                    
                                    if ( typeof (typeSum[type]) == 'undefined' ) {
                                        typeSum[type] = 0;
                                        comparedTypeSum[type] = 0;
                                    }

                                    typeSum[type] += numActions
                                    
                                    //console.log(type, typeSum[type], comparedDay[type], typeof  comparedDay[type])

                                    if ( typeof comparedDay[type] !== 'undefined' && typeof comparedDay[type] !== 'function' ) {
                                        comparedTypeSum[type] += comparedDay[type]
                                    }
                        
                                 })

                            })

                            //console.log("+++++ sum of types", typeSum)

                        } else {
                            var typeSum = 0
                            var comparedTypeSum = 0
                        }

                        /**
                         *
                         * if there are multiple actions for the insight, display each of those metrics, along with the sum
                         *
                        */

                        _.forEach( value, function( typeValue, name ) {

                            /**
                             *
                             * REAL DATA RIGHT HERE
                             *
                            */

                            var comparedTypeValue = comparedValue[name] 

                            values = [];
                            values = ["&nbsp;", name, typeSum[name] + " (" + typeValue + ") ", date, comparedTypeSum[name] + " (" + comparedTypeValue + ") ", comparedDate, aggregationPeriod];
                            table.push('<tr><td>', values.join('</td><td>'), '</td>');
                            table.push('</tr>');

            
                        })

                        /**
                         *
                         * sum together all of the actions to get the total for the main insight
                         *
                        */

                        if ( aggregationPeriod == 'day' ) {

                             var sum = 0;
                             var comparedSum = 0;
                             _.forEach( metric.values, function( day, index ) {

                                var comparedDay = "";
                                if ( typeof comparedMetric.values[index] != 'undefined' ) {
                                    comparedDay = comparedMetric.values[index].value
                                } 

                                _.forEach( day.value, function( numActions, type ) {
                                 
                                    sum += numActions
                             
                                    if ( typeof comparedDay[type] !== 'undefined' && typeof comparedDay[type] !== 'function' ) {
                                        comparedSum += comparedDay[type]
                                    }

                                })

                             })

                            values = ['&nbsp;', '&nbsp;', sum, 'total', comparedSum, 'total', 'period']
                            table.push('<tr class="summary"><td>', values.join('</td><td>'), '</td>');
                            table.push('</tr>');

                        }

                    } else {

                        /**
                         *
                         * single value for the insight
                         *
                        */

                        var sum = 0;
                        var comparedSum = 0;

                        switch ( metric.name ) {
                            
                            case "page_video_view_time":

                                value = parseInt(value / 1000) + ' sec.'
                                comparedValue = parseInt(comparedValue / 1000) + ' sec.'
                 
                            break

                        }

                        values = [metric.title, metric.name, value, date, comparedValue, comparedDate, aggregationPeriod];
                        table.push('<tr><td>', values.join('</td><td>'), '</td>');
                        table.push('</tr>');

                        if ( aggregationPeriod == 'day' ) {

                            sum = 0;
                            comparedSum = 0;

                        } else {

                            sum = value;
                            comparedSum = comparedValue;

                        }

                        // GET THE TOTAL OVER THE PERIOD IF the period == "day"
                        if ( aggregationPeriod == 'day' ) {
                        
                             _.forEach( metric.values, function( day, index ) {
                             
                                var comparedDay = 0;
                                if ( typeof comparedMetric.values[index] != 'undefined' ) {
                                    comparedDay = comparedMetric.values[index]
                                } 

                                sum += day.value

                                if ( typeof comparedDay.value != 'undefined' ) {
                                    comparedSum += comparedDay.value
                                }
                                

                             })

                             switch ( metric.name ) {
                            
                                case "page_video_view_time":

                                    sum = parseInt(sum / 1000 ) + ' sec.'
                                    comparedSum = parseInt(comparedSum / 1000 ) + ' sec.'

                                break
                    
                            }
                            
                            /**
                             *
                             * REAL DATA RIGHT HERE
                             *
                            */

                            values = ['&nbsp;', '&nbsp;', sum, 'total', comparedSum, 'total', 'period']
                            table.push('<tr class="summary"><td>', values.join('</td><td>'), '</td>');
                            table.push('</tr>');

                         }


                    }

                break

            }

            rows.push(table.join(''));

         })

        var output = [];
    
        //output.push("<h4>" + current.pageInfo.account_name + "</h4>")
        var table = ['<table>'];
        var headers = ['Descriptor', 'Metric Title', 'Value', 'Through', "Compared Value", "Through", 'Period']
        table.push('<tr><th>', headers.join('</th><th>'), '</th>');
        table.push('</tr>');


        output.push(table.join(''));
        output.push(rows.join(''));
        output.push('</table>')
        return output.join('');
    

};

exports.listPostsTable = (current, compared, done) => {


    var insightTotals = {};
    var output = [];
    var table = ['<table>'];
    var rows = [];
    
    var headers = ['Date', 'Link', 'Message', 'Type']
    headers.push('Total Reach', 'Engaged Users', 'Likes', 'Comments', 'Shares', "Clicks", "Link Clicks", "Eng. Rate", "Engagements", "Video Metrics")
    
    table.push('<tr><th>', headers.join('</th><th>'), '</th>');
    table.push('</tr>');

    _.forEach( [ current, compared ], function( timeframe, index ) {

        var totalPosts = timeframe.postListing.data.length;
        var postInsights = timeframe.postInsights
        if ( index == 0 ) { var timeframeWindow = 'current' } else { var timeframeWindow = 'compared' }
        insightTotals[timeframeWindow] = {};

        rows.push('<tr><td colspan="', headers.length, '">', timeframe.window,  ' <strong>Total Posts: ', totalPosts, '</strong>', '</td></tr>');
        

        _.forEach( timeframe.postListing.data, function( post, index ) {

            var insights = JSON.parse(postInsights[index].body).data;
            var insightMetrics = {}
                
            // initialize these so we don't get undefineds //

            _.forEach( [ 'post_impressions_unique', 'post_engaged_users', 'like', 'comment', 'share', 'post_clicks', 'link clicks', 'engagements', 'post_activity'], function( name, index ) {
                insightMetrics[name] = 0;
            })

       
            _.forEach( insights, function( metric, index ) {

                    //console.log(metric)

                    if ( typeof metric.values[0].value == 'object' ) {

                        _.forEach( metric.values[0].value, function( typeValue, name ) {
                            
                            if ( typeof insightTotals[timeframeWindow][name] == 'undefined' ) {
                                insightTotals[timeframeWindow][name] = 0;
                            }
                            if ( typeof typeValue == "undefined" ) {
                                typeValue = 0
                            } else {
                                typeValue = typeValue
                            }

                            insightMetrics[name] = typeValue
                            insightTotals[timeframeWindow][name] += typeValue
                        })

                    } else {

                        if ( typeof insightTotals[timeframeWindow][metric.name] == 'undefined' ) {
                            insightTotals[timeframeWindow][metric.name] = 0;
                        } else {

                        }

                        
                        if ( typeof metric.values[0].value === "undefined" ) {
                            value = 0
                        } else {
                            value = metric.values[0].value
                        }

                        insightMetrics[metric.name] = value
                        insightTotals[timeframeWindow][metric.name] += value
                    }
                
            })

            var postDate = moment(post.created_time).format("ddd MMM. DD, YYYY<br />hh:mm a")
            var message = ( post.message ) ? post.message : post.link
            
            var engagementRate =  ( insightMetrics['post_engaged_users'] / insightMetrics['post_impressions_unique'] )
            engagementRateRaw =  ( engagementRate * 100 )
            engagementRate =  ( engagementRate * 100 ).toFixed(2);

            var videoMetrics = "";
            if ( post.type == 'video') {
                videoMetrics = [ 'Mins. Viewed: ', parseInt(insightMetrics['post_video_view_time']/1000/60), '<br />', 'Views: ', insightMetrics['post_video_views'] ]
            } else {
                videoMetrics = [ "&nbsp;" ]
            }

            var link = '<a href="' + post.permalink_url + '" class="post-link" target="_blank">link</a>';


            insightMetrics['engagements'] = parseInt(insightMetrics['post_activity']) + parseInt(insightMetrics['post_clicks'])

            values = [ postDate, link, message, post.type, insightMetrics['post_impressions_unique'], insightMetrics['post_engaged_users'], insightMetrics['like'], insightMetrics['comment'], insightMetrics['share'], insightMetrics['post_clicks'], insightMetrics['link clicks'], engagementRate + "%", insightMetrics['engagements'], videoMetrics.join('') ]
            rows.push('<tr><td>', values.join('</td><td>'), '</td>');
            rows.push('</tr>');


        })

    })

    output.push(table.join(''));
    output.push(rows.join(''));
    output.push('</table>')
    return output;

};
