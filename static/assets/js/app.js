var FT = FT || {};

FT.defaults = {
	
	// last week over last week //
	today : moment(),

	//numDays : 28,
	numDays : 7,
	currentFromDate : '',
	currentToDate : '',
	comparedFromDate : '',
	comparedToDate : '',
	
	facebookAggregationPeriod : 'day', // aggregation period enum{day, week, days_28, month, lifetime, total_over_range}
	facebookDatePreset : 'today', // how many dates to show today, yesterday, this_month, last_month, this_quarter, 
									// lifetime, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_week_mon_sun, 
									// last_week_sun_sat, last_quarter, last_year, this_week_mon_today, this_week_sun_today, this_year

	useFacebookDatePresets : false,
	todayFormatted : moment().format('YYYY-MM-DD'),

	// weekly
	// monthly
	// quarterly
	// yearly
	// range
	// last 30
	// last 28

	
	chooseWhenPropertyListed : true,


	//74031509 presidio
	//162207172 lg
	googleAnalyticsProfileId : "74031509",

	// 10461186460 ben jerry
	facebookPropertyId : "165315920184098",
	facebookCalls : 0,
	googleCalls : 0,


}

FT.app = {
	
	init : function() {

		this.bindUI();
		
		var range = FT.dates.setDateRange.getDateRangeNumDays(FT.defaults.numDays);
		this.setDateWindow(range)

		FT.dates.displayAllDateChoosers();
		this.process()
		
	},


	doAll : function() {

		$.each( ['reset', 'platform', 'metricsEditor'], function( index, endpoint ) {
			FT.process[endpoint]()
		})

		FT.insights.make();

		//console.log('>>> NUMBER OF FACEBOOK CALLS:', FT.defaults.facebookCalls)
		//console.log('>>> NUMBER OF GOOGLE CALLS:', FT.defaults.googleCalls)
		//console.log('>>> GOOGLE POSTS META', FT.data.data_sources.google_analytics.metric_assets)

		console.log('>>> asset insights', FT.insights.data.asset_insights)
		console.log('>>> platform insights', FT.insights.data.platform_insights)
		console.log('>>> bucket insights', FT.insights.data.bucket_insights)

		FT.insights.afterInsights();

	},

	process : function() {

		FT.app.doAll();

		$.each ( FT.data.data_sources, function( dataSourceName, dataSource ) {
			console.log( "DATA SOURCE METRICS >>>> ", dataSourceName, dataSource  )
		})

		$.each ( FT.data.platform, function( categoryName, category ) {
			console.log( "platform METRICS >>>> ", categoryName, category  )
		})

		$.each ( FT.data.buckets, function( bucketName, bucket ) {
			console.log( "bucket METRICS >>>> ", bucketName, bucket  )
		})

		
	},

	

	bindUI: function() {

		FastClick.attach(document.body);

		
		$( 'body' ).on( "click", ".restart", function() {
			FT.app.restart();
		});

		$( 'body' ).on( "click", ".button, .quick-button", function() {
			FT.app.updateMetrics();
			FT.app.process();
		});

		$( 'body' ).on( "click", ".date-window", function() {
			
			var dateRanges = {
				currentFromDate : $(this).attr('data-current-from'),
				currentToDate : $(this).attr('data-current-to'),
				comparedFromDate : $(this).attr('data-compared-from'),
				comparedToDate :$(this).attr('data-compared-to')
			}

			/* Refresh data sources */

			FT.app.refreshDataSources(dateRanges);

		});

		$( 'body' ).on( "click", ".location-toggle", function() {
			$(this).closest('div.editor').toggleClass('right')
		});


		$( 'body' ).on( "keypress", ".metric input", function(e) {
			var key = e.which;
			 if(key == 13)  // the enter key code
			  {
			  	//console.log($(this).attr('data-source'), $(this).attr('data-field'), $(this).val(), $(this).attr('data-timeframe') )
			 	//$(this).closest('div.metrics-editor').find('.button').trigger('click');
				
			 	FT.app.updateMetrics();
				FT.app.process();

				//console.log($(this).attr('name'))

				var input = $('input[name=' + $(this).attr('name') + ']')
				input.focus();
				input[0].selectionStart = input[0].selectionEnd = input.val().length;

				return false;  
			  }
		})

		$('a.jump[href^="#"]').on('click',function (e) {
		    e.preventDefault();

		    $('header a').removeClass('current')
		    var link = $(this)

		    var target = this.hash;
		    var $target = $(target);

		    $.scrollTo( $(target), { 
		    	duration: 200, 
		    	offset: -70,
		    	onAfter: function(target) {
		    		$(link).addClass('current');
		    	}

		    })

		});

		$( 'body' ).on( "click", ".emailer", function() {
			
			var emailContent = $('.email-content').html()

			var today = new Date();
			var todayDisplay = moment(today).format( "dddd, MMMM Do, YYYY [at] h:mm a" );
			var todayShort = moment(today).format( "ddd, MMMM D" );

			var replacements = {
				sender : 'Direct Tester',
				meeting_time: todayDisplay,
				meeting_date: todayShort,
				summary: "In-Page Test",
				subject: 'MeetBrief for',
				headline: FT.insights.data.bucket_insights.headline,
				interest_change: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_interest')[0].positiveMappingsCount - FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_interest')[0].negativeMappingsCount,
				interest_score: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_interest')[0].totalScore,
				interest_status: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_interest')[0].mappingsStatus,
				interest_chart: 'chart-1.png',
				engagement_change: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_engagement')[0].positiveMappingsCount - FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_engagement')[0].negativeMappingsCount,
				engagement_score: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_engagement')[0].totalScore,
				engagement_status: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'user_engagement')[0].mappingsStatus,
				engagement_chart: 'chart-2.png',
				demand_change: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'demand')[0].positiveMappingsCount - FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'demand')[0].negativeMappingsCount,
				demand_score: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'demand')[0].totalScore,
				demand_status: FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'name', 'demand')[0].mappingsStatus,
				demand_chart: 'chart-2.png',
				action_items: FT.insights.data.action_items,
				talking_points: FT.insights.data.talking_points
			}

			console.log(replacements)

			var toSend = {
				to : $('.recipients').val(),
				template : 'template',
				replacements : replacements
			}

			$.ajax({
				url: '/send/',
				method: "POST",
				data: toSend
			}).done( function(response) {
				console.log('RESPONSE FROM EMAILER:', response)
				//$('.test').append(response.html)
			}).fail( function(response) {
				console.log('FAIL FROM EMAILER:', response)
			})
		
		});

	},

	setDateWindow : function(timeWindow) {

		timeWindow = timeWindow || {
			currentFromDate :  moment(FT.defaults.currentFromDate).format("MM-DD-YYYY"),
			currentToDate :  moment(FT.defaults.currentToDate).format("MM-DD-YYYY"),
			comparedFromDate : moment(FT.defaults.comparedFromDate).format("MM-DD-YYYY"),
			comparedToDate :  moment(FT.defaults.comparedToDate).format("MM-DD-YYYY")
		}

		FT.defaults.currentFromDate = moment(timeWindow.currentFromDate, "MM-DD-YYYY").format("YYYY-MM-DD")
		FT.defaults.currentToDate = moment(timeWindow.currentToDate, "MM-DD-YYYY").format("YYYY-MM-DD")
		FT.defaults.comparedFromDate = moment(timeWindow.comparedFromDate, "MM-DD-YYYY").format("YYYY-MM-DD")
		FT.defaults.comparedToDate = moment(timeWindow.comparedToDate, "MM-DD-YYYY").format("YYYY-MM-DD")

		
		/* make em readable */

		FT.defaults.currentReadable = timeWindow.currentFromDate + ' - ' + timeWindow.currentToDate
		FT.defaults.comparedReadable = timeWindow.comparedFromDate + ' - ' + timeWindow.comparedToDate
		FT.defaults.dateWindowReadable = [ FT.defaults.currentReadable, FT.defaults.comparedReadable ]
		FT.defaults.currentFromDateReadable = timeWindow.currentFromDate
		FT.defaults.currentToDateReadable = timeWindow.currentToDate
		FT.defaults.comparedFromDateReadable = timeWindow.comparedFromDate
		FT.defaults.comparedToDateReadable = timeWindow.comparedToDate

	},

	refreshDataSources : function(timeWindow) {

		console.log('refresh>>>>>', timeWindow)

		FT.app.setDateWindow(timeWindow)
		
		FT.connector.google.getAllMetrics(FT.defaults.googleAnalyticsProfileId , FT.defaults.googleAnalyticsPropertyName)
		FT.connector.facebook.getAllMetrics(FT.defaults.facebookPropertyName , FT.defaults.facebookPropertyId, FT.defaults.facebookPropertyToken)

		FT.dates.updateDateBanner();

	},

	updateMetrics : function() {

 		$.each ( FT.data.data_sources, function( dataSourceName, dataSource ) {

			$.each ( dataSource.fields, function( fieldName, field ) {

					$.each ( dataSource.meta.timeframes, function( timeframe ) {

						changedInput = "";
						inputName = dataSourceName + "_" + fieldName + "_" + timeframe;
						changedInput += ' value="' + field.data.values[timeframe] + '"'
						changedInput += ' data-source="' + dataSourceName + '"'
						changedInput += ' data-timeframe="' + timeframe + '"'
						changedInput += ' data-field="' + fieldName + '"'

						existingValue = FT.data.data_sources[dataSourceName].fields[fieldName].data.values[timeframe];
						newValue = Math.round($("input[name='" + inputName + "']").val())
						if ( existingValue != newValue) {
							console.log( existingValue + ' --> ' + newValue)
							FT.data.data_sources[dataSourceName].fields[fieldName].data.values[timeframe] = newValue
						}
						

					})

				})


 		})

	}
}

FT.app.init();
