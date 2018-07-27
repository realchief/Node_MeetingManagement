var FT = FT || {};

FT.insights = {
	
	init : function() {

		
	},

	data : {

		bucket_insights : {
			statuses : {},
			buckets : []
		},
		asset_insights : {
			statuses : {},
			metrics : {},
			buckets: {}
		},
		platform_insights : {
			statuses : {},
			metrics : {
				statuses : {}
			},
			buckets: {}
		},
		usedPhrases : {
			phrases : [],
			tags : []
		}

	},

	make : function() {

		//console.log('### make', FT.insights.data)
		
		var insightsHTMLTarget = $('.insights-content')
		insightsHTMLTarget.html("")

		FT.insights.data.bucket_insights = {}
		FT.insights.data.bucket_insights.buckets = []
		FT.insights.data.bucket_insights.statuses = {}

		FT.insights.data.platform_insights.statuses = {}
		FT.insights.data.platform_insights.metrics = []
		FT.insights.data.platform_insights.buckets = {}
		
		FT.insights.data.asset_insights.statuses = {}
		FT.insights.data.asset_insights.metrics = {}
		FT.insights.data.asset_insights.buckets = {}

		FT.insights.data.usedPhrases = {
			phrases : [],
			tags : []
		}

		var insightsData = FT.insights.data

		/**
		 *
		 * MAKE metric INSIGHT OBJECT 
		 * 
		*/

		var addToInsightsObject = function(phraseObject, parent, assetInsights) {

			var status = phraseObject.status

			if ( typeof insightsData.platform_insights.statuses[status] == 'undefined' ) {
				insightsData.platform_insights.statuses[status] = {
					count : 0,
					list : []
				}
			}

			if ( typeof insightsData.platform_insights.buckets[parent] == 'undefined' ) {
				insightsData.platform_insights.buckets[parent] = []
			}

			insightsData.platform_insights.statuses[status].count++
		
			if ( assetInsights ) {
				phraseObject.data.assetInsights = assetInsights
			}

			insightsData.platform_insights.statuses[status].list.push(phraseObject.data)
			insightsData.platform_insights.metrics.push(phraseObject.data)
			insightsData.platform_insights.buckets[parent].push(phraseObject.data)

		}
		
		//console.log('>>>>> Insights Data', insightsData)

		/**
		 *
		 * platform level insights
		 * 
		*/

		var html = "";
		
		$.each ( FT.data.platform, function( categoryName, category ) {

			var tipSet = [];
			var tipHeader = [];
			var bucketName = "none"

			tipHeader.push('<li class="header">' + category.meta.label + '</li>')

			$.each ( category.metrics, function( metricName, metric ) {

				if ( typeof metric.data !== 'undefined') {

					bucketName = FT.utilities.getBucket(metricName);

					var phraseObject = FT.insights.phraser(metric);
					var status = phraseObject.status
		
					if ( metric.asset_links ) {

						//console.log( 'base metric: ', metric.asset_insights)
						var assetInsights = FT.insights.getAssetInsights(metric.dataSourcesUsed, metric.asset_links, status, metricName, bucketName )
						
						if ( assetInsights ) {
							
							$.each( assetInsights, function( index, factor ) {

								//console.log('Individual Factor>>>>', factor.meta.parentMetric, factor)

								var factorPhrase = ""
								factorPhrase = FT.insights.factorPhraser( factor )
							
							})
						}
					}

					/**
					 *
					 * MAKE INSIGHT OBJECT -- add to insight object
					 * 
					*/

					addToInsightsObject(phraseObject, bucketName, assetInsights)

				}

			})


			/* CATEGORY EQUATIONS WERE HERE */

		})

		
		/**
		 *
		 * bucket level insights
		 * 
		*/

		var html = "";
		var pictureTips = [];
	
		$.each ( FT.data.buckets, function( bucketName, bucket ) {

			var tipSet = [];
			var tipHeader = [];
			var scoreValues = [];
			var scoreWeights = [];
			var statusScoreValues = [];
		
			tipHeader.push('<li class="header">' + bucket.meta.label + '</li>')

			/**
			 *
			 * Performance Pictures MAKE INSIGHT OBJECT
			 * 
			*/

			var bucketPerformance = bucket.data.positiveMappingsCount / bucket.data.totalMappingsCount
			bucketPerformancePercentage = bucketPerformance * 100;
			var performanceId = "";
			
			if ( bucketPerformancePercentage > 50 ) {
				status = 'positive'	
			} else if ( bucketPerformancePercentage < 50 ) {
				status = 'negative'	
			} else {
				status = 'neutral'	
			}

			if ( typeof insightsData.bucket_insights.statuses[status] == 'undefined' ) {
				insightsData.bucket_insights.statuses[status] = {
					count : 0,
					buckets : []
				}
			}

			FT.data.buckets[bucketName].data.status = status

			insightsData.bucket_insights.statuses[status].count++
			insightsData.bucket_insights.statuses[status].buckets.push( bucketName )



			/**
			 *
			 * Category Pictures
			 * 
			*/


			$.each ( bucket.meta.order, function( count, category ) {

				if ( bucket.meta.mappings[category].length <= 0 ) return;

				$.each ( bucket.meta.mappings[category], function( index, metric ) {

					$.each ( [ 'metrics', 'equations' ], function( index, metricParent ) {

						if ( typeof FT.data.platform[category][metricParent][metric] == "undefined") { 
							return 
						}

						// TODO: dont add metrics to scores if there is no reason for it (I.E. revenue for GA)
						if ( typeof FT.data.platform[category][metricParent][metric].data !== "undefined") {

							var metricToPhrase = FT.data.platform[category][metricParent][metric];
							
							var phraseObject = FT.insights.phraser(metricToPhrase);
							var status = phraseObject.status;
							var phrase = phraseObject.phrase

							scoreValues.push(phraseObject.data.metricScore)
							scoreWeights.push(phraseObject.data.weight)

							if ( status == 'positive') {
								statusScoreValues.push(1)
							} else {
								statusScoreValues.push(0)	
							}


							//tipSet.push(phrase)

							if ( metricToPhrase.metricsUsed.length > 1 ) {
								phrase += " <span class='metrics-used'>" + metricToPhrase.metricsUsed.join(" + ") + "</span>";
							}

						}
				
					} )

				} )

			} )			

			insightsData.bucket_insights.buckets.push({
				name : bucketName,
				status : status,
				percentage : bucketPerformancePercentage,
				scoreValues : scoreValues,
				statusScoreValues : statusScoreValues,
				scoreWeights : scoreWeights
			})



		})

		/**
		 *
		 * Bring it all together
		 * 
		*/

	
		FT.insights.arrangeBucketInsights();
		FT.insights.arrangePlatformInsights();
	},

	arrangeBucketInsights : function() {

		// this is not how we want to do the headline. The below is looking at the number of positive metrics and negative metrics to determine
		// if the bucket is "good" or "bad". 
		// we should be looking at the score and how it compares historically.

		var pictureTips = [];

		FT.insights.sort(FT.insights.data.bucket_insights.buckets, 'bucketInsights' )

		var positives = FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'status', 'positive')
		var negatives = FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'status', 'negative')
		var neutrals = FT.insights.filter(FT.insights.data.bucket_insights.buckets, 'status', 'neutral')

		pictureTips = [];
		var tip = []
		
		makeInsightSentences = function( list ) {

			if ( list.length > 0 ) {

				$.each ( list, function(index, bucket) {

					var bucketLabel = FT.data.buckets[bucket.name].meta.label

					//tip.push( '<span class="insight-name insight-label">' + bucketLabel + '</span>')

					tip.push(bucketLabel)

					if ( index+2 < list.length ) {
						tip.push( ',' )
					} 

					if ( index+2 == list.length ) {

						if ( list.length > 2) tip.push( ',' ) //oxford comma, yo
						tip.push( 'and' )
					} 

				})

				areOrIs = ( list.length == 1 ) ? 'is' : 'are';
				tip.push(areOrIs)
				

			}

		}

		
		$.each( [ positives, negatives, neutrals ], function( index, list ) {

			if ( list.length > 0 ) {
	
				makeInsightSentences(list)
		
				if ( index == 0 ) {
					var action = FT.utilities.shuffle(FT.phrases.bites.group_verbs.positive.slice(0))
					//tip.push( '<span class="insight-modifier insight-positive">' + action[0] + '</span>')
					tip.push( action[0] + '.'  )
				} else if ( index == 1 ) {
					var action = FT.utilities.shuffle(FT.phrases.bites.group_verbs.negative.slice(0))
					//tip.push( '<span class="insight-modifier insight-negative">' + action[0] + '</span>')
					tip.push( action[0] + '.'  )
				} else if ( index == 2 ) {
					var action = FT.utilities.shuffle(FT.phrases.bites.group_verbs.neutral.slice(0))
					//tip.push( '<span class="insight-modifier insight-neutral">' + action[0] + '</span>')
					tip.push( action[0] + '.' )
				}

			}

		})
		
		pictureTips.push( tip.join(' ') );
		
		var sentences = pictureTips.join('</li><li>')

		// remove spaces before any commas
		sentences = sentences.replace(/\s*,\s*/g, ", ");

		$('.insights-content').append('<h2 class="headline">' + sentences + '</h2>');

		FT.insights.data.bucket_insights.headline = sentences

		/**
		 *
		 * Scores
		 * 
		*/

		var pictureTips = []
		
		$.each(FT.insights.data.bucket_insights.buckets, function( index, bucket ) {

			var bucketLabel = FT.data.buckets[bucket.name].meta.label

			var weightedScore = FT.utilities.weightedMean( bucket.scoreValues, bucket.scoreWeights )
			var weightedScoreDisplay = (weightedScore * 100).toFixed(0) 
			
			FT.data.buckets[bucket.name].data.totalScore = weightedScoreDisplay;

			pictureTips.push(bucketLabel + ' Score is: ' + " " + weightedScoreDisplay)

		})

		var sentences = pictureTips.join('. ')
		
		$('.insights-content').append('<h3>' + sentences + '</h3>');

	},


	getUniquePhrase : function(phraseSet) {

		FT.utilities.shuffle(phraseSet)

		var usedPhrases = FT.insights.data.usedPhrases.phrases;
		var usedTags = FT.insights.data.usedPhrases.tags;

		var newPhrase = phraseSet[0].phrase

		if (usedPhrases.indexOf(newPhrase) >= 0) {

			for ( i = 0; i < phraseSet.length; i++ ) {

				if (usedPhrases.indexOf(phraseSet[i].phrase) == -1) {

					//console.log(">>> Found New Phrase", phraseSet[i] )

					newPhrase = phraseSet[i].phrase;
					usedPhrases.push(newPhrase)
					break
				} 

				//console.log(">>> Found DUPE!", phraseSet[i] )

				if ( i == phraseSet.length-1) {
					newPhrase = phraseSet[0].phrase + " (duplicate)"
				}

			}

		} else {
			usedPhrases.push(newPhrase)
		}
		//usedTags.push(tags)

		return newPhrase

	},

	arrangePlatformInsights : function() {
	
		var insightsHTMLTarget = $('.insights-content')
		var factorList = []
		var phraseList = []
	
		FT.insights.sort(FT.insights.data.platform_insights.metrics, 'weightedPercentDelta' )

		$.each( FT.insights.data.platform_insights.metrics, function( index, metric ) {

			//console.log(metric.name, FT.utilities.getBucket(metric.name))
			var parentBucket = FT.data.buckets[FT.utilities.getBucket(metric.name)].meta.shortLabel;

			//console.log("REORDERED PHRASE>>>", parentBucket, metric.phrase)
			//factorList.push(metric.phrase)

			var phraseToUse = FT.insights.getUniquePhrase(metric.pointsPhrases)

			var inlineStyle = FT.utilities.getInlineStyle('status', metric.status);

			if ( typeof metric.insightsPhrases[0] !== 'undefined') {

				var bucketTag = '<span class="bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';

				phraseList.push(metric.insightsPhrases[0] + '.' + ' ' + "<strong>" + phraseToUse + "</strong>" + " " + bucketTag)

			} else {

				//console.log('UNDEFINED INSIGHTS PHRASE', metric)
			}

			$.each( metric.assetInsights, function( index, assetInsight ) {

					var factor = assetInsight.meta
					//console.log('Asset Insight:', factor)

					var inlineStyle = FT.utilities.getInlineStyle('status', factor.status);

					var bucketTag = '<span class="metric-asset bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';

					if ( typeof factor.pointsPhrases !== 'undefined') {
						var phraseToUse = FT.insights.getUniquePhrase(factor.pointsPhrases)
						phraseList.push('<span class="metric-asset">' + factor.insightsPhrases[0] + '.' + ' ' + "<strong>" + phraseToUse + "</strong>" + " " + bucketTag + '</span>')
					}


				})

		})


		/* FOR EMAIL */

		FT.insights.data.action_items = phraseList.slice(0,3)
		FT.insights.data.talking_points = phraseList.slice(3,6)

		/* /// FOR EMAIL */

		var bigPictureSentences = phraseList.join('</li><li>');
		$(insightsHTMLTarget).append('<ul class="lines"><li>' + bigPictureSentences + '</li></ul>')

	},

	sort : function(listing, field, filter, limit) {

		var filter = filter || "";
		var limit = limit || 0;

		//return arr.concat().sort();

		switch ( field ) {

			case 'weightedPercentDelta' :

				listing.sort(function(a, b){
				    return Math.abs(b[field]) - Math.abs(a[field])
				});


			break

			case 'bucketInsights' :

				listing.sort(function(a, b){
					field = 'percentage'
				    return b[field] - a[field]
				});


			break

			default :

				listing.sort(function(a, b){
				    return b[field] - a[field]
				});

			break

		}

		return listing[0]

	},


	filter : function(listing, key, value) {

		//console.log('Filter:', 'Listing', listing, 'Key', key, 'Value', value)

		var filteredListing = listing.filter(function ( row ){
	        return row[key] === value;
	    });

		return filteredListing

	},


	filterPercentages : function(listing, key) {

		//console.log('Filter:', 'Listing', listing, 'Key', key, 'Value', value)

		var filteredListing = listing.filter(function ( row ){
	        if ( isFinite(row[key]) ) 
	        	return row[key]
	    });

		return filteredListing

	},


	getAssetInsights : function( dataSources, assetLinks, status, metricName, bucketName ) {

		// NEED TO GET RID OF THIS!!!
		var status = "positive";

		var topFactors = [];
		
		//console.log('GET CONTRIB FACTOR>>', metricName, 'Sources Used:', dataSources, 'Factors:', assetLinks, status, "BucketName:", bucketName)

			$.each ( assetLinks, function( index, assetLink ) {

				var dataSource = assetLink.source;
				var factorGroup = "";
				var tags = [];
				
				if ( typeof assetLink.group !== 'undefined') {
					factorGroup = assetLink.group 
				} else {
					factorGroup = 'posts';
				}

				var topFactor = {}
				if ( typeof FT.data.data_sources[dataSource].metric_assets[factorGroup] !== 'undefined' ) {
					
					switch (assetLink.orderType) {

						default :

							var sortBy = assetLink.sortBy || assetLink.field
							var filter = ""
							var sortType = 'total'

						break

						case 'percent' :
						case 'delta' :

							//console.log('INSIGHT DELTA SORTING>>>', assetLink.field)

							var sortType = assetLink.orderType;
							var sortBy = assetLink.field + '_' + sortType + 'Change'
							var sortType = sortType + '_change'

							//console.log('DELTA SORTING FIELD:', sortBy)
				
						break


					}


					//console.log('LIST>>>', dataSource, factorGroup, sortBy, filter, FT.data.data_sources[dataSource].metric_assets[factorGroup].current.list)

					topFactor = FT.insights.sort(FT.data.data_sources[dataSource].metric_assets[factorGroup].current.list, sortBy, filter )
				}

				if ( topFactor ) {

					topFactor.meta = assetLink;
					topFactor.meta.dataSource = FT.data.data_sources[dataSource].meta.name
					topFactor.meta.genericName = FT.data.data_sources[dataSource].meta.genericName
					topFactor.meta.bucketName = bucketName
					topFactor.meta.parentMetric = metricName
					topFactor.meta.value = topFactor[assetLink.field]
					
					topFactor.meta.status = status
					topFactor.meta.format = assetLink.format || 'none'
					
					var deltaChangeField = assetLink.field + "_" + 'deltaChange'
					var percentChangeField = assetLink.field + "_" + 'percentChange'
					var percentOfTotalField = assetLink.field + "_" + 'percentOfTotal'
					topFactor.meta.valuePercentChange = topFactor[percentChangeField]
					topFactor.meta.valueDeltaChange = topFactor[deltaChangeField]
					topFactor.meta.valuePercentOfTotal = topFactor[percentOfTotalField]
				
					/*if ( metricName == 'pageviews') {
					console.log('FACTOR MADE>>', topFactor.meta.dataSource, metricName, topFactor)
					}*/

					tags.push('asset')
					tags.push(dataSource)
					tags.push(status)
					tags.push(metricName)
					tags.push(sortType)
					tags.push(assetLink.field)

					if ( typeof assetLink.type !== 'undefined') {
						tags.push(assetLink.type)
					}

					/*if ( sortType !== "total" ) {
						tags.push(sortType)
					}*/

					//tags.push('by_' + sortType)
				
					topFactor.meta.tags = tags

					if ( typeof assetLink.match !== 'undefined') {
				
						if ( FT.data.data_sources.google_analytics.metric_assets[assetLink.match] ) {

							var pageInfo = FT.insights.filter(FT.data.data_sources.google_analytics.metric_assets[assetLink.match].current.list, 'primary_dimension', topFactor[assetLink.linkable] )
						
							if ( typeof pageInfo[0] !== 'undefined' ) {
								
								//console.log('Page Title', 'for:', topFactor[assetLink.linkable], pageInfo[0]['secondary_dimension'])
								//console.log('Hostname', 'for:', topFactor[assetLink.linkable], pageInfo[0]['hostname'])

								topFactor.meta.title = pageInfo[0]['secondary_dimension']
								topFactor.meta.hostname = pageInfo[0]['hostname']
						
								if ( topFactor.meta.title == "(not set)" ) {
									topFactor.meta.title = pageInfo[0]['secondary_dimension']
								}

							}
						}

					}



					topFactors.push($.extend({},topFactor)) // new object in case we use the same article
					
				}

			})

		return topFactors;

	},

	factorPhraser : function( factor ) {

		if ( factor.meta.value ) {

			//console.log('>>>> FACTOR', factor.meta.dataSource, factor)

			var actions = []
			var action = "";
			var status = factor.meta.status
			var actionableItem = ""
			var actionType = factor.meta.type || 'post';
			var sourcePhrase = factor.meta.genericName || factor.meta.dataSource
			var tags = [];

			var phraseToken = factor.meta.type || factor.meta.field

			if ( factor.meta.orderType ) {
				phraseToken = 'delta'
			}

			if ( factor.meta.orderType ) {
				var valueFieldToUse = 'value' + FT.utilities.uppercaseFirst(factor.meta.orderType) + "Change"
			} else {
				var valueFieldToUse = 'value'
			}

			// TODO: add "total" value for lookups where value is "change" //
			var formattedValue = factor.meta[valueFieldToUse]
			var valueDeltaChange = factor.meta.valueDeltaChange
			var valuePercentChange = factor.meta.valuePercentChange

			//console.log('Field to use:', valueFieldToUse, 'Value Delta Change:', valueDeltaChange, 'Value Percent Change to use:', valuePercentChange, 'Formatted Value', formattedValue, typeof formattedValue)

			switch ( factor.meta.format ) {

				default :
					
					formattedValue = parseInt(formattedValue).toLocaleString()

				break

				case "percent" :

					if ( isFinite(formattedValue) ) {

						if ( typeof formattedValue == 'string') {
							formattedValue = formattedValue;
						} else {
							formattedValue = formattedValue.toFixed(2);
						}

					} else {
						formattedValue = "infinity"
					}

				break

				case "seconds" :
				case "time" :

					formattedValue = FT.utilities.secondsToHMS(formattedValue);

				break

				case "currency" :

					formattedValue = '$' + formattedValue;

				break

			}


			switch (typeof factor.meta.linkable) {

				case 'undefined' : 
				

					if ( typeof factor.link !== 'undefined') {
						actionableItem = '<a href="' + factor.link + '" class="post-link" target="_blank">'
						actionableItem += 'This ' + sourcePhrase + ' ' + actionType;
						actionableItem += '</a>'
					} else {
						actionableItem = factor.primary_dimension
					}
				
				break

				default : 

						var displayTitle = factor.meta['title'] || factor[factor.meta['linkable']] 
						var displayHostname = factor.meta['hostname'] || 'needURL'

						actionableItem = ""
						//actionableItem += 'The ' + sourcePhrase + ' ' + actionType + ' ';
						actionableItem += '<a href="' + '//' + displayHostname + factor[factor.meta['linkable']] + '" class="post-link" target="_blank">'
						actionableItem += displayTitle;
						actionableItem += '</a>'  

				break

			}

		/**
		 *
		 * INSIGHTS PHRASES
		 * 
		*/

		var tags = factor.meta.tags
		//var insightsTagsSearch = tags.concat(metric.name)
		var insightsTagsSearch = tags


		//console.log( 'ASSET INSIGHTS TAG SEARCH:', factor.meta.field, factor.meta.parentMetric, insightsTagsSearch)
		var insightsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.insights, insightsTagsSearch) 
	
		//console.log( 'ASSET INSIGHTS PHRASES FOUND:', insightsPhrases)
		//console.log("ASSET TRYING TAGS SEARCH>>>", factor.meta.field, factor.meta.parentMetric, tags.slice(0,3))
		
		var pointsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.phrases, tags.slice(0,3)) 
		
		//console.log( 'ASSET POINTS PHRASES FOUND:', pointsPhrases)
		
		var replacedPhrases = [];

		if ( insightsPhrases.length ) {
	
			 var replacements = {
		       	value: formattedValue,
		        //compared_value: comparedTotal,
		        total_delta : Math.abs(valueDeltaChange),
		        percent_change : Math.abs(valuePercentChange).toFixed(2) + '%',
		        primary_dimension : actionableItem
		    };

			$.each( insightsPhrases, function( index, insightsPhrase ) {

				var replacedPhrase = insightsPhrase.phrase.replace(/{{(\w+)}}/g, function (m, m1) {
				  return replacements[m1] || m;  
				});

				replacedPhrases.push(replacedPhrase)

			})


		}


			factor.meta.insightsPhrases = replacedPhrases
			factor.meta.pointsPhrases = pointsPhrases

			/**
			 *
			 * MAKE INSIGHT OBJECT -- add to insight object
			 * 
			*/

			var data = {}
			data = factor.meta;
			//data.original_factor = factor; // this creates a cyclic object value

			if ( typeof FT.insights.data.asset_insights.statuses[status] == "undefined") {
				FT.insights.data.asset_insights.statuses[status] = {
					count : 0,
					list : []
				}
			}

			if ( typeof FT.insights.data.asset_insights.metrics[factor.meta.parentMetric] == "undefined") {
				FT.insights.data.asset_insights.metrics[factor.meta.parentMetric] = []
			}

			if ( typeof FT.insights.data.asset_insights.buckets[factor.meta.bucketName] == "undefined") {
				FT.insights.data.asset_insights.buckets[factor.meta.bucketName] = []
			}


			FT.insights.data.asset_insights.statuses[status].count++;
			FT.insights.data.asset_insights.statuses[status].list.push(data)
			FT.insights.data.asset_insights.metrics[factor.meta.parentMetric].push(data)
			FT.insights.data.asset_insights.buckets[factor.meta.bucketName].push(data)

			return {
				data : data
			}

		}

	},

	phraser : function(metric) {

		var insightsData = FT.insights.data
		
		//console.log('Phrase METRIC>>>', metric)
	
		var identifier = metric.identifier
		var identifier_short = metric.identifier_short
		var currentTotal = metric.data.values.current
		var comparedTotal = metric.data.values.compared
		var totalDelta = metric.data.values.delta
		var formatType = ( typeof metric.format === 'undefined' ) ? 'integer' : metric.format
		var totalPercentDelta = metric.data.values.percentDelta
		var weightedPercentDelta = metric.data.values.weightedPercentDelta
		var rolledUpPercentDelta =  metric.data.values.rolledUpPercentDelta
		var weight =  metric.data.values.weight
		var metricScore = metric.metricScore
		var label = metric.label;
		var trend = ( typeof metric.trend === 'undefined' ) ? 'higher' : 'lower'
		var tags = [];
		var verbStatus = "";
		var status = "";

		switch ( trend ) {

			default : 

				if ( totalDelta > 0 ) {
					status = 'positive'	
				} else if ( totalDelta < 0 ) {
					status = 'negative'	
				} else {
					status = 'neutral'	
				}

				verbStatus = status;

			break

			case 'lower' :

				if ( totalDelta > 0 ) {
					status = 'negative'	
					verbStatus = 'positive'
				} else if ( totalDelta < 0 ) {
					status = 'positive'	
					verbStatus = 'negative'
				} else {
					status = 'neutral'
					verbStatus = status
				}


			break


		}

		switch ( formatType ) {

			default :

				//totalDelta = Math.abs(parseInt(totalDelta).toLocaleString())

				totalDelta = Math.abs(parseInt(totalDelta)).toLocaleString()
				currentTotal = parseInt(currentTotal).toLocaleString()
				comparedTotal = parseInt(comparedTotal).toLocaleString()

			break

			case "percent" :

				totalDelta = parseInt(totalDelta).toLocaleString()
				currentTotal = Math.abs(currentTotal).toFixed(2)
				comparedTotal = Math.abs(comparedTotal).toFixed(2)

			break

			case "seconds" :
			case "time" :

				totalDelta = FT.utilities.secondsToHMS(Math.abs(totalDelta));
				comparedTotal = FT.utilities.secondsToHMS(comparedTotal);
				currentTotal = FT.utilities.secondsToHMS(currentTotal);

			break

			case "currency" :

				totalDelta = '$' + Math.abs(totalDelta).toFixed(2);
				comparedTotal = '$' + comparedTotal;
				currentTotal = '$' + currentTotal;

			break

		}

		tags.push('platform')
		tags.push(status)
		//tags.push(metric.name)
		tags.push(metric.dataSourcesUsed[0])		

		/**
		 *
		 * INSIGHTS PHRASES
		 * 
		*/

		var insightsTagsSearch = tags.concat(metric.name)
		
		// TODO if has metric, and not the current metric EXCLUDE
		//console.log( 'PLATFORM INSIGHTS TAG SEARCH:', metric.name, insightsTagsSearch)
		var insightsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.insights, insightsTagsSearch) 

		//console.log( 'PLATFORM INSIGHTS TAG SEARCH POINTS:', metric.name, tags)
		var pointsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.phrases, tags) 
		
		var replacedPhrases = [];

		if ( insightsPhrases.length ) {
	
			 var replacements = {
		       	value: currentTotal,
		        compared_value: comparedTotal,
		        total_delta : totalDelta,
		        percent_change : Math.abs(totalPercentDelta).toFixed(2) + '%',
		        primary_dimension : 'nothing'
		    };

			$.each( insightsPhrases, function( index, insightsPhrase ) {

				var replacedPhrase = insightsPhrase.phrase.replace(/{{(\w+)}}/g, function (m, m1) {
				  return replacements[m1] || m;  
				});

				replacedPhrases.push(replacedPhrase)



			})

		}

		var data = {
			name : metric.name,
			label : metric.label,
			status : status,
			totalDelta : totalDelta,
			currentTotal : currentTotal,
			comparedTotal : comparedTotal,
			totalPercentDelta : totalPercentDelta,
			weightedPercentDelta : weightedPercentDelta,
			weight : weight,
			metricScore : metricScore,
			tags : tags,
			rolledUpPercentDelta : metric.data.values.rolledUpPercentDelta,
			insightsPhrases : replacedPhrases,
			pointsPhrases: pointsPhrases
		}

		return {
			status : status,
			data : data
		}

	},

	afterInsights : function() {

		FT.debug.metrics()

		//console.log('PHRASES ARRAY>>>', FT.phrases.phrases)
		//var filter = [ "platform", "positive", "google_analytics" ]
		//var phraseSet = FT.utilities.matchingAllTagsExactlyFilter(FT.phrases.phrases, filter)
		//console.log('PHRASE SET>>>', phraseSet)

	}

	
}

FT.insights.init