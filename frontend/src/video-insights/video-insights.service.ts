import { Injectable, HttpService } from '@nestjs/common';
import { CosmosClient, SqlQuerySpec } from '@azure/cosmos';
import { SharedKeyCredential, generateAccountSASQueryParameters, SASQueryParameters, AccountSASPermissions, AccountSASResourceTypes, AccountSASServices, StorageURL, BlobURL, Aborter } from "@azure/storage-blob";
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

const COSMOS_CONNECTION = process.env["COSMOS_CONNECTION"];

const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];
const FUNCTION_GETPLAYER_ENDPOINT = process.env["FUNCTION_GETPLAYER_ENDPOINT"];
const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);

@Injectable()
export class VideoInsightsService {
    private cosmosClient: CosmosClient;

    constructor(private readonly httpService: HttpService) {

        this.cosmosClient = new CosmosClient(COSMOS_CONNECTION);
    }

    async findAll() {

        let sqlQuery: SqlQuerySpec = {
            query: 'SELECT vii.fileName, vii.id, vii.insights.labels, vii.insights.namedPeople FROM VideoIndexerInsights vii'
        }

        let result = this.cosmosClient.database('VideoIndexer')
            .container('VideoIndexerInsights').items
            .query(sqlQuery);

        let resp = await result.fetchAll();
        return resp;
    }

    filterAndTransformForTopNSignificantInstances(labels: Array<any>, n = 5) {
        if (isNullOrUndefined(labels)) {
            return labels;
        }

        // filters the labels with a confidence higher 90%
        labels = labels.map((value: any, index: number, array: any[]) => {
            let aggConfidence = value.instances.reduce((total, currentValue, currentIndex, arr) => {
                return total + currentValue.confidence
            }, 0)

            value.meanConfidence = (aggConfidence / value.instances.length).toPrecision(2)
            return value

        })

        // sort descending
        labels = labels.sort((a, b) => {
            return b.meanConfidence - a.meanConfidence;
        })

        return labels.slice(0, n);
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

    async lastId() {

        let sqlQuery: SqlQuerySpec = {
            query: 'SELECT TOP 1 vii.id FROM VideoIndexerInsights vii'
        }

        let result = this.cosmosClient.database('VideoIndexer')
            .container('VideoIndexerInsights').items
            .query(sqlQuery);

        let resp = await result.fetchNext();
        return resp;
    }

    prepareFaces(videoId, faces: Array<any>, identifiedOnly = false) {

        let storageSASParams = this.getSASString(storageSharedKeyCredential);
        const containerURL = `https://${BLOB_STORAGE_NAME}.blob.core.windows.net/imgs`;

        if (identifiedOnly) {
            faces = faces.filter((value) => {
                return (!isNullOrUndefined(value.referenceId))
            })

        }
        if (isNullOrUndefined(faces)) {
            return [];
        }
        // Process and return face data
        let preparedFaces = faces.map((value: any, index: number, array: any[]) => {
            // Upload faces async to Blob Storage
            let fName = videoId + "/" + `FaceThumbnail_${value.thumbnailId}.jpg`;
            value.uri =  `${containerURL}/${fName}?${storageSASParams}`;
            return value;
        });
        return preparedFaces;
    }

    async getEmbeddedVideoPlayer(videoId): Promise<AxiosResponse<any>> {

        const endpoint = `${FUNCTION_GETPLAYER_ENDPOINT}`
                         + `&videoid=${videoId}`

        return this.httpService.get(endpoint).toPromise();
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
