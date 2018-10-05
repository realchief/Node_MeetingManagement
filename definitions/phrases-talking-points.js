/**
 *
 * Talking Points
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

	get : function() {

		var phrases = [

			/*{
				type : "point",
				phrase: "What are you going to do with all your new money?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "revenue" }
			},*/

			 {
				type : "point",
				phrase: "Any idea why?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Why is that?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "What gives?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "What makes this work so well?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Why do you think performance is struggling?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Have you reviewed for any fatal flaws?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "How can you replicate this success?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Compare this to a top-performer; any notable differences?",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Why do you think that is?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "What might be causing this?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "What's going on here?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "discuss", type: "", dimension: "", metric: "" }
			},

			 {
				type : "point",
				phrase: "Is the call-to-action clear?",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "discuss", type: "", dimension: "", metric: "" }

			},

			{
				type : "point",
				phrase: "Are all your sources performing as expected?",
				tags: { level: "platform", source: "", sentiment: "positive,negative,neutral", category: "", type: "", dimension: "pageviews", metric: "pageviews" }

			},

			{
				type : "point",
				phrase: "Check the sources of this page to find where the change was.",
				tags: { level: "asset", source: "", sentiment: "positive,negative,neutral", category: "", type: "", dimension: "pageviews", metric: "pageviews" }

			},

			{
				type : "point",
				phrase: "Good work!",
				tags: { level: "platform,asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "infinite", category: "", type: "", dimension: "", metric: "" }

			}

		]

		console.log("\n", emoji.get("sparkles"), 'Made talking points phrases.');

		return phrases

	}

}