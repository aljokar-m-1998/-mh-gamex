// 🔸 Service Worker لتطبيق "تعلم الإنجليزية" M-H
// يقوم بتخزين الملفات الأساسية مؤقتًا لتعمل اللعبة بدون اتصال بالإنترنت

const CACHE_NAME = 'taallum-aleng-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './game.js',
  './icon-192.png',
  './icon-512.png'
];

// ✅ تثبيت Service Worker وتخزين الملفات في الكاش
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// ✅ تفعيل Service Worker وحذف الكاش القديم لو موجود
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(name);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ✅ التعامل مع الطلبات (جلب من الكاش أو من الإنترنت)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // تم العثور على الملف في الكاش
        return cachedResponse;
      }
      // جلب الملف من الإنترنت وتخزينه في الكاش
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return networkResponse;
      });
    })
  );
});
