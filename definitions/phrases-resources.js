/**
 *
 * Resources
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

	get : function() {

		var phrases = [

			{
				type : "resource",
				phrase: "If the term UTM isn't already a part of your lexicon, it should be -- that is, if you want to know how well your content is performing. Get a step ahread and take a look at our guide on UTM tags.",
				tags: { level: "asset,platform", source: "google_analytics", sentiment: "positive,negative", category: "tweak", type: "resource", dimension: "", metric: "" },
				title : "Annoying but necessary: A UTM story",
				link : "http://meetbrief.com/2018/05/23/annoying-but-necessary-a-utm-story/"
			},

		]

		console.log("\n", emoji.get("sparkles"), 'Made resources phrases.');

		return phrases

	}

}