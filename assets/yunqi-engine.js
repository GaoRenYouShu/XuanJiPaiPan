/* ============================================================
 * yunqi-engine.js：五运六气排盘算法（yunqi.html 专用，自包含）
 * ------------------------------------------------------------
 * 体例：依《黄帝内经·素问》运气七篇大论通行例，出处注于各表
 * 【定源】；YQ.selfTest() 集中校验全部锚点，任何修改后自检须
 * 全部通过方可发布。
 * 年界口径：流年干支取农历正月初一界（lunar.js 真源），与站内
 * 万年历、太岁页一致。
 * 依赖：lunar.js 全局 Solar/Lunar（取年干支、生肖、纳音）。
 * ============================================================ */
(function(global){
'use strict';

/* 【定源】《素问·天元纪大论》："甲己之岁，土运统之；乙庚之岁，金运统之；
 * 丙辛之岁，水运统之；丁壬之岁，木运统之；戊癸之岁，火运统之。" */
var YUN_HUA = {'甲':'土','己':'土','乙':'金','庚':'金','丙':'水','辛':'水','丁':'木','壬':'木','戊':'火','癸':'火'};
var YUN_HUA_TXT = {'甲':'甲己化土','己':'甲己化土','乙':'乙庚化金','庚':'乙庚化金','丙':'丙辛化水','辛':'丙辛化水','丁':'丁壬化木','壬':'丁壬化木','戊':'戊癸化火','癸':'戊癸化火'};
/* 阳干太过、阴干不及（《素问·天元纪大论》有余不足通行例） */
var YANG_GAN = {'甲':1,'丙':1,'戊':1,'庚':1,'壬':1};

/* 【定源】五音建运：《素问·金匮真言论》五脏音配（角木、徵火、宫土、商金、羽水）
 * 与《素问·五常政大论》五音建运太少相生通行例：阳干为太、阴干为少。 */
var WU_YIN = {'甲':'太宫','乙':'少商','丙':'太羽','丁':'少角','戊':'太徵','己':'少宫','庚':'太商','辛':'少羽','壬':'太角','癸':'少徵'};

/* 【定源】《素问·天元纪大论》："子午之岁，上见少阴；丑未之岁，上见太阴；
 * 寅申之岁，上见少阳；卯酉之岁，上见阳明；辰戌之岁，上见太阳；巳亥之岁，上见厥阴。" */
var SITIAN = {'子':'少阴君火','午':'少阴君火','丑':'太阴湿土','未':'太阴湿土','寅':'少阳相火','申':'少阳相火','卯':'阳明燥金','酉':'阳明燥金','辰':'太阳寒水','戌':'太阳寒水','巳':'厥阴风木','亥':'厥阴风木'};

/* 【定源】在泉对位：《素问·五运行大论》阴阳相反之位：少阴对阳明、太阴对太阳、少阳对厥阴 */
var ZAIQUAN = {'少阴君火':'阳明燥金','阳明燥金':'少阴君火','太阴湿土':'太阳寒水','太阳寒水':'太阴湿土','少阳相火':'厥阴风木','厥阴风木':'少阳相火'};

/* 【定源】《素问·六微旨大论》六气行之序，客气沿此环转衔接 */
var HUANXU = ['厥阴风木','少阴君火','太阴湿土','少阳相火','阳明燥金','太阳寒水'];

/* 【定源】《素问·六微旨大论》主气六步节气位："显明之右，君火之位也；君火之右，
 * 退行一步，相火治之；复行一步，土气治之；复行一步，金气治之；复行一步，
 * 水气治之；复行一步，木气治之。" 起止节气用通行例（《素问·六元正纪大论》六期分步）。 */
var ZHU_QI = [
  {bu:'初之气', qi:'厥阴风木', start:'大寒', end:'春分'},
  {bu:'二之气', qi:'少阴君火', start:'春分', end:'小满'},
  {bu:'三之气', qi:'少阳相火', start:'小满', end:'大暑'},
  {bu:'四之气', qi:'太阴湿土', start:'大暑', end:'秋分'},
  {bu:'五之气', qi:'阳明燥金', start:'秋分', end:'小雪'},
  {bu:'终之气', qi:'太阳寒水', start:'小雪', end:'大寒'}
];

/* 年支正五行（岁会判定用） */
var ZHI_WX = {'子':'水','亥':'水','寅':'木','卯':'木','巳':'火','午':'火','申':'金','酉':'金','辰':'土','戌':'土','丑':'土','未':'土'};

/* 主运五步 【定源】《素问·六元正纪大论》五音建运通行例，主运初运之太少由中运上推；
 * 《类经图翼·五音五运太少相生解》：凡甲乙丙壬癸五年皆以太角为初，丁戊己庚辛五年皆以少角为初；
 * 《类经图翼·各年五运交司时日》：初运大寒日、二运春分后十三日、三运芒种后十日、
 * 四运处暑后七日、五运立冬后四日。每步七十三日零五刻。 */
var ZHU_YUN_JIE = ['大寒','春分','芒种','处暑','立冬'];
var ZHU_YUN_OFFSET = [0, 13, 10, 7, 4];
/* 主气六步步界节气（与 ZHU_QI 的起止一致，供日期落步用） */
var ZHU_QI_JIE = ['大寒','春分','小满','大暑','秋分','小雪'];
var WU_YIN_XU = ['角','徵','宫','商','羽'];
var YIN_WX = {'角':'木','徵':'火','宫':'土','商':'金','羽':'水'};
var BU5 = ['初运','二运','三运','四运','终运'];

/* 主运五步：初运角，中运所值一步之太少与中运同，太少相生上推 */
function zhuYunOf(gz){
  var wuyin = WU_YIN[gz.charAt(0)];
  var tai0 = wuyin.charAt(0) === '太';
  var zi = WU_YIN_XU.indexOf(wuyin.charAt(1));
  var out = [];
  for (var i = 0; i < 5; i++){
    var tai = ((i - zi) % 2 === 0) ? tai0 : !tai0;
    out.push({ bu: BU5[i], yin: (tai ? '太' : '少') + WU_YIN_XU[i], wx: YIN_WX[WU_YIN_XU[i]] });
  }
  return out;
}

/* 客运五步：以中运（岁运五音）为初运，沿五音相生次序太少相生 */
function keYunOf(yunWuyin){
  var tai0 = yunWuyin.charAt(0) === '太';
  var idx = WU_YIN_XU.indexOf(yunWuyin.charAt(1));
  var out = [];
  for (var i = 0; i < 5; i++){
    var tai = (i % 2 === 0) ? tai0 : !tai0;
    var yin = WU_YIN_XU[(idx + i) % 5];
    out.push({ bu: BU5[i], yin: (tai ? '太' : '少') + yin, wx: YIN_WX[yin] });
  }
  return out;
}

/* 节气日真源：取该公历年的节气表 */
function jieQiOf(year, name){
  var t = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
  var s = t[name];
  if (!s) return null;
  return { y: s.getYear(), m: s.getMonth(), d: s.getDay(), ymd: s.toYmd(), name: name };
}

/* 步界日期：给定运气年与步界节气名，出 n+1 个界点（末界取次年大寒）；
   offsets 为各步界节气后的日数偏移（主运交司用），缺省即节气当日 */
function stepBounds(year, names, offsets){
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  var arr = [];
  for (var i = 0; i < names.length; i++){
    var jq = jieQiOf(year, names[i]);
    if (jq && offsets && offsets[i]){
      var dd = new Date(jq.y, jq.m - 1, jq.d + offsets[i]);
      jq = { y: dd.getFullYear(), m: dd.getMonth() + 1, d: dd.getDate(),
             ymd: dd.getFullYear() + '-' + pad(dd.getMonth() + 1) + '-' + pad(dd.getDate()), name: names[i] };
    }
    arr.push(jq);
  }
  arr.push(jieQiOf(year + 1, '大寒'));
  return arr;
}

/* 日期落步：返回 0 起序号，不在界内归 -1 */
function stepAt(dateStr, bounds){
  var p = String(dateStr).split('-').map(Number);
  if (p.length !== 3 || !isFinite(p[0]) || !isFinite(p[1]) || !isFinite(p[2])) return -1;
  var ms = new Date(p[0], p[1] - 1, p[2]).getTime();
  for (var i = 0; i < bounds.length - 1; i++){
    var a = bounds[i], b = bounds[i + 1];
    if (!a || !b) continue;
    var t0 = new Date(a.y, a.m - 1, a.d).getTime();
    var t1 = new Date(b.y, b.m - 1, b.d).getTime();
    if (ms >= t0 && ms < t1) return i;
  }
  return -1;
}

/* 时令落步：输入日期在运气年内的主气、客气、主运、客运步与客主加临 */
function stepInfo(dateStr, year){
  var p = compute(year);
  var qiB = stepBounds(year, ZHU_QI_JIE);
  var yunB = stepBounds(year, ZHU_YUN_JIE, ZHU_YUN_OFFSET);
  var iQi = stepAt(dateStr, qiB);
  var iYun = stepAt(dateStr, yunB);
  var zy = zhuYunOf(p.gz);
  var ky = keYunOf(p.yun.wuyin);
  return {
    qi: iQi >= 0 ? { i: iQi, bu: ZHU_QI[iQi].bu, zhu: p.zhu[iQi].qi, ke: p.ke[iQi], start: qiB[iQi], end: qiB[iQi + 1] } : null,
    yun: iYun >= 0 ? { i: iYun, bu: zy[iYun].bu, zhu: zy[iYun], ke: ky[iYun], start: yunB[iYun], end: yunB[iYun + 1] } : null,
    jialin: iQi >= 0 ? p.jialin[iQi] : null
  };
}

/* 日期所在节气（含当日，取最近一个已至的节气） */
function jieQiNameOf(dateStr){
  var p = String(dateStr).split('-').map(Number);
  if (p.length !== 3 || !isFinite(p[0]) || !isFinite(p[1]) || !isFinite(p[2])) return '';
  var jq = Solar.fromYmd(p[0], p[1], p[2]).getLunar().getPrevJieQi(true);
  return jq && jq.getName ? jq.getName() : '';
}

var WX_SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
var WX_KE = {'木':'土','土':'水','水':'火','火':'金','金':'木'};

function qiWx(q){ return q.charAt(q.length-1); }

/* 年干支、生肖、纳音（lunar.js 真源，农历正月初一界；取年中点公历 6 月 1 日落位流年） */
function yearBase(year){
  if (typeof Solar === 'undefined') throw new Error('lunar.js 未加载');
  var l = Solar.fromYmd(year, 6, 1).getLunar();
  var gz = l.getYearInGanZhi();
  return { gz:gz, gan:gz.charAt(0), zhi:gz.charAt(1), sheng:l.getYearShengXiao(), nayin:l.getYearNaYin() };
}

/* 年界换算：给定公历日期与年界，返回该日期所属运气年的公历年（供 compute 取干支）。
   春节界取农历年，正月初一为岁首；立春界以立春为岁首，立春前归前一年。
   两界只在立春至春节之间的日期上分属两年，其余日期同归一年。 */
function yearOfDate(y, m, d, boundary){
  if (boundary === 'lichun'){
    var l = Solar.fromYmd(y, 6, 1).getLunar();
    var lc = l.getJieQiTable()['立春'];
    var lcMs = new Date(lc.getYear(), lc.getMonth() - 1, lc.getDay()).getTime();
    var dMs = new Date(y, m - 1, d).getTime();
    return dMs < lcMs ? y - 1 : y;
  }
  return Solar.fromYmd(y, m, d).getLunar().getYear();
}

/* 客主加临单步：客气、主气五行同气、相生、相克定关系与相得断语
 * 【定源】《素问·五运行大论》"相得则和，不相得则病"；客胜主为从、主胜客为逆
 * （《素问·至真要大论》），断语为通行归纳。 */
function jiaLinOne(zhu, ke){
  var wK = qiWx(ke), wZ = qiWx(zhu);
  if (wK === wZ){
    /* 二火君臣位 【定源】《素问·六微旨大论》"君位臣则顺，臣位君则逆"：
       君火临相火为君临臣而顺，相火临君火为臣居君位而逆（王冰注） */
    if (ke !== zhu){
      var keJun = ke.indexOf('少阴') === 0;
      return { zhu:zhu, ke:ke, rel: keJun ? '君临臣' : '臣临君', pan:'相得', du:'', note: keJun ? '君位臣，顺' : '臣位君，逆' };
    }
    return { zhu:zhu, ke:ke, rel:'同气', pan:'相得', du:'' };
  }
  if (WX_SHENG[wK] === wZ) return { zhu:zhu, ke:ke, rel:'客生主', pan:'相得', du:'' };
  if (WX_SHENG[wZ] === wK) return { zhu:zhu, ke:ke, rel:'主生客', pan:'相得', du:'' };
  if (WX_KE[wK] === wZ) return { zhu:zhu, ke:ke, rel:'客克主', pan:'不相得', du:'从（客胜主）' };
  return { zhu:zhu, ke:ke, rel:'主克客', pan:'不相得', du:'逆（主胜客）' };
}

/* 全盘计算：year 为公历年（1900-2100） */
function compute(year){
  var y = parseInt(year, 10);
  var b = yearBase(y);
  var yunWx = YUN_HUA[b.gan];
  var shuai = YANG_GAN[b.gan] ? '太过' : '不及';
  var sitian = SITIAN[b.zhi];
  var zaiquan = ZAIQUAN[sitian];
  /* 客气六步：司天居三之气、在泉居终之气，其余沿六气行之序环转衔接
   * 【定源】《素问·六微旨大论》"上下有位，左右有纪"通行排法：
   * 初之气为司天前二位，逐步顺行至终之气在泉。 */
  var s = HUANXU.indexOf(sitian);
  var ke = [];
  for (var i = 0; i < 6; i++){ ke.push(HUANXU[(s - 2 + i + 12) % 6]); }
  var jialin = [];
  for (var j = 0; j < 6; j++){ jialin.push(jiaLinOne(ZHU_QI[j].qi, ke[j])); }
  /* 运气同化 【定源】《素问·六微旨大论》："天符如何？……应天为天符……承岁为岁会……
   * 太一天符之会"，同天符、同岁会依《素问·六元正纪大论》太过不及下加在泉通行例。 */
  var tianFu = yunWx === qiWx(sitian);
  var suiHui = yunWx === ZHI_WX[b.zhi];
  var taiYi = tianFu && suiHui;
  var tongTianFu = shuai === '太过' && yunWx === qiWx(zaiquan);
  var tongSuiHui = shuai === '不及' && yunWx === qiWx(zaiquan);
  /* 交运时刻 【定源】《素问·六元正纪大论》常位大寒交运，太过之年先天十三日、不及之年后天十三日，通行例。
   * 具体公历日：大寒日自 lunar.js 节气表真源取，太过减十三日、不及加十三日。 */
  var dcSolar = '';
  try {
    var dc = Solar.fromYmd(y, 6, 1).getLunar().getJieQiTable()['大寒'];
    var dcMs = new Date(dc.getYear(), dc.getMonth() - 1, dc.getDay()).getTime();
    var jyDate = new Date(dcMs + (shuai === '太过' ? -13 : 13) * 86400000);
    dcSolar = Solar.fromYmd(jyDate.getFullYear(), jyDate.getMonth() + 1, jyDate.getDate()).toYmd();
  } catch (e) { dcSolar = ''; }
  var jiaoyun = (shuai === '太过' ? '先天：大寒前十三日' : '后天：大寒后十三日') + (dcSolar ? '，' + dcSolar + '交运' : '交运');
  /* 平气 【定源】《素问·五常政大论》通行归纳：运太过而被司天所抑、运不及而得岁支正五行相助，皆为平气；
   * 干德符（交运日干与年干相合）须逐日推算，本页未取。 */
  var pingTai = shuai === '太过' && WX_KE[qiWx(sitian)] === yunWx;
  var pingBu = shuai === '不及' && ZHI_WX[b.zhi] === yunWx;
  var pingqi = {
    hit: pingTai || pingBu,
    desc: pingTai ? '岁运' + yunWx + '太过，得司天' + sitian + '（' + qiWx(sitian) + '）所抑，抑而为平' :
          pingBu ? '岁运' + yunWx + '不及，得年支' + b.zhi + '（属' + ZHI_WX[b.zhi] + '）同气相助，助而为平' : ''
  };
  return {
    year: y, gz: b.gz, gan: b.gan, zhi: b.zhi, sheng: b.sheng, nayin: b.nayin,
    yun: { wx: yunWx, shuai: shuai, he: YUN_HUA_TXT[b.gan], yang: !!YANG_GAN[b.gan], wuyin: WU_YIN[b.gan], jiaoyun: jiaoyun },
    sitian: { name: sitian, wx: qiWx(sitian) },
    zaiquan: { name: zaiquan, wx: qiWx(zaiquan) },
    zhu: ZHU_QI,
    ke: ke,
    jialin: jialin,
    pingqi: pingqi,
    tonghua: {
      tianFu: { hit: tianFu, desc: tianFu ? '岁运' + yunWx + '与司天' + sitian + '（' + qiWx(sitian) + '）同气' : '' },
      suiHui: { hit: suiHui, desc: suiHui ? '岁运' + yunWx + '与年支' + b.zhi + '（属' + ZHI_WX[b.zhi] + '）同气' : '' },
      taiYi: { hit: taiYi, desc: taiYi ? '既天符又岁会，岁运' + yunWx + '与司天、年支三气同一' : '' },
      tongTianFu: { hit: tongTianFu, desc: tongTianFu ? '阳年岁运' + yunWx + '太过，与在泉' + zaiquan + '（' + qiWx(zaiquan) + '）同气' : '' },
      tongSuiHui: { hit: tongSuiHui, desc: tongSuiHui ? '阴年岁运' + yunWx + '不及，与在泉' + zaiquan + '（' + qiWx(zaiquan) + '）同气' : '' },
      any: tianFu || suiHui || taiYi || tongTianFu || tongSuiHui
    }
  };
}

/* YQ.selfTest()：集中校验全部【定源】锚点，任何修改后须全部通过 */
function selfTest(){
  var rs = []; var t = function(name, cond){ rs.push({ name: name, pass: !!cond }); };
  var eq = function(name, got, want){ t(name, JSON.stringify(got) === JSON.stringify(want)); };
  var p;
  /* 2024 甲辰：岁运土太过，司天太阳寒水，在泉太阴湿土；辰属土，岁会成立；
   * 阳年运土与在泉湿土同气，同天符成立 */
  p = compute(2024);
  eq('2024甲辰年干支', p.gz, '甲辰');
  eq('2024甲辰五音建运太宫', p.yun.wuyin, '太宫');
  eq('2024甲辰交运先天', p.yun.jiaoyun.indexOf('先天'), 0);
  var p88 = compute(1988);
  t('1988戊辰平气（火太过得司天寒水所抑）', p88.pingqi.hit);
  var p13 = compute(2013);
  t('2013癸巳平气（火不及得巳火相助）', p13.pingqi.hit);
  eq('2024甲辰岁运土太过', [p.yun.wx, p.yun.shuai], ['土', '太过']);
  eq('2024甲辰司天太阳寒水', p.sitian.name, '太阳寒水');
  eq('2024甲辰在泉太阴湿土', p.zaiquan.name, '太阴湿土');
  t('2024甲辰岁会成立', p.tonghua.suiHui.hit);
  t('2024甲辰同天符成立', p.tonghua.tongTianFu.hit);
  t('2024甲辰非天符', !p.tonghua.tianFu.hit);
  eq('2024甲辰客气初之气少阳相火', p.ke[0], '少阳相火');
  eq('2024甲辰客气二之气阳明燥金', p.ke[1], '阳明燥金');
  eq('2024甲辰客气三之气太阳寒水', p.ke[2], '太阳寒水');
  eq('2024甲辰客气终之气太阴湿土', p.ke[5], '太阴湿土');
  eq('2024甲辰终之气客克主不相得从', [p.jialin[5].pan, p.jialin[5].rel], ['不相得', '客克主']);
  eq('2024甲辰初之气主生客相得', [p.jialin[0].pan, p.jialin[0].rel], ['相得', '主生客']);
  /* 2026 丙午：岁运水太过，司天少阴君火，在泉阳明燥金，无同化 */
  p = compute(2026);
  eq('2026丙午岁运水太过', [p.yun.wx, p.yun.shuai], ['水', '太过']);
  eq('2026丙午司天少阴君火', p.sitian.name, '少阴君火');
  eq('2026丙午在泉阳明燥金', p.zaiquan.name, '阳明燥金');
  t('2026丙午无同化', !p.tonghua.tianFu.hit && !p.tonghua.suiHui.hit && !p.tonghua.taiYi.hit && !p.tonghua.tongTianFu.hit && !p.tonghua.tongSuiHui.hit);
  eq('2026丙午客气三之气少阴君火', p.ke[2], '少阴君火');
  eq('2026丙午客气终之气阳明燥金', p.ke[5], '阳明燥金');
  /* 1978 戊午：运火与司天君火同气为天符，午属火亦为岁会，二者并为太乙天符 */
  p = compute(1978);
  eq('1978戊午年干支', p.gz, '戊午');
  eq('1978戊午岁运火太过', [p.yun.wx, p.yun.shuai], ['火', '太过']);
  t('1978戊午天符成立', p.tonghua.tianFu.hit);
  t('1978戊午岁会成立', p.tonghua.suiHui.hit);
  t('1978戊午太乙天符成立', p.tonghua.taiYi.hit);
  /* 2021 辛丑：运水不及与在泉太阳寒水同气，同岁会成立；司天太阴湿土，非天符 */
  p = compute(2021);
  eq('2021辛丑年干支', p.gz, '辛丑');
  eq('2021辛丑岁运水不及', [p.yun.wx, p.yun.shuai], ['水', '不及']);
  eq('2021辛丑司天太阴湿土', p.sitian.name, '太阴湿土');
  t('2021辛丑同岁会成立', p.tonghua.tongSuiHui.hit);
  t('2021辛丑非天符', !p.tonghua.tianFu.hit);
  /* 2007 丁亥：运木与司天厥阴风木同气为天符；亥属水，非岁会 */
  p = compute(2007);
  t('2007丁亥天符成立', p.tonghua.tianFu.hit);
  t('2007丁亥非岁会', !p.tonghua.suiHui.hit);
  /* 1984 甲子：运土，司天少阴君火为火、子支属水，天符岁会皆不成立 */
  p = compute(1984);
  eq('1984甲子年干支', p.gz, '甲子');
  eq('1984甲子岁运土太过', [p.yun.wx, p.yun.shuai], ['土', '太过']);
  eq('1984甲子司天少阴君火', p.sitian.name, '少阴君火');
  t('1984甲子非天符', !p.tonghua.tianFu.hit);
  t('1984甲子非岁会', !p.tonghua.suiHui.hit);
  /* 2009 己丑：运土、司天湿土、丑属土，太乙天符；阴年不及，在泉太阳寒水不同气 */
  p = compute(2009);
  t('2009己丑太乙天符成立', p.tonghua.taiYi.hit);
  t('2009己丑非同岁会', !p.tonghua.tongSuiHui.hit);
  /* 年界换算：2026 春节 2-17、立春 2-4；2-10 在立春之后春节之前，两界分属两年；
   * 1-15 在立春之前，两界同归前一年 */
  eq('2026-02-10 春节界属乙巳', compute(yearOfDate(2026, 2, 10, 'chunjie')).gz, '乙巳');
  eq('2026-02-10 立春界属丙午', compute(yearOfDate(2026, 2, 10, 'lichun')).gz, '丙午');
  eq('2026-01-15 两界同属乙巳', [compute(yearOfDate(2026, 1, 15, 'chunjie')).gz, compute(yearOfDate(2026, 1, 15, 'lichun')).gz], ['乙巳', '乙巳']);
  /* 主运五步：初运太少由中运上推（甲乙丙壬癸太角起、丁戊己庚辛少角起） */
  eq('丙午主运五步', zhuYunOf('丙午').map(function(x){ return x.yin; }), ['太角', '少徵', '太宫', '少商', '太羽']);
  eq('乙巳主运五步', zhuYunOf('乙巳').map(function(x){ return x.yin; }), ['太角', '少徵', '太宫', '少商', '太羽']);
  eq('戊午主运五步', zhuYunOf('戊午').map(function(x){ return x.yin; }), ['少角', '太徵', '少宫', '太商', '少羽']);
  eq('庚申主运五步', zhuYunOf('庚申').map(function(x){ return x.yin; }), ['少角', '太徵', '少宫', '太商', '少羽']);
  /* 客运五步：丙午中运太羽起，沿五音相生太少相生 */
  eq('丙午客运五步', keYunOf('太羽').map(function(x){ return x.yin; }), ['太羽', '少角', '太徵', '少宫', '太商']);
  /* 时令落步：2026-10-16 在主气五之气、主运四运（少商），当日节气寒露 */
  var si = stepInfo('2026-10-16', 2026);
  eq('2026-10-16 主气五之气', si.qi && si.qi.bu, '五之气');
  eq('2026-10-16 主运四运少商', si.yun && [si.yun.bu, si.yun.zhu.yin], ['四运', '少商']);
  eq('2026-10-16 客运四运少宫', si.yun && si.yun.ke.yin, '少宫');
  eq('2026-10-16 当日节气寒露', jieQiNameOf('2026-10-16'), '寒露');
  /* 主运交司：春分后十三日、芒种后十日、处暑后七日、立冬后四日 */
  var yb = stepBounds(2026, ZHU_YUN_JIE, ZHU_YUN_OFFSET);
  eq('2026 主运二运起 04-02', yb[1] && yb[1].ymd, '2026-04-02');
  eq('2026 主运三运起 06-15', yb[2] && yb[2].ymd, '2026-06-15');
  eq('2026 主运四运起 08-30', yb[3] && yb[3].ymd, '2026-08-30');
  eq('2026 主运终运起 11-11', yb[4] && yb[4].ymd, '2026-11-11');
  /* 二火君臣位：丙午三之气客君火加主相火为君临臣，癸卯二之气客相火加主君火为臣临君 */
  var j1 = compute(2026).jialin[2], j2 = compute(2023).jialin[1];
  eq('丙午三之气二火君临臣', [j1.rel, j1.pan, j1.note], ['君临臣', '相得', '君位臣，顺']);
  eq('癸卯二之气二火臣临君', [j2.rel, j2.pan, j2.note], ['臣临君', '相得', '臣位君，逆']);
  return rs;
}

var API = { YUN_HUA: YUN_HUA, YUN_HUA_TXT: YUN_HUA_TXT, YANG_GAN: YANG_GAN, WU_YIN: WU_YIN, SITIAN: SITIAN,
  ZAIQUAN: ZAIQUAN, HUANXU: HUANXU, ZHU_QI: ZHU_QI, ZHI_WX: ZHI_WX, WX_SHENG: WX_SHENG, WX_KE: WX_KE,
  ZHU_YUN_JIE: ZHU_YUN_JIE, ZHU_QI_JIE: ZHU_QI_JIE, ZHU_YUN_OFFSET: ZHU_YUN_OFFSET, zhuYunOf: zhuYunOf, keYunOf: keYunOf,
  jieQiOf: jieQiOf, stepBounds: stepBounds, stepAt: stepAt, stepInfo: stepInfo, jieQiNameOf: jieQiNameOf,
  qiWx: qiWx, yearBase: yearBase, yearOfDate: yearOfDate, jiaLinOne: jiaLinOne, compute: compute, selfTest: selfTest };

if (typeof module !== 'undefined' && module.exports){ module.exports = API; }
global.YQ = API;
})(typeof window !== 'undefined' ? window : this);
