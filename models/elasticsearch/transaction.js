var BigNumber = require('bignumber.js');
var elasticsearch = require('elasticsearch');

function Transaction() {}

const index = 'blockchainbox'
const type = 'tx'

var client = new elasticsearch.Client({
  host: 'localhost:32780',
  log: 'trace'
});

Transaction.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Transaction.prototype.update = function(id, partial) {
  return client.update({
    "index": index,
    "type": type,
    "id": id,
    "body": partial
  });
};

Transaction.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": {"transactionInfo": data}
  });
};

Transaction.prototype.delete = function(id) {
  return client.delete({
    "index": index,
    "type": type,
    "id": id
  })
};

Transaction.prototype.exists = function(id) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  });
};

Transaction.prototype.count = function() {
  return client.count({
    "index": index,
    "type": type
  });
}

exports = module.exports = new Transaction();
