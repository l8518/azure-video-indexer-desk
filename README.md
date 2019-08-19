# 1. Azure Video Indexer Desk

## 1.1 Deploy the solution
During deployment you will be asked to provide the following values:
- Website Name → Use your globally unique name like the name of the resource group
- Video Indexer Account Id → Check instructions in 1.2
- Video Indexer Subscription Key → Check instructions in 1.2
- Video Indexer Region → Use your region of the Video Indexer, usually `trial`

[*Check example screen*](./docs/deployment_button.png)

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

## 1.2 Retrieve Video Indexer Access Credentials

1. Go to [www.videoindexer.ai](https://www.videoindexer.ai/account/login) or check [vi.microsoft.com](http://vi.microsoft.com/) for more information 
2. Follow the setup steps if you login for the first time.
3. **Retrieve your Account ID:** Click on your profile picture and select *Settings* → Navigate to tab *Account* and copy your Account ID 
4. **Retrieve your Subscription Key:** Go to [api-portal.videoindexer.ai/developer](https://api-portal.videoindexer.ai/developer) and obtain your Primary Key  
   Your key looks something like this: `3907a0ff602142e79f0c67f9248698b4`

# 2. Development 

## 2.1. Setup Fork / Own CI/CD

1. Fork Github Repository 
2. Setup Azure Devops Pipeline
   1. Install Azure Piplelines via GitHub Marketplace
   2. Create new DevOps Project
   3. Add Service Connection with name `DevOps GitHub Release SC`  
   Go: → Project Settings → Service Connections → New service connection → Select GitHub → Select `Grant authorization` → Put in `DevOps GitHub Release SC` into Connection Name

## 2.2 Development

### Using Docker Environment

You can use Docker and a Compose file to develop on your local machine.  

You need to install the required npm packages first, thus:
- Install frontend packages `docker-compose run frontend npm install`
- Install function packages `docker-compose run functionapp npm install`

Then, just use `docker-compose up` to start the containers.
You can use `docker-compose start` or `docker-compose stop` to start or stop your current containers.

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