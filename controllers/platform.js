var utilities = require('../controllers/utilities')
var _ = require('lodash');

exports.setPlatform = ( dataSources ) => {

	 var platformDefinition = require('../definitions/platform');
  	 var platformList = platformDefinition.get();

  	/**
		 *
		 * platform
		 *
 		*/

		var totalsHtml = "";
		var totals = "";
		_.forEach ( platformList, function( category, categoryName ) {
			
			/**
			 * over each metric in the order array
		 	*/

			_.forEach ( category.meta.order, function( metric, count ) {
				
				var activatedcategoryMapping = false;
				var currentTotal = 0;
				var comparedTotal = 0;
				var rolledUpPercentDelta = 0;
				var fieldsUsed = [];
				var dataSourcesUsed = [];

		
				/**
				 *
				 * over each data source, see if there is a mapping to 
				 * a category metric from a data source field.
				 *
		 		*/
 		

				_.forEach ( dataSources, function( dataSource, dataSourceId ) {

					var dataSource = dataSource;
					var dataSourceName = dataSource.meta.name

					
					if ( utilities.getMapping( dataSource, categoryName, metric ) ) {

						if ( !activatedcategoryMapping ) {
							activatedcategoryMapping = true;
						}
						
						var mappedField = utilities.getMapping( dataSource, categoryName, metric ).mappedField
				
						/**
						 * allow for multiple fields mapped to a single metric
						*/

						_.forEach( mappedField.split(','), function( field, index ) {

							var delta = utilities.getDelta( dataSource, field, metric )

							if ( delta ) {

								currentTotal += delta.current;
								comparedTotal += delta.compared;
								rolledUpPercentDelta += delta.percentDeltaRaw;

								var fieldForUsed = 'Field Label';
								if ( typeof dataSource.fields[field] !== "undefined") {
									fieldForUsed = dataSource.fields[field].label
								} else {
									fieldForUsed = dataSource.equations[field].label
								}
								
								fieldsUsed.push(dataSourceName + ' ' + fieldForUsed)
								dataSourcesUsed.push(dataSourceId)

								//console.log('>>> Rolled up delta', delta.percentDeltaRaw, field, metric, rolledUpPercentDelta)

								identifier = delta.identifier || "n/a";
								identifier_short = delta.identifier_short || "n/a";

							}

						})
					
						/**
						 *
						 * grab the total over the mapped fields, allowing combinations of field to one metric
						 * 
						*/

						identifier = ( typeof platformList[categoryName].metrics[metric].identifier == "undefined" ) ? identifier : platformList[categoryName].metrics[metric].identifier
						identifier_short = ( typeof platformList[categoryName].metrics[metric].identifier_short == "undefined" ) ? identifier_short : platformList[categoryName].metrics[metric].identifier_short

						totalDelta = currentTotal - comparedTotal;

						if ( totalDelta !== 0 && !isNaN(totalDelta) ) {
							totalPercentDelta = (totalDelta / comparedTotal) * 100;
						} else {
							totalPercentDelta = 0;
						}

						if ( totalDelta > 0 ) {
							var status = 'positive'	
						} else if ( totalDelta < 0 ) {
							var status = 'negative'	
						} else {
							var status = 'neutral'	
						}

				
						/**
						 *
						 * ADD VALUES TO DATA
						 * add the rolled up totals to the platform category for use in the buckets.
						 * 
						*/

						var weightedPercentDelta =  totalPercentDelta * platformList[categoryName].metrics[metric].weight


						// ADD METRIC SCORES FOR TRAINING

						var trainingScores = []
						trainingScores.push(currentTotal)
						trainingScores.push(comparedTotal)

						if ( platformList[categoryName].metrics[metric].format !== "percent") {
							var metricScore = utilities.getScore( trainingScores, currentTotal, metric )
						} else {

							var metricScore = 0;

							if ( platformList[categoryName].metrics[metric].trend !== 'lower' ) {

								if ( status == 'positive') {
									metricScore = 1;
								} else if ( status == "neutral") {
									metricScore = .5;
								} else {
									metricScore = 0;
								}

							} else {

								if ( status == 'negative') {
									metricScore = 1;
								} else if ( status == "neutral") {
									metricScore = .5;
								} else {
									metricScore = 0;
								}

							}
						}

						//console.log("Weight>>>", metric, platformList[categoryName].metrics[metric].weight, "Percent Delta:", totalPercentDelta, "Weighted Percent Delta:", weightedPercentDelta )

						platformList[categoryName].metrics[metric].data = {}
						platformList[categoryName].metrics[metric].data.values = {}
						platformList[categoryName].metrics[metric].identifier = identifier
						platformList[categoryName].metrics[metric].identifier_short = identifier_short
						platformList[categoryName].metrics[metric].data.values.current = currentTotal
						platformList[categoryName].metrics[metric].data.values.compared = comparedTotal
						platformList[categoryName].metrics[metric].data.values.delta = totalDelta
						platformList[categoryName].metrics[metric].data.values.percentDelta = totalPercentDelta
						platformList[categoryName].metrics[metric].data.values.weightedPercentDelta = weightedPercentDelta
						platformList[categoryName].metrics[metric].data.values.rolledUpPercentDelta = rolledUpPercentDelta
						platformList[categoryName].metrics[metric].metricsUsed = fieldsUsed;
						platformList[categoryName].metrics[metric].dataSourcesUsed = dataSourcesUsed;
						platformList[categoryName].metrics[metric].metricScore = metricScore;

					} else {

					}

				

				})

				if ( !activatedcategoryMapping ) {
					//console.log('category metric NOT USED >>>>', categoryName, category.metrics[metric].name, category.metrics[metric].label)
				}	
			

			})
		

		})

	return platformList;

}
