/**
 * How to use exports 
 * Reference: https://987.tw/2014/03/08/export-this-node-jsmo-zu-de-jie-mian-she-ji-mo-shi/
 *
 * Connect AWS RDS from localhost: http://stackoverflow.com/questions/31181963/aws-rds-how-to-access-connect-to-rds-mysql-db-from-localhost
 */
var pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
    user: process.env.AWS_RDS_USER || 'root', //env var: PGUSER
    database: process.env.AWS_RDS_DATABASE || 'postgres', //env var: PGDATABASE
    password: process.env.AWS_RDS_PASSWORD || 'root', //env var: PGPASSWORD
    host: process.env.AWS_RDS_HOST || 'localhost', // Server hosting the postgres database
    port: process.env.AWS_RDS_PORT || 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

module.exports = pool;
