/**
 *
 * platform-level
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

	get : function() {

		var phrases = [

			{
				type: 'insight',
				phrase: "Overall pageviews are up with {{value}} pageviews, up from {{compared_value}} pageviews",
				tags: { level: "platform", source: "google_analytics", dimension: "pageviews", sentiment: "positive", type: "platform", category: "", metric: "pageviews"}
			},  

			 {
				type: 'insight',
				phrase: "Overall pageviews are down, with {{value}} pageviews, down from {{compared_value}} pageviews",
				tags: { level: "platform", source: "google_analytics", dimension: "pageviews", sentiment: "negative", type: "platform", category: "", metric: "pageviews"}
			}, 

			 {
				type: 'insight',
				phrase: "There was a {{percent_change}} increase in pageviews, from {{value}} pageviews to {{compared_value}} pageviews",
				tags: { level: "platform", source: "google_analytics", dimension: "pageviews", sentiment: "positive", type: "platform", category: "", metric: "pageviews"}
			},  

			 {
				type: 'insight',
				phrase: "There were {{value}} total posts this week, which is a {{percent_change}} difference over last period, with {{total_delta}} more posts",
				tags: { level: "platform", source: "facebook", dimension: "total_posts", sentiment: "positive", type: "platform", category: "", metric: "total_posts"}
			}, 

			 {
				type: 'insight',
				phrase: "There were {{value}} total posts this week, which is {{percentageOfAverage}} above average",
				tags: { level: "platform", source: "facebook", dimension: "total_posts", sentiment: "positive", type: "platform", category: "", metric: "total_posts"}
			}, 

			 {
				type: 'insight',
				phrase: "There were {{value}} total posts this week, the same as last week",
				tags: { level: "platform", source: "facebook", dimension: "total_posts", sentiment: "neutral", type: "platform", category: "", metric: "total_posts"}
			},


			{
				type: 'insight',
				phrase: "Post frequency is down by {{percent_change}}, with just {{value}} posts this week",
				tags: { level: "platform", source: "facebook", dimension: "total_posts", sentiment: "negative", type: "platform", category: "", metric: "total_posts"}
			},  

			 {
				type: 'insight',
				phrase: "New acquired users are up, with {{value}} total new website users, up from {{compared_value}}, a difference of {{total_delta}} visitors",
				tags: { level: "platform", source: "google_analytics", dimension: "new_users", sentiment: "positive", type: "platform", category: "", metric: "new_users"}
			}, 

			 {
				type: 'insight',
				phrase: "New acquired users are down, with {{value}} total new website users, down from {{compared_value}}",
				tags: { level: "platform", source: "google_analytics", dimension: "new_users", sentiment: "negative", type: "platform", category: "", metric: "new_users"}
			},  

			 {
				type: 'insight',
				phrase: "Organic Reach is up; you reached {{value}} users on Facebook through organic social posts, an increase of {{total_delta}} users",
				tags: { level: "platform", source: "facebook", dimension: "organic_reach", sentiment: "positive", type: "platform", category: "", metric: "organic_reach"}
			}, 

			 {
				type: 'insight',
				phrase: "On Facebook, your organic reach was down {{total_delta}} users, a change of {{percent_change}}",
				tags: { level: "platform", source: "facebook", dimension: "organic_reach", sentiment: "negative", type: "platform", category: "", metric: "organic_reach"}
			},  

			 {
				type: 'insight',
				phrase: "Your work is paying off; you reached {{total_delta}} more users on Facebook through paid reach, an increase of {{percent_change}} - with a total of {{value}} users",
				tags: { level: "platform", source: "facebook", dimension: "paid_reach", sentiment: "positive", type: "platform", category: "", metric: "paid_reach"}
			}, 

			 {
				type: 'insight',
				phrase: "Paid reach is down on Facebook, reaching only {{value}} users, from {{compared_value}}",
				tags: { level: "platform", source: "facebook", dimension: "paid_reach", sentiment: "negative", type: "platform", category: "", metric: "paid_reach"}
			},  

			 {
				type: 'insight',
				phrase: "You didn't have any paid reach on Facebook this period",
				tags: { level: "platform", source: "facebook", dimension: "paid_reach", sentiment: "neutral", type: "platform", category: "", metric: "paid_reach"}
			},  

			 {
				type: 'insight',
				phrase: "Total website users are up, with {{value}} total users, a {{percent_change}} increase",
				tags: { level: "platform", source: "google_analytics", dimension: "total_users", sentiment: "positive", type: "platform", category: "", metric: "website_users"}
			}, 

			 {
				type: 'insight',
				phrase: "Total website users are down, from {{compared_value}} to {{value}}, a {{percent_change}} drop",
				tags: { level: "platform", source: "google_analytics", dimension: "total_users", sentiment: "negative", type: "platform", category: "", metric: "website_users"}
			}, 

			 {
				type: 'insight',
				phrase: "Returning users are up site-wide, with {{value}} new users, a {{percent_change}} increase",
				tags: { level: "platform", source: "google_analytics", dimension: "returning_users", sentiment: "positive", type: "platform", category: "", metric: "returning_users"}
			}, 

			{
				type: 'insight',
				phrase: "Returning users are the same, {{value}} new users over both timeframes",
				tags: { level: "platform", source: "google_analytics", dimension: "returning_users", sentiment: "neutral", type: "platform", category: "", metric: "returning_users"}
			}, 


			 {
				type: 'insight',
				phrase: "Returning website users are down, from {{compared_value}} to {{value}}, a {{percent_change}} drop",
				tags: { level: "platform", source: "google_analytics", dimension: "returning_users", sentiment: "negative", type: "platform", category: "", metric: "returning_users"}
			}, 

			 {
				type: 'insight',
				phrase: "Conversions are up site-wide, with {{total_delta}} more conversions, a {{percent_change}} increase - with a total of {{value}} conversions.",
				tags: { level: "platform", source: "google_analytics", dimension: "conversions", sentiment: "positive", type: "platform", category: "", metric: "conversions"}
			}, 

			 {
				type: 'insight',
				phrase: "Conversions are down sitewide, with {{total_delta}} fewer conversions, a {{percent_change}} decrease",
				tags: { level: "platform", source: "google_analytics", dimension: "conversions", sentiment: "negative", type: "platform", category: "", metric: "conversions"}
			}, 

			 {
				type: 'insight',
				phrase: "The number of conversions have not changed, with {{value}} total conversions",
				tags: { level: "platform", source: "google_analytics", dimension: "conversions", sentiment: "neutral", type: "platform", category: "", metric: "conversions"}
			},  

			 {
				type: 'insight',
				phrase: "Like bees to honey, they're swarming to your page; Facebook followers are up to {{value}}, a {{percent_change}} increase",
				tags: { level: "platform", source: "facebook", dimension: "total_followers", sentiment: "positive", type: "platform", category: "", metric: "total_followers"}
			}, 

			 {
				type: 'insight',
				phrase: "They're dropping like flies; total Facebook followers are down to {{value}}",
				tags: { level: "platform", source: "facebook", dimension: "total_followers", sentiment: "negative", type: "platform", category: "", metric: "total_followers"}
			}, 

			 {
				type: 'insight',
				phrase: "On Facebook, visitors watched more video, with {{value}} watched, an increase of {{total_delta}} ",
				tags: { level: "platform", source: "facebook", dimension: "video_consumption", sentiment: "positive", type: "platform", category: "", metric: "video_consumption"}
			}, 

			 {
				type: 'insight',
				phrase: "There was less video consumption on Facebook, with {{value}} watched, an decrease of {{total_delta}} ",
				tags: { level: "platform", source: "facebook", dimension: "video_consumption", sentiment: "negative", type: "platform", category: "", metric: "video_consumption"}
			}, 

			 {
				type: 'insight',
				phrase: "Website visitors spent a total of {{value}} on your site, an increase of {{total_delta}} ",
				tags: { level: "platform", source: "facebook", dimension: "website_consumption", sentiment: "positive", type: "platform", category: "", metric: "website_consumption"}
			}, 

			 {
				type: 'insight',
				phrase: "Website visitors spent a total of {{value}} on your site, an decrease of {{total_delta}} ",
				tags: { level: "platform", source: "facebook", dimension: "website_consumption", sentiment: "negative", type: "platform", category: "", metric: "website_consumption"}
			}, 

			 {
				type: 'insight',
				phrase: "Folks sure like to hang out on your site; total time spent side-wide came in at {{value}}",
				tags: { level: "platform", source: "google_analytics", dimension: "website_consumption", sentiment: "positive", type: "platform", category: "", metric: "website_consumption"}
			}, 

			 {
				type: 'insight',
				phrase: "They're not sticking around; total time spent side-wide was just {{value}}",
				tags: { level: "platform", source: "google_analytics", dimension: "website_consumption", sentiment: "negative", type: "platform", category: "", metric: "website_consumption"}
			},  

			 {
				type: 'insight',
				phrase: "Your Facebook page engagement rate is on the rise, clocking in at {{value}}%",
				tags: { level: "platform", source: "facebook", dimension: "page_engagement_rate", sentiment: "positive", type: "platform", category: "", metric: "page_engagement_rate"}
			}, 

			 {
				type: 'insight',
				phrase: "At just {{value}}%, your Facebook page engagement rate was down, a difference of {{total_delta}}%",
				tags: { level: "platform", source: "facebook", dimension: "page_engagement_rate", sentiment: "negative", type: "platform", category: "", metric: "page_engagement_rate"}
			}, 

			 {
				type: 'insight',
				phrase: "They are seeing your content far and wide; total reach was up on Facebook, and you reached {{value}} users",
				tags: { level: "platform", source: "facebook", dimension: "total_reach", sentiment: "positive", type: "platform", category: "", metric: "total_reach"}
			}, 

			 {
				type: 'insight',
				phrase: "Your content caused a ripple, but not a wave; total reach was down on Facebook, reaching just {{value}} users",
				tags: { level: "platform", source: "facebook", dimension: "total_reach", sentiment: "negative", type: "platform", category: "", metric: "total_reach"}
			},  

			 {
				type: 'insight',
				phrase: "They like what they're seeing; on Facebook, you saw {{value}} engaged users",
				tags: { level: "platform", source: "facebook", dimension: "engaged_users", sentiment: "positive", type: "platform", category: "", metric: "engaged_users"}
			}, 

			 {
				type: 'insight',
				phrase: "Engaged users were down, coming in at just {{value}}",
				tags: { level: "platform", source: "facebook", dimension: "engaged_users", sentiment: "negative", type: "platform", category: "", metric: "engaged_users"}
			},  

			 {
				type: 'insight',
				phrase: "They must like what they see; Facebook video views were up at {{value}}",
				tags: { level: "platform", source: "facebook", dimension: "video_views", sentiment: "positive", type: "platform", category: "", metric: "video_views"}
			}, 

			 {
				type: 'insight',
				phrase: "Not many eyes on your Facebook video content; views totalled just {{value}}",
				tags: { level: "platform", source: "facebook", dimension: "video_views", sentiment: "negative", type: "platform", category: "", metric: "video_views"}
			},  

			 {
				type: 'insight',
				phrase: "Average time spent on page is up site-wide {{total_delta}}, with a site-wide average of {{value}}",
				tags: { level: "platform", source: "google_analytics", dimension: "avg_time_on_page", sentiment: "positive", type: "platform", category: "", metric: "avg_time_on_page"}
			}, 

			 {
				type: 'insight',
				phrase: "Average time spent on page is down site-wide {{total_delta}} from {{compared_value}} to {{value}}",
				tags: { level: "platform", source: "google_analytics", dimension: "avg_time_on_page", sentiment: "negative", type: "platform", category: "", metric: "avg_time_on_page"}
			}, 

			 {
				type: 'insight',
				phrase: "Visitors hung around site-wide; bounce rate was just {{value}}%",
				tags: { level: "platform", source: "google_analytics", dimension: "bounce_rate", sentiment: "positive", type: "platform", category: "", metric: "bounce_rate"}
			}, 

			 {
				type: 'insight',
				phrase: "And just like that, they were gone; bounce rate was up, coming in at {{value}}%",
				tags: { level: "platform", source: "google_analytics", dimension: "bounce_rate", sentiment: "negative", type: "platform", category: "", metric: "bounce_rate"}
			},  

			 {
				type: 'insight',
				phrase: "Likes, shares, comments, and link clicks poured in on Facebook with {{value}} total engagements, a {{percent_change}} increase",
				tags: { level: "platform", source: "facebook", dimension: "social_engagements", sentiment: "positive", type: "platform", category: "", metric: "social_engagements"}
			},  

			 {
				type: 'insight',
				phrase: "Not a lot of activity on Facebook, with just {{value}} total engagements (that's likes, shares, comments, link clicks, etc.)",
				tags: { level: "platform", source: "facebook", dimension: "social_engagements", sentiment: "negative", type: "platform", category: "", metric: "social_engagements"}
			},

			/* revenue */

			{
				type: 'insight',
				phrase: "You made some money! Revenue has increased {{total_delta}} for a total of {{value}}, a {{percent_change}} increase",
				tags: { level: "platform", source: "google_analytics", dimension: "value", sentiment: "positive", type: "platform", category: "", metric: "revenue", field: "revenue", sortType: "total", freestand: "true" }
			}, 

			 {
				type: 'insight',
				phrase: "Visualize Monopoly Man pulling out pockets. Revenue has decreased {{total_delta}} for a total of {{value}}, a {{percent_change}} drop",
				tags: { level: "platform", source: "google_analytics", dimension: "value", sentiment: "negative", type: "platform", category: "", metric: "revenue", field: "revenue", sortType: "total", freestand: "true" }
			},  

			 {
				type: 'insight',
				phrase: "A bunch of transactions, with {{value}} transactions this period, an increase of {{total_delta}} transactions",
				tags: { level: "platform", source: "google_analytics", dimension: "value", sentiment: "positive", type: "platform", category: "", metric: "transactions", field: "transactions", sortType: "total", freestand: "true" }
			},


			/**
			 *
			 * asset-level
			 * 
			*/


			/* new_users */

			{
				type: 'insight',
				phrase: "{{primary_dimension}} had the most new visitors site-wide, with {{value}} visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had the fewest new visitors site-wide, drawing just {{value}} visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "new_users", field: "sessions",  sortType: "total" }
			},  

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had the biggest change in new visitors with {{value}} visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers", sortType: "delta_change" }
			}, 

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had the biggest change in new visitors with a {{value}}% change - a total of {{total_delta}} visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "new_users", field: "newUsers",  sortType: "percent_change" }
			},


			/* returning_users */

			{
				type: 'insight',
				phrase: "They keep coming back to {{primary_dimension}}; it had the most returning visitors site-wide with {{value}} visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "returning_users", field: "sessions", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "Quite a difference: {{primary_dimension}}; had the biggest change in returning visitors with {{value}} new visitors",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "returning_users", field: "sessions", sortType: "delta_change"  }
			},


			/* pageviews */

			{
				type: 'insight',
				phrase: "{{primary_dimension}} had the most pageviews site-wide, totaling {{value}} pageviews",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "total" }
			},



			{
				type: 'insight',
				phrase: "With only {{value}} pageviews, {{primary_dimension}} was a low draw",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "total" }
			},  

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had the most new pageviews site-wide, with {{value}} pageviews",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "pageviews", sortType: "delta_change" }
			},


			/* source by sessions */

			{
				type: 'insight',
				phrase: "{{primary_dimension}} had the most sessions site-wide, totaling {{value}} sessions",
				tags: { level: "asset", source: "google_analytics", dimension: "source", sentiment: "positive", type: "asset", category: "", metric: "pageviews", field: "sessions", sortType: "total" }
			},


			/* google analytics time on page */

			{
				type: 'insight',
				phrase: "Good stuff: {{primary_dimension}} had the highest time on page of all pages site-wide with {{value}} engagement time",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "Biggest Change: {{primary_dimension}} had the highest change in time on page with an increase of {{value}} total engagement time. ",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "delta_change" }
			},  

			 {
				type: 'insight',
				phrase: "Biggest Change: {{primary_dimension}} had the highest change in time on page with a percentage change of {{value}}%",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "percent_change" }
			},



			{
				type: 'insight',
				phrase: "Visitors just aren't sticking around for this one; time on page for {{primary_dimension}} is super low at {{value}}",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
			},  

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} saw {{value}} engagement time, and continues to perform as expected",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "neutral", type: "asset", category: "", metric: "website_consumption", field: "timeOnPage", sortType: "total" }
			},  

			 {
				type: 'insight',
				phrase: "We saw above-average time on page for {{primary_dimension}} with {{value}}",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "positive", type: "asset", category: "", metric: "website_consumption", field: "sessions", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} is performing under benchmark for average time on page with {{value}}",
				tags: { level: "asset", source: "google_analytics", dimension: "page", sentiment: "negative", type: "asset", category: "", metric: "website_consumption", field: "sessions", sortType: "total" }
			},


			/* facebook engaged users */


			{
				type: 'insight',
				phrase: "{{primary_dimension}} was gangbusters, with {{value}} engaged users",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "engaged_users", field: "engaged_users", sortType: "total"}
			}, 

			 {
				type: 'insight',
				phrase: "Something didn't resonate with {{primary_dimension}}, as it saw only {{value}} engaged users",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "engaged_users", field: "engaged_users", sortType: "total" }
			},



			/* facebook post engagements */

			{
				type: 'insight',
				phrase: "{{primary_dimension}} is at the top of the charts, with the greatest number of post engagements at {{value}}",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "social_engagements", field: "engagements", sortType: "total" }
			},  

			 {
				type: 'insight',
				phrase: "Nothing's happening with {{primary_dimension}}, as it had the lowest number of post engagements -- just {{value}}",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "social_engagements", field: "engagements", sortType: "total" }
			},


			/* facebook link clicks */

			{
				type: 'insight',
				phrase: "Driving visitors: {{primary_dimension}} had {{value}} link clicks, the most of all Facebook content",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "social_engagements", field: "link_clicks", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had the fewest link clicks of all Facebook conent with {{value}}",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "social_engagements", field: "link_clicks", sortType: "total" }
			},

			/* facebook engagement rate */

			{
				type: 'insight',
				phrase: "{{primary_dimension}} had an engagement rate that was through the roof at {{value}}%",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "positive", type: "asset", category: "", metric: "page_engagement_rate", field: "engagement_rate", sortType: "total" }
			}, 

			 {
				type: 'insight',
				phrase: "{{primary_dimension}} had an engagement rate that was less than impressive at {{value}}%",
				tags: { level: "asset", source: "facebook", dimension: "post", sentiment: "negative", type: "asset", category: "", metric: "page_engagement_rate", field: "engagement_rate", sortType: "total" }
			},


			

			]

		console.log("\n", emoji.get("sparkles"), 'Made insights phrases.');

		return phrases

	}

}
