var pool = require(__dirname + '/dbConnectionPool.js');

function Contract() {}

Contract.prototype.UNCONFIRMED = 'UNCONFIRMED';
Contract.prototype.PENDING = 'PENDING';
Contract.prototype.CONFIRMED = 'CONFIRMED';
Contract.prototype.FAILED = 'FAILED';

Contract.prototype.readAll = function() {
    return pool.query('SELECT * FROM contract');
};

Contract.prototype.read = function(id) {
    return pool.query('SELECT * FROM contract WHERE id = $1', [id]);
};

Contract.prototype.create = function(entity) {
	return pool.query("SELECT nextval(pg_get_serial_sequence('contractEvent', 'id')) as id;").then(function(result) {
        var id = result.rows[0].id;
	    return pool.query("INSERT INTO contract (id, name, sourceCode, byteCode, language, compilerVersion, abi, createTimestamp, gasEstimates, status) VALUES " +
	        "($1, $2, $3, $4, $5, $6, $7, now(), $8, $9)",
	        [id, entity.name, entity.sourceCode, entity.byteCode, entity.language, entity.compilerVersion, entity.abi, entity.gasEstimates, Contract.prototype.UNCONFIRMED])
	    .then(function(){
	        return id;
	    }).catch(function (err) {
            console.log(err.message, err.stack);
        });
	}).catch(function (err) {
        console.log(err.message, err.stack);
	});
};

Contract.prototype.update = function() {

};

Contract.prototype.updateTransactionHash = function(entity) {
	return pool.query("UPDATE contract SET transactionHash = $1, status = $2, createTimestamp = now() WHERE id = $3", 
		[entity.transactionHash, Contract.prototype.PENDING, entity.id]);
}

Contract.prototype.updateAddress = function(entity) {
	return pool.query("UPDATE contract SET address = $1, status = $2, createTimestamp = now() WHERE id = $3", 
		[entity.address, Contract.prototype.CONFIRMED, entity.id]);
}

Contract.prototype.delete = function() {

};

exports = module.exports = new Contract();
