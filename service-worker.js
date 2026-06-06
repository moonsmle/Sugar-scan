// 🌟 [핵심] 코드를 수정할 때마다 뒤의 v1, v2, v3 숫자를 꼭 올려주세요!
const CACHE_NAME = 'sugar-scan-cache-v2'; 

// 캐싱할 파일 목록 (기본 뼈대 파일들)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. 서비스 워커 설치 (새로운 파일들을 내 폰에 다운로드)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('새로운 버전의 파일들을 캐시에 저장합니다.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 새 서비스 워커가 발견되면 대기하지 않고 즉시 활성화 시킵니다.
  self.skipWaiting(); 
});

// 2. 활성화 (기존에 저장되어 있던 쓸모없는 옛날 캐시 삭제)
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
  // 현재 열려 있는 앱 페이지들을 새 서비스 워커가 즉시 제어하도록 합니다.
  self.clients.claim(); 
});

// 3. 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // 🌟 중요: 급식 데이터(menu.json)는 캐시하지 않고 항상 실시간으로 가져옵니다.
  if (event.request.url.includes('menu.json')) {
    return; 
  }

  // 나머지 html, manifest 등은 캐시된 파일이 있으면 캐시에서 바로 보여줍니다.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
