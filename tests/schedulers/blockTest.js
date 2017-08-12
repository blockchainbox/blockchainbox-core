var Web3 = require('web3');
var web3 = new Web3();
var BigNumber = require('bignumber.js');
var elasticsearch = require('elasticsearch');

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'https://ropsten.infura.io/YJ5zuNbAkmYQY3kFn4cZ'));

/*var client = new elasticsearch.Client({
  host: 'https://search-blockchainbox-u3vopre4knus7rvvnzaybkejey.us-west-2.es.amazonaws.com/',
  log: 'trace'
});*/
var blockNumber = web3.eth.blockNumber;
console.log(blockNumber);
/*client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

//var blockNumber = web3.eth.blockNumber;
const genClients = async () => {
  for (let i = 6; i <= blockNumber;i++) {
    try {
      const body = await client.create({
        "index": "blockchainbox",
        "type": "block",   
        "id": i, 
        "body": {"blockInfo": web3.eth.getBlock(i)}
      });
      console.log(body);
    } catch (error) {
      console.log(error);
    }
    

    // client.create({
    //   "index": "blockchainbox",
    //   "type": "block",   
    //   "id": i, 
    //   "body": {"blockInfo": web3.eth.getBlock(i)}
    // }).then(function (body) {
    //   console.log(body);
    // }).catch(function(err) {
    //   console.log(err);
    // });
  }
};

genClients();
*/

/*client.search({
  index: 'blockchainbox',
  type: 'block',
  q: '10'
}).then(function (body) {
  console.log(body)
  var hits = body.hits.hits;
}, function (error) {
  console.trace(error.message);
});

client.get({
  index: 'blockchainbox',
  type: 'block',
  id: '10'
}).then(function (body) {
  console.log(body)
}, function (error) {
  console.trace(error.message);
});*/

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
	/*var blockInfo = web3.eth.getBlock(1284);
// 	if (blockInfo.transactions.length > 0) {
		blockInfo.transactions.forEach(function(tx) {
			var transactionInfo = web3.eth.getTransaction(tx)
			var value = new BigNumber(transactionInfo.value.s + 'e' + transactionInfo.value.e)
			console.log(transactionInfo)
			console.log(transactionInfo.from, 
			transactionInfo.to,
			web3.fromWei(value + '', 'ether'))
		});*/
// 	}
// }