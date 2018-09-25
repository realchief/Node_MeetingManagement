let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
const moment = require("moment");

let googleApi = require('../controllers/google-analytics-api');

var colors = require('colors');
var emoji = require('node-emoji')
var _ = require('lodash');
var utilities = require('../controllers/utilities')
var fields = require("../controllers/fields");

var googleAnalyticsDefinition = require('../definitions/source-google-analytics');
//var googleAnalyticsData = googleAnalyticsDefinition.get().google_analytics;

exports.googleAnalyticsData = {}

exports.makeGoogleAnalyticsData = function() {

    this.googleAnalyticsData = googleAnalyticsDefinition.get().google_analytics;
    return this.googleAnalyticsData


},


exports.process = ( gAccount, cb ) => {

    var thisModule = this
    var googleAnalyticsData = this.makeGoogleAnalyticsData();

    googleApi.getAllMetrics(gAccount, function( err, results ) {

        if ( err ) {

            console.log("\n", emoji.get("bangbang"), emoji.get("bangbang"), 'Google metrics process error:', err.errors[0].message);

            err = { message: "Google Analytics metrics process error" }
            cb ( err )

        } else {
        
        	console.log("\n", emoji.get("beers"), '>>>>>> pulled all metrics from google API.')

            thisModule.gaColumns = results.metrics.both.responses.gaColumns
            thisModule.goalNames = results.metrics.both.responses.goals.metricsList
            googleAnalyticsData.metric_assets['goals'] = thisModule.goalNames
            thisModule.dateWindowReadable = results.metrics.both.dateWindow.dateWindowReadable

            var insightGroups = [ 'metrics', 'events', 'lists', 'goals', 'matchups']
            var reportNames = {
                'metrics' : {
                    1 : 'hostname'
                },
                'lists' : {
                    0 : 'overall_totals',
                }
            }

             var metricsOutputTable = []

            _.forEach( insightGroups, function( insightGroup, index ) {

                var group = results.metrics.both.responses[insightGroup]
            
                _.forEach( group.data.reports, function( report, index ) {

                    var reportName = "";
                    var basedIndex = index+1;
            
                    if ( typeof reportNames[insightGroup] !== 'undefined') {
                        if ( typeof reportNames[insightGroup][index] !== 'undefined') {
                            reportName = reportNames[insightGroup][index];
                        }
                    }                   


                    var tableResponse = thisModule.metricsTable(report, index, reportName, insightGroup)
                    metricsOutputTable.push(tableResponse)

                })

             })

            results.metricsTable = metricsOutputTable.join('')
            results.dataSource = googleAnalyticsData

           console.log("\n", emoji.get("beers"), '>>>>>> google process done. Retrieved API metrics, and put metrics into data source definition')

            cb ( null, results )

        }
    
    })
    
}


exports.metricsTable = ( report, index, reportName, insightGroup ) => {

    var googleAnalyticsData = this.googleAnalyticsData;

    var dimensionsCount = 0;
    var aggregatedByDate = false;
    var valueTypes = [];
    var fieldNames = [];
    var dimensionNames = [];
    var multiDimension = false;
    var reportName = reportName || "";
    var thisModule = this

    // THIS IS TO SEE THE OUTPUT IN A TABLE//
    var output = [];
    var table = ['<table>'];
    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

    // THIS IS TO SEE THE OUTPUT IN A TABLE//
    table.push('<h4>', reportName, ' ', index, ' ', insightGroup, '</h4>');
    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

    if (report.data.rows && report.data.rows.length) {
        
            var justTotals = false;
            
            // THIS IS TO SEE THE OUTPUT IN A TABLE//
            table.push('<tr>');
            // END THIS TO SEE THE OUTPUT IN A TABLE//

            if ( typeof report.columnHeader.dimensions != 'undefined') {
                

                _.forEach( report.columnHeader.dimensions, function( dimension, index ) {

                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                    table.push('<th>', thisModule.gaColumns[dimension].uiName, '</th>')
                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                    dimensionNames.push(dimension.split('ga:')[1]);

                })

                dimensionsCount = report.columnHeader.dimensions.length
                aggregatedByDate = report.columnHeader.dimensions.indexOf('ga:date') >= 0;
            
            } else {

                justTotals = true;

            } 

            // THIS IS TO SEE THE OUTPUT IN A TABLE//
            table.push('<th>Date range</th>');
            // END THIS IS TO SEE THE OUTPUT IN A TABLE//

            if ( typeof report.columnHeader.metricHeader.metricHeaderEntries != 'undefined') {

                _.forEach( report.columnHeader.metricHeader.metricHeaderEntries, function( header, index ) {

                     valueTypes.push(header.type)
                     fieldNames.push(header.name.split("ga:")[1])

                     // THIS IS TO SEE THE OUTPUT IN A TABLE//
                     if ( typeof thisModule.gaColumns[header.name] !== 'undefined') {
                        table.push('<th>', thisModule.gaColumns[header.name].uiName, '</th>');                 
                    } else {
                        table.push('<th>', thisModule.goalNames[index].name, '</th>');         
                    }
                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                } )

            }

            // THIS IS TO SEE THE OUTPUT IN A TABLE//
            table.push('</tr>');
            // END THIS IS TO SEE THE OUTPUT IN A TABLE//

            if ( report.columnHeader.dimensions ) {
                var dimensionHeader = report.columnHeader.dimensions[0].split('ga:')[1] + "_" + fieldNames.join("_");

                if ( report.columnHeader.dimensions.length > 1 ) {
                    multiDimension = true;
                }

             } else {
                var dimensionHeader = 'totals'
             }

            
             if ( insightGroup == 'matchups' || multiDimension == true) {
                var dimensionHeader = report.columnHeader.dimensions[0].split('ga:')[1] + '_' + report.columnHeader.dimensions[1].split('ga:')[1] + "_" + fieldNames.join("_");
             }

             //console.log(insightGroup, 'Google Analytics Report:', index, report, dimensionHeader)
             var currentReport = dimensionHeader;

             if ( reportName ) {
                currentReport = reportName
             }

            /**
             *
             * Totals
             *
            */

            if ( typeof report.data.totals != 'undefined' ) {
                
                _.forEach( report.data.totals, function( dateRange, index ) {
                    
                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                    var label = "";
                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                    var dateIndex = index;
                    var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';

                    if ( timeframe == 'current') {
                        comparedRange = report.data.totals[1].values
                    } else {
                        comparedRange = report.data.totals[0].values
                    }

                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                    table.push('<tr class="n-summary">')

                    for ( i = 0; i <= dimensionsCount-1; i++) {
                        
                        if ( i == 0 ) {
                            if ( index == 0 ) {
                                label = "Totals:";
                            }
                        } else {
                            label = "&nbsp;"
                        }

                        table.push('<td>', label, '</td>');                 
                    }
                    // THIS IS TO SEE THE OUTPUT IN A TABLE//


                    if ( typeof dateRange.values != 'undefined') {

                        // THIS IS TO SEE THE OUTPUT IN A TABLE//
                        table.push('<td>', thisModule.dateWindowReadable[index], '</td>')
                        // THIS IS TO SEE THE OUTPUT IN A TABLE//

                        _.forEach ( dateRange.values, function( value, index ) {

                            var valueToShow = "";
                            var totalDelta = "";
                            var totalPercentDelta = "";
                            var percentOfTotal = "";
                            var percentOfTotalRaw = "";
                            var comparedValue = comparedRange[index];

                            //console.log('VT:', valueTypes[index].toLowerCase() )
                            switch ( valueTypes[index].toLowerCase() ) {

                                case "percent" :
                                    var value = parseFloat(value).toFixed(2)
                                    
                                    totalDelta = value - comparedValue

                                    if ( totalDelta != 0 ) {
                                        totalPercentDelta = (totalDelta / comparedValue) * 100;
                                        totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                        totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                    } else {
                                        totalPercentDelta = 0;
                                    };

                                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                    valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                break

                                case "time" :
                                    var value = Math.round(value)

                                    totalDelta = Math.round(value) - Math.round(comparedValue)

                                    if ( totalDelta != 0 ) {
                                        totalPercentDelta = (totalDelta / comparedValue) * 100;
                                        totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                        totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                    } else {
                                        totalPercentDelta = 0;
                                    };

                                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                    valueToShow = utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
                                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                break

                                case "currency" :
                                    var value = value
                                    
                                    totalDelta = value - comparedValue

                                    if ( totalDelta != 0 ) {
                                        totalPercentDelta = (totalDelta / comparedValue) * 100;
                                        totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                        totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                    } else {
                                        totalPercentDelta = 0;
                                    };

                                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                    valueToShow = "$" + value +  "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                break

                                default : 
                                    var value = value

                                    totalDelta = value - comparedValue

                                    if ( totalDelta != 0 ) {
                                        totalPercentDelta = (totalDelta / comparedValue) * 100;
                                        totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                        totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                    } else {
                                        totalPercentDelta = 0;
                                    };

                                    // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                        valueToShow = value + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>";
                                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                break

                            }

                            // THIS IS TO SEE THE OUTPUT IN A TABLE//
                            table.push('<td>', valueToShow, '</td>')
                            // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                            /**
                             *
                             * REAL DATA RIGHT HERE
                             *
                            */

                            if ( dimensionNames.length > 0 ) { 
                                var parentDimension = dimensionNames.join("").toLowerCase().replace(" ", "_") + "__"
                                var combinedFieldName = parentDimension + fieldNames[index]
                            } else {
                                var combinedFieldName = fieldNames[index]
                            }
            

                            fields.setFieldValue( googleAnalyticsData, combinedFieldName, timeframe, value, valueTypes[index] )




                        })

                   }

                   // THIS IS TO SEE THE OUTPUT IN A TABLE//
                    table.push('</tr>')
                    // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                })
            }


            /**
             *
             * Metrics
             *
            */

            var storedCompared = []
            var storedComparedIndex = 0;

            _.forEach( report.data.rows, function( row, index ) {

                if ( justTotals ) return;

                // THIS IS TO SEE THE OUTPUT IN A TABLE//
                var label = "";
                // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                if ( aggregatedByDate) {
                  // PULLED ALL THE AGGREGATED BY DATE STUFF FOR NOW. 
                } else {

                    /**
                     *
                     * No date aggregation
                     *
                    */

                    if ( currentReport == 'channelGrouping_sessions_bounceRate') {
                        //console.log('data row', currentReport, row)
                    }

                    _.forEach( row.metrics, function( dateRange, index ) {

                        var dateIndex = index;
                        var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';
                        var dataRow = {};

                        
                        if ( timeframe == 'current') {
                            comparedRange = row.metrics[1]
                        } else {
                            comparedRange = row.metrics[0]
                        }

                         // THIS IS TO SEE THE OUTPUT IN A TABLE//
                        table.push('<tr>')
                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                          // THIS IS TO SEE THE OUTPUT IN A TABLE//
                        if ( typeof row.dimensions != 'undefined') {
                            //console.log( 'How many dimensions?', row.dimensions.length )
                            // if the first of two timeframes
                            if ( index == 0 ) {
                                // Put dimension values
                                table.push('<td>', row.dimensions.join('</td><td>'), '</td>');
                            } else {
                            
                                for ( i = 0; i <= dimensionsCount-1; i++) {
                                    label = "&nbsp;"
                                    table.push('<td>', label, '</td>');   
                                }
                            }
                        }
                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                         if ( typeof googleAnalyticsData.metric_assets[currentReport] == 'undefined' ) {
                            googleAnalyticsData.metric_assets[currentReport] = {};
                        }

                        if ( typeof googleAnalyticsData.metric_assets[currentReport][timeframe] == 'undefined' ) {
                            googleAnalyticsData.metric_assets[currentReport][timeframe] = {};
                        }

                        if ( typeof googleAnalyticsData.metric_assets[currentReport][timeframe].list == 'undefined' ) {
                            googleAnalyticsData.metric_assets[currentReport][timeframe].list = [];
                        }


                        if ( typeof dateRange.values != 'undefined') {

                            var metric = "";
                            var dateIndex = index;
                            metric = thisModule.dateWindowReadable[index]

                       
                            // Put metric values for the current date range

                            // THIS IS TO SEE THE OUTPUT IN A TABLE//
                            table.push('<td>', metric, '</td>')
                            // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                            _.forEach ( dateRange.values, function( value, index ) {

                                var valueToShow = "";
                                var totalDelta = "";
                                var totalPercentDelta = "";
                                var percentOfTotal = "";
                                var percentOfTotalRaw = "";
                                var comparedValue = comparedRange.values[index];

                                switch ( valueTypes[index].toLowerCase() ) {

                                    case "percent" :
                                        var value = parseFloat(value).toFixed(2)
                                        
                                        totalDelta = value - comparedValue

                                        if ( totalDelta != 0 ) {
                                            totalPercentDelta = (totalDelta / comparedValue) * 100;
                                            totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                            totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                        } else {
                                            totalPercentDelta = 0;
                                        };

                                        totalDelta = "";

                                         // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                        valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                    break

                                    case "time" :
                                        var value = Math.round(value)

                                        totalDelta = Math.round(value) - Math.round(comparedValue)

                                        if ( totalDelta != 0 ) {
                                            totalPercentDelta = (totalDelta / comparedValue) * 100;
                                            totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                            totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                        } else {
                                            totalPercentDelta = 0;
                                        };

                                         // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                        valueToShow = utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
                                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//
                                    
                                    break

                                    case "currency" :
                                        var value = value
                                        
                                        totalDelta = value - comparedValue

                                        if ( totalDelta != 0 ) {
                                            totalPercentDelta = (totalDelta / comparedValue) * 100;
                                            totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                            totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                        } else {
                                            totalPercentDelta = 0;
                                        };

                                         // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                        valueToShow = "$" + value + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                    break

                                    default : 
                                        var percentOfTotal = value / report.data.totals[dateIndex].values[index]
                                        percentOfTotal = parseFloat(percentOfTotal).toFixed(4);
                                        percentOfTotalRaw = parseFloat(percentOfTotal * 100).toFixed(2);
                                        percentOfTotal = parseFloat(percentOfTotal * 100).toFixed(2) + '%';

                                        var value =  value;
                                        
                                        totalDelta = value - comparedValue

                                        if ( totalDelta != 0 ) {
                                            totalPercentDelta = (totalDelta / comparedValue) * 100;
                                            totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
                                            totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
                                        } else {
                                            totalPercentDelta = 0;
                                        };

                                         // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                        valueToShow = value + "<span class='percent'>(<em>" + percentOfTotal + "</em>) (" + totalPercentDelta + ") (" + totalDelta + ")</span>";
                                         // END THIS IS TO SEE THE OUTPUT IN A TABLE//

                                    break

                                }


                                 // THIS IS TO SEE THE OUTPUT IN A TABLE//
                                table.push('<td>', valueToShow, '</td>')
                                 // END THIS IS TO SEE THE OUTPUT IN A TABLE//
                                
                                /**
                                 *
                                 * REAL DATA RIGHT HERE
                                 *
                                */

                                 var fieldName = fieldNames[index]
                                dataRow[fieldName] = value;
                                dataRow[fieldName+'_percentOfTotal'] = percentOfTotalRaw;
                                
                                dataRow[fieldName+'_deltaChange'] = totalDelta;
                                dataRow[fieldName+'_percentChange'] = totalPercentDeltaRaw;


                                if ( row.dimensions.length > 0 ) { 
                                    var dimensionRaw = row.dimensions.join("");
                                    var subDimension = row.dimensions.join("").toLowerCase().replace(" ", "_");
                                    var combinedFieldName = fieldNames[index] + "__" + subDimension
                                } else {
                                    var combinedFieldName = fieldNames[index]
                                }
                                
                                fields.setFieldValue( googleAnalyticsData, combinedFieldName, timeframe, value, valueTypes[index] )

                                if ( insightGroup == 'lists') {
                                    //console.log('LIST Value', combinedFieldName, timeframe, value, valueTypes[index] )
                                    dataRow['primary_dimension'] = dimensionRaw;
                                    dataRow['secondary_dimension'] = subDimension;
                                    
                                }


                                if ( insightGroup == 'matchups' || multiDimension == true) {
                                    
                                    dataRow['primary_dimension'] = row.dimensions[0];
                                    dataRow['secondary_dimension'] = row.dimensions[1];

                                    if ( typeof row.dimensions[2] !== 'undefined' ) {
                                        dataRow['hostname'] = row.dimensions[2];
                                    }

                                }


                            })

                            if ( insightGroup == 'lists' || insightGroup == 'matchups') {
                                //console.log('Push data to asset listings', dataRow.primary_dimension, dataRow.secondary_dimension, dataRow)
                                googleAnalyticsData.metric_assets[currentReport][timeframe].list.push( dataRow )
                            }

                      
                        }

                        // THIS IS TO SEE THE OUTPUT IN A TABLE//
                        table.push('</tr>')
                        // END THIS IS TO SEE THE OUTPUT IN A TABLE//


                    })

                }
                
                

            })

            // THIS IS TO SEE THE OUTPUT IN A TABLE//
             table.push('</table>');
             output.push(table.join(''));
             // END THIS IS TO SEE THE OUTPUT IN A TABLE//

        } else {
            output.push('<p>No rows found:', ' ', reportName, ' ', index, ' ', insightGroup, "</p>");
        }


       // console.log("\n", emoji.get("beers"), '>>>>>> google data source', googleAnalyticsData)
       
       
       return output.join('');

};

