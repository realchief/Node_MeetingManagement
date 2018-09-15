/**
 *
 * object maker
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

var _ = require('lodash');

module.exports = {

	get : function() {

		var objectTemplate = {}

		/**
		 *
		 * User Interest
		 *
		 */

		objectTemplate.user_interest = {};

		objectTemplate.user_interest.meta = {
			'name' : "interest",
			'label' : "User Interest",
			'shortLabel' : "Interest"
		};

		objectTemplate.user_interest.meta.mappings = {}
		objectTemplate.user_interest.weight = 1
		objectTemplate.user_interest.data = {}
		objectTemplate.user_interest.meta.mappings.all = []


		objectTemplate.user_interest.meta.mappings.all.push('total_followers')
		objectTemplate.user_interest.meta.mappings.all.push('organic_reach')
		objectTemplate.user_interest.meta.mappings.all.push('pageviews')
		objectTemplate.user_interest.meta.mappings.all.push('returning_users')
		objectTemplate.user_interest.meta.mappings.all.push('new_users')

		objectTemplate.user_interest.meta.order = [];
		_.forEach( objectTemplate.user_interest.meta.mappings, function( category, categoryName ) {
			objectTemplate.user_interest.meta.order.push(categoryName)
		})


		/**
		 *
		 * Demand
		 *
		 */

		objectTemplate.demand = {};

		objectTemplate.demand.meta = {
			'name' : "demand",
			'label' : "Demand",
			'shortLabel' : "Demand"
		};

		objectTemplate.demand.meta.mappings = {}
		objectTemplate.demand.weight = 1
		objectTemplate.demand.data = {}
		objectTemplate.demand.meta.mappings.all = [ ]

		objectTemplate.demand.meta.mappings.all.push( 'conversions' )
		objectTemplate.demand.meta.mappings.all.push('paid_reach')
		objectTemplate.demand.meta.mappings.all.push('transactions')
		objectTemplate.demand.meta.mappings.all.push('revenue')

		objectTemplate.demand.meta.order = [];
		_.forEach( objectTemplate.demand.meta.mappings, function( category, categoryName ) {
			objectTemplate.demand.meta.order.push(categoryName)
		})

		/**
		 *
		 * User Engagement
		 *
		 */

		objectTemplate.user_engagement = {};

		objectTemplate.user_engagement.meta = {
			'name' : "user_engagement",
			'label' : "User Engagement",
			'shortLabel' : "Engagement"
		};

		objectTemplate.user_engagement.meta.mappings = {}
		objectTemplate.user_engagement.weight = 1
		objectTemplate.user_engagement.data = {}
		objectTemplate.user_engagement.meta.mappings.all = []



		objectTemplate.user_engagement.meta.mappings.all.push( 'social_engagements' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'page_engagement_rate' )
		objectTemplate.user_engagement.meta.mappings.all.push('engaged_users')
		objectTemplate.user_engagement.meta.mappings.all.push( 'video_consumption' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'website_consumption' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'avg_time_on_page' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'total_posts' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'bounce_rate' )
		objectTemplate.user_engagement.meta.mappings.all.push( 'total_reach' )

		objectTemplate.user_engagement.meta.order = [];
		_.forEach( objectTemplate.user_engagement.meta.mappings, function( category, categoryName ) {
			objectTemplate.user_engagement.meta.order.push(categoryName)
		})


		console.log("\n", emoji.get("sparkles"), 'Made bucket Template.');

		return objectTemplate

	}

}
