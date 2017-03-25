var pool = require(__dirname + '/dbConnectionPool.js');

function EventFilter() {}

EventFilter.prototype.readAll = function() {
    return pool.query('SELECT * FROM eventfilter');
};

EventFilter.prototype.read = function(id) {
    return pool.query('SELECT * FROM eventfilter WHERE id = $1', [id]);
};

EventFilter.prototype.create = function(id) {
    return pool.query('SELECT * FROM eventfilter WHERE id = $1', [id]);
};

EventFilter.prototype.update = function() {

};

EventFilter.prototype.delete = function() {

};

exports = module.exports = new EventFilter();
