import { Injectable } from '@nestjs/common';
import { CosmosClient, SqlQuerySpec } from '@azure/cosmos';

const COSMOS_CONNECTION = process.env["COSMOS_CONNECTION"];

@Injectable()
export class AppService {
  
  async bootstrap_check() {

    let client = new CosmosClient(COSMOS_CONNECTION);
    // check if db exists:
    const databaseDefinition = { id: "VideoIndexer" };
    const collectionDefinition = { id: "VideoIndexerInsights" };

    const { database } = await client.databases.create(databaseDefinition);
    const { container } = await database.containers.create(collectionDefinition);

  }
}
