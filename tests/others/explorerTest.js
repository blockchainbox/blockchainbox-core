var transaction = require('../../models/elasticsearch/transaction.js');
var block = require('../../models/elasticsearch/block.js');
var Web3 = require('web3');
var web3 = new Web3();
var elasticsearch = require('elasticsearch');

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

function search() {
	block.search('0x4d72c95ae4d73074e05092de63297ff7481b2a5c680aaa2c78008b5d148be83c')
	.then(function(body){
		var hit = body.hits.hits;
		hit.forEach(function(data) {
			console.log(data._source)
		})
	}).catch(function(err){
		console.log(err)
	})
}

function create(num) {
	var blockInfo = web3.eth.getBlock(num);
	block.create(num, blockInfo)
	.then(function(body){
		blockInfo.transactions.forEach(function(tx) {
			var transactionInfo = web3.eth.getTransaction(tx)
			transaction.create(tx, transactionInfo)
			.then(function(body){
				
			}).catch(function(err){
				console.log('err: ', err)
			});
		});
	}).catch(function(err){
		console.log('err: ', err)
	});
}

function exists(num) {
	block.exists(num).then(function(exists) {
		console.log(exists)
	})
}

function count() {
	block.count().then(function(count) {
		console.log(count) 
	})
}

function deleteBlock(num) {
	block.delete(num).then(function(result) {
		console.log(result)
	})
}

for(var i = 999; i <= 1000; i++) {
	create(i)
}
// create(100)