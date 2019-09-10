
initUploader = function (containerURL) {
    const selectButton = document.getElementById("select-button");
    const fileInput = document.getElementById("file-input");
    const status = document.getElementById("status-progress-bar");
    const statusContainer = document.getElementById("status-container");

    const reportStatus = message => {
        console.log(message);
    }

    const uploadProgressUpdater = (progress) => {
        let percent = Math.round(progress.loadedBytes / currentTotalSize * 100);
        setUploadBar(percent);
    }

    const setUploadBar = (percent) => {
        status.innerHTML = `${percent} %`;
        status.style.width = `${percent}%`;
    }

    let currentTotalSize = 0;
    const uploadFiles = async () => {
        currentTotalSize = 200;
        try {
            reportStatus("Uploading files...");
            $('#uploadingProgressModal').modal(
                {
                    backdrop: 'static',
                    keyboard: false
                }
            );
            statusContainer.classList.remove("d-none");
            currentTotalSize = 0;
            const promises = [];
            for (const file of fileInput.files) {
                const blockBlobURL = azblob.BlockBlobURL.fromContainerURL(containerURL, file.name);
                currentTotalSize += file.size;
                promises.push(azblob.uploadBrowserDataToBlockBlob(
                    azblob.Aborter.none, file, blockBlobURL,
                    {
                        progress: uploadProgressUpdater
                    }));
            }
            await Promise.all(promises);
            statusContainer.classList.add("d-none");
            $('#uploadingProgressModal').modal('hide');
            setUploadBar(0);
            reportStatus("Done.");
        } catch (error) {
            reportStatus(error.body.message);
        }
    }

    selectButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", uploadFiles);
}

