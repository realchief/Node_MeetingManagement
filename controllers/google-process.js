let express = require('express');
let router = express.Router();
let passport = require('passport');
let Model = require('../models');
let Async = require('async');
const moment = require("moment");

let googleApi = require('../controllers/google-api');

var colors = require('colors');
var emoji = require('node-emoji')
var _ = require('lodash');
var utilities = require('../controllers/utilities')


exports.process = ( gUser, cb ) => {

    var thisModule = this

    googleApi.getAllMetrics(gUser, function( err, results ) {

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

         thisModule.gaColumns = results.metrics.both.results.gaColumns
         thisModule.goalNames = results.metrics.both.results.goals.metricsList
         thisModule.dateWindowReadable = results.metrics.both.dateWindow.dateWindowReadable

        _.forEach( insightGroups, function( insightGroup, index ) {

            var group = results.metrics.both.results[insightGroup]
        
            _.forEach( group.data.reports, function( report, index ) {

                var reportName = "";
                var basedIndex = index+1;
        
                if ( typeof reportNames[insightGroup] !== 'undefined') {
                    if ( typeof reportNames[insightGroup][index] !== 'undefined') {
                        reportName = reportNames[insightGroup][index];
                    }
                }                   


                console.log(index)

                var tableResponse = thisModule.metricsTable(report, index, reportName, insightGroup)
                metricsOutputTable.push(tableResponse)

            })

         })

        results.metricsTable = metricsOutputTable.join('')
        
        cb ( null, results )
    
    })
    
}


exports.metricsTable = ( report, index, reportName, insightGroup ) => {

    var output = [];
    var dimensionsCount = 0;
    var aggregatedByDate = false;
    var valueTypes = [];
    var fieldNames = [];
    var dimensionNames = [];
    var multiDimension = false;
    var reportName = reportName || "";
    var table = ['<table>'];
    var thisModule = this
    
    if (report.data.rows && report.data.rows.length) {
        
            var justTotals = false;
            
          // Put headers in table.

            table.push('<tr>');

            if ( typeof report.columnHeader.dimensions != 'undefined') {
                

                _.forEach( report.columnHeader.dimensions, function( dimension, index ) {

                    table.push('<th>', thisModule.gaColumns[dimension].uiName, '</th>')
                    dimensionNames.push(dimension.split('ga:')[1]);

                })

                //table.push('<th>', report.columnHeader.dimensions.join('</th><th>'), '</th>');
                dimensionsCount = report.columnHeader.dimensions.length
                aggregatedByDate = report.columnHeader.dimensions.indexOf('ga:date') >= 0;


            
            } else {

                justTotals = true;

            } 

            table.push('<th>Date range</th>');

            if ( typeof report.columnHeader.metricHeader.metricHeaderEntries != 'undefined') {

                _.forEach( report.columnHeader.metricHeader.metricHeaderEntries, function( header, index ) {
                     valueTypes.push(header.type)
                     fieldNames.push(header.name.split("ga:")[1])

                     if ( typeof thisModule.gaColumns[header.name] !== 'undefined') {
                        table.push('<th>', thisModule.gaColumns[header.name].uiName, '</th>');                 
                    } else {
                        table.push('<th>', thisModule.goalNames[index].name, '</th>');         
                    }

                } )

            }

            table.push('</tr>');

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
                    
                    var label = "";
                    var dateIndex = index;
                    var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';

                    if ( timeframe == 'current') {
                        comparedRange = report.data.totals[1].values
                    } else {
                        comparedRange = report.data.totals[0].values
                    }

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

                    if ( typeof dateRange.values != 'undefined') {

                        table.push('<td>', thisModule.dateWindowReadable[index], '</td>')

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

                                    valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                

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

                            
                                    valueToShow = utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
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

                                    valueToShow = "$" + value +  "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                

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

                                        valueToShow = value + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>";

                                        //valueToShow = value;
                                break

                            }

                            table.push('<td>', valueToShow, '</td>')


                        })

                   }

                    table.push('</tr>')


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

                var label = "";

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

                    
                        table.push('<tr>')
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

                        if ( typeof dateRange.values != 'undefined') {

                            var metric = "";
                            var dateIndex = index;
                            metric = thisModule.dateWindowReadable[index]

                       
                            // Put metric values for the current date range
                            table.push('<td>', metric, '</td>')

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
                                        valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"

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

                            
                                        valueToShow = utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
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

                                        valueToShow = "$" + value + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
                                    

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

                                        valueToShow = value + "<span class='percent'>(<em>" + percentOfTotal + "</em>) (" + totalPercentDelta + ") (" + totalDelta + ")</span>";
                                    break

                                }


                                table.push('<td>', valueToShow, '</td>')

                                
                        
                            })

                      
                        }


                        table.push('</tr>')



                    })

                }
                
                

            })

             table.push('</table>');
             output.push(table.join(''));

        } else {
            output.push('<p>No rows found:', ' ', reportName, ' ', index, ' ', insightGroup, "</p>");
        }


       return output.join('');

       

};

