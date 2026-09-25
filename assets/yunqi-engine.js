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

/* 客主加临单步：客气、主气五行同气/相生/相克定关系与相得断语
 * 【定源】《素问·五运行大论》"相得则和，不相得则病"；客胜主为从、主胜客为逆
 * （《素问·至真要大论》），断语为通行归纳。 */
function jiaLinOne(zhu, ke){
  var wK = qiWx(ke), wZ = qiWx(zhu);
  if (wK === wZ) return { zhu:zhu, ke:ke, rel:'同气', pan:'相得', du:'' };
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
  /* 交运时刻 【定源】《素问·六元正纪大论》常位大寒交运，太过之年先天十三日、不及之年后天十三日，通行例。 */
  var jiaoyun = shuai === '太过' ? '先天：大寒前十三日交运' : '后天：大寒后十三日交运';
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
  return rs;
}

var API = { YUN_HUA: YUN_HUA, YUN_HUA_TXT: YUN_HUA_TXT, YANG_GAN: YANG_GAN, WU_YIN: WU_YIN, SITIAN: SITIAN,
  ZAIQUAN: ZAIQUAN, HUANXU: HUANXU, ZHU_QI: ZHU_QI, ZHI_WX: ZHI_WX, WX_SHENG: WX_SHENG, WX_KE: WX_KE,
  qiWx: qiWx, yearBase: yearBase, jiaLinOne: jiaLinOne, compute: compute, selfTest: selfTest };

if (typeof module !== 'undefined' && module.exports){ module.exports = API; }
global.YQ = API;
})(typeof window !== 'undefined' ? window : this);
