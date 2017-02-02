var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/contract.js');
var contractEvent = require('../../models/contractEvent.js');
var eventData = require('../../models/eventData.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
 
var consumer = Consumer.create({
	queueUrl: process.env.AWS_EVENT_QUEUE_URL,
  	handleMessage: function (message, done) {
  		// 參考: https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-allevents
  		// update by contractId
		var data = JSON.parse(message.Body);
		done();
  		contract.read(data.contractId).then(function(contractResult) {
			if (contractResult.rowCount > 0) {
				var contractResultData = contractResult.rows[0];
				var contractABI = JSON.parse(contractResultData.abi);
				var contractAddress = contractResultData.address;
				var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
				contractEvent.readByContractId(data.contractId).then(function(contractEventResult) {
					if (contractEventResult.rowCount > 0) {
						var eventArray = {};
						contractEventResult.rows.forEach(function(contractEventResultData){
							eventArray[contractEventResultData.eventname] = contractEventResultData.id;
						});
						var events = contractInstance.allEvents({fromBlock: data.blockNumber, toBlock: 'latest'});
						console.log('[EVENTQUEUE] Get events from: ' + data.blockNumber + ' to latest');
						events.get(function(err, result){
							if (!err) {
								result.forEach(function(eventInfo) {
									var entity = {
										"contractEventId": eventArray[eventInfo.event],
										"event": eventInfo.event,
										"blockNumber": eventInfo.blockNumber,
										"blockHash": eventInfo.blockHash,
										"address": eventInfo.address,
										"transactionHash": eventInfo.transactionHash,
										"data": eventInfo.args
									};
									eventData.create(entity).then(function(result){
										console.log('[EVENTDATA] CREATE');
									}).catch(function(err) {
										console.log('[EVENTDATA] CREATE failed', err);
									});
								});	
							}
						});
						events.stopWatching();
					}
				}).catch(function(err) {
					console.log('[CONTRACTEVENT] readByContractId failed', err);
				});
			}
		}).catch(function(err) {
		  	console.log('[CONTRACT] read failed', err);
		});
  	},
  	sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();