var eventElasticSearch = require('../../models/elasticsearch/event.js');
var contractElasticSearch = require('../../models/elasticsearch/contract.js');

/*eventElasticSearch.update("test5", {"a": "a"}).then(function() {
	eventElasticSearch.update("test5", {"b": "b"});
});*/

/*eventElasticSearch.exists("test").then(function(result) {
	console.log(result);
});*/

const addContract = async (id, data) => {
	try {
		await contractElasticSearch.create(id, data);
	} catch (err) {

	}
}

addContract("abcde", {"a": "b"});