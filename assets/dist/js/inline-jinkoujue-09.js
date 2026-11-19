(function () {
  'use strict';
  var current = null;
  var placeTrio = null;
  var HKEY = 'xj_jinkoujue_hist';
  var HCFG = {
    mask: 'jkHistMask',
    list: 'jkHistList',
    key: HKEY,
    title: '六壬金口诀历史（最多9条）',
    foot: '点击重开还原该次日期、时刻与地分。数据保存在浏览器本地。',
    row: function (h) {
      return { t: h.t, tt: h.tt || '', main: h.main || '', sub: h.sub || '' };
    },
    restoreFn: 'jinkoujueRestore',
    delFn: 'jinkoujueDel'
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function out() { return el('out'); }
  function line(t) { var n = el('jkLine'); if (n) n.textContent = t; }

  function renderRef() {
    var gb = el('jkGenBody'), nb = el('jkNobleBody');
    if (gb && window.JK_DATA) {
      gb.innerHTML = JK_DATA.generals.map(function (g) {
        return '<tr><td>' + esc(g.name) + '</td><td>' + esc(g.branch) + '</td><td>' + esc(g.elem + g.yy) + '</td><td>' + esc(g.month) + '</td><td>' + esc(g.sui) + '</td><td>' + esc(g.note) + '</td></tr>';
      }).join('');
    }
    if (nb && window.JK_DATA) {
      nb.innerHTML = JK_DATA.nobles.map(function (n) {
        return '<tr><td>' + esc(n.name) + '</td><td>' + esc(n.stem + n.branch) + '</td><td>' + esc(n.elem + n.yy) + '</td><td>' + esc(String(n.order)) + '</td><td>' + esc(n.note) + '</td></tr>';
      }).join('');
    }
  }

  function fourTable(r) {
    var rows = r.four.map(function (p) {
      var gz = p.stem ? p.stem + p.branch : p.branch;
      return '<tr><td>' + esc(p.role) + '</td><td>' + esc(p.name) + '</td><td>' + esc(gz) + '</td><td>' + esc(p.elem) + '</td><td>' + esc(p.yy) + '</td><td>' + esc(p.sub) + '</td></tr>';
    }).join('');
    return '<div class="jk-table-wrap"><table class="tbl-hs jk-table"><thead><tr><th>位</th><th>神将</th><th>干支</th><th>五行</th><th>阴阳</th><th>说明</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function patternRows(r) {
    var wu = r.wu.length ? r.wu.map(function (x) { return x.name; }).join('、') : '无';
    var san = r.san.length ? r.san.map(function (x) { return x.name; }).join('、') : '无';
    var sh = r.sanhe.length ? r.sanhe.map(function (x) { return x.name + (x.full ? '（全身）' : '（' + x.text + '）'); }).join('、') : '无';
    var lh = r.liuhe.length ? r.liuhe.join('、') : '无';
    var sq = r.sanqi.length ? r.sanqi.map(function (x) { return x.join(''); }).join('、') : '无';
    var kong = r.kong.join('、') + (r.kongHit.length ? '，落' + r.kongHit.map(function (p) { return p.name; }).join('、') : '');
    var po = r.po + (r.poHit.length ? '，落' + r.poHit.map(function (p) { return p.name; }).join('、') : '');
    return [
      ['五动', wu], ['三动', san], ['三合', sh], ['六合', lh], ['三奇', sq], ['空亡', kong], ['月破', po]
    ].map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td></tr>'; }).join('');
  }

  function renderResult(r) {
    var adj = r.adjustNote ? '；' + r.adjustNote : '';
    var mode = r.monthMode === 'qi' ? '月将按中气换将' : '月将按农历月取将';
    var html = '<section class="jk-result"><div class="mod-head"><span class="mod-title">起课结果</span></div><div class="mod-body">'
      + '<div class="sub-note">' + esc(r.date + ' ' + r.time + '，' + r.lunar + '；' + r.pillars + adj) + '</div>'
      + '<h3 class="rel-title">四位</h3>' + fourTable(r)
      + '<h3 class="rel-title">课体</h3><div class="jk-table-wrap"><table class="tbl-hs jk-table"><thead><tr><th>名目</th><th>所值</th></tr></thead><tbody>' + patternRows(r) + '</tbody></table></div>'
      + '<h3 class="rel-title">断语</h3><div class="jk-p">' + r.lines.map(esc).join('<br>') + '</div>'
      + '<p class="jk-note">' + esc(mode) + '；贵神昼夜以卯至申为昼、酉至寅为夜；课钤细目见底本。</p>'
      + '</div></section>';
    out().innerHTML = html;
  }

  function readInput() {
    var lng = el('jkLng').value.trim();
    var pto = typeof placeTimeOptsOf === 'function'
      ? placeTimeOptsOf({ prov: 'jkProv', city: 'jkCity', lng: 'jkLng' })
      : { overseas: false, baseLng: 120, lng: null };
    if (lng === '' && typeof coordOf === 'function') {
      var c = coordOf(el('jkProv').value, el('jkCity').value, el('jkDist').value);
      if (c && c.lng != null) lng = String(c.lng);
    }
    if (lng === '' && pto.overseas && pto.lng != null) lng = String(pto.lng);
    return {
      date: el('jDate').value.trim(), time: el('jTime').value.trim(), place: el('jPlace').value,
      dst: el('jDst').value, zi: el('jZi').value, sun: el('jSun').value, jiang: el('jJiang').value,
      lng: lng === '' ? null : Number(lng), baseLng: pto.baseLng == null ? 120 : pto.baseLng
    };
  }

  function run() {
    var inp = readInput();
    if (!inp.time) { line('请填写起课时刻'); out().innerHTML = '<p class="notice">请填写起课时刻。</p>'; return; }
    try {
      var r = Jinkoujue.compute(inp);
      current = r;
      renderResult(r);
      line('起课完成：' + r.pillars + '；地分' + r.place + '。');
      saveHist(r);
    } catch (e) {
      out().innerHTML = '<p class="notice">' + esc(e.message || '起课失败') + '</p>';
    }
  }

  function saveHist(r) {
    if (!window.xjHist) return;
    var entry = {
      t: r.date + ' ' + r.time,
      tt: r.pillars,
      main: r.noble.name + '临' + r.place + '，' + r.general.name + '为将',
      sub: r.lines[0] || '',
      data: { date: el('jDate').value.trim(), time: el('jTime').value.trim(), place: el('jPlace').value, dst: el('jDst').value, zi: el('jZi').value, sun: el('jSun').value, jiang: el('jJiang').value, lng: el('jkLng').value, prov: el('jkProv').value, city: el('jkCity').value, dist: el('jkDist').value }
    };
    xjHist.push(HKEY, entry, function (h) {
      return h.data && h.data.date === entry.data.date && h.data.time === entry.data.time && h.data.place === entry.data.place;
    });
  }

  function showHist() {
    if (!window.xjHist) { line('历史记录件未装载'); return; }
    xjHist.open(HCFG);
  }

  window.jinkoujueQuery = run;
  window.jinkoujueClear = function () {
    var o = out(); if (o) o.innerHTML = '';
    current = null;
    line('');
  };
  window.showJinkoujueHistory = showHist;
  window.jinkoujueRestore = function (i) {
    var h = window.xjHist && xjHist.get(HKEY, i);
    if (!h || !h.data) return;
    if (el('jDate')) el('jDate').value = h.data.date;
    if (el('jTime')) el('jTime').value = h.data.time;
    if (el('jPlace')) el('jPlace').value = h.data.place;
    if (placeTrio && h.data.prov) placeTrio.set(h.data.prov, h.data.city, h.data.dist);
    var map = { jDst: 'dst', jZi: 'zi', jSun: 'sun', jJiang: 'jiang', jkLng: 'lng' };
    Object.keys(map).forEach(function (id) {
      var v = h.data[map[id]];
      if (el(id) && v != null) el(id).value = v;
    });
    xjHist.close();
    run();
  };
  window.jinkoujueDel = function (i) {
    if (window.xjHist) xjHist.del(HCFG, i);
  };

  function aiContext() {
    if (!current) return '';
    var r = current;
    return ['六壬金口诀起课：' + r.date + ' ' + r.time + '，地分' + r.place + '。',
      (r.adjustNote ? '时刻折算：' + r.adjustNote + '。' : ''),
      '换将：' + (r.monthMode === 'qi' ? '中气换将' : '农历月取将') + '。',
      '四柱：' + r.pillars + '。', '月将：' + r.monthGeneral.name + '（' + r.monthGeneral.branch + '）；将神：' + r.general.name + '（' + r.general.branch + '）。',
      '贵神：' + r.noble.name + '临' + r.place + '，' + r.dayNight + '贵' + r.nobleDir + '行。',
      '人元：' + r.renYuan + '，将干：' + r.jiangGan + '。', '四位：' + r.four.map(function (p) { return p.role + p.name + (p.branch ? p.branch : '') + p.elem; }).join('、') + '。',
      '课体：' + (r.wu.map(function (x) { return x.name; }).join('、') || '无正动') + '；空亡' + r.kong.join('、') + '；月破' + r.po + '。',
      '断语：' + r.lines.join('')].join('\n');
  }

  function init() {
    if (typeof renderChrome === 'function') renderChrome('jinkoujue.html');
    if (typeof fillPlaceTrio === 'function') {
      placeTrio = fillPlaceTrio(el('jkProv'), el('jkCity'), el('jkDist'), null);
    }
    if (placeTrio && typeof placeIpPrefill === 'function') placeIpPrefill({ trio: placeTrio });
    renderRef();
    if (typeof mountAI === 'function') mountAI(aiContext, '六壬金口诀');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
