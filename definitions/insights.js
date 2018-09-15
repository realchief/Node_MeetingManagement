/**
 *
 * object maker
 * 
*/

var colors = require('colors');
var emoji = require('node-emoji')

var _ = require('lodash');

module.exports = {

	get : function() {

		var objectTemplate = {}


		objectTemplate.data = {

			bucket_insights : {
				buckets : []
			},
			asset_insights : {
				statuses : {},
				metrics : {},
				buckets: {}
			},
			platform_insights : {
				statuses : {},
				metrics : [],
				buckets: {}
			},
			usedPhrases : {
				phrases : [],
				tags : []
			}

		}

		console.log("\n", emoji.get("sparkles"), 'Made insights Template.');

		return objectTemplate

	}

}

