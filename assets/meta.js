/* 部署地址自适应：canonical、og:url 与 og:image 按实际访问的域名与路径生成，
   仓库可 fork、可开任意 GitHub Pages 路径、可绑自定义域名，均无需改动源码。
   静态 HTML 里的同名标签保留上游默认值，供不执行 JS 的抓取器兜底；
   file:// 协议无源（origin 为 null），跳过改写。 */
(function () {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  var dir = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  var url = location.origin + location.pathname;
  var img = location.origin + dir + 'assets/logo/og-image.png';
  var set = function (sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:image"]', 'content', img);
})();
