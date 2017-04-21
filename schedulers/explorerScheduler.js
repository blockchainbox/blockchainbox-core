var schedule = require('node-schedule');

var job = schedule.scheduleJob('*/1 * * * *', function(){
	// 要透過
	// getBlock
	// get from transactionHash array -> getTransaction
	// get from transactionHash array -> getTransactionReceipt


	// 每多少秒判斷一次，目前 block 的數量為何，然後再爬剩下的，一次最多不超過 100 個

});
