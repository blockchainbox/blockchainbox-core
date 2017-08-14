var elasticsearch = require('elasticsearch');

function Address() {}

const index = 'blockchainbox'
const type = 'address'

var client = new elasticsearch.Client({
  host: process.env.AWS_ELASTICSEARCH || 'localhost:32780',
  log: 'trace'
});

Address.prototype.get = function(id) {
  return client.get({
    "index": index,
    "type": type,
    "id": id
  });
};

Address.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Address.prototype.update = function(id, transactionHash, partial) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  }).then(function(result) {
    if (result == true) {
      return client.update({
        "index": index,
        "type": type,
        "id": id,
        "body": {
          "script" : "ctx._source[\"" + transactionHash + "\"] = '" + JSON.stringify(partial) + "'"
        }
      });
    } else {
      return client.create({
        "index": index,
        "type": type,
        "id": id,
        "body": {[transactionHash]: JSON.stringify(partial)}
      });
    }
  })
};

Address.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": data
  });
};

Address.prototype.delete = function(id) {
  return client.delete({
    "index": index,
    "type": type,
    "id": id
  })
};

Address.prototype.exists = function(id) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  });
};

Address.prototype.count = function() {
  return client.count({
    "index": index,
    "type": type
  });
}

exports = module.exports = new Address();
