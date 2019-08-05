import { AzureFunction, Context } from "@azure/functions";
import { SharedKeyCredential, generateAccountSASQueryParameters, SASQueryParameters, AccountSASPermissions, AccountSASResourceTypes, AccountSASServices} from "@azure/storage-blob";

const STORAGE_ACC_NAME = process.env["STORAGE_ACC_NAME"];
const STORAGE_KEY = process.env["STORAGE_KEY"];

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
    let fileInputUrl : string = eventGridEvent.data.url;

    const storageSharedKeyCredential = new SharedKeyCredential(STORAGE_ACC_NAME, STORAGE_KEY);
    let storageSASParams = getSASString(storageSharedKeyCredential);
    let sourceURIWithSAS = `${fileInputUrl}?${storageSASParams}`;
    context.log(sourceURIWithSAS)
    context.res = {
        status: 200,
        body: sourceURIWithSAS
    };

    // TODO: Add the VI Encoding Functions


    return context.done();
};

function getSASString(amsStorageSharedKeyCredential:SharedKeyCredential) {
    // Connnect to Primary Storage of Azure Media Service 
    // Use SharedKeyCredential with storage account and account key
    // Get a SAS Token to grant public access for required operations
    const amsStorageSASParamsString = createSASQueryParameters(amsStorageSharedKeyCredential).toString();
    return amsStorageSASParamsString
}

function createSASQueryParameters(sharedKeyCredential) : SASQueryParameters {
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