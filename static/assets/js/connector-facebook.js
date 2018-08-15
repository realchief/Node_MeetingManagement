

var FT = FT || {};

FT.connector = FT.connector || {}

FT.connector.facebook = {

	defaults : {
		CLIENT_ID : '558059437903012',
		APP_SECRET : 'b11fe91db9aebf8f5c437974ac990e58',
	
		// for neil
		LONG_LIVED_TOKEN  : 'EAAH7jVaPTKQBAJ1S11sOAZBMlnixQQ7adSbxzd6oIbHzazr9OIOmnKxHEzxTUpNziUcO7UuhAyVj3E74gtPuoOPzb95CebPtxlTyCTmbELQJqtqlGmhYH0E8cLkYqoahRjyhaUIhMNLwb822BBQFzIMhhPtEZD'
	},

	init : function() {
		//console.log('init')
		this.bindUI();
	},

	authorize : function(response) {

		if ( !$('body').hasClass('frontend') ) return

		if (response.status === 'connected') {
			//console.log('Facebook: We are authorized for facebook')
			var uid = response.authResponse.userID;
			accessToken = response.authResponse.accessToken;

			FT.connector.facebook.defaults.SHORT_USER_TOKEN = accessToken;
			//console.log('FACEBOOK AFTER FIRST-TIME LOGIN>>>', response)
	
			FT.connector.facebook.onLogin();

			
		} else if (response.status === 'not_authorized') {
			console.log('Facebook: We are not authorized for facebook')

			FT.connector.facebook.onLogin();

		} else {
			// the user isn't logged in to Facebook.
			console.log('Facebook: Not logged into facebook')

			FT.connector.facebook.onLogin();

		}
	},

	login : function() {

		var theScope = 'email,read_insights,manage_pages';

		FB.login(function(response) {
		    
		    if (response.authResponse) {
		   		console.log('Welcome!  Fetching your information.... ');
				console.log('FACEBOOK FIRST-TIME LOGIN>>>', response)

				FT.connector.facebook.defaults.SHORT_USER_TOKEN = response.authResponse.accessToken;

		     	FT.connector.facebook.onLogin();
		    } else {
		    	console.log('User cancelled login or did not fully authorize.');
		    }
		}, { scope: theScope, display: 'popup' })


	},

	onLogin : function() {

		//console.log('ON LOGIN>>>')
		FB.api('/me', {
			//access_token : FT.connector.facebook.defaults.LONG_LIVED_TOKEN
		}, function(response) {
			
			if ( typeof response.error !== 'undefined') {
				console.log('FACEBOOK LOGIN ERROR>>>', response.error)
				return false
			}

			console.log('Good to see you, ' + response.name + '.');
			$('.facebook-deauthorize-button').css({
	   	  		'display' : 'inline-block'
	   	  	})
			
			FT.connector.facebook.getAccounts();

     });

	},

	displayAccounts : function(response) {

		/**
		 *
		 * pages
		 *
		*/

		//console.log('ACCOUNTS>>>', response)

		$('.facebook-accounts').html("")
		var html = "";
		var html = "<h4 class='label'>Facebook Page Accounts for (" + response.name + ") </h4>"

		//console.log('>>>>>> FACEBOOK RESPONSE', response)
		

		 /**
		 *
		 * metrics
		 *
 		*/

		html += "<ul>"
		

		if ( typeof response.accounts == 'undefined') {

			html += "<li class='fb-account'>"
				html += "This Facebook User does not have any pages for insights"
    			html += "</li>"

		} else {

			$.each(response.accounts.data, function(index, account) {

				html += "<li class='fb-account'"
				html += " data-id='" + account.id + "' data-token='" + account.access_token + "'"
				html += ' data-name="' + account.global_brand_page_name + ' (' + account.id + ')' + '"'
				html += " >"
				html += account.global_brand_page_name + " (" + account.id + ") "
				html += "<span class='property-chooser'>" + "Use" + "</span>"
    			html += "</li>"

    		})
							    		

			html += "</ul>"

		}

		$('.facebook-accounts').append(html)


		if ( FT.defaults.chooseWhenPropertyListed ) {
		    $('[data-id=' + FT.defaults.facebookPropertyId + ']').trigger('click')
		   }

	},


	getAccounts : function(){

		//total_over_range


		fbFields = 'name,first_name,middle_name,last_name,email,accounts{name,global_brand_page_name,id,access_token,link,username}';

	
		FB.api('/me', {
			//access_token : FT.connector.facebook.defaults.LONG_LIVED_TOKEN,
			fields : fbFields,
			return_ssl_resources: 1 
		}, function(response) {

			FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

			if (!response || response.error) {
				console.log('Facebook info Error occured' + ' ' + response.error);
				console.log(response.error)
	  		} else {

	  			 FT.connector.facebook.displayAccounts(response)
			}

		})

	},

	getMetrics : function(account_name, id, token, timeframe) {

	
		console.log('*********** CALLED FACEBOOK APIS ****')

		/**
		 *
		 * dates
		 *
 		*/

 		var deferred = [];
 		deferred[timeframe] = new $.Deferred();

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

			/*
			var since = moment(FT.defaults.currentFromDate).format( "YYYY-MM-DD 00:00" );
			var until = moment(FT.defaults.currentToDate).add(1, 'day').format( "YYYY-MM-DD 23:59" );
			*/


			// MAKE INLINE WITH FB SUMMARY
			var since = moment(FT.defaults.currentFromDate).subtract(1, 'day').format( "YYYY-MM-DD 00:00" );
			var until = moment(FT.defaults.currentToDate).format( "YYYY-MM-DD 23:59" );

			var sinceForPosts = moment(FT.defaults.currentFromDate).format( "YYYY-MM-DD 00:00" );
			var untilForPosts = moment(FT.defaults.currentToDate).format( "YYYY-MM-DD 23:59" );

			var sinceDisplay = FT.defaults.currentFromDate;
			var untilDisplay = FT.defaults.currentToDate;


		} else {

			/*var since = moment( FT.defaults.comparedFromDate).format( "YYYY-MM-DD 00:00" );
			var until = moment( FT.defaults.comparedToDate ).add(1, 'day').format( "YYYY-MM-DD 23:59" );
			*/

			// MAKE INLINE WITH FB SUMMARY
			var since = moment( FT.defaults.comparedFromDate).subtract(1, 'day').format( "YYYY-MM-DD 00:00" );
			var until = moment( FT.defaults.comparedToDate ).format( "YYYY-MM-DD 23:59" );

			var sinceForPosts = moment(FT.defaults.comparedFromDate).format( "YYYY-MM-DD 00:00" );
			var untilForPosts = moment(FT.defaults.comparedToDate).format( "YYYY-MM-DD 23:59" );

			var sinceDisplay = FT.defaults.comparedFromDate;
			var untilDisplay = FT.defaults.comparedToDate;

		}

		if ( FT.defaults.useFacebookDatePresets ) {
			since = "";
			until = "";
			sinceDisplay = "";
			untilDisplay = "";
		}

		//console.log( '+++', timeframe, ' **** Since', since, until)
		//console.log( '+++', timeframe, ' **** Until', since, until)

		/**
		 *
		 * lifetime fan count - this count is over -all- global properties
		 *
 		*/


		var dfd1 = new $.Deferred();

		FB.api(id, {
			access_token : token,
			fields : 'fan_count,engagement,global_brand_page_name,name,name_with_location_descriptor,posts'
		}, function (response) {

				FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		      if (response && !response.error) {

		   		var aggregationPeriod = 'lifetime'
		      
		        console.log('>>>>>> FACEBOOK INSIGHTS' + account_name + ' ' + id, response)
	       
	        	dfd1.resolve({ 
		        	response : response, 
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod, 
		        	account_name : account_name 
		        });

		      } else {
		      	 console.log('>>>>>> DFD1 FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		


		/**
		 *
		 * main insights over the aggregation period
		 *
 		*/

		var dfd2 = new $.Deferred();

		FB.api(id + "/insights", {
			access_token : token,
			metric : 'page_impressions,page_post_engagements,page_consumptions,page_video_views_unique,page_consumptions_unique,page_consumptions_by_consumption_type_unique,page_engaged_users,page_positive_feedback_by_type,page_negative_feedback_by_type,page_video_views,page_video_views_by_paid_non_paid',
			period : FT.defaults.facebookAggregationPeriod, // usually 'day'
			date_preset : FT.defaults.facebookDatePreset,
			since : since,
			until : until,
			show_description_from_api_doc : 'true'
		}, function (response) {
		      if (response && !response.error) {

		        FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		        var table = [];
		        var aggregationPeriod = FT.defaults.facebookAggregationPeriod

		        //console.log('>>>>>> FACEBOOK INSIGHTS ' + account_name + ' ' + timeframe, response)

		        dfd2.resolve({ 
		        	response : response,
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod,  
		        	account_name : account_name 
		        });


		      } else {
		      	 console.log('>>>>>> DFD2 FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		/**
		 *
		 * daily only insights
		 *
 		*/


		var dfd3 = new $.Deferred();

		FB.api(id + "/insights", {
			access_token : token,
			metric : 'page_fan_adds,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds_by_paid_non_paid_unique,page_video_view_time,page_story_adds_unique',
			period : 'day',
			date_preset : FT.defaults.facebookDatePreset,
			since : since,
			until : until,
			show_description_from_api_doc : 'true'
		}, function (response) {
		      
				FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		      if (response && !response.error) {
		      //console.log('>>>>>> FACEBOOK INSIGHTS ' + account_name + ' ' + timeframe, response)

		       var aggregationPeriod = 'day'

		        dfd3.resolve({ 
		        	response : response, 
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod, 
		        	account_name : account_name 
		        });
				

		      } else {
		      	 console.log('>>>>>> DFD3 FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		/**
		 *
		 * lifetime only insights
		 *
 		*/


		var dfd4 = new $.Deferred();

		FB.api(id + "/insights", {
			access_token : token,
			metric : 'page_fans',
			period : 'lifetime',
			date_preset : FT.defaults.facebookDatePreset,
			since : since,
			until : until,
			show_description_from_api_doc : 'true'
		}, function (response) {
		     if (response && !response.error) {
		     	
		     	//console.log('>>>>>> FACEBOOK INSIGHTS ' + account_name + ' ' + timeframe, response)

		     	FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		     	var aggregationPeriod = 'lifetime'

		        dfd4.resolve({ 
		        	response : response,
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod, 
		        	account_name : account_name 
		        });
	
		      } else {
		      	 console.log('>>>>>> DFD4 FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }


		    }
		);

		/**
		 *
		 * posts
		 *
 		*/

		var dfd5 = new $.Deferred();

		FB.api(id + '/posts/', {
			access_token : token,
			limit : 50,
			fields : 'created_time,message,id,type,link,permalink_url',
			date_preset : FT.defaults.facebookDatePreset,
			since : sinceForPosts,
			until : untilForPosts,
			show_description_from_api_doc : 'true'
		}, function (response) {
		      
		      
				FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		      if (response && !response.error) {

		      	var postListing = response
		   		var table = [];
		   		var aggregationPeriod = 'lifetime'
		      
		       //console.log('>>>>>> FACEBOOK WINDOW ' + sinceForPosts + ' ' + untilForPosts)
		       //console.log('>>>>>> POSTS RESPONSE ', response);
		       

		       /* POST INSIGHTS */

		       var batchPosts = [];

		       if (response.paging && response.paging.next) {
					
					console.log('THERE ARE MORE PAGING ITEMS FOR POSTS >>>', response.paging.next )
					
					/*FB.api( response.paging.next , function ( response ) {

						console.log( 'INSIDE PAGING >>>>> ');

						if (response && !response.error) {
							console.log('>>> paged next', response)
						} else {
							console.log('>>>>>> FACEBOOK INSIGHTS ERROR' + account_name + ' ' + id, response)
			      	 		console.log(response.error)
						}
		      
					})*/

				}


		       $.each( response.data, function(index, post) {

		       		var postObject = {
				    	access_token : token,
				    	period : 'lifetime',
				   		metric : 'post_impressions_unique,post_engaged_users,post_video_avg_time_watched,post_video_length,post_video_views,post_video_view_time,post_impressions_paid_unique,post_clicks,post_clicks_by_type_unique,post_activity,post_activity_by_action_type',
						show_description_from_api_doc : 'true',
						include_headers: 'false'
					}

					var queryParams = $.param(postObject)
				
					batchPosts.push({
						method : 'get',
						relative_url : post.id + "/insights/" + '?' + queryParams
					})

		       })

		 
		    	FB.api( '/', 'post', {
		    		batch : batchPosts,
		    		access_token : token,
		    	}, 	function(response) {

		    		FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;

		    		if (response && !response.error) {

		    			var postInsights = response;

		    			/*$.each( response, function( index, response ) {
		    				var object = JSON.parse(response.body);
		    				console.log('>>>>>> BATCH RESPONSE', timeframe, object)
		    			})*/

		    			var aggregationPeriod = 'day'


				        dfd5.resolve({ 
				        	postListing : postListing,
				        	postInsights : postInsights,
				        	window : sinceDisplay + ' - ' + untilDisplay,
				        	aggregationPeriod : aggregationPeriod, 
				        	account_name : account_name 
				        });

		    		} else {
				      	 console.log('>>>>>> BATCH POSTS FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
				      	 console.log(response.error)
				      }


		    	} )
	

		      } else {
		      	 console.log('>>>>>> POSTS FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		/**
		 *
		 * 28_day only insights
		 *
 		*/


		var dfd6 = new $.Deferred();

		FB.api(id + "/insights", {
			access_token : token,
			metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
			period : 'days_28',
			date_preset : FT.defaults.facebookDatePreset,
			since : since,
			until : until,
			show_description_from_api_doc : 'true'
		}, function (response) {
		      if (response && !response.error) {
		      
		      FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;
		      //console.log('>>>>>> FACEBOOK INSIGHTS ' + account_name + ' ' + timeframe, response)

		       var aggregationPeriod = '28_days'

		        dfd6.resolve({ 
		        	response : response, 
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod, 
		        	account_name : account_name 
		        });
				

		      } else {
		      	 console.log('>>>>>> DAYS_28 FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		/**
		 *
		 * 7_day only insights
		 *
 		*/


		var dfd7 = new $.Deferred();

		FB.api(id + "/insights", {
			access_token : token,
			metric : 'page_impressions_paid_unique,page_impressions_viral_unique,page_impressions_unique,page_impressions_organic_unique,page_impressions_nonviral_unique,page_posts_impressions_unique,page_posts_impressions_organic_unique,page_posts_impressions_paid_unique,page_engaged_users',
			period : 'week',
			date_preset : FT.defaults.facebookDatePreset,
			since : since,
			until : until,
			show_description_from_api_doc : 'true'
		}, function (response) {
		      if (response && !response.error) {
		      
		      FT.defaults.facebookCalls = FT.defaults.facebookCalls + 1;
		      //console.log('>>>>>> FACEBOOK INSIGHTS ' + account_name + ' ' + timeframe, response)

		       var aggregationPeriod = 'week'

		   	    dfd7.resolve({ 
		        	response : response, 
		        	window : sinceDisplay + ' - ' + untilDisplay,
		        	aggregationPeriod : aggregationPeriod, 
		        	account_name : account_name 
		        });
				

		      } else {
		      	 console.log('>>>>>> WEEK FACEBOOK INSIGHTS ERROR ' + account_name + ' ' + id, timeframe, response)
		      	 console.log(response.error)
		      }
		    }
		);


		/**
		 *
		 * once all the API calls from above are done, combine them into an object to manipulate later
		 *
 		*/

		var dfds = [ dfd1, dfd2, dfd3, dfd4, dfd5, dfd6, dfd7 ]
		$.when.apply($, dfds).done( function( pageInfo, insights, insightsWithDay, lifetimeInsights, postListing, reachInterval28, reachInterval7 ) {

		    deferred[timeframe].resolve( { 
		    	pageInfo : pageInfo,
		    	lifetimeInsights : lifetimeInsights,
		    	insights : insights,
		    	insightsWithDay : insightsWithDay,
		    	postListing : postListing,
		    	reachInterval28 : reachInterval28,
		    	reachInterval7 : reachInterval7
		    });

		})

		return deferred[timeframe].promise();

	},

	getAllMetrics : function(name, id, token) {

		var currentProcess = FT.connector.facebook.getMetrics(name, id, token, 'current')
		var comparedProcess = FT.connector.facebook.getMetrics(name, id, token, 'compared')

		var dfds = [ currentProcess, comparedProcess ]

		$.when.apply($, dfds).done( function( current, compared ) {

			var insightGroups = [ 'pageInfo', 'insights', 'insightsWithDay', 'lifetimeInsights' ]

			if ( FT.defaults.numDays == 28 ) {
				insightGroups.push( 'reachInterval28' )
			} else {
				insightGroups.push( 'reachInterval7' )
			}

			console.log('reach interval>>>>', FT.defaults.numDays )
		
			$.each ( insightGroups, function( index, insightGroup ) {

				var basedIndex = index+1;
			
				FT.connector.facebook.processMetrics(current, compared, insightGroup);
				//FT.debug.facebookOutput(current, compared, insightGroup)

			})

			FT.connector.facebook.listPosts(current.postListing, compared.postListing);
			//FT.debug.facebookAssetsOutput(current.postListing, compared.postListing)

			//console.log('*** Facebook: DO ALL ***')
			FT.app.doAll();

		})

	},


	processMetrics : function(current, compared, insightGroup) {


		/**
		 *
		 * put the current and compared timeframes together
		 *
 		*/

       
        var rows = [];

    	switch ( insightGroup ) {

			case "pageInfo" :

				var response = current[insightGroup].response
	
		    break

		 }

    	$.each( current[insightGroup].response.data, function(index, metric) {
    		
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


		        		 // sum of individual action ONLY IF we are aggregating by day

						if ( aggregationPeriod == 'day' ) {

							var typeSum = {}
							var comparedTypeSum = {}

							$.each ( metric.values, function( index, day ) {

								var comparedDay = 0;
								if ( typeof comparedMetric.values[index] !== 'undefined' ) {
									comparedDay = comparedMetric.values[index].value
								}
			         	
			         			//console.log('+++', 'end_time:', day.end_time, metric.name)

			         			var numActions = 0;
			         			var comparedNumActions = 0;

			         			 $.each( day.value, function(type, numActions) {
			         			 	
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

		        		$.each( value, function(name, typeValue) {

		        			/**
							 *
							 * REAL DATA RIGHT HERE
							 *
					 		*/

		        		 	var comparedTypeValue = comparedValue[name] 
		    			 	var noSpaceName = name.replace(' ', '_');
		    			 	FT.process.setFieldValue('facebook', metric.name+'__'+noSpaceName, 'current', typeSum[name])
					 		FT.process.setFieldValue('facebook', metric.name+'__'+noSpaceName, 'compared', comparedTypeSum[name])

		    	   	 	})

		    	   	 	/**
						 *
						 * sum together all of the actions to get the total for the main insight
						 *
				 		*/

		        		if ( aggregationPeriod == 'day' ) {

			        		 var sum = 0;
			        		 var comparedSum = 0;
			        		 $.each( metric.values, function(index, day) {

			        		 	var comparedDay = "";
								if ( typeof comparedMetric.values[index] != 'undefined' ) {
									comparedDay = comparedMetric.values[index].value
								} 

			        		 	$.each( day.value, function(type, numActions) {
			        		 	 
			        		 	 	sum += numActions
			        		 
			        		 	 	if ( typeof comparedDay[type] !== 'undefined' && typeof comparedDay[type] !== 'function' ) {
			        		 			comparedSum += comparedDay[type]
			        		 		}

			        		 	})

			        		 })

		        			/**
							 *
							 * REAL DATA RIGHT HERE
							 *
					 		*/

					 		FT.process.setFieldValue('facebook', metric.name, 'current', sum)
					 		FT.process.setFieldValue('facebook', metric.name, 'compared', comparedSum)

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

				 		if ( aggregationPeriod == 'day' ) {

		        			sum = 0;
		        			comparedSum = 0;

		        		} else {

		        			sum = value;
		        			comparedSum = comparedValue;

		        		}

		        		// GET THE TOTAL OVER THE PERIOD IF the period == "day"
		        		if ( aggregationPeriod == 'day' ) {
			        	
			        		 $.each( metric.values, function(index, day) {
			        		 
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

						 }

		        		
		        		FT.process.setFieldValue('facebook', metric.name, 'current', sum)
					 	FT.process.setFieldValue('facebook', metric.name, 'compared', comparedSum)


		        	}

		        break

		    }

       	 })

	 
	},

	listPosts : function( current, compared ) {

		var insightTotals = {};

		console.log('RESET FACEBOOK POSTS DATA META')
		FT.data.data_sources.facebook.metric_assets.posts = {};
	
		$.each ( [ current, compared ], function( index, timeframe ) {

			var totalPosts = timeframe.postListing.data.length;
			var postInsights = timeframe.postInsights
			if ( index == 0 ) { var timeframeWindow = 'current' } else { var timeframeWindow = 'compared' }
			insightTotals[timeframeWindow] = {};

			/**
			 *
			 * TOTAL POSTS RIGHT HERE
			 *
	 		*/

			FT.process.setFieldValue('facebook', 'total_posts', timeframeWindow, totalPosts)

			FT.data.data_sources.facebook.metric_assets.posts[timeframeWindow] = {};
			FT.data.data_sources.facebook.metric_assets.posts[timeframeWindow].list = [];

			$.each ( timeframe.postListing.data, function( index, post ) {

				var insights = JSON.parse(postInsights[index].body).data;
				var insightMetrics = {}
				
				// initialize these so we don't get undefineds //
				$.each( [ 'post_impressions_unique', 'post_engaged_users', 'like', 'comment', 'share', 'post_clicks', 'link clicks', 'engagements', 'post_activity'], function( index, name) {
					insightMetrics[name] = 0;
				})

				//console.log( "INSIGHTS FOR>>> ", post.id, insights)
				//console.log("POST DETAILS >>> ", post)

				$.each( insights, function( index, metric ) {

					//console.log(metric)

					if ( typeof metric.values[0].value == 'object' ) {

						$.each( metric.values[0].value, function( name, typeValue ) {
							
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

							// console.log('insight metric object', metric.name, name, typeValue)
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

						// console.log('insight metric', metric.name, insightMetrics[metric.name])
					}
				
				})

				//console.log('insight metrics', insightMetrics)


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

				FT.data.data_sources.facebook.metric_assets.posts[timeframeWindow].total = totalPosts
				FT.data.data_sources.facebook.metric_assets.posts[timeframeWindow].list.push( {
					postDate : post.created_time,
					link : post.permalink_url,
					message : message,
					postType : post.type,
					reach : insightMetrics['post_impressions_unique'],
					engaged_users : insightMetrics['post_engaged_users'],
					likes : insightMetrics['like'],
					comments : insightMetrics['comment'],
					shares : insightMetrics['share'],
					activities : insightMetrics['post_activity'],
					clicks : insightMetrics['post_clicks'],
					link_clicks : insightMetrics['link clicks'],
					engagement_rate : engagementRateRaw,
					engagements : insightMetrics['engagements'],
					video_metrics : videoMetrics.join('')
				})

			})

			FT.defaults.facebookCalls = parseInt(FT.defaults.facebookCalls) + parseInt(FT.data.data_sources.facebook.metric_assets.posts[timeframeWindow].total);
		
		})

    	$.each ( [ 'current', 'compared' ], function( index, timeframeWindow ) {

			//console.log('ROLLED UP TOTALS>>>', timeframeWindow, insightTotals[timeframeWindow])

    		$.each ( insightTotals[timeframeWindow], function( index, metric ) {

    			//console.log('>> Rolled up totals from posts', 'total_post_', index, timeframeWindow, metric)
    			FT.process.setFieldValue('facebook', 'total_post_' + index, timeframeWindow, metric)

    		})

		})

	},

	
	signOut : function() {

		FB.api('/me/permissions/', 'DELETE', function() {
			window.location.reload();
		})
		
	},

	bindUI : function() {

		// Add an event listener to the 'auth-button'.

		$( 'body' ).on( "click", ".facebook-authorize-button", function(e) {
			FT.connector.facebook.login(e)
		});

		$( 'body' ).on( "click", ".fb-account", function(e) {
		
			console.log('>>>>>> FACEBOOK NEW ACCOUNT LOOKUP')
			FT.defaults.facebookCalls = 0

			var token = $(this).attr('data-token');
			var id = $(this).attr('data-id');
			var name = $(this).attr('data-name')
			FT.defaults.facebookPropertyId = id
			FT.defaults.facebookPropertyName = name
			FT.defaults.facebookPropertyToken = token

			FT.connector.facebook.getAllMetrics(name, id, token)

			if (e.originalEvent !== undefined) {
				$('a[href="#data-source-metrics"]').trigger('click');
			}

		});

		$( 'body' ).on( "click", ".facebook-deauthorize-button", function(e) {
			FT.connector.facebook.signOut(e)
		});

	}

}

FT.connector.facebook.init()


window.fbAsyncInit = function() {
    FB._https = true;
    FB.init({
      appId            : '558059437903012',
      autoLogAppEvents : true,
      xfbml            : true,
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true, // parse XFBML platform on this page?
      version          : 'v2.10'
    });
    
    FB.Event.subscribe('auth.login', function(response) {
      //console.log('auth.login event')
    });
    
    FB.Event.subscribe('auth.logout', function(response) {
       //console.log('auth.logout event')
     });
  
    FB.getLoginStatus(function(response) {
      	FT.connector.facebook.authorize(response);
     });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
