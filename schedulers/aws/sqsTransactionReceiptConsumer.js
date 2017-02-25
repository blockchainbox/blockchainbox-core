var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/contract.js');
var contractFunction = require('../../models/contractFunction.js');
var contractEvent = require('../../models/contractEvent.js');
var transactionData = require('../../models/transactionData.js');
var EventListenerHelper = require('../../helpers/eventListenerHelper.js');
var sqsHelper = require('../../helpers/aws/sqsHelper.js');
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
        var eventListener = new EventListenerHelper();
        eventListener.filterWatch(data.transactionHash, function(transactionInfo, transactionReceiptInfo, blockInfo) {
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
                var message = {
                    "contractId": data.contractId,
                    "txHash": data.txHash,
                    "transactionHash": data.transactionHash,
                    "blockNumber": transactionInfo.blockNumber
                }
                sqsHelper.send(JSON.stringify(message),
                    process.env.AWS_EVENT_QUEUE_URL, 10,
                    'event');
                var webhookMessage = {
                    "contractFunctionId": data.contractFunctionId,
                    "transactionHash": data.transactionHash
                }
                sqsHelper.send(JSON.stringify(webhookMessage),
                    process.env.AWS_WEBHOOK_QUEUE_URL, 10,
                    'webhook');
            }).catch(function (err) {
                console.log(err.message, err.stack);
            });
        });
        done();
    },
    sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();