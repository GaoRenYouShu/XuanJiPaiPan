/* 历史记录弹层共享组件（六爻、梅花、灵签共用）：统一列结构、按钮与脚注，ESC 与点遮罩关闭 */
(function () {
  var OPEN = null;
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function write(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }
  function close() {
    if (OPEN) { OPEN.classList.remove('show'); OPEN = null; }
  }
  var escBound = false;
  function bindEsc() {
    if (escBound) return;
    escBound = true;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  function render(cfg) {
    var host = document.getElementById(cfg.list);
    if (!host) return;
    var his = read(cfg.key);
    if (!his.length) { host.innerHTML = '<div class="hist-empty">暂无历史记录。</div>'; return; }
    var rowOf = cfg.row || function () { return {}; };
    var html = '';
    for (var i = 0; i < his.length; i++) {
      var r = rowOf(his[i], i) || {};
      html += '<div class="hist-row">'
        + '<span class="hist-t">' + esc(r.t || '') + (r.tt ? '<br><span class="hist-q">' + esc(r.tt) + '</span>' : '') + '</span>'
        + '<span class="hist-g">' + esc(r.main || '') + (r.sub ? '<br><span class="hist-q">' + esc(r.sub) + '</span>' : '') + '</span>'
        + '<span class="hist-a">'
        + '<button class="btn hist-act" aria-label="重开第' + (i + 1) + '条" onclick="' + cfg.restoreFn + '(' + i + ')">重开</button>'
        + '<button class="btn hist-del" aria-label="删除第' + (i + 1) + '条" onclick="' + cfg.delFn + '(' + i + ')">×</button>'
        + '</span></div>';
    }
    host.innerHTML = html;
  }
  function open(cfg) {
    var mask = document.getElementById(cfg.mask);
    if (!mask) {
      mask = document.createElement('div');
      mask.id = cfg.mask;
      mask.className = 'modal-mask';
      mask.setAttribute('role', 'dialog');
      mask.setAttribute('aria-label', cfg.title || '历史记录');
      mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
      document.body.appendChild(mask);
    }
    mask.innerHTML = '<div class="modal hist-modal">'
      + '<span class="close" onclick="xjHist.close()" aria-label="关闭">×</span>'
      + '<div class="ly-hist-head">' + esc(cfg.title || '历史记录（最多9条）') + '</div>'
      + '<div class="hist-list" id="' + cfg.list + '"></div>'
      + '<div class="sub-note hist-foot">' + esc(cfg.foot || '点击重开还原该次记录。数据保存在浏览器本地。') + '</div>'
      + '</div>';
    render(cfg);
    mask.classList.add('show');
    OPEN = mask;
    bindEsc();
  }
  function del(cfg, i) {
    var his = read(cfg.key);
    if (i < 0 || i >= his.length) return;
    his.splice(i, 1);
    write(cfg.key, his);
    render(cfg);
  }
  /* 存档：九条上限、去重置顶；same 为判同函数，省略即不去重 */
  function push(key, entry, same) {
    try {
      var his = read(key);
      var dup = -1;
      if (same) {
        for (var i = 0; i < his.length; i++) { if (same(his[i], entry)) { dup = i; break; } }
      }
      if (dup >= 0) his.splice(dup, 1);
      his.unshift(entry);
      write(key, his.slice(0, 9));
    } catch (e) {}
  }
  /* 定长时刻串：YYYY-MM-DD HH:MM */
  function time() {
    var n = new Date(), p2 = function (x) { return (x < 10 ? '0' : '') + x; };
    return n.getFullYear() + '-' + p2(n.getMonth() + 1) + '-' + p2(n.getDate()) + ' ' + p2(n.getHours()) + ':' + p2(n.getMinutes());
  }
  /* 抽牌类存档：o={sp, q, sig, main, picks}，同牌阵同所问同牌序去重置顶 */
  function savePicks(key, o) {
    if (!o || !o.main) return;
    var e = { t: time(), sp: o.sp, q: o.q || '', main: o.main, picks: o.picks };
    if (o.sig) e.sig = o.sig;
    e.sub = e.q;
    push(key, e, function (h) { return h.sp === e.sp && h.q === e.q && JSON.stringify(h.picks) === JSON.stringify(e.picks); });
  }
  /* 表单收集与回填：字段表由页面给，共享件只按 id 读写 */
  function collect(ids) {
    var o = {};
    (ids || []).forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      o[id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return o;
  }
  function apply(ids, o) {
    (ids || []).forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      if (el.type === 'checkbox') el.checked = !!(o && o[id]);
      else el.value = (o && o[id] != null) ? o[id] : '';
      if (el.tagName === 'SELECT') el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  function keyOf(o) {
    if (!o) return '';
    return Object.keys(o).sort().map(function (k) { return k + '=' + String(o[k]); }).join('|');
  }
  function get(key, i) {
    var his = read(key);
    return his[i] || null;
  }
  window.xjHist = {
    open: open, close: close, render: render, del: del, push: push, time: time, savePicks: savePicks,
    collect: collect, apply: apply, key: keyOf, get: get
  };
})();
