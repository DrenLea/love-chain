/**
 * 爱心链 · 极简 Service Worker (PWA offline shell)
 * 只做最小可用：第一次访问时把关键静态资源塞入缓存，之后离线也能开壳
 */
const CACHE = 'lovechain-shell-v1';
const CORE = [
  './',
  'app.html',
  'web.html',
  'action.html',
  'map.html',
  'screen.html',
  'story.html',
  'index.html',
  'css/style.css',
  'data.js',
  'js/state.js',
  'js/board.js',
  'manifest.json',
  'assets/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 网络优先，失败回退缓存；GET only
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('app.html')))
  );
});
