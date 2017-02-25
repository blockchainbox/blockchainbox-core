var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var Web3 = require('web3');
var contractController = require('../../controllers/contractController.js');
var eventListener = require('../../helpers/eventListenerHelper.js');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
 
AWS.config.update({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
 
var consumer = Consumer.create({
	queueUrl: process.env.AWS_TRANSACTION_QUEUE_URL,
	handleMessage: function (message, done) {
    web3.personal.unlockAccount(web3.eth.coinbase, process.env.COINBASE_PASSWORD, 1000)
		var data = JSON.parse(message.Body);
		var entity = {
			"contractId": data.contractId,
			"contractFunctionId": data.contractFunctionId,
			"data": data.data,
			"txHash": data.txHash
		};
		contractController.setContractFunctionData(entity);
		done();
	},
	sqs: new AWS.SQS()
});

consumer.on('error', function (err) {
  console.log(err.message);
});
 
consumer.start();