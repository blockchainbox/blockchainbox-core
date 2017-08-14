var addressElasticSearch = require('../../models/elasticsearch/address.js');

/*eventElasticSearch.update("test5", {"a": "a"}).then(function() {
	eventElasticSearch.update("test5", {"b": "b"});
});*/

/*eventElasticSearch.exists("test").then(function(result) {
	console.log(result);
});*/

const addAddress = async (id, transactionHash, data) => {
	try {
		await addressElasticSearch.update(id, transactionHash, data);
	} catch (err) {

	}
}

const deleteAddress = async (id) => {
	try {
		await addressElasticSearch.delete(id);
	} catch (err) {

	}
}

//deleteAddress("0x3d3014bfdcdc1dcdeb3a9b2a8901531ab7fa495d");
addAddress("0x3d3014bfdcdc1dcdeb3a9b2a8901531ab7fa495d", "3abc", {"transaction": "test1"});
addAddress("0x3d3014bfdcdc1dcdeb3a9b2a8901531ab7fa495d", "4abcd", {"transaction": "test2"});
