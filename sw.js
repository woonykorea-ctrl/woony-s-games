// 오프라인 실행용 캐시. 파일을 바꾸면 버전 숫자를 올린다.
const CACHE = 'block-breaker-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'lib/three.module.js',
  'lib/cannon-es.js',
  'images/icon-192.png',
  'images/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패하면 캐시 (새 버전이 바로 반영되고 오프라인에서도 실행됨)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
