
/**
 *
 * Assets phrases
 * 
*/

/**
 *
 * platform-level
 * 
*/

FT.phrases.addPhrase({
	phrase: "Overall pageviews are up with {{value}} pageviews, up from {{compared_value}} pageviews",
	tags: { source: "google_analytics", dimension: "pageviews", sentiment: "positive", type: "platform", category: "", metric: "pageviews", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Overall pageviews are down, with {{value}} pageviews, down from {{compared_value}} pageviews",
	tags: { source: "google_analytics", dimension: "pageviews", sentiment: "negative", type: "platform", category: "", metric: "pageviews", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "There was a {{percent_change}} increase in pageviews, from {{value}} pageviews to {{compared_value}} pageviews",
	tags: { source: "google_analytics", dimension: "pageviews", sentiment: "positive", type: "platform", category: "", metric: "pageviews", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "There were {{value}} total posts this week, which is a {{percent_change}} difference over last period, with {{total_delta}} more posts",
	tags: { source: "facebook", dimension: "total_posts", sentiment: "positive", type: "platform", category: "", metric: "total_posts", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "There were {{value}} total posts this week, which is {{percentageOfAverage}} above average",
	tags: { source: "facebook", dimension: "total_posts", sentiment: "positive", type: "platform", category: "", metric: "total_posts", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "There were {{value}} total posts this week, the same as last week",
	tags: { source: "facebook", dimension: "total_posts", sentiment: "neutral", type: "platform", category: "", metric: "total_posts", }
}, 'insights')



FT.phrases.addPhrase({
	phrase: "Post frequency is down by {{percent_change}}, with just {{value}} posts this week",
	tags: { source: "facebook", dimension: "total_posts", sentiment: "negative", type: "platform", category: "", metric: "total_posts", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "New acquired users are up, with {{value}} total new website users, up from {{compared_value}}, a difference of {{total_delta}} visitors",
	tags: { source: "google_analytics", dimension: "new_users", sentiment: "positive", type: "platform", category: "", metric: "new_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "New acquired users are down, with {{value}} total new website users, down from {{compared_value}}",
	tags: { source: "google_analytics", dimension: "new_users", sentiment: "negative", type: "platform", category: "", metric: "new_users", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Organic Reach is up; you reached {{value}} users on Facebook through organic social posts, an increase of {{total_delta}} users",
	tags: { source: "facebook", dimension: "organic_reach", sentiment: "positive", type: "platform", category: "", metric: "organic_reach", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "On Facebook, your organic reach was down {{total_delta}} users, a change of {{percent_change}}",
	tags: { source: "facebook", dimension: "organic_reach", sentiment: "negative", type: "platform", category: "", metric: "organic_reach", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Your work is paying off; you reached {{total_delta}} more users on Facebook through paid reach, an increase of {{percent_change}} - with a total of {{value}} users",
	tags: { source: "facebook", dimension: "paid_reach", sentiment: "positive", type: "platform", category: "", metric: "paid_reach", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Paid reach is down on Facebook, reaching only {{value}} users, from {{compared_value}}",
	tags: { source: "facebook", dimension: "paid_reach", sentiment: "negative", type: "platform", category: "", metric: "paid_reach", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "You didn't have any paid reach on Facebook this period",
	tags: { source: "facebook", dimension: "paid_reach", sentiment: "neutral", type: "platform", category: "", metric: "paid_reach", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Total website users are up, with {{value}} total users, a {{percent_change}} increase",
	tags: { source: "google_analytics", dimension: "total_users", sentiment: "positive", type: "platform", category: "", metric: "website_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Total website users are down, from {{compared_value}} to {{value}}, a {{percent_change}} drop",
	tags: { source: "google_analytics", dimension: "total_users", sentiment: "negative", type: "platform", category: "", metric: "website_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Returning users are up site-wide, with {{value}} new users, a {{percent_change}} increase",
	tags: { source: "google_analytics", dimension: "returning_users", sentiment: "positive", type: "platform", category: "", metric: "returning_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Returning website users are down, from {{compared_value}} to {{value}}, a {{percent_change}} drop",
	tags: { source: "google_analytics", dimension: "returning_users", sentiment: "negative", type: "platform", category: "", metric: "returning_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Conversions are up site-wide, with {{total_delta}} conversions, a {{percent_change}} increase",
	tags: { source: "google_analytics", dimension: "conversions", sentiment: "positive", type: "platform", category: "", metric: "conversions", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Conversions are down sitewide, with {{total_delta}} fewer conversions, a {{percent_change}} decrease",
	tags: { source: "google_analytics", dimension: "conversions", sentiment: "negative", type: "platform", category: "", metric: "conversions", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "The number of conversions have not changed, with {{value}} total conversions",
	tags: { source: "google_analytics", dimension: "conversions", sentiment: "neutral", type: "platform", category: "", metric: "conversions", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Like bees to honey, they're swarming to your page; Facebook followers are up to {{value}}, a {{percent_change}} increase",
	tags: { source: "facebook", dimension: "total_followers", sentiment: "positive", type: "platform", category: "", metric: "total_followers", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "They're dropping like flies; total Facebook followers are down to {{value}}",
	tags: { source: "facebook", dimension: "total_followers", sentiment: "negative", type: "platform", category: "", metric: "total_followers", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "On Facebook, visitors watched more video, with {{value}} watched, an increase of {{total_delta}} ",
	tags: { source: "facebook", dimension: "video_consumption", sentiment: "positive", type: "platform", category: "", metric: "video_consumption", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "There was less video consumption on Facebook, with {{value}} watched, an decrease of {{total_delta}} ",
	tags: { source: "facebook", dimension: "video_consumption", sentiment: "negative", type: "platform", category: "", metric: "video_consumption", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Website visitors spent a total of {{value}} on your site, an increase of {{total_delta}} ",
	tags: { source: "facebook", dimension: "website_consumption", sentiment: "positive", type: "platform", category: "", metric: "website_consumption", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Website visitors spent a total of {{value}} on your site, an decrease of {{total_delta}} ",
	tags: { source: "facebook", dimension: "website_consumption", sentiment: "negative", type: "platform", category: "", metric: "website_consumption", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Folks sure like to hang out on your site; total time spent side-wide came in at {{value}}",
	tags: { source: "google_analytics", dimension: "website_consumption", sentiment: "positive", type: "platform", category: "", metric: "website_consumption", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "They're not sticking around; total time spent side-wide was just {{value}}",
	tags: { source: "google_analytics", dimension: "website_consumption", sentiment: "negative", type: "platform", category: "", metric: "website_consumption", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Your Facebook page engagement rate is on the rise, clocking in at {{value}}%",
	tags: { source: "facebook", dimension: "page_engagement_rate", sentiment: "positive", type: "platform", category: "", metric: "page_engagement_rate", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "At just {{value}}%, your Facebook page engagement rate was down, a difference of {{total_delta}}%",
	tags: { source: "facebook", dimension: "page_engagement_rate", sentiment: "negative", type: "platform", category: "", metric: "page_engagement_rate", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "They are seeing your content far and wide; total reach was up on Facebook, and you reached {{value}} users",
	tags: { source: "facebook", dimension: "total_reach", sentiment: "positive", type: "platform", category: "", metric: "total_reach", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Your content caused a ripple, but not a wave; total reach was down on Facebook, reaching just {{value}} users",
	tags: { source: "facebook", dimension: "total_reach", sentiment: "negative", type: "platform", category: "", metric: "total_reach", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "They like what they're seeing; on Facebook, you saw {{value}} engaged users",
	tags: { source: "facebook", dimension: "engaged_users", sentiment: "positive", type: "platform", category: "", metric: "engaged_users", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Engaged users were down, coming in at just {{value}}",
	tags: { source: "facebook", dimension: "engaged_users", sentiment: "negative", type: "platform", category: "", metric: "engaged_users", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "They must like what they see; Facebook video views were up at {{value}}",
	tags: { source: "facebook", dimension: "video_views", sentiment: "positive", type: "platform", category: "", metric: "video_views", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Not many eyes on your Facebook video content; views totalled just {{value}}",
	tags: { source: "facebook", dimension: "video_views", sentiment: "negative", type: "platform", category: "", metric: "video_views", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Average time spent on page is up site-wide {{total_delta}}, with a site-wide average of {{value}}",
	tags: { source: "google_analytics", dimension: "avg_time_on_page", sentiment: "positive", type: "platform", category: "", metric: "avg_time_on_page", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Average time spent on page is down site-wide {{total_delta}} from {{compared_value}} to {{value}}",
	tags: { source: "google_analytics", dimension: "avg_time_on_page", sentiment: "negative", type: "platform", category: "", metric: "avg_time_on_page", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Visitors hung around site-wide; bounce rate was just {{value}}%",
	tags: { source: "google_analytics", dimension: "bounce_rate", sentiment: "positive", type: "platform", category: "", metric: "bounce_rate", }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "And just like that, they were gone; bounce rate was up, coming in at {{value}}",
	tags: { source: "google_analytics", dimension: "bounce_rate", sentiment: "negative", type: "platform", category: "", metric: "bounce_rate", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Likes, shares, comments, and link clicks poured in on Facebook with {{value}} total engagements, a {{percent_change}} increase",
	tags: { source: "facebook", dimension: "social_engagements", sentiment: "positive", type: "platform", category: "", metric: "social_engagements", }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Not a lot of activity on Facebook, with just {{value}} total engagements (that's likes, shares, comments, link clicks, etc.)",
	tags: { source: "facebook", dimension: "social_engagements", sentiment: "negative", type: "platform", category: "", metric: "social_engagements", }
}, 'insights')



/**
 *
 * asset-level
 * 
*/



/* new_users */

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the most new visitors site-wide, with {{value}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the fewest new visitors site-wide, drawing just {{value}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "new_users", field: "sessions",  sortType: "total" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the biggest change in new visitors with {{value}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers", sortType: "delta_change" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the biggest change in new visitors with a {{value}}% change - a total of {{total_delta}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers",  sortType: "percent_change" }
}, 'insights')


/* returning_users */

FT.phrases.addPhrase({
	phrase: "They keep coming back to {{primary_dimension}}; it had the most returning visitors site-wide with {{value}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "returning_users", field: "sessions", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "They keep coming back to {{primary_dimension}}; it had the most biggest change in returning visitors with {{value}} visitors",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "returning_users", field: "sessions", sortType: "delta_change"  }
}, 'insights')


/* pageviews */

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the most pageviews site-wide, totaling {{value}} pageviews",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "total" }
}, 'insights')



FT.phrases.addPhrase({
	phrase: "With only {{value}} pageviews, {{primary_dimension}} was a low draw",
	tags: { source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "total" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the most new pageviews site-wide, with {{value}} pageviews",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "delta_change" }
}, 'insights')


/* source by sessions */

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the most sessions site-wide, totaling {{value}} sessions",
	tags: { source: "google_analytics", dimension: "source", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "sessions", sortType: "total" }
}, 'insights')


/* google analytics time on page */

FT.phrases.addPhrase({
	phrase: "Good stuff: {{primary_dimension}} had the highest time on page of all pages site-wide with {{value}} engagement time",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Biggest Change: {{primary_dimension}} had the highest change in time on page with an increase of {{value}} total engagement time. ",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "delta_change" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Biggest Change: {{primary_dimension}} had the highest change in time on page with a percentage change of {{value}}%",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "percent_change" }
}, 'insights')



FT.phrases.addPhrase({
	phrase: "Visitors just aren't sticking around for this one; time on page for {{primary_dimension}} is super low at {{value}}",
	tags: { source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} saw {{value}} engagement time, and continues to perform as expected",
	tags: { source: "google_analytics", dimension: "page", sentiment: "neutral", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "We saw above-average time on page for {{primary_dimension}} with {{value}}",
	tags: { source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "sessions", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} is performing under benchmark for average time on page with {{value}}",
	tags: { source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "website_consumption", field: "sessions", sortType: "total" }
}, 'insights')


/* facebook engaged users */


FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} was gangbusters, with {{value}} engaged users",
	tags: { source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "engaged_users", field: "engaged_users", sortType: "total"}
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Something didn't resonate with {{primary_dimension}}, as it saw only {{value}} engaged users",
	tags: { source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "engaged_users", field: "engaged_users", sortType: "total" }
}, 'insights')



/* facebook post engagements */

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} is at the top of the charts, with the greatest number of post engagements at {{value}}",
	tags: { source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "social_engagements", field: "engagements", sortType: "total" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "Nothing's happening with {{primary_dimension}}, as it had the lowest number of post engagements -- just {{value}}",
	tags: { source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "social_engagements", field: "engagements", sortType: "total" }
}, 'insights')


/* facebook link clicks */

FT.phrases.addPhrase({
	phrase: "Driving visitors: {{primary_dimension}} had {{value}} link clicks, the most of all Facebook content",
	tags: { source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "social_engagements", field: "link_clicks", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had the fewest link clicks of all Facebook conent with {{value}}",
	tags: { source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "social_engagements", field: "link_clicks", sortType: "total" }
}, 'insights')

/* facebook engagement rate */

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had an engagement rate that was through the roof at {{value}}%",
	tags: { source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "page_engagement_rate", field: "engagement_rate", sortType: "total" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "{{primary_dimension}} had an engagement rate that was less than impressive at {{value}}%",
	tags: { source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "page_engagement_rate", field: "engagement_rate", sortType: "total" }
}, 'insights')


/* revenue */

FT.phrases.addPhrase({
	phrase: "You made some money! Revenue has increased {{total_delta}} for a total of {{value}}, a {{percent_change}} increase",
	tags: { source: "google_analytics", dimension: "value", sentiment: "positive", type: "platform", category: "", metric: "revenue", field: "revenue", sortType: "total", freestand: "true" }
}, 'insights')

FT.phrases.addPhrase({
	phrase: "Visualize Monopoly Man pulling out pockets. Revenue has decreased {{total_delta}} for a total of {{value}}, a {{percent_change}} drop",
	tags: { source: "google_analytics", dimension: "value", sentiment: "negative", type: "platform", category: "", metric: "revenue", field: "revenue", sortType: "total", freestand: "true" }
}, 'insights')


FT.phrases.addPhrase({
	phrase: "A bunch of transactions, with {{value}} transactions this period, an increase of {{total_delta}} transactions",
	tags: { source: "google_analytics", dimension: "value", sentiment: "positive", type: "platform", category: "", metric: "transactions", field: "transactions", sortType: "total", freestand: "true" }
}, 'insights')
