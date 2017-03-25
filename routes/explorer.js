var express = require('express');
var router = express.Router();
var block = require('../models/elasticsearch/block.js');
var transaction = require('../models/elasticsearch/transaction.js');

/* GET home page. */
router.get('/block', function(req, res, next) {
  var blockInfo = block.get(req.query.blockNumber)
  if (blockInfo.found === true) {
  	res.json({'data': blockInfo._source})
  } else {
  	res.json({'error': {'code': 301, 'message': 'no data'}})
  }
});

router.get('/address', function(req, res, next) {
  var addressInfo = transaction.search(req.query.tx)
  var data = []
  if (addressInfo.hits.total > 0) {
  	addressInfo.hits.hits.forEach(function(source) {
  		data.push(source._source)
  	})
  	res.json({'data': data})
  } else {
  	res.json({'error': {'code': 301, 'message': 'no data'}})
  }
});

router.get('/transaction', function(req, res, next) {
  var transactionInfo = transaction.get(req.query.tx)
  if (transactionInfo.found === true) {
  	res.json({'data': transactionInfo._source})
  } else {
  	res.json({'error': {'code': 301, 'message': 'no data'}})
  }
});

module.exports = router;