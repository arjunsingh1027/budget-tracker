const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

const filesToCache = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// install steps
self.addEventListener("install", function (evt) {
    // pre cache image data
    evt.waitUntil(
        caches.open(STATIC_CACHE).then(function (cache) {
            console.log("Cache opened");
            return cache.addAll(filesToCache);
        })
    );

    
})