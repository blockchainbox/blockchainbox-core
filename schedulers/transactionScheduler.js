var transactionData = require('../models/postgres/transactionData.js');
var sqsHelper = require('../helpers/aws/sqsHelper.js');
var schedule = require('node-schedule');

var job = schedule.scheduleJob('*/10 * * * *', function(){
	transactionData.readUnfinishedTransaction().then(function(result) {
		if (result.rowCount > 0) {
			result.rows.forEach(function(item){
				var message = {
					"txHash": item.txhash,
					"contractId": item.contractid,
					"contractFunctionId": item.contractfunctionid,
					"data": JSON.parse(item.data)
				};
				sqsHelper.send(JSON.stringify(message), 
					process.env.AWS_TRANSACTION_QUEUE_URL, 10, 
					'transaction');
			});
		}
	}).catch(function(err){
		console.log(err.message, err.stack);
	});
});
