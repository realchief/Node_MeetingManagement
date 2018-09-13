var FT = FT || {};

FT.debug = {

	allPhrases : function() {

		var insightsHTMLTarget = $('.insights-content')
		insightsHTMLTarget.html('')
		
		var sentences = [];

		$.each(FT.insights.data.bucket_insights.buckets, function( index, bucket ) {
			sentences.push(bucket.scorePhrase)
		})

		insightsHTMLTarget.append('<h3>' + sentences.join(" ") + '</h3>');

		var phraseList = FT.insights.data.all_phrases;
		var bigPictureSentences = phraseList.join('</li><li>');
		$(insightsHTMLTarget).append('<ul class="lines"><li>' + bigPictureSentences + '</li></ul>')

	},

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


		

	},


	facebookOutput : function(current, compared, insightGroup) {

		//console.log('IG>>>', insightGroup)

		var rows = [];
		var table = [];

    	switch ( insightGroup ) {

			case "pageInfo" :

				
				var response = current[insightGroup].response
				//console.log(response)
		     	var values = [response.name + ' Fan Count', "fan_count", response.engagement.count, "&nbsp;", "&nbsp;",  "&nbsp;", current[insightGroup].aggregationPeriod];
		     	table.push('<tr><td>', values.join('</td><td>'), '</td>');
         		table.push('</tr>');
         		rows.push(table.join(''));

		    break

		 }

    	$.each( current[insightGroup].response.data, function(index, metric) {
    		
    		table = [];

        	/**
			 * compared and current values
	 		*/
        	
        	var comparedMetric = compared[insightGroup].response.data[index]
        	var attributedDateIndex = (metric.values.length > 1) ? metric.values.length-2 : metric.values.length-1
	        var value = metric.values[metric.values.length-1].value 
	        var date = (metric.values.length > 1) ? moment(metric.values[attributedDateIndex].end_time).format('MM/DD/YYYY') : moment(metric.values[attributedDateIndex].end_time).subtract(1, 'day').format('MM/DD/YYYY')
        	
	     	var comparedAttributedDateIndex = (comparedMetric.values.length > 1) ? comparedMetric.values.length-2 : comparedMetric.values.length-1
        	var comparedValue = comparedMetric.values[comparedMetric.values.length-1].value 
        	var comparedDate = (comparedMetric.values.length > 1) ? moment(comparedMetric.values[comparedAttributedDateIndex].end_time).format('MM/DD/YYYY') : moment(comparedMetric.values[comparedAttributedDateIndex].end_time).subtract(1, 'day').format('MM/DD/YYYY')

        	var values = [];
        	var aggregationPeriod = current[insightGroup].aggregationPeriod


        	switch ( insightGroup ) {

        		default: 

        			/**
					 *
					 * if there are multiple actions for an insight, the data comes in an object
					 *
			 		*/

		        	if ( typeof value == 'object') {

		        		values = [metric.title, metric.name, "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp"];
			        	table.push('<tr><td>', values.join('</td><td>'), '</td>');
		        		table.push('</tr>');

		        		 // sum of individual action ONLY IF we are aggregating by day

						if ( aggregationPeriod == 'day' ) {

							var typeSum = {}
							var comparedTypeSum = {}

							$.each ( metric.values, function( index, day ) {

								var comparedDay = 0;
								if ( typeof comparedMetric.values[index] !== 'undefined' ) {
									comparedDay = comparedMetric.values[index].value
								}
			         	
			         			//console.log('+++', 'end_time:', day.end_time, metric.name)

			         			var numActions = 0;
			         			var comparedNumActions = 0;

			         			 $.each( day.value, function(type, numActions) {
			         			 	
			         			 	if ( typeof (typeSum[type]) == 'undefined' ) {
			         			 		typeSum[type] = 0;
			         			 		comparedTypeSum[type] = 0;
			         			 	}

			         			 	typeSum[type] += numActions
			        		 	 	
			         			 	//console.log(type, typeSum[type], comparedDay[type], typeof  comparedDay[type])

			         			 	if ( typeof comparedDay[type] !== 'undefined' && typeof comparedDay[type] !== 'function' ) {
			        		 			comparedTypeSum[type] += comparedDay[type]
			        		 		}
				        
				        		 })

			         		})

			         		//console.log("+++++ sum of types", typeSum)

						} else {
							var typeSum = 0
							var comparedTypeSum = 0
						}

						/**
						 *
						 * if there are multiple actions for the insight, display each of those metrics, along with the sum
						 *
				 		*/

		        		$.each( value, function(name, typeValue) {

		        			/**
							 *
							 * REAL DATA RIGHT HERE
							 *
					 		*/

		        		 	var comparedTypeValue = comparedValue[name] 

		        		 	values = [];
		    		 	 	values = ["&nbsp;", name, typeSum[name] + " (" + typeValue + ") ", date, comparedTypeSum[name] + " (" + comparedTypeValue + ") ", comparedDate, aggregationPeriod];
		    			 	table.push('<tr><td>', values.join('</td><td>'), '</td>');
		    			 	table.push('</tr>');

		    
		    	   	 	})

		    	   	 	/**
						 *
						 * sum together all of the actions to get the total for the main insight
						 *
				 		*/

		        		if ( aggregationPeriod == 'day' ) {

			        		 var sum = 0;
			        		 var comparedSum = 0;
			        		 $.each( metric.values, function(index, day) {

			        		 	var comparedDay = "";
								if ( typeof comparedMetric.values[index] != 'undefined' ) {
									comparedDay = comparedMetric.values[index].value
								} 

			        		 	$.each( day.value, function(type, numActions) {
			        		 	 
			        		 	 	sum += numActions
			        		 
			        		 	 	if ( typeof comparedDay[type] !== 'undefined' && typeof comparedDay[type] !== 'function' ) {
			        		 			comparedSum += comparedDay[type]
			        		 		}

			        		 	})

			        		 })

		        			values = ['&nbsp;', '&nbsp;', sum, 'total', comparedSum, 'total', 'period']
        					table.push('<tr class="summary"><td>', values.join('</td><td>'), '</td>');
		        			table.push('</tr>');

		        		}

			      	} else {

			      		/**
						 *
						 * single value for the insight
						 *
				 		*/

				 		var sum = 0;
				 		var comparedSum = 0;

				 		switch ( metric.name ) {
				 			
				 			case "page_video_view_time":

				 				value = parseInt(value / 1000) + ' sec.'
				 				comparedValue = parseInt(comparedValue / 1000) + ' sec.'
				 
				 			break

				 		}

				 	 	values = [metric.title, metric.name, value, date, comparedValue, comparedDate, aggregationPeriod];
						table.push('<tr><td>', values.join('</td><td>'), '</td>');
		        		table.push('</tr>');

		        		if ( aggregationPeriod == 'day' ) {

		        			sum = 0;
		        			comparedSum = 0;

		        		} else {

		        			sum = value;
		        			comparedSum = comparedValue;

		        		}

		        		// GET THE TOTAL OVER THE PERIOD IF the period == "day"
		        		if ( aggregationPeriod == 'day' ) {
			        	
			        		 $.each( metric.values, function(index, day) {
			        		 
			        		 	var comparedDay = 0;
								if ( typeof comparedMetric.values[index] != 'undefined' ) {
									comparedDay = comparedMetric.values[index]
								} 

			        		 	sum += day.value

			        		 	if ( typeof comparedDay.value != 'undefined' ) {
			        		 		comparedSum += comparedDay.value
			        		 	}
			        		 	

			        		 })

			        		 switch ( metric.name ) {
				 			
				 				case "page_video_view_time":

				 					sum = parseInt(sum / 1000 ) + ' sec.'
				 					comparedSum = parseInt(comparedSum / 1000 ) + ' sec.'

				 				break
				 	
				 			}
		        		 	
				 			/**
							 *
							 * REAL DATA RIGHT HERE
							 *
					 		*/

					 	 	values = ['&nbsp;', '&nbsp;', sum, 'total', comparedSum, 'total', 'period']
    						table.push('<tr class="summary"><td>', values.join('</td><td>'), '</td>');
	        				table.push('</tr>');

		        		 }


		        	}

		        break

		    }

      	    rows.push(table.join(''));

       	 })

	    var output = [];
	
		//output.push("<h4>" + current.pageInfo.account_name + "</h4>")
		var table = ['<table>'];
		var headers = ['Descriptor', 'Metric Title', 'Value', 'Through', "Compared Value", "Through", 'Period']
		table.push('<tr><th>', headers.join('</th><th>'), '</th>');
		table.push('</tr>');


		output.push(table.join(''));
		output.push(rows.join(''));
	    $('.debug-listing').append(output.join(''));

	},


	facebookAssetsOutput : function( current, compared ) {

		var insightTotals = {};
		var output = [];
		output.push("<h4>" + 'Posts' + "</h4>")
		var table = ['<table>'];
		var rows = [];
		var headers = ['Date', 'Link', 'Message', 'Type']
		headers.push('Total Reach', 'Engaged Users', 'Likes', 'Comments', 'Shares', "Clicks", "Link Clicks", "Eng. Rate", "Engagements", "Video Metrics")
		table.push('<tr><th>', headers.join('</th><th>'), '</th>');
		table.push('</tr>');

		$.each ( [ current, compared ], function( index, timeframe ) {

			var totalPosts = timeframe.postListing.data.length;
			var postInsights = timeframe.postInsights
			if ( index == 0 ) { var timeframeWindow = 'current' } else { var timeframeWindow = 'compared' }
			insightTotals[timeframeWindow] = {};

			rows.push('<tr><td colspan="', headers.length, '">', timeframe.window,  ' <strong>Total Posts: ', totalPosts, '</strong>', '</td></tr>');
		
			$.each ( timeframe.postListing.data, function( index, post ) {

				var insights = JSON.parse(postInsights[index].body).data;
				var insightMetrics = {}
				
				// initialize these so we don't get undefineds //

				$.each( [ 'post_impressions_unique', 'post_engaged_users', 'like', 'comment', 'share', 'post_clicks', 'link clicks', 'engagements', 'post_activity'], function( index, name) {
					insightMetrics[name] = 0;
				})

				//console.log( "INSIGHTS FOR>>> ", post.id, insights)
				//console.log("POST DETAILS >>> ", post)

				$.each( insights, function( index, metric ) {

					//console.log(metric)

					if ( typeof metric.values[0].value == 'object' ) {

						$.each( metric.values[0].value, function( name, typeValue ) {
							
							if ( typeof insightTotals[timeframeWindow][name] == 'undefined' ) {
								insightTotals[timeframeWindow][name] = 0;
							}
							if ( typeof typeValue == "undefined" ) {
								typeValue = 0
							} else {
								typeValue = typeValue
							}

							insightMetrics[name] = typeValue
							insightTotals[timeframeWindow][name] += typeValue
						})

					} else {

						if ( typeof insightTotals[timeframeWindow][metric.name] == 'undefined' ) {
							insightTotals[timeframeWindow][metric.name] = 0;
						} else {

						}

						
						if ( typeof metric.values[0].value === "undefined" ) {
							value = 0
						} else {
							value = metric.values[0].value
						}

						insightMetrics[metric.name] = value
						insightTotals[timeframeWindow][metric.name] += value
					}
				
				})


				var postDate = moment(post.created_time).format("ddd MMM. DD, YYYY<br />hh:mm a")
				var message = ( post.message ) ? post.message : post.link
				
				var engagementRate =  ( insightMetrics['post_engaged_users'] / insightMetrics['post_impressions_unique'] )
				engagementRateRaw =  ( engagementRate * 100 )
				engagementRate =  ( engagementRate * 100 ).toFixed(2);

				var videoMetrics = "";
				if ( post.type == 'video') {
					videoMetrics = [ 'Mins. Viewed: ', parseInt(insightMetrics['post_video_view_time']/1000/60), '<br />', 'Views: ', insightMetrics['post_video_views'] ]
				} else {
					videoMetrics = [ "&nbsp;" ]
				}

				var link = '<a href="' + post.permalink_url + '" class="post-link" target="_blank">link</a>';


				insightMetrics['engagements'] = parseInt(insightMetrics['post_activity']) + parseInt(insightMetrics['post_clicks'])

				values = [ postDate, link, message, post.type, insightMetrics['post_impressions_unique'], insightMetrics['post_engaged_users'], insightMetrics['like'], insightMetrics['comment'], insightMetrics['share'], insightMetrics['post_clicks'], insightMetrics['link clicks'], engagementRate + "%", insightMetrics['engagements'], videoMetrics.join('') ]
		        rows.push('<tr><td>', values.join('</td><td>'), '</td>');
				rows.push('</tr>');

			})

		})

		
		output.push(table.join(''));
		output.push(rows.join(''));
	    $('.debug-listing').append(output.join(''));

  
	},

	googleOutput : function(report, index, reportName, insightGroup) {

	 	 var output = [];
	 	 var dimensionsCount = 0;
	 	 var aggregatedByDate = false;
	 	 var valueTypes = [];
	 	 var fieldNames = [];
	 	 var dimensionNames = [];
	 	 var multiDimension = false;
	 	 var reportName = reportName || "";
	 	 var table = ['<table>'];

	 	 table.push('<h4>', reportName, ' ', index, ' ', insightGroup, '</h4>');

	 	if (report.data.rows && report.data.rows.length) {
        
	    	var justTotals = false;
	    	

        	// Put headers in table.

        	table.push('<tr>');

        	if ( typeof report.columnHeader.dimensions != 'undefined') {
		 		

        		$.each( report.columnHeader.dimensions, function(index, dimension) {

        			table.push('<th>', FT.connector.google.gaColumns[dimension].uiName, '</th>')
        			dimensionNames.push(dimension.split('ga:')[1]);

        		})

		 		//table.push('<th>', report.columnHeader.dimensions.join('</th><th>'), '</th>');
		 		dimensionsCount = report.columnHeader.dimensions.length
        		aggregatedByDate = report.columnHeader.dimensions.indexOf('ga:date') >= 0;


        	
        	} else {

        		justTotals = true;

        	} 

        	table.push('<th>Date range</th>');

        	if ( typeof report.columnHeader.metricHeader.metricHeaderEntries != 'undefined') {

	        	$.each( report.columnHeader.metricHeader.metricHeaderEntries, function( index, header ) {
	        		 valueTypes.push(header.type)
	        		 fieldNames.push(header.name.split("ga:")[1])

	        		 if ( typeof FT.connector.google.gaColumns[header.name] !== 'undefined') {
	        		 	table.push('<th>', FT.connector.google.gaColumns[header.name].uiName, '</th>');	        		
        			} else {
        				table.push('<th>', FT.data.data_sources.google_analytics.metric_assets.goals[index].name, '</th>');	        
        			}

	        	} )

	        }

        	table.push('</tr>');

        	if ( report.columnHeader.dimensions ) {
		 	 	var dimensionHeader = report.columnHeader.dimensions[0].split('ga:')[1] + "_" + fieldNames.join("_");

		 	 	if ( report.columnHeader.dimensions.length > 1 ) {
					multiDimension = true;
				}

		 	 } else {
		 	 	var dimensionHeader = 'totals'
		 	 }

		 	
		 	 if ( insightGroup == 'matchups' || multiDimension == true) {
		 	 	var dimensionHeader = report.columnHeader.dimensions[0].split('ga:')[1] + '_' + report.columnHeader.dimensions[1].split('ga:')[1] + "_" + fieldNames.join("_");
		 	 }

		 	 //console.log(insightGroup, 'Google Analytics Report:', index, report, dimensionHeader)
			 var currentReport = dimensionHeader;

			 if ( reportName ) {
			 	currentReport = reportName
			 }

        	/**
			 *
			 * Totals
			 *
	 		*/

	 		if ( typeof report.data.totals != 'undefined' ) {
		 		
		 		$.each( report.data.totals, function( index, dateRange ) {
		 			
		 			var label = "";
		 			var dateIndex = index;
		 			var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';

		 			if ( timeframe == 'current') {
        				comparedRange = report.data.totals[1].values
        			} else {
        				comparedRange = report.data.totals[0].values
        			}

        			table.push('<tr class="n-summary">')

		 			for ( i = 0; i <= dimensionsCount-1; i++) {
		 				
		 				if ( i == 0 ) {
		 					if ( index == 0 ) {
		 						label = "Totals:";
		 					}
		 				} else {
		 					label = "&nbsp;"
		 				}

		 				table.push('<td>', label, '</td>');	        		
		        	}

	 				if ( typeof dateRange.values != 'undefined') {

    	            	table.push('<td>', FT.defaults.dateWindowReadable[index], '</td>')

    	            	$.each ( dateRange.values, function( index, value ) {

    	            		var valueToShow = "";
    	            		var totalDelta = "";
			           		var totalPercentDelta = "";
			           		var percentOfTotal = "";
			           		var percentOfTotalRaw = "";
	    	            	var comparedValue = comparedRange[index];

	    	            	//console.log('VT:', valueTypes[index].toLowerCase() )
    	            		switch ( valueTypes[index].toLowerCase() ) {

    	            			case "percent" :
    	            				var value = parseFloat(value).toFixed(2)
    	            				
    	            				totalDelta = value - comparedValue

	    	            	   		if ( totalDelta != 0 ) {
										totalPercentDelta = (totalDelta / comparedValue) * 100;
										totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
										totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
									} else {
										totalPercentDelta = 0;
									};

									valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
    	            			

    	            			break

    	            			case "time" :
    	            				var value = Math.round(value)

    	            				totalDelta = Math.round(value) - Math.round(comparedValue)

	    	            	   		if ( totalDelta != 0 ) {
										totalPercentDelta = (totalDelta / comparedValue) * 100;
										totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
										totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
									} else {
										totalPercentDelta = 0;
									};

							
    	            				valueToShow = FT.utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
    	            			break

    	            			case "currency" :
    	            				var value = value
    	            				
    	            				totalDelta = value - comparedValue

	    	            	   		if ( totalDelta != 0 ) {
										totalPercentDelta = (totalDelta / comparedValue) * 100;
										totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
										totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
									} else {
										totalPercentDelta = 0;
									};

									valueToShow = "$" + value +  "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
    	            			

    	            			break

    	            			default : 
    	            				var value = value

    	            				totalDelta = value - comparedValue

	    	            	   		if ( totalDelta != 0 ) {
										totalPercentDelta = (totalDelta / comparedValue) * 100;
										totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
										totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
									} else {
										totalPercentDelta = 0;
									};

										valueToShow = value + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>";

    	            					//valueToShow = value;
    	            			break

    	            		}

    	            		table.push('<td>', valueToShow, '</td>')


    	            	})

    	           }

   		      		table.push('</tr>')


	        	})
		 	}


		 	/**
			 *
			 * Metrics
			 *
	 		*/

	 	 	var storedCompared = []
		 	var storedComparedIndex = 0;

        	$.each( report.data.rows, function( index, row ) {

        		if ( justTotals ) return;

        		var label = "";

        		if ( aggregatedByDate) {

        			
        			// PULLED ALL THE AGGREGATED BY DATE STUFF FOR NOW. 

	       
        		} else {

        			/**
					 *
					 * No date aggregation
					 *
			 		*/

			 		if ( currentReport == 'channelGrouping_sessions_bounceRate') {
			 			//console.log('data row', currentReport, row)
			 		}

        			$.each( row.metrics, function( index, dateRange ) {

        				var dateIndex = index;
        				var timeframe = ( dateIndex == 0 ) ? 'current' : 'compared';
        				var dataRow = {};

       					
						if ( timeframe == 'current') {
        					comparedRange = row.metrics[1]
        				} else {
        					comparedRange = row.metrics[0]
        				}

        			
	        			table.push('<tr>')
	        			if ( typeof row.dimensions != 'undefined') {

	        				//console.log( 'How many dimensions?', row.dimensions.length )
	        			
	        				
	        				// if the first of two timeframes
	        				if ( index == 0 ) {
	        					// Put dimension values
	           					table.push('<td>', row.dimensions.join('</td><td>'), '</td>');

	           		  		
			          		} else {
			          		
			          			for ( i = 0; i <= dimensionsCount-1; i++) {
			          				label = "&nbsp;"
			          				table.push('<td>', label, '</td>');	  
			          			}
			          		
			          		}

			           	}

			           	if ( typeof dateRange.values != 'undefined') {

			           		var metric = "";
			           		var dateIndex = index;
			           		metric = FT.defaults.dateWindowReadable[index];

			           
			            	// Put metric values for the current date range
			           		table.push('<td>', metric, '</td>')

			           		$.each ( dateRange.values, function( index, value ) {

	    	            	   	var valueToShow = "";
	    	            	   	var totalDelta = "";
			           			var totalPercentDelta = "";
	    	            	   	var percentOfTotal = "";
	    	            	   	var percentOfTotalRaw = "";
	    	            	   	var comparedValue = comparedRange.values[index];

	    	            	   	switch ( valueTypes[index].toLowerCase() ) {

	    	            			case "percent" :
    	            					var value = parseFloat(value).toFixed(2)
    	            					
    	            					totalDelta = value - comparedValue

		    	            	   		if ( totalDelta != 0 ) {
											totalPercentDelta = (totalDelta / comparedValue) * 100;
											totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
											totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
										} else {
											totalPercentDelta = 0;
										};

										totalDelta = "";
										valueToShow = parseFloat(value).toFixed(2) + "%" + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"

	    	            			break

	    	            			case "time" :
	    	            				var value = Math.round(value)

	    	            				totalDelta = Math.round(value) - Math.round(comparedValue)

		    	            	   		if ( totalDelta != 0 ) {
											totalPercentDelta = (totalDelta / comparedValue) * 100;
											totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
											totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
										} else {
											totalPercentDelta = 0;
										};

							
	    	            				valueToShow = FT.utilities.secondsToHMS(value) + "<span class='percent'>" + "(" + totalPercentDelta + ") (" + totalDelta + ")</span>"
	    	            			break

	    	            			case "currency" :
	    	            				var value = value
	    	            				
	    	            				totalDelta = value - comparedValue

		    	            	   		if ( totalDelta != 0 ) {
											totalPercentDelta = (totalDelta / comparedValue) * 100;
											totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
											totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
										} else {
											totalPercentDelta = 0;
										};

										valueToShow = "$" + value + "<span class='percent'>" + "(" + totalPercentDelta + ")" + "</span>"
	    	            			

	    	            			break

	    	            			default : 
	    	            				var percentOfTotal = value / report.data.totals[dateIndex].values[index]
		    	            	   		percentOfTotal = parseFloat(percentOfTotal).toFixed(4);
		    	            	   		percentOfTotalRaw = parseFloat(percentOfTotal * 100).toFixed(2);
		    	            	   		percentOfTotal = parseFloat(percentOfTotal * 100).toFixed(2) + '%';

		    	            	   		var value =  value;
		    	            	   		
		    	            	   		totalDelta = value - comparedValue

		    	            	   		if ( totalDelta != 0 ) {
											totalPercentDelta = (totalDelta / comparedValue) * 100;
											totalPercentDeltaRaw = totalPercentDelta.toFixed(2)
											totalPercentDelta = totalPercentDelta.toFixed(2)  + '%';
										} else {
											totalPercentDelta = 0;
										};

										valueToShow = value + "<span class='percent'>(<em>" + percentOfTotal + "</em>) (" + totalPercentDelta + ") (" + totalDelta + ")</span>";
		    	           			break

    	            			}


	    	            		table.push('<td>', valueToShow, '</td>')

	    	            		
	    	           	
	    	            	})

	    	          
			           	}


			           	table.push('</tr>')



	        		})

        		}
        		
        		

        	})

	    	 table.push('</table>');
	    	 output.push(table.join(''));

    	} else {
       		output.push('<p>No rows found:', ' ', reportName, ' ', index, ' ', insightGroup, "</p>");
      	}

	 	  outputToPage(output.join(''));

		function outputToPage(output) {
  			$('.debug-listing').append(output)
  		}

	},

}

