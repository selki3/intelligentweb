// service worker

const CACHE_NAME = 'sightings-cache';
const urlsToCache = [
    "/",
    "/sighting/*",
    "/add-sighting",
    "/stylesheets/style.css",
    "/javascripts/app.js",
    "/javascripts/database.js",
    "/javascripts/generateSignature.js",
    "/javascripts/map.js",
    "/javascripts/idb/index.js",
]

/**
 * Install the service worker.
 */
self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return Promise.all(
                    urlsToCache.map(url =>
                        cache.add(url)
                            .catch(error => console.error(`Failed to cache ${url}: ${error.message}`))
                    )
                );
            })
    );
});

/**
 * Service workers functions on fetching any data. Uses 'network first' approach.
 */
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // If response from the network, cache it
                let responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function() {
            // Network request failed, try to get from cache
            return caches.match(event.request);
        })
    );
});