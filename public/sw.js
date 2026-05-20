const CACHE_NAME = 'baby-health-v1';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-records') {
    event.waitUntil(syncRecords());
  }
});

async function syncRecords() {
  // This would sync any pending offline records
  // Implementation depends on IndexedDB storage
  console.log('Syncing offline records...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || '宝宝健康助手';
  const options = {
    body: data.body || '您有新的消息',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.url,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data) {
    clients.openWindow(event.notification.data);
  }
});
