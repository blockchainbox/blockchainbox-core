var BigNumber = require('bignumber.js');
var elasticsearch = require('elasticsearch');

function Transaction() {}

const index = 'blockchainbox'
const type = 'tx'

var client = new elasticsearch.Client({
  host: process.env.AWS_ELASTICSEARCH || 'localhost:32780',
  log: 'trace'
});

Transaction.prototype.get = function(id) {
  return client.get({
    "index": index,
    "type": type,
    "id": id
  });
};

Transaction.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Transaction.prototype.update = function(id, partial) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  }).then(function(result) {
    console.log(result);
    if (result == true) {
      console.log(partial);
      return client.update({
        "index": index,
        "type": type,
        "id": id,
        "body": {
          "script": {
            "lang": "painless",
            "inline": "ctx._source.transactions.add(params.transactions)",
            "params": {
              "transactions": partial
            }
          }
        }
      });
    } else {
      return client.create({
        "index": index,
        "type": type,
        "id": id,
        "body": {transactions: [partial]}
      });
    }
  })
};

Transaction.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": data
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
