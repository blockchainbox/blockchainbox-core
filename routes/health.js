var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/webhooks', function(req, res, next) {
	request.post(req.query.url, function (error, response, body) {
	  	//console.log('error:', error); // Print the error if one occurred
	  	//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	  	//console.log('body:', body); // Print the HTML for the Google homepage.
	  	var status = 'FAILED';
	  	if (!error) {
		  	if (response && response.statusCode == 200) {
		  		status = 'OK'
		  	}
		  	res.json({'status': status});
		} else {
			res.json({'status': status, 'error': error});
		}
	});
});

router.get('/', function(req, res, next) {
	// service, postgres, elasticsearch, ethereum
	res.json({'status': 'OK'});
});

module.exports = router;