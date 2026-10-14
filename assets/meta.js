/* 规范地址归口：canonical、og:url 与 og:image 一律指向官网 gaoren.org，不再按访问域名各自生成。
   本站五路同源（官网与 GitHub Pages、Vercel、Cloudflare Pages、Netlify 四路镜像），
   若各路都按自身域名声明 canonical，等于五个域名各自自称规范站，搜索引擎判为重复内容、
   权重互相摊薄；故归口官网一处，镜像站凭 canonical 把权重交回官网。
   路径部分仍按当前访问路径自适应：仓库可 fork、可开任意子路径，均无需改动源码。
   静态 HTML 里的同名标签同为官网地址，供不执行 JS 的抓取器兜底，与本件同归一处；
   file:// 协议无源（origin 为 null），跳过改写。 */
(function () {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  var dir = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  var CANON = 'https://gaoren.org';
  var path = location.pathname;
  var set = function (sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('link[rel="canonical"]', 'href', CANON + path);
  set('meta[property="og:url"]', 'content', CANON + path);
  set('meta[property="og:image"]', 'content', CANON + dir + 'assets/logo/og-image.png');

  /* PWA：注入 manifest 链接并注册 Service Worker（本件为全站统一入口，故挂于此而非各页手写）。
     SW 只在正式站注册：本地 http 与预览站不注册，并主动清掉历史注册，查验所见即磁盘文件，
     不会出现缓存回退导致的过期内容。 */
  var m = document.createElement('link');
  m.rel = 'manifest';
  m.href = dir + 'manifest.webmanifest';
  document.head.appendChild(m);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var live = location.hostname === 'gaorenyoushu.github.io' && location.pathname.indexOf('/XuanJiPaiPan-preview') !== 0;
      if (!live) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () {});
        return;
      }
      navigator.serviceWorker.register(dir + 'sw.js').catch(function () {});
    });
  }
})();
