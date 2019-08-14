import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from "axios";
import { PassThrough } from "stream";
import { isArray } from "util";
import { SharedKeyCredential, generateAccountSASQueryParameters, uploadStreamToBlockBlob, BlockBlobURL, SASQueryParameters, AccountSASPermissions, uploadFileToBlockBlob, ServiceURL, AccountSASResourceTypes, AccountSASServices, ContainerURL, StorageURL, BlobURL, IBlockBlobUploadOptions, Aborter } from "@azure/storage-blob";

const VIDEO_INDEXER_ACCOUNT_ID = process.env["VIDEO_INDEXER_ACCOUNT_ID"];
const VIDEO_INDEXER_SUBSCRIPTION_KEY = process.env["VIDEO_INDEXER_SUBSCRIPTION_KEY"];
const VIDEO_INDEXER_REGION = process.env["VIDEO_INDEXER_REGION"];
const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  let videoId: string = req.query.id;

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
  context.bindings.videoInsightOutput = JSON.stringify({
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
async function getVideoInsights(videoId: string, videoIndexerAccessToken: string) {
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
function processFaces(faces: Array<any>, videoId, accessToken) {
  if (!isArray(faces)) {
    return [];
  }
  // Authenticate and connect to Blob Container
  const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);
  const storagePipeline = StorageURL.newPipeline(storageSharedKeyCredential);
  const storageServiceURL = new ServiceURL(`https://${BLOB_STORAGE_NAME}.blob.core.windows.net`, storagePipeline);
  const targetBlobContainer = ContainerURL.fromServiceURL(storageServiceURL, 'imgs');

  // Process and return face data
  faces.forEach(async (value: any, index: number, array: any[]) => {
    // Upload faces async to Blob Storage
    let fName = videoId + "/" + `FaceThumbnail_${value.thumbnailId}.jpg`;
    let thumbnailBuffer = await getThumbnailAsBuffer(videoId, value.thumbnailId, accessToken);
    let streamedBuffer = getStreamFromBuffer(thumbnailBuffer);
    uploadStream(targetBlobContainer, fName, streamedBuffer);
  });
}

function getStreamFromBuffer(buffer) {
  const bufferStream = new PassThrough();
  return bufferStream.end(buffer);
}

/**
 * Upload an Image/ File Stream to a blob Container.
 * @param aborter 
 * @param containerURL 
 * @param fileName 
 * @param fileStream 
 */
async function uploadStream(containerURL, fileName, fileStream) {

  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

  let uploadResp =  uploadStreamToBlockBlob(
    Aborter.none,
    fileStream,
    blockBlobURL,
    2 * 1024 * 1024, // 2MB block size
    20, // 20 max buffers
    {
      blobHTTPHeaders: {
        blobCacheControl: `max-age=2592000`
      }
    }
  );
  return uploadResp;
}

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
async function getThumbnailAsBuffer(videoId, thumbnailId, videoIndexerAccessToken) : Promise<Buffer> {
  const ENDPOINT: string = `https://api.videoindexer.ai`
    + `/${VIDEO_INDEXER_REGION}`
    + `/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}`
    + `/Videos/${videoId}`
    + `/Thumbnails/${thumbnailId}`
    + `?accessToken=${videoIndexerAccessToken}`;

  let requestConfig: AxiosRequestConfig = {
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
