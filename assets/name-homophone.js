/* ============================================================
 * 谐音避讳引擎（assets/name-homophone.js）
 * 依赖：NAME_ARCHIVE_HOMOPHONE（字档分片）、NAME_ENGINE.getChar（读音）
 * 纯函数；口径：谐音警示为民俗参考 confidence=1，命中≠名字不好（界面须标注）。
 * 判定两级：full=全名连读即负面词（high）；part=连读含负面词（mid，含单字负面音节）。
 * 音节一律无调比对；读音取字档 pyDefault（多音字取常读音，姓氏位另由异读表处理）。
 * ============================================================ */
window.NAME_HOMOPHONE = (function () {
  'use strict';
  var TONE = { 'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e','ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o','ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v' };
  function plain(s) { return String(s).replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (m) { return TONE[m]; }); }
  function D() { var w = window.NAME_ARCHIVE_HOMOPHONE; return w ? (w.data || w) : null; }

  /* 读音取引擎统一入口，姓氏位读异读音（单 shàn 等），与音律表同口径；
     xLen 为姓氏字数，长名无姓则传 0 */
  function nameSylls(chars, xLen) {
    return chars.map(function (c, i) {
      var E = window.NAME_ENGINE;
      if (E && E.getPhon) {
        var p = E.getPhon(c, i < (xLen || 0));
        if (p && p.py) return plain(p.py);
      }
      var g = E && E.getChar ? E.getChar(c) : null;
      return g && g.pyDefault ? plain(g.pyDefault) : null;
    });
  }

  /* check(name, xLen) → {chars, seq, hits:[{word,kind,severity,at,note}], bad:bool} */
  function check(name, xLen) {
    var d = D(); if (!d) return null;
    var chars = Array.prototype.map.call(String(name), function (c) { return c; });
    var seq = nameSylls(chars, xLen);
    var hits = [];
    var fullHit = {};
    d.full.forEach(function (w) {
      if (w.sylls.length === seq.length && w.sylls.every(function (s, i) { return seq[i] === s; })) {
        hits.push({ word: w.word, kind: 'full', severity: 'high', at: 0, note: w.note || '' });
        fullHit[w.word] = true;
      }
    });
    /* part 与 full 词条统一做包含级扫描（2 音节词如 输光/月经 命中 3 字名） */
    d.full.concat(d.part).forEach(function (w) {
      if (fullHit[w.word]) return;                       /* 全名命中过的不重复报 */
      var L = w.sylls.length;
      for (var i = 0; i + L <= seq.length; i++) {
        var ok = true;
        for (var j = 0; j < L; j++) if (seq[i + j] !== w.sylls[j]) { ok = false; break; }
        if (ok) {
          /* 词长分级：≥2 音节=mid（词级双关）；单音节=low（弱提示，仅 UI 折叠展示，
           * 避免 李/杜/王 等大姓被孤立音节误伤，主流谐音避讳为词级双关判定） */
          hits.push({ word: w.word, kind: 'part', severity: L >= 2 ? 'mid' : 'low', at: i, note: '' });
          break;
        }
      }
    });
    return { chars: chars, seq: seq, hits: hits, bad: hits.some(function (h) { return h.severity === 'high' || h.severity === 'mid'; }) };
  }

  return { check: check, plain: plain };
})();
