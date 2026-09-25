/* 太乙神数 权威推算引擎
 * 依据开源参考 kentang2017/kintaiyi（太乙统宗积年体系）忠实移植：
 *  - 局数 k = 积年 % 72（或 72）
 *  - 年计、月计、日计恒为阳遁（仅时计、分计依冬至夏至定阴阳遁）
 *  - 太乙落八卦宫：taiyi_pai[k]
 *  - 文昌(天目)落十六宫：skyeyes_dict[阴阳][k]
 *  - 始击(客目)落十六宫：sf_list[k]
 *  - 计神：依阴阳遁 + 太岁
 *  - 主算、客算：home_cal / away_cal（按间辰、对宫分支）
 *  - 主客大将、参将：find_cal 表
 *  - 格局：skyeyes_summary[阴阳][k]
 *  - 十神（君基、臣基、民基、四神、天乙、地乙、直符、飞符）与五福
 * 说明：太乙积年、局数有多种传承（太乙统宗、金镜、淘金歌、太乙局），本引擎采用太乙统宗体系
 *       （taiyi_acumyear=0），结果为教学性重建，供研习参考。
 */
window.Taiyi = (function () {
  'use strict';
  const ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const diZhi = ZHI.split('');
  const diZhiRev = diZhi.slice().reverse();
  const sum = a => a.reduce((x, y) => x + y, 0);
  function newList(arr, o) { const i = arr.indexOf(o); return arr.slice(i).concat(arr.slice(0, i)); }

  // 数字转中文（1..72）
  const CN = '零一二三四五六七八九';
  function num2cn(n) {
    if (n <= 0) return '零';
    if (n < 20) return n === 10 ? '十' : (n < 10 ? CN[n] : '十' + CN[n - 10]);
    if (n < 100) { const t = Math.floor(n / 10), o = n % 10; return (t === 1 ? '十' : CN[t] + '十') + (o ? CN[o] : ''); }
    return '' + n;
  }

  // ===== 配置表（据太乙典籍与通行排法校录）=====
  const tndict = { 0: 10153917, 1: 1936557, 2: 10154193, 3: 10153917 };
  const TAIYI_METHODS = ['太乙统宗', '太乙金镜', '太乙淘金歌', '太乙局'];
  const taiyi_pai = '乾乾乾午午午艮艮艮卯卯卯酉酉酉坤坤坤子子子巽巽巽乾乾乾午午午艮艮艮卯卯卯酉酉酉坤坤坤子子子巽巽巽乾乾乾午午午艮艮艮卯卯卯酉酉酉坤坤坤子子子巽巽巽';
  const sf_list = '坤戌亥丑寅辰巳坤酉乾丑寅辰午坤酉亥子艮辰巳未申戌亥艮卯巽未申戌子艮卯巳午坤戌亥丑寅辰巳坤酉乾丑寅辰午坤酉亥子艮辰巳未申戌亥艮卯巽未申戌子艮卯巳午';
  const skyeyes_dict = {
    '阳': '申酉戌乾乾亥子丑艮寅卯辰巽巳午未坤坤申酉戌乾乾亥子丑艮寅卯辰巽巳午未坤坤申酉戌乾乾亥子丑艮寅卯辰巽巳午未坤坤申酉戌乾乾亥子丑艮寅卯辰巽巳午未坤坤',
    '阴': '寅卯辰巽巽巳午未坤申酉戌乾亥子丑艮艮寅卯辰巽巽巳午未坤申酉戌乾亥子丑艮艮寅卯辰巽巽巳午未坤申酉戌乾亥子丑艮艮寅卯辰巽巽巳午未坤申酉戌乾亥子丑艮艮'
  };
  const skyeyes_summary = {
    '阳': ',始击击,,内迫,,,辰迫,,囚,,囚,,,,,,囚,囚,客挟,,,,,,,,囚,囚,始击击,,,始击击,始击掩,始击掩,,,,囚,辰迫,,客挟,客挟,囚,客挟,宫迫,,主挟，宫迫,辰迫,,,,主挟，辰迫,宫迫,宫迫,始击掩,,,,客挟,,,,,,主挟,辰击,,始击掩,始击击,始击击,囚,始击击'.split(','),
    '阴': ',内辰迫,外辰迫,内辰击,,,外宫迫,掩、辰迫,掩,掩、辰迫,掩、囚,内宫迫,内宫击,,,掩、外辰迫,掩,掩,,关客,关客,关客,,外宫击,,,外宫击,,,,内宫击,,关主,关客,,,外辰迫,掩,内辰迫,关客,内辰击,,掩,内辰迫,内宫迫,掩,外宫迫,外宫迫,外宫击,内宫击,,内辰迫,外辰击,掩,关主,,,外宫击,掩,内宫击,内宫迫,外宫击,,内宫击,,,,,,,,,'.split(',')
  };
  const num = [8, 3, 4, 9, 2, 7, 6, 1];
  const jc = '丑寅辰巳未申戌亥'.split('');
  const jc1 = '巽艮坤乾'.split('');
  const tyjc = [1, 3, 7, 9];
  const sixteen = '子丑艮寅卯辰巽巳午未坤申酉戌乾亥';
  const gong = { 子: 1, 丑: 2, 艮: 3, 寅: 4, 卯: 5, 辰: 6, 巽: 7, 巳: 8, 午: 9, 未: 10, 坤: 11, 申: 12, 酉: 13, 戌: 14, 乾: 15, 亥: 16 };
  const gong1 = '子丑艮寅卯辰巽巳午未坤申酉戌乾亥'.split('');
  const l_num = [8, 8, 3, 3, 4, 4, 9, 9, 2, 2, 7, 7, 6, 6, 1, 1];
  const four_god = '乾乾乾午午午艮艮艮卯卯卯中中中酉酉酉坤坤坤子子子巽巽巽巳巳巳申申申寅寅寅'.split('');
  const sky_yi = '酉酉酉坤坤坤子子子巽巽巽巳巳巳申申申寅寅寅乾乾乾午午午艮艮艮卯卯卯中中中'.split('');
  const earth_yi = '巽巽巽巳巳巳申申申寅寅寅乾乾乾午午午艮艮艮卯卯卯中中中酉酉酉坤坤坤子子子'.split('');
  const zhi_fu = '中中中酉酉酉坤坤坤子子子巽巽巽巳巳巳申申申寅寅寅乾乾乾午午午艮艮艮卯卯卯'.split('');
  const num2gongMap = { 1: '乾', 2: '午', 3: '艮', 4: '卯', 5: '中', 6: '酉', 7: '坤', 8: '子', 9: '巽' };
  const find_cal_yang = [[7,13,13],[6,1,1],[1,40,32],[25,17,10],[25,14,1],[25,10,12],[8,25,9],[1,22,3],[3,15,33],[1,12,25],[4,4,13],[37,1,4],[18,19,19],[10,9,9],[9,7,6],[1,33,26],[7,27,16],[7,26,11],[8,32,14],[7,26,2],[2,17,33],[16,30,1],[16,23,32],[16,17,23],[39,40,40],[32,31,31],[31,28,31],[14,9,38],[13,39,26],[10,32,17],[33,10,34],[25,8,24],[24,3,15],[26,4,11],[25,28,1],[25,27,36],[1,7,7],[6,35,35],[35,34,26],[27,19,12],[27,16,3],[27,12,34],[8,17,1],[23,14,32],[32,7,25],[5,16,29],[4,8,17],[1,5,8],[24,25,25],[16,15,15],[15,13,6],[39,31,24],[38,25,14],[38,24,9],[16,3,22],[15,34,10],[10,25,10],[12,26,27],[12,19,28],[12,13,19],[33,34,34],[26,25,25],[25,22,18],[16,11,7],[15,1,28],[12,34,19],[25,2,26],[17,8,16],[16,32,7],[30,4,15],[29,32,5],[29,31,9]];
  const find_cal_ying = [[5,29,7],[4,17,1],[1,16,30],[25,33,2],[25,30,1],[17,26,10],[2,3,3],[1,7,7],[7,33,27],[1,24,25],[6,26,19],[35,23,8],[12,37,12],[12,27,11],[11,25,4],[1,15,24],[3,9,16],[3,8,9],[14,16,16],[13,10,10],[10,1,39],[24,14,1],[24,7,40],[16,1,29],[31,16,32],[30,7,29],[29,4,26],[8,25,32],[7,15,26],[2,8,15],[27,28,28],[27,26,26],[26,18,15],[29,22,9],[25,10,1],[25,9,34],[1,25,3],[4,13,37],[37,12,26],[33,1,10],[33,38,9],[25,34,38],[2,1,1],[39,38,38],[38,31,25],[7,1,31],[6,32,25],[1,29,14],[16,1,17],[16,31,15],[15,29,4],[33,7,16],[32,1,8],[32,8,1],[16,18,18],[15,12,12],[12,3,1],[18,8,35],[18,1,34],[10,35,25],[27,22,28],[26,3,25],[25,4,12],[16,33,3],[15,23,34],[10,16,23],[25,26,26],[25,24,24],[24,16,13],[32,28,15],[31,16,7],[31,15,1]];

  // 计神 / 合神 映射
  const jigodMap = {}; { const r = newList(diZhiRev, '寅'); diZhi.forEach((z, i) => jigodMap[z] = r[i]); }
  const jigodMapR = {}; { const r = newList(diZhi, '酉'); diZhiRev.forEach((z, i) => jigodMapR[z] = r[i]); }
  const hegodMap = {}; { const r = newList(diZhiRev, '丑'); diZhi.forEach((z, i) => hegodMap[z] = r[i]); }

  // 太乙所在（0-9 数组）排列
  const arrangement = [].concat(...[0,1,2,3,4,5,6,7,8,9].map(x => [x,x,x]));
  const arrangementR = arrangement.slice().reverse();
  const tyYang = [].concat(...new Array(3).fill(arrangement.slice(3,15).concat(arrangement.slice(18,30))));
  const tyYin = [].concat(...new Array(3).fill(arrangementR.slice(0,12).concat(arrangementR.slice(15,29))));

  function daysSince19000619(y, m, d) {
    const a = Date.UTC(1900, 5, 19), b = Date.UTC(y, m - 1, d);
    return Math.round((b - a) / 86400000);
  }

  function accnum(jiStyle, tahun, lunarY, lunarM, lunarD, y, m, d) {
    const tnC = tndict[tahun];
    if (jiStyle === 0) return tnC + lunarY + (lunarY < 0 ? 1 : 0);
    if (jiStyle === 1) { const accyear = tnC + lunarY - 1 + (lunarY < 0 ? 2 : 0); return accyear * 12 + 2 + lunarM; }
    if (jiStyle === 2) { const diff = daysSince19000619(y, m, d); const cfg = 708011105 - ({ 0: 0, 1: 185, 2: 10153917, 3: 0 }[tahun]); return cfg + diff; }
    return 0;
  }

  // 时计（淘金歌时计捷法五子元）：以太乙日局数与时辰干支，依甲子/丙子/戊子/庚子/壬子五子加临定值时太乙之局。
  const GAN_ARR = '甲乙丙丁戊己庚辛壬癸'.split('');
  const ZHI_ARR = '子丑寅卯辰巳午未申酉戌亥'.split('');
  const WUZI = ['甲子', '丙子', '戊子', '庚子', '壬子'];
  const WUZI_JU = [1, 73, 145, 217, 289];
  function jiaZi60() {
    const out = [];
    for (let i = 0; i < 60; i++) out.push(GAN_ARR[i % 10] + ZHI_ARR[i % 12]);
    return out;
  }
  // 五子元：自各五子日（甲子/丙子/戊子/庚子/壬子）隔位加临日干支，推值时太乙局数。
  function wuZiYuan(taiyiju, hourGanZhi) {
    const ja = jiaZi60();
    try {
      const rows = WUZI.map((w, i) => {
        const start = ja.indexOf(w);
        const seq = [];
        for (let k = 0; k <= 71; k++) seq.push(ja[(start + 2 * k) % 60]);
        return { gz: seq[taiyiju - 1], ju: WUZI_JU[i] };
      });
      const hit = rows.find(r => r.gz === hourGanZhi);
      return hit ? { 局数: hit.ju, 五子: hit.gz } : { 局数: taiyiju, 五子: hourGanZhi };
    } catch (e) { return { 局数: taiyiju, 五子: hourGanZhi }; }
  }

  function kook(jiStyle, tahun, acc) {
    const k = acc % 72 || 72;
    const dun = (jiStyle === 0 || jiStyle === 1 || jiStyle === 2 || jiStyle === 5) ? '阳' : '阴';
    return { wen: dun + num2cn(k) + '局', shu: k, dun: dun, acc: acc };
  }

  function tyVal(jiStyle, tahun, acc) { const kk = kook(jiStyle, tahun, acc); return (kk.dun === '阳' ? tyYang : tyYin)[kk.shu - 1]; }
  function tyGong(jiStyle, tahun, acc) { const kk = kook(jiStyle, tahun, acc); return taiyi_pai[kk.shu - 1]; }
  function skyeyes(jiStyle, tahun, acc) { const kk = kook(jiStyle, tahun, acc); return skyeyes_dict[kk.dun][kk.shu - 1]; }
  function sf(jiStyle, tahun, acc) { const kk = kook(jiStyle, tahun, acc); return sf_list[kk.shu - 1]; }
  function skyeyesDes(jiStyle, tahun, acc) { const kk = kook(jiStyle, tahun, acc); return skyeyes_summary[kk.dun][kk.shu - 1] || ''; }

  // 定目（se）：文昌起，合数至太岁
  function se(jiStyle, tahun, acc, taishui) {
    const wc = skyeyes(jiStyle, tahun, acc), hg = hegod(jiStyle, taishui), ts = taishui;
    const start = newList(gong1, hg);
    return newList(gong1, wc)[start.slice(0, start.indexOf(ts) + 1).length - 1];
  }

  // 主算：自文昌（天目）数至太乙。文昌可显式给定（定计用改位之文昌）。
  function homeCalFrom(jiStyle, tahun, acc, wancheong) {
    const wcNumMap = {}; newList(sixteen.split(''), '亥').forEach((g, i) => wcNumMap[g] = l_num[i]);
    const wcNum = wcNumMap[wancheong];
    const taiyi = tyVal(jiStyle, tahun, acc);
    const wc_jc = jc.includes(wancheong) ? 1 : 0;
    const ty_jc = tyjc.includes(taiyi) ? 1 : 0;
    const wc_jc1 = jc1.includes(wancheong) ? 1 : 0;
    const wc_order = newList(num.slice(), wcNum);
    if (wc_jc === 1 && ty_jc !== 1 && wc_jc1 !== 1) return sum(wc_order.slice(0, wc_order.indexOf(taiyi))) + 1;
    if (wc_jc !== 1 && ty_jc !== 1 && wc_jc1 === 1) return sum(wc_order.slice(0, wc_order.indexOf(taiyi)));
    if (wc_jc !== 1 && ty_jc === 1 && wc_jc1 !== 1) return sum(wc_order.slice(0, wc_order.indexOf(taiyi)));
    if (wc_jc === 1 && ty_jc === 1 && wc_jc1 !== 1 && wc_jc === ty_jc && wc_jc1 === wc_jc) return sum(wc_order.slice(wc_order.indexOf(taiyi))) + 1;
    if (wc_jc === 1 && ty_jc === 1 && wc_jc1 !== 1 && wc_jc === ty_jc && wc_jc1 !== wc_jc) return sum(wc_order.slice(0, wc_order.indexOf(taiyi))) + 1;
    if (wc_jc === 1 && ty_jc === 1 && wc_jc1 !== 1 && wc_jc !== ty_jc) return sum(wc_order.slice(wc_order.indexOf(ty_jc))) + 1;
    if (wc_jc !== 1 && ty_jc === 1 && wc_jc1 === 1 && taiyi !== wc_order[wc_jc] && wc_jc1 !== wc_jc) return sum(wc_order.slice(0, wc_order.indexOf(taiyi)));
    if (wc_jc !== 1 && ty_jc === 1 && wc_jc1 === 1 && taiyi === wc_order[wc_jc] && wc_jc1 === wc_jc) return taiyi;
    if (wc_jc !== 1 && ty_jc !== 1 && wc_jc1 !== 1 && taiyi !== wcNum) return sum(wc_order.slice(0, wc_order.indexOf(taiyi)));
    if (wc_jc !== 1 && ty_jc !== 1 && wc_jc1 !== 1 && taiyi === wcNum) return taiyi;
    return taiyi;
  }

  function homeCal(jiStyle, tahun, acc) { return homeCalFrom(jiStyle, tahun, acc, skyeyes(jiStyle, tahun, acc)); }

  // 定计：以合神加太岁，取定目（文昌临处）为改位文昌，依主算法数至太乙。据《淘金歌》"主客定计"。
  function dingCal(jiStyle, tahun, acc, taishui) {
    return homeCalFrom(jiStyle, tahun, acc, se(jiStyle, tahun, acc, taishui));
  }

  function awayCal(jiStyle, tahun, acc) {
    const shiji = sf(jiStyle, tahun, acc);
    const sfNumMap = {}; newList(sixteen.split(''), '亥').forEach((g, i) => sfNumMap[g] = l_num[i]);
    const sfNum = sfNumMap[shiji];
    const taiyi = tyVal(jiStyle, tahun, acc);
    const sf_jc = jc.includes(shiji) ? true : false;
    const ty_jc = tyjc.includes(taiyi) ? true : false;
    const sf_jc1 = jc1.includes(shiji) ? true : false;
    const sf_order = newList(num.slice(), sfNum);
    const logic = {
      'true,false,false': () => (sf_jc === ty_jc ? sum(sf_order.slice(0, sf_order.indexOf(taiyi))) + 1 : sum(sf_order.slice(0, jc.indexOf(shiji) + 1)) + 1),
      'false,false,true': () => {
        if (sf_jc === ty_jc && 5 < taiyi && taiyi < 7) return sum(sf_order.slice(taiyi - 2));
        if (sf_jc === ty_jc && taiyi < 5) return sum(sf_order.slice(0, taiyi + 1));
        return sum(sf_order.slice(0, sf_order.indexOf(taiyi)));
      },
      'false,true,false': () => (sf_jc === ty_jc ? sum(sf_order.slice(sf_order.indexOf(taiyi))) : sum(sf_order.slice(0, ty_jc ? sf_order.indexOf(tyjc[0]) : sf_order.indexOf(taiyi)))),
      'true,true,false': () => (sf_jc === ty_jc ? sum(sf_order.slice(0, sf_order.indexOf(taiyi))) + 1 : sum(sf_order.slice(0, taiyi))),
      'false,true,true': () => sum(sf_order.slice(0, sf_order.indexOf(taiyi))),
      'false,false,false': () => (sfNum === taiyi ? taiyi : sum(sf_order.slice(0, sf_order.indexOf(taiyi))))
    };
    const key = [sf_jc, ty_jc, sf_jc1].toString();
    if (logic[key]) return logic[key]();
    return taiyi;
  }

  function findCal(dun, k) { return (dun === '阳' ? find_cal_yang : find_cal_ying)[k - 1]; }
  function homeGeneral(jiStyle, tahun, acc) {
    const kk = kook(jiStyle, tahun, acc); const fc = findCal(kk.dun, kk.shu); const hc = fc[0];
    const tru = homeCal(jiStyle, tahun, acc);
    if (hc < 10) return hc;
    if (hc % 10 === 0) return 1;
    if (hc < 20) return hc - 10;
    if (hc < 30) return hc - 20;
    if (hc < 40) return hc - 30;
    return tru;
  }
  function homeVgen(jiStyle, tahun, acc) { const g = homeGeneral(jiStyle, tahun, acc) * 3 % 10; return g === 0 ? 5 : g; }
  function awayGeneral(jiStyle, tahun, acc) {
    const kk = kook(jiStyle, tahun, acc); const fc = findCal(kk.dun, kk.shu); const ac = fc[1];
    const tru = awayCal(jiStyle, tahun, acc);
    if (ac === 1) return 1;
    if (ac < 10) return ac;
    if (ac % 10 === 0) return 5;
    if (ac < 20) return ac - 10;
    if (ac < 30) return ac - 20;
    if (ac < 40) return ac - 30;
    return tru;
  }
  function awayVgen(jiStyle, tahun, acc) { const g = awayGeneral(jiStyle, tahun, acc) * 3 % 10; return g === 0 ? 5 : g; }

  function hegod(jiStyle, taishui) { return hegodMap[taishui]; }
  function jigod(jiStyle, tahun, acc, taishui) { const kk = kook(jiStyle, tahun, acc); return kk.dun === '阳' ? jigodMap[taishui] : jigodMapR[taishui]; }

  // 十神
  // 君基：起午宫顺行十二辰，三十年一移，三百六十年一周
  function kingbase(acc) { return newList(diZhi, '午')[Math.floor((acc - 1) % 360 / 30) % 12]; }
  // 臣基：起午宫顺行十二辰，三年一移，三十六年一周
  function officerbase(acc) { return newList(diZhi, '午')[Math.floor((acc - 1) % 360 % 36 / 3) % 12]; }
  // 民基：起戌宫顺行十二辰，一年一移，十二年一周
  function pplbase(acc) { return newList(diZhi, '戌')[(acc - 1) % 360 % 12]; }
  function fgd(acc, k) { return four_god[(k - 1) % 36]; }
  function skyyi(acc, k) { return sky_yi[(k - 1) % 36]; }
  function earthyi(acc, k) { return earth_yi[(k - 1) % 36]; }
  function zhifu(acc, k) { return zhi_fu[(k - 1) % 36]; }
  function flyfu(acc) { const fly = Math.floor((acc % 360 % 36) / 3); const r = newList(diZhi, '辰'); return r[fly - 1] || '中'; }
  // 五福：起乾宫，按乾、艮、巽、坤、中之序行宫，四十五年一移，二百二十五年一周
  const WUFU_GONG = ['乾', '艮', '巽', '坤', '中'];
  function wufu(acc) { return WUFU_GONG[Math.floor((acc + 250) % 225 / 45) % 5]; }

  function num2gong(n) { return num2gongMap[n] || '中'; }

  // ===== 大游小游（据《太乙金镜式经》卷七、《太乙淘金歌》大游小游法）=====
  // 大游太乙：天地凶神，三十六载移一宫，起七宫顺数七、八、九、一、二、三、四、六，不入中五，288 年一周。
  //   宫序：坤、子、巽、乾、午、艮、卯、酉（对应九宫数 7、8、9、1、2、3、4、6）。
  //   以积年加宫盈差三十四对 288 取余，余数除以 36 取整得宫序，余数对 36 取余得入宫年数，十二年治天、十二年治地、十二年治人。
  // 大游天目：积年加二百一十四对 180 取余，余数对 18 取余得所在辰。
  // 小游太乙：三年一移，起一宫顺数一、二、三、四、六、七、八、九，不入中五，24 年一周，积年对 24 取余。
  //   宫序：乾、午、艮、卯、酉、坤、子、巽（对应九宫数 1、2、3、4、6、7、8、9）。
  const DAYOU_GONG = [7, 8, 9, 1, 2, 3, 4, 6];
  const XIAOYOU_GONG = [1, 2, 3, 4, 6, 7, 8, 9];
  const DAYOU_TM_PATH = ['未','坤','坤','申','酉','戌','乾','乾','亥','子','丑','艮','寅','卯','辰','巽','巳','午'];
  const DAYOU_XIONG = { 1: '不利于君王', 2: '不利于王侯臣宰', 3: '不利于后妃', 4: '不利于太子', 5: '不利于民', 6: '不利于师帅' };
  const XIAOYOU_BASE = '小游太乙主饥馑、兵革、水旱流亡';
  function bigyo(acc) {
    const by = (acc + 34) % 288;
    return DAYOU_GONG[Math.floor(by / 36) % 8];
  }
  function smyo(acc) {
    const sy = acc % 360 % 24;
    return XIAOYOU_GONG[Math.floor(sy / 3) % 8];
  }
  function bigyoTianmu(acc) {
    const rem = (acc + 214) % 180;
    const shenRem = rem % 18 || 18;
    const chen = DAYOU_TM_PATH[shenRem - 1];
    return { 落辰: chen, 入神年数: shenRem, 本象: '大游天目土神，巡行下土主威利访察；敷德惠、恤军民、纳规谏则无倾危，惰政黜忠、兴徭役则倾覆不旋踵' };
  }
  function dayouXiong(acc) {
    const by = (acc + 34) % 288;
    const years = by % 36 || 36;
    const cat = (years - 1) % 6 + 1;
    return { 入宫年数: years, 满宫: years === 36, 凶算: years < 36 ? years : 0, 凶算所主: years < 36 ? (DAYOU_XIONG[cat] || '') : '满三十六算，不论凶算' };
  }
  // 大游小游综合结果
  function dayouXiaoyou(acc) {
    const big = bigyo(acc), small = smyo(acc);
    const bg = num2gongMap[big] || '中', sg = num2gongMap[small] || '中';
    const dt = bigyoTianmu(acc), dx = dayouXiong(acc);
    return {
      大游宫: bg, 小游宫: sg,
      大游天目: dt, 大游凶算: dx,
      text: '大游太乙居' + bg + '宫（' + dx.凶算所主 + '），大游天目' + dt.落辰 + '辰（' + dt.本象 + '）；小游太乙居' + sg + '宫（' + XIAOYOU_BASE + '）。'
    };
  }

  // ===== 兵阵胜负（据《太乙金镜式经》卷十五五阵八阵、奇兵伏兵、五音风）=====
  // 五阵：算数个位对宫（1,8曲阵黑旗北方；3,7直阵青旗东方；4,9锐阵赤旗南方；2,5圆阵黄旗中央；6方阵白旗西方）。
  // 八阵：天地风云龙虎鸟蛇，起于五而终于八，握机居中。出乡：算数个位对出军方位。
  // 奇兵伏兵：天目始击为大杀之地，掩迫时宜隐伏。
  const ZHEN_RULES = [
    [[1, 8], '曲阵', '黑旗', '北方'], [[3, 7], '直阵', '青旗', '东方'],
    [[4, 9], '锐阵', '赤旗', '南方'], [[2, 5], '圆阵', '黄旗', '中央'],
    [[6], '方阵', '白旗', '西方']
  ];
  const BAZHEN = ['天', '地', '风', '云', '龙', '虎', '鸟', '蛇'];
  const CHUBING_XIANG = { 1: '西北', 2: '正南', 3: '东北', 4: '正东', 6: '正西', 7: '西南', 8: '正北', 9: '东南' };
  // 地支五音（卷十五）：子午宫、丑未寅申徵、卯酉羽、辰戌商、巳亥角
  const ZHI_WUYIN = { 子: '宫', 午: '宫', 丑: '徵', 未: '徵', 寅: '徵', 申: '徵', 卯: '羽', 酉: '羽', 辰: '商', 戌: '商', 巳: '角', 亥: '角' };
  const WUYIN_WX = { 宫: '土', 商: '金', 角: '木', 徵: '火', 羽: '水' };
  function calDigit(num) { const n = Number(num) || 0; if (n <= 0) return 1; const d = n % 10; return d === 0 ? 10 : d; }
  function zhenXing(num) {
    const d = calDigit(num);
    for (const [p, name, flag, dir] of ZHEN_RULES) if (p.indexOf(d) >= 0) return { 数位: d, 阵形: name, 旗色: flag, 方位: dir };
    return { 数位: d, 阵形: '依地形置阵', 旗色: '无定', 方位: '无定' };
  }
  // 兵阵胜负综合：主客算定阵形旗色与出乡，参奇兵伏兵、五音风（据日支）。
  function bingZhen(s) {
    const hz = zhenXing(s.homeCal), az = zhenXing(s.awayCal);
    const ho = CHUBING_XIANG[hz.数位] || '无定', ao = CHUBING_XIANG[az.数位] || '无定';
    const dayDun = s.jiStyle === 2 ? s.taishui : '';   // 日计才取日支定五音
    const dayYin = dayDun ? (ZHI_WUYIN[dayDun] || '') : '';
    let feng = '';
    if (dayYin) {
      feng = '日值' + dayYin + '音（' + WUYIN_WX[dayYin] + '），观风察将，五音风以知军之盛衰';
    }
    const yanpo = (s.pattern || '').indexOf('掩') >= 0 || (s.pattern || '').indexOf('迫') >= 0;
    const fu = yanpo ? '当下有掩迫之格，宜隐伏窃发以乘敌之隙' : '未有掩迫之时，宜陈兵整伍待掩迫之机方利设伏';
    return {
      主阵: hz, 客阵: az, 主出乡: ho, 客出乡: ao, 八阵: BAZHEN.slice(),
      主奇兵位: (s.wc || '') + '宫（天目文昌大杀之地）',
      客奇兵位: (s.sh || '') + '宫（始击大杀之地）',
      fu, feng,
      text: '主算' + s.homeCal + '宜布' + hz.阵形 + '（' + hz.旗色 + '、' + hz.方位 + '），出军向' + ho + '；客算' + s.awayCal + '宜布' + az.阵形 + '（' + az.旗色 + '、' + az.方位 + '），出军向' + ao + '。奇兵伏兵：' + fu + '。' + (dayYin ? feng + '。' : '')
    };
  }

  // ===== 长短数与不和数（据《太乙金镜式经》卷五"明数长短占缓急术"）=====
  // 算数>=16为长数，<16为短数；将吏兵备：算中含将(>=10或含0)、吏(含5)、兵(含1)则俱备。
  // 长数而将吏兵俱备为和，长而不备为不和；短数总为不和，百事皆忌。
  function jianBei(num) {
    const n = Number(num) || 0, s = String(n);
    const hasJiang = n >= 10 || s.indexOf('0') >= 0;
    const hasLi = s.indexOf('5') >= 0;
    const hasBing = s.indexOf('1') >= 0;
    const missing = [];
    if (!hasJiang) missing.push('无将');
    if (!hasLi) missing.push('无吏');
    if (!hasBing) missing.push('无兵');
    const full = !missing.length;
    const length = n >= 16 ? '长' : '短';
    let verdict;
    if (n >= 16) {
      verdict = full ? '箭长而和，将吏兵俱备，宜举百事' : '箭长而不和，' + missing.join('、') + '，不利兴师';
    } else {
      verdict = '箭短，' + (missing.join('、') || '将吏兵不具') + '，百事皆忌';
    }
    return { num: n, 长短: length, 和否: full ? '和' : '不和', 缺: missing, 断语: verdict };
  }
  // 主客长短数比较：同长短则势均，主长利主，客长利客。
  function changDuanShu(s) {
    const h = jianBei(s.homeCal), a = jianBei(s.awayCal);
    let cmp;
    if (h.长短 === a.长短) cmp = h.num === a.num ? '主客长短相当，旗鼓相当' : '算数长者胜';
    else if (h.长短 === '长') cmp = '主算长，利主';
    else cmp = '客算长，利客';
    return {
      主算: h, 客算: a,
      text: '主算' + s.homeCal + '为' + h.长短 + '数（' + h.断语 + '）；客算' + s.awayCal + '为' + a.长短 + '数（' + a.断语 + '）。综之，' + cmp + '。'
    };
  }

  // ===== 九宫分野（九州，据《太乙金镜式经》）=====
  // 太乙游九宫以应九州分野；太乙所临之宫主该州之灾祥休咎。
  const NINE_PALACE = [
    { n: 1, 宫: '乾', 方位: '西北', 州: '冀州、并州', 所主: '乾为天为天门，九州之首，主邦国元首、边陲兵戈', 灾祥: '太乙临此主北鄙兵动、君相有变' },
    { n: 2, 宫: '离', 方位: '正南', 州: '荆州', 所主: '离为明堂，人君居明堂审顺逆、察奸邪', 灾祥: '太乙临此主有兵戈狱讼、臣下相争' },
    { n: 3, 宫: '艮', 方位: '东北', 州: '青州', 所主: '艮为山，三阳交泰、万物咸成', 灾祥: '太乙临此主后宫之变、内廷不安' },
    { n: 4, 宫: '震', 方位: '正东', 州: '徐州', 所主: '震为雷，阳气壮盛、长男主器', 灾祥: '太乙临此主东鄙兵侵、长男主事之变' },
    { n: 5, 宫: '中', 方位: '中宫', 州: '无分野', 所主: '中为枢轴，斡旋八方，太乙行考治而不居', 灾祥: '太乙居中无分野可应' },
    { n: 6, 宫: '兑', 方位: '正西', 州: '雍州', 所主: '兑为泽，阴气敷施、万物有戕伤之兆', 灾祥: '太乙临此主西方兵革、禾稼有损' },
    { n: 7, 宫: '坤', 方位: '西南', 州: '梁州', 所主: '坤为地，阳化纯阴、阴气温舒', 灾祥: '太乙临此主西南州郡水旱、农事之忧' },
    { n: 8, 宫: '坎', 方位: '正北', 州: '兖州', 所主: '坎为水，坐坎朝离、上应紫微', 灾祥: '太乙临此主北鄙之患、大臣受诛之象' },
    { n: 9, 宫: '巽', 方位: '东南', 州: '扬州', 所主: '巽为风，天倾西北、地缺东南，乾健巽入', 灾祥: '太乙临此主东南州郡风旱、客兵来侵' }
  ];
  function ninePalace(tyGong) {
    const hit = NINE_PALACE.find(p => p.宫 === tyGong);
    return hit || { n: 5, 宫: '中', 方位: '中宫', 州: '无分野', 所主: '', 灾祥: '' };
  }

  // ===== 五行生克胜负（据《淘金歌》"定胜负"）=====
  // 八卦九宫五行：乾兑金、离火、震巽木、坎水、艮坤中土。二目（天目文昌、客目始击）所临宫五行定主客生克胜负。
  const GONG_WX = { 乾:'金', 兑:'金', 离:'火', 震:'木', 巽:'木', 坎:'水', 艮:'土', 坤:'土', 中:'土',
                    子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火', 午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水' };
  const WX_SHENG = { 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' };
  function wxCmp(a, b) { if (a === b) return '同'; if (WX_SHENG[a] === b) return '主生客'; if (WX_SHENG[b] === a) return '客生主'; return '主克客'; }
  // 五行生克胜负：主目（天目）克客目（客目）主军赢；客目克主目主不利；同音三阵平。兼参主客大将宫五行。
  function wuxingShengFu(s) {
    const zhuWx = GONG_WX[s.wc] || '土', keWx = GONG_WX[s.sh] || '土';
    const zjWx = GONG_WX[s.shen.主大] || '土', kjWx = GONG_WX[s.shen.客大] || '土';
    const v = wxCmp(zhuWx, keWx);
    let say, tag;
    if (v === '同') { say = `主客二目同临${zhuWx}气，同音相合，主客三阵势均力敌，和局之象`; tag = '平'; }
    else if (v === '主克客') { say = `主目（天目）${zhuWx}克客目（始击）${keWx}，主来克客，主军占胜势`; tag = '主胜'; }
    else if (v === '客生主') { say = `客目（始击）${keWx}生主目（天目）${zhuWx}，客气来生主，主方得助`; tag = '主得助'; }
    else { say = `客目（始击）${keWx}克主目（天目）${zhuWx}，客来克主，主方不利`; tag = '客克主'; }
    const jv = wxCmp(zjWx, kjWx);
    let jsay = '';
    if (s.shen.主大 !== '中' && s.shen.客大 !== '中') {
      if (jv === '同') jsay = `，主客大将同临${zjWx}气，将阵相当`;
      else if (jv === '主克客') jsay = `，主大将${zjWx}克客大将${kjWx}，主阵得胜`;
      else if (jv === '客生主') jsay = `，客大将${kjWx}生主大将${zjWx}，主阵得生助`;
      else jsay = `，客大将${kjWx}克主大将${zjWx}，主阵受制`;
    }
    return { tag, text: say + jsay + '。' };
  }

  // ===== 太乙八门（据《太乙统宗宝鉴》卷二《八门所主》、《太乙金镜式经》八门值事法）=====
  // 值使：积年对二百四十取余，三十年而易一门；八门自值使起，依太乙所行宫序（八三四九二七六一）顺布八宫，中宫无门。
  const DOOR = ['开', '休', '生', '伤', '杜', '景', '死', '惊'];
  const DOOR_INFO = {
    开: { 方位: '乾宫西北', 门名: '天启开门', 八风: '不周风', 所主: '宜远行拓土、所向通达，凡举百事皆吉', 吉凶: '大吉' },
    休: { 方位: '坎宫正北', 门名: '建章休门', 八风: '广莫风', 所主: '宜进贤聚众、安息休兵、收贮财宝，以北行战胜大获', 吉凶: '大吉' },
    生: { 方位: '艮宫东北', 门名: '物户生门', 八风: '调风', 所主: '宜拜将求贤、结和百群，征伐宜出东北', 吉凶: '大吉' },
    伤: { 方位: '震宫正东', 门名: '雷霆伤门', 八风: '民庶风', 所主: '主灾伤疾病，宜渔猎捕利，向东行道逢盗贼见血光', 吉凶: '大凶' },
    杜: { 方位: '巽宫东南', 门名: '耀武杜门', 八风: '清明风', 所主: '主闭塞固守安行，凡举百事皆凶', 吉凶: '大凶' },
    景: { 方位: '离宫正南', 门名: '赤帝景门', 八风: '景风', 所主: '主鬼怪遗亡，宜讲明理乱、犒劳将卒、突阵破围', 吉凶: '小吉' },
    死: { 方位: '坤宫西南', 门名: '审顺死门', 八风: '凉风', 所主: '主死丧奠埋，宜捕猎行刑，西南方不宜出兵', 吉凶: '大凶' },
    惊: { 方位: '兑宫正西', 门名: '武雷惊门', 八风: '阖阖风', 所主: '主惊恐奔走，宜掩捕攻击伏兵，凡百举事忧祸随之', 吉凶: '小凶' }
  };
  function eightDoorZhiShi(acc) {
    let a = acc % 240;
    if (a === 0) a = 120;
    let z = Math.floor(a / 30);
    if (z % 30 !== 0) z += 1; else if (z === 0) z = 1;
    return DOOR[z - 1] || DOOR[0];
  }
  function eightDoors(tyValNum, acc) {
    const zs = eightDoorZhiShi(acc);
    const doors = newList(DOOR.slice(), zs);
    const i = num.indexOf(tyValNum);
    const order = i < 0 ? num.slice() : num.slice(i).concat(num.slice(0, i));
    const dist = {};
    order.forEach((n, k) => dist[num2gong(n)] = doors[k]);
    return { zhiShi: zs, dist: dist };
  }

  // 十六宫各神将（年、月/日计通用）
  function sixteenGong(jiStyle, tahun, acc, taishui) {
    const kk = kook(jiStyle, tahun, acc); const k = kk.shu;
    return {
      太乙: tyGong(jiStyle, tahun, acc),
      文昌: skyeyes(jiStyle, tahun, acc),
      始击: sf(jiStyle, tahun, acc),
      计神: jigod(jiStyle, tahun, acc, taishui),
      太岁: taishui,
      合神: hegod(jiStyle, taishui),
      君基: kingbase(acc),
      臣基: officerbase(acc),
      民基: pplbase(acc),
      四神: fgd(acc, k),
      天乙: skyyi(acc, k),
      地乙: earthyi(acc, k),
      直符: zhifu(acc, k),
      飞符: flyfu(acc),
      主大: num2gong(homeGeneral(jiStyle, tahun, acc)),
      主参: num2gong(homeVgen(jiStyle, tahun, acc)),
      客大: num2gong(awayGeneral(jiStyle, tahun, acc)),
      客参: num2gong(awayVgen(jiStyle, tahun, acc)),
      五福: wufu(acc)
    };
  }

  // 主入口：输入公历 y/m/d，返回三计。可选 tahun 参数选择体系（0=统宗/1=金镜/2=淘金歌/3=太乙局）。
  function compute(y, m, d, lunar, tahun) {
    if (tahun === undefined) tahun = 0;
    const lunarY = lunar.getYear(), lunarM = lunar.getMonth(), lunarD = lunar.getDay();
    function build(jiStyle) {
      const acc = accnum(jiStyle, tahun, lunarY, lunarM, lunarD, y, m, d);
      const kk = kook(jiStyle, tahun, acc);
      const taishui = [lunar.getYearInGanZhi()[1], lunar.getMonthInGanZhi()[1], lunar.getDayInGanZhi()[1]][jiStyle];
      const homeC = homeCal(jiStyle, tahun, acc), awayC = awayCal(jiStyle, tahun, acc);
      const dingC = dingCal(jiStyle, tahun, acc, taishui);
      const homeG = homeGeneral(jiStyle, tahun, acc), awayG = awayGeneral(jiStyle, tahun, acc);
      const shen = sixteenGong(jiStyle, tahun, acc, taishui);
      const tyN = tyVal(jiStyle, tahun, acc);
      const ed = eightDoors(tyN, acc);
      return {
        jiStyle, label: ['岁计　值年太乙', '月计　值月太乙', '日计　值日太乙'][jiStyle],
        k: kk.shu, dun: kk.dun, wen: kk.wen, acc: acc, taishui,
        tyGong: shen.太乙, tyNum: tyN, wc: shen.文昌, sh: shen.始击, ji: shen.计神, he: shen.合神,
        homeCal: homeC, awayCal: awayC, dingCal: dingC, homeGen: homeG, awayGen: awayG,
        homeVg: homeVgen(jiStyle, tahun, acc), awayVg: awayVgen(jiStyle, tahun, acc),
        pattern: skyeyesDes(jiStyle, tahun, acc), shen,
        doorZhiShi: ed.zhiShi, doors: ed.dist,
        cd: changDuanShu({ homeCal: homeC, awayCal: awayC }),
        bz: bingZhen({ homeCal: homeC, awayCal: awayC, wc: shen.文昌, sh: shen.始击, jiStyle, taishui, pattern: skyeyesDes(jiStyle, tahun, acc) })
      };
    }
    return { year: build(0), month: build(1), day: build(2) };
  }

  // 时计（值时太乙）：据日计局数与时辰干支，依淘金歌五子元法定值时局数，再按主客推算。
  // 仅输入 hour>=0 且提供时干支时启用；返回值含时计单卡。
  function computeShi(y, m, d, hour, minute, lunar, tahun) {
    if (hour < 0) return null;
    if (tahun === undefined) tahun = 0;
    const solar = { getYear: () => y, getMonth: () => m, getDay: () => d };
    const accD = accnum(2, tahun, 0, 0, 0, y, m, d);
    const kkD = kook(2, tahun, accD);
    const dayJu = kkD.shu;
    const hourGz = lunar && lunar.getTimeInGanZhi ? lunar.getTimeInGanZhi() : '';
    const wzy = wuZiYuan(dayJu, hourGz);
    const shiJu = wzy.局数 % 72 || 72;
    // 时计阴阳遁依冬至夏至：此处以日计阳遁推算
    const shiKk = { wen: '阳' + num2cn(shiJu) + '局', shu: shiJu, dun: '阳', acc: shiJu };
    const taiyi = (shiKk.dun === '阳' ? tyYang : tyYin)[shiJu - 1];
    const wc = skyeyes_dict['阳'][shiJu - 1];
    const sh = sf_list[shiJu - 1];
    const taishui = (lunar ? lunar.getTimeZhi() : '') || '子';
    const shen = { 太乙: taiyi_pai[shiJu - 1], 文昌: wc, 始击: sh, 计神: jigodMap[taishui] || '—', 合神: hegodMap[taishui] || '—',
      太岁: taishui, 君基: kingbase(shiJu), 臣基: officerbase(shiJu), 民基: pplbase(shiJu),
      四神: fgd(shiJu, shiJu), 天乙: skyyi(shiJu, shiJu), 地乙: earthyi(shiJu, shiJu), 直符: zhifu(shiJu, shiJu),
      飞符: flyfu(shiJu), 主大: num2gong(homeGeneral(0, 0, shiJu)), 主参: num2gong(homeVgen(0, 0, shiJu)),
      客大: num2gong(awayGeneral(0, 0, shiJu)), 客参: num2gong(awayVgen(0, 0, shiJu)),
      五福: wufu(shiJu) };
    const homeC = homeCalFrom(0, 0, shiJu, wc), awayC = awayCal(0, 0, shiJu);
    const dingC = dingCal(0, 0, shiJu, taishui);
    const tyN = shiJu;
    const ed = eightDoors(tyN, shiJu);
    return {
      jiStyle: 3, label: '时计　值时太乙', 时干支: hourGz, 五子: wzy.五子, 值日局: dayJu,
      k: shiJu, dun: '阳', wen: shiKk.wen, acc: shiJu, taishui,
      tyGong: shen.太乙, tyNum: tyN, wc, sh, ji: shen.计神, he: shen.合神,
      homeCal: homeC, awayCal: awayC, dingCal: dingC,
      homeGen: homeGeneral(0, 0, shiJu), awayGen: awayGeneral(0, 0, shiJu),
      homeVg: homeVgen(0, 0, shiJu), awayVg: awayVgen(0, 0, shiJu),
      pattern: skyeyes_summary['阳'][shiJu - 1] || '', shen,
      doorZhiShi: ed.zhiShi, doors: ed.dist,
      cd: changDuanShu({ homeCal: homeC, awayCal: awayC }),
      bz: bingZhen({ homeCal: homeC, awayCal: awayC, wc, sh, jiStyle: 3, taishui, pattern: skyeyes_summary['阳'][shiJu - 1] || '' })
    };
  }

  // 太乙命法（人道推命，据《太乙金镜式经》及太乙命理传统）：
  // 以出生时太乙盘（时计盘）之神将落宫定命主禀赋。太乙（命宫）主先天根基、文昌（福德）主才智
  // 心性、始击（身宫）主际遇作为、主客大将定一生成就。
  const GONG_MING_YI = { 乾: '天门，主命主有开创之志、近于权贵', 艮: '山门，主命主稳重守成、宜守不宜进', 巽: '风门，主命主通达机变、善谋略', 坤: '地门，主命主敦厚包容、宜待时机',
    坎: '水门，主命主智谋内敛、多变动', 离: '火门，主命主光明进取、性刚烈', 震: '雷门，主命主奋发有为、有开创力', 兑: '泽门，主命主口才机敏、善周旋', 中: '枢轴，主命主居中制衡、宜稳守',
    子: '坎水初爻，主命主沉静内敛、有智藏于内', 丑: '艮土之始，主命主朴实持重、渐次累积', 寅: '艮木气动，主命主有胆识、宜进而守中', 卯: '震木当旺，主命主奋发有为、勇于开创',
    辰: '巽土库，主命主藏器待时、深谋远虑', 巳: '巽火之盛，主命主机敏通达、善应变', 午: '离火正位，主命主光明坦荡、性刚直', 未: '坤土之库，主命主敦厚包容、厚德载物',
    申: '坤金气敛，主命主谨严内守、待时而动', 酉: '兑金正位，主命主口才明断、善断是非', 戌: '乾土之库，主命主刚健有守、晚成之象', 亥: '乾水之始，主命主涵养深厚、智藏于内' };
  function mingFa(shi) {
    if (!shi) return null;
    const ty = GONG_MING_YI[shi.tyGong] || '中宫';
    const wc = GONG_MING_YI[shi.wc] || '';
    const sh = GONG_MING_YI[shi.sh] || '';
    const hg = shi.homeGen, ag = shi.awayGen;
    const homeInZhong = shi.tyGong === '中';
    let 成就;
    if (homeInZhong) 成就 = '太乙居中宫，命主一生宜稳守本分、居中协调，不宜冒险进取';
    else if (hg !== 5 && ag !== 5 && hg === ag) 成就 = '主客大将同宫，命主一生多遇势均之局，成败取决于临机决断';
    else if (hg !== 5 && ag !== 5 && hg > ag) 成就 = '主大将盛于客大将，命主一生多主事、得先机而主动';
    else if (hg !== 5 && ag !== 5) 成就 = '客大将盛于主大将，命主一生多应事、常随势而动';
    else 成就 = '主客将入中宫，命主一生宜守不宜进、待时而动';
    const 格局 = shi.pattern ? ('本盘格局：' + shi.pattern + '。') : '本盘格局平和，无显明囚杜塞迫击之格。';
    return {
      命宫: shi.tyGong, 福德: shi.wc, 身宫: shi.sh,
      text: '以出生时太乙盘推命：太乙（命宫）落' + shi.tyGong + '宫，' + ty + '；文昌（福德）落' + shi.wc + '宫，' + wc + '；始击（身宫）落' + shi.sh + '宫，' + sh + '。' + 成就 + '。' + 格局 + '主算' + shi.homeCal + '、客算' + shi.awayCal + '，以主客算之长短和战论命主一生进退。'
    };
  }

  return {
    compute, computeShi, wuZiYuan, mingFa, num2cn, eightDoors, eightDoorZhiShi, dingCal, wuxingShengFu, ninePalace, changDuanShu, jianBei, bingZhen, dayouXiaoyou,
    TAIYI_METHODS,
    NINE_PALACE, BAZHEN,
    DOOR, DOOR_INFO, DOOR_ORDER: num.slice(),
    _tables: { taiyi_pai, sf_list, skyeyes_dict, skyeyes_summary, GONG_MING_YI }
  };
})();
