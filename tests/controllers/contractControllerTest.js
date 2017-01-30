var contractController = require('../../controllers/contractController.js');

var entity = {
	"contractId": 16,
	"contractFunctionId": 16,
	"data": ['xxx'],
	"txHash": ""
};
console.log(contractController.setContractFunctionData(entity);
//console.log(contractController.setContractFunctionData(16, 18, {param1:'xxx', param2:'abc'}));
