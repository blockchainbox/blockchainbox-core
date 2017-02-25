var request = require('request');

function RequestHelper() {}

RequestHelper.prototype.post = function(url, data) {
	request.post({
			'url': url,
			'method': 'POST',
			'header': {
				'content-type': 'application/json'
			},
			'json': data
		}, function (error, response, body) {
		if (!error) {
	  		console.log('[WEBHOOK] url: ' + url + ', statusCode: ' + (request && response.statusCode)); // Print the response status code if a response was received
		} else {
			console.log('[WEBHOOK] error: ', error);
		}
	  	//console.log('body:', body); // Print the HTML for the Google homepage.
	});
};

exports = module.exports = new RequestHelper();
