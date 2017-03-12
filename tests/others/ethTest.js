var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(process.env.ENODE_BASE || 'http://localhost:8545'));

var info = web3.eth.getCode('0x7679636c99120830c5f96986147cdbee85ee7379');
console.log(info);

// Unlock account: http://ethereum.stackexchange.com/questions/3996/error-personal-unlockaccount-method-not-implemented
// Should add this on geth: `geth ... --rpcapi="db,eth,net,web3,personal,web3"`
