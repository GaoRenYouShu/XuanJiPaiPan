/* ============================================================
 * 名卦引擎（assets/name-hexagram.js）
 * 依赖：gua.js（TRIGRAMS/XT2NAME/hexInfo/palaceInfo，站内梅梅/测字同源库）、
 *       NAME_ENGINE.planChar（姓名学笔画口径）
 * 纯函数；起卦口径（梅梅字占、人名通例，golden 锁定）：
 *   上卦＝姓氏笔画和 ÷8 取余（余0作8，先天数 乾1…坤8）
 *   下卦＝名字笔画和 ÷8 取余
 *   动爻＝姓名总笔画 ÷6 取余（余0作6）
 *   变卦＝动爻翻转；附京房八宫世应。
 * 输出为民俗参考口径；卦辞爻解不在本引擎（详排引 cezi/meihua 同源展示，T13 接线）。
 * ============================================================ */
window.NAME_HEXAGRAM = (function () {
  'use strict';

  function rem8(n) { return ((n - 1) % 8 + 8) % 8 + 1; }
  function rem6(n) { return ((n - 1) % 6 + 6) % 6 + 1; }

  /* build(xingChars, mingChars) → 起卦结果（含 provenance） */
  function build(xingChars, mingChars) {
    if (!window.NAME_ENGINE || !window.NAME_ENGINE.planChar) return null;
    var xs = xingChars.map(function (c) { return window.NAME_ENGINE.planChar(c).strokes; });
    var ms = mingChars.map(function (c) { return window.NAME_ENGINE.planChar(c).strokes; });
    if (xs.some(function (n) { return !n; }) || ms.some(function (n) { return !n; })) return null;
    var xsSum = xs.reduce(function (a, b) { return a + b; }, 0);
    var msSum = ms.reduce(function (a, b) { return a + b; }, 0);
    var total = xsSum + msSum;
    var up = rem8(xsSum), low = rem8(msSum), dong = rem6(total);
    var upName = XT2NAME[up], lowName = XT2NAME[low];
    var bits6 = TRIGRAMS[lowName].bits.concat(TRIGRAMS[upName].bits);   /* 自下而上：下卦在前 */
    var info = hexInfo(bits6);
    var palace = palaceInfo(bits6);
    var changed = bits6.slice(); changed[dong - 1] = changed[dong - 1] ? 0 : 1;
    var chg = hexInfo(changed);
    return {
      xingStrokes: xsSum, mingStrokes: msSum, total: total,
      upper: info.upper, lower: info.lower, usym: info.usym, lsym: info.lsym,
      dong: dong, name: info.name, changedName: chg.name,
      palace: palace.palace, world: palace.world, ying: palace.ying, type: palace.type,
      caliber: '梅梅字占（人名通例）：姓上卦、名下卦（余8）、总笔画余6动爻；民俗参考'
    };
  }

  return { build: build };
})();
