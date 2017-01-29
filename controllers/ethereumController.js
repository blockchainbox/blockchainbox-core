var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

function EthereumController() {}

EthereumController.prototype.getCompilers = function() {
	return web3.eth.getCompilers();
}

EthereumController.prototype.getCoinbase = function() {
	return web3.eth.coinbase;
}

EthereumController.prototype.getBalance = function(coinbase) {
	return web3.fromWei(web3.eth.getBalance(coinbase), "ether").toString(10) + ' ether';
}

exports = module.exports = new EthereumController();
