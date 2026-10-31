/* 访问者地理定位：页脚免责声明之下一行归属地，原始 IP 存 title。
   四源顺序兜底：中文源优先，逐源失败再切下一源；全部失败则静默不显示，不影响排盘功能。
   单源超时 4 秒，避免某一源无响应时页脚长时间空着。
   结果按会话缓存，同一标签页只请求一次；请求不带 cookie，仅取归属地文本用于展示。 */
(function () {
  'use strict';
  const GEO_CACHE_KEY = 'xj:geo';
  const GEO_SOURCES = [
    'https://myip.ipip.net/json',
    'https://uapis.cn/api/v1/network/myip',
    'https://api.ip.sb/geoip',
    'https://ipwho.is/'
  ];

  /* 各家字段名不一，此处统一归一 */
  function geoPick(d) {
    if (!d || typeof d !== 'object') return null;
    if (d.data && Array.isArray(d.data.location)) {
      const L = d.data.location;
      return { ip: String(d.data.ip || ''), country: L[0] || '', region: L[1] || '', city: L[2] || '' };
    }
    const ip = d.ip || (d.ipinfo && d.ipinfo.text) || '';
    const country = d.country || d.country_name || (d.ipdata && d.ipdata.info1) || '';
    const region = d.province || d.region || (d.ipdata && d.ipdata.info2) || '';
    const city = d.city || (d.ipdata && d.ipdata.info3) || '';
    if (!ip && !country) return null;
    return { ip: String(ip), country: String(country), region: String(region), city: String(city) };
  }

  /* 省市区去重拼接；国家名与省名重复时只留一次 */
  function geoText(g) {
    return [g.country, g.region, g.city].filter(function (s, i, a) { return s && a.indexOf(s) === i; }).join(' ');
  }

  /* 取数：超时真中止。 */
  function fetchJson(url, timeout) {
    return new Promise(function (res, rej) {
      if (typeof fetch !== 'function') { rej(new Error('no fetch')); return; }
      let done = false;
      const ctl = (typeof AbortController === 'function') ? new AbortController() : null;
      const fin = function (fn, v) { if (done) return; done = true; clearTimeout(timer); fn(v); };
      const timer = setTimeout(function () {
        if (ctl) { try { ctl.abort(); } catch (e) {} }
        fin(rej, new Error('timeout'));
      }, timeout || 6000);
      try {
        fetch(url, { method: 'GET', cache: 'no-store', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); })
          .then(function (j) { fin(res, j); })
          .catch(function (e) { fin(rej, e); });
      } catch (e) { fin(rej, e); }
    });
  }

  function geoFetchOne(url) {
    return fetchJson(url, 4000).then(function (d) {
      const g = geoPick(d);
      if (!g) throw new Error('unparsable');
      return g;
    });
  }

  /* 依次尝试各源，任一成功即返回；会话内缓存，同标签页只外发一次。
     同页多处同时索取共用同一个进行中的请求，不重复打各源。 */
  let lookupPromise = null;
  function geoLookup() {
    if (lookupPromise) return lookupPromise;
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(GEO_CACHE_KEY) || 'null'); } catch (e) {}
    if (cached && cached.ip) return Promise.resolve(cached);
    let p = Promise.reject(new Error('no source'));
    GEO_SOURCES.forEach(function (u) { p = p.catch(function () { return geoFetchOne(u); }); });
    lookupPromise = p.then(function (g) {
      try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(g)); } catch (e) {}
      return g;
    });
    return lookupPromise;
  }
  /* 供同页各模块复用同一管线与缓存 */
  window.aiGeoLookup = geoLookup;

  function renderGeo(el, g) {
    const txt = geoText(g);
    if (!txt) return;
    el.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8c2.3 0 4.2 1.9 4.2 4.2 0 3-4.2 8.2-4.2 8.2S3.8 9 3.8 6C3.8 3.7 5.7 1.8 8 1.8z"/><circle cx="8" cy="6" r="1.6"/></svg><span></span>';
    el.querySelector('span').textContent = txt;
    el.title = 'IP ' + (g.ip || '未知') + '（由 IP 定位服务反查）';
    el.classList.add('on');
  }

  /* 挂载点：共享页脚内的 .geo-foot，缺失时自建 */
  function geoHost() {
    const f = document.getElementById('footer');
    if (!f) return null;
    let w = f.querySelector('.wrap');
    if (!w) { w = document.createElement('div'); w.className = 'wrap'; f.appendChild(w); }
    let el = w.querySelector('.geo-foot');
    if (!el) {
      el = document.createElement('div');
      el.className = 'geo-foot';
      const dis = w.querySelector('.dis');
      w.insertBefore(el, dis ? dis.nextSibling : null);
    }
    return el;
  }

  function mountGeo() {
    const el = geoHost();
    if (!el) {
      if (!mountGeo.__retried) {
        mountGeo.__retried = true;
        try { window.addEventListener('load', function () { mountGeo(); }, { once: true }); } catch (e) {}
      }
      return;
    }
    if (el.__geoDone) return;
    el.__geoDone = true;
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(GEO_CACHE_KEY) || 'null'); } catch (e) {}
    if (cached && cached.ip) { renderGeo(el, cached); return; }
    geoLookup().then(function (g) {
      try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(g)); } catch (e) {}
      renderGeo(el, g);
    }).catch(function () { /* 全部失败：保持隐藏，不提示、不报错 */ });
  }

  /* 所有页在 load 后挂载，重复调用由 __geoDone 拦下 */
  try {
    if (document.readyState === 'complete') mountGeo();
    else window.addEventListener('load', function () { mountGeo(); }, { once: true });
  } catch (e) {}
})();
