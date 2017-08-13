var eventElasticSearch = require('../../models/elasticsearch/event.js');

eventElasticSearch.update("test5", {"a": "a"}).then(function() {
	eventElasticSearch.update("test5", {"b": "b"});
});

/*eventElasticSearch.exists("test").then(function(result) {
	console.log(result);
});*/