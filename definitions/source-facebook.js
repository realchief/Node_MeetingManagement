/**
 *
 * object maker
 * 
*/

var _ = require('lodash');

var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

	get : function() {

		var objectTemplate = {}

		/**
		 *
		 * Facebook
		 *
		 */

		objectTemplate.facebook = {}
		objectTemplate.facebook.meta = {}
		objectTemplate.facebook.fields = {}
		objectTemplate.facebook.equations = {}
		objectTemplate.facebook.meta.mappings = {}
		objectTemplate.facebook.meta.name = "Facebook"
		objectTemplate.facebook.metric_assets = {}


		/**
		 *
		 * Facebook - Mappings
		 *
		 */


		objectTemplate.facebook.meta.mappings.all =  {}


		_.extend(objectTemplate.facebook.meta.mappings.all,  {
			'total_followers' : 'page_fans',
			'total_reach' : 'page_posts_impressions_unique',
			'engaged_users' : 'page_engaged_users',
			'video_consumption' : 'page_video_view_time',
			'page_engagement_rate' : 'page_engagement_rate',
			'social_engagements' : 'page_post_engagements',
			'social_likes' : 'page_positive_feedback_by_type__like',
			'social_shares' : 'page_positive_feedback_by_type__link',
			'social_comments' : 'page_positive_feedback_by_type__comment',
			'consumption' : 'page_video_view_time',
			'video_views' : 'page_video_views',
			'total_posts' : 'total_posts',
			'clickthroughs' : 'page_consumptions_by_consumption_type_unique__link_clicks',
			'new_followers' : 'page_fan_adds_unique',
			'paid_reach' : 'page_posts_impressions_paid_unique',
			'organic_reach' : 'page_posts_impressions_organic_unique',
			'interest' : 'page_fan_adds_unique',
		})



		/**
		 * ----
		 */

		 objectTemplate.facebook.fields.page_fans = {
			'name' : 'page_fans_lifetime',
			'label' : 'Total Page Fans',
			'description' : 'Total Fans',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'fans',
		 	'identifier_short' : 'fans'
		},


		objectTemplate.facebook.fields.page_posts_impressions_unique = {
			'name' : 'reach',
			'label' : 'Reach',
			'description' : 'The number of people who have seen any content associated with your Page. (Unique Users)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'people',
		 	'identifier_short' : 'peeps'
		},



		objectTemplate.facebook.fields.page_engaged_users = {
			'name' : 'engaged_users',
			'label' : 'Engaged Users',
			'description' : '',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}
		},



		 objectTemplate.facebook.equations.page_engagement_rate = {
		 	'name' : 'page_engagement_rate',
		 	'label' : 'Overall Engagement Rate',
		 	'description' : 'Total Reach / social_engagements',
		 	'equation' : '( page_engaged_users / page_posts_impressions_unique ) * 100',
		 	'identifier' : 'percent',
		 	'type' : 'percent',
		 	'identifier_short' : 'percent',
		 	'format' : { 'notation' : 'fixed', 'precision' : 2 }
		 }



		/**
		 * ----
		 */


		objectTemplate.facebook.fields.page_post_engagements = {
			'name' : 'engagements',
			'label' : 'Engagements',
			'description' : 'reactions, comments, and shares',
			'data' : {
				'values' : {
					'current' : 0,
					'compared' : 0
				}
			}

		},

		objectTemplate.facebook.fields.page_posts_impressions_unique = {
			'name' : 'reach',
			'label' : 'Reach',
			'description' : 'The number of people who have seen any content associated with your Page. (Unique Users)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'people',
		 	'identifier_short' : 'peeps'
		},


		objectTemplate.facebook.fields.page_posts_impressions_paid_unique = {
			'name' : 'paid_reach',
			'label' : 'Paid Reach',
			'description' : 'The number of people who have seen any content associated with your Page. (Paid)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'people',
		 	'identifier_short' : 'peeps'
		},

		objectTemplate.facebook.fields.page_posts_impressions_organic_unique = {
			'name' : 'organic_reach',
			'label' : 'Organic Reach',
			'description' : 'The number of people who have seen any content associated with your Page. (Organic)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'people',
		 	'identifier_short' : 'peeps'
		},




		objectTemplate.facebook.fields.page_fan_adds_unique = {
			'name' : 'new_fans',
			'label' : 'Fan Adds',
			'description' : 'Fan Adds',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'fans',
		 	'identifier_short' : 'fans'
		},

		objectTemplate.facebook.fields.page_fan_removes_unique = {
			'name' : 'removed_fans',
			'label' : 'Fan Removes',
			'description' : 'Fan Removes',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'fans',
		 	'identifier_short' : 'fans'
		},

		objectTemplate.facebook.fields.page_positive_feedback_by_type__like = {
			'name' : 'total_likes',
			'label' : 'Total Likes',
			'description' : 'The total number of people who have liked your Page',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			}
		},

		objectTemplate.facebook.fields.page_positive_feedback_by_type__link = {
			'name' : 'total_shares',
			'label' : 'Total Shares',
			'description' : 'Page totals for link clicks over post listings for shares',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'shares',
		 	'identifier_short' : 'shares'
		}

		objectTemplate.facebook.fields.page_positive_feedback_by_type__comment = {
			'name' : 'total_comments',
			'label' : 'Total Comments',
			'description' : 'Page totals for link clicks over post listings for comments',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'comments',
		 	'identifier_short' : 'comments'
		}


		objectTemplate.facebook.fields.page_consumptions_by_consumption_type_unique__link_clicks = {
			'name' : 'link_clicks',
			'label' : 'Link Clicks',
			'description' : 'Page totals for link clicks',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'clickthroughs',
		 	'identifier_short' : 'clickthroughs'
		}

		objectTemplate.facebook.fields.page_video_view_time = {
			'name' : 'video_time_sec',
			'label' : 'Video Time (sec.)',
			'description' : 'Amount of time spent watching video (in seconds)',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'sec.',
		 	'identifier_short' : 'sec.'
		},

		objectTemplate.facebook.fields.page_video_views = {
			'name' : 'page_video_views',
			'label' : 'Video Views',
			'description' : 'Total Video Views',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'views',
		 	'identifier_short' : 'views'
		},


		objectTemplate.facebook.fields.total_posts = {
			'name' : 'total_posts',
			'label' : 'Total Posts',
			'description' : 'Total Posts',
			'data' : {
				'values' : {
					'current' : 0, 
					'compared' : 0
				}
			},
			'identifier' : 'posts',
		 	'identifier_short' : 'posts'
		},


		/**
		 *
		 * Facebook - Fields
		 *
		 */

		objectTemplate.facebook.meta.fields = [];
		_.forEach( objectTemplate.facebook.fields, function( field, fieldName ) {
			objectTemplate.facebook.meta.fields.push(fieldName)
		})


		/**
		 *
		 * Facebook : Equations
		 *
		 */



		 objectTemplate.facebook.equations.minutes_consumed = {
		 	'label' : 'Minutes Consumed',
		 	'description' : 'Minutes consumed',
		 	'equation' : 'page_video_view_time / 60',
		 	'identifier' : 'minutes',
		 	'type' : 'transformation',
		 	'identifier_short' : 'minutes',
		 	'format' : { 'notation' : 'fixed', 'precision' : 2 }
		 }

		 objectTemplate.facebook.equations.hours_consumed = {
		 	'label' : 'Hours Consumed',
		 	'description' : 'Minutes consumed',
		 	'equation' : 'page_video_view_time / 60 / 60',
		 	'identifier' : 'hours',
		 	'type' : 'transformation',
		 	'identifier_short' : 'hours',
		 	'format' : { 'notation' : 'fixed', 'precision' : 2 }
		 }


		objectTemplate.facebook.equations.days_consumed = {
		 	'label' : 'Days Consumed',
		 	'description' : 'Days consumed',
		 	'equation' : 'page_video_view_time / 60 / 60 / 24',
		 	'identifier' : 'days',
		 	'type' : 'transformation',
		 	'identifier_short' : 'days',
		 	'format' : { 'notation' : 'fixed', 'precision' : 2 }
		 }

		 objectTemplate.facebook.equations.years_consumed = {
		 	'label' : 'Years Consumed',
		 	'description' : 'Years consumed',
		 	'equation' : 'page_video_view_time / 60 / 60 / 24 / 365',
		 	'identifier' : 'years',
		 	'identifier_short' : 'years',
		 	'format' : { 'notation' : 'fixed', 'precision' : 2 }
		 }




		 objectTemplate.facebook.equations.net_new_fans = {
		 	'label' : 'Net New Fans',
		 	'description' : 'Net New Fans',
		 	'equation' : 'page_fan_adds_unique - page_fan_removes_unique',
		 	'identifier' : 'fans',
		 	'identifier_short' : 'fans'
		 }



		 /**
		 *
		 * Facebook - Timeframes
		 *
		 */

		objectTemplate.facebook.meta.timeframes = {}

		objectTemplate.facebook.meta.timeframes.current = {
			period : "Month",
			start_date: "Not Set: 10-01-2017",
			end_date: "Not Set: 10-31-2017",
		}

		objectTemplate.facebook.meta.timeframes.compared = {
			period : "Month",
			start_date: "Not Set: 11-01-2017",
			end_date: "Not Set: 11-30-2017",
		}


		console.log("\n", emoji.get("sparkles"), 'Made Facebook Template.');
        
		return objectTemplate

	}

}
