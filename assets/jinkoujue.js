/* 六壬金口诀起课：四位、月将加时、贵神昼夜顺逆、五子元遁。
   底本《六壬神课金口诀古本》三卷；本件只算四位与可判课体，不作命理改写。 */
(function (global) {
  'use strict';
  var D = global.JK_DATA;

  function ix(arr, x) { return arr.indexOf(x); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function rel(a, b) {
    if (!a || !b) return '—';
    if (a === b) return '同';
    if (D.elemKe[a] === b) return '克';
    if (D.elemGen[a] === b) return '生';
    if (D.elemKe[b] === a) return '被克';
    if (D.elemGen[b] === a) return '被生';
    return '—';
  }
  function hourBranch(hh) {
    return D.branches[Math.floor(((hh + 1) % 24) / 2)];
  }
  function isDayHour(hb) {
    var i = ix(D.branches, hb);
    return i >= 3 && i <= 8;
  }
  function stemAt(dayStem, branch) {
    var start = D.wuzi[dayStem];
    return D.stems[(ix(D.stems, start) + ix(D.branches, branch)) % 10];
  }
  function nobleAt(dayStem, hb, place) {
    var day = isDayHour(hb);
    var cfg = D.nobleStart[dayStem];
    var start = day ? cfg.day : cfg.night;
    var dir = day ? cfg.dayDir : cfg.nightDir;
    var steps = ((ix(D.branches, place) - ix(D.branches, start)) * dir % 12 + 12) % 12;
    var name = D.nobleOrder[steps];
    var n = null;
    for (var i = 0; i < D.nobles.length; i++) { if (D.nobles[i].name === name) { n = D.nobles[i]; break; } }
    return { data: n, start: start, dir: dir, day: day };
  }
  function generalAt(monthBranch, hb, place) {
    var b = D.branches[(ix(D.branches, monthBranch) + ix(D.branches, place) - ix(D.branches, hb) + 24) % 12];
    for (var i = 0; i < D.generals.length; i++) { if (D.generals[i].branch === b) return D.generals[i]; }
    return null;
  }
  function xunKong(dayGZ) {
    var s = ix(D.stems, dayGZ.charAt(0));
    var b = ix(D.branches, dayGZ.charAt(1));
    var start = 0;
    for (var i = 0; i < 60; i++) {
      if (i % 10 === s && i % 12 === b) { start = i - (i % 10); break; }
    }
    return [D.branches[(start + 10) % 12], D.branches[(start + 11) % 12]];
  }
  function seasonOf(month) {
    if (month >= 1 && month <= 3) return '春';
    if (month >= 4 && month <= 6) return '夏';
    if (month >= 7 && month <= 9) return '秋';
    return '冬';
  }
  function wangStatus(elem, month) {
    var season = seasonOf(month);
    var map = {
      春: { 木: '旺', 火: '相', 水: '休', 金: '囚', 土: '死' },
      夏: { 火: '旺', 土: '相', 木: '休', 水: '囚', 金: '死' },
      秋: { 金: '旺', 水: '相', 土: '休', 火: '囚', 木: '死' },
      冬: { 水: '旺', 木: '相', 金: '休', 土: '囚', 火: '死' }
    };
    return { season: season, status: map[season][elem] || '' };
  }
  var QI_GENERAL = { 雨水: '亥', 春分: '戌', 谷雨: '酉', 小满: '申', 夏至: '未', 大暑: '午', 处暑: '巳', 秋分: '辰', 霜降: '卯', 小雪: '寅', 冬至: '丑', 大寒: '子' };
  function monthGenOf(lunar, mode) {
    if (mode !== 'qi') return D.monthGenerals[Math.abs(lunar.getMonth()) - 1];
    var q = lunar.getPrevQi(false);
    var qn = q && q.getName ? q.getName() : '';
    var branch = QI_GENERAL[qn] || '';
    for (var i = 0; i < D.monthGenerals.length; i++) {
      if (D.monthGenerals[i].branch === branch) return D.monthGenerals[i];
    }
    return D.monthGenerals[Math.abs(lunar.getMonth()) - 1];
  }
  function compute(opt) {
    opt = opt || {};
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(opt.date || ''));
    if (!m) throw new Error('请填写公历日期（YYYY-MM-DD）');
    var t = /^(\d{1,2}):(\d{2})/.exec(String(opt.time || ''));
    if (!t) throw new Error('请填写起课时刻');
    var y = +m[1], mo = +m[2], d = +m[3], hh = +t[1], mm = +t[2];
    if (y < 1900 || y > 2100) throw new Error('日期超出 1900 至 2100 年');
    if (hh > 23 || mm > 59) throw new Error('时刻无效');
    var place = String(opt.place || '');
    if (ix(D.branches, place) < 0) throw new Error('请选择地分');
    var notes = [];
    var dst = { y: y, m: mo, d: d, h: hh, mi: mm, applied: false, note: '' };
    if (typeof applyDstCorrection === 'function') dst = applyDstCorrection(y, mo, d, hh, mm, opt.dst || 'auto');
    if (dst.applied) { y = dst.y; mo = dst.m; d = dst.d; hh = dst.h; mm = dst.mi; notes.push(dst.note); }
    var sunMode = opt.sun || 'off';
    if (sunMode !== 'off') {
      var lng = Number(opt.lng);
      if (!isFinite(lng)) throw new Error('太阳时校正已开，但未定所在地：请选择省市区或填写经度，或把太阳时改为不校正');
      if (typeof trueSolarTime === 'function') {
        var ts = trueSolarTime(y, mo, d, hh, mm, lng, sunMode, opt.baseLng == null ? 120 : opt.baseLng);
        y = ts.y; mo = ts.m; d = ts.d; hh = ts.h; mm = ts.mi;
        notes.push('太阳时' + (sunMode === 'mean' ? '平太阳时' : '真太阳时') + '校正 ' + (ts.totalAdj >= 0 ? '+' : '') + ts.totalAdj + ' 分');
      }
    }
    var solar = Solar.fromYmdHms(y, mo, d, hh, mm, 0);
    var lunar = solar.getLunar();
    var dayGZ = opt.zi === 'early' ? lunar.getDayInGanZhiExact2() : lunar.getDayInGanZhiExact();
    var dayStem = dayGZ.charAt(0), dayBranch = dayGZ.charAt(1);
    var hb = hourBranch(hh);
    var lm = Math.abs(lunar.getMonth());
    var monthGen = monthGenOf(lunar, opt.jiang);
    var general = generalAt(monthGen.branch, hb, place);
    var nobleInfo = nobleAt(dayStem, hb, place);
    var noble = nobleInfo.data;
    var renYuan = stemAt(dayStem, place);
    var jiangGan = stemAt(dayStem, general.branch);
    var four = [
      { key: 'di', role: '尾', name: '地分', branch: place, stem: '', elem: D.branchElem[place], yy: D.branchYY[place], sub: '所立之方' },
      { key: 'jiang', role: '相', name: general.name, branch: general.branch, stem: jiangGan, elem: D.branchElem[general.branch], yy: D.branchYY[general.branch], sub: monthGen.name + '加' + hb + '时' },
      { key: 'shen', role: '主', name: noble.name, branch: noble.branch, stem: noble.stem, elem: noble.elem, yy: noble.yy, sub: '临' + place },
      { key: 'ren', role: '首', name: '人元', branch: '', stem: renYuan, elem: D.stemElem[renYuan], yy: D.stemYY[renYuan], sub: '五子元遁' }
    ];
    var diElem = D.branchElem[place], jiangElem = D.branchElem[general.branch], shenElem = noble.elem, renElem = D.stemElem[renYuan];
    var wu = D.wudong.filter(function (x) {
      if (x.name === '妻动') return D.elemKe[renElem] === diElem;
      if (x.name === '官动') return D.elemKe[shenElem] === renElem;
      if (x.name === '贼动') return D.elemKe[shenElem] === jiangElem;
      if (x.name === '财动') return D.elemKe[jiangElem] === shenElem;
      if (x.name === '鬼动') return D.elemKe[diElem] === renElem;
      return false;
    });
    var san = D.sandong.filter(function (x) {
      if (x.name === '父母动') return D.elemGen[diElem] === renElem;
      if (x.name === '子孙动') return D.elemGen[renElem] === diElem;
      if (x.name === '兄弟动') return diElem === renElem;
      return false;
    });
    var bset = [place, general.branch, noble.branch];
    var sanhe = [];
    D.sanhe.forEach(function (g) {
      var hit = g.branches.filter(function (b) { return bset.indexOf(b) >= 0; });
      if (hit.length === 3) sanhe.push({ name: g.name, elem: g.elem, full: true, text: '三合全身' });
      else if (hit.length === 2) {
        var miss = g.branches.filter(function (b) { return bset.indexOf(b) < 0; })[0];
        sanhe.push({ name: g.name, elem: g.elem, full: false, text: '虚一待用，缺' + miss });
      }
    });
    var liuhe = [];
    D.liuhe.forEach(function (p) {
      if (bset.indexOf(p[0]) >= 0 && bset.indexOf(p[1]) >= 0) liuhe.push(p[0] + p[1] + '合');
    });
    var qset = [renYuan, noble.stem, jiangGan];
    var sanqi = D.sanqi.filter(function (g) { return g.every(function (s) { return qset.indexOf(s) >= 0; }); });
    var kong = xunKong(dayGZ);
    var monthBranch = D.branches[(lm + 1) % 12];
    var po = D.branches[(ix(D.branches, monthBranch) + 6) % 12];
    var kongHit = four.filter(function (p) { return p.branch && kong.indexOf(p.branch) >= 0; });
    var poHit = four.filter(function (p) { return p.branch === po; });
    var wang = {};
    ['木', '火', '土', '金', '水'].forEach(function (e) { wang[e] = wangStatus(e, lm); });
    var lines = [];
    lines.push('贵神' + noble.name + '临' + place + '，' + noble.note);
    lines.push('将神' + general.name + '（' + general.branch + '）由月将' + monthGen.name + '（' + monthGen.branch + '）加' + hb + '时所得，' + general.note);
    lines.push('人元' + renYuan + '属' + renElem + '，地分' + place + '属' + diElem + '；' + (D.elemGen[diElem] === renElem ? '地分生人元' : D.elemKe[diElem] === renElem ? '地分克人元' : D.elemGen[renElem] === diElem ? '人元生地分' : D.elemKe[renElem] === diElem ? '人元克地分' : '人元与地分同气'));
    if (wu.length) lines.push('正动：' + wu.map(function (x) { return x.name + '（' + x.cond + '）'; }).join('、') + '。' + wu.map(function (x) { return x.text; }).join(''));
    else lines.push('四位无正动，按底本取旺神为用，从旺断。');
    if (san.length) lines.push('三动：' + san.map(function (x) { return x.name + '（' + x.cond + '）'; }).join('、') + '。' + san.map(function (x) { return x.text; }).join(''));
    if (kongHit.length) lines.push('日旬空亡在' + kong.join('、') + '；' + kongHit.map(function (p) { return p.name + (p.branch ? '（' + p.branch + '）' : ''); }).join('、') + '落空，发用与五动逢空者事多不成。');
    if (poHit.length) lines.push('月破在' + po + '；' + poHit.map(function (p) { return p.name; }).join('、') + '临破，事多阻折。');
    if (sanqi.length) lines.push('三奇全：' + sanqi.map(function (g) { return g.join(''); }).join('、') + '，利见大人，百事吉昌。');
    return {
      date: y + '-' + pad2(mo) + '-' + pad2(d), time: pad2(hh) + ':' + pad2(mm), place: place,
      adjustNote: notes.join('；'), monthMode: opt.jiang === 'qi' ? 'qi' : 'month',
      dayGZ: dayGZ, dayStem: dayStem, dayBranch: dayBranch,
      lunar: '农历' + (lunar.getMonth() < 0 ? '闰' : '') + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
      pillars: lunar.getYearInGanZhiExact() + '年 ' + lunar.getMonthInGanZhiExact() + '月 ' + dayGZ + '日 ' + lunar.getTimeInGanZhi() + '时',
      hourBranch: hb, dayNight: nobleInfo.day ? '昼' : '夜', nobleStart: nobleInfo.start, nobleDir: nobleInfo.dir > 0 ? '顺' : '逆',
      monthGeneral: monthGen, monthBranch: monthBranch, general: general, noble: noble,
      renYuan: renYuan, jiangGan: jiangGan,
      four: four, wu: wu, san: san, sanhe: sanhe, liuhe: liuhe, sanqi: sanqi,
      kong: kong, kongHit: kongHit, po: po, poHit: poHit,
      wang: wang, season: seasonOf(lm),
      lines: lines
    };
  }

  global.Jinkoujue = { compute: compute, rel: rel };
})(window);
