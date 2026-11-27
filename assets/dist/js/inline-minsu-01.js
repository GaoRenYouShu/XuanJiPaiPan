/* 民俗占法一掌经：以农历年支起宫，年上起月、月上起日、日上起时，男顺女逆，取时宫为命宫。
   断语照通行本录入，繁体转简体；本模块只读 buildBaziState 的农历与四柱，不另造历算。 */
(function () {
  'use strict';
  var ZHI = '子丑寅卯辰巳午未申酉戌亥';
  var GONG = [
    { zhi: '子', xing: '天贵', dao: '佛道', duan: '主人清高有德，行大事成小，灾祸不侵。' },
    { zhi: '丑', xing: '天厄', dao: '鬼道', duan: '此星在命，主人带疾，若逢破刃犯冲，灾病必重。' },
    { zhi: '寅', xing: '天权', dao: '人道', duan: '此星在命，主人聪明，俊秀洒落，襟怀有权有势，多智多能。' },
    { zhi: '卯', xing: '天破', dao: '畜道', duan: '此星主财帛空虚，祖业耗散。' },
    { zhi: '辰', xing: '天奸', dao: '修罗道', duan: '主人一生劳碌，啾唧奔波，指东说西，机变难测。' },
    { zhi: '巳', xing: '天文', dao: '仙道', duan: '主人聪明伶俐，学识过人，作事和美。' },
    { zhi: '午', xing: '天福', dao: '佛道', duan: '主人受福清闲，性情自在，度量宽洪，根基稳实。' },
    { zhi: '未', xing: '天驿', dao: '鬼道', duan: '主人离乡别井，骨肉情多劳碌，身心自成自立之命。' },
    { zhi: '申', xing: '天孤', dao: '人道', duan: '主一生孤独，男人得之，六亲无分。' },
    { zhi: '酉', xing: '天刃', dao: '畜道', duan: '主人一生刚狠，性格躁暴，自做自是不受人触。' },
    { zhi: '戌', xing: '天艺', dao: '修罗道', duan: '主人多智多能，机巧近贵。' },
    { zhi: '亥', xing: '天寿', dao: '仙道', duan: '主人长寿康健，智慧聪明，作事温良，有救人之心。' }
  ];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function todayStr() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }
  function idx(zhi) { return ZHI.indexOf(zhi); }
  function step(start, n, dir) { return (start + dir * n + 120) % 12; }
  function row(label, i, isMing) {
    var g = GONG[i];
    return '<tr' + (isMing ? ' class="ms-zy-ming"' : '') + '><td class="ms-c0">' + label + '</td><td>' + g.zhi +
      '</td><td>' + g.xing + '</td><td>' + g.dao + '</td><td>' + esc(g.duan) + '</td></tr>';
  }
  function render() {
    var out = $('msZyOut');
    var date = ($('msZyDate').value || '').trim();
    var hour = $('msZyHour').value;
    var sex = $('msZySex').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      out.innerHTML = '<p class="ms-err">请输入有效公历生日，格式 1990-05-15。</p>';
      window.MS_ZHANGYI = null;
      return;
    }
    if (!window.buildBaziState) {
      out.innerHTML = '<p class="ms-err">历算未就绪，请稍后重试。</p>';
      window.MS_ZHANGYI = null;
      return;
    }
    var st = null;
    try {
      st = window.buildBaziState({ date: date, time: hour, sex: sex, ziMode: 'late', sunMode: 'off', lng: 120, kongAxis: 'day' });
    } catch (e) { st = null; }
    if (!st || !st.lunar) {
      out.innerHTML = '<p class="ms-err">公历日期无效，请核对年月日。</p>';
      window.MS_ZHANGYI = null;
      return;
    }
    var ln = st.lunar;
    var yz = ln.getYearZhi ? ln.getYearZhi() : (st.BZ.zhis && st.BZ.zhis[0]);
    var tz = ln.getTimeZhi ? ln.getTimeZhi() : (st.BZ.zhis && st.BZ.zhis[3]);
    var m = Math.abs(ln.getMonth());
    var d = ln.getDay();
    var hi = idx(tz);
    var dir = sex === 'f' ? -1 : 1;
    var yg = idx(yz);
    var mg = step(yg, m - 1, dir);
    var dg = step(mg, d - 1, dir);
    var hg = step(dg, hi, dir);
    var g = GONG[hg];
    var html = '<div class="ms-cards">' +
      '<div class="ms-card ms-card-gold"><div class="ms-card-k">命宫</div><div class="ms-card-v">' + g.xing +
      '</div><div class="ms-card-s">' + g.zhi + '宫，' + g.dao + '</div></div>' +
      '<div class="ms-card"><div class="ms-card-k">农历</div><div class="ms-card-v">' + ln.getYear() + '年' +
      (ln.getMonth() < 0 ? '闰' : '') + m + '月' + d + '日</div><div class="ms-card-s">' + yz + '年 ' + tz + '时</div></div>' +
      '<div class="ms-card"><div class="ms-card-k">顺逆</div><div class="ms-card-v">' + (dir > 0 ? '顺数' : '逆数') +
      '</div><div class="ms-card-s">' + (sex === 'f' ? '女命' : '男命') + '</div></div></div>';
    html += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>位</th><th>地支</th><th>星宫</th><th>六道</th><th>断语</th></tr></thead><tbody>' +
      row('年宫', yg, false) + row('月宫', mg, false) + row('日宫', dg, false) + row('时宫', hg, true) +
      '</tbody></table></div>';
    html += '<div class="ms-note"><b>起法</b>　年上起月、月上起日、日上起时，男顺女逆。年支定年宫，年宫为正月，月宫为初一，日宫为子时，逐位顺逆数至生月、生日、生时；时宫即命宫。</div>';
    html += '<div class="ms-note"><b>底本</b>　通行本《神机妙算达摩一掌经》，题唐一行禅师；版本待核，断语繁体转简体，异文不改。属民俗文化，不作命运定论。</div>';
    out.innerHTML = html;
    window.MS_ZHANGYI = { date: date, hour: hour, sex: sex, year: yz, month: m, day: d, time: tz, gong: g.xing, dao: g.dao };
  }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = $('msZyBtn');
    if (!btn) return;
    if (!$('msZyDate').value) $('msZyDate').value = todayStr();
    btn.addEventListener('click', render);
  });
})();
