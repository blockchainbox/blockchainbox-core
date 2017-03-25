var elasticsearch = require('elasticsearch');

function Block() {}

const index = 'blockchainbox'
const type = 'block'

var client = new elasticsearch.Client({
  host: 'localhost:32780',
  log: 'trace'
});

Block.prototype.get = function(id) {
  return client.search({
    "index": index,
    "type": type,
    "id": id
  });
};

Block.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Block.prototype.update = function(id, partial) {
  return client.update({
    "index": index,
    "type": type,
    "id": id,
    "body": partial
  });
};

Block.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": {"blockInfo": data}
  });
};

Block.prototype.delete = function(id) {
  return client.delete({
    "index": index,
    "type": type,
    "id": id
  })
};

Block.prototype.exists = function(id) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  });
};

Block.prototype.count = function() {
  return client.count({
    "index": index,
    "type": type
  });
}

exports = module.exports = new Block();
