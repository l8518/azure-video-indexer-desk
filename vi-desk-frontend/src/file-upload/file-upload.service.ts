import { Injectable } from '@nestjs/common';
import { BlockBlobURL, Aborter, ContainerURL, StorageURL, ServiceURL, SharedKeyCredential, uploadStreamToBlockBlob } from '@azure/storage-blob';
import { PassThrough } from 'stream';

const BLOB_STORAGE_NAME = process.env["BLOB_STORAGE_NAME"];
const BLOB_STORAGE_KEY = process.env["BLOB_STORAGE_KEY"];

@Injectable()
export class FileUploadService {

    async uploadToBlobStorage(fileName: string, buffer, bufferSize) {
        console.log('uploading');
        const storageSharedKeyCredential = new SharedKeyCredential(BLOB_STORAGE_NAME, BLOB_STORAGE_KEY);
        const storagePipeline = StorageURL.newPipeline(storageSharedKeyCredential);
        const storageServiceURL = new ServiceURL(`https://${BLOB_STORAGE_NAME}.blob.core.windows.net`, storagePipeline);
        const targetBlobContainer = ContainerURL.fromServiceURL(storageServiceURL, 'drop');

        const blockBlobURL = BlockBlobURL.fromContainerURL(targetBlobContainer, fileName);
        const bufferStream = new PassThrough();
        bufferStream.end(buffer);

        await uploadStreamToBlockBlob(
            Aborter.none,
            bufferStream,
            blockBlobURL,
            2 * 1024 * 1024, // 2MB block size
            20, // 20 max buffers
            {
              blobHTTPHeaders: {
                blobCacheControl: `max-age=2592000`
              }
            }
        );
    }

}
