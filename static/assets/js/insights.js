var FT = FT || {};

FT.insights = {
	
	init : function() {

		
	},

	data : {

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
			metrics : {},
			buckets: {}
		},
		usedPhrases : {
			phrases : [],
			tags : []
		}

	},

	make : function() {

		//console.log('### make', FT.insights.data)
		
		FT.insights.data.bucket_insights = {}
		FT.insights.data.bucket_insights.buckets = []
	
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

		var addToInsightsObject = function(phraseObject, parentBucket, assetInsights) {

			var status = phraseObject.status

			if ( typeof insightsData.platform_insights.statuses[status] == 'undefined' ) {
				insightsData.platform_insights.statuses[status] = {
					count : 0,
					list : []
				}
			}

			if ( typeof insightsData.platform_insights.buckets[parentBucket] == 'undefined' ) {
				insightsData.platform_insights.buckets[parentBucket] = []
			}

			insightsData.platform_insights.statuses[status].count++
		
			if ( assetInsights ) {
				phraseObject.data.assetInsights = assetInsights
			}

			insightsData.platform_insights.statuses[status].list.push(phraseObject.data)
			insightsData.platform_insights.metrics.push(phraseObject.data)
			insightsData.platform_insights.buckets[parentBucket].push(phraseObject.data)

	
		}
		
		//console.log('>>>>> Insights Data', insightsData)

		/**
		 *
		 * platform level insights
		 * 
		*/

		var html = "";
		
		$.each ( FT.data.platform, function( categoryName, category ) {

			var bucketName = "none"

			$.each ( category.metrics, function( metricName, metric ) {

				if ( typeof metric.data !== 'undefined') {

					bucketName = FT.utilities.getBucket(metricName);
		
					var phraseObject = FT.insights.platformPhraser(metric);
					var status = phraseObject.status
		
					if ( metric.asset_links ) {

						//console.log( 'base metric: ', metric.asset_insights)
						var assetInsights = FT.insights.getAssetInsights(metric.dataSourcesUsed, metric.asset_links, status, metricName, bucketName )
						
						if ( assetInsights ) {
							
							$.each( assetInsights, function( index, factor ) {

								//console.log('Individual Factor>>>>', asset.meta.parentMetric, factor)

								var assetPhrase = ""
								assetPhrase = FT.insights.assetPhraser( factor )
							
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

			var scoreValues = [];
			var scoreWeights = [];
			var weightedScoreDisplay = "";
			var positives = [];
			var negatives = [];
			var neutrals = [];
			var mappingsStatus = ""

			/**
			 *
			 * SET BUCKET INSIGHTS
			 * 
			*/

			$.each ( bucket.meta.order, function( count, category ) {

				if ( bucket.meta.mappings[category].length <= 0 ) return;

				$.each ( bucket.meta.mappings[category], function( index, metric ) {

					var metricParent = 'metrics';

					if ( typeof FT.data.platform[category][metricParent][metric] == "undefined") { 
						return 
					}

					// TODO: dont add metrics to scores if there is no reason for it (I.E. revenue for GA)
					if ( typeof FT.data.platform[category][metricParent][metric].data !== "undefined") {

						var metric = FT.data.platform[category][metricParent][metric];
						var status = metric.status;
					
						scoreValues.push(metric.metricScore)
						scoreWeights.push(metric.weight)
					}

				} )

				var weightedScore = FT.utilities.weightedMean( scoreValues, scoreWeights )
				weightedScoreDisplay = (weightedScore * 100).toFixed(0) 
			
				FT.data.buckets[bucketName].data.totalScore = weightedScoreDisplay;


				/**
				 *
				 * Get the number of positive and negative metrics
				 * 
				*/
			
				positives = FT.insights.filter(FT.insights.data.platform_insights.buckets[bucketName], 'status', 'positive')
				negatives = FT.insights.filter(FT.insights.data.platform_insights.buckets[bucketName], 'status', 'negative')
				neutrals = FT.insights.filter(FT.insights.data.platform_insights.buckets[bucketName], 'status', 'neutral')
				var totalMappingsCount = positives.length + negatives.length + neutrals.length
				var bucketPerformance = positives.length / totalMappingsCount
				bucketPerformancePercentage = bucketPerformance * 100;

				if ( bucketPerformancePercentage > 50 ) {
					mappingsStatus = 'positive'	
				} else if ( bucketPerformancePercentage < 50 ) {
					mappingsStatus = 'negative'	
				} else {
					mappingsStatus = 'neutral'	
				}

			} )			

			insightsData.bucket_insights.buckets.push({
				name : bucketName,
				scoreValues : scoreValues,
				scoreWeights : scoreWeights,
				totalScore : weightedScoreDisplay,
				positiveMappingsCount : positives.length,
				negativeMappingsCount : negatives.length,
				neutralMappingsCount : neutrals.length,
				mappingsStatus : mappingsStatus
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

		/**
		 *
		 * Scores
		 * 
		*/

		$.each(FT.insights.data.bucket_insights.buckets, function( index, bucket ) {

			var bucketLabel = FT.data.buckets[bucket.name].meta.label
			var score = bucket.totalScore
			FT.data.buckets[bucket.name].data.totalScore = score;
			bucket.scorePhrase = bucketLabel + ' Score is: ' + " " + score
		})

		FT.insights.data.bucket_insights.headline = "Temporary Headline"

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
	
		var factorList = []
		var phraseList = []
	
		FT.insights.sort(FT.insights.data.platform_insights.metrics, 'weightedPercentDelta' )

		$.each( FT.insights.data.platform_insights.metrics, function( index, metric ) {

			//console.log(metric.name, FT.utilities.getBucket(metric.name))
			var parentBucket = FT.data.buckets[FT.utilities.getBucket(metric.name)].meta.shortLabel;

			//console.log("REORDERED PHRASE>>>", parentBucket, metric.phrase)
			//factorList.push(metric.phrase)

			var phraseToUse = FT.insights.getUniquePhrase(metric.talkingPointsPhrases)

			var inlineStyle = FT.utilities.getInlineStyle('status', metric.status);

			if ( typeof metric.insightsPhrases[0] !== 'undefined') {
				var bucketTag = '<span class="bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';
				var completePhrases = metric.insightsPhrases[0] + '.' + ' ' + "<strong>" + phraseToUse + "</strong>" + " " + bucketTag;
				phraseList.push(completePhrases)
				// write newly used combined phrase back to the metric
				metric.completePhrases = completePhrases

			} else {

				//console.log('UNDEFINED INSIGHTS PHRASE', metric)
			}
			var data = [];
			$.each( metric.assetInsights, function( index, assetInsight ) {
					// datum = {};
					// datum['inlineStyle'] = inlineStyle
					var asset = assetInsight.meta
					//console.log('Asset Insight:', factor)
					var inlineStyle = FT.utilities.getInlineStyle('status', asset.status);
					var bucketTag = '<span class="metric-asset bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';
					if ( typeof asset.talkingPointsPhrases !== 'undefined') {
						var phraseToUse = FT.insights.getUniquePhrase(asset.talkingPointsPhrases)
						var completePhrases = '<span class="metric-asset">' + asset.insightsPhrases[0] + '.' + ' ' + "<strong>" + phraseToUse + "</strong>" + " " + bucketTag + '</span>'
						phraseList.push(completePhrases)			
					}
					asset.completePhrases = completePhrases
				})
		})


		/* FOR EMAIL */

		FT.insights.data.all_phrases = phraseList
		FT.insights.data.action_items = phraseList.slice(0,3)
		FT.insights.data.talking_points = phraseList.slice(3,6)

		/* /// FOR EMAIL */

		FT.debug.allPhrases()

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

		var topAssets = [];
		
		//console.log('GET CONTRIB FACTOR>>', metricName, 'Sources Used:', dataSources, 'Factors:', assetLinks, status, "BucketName:", bucketName)

			$.each ( assetLinks, function( index, assetLink ) {

				var dataSource = assetLink.source;
				var assetGroup = "";
				var tags = [];
				
				if ( typeof assetLink.group !== 'undefined') {
					assetGroup = assetLink.group 
				} else {
					assetGroup = 'posts';
				}

				var topAsset = {}
				if ( typeof FT.data.data_sources[dataSource].metric_assets[assetGroup] !== 'undefined' ) {
					
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


					//console.log('LIST>>>', dataSource, assetGroup, sortBy, filter, FT.data.data_sources[dataSource].metric_assets[assetGroup].current.list)

					topAsset = FT.insights.sort(FT.data.data_sources[dataSource].metric_assets[assetGroup].current.list, sortBy, filter )
				}

				if ( topAsset ) {

					topAsset.meta = assetLink;
					topAsset.meta.dataSource = FT.data.data_sources[dataSource].meta.name
					topAsset.meta.genericName = FT.data.data_sources[dataSource].meta.genericName
					topAsset.meta.bucketName = bucketName
					topAsset.meta.parentMetric = metricName
					topAsset.meta.value = topAsset[assetLink.field]
					
					topAsset.meta.status = status
					topAsset.meta.format = assetLink.format || 'none'
					
					var deltaChangeField = assetLink.field + "_" + 'deltaChange'
					var percentChangeField = assetLink.field + "_" + 'percentChange'
					var percentOfTotalField = assetLink.field + "_" + 'percentOfTotal'
					topAsset.meta.valuePercentChange = topAsset[percentChangeField]
					topAsset.meta.valueDeltaChange = topAsset[deltaChangeField]
					topAsset.meta.valuePercentOfTotal = topAsset[percentOfTotalField]
				
					/*if ( metricName == 'pageviews') {
					console.log('FACTOR MADE>>', topAsset.meta.dataSource, metricName, topAsset)
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
				
					topAsset.meta.tags = tags

					if ( typeof assetLink.match !== 'undefined') {
				
						if ( FT.data.data_sources.google_analytics.metric_assets[assetLink.match] ) {

							var pageInfo = FT.insights.filter(FT.data.data_sources.google_analytics.metric_assets[assetLink.match].current.list, 'primary_dimension', topAsset[assetLink.linkable] )
						
							if ( typeof pageInfo[0] !== 'undefined' ) {
								
								//console.log('Page Title', 'for:', topAsset[assetLink.linkable], pageInfo[0]['secondary_dimension'])
								//console.log('Hostname', 'for:', topAsset[assetLink.linkable], pageInfo[0]['hostname'])

								topAsset.meta.title = pageInfo[0]['secondary_dimension']
								topAsset.meta.hostname = pageInfo[0]['hostname']
						
								if ( topAsset.meta.title == "(not set)" ) {
									topAsset.meta.title = pageInfo[0]['secondary_dimension']
								}

							}
						}

					}



					topAssets.push($.extend({},topAsset)) // new object in case we use the same article
					
				}

			})

		return topAssets;

	},

	assetPhraser : function( asset ) {

		if ( asset.meta.value ) {

			//console.log('>>>> ASSET FACTOR', asset.meta.dataSource, asset.meta.field, asset)

			var actions = []
			var action = "";
			var status = asset.meta.status
			var actionableItem = ""
			var actionType = asset.meta.type || 'post';
			var sourcePhrase = asset.meta.genericName || asset.meta.dataSource
			var tags = [];

			var phraseToken = asset.meta.type || asset.meta.field

			if ( asset.meta.orderType ) {
				phraseToken = 'delta'
			}

			if ( asset.meta.orderType ) {
				var valueFieldToUse = 'value' + FT.utilities.uppercaseFirst(asset.meta.orderType) + "Change"
			} else {
				var valueFieldToUse = 'value'
			}

			// TODO: add "total" value for lookups where value is "change" //
			var formattedValue = asset.meta[valueFieldToUse]
			var valueDeltaChange = asset.meta.valueDeltaChange
			var valuePercentChange = asset.meta.valuePercentChange

			//console.log('Field to use:', valueFieldToUse, 'Value Delta Change:', valueDeltaChange, 'Value Percent Change to use:', valuePercentChange, 'Formatted Value', formattedValue, typeof formattedValue)

			switch ( asset.meta.format ) {

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


			switch (typeof asset.meta.linkable) {

				case 'undefined' : 
				

					if ( typeof asset.link !== 'undefined') {
						actionableItem = '<a href="' + asset.link + '" class="post-link" target="_blank">'
						actionableItem += 'This ' + sourcePhrase + ' ' + actionType;
						actionableItem += '</a>'
					} else {
						actionableItem = asset.primary_dimension
					}
				
				break

				default : 

						var displayTitle = asset.meta['title'] || asset[asset.meta['linkable']] 
						var displayHostname = asset.meta['hostname'] || 'needURL'

						actionableItem = ""
						//actionableItem += 'The ' + sourcePhrase + ' ' + actionType + ' ';
						actionableItem += '<a href="' + '//' + displayHostname + asset[asset.meta['linkable']] + '" class="post-link" target="_blank">'
						actionableItem += displayTitle;
						actionableItem += '</a>'  

				break

			}

		/**
		 *
		 * INSIGHTS PHRASES
		 * 
		*/

		var tags = asset.meta.tags
		//var insightsTagsSearch = tags.concat(metric.name)
		var insightsTagsSearch = tags


		//console.log( 'ASSET INSIGHTS TAG SEARCH:', asset.meta.field, asset.meta.parentMetric, insightsTagsSearch)
		var insightsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.insights, insightsTagsSearch) 
	
		//console.log( 'ASSET INSIGHTS PHRASES FOUND:', insightsPhrases)
		//console.log("ASSET TRYING TAGS SEARCH>>>", asset.meta.field, asset.meta.parentMetric, tags.slice(0,3))
		
		var talkingPointsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.phrases, tags.slice(0,3)) 

		//console.log('points tags:', tags.slice(0,3))		
		//console.log( 'ASSET POINTS PHRASES FOUND:', talkingPointsPhrases)
		
		var replacedPhrases = [];

		if ( insightsPhrases.length ) {
	
			 var replacements = {
		       	value: formattedValue,
		        //compared_value: comparedTotal,
		        total_delta : Math.abs(valueDeltaChange).toLocaleString(),
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


			asset.meta.insightsPhrases = replacedPhrases
			asset.meta.talkingPointsPhrases = talkingPointsPhrases

			/**
			 *
			 * MAKE INSIGHT OBJECT -- add to insight object
			 * 
			*/

			var data = {}
			data = asset.meta;
			//data.original_asset = asset; // this creates a cyclic object value

			if ( typeof FT.insights.data.asset_insights.statuses[status] == "undefined") {
				FT.insights.data.asset_insights.statuses[status] = {
					count : 0,
					list : []
				}
			}

			if ( typeof FT.insights.data.asset_insights.metrics[asset.meta.parentMetric] == "undefined") {
				FT.insights.data.asset_insights.metrics[asset.meta.parentMetric] = []
			}

			if ( typeof FT.insights.data.asset_insights.buckets[asset.meta.bucketName] == "undefined") {
				FT.insights.data.asset_insights.buckets[asset.meta.bucketName] = []
			}


			FT.insights.data.asset_insights.statuses[status].count++;
			FT.insights.data.asset_insights.statuses[status].list.push(data)
			FT.insights.data.asset_insights.metrics[asset.meta.parentMetric].push(data)
			FT.insights.data.asset_insights.buckets[asset.meta.bucketName].push(data)

			return {
				data : data
			}

		}

	},

	platformPhraser : function(metric) {

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
		var talkingPointsPhrases = FT.utilities.matchingAllTagsFilter(FT.phrases.phrases, tags) 
		
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

		// Add status to platform metric for use in bucket insights lookups
		metric.status = status;

		var data = {
			name : metric.name,
			label : metric.label,
			status : status,
			totalDelta : totalDelta,
			currentTotal : currentTotal,
			comparedTotal : comparedTotal,
			totalPercentDelta : totalPercentDelta,
			weightedPercentDelta : weightedPercentDelta,
			metricScore : metricScore,
			tags : tags,
			rolledUpPercentDelta : rolledUpPercentDelta,
			insightsPhrases : replacedPhrases,
			talkingPointsPhrases: talkingPointsPhrases
		}

		return {
			status : status,
			data : data
		}

	},

	afterInsights : function() {

		//FT.debug.metrics()

		//console.log('PHRASES ARRAY>>>', FT.phrases.phrases)
		//var filter = [ "platform", "positive", "google_analytics" ]
		//var phraseSet = FT.utilities.matchingAllTagsExactlyFilter(FT.phrases.phrases, filter)
		//console.log('PHRASE SET>>>', phraseSet)

	}

	
}

FT.insights.init