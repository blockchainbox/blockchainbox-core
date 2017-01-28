var AWS = require('aws-sdk');
function SqsHelper() {}


// Load AWS credentials and try to instantiate the object.
//AWS.config.loadFromPath(__dirname + '/config.json');

// Instantiate SQS.
var sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


//List queues
SqsHelper.prototype.list = function() {
    sqs.listQueues(function(err, data) {
        if(err) {
            console.log(err);
        } 
        else {
            console.log(data);
        } 
    });
};

// Creating a queue.
SqsHelper.prototype.create = function(queueName) {

	var params = {
        QueueName: queueName
    };

    sqs.createQueue(params, function(err, data) {
        if(err) {
             console.log(err);
        } 
        else {
             console.log(data);
        } 
    });
};


// Send a message
SqsHelper.prototype.send = function(messageBody, queueUrl, delaySeconds, messageGroupId) {
    var date = new Date().getTime();
	var params = {
        MessageBody: messageBody,
        QueueUrl: queueUrl,
        //DelaySeconds: delaySeconds,
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: date.toString()
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
             console.log(err);
        } 
        else {
             console.log( data);
        } 
    });
};


//Receive a message
SqsHelper.prototype.receive = function(queueUrl, visibilityTimeout) {

	var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: visibilityTimeout
    };
    
    sqs.receiveMessage(params, function(err, data) {
        if(err) {
             console.log(err);
        } 
        else {
             console.log('receive:  ' + data['Messages'][0]['Body']);
        } 
    });
};

//Delete a message
SqsHelper.prototype.delete = function(queueUrl, receipt) {

	var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };
    
    sqs.deleteMessage(params, function(err, data) {
        if(err) {
             console.log(err);
        } 
        else {
             console.log(data);
        } 
    });
};

//purge a queue
SqsHelper.prototype.purge = function(queueUrl) {

	 var params = {
        QueueUrl: queueUrl
    };
    
    sqs.purgeQueue(params, function(err, data) {
        if(err) {
             console.log(err);
        } 
        else {
             console.log(data);
        } 
    });
};

exports = module.exports = new SqsHelper();