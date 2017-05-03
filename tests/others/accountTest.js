var sha3_224 = require('js-sha3').sha3_224;

var account = "test@example.com";

console.log(sha3_224(account + ':passphrase:' + Math.random()));
console.log(sha3_224(account + ':token:' + Math.random()));
