/* ============================================================================
 * bazi-mangpai.js：盲派命理数据层（唯一真源）
 * ----------------------------------------------------------------------------
 * 学术定位：盲派以子平命理为根，不看日主衰旺、不论格局用神，以体用宾主、做功效率、
 *   干支配置、象法口诀立论（段建业整理体系，源自盲师郝金阳、夏仲奇口传心授）。
 *   本文件按三法归集：理法（做功五法、宾主、墓库）、象法（十神类象、纳音象）、
 *   技法（口诀神煞、空亡、虚透、借势）。
 * 真源纪律：与命理共享底盘（藏干 HIDE、神煞查法 YANGREN_LUQIAN/HONGLUAN/ZAISHA/JIESHA、
 *   三合局 DIZHI_SANHE、十二长生 getChangSheng）一律引用 bazi-data.js 真源，
 *   将星华盖、灾劫煞、禄神在函数内由真源派生，不另建同义表。
 * 加载序：bazi-data.js 与 xuanji-lib.js 之后、bazi-core.js 之前（见 bazi.html）。
 *   依赖（window 全局）：GAN_WX、WX_KE、HIDE、TIANGAN_HE、tenGod、shenCat、
 *   zhiMain、zhiOpp、pairIn、DIZHI_CHONG、DIZHI_XING、DIZHI_HE6、DIZHI_SANHE、DIZHI_ANHE、
 *   YANGREN_LUQIAN、HONGLUAN、ZAISHA、JIESHA、getChangSheng（一律函数内运行时取用，本文件顶层零依赖），
 *   任何加载环境不白屏。
 * 对外接口 window.MangPai：
 *   数据：TEN_IMAGE 十神类象；ZUOGONG 做功五法；BINZHU 宾主；KU 墓库；
 *        SHA_NOTE 口诀神煞释义；TAISUI_NOTE 犯太岁五条；NY_XIANG 纳音象；
 *        KONG_GONG 空亡落宫；XU_TOU 虚透释义；JIE_NOTE 借势两态
 *   判定：xiGz 财官本位喜；xiangText 干支象；zuoGongTxt 做功方式；
 *        binZhuText 宾主落宫；kuOf 财官墓库；kuStep 库开闭之岁运层；xuTouOf 虚透；
 *        xuShiStep 做功虚实之转；borrowable 借财官；shaChain 口诀神煞链；kongText 空亡文本；
 *        nayinXiang 纳音象文本；gongChain 体用宾主做功链（opt.stage 年龄档）；gongBreak 病破做功
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

  /* ============================ 理法：体用 ============================ */
  /* 体为我之身与我所恃之力：日主与比劫、印星、食伤，皆自家之物；
     用为我所求之物：财星、官杀，须以体去取、去制、去化方为我有。
     体用既定，再看宾主：年月为宾、日时为主；体在宾是借外境之力，体在主是自身之力。
     做功即"以体取用"，取之之法即五法。十神类名之体用归属以此表为唯一口径。 */
  const TI_YONG = { '比劫': '体', '印星': '体', '食伤': '体', '财星': '用', '官杀': '用' };
  /* 体用相对之辞：体之十神名入句用"我之…"，用之十神名入句用"我所求之…"；宁缺毋滥，不识者不出 */
  const TI_YONG_WORD = {
    '比肩': '同气', '劫财': '手足', '正印': '荫庇', '偏印': '偏学',
    '食神': '才艺', '伤官': '锋芒', '正财': '正途之财', '偏财': '外财',
    '正官': '名位', '七杀': '威权'
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
  /* 盲师口传重神煞直断；查法真源：羊刃 YANGREN_LUQIAN（日干查）、红鸾 HONGLUAN（年日支查）、
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

  /* 做功方式判定：按本步与命局的关系命名做功之法（冲刑害扫障、破开、克制、合引、生续、墓库收藏）。
     墓库之辞最专：库门逢冲刑之句本是墓法待冲刑而发之注，先于冲法识别，不作扫障论 */
  function zuoGongTxt(rels) {
    const txt = (rels || []).join(' ');
    if (/墓|库/.test(txt)) return '以墓库收藏、待冲刑而发，功藏而后应';
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

  /* 库开闭之岁运层：命局之库逢本步冲刑则开、逢六合合绊则闭；库已开而逢合者作合解论、
     合不重锁（同本件六合一路之口径）。命局无财官之库时，本步自身为库者沿用 kuOf 语义
     （与本件 kuOf 一路同文，去重归调用方）。返回 null 或一句文本。 */
  function kuStep(BZ, stepZ) {
    if (!BZ || !stepZ || typeof pairIn !== 'function') return null;
    const ku = Array.from(new Set(BZ.zhis || [])).map(z => ({ z, k: kuOf(BZ, z) })).filter(o => o.k);
    const chong = o => (typeof DIZHI_CHONG !== 'undefined') && pairIn(o.z, stepZ, DIZHI_CHONG);
    const xing = o => (typeof DIZHI_XING !== 'undefined') && pairIn(o.z, stepZ, DIZHI_XING);
    const he6 = o => (typeof DIZHI_HE6 !== 'undefined') && pairIn(o.z, stepZ, DIZHI_HE6);
    const open = ku.find(o => chong(o) || xing(o));
    if (open) {
      const rel = (chong(open) ? '冲' : '') + (xing(open) ? '刑' : '');
      return `岁运${stepZ}${rel}命局${open.z}之库，库门洞开，库中${open.k.kw}得用、此步财官事有应`;
    }
    const he = ku.find(he6);
    if (he) return he.k.open
      ? `岁运${stepZ}合命局已开之${he.z}库，合解其开、库门复合，须待再冲`
      : `岁运${stepZ}合绊命局${he.z}之库，库门锁闭、${he.k.kw}藏而不显，须待冲刑再开`;
    if (KU[stepZ]) { const k = kuOf(BZ, stepZ); return k ? k.text : null; }
    return null;
  }

  /* 虚透判定：天干五行在命局地支藏干中无根则为虚透 */
  function xuTouOf(BZ, g) {
    const gw = GAN_WX[g];
    return !((BZ.zhis || []).some(z => (HIDE[z] || []).some(x => GAN_WX[x] === gw)));
  }

  /* 做功虚实之转（流月层）：命局虚透之字（天干无根者，皆属体之字或财官）在本步支藏其同五行之干，
     即虚者得根、财官填实，此步转实；本步之支逢命局之支冲或六合合绊，根被冲散、字被绊留，此步转虚。
     本步与上层相较，由虚转实者做功有了着落，由实转虚者失了着落；两层同态、或缺上层、
     或本命无虚透之字者皆不出（宁缺毋滥）。 */
  function xuShiStep(BZ, stepGz, upperGz) {
    if (!BZ || !BZ.dayGan || !stepGz || !upperGz || typeof pairIn !== 'function') return null;
    const xu = (BZ.gans || []).filter((g, i) => i !== 2 && g && xuTouOf(BZ, g));
    if (!xu.length) return null;
    const wxSet = new Set(xu.map(g => GAN_WX[g]));
    const stateOf = gz => {
      const z = gz && gz[1];
      if (!z) return '';
      const gen = (HIDE[z] || []).some(x => wxSet.has(GAN_WX[x]));
      const bound = (typeof DIZHI_CHONG !== 'undefined' && (BZ.zhis || []).some(pz => pairIn(z, pz, DIZHI_CHONG)))
        || (typeof DIZHI_HE6 !== 'undefined' && (BZ.zhis || []).some(pz => pairIn(z, pz, DIZHI_HE6)));
      return (gen && !bound) ? '实' : '虚';
    };
    const cur = stateOf(stepGz), up = stateOf(upperGz);
    if (!cur || !up || cur === up) return null;
    const txt = o => o[0] + o[1];
    return cur === '实'
      ? `${txt(stepGz)}由${txt(upperGz)}之虚转实，做功有了着落`
      : `${txt(stepGz)}由${txt(upperGz)}之实转虚，做功失了着落`;
  }

  /* 借势判定：本步支藏财官（支中自有）或本步与命局之合带财官（合而可借）。
     合路按实算口径：逐对判本步支与命局四支之六合、半合（同属一三合局，含拱）、暗合，
     合支藏干带财官即可借；关系文本一路只作兜底（文本未必带十神名） */
  function borrowable(BZ, gz, rels) {
    const z = gz && gz[1];
    if (!z) return false;
    const isCG = x => { const t = tenGod(BZ.dayGan, x); return t === '正财' || t === '偏财' || t === '正官' || t === '七杀'; };
    if ((HIDE[z] || []).some(isCG)) return true;
    const he6 = z2 => (typeof pairIn === 'function' && typeof DIZHI_HE6 !== 'undefined') && pairIn(z, z2, DIZHI_HE6);
    const anhe = z2 => (typeof pairIn === 'function' && typeof DIZHI_ANHE !== 'undefined') && pairIn(z, z2, DIZHI_ANHE);
    const sameJu = z2 => z2 !== z && (typeof DIZHI_SANHE !== 'undefined')
      && DIZHI_SANHE.some(g => g.indexOf(z) >= 0 && g.indexOf(z2) >= 0);
    const borrow = (BZ.zhis || []).some(z2 => (he6(z2) || anhe(z2) || sameJu(z2)) && (HIDE[z2] || []).some(isCG));
    if (borrow) return true;
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
    if (typeof YANGREN_LUQIAN !== 'undefined' && z === YANGREN_LUQIAN[dg]) out.push({ name: '羊刃', text: SHA_NOTE['羊刃'] });
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
    if (typeof YANGREN_LUQIAN !== 'undefined' && zhiOpp(YANGREN_LUQIAN[dg]) === z) out.push({ name: '血刃', text: SHA_NOTE['血刃'] });
    if (typeof getChangSheng === 'function' && getChangSheng(dg, z) === '临官') out.push({ name: '禄', text: SHA_NOTE['禄'] });
    return out;
  }

  /* 体用宾主做功链（本命）：定体、定用、定法、断成否四步相扣，末附口径。
     opt.stage 为年龄档：缺省与 adult 一档，断成否一路照出成人语；
     child 一档断在根基、学业、家中照应三事，不出财官可得其手一类成人断。
     宁缺毋滥：底盘（日主与四柱干支）不全则整条不出，不臆测、不补空话。 */
  function gongChain(BZ, opt) {
    if (!BZ || !BZ.dayGan || !BZ.gans || BZ.gans.length < 4 || !BZ.zhis || BZ.zhis.length < 4) return null;
    opt = opt || {};
    const child = opt.stage === 'child';
    const dg = BZ.dayGan, PAL = ['年柱', '月柱', '日柱', '时柱'];
    const cat = g => shenCat(tenGod(dg, g));
    // 体用之分一以 TI_YONG 表为口径，不在此另立一套十神名单
    const yongOf = g => TI_YONG[cat(g)] || '';
    const isCG = g => yongOf(g) === '用';
    const isTi = g => yongOf(g) === '体';
    const word = t => TI_YONG_WORD[t] || t;

    // 一、定体定用：日主为体之主，比劫印星食伤为体之字，财官为用；干上不现方退查支藏
    const tiG = [], yoG = [], yoZ = [];
    for (let i = 0; i < 4; i++) {
      if (i === 2) continue;
      const g = BZ.gans[i]; if (!g) continue;
      if (isTi(g)) tiG.push({ g, p: i, t: tenGod(dg, g) });
      else if (isCG(g)) yoG.push({ g, p: i, t: tenGod(dg, g) });
    }
    for (let i = 0; i < 4; i++) {
      const z = BZ.zhis[i]; if (!z) continue;
      if ((HIDE[z] || []).some(x => isCG(x))) yoZ.push({ z, p: i });
    }
    const yongArr = yoG.length ? yoG : yoZ;
    const yongXian = yoG.length ? '透干而现' : (yoZ.length ? '藏支待引' : '不现');

    // 二、体之根：四支藏干与日主同五行即有根，临官为禄、帝旺为旺，禄旺之根方为强根
    const rootZ = [], strongZ = [];
    (BZ.zhis || []).forEach(z => {
      if (!(HIDE[z] || []).some(x => GAN_WX[x] === GAN_WX[dg])) return;
      rootZ.push(z);
      const cs = (typeof getChangSheng === 'function') ? getChangSheng(dg, z) : '';
      if (cs === '临官' || cs === '帝旺') strongZ.push(z);
    });
    const tiLi = strongZ.length ? `得禄旺之根（${Array.from(new Set(strongZ)).join('、')}）而有力` : (rootZ.length ? '有根而力平' : '无根而力薄');

    // 三、宾主：体用各落何位，与 BINZHU 同口径（年月宾、日时主），不另立一说
    const weiOf = arr => {
      if (!arr || !arr.length) return null;
      const ps = Array.from(new Set(arr.map(o => o.p))).sort((a, b) => a - b);
      const labs = ps.map(p => PAL[p]);
      const weis = Array.from(new Set(labs.map(l => (BINZHU[l] && BINZHU[l].wei) || '主')));
      return { labs: labs.join('、'), both: weis.length > 1, zhu: weis.indexOf('主') >= 0 };
    };
    const weiSay = (w, isYong) => {
      if (!w) return '';
      if (w.both) return isYong ? '内外皆可取' : '自身与外境之力并用';
      if (w.zhu) return isYong ? '是自家囊中之物' : '是自身之力';
      return isYong ? '须往外去取' : '是借外境之力';
    };

    // 四、定法：五法各按命局实构而立，非五法并用；序依 ZUOGONG 制、化、合、冲、墓。
    // 每法自带"得行与否"与其由：制化二法以体之字发力，字须通根，虚透则无力（盲派谓虚透之字不做功，
    // 此与子平"虚浮降档"之论不同，此处一依盲派）；合法是日主自家去合，日主之力已在体之根一档论过；
    // 墓看库门开否；化与合看柱位远近（同 bazi-rel.js 官印杀印同柱、紧贴、夹日、隔柱之分）
    const fa = [];
    const faAdd = (t, xing, why) => fa.push({ t, xing, why });
    const pick = c => tiG.find(o => cat(o.g) === c);
    const sG = pick('食伤'), bG = pick('比劫'), pG = pick('印星');
    const gG = yoG.find(o => cat(o.g) === '官杀'), cG = yoG.find(o => cat(o.g) === '财星');
    // 制：制神虚透无根则制之无力，不得径许功成
    const zhiSay = (my, tgt, okSay, badSay) => `以我之${word(my.t)}${my.g}制${word(tgt.t)}${tgt.g}，` + (xuTouOf(BZ, my.g)
      ? `${my.g}虚透无根、${badSay}，须待岁运通根`
      : okSay);
    if (sG && gG) faAdd(zhiSay(sG, gG, '以我生之技制住克我之力，功最直接', '制之无力'),
      !xuTouOf(BZ, sG.g), `${word(sG.t)}${sG.g}虚透无根`);
    else if (bG && cG) faAdd(zhiSay(bG, cG, '以同气之力取我所克之财', '制财无力'),
      !xuTouOf(BZ, bG.g), `${word(bG.t)}${bG.g}虚透无根`);
    else if (sG && cG) {
      // 生财：食伤为体、财为用，泄我之气以通于我所求，功缓而持久（ZUOGONG 化法"化泄引通"之注），
      // 不另立第六法。食伤已用于制法者不重计：一体之字只任一法，制法最捷故制优先
      const sXu = xuTouOf(BZ, sG.g);
      faAdd(`以我之${word(sG.t)}${sG.g}生${word(cG.t)}${cG.g}，` + (sXu
        ? `${sG.g}虚透无根、生财无力，须待岁运通根`
        : '以才艺技艺生财、以技易财，功缓而持久'), !sXu, `${word(sG.t)}${sG.g}虚透无根`);
    }
    if (pG && gG) {
      // 化：干支同宫最得力，官杀在前、印承于后为紧贴，官杀在年、印在时则夹日，余则隔柱而化力见减
      // （同 bazi-rel.js 杀印同根同支、官印紧贴、官年印时夹日、隔柱见减四档之口径）
      const keWo = gG.t === '七杀' ? '杀' : '官';
      const zang = (p, c) => (HIDE[BZ.zhis[p]] || []).some(x => cat(x) === c);
      const huaSay = (zang(gG.p, '印星') || zang(pG.p, '官杀')) ? `${keWo}印相生、同宫而化最得力，克我之力转成凭恃`
        : (gG.p + 1 === pG.p ? `${keWo}印相生、紧贴相生、气流通到日干，克我之力转成凭恃`
          : ((gG.p === 0 && pG.p === 3) ? `${keWo}印相生、${keWo}在年而印在时夹日，气亦流通到日干，克我之力转成凭恃`
            : `${keWo}印相生而隔柱，化力见减、贵气流转见缓`));
      const pXu = xuTouOf(BZ, pG.g);
      faAdd(`以我之${word(pG.t)}${pG.g}化${word(gG.t)}${gG.g}，` + (pXu
        ? `${pG.g}虚透无根、化之无力，须待岁运通根`
        : huaSay), !pXu, `${word(pG.t)}${pG.g}虚透无根`);
    }
    if (typeof TIANGAN_HE !== 'undefined') {
      TIANGAN_HE.forEach(h => {
        const other = (h[0] === dg) ? h[1] : ((h[1] === dg) ? h[0] : '');
        if (!other) return;
        // 日主五合之干（甲己、乙庚、丙辛、丁壬、戊癸）无一不是财官，故不另判所合是否财官
        // 同干重见则取紧邻日柱之柱（月柱、时柱）为先，遥合与贴合力量不同，不并作一条
        const ps = (BZ.gans || []).map((g, i) => (i !== 2 && g === other) ? i : -1).filter(i => i >= 0);
        if (!ps.length) return;
        const p = ps.indexOf(1) >= 0 ? 1 : (ps.indexOf(3) >= 0 ? 3 : ps[0]);
        faAdd(`日主${dg}合${word(tenGod(dg, other))}${other}` + ((p === 1 || p === 3)
          ? '，紧邻日柱而合、合到手，财官自来'
          : '，遥合而不贴，得之见迟、合而力轻'), true, '');
      });
    }
    // 合法（地支一路）：六合带财官、三合成财局或官局、暗合引财官。
    // 库支逢六合为锁库（库门锁闭、藏而不显），其合不作得行论，开闭归墓法专论；
    // 库支入三合而成局者化于局、所藏随局显用，故三合成局不涉锁库之例（库之开合口径同 bazi-data.js 墓库一节）
    const dwx = GAN_WX[dg];
    const isCaiW = w => (typeof WX_KE !== 'undefined') && WX_KE[dwx] === w;
    const isGuanW = w => (typeof WX_KE !== 'undefined') && WX_KE[w] === dwx;
    const cgStems = z2 => (HIDE[z2] || []).filter(isCG);
    const zs = BZ.zhis || [];
    const seenHe = new Set();
    for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) {
      const a = zs[i], b = zs[j];
      if (!a || !b || a === b) continue;
      const key = [a, b].sort().join('');
      if (seenHe.has(key)) continue;
      const he6 = (typeof pairIn === 'function' && typeof DIZHI_HE6 !== 'undefined') && pairIn(a, b, DIZHI_HE6);
      const anhe = (typeof pairIn === 'function' && typeof DIZHI_ANHE !== 'undefined') && pairIn(a, b, DIZHI_ANHE);
      if (!he6 && !anhe) continue;
      const ent = he6 ? DIZHI_HE6.find(g => (g[0] === a && g[1] === b) || (g[0] === b && g[1] === a))
        : DIZHI_ANHE.find(g => (g[0] === a && g[1] === b) || (g[0] === b && g[1] === a));
      const pr = ent[0] + ent[1];
      const carriers = pr.split('').filter(x => cgStems(x).length);
      if (!carriers.length) continue;
      seenHe.add(key);
      const stems = Array.from(new Set([].concat(...carriers.map(cgStems)))).join('、');
      if (anhe && !he6) {
        faAdd(`支${pr}暗合，暗引财官之支${carriers.join('、')}（藏${stems}），因合而取、功细而缠绵`, true, '');
      } else if (carriers.some(x => !KU[x])) {
        faAdd(`支${pr}六合，合动财官之支${carriers.join('、')}（藏${stems}），因合而取、功细而缠绵`, true, '');
      } else {
        const c = carriers[0], k = kuOf(BZ, c);
        if (k && k.open) faAdd(`支${pr}六合，财官之支${c}已逢冲刑开库，合解、功在开库一路`, false, `支${c}已开库、合不重计`);
        else faAdd(`支${pr}六合，财官之支${c}为库，逢合锁库、藏而不显，须待冲开`, false, `支${c}逢合锁库`);
      }
    }
    // 三合成财官局：三支全见方成局，局化神为财或官者即聚财官之气
    if (typeof DIZHI_SANHE !== 'undefined') {
      DIZHI_SANHE.forEach(g => {
        if (g.slice(0, 3).every(x => zs.indexOf(x) >= 0) && (isCaiW(g[3]) || isGuanW(g[3]))) {
          faAdd(`支${g[0]}${g[1]}${g[2]}三合${g[3]}局，${isCaiW(g[3]) ? '财' : '官'}局成而气聚，合而取用、其力自厚`, true, '');
        }
      });
    }
    // 冲法：须是藏有财官之支逢冲，方谓冲开财官；库支逢冲归墓法论开库，此处不重计一功。
    // 透干之柱其支未必藏财官，以透干所在支冒称财官之支便是无据之说
    if (typeof pairIn === 'function' && typeof DIZHI_CHONG !== 'undefined') {
      const hit = yoZ.find(o => !KU[o.z] && (BZ.zhis || []).some(pz => pz !== o.z && pairIn(o.z, pz, DIZHI_CHONG)));
      if (hit) faAdd(`财官之支${hit.z}（藏${(HIDE[hit.z] || []).filter(isCG).join('、')}）在命局逢冲，冲开战克中取财官，功猛而带伤`, true, '');
    }
    // 墓法：同一库支在四支中重见只论一次，不叠床架屋；库门未开则藏而待引，不当下便算功成
    Array.from(new Set(BZ.zhis || [])).forEach(z => {
      const k = kuOf(BZ, z);
      if (k) faAdd(k.text, k.open, `支${z}库门未开`);
    });
    const faXing = fa.filter(f => f.xing), faWei = fa.filter(f => !f.xing);

    // 五、断成否：体、用、法三者俱备方许言做功成立，缺一则各归其档，不一律称吉。
    // 诸法有得行有不得行者，只以得行之法成其功，不得行之法另作"其余之法须待岁运"交代，
    // 不因一法不行而没了他法之功，也不把待岁运之辞混入总断
    // 体之宫必含日柱（日主自坐主位），体之字落年月则兼借外境之力；用之宫按财官所落之柱
    const tiW = weiOf([{ p: 2 }].concat(tiG)), yoW = weiOf(yongArr);
    const weiSay2 = faWei.length ? `；另有不得行之法须待岁运（${faWei.map(f => f.why).join('；')}）` : '';
    let chengT;
    if (child) {
      // 小儿档：断在根基、学业、家中照应三事，不出财官可得其手一类成人断
      const ji = tiLi.indexOf('无根') >= 0 ? '根基浅薄、宜慎护持养'
        : (tiLi.indexOf('得禄旺') >= 0 ? '根基厚实、长养有本' : '根基平稳、可循序长养');
      const xue = pG ? `${pG.t}${pG.g}为文书学业之凭，读书之事有承`
        : (sG ? `${sG.t}${sG.g}为才艺之字，聪明外显、宜引导向学` : '天干不见印星食伤，学业之凭未透');
      const zhao = (tiW && tiW.both) ? '体之字主宾兼落，家中照应与自身长养兼得' : '体之字落主位，长养照应皆在自身与家中';
      chengT = `小儿论命重根基长养，${ji}；${xue}；${zhao}`;
    }
    else if (yongXian === '不现') chengT = '四柱干支不见财官，无可用做功，须待岁运引出财官方有可论';
    else if (tiLi.indexOf('无根') >= 0) chengT = `日主${tiLi}，虽有财官在前而力不逮，宜先固本、借岁运通根再论`;
    else if (!faXing.length && fa.length) chengT = `体${tiLi}、用${yongXian}，而取用之法不得行于今（${faWei.map(f => f.why).join('；')}），须待岁运引出方有其功`;
    else if (!fa.length) chengT = '有体有用而五法皆不得行，财官在前而无取之之径，宜守常积势、勿强求';
    else chengT = `体${tiLi}、用${yongXian}、取用之法得行，三者俱备，做功成立，财官可得其手${weiSay2}`;

    const mergeName = arr => Array.from(new Set(arr.map(o => word(o.t) + o.g))).join('、');
    const tiName = '日主' + dg + (tiG.length ? '并' + mergeName(tiG) : '');
    const yoName = yoG.length ? mergeName(yoG) : (yoZ.length ? '支藏之财官' : '财官');
    const faTxt = fa.length ? fa.map(f => f.t).join('；') : '五法皆不得行';
    let text = `体为${tiName}（皆我之身与所恃）`;
    if (tiW) text += `，落${tiW.labs}、${weiSay(tiW, false)}`;
    text += `，日主${tiLi}；`;
    if (yongXian === '不现') text += '四柱不见财官，无可为用';
    else {
      text += `用为${yoName}（皆我所求），${yongXian}`;
      if (yoW) text += `、落${yoW.labs}、${weiSay(yoW, true)}`;
    }
    text += `。取用之法：${faTxt}。`;
    text += `断：${chengT}。`;
    text += '（体用宾主与做功五法出自盲师口传、段建业整理之体系，此条据此推演）';
    return { text };
  }

  /* 病破做功（本命）：结构病中伤及体之根（日支与藏干同于日主之支）或财官之支者，
     出一句病破做功、须药解。病药之判定归 bazi-data.js 的 structDisease，本件只按其关系文本
     所标之支挑拣与成句；取最重者一条（structDisease 已按严重度排序），宁缺毋滥。 */
  function gongBreak(BZ, structDisease) {
    if (!BZ || !BZ.dayGan || !structDisease || !structDisease.length) return null;
    const dg = BZ.dayGan, dwx = GAN_WX[dg], zs = BZ.zhis || [];
    const dayZ = BZ.dayZ || zs[2] || '';
    const rootZ = zs.filter(z => z === dayZ || (HIDE[z] || []).some(x => GAN_WX[x] === dwx));
    const cgZ = zs.filter(z => (HIDE[z] || []).some(x => { const c = shenCat(tenGod(dg, x)); return c === '财星' || c === '官杀'; }));
    const hit = structDisease.filter(d => d && d.kind === '病')
      .map(d => ({ d, zz: Array.from(new Set(zs.filter(z => (d.rel || '').indexOf(z) >= 0))) }))
      .find(o => o.zz.some(z => rootZ.indexOf(z) >= 0 || cgZ.indexOf(z) >= 0));
    if (!hit) return null;
    const ti = hit.zz.filter(z => rootZ.indexOf(z) >= 0);
    const cg = hit.zz.filter(z => rootZ.indexOf(z) < 0 && cgZ.indexOf(z) >= 0);
    const where = (ti.length ? `体之根${ti.join('、')}` : '') + (ti.length && cg.length ? '、' : '') + (cg.length ? `财官之支${cg.join('、')}` : '');
    return `结构病在${hit.d.rel}，伤及${where}，病破做功、` + (hit.d.yaoWx ? `须以${hit.d.yaoWx}为药解` : '须药解');
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
    xiGz, xiangText, zuoGongTxt, binZhuText, kuOf, kuStep, xuTouOf, xuShiStep, borrowable, shaChain,
    kongText, nayinXiang, gongChain, gongBreak
  };
  if (typeof window !== 'undefined') window.MangPai = MangPai;
  if (typeof module !== 'undefined' && module.exports) module.exports = MangPai;
})();
