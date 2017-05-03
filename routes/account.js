var express = require('express');
var router = express.Router();
var sha3_224 = require('js-sha3').sha3_224;
var fs = require('fs');
var address = require('../models/postgres/address.js');
var account = require('../models/postgres/account.js');
var Web3 = require('web3');
var web3 = new Web3();
var router = express.Router();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));


/* POST create account, this will also create Ethereum address */
router.post('/create', function(req, res, next) {
	if (req.body.account !== undefined && req.body.account !== null && req.body.account !== '' &&
		req.body.password !== undefined && req.body.password !== null && req.body.password !== '') {
    var userAccount = req.body.account;
    var userPassword = req.body.password;

    var accountEntity = {
    	'account': userAccount,
    	'password': userPassword
    };
    account.create(accountEntity).then(function(accountId){
    	// generate passphrase
    	// generate token
    	var passphrase = sha3_224(account + ':passphrase:' + Math.random());
    	var token = sha3_224(account + ':token:' + Math.random());

      var ethAddress = web3.personal.newAccount(passphrase);
      // TODO save address & passphrase
      var addressEntity = {
      	'accountId': accountId,
        'address': ethAddress,
        'passphrase': passphrase,    // hash
        'token': token
      }

      address.create(addressEntity).then(function(addressResult){
				var fileDir = '/Users/phyrextsai/Library/Ethereum/keystore'
				fs.readdir(fileDir, 'utf8', function(err, files) {
					if (err) console.log(err);
				  files.forEach(function(file) {
				    if (file.indexOf(ethAddress.substring(2)) >= 0) {
					    fs.readFile(fileDir + '/' + file, 'utf8', function(err, data) {
					    	res.json({'account': userAccount, 
					    		'address': ethAddress, 
					    		'keystore': JSON.parse(data), 
					    		'passphrase': passphrase, 
					    		'accessToken': token});
					    })
					  }
				  });
				});
      }).catch(function(err){
      	console.log(err.message, err.stack);
				res.json({'error': {'code': 402, 'message': 'error on create eth address'}});
      });
    }).catch(function(err){
      console.log(err.message, err.stack);
			res.json({'error': {'code': 401, 'message': 'error on create account'}});
    });      
  } else {
    res.json({'error': {'message': 'must give account and password'}});
  }
});

module.exports = router;
