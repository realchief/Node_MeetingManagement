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
				tags: { level: "asset,platform", source: "google_analytics", sentiment: "positive,negative,neutral", category: "tweak", type: "resource", dimension: "", metric: "" },
				title : "Annoying but necessary: A UTM story",
				link : "http://meetbrief.com/2018/05/23/annoying-but-necessary-a-utm-story/"
			},

			{
				type : "resource",
				phrase: "Let's kick Twitter up a notch. If you're not already using Twitter cards, you should start. Here's how. ",
				tags: { level: "asset", source: "twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Creating Twitter cards: A (worthwhile) pain in the ass",
				link : "http://meetbrief.com/2018/05/23/creating-twitter-cards-a-worthwhile-pain-in-the-ass/"
			},

			{
				type : "resource",
				phrase: "Creating great content isn't easy. Luckily, we wrote down the recipe.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Baby, you've got a stew going: A five-step recipe for highly consumable content",
				link : "http://meetbrief.com/2018/05/23/baby-youve-got-a-stew-going-a-five-step-recipe-for-highly-consumable-content/"
			},

			{
				type : "resource",
				phrase: "Think you've just about covered it all? Let's crack open some great new ideas. Take a look at our guide on how to get through writer's block. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Four tips for breaking through writer's block in order to blog",
				link : "http://meetbrief.com/2018/05/23/four-tips-for-breaking-through-writers-block-in-order-to-blog/"
			},

			{
				type : "resource",
				phrase: "Let's get people clicking through to your content; here are some ways to write an enticing headline. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Clickbait headlines, and seven other easy ways to lose 10 pounds today",
				link : "http://meetbrief.com/2018/05/23/clickbait-headlines-and-seven-other-easy-ways-to-lose-10-pounds-today/"
			},

			{
				type : "resource",
				phrase: "Have you guys considered creating a quiz for your content marketing program? If not, Why not? Here are some tips to help get a quiz off the ground. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Q: Who should use a quiz for content marketing?",
				link : "http://meetbrief.com/2018/05/23/q-who-should-use-a-quiz-for-content-marketing/"
			},

			{
				type : "resource",
				phrase: "We've put a lot of thought into what metrics to use to help you gauge performance. Here's a deeper dive into why that is. ",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "generic", type: "resource", dimension: "", metric: "" },
				title : "Three glamour metrics we hate and what to use instead",
				link : "http://meetbrief.com/2018/05/23/three-glamour-metrics-we-hate-and-what-to-use-instead/"
			},

			{
				type : "resource",
				phrase: "If you must have a meeting, our favorite type is a brainstorm. Here's our advice to get the most out of your next meeting of the minds. ",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "generic", type: "resource", dimension: "", metric: "" },
				title : "Six tips for running a kick-ass content brainstorm",
				link : "http://meetbrief.com/2018/05/23/six-tips-for-running-a-kickass-content-brainstorm/"
			},

			{
				type : "resource",
				phrase: "Your form is just not converting. Here are some reasons why that may be. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "fix", type: "resource", dimension: "", metric: "" },
				title : "You're not collecting leads because your form sucks",
				link : "http://meetbrief.com/2018/05/23/youre-not-collecting-leads-because-your-form-sucks/"
			},

			{
				type : "resource",
				phrase: "While we are making your meetings more efficient, we cannot stop them from popping up on your calendar. Here are some things to consider before you schedule your next meeting. ",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "generic", type: "resource", dimension: "", metric: "" },
				title : "Six questions to ask before you schedule that meeting",
				link : "http://meetbrief.com/2018/05/23/six-questions-to-ask-before-you-schedule-that-meeting/"
			},

			{
				type : "resource",
				phrase: "We want you to crank out great we content, but here are some things to consider before you hit publish.",
				tags: { level: "asset,platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "review", type: "resource", dimension: "", metric: "" },
				title : "Dont forget to spelchek: A readability checklist for your content",
				link : "http://meetbrief.com/2018/05/23/dont-forget-to-spelchek-a-readability-checklist-for-your-content/"
			},

			{
				type : "resource",
				phrase: "Keep up your social media momentum, even when you're at an event. Check out our guide so that you're prepared before the event kicks off.",
				tags: { level: "asset,platform", source: "facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Amplifying your presence at any event with social media - Before",
				link : "http://meetbrief.com/2018/05/24/amplifying-your-presence-at-any-event-with-social-media-a-three-step-guide-before/"
			},

			{
				type : "resource",
				phrase: "Want to be certain that you're continually turning out great content, even (or especially) at an event? Take a look ar our guide to amplify your presence at any event with social media. ",
				tags: { level: "asset,platform", source: "facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Amplifying your presence at any event with social media - During",
				link : "http://meetbrief.com/2018/05/24/amplifying-your-presence-at-any-event-with-social-media-a-three-step-guide-during/"
			},

			{
				type : "resource",
				phrase: "For every event - whether you are the host or a participant - you can ride the wave of its momentum on your social channels. Here are some things to consider post-event.",
				tags: { level: "asset,platform", source: "facebook,linkedin,twitter", sentiment: "positive,negative,neutral", category: "promote", type: "resource", dimension: "", metric: "" },
				title : "Amplifying your presence at any event with social media - After",
				link : "http://meetbrief.com/2018/05/24/amplifying-your-presence-at-any-event-with-social-media-a-three-step-guide-after/"
			},

		]

		console.log("\n", emoji.get("sparkles"), 'Made resources phrases.');

		return phrases

	}

}