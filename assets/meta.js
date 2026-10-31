/* 规范地址归口：canonical、og:url 与 og:image 一律指向官网 gaoren.org，不再按访问域名各自生成。
   本站五路同源（官网与 GitHub Pages、Vercel、Cloudflare Pages、Netlify 四路镜像），
   若各路都按自身域名声明 canonical，等于五个域名各自自称规范站，搜索引擎判为重复内容、
   权重互相摊薄；故归口官网一处，镜像站凭 canonical 把权重交回官网。
   路径部分仍按当前访问路径自适应：仓库可 fork、可开任意子路径，均无需改动源码。
   静态 HTML 里的同名标签同为官网地址，供不执行 JS 的抓取器兜底，与本件同归一处；
   file:// 协议无源（origin 为 null），跳过改写。 */
/* 分片声明在首绘前生效：缺字由同族分片自动补齐，block 等待，不落系统字体。 */
(function () {
  var links = document.querySelectorAll('link[rel="stage2-css"]');
  for (var i = 0; i < links.length; i++) {
    if (/(?:^|\/)fonts\.css(?:\?|$)/.test(links[i].getAttribute('href') || '')) {
      links[i].setAttribute('rel', 'stylesheet');
    }
  }
})();

(function () {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  var dir = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  var CANON = 'https://gaoren.org';
  var CANON_HOST = 'gaoren.org';
  var path = location.pathname;
  var set = function (sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('link[rel="canonical"]', 'href', CANON + path);
  set('meta[property="og:url"]', 'content', CANON + path);
  set('meta[property="og:image"]', 'content', CANON + dir + 'assets/logo/og-image.png');

  /* PWA：注入 manifest 链接并注册 Service Worker（本件为全站统一入口，故挂于此而非各页手写）。
     SW 只在正式站注册：官网 gaoren.org 与 GitHub Pages 正式路径注册；本地 http 与预览路径
     不注册，并主动清掉历史注册，查验所见即磁盘文件，不会出现缓存回退导致的过期内容。
     gaoren.org 须在列：浏览器判一个站能否安装，看的是 manifest 加带 fetch 处理器的 SW，
     两者缺一即不给安装；创建快捷方式那条路不依赖 SW，于是表现为装不上却仍能建快捷方式，
     且因始终未成安装而被反复提示。 */
  var m = document.createElement('link');
  m.rel = 'manifest';
  m.href = dir + 'manifest.webmanifest';
  document.head.appendChild(m);

  /* 站内预取：导航链接在指针进入、聚焦或触摸时预热目标页，首屏后空闲时按导航次序分批预热。
     预取结果写入 Cache Storage，与 SW 取用同一份缓存：页面 HTML 进壳仓，
     带内容哈希的样式与字体进哈希仓。
     网络门槛：saveData 为真、或有效连接类型为 2g 与 3g 时不预取；连接信息不可得时按允许处理。
     同一目标只取一次，失败静默。 */
  var PREFETCH_BATCH = 6;
  var PREFETCH_GAP = 5000;
  var PREFETCH_BATCH_MAX = 2;
  var swEnabled = false;
  var prefetched = {};
  var storePromise = null;

  var prefetchAllowed = function () {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return true;
    if (c.saveData) return false;
    return !/^(slow-)?2g$|^3g$/.test(String(c.effectiveType || ''));
  };

  /* 壳仓名随构建代次变化，哈希仓跨代保留，两仓均按前缀取当前在用的那一份。 */
  var cacheStores = function () {
    if (storePromise) return storePromise;
    storePromise = navigator.serviceWorker.ready.then(function () {
      return caches.keys();
    }).then(function (keys) {
      var shell = keys.filter(function (k) { return k.indexOf('xj-shell-') === 0; })[0];
      var imm = keys.filter(function (k) { return k.indexOf('xj-immutable-') === 0; })[0];
      return Promise.all([shell ? caches.open(shell) : null, imm ? caches.open(imm) : null]);
    }).then(function (o) {
      return { shell: o[0], imm: o[1] };
    }).catch(function () {
      return null;
    });
    return storePromise;
  };

  var versioned = function (u) {
    return /\.[0-9a-f]{8,}\.(?:js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico|json)$/i.test(u.pathname) ||
      /[?&]h=[0-9a-f]{8,}/.test(u.search);
  };

  var fetchToCache = function (u) {
    return fetch(u.href, { credentials: 'same-origin' }).then(function (res) {
      if (!res || !res.ok || res.type !== 'basic') return null;
      return cacheStores().then(function (s) {
        if (!s) return res;
        var target = versioned(u) ? s.imm : s.shell;
        if (target) return target.put(new Request(u.href, { credentials: 'same-origin' }), res.clone()).then(function () { return res; });
        return res;
      });
    });
  };

  /* 目标页的关键样式与页级字体取自其 HTML 的样式表与预载声明，不猜资源名。
     跨页共用的样式与字体按地址只取一次。 */
  var assetsWarmed = {};
  var warmAssets = function (htmlUrl, res) {
    return res.text().then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'text/html');
      var list = doc.querySelectorAll('link[rel="stylesheet"][href], link[rel="preload"][as="style"][href], link[rel="preload"][as="font"][href]');
      var jobs = [];
      for (var i = 0; i < list.length; i++) {
        var u;
        try { u = new URL(list[i].getAttribute('href'), htmlUrl.href); } catch (e) { continue; }
        if (u.origin !== location.origin || assetsWarmed[u.href]) continue;
        assetsWarmed[u.href] = 1;
        jobs.push(fetchToCache(u).catch(function () {}));
      }
      return Promise.all(jobs);
    });
  };

  /* 同一页只取一次 HTML；空闲批次已取 HTML 的页在指针意图到来时只补样式与字体。 */
  var warm = function (href, deep) {
    if (!swEnabled || !prefetchAllowed()) return;
    var state = prefetched[href];
    if (state === 'full' || (state && !deep)) return;
    var u = new URL(href, location.href);
    if (state === 'html') {
      prefetched[href] = 'full';
      cacheStores().then(function (s) {
        return s && s.shell ? s.shell.match(new Request(u.href, { credentials: 'same-origin' })) : null;
      }).then(function (hit) {
        if (hit) return warmAssets(u, hit);
        return fetchToCache(u).then(function (res) {
          if (res) return warmAssets(u, res);
        });
      }).catch(function () {});
      return;
    }
    prefetched[href] = 'html';
    fetchToCache(u).then(function (res) {
      if (!res || !deep) return;
      prefetched[href] = 'full';
      if (/^text\/html/i.test(res.headers.get('content-type') || '')) return warmAssets(u, res);
    }).catch(function () {});
  };

  /* 站内页面链接才预热：外站、下载件、当前页与无扩展名的非目录路径一律跳过。 */
  var pageTarget = function (a) {
    if (!a || a.hasAttribute('download')) return '';
    var href = a.getAttribute('href');
    if (!href) return '';
    var u;
    try { u = new URL(href, location.href); } catch (e) { return ''; }
    if (u.origin !== location.origin) return '';
    if (!/\.html?$/.test(u.pathname) && u.pathname.charAt(u.pathname.length - 1) !== '/') return '';
    if (u.pathname === location.pathname) return '';
    return u.href;
  };

  var onIntent = function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    var target = pageTarget(a);
    if (target) warm(target, true);
  };

  var navOrder = function () {
    var out = [];
    var used = {};
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var u = pageTarget(links[i]);
      if (u && !used[u]) { used[u] = 1; out.push(u); }
    }
    return out;
  };

  /* 空闲分批只预热页面 HTML，样式与字体留给指针意图那一路按需补齐。 */
  var idlePrefetch = function () {
    var queue = navOrder();
    var index = 0;
    var nextBatch = function () {
      if (!prefetchAllowed()) return;
      var batch = queue.slice(index, index + PREFETCH_BATCH);
      index += PREFETCH_BATCH;
      batch.forEach(function (u) { warm(u, false); });
      if (index < queue.length && index < PREFETCH_BATCH * PREFETCH_BATCH_MAX) setTimeout(nextBatch, PREFETCH_GAP);
    };
    nextBatch();
  };

  var whenIdle = function (fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 3000 });
    else setTimeout(fn, 1500);
  };

  var startPrefetch = function () {
    document.addEventListener('pointerenter', onIntent, true);
    document.addEventListener('pointerover', onIntent, true);
    document.addEventListener('focusin', onIntent, true);
    document.addEventListener('touchstart', onIntent, { passive: true, capture: true });
    whenIdle(idlePrefetch);
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var host = location.hostname;
      var isCanon = host === CANON_HOST || host === 'www.' + CANON_HOST;
      var isPages = host === 'gaorenyoushu.github.io' && location.pathname.indexOf('/XuanJiPaiPan-preview') !== 0;
      if (!isCanon && !isPages) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () {});
        return;
      }
      navigator.serviceWorker.register(dir + 'sw.js').then(function () {
        swEnabled = true;
        startPrefetch();
      }).catch(function () {});
    });
  }
})();

/* 三阶段调度：首绘后连等两帧落 stage2 标记，折叠线以下区块随即恢复布局，
   整份样式与重引擎在这一刻起装。全站只此一处调度，页面内不再写第二段。 */
(function () {
  var fired = false;
  function apply() {
    var css = document.querySelectorAll('link[rel="stage2-css"]');
    for (var i = 0; i < css.length; i++) {
      var s = document.createElement('link');
      s.rel = 'stylesheet';
      s.href = css[i].getAttribute('href');
      document.head.appendChild(s);
    }
    var js = document.querySelectorAll('link[rel="stage2-js"]');
    for (var k = 0; k < js.length; k++) {
      var p = document.createElement('link');
      p.rel = 'preload';
      p.as = 'script';
      p.href = js[k].getAttribute('href');
      document.head.appendChild(p);
      /* stage2-js 先预取再按文档序执行：只预取不执行，页内脚本与壳层永远不到场。 */
      var s = document.createElement('script');
      s.src = p.href;
      s.async = false;
      document.head.appendChild(s);
    }
  }
  function activate() {
    if (fired) return;
    fired = true;
    var root = document.documentElement;
    root.className = root.className ? root.className + ' stage2' : 'stage2';
    apply();
  }
  function afterPaint() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        /* 首屏字体未就位不引 stage2：分片声明、整份样式与重引擎都排在首屏字体之后取，
           首秒带宽只让给首屏字体，避免同窗争流把页级字体拖过一秒；字体久候仍按上限放行。 */
        var done = false;
        function go() { if (done) return; done = true; activate(); }
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(go).catch(go);
          setTimeout(go, 1200);
        } else {
          go();
        }
      });
    });
  }
  /* 首绘时刻取 paint 条目：load 早于首绘时按 load 起算会抢首屏链路，故以首绘为准，load 只作兜底。 */
  var observed = false;
  if ('PerformanceObserver' in window) {
    try {
      var po = new PerformanceObserver(function (list) {
        var hit = list.getEntries().some(function (e) { return e.name === 'first-contentful-paint'; });
        if (hit) { observed = true; po.disconnect(); afterPaint(); }
      });
      po.observe({ type: 'paint', buffered: true });
    } catch (e) { observed = false; }
  }
  window.addEventListener('load', function () {
    if (observed) return;
    setTimeout(function () { if (!fired) afterPaint(); }, 0);
  });
  if (document.readyState === 'complete' && !observed) setTimeout(afterPaint, 0);
})();
