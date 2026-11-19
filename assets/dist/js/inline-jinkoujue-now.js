/* 日期与时辰默认值：解析期同步执行，首绘前即当天与当下；页面停留时按本机时间续算，
   跨时辰、跨午夜、跨年自动改值。与 app.js 的同名校正同源同判，defer 那次只作兜底。
   日历五页的 #dInput 带 data-keep，访问日由解析期渲染件先写：本件只写未标 data-user-set 的框，
   且只改写本件自己写过的值（自动值归属），页内反查、分享与快照回填的值一律不抢写。
   日期一变即派发 xj:now，页内据此重绘 .today、今日卡与当日详情；load 后三秒再校正一次，
   以本机时间复核日期与时辰，页内若仍停在自动旧值即在此归位。 */
(function () {
  function p2(v) { return (v < 10 ? '0' : '') + v; }
  function kept(el) { return el.hasAttribute('data-keep'); }
  /* 日历日期框：五历页的 #dInput 由解析期渲染件写访问日，data-keep 只挡默认值件，不挡续算。 */
  function isCalDate(el) {
    return el.tagName === 'INPUT' && el.id === 'dInput';
  }
  function isDateBox(el, calPage) {
    if (el.tagName !== 'INPUT') return false;
    if (kept(el) && !(calPage && isCalDate(el))) return false;
    if (el.type === 'date') return true;
    if (el.type !== 'text' || !el.classList.contains('dt-input')) return false;
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(el.value || '')) return true;
    if (/^(?:\d{4}-\d{2}-\d{2}|YYYY-MM-DD)$/i.test(el.getAttribute('placeholder') || '')) return true;
    if (/date/i.test(el.id || '')) return true;
    return /日期|生日/.test(el.getAttribute('aria-label') || '');
  }
  /* 自动值归属：只改写本件自己写过的值。页内回填（反查、分享、快照）一旦改过，
     本件不再抢写；否则每秒续算会把刚回填的日期按本机当天盖回去。 */
  var autoVal = new WeakMap();
  function own(el) { return !autoVal.has(el) || el.value === autoVal.get(el); }
  function put(el, v) {
    if (el.value !== v) el.value = v;
    el.setAttribute('data-autonow', '1');
    autoVal.set(el, v);
  }
  function apply() {
    var n = new Date();
    var ymd = n.getFullYear() + '-' + p2(n.getMonth() + 1) + '-' + p2(n.getDate());
    var hm = p2(n.getHours()) + ':' + p2(n.getMinutes());
    var zhi = '子丑寅卯辰巳午未申酉戌亥'[Math.floor(((n.getHours() + 1) % 24) / 2)];
    var calPage = !!document.getElementById('calGrid');
    document.querySelectorAll('input').forEach(function (el) {
      if (el.hasAttribute('data-user-set')) return;
      if (isDateBox(el, calPage)) {
        if (own(el)) put(el, ymd);
        return;
      }
      if (el.type === 'time' && !kept(el) && own(el)) put(el, hm);
    });
    document.querySelectorAll('select').forEach(function (sel) {
      if (kept(sel) || sel.hasAttribute('data-user-set') || sel.options.length < 12) return;
      var opt = Array.prototype.find.call(sel.options, function (o) {
        var t = (o.textContent || '').trim();
        return t.charAt(0) === zhi && /[（(]/.test(t);
      });
      if (opt && own(sel)) put(sel, opt.value);
    });
    return { day: ymd, time: hm, zhi: zhi };
  }
  function notify(r, prev, check) {
    try {
      window.dispatchEvent(new CustomEvent('xj:now', {
        detail: { day: r.day, prev: prev || '', time: r.time, check: !!check }
      }));
    } catch (e) { /* 无 CustomEvent 的环境按无监听处理 */ }
  }
  /* 跨时辰：时辰变了就派发一次，页内据此重画详情里的时柱、时冲与时辰吉凶；
     与跨日分开走，免得把整月格与日期框一起重画。 */
  function notifyTime(r) {
    try {
      window.dispatchEvent(new CustomEvent('xj:time', {
        detail: { day: r.day, time: r.time, zhi: r.zhi }
      }));
    } catch (e) { /* 无 CustomEvent 的环境按无监听处理 */ }
  }
  var last = apply();
  var lastTick = '';
  var lastZhi = last.zhi;
  setInterval(function () {
    var n = new Date();
    var tick = n.getFullYear() + '-' + p2(n.getMonth() + 1) + '-' + p2(n.getDate())
      + ' ' + p2(n.getHours()) + ':' + p2(n.getMinutes());
    if (tick === lastTick) return;
    lastTick = tick;
    var r = apply();
    if (r.zhi !== lastZhi) { lastZhi = r.zhi; notifyTime(r); }
    if (r.day === last.day) { last = r; return; }
    var prev = last.day;
    last = r;
    notify(r, prev, false);
  }, 1000);
  window.addEventListener('load', function () {
    setTimeout(function () {
      var r = apply();
      var prev = last.day;
      last = r;
      notify(r, prev, true);
    }, 3000);
  });
})();