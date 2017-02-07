var eventData = require('../../models/eventData.js');

eventData.readAll().then(function(eventDataResult) {
	console.log(eventDataResult.rowCount);
}).catch(function(err) {
	console.log(err);
});