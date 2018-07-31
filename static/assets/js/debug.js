var FT = FT || {};

FT.debug = {

	dataSources : function() {

		$('.debug-listing').html("")
		var html = "";
		$.each ( FT.data.data_sources, function( dataSourceName, dataSource ) {
			
			html = "";
			html += "<div class='col bordered'>";
			html += "<h3>" + "<i class='fas fa-database'></i> " + dataSource.meta.name + "</h3>";
			html += "<ul class='metrics'>";

			$.each ( dataSource.meta.mappings, function( categoryName, mappedFields ) {
				html += "<li class='li-header'>" + '<i class="fas fa-sitemap"></i> ' + FT.data.platform[categoryName].meta.name + " Mappings"
				html += "<span class='label'>Source Field <i class='fas fa-long-arrow-alt-right'></i> category metric</span>" + " </li>";

				$.each ( mappedFields, function( metric, fields ) {

					$.each( fields.split(','), function(index, mappedField) {

						if ( typeof dataSource.fields[mappedField] !== 'undefined' || typeof dataSource.equations[mappedField] !== 'undefined' ) {
							
							var fieldLabel = "";

							if ( typeof dataSource.fields[mappedField] !== 'undefined' ) {
								fieldLabel = dataSource.fields[mappedField].label
							}

							if ( typeof dataSource.equations[mappedField] !== 'undefined' ) {
								fieldLabel = dataSource.equations[mappedField].label
							}
							
							var metricLabel = "";
							
							if ( typeof FT.data.platform[categoryName].metrics[metric] !== 'undefined' ) {
								metricLabel = FT.data.platform[categoryName].metrics[metric].label
							} else {
								//console.log('*** MISSING category MAPPING', dataSourceName + "." + mappedField, "is mapped to MISSING", categoryName + '.' + metric )
							}

							html += "<li>" + fieldLabel
							html += " <span class='label smaller no-margin-left'>" + "(" + mappedField + ")"  + '</span>'
							html += " <i class='fas fa-long-arrow-alt-right'></i> " 
							html += metricLabel 
							html += " <span class='label smaller no-margin-left'>" + "(" + metric + ")"  + '</span>'
					
						} else {

							//console.log('*** MISSING SOURCE MAPPING', categoryName + '.' + metric, "is mapped to MISSING", dataSourceName + "." + mappedField )

						
						}

					})

				})

			})

			html += "</ul>";
			
			$.each ( dataSource.meta.timeframes, function( timeframe ) {

				html += "<ul class='metrics'>";
				html += "<li class='li-header'>" + timeframe + " sample data" + "</li>";
				$.each ( dataSource.fields, function( fieldName, field ) {
				
					identifier_short = field.identifier_short || "n/a";
					html += "<li class='metric'>"
					html += field.label
					html += " <span class='label smaller no-margin-left'>" + "(" + fieldName + ")"  + '</span>'
					html += " <i class='far fa-chart-bar'></i> " + field.data.values[timeframe] + ' ' + identifier_short +  "</li>"
					
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
				html += "</ul>";

				

				/**
				 *
				 * ADD EQUATION VALUES TO DATA
				 * add the rolled up totals to the equations data.
				 * 
				*/

				if ( Object.keys(dataSource.equations).length > 0 ) {

					html += "<ul class='metrics'>";
					html += "<li class='li-header'>" + "<i class='fas fa-calculator'></i> " + timeframe + " equations" + "</li>";
					var fieldsUsed = [];

					$.each ( dataSource.equations, function( equationName, equation ) {

						if ( typeof equation.data == "undefined") {
							equation.data = {}
							equation.data.values = {}
							var calculation = {};
						}

						identifier = ( typeof equation.identifier == "undefined" ) ? 'n/a' : equation.identifier
						identifier_short = ( typeof equation.identifier_short == "undefined" ) ? 'n/a' : equation.identifier_short

						html += "<li class='metric'>" + equation.label + ' : (' + equationName + ')<br />'
						html += "<i class='fas fa-calculator'></i> " + equation.equation

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

						html +=  "<br />" + calculation.answer + " " + identifier_short 
						html += "</li>"

					})
					html += "</ul>";

				}

			})

			html += "</div>";

			$('.debug-listing').append(html)

		})

		


	},


	buckets : function() {

		$('.debug-listing').html("")
		
		$.each( FT.insights.data.platform_insights.buckets, function( bucketName, bucket ) {

			$('.debug-listing').append('<li class="header">' + FT.data.buckets[bucketName].meta.label + ' Platform Insights ' + "</li>")

			FT.insights.sort(bucket, 'weightedPercentDelta' )
		
			$.each( bucket, function( index, metricObj ) {

				metric = FT.data.platform['all'].metrics[metricObj.name]
			
				var phrase = [];

				var identifier = metric.identifier
				var identifier_short = metric.identifier_short
				var currentTotal = metric.data.values.current
				var comparedTotal = metric.data.values.compared
				var totalDelta = metric.data.values.delta
				var formatType = ( typeof metric.format === 'undefined' ) ? 'integer' : metric.format
				var totalPercentDelta = metric.data.values.percentDelta
				var weightedPercentDelta = metric.data.values.weightedPercentDelta
				var rolledUpPercentDelta =  metric.data.values.rolledUpPercentDelta
				var weight =  metric.weight
				var metricScore = metric.metricScore
				var label = metric.label;
				var trend = ( typeof metric.trend === 'undefined' ) ? 'higher' : 'lower'
				var tags = [];
				var verbStatus = "";
				var status = "";

				var parentBucket = FT.data.buckets[FT.utilities.getBucket(metric.name)].meta.shortLabel;

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


				/**
				 *
				 * Make the phrase
				 * 
				*/

				var moreOrFewer = "equal";
				var moreOrLess = "equal";
				var aOrAn = "a";
				var wereOrWas = "were";
				var postsOrpost = "posts";
			
				aOrAn = (FT.utilities.isVowel(status.charAt(0).toLowerCase())) ? 'an' : 'a';
				moreOrFewer = ( totalDelta > 0 ) ? 'fewer' : 'more';
				moreOrLess = ( totalDelta > 0 ) ? 'less' : 'more';
				wereOrWas = ( currentTotal == 1 ) ? 'was' : 'were';

				var leadin = "There was"

				phrase.push(FT.utilities.capitalize(leadin))
				
				switch ( status ) {

					case 'neutral' :

						phrase.push('no change')

					break

					default : 

						phrase.push(aOrAn)

						phrase.push('<span class="insight-bucket-performance insight-label insight-' + status + '">')
						phrase.push(Math.abs(weightedPercentDelta).toFixed(2) + '%')

						phrase.push('<em>' + Math.abs(totalPercentDelta).toFixed(2) + '%' + '</em>')
						phrase.push('<em>' + 'x' + weight + '</em>' )
						phrase.push('</span>')

						var actionVerb = ""
		
						switch ( verbStatus ) {

							case 'positive' : 
								actionVerb = 'increase'
							break

							case 'negative' :
								actionVerb = 'decrease'
							break

							case 'neutral' :
								actionVerb = 'change'
							break

						}

						phrase.push(actionVerb)
					
					break

				}


				

				var identifierLine = ""
				switch ( formatType ) {

					default :

						identifierLine = '<span class="insight-identifier insight-label">' + identifier + '</span>'
					
					break
					

					case "seconds" :
					case "time" :
					
					break

					
			
				}

				
				phrase.push('in')
				phrase.push('<span class="insight-name insight-label">' + label + '</span>')
				phrase.push('from')
				phrase.push('<span class="insight-metric insight-label">' + comparedTotal + '</span>')
				if ( identifierLine ) phrase.push(identifierLine)
				phrase.push()
				phrase.push('to')
				phrase.push('<span class="insight-metric insight-label">' + currentTotal + '</span>')
				if ( identifierLine ) phrase.push(identifierLine)

				phrase.push('<span class="insight-score insight-label">' + (metricScore*100).toFixed(2) + '</span>')
				
				tags.push('platform')
				tags.push(status)
				//tags.push(metric.name)
				tags.push(metric.dataSourcesUsed[0])

				phrase.push('<span class="insight-tags insight-label">' + tags.join(',').trim(',') + '</span>')
				phrase.push('<span class="insight-tags insight-label">' + metric.name + '</span>')
				phrase.push('<span class="insight-tags insight-label">' + '#' + parentBucket + '</span>')

				phrase.push('<span class="replaced-phrases">')
				$.each(metricObj.insightsPhrases, function( index, replacedPhrase ) {

					phrase.push('<span class="replaced-phrase">')
					phrase.push(replacedPhrase)
					phrase.push('</span>')

				})


				$('.debug-listing').append('<li>' + phrase.join(' ') + '</li>')

			})




		})


		

	},


	metrics : function() {

		$('.debug-listing').html("")
		
		FT.insights.sort(FT.insights.data.platform_insights.metrics, 'weightedPercentDelta' )
		$.each( FT.insights.data.platform_insights.metrics, function( index, metricObj ) {

		
			metric = FT.data.platform['all'].metrics[metricObj.name]
		
			var phrase = [];

			var identifier = metric.identifier
			var identifier_short = metric.identifier_short
			var currentTotal = metric.data.values.current
			var comparedTotal = metric.data.values.compared
			var totalDelta = metric.data.values.delta
			var formatType = ( typeof metric.format === 'undefined' ) ? 'integer' : metric.format
			var totalPercentDelta = metric.data.values.percentDelta
			var weightedPercentDelta = metric.data.values.weightedPercentDelta
			var rolledUpPercentDelta =  metric.data.values.rolledUpPercentDelta
			var weight =  metric.weight
			var metricScore = metric.metricScore
			var label = metric.label;
			var trend = ( typeof metric.trend === 'undefined' ) ? 'higher' : 'lower'
			var tags = [];
			var verbStatus = "";
			var status = "";
			var actionVerb = ""

			var parentBucket = FT.data.buckets[FT.utilities.getBucket(metric.name)].meta.shortLabel;

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


			/**
			 *
			 * Make the phrase
			 * 
			*/

			var moreOrFewer = "equal";
			var moreOrLess = "equal";
			var aOrAn = "a";
			var wereOrWas = "were";
			var postsOrpost = "posts";
		
			aOrAn = (FT.utilities.isVowel(status.charAt(0).toLowerCase())) ? 'an' : 'a';
			moreOrFewer = ( totalDelta > 0 ) ? 'fewer' : 'more';
			moreOrLess = ( totalDelta > 0 ) ? 'less' : 'more';
			wereOrWas = ( currentTotal == 1 ) ? 'was' : 'were';

			var leadin = "there was"
			phrase.push(FT.utilities.capitalize(leadin))
			
			switch ( status ) {

				case 'neutral' :

					phrase.push('no change')

				break

				default : 

					phrase.push(aOrAn)

					phrase.push('<span class="insight-bucket-performance insight-label insight-' + status + '">')
					phrase.push(Math.abs(weightedPercentDelta).toFixed(2) + '%')

					phrase.push('<em>' + Math.abs(totalPercentDelta).toFixed(2) + '%' + '</em>')
					phrase.push('<em>' + 'x' + weight + '</em>' )
					phrase.push('</span>')

					var actionVerb = ""
		
					switch ( verbStatus ) {

						case 'positive' : 
							actionVerb = 'increase'
						break

						case 'negative' :
							actionVerb = 'decrease'
						break

						case 'neutral' :
							actionVerb = 'change'
						break

					}

					phrase.push(actionVerb)

				break

			}


			

			var identifierLine = ""
			switch ( formatType ) {

				default :

					identifierLine = '<span class="insight-identifier insight-label">' + identifier + '</span>'
				
				break
				

				case "seconds" :
				case "time" :
				
				break

				
		
			}

			
			phrase.push('in')
			phrase.push('<span class="insight-name insight-label">' + label + '</span>')
			phrase.push('from')
			phrase.push('<span class="insight-metric insight-label">' + comparedTotal + '</span>')
			if ( identifierLine ) phrase.push(identifierLine)
			phrase.push()
			phrase.push('to')
			phrase.push('<span class="insight-metric insight-label">' + currentTotal + '</span>')
			if ( identifierLine ) phrase.push(identifierLine)

			phrase.push('<span class="insight-score insight-label">' + (metricScore*100).toFixed(2) + '</span>')
			
			tags.push('platform')
			tags.push(status)
			//tags.push(metric.name)
			tags.push(metric.dataSourcesUsed[0])

			phrase.push('<span class="insight-tags insight-label">' + tags.join(',').trim(',') + '</span>')
			phrase.push('<span class="insight-tags insight-label">' + metric.name + '</span>')
			phrase.push('<span class="insight-tags insight-label">' + '#' + parentBucket + '</span>')
			
			phrase.push('<span class="replaced-phrases">')
			$.each(metricObj.insightsPhrases, function( index, replacedPhrase ) {

				phrase.push('<span class="replaced-phrase">')
				phrase.push(replacedPhrase)
				phrase.push('</span>')

			})


			$('.debug-listing').append('<li>' + phrase.join(' ') + '</li>')


		})


		

	}

}

