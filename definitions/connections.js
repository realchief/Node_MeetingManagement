/**
 *
 * Data Source Connections
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')
var _ = require('lodash');

module.exports = {

	logo_location : '/assets/images/',

	get : function() {

		var thisModule = this

		var connections = [

			{ 
				name : "google_analytics",
				label: "Google Analytics",
				description: "Get insights on traffic sources, demographics,  conversion rates, and more.",
				logo: "google-analytics-logo.png",
				url: "https://analytics.google.com",
				status: 'available',
				linkLabel: 'google',
				propertyDisplay: [

					{
						propertyLabel: 'Account',
						property: 'account_name',
						name: 'to be filled in'
					},

					{
						propertyLabel: 'Property',
						property: 'property_name',
						name: 'to be filled in'
					},

					{
						propertyLabel: 'View',
						property: 'view_name',
						name: 'to be filled in'
					}

				],
				propertyPattern: "account_id={{account.account_id}}&account_name={{account.account_name}}&property_id={{property.property_id}}&view_id={{view.view_id}}&view_name={{view.view_name}}&property_name={{property.property_name}}"
			},

			{ 
				name : "facebook",
				label: "Facebook Pages",
				description: "Learn how you can connect better with your audience.",
				logo: "facebook-logo.png",
				url: "https://www.facebook.com",
				status: 'available',
				linkLabel: 'facebook',
				propertyDisplay: [

					{
						propertyLabel: 'Page',
						property: 'account_name',
						name: 'to be filled in'
					},

				],
				propertyPattern: "account_id={{account.account_id}}&account_name={{account.account_name}}&account_token={{account.account_token}}"
			},

			{ 
				name : "google_ads",
				label: "Google Ads",
				description: "Improve clickthrough rates with insights into your ad campaigns.",
				logo: "google-adwords-logo.png",
				url: "https://adwords.google.com",
				status: 'soon',
				propertyLabel: 'notsetyet',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			},

			{ 
				name : "linkedin",
				label: "LinkedIn",
				description: "Increase your engagement and job posting responses with LinkedIn insights.",
				logo: "linkedin-logo.png",
				url: "https://www.linkedin.com",
				status: 'soon',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			},


			{ 
				name : "mailchimp",
				label: "MailChimp",
				description: "Optimize your email marketing campaign engagement.",
				logo: "mailchimp-logo.png",
				url: "https://www.mailchimp.com",
				status: 'soon',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			},

			{ 
				name : "twitter",
				label: "Twitter",
				description: "Find the messages that reach your customers the most.",
				logo: "twitter-logo.png",
				url: "https://www.twitter.com",
				status: 'soon',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			},

			{ 
				name : "salesforce",
				label: "Salesforce",
				description: "Let us analyze your customers and sales for trends and insights.",
				logo: "salesforce-logo.png",
				url: "https://www.salesforce.com",
				status: 'soon',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			},

			{ 
				name : "adobe_analytics",
				label: "Adobe Analytics",
				description: "Get insights about traffic sources, top content, demographics, and more.",
				logo: "adobe-analytics-logo.png",
				url: "https://www.adobe.com/analytics/adobe-analytics.html",
				status: 'soon',
				linkLabel: 'notsetyet',
				propertyPattern: "notsetyet"
			}

			
		]


		_.forEach( connections, function( connection, index ){

			var fullImage = '<img src="' + thisModule.logo_location + connection.logo + '" class="connection-logo" />'
			connection.logo = fullImage

			connection.buttonText = ( connection.status == 'soon') ? 'Coming Soon' : 'Connect'
			connection.buttonLink = "/auth/" + connection.linkLabel 

		})

		console.log("\n", emoji.get("sparkles"), 'Made available connections list.');

		return connections

	}

}