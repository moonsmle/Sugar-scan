// 캐시 이름 설정 (버전 관리용)
const CACHE_NAME = 'sugar-scan-v1';

// 로컬에 기본적으로 저장해둘 필수 파일 목록 (웹앱 틀)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://img.icons8.com/fluent/192/000000/sugar-cube.png'
];

// 1. 설치 이벤트 (Install): 앱이 처음 켜질 때 필수 파일들을 폰에 저장합니다.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('기본 에셋 캐싱 중...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // 업데이트가 있으면 즉시 반영하도록 강제
});

// 2. 활성화 이벤트 (Activate): 새로운 서비스 워커가 배포되면 옛날 캐시를 지웁니다.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('이전 버전 캐시 삭제:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 페치 이벤트 (Fetch): 앱이 인터넷에 데이터를 요청할 때 중간에서 제어합니다.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 🌟 [핵심] 식단 데이터(menu.json) 요청인 경우 -> '네트워크 우선(Network-First)' 전략
  if (url.pathname.includes('menu.json')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // 인터넷이 잘 연결되어 있다면 최신 식단을 받아와서 캐시에 업데이트하고 리턴합니다.
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, resClone);
          });
          return response;
        })
        .catch(() => {
          // [오프라인 환경] 인터넷이 끊겼다면 캐시에 저장해둔 옛날 식단이라도 보여줍니다.
          // { ignoreSearch: true } 를 붙여서 index.html이 보낸 ?v=시간 주소를 무시하고 매칭합니다.
          return caches.match(e.request, { ignoreSearch: true });
        })
    );
  } else {
    // 🌟 그 외의 파일(HTML, 아이콘 등) -> '캐시 우선(Cache-First)' 전략 (앱 로딩 속도 극대화)
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
