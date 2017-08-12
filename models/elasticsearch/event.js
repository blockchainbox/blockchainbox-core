var elasticsearch = require('elasticsearch');

function Event() {}

const index = 'blockchainbox'
const type = 'event'

var client = new elasticsearch.Client({
  host: process.env.AWS_ELASTICSEARCH || 'localhost:32780',
  log: 'trace'
});

Event.prototype.get = function(id) {
  return client.get({
    "index": index,
    "type": type,
    "id": id
  });
};

Event.prototype.search = function(query) {
  return client.search({
    "index": index,
    "type": type,
    "q": query
  });
};

Event.prototype.update = function(id, partial) {
  return client.update({
    "index": index,
    "type": type,
    "id": id,
    "body": partial
  });
};

Event.prototype.create = function(id, data) {
  return client.create({
    "index": index,
    "type": type,
    "id": id,
    "body": data
  });
};

Event.prototype.delete = function(id) {
  return client.delete({
    "index": index,
    "type": type,
    "id": id
  })
};

Event.prototype.exists = function(id) {
  return client.exists({
    "index": index,
    "type": type,
    "id": id
  });
};

Event.prototype.count = function() {
  return client.count({
    "index": index,
    "type": type
  });
}

exports = module.exports = new Event();
