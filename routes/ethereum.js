var express = require('express');
var Web3 = require('web3');
var solc = require('solc');
var util = require('util');
var Promise = require('bluebird');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var contractEvent = require('../models/contractEvent.js');
var ethereumController = require('../controllers/ethereumController.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var web3 = new Web3();
var router = express.Router();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

var PENDING = 'pending';
var EARLIEST = 'earliest';
var LATEST = 'lastest';

/**
 * GET web3 compilers
 */
router.get('/v1/compilers', function (req, res, next) {
    res.json({'compiler': ethereumController.getCompilers()});
});

/**
 * GET contract info
 */
router.get('/v1/contract', function (req, res, next) {
    var contractId = req.query.contractId;
    var contractInfo = null;
    var contractEventInfo = null;
    var contractFunctionInfo = null;
    var contractLoaded = new Promise(function(resolve, reject) {
        contract.read(contractId).then(function(result) {
            contractInfo = result.rows;
            contractEvent.readByContractId(contractId).then(function(result){
                contractEventInfo = result.rows; 
                contractFunction.readByContractId(contractId).then(function(result){
                    contractFunctionInfo = result.rows;
                    var info = {
                        contract: contractInfo,
                        contractEvent: contractEventInfo,
                        contractFunction: contractFunctionInfo
                    };
                    res.json({'data': info});
                })
            })
        })
    });
});

/**
 * POST deploy solidity contract
 */
router.post('/v1/contract', function (req, res, next) {
    if (req.body.sourceCode !== undefined && req.body.sourceCode !== null && req.body.sourceCode !== '') {
    	var sourceCode = req.body.sourceCode;
        var result = solc.compile(sourceCode, 1);
        var id = [];
        for (var contractName in result.contracts) {
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
                id.push(contractId);
                
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
                        // TODO insert contractEvent and contractFunction
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
            }).catch(function (err) {
                // error handle
                console.log(err.message, err.stack);
                res.json({'error': {'message': err.message}});
            });
        }
        // TODO add Promise
        res.json({'data': {'contractId': id}});
    } else {
        console.log('error invalid source code!');
        res.json({'error': {'message': 'invalid source code'}});
    }
});

/**
 * GET ethereum coinbase
 */
router.get('/v1/coinbase', function (req, res, next) {
    res.json({'data': {'coinbase': ethereumController.getCoinbase()}});
});

/**
 * GET ethereum account balance
 */
router.get('/v1/balance', function (req, res, next) {
    var coinbase = ethereumController.getCoinbase();
    if (req.query.address !== null && req.query.address !== '' && req.query.address !== undefined) {
        coinbase = req.query.address;
    }
    res.json({'data': {'coinbase': coinbase, 'balance': ethereumController.getBalance(coinbase)}});
});

/**
 * 這邊是在針對兩兩之間送錢的做的 transaction，如果是針對合約送錢需要使用 data 寫入合約的 byteCode
 * POST send transaction
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
 */
router.post('/v1/transaction', function (req, res, next) {
    // TODO: init gas maximum
    web3.eth.sendTransaction(
        {
            from: req.body.from,
            //data: contract,
            gas: 4700000,
            to: req.body.to,
            value: req.body.value
        },
        function (err, txHash) {
            if (!err) {
                res.json({'data': {'txHash': txHash}});
                //console.log(txHash); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
            } else {
                res.json({'error': {'code': 101, 'message': err}});
            }
        }
    );
});

/**
 * GET query txHash from contract
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-methods
 */
router.get('/v1/transaction', function (req, res, next) {
    var txHash = req.query.txHash;
    if (txHash !== null && txHash !== '' && txHash !== undefined) {
        res.json({'data': {"txHash": txHash}});
    }
    res.json({'error': {'code': 100, 'message': 'txHash is null'}});
});

/**
 * GET transactionReceipt
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
 */
router.get('/v1/transactionReceipt', function (req, res, next) {
    var transactionHash = req.query.transactionHash;
    if (transactionHash !== null && transactionHash !== '' && transactionHash !== undefined) {
        res.json({'data': web3.eth.getTransactionReceipt(transactionHash)});
    }
    res.json({'error': {'code': 102, 'message': 'transactionHash is null'}});
});

/**
 * GET estimate gas
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethestimategas
 */
router.get('/v1/estimateGas', function (req, res, next) {
    var result = web3.eth.estimateGas({
        to: req.query.to,
        data: req.query.data
    });
    res.json({'data': {'gas': result}});
});

/**
 * GET gas price
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgasprice
 */
router.get('/v1/gasPrice', function (req, res, next) {
    var gasPrice = web3.eth.gasPrice;
    res.json({'data': {'gasPrice': gasPrice.toString(10)}});
});

/**
 * GET current block number
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethblocknumber
 */
router.get('/v1/blockNumber', function (req, res, next) {
    var blockNumber = web3.eth.blockNumber; 
    res.json({'data': {'blockNumber': blockNumber}});
});

/**
 * GET hashrate
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethhashrate
 */
router.get('/v1/hashrate', function (req, res, next) {
    var hashrate = web3.eth.hashrate;
    res.json({'data': {'hashrate': hashrate}});
});

/**
 * GET block info
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgetblock
 */
router.get('/v1/blockInfo', function (req, res, next) {
    var blockHashOrBlockNumber = req.query.block;
    if ((blockHashOrBlockNumber !== null && blockHashOrBlockNumber !== '' && blockHashOrBlockNumber !== undefined) ||
        Number.isInteger(blockNumberOrString)) {
        res.json({'data': {'blockInfo': web3.eth.getBlock(req.query.block)}});
    }
    res.json({'error': {'code': 103, 'message': 'block hash or block number is needed.'}});
});

/**
 * GET block transaction count
 */
router.get('/v1/blockTransactionCount', function (req, res, next) {
    var blockNumberOrString = req.query.block;
    if (Number.isInteger(blockNumberOrString) || 
        blockNumberOrString === 'PENDING' || 
        blockNumberOrString === 'EARLIEST' || 
        blockNumberOrString === 'LATEST') {
        res.json({'data': {'blockTransactionCount': web3.eth.getBlockTransactionCount(req.query.block)}});
    }
    res.json({'error': {'code': 104, 'message': 'block number or block status is needed.'}})
});

module.exports = router;
