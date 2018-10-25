function initialize() {
    const CHUNK_SIZE = 2 * 256 * 1024,
        remoteStorage = new RemoteStorage(),
        widget = new Widget(remoteStorage);

    remoteStorage.access.claim('shares', 'rw');
    widget.attach('remotestorage-widget');

    remoteStorage.on('connected', () => {
        const userAddress = remoteStorage.remote.userAddress;
        window.shares = remoteStorage.scope('/public/shares/');
        indexImages();
    });

    function indexImages(fileName) {
        if (fileName) {
            return getFileURL(fileName);
        } else {
            shares.getListing().then((listing) => {
                Object.keys(listing).reverse().forEach(getFileURL);
            });
        }
    }

    function getFileURL(fileName) {
        const url = shares.getItemURL(fileName),
            div = document.getElementById('images');
        let img = new Image();
        img.onload = () => {
            div.appendChild(img);
        };
        img.src = url;
    }

    const fileElement= document.querySelector('input[type="file"]');
    fileElement.addEventListener('change', function (evt) {
        const file = evt.target.files[0],
            fileSize = file.size,
            reader = new ChunkedFileReader({maxChunkSize: CHUNK_SIZE});
            md5 = SparkMD5.ArrayBuffer.hash(file);
        let lastByte = 0;
        console.log('---');
        console.log('File info: ', file);

        function printHttpHeader(chunkSize) {
            const thisByte = lastByte + chunkSize;
            console.log(`X-Content-ID: ${md5}`)
            console.log(`X-Content-Range: bytes ${lastByte}-${thisByte}/${fileSize}`);
            console.log(`Content-Type: ${file.type}`);
            console.log('');
            lastByte = thisByte;
        }

        reader.subscribe('begin', function () {
            console.log('Start reading');
        });
        reader.subscribe('progress', function(data){
            console.log(`Progress ${data.done} / ${data.nchunks} chunks (${(data.done_ratio * 100).toFixed(2)}%)`);
        });
        reader.subscribe('chunk', function (data) {
            // new Uint8Array(evt.chunk));
            console.log(`Read chunk: ${data.chunk.byteLength}`, data.chunk);
            printHttpHeader(data.chunk.byteLength);
        });
        reader.subscribe('end', function () {
            console.log('Done reading');
        });

        reader.readChunks(file);
    });
}