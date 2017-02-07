var express = require('express');
var contract = require('../models/contract.js');
var contractFunction = require('../models/contractFunction.js');
var contractEvent = require('../models/contractEvent.js');
var contractController = require('../controllers/contractController.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var router = express.Router();

/**
 * GET contract info
 */
router.get('/v1/info', function (req, res, next) {
    var contractId = req.query.contractId;
    var contractInfo = null;
    var contractEventInfo = null;
    var contractFunctionInfo = null;
    var contractLoaded = new Promise(function(resolve, reject) {
        contract.read(contractId).then(function(contractResult) {
            contractInfo = contractResult.rows;
            contractEvent.readByContractId(contractId).then(function(contractEventResult){
                contractEventInfo = contractEventResult.rows; 
                contractFunction.readByContractId(contractId).then(function(contractFunctionResult){
                    contractFunctionInfo = contractFunctionResult.rows;
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
 * GET load contract event
 */
router.get('/v1/event', function(req, res, next) {
	if (req.query.contractEventId === undefined) {
		res.json({'error': {'code': 214, 'message': 'contractEventId is null'}});
	}
	var contractEventId = req.query.contractEventId;
	contractEvent.read(contractEventId).then(function(result) {
		if (result.rowCount > 0) {
			res.json({'data': result.rows});
		} else {
			res.json({'error': {'code': 212, 'message': 'empty data'}});
		}
	}).catch(function(err) {
		console.log(err.message, err.stack);
		res.json({'error': {'code': 213, 'message': 'error on load data'}});
	});
});

/**
 * GET load contract function
 */
router.get('/v1/function', function(req, res, next) {
	if (req.query.contractFunctionId === undefined) {
		res.json({'error': {'code': 215, 'message': 'contractFunctionId is null'}});
	}
	var contractFunctionId = req.query.contractFunctionId;
	contractFunction.read(contractFunctionId).then(function(result) {
		if (result.rowCount > 0) {
			res.json({'data': result.rows});
		} else {
			res.json({'error': {'code': 212, 'message': 'empty data'}});
		}
	}).catch(function(err) {
		console.log(err.message, err.stack);
		res.json({'error': {'code': 213, 'message': 'error on load data'}});
	});
});

module.exports = router;