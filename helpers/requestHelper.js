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
			return true;
	  		console.log('[WEBHOOK] url: ' + url + ', statusCode: ' + (request && response.statusCode)); // Print the response status code if a response was received
		} else {
			return false;
			console.log('[WEBHOOK] error: ', error);
		}
	});
};

exports = module.exports = new RequestHelper();
