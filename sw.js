/* 玄机排盘 Service Worker：壳预缓存 + 运行时缓存
   策略：
   - 页面导航（HTML）：网络优先，按 ETag 重验证，在线始终取当前版本，断网回落已缓存页；
   - 同源静态资源：网络优先，按 ETag 重验证（未变回 304，极轻），在线始终取最新字节，
     断网回落 SW 缓存。资源更新因此不依赖 URL 版本串：改完即生效，页面里不必跟着改任何字；
   - 跨域请求（节假日、IP 归属、地磁、AI 接口等外部数据源）一律不拦截，直连网络；
   - 预缓存逐项 cache.add 并容忍单项失败，避免任一资源波动导致安装整体失败。
   版本升级：CACHE 名尾号递增，activate 时清除旧仓。 */
const CACHE = 'xj-shell-v22';
const SHELL = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './assets/meta.js',
  './assets/app.js',
  './assets/style.css',
  './assets/lunar.js',
  './assets/foli-terms.js',
  './assets/daoli-terms.js',
  './assets/fonts/noto-serif-sc.css',
  './assets/fonts/nssc-chrome.woff2',
  './assets/fonts/site-sym.css',
  './assets/zangli-terms.js',
  './assets/zangli-eclipse.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.allSettled(SHELL.map(function (u) { return c.add(u); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;               /* 跨域数据接口直连 */
  if (req.headers.get('range')) return;                     /* 分段请求不缓存 */

  if (req.mode === 'navigate') {
    /* 页面：网络优先，按 ETag 重验证（cache:'no-cache'，未变更回 304 极轻），
       在线始终取当前版本；断网回落已缓存页。 */
    e.respondWith(
      fetch(req, { cache: 'no-cache' }).then(function (res) {
        if (res.ok) {
          const cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
      })
    );
    return;
  }

  /* 站标资源与其余静态资源：网络优先并按 ETag 重验证，在线即取最新字节，失败回落 SW 缓存。
     与页面同一条策略，故资源改动无须版本串即即时生效；断网时两者都从缓存出，离线可用不破。 */
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(function (res) {
        if (res.ok && res.type === 'basic') {
          const cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      })
      .catch(function () { return caches.match(req); })
  );
});
