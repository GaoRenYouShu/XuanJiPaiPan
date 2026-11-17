/* 折叠共享件：全站折叠开合的唯一真源。
 * 两种模式：资料查询折叠（section.mod，点题头开合）与输出内容折叠（结果区，出结果后整块展开）。
 * 页脚本用 MOD.open(id) 展开结果区、MOD.toggle(id) 开合、MOD.isOpen(id) 判态；
 * 页面 HTML 的 onclick="toggleMod('id')" 由本件提供的全局函数承接。
 *
 * 开合态的读回与落类在 build/site/fold-boot.js：由构建器内联在 body 末尾、首绘前同步执行，
 * 写出即终态。本件只管交互：改类之后交给 window.xjFoldRemember 记录。
 */
(function (global) {
  'use strict';
  function el(id) { return document.getElementById(id); }
  function isOpenOf(n) {
    if (!n) return false;
    return n.tagName === 'DETAILS' ? !!n.open : !n.classList.contains('collapsed');
  }
  function setOpen(id, open) {
    var n = el(id);
    if (!n) return false;
    if (n.tagName === 'DETAILS') n.open = !!open;
    else if (open) n.classList.remove('collapsed');
    else n.classList.add('collapsed');
    return true;
  }
  function remember(id, open) {
    if (!id || typeof global.xjFoldRemember !== 'function') return;
    global.xjFoldRemember(id, open);
  }
  var MOD = {
    toggle: function (id) {
      var n = el(id);
      if (!n) return;
      var open = !isOpenOf(n);
      setOpen(id, open);
      remember(id, open);
    },
    open: function (id) { if (setOpen(id, true)) remember(id, true); },
    close: function (id) { if (setOpen(id, false)) remember(id, false); },
    isOpen: function (id) { return isOpenOf(el(id)); }
  };
  global.MOD = MOD;
  global.toggleMod = function (id) { MOD.toggle(id); };

  /* 开合态来源不止本件的 toggleMod：页脚本有自己的开合实现，details 还有原生开合。
     故不绑函数，改看属性：class 变即 section.mod 开合，open 变即 details 开合，
     谁改的都能记下；记录只写不读，读回由首绘前的 boot 件负责。 */
  if (typeof document !== 'undefined' && typeof MutationObserver === 'function') {
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var n = list[i].target;
        if (!n || !n.id || n.nodeType !== 1) continue;
        if (n.tagName === 'DETAILS') remember(n.id, !!n.open);
        else if (n.classList && n.classList.contains('mod')) remember(n.id, !n.classList.contains('collapsed'));
      }
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class', 'open'] });
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
