var FT = FT || {};

FT.utilities = {
	
	query : function(endpoint, params) {
	
		var queryParameters = params;

		//console.log(endpoint, params)
		
		return $.ajax({
			url: '/api' + '/' + endpoint,
			method: "GET",
			data: queryParameters
		})
	},

	removeDuplicatesFromArray : function(list) {
	
		var uniqueNames = [];
		$.each(list, function(i, el){
			if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
		});
		
		return uniqueNames;
	
	},
	
	
	removeTrailingComma : function(string) {
	
		if ( string ) {
			return string.replace(/,\s*$/, "");
		}
		
	},

	secondsToHMS : function(d) {

	    d = Number(d);
	    var h = Math.floor(d / 3600);
	    var m = Math.floor(d % 3600 / 60);
	    var s = Math.floor(d % 3600 % 60);

	    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	    return hDisplay + mDisplay + sDisplay; 

	},
	
	
	onResize : function() {

		var headerHeight = $('.section.header').outerHeight();
		var browserHeight = $(window).height()
		var displayHeight = browserHeight - headerHeight;
		
		$('.below-header').css({ 'height' : displayHeight + 'px'})

		// should this be 840 or 768?
		if ( $(window).width() <= 768 ) {
			FT.defaults.isSmallWidth = true;
			$('body').removeClass('wide-width').addClass('small-width')
			//$('#specific-words').addClass('no-scroll')
		} else {
			FT.defaults.isSmallWidth = false;
		}

		if ( $('.bucketly-center').length ) {
			var contentHeight = $('.bucketly-center').outerHeight();
		} else {
			var contentHeight = $('.below-header-inside').outerHeight()-60;
		}

		if ( contentHeight > displayHeight-60) {
			$('body').addClass('no-bucket-center')
		} else {
			$('body').removeClass('no-bucket-center')
		}
		
	},

	setContainerSizes: function() {

		$(window).resize( function() {
			FT.utilities.onResize()
		})

		FT.utilities.onResize()

	},

	capitalize: function(string) {
 	   return string.charAt(0).toUpperCase() + string.slice(1);
	},

	uppercaseFirst: function(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	},

	removeSpaceBeforePunctuation : function( str ) {

		// all punctuation
		//str = str.replace(/\s+(\W)/g, "$1");
		
		str = str.replace(/\s*,\s*/g, ",");
		str = str.replace(/\s+\./g, '.');
		return str

	},

	shuffle : function(array) {

		var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain metrics to shuffle...
		  while (0 !== currentIndex) {

		    // Pick a remaining metric...
		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;

		    // And swap it with the current metric.
		    temporaryValue = array[currentIndex];
		    array[currentIndex] = array[randomIndex];
		    array[randomIndex] = temporaryValue;
		  }

		  return array;

	},

	popWindow : function(url) {
		var w=600;
		var h=400;
	
		var left = (screen.width/2)-(w/2);
		var top = (screen.height/2)-(h/2);
	
		window.open(url, "newWindow", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
		window.focus();
	},

	getDelta : function( dataSource, sourceField, categoryMetric ) {

		// if ( FT.data.data_sources[dataSource].meta.fields.indexOf(sourceField) >= 0 ) {

		if ( typeof FT.data.data_sources[dataSource].fields[sourceField] !== 'undefined' ||
			 typeof FT.data.data_sources[dataSource].equations[sourceField] !== 'undefined' ) {
		
			var difference = "";
			var data = FT.data.data_sources[dataSource].fields;

			/* if non-calculated value */

			if ( typeof data[sourceField] !== 'undefined') {

				var current = data[sourceField].data.values.current;
				var compared = data[sourceField].data.values.compared;
				var delta = current - compared;
				var format = ( typeof data[sourceField].format == 'undefined') ? 'integer' : data[sourceField].format
			
				if ( delta !== 0 ) {
					var percentDelta = (delta / compared) * 100;
				} else {
					percentDelta = 0;
				}

				switch ( format ) {

					default: 

					break

					case 'percent' :
						delta = delta.toFixed(2)
					break

				}

				return {
					field : sourceField,
					current : current,
					compared : compared,
					categoryMetric : categoryMetric,
					percentDeltaRaw : percentDelta,
					percentDelta : percentDelta.toFixed(2),
					identifier : data[sourceField].identifier,
					identifier_short : data[sourceField].identifier_short,
					delta : delta,
					format : format,
					type : 'metric'
				}

			} else {

				/* if calculated value */

				var equation =  FT.data.data_sources[dataSource].equations[sourceField]
				var current = FT.utilities.compute( dataSource, FT.data.data_sources[dataSource].fields, 'current', equation ).answer
				var compared = FT.utilities.compute( dataSource, FT.data.data_sources[dataSource].fields, 'compared', equation ).answer
				var delta = current - compared;
				var percentDelta = (delta / compared) * 100;
				var percentDeltaRaw = percentDelta;

				if ( typeof equation.format !== "undefined") {
					percentDelta = math.format(percentDelta, equation.format)
					delta = math.format(delta, equation.format)
				}

				return {
					field : sourceField,
					current : parseFloat(current, 2),
					compared : parseFloat(compared, 2),
					categoryMetric : categoryMetric,
					percentDeltaRaw : percentDeltaRaw,
					percentDelta : percentDelta,
					identifier : equation.identifier,
					identifier_short : equation.identifier_short,
					delta : delta,
					type : 'calculated'
				}

			}

		} else {
			return false
		}

	},

	getMapping : function( dataSource, category, categoryMetric ) {

		var haveField = false

		if ( typeof FT.data.data_sources[dataSource].meta.mappings[category][categoryMetric] !== 'undefined' ) {

			var mappedField = FT.data.data_sources[dataSource].meta.mappings[category][categoryMetric];
			
			$.each( mappedField.split(','), function(index, field) {

				if ( typeof FT.data.data_sources[dataSource].fields[field] !== 'undefined' || typeof FT.data.data_sources[dataSource].equations[field] !== 'undefined' ) {
					haveField = true;
					//console.log('>>> split', category + "." + categoryMetric, 'is mapped to:', field, 'in:', dataSource)
				} else {
					//console.log('*** MAPPING CHECK ERROR', dataSource + "." + field, 'is mapped to:', category + "." + categoryMetric, 'but there is no field in', dataSource)
				}

			})

			if ( haveField ) {

				return {
					mappedField : mappedField
				}
		
			} else {

				return false;

			}

		} else {

			//console.log('>>', category + "." + categoryMetric, 'is NOT MAPPED AT ALL in:', dataSource)
			return false
		}

	},

	compute : function( parent, fieldsObject, timeframe, equation, mapping ) {

		var equationArray = equation.equation.split(' ');
		var replacedWithValues = []
		var metricsUsed = []
		var dataSourcesUsed = []
		var equationWithLabels = []
		var identifier = equation.identifier || "";
		var identifier_short = equation.identifier_short || "";
		var metricPieces = [];
		var categoryPiece = "";
		var metricPiece = "";

		$.each ( equationArray, function( index, value ) {

			if ( value.indexOf('.') >= 0 ) {
				metricPieces = value.split('.');
				categoryPiece = metricPieces[0]
				metricPiece = metricPieces[1]


				if ( typeof fieldsObject[categoryPiece].metrics[metricPiece] !== "undefined" ) {

					if ( typeof fieldsObject[categoryPiece].metrics[metricPiece].data == 'undefined' ) {
						//console.log('*** EQUATION ERROR', parent, " ", categoryPiece + '.' + metricPiece, 'is defined but has no data!')
					} else {
						replacedWithValues.push(fieldsObject[categoryPiece].metrics[metricPiece].data.values[timeframe])
						metricsUsed.push(fieldsObject[categoryPiece].metrics[metricPiece].label)
						equationWithLabels.push(fieldsObject[categoryPiece].metrics[metricPiece].label)
					}
			
				} else {
					//console.log('*** NEVER GET HERE RIGHT?', value)
					//console.log('*** EQUATION ERROR BAD VALUE:', parent, " ", value)
					//replacedWithValues.push(value)
				}

			} else {

				if ( typeof fieldsObject[value] !== "undefined" ) {

					if ( typeof fieldsObject[value].data !== "undefined")  {

						if ( typeof fieldsObject[value].data.activated !== "activated")  {
							//console.log('*** EQUATION ERROR', parent, fieldsObject[value].name, 'did not get filled in')
						}

						replacedWithValues.push(fieldsObject[value].data.values[timeframe])
						metricsUsed.push(fieldsObject[value].label)
						equationWithLabels.push(fieldsObject[value].label)

						$.each ( fieldsObject[value].dataSourcesUsed, function(index, dataSource) {

							if ( dataSourcesUsed.indexOf(dataSource) < 0 ) {
								dataSourcesUsed.push(dataSource)
							}

						})

					} else {
						//console.log('*** EQUATION ERROR', parent, fieldsObject[value].name, 'does not have a value mapping')
					}

				} else {
					//console.log('*** EQUATION OPERATOR', value)
					replacedWithValues.push(value)
					equationWithLabels.push(value)
					
				}
			
			}

		})

		var replacedEquation = replacedWithValues.join(' ');

		var answer = math.eval(replacedEquation)

		if ( typeof equation.format !== "undefined") {
			answer = math.format(answer, equation.format)
		}

		return {
			equation : replacedEquation,
			answer : answer,
			identifier : identifier,
			identifier_short : identifier_short,
			metricsUsed : metricsUsed,
			dataSourcesUsed : dataSourcesUsed,
			equationWithLabels : equationWithLabels
		}
	},

	removeCommas : function(str) {
	    while (str.search(",") >= 0) {
	        str = (str + "").replace(',', '');
	    }
	    return str;
	},

	kFormatter : function(num) {

		return num > 999 ? (num/1000).toFixed(1) + 'K' : num
	},

	isVowel : function(x) {

	  var result;

	  result = x == "a" || x == "e" || x == "i" || x == "o" || x == "u";
	  return result;
	},

	getBucket : function(metricName) {

		var foundBucket = "";

		$.each(FT.data.buckets, function( bucketName, bucket ) {

			var mappings = bucket.meta.mappings.all;
			if ( mappings.indexOf(metricName) >= 0 ) {
				foundBucket = bucketName;
				return false;
			}

		})

		return foundBucket

	},

	weightedMean : function(arrValues, arrWeights) {

	  var result = arrValues.map(function (value, i) {

	    var weight = arrWeights[i];
	    var sum = value * weight;

	    return [sum, weight];
	  }).reduce(function (p, c) {

	    return [p[0] + c[0], p[1] + c[1]];
	  }, [0, 0]);

	  return result[0] / result[1];

	},

	getZScore : function(x, m, std){
		if ( std == 0 ) return 0;
    	return (x - m) / std;
	},

	getScore : function(trainingSet, metricValue, field) {

		var field = field || ""

		var mean =  math.mean(trainingSet)
		//console.log('Mean', mean)

		var standardDeviation =  math.std(trainingSet)
		//console.log('Standard Deviation:', standardDeviation)

		var zScore = FT.utilities.getZScore(metricValue, mean, standardDeviation)
		//console.log('Z Score:', zScore)

		var percentile = FT.utilities.getZPercent(zScore)
		var percentileForDisplay = (percentile * 100).toFixed(2)
 		//console.log('Percentile:', percentileForDisplay)

 		if ( field ) {
 			//console.log('Field', field, 'Metric Value', metricValue, 'Mean', mean, 'Standard Deviation:', standardDeviation, 'Z Score:', zScore, 'Percentile:', percentileForDisplay )
 		}

 		return percentile

	},

	getZPercent : function(z) {

	  // z == number of standard deviations from the mean

	  // if z is greater than 6.5 standard deviations from the mean the
	  // number of significant digits will be outside of a reasonable range

	  if (z < -6.5) {
	    return 0.0;
	  }

	  if (z > 6.5) {
	    return 1.0;
	  }

	  var factK = 1;
	  var sum = 0;
	  var term = 1;
	  var k = 0;
	  var loopStop = Math.exp(-23);

	  while(Math.abs(term) > loopStop) {
	    term = .3989422804 * Math.pow(-1,k) * Math.pow(z,k) / (2 * k + 1) / Math.pow(2,k) * Math.pow(z,k+1) / factK;
	    sum += term;
	    k++;
	    factK *= k;
	  }

	  sum += 0.5;

	  return sum;
	},

	exclusiveTagsFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {
   		 
   		// return an array that *excludes* if matches any of one filtered tags //
   		// return an array that *includes* if doesn't match any filtered tags //

   		if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
   		 
   		 var filteredArray = arrayToSearchThrough.filter(
			function(el, index) { // executed for each 
				filterFlag = false;
				for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) { // iterate over filter
					elementTags = el.tags.all;
					
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
				elementTags = el.tags.all;
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
	
	matchingAllTagsFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {

		// return an array that *includes* if matches any *all* the filtered tags //  
   		 
   		if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
   		 
   		 var filteredArray = arrayToSearchThrough.filter(
			function(el, index) { // executed for each 
				filterFlag = true;
				
				elementTags = el.tags.all;
				for (var i = 0; i < arrayOfWordsToSearchFor.length; i++) {

					if (elementTags.indexOf(arrayOfWordsToSearchFor[i]) == -1) {
						filterFlag = false;
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

	matchingAllTagsExactlyFilter : function(arrayToSearchThrough, arrayOfWordsToSearchFor, shuffleSwitch) {
   		 
   		// return an array that *includes* if matches any *all* the filtered tags and doesn't have any mismatched tags //  
   		 
   		if ( shuffleSwitch ) FT.utilities.shuffle(arrayToSearchThrough);
   		 
   		 var filteredArray = arrayToSearchThrough.filter(
			function(el, index) { // executed for each 
				filterFlag = true;
				
				elementTags = el.tags.all;

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

	getInlineStyle : function(param, value) {

		var style = "";

		switch ( param ) {

			case 'status' :

				switch ( value ) {

					case 'positive' :
						style = 'background: #80C659;'
					break

					case 'negative' :
						style = 'background: #E87060;'
					break

					default :
						style = 'background: #eda97c;'
					break

				}

				
			break

			case 'status-color' :

				switch ( value ) {

					case 'positive' :
						style = 'color: #80C659;'
					break

					case 'negative' :
						style = 'color: #E87060;'
					break

					default :
						style = 'color: #ddd;'
					break

				}

				
			break

		}

		return style;

	}

}




