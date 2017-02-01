var pool = require(__dirname + '/dbConnectionPool.js');

function EventData() {}

EventData.prototype.readAll = function() {
    return pool.query('SELECT * FROM eventdata');
};

EventData.prototype.read = function(txHash) {
    return pool.query('SELECT * FROM eventdata WHERE txHash = $1', [txHash]);
};

EventData.prototype.create = function(entity) {
    return pool.query('INSERT INTO eventdata (contractEventId, transactionHash, name, data, createTimestamp) '
    	+ ' VALUES ($1, $2, $3, $4, now())',
    	[entity.contractEventId, entity.transactionHash, entity.name, entity.data]);
};

EventData.prototype.update = function() {

};

EventData.prototype.delete = function() {

};

exports = module.exports = new EventData();
