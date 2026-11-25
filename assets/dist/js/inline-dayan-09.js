(function () {
  'use strict';
  var current = null;
  var HKEY = 'xj_dayan_hist';
  var HCFG = {
    mask: 'dyHistMask',
    list: 'dyHistList',
    key: HKEY,
    title: '大衍筮法历史（最多9条）',
    foot: '点击重开还原该次六爻得数与日期时刻。数据保存在浏览器本地。',
    row: function (h) {
      return { t: h.t, tt: h.tt || '', main: h.main || '', sub: h.sub || '' };
    },
    restoreFn: 'dayanRestore',
    delFn: 'dayanDel'
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function out() { return el('out'); }
  function line(t) { var n = el('dyLine'); if (n) n.textContent = t; }

  /* 爻画：阳爻实条，阴爻断条，动爻加标记 */
  function lineHtml(bit, move, title) {
    return '<div class="dy-yao-row' + (move ? ' is-move' : '') + '">'
      + '<span class="dy-yao-name">' + esc(title) + '</span>'
      + '<div class="yb' + (bit ? '' : ' gap') + '">' + (bit ? '' : '<span></span><span></span>') + '</div>'
      + '<span class="dy-mv">' + (move ? '动' : '') + '</span>'
      + '</div>';
  }

  function boardHtml(info, bits, moving, label) {
    var rows = '', i, t;
    for (i = 5; i >= 0; i--) {
      t = DAYAN.titleOf(i, !!bits[i]);
      rows += lineHtml(bits[i], moving && moving.indexOf(i) >= 0, t);
    }
    return '<div class="dy-board"><div class="dy-board-h">' + esc(label + ' ' + info.name) + '</div>'
      + '<div class="dy-yao">' + rows + '</div>'
      + '<div class="dy-board-sub">上卦 ' + esc(info.upper) + '，下卦 ' + esc(info.lower) + '</div></div>';
  }

  function yaoTable(r) {
    var rows = '', i, y;
    for (i = 5; i >= 0; i--) {
      y = r.yao[i];
      rows += '<tr><td>' + esc(['初', '二', '三', '四', '五', '上'][i]) + '爻</td>'
        + '<td>' + esc(y.title) + '</td>'
        + '<td>' + esc(String(y.num)) + '</td>'
        + '<td>' + esc(y.name) + '</td>'
        + '<td>' + (y.move ? '动' : '静') + '</td>'
        + '<td>' + esc(y.ci || '无') + '</td></tr>';
    }
    return '<div class="dy-tbl-wrap"><table class="tbl-hs dy-tbl dy-tbl-wide">'
      + '<thead><tr><th>爻位</th><th>爻题</th><th>得数</th><th>爻性</th><th>动静</th><th>爻辞</th></tr></thead>'
      + '<tbody>' + rows + '</tbody></table></div>';
  }

  function pickHtml(r) {
    var head = '动爻 ' + r.nMove + ' 爻，' + (r.rule ? r.rule.look : '') + '；' + (r.rule ? r.rule.main : '');
    var rows = r.picks.map(function (p) {
      return '<div class="dy-pick-row"><span class="dy-pick-k">' + esc(p.label) + (p.main ? '（主）' : '') + '</span>'
        + '<span class="dy-pick-v">' + esc(p.text || '无') + (p.note ? '<br>' + esc(p.note) : '') + '</span></div>';
    }).join('');
    return '<div class="dy-pick"><div class="dy-pick-h">' + esc(head) + '</div>' + rows + '</div>';
  }

  function infoHtml(rows) {
    return '<div class="dy-info">' + rows.map(function (x) {
      return '<div class="dy-i"><span class="k">' + esc(x[0]) + '</span><span class="v">' + esc(x[1] || '无') + '</span></div>';
    }).join('') + '</div>';
  }

  function biansHtml(list) {
    var rows = list.map(function (y, i) {
      return '<tr><td>' + esc(['初', '二', '三', '四', '五', '上'][i]) + '爻</td>'
        + '<td>' + esc(String(y.bians[0].guai)) + '</td>'
        + '<td>' + esc(String(y.bians[1].guai)) + '</td>'
        + '<td>' + esc(String(y.bians[2].guai)) + '</td>'
        + '<td>' + esc(String(y.remain)) + '</td>'
        + '<td>' + esc(String(y.num)) + '</td></tr>';
    }).join('');
    return '<h3 class="rel-title">揲蓍明细</h3><div class="dy-tbl-wrap"><table class="tbl-hs dy-tbl dy-tbl-wide">'
      + '<thead><tr><th>爻位</th><th>一变归奇</th><th>二变归奇</th><th>三变归奇</th><th>余策</th><th>得数</th></tr></thead>'
      + '<tbody>' + rows + '</tbody></table></div>';
  }

  function render(r, bians) {
    var o = out();
    if (!o) return;
    var html = '';
    html += '<div class="dy-result">'
      + '<div class="dy-result-h">本卦 ' + esc(r.ben.name) + (r.nMove ? ' 之 ' + esc(r.bian.name) : '') + '</div>'
      + '<div class="dy-result-sub">' + (r.nMove
        ? '动爻 ' + r.nMove + ' 爻：' + r.moving.map(function (i) { return r.yao[i].title; }).join('、')
        : '六爻不变，占本卦卦辞') + '</div>'
      + '<div class="dy-boards">' + boardHtml(r.ben, r.bits, r.moving, '本卦')
      + (r.nMove ? boardHtml(r.bian, r.bianBits, null, '之卦') : '') + '</div>'
      + '</div>';
    html += '<h3 class="rel-title">六爻</h3>' + yaoTable(r);
    html += '<h3 class="rel-title">取用</h3>' + pickHtml(r);
    html += '<h3 class="rel-title">本卦辞象</h3>' + infoHtml([
      ['卦辞', r.guaCi], ['彖传', r.tuan], ['大象', r.daxiang]
    ]);
    if (r.nMove) {
      html += '<h3 class="rel-title">之卦辞象</h3>' + infoHtml([
        ['之卦', r.bian.name + '（上卦 ' + r.bian.upper + '，下卦 ' + r.bian.lower + '）'],
        ['卦辞', r.bianCi], ['彖传', r.bianTuan], ['大象', r.bianDaxiang]
      ]);
    }
    if (bians) html += biansHtml(bians);
    o.innerHTML = html;
  }

  function readManual() {
    var nums = [], i, v;
    for (i = 1; i <= 6; i++) {
      v = el('dyY' + i) ? Number(el('dyY' + i).value) : 7;
      nums.push(v);
    }
    return nums;
  }

  function setHidden(nums) {
    var i;
    if (el('dyCast')) el('dyCast').value = '1';
    for (i = 0; i < 6; i++) if (el('dyV' + (i + 1))) el('dyV' + (i + 1)).value = String(nums[i]);
  }

  function hiddenNums() {
    var nums = [], i, v;
    for (i = 1; i <= 6; i++) {
      v = el('dyV' + i) ? Number(el('dyV' + i).value) : 0;
      if (!v) return null;
      nums.push(v);
    }
    return nums;
  }

  function stamp() {
    var d = el('dyDate') ? el('dyDate').value : '';
    var t = el('dyTime') ? el('dyTime').value : '';
    return (d + ' ' + t).replace(/\s+$/, '');
  }

  function saveHist(r) {
    try {
      var arr = JSON.parse(localStorage.getItem(HKEY) || '[]');
      arr.unshift({
        t: stamp(),
        tt: el('dyQ') ? el('dyQ').value : '',
        main: '本卦 ' + r.ben.name + (r.nMove ? ' 之 ' + r.bian.name : ''),
        sub: '动爻 ' + r.nMove + ' 爻',
        data: {
          nums: r.nums,
          q: el('dyQ') ? el('dyQ').value : '',
          date: el('dyDate') ? el('dyDate').value : '',
          time: el('dyTime') ? el('dyTime').value : ''
        }
      });
      arr = arr.slice(0, 9);
      localStorage.setItem(HKEY, JSON.stringify(arr));
    } catch (e) {}
  }

  window.dayanCast = function () {
    var mode = el('dyMode') ? el('dyMode').value : 'auto';
    var nums, bians = null;
    if (mode === 'manual') {
      nums = readManual();
      if (nums.some(function (v) { return [6, 7, 8, 9].indexOf(v) < 0; })) { line('逐爻录入取值须为六、七、八、九'); return; }
    } else if (mode === 'step') {
      window.dayanStep();
      return;
    } else {
      bians = DAYAN.cast();
      nums = bians.map(function (y) { return y.num; });
    }
    setHidden(nums);
    current = DAYAN.build(nums);
    render(current, bians);
    line('已成卦：' + stamp());
    saveHist(current);
  };

  var YAO_CN = ['初', '二', '三', '四', '五', '上'];
  var BIAN_CN = ['一', '二', '三'];
  function stepNarrative(info) {
    var b = info.b, n = b.remain + b.guai;
    var rl = b.left % 4 === 0 ? 4 : b.left % 4;
    var rr = b.right % 4 === 0 ? 4 : b.right % 4;
    return YAO_CN[info.yao] + '爻第' + BIAN_CN[info.bian - 1] + '变：' + n + ' 策分二，左 ' + b.left + '、右 ' + (b.right + 1)
      + '；右取一策挂于指间；左揲四余 ' + rl + '，右揲四余 ' + rr + '；归奇 ' + b.guai + ' 策，余 ' + b.remain + ' 策。';
  }
  function stepRow(info) {
    var b = info.b;
    var rl = b.left % 4 === 0 ? 4 : b.left % 4;
    var rr = b.right % 4 === 0 ? 4 : b.right % 4;
    return '<tr><td>' + YAO_CN[info.yao] + '爻</td><td>' + BIAN_CN[info.bian - 1] + '变</td>'
      + '<td>左 ' + b.left + '，右 ' + (b.right + 1) + '</td><td>一策</td>'
      + '<td>左 ' + rl + '，右 ' + rr + '</td><td>' + b.guai + '</td><td>' + b.remain + '</td></tr>';
  }
  function stepPanel(on) {
    var p = el('dyStepPanel');
    if (p) p.classList.toggle('is-on', !!on);
  }
  function stepReset(keepNote) {
    DAYAN.stepReset();
    var body = el('dyStepBody'); if (body) body.innerHTML = '';
    if (el('dyStepNote')) el('dyStepNote').textContent = keepNote ? '' : '';
    line('第 0 变，共十八变');
  }

  window.dayanStep = function () {
    var info = DAYAN.stepNext();
    var body = el('dyStepBody');
    if (body && info.yao === 0 && info.bian === 1) body.innerHTML = '';
    if (body) body.insertAdjacentHTML('beforeend', stepRow(info));
    if (el('dyStepNote')) el('dyStepNote').textContent = stepNarrative(info);
    var total = info.state.yao * 3 + info.state.bian;
    line('第 ' + total + ' 变，共十八变');
    if (info.done) {
      setHidden(info.state.nums);
      current = DAYAN.build(info.state.nums);
      render(current, info.state.bians);
      line('十八变毕，已成卦：' + stamp());
      saveHist(current);
    }
  };

  window.dayanResetStep = function () {
    stepReset();
  };

  window.dayanClear = function () {
    var o = out(); if (o) o.innerHTML = '';
    current = null;
    line('');
    if (el('dyCast')) el('dyCast').value = '';
    [1, 2, 3, 4, 5, 6].forEach(function (i) { if (el('dyV' + i)) el('dyV' + i).value = ''; });
    if (el('dyQ')) el('dyQ').value = '';
    stepReset();
  };

  window.showDayanHistory = function () {
    if (!window.xjHist) { line('历史记录件未装载'); return; }
    xjHist.open(HCFG);
  };

  window.dayanRestore = function (i) {
    var h = window.xjHist && xjHist.get(HKEY, i);
    if (!h || !h.data) return;
    var d = h.data;
    if (el('dyMode')) el('dyMode').value = 'manual';
    toggleMode();
    if (el('dyQ')) el('dyQ').value = d.q || '';
    if (el('dyDate')) el('dyDate').value = d.date || '';
    if (el('dyTime')) el('dyTime').value = d.time || '';
    (d.nums || []).forEach(function (v, k) { if (el('dyY' + (k + 1))) el('dyY' + (k + 1)).value = String(v); });
    setHidden(d.nums || []);
    current = DAYAN.build(d.nums || []);
    render(current, null);
    line('已重开：' + (h.t || ''));
    xjHist.close();
  };

  window.dayanDel = function (i) {
    if (window.xjHist) xjHist.del(HCFG, i);
  };

  function toggleMode() {
    var mode = el('dyMode') ? el('dyMode').value : 'auto';
    var m = el('dyManual');
    if (m) m.classList.toggle('is-on', mode === 'manual');
    stepPanel(mode === 'step');
    var main = document.querySelector('.page > .form-row .btn.gold');
    if (main) main.textContent = mode === 'step' ? '下一变' : '揲蓍起卦';
  }

  function fillLook() {
    var s = el('dyLookSel');
    if (!s || !window.DAYAN_DATA) return;
    s.innerHTML = DAYAN_DATA.order.map(function (n) {
      return '<option value="' + esc(n) + '">' + esc(n) + '</option>';
    }).join('');
  }

  window.dayanLookup = function () {
    var s = el('dyLookSel');
    var box = el('dyLook');
    if (!s || !box) return;
    var r = DAYAN.lookup(s.value);
    if (!r) { box.innerHTML = '<p class="dy-p">未载此卦。</p>'; return; }
    var rows = r.yao.map(function (y, i) {
      return '<tr><td>' + esc(['初', '二', '三', '四', '五', '上'][i]) + '爻</td><td>' + esc(y.title) + '</td>'
        + '<td>' + esc(y.ci || '无') + '</td><td>' + esc(y.xiaoxiang || '无') + '</td></tr>';
    }).join('');
    box.innerHTML = '<h3 class="rel-title">' + esc(r.name + '（上卦 ' + r.upper + '，下卦 ' + r.lower + '）') + '</h3>'
      + infoHtml([['卦辞', r.guaCi], ['彖传', r.tuan], ['大象', r.daxiang]])
      + '<div class="dy-tbl-wrap"><table class="tbl-hs dy-tbl">'
      + '<thead><tr><th>爻位</th><th>爻题</th><th>爻辞</th><th>小象</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  };

  function aiContext() {
    if (!current) return '';
    var r = current;
    var parts = [];
    parts.push('大衍筮法起卦：' + stamp() + '。');
    if (el('dyQ') && el('dyQ').value) parts.push('所占之事：' + el('dyQ').value + '。');
    parts.push('六爻得数（自初爻至上爻）：' + r.nums.join('、') + '。');
    parts.push('本卦：' + r.ben.name + '（上卦 ' + r.ben.upper + '，下卦 ' + r.ben.lower + '）；之卦：' + (r.nMove ? r.bian.name : '无') + '。');
    parts.push('动爻：' + (r.nMove ? r.moving.map(function (i) { return r.yao[i].title; }).join('、') : '无') + '。');
    parts.push('取辞：' + (r.rule ? r.rule.text : '') + '所看之辞：' + (r.rule ? r.rule.look : '') + '。');
    parts.push('本卦卦辞：' + (r.guaCi || '无') + '；彖传：' + (r.tuan || '无') + '；大象：' + (r.daxiang || '无') + '。');
    if (r.nMove) parts.push('之卦卦辞：' + (r.bianCi || '无') + '。');
    r.picks.forEach(function (p) { parts.push(p.label + '：' + (p.text || '无') + (p.note ? '（' + p.note + '）' : '') + '。'); });
    return parts.join('\n');
  }

  function recast() {
    var nums = hiddenNums();
    if (!nums) return;
    current = DAYAN.build(nums);
    render(current, null);
    line('已还原：' + stamp());
  }

  function init() {
    if (typeof renderChrome === 'function') renderChrome('dayan.html');
    toggleMode();
    fillLook();
    if (el('dyMode')) el('dyMode').addEventListener('change', toggleMode);
    if (typeof mountAI === 'function') {
      mountAI(aiContext, '大衍筮法', { share: { page: 'dayan', title: '大衍筮法', recast: recast } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
