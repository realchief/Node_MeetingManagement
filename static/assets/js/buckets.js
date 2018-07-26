var FT = FT || {};
FT.data = FT.data || {}

/**
 * Set up the buckets 
 * buckets are combinations of platform-level metrics which define business sector KPIs
 */


FT.data.buckets = {}


/**
 *
 * User Interest
 *
 */

FT.data.buckets.user_interest = {};

FT.data.buckets.user_interest.meta = {
	'name' : "interest",
	'label' : "User Interest",
	'shortLabel' : "Interest"
};

FT.data.buckets.user_interest.meta.mappings = {}
FT.data.buckets.user_interest.metrics = {}
FT.data.buckets.user_interest.weight = 1
FT.data.buckets.user_interest.equations = {}
FT.data.buckets.user_interest.data = {}
FT.data.buckets.user_interest.meta.mappings.all = []


FT.data.buckets.user_interest.meta.mappings.all.push('total_followers')
FT.data.buckets.user_interest.meta.mappings.all.push('organic_reach')
FT.data.buckets.user_interest.meta.mappings.all.push('pageviews')
FT.data.buckets.user_interest.meta.mappings.all.push('returning_users')
FT.data.buckets.user_interest.meta.mappings.all.push('new_users')



FT.data.buckets.user_interest.meta.order = [];
$.each( FT.data.buckets.user_interest.meta.mappings, function(categoryName, category) {
	FT.data.buckets.user_interest.meta.order.push(categoryName)
})


/**
 *
 * Demand
 *
 */

FT.data.buckets.demand = {};

FT.data.buckets.demand.meta = {
	'name' : "demand",
	'label' : "Demand",
	'shortLabel' : "Demand"
};

FT.data.buckets.demand.meta.mappings = {}
FT.data.buckets.demand.metrics = {}
FT.data.buckets.demand.weight = 1
FT.data.buckets.demand.equations = {}
FT.data.buckets.demand.data = {}
FT.data.buckets.demand.meta.mappings.all = [ ]

FT.data.buckets.demand.meta.mappings.all.push( 'conversions' )
FT.data.buckets.demand.meta.mappings.all.push('paid_reach')
FT.data.buckets.demand.meta.mappings.all.push('transactions')
FT.data.buckets.demand.meta.mappings.all.push('revenue')

FT.data.buckets.demand.meta.order = [];
$.each( FT.data.buckets.demand.meta.mappings, function(categoryName, category) {
	FT.data.buckets.demand.meta.order.push(categoryName)
})

/**
 *
 * User Engagement
 *
 */

FT.data.buckets.user_engagement = {};

FT.data.buckets.user_engagement.meta = {
	'name' : "user_engagement",
	'label' : "User Engagement",
	'shortLabel' : "Engagement"
};

FT.data.buckets.user_engagement.meta.mappings = {}
FT.data.buckets.user_engagement.metrics = {}
FT.data.buckets.user_engagement.weight = 1
FT.data.buckets.user_engagement.equations = {}
FT.data.buckets.user_engagement.data = {}
FT.data.buckets.user_engagement.meta.mappings.all = []



FT.data.buckets.user_engagement.meta.mappings.all.push( 'social_engagements' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'page_engagement_rate' )
FT.data.buckets.user_engagement.meta.mappings.all.push('engaged_users')
FT.data.buckets.user_engagement.meta.mappings.all.push( 'video_consumption' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'website_consumption' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'avg_time_on_page' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'total_posts' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'bounce_rate' )
FT.data.buckets.user_engagement.meta.mappings.all.push( 'total_reach' )

FT.data.buckets.user_engagement.meta.order = [];
$.each( FT.data.buckets.user_engagement.meta.mappings, function(categoryName, category) {
	FT.data.buckets.user_engagement.meta.order.push(categoryName)
})

