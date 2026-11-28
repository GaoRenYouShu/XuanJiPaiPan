/* 占察木轮页脚本（assets/zhancha.js）
 * 依赖：assets/zhancha-data.js、assets/hist-modal.js。
 * 掷轮为等概率模拟，每面等可能；结果只取数据件与经句，不从生成文案回读。 */
(function (g) {
  'use strict';

  var D = g.ZC_DATA || {};
  var TEN = D.ten || [];
  var JUDGE = D.tenJudge || [];
  var FOUR = D.four || [];
  var GROUPS = D.groups || [];
  var SIGNS = D.signs || [];
  var HIST_KEY = 'zcHistory';
  var RESULTS = { 1: null, 2: null, 3: null };
  var MODE_NAMES = ['', '第一轮相', '第二轮相', '第三轮相'];
  var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九'];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }
  function randInt(n) {
    if (g.crypto && g.crypto.getRandomValues) {
      var a = new Uint32Array(1);
      g.crypto.getRandomValues(a);
      return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  }
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function modeNow() { return val('zcMode') || '1'; }

  function signOf(n) {
    for (var i = 0; i < SIGNS.length; i++) if (SIGNS[i].n === n) return SIGNS[i];
    return null;
  }
  function groupOf(sign) { return sign ? GROUPS[sign.g] : null; }

  /* 十轮相：十轮各四面，一面善、一面恶、二面不现；同掷一次。 */
  function throwTen() {
    var faces = TEN.map(function () {
      var r = randInt(4);
      return r === 0 ? 'shan' : (r === 1 ? 'e' : 'none');
    });
    var shan = 0, e = 0;
    faces.forEach(function (f) { if (f === 'shan') shan++; else if (f === 'e') e++; });
    var none = faces.length - shan - e;
    var key = shan === 10 ? '纯具十善'
      : e === 10 ? '纯具十恶'
        : (shan && e) ? '善恶交杂'
          : shan ? '纯善不具'
            : e ? '纯恶不具' : '善恶俱不现';
    return { m: 1, faces: faces, shan: shan, e: e, none: none, key: key };
  }

  /* 三轮相：身口意各一轮，四面为大画、小画、粗刻、细刻；按所观之业别掷。 */
  function throwFour() {
    var idx = randInt(4);
    return { m: 2, body: val('zcBody') || '身', face: FOUR[idx].key, idx: idx };
  }

  /* 六轮相：六轮各三面书数、一面空白；一掷计六轮朝上数之和，三掷合计。 */
  function throwSix() {
    var wheels = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15], [16, 17, 18]];
    var throws = [], total = 0;
    for (var t = 0; t < 3; t++) {
      var faces = [], sum = 0;
      for (var i = 0; i < 6; i++) {
        var r = randInt(4);
        var v = r < 3 ? wheels[i][r] : 0;
        faces.push(v);
        sum += v;
      }
      throws.push({ faces: faces, sum: sum });
      total += sum;
    }
    return { m: 3, throws: throws, total: total, sign: total > 0 ? total : 0 };
  }

  function faceWord(f) { return f === 'shan' ? '善' : (f === 'e' ? '恶' : '不现'); }
  function askLine(r) {
    var q = (r && r.q != null) ? r.q : val('zcQuestion');
    return q ? '<p class="zc-ask">所观主念：' + esc(q) + '</p>' : '';
  }
  function faceName(i, f) {
    var it = TEN[i];
    return f === 'shan' ? it.shan : (f === 'e' ? it.e : '不现');
  }

  function htmlTen(r) {
    var cards = r.faces.map(function (f, i) {
      var cls = f === 'shan' ? 'shan' : (f === 'e' ? 'e' : 'none');
      return '<div class="zc-wheel ' + cls + '"><span class="zc-part">' + esc(TEN[i].part) + '</span>'
        + '<span class="zc-face">' + esc(faceName(i, f)) + '</span></div>';
    }).join('');
    var judge = null;
    JUDGE.forEach(function (j) { if (j.key === r.key) judge = j; });
    return '<div class="zc-result zc-result-ten">'
      + '<h3 class="rel-title">第一轮相：十轮占宿世善恶业</h3>'
      + askLine(r)
      + '<div class="zc-wheels">' + cards + '</div>'
      + '<p class="zc-count">善面 ' + r.shan + '，恶面 ' + r.e + '，不现 ' + r.none + '</p>'
      + '<p class="zc-judge">判：' + esc(r.key) + '</p>'
      + '<p class="zc-quote">经说：应知占其轮相者，随所现业，悉应一一谛观思验。或纯具十善，或纯具十恶，或善恶交杂，或纯善不具，或纯恶不具。如是业因，种类不同，习气果报，各各别异。</p>'
      + (judge ? '<p class="zc-read">' + esc(judge.read) + '</p>' : '')
      + '<p class="zc-advice">读法：善面所现者续修令增上，恶面所现者忏悔令损减；善恶交杂者逐条省察，不以一次占察为定论。</p>'
      + '<p class="sub-note">经称若占轮相善恶业俱不现者，此人已证无漏智心，专求出离；纯善不具、纯恶不具者，余业微弱未能牵果，是故不现。</p>'
      + '</div>';
  }

  function htmlFour(r) {
    var f = FOUR[r.idx] || FOUR[0];
    var kind = f.kind === '善' ? '善业' : '恶业';
    return '<div class="zc-result zc-result-four">'
      + '<h3 class="rel-title">第二轮相：' + esc(r.body) + '业集业久近</h3>'
      + askLine(r)
      + '<div class="zc-one"><span class="zc-one-b">' + esc(f.key) + '</span>'
      + '<span class="zc-one-k">' + esc(kind + f.level) + '</span></div>'
      + '<p class="zc-mark">刻法：' + esc(f.mark) + '</p>'
      + '<p class="zc-quote">经说：当知善业庄严犹如画饰，恶业衰害犹如损刻。其画长大者，显示积善来久，行业猛利，所作增上；其画细短者，显示积善来近，始习基钝，所作微薄；其刻粗深者，显示习恶来久，所作增上，余殃亦厚；其刻细浅者，显示退善来近，始习恶法，所作之业未至增上。</p>'
      + '<p class="zc-read">' + esc(f.read) + '</p>'
      + '<p class="zc-advice">读法：善业大者续修，善业小者培植，恶业大者速忏，恶业小者勿令增长；第二轮的相须与初轮所现之业相应。</p>'
      + '<p class="sub-note">经称三轮之相不得一掷通占，应依初轮所现之业，属身掷身轮、属口掷口轮、属意掷意轮，随业主念别掷。</p>'
      + '</div>';
  }

  function throwCell(faces) {
    return faces.map(function (v) { return v ? String(v) : '空'; }).join(' ');
  }

  function htmlSix(r) {
    var rows = r.throws.map(function (t, i) {
      return '<tr><td>第 ' + (i + 1) + ' 掷</td><td>' + esc(throwCell(t.faces)) + '</td><td>' + t.sum + '</td></tr>';
    }).join('');
    var sign = r.total > 0 ? signOf(r.total) : null;
    var grp = groupOf(sign);
    var body = '';
    if (sign) {
      body = '<div class="zc-sign"><span class="zc-sign-no">第 ' + sign.n + ' 相</span>'
        + '<span class="zc-sign-t">' + esc(sign.t) + '</span>'
        + '<span class="zc-sign-g">' + esc(grp ? grp.name : '') + '</span></div>'
        + '<p class="zc-quote">经说：' + esc(sign.t) + '。</p>'
        + (grp ? '<p class="zc-read">归类读法：' + esc(grp.note) + '</p>' : '');
    } else {
      body = '<p class="zc-null">三掷皆无所现。经称此人则名已得无所得也，不作轮相解。</p>';
    }
    return '<div class="zc-result zc-result-six">'
      + '<h3 class="rel-title">第三轮相：六轮三掷占三世果报</h3>'
      + askLine(r)
      + '<div class="tbl-hs"><table class="zc-tbl zc-throws"><thead><tr><th>掷次</th><th>六轮朝上数</th><th>合计</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      + '<p class="zc-total">三掷合数：' + r.total + '</p>'
      + body
      + '<p class="zc-advice">读法：先看合数与所观主念是否相当，再看轮相与归类；数与意不相当者名虚谬，宜更至心再占。</p>'
      + '<p class="sub-note">经称若其所掷所合之数，与心所观主念之事不相当者，谓不至心，名为虚谬；占者宜更至心再占，不以一次为准。</p>'
      + '</div>';
  }

  function htmlOf(r) {
    if (!r) return '';
    if (r.m === 1) return htmlTen(r);
    if (r.m === 2) return htmlFour(r);
    return htmlSix(r);
  }

  function shortOf(r) {
    if (!r) return '未占';
    if (r.m === 1) return r.key;
    if (r.m === 2) return r.body + '业 ' + r.face;
    if (r.total > 0) {
      var s = signOf(r.total);
      return '第 ' + r.total + ' 相' + (s ? ' ' + s.t : '');
    }
    return '无所得';
  }
  function summaryHtml() {
    var cur = modeNow();
    return '<div class="zc-summary">' + [1, 2, 3].map(function (m) {
      var r = RESULTS[m];
      var cls = 'zc-sum' + (String(m) === cur ? ' cur' : '') + (r ? '' : ' none');
      return '<div class="' + cls + '" role="button" tabindex="0" onclick="zcSwitch(' + m + ')">'
        + '<span class="zc-sum-m">' + MODE_NAMES[m] + '</span>'
        + '<span class="zc-sum-r">' + esc(shortOf(r)) + '</span></div>';
    }).join('') + '</div>';
  }
  function renderCurrent() {
    var out = $('out');
    if (!out) return;
    if (!RESULTS[1] && !RESULTS[2] && !RESULTS[3]) { out.innerHTML = ''; return; }
    var r = RESULTS[modeNow()];
    out.innerHTML = summaryHtml() + (r ? htmlOf(r)
      : '<p class="zc-empty">本轮尚未掷轮，点掷轮占察得本轮结果；上方可切换回看已得轮次。</p>');
  }
  function show(r) {
    RESULTS[r.m] = r;
    renderCurrent();
  }
  function switchMode(m) {
    var sel = $('zcMode');
    if (sel) sel.value = String(m);
    syncModeUI();
    renderCurrent();
  }

  function titleOf(r) {
    if (!r) return '';
    if (r.m === 1) return '第一轮相 ' + r.key;
    if (r.m === 2) return '第二轮相 ' + r.body + '业 ' + r.face;
    if (r.total > 0) {
      var s = signOf(r.total);
      return '第三轮相 第 ' + r.total + ' 相' + (s ? ' ' + s.t : '');
    }
    return '第三轮相 无所得';
  }

  /* 历史记录存掷轮结果本身，还原时按原结果重绘，不重掷。 */
  function saveHist(r) {
    try {
      var snap = { 1: RESULTS[1], 2: RESULTS[2], 3: RESULTS[3] };
      xjHist.push(HIST_KEY, { t: new Date().toLocaleString(), r: r, all: snap, q: r.q || val('zcQuestion') }, function (h) {
        return JSON.stringify(h.r) === JSON.stringify(r) && h.q === (r.q || val('zcQuestion'));
      });
    } catch (e) { /* 历史件未就绪即不记 */ }
  }
  var HIST_CFG = {
    mask: 'zcHistMask', list: 'zcHistList', key: HIST_KEY, title: '占察记录（最多9条）',
    restoreFn: 'zcRestoreHist', delFn: 'zcDelHist',
    row: function (h) { return { t: h.t || '', main: titleOf(h.r) }; }
  };
  function openHist() { try { xjHist.open(HIST_CFG); } catch (e) { } }
  function closeHist() { try { xjHist.close(); } catch (e) { } }
  function delHist(i) { try { xjHist.del(HIST_CFG, i); } catch (e) { } }
  function restoreHist(i) {
    try {
      var his = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
      var h = his[i];
      if (!h || !h.r) return;
      var all = h.all || {};
      RESULTS = { 1: all[1] || null, 2: all[2] || null, 3: all[3] || null };
      RESULTS[h.r.m] = h.r;
      var m = String(h.r.m);
      if ($('zcMode')) $('zcMode').value = m;
      if (h.r.m === 2 && $('zcBody')) $('zcBody').value = h.r.body || '身';
      if (h.q != null && $('zcQuestion')) $('zcQuestion').value = h.q;
      syncModeUI();
      renderCurrent();
      closeHist();
      var out = $('out');
      if (out) out.scrollIntoView({ behavior: 'smooth' });
    } catch (e) { }
  }

  function ruleText(m) {
    if (m === '2') return '第二轮相：依初轮所现之业，属身掷身轮、属口掷口轮、属意掷意轮，三轮之相不得一掷通占。';
    if (m === '3') return '第三轮相：六轮同掷为一掷，一掷计六轮朝上数字之和，三掷合计得一轮相，合数一至一百八十九。';
    return '第一轮相：十轮同掷一次，十枚各出善面、恶面或不现。';
  }
  function syncModeUI() {
    var m = modeNow();
    var bf = $('zcBodyField');
    if (bf) bf.hidden = m !== '2';
    var rl = $('zcRule');
    if (rl) rl.textContent = ruleText(m);
  }

  function throwRite() {
    var m = modeNow();
    var r = m === '2' ? throwFour() : (m === '3' ? throwSix() : throwTen());
    r.q = val('zcQuestion');
    var out = $('out');
    if (out) out.innerHTML = '<p class="zc-rolling">掷轮中</p>';
    setTimeout(function () {
      if (r.m === 2 && !r.body) r.body = '身';
      show(r);
      saveHist(r);
    }, 600);
  }

  function renderTables() {
    var ten = $('zcTenBody');
    if (ten) {
      var rows = TEN.map(function (t) {
        return '<tr><td>' + esc(t.part) + '</td><td>' + esc(t.shan) + '</td><td>' + esc(t.e) + '</td></tr>';
      }).join('');
      var jrows = JUDGE.map(function (j) {
        return '<tr><td>' + esc(j.key) + '</td><td>' + esc(j.cond) + '</td><td>' + esc(j.read) + '</td></tr>';
      }).join('');
      ten.innerHTML = '<div class="tbl-hs"><table class="zc-tbl"><thead><tr><th>身口意</th><th>善面</th><th>恶面</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        + '<h4 class="det-h">初轮判法</h4>'
        + '<div class="tbl-hs"><table class="zc-tbl"><thead><tr><th>判</th><th>所现</th><th>读法</th></tr></thead><tbody>' + jrows + '</tbody></table></div>';
    }
    var four = $('zcFourBody');
    if (four) {
      var frows = FOUR.map(function (f) {
        return '<tr><td>' + esc(f.key) + '</td><td>' + esc(f.mark) + '</td><td>' + esc(f.read) + '</td></tr>';
      }).join('');
      four.innerHTML = '<div class="tbl-hs"><table class="zc-tbl"><thead><tr><th>相</th><th>刻法</th><th>所主</th></tr></thead><tbody>' + frows + '</tbody></table></div>';
    }
    var host = $('zcSignsBody');
    if (host) {
      var html = '';
      GROUPS.forEach(function (gp, gi) {
        html += '<tr class="zc-grp"><th colspan="3">' + CN[gi] + '、' + esc(gp.name) + '：' + esc(gp.note) + '</th></tr>';
        SIGNS.forEach(function (s) {
          if (s.g === gi) html += '<tr><td>' + s.n + '</td><td>' + esc(s.t) + '</td><td>' + esc(gp.name) + '</td></tr>';
        });
      });
      host.innerHTML = '<div class="tbl-hs"><table class="zc-tbl zc-signs"><thead><tr><th>序号</th><th>轮相</th><th>归类</th></tr></thead><tbody>' + html + '</tbody></table></div>';
    }
  }

  function ctxLines(r) {
    var lines = [];
    if (r.m === 1) {
      lines.push('十轮面：' + r.faces.map(function (f, i) { return TEN[i].part + '业' + faceName(i, f); }).join('；'));
      lines.push('善面 ' + r.shan + '，恶面 ' + r.e + '，不现 ' + r.none);
      lines.push('经句：或纯具十善，或纯具十恶，或善恶交杂，或纯善不具，或纯恶不具。');
    } else if (r.m === 2) {
      var f = FOUR[r.idx];
      lines.push('所观之业：' + r.body + '业');
      lines.push('相：' + f.key + '，' + f.read);
    } else {
      lines.push('三掷：' + r.throws.map(function (t) { return throwCell(t.faces) + ' 合计 ' + t.sum; }).join('；'));
      lines.push('合数：' + r.total);
      if (r.total > 0) {
        var s = signOf(r.total);
        var gp = groupOf(s);
        if (s) lines.push('轮相：第 ' + s.n + ' 相，' + s.t);
        if (gp) lines.push('归类：' + gp.name + '，' + gp.note);
      } else {
        lines.push('三掷皆无所现，经称已得无所得，不作轮相解。');
      }
    }
    return lines;
  }
  function aiContext() {
    if (!RESULTS[1] && !RESULTS[2] && !RESULTS[3]) return '';
    var q = val('zcQuestion');
    var lines = ['占察木轮'];
    if (q) lines.push('所观主念：' + q);
    [1, 2, 3].forEach(function (m) {
      var r = RESULTS[m];
      if (!r) return;
      lines.push(MODE_NAMES[m] + '：' + shortOf(r));
      ctxLines(r).forEach(function (x) { lines.push(x); });
    });
    lines.push('本页依《占察善恶业报经》演示，不作吉凶承诺；数与所观不相当者名虚谬。');
    return lines.join('\n');
  }

  function shareCollect() {
    if (!RESULTS[1] && !RESULTS[2] && !RESULTS[3]) return {};
    return { q: val('zcQuestion'), m: modeNow(), results: RESULTS };
  }
  function shareRestore(d) {
    if (!d) return;
    try {
      var all = d.results || {};
      RESULTS = { 1: all[1] || null, 2: all[2] || null, 3: all[3] || null };
      if (d.r && d.r.m) RESULTS[d.r.m] = d.r;
      var m = String(d.m || (d.r && d.r.m) || (RESULTS[1] ? '1' : (RESULTS[2] ? '2' : '3')));
      if ($('zcMode')) $('zcMode').value = m;
      var cur = RESULTS[m];
      if (cur && cur.m === 2 && $('zcBody')) $('zcBody').value = cur.body || '身';
      if (d.q && $('zcQuestion')) $('zcQuestion').value = d.q;
      syncModeUI();
      renderCurrent();
    } catch (e) { }
  }

  function init() {
    var sel = $('zcMode');
    if (sel) sel.addEventListener('change', function () { syncModeUI(); renderCurrent(); });
    renderTables();
    syncModeUI();
  }

  g.ZC = {
    init: init, throwRite: throwRite, openHist: openHist, closeHist: closeHist,
    delHist: delHist, restoreHist: restoreHist, aiContext: aiContext,
    shareCollect: shareCollect, shareRestore: shareRestore, syncModeUI: syncModeUI,
    switchMode: switchMode
  };
})(window);

function zcThrow() { ZC.throwRite(); }
function zcHistory() { ZC.openHist(); }
function zcRestoreHist(i) { ZC.restoreHist(i); }
function zcDelHist(i) { ZC.delHist(i); }
function zcSwitch(m) { ZC.switchMode(m); }
