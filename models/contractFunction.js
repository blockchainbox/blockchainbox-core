var pool = require(__dirname + '/dbConnectionPool.js');

function ContractFunction() {}

ContractFunction.prototype.readAll = function() {
    return pool.query('SELECT * FROM contractFunction');
};

ContractFunction.prototype.read = function(id) {
    return pool.query('SELECT * FROM contractFunction WHERE id = $1', [id]);
};

ContractFunction.prototype.readByContractId = function(contractId) {
	return pool.query('SELECT * FROM contractFunction WHERE contractId = $1', [contractId]);
}

ContractFunction.prototype.create = function(entity) {
    return pool.query("SELECT nextval(pg_get_serial_sequence('contractFunction', 'id')) as id;").then(function(result) {
        var id = result.rows[0].id;
	    return pool.query('INSERT INTO contractFunction (id, contractId, functionName, functionParameters, createTimestamp) VALUES ($1, $2, $3, $4, now())', 
	    	[id, entity.contractId, entity.functionName, entity.functionParameters]).then(function(){
            return id;
        }).catch(function (err) {
            console.log(err.message, err.stack);
        });
	}).catch(function(err){
		console.log(err.message, err.stack);
	});
};

ContractFunction.prototype.update = function() {

};

ContractFunction.prototype.delete = function() {

};

exports = module.exports = new ContractFunction();
