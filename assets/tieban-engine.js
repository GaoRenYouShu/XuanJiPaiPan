/* 铁板神数引擎
 * 依赖：Solar/Lunar（lunar.js）；真太阳时与子时日界调用本站八字体系
 *       （assets/bazi-data.js 的 trueSolarTime 与 adjustZiShi，全局函数；未加载时回落本地同源副本）。
 * 纯计算模块，不触碰 DOM。
 *
 * 体系口径：
 *  1 干支化数：太玄经数：甲己子午九、乙庚丑未八、丙辛寅申七、丁壬卯酉六、戊癸辰戌五、巳亥单四数。
 *  2 刻分：每时辰八刻，刻序 0..7 依次映射先天八卦数乾一至坤八，为刻修正数；刻下再分十五分金，分金序直加。
 *  3 皇极总数：四柱干支太玄数之和 + 刻修正数 + 分金序。同一时辰八刻四柱相同，唯刻修正数不同，故八刻各异。
 *  4 六亲定刻：考刻数 = (父母态序×5 + 手足数×3 + 婚姻态序×7) mod 8，在出生时辰八刻内定位正刻。
 *  5 条文抽演：以皇极总数为纲按类取条；条文编号为全库统一序号（tiaowen 库装载时顺序赋号）。
 *  6 大运：lunar.js EightChar 体系 getEightChar().getYun(gender,1)，性别定顺逆，十年一步。
 *  7 时刻链路与八字排盘页同序：真实钟点 → adjustZiShi 解子时日界 → 真太阳时校正 → 校正后重判子时 → 定四柱。 */
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
var KE_MIN = 15;
var KE_NAMES = ['初刻','一刻','二刻','三刻','四刻','五刻','六刻','七刻'];
var FUMU_LABEL = {'both':'父母双全','father':'先亡父','mother':'先亡母','none':'父母俱违'};
var MARRY_LABEL = {'unmarried':'未婚','married':'已婚','divorced':'离异','widowed':'丧偶'};
var CHILD_LABEL = {0:'无或迟得',1:'1 个',2:'2 个',3:'3 个',4:'4 个',5:'5 个及以上'};
/* 五鼠遁：日上起时（早子时 23 点时柱按当日日干遁子；与 bazi-data.js wuShuDun 同式，回落用） */
var WUSHU = {'甲':0,'乙':2,'丙':4,'丁':6,'戊':8,'己':0,'庚':2,'辛':4,'壬':6,'癸':8};

function txOf(gz){ return TX_GAN[gz.charAt(0)] + TX_ZHI[gz.charAt(1)]; }

/* 时辰起值 23,1,3..21 与刻序 0..7 → 当日钟点绝对分钟（子时窗 23:00..00:59，后者为所选当日凌晨） */
function keAbsMin(zhiH, ke){ return zhiH*60 + ke*KE_MIN; }

/* 由绝对分钟（0..1724）反推所属时辰起值与刻序 */
function zhiKeOfAbsMin(absMin){
  var h = Math.floor(absMin/60) % 24;
  var ziIdx = (h===23 || h===0) ? 0 : Math.ceil(h/2);   /* 0..11 */
  var start = (ziIdx===0) ? 23 : ziIdx*2 - 1;
  var ke = Math.floor(((absMin - start*60 + 1440) % 1440) / KE_MIN);
  if(ke > 7) ke = 7;
  return {zhiH:start, ke:ke, zhiIdx:ziIdx};
}

function absMinLabel(abs){
  var m1 = abs % 1440, m2 = (abs + KE_MIN) % 1440;
  return pad2(Math.floor(m1/60)) + ':' + pad2(m1%60) + '-' + pad2(Math.floor(m2/60)) + ':' + pad2(m2%60);
}
/* 时辰起值 → 时辰序 0..11 */
function zhiIdxOf(zhiH){ return zhiH === 23 ? 0 : (zhiH + 1) / 2; }

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
  if(h===0){ s = Solar.fromYmd(y,m,d).nextDay(1); return {y:s.getYear(),m:s.getMonth(),d:s.getDay(),h:0,mi:mi,note:'00时后归次日'}; }
  return {y:y,m:m,d:d,h:h,mi:mi,note:''};
}

/* 六亲定刻：以三主问答案合成考刻数，定位本时辰八刻中的一刻（0..7）。
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
 * 入参：公历 y/m/d；时辰起值 zhiH（23,1..21）；刻序 ke（0..7）；性别 sex；
 *       useTrue 是否真太阳时；lng 经度；ziMode 子时算法（late 晚子默认 / early 早子）；
 *       feng 分金序 0..14（一刻十五分金，每分金一分钟，缺省 0）。
 * 链路与八字排盘页同序：真实钟点 → adjustZiShi 解子时日界 → 真太阳时校正 → 校正后重判子时 → 定四柱。 */
function compute(y, m, d, zhiH, ke, sex, useTrue, lng, ziMode, feng){
  ziMode = (ziMode === 'early') ? 'early' : 'late';
  feng = (feng == null || isNaN(feng) || feng < 0 || feng > 14) ? 0 : feng;
  var abs = keAbsMin(zhiH, ke) + feng;
  var minute = abs % 1440;
  var hh = Math.floor(minute/60), mm = minute % 60;
  var keRange = absMinLabel(keAbsMin(zhiH, ke));
  var inZi = function(h){ return h===23 || h===0; };
  var adjust = (typeof adjustZiShi === 'function') ? adjustZiShi : _adjustZiShi;
  var ziIdx = zhiIdxOf(zhiH);

  /* 第一步：子时日界（先于真太阳时，与八字页一致） */
  var pre = adjust(y, m, d, hh, mm, ziMode);
  var py = pre.y, pm = pre.m, pd = pre.d, ph = pre.h, pmi = pre.mi;
  var ziNote = pre.note || '';
  /* 第二步：真太阳时校正 */
  var usedTrue = false, adj = 0, adjE = 0, adjLng = 0;
  if(useTrue && lng != null && typeof trueSolarTime === 'function' && isFinite(lng)){
    var ts = trueSolarTime(py, pm, pd, ph, pmi, lng);
    usedTrue = true; adj = ts.totalAdj; adjE = ts.E; adjLng = ts.lngAdj;
    /* 第三步：校正后脱离/进入子时窗口则重判日界（与 bazi-app.js 同口径） */
    if(inZi(pre.h) !== inZi(ts.h)){
      var re = adjust(ts.y, ts.m, ts.d, ts.h, ts.mi, ziMode);
      py = re.y; pm = re.m; pd = re.d; ph = re.h; pmi = re.mi;
      ziNote = (ziNote ? ziNote + '；' : '') + re.note + '（校正后重判）';
    }else{
      py = ts.y; pm = ts.m; pd = ts.d; ph = ts.h; pmi = ts.mi;
    }
  }
  /* 早子时 23 点：时柱按当日日干五鼠遁子 */
  var earlyOverride = (ziMode === 'early' && ph === 23);

  var solar = Solar.fromYmdHms(py, pm, pd, ph, pmi, 0);
  var lunar = solar.getLunar();
  var ec = lunar.getEightChar();
  var gz = [ec.getYear(), ec.getMonth(), ec.getDay(), earlyOverride ? wuShuDunZi(ec.getDayGan()) : ec.getTime()];
  var ny = [ec.getYearNaYin(), ec.getMonthNaYin(), ec.getDayNaYin(), earlyOverride ? null : ec.getTimeNaYin()];
  if(earlyOverride && typeof nayinOf === 'function'){ ny[3] = nayinOf(gz[3]); }
  var LB = ['年柱','月柱','日柱','时柱'];
  var pillars = [], ganSum = 0, zhiSum = 0;
  for(var i=0;i<4;i++){
    var g = TX_GAN[gz[i].charAt(0)], z = TX_ZHI[gz[i].charAt(1)];
    ganSum += g; zhiSum += z;
    pillars.push({label:LB[i], gz:gz[i], nayin:ny[i], txGan:g, txZhi:z, txSum:g+z});
  }
  var total = ganSum + zhiSum;
  var keFix = ke + 1;
  var bagua = BAGUA[ke];
  var H = total + keFix + feng;

  /* 大运框架：EightChar.getYun(gender,1)，性别 1 男 0 女，sect=1 按 3 日折 1 年传统法 */
  var dayun = null;
  try{
    var yun = ec.getYun(sex === '男' ? 1 : 0, 1);
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
      steps: steps
    };
  }catch(e){ dayun = {forward:true, ageYears:null, ageMonths:null, ageDays:null, steps:[], err:String(e && e.message || e)}; }

  var trueZk = zhiKeOfAbsMin(ph*60 + pmi);

  return {
    Y:py, M:pm, D:pd, h:ph, mi:pmi,
    zhiH: zhiH, ke: ke, feng: feng,
    zhiName: ZHI[ziIdx], keName: KE_NAMES[ke],
    keRange: keRange,
    trueZhiName: ZHI[trueZk.zhiIdx], trueKeName: KE_NAMES[trueZk.ke],
    ziMode: ziMode, ziNote: ziNote, earlyOverride: earlyOverride,
    usedTrue: usedTrue, adj: adj, adjE: adjE, adjLng: adjLng,
    solar: solar, lunar: lunar,
    pillars: pillars, ganSum: ganSum, zhiSum: zhiSum, total: total,
    keFix: keFix, bagua: bagua, H: H,
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
var XIAN_NAME = ['乾','兑','离','震','巽','坎','艮','坤'];

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
  version: '20260917tb5',
  GAN: GAN, ZHI: ZHI, TX_GAN: TX_GAN, TX_ZHI: TX_ZHI,
  BAGUA: BAGUA, KE_MIN: KE_MIN, KE_NAMES: KE_NAMES,
  FUMU_LABEL: FUMU_LABEL, MARRY_LABEL: MARRY_LABEL, CHILD_LABEL: CHILD_LABEL,
  FUMU_KEYS: ['both','father','mother','none'],
  MARRY_KEYS: ['unmarried','married','divorced','widowed'],
  txOf: txOf, keAbsMin: keAbsMin, zhiKeOfAbsMin: zhiKeOfAbsMin,
  zhiIdxOf: zhiIdxOf, locateKe: locateKe, heLuoPan: heLuoPan,
  compute: compute,
  pickText: pickText, pickStepText: pickStepText
};
})();
