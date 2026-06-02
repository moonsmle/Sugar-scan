const CACHE_NAME = 'sugar-scan-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 최초 설치 시 파일 캐싱
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// 앱 실행 시 네트워크 연결 지원
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
