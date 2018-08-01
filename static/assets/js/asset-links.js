FT.data.platform.all.metrics.social_engagements.asset_links =  [ 
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


FT.data.platform.all.metrics.page_engagement_rate.asset_links = [ 
	{ 
		'source' : 'facebook',
		'field' : 'engagement_rate',
		'label' : "Engagement Rate",
		'format' : 'percent'
	}
],

FT.data.platform.all.metrics.engaged_users.asset_links = [ 
	{ 
		'source' : 'facebook',
		'field' : 'engaged_users',
		'label' : "Engaged Users",
	}
],
	

FT.data.platform.all.metrics.organic_reach.asset_links = [ 
	{ 
		'source' : 'facebook',
		'field' : 'organic_reach',
		'label' : "Organic Reach"
	}
]

FT.data.platform.all.metrics.paid_reach.asset_links = [ 
	{ 
		'source' : 'facebook',
		'field' : 'paid_reach',
		'label' : "Paid Reach"
	}
]




FT.data.platform.all.metrics.pageviews.asset_links = [ 
	
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

FT.data.platform.all.metrics.returning_users.asset_links = [ 
	
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

FT.data.platform.all.metrics.new_users.asset_links = [ 
	
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


FT.data.platform.all.metrics.website_consumption.asset_links = [ 
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



/*



FT.data.platform.all.metrics.website_consumption.asset_links = [ 
	{ 
		'source' : 'google_analytics',
		'field' : 'sessions',
		'group' : 'channelGrouping_sessions_bounceRate',
		'type' : 'source',
		'label' : "sessions"
	}

]

FT.data.platform.all.metrics.social_shares.asset_links = [ 
	{ 
		'source' : 'facebook',
		'field' : 'shares',
		'label' : "Shares"
	}
]


FT.data.platform.all.metrics.social_comments.asset_links =  [ 
	{ 
		'source' : 'facebook',
		'field' : 'comments',
		'label' : "Comments"
	}
]


FT.data.platform.all.metrics.social_likes.contributing_factors = [
	
	{ 
		'source' : 'facebook',
		'field' : 'likes',
		'label' : "Likes"
	}
]

{
		'source' : 'google_analytics',
		'field' : 'timeOnPage_deltaChange',
		'group' : 'overall_totals',
		'sortBy' : 'timeOnPage_deltaChange',
		'linkable' : 'primary_dimension',
		'match' : 'pagePath_pageTitle_pageviews',
		'type' : 'page',
		'label' : 'Delta Change in Time On Page',
		'format' : 'time'
	},

	{
		'source' : 'google_analytics',
		'field' : 'timeOnPage_percentChange',
		'group' : 'overall_totals',
		'sortBy' : 'timeOnPage_percentChange',
		'linkable' : 'primary_dimension',
		'match' : 'pagePath_pageTitle_pageviews',
		'type' : 'page',
		'label' : 'Percent Change in Time On Page',
		'format' : 'percent',
	},


*/