var contractController = require('../../controllers/contractController.js');

var entity = {
	"contractId": 16,
	"contractFunctionId": 16,
	"data": ['xxx'],
	"txHash": ""
};
console.log(contractController.setContractFunctionData(entity);
//console.log(contractController.setContractFunctionData(16, 18, {param1:'xxx', param2:'abc'}));

var sourceCode = "contract ProofOfTransaction {bytes32 public dataHash;mapping (string => bytes32) dataHashMap;event setDataHashEvent(address from, string txHash, bytes32 dataHash, uint time);event getDataHashEvent(address from, string txHash, bytes32 dataHash, uint time);function setData(string txHash, string data) {dataHash = sha3(data);dataHashMap[txHash] = dataHash;setDataHashEvent(msg.sender, txHash, dataHash, now);}function getDataHash(string txHash) returns (bytes32) {dataHash = dataHashMap[txHash];getDataHashEvent(msg.sender, txHash, dataHash, now);if (dataHash == 0) {return \"\";} else {return dataHash;}}}";
contractController.deployContract(sourceCode).then(function(result){
	console.log('RESULT: ', result)
});
