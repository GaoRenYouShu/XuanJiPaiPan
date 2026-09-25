/* ============================================================
 * 生肖字根引擎（assets/name-zodiac.js）
 * 依赖：NAME_ARCHIVE_ZODIAC（字档分片）、NAME_ENGINE.getChar（部首号）
 * 纯函数；口径：地支关系=客观规则 conf3；字根宜忌=民俗通行口径 conf1（界面标『民俗参考』）。
 * 匹配层级：部首层（char.radicalNo ∈ 字根部首号表）；非部首层部件不判（如实返回 n/a）。
 * 契约：T13 页面接线（姓名分析页『生肖宜忌』区块）。
 * ============================================================ */
window.NAME_ZODIAC = (function () {
  'use strict';

  function D() {
    var w = window.NAME_ARCHIVE_ZODIAC;
    return w ? (w.data || w) : null;
  }

  /* 年支 → 生肖名（lunarYear = 农历年支序 0=子 … 11=亥，或传生肖名直接用） */
  function zodiacFromBranch(branch) {
    var d = D(); if (!d) return null;
    for (var z in d.branches) if (d.branches[z] === branch) return z;
    return null;
  }
  /* 公历年粗排（立春/正月边界由调用方用 lunar.js 精确定支后传 branch） */
  function branchFromYearLunar(year) { return ((year - 4) % 12 + 12) % 12; }

  /* 单字 × 生肖 → {yi:[字根], ji:[字根], radicalNo} */
  function match(char, zodiacKey) {
    var d = D(); if (!d || !d.zodiac[zodiacKey]) return null;
    var rec = window.NAME_ENGINE && window.NAME_ENGINE.getChar ? window.NAME_ENGINE.getChar(char) : null;
    var no = rec && rec.radicalNo;
    if (!no) return { char: char, zodiac: zodiacKey, yi: [], ji: [], n_a: true };
    var z = d.zodiac[zodiacKey];
    var hit = function (list) {
      return (list || []).filter(function (root) {
        var forms = d.roots[root];
        return forms && forms.indexOf(no) >= 0;
      });
    };
    return { char: char, zodiac: zodiacKey, radicalNo: no, yi: hit(z.yi), ji: hit(z.ji) };
  }

  /* 整名 × 生肖：逐字判定 + 汇总 */
  function analyzeName(name, zodiacKey) {
    var d = D(); if (!d) return null;
    var z = d.zodiac[zodiacKey];
    var rel = d.relations[zodiacKey] || {};
    var per = Array.prototype.map.call(String(name), function (c) { return match(c, zodiacKey); });
    var yiHits = [], jiHits = [];
    per.forEach(function (p) {
      p.yi.forEach(function (r) { if (yiHits.indexOf(r) < 0) yiHits.push(r); });
      p.ji.forEach(function (r) { if (jiHits.indexOf(r) < 0) jiHits.push(r); });
    });
    return {
      zodiac: zodiacKey, branch: d.branches[zodiacKey],
      sanhe: rel.sanhe, liuhe: rel.liuhe, chong: rel.chong, xing: rel.xing, hai: rel.hai,
      per: per, yiHits: yiHits, jiHits: jiHits,
      level: jiHits.length ? '慎' : (yiHits.length ? '宜' : '中性'),
      caliber: '地支关系客观；字根宜忌为民俗通行口径(confidence 1)，仅供参考'
    };
  }

  return { zodiacFromBranch: zodiacFromBranch, branchFromYearLunar: branchFromYearLunar, match: match, analyzeName: analyzeName };
})();
