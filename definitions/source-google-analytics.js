/**
 *
 * object maker
 * 
*/

var _ = require('lodash');

module.exports = {

	get : function() {

		var objectTemplate = {}

		/**
		 *
		 * Google Analytics
		 *
		 */

		objectTemplate.google_analytics = {}
		objectTemplate.google_analytics.meta = {}
		objectTemplate.google_analytics.fields = {}
		objectTemplate.google_analytics.equations = {}
		objectTemplate.google_analytics.meta.mappings = {}
		objectTemplate.google_analytics.meta.name = "Google Analytics"
		objectTemplate.google_analytics.meta.genericName = "Web"

		objectTemplate.google_analytics.metric_assets = {}



		/**
		 *
		 * Google Analytics - Mappings
		 *
		 */

		objectTemplate.google_analytics.meta.mappings.all =  {}

		_.extend(objectTemplate.google_analytics.meta.mappings.all,  {
			'new_users' : 'sessions__new_visitor',
			'pageviews' : 'pageviews',
			'returning_users' : 'sessions__returning_visitor',
			'conversions' : 'goalCompletionsAll',
			'website_consumption' : 'timeOnPage',
			'avg_time_on_page' : 'avgTimeOnPage',
			'total_users' : 'users',
			'new_users' : 'sessions__new_visitor',
			//'timed_views' : 'timed_pageviews', 
			//'content_shares' : 'shares',
			'page_consumption' : 'avgTimeOnPage',
			'bounce_rate' : 'bounceRate',
			'consumption' : 'sessionDuration',
			'form_fills' : 'goal1Completions',
			//'shares' : 'shares',
			//'goals' : 'engaged_users,deep_scrolls,goalCompletionsAll',
			'total_users' : 'users',
			'new_users' : 'sessions__new_visitor',
			'returning_users' : 'sessions__returning_visitor',
			'interest' : 'sessions__new_visitor',
			'revenue' : 'transactionRevenue',
			'transactions' : 'transactions'
		})




		/**
		 * ----
		 */

		objectTemplate.google_analytics.fields.pageviews = {
			'name' : 'pageviews',
			'label' : 'Website Pageviews',
			'description' : 'Total pageviews (not unique)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'pageviews',
			'identifier_short' : 'pageviews'
		}

		objectTemplate.google_analytics.fields.sessions__new_visitor = {
			'name' : 'new_users',
			'label' : 'Website New Users',
			'description' : 'New Users',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'visitors',
			'identifier_short' : 'visitors'
		}

		objectTemplate.google_analytics.fields.sessions__returning_visitor = {
			'name' : 'returning_users',
			'label' : 'Website Returning Users',
			'description' : 'Returning Users',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}	,
			'identifier' : 'visitors',
			'identifier_short' : 'visitors'
		}


		objectTemplate.google_analytics.fields.timeOnPage = {
			'name' : 'total_time_on_page',
			'label' : 'Total Time On Page',
			'description' : 'Total Time On Page',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}


		/**
		 * ----
		 */





		objectTemplate.google_analytics.fields.users = {
			'name' : 'users',
			'label' : 'Website Users',
			'description' : 'Unique Users',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'users',
			'identifier_short' : 'users'
		}

		objectTemplate.google_analytics.fields.avgSessionDuration = {
			'name' : 'avg_session_duration',
			'label' : 'Average Session Duration',
			'description' : 'Average Session Duration',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}

		objectTemplate.google_analytics.fields.sessionDuration = {
			'name' : 'total_session_duration',
			'label' : 'Total Session Duration',
			'description' : 'Total Session Duration',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}

		objectTemplate.google_analytics.fields.avgTimeOnPage = {
			'name' : 'avg_time_on_page',
			'label' : 'Average Time On Page',
			'description' : 'Average Time On Page',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}


		objectTemplate.google_analytics.fields.bounceRate = {
			'name' : 'bounce_rate',
			'label' : 'Bounce Rate',
			'description' : 'Bounce Rate',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'percent',
			'identifier_short' : 'percent',
			'format' : 'percent',
			'trend' : 'lower'
		}



		objectTemplate.google_analytics.fields.goalCompletionsAll = {
			'name' : 'conversions',
			'label' : 'Website Conversions',
			'description' : 'Total Goal Conversions',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}
		}

		objectTemplate.google_analytics.fields.transactionRevenue = {
			'name' : 'transactionRevenue',
			'label' : 'Revenue',
			'description' : 'Total Revenue',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'format' : 'currency'
		}

		objectTemplate.google_analytics.fields.transactions = {
			'name' : 'transactions',
			'label' : 'Transactions',
			'description' : 'Total Transactions',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}
		}

		/*

		objectTemplate.google_analytics.fields.seconds = {
			'name' : 'seconds',
			'label' : 'Seconds',
			'description' : 'Engagement Time',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'seconds',
		 	'identifier_short' : 'sec.'
		}

		*/



		/*
		objectTemplate.google_analytics.fields.goal1Completions = {
			'name' : 'form_fills',
			'label' : 'Form Fills',
			'description' : 'Total Goal Conversions 1',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}
		}

		*/

		/*objectTemplate.google_analytics.fields.engaged_users = {
			'name' : 'engaged_users',
			'label' : 'Engaged Users',
			'description' : 'Goal Conversion for Engaged Users',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'users',
		 	'identifier_short' : 'users',
		}

		objectTemplate.google_analytics.fields.deep_scrolls = {
			'name' : 'deep_scrolls',
			'label' : 'Deep Scrolls',
			'description' : 'Goal Conversion for Deep Scrolls',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'scrolls',
		 	'identifier_short' : 'scrolls'
		}
		*/


		objectTemplate.google_analytics.fields.shares = {
			'name' : 'shares',
			'label' : 'Website Shares',
			'description' : 'Clicks on a share button',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'shares',
		 	'identifier_short' : 'shares'
		}


		/**
		 *
		 * Google Analytics - Fields
		 *
		 */

		objectTemplate.google_analytics.meta.fields = [];
		_.forEach( objectTemplate.google_analytics.fields, function( field, fieldName ) {
			objectTemplate.google_analytics.meta.fields.push(fieldName)
		})


		 /**
		 *
		 * Google Analytics - Timeframes
		 *
		 */

		objectTemplate.google_analytics.meta.timeframes = {}

		objectTemplate.google_analytics.meta.timeframes.current = {
			period : "Month",
			start_date: "Not Set: 10-01-2017",
			end_date: "Not Set: 10-31-2017",
		}

		objectTemplate.google_analytics.meta.timeframes.compared = {
			period : "Month",
			start_date: "Not Set: 11-01-2017",
			end_date: "Not Set: 11-30-2017",
		}



		return objectTemplate

	}

}
