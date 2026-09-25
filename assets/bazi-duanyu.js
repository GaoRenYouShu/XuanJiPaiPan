/* 命理断语库（数据层）
 * 设计：结构化条件 when + 改写模板 say + 古籍出处 src
 * 原则：不照搬古籍原文，改述其意；条件判定复用引擎已算字段（BZ / getAnalysis 产物），不在库内重算。
 * when 字段（多字段之间为 AND 关系）：
 *   ten     : {十神名:'>=2'|'>=1'|'==0'|数量}  四柱十神计数（天干+地支本气+藏干）
 *   sha     : ['华盖',...]                     命局四柱含任一神煞（字符串包含匹配）
 *   strength: ["身强","中和偏弱","身弱"]        旺衰命中其一（A.strength）
 *   element : {五行:'>=3'}                     量化五行旺衰档位（弱1/中2/强3，缺0；源自量化四柱能量分，>=3=强）
 *   pattern : ['杀印相生',...]                 组合/结构格局（detectPatterns 计算）
 *   yong    : 'xi'|'ji'                        （预留）用神类
 *   ge      : '正官格'                         格局名（A.geName 包含）
 *   sex     : '男'|'女'                        性别门控
 *   day     : ['乙']                           日干在列表中
 *   dz      : ['辰']                           日支在列表中
 *   mz      : ['寅']                           月支在列表中
 *   zhiAll  : ['子','午']                      四柱地支须同时包含所列全部地支（"子午逢之"须子午俱现）
 *   hideTen : ['正财','偏财']                  所列十神须不透干（"财神忌透只宜藏"=财藏；与 touGan 相反）
 *   szEmpty : true                             时支落旬空（"时落空亡"，空亡须落时柱，防全柱空亡误触发）
 *   yy      : '纯阳'|'纯阴'|'阳盛'|'阴盛'       四柱干支+藏干阴阳偏盛判定（纯阴阳/偏盛，供纯阴纯阳性情姻缘类断语）
 * pattern（结构）扩充，特殊结构少见格：天元一气（四柱天干全同）/ 地物合一（四柱地支全同），
 *   名芝兰并秀格，见《三命通会·卷六·一气生成》，勿以比肩论。
 * pattern（结构）扩充，四柱全同（四柱干支并同，如四癸亥）：天元一气+地物合一兼，一气生成之极格；
 *   dayGZ 同 + pattern['四柱全同']：四柱全同时日柱干支即每柱干支，dayGZ 足以锁定具体干支持、零误伤。
 * say：改写后的断语；{dayGan}→日主天干、{yong}→首选用神五行、{ws}→旺衰。
 *
 * 调用原则：断语以 when 为唯一判定，单条件满足即调用、多条件须全满足；
 *   不设调用层额外门控；神煞/结构出现即判定。断语专业准确、有指向性即保留；
 *   条件不精确则扩展引擎设定条件（胎元 _taiYuan、不透干 hideTen、时柱空亡 szEmpty、
 *   华盖时胎/月胎岁合/月胎被犯/墙外桃花=时上桃花 等 pattern），而非删断语。
 *
 * src 引用规范（硬约束，禁止生造）：
 *   1. 只用真实存在的典籍与篇名；篇名只到该书确有的层级，不得为凑条目编造子篇。
 *   2. 可用白名单（已按真实篇目核实）：
 *      《三命通会》真实篇（卷七论断，含子平说辩）：论性情相貌、论疾病先知五脏六腑所属干支、
 *        论贫贱凶恶、论寿夭、论女命、论小儿、论六亲、定妇人孕生男女。
 *      《三命通会》真实篇（卷五格局）：论正官、论偏官、论正财、论偏财、偏正财合论、论印绶、
 *        论倒食(偏印)、论杂气、论伤官、论食神、论阳刃(卷五格局)、论建禄。
 *      《三命通会》真实篇（卷二/卷三神煞）：论太岁、论支元六合、论三刑、论冲击、论十干禄、
 *        论驿马、论天乙贵人、论天月德、论学堂词馆、论正印、论将星华盖、论咸池(＝桃花)、
 *        论羊刃(神煞)、论空亡、论孤辰寡宿、论灾煞、论劫煞亡神。
 *      《子平真诠》真实篇：论用神、论正官、论偏官、论财、论印绶、论食神、论伤官、论阳刃、
 *        论建禄月劫、论妻子、论行运。
 *      《滴天髓》(清，征义本篇目)真实篇：旺衰（原文/newdu本作"论衰旺"，同章）、中和（第十章论体用）、官煞（第七章论八格）、
 *        论疾病（第十七章）、性情（第十六章）、论穷通（第十五章）、论兄弟（第04章 兄弟），引用时标《滴天髓·论X》。
 *      《渊海子平》真实篇/赋：论妻妾、论子息、论父、论母、论兄弟姊妹、论妇人总诀、阴命赋、
 *        女命富贵贫贱篇、女命贵格、女命贱格、女命总断歌、正官论、论七杀、论征太岁、论魁罡（卷三，
 *        原文"夫魁罡者有四…主人性格聪明、文章振发、临事有断"）、五行元理消息赋、继善篇、喜忌篇、四言独步、五言独步。
 *      《穷通宝鉴》（调候，卷首五行总论/论木火土金水，各卷论X木火土金水总论 + 某月X）、《神峰通考》
 *        （病药说类、六亲说、雕枯旺弱四病说类、损益生长四药说类、论比劫"夫比劫者，阳见阳…"）、《命理约言》
 *        （看比劫禄刃法、比劫赋、禄刃赋、论伤官、论印绶等）、《玉照定真经》、《李虚中命书》。
 *      古赋（真实存在，多收于上列类书）：《相心赋》《继善篇》《爱憎赋》《碧渊赋》《幽微赋》
 *        《明通赋》《五言独步》《四言独步》《金声玉振赋》《络绎赋》《寸金搜髓歌》。
 *   3. 禁用示例（系生造/错配，杜绝使用）：《五行大义·金》（书目错配，该书不载命理断语）、
 *      《滴天髓·比劫、强弱、身财、无依、弱无助、财》《子平真诠·官杀混杂、杀印》（无此独立篇）、
 *      《三命通会·论财、论性情、论贫富、论贵贱、论桃花、论华盖、论六合、论女命·总歌》（篇名错/自造，真实篇见上）、
 *      《三命通会·论六亲·子息引例章》（编造子篇，只到"论六亲"）、《神峰通考·六亲赋》（实为"六亲说"）、
 *      《三命通会·论征太岁》（三命无此篇，征太岁见《渊海子平》）、《玉照定真经·丧门吊客》（韵文体无子篇）、
 *      《三命通会·论妻妾、论子息、论父母、论魁罡》（三命通会无此独立篇：六亲见卷七"论六亲"，魁罡见《渊海子平·论魁罡》）。
 *   4. 无法归入确切篇目的流传口诀，就近归入该书真实大篇（如《三命通会·论贫贱凶恶》），
 *      仍无处可归则标古赋名，绝不臆造。
 *   5. 确系民间流传口诀、非典籍原文者，src 直书"民间流传口诀"，不得冒充典籍篇目。
 *
 * when 写法禁忌：同一 when 内不得重复键（如 ten 写两次会被后者覆盖，导致复合条件失效），
 *   多条件须合并进同一对象：ten:{'正财':'>=1','偏财':'>=1'}。
 */
(function (global) {
  const G = global;
  // 说明：页面 bazi-data.js / app.js 里 HIDE、GAN_WX 是顶层 const，不会挂到 window，
  //       故此处自带同源副本（小常量复制优于跨脚本耦合），仅在全局确实可取时优先用全局。
  const HIDE_T = G.HIDE || {
    子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'], 卯: ['乙'],
    辰: ['戊', '乙', '癸'], 巳: ['丙', '庚', '戊'], 午: ['丁', '己'], 未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'], 酉: ['辛'], 戌: ['戊', '辛', '丁'], 亥: ['壬', '甲']
  };
  const GAN_WX_T = G.GAN_WX || {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水'
  };
  const tenGod = (dg, og) => (G.tenGod ? G.tenGod(dg, og) : undefined);
  const zhiMain = (z) => (G.zhiMain ? G.zhiMain(z) : ((HIDE_T[z] && HIDE_T[z][0]) || z));

  // 四柱天干/地支：页面 BZ 用 gans / zhis
  function _gans(BZ) { return (BZ && BZ.gans) || []; }
  function _zhis(BZ) { return (BZ && BZ.zhis) || []; }

  // ---------- 基础辅助（纯读 BZ，不写业务） ----------
  function _allSha(BZ) {
    return (BZ.shaYear || []).concat(BZ.shaMonth || [], BZ.shaDay || [], BZ.shaTime || []);
  }
  // 十神类→成员清单（供 _countTen 类名扩展开销，使 when.ten 支持类名如 '财星'/'官杀' 等）
  const TEN_CLASS_MEMBERS = {
    '比劫': ['比肩', '劫财'],
    '食伤': ['食神', '伤官'],
    '财星': ['正财', '偏财'],
    '官杀': ['正官', '七杀'],
    '印星': ['正印', '偏印']
  };
  function _countTen(BZ, name) {
    const dg = BZ.dayGan;
    // 类名展开：'财星' → 正财+偏财 合计，'官杀' → 正官+七杀 合计，以此类推
    const members = TEN_CLASS_MEMBERS[name];
    if (members) {
      let sum = 0;
      members.forEach(m => { sum += _countTen(BZ, m); });
      return sum;
    }
    let n = 0;
    _gans(BZ).forEach(g => { if (g && tenGod(dg, g) === name) n++; });
    _zhis(BZ).forEach(z => {
      if (!z) return;
      (HIDE_T[z] || []).forEach(h => { if (tenGod(dg, h) === name) n++; });
    });
    return n;
  }
  function _elementCount(BZ) {
    const cnt = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    _gans(BZ).forEach(g => { const w = GAN_WX_T[g]; if (w) cnt[w]++; });
    _zhis(BZ).forEach(z => { if (!z) return; (HIDE_T[z] || []).forEach(h => { const w = GAN_WX_T[h]; if (w) cnt[w]++; }); });
    return cnt;
  }
  // 十神类 → 五行（统一引用 bazi-data.js 唯一真源 catToWx；本表仅为兼容独立测试环境的副本，勿再改语义）
  // 五行生克表：与 bazi-data.js 的 WX_SHENG/WX_KE 同源（我生/我克），优先取词法真源，失败才回落副本。
  const WX_SHENG_OF = (typeof WX_SHENG !== 'undefined') ? WX_SHENG : { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // 我生（食伤）
  const WX_KE_OF    = (typeof WX_KE !== 'undefined') ? WX_KE : { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };       // 我克（财星）
  const WX_SHENG_BY = (() => { if (typeof WX_SHENG !== 'undefined') { const r = {}; for (const w in WX_SHENG) r[WX_SHENG[w]] = w; return r; } return { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }; })(); // 生我（印星）= 真源逆表
  const WX_KE_BY    = (() => { if (typeof WX_KE !== 'undefined') { const r = {}; for (const w in WX_KE) r[WX_KE[w]] = w; return r; } return { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' }; })();    // 克我（官杀）= 真源逆表
  const TEN_GROUP = (typeof TEN_CLASS !== 'undefined') ? TEN_CLASS : { '比肩': '比劫', '劫财': '比劫', '正印': '印星', '偏印': '印星', '食神': '食伤', '伤官': '食伤', '正财': '财星', '偏财': '财星', '正官': '官杀', '七杀': '官杀' };
  function catToWx(cat, BZ) {
    // 统一委托数据层唯一真源（window.catToWx），防同义表散落导致喜忌口径分叉；仅真源不可用时回落本地同源逻辑。
    if (typeof window !== 'undefined' && window.catToWx) return window.catToWx(cat, BZ);
    const dwx = GAN_WX_T[BZ.dayGan]; if (!dwx) return null;
    const grp = TEN_GROUP[cat] || cat;
    if (grp === '比劫') return dwx;
    if (grp === '印星') return WX_SHENG_BY[dwx];
    if (grp === '食伤') return WX_SHENG_OF[dwx];
    if (grp === '财星') return WX_KE_OF[dwx];
    if (grp === '官杀') return WX_KE_BY[dwx];
    return null;
  }
  // 量化五行旺衰档位（替代朴素藏干计数）：直接调用 xuanji-lib 的 wxElementScore / wxStrength，
  // 与“量化四柱”表的“五行旺衰”列同源同口径。档位：真缺(能量分=0)=0 / 弱=1 / 中=2 / 强=3。
  // DUANYU 的 element:{'土':'>=3'} 等整数阈值即按此档位解读（>=3=强、>=2=中或强、>=1=存在）。
  const _tierRank = { 强: 3, 中: 2, 弱: 1 };
  const _tierCache = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
  function _elementTier(BZ) {
    if (_tierCache && _tierCache.has(BZ)) return _tierCache.get(BZ);
    const zero = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    const sc = (G.wxElementScore ? G.wxElementScore(BZ) : null);
    const st = (G.wxStrength ? G.wxStrength(BZ) : null);
    const out = (sc && st) ? {} : null;
    if (out) {
      for (const w of ['金', '木', '水', '火', '土']) {
        out[w] = (sc[w] > 0) ? (_tierRank[st[w]] || 1) : 0; // 真缺记 0；档位未知兜底为弱
      }
    }
    const res = out || _elementCount(BZ); // 兜底：量化模块未就绪时回退朴素计数
    if (_tierCache) _tierCache.set(BZ, res);
    return res;
  }
  function _ganHas(BZ, names) {
    const dg = BZ.dayGan; return _gans(BZ).some(g => g && names.indexOf(tenGod(dg, g)) >= 0);
  }
  // 羊刃地支（日主）：甲卯 乙辰 丙戊午 丁己巳 庚酉 辛戌 壬子 癸丑
  const YANGREN = { 甲: '卯', 乙: '辰', 丙: '午', 戊: '午', 丁: '巳', 己: '巳', 庚: '酉', 辛: '戌', 壬: '子', 癸: '丑' };
  function _hasYangren(BZ) { const y = YANGREN[BZ.dayGan]; return !!y && _zhis(BZ).indexOf(y) >= 0; }
  const CHONG = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
  function _chong(a, b) { return CHONG.some(p => (p[0] === a && p[1] === b) || (p[1] === a && p[0] === b)); }
  function _hasSanxing(zs) {
    const has = s => zs.indexOf(s) >= 0;
    if (has('寅') && has('巳') && has('申')) return true;       // 无恩之刑
    if (has('丑') && has('戌') && has('未')) return true;       // 恃势之刑
    if (has('子') && has('卯')) return true;                    // 无礼之刑
    return ['辰', '午', '酉', '亥'].filter(h => zs.filter(z => z === h).length >= 2).length > 0; // 自刑
  }
  // 胎元（月柱干支顺推：天干+1、地支+3；"三犯月胎/月胎岁合/华盖在胎"类断语需要）
  function _taiYuan(BZ) {
    try {
      const mg = _gans(BZ)[1], mz = _zhis(BZ)[1];
      if (!mg || !mz) return '';
      const GS = '甲乙丙丁戊己庚辛壬癸', ZS = '子丑寅卯辰巳午未申酉戌亥';
      return GS[(GS.indexOf(mg) + 1) % 10] + ZS[(ZS.indexOf(mz) + 3) % 12];
    } catch (e) { return ''; }
  }
  // 组合/结构格局检测（返回 Set）
  function detectPatterns(BZ, A) {
    const dg = BZ.dayGan, zs = _zhis(BZ), gs = _gans(BZ);
    const cnt = {};
    ['正印', '偏印', '正官', '七杀', '正财', '偏财', '食神', '伤官', '比肩', '劫财'].forEach(n => cnt[n] = _countTen(BZ, n));
    const P = new Set();
    const yin = cnt['正印'] + cnt['偏印'], cai = cnt['正财'] + cnt['偏财'], shang = cnt['食神'] + cnt['伤官'];
    const strong = A && A.strength && A.strength.indexOf('强') >= 0;
    const weak = A && A.strength && A.strength.indexOf('弱') >= 0;
    if (cnt['七杀'] >= 1 && yin >= 1) P.add('杀印相生');
    if (cnt['正官'] >= 1 && yin >= 1) P.add('官印相生');
    // 食伤泄秀：须食伤五行能量档≥中（2），防余气弱食伤也算"泄秀"（能量分口径，非朴素计数）
    const shangWx = WX_SHENG_OF[GAN_WX_T[dg]] || '';
    const shangTier = shangWx ? (_elementTier(BZ)[shangWx] || 0) : 0;
    if (shang >= 1 && strong && shangTier >= 2) P.add('食伤泄秀');
    if (shang >= 1 && cai >= 1) P.add('食伤生财');
    if (cnt['伤官'] >= 1 && cnt['正官'] === 0 && cnt['七杀'] === 0) P.add('伤官伤尽');
    if (cai >= 1 && cnt['正官'] >= 1) P.add('财官相辅');
    if (cai >= 1 && cnt['正官'] >= 1 && yin >= 1) P.add('财官印全');
    if (cnt['七杀'] >= 1 && _hasYangren(BZ)) P.add('杀刃相生');
    // 身旺/身弱财多：不能只按藏干个数（余气弱财也算"财多"），须财星五行力量档 ≥ 中（2）
    // 弱档/余气财不构成"财多"，两个藏干但五行能量占比极低时不得断"身财两旺"
    const caiWx = WX_KE_OF[GAN_WX_T[dg]] || '';
    const caiTier = caiWx ? (_elementTier(BZ)[caiWx] || 0) : 0;
    if (strong && cai > 0 && caiTier >= 2) P.add('身旺财多');
    if (weak && cai > 0 && caiTier >= 2) P.add('身弱财多');
    // 比劫重叠：须比劫五行（日主五行）能量档≥中（2），防余气弱比劫也算"重重/重叠"
    const biJieTier = _elementTier(BZ)[GAN_WX_T[dg]] || 0;
    if ((cnt['比肩'] + cnt['劫财']) > 0 && biJieTier >= 3) P.add('比劫重叠');
    if (cnt['偏印'] >= 1 && cai >= 1 && caiTier >= 2) P.add('财制偏印'); // 财能制枭：须财星档≥中，弱财不"制"
    if (cnt['正官'] >= 1 && cnt['偏印'] >= 1) P.add('正官偏印相生');
    // 印多财露：印多须印星五行档≥中（2），防余气弱印误判"印多"
    const yinWx = WX_SHENG_BY[GAN_WX_T[dg]] || '';
    const yinTier = yinWx ? (_elementTier(BZ)[yinWx] || 0) : 0;
    if (yin > 0 && yinTier >= 2 && _ganHas(BZ, ['正财', '偏财'])) P.add('印多财露');
    if (cai >= 1 && cnt['七杀'] >= 1) P.add('财资七杀');
    if (cnt['伤官'] >= 1 && cnt['正官'] >= 1) P.add('伤官见官');
    if (cnt['正官'] >= 1 && cnt['七杀'] >= 1) P.add('官杀混杂');
    if (cnt['七杀'] >= 1 && _hasYangren(BZ)) P.add('羊刃七杀');
    if (cnt['劫财'] >= 1 && _hasYangren(BZ)) P.add('劫财羊刃');
    const dz = (gs[2] || '') + (zs[2] || '');
    if (['庚辰', '壬辰', '戊戌', '庚戌'].indexOf(dz) >= 0) P.add('魁罡');
    const sha = _allSha(BZ);
    ['驿马', '华盖', '空亡', '桃花', '文昌', '天乙贵人', '禄神', '羊刃', '天德', '月德'].forEach(s => { if (sha.some(x => x.indexOf(s) >= 0)) P.add(s); });
    // 神煞重见/组合（神煞与神煞、神煞与冲刑害合的关系断语）：
    // 计数按实有神煞（filter(Boolean) 防空串），"重重/重见"须 >=2 才有资格论"重"。
    const _shaN = n => sha.filter(Boolean).filter(x => x.indexOf(n) >= 0).length;
    if (_shaN('华盖') >= 2) P.add('华盖重重');
    if (_shaN('天乙贵人') >= 2) P.add('贵人重见');
    // 互禄天乙：禄神与天乙贵人并见（《三命通会·论驿马》"互禄共天乙贵神，同其马位"，禄与贵同辅驿马方成"官秉大权，贵居廊庙"）
    if (_shaN('禄神') >= 1 && _shaN('天乙贵人') >= 1) P.add('互禄天乙');
    if (_shaN('孤辰') >= 1 && _shaN('寡宿') >= 1) P.add('双孤临命');
    // 墙外桃花：桃花落日时柱（《神煞大全》"若时上带之，谓之墙外桃花"，以年支/日支起桃花，落日支或时支者）
    const TAO_P = { '申': '酉', '子': '酉', '辰': '酉', '寅': '卯', '午': '卯', '戌': '卯', '亥': '子', '卯': '子', '未': '子', '巳': '午', '酉': '午', '丑': '午' };
    const taoY = TAO_P[zs[0]] || '', taoR = TAO_P[zs[2]] || '';
    if ((taoY && (zs[2] === taoY || zs[3] === taoY)) || (taoR && zs[3] === taoR)) P.add('墙外桃花');
    // 华盖坐时/胎：华盖（年支/日支三合库）落时支或胎元支（"华盖星辰…生来若在时与胎，便是过房庶出"）
    const HUA_P = { '申': '辰', '子': '辰', '辰': '辰', '寅': '戌', '午': '戌', '戌': '戌', '巳': '丑', '酉': '丑', '丑': '丑', '亥': '未', '卯': '未', '未': '未' };
    const hgPos = HUA_P[zs[0]] || HUA_P[zs[2]] || '', taiZhi = _taiYuan(BZ).slice(1);
    if (hgPos && (zs[3] === hgPos || taiZhi === hgPos)) P.add('华盖时胎');
    // 月胎岁合：胎元支与年支或月支六合（《玉照定真经》"月胎岁合，祖立他门"）
    const HE6_P = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
    if (taiZhi && HE6_P.some(p => (p[0] === taiZhi && (p[1] === zs[0] || p[1] === zs[1])) || (p[1] === taiZhi && (p[0] === zs[0] || p[0] === zs[1])))) P.add('月胎岁合');
    // 月胎被犯：月支或胎元支被四柱他支冲（《玉照定真经》"三犯月胎，祖宗尤祸"，冲犯月柱胎元）
    const CHONG_P = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
    const _chongHit = z => !!z && CHONG_P.some(p => (z === p[0] && zs.indexOf(p[1]) >= 0) || (z === p[1] && zs.indexOf(p[0]) >= 0));
    if (_chongHit(zs[1]) || (taiZhi && _chongHit(taiZhi))) P.add('月胎被犯');
    // 四支冲/合（神煞逢冲/逢合：冲=四支任意两两相冲；合=六合子丑寅亥卯戌辰酉巳申午未）
    const CHONG2 = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
    const hasChongAll = CHONG2.some(p => zs.indexOf(p[0]) >= 0 && zs.indexOf(p[1]) >= 0);
    const HE6 = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
    const hasHe6 = HE6.some(p => zs.indexOf(p[0]) >= 0 && zs.indexOf(p[1]) >= 0);
    if (hasChongAll && _shaN('桃花') >= 1) P.add('桃花逢冲');
    if (hasHe6 && _shaN('桃花') >= 1) P.add('桃花逢合');
    // 桃花逢刑冲：桃花逢冲（hasChongAll）或逢刑（三刑/子卯相刑/自辰午酉亥）皆主财色招灾（《神煞大全》"桃花逢刑冲：多为财色招惹灾"）
    const hasXing = _hasSanxing(zs)
      || (zs.indexOf('子') >= 0 && zs.indexOf('卯') >= 0)
      || ['辰', '午', '酉', '亥'].some(z => zs.filter(x => x === z).length >= 2);
    if (_shaN('桃花') >= 1 && (hasChongAll || hasXing)) P.add('桃花逢刑冲');
    // 子卯相刑：四柱地支子卯并见（《玉照定真经》"子卯相刑，门无礼德"）
    if (zs.indexOf('子') >= 0 && zs.indexOf('卯') >= 0) P.add('子卯相刑');
    if (hasChongAll && _shaN('驿马') >= 1) P.add('驿马逢冲');
    if (_hasSanxing(zs)) P.add('三刑');
    const HAI = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];
    if (HAI.some(p => zs.indexOf(p[0]) >= 0 && zs.indexOf(p[1]) >= 0)) P.add('六害');
    const SANHE = [['申', '子', '辰'], ['亥', '卯', '未'], ['寅', '午', '戌'], ['巳', '酉', '丑']];
    const SANHUI = [['寅', '卯', '辰'], ['巳', '午', '未'], ['申', '酉', '戌'], ['亥', '子', '丑']];
    SANHE.forEach(g => { if (g.every(z => zs.indexOf(z) >= 0)) P.add('三合'); });
    SANHUI.forEach(g => { if (g.every(z => zs.indexOf(z) >= 0)) P.add('三会'); });
    // 官杀无制：正官与七杀并见（官杀混杂）且不见食神制杀、不见印星化杀（《三命通会·论偏官》"官煞混杂，无制反贱"）
    if (cnt['正官'] >= 1 && cnt['七杀'] >= 1 && cnt['食神'] === 0 && yin === 0) P.add('官杀无制');
    // 羊刃带诸恶煞：羊刃（sha）与任一恶煞（劫煞/灾煞/岁煞/元辰/飞刃）并见（《三命通会·论羊刃》"羊刃带诸恶煞尤凶"）
    const _ESHA = ['劫煞', '灾煞', '岁煞', '元辰', '飞刃'];
    if (_shaN('羊刃') >= 1 && _ESHA.some(n => _shaN(n) >= 1)) P.add('羊刃带恶煞');
    // 库马：驿马星（年支/日支起）落于辰戌丑未库地支（《三命通会·论驿马》"库马主少年之喜"）
    const YIMA_P = { '申': '寅', '子': '寅', '辰': '寅', '寅': '申', '午': '申', '戌': '申', '亥': '巳', '卯': '巳', '未': '巳', '巳': '亥', '酉': '亥', '丑': '亥' };
    const yimaStar = YIMA_P[zs[0]] || YIMA_P[zs[2]];
    if (yimaStar && '辰戌丑未'.indexOf(yimaStar) >= 0) P.add('库马');
    const dzm = zhiMain(zs[2] || '');
    const dTen = tenGod(dg, dzm);
    if (dTen === '七杀') P.add('日坐七杀');
    if (dTen === '正官') P.add('日坐正官');
    if (dTen === '伤官') P.add('日坐伤官');
    if (dTen === '正财' || dTen === '偏财') P.add('日坐财');
    if (dTen === '正印' || dTen === '偏印') P.add('日坐印');
    if (dTen === '比肩' || dTen === '劫财') P.add('日坐比劫'); /* 夫妻宫坐比劫：婚姻多争（《神峰通考·论比劫》） */
    // 月令十神（"月令值食""生月官星"类断语须月令本气为某十神，防任意柱食神/官星误触发）
    const mzTenP = tenGod(dg, zhiMain(zs[1] || ''));
    if (mzTenP === '食神') P.add('月令食神');
    if (mzTenP === '正官' || mzTenP === '七杀') P.add('月令官杀');
    if (zs[0] && zs[1] && _chong(zs[0], zs[1])) P.add('年月冲');
    if (zs[2] && zs[3] && _chong(zs[2], zs[3])) P.add('日时冲');
    if (zs[0] && zs[2] && _chong(zs[0], zs[2])) P.add('年日冲');
    if (zs[1] && zs[3] && _chong(zs[1], zs[3])) P.add('月时冲');
    // 五行俱全/偏枯（《滴天髓·论疾病》"五行和者，一世无灾；血气乱者，生平多疾"判定）：
    // 五行力量档真缺（0）即偏枯；五行皆有气力（≥1）为俱全
    const _ec = _elementTier(BZ);
    const _wxAll = ['木', '火', '土', '金', '水'].every(w => (_ec[w] || 0) >= 1);
    if (_wxAll) P.add('五行俱全');
    else P.add('五行偏枯');
    // 天元一气：四柱天干全同（四干纯一不杂，勿以比肩论），《三命通会·卷六·一气生成》"天元一气定尊荣，不杂天干一字清"
    if (gs && gs.length === 4 && gs[0] && gs[1] === gs[0] && gs[2] === gs[0] && gs[3] === gs[0]) P.add('天元一气');
    // 地物合一：四柱地支全同（四支纯一不杂，名芝兰并秀格），同篇"四支纯一不杂…多居两府之贵"
    if (zs && zs.length === 4 && zs[0] && zs[1] === zs[0] && zs[2] === zs[0] && zs[3] === zs[0]) P.add('地物合一');
    // 四柱全同：四柱干支并同（如四癸亥），天元一气与地物合一兼得，一气生成之极格，同篇"四柱干支一气，中间亦有轻重贵贱，须细别之"
    if (gs && gs.length === 4 && zs && zs.length === 4 && gs[0] && zs[0]
      && gs[1] === gs[0] && gs[2] === gs[0] && gs[3] === gs[0]
      && zs[1] === zs[0] && zs[2] === zs[0] && zs[3] === zs[0]) P.add('四柱全同');
    return P;
  }

  // ---------- 步（大运/流年/流月/流日）上下文与复合判定 ----------
  // 步神煞：与 bazi-core.stepSha 同源（年支/日支为基算驿马、桃花、天乙、文昌）
  const YIMA = { '申': '寅', '子': '寅', '辰': '寅', '寅': '申', '午': '申', '戌': '申', '亥': '巳', '卯': '巳', '未': '巳', '巳': '亥', '酉': '亥', '丑': '亥' };
  const TAO = { '申': '酉', '子': '酉', '辰': '酉', '寅': '卯', '午': '卯', '戌': '卯', '亥': '子', '卯': '子', '未': '子', '巳': '午', '酉': '午', '丑': '午' };
  const GUI = { '甲': '丑未', '戊': '丑未', '庚': '丑未', '乙': '子申', '己': '子申', '丙': '亥酉', '丁': '亥酉', '壬': '卯巳', '癸': '卯巳', '辛': '午寅' };
  const WEN = { '甲': '巳', '乙': '午', '丙': '申', '戊': '申', '丁': '酉', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
  function stepShaLocal(gz, BZ) {
    const z = gz[1];
    const dz = BZ.dayZ || (BZ.zhis && BZ.zhis[2]) || '';
    const yz = BZ.yearZ || (BZ.zhis && BZ.zhis[0]) || '';
    const dg2 = BZ.dayGan;
    const out = [];
    if (YIMA[dz] === z || YIMA[yz] === z) out.push('驿马');
    if (TAO[dz] === z || TAO[yz] === z) out.push('桃花');
    if (GUI[dg2] && GUI[dg2].indexOf(z) >= 0) out.push('天乙贵人');
    if (WEN[dg2] === z) out.push('文昌');
    if (YANGREN[dg2] === z) out.push('羊刃');   // 运行羊刃：步支即日主刃支
    return out;
  }
  // 岁运条件所需的基础关系表（与引擎 fanTaiSui / DIZHI_* 同源，小常量自带副本优于跨脚本耦合）
  const GAN_HE_T = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
  const WX_KE_T = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const ZHI_WX_T = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  const MU_OF_T = { 木: '未', 火: '戌', 土: '戌', 金: '丑', 水: '辰' };   // 五行墓库
  const HAI_T = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];
  const PO_T = [['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌']];
  function _pairIn(list, a, b) { return list.some(p => (p[0] === a && p[1] === b) || (p[1] === a && p[0] === b)); }
  function _ganKe(a, b) { return !!(a && b) && WX_KE_T[GAN_WX_T[a]] === GAN_WX_T[b]; }   // a 克 b
  function _xing2(a, b) {
    if (!a || !b) return false;
    const wu = { 寅: '巳', 巳: '申', 申: '寅' }, shi = { 丑: '戌', 戌: '未', 未: '丑' };
    if (wu[a] === b || wu[b] === a) return true;
    if (shi[a] === b || shi[b] === a) return true;
    if ((a === '子' && b === '卯') || (a === '卯' && b === '子')) return true;
    return a === b && ['辰', '午', '酉', '亥'].indexOf(a) >= 0;   // 自刑
  }
  // 由所选步 s 构造步上下文：步仅单一干支，十神/五行/长生/神煞皆就这一步算。
  // ext（可选）= { age: 该步命主年龄, yunGz: 同屏所选大运干支, yunLast: 该步是否大运末年 }，
  // 由渲染层按 selMeta 实算后传入；缺省则相关条件字段为 null/false，条目自然不触发（不臆测）。
  function stepCtxOf(s, BZ, ext) {
    const dg = BZ.dayGan;
    const gz = s.gz || '';
    const g = gz[0] || '', z = gz[1] || '';
    const ganTen = tenGod(dg, g);
    const zhiTen = tenGod(dg, zhiMain(z));
    const cs = (G.getChangSheng ? G.getChangSheng(dg, z) : '');
    const wx = (G.nayinWxOf ? G.nayinWxOf(gz) : '');
    const sha = stepShaLocal(gz, BZ);
    const E = ext || {};
    const gs = _gans(BZ), zs = _zhis(BZ);
    const yg = BZ.yearGan || gs[0] || '', yz = BZ.yearZ || zs[0] || '';
    // 太岁关系：太岁即值年之神，唯流年当之，大运/流月/流日不称太岁，故只在流年层计算，杜绝串层误报
    const tai = [];
    if (s.lvl === '流年' && z && yz) {
      if (z === yz) tai.push('值');
      if (_chong(z, yz)) tai.push('冲');
      if (_pairIn(HAI_T, z, yz)) tai.push('害');
      if (_pairIn(PO_T, z, yz)) tai.push('破');
      // 自刑（辰午酉亥同支）已由值涵盖，不再叠报刑，只取三刑之真犯，免本命年重话
      if (z !== yz && _xing2(z, yz)) tai.push('刑');
      if (gz && yg && gz === (yg + yz)) tai.push('征');            // 生年干支重现
      if (_ganKe(g, yg) || _ganKe(yg, g)) tai.push('战');          // 岁运干支相战
      if (GAN_HE_T[g] === dg) tai.push('合');                      // 岁干合日干
    }
    // 冲克宫位：步支冲四柱各宫；日柱另辨天克地冲
    const clashYear = !!(z && zs[0] && _chong(z, zs[0]));
    const clashMonth = !!(z && zs[1] && _chong(z, zs[1]));         // 冲月令提纲
    const clashDayZhi = !!(z && zs[2] && _chong(z, zs[2]));        // 冲夫妻宫
    const clashTime = !!(z && zs[3] && _chong(z, zs[3]));
    const clashDay = clashDayZhi && _ganKe(g, dg);                 // 天克地冲日柱
    let clashGuan = false;
    zs.forEach(pz => { if (pz && tenGod(dg, zhiMain(pz)) === '正官' && _chong(z, pz)) clashGuan = true; });
    const yrZ = YANGREN[dg] || '';
    const clashYangRen = !!(yrZ && zs.indexOf(yrZ) >= 0 && _chong(z, yrZ));
    const sanXingChong = _hasSanxing(zs) && zs.some(pz => !!pz && _chong(z, pz));
    // 六亲：步干克年干、年支入步支之墓（丧父之占的两个前件，须并见方论）
    const keYearGan = _ganKe(g, yg);
    const yearZhiMu = !!(yz && z && MU_OF_T[ZHI_WX_T[yz]] === z);
    // 合动财星（男命早娶之占）：步干与命局财星天干相合
    let heCai = false;
    gs.forEach(pg => { if (pg && GAN_HE_T[g] === pg) { const t = tenGod(dg, pg); if (t === '正财' || t === '偏财') heCai = true; } });
    // 步支落日柱旬空
    let empty = false;
    try { const k = G.kongOf ? G.kongOf((gs[2] || '') + (zs[2] || '')) : null; if (k && k.indexOf(z) >= 0) empty = true; } catch (e) { empty = false; }
    const suiYunBingLin = !!(E.yunGz && gz === E.yunGz && s.lvl === '流年');
    const yunJiaoTuo = !!E.yunLast;
    const age = (typeof E.age === 'number' && isFinite(E.age)) ? E.age : null;
    // 天合地合（经典断语）：步干与某柱天干相合、且步支与该柱地支六合，干合支合、天地同合。
    // 布尔 tianHeDiHe 供 STEP_BOOL_KEYS 判定；tianHeDiHeZhu 记录柱名供断语 {heZhu} 替换（六合表自带副本，同 HE6）。
    let tianHeDiHe = false, tianHeDiHeZhu = '';
    {
      const HE6_2 = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
      gs.forEach((pg, pi) => { const pz = zs[pi]; if (!pg || !pz) return;
        if (GAN_HE_T[g] === pg && _pairIn(HE6_2, z, pz)) { tianHeDiHe = true; tianHeDiHeZhu = ['年柱','月柱','日柱','时柱'][pi]; } });
    }
    return {
      gz, g, z, ganTen, zhiTen, cs, wx, sha, lvl: s.lvl,
      tai, clashYear, clashMonth, clashDayZhi, clashTime, clashDay,
      clashGuan, clashYangRen, sanXingChong, keYearGan, yearZhiMu,
      heCai, empty, suiYunBingLin, yunJiaoTuo, age,
      tianHeDiHe, tianHeDiHeZhu
    };
  }
  // 布尔型步条件字段：条目写 true 才判定，未写则不参与（避免"未写＝要求为假"的误伤）
  const STEP_BOOL_KEYS = ['clashYear', 'clashMonth', 'clashDayZhi', 'clashTime', 'clashDay',
    'clashGuan', 'clashYangRen', 'sanXingChong', 'keYearGan', 'yearZhiMu',
    'heCai', 'empty', 'suiYunBingLin', 'yunJiaoTuo', 'tianHeDiHe'];
  // 步条件判定（when.step）：步上下文字段与条目条件比对。步仅单一干支，十神/五行取等义。
  function _matchStep(step, sc) {
    if (!sc || !sc.gz) return false;
    if (step.gz) { if (step.gz.indexOf(sc.gz) < 0) return false; }
    if (step.g) { if (step.g.indexOf(sc.g) < 0) return false; }
    if (step.z) { if (step.z.indexOf(sc.z) < 0) return false; }
    if (step.lvl) { if (step.lvl.indexOf(sc.lvl) < 0) return false; }
    if (step.ganTen) { if (!_inTen(step.ganTen, sc.ganTen)) return false; }
    if (step.zhiTen) { if (!_inTen(step.zhiTen, sc.zhiTen)) return false; }
    if (step.sha) { if (!step.sha.some(x => (sc.sha || []).indexOf(x) >= 0)) return false; }
    if (step.wx) { if (!_inTen(step.wx, sc.wx)) return false; }
    if (step.cs) { if (step.cs.indexOf(sc.cs) < 0) return false; }
    if (step.tai) { if (!step.tai.some(x => (sc.tai || []).indexOf(x) >= 0)) return false; }
    // 年龄门控：年龄未知时一律不放行，杜绝 null 被当 0 而误报少年断语。
    // 写法：age:'<18' 单条件；age:['>=18','<=60'] 区间（数组内为 AND）
    if (step.age) {
      if (typeof sc.age !== 'number') return false;
      const conds = Array.isArray(step.age) ? step.age : [step.age];
      for (let i = 0; i < conds.length; i++) { if (!_cmp(sc.age, conds[i])) return false; }
    }
    for (let i = 0; i < STEP_BOOL_KEYS.length; i++) {
      const k = STEP_BOOL_KEYS[i];
      if (step[k] === true && sc[k] !== true) return false;
    }
    return true;
  }
  // 十神/五行条件容器：数组（在列表中）与对象（键存在）两种写法皆可
  function _inTen(cond, val) {
    if (!val) return false;
    return Array.isArray(cond) ? (cond.indexOf(val) >= 0) : (cond[val] != null);
  }

  // ---------- 条件判定 ----------
  function _cmp(num, expr) {
    if (typeof expr === 'number') return num === expr;
    const m = /^([<>=!]+)\s*(\d+)$/.exec(expr);
    if (!m) return false;
    const v = +m[2];
    if (m[1] === '>=') return num >= v;
    if (m[1] === '>') return num > v;
    if (m[1] === '<=') return num <= v;
    if (m[1] === '<') return num < v;
    if (m[1] === '==') return num === v;
    if (m[1] === '!=') return num !== v;
    return false;
  }
  function _matchWhen(when, BZ, A, ctx, stepCtx) {
    if (!when) return true;
    if (when.ten) { for (const k in when.ten) { if (!_cmp(_countTen(BZ, k), when.ten[k])) return false; } }
    // tenAny：所列十神任一类在命即满足（OR 门控，供"夫星/子星/妻星任一类在命"类断语，如男命损子须正官或七杀任一在命）。
    // 与 touGanAny 对称；多键之间是 OR（任一达到阈值即可），区别于 when.ten 的 AND。
    if (when.tenAny) {
      let any = false;
      for (const k in when.tenAny) { if (_countTen(BZ, k) >= (typeof when.tenAny[k] === 'number' ? when.tenAny[k] : 1)) { any = true; break; } }
      if (!any) return false;
    }
    // yearTen：年柱十神（年干 + 年支本气）须匹配（供祖业类“年柱某十神”判定，如“得本家正印为贵”须正印在年柱）
    if (when.yearTen) {
      const dg = BZ.dayGan;
      const yg = _gans(BZ)[0], yz = _zhis(BZ)[0];
      const yTens = [tenGod(dg, yg), tenGod(dg, zhiMain(yz || ''))].filter(Boolean);
      for (const t in when.yearTen) {
        const c = yTens.filter(x => x === t).length;
        if (!_cmp(c, when.yearTen[t])) return false;
      }
    }
    if (when.sha) { const sha = _allSha(BZ); if (!when.sha.some(s => sha.some(x => x === s || x === s + '贵人'))) return false; }
    if (when.strength) { const st = (A && A.strength) || ''; if (when.strength.indexOf(st) < 0) return false; }
    if (when.element) { const ec = _elementTier(BZ); for (const k in when.element) { if (!_cmp(ec[k] || 0, when.element[k])) return false; } }
    // yy：命局阴阳偏盛判定（含藏干计数），纯阳/纯阴/阳盛/阴盛，供"纯阴纯阳性情"类断语
    if (when.yy) {
      let yy = { yin: 0, yang: 0, total: 0 };
      try {
        const all = (BZ.gans || []).slice();
        (BZ.zhis || []).forEach(z => { const h = ((G && G.HIDE) || {})[z] || [z]; h.forEach(hh => all.push(hh)); });
        all.forEach(c => { if (c === '甲' || c === '丙' || c === '戊' || c === '庚' || c === '壬' || c === '子' || c === '寅' || c === '辰' || c === '午' || c === '申' || c === '戌') yy.yang++; else yy.yin++; });
        yy.total = yy.yang + yy.yin;
      } catch (e) {}
      const yinR = yy.total ? yy.yin / yy.total : 0.5;
      const want = when.yy; // '纯阳'|'纯阴'|'阳盛'|'阴盛'
      if (want === '纯阳' || want === '纯阴') {
        const isPureYin = yy.total > 0 && yy.yin === yy.total;
        const isPureYang = yy.total > 0 && yy.yang === yy.total;
        if (want === '纯阳' && !isPureYang) return false;
        if (want === '纯阴' && !isPureYin) return false;
      } else if (want === '阳盛') { if (!(yy.yang / yy.total >= 0.62) || yy.yin === 0) return false; }
      else if (want === '阴盛') { if (!(yinR >= 0.62) || yy.yang === 0) return false; }
    }
    // xiTen / jiTen：所列十神须为“用神(喜)/忌神”。杜绝“X为用”类断语在 X 实为忌神时误出。
    if (when.xiTen) {
      const xi = new Set((A && A.synthesis && A.synthesis.xiWxEff) || (A && A.xiWx) || []);
      for (const t of when.xiTen) { const w = catToWx(t, BZ); if (!w || !xi.has(w)) return false; }
    }
    if (when.jiTen) {
      const ji = new Set((A && A.synthesis && A.synthesis.jiWxEff) || (A && A.jiWx) || []);
      for (const t of when.jiTen) { const w = catToWx(t, BZ); if (!w || !ji.has(w)) return false; }
    }
    if (when.pattern) { const P = detectPatterns(BZ, A); if (!when.pattern.every(p => P.has(p))) return false; }
    // touGan：所列十神须天干透出（防"偏财透干"类断语在财仅藏支时误出）
    if (when.touGan) {
      const dg = BZ.dayGan;
      const touGods = _gans(BZ).filter(g => g).map(g => tenGod(dg, g));
      for (const t of when.touGan) { if (touGods.indexOf(t) < 0) return false; }
    }
    // touGanAny：所列十神任一透干即可（"正偏财透"类）
    if (when.touGanAny) {
      const dg = BZ.dayGan;
      const touGods = _gans(BZ).filter(g => g).map(g => tenGod(dg, g));
      if (!when.touGanAny.some(t => touGods.indexOf(t) >= 0)) return false;
    }
    // hideTen：所列十神须不透干（"财神忌透只宜藏"=财藏不透；与 touGan 相反，防财已透仍出"忌透"）
    if (when.hideTen) {
      const dg = BZ.dayGan;
      const touGods = _gans(BZ).filter(g => g).map(g => tenGod(dg, g));
      for (const t of when.hideTen) { if (touGods.indexOf(t) >= 0) return false; }
    }
    // szEmpty：时支落旬空（"时落空亡"断语，空亡须落在时柱，防全柱空亡误触发）
    if (when.szEmpty) {
      try {
        const sg = _gans(BZ)[3], sz2 = _zhis(BZ)[3];
        if (!sg || !sz2) return false;
        const k = G.kongOf ? G.kongOf(sg + sz2) : null;
        if (!k || k.indexOf(sz2) < 0) return false;
      } catch (e) { return false; }
    }
    // shiGan：时柱天干须为该十神（防"时上偏财"类断语误出）
    if (when.shiGan) {
      const dg = BZ.dayGan, sg = _gans(BZ)[3];
      if (!sg || when.shiGan.indexOf(tenGod(dg, sg)) < 0) return false;
    }
    // wealthTier：财星五行（我克）旺衰档 ≥ 阈值（档：真缺0/弱1/中2/强3；防"身财两旺"在财星极弱时误出）
    if (when.wealthTier) {
      const dwx = GAN_WX_T[BZ.dayGan], caiWx = WX_KE_OF[dwx];
      if (!caiWx) return false;
      const ec = _elementTier(BZ);
      if ((ec[caiWx] || 0) < when.wealthTier) return false;
    }
    // tenTier：十神类（比劫/印星/食伤/财星/官杀）对应五行旺衰档 ≥ 阈值（档：真缺0/弱1/中2/强3）。
    // 语义断言"旺/多/重/叠/强/得地"的断语必须挂此条件，只查十神存在（ten>=1）或朴素计数（>=2）
    // 无法区分"正印叠遇"与"余气弱印"，须以五行能量档为准（与 _elementTier 同源）。
    if (when.tenTier) {
      const ec = _elementTier(BZ);
      for (const t in when.tenTier) {
        const w = catToWx(t, BZ); if (!w) return false;
        if ((ec[w] || 0) < when.tenTier[t]) return false;
      }
    }
    // tenTierLe：十神类对应五行旺衰档 ≤ 阈值（"身旺财轻""子息星弱"类断语专用）
    if (when.tenTierLe) {
      const ec = _elementTier(BZ);
      for (const t in when.tenTierLe) {
        const w = catToWx(t, BZ); if (!w) return false;
        if ((ec[w] || 9) > when.tenTierLe[t]) return false;
      }
    }
    // caiKu：财星之库（木库未/火库戌/金库丑/水库辰/土库戌）出现在四柱地支。
    // 防"财星有库（辰戌丑未为库）"在仅有正财而无库时误出。
    if (when.caiKu) {
      const dwx = GAN_WX_T[BZ.dayGan], caiWx = WX_KE_OF[dwx];
      const KU = { 木: '未', 火: '戌', 土: '戌', 金: '丑', 水: '辰' };
      const ku = KU[caiWx]; if (!ku) return false;
      if (_zhis(BZ).indexOf(ku) < 0) return false;
    }
    // dayZhiKu：日支即财星之库（"日坐财库"类断语专用，严格坐库而非仅四柱有库）
    if (when.dayZhiKu) {
      const dwx = GAN_WX_T[BZ.dayGan], caiWx = WX_KE_OF[dwx];
      const KU = { 木: '未', 火: '戌', 土: '戌', 金: '丑', 水: '辰' };
      const ku = KU[caiWx]; if (!ku) return false;
      if (_zhis(BZ)[2] !== ku) return false;
    }
    // touOrDayZhiTen：所列十神天干透出或坐日支本气（"日支或天干透伤官"类断语专用）
    if (when.touOrDayZhiTen) {
      const dg = BZ.dayGan;
      const touGods = _gans(BZ).filter(g => g).map(g => tenGod(dg, g));
      const dzTen = tenGod(dg, zhiMain(_zhis(BZ)[2] || ''));
      if (!when.touOrDayZhiTen.some(t => touGods.indexOf(t) >= 0 || dzTen === t)) return false;
    }
    // dayEmpty：日支落日柱旬空（"夫妻宫落空亡"类断语专用，断语说宫位，条件必须查宫位，不得用全柱空亡冒充）
    if (when.dayEmpty) {
      try {
        const dz2 = _zhis(BZ)[2]; if (!dz2) return false;
        const k = G.kongOf ? G.kongOf((_gans(BZ)[2] || '') + dz2) : null;
        if (!k || k.indexOf(dz2) < 0) return false;
      } catch (e) { return false; }
    }
    // dayZhiXingHai：日支参与三刑或六害（"夫妻宫犯刑害"类断语专用，同上，宫位必须落在日支）
    if (when.dayZhiXingHai) {
      const dz2 = _zhis(BZ)[2]; if (!dz2) return false;
      const zsAll = _zhis(BZ).filter(Boolean);
      let ok = false;
      // 六害：日支与任一他支成害
      if (HAI_T.some(p => zsAll.some(z => z !== dz2 && ((p[0] === dz2 && p[1] === z) || (p[1] === dz2 && p[0] === z))))) ok = true;
      // 三刑：日支参与 寅巳申 / 丑戌未 之一（须同组至少两支）或自刑（辰午酉亥重支）
      if (!ok) {
        const wu = ['寅', '巳', '申'].filter(z => zsAll.indexOf(z) >= 0).length;
        const shi = ['丑', '戌', '未'].filter(z => zsAll.indexOf(z) >= 0).length;
        if ((['寅', '巳', '申'].indexOf(dz2) >= 0 && wu >= 2) || (['丑', '戌', '未'].indexOf(dz2) >= 0 && shi >= 2)) ok = true;
        if (!ok && ['辰', '午', '酉', '亥'].indexOf(dz2) >= 0 && zsAll.filter(z => z === dz2).length >= 2) ok = true;
      }
      if (!ok) return false;
    }
    if (when.ge) { const ge = (A && A.geName) || ''; if (ge.indexOf(when.ge) < 0) return false; }
    if (when.sex) { const sx = (BZ.sex === 1 || BZ.sex === '男' || BZ.sex === true) ? '男' : '女'; if (sx !== when.sex) return false; }
    if (when.day) { if (when.day.indexOf(BZ.dayGan) < 0) return false; }
    if (when.dayGZ) { const dgz = (BZ.dayGan || '') + ((_zhis(BZ) && _zhis(BZ)[2]) || ''); if (when.dayGZ.indexOf(dgz) < 0) return false; } /* 日柱干支组合（阴差阳错日等） */
    if (when.dz) { if (when.dz.indexOf(_zhis(BZ)[2]) < 0) return false; }
    if (when.mz) { if (when.mz.indexOf(_zhis(BZ)[1]) < 0) return false; }
    if (when.sz) { if (when.sz.indexOf(_zhis(BZ)[3]) < 0) return false; }   // 时支（"时上偏财坐生旺"类：生旺在时支，非月支）
    if (when.yong) { /* 预留：首选用神类 */ }
    if (when.step) { if (!_matchStep(when.step, stepCtx)) return false; }
    // zhiAll：四柱地支须同时包含所列全部地支（"子午逢之"须子午俱现；子午异柱必冲，同现=相冲）
    if (when.zhiAll) {
      const zs = _zhis(BZ).filter(Boolean);
      if (!when.zhiAll.every(z => zs.indexOf(z) >= 0)) return false;
    }
    return true;
  }

  // 吉曜集合：命理"吉曜相扶"泛指吉神，非单一神煞。用于"四柱有吉曜相扶"类断语的 sha 键（OR 语义：任一吉神在即满足）。
  // 名称须与 bazi-data.js 神煞计算产出严格一致（文昌贵人/天德贵人/月德贵人/金舆 等是否带"贵人"后缀以引擎实际 push 名为准）。
  const JIYAO_SHA = ['天乙贵人', '天德贵人', '月德贵人', '文昌贵人', '太极贵人', '福星贵人', '天厨贵人', '德秀贵人', '国印贵人', '三奇贵人', '天赦', '金舆'];

  // ---------- 断语库（15 类，统一格式组织） ----------
  const DUANYU = {
    心性: [
      { when: { ten: { '正印': '>=2' }, tenTier: { '印星': 2 } }, say: '主人重厚魁梧，功名昭著。', src: '《三命通会·论正印》' },
      { when: { sha: ['天德', '月德'], ten: { '正印': '>=1' } }, say: '阎东叟云：贵神在位，诸煞伏藏；二德扶持，众凶解散。', src: '《三命通会·论天月德》' },
      { when: { day: ['乙', '庚'], ten: { '七杀': '>=1' }, touGan: ['七杀'] }, say: '乙与庚何名为仁义之合？乙，阴木也，其性仁而太柔，庚，阳金也，坚强不屈则刚柔相济，仁义兼资。故主人果敢有守， 不惑柔佞，周旋唯仁，进退唯义。', src: '《相心赋》' },
      { when: { sex: '女', strength: ["身弱","中和偏弱"] }, say: '女命只要身弱，主性纯粹而温柔、能奉公姑、帮助夫主；身强欺夫，不孝公姑、是非生事、性多急躁。身弱为病，身强亦然。', src: '《渊海子平·论妇人总诀》' },
      { when: { ten: { '食神': '>=1' } }, say: '食神最能饮食，体厚而好讴歌。', src: '《三命通会·论食神》' },
      { when: { ten: { '七杀': '>=1' }, strength: ["身强"], tenTier: { '官杀': 2 } }, say: '偏官七杀，势压三公，喜酒色而偏争好斗、爱轩昂而扶弱欺强、情性如虎、急躁如风。', src: '《渊海子平·相心赋》' },
      { when: { pattern: ['魁罡'] }, say: '魁罡聚众，发福非常，主为人性格聪明，文章振发，临事果断，秉权好杀。', src: '《三命通会·卷六·魁罡》' },
      { when: { ten: { '偏财': '>=1' }, sz: ['寅', '申', '巳', '亥'], shiGan: ['偏财'] }, say: '偏财格，主人慷慨，不甚吝财，与人有情而多诈。', src: '《三命通会·论偏财》' },
      { when: { pattern: ['空亡'] }, say: '凡带此煞，生旺则气度宽大，动招虚名，长大肥满，多意外无心之福。', src: '《三命通会·论空亡》' },
      { when: { ten: { '偏印': '>=1' } }, say: '枭印当权，使心机而始勤终惰、好学艺而多学少成。', src: '《渊海子平·相心赋》' },
      { when: { pattern: ['华盖', '空亡'] }, say: '凡人命得华盖，多主孤寡，总贵亦不免孤独，作僧道艺术论。', src: '《三命通会·论将星华盖》' },
      { when: { ten: { '正财': '>=1', '偏财': '>=1' }, touGanAny: ['正财', '偏财'] }, say: '偏正财露，轻财好义，爱人趋奉、好说是非、嗜酒贪花，亦系如此。', src: '《渊海子平·相心赋》' },
      { when: { day: ['乙', '丁', '己', '辛', '癸'], ten: { '正印': '>=1', '食神': '>=1' } }, say: '阴日食神暗合正印，官印不要明显，但得食神纯粹，主贵而有禄，富而有寿。', src: '《相心赋》' },
      { when: { pattern: ['桃花'] }, say: '一名败神，一名桃花煞，其神之奸邪淫鄙，如生旺则美容仪，耽酒色，疏财好欢，破散家业，唯务贪淫；如死绝，落魄不检，言行狡诈。', src: '《三命通会·论咸池》' },
      { when: { pattern: ['三合'] }, say: '合多者，疏者亦亲。', src: '《玉照定真经》' },
      { when: { pattern: ['六害'] }, say: '凡六害入命，大率主妨害孤独，骨肉参商，财帛淡泊。', src: '《玉照定真经》' },
      { when: { ten: { '伤官': '>=1' }, tenTier: { '食伤': 2 } }, say: '此格主多材艺，傲物气高，心险无忌惮，多谋少遂，弄巧成拙，常以天下之人不如己，而人亦惮之恶之。', src: '《三命通会·论伤官》' },
      { when: { ten: { '正官': '==0', '七杀': '==0' }, wealthTier: 2 }, say: '无官杀气，惟偏财正财当旺而已；财神当道，隐隐兴隆，积财聚宝，但少贵矣。', src: '《相心赋》' },
      { when: { ten: { '偏印': '>=1', '七杀': '>=1' } }, say: '若带煞或五行死绝则寡恩少义，无情之人。', src: '《三命通会·论偏印》' },
      { when: { ten: { '七杀': '>=1', '正印': '>=1' }, strength: ["身强","中和偏强","身强","身强"] }, say: '日主健旺，有印绶助化，即经云逢煞看财。', src: '《三命通会·论偏官》' },
      { when: { ten: { '正官': '==1', '七杀': '>=1' } }, say: '略见一位正官，官煞混杂，反贱。', src: '《三命通会·论偏官》' },
      /* 阴阳偏盛性情（依《三命通会·论性情相貌》阴阳性情观改述，非逐字原文）：纯阳主刚、纯阴主柔，
         阴阳为性情总纲，偏盛各见取舍；此四类与五行/十神断语互补，勿重复他条 */
      { when: { yy: '纯阳' }, say: '纯阳地户包阴，兵权显赫。八字纯阳，本为偏党。', src: '《三命通会·论性情相貌》' },
      { when: { yy: '纯阴', mz: ['亥'] }, say: '四柱纯阴，生于十月，空绝五行之根。日干又见衰弱，而无强健之气。纵遇和暖之乡，终难发达。', src: '《三命通会·论性情相貌》' },
      { when: { yy: '纯阴' }, say: '四柱纯阴，干支不包阳，则终日柔懦，机心阴毒，无所不至。', src: '《三命通会·论性情相貌》' },
      { when: { yy: '阳盛' }, say: '阳刚不中，亢则害也。刚而能柔，吉之道也。此象亢阳无制，更不包藏阴物。', src: '《三命通会·论性情相貌》' },
      { when: { yy: '阴盛' }, say: '四柱中但见阴柔，而不入格。干支又不包阳，则终日柔懦。', src: '《三命通会·论性情相貌》' },
      { when: { sha: ['华盖'] }, say: '华盖临命，性好清静，近艺术宗教，孤高不群。', src: '《三命通会·论将星华盖》' },
    ],
    事业: [
      /* 核心经典断语（w=3，权重最高、首先输出），财官印三奇/羊刃驾杀/食神制杀 */
      { when: { pattern: ['财官印全'], strength: ["身强","中和偏强","身强","身强"] }, say: '有官有印，无破作廊庙之材。', src: '《渊海子平·继善篇》', w: 3 },
      { when: { pattern: ['羊刃七杀'], strength: ["身强","中和偏强","身强","身强"] }, say: '杀无刃不显，刃无杀不威。', src: '《渊海子平·论羊刃》', w: 3 },
      { when: { ten: { '七杀': '>=1', '食神': '>=1' }, strength: ["身强","中和偏强","身强","身强"] }, say: '偏官有制化为权，唾手登云发少年；岁运若行身旺地，功名大用福双全。', src: '《渊海子平·论七杀》', w: 3 },
      { when: { ten: { '伤官': '>=2' }, strength: ["身强","中和偏强"] }, say: '伤官多而身旺无依，定为僧道艺术为士。', src: '《三命通会·论伤官》' },
      { when: { pattern: ['杀印相生'] }, say: '煞印相生，功名显达。', src: '《三命通会·论偏官》' },
      { when: { pattern: ['官印相生'] }, say: '有官要有印，无刑足可夸，不为金殿客，也作富豪家。', src: '《三命通会·论正官》', w: 3 },
      { when: { pattern: ['财官相辅'] }, say: '富而且贵，定因财旺生官。', src: '《三命通会·论正财》' },
      { when: { pattern: ['食伤生财'], xiTen: ['财星'], ten: { '偏财': '>=1' }, tenTier: { '财星': 2 } }, say: '偏财是天禄自然之财，不劳己之心力，享见成福禄。', src: '《三命通会·论食神》' },
      { when: { pattern: ['食伤生财'], xiTen: ['财星'], tenTier: { '财星': 3 } }, say: '柱中虽喜见财，亦不宜多，多则不清，不过一富翁而已。', src: '《三命通会·论食神》' },
      { when: { pattern: ['身旺财多'] }, say: '财多身旺足荣欢，身旺财多化作官。', src: '《三命通会·论贫贱凶恶》' },
      { when: { pattern: ['身弱财多'], xiTen: ['比劫'] }, say: '身弱财多，喜兄弟羊刃为助。又云：财旺者遇比无妨。', src: '《三命通会·论贫贱凶恶》' },
      { when: { pattern: ['身弱财多'], jiTen: ['财星'] }, say: '财旺身衰，祸深福浅，财多身弱，要印扶身，身旺财衰，怕劫分夺。', src: '《三命通会·论贫贱凶恶》' },
      { when: { pattern: ['伤官伤尽'] }, say: '伤官原是产业神，伤尽真为大贵人。', src: '《三命通会·论伤官》' },
      { when: { pattern: ['羊刃', '禄神'], ten: { '官杀': '>=1', '印星': '>=1' } }, say: '羊刃带禄，更有官、印相资，尤作吉论。', src: '《三命通会·论羊刃》' },
      { when: { pattern: ['驿马'] }, say: '凡柱中马，若不值空亡、破败、交退、伏神，须荣贵。', src: '《三命通会·论驿马》' },
      { when: { pattern: ['比劫重叠'] }, say: '比劫禄刃，异情而同类，皆助身之神，特比纯而劫驳，禄和而刃暴耳。', src: '《命理约言·看比劫禄刃法》' },
      { when: { ten: { '正官': '>=1' }, day: ['戊', '己'], element: { '木': '>=2' } }, say: '若以木为官主，品秩清高，和俗守慎。', src: '《三命通会·论正官》' },
      { when: { ten: { '正官': '>=1' }, day: ['庚', '辛'], element: { '火': '>=2' } }, say: '以火为官主，官序炎赫，为性猛烈，用刑惨酷，亦主发歇不常。', src: '《三命通会·论正官》' },
      { when: { ten: { '正官': '>=1' }, day: ['壬', '癸'], element: { '土': '>=2' } }, say: '以土为官主，官序稳当，难侵犯，厚重质直，法令分明。', src: '《三命通会·论正官》' },
      { when: { ten: { '正官': '>=1' }, day: ['甲', '乙'], element: { '金': '>=2' } }, say: '如以金为官，职位清峻，多掌刑狱钱谷之任，决断明敏。', src: '《三命通会·论正官》' },
      { when: { ten: { '正官': '>=1' }, day: ['丙', '丁'], element: { '水': '>=2' } }, say: '以水为官主，职卑位下，级升幂进，谦和得众，矜恤孤寡，亦有道性。', src: '《三命通会·论正官》' },
      { when: { pattern: ['羊刃', '禄神'] }, say: '羊刃重重又见禄，富贵饶金玉。', src: '《三命通会·论羊刃》' },
      { when: { ten: { '偏印': '>=1' } }, say: '倒食者，名为偏印，号曰枭神，值身旺而财丰福厚，遇刑煞则寿夭身贫。', src: '《三命通会·论偏印》' },
      { when: { pattern: ['财制偏印'], strength: ["身强","中和偏强"] }, say: '印星偏者是枭神，柱内最喜见财星，身旺遇此方为福，身衰枭旺更无情。', src: '《三命通会·论偏印》' },
      { when: { ge: ['正官格'], ten: { '正印': '>=1', '偏印': '>=1' } }, say: '正官格，要行印乡，即是逢官看印。', src: '《三命通会·论正官》' },
      { when: { ten: { '食神': '>=1', '正官': '>=1', '七杀': '>=1' } }, say: '更有官煞显露，为太医师巫术数九流之士。', src: '《三命通会·论食神》' },
      { when: { ten: { '食神': '>=1', '正印': '>=1' }, jiTen: ['印星'], xiTen: ['财星'] }, say: '食神印绶不宜逢，惟见财官福更隆。', src: '《三命通会·论食神》' },
      { when: { sex: '男', strength: ["身强"], pattern: ['比劫重叠'] }, say: '身旺比劫重，损财又伤妻。', src: '《神峰通考·论比劫》' },
      { when: { pattern: ['月令食神'], strength: ["身强","中和偏强"], sha: JIYAO_SHA }, say: '月令值食，身健旺，善饮食，姿质丰肥，四柱有吉曜相扶，堆金积玉，声名显着。', src: '《三命通会·论食神》' },
      { when: { pattern: ['食伤生财'], ten: { '七杀': '>=1' }, jiTen: ['七杀'] }, say: '凡命遇财煞之地，食神旺相，煞被食制，不敢为祸，财被食生，充裕不竭。', src: '《三命通会·论食神》' },
      { when: { ten: { '食神': '>=1' }, pattern: ['劫财羊刃'], tenTier: { '比劫': 2, '财星': 2 } }, say: '食神生旺无刑克，命逢此格胜财官。', src: '《三命通会·论食神》' },
      { when: { ten: { '伤官': '>=1', '正官': '==0', '七杀': '==0' }, touOrDayZhiTen: ['伤官'] }, say: '伤官格务要伤尽，方作贵看。', src: '《三命通会·论伤官》' },
      { when: { day: ['庚', '辛'], ten: { '伤官': '>=1' }, element: { '水': '>=2' } }, say: '若金寒水冷，不得火温，难以济物，况水得火成既济之功。', src: '《三命通会·论伤官》' },
      { when: { strength: ["身强"], ten: { '伤官': '>=2' }, tenTier: { '食伤': 2 } }, say: '重见伤官，身必辛勤劳苦。', src: '《三命通会·论伤官》' },
      { when: { strength: ["身强"], ten: { '正财': '>=1' }, tenTier: { '财星': 2 } }, say: '财要得时乘旺，不偏正混乱，不重叠多见，自家日主有力，皆能发福。', src: '《三命通会·论正财》' },
      { when: { ten: { '偏财': '>=1' }, pattern: ['驿马'] }, say: '驿马者，三命中发用，喜庆之神。若人遇之，君子常居荣位，小人主丰赡。大小运行年至此，主得官及迁改之喜。', src: '《三命通会·论驿马》' },
      { when: { pattern: ['身旺财多'], ten: { '偏财': '>=1' } }, say: '偏财元是众人财，最忌干支兄弟来，身强财旺皆为福，若带官星更妙哉！', src: '《三命通会·论偏财》' },
      { when: { ten: { '正官': '>=2' } }, say: '正官为六格之首，止许一位，多则不宜。', src: '《三命通会·论正官》' },
      { when: { pattern: ['空亡'], sha: ['桃花'] }, say: '命中有空亡与咸池，沐浴多者是野鄙艺人。', src: '《神煞大全》' },
      /* 纯阴纯阳，事业格局（《滴天髓阐微》）：若欠合神财官贵为偏气，虽豪亦俗，非俊秀才器 */
      { when: { yy: '纯阳', jiTen: ['财星', '官杀'] }, say: '八字纯阴纯阳，柱中因欠合神财官等贵，用神既偏且强，虽豪亦俗，非俊秀才器。', src: '《滴天髓阐微》', w: 2 },
      { when: { yy: '纯阴', jiTen: ['财星', '官杀'] }, say: '八字纯阴纯阳，柱中因欠合神财官等贵，用神既偏且强，虽豪亦俗，非俊秀才器。', src: '《滴天髓阐微》', w: 2 },
    ],
    财利: [
      { when: { pattern: ['身弱财多'], jiTen: ['财星'] }, say: '财多身弱，正为富屋贫人。', src: '《渊海子平·四言独步》', w: 3 },
      { when: { strength: ["身强","中和偏强"], ten: { '正财': '>=1', '偏财': '>=1' }, wealthTier: 2 }, say: '身强财旺皆为福。', src: '《三命通会·论贫贱凶恶》', w: 3 },
      { when: { ten: { '偏财': '>=1' }, touGan: ['偏财'], strength: ["身强","中和偏强"] }, say: '偏财身旺，趁求商贾之人。', src: '《三命通会·论偏财》' },
      { when: { hideTen: ['正财', '偏财'], tenTier: { '财星': 2 } }, say: '财宜藏，藏则丰厚，露则浮荡是也。', src: '《三命通会·论正财》' },
      { when: { strength: ["身弱","中和偏弱"], ten: { '正财': '>=1', '偏财': '>=1' }, wealthTier: 2 }, say: '身弱财多，当之不能。', src: '《三命通会·论贫贱凶恶》' },
      { when: { pattern: ['食伤生财'] }, say: '伤官逢财，乃享优游之福。', src: '《三命通会·论伤官》' },
      { when: { ten: { '比肩': '>=1', '七杀': '>=1' } }, say: '比肩要逢七杀制，比劫争财，得七杀制伏则兄弟不敢分夺，反成权柄。', src: '《神峰通考·论比劫》' },
      { when: { ten: { '正财': '>=1', '偏印': '>=1' }, tenTier: { '财星': 2 } }, say: '财星破印，宜逢比劫之乡。', src: '《子平真诠·论印绶》' },
      { when: { strength: ["身强","中和偏强"], ten: { '正财': '>=1' }, hideTen: ['正财', '偏财'] }, say: '财神忌透只宜藏，身旺逢之大吉昌，切忌比劫相遇会，一生名利被分张。', src: '《三命通会·论正财》' },
      /* 富格类（扩充）：身财两停/财官相生身强主富，皆《三命通会·论贫贱凶恶》真实取则，核心权重优先入选 */
      { when: { strength: ["身强","中和偏强"], pattern: ['财官相生'], tenTier: { '财星': 3 } }, say: '财旺生官，富而且贵。', src: '《三命通会·论贫贱凶恶》', w: 3 },
      { when: { strength: ["身强","中和偏强"], ten: { '正财': '>=2' }, xiTen: ['财星'] }, say: '财星得位正当权，日主高强名利全，印绶若逢相济助，金珠满柜福绵绵。', src: '《三命通会·论正财》', w: 3 },
      { when: { pattern: ['食伤生财'], strength: ["身强","中和偏强"], tenTier: { '食伤': 2 } }, say: '食神生旺最堪夸，惟行水木土金佳。', src: '《三命通会·论食神》', w: 2 },
      { when: { ten: { '偏财': '>=1' }, tenTier: { '财星': 3 }, xiTen: ['财星'], pattern: ['财官相生'], strength: ["身强","中和偏强"] }, say: '偏财身旺要官星，运入乡发利名。', src: '《三命通会·论偏财》', w: 2 },
      /* 月令建禄逢财官发福（《四言独步》） */
      { when: { ge: '建禄格', ten: { '财星': '>=1' }, tenAny: { '正官': 1, '七杀': 1 } }, say: '月令建禄，不住祖屋；一见财官，自然发福。', src: '《四言独步》', w: 2 },
      /* 财利，身旺/劫财类断语 */
      { when: { strength: ["身强","中和偏强"], ten: { '偏财': '>=1' } }, say: '身旺偏财可取，必得横财。', src: '《三命通会·卷十二·精微论》', w: 2 },
      { when: { xiTen: ['财星'], ten: { '比肩': '>=1', '劫财': '>=1' } }, say: '用之财星不可劫。', src: '《继善篇》', w: 2 },
      { when: { ten: { '劫财': '>=2' } }, say: '柱中劫财多者，克妻害子，财散不聚。', src: '《渊海子平·论劫财》', w: 2 },
      { when: { ten: { '劫财': '>=1', '正官': '==0', '七杀': '==0' }, pattern: ['羊刃'] }, say: '劫财羊刃最无情，不带官星一世贫。', src: '《渊海子平·论劫财》', w: 2 },
      { when: { ten: { '伤官': '>=1', '财星': '>=1' } }, say: '伤官见财者，又官高而财足。', src: '《三命通会·卷十二·精微论》', w: 1 },
      { when: { strength: ["身强","中和偏强"], ten: { '财星': '>=1', '官杀': '==0' } }, say: '身旺财弱无官者，必要有食伤。', src: '《滴天髓·何知章·富》', w: 2 },
    ],
    功名: [
      { when: { ten: { '正官': '>=1', '七杀': '==0' }, strength: ["身强","中和偏强"] }, say: '官星清而身旺者必贵。', src: '《滴天髓·论官杀》' },
      { when: { pattern: ['贵人重见'] }, say: '天乙贵，三命中最吉之神。若人遇之则荣，功名早达，官禄亦易近。', src: '《三命通会·论天乙贵人》' },
      { when: { pattern: ['官印相生'], strength: ["身强","中和偏强"] }, say: '官星大抵要身强，身弱须求气旺方，印绶兼行财旺地，无冲伤破是荣昌。', src: '《三命通会·论正官》' },
      { when: { pattern: ['杀印相生'] }, say: '煞为武艺，印为文华，有煞无印欠文彩，有印无煞欠威风。', src: '《三命通会·论偏官》' },
      { when: { pattern: ['财官相辅'] }, say: '原有财星宜行官运，原有官星宜行财运，行财运生官，行官运发财。', src: '《三命通会·论正财》' },
      { when: { ten: { '正官': '>=1', '伤官': '>=1' } }, say: '伤官不尽又逢官，斩绞徒流祸百端。', src: '《三命通会·论伤官》' },
      { when: { pattern: ['官杀无制'] }, say: '官煞混杂，无制反贱。', src: '《三命通会·论偏官》', w: 3 },
      { when: { ten: { '正印': '>=2', '正官': '>=1' }, tenTier: { '印星': 2 } }, say: '五行入垣，官居五府。', src: '《三命通会·论正印》' },
      /* 贵格类（扩充）：正官佩印/官星清透身强/财官相生主贵，皆《三命通会·论贫贱凶恶》真实取则 */
      { when: { pattern: ['官印相生'], strength: ["身强","中和偏强"], tenTier: { '官杀': 2, '印星': 2 } }, say: '官印相生事事奇。', src: '《三命通会·论贫贱凶恶》', w: 3 },
      { when: { pattern: ['月令官杀'], sha: ['禄神'], strength: ["身强","中和偏强"] }, say: '生月官星坐禄乡，日辰生旺福无疆，有财有印无伤破，年少成名坐玉堂。', src: '《三命通会·论正官》', w: 3 },
      { when: { ge: '建禄格' }, say: '建禄坐禄或归禄，遇财官印绶，富贵长年。', src: '《明通赋》', w: 2 },
      { when: { pattern: ['杀印相生'], strength: ["身强","中和偏强"] }, say: '四柱煞旺，运纯身旺，为官清贵。', src: '《三命通会·论偏官》', w: 2 },
      { when: { pattern: ['财官相辅'], strength: ["身强","中和偏强"], tenTier: { '财星': 2 } }, say: '财旺生官，富而且贵。', src: '《三命通会·论贫贱凶恶》', w: 2 },
      /* 功名，官星/劫财/建禄格断语 */
      { when: { touGan: ['正官'], ten: { '正官': '>=1' } }, say: '官喜露，露则清高。', src: '《三命通会·卷十二·精微论》', w: 1 },
      { when: { ten: { '正官': '>=1', '正印': '>=1' } }, say: '正官、正印无伤，牧黎庶为守令。', src: '《三命通会·卷十二·精微论》', w: 2 },
      { when: { ten: { '劫财': '>=1', '正官': '>=1', '七杀': '>=1' } }, say: '劫财羊刃入官煞，台阁之臣。', src: '《三命通会·卷十二·精微论》', w: 2 },
      { when: { strength: ["身强","中和偏强"], ten: { '七杀': '>=1', '正印': '>=1' } }, say: '身旺有煞逢印绶，权断之官。', src: '《三命通会·卷十二·精微论》', w: 2 },
      { when: { strength: ["身强","中和偏强"], ten: { '财星': '>=1', '正官': '>=1', '伤官': '==0', '七杀': '==0' } }, say: '财旺生官者，身强而不透伤官、不混七煞，贵格也。', src: '《子平真诠·论财》', w: 2 },
      { when: { strength: ["身强","中和偏强"], ten: { '正财': '==0', '偏财': '==0', '正官': '==0', '七杀': '==0' } }, say: '身旺无依，僧道之辈。', src: '《三命通会·卷十二·精微论》', w: 2 },
      { when: { ten: { '正官': '>=1', '正印': '==0', '偏印': '==0' } }, say: '有官无印，即非真官。', src: '《三命通会·卷十·看命口诀》', w: 1 },
      { when: { ten: { '正官': '>=4' } }, say: '四位纯官，仕宦虚名。', src: '《三命通会·卷十·看命口诀》', w: 2 },
      { when: { ge: '建禄格', touGan: ['正财', '偏财', '正官', '七杀'] }, say: '建禄生提月，财官喜透天。', src: '《五言独步》', w: 2 },
      /* 功名，神煞武将断语 */
      { when: { ten: { '七杀': '>=1' }, sha: ['亡神', '劫煞'] }, say: '官遇亡劫兼七煞，当为武将。', src: '《三命通会·卷十二·惊神论》', w: 2 },
      /* 天元一气（四柱天干全同）：罕见贵格，勿以比肩论 ，《三命通会·卷六·一气生成》 */
      { when: { pattern: ['天元一气'] }, say: '天元一气定尊荣，不杂天干一字清，非可比肩争竞论，生来富贵至公卿。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['天元一气'] }, say: '四干纯一不杂，为天元一气，不可以比肩论，须详其支神有无生化，有无刑克，带财官印合格，岁运不背，必当大贵，冲刑克制亦凶，不可执定一气皆以贵言。', src: '《三命通会·卷六·一气生成》', w: 3 },
      /* 地物合一（四柱地支全同）：名芝兰并秀格，贵格 ，《三命通会·卷六·一气生成》 */
      { when: { pattern: ['地物合一'] }, say: '名芝兰并秀格，须看干元是支福聚祸聚，如是福聚合格，多居两府之贵。', src: '《三命通会·卷六·一气生成》', w: 3 },
      /* 四柱全同（四柱干支并同，如四癸亥）：天元一气与地物合一兼，一气生成之极格。
         dayGZ 同 + pattern['四柱全同']：四柱全同时日柱干支即每柱干支，故 dayGZ 足以锁定具体干支持；零误伤 */
      { when: { pattern: ['四柱全同'], dayGZ: ['壬寅', '辛卯', '甲戌'] }, say: '壬寅、辛卯、甲戌富贵双全。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['己巳'] }, say: '己巳亦贵。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { sex: '男', pattern: ['四柱全同'], dayGZ: ['戊午', '丁未'] }, say: '戊午、丁未刃旺性强，虽贵亦多凶险，克妻，不善终。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['庚辰'] }, say: '庚辰贵而风流，名重利轻。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['乙酉'] }, say: '乙酉多伤残。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['癸亥'] }, say: '癸亥多贫薄。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['丙申'] }, say: '丙申生北方亦可取贵，岁运如遇刑冲破夺，必生灾祸。', src: '《三命通会·卷六·一气生成》', w: 3 },
      { when: { pattern: ['四柱全同'], dayGZ: ['甲子', '甲戌', '甲寅'] }, say: '如甲子、甲戌、甲寅、甲子之类，又名凤凰干格。', src: '《三命通会·卷六·一气生成》', w: 3 },
    ],
    文誉: [
      { when: { ten: { '正印': '>=1' }, tenTier: { '印星': 2 } }, say: '生逢正印，必拜玉堂。', src: '《三命通会·论正印》' },
      { when: { ten: { '食神': '>=1' }, tenTier: { '食伤': 2 }, sha: JIYAO_SHA }, say: '四柱有吉曜相扶，堆金积玉，声名显著。', src: '《三命通会·论食神》' },
      { when: { ten: { '伤官': '>=1', '正印': '>=1' }, xiTen: ['印星'] }, say: '伤官用印，不忌官煞，去财方发。', src: '《三命通会·论伤官》' },
      { when: { pattern: ['文昌'] }, say: '夫学堂者，如人读书之在学堂；词馆者，如今官翰林，谓之词馆，取其学业精专，文章出类。', src: '《三命通会·论学堂词馆》' },
      { when: { ten: { '伤官': '>=1', '正官': '==0', '七杀': '==0' }, tenTier: { '食伤': 2 } }, say: '伤官伤尽，多艺多能，使心机而傲物气高、多谲诈而侮人志大、颧高骨俊、眼大眉粗。', src: '《三命通会·论伤官》' },
    ],
    学业: [
      { when: { ten: { '正印': '>=1' }, xiTen: ['印星'] }, say: '印为生我之母，然木赖水生，水旺木浮；火赖木生，木盛火塞；土赖火生，火旺土焦；金赖土生，土重金埋；水赖金生，金多水涩。', src: '《子平真诠·论印绶》' },
      { when: { pattern: ['文昌'] }, say: '凡学堂词馆，切不要犯空亡及冲破，支干纳音不要见克，方为得用。', src: '《三命通会·论学堂词馆》' },
      { when: { ten: { '食神': '>=1' } }, say: '食神生旺，胜似财官。', src: '《三命通会·论食神》' },
      { when: { ten: { '伤官': '>=1', '正印': '>=1' }, xiTen: ['印星'] }, say: '伤官若带印，官煞不为刑。', src: '《三命通会·论伤官》' },
      { when: { ten: { '比肩': '>=1', '劫财': '>=1' }, strength: ["身弱","中和偏弱"], tenTier: { '比劫': 2 } }, say: '兄弟谁废与谁兴，提用财神看重轻。', src: '《滴天髓·论兄弟》' },
      { when: { ten: { '正财': '>=1', '偏印': '>=1' }, tenTier: { '财星': 2 } }, say: '财星破印，印绶受损则学业少成，宜比劫制财以存印。', src: '《子平真诠·论印绶》' },
    ],
    婚缘: [
      /* 配偶星，十神关系维度：男财女官，得地/透干/藏支/混杂/不现（原"婚姻"类拆分①） */
      { when: { sex: '男', ten: { '正财': '>=1' }, tenTier: { '财星': 2 }, xiTen: ['财星'] }, say: '财星得位，因妻致富成家。', src: '《渊海子平·论妻妾》', w: 3 },
      { when: { sex: '女', ten: { '正官': '>=1', '正财': '>=1', '正印': '>=1' } }, say: '财官印绶三般物，女命逢之必旺夫。', src: '《三命通会·论女命》', w: 3 },
      { when: { sex: '女', ten: { '正官': '>=1', '七杀': '>=1' }, touGan: ['正官', '七杀'] }, say: '官煞并透，是为混杂，合官留煞，或合煞留官，反以取清。', src: '《子平真诠·论妻子》' },
      { when: { sex: '男', ten: { '正财': '>=1', '偏财': '>=1' } }, say: '出现偏财，少爱正妻，多爱妾。', src: '《三命通会·论偏财》' },
      { when: { sex: '女', day: ['甲'], ten: { '正财': '>=2' }, touGanAny: ['正财'], mz: ['辰', '戌', '丑', '未'] }, say: '时月两透己土，名二土争合，男主奔流，女主淫贱。', src: '《穷通宝鉴·论甲木》' },
      { when: { sex: '男', touGan: ['正财'] }, say: '妻星显露，子息必多。', src: '《渊海子平·论妻妾》' },
      { when: { sex: '男', touGan: ['偏财'] }, say: '偏财财位发他乡，慷慨风流性要强，别立家园三两处，因名因利自家忙。', src: '《三命通会·论偏财》' },
      { when: { sex: '女', day: ['丁'], touGan: ['正官'] }, say: '又如女以官为夫，丁日逢壬，是我之夫，是我合之，正如夫妻相亲，其情愈密。', src: '《子平真诠·论十干合而不合》' },
      { when: { sex: '女', touOrDayZhiTen: ['官杀'] }, say: '官星更天干透出，如甲见辛酉，乙见庚申之例，谓之支藏干透。', src: '《三命通会·论正官》' },
      { when: { sex: '男', ten: { '正财': '==0', '偏财': '==0' } }, say: '无我克者，名曰局中无妻，却看所生日在何地？如在财旺之乡，当有得力之妻。', src: '《三命通会·论六亲》' },
      { when: { sex: '女', ten: { '正官': '==0', '七杀': '==0' } }, say: '四柱不见夫星，未为贞洁。', src: '《渊海子平·正官论》' },
      /* 纯阴纯阳，姻缘取向（《渊海子平·络绎赋》）：男纯阳孤克、女纯阴寡滞，姻缘宜迟而需制化 */
      { when: { sex: '男', yy: '纯阳' }, say: '纯阳，则男必孤寒。', src: '《渊海子平·络绎赋》', w: 2 },
      { when: { sex: '女', yy: '纯阴' }, say: '纯阴，则女当寡困。', src: '《渊海子平·络绎赋》', w: 2 },
      /* 婚缘，比劫伤官/纯阴纯阳断语 */
      { when: { sex: '男', ten: { '比劫': '>=1', '伤官': '>=1' } }, say: '男逢比劫伤官，克妻害子。', src: '《玄机赋》', w: 2 },
      { when: { sex: '女', ten: { '伤官': '>=1', '偏印': '>=1' } }, say: '女犯伤官偏印，丧子刑夫。', src: '《玄机赋》', w: 2 },
      { when: { sex: '女', ten: { '伤官': '>=1', '正财': '==0', '偏财': '==0', '正印': '==0', '偏印': '==0' } }, say: '女命伤官福不真，无财无印守孤贫。', src: '《渊海子平·女命诗诀》', w: 2 },
      { when: { sex: '女', ten: { '七杀': '>=2' } }, say: '七杀正官，只要一位者良；杀多则夫多。', src: '《渊海子平·论妇人总诀》', w: 2 },
      { when: { sex: '女', pattern: ['日坐伤官'] }, say: '女命若也伤官旺，坐下伤官会骂夫。', src: '《三命通会·卷十二·搜髓歌》', w: 2 },
      { when: { sex: '女', pattern: ['三刑'], ten: { '正官': '>=1', '七杀': '>=1' } }, say: '三刑带鬼，始终克子伤夫。', src: '《神峰通考·渭泾论》', w: 2 },
      /* 婚缘，女命克夫诸条（《滴天髓·六亲论·女命章》任铁樵注） */
      { when: { sex: '女', ten: { '正官': '>=1' }, tenTier: { '官杀': 2 }, tenTierLe: { '印星': 1 } }, say: '官星旺、印绶轻，必克夫。', src: '《滴天髓·六亲论·女命章》', w: 2 },
      { when: { sex: '女', strength: ["身强","中和偏强"], ten: { '伤官': '>=1' }, tenTier: { '食伤': 2 }, tenTierLe: { '官杀': 1 }, tenAny: { '正官': 1, '七杀': 1 } }, say: '官星微、日主强、伤官重，必克夫。', src: '《滴天髓·六亲论·女命章》', w: 2 },
      /* 婚缘，男命克妻诸条（《滴天髓·六亲论·夫妻章》任铁樵注） */
      { when: { sex: '男', ten: { '比劫': '>=2', '正官': '==0', '七杀': '==0' }, tenTierLe: { '财星': 1 } }, say: '财神轻而无官，比劫多，主克妻。', src: '《滴天髓·六亲论·夫妻章》', w: 2 },
    ],
    夫妻宫: [
      /* 日支宫位，干支关系维度：坐星/刑害/空亡/冲/坐库（原"婚姻"类拆分②） */
      { when: { sex: '男', pattern: ['日坐比劫'] }, say: '羊刃多而妻宫有损。', src: '《神峰通考·论比劫》', w: 2 },
      { when: { sex: '男', pattern: ['日坐财'], tenTier: { '财星': 2 } }, say: '日坐命财，更在财生旺之乡，主得妻财，又主妻贤明。', src: '《三命通会·论六亲》' },
      { when: { sex: '女', pattern: ['日坐正官'] }, say: '日地支坐财官谓之得位。', src: '《三命通会·论六亲》' },
      { when: { sex: '男', pattern: ['日坐伤官'] }, say: '日带伤官，妻妾不贤。', src: '《三命通会·论伤官》' },
      { when: { sex: '男', dayEmpty: true }, say: '日上见，多庶出，或妻妾间离遇偶合则多淫荡。', src: '《三命通会·论空亡》' },
      { when: { sex: '男', dayZhiXingHai: true }, say: '若命带日刑，日带年冲破年、羊刃、劫煞、六厄、元辰、空亡，或三四娶，或无妻。', src: '《玉照定真经》' },
      { when: { sex: '男', pattern: ['年日冲'] }, say: '日带年冲破年、羊刃、劫煞、六厄、元辰、空亡，或三四娶，或无妻。', src: '《玉照定真经》' },
      { when: { dayZhiKu: true }, say: '财食入库者福厚，例食求财者贫夭。', src: '《三命通会·论正财》' },
    ],
    桃花: [
      /* 情缘神煞维度：桃花/红鸾/咸池及其组合（原"婚姻"类拆分③） */
      { when: { pattern: ['桃花'] }, say: '此人入命，有破无成，非为吉兆，妇人尤忌之。', src: '《三命通会·论咸池》' },
      { when: { ten: { '比肩': '>=1', '劫财': '>=1' }, pattern: ['桃花'] }, say: '咸池非吉煞，日时与水命遇之尤凶。', src: '《三命通会·论咸池》' },
      { when: { pattern: ['桃花逢合'] }, say: '桃花带合，风流儒雅之人。', src: '《三命通会·卷十二·精微论》' },
      { when: { pattern: ['桃花逢刑冲'] }, say: '桃花逢刑冲：多为财色招惹灾。', src: '《神煞大全》' },
      { when: { pattern: ['墙外桃花'] }, say: '桃花在日时，称为外桃花，夫妻多纷争；尤岁运再逢。', src: '《神煞大全》' },
      { when: { sha: ['咸池'] }, say: '桃花入命：欲望强，易耽于酒色，桃花易犯，一生须防情事风波危害。', src: '《神煞大全》' },
    ],
    婚配: [
      /* 核心经典断语（w=3/2，首先输出），阴差阳错/伤官太重/印绶重逢/官星桃花 */
      { when: { sex: '女', dayGZ: ['丙子', '丙午', '丁丑', '丁未', '戊寅', '戊申', '辛卯', '辛酉', '壬辰', '壬戌', '癸巳', '癸亥'] }, say: '阴阳差错煞。乃丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥十二日也。女子逢之，公姑寡合，妯娌不足，夫家冷退。', src: '《三命通会·论女命》', w: 3 },
      /* 婚配，孤鸾煞（《三命通会·卷九·总论诸神煞》） */
      { when: { sex: '男', dayGZ: ['乙巳', '丁巳', '辛亥', '戊申', '甲寅', '丙午', '戊午', '壬子'] }, say: '孤鸾煞，男克妻。', src: '《三命通会·卷九·总论诸神煞》', w: 2 },
      { when: { sex: '女', dayGZ: ['乙巳', '丁巳', '辛亥', '戊申', '甲寅', '丙午', '戊午', '壬子'] }, say: '孤鸾煞，女克夫。', src: '《三命通会·卷九·总论诸神煞》', w: 2 },
      /* 女命婚配（夫星门控）：女以官为夫，下列断语须四柱有正官（夫星在命）才成立，
         食伤太旺/印绶重逢"克夫、盗夫之气"都以正官为受克对象，无正官则不输出（防"无夫星而断再嫁/克夫"）。 */
      { when: { sex: '女', ten: { '正官': '>=1' }, tenTier: { '食伤': 3 } }, say: '女以官为夫，伤则克制，故再嫁。', src: '《三命通会·论女命》', w: 3 },
      { when: { sex: '女', ten: { '正官': '>=1' }, tenTier: { '印星': 3 } }, say: '兼且印绶重逢盗夫之气，克子之甚，夫子不能旺，反绝于时是也。', src: '《三命通会·论女命》', w: 3 },
      { when: { sex: '女', ten: { '伤官': '>=1', '正官': '>=1' } }, say: '伤官见官，祸患百端。', src: '《三命通会·论女命》', w: 3 },
      { when: { sex: '女', sha: ['羊刃'] }, say: '时日阳刃，本是凶神，既不利于夫主之宫，兼损坏乎平生之性。', src: '《渊海子平·女命富贵贫贱篇》', w: 3 },
      { when: { sex: '女', ten: { '正官': '>=1' }, sha: ['桃花'] }, say: '官星桃花是良人，带合兼煞便不同。', src: '《三命通会·卷七·招嫁不定》', w: 2 },
      /* 婚恋宜忌，劫比争星/食伤旺/星入库 */
      /* 男命劫财克正财（妻星）故妨妻，须妻星（正财）在命才有妻可妨，无正财不输出 */
      { when: { sex: '男', ten: { '劫财': '>=1' }, tenAny: { '正财': 1 } }, say: '甲乙相见必妨妻，败财克父定无疑。', src: '《神峰通考·论比劫》' },
      { when: { sex: '女', ten: { '比肩': '>=1', '劫财': '>=1' } }, say: '真官遇之而贵窃（比劫能泄印气。故曰荣分。比劫能抗官威，故曰窃贵）。', src: '《命理约言·比劫赋》' },
      { when: { sex: '女', ten: { '正官': '>=1' }, tenTier: { '食伤': 2 } }, say: '伤官太重，子必有亏。', src: '《三命通会·论伤官》' },
      { when: { sex: '男', ten: { '比肩': '>=1', '正财': '>=1' } }, say: '比则辅主之力胜，而见财亦侵。', src: '《命理约言·比劫赋》' },
    ],
    子息: [
      /* 核心经典断语（w=3/2，首先输出），食神为子/官星得令/七杀太旺 */
      { when: { sex: '女', tenTier: { '食伤': 2 } }, say: '食神一位逢生旺，招子须当拜圣明。', src: '《渊海子平·论子息》', w: 3 },
      { when: { sex: '男', tenTier: { '官杀': 2, '财星': 2 }, jiTen: ['食伤'] }, say: '官强财旺，后代昌荣。', src: '《三命通会·论六亲》', w: 3 },
      { when: { ten: { '七杀': '>=1' }, pattern: ['羊刃'] }, say: '杀临阳刃杀宫，主克子。', src: '《渊海子平·论子息》', w: 2 },
      { when: { tenTier: { '印星': 3 }, tenTierLe: { '食伤': 1 } }, say: '印旺妨儿女。', src: '《三命通会·论女命》', w: 3 },
      /* 男命以官杀为子，伤官克官杀故损子，须子星（正官或七杀任一）在命才有子可损，无子星不输出（tenAny OR 门控） */
      { when: { sex: '男', ten: { '伤官': '>=1' }, tenAny: { '正官': 1, '七杀': 1 }, tenTier: { '食伤': 2 } }, say: '男命伤官多损子。', src: '《三命通会·论六亲》', w: 2 },
      { when: { ten: { '食神': '>=1' }, tenTierLe: { '食伤': 1 } }, say: '子息星坐死绝之地，虽有聪明俊秀，不送老也。', src: '《三命通会·论六亲》' },
      { when: { sex: '女', ten: { '偏印': '>=1', '食神': '>=1' } }, say: '女命以食神为子，遇枭夺食，虽生子不存。', src: '《三命通会·论六亲》' },
      { when: { szEmpty: true }, say: '时落空亡，主少子。', src: '《三命通会·论空亡》' },
      { when: { ten: { '食神': '>=1' }, tenTierLe: { '食伤': 1 } }, say: '食伤居死绝又刑冲破害劫财之地，不得子之力，纵有子主残疾破相或不才。', src: '《三命通会·论六亲》' },
      /* 子息，食伤多/伤官见官/晚子英奇断语 */
      { when: { ten: { '食伤': '>=2' } }, say: '伤官食神多，难为子息。', src: '《渊海子平·六亲总篇》', w: 2 },
      { when: { ten: { '伤官': '>=1', '正官': '>=1' } }, say: '伤官见官，子孙凶顽。', src: '《渊海子平·论子息》', w: 2 },
      { when: { sex: '男', ten: { '七杀': '>=1', '食神': '>=1' } }, say: '时上偏官有制，晚子英奇。', src: '《三命通会·卷十二·惊神论》', w: 2 },
      /* 子息，孤鸾日见官星得子（《渊海子平》） */
      { when: { sex: '女', dayGZ: ['乙巳', '丁巳', '辛亥', '戊申', '甲寅', '壬子', '丙午'], tenAny: { '正官': 1, '七杀': 1 } }, say: '孤鸾犯日本无儿，一见官星得子奇。', src: '《渊海子平》', w: 2 },
    ],
    家庭: [
      { when: { ten: { '正印': '>=1' }, xiTen: ['印星'] }, say: '印绶喜其生身，正偏同为美格。', src: '《子平真诠·论印绶》' },
      { when: { ten: { '比肩': '>=1', '劫财': '>=1' } }, say: '比与劫，主衰煞旺则用之，身弱财多则用之。', src: '《命理约言·看比劫禄刃法》' },
      { when: { ten: { '正财': '>=1', '偏印': '>=1' }, tenTier: { '财星': 2 } }, say: '忌财破印，贵行比劫之中。', src: '《子平真诠·论印绶》' },
      { when: { pattern: ['子卯相刑'] }, say: '子卯相刑，门无礼德。', src: '《玉照定真经》' },
      { when: { ten: { '正官': '>=1' }, tenTier: { '官杀': 3 }, strength: ["身弱","中和偏弱"] }, say: '柱中官星太旺，天元羸弱之名。', src: '《三命通会·论正官》' },
      { when: { sex: '女', pattern: ['日坐正官'] }, say: '女命日支坐正官得位，主夫主贤明、夫妻和睦。', src: '《三命通会·论六亲》' },
      { when: { ten: { '劫财': '>=2' }, tenTier: { '比劫': 2 } }, say: '犹人之有兄弟多者，有家产则争而分夺，无家财则起祸端，手足不相顾。', src: '《神峰通考·六亲说》' },
      { when: { sha: ['孤辰'] }, say: '凡人命犯孤寡，主形孤骨露，面无和气，不利六亲。', src: '《三命通会·论孤辰寡宿》' },
      { when: { sex: '男', sha: ['孤辰'] }, say: '男命生于妻绝之中而逢孤辰，平生难于婚偶。', src: '《三命通会·论孤辰寡宿》' },
      { when: { sha: ['寡宿'] }, say: '骨肉中道分离，孤宿尤嫌于隔角。', src: '《三命通会·论孤辰寡宿》' },
      /* 家庭，六亲断语（印绶见财/偏财为父/官杀多难兄弟） */
      { when: { ten: { '正印': '>=1', '正财': '>=1' } }, say: '印绶见财，克母及祖母也。', src: '《渊海子平·六亲总篇》', w: 2 },
      { when: { ten: { '正印': '>=1', '偏财': '>=1' } }, say: '偏财是父，若见比劫，则父有伤。', src: '《三命通会·论六亲》', w: 2 },
      { when: { ten: { '官杀': '>=3' } }, say: '官杀多者，难为兄弟。', src: '《渊海子平·六亲总篇》', w: 2 },
    ],
    祖业: [
      { when: { yearTen: { '正印': '>=1' }, xiTen: ['印星'] }, say: '得本家正印为贵。', src: '《三命通会·论正印》' },
      { when: { pattern: ['月胎被犯'] }, say: '三犯月胎，祖宗尤祸。', src: '《玉照定真经》' },
      { when: { pattern: ['年月冲'] }, say: '年月两柱相冲，主离祖成家。', src: '《玉照定真经》' },
      { when: { pattern: ['日坐财'], dayZhiKu: true }, say: '财星得位正当权。', src: '《三命通会·论正财》' },
      { when: { yearTen: { '正财': '>=1' }, xiTen: ['财星'] }, say: '年上正财，祖业丰盈，得父荫而安。', src: '《三命通会·论六亲》' },
      { when: { yearTen: { '偏财': '>=1' } }, say: '年上偏财，发外乡之财，祖业虚浮。', src: '《三命通会·论六亲》' },
      { when: { yearTen: { '正官': '>=1' } }, say: '年上官星，祖上荫贵，主权柄之承。', src: '《三命通会·论六亲》' },
      { when: { yearTen: { '七杀': '>=1' } }, say: '年上七杀，祖业凋零，或主武贵离乡。', src: '《三命通会·论六亲》' },
      { when: { yearTen: { '食神': '>=1' } }, say: '年上食神，祖业丰足，工艺传家。', src: '《三命通会·论六亲》' },
      { when: { yearTen: { '比劫': '>=1' }, jiTen: ['比劫'] }, say: '年上比劫，兄弟分夺，祖业难守。', src: '《三命通会·论六亲》' },
      /* 祖业，年逢刃煞/伤官劫财断语 */
      { when: { yearTen: { '七杀': '>=1' }, pattern: ['羊刃'] }, say: '年逢刃煞，少年早丧爹娘。', src: '《三命通会·卷十二·惊神论》', w: 2 },
      { when: { yearTen: { '伤官': '>=1', '劫财': '>=1' } }, say: '伤官劫财，生于贫贱之家。', src: '《滴天髓·六亲论·小儿章》', w: 2 },
    ],
    疾厄: [
      /* 核心经典断语（w=3，首先输出），五行和者一世无灾（滴天髓，论疾病）；
         血气乱者“五行悖而不顺、左右相战上下相克”乃抽象总纲、无具体脏腑指向，删（见《滴天髓》任注），疾厄卡以“五行偏枯/受亏主病”具体断语承接 */
      { when: { pattern: ['五行俱全'] }, say: '五行和者，一世无灾。', src: '《滴天髓·论疾病》', w: 3 },
      /* 受亏主病：五行受克气亏主对应脏腑病（《三命通会·论疾病》）。受亏=该五行气势不足（能量弱档≤1），主脏为本气对应之脏腑 */
      { when: { element: { '木': '<=1' } }, say: '属肝家甲乙寅卯木受亏主病。', src: '《三命通会·论疾病》' },
      { when: { element: { '火': '<=1' } }, say: '属心家丙丁巳午火受亏主病。', src: '《三命通会·论疾病》' },
      { when: { element: { '土': '<=1' } }, say: '属脾家戊己辰戌丑未土受亏主病。', src: '《三命通会·论疾病》' },
      { when: { element: { '金': '<=1' } }, say: '属肺家庚辛申酉受亏主病。', src: '《三命通会·论疾病》' },
      { when: { element: { '水': '<=1' } }, say: '属肾家壬癸亥子受亏主病。', src: '《三命通会·论疾病》' },
      { when: { pattern: ['羊刃'], ten: { '七杀': '>=1' } }, say: '如专羊刃，主眼露性急，凶暴害物，亲近恶党。', src: '《三命通会·论羊刃》' },
      { when: { ten: { '偏印': '>=1', '食神': '>=1' } }, say: '枭神夺食，则因食生疾。', src: '《三命通会·论偏印》' },
      { when: { pattern: ['三刑'] }, say: '乾伤支有相刑，生人斜眼之疾。', src: '《玉照定真经》' },
      { when: { ten: { '伤官': '>=1', '正官': '>=1' } }, say: '伤官见官，多损目疾，或犯官非。', src: '《三命通会·论伤官》' },
      /* 疾厄，五行受克太过主病（《渊海子平·论疾病》） */
      { when: { day: ['甲', '乙'], element: { '金': '>=2' } }, say: '木命见庚辛申酉多者，肝胆有疾。', src: '《渊海子平·论疾病》', w: 2 },
      { when: { day: ['丙', '丁'], element: { '水': '>=2' } }, say: '火命见水及亥子旺地，主小肠心经之患。', src: '《渊海子平·论疾病》', w: 2 },
      { when: { day: ['戊', '己'], element: { '木': '>=2' } }, say: '土命见木及寅卯旺乡，主脾胃经受伤。', src: '《渊海子平·论疾病》', w: 2 },
      { when: { day: ['庚', '辛'], element: { '火': '>=2' } }, say: '金命见火及巳午旺处，主大肠经受病。', src: '《渊海子平·论疾病》', w: 2 },
      { when: { day: ['壬', '癸'], element: { '土': '>=2' } }, say: '水命见土即四季旺月，膀胱肾经受病。', src: '《渊海子平·论疾病》', w: 2 },
      /* 疾厄，寿夭断语（食神制煞逢枭、身衰遇鬼） */
      { when: { ten: { '食神': '>=1', '七杀': '>=1', '偏印': '>=1' } }, say: '食神制煞逢枭，不贫则夭。', src: '《元理赋》', w: 2 },
      { when: { strength: ["身弱","中和偏弱"], tenTier: { '官杀': 2 } }, say: '非夭则贫，必是身衰遇鬼。', src: '《继善篇》', w: 2 },
    ],
    仪容: [
      { when: { element: { '木': '>=2', '火': '>=2' } }, say: '木盛多仁。', src: '《渊海子平·五行元理消息赋》' },
      { when: { element: { '金': '>=2', '水': '>=2' } }, say: '金水聪明而好色。', src: '《渊海子平·五行元理消息赋》' },
      { when: { pattern: ['魁罡'] }, say: '魁罡性严有操持，而为人聪敏是也。', src: '《三命通会·卷六·魁罡》' },
    ],
    林泉: [
      { when: { pattern: ['华盖时胎'] }, say: '华盖星辰兄弟寡，天上孤高之宿也；生来若在时与胎，便是过房庶出者。', src: '《三命通会·论将星华盖》' },
      { when: { pattern: ['伤官伤尽'] }, say: '伤官虽凶，乃我所生，自家之物，伤尽则能生财，财旺则能生官，造化展转有情。', src: '《三命通会·论伤官》' },
      { when: { ten: { '偏印': '>=1', '食神': '>=1' }, jiTen: ['印星'], tenTier: { '印星': 2 } }, say: '偏印临而夺食伤，主孤贫。', src: '《三命通会·论偏印》' },
      { when: { pattern: ['空亡'] }, say: '空亡坐死绝之地，则一生成败飘泊；若我身得生旺之气，则不能为祸。', src: '《三命通会·论空亡》' },
      { when: { pattern: ['华盖'] }, say: '华盖虽吉亦有妨，或为孽子或孤孀。', src: '《三命通会·论将星华盖》' },
      /* 林泉，劫煞遇魁罡断语 */
      { when: { pattern: ['魁罡'], sha: ['劫煞'] }, say: '劫煞遇魁罡，巫医术士。', src: '《三命通会·卷十二·惊神论》', w: 2 },
    ],
    交游: [
      { when: { ten: { '伤官': '>=1', '正官': '>=1' } }, say: '伤官若带官，不宜行制伏。', src: '《三命通会·论伤官》' },
      { when: { pattern: ['桃花', '驿马'] }, say: '桃花坐马：为色受难。', src: '《神煞大全》' },
      { when: { ten: { '正官': '>=1', '正印': '>=1' } }, say: '四干叠相，官印足者，主贵。', src: '《三命通会·论正官》' },
      { when: { ten: { '劫财': '>=1' }, touGan: ['劫财'] }, say: '不问藏财露财，并受其殃，惟有正官偏官，可除其孽。', src: '《命理约言·比劫赋》' },
    ],
    迁旅: [
      { when: { pattern: ['驿马'] }, say: '生马未必有马，背禄未必无禄。看其旺库，不问背生。', src: '《三命通会·论驿马》' },
      { when: { pattern: ['驿马逢冲'] }, say: '驿马逢冲：心猿意马，奔波，忙碌，乃天涯之客。流年驿马逢冲：此年多奔波，有迁异职动之机，并多见出国或远行。', src: '《神煞大全》' },
      { when: { pattern: ['驿马', '互禄天乙'] }, say: '互禄共天乙贵神，同其马位，更得诸煞相并，官秉大权，贵居廊庙。', src: '《三命通会·论驿马》' },
      { when: { pattern: ['库马'] }, say: '库马主少年之喜，旺马资壮岁之荣，生马老方得遂而官卑任远矣。', src: '《三命通会·论驿马》' },
      { when: { zhiAll: ['子', '午'] }, say: '子午逢之，他乡外立。', src: '《玉照定真经》' },
      { when: { pattern: ['月胎岁合'] }, say: '月胎岁合，祖立他门。', src: '《玉照定真经》' },
      { when: { ten: { '七杀': '>=1' }, pattern: ['驿马'], element: { '金': '>=1' } }, say: '有马头带剑，谓驿马上见庚辛或纳音，见金，主名振边疆。', src: '《三命通会·论驿马》' },
    ],
    // 调候类：五行寒热湿暖燥，本于《穷通宝鉴》调候总纲（冬寒宜火暖、夏燥宜水润）。
    // 判定：月令季节（mz 亥子丑=冬、巳午未=夏）+ 五行能量档（element，量化四柱同源）+ 日主五行（day）。
    调候: [
      { when: { day: ['庚', '辛'], mz: ['亥', '子', '丑'], element: { '水': '>=2', '火': '<=1' } }, say: '水冷金寒爱丙丁。', src: '《穷通宝鉴》' },
      { when: { day: ['壬', '癸'], mz: ['亥', '子', '丑'], element: { '水': '>=3', '火': '<=1' } }, say: '十一月癸水，值冰冻之时，金水无交欢之象，专用丙火解冻，庶不致成冰，又要辛金滋扶。', src: '《穷通宝鉴·论癸水》' },
      { when: { day: ['甲', '乙'], mz: ['亥', '子', '丑'], element: { '水': '>=2', '火': '<=1' } }, say: '寒木向阳，专用丙火，忌见癸水。', src: '《穷通宝鉴》' },
      { when: { day: ['丙', '丁', '戊', '己'], mz: ['巳', '午', '未'], element: { '火': '>=2', '土': '>=2', '水': '<=1' } }, say: '三夏丙火，阳威性烈，专用壬水。', src: '《穷通宝鉴》' },
      { when: { day: ['庚', '辛'], mz: ['巳', '午', '未'], element: { '火': '>=2', '水': '<=1' } }, say: '专用壬水淘洗。', src: '《穷通宝鉴》' },
      { when: { day: ['戊', '己'], mz: ['巳', '午', '未'], element: { '土': '>=2', '火': '>=2', '水': '>=1' }, touGanAny: ['正财', '偏财'] }, say: '得一癸透壬藏，功名有准。', src: '《穷通宝鉴》' },
      { when: { day: ['甲', '乙'], mz: ['寅', '卯', '辰'], element: { '木': '>=2', '火': '<=1' } }, say: '春木向阳，专用丙火，忌见癸水。', src: '《穷通宝鉴》' },
      { when: { day: ['庚', '辛'], mz: ['申', '酉', '戌'], element: { '金': '>=2', '水': '<=1' } }, say: '秋金喜水淘洗，金白水清方为贵。', src: '《穷通宝鉴》' },
      { when: { day: ['戊', '己'], mz: ['辰', '戌', '丑', '未'], element: { '土': '>=2', '金': '<=1' } }, say: '四季之土，喜金以泄其秀，得金则贵。', src: '《穷通宝鉴》' },
    ],
    // 岁运类：只走步触发（每条必带 when.step），不入本命四大模块，专供运势各步宫位应事引用。
    // 太岁诸条的 tai 字段仅在流年层计算（太岁即值年之神），大运/流月/流日天然不触发，杜绝串层。
    岁运: [
      /* 一、太岁犯岁 */
      { when: { step: { tai: ['值'] } }, say: '日犯岁君，灾殃必重；五行有救，其年反必为财。', src: '《渊海子平·继善篇》' },
      { when: { step: { tai: ['值'] } }, say: '生时相逢真太岁。假如甲子生人又见甲子年，谓之真太岁，又名转趾煞，要大运日主与太岁相和相顺，其年则吉；若值刑冲破害，与太岁互相战克则凶。', src: '《三命通会·论太岁》' },
      { when: { step: { tai: ['冲'] } }, say: '太岁干支冲日干支亦曰征，其年则凶，灾祸未免。', src: '《三命通会·论太岁》' },
      { when: { step: { tai: ['害'] } }, say: '凡六害入命，大率主妨害孤独，骨肉参商，财帛淡泊，女命尤忌。', src: '《三命通会·论太岁》' },
      { when: { step: { tai: ['破'] } }, say: '岁破者，太岁所冲之辰也。其地不可兴造、移徙、嫁娶、远行，犯者主损财物及害家长。', src: '《协纪辨方书·岁破》' },
      { when: { step: { tai: ['刑'] } }, say: '凡命定其无刑，先论太岁。盖言人恶见三刑，若月日时带煞而太岁不干预者不论，故曰先论太岁。', src: '《三命通会·论三刑》' },
      { when: { step: { tai: ['征'] } }, say: '日干支冲克太岁曰征，运支干伤冲太岁亦曰征，太岁干支冲日干支者亦曰征；但看八字有无救助。仔细推详，百发百中。', src: '《渊海子平·论征太岁》' },
      { when: { step: { tai: ['战'] } }, say: '太岁乃众杀之主，入命未必为灾；若遇斗战之乡，必主刑于本命。', src: '《渊海子平·继善篇》' },
      { when: { step: { tai: ['合'] } }, say: '日干与流气（流年）合，主晦气入门。', src: '《渊海子平·论命细法》' },
      { when: { step: { suiYunBingLin: true }, sha: ['羊刃'] }, say: '劫财阳刃，切忌时逢；岁运并临，灾殃立至。', src: '《三命通会·论太岁》', w: 3 },
      /* 神煞流年应期（吊客丧门岁运并临） */
      { when: { step: { lvl: ['大运', '流年'], suiYunBingLin: true }, sha: ['丧门', '吊客'] }, say: '吊客、丧门，岁运并临方孝服。', src: '《三命通会·卷十二·惊神论》', w: 2 },
      /* 二、流年冲克宫位（限大运、流年、流月三层：宫位应事以年月为期，落到流日则言重而失实） */
      { when: { step: { lvl: ['大运', '流年'], clashDay: true } }, say: '日干支冲克太岁曰征，运干支伤冲太岁亦曰征，太岁干支冲日干支亦曰征，其年则凶，灾祸未免。', src: '《三命通会·论太岁》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], tianHeDiHe: true } }, say: '得佐圣君，贵在冲官逢合。', src: '《渊海子平·继善篇》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], clashYear: true } }, say: '岁月背逐更冲害，公葬他乡。', src: '《三命通会·论六亲》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], clashMonth: true } }, say: '冲提纲月令为重，余支为轻；冲喜用所在地为重，非冲用所在地为轻。', src: '《子平真诠·论行运》' },
      { when: { sex: '男', step: { lvl: ['大运', '流年', '流月'], clashDayZhi: true } }, say: '日时背逐无救助，妻子离克。', src: '《三命通会·论六亲》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], clashTime: true } }, say: '时遇刃伤，未年却损儿女。', src: '《三命通会·论六亲》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], clashGuan: true } }, say: '五行正官，忌冲刑克破之官。', src: '《三命通会·论正官》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], clashYangRen: true } }, say: '运行羊刃，财物耗散。', src: '《三命通会·论羊刃》' },
      { when: { step: { lvl: ['大运', '流年', '流月'], sanXingChong: true } }, say: '凡见刑不可便以凶论，须看五行中有无吉辰、旺相、官星、印绶、责神、德福等物，有此诸吉相扶相助，刑不为害，而反为用；如无诸吉相助，更带亡劫、天中、羊刃等煞以恶济恶，祸不可言。', src: '《三命通会·论三刑》' },
      { when: { step: { lvl: ['大运', '流年'], empty: true } }, say: '建禄临空虚有名，平生向学老无成；若逢马贵来相救，纵得官时又复停。', src: '《三命通会·论空亡》' },
      { when: { step: { yunJiaoTuo: true } }, say: '富贵定于命，穷通系乎运，命如植物之种子，而运则开落之时节也。', src: '《子平真诠·论行运》' },
      /* 三、六亲灾厄中须两件并见者 */
      /* 四、年龄运限（命主年龄门控：少年 <18、老年 >60，年龄未知则一律不触发；
         少怕衰绝、老怕生旺本论行运之体，故限大运、流年两层，不落流月流日） */
      { when: { step: { lvl: ['大运', '流年'], age: '<18', cs: ['墓', '绝'] } }, say: '老怕生旺，少嫌死绝。', src: '《三命通会·卷十·看命口訣》' },
      { when: { step: { lvl: ['大运', '流年'], age: '<18', cs: ['衰'] } }, say: '衰者，盛极而衰，物之初变也。', src: '《子平真诠·论行运》' },
      { when: { step: { lvl: ['大运', '流年'], age: ['>=18', '<=60'], cs: ['冠带', '临官', '帝旺'] } }, say: '临官者，由长而壮，犹人之可以出仕也。', src: '《子平真诠·论行运》' },
      { when: { step: { lvl: ['大运', '流年'], age: '>60', cs: ['长生', '沐浴', '冠带', '临官', '帝旺'] } }, say: '老怕生旺，少嫌死绝。', src: '《三命通会·卷十·看命口訣》' },
      { when: { strength: ["身弱","中和偏弱"], step: { lvl: ['大运', '流年'], age: '>60', ganTen: ['正官', '七杀'] } }, say: '官杀旺而身弱，财星生助官杀，有印财一衿易得，无印则老儒冠。', src: '《滴天髓·论官杀》' },
      { when: { step: { lvl: ['大运', '流年'], age: '>60', ganTen: ['正印', '偏印'] } }, say: '诸印要逢库墓，若生旺扶助互换，禄马贵人并相合者，至贵之命。', src: '《三命通会·论正印》' },
      { when: { strength: ["身弱","中和偏弱"], step: { lvl: ['大运', '流年'], age: '>60', ganTen: ['正财', '偏财'] } }, say: '若财多身弱，柱无印助，财少身强，柱有比劫，太过不及，皆不为福。', src: '《三命通会·论贫贱凶恶》' },
      { when: { step: { lvl: ['大运', '流年'], age: '>60', sha: ['天乙贵人'] } }, say: '天乙贵遇生旺，则形貌轩昂性灵颖悟，理义分明，不喜杂术，纯粹大器，身蕴道德，众人钦爱。', src: '《三命通会·论天乙贵人》' },
      { when: { step: { lvl: ['大运', '流年'], age: '>60', sha: ['驿马'] } }, say: '凡柱中马，若不值空亡、破败、交退、伏神，须荣贵。', src: '《三命通会·论驿马》' },
      { when: { step: { lvl: ['大运', '流年'], age: '>60', sha: ['羊刃'] } }, say: '凡人行运，最怕羊刃，主作事稽迟。', src: '《三命通会·论羊刃》' },
      /* 五、六亲灾厄与运限事件（原散于 15 小类 step 条目，本质为事件预测，归入本类；限大运、流年两层） */
      { when: { sex: '男', step: { lvl: ['大运', '流年'], heCai: true } }, say: '大运、流年、三合财乡，必主红鸾吉兆。', src: '《三命通会·论六亲》' },
      { when: { sex: '男', ten: { '正财': '>=1' }, step: { lvl: ['大运', '流年'], z: ['辰', '戌', '丑', '未'] } }, say: '财星入墓，必定刑妻。', src: '《三命通会·论六亲》' },
      { when: { sex: '女', ten: { '正官': '>=1' }, step: { lvl: ['大运', '流年'], z: ['辰', '戌', '丑', '未'] } }, say: '官星入墓夫先亡。', src: '《神峰通考·十二月建丑歌》' },
      { when: { ten: { '正印': '>=1' }, step: { lvl: ['大运', '流年'], ganTen: ['正财', '偏财'] } }, say: '有破福成祸印，如水人得浮水印，或月日时多带土来，本家印见鬼盛，是谓破福成祸。', src: '《三命通会·论正印》' },
      { when: { ten: { '偏财': '>=1' }, step: { lvl: ['大运', '流年'], ganTen: ['比肩', '劫财'] } }, say: '偏财为父，比劫重重损父亲。', src: '《神峰通考·六亲说》' },
      { when: { pattern: ['羊刃带恶煞'], step: { lvl: ['大运', '流年'] } }, say: '羊刃带诸恶煞尤凶。', src: '《三命通会·论羊刃》' },
      /* 岁运，财多身弱行财运（《明津先生骨髓歌》） */
      { when: { pattern: ['身弱财多'], step: { lvl: ['大运', '流年'], ganTen: ['正财', '偏财'] } }, say: '财多身弱行财运，此处方知入泉台。', src: '《三命通会·卷十二·明津先生骨髓歌》', w: 2 },
    ]
  };

  // ---------- 对外接口 ----------
  function matchDuanyu(cat, BZ, A, CTX) {
    const list = DUANYU[cat]; if (!list) return [];
    const yong = (A && A.synthesis && A.synthesis.primary && A.synthesis.primary.wx) || '';
    const ws = (A && A.strength) || '';
    const out = [];
    for (const e of list) {
      if (!_matchWhen(e.when, BZ, A, CTX)) continue;
      let say = e.say.replace(/\{dayGan\}/g, BZ.dayGan).replace(/\{yong\}/g, yong).replace(/\{ws\}/g, ws);
      out.push({ say, src: e.src, key: e.key, w: e.w || 1 });
    }
    return out;
  }

  // 15 小类归 4 大类：展示层按大类聚合，嵌入对应卡片
  const DUANYU_GROUPS = {
    /* 类目顺序=重要性：核心类目在前（轮询收集序+权重排序共同决定输出先后） */
    事业财运: ['事业', '财利', '功名', '学业', '文誉', '迁旅'],
    婚姻感情: ['婚缘', '夫妻宫', '婚配', '桃花'],
    性格健康: ['心性', '疾厄', '调候', '仪容', '交游', '林泉'],
    家庭子女: ['子息', '家庭', '祖业']
  };
  function groupOfCat(cat) {
    for (const g in DUANYU_GROUPS) { if (DUANYU_GROUPS[g].indexOf(cat) >= 0) return g; }
    return '';
  }

  // 单大类断语（内联）：返回可直接嵌入卡片段落或表格单元格的内联 HTML，
  // 不自带外层容器。groupName 取 DUANYU_GROUPS 四大类之一；
  // stepCtx 非空则按步匹配（运势），为空则本命匹配（命局）。
  // maxPer：该类目最多取 N 条（默认 9，本命四大模块融入用；与调用处实参一致，防止声明值与输出不符）。
  // plain=true：返回纯文本（断语句 + 出处小括号，无金标/无 sub-note 样式），用于本命四大模块段落内融入；
  //   plain 缺省仍为原古籍断语金标块（运势每步表内行），行为不变。
  function duanyuGroup(groupName, BZ, A, stepCtx, maxPer, plain) {
    const cats = DUANYU_GROUPS[groupName]; if (!cats || !cats.length) return '';
    const cap = (typeof maxPer === 'number' && maxPer > 0) ? maxPer : 12;
    // 每类目各自匹配，按权重降序排（核心经典断语 w=3 先于常规 w=1），并打上所属类目标签（供展示排序归并）
    const byCat = cats.map(cat => {
      const res = stepCtx ? matchDuanyuStep(cat, BZ, A, stepCtx) : matchDuanyu(cat, BZ, A, {});
      return res.filter(x => x && x.say).map(x => { x.cat = cat; return x; })
        .sort((a, b) => ((b.w || 1) - (a.w || 1)));
    });
    // 均衡轮询选取：跨类目轮流取一条（cat0[0],cat1[0],cat2[0]...,cat0[1]...），
    // 仅决定“入选哪些条”，保证少数类目（如性格健康，林泉/华盖）不被前几类吃满上限而截断。
    const items = [];
    for (let round = 0; items.length < cap; round++) {
      let added = false;
      for (const list of byCat) {
        if (items.length >= cap) break;
        if (round < list.length) { items.push({ x: list[round], origIdx: items.length }); added = true; }
      }
      if (!added) break; // 所有类目均已取尽
    }
    // 关系键：取断语首句关系短语，（前的命理关系（如 杀印相生 / 官印双清 / 偏财透干），用于跨类目聚合。
    items.forEach(it => { it.relKey = (it.x.say.split('，')[0] || '').trim(); });
    // 同关系键去重前先按权重降序稳定排：保证同一命理关系保留【最高权重】条目，防低权重先到挤掉关键断语
    items.sort((a, b) => ((b.x.w || 1) - (a.x.w || 1)) || (a.origIdx - b.origIdx));
    // 同关系键去重：同一命理关系只保留首现（防"食神生财×2""桃花×4"式重复啰嗦）
    const _seenRel = {};
    const _dedup = [];
    for (const it of items) { if (it.relKey in _seenRel) continue; _seenRel[it.relKey] = true; _dedup.push(it); }
    items.splice(0, items.length, ..._dedup);
    // 关系首次出现序：按轮询收集序记录每个关系键第一次出现的位置，使“同一关系”整体聚合并保持命中先后，不局限于归档类目。
    const relOrder = {};
    items.forEach(it => { if (!(it.relKey in relOrder)) relOrder[it.relKey] = it.origIdx; });
    // 展示排序：主序=权重降序（重要断语优先输出）；同权重内=按关系键聚合（同关系相邻）；
    // 再按类目序与收集序兜底。兼顾"权重优先"与"同关系不散、不同类型都覆盖"。
    items.sort((a, b) => ((b.x.w || 1) - (a.x.w || 1)) || (relOrder[a.relKey] - relOrder[b.relKey]) || (cats.indexOf(a.x.cat) - cats.indexOf(b.x.cat)) || (a.origIdx - b.origIdx));
    const ordered = items.map(it => it.x);
    if (!ordered.length) return '';
    if (plain === true) {
      // 出处 src 数据已自带《》，此处仅作内联配对捕获用，不再外裹书名号；
      // 中文括号（《》）留给 bazi.html 的 gjRe 解析，避免嵌套成《《》》。
      const srcClean = x => (x.src || '').replace(/^《+|》+$/g, '');
      return ordered.map(x => x.say + '（《' + srcClean(x) + '》）').join('<br>');
    }
    return '<span class="lab-gold">' + groupName + '（古籍断语）</span>' + ordered.map(x => '<br>' + x.say + ' <span class="sub-note">' + x.src + '</span>').join('');
  }

  // 步级匹配：仅取含 when.step 的条目（步触发），并复合判定其本命 when 字段。
  // 用于运势每步表内古籍断语行（duanyuGroup 传 stepCtx），与本命卡片（不传 stepCtx）互补、不重复。
  function matchDuanyuStep(cat, BZ, A, stepCtx) {
    const list = DUANYU[cat]; if (!list || !stepCtx) return [];
    const yong = (A && A.synthesis && A.synthesis.primary && A.synthesis.primary.wx) || '';
    const ws = (A && A.strength) || '';
    const LVL = stepCtx.lvl || '流年';
    const out = [];
    for (const e of list) {
      if (!e.when || !e.when.step) continue;
      if (!_matchWhen(e.when, BZ, A, {}, stepCtx)) continue;
      let say = e.say.replace(/\{dayGan\}/g, BZ.dayGan).replace(/\{yong\}/g, yong).replace(/\{ws\}/g, ws);
      say = say.replace(/\{heZhu\}/g, (stepCtx && stepCtx.tianHeDiHeZhu) || '某柱'); // 天合地合柱名落字
      say = say.replace(/流年/g, LVL); // 层级词随步替换：大运/流年/流月/流日 各自称号，不串层
      say = say.replace(/\{cs\}/g, (stepCtx && stepCtx.cs) || '病'); // 十二长生占位：按本步真实长生（病/死）落字，杜绝"病地"写死而实系死地
      out.push({ say, src: e.src, key: e.key, w: e.w || 1 });
    }
    return out;
  }
  global.DUANYU = DUANYU;
  global.DUANYU_GROUPS = DUANYU_GROUPS;
  global.groupOfCat = groupOfCat;
  global.matchDuanyu = matchDuanyu;
  global.detectPatterns = detectPatterns;
  global.stepCtxOf = stepCtxOf;
  global.matchDuanyuStep = matchDuanyuStep;
  global.duanyuGroup = duanyuGroup;
  if (typeof module !== 'undefined' && module.exports) module.exports = { DUANYU, DUANYU_GROUPS, groupOfCat, matchDuanyu, detectPatterns, stepCtxOf, matchDuanyuStep, duanyuGroup };
})(typeof window !== 'undefined' ? window : globalThis);
