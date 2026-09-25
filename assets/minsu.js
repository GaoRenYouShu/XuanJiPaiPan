/* ============================================================
 * minsu.js：民俗占法页逻辑（minsu.html 专用）
 * ------------------------------------------------------------
 * 四模块：称骨算命、犯月查询、本命佛、号码吉凶。
 * 真源约定（均只消费，不另写推法）：
 *   四柱与农历：window.buildBaziState（bazi-app.js，与八字页同源装配）。
 *   称骨骨重：bazi-rel.js chenguCore(BZ) 取年月日时骨重分项与总重、
 *     chenguVerdict 分等；歌诀正文取 chengu-songs.js 男卷女卷全本。
 *   犯月：minsu-data.js FANYUE（败子歌，明犯按生月、暗犯按胎元月）与
 *     FANYUE_VERSES（骨髓破，坊本只论生月）；胎元消费 st.ec.getTaiYuan()。
 *   本命佛：minsu-data.js BENMING_BUDDHA（zhi2idx 地支映射、真言两系并列）。
 *   号码：八星配对表 NUMBER_BAGXING（0、5 中宫无卦，为界切段再配）；
 *     八十一数理折算取 NAME_ENGINE.n81（与姓名学同法，超 81 减 80 取模），
 *     吉凶关键词取 NAME_DATA.NAME81 与 LUCK_LABEL，数理五行取 WX_OF_NUM。
 * 时辰未知：称骨不计骨重按年月日估算并注明；犯月时柱未判、胎元只依月柱仍可判。
 * 页面结构：全站标准折叠模块（section.mod 四模块）+ 四参考 details（mh-ref）不动。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 0. 小工具 ===== */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /* 农历月序、日序中文（LunarUtil.MONTH 为 i18n 模板不可直用，页面自写映射） */
  var CN_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var CN_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  var NUM_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  /* 生肖名到地支（本命佛 zhi2idx 键为地支，生肖由农历年来） */
  var SHENG2ZHI = { 鼠: '子', 牛: '丑', 虎: '寅', 兔: '卯', 龙: '辰', 蛇: '巳', 马: '午', 羊: '未', 猴: '申', 鸡: '酉', 狗: '戌', 猪: '亥' };
  /* 胎元月支转农历月次（寅建正月） */
  var TAI_YUE = { 寅: 1, 卯: 2, 辰: 3, 巳: 4, 午: 5, 未: 6, 申: 7, 酉: 8, 戌: 9, 亥: 10, 子: 11, 丑: 12 };
  /* 骨重档位键转中文（两.钱） */
  function weightCN(k) {
    var p = String(k).split('.');
    return NUM_CN[+p[0]] + '两' + (+p[1] > 0 ? NUM_CN[+p[1]] + '钱' : '整');
  }

  var LAST = { chengu: null, fanyue: null, buddha: null, num: null, sanshi: null };

  /* ===== 0b. A 溯源标注 / C 统一娱乐声明 ===== */
  var MS_DISCLAIMER = '以上结果属民俗文化范畴，仅供文化了解与娱乐参考，不构成任何命理定论或现实决策依据。';
  function disclaimerLine() { return '<div class="ms-disclaimer">' + esc(MS_DISCLAIMER) + '</div>'; }

  /* ===== 1. 折叠模块 =====
   * 四种占法各占一 section.mod 折叠模块（全站标准折叠模块体系，collapsed 类承载开合），
   * 此处登记模块位，供 AI 上下文取当前展开项与 shareWait 回填展开状态。 */
  var FOLDS = [
    { k: 'chengu', id: 'msmod-chengu', name: '称骨算命' },
    { k: 'fanyue', id: 'msmod-fanyue', name: '犯月查询' },
    { k: 'buddha', id: 'msmod-buddha', name: '本命佛' },
    { k: 'shuzi', id: 'msmod-num', name: '号码吉凶' },
    { k: 'sanshi', id: 'msmod-sanshi', name: '三世书' }
  ];
  function openFolds() {
    var r = [];
    for (var i = 0; i < FOLDS.length; i++) {
      var el = $(FOLDS[i].id);
      if (el && !el.classList.contains('collapsed')) r.push(FOLDS[i]);
    }
    return r;
  }

  /* ===== 2. 输入解析 ===== */
  /* 公历日期串解析（正则 + 构造回读校验） */
  function parseSolar(dateStr) {
    var m = String(dateStr || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    try {
      var s = Solar.fromYmd(y, mo, d);
      if (s.getYear() !== y || s.getMonth() !== mo || s.getDay() !== d) return null;
      return s;
    } catch (e) { return null; }
  }
  /* 农历日期解析：闰月以负数月构造，构造后回读月日校验（防静默进位、防无此闰月） */
  function parseLunar(y, mo, d, leap) {
    if (!(y >= 1900 && y <= 2100)) return { err: '农历年份须在 1900 至 2100 之间。' };
    if (!(mo >= 1 && mo <= 12)) return { err: '农历月须在正月至腊月之间。' };
    if (!(d >= 1 && d <= 30)) return { err: '农历日须在初一至三十之间。' };
    /* 闰月实有性预检：该年无此闰月时库仅抛英文错，先行按 LunarYear 闰月序给出明确提示 */
    if (leap) {
      var lym = 0;
      try { if (typeof LunarYear !== 'undefined' && LunarYear.fromYear) lym = LunarYear.fromYear(y).getLeapMonth() || 0; } catch (e0) { lym = 0; }
      if (lym !== mo) {
        return { err: '农历 ' + y + ' 年无闰' + CN_MONTH[mo - 1] + '月' +
          (lym ? '（该年闰' + CN_MONTH[lym - 1] + '月）' : '（该年无闰月）') + '，请核对月份与闰月设置。' };
      }
    }
    try {
      var l = Lunar.fromYmd(y, leap ? -mo : mo, d);
      var got = l.getMonth();
      if (Math.abs(got) !== mo || (leap ? got >= 0 : got < 0) || l.getDay() !== d) {
        return { err: '农历 ' + y + ' 年无' + (leap ? '闰' : '') + CN_MONTH[mo - 1] + '月' + CN_DAYS[d - 1] + '，请核对年月日与闰月。' };
      }
      return { l: l, sol: l.getSolar() };
    } catch (e) {
      return { err: '农历日期无效，请核对年月日与闰月。' };
    }
  }
  /* 四柱装配（同源真源；时辰未知传 12:00 占位，仅用于装配完整，时柱不判） */
  function stateOf(dateStr, timeVal, sex) {
    if (!window.buildBaziState) return null;
    try {
      return window.buildBaziState({
        date: dateStr, time: timeVal || '12:00',
        sex: sex == null ? 1 : sex, ziMode: 'late', useTrue: false, lng: 120, kongAxis: 'day'
      });
    } catch (e) { return null; }
  }

  /* ===== 3. 称骨算命 ===== */
  function songOf(sex, key, clampNote) {
    var songs = sex === 'm' ? window.CHENGU_SONGS_M : window.CHENGU_SONGS_F;
    if (!songs) return { txt: '', note: clampNote };
    var v = parseFloat(key);
    var lo = 2.1, hi = sex === 'm' ? 7.2 : 7.1;
    var used = key, note = clampNote || '';
    if (v < lo) { used = '2.1'; note += '坊本歌诀自二两一钱起，本次总骨重低于起档，按二两一钱歌诀参考。'; }
    else if (v > hi) { used = String(hi); note += '坊本歌诀' + (sex === 'm' ? '男卷止于七两二钱' : '女卷止于七两一钱') + '，本次总骨重超出止档，按止档歌诀参考。'; }
    return { txt: songs[used] || '', used: used, note: note };
  }

  function renderChengu() {
    var out = $('msChenguOut');
    var sex = $('msCnSex').value;
    var hourVal = $('msCnHour').value;
    var hasHour = !!hourVal;
    var y, mo, d, leap, sol;
    if ($('msCnMode').value === 'solar') {
      /* 公历模式：正则校验后 Solar 转 Lunar，年月日闰由转换得出，与农历模式共用后续链路 */
      var m = ($('msSolarDate').value || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) { out.innerHTML = '<p class="ms-err">请输入有效公历日期，格式 1990-05-15（月日两位补零）。</p>'; LAST.chengu = null; return; }
      try { sol = Solar.fromYmd(+m[1], +m[2], +m[3]); } catch (e) { sol = null; }
      if (!sol) { out.innerHTML = '<p class="ms-err">公历日期无效，请核对年月日。</p>'; LAST.chengu = null; return; }
      var ln = sol.getLunar();
      y = ln.getYear(); mo = Math.abs(ln.getMonth()); leap = ln.getMonth() < 0; d = ln.getDay();
    } else {
      y = parseInt(($('msCnYear').value || '').trim(), 10);
      mo = +$('msCnMonth').value;
      d = +$('msCnDay').value;
      leap = $('msCnLeap').value === '1';
      if (!y) { out.innerHTML = '<p class="ms-err">请输入农历年（1900 至 2100）。</p>'; LAST.chengu = null; return; }
      var pl = parseLunar(y, mo, d, leap);
      if (pl.err) { out.innerHTML = '<p class="ms-err">' + esc(pl.err) + '</p>'; LAST.chengu = null; return; }
      sol = pl.sol;
    }

    var dateStr = sol.toYmd();
    var timeVal = hasHour ? pad2(+hourVal) + ':00' : '12:00';
    var st = stateOf(dateStr, timeVal, sex === 'm' ? 1 : 0);
    if (!st || !st.BZ || typeof chenguCore !== 'function') {
      out.innerHTML = '<p class="ms-err">四柱装配失败，请稍后重试。</p>'; LAST.chengu = null; return;
    }
    var c = chenguCore(st.BZ);
    /* 时辰未知：不计时柱骨重，按年月日估算（真源分项相加，非另写推法） */
    var total = hasHour ? c.total : (c.yv + c.mv + (c.dv == null ? 0 : c.dv));
    var liangInt = Math.floor(total / 10), qian = total % 10;
    var key = liangInt + '.' + qian;
    var vd = chenguVerdict(total / 10);
    var juan = sex === 'm' ? '男卷' : '女卷';
    var song = songOf(sex, key, '');

    var html = '';
    html += '<div class="ms-cards">';
    html += '<div class="ms-card"><div class="ms-card-k">总骨重</div><div class="ms-card-v">' + liangInt + ' 两 ' + qian + ' 钱</div>' +
      '<div class="ms-card-s">' + total + ' 钱（' + weightCN(key) + '）</div></div>';
    html += '<div class="ms-card"><div class="ms-card-k">农历生日</div><div class="ms-card-v">' + esc(y) + ' 年' +
      (leap ? '闰' : '') + esc(CN_MONTH[mo - 1]) + '月' + esc(CN_DAYS[d - 1]) + '</div>' +
      '<div class="ms-card-s">公历 ' + esc(dateStr) + '</div></div>';
    html += '<div class="ms-card ms-card-gold"><div class="ms-card-k">四柱</div><div class="ms-card-v">' +
      esc(st.BZ.gans[0] + st.BZ.zhis[0]) + ' ' + esc(st.BZ.gans[1] + st.BZ.zhis[1]) + ' ' +
      esc(st.BZ.gans[2] + st.BZ.zhis[2]) + ' ' + (hasHour ? esc(st.BZ.gans[3] + st.BZ.zhis[3]) : '未知时辰') + '</div>' +
      '<div class="ms-card-s">' + esc(juan) + '取诀，骨重按年、月、日、时四项相加</div></div>';
    html += '</div>';

    html += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>分项</th><th>骨重</th><th>依据</th></tr></thead><tbody>';
    html += '<tr><td class="ms-c0">年柱</td><td>' + esc(c.yg) + ' ' + c.yv + ' 钱</td><td>骨重年表（立春界年柱）</td></tr>';
    html += '<tr><td class="ms-c0">月</td><td>月支' + esc(c.mz) + ' ' + c.mv + ' 钱</td><td>骨重月表（节气月）</td></tr>';
    html += '<tr><td class="ms-c0">日</td><td>农历' + esc(CN_DAYS[d - 1]) + ' ' + (c.dv == null ? 0 : c.dv) + ' 钱</td><td>骨重日表（农历日序）</td></tr>';
    html += '<tr><td class="ms-c0">时辰</td><td>' + (hasHour ? '时支' + esc(c.tz) + ' ' + c.hv + ' 钱' : '未知时辰，未计') +
      '</td><td>' + (hasHour ? '骨重时表（时支）' : '按年月日估算，时柱骨重不计入') + '</td></tr>';
    html += '</tbody></table></div>';

    if (song.txt) {
      html += '<div class="ms-verse"><div>' + esc(weightCN(song.used)) + '（' + esc(juan) + '）</div>' + esc(song.txt) + '</div>';
      if (sex === 'm' && song.used === '7.2' && window.CHENGU_SONGS_M_72B) {
        html += '<div class="ms-verse"><div>七两二钱乙说</div>' + esc(window.CHENGU_SONGS_M_72B) + '</div>';
      }
    }
    var notes = window.CHENGU_SONGS_NOTES || {};
    var xn = (notes[song.used] || '') + (c.yg === '癸亥' ? (notes.guihai || '') : '');
    if (xn) html += '<div class="ms-note">笺注：' + esc(xn) + '</div>';
    if (song.note) html += '<div class="ms-note">' + esc(song.note) + '</div>';
    if (!hasHour) html += '<div class="ms-note">时辰未知：时柱骨重不计入，总骨重按年、月、日三项估算，与已知时辰的结果会有差异。</div>';
    html += '<div class="ms-note">分等：' + esc(vd ? vd.t : '无') + '。</div>';
    html += disclaimerLine();
    out.innerHTML = html;

    LAST.chengu = {
      y: y, mo: mo, d: d, leap: leap, sex: sex, hasHour: hasHour,
      dateStr: dateStr, total: total, liang: liangInt + ' 两 ' + qian + ' 钱',
      key: key, song: song.txt, verdict: vd ? vd.t : ''
    };
  }

  /* ===== 4. 犯月查询 ===== */
  function judgeYue(name, byMonth, sheng, mNum, taiM) {
    var mHit = byMonth[mNum] === sheng;
    var aHit = taiM ? byMonth[taiM] === sheng : false;
    return { name: name, mHit: mHit, aHit: aHit, mZhi: byMonth[mNum] || '无', aZhi: taiM ? (byMonth[taiM] || '无') : '无' };
  }
  function renderFanyue() {
    var out = $('msFanyueOut');
    var dateStr = $('msFyDate').value.trim();
    var hourVal = $('msFyHour').value;
    var hasHour = !!hourVal;
    var sol = parseSolar(dateStr);
    if (!sol) { out.innerHTML = '<p class="ms-err">请输入有效公历生日，格式 1990-05-15（月日两位补零）。</p>'; LAST.fanyue = null; return; }
    var st = stateOf(sol.toYmd(), hourVal, 1);
    if (!st || !st.BZ || !st.BZ.lunar || !st.ec) {
      out.innerHTML = '<p class="ms-err">四柱装配失败，请核对日期。</p>'; LAST.fanyue = null; return;
    }
    var ln = st.BZ.lunar;
    var sheng = ln.getYearShengXiao();
    var mNum = Math.abs(ln.getMonth());
    var isLeap = ln.getMonth() < 0;
    var taiGz = '';
    try { taiGz = st.ec.getTaiYuan() || ''; } catch (e) { taiGz = ''; }
    var taiZhi = taiGz ? taiGz.charAt(1) : '';
    var taiM = TAI_YUE[taiZhi] || 0;

    var FY = window.FANYUE;
    var GS = (window.FANYUE_VERSES && window.FANYUE_VERSES[0]) || null;
    var j1 = judgeYue(FY.name, FY.byMonth, sheng, mNum, taiM);
    var j2 = GS ? judgeYue(GS.name, GS.byMonth, sheng, mNum, taiM) : null;
    var anyMing = j1.mHit || (j2 && j2.mHit);
    var anyAn = j1.aHit;

    var html = '';
    html += '<div class="ms-cards">';
    html += '<div class="ms-card"><div class="ms-card-k">生年生肖</div><div class="ms-card-v">' + esc(sheng) + '</div>' +
      '<div class="ms-card-s">农历' + esc(ln.getYearInGanZhi()) + '年，正月初一为界</div></div>';
    html += '<div class="ms-card"><div class="ms-card-k">农历生月</div><div class="ms-card-v">' + (isLeap ? '闰' : '') +
      esc(CN_MONTH[mNum - 1]) + '月' + esc(CN_DAYS[ln.getDay() - 1]) + '</div>' +
      '<div class="ms-card-s">月次 ' + mNum + (isLeap ? '（闰月按本月序）' : '') + '</div></div>';
    html += '<div class="ms-card ms-card-gold"><div class="ms-card-k">胎元</div><div class="ms-card-v">' + esc(taiGz || '无') + '</div>' +
      '<div class="ms-card-s">' + (taiM ? '胎月' + esc(CN_MONTH[taiM - 1]) + '月（月干进一、月支进三）' : '无') + '</div></div>';
    html += '</div>';

    html += '<div class="ms-judge">';
    html += '<div class="ms-judge-row"><span class="ms-judge-k">' + esc(FY.name) + '</span><span>' +
      '<span class="ms-badge ' + (j1.mHit ? 'ms-warn' : 'ms-ok') + '">明犯（明败子）' + (j1.mHit ? '是' : '否') + '</span>' +
      '<span class="ms-badge ' + (j1.aHit ? 'ms-warn' : 'ms-plain') + '">暗犯（血败子）' + (j1.aHit ? '是' : '否') + '</span>' +
      '生月败月生肖 ' + esc(j1.mZhi) + '、胎月败月生肖 ' + esc(j1.aZhi) + '</span></div>';
    if (j2) {
      html += '<div class="ms-judge-row"><span class="ms-judge-k">' + esc(j2.name) + '</span><span>' +
        '<span class="ms-badge ' + (j2.mHit ? 'ms-warn' : 'ms-ok') + '">生月犯' + (j2.mHit ? '是' : '否') + '</span>' +
        '生月败月生肖 ' + esc(j2.mZhi) + '，坊本只论生月</span></div>';
    }
    html += '<div class="ms-judge-row"><span class="ms-judge-k">四柱</span><span>' +
      esc(st.BZ.gans[0] + st.BZ.zhis[0]) + ' ' + esc(st.BZ.gans[1] + st.BZ.zhis[1]) + ' ' +
      esc(st.BZ.gans[2] + st.BZ.zhis[2]) + ' ' + (hasHour ? esc(st.BZ.gans[3] + st.BZ.zhis[3]) : '未知时辰，未判') + '</span></div>';
    html += '</div>';

    html += '<div class="ms-verse"><div>' + esc(FY.name) + '</div>' + esc(FY.verse) + '</div>';
    if (GS) html += '<div class="ms-verse"><div>' + esc(GS.name) + '</div>' + esc(GS.verse) + '</div>';
    html += '<div class="ms-note">' + (anyMing || anyAn
      ? '判定结果：' + (j1.mHit ? '生月落败月，为明犯（明败子）。' : '') + (j1.aHit ? '胎元月落败月，为暗犯（血败子）。' : '') +
      (j2 && j2.mHit ? '骨髓破歌生月亦中。' : '')
      : '两套歌诀均未中。') + '</div>';
    if (!hasHour) html += '<div class="ms-note">时辰未知：时柱未判；胎元只依月柱推算，暗犯判定不受影响。</div>';
    html += disclaimerLine();
    out.innerHTML = html;

    LAST.fanyue = {
      dateStr: sol.toYmd(), sheng: sheng, mNum: mNum, isLeap: isLeap, taiGz: taiGz, taiM: taiM,
      hasHour: hasHour, ming: j1.mHit, an: j1.aHit, gs: j2 ? j2.mHit : false
    };
  }

  /* ===== 5. 本命佛 ===== */
  function renderBuddha() {
    var out = $('msBuddhaOut');
    var zhiSel = $('msBdZhi').value;
    var zhi = '', from = '';
    if (zhiSel) { zhi = zhiSel; from = '直选生肖'; }
    else {
      var sol = parseSolar($('msBdDate').value);
      if (!sol) { out.innerHTML = '<p class="ms-err">请输入有效公历生日（格式 1990-05-15）或直接选择生肖。</p>'; LAST.buddha = null; return; }
      var sheng = sol.getLunar().getYearShengXiao();
      zhi = SHENG2ZHI[sheng] || '';
      from = '按公历生日 ' + sol.toYmd() + ' 农历年界推定（' + esc(sheng) + '）';
    }
    var BB = window.BENMING_BUDDHA;
    var idx = BB && BB.zhi2idx ? BB.zhi2idx[zhi] : null;
    if (idx == null || !BB.list[idx]) { out.innerHTML = '<p class="ms-err">未找到该生肖对应的本命佛。</p>'; LAST.buddha = null; return; }
    var b = BB.list[idx];

    var html = '<div class="ms-buddha">';
    html += '<div class="ms-buddha-name">' + esc(b.name) + '</div>';
    html += '<div class="ms-note">对应生肖：' + esc(b.animal) + '（本命支 ' + esc(b.zhis.join('、')) +
      '），生肖来源：' + (zhiSel ? esc(from) : from) + '</div>';
    html += '<div class="ms-buddha-mantra">经籍真言（唐密汉译通行音）：' + esc(b.jing) + '</div>';
    html += '<div class="ms-buddha-py">' + esc(b.jingPy) + '</div>';
    html += '<div class="ms-note">' + esc(b.jingNote) + '</div>';
    html += '<div class="ms-buddha-mantra">民间心咒：' + esc(b.xin) + '</div>';
    html += '<div class="ms-buddha-py">' + esc(b.xinPy) + '</div>';
    html += '<div class="ms-note">' + esc(b.xinNote) + '</div>';
    html += '<div class="ms-note">法义：' + esc(b.meaning) + '</div>';
    html += '</div>';
    html += disclaimerLine();
    out.innerHTML = html;
    LAST.buddha = { zhi: zhi, name: b.name, animal: b.animal };
  }

  /* ===== 6. 号码吉凶 ===== */
  var PAIR2STAR = null;
  var STAR_ORDER = ['天医', '延年', '生气', '伏位', '绝命', '五鬼', '六煞', '祸害'];
  function pairIndex() {
    if (PAIR2STAR) return PAIR2STAR;
    PAIR2STAR = {};
    var p = window.NUMBER_BAGXING.pairs;
    for (var st in p) {
      for (var i = 0; i < p[st].length; i++) PAIR2STAR[p[st][i]] = st;
    }
    return PAIR2STAR;
  }
  /* 八十一数理折算：不超过 81 用原数，超过减 80 取模（n%80，为 0 记 80）；
     号码超长时逐位取模，避免整数精度丢失。 */
  function num81(digits) {
    if (digits.length <= 15) return window.NAME_ENGINE.n81(parseInt(digits, 10));
    var r = 0;
    for (var i = 0; i < digits.length; i++) r = (r * 10 + (digits.charCodeAt(i) - 48)) % 80;
    return r === 0 ? 80 : r;
  }
  function renderNum() {
    var out = $('msNumOut');
    var digits = String($('msNum').value || '').replace(/\D/g, '');
    if (!digits) { out.innerHTML = '<p class="ms-err">请输入号码（纯数字）。</p>'; LAST.num = null; return; }
    if (digits.length < 2) { out.innerHTML = '<p class="ms-err">号码至少两位数字才能配对。</p>'; LAST.num = null; return; }
    var part = $('msNumPart').value;
    var taken = (part === 'tail' && digits.length > 8) ? digits.slice(-8) : digits;

    var m = num81(taken);
    var it = m >= 1 ? window.NAME_DATA.NAME81[m - 1] : null;
    var luck = it ? (window.NAME_DATA.LUCK_LABEL[it.luck] || '无') : '无';
    var wx = window.NAME_DATA.WX_OF_NUM ? (window.NAME_DATA.WX_OF_NUM[m % 10] || '无') : '无';

    var html = '';
    html += '<div class="ms-cards">';
    html += '<div class="ms-card"><div class="ms-card-k">取位号码</div><div class="ms-card-v">' + esc(taken) + '</div>' +
      '<div class="ms-card-s">' + (part === 'tail' ? '末八位' : '全号') +
      (taken.length !== digits.length ? '（原号 ' + digits.length + ' 位）' : '') + '</div></div>';
    html += '<div class="ms-card ms-card-gold"><div class="ms-card-k">八十一数理</div><div class="ms-card-v">' + m + ' 数</div>' +
      '<div class="ms-card-s">各位相加折算，' + esc(luck) + '，数理五行' + esc(wx) + '</div></div>';
    html += '</div>';
    if (it) html += '<div class="ms-note">数理关键词：' + esc(it.key || '无') + '；定性：' + esc(it.tag || '无') + '。</div>';

    /* 八星：以 0、5 为界切段，段内相邻两位滑窗配对 */
    var P2S = pairIndex(), BX = window.NUMBER_BAGXING;
    var segs = [], cur = '';
    for (var i = 0; i < taken.length; i++) {
      var ch = taken.charAt(i);
      if (BX.skip.indexOf(ch) >= 0) { if (cur) { segs.push(cur); cur = ''; } }
      else cur += ch;
    }
    if (cur) segs.push(cur);
    var seq = [], cnt = {}, skipN = 0;
    for (var a = 0; a < segs.length; a++) {
      var sg = segs[a];
      if (sg.length < 2) continue;
      for (var b = 0; b < sg.length - 1; b++) {
        var pr = sg.slice(b, b + 2);
        var star = P2S[pr] || '';
        if (!star) continue;
        cnt[star] = (cnt[star] || 0) + 1;
        seq.push({ pr: pr, star: star });
      }
    }
    for (var s2 = 0; s2 < taken.length - 1; s2++) {
      var q = taken.slice(s2, s2 + 2);
      if (BX.skip.indexOf(q.charAt(0)) >= 0 || BX.skip.indexOf(q.charAt(1)) >= 0) skipN++;
    }

    if (seq.length) {
      html += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>组合</th><th>磁场</th><th>属性</th><th>断语（通行之说）</th></tr></thead><tbody>';
      for (var k = 0; k < seq.length; k++) {
        var st2 = seq[k].star;
        var good = BX.groups['吉'].indexOf(st2) >= 0;
        html += '<tr><td class="ms-c0">' + esc(seq[k].pr) + '</td><td>' + esc(st2) + '</td>' +
          '<td class="' + (good ? 'ms-good' : 'ms-bad') + '">' + (good ? '吉' : '凶') + '</td>' +
          '<td>' + esc(BX.verdicts[st2] || '无') + '</td></tr>';
      }
      html += '</tbody></table></div>';
      var tags = '';
      for (var t = 0; t < STAR_ORDER.length; t++) {
        var n2 = cnt[STAR_ORDER[t]] || 0;
        if (!n2) continue;
        var g2 = BX.groups['吉'].indexOf(STAR_ORDER[t]) >= 0;
        tags += '<span class="ms-badge ' + (g2 ? 'ms-ok' : 'ms-warn') + '">' + esc(STAR_ORDER[t]) + ' ' + n2 + ' 组</span>';
      }
      html += '<div class="ms-note">出现统计：' + tags + '</div>';
    } else {
      html += '<div class="ms-note">无相邻配对（号码全为 0 或 5，或各段不足两位），八星磁场不判。</div>';
    }
    if (skipN) html += '<div class="ms-note">含 0、5 的邻接组合 ' + skipN + ' 处不论磁场（中宫无卦）。</div>';
    html += disclaimerLine();
    out.innerHTML = html;

    LAST.num = { taken: taken, m: m, luck: luck, wx: wx, cnt: cnt, seqLen: seq.length };
  }

  /* ===== 6b. 三世书（袁天罡三世相法） ===== */
  function renderSanshi() {
  var out = $('msSanshiOut');
  var SS = window.SANSHI;
  if (!SS) { out.innerHTML = '<p class="ms-err">三世书数据未载入。</p>'; return; }
  var dateStr = $('msSsDate').value.trim();
  var sol = parseSolar(dateStr);
  if (!sol) { out.innerHTML = '<p class="ms-err">请输入有效公历日期，格式 1990-05-15（月日两位补零）。</p>'; LAST.sanshi = null; return; }
  var st = stateOf(sol.toYmd(), '', 1);
  if (!st || !st.BZ || !st.BZ.lunar) {
    out.innerHTML = '<p class="ms-err">四柱装配失败，请核对日期。</p>'; LAST.sanshi = null; return;
  }
  var ln = st.BZ.lunar;
  var sheng = ln.getYearShengXiao();
  var yearZhi = SHENG2ZHI[sheng] || ln.getYearInGanZhi().charAt(1);
  var zo = SS.zhiOrder[yearZhi] || 0;
  var mNum = Math.abs(ln.getMonth());
  var isLeap = ln.getMonth() < 0;
  var dayGz = ln.getDayInGanZhi();
  var navin = ln.getDayNaYin() || '';
  /* navin 为完整纳音（如 平地木），婚姻位按末字五行查表（木） */
  var navinEl = navin ? navin.charAt(navin.length - 1) : '';
  var idx = ((zo - mNum) % 12 + 12) % 12;
  var gw = SS.gongwei[idx];
  var cl = SS.cailu[idx];
  /* 婚姻：日柱纳音乘农历月 → 长生十二神位置 */
  var hyName = '无', hyVerd = '日柱纳音无法判定，婚姻位不查。';
  if (SS.hyPos[navinEl]) {
  var arr = SS.hyPos[navinEl];
  for (var hi = 0; hi < arr.length; hi++) { if (arr[hi] === mNum) { hyName = SS.hyNames[hi]; break; } }
  hyVerd = SS.hyVerdict[hyName] || '无';
  }

  var html = '';
  html += '<div class="ms-cards">';
  html += '<div class="ms-card"><div class="ms-card-k">生肖（年支）</div><div class="ms-card-v">' + esc(sheng) + '（' + esc(yearZhi) + '）</div>' +
  '<div class="ms-card-s">农历' + esc(ln.getYearInGanZhi()) + '年，正月初一为界</div></div>';
  html += '<div class="ms-card"><div class="ms-card-k">农历月生</div><div class="ms-card-v">' + (isLeap ? '闰' : '') + esc(CN_MONTH[mNum - 1]) + '月</div>' +
  '<div class="ms-card-s">月次 ' + mNum + (isLeap ? '（闰月按本月）' : '') + '</div></div>';
  html += '<div class="ms-card ms-card-gold"><div class="ms-card-k">日柱纳音</div><div class="ms-card-v">' + esc(dayGz) + ' ' + esc(navin || '无') + '</div>' +
  '<div class="ms-card-s">日干支纳音五行，婚姻位依此查</div></div>';
  html += '</div>';

  html += '<div class="ms-verse"><div>前世身份 ' + esc(gw.gong) + '（' + esc(gw.shen) + '）</div>' + esc(gw.verse) + '</div>';
  html += '<div class="ms-verse"><div>今世财禄 ' + esc(cl.lu) + '</div>前世：' + esc(cl.prev) + '<br>现世：' + esc(cl.now) + '</div>';
  html += '<div class="ms-verse"><div>前世婚姻 夫妇感情位 ' + esc(hyName) + '</div>' + esc(hyVerd) + '</div>';

  html += disclaimerLine();
  out.innerHTML = html;

  LAST.sanshi = {
    dateStr: sol.toYmd(), sheng: sheng, yearZhi: yearZhi, mNum: mNum, isLeap: isLeap,
    navin: navin, gong: gw.gong, shen: gw.shen, lu: cl.lu, hy: hyName
  };
  }

  /* 三世书三表（参考 details 渲染） */
  function renderSanshiTables() {
  var SS = window.SANSHI;
  if (!SS) return;
  var ZHIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var MONTH_TH = CN_MONTH.map(function (m) { return '<th>' + m + '月</th>'; }).join('');

  var h1 = '<h3>前世身份 宫位表（生肖乘农历月，一宫至十二宫）</h3>';
  h1 += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>生肖</th>' + MONTH_TH + '</tr></thead><tbody>';
  for (var zi = 0; zi < ZHIS.length; zi++) {
    var z1 = SS.zhiOrder[ZHIS[zi]];
    h1 += '<tr><td class="ms-c0">' + esc(ZHIS[zi]) + '</td>';
    for (var m1 = 1; m1 <= 12; m1++) {
    var i1 = ((z1 - m1) % 12 + 12) % 12;
    h1 += '<td>' + esc(SS.gongwei[i1].gong) + '</td>';
    }
    h1 += '</tr>';
  }
  h1 += '</tbody></table></div>';

  var h2 = '<h3>今世财禄 十二禄表（年支乘农历月，建禄至闭禄）</h3>';
  h2 += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>年支</th>' + MONTH_TH + '</tr></thead><tbody>';
  for (var zj = 0; zj < ZHIS.length; zj++) {
    var z2 = SS.zhiOrder[ZHIS[zj]];
    h2 += '<tr><td class="ms-c0">' + esc(ZHIS[zj]) + '</td>';
    for (var m2 = 1; m2 <= 12; m2++) {
    var i2 = ((z2 - m2) % 12 + 12) % 12;
    h2 += '<td>' + esc(SS.cailu[i2].lu) + '</td>';
    }
    h2 += '</tr>';
  }
  h2 += '</tbody></table></div>';

  var NAV = ['金', '水', '木', '火', '土'];
  var h3 = '<h3>前世婚姻 夫妇感情位表（日柱纳音乘农历月，长生十二神）</h3>';
  h3 += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>纳音</th>' + SS.hyNames.map(function (n) { return '<th>' + n + '</th>'; }).join('') + '</tr></thead><tbody>';
  for (var ni = 0; ni < NAV.length; ni++) {
    var a2 = SS.hyPos[NAV[ni]];
    h3 += '<tr><td class="ms-c0">' + esc(NAV[ni]) + '</td>';
    for (var pi = 0; pi < 12; pi++) h3 += '<td>' + esc(CN_MONTH[a2[pi] - 1] + '月') + '</td>';
    h3 += '</tr>';
  }
  h3 += '</tbody></table></div>';
  $('msSanshiBody').innerHTML = h1 + h2 + h3;
  }

  /* ===== 7. 参考总表（details 折叠） ===== */
  function renderName81() {
    var arr = window.NAME_DATA.NAME81, rows = '';
    for (var i = 0; i < arr.length; i++) {
      var it = arr[i];
      var lk = window.NAME_DATA.LUCK_LABEL[it.luck] || '无';
      var cls = it.luck === 'ji' ? 'ms-ok' : (it.luck === 'xiong' ? 'ms-warn' : 'ms-plain');
      rows += '<tr><td class="ms-c0">' + (i + 1) + '</td><td><span class="ms-badge ' + cls + '">' + esc(lk) +
        '</span></td><td>' + esc(it.key || '无') + '</td><td>' + esc(it.tag || '无') + '</td></tr>';
    }
    $('msName81Body').innerHTML = rows;
  }
  function renderSongs() {
    var h = '', i, keys, k;
    var M = window.CHENGU_SONGS_M, F = window.CHENGU_SONGS_F;
    keys = Object.keys(M).sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
    h += '<h3>男卷 ' + keys.length + ' 首（' + weightCN(keys[0]) + ' 至 ' + weightCN(keys[keys.length - 1]) + '）</h3>';
    h += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>骨重</th><th>歌诀</th></tr></thead><tbody>';
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      h += '<tr><td class="ms-c0">' + esc(weightCN(k)) + '</td><td>' + esc(M[k]) + '</td></tr>';
    }
    h += '</tbody></table></div>';
    if (window.CHENGU_SONGS_M_72B) {
      h += '<div class="ms-verse"><div>七两二钱乙说（坊本另一传）</div>' + esc(window.CHENGU_SONGS_M_72B) + '</div>';
    }
    keys = Object.keys(F).sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
    h += '<h3>女卷 ' + keys.length + ' 首（' + weightCN(keys[0]) + ' 至 ' + weightCN(keys[keys.length - 1]) + '）</h3>';
    h += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>骨重</th><th>歌诀</th></tr></thead><tbody>';
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      h += '<tr><td class="ms-c0">' + esc(weightCN(k)) + '</td><td>' + esc(F[k]) + '</td></tr>';
    }
    h += '</tbody></table></div>';
    var notes = window.CHENGU_SONGS_NOTES || {};
    var nk = Object.keys(notes);
    var lines = '';
    for (i = 0; i < nk.length; i++) {
      if (nk[i] === 'src') continue;
      lines += '<div class="ms-note">' + (nk[i] === 'guihai' ? '癸亥年注' : esc(weightCN(nk[i])) + '注') + '：' + esc(notes[nk[i]]) + '</div>';
    }
    h += lines;
    $('msSongsBody').innerHTML = h;
  }
  function renderVerses() {
    var FY = window.FANYUE;
    var GS = (window.FANYUE_VERSES && window.FANYUE_VERSES[0]) || null;
    var h = '';
    h += '<div class="ms-verse"><div>' + esc(FY.name) + '</div>' + esc(FY.verse) + '</div>';
    if (GS) h += '<div class="ms-verse"><div>' + esc(GS.name) + '</div>' + esc(GS.verse) + '</div>';
    h += '<div class="ms-tbl-wrap"><table class="ms-tbl"><thead><tr><th>农历月</th><th>' +
      esc(FY.name) + '败月生肖</th>' + (GS ? '<th>' + esc(GS.name) + '败月生肖</th>' : '') + '</tr></thead><tbody>';
    for (var m = 1; m <= 12; m++) {
      h += '<tr><td class="ms-c0">' + esc(CN_MONTH[m - 1]) + '月</td><td>' + esc(FY.byMonth[m] || '无') + '</td>' +
        (GS ? '<td>' + esc(GS.byMonth[m] || '无') + '</td>' : '') + '</tr>';
    }
    h += '</tbody></table></div>';
    $('msVersesBody').innerHTML = h;
  }
  function renderBx() {
    var BX = window.NUMBER_BAGXING, h = '';
    for (var i = 0; i < STAR_ORDER.length; i++) {
      var st = STAR_ORDER[i];
      var good = BX.groups['吉'].indexOf(st) >= 0;
      h += '<tr><td class="ms-c0">' + esc(st) + '</td><td><span class="ms-badge ' + (good ? 'ms-ok' : 'ms-warn') + '">' +
        (good ? '吉' : '凶') + '</span></td><td>' + esc(BX.pairs[st].join('、')) + '</td><td>' +
        esc(BX.verdicts[st] || '无') + '</td></tr>';
    }
    $('msBxBody').innerHTML = h;
  }

  /* ===== 8. AI 上下文 ===== */
  function msAiContext() {
    var of = openFolds();
    var name = of.length ? of.map(function (f) { return f.name; }).join('、') : '无（四框皆收起）';
    var s = '【民俗占法页】当前展开：' + name + '。四模块均属民俗文化范畴，仅供文化了解，不作任何吉凶承诺。\n';
    if (LAST.chengu) {
      var c1 = LAST.chengu;
      s += '称骨：农历 ' + c1.y + ' 年' + (c1.leap ? '闰' : '') + CN_MONTH[c1.mo - 1] + '月' + CN_DAYS[c1.d - 1] +
        '（公历 ' + c1.dateStr + '），' + (c1.sex === 'm' ? '男卷' : '女卷') + '，总骨重 ' + c1.liang +
        '（' + c1.total + ' 钱）' + (c1.hasHour ? '' : '，时辰未知按年月日估算') +
        '，歌诀档位 ' + c1.key + '。分等：' + c1.verdict + '。\n';
    }
    if (LAST.fanyue) {
      var c2 = LAST.fanyue;
      s += '犯月：' + c2.dateStr + ' 生，生肖' + c2.sheng + '，农历生月 ' + (c2.isLeap ? '闰' : '') + CN_MONTH[c2.mNum - 1] +
        '月，胎元 ' + c2.taiGz + '（胎月 ' + (c2.taiM ? CN_MONTH[c2.taiM - 1] + '月' : '无') + '）。' +
        '败子歌明犯：' + (c2.ming ? '是' : '否') + '，暗犯：' + (c2.an ? '是' : '否') +
        '，骨髓破：' + (c2.gs ? '是' : '否') + (c2.hasHour ? '' : '（未知时辰，时柱未判）') + '。\n';
    }
    if (LAST.buddha) {
      s += '本命佛：' + LAST.buddha.zhi + '支（' + LAST.buddha.animal + '），' + LAST.buddha.name + '，真言与心咒两系并列。\n';
    }
    if (LAST.num) {
      s += '号码：取位 ' + LAST.num.taken + '，八十一数理 ' + LAST.num.m + '（' + LAST.num.luck + '，五行 ' + LAST.num.wx +
        '），八星配对 ' + LAST.num.seqLen + ' 组。\n';
    }
    if (LAST.sanshi) {
      var c3 = LAST.sanshi;
      s += '三世书：' + c3.dateStr + ' 生，生肖' + c3.sheng + '（' + c3.yearZhi + '支），农历' + (c3.isLeap ? '闰' : '') + CN_MONTH[c3.mNum - 1] +
        '月，日柱纳音' + c3.navin + '。前世身份 ' + c3.gong + '（' + c3.shen + '），今世财禄 ' + c3.lu + '，前世婚姻夫妇感情位 ' + c3.hy + '。\n';
    }
    s += '称骨骨重表与四柱真源自八字排盘体系，犯月胎元取同源 ec.getTaiYuan()，号码数理与姓名学八十一数理同法，三世书三表照录坊本（前世身份、今世财禄同取年支乘月，前世婚姻另取日柱纳音乘月）。';
    return s;
  }

  /* ===== 9. 共享状态（shareWait） ===== */
  function msCollect() {
    var op = openFolds(), i, r = [];
    for (i = 0; i < op.length; i++) r.push(op[i].k);
    return {
      open: r,
      cnMode: $('msCnMode').value, solarDate: $('msSolarDate').value,
      cnYear: $('msCnYear').value, cnMonth: $('msCnMonth').value, cnLeap: $('msCnLeap').value,
      cnDay: $('msCnDay').value, cnSex: $('msCnSex').value, cnHour: $('msCnHour').value,
      fyDate: $('msFyDate').value, fyHour: $('msFyHour').value,
      bdDate: $('msBdDate').value, bdZhi: $('msBdZhi').value,
      ssDate: $('msSsDate').value,
      num: $('msNum').value, numPart: $('msNumPart').value
    };
  }
  function msRestore(o) {
    if (!o) return;
    if (o.cnMode) { $('msCnMode').value = o.cnMode; toggleCnMode(); }
    if (o.solarDate != null) $('msSolarDate').value = o.solarDate;
    if (o.cnYear) $('msCnYear').value = o.cnYear;
    if (o.cnMonth) $('msCnMonth').value = o.cnMonth;
    if (o.cnLeap) $('msCnLeap').value = o.cnLeap;
    if (o.cnDay) $('msCnDay').value = o.cnDay;
    if (o.cnSex) $('msCnSex').value = o.cnSex;
    if (o.cnHour != null) $('msCnHour').value = o.cnHour;
    if (o.fyDate) $('msFyDate').value = o.fyDate;
    if (o.fyHour != null) $('msFyHour').value = o.fyHour;
    if (o.bdDate) $('msBdDate').value = o.bdDate;
    if (o.bdZhi != null) $('msBdZhi').value = o.bdZhi;
    if (o.ssDate) $('msSsDate').value = o.ssDate;
    if (o.num) $('msNum').value = o.num;
    if (o.numPart) $('msNumPart').value = o.numPart;
    /* 展开状态回填：四模块独立开合，按共享串记录的键重放（展开=去 collapsed） */
    if (o.open) {
      for (var i = 0; i < FOLDS.length; i++) {
        var el = $(FOLDS[i].id);
        if (el) el.classList.toggle('collapsed', o.open.indexOf(FOLDS[i].k) < 0);
      }
    }
    rerender();
  }
  function rerender() {
    renderChengu();
    renderFanyue();
    renderBuddha();
    renderSanshi();
    /* 号码无输入时不渲染，保留框内说明，避免空值报错占位 */
    if (String($('msNum').value || '').replace(/\D/g, '')) renderNum();
  }

  /* ===== 10b. 折叠模块开合与状态持久化 =====
   * 折叠模块 id 从 DOM 取（.mod[id]），新增模块自动纳入折叠与持久化，不靠硬编码名单。 */
  var MS_MOD_KEY = 'msModState';
  var msInitDone = false;
  function _allModIds() { try { return Array.from(document.querySelectorAll('.mod[id]')).map(function (e) { return e.id; }); } catch (e) { return FOLDS.map(function (f) { return f.id; }); } }
  function readModState() {
    try {
      var raw = null;
      try { raw = localStorage.getItem(MS_MOD_KEY); } catch (e) {}
      if (!raw) { try { raw = sessionStorage.getItem(MS_MOD_KEY); } catch (e) {} }  /* localStorage 不可用（隐私模式/被清）时回退 sessionStorage */
      var o = raw ? JSON.parse(raw) : null;
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function toggleMod(id) { var el = document.getElementById(id); if (el) el.classList.toggle('collapsed'); saveModState(); }
  function saveModState() {
    if (!msInitDone) return; /* 初始化完成前不写，避免覆盖已保存状态 */
    try {
      /* 以已存为底、只覆盖此刻在场的件：恢复折叠态本身会触发 toggle 回调本函数，不在场的件若整份重写就会被抹掉 */
      var o = readModState();
      _allModIds().forEach(function (id) { var e = document.getElementById(id); if (e) o[id] = e.classList.contains('collapsed'); });
      /* 页内参考折叠块的 open 状态一并持久化（须带 id 方可定位） */
      try {
        var zr = (o._zr && typeof o._zr === 'object') ? o._zr : {};
        document.querySelectorAll('details[id]').forEach(function (d) { zr[d.id] = d.open; });
        if (Object.keys(zr).length) o._zr = zr;
      } catch (e) {}
      var v = JSON.stringify(o);
      try { localStorage.setItem(MS_MOD_KEY, v); } catch (e) {}   /* 普通模式持久化 */
      try { sessionStorage.setItem(MS_MOD_KEY, v); } catch (e) {} /* 隐私/无痕模式兜底：同一会话 F5 刷新时 sessionStorage 一定保留 */
    } catch (e) {}
  }
  function applyModState() {
    var o = readModState();
    try {
      _allModIds().forEach(function (id) {
        var e = document.getElementById(id); if (!e) return;
        if (o[id] === true) e.classList.add('collapsed');
        else if (o[id] === false) e.classList.remove('collapsed');
      });
      /* 恢复内部折叠块 open 状态（须在模块展开后执行，DOM 已就绪） */
      if (o._zr && typeof o._zr === 'object') {
        try { document.querySelectorAll('details[id]').forEach(function (d) { if (d.id in o._zr) d.open = !!o._zr[d.id]; }); } catch (e) {}
      }
    } catch (e) {}
  }
  /* 页内参考折叠块展开/收起即保存：toggle 事件不冒泡，用捕获阶段监听 */
  try { document.addEventListener('toggle', function (e) { if (e.target && e.target.tagName === 'DETAILS' && e.target.id) saveModState(); }, true); } catch (e) {}

  /* ===== 10. 初始化 ===== */
  /* 输入方式切换：公历模式只显公历日期框，农历模式只显农历年月闰日四项；性别与时辰两模式共用 */
  function toggleCnMode() {
    var solar = $('msCnMode').value === 'solar';
    $('msFSolar').style.display = solar ? '' : 'none';
    $('msFCnY').style.display = solar ? 'none' : '';
    $('msFCnM').style.display = solar ? 'none' : '';
    $('msFCnLeap').style.display = solar ? 'none' : '';
    $('msFCnD').style.display = solar ? 'none' : '';
    $('msCnHourLabel').textContent = solar ? '时辰' : '出生时间';
  }
  function fillSelects() {
    var mSel = $('msCnMonth'), dSel = $('msCnDay'), i, o;
    for (i = 1; i <= 12; i++) {
      o = document.createElement('option');
      o.value = String(i);
      o.textContent = CN_MONTH[i - 1] + '月';
      mSel.appendChild(o);
    }
    for (i = 1; i <= 30; i++) {
      o = document.createElement('option');
      o.value = String(i);
      o.textContent = CN_DAYS[i - 1];
      dSel.appendChild(o);
    }
  }
  /* 默认今天：称骨公历模式填今天公历、农历字段同步填今天农历（切换即有值），犯月与本命佛按今天公历填入 */
  function fillToday() {
    try {
      var sol = Solar.fromYmd(+todayStr().slice(0, 4), +todayStr().slice(5, 7), +todayStr().slice(8, 10));
      var ln = sol.getLunar();
      $('msCnYear').value = String(ln.getYear());
      $('msCnLeap').value = ln.getMonth() < 0 ? '1' : '0';
      $('msCnMonth').value = String(Math.abs(ln.getMonth()));
      $('msCnDay').value = String(ln.getDay());
    } catch (e) { /* 预填失败不阻断 */ }
    $('msSolarDate').value = todayStr();
    $('msFyDate').value = todayStr();
    $('msBdDate').value = todayStr();
    $('msSsDate').value = todayStr();
  }

  function init() {
    fillSelects();
    renderName81();
    renderSongs();
    renderVerses();
    renderBx();
    renderSanshiTables();
    $('msChenguBtn').addEventListener('click', renderChengu);
    $('msCnMode').addEventListener('change', toggleCnMode);
    $('msFanyueBtn').addEventListener('click', renderFanyue);
    $('msBuddhaBtn').addEventListener('click', renderBuddha);
    $('msNumBtn').addEventListener('click', renderNum);
    $('msSanshiBtn').addEventListener('click', renderSanshi);
    fillToday();
    /* 三框有日期预填，加载即出结果；号码无输入不渲染，保留框内说明 */
    renderChengu();
    renderFanyue();
    renderBuddha();
    renderSanshi();
    if (window.mountAI) window.mountAI(msAiContext, '民俗占法');
    if (window.shareWait) window.shareWait({
      page: 'minsu', title: '民俗占法',
      collect: msCollect, restore: msRestore, recast: rerender
    });
    /* 渲染完成：打标后折叠状态才允许写回，并恢复已存折叠偏好 */
    msInitDone = true;
    applyModState();
  }

  /* 内联 onclick 走全局作用域：本文件为 IIFE，须显式挂到 window，
     覆盖 bazi-app.js（本页也加载）注册的同名全局（其绑定 BAZI_MOD_KEY，键位与本页不同） */
  window.toggleMod = toggleMod;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
