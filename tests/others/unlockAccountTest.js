var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

console.log(web3.personal.listAccounts());
console.log(web3.personal.unlockAccount(web3.eth.coinbase, "password", 1000));

// Unlock account: http://ethereum.stackexchange.com/questions/3996/error-personal-unlockaccount-method-not-implemented
// Should add this on geth: `geth ... --rpcapi="db,eth,net,web3,personal,web3"`