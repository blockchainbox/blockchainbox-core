var express = require('express');
var contract = require('../models/postgres/contract.js');
var contractFunction = require('../models/postgres/contractFunction.js');
var contractEvent = require('../models/postgres/contractEvent.js');
var contractController = require('../controllers/contractController.js');
var transactionData = require('../models/postgres/transactionData.js');
var eventData = require('../models/postgres/eventData.js');
var webhookData = require('../models/postgres/webhookData.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var request = require('request');
var router = express.Router();

/**
 * GET contract info
 */
router.get('/', function (req, res, next) {
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
router.get('/events', function(req, res, next) {
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
router.get('/functions', function(req, res, next) {
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

/**
 * POST use contract function
 */
router.post('/transaction', function(req, res, next) {
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
	var entity = {
		"contractFunctionId": contractFunctionId, 
		"data": JSON.stringify(data)
	};
	transactionData.create(entity).then(function (txHash) {
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
router.get('/transactionData', function(req, res, next){
	if (req.query.txHash) {
		transactionData.read(req.query.txHash).then(function(transactionDataResult) {
			if (transactionDataResult.rowCount > 0) {
				res.json({'data': transactionDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.transactionHash) {
		transactionData.readByTransactionHash(req.query.transactionHash).then(function(transactionDataResult) {
			if (transactionDataResult.rowCount > 0) {
				res.json({'data': transactionDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.contractId) {
		transactionData.readByContractId(req.query.contractId).then(function(transactionDataResult) {
			if (transactionDataResult.rowCount > 0) {
				res.json({'data': transactionDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.contractFunctionId) {
		transactionData.readByContractFunctionId(req.query.contractFunctionId).then(function(transactionDataResult) {
			if (transactionDataResult.rowCount > 0) {
				res.json({'data': transactionDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else {
		res.json({'error': {'code': 211, 'message': 'txHash is null'}});
	}
});

/**
 * GET load event data 
 */
router.get('/eventData', function(req, res, next) {
	if (req.query.txHash) {
		eventData.readByTxHash(req.query.txHash).then(function(eventDataResult) {
			if (eventDataResult.rowCount > 0) {
				res.json({'data': eventDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.transactionHash) {
		eventData.readByTransactionHash(req.query.transactionHash).then(function(eventDataResult) {
			if (eventDataResult.rowCount > 0) {
				res.json({'data': eventDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.contractId) {
		eventData.readByContractId(req.query.contractId).then(function(eventDataResult) {
			if (eventDataResult.rowCount > 0) {
				res.json({'data': eventDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else if (req.query.contractEventId) {
		eventData.readByContractEventId(req.query.contractEventId).then(function(eventDataResult) {
			if (eventDataResult.rowCount > 0) {
				res.json({'data': eventDataResult.rows});
			} else {
				res.json({'error': {'code': 212, 'message': 'empty data'}});
			}
		}).catch(function(err) {
			console.log(err.message, err.stack);
			res.json({'error': {'code': 213, 'message': 'error on load data'}});
		});
	} else {
		res.json({'error': {'code': 221, 'message': 'must provide a valid query parameter'}});
	}
});

/**
 * POST set contract webhooks
 * Support contractId, contractFunctionId, contractEventId
 * @required contractId
 * @required url
 */
router.put('/webhooks', function(req, res, next) {
	if (req.body.contractId === undefined) {
		res.json({'error': {'code': 201, 'message': 'contractId is null'}});
	}
	if (req.body.url === undefined) {
		res.json({'error': {'code': 215, 'message': 'empth webhook'}});
	}
	request.post({
			'url': req.body.url,
			'method': 'POST',
			'header': {
				'content-type': 'application/json'
			},
			'json': {} 
		},
		function (error, response, body) {
		  	if (response && response.statusCode == 200) {
		  		var contractFunctionId = (req.body.contractFunctionId === undefined) ? 
		  			null : req.body.contractFunctionId;
				var contractEventId = (req.body.contractEventId === undefined) ? 
					null : req.body.contractEventId;
				var entity = {
					'contractId': req.body.contractId,
					'contractFunctionId': contractFunctionId,
					'contractEventId': contractEventId,
					'url': req.body.url
				}
				webhookData.create(entity).then(function(result) {
					if (result.rowCount > 0) {
						res.json({'data': {'id' : result.rows[0].id}});
					} else {
						res.json({'error': {'code': 204, 'message': 'webhook url already exists'}});
					}
				}).catch(function(err) {
					console.log(err.message, err.stack);
					res.json({'error': {'code': 204, 'message': 'error on put webhooks'}});
				});
		  	} else {
		  		res.json({'error': {'code': 220, 'message': 'webhook error, statusCode: ' + response.statusCode}});
		  	}
		}
	);
});

module.exports = router;