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
});

// fetch
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE).then(cache => {
                return fetch(evt.request)
                    .then(res => {
                        if (res.status === 200) {
                            cache.put(evt.request.url, res.clone());
                        }
                        return res;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (res) {
                if (res) {
                    return res;
                } else (evt.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                };
            })
        })
    );

});

