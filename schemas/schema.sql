CREATE TABLE IF NOT EXISTS Contract (
	id serial primary key,
	name text,
	sourceCode text,
	byteCode text,
	language text,
	compilerVersion text,
	abi text,
	address text,
	transactionHash text,
	createTimestamp timestamp with time zone,
	gasEstimates integer,
	gasUsed integer,
	status text
);

ALTER TABLE Contract
	OWNER TO root;

CREATE TABLE IF NOT EXISTS ContractEvent (
	id serial primary key,
	contractId integer, -- FK: Contract.id
	contractFunctionId integer, -- FK: ContractFunction.id
	eventName text,
	eventParameters text,
	createTimestamp timestamp with time zone
);

ALTER TABLE ContractEvent
	OWNER TO root;

CREATE TABLE IF NOT EXISTS ContractFunction (
	id serial primary key,
	contractId integer, -- FK: Contract.id
	functionName text,
	functionParameters text,
	constant boolean,
	createTimestamp timestamp with time zone
);

ALTER TABLE ContractFunction
	OWNER TO root;

CREATE TABLE IF NOT EXISTS TransactionData (
	txId serial primary key,
	txHash text,
	contractFunctionId integer, -- FK: contractFunction.id
	transactionHash text,	-- which transactionHash
	data text, -- json format
	status text, -- UNCONFIRM, PENDING, CONFIRMED, FAILED
	network text, -- testnet, public, private
	txTimestamp timestamp with time zone,
	updateTimestamp timestamp with time zone,
	blockNumber bigint,
	blockHash text,
	fromAddress text,
	gasUsed integer
);

ALTER TABLE TransactionData
  OWNER TO root;

CREATE TABLE IF NOT EXISTS EventData (
	id serial primary key,
	contractEventId integer,
	txHash text,
	transactionHash text,	-- reference to transactionHash
	blockNumber integer,
	blockHash text,
	address text,
	event text,	-- event name
	data text,	-- event data, transactionData.dataHash will belong here
	createTimestamp timestamp with time zone
);

ALTER TABLE EventData
  OWNER TO root;

CREATE TABLE IF NOT EXISTS WebhookData (
	id serial primary key,
	contractId integer,
	contractEventId integer,
	contractFunctionId integer, -- have PENDING, CONFIRMED, etc
	url text,
	createTimestamp timestamp with time zone,
	status boolean
);

ALTER TABLE WebhookData
  OWNER TO root;

CREATE TABLE IF NOT EXISTS Account (
	id serial primary key,
	address text,
	passphrase text,	-- hash
	createTimestamp timestamp with time zone
);

ALTER TABLE Account
  OWNER TO root;