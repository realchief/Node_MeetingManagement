var FT = FT || {};

FT.connector = FT.connector || {}

FT.connector.google = {

	defaults : {
		CLIENT_ID : '542032120426-5mi2jcld1sn6k2qprbejtt0ci4p275np.apps.googleusercontent.com',
		SCOPES : ['https://www.googleapis.com/auth/analytics.readonly'],
		
		insightGroups : [ 'metrics', 'events', 'lists', 'goals', 'matchups'],
		reportNames : {
			'metrics' : {
				1 : 'hostname'
			},
			'lists' : {
				0 : 'overall_totals',
			}
		}
	},
	
	init : function() {
		//console.log('init')
		this.bindUI();
		this.authorize()
		// Loads the JavaScript client library and invokes `start` afterwards.
	},

	authorize : function(event) {

		// Handles the authorization flow.
		// `immediate` should be false when invoked from the button click.

		var useImmdiate = event ? false : true;
		var authData = {
		  client_id: this.defaults.CLIENT_ID,
		  scope: this.defaults.SCOPES,
		  immediate: useImmdiate,
		  access_type : 'offline'
		};

  /*  'serverAuth': {
      'access_token': '{{ ACCESS_TOKEN_FROM_SERVICE_ACCOUNT }}'
    }
   */

		gapi.auth.authorize(authData, function(response) {
		
			var button = $('.google-authorize-button')
		  	//console.log('***** Google API initial response', response)
		  
		  if (response.error) {
		  
		  	button.find('.title').html('Connect Google Analytics')
		  	console.log('****** NOT AUTHORIZED for Google API **********')
		 
		  }
		  else {

		  	console.log("GOOGLE AUTHORIZE>>>", response)
		 
		  	button.find('.title').html('Google Analytics Connected')
	   	  	$('.google-manage-button').css({
	   	  		'display' : 'inline-block'
	   	  	})
	   	  	console.log('****** AUTHORIZED for Google API **********')
		    FT.connector.google.getAccounts();
		 
		  }
		});


	},

	getAccounts : function() {



		// Load the Google Analytics client library.
		gapi.client.load('analytics', 'v3').then(function() {


			gapi.client.analytics.metadata.columns.list({ 'reportType' : 'ga'}).then( function(response) {

				
				FT.connector.google.gaColumns = {}

				$.each( response.result.items, function(index, column) {

					//console.log(column)

					FT.connector.google.gaColumns[column.id] = column.attributes;

				})


			})

			/**
			 *
			 * account summary
			 *
	 		*/

			gapi.client.analytics.management.accountSummaries.list().then( function(response) {

				if (response && !response.error) {

					//console.log('*** ALL GA ACCOUNTS', response)

					 $('.google-accounts').html("")
					    var html = "";
					    var html = "<h5 class='label ga-user'>GA Accounts (" + response.result.username + ") </h5>"
					
					    /**
						 *
						 * accounts
						 *
				 		*/

					    $.each( response.result.items, function(index, account) {

					    	html += "<h4 class='label ga-account'>"
				    		html += account.name + " (" + account.id + ") "
				    		html += "</h4>"
					    		/**
								 *
								 * properties
								 *
						 		*/
					    		
					    	
					    		$.each( account.webProperties, function(index, property) {
					    			
					    			//console.log('PROPERTY>>>', property)

					    			html += "<h5 class='label ga-property' "
					    			html += " data-id='" + property.id + "' data-internalId='" + property.internalWebPropertyId + "'"
									html += ">"
					    			html += "Property: ";
					    			html += property.name + " (" + property.id + ") " + "(" + property.internalWebPropertyId + ")" + " (" + property.websiteUrl + ")"
					    			html += "</h5>"


					    			
					    				/**
										 *
										 * profiles
										 *
								 		*/

						    			html += "<ul>"
						    			$.each( property.profiles, function(index, profile) {
						    				
						    				html += "<li class='ga-account ga-view'"
											html += " data-id='" + profile.id + "'"
											html += " data-internal-web-property-id='" + property.internalWebPropertyId + "'"
											html += " data-web-property-id='" + property.id + "'"
											html += " data-account-id='" + account.id+ "'"
											html += " data-property-name='" + property.name + " - " + profile.name + " (" + profile.id + ")" + "'"
											html += " >"
							    				html += profile.name + " (" + profile.id + ") " 
							    				html += "<span class='property-chooser'>" + "Use" + "</span>"

							    				
							    				html += "</li>"
							    		})
							    
							    		html += "</ul>"
					    			
					    			html += "</li>"
					    		})
					    		
					 		
				        })

				    
				    	$('.google-accounts').append(html)

				    	if ( FT.defaults.chooseWhenPropertyListed ) {
				    		$('[data-id=' + FT.defaults.googleAnalyticsProfileId + ']').trigger('click')
				    	}


				} else {
					console.log('There was an error: ' + response.message);
				}
			})


			

		})

	},


	getGoals : function() {

		var deferred = [];
 		deferred['goals'] = new $.Deferred();

		 var dfd1 = new $.Deferred();

 		gapi.client.analytics.management.goals.list({
 			'accountId': FT.defaults.googleAnalyticsAccountId,
    		'webPropertyId': FT.defaults.googleAnalyticsWebProperty,
    		'profileId': FT.defaults.googleAnalyticsProfileId
    	}).then(function(response)  {

    		var goals = [];
    		var metrics = [];

	   		if ( typeof response.result != 'undefined') {

	   			//console.log(response.result.items)

	   			$.each( response.result.items, function(index, goal) {
	   				
	   				var details = ""
	   				if (goal.urlDestinationDetails) {
				  		details = goal.urlDestinationDetails
				    } else if (goal.eventDetails) {
				       details = goal.eventDetails
				     }

				     goals.push( {
				     	id : goal.id,
				     	name : goal.name,
				     	type : goal.type,
				     	details : details
				     })

				     metrics.push( {	
				     	metricName: 'ga:goal' + goal.id + 'Completions',
				     	name : goal.name
				     })

	   			})

	   			FT.data.data_sources.google_analytics.metric_assets['goals'] = metrics

	   			dfd1.resolve({	
	   				goalsList : goals,
	   				metricsList : metrics
	   			})

	   		} else {


	   		}

	    }, console.error.bind(console));


    	var dfds = [ dfd1 ]
		$.when.apply($, dfds).done( function( goals ) {

			deferred['goals'].resolve( { 
		    	goals : goals
		    });

   		})


    	return deferred['goals'].promise();

	},

	getMetrics : function(viewId, property, timeframe) {


		/**
		 *
		 * dates
		 *
 		*/

 		var deferred = [];
 		deferred[timeframe] = new $.Deferred();

	    var currentSince = moment(FT.defaults.currentFromDate).format( "YYYY-MM-DD" );
		var currentUntil = moment(FT.defaults.currentToDate).format( "YYYY-MM-DD" );

		var comparedSince = moment( FT.defaults.comparedFromDate ).format( "YYYY-MM-DD" );
		var comparedUntil = moment( FT.defaults.comparedToDate ).format( "YYYY-MM-DD" );
	

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

        var aggregationPeriod = 'day';


        var dfd1 = new $.Deferred();

		gapi.client.request({
	      path: '/v4/reports:batchGet',
	      root: 'https://analyticsreporting.googleapis.com/',
	      method: 'POST',
	      body: {
	        reportRequests: [
	         
	        	
	         
	         {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	            "dimensions" : [],
	            "metrics" : [
	            	{ expression: 'ga:pageviews' },
	            	{ expression: 'ga:users' },
	            	{ expression: 'ga:entrances' },
	            	{ expression: 'ga:sessions' },
	            	{ expression: 'ga:exits' },
	            	{ expression: 'ga:bounceRate' },
	            	{ expression: 'ga:avgSessionDuration' },
	            	{ expression: 'ga:sessionDuration' },
	            	{ expression: 'ga:avgTimeOnPage' },
	            	{ expression: 'ga:timeOnPage' },

	            ],
	             "orderBys" : [],
	           
			  pageSize : 1
	          },


	          {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	            "dimensions" : [
	            	{ "name" : "ga:hostname" },
	            ],
	            "metrics" : [
	            	{ expression: 'ga:sessions' },
	           
	            ],
	             "orderBys" : [
	             {
				      fieldName : "ga:sessions",
				      sortOrder : 'DESCENDING',
				    },
				],
	           
			  pageSize : 1
	          },

	          

	        ]
	      }
	    }).then(function(response)  {

	    FT.defaults.googleCalls = FT.defaults.googleCalls + 1;

	   	if ( typeof response.result != 'undefined') {


	    		/**
				 *
				 * report
				 *
		 		*/

		 		//console.log('***** GA response one', {	response: response, property: property, id : viewId })
	    		
	    		dfd1.resolve({	
	    			response: response, 
	    			property: property, 
	    			id : viewId,
	    			aggregationPeriod : aggregationPeriod })
		    	}

	    }, console.error.bind(console));


	    var dfd2 = new $.Deferred();

		gapi.client.request({
	      path: '/v4/reports:batchGet',
	      root: 'https://analyticsreporting.googleapis.com/',
	      method: 'POST',
	      body: {
	        reportRequests: [
	         	{
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	{ "name" : "ga:eventCategory" },
	           ],
	            "metrics" : [
	            	{ expression: 'ga:eventValue' },        	
	            ],
	            "dimensionFilterClauses": [{
			          "filters": [
			          	{
			              "dimensionName": "ga:eventCategory",
			              "operator": "REGEXP",
			              "expressions": ["Riveted"]
			          	}
			          ]
			      }],
	             pageSize : 20,
	             "orderBys" : [
				    {
				      fieldName : "ga:eventValue",
				      sortOrder : 'DESCENDING',
				      orderType : "VALUE"
				    },
				 ]
	          },
	        ]
	      }
	    }).then(function(response)  {

	    FT.defaults.googleCalls = FT.defaults.googleCalls + 1;

	   	if ( typeof response.result != 'undefined') {


	    		/**
				 *
				 * report
				 *
		 		*/

		 		//console.log('***** GA response', {	response: response, property: property, id : viewId })
	    		
	    		dfd2.resolve({	
	    			response: response, 
	    			property: property, 
	    			id : viewId,
	    			aggregationPeriod : aggregationPeriod 
	    		})
		    }

	    }, console.error.bind(console));


	    // lists
	    var dfd3 = new $.Deferred();

		gapi.client.request({
	      path: '/v4/reports:batchGet',
	      root: 'https://analyticsreporting.googleapis.com/',
	      method: 'POST',
	      body: {
	        reportRequests: [
	         
     		{
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	//{ "name" : "ga:pageTitle" },
	            	{ "name" : "ga:pagePath"}
	           ],
	            "metrics" : [
	            	{ expression: 'ga:pageviews' },
	            	{ expression: 'ga:sessions' },
	            	{ expression: 'ga:entrances' },
	            	{ expression: 'ga:newUsers' },
	            	{ expression: 'ga:bounceRate' },
	            	{ expression: 'ga:avgTimeOnPage' },	              	
	            	{ expression: 'ga:timeOnPage' },	       
	            ],
	             pageSize : 100,
	             "orderBys" : [
				    {
				      fieldName : "ga:pageviews",
				      sortOrder : 'DESCENDING',
				      //orderType : "DELTA"
				    },
				 ]
	          },


	          //https://developers.google.com/analytics/devguides/reporting/core/v4/basics#filtering

	         
	          {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	//{ "name" : "ga:pageTitle" },
	            	{ "name" : "ga:pagePath"},
	            	{ "name" : "ga:userType" },
	           ],
	            "metrics" : [
	            	{ expression: 'ga:sessions' },
	            ],
	             pageSize : 200,
	             "orderBys" : [
				    {
				      fieldName : "ga:sessions",
				      sortOrder : 'DESCENDING',
				      //orderType : "DELTA"
				    },
				 ],
				"dimensionFilterClauses": [{
			          "filters": [{
			              "dimensionName": "ga:userType",
			              "operator": "REGEXP",
			              "expressions" : ["Returning"]
			          }]
			      }]
	          },


	          {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	{ "name" : "ga:userType" },
	           ],
	            "metrics" : [
	            	//{ expression: 'ga:users' },
	            	{ expression: 'ga:sessions' },
	            	{ expression: 'ga:bounceRate' }	              	
	            ],
	             pageSize : 20,
	             "orderBys" : [
				    {
				      fieldName : "ga:sessions",
				      sortOrder : 'DESCENDING'
				    },
				 ]
	          },

			{
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	{ "name" : "ga:channelGrouping" },
	           ],
	            "metrics" : [
	            	//{ expression: 'ga:users' },
	            	{ expression: 'ga:sessions' },
	            	{ expression: 'ga:bounceRate' }	              	
	            ],
	             pageSize : 20,
	             "orderBys" : [
				    {
				      fieldName : "ga:sessions",
				      sortOrder : 'DESCENDING',
				     // orderType : "DELTA"
				    },
				 ]
	          },   

	        ]
	      }
	    }).then(function(response)  {

	    	 FT.defaults.googleCalls = FT.defaults.googleCalls + 1;

	   	if ( typeof response.result != 'undefined') {


	    		/**
				 *
				 * report
				 *
		 		*/

		 		//console.log('***** GA response 3', {	response: response, property: property, id : viewId })
	    		
		 		dfd3.resolve({	
	    			response: response, 
	    			property: property, 
	    			id : viewId,
	    			aggregationPeriod : aggregationPeriod 
	    		})
		    }

	    }, console.error.bind(console));



		/**
		 *
		 * goal names
		 *
 		*/


 		 var dfd4 = new $.Deferred();

 		 var goalExpressions = [];

 		 $.each( FT.data.data_sources.google_analytics.metric_assets.goals, function(index, goal) {
 		 	goalExpressions.push( { 
 		 		expression: goal.metricName,
 		 		//alias : goal.name
 		 	})
 		 })

 		 goalExpressions = goalExpressions.slice(0,9)

 		 goalExpressions.push( { 
 		 	expression: 'ga:goalCompletionsAll', 
 		 	//alias: 'All Completions' 
 		 })

 		gapi.client.request({
	      path: '/v4/reports:batchGet',
	      root: 'https://analyticsreporting.googleapis.com/',
	      method: 'POST',
	      body: {
	        reportRequests: [
	         
     		{
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	            "metrics" : goalExpressions.slice(0,10),
	             pageSize : 10,
	             /*"orderBys" : [
				    {
				      fieldName : FT.data.data_sources.google_analytics.metric_assets.goals[0],
				      sortOrder : 'DESCENDING'
				    },
				 ]*/
				includeEmptyRows : 'true'
	          },

	          {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "metrics" : [
	            	{ expression: 'ga:transactionRevenue' },
	            	{ expression: 'ga:transactions' },
	            	
	            ],
	             pageSize : 200,
	          	includeEmptyRows : 'true'
	          },

	          {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	{ "name" : "ga:productName" },
	           ],
	             "metrics" : [
	            	{ expression: 'ga:itemRevenue' },
	            	
	            ],
	             "orderBys" : [
				    {
				      fieldName : "ga:itemRevenue",
				      sortOrder : 'DESCENDING',
				     // orderType : "DELTA"
				    }
				 ],

	             pageSize : 200,
	          	includeEmptyRows : 'true'
	          },

	        ]
	      }
    	}).then(function(response)  {

    		 FT.defaults.googleCalls = FT.defaults.googleCalls + 1;

    			if ( typeof response.result != 'undefined') {


	    		/**
				 *
				 * report
				 *
		 		*/

		 		//console.log('***** GOALS response', {	response: response, property: property, id : viewId })
	    		
	    		dfd4.resolve({	
	    			response: response, 
	    			property: property, 
	    			id : viewId,
	    			aggregationPeriod : aggregationPeriod 
	    		})
		    }

	    }, console.error.bind(console));


    	var dfd5 = new $.Deferred();

		gapi.client.request({
	      path: '/v4/reports:batchGet',
	      root: 'https://analyticsreporting.googleapis.com/',
	      method: 'POST',
	      body: {
	        reportRequests: [
	         
     	      {
	            "viewId" : viewId,
	            "dateRanges" : dateRanges,
	             "dimensions" : [
	            	//{ "name" : "ga:pageTitle" },
	            	{ "name" : "ga:pagePath" },
	            	{ "name" : "ga:pageTitle" },
	            	{ "name" : "ga:hostname" }
	           ],
	            "metrics" : [
	            	{ expression: 'ga:pageviews' },
	            ],
	             pageSize : 200,
	             "orderBys" : [
				    {
				      fieldName : "ga:pageviews",
				      sortOrder : 'DESCENDING',		 
				    },
				 ]
	          },

	        ]
	      }
	    }).then(function(response)  {

	    	 FT.defaults.googleCalls = FT.defaults.googleCalls + 1;

	   	if ( typeof response.result != 'undefined') {


	    		/**
				 *
				 * report
				 *
		 		*/

		 		 //FT.data.data_sources.google_analytics.metric_assets.posts = {};

		 		//console.log('***** GA response', {	response: response, property: property, id : viewId })
	    		
	    		dfd5.resolve({	
	    			response: response, 
	    			property: property, 
	    			id : viewId,
	    			aggregationPeriod : aggregationPeriod 
	    		})
		    }

	    }, console.error.bind(console));

	    /**
		 *
		 * when we get all the data, do something with it.
		 *
 		*/

	    var dfds = [ dfd1, dfd2, dfd3, dfd4, dfd5 ]
		$.when.apply($, dfds).done( function( metrics, events, lists, goals, matchups ) {

			deferred[timeframe].resolve( { 
		    	metrics : metrics,
		    	events : events,
		    	lists : lists,
		    	goals : goals,
		    	matchups : matchups
		    });

   		})

   		return deferred[timeframe].promise();


	},

	getAllMetrics : function(viewId, property) {

		//FT.data.data_sources.google_analytics.metric_assets = {}
		//console.log('Google Meta Data:', FT.data.data_sources.google_analytics.metric_assets)
		
		var currentProcess = FT.connector.google.getMetrics(viewId, property, 'both')
	
		var dfds = [ currentProcess ]

		$.when.apply($, dfds).done( function( both ) {

			$('.ga-data').html('')
			$('.ga-data').html("<h4>" + property + "</h4>")

			//console.log(both)
	
			var insightGroups = FT.connector.google.defaults.insightGroups;
			var reportNames = FT.connector.google.defaults.reportNames;
			//console.log(reportNames)

			$.each ( insightGroups, function( index, insightGroup ) {

				var group = both[insightGroup]
		
				if (!group.response.code) {

					$.each( group.response.result.reports, function(index, report) {

						var reportName = "";
						var basedIndex = index+1;
						$('.ga-data').append("<h4>" + 'Group: ' + insightGroup + ' report ' + basedIndex + "</h4>")

						if ( typeof reportNames[insightGroup] !== 'undefined') {
							if ( typeof reportNames[insightGroup][index] !== 'undefined') {
								reportName = reportNames[insightGroup][index];
							}
						}					

						FT.connector.google.processMetrics(report, index, reportName, insightGroup)

					})

				} else {

					console.log('There was an error: ' + a.response.message);

				}

			})

			//console.log('*** Google Analytics: DO ALL ***')
			FT.app.doAll();

			//$('.fb-table').append(current.output.join(''));
			//$('.fb-table').append(compared.output.join(''));

		})

	},


	processMetrics : function(report, index, reportName, insightGroup) {
		
	 	 var output = [];
	 	 var dimensionsCount = 0;
	 	 var aggregatedByDate = false;
	 	 var valueTypes = [];
	 	 var fieldNames = [];
	 	 var dimensionNames = [];
	 	 var multiDimension = false;
	 	 var reportName = reportName || "";

	 	 /*if ( reportName) {
	 		 console.log('Report Name>>>', reportName)
	 	 }*/

	 	if (report.data.rows && report.data.rows.length) {
        
	    	var justTotals = false;
	    	var table = ['<table>'];

        	// Put headers in table.

        	table.push('<tr>');

        	if ( typeof report.columnHeader.dimensions != 'undefined') {
		 		

        		$.each( report.columnHeader.dimensions, function(index, dimension) {

        			table.push('<th>', FT.connector.google.gaColumns[dimension].uiName, '</th>')
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

	        	$.each( report.columnHeader.metricHeader.metricHeaderEntries, function( index, header ) {
	        		 valueTypes.push(header.type)
	        		 fieldNames.push(header.name.split("ga:")[1])

	        		 if ( typeof FT.connector.google.gaColumns[header.name] !== 'undefined') {
	        		 	table.push('<th>', FT.connector.google.gaColumns[header.name].uiName, '</th>');	        		
        			} else {
        				table.push('<th>', FT.data.data_sources.google_analytics.metric_assets.goals[index].name, '</th>');	        
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


			 if ( reportName == 'hostname') {

			 	//console.log('HOSTNAME HOSTNAME')

			 }

        	/**
			 *
			 * Totals
			 *
	 		*/

	 		if ( typeof report.data.totals != 'undefined' ) {
		 		
		 		$.each( report.data.totals, function( index, dateRange ) {
		 			
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

    	            	table.push('<td>', FT.defaults.dateWindowReadable[index], '</td>')

    	            	$.each ( dateRange.values, function( index, value ) {

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

							
    	            				valueToShow = FT.utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
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
			

					 		FT.process.setFieldValue( 'google_analytics', combinedFieldName, timeframe, value, valueTypes[index] )


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

        	$.each( report.data.rows, function( index, row ) {

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

			 		// SOMEWHERE HERE RESET THE metric_assets, when clicking alternate source, we're combining sources
			 		/*if ( typeof FT.data.data_sources.google_analytics.metric_assets[currentReport] !== 'undefined' ) {
			 			FT.data.data_sources.google_analytics.metric_assets[currentReport]['current'].list = [];
			 			FT.data.data_sources.google_analytics.metric_assets[currentReport]['compared'].list = [];
			 		}*/

			 		if ( currentReport == 'channelGrouping_sessions_bounceRate') {
			 			//console.log('data row', currentReport, row)
			 		}

        			$.each( row.metrics, function( index, dateRange ) {

        				var dateIndex = index;
        				var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';
        				var dataRow = {};

       					
						if ( timeframe == 'current') {
        					comparedRange = row.metrics[1]
        				} else {
        					comparedRange = row.metrics[0]
        				}

        				if ( typeof FT.data.data_sources.google_analytics.metric_assets[currentReport] == 'undefined' ) {
					 		FT.data.data_sources.google_analytics.metric_assets[currentReport] = {};
					 	}

        				if ( typeof FT.data.data_sources.google_analytics.metric_assets[currentReport][timeframe] == 'undefined' ) {
					 		FT.data.data_sources.google_analytics.metric_assets[currentReport][timeframe] = {};
					 	}

					 	if ( typeof FT.data.data_sources.google_analytics.metric_assets[currentReport][timeframe].list == 'undefined' ) {
					 		FT.data.data_sources.google_analytics.metric_assets[currentReport][timeframe].list = [];
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
			           		metric = FT.defaults.dateWindowReadable[index];

			           
			            	// Put metric values for the current date range
			           		table.push('<td>', metric, '</td>')

			           		$.each ( dateRange.values, function( index, value ) {

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

							
	    	            				valueToShow = FT.utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
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


    	            			var fieldName = fieldNames[index]
					 			dataRow[fieldName] = value;
					 			dataRow[fieldName+'_percentOfTotal'] = percentOfTotalRaw;
					 			
					 			dataRow[fieldName+'_deltaChange'] = totalDelta;
					 			dataRow[fieldName+'_percentChange'] = totalPercentDeltaRaw;

					 			/*if ( typeof percentOfTotal != "undefined") {
					 				dataRow['percentOfTotal'].push( { field: fieldName, delta: percentOfTotalRaw })
					 			}*/

	    	            		table.push('<td>', valueToShow, '</td>')

	    	            		
	    	            		/**
								 *
								 * REAL DATA RIGHT HERE
								 *
						 		*/

						 		if ( row.dimensions.length > 0 ) { 
						 			var dimensionRaw = row.dimensions.join("");
						 			var subDimension = row.dimensions.join("").toLowerCase().replace(" ", "_");
						 			var combinedFieldName = fieldNames[index] + "__" + subDimension
						 		} else {
						 			var combinedFieldName = fieldNames[index]
						 		}
					 			
					 			FT.process.setFieldValue( 'google_analytics', combinedFieldName, timeframe, value, valueTypes[index] )

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
					 			FT.data.data_sources.google_analytics.metric_assets[currentReport][timeframe].list.push( dataRow )
	    	            	}

			           	}


			           	table.push('</tr>')



	        		})

        		}
        		
        		

        	})

	    	 table.push('</table>');
	    	 output.push(table.join(''));

    	} else {
       		output.push('<p>No rows found.</p>');
      	}

	 	  outputToPage(output.join(''));

		function outputToPage(output) {
  			$('.ga-data').append(output)
  		}

	},




	signOut : function() {

		console.log('deauthorize')

		var token = gapi.auth.getToken();
	
	    $.ajax({
	         url:"https://accounts.google.com/o/oauth2/revoke?token=" + token.access_token,
	         dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
	         success:function(json){
	             console.log(arguments);
	             // do stuff with json (in this case an array)
	   
	         },
	         error:function(){
	         },
	    });

	    gapi.auth.disconnect();
   	  	gapi.auth.signOut();

	},

	bindUI : function() {

		// Add an event listener to the 'auth-button'.

		$( 'body' ).on( "click", ".google-authorize-button", function(e) {
			FT.connector.google.authorize(e)
		});

		$( 'body' ).on( "click", ".google-deauthorize-button", function(e) {
			FT.connector.google.signOut(e)
		});

		$( 'body' ).on( "click", ".ga-view", function(e) {
			FT.defaults.googleCalls = 0
			var viewId = $(this).attr('data-id');
			var property = $(this).attr('data-property-name');

			var webProperty = $(this).attr('data-web-property-id');
			var accountId = $(this).attr('data-account-id');


			FT.defaults.googleAnalyticsProfileId = viewId
			FT.defaults.googleAnalyticsPropertyName = property
			FT.defaults.googleAnalyticsWebProperty = webProperty
			FT.defaults.googleAnalyticsAccountId = accountId


			// clear all data meta
			FT.data.data_sources.google_analytics.metric_assets = {}

			// get goals first
			var goals = FT.connector.google.getGoals()
			var dfds = [ goals ]
			
			$.when.apply($, dfds).done( function( beforeMetrics ) {
				//console.log('>>> before metrics load', beforeMetrics.goals.goalsList, beforeMetrics.goals.metricsList.join(',') )
				FT.connector.google.getAllMetrics(viewId, property)
			})
		
			if (e.originalEvent !== undefined) {
				$('a[href="#data-source-metrics"]').trigger('click');
			}

		});

	}

}

//FT.connector.google.init()



