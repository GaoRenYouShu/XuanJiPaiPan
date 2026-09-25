/* ============================================================
 * 简繁语境选字引擎（assets/name-jianfan-select.js）
 * 依赖：NAME_ARCHIVE_JIANFAN_FULL（简繁一对多表，构建产物）
 * 纯函数，无 DOM；引擎层唯一简繁选字入口（T10 接入 getChar，T13 接 UI）。
 *
 * 选字规则（优先级从高到低）：
 *   1. user-override  用户改选（opts.overrides[char] = 繁体候选），用户意图最高
 *   2. context-hint   语境提示（opts.hint 关键词命中候选 hint/释义），按语境选
 *   3. first-choice   默认 OpenCC 首选（= 站内现行行为，行为不回退）
 *
 * 输出带 provenance：rule 标明依据，alternatives 全列（含各候选康熙笔画）供 UI 改选。
 * ============================================================ */
window.NAME_JIANFAN_SELECT = (function () {
  'use strict';

  function full() {
    return (window.NAME_ARCHIVE_JIANFAN_FULL && window.NAME_ARCHIVE_JIANFAN_FULL.multi) || {};
  }

  /* 单字选字：返回 {char, multi, selected, strokes, rule, alternatives} */
  function selectOne(char, opts) {
    opts = opts || {};
    var m = full()[char];
    if (!m) return { char: char, multi: false, selected: char, strokes: null, rule: 'none', alternatives: [] };
    var cands = m.candidates;
    var byT = {};
    cands.forEach(function (c) { byT[c.t] = c; });

    /* 1 用户改选 */
    if (opts.overrides && Object.prototype.hasOwnProperty.call(opts.overrides, char) && byT[opts.overrides[char]]) {
      var u = byT[opts.overrides[char]];
      return { char: char, multi: true, selected: u.t, strokes: u.k, rule: 'user-override', alternatives: cands };
    }
    /* 2 语境提示 */
    if (opts.hint) {
      var kw = String(opts.hint);
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        if (c.hint && c.hint.indexOf(kw) >= 0) {
          return { char: char, multi: true, selected: c.t, strokes: c.k, rule: 'context-hint', alternatives: cands };
        }
      }
    }
    /* 3 默认首选 */
    var f = byT[m.first] || cands[0];
    return { char: char, multi: true, selected: f.t, strokes: f.k, rule: 'first-choice', alternatives: cands };
  }

  /* 整名选字：name 字符串（或字数组），返回逐字结果数组 */
  function selectName(name, opts) {
    return Array.prototype.map.call(String(name), function (c) { return selectOne(c, opts); });
  }

  /* 是否多候选字 */
  function isMulti(char) { return !!full()[char]; }

  return { selectOne: selectOne, selectName: selectName, isMulti: isMulti };
})();
