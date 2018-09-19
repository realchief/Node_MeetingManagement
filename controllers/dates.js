var _ = require('lodash');
var colors = require('colors');
var emoji = require('node-emoji')
const moment = require("moment");

module.exports = {

   
  getDateRangeNumDays : function(numDays, comparisonWindow) {

        var range = {};

        var numDays = numDays || 28
        comparisonWindow = comparisonWindow || "over"

        var dateRanges = {
          currentFromDate : moment().subtract(numDays, "days").startOf('day'),
          currentToDate : moment().subtract(1, "day").endOf('day'),
          comparedFromDate : moment().subtract(numDays*2, "days").startOf('day'),
          comparedToDate : moment().subtract(1, "day").subtract(numDays, "days").endOf('day'),
        }

        if ( comparisonWindow == "on") {
          dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(numDays, 'days').subtract(1, "year")
          dateRanges.comparedToDate = dateRanges.comparedToDate.add(numDays, 'days').subtract(1, "year")
        }

        var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
        var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
        var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
        var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

        var html = "";
        html += "<div class='cell'>"
        html += "<li class='date-window'"
        html += " data-current-from='" + currentFromDate  + "'"
        html += " data-current-to='" + currentToDate  + "'"
        html += " data-compared-from='" + comparedFromDate  + "'"
        html += " data-compared-to='" + comparedToDate  + "'"
        html += ">"
        html += "**** Last " + numDays + " days";
        if ( comparisonWindow == "on") { html += " (" + "compared to last year" + ") " }
        html += "<br />"
        html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
        html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
        html += "</li>"
        html += "</div>"

        //console.log("**** Last", numDays, "Days", "--", comparisonWindow, "--",  "Last", numDays, "Days")
        //console.log("Current Period: ", currentFromDate, '-', currentToDate)
        //console.log("Compared Period: ", comparedFromDate , '-', comparedToDate )

        range = {
          currentFromDate : currentFromDate,
          currentToDate : currentToDate,
          comparedFromDate : comparedFromDate,
          comparedToDate : comparedToDate,
          card : html
        }
        
        return range;
      },


    getDateRangeSince : function(sinceDate, comparisonWindow) {

      // includes today

      var range = {};

      var since = moment(sinceDate).startOf('day')
      var today = moment();
      var numDays = today.diff(since, 'days')+1
      // the +1 is "inclusive"


      comparisonWindow = comparisonWindow || "over"

      var dateRanges = {
        currentFromDate : moment().add(1, "day").subtract(numDays, "days"),
        currentToDate : moment(),
        comparedFromDate : moment().add(1, "day").subtract(numDays*2, "days"),
        comparedToDate : moment().subtract(numDays, "days").endOf('day'),
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(numDays, 'days').subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(numDays, 'days').subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** Since " + since.format( "MM-DD-YYYY" );
      html += " (" + numDays + " days" + ")";
      if ( comparisonWindow == "on") { html += " (" + "compared to last year" + ") " }
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }
      
      return range;
    },


    getDateRangeSincePreLastDate : function(sinceDate, preSinceDate, comparisonWindow) {

      var range = {};
      // includes today
      var since = moment(sinceDate).startOf('day')
      var today = moment();
      var numDays = today.diff(since, 'days')+1
      // the +1 is "inclusive"

      var compareDate = moment(preSinceDate).startOf('day')
      var numDaysSincePre = since.diff(compareDate, 'days')
      // does not include the compare date

      comparisonWindow = comparisonWindow || "over"

      var dateRanges = {
        currentFromDate : moment().add(1, "day").subtract(numDays, "days"),
        currentToDate : moment(),
        comparedFromDate : moment(preSinceDate).startOf('day'),
        comparedToDate : moment(sinceDate).subtract(1, "day").endOf('day'),
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(numDays, 'days').subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(numDays, 'days').subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** Since " + since.format( "MM-DD-YYYY" );
      html += " (" + numDays + " days" + ")";
      html += "<br />"
      html += "**** From " + compareDate.format( "MM-DD-YYYY" );
      html += " (" + numDaysSincePre + " days" + ")";
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }
      
      return range;
    },


    getDateRangeBetween : function(thisDate, lastDate, comparisonWindow) {

      // includes dates

      var range = {};


      var thisDate = moment(thisDate).startOf('day');
      var lastDate = moment(lastDate).endOf('day');
      var numDays = lastDate.diff(thisDate, 'days')+1
      // the +1 is "inclusive"

      comparisonWindow = comparisonWindow || "over"

      var dateRanges = {
        currentFromDate : thisDate,
        currentToDate : lastDate,
        comparedFromDate : moment(thisDate).subtract(numDays, "days"),
        comparedToDate : moment(lastDate).subtract(numDays, "days"),
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(numDays, 'days').subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(numDays, 'days').subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** Between " + thisDate.format( "MM-DD-YYYY" ) + " and " + lastDate.format( "MM-DD-YYYY" ) ;
      html += " (" + numDays + " days" + ")";
      if ( comparisonWindow == "on") { html += " (" + "compared to last year" + ") " }
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }
      
      return range;
    },

    getDateRangeBetweenCustom : function(currentFrom, currentTo, comparedFrom, comparedTo, comparisonWindow) {

      // includes dates

      var range = {};


      var thisDate = moment(currentFrom).startOf('day');
      var lastDate = moment(currentTo).endOf('day');
      var numDays = lastDate.diff(thisDate, 'days')+1

      var thisComparedDate = moment(comparedFrom).startOf('day');
      var lastComparedDate = moment(comparedTo).endOf('day');
      var numDaysCompared = lastComparedDate.diff(thisComparedDate, 'days')+1

      // the +1 is "inclusive"

      comparisonWindow = comparisonWindow || "over"

      var dateRanges = {
        currentFromDate : thisDate,
        currentToDate : lastDate,
        comparedFromDate : thisComparedDate,
        comparedToDate : lastComparedDate
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(numDays, 'days').subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(numDays, 'days').subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** Between " + thisDate.format( "MM-DD-YYYY" ) + " and " + lastDate.format( "MM-DD-YYYY" ) ;
      html += " (" + numDays + " days" + ")";
      html += "<br />"
      html += "**** And " + thisComparedDate.format( "MM-DD-YYYY" ) + " and " + lastComparedDate.format( "MM-DD-YYYY" ) ;
      html += " (" + numDaysCompared + " days" + ")";
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }
      
      return range;
    },


    getDateRange : function(timeframe, comparisonWindow) {

      var range = {};
      comparisonWindow = comparisonWindow || "over"

      // weeks are Sun-Sat. isoWeek is Mon-Sun.

      if ( timeframe == "isoWeek") {
        timeframe = "week";
        startOfTime = "isoWeek" 
        displayTimeframe = "isoWeek (Mon.-Sun.)"
      } else if (timeframe == "week") {
        startOfTime = timeframe;
        displayTimeframe = "week (Sun.-Sat.)"
      } else {
        startOfTime = timeframe;
        displayTimeframe = timeframe;
      }

      var dateRanges = {
        currentFromDate : moment().subtract(1, timeframe).startOf(startOfTime),
        currentToDate : moment().subtract(1, timeframe).endOf(startOfTime),
        comparedFromDate : moment().subtract(2, timeframe).startOf(startOfTime),
        comparedToDate : moment().subtract(2, timeframe).endOf(startOfTime),
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(1, timeframe).subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(1, timeframe).subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** Last " + displayTimeframe;
      if ( comparisonWindow == "on") { html += " (" + "compared to last year" + ") " }
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }
      
      return range;
    },


    getDateRangeUpToThis : function(timeframe, comparisonWindow) {

      // includes today //

      comparisonWindow = comparisonWindow || "over"

      if ( timeframe == "isoWeek") {
        timeframe = "week";
        startOfTime = "isoWeek" 
        displayTimeframe = "isoWeek (Mon.-Sun.)"
      } else if (timeframe == "week") {
        startOfTime = timeframe;
        displayTimeframe = "week (Sun.-Sat.)"
      } else {
        startOfTime = timeframe;
        displayTimeframe = timeframe;
      }

      var range = {};

      var dateRanges = {
        currentFromDate : moment().subtract(1, "day").startOf(startOfTime),
        currentToDate : moment().subtract(0, "day"),
        comparedFromDate : moment().subtract(1, "day").startOf(startOfTime).subtract(1, timeframe),
        comparedToDate : moment().subtract(0, "day").subtract(1, timeframe),
      }

      if ( comparisonWindow == "on") {
        dateRanges.comparedFromDate = dateRanges.comparedFromDate.add(1, timeframe).subtract(1, "year")
        dateRanges.comparedToDate = dateRanges.comparedToDate.add(1, timeframe).subtract(1, "year")
      }

      var currentFromDate = moment(dateRanges.currentFromDate).format( "MM-DD-YYYY" );
      var currentToDate = moment(dateRanges.currentToDate).format( "MM-DD-YYYY" );
      var comparedToDate = moment( dateRanges.comparedToDate ).format( "MM-DD-YYYY" );
      var comparedFromDate = moment( dateRanges.comparedFromDate ).format( "MM-DD-YYYY" );

      var html = "";
      html += "<div class='cell'>"
      html += "<li class='date-window'"
      html += " data-current-from='" + currentFromDate  + "'"
      html += " data-current-to='" + currentToDate  + "'"
      html += " data-compared-from='" + comparedFromDate  + "'"
      html += " data-compared-to='" + comparedToDate  + "'"
      html += ">"
      html += "**** This " + displayTimeframe
      if ( comparisonWindow == "on") { html += " (" + "compared to last year" + ") " }
      html += "<br />"
      html += "Current Period: " + currentFromDate + ' - ' + currentToDate + "<br />"
      html += "Compared Period: " +  comparedFromDate + ' - ' + comparedToDate + "<br />"
      html += "</li>"
      html += "</div>"

      //console.log("**** This", startOfTime, "--", comparisonWindow, "--", startOfTime)
      //console.log("Current Period: ", currentFromDate, '-', currentToDate)
      //console.log("Compared Period: ", comparedFromDate , '-', comparedToDate )

      range = {
        currentFromDate : currentFromDate,
        currentToDate : currentToDate,
        comparedFromDate : comparedFromDate,
        comparedToDate : comparedToDate,
        card : html
      }

      return range;
    },


    setDateWindow : function( timeWindow ) {

      var thisModule = this

      var defaultNumDays = 28
      var timeWindow = timeWindow || thisModule.getDateRangeNumDays(defaultNumDays);

      timeWindow = timeWindow || {
        currentFromDate :  moment().format("MM-DD-YYYY"),
        currentToDate :  moment().format("MM-DD-YYYY"),
        comparedFromDate : moment().format("MM-DD-YYYY"),
        comparedToDate :  moment().format("MM-DD-YYYY")
      }


      var currentReadable = timeWindow.currentFromDate + ' - ' + timeWindow.currentToDate
      var comparedReadable = timeWindow.comparedFromDate + ' - ' + timeWindow.comparedToDate

      return {

        currentFromDate : moment(timeWindow.currentFromDate, "MM-DD-YYYY").format("YYYY-MM-DD"),
        currentToDate : moment(timeWindow.currentToDate, "MM-DD-YYYY").format("YYYY-MM-DD"),
        comparedFromDate : moment(timeWindow.comparedFromDate, "MM-DD-YYYY").format("YYYY-MM-DD"),
        comparedToDate : moment(timeWindow.comparedToDate, "MM-DD-YYYY").format("YYYY-MM-DD"),
        
        /* make em readable */

        currentReadable : currentReadable,
        comparedReadable : comparedReadable,
        dateWindowReadable : [ currentReadable, comparedReadable ],
        currentFromDateReadable : timeWindow.currentFromDate,
        currentToDateReadable : timeWindow.currentToDate,
        comparedFromDateReadable : timeWindow.comparedFromDate,
        comparedToDateReadable : timeWindow.comparedToDate,

      }

  },

 

}