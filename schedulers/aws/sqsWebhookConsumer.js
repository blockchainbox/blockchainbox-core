var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var webhoodData = require('../../models/webhoodData.js');
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
    var transactionHash = data.transactionHash;
    // send by contractFunctionId
    if (data.contractFunctionId) {
      transactionData.readByTransactionHash(transactionHash).then(function(result) {
        result.rows.forEach(function(transactionDataDetail) {
          webhoodData.readByContractFunctionId(data.contractFunctionId).then(function(webhookDataResult) {
            if (webhookDataResult.row.count > 0) {
              webhookDataResult.rows.forEach(function(item){
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
          webhoodData.readByContractEventId(data.contractEventId).then(function(webhookDataResult) {
            if (webhookDataResult.row.count > 0) {
              webhookDataResult.rows.forEach(function(item){
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
		done();
	},
  sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();