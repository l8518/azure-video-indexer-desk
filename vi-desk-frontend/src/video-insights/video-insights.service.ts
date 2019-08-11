import { Injectable } from '@nestjs/common';
import { CosmosClient, SqlQuerySpec } from '@azure/cosmos';

const COSMOS_CONNECTION = process.env["COSMOS_CONNECTION"];

@Injectable()
export class VideoInsightsService {
    private cosmosClient: CosmosClient;

    constructor() {

        this.cosmosClient = new CosmosClient(COSMOS_CONNECTION);
    }

    async findAll() {

        let sqlQuery: SqlQuerySpec = {
            query: 'SELECT vii.fileName, vii.id FROM VideoIndexerInsights vii'
        }

        let result = this.cosmosClient.database('VideoIndexer')
            .container('VideoIndexerInsights').items
            .query(sqlQuery);

        let resp = await result.fetchAll();
        console.log(resp);
        return resp;
    }

    async findOne(id: string) {

        let sqlQuery: SqlQuerySpec = {
            query: 'SELECT * FROM VideoIndexerInsights vii WHERE vii.id = @id',
            parameters: [
                { "name": "@id", "value": id }
            ]
        }

        let result = this.cosmosClient.database('VideoIndexer')
            .container('VideoIndexerInsights').items
            .query(sqlQuery);

        let resp = await result.fetchAll();
        return resp;
    }

}
