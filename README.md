# Azure Video Indexer Desk

## Deploy the solution
[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

## Development

### Azure Function App

```
{
    "IsEncrypted": false,
    "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsStorage": "{AzureWebJobsStorage}",
        "BLOB_STORAGE_NAME": "",
        "BLOB_STORAGE_KEY": "",
        "VIDEO_INDEXER_ACCOUNT_ID": "",
        "VIDEO_INDEXER_SUBSCRIPTION_KEY": "",
        "VIDEO_INDEXER_REGION": "",
        "VIDEO_INDEXER_FINISHED_HOOK": ""
    }
}
```

### Frontend

1. Use node 8.x
2. Install Nest.js CLI
3. Create .env in `./frontend`
```
BLOB_STORAGE_NAME=<name of webstore* Storage Account>
BLOB_STORAGE_KEY=<key of webstore* Storage Account>
COSMOS_CONNECTION=<AccountEndpoint of cbd-* CosmosDB>
```