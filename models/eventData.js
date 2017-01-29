var pool = require(__dirname + '/dbConnectionPool.js');

function EventData() {}

EventData.prototype.readAll = function() {
    return pool.query('SELECT * FROM eventdata');
};

EventData.prototype.read = function(id) {
    return pool.query('SELECT * FROM eventdata WHERE id = $1', [id]);
};

EventData.prototype.create = function(entity) {
    
};

EventData.prototype.update = function() {

};

EventData.prototype.delete = function() {

};

exports = module.exports = new EventData();
