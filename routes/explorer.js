var express = require('express');
var router = express.Router();
var block = require('../models/elasticsearch/block.js');
var transaction = require('../models/elasticsearch/transaction.js');
var contract = require('../models/elasticsearch/contract.js');
var event = require('../models/elasticsearch/event.js');
var address = require('../models/elasticsearch/address.js');

/**
 * GET search block by block number
 */
router.get('/block', function(req, res, next) {
  block.get(req.query.blockNumber).then(function(blockInfo){
	  if (blockInfo.found === true) {
	  	res.json({'data': blockInfo._source})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
  }).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	});
});

/**
 * GET search address by transactionHash(tx)
 */
router.get('/address', function(req, res, next) {
	address.get(req.query.address).then(function(addressInfo) {
		if (addressInfo.found === true) {
	  	res.json({'data': addressInfo._source})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
	}).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	});
  /*transaction.search(req.query.tx).then(function(addressInfo){
	  var data = [];
	  if (addressInfo.hits.total > 0) {
	  	addressInfo.hits.hits.forEach(function(source) {
	  		data.push(source._source)
	  	})
	  	res.json({'data': data})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
  }).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	});*/
});

/**
 * GET search transaction by transactionHash(tx)
 */
router.get('/transaction', function(req, res, next) {
  transaction.get(req.query.tx).then(function(transactionInfo){
	  if (transactionInfo.found === true) {
	  	res.json({'data': transactionInfo._source})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
	}).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	})
});

/**
 * GET search contract
 */
router.get('/contract', function(req, res, next) {
	contract.get(req.query.address).then(function(contractInfo){
	  if (contractInfo.found === true) {
	  	res.json({'data': contractInfo._source})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
	}).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	})
});

/**
 * GET search event
 */
router.get('/event', function(req, res, next) {
	// transactionHash, contractAddress, eventName
	event.get(req.query.address).then(function(eventInfo){
	  if (eventInfo.found === true) {
	  	res.json({'data': eventInfo._source})
	  } else {
	  	res.json({'error': {'code': 301, 'message': 'no data'}})
	  }
	}).catch(function(err){
		res.json({'error': {'code': 302, 'message': 'search error'}})
	})
});

module.exports = router;