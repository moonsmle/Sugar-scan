// 🌟 중식/석식 토글 기능 반영을 위해 v3로 버전을 올렸습니다!
const CACHE_NAME = 'sugar-scan-cache-v3'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('새로운 버전(v3)의 파일들을 캐시에 저장합니다.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('오래된 옛날 캐시를 삭제합니다:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('menu.json')) {
    return; 
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
