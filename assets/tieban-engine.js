/* 铁板神数引擎 v20261009tb6
 * 依赖：Solar/Lunar（lunar.js）；时刻折算与太阳时取本站共用件
 *       （xuanji-lib.js 的 applyDstCorrection 与 trueSolarTime、bazi-data.js 的 adjustZiShi），
 *       共用件未载时子时日界回落本地同源副本、夏令时与太阳时按不折算处理。
 * 纯计算模块，不触碰 DOM。
 *
 * 体系口径：
 *  1 干支化数：太玄经数：甲己子午九、乙庚丑未八、丙辛寅申七、丁壬卯酉六、戊癸辰戌五、巳亥单四数。
 *  2 刻分：每时辰八刻，每刻十五分钟；刻下再分十五分金，每分金一分钟，全时辰一百二十分金。
 *  3 皇极总数：四柱干支太玄数之和加刻分修正数。刻分修正数取刻分序加一，
 *    刻分序为刻序乘十五加分金序，自 0 至 119，故同一时辰一百二十档各得一数、互不重复。
 *  4 六亲定刻：考刻数 = (父母态序乘五 + 手足数乘三 + 婚姻态序乘七) mod 8，在盘面时辰八刻内定位正刻。
 *  5 条文抽演：以皇极总数为纲按类取条；条文编号为全库统一序号（tiaowen 库装载时顺序赋号）。
 *  6 大运：lunar.js EightChar 体系 getYun(gender, sect)，性别定顺逆、sect 定起运折算口径，十年一步。
 *  7 时刻链路与八字排盘页同序：钟面时刻 → 夏令时折算 → 真太阳时校正 → 子时日界在真太阳时刻上判定
 *    → 定四柱；盘面时辰刻分同取校正后时刻所归。 */
(function(){
'use strict';

var GAN = '甲乙丙丁戊己庚辛壬癸';
var ZHI = '子丑寅卯辰巳午未申酉戌亥';
var TX_GAN = {'甲':9,'己':9,'乙':8,'庚':8,'丙':7,'辛':7,'丁':6,'壬':6,'戊':5,'癸':5};
var TX_ZHI = {'子':9,'午':9,'丑':8,'未':8,'寅':7,'申':7,'卯':6,'酉':6,'辰':5,'戌':5,'巳':4,'亥':4};
/* 先天八卦数：乾一、兑二、离三、震四、巽五、坎六、艮七、坤八 */
var BAGUA = ['乾','兑','离','震','巽','坎','艮','坤'];
/* 洛书后天数（戴九履一，左三右七，二四为肩，六八为足）：坎一、坤二、震三、巽四、中五、乾六、兑七、艮八、离九 */
var LUOSHU_NUM = {'乾':6,'兑':7,'离':9,'震':3,'巽':4,'坎':1,'艮':8,'坤':2};
var XIAN_NAME = ['乾','兑','离','震','巽','坎','艮','坤'];
var KE_MIN = 15;
var FENG_PER_KE = 15;
var KE_TOTAL = 120;
var KE_NAMES = ['初刻','一刻','二刻','三刻','四刻','五刻','六刻','七刻'];
var FUMU_LABEL = {'both':'父母双全','father':'先亡父','mother':'先亡母','none':'父母俱违'};
var MARRY_LABEL = {'unmarried':'未婚','married':'已婚','divorced':'离异','widowed':'丧偶'};
var CHILD_LABEL = {0:'无或迟得',1:'1 个',2:'2 个',3:'3 个',4:'4 个',5:'5 个及以上'};
/* 五鼠遁：日上起时（早子时 23 点时柱按当日日干遁子；与 bazi-data.js wuShuDun 同式，回落用） */
var WUSHU = {'甲':0,'乙':2,'丙':4,'丁':6,'戊':8,'己':0,'庚':2,'辛':4,'壬':6,'癸':8};

function txOf(gz){ return TX_GAN[gz.charAt(0)] + TX_ZHI[gz.charAt(1)]; }

/* 时辰起值 23,1,3..21 与刻序 0..7 → 当日子时起算的绝对分钟 */
function keAbsMin(zhiH, ke){ return zhiH*60 + ke*KE_MIN; }

/* 时辰起值 → 时辰序 0..11 */
function zhiIdxOf(zhiH){ return zhiH === 23 ? 0 : (zhiH + 1) / 2; }

/* 由绝对分钟反推所属时辰起值、刻序与时辰序 */
function zhiKeOfAbsMin(absMin){
  var h = Math.floor(absMin/60) % 24;
  var ziIdx = (h===23 || h===0) ? 0 : Math.ceil(h/2);
  var start = (ziIdx===0) ? 23 : ziIdx*2 - 1;
  var ke = Math.floor(((absMin - start*60 + 1440) % 1440) / KE_MIN);
  if(ke > 7) ke = 7;
  return {zhiH:start, ke:ke, zhiIdx:ziIdx};
}

function absMinLabel(abs){
  var m1 = abs % 1440, m2 = (abs + KE_MIN) % 1440;
  return pad2(Math.floor(m1/60)) + ':' + pad2(m1%60) + '-' + pad2(Math.floor(m2/60)) + ':' + pad2(m2%60);
}

/* 钟面时刻：时辰起值与刻分合成自当日零时起算的绝对分钟，越过 1440 即顺推一日。
   子时起值 23，刻 0 至 3 落当日 23:00 至 23:59，刻 4 至 7 落次日 00:00 至 00:59，
   八刻为一段连续时刻，日偏移随刻递增，四柱按此真实日期取。 */
function clockOf(y, m, d, zhiH, ke, feng){
  var abs = zhiH*60 + ke*KE_MIN + feng;
  var dayShift = Math.floor(abs / 1440);
  var minute = abs - dayShift*1440;
  var s = Solar.fromYmd(y, m, d);
  if(dayShift) s = s.nextDay(dayShift);
  return {y:s.getYear(), m:s.getMonth(), d:s.getDay(),
          h:Math.floor(minute/60), mi:minute%60, dayShift:dayShift};
}

/* 早子时 23 点时柱：当日日干五鼠遁子 */
function wuShuDunZi(dayGan){
  var dg = dayGan.charAt(0);
  var idx = (WUSHU[dg] + 0) % 10;
  return GAN.charAt(idx) + '子';
}

/* 本地回落副本：仅当八字体系（bazi-data.js）未加载时使用，算法与其同源 */
function _adjustZiShi(y,m,d,h,mi,mode){
  var s;
  if(h===23 && mode!=='early'){ s = Solar.fromYmd(y,m,d).nextDay(1); return {y:s.getYear(),m:s.getMonth(),d:s.getDay(),h:0,mi:mi,note:'晚子时：23时后归次日'}; }
  if(h===23){ return {y:y,m:m,d:d,h:23,mi:mi,note:'早子时：23时仍归当日'}; }
  return {y:y,m:m,d:d,h:h,mi:mi,note:''};
}

/* 年界口径：立春换年（子平主流，lunar 默认）、春节换年（农历正月初一）、冬至换年（斗建口径）。
   月日时柱与大运流年仍以节气为纲，年界只改年柱；立春口径下落在立春后春节前另注两口径并存。 */
function yearGZOf(lunar, yearAxis, baseGZ){
  if(yearAxis === 'chunjie'){
    var ly = lunar.getYearInGanZhi();
    if(ly !== baseGZ) return {gz:ly, note:'年界：春节换年，年柱取'+ly+'；月日时柱与大运流年仍以节气为纲'};
    return {gz:baseGZ, note:''};
  }
  if(yearAxis === 'dongzhi'){
    var dz = null;
    try{
      var tbl = lunar.getJieQiTable();
      var ds = lunar.getSolar();
      Object.keys(tbl).forEach(function(k){
        if(k.indexOf('冬至') < 0 && k !== 'DONG_ZHI') return;
        var dd = tbl[k];
        if(dd.getYear() < ds.getYear() || (dd.getYear() === ds.getYear() && (dd.getMonth() < ds.getMonth() || (dd.getMonth() === ds.getMonth() && dd.getDay() <= ds.getDay())))){
          if(!dz || dd.getJulianDay() > dz.getJulianDay()) dz = dd;
        }
      });
    }catch(e){ dz = null; }
    if(dz){
      var gy = dz.getYear() + 1;
      var gi = (((gy - 4) % 60) + 60) % 60;
      var gz = GAN.charAt(gi % 10) + ZHI.charAt(gi % 12);
      if(gz !== baseGZ) return {gz:gz, note:'年界：冬至换年，年柱取'+gz+'；月日时柱与大运流年仍以节气为纲'};
    }
    return {gz:baseGZ, note:''};
  }
  if(lunar.getYearInGanZhi() !== baseGZ) return {gz:baseGZ, note:'本日在立春后、春节前：年柱按立春取'+baseGZ+'，生肖按农历取，两口径并存'};
  return {gz:baseGZ, note:''};
}

/* 六亲定刻：以三主问答案合成考刻数，定位盘面时辰八刻中的一刻（0..7）。
 * fumuIdx 0..3；sibCount 1..8（8 人及以上记 8）；marryIdx 0..3。
 * 系数 5、3、7 与模 8 使各答案分量在八刻上近似均匀散布。
 * 传统考刻为逐刻验条（逐刻排条文与已知六亲事实比对，不合则进退一刻），
 * 本式为便用式快速定位，同源而异算，页面对此已披露。
 * 主问未答齐时返回 null。 */
function locateKe(fumuIdx, sibCount, marryIdx){
  if(fumuIdx == null || sibCount == null || marryIdx == null) return null;
  if(fumuIdx < 0 || fumuIdx > 3 || marryIdx < 0 || marryIdx > 3) return null;
  if(sibCount < 1 || sibCount > 8) return null;
  return (fumuIdx*5 + sibCount*3 + marryIdx*7) % 8;
}

/* 单刻起盘。
 * 入参：公历 y/m/d；钟面时辰起值 zhiH（23,1..21）；钟面刻序 ke（0..7）；性别 sex；
 *       opt 时刻与流派口径：
 *         sunMode 太阳时（true 真太阳时、mean 平太阳时、off 不校正，缺省 true）、
 *         lng 经度、ziMode 子时算法（late 晚子默认、early 早子）、feng 分金序 0..14、
 *         dst 夏令时（auto 缺省、on 强制折回、off 不折）、
 *         yearAxis 年界（lichun 缺省、chunjie、dongzhi）、
 *         qiYunSect 起运法（1 时辰折算缺省、2 分钟折算）、light 跳过大运（八刻表逐刻试算用）。
 * 链路与八字排盘页同序：钟面时刻 → 夏令时折算 → 真太阳时校正（对出生时刻的物理修正，先于日界）
 *       → adjustZiShi 在真太阳时刻上判定子时日界 → 定四柱；盘面时辰刻分同取校正后时刻所归。
 * 刻分参与总数：刻分序为刻序乘十五加分金序，直接作刻分修正数减一，与所选刻分一一对应。 */
function compute(y, m, d, zhiH, ke, sex, opt){
  opt = opt || {};
  var ziMode = (opt.ziMode === 'early') ? 'early' : 'late';
  var sunMode = (opt.sunMode === 'mean' || opt.sunMode === 'off') ? opt.sunMode : 'true';
  var dstMode = (opt.dst === 'on' || opt.dst === 'off') ? opt.dst : 'auto';
  var yearAxis = (opt.yearAxis === 'chunjie' || opt.yearAxis === 'dongzhi') ? opt.yearAxis : 'lichun';
  var qiYunSect = (opt.qiYunSect === 2) ? 2 : 1;
  var fengIn = (opt.feng == null || isNaN(opt.feng) || opt.feng < 0 || opt.feng > FENG_PER_KE-1) ? 0 : Math.floor(opt.feng);
  var keIn = (ke == null || isNaN(ke) || ke < 0 || ke > 7) ? 0 : Math.floor(ke);
  var lng = (opt.lng == null || !isFinite(opt.lng)) ? null : Number(opt.lng);
  var zhiIdxIn = zhiIdxOf(zhiH);
  var clockRange = absMinLabel(zhiH*60 + keIn*KE_MIN);

  /* 第一步 钟面时刻（刻分合成绝对分钟，子时后半刻顺推至次日） */
  var ck = clockOf(y, m, d, zhiH, keIn, fengIn);

  /* 第二步 夏令时折算（1986 年至 1991 年夏令时段钟面较标准时快一小时） */
  var sy = ck.y, sm = ck.m, sd = ck.d, sh = ck.h, smi = ck.mi;
  var dstApplied = false, dstAmbiguous = false, dstNote = '';
  if(typeof applyDstCorrection === 'function'){
    var ds = applyDstCorrection(sy, sm, sd, sh, smi, dstMode);
    dstApplied = !!ds.applied; dstAmbiguous = !!ds.ambiguous; dstNote = ds.note || '';
    if(ds.applied){ sy = ds.y; sm = ds.m; sd = ds.d; sh = ds.h; smi = ds.mi; }
  }

  /* 第三步 真太阳时校正（对出生时刻的物理修正，先于子时日界） */
  var ty = sy, tm = sm, td = sd, th = sh, tmi = smi;
  var usedTrue = false, adj = 0, adjE = 0, adjLng = 0;
  if(sunMode !== 'off' && lng != null && typeof trueSolarTime === 'function' && isFinite(lng)){
    var ts = trueSolarTime(sy, sm, sd, sh, smi, lng, sunMode === 'mean' ? 'mean' : 'true');
    usedTrue = true; adj = ts.totalAdj; adjE = ts.E; adjLng = ts.lngAdj;
    ty = ts.y; tm = ts.m; td = ts.d; th = ts.h; tmi = ts.mi;
  }

  /* 第四步 子时日界在真太阳时刻上判定（与八字排盘页一致） */
  var adjust = (typeof adjustZiShi === 'function') ? adjustZiShi : _adjustZiShi;
  var pre = adjust(ty, tm, td, th, tmi, ziMode);
  var py = pre.y, pm = pre.m, pd = pre.d, ph = pre.h, pmi = pre.mi;
  var ziNote = pre.note || '';
  var inZi = function(h){ return h===23 || h===0; };
  if(usedTrue){
    /* 校正后跨日界：提示日柱归向 */
    var _dd = Math.round((Date.UTC(ty, tm-1, td) - Date.UTC(sy, sm-1, sd)) / 86400000);
    if(_dd !== 0) ziNote = (ziNote ? ziNote + '；' : '') + '真太阳时校正后时刻跨日，日柱归' + (_dd > 0 ? '次' : '前') + '日';
    /* 校正把时刻送入或送出子时窗口则时辰随之而变，如实提示 */
    if(inZi(sh) !== inZi(ph)) ziNote = (ziNote ? ziNote + '；' : '') + '真太阳时校正后时刻' + (inZi(ph) ? '落入' : '脱离') + '子时窗口，时辰按校正后取';
  }
  /* 早子时 23 点：时柱按当日日干五鼠遁子 */
  var earlyOverride = (ziMode === 'early' && ph === 23);

  /* 第五步 盘面时辰刻分：取校正后时刻所归；考刻采用某刻时按 panKe 覆盖刻、按 panFeng 覆盖分金 */
  var zk = zhiKeOfAbsMin(ph*60 + pmi);
  var keOut = (opt.panKe != null && !isNaN(opt.panKe) && opt.panKe >= 0 && opt.panKe <= 7) ? Math.floor(opt.panKe) : zk.ke;
  var fengOut = (opt.panFeng != null && !isNaN(opt.panFeng) && opt.panFeng >= 0 && opt.panFeng <= FENG_PER_KE-1) ? Math.floor(opt.panFeng) : (pmi % KE_MIN);

  var solar = Solar.fromYmdHms(py, pm, pd, ph, pmi, 0);
  var lunar = solar.getLunar();
  var ec = lunar.getEightChar();
  var gz = [ec.getYear(), ec.getMonth(), ec.getDay(), earlyOverride ? wuShuDunZi(ec.getDayGan()) : ec.getTime()];
  var ygz = yearGZOf(lunar, yearAxis, gz[0]);
  gz[0] = ygz.gz;
  var ny = [ec.getYearNaYin(), ec.getMonthNaYin(), ec.getDayNaYin(), earlyOverride ? null : ec.getTimeNaYin()];
  if(earlyOverride && typeof nayinOf === 'function'){ ny[3] = nayinOf(gz[3]); }
  if(ygz.note.indexOf('年界：') === 0 && typeof nayinOf === 'function'){ ny[0] = nayinOf(gz[0]); }
  var LB = ['年柱','月柱','日柱','时柱'];
  var pillars = [], ganSum = 0, zhiSum = 0;
  for(var i=0;i<4;i++){
    var g = TX_GAN[gz[i].charAt(0)], z = TX_ZHI[gz[i].charAt(1)];
    ganSum += g; zhiSum += z;
    pillars.push({label:LB[i], gz:gz[i], nayin:ny[i], txGan:g, txZhi:z, txSum:g+z});
  }
  var total = ganSum + zhiSum;
  var keSeq = keOut*FENG_PER_KE + fengOut;
  var keFix = keSeq + 1;
  var H = total + keFix;
  var bagua = BAGUA[keOut];

  /* 大运框架：EightChar.getYun(gender, sect)，性别 1 男 0 女，sect 1 时辰折算、2 分钟折算 */
  var dayun = null;
  if(opt.light){ dayun = null; }
  else{
  try{
    var yun = ec.getYun(sex === '男' ? 1 : 0, qiYunSect);
    var dys = yun.getDaYun(9);
    var steps = [];
    for(var j=0;j<dys.length;j++){
      var dy = dys[j];
      if(j < 1) continue; /* 首段为起运前幼年，不入八步 */
      steps.push({
        i: j,
        gz: dy.getGanZhi(),
        startAge: dy.getStartAge(), endAge: dy.getEndAge(),
        startYear: dy.getStartYear(), endYear: dy.getEndYear()
      });
    }
    dayun = {
      forward: yun.isForward(),
      ageYears: yun.getStartYear(),
      ageMonths: yun.getStartMonth(),
      ageDays: yun.getStartDay(),
      sect: qiYunSect,
      steps: steps
    };
  }catch(e){ dayun = {forward:true, ageYears:null, ageMonths:null, ageDays:null, sect:qiYunSect, steps:[], err:String(e && e.message || e)}; }
  }

  return {
    Y:py, M:pm, D:pd, h:ph, mi:pmi,
    zhiH: zk.zhiH, zhiIdx: zk.zhiIdx,
    zhiName: ZHI[zk.zhiIdx], keName: KE_NAMES[keOut],
    ke: keOut, feng: fengOut,
    keRange: absMinLabel(zk.zhiH*60 + keOut*KE_MIN),
    keSeq: keSeq, keFix: keFix, bagua: bagua,
    /* 钟面侧：用户所选时辰刻分与其钟点窗，供页面并示 */
    clockZhiH: zhiH, clockZhiIdx: zhiIdxIn, clockKe: keIn, clockFeng: fengIn,
    clockZhiName: ZHI[zhiIdxIn], clockKeName: KE_NAMES[keIn], clockRange: clockRange,
    clockY: ck.y, clockM: ck.m, clockD: ck.d, clockH: ck.h, clockMi: ck.mi, dayShift: ck.dayShift,
    ziMode: ziMode, ziNote: ziNote, earlyOverride: earlyOverride,
    sunMode: sunMode, usedTrue: usedTrue, adj: adj, adjE: adjE, adjLng: adjLng, lng: lng,
    dstMode: dstMode, dstApplied: dstApplied, dstAmbiguous: dstAmbiguous, dstNote: dstNote,
    yearAxis: yearAxis, yearNote: ygz.note,
    solar: solar, lunar: lunar, ec: ec,
    pillars: pillars, ganSum: ganSum, zhiSum: zhiSum, total: total,
    H: H,
    dayun: dayun,
    yearGZ: gz[0]
  };
}

/* 河洛理数起卦（邵雍先天数法，公开体系）：
 *   天数 G = 四柱天干太玄数和；地数 Z = 四柱地支太玄数和。
 *   先天上卦 = G 除八取余（余 0 作 8），先天下卦 = Z 除八取余，皆以先天八卦数配卦；
 *   元堂（动爻）= (G+Z) 除六取余（余 0 作 6），自下而上数爻；
 *   洛书后天数：每卦另有洛书数（乾六、兑七、离九、震三、巽四、坎一、艮八、坤二）。
 * 返回纯数字框架，卦名与卦辞由页面层依 gua.js（先天数配卦、京房世应）与 tieban-hegu.js（易经卦辞）解析。 */
function heLuoPan(G, Z){
  var xs = (G % 8) || 8;                 /* 先天上卦数 1..8 */
  var xx = (Z % 8) || 8;                 /* 先天下卦数 1..8 */
  var dong = ((G + Z) % 6) || 6;         /* 元堂（动爻）1..6 */
  var ls = LUOSHU_NUM[XIAN_NAME[xs-1]] || 1;  /* 上卦洛书数 */
  var lx = LUOSHU_NUM[XIAN_NAME[xx-1]] || 1;  /* 下卦洛书数 */
  return {tian:G, di:Z, total:G+Z, xianShang:xs, xianXia:xx, dong:dong, ls:ls, lx:lx};
}

/* 条文抽演：catKey 类目；key 六亲过滤键（可为 null）；nth 第几条（1..3）
 * 返回 {t,b,no,catName,idx,poolLen}；no 为全库统一序号（tiaowen 装载时赋号） */
function pickText(catKey, H, key, nth){
  var T = window.TIEBAN_TIAOWEN;
  var cat = T && T.cats && T.cats[catKey];
  if(!cat || !cat.items || !cat.items.length) return null;
  var pool = cat.items;
  if(key){
    var f = [];
    for(var i=0;i<pool.length;i++) if(pool[i].k === key) f.push(pool[i]);
    if(f.length) pool = f;
  }
  var seed = ((H % 100003) * 7919 + nth * 104729 + 20011) % 100003;
  var idx = seed % pool.length;
  var it = pool[idx];
  return {t:it.t, b:it.b, no:it.no || (idx+1), catName:cat.name, idx:idx, poolLen:pool.length};
}

/* 大运/流年条文：以干支太玄数与岁次作种子 */
function pickStepText(catKey, gz, seedNum, nth){
  var T = window.TIEBAN_TIAOWEN;
  var cat = T && T.cats && T.cats[catKey];
  if(!cat || !cat.items || !cat.items.length) return null;
  var base = txOf(gz) * 131 + (seedNum % 97) * 17;
  var seed = ((base % 100003) * 7919 + nth * 104729 + 20011) % 100003;
  var idx = seed % cat.items.length;
  var it = cat.items[idx];
  return {t:it.t, b:it.b, no:it.no || (idx+1), catName:cat.name};
}

window.Tieban = {
  version: '20261009tb6',
  GAN: GAN, ZHI: ZHI, TX_GAN: TX_GAN, TX_ZHI: TX_ZHI,
  BAGUA: BAGUA, KE_MIN: KE_MIN, FENG_PER_KE: FENG_PER_KE, KE_TOTAL: KE_TOTAL, KE_NAMES: KE_NAMES,
  FUMU_LABEL: FUMU_LABEL, MARRY_LABEL: MARRY_LABEL, CHILD_LABEL: CHILD_LABEL,
  FUMU_KEYS: ['both','father','mother','none'],
  MARRY_KEYS: ['unmarried','married','divorced','widowed'],
  txOf: txOf, keAbsMin: keAbsMin, zhiKeOfAbsMin: zhiKeOfAbsMin, clockOf: clockOf,
  zhiIdxOf: zhiIdxOf, locateKe: locateKe, heLuoPan: heLuoPan,
  compute: compute,
  pickText: pickText, pickStepText: pickStepText
};
})();
