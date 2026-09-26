/* 玄机排盘 日历日期表：法定节假日、调休补班与纪念日（浏览器端直取，无需密钥）
 *
 * 为什么需要：lunar.js 的 isWork() 依赖 HolidayUtil 内置硬编码表，实测仅覆盖 2001-12-29 至 2026-10-10，
 * 其后的日期查不到记录就回落成“周六周日才算休”，调休补班全部判错。故另取外部数据源补足。
 *
 * 主源 holiday-cn（GitHub 社区库，CI 每日抓取国务院公告自动生成，jsDelivr 分发，无配额无密钥）：
 *   https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/<年>.json
 *   结构 {year, papers:[], days:[{name, date, isOffDay}]}
 *   isOffDay 为 true 即放假，false 即调休补班（周末也要上班）。
 *   注意：仅与周末连休的普通周末不在数据里，故未命中时要再按星期兜底。
 * 备源 timor.tech（免费、支持 HTTPS 与跨域，按 IP 限每日一万次）：
 *   https://timor.tech/api/holiday/year/<年>/   返回 {code, holiday:{日期: {holiday:布尔, name:名称}}}
 *   holiday 为 true 放假，false 调休补班。
 * 两源皆失败则回落按星期（周六周日为休），与 lunar.js 无记录时的口径一致，不报错不提示。
 *
 * 纪念日表（MEMORIAL）为本站策展的静态表，与上面两个节假日源无关、不发网络请求：
 *   取中国近现代史上国家与民族层面的重大纪念日，含事变与战争、烈士与公祭、革命运动与回归，
 *   以及党和国家主要领导人（毛泽东、周恩来、邓小平、朱德、孙中山）的诞辰与逝世纪念，共二十一条。
 *   日历格在无节日的日子由它补进节日槽，窄屏另以右下纪字角标点出。
 *   行业与主题日、国际日、网络商业节日、外国人物纪念日不入格，只列于万年历详情的节日行。
 *
 * 缓存：localStorage，键 xj:hol:<年>，有效七天；同一页面多次取用不重复外发请求。
 * 对外接口：holidayEnsure(years, cb)  保证给定年份数据就绪后回调（年份可为数组）；
 *           holidayOf(y, m, d)        返回 {off, name}，off 为 true 放假、false 上班、null 无数据；
 *           memorialOf(y, m, d)       返回该日纪念日名，无则返回空串；
 *           paintRestMarks()          按日历格约定落休班标，万年历与老黄历共用同一份。
 */
(function (global) {
  'use strict';

  const TTL = 7 * 86400000;
  const CN_URL = 'https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/';
  const TM_URL = 'https://timor.tech/api/holiday/year/';
  const pending = {};
  const ready = {};

  const pad = n => (n < 10 ? '0' : '') + n;
  const iso = (y, m, d) => y + '-' + pad(m) + '-' + pad(d);
  const key = y => 'xj:hol:' + y;

  function readCache(y) {
    try {
      const o = JSON.parse(localStorage.getItem(key(y)) || 'null');
      if (!o || o.v !== 1 || !o.days) return null;
      if (Date.now() - (o.ts || 0) > TTL) return null;
      return o.days;
    } catch (e) { return null; }
  }

  function writeCache(y, days) {
    try { localStorage.setItem(key(y), JSON.stringify({ v: 1, ts: Date.now(), days: days })); } catch (e) {}
  }

  function parseCn(d) {
    if (!d || !Array.isArray(d.days) || !d.days.length) return null;
    const out = {};
    d.days.forEach(function (x) {
      if (!x || !x.date) return;
      out[String(x.date).slice(0, 10)] = { off: x.isOffDay !== false, name: String(x.name || '') };
    });
    return out;
  }

  function parseTm(d) {
    if (!d || !d.holiday || typeof d.holiday !== 'object') return null;
    const out = {};
    Object.keys(d.holiday).forEach(function (k) {
      const it = d.holiday[k];
      if (!it) return;
      out[String(k).slice(0, 10)] = { off: it.holiday !== false, name: String(it.name || '') };
    });
    return out;
  }

  function fetchJson(url) {
    return new Promise(function (res, rej) {
      if (typeof fetch !== 'function') { rej(new Error('no fetch')); return; }
      let done = false;
      const fin = function (fn, v) { if (done) return; done = true; clearTimeout(timer); fn(v); };
      const timer = setTimeout(function () { fin(rej, new Error('timeout')); }, 6000);
      try {
        fetch(url, { method: 'GET', cache: 'no-store', credentials: 'omit' })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); })
          .then(function (j) { fin(res, j); })
          .catch(function (e) { fin(rej, e); });
      } catch (e) { fin(rej, e); }
    });
  }

  function loadYear(y) {
    if (pending[y]) return pending[y];
    const cached = readCache(y);
    const p = cached
      ? Promise.resolve(cached)
      : fetchJson(CN_URL + y + '.json')
          .then(function (d) { const g = parseCn(d); if (!g) throw new Error('bad cn'); return g; })
          .catch(function () {
            return fetchJson(TM_URL + y + '/').then(function (d) {
              const g = parseTm(d);
              if (!g) throw new Error('bad timor');
              return g;
            });
          })
          .catch(function () { return null; });
    pending[y] = p.then(
      function (g) { ready[y] = g || {}; return g; },
      function () { ready[y] = {}; return null; }
    );
    if (cached) ready[y] = cached;
    return pending[y];
  }

  function holidayEnsure(years, cb) {
    const list = (Array.isArray(years) ? years : [years])
      .map(function (v) { return String(v); })
      .filter(function (v) { return /^\d{4}$/.test(v); });
    const done = function () { if (cb) { try { cb(); } catch (e) {} } };
    if (!list.length) { done(); return; }
    Promise.all(list.map(loadYear)).then(done, done);
  }

  function holidayOf(y, m, d) {
    const g = ready[y];
    if (!g) return null;
    const it = g[iso(y, m, d)];
    return it ? { off: !!it.off, name: it.name } : null;
  }

  /* 纪念日真源：公历定日，键为月-日。一表一义，与节日表分开：
     同日既过节又逢纪时两不相顶，格内节日占槽优先，纪念日仍由右下角标点出。 */
  const MEMORIAL = {
    '1-8': '周恩来逝世纪念日',
    '2-7': '京汉铁路罢工纪念日',
    '2-19': '邓小平逝世纪念日',
    '3-5': '周恩来诞辰纪念日',
    '3-12': '孙中山逝世纪念日',
    '3-29': '中国黄花岗七十二烈士殉难纪念日',
    '5-30': '中国五卅运动纪念日',
    '7-1': '香港回归纪念日',
    '7-6': '朱德逝世纪念日',
    '7-7': '七七事变纪念日',
    '8-22': '邓小平诞辰纪念日',
    '9-3': '中国抗日战争胜利纪念日',
    '9-9': '毛泽东逝世纪念日',
    '9-18': '九一八事变纪念日',
    '9-30': '中国烈士纪念日',
    '10-10': '辛亥革命纪念日',
    '10-25': '抗美援朝纪念日',
    '11-12': '孙中山诞辰纪念日',
    '12-12': '西安事变纪念日',
    '12-13': '国家公祭日',
    '12-26': '毛泽东诞辰纪念日'
  };

  function memorialOf(y, m, d) {
    return MEMORIAL[m + '-' + d] || '';
  }

  /* 日历格休班标：按 .cal-cell[data-date] 与格内 .rest-mark 的约定，只标法定假日与调休补班。
     普通周末不标（已由红字日期区分），取不到数据则全不标。万年历与老黄历共用同一份。 */
  function paintRestMarks() {
    const cells = document.querySelectorAll('.cal-cell[data-date]');
    if (!cells.length) return;
    const years = [];
    cells.forEach(function (el) {
      const y = Number(el.getAttribute('data-date').split('-')[0]);
      if (years.indexOf(y) < 0) years.push(y);
    });
    holidayEnsure(years, function () {
      cells.forEach(function (el) {
        const p = el.getAttribute('data-date').split('-').map(Number);
        const mark = el.querySelector('.rest-mark');
        if (!mark) return;
        const h = holidayOf(p[0], p[1], p[2]);
        if (!h) { mark.className = 'rest-mark'; mark.textContent = ''; return; }
        mark.className = 'rest-mark on ' + (h.off ? 'rest' : 'work');
        mark.textContent = h.off ? '休' : '班';
        if (h.name) mark.title = h.name;
      });
    });
  }

  global.holidayEnsure = holidayEnsure;
  global.holidayOf = holidayOf;
  global.memorialOf = memorialOf;
  global.paintRestMarks = paintRestMarks;
})(typeof window !== 'undefined' ? window : globalThis);
