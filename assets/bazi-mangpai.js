/* ============================================================================
 * bazi-mangpai.js：盲派命理数据层（唯一真源）
 * ----------------------------------------------------------------------------
 * 学术定位：盲派以子平命理为根，不看日主衰旺、不论格局用神，以体用宾主、做功效率、
 *   干支配置、象法口诀立论（段建业整理体系，源自盲师郝金阳、夏仲奇口传心授）。
 *   本文件按三法归集：理法（做功五法、宾主、墓库）、象法（十神类象、纳音象）、
 *   技法（口诀神煞、空亡、虚透、借势）。
 * 真源纪律：与命理共享底盘（藏干 HIDE、神煞查法 YANGREN/HONGLUAN/ZAISHA/JIESHA、
 *   三合局 DIZHI_SANHE、十二长生 getChangSheng）一律引用 bazi-data.js 真源，
 *   将星华盖、灾劫煞、禄神在函数内由真源派生，不另建同义表。
 * 加载序：bazi-data.js 与 xuanji-lib.js 之后、bazi-core.js 之前（见 bazi.html）。
 *   依赖（window 全局）：GAN_WX、HIDE、tenGod、shenCat、zhiMain、zhiOpp、
 *   pairIn、DIZHI_CHONG、DIZHI_XING、DIZHI_SANHE、YANGREN、HONGLUAN、
 *   ZAISHA、JIESHA、getChangSheng（一律函数内运行时取用，本文件顶层零依赖），
 *   任何加载环境不白屏。
 * 对外接口 window.MangPai：
 *   数据：TEN_IMAGE 十神类象；ZUOGONG 做功五法；BINZHU 宾主；KU 墓库；
 *         SHA_NOTE 口诀神煞释义；TAISUI_NOTE 犯太岁五条；NY_XIANG 纳音象；
 *         KONG_GONG 空亡落宫；XU_TOU 虚透释义；JIE_NOTE 借势两态
 *   判定：xiGz 财官本位喜；xiangText 干支象；zuoGongTxt 做功方式；
 *         binZhuText 宾主落宫；kuOf 财官墓库；xuTouOf 虚透；
 *         borrowable 借财官；shaChain 口诀神煞链；kongText 空亡文本；
 *         nayinXiang 纳音象文本
 * 消费方：bazi-core.js 各流派解读格局（盲派段）、各流派解读运势（fMang 机制群）。
 *   去重（saidDuan）与年龄门控属调用方职责，本层纯函数、无运行时状态。
 * ========================================================================== */
(function () {
  'use strict';

  /* ============================ 象法：十神类象 ============================ */
  /* 天干十神象与地支本气十神象共用一表（象之主体人事；宫位与干支位另由宾主、宫位层叠加） */
  const TEN_IMAGE = {
    '正官': '职位权柄、名声地位、上司约束、规矩法度（女命夫星）',
    '七杀': '压力竞争、权威险事、军警开拓、魄力胆识（女命偏夫）',
    '正财': '薪俸正途之财、实物资产、勤俭积攒（男命妻星）',
    '偏财': '外财投资、众人之财、交际应酬、活钱快财（男命父星）',
    '正印': '文书学历、名誉信誉、长辈荫庇、房产契约',
    '偏印': '偏门学识、证书技艺、宗教玄学、孤独清高',
    '食神': '口才才华、福气饮食、悠游寿相、艺术享受（女命女儿）',
    '伤官': '才艺表现、技术声名、傲气锋芒、创新逾矩（女命儿子）',
    '比肩': '同辈兄弟、朋友合作、自立自强、竞争分利',
    '劫财': '争夺破耗、分夺义气、豪爽冲动、得失起落'
  };

  /* ============================ 理法：做功五法 ============================ */
  /* 盲派论做功：制、化、合、冲、墓五法得其财官；墓法由墓库开闭（kuOf）实现 */
  const ZUOGONG = [
    { k: '制', note: '克去忌神、扫清阻碍，做功最直接、效率最高' },
    { k: '化', note: '化泄引通、化敌为友，功缓而持久' },
    { k: '合', note: '合来合去、引动牵绊，功细而缠绵' },
    { k: '冲', note: '冲开战克、动荡中成事，功猛而带伤' },
    { k: '墓', note: '收入库藏、待冲刑而发，功藏而后应' }
  ];

  /* ============================ 理法：宾主 ============================ */
  /* 年月为宾（外境、他人、社会平台），日时为主（自身、家内、亲密）；
     宾位之财官须往外去取，主位之财官是自身囊中之物 */
  const BINZHU = {
    '年柱': { wei: '宾', child: '功落宾位年柱，须借长辈之缘、家中有助', adult: '功落宾位年柱，须往外去社会上取财官，多得长辈之缘' },
    '月柱': { wei: '宾', child: '功落宾位月柱，须借父母之助、家中有援', adult: '功落宾位月柱，须借父母兄弟之平台使力' },
    '日柱': { wei: '主', child: '功落主位，应在自身、同学之事', adult: '功落主位，应在自身、配偶、子女之事' },
    '时柱': { wei: '主', child: '功落主位，应在自身、同学之事', adult: '功落主位，应在自身、配偶、子女之事' }
  };

  /* ============================ 理法：墓库 ============================ */
  /* 四库名与象义（与全站墓库口径一致）；开库条件：库支逢冲刑则开，开则库中财官得用 */
  const KU = {
    '辰': { ku: '水库', xiang: '水之归宿、藏物待用' },
    '戌': { ku: '火库', xiang: '火之归藏、待时而发' },
    '丑': { ku: '金库', xiang: '金之凝炼、收藏待用' },
    '未': { ku: '木库', xiang: '木之生养、归藏待发' }
  };

  /* ============================ 技法：口诀神煞释义 ============================ */
  /* 盲师口传重神煞直断；查法真源：羊刃 YANGREN（日干查）、红鸾 HONGLUAN（年日支查）、
     灾煞 ZAISHA 与劫煞 JIESHA（年支局五行查）、将星华盖（年支三合局之旺支、墓支派生）、
     血刃（羊刃对冲）、禄（日干临官之支，getChangSheng 派生） */
  const SHA_NOTE = {
    '羊刃': '羊刃临运，财物易耗散、行事防凶灾破财，宜制刃守成',
    '灾煞': '带灾煞，防意外刑伤、血光之灾，出行谨慎',
    '劫煞': '带劫煞，防财物劫夺、不测损耗',
    '红鸾': '红鸾临运，婚喜信号、缔缘之象',
    '天喜': '天喜临运，喜事有应、家和事顺',
    '将星': '将星临运，掌事得力、威望有增',
    '华盖': '华盖临运，才思独运、宜静思深造',
    '血刃': '血刃临运，防外伤血光、出行留意',
    '禄': '逢禄得禄，禄为财官之本，力有所归'
  };
  /* 犯太岁五条（流年口诀） */
  const TAISUI_NOTE = {
    '值': '值太岁（本命年），多主劳心费力、破耗增多、人事多磨',
    '冲': '冲太岁，多主居所变动、岗位更替、远行奔波',
    '刑': '刑太岁，多主口舌是非、健康多波折',
    '害': '害太岁，多主防人算计、人缘失和、财物暗耗',
    '破': '破太岁，多主破耗、关系失和、计划难成'
  };

  /* ============================ 象法：纳音象、空亡落宫 ============================ */
  const NY_XIANG = {
    '金': '其气刚健、主决断变革',
    '木': '其气生发、主成长开拓',
    '水': '其气流动、主智谋变通',
    '火': '其气炎上、主明达外放',
    '土': '其气厚重、主承载稳固'
  };
  const KONG_GONG = {
    '年柱': '祖辈之事易悬而未决',
    '月柱': '事业平台易虚浮难稳',
    '日柱': '自身计划易落空多变',
    '时柱': '子女晚辈之事易拖延难成'
  };

  /* ============================ 技法：虚透、借势 ============================ */
  const XU_TOU = '虚透无根，气力浮泛，须岁运通根方实';
  const JIE_NOTE = {
    you: '支中藏财官、可借合化引出，宜顺势接财官',
    wu: '财官难借、宜踏实积累、勿贪快'
  };

  /* ============================ 判定函数（纯函数，去重归调用方） ============================ */

  /* 财官本位喜（盲派喜忌唯一口径）：干支带财星、官杀即为喜，不论日主旺衰 */
  function xiGz(gz, dg) {
    if (!gz || !dg) return false;
    const t1 = tenGod(dg, gz[0]);
    const t2 = tenGod(dg, zhiMain(gz[1]));
    const isCG = t => { const c = shenCat(t); return c === '财星' || c === '官杀'; };
    return isCG(t1) || isCG(t2);
  }

  /* 干支象文本（天干十神象加地支本气十神象；同神则合并一句） */
  function xiangText(g, z, ganTen, zhiTen) {
    const iw = TEN_IMAGE[ganTen], iz = TEN_IMAGE[zhiTen];
    if (!iw && !iz) return '';
    if (ganTen === zhiTen && iw) return `天干${g}、地支本气${z}皆为${ganTen}，主${iw}之事`;
    return (iw ? `天干${g}为${ganTen}，主${iw}之事` : '') + (iz ? `；地支本气${z}为${zhiTen}，主${iz}之事` : '');
  }

  /* 做功方式判定：按本步与命局的关系命名做功之法（冲刑害扫障、破开、克制、合引、生续） */
  function zuoGongTxt(rels) {
    const txt = (rels || []).join(' ');
    if (/冲|刑|害/.test(txt)) return '以冲刑害扫障、制去阻碍';
    if (/破/.test(txt)) return '以相破冲开、破旧开新';
    if (/克/.test(txt)) return '以天干相克、制而约束';
    if (/合/.test(txt)) return '以合化引动或合绊留连、功细待引';
    if (/生/.test(txt)) return '以生扶续气、非直接做功';
    return '';
  }

  /* 宾主落宫文本（lab 为柱位标签；日时同为主位；child 为年龄门控档） */
  function binZhuText(lab, child) {
    const o = lab && BINZHU[lab];
    if (o) return child ? o.child : o.adult;
    const zhu = BINZHU['日柱'];
    return child ? zhu.child : zhu.adult;
  }

  /* 财官墓库判定：库支所藏含本命财官者成库；库支在命局逢冲刑则开。
     返回 null（非库、或库中无财官）或 {kw:'财'|'官'|'财官', open:bool, text} */
  function kuOf(BZ, z) {
    if (!BZ || !z || !KU[z]) return null;
    const hid = HIDE[z] || [];
    const isCai = x => { const t = tenGod(BZ.dayGan, x); return t === '正财' || t === '偏财'; };
    const isGuan = x => { const t = tenGod(BZ.dayGan, x); return t === '正官' || t === '七杀'; };
    const cai = hid.some(isCai), guan = hid.some(isGuan);
    if (!cai && !guan) return null;
    const open = (typeof pairIn === 'function') && (BZ.zhis || []).some(pz => pairIn(z, pz, DIZHI_CHONG) || pairIn(z, pz, DIZHI_XING));
    const kw = cai && guan ? '财官' : (cai ? '财' : '官');
    const text = open
      ? `支${z}为${kw}之库，逢冲刑库门洞开，库中${kw}得用、财官事有应`
      : `支${z}为${kw}之库，库门未开，${kw}藏而待引，宜待冲开`;
    return { kw, open, text };
  }

  /* 虚透判定：天干五行在命局地支藏干中无根则为虚透 */
  function xuTouOf(BZ, g) {
    const gw = GAN_WX[g];
    return !((BZ.zhis || []).some(z => (HIDE[z] || []).some(x => GAN_WX[x] === gw)));
  }

  /* 借势判定：本步支藏财官（支中自有）或本步与命局之合带财官（合而可借） */
  function borrowable(BZ, gz, rels) {
    const z = gz && gz[1];
    if (!z) return false;
    const hid = HIDE[z] || [];
    const has = hid.some(x => { const t = tenGod(BZ.dayGan, x); return t === '正财' || t === '偏财' || t === '正官' || t === '七杀'; });
    if (has) return true;
    return (rels || []).some(r => /合/.test(r) && /财|官/.test(r));
  }

  /* 口诀神煞链：羊刃、灾煞、劫煞、红鸾、天喜、将星、华盖、血刃、禄（opt.stage 门控婚喜才能类）。
     返回 [{name, text}]；查法全部由真源派生：灾煞劫煞按年支局五行查 ZAISHA/JIESHA，
     将星华盖取年支三合局之旺支、墓支，禄取日干临官。 */
  function shaChain(BZ, gz, opt) {
    opt = opt || {};
    const z = gz && gz[1];
    if (!BZ || !z) return [];
    const dg = BZ.dayGan, out = [];
    const stage = opt.stage || 'adult';
    if (typeof YANGREN !== 'undefined' && z === YANGREN[dg]) out.push({ name: '羊刃', text: SHA_NOTE['羊刃'] });
    const grp = (typeof DIZHI_SANHE !== 'undefined' ? DIZHI_SANHE : []).find(g => g.indexOf(BZ.yearZ) >= 0 && g.length >= 4);
    const wx = grp ? grp[3] : '';
    if (wx && typeof ZAISHA !== 'undefined' && ZAISHA[wx] === z) out.push({ name: '灾煞', text: SHA_NOTE['灾煞'] });
    if (wx && typeof JIESHA !== 'undefined' && JIESHA[wx] === z) out.push({ name: '劫煞', text: SHA_NOTE['劫煞'] });
    if (stage !== 'child') {
      if (typeof HONGLUAN !== 'undefined') {
        if (HONGLUAN[BZ.yearZ] === z || HONGLUAN[BZ.dayZ] === z) out.push({ name: '红鸾', text: SHA_NOTE['红鸾'] });
        if (zhiOpp(HONGLUAN[BZ.yearZ]) === z || zhiOpp(HONGLUAN[BZ.dayZ]) === z) out.push({ name: '天喜', text: SHA_NOTE['天喜'] });
      }
      if (grp) {
        if (grp[1] === z) out.push({ name: '将星', text: SHA_NOTE['将星'] });
        if (grp[2] === z) out.push({ name: '华盖', text: SHA_NOTE['华盖'] });
      }
    }
    if (typeof YANGREN !== 'undefined' && zhiOpp(YANGREN[dg]) === z) out.push({ name: '血刃', text: SHA_NOTE['血刃'] });
    if (typeof getChangSheng === 'function' && getChangSheng(dg, z) === '临官') out.push({ name: '禄', text: SHA_NOTE['禄'] });
    return out;
  }

  /* 空亡落宫文本（kongArr 由调用方按页面空亡轴算出后传入） */
  function kongText(BZ, kongArr) {
    if (!kongArr || !kongArr.length) return '';
    const hitP = (BZ.zhis || []).map((z, i) => kongArr.indexOf(z) >= 0 ? ['年柱', '月柱', '日柱', '时柱'][i] : '').filter(Boolean);
    const gong = hitP.length ? KONG_GONG[hitP[0]] : '';
    return `落空亡（${kongArr.join('、')}）` + (gong ? `，${hitP.join('、')}受空、${gong}` : '') + '，谋事宜扎实勿空悬';
  }

  /* 纳音象文本 */
  function nayinXiang(wx) { return NY_XIANG[wx] || ''; }

  const MangPai = {
    TEN_IMAGE, ZUOGONG, BINZHU, KU, SHA_NOTE, TAISUI_NOTE, NY_XIANG, KONG_GONG, XU_TOU, JIE_NOTE,
    xiGz, xiangText, zuoGongTxt, binZhuText, kuOf, xuTouOf, borrowable, shaChain, kongText, nayinXiang
  };
  if (typeof window !== 'undefined') window.MangPai = MangPai;
  if (typeof module !== 'undefined' && module.exports) module.exports = MangPai;
})();
