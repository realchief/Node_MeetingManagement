/**
 *
 * Action Items
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

module.exports = {

	get : function() {

		var phrases = [

			{
				type : "action",
				phrase: "Be sure that it is shared consistently on all social channels.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "maintain", type: "tip", dimension: "", metric: "" }
			},

			{
				type : "action",
				phrase: "Have you asked employees to share on their personal social channels?",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Create an editorial calendar to ensure that this content is distributed frequently.",
				tags: { level: "asset", source: "facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Keep it moving. Try to drive even more traffic by including a link in your next email newsletter.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Give it some more love! Push it out through social, email, and employee advocacy.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Up the ante: see if an increase in social sharing could produce an even bigger increase in visitors.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Hook it up! Be sure that this page is linked in social sharing and email campaigns.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Make 'em stick around; consider adding a pop-up modal or an embedded form for a newletter sign up.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Show it some love, and put a link on the homepage.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Be sure to recirculate this high-engagement content.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Spread the love! Link this page in your next newsletter to keep those conversions coming.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "This style has the magic touch; mirror it for other content.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Create an additonal social media push.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Capitalize on its momentum and give it a mention in your next email newsletter.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Integrate this content more aggressively into your social calendar.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Captialize on its success and add an option to share on social.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "This content is clearly working in your favor; keep it going with multiple social posts actioning to it.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "promote", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "To maintain engagement, continue to share via all social channels.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Since this content is keeping your fans and followers engaged, continue to incorporate it in your social sharing.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Something's kicking in! Maintain this movement with continued cross-channel promotion. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Post. Every. Single. Day.",
				tags: { level: "asset", source: "facebook,linkedin,twitter", sentiment: "positive,negative", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Find ways to drive more traffic from from social, email, or employee advocacy. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Refresh and revisit this content in the weeks to come.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "This is a perfect page to ensure you make an agressive ask for newsletter sign-ups.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "promote", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Make a note and use it later; in a few weeks, bring this one back as an #ICYMI post.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Since this has proven to be a great source of traffic, try to throw some under-performing content this way and see what sticks.",
				tags: { level: "platform", source: "facebook,linkedin,twitter", sentiment: "positive", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Include a link to this content on other (higher-performing) pages of the site.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "promote", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "What's old can be new again, especially if this piece hasn't previously recieved any special attention. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "promote", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Keep driving traffic to this page.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "promote,maintain", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Do it again! Since this page doing so well, be sure create more content in this style. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Figure out the recipe to the secret sauce, and then create more content just like it. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "This is great stuff; create more content in this style. ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "We are feeling the love! Stick with what works, and do more of it.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Find ways to create similar content.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Since your fans have responded so well to this content, find ways to mirror it elsewhere.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Is it the tone? Style? Format? Whatever it is, it's working. Do more of it.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "When you feel your content gaining some traction, be sure to make a note of what's working and why you think working -- so that you can do it again (and again and again). ",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Take a look at the source of these new visitors, and replicate it for other content.",
				tags: { level: "platform", source: "google_analytics", sentiment: "positive", category: "replicate", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Keep on keepin' on!",
				tags: { level: "asset,platform,bucket", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "maintain", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "If it ain't broke... (and this ain't broke). Keep up the good work.",
				tags: { level: "asset,platform,bucket", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "maintain", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Nice work! Whatever you're doing, keep doing it.",
				tags: { level: "asset,platform,bucket", source: "google_analytics,facebook,linkedin,twitter", sentiment: "positive", category: "maintain", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Chop that intro (even if you just split it into two paragraphs).",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Avoid tl;dr -- be sure to use subheaders; it will create more easily consumed sections in your article.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Add some color! Additional supporting imagery might help to make this content both informative and consumable,",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Ensure that the page title is SEO-friendly and has proper h1 tagging.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Try a few formatting tweaks to increase time on page; help reading comprehension with bold segments and bulleted lists.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Use images to break up long stretches of text and complement the surrounding content.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Figure what works in one post and apply it to another.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Be sure your team is properly tagging their work. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Whenever the ability to relate to an ecommerce action is present, be sure to provide a clear link to purchase.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "fix", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Change it up. Since this isn't working, try a new format for the call-to-action. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "twittereak", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Tweak the headline by teasing a highlight from the article.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "twittereak", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Re-examine the intent of this page -- brand recognition? sales conversions? -- and be sure that it's doing its job.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "twittereak", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Are you sure this content meshes with your fan’s expectations?",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "twittereak", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Try breaking up the content to make it more visually interesting.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "twittereak", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Make sure the content you're sharing feels authentic; is there a clear and commonsense tie to your brand?",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "twittereak", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Ensure that you have a call to action -- share on social, sign up for our newsletter, click to visit our shop, request a call -- on your highest performing pages. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "twittereak", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Be proactive about acquiring new email subscribers, and inclue a prompt to sign up on the highest-performing pages of your site. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "twittereak", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Take a look at your editorial calendar -- or if that doesn't exist, make one -- to be sure that you are creating new content on a consistent schedule.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "review", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Make sure the call to action is clear and accessible.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "review", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Great headline? Solid imagery? Form placement? Review this page to see what might be driving the success",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Take a look at the formatting (on all devices!), and make sure you don't have an off-putting wall of text.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "review", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Better take a look at this content to make sure that it speaks to your fans.",
				tags: { level: "asset", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Make sure that proper tracking and tagging is in place, and create a plan to review similar content for performance.",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive,negative", category: "review", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Review your formatting to make sure it is visually interesting and easily consumable.",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "When long-form content is under-performing, look to see if it can be turned into a listicle. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "review", type: "tip", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Revisit this page to make sure that the titles, descriptions, and imagery describe the content well. ",
				tags: { level: "asset", source: "google_analytics", sentiment: "negative", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Look back; has this top-performing content gotten a mention in your email newsletter?",
				tags: { level: "asset", source: "google_analytics", sentiment: "positive", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "A spike in social engagement (comments, shares, etc.) can be either good or bad -- take a look to see what's up.",
				tags: { level: "asset", source: "facebook,linkedin,twitter", sentiment: "positive,negative", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Take a look at the format of your recent social posts. Did you go hashtag-happy? Did you tag appropriately? Something may be amiss. ",
				tags: { level: "asset", source: "facebook,linkedin,twitter", sentiment: "negative", category: "review", type: "observation", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Take a look at our guide: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Read up on our latest recommendations: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Check out a few ideas to give you a boost: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "We have a few thoughts that might help you out; visit {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Here are a couple of ideas that might make an impact: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "We think this may help, read our guide: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "We've got some advice that will help you work things out: {link}",
				tags: { level: "asset", source: "", sentiment: "", category: "", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "Here's some advice on how to better prepare for your next meeting: {link}",
				tags: { level: "asset,platform", source: "", sentiment: "", category: "generic", type: "resource", dimension: "", metric: "" }
			},

			 {
				type : "action",
				phrase: "These are our favorite tools to get the most out of your meeting notes: {link}",
				tags: { level: "asset,platform", source: "", sentiment: "", category: "generic", type: "resource", dimension: "", metric: "" }
			},

			{
				type : "action",
				phrase: "Maybe it's time to promote a product on your home page?",
				tags: { level: "platform", source: "", sentiment: "positive,negative", category: "", type: "", dimension: "revenue", metric: "revenue" }
			},

			{
				type : "action",
				phrase: "Lets see if we can leverage some of your engaging content on your home page.",
				tags: { level: "platform", source: "", sentiment: "positive,negative", category: "", type: "", dimension: "pageviews", metric: "pageviews" }
			},

			{
				type : "action",
				phrase: "You should probably take a look at this.",
				tags: { level: "platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "", type: "resource", dimension: "", metric: "" }
			},

			{
				type : "action",
				phrase: "Something's going on here. Check this out.",
				tags: { level: "platform", source: "google_analytics,facebook,linkedin,twitter", sentiment: "negative", category: "", type: "resource", dimension: "", metric: "" }
			},

		]

		console.log("\n", emoji.get("sparkles"), 'Made action items phrases.');

		return phrases

	}

}