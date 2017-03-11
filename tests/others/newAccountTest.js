var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));


var address = web3.personal.newAccount('test');
console.log(address);

// Unlock account: http://ethereum.stackexchange.com/questions/3996/error-personal-unlockaccount-method-not-implemented
// Should add this on geth: `geth ... --rpcapi="db,eth,net,web3,personal,web3"`