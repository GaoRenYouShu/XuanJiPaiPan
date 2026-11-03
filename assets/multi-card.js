/* 连占对比卡共享件（六爻、梅花、小六壬共用）：勾选模式后每占追加一卡，卡头带序号、摘要与移除钮 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hostOf(cfg) { return document.getElementById(cfg.host); }
  function on(cfg) { var c = document.getElementById(cfg.check); return !!(c && c.checked); }
  function add(cfg, html, summary) {
    var host = hostOf(cfg);
    if (!host) return false;
    var n = host.querySelectorAll('.multi-card').length + 1;
    var card = document.createElement('div');
    card.className = 'multi-card';
    card.innerHTML = '<div class="multi-head"><span class="multi-no">第' + n + '占</span><span class="multi-info">' + esc(summary || '')
      + '</span><button type="button" class="btn multi-del" aria-label="移除本占" onclick="this.closest(\'.multi-card\').remove()">移除</button></div>' + html;
    host.appendChild(card);
    return true;
  }
  function clear(cfg) { var h = hostOf(cfg); if (h) h.innerHTML = ''; }
  window.xjMulti = { on: on, add: add, clear: clear };
})();
