var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/contract.js');
var contractFunction = require('../../models/contractFunction.js');
var contractEvent = require('../../models/contractEvent.js');
var transactionData = require('../../models/transactionData.js');
var eventListenerHelper = require('../../helpers/eventListenerHelper.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
 
var consumer = Consumer.create({
    queueUrl: process.env.AWS_TRANSACTION_RECEIPT_QUEUE_URL,
    handleMessage: function (message, done) {
      var data = JSON.parse(message.Body);
      console.log(data.transactionHash);
      done();
      eventListenerHelper.filterWatch(data.transactionHash, function(transactionInfo, transactionReceiptInfo, blockInfo) {
        // TODO save to TransactionData
        console.log('transaction info: ', transactionInfo);
        console.log('transaction receipt info: ', transactionReceiptInfo);
        console.log('block info: ', blockInfo);
        var txStatus = transactionData.CONFIRMED;
          if (transactionInfo.gas == transactionReceiptInfo.gasUsed) {
              txStatus = transactionData.FAILED;
          }

          var entity = {
              "transactionHash": data.transactionHash,
              "status": txStatus,
              "blockNumber": transactionInfo.blockNumber,
              "blockHash": transactionInfo.blockHash,
              "fromAddress": transactionInfo.from,
              "gas": transactionReceiptInfo.gasUsed
          };

          transactionData.updateByTransactionHash(entity).then(function(result) {
              console.log('[TRANSACTIONDATA UPDATE] Data mined, transactionHash: ' + data.transactionHash);
          }).catch(function (err) {
              console.log(err.message, err.stack);
          });
      });
    },
    sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();