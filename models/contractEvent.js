var pool = require(__dirname + '/dbConnectionPool.js');

function ContractEvent() {}

ContractEvent.prototype.readAll = function() {
    return pool.query('SELECT * FROM contractEvent');
};

ContractEvent.prototype.read = function(id) {
    return pool.query('SELECT * FROM contractEvent WHERE id = $1', [id]);
};

ContractEvent.prototype.readByContractId = function(contractId) {
	return pool.query('SELECT * FROM contractEvent WHERE contractId = $1', [contractId]);
}

ContractEvent.prototype.create = function(entity) {
	return pool.query("SELECT nextval(pg_get_serial_sequence('contractEvent', 'id')) as id;").then(function(result) {
        var id = result.rows[0].id;
	    return pool.query('INSERT INTO contractEvent (id, contractId, eventName, eventParameters, createTimestamp) VALUES ($1, $2, $3, $4, now())', 
	    	[id, entity.contractId, entity.eventName, entity.eventParameters]).then(function(){
            return id;
        }).catch(function (err) {
            console.log(err.message, err.stack);
        });
	}).catch(function(err){
		console.log(err.message, err.stack);
	});
};

ContractEvent.prototype.update = function() {

};

ContractEvent.prototype.delete = function() {

};

exports = module.exports = new ContractEvent();