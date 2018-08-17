var FT = FT || {};
FT.data = FT.data || {}

/**
 * Set up the platform
 * data source metrics map to a category metric. 
 * currently, there is one category - "all"
 */


FT.data.platform = {}


/**
 *
 * All
 *
 */

FT.data.platform.all = {};
FT.data.platform.all.metrics = {}
FT.data.platform.all.equations = {},
FT.data.platform.all.meta = {};
FT.data.platform.all.meta.name = "all";
FT.data.platform.all.meta.label = "All";


/* ---- */

FT.data.platform.all.metrics.returning_users = {
	'name' : 'returning_users',
	'label' : 'Returning Website Users',
	'weight' : 5,
	'identifier' : 'users',
	'identifier_short' : 'users'
}


FT.data.platform.all.metrics.pageviews = {
	'name' : 'pageviews',
	'label' : 'Website Pageviews',
	'weight' : .5,
	'identifier' : 'pageviews',
	'identifier_short' : 'pageviews',
}

FT.data.platform.all.metrics.organic_reach = {
	'name' : 'organic_reach',
	'label' : 'Organic Reach',
	'weight' : 1,
	'identifier' : 'users',
	'identifier_short' : 'users'
}

FT.data.platform.all.metrics.new_users = {
	'name' : 'new_users',
	'label' : 'New Website Users',
	'weight' : 1,
	'identifier' : 'users',
	'identifier_short' : 'users'
}



FT.data.platform.all.metrics.total_followers = {
	'name' : 'total_followers',
	'label' : 'Facebook Followers',
	'weight' : 1,
	'identifier' : 'followers',
	'identifier_short' : 'followers'
}


FT.data.platform.all.metrics.total_posts = {
	'name' : 'total_posts',
	'label' : 'Total Posts',
	'weight' : 2,
	'identifier' : 'posts',
	'identifier_short' : 'posts'
}



FT.data.platform.all.metrics.paid_reach = {
	'name' : 'paid_reach',
	'label' : 'Paid Reach',
	'weight' : 1,
	'identifier' : 'users',
	'identifier_short' : 'users'
}



FT.data.platform.all.metrics.engaged_users = {
	'name' : 'engaged_users',
	'label' : 'Facebook Engaged Users',
	'weight' : 1,
	'identifier' : 'users',
	'identifier_short' : 'users'
}


FT.data.platform.all.metrics.social_engagements = {
	'name' : 'social_engagements',
	'label' : 'Facebook Engagements',
	'weight' : 1,
	'identifier' : 'engagements',
	'identifier_short' : 'engagements'
}


FT.data.platform.all.metrics.page_engagement_rate = {
	'name' : 'page_engagement_rate',
	'label' : 'Facebook Page Engagement Rate',
	'weight' : 1,
	'identifier' : 'percent',
	'identifier_short' : 'percent',
	'format' : 'percent'
}

FT.data.platform.all.metrics.video_consumption = {
	'name' : 'video_consumption',
	'label' : 'Facebook Video Time Spent',
	'weight' : 1,
	'identifier' : 'seconds',
	'identifier_short' : 'seconds',
	'format' : 'time'
}


FT.data.platform.all.metrics.website_consumption = {
	'name' : 'website_consumption',
	'label' : 'Website Time Spent',
	'weight' : 1,
	'identifier' : 'seconds',
	'identifier_short' : 'seconds',
	'format' : 'time'
}


FT.data.platform.all.metrics.bounce_rate = {
	'name' : 'bounce_rate',
	'label' : 'Bounce Rate',
	'weight' : 1,
	'identifier' : 'percent',
	'identifier_short' : 'percent',
	'format' : 'percent',
	'trend' : 'lower'
}

FT.data.platform.all.metrics.avg_time_on_page = {
	'name' : 'avg_time_on_page',
	'label' : 'Average Time on Page',
	'weight' : 1,
	'identifier' : 'seconds',
	'identifier_short' : 'seconds',
	'format' : 'seconds'
}


FT.data.platform.all.metrics.total_reach = {
	'name' : 'total_reach',
	'label' : 'Total Reach',
	'weight' : 1,
	'identifier' : 'users',
	'identifier_short' : 'users'
}


FT.data.platform.all.metrics.conversions = {
	'name' : 'conversions',
	'label' : 'Website Conversions',
	'weight' : 1,
	'identifier' : 'conversions',
	'identifier_short' : 'conversions' 
}

FT.data.platform.all.metrics.transactions = {
	'name' : 'transactions',
	'label' : 'Website Transactions',
	'weight' : 1,
	'identifier' : 'transactions',
	'identifier_short' : 'transactions'
}

FT.data.platform.all.metrics.revenue = {
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

FT.data.platform.all.meta.order = [];
$.each( FT.data.platform.all.metrics, function(metricName, metric) {
	FT.data.platform.all.meta.order.push(metricName)
})



