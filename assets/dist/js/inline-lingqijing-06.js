(function () {
  'use strict';
  var HKEY = 'xj_lingqijing_hist';
  var HCFG = {
    mask: 'lqHistMask',
    list: 'lqHistList',
    key: HKEY,
    title: '灵棋经历史（最多9条）',
    foot: '点击重开还原该次十二棋。数据保存在浏览器本地。',
    row: function (h) {
      return { t: h.t, tt: h.tt || '', main: h.main || '', sub: h.sub || '' };
    },
    restoreFn: 'lingqijingRestore',
    delFn: 'lingqijingDel'
  };
  var NUM = ['零', '一', '二', '三', '四'];
  var current = null;

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function out() { return el('out'); }
  function line(t) { var n = el('lqLine'); if (n) n.textContent = t; }
  function boxes() {
    return Array.prototype.slice.call(document.querySelectorAll('#lqBoard input[type=checkbox]'));
  }

  function readPieces() {
    var rows = [[], [], []];
    boxes().forEach(function (b) {
      rows[+b.getAttribute('data-g')][+b.getAttribute('data-i')] = b.checked ? 1 : 0;
    });
    return rows;
  }

  function setPieces(p) {
    boxes().forEach(function (b) {
      b.checked = !!(p && p[+b.getAttribute('data-g')] && p[+b.getAttribute('data-g')][+b.getAttribute('data-i')]);
    });
  }

  function countText(c) {
    return '上组 ' + NUM[c[0]] + ' 上、中组 ' + NUM[c[1]] + ' 上、下组 ' + NUM[c[2]] + ' 上';
  }

  function renderResult(r) {
    var e = r.entry;
    var c = r.counts;
    var rows = [
      ['课名', e.name + '卦'],
      ['课象', e.symbol || '—'],
      ['上组', NUM[c[0]] + ' 上'],
      ['中组', NUM[c[1]] + ' 上'],
      ['下组', NUM[c[2]] + ' 上'],
      ['课', r.key]
    ].map(function (x) {
      return '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td></tr>';
    }).join('');
    var extra = (e.extra || []).length
      ? e.extra.map(function (x) { return '<p class="lq-p">' + esc(x) + '</p>'; }).join('')
      : '';
    out().innerHTML = '<section class="lq-result"><div class="mod-head"><span class="mod-title">课象</span></div><div class="mod-body">'
      + '<div class="lq-name">' + esc(e.name + '卦') + '</div>'
      + '<div class="lq-symbol">' + esc(e.symbol || '—') + '</div>'
      + '<div class="lq-table-wrap"><table class="tbl-hs lq-table"><thead><tr><th>项</th><th>所值</th></tr></thead><tbody>'
      + rows + '</tbody></table></div>'
      + '<div class="lq-counts">' + esc(countText(c)) + '</div>'
      + '<h3 class="rel-title">象辞</h3><p class="lq-p">' + esc(e.xiang || '—') + '</p>'
      + '<h3 class="rel-title">诗</h3><p class="lq-p">' + esc(e.shi || '—') + '</p>'
      + extra
      + '<p class="lq-note">课名、象辞与诗据《灵棋经》底本；断语只就本课象义，不附会具体人事。</p>'
      + '</div></section>';
  }

  function run(cast) {
    if (cast) setPieces(Lingqijing.cast());
    try {
      var r = Lingqijing.compute(readPieces());
      current = r;
      renderResult(r);
      line('课成：' + r.entry.name + '卦　' + r.key + '。');
      saveHist(r);
    } catch (e) {
      out().innerHTML = '<p class="notice">' + esc(e.message || '起课失败') + '</p>';
    }
  }

  function saveHist(r) {
    if (!window.xjHist) return;
    var entry = {
      t: r.key,
      tt: r.entry.name + '卦　' + (r.entry.symbol || ''),
      main: r.entry.name + '卦',
      sub: r.entry.xiang || '',
      data: { pieces: r.pieces }
    };
    xjHist.push(HKEY, entry, function (h) {
      return h.data && JSON.stringify(h.data.pieces) === JSON.stringify(entry.data.pieces);
    });
  }

  function showHist() {
    if (!window.xjHist) { line('历史记录件未装载'); return; }
    xjHist.open(HCFG);
  }

  window.lingqijingCast = function () { run(true); };
  window.lingqijingQuery = function () { run(false); };
  window.lingqijingClear = function () {
    var o = out(); if (o) o.innerHTML = '';
    current = null;
    setPieces(null);
    line('');
  };
  window.showLingqijingHistory = showHist;
  window.lingqijingRestore = function (i) {
    var h = window.xjHist && xjHist.get(HKEY, i);
    if (!h || !h.data || !h.data.pieces) return;
    setPieces(h.data.pieces);
    xjHist.close();
    run(false);
  };
  window.lingqijingDel = function (i) {
    if (window.xjHist) xjHist.del(HCFG, i);
  };
  function aiContext() {
    if (!current) return '';
    var r = current;
    return ['灵棋经起课：' + r.key + '。',
      countText(r.counts) + '。',
      '课名：' + r.entry.name + '卦；' + (r.entry.symbol || '') + '。',
      '象辞：' + (r.entry.xiang || '—'),
      '诗：' + (r.entry.shi || '—'),
      ((r.entry.extra || []).join('') || '附辞：无')].join('\n');
  }

  function init() {
    if (typeof renderChrome === 'function') renderChrome('lingqijing.html');
    if (typeof mountAI === 'function') mountAI(aiContext, '灵棋经');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
