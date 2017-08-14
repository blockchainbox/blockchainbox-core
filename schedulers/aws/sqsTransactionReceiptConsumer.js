var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contract = require('../../models/postgres/contract.js');
var contractFunction = require('../../models/postgres/contractFunction.js');
var contractEvent = require('../../models/postgres/contractEvent.js');
var transactionData = require('../../models/postgres/transactionData.js');
var EventListenerHelper = require('../../helpers/eventListenerHelper.js');
var sqsHelper = require('../../helpers/aws/sqsHelper.js');
var requestHelper = require('../../helpers/requestHelper.js');
var transactionElasticSearch = require('../../models/elasticsearch/transaction.js');
var addressElasticSearch = require('../../models/elasticsearch/address.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const addTransaction = async (id, data) => {
  try {
    const body = await transactionElasticSearch.create(id, data);
    console.log("[EXPLORER TRANSACTION CREATE]", body);
  } catch (err) {
    console.log("[EXPLORER TRANSACTION ERROR]", err);
  }
}

const addAddress = async (id, data) => {
  try {
    const body = await addressElasticSearch.update(id, data);
    console.log("[EXPLORER ADDRESS CREATE]", body);
  } catch (err) {
    console.log("[EXPLORER ADDRESS ERROR]", err);
  }
}
 
var consumer = Consumer.create({
    queueUrl: process.env.AWS_TRANSACTION_RECEIPT_QUEUE_URL,
    handleMessage: function (message, done) {
        var data = JSON.parse(message.Body);
        console.log('[TRANSACTION RECEIPT] transactionHash: ' + data.transactionHash);
        var eventListener = new EventListenerHelper();
        eventListener.filterWatch(data.transactionHash, function(transactionInfo, transactionReceiptInfo, blockInfo) {
            console.log('[TRANSACTION RECEIPT] transaction info: ', transactionInfo);
            console.log('[TRANSACTION RECEIPT] transaction receipt info: ', transactionReceiptInfo);
            console.log('[TRANSACTION RECEIPT] block info: ', blockInfo);
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
                "gas": transactionReceiptInfo.gasUsed,
                "transactionInfo": transactionInfo,
                "transactionReceiptInfo": transactionReceiptInfo
            };
            addTransaction(data.transactionHash, entity);
            addAddress(transactionInfo.from, transactionReceiptInfo);
            if (data.contractId) {
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
            } else if (data.webhook) {
                console.log('[DIRECT MINED] Data mined, transactionHash: ' + data.transactionHash + ', webhook: ' + data.webhook);
                requestHelper.post(data.webhook, transactionInfo);
            }
        });
        done();
    },
    sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();