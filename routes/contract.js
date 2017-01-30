var express = require('express');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var contractEvent = require('../models/contractEvent.js');
var contractController = require('../controllers/contractController.js');
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
	var transactionHash = contractController.setContractFunctionData(contractId, contractFunctionId, data);
	res.json({'data': {'transactionHash': transactionHash}});
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