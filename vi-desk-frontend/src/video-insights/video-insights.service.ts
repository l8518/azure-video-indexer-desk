import { Injectable } from '@nestjs/common';
import { CosmosClient, SqlQuerySpec } from '@azure/cosmos';
import { SharedKeyCredential, generateAccountSASQueryParameters, SASQueryParameters, AccountSASPermissions, AccountSASResourceTypes, AccountSASServices, StorageURL, BlobURL, Aborter } from "@azure/storage-blob";
import { isNullOrUndefined } from 'util';

const COSMOS_CONNECTION = process.env["COSMOS_CONNECTION"];

const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];
const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);

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

    prepareFaces(videoId, faces: Array<any>, identifiedOnly = false) {

        let storageSASParams = this.getSASString(storageSharedKeyCredential);
        const containerURL = `https://${BLOB_STORAGE_NAME}.blob.core.windows.net/faceimgs`;

        if (identifiedOnly) {
            faces = faces.filter((value) => {
                return (!isNullOrUndefined(value.referenceId))
            })
            
        }
        // Process and return face data
        let preparedFaces = faces.map((value: any, index: number, array: any[]) => {
            // Upload faces async to Blob Storage
            let fName = videoId + "/" + `FaceThumbnail_${value.thumbnailId}.jpg`;
            return {
                uri: `${containerURL}/${fName}?${storageSASParams}`
            }
        });
        return preparedFaces;
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

        let accSASSignatureValues = {
            expiryTime: expiryDate,
            permissions: "r",
            // protocol: SASProtocol.HTTPS,
            resourceTypes: "o",
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
