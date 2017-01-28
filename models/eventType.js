var pool = require(__dirname + '/dbConnectionPool.js');

function EventType() {}

EventType.prototype.readAll = function() {
    return pool.query('SELECT * FROM eventtype');
};

EventType.prototype.read = function(id) {
    return pool.query('SELECT * FROM eventtype WHERE id = $1', [id]);
};

EventType.prototype.create = function(id) {
    return pool.query('SELECT * FROM eventtype WHERE id = $1', [id]);
};

EventType.prototype.update = function() {

};

EventType.prototype.delete = function() {

};

exports = module.exports = new EventType();