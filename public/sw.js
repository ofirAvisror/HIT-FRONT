/**
 * Service Worker for Cost Manager PWA
 * Handles caching of static assets for offline support
 */

const CACHE_NAME = 'cost-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', function(event) {
  console.log('[SW] 🔄 Installing service worker...');
  console.log('[SW] Environment:', {
    scope: self.registration?.scope || 'unknown',
    scriptURL: self.location.href,
    clients: typeof self.clients !== 'undefined'
  });
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] ✅ Opened cache:', CACHE_NAME);
        // Try to cache files, but don't fail if some are missing
        return Promise.allSettled(
          urlsToCache.map(function(url) {
            console.log('[SW] 📦 Attempting to cache:', url);
            return fetch(url)
              .then(function(response) {
                if (response.ok) {
                  console.log('[SW] ✅ Successfully cached:', url, {
                    status: response.status,
                    contentType: response.headers.get('content-type'),
                    size: response.headers.get('content-length') || 'unknown'
                  });
                  return cache.put(url, response);
                } else {
                  console.warn('[SW] ⚠️ Failed to cache (bad response):', url, {
                    status: response.status,
                    statusText: response.statusText
                  });
                }
              })
              .catch(function(error) {
                console.error('[SW] ❌ Failed to cache:', url, {
                  error: error.message,
                  stack: error.stack
                });
              });
          })
        ).then(function(results) {
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          console.log('[SW] 📊 Cache results:', {
            total: results.length,
            successful: successful,
            failed: failed
          });
        });
      })
      .then(function() {
        console.log('[SW] ✅ Service worker installed successfully');
        console.log('[SW] 🔄 Calling skipWaiting() to activate immediately...');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] ❌ Cache install failed:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] 🔄 Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('[SW] 📋 Found caches:', cacheNames);
      const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);
      
      if (oldCaches.length > 0) {
        console.log('[SW] 🗑️ Deleting old caches:', oldCaches);
        return Promise.all(
          oldCaches.map(function(cacheName) {
            console.log('[SW] 🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName).then(function(deleted) {
              console.log('[SW]', deleted ? '✅' : '❌', 'Cache deleted:', cacheName);
              return deleted;
            });
          })
        );
      } else {
        console.log('[SW] ✅ No old caches to delete');
        return Promise.resolve([]);
      }
    })
    .then(function() {
      console.log('[SW] ✅ Service worker activated');
      console.log('[SW] 🎮 Claiming clients...');
      return self.clients.claim();
    })
    .then(function() {
      console.log('[SW] ✅ Clients claimed');
    })
    .catch(function(error) {
      console.error('[SW] ❌ Activation failed:', {
        error: error.message,
        stack: error.stack
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip chrome-extension and other protocols
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(function(response) {
            // Check if valid response
            if (!response || response.status !== 200) {
              // For navigation requests, return index.html for SPA routing
              if (event.request.mode === 'navigate') {
                return caches.match('/index.html') || response;
              }
              return response;
            }

            // Only cache same-origin responses
            if (response.type === 'basic' || response.type === 'cors') {
              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(function() {
            // If fetch fails, try to return cached index.html for navigation requests (SPA)
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            // For other requests, return a basic error response
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

