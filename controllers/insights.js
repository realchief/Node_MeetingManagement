var insightsDefinition = require('../definitions/insights');
//var insightsList = insightsDefinition.get();

var bucketDefinition = require('../definitions/buckets');
//var bucketList = bucketDefinition.get();

var utilities = require('../controllers/utilities')
var _ = require('lodash');

var colors = require('colors');
var emoji = require('node-emoji')

/* get all phrases into an array */

var phraseMaker = require('../controllers/phrases');

var insights = {

	insightsList : {},

	bucketList : {},

	allPhrases : {},

	makeInsightsList : function() {

		this.insightsList = insightsDefinition.get()
		return this.insightsList

	},

	makeBucketList : function() {

		this.bucketList = bucketDefinition.get()
		return this.bucketList

	},

	getPhrasesFromDb : function() {

		var thisModule = this;

		return new Promise(function(resolve, reject) {

			phraseMaker.getPhrasesFromDb().then( function( phrases ) {
				
				console.log("\n", emoji.get("sparkle"), 'got phrases from DB')

				thisModule.allPhrases.allTalkingPoints = phrases.allTalkingPoints
				thisModule.allPhrases.allInsights = phrases.allInsights
				thisModule.allPhrases.allActionItems = phrases.allActionItems
				thisModule.allPhrases.allResources = phrases.allResources

				thisModule.allPhrases.allTalkingPointsAndActionItems = phrases.allTalkingPoints.concat(phrases.allActionItems)

				resolve ( thisModule.allPhrases )
			})

		})

	},

	getPhrases : function() {

		var thisModule = this

		return new Promise(function(resolve, reject) {

			var talkingPointsPhrases = require('../definitions/phrases-talking-points');
			var insightsPhrases = require('../definitions/phrases-insights');
			var actionItemsPhrases = require('../definitions/phrases-action-items');
			var resourcesPhrases = require('../definitions/phrases-resources');
			 
			var talkingPointsPhrasesList = talkingPointsPhrases.get();
			var insightsPhrasesList = insightsPhrases.get();
			var actionItemsList = actionItemsPhrases.get();
			var resourcesList = resourcesPhrases.get();

			var allTalkingPoints = [];
			var allActionItems = [];
			var allInsights = [];
			var allResources = [];

			_.forEach(talkingPointsPhrasesList, function(phrase,index) {
			  allTalkingPoints.push(phraseMaker.make(phrase))
			})

			_.forEach(insightsPhrasesList, function(phrase,index) {
			  allInsights.push(phraseMaker.make(phrase))
			})

			_.forEach(actionItemsList, function(phrase,index) {
		        allActionItems.push(phraseMaker.make(phrase, true))
		    })

			_.forEach(resourcesList, function(phrase,index) {
		        allResources.push(phraseMaker.make(phrase, true))
		    })

			console.log("\n", emoji.get("sparkle"), 'got phrases from file')

			thisModule.allPhrases.allTalkingPoints = allTalkingPoints
			thisModule.allPhrases.allInsights = allInsights
			thisModule.allPhrases.allActionItems = allActionItems
			thisModule.allPhrases.allResources = allResources

			thisModule.allPhrases.allTalkingPointsAndActionItems = thisModule.allPhrases.allTalkingPoints.concat(thisModule.allPhrases.allActionItems)
		
			resolve ( thisModule.allPhrases )

		})


	},
	
	getInsights : function( platform, allDataSources ) {

		var thisModule = this
		
		return new Promise(function(resolve, reject) {

			var bucketList = thisModule.makeBucketList();
			var getAllPhrases = thisModule.getPhrases();

			var insightsList = thisModule.makeInsightsList();
			var insightsData = insightsList.data


			/**
			 *
			 * MAKE metric INSIGHT OBJECT 
			 * 
			*/

			var addToInsightsObject = function( phraseObject, parentBucket, assetInsights ) {

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

			getAllPhrases.then( function( phrases ) {

				/**
				 *
				 * platform level insights
				 * 
				*/

				_.forEach ( platform, function( category, categoryName ) {

					var bucketName = "none"

					_.forEach ( category.metrics, function( metric, metricName ) {

						if ( typeof metric.data !== 'undefined') {

							bucketName = utilities.getBucket(metricName);
				
							var phraseObject = thisModule.platformPhraser(metric);
							var status = phraseObject.status
				
							if ( metric.asset_links ) {

								//console.log( 'base metric: ', metric.asset_insights)
								var assetInsights = thisModule.getAssetInsights(allDataSources, metric.dataSourcesUsed, metric.asset_links, status, metricName, bucketName )
								
								if ( assetInsights ) {
									
									_.forEach( assetInsights, function( asset, index ) {

										//console.log('Individual Factor>>>>', asset.meta.parentMetric, factor)

										var assetPhrase = ""
										assetPhrase = thisModule.assetPhraser( asset )
									
									})
								}
							}

							/**
							 *
							 * MAKE INSIGHT OBJECT -- add to insight object
							 * 
							*/

							addToInsightsObject( phraseObject, bucketName, assetInsights )

						}

					})

					/* CATEGORY EQUATIONS WERE HERE */

				})

				
				/**
				 *
				 * bucket level insights
				 * 
				*/

				var pictureTips = [];
			
				_.forEach ( bucketList, function( bucket, bucketName ) {

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

					_.forEach ( bucket.meta.order, function( category, count ) {

						if ( bucket.meta.mappings[category].length <= 0 ) return;

						_.forEach ( bucket.meta.mappings[category], function( metric, index ) {

							var metricParent = 'metrics';

							if ( typeof platform[category][metricParent][metric] == "undefined") { 
								return 
							}

							// TODO: dont add metrics to scores if there is no reason for it (I.E. revenue for GA)
							if ( typeof platform[category][metricParent][metric].data !== "undefined") {

								var metric = platform[category][metricParent][metric];
								var status = metric.status;
							
								scoreValues.push(metric.metricScore)
								scoreWeights.push(metric.weight)
							}

						} )

						var weightedScore = utilities.weightedMean( scoreValues, scoreWeights )
						weightedScoreDisplay = (weightedScore * 100).toFixed(0) 
					
						bucketList[bucketName].data.totalScore = weightedScoreDisplay;


						/**
						 *
						 * Get the number of positive and negative metrics
						 * 
						*/
					
						positives = thisModule.filter(insightsData.platform_insights.buckets[bucketName], 'status', 'positive')
						negatives = thisModule.filter(insightsData.platform_insights.buckets[bucketName], 'status', 'negative')
						neutrals = thisModule.filter(insightsData.platform_insights.buckets[bucketName], 'status', 'neutral')
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
			
				var bucketInsights = thisModule.arrangeBucketInsights();

				//console.log("\n", emoji.get("sparkle"), '>>>>>> bucket insights', insightsList.data.bucket_insights)

				var platformInsights = thisModule.arrangePlatformInsights();

				resolve ( insightsList )

			})

		})

	},

	arrangeBucketInsights : function() {

		/**
		 *
		 * Scores
		 * 
		*/

		var insightsList = this.insightsList
		var bucketList = this.bucketList

		_.forEach(insightsList.data.bucket_insights.buckets, function( bucket, index ) {

			var bucketLabel = bucketList[bucket.name].meta.label
			var score = bucket.totalScore
			bucketList[bucket.name].data.totalScore = score;
			bucket.scorePhrase = bucketLabel + ' Score is: ' + " " + score
		})

		insightsList.data.bucket_insights.headline = "Temporary Headline"

	},


	getUniquePhrase : function( phraseSet ) {

		if ( !phraseSet) return

		var insightsList = this.insightsList

		utilities.shuffle(phraseSet)

		var usedIds = insightsList.data.usedPhrases.ids;
		var usedPhrases = insightsList.data.usedPhrases.phrases;
		var usedTags = insightsList.data.usedPhrases.tags;

		var uniquePhrase = {}
		uniquePhrase.phrase = phraseSet[0].phrase
		uniquePhrase.id = phraseSet[0].id
		uniquePhrase.tags = phraseSet[0].all_tags

		if (usedPhrases.indexOf(uniquePhrase.phrase) >= 0) {

			for ( i = 0; i < phraseSet.length; i++ ) {

				if (usedPhrases.indexOf(phraseSet[i].phrase) == -1) {

					//console.log(">>> Got New Phrase", phraseSet[i] )

					uniquePhrase.phrase = phraseSet[i].phrase;
					uniquePhrase.id = phraseSet[i].id;
					uniquePhrase.tags = phraseSet[i].all_tags;

					usedPhrases.push(uniquePhrase.phrase)
					usedIds.push(uniquePhrase.id)

					break
				} 

				//console.log(">>> Found DUPE!", phraseSet[i] )

				if ( i == phraseSet.length-1) {
					uniquePhrase.phrase = phraseSet[0].phrase //+ " (duplicate)"
					uniquePhrase.id = phraseSet[0].id
					uniquePhrase.tags = phraseSet[0].all_tags
				}

			}

		} else {

			usedPhrases.push(uniquePhrase.phrase)
			usedIds.push(uniquePhrase.id)
		
		}
	
		return uniquePhrase

	},

	arrangePlatformInsights : function() {
	
		var insightsList = this.insightsList
		var bucketList = this.bucketList
	
		var factorList = []
		var phraseList = []
		var assetPhrases = []
		var platformPhrases = []

		var thisModule = this
	
		thisModule.sort(insightsList.data.platform_insights.metrics, 'weightedPercentDelta' )

		_.forEach( insightsList.data.platform_insights.metrics, function( metric, index ) {

			var parentBucket = bucketList[utilities.getBucket(metric.name)].meta.shortLabel;
			
			//console.log("REORDERED PHRASE>>>", parentBucket, metric.talkingPointsPhrases )
			
			var pointToUse = thisModule.getUniquePhrase(metric.talkingPointsAndActionItemsPhrases)
			var talkingPointToUse = thisModule.getUniquePhrase(metric.talkingPointsPhrases)
			var actionItemToUse = thisModule.getUniquePhrase(metric.actionItemsPhrases)

			console.log( 'Unique Action Item:', 'for platform:', metric.name, actionItemToUse ? actionItemToUse.phrase : 'undefined' )
			
			console.log( 'Unique Talking Point:', 'for platform:', metric.name, talkingPointToUse ? talkingPointToUse.phrase : 'undefined' )

			var inlineStyle = utilities.getInlineStyle('status', metric.status);

			if ( typeof metric.insightsPhrases[0] !== 'undefined') {
				
				var bucketTag = '<span class="bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';
				
				var completePhrase = {
					point_id : pointToUse.id,
					insight_id : metric.insightsPhrases[0].id,
					point_tags : pointToUse.tags,
					insight_tags : metric.insightsPhrases[0].tags,
					phrase : metric.insightsPhrases[0].phrase + '.' + ' ' + "<strong>" + pointToUse.phrase + "</strong>" + " " + bucketTag
				}

				phraseList.push(completePhrase)
				platformPhrases.push(completePhrase)		

				// write newly used combined phrase back to the metric
				metric.completePhrase = completePhrase

			} else {

				//console.log('UNDEFINED INSIGHTS PHRASE', metric)
			}
			var data = [];
			_.forEach( metric.assetInsights, function( assetInsight, index ) {
	
				var asset = assetInsight.meta
				
				var inlineStyle = utilities.getInlineStyle('status', asset.status);
				
				var bucketTag = '<span class="metric-asset bucket-with" style="display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana;' + ' ' + inlineStyle + '">#' + parentBucket  + '</span>';
				
				if ( typeof asset.talkingPointsPhrases !== 'undefined') {
					
					var pointToUse = thisModule.getUniquePhrase(asset.talkingPointsAndActionItemsPhrases)
					var talkingPointToUse = thisModule.getUniquePhrase(asset.talkingPointsPhrases)
					var actionItemToUse = thisModule.getUniquePhrase(asset.actionItemsPhrases)

					console.log( 'Unique Action Item:', 'for asset:', metric.name, actionItemToUse ? actionItemToUse.phrase : 'undefined' )
					
					console.log( 'Unique Talking Point:', 'for asset:', metric.name, talkingPointToUse ? talkingPointToUse.phrase : 'undefined' )
					
					var completePhrase = {
						point_id : pointToUse.id,
						insight_id : metric.insightsPhrases[0].id,
						point_tags : pointToUse.tags,
						insight_tags : metric.insightsPhrases[0].tags,
						phrase : '<span class="metric-asset">' + asset.insightsPhrases[0].phrase + '.' + ' ' + "<strong>" + pointToUse.phrase + "</strong>" + " " + bucketTag + '</span>'
					}
					
					phraseList.push(completePhrase)	
					assetPhrases.push(completePhrase)			
				
				}

				asset.completePhrase = completePhrase
				//asset.completePhraseWithTalkingPoint = completePhraseWithTalkingPoint
				//asset.completePhraseWithActionItem = completePhraseWithActionItem
				//asset.completePhraseWithResource = completePhraseWithResource

			})
		})


		/* FOR EMAIL */

		insightsList.data.asset_phrases = assetPhrases 
		insightsList.data.platform_phrases = platformPhrases 

		insightsList.data.all_phrases = phraseList

		insightsList.data.action_items = phraseList.slice(0,3)
		insightsList.data.talking_points = phraseList.slice(3,6)

		/* return the object! */
		return insightsList

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

		return listing

	},


	filter : function(listing, key, value) {

		//console.log('Filter:', 'Listing', listing, 'Key', key, 'Value', value)

		if ( !listing ) return []

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


	getAssetInsights : function( allDataSources, dataSources, assetLinks, status, metricName, bucketName ) {

		var insightsList = this.insightsList

		// NEED TO GET RID OF THIS!!!
		var status = "positive";
		var thisModule = this
		var topAssets = [];
		
		//console.log('GET CONTRIB FACTOR>>', metricName, 'Sources Used:', dataSources, 'Factors:', assetLinks, status, "BucketName:", bucketName)

			_.forEach ( assetLinks, function( assetLink, index ) {

				var dataSource = assetLink.source;
				var assetGroup = "";
				var tags = [];
				
				if ( typeof assetLink.group !== 'undefined') {
					assetGroup = assetLink.group 
				} else {
					assetGroup = 'posts';
				}

				var topAsset = {}

				if ( typeof allDataSources[dataSource].metric_assets[assetGroup] !== 'undefined' ) {
					
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


					//console.log('LIST>>>', dataSource, assetGroup, sortBy, filter, allDataSources[dataSource].metric_assets[assetGroup].current.list)

					topAsset = thisModule.sort(allDataSources[dataSource].metric_assets[assetGroup].current.list, sortBy, filter )[0]
				}

				if ( topAsset ) {

					topAsset.meta = assetLink;
					topAsset.meta.dataSource = allDataSources[dataSource].meta.name
					topAsset.meta.genericName = allDataSources[dataSource].meta.genericName
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
				
						if ( allDataSources.google_analytics.metric_assets[assetLink.match] ) {

							var pageInfo = thisModule.filter(allDataSources.google_analytics.metric_assets[assetLink.match].current.list, 'primary_dimension', topAsset[assetLink.linkable] )
						
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



					topAssets.push(Object.assign({},topAsset)) // new object in case we use the same article
					
				}

			})

		return topAssets;

	},

	assetPhraser : function( asset ) {

		var thisModule = this

		var insightsList = thisModule.insightsList

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
				var valueFieldToUse = 'value' + utilities.uppercaseFirst(asset.meta.orderType) + "Change"
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

					formattedValue = utilities.secondsToHMS(formattedValue);

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
			 * ADD PHRASES TO THE ASSET LEVEL
			 * 
			*/

			var tags = asset.meta.tags
			var insightsTags = tags // this tag set has all tags including the metric and sort type
			var phrasesTags = tags.slice(0,3) // this tag has only the data source, the sentiment, and "asset" or "platform"

			var parentInfo = status + ' ' + asset.meta.dataSource + ' ' + asset.meta.parentMetric + ' ' + sourcePhrase

			var replacements = {
		       	value: formattedValue,
		        //compared_value: comparedTotal,
		        total_delta : Math.abs(valueDeltaChange).toLocaleString(),
		        percent_change : Math.abs(valuePercentChange).toFixed(2) + '%',
		        primary_dimension : actionableItem
		    };

			var allSentences = thisModule.getSentences( 'asset', { insightsTags: insightsTags, phrasesTags : phrasesTags }, replacements, parentInfo   )

			asset.meta.insightsPhrases = allSentences.insightsPhrases
			asset.meta.talkingPointsPhrases = allSentences.talkingPointsPhrases
			asset.meta.actionItemsPhrases = allSentences.actionItemsPhrases
			asset.meta.resourcesPhrases = allSentences.resourcesPhrases
			asset.meta.talkingPointsAndActionItemsPhrases = allSentences.talkingPointsAndActionItemsPhrases
	
			/**
			 *
			 * MAKE INSIGHT OBJECT -- add to insight object
			 * 
			*/

			var data = {}
			data = asset.meta;
			//data.original_asset = asset; // this creates a cyclic object value

			if ( typeof insightsList.data.asset_insights.statuses[status] == "undefined") {
				insightsList.data.asset_insights.statuses[status] = {
					count : 0,
					list : []
				}
			}

			if ( typeof insightsList.data.asset_insights.metrics[asset.meta.parentMetric] == "undefined") {
				insightsList.data.asset_insights.metrics[asset.meta.parentMetric] = []
			}

			if ( typeof insightsList.data.asset_insights.buckets[asset.meta.bucketName] == "undefined") {
				insightsList.data.asset_insights.buckets[asset.meta.bucketName] = []
			}


			insightsList.data.asset_insights.statuses[status].count++;
			insightsList.data.asset_insights.statuses[status].list.push(data)
			insightsList.data.asset_insights.metrics[asset.meta.parentMetric].push(data)
			insightsList.data.asset_insights.buckets[asset.meta.bucketName].push(data)

			return {
				data : data
			}

		}

	},

	platformPhraser : function( metric ) {

		var thisModule = this
		var insightsList = this.insightsList
		var insightsData = insightsList.data
		
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

				totalDelta = utilities.secondsToHMS(Math.abs(totalDelta));
				comparedTotal = utilities.secondsToHMS(comparedTotal);
				currentTotal = utilities.secondsToHMS(currentTotal);

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

		var insightsTags = tags.concat(metric.name) // "insightsTags" adds the metric to "tags"
		var phrasesTags = tags // "tags" has only the data source, the sentiment, and "asset" or "platform"

		var parentInfo = status + ' ' + metric.dataSourcesUsed[0] + ' ' + metric.name

		var replacements = {
	       	value: currentTotal,
	        compared_value: comparedTotal,
	        total_delta : totalDelta,
	        percent_change : Math.abs(totalPercentDelta).toFixed(2) + '%',
	        primary_dimension : 'nothing'
	    };

		var allSentences = thisModule.getSentences( 'platform', { insightsTags: insightsTags, phrasesTags : phrasesTags }, replacements, parentInfo  )

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

			insightsPhrases : allSentences.insightsPhrases,
			talkingPointsPhrases: allSentences.talkingPointsPhrases,
			actionItemsPhrases: allSentences.actionItemsPhrases,
			resourcesPhrases: allSentences.resourcesPhrases,
			talkingPointsAndActionItemsPhrases : allSentences.talkingPointsAndActionItemsPhrases
		}

		return {
			status : status,
			data : data
		}

	},

	getSentences : function( level, tags, replacements, parentInfo ) {

		// insight = insight = language around the metric
		// talking point = question
		// action item = statement
		// resource = resource
		// collective of talking points and action item = phrases


		var thisModule = this

		var insightsTags = tags.insightsTags
		var phrasesTags = tags.phrasesTags

		var insightsPhrases = phraseMaker.matchingAllTagsFilter(thisModule.allPhrases.allInsights, insightsTags) 
	
		if ( !insightsPhrases ) {
			console.log( 'No insights phrases for', level, parentInfo )
		}

		var talkingPointsAndActionItemsPhrases = phraseMaker.matchingAllTagsFilter(thisModule.allPhrases.allTalkingPointsAndActionItems, phrasesTags) 

		var talkingPointsPhrases = phraseMaker.matchingAllTagsFilter(thisModule.allPhrases.allTalkingPoints, phrasesTags) 

		if ( !talkingPointsPhrases ) {
			console.log( 'No talking points for', level, parentInfo )
		}

		var actionItemsPhrases = phraseMaker.matchingAllTagsFilter(thisModule.allPhrases.allActionItems, phrasesTags )

		if ( !actionItemsPhrases ) {
			console.log( 'No action items for', level, parentInfo )
		}

		var resourcesPhrases = phraseMaker.matchingAllTagsFilter(thisModule.allPhrases.allResources, phrasesTags) 

		if ( !resourcesPhrases ) {
			console.log( 'No talking points for', level, parentInfo )
		}

		if ( !talkingPointsPhrases && !actionItemsPhrases ) {
			console.log( 'No action items or talking points for', parentInfo )
		}

		var replacedPhrases = [];

		if ( insightsPhrases ) {
	
			_.forEach( insightsPhrases, function( insightsPhrase, index ) {

				var replacedPhrase = insightsPhrase.phrase.replace(/{{(\w+)}}/g, function (m, m1) {
				  return replacements[m1] || m;  
				});

				replacedPhrases.push({
					phrase: replacedPhrase,
					id: insightsPhrase.id,
					tags: insightsPhrase.all_tags
				})



			})

		}

		return {
			insightsPhrases: replacedPhrases,
			talkingPointsAndActionItemsPhrases: talkingPointsAndActionItemsPhrases,
			talkingPointsPhrases: talkingPointsPhrases,
			actionItemsPhrases : actionItemsPhrases,
			resourcesPhrases : resourcesPhrases
		}

	},

	afterInsights : function() {


	}

	
}

module.exports = insights