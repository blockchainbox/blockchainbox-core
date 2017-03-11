var pool = require(__dirname + '/dbConnectionPool.js');

function Account() {}

Account.prototype.readAll = function() {
    return pool.query('SELECT * FROM account');
};

Account.prototype.read = function(address) {
    return pool.query('SELECT * FROM account WHERE address = $1', [id]);
};

Account.prototype.create = function(entity) {
    return pool.query('INSERT INTO Account (address, passphrase, createTimestamp) VALUES ($1, $2, now())', 
    	[entity.address, entity.passphrase]);
};

exports = module.exports = new Account();
