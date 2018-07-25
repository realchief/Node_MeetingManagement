var FT = FT || {};

FT.dates = {

setDateRange : {

		// base range
		// compared range

		getDateRangeNumDays : function(numDays, comparisonWindow) {

			var range = {};

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

			$('.date-windows-last').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-since').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-since-pre').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-between').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-between-custom').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-range').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
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

			$('.date-windows-this').append(html)

			range = {
				currentFromDate : currentFromDate,
				currentToDate : currentToDate,
				comparedFromDate : comparedFromDate,
				comparedToDate : comparedToDate,
			}

			return range;
		}

	},


	displayAllDateChoosers: function() {

		// using the day before today as the start date
		//FT.dates.setDateRange.getDateRangeNumDays(0)
		//FT.dates.setDateRange.getDateRangeNumDays(1)
		//FT.dates.setDateRange.getDateRangeNumDays(0, 'on')
		//FT.dates.setDateRange.getDateRangeNumDays(1, 'on')
		FT.dates.setDateRange.getDateRangeNumDays(3)
		FT.dates.setDateRange.getDateRangeNumDays(3, 'on')
		FT.dates.setDateRange.getDateRangeNumDays(7)
		FT.dates.setDateRange.getDateRangeNumDays(28)
		FT.dates.setDateRange.getDateRangeNumDays(30)

		FT.dates.setDateRange.getDateRange('week')
		FT.dates.setDateRange.getDateRange('isoWeek')
		FT.dates.setDateRange.getDateRange('month')
		FT.dates.setDateRange.getDateRange('quarter')
		FT.dates.setDateRange.getDateRange('year')

		FT.dates.setDateRange.getDateRange('week', "on")
	
		FT.dates.setDateRange.getDateRangeUpToThis('week')
		FT.dates.setDateRange.getDateRangeUpToThis('isoWeek')
		FT.dates.setDateRange.getDateRangeUpToThis('month')
		FT.dates.setDateRange.getDateRangeUpToThis('quarter')
		FT.dates.setDateRange.getDateRangeUpToThis('year')

		FT.dates.setDateRange.getDateRangeUpToThis('month', "on")
		FT.dates.setDateRange.getDateRangeUpToThis('quarter', "on")
		FT.dates.setDateRange.getDateRangeUpToThis('year', "on")

		// compared to last meeting, same timeframe to compare to
		FT.dates.setDateRange.getDateRangeSince('2018-02-18')
		FT.dates.setDateRange.getDateRangeSince('2018-02-18', 'on')
		
		// since last meeting - but compared to an arbitrary before "since" (meeting 2 months ago, perhaps)
		FT.dates.setDateRange.getDateRangeSincePreLastDate('2018-02-18', '2018-02-10')

		// between a date range, compared to same timeframe
		FT.dates.setDateRange.getDateRangeBetween('2018-02-10', '2018-02-20')
		FT.dates.setDateRange.getDateRangeBetween('2018-02-10', '2018-02-20', 'on')

		// between two date ranges
		FT.dates.setDateRange.getDateRangeBetweenCustom('2018-02-10', '2018-02-20', '2018-01-15', '2018-01-19')


		FT.dates.updateDateBanner();

	},

	updateDateBanner : function() {


		$('span.current-from').html(moment(FT.defaults.currentFromDate).format( "MM-DD-YYYY" ))
		$('span.current-to').html(moment(FT.defaults.currentToDate).format( "MM-DD-YYYY" ))
		$('span.compared-from').html(moment(FT.defaults.comparedFromDate).format( "MM-DD-YYYY" ))
		$('span.compared-to').html(moment(FT.defaults.comparedToDate).format( "MM-DD-YYYY" ))

	},

	setDatePickers : function() { 


		$('.date-range-since-picker').val('02-18-2018')
		
		$('.date-range-since-picker').dateRangePicker({
			autoClose: true,
			format: 'MM-DD-YYYY',
			singleDate : true,
			showShortcuts: false,
			singleMonth: true,
			separator: ' - ',
			endDate : moment(),
			getValue: function() {

				var date = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				return moment(date).format("MM-DD-YYYY");
			
			},
			setValue: function(s, s1, s2) {

				if(!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
					$(this).val(s);
				}

				var date = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")

				$('.date-windows-since').html("");
				// compared to last meeting, same timeframe to compare to
				FT.dates.setDateRange.getDateRangeSince(date)
				FT.dates.setDateRange.getDateRangeSince(date, 'on')

			}
		})



		$('.date-range-since-pre-picker-current').val('02-18-2018')
		$('.date-range-since-pre-picker-compared').val('02-10-2018')
		
		$('.date-range-since-pre-picker-current').dateRangePicker({
			autoClose: true,
			format: 'MM-DD-YYYY',
			singleDate : true,
			showShortcuts: false,
			singleMonth: true,
			separator: ' - ',
			endDate : moment(),
			getValue: function() {

				var date = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				return moment(date).format("MM-DD-YYYY");
			
			},
			setValue: function(s, s1, s2) {

				if(!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
					$(this).val(s);
				}

				var currentFromDate = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentToDate = moment($(".date-range-since-pre-picker-compared").val(), "MM-DD-YYYY").format("YYYY-MM-DD")

				$('.date-windows-since-pre').html("");
				// compared to last meeting, same timeframe to compare to
				FT.dates.setDateRange.getDateRangeSincePreLastDate(currentFromDate, currentToDate)

			}
		})


		$('.date-range-since-pre-picker-compared').dateRangePicker({
			autoClose: true,
			format: 'MM-DD-YYYY',
			singleDate : true,
			showShortcuts: false,
			singleMonth: true,
			separator: ' - ',
			endDate : moment(),
			getValue: function() {

				var date = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				return moment(date).format("MM-DD-YYYY");
			
			},
			setValue: function(s, s1, s2) {

				if(!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
					$(this).val(s);
				}

				var currentToDate = moment($(this).val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentFromDate = moment($(".date-range-since-pre-picker-current").val(), "MM-DD-YYYY").format("YYYY-MM-DD")

				$('.date-windows-since-pre').html("");
				// compared to last meeting, same timeframe to compare to
				FT.dates.setDateRange.getDateRangeSincePreLastDate(currentFromDate, currentToDate)


			}
		})

		$('.date-range-between-from').val('02-10-2018')
		$('.date-range-between-to').val('02-20-2018')

		$('.date-range-between-picker').dateRangePicker({
			format: 'MM-DD-YYYY',
			separator: ' - ',
			endDate : moment(),
			showShortcuts: true,
			shortcuts : {
				'prev-days': [3,7,28,30],
				'prev': ['week','month','year'],
				'next-days':null,
				'next':null
			},
			customShortcuts: [

			{
				name: 'This Q',
				dates : function()
				{
					var start = moment().startOf('quarter').toDate()
					var end = moment().toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},

			{
				name: 'Last Q',
				dates : function()
				{
					var start = moment().subtract(1, 'quarter').startOf('quarter').toDate()
					var end = moment().subtract(1, 'quarter').endOf('quarter').toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},


			],
			getValue: function() {
				if ($('.date-range-between-from').val() && $('.date-range-between-to').val() )
					return $('.date-range-between-from').val() + ' - ' + $('.date-range-between-to').val();
				else
					return '';
			},
			setValue: function(s, s1, s2) {

				$('.date-windows-between').html("");
				$('.date-range-between-from').val(s1);
				$('.date-range-between-to').val(s2);
				
				var currentFromDate = moment(s1, "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentToDate = moment(s2, "MM-DD-YYYY").format("YYYY-MM-DD")

				FT.dates.setDateRange.getDateRangeBetween(currentFromDate, currentToDate)
				FT.dates.setDateRange.getDateRangeBetween(currentFromDate, currentToDate, 'on')


			}
		})				



		$('.date-range-between-custom-from-current').val('02-10-2018')
		$('.date-range-between-custom-to-current').val('02-20-2018')

		$('.date-range-between-custom-from-compared').val('01-15-2018')
		$('.date-range-between-custom-to-compared').val('01-19-2018')

		$('.date-range-between-custom-picker-current').dateRangePicker({
			format: 'MM-DD-YYYY',
			separator: ' - ',
			endDate : moment(),
			showShortcuts: true,
			shortcuts : {
				'prev-days': [3,7,28,30],
				'prev': ['week','month','year'],
				'next-days':null,
				'next':null
			},
			customShortcuts: [

			{
				name: 'This Q',
				dates : function()
				{
					var start = moment().startOf('quarter').toDate()
					var end = moment().toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},

			{
				name: 'Last Q',
				dates : function()
				{
					var start = moment().subtract(1, 'quarter').startOf('quarter').toDate()
					var end = moment().subtract(1, 'quarter').endOf('quarter').toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},


			],
			getValue: function() {
				if ($('.date-range-between-custom-from-current').val() && $('.date-range-between-custom-to-current').val() )
					return $('.date-range-between-custom-from-current').val() + ' - ' + $('.date-range-between-custom-to-current').val();
				else
					return '';
			},
			setValue: function(s, s1, s2) {

				$('.date-windows-between-custom').html("");
				$('.date-range-between-custom-from-current').val(s1);
				$('.date-range-between-custom-to-current').val(s2);
				
				var currentFromDate = moment(s1, "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentToDate = moment(s2, "MM-DD-YYYY").format("YYYY-MM-DD")

				var comparedFromDate = moment($('.date-range-between-custom-from-compared').val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				var comparedToDate = moment($('.date-range-between-custom-to-compared').val(), "MM-DD-YYYY").format("YYYY-MM-DD")

				FT.dates.setDateRange.getDateRangeBetweenCustom(currentFromDate, currentToDate, comparedFromDate, comparedToDate)


			}
		})				

		$('.date-range-between-custom-picker-compared').dateRangePicker({
			format: 'MM-DD-YYYY',
			separator: ' - ',
			endDate : moment(),
			showShortcuts: true,
			shortcuts : {
				'prev-days': [3,7,28,30],
				'prev': ['week','month','year'],
				'next-days':null,
				'next':null
			},
			customShortcuts: [

			{
				name: 'This Q',
				dates : function()
				{
					var start = moment().startOf('quarter').toDate()
					var end = moment().toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},

			{
				name: 'Last Q',
				dates : function()
				{
					var start = moment().subtract(1, 'quarter').startOf('quarter').toDate()
					var end = moment().subtract(1, 'quarter').endOf('quarter').toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},


			],
			getValue: function() {
				if ($('.date-range-between-custom-from-compared').val() && $('.date-range-between-custom-to-compared').val() )
					return $('.date-range-between-custom-from-compared').val() + ' - ' + $('.date-range-between-custom-to-compared').val();
				else
					return '';
			},
			setValue: function(s, s1, s2) {

				$('.date-windows-between-custom').html("");
				$('.date-range-between-custom-from-compared').val(s1);
				$('.date-range-between-custom-to-compared').val(s2);
				
				var comparedFromDate = moment(s1, "MM-DD-YYYY").format("YYYY-MM-DD")
				var comparedToDate = moment(s2, "MM-DD-YYYY").format("YYYY-MM-DD")

				var currentFromDate = moment($('.date-range-between-custom-from-current').val(), "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentToDate = moment($('.date-range-between-custom-to-current').val(), "MM-DD-YYYY").format("YYYY-MM-DD")

				FT.dates.setDateRange.getDateRangeBetweenCustom(currentFromDate, currentToDate, comparedFromDate, comparedToDate)


			}
		})			




		$('.date-picker-current').dateRangePicker({
			format: 'MM-DD-YYYY',
			separator: ' - ',
			applyBtnClass: 'apply-button',
			stickyMonths : true,
			autoClose: false,
			endDate : moment(),
			showShortcuts: true,
			shortcuts : {
				'prev-days': [3,7,28,30],
				'prev': ['week','month','year'],
				'next-days':null,
				'next':null
			},
			customShortcuts: [

			{
				name: 'This Q',
				dates : function()
				{
					var start = moment().startOf('quarter').toDate()
					var end = moment().toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},

			{
				name: 'Last Q',
				dates : function()
				{
					var start = moment().subtract(1, 'quarter').startOf('quarter').toDate()
					var end = moment().subtract(1, 'quarter').endOf('quarter').toDate()
					// start.setDate(1);
					// end.setDate(30);
					return [start,end];
				}
			},


			],
			getValue: function() {
				return $('.date-picker-current span.current-from').html() + ' - ' + $('.date-picker-current span.current-to').html();
			},
		
			setValue: function(s, s1, s2) {

				$('.date-picker-current span.current-from').html(s1);
				$('.date-picker-current span.current-to').html(s2);
				
				var currentFromDate = moment(s1, "MM-DD-YYYY").format("YYYY-MM-DD")
				var currentToDate = moment(s2, "MM-DD-YYYY").format("YYYY-MM-DD")

				var dates = FT.dates.setDateRange.getDateRangeBetween(currentFromDate, currentToDate)
				FT.app.setDateWindow(dates)

				$('.date-picker-compared span.compared-from').html(dates.comparedFromDate);
				$('.date-picker-compared span.compared-to').html(dates.comparedToDate);

				//
			}

		})
		.bind('datepicker-closed',function() {
			FT.app.refreshDataSources();
		})


		

		$('.date-picker-compared').dateRangePicker({
			format: 'MM-DD-YYYY',
			separator: ' - ',
			endDate : moment(),
			stickyMonths : true,
			getValue: function() {
				return $('.date-picker-compared span.compared-from').html() + ' - ' + $('.date-picker-compared span.compared-to').html();
			},
		
			setValue: function(s, s1, s2) {

				$('.date-picker-compared span.compared-from').html(s1);
				$('.date-picker-compared span.compared-to').html(s2);
				
				var comparedFromDate = moment(s1, "MM-DD-YYYY").format("YYYY-MM-DD")
				var comparedToDate = moment(s2, "MM-DD-YYYY").format("YYYY-MM-DD")

				var currentFromDate = moment($('.date-picker-current span.current-from').html(), "MM-DD-YYYY").format("YYYY-MM-DD");
				var currentToDate = moment($('.date-picker-current span.current-to').html(), "MM-DD-YYYY").format("YYYY-MM-DD");

				var dates = FT.dates.setDateRange.getDateRangeBetweenCustom(currentFromDate, currentToDate, comparedFromDate, comparedToDate)
				FT.app.setDateWindow(dates)

			}
		})					
		.bind('datepicker-closed',function() {
			FT.app.refreshDataSources();
		})

	}
}