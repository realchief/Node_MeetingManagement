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
				talkingPointsAndActionItems : {
					phrases : [],
					tags : [],
					ids: []
				},
				talkingPoints : {
					phrases : [],
					tags : [],
					ids: []
				},
				actionItems : {
					phrases : [],
					tags : [],
					ids: []
				},
				metricActionItems : {
					phrases : [],
					tags : [],
					ids: []
				},
				resources : {
					phrases : [],
					tags : [],
					ids: []
				}
			}
		}

		console.log("\n", emoji.get("sparkles"), 'Made insights Template.');

		return objectTemplate

	}

}

