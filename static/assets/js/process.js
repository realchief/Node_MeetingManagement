var FT = FT || {};

FT.process = {
	
	reset : function() {

		$('#metrics-sources').html('')
		$('#metrics-platform').html('')
		$('#metrics-buckets').html('')
		$('.platform-listing').html('')
		$('.buckets-listing').html('')
		$('.datasources-listing').html('')
		$('.metrics-editor').html('')
	
		//$('#metrics-sources').html( 'Data Sources\n\n' + JSON.stringify(FT.data.data_sources, null, 2) )
		//$('#metrics-platform').html( 'platform\n\n' + JSON.stringify(FT.data.platform, null, 2) )
		//$('#metrics-buckets').html( 'buckets\n\n' + JSON.stringify(FT.data.buckets, null, 2) )

	},

	platform: function() {

		
		/**
		 *
		 * platform
		 *
 		*/

		var totalsHtml = "";
		var totals = "";
		$.each ( FT.data.platform, function( categoryName, category ) {
			
			/**
			 * over each metric in the order array
		 	*/

			$.each ( category.meta.order, function( count, metric ) {
				
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
 		

				$.each ( FT.data.data_sources, function( dataSource ) {

					var dataSource = dataSource;
					var dataSourceName = FT.data.data_sources[dataSource].meta.name

					
					if ( FT.utilities.getMapping( dataSource, categoryName, metric ) ) {

						if ( !activatedcategoryMapping ) {
							activatedcategoryMapping = true;
						}
						
						var mappedField = FT.utilities.getMapping( dataSource, categoryName, metric ).mappedField
				
						/**
						 * allow for multiple fields mapped to a single metric
						*/

						$.each( mappedField.split(','), function(index, field) {

							var delta = FT.utilities.getDelta( dataSource, field, metric )

							if ( delta ) {

								currentTotal += delta.current;
								comparedTotal += delta.compared;
								rolledUpPercentDelta += delta.percentDeltaRaw;

								var fieldForUsed = 'Field Label';
								if ( typeof FT.data.data_sources[dataSource].fields[field] !== "undefined") {
									fieldForUsed = FT.data.data_sources[dataSource].fields[field].label
								} else {
									fieldForUsed = FT.data.data_sources[dataSource].equations[field].label
								}
								
								fieldsUsed.push(dataSourceName + ' ' + fieldForUsed)
								dataSourcesUsed.push(dataSource)

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

						identifier = ( typeof FT.data.platform[categoryName].metrics[metric].identifier == "undefined" ) ? identifier : FT.data.platform[categoryName].metrics[metric].identifier
						identifier_short = ( typeof FT.data.platform[categoryName].metrics[metric].identifier_short == "undefined" ) ? identifier_short : FT.data.platform[categoryName].metrics[metric].identifier_short

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

						var weightedPercentDelta =  totalPercentDelta * FT.data.platform[categoryName].metrics[metric].weight


						// ADD METRIC SCORES FOR TRAINING

						var trainingScores = []
						trainingScores.push(currentTotal)
						trainingScores.push(comparedTotal)

						if ( FT.data.platform[categoryName].metrics[metric].format !== "percent") {
							var metricScore = FT.utilities.getScore( trainingScores, currentTotal, metric )
						} else {

							var metricScore = 0;

							if ( FT.data.platform[categoryName].metrics[metric].trend !== 'lower' ) {

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

						//console.log("Weight>>>", metric, FT.data.platform[categoryName].metrics[metric].weight, "Percent Delta:", totalPercentDelta, "Weighted Percent Delta:", weightedPercentDelta )

						FT.data.platform[categoryName].metrics[metric].data = {}
						FT.data.platform[categoryName].metrics[metric].data.values = {}
						FT.data.platform[categoryName].metrics[metric].identifier = identifier
						FT.data.platform[categoryName].metrics[metric].identifier_short = identifier_short
						FT.data.platform[categoryName].metrics[metric].data.values.current = currentTotal
						FT.data.platform[categoryName].metrics[metric].data.values.compared = comparedTotal
						FT.data.platform[categoryName].metrics[metric].data.values.delta = totalDelta
						FT.data.platform[categoryName].metrics[metric].data.values.percentDelta = totalPercentDelta
						FT.data.platform[categoryName].metrics[metric].data.values.weightedPercentDelta = weightedPercentDelta
						FT.data.platform[categoryName].metrics[metric].data.values.rolledUpPercentDelta = rolledUpPercentDelta
						FT.data.platform[categoryName].metrics[metric].metricsUsed = fieldsUsed;
						FT.data.platform[categoryName].metrics[metric].dataSourcesUsed = dataSourcesUsed;
						FT.data.platform[categoryName].metrics[metric].metricScore = metricScore;

					} else {

					}

				

				})

				if ( !activatedcategoryMapping ) {
					//console.log('category metric NOT USED >>>>', categoryName, category.metrics[metric].name, category.metrics[metric].label)
				}	
			

			})
		

		})


	},


	dataSources: function() {

		/**
		 *
		 * I DONT THINK THIS IS NEEDED ANYMORE
		 * AS WE'RE NOT USING EQUATIONS RIGHT NOW
		 *
 		*/


		$.each ( FT.data.data_sources, function( dataSourceName, dataSource ) {
			

			$.each ( dataSource.meta.mappings, function( categoryName, mappedFields ) {

				$.each ( mappedFields, function( metric, fields ) {

					$.each( fields.split(','), function(index, mappedField) {

						if ( typeof dataSource.fields[mappedField] !== 'undefined' || typeof dataSource.equations[mappedField] !== 'undefined' ) {
							
							if ( typeof FT.data.platform[categoryName].metrics[metric] !== 'undefined' ) {
							} else {
								//console.log('*** MISSING category MAPPING', dataSourceName + "." + mappedField, "is mapped to MISSING", categoryName + '.' + metric )
							}

						} else {
							//console.log('*** MISSING SOURCE MAPPING', categoryName + '.' + metric, "is mapped to MISSING", dataSourceName + "." + mappedField )
						}

					})

				})

			})

			
			$.each ( dataSource.meta.timeframes, function( timeframe ) {

				$.each ( dataSource.fields, function( fieldName, field ) {
					
					/**
					 *
					 * ADD DELTAS TO DATA
					 * 
					*/

					totalDelta = field.data.values['current'] - field.data.values['compared'];
					
					if ( totalDelta !== 0 ) {
						totalPercentDelta = (totalDelta / field.data.values['compared']) * 100;
					} else {
						totalPercentDelta = 0;
					}

					field.data.values.delta = totalDelta
					field.data.values.percentDelta = totalPercentDelta


				})
				

				/**
				 *
				 * ADD EQUATION VALUES TO DATA
				 * add the rolled up totals to the equations data.
				 * 
				*/

				if ( Object.keys(dataSource.equations).length > 0 ) {

					var fieldsUsed = [];

					$.each ( dataSource.equations, function( equationName, equation ) {

						if ( typeof equation.data == "undefined") {
							equation.data = {}
							equation.data.values = {}
							var calculation = {};
						}

						identifier = ( typeof equation.identifier == "undefined" ) ? 'n/a' : equation.identifier
						identifier_short = ( typeof equation.identifier_short == "undefined" ) ? 'n/a' : equation.identifier_short

						var calculation = FT.utilities.compute( dataSourceName, FT.data.data_sources[dataSourceName].fields, timeframe, equation )

						equation.data.values[timeframe] = calculation.answer

						totalDelta = equation.data.values['current'] - equation.data.values['compared'];
						
						if ( totalDelta !== 0 ) {
							totalPercentDelta = (totalDelta / equation.data.values['compared']) * 100;
						} else {
							totalPercentDelta = 0;
						}

						equation.data.values.delta = totalDelta
						equation.data.values.percentDelta = totalPercentDelta
						equation.metricsUsed = calculation.metricsUsed;
						equation.equationWithLabels = calculation.equationWithLabels;	

					})

				}

			})


		})

	
	},

	metricsEditor : function() {

		/**
		 *
		 * Metrics Editor
		 *
 		*/

 		var metricsHtml = "";
 		$.each ( FT.data.data_sources, function( dataSourceName, dataSource ) {

 			metricsHtml += "<div class='col bordered'>";
			metricsHtml += "<h3>" + "<i class='fas fa-database'></i> " + dataSource.meta.name + "</h3>";
	
 				metricsHtml += "<table class='metrics' border='0' cellspacing='0' cellpadding='0'>";
				
 				metricsHtml += "<tr class='metric'>"	
 				metricsHtml += "<th class='label'>" + "field" + "</th>"
 				metricsHtml += "<th>" + "current" + "</th>"
 				metricsHtml += "<th>" + "previous" + "</th>"
 				metricsHtml += "<th>" + "mappings" + "</th>"
 				metricsHtml += "<th>" + "&nbsp" + "</th>"
 				metricsHtml += "</tr>"

				$.each ( dataSource.fields, function( fieldName, field ) {
					identifier_short = field.identifier_short || "n/a";
					
					metricsHtml += "<tr class='metric'>"	
					metricsHtml += "<td class='label'>"				
					metricsHtml += "<label>" + field.label  + "<span class='smaller'>(" + fieldName + ")</span>" + "</label>";
					metricsHtml += "</td>"	

					$.each ( dataSource.meta.timeframes, function( timeframe ) {

						metricsHtml += "<td>"	
						inputName = dataSourceName + "_" + fieldName + "_" + timeframe;
						
						//console.log( 'input field: ', inputName, field.data.values[timeframe])

						metricsHtml += "<input class='metric-edit' " 
						metricsHtml += ' name="' + inputName + '"'
						metricsHtml += ' value="' + field.data.values[timeframe] + '"'
						metricsHtml += ' data-source="' + dataSourceName + '"'
						metricsHtml += ' data-timeframe="' + timeframe + '"'
						metricsHtml += ' data-field="' + fieldName + '"'
						metricsHtml += '/>'
						metricsHtml += "</td>"	
					})

					mapping = "";

					$.each ( dataSource.meta.mappings, function( categoryName, mappedFields ) {

						$.each ( mappedFields, function( metric, fields ) {

							$.each( fields.split(','), function(index, mappedField) {

								if ( mappedField == fieldName ) {
									//mapping += metric + ', ';
									mapping += metric + '<br />';
								}

							})
						})

					})

					//metricsHtml += "<div class='mapping'>" + mapping.replace(/, \s*$/, ""); + "</div>";
					metricsHtml += "<td>"	
					metricsHtml += "<div class='mapping'>" + mapping.replace(/<br \/>\s*$/, ""); + "</div>";
					metricsHtml += "</td>"	
					metricsHtml += "<td>"	
					metricsHtml += "<div class='quick-button'><i class='far fa-edit'></i></div>";
					metricsHtml += "</td>"	
					metricsHtml += "</tr>"
				})

	
				metricsHtml += "</table>";



 			metricsHtml += "</div>";

 		})

 			metricsHtml += "<div class='row center-me'><div class='button'>Update Metrics</div></div>";

 		
 		$('.metrics-editor').append(metricsHtml)



	},

	setFieldValue : function(dataSource, fieldName, timeframe, value, valueType) {

		valueType = valueType || "integer"

		valueType = valueType.toLowerCase()

		if ( typeof FT.data.data_sources[dataSource].fields[fieldName] == 'undefined') {
			var message = 	dataSource + ' ' + fieldName + ' ' + 'for ' + timeframe + ' ' + 'Not Set';
			//console.log(message)
			return message
		} 

		switch ( valueType ) {

			case "percent" :
				var value = parseFloat(value)
			break

			case "time" :
				var value = Math.round(value)
			break

			case "currency" :
				var value = parseFloat(value)
			break

			default : 
				var value = parseInt(value);
			break

		}

		FT.data.data_sources[dataSource].fields[fieldName].data.values[timeframe] = value

		var message = 	dataSource + ' ' + fieldName + ' ' + 'for ' + timeframe + ' ' + 'Set To ' + value + ' of type: ' + typeof(value);
		//console.log(message)

		return { 
			dataSource : dataSource,
			fieldName : fieldName,
			timeframe : timeframe, 
			value : value
		}

	}
}
