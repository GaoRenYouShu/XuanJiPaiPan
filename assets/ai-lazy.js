/* ⚙AI 入口：面板脚本按需加载，首屏不下载整包；已加载则直接开。 */
(function () {
  'use strict';
  window.loadAiConfig = function () {
    if (typeof window.openAiConfig === 'function') { window.openAiConfig(); return; }
    if (window.__aiLoading) return;
    window.__aiLoading = true;
    var s = document.createElement('script');
    s.src = 'assets/ai.js';
    s.async = true;
    s.onload = function () {
      window.__aiLoading = false;
      if (typeof window.openAiConfig === 'function') window.openAiConfig();
    };
    s.onerror = function () { window.__aiLoading = false; };
    (document.head || document.documentElement).appendChild(s);
  };
})();
