const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

const filesToCache = [
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
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

    self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        cache.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== STATIC_CACHE && key !== DATA_CACHE) {
                        console.log("clearing cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
    const { url } = evt.request;
    if (url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE).then(cache => {
                return fetch(evt.request).then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request, response.clone());
                    }
                    return response;
                }).catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
    } else {
        evt.respondWith(
            caches.open(STATIC_CACHE).then(cache => {
                return cache.match(evt.request).then(response => {
                    return response || fetch(evt.request);
                });
            })
        );
    }
});

