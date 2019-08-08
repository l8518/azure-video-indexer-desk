import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from "axios";
import { PassThrough } from "stream";
import { isArray } from "util";
import { SharedKeyCredential, generateAccountSASQueryParameters, uploadStreamToBlockBlob, BlockBlobURL, SASQueryParameters, AccountSASPermissions, uploadFileToBlockBlob, ServiceURL, AccountSASResourceTypes, AccountSASServices,ContainerURL, StorageURL, BlobURL, Aborter } from "@azure/storage-blob";

const VIDEO_INDEXER_ACCOUNT_ID = process.env["VIDEO_INDEXER_ACCOUNT_ID"];
const VIDEO_INDEXER_SUBSCRIPTION_KEY = process.env["VIDEO_INDEXER_SUBSCRIPTION_KEY"];
const VIDEO_INDEXER_REGION = process.env["VIDEO_INDEXER_REGION"];
const DESK_STORAGE_ACC_NAME = process.env["DESK_STORAGE_ACC_NAME"];
const DESK_STORAGE_KEY = process.env["DESK_STORAGE_KEY"];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let videoId : string = req.query.id;

    // Get VI Access Token:
    let videoIndexerAccessToken;
    try {
        videoIndexerAccessToken = await getVideoIndexerAccessToken();
    }
    catch (error) {
        context.log(error);
        return context.done("Failed to retrieve VI access token.");
    }

    // Preprocess Video Insights
    let videoInsights = await getVideoInsights(videoId, videoIndexerAccessToken);
    let faces = await processFaces(videoInsights.insights.faces, videoId, videoIndexerAccessToken);

    // Set HTTP Output
    context.res = {};
    
    // Store the Video Insights
    context.bindings.exampleOutput = JSON.stringify({
        id: videoId,
        fileName: videoInsights.name,
        externalUrl: videoInsights.externalUrl,
        insights: videoInsights.insights
      });
};

/**
 * Gets the Video Insights from Video Indexer and transforms them/ selecting the relevant portions.
 * @param videoId 
 * @param videoIndexerAccessToken 
 */
async function getVideoInsights (videoId: string, videoIndexerAccessToken : string) {
  const ENDPOINT: string = `https://api.videoindexer.ai/`
  + `/${VIDEO_INDEXER_REGION}`
  + `/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}`
  + `/Videos/${videoId}`
  + `/Index`
  + `?accessToken=${videoIndexerAccessToken}`;

  let resp = (await axios.get(ENDPOINT)).data;
  
  return {
    name: resp.name,
    insights: resp.videos[0].insights,
    externalUrl: resp.externalUrl
  }

}

/**
 * Processes the recognized faces:
 * 1. Generate relevant data
 * 2. Store face images on dedicated blob container.
 * @param faces 
 * @param videoId 
 * @param accessToken 
 */
async function processFaces(faces : Array<any>, videoId, accessToken) {
  if (!isArray(faces)) {
    return [];
  }
  // Authenticate and connect to Blob Container
  const storageSharedKeyCredential = new SharedKeyCredential(DESK_STORAGE_ACC_NAME, DESK_STORAGE_KEY);
  const storagePipeline = StorageURL.newPipeline(storageSharedKeyCredential);
  const storageServiceURL = new ServiceURL(`https://${DESK_STORAGE_ACC_NAME}.blob.core.windows.net`, storagePipeline);
  const targetBlobContainer = ContainerURL.fromServiceURL(storageServiceURL, 'faceimgs');

  // Process and return face data
  faces.forEach((value: any, index: number, array: any[]) => {
    // Upload faces async to Blob Storage
    let fName = videoId + "/" + `FaceThumbnail_${value.thumbnailId}.jpg`;  
    let requestedFaceThumbnailStream = getThumbnailAsBuffer(videoId, value.thumbnailId, accessToken)
    uploadStream(Aborter.none, targetBlobContainer, fName, requestedFaceThumbnailStream);
  });
}

/**
 * Upload an Image/ File Stream to a blob Container.
 * @param aborter 
 * @param containerURL 
 * @param fileName 
 * @param fileStream 
 */
async function uploadStream(aborter, containerURL, fileName, fileStream) {
  fileStream = await fileStream;
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);
  blockBlobURL.upload(aborter, fileStream, Buffer.byteLength(fileStream));
}

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
async function getThumbnailAsBuffer(videoId, thumbnailId, videoIndexerAccessToken) {
  const ENDPOINT: string = `https://api.videoindexer.ai`
  + `/${VIDEO_INDEXER_REGION}`
  + `/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}`
  + `/Videos/${videoId}`
  + `/Thumbnails/${thumbnailId}`
  + `?accessToken=${videoIndexerAccessToken}`;

  let requestConfig : AxiosRequestConfig = {
    responseType: 'arraybuffer'
  }

  return (await axios.get(ENDPOINT, requestConfig)).data;
}

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
async function getVideoIndexerAccessToken() {

  const ENDPOINT: string = `https://api.videoindexer.ai/auth/${VIDEO_INDEXER_REGION}/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}/AccessToken?allowEdit=false`;
  let requestConfig: AxiosRequestConfig = {
      headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': VIDEO_INDEXER_SUBSCRIPTION_KEY,
      }
  };

  return (await axios.get(ENDPOINT, requestConfig)).data;
}

export default httpTrigger;
