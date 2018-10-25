function initialize() {
    const remoteStorage = new RemoteStorage();
    const widget = new Widget(remoteStorage);
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
        const url = shares.getItemURL(fileName)
        const div = document.getElementById('images');
        let img = new Image();
        img.onload = () => {
            div.appendChild(img);
        };
        img.src = url;
    }

    var fileElement= document.querySelector('input[type="file"]');
    fileElement.addEventListener('change', function(evt){
        // Create object
        var reader= new ChunkedFileReader();

        // Subscribe event listeners
        reader.subscribe('begin', function(evt){
            console.log('Start reading');
        });
        reader.subscribe('progress', function(evt){
            console.log('Progress ' + evt.done + ' / ' + evt.nchunks + ' chunks (' + (evt.done_ratio * 100).toFixed(2) + '%)');
        });
        reader.subscribe('chunk', function(evt){
            //console.log('Read chunk: ' + new Uint8Array(evt.chunk));
            console.log('Read chunk: ', evt.chunk);
        });
        reader.subscribe('end', function(evt){
            console.log('Done reading', evt);
        });

        // Read it!
        reader.readChunks(evt.target.files[0]);
    });
}