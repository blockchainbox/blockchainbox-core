var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/postgres/contract.js');
var contractElasticSearch = require('../../models/elasticsearch/contract.js');
var transactionElasticSearch = require('../../models/elasticsearch/transaction.js');
var sqsHelper = require('../../helpers/aws/sqsHelper.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


 
var consumer = Consumer.create({
  queueUrl: process.env.AWS_CONTRACT_QUEUE_URL,
  handleMessage: function (message, done) {
    var data = JSON.parse(message.Body);
    done();
    contract.read(data.contractId).then(function(result){
      if (result.rowCount > 0) {
        var contractAbi = JSON.parse(result.rows[0].abi);
        var contractInstance = web3.eth.contract(contractAbi);
        var contractByteCode = '0x' + result.rows[0].bytecode;
        var gasEstimate = web3.eth.estimateGas({data: contractByteCode});
        web3.personal.unlockAccount(web3.eth.coinbase, process.env.COINBASE_PASSWORD, 1000)
        contractInstance.new({
          from: web3.eth.coinbase,
          data: contractByteCode,  // TODO need confirm why this need '0x', and check contract is availble for use
          gas: gasEstimate
        }, function(err, instance){
          if (!err && typeof instance.address !== 'undefined') {
            var entity = {
              id: data.contractId,
              address: instance.address
            };
            contract.updateAddress(entity).then(function(result){
              console.log('[CONTRACT UPDATE] After Contract Mined, id: ' + data.contractId + ', transactionHash: ' + instance.transactionHash + ', address: ' + instance.address);
              var webhookMessage = {
                "contractId": data.contractId,
                "transactionHash": instance.transactionHash
              }
              sqsHelper.send(JSON.stringify(webhookMessage),
                process.env.AWS_WEBHOOK_QUEUE_URL, 10,
                'webhook');
              var contractInfo = {
                "contractAbi": contractAbi,
                "contractByteCode": '0x' + result.rows[0].bytecode,
                "transactionHash": instance.transactionHash
              };
              contractElasticSearch.create(
                instance.address, 
                contractInfo
              });
            });
          } else if (!err) {
            var entity = {
              id: data.contractId,
              transactionHash: instance.transactionHash
            };
            contract.updateTransactionHash(entity).then(function(result){
              console.log('[CONTRACT UPDATE] Before Contract Mined, id: ' + data.contractId + ', transactionHash: ' + instance.transactionHash);
            });
          }
        });
      }
    }).catch(function(err) {
      console.log(err.message, err.stack);
    });
  },
  sqs: new AWS.SQS()
});
 
consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();
