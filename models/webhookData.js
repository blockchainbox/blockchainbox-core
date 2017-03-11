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
	return pool.query('SELECT * FROM webhookdata WHERE contractId = $1 AND contractFunctionId IS NULL'
		+ ' AND contractEventId IS NULL AND status = true', [contractId]);
}

WebhookData.prototype.readByContractFunctionId = function(contractFunctionId) {
	return pool.query('SELECT * FROM webhookdata WHERE contractFunctionId = $1 AND status = true', 
		[contractFunctionId]);
}

WebhookData.prototype.readByContractEventId = function(contractEventId) {
	return pool.query('SELECT * FROM webhookdata WHERE contractEventId = $1 AND status = true', 
		[contractEventId]);
}

WebhookData.prototype.create = function(entity) {
	if (entity.contractFunctionId) {
		return pool.query('INSERT INTO webhookdata '
	    	+ '(contractId, contractFunctionId, contractEventId, url, status, createTimestamp) '
	    	+ ' SELECT $1, $2, $3, true, now() '
			+ ' WHERE NOT EXISTS ( '
			+ ' SELECT 1 FROM webhookdata WHERE contractId = $4 AND contractFunctionId = $5 '
			+ ' AND url = $6) RETURNING id', 
			[entity.contractId, entity.contractFunctionId, entity.url,
			entity.contractId, entity.contractFunctionId, entity.url]);
	} else if (entity.contractEventId) {
		return pool.query('INSERT INTO webhookdata '
	    	+ '(contractId, contractEventId, url, status, createTimestamp) '
	    	+ ' SELECT $1, $2, $3, true, now() '
			+ ' WHERE NOT EXISTS ( '
			+ ' SELECT 1 FROM webhookdata WHERE contractId = $4 AND contractEventId = $5 '
			+ ' AND url = $6) RETURNING id', 
			[entity.contractId, entity.contractEventId, entity.url,
			entity.contractId, entity.contractEventId, entity.url]);
	} else if (entity.contractId) {
		return pool.query('INSERT INTO webhookdata '
	    	+ '(contractId, url, status, createTimestamp) '
	    	+ ' SELECT $1, $2, true, now() '
			+ ' WHERE NOT EXISTS ( '
			+ ' SELECT 1 FROM webhookdata WHERE contractId = $3 AND contractEventId IS NULL '
			+ ' AND contractFunctionId IS NULL AND url = $4) RETURNING id', 
			[entity.contractId, entity.url, entity.contractId, entity.url]);
	}
};

WebhookData.prototype.update = function() {

};

WebhookData.prototype.delete = function(id) {
	return pool.query('DELETE FROM webhookdata WHERE id = $1', [id]);
};

exports = module.exports = new WebhookData();
