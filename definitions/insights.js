/**
 *
 * object maker
 * 
*/

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


		return objectTemplate

	}

}

