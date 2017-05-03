var pool = require(__dirname + '/dbConnectionPool.js');

function Address() {}

Address.prototype.readAll = function() {
    return pool.query('SELECT * FROM address');
};

Address.prototype.read = function(address) {
    return pool.query('SELECT * FROM address WHERE address = $1', [address]);
};

Address.prototype.create = function(entity) {
    return pool.query('INSERT INTO address (address, passphrase, accountid, token, createTimestamp) VALUES ($1, $2, $3, $4, now())', 
    	[entity.address, entity.passphrase, entity.accountId, entity.token]);
};

exports = module.exports = new Address();
