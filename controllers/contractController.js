var Web3 = require('web3');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

function ContractController() {}

ContractController.prototype.setContractFunctionData = function(contractId, contractFunctionId, data) {
	return contract.read(contractId).then(function(contractResult) {
		if (contractResult.rowCount > 0) {
			var contractABI = JSON.parse(contractResult.rows[0].abi);
			var contractAddress = contractResult.rows[0].address;
			contractFunction.read(contractFunctionId).then(function(contractFunctionResult) {
				var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
				console.log('contractInstance: ', contractInstance);
				var args = [];
				data.forEach(function(param){
					args.push(param);
				});
				// TODO use estimateGas
				args.push({from: web3.eth.coinbase, gas: 4700000});
				// dynamic apply funciton to block chain
				var transactionHash = contractInstance[contractFunctionResult.rows[0].functionname].apply(this, args);
				console.log('transactionHash: ', transactionHash);
				sqsHelper.send('{"transactionHash": "' + transactionHash + '"}', process.env.AWS_TRANSACTION_QUEUE_URL, 10, 'transaction');
				return transactionHash;
			}).catch(function(err) {
				console.log(err.message, err.stack);
			});
		}
	}).catch(function(err) {
		console.log(err.message, err.stack);
	});
}

exports = module.exports = new ContractController();