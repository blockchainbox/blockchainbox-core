var express = require('express');
var eventData = require('../models/eventData.js');
var router = express.Router();
/**
 * GET load event data 
 */
router.get('/v1/data', function(req, res, next) {
	if (req.query.txHash === undefined) {
		res.json({'error': {'code': 211, 'message': 'txHash is null'}});
	}
	var txHash = req.query.txHash;
	eventData.readByTxHash(txHash).then(function(result) {
		if (result.rowCount > 0) {
			res.json({'data': result.rows});
		} else {
			res.json({'error': {'code': 212, 'message': 'empty data'}});
		}
	});
});

module.exports = router;
