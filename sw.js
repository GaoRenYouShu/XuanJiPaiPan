/* 玄机排盘 Service Worker：构建哈希资源缓存优先，HTML 网络优先
   策略：
   - HTML 导航：网络优先，在线取当前版本并回写；断网回落同 URL 缓存，再回落首页壳；
   - 构建哈希资源：文件名含内容哈希者缓存优先，命中即出，不回源；
   - 未哈希静态资源：先出缓存，后台按 ETag 重验证并回写；
   - 跨域请求与 Range 请求不拦截，直连网络；
   - 预缓存壳清单与构建清单所列哈希资源，单项失败不阻断安装。
   版本：BUILD 由构建入口按内容哈希写入，随清单同批生成。
   缓存：壳仓随 BUILD 换代清理，哈希资源仓按内容寻址、跨版本保留。 */
const BUILD = 'ddcffecebbee';
const CACHE_SHELL = 'xj-shell-' + BUILD;
const CACHE_IMMUTABLE = 'xj-immutable-v1';
const MANIFEST_URL = './assets/build-manifest.json';
const OFFLINE_URL = './index.html';
const HASHED_RE = /\.[0-9a-f]{8,}\.(?:js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico|json)$/i;
const BUILD_RE = /^[0-9a-f]{8,16}$/;

/* 壳只预缓存打开就能看的最小集；构建哈希资源由构建清单补齐。
   哈希文件名与 SHELL、BUILD 是同一套构建口径，三者同笔维护。 */
const SHELL = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './assets/meta.js',
  './assets/app.js',
  './assets/fonts/noto-serif-sc.css',
  './assets/fonts/nssc-chrome.woff2',
  './assets/fonts/site-sym.css',
  './assets/lunar-today-2026.js'
];

function isHashed(pathname) {
  return HASHED_RE.test(pathname);
}

/* 构建清单可缺省：未产出时只预缓存壳，哈希资源在首次访问时进缓存。 */
function readManifest() {
  return fetch(MANIFEST_URL, { cache: 'no-cache' }).then(function (res) {
    if (!res.ok) return { build: '', assets: [] };
    return res.json().then(function (data) {
      const all = data && Array.isArray(data.assets) ? data.assets : [];
      const pre = data && Array.isArray(data.precache) ? data.precache : all;
      return {
        build: data && typeof data.build === 'string' && BUILD_RE.test(data.build) ? data.build : '',
        assets: pre.filter(function (u) {
          return typeof u === 'string' && u.charAt(0) !== '/' && u.indexOf('..') < 0 &&
            !/^[a-z]+:/i.test(u) && isHashed(u);
        })
      };
    });
  }).catch(function () {
    return { build: '', assets: [] };
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    readManifest().then(function (m) {
      if (m.build && m.build !== BUILD) console.warn('[sw] build mismatch', m.build, BUILD);
      return Promise.all([
        caches.open(CACHE_SHELL),
        caches.open(CACHE_IMMUTABLE)
      ]).then(function (opened) {
        const shell = opened[0];
        const immutable = opened[1];
        const jobs = SHELL.map(function (u) { return shell.add(u); })
          .concat(m.assets.map(function (u) { return immutable.add(u); }));
        return Promise.allSettled(jobs);
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('xj-shell-') === 0 && k !== CACHE_SHELL;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* HTML：网络优先，成功回写；断网回落同 URL 缓存，再回落首页壳。 */
function networkFirst(req) {
  return caches.open(CACHE_SHELL).then(function (cache) {
    return fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) {
        const cp = res.clone();
        cache.put(req, cp).catch(function () {});
      }
      return res;
    }).catch(function () {
      return cache.match(req).then(function (hit) {
        return hit || cache.match(OFFLINE_URL);
      });
    });
  });
}

/* 构建哈希资源：缓存优先，未命中再取网络并回写。 */
function cacheFirst(req) {
  return caches.open(CACHE_IMMUTABLE).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          const cp = res.clone();
          cache.put(req, cp).catch(function () {});
        }
        return res;
      });
    });
  });
}

/* 未哈希资源：先出缓存，后台按 ETag 重验证并回写；无缓存时等网络。 */
function staleWhileRevalidate(event, req) {
  return caches.open(CACHE_SHELL).then(function (cache) {
    return cache.match(req).then(function (hit) {
      const network = fetch(req, { cache: 'no-cache' }).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          const cp = res.clone();
          return cache.put(req, cp).then(function () { return res; }, function () { return res; });
        }
        return res;
      });
      if (hit) {
        event.waitUntil(network.catch(function () {}));
        return hit;
      }
      return network.catch(function () {
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  });
}

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;               /* 跨域数据接口直连 */
  if (req.headers.get('range')) return;                     /* 分段请求不缓存 */

  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req));
    return;
  }
  if (isHashed(url.pathname)) {
    e.respondWith(cacheFirst(req));
    return;
  }
  e.respondWith(staleWhileRevalidate(e, req));
});
