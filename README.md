# Blockchainbox - Ethereum API gateway
  
Blockchainbox 應用開發平台提供快速，簡單，易用，完整的 Ethereum API 接口，將部署智能合約過程簡化，讓開發者節省時間與成本。  
透過此平台將用戶，系統，資料都託管在 Blockchainbox 上，不但節約 Ethereum 的部屬成本，也無須負擔伺服器成本，資料庫儲存成本，網路頻寬，實現多方共贏。  
Blockchainbox 已將所有的應用服務與功能封裝，提供 Swagger UI，將 Restful 訪問接口可視化，開發者只需要專注於自己開發的項目即可，完全無需再多花時間掌握後端複雜的 Ethereum 區塊鏈技術。  
平台未來也將陸續提供其他開發者維運所需要的可視化管理工具(數據分析，流量分析)，讓開發者迅速掌握整個 Ethereum 與系統的各種狀況。

## Important changes

### v0.3
- Support authentication service
  - Support create system account and genereate accesstoken
  - Support export keystore
  - Configurable Ethereum keystore path

### v0.2.2
- Support create new ethereum account
- Support deploy contract with webhook

### v0.2.1
- Add scheduler to check for unfinished transaction

### v0.2.0
- Support contract transactions/events webhook

### v0.1.1
- Provide Swagger UI for APIs
- Support Ethereum APIs
- Support Contract
    - Deploy
    - Send transaction
    - Query transaction
    - Query event 

## Usage 
Swagger UI: http://localhost:3000/swagger

## Configuration

### Build on localhost

Use docker: https://github.com/blockchainbox/blockchainbox-docker

```
// use AWS SQS
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_REGION=
export AWS_CONTRACT_QUEUE_URL=
export AWS_TRANSACTION_QUEUE_URL=
export AWS_TRANSACTION_RECEIPT_QUEUE_URL=
export AWS_EVENT_QUEUE_URL=
export AWS_WEBHOOK_QUEUE_URL=
// unlock account by default
export COINBASE_PASSWORD=
// use AWS RDS
export AWS_RDS_USER=
export AWS_RDS_PASSWORD=
export AWS_RDS_DATABASE=
export AWS_RDS_HOST=
export AWS_RDS_PORT=
```