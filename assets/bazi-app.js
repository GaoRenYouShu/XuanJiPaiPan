/* ============================================================
 * bazi-app.js  八字排盘交互、装配入口与对外数据接口
 *
 * 对外暴露 window.BaziAPI（UMD 门面），供第三方以纯数据方式调用，
 * 返回结构化 JSON，不含任何 HTML 与 DOM 操作。
 * ============================================================ */



/* ===================== 对外数据接口（门面层） ===================== */
/* ============================================================
 * 八字排盘对外数据接口（门面层）
 *
 * 定位：把站内既有引擎（bazi-data.js 的 baziAnalysis、pillarShaMerged、baziDaYunSteps 等，
 *       xuanji-lib.js 的 getAnalysis、pillarScoreParts）封装为一个稳定的纯数据接口，
 *       供第三方以 lunar.js 的方式直接调用，返回结构化 JSON，不含任何 HTML 与 DOM 操作。
 *
 * 纪律：本模块只做“取参、装配、整理输出”，一律复用既有引擎函数，
 *       不重新推导任何命理算法，避免与页面结论产生分叉。
 *       四柱装配的唯一真源：站内 paipan()/paipanPillar() 与本对外接口共用 buildBaziState()，
 *       装配逻辑仅此一份，站内与对外两份不并存。
 *
 * 双向复用：站点自身 bazi.html 也加载本文件，paipan()/paipanPillar() 通过 buildBaziState()
 *       委托本模块完成四柱 BZ/CTX/cols 装配（单一真源）。
 *
 * 依赖（同作用域全局，与站内脚本一致的加载方式）：
 *   lunar.js      Solar
 *   app.js        GAN_WX、ZHI_WX
 *   bazi-data.js  adjustZiShi、trueSolarTime、wuShuDun、HIDE、GAN、ZHI_ORDER、tenGod、
 *                 nayinOf、getChangSheng、kongWang、pillarSha、pillarShaMerged、baziDaYunSteps
 *   xuanji-lib.js   getAnalysis、pillarScoreParts、YUN_W_DAYUN、YUN_W_SUB
 * ============================================================ */

var BAZI_API_VERSION = '1.0.0';

/* 空亡解析（_apiKongOf 与 bazi-core.js 的 kongOf 同为 kongWang 的薄封装，口径一致）：
 *   year=取年柱旬空（十大空亡）；day=取该柱自身旬空（六甲空亡，默认）。
 *   供 buildBaziState / getBazi 的 kongAxis 入参使用，保证站点（渲染期 kongOf）与对外输出口径一致。
 *   yearGZRef 为年柱干支（date 模式为数组如 ['庚','午']，pillar 模式为字符串如 '庚午'），kongWang 二者皆可接受。 */
function _apiKongOf(gz, kongAxis, yearGZRef) {
  var ref = (kongAxis === 'year' && yearGZRef) ? yearGZRef : gz;
  return kongWang(ref);
}

/* ---------- 内部：四柱装配（站点 paipan() 委托本函数） ---------- */
function _apiBuildFromDate(input) {
  var sex = input.sex == null ? 1 : Number(input.sex);
  var ziMode = input.ziMode || 'late';
  var useTrue = !!input.useTrue;
  var lng = input.lng == null ? 120 : Number(input.lng);
  var kongAxis = input.kongAxis || 'day';

  var dp = String(input.date).split('-').map(Number);
  var y = dp[0], m = dp[1], d = dp[2];
  var tp = String(input.time || '12:00').split(':').map(Number);
  var h = tp[0], mi = tp[1];

  /* 顺序关键：先按标准时间解决子时日界，再叠加真太阳时校正，与页面一致 */
  var adj, tsInfo = null;
  var ziPre = adjustZiShi(y, m, d, h, mi, ziMode);
  if (useTrue) {
    tsInfo = trueSolarTime(ziPre.y, ziPre.m, ziPre.d, ziPre.h, ziPre.mi, lng);
    adj = { y: tsInfo.y, m: tsInfo.m, d: tsInfo.d, h: tsInfo.h, mi: tsInfo.mi };
  } else {
    adj = ziPre;
  }
  var ziNote = ziPre.note || '';
  /* 真太阳时校正后跨日界：提示日柱归向 */
  if (tsInfo) {
    var _dd = Math.round((Date.UTC(tsInfo.y, tsInfo.m - 1, tsInfo.d) - Date.UTC(y, m - 1, d)) / 86400000);
    if (_dd !== 0) ziNote = (ziMode === 'late' ? '晚子时' : '早子时') + '：真太阳时校正后日柱归' + (_dd > 0 ? '次' : '前') + '日（子时）';
  }
  /* 真太阳时校正后重判子时归属：校正可能把时刻推出/推回子时窗口（23:00–01:00），
     此时按校正后时刻重走一次日界，并提示口径；仅在原判为子时而校正后脱离子时、
     或原判非子时而校正后落入子时这两种边界生效，其余场景口径不变。 */
  var _inZi = function (hh) { return hh === 23 || hh === 0; };
  if (tsInfo && _inZi(ziPre.h) !== _inZi(adj.h)) {
    var _re = adjustZiShi(adj.y, adj.m, adj.d, adj.h, adj.mi, ziMode);
    adj = { y: _re.y, m: _re.m, d: _re.d, h: _re.h, mi: _re.mi };
    ziNote = (ziMode === 'late' ? '晚子时' : '早子时') + '：真太阳时校正后时刻脱离或进入子时，已按校正后时刻重判日界，'
      + (adj.h === 23 || adj.h === 0 ? '时刻仍在子时内' : '时刻已不在子时');
  }

  var solar = Solar.fromYmdHms(adj.y, adj.m, adj.d, adj.h, adj.mi, 0);
  var lunar = solar.getLunar();
  var ec = lunar.getEightChar();
  var dayGan = ec.getDayGan();
  var yearGZ = ec.getYear(), monthGZ = ec.getMonth(), dayGZ = ec.getDay(), timeGZ = ec.getTime();
  var yearZ = yearGZ[1], monthZ = monthGZ[1], dayZ = dayGZ[1], timeZ = timeGZ[1];
  var yearGZfull = yearGZ[0] + yearGZ[1];

  /* 早子时 23 点：时柱按当日日干遁 */
  var timeOverride = null;
  if (ziMode === 'early' && adj.h === 23) {
    var tg = wuShuDun(dayGan, 0), tHide = HIDE['子'];
    timeOverride = {
      gz: tg, g: tg[0], z: '子', hide: tHide,
      ssz: tHide.map(function (x) { return tenGod(dayGan, x); }),
      ssg: tenGod(dayGan, tg[0]), ny: nayinOf(tg),
      di: getChangSheng(dayGan, '子'), di2: getChangSheng(tg[0], '子'),
      kong: _apiKongOf(tg, kongAxis, yearGZ)
    };
  }
  var _tStem = timeOverride ? timeOverride.gz[0] : timeGZ[0];
  var CTX = { dayGan: dayGan, monthGan: monthGZ[0], yearZ: yearZ, monthZ: monthZ, dayZ: dayZ,
    gans: [yearGZ[0], monthGZ[0], dayGZ[0], _tStem], sex: sex };

  function mkCol(lbl, gz, hide, ssz, ssg, ny, di, di2, kong, z, flags) {
    flags = flags || {};
    return { lbl: lbl, gz: gz, g: gz[0], z: z, hide: hide, ssz: ssz, ssg: ssg, ny: ny,
      di: di, di2: di2, kong: kong, flags: flags,
      sha: pillarShaMerged({ gz: gz, z: z, isDay: !!flags.isDay, isMonth: !!flags.isMonth,
        isYear: !!flags.isYear, isTime: !!flags.isTime, gan: gz[0] }, CTX) };
  }
  var cols = [
    mkCol('年柱', yearGZ, ec.getYearHideGan(), ec.getYearShiShenZhi(), ec.getYearShiShenGan(), ec.getYearNaYin(), ec.getYearDiShi(), getChangSheng(yearGZ[0], yearZ), _apiKongOf(yearGZ, kongAxis, yearGZ), yearZ, { isYear: true }),
    mkCol('月柱', monthGZ, ec.getMonthHideGan(), ec.getMonthShiShenZhi(), ec.getMonthShiShenGan(), ec.getMonthNaYin(), ec.getMonthDiShi(), getChangSheng(monthGZ[0], monthZ), _apiKongOf(monthGZ, kongAxis, yearGZ), monthZ, { isMonth: true }),
    mkCol('日柱', dayGZ, ec.getDayHideGan(), ec.getDayShiShenZhi(), '日主', ec.getDayNaYin(), ec.getDayDiShi(), getChangSheng(dayGZ[0], dayZ), _apiKongOf(dayGZ, kongAxis, yearGZ), dayZ, { isDay: true })
  ];
  if (timeOverride) {
    cols.push({ lbl: '时柱', gz: timeOverride.gz, g: timeOverride.g, z: timeOverride.z,
      hide: timeOverride.hide, ssz: timeOverride.ssz, ssg: timeOverride.ssg, ny: timeOverride.ny,
      di: timeOverride.di, di2: timeOverride.di2, kong: timeOverride.kong, flags: { isTime: true },
      sha: pillarShaMerged({ gz: timeOverride.gz, z: timeOverride.z, isTime: true, gan: timeOverride.gz[0] }, CTX) });
  } else {
    cols.push(mkCol('时柱', timeGZ, ec.getTimeHideGan(), ec.getTimeShiShenZhi(), ec.getTimeShiShenGan(), ec.getTimeNaYin(), ec.getTimeDiShi(), getChangSheng(timeGZ[0], timeZ), _apiKongOf(timeGZ, kongAxis, yearGZ), timeZ, { isTime: true }));
  }

  var BZ = { ec: ec, sex: sex, dayGan: dayGan, monthGan: monthGZ[0], yearGan: yearGZ[0],
    yearZ: yearZ, monthZ: monthZ, dayZ: dayZ, timeZ: timeZ,
    gans: [yearGZ[0], monthGZ[0], dayGZ[0], cols[3].g],
    zhis: [yearZ, monthZ, dayZ, cols[3].z],
    birthYear: lunar.getSolar().getYear(), birthMonth: lunar.getSolar().getMonth(), birthDay: lunar.getSolar().getDay(), day: lunar.getSolar().getDay(),
    lunar: lunar, /* 挂农历对象：供称骨日柱骨重按农历日号查表（称骨歌日表为农历日序初一~三十），与四柱模式 BZ.lunar 语义一致 */
    dys: null, dyGZ: null, lnGZ: null, lmGZ: null, lrGZ: null, curDy: null };
  BZ.shaYear = cols[0].sha; BZ.shaMonth = cols[1].sha; BZ.shaDay = cols[2].sha; BZ.shaTime = cols[3].sha;

  return { mode: 'date', BZ: BZ, CTX: CTX, cols: cols, lunar: lunar, solar: solar,
    ec: ec, tsInfo: tsInfo, ziNote: ziNote, ziMode: ziMode, useTrue: useTrue, lng: lng,
    rawSolar: { y: y, m: m, d: d, h: h, mi: mi }, yearGZ: yearGZ };
}

/* ---------- 内部：四柱直接输入装配（站点 paipanPillar() 委托本函数） ---------- */
function _apiBuildFromPillars(input) {
  var sex = input.sex == null ? 1 : Number(input.sex);
  var ps = input.pillars;
  if (!ps || ps.length < 4) throw new Error('pillars 需为四柱干支数组，例如 ["庚午","辛巳","庚辰","癸未"]');
  var yg = ps[0][0], yz = ps[0][1], mg = ps[1][0], mz = ps[1][1];
  var dg = ps[2][0], dz = ps[2][1], tg = ps[3][0], tz = ps[3][1];
  var kongAxis = input.kongAxis || 'day';
  var yearGZRef = yg + yz;
  var dayGan = dg;
  var CTX = { dayGan: dayGan, monthGan: mg, yearZ: yz, monthZ: mz, dayZ: dz,
    gans: [yg, mg, dg, tg], sex: sex };

  function mkColP(lbl, g, z, flags) {
    flags = flags || {};
    var hide = HIDE[z] || [];
    return { lbl: lbl, gz: g + z, g: g, z: z, hide: hide,
      ssz: hide.map(function (x) { return tenGod(dayGan, x); }),
      ssg: flags.isDay ? '日主' : tenGod(dayGan, g),
      ny: nayinOf(g + z), di: getChangSheng(dayGan, z), di2: getChangSheng(g, z),
      kong: _apiKongOf(g + z, kongAxis, yearGZRef), flags: flags,
      sha: pillarShaMerged({ gz: g + z, z: z, isDay: !!flags.isDay, isMonth: !!flags.isMonth,
        isYear: !!flags.isYear, isTime: !!flags.isTime, gan: g }, CTX) };
  }
  var cols = [
    mkColP('年柱', yg, yz, { isYear: true }),
    mkColP('月柱', mg, mz, { isMonth: true }),
    mkColP('日柱', dg, dz, { isDay: true }),
    mkColP('时柱', tg, tz, { isTime: true })
  ];
  var BZ = { ec: null, sex: sex, dayGan: dayGan, monthGan: mg, yearGan: yg,
    yearZ: yz, monthZ: mz, dayZ: dz, timeZ: tz,
    gans: [yg, mg, dg, tg], zhis: [yz, mz, dz, tz],
    birthYear: null, birthMonth: null, birthDay: null, day: null, dys: null, dyGZ: null, lnGZ: null, lmGZ: null, lrGZ: null, curDy: null };
  BZ.shaYear = cols[0].sha; BZ.shaMonth = cols[1].sha; BZ.shaDay = cols[2].sha; BZ.shaTime = cols[3].sha;

  return { mode: 'pillar', BZ: BZ, CTX: CTX, cols: cols, lunar: null, solar: null,
    ec: null, tsInfo: null, ziNote: '', ziMode: null, useTrue: false, lng: null, rawSolar: null,
    yearGZ: yearGZRef };
}

/* ---------- 装配门面：返回渲染管线所需的原始状态（BZ/CTX/cols 等） ----------
 * 站点 bazi.html 的 paipan()/paipanPillar() 直接调用本函数，与对外 getBazi 共用同一装配逻辑（单一真源）。
 * 返回字段：{ mode, BZ, CTX, cols, lunar, solar, ec, tsInfo, ziNote, ziMode, useTrue, lng, rawSolar, yearGZ }
 *   yearGZ：date 模式为数组 ['庚','午']，pillar 模式为字符串 '庚午'（供调用方写入 yearGZcur 供 kongOf 使用）。 */
function buildBaziState(input) {
  input = input || {};
  return input.pillars ? _apiBuildFromPillars(input) : _apiBuildFromDate(input);
}

/* 内部：流年评分（评分原语与权重取自 xuanji-lib.js 的 pillarScoreParts 与 YUN_W_DAYUN/YUN_W_SUB，
 *   与页面一生运势曲线同口径；本函数仅遍历年份、组装对外 JSON 并做兜底守卫） */
function _apiLiuNian(BZ, An, dySteps, fromYear, toYear) {
  var out = [];
  if (!BZ.birthYear || !dySteps || !dySteps.length) return out;
  var w1 = (typeof YUN_W_DAYUN !== 'undefined') ? YUN_W_DAYUN : 0.55;
  var w2 = (typeof YUN_W_SUB !== 'undefined') ? YUN_W_SUB : 0.45;
  var real = dySteps.filter(function (s) { return s.gz && !s.empty; });
  for (var yy = fromYear; yy <= toYear; yy++) {
    var st = null;
    for (var i = 0; i < real.length; i++) {
      if (real[i].year && yy >= real[i].year && yy < real[i].year + 10) { st = real[i]; break; }
    }
    var idx = ((yy - 4) % 60 + 60) % 60;
    var lnGZ = GAN[idx % 10] + ZHI_ORDER[idx % 12];
    var dyP = st ? pillarScoreParts(st.gz, An) : null;
    var lnP = pillarScoreParts(lnGZ, An);
    var dyScore = dyP ? dyP.full : 50;
    out.push({
      year: yy, age: yy - BZ.birthYear + 1,
      daYunGanZhi: st ? st.gz : null, liuNianGanZhi: lnGZ,
      daYunScore: dyScore, liuNianScore: lnP.full,
      score: Math.round(dyScore * w1 + lnP.full * w2),
      daYunReason: dyP ? dyP.parts.join(' ') : '', liuNianReason: lnP.parts.join(' ')
    });
  }
  return out;
}

/* ---------- 对外主接口 ---------- */
/**
 * 排盘并返回结构化数据。
 * @param {Object} input
 *   日期模式：{ date:'1990-05-15', time:'14:30', sex:1, ziMode:'late', useTrue:false, lng:120, kongAxis:'day' }
 *     date   公历生日，必填，格式 YYYY-MM-DD
 *     time   出生时间，默认 12:00
 *     sex    1 男、0 女，默认 1
 *     ziMode 子时口径，late 晚子时（默认）、early 早子时
 *     useTrue 是否启用真太阳时校正，默认 false
 *     lng    出生地经度，启用真太阳时校正时使用，默认 120
 *     kongAxis 空亡基准轴，day=日柱六甲空亡（默认）、year=年柱十大空亡
 *   四柱模式：{ pillars:['庚午','辛巳','庚辰','癸未'], sex:1, kongAxis:'day' }
 *     无出生日期，故不返回大运与流年
 *   通用可选：{ liuNianFrom:2024, liuNianTo:2033 } 指定流年评分区间，默认当年起十年
 * @returns {Object} 结构化排盘结果
 */
function getBazi(input) {
  input = input || {};
  var built = buildBaziState(input);
  var BZ = built.BZ, cols = built.cols;
  var An = getAnalysis(BZ);

  var pillars = cols.map(function (c) {
    return {
      label: c.lbl, ganZhi: c.gz, gan: c.g, zhi: c.z,
      ganWuXing: GAN_WX[c.g] || '', zhiWuXing: ZHI_WX[c.z] || '',
      hideGan: c.hide || [], tenGodGan: c.ssg, tenGodZhi: c.ssz || [],
      naYin: c.ny, diShi: c.di, changSheng: c.di2, kongWang: c.kong || [],
      shenSha: c.sha || []
    };
  });

  var out = {
    version: BAZI_API_VERSION,
    mode: built.mode,
    input: {
      date: input.date || null, time: input.time || null, sex: BZ.sex,
      ziMode: built.ziMode, useTrue: built.useTrue, lng: built.lng,
      kongAxis: input.kongAxis || 'day',
      pillars: input.pillars || null
    },
    pillars: pillars,
    dayMaster: { gan: BZ.dayGan, wuXing: GAN_WX[BZ.dayGan] || '' },
    wuXing: { count: An.cnt || {} },
    strength: {
      level: An.strength, score: An.score, rule: An.strengthRule,
      note: An.strengthNote || '',
      detail: { deLing: An.subLing, deDi: An.subDi, deShi: An.subShi },
      basis: An.scoreBasis || []
    },
    yongShen: { xi: An.xiWx || [], ji: An.jiWx || [] },
    geJu: {
      name: An.geName || '', gan: An.geGan || '', use: An.geUse || '',
      level: An.geLevel || '', qing: An.geQing || '',
      outer: An.geOuter || '', sha: An.geSha || ''
    },
    diseaseAndCure: { bingYao: An.bingYao || '', structDisease: An.structDisease || '' },
    tiaoHou: An.tiao || null,
    synthesis: An.synthesis || '',
    daYun: null,
    liuNian: []
  };

  if (built.mode === 'date') {
    out.solar = { year: built.solar.getYear(), month: built.solar.getMonth(), day: built.solar.getDay(),
      hour: built.solar.getHour(), minute: built.solar.getMinute() };
    out.lunar = {
      year: built.lunar.getYear(), month: built.lunar.getMonth(), day: built.lunar.getDay(),
      yearInChinese: built.lunar.getYearInChinese(), monthInChinese: built.lunar.getMonthInChinese(),
      dayInChinese: built.lunar.getDayInChinese(),
      prevJieQi: built.lunar.getPrevJieQi() ? built.lunar.getPrevJieQi().getName() : '',
      nextJieQi: built.lunar.getNextJieQi() ? built.lunar.getNextJieQi().getName() : ''
    };
    out.adjust = {
      ziMode: built.ziMode, ziNote: built.ziNote,
      trueSolar: built.tsInfo ? { equationOfTime: built.tsInfo.E, longitudeAdjust: built.tsInfo.lngAdj,
        totalAdjustMinutes: built.tsInfo.totalAdj } : null,
      rawInput: built.rawSolar
    };

    var dy = baziDaYunSteps(BZ);
    if (dy && dy.steps) {
      out.daYun = {
        startAge: dy.start.age, startMonth: dy.start.month, startSolar: dy.start.solar,
        steps: dy.steps.filter(function (s) { return s.gz && !s.empty; }).map(function (s) {
          var p = pillarScoreParts(s.gz, An);
          return { ganZhi: s.gz, gan: s.gz[0], zhi: s.gz[1], age: s.age, year: s.year,
            tenGodGan: tenGod(BZ.dayGan, s.gz[0]), naYin: nayinOf(s.gz), score: p.full };
        })
      };
      var nowY = new Date().getFullYear();
      var from = input.liuNianFrom || nowY;
      var to = input.liuNianTo || (from + 9);
      out.liuNian = _apiLiuNian(BZ, An, dy.steps, from, to);
    }
  }
  return out;
}

/* 浏览器环境兜底挂载，保持与站内其他脚本一致的全局调用方式；
   buildBaziState 供站点 paipan()/paipanPillar() 复用本文件装配逻辑。 */
if (typeof window !== 'undefined') {
  window.getBazi = getBazi;
  window.buildBaziState = buildBaziState;
  window.BAZI_API_VERSION = BAZI_API_VERSION;
}



/* ===================== 页面交互与装配 ===================== */
/* 入口 paipan / paipanPillar / 模块折叠状态 / 事件 / 初始化，最后加载。 */
/* 页面交互初始化仅八字页执行（以 bMode 表单为标志）：他页（如姓名学页）只复用
   buildBaziState/getAnalysis/getBazi 排盘 API 直算喜用，不挂载本页 UI 与导航 */
var BAZI_PAGE_UI = !!document.getElementById('bMode');
if (BAZI_PAGE_UI) renderChrome('bazi.html'); /* 页面级单例，见顶部“页面级可变状态说明” */
if (BAZI_PAGE_UI) (function initBirth(){
  const sp=document.getElementById('bProv'), sc=document.getElementById('bCity'), sd=document.getElementById('bDist');
  sp.innerHTML=provList().map(p=>`<option value="${p}">${p}</option>`).join('');
  function fillCity(){ const p=sp.value; if(!PROV[p])return; sc.innerHTML=PROV[p].map(c=>`<option value="${c.c}">${c.c}</option>`).join(''); fillDist(); }
  function fillDist(){
    const p=sp.value; if(!PROV[p])return;
    const c=PROV[p].find(x=>x.c===sc.value)||PROV[p][0];
    if(!c) return;
    // 城市级经度兜底：city.lng 为 null（直辖市等）时回退省级中心经度，杜绝 null°E
    const pc=(typeof provCenter==='function'&&c.lng==null)?provCenter(p):null;
    CITY_LNG=(c.lng!=null)?c.lng:(pc?pc.lng:null);
    let html=`<option value="">${c.c}</option>`;
    distList(p, c.c).forEach(k=> html+=`<option value="${k}">${k}</option>`);
    sd.innerHTML=html;
  }
  sp.onchange=()=>{ fillCity(); savePillarSel(); }; sc.onchange=()=>{ fillDist(); savePillarSel(); };
  sp.value='北京市'; fillCity();
})();

function paipan(){
  /* 性能守卫：输入签名未变且已渲染过，则跳过全量重排（避免重复计算与重绘）。
     切换输入方式（bMode）会纳入签名，故模式切换仍会正常重排。 */
  { const sig=paipanSig(); if(sig===lastPaipanSig && BZ && document.getElementById('out').innerHTML){ return; } lastPaipanSig=sig; }
  if(document.getElementById('bMode').value==='pillar'){ paipanPillar(); return; }
  clearFormErr();
  /* 输入源：公历直接取 bDate；农历按 年/月（闰月勾选取闰）/日 转公历后统一走公历排盘链 */
  const mode=document.getElementById('bMode').value;
  let dv;
  if(mode==='lunar'){
    const ly=parseInt(document.getElementById('bLunarY').value,10);
    const lm=parseInt(document.getElementById('bLunarM').value,10);
    const ld=parseInt(document.getElementById('bLunarD').value,10);
    const leap=document.getElementById('bLunarLeap').checked;
    if(!ly||!lm||!ld){ showFormErr('请完整填写农历年、月、日'); return; }
    if(ly<1900||ly>2100){ showFormErr('农历年范围 1900–2100'); return; }
    if(leap){
      let lm0=0; try{ lm0=LunarYear.fromYear(ly).getLeapMonth(); }catch(e){ lm0=0; }
      if(lm0!==lm){ showFormErr('该农历年没有闰'+lm+'月'+(lm0?('（本年闰月为闰'+lm0+'月）'):'') ); return; }
    }
    let lun;
    try{ lun=Lunar.fromYmd(ly, leap? -lm : lm, ld); }
    catch(e){ showFormErr((e&&e.message)||'农历日期无效（该月可能不足 '+ld+' 天）'); return; }
    const s=lun.getSolar();
    dv=String(s.getYear()).padStart(4,'0')+'-'+String(s.getMonth()).padStart(2,'0')+'-'+String(s.getDay()).padStart(2,'0');
  } else {
    dv=document.getElementById('bDate').value;
  }
  if(!dv){ showFormErr('请选择出生日期'); return; }
  /* 时辰显式校验：空白/越界一律报错，不再静默默认 12:00。 */
  const tvRaw=document.getElementById('bTime').value;
  if(!tvRaw){ showFormErr('请选择出生时辰'); return; }
  const tvParts=String(tvRaw).split(':');
  const tvHH=parseInt(tvParts[0],10), tvMM=parseInt(tvParts[1]||'0',10);
  if(isNaN(tvHH)||isNaN(tvMM)||tvHH<0||tvHH>23||tvMM<0||tvMM>59){ showFormErr('出生时辰超出范围（应为 00:00–23:59）'); return; }
  const tv=String(tvHH).padStart(2,'0')+':'+String(tvMM).padStart(2,'0');
  const sex=parseInt(document.getElementById('bSex').value);
  const ziMode=document.getElementById('bZi').value;
  const useTrue=document.getElementById('bTrue').checked;
  kongAxis=document.getElementById('bKong').value; /* 空亡基准轴：day=日柱六甲空亡 / year=年柱十大空亡（写回全局，供 updateDetail 的 kongOf 使用） */
  const manualLng=document.getElementById('bLng').value;
  let [y,m,d]=dv.split('-').map(Number);
  let [h,mi]=tv.split(':').map(Number);

  const distName=document.getElementById('bDist').value;
  let lng;
  if(manualLng!=='') lng=parseFloat(manualLng);
  else if(distName!==''){ lng=findLng(document.getElementById('bProv').value, document.getElementById('bCity').value, distName); }
  else lng=CITY_LNG;
  if(lng==null||isNaN(lng)) lng=CITY_LNG;

  /* 装配委托 buildBaziState（与第三方 getBazi 同源，单一真源，避免双份装配逻辑）。
     渲染期 kongOf 仍读全局 kongAxis / yearGZcur，此处继续写这两个全局，
     保证四柱表(col.kong) 与干支详情(kongOf) 两套空亡口径一致可切换。 */
  const built = buildBaziState({ date: dv, time: tv, sex, ziMode, useTrue, lng, kongAxis });
  BZ = built.BZ;
  CTX = built.CTX;
  /* 挂农历对象（表法定配偶方位用；本接口返回里恒有）。
     夜子时/真太阳时跨日后 lunar 会指向次日，表法须按出生当天农历查 → 不同日时回退前一天。 */
  { const _ls=built.lunar.getSolar(), _rs=built.rawSolar;
    BZ.lunar = (_ls.getYear()===_rs.y&&_ls.getMonth()===_rs.m&&_ls.getDay()===_rs.d) ? built.lunar : built.lunar.next(-1); }
  yearGZcur = built.yearGZ; // date 模式为数组 ['庚','午']，与原 yearGZcur 一致

  const rs = built.rawSolar;
  const R={ mode:'date', y:rs.y, m:rs.m, d:rs.d, h:rs.h, mi:rs.mi, lng, useTrue,
            tsInfo:built.tsInfo, ziNote:built.ziNote, lunar:built.lunar,
            pj:built.lunar.getPrevJieQi(), nj:built.lunar.getNextJieQi(),
            sex, dayGan:built.BZ.dayGan, cols:built.cols, ec:built.ec };
  const html=renderBaziPage(R, BZ);
  document.getElementById('out').innerHTML=html;
  renderDyn(BZ);
  drawYunChart(BZ);
  const foot=document.createElement('div');
  foot.className='notice notice-bottom';
  foot.innerHTML='以上为依格局、五行、十神、神煞及大运流年流月流日的常规推演，各派结论可能不同，仅供文化研究与参考；健康与人生重大决定请务必咨询专业人士，切勿迷信。';
  document.getElementById('out').appendChild(foot);
  if(!baziInitDone) restoreYunSel(); /* 初始化：恢复已保存的岁运选择（大运/流年/流月/流日），在 renderDyn 默认选择之后覆盖 */
  if(baziInitDone) savePillarSel(); /* 仅页面初始化完成后才持久化，避免初始渲染覆盖已保存状态 */
  applyModState(); /* 刷新重排后读回三大模块折叠状态，避免展开被复位 */
  /* 人生议题表格化：挂到渲染生命周期内（与三大板块同一层），每次真正重排后自动重建。
     tableizeCore 由 bazi.html 内联脚本定义（加载晚于本文件），此处用 typeof 探测；
     初始加载时尚未定义则跳过，由内联脚本末尾 go() 兜底执行；性能守卫拦截时不重排，DOM 保持现状（含 mod-yiti）。 */
  if(typeof tableizeCore==='function' && !document.getElementById('proto')){ try{ tableizeCore(BZ); }catch(e){} }
  /* 首列列宽：按真实汉字渲染宽测量后 inline !important 设置（span 挂 body 探测） */
  if(typeof setupMingJuCol==='function'){
    try{
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(function(){ try{ setupMingJuCol(); }catch(e){} }).catch(function(){ try{ setupMingJuCol(); }catch(e){} });
      } else { setupMingJuCol(); }
    }catch(e){ try{ setupMingJuCol(); }catch(e2){} }
  }
  /* 响应式：窗口缩放时重测（CSS media query 自动，但 inline px 不会跟着变，必须 JS 重设） */
  if(typeof setupMingJuCol==='function' && !window._setupMingJuColBound){
    window._setupMingJuColBound = true;
    let _rT;
    window.addEventListener('resize', ()=>{ clearTimeout(_rT); _rT = setTimeout(setupMingJuCol, 150); });
  }
}

/* ============ 四柱干支输入模式 + 断事 ============ */
/* 单一显隐原语：设定某元素是否显示（show=false 则 display:none，否则还原）；全站模式切换统一走此函数 */
function gs(id, show){ const el=document.getElementById(id); if(el) el.style.display=show?'':'none'; }
function toggleBaziMode(){
  const mode=document.getElementById('bMode').value;
  const isPillar=mode==='pillar';
  const isSaved=mode==='saved';
  const isLunar=mode==='lunar';
  document.body.classList.toggle('mode-pillar',isPillar);
  document.body.classList.toggle('mode-lunar',isLunar);
  document.body.classList.toggle('mode-date',!isPillar && !isSaved && !isLunar);
  /* 出生地相关组（省/市/区、手动经度、真太阳时校正）：仅"公历/农历"输入流程需经换算校正，四柱/已存不显示 */
  /* 单一判定 isBirthSect 控制整组显隐 */
  const hasBirthSect = (mode==='date' || mode==='lunar') && !isSaved;
  const dsp=isPillar?'none':'';
  document.getElementById('fDate').style.display=(isSaved||isLunar?'none':dsp);
  document.getElementById('fTime').style.display=(isSaved?'none':dsp);
  /* 农历输入组：仅农历模式显示（公历/四柱/已存均隐藏） */
  ['fLunarY','fLunarM','fLunarLeap','fLunarD'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display=isLunar?'':'none'; });
  document.getElementById('fPillar').style.display=isPillar?'':'none';
  /* 出生地整组（省/市/区、手动经度、真太阳时校正）：仅公历/农历且非已存时显示，整组显隐即涵盖内层字段 */
  gs('birthGroup', hasBirthSect);
  document.getElementById('optsRow').style.display=isSaved?'none':''; /* 已存模式下隐藏输入行排盘按钮，改用列表内"排盘" */
  document.getElementById('bZiField').style.display=(isSaved?'none':dsp);
  /* 空亡基准下拉：仅公历/农历模式可选日柱/年柱流派；四柱/已存固定用日柱六甲空亡（子平主流），隐藏切换，空亡仍按日柱轴标注 */
  document.getElementById('bKongField').style.display=(isSaved?'none':dsp);
  const sp=document.getElementById('savedPanel'); if(sp) sp.style.display=isSaved?'':'none';
  if(isSaved){ renderSavedPanel(); }
  /* 持久化当前页面模式（独立于条目 mode，避免刷新后丢失"已存"选择） */
  try{ localStorage.setItem(PAGE_MODE_KEY, mode); }catch(e){}
  if(baziInitDone && !isSaved) savePillarSel(); /* 已存模式不持久化 PILLAR_KEY（列表独立存储）；其它模式切换持久化 mode */
  /* 四柱/已存模式清空命局输出区，避免旧 date 模式输出残留 */
  if(isPillar || isSaved){
    const _out=document.getElementById('out');
    if(_out) _out.innerHTML='';
  }
  /* 切回公历/农历且输出区为空：用当前输入自动重排，避免切换后空白需手动点"排盘"（仅在初始化完成后，防与初始自动排盘冲突） */
  if(!isPillar && !isSaved && document.getElementById('out').innerHTML==='' && baziInitDone){
    if(window.paipan) setTimeout(()=>{ try{ paipan(); }catch(e){} }, 0);
  }
  /* 已存模式下让姓名框随面板隐藏（姓名仅在输入模式下参与保存） */
  const fm=document.getElementById('fName'); if(fm) fm.style.display=isSaved?'none':'';
  /* 641-970px：农历模式强制分两排，在姓名后插入换行标记 */
  if(isLunar){
    const top=document.querySelector('.bazi-top');
    const nameEl=document.getElementById('fName');
    const lunarYEl=document.getElementById('fLunarY');
    if(top && nameEl && lunarYEl && !top.dataset.breakInjected){
      const br=document.createElement('br');
      br.style.display='none';
      top.insertBefore(br, lunarYEl);
      top.dataset.breakInjected='1';
    }
  }
}
/* 读取检索跨度（起始年、终止年，历史年可负），做合法性收口：-2697~9999，无公元 0 年，保证 start<=end */
function getPillarSpan(){
  let s=parseInt(document.getElementById('pStart').value,10);
  let e=parseInt(document.getElementById('pEnd').value,10);
  if(!isFinite(s)) s=1864; if(!isFinite(e)) e=2103;
  if(s===0) s=1; if(e===0) e=1;            // 无公元 0 年
  if(s<-2697) s=-2697; if(e>9999) e=9999; if(s>e){ const t=s; s=e; e=t; }
  return {start:s, end:e};
}
/* 朝代预设：把下拉选项写回起始、终止年输入框。
   选项值形如 "起始|终止"，用竖线分隔（不能用 -，因为负年本身带 -）。
   起始、终止年均可为负（如 "-1600|-1046" 表示前 1600 至 前 1046；"-202|-8" 表示前 202 至 前 8）。 */
function applyPillarSpan(){
  const v=document.getElementById('pSpan').value;
  const m=v.match(/^(-?\d+)\|(-?\d+)$/);
  if(m){ document.getElementById('pStart').value=m[1]; document.getElementById('pEnd').value=m[2]; }
}
/* 年柱→候选公历年：年柱 60 年一循环，在检索跨度内枚举干支年柱与目标一致的全部年份。
   干支判定统一走全局 liunianGZ（全站单一真源），histToAstro 归一化后兼容公元前。 */
function pillarCandYears(yearGZ, span){
  const out=[];
  for(let H=span.start;H<=span.end;H++){ const A=histToAstro(H); if(liunianGZ(A)===yearGZ) out.push(A); }
  return out;
}
/* 由四柱干支反推全部可能公历出生日期：年柱60年一循环，月柱（节气）与日柱（60日一循环）进一步锁定到具体日。
   检索范围由上方“检索跨度”决定，便于考据历史人物；年柱候选由 pillarCandYears 给出，兼容任意公元年份。
   注意：八字年柱、月柱以立春、节气为界，须用 EightChar.getYear()/getMonth()/getDay()；
         lunar.getYearInGanZhi()/getMonthInGanZhi() 按农历春节、月，会在立春-春节之间产生偏差。
         公元前因历法库对远古节气计算失真，改用近似节气推月、年柱仍取 lunar.getYearInGanZhi()。 */
function findPillarDates(yg,yz,mg,mz,dg,dz,tz){
  const candYears=pillarCandYears(yg+yz, getPillarSpan());
  const res=[]; const targetYZ=yg+yz, targetMZ=mg+mz, targetDZ=dg+dz;
  for(const Y of candYears){
    const start=safeTs(Y-1,12,1), end=safeTs(Y+1,3,28)+864e5, day=864e5;
    for(let t=start;t<=end;t+=day){
      const dt=new Date(t), sy=dt.getFullYear(), sm=dt.getMonth()+1, sd=dt.getDate();
      const lunar=Solar.fromYmd(sy,sm,sd).getLunar();
      let yearGZ, monthGZ, dayGZ;
      if(sy<1){
        yearGZ=lunar.getYearInGanZhi();
        dayGZ=lunar.getDayInGanZhi();
        monthGZ=approxMonthGanZhi(yearGZ[0], sm, sd);
      } else {
        const ec=lunar.getEightChar();
        yearGZ=ec.getYear();
        monthGZ=ec.getMonth();
        dayGZ=ec.getDay();
      }
      if(yearGZ===targetYZ && monthGZ===targetMZ && dayGZ===targetDZ){
        res.push(sy+'-'+String(sm).padStart(2,'0')+'-'+String(sd).padStart(2,'0'));
      }
    }
  }
  return res;
} /* 四柱模式下确认的公历出生日期（见顶部说明）；用 var 声明，paipan() 可能在函数定义前被调用，var 提升避免 TDZ */
function confirmPillarDate(d){ pillarChosenDate=d; savePillarSel(); paipan(); }
function clearPillarDate(){ pillarChosenDate=null; savePillarSel(); paipan(); }
/* 候选出生时间确认面板：列出四柱可对应的全部公历时间，供筛选确认 */
function renderConfirmPanel(yg,yz,mg,mz,dg,dz,tg,tz,cands,candYears,span){
  let h=`<div class="confirm-box"><div class="confirm-h">请确认出生时间</div>`;
  // 年干支对应历史年份说明（60年一循环）
  const shownYears=(candYears||[]).map(A=>fmtHistYear(astroToHist(A))).slice(0,12).join('、')+((candYears||[]).length>12?` …（共 ${(candYears||[]).length} 个）`:'');
  h+=`<div class="sub-note">以上为精确反查结果：该年干支 ${yg}${yz} 在检索跨度 ${fmtHistYear(span.start)} 至 ${fmtHistYear(span.end)} 内对应历史年份（60年一循环）：${shownYears}。能同时满足"${yg}${yz}年${mg}${mz}月${dg}${dz}日"三柱完全一致的公历日期仅此 ${cands.length} 条。若希望查看更多候选，可放宽上方"检索跨度"。</div>`;
  if(!cands.length){
    // 无结果时仍显示年份说明
    h+=``;
  } else {
    h+=`<table class="confirm-tb"><thead><tr><th>公历</th><th>农历</th><th>四柱</th><th></th></tr></thead><tbody>`;
    cands.forEach(dt=>{
      const p=parseAstroDate(dt);
      const solar=Solar.fromYmd(p[0],p[1],p[2]);
      const lunar=solar.getLunar();
      let yGZ,mGZ,dGZ;
      if(p[0]<1){
        yGZ=lunar.getYearInGanZhi();
        dGZ=lunar.getDayInGanZhi();
        mGZ=approxMonthGanZhi(yGZ[0], p[1], p[2]);
      } else {
        const ec=lunar.getEightChar();
        yGZ=ec.getYear(); mGZ=ec.getMonth(); dGZ=ec.getDay();
      }
      const gz=yGZ+mGZ+dGZ+tg+tz;
      h+=`<tr><td>${fmtAstroDate(dt)} ${tz}时</td><td>${lunarYearLabel(lunar,p[0])}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}</td><td>${gz}</td><td><button type="button" class="btn gold" onclick="confirmPillarDate('${dt}')">排盘</button></td></tr>`;
    });
    h+=`</tbody></table>`;
  }
  h+=`</div>`;
  return h;
}

/* 四柱干支直接排盘：用 HIDE / nayinOf / tenGod 等自算藏干十神纳音空亡神煞 */
function paipanPillar(){
  /* 性能守卫集中在 paipan()（paipan 先按签名判定是否跳过，再据 bMode 调用本函数）。
     本函数不自行判定是否已变化（避免 lastPaipanSig 写入后被误判为未变而跳过重排）。 */
  const yg=document.getElementById('pyG').value, yz=document.getElementById('pyZ').value;
  const mg=document.getElementById('pmG').value, mz=document.getElementById('pmZ').value;
  const dg=document.getElementById('pdG').value, dz=document.getElementById('pdZ').value;
  const tg=document.getElementById('ptG').value, tz=document.getElementById('ptZ').value;
  const sex=parseInt(document.getElementById('bSex').value);
  /* 空亡基准轴：四柱模式同样需从 bKong 读取（日期模式在 paipan 内读取；本函数不读会导致
     切换轴后空亡行不变，沿用上一次渲染的轴）。并同步学术取舍说明显隐。
     四柱/已存模式固定用日柱六甲空亡（隐藏了基准切换框，强制 day 轴，防残留年柱选择贯穿）。 */
  kongAxis=(document.getElementById('bMode').value==='pillar'||document.getElementById('bMode').value==='saved')?'day':document.getElementById('bKong').value;
  clearFormErr();
  if(!yg||!yz||!mg||!mz||!dg||!dz||!tg||!tz){ showFormErr('请完整填写四柱干支'); return; }
  if(!isValidGZ(yg,yz)){ showFormErr('年柱 '+yg+yz+' 不是有效的六十甲子组合，请检查。'); return; }
  if(!isValidGZ(mg,mz)){ showFormErr('月柱 '+mg+mz+' 不是有效的六十甲子组合，请检查。'); return; }
  if(!isValidGZ(dg,dz)){ showFormErr('日柱 '+dg+dz+' 不是有效的六十甲子组合，请检查。'); return; }
  if(!isValidGZ(tg,tz)){ showFormErr('时柱 '+tg+tz+' 不是有效的六十甲子组合，请检查。'); return; }
  const expMG=monthGanOf(yg,mz);
  if(expMG!==mg){ showFormErr('月柱天干应为'+expMG+'（五虎遁：'+yg+'年'+mz+'月），但填写的是'+mg+'，请检查。'); return; }
  const expTG=hourGanOf(dg,tz);
  if(expTG!==tg){ showFormErr('时柱天干应为'+expTG+'（五鼠遁：'+dg+'日'+tz+'时），但填写的是'+tg+'，请检查。'); return; }
  const span=getPillarSpan();
  const candYears=pillarCandYears(yg+yz, span);
  const dayGan=dg;
  /* 装配委托 buildBaziState（与第三方 getBazi 同源，单一真源）。
     hasDate/isBC/候选日期/年柱旬空等站点特有逻辑仍在此处理，仅四柱 BZ/CTX/cols 委托。 */
  const built = buildBaziState({ pillars:[yg+yz, mg+mz, dg+dz, tg+tz], sex, kongAxis });
  BZ = built.BZ;
  CTX = built.CTX;
  yearGZcur = built.yearGZ; // pillar 模式为字符串 '庚午'，与原 yearGZcur 一致

  let hasDate=false, lunar=null, ec=null, solarYear=null, y,m,d;
  if(pillarChosenDate){ const p=parseAstroDate(pillarChosenDate); if(p.length>=3 && !isNaN(p[0])){ y=p[0]; m=p[1]; d=p[2]; const solar=Solar.fromYmdHms(y,m,d, (TZ_HOUR[tz]!=null?TZ_HOUR[tz]:0), 0,0); lunar=solar.getLunar(); ec=lunar.getEightChar(); solarYear=solar.getYear(); BZ.ec=ec; BZ.birthYear=solarYear; hasDate=true; } }
  const isBC = hasDate && BZ.birthYear < 1;   // 公元前：大运、流年、曲线以公元后为基准无参照，且命宫、胎元、身宫、节气依赖的月柱需用近似值

  // 渲染：统一委托 renderBaziPage(R)（与日期模式共用同一渲染主体，消重）。
  const R={ mode:'pillar', cols:built.cols, sex, dayGan:built.BZ.dayGan,
    yg,yz,mg,mz,dg,dz,tg,tz, hasDate, isBC, pillarChosenDate, span, candYears,
    lunar:hasDate?lunar:null, ec:hasDate?ec:null,
    pj:hasDate?lunar.getPrevJieQi():null, nj:hasDate?lunar.getNextJieQi():null,
    y:hasDate?y:null, m:hasDate?m:null, d:hasDate?d:null };
  BZ.lunar = hasDate?lunar:null; /* 挂农历对象（表法定配偶方位用；四柱模式无日期则为 null，安全降级） */
  const html=renderBaziPage(R, BZ);
  document.getElementById('out').innerHTML=html;
  if(hasDate && !isBC){ renderDyn(BZ); drawYunChart(BZ); }
  const foot=document.createElement('div');
  foot.className='notice notice-bottom';
  foot.innerHTML='以上为依格局、五行、十神、神煞及大运流年流月流日的常规推演，各派结论可能不同，仅供文化研究与参考；健康与人生重大决定请务必咨询专业人士，切勿迷信。';
  document.getElementById('out').appendChild(foot);
  if(!baziInitDone) restoreYunSel(); /* 四柱模式同样恢复岁运选择（无 renderDyn 时按钮不存在则安全降级） */
  applyModState(); /* 刷新重排后读回三大模块折叠状态，避免展开被复位 */
  /* 人生议题表格化（四柱模式入口，同 paipan() 的钩子）：真正重排后自动重建 mod-yiti */
  if(typeof tableizeCore==='function' && !document.getElementById('proto')){ try{ tableizeCore(BZ); }catch(e){} }
  /* 首列列宽：按真实汉字渲染宽测量后 inline !important 设置（span 挂 body 探测） */
  if(typeof setupMingJuCol==='function'){
    try{
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(function(){ try{ setupMingJuCol(); }catch(e){} }).catch(function(){ try{ setupMingJuCol(); }catch(e){} });
      } else { setupMingJuCol(); }
    }catch(e){ try{ setupMingJuCol(); }catch(e2){} }
  }
  /* 响应式：窗口缩放时重测（CSS media query 自动，但 inline px 不会跟着变，必须 JS 重设） */
  if(typeof setupMingJuCol==='function' && !window._setupMingJuColBound){
    window._setupMingJuColBound = true;
    let _rT;
    window.addEventListener('resize', ()=>{ clearTimeout(_rT); _rT = setTimeout(setupMingJuCol, 150); });
  }
}
function savePillarSel(){
  const ids=['pyG','pyZ','pmG','pmZ','pdG','pdZ','ptG','ptZ'];
  const o={}; ids.forEach(id=>{ const el=document.getElementById(id); if(el) o[id]=el.value; });
  o.chosen = (typeof pillarChosenDate!=='undefined' && pillarChosenDate) ? pillarChosenDate : '';
  try{ const bm=document.getElementById('bMode'); if(bm) o.mode=bm.value; }catch(e){}
  try{ const bs=document.getElementById('bSex'); if(bs) o.sex=bs.value; }catch(e){}
  try{ const nm=document.getElementById('bName'); if(nm) o.bName=nm.value; }catch(e){}
  /* 出生日期模式输入项一并持久化 */
  try{ const d=document.getElementById('bDate'); if(d) o.bDate=d.value; }catch(e){}
  try{ const t=document.getElementById('bTime'); if(t) o.bTime=t.value; }catch(e){}
  /* 农历模式输入项一并持久化（年/月/闰月/日） */
  try{ const y=document.getElementById('bLunarY'); if(y) o.bLunarY=y.value; }catch(e){}
  try{ const m=document.getElementById('bLunarM'); if(m) o.bLunarM=m.value; }catch(e){}
  try{ const d=document.getElementById('bLunarD'); if(d) o.bLunarD=d.value; }catch(e){}
  try{ const lp=document.getElementById('bLunarLeap'); if(lp) o.bLunarLeap=lp.checked; }catch(e){}
  try{ const tr=document.getElementById('bTrue'); if(tr) o.bTrue=tr.checked; }catch(e){}
  try{ const zi=document.getElementById('bZi'); if(zi) o.bZi=zi.value; }catch(e){}
  try{ const k=document.getElementById('bKong'); if(k) o.bKong=k.value; }catch(e){}
  try{ const lng=document.getElementById('bLng'); if(lng) o.bLng=lng.value; }catch(e){}
  try{ const pv=document.getElementById('bProv'); if(pv) o.bProv=pv.value; }catch(e){}
  try{ const ct=document.getElementById('bCity'); if(ct) o.bCity=ct.value; }catch(e){}
  try{ const dt=document.getElementById('bDist'); if(dt) o.bDist=dt.value; }catch(e){}
  /* 岁运选择一并持久化：大运/流年/流月干支 + 流日公历日期，刷新后 restoreYunSel 恢复点选 */
  try{ const bz=window.BZ; if(bz){
    if(bz.dyGZ) o.dyGZ=bz.dyGZ;
    if(bz.lnGZ) o.lnGZ=bz.lnGZ;
    if(bz.lmGZ) o.lmGZ=bz.lmGZ;
    if(bz.lrDate) o.lrDate=bz.lrDate;
  } else {
    /* BZ 尚未建立（初始化期恢复出生地三级联动会 dispatch change 触发本函数）：
       沿用旧保存的岁运字段，防止用无岁运对象覆盖丢失，保证刷新后可恢复 */
    try{ const old=loadPillarSel(); if(old){
      if(old.dyGZ) o.dyGZ=old.dyGZ;
      if(old.lnGZ) o.lnGZ=old.lnGZ;
      if(old.lmGZ) o.lmGZ=old.lmGZ;
      if(old.lrDate) o.lrDate=old.lrDate;
    } }catch(e){}
  } }catch(e){}
  try{ localStorage.setItem(PILLAR_KEY, JSON.stringify(o)); }catch(e){}
}
function loadPillarSel(){
  try{ const raw=localStorage.getItem(PILLAR_KEY); if(!raw) return null; const o=JSON.parse(raw); return (o && typeof o==='object') ? o : null; }catch(e){ return null; }
}

/* ============ 已存八字（独立列表，最多 9 条，按保存先后顺序排列） ============ */
/*
 * 持久化方案：localStorage + sessionStorage 双保险
 *   - localStorage：主存储，页面刷新/重开标签页仍保留（同浏览器）
 *   - sessionStorage：会话级备份，防止 localStorage 写入失败（如配额、隐私模式部分浏览器实现）
 * 读取优先级：localStorage > sessionStorage > 空数组
 * 写入策略：同时写入两者，确保至少一处有数据
 */
const PAGE_MODE_KEY='BZI_PAGE_MODE';
const SAVED_KEY='BZI_SAVED';
const SAVED_SESS_KEY='BZI_SAVED_SESS';
const SAVED_MAX=9;

/* 从 localStorage 读取 */
function _savedFromLS(){
  try{ const raw=localStorage.getItem(SAVED_KEY); if(!raw) return null; const a=JSON.parse(raw); return (Array.isArray(a))?a:null; }catch(e){ console.error('[BZI] LS GET ERROR', e.message); return null; }
}
/* 从 sessionStorage 读取 */
function _savedFromSS(){
  try{ const raw=sessionStorage.getItem(SAVED_SESS_KEY); if(!raw) return null; const a=JSON.parse(raw); return (Array.isArray(a))?a:null; }catch(e){ console.error('[BZI] SS GET ERROR', e.message); return null; }
}
/* 写入 localStorage */
function _saveToLS(arr){
  try{ localStorage.setItem(SAVED_KEY, JSON.stringify(arr.slice(0,SAVED_MAX))); }catch(e){ console.error('[BZI] LS SET ERROR', e.message); }
}
/* 写入 sessionStorage */
function _saveToSS(arr){
  try{ sessionStorage.setItem(SAVED_SESS_KEY, JSON.stringify(arr.slice(0,SAVED_MAX))); }catch(e){ console.error('[BZI] SS SET ERROR', e.message); }
}
/* 读取：优先 localStorage，其次 sessionStorage */
function getBaziSaved(){
  const ls=_savedFromLS(); if(ls) return ls;
  const ss=_savedFromSS(); if(ss) return ss;
  return [];
}
/* 写入：同时写 localStorage 和 sessionStorage */
function setBaziSaved(arr){
  _saveToLS(arr); _saveToSS(arr);
}
/* 删除单条：读、删、写回 */
function deleteSavedEntry(i){
  const list=getBaziSaved(); if(i<0||i>=list.length) return;
  list.splice(i,1); setBaziSaved(list); renderSavedPanel();
}
/* 页面初始化：无额外操作，getBaziSaved 自动从双存储读取 */
/* 保存当前输入：按当前输入方式取对应字段。 */
function saveBaziEntry(){
  const mode=document.getElementById('bMode').value;
  if(mode!=='date' && mode!=='lunar' && mode!=='pillar'){ showFormErr('请先切换到"公历"、"农历"或"四柱"模式再保存'); return; }
  const name=(document.getElementById('bName').value||'').trim();
  const entry={ name: name||'未命名', mode, sex:document.getElementById('bSex').value };
  if(mode==='date'){
    const d=document.getElementById('bDate').value, t=document.getElementById('bTime').value;
    if(!d){ showFormErr('请先填写公历日期再保存'); return; }
    entry.date=d; entry.time=t||'12:00';
  } else if(mode==='lunar'){
    const y=document.getElementById('bLunarY').value, m=document.getElementById('bLunarM').value, d=document.getElementById('bLunarD').value, t=document.getElementById('bTime').value;
    if(!y||!m||!d){ showFormErr('请先完整填写农历年、月、日再保存'); return; }
    entry.lunarY=y; entry.lunarM=m; entry.lunarD=d; entry.lunarLeap=document.getElementById('bLunarLeap').checked; entry.time=t||'12:00';
  } else {
    const p={yg:document.getElementById('pyG').value,yz:document.getElementById('pyZ').value,
              mg:document.getElementById('pmG').value,mz:document.getElementById('pmZ').value,
              dg:document.getElementById('pdG').value,dz:document.getElementById('pdZ').value,
              tg:document.getElementById('ptG').value,tz:document.getElementById('ptZ').value};
    if(!p.yg||!p.yz||!p.mg||!p.mz||!p.dg||!p.dz||!p.tg||!p.tz){ showFormErr('请先完整填写四柱干支再保存'); return; }
    Object.assign(entry,p);
  }
  const list=getBaziSaved();
  /* 同键去重：姓名+核心字段完全一致则不重复写入（避免同一八字反复保存撑满） */
  const keyOf=e=>e.mode+'\u0001'+e.sex+'\u0001'+(e.mode==='date'?e.date+' '+e.time:(e.mode==='lunar'?e.lunarY+'-'+(e.lunarLeap?'闰':'')+e.lunarM+'-'+e.lunarD+' '+e.time:Object.values(e).slice(3,11).join('')));
  const same=list.findIndex(e=>keyOf(e)===keyOf(entry));
  if(same>=0){ list[same]=entry; } else { list.push(entry); }
  while(list.length>SAVED_MAX) list.shift(); /* 超出上限丢弃最早一条 */
  setBaziSaved(list); /* 同步写入 localStorage + sessionStorage 双保险 */
  renderSavedPanel(); /* 面板在已存模式下立即可见；输入框模式下仅预渲染，等用户选"已存"查看 */
  /* 不强制切到已存模式：保留当前输入，便于连续保存多条；以按钮闪示确认 */
  const btn=document.querySelector('button[onclick="saveBaziEntry()"]');
  if(btn){ const old=btn.textContent; btn.textContent='已保存 ✓'; setTimeout(()=>{ if(btn.textContent==='已保存 ✓') btn.textContent=old; },1200); }
  const tip=document.getElementById('savedTip'); if(tip && document.getElementById('savedPanel').style.display!=='none') tip.textContent='已保存"'+(name||'未命名')+'"';
}
const LUNAR_M={'1':'正月','2':'二月','3':'三月','4':'四月','5':'五月','6':'六月','7':'七月','8':'八月','9':'九月','10':'十月','11':'十一月','12':'十二月'};
const LUNAR_D={'1':'初一','2':'初二','3':'初三','4':'初四','5':'初五','6':'初六','7':'初七','8':'初八','9':'初九','10':'初十','11':'十一','12':'十二','13':'十三','14':'十四','15':'十五','16':'十六','17':'十七','18':'十八','19':'十九','20':'二十','21':'廿一','22':'廿二','23':'廿三','24':'廿四','25':'廿五','26':'廿六','27':'廿七','28':'廿八','29':'廿九','30':'三十'};
function savedInfoText(e){
  if(e.mode==='date'){ return e.date+' '+(e.time||''); }
  if(e.mode==='lunar'){ return '农历 '+e.lunarY+'年'+(e.lunarLeap?' 闰 ':' ')+(LUNAR_M[e.lunarM]||e.lunarM)+' '+((LUNAR_D[e.lunarD]||e.lunarD))+' '+e.time; }
  return (e.yg+e.yz)+' '+(e.mg+e.mz)+' '+(e.dg+e.dz)+' '+(e.tg+e.tz);
}
/* 渲染已存列表（输入模式下由 saveBaziEntry 触发查看；已存模式下由 toggleBaziMode 触发；初始化完成后自动渲染） */
function renderSavedPanel(){
  const list=getBaziSaved();
  const host=document.getElementById('savedList'); if(!host) return;
  /* esc 由 bazi.html 后置脚本定义，此处防御性处理避免初始化时序问题 */
  const _esc = typeof esc==='function' ? esc : (s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
  if(!list.length){
    host.innerHTML='<div class="sr"><div class="sc sc-info" style="border-bottom:none">暂无已存八字。在"公历"、"农历"或"四柱"模式下填写后，点"保存"即可记录。</div></div>';
    const tip=document.getElementById('savedTip'); if(tip) tip.textContent='';
    return;
  }
  let html='<div class="sr sr-head"><div class="sc sc-name">姓名</div><div class="sc sc-sex">性别</div><div class="sc sc-info">信息</div><div class="sc sc-act">排盘</div></div>';
  list.forEach((e,i)=>{
    const sexLabel=(e.sex==='1'||e.sex===1)?'男':'女';
    html+='<div class="sr">'+
      '<div class="sc sc-name">'+_esc(e.name)+'</div>'+
      '<div class="sc sc-sex">'+_esc(sexLabel)+'</div>'+
      '<div class="sc sc-info">'+_esc(savedInfoText(e))+'</div>'+
      '<div class="sc sc-act"><button class="btn-pai" type="button" onclick="loadSavedEntry('+i+')">排盘</button>'+
      '<button class="btn-del" type="button" onclick="deleteSavedEntry('+i+')" aria-label="删除">×</button></div>'+
    '</div>';
  });
  host.innerHTML=html;
  const tip=document.getElementById('savedTip'); if(tip) tip.textContent='共 '+list.length+' 条';
}
/* 选中某条：切回该条输入方式、填充输入、直接排盘。 */
function loadSavedEntry(i){
  const list=getBaziSaved(); const e=list[i]; if(!e) return;
  const bm=document.getElementById('bMode'); bm.value=e.mode; toggleBaziMode();
  document.getElementById('bSex').value=e.sex||'1';
  if(e.mode==='date'){
    document.getElementById('bDate').value=e.date||'';
    document.getElementById('bTime').value=e.time||'12:00';
  } else if(e.mode==='lunar'){
    document.getElementById('bLunarY').value=e.lunarY||'';
    document.getElementById('bLunarM').value=e.lunarM||'1';
    document.getElementById('bLunarD').value=e.lunarD||'1';
    document.getElementById('bLunarLeap').checked=!!e.lunarLeap;
    document.getElementById('bTime').value=e.time||'12:00';
  } else {
    ['yg','yz','mg','mz','dg','dz','tg','tz'].forEach(k=>{ const map={yg:'pyG',yz:'pyZ',mg:'pmG',mz:'pmZ',dg:'pdG',dz:'pdZ',tg:'ptG',tz:'ptZ'}; const el=document.getElementById(map[k]); if(el) el.value=e[k]; });
  }
  paipan(); /* 直接排出该八字（四柱模式含空亡基准等沿用当前选项） */
}
/* 刷新后恢复岁运选择（大运/流年/流月/流日）：初始化完成前由 paipan/paipanPillar 调用一次，
   在 renderDyn 默认选择之后，按保存值重新点选对应按钮（找不到则保持默认，安全降级） */
function restoreYunSel(){
  const saved=loadPillarSel(); if(!saved || !window.BZ) return;
  const byText=(sel,txt)=>{ let b=null; try{ document.querySelectorAll(sel).forEach(x=>{ const t=(x.textContent||'').replace(/\s+/g,''); if(txt && t.indexOf(txt)>=0) b=x; }); }catch(e){} return b; };
  // 程序化点选用 dispatchEvent 而非 click()：click() 会让按钮获得焦点，浏览器自动滚动到该元素（运势分析模块），刷新/排盘后页面被"跳走"；dispatchEvent 触发 onclick 但不改变焦点、不滚动
  const fire=b=>{ try{ b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }catch(e){} };
  try{
    if(saved.dyGZ){ const d=byText('#dys .dyn-btn', saved.dyGZ); if(d) fire(d); }
    if(saved.lnGZ){ const l=byText('#lns .dyn-btn', saved.lnGZ); if(l) fire(l); }
    if(saved.lmGZ){ const m=byText('#lms .dyn-btn', saved.lmGZ); if(m) fire(m); }
    if(saved.lrDate && saved.lrDate.y && saved.lrDate.m && saved.lrDate.d){
      const lr=document.getElementById('lr_'+saved.lrDate.y+'_'+saved.lrDate.m+'_'+saved.lrDate.d);
      if(lr) fire(lr);
    }
  }catch(e){}
}
/* 初始化四柱下拉（页面加载时填充干支选项，年柱默认当前年干支；有保存则恢复保存值） */
(function initGzSel(){
  const saved=loadPillarSel();
  const fill=(id,arr,def)=>{ const el=document.getElementById(id); if(!el) return; el.innerHTML=arr.map(x=>`<option value="${x}">${x}</option>`).join(''); let v=def; if(saved && saved[id]!=null && arr.indexOf(saved[id])>=0) v=saved[id]; if(v!=null) el.value=v; };
  ['pyG','pmG','pdG','ptG'].forEach(id=>fill(id,GAN));
  ['pyZ','pmZ','pdZ','ptZ'].forEach(id=>fill(id,ZHI_ORDER));
  try{
    const now=new Date();
    const yy=now.getFullYear();
    const yGZ=Solar.fromYmd(yy,6,1).getLunar().getYearInGanZhi();
    fill('pyG',GAN,yGZ[0]); fill('pyZ',ZHI_ORDER,yGZ[1]);
    fill('pmG',GAN,wuHuDun(yGZ[0])); fill('pmZ',ZHI_ORDER,'寅'); /* 五虎遁：正月寅月 */
    const dGZ=Solar.fromYmd(yy,now.getMonth()+1,now.getDate()).getLunar().getDayInGanZhi();
    fill('pdG',GAN,dGZ[0]); fill('pdZ',ZHI_ORDER,dGZ[1]);
    fill('ptG',GAN,wuZhuDun(dGZ[0])); fill('ptZ',ZHI_ORDER,'子'); /* 五鼠遁：子时 */
  }catch(e){}
  /* 恢复输入方式 / 性别 / 已确认出生日期（浏览器刷新对 <select> 的还原不可靠，这里显式兜底） */
  if(saved){
    /* 恢复输入方式：优先读 PAGE_MODE_KEY（用户主动选择的页面模式），降级到 PILLAR_KEY.mode */
    {
      try {
        const pageMode = localStorage.getItem(PAGE_MODE_KEY);
        const validModes = ['date','lunar','pillar','saved'];
        if(pageMode && validModes.indexOf(pageMode)>=0){
          const bm=document.getElementById('bMode'); if(bm) bm.value=pageMode;
        } else if(saved && (saved.mode==='pillar'||saved.mode==='date'||saved.mode==='lunar'||saved.mode==='saved')) {
          const bm=document.getElementById('bMode'); if(bm) bm.value=saved.mode;
        }
      }catch(e){}
    }
    try{ const bs=document.getElementById('bSex'); if(bs && (saved.sex==='1'||saved.sex==='0')) bs.value=saved.sex; }catch(e){}
    try{ const nm=document.getElementById('bName'); if(nm && saved.bName) nm.value=saved.bName; }catch(e){}
    if(saved.chosen) pillarChosenDate=saved.chosen;
    /* 恢复出生日期模式输入项 */
    try{ const d=document.getElementById('bDate'); if(d && saved.bDate) d.value=saved.bDate; }catch(e){}
    try{ const t=document.getElementById('bTime'); if(t && saved.bTime) t.value=saved.bTime; }catch(e){}
    /* 恢复农历模式输入项（年/月/日/闰月） */
    try{ const y=document.getElementById('bLunarY'); if(y && saved.bLunarY) y.value=saved.bLunarY; }catch(e){}
    try{ const m=document.getElementById('bLunarM'); if(m && saved.bLunarM) m.value=saved.bLunarM; }catch(e){}
    try{ const d=document.getElementById('bLunarD'); if(d && saved.bLunarD) d.value=saved.bLunarD; }catch(e){}
    try{ const lp=document.getElementById('bLunarLeap'); if(lp && typeof saved.bLunarLeap==='boolean') lp.checked=saved.bLunarLeap; }catch(e){}
    try{ const tr=document.getElementById('bTrue'); if(tr && typeof saved.bTrue==='boolean') tr.checked=saved.bTrue; }catch(e){}
    try{ const zi=document.getElementById('bZi'); if(zi && saved.bZi) zi.value=saved.bZi; }catch(e){}
    try{ const k=document.getElementById('bKong'); if(k && saved.bKong) k.value=saved.bKong; }catch(e){}
    try{ const lng=document.getElementById('bLng'); if(lng && saved.bLng!==undefined && saved.bLng!==null) lng.value=saved.bLng; }catch(e){}
    /* 恢复出生地三级联动：先设省→触发填市、区，再设市→触发填区，最后设区；并保存最终态 */
    try{
      if(saved.bProv && PROV[saved.bProv]){
        const sp=document.getElementById('bProv'), sc=document.getElementById('bCity'), sd=document.getElementById('bDist');
        sp.value=saved.bProv; sp.dispatchEvent(new Event('change'));
        if(saved.bCity){ sc.value=saved.bCity; sc.dispatchEvent(new Event('change')); }
        if(saved.bDist!==undefined && saved.bDist!==null){ sd.value=saved.bDist; }
        savePillarSel();
      }
    }catch(e){}
  }
})();
/* 页面加载时同步一次 UI：浏览器刷新会恢复 bMode 上次选中的值（如"四柱干支"），
   但不会触发 onchange，若不在此显式调用 toggleBaziMode，左侧字段会停在默认 HTML 显示状态，
   与 bMode 实际值脱节（表现为模式=四柱干支、却仍显示出生日期、出生地）。
   注意：已存面板延迟到 DOMContentLoaded 后渲染，避免 esc() 未定义导致 ReferenceError。 */
if (BAZI_PAGE_UI) toggleBaziMode();
/* 页面初始化（含 localStorage 恢复与自动重排）完成：此后操作才允许写回 localStorage，
   避免初始渲染用默认当天日期覆盖已保存状态。 */
baziInitDone=true;
/* 延迟渲染已存面板：等待 bazi.html 末尾的脚本执行完毕（esc 等函数定义完成） */
(function(){
  if(document.readyState==='complete'||document.readyState==='interactive'){
    setTimeout(()=>{
      try{ const bm=document.getElementById('bMode'); if(bm && bm.value==='saved') renderSavedPanel(); }catch(e){}
    }, 0);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>{
      try{ const bm=document.getElementById('bMode'); if(bm && bm.value==='saved') renderSavedPanel(); }catch(e){}
    }, {once:true});
  }
})();


/* ============ 三大模块折叠 ============ */
/* 折叠模块 id 从 DOM 取（.mod[id]），新增模块自动纳入折叠与持久化，不靠硬编码名单 */
function _allModIds(){ try{ return Array.from(document.querySelectorAll('.mod[id]')).map(e=>e.id); }catch(e){ return ['mod-base','mod-life','mod-yiti','mod-yun']; } }
function readModState(){
  try{
    let raw=null;
    try{ raw=localStorage.getItem(BAZI_MOD_KEY); }catch(e){}
    if(!raw){ try{ raw=sessionStorage.getItem(BAZI_MOD_KEY); }catch(e){} }  /* localStorage 不可用（隐私模式/被清）时回退 sessionStorage */
    const o=raw?JSON.parse(raw):null;
    return (o&&typeof o==='object')?o:{};
  }catch(e){ return {}; }
}
function toggleMod(id){ const el=document.getElementById(id); if(el) el.classList.toggle('collapsed'); saveModState(); }
function saveModState(){
  if(!baziInitDone) return; /* 初始化完成前不写，避免覆盖已保存状态 */
  try{
    /* 以已存为底、只覆盖此刻在场的件：恢复折叠态本身会触发 toggle 回调本函数，而动态板块（先删后建）此刻不在场，
       整份重写就会把这些件的键抹掉，下次刷新读不回来 */
    const o=readModState();
    _allModIds().forEach(id=>{ const e=document.getElementById(id); if(e) o[id]=e.classList.contains('collapsed'); });
    /* 页内折叠块（本命分析小节、关联数术等）的 open 状态一并持久化（须带 id 方可定位） */
    try{
      const zr=(o._zr&&typeof o._zr==='object')?o._zr:{};
      document.querySelectorAll('details[id]').forEach(d=>{ zr[d.id]=d.open; });
      if(Object.keys(zr).length) o._zr=zr;
    }catch(e){}
    const v=JSON.stringify(o);
    try{ localStorage.setItem(BAZI_MOD_KEY, v); }catch(e){}   /* 普通模式持久化 */
    try{ sessionStorage.setItem(BAZI_MOD_KEY, v); }catch(e){} /* 隐私/无痕模式兜底：同一会话 F5 刷新时 sessionStorage 一定保留（localStorage 在部分隐私实现中刷新即失） */
  }catch(e){}
}
function applyModState(){
  const o=readModState();
  try{
    _allModIds().forEach(id=>{
      const e=document.getElementById(id); if(!e) return;
      if(o[id]===true) e.classList.add('collapsed');
      else if(o[id]===false) e.classList.remove('collapsed');
    });
    /* 恢复内部折叠块 open 状态（须在模块展开后执行，DOM 已就绪） */
    if(o._zr && typeof o._zr==='object'){
      try{ document.querySelectorAll('details[id]').forEach(d=>{ if(d.id in o._zr) d.open=!!o._zr[d.id]; }); }catch(e){}
    }
  }catch(e){}
}
/* 页内折叠块展开/收起即保存：toggle 事件不冒泡，用捕获阶段监听 */
try{ document.addEventListener('toggle', e=>{ if(e.target && e.target.tagName==='DETAILS' && e.target.id) saveModState(); }, true); }catch(e){}

/* ---------- 弹窗 ---------- */
function showTip(key, extra){
  /* 神煞弹框可带纳音查法标记（\u0001nayin）：标注该神煞以年柱纳音五行立极查得，与日干主查法并见 */
  let nayin=false;
  if(typeof key==='string' && key.indexOf(SHA_NAYIN_TAG)>=0){ nayin=true; key=key.slice(0, key.indexOf(SHA_NAYIN_TAG)); }
  const o=DICT[key];
  let body='';
  if(key==='__NAYIN__' && extra){
    const info=NAYIN_INFO[extra];
    body=`<h3 class="tip-title">${extra}</h3><div class="tip-body">五行属<span class="${WX_CLASS[info.wx]||''}">${info.wx}</span>。<br>${info.d}</div>`;
  } else if(o){
    body=tipHtml(key);
  } else {
    body=`<h3 class="tip-title">${key}</h3><div class="tip-body">（暂无说明）</div>`;
  }
  if(nayin) body+=`<div class="tip-body tip-nayin">纳音查法：本煞以年柱纳音五行立极而取，与日干主查法属不同体系，两法并见时各具其义。</div>`;
  document.getElementById('modalBody').innerHTML=gzAllColorSpan(body);
  document.getElementById('modalMask').classList.add('show');
}
function closeTip(){ document.getElementById('modalMask').classList.remove('show'); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeTip(); });

/* 把页面渲染出的 HTML 片段剥成纯文本，供“复制排盘数据”使用，
   保证复制内容与页面完全一致、不会失同步。表格单元格用“ | ”分隔，块级元素换行。 */
function htmlToText(html){
  if(!html) return '';
  let s = String(html)
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/(tr|p|div|h3|h4|h5|li|section|table|thead|tbody|caption|details|summary)>/gi,'\n')
    .replace(/<(td|th)[^>]*>/gi,'\u0001')   // 单元格标记
    .replace(/<[^>]+>/g,'')                 // 去掉其余标签
    .replace(/\u0001/g,' | ');              // 单元格分隔
  return s.split('\n').map(function(line){
    let t = line.replace(/\s*\|\s*/g,' | ').replace(/^\s*\|\s*/,'').replace(/\s*\|\s*$/,'');
    return t.replace(/[ \t]+/g,' ').trim();
  }).filter(function(l){ return l.length>0; }).join('\n');
}

mountAI(function(){
  if(!BZ||!BZ.meta) return '';
  const m=BZ.meta;
  const wx=BZ.wxCnt?Object.keys(BZ.wxCnt).map(k=>`${k}${BZ.wxCnt[k]}`).join(' '):'';
  const sel=[];
  if(BZ.dyGZ) sel.push('大运 '+BZ.dyGZ);
  if(BZ.lnGZ) sel.push('流年 '+BZ.lnGZ+(BZ.curYear?`（${BZ.curYear}年）`:''));
  if(BZ.lmGZ) sel.push('流月 '+BZ.lmGZ);
  if(BZ.lrGZ) sel.push('流日 '+BZ.lrGZ);
  const wx2=BZ.wxCntAll?Object.keys(BZ.wxCntAll).map(k=>`${k}${BZ.wxCntAll[k]}`).join(' '):'';
  let gr='', zr='';
  try{ gr=ganRelations(BZ.gans, BZ, GAN_LAB).map(r=>r.text).join('，')||'无明显合化生克'; }catch(e){}
  try{ zr=zhiRelations(BZ.zhis, BZ, ZHI_LAB).map(r=>r.text).join('，')||'无明显合化刑冲'; }catch(e){}
  let dayun='';
  try{ if(BZ.dys) dayun=BZ.dys.map(d=>d.getGanZhi()).filter(Boolean).join(' '); }catch(e){}
  let analysis='';
  try{ const A=getAnalysis(BZ);
    analysis=`\n格局分析：\n日主强弱：${A.strength}（旺衰评分${A.score.toFixed(1)}）\n五行分布：${['木','火','土','金','水'].map(k=>k+A.cnt[k]).join(' ')}`+
      `\n扶抑用神：喜（${A.fu.xi.join('、')}） 忌（${A.fu.ji.join('、')}）`+
      `\n调候用神：喜${A.tiao.wx}（${dedupChars(A.tiao.gan)}）`+
      (A.tong?`\n通关用神：${A.tong.wx}（${dedupChars(A.tong.gan)}）`:'')+
      `\n格局：${A.geName}${A.geGanLabel}；格局用神：喜 ${A.geUse.xi}；忌 ${A.geUse.ji}`;
  }catch(e){ analysis=''; }
  let life='', remedy='';
  try{ const A=getAnalysis(BZ);
    life=`\n核心解读：\n喜用神：${A.fu.xi.join('、')}；忌：${A.fu.ji.join('、')}`;
    remedy=`\n宜忌补救：方位：${(['木','火','土','金','水'].filter(w=>A.fu.xi.join('').indexOf(w)>=0).map(w=>({'木':'东','火':'南','土':'中','金':'西','水':'北'}[w])).join('、')||'中宫')}；颜色：${(['木','火','土','金','水'].filter(w=>A.fu.xi.join('').indexOf(w)>=0).map(w=>({'木':'青绿','火':'红紫','土':'黄褐','金':'白金','水':'黑蓝'}[w])).join('、')||'中性色')}`;
  }catch(e){}
  // 数据类字段：十神 / 纳音 / 十二长生 / 神煞 / 称骨
  let tgArr = ['年','月','日','时'].map((lab,i)=>{
    const tg = i===2 ? '日主' : tgAbbr(tenGod(BZ.dayGan, BZ.gans[i]));
    const tz = tgAbbr(tenGod(BZ.dayGan, zhiMain(BZ.zhis[i])));
    return `${lab}（${tg}、${tz}）`;
  }).join(' ');
  const shishen = `\n十神（天干、地支本气）：${tgArr}`;
  const nayin = `\n纳音：年 ${nayinOf(BZ.gans[0]+BZ.zhis[0])}　月 ${nayinOf(BZ.gans[1]+BZ.zhis[1])}　日 ${nayinOf(BZ.gans[2]+BZ.zhis[2])}　时 ${nayinOf(BZ.gans[3]+BZ.zhis[3])}`;
  const changsheng = `\n十二长生（日干对四支）：年 ${csKey(getChangSheng(BZ.dayGan,BZ.zhis[0]))}　月 ${csKey(getChangSheng(BZ.dayGan,BZ.zhis[1]))}　日 ${csKey(getChangSheng(BZ.dayGan,BZ.zhis[2]))}　时 ${csKey(getChangSheng(BZ.dayGan,BZ.zhis[3]))}`;
  const shaParts = [['年柱',BZ.shaYear],['月柱',BZ.shaMonth],['日柱',BZ.shaDay],['时柱',BZ.shaTime]]
    .map(([lab,arr])=>`${lab} ${(arr&&arr.length)?arr.join('、'):'无'}`).join('　');
  const shensha = `\n神煞：${shaParts}`;
  const kong = `\n空亡：${['年','月','日','时'].map((lab,i)=>`${lab}柱（${kongOf(BZ.gans[i]+BZ.zhis[i]).join('、')}）`).join('　')}`;
  const cg=chenguCore(BZ);
  const chengu = `\n称骨：年柱${cg.yg}${cg.yKnown?(cg.yv+'钱'):'数据暂缺'}　月支${cg.mz}${cg.mv}钱　日柱${cg.gans2+cg.zhis2}${cg.dv==null?'未确认':(cg.dv+'钱')}　时支${cg.tz}${cg.hv}钱；总骨重 ${cg.liangInt}两${cg.qian}钱（${cg.total}钱）；文化解读：${cg.v.t}。`;
  // 旺相休囚死（月令季节性五行旺衰）
  let wxState='';
  try{ const wxs=wangXiang(BZ.monthZ); wxState='\n旺相休囚死：'+['木','火','土','金','水'].map(w=>w+wxs[w]).join(' '); }catch(e){}
  // 量化四柱（五行旺衰 / 阴阳五行 / 十神 / 六亲 / 生克）：取与量化四柱圆盘同源的纯文本摘要，
  // 直接由数据算出，不经页面渲染结果反抓，与页面渲染形态解耦
  let quant='';
  try{ const qTxt=quantSummaryText(BZ); if(qTxt) quant='\n旺衰量化（结论与依据）：\n'+qTxt; }catch(e){}
  // 各流派解读格局（子平 / 盲派 / 调候 / 新派 / 病药）：仅保留交叉共识结论行，略去各派长文
  let school='';
  try{ const A=getAnalysis(BZ);
    const sTxt=htmlToText(renderSchoolDiffInner(A,BZ));
    const keep=sTxt.split('\n').filter(l=>/共识|交叉|一致|结论/.test(l)).slice(0,10);
    school=keep.length?('\n流派交叉共识：\n'+keep.join('\n')):'';
  }catch(e){}
  // 命局断事（财官印食 + 神煞引事 + 特殊格局/结构病 + 五行失衡/巳火变色龙）；标题行由渲染自带
  let duan='';
  try{ duan='\n'+htmlToText(duanShiMingJu(BZ)); }catch(e){}
  // 岁运引动（大运起运/用忌/吉凶/关键引动 + 当前流年）；标题行由渲染自带
  let yunDong='';
  try{ const t=htmlToText(renderYunDong(BZ)); if(t) yunDong='\n'+t; }catch(e){}
  // 流年事件（当前所处大运十年）；标题行由渲染自带
  let yunEvent='';
  try{ const t=htmlToText(renderYunEventFixed(BZ)); if(t) yunEvent='\n'+t; }catch(e){}
  // 十神宫位（人生议题前）
  let ssPos='';
  try{ const t=htmlToText(renderShiShenPos(BZ)); if(t) ssPos='\n'+t; }catch(e){}
  // 人生议题四卡（事业财运/婚姻感情/性格健康/家庭子女）
  let lifeCards='';
  try{ const t=htmlToText(renderLifeDeep(BZ)); if(t) lifeCards='\n'+t; }catch(e){}
  // 所选干支详情（与命局关系/所选干支间关系/各流派解读运势）：读动态详情面板，与页面完全一致
  let dyn='';
  try{ const db=document.getElementById('dynDetail'); if(db){ const t=htmlToText(db.outerHTML); if(t) dyn='\n'+t; } }catch(e){}
  return `${m.sex}命\n四柱：${m.pillars}\n日主：${BZ.dayGan}（${m.dayGanWx}）\n农历：${m.lunarStr}\n生肖、星座、二十八宿：属${m.sx}，${m.xz}座，${m.xiu}\n命宫、胎元、身宫：${m.mingGong}/${m.taiYuan}/${m.shenGong}\n文昌位：${m.wenChangFang}（${m.wenChang}），天乙贵人：${m.tianYi}\n${m.jieQi}\n五行统计（不计藏干）：${wx}\n五行统计（计入藏干）：${wx2}${wxState}\n天干关系：${gr}\n地支关系：${zr}\n大运：${dayun}\n当前选取：${sel.length?sel.join('，'):'未选大运流年'}${analysis}${life}${remedy}${shishen}${nayin}${changsheng}${shensha}${kong}${chengu}${quant}${school}${duan}${ssPos}${lifeCards}${yunDong}${yunEvent}${dyn}`;
}, '八字排盘', {
  temperature: 0.4,
  systemPrompt: [
    '本任务为八字（四柱命理）专项解读，只依据给出的盘面数据作答，不要引入塔罗、占星等其他体系。',
    '解读时必须引用盘面原词（日主天干、月令、十神、用神忌神、大运干支），不得凭空补充盘面没有的信息。',
    '论断应期必须挂靠具体大运或流年干支，不可脱离岁运空谈吉凶。',
    '旺衰结论以盘面给的“旺衰评分与档位”为准，不得自行重算推翻。',
    '不提供医疗诊断、投资建议；涉及健康、财运时仅描述命理倾向并建议咨询专业人士。',
    '同一盘面多重结论并存时，说明各流派视角，不给唯一断语。'
  ].join('\n')
});

/* 初始排盘：置于全文件末尾，确保所有顶层 const（含 SHA_LIFE 等数据表）已初始化后再触发，避免 TDZ；
   仅八字页执行（paipanSig 等输入签名函数由八字页内联提供） */
if (BAZI_PAGE_UI) paipan();

/* 双保险：无论上述 paipan() 是否被性能守卫拦截或中途异常，初始渲染完成后都无条件再应用一次
   三大模块折叠状态（避免"展开本命分析→刷新后折叠"），须在滚动位置恢复之前执行（先展开、高度正确、再定位）。 */
try{ applyModState(); }catch(e){}

/* 滚动位置保持：刷新与重载后停在离开时的位置。
   位置由本地记录精确恢复，不依赖浏览器自动恢复（file:// 下 scrollRestoration 不可靠，
   且程序化 focus 会把页面滚到运势分析）。 */
const SCROLL_KEY='bazi_scroll_v1';
/* 已由全站顶层机制统一接管（window.xjRefreshTakeover），此处仅作未加载顶层时的兜底 */
if(!window.xjRefreshTakeover){
try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
window.addEventListener('pagehide', ()=>{ try{ localStorage.setItem(SCROLL_KEY, String(window.scrollY||0)); }catch(e){} });
(function(){
  try{
    const sv=parseInt(localStorage.getItem(SCROLL_KEY)||'0',10);
    if(sv>0){ setTimeout(()=>{ try{ window.scrollTo(0, sv); }catch(e){} }, 120); }
  }catch(e){}
})();
}
