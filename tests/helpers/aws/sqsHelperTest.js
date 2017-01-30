var sqsHelper = require('../../../helpers/aws/sqsHelper.js');

//sqsHelper.list();

var message = {
	"contractId": 1
};
sqsHelper.send(JSON.stringify(message), 
	process.env.AWS_CONTRACT_QUEUE_URL, 10, 
	'contract');
//sqsHelper.receive(process.env.AWS_CONTRACT_QUEUE_URL, 6000);