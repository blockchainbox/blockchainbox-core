var Web3 = require('web3');
var contract = require('../../models/contract.js');
var contractEvent = require('../../models/contractEvent.js');
var eventData = require('../../models/eventData.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var message = {
    "contractId": 1,
    "txHash": "txHash",
    "transactionHash": "",
    "blockNumber": 453762
};
contract.read(message.contractId).then(function(contractResult) {
	if (contractResult.rowCount > 0) {
		var contractResultData = contractResult.rows[0];
		var contractABI = JSON.parse(contractResultData.abi);
		var contractAddress = contractResultData.address;
		var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
		contractEvent.readByContractId(message.contractId).then(function(contractEventResult) {
			if (contractEventResult.rowCount > 0) {
				var eventArray = {};
				contractEventResult.rows.forEach(function(contractEventResultData){
					eventArray[contractEventResultData.eventname] = contractEventResultData.id;
				});
				var events = contractInstance.allEvents({fromBlock: message.blockNumber, toBlock: 'latest'});
				events.get(function(err, result){
					if (!err) {
						result.forEach(function(data) {
							var entity = {
								"contractEventId": eventArray[data.event],
								"event": data.event,
								"blockNumber": data.blockNumber,
								"blockHash": data.blockHash,
								"address": data.address,
								"transactionHash": data.transactionHash,
								"data": data.args
							};
							//console.log(entity);
							eventData.create(entity).then(function(result){
								console.log('[EVENTDATA] CREATE');
							})
						});	
					}
				});
				events.stopWatching();
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
		});
	}
}).catch(function(err) {
  	console.log(err.message, err.stack);
});