var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var webhookData = require('../../models/webhookData.js');
var transactionData = require('../../models/transactionData.js');
var eventData = require('../../models/eventData.js');
var requestHelper = require('../../helpers/requestHelper.js');
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
 
var consumer = Consumer.create({
	queueUrl: process.env.AWS_WEBHOOK_QUEUE_URL,
	handleMessage: function (message, done) {
    var data = JSON.parse(message.Body);
    console.log('[WEBHOOK] receive data: ', data);
    var transactionHash = data.transactionHash;
    // send by contractFunctionId
    if (data.contractFunctionId) {
      transactionData.readByTransactionHash(transactionHash).then(function(result) {
        result.rows.forEach(function(transactionDataDetail) {
          webhookData.readByContractFunctionId(data.contractFunctionId).then(function(webhookDataResult) {
            if (webhookDataResult.rowCount > 0) {
              webhookDataResult.rows.forEach(function(item){
                console.log('[CONTRACT FUNCTION WEBHOOK] url: ' + item.url + ", data: " + JSON.stringify(transactionDataDetail, null, 2));
                requestHelper.post(item.url, transactionDataDetail);
              });
            }
          }).catch(function(err) {
            console.log(err.message, err.stack);
          });
        });
      }).catch(function(err) {
        console.log(err.message, err.stack);
      });
    }
    // send by contractEventId
    if (data.contractEventId) {
      eventData.readByTransactionHash(transactionHash).then(function(result) {
        result.rows.forEach(function(eventDataDetail) {
          webhookData.readByContractEventId(data.contractEventId).then(function(webhookDataResult) {
            if (webhookDataResult.rowCount > 0) {
              webhookDataResult.rows.forEach(function(item){
                console.log('[CONTRACT EVENT WEBHOOK] url: ' + item.url + ", data: " + JSON.stringify(eventDataDetail, null, 2));
                requestHelper.post(item.url, eventDataDetail);
              });
            }
          }).catch(function(err) {
            console.log(err.message, err.stack);
          });
        });
      }).catch(function(err) {
        console.log(err.message, err.stack);
      });
    }
    // send by contractId
    if (data.contractId) {
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
              webhookData.readByContractId(data.contractId).then(function(webhookDataResult) {
                if (webhookDataResult.rowCount > 0) {
                  webhookDataResult.rows.forEach(function(item){
                    console.log('[CONTRACT WEBHOOK] url: ' + item.url + ", data: " + JSON.stringify(info, null, 2));
                    requestHelper.post(item.url, info);
                  });
                }
              })
            })
          })
        })
      });
    }
		done();
	},
  sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();