/* 折叠共享件：全站折叠开合的唯一真源。
 * 两种模式：资料查询折叠（section.mod，点题头开合）与输出内容折叠（结果区，出结果后整块展开）。
 * 页脚本用 MOD.open(id) 展开结果区、MOD.toggle(id) 开合、MOD.isOpen(id) 判态；
 * 页面 HTML 的 onclick="toggleMod('id')" 由本件提供的全局函数承接。 */
(function (global) {
  'use strict';
  function el(id) { return document.getElementById(id); }
  var MOD = {
    toggle: function (id) { var n = el(id); if (n) n.classList.toggle('collapsed'); },
    open: function (id) { var n = el(id); if (n) n.classList.remove('collapsed'); },
    close: function (id) { var n = el(id); if (n) n.classList.add('collapsed'); },
    isOpen: function (id) { var n = el(id); return !!n && !n.classList.contains('collapsed'); }
  };
  global.MOD = MOD;
  global.toggleMod = function (id) { MOD.toggle(id); };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
