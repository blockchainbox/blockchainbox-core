var Web3 = require('web3');
var solc = require('solc');
var util = require('util');
var Promise = require('bluebird');
var contract = require('../models/contract.js');
var contractEvent = require('../models/contractEvent.js');
var contractFunction = require('../models/contractFunction.js');
var transactionData = require('../models/transactionData.js');
var webhookData = require('../models/webhookData.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');

var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

function ContractController() {}

ContractController.prototype.deployContract = function(sourceCode, webhookUrl) {
    return new Promise(function(resolve, reject) {
    	var result = solc.compile(sourceCode, 1);
	    var ids = [];
	    var promises = [];
        for (var contractName in result.contracts) {
        	promises.push(new Promise(function(resolveContract, reject) {
				var abi = result.contracts[contractName].interface;
				var contractEntity = {
	                name: contractName, 
	                sourceCode: sourceCode,
	                byteCode: result.contracts[contractName].bytecode,
	                language: result.contracts[contractName].metadata.language,
	                compilerVersion: result.contracts[contractName].metadata.compiler,
	                abi: abi,
	                gasEstimates: web3.eth.estimateGas({data: '0x' + result.contracts[contractName].bytecode})
	            };

	            contract.create(contractEntity).then(function (contractId) {
	            	console.log('[CONTRACT CREATE] id: ' + contractId);
	                ids.push(contractId);
	                if (webhookUrl !== ''){
	                	var entity = {
		                	"contractId": contractId,
		                	"url": webhookUrl
		                }
		                webhookData.create(entity).then(function(result) {
		                	console.log('[CONTRACT WEBHOOK CREATE] contractId: ' + contractid + ", webhookUrl: " + webhookUrl);
		                });
		            }
	                var message = {
	                	"contractId": contractId
	                }
	                sqsHelper.send(JSON.stringify(message), 
	                	process.env.AWS_CONTRACT_QUEUE_URL, 10, 
	                	'contract');
	                JSON.parse(abi).forEach(function(data){
	                    if (data.type === 'event') {
	                        var contractEventEntity = {
	                            contractId: contractId,
	                            eventName: data.name,
	                            eventParameters: data
	                        };
	                        contractEvent.create(contractEventEntity).then(function (contractEventId) {
	                            console.log('[CONTRACTEVENT CREATE] id: ' + contractEventId);
	                        }).catch(function (err) {
	                            console.log(err.message, err.stack);
	                        });
	                    }
	                    if (data.type === 'function') {
	                        var contractFunctionEntity = {
	                            contractId: contractId,
	                            functionName: data.name,
	                            functionParameters: data
	                        };
	                        contractFunction.create(contractFunctionEntity).then(function (contractFunctionId) {
	                            console.log('[CONTRACTFUNCTION CREATE] id: ' + contractFunctionId);
	                        }).catch(function (err) {
	                            console.log(err.message, err.stack);
	                        });
	                    }
	                });
	                resolveContract()
	            }).catch(function (err) {
	                // error handle
	                console.log(err.message, err.stack);
	                // res.json({'error': {'message': err.message}});
	                reject(err);
	            });
	        }));
        }
        return Promise.all(promises).then(() => { resolve(ids) });
    });
}

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
						"contractFunctionId": entity.contractFunctionId,
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
