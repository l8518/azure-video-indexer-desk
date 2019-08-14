import { AzureFunction, Context } from "@azure/functions";
import { SharedKeyCredential, generateAccountSASQueryParameters, SASQueryParameters, AccountSASPermissions, AccountSASResourceTypes, AccountSASServices, StorageURL, BlobURL, Aborter } from "@azure/storage-blob";
import axios, { AxiosRequestConfig } from "axios";

const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];
const VIDEO_INDEXER_ACCOUNT_ID = process.env["VIDEO_INDEXER_ACCOUNT_ID"];
const VIDEO_INDEXER_SUBSCRIPTION_KEY = process.env["VIDEO_INDEXER_SUBSCRIPTION_KEY"];
const VIDEO_INDEXER_REGION = process.env["VIDEO_INDEXER_REGION"];
const VIDEO_INDEXER_DEFAULT_LANGUAGE = "German" || process.env["VIDEO_INDEXER_DEFAULT_LANGUAGE"];
const VIDEO_INDEXER_FINISHED_HOOK = process.env["VIDEO_INDEXER_FINISHED_HOOK"];

/**
 * This AZ Function triggers the Azure Media Service to encode a uploaded file automatically.
 * @param context 
 * @param eventGridEvent 
 */
const eventGridTrigger: AzureFunction = async function (context: Context, eventGridEvent: any): Promise<void> {
    if (eventGridEvent.eventType != "Microsoft.Storage.BlobCreated") {
        context.res = {
            status: 400,
            body: "EventGridEvent does not match Microsoft.Storage.BlobCreated."
        };
        return;
    }

    // Construct input params
    const fileInputUrl: string = eventGridEvent.data.url;
    const fileContentType: string = eventGridEvent.data.contentType;

    const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);

    const storagePipeline = StorageURL.newPipeline(storageSharedKeyCredential);
    const blob = new BlobURL(fileInputUrl, storagePipeline)
    const blobProperties = await blob.getProperties(Aborter.none, {});
    const createdAt = blobProperties.creationTime;

    // Determine the language of the video, if possible.
    const languageProp = blobProperties.metadata['audio_language'];
    const videoLanguage = (["German", "English"].includes(languageProp) ? languageProp : VIDEO_INDEXER_DEFAULT_LANGUAGE)

    const uriComponents = fileInputUrl.split("/");
    const blobName = uriComponents.pop();
    const trimmedBlobName = blobName.substr(0, Math.min(50, blobName.length));
    const videoName = `${trimmedBlobName}-${createdAt.toISOString()}`

    let storageSASParams = getSASString(storageSharedKeyCredential);
    let sourceURIWithSAS = `${fileInputUrl}?${storageSASParams}`;
    context.log(sourceURIWithSAS)
    context.res = {
        status: 200,
        body: sourceURIWithSAS
    };

    // Get VI Access Token:
    let videoIndexerAccessToken;
    try {
        videoIndexerAccessToken = await getVideoIndexerAccessToken();
    }
    catch (error) {
        context.log(error);
        return context.done("Failed to retrieve VI access token.");
    }

    // Trigger Video Indexer:
    let triggerResult;
    try {
        triggerResult = await triggerVideoIndexer(videoIndexerAccessToken, videoName, videoLanguage, sourceURIWithSAS, fileContentType);
    }
    catch (error) {
        context.log(error);
    }
    context.log(triggerResult);
    context.log(triggerResult.id);
    return context.done();
};

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
async function getVideoIndexerAccessToken() {

    const ENDPOINT: string = `https://api.videoindexer.ai/auth/${VIDEO_INDEXER_REGION}/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}/AccessToken?allowEdit=true`;
    let requestConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': VIDEO_INDEXER_SUBSCRIPTION_KEY,
        }
    };

    return (await axios.get(ENDPOINT, requestConfig)).data;
}

/**
 * Trigger the Video Indexer to index the video from the given videoUrl.
 * 
 * @param videoIndexerAccessToken 
 * @param videoName 
 * @param videoLanguage 
 * @param videoUrl 
 * @param videFileContentType 
 */
async function triggerVideoIndexer(videoIndexerAccessToken: string, videoName: string, videoLanguage: string, videoUrl: string, videFileContentType: string) {

    const ENDPOINT: string = `https://api.videoindexer.ai/${VIDEO_INDEXER_REGION}/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}/Videos?accessToken=${videoIndexerAccessToken}`
        + `&name=${encodeURIComponent(videoName)}`
        + `&callbackUrl=${encodeURIComponent(VIDEO_INDEXER_FINISHED_HOOK)}`
        + `&language=${encodeURIComponent(videoLanguage)}&streamingPreset=Default`
        + `&videoUrl=${encodeURIComponent(videoUrl)}&filetype=${encodeURIComponent(videFileContentType)}`;
    return (await axios.post(ENDPOINT)).data;
}

/**
 * Retrieves as SAS String from the storage defined by the credentials.
 * @param credentials 
 */
function getSASString(credentials: SharedKeyCredential) {
    // Use SharedKeyCredential with storage account and account key
    // Get a SAS Token to grant public access for required operations
    const amsStorageSASParamsString = createSASQueryParameters(credentials).toString();
    return amsStorageSASParamsString
}

/**
 * Generates the SAS Query Parameters for a specific time and permissions set.
 * @param sharedKeyCredential 
 */
function createSASQueryParameters(sharedKeyCredential): SASQueryParameters {
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

export default eventGridTrigger;