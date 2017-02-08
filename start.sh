npm install && npm run start
pm2 delete blockchainbox-core
pm2 delete blockchainbox-core-contract-consumer
pm2 delete blockchainbox-core-transaction-consumer
pm2 delete blockchainbox-core-transaction-receipt-consumer
pm2 delete blockchainbox-core-event-consumer
pm2 start blockchainbox-core.json
pm2 show blockchainbox-core
pm2 show blockchainbox-core-contract-consumer
pm2 show blockchainbox-core-transaction-consumer
pm2 show blockchainbox-core-transaction-receipt-consumer
pm2 show blockchainbox-core-event-consumer
pm2 save