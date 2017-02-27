/**
 * Pool Use
 * Reference: https://github.com/brianc/node-pg-pool
 *
 * Prepare Statement
 * Reference: https://github.com/brianc/node-postgres/wiki/Parameterized-queries-and-Prepared-Statements#prepared-statements
 */

var pool = require(__dirname + '/dbConnectionPool.js');
var keccak_256 = require('js-sha3').keccak_256;

function TransactionData() {}

TransactionData.prototype.UNCONFIRMED = 'UNCONFIRMED';
TransactionData.prototype.PENDING = 'PENDING';
TransactionData.prototype.CONFIRMED = 'CONFIRMED';
TransactionData.prototype.FAILED = 'FAILED';

TransactionData.prototype.readAll = function() {
    return pool.query('SELECT * FROM transactiondata');
};

TransactionData.prototype.read = function(txHash) {
    return pool.query('SELECT * FROM transactiondata WHERE txHash = $1', [txHash]);
};

TransactionData.prototype.readByTransactionHash = function(transactionHash) {
    return pool.query('SELECT * FROM transactiondata WHERE transactionHash = $1', [transactionHash]);
};

TransactionData.prototype.readByContractId = function(contractId) {
    return pool.query('SELECT * FROM transactiondata WHERE contractFunctionId IN ('
        + 'SELECT id FROM contractFunction WHERE contractId = $1)', 
        [contractId]);
};

TransactionData.prototype.readByContractFunctionId = function(contractFunctionId) {
    return pool.query('SELECT * FROM transactiondata WHERE contractFunctionId = $1', [contractFunctionId]);
};

// TODO re-write here
TransactionData.prototype.create = function(entity) {
    return pool.query("SELECT nextval(pg_get_serial_sequence('transactiondata', 'txid')) as txId;").then(function(result) {
        var txId = result.rows[0].txid;
        var txHash = keccak_256(txId);
        console.log('[TRANSACTION CREATE] txId: ' + txId + ', txHash: ' + txHash);
        return pool.query("INSERT INTO transactiondata (txid, contractFunctionId, txhash, data, status, network, txtimestamp) " +
            "values ($1, $2, $3, $4, $5, $6, now())",
            [txId, entity.contractFunctionId, txHash, entity.data, TransactionData.prototype.UNCONFIRMED, 'testnet']).then(function(){
            return txHash;
        }).catch(function (err) {
            console.log(err.message, err.stack);
        });
    }).catch(function (err) {
        console.log(err.message, err.stack);
    });
};

TransactionData.prototype.update = function(entity) {
    return pool.query("UPDATE transactiondata SET " +
        "transactionhash = $1, status = $2, blocknumber = $3, blockhash = $4, fromAddress = $5, updateTimestamp = now() WHERE txhash = $6",
        [entity.transactionHash, entity.status, entity.blockNumber, entity.blockHash, entity.fromAddress, entity.txHash]);
};

TransactionData.prototype.updateByTxHash = function(entity) {
    return pool.query("UPDATE transactiondata SET " + 
        "transactionhash = $1, status = $2, fromAddress = $3, updateTimestamp = now() WHERE txhash = $4",
        [entity.transactionHash, entity.status, entity.fromAddress, entity.txHash]);
};

TransactionData.prototype.delete = function(txHash) {
    return pool.query("DELETE transactiondata WHERE txHash = $1", [txHash]);
};

TransactionData.prototype.updateByTransactionHash = function(entity) {
    return pool.query("UPDATE transactiondata SET " +
        "status = $1, blocknumber = $2, blockhash = $3, updateTimestamp = now(), gasUsed = $4 WHERE transactionHash = $5",
        [entity.status, entity.blockNumber, entity.blockHash, entity.gas, entity.transactionHash]);
};

exports = module.exports = new TransactionData();
