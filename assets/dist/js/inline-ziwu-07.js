/* 子午流注页：当令查询、十二经脉、穴位查询、特定穴、十二时辰经络盘与经络源流。 */
(function () {
  'use strict';

  var CURRENT_IDX = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function hasData() { return !!(window.JL && window.JL.POINTS && window.JL.MERIDIANS); }
  function meridians() { return hasData() ? window.JL.MERIDIANS : []; }
  function points() { return hasData() ? window.JL.POINTS : []; }
  function shiling() { return (typeof window.SHILING_JINGLUO !== 'undefined' && window.SHILING_JINGLUO) ? window.SHILING_JINGLUO : []; }
  function meridianOf(id) { var a = meridians(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function pointOf(name) { var a = points(); for (var i = 0; i < a.length; i++) if (a[i].name === name) return a[i]; return null; }
  function shilingOfShichen(zhi) { var a = shiling(); for (var i = 0; i < a.length; i++) if (a[i].zhi === zhi) return a[i]; return null; }
  function meridianByShichen(zhi) { var a = meridians(); for (var i = 0; i < a.length; i++) if (a[i].shichen === zhi) return a[i]; return null; }
  function xingOf(m) { if (m.xingFull) return m.xingFull; var s = shilingOfShichen(m.shichen); return s ? s.xingFull : ''; }
  function zzBrief(p) { return p && p.zz ? p.zz : '未载'; }

  var QI_STATUS = {
    子:'气血初生，胆气主令', 丑:'肝血归藏，解毒修复', 寅:'肺朝百脉，气血重新分布', 卯:'大肠传导，排浊外出',
    辰:'胃气最旺，受纳运化', 巳:'脾气升清，脑力体力最盛', 午:'心气主令，血脉神明', 未:'小肠泌别清浊',
    申:'膀胱经气旺，代谢排毒', 酉:'肾藏精，气血归肾', 戌:'心包代心受邪，情志舒缓', 亥:'三焦通百脉，准备入睡'
  };

  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  function parseTime(s) {
    var m = /^(\d{2}):(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return { h: h, mi: mi };
  }
  function zhiIndex(h) { return Math.floor(((h + 1) % 24) / 2); }

  function markStrip(idx) {
    var cells = document.querySelectorAll('.page-ziwu .jl-strip-cell');
    for (var i = 0; i < cells.length; i++) cells[i].classList.toggle('on', i === idx);
  }
  function openMod(id) { var s = $(id); if (s) s.classList.remove('collapsed'); }

  function nowCard(j, next) {
    return '<section class="jl-now">'
      + '<div class="jl-now-head">'
      + '<span class="jl-now-zhi">' + esc(j.zhi) + '时</span>'
      + '<span class="jl-now-range">' + esc(j.range) + '</span>'
      + '<span class="jl-now-tag">' + esc(j.jing) + '当令</span>'
      + '</div>'
      + '<div class="jl-now-jing">' + esc(j.full) + '</div>'
      + '<dl class="jl-now-kv">'
      + '<div><dt>属络</dt><dd>' + esc(j.shu) + '</dd></div>'
      + '<div><dt>循行</dt><dd>' + esc(j.xingFull) + '</dd></div>'
      + '<div><dt>当令宜做</dt><dd>' + esc(j.yi) + '</dd></div>'
      + '<div><dt>下一时辰</dt><dd>' + esc(next.zhi) + '时 ' + esc(next.jing) + ' ' + esc(next.range) + '</dd></div>'
      + '</dl>'
      + '<div class="jl-now-flow">气血自上一时辰转注本经，本时辰以本经为当令，至下一时辰转注下一经。</div>'
      + '<div class="jl-now-song">纳支歌：肺寅大卯胃辰宫，脾巳心午小未中，申膀酉肾心包戌，亥焦子胆丑肝通。</div>'
      + '</section>';
  }

  function stripHtml(idx) {
    var list = shiling();
    var h = '<div class="jl-strip" aria-label="十二时辰经络对照">';
    list.forEach(function (j, i) {
      h += '<div class="jl-strip-cell' + (i === idx ? ' on' : '') + '" data-i="' + i + '" onclick="jlPickShichen(' + i + ')">'
        + '<b>' + esc(j.zhi) + '</b><span>' + esc(j.jing) + '</span><i title="' + esc(j.range) + '">' + esc(String(j.range).replace(/:00/g, '')) + '</i></div>';
    });
    return h + '</div>';
  }

  function renderAt(idx) {
    var out = $('jlOut');
    if (!out) return;
    var list = shiling();
    if (!list[idx]) return;
    CURRENT_IDX = idx;
    out.innerHTML = stripHtml(idx) + nowCard(list[idx], list[(idx + 1) % 12]);
    markStrip(idx);
  }

  function renderNow() {
    var out = $('jlOut');
    if (!out) return;
    var d = parseDate($('jlDate') ? $('jlDate').value : '');
    var t = parseTime($('jlTime') ? $('jlTime').value : '');
    if (!d || !t) {
      out.innerHTML = '<div class="jl-empty">请输入公历日期与时刻，日期形如 2026-11-06。</div>';
      return;
    }
    if (!shiling().length) {
      out.innerHTML = '<div class="jl-empty">经络时辰表未载，请刷新页面重试。</div>';
      return;
    }
    renderAt(zhiIndex(t.h));
  }
  window.jlPickShichen = function (i) {
    var list = shiling();
    if (!list[i]) return;
    var t = $('jlTime');
    if (t) { t.value = String(list[i].range).slice(0, 5); t.setAttribute('data-user-set', '1'); }
    renderAt(i);
  };

  /* ---------- 十二经脉 ---------- */
  function renderMeridians() {
    var out = $('jlMeridianOut');
    if (!out) return;
    var a = meridians();
    if (!a.length) { out.innerHTML = '<div class="jl-empty">经脉数据未载。</div>'; return; }
    var h = '<div class="jl-tbl-wrap"><table class="jl-tbl"><thead><tr><th>经脉</th><th>脏腑</th><th>五行</th><th>当令</th><th>穴数</th><th>表里</th></tr></thead><tbody>';
    a.forEach(function (m) {
      var zf = m.zang && m.fu ? m.zang + '、' + m.fu : '奇经';
      h += '<tr data-mid="' + esc(m.id) + '"><td class="jl-c0">' + esc(m.name) + '</td><td>' + esc(zf) + '</td><td>' + esc(m.wuxing || '不属五行') + '</td><td>' + esc(m.shichen ? m.shichen + '时 ' + m.range : '无') + '</td><td>' + esc(m.count) + '</td><td>' + esc(m.biaoli || '无') + '</td></tr>';
    });
    h += '</tbody></table></div><div class="jl-note">点经脉行看循行、病候与穴位。</div>';
    out.innerHTML = h;
    renderMeridianDetail('lung');
  }

  function renderMeridianDetail(mid) {
    var out = $('jlMeridianDetail');
    if (!out) return;
    var m = meridianOf(mid);
    if (!m) { out.innerHTML = ''; return; }
    var xing = xingOf(m);
    var pts = points().filter(function (p) { return p.meridian === mid; });
    var names = pts.length ? pts.map(function (p) { return '<a href="javascript:void(0)" data-point="' + esc(p.name) + '">' + esc(p.name) + '</a>'; }).join('、') : '本经无本经穴，交会穴见八脉交会穴表';
    out.innerHTML = '<div class="jl-card"><h4><b>' + esc(m.name) + '</b> 循行、病候与穴位</h4>'
      + '<dl class="jl-kv">'
      + '<div><dt>循行</dt><dd>' + esc(xing || '未载') + '</dd></div>'
      + '<div><dt>病候</dt><dd>' + esc(m.binghou || '未载') + '</dd></div>'
      + '<div><dt>穴位</dt><dd>' + names + '</dd></div>'
      + '<div><dt>出处</dt><dd class="jl-src">' + esc(m.classic || '未载') + '</dd></div>'
      + '</dl></div>';
  }

  /* ---------- 穴位查询 ---------- */
  function renderPointFilters() {
    var mer = $('jlPointMer');
    if (mer) {
      var h = '<option value="">全部经络</option>';
      meridians().forEach(function (m) { h += '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>'; });
      h += '<option value="extra">经外奇穴</option>';
      mer.innerHTML = h;
    }
    var reg = $('jlPointRegion');
    if (reg) {
      var seen = {}, list = [];
      points().forEach(function (p) { if (p.region && !seen[p.region]) { seen[p.region] = 1; list.push(p.region); } });
      list.sort();
      var rh = '<option value="">全部部位</option>';
      list.forEach(function (r) { rh += '<option value="' + esc(r) + '">' + esc(r) + '</option>'; });
      reg.innerHTML = rh;
    }
  }

  function renderPoints() {
    var out = $('jlPointOut');
    if (!out) return;
    var kw = ($('jlPointKw') ? $('jlPointKw').value : '').trim();
    var mer = $('jlPointMer') ? $('jlPointMer').value : '';
    var reg = $('jlPointRegion') ? $('jlPointRegion').value : '';
    var list = points();
    if (!kw && !mer && !reg) list = list.filter(function (p) { return p.meridian === 'lung'; });
    if (mer) list = list.filter(function (p) { return p.meridian === mer; });
    if (reg) list = list.filter(function (p) { return p.region === reg; });
    if (kw) list = list.filter(function (p) { return (p.name + p.code + p.zz + p.fx + p.pinyin).indexOf(kw) >= 0; });
    var total = list.length;
    if (!total) { out.innerHTML = '<div class="jl-empty">未找到相符穴位，请换关键词或放宽筛选。</div>'; return; }
    var shown = list.slice(0, 80);
    var h = '<div class="jl-note">共 ' + total + ' 穴' + (total > 80 ? '，已列前 80，请加关键词缩小范围' : '') + '。</div>';
    h += '<div class="jl-tbl-wrap"><table class="jl-tbl"><thead><tr><th>穴名</th><th>代码</th><th>归经</th><th>部位</th><th>功效</th></tr></thead><tbody>';
    shown.forEach(function (p) {
      var m = meridianOf(p.meridian);
      h += '<tr data-point="' + esc(p.name) + '"><td class="jl-c0">' + esc(p.name) + '</td><td>' + esc(p.code) + '</td><td>' + esc(m ? m.name : '经外奇穴') + '</td><td>' + esc(p.region) + '</td><td>' + esc(p.fx) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    out.innerHTML = h;
    renderPointDetail(shown[0].name);
  }

  function renderPointDetail(name) {
    var out = $('jlPointDetail');
    if (!out) return;
    var p = pointOf(name);
    if (!p) { out.innerHTML = ''; return; }
    var m = meridianOf(p.meridian);
    var spec = p.spec && p.spec.length ? p.spec.map(function (x) { return '<span class="jl-tag">' + esc(x) + '</span>'; }).join('') : '无';
    var safe = p.safe ? '<span class="jl-safe">' + esc(p.safe) + '</span>' : '未列特殊禁忌';
    out.innerHTML = '<div class="jl-card"><h4><b>' + esc(p.name) + '</b> ' + esc(p.code) + (p.pinyin ? '　' + esc(p.pinyin) : '') + '</h4>'
      + '<dl class="jl-kv">'
      + '<div><dt>归经</dt><dd>' + esc(m ? m.name : '经外奇穴') + '</dd></div>'
      + '<div><dt>部位</dt><dd>' + esc(p.region || '未载') + '</dd></div>'
      + '<div><dt>定位</dt><dd>' + esc(p.loc) + '</dd></div>'
      + '<div><dt>取法</dt><dd>' + esc(p.method) + '</dd></div>'
      + '<div><dt>针刺</dt><dd>' + (p.op ? esc(p.op) + (p.opSrc ? '<span class="jl-op-src">（' + esc(p.opSrc) + '）</span>' : '') + (p.opUncertain ? '<span class="jl-warn">（诸本不一，取较浅值）</span>' : '') : '未载') + '</dd></div>'
      + '<div><dt>功效</dt><dd>' + esc(p.fx) + '</dd></div>'
      + '<div><dt>主治</dt><dd>' + esc(p.zz) + '</dd></div>'
      + '<div><dt>特定穴</dt><dd>' + spec + '</dd></div>'
      + '<div><dt>安全</dt><dd>' + safe + '</dd></div>'
      + '<div><dt>出处</dt><dd class="jl-src">' + esc(p.src) + (p.srcUncertain ? '<span class="jl-warn">（出处待核）</span>' : '') + '</dd></div>'
      + '</dl></div>';
  }

  /* ---------- 特定穴 ---------- */
  function table(headers, rows) {
    var h = '<div class="jl-tbl-wrap"><table class="jl-tbl"><thead><tr>';
    headers.forEach(function (x) { h += '<th>' + esc(x) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>';
      r.forEach(function (x, i) { h += '<td' + (i === 0 ? ' class="jl-c0"' : '') + '>' + esc(x) + '</td>'; });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  function renderSpecific() {
    var out = $('jlSpecificOut');
    if (!out) return;
    if (!hasData()) { out.innerHTML = '<div class="jl-empty">特定穴数据未载。</div>'; return; }
    var S = window.JL.SPECIFIC, W = window.JL.WUSHU;
    var EXTRA_MER = { ren:'任脉', du:'督脉', spleenGreat:'脾之大络', yinwei:'阴维脉', yangwei:'阳维脉', yinqiao:'阴跷脉', yangqiao:'阳跷脉' };
    var h = '<h4 class="jl-sub">五输穴</h4>';
    var wrows = Object.keys(W).map(function (mid) {
      var m = meridianOf(mid);
      var row = [m ? m.name : mid];
      W[mid].forEach(function (x) { row.push(x[0] + '（' + x[1] + '）'); });
      return row;
    });
    h += table(['经脉','井','荥','输','经','合'], wrows);
    function simple(title, map, label) {
      var rows = Object.keys(map).map(function (k) {
        var name = map[k], p = pointOf(name), m = meridianOf(k);
        return [m ? m.name : (EXTRA_MER[k] || k), name, zzBrief(p)];
      });
      return '<h4 class="jl-sub">' + title + '</h4>' + table(['经脉','穴名','主治摘要'], rows);
    }
    h += simple('原穴', S.yuan);
    h += simple('络穴', S.luo);
    h += simple('郄穴', S.xi);
    h += simple('募穴', S.mu);
    h += simple('背俞穴', S.shu);
    h += simple('下合穴', S.xiahe);
    var brows = Object.keys(S.bahui).map(function (k) {
      var name = S.bahui[k], p = pointOf(name), m = p ? meridianOf(p.meridian) : null;
      return [k + '会', name, m ? m.name : '未载', zzBrief(p)];
    });
    h += '<h4 class="jl-sub">八会穴</h4>' + table(['会名','穴名','归经','主治摘要'], brows);
    var mrows = Object.keys(S.bamai).map(function (k) {
      var name = S.bamai[k], p = pointOf(name), m = p ? meridianOf(p.meridian) : null;
      return [k, name, m ? m.name : '未载', zzBrief(p)];
    });
    h += '<h4 class="jl-sub">八脉交会穴</h4>' + table(['所通之脉','穴名','归经','主治摘要'], mrows);
    out.innerHTML = h;
  }

  /* ---------- 源流与典籍 ---------- */
  function renderYuanliu() {
    var out = $('jlYuanliuOut');
    if (!out) return;
    var rows = [
      ['黄帝内经（灵枢）','战国至汉','十二经循行、病候、骨度、经筋'],
      ['黄帝内经（素问）','战国至汉','气穴论、气府论、骨空论'],
      ['针灸甲乙经','晋 皇甫谧','腧穴定位与主治的早期专书'],
      ['针灸大成','明 杨继洲','穴法、歌诀、子午流注、禁针穴'],
      ['针灸大全','明 徐凤','纳甲、灵龟八法、飞腾八法'],
      ['针灸逢源','清 李学川','三百六十一穴与经络循行'],
      ['医宗金鉴（刺灸心法要诀）','清 吴谦等','三百六十一穴歌与分寸'],
      ['奇经八脉考','明 李时珍','奇经八脉循行与病候']
    ];
    var h = '<h4 class="jl-sub">经络学说源流</h4>'
      + '<p class="jl-note">经络学说以《灵枢》经脉为根本，十二经循行、是动所生病与十五络脉具在其中；《素问》气穴、气府、骨空诸论补腧穴与骨度。晋皇甫谧《针灸甲乙经》汇集腧穴定位与主治，宋王惟一《铜人腧穴针灸图经》定官学形制，元滑寿《十四经发挥》以任督与十二经合为十四经，明杨继洲《针灸大成》总汇穴法歌诀，清李学川《针灸逢源》与《医宗金鉴》定三百六十一穴之数。</p>'
      + '<h4 class="jl-sub">子午流注源流</h4>'
      + '<p class="jl-note">子午流注以十二时辰配十二经，纳支法本于《灵枢》经脉气血流注与《针灸大成》；纳甲法、灵龟八法、飞腾八法歌诀与逐日逐时开穴见《针灸大全》，金何若愚《子午流注针经》为纳甲法早期专书。四法各有流派，异文并列，本页不裁断。</p>'
      + '<h4 class="jl-sub">取穴凡例</h4>'
      + '<p class="jl-note">定位取 GB/T 12346-2021 与 GB/T 40997-2021 的通行表述重写，骨度分寸与体表标志并见；主治取世界卫生组织标准与《针灸学》通行本，功效为本站依主治归纳；特定穴按五输、原、络、郄、募、背俞、八会、八脉交会、下合九类标注；针刺深度与角度逐穴列于针刺行，取《针灸学》通行本，各版有异者取较浅值并标诸本不一；安全提示只列禁针、慎针与孕妇禁针。</p>'
      + '<h4 class="jl-sub">典籍对照</h4>'
      + table(['典籍','成书','本页所据'], rows);
    out.innerHTML = h;
  }

  /* ---------- 十二时辰经络盘 ---------- */
  var WHEEL_SEL = 0, WHEEL_TIMER = null;
  var WX_COLOR = { 木:'#5a8f45', 火:'#b8543f', 土:'#876248', 金:'#a8813a', 水:'#3f6d96' };
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clockHands(h, mi) {
    if (!window.WHEEL) return;
    var ha = (h % 24 + mi / 60) * 15, ma = mi * 6;
    var hq = WHEEL.px(54, ha), mq = WHEEL.px(70, ma);
    var hl = document.getElementById('jlWheelHour');
    if (hl) { hl.setAttribute('x2', WHEEL.n(hq[0])); hl.setAttribute('y2', WHEEL.n(hq[1])); }
    var ml = document.getElementById('jlWheelMin');
    if (ml) { ml.setAttribute('x2', WHEEL.n(mq[0])); ml.setAttribute('y2', WHEEL.n(mq[1])); }
  }
  function updateWheelHands() {
    var now = new Date();
    clockHands(now.getHours(), now.getMinutes());
  }
  function renderWheel() {
    var host = $('jlWheelHost');
    if (!host || !window.WHEEL) return;
    var list = shiling();
    if (!list.length) return;
    var cur = (typeof shilingDangLing === 'function') ? shilingDangLing() : list[0];
    var ci = 0;
    for (var i = 0; i < list.length; i++) if (list[i].zhi === cur.zhi) ci = i;
    WHEEL_SEL = ci;
    host.innerHTML = WHEEL.render({
      id: 'jlWheel', aria: '十二时辰经络盘', n: 12,
      span: function (i) { return [i * 30 - 15, i * 30 + 15]; },
      mid: function (i) { return i * 30; },
      arc: 192, rIn: 120, hit1: 198, out: 182, core: 78,
      sel: ci, cur: null, tick: false,
      selId: 'jlWheelArc',
      onclick: 'jlPickJingluo',
      rings: [{ r: 182, cls: 'w-ring' }, { r: 150, cls: 'w-ring' }, { r: 120, cls: 'w-ring' }, { r: 78, cls: 'w-core' }],
      labelsOut: function (i, dg) {
        var tp = WHEEL.px(210, dg);
        var mr = meridianByShichen(list[i].zhi);
        var fill = mr && WX_COLOR[mr.wuxing] ? ' fill="' + WX_COLOR[mr.wuxing] + '"' : '';
        return '<text x="' + WHEEL.n(tp[0]) + '" y="' + WHEEL.n(tp[1]) + '" class="w-lab w-lab-xl' + (i === WHEEL_SEL ? ' w-lab-cur' : '') + '"' + fill + ' data-i="' + i + '" transform="rotate(' + WHEEL.ring(dg) + ' ' + WHEEL.n(tp[0]) + ' ' + WHEEL.n(tp[1]) + ')">' + esc(list[i].jing) + '</text>';
      },
      labelsIn: function (i, dg) {
        var tp = WHEEL.px(136, dg);
        return '<text x="' + WHEEL.n(tp[0]) + '" y="' + WHEEL.n(tp[1]) + '" class="w-lab w-lab-lg' + (i === WHEEL_SEL ? ' w-lab-cur' : '') + '" data-i="' + i + '" transform="rotate(' + WHEEL.dir(dg) + ' ' + WHEEL.n(tp[0]) + ' ' + WHEEL.n(tp[1]) + ')">' + esc(list[i].zhi) + '</text>';
      },
      extra: function () {
        var s = '';
        for (var h = 0; h < 24; h++) {
          var a = h * 15, major = h % 2 === 0;
          var q0 = WHEEL.px(major ? 164 : 167, a), q1 = WHEEL.px(173, a);
          s += '<line x1="' + WHEEL.n(q0[0]) + '" y1="' + WHEEL.n(q0[1]) + '" x2="' + WHEEL.n(q1[0]) + '" y2="' + WHEEL.n(q1[1]) + '" class="w-tick-24' + (major ? ' w-tick-24m' : '') + '"/>';
          var tp = WHEEL.px(157, a);
          s += '<circle cx="' + WHEEL.n(tp[0]) + '" cy="' + WHEEL.n(tp[1]) + '" r="7" class="w-hour-dot"/>';
          s += '<text x="' + WHEEL.n(tp[0]) + '" y="' + WHEEL.n(tp[1]) + '" class="w-hour">' + (h === 0 ? '24' : pad2(h)) + '</text>';
        }
        return s;
      }
    });
    var svg = host.querySelector('svg.wheel');
    if (svg) svg.insertAdjacentHTML('beforeend', '<line id="jlWheelHour" class="w-hand-hour" x1="220" y1="220" x2="220" y2="166"/><line id="jlWheelMin" class="w-hand-min" x1="220" y1="220" x2="220" y2="150"/><circle class="w-pin" cx="220" cy="220" r="4"/>');
    renderWheelDetail(ci);
    updateWheelHands();
    if (WHEEL_TIMER) clearInterval(WHEEL_TIMER);
    WHEEL_TIMER = setInterval(updateWheelHands, 30000);
  }

  function renderWheelDetail(i) {
    var out = $('jlWheelDetail');
    if (!out) return;
    var list = shiling();
    if (!list[i]) return;
    var j = list[i], m = meridianByShichen(j.zhi);
    var W = (m && window.JL.WUSHU[m.id]) ? window.JL.WUSHU[m.id] : [];
    var shu = W.map(function (x, k) { return esc(x[0]) + '（' + WUSHU_NAMES[k] + '，' + esc(x[1]) + '）'; }).join('、') || '未载';
    var yuan = (m && window.JL.SPECIFIC && window.JL.SPECIFIC.yuan) ? window.JL.SPECIFIC.yuan[m.id] : '';
    var row = function (k, v) { return '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>'; };
    out.innerHTML = '<dl class="jl-kv">'
      + row('时辰', esc(j.zhi) + '时 ' + esc(j.range))
      + row('当令经', esc(j.full))
      + row('五行', esc(m && m.wuxing ? m.wuxing : '不属五行'))
      + row('气血状态', esc(QI_STATUS[j.zhi] || ''))
      + row('五输', shu)
      + row('原穴', yuan ? esc(yuan) : '未载')
      + '</dl>';
  }
  window.jlPickJingluo = function (i) {
    var list = shiling();
    if (!list[i] || !window.WHEEL) return;
    WHEEL_SEL = i;
    WHEEL.pick('jlWheel', i);
    WHEEL.lab('jlWheel', i);
    var dg = i * 30;
    var arc = document.getElementById('jlWheelArc');
    if (arc) arc.setAttribute('d', WHEEL.arc(192, dg - 15, dg + 15));
    renderWheelDetail(i);
  };

  /* ---------- 子午流注开穴 ---------- */
  var WX_SHENG = { 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' };
  var WX_MU = { 火:'木', 土:'火', 金:'土', 水:'金', 木:'水' };
  var WUSHU_NAMES = ['井','荥','输','经','合'];
  var FEITENG = {
    壬:{ gua:'乾', point:'公孙' }, 甲:{ gua:'乾', point:'公孙' },
    丙:{ gua:'艮', point:'内关' }, 戊:{ gua:'坎', point:'足临泣' },
    庚:{ gua:'震', point:'外关' }, 辛:{ gua:'巽', point:'后溪' },
    乙:{ gua:'坤', point:'申脉' }, 癸:{ gua:'坤', point:'申脉' },
    己:{ gua:'离', point:'列缺' }, 丁:{ gua:'兑', point:'照海' }
  };
  var NAJIA_SONGS = [
    '甲日戌时胆窍阴，丙子时中前谷荥，戊寅陷谷阳明俞，返本丘墟木在寅，庚辰经注阳溪穴，壬午膀胱委中寻，甲申时纳三焦水，荥合天干取液门。',
    '乙日酉时肝大敦，丁亥时荥少府心，己丑太白太冲穴，辛卯经渠是肺经，癸巳肾宫阴谷合，乙未劳宫火穴荥。',
    '丙日申时少泽当，戊戌内庭治胀康，庚子时在三间俞，本原腕骨可祛黄，壬寅经火昆仑上，甲辰阳陵泉合长，丙午时受三焦木，中渚之中仔细详。',
    '丁日未时心少冲，己酉大都脾土逢，辛亥太渊神门穴，癸丑复溜肾水通，乙卯肝经曲泉合，丁巳包络大陵中。',
    '戊日午时厉兑先，庚申荥穴二间迁，壬戌膀胱寻束骨，冲阳土穴必还原，甲子胆经阳辅是，丙寅小海穴安然，戊辰气纳三焦脉，经穴支沟刺必痊。',
    '己日巳时隐白始，辛未时中鱼际取，癸酉太溪太白原，乙亥中封内踝比，丁丑时合少海心，己卯间使包络止。',
    '庚日辰时商阳居，壬午膀胱通谷之，甲申临泣为俞木，合谷金原返本归，丙戌小肠阳谷火，戊子时居三里宜，庚寅气纳三焦合，天井之中不用疑。',
    '辛日卯时少商本，癸巳然谷何须忖，乙未太冲原太渊，丁酉心经灵道引，己亥脾合阴陵泉，辛丑曲泽包络准。',
    '壬日寅时起至阴，甲辰胆脉侠溪荥，丙午小肠后溪俞，返求京骨本原寻，三焦寄有阳池穴，返本还原似嫡亲，戊申时注解溪胃，大肠庚戌曲池真，壬子气纳三焦寄，井穴关冲一片金，关冲属金壬属水，子母相生恩义深。',
    '癸日亥时井涌泉，乙丑行间穴必然，丁卯输穴神门是，本寻肾水太溪原，包络大陵原并过，己巳商丘内踝边，辛未肺经合尺泽，癸酉中冲包络连。'
  ];
  function gzOf(date, t) {
    if (typeof Solar === 'undefined') return null;
    try {
      var l = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), t.h, t.mi, 0).getLunar();
      return { day: l.getDayInGanZhiExact(), time: l.getTimeInGanZhi() };
    } catch (e) { return null; }
  }
  function najiaBlock(gz) {
    var Z = window.ZW_NAJIA;
    if (!Z || !Z.najia || !gz) return '';
    var N = Z.najia, L = Z.linggui || {};
    var dayGan = gz.day.charAt(0), hourZhi = gz.time.charAt(1);
    var Q = N.calendarCells;
    var cell = null;
    for (var i = 0; i < Q.length; i++) {
      if (Q[i].day === dayGan && Q[i].hour === hourZhi) { cell = Q[i]; break; }
    }
    var row = function (k, v) { return '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>'; };
    var extra = cell && cell.same ? cell.same : '';
    var np = cell && cell.type === '开穴' ? pointOf(cell.point) : null;
    var nature = '';
    if (np && np.spec) for (var si = 0; si < np.spec.length; si++) if (/^五输穴/.test(np.spec[si])) nature = np.spec[si].replace('五输穴', '');
    var h = '<div class="jl-card"><h4><b>纳甲法</b> 开穴</h4><dl class="jl-kv">'
      + row('日干', esc(dayGan) + '日')
      + row('时支', esc(hourZhi) + '时')
      + row('开穴', cell ? (cell.type === '开穴' ? esc(cell.point) + esc(nature) : esc(cell.type)) : '未载')
      + (extra ? row('同取', esc(extra)) : '')
      + '</dl><div class="jl-src">开穴据《针灸大全》卷五纳甲法。</div></div>';

    var dgNum = L.dayStems && L.dayBranches ? (L.dayStems[dayGan] || 0) + (L.dayBranches[gz.day.charAt(1)] || 0) : 0;
    var hgNum = L.hourStems && L.hourBranches ? (L.hourStems[gz.time.charAt(0)] || 0) + (L.hourBranches[gz.time.charAt(1)] || 0) : 0;
    if (dgNum && hgNum) {
      var yang = '甲丙戊庚壬'.indexOf(dayGan) >= 0;
      var div = yang ? 9 : 6;
      var sum = dgNum + hgNum;
      var rem = sum % div; if (rem === 0) rem = div;
      var gua = L.guaPoints && (L.guaPoints[String(rem)] || L.guaPoints[rem]);
      var gp = gua ? pointOf(gua) : null, gm = gp ? meridianOf(gp.meridian) : null;
      h += '<div class="jl-card"><h4><b>灵龟八法</b> 配穴</h4><dl class="jl-kv">'
        + row('日时', esc(gz.day) + '日　' + esc(gz.time) + '时')
        + row('配穴', gua ? esc(gua) : '未载')
        + row('归经', gm ? esc(gm.name) : '未载')
        + row('主治', gp ? esc(gp.zz) : '未载')
        + '</dl><div class="jl-src">取穴据《针灸大全》卷五灵龟八法。</div></div>';
    }

    return h;
  }

  function renderZiliu() {
    var out = $('jlZiliuOut');
    if (!out) return;
    var d = parseDate($('jlZiliuDate') ? $('jlZiliuDate').value : '');
    var t = parseTime($('jlZiliuTime') ? $('jlZiliuTime').value : '');
    if (!d || !t) { out.innerHTML = '<div class="jl-empty">请输入公历日期与时刻。</div>'; return; }
    var list = shiling();
    if (!list.length) { out.innerHTML = '<div class="jl-empty">时辰数据未载。</div>'; return; }
    var idx = zhiIndex(t.h), j = list[idx], m = meridianByShichen(j.zhi);
    var mode = $('jlZiliuMode') ? $('jlZiliuMode').value : 'bu';
    var wu = m ? m.wuxing : '';
    var target = mode === 'bu' ? WX_MU[wu] : WX_SHENG[wu];
    var w = (m && window.JL.WUSHU[m.id]) ? window.JL.WUSHU[m.id] : [];
    var pick = null, pickIdx = -1;
    for (var i = 0; i < w.length; i++) if (w[i][1] === target) { pick = w[i]; pickIdx = i; }
    var p = pick ? pointOf(pick[0]) : null;
    var gz = gzOf(d, t);
    var gan = gz ? gz.time.charAt(0) : '';
    var ft = FEITENG[gan];
    var fp = ft ? pointOf(ft.point) : null;

    var h = '<div class="jl-note">日柱按晚子时计，二十三时后归次日，与全站子时算法同口径。</div>';
    h += '<div class="jl-card"><h4><b>纳支法</b> ' + (mode === 'bu' ? '补母' : '泻子') + '</h4><dl class="jl-kv">'
      + '<div><dt>时辰</dt><dd>' + esc(j.zhi) + '时 ' + esc(j.range) + '　' + esc(j.full) + '</dd></div>'
      + '<div><dt>日时干支</dt><dd>' + esc(gz ? gz.day + '日 ' + gz.time + '时' : '未载') + '</dd></div>'
      + '<div><dt>本经五行</dt><dd>' + esc(wu || '未载') + '</dd></div>'
      + '<div><dt>取穴</dt><dd>' + esc(pick ? pick[0] + '（' + WUSHU_NAMES[pickIdx] + '，' + pick[1] + '）' : '本经五输穴未载') + '</dd></div>'
      + '<div><dt>主治</dt><dd>' + esc(p ? p.zz : '未载') + '</dd></div>'
      + '</dl></div>';

    h += '<div class="jl-card"><h4><b>飞腾八法</b> 取穴</h4><dl class="jl-kv">'
      + '<div><dt>取穴</dt><dd>' + esc(ft ? ft.point : '未载') + '</dd></div>'
      + '<div><dt>归经</dt><dd>' + esc(fp ? (meridianOf(fp.meridian) ? meridianOf(fp.meridian).name : '经外奇穴') : '未载') + '</dd></div>'
      + '<div><dt>主治</dt><dd>' + esc(fp ? fp.zz : '未载') + '</dd></div>'
      + '</dl><div class="jl-src">取穴据《针灸大全》卷五飞腾八法。歌诀：壬甲公孙即是乾，丙居艮上内关然，戊为临泣生坎水，庚属外关震相连，辛上后溪装巽卦，乙癸申脉到坤传，己土列缺南离上，丁居照海兑金全。</div></div>';

    h += najiaBlock(gz);
    if (!window.ZW_NAJIA) {
      h += '<div class="jl-note">纳甲法与灵龟八法开穴以《针灸大全》原文为准；八脉交会穴见特定穴表。</div>';
    }
    h += '<h4 class="jl-sub">纳甲法歌诀</h4><ol class="jl-steps">';
    NAJIA_SONGS.forEach(function (s) { h += '<li>' + esc(s) + '</li>'; });
    h += '</ol>';
    h += '<h4 class="jl-sub">灵龟八法歌</h4><p class="jl-note">坎一联申脉，照海坤二五，震三属外关，巽四临泣数，乾六是公孙，兑七后溪府，艮八系内关，离九列缺主。出《针灸大全》卷五灵龟八法。</p>';
    out.innerHTML = h;
  }

  /* ---------- 事件与初始化 ---------- */
  function ziwuAiContext() {
    var d = $('jlDate') ? $('jlDate').value : '';
    var dt = parseDate(d);
    if (!dt) return '子午流注查询：日期未填。';
    var list = shiling();
    if (!list.length) return '子午流注查询：时辰数据未载。';
    var tv = $('jlTime') ? $('jlTime').value : '';
    var tm = parseTime(tv);
    var idx = tm ? zhiIndex(tm.h) : (CURRENT_IDX === null ? zhiIndex(new Date().getHours()) : CURRENT_IDX);
    var j = list[idx], m = meridianByShichen(j.zhi);
    return '所查 ' + d + (tv ? ' ' + tv : '') + '，' + j.zhi + '时（' + j.range + '）' + j.full + '当令；五行' + (m && m.wuxing ? m.wuxing : '不属五行') + '，本经' + (m ? m.count : '') + '穴；属络' + j.shu + '；宜做' + j.yi + '。本页为传统文化与经络学说查询，不构成诊疗建议；针刺、艾灸与用药须由执业医师施行。';
  }
  function bind() {
    var btn = $('jlBtn');
    if (btn) btn.addEventListener('click', renderNow);
    ['jlDate', 'jlTime'].forEach(function (id) {
      var e = $(id);
      if (e) e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') renderNow(); });
    });
    var pb = $('jlPointBtn');
    if (pb) pb.addEventListener('click', renderPoints);
    var zb = $('jlZiliuBtn');
    if (zb) zb.addEventListener('click', renderZiliu);
    ['jlPointMer', 'jlPointRegion'].forEach(function (id) {
      var e = $(id);
      if (e) e.addEventListener('change', renderPoints);
    });
    var kw = $('jlPointKw');
    if (kw) kw.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') renderPoints(); });
    var mo = $('jlMeridianOut');
    if (mo) mo.addEventListener('click', function (ev) {
      var tr = ev.target.closest('tr[data-mid]');
      if (tr) renderMeridianDetail(tr.getAttribute('data-mid'));
      var a = ev.target.closest('a[data-point]');
      if (a) { renderPointDetail(a.getAttribute('data-point')); openMod('jlmod-points'); }
    });
    var po = $('jlPointOut');
    if (po) po.addEventListener('click', function (ev) {
      var tr = ev.target.closest('tr[data-point]');
      if (tr) renderPointDetail(tr.getAttribute('data-point'));
    });
  }

  window.toggleMod = function (id) {
    var el = $(id);
    if (!el) return;
    el.classList.toggle('collapsed');
    window.dispatchEvent(new Event('resize'));
  };

  function init() {
    bind();
    renderMeridians();
    renderPointFilters();
    renderPoints();
    renderSpecific();
    renderYuanliu();
    renderZiliu();
    renderWheel();
    if (window.renderChrome) window.renderChrome('ziwu.html');
    if (window.mountAI) window.mountAI(ziwuAiContext, '子午流注', {
      share: {
        page: 'ziwu', title: '子午流注在线查询',
        collect: window.xjShareCollect, restore: window.xjShareRestore,
        recast: function () { if (window.xjShareRecast) window.xjShareRecast(function () { renderNow(); renderPoints(); }); }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
