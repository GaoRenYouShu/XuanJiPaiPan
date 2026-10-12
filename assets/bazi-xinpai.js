/* ============================================================================
 * bazi-xinpai.js：新派命理量化推演层（唯一真源）
 * ----------------------------------------------------------------------------
 * 学术定位：新派以日主旺衰为纲，量化平衡求中和。先以得令、得地、得势三因子定日主分数
 *   与档位，再按扶抑取用神（身强宜抑、身弱宜扶、中和则不拘），末以五行能量档与干支
 *   落处量用神可恃几成。与格局派求月令用神、盲派求做功财官各是一路。
 * 真源纪律：五行能量分与能量五档走 bazi-rel.js 的 wxElementScore 与 wxTier（全站唯一
 *   定义），藏干走 bazi-data.js 的 HIDE 与 GAN_WX，旬空走 kongWang，六冲走 DIZHI_CHONG；
 *   本文件不另立能量算法与空亡表，日主三因子分数与扶抑喜忌亦只读 getAnalysis 已算之值。
 * 加载序：bazi-data.js 与 bazi-rel.js 之后、bazi-core.js 之前（见 bazi.html）。
 *   依赖（window 全局）：GAN_WX、HIDE、DIZHI_CHONG、kongWang、wxElementScore、wxTier
 *   （一律函数内运行时取用，本文件顶层零依赖），任何加载环境不白屏。
 * 对外接口 window.XinPai：
 *   数据：LIANG_TIER 用神力度五档；KONG_NOTE 空亡三态
 *   判定：yongLiOf 单五行用神力度；kongTiao 空亡条目；liangHuaChain 量化推演链
 * 消费方：bazi-core.js 各流派解读格局（新派段）。去重与年龄门控属调用方职责，
 *   本层纯函数、无运行时状态。
 * ========================================================================== */
(function () {
  'use strict';

  /* ============================ 理法：用神力度五档 ============================ */
  /* 新派既取扶抑用神，便要量其可恃几成，不使取了用神即径算用神得力。
     档由两轴合成：落处（透干与否、得根与否）与根之虚实（根落空亡则减）。 */
  const LIANG_TIER = {
    '有力': '透干得根而根不落空，扶抑之字在局中实有其力',
    '待引': '藏支得根而未透，力在局中而未显，须待岁运透出',
    '力浮': '透干而根落空亡，力浮不实，须待填实方见其功',
    '虚浮': '透干而无根，力浮于上、无根可恃，须待岁运通根',
    '不现': '命局干支不见，扶抑无本，须岁运全力引出'
  };
  const LIANG_ORDER = ['有力', '待引', '力浮', '虚浮', '不现'];

  /* ============================ 技法：空亡三态 ============================ */
  /* 新派重空亡，以空为减、以实为转；填实与冲实皆古法空亡论所有，本站同此口径 */
  const KONG_NOTE = {
    '落空': '落空亡，空者虚而不实',
    '填实': '逢本支岁运填实则转实',
    '冲实': '逢六冲之支冲动亦转实'
  };

  /* 旬空两支（由 kongWang 真源派生，本层不存旬空表） */
  function kongZhis(BZ) {
    const kw = (typeof kongWang === 'function') ? kongWang((BZ.gans || [])[2] + (BZ.zhis || [])[2]) : null;
    return (kw && kw.length) ? kw : [];
  }
  /* 某五行透出之干（日主自坐之干不计：日主是被扶抑者，不是扶抑他干） */
  function touOfWx(BZ, wx) {
    const out = [];
    (BZ.gans || []).forEach((g, i) => { if (i !== 2 && GAN_WX[g] === wx) out.push({ g: g, p: i }); });
    return out;
  }
  /* 某五行得根之支（地支藏干见该五行即为根，日支亦在其列） */
  function rootsOfWx(BZ, wx) {
    const out = [];
    (BZ.zhis || []).forEach((z, i) => { if ((HIDE[z] || []).some(h => GAN_WX[h] === wx)) out.push({ zhi: z, p: i }); });
    return out;
  }
  function tierOfWx(BZ, wx) {
    const es = (typeof wxElementScore === 'function') ? wxElementScore(BZ) : null;
    const tr = (typeof wxTier === 'function') ? wxTier : (typeof window !== 'undefined' ? window.wxTier : null);
    return (es && tr) ? tr(es, wx) : '';
  }
  function chongOf(zhi) {
    const dc = (typeof DIZHI_CHONG !== 'undefined') ? DIZHI_CHONG : (typeof window !== 'undefined' ? window.DIZHI_CHONG : null);
    const p = (dc || []).find(c => c[0] === zhi || c[1] === zhi);
    return p ? (p[0] === zhi ? p[1] : p[0]) : '';
  }

  /* 单五行用神力度：能量档与落处合成五档之一 */
  function yongLiOf(BZ, wx) {
    if (!BZ || !wx) return null;
    const tier = tierOfWx(BZ, wx);
    const kSet = new Set(kongZhis(BZ));
    const tou = touOfWx(BZ, wx), root = rootsOfWx(BZ, wx);
    const rootKong = root.filter(o => kSet.has(o.zhi));
    const rootReal = root.filter(o => !kSet.has(o.zhi));
    let li, why;
    if (!tou.length && !root.length) { li = '不现'; why = '命局干支不见' + wx; }
    else if (tou.length && rootReal.length) { li = '有力'; why = '透' + tou.map(o => o.g).join('、') + '、根在' + rootReal.map(o => o.zhi).join('、'); }
    else if (!tou.length && root.length) { li = '待引'; why = '藏于' + root.map(o => o.zhi).join('、') + '而未透'; }
    else if (rootKong.length) { li = '力浮'; why = '透' + tou.map(o => o.g).join('、') + '而根' + rootKong.map(o => o.zhi).join('、') + '落空'; }
    else { li = '虚浮'; why = '透' + tou.map(o => o.g).join('、') + '而无根'; }
    return { wx: wx, tier: tier, li: li, why: why, liNote: LIANG_TIER[li], tou: tou.map(o => o.g), root: root.map(o => o.zhi), rootKong: rootKong.map(o => o.zhi) };
  }

  /* 空亡条目：用神之根落空则力减、忌神之根落空则害减，皆给填实与冲实之由。
     一根落空而另根尚实者不算虚浮，故须五行之根全数落空方出此条（古法"用神之根落空，
     用神虚浮无力"即此）。 */
  function kongTiao(BZ, wx, isJi) {
    if (!BZ || !wx) return '';
    const kSet = new Set(kongZhis(BZ));
    if (!kSet.size) return '';
    const hit = rootsOfWx(BZ, wx).filter(o => kSet.has(o.zhi));
    const real = rootsOfWx(BZ, wx).filter(o => !kSet.has(o.zhi));
    if (!hit.length || real.length) return '';
    return hit.map(o => {
      const c = chongOf(o.zhi);
      const zhuan = KONG_NOTE['填实'] + (c ? '，或逢' + c + '冲' + o.zhi + '、' + KONG_NOTE['冲实'] : '');
      return wx + '之根' + o.zhi + KONG_NOTE['落空'] + '，' + (isJi ? '忌神之害自减' : '用神之力自减') + '；' + zhuan;
    }).join('；');
  }

  /* 量化推演链：定纲（旺衰分数与档位）与定用（扶抑喜忌）两步取自 getAnalysis 之真源，
     本层自量用起：量用（用神可恃几成，以能量五档与干支落处合成）→ 空亡（根落空亡者
     力减，并给填实、冲实之由）→ 断（扶抑能行几分）。量只此一条，不另立一套分数。 */
  function liangHuaChain(BZ, A) {
    if (!BZ || !BZ.dayGan || !BZ.gans || BZ.gans.length < 4 || !BZ.zhis || BZ.zhis.length < 4 || !A || !A.fu) return null;
    const xiWx = (A.fu.xiWx || []).filter(Boolean), jiWx = (A.fu.jiWx || []).filter(Boolean);
    const xiCats = A.fu.xiCats || [];
    const fang = xiCats.indexOf('官杀') >= 0 ? '抑' : (xiCats.indexOf('比劫') >= 0 ? '扶' : '');

    let text = '';
    /* 能量分数与档位取自 wxElementScore 与 wxTier 真源，只用真源算得之档，缺则不吹档 */
    const eS = (typeof wxElementScore === 'function') ? wxElementScore(BZ) : null;
    const li = xiWx.map(w => yongLiOf(BZ, w)).filter(Boolean);
    if (li.length) text += '量用（用神可恃几成）：' + li.map(r => r.wx + r.li + '（' + r.why + (r.tier ? '，能量' + r.tier : '') + '）').join('；') + '。';
    const jiTxt = jiWx.map(w => w + (eS ? '（' + Math.round(eS[w] || 0) + ' 分）' : '')).join('、');
    if (jiTxt) text += '忌神：' + jiTxt + '。';

    const kongs = [];
    /* 用神已判力浮者，其"根落空"已由量用一句道尽，此处不再重出；忌神之根落空则害减，
       量用不及忌神落处，故须另出一条 */
    li.forEach(r => { if (r.li !== '力浮') { const t = kongTiao(BZ, r.wx, false); if (t) kongs.push(t); } });
    jiWx.forEach(w => { const t = kongTiao(BZ, w, true); if (t) kongs.push(t); });
    if (kongs.length) text += '空亡：' + kongs.join('；') + '。';

    let duan;
    if (!fang || !li.length) duan = '日主中和、扶抑不拘，量化所见止于五行之偏，宜以调候通关为急';
    else {
      let best = li[0];
      li.forEach(r => { if (LIANG_ORDER.indexOf(r.li) < LIANG_ORDER.indexOf(best.li)) best = r; });
      const jiWang = jiWx.filter(w => tierOfWx(BZ, w) === '过旺');
      if (best.li === '有力') duan = '扶抑得力，' + best.wx + '在局中实有其力，宜守而勿使受伤'
        + (li.length > 1 ? '；余行未同此厚，中和之功未全，仍须岁运补其不足' : '');
      else if (best.li === '待引') duan = '扶抑之字藏支未透，须待岁运透出方有其用';
      else if (best.li === '力浮') duan = '扶抑有本而根落空亡，须待填实方见其功';
      else if (best.li === '虚浮') duan = '扶抑之字虚浮无根，须待岁运通根方有其力';
      else duan = '扶抑无本，原局无可用之字，须待岁运引出方有其功';
      if (jiWang.length) duan += '；' + jiWang.join('、') + '为忌而势旺，扶抑之行愈急';
    }
    text += '断（扶抑能行几分）：' + duan + '。';
    text += '（旺衰扶抑与三得之说，民国徐乐吾、袁树珊、韦千里诸家以旺衰定用神一路所主；空亡填实与冲实之说出自古法空亡论，此条据此推演）';
    return { text: text, duan: duan, liang: li.map(r => ({ wx: r.wx, li: r.li, tier: r.tier })), kong: kongs };
  }

  window.XinPai = {
    LIANG_TIER: LIANG_TIER, LIANG_ORDER: LIANG_ORDER, KONG_NOTE: KONG_NOTE,
    yongLiOf: yongLiOf, kongTiao: kongTiao, liangHuaChain: liangHuaChain
  };
})();
