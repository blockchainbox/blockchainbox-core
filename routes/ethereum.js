var express = require('express');
var Web3 = require('web3');
var solc = require('solc');
var util = require('util');
var Promise = require('bluebird');
var contract = require('../models/postgres/contract.js');
var contractFunction = require('../models/postgres/contractFunction.js');
var contractEvent = require('../models/postgres/contractEvent.js');
var account = require('../models/postgres/account.js');
var ethereumController = require('../controllers/ethereumController.js');
var contractController = require('../controllers/contractController.js');
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
router.get('/compilers', function (req, res, next) {
    res.json({'compiler': ethereumController.getCompilers()});
});

/**
 * POST deploy solidity contracts
 */
router.post('/contracts', function (req, res, next) {
    // TODO 這邊要加上 webhook 確認
    var webhookUrl = '';
    if (req.body.url !== undefined && req.body.url !== null && req.body.url !== '') {
        webhookUrl = req.body.url;
    }
    if (req.body.sourceCode !== undefined && req.body.sourceCode !== null && req.body.sourceCode !== '') {
    	var sourceCode = req.body.sourceCode;
        contractController.deployContract(sourceCode, webhookUrl).then(function(ids){
        	res.json({'data': {'contractId': ids}});
        })
    } else {
        console.log('error invalid source code!');
        res.json({'error': {'message': 'invalid source code'}});
    }
});

/**
 * POST using contract method
 */
router.post('/contractMethod', function (req, res, next) {
    if (req.body.abi && req.body.address && req.body.method) {
        var contractABI = JSON.parse(req.body.abi);
        var contractAddress = req.body.address;
        var method = req.body.method;
        var data = [];
        data = req.body.data;
        var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
        var args = [];
        data.forEach(function(param){
            args.push(param);
        });
        args.push({from: web3.eth.coinbase, gas: 4700000});
        web3.personal.unlockAccount(web3.eth.coinbase, process.env.COINBASE_PASSWORD, 1000);
        var transactionHash = contractInstance[method].apply(this, args);
        // only get transactionInfo by apply webhook url
        if (req.body.webhook) {
            var message = {
                'transactionHash': transactionHash,
                'webhook': req.body.webhook
            }
            sqsHelper.send(JSON.stringify(message), 
                process.env.AWS_TRANSACTION_RECEIPT_QUEUE_URL, 10, 
                'transactionReceipt');
        }

        res.json({'data': {'transactionHash': transactionHash}});
    } else {
        res.json({'error': {'message': 'invalid parameters'}});
    }
});

/**
 * POST create new ethereum account
 */
router.post('/newAccount', function (req, res, next) {
    var passphrase = '';
    if (req.body.passphrase !== undefined && req.body.passphrase !== null && req.body.passphrase !== '') {
        passphrase = req.body.passphrase;
        var address = web3.personal.newAccount(passphrase);
        // TODO save address & passphrase
        var entity = {
            'address': address,
            'passphrase': passphrase    // hash
        }
        account.create(entity).then(function(result){
            res.json({'data': {'address': address}});
        }).catch(function(err){
            res.json({'error': {'message': 'create failed'}});
        });
    } else {
        res.json({'error': {'message': 'must give a passphrase'}});
    }
});

/**
 * GET ethereum coinbase
 */
router.get('/coinbase', function (req, res, next) {
    res.json({'data': {'coinbase': ethereumController.getCoinbase()}});
});

/**
 * GET ethereum account balance
 */
router.get('/balance', function (req, res, next) {
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
router.post('/transaction', function (req, res, next) {
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
 * GET transactionReceipt
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
 */
router.get('/transactionReceipt', function (req, res, next) {
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
router.get('/estimateGas', function (req, res, next) {
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
router.get('/gasPrice', function (req, res, next) {
    var gasPrice = web3.eth.gasPrice;
    res.json({'data': {'gasPrice': gasPrice.toString(10)}});
});

/**
 * GET current block number
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethblocknumber
 */
router.get('/blockNumber', function (req, res, next) {
    var blockNumber = web3.eth.blockNumber; 
    res.json({'data': {'blockNumber': blockNumber}});
});

/**
 * GET hashrate
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethhashrate
 */
router.get('/hashRate', function (req, res, next) {
    var hashrate = web3.eth.hashrate;
    res.json({'data': {'hashrate': hashrate}});
});

/**
 * GET block info
 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgetblock
 */
router.get('/blockInfo', function (req, res, next) {
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
router.get('/blockTransactionCount', function (req, res, next) {
    var blockNumberOrString = req.query.block;
    if (Number.isInteger(parseInt(blockNumberOrString)) || 
        blockNumberOrString === 'PENDING' || 
        blockNumberOrString === 'EARLIEST' || 
        blockNumberOrString === 'LATEST') {
        res.json({'data': {'blockTransactionCount': web3.eth.getBlockTransactionCount(req.query.block)}});
    }
    res.json({'error': {'code': 104, 'message': 'block number or block status is needed.'}})
});

module.exports = router;
