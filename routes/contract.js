var express = require('express');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var contractEvent = require('../models/contractEvent.js');
var contractController = require('../controllers/contractController.js');
var transactionData = require('../models/transactionData.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var router = express.Router();

/**
 * POST use contract function
 */
router.post('/v1/function', function(req, res, next) {
	if (req.body.contractId === undefined) {
		res.json({'error': {'code': 201, 'message': 'contractId is null'}});
	}
	if (req.body.contractFunctionId === undefined) {
		res.json({'error': {'code': 202, 'message': 'contractFunctionId is null'}});
	}
	if (req.body.data === undefined) {
		res.json({'error': {'code': 203, 'message': 'data is null'}});
	}
	var contractId = req.body.contractId;
	var contractFunctionId = req.body.contractFunctionId;
	var data = req.body.data;
	transactionData.create({"data": JSON.stringify(data)}).then(function (txHash) {
		var message = {
			"txHash": txHash,
			"contractId": contractId,
			"contractFunctionId": contractFunctionId,
			"data": data
		};
		sqsHelper.send(JSON.stringify(message), 
					process.env.AWS_TRANSACTION_QUEUE_URL, 10, 
					'transaction');
		res.json({'data': {'txHash': txHash}});
	}).catch(function(err) {
		console.log(err.message, err.stack);
		res.json({'error': {'code': 204, 'message': 'error on send transaction'}});
	});
});

/**
 * GET function transaction status
 */
router.get('/v1/function', function(req, res, next){

});

/**
 * GET event data 
 */
router.get('/v1/event', function(req, res, next) {

});

module.exports = router;