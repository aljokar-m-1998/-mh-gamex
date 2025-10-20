const CACHE_NAME = 'english-game-cache-v1.0.0'; // يجب زيادة هذا الرقم عند أي تحديث لملفات الكاش
const REQUIRED_FILES = [
  '/', // يشير إلى index.html
  'index.html',
  // ملفات الأيقونات المطلوبة في الـ Manifest
  'icon-192.png',
  'icon-512.png',
  // ملفات JSON الخاصة باللغة المطلوبة لعمل اللعبة (افتراضاً)
  'sentences1.json',
  'sentences2.json',
  'sentences3.json',
  'sentences4.json',
  // ملفات الأصوات والمكتبات الخارجية (تم تضمينها في الكاش لضمان التشغيل)
  'https://assets.mixkit.co/sfx/preview/mixkit-game-success-505.mp3', // success-sound
  'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-223.mp3', // fail-sound
  'https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3', // click-sound
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Poppins:wght@400;600;700;900&display=swap', // CSS font link
  'https://fonts.gstatic.com/s/cairo/v29/SLXGc1lJbeO_Y_N0R9I.woff2', // Cairo woff2 (مثال)
  'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8gEPMnyAENFzGv.woff2' // Poppins woff2 (مثال)
];

// 1. حدث التثبيت (Install Event)
// يتم فيه فتح الكاش وتخزين جميع الملفات الأساسية
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell assets');
        return cache.addAll(REQUIRED_FILES).catch(error => {
            // تجاهل أخطاء تحميل بعض ملفات الطرف الثالث (مثل CDN) للسماح بالتثبيت
            console.warn('[Service Worker] Failed to cache some resources:', error);
        });
      })
  );
});

// 2. حدث التفعيل (Activate Event)
// يتم فيه حذف أي كاش قديم لا يتطابق مع اسم الكاش الحالي (CACHE_NAME)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. حدث الاستدعاء (Fetch Event)
// يتم فيه محاولة استدعاء الموارد من الكاش أولاً (Cache First)
self.addEventListener('fetch', event => {
  // استبعاد طلبات Google TTS (لأنها تتغير بشكل ديناميكي ويجب أن تأتي من الشبكة)
  if (event.request.url.includes('translate.google.com/translate_tts')) {
    return fetch(event.request);
  }

  // استراتيجية Cache First for required files
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان المورد موجودًا في الكاش، يتم إرجاعه
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجودًا، يتم طلب المورد من الشبكة
        return fetch(event.request);
      })
  );
});

