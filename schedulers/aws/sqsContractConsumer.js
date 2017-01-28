var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/contract.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
 
var consumer = Consumer.create({
  queueUrl: process.env.AWS_CONTRACT_QUEUE_RUL,
  handleMessage: function (message, done) {
    var data = JSON.parse(message.Body);
    done();
    contract.read(data.contractId).then(function(result){
      if (result.rowCount > 0) {
        var contractAbi = JSON.parse(result.rows[0].abi);
        var contractInstance = web3.eth.contract(contractAbi);
        var contractByteCode = result.rows[0].bytecode;
        contractInstance.new({
          from: web3.eth.coinbase,
          data: '0x' + contractByteCode,  // TODO need confirm why this need '0x', and check contract is availble for use
          gas: 4700000
        }, function(err, instance){
          if (!err && typeof instance.address !== 'undefined') {
            var entity = {
              id: data.contractId,
              address: instance.address
            };
            contract.updateAddress(entity).then(function(result){
              console.log('[CONTRACT UPDATE] After Contract Mined, id: ' + data.contractId + ', transactionHash: ' + instance.transactionHash + ', address: ' + instance.address);
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