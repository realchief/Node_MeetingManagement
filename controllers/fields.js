exports.setFieldValue = ( dataSource, fieldName, timeframe, value, valueType ) => {

	valueType = valueType || "integer"

	valueType = valueType.toLowerCase()

	if ( typeof dataSource.fields[fieldName] == 'undefined') {
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

	dataSource.fields[fieldName].data.values[timeframe] = value

	var message = 	dataSource + ' ' + fieldName + ' ' + 'for ' + timeframe + ' ' + 'Set To ' + value + ' of type: ' + typeof(value);
	//console.log(message)

	return { 
		dataSource : dataSource,
		fieldName : fieldName,
		timeframe : timeframe, 
		value : value
	}

}