var Web3 = require('web3');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var transactionData = require('../models/transactionData.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

function ContractController() {}

/**
 * Set function param into contract
 * 
 * entity: {
 *   "contractId": integer,
 *   "contractFunctionId": integer,
 *   "data": array,
 *   "txHash": string	
 * }
 */ 
ContractController.prototype.setContractFunctionData = function(entity) {
	contract.read(entity.contractId).then(function(contractResult) {
		if (contractResult.rowCount > 0) {
			var contractResultData = contractResult.rows[0];
			var contractABI = JSON.parse(contractResultData.abi);
			var contractAddress = contractResultData.address;
			contractFunction.read(entity.contractFunctionId).then(function(contractFunctionResult) {
				if (contractFunctionResult.rowCount > 0) {
					var contractFunctionResultData = contractFunctionResult.rows[0];
					var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
					var args = [];
					entity.data.forEach(function(param){
						args.push(param);
					});
					// TODO use estimateGas
					args.push({from: web3.eth.coinbase, gas: 4700000});
					// dynamic apply funciton to block chain
					var transactionHash = contractInstance[contractFunctionResultData.functionname].apply(this, args);
					console.log('transactionHash: ' + transactionHash);

					var message = {
						"contractId": entity.contractId,
						"txHash": entity.txHash,
						"transactionHash": transactionHash
					}
					sqsHelper.send(JSON.stringify(message), 
						process.env.AWS_TRANSACTION_RECEIPT_QUEUE_URL, 10, 
						'transactionReceipt');

					var transactionDataEntity = {
						"transactionHash": transactionHash,
						"fromAddress": web3.eth.coinbase,
						"status": transactionData.PENDING,
						"txHash": entity.txHash
					};
					transactionData.updateByTxHash(transactionDataEntity).then(function(transactionDataResult) {
						console.log('[TRANSACTIONDATA UPDATE] txHash: ' + entity.txHash + ' transactionHash: ' + transactionHash);
					}).catch(function(err) {
						console.log('[ERROR] TransactionData', err.message, err.stack);
					});
				} else {
					console.log('contractFunction empty data');
				}
			}).catch(function(err) {
				console.log('[ERROR] ContractFunction', err.message, err.stack);
			});
		}
	}).catch(function(err) {
		console.log('[ERROR] Contract', err.message, err.stack);
	});
}

exports = module.exports = new ContractController();
