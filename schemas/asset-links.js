/**
 *
 * object maker
 * 
*/

module.exports = {

	get : function() {

		var objectTemplate = [

			{

				"metric" : "social_engagements",
				"asset_links" : [ 
					{ 
						'source' : 'facebook',
						'field' : 'engagements',
						'label' : "shares, comments, likes, and link clicks"
					},

					{ 
						'source' : 'facebook',
						'field' : 'link_clicks',
						'label' : "Link Clicks"
					}
				]

			},


			{

				"metric" : "page_engagement_rate",
				"asset_links" : [ 
				{ 
					'source' : 'facebook',
					'field' : 'engagement_rate',
					'label' : "Engagement Rate",
					'format' : 'percent'
				}
				],


			},

			{

				"metric" : "engaged_users",
				"asset_links" : [ 
				{ 
					'source' : 'facebook',
					'field' : 'engaged_users',
					'label' : "Engaged Users",
				}
			],

			},

			{

				"metric" : "organic_reach",
				"asset_links" : [ 
				{ 
					'source' : 'facebook',
					'field' : 'organic_reach',
					'label' : "Organic Reach"
				}
			]

			},

			{

				"metric" : "paid_reach",
				"asset_links" : [ 
				{ 
					'source' : 'facebook',
					'field' : 'paid_reach',
					'label' : "Paid Reach"
				}
			]

			},

			{

				"metric" : "pageviews",
				"asset_links" : [ 
				
				{
					'source' : 'google_analytics',
					'field' : 'pageviews',
					'group' : 'overall_totals',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Pageviews'
				},

				{
					'source' : 'google_analytics',
					'field' : 'pageviews',
					'group' : 'overall_totals',
					'linkable' : 'primary_dimension',
					'sortBy' : 'pageviews',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'New Pageviews',
					'orderType' : 'delta'
				},

				{ 
					'source' : 'google_analytics',
					'field' : 'sessions',
					'group' : 'channelGrouping_sessions_bounceRate',
					'type' : 'source',
					'label' : "sessions"
				}

			]

			},

			{

				"metric" : "returning_users",
				"asset_links" : [ 
				
				{
					'source' : 'google_analytics',
					'field' : 'sessions',
					'group' : 'pagePath_userType_sessions',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Total Returning Users'
				},

				

				{
					'source' : 'google_analytics',
					'field' : 'sessions',
					'group' : 'pagePath_userType_sessions',
					'linkable' : 'primary_dimension',
					'sortBy' : 'sessions',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Returning Users by Delta Change',
					'orderType' : 'delta'
				},


			]

			},

			{

				"metric" : "new_users",
				"asset_links" : [ 
				
				{
					'source' : 'google_analytics',
					'field' : 'newUsers',
					'group' : 'overall_totals',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'New Users'
				},

				{
					'source' : 'google_analytics',
					'field' : 'newUsers',
					'group' : 'overall_totals',
					'sortBy' : 'newUsers',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'New Users by Delta Changed',
					'orderType' : 'delta'
				},

				{
					'source' : 'google_analytics',
					'field' : 'newUsers',
					'group' : 'overall_totals',
					'sortBy' : 'newUsers',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'New Users by Percent Changed',
					'format' : 'percent',
					'orderType' : 'percent'
				}

			]

			},

			{

				"metric" : "website_consumption",
				"asset_links" : [ 
				{
					'source' : 'google_analytics',
					'field' : 'timeOnPage',
					'group' : 'overall_totals',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Time On Page',
					'format' : 'seconds'
				},

				{
					'source' : 'google_analytics',
					'field' : 'timeOnPage',
					'group' : 'overall_totals',
					'sortBy' : 'timeOnPage',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Delta Change in Time On Page',
					'format' : 'time',
					'orderType' : 'delta'
				},



				{
					'source' : 'google_analytics',
					'field' : 'timeOnPage',
					'group' : 'overall_totals',
					'sortBy' : 'timeOnPage',
					'linkable' : 'primary_dimension',
					'match' : 'pagePath_pageTitle_pageviews',
					'type' : 'page',
					'label' : 'Percent Change in Time On Page',
					'format' : 'percent',
					'orderType' : 'percent'
				},

			]

			}

			
		]

		return objectTemplate

	}

}
