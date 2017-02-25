var pool = require(__dirname + '/dbConnectionPool.js');

function WebhookData() {}

/**
 * This should add user/member service on webhook data info
 */

WebhookData.prototype.readAll = function() {
    return pool.query('SELECT * FROM webhookdata');
};

WebhookData.prototype.read = function(id) {
    return pool.query('SELECT * FROM webhookdata WHERE id = $1', [id]);
};

WebhookData.prototype.readByContractId = function(contractId) {
	return pool.query('SELECT * FROM webhookdata WHERE contractId = $1 AND status = true', [contractId]);
}

WebhookData.prototype.readByContractFunctionId = function(entity) {
	return pool.query('SELECT * FROM webhookdata WHERE contractId = $1 '
		+ ' AND contractFunctionId = $2 AND status = true', 
		[entity.contractId, entity.contractFunctionId]);
}

WebhookData.prototype.readByContractEventId = function(entity) {
	return pool.query('SELECT * FROM webhookdata WHERE contractId = $1 '
		+ ' AND contractEventId = $2 AND status = true', 
		[entity.contractId, entity.contractEventId]);
}

WebhookData.prototype.create = function(entity) {
    return pool.query('INSERT INTO webhookdata '
    	+ '(contractId, contractFunctionId, contractEventId, url, status, createTimestamp) '
    	+ ' SELECT $1, $2, $3, $4, true, now() '
		+ ' WHERE NOT EXISTS ( '
		+ ' SELECT 1 FROM webhookdata WHERE contractId = $5 AND contractFunctionId = $6 AND contractEventId = $7 '
		+ ' AND url = $8 '
		+ ')', 
		[entity.contractId, entity.contractFunctionId, entity.contractEventId, entity.url,
		entity.contractId, entity.contractFunctionId, entity.contractEventId, entity.url]);
};

WebhookData.prototype.update = function() {

};

WebhookData.prototype.delete = function(id) {
	return pool.query('DELETE FROM webhookdata WHERE id = $1', [id]);
};

exports = module.exports = new WebhookData();
