import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from "axios";
import { isNullOrUndefined } from "util";

const VIDEO_INDEXER_ACCOUNT_ID = process.env["VIDEO_INDEXER_ACCOUNT_ID"];
const VIDEO_INDEXER_SUBSCRIPTION_KEY = process.env["VIDEO_INDEXER_SUBSCRIPTION_KEY"];
const VIDEO_INDEXER_REGION = process.env["VIDEO_INDEXER_REGION"];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {


    context.log('HTTP trigger function processed a request.');
    const videoId = (req.query.videoid);

    if (isNullOrUndefined(videoId)) {
        context.res = {
            status: 400,
            body: "Please pass a videoid on the query string"
        };
        return;
    }

    // Get VI Access Token:
    let videoIndexerAccessToken;
    try {
        videoIndexerAccessToken = await getVideoIndexerAccessToken(videoId);
    }
    catch (error) {
        context.log(error);
        return context.done("Failed to retrieve VI access token.");
    }
    let playerWidget = getVideoPlayer(videoId, videoIndexerAccessToken);

    // Get Video Player
    context.res = {
        status: 200,
        body: playerWidget
    };
    return context.done();

};

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
async function getVideoIndexerAccessToken(videoId: string) {

    const ENDPOINT: string = `https://api.videoindexer.ai`
        + `/auth/${VIDEO_INDEXER_REGION}`
        + `/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}`
        + `/Videos/${videoId}`
        + `/AccessToken`;

    let requestConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': VIDEO_INDEXER_SUBSCRIPTION_KEY,
        }
    };

    return (await axios.get(ENDPOINT, requestConfig)).data;
}

/**
 * Call the VI API to retrieve an access token.
 * @returns An access token for the Video Indexer
 */
function getVideoPlayer(videoId: string, videoIndexerAccessToken: string) {

    const ENDPOINT: string = `https://api.videoindexer.ai`
        + `/${VIDEO_INDEXER_REGION}`
        + `/Accounts/${VIDEO_INDEXER_ACCOUNT_ID}`
        + `/Videos/${videoId}`
        + `/PlayerWidget`
        + `?accessToken=${videoIndexerAccessToken}`;

    return ENDPOINT;
}

export default httpTrigger;
