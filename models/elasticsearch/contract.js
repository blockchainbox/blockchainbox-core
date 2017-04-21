var elasticsearch = require('elasticsearch');

function Contract() {}

const index = 'blockchainbox'
const type = 'contract'

var client = new elasticsearch.Client({
  host: process.env.AWS_ELASTICSEARCH || 'localhost:32780',
  log: 'trace'
});

Contract.prototype.get = function(id) {
  return client.get({
    "index": index,
    "type": type,
    "id": id
  });
};

Contract.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Contract.prototype.update = function(id, partial) {
  return client.update({
    "index": index,
    "type": type,
    "id": id,
    "body": partial
  });
};

Contract.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": {"contract": data}
  });
};

Contract.prototype.delete = function(id) {
  return client.delete({
    "index": index,
    "type": type,
    "id": id
  })
};

Contract.prototype.exists = function(id) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  });
};

Contract.prototype.count = function() {
  return client.count({
    "index": index,
    "type": type
  });
}

exports = module.exports = new Contract();
