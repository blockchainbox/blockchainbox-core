var Web3 = require('web3');
var web3 = new Web3();
var BigNumber = require('bignumber.js');
var elasticsearch = require('elasticsearch');

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

var client = new elasticsearch.Client({
  host: 'localhost:32780',
  log: 'trace'
});

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

client.search({
  index: 'blockchainbox',
  type: 'block',
  q: '0x4d72c95ae4d73074e05092de63297ff7481b2a5c680aaa2c78008b5d148be83c'
}).then(function (body) {
  console.log(body)
  var hits = body.hits.hits;
}, function (error) {
  console.trace(error.message);
});

// client.search({
//   index: 'blockchainbox',
//   type: 'block',
//   body: {
//     query: {
//       match: {
//         hash: '0x4d72c95ae4d73074e05092de63297ff7481b2a5c680aaa2c78008b5d148be83c'
//       }
//     }
//   }
// }).then(function (resp) {
// 	console.log(resp)
//     var hits = resp.hits.hits;
// }, function (err) {
//     console.trace(err.message);
// });

// 1284, 1213
// for(var i = 1000; i < 1300; i++) {
// 	console.log(i)
	var blockInfo = web3.eth.getBlock(1284);
// 	if (blockInfo.transactions.length > 0) {
		blockInfo.transactions.forEach(function(tx) {
			var transactionInfo = web3.eth.getTransaction(tx)
			var value = new BigNumber(transactionInfo.value.s + 'e' + transactionInfo.value.e)
			console.log(transactionInfo)
			console.log(transactionInfo.from, 
			transactionInfo.to,
			web3.fromWei(value + '', 'ether'))
		});
// 	}
// }