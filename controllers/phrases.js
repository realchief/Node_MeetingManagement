var _ = require('lodash');

module.exports = {

    make : function( phrase, wrapObject ) {

      var phraseAndTagObject = {}
    
      if ( typeof phrase == "object") { 

        phraseAndTagObject.phrase = phrase.phrase
        phraseAndTagObject.type = phrase.type
        phraseAndTagObject.tags_object = phrase.tags

        var allTags = [];
        
        _.forEach(phrase.tags, function(tagList,tagCategory) {
          
          if ( tagList ) {

            //console.log(phrase.phrase, tagList, tagCategory)

            var splitTags = tagList.split(',').map(function(item) {
              return item.trim();
            });

            phraseAndTagObject.tags_object[tagCategory] = splitTags
            phraseAndTagObject[tagCategory + '_tags'] = splitTags

            allTags = allTags.concat(splitTags)
        
          }

        })     

        var allTagsUnique = allTags.filter(function(item, index){
          return allTags.indexOf(item) >= index;
        }); 

        phraseAndTagObject.tags_object.all = allTagsUnique

        if ( wrapObject ) {
          phraseAndTagObject.tags_object = JSON.stringify(phraseAndTagObject.tags_object)
        }

        phraseAndTagObject.all_tags = allTagsUnique

        phraseAndTagObject.createdAt = new Date()
        phraseAndTagObject.updatedAt = new Date()

      } 


      return phraseAndTagObject
    
    },

    
  matchingAllTagsFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {

    // return an array that *includes* if matches any *all* the filtered tags //  
       
      if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
       
       var filteredArray = arrayToSearchThrough.filter(
      function(el, index) { // executed for each 
        filterFlag = true;
        
        elementTags = el.all_tags;
        for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) {

          if (elementTags.indexOf(arrayOfWordsToSearchFor[i]) == -1) {
            filterFlag = false;
          } 
          
        
        }
        
        if ( filterFlag ) {
          return true;
        } else {
          return false;
        }
      }
    );     
  
    return filteredArray;
  },

  matchingAllTagsExactlyFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {
       
      // return an array that *includes* if matches any *all* the filtered tags and doesn't have any mismatched tags //  
       
      if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
       
       var filteredArray = arrayToSearchThrough.filter(
      function(el, index) { // executed for each 
        filterFlag = true;
        
        elementTags = el.all_tags;

        for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) {

          if (elementTags.indexOf(arrayOfWordsToSearchFor[i]) == -1) {
            filterFlag = false;
          } 
          
          //console.log('index', index, 'checking filter', arrayOfWordsToSearchFor[i], 'within', elementTags, elementTags.indexOf(arrayOfWordsToSearchFor[i]), filterFlag )
  
        }

        for (var i = 0; i < elementTags.length; i++) {

          if (arrayOfWordsToSearchFor.indexOf(elementTags[i]) == -1) {
            filterFlag = false;
          } 
          
          //console.log('index', index, 'checking tags', elementTags[i], 'within', arrayOfWordsToSearchFor.join(','), arrayOfWordsToSearchFor.indexOf(elementTags[i]), filterFlag )
  
        }
        
        if ( filterFlag ) {
          return true;
        } else {
          return false;
        }
      }
    );     
  
    return filteredArray;
  },

  exclusiveTagsFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {
       
      // return an array that *excludes* if matches any of one filtered tags //
      // return an array that *includes* if doesn't match any filtered tags //

      if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
       
       var filteredArray = arrayToSearchThrough.filter(
      function(el, index) { // executed for each 
        filterFlag = false;
        for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) { // iterate over filter
          elementTags = el.all_tags;
          
          if (elementTags.indexOf(arrayOfWordsToSearchFor[i]) !== -1) {
            filterFlag = true;
            break
          }

          //console.log('index', index, 'checking', arrayOfWordsToSearchFor[i], 'within', elementTags, elementTags.indexOf(arrayOfWordsToSearchFor[i]), filterFlag )

        }
        if ( filterFlag ) {
          return false;
        } else {
          return true;
        }
      }
    );     
  
    
    return filteredArray;
  },
  
  matchingOneTagFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {
  
    // return an array that *includes* if matches any one filtered tags // 
       
      if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
       
       var filteredArray = arrayToSearchThrough.filter(
      function(el, index) { // executed for each 
        filterFlag = false;
        elementTags = el.all_tags;
        for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) { // iterate over filter
          
          if (elementTags.indexOf(arrayOfWordsToSearchFor[i]) !== -1) {
            filterFlag = true;
            break
          }

          //console.log('index', index, 'checking', arrayOfWordsToSearchFor[i], 'within', elementTags, elementTags.indexOf(arrayOfWordsToSearchFor[i]), filterFlag )
        }
        if ( filterFlag ) {
          return true;
        } else {
          return false;
        }
      }
    );     
  
    return filteredArray;
  },

  replace : function( phrases, replacementObject ) {

    var replacedPhrases = []

    if ( phrases.length ) {
  
      var replacements = replacementObject

      _.forEach( phrases, function( phrase, index ) {

        var replacedPhrase = phrase.phrase.replace(/{{(\w+)}}/g, function (m, m1) {
          return replacements[m1] || m;  
        });

        replacedPhrases.push(replacedPhrase)

      })

    }

    return replacedPhrases


  }

  

}