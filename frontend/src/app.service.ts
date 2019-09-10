import { Injectable } from '@nestjs/common';
import { CosmosClient, SqlQuerySpec } from '@azure/cosmos';
import { SharedKeyCredential, generateAccountSASQueryParameters, SASQueryParameters, AccountSASPermissions, AccountSASResourceTypes, AccountSASServices } from "@azure/storage-blob";

const COSMOS_CONNECTION = process.env["COSMOS_CONNECTION"];
const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];
const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);

@Injectable()
export class AppService {
  
  async bootstrap_check() {

    let client = new CosmosClient(COSMOS_CONNECTION);
    // check if db exists:
    const databaseDefinition = { id: "VideoIndexer" };
    const collectionDefinition = { id: "VideoIndexerInsights" };

    const { database } = await client.databases.createIfNotExists(databaseDefinition);
    await database.containers.createIfNotExists(collectionDefinition);

  }

  getUploadURL() {
    let storageSASParams = this.getSASString(storageSharedKeyCredential);
    let url = `https://${BLOB_STORAGE_NAME}.blob.core.windows.net/filedrop?${storageSASParams}`;
    return url
}

    /**
* Generates the SAS Query Parameters for a specific time and permissions set.
* @param sharedKeyCredential 
*/
createSASQueryParameters(sharedKeyCredential): SASQueryParameters {
var startDate = new Date();
var expiryDate = new Date(startDate);
expiryDate.setMinutes(startDate.getMinutes() + 100);
startDate.setMinutes(startDate.getMinutes() - 100);

let accSASPermission = new AccountSASPermissions()
accSASPermission.read = true;

let accSASService = new AccountSASServices()
accSASService.blob = true

let accSASResourceType = new AccountSASResourceTypes();
accSASResourceType.object = true;
accSASResourceType.container = true;
let sasPerm = new AccountSASPermissions();
sasPerm.create = true;
sasPerm.add = true;
sasPerm.update = true;
sasPerm.write = true;

let accSASSignatureValues = {
    expiryTime: expiryDate,
    permissions: sasPerm.toString(),
    // protocol: SASProtocol.HTTPS,
    resourceTypes: accSASResourceType.toString(),
    services: "b",
    startTime: startDate
}

let queryParams = generateAccountSASQueryParameters(accSASSignatureValues, sharedKeyCredential)
return queryParams;
}

/**
* Retrieves as SAS String from the storage defined by the credentials.
* @param credentials 
*/
getSASString(credentials: SharedKeyCredential) {
// Use SharedKeyCredential with storage account and account key
// Get a SAS Token to grant public access for required operations
const amsStorageSASParamsString = this.createSASQueryParameters(credentials).toString();
return amsStorageSASParamsString
}

}
