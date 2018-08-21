var FT = FT || {};
var _ = require('lodash');

FT.phrases = {

	phrases : [],
	insights : [],

	addPhrase : function( phrase, tags, where ) {

		var phraseAndTagObject = {}
	
		if ( typeof phrase == "object") { 

			/*

			FT.phrases.addPhrase(
			{
				phrase: "This is the phrase",
				tags: { 
					level: "platform", 
					source: "google_analytics", 
					sentiment: "positive,negative", 
					category: "maintain", 
					type: "tip", 
					dimension: "", metric: "" 
				}
			}, 'phrases|insights' )
			
			*/

			phraseAndTagObject.phrase = phrase.phrase
			var where = tags || 'phrases'

			phraseAndTagObject.tags = phrase.tags

			var allTags = [];
			_.forEach(phrase.tags, function(tagList,tagCategory) {
				var splitTags = tagList.split(',').map(function(item) {
				  return item.trim();
				});

				phrase.tags[tagCategory] = splitTags

				allTags = allTags.concat(splitTags)
			})			

			phrase.tags.all = allTags

		} else {

			/*
			
			FT.phrases.addPhrase("This is the phrase", "tag1,tag2")
			
			*/

			var where = where || 'phrases'
			phraseAndTagObject.phrase = phrase

			if ( typeof tags == "object") { 
				tags = tags
			} else {
				tags = tags.split(',').map(function(item) {
				  return item.trim();
				});
			}

			phraseAndTagObject.tags = {}
			phraseAndTagObject.tags.all = tags

		}

		FT.phrases[where].push(phraseAndTagObject)
	}

}


module.exports = FT.phrases



