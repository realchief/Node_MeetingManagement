/**
 *
 * object maker
 * 
*/

var _ = require('lodash');

var assetLinks = require('../definitions/asset-links');
var assetLinksList = assetLinks.get();

module.exports = {

	get : function() {

		var objectTemplate = {}

		/**
		 *
		 * All
		 *
		 */

		objectTemplate.all = {};
		objectTemplate.all.metrics = {}
		objectTemplate.all.equations = {},
		objectTemplate.all.meta = {};
		objectTemplate.all.meta.name = "all";
		objectTemplate.all.meta.label = "All";


		/* ---- */

		objectTemplate.all.metrics.returning_users = {
			'name' : 'returning_users',
			'label' : 'Returning Website Users',
			'weight' : 5,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}


		objectTemplate.all.metrics.pageviews = {
			'name' : 'pageviews',
			'label' : 'Website Pageviews',
			'weight' : .5,
			'identifier' : 'pageviews',
			'identifier_short' : 'pageviews',
		}

		objectTemplate.all.metrics.organic_reach = {
			'name' : 'organic_reach',
			'label' : 'Organic Reach',
			'weight' : 1,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}

		objectTemplate.all.metrics.new_users = {
			'name' : 'new_users',
			'label' : 'New Website Users',
			'weight' : 1,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}



		objectTemplate.all.metrics.total_followers = {
			'name' : 'total_followers',
			'label' : 'Facebook Followers',
			'weight' : 1,
			'identifier' : 'followers',
			'identifier_short' : 'followers'
		}


		objectTemplate.all.metrics.total_posts = {
			'name' : 'total_posts',
			'label' : 'Total Posts',
			'weight' : 2,
			'identifier' : 'posts',
			'identifier_short' : 'posts'
		}



		objectTemplate.all.metrics.paid_reach = {
			'name' : 'paid_reach',
			'label' : 'Paid Reach',
			'weight' : 1,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}



		objectTemplate.all.metrics.engaged_users = {
			'name' : 'engaged_users',
			'label' : 'Facebook Engaged Users',
			'weight' : 1,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}


		objectTemplate.all.metrics.social_engagements = {
			'name' : 'social_engagements',
			'label' : 'Facebook Engagements',
			'weight' : 1,
			'identifier' : 'engagements',
			'identifier_short' : 'engagements'
		}


		objectTemplate.all.metrics.page_engagement_rate = {
			'name' : 'page_engagement_rate',
			'label' : 'Facebook Page Engagement Rate',
			'weight' : 1,
			'identifier' : 'percent',
			'identifier_short' : 'percent',
			'format' : 'percent'
		}

		objectTemplate.all.metrics.video_consumption = {
			'name' : 'video_consumption',
			'label' : 'Facebook Video Time Spent',
			'weight' : 1,
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}


		objectTemplate.all.metrics.website_consumption = {
			'name' : 'website_consumption',
			'label' : 'Website Time Spent',
			'weight' : 1,
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'time'
		}


		objectTemplate.all.metrics.bounce_rate = {
			'name' : 'bounce_rate',
			'label' : 'Bounce Rate',
			'weight' : 1,
			'identifier' : 'percent',
			'identifier_short' : 'percent',
			'format' : 'percent',
			'trend' : 'lower'
		}

		objectTemplate.all.metrics.avg_time_on_page = {
			'name' : 'avg_time_on_page',
			'label' : 'Average Time on Page',
			'weight' : 1,
			'identifier' : 'seconds',
			'identifier_short' : 'seconds',
			'format' : 'seconds'
		}


		objectTemplate.all.metrics.total_reach = {
			'name' : 'total_reach',
			'label' : 'Total Reach',
			'weight' : 1,
			'identifier' : 'users',
			'identifier_short' : 'users'
		}


		objectTemplate.all.metrics.conversions = {
			'name' : 'conversions',
			'label' : 'Website Conversions',
			'weight' : 1,
			'identifier' : 'conversions',
			'identifier_short' : 'conversions' 
		}

		objectTemplate.all.metrics.transactions = {
			'name' : 'transactions',
			'label' : 'Website Transactions',
			'weight' : 1,
			'identifier' : 'transactions',
			'identifier_short' : 'transactions'
		}

		objectTemplate.all.metrics.revenue = {
			'name' : 'revenue',
			'label' : 'Website Revenue',
			'weight' : 50,
			'identifier' : 'revenue',
			'identifier_short' : 'revenue',
			'format' : 'currency'
		}



		/**
		 *
		 * All - Set order of metrics for display
		 *
		 */

		objectTemplate.all.meta.order = [];
		_.forEach( objectTemplate.all.metrics, function( metric, metricName ) {
			objectTemplate.all.meta.order.push(metricName)
		})


		_.forEach ( assetLinksList, function ( assetLinks, index ){
			if ( typeof objectTemplate.all.metrics[assetLinks.metric] !== undefined ) {
				objectTemplate.all.metrics[assetLinks.metric].asset_links = assetLinks.asset_links
			}
		})

		return objectTemplate

	}

}
