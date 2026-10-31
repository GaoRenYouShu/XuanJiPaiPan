/* 日期与时辰默认值：解析期同步执行，首绘前即当天与当下；页面停留时按本机时间续算，
   跨时辰、跨午夜、跨年自动改值。与 app.js 的同名校正同源同判，defer 那次只作兜底。 */
(function () {
  function p2(v) { return (v < 10 ? '0' : '') + v; }
  function kept(el) { return el.hasAttribute('data-keep'); }
  function isDateBox(el) {
    if (el.tagName !== 'INPUT' || kept(el)) return false;
    if (el.type === 'date') return true;
    if (el.type !== 'text' || !el.classList.contains('dt-input')) return false;
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(el.value || '')) return true;
    if (/^(?:\d{4}-\d{2}-\d{2}|YYYY-MM-DD)$/i.test(el.getAttribute('placeholder') || '')) return true;
    if (/date/i.test(el.id || '')) return true;
    return /日期|生日/.test(el.getAttribute('aria-label') || '');
  }
  function apply() {
    var n = new Date();
    var ymd = n.getFullYear() + '-' + p2(n.getMonth() + 1) + '-' + p2(n.getDate());
    var hm = p2(n.getHours()) + ':' + p2(n.getMinutes());
    var zhi = '子丑寅卯辰巳午未申酉戌亥'[Math.floor(((n.getHours() + 1) % 24) / 2)];
    document.querySelectorAll('input').forEach(function (el) {
      if (isDateBox(el)) { el.value = ymd; return; }
      if (el.type === 'time' && !kept(el)) el.value = hm;
    });
    document.querySelectorAll('select').forEach(function (sel) {
      if (kept(sel) || sel.options.length < 12) return;
      var opt = Array.prototype.find.call(sel.options, function (o) {
        var t = (o.textContent || '').trim();
        return t.charAt(0) === zhi && /[（(]/.test(t);
      });
      if (opt) sel.value = opt.value;
    });
    return ymd + ' ' + hm;
  }
  var last = apply();
  setInterval(function () {
    var k = apply();
    if (k === last) return;
    last = k;
  }, 30000);
})();