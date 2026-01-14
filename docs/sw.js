/**
 * TamilTheni Service Worker
 * Enables offline access and caching for the PWA
 */

const CACHE_NAME = 'tamiltheni-v2';
const CACHE_VERSION = 22;

// App shell - core files needed for offline functionality
const APP_SHELL = [
    './',
    './index.html',
    './theni1.html',
    './theni2.html',
    './theni34.html',
    './theni5.html',
    './assets/css/tokens.css',
    './assets/css/style.css',
    './assets/css/index.css',
    './assets/css/theni1.css',
    './assets/css/theni2.css',
    './assets/css/theni34.css',
    './assets/css/theni5.css',
    './assets/js/config.js',
    './assets/js/utils.js',
    './assets/js/layout.js',
    './assets/js/timer.js',
    './assets/js/audio_manager.js',
    './assets/js/pwa.js',
    './assets/js/theni1.js',
    './assets/js/theni2.js',
    './assets/js/theni34.js',
    './assets/js/theni5.js',
    './assets/data/theni_words.js',
    './assets/data/theni5_words.js',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app shell...');
                return cache.addAll(APP_SHELL);
            })
            .then(() => {
                console.log('[SW] App shell cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache app shell:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle Google Fonts - stale-while-revalidate
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Handle images - network-first with cache fallback
    if (url.pathname.includes('/images/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache the fetched image
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fall back to cache if network fails
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle external API calls (Wikipedia, Gemini) - network only
    if (url.hostname.includes('wikipedia.org') || url.hostname.includes('googleapis.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Default strategy: cache-first for app shell
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache the fetched resource
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
