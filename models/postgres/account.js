var pool = require(__dirname + '/dbConnectionPool.js');

function Account() {}

Account.prototype.readAll = function() {
    return pool.query('SELECT * FROM account');
};

Account.prototype.read = function(account) {
    return pool.query('SELECT * FROM account WHERE account = $1', [account]);
};

Account.prototype.create = function(entity) {
	return pool.query("SELECT nextval(pg_get_serial_sequence('account', 'id')) as id;").then(function(result) {
        var id = result.rows[0].id;
	    return pool.query("INSERT INTO Account (id, account, password, createTimestamp) VALUES ($1, $2, $3, now())",
	        [id, entity.account, entity.password])
	    .then(function(){
	        return id;
	    }).catch(function (err) {
            console.log(err.message, err.stack);
        });
	}).catch(function (err) {
        console.log(err.message, err.stack);
	});
};

exports = module.exports = new Account();
