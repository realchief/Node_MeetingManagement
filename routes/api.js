var express = require('express');
var router = express.Router();
var request = require('request')

router.get('/:endpoint', function( req, res) {

	console.log('Query: ' + req.query)

	var options = {};

	var test = {
		'marty' : 'stake'
	}

	res.json(test)

	
	request(options, function (error, response, body) {
		
		//console.log('error:', error); // Print the error if one occurred 
		//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		//console.log('body:', body); // Response
		
		if ( typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
			
			var statusCode = response.statusCode;
			if ( statusCode != 200 ) {
				res.send(JSON.parse(body));
				return
			}

		} else {
			var statusCode = "";
		}
	
		res.json(JSON.parse(body));

	});


})


module.exports = router