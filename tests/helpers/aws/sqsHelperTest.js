var sqsHelper = require('../../../helpers/aws/sqsHelper.js');

//sqsHelper.list();
sqsHelper.send('{"contractId": 1}', process.env.AWS_CONTRACT_QUEUE_URL, 10, 'contract');
//sqsHelper.receive(process.env.AWS_CONTRACT_QUEUE_URL, 6000);