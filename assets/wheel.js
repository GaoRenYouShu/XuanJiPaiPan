/* ============================================================
 * 圆盘通用件（几何层）：极角以正上为 0 度、顺时针为正，与 CSS 无涉。
 * 样式层见 assets/style.css 的“圆盘通用件”段（.wheel / .w-* / --wheel-* 令牌）。
 * 分工：本文件只出几何与选中态改写，颜色字号一律交给 CSS 令牌，各页不重写。
 *
 * 接入页：老黄历（十二时辰吉凶盘、二十八宿盘）、万年历（节气圆盘、经络圆盘）、
 *         佛历（二十七宿盘、月相斋日盘）。
 * 万年历两盘的坐标与取角仍是页内内联实现（已上线且零回归，不动），只借本件的 WHEEL.ring（最外圈环布）、
 * WHEEL.radial（内圈散射）、WHEEL.band（点选热区）、WHEEL.arc（加粗弧）
 * 与 WHEEL.pick / WHEEL.lab / WHEEL.text（选中态改写）。
 *
 * 用法：
 *   WHEEL.arc(r, a0, a1)              弧线 path（画弧带）
 *   WHEEL.band(r0, r1, a0, a1)        环形扇区 path（作点击热区，只取环带以免盖住盘心）
 *   WHEEL.px(r, deg)                  极坐标转直角坐标，返回 [x, y]
 *   WHEEL.ring(deg)                   位置角转“沿圆周环布”的旋转角（只给最外圈环名）
 *   WHEEL.radial(deg)                 位置角转“沿半径散射”的旋转角（内圈两字串）
 *   WHEEL.dir(deg)                    内圈单字取字角：四正正立，其余同 radial
 *   WHEEL.pick(rootId, i)             选中态切换：只在该盘内做，同页多盘互不干扰
 *   WHEEL.lab(rootId, i)              内侧字高亮切换：同样只在该盘内做
 *   WHEEL.text(id, str, color)        改写一处盘心文字，color 省略则不动字色
 * ============================================================ */
(function (global) {
  'use strict';
  var W = {};
  /* 盘心坐标：与万年历两盘同制式，viewBox 恒为 440 见方，故圆心在 220 */
  W.C = 220;
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
