# Azure Video Indexer Desk

## Deploy the solution
[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

## Development

### Using Docker Environment

You can use Docker and a Compose file to develop on your local machine.  
Just use `docker-compose up` to build and start the containers.
After building you can use `docker-compose start` or `docker-compose stop` to start or stop containers.

To delete your environment use `docker-compose down`
### Azure Function App

1. Create local.settings.json in `./functionapp`
```
{
    "IsEncrypted": false,
    "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsStorage": "{AzureWebJobsStorage}",
        "BLOB_STORAGE_NAME": "<name of webstore* Storage Account>",
        "BLOB_STORAGE_KEY": "<key of webstore* Storage Account>",
        "VIDEO_INDEXER_ACCOUNT_ID": "<Account Id of your Video Indexer",
        "VIDEO_INDEXER_SUBSCRIPTION_KEY": "<Subscription Key of your Video Indexer>",
        "VIDEO_INDEXER_REGION": "<Region of your Video Indexer>",
        "VIDEO_INDEXER_FINISHED_HOOK": "<Function URL in Azure OnIndexingFinished with Auth Key, or ngrok tunnel>",
        "COSMOSDB_CONNECTION": "<Connection String of cbd-* CosmosDB>"
    }
}
```

2. Dockerized Environment
   1. Install node_modules with `docker-compose run functionapp npm install`

### Frontend

1. Create .env in `./frontend`
```
BLOB_STORAGE_NAME=<name of webstore* Storage Account>
BLOB_STORAGE_KEY=<key of webstore* Storage Account>
COSMOS_CONNECTION=<Connection String of cbd-* CosmosDB>
```

2. For local development:
   1. Install node 8.4.x / Use NVS
   2. Install NestJS CLI: `npm install @nestjs/cli@6.6.3 -g`

2. Dockerized Environment
   1. Install node_modules with `docker-compose run frontend npm install`