/* ============================================================
 * 圆盘通用件（几何层）：极角以正上为 0 度、顺时针为正，与 CSS 无涉。
 * 样式层见 assets/css/style.css 的“圆盘通用件”段（.wheel / .w-* / --wheel-* 令牌）。
 * 分工：本文件只出几何与选中态改写，颜色字号一律交给 CSS 令牌，各页不重写。
 *
 * 接入页：五历页十盘（道历、老黄历、万年历、佛历、藏历），
 *         合婚两盘、姓名评分盘、五运六气两盘、八字两盘、风水六盘。
 * 盘面拼装统一走 WHEEL.render；十二时辰盘另走 WHEEL.shichen 与 WHEEL.shichenWheel。
 * 多层罗经、落星、星盘与罗盘另立骨架者，只借本件的弧、热区、取字角与选中态改写。
 *
 * 用法：
 *   WHEEL.arc(r, a0, a1)              弧线 path（画弧带）
 *   WHEEL.band(r0, r1, a0, a1)        环形扇区 path（作点击热区，只取环带以免盖住盘心）
 *   WHEEL.anchorArc(r, span, id)      查询锚点弧：有 CUR 状态的盘，不随点选移动
 *   WHEEL.selArc(r, span, id)         选中弧：随点选移动
 *   WHEEL.render(o)                   标准 440 盘骨架：逐格弧、刻度、热区、锚点与选中弧、内外圈字、环线、指针、盘心行
 *   WHEEL.shichen(o)                  十二时辰盘配置渲染；WHEEL.shichenWheel(cfg, lunar) 连取时与选中态一次出盘
 *   WHEEL.px(r, deg)                  极坐标转直角坐标，返回 [x, y]
 *   WHEEL.ring(deg)                   位置角转“沿圆周环布”的旋转角（只给最外圈环名）
 *   WHEEL.radial(deg)                 位置角转“沿半径散射”的旋转角（内圈两字串）
 *   WHEEL.dir(deg)                    内圈单字取字角：四正正立，其余同 radial
 *   WHEEL.shichenLabels(o)            十二时辰盘外圈：十二地支单字加夜子小字
 *   WHEEL.pick(rootId, i)             选中态切换：只在该盘内做，同页多盘互不干扰
 *   WHEEL.lab(rootId, i)              内侧字高亮切换：同样只在该盘内做
 *   WHEEL.text(id, str, color)        改写一处盘心文字，color 省略则不动字色
 *   WHEEL.lockDetail(el, n, htmlAt)   详情条按全部段落的最大高度预留，点选不改高
 * ============================================================ */
(function (global) {
  'use strict';
  var W = {};
  /* 盘心坐标：与万年历两盘同制式，viewBox 恒为 440 见方，故圆心在 220 */
  W.C = 220;
  /* 标准 440 盘半径组（全站唯一真源）：历法五页七盘与皇极盘的共用量纲。
     ARC 弧带外沿、OUT 外圈环线、IN 内界圈、CORE 盘心圈、LAB_OUT 与 LAB_IN 内外签半径、
     TICK0 与 TICK1 刻度两沿、P0 与 P1 指针两端、HIT1 热区外沿（弧带外沿再外扩 6）。
     各页 const 块一律自此处解构取值，不另写数字。 */
  W.GEO440 = { C:220, ARC:192, OUT:182, IN:120, CORE:78, LAB_OUT:206, LAB_IN:148,
    HIT1:198, TICK0:168, TICK1:176, P0:82, P1:116 };
  W.px = function (r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [W.C + r * Math.cos(a), W.C + r * Math.sin(a)];
  };
  /* 一位小数即可：viewBox 440 下亚像素无意义，缩短 path 串 */
  W.n = function (v) { return Math.round(v * 10) / 10; };
  /* 环布角（🔴 只给最外圈那一圈环名用）：字头恒朝盘外、字基随切线转向。正上字横排，右半圈字
     顺时针转向、正下字倒排，整圈读作一条环带（与星宿页示意星图四象名 textPath 环布同读法）。
     旋转角即位置角本身。🔴 入参先归一到 0 至 360：宿盘一类的角度是算出来的，会落到负数区。 */
  W.ring = function (deg) {
    var d = ((deg % 360) + 360) % 360;
    return W.n(d);
  };
  /* 散射角（内圈环名用）：位置角 deg 处的外向半径角为 deg-90；左半圈再翻 180 度，
     免得字头朝里、倒置难读。于是右半圈字头朝外、左半圈字头朝内，字恒正立。
     与万年历节气圆盘、经络圆盘同式（那两处为内联 radial，值须一致）。 */
  W.radial = function (deg) {
    var d = ((deg % 360) + 360) % 360;
    return W.n(d < 180 ? d - 90 : d + 90);
  };
  /* 内圈单字取字角：四正（正上正下正左正右，即子午卯酉、北南东西）必须正立，其余沿半径散射。
     🔴 四正若也照 radial 走，正上与正下的字会被横倒 90 度，读时须歪头，罗盘上不能这么排。
     判等前先归一并取一位小数：宿盘的角度是算出来的，会落成 359.99999999999997 这类值。 */
  W.dir = function (deg) {
    var d = ((deg % 360) + 360) % 360;
    var r = Math.round(d * 10) / 10;
    return (r % 90 === 0) ? 0 : W.radial(d);
  };
  /* 十二时辰盘外圈：十二地支单字与夜子小字。
     数据为十三段，前十二段对应地支字，末段夜子无地支位，单出一枚夜子小字；
     入参 data、span、mid、labOut、sel、good、bad，返回 SVG 文本串。 */
  W.shichenLabels = function (o) {
    var names = '子丑寅卯辰巳午未申酉戌亥';
    var good = o.good || 'var(--wheel-good)', bad = o.bad || 'var(--wheel-bad)';
    var segAt = function (dg) {
      for (var k = 0; k < o.data.length; k++) {
        var sp = o.span(k);
        if (dg >= sp[0] && dg < sp[1]) return o.data[k];
      }
      return null;
    };
    var s = '';
    for (var i = 0; i < 12; i++) {
      var dg = i * 30, tp = W.px(o.labOut, dg), seg = segAt(dg);
      var col = (seg && seg.good) ? good : bad;
      s += '<text x="' + W.n(tp[0]) + '" y="' + W.n(tp[1]) + '" class="w-lab w-lab-xl' + (i === o.sel ? ' w-lab-cur' : '') + '"'
        + ' data-i="' + i + '" style="fill:' + col + '"'
        + ' transform="rotate(' + W.ring(dg) + ' ' + W.n(tp[0]) + ' ' + W.n(tp[1]) + ')">' + names.charAt(i) + '</text>';
    }
    var last = o.data.length - 1;
    if (last >= 12) {
      var dg2 = o.mid(last), tp2 = W.px(o.labOut, dg2), seg2 = o.data[last];
      var col2 = (seg2 && seg2.good) ? good : bad;
      s += '<text x="' + W.n(tp2[0]) + '" y="' + W.n(tp2[1]) + '" class="w-lab w-lab-xs' + (last === o.sel ? ' w-lab-cur' : '') + '"'
        + ' data-i="' + last + '" style="fill:' + col2 + ';font-size:10px"'
        + ' transform="rotate(' + W.ring(dg2) + ' ' + W.n(tp2[0]) + ' ' + W.n(tp2[1]) + ')">夜子</text>';
    }
    return s;
  };
  /* 盘心水位：p 为百分比（0 至 100），返回水位矩形的顶边与高度，底边恒贴盘心圆底。
     0 即无色、100 即满盘，盘心里的填色始终只有淡底那一支，水位以上透明。
     裁形交给与盘心同圆的 clipPath，涨到哪儿上沿都是满圆的一条弦。 */
  W.coreFill = function (coreR, p) {
    var d = coreR * 2, h = d * Math.max(0, Math.min(1, (+p || 0) / 100));
    return { y: W.n(W.C + coreR - h), height: W.n(h) };
  };
  W.arc = function (r, a0, a1) {
    var p0 = W.px(r, a0), p1 = W.px(r, a1);
    var lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + W.n(p0[0]) + ' ' + W.n(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + lg + ' 1 ' + W.n(p1[0]) + ' ' + W.n(p1[1]);
  };
  W.band = function (r0, r1, a0, a1) {
    var A = W.px(r1, a0), B = W.px(r1, a1), D = W.px(r0, a1), E = W.px(r0, a0);
    var lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + W.n(A[0]) + ' ' + W.n(A[1]) + 'A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + W.n(B[0]) + ' ' + W.n(B[1])
      + 'L' + W.n(D[0]) + ' ' + W.n(D[1]) + 'A' + r0 + ' ' + r0 + ' 0 ' + lg + ' 0 ' + W.n(E[0]) + ' ' + W.n(E[1]) + 'Z';
  };
  /* 查询锚点弧与选中弧：有 CUR 状态的盘一对同出；锚点弧不随点选移动，选中弧随点选走 */
  W.anchorArc = function (r, span, id) {
    return '<path' + (id ? ' id="' + id + '"' : '') + ' d="' + W.arc(r, span[0], span[1]) + '" class="w-arc w-arc-solid"/>';
  };
  W.selArc = function (r, span, id) {
    return '<path' + (id ? ' id="' + id + '"' : '') + ' d="' + W.arc(r, span[0], span[1]) + '" class="w-arc w-arc-cur"/>';
  };
  /* 标准 440 盘骨架：逐格弧、刻度、热区、锚点与选中弧、内外圈字、环线、指针、盘心行
     的拼装只此一处。各页只给格数、取角、半径、标签与盘心内容，拼装统一走本件。
     o 的键：
       id 与 aria 必填；cls 缺省 wheel；view 缺省 440；attrs 为 svg 附加属性串。
       n、span(i)、mid(i) 必填；arc、rIn、hit1、tick0、tick1、p0、p1、out、core 必填。
       sel 为选中格；cur 为当前态，无当前态的盘省略或置 null。
       selId、anchorId、needleId、dotId 为对应元素的 id；onclick 为点选函数名；
       onclickAt(i) 返回完整 onclick 串，给出即代 onclick；hitOn 置 false 时初排不标 is-on。
       labelsOut(i, dg, sp)、labelsMid(i, dg, sp)、labelsIn(i, dg, sp) 返回整段 text；rings 为 [{r, cls}]；
       center 为 [{y, cls, id, text, fill, style}]；extra 返回环线之前的附加 SVG；
       before 返回全部弧之前的附加 SVG；tickAt(i) 返回该格刻度，给出即代默认等长刻度。 */
  W.render = function (o) {
    var n = o.n, C = o.c || W.C, view = o.view || 440;
    var sel = o.sel, cur = o.cur;
    var s = '', i, sp, dg, tp, q0, q1;
    if (typeof o.before === 'function') s += o.before();
    for (i = 0; i < n; i++) {
      sp = o.span(i);
      s += '<path d="' + W.arc(o.arc, sp[0], sp[1]) + '" class="' + (o.arcCls || 'w-arc') + '"/>';
    }
    if (o.tick !== false) {
      if (typeof o.tickAt === 'function') {
        for (i = 0; i < n; i++) s += o.tickAt(i);
      } else {
        for (i = 0; i < n; i++) {
          dg = o.mid(i);
          tp = W.px(o.tick0, dg); q0 = W.px(o.tick1, dg);
          s += '<line x1="' + W.n(tp[0]) + '" y1="' + W.n(tp[1]) + '" x2="' + W.n(q0[0]) + '" y2="' + W.n(q0[1]) + '" class="w-tick"/>';
        }
      }
    }
    for (i = 0; i < n; i++) {
      sp = o.span(i);
      var bd = W.band(o.rIn, o.hit1, sp[0], sp[1]);
      var click = o.onclickAt ? o.onclickAt(i) : (o.onclick ? o.onclick + '(' + i + ')' : '');
      s += '<path d="' + bd + '" class="w-hit' + ((o.hitOn !== false && i === sel) ? ' is-on' : '') + '" data-i="' + i + '"'
        + (click ? ' onclick="' + click + '"' : '') + '/>';
      s += '<path d="' + bd + '" class="w-sel"/>';
    }
    if (cur !== null && cur !== undefined) s += W.anchorArc(o.arc, o.span(cur), o.anchorId);
    s += W.selArc(o.arc, o.span(sel), o.selId);
    if (o.labelsOut) for (i = 0; i < n; i++) s += o.labelsOut(i, o.mid(i), o.span(i));
    if (o.labelsMid) for (i = 0; i < n; i++) s += o.labelsMid(i, o.mid(i), o.span(i));
    if (o.labelsIn) for (i = 0; i < n; i++) s += o.labelsIn(i, o.mid(i), o.span(i));
    if (typeof o.extra === 'function') s += o.extra();
    var rings = o.rings || [{ r: o.out, cls: 'w-ring' }, { r: o.rIn, cls: 'w-ring' }, { r: o.core, cls: 'w-core' }];
    for (i = 0; i < rings.length; i++) s += '<circle cx="' + C + '" cy="' + C + '" r="' + rings[i].r + '" class="' + rings[i].cls + '"/>';
    if (o.needle !== false && o.needleId) {
      dg = o.mid(sel);
      q0 = W.px(o.p0, dg); q1 = W.px(o.p1, dg);
      s += '<line id="' + o.needleId + '" x1="' + W.n(q0[0]) + '" y1="' + W.n(q0[1]) + '" x2="' + W.n(q1[0]) + '" y2="' + W.n(q1[1]) + '" class="w-needle"/>';
      s += '<circle id="' + o.dotId + '" cx="' + W.n(q1[0]) + '" cy="' + W.n(q1[1]) + '" r="3.5" class="w-dot"/>';
    }
    (o.center || []).forEach(function (t) {
      var sty = t.style ? ' style="' + t.style + '"' : (t.fill ? ' style="fill:' + t.fill + '"' : '');
      s += '<text x="' + C + '" y="' + t.y + '" class="' + t.cls + '"'
        + (t.id ? ' id="' + t.id + '"' : '') + sty + '>' + t.text + '</text>';
    });
    return '<svg class="' + (o.cls || 'wheel') + '"' + (o.id ? ' id="' + o.id + '"' : '')
      + ' viewBox="0 0 ' + view + ' ' + view + '"' + (o.attrs ? ' ' + o.attrs : '') + ' role="img"'
      + (o.aria ? ' aria-label="' + o.aria + '"' : '') + '>' + s + '</svg>';
  };
  /* 十二时辰吉凶盘：十三段（十二时辰加夜子）共用一套拼装，两页只给数据、常量与 id。 */
  W.shichen = function (o) {
    var g = o.geo, d = o.data, sel = o.sel;
    return W.render({
      id: o.id, aria: o.aria, n: d.length,
      span: o.span, mid: o.mid,
      arc: g.arc, rIn: g.rIn, hit1: g.hit1, tick0: g.tick0, tick1: g.tick1,
      p0: g.p0, p1: g.p1, out: g.out, core: g.core, c: g.c,
      sel: sel, cur: o.cur,
      selId: o.ids.sel, anchorId: o.ids.anchor, needleId: o.ids.needle, dotId: o.ids.dot,
      onclick: o.onclick,
      tickAt: function (i) {
        if (i >= 12) return '';
        var dg = i * 30, ta = W.px(g.tick0, dg), tb = W.px(g.tick1, dg);
        return '<line x1="' + W.n(ta[0]) + '" y1="' + W.n(ta[1]) + '" x2="' + W.n(tb[0]) + '" y2="' + W.n(tb[1]) + '" class="w-tick"/>';
      },
      labelsOut: function (i) {
        if (i !== 0) return '';
        return W.shichenLabels({ data: d, span: o.span, mid: o.mid, labOut: g.labOut, sel: sel });
      },
      labelsIn: function (i, dg) {
        if (i >= 12) return '';
        var tp = W.px(g.labIn, dg), gz = d[i] ? d[i].gz : '';
        return '<text x="' + W.n(tp[0]) + '" y="' + W.n(tp[1]) + '" class="w-lab w-lab-lg"'
          + ' transform="rotate(' + W.radial(dg) + ' ' + W.n(tp[0]) + ' ' + W.n(tp[1]) + ')">' + gz + '</text>';
      },
      center: [
        { y: g.c - 16, cls: 'w-c1', id: o.cids.c1, text: d[sel].name },
        { y: g.c + 14, cls: 'w-c2', id: o.cids.c2, text: d[sel].luck, style: 'font-weight:700;fill:' + (d[sel].good ? 'var(--wheel-good)' : 'var(--wheel-bad)') },
        { y: g.c + 34, cls: 'w-c3', id: o.cids.c3, text: d[sel].gz + ' ' + d[sel].range }
      ]
    });
  };
  /* 十二时辰盘流程：取时、当值时、选中态与盘面一次出齐；两页只给数据函数与配置。 */
  W.shichenWheel = function (cfg, lunar) {
    var times = lunar.getTimes();
    var data = times.map(function (t, i) { return cfg.dataFn(t, i, i === times.length - 1); });
    var hr = cfg.now();
    var cur = Math.max(0, times.findIndex(function (t) {
      return hr.getHours() >= +t.getMinHm().slice(0, 2) && hr.getHours() <= +t.getMaxHm().slice(0, 2);
    }));
    cfg.onState(data, cur);
    return W.shichen({
      id: cfg.id, aria: cfg.aria, data: data, span: cfg.span, mid: cfg.mid,
      sel: cur, cur: cur, ids: cfg.ids, cids: cfg.cids, onclick: cfg.onclick, geo: cfg.geo
    });
  };
  /* 详情条高度锁定：盘下详情随点选换段，段落长短不同，容器高度就会跟着变；容器一变，
     文档高度跟着变，页面在底部时浏览器回夹滚动，盘面与上方内容会整体跳一下。
     此件按当前布局下全部可选段落的最大高度给容器留 min-height，点选只换字不改高。
     换月或换日重建详情后须重调一次；窗口缩放与字体换入由本件自行重算。 */
  var detailLocks = [];
  var relockTimer = 0;
  function lockOne(item, growOnly) {
    var el = item.el;
    if (!el || !el.parentNode || !el.getClientRects().length) return;
    var keep = el.innerHTML, old = el.style.minHeight;
    el.style.minHeight = '';
    var max = 0;
    for (var i = 0; i < item.n; i++) {
      el.innerHTML = item.htmlAt(i);
      if (el.offsetHeight > max) max = el.offsetHeight;
    }
    el.innerHTML = keep;
    if (growOnly) max = Math.max(max, parseFloat(old) || 0);
    el.style.minHeight = max ? max + 'px' : old;
  }
  function relockAll(growOnly) {
    for (var i = 0; i < detailLocks.length; i++) lockOne(detailLocks[i], growOnly);
  }
  W.lockDetail = function (el, n, htmlAt) {
    if (!el || !n || typeof htmlAt !== 'function') return;
    detailLocks = detailLocks.filter(function (x) { return x.el && x.el.parentNode; });
    var item = null;
    for (var i = 0; i < detailLocks.length; i++) if (detailLocks[i].el === el) item = detailLocks[i];
    if (!item) { item = { el: el, n: n, htmlAt: htmlAt }; detailLocks.push(item); }
    else { item.n = n; item.htmlAt = htmlAt; }
    lockOne(item, false);
  };
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', function () {
      clearTimeout(relockTimer);
      relockTimer = setTimeout(function () { relockAll(false); }, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { relockAll(true); });
    }
  }
  /* 按盘作用域：同页两盘各有自己的扇区序号，若在全页范围内切换会互相清掉对方的选中态 */
  W.pick = function (rootId, i) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var hits = root.querySelectorAll('.w-hit');
    for (var k = 0; k < hits.length; k++) {
      hits[k].classList.toggle('is-on', +hits[k].getAttribute('data-i') === i);
    }
  };
  /* 内侧字的高亮（.w-lab-cur）同样只在该盘内切换，序号取各字上的 data-i。
     🔴 没有 data-i 的字（外圈方位标记、四象名等纯装饰字）一律不参与高亮：
     getAttribute 取不到属性返回 null，+null 得 0，若照旧直接比 i，选中第 0 项时
     这些装饰字会被一并加粗着色（老黄历二十八宿盘选中角宿时，外圈东 北 西 南 四个字齐齐变粗）。 */
  W.lab = function (rootId, i) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var ls = root.querySelectorAll('.w-lab');
    for (var k = 0; k < ls.length; k++) {
      var v = ls[k].getAttribute('data-i');
      ls[k].classList.toggle('w-lab-cur', v !== null && +v === i);
    }
  };
  W.text = function (id, str, color) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = str;
    if (color) el.style.fill = color;
  };
  global.WHEEL = W;
})(window);
