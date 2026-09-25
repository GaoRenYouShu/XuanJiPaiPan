/* ============================================================================
 * bazi-rel.js — 基础命理判定统一引擎（唯一归集处）
 * ----------------------------------------------------------------------------
 * 加载序：bazi-data.js 之后、bazi-duanyu.js / bazi-core.js 之前（见 bazi.html）。
 * 依赖（均为 window 全局，由 bazi-data.js / xuanji-lib.js 提前提供，本文件不重复定义）：
 *   WX_SHENG, WX_KE, TEN_CLASS, tenGod, GAN_WX, ZHI_WX,
 *   ssTenGodEnergy, wxElementScore, effXi, effJi, shengWxOfC, keWxOfC
 *
 * 设计铁律（解决“换个八字出一次错”）：
 *   1. 本文件只放“判定”（给定命局+喜忌+能量，产出断语），真源表一律引用 bazi-data.js。
 *   2. 每个判定函数都显式接收 context（喜忌 fuXi/fuJi、十神能量 tenE、计数 C/T…），
 *      不依赖任何调用方局部变量，因此可被任意页面/模块直接调用。
 *   3. 凡涉及“生克/反生反克/喜忌门控/能量量化”，统一在此判定，严禁调用方各自拼喜忌。
 *
 * 对外接口 window.REL：
 *   REL.wx     五行生克 + 反生反克方向
 *   REL.ten    十神生克 + 喜忌门控 + 反生反克 + 能量量化
 *   REL.classic 经典组合（官印/杀印/伤官配印/食伤泄秀/财官相生…）详述
 *   REL.liuqin 六亲助/耗/平 + 子女缘厚薄
 *   REL.sha    神煞吉凶权重 + 喜忌关联
 *   REL.gz     干支关系（冲/合/刑/害/破）+ 喜忌解读
 * ========================================================================== */
(function () {
  'use strict';

  // ， 反克（被克者反侮）文案，与 bazi-core 旧 _pairBase 同源 ，
  const REVERSE_KE = { '土': '土多木折', '水': '水多土流', '火': '火多水干', '金': '金多火熄', '木': '木多金缺' };
  const REV = 2.0; // 反生/反克能量阈值（两神能量比值），与 wxBalance 同源

  // 十神类 → 该类含的具体十神（用于按类聚合能量）
  const CAT_GODS = {
    '比劫': ['比肩', '劫财'], '食伤': ['食神', '伤官'], '财星': ['正财', '偏财'],
    '官杀': ['正官', '七杀'], '印星': ['正印', '偏印']
  };

  // 取十神类能量（ssTenGodEnergy，十神级聚合）
  function _catEnergy(tenE, cat) {
    if (!tenE) return 0;
    return (CAT_GODS[cat] || [cat]).reduce((s, g) => s + (tenE[g] || 0), 0);
  }

  // 由 BZ 构造标准判定上下文（喜忌 + 十神能量）；opt 可覆盖（如单测）
  function buildCtx(BZ, opt) {
    opt = opt || {};
    const A = (typeof getAnalysis === 'function') ? getAnalysis(BZ) : null;
    const fuXi = (typeof effXi === 'function') ? effXi(A) : (opt.fuXi || []);
    const fuJi = (typeof effJi === 'function') ? effJi(A) : (opt.fuJi || []);
    const eScore = (typeof window !== 'undefined' && window.wxElementScore) ? window.wxElementScore(BZ) : null;
    const tenE = eScore ? ssTenGodEnergy(BZ, eScore) : null;
    return { BZ, A, fuXi: fuXi.slice(), fuJi: fuJi.slice(), eScore, tenE };
  }

  const REL = {};
  // ， 能量阈值（集中固化，唯一真源），
  // 凡涉及“旺/强/有力/虚浮/过旺/藏旺”的判定门槛，一律引用 REL.TH，杜绝“换一局改一处魔法数字”。
  // 量纲：ePctC / ePct / _ep / caiPct / childE / childStarE 返回值均为 0–100 的能量占比（百分比）。
  // 调参只改本表，新增/删除阈值须同步下方各调用点。
  const TH = {
    PCT_WEAK: 5,     // 虚浮/势弱边界：<5 微，力微；≥5 弱，中和（喜用势弱、子女虚浮）
    PCT_HIDDEN: 10,  // 藏干旺相门槛：≥10% 为“藏旺”
    PCT_POWER: 12,   // 有力下限：透干或官杀基础判定（≥12% 算有力）
    PCT_STRONG: 15,  // 旺/厚/有根/中和偏上门槛：≥15%（旺透、喜用有力、子女旺、财库有根、食伤/官杀健康）
    PCT_VSTRONG: 20, // 旺/丰/独泄门槛：≥20%（财星旺、官杀/印星/食伤丰、食伤独泄、似从财）
    PCT_OVER: 25     // 过旺门槛：≥25%（官杀/印星/食伤过旺、子女过旺、过重）
  };
  REL.TH = TH;



  /* ============================ 1. 五行关系 ============================ */
  REL.wx = {
    // 返回 {kind:'sheng'|'ke'|null, reverse: '母多灭子'|'子旺母衰'|'反侮'|'克之太过'|null}
    rel(aWx, bWx, kind) {
      // kind 可省略，自动判定（a 生/克 b）
      let k = kind;
      if (!k) {
        if (WX_SHENG[aWx] === bWx) k = 'sheng';
        else if (WX_KE[aWx] === bWx) k = 'ke';
        else return { kind: null, reverse: null };
      }
      return { kind: k, reverse: null };
    },
    // 反生/反克方向：ea=生者/克者能量，eb=受生者/被克者能量（十神级或五行级均可）
    reverseType(kind, ea, eb) {
      if (kind === 'sheng') {
        if (ea >= eb * REV) return '母多灭子';     // 生者过旺壅埋受生者（生多为克）
        if (eb >= ea * REV) return '子旺母衰';     // 受生者过旺耗泄生者
      } else if (kind === 'ke') {
        if (eb >= ea * REV) return '反侮';          // 被克者过旺反克克者
        if (ea >= eb * REV) return '克之太过';      // 克者过旺制死被克者
      }
      return null;
    },
    REV
  };

  /* ============================ 2. 十神关系 ============================ */
  // ctx: {WXOF, LQ, XI:Set, JI:Set, tenE, fuXi, fuJi}
  //   WXOF: 十神类→五行；LQ: 十神类→个数；XI/JI: 五行喜忌集合
  // a,b: 十神类（比劫/食伤/财星/官杀/印星）；kind: 'sheng'|'ke'
  REL.ten = {
    rel(ctx, a, b, kind) {
      const WXOF = ctx.WXOF, LQ = ctx.LQ, XI = ctx.XI, JI = ctx.JI, tenE = ctx.tenE;
      const wa = WXOF[a] || '', wb = WXOF[b] || '';
      const la = LQ[a] || 0, lb = LQ[b] || 0;
      const relWord = kind === 'sheng' ? '生' : '克';
      const aXi = XI.has(wa), aJi = JI.has(wa), bXi = XI.has(wb), bJi = JI.has(wb);
      // 能量级（十神能量占比 0–100，引用 REL.TH 唯一阈值）
      const lvl = e => e >= REL.TH.PCT_VSTRONG ? '旺' : (e >= REL.TH.PCT_POWER ? '有力' : (e >= REL.TH.PCT_WEAK ? '有气' : '弱'));
      const xj = (w, x, j) => x ? '<span class="tip sha-ji">喜用</span>' : (j ? '<span class="tip sha-xiong">忌神</span>' : '闲神');
      let s = a + relWord + b + '（' + wa + relWord + wb + '）';
      if (!la && !lb) return s + '：两者皆不现，此链无凭，待岁运引动。';
      // 作用者 a 不现：受者 b 喜忌定语气，喜用暂不受制为安、忌神暂未受制为去忌无力
      if (!la) {
        if (kind === 'sheng') {
          if (bXi) return s + '：' + a + '不现，' + b + '（' + xj(wb,bXi,bJi) + '）暂不得生、资力未充；岁运引' + a + '透出则' + b + '得生助、吉力相生。';
          if (bJi) return s + '：' + a + '不现，' + b + '（' + xj(wb,bXi,bJi) + '）无生源、忌势不起；岁运引出则须防其生助忌势。';
          return s + '：' + a + '不现，生源缺，待岁运引动。';
        }
        if (bXi) return s + '：' + a + '不现，' + b + '（' + xj(wb,bXi,bJi) + '）暂不受克、当前无碍；岁运引' + a + '透出则须防被克、宜制化（如以印护' + b + '或泄' + a + '）。';
        if (bJi) return s + '：' + a + '不现，' + b + '（' + xj(wb,bXi,bJi) + '）暂未受制、去忌无力；岁运引出则' + a + '制' + b + '、去忌得力。';
        return s + '：' + a + '不现，克制缺，待岁运引动。';
      }
      // 受者 b 不现：喜用暂不受克为安、忌神不现为善；生者无处泄耗则气机郁结
      if (!lb) {
        if (kind === 'sheng') return s + '：' + b + '不现，' + a + '受生无凭；' + a + '（生者）无以泄耗、气机郁结其势难舒，须待岁运引' + b + '透出方成其用。';
        if (bXi) return s + '：' + b + '（' + xj(wb,bXi,bJi) + '）不现，暂不受克、当前无碍；岁运引' + b + '透出则须防被' + a + '所克、宜制化（如以印护' + b + '或泄' + a + '）。';
        if (bJi) return s + '：' + b + '（' + xj(wb,bXi,bJi) + '）不现，无克可及、喜用不受损；岁运引出则须防其扰。';
        return s + '：' + b + '不现，无受克之实；岁运引出则视其喜忌而定。';
      }
      // 双方皆现：先明示喜忌与能量，再判顺生/反生，最后综合损益（含缺失方含义）
      const ea = _catEnergy(tenE, a), eb = _catEnergy(tenE, b);
      const eaL = lvl(ea), ebL = lvl(eb);
      const inv = REL.wx.reverseType(kind, ea, eb);
      let en, ji;
      if (kind === 'sheng') {
        if (inv === '母多灭子') en = '生多为克（' + wa + '旺埋' + wb + '、' + a + '壅' + b + '）';
        else if (inv === '子旺母衰') en = '弱生反泄（' + wb + '旺耗' + wa + '）';
        else en = ea >= eb ? '旺生有力' : (ea < REL.TH.PCT_WEAK && eb < REL.TH.PCT_WEAK ? '两弱生微' : '相生得宜');
        if (inv === '母多灭子') ji = bXi ? '、喜神被壅须疏泄' : (bJi ? '、反去忌神' : '、生多为克');
        else if (inv === '子旺母衰') ji = aXi ? '、喜神被耗宜补' : (aJi ? '、忌神被泄反吉' : '');
        else ji = aXi && bXi ? '、两喜相生得助' : (aXi && bJi ? '、生忌助势宜防' : (aJi && bXi ? '、先耗后成' : (aJi && bJi ? '、忌势相连须防' : '')));
      } else {
        if (inv === '反侮') en = '反克（' + (REVERSE_KE[wb] || (wb + '旺反克' + wa)) + '）';
        else if (inv === '克之太过') en = '克之太过（' + wa + '旺制' + wb + '太过）';
        else en = ea >= eb ? '克制有力' : (ea < REL.TH.PCT_WEAK && eb < REL.TH.PCT_WEAK ? '两弱克微' : '相克得宜');
        if (inv === '反侮') ji = aXi ? '、喜神被反克须防' : (aJi ? '、忌神反制反吉' : '');
        else if (inv === '克之太过') ji = bXi ? '、喜神被制太过须护' : (bJi ? '、去忌太过亦损中' : '');
        else ji = aXi && bJi ? '、去忌得力' : (aXi && bXi ? '、两喜相伤' : (aJi && bJi ? '、反去一忌' : (aJi && bXi ? '、喜用受损须防' : '')));
      }
      s += '：' + a + '为' + xj(wa,aXi,aJi) + '、' + eaL + '（' + wa + '），'
         + b + '为' + xj(wb,bXi,bJi) + '、' + ebL + '（' + wb + '）；'
         + en + ji + '。';
      return s;
    }
  };

  /* ============================ 2.5 十神断语资产（表二，顶层一处定义）============================ */
  // 用途：事业/婚姻/健康/家庭 与"十神相互关系"表统一调用。只做判定（满足关系+含义），不含古籍出处。
  // 判定三要素（声明式）：cn(十神类计数) × xj(五行喜忌) × en(能量档，可省)；strong 判身强/弱。
  // ctx 契约：{ BZ, A, fuXi, fuJi, tenCnt, xjWx, tenE, strength }
  //   tenCnt: {官杀:n,印星:n,食伤:n,财星:n,比劫:n}; xjWx: {官杀五行:'喜'|'忌'|'中'...};
  //   tenE: 十神能量(0-100); strength: '强'|'中'|'弱'
  // need 字段（均满足才输出）：
  //   cn: {类:比较串}           十神类计数（>=/< /==）
  //   xj: {类:'喜'|'忌'}        该类五行喜忌（用 xjWx）
  //   none:{类:...}             该类计数为 0
  //   en: {类:'旺'|'有力'|'虚'|...}  能量档（可选；按 REL.TH 分）
  //   strong: ['强'|'中'|'弱']
  //   pos: {类:柱位}            某类十神落于某柱（柱位=年柱/月柱/日柱/时柱；可加 干/支 后缀如 日干/日支；可数组=落于任一；! 前缀=否定）
  //   nopos:{类:柱位}           某类十神不落于该柱（等价 pos 的 ! 前缀，语义更直白）
  //   zhi: {类:地支字}          该类十神所坐地支为指定字（如 辰戌丑未=入墓库；可数组）
  //   nofzhi:{类:地支字}        该类十神所坐地支非指定字
  REL.tenCombo = {
    DATAS: [],
    _evalCmp(rules, ctx) {
      const R = ctx.tenCnt || {}, G = ctx.gCnt || {}, W = ctx.xjWx || {}, E = ctx.tenE || {};
      // 性别门控：need.sex 设为 '男'/'女' 时，须与实际性别一致才输出（无性别差异的断语不设此字段）
      if (rules.sex) { const actualMale = ctx.isMale; const wantMale = (rules.sex === '男'); if (wantMale !== !!actualMale) return false; }
      const cmpOne = (d, cond) => { const m = String(cond).match(/^(>=|<=|==|=|>|<)?\s*(\d+)/); if (!m) return false; const n = +m[2], op = m[1] || '>='; return op==='>='? d>=n : op==='<='? d<=n : op==='>'? d>n : op==='<'? d<n : d===n; };
      // 落柱判定：某类十神（或单神）是否落于指定柱位（含天干透/地支本气）
      const _catSS = {'财星':['正财','偏财'],'官杀':['正官','七杀'],'印星':['正印','偏印'],'食伤':['食神','伤官'],'比劫':['比肩','劫财']};
      const _hasSS = (cat, ss) => (_catSS[cat] || [cat]).indexOf(ss) >= 0;
      const _posHit = (cat, spec) => {
        const cells = ctx.posCells || [];
        const specs = Array.isArray(spec) ? spec : [spec];
        return specs.some(s => {
          const neg = s.charAt(0) === '!'; if (neg) s = s.slice(1);
          let hit = false;
          if (/^(年|月|日|时)干$/.test(s)) {
            const cc = cells.find(x => x.lbl === s.slice(0,1) + '柱');
            hit = !!(cc && cc.tg && _hasSS(cat, cc.tg));
          } else if (/^(年|月|日|时)支$/.test(s)) {
            const cc = cells.find(x => x.lbl === s.slice(0,1) + '柱');
            hit = !!(cc && cc.tz && _hasSS(cat, cc.tz));
          } else {
            const c = cells.find(x => x.lbl === s);
            hit = !!(c && ((c.tg && _hasSS(cat, c.tg)) || (c.tz && _hasSS(cat, c.tz))));
          }
          return neg ? !hit : hit;
        });
      };
      for (const k in rules.cn || {}) { if (!cmpOne(R[k]||0, rules.cn[k])) return false; }
      for (const k in rules.g || {}) { if (!cmpOne(G[k]||0, rules.g[k])) return false; }
      for (const k in rules.xj || {}) { const tag = W[k]; if (tag !== rules.xj[k]) return false; }
      for (const k in rules.none || {}) { if ((R[k]||0) > 0) return false; }
      for (const k in rules.pos || {}) { if (!_posHit(k, rules.pos[k])) return false; }
      for (const k in rules.nopos || {}) { if (_posHit(k, rules.nopos[k])) return false; }
      // 地支字判定：该类十神所坐地支（本气或透干同柱地支）为指定字
      const _zhiHit = (cat, spec) => {
        const cells = ctx.posCells || [];
        const chars = Array.isArray(spec) ? spec.join('') : String(spec);
        return cells.some(c => {
          const has = (c.tg && _hasSS(cat, c.tg)) || (c.tz && _hasSS(cat, c.tz));
          if (!has) return false;
          return chars.indexOf(c.z) >= 0;
        });
      };
      for (const k in rules.zhi || {}) { if (!_zhiHit(k, rules.zhi[k])) return false; }
      for (const k in rules.nofzhi || {}) { if (_zhiHit(k, rules.nofzhi[k])) return false; }
      if (rules.strong && !rules.strong.includes(ctx.strength)) return false;
      for (const k in rules.en || {}) {
        const e = _catEnergy(E, k); const want = rules.en[k];
        const ok = (want==='旺' ? e >= REL.TH.PCT_VSTRONG : want==='有力' ? e >= REL.TH.PCT_POWER : want==='虚' ? e < REL.TH.PCT_WEAK : e >= REL.TH.PCT_WEAK);
        if (!ok) return false;
      }
      // ── 地支关系判定：relChong/relXing/relHai/relHe/relPo/relAnhe/relSanXing/relSelfXing
      //    值 = 柱位（'日支'等，可数组，! 前缀取反）或 'any'（任意柱位参与该关系）
      const _relHit = (key, spec) => {
        const arr = (ctx.relPos && ctx.relPos[key]) || [];
        if (spec === 'any') return arr.length > 0;
        const specs = Array.isArray(spec) ? spec : [spec];
        return specs.some(s => {
          const neg = s.charAt(0) === '!'; const t = neg ? s.slice(1) : s;
          return neg ? arr.indexOf(t) < 0 : arr.indexOf(t) >= 0;
        });
      };
      if (rules.relChong !== undefined && !_relHit('chong', rules.relChong)) return false;
      if (rules.relXing !== undefined && !_relHit('xing', rules.relXing)) return false;
      if (rules.relSanXing !== undefined && !_relHit('sanXing', rules.relSanXing)) return false;
      if (rules.relSelfXing !== undefined && !_relHit('selfXing', rules.relSelfXing)) return false;
      if (rules.relHai !== undefined && !_relHit('hai', rules.relHai)) return false;
      if (rules.relHe !== undefined && !_relHit('he', rules.relHe)) return false;
      if (rules.relPo !== undefined && !_relHit('po', rules.relPo)) return false;
      if (rules.relAnhe !== undefined && !_relHit('anhe', rules.relAnhe)) return false;
      // 特定柱位对相冲/相合/相刑/相害（如 日时相冲：relChongPair:['日支','时支']）
      const _pairHit = (pairs, want) => { const w = (Array.isArray(want) && Array.isArray(want[0])) ? want : [want]; return w.some(x => (pairs||[]).some(p => p[0]===x[0] && p[1]===x[1])); };
      if (rules.relChongPair !== undefined && !_pairHit(ctx.chongPairs, rules.relChongPair)) return false;
      if (rules.relHePair !== undefined && !_pairHit(ctx.hePairs, rules.relHePair)) return false;
      if (rules.relXingPair !== undefined && !_pairHit(ctx.xingPairs, rules.relXingPair)) return false;
      if (rules.relHaiPair !== undefined && !_pairHit(ctx.haiPairs, rules.relHaiPair)) return false;
      // 羊刃：yangren:true（四柱任意有羊刃）| '日支'等柱位 | 数组
      if (rules.yangren !== undefined) {
        const yp = (ctx.yangRen && ctx.yangRen.pos) || [];
        if (rules.yangren === true) { if (!yp.length) return false; }
        else {
          const specs = Array.isArray(rules.yangren) ? rules.yangren : [rules.yangren];
          if (!specs.some(s => yp.indexOf(s) >= 0)) return false;
        }
      }
      // 神煞：shensha:{神煞名: true(任意柱)|'日支'等柱位|数组}（神煞名剥括号注，如 '桃花'/'驿马'/'阴差阳错'）
      if (rules.shensha) {
        const sm = ctx.shaMap || {};
        for (const k in rules.shensha) {
          const want = rules.shensha[k];
          const pos = sm[k] || [];
          if (want === true) { if (!pos.length) return false; }
          else {
            const specs = Array.isArray(want) ? want : [want];
            if (!specs.some(s => pos.indexOf(s) >= 0)) return false;
          }
        }
      }
      // 十二长生：cs:{长生位: 柱位|数组}，日主在该柱的十二长生为该位（如 cs:{'长生':'日支'}）
      if (rules.cs) {
        const cm = ctx.csMap || {};
        for (const k in rules.cs) {
          const want = rules.cs[k];
          const specs = Array.isArray(want) ? want : [want];
          if (!specs.some(p => cm[p] === k)) return false;
        }
      }
      // 十神类×地支关系：tenChong:{类:true}，该类十神落支参与六冲（如 财星被冲）
      if (rules.tenChong) {
        const tc = ctx.tenChong || {};
        for (const k in rules.tenChong) { if (!tc[k]) return false; }
      }
      // 十神类×神煞：tenSha:{类: '神煞名'|数组}，该类十神落支临某神煞（如 官星带桃花）
      if (rules.tenSha) {
        const ts = ctx.tenSha || {};
        for (const k in rules.tenSha) {
          const want = rules.tenSha[k];
          const list = ts[k] || [];
          const specs = Array.isArray(want) ? want : [want];
          if (!specs.some(s => list.indexOf(s) >= 0)) return false;
        }
      }
      // 十神类×十二长生：csTen:{类: '长生位'|数组}，该类十神五行在落支的长生位（如 财星坐长生）
      if (rules.csTen) {
        const ct = ctx.csTen || {};
        for (const k in rules.csTen) {
          const want = rules.csTen[k];
          const list = ct[k] || [];
          const specs = Array.isArray(want) ? want : [want];
          if (!specs.some(s => list.indexOf(s) >= 0)) return false;
        }
      }
      return true;
    },
    // matchAll(ctx, opts)：opts={dirs?:['career'|'marry'|'health'|'family'], theme?:'career'等, max?:数量上限}
    //   断语的 cats(方向数组)与 opts.dirs 有交集才输出；dirs 不传则输出全部。theme 命中取主题句。
    //   输出按权重 w 降序（w=3 核心经典组合 > w=2 方向专断 > w=1 常规补充），同权重保持定义顺序（稳定）；
    //   排序在引擎层统一完成，四模块/十神宫位卡等所有调用点共享同一顺序，杜绝各自再排。
    matchAll(ctx, opts) {
      opts = opts || {};
      const dirs = opts.dirs; const theme = opts.theme;
      const out = [];
      for (let i = 0; i < this.DATAS.length; i++) {
        const it = this.DATAS[i];
        if (this._evalCmp(it.need, ctx)) {
          if (dirs && it.cats && !it.cats.some(c=>dirs.indexOf(c)>=0)) continue; // 方向不符则不强解
          // 极致定向：条目带 describe(ctx) 时，按本盘四柱动态生成专属文本（替代静态 say 套话）
          const baseSay = (typeof it.describe === 'function') ? it.describe(ctx) : it.say;
          let say = baseSay;
          if (theme) {
            if (theme === 'marry') { say = ctx.isMale ? (it.marryM || baseSay) : (it.marryF || baseSay); }
            else if (it[theme]) say = it[theme];
          }
          out.push({ name: it.name, say, tname: it.name, w: it.w || 1, _i: i });
        }
      }
      out.sort((a,b)=>(b.w - a.w) || (a._i - b._i));
      return opts.max ? out.slice(0, opts.max) : out;
    },
    // ── 十神流转（顶层一处定义：断语表/事业/婚姻/性格健康/家庭 各处统一调用）──
    // 五环相生链：印星 → 比劫 → 食伤 → 财星 → 官杀 →（再生回印星）。
    // 专业判定（管道模型）：每环能量＝该类十神能量之和（管道粗细），
    //，环节成立＝相邻两环都"现且有气"（能量达"有气"以上），非仅计数存在；
    //，断点＝某环能量极弱（管道过细）→ 流通在此受阻，指短板环节；
    //，壅塞＝上游过旺而下游不足（母旺灭子/生多壅塞）→ 强环节压弱环节；
    //，顺畅＝各环俱现且无短板、能量递次相接。
    // ctx 提供 tenCnt(类计数)、tenE(单神能量)、strength(身强弱)。
    LZ_CYCLE: ['印星','比劫','食伤','财星','官杀'],
    LZ_LABEL: { '印星':'印星','比劫':'比劫','食伤':'食伤','财星':'财星','官杀':'官杀' },
    LZ_SS: { '印星':['正印','偏印'],'比劫':['比肩','劫财'],'食伤':['食神','伤官'],'财星':['正财','偏财'],'官杀':['正官','七杀'] },
    _lzLevel(e,avg){ if(e<=0) return '虚'; if(avg>0 && e>=avg*0.9) return '旺'; if(avg>0 && e>=avg*0.5) return '有力'; if(e>=REL.TH.PCT_WEAK*2) return '有气'; return '弱'; },
    flowLiuzhuan(ctx) {
      const C=(ctx&&ctx.tenCnt)||{}; const E=(ctx&&ctx.tenE)||{};
      let say;
      const short = c => this.LZ_LABEL[c] || c;
      const pairs = [['印星','比劫'],['比劫','食伤'],['食伤','财星'],['财星','官杀'],['官杀','印星']];
      // 每环能量=该类单神能量和；均值=五环能量均值（作为"中等管道"基准）
      const en={}; let eSum=0;
      this.LZ_CYCLE.forEach(c=>{ let s=0; (this.LZ_SS[c]||[]).forEach(ss=>s+=(E[ss]||0)); en[c]=s; eSum+=s; });
      const avg=eSum/5;
      const lv={}; this.LZ_CYCLE.forEach(c=>{ lv[c]=this._lzLevel(en[c],avg); });
      // 环节成立：相邻两环 现(计数>0) 且 有气(能量>有气阈)，纯"存在但虚浮"不算流通
      const pairOk = p => { const [a,b]=p; const ea=(C[a]||0)>0, eb=(C[b]||0)>0; return ea&&eb&&lv[a]!=='虚'&&lv[b]!=='虚'; };
      const okP = pairs.map(p=>({p,ok:pairOk(p)}));
      const presentPairs = okP.filter(x=>x.ok).map(x=>x.p);
      const missingPairs = okP.filter(x=>!x.ok).map(x=>x.p);
      // 短板环（能量最弱的有气以下环节），流通瓶颈
      const weakRings = this.LZ_CYCLE.filter(c=>lv[c]==='虚'||lv[c]==='弱');
      // 壅塞点：某环旺而下游虚/弱（母旺无泄）
      const jam=[];
      pairs.forEach(([a,b])=>{ if(lv[a]==='旺'&&(lv[b]==='虚'||lv[b]==='弱')) jam.push([a,b]); });
      // ，— 客观、结构化输出（完整顺生链条 + 逐环能量力度 + 缺失环节 + 短板，禁文艺措辞），—
      // 顺生链条按命理正向排出：财生官杀 → 官杀生印 → 印生比劫 → 比劫生食伤 → 食伤生财
      const LZ_LINK = [['财星','官杀'],['官杀','印星'],['印星','比劫'],['比劫','食伤'],['食伤','财星']];
      const linkNames = LZ_LINK.map(([a,b])=>short(a)+'生'+short(b)).join('、');
      // 每环成立：能量为弱/有气及以上（虚即断）；全链据此数出缺失环节
      const linkOk = LZ_LINK.map(([a,b])=>({p:[a,b], ok: lv[a]!=='虚' && lv[b]!=='虚'}));
      const missingLink = linkOk.filter(x=>!x.ok).map(x=>x.p);
      const presentLink = linkOk.filter(x=>x.ok).map(x=>x.p);
      // 逐环力度客观档位
      const lvLabel = { '旺':'旺','有力':'有力','有气':'有气','弱':'偏弱','虚':'近乎无' };
      const ringPower = this.LZ_CYCLE.map(c=>(short(c) + lvLabel[lv[c]] + (Math.round(en[c])||0))).join('，');
      // 弱/虚短板与旺壅塞
      const weakRing = this.LZ_CYCLE.filter(c=>lv[c]==='弱');   // 偏弱（仍存）
      const deadRing = this.LZ_CYCLE.filter(c=>lv[c]==='虚');   // 近乎无（断）
      const jamPair = [['印星','比劫'],['比劫','食伤'],['食伤','财星'],['财星','官杀'],['官杀','印星']]
        .filter(([a,b])=>lv[a]==='旺' && (lv[b]==='弱'||lv[b]==='虚'));
      const complete = missingLink.length===0 && deadRing.length===0 && weakRing.length===0;
      // ， 专业维度补强：每环喜忌 + 身强弱导向 + 流通吉凶结论 ，
      const xj = (ctx&&ctx.xjWx)||{};                       // 类→'喜'|'忌'|'中'
      const xjWord = { '喜':'喜用','忌':'忌神','中':'平' };
      const strName = { '强':'身强','中':'中和','弱':'身弱' };
      const strength = (ctx&&ctx.strength)||'中';
      const ringXj = this.LZ_CYCLE.map(c=>short(c)+(xjWord[xj[c]]||'平')).join('，');
      const xiSet = this.LZ_CYCLE.filter(c=>xj[c]==='喜');   // 喜用之环
      const jiSet = this.LZ_CYCLE.filter(c=>xj[c]==='忌');   // 忌神之环
      const flowGood = xiSet.length>0 && presentLink.length>0 && presentLink.some(([a,b])=>xj[a]==='喜'||xj[b]==='喜');
      // 身强身弱决定流通主用：身强宜食伤泄、身弱宜印比生
      const strongKeep = strength==='强'
        ? '身强则流通以食伤泄秀为用、印比生扶为忌，宜顺其泄。'
        : (strength==='弱'
          ? '身弱则流通以印星、比劫生扶为用，食伤过旺泄身为忌。'
          : '身中和，流通以喜用为顺、忌神为阻。');
      // 拼接（精简去重 + 分段，每句一段 <br>；不重复列链条/相接，周备且喜用则建议从简）
      const L=[];   // 各行
      // 段1 结论
      L.push(complete ? '顺生流转周备。' : '顺生流转未畅。');
      // 段2 力度
      L.push('力度：' + ringPower + '。');
      // 段3 喜忌
      L.push('喜忌：' + ringXj + '。');
      // 段4 环节完整度（不再重列相接；只给缺失/断点/短板/壅塞）
      if (missingLink.length) L.push('环节缺失：缺' + missingLink.length + '环（' + missingLink.map(([a,b])=>short(a)+'生'+short(b)).join('、') + '）。');
      else L.push('环节：十神俱全。');
      if (deadRing.length) L.push('断点：' + deadRing.map(short).join('、') + '近乎无，流通中断。');
      if (weakRing.length) L.push('力度短板：' + weakRing.map(short).join('、') + '偏弱，为流通瓶颈。');
      if (jamPair.length) L.push('力度壅塞：' + jamPair.map(([a,b])=>short(a)+'旺而'+short(b)+'弱').join('、') + '。');
      // 段5 流通判定（浅显化：说清"力量偏于喜用/忌神"；未完给身强弱导向）
      if (complete) {
        L.push(flowGood
          ? '流通之力多落在喜用之神上，方向相顺，主吉。'
          : (jiSet.length ? ('流通之力多落在' + jiSet.map(short).join('、') + '忌神上，虽通亦当防其耗。') : '流通气机顺畅。'));
      } else {
        L.push('流通未完。' + strongKeep);
      }
      // 段6 建议（周备且落喜为吉则不再给空泛建议；仅周备但落忌 或 未完 才给）
      if (complete && flowGood) {
        // 已为吉，不给空泛建议
      } else {
        const act = [];
        if (deadRing.length) act.push('补' + deadRing.map(short).join('、') + '之虚');
        if (weakRing.length) act.push('扶' + weakRing.map(short).join('、') + '之弱');
        if (jamPair.length) act.push('泄' + jamPair.map(([a,b])=>short(a)+'之旺').join('、'));
        L.push(act.length ? ('宜借喜用岁运' + act.join('、') + '，以畅其流。')
          : (complete ? (jiSet.length ? ('宜借喜用泄' + jiSet.map(short).join('、') + '，以正流通之向。') : '无需补缺。')
             : '宜借喜用岁运牵动流通，以正其向。'));
      }
      say = L.join('<br>');
      return { en, lv, weakRings:weakRing, jam:jamPair, missingPairs:missingLink, presentPairs:presentLink, completeCycle: complete, label: '十神流转', say };
    },
    // 统一 ctx 构建（一处设定：四卡/表格都调它，杜绝各处手拼喜忌/能量/计数）
    buildCtx(BZ) {
      try{
        const W=typeof window!=='undefined'?window:null;
        const _tenGod=typeof tenGod!=='undefined'?tenGod:(W&&W.tenGod), _zhiMain=typeof zhiMain!=='undefined'?zhiMain:(W&&W.zhiMain);
        const _GAN_WX=typeof GAN_WX!=='undefined'?GAN_WX:(W&&W.GAN_WX), _WX_KE=typeof WX_KE!=='undefined'?WX_KE:(W&&W.WX_KE), _WX_SHENG=typeof WX_SHENG!=='undefined'?WX_SHENG:(W&&W.WX_SHENG);
        const _ssCnt=(W&&W.ssCount)||(typeof ssCount!=='undefined'?ssCount:null), _lq=(W&&W.ssLiuqin)||(typeof ssLiuqin!=='undefined'?ssLiuqin:null);
        const _es=(typeof wxElementScore!=='undefined')?wxElementScore:(W&&W.wxElementScore), _tenE=(typeof ssTenGodEnergy!=='undefined')?ssTenGodEnergy:(W&&W.ssTenGodEnergy);
        const _ga=(typeof getAnalysis!=='undefined')?getAnalysis:(W&&W.getAnalysis), _ex=(typeof effXi!=='undefined')?effXi:(W&&W.effXi), _ej=(typeof effJi!=='undefined')?effJi:(W&&W.effJi);
        const dg=BZ.dayGan, dwx=_GAN_WX?(_GAN_WX[dg]||''):'';
        if(!dg) return null;
        const A=_ga?_ga(BZ):null;
        const xi=new Set(_ex&&A?_ex(A):[]), ji=new Set(_ej&&A?_ej(A):[]);
        const lq=(_lq&&_ssCnt)?_lq(_ssCnt(BZ.gans,BZ.zhis,dg)):{};
        const tenCnt={'官杀':lq['官杀']||0,'印星':lq['印星']||0,'食伤':lq['食伤']||0,'财星':lq['财星']||0,'比劫':lq['比劫']||0};
        const gCnt={}; (BZ.gans||[]).forEach(g=>{const t=_tenGod?_tenGod(dg,g):null; if(t)gCnt[t]=(gCnt[t]||0)+1;}); (BZ.zhis||[]).forEach(z=>{const t=(_tenGod&&_zhiMain)?_tenGod(dg,_zhiMain(z)):null; if(t)gCnt[t]=(gCnt[t]||0)+1;});
        const killWx=_WX_KE?Object.keys(_WX_KE).find(k=>_WX_KE[k]===dwx):'', yinWx=_WX_SHENG?Object.keys(_WX_SHENG).find(k=>_WX_SHENG[k]===dwx):'', shangWx=_WX_SHENG?_WX_SHENG[dwx]:'', wealthWx=_WX_KE?_WX_KE[dwx]:'';
        const WXOF={'官杀':killWx,'印星':yinWx,'食伤':shangWx,'财星':wealthWx,'比劫':dwx};
        const xjWx={}; for(const k in WXOF){ if(!WXOF[k]) continue; const v=WXOF[k]; xjWx[k]=xi.has(v)?'喜':(ji.has(v)?'忌':'中'); }
        const eScore=_es?_es(BZ):null;
        const tenE=(eScore&&_tenE)?_tenE(BZ,eScore):null;
        const strength=A&&A.strength?(A.strength.includes('强')?'强':A.strength.includes('弱')?'弱':'中'):'中';
        const isMale=(BZ.sex===1||BZ.sex==='男'||BZ.sex===true||BZ.sex==='1');
        // ── 四柱十神落位（供需看"哪一柱"的断语动态取用；不看柱位的断语一律不用）──
        // posCells[i] = {lbl, g, z, tg(天干十神/日主自身为null), tz(地支本气十神), isSelf}
        const posCells=(function(){
          const _zm=_zhiMain, _tg=_tenGod, lbls=['年柱','月柱','日柱','时柱'], out=[];
          (BZ.zhis||[]).forEach((z,i)=>{
            const g=(BZ.gans||[])[i], isSelf=(g===dg&&i===2);
            out.push({ lbl:lbls[i], g, z, tg:isSelf?null:(_tg?_tg(dg,g):null), tz:(_zm&&_tg)?_tg(dg,_zm(z)):null, isSelf });
          });
          return out;
        })();
        // 便捷：某十神类（'财星'/'官杀'/'印星'/'食伤'/'比劫'，或单神名如'正财'）落于哪几柱（含天干透/地支本气）
        const CAT2SS={'财星':['正财','偏财'],'官杀':['正官','七杀'],'印星':['正印','偏印'],'食伤':['食神','伤官'],'比劫':['比肩','劫财']};
        function godPos(cat){
          const ss=(CAT2SS[cat]||[cat]); const res={gan:[], zhi:[], full:[]};
          posCells.forEach(c=>{
            if(ss.indexOf(c.tg)>=0) res.gan.push(c.lbl);
            if(ss.indexOf(c.tz)>=0) res.zhi.push(c.lbl);
            if(ss.indexOf(c.tz)>=0 || ss.indexOf(c.tg)>=0) res.full.push(c.lbl);
          });
          return res;
        }
        // ── 地支关系（刑冲害合破）与羊刃：供需看"某柱逢冲/刑/害/合、羊刃落柱"的断语 ──
        // relPos 各键 = 参与该关系的柱位集合（'年支'/'月支'/'日支'/'时支'）；Pairs = 具体柱位对
        const _znames=['年支','月支','日支','时支'];
        const _zhis=BZ.zhis||[];
        const _pairInL=(a,b,list)=>{ for(let i=0;i<list.length;i++){ const g=list[i]; if((g[0]===a&&g[1]===b)||(g[0]===b&&g[1]===a)) return true; } return false; };
        const relPos={chong:[],xing:[],sanXing:[],selfXing:[],hai:[],po:[],he:[],anhe:[]};
        const chongPairs=[], hePairs=[], xingPairs=[], haiPairs=[];
        for(let i=0;i<_zhis.length;i++) for(let j=i+1;j<_zhis.length;j++){
          const a=_zhis[i], b=_zhis[j], pa=_znames[i], pb=_znames[j];
          if(_pairInL(a,b,DIZHI_CHONG)){ relPos.chong.push(pa,pb); chongPairs.push([pa,pb]); }
          if(_pairInL(a,b,DIZHI_HAI)){ relPos.hai.push(pa,pb); haiPairs.push([pa,pb]); }
          if(_pairInL(a,b,DIZHI_PO)){ relPos.po.push(pa,pb); }
          if(_pairInL(a,b,DIZHI_ANHE)){ relPos.anhe.push(pa,pb); }
          if(DIZHI_HE6.some(g=>(g[0]===a&&g[1]===b)||(g[0]===b&&g[1]===a))){ relPos.he.push(pa,pb); hePairs.push([pa,pb]); }
          // 三刑/相刑（寅巳申、丑戌未、子卯：组内两字同现即构成刑意）
          if(DIZHI_XING.some(g=>g.length>=2&&g.indexOf(a)>=0&&g.indexOf(b)>=0)){ relPos.xing.push(pa,pb); relPos.sanXing.push(pa,pb); xingPairs.push([pa,pb]); }
        }
        // 自刑：辰午酉亥同字重复
        _zhis.forEach((z,i)=>{ if(['辰','午','酉','亥'].indexOf(z)>=0 && _zhis.filter(x=>x===z).length>=2) relPos.selfXing.push(_znames[i]); });
        ['chong','xing','sanXing','selfXing','hai','po','he','anhe'].forEach(k=>{ relPos[k]=[...new Set(relPos[k])]; });
        // 羊刃（日主帝旺位）
        const REN2={'甲':'卯','乙':'寅','丙':'午','丁':'巳','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'};
        const _yrZhi=REN2[dg]||'';
        const yangRen={ zhi:_yrZhi, pos:_zhis.map((z,i)=>z===_yrZhi?_znames[i]:null).filter(Boolean) };
        // ── 神煞落位：神煞名（剥括号注）→ 落柱位数组，供 shensha 判定键取用 ──
        // 数据源 BZ.shaYear/shaMonth/shaDay/shaTime（四柱神煞数组）；字段缺省时为空、不参与判定
        const shaMap={};
        [['年支',BZ.shaYear],['月支',BZ.shaMonth],['日支',BZ.shaDay],['时支',BZ.shaTime]].forEach(function(pair){
          const p=pair[0], arr=pair[1]||[];
          arr.forEach(function(s){
            const nm=String(s||'').replace(/（[^）]+）$/,'').trim();
            if(!nm) return;
            (shaMap[nm]=shaMap[nm]||[]).push(p);
          });
        });
        // ── 日主十二长生在各柱（供 cs 判定键取用）──
        const _cs=(typeof getChangSheng!=='undefined')?getChangSheng:(W&&W.getChangSheng);
        const csMap={};
        _znames.forEach(function(p,i){
          const z=_zhis[i];
          const v=_cs?_cs(dg,z):'';
          if(v) csMap[p]=v;
        });
        // ── 十神类×地支关系/神煞/长生 组合判定：断语必须含十神 ──
        // tenChong:{类:true}  该类十神（地支本气）落支参与六冲
        // tenSha:{类:[神煞名]} 该类十神落支临某神煞（如 官杀落支临桃花 → 官星带桃花）
        // csTen:{类:[长生位]}  该类十神五行（阳干代表）在落支的十二长生（如 财星坐长生）
        const _CAT2SS={'财星':['正财','偏财'],'官杀':['正官','七杀'],'印星':['正印','偏印'],'食伤':['食神','伤官'],'比劫':['比肩','劫财']};
        const _clsOfTz=tg=>{ for(const k in _CAT2SS){ if(_CAT2SS[k].indexOf(tg)>=0) return k; } return ''; };
        const _god2wxT={'比肩':dwx,'劫财':dwx,'食神':shangWx,'伤官':shangWx,'偏财':wealthWx,'正财':wealthWx,'七杀':killWx,'正官':killWx,'偏印':yinWx,'正印':yinWx};
        const _CS_GAN={'木':'甲','火':'丙','土':'戊','金':'庚','水':'壬'};
        const tenChong={}, tenSha={}, csTen={};
        posCells.forEach(function(c){
          if(!c.tz) return;
          const pz=c.lbl.replace('柱','支');
          // 收集该柱所有十神（本气+藏干），以覆盖"本气为比劫但藏干有财星"等情形
          const _hide=(typeof HIDE!=='undefined')?HIDE:(W&&W.HIDE);
          const _tg=_tenGod;
          const allGods=[c.tz];
          if(_hide && _tg){ (_hide[c.z]||[]).forEach(function(hg){ const t=_tg(dg,hg); if(t && t!==c.tz) allGods.push(t); }); }
          const clsSet=new Set();
          allGods.forEach(function(tg){ const cl=_clsOfTz(tg); if(cl) clsSet.add(cl); });
          clsSet.forEach(function(cls){
            if(relPos.chong.indexOf(pz)>=0) tenChong[cls]=true;
            Object.keys(shaMap).forEach(function(sn){ if(shaMap[sn].indexOf(pz)>=0){ (tenSha[cls]=tenSha[cls]||[]).push(sn); } });
          });
          // csTen：该柱各十神五行的长生（用于"财星坐长生""官星坐长生"等判定）
          allGods.forEach(function(tg){
            const cl=_clsOfTz(tg); if(!cl) return;
            const twx=_god2wxT[tg], cgan=_CS_GAN[twx];
            if(cgan && _cs){ const v=_cs(cgan, c.z); if(v){ (csTen[cl]=csTen[cl]||[]).push(v); } }
          });
        });
        Object.keys(tenSha).forEach(k=>{ tenSha[k]=[...new Set(tenSha[k])]; });
        Object.keys(csTen).forEach(k=>{ csTen[k]=[...new Set(csTen[k])]; });
        return { BZ, A, fuXi:[...xi], fuJi:[...ji], tenCnt, gCnt, xjWx, tenE, strength, isMale, posCells, godPos, relPos, chongPairs, hePairs, xingPairs, haiPairs, yangRen, shaMap, csMap, tenChong, tenSha, csTen };
      }catch(e){ return null; }
    }
  };
  // 便捷：五行→其喜忌由调用方转成 类→喜/忌/中 映射
  const _xjWxOf = k => ({'官杀':'官杀','印星':'印星','食伤':'食伤','财星':'财星','比劫':'比劫'}[k]);

  // ， 表二数据：十神关系断语（判定式，去古籍出处），
  // 原则：只用"十神类计数/单神计数 × 五行喜忌 × 能量档 × 身强弱"可可靠判定的；
  //       依赖 合/化/羊刃/宫位 等 ctx 暂不提供信息的条目，宁缺毋滥，待 ctx 扩展后再补（不产出误判断语）。
  // A 官杀系
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    // 判定条件按命理打磨：官印须有力方成"相生"；杀印须杀旺印化；官星遇劫须比劫有力方达得夺；财旺生官须身非弱方任。
    P('官印相生','官星生印、印再生身，身弱中和而官印皆喜，压力化荫庇、主文贵清显。',
      {cn:{'官杀':1,'印星':1},en:{'官杀':'有气','印星':'有气'},xj:{'官杀':'喜','印星':'喜'},strong:['弱','中']},
      {career:'官星为喜用、身弱中和则压力化荫庇，职场循正途升阶、得背书与贵人提携，主文贵。',
       describe(ctx){
         const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const go=GP('官杀').gan, gi=GP('印星').gan;      // 官杀/印星透干柱
         const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
         // 官印是否相邻且官在前（相生序：官生印）：官柱序号 = 印柱序号-1
         const adj = go.some(g=>gi.some(i=> idx[i]===idx[g]+1));
         const parts=[];
         parts.push('官星为喜用、印星亦喜而相生，压力化荫庇、身弱中和循正途得贵。');
         parts.push(adj
           ? '官印紧贴透出（官生于前、印承于后），相生流转最得力，背书与提携并至。'
           : '官印隔柱而透，相生之力见减，须防吉气流转不畅。');
         parts.push('最忌财旺破印、伤官克官、官杀混杂，犯之则贵气陡降。');
         return parts.join('');
       }});
    P('官印相生','官生印而印为忌，吉气被忌神转化、掌权之力减，宜借岁运直用官杀。',{cn:{'官杀':1,'印星':1},en:{'官杀':'有气','印星':'有气'},xj:{'官杀':'喜','印星':'忌'}},{career:'官生印而印为忌，职场得机却借力滞重、晋升权名减损，宜化依托为实绩、直用官杀之位。',
       describe(ctx){
         return '官生印而印为忌，吉气被忌神转化、掌权之力减，宜借岁运直用官杀、化依托为实绩，勿靠印荫坐享其成。';
       }});
    P('官印相生','官为忌而印相之，压力与荫庇并见、名实难副，宜以实力立身。',{cn:{'官杀':1,'印星':1},en:{'官杀':'有气','印星':'有气'},xj:{'官杀':'忌'}},{career:'官为忌则职场压力过实而名位虚悬，靠印庇护仍名实难副，宜沉潜实力、不争虚衔。',
       describe(ctx){
         return '官为忌则权威压力过实而名位虚悬，印虽庇护而名实难副，宜沉潜实力、不逐虚衔，以实绩立身。';
       }});
    P('杀印相生','七杀生印而印化杀生身，化敌为友、危机转权柄，主武贵、权大类过官印。',
  {cn:{'官杀':1,'印星':1},en:{'官杀':'有力','印星':'有气'},xj:{'印星':'喜'}},
  {career:'危机转权柄、谋略驭强敌，事业在高压竞争中以智化解得权，主攻坚型权贵、锋芒强于常规官印，宜决断型领域。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const go=GP('官杀'), gi=GP('印星');
     const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
     // 杀印同柱（地支同宫藏杀印）或天干紧贴相生（杀前印后相邻）
     const sameCol = go.full.some(g=>gi.full.indexOf(g)>=0);
     const adjGan = go.gan.some(g=>gi.gan.some(i=> idx[i]===idx[g]+1));
     const parts=[];
     parts.push('七杀生印而印化杀生身，化敌为友、危机转权柄，主武贵权大。');
     parts.push(sameCol
       ? '杀印同根同支透出，化杀为权最彻底，权柄有根、威不可夺。'
       : (adjGan
         ? '杀印紧贴透出、凶杀得印承接，相生流转、化压力为权。'
         : '杀印隔柱而透，化杀之力见减，须防权不归身。'));
     parts.push('日主身弱得此方真贵；最忌财星破印、官杀混杂、食神扰印及带羊刃，犯之则权不归身。');
     return parts.join('');
   }});
    P('官印双全','官印俱旺而相生，得合法职权、富贵兼得、名利双收。',
  {cn:{'官杀':1,'印星':1},xj:{'官杀':'喜','印星':'喜'},en:{'官杀':'旺','印星':'有力'}},
  {career:'官印双旺相资，职场地位与学养背书兼得，利体制内晋升、以正统路径成名得位，有官有印方能坐实权柄。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const go=GP('官杀'), gi=GP('印星');
     const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
     const adjGan = go.gan.some(g=>gi.gan.some(i=> idx[i]===idx[g]+1));      // 官前印后紧贴透出
     const aroundDay = go.gan.includes('年柱')&&gi.gan.includes('时柱');       // 官年印时夹日
     const parts=[];
     parts.push('官印俱旺而相生，得合法职权、富贵兼得，正官主名分、印主凭据印章。');
     parts.push(adjGan || aroundDay
       ? '官印夹日或紧贴相生、气流通到日干，贵格最显、掌权有凭。'
       : '官印虽旺而隔柱相生，贵气流转见缓，宜防格局欠清。');
     parts.push('最忌财旺破印、伤官克官、官杀混杂，犯之则贵气陡降、有官无印非真官。');
     return parts.join('');
   }});
    P('官杀混杂','正官与七杀并见且未取清，格局欠纯、善恶不分、是非反复。既定正途又思激进、内心纠结内耗，事业多头摇摆，官将不威、政令难行。',
  {g:{'正官':1,'七杀':1}},
  {career:'正官七杀并见，事业方向多头、权责反复、贵人助力与竞争压力并存，宜取清定主攻一条、明确职级定位，防是非内耗。',
   describe(ctx){
     const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[]};};
     const zg=GP('正官'), qs=GP('七杀');
     const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
     const bothGan = zg.gan.filter(g=>qs.gan.indexOf(g)>=0);           // 官杀同透于哪些柱
     const bothFull = (zg.full||[]).filter(g=>(qs.full||[]).indexOf(g)>=0);
     const str = ctx.strength||'中';
     const parts=[];
     parts.push('正官七杀并见而格局欠纯，善恶不分、是非反复。');
     if(bothGan.length||bothFull.length){
       parts.push('官杀' + (bothGan.join('')||bothFull.join('')) + '并见、去留无力，混象最重，官将不威。');
     } else {
       parts.push('官透干而杀藏支（或反之）、一显一隐，混象较轻。');
     }
     parts.push(str==='弱'
       ? '日主身弱忌混，凶力大增、内耗尤甚，宜服官杀之制而成事少成。'
       : '日主身强尚可承混，若能取清（留喜去恶、合去其一）反可转败为成。');
     if(ctx.isMale===false) parts.push('女命官杀皆为夫星，混则婚缘不专、宜慎择主次。');
     return parts.join('');
   }});
    P('官星遇劫','官星喜用被比劫所克，名位受阻、仕途多阻。职场上司权位被同辈分夺、晋升遭同事竞争拆台，男命官星为子女星、比劫克官主为子女操劳或子息缘薄。',
  {cn:{'官杀':1,'比劫':1},en:{'比劫':'有力'},xj:{'官杀':'喜'}},
  {career:'官星被比劫分夺，职场晋升遭同辈竞争、同事拆台，名位易受阻，宜独当一面、防被分功，或以财通关养官。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const go=GP('官杀'), gb=GP('比劫');
     const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
     const adj = go.full.some(g=>gb.full.indexOf(g)>=0)                       // 官比同柱
       || go.gan.some(g=>gb.gan.some(b=> Math.abs(idx[b]-idx[g])===1));        // 官比相邻
     const parts=[];
     parts.push('官星为喜用却被比劫所克，名位受阻、仕途多阻。');
     parts.push(adj
       ? '官比贴邻或同柱相克，分夺之势最明，晋升遭同辈竞争、易被分功拆台。'
       : '官星受比劫分耗，名位渐被侵蚀、须防同辈摊薄。');
     if(ctx.isMale) parts.push('男命官星兼为子女星，比劫克官或主为子嗣操劳、子息缘薄。');
     parts.push('宜独当一面防分功，或财通关（劫生财、财生官）、印化比劫以护官，行运喜官杀旺乡养官。');
     return parts.join('');
   }});
    P('官杀克身','官杀过旺克制日主，压力繁重、身弱难任、志大才疏。责任压身、有小人官非之虞。',
  {cn:{'官杀':1},en:{'官杀':'旺'},strong:['弱']},
  {career:'官杀过旺克身，事业责任压力繁重、身弱难任、易志大才疏，宜靠印星、贵人平台化压，或借团队比劫扛压。',
   describe(ctx){
     const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const go=GP('官杀');
     const daySelf=P.find(c=>c.lbl==='日柱')||{};
     const touchDay = daySelf.tz==='官杀'||daySelf.g==='七杀'||daySelf.g==='正官';   // 日支坐官杀
     const nearMonth = go.full.indexOf('月柱')>=0, nearTime=go.full.indexOf('时柱')>=0; // 月/时柱有官杀
     const parts=[];
     parts.push('官杀过旺克制日主而身弱难任，责任压身、志大才疏。');
     parts.push((touchDay||(nearMonth&&nearTime))
       ? '官杀贴身夹克（日支坐杀或月时并见），压力最重、身心承压尤甚。'
       : '官杀虽旺而隔柱，压力尚可分摊、未至贴身之苦。');
     if(ctx.isMale===false) parts.push('女命官杀为夫星，过旺克身主夫强己弱、婚姻易承压被动。');
     parts.push('宜印化（官杀生印印生身后以柔克刚）、比劫帮身抗杀或食神制杀卸锋，行运喜印比之乡扶身、忌再行财官增压。');
     return parts.join('');
   }});
    P('财旺生官','财旺生官，以财求名、富中取贵。',
      {cn:{'财星':1,'官杀':1},en:{'财星':'旺'},strong:['强','中']},
      {career:'财旺生官，以实务业绩、资源换职位，用财养位、富中求贵，利经营出身掌权，须身任财、财生官方成。',
       describe(ctx){
         const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const gc=GP('财星'), go=GP('官杀');
         const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
         // 财官相贴（同柱 或 天干相邻且财在前[财生官]）
         const sameCol=gc.full.some(f=>go.full.indexOf(f)>=0);
         const adjGan=gc.gan.some(f=>go.gan.some(o=> idx[o]===idx[f]+1));
         const parts=[];
         parts.push('财旺生官，以财求名、富中取贵，利经营出身、商而优则仕。');
         parts.push(sameCol||adjGan
           ? '财官相贴、流通顺畅，气机衔接、贵气显达，以业绩资源养位居重。'
           : '财官隔柱相生、流通不畅，贵气见缓，宜主动以财通官。');
         parts.push('须身能任财、财能生官方成；最忌身弱财旺难任、财星截断于比劫。');
         return parts.join('');
       }});
    P('身财两停','日主与财星势力均衡，能任财、可聚财，主富命。身财相称、财势可持，事业稳健创收、聚散有度；性格务实、量入为出，富而不奢，惟贵在身财相当方能用取。',
      {cn:{'财星':1},en:{'财星':'有力'},strong:['中']},
      {career:'日主与财星均衡，能扛财也能聚财，事业稳健创收、财势可持，主富。'});
    P('身旺财旺','身强财亦旺，任财有力、财有归宿。财源广进、能开格局大收成，凭实力坐享大财、富而有名，宜经商置业以承其大，惟须身强能任、财旺有根。',
      {cn:{'财星':1},strong:['强'],en:{'财星':'旺'}},
      {career:'身强财旺，任财有力、财有归宿，事业开格局大收成、凭实力坐享大财。'});
    P('身弱财多','身弱难任重财，财多耗身、求财反损。见财如见鬼、到手的财握不住，劳碌奔波聚财乏力、辛苦财过手财，易因财生祸或受财所累；须认此身弱不任之局、量力而行，宜补印比担财以生身，忌再行财官增耗。',
      {cn:{'财星':1},strong:['弱'],en:{'财星':'旺'}},
      {career:'身弱难任重财，机会财多却接不住、求财反损身，宜量力而行、补印比担财、忌贪大冒进。'});
    P('杀旺身强','七杀旺而身强可任，杀为我用、化杀为权、掌权辖众。日主强旺足以敌杀，为人刚愎果决、抗压坚韧、敢当大任，宜军警、武职、攻坚管理、创业领兵之域；身杀两停者多有实权、贵显非常。',
  {cn:{'七杀':1},en:{'官杀':'旺'},strong:['强']},
  {career:'杀旺身强可任，事业敢啃硬仗、越压越立、掌实权统辖一方，主攻坚型领导，贵在身杀两停、制化得宜。',
   describe(ctx){
     const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[]};};
     const qs=GP('七杀');
     const monthQi=qs.zhi.indexOf('月柱')>=0||qs.gan.indexOf('月柱')>=0;   // 月令七杀
     const parts=[];
     parts.push('七杀旺而身强可任，杀为我用、化杀为权、掌权辖众。');
     parts.push(monthQi
       ? '月令七杀、格最清真，身强足以敌杀，权柄有根、贵显非常。'
       : '七杀不居月令，格局稍逊，仍须身强能任方成权柄。');
     parts.push('为人刚愎果决、抗压坚韧，宜军警、武职、攻坚管理、创业领兵之域。');
     parts.push('须防杀重身轻则杀反攻身；身杀两停复行杀地亦见灾祸，行运喜制化中和。');
     return parts.join('');
   }});
  })();
  // B 财星系
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('食神生财','食神生财（稳财格），财源有根、以才谋财。',
      {cn:{'食伤':1,'财星':1},strong:['强','中'],xj:{'财星':'喜'}},
      {career:'食神生财，以稳定才艺、产品供给生财，财源有根、细水长流，利技术变现与经营；身强方能扛财卸泄。',
       describe(ctx){
         const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const gs=GP('食伤'), gc=GP('财星'), gb=GP('比劫');
         const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
         // 聚财：食伤在前(年)生财(月)、流通顺畅；耗散：财落时、食伤落时、或比劫截财
         const yearShang=gs.full.indexOf('年柱')>=0, monthCai=gc.full.indexOf('月柱')>=0;
         const timeCai=gc.full.indexOf('时柱')>=0;
         const timeShang=gs.full.indexOf('时柱')>=0;
         const byJie=gb.full.filter(b=>gc.full.indexOf(b)>=0).length>0;   // 比劫与财同柱截财
         const parts=[];
         parts.push('食神生财、财源有根，以才谋财、细水长流，利技术变现与稳定经营。');
         parts.push((yearShang&&monthCai)
           ? '食伤居年、财星居月，财源在上而流通至下、聚财之势良好。'
           : (timeCai||timeShang
             ? '食伤或财星落时柱，财易耗散于晚景或过手中转，宜早设蓄积。'
             : '食伤财星流通尚稳、聚散有度。'));
         if(byJie) parts.push('比劫与财同柱、有截财之虞，须防同辈分利、宜独掌财权。');
         parts.push('最忌印旺克食伤（怀才不遇）与比劫截财；财有库（辰戌丑未）方能存住大财，身弱宜补印比。');
         return parts.join('');
       }});
    P('伤官生财','伤官生财（偏财格），以技艺才华、创新营销求财。',
      {g:{'伤官':1},cn:{'财星':1},en:{'食伤':'有气'},strong:['强','中'],xj:{'财星':'喜'}},
      {career:'伤官生财，以创新才华、营销变现求财，生财有道、利创意运营灵活取利；身强方能扛泄任财。',
       describe(ctx){
         const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const gs=GP('食伤'), gc=GP('财星'), gb=GP('比劫');
         const yearShang=gs.full.indexOf('年柱')>=0, monthCai=gc.full.indexOf('月柱')>=0;
         const timeCai=gc.full.indexOf('时柱')>=0;
         const byJie=gb.full.filter(b=>gc.full.indexOf(b)>=0).length>0;
         const parts=[];
         parts.push('伤官生财、以技艺才华与创新营销求财，思维跳脱、商业嗅觉敏锐。');
         parts.push((yearShang&&monthCai)
           ? '伤官居年、财星居月，才华化为财源、聚财之势佳，利创业营运。'
           : (timeCai
             ? '财星落时柱、财快花销亦大，宜防过手中转耗散。'
             : '伤财流通尚畅、取财有道。'));
         if(byJie) parts.push('比劫截财之虞，合伙宜明算账、防被分润。');
         parts.push('最忌身弱伤旺生财反凶（劳碌难聚）、伤官见官惹是非、印旺制伤才华难变现；身强方能扛泄任财。');
         return parts.join('');
       }});
    P('比劫夺财','身弱而财为忌，比劫夺忌神之财、助身去忌，反主存财。',{cn:{'比劫':1,'财星':1},strong:['弱'],xj:{'财星':'忌'}},{career:'身弱财为忌，靠团队、合伙分担重财、去忌存身，反而守得住，宜借同辈之力经营。'});
    P('比劫夺财','身强财为喜用，比劫争财、喜用受损，主破财、争财口舌，且随比劫所落宫位各有其应。',
      {cn:{'比劫':1,'财星':1},en:{'比劫':'有力'},strong:['强'],xj:{'财星':'喜'}},
      {career:'身强财为喜却被比劫分夺，合伙易起争财口舌、竞利损财，宜独掌财权、防被分润；男命更防婚姻受损。',
       describe(ctx){
         const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[]};};
         const ce=ctx.tenE||{}; const cai=(ce['正财']||0)+(ce['偏财']||0);
         const bi=(ce['比肩']||0)+(ce['劫财']||0);
         const gP=GP('比劫');
         const cl=(lbl)=>P.filter(c=>c.lbl===lbl).some(c=>c.tg==='比劫'||c.tz==='比劫');
         const has={year:cl('年柱'),month:cl('月柱'),day:cl('日柱'),time:cl('时柱')};
         const daySelf=(P.find(c=>c.lbl==='日柱')||{}); const daySat = daySelf.tz==='比劫'; // 日支坐比劫
         const parts=[];
         if(daySat) parts.push('日支坐比劫而财为喜用，夫妻宫为同气所据、伉俪情分转淡，宜防婚姻被岁月消磨或伴侣难入心头。');
         if(has.year) parts.push('比劫临年柱，祖荫难承、难得遗产，早岁即须自谋自立、父母反需己赡。');
         if(has.month) parts.push('比劫临月柱（父母兄弟宫），手足无靠、反受同辈拖累，合伙易失利、难借兄弟之力。');
         if(has.time) parts.push('比劫临时柱（子女宫），子女耗财之象、晚景须防为子嗣破费。');
         if(!parts.length) parts.push('比劫强旺分夺财星，一生财物多虚耗、经济观念不强，多遇同辈夺财。');
         if(ctx.isMale) parts.push('男命财为妻星，比劫夺财更主妻缘受同辈所扰、婚宜迟。');
         parts.push('身强财旺被比劫分夺、喜用财星受损，宜独掌财权、行运喜官杀制比劫旺乡方安。');
         return parts.join('');
       }});
    P('贪财坏印','财星旺克喜用印，根基（靠山、文凭、名节）受损，暗含因财失德、居无定所之象。',
      {cn:{'财星':1,'印星':1},en:{'财星':'有力'},xj:{'印星':'喜','财星':'忌'}},
      {career:'财星旺克喜用印，根基（靠山、文凭、名节）受损，职业学业受妨、易因财损名，宜守正自持、靠比劫制财护印。',
       describe(ctx){
         const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[]};};
         const ce=ctx.tenE||{}; const cai=(ce['正财']||0)+(ce['偏财']||0);
         const yin=(ce['正印']||0)+(ce['偏印']||0);
         // 财落主柱：优先透干，否则地支本气，取月>日>年>时（宫位主近近日主者论断更有针对性）
         const gP=GP('财星'); const cand=gP.gan.concat(gP.zhi);
         const prio=['月柱','日柱','年柱','时柱'];
         const main=(cand.length? cand.sort((a,b)=>prio.indexOf(a)-prio.indexOf(b))[0] : null);
         // 财与印力量比：印有根(≥有气)则有救、印虚(<有气)则根基尽损
         const yinHasRoot = yin >= 5;
         const posTxt = main ? ({
           '年柱':'财临年柱，早年即见因财离家、祖荫难承、早克母之象，初运多奔波。',
           '月柱':'财临月柱（父母兄弟宫），财损印而家计被财所牵，同辈、父母关系易因利生隙、毁誉随之。',
           '日柱':'财临日支配偶宫，婚姻与物欲纠缠、易因财而致夫妻疏离或感情遂物质之累。',
           '时柱':'财临时柱（子女宫），晚景易为子女开销或体疾耗财，守成难聚。'
         }[main]||'') : '';
        const enTxt = yinHasRoot
          ? '财旺克印而印尚有根，根基未绝、仅损皮毛，多成波折而非大害。'
          : '财旺克喜用印而印虚浮无根，立身之本受削、根基动摇，须防因财失学失德、居无定所。';
         const jiuTxt='解救宜比劫制财护印，或财贴官、官贴印通关化险；忌再贪求、行财运愈伤其本。';
         return (posTxt? posTxt + enTxt + jiuTxt : enTxt + jiuTxt);
       }});
    // 比劫帮身（身弱逆因定向：命局以财/官杀/食伤哪一耗身之神最旺，决定帮身用向；单一入口 describe 内择最旺者输出，天然互斥不重复）
    P('比劫帮身','比劫助身，身弱得助、同辈得力。',{cn:{'比劫':1},en:{'比劫':'有力'},strong:['弱']},
      {career:'身弱得比劫相助，事业宜结伴、合伙、借同辈资源扛担。',
       describe(ctx){
         const ce=ctx.tenE||{};
         const cai=(ce['正财']||0)+(ce['偏财']||0);
         const guan=(ce['正官']||0)+(ce['七杀']||0);
         const shi=(ce['食神']||0)+(ce['伤官']||0);
         const bi=(ce['比肩']||0)+(ce['劫财']||0);
         // 择最旺耗身之神定帮身用向（须达"有力"以上才作为主逆因）
         let maxKey='', maxVal=-1;
         [['cai',cai],['guan',guan],['shi',shi]].forEach(([k,v])=>{ if(v>maxVal){maxKey=k;maxVal=v;} });
         const parts=[];
         if(maxVal >= 12){
           parts.push(maxKey==='cai'
             ? '财旺而身弱不任重财，比劫帮身克财、去忌存身，合伙担财、借同辈之力挡财耗，反主守住财；行比劫乡更佳。'
             : (maxKey==='guan'
               ? '官杀旺而身弱，比劫帮身敌官杀、分担重压，如兄弟撑腰替身抗压、化压为任，宜靠团队、合伙共担责任。'
               : '食伤旺而身弱，比劫帮身担泄、补其耗损，点子才艺得同辈补力落地，宜结对合伙、互为表里。'));
         } else {
           parts.push('身弱得比劫之助、同辈合伙得力，宜借兄弟朋友之力扛担共进。');
         }
         parts.push('惟身强之后须防比劫转夺财、合伙须明算账防日后被分利；行运喜比劫印星扶身。');
         return parts.join('');
       }});
  })();
  // C 食伤系
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('伤官见官','伤官克官而官为喜用，恃才犯上、触权惹祸、官非口舌。',
      {g:{'伤官':1,'正官':1},xj:{'官杀':'喜'}},
      {career:'伤官克官而官为喜用，恃才犯上、触权惹祸，职场受挫或官非，宜收敛锋芒、循礼自守；女命更防婚姻失和。',
       describe(ctx){
         const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const gs=GP('食伤'), zg=GP('正官'), gc=GP('财星'), gy=GP('印星');
         const dayMonth=(gs.full.indexOf('日柱')>=0||gs.full.indexOf('月柱')>=0)&&(zg.full.indexOf('日柱')>=0||zg.full.indexOf('月柱')>=0);
         const hasCai=gc.full.length>0, hasYin=gy.full.length>0;
         const parts=[];
         parts.push('伤官克官而官为喜用，恃才犯上、触权惹祸、官非口舌。');
         parts.push(dayMonth
           ? '伤官正官交战于日、月柱，灾患最重、易犯上遭挫惹官非。'
           : '伤官正官分居年时、交争较轻。');
         parts.push((hasCai||hasYin)
           ? (hasCai?'有财通关（伤生财、财生官）、官非可缓。':'有印化伤护身、伤患可解。')
           : '无财印通关，祸最无解，须防官非加身。');
         if(ctx.isMale===false) parts.push('女命伤官克夫星、婚姻恐失和。');
         parts.push('身弱尤畏（以下犯上无力承担），宜收敛锋芒、循礼自守。');
         return parts.join('');
       }});
    P('伤官见官','伤官克官而官为忌神，制官去忌、反得清贵或创新突破。',
      {g:{'伤官':1,'正官':1},xj:{'官杀':'忌'}},
      {career:'伤官克官而官为忌，权威压力被化解、反利创新突破，适合技术、创作等自立之域，身强可驭权。',
       describe(ctx){
         const parts=[];
         parts.push('伤官克官而官为忌神，制官去忌、权威约束反被瓦解。');
         parts.push('适技术、艺术、自媒体等破常规之域，身强制官可驭权、敢挑战旧规自立。');
         return parts.join('');
       }});
    P('伤官伤尽','伤官格而无官星混杂，伤尽反贵、多艺多才而倨。',
  {g:{'伤官':1},none:{'官杀':0}},
  {career:'伤官伤尽而无官星制扰，多艺多才有独立开创之才，宜技术、创作自立门户，才气纵横惟须收敛倨傲，最忌岁运再见官星惹祸。',
   describe(ctx){
     const P=ctx.posCells||[]; const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gs=GP('食伤'); const gc=GP('财星');
     const monthShang=gs.zhi.indexOf('月柱')>=0||gs.gan.indexOf('月柱')>=0;  // 伤官当令得势
     const str=ctx.strength||'中';
     const parts=[];
     parts.push('伤官伤尽而无官星混杂，伤尽反贵、多艺多才而特立。');
     parts.push(monthShang
       ? '伤官当令得势，伤尽之贵、才华尽展，直可专心生财。'
       : '伤官虽透而不当令，伤尽之力稍弱、仍主才艺。');
     parts.push(str==='强'
       ? (gc.full.length?'身旺有财引化、财旺生官辗转有情，名标可期。':'身旺而财欠、应以伤官生财为用。')
       : '身弱则伤官过甚泄身、须防恃才伤气。');
     parts.push('惟恃才傲物、不好驾驭；最忌岁运再见官星则伤官见官、为祸百端。');
     return parts.join('');
   }});
    P('伤官配印','伤官旺而印星化伤生身，敛锋芒、化才为用，主贵。',
  {g:{'伤官':1},cn:{'印星':1},en:{'伤官':'有气','印星':'有气'},xj:{'印星':'喜'}},
  {career:'伤官配印，才华得学养背书收敛成势，出奇创新又守规范，利以专长立身取得位，主贵，宜身弱用印方成。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gs=GP('食伤'), gy=GP('印星');
     const monthShang=gs.gan.indexOf('月柱')>=0||gs.zhi.indexOf('月柱')>=0;  // 伤官月令透
     const yinNear=(gy.gan.indexOf('时柱')>=0||gy.gan.indexOf('月柱')>=0||gy.zhi.indexOf('日柱')>=0); // 印贴身
     const parts=[];
     parts.push('伤官旺而印星化伤生身，敛锋芒、化才为用，主贵。');
     parts.push((monthShang&&yinNear)
       ? '伤官月令透出、印星贴身，配印有力、才华得学养背书而成势。'
       : (monthShang?'伤官月令得势，惜印星不贴身、化伤之力见缓。':'伤官与印隔位，配印稍欠有情。'));
     parts.push('利学术、技术、文职以专长立身取位；最忌财星坏印、伤轻印重则制之太过。');
     return parts.join('');
   }});
    P('食神制杀','食神克制七杀，化杀为权、智勇双全，主武贵。',
  {g:{'食神':1,'七杀':1},en:{'食伤':'有力'},strong:['强','中']},
  {career:'食神制杀，以智慧才艺化解高压竞争、化压力为权柄，利攻坚克难型事业、以柔克刚掌权，须身强方能制杀为权。',
   describe(ctx){
     const ce=ctx.tenE||{}; const shi=(ce['食神']||0); const sha=(ce['七杀']||0);
     const parts=[];
     parts.push('食神克制七杀，化杀为权、智勇双全，主武贵。');
     parts.push(sha > shi*1.2
       ? '杀多食少，制杀之力未足，宜比劫生食以济其制、防杀势反弹。'
       : (shi > sha*1.2
         ? '食多杀少，制杀太过、反以财生杀以滋其气始得中用。'
         : '食杀相当、制化得宜，化压力为权柄最善。'));
     parts.push('利军警、武职、攻坚管理、执法安保之域；最忌偏印夺食（枭克食则功弃杀起）、身弱用食制杀则克泄交加反主官非。');
     return parts.join('');
   }});
    P('食伤泄秀','身强而食伤泄秀，才华外露、聪明显达，主文秀。',{cn:{'食伤':1},strong:['强']},{career:'身强食伤泄秀，才华外露、表达与产品力出众，宜靠专业、表达、创作显达，主文秀之才。'});
    P('食伤泄秀','身弱而食伤过旺泄身，气泄外倾、耗损精气，志大才疏。',{cn:{'食伤':1},strong:['弱'],en:{'食伤':'旺'}},{career:'身弱食伤过度泄身，点子多而执行力不及、志大才疏，宜聚焦单点少发散、借平台补身。'});
    P('枭神夺食','偏印克夺食神（食为喜用），食神为用被夺，财源切断、才思郁结。',
      {g:{'偏印':1,'食神':1},en:{'偏印':'有力'},xj:{'食伤':'喜'}},
      {career:'枭印夺食而食伤为喜用，好产品、好点子被打压、财缘受损、施展受抑，宜寻破局、以财制枭或通比劫泄枭。',
       describe(ctx){
         const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
         const gy=GP('偏印'), gs=GP('食神');
         const sameCol=gy.full.filter(x=>gs.full.indexOf(x)>=0);   // 偏印食神同柱
         const parts=[];
         parts.push('偏印克夺食神而食为喜用，财源切断、才思郁结。');
         parts.push(sameCol.length
           ? ('枭食同柱（' + sameCol.join('、') + '）紧贴相克，灾患最重、夺食之害立见。')
           : '枭食隔柱相克，夺食之力见减、尚可周旋。');
         if(ctx.isMale===false) parts.push('女命食神为子女星，枭夺食主难孕育、与子缘薄。');
         parts.push('性偏沉默多疑、钻牛角尖；化解宜财星制枭、比劫泄枭生食以护食。');
         return parts.join('');
       }});
    P('枭神夺食','偏印克夺食神（食为忌），食神过旺泄身为忌，枭神夺之去忌、反得清敛。',
      {g:{'偏印':1,'食神':1},en:{'偏印':'有力'},xj:{'食伤':'忌'}},
      {career:'枭印夺食而食伤为忌，反去杂思宣泄、宜守成忌张狂，转凶为吉，逢比劫通关更佳。',
       describe(ctx){
         const parts=[];
         parts.push('偏印克夺食神而食为忌，食伤过旺泄身之弊反被枭夺，去忌清敛、转凶为吉。');
         parts.push('收敛过剩欲望、使人踏实，宜守成忌张狂，逢比劫通关泄枭更佳。');
         return parts.join('');
       }});
  })();
  // D 印系
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('印绶生身','印星生身，身弱得生、贵荫扶持、学业有利。',
  {cn:{'印星':1},en:{'印星':'有气'},strong:['弱'],xj:{'印星':'喜'}},
  {career:'印星生身，身弱得依托，靠学历、师承、贵人平台扶持，事业根基稳、利稳扎稳打取位，宜文职、学术、管理以资历立身。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gy=GP('印星'), gc=GP('财星');
     const yinNear=(gy.gan.indexOf('月柱')>=0||gy.gan.indexOf('时柱')>=0||gy.zhi.indexOf('日柱')>=0); // 印贴身日干
     const caiPo=gc.full.length>0;   // 见财破印
     const parts=[];
     parts.push('印星生身，身弱得生、贵荫扶持、学业有利。');
     parts.push(yinNear
       ? '印星贴近日主，长辈贵人之助最得力、学业背书坚实。'
       : '印星隔柱而透，生身之力见减、贵荫稍疏。');
     parts.push(caiPo
       ? '然见财星破印，根脚护持受侵、须防因财损学失荫。'
       : '无财破印之扰，护身安稳。');
     parts.push('宜文职、教育、学术、管理以资历取位，品性仁厚。');
     return parts.join('');
   }});
    P('印多夺食','印星过旺克尽食伤，泄秀无门、才华受压、子息妨。印主思想规范、食伤主才华表达，印旺克食则想法多而难落地、被长辈传统观念过度束缚、行动力弱，才华使不出来、怀才不遇。',
  {cn:{'印星':1,'食伤':1},en:{'印星':'旺'}},
  {career:'印旺克食伤，僵守套路压抑创新，产品、表达被规约框死、施展无门，想法多行动少，宜破格求变、借比劫泄印或财星制印。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gy=GP('印星'), gs=GP('食伤'), gp=GP('偏印');
     const sameCol=gy.full.filter(x=>gs.full.indexOf(x)>=0);   // 印食同柱
     const xiaoTie=gp.full.filter(x=>gs.full.indexOf(x)>=0);   // 偏印(枭)与食同柱夺食尤烈
     const hasJie=GP('比劫').full.length>0;
     const parts=[];
     parts.push('印星过旺克食伤、泄秀无门、才华受压、子息妨。');
     parts.push((sameCol.length||xiaoTie.length)
       ? ('印食同柱（' + (sameCol.join('、')||xiaoTie.join('、')) + '）紧贴相克，才华受压最甚、想法难落地。')
       : '印食隔柱，克伤之力稍缓、尚可周旋。');
     if(xiaoTie.length) parts.push('偏印（枭神）克食尤烈，思维偏执、易钻牛角尖。');
     if(ctx.isMale===false) parts.push('女命食伤为子女星，印旺夺食主子女缘薄或生育难。');
     parts.push((hasJie?'宜比劫帮身泄印生食、或财星制印护食。':'宜财星制印护食、忌再行印运重压。'));
     return parts.join('');
   }});
    P('偏印孤克','偏印为忌而独自当旺，心性孤僻、多学少成、伤亲妨子。',
  {g:{'偏印':1},cn:{'食伤':0},xj:{'印星':'忌'},en:{'印星':'有力'}},
  {career:'偏印旺而忌，钻牛角尖、多学少成，事业易孤军偏行、难落地成事，宜合群收心、聚焦产出，行财运制印可缓。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gp=GP('偏印');
     const nearDay=(gp.gan.indexOf('月柱')>=0||gp.gan.indexOf('时柱')>=0||gp.zhi.indexOf('日柱')>=0); // 枭印贴身
     const year=gp.full.indexOf('年柱')>=0;   // 临年柱
     const parts=[];
     parts.push('偏印为忌而独自当旺，心性孤僻、多疑敏感、多学少成。');
     parts.push(nearDay
       ? '枭印贴近日主，孤僻之性尤显、钻牛角尖、不合群。'
       : '枭印隔柱，孤克之性稍敛。');
     if(year) parts.push('偏印临年柱，伤母缘、早年或与母缘疏离。');
     parts.push('宜合群收心、聚焦产出，行财运制印、食伤旺地可缓其孤。');
     return parts.join('');
   }});
  })();
  // E 比劫系
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('比劫争财','比劫强旺而争财，财星受分夺、易因财起争。',
  {cn:{'比劫':1,'财星':1},en:{'比劫':'旺'},strong:['强'],xj:{'财星':'喜'}},
  {career:'比劫强旺争财，合伙、团队易因分利起争、利润被摊薄，财物难聚，事业宜独掌财权、明算账防被分润，行运喜官杀制劫。',
   describe(ctx){
     const GP=ctx.godPos||function(){return{gan:[],zhi:[],full:[]};};
     const gb=GP('比劫'), gc=GP('财星');
     const idx={'年柱':0,'月柱':1,'日柱':2,'时柱':3};
     const caiGan=gc.gan.length>0;                // 财透天干
     const jieTou=gc.gan.filter(g=>gb.gan.indexOf(g)>=0).length>0      // 财比同透
       || gc.full.filter(f=>gb.full.indexOf(f)>=0).length>0;             // 财比同柱
     const parts=[];
     parts.push('比劫强旺而争财，财星受分夺、易因财起争。');
     parts.push(jieTou
       ? '比劫与财贴邻或同柱，分夺之势最著、合伙分红各执一词。'
       : '比劫分耗财星，财物虚耗、经济观念不强、难聚难守。');
     if(caiGan) parts.push('财透天干、暗露于众，更易招同辈觊觎争利。');
     if(ctx.isMale) parts.push('男命财为妻星，比劫争财主克妻或妻缘受同辈所扰。');
     parts.push('宜独掌财权、财星藏库守财，行运须官杀制比劫方福。');
     return parts.join('');
   }});
  })();

  // ， 方向归属（cats）批量设定：断语属哪些方向（事业/婚姻/健康/家庭），四卡按 dirs 过滤，不符不强解 ，
  // 同名各分支方向一致；六亲/性别差异的条目在下方单独补 need.sex。
  (function(){ const D=REL.tenCombo.DATAS, SET={
      /* 方向标注逐条审定：每个断语的 cats 必须与 bazi-shishen 注入的定向句方向一致，
         否则健康/家庭模块不显示对应的定向句。素材依据《十神断命》系列 + 命理古籍。 */
      '官印相生':['career','marry','health','family'], '杀印相生':['career','marry','health','family'],
      '官印双全':['career','marry'], '官杀混杂':['career','marry','health'],
      '官星遇劫':['career','marry'], '官杀克身':['career','marry','health','family'],
      '财旺生官':['career','marry','family'],
      '杀旺身强':['career'], '食神生财':['career','family','health'], '伤官生财':['career','health'],
      '比劫夺财':['career','family','marry'],
      '比劫帮身':['career','family'], '身财两停':['career'], '身旺财旺':['career','family'],
      '身弱财多':['career'], '贪财坏印':['career','family','health'],
      '伤官见官':['career','marry','health'], '伤官伤尽':['career','marry'], '伤官配印':['career'],
      '食神制杀':['career','family'],
      '食伤泄秀':['career','health','marry'], '枭神夺食':['career','health','family','marry'],
      '印绶生身':['career'],
      '印多夺食':['health','family','career'], '偏印孤克':['career','health','family'], '比劫争财':['career','family']
    };
    D.forEach(it=>{ const c=SET[it.name]; if(c){ it.cats=c; it.w=3; } });
  })();

  // ， 十神经典断语：依据《十神断命》素材整理，判定式、去古籍出处 ，
  // 原则：只增不删、不覆盖现有同名组合；条件只用 cn/g/xj/en/strong/sex/pos/nopos/zhi/nofzhi 可靠判定，
  //       依赖刑冲合害等 ctx 暂不提供的条目宁缺毋滥，不产出误判断语。
  // ============ 事业财运（career） ============
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('正官清贵','正官为喜用而清透有力，主官运亨通、事业稳定，宜公职、管理岗位，循正途升阶得位。',
      {g:{'正官':1},xj:{'官杀':'喜'},en:{'官杀':'有力'},pos:{'官杀':['年干','月干','时干']}},
      {career:'正官清透为喜用，官运亨通、事业稳定，宜体制内公职管理，以正统路径取位、得贵人背书。',
       describe(ctx){ const P=ctx.posCells||[]; const mc=P.find(c=>c.lbl==='月柱')||{}; const gg=P.find(c=>c.tg&&({正官:1}[c.tg])); const gc=P.find(c=>c.tz&&({正官:1}[c.tz])); const parts=[];
         parts.push('正官为喜用而清透，主官运亨通、事业稳定。');
         parts.push((mc.tz&&({正官:1}[mc.tz]))||(mc.tg&&({正官:1}[mc.tg])) ? '正官临月令得位，仕途根基最稳、职级可期。' : '正官不居月令，官星稍弱，宜借岁运扶官方显。');
         parts.push('官星有财生扶、印星卫护则贵气更足；忌伤官克官、比劫夺官，犯之则官非职损。');
         return parts.join('');
       }});
    P('身弱财官压身','身弱而财官两旺压身，财利与责任皆成重负，易身心俱疲、志大才疏，宜先扶身（印比）再论求取，忌急进贪大。',
      {strong:['弱'],en:{'财星':'旺','官杀':'有力'},cn:{'财星':1,'官杀':1}},
      {career:'身弱财官两旺，责任压力与财利贪求并存，力不胜任、易因财生祸，宜量力而行、扶身制压，忌贪大冒进。'});
    P('财透比劫难聚','财星透干而比劫在侧，财露招争、难以积蓄，宜财星藏库、守财防分，行运喜官杀制劫护财。',
      {pos:{'财星':['年干','月干','时干']},xj:{'财星':'喜'},cn:{'比劫':1}},
      {career:'财星透干、暗露于众而比劫争之，财难聚、易被同辈分夺，宜藏财守库，行运喜官杀制劫。'});
    P('财星入库待冲','财星坐库（辰戌丑未），财藏有库、待冲乃发；不逢冲刑则库门常闭、财不易显，逢岁运冲开方有大财。',
      {zhi:{'财星':'辰戌丑未'},xj:{'财星':'喜'},strong:['强','中']},
      {career:'财星坐墓库，财藏于库、非冲不发；库门得冲方开、财源乃显，宜待岁运冲库之机，勿强求急取。'});
    P('无食伤财孤','无食伤生财，财星无源、财路单一，富难大增，宜惜财守成，行运见食伤方开财源。',
      {cn:{'财星':1},none:{'食伤':0}},
      {career:'命局无食伤，财星乏生扶之源、财路单一，增长有限，宜守成积累，行运逢食伤始开财源。'});
    P('官财俱缺淡名利','官财俱不现，对名利多淡泊，宜走清修、艺术、非主流路线，不逐名利之场。',
      {none:{'官杀':0},none:{'财星':0}},
      {career:'官星与财星俱不现，名利之心淡泊，不宜强逐仕途商场，宜清修、艺术、专技之途立身。'});
    t.forEach(x=>{ if(['正官清贵','身弱财官压身','财透比劫难聚','财星入库待冲','无食伤财孤','官财俱缺淡名利'].indexOf(x.name)>=0){ const dirs=['career','marry','health','family'].filter(d=>x[d]); if(dirs.length){ x.cats=dirs; x.w=2; } } });
  })();

  // ============ 婚姻感情（marry） ============
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('日坐正财妻贤','男命日支坐正财为喜用，妻贤慧持家、得妻内助，因妻而发、夫妻和顺。',
      {sex:'男',pos:{'正财':'日支'},xj:{'财星':'喜'}},
      {marry:'男命日支正财为喜用，妻宫得位、妻贤慧内助，因妻得财、夫妻和顺、家道渐兴。'});
    P('日坐比劫克妻','男命日支坐比劫，比劫克财（妻星）、主克妻或婚迟再娶、夫妻多口角，宜防同辈分夺。',
      {sex:'男',pos:{'比劫':'日支'}},
      {marry:'男命日支坐比劫，比劫夺财克妻、婚迟或再娶、夫妻常口角，宜防同辈介入分妻财。'});
    P('日坐伤官克夫','女命日支坐伤官，伤官克官（夫星）、主克夫或婚姻不顺、多口舌，宜以印化伤、以财通关。',
      {sex:'女',pos:{'伤官':'日支'}},
      {marry:'女命日支坐伤官，伤官克夫星、主克夫或婚变、多口舌争执，宜印化伤、财通关以解。'});
    P('日坐七杀夫刚','女命日支坐七杀，夫星得位、配偶性刚烈；身旺夫可任权贵，身弱则易受夫管束、婚姻多压。',
      {sex:'女',pos:{'七杀':'日支'}},
      {marry:'女命日支坐七杀，夫星得位、配偶性刚烈，身旺夫贵可任，身弱则受夫制、婚姻承压。'});
    P('比劫重重争夫','女命比劫重重而旺，比劫夺财断官源、主争夫、夫妻不睦、多感情风波，宜防同辈介入。',
      {sex:'女',en:{'比劫':'旺'},strong:['强','中']},
      {marry:'女命比劫重重而旺，夺财断官源、主争夫、夫妻不睦、多情纠葛，宜防同辈姊妹介入。'});
    P('财多身弱怕妻','男命身弱财多，妻星旺而身不胜财、主怕妻、妻掌家权，宜扶身（印比）以制财，否则为财所累。',
      {sex:'男',strong:['弱'],en:{'财星':'旺'}},
      {marry:'男命身弱财多，妻星旺而身不胜、主怕妻、妻掌家权，宜扶身制财，否则反为财妻所累。'});
    P('无官夫缘淡','女命四柱无官杀（夫星），夫星不现、异性缘薄、婚姻易晚或淡，宜待岁运引官方见夫缘。',
      {sex:'女',none:{'官杀':0}},
      {marry:'女命无官杀，夫星不现、异性缘薄、婚姻偏晚或淡，宜待岁运引官星透出方见夫缘。'});
    P('正财一位情笃','男命正财一位为喜用，财星专一、妻缘纯正，夫妻感情笃、婚姻美满，得妻之力。',
      {sex:'男',g:{'正财':1},xj:{'财星':'喜'}},
      {marry:'男命正财一位为喜用，财星专一、妻缘纯正，夫妻情笃、婚姻美满，得妻之力家道安。'});
    t.forEach(x=>{ if(['日坐正财妻贤','日坐比劫克妻','日坐伤官克夫','日坐七杀夫刚','比劫重重争夫','财多身弱怕妻','无官夫缘淡','正财一位情笃'].indexOf(x.name)>=0){ const dirs=['career','marry','health','family'].filter(d=>x[d]); if(dirs.length){ x.cats=dirs; x.w=2; } } });
  })();

  // ============ 性格健康（health） ============
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('印重食弱智迟','印星过旺而食伤弱，思虑多而智慧晚开、领悟力钝，宜泄印生食伤、开阔思路。',
      {en:{'印星':'旺'},en:{'食伤':'弱'}},
      {health:'印星过旺食伤弱，思虑郁结、智慧晚开、领悟力钝，宜开泄思路、多实践养食伤。'});
    P('伤官见官心肺疾','伤官见官、心火克肺金，主心火亢盛、心肺之疾、情志焦躁，宜印化伤或财通关。',
      {cn:{'伤官':1,'正官':1}},
      {health:'伤官见官，心火克肺金，主心火亢盛、心肺炎症、情绪躁动，宜印化伤、财通关以和。'});
    P('比劫过旺肝胆疾','比劫过旺，肝胆（同我之脏）气盛、易急躁动怒、肝血之疾、血光外伤，宜泄比劫（食伤）或制劫（官杀）。',
      {en:{'比劫':'旺'},strong:['强','中']},
      {health:'比劫过旺，肝胆气盛、易怒伤肝、血光外伤，宜以食伤泄秀、官杀制劫，勿恃强妄动。'});
    P('财多身弱脾胃劳','财多身弱，所克之财反耗其身、脾胃（所克之脏）受病、劳碌积劳成疾，宜扶身制财、节劳养脾。',
      {strong:['弱'],en:{'财星':'旺'}},
      {health:'财多身弱，脾胃（所克之脏）受财耗、劳碌积劳成疾，宜扶身制财、节劳养脾、以和为贵。'});
    P('官杀攻身压力病','身弱官杀过旺攻身，压力繁重、血压外伤、官杀为忌多病灾，宜印化官杀、扶身以承。',
      {strong:['弱'],en:{'官杀':'旺'}},
      {health:'身弱官杀过旺攻身，压力重、血压外伤之疾，宜印化官杀生身、以柔承刚、慎于险。'});
    P('食伤过旺泄身','食伤过旺而身弱，泄身太过、精气外倾、日主虚弱、脾胃运化差，宜印比生身扶元。',
      {en:{'食伤':'旺'},strong:['弱']},
      {health:'食伤过旺而身弱，泄身太过、精气外倾、脾胃运化弱，宜印比生扶、固本培元。'});
    t.forEach(x=>{ if(['印重食弱智迟','伤官见官心肺疾','比劫过旺肝胆疾','财多身弱脾胃劳','官杀攻身压力病','食伤过旺泄身'].indexOf(x.name)>=0){ const dirs=['career','marry','health','family'].filter(d=>x[d]); if(dirs.length){ x.cats=dirs; x.w=2; } } });
  })();

  // ============ 家庭子女（family） ============
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('时柱财旺晚富','时柱财星旺而为喜用，子女宫坐财、晚年富足、子女富贵，晚景有靠。',
      {pos:{'财星':'时柱'},xj:{'财星':'喜'}},
      {family:'时柱财星为喜用，子女宫坐财、晚年富足、子女富贵，晚景安稳有靠。'});
    P('时干正印子孝','时干正印为喜用，印星荫育、子嗣贤孝、多生贵子，享子孙之福、晚运和顺。',
      {pos:{'正印':'时干'},xj:{'印星':'喜'}},
      {family:'时干正印为喜用，印星荫育、子嗣贤孝、多生贵子，享子孙之福、晚运和顺。'});
    P('时柱七杀子旺','男命时柱七杀而身强可任，子女宫坐杀、主子多且有力；身弱则子女少而负担重、宜以印化杀。',
      {sex:'男',pos:{'七杀':'时柱'},strong:['强']},
      {family:'男命时柱七杀而身强可任，主子多且有力；若身弱则子女少、宜印化杀以育。'});
    P('年柱比肩破祖','年柱坐比肩，比劫克财断祖产、破祖业、家境多贫、兄弟多而难承祖业，宜自手起家。',
      {pos:{'比肩':'年柱'}},
      {family:'年柱坐比肩，比劫克财破祖业、家境多贫、兄弟多而难承祖产，宜自立奋斗、白手兴家。'});
    P('时支伤官克子','时支坐伤官，伤官为子女星之忌神、主克子或子女凶顽有灾，尤女命更重，宜以印化伤护子。',
      {pos:{'伤官':'时支'}},
      {family:'时支坐伤官，伤官克子、主子女凶顽或子息有灾，女命尤忌，宜以印化伤、以财通关护子。'});
    P('印重妨子','印星过重而身旺，印泄官杀（男命子女星）或克食伤（女命子女星）、子息受损，宜财制印护子。',
      {en:{'印星':'旺'},strong:['强']},
      {family:'印星过重而身旺，化泄子女星或克食伤、子息受损，宜财星制印以护子女。'});
    P('时柱食神子孝','时柱食神为喜用，食神为子女星得位、主有子女且孝顺，食神生旺则长寿子孝、晚年有靠。',
      {pos:{'食神':'时柱'},xj:{'食伤':'喜'}},
      {family:'时柱食神为喜用，子女星得位、主有子且孝，食神生旺则子孝长寿、晚年有靠。'});
    P('女命无食伤子薄','女命四柱无食伤（子女星），子女星不现、子息缘薄，宜待岁运引食伤方见子缘。',
      {sex:'女',none:{'食伤':0}},
      {family:'女命无食伤，子女星不现、子息缘薄，宜待岁运引食伤透出方见子缘。'});
    t.forEach(x=>{ if(['时柱财旺晚富','时干正印子孝','时柱七杀子旺','年柱比肩破祖','时支伤官克子','印重妨子','时柱食神子孝','女命无食伤子薄'].indexOf(x.name)>=0){ const dirs=['career','marry','health','family'].filter(d=>x[d]); if(dirs.length){ x.cats=dirs; x.w=2; } } });
  })();

  // 四模块十神经典断语扩充（素材整理，判定式，专业核验），
  // 原则：只增不删、不覆盖现有同名组合；条件只用 cn/g/xj/en/strong/pos/nopos/zhi/nofzhi/sex 可靠判定。
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    // ============ 事业财运（career） ============
    P('官星坐月得位','官星临月令得位，事业根基稳、宜体制正途发展，职级可期。',
      {pos:{'官杀':'月柱'},xj:{'官杀':'喜'}},
      {career:'官星临月令得位，事业根基稳、宜体制正途发展，职级可期。',cats:['career']});
    P('财星得令主富','财星临月令得令，求财得势、财运根基稳，主富。',
      {pos:{'财星':'月柱'},xj:{'财星':'喜'}},
      {career:'财星临月令得令，求财得势、财运根基稳，主富。',cats:['career']});
    P('财官印三奇','财官印三奇俱全而身旺，财养官、官生印、印护身，富贵双全、事业根基深厚。',
      {cn:{'财星':1,'官杀':1,'印星':1},strong:['强']},
      {career:'财官印三奇俱全而身旺，财养官、官生印、印护身，富贵双全、事业根基深厚。',cats:['career']});
    P('食伤生财再生官','食伤生财、财再生官，才华创富、富而求贵，事业成就层次高，利经营而后掌权。',
      {cn:{'食伤':1,'财星':1,'官杀':1},strong:['强']},
      {career:'食伤生财、财再生官，才华创富、富而求贵，事业成就层次高，利经营而后掌权。',cats:['career']});
    P('偏财喜用善投资','偏财为喜用而身强可任，利投资副业、经营灵活取财，善于把握机遇得意外之财。',
      {g:{'偏财':1},xj:{'财星':'喜'},strong:['强']},
      {career:'偏财为喜用而身强可任，利投资副业、经营灵活取财，善于把握机遇得意外之财。',cats:['career']});
    P('身弱食伤财虚怀才不遇','食伤旺而身弱财虚，才华难变现、想法多落不到实处，宜先补身养财再图发展。',
      {en:{'食伤':'旺'},strong:['弱'],en:{'财星':'虚'}},
      {career:'食伤旺而身弱财虚，才华难变现、想法多落不到实处，宜先补身养财再图发展。',cats:['career']});
    P('印重身旺清高贫寒','印重身旺而财官不现，主清高自守、淡泊名利，事业多守成少进取，宜务实营谋、主动求财。',
      {en:{'印星':'旺'},strong:['强'],none:{'财星':0},none:{'官杀':0}},
      {career:'印重身旺而财官不现，主清高自守、淡泊名利，事业多守成少进取，宜务实营谋、主动求财。',cats:['career']});
    P('比肩为喜宜合伙','比肩为喜用而旺，合伙、团队协作得利，宜与同辈共事、靠人脉网络成事。',
      {en:{'比劫':'旺'},xj:{'比劫':'喜'}},
      {career:'比肩为喜用而旺，合伙、团队协作得利，宜与同辈共事、靠人脉网络成事。',cats:['career']});
    P('比肩为忌多争','比肩为忌而旺，多争多夺、合伙易生分利纠纷，宜独立经营、少与同辈共财。',
      {en:{'比劫':'旺'},xj:{'比劫':'忌'}},
      {career:'比肩为忌而旺，多争多夺、合伙易生分利纠纷，宜独立经营、少与同辈共财。',cats:['career']});
    P('劫财旺防投机','劫财旺，财易被分夺破耗，不宜投机合伙，宜独立经营、稳健理财防损。',
      {en:{'劫财':'旺'}},
      {career:'劫财旺，财易被分夺破耗，不宜投机合伙，宜独立经营、稳健理财防损。',cats:['career']});
    // ============ 婚姻感情（marry） ============
    P('女日坐正官夫星得位','女命日支坐正官，夫星得位、夫缘亲近，配偶端正负责、婚姻有依。',
      {sex:'女',pos:{'正官':'日支'}},
      {marry:'女命日支坐正官，夫星得位、夫缘亲近，配偶端正负责、婚姻有依。',cats:['marry']});
    P('女官星一位专一','女命官星一位，夫星专一、感情笃定，多主婚姻专一长久。',
      {sex:'女',cn:{'官杀':'==1'}},
      {marry:'女命官星一位，夫星专一、感情笃定，多主婚姻专一长久。',cats:['marry']});
    P('男财星入墓妻劳','男命财星坐墓库，妻缘隐而不显、配偶易多劳，宜关爱呵护、库逢冲开方见助力。',
      {sex:'男',zhi:{'财星':'辰戌丑未'}},
      {marry:'男命财星坐墓库，妻缘隐而不显、配偶易多劳，宜关爱呵护、库逢冲开方见助力。',cats:['marry']});
    P('女官星入墓夫隐','女命官星坐墓库，夫缘隐伏、配偶健康或事业易有起伏，宜以印化官、迟婚为安。',
      {sex:'女',zhi:{'官杀':'辰戌丑未'}},
      {marry:'女命官星坐墓库，夫缘隐伏、配偶健康或事业易有起伏，宜以印化官、迟婚为安。',cats:['marry']});
    P('男比劫重重婚波折','男命比劫重重而旺，财星（妻星）受分夺，婚缘多波折、易迟婚或感情反复，宜专一经营。',
      {sex:'男',cn:{'比劫':3}},
      {marry:'男命比劫重重而旺，财星（妻星）受分夺，婚缘多波折、易迟婚或感情反复，宜专一经营。',cats:['marry']});
    P('男身旺无食伤妻缘薄','男命身旺而无食伤，财星（妻星）乏原神生扶、妻缘助力有限，宜主动经营夫妻关系。',
      {sex:'男',strong:['强'],none:{'食伤':0}},
      {marry:'男命身旺而无食伤，财星（妻星）乏原神生扶、妻缘助力有限，宜主动经营夫妻关系。',cats:['marry']});
    P('女日支比劫夫星受夺','女命日支坐比劫，夫宫被同辈之气占据，婚缘多竞争、夫妻易生口角，宜以印化劫、包容相处。',
      {sex:'女',pos:{'比劫':'日支'}},
      {marry:'女命日支坐比劫，夫宫被同辈之气占据，婚缘多竞争、夫妻易生口角，宜以印化劫、包容相处。',cats:['marry']});
    P('女身弱官杀旺夫主事','女命身弱而官杀旺，夫强己弱、家中多由配偶主事，宜以印化官杀、守柔相处。',
      {sex:'女',strong:['弱'],en:{'官杀':'旺'}},
      {marry:'女命身弱而官杀旺，夫强己弱、家中多由配偶主事，宜以印化官杀、守柔相处。',cats:['marry']});
    P('女伤官旺无印克性外露','女命伤官旺而无印星制化，个性独立好胜、婚恋易挑剔多磨，宜以财通关、柔化锋芒。',
      {sex:'女',en:{'食伤':'旺'},none:{'印星':0}},
      {marry:'女命伤官旺而无印星制化，个性独立好胜、婚恋易挑剔多磨，宜以财通关、柔化锋芒。',cats:['marry']});
    P('男日支食神妻贤','男命日支坐食神为喜用，妻宫得吉神、妻贤慧持家、夫妻和顺。',
      {sex:'男',pos:{'食神':'日支'},xj:{'食伤':'喜'}},
      {marry:'男命日支坐食神为喜用，妻宫得吉神、妻贤慧持家、夫妻和顺。',cats:['marry']});
    P('男日支正印妻贤','男命日支坐正印，妻宫得印荫、配偶贤惠仁厚，得内助之力。',
      {sex:'男',pos:{'正印':'日支'}},
      {marry:'男命日支坐正印，妻宫得印荫、配偶贤惠仁厚，得内助之力。',cats:['marry']});
    P('女日支印星夫如父','女命日支坐印星，夫宫得印、配偶体贴顾家如长辈照拂，婚姻安稳。',
      {sex:'女',pos:{'印星':'日支'}},
      {marry:'女命日支坐印星，夫宫得印、配偶体贴顾家如长辈照拂，婚姻安稳。',cats:['marry']});
    P('女财官印三宝旺夫','女命财官印三宝俱现而官杀清透一位，财生官、官生印、印护身，旺夫益子、婚姻荣显。',
      {sex:'女',cn:{'财星':1,'官杀':'==1','印星':1}},
      {marry:'女命财官印三宝俱现而官杀清透一位，财生官、官生印、印护身，旺夫益子、婚姻荣显。',cats:['marry']});
    P('男偏财多异性缘广','男命偏财多现，异性缘广而心易旁骛，宜专一持正、慎防感情纠纷。',
      {sex:'男',g:{'偏财':2}},
      {marry:'男命偏财多现，异性缘广而心易旁骛，宜专一持正、慎防感情纠纷。',cats:['marry']});
    // ============ 性格健康（health） ============
    P('正官为喜守正','正官为喜用，心性正直负责、循规守纪、重名誉，宜公职管理之途。',
      {g:{'正官':1},xj:{'官杀':'喜'}},
      {health:'正官为喜用，心性正直负责、循规守纪、重名誉，宜公职管理之途。',cats:['health']});
    P('官杀过旺拘谨','官杀过旺而为忌，压力拘束感重、易犹豫少主见，宜以印化杀、舒展心性。',
      {en:{'官杀':'旺'},xj:{'官杀':'忌'}},
      {health:'官杀过旺而为忌，压力拘束感重、易犹豫少主见，宜以印化杀、舒展心性。',cats:['health']});
    P('七杀为喜坚毅','七杀为喜用，心性坚毅果决、敢作敢为、临危不乱，宜攻坚开拓之途。',
      {g:{'七杀':1},xj:{'官杀':'喜'}},
      {health:'七杀为喜用，心性坚毅果决、敢作敢为、临危不乱，宜攻坚开拓之途。',cats:['health']});
    P('七杀为忌无制易极端','七杀为忌而旺且无食伤制化，性情偏急、易走极端、行事冲动，宜印化杀、食神制杀以缓。',
      {g:{'七杀':1},xj:{'官杀':'忌'},none:{'食伤':0}},
      {health:'七杀为忌而旺且无食伤制化，性情偏急、易走极端、行事冲动，宜印化杀、食神制杀以缓。',cats:['health']});
    P('正印为喜仁慈','正印为喜用，心性仁慈聪慧、重情重学、待人宽厚，宜文教学术之途。',
      {g:{'正印':1},xj:{'印星':'喜'}},
      {health:'正印为喜用，心性仁慈聪慧、重情重学、待人宽厚，宜文教学术之途。',cats:['health']});
    P('印旺身强思虑重','印星旺而身强，心思细密、思虑偏多、易想多做少，宜以食伤泄秀、多实践落地。',
      {en:{'印星':'旺'},strong:['强']},
      {health:'印星旺而身强，心思细密、思虑偏多、易想多做少，宜以食伤泄秀、多实践落地。',cats:['health']});
    P('食神为喜宽厚','食神为喜用而旺，心性宽厚随和、乐天知命、有口福，宜技艺文教之途。',
      {g:{'食神':1},en:{'食伤':'旺'},xj:{'食伤':'喜'}},
      {health:'食神为喜用而旺，心性宽厚随和、乐天知命、有口福，宜技艺文教之途。',cats:['health']});
    P('伤官为喜才华','伤官为喜用而旺，聪明外露、才华横溢、表达力强，宜创意技术之途。',
      {g:{'伤官':1},en:{'食伤':'旺'},xj:{'食伤':'喜'}},
      {health:'伤官为喜用而旺，聪明外露、才华横溢、表达力强，宜创意技术之途。',cats:['health']});
    P('伤官为忌言伤','伤官过旺而为忌，锋芒外露、言语易伤人、不服管束，宜印化伤、收敛自省。',
      {g:{'伤官':1},en:{'食伤':'旺'},xj:{'食伤':'忌'}},
      {health:'伤官过旺而为忌，锋芒外露、言语易伤人、不服管束，宜印化伤、收敛自省。',cats:['health']});
    P('比肩为喜独立','比肩为喜用，心性刚毅独立、有主见、讲义气，宜自立创业之途。',
      {g:{'比肩':1},xj:{'比劫':'喜'}},
      {health:'比肩为喜用，心性刚毅独立、有主见、讲义气，宜自立创业之途。',cats:['health']});
    P('比肩多印自我本位','比肩多有印而身强，自我意识强、独立有主见、不轻易妥协，宜以食伤泄秀、多听多纳。',
      {g:{'比肩':1},en:{'印星':'有力'},strong:['强']},
      {health:'比肩多有印而身强，自我意识强、独立有主见、不轻易妥协，宜以食伤泄秀、多听多纳。',cats:['health']});
    P('身旺比劫旺无官放任','身旺比劫旺而无官杀制衡，精力过剩、约束感弱、行事易随性，宜食伤泄秀、自律定向。',
      {strong:['强'],en:{'比劫':'旺'},none:{'官杀':0}},
      {health:'身旺比劫旺而无官杀制衡，精力过剩、约束感弱、行事易随性，宜食伤泄秀、自律定向。',cats:['health']});
    P('正财为喜务实','正财为喜用，心性勤俭务实、重信用、量入为出，宜实业正途之财。',
      {g:{'正财':1},xj:{'财星':'喜'}},
      {health:'正财为喜用，心性勤俭务实、重信用、量入为出，宜实业正途之财。',cats:['health']});
    P('偏财为喜豪爽','偏财为喜用，心性慷慨豪爽、手腕灵活、人缘广，宜经营投资之途。',
      {g:{'偏财':1},xj:{'财星':'喜'}},
      {health:'偏财为喜用，心性慷慨豪爽、手腕灵活、人缘广，宜经营投资之途。',cats:['health']});
    P('财星忌旺贪吝','财星过旺而为忌，重利易患得患失、吝于付出，宜以印星化财、放宽心量。',
      {en:{'财星':'旺'},xj:{'财星':'忌'}},
      {health:'财星过旺而为忌，重利易患得患失、吝于付出，宜以印星化财、放宽心量。',cats:['health']});
    P('正印护身根基稳','正印为喜用且官杀得印化泄，压力有托、身心得养，健康根基较稳。',
      {g:{'正印':1},xj:{'印星':'喜'},cn:{'官杀':1}},
      {health:'正印为喜用且官杀得印化泄，压力有托、身心得养，健康根基较稳。',cats:['health']});
    P('劫财忌旺血光','劫财旺而为忌，血气偏旺、易冲动致外伤血光，宜节欲养肝、戒急戒怒。',
      {en:{'劫财':'旺'},xj:{'比劫':'忌'}},
      {health:'劫财旺而为忌，血气偏旺、易冲动致外伤血光，宜节欲养肝、戒急戒怒。',cats:['health']});
    // ============ 家庭子女（family） ============
    P('男官杀旺身强子多','男命官杀旺而身强可任，子女星有力、子女多而有出息。',
      {sex:'男',en:{'官杀':'旺'},strong:['强']},
      {family:'男命官杀旺而身强可任，子女星有力、子女多而有出息。',cats:['family']});
    P('男官杀旺身弱子累','男命官杀旺而身弱，子女缘旺而负担重、易为子女操劳，宜以印化杀、量力育养。',
      {sex:'男',en:{'官杀':'旺'},strong:['弱']},
      {family:'男命官杀旺而身弱，子女缘旺而负担重、易为子女操劳，宜以印化杀、量力育养。',cats:['family']});
    P('时支劫财子女耗','时支坐劫财，子女宫逢劫耗、子女开销大或帮扶有限，宜早立家规、引导理财。',
      {pos:{'劫财':'时支'}},
      {family:'时支坐劫财，子女宫逢劫耗、子女开销大或帮扶有限，宜早立家规、引导理财。',cats:['family']});
    P('时干伤官子息薄','时干透伤官，子女星坐宫受伤、子息缘薄或子女个性强，宜以印化伤、以财通关。',
      {pos:{'伤官':'时干'}},
      {family:'时干透伤官，子女星坐宫受伤、子息缘薄或子女个性强，宜以印化伤、以财通关。',cats:['family']});
    P('年柱劫财破祖','年柱坐劫财，祖业难承、早年多劳、自立门户之象，宜白手起家。',
      {pos:{'劫财':'年柱'}},
      {family:'年柱坐劫财，祖业难承、早年多劳、自立门户之象，宜白手起家。',cats:['family']});
    P('时柱比劫晚景耗','时柱坐比劫，子女宫逢比劫、晚年积蓄易耗或子女帮扶有限，宜早作养老规划。',
      {pos:{'比劫':'时柱'}},
      {family:'时柱坐比劫，子女宫逢比劫、晚年积蓄易耗或子女帮扶有限，宜早作养老规划。',cats:['family']});
    P('女食伤旺身弱子劳','女命食伤旺而身弱，子女缘旺而操劳、生育耗身，宜以印比扶身、量力育养。',
      {sex:'女',en:{'食伤':'旺'},strong:['弱']},
      {family:'女命食伤旺而身弱，子女缘旺而操劳、生育耗身，宜以印比扶身、量力育养。',cats:['family']});
    P('时柱正官子贤','时柱正官为喜用，子女宫得官、子女贤孝有成、晚年安稳。',
      {pos:{'正官':'时柱'},xj:{'官杀':'喜'}},
      {family:'时柱正官为喜用，子女宫得官、子女贤孝有成、晚年安稳。',cats:['family']});
  })();

  // ， 依赖刑冲害合/羊刃的十神经典断语（需 buildCtx 提供 relPos/yangRen），
  // 条件使用 relChong/relXing/relHai/relHe/relSanXing/relSelfXing/relChongPair/yangren 新键
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    // ============ 事业财运 ============
    P('羊刃驾杀','身强带羊刃、七杀有力，杀刃相济、刚毅果决，宜军警武职、攻坚管理、竞争性事业，须身强能任、防刃旺伤身。',
      {g:{'七杀':1},strong:['强'],yangren:true},
      {career:'身强带羊刃、七杀有力，杀刃相济、刚毅果决，宜军警武职、攻坚管理、竞争性事业，须身强能任、防刃旺伤身。',cats:['career','health']});
    P('月支逢冲事业动','月支（事业根基宫）逢冲，事业环境多变动、职场易更替，宜稳中求进、以专技立身，行运逢冲之年慎大动作。',
      {relChong:'月支'},
      {career:'月支（事业根基宫）逢冲，事业环境多变动、职场易更替，宜稳中求进、以专技立身，行运逢冲之年慎大动作。',cats:['career']});
    P('财库逢冲','财星坐库而原局地支有冲，库门逢动、财机显隐交半；财库之财喜冲则发，宜把握岁运冲库之机，然先破后立、勿急于求成。',
      {zhi:{'财星':'辰戌丑未'},relChong:'any'},
      {career:'财星坐库而原局地支有冲，库门逢动、财机显隐交半；财库之财喜冲则发，宜把握岁运冲库之机，然先破后立、勿急于求成。',cats:['career']});
    // ============ 婚姻感情 ============
    P('男妻宫逢冲','男命妻宫（日支）逢冲，婚姻根基易波动、夫妻多口角或聚少离多，宜多沟通、遇事缓处，防婚变。',
      {sex:'男',relChong:'日支'},
      {marry:'男命妻宫（日支）逢冲，婚姻根基易波动、夫妻多口角或聚少离多，宜多沟通、遇事缓处，防婚变。',cats:['marry']});
    P('女夫宫逢冲','女命夫宫（日支）逢冲，婚缘多波折、夫妻易有分离之象，宜晚婚、多经营包容，忌冲动决断。',
      {sex:'女',relChong:'日支'},
      {marry:'女命夫宫（日支）逢冲，婚缘多波折、夫妻易有分离之象，宜晚婚、多经营包容，忌冲动决断。',cats:['marry']});
    P('男妻宫逢刑','男命妻宫（日支）带刑，夫妻易有口舌争执、感情暗耗，宜多体谅、以柔化刚。',
      {sex:'男',relXing:'日支'},
      {marry:'男命妻宫（日支）带刑，夫妻易有口舌争执、感情暗耗，宜多体谅、以柔化刚。',cats:['marry']});
    P('女夫宫逢刑','女命夫宫（日支）带刑，婚姻多内耗、言语易伤情，宜多包容、以印化杀缓其刑。',
      {sex:'女',relXing:'日支'},
      {marry:'女命夫宫（日支）带刑，婚姻多内耗、言语易伤情，宜多包容、以印化杀缓其刑。',cats:['marry']});
    P('男妻宫逢合','男命妻宫（日支）逢合，婚缘易受外缘牵动，宜专一守正、防感情游移。',
      {sex:'男',relHe:'日支'},
      {marry:'男命妻宫（日支）逢合，婚缘易受外缘牵动，宜专一守正、防感情游移。',cats:['marry']});
    P('女夫宫逢合','女命夫宫（日支）逢合，婚缘亲近而外缘亦多牵动，宜专一守正、坦诚相处。',
      {sex:'女',relHe:'日支'},
      {marry:'女命夫宫（日支）逢合，婚缘亲近而外缘亦多牵动，宜专一守正、坦诚相处。',cats:['marry']});
    P('夫妻宫逢害','夫妻宫（日支）逢害，表面和睦、暗中易生隔阂，宜坦诚沟通、防外人挑拨。',
      {relHai:'日支'},
      {marry:'夫妻宫（日支）逢害，表面和睦、暗中易生隔阂，宜坦诚沟通、防外人挑拨。',cats:['marry']});
    // ============ 性格健康 ============
    P('三刑偏执','命带三刑（寅巳申、丑戌未），性格偏执、行事易走极端、多内耗，宜以印化、以德自持、广结善缘。',
      {relSanXing:'any'},
      {health:'命带三刑（寅巳申、丑戌未），性格偏执、行事易走极端、多内耗，宜以印化、以德自持、广结善缘。',cats:['health']});
    P('自刑内耗','命带自刑（辰午酉亥重见），自我内耗、易思虑过度、作茧自缚，宜放宽心态、多向外疏解。',
      {relSelfXing:'any'},
      {health:'命带自刑（辰午酉亥重见），自我内耗、易思虑过度、作茧自缚，宜放宽心态、多向外疏解。',cats:['health']});
    P('羊刃旺刚烈','身强带羊刃，性刚果决、敢作敢为，然锋芒过露、易招刑伤，宜以印化刃、以柔济刚。',
      {yangren:true,strong:['强']},
      {health:'身强带羊刃，性刚果决、敢作敢为，然锋芒过露、易招刑伤，宜以印化刃、以柔济刚。',cats:['health']});
    // ============ 家庭子女 ============
    P('时支逢冲子女动','时支（子女宫）逢冲，子女缘多动、子女在外奔波或聚少离多，宜以印护子、以财通关、用心经营。',
      {relChong:'时支'},
      {family:'时支（子女宫）逢冲，子女缘多动、子女在外奔波或聚少离多，宜以印护子、以财通关、用心经营。',cats:['family']});
    P('年支逢冲祖业动','年支（祖上宫）逢冲，祖业根基多动、早年离家或长辈操劳，宜自立自强、白手兴家。',
      {relChong:'年支'},
      {family:'年支（祖上宫）逢冲，祖业根基多动、早年离家或长辈操劳，宜自立自强、白手兴家。',cats:['family']});
    P('日时相冲妻儿扰','日时相冲，夫妻宫与子女宫相激，婚姻子息皆有波动，宜以印通关、以财和局，用心经营。',
      {relChongPair:['日支','时支']},
      {family:'日时相冲，夫妻宫与子女宫相激，婚姻子息皆有波动，宜以印通关、以财和局，用心经营。',cats:['family','marry']});
  })();

  // ， 十神×维度组合断语：每条约语必须含十神 ，
  // 条件使用 tenChong（十神落支被冲）/ tenSha（十神落支临神煞）/ csTen（十神五行坐长生）
  // 配合现有 pos/zhi/relChong 等键，实现"财星被冲""官星带桃花""财星坐长生"等组合断语
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    // ============ 十神×冲 ============
    P('财星被冲','财星落支逢冲，财根动摇、先破后立，宜稳守财库、防投资急变。',
      {tenChong:{'财星':true}},
      {career:'财星落支逢冲，财根动摇、先破后立，宜稳守财库、防投资急变。',cats:['career','marry']});
    P('官星被冲','官星落支逢冲，事业根基有动、名位易波折，宜稳守岗位、防权位动摇。',
      {tenChong:{'官杀':true}},
      {career:'官星落支逢冲，事业根基有动、名位易波折，宜稳守岗位、防权位动摇。',cats:['career','marry']});
    P('印星被冲','印星落支逢冲，学养根基有损、靠山易失，宜固本培元、少依赖外援。',
      {tenChong:{'印星':true}},
      {career:'印星落支逢冲，学养根基有损、靠山易失，宜固本培元、少依赖外援。',cats:['career','health']});
    P('食伤被冲','食伤落支逢冲，才思受阻、表达易有波折，宜静心沉淀、专注一技。',
      {tenChong:{'食伤':true}},
      {health:'食伤落支逢冲，才思受阻、表达易有波折，宜静心沉淀、专注一技。',cats:['health','family']});
    // ============ 十神×神煞 ============
    P('官星带桃花','女命官星（夫星）落支带桃花，夫缘风流、宜防感情纷扰，以印化杀、以财通关。',
      {sex:'女',tenSha:{'官杀':'桃花'}},
      {marry:'女命官星（夫星）落支带桃花，夫缘风流、宜防感情纷扰，以印化杀、以财通关。',cats:['marry']});
    P('财星带桃花','男命财星（妻星）落支带桃花，妻缘风流、宜防感情纷扰，以印护财、以官制劫。',
      {sex:'男',tenSha:{'财星':'桃花'}},
      {marry:'男命财星（妻星）落支带桃花，妻缘风流、宜防感情纷扰，以印护财、以官制劫。',cats:['marry']});
    P('印星临华盖','印星落支临华盖，学养才华与玄学数术相契，宜学术专研、文哲深耕。',
      {tenSha:{'印星':'华盖'}},
      {career:'印星落支临华盖，学养才华与玄学数术相契，宜学术专研、文哲深耕。',cats:['career']});
    P('驿马临财','驿马临命而财星在局，动中求财、外出发展利财，宜奔波营谋、忌坐守一隅。',
      {shensha:{'驿马':true},cn:{'财星':1}},
      {career:'驿马临命而财星在局，动中求财、外出发展利财，宜奔波营谋、忌坐守一隅。',cats:['career']});
    P('将星临官','将星临命而官杀有力，掌权统御之象显，宜管理、军警、领导之业。',
      {shensha:{'将星':true},cn:{'官杀':1}},
      {career:'将星临命而官杀有力，掌权统御之象显，宜管理、军警、领导之业。',cats:['career']});
    // ============ 十神×十二长生 ============
    P('财星坐长生','财星五行在落支得长生，财源有根、生生不息，宜经营实业、稳中求财。',
      {csTen:{'财星':'长生'}},
      {career:'财星五行在落支得长生，财源有根、生生不息，宜经营实业、稳中求财。',cats:['career']});
    P('官星坐长生','官星五行在落支得长生，名位有源、官贵可期，宜公职管理、循正途取贵。',
      {csTen:{'官杀':'长生'}},
      {career:'官星五行在落支得长生，名位有源、官贵可期，宜公职管理、循正途取贵。',cats:['career','marry']});
    P('食伤坐长生','食伤五行在落支得长生，才思敏捷、创意源源不断，宜技术创作、以才艺立身。',
      {csTen:{'食伤':'长生'}},
      {health:'食伤五行在落支得长生，才思敏捷、创意源源不断，宜技术创作、以才艺立身。',cats:['health','career']});
    P('食伤坐墓库','食伤五行坐墓库，才华藏而不露、易有怀才不遇之感，宜以财引化、以印疏通。',
      {zhi:{'食伤':'辰戌丑未'}},
      {health:'食伤五行坐墓库，才华藏而不露、易有怀才不遇之感，宜以财引化、以印疏通。',cats:['health','family']});
    P('印星坐墓库','印星坐墓库，学养深藏、不显于外，宜深研内修、不宜急于出成果。',
      {zhi:{'印星':'辰戌丑未'}},
      {career:'印星坐墓库，学养深藏、不显于外，宜深研内修、不宜急于出成果。',cats:['career']});
  })();

  // ， 综合十神断语补充（素材《十星总论》整理 + 大模型命理知识核验），
  // 财党杀/财滋弱杀（身弱/身强两端互斥）、月上偏财、印旺用财、月印清透、七杀有制子得力
  (function(){ const t=REL.tenCombo.DATAS, P=(name,say,need,themes)=>t.push({name,say,need,...(themes||{})});
    P('财党杀','财星生助七杀（财党杀），杀势愈旺而身弱难任，压力繁重、易生是非，宜印化杀、食神制杀以解。',
      {cn:{'财星':1,'七杀':1},strong:['弱'],xj:{'官杀':'忌'}},
      {career:'财星生助七杀（财党杀），杀势愈旺而身弱难任，事业压力繁重、易生是非，宜印化杀、食神制杀以解。',cats:['career','health']});
    P('财滋弱杀','财星滋助七杀，财养杀势、杀为权柄，身强可任则掌权显贵，宜军警、攻坚管理、竞争性事业。',
      {cn:{'财星':1,'七杀':1},strong:['强'],xj:{'官杀':'喜'}},
      {career:'财星滋助七杀，财养杀势、杀为权柄，身强可任则掌权显贵，宜军警、攻坚管理、竞争性事业。',cats:['career']});
    P('月上偏财清透','月上偏财而无比劫分夺，财星清透得地，财源厚实、富足可期，宜经营置业。',
      {pos:{'偏财':'月柱'},none:{'比劫':0}},
      {career:'月上偏财而无比劫分夺，财星清透得地，财源厚实、富足可期，宜经营置业。',cats:['career']});
    P('印旺用财','印星过旺而财星制印，印旺用财、行财运则发，宜以财破印、务实营生。',
      {en:{'印星':'旺'},cn:{'财星':1},xj:{'印星':'忌'}},
      {career:'印星过旺而财星制印，印旺用财、行财运则发，宜以财破印、务实营生。',cats:['career']});
    P('月印清透无财','月令印星清透而财星不现，印不受破，主文章学业清贵，宜文教、学术、出版之途。',
      {pos:{'印星':'月柱'},xj:{'印星':'喜'},none:{'财星':0}},
      {career:'月令印星清透而财星不现，印不受破，主文章学业清贵，宜文教、学术、出版之途。',cats:['career']});
    P('七杀有制子得力','男命七杀（子星）得食神制化，子星有力、子女有成、晚运可依。',
      {sex:'男',g:{'七杀':1,'食神':1}},
      {family:'男命七杀（子星）得食神制化，子星有力、子女有成、晚运可依。',cats:['family']});
  })();

  // 十神断语只保留四字经典关系断语（官印相生/比劫夺财/食伤泄秀…）。
  // 六亲方向（克父/克妻/克夫/子女/手足）由站内 REL.liuqin.judge 承担，不混入断语表。

  // 经典组合本质是"两神关系链"，故与 REL.ten 同源：先判喜忌成败（_comboBase），
  // 再叠加两神能量比的反生/反克门控（_comboEnergy），能量悬殊时组合虽成形而不成用，
  // 典籍所谓"杀重印轻，印不足以化杀""印重伤轻，配印太过"即此。
  //
  // 组合 → [生者/克者类, 受者类, kind]
  const COMBO_PAIR = {
    '官印相生': ['官杀', '印星', 'sheng'],
    '杀印相生': ['官杀', '印星', 'sheng'],
    '伤官配印': ['印星', '食伤', 'ke'],
    '食伤泄秀': ['比劫', '食伤', 'sheng']
  };
  // 组合专属失衡断语（依典籍标准说法，非泛化套话）
  const COMBO_INV = {
    '官印相生': {
      '母多灭子': '然官杀重而印轻、印不胜其压，化之不尽，其势偏于约束而非荫护',
      '子旺母衰': '然印重而官杀轻、官杀之气尽泄于印，贵气不显，相生偏于印之一端'
    },
    '杀印相生': {
      '母多灭子': '然七杀重而偏印轻、印不足以化杀，杀之压力仍在',
      '子旺母衰': '然偏印重而七杀轻、杀气尽泄于印，权柄不显'
    },
    '伤官配印': {
      '克之太过': '然印重伤轻、配印太过，伤官之秀被压不得发',
      '反侮': '然伤重印轻、配印无力，制之不住，才华仍易外泄招忌'
    },
    '食伤泄秀': {
      '母多灭子': '然日主旺而食伤轻、泄秀不足，秀气未能尽发',
      '子旺母衰': '然食伤重而日主轻、泄身太过，精气外倾'
    }
  };
  // 两神能量比门控：一方不现（能量为 0）则无凭可判，交主文案处理
  function _comboEnergy(ctx, name) {
    const p = COMBO_PAIR[name];
    if (!p || !ctx || !ctx.tenE) return '';
    const ea = _catEnergy(ctx.tenE, p[0]), eb = _catEnergy(ctx.tenE, p[1]);
    if (!ea || !eb) return '';
    const inv = REL.wx.reverseType(p[2], ea, eb);
    if (!inv) return '';
    const m = COMBO_INV[name] || {};
    return m[inv] ? ('；' + m[inv]) : '';
  }
  function _withEnergy(txt, ctx, name) {
    if (!txt) return txt;
    const note = _comboEnergy(ctx, name);
    if (!note) return txt;
    return txt.replace(/。$/, '') + note + '。';
  }

  // name ∈ 官印相生 / 杀印相生 / 伤官配印 / 食伤泄秀
  function _comboBase(ctx, name) {
      const C = ctx.C, T = ctx.T, fuXi = ctx.fuXi, fuJi = ctx.fuJi;
      const killWx = ctx.killWx, yinWx = ctx.yinWx, shangWx = ctx.shangWx;
      const dwx = ctx.dwx, isMale = ctx.isMale;
      const guan = ctx.guan, guanStrong = ctx.guanStrong, guanXi = ctx.guanXi;
      const yinXi = ctx.yinXi, yinJi = ctx.yinJi;
      const zhengYinHas = C('正印') > 0, pianYinHas = C('偏印') > 0;
      const shang = ctx.shang, shangStrong = ctx.shangStrong, killTouN = ctx.killTouN;
      if (name === '官印相生') {
        if (C('正官') > 0 && zhengYinHas && guanXi && guanStrong && yinXi) return '官印相生成立，利文职掌权、宜考公考编。';
        if (C('正官') > 0 && zhengYinHas && guanXi && yinXi) return '官印相生之势在，然正官弱藏、掌权须待岁运引动（印星为喜，引动则官生印、印生身，名位自来）。';
        if (C('正官') > 0 && zhengYinHas && guanXi && yinJi) return '官印相生之形虽具，然印星为<span class="tip sha-xiong">忌神</span>（日主身强不劳印生），官杀之吉气化生忌神、用神被转化、吉力减损，非纯吉；掌权宜借岁运直接发用，不宜叠印星助长忌神。';
        if (C('正官') > 0 && zhengYinHas) return '官印相生之形虽具，然官杀非<span class="tip sha-ji">喜用</span>、掌权不主此象（压力与名望并存，宜以实力立身）。';
        if (guanXi && yinJi) return '官印相生难成、印星为忌，故不主掌权之象。';
        if (guanXi) return '官印相生之机藏于岁运：官杀（夫星）为<span class="tip sha-ji">喜用</span>而不现，原局正印亦缺，岁运引官杀透出则夫缘与掌权之机随之而显，印星同引方成其全（印星为喜，引之则官生印、印生身，吉力相生）。';
        /* 兜底：说明实际缺失（官杀不现/正印不现/官印未全），不用"（正印）不成立"式话术 */
        const _missTxt = (C('正官') + C('七杀')) === 0 ? '官杀不现' : (!zhengYinHas ? '正印不现' : '官印未全');
        return '官印相生难成、' + _missTxt + '，' + (isMale ? '故不主掌权之象，且官杀非喜、即便岁运引出亦多主约束压力' : '夫缘与掌权不主此象，且官杀非喜、即便岁运引出亦多主约束压力') + '。';
      }
      if (name === '杀印相生') {
        if (C('七杀') > 0 && C('偏印') > 0 && guanXi && yinJi) return '杀印相生之形虽具，然偏印为<span class="tip sha-xiong">忌神</span>（日主身强不劳印生），七杀（喜）之吉气化生忌神、用神被转化、吉力减损，非纯吉；权势宜借岁运直接发用，不宜叠印星助长忌神。';
        if (C('七杀') > 0 && C('偏印') > 0 && guanXi) return '杀印相生' + (T('七杀').length === 0 ? '弱' : '') + '成立，权势根基薄藏、有助功名' + (T('七杀').length === 0 ? '但弱' : '') + '。';
        if (C('七杀') > 0 && C('偏印') > 0) return '杀印相生之形虽具，然七杀非<span class="tip sha-ji">喜用</span>、压力重于权柄，宜制化以用。';
        return '';
      }
      if (name === '伤官配印') {
        if (C('伤官') > 0 && C('偏印') > 0 && shangStrong) {
          if (fuXi.indexOf(yinWx) >= 0) return '伤官配印成立，宜变革文职、文才技艺成名。';
          return '伤官配印之形虽具，然印为<span class="tip sha-xiong">忌神</span>制伤反病、才华须防受压，宜以泄秀为主。';
        }
        return '';
      }
      if (name === '食伤泄秀') {
        if (shang > 0) {
          if (fuXi.indexOf(shangWx) >= 0) return '食伤泄秀（食伤为<span class="tip sha-ji">喜用</span>）：聪明外露、才艺可展，利考学技艺，以才艺立身、吐秀生财。';
          if (fuJi.indexOf(shangWx) >= 0) return '食伤泄秀难成、食伤为忌神而现，泄身太过，才华易浮泛、言多招忌，宜收敛务实、以专技沉淀，勿逞才使气。';
          return '食伤泄秀，聪明外露、才艺可展，利考学技艺，宜以专技立身。';
        }
        return '';
      }
      return '';
  }

  REL.classic = {
    // 对外唯一出口：喜忌成败判定 + 两神能量反生/反克门控
    combo(ctx, name) { return _withEnergy(_comboBase(ctx, name), ctx, name); },
    base: _comboBase,        // 仅喜忌判定（不含能量门控），供单测/对照
    energyNote: _comboEnergy,
    PAIR: COMBO_PAIR
  };

  /* ============================ 4. 六亲关系 ============================ */
  // ctx 需携带：dg, gans, isMale, tenGod, godClass, godToWx, polTag, ePctC,
  //   isXi, isJi, C, T, touStr, killWx, shangWx, wealthWx, killTouN, guan, shangTouN, shang
  // 返回 { s10, s13 }（与事业财运模块十神经典断语同口径）
  REL.liuqin = {
    judge(ctx) {
      const dg = ctx.dg, gans = ctx.gans, isMale = ctx.isMale;
      const tenGod = ctx.tenGod, godClass = ctx.godClass, godToWx = ctx.godToWx;
      const polTag = ctx.polTag, ePctC = ctx.ePctC, isXi = ctx.isXi, isJi = ctx.isJi;
      const C = ctx.C, T = ctx.T, touStr = ctx.touStr;
      const killWx = ctx.killWx, shangWx = ctx.shangWx, wealthWx = ctx.wealthWx;
      const killTouN = ctx.killTouN, guan = ctx.guan, shangTouN = ctx.shangTouN, shang = ctx.shang;

      // ， §10 六亲助力（四柱逐柱：先判十神喜忌，再析其意义；年柱天干/月干/日主/时柱各一句，禁喜忌缺失与先扬后抑），
      const yGod = tenGod(dg, gans[0]), yGodWx = godToWx(yGod);
      const _ygc = godClass(yGod);
      const _yXi = isXi(yGodWx), _yJi = isJi(yGodWx);
      const caiFatherRaw = gans.filter(g => tenGod(dg, g) === '偏财');
      const fatherXi = isXi(wealthWx);
      const fatherNote = caiFatherRaw.length
        ? ('偏财（父）透' + dedupChars(caiFatherRaw) + (fatherXi ? '，父可助财、可得父辈资力' : '，父缘虽明但偏财非喜，父耗财或不宜靠父资') + '。')
        : '偏财（父）不透，父缘看支' + (fatherXi ? '，父星为喜、支中有则可得助' : '，父星非喜、不宜依赖父资') + '。';
      // 年柱天干：先喜忌后意义（喜用按类给根基人脉落点；忌神/无涉直说，不粉饰）
      let s10 = '年柱天干' + yGod + '，' + (_yXi ? '为<span class="tip sha-ji">喜用</span>' : _yJi ? '为<span class="tip sha-xiong">忌神</span>' : '与喜忌无涉')
        + '，' + (_yXi
          ? (_ygc === '财星' ? '父辈资力与祖荫人脉俱可依托、凭才艺技艺亦可自立进取'
            : _ygc === '比劫' ? '同辈人脉为早年之基、事业多赖同侪往来'
            : _ygc === '官杀' ? '家声清正、长辈提携与平台之资可依'
            : _ygc === '印星' ? '家学荫庇、长辈人脉为早年之助'
            : _ygc === '食伤' ? '凭才艺自立、人脉由技艺而结'
            : '早年多得助力')
          : _yJi ? '祖业薄、早年多磨、须白手自立'
          : '祖业平淡、宜白手积累')
        + '；' + fatherNote;
      // 月干：先喜忌后意义（忌神直说其弊，禁先扬后抑式补救）
      const _mGod = tenGod(dg, gans[1]), _mgc = godClass(_mGod), _mWx = godToWx(_mGod);
      const _mXi = isXi(_mWx), _mJi = isJi(_mWx);
      const _mAspect = _mgc === '比劫' ? '同业往来密切、伙伴协作与竞合并见'
        : _mgc === '官杀' ? '青年即入竞争之场、职场约束与平台机遇并见'
        : _mgc === '印星' ? '得长辈提携与平台荫庇、青年事业有依'
        : _mgc === '财星' ? '青年即营财置业、财路早开'
        : _mgc === '食伤' ? '以才艺社交立身、青年名望渐起'
        : '';
      if (_mAspect) s10 += '月干' + _mGod + '，' + (_mXi ? '为<span class="tip sha-ji">喜用</span>' : _mJi ? '为<span class="tip sha-xiong">忌神</span>' : '与喜忌无涉') + '，'
        + (_mXi ? _mAspect + '、助力实在'
          : _mJi ? (_mgc === '印星' ? '依赖长辈过甚、易受牵制，青年事业有依而自主不足'
            : _mgc === '财星' ? '求财反耗、为财所累，青年营财宜谨慎'
            : _mgc === '食伤' ? '恃才易招是非，才艺宜收敛'
            : '竞争压力更大，职场须耐压')
          : _mAspect + '、平常处之')
        + '。';

      // 日主（日柱自身之宫）：配偶星先喜忌后意义
      const mateStarXi = isMale ? isXi(wealthWx) : isXi(killWx);
      const mateStarJi = isMale ? isJi(wealthWx) : isJi(killWx);
      s10 += '日主坐自身之宫（日支为夫妻宫），配偶星（' + (isMale ? '财星' : '官杀') + '）'
        + (mateStarXi ? '为<span class="tip sha-ji">喜用</span>，命主可依靠配偶，婚姻与事业财运互旺'
          : mateStarJi ? '为<span class="tip sha-xiong">忌神</span>，须经营感情财务分明、中年易因家室分心，婚姻与财运偏相耗'
          : '与喜忌无涉，感情须经营，婚姻与财运中性互依')
        + '。';
      // 晚年：子女星先喜忌后意义（一句定论）
      const childStarWx = isMale ? killWx : shangWx;
      const childStarXi = isXi(childStarWx), childStarJi = isJi(childStarWx);
      const childStarE = isMale ? ePctC('官杀') : ePctC('食伤');
      s10 += '晚年子女星（' + (isMale ? '官杀' : '食伤') + '）'
        + (childStarXi ? ('为<span class="tip sha-ji">喜用</span>' + (childStarE >= REL.TH.PCT_STRONG ? '，子女缘厚、晚岁可得其力。' : '，唯子女星弱藏、缘偏薄，宜用心维系。'))
          : childStarJi ? '为<span class="tip sha-xiong">忌神</span>，多为子女操心，宜自立不依赖。'
          : '与喜忌无涉，子女缘薄、宜用心维系，晚年宜自立。');
      // 时柱：先喜忌后意义（含子女/后辈/下属落点；弱藏补一句，句式"时柱X为喜用，晚年子女、后辈、下属可相助，但X弱藏、缘偏薄，宜用心维系"）
      const _tGod = tenGod(dg, gans[3]), _tgc = godClass(_tGod), _tWx = godToWx(_tGod);
      const _tXi = isXi(_tWx), _tJi = isJi(_tWx), _tE = ePctC(_tgc);
      const _tWord = isMale
        ? (_tgc === '官杀' ? '可依' : _tgc === '食伤' ? '可传其艺' : _tgc === '印星' ? '得学养之荫' : _tgc === '比劫' ? '可相助' : _tgc === '财星' ? '可得资财之荫' : '')
        : (_tgc === '食伤' ? '可传其艺' : _tgc === '官杀' ? '敬重有加' : _tgc === '印星' ? '得学养之荫' : _tgc === '比劫' ? '可相助' : _tgc === '财星' ? '可得资财之荫' : '');
      if (_tWord) {
        if (_tXi) s10 += '时柱' + _tGod + '为<span class="tip sha-ji">喜用</span>，晚年子女、后辈、下属' + _tWord + (_tE >= REL.TH.PCT_STRONG ? '。' : '，但' + _tGod + '弱藏、缘偏薄，宜用心维系。');
        else if (_tJi) s10 += '时柱' + _tGod + '为<span class="tip sha-xiong">忌神</span>，晚年后辈往来反易添扰，宜淡泊处之。';
        else s10 += '时柱' + _tGod + '与喜忌无涉，晚年后辈往来平常。';
      }

      // ， §13 男、女命特征 ，
      let s13 = isMale
        ? ('官杀为子女星（正官为正子女、七杀为偏子女），财星为妻星，印星为母。此局官杀' + (guan > 0 ? ('' + guan + '个' + (killTouN ? '透' + touStr('正官') + touStr('七杀') : '藏支') + '，子女缘' + (childStarE >= REL.TH.PCT_STRONG ? '厚' : '偏薄')) : '缺，子女缘偏薄、须用心维系') + '；妻星（财）' + C('正财') + C('偏财') + '个。事业与财皆在自身，宜专精技术商贸、以才生财。')
        : ('官杀为夫星（正官为正夫、七杀为偏夫），食伤为子女星（食神为女儿、伤官为儿子），财为自身财加父。此局夫星' + (guan > 0 ? ('' + guan + '个' + (killTouN ? '透' + touStr('正官') + touStr('七杀') : '弱藏') + '，夫缘' + (killTouN ? '明现' : '弱藏、婚姻自主晚成')) : '缺，正缘须待岁运') + '；子女看食伤（' + (C('食神') + C('伤官')) + '个），子女星' + (shangTouN ? '旺透、女儿儿子皆缘厚' : (shang > 0 ? '弱藏、缘偏薄、宜用心维系' : '缘薄、须用心维系')) + '。事业与财皆在自身才艺，' + (ctx.caiIsXi ? '可凭本事成富' : '财为<span class="tip sha-xiong">忌神</span>、宜以专技生财') + '。');

      return { s10: s10, s13: s13 };
    }
  };

  /* ============================ 5. 神煞关系 ============================ */
  // 吉凶分类真源 = app.js 的 shaCat / SHA_JI / SHA_XIONG（全站共用，本文件不复制）。
  // 本组只放"八字排盘专用"的排序权重与聚合取用逻辑，供 renderShenshaSummary /
  // coreShenshaHtml / renderBenmingClickable 共同调用，杜绝三处各写一套。
  const SHENSHA_W = {
    '天乙贵人': 9, '太极贵人': 8, '文昌': 8, '福星贵人': 7, '天厨贵人': 6, '禄神': 8, '金舆': 5, '学堂': 6, '华盖': 7, '国印': 6, '天德': 9, '月德': 9, '天赦': 8, '驿马': 5, '桃花': 6, '将星': 5, '三奇': 8,
    '羊刃': 9, '劫煞': 8, '灾煞': 8, '勾绞': 6, '孤辰': 7, '寡宿': 7, '亡神': 8, '元辰': 8, '咸池': 6, '红艳': 6, '魁罡': 7, '十恶大败': 8, '四废': 7, '孤鸾': 7, '阴阳差错': 7, '血刃': 7, '飞刃': 6, '破碎': 5, '披麻': 5, '吊客': 5
  };
  REL.sha = {
    WEIGHT: SHENSHA_W,
    // 吉凶类别（ji / xiong / neutral），直连 app.js 真源，不另建同义表
    cat(name) { return (typeof shaCat === 'function') ? shaCat(name) : 'neutral'; },
    // 排序权重：查表优先，未列者按类别给底分
    weight(name, cat) {
      if (SHENSHA_W[name] != null) return SHENSHA_W[name];
      const c = cat || REL.sha.cat(name);
      return c === 'xiong' ? 4 : c === 'ji' ? 3 : 2;
    },
    // 从四柱 cols 聚合去重（去括号后缀），记录所临柱位
    collect(cols) {
      const seen = {};
      (cols || []).forEach(c => {
        (c.sha || []).forEach(s => {
          const b = String(s).replace(/（[^）]+）$/, '');
          if (!seen[b]) seen[b] = { name: b, cat: REL.sha.cat(b), pillars: [c.lbl] };
          else if (seen[b].pillars.indexOf(c.lbl) < 0) seen[b].pillars.push(c.lbl);
        });
      });
      return Object.values(seen);
    },
    // 按吉凶权重排序取前 n（凶煞整体提权 +2：需重点关注）
    top(cols, n) {
      const arr = REL.sha.collect(cols);
      if (!arr.length) return [];
      arr.forEach(o => { o.w = REL.sha.weight(o.name, o.cat); });
      const k = o => (o.cat === 'xiong' ? o.w + 2 : o.w);
      arr.sort((a, b) => k(b) - k(a));
      return arr.slice(0, n || 5);
    },
    // 吉 / 凶 / 中 三组可点击 HTML 片段（分组顺序与配色沿用本页既有口径）
    groupParts(top, sep) {
      const pick = c => (top || []).filter(o => o.cat === c)
        .map(o => '<span class="tip sha-' + c + ' wx-skip" onclick="showTip(\'' + o.name + '\')">' + o.name + '</span>')
        .join(sep || '、');
      const ji = pick('ji'), xiong = pick('xiong'), neu = pick('neutral');
      const parts = [];
      if (ji) parts.push('吉神：' + ji);
      if (xiong) parts.push('凶煞：' + xiong);
      if (neu) parts.push('中性：' + neu);
      return parts;
    }
  };

  /* ============================ 6. 干支关系 ============================ */
  // 真源 = bazi-data.js 的 ganRelations / zhiRelations / zhiRelTypes（本文件只做归集与语义正名）。
  // 干支关系两个出口按职能分开：pairs（四支两两）与 toPillars（单支对四柱），避免重名遮蔽。
  const ZHI_NAMES = ['年支', '月支', '日支', '时支'];
  REL.gz = {
    // 天干两两关系（真源 ganRelations）→ [{cls,text}]
    ganPairs(gans, ctx, labels) { return (typeof ganRelations === 'function') ? ganRelations(gans, ctx, labels) : []; },
    // 地支两两关系（真源 zhiRelations）→ [{cls,text}]
    zhiPairs(zhis, ctx, labels) { return (typeof zhiRelations === 'function') ? zhiRelations(zhis, ctx, labels) : []; },
    // 单支 z 对四柱各支 pz 的关系（原 bazi-core dyNatalInto 内局部实现，归集于此）
    // 返回如 ['冲年支(酉)','合月支(丑)']；同字视自刑（辰午酉亥），日支自身不计
    zhiToPillars(z, pz) {
      const out = [];
      (pz || []).forEach((p, i) => {
        if (p === z) {
          if (i === 2) return;                                   // 日支自身不与己论
          if (['辰', '午', '酉', '亥'].indexOf(z) >= 0) out.push('刑' + ZHI_NAMES[i] + '(' + p + ')自刑');
          return;
        }
        (typeof zhiRelTypes === 'function' ? zhiRelTypes(z, p) : []).forEach(t => {
          if (t === '暗合') return;
          if (['冲', '合', '害', '破', '刑'].indexOf(t) >= 0) out.push(t + ZHI_NAMES[i] + '(' + p + ')');
        });
      });
      return out;
    },
    // 两支配对关系类型（仅术语，不转译）→ ['冲'] / ['合','刑'] …
    between(a, b) {
      const out = [];
      (typeof zhiRelTypes === 'function' ? zhiRelTypes(a, b) : []).forEach(t => {
        if (t !== '暗合' && ['冲', '合', '害', '破', '刑'].indexOf(t) >= 0) out.push(t);
      });
      return out;
    },
    // 冲/合/刑/害/破 类型字提取（与 bazi-data relTypeOf 同源，锚定首字符）
    typeOf(r) { const m = String(r || '').match(/^(冲|合|刑|害|破)/); return m ? m[1] : ''; },
    // cls（ganRelations / zhiRelations 返回的结构类别）→ 中文标签。
    CLS_LABEL: {
      chong: '冲', gchong: '冲', xing: '刑', hai: '害', po: '破',
      sanhe: '三合、会', he: '合', zheng: '争合', sheng: '相生', ke: '相克', bihe: '比和'
    },
    clsLabel(cls) { return REL.gz.CLS_LABEL[cls] || '合'; }
  };

  REL._catEnergy = _catEnergy;
  REL.buildCtx = buildCtx;

  if (typeof window !== 'undefined') window.REL = REL;
  if (typeof module !== 'undefined' && module.exports) module.exports = REL;
})();

// 五行 → 十神类（以日主为参照）全局真源：同气=比劫、我生=食伤、我克=财、克我=官杀、生我=印。
// 消费方（量化四柱等）直接调用，勿另建同义映射。
window.wxRoleOfDwx = function(dwx, wx){
  if(!dwx || !wx) return '';
  if(wx===dwx) return '比劫';
  if(WX_SHENG[dwx]===wx) return '食伤';
  if(WX_KE[dwx]===wx) return '财';
  for(const k in WX_KE) if(WX_KE[k]===dwx && k===wx) return '官杀';
  for(const k in WX_SHENG) if(WX_SHENG[k]===dwx && k===wx) return '印';
  return '';
};


/* ============================================================================
 * ↓↓↓ 八字专用顶层设定
 * ----------------------------------------------------------------------------
 * 这些符号只被八字页面（bazi.html + bazi-*.js）引用，集中于此：
 * 八字引擎与全站共享库解耦，xuanji-lib.js 只保留上色引擎与跨页公用干支表，
 * 改动八字判定不影响紫微/六爻/梅花/太乙等页面。
 * ============================================================================ */

/* ============================================================
 * 【年龄门控顶层设计】全站共享：各流派解读运势/格局、人生议题、运势曲线等
 *   一切命理解读/叙事模块在落具体措辞前，都应先按命主年龄自适应。
 *   纯函数、无运行时状态；渲染循环里的“当前步年龄”由调用方自行持有并传入。
 */
const AGE_RULES = { INFANT:7, CHILD:16, YOUTH:24, SENIOR:60 };

function baziAgeStage(age){ if(age==null) return null; if(age<AGE_RULES.CHILD) return 'child'; if(age<AGE_RULES.YOUTH) return 'youth'; if(age<AGE_RULES.SENIOR) return 'adult'; return 'late'; }

// 幼儿细分档（<7）：门控判定仍按 child 走（儿童不述成人事），但应事/收尾文案层需更幼语境（2 岁不谈考试课业）
function baziInfant(age){ return age!=null && age<AGE_RULES.INFANT; }

// 从 selMeta.period 解析该步年龄：流年"（N岁）"→ 大运"N–M岁"→ 兜底"N岁"
function baziStepAge(m){
  if(!m || !m.period) return null;
  const p=String(m.period); let mm;
  if((mm=p.match(/（\s*(\d+)\s*岁\s*）/))) return +mm[1];
  if((mm=p.match(/(\d+)\s*[–\-]\s*\d+\s*岁/))) return +mm[1];
  if((mm=p.match(/(\d+)\s*岁/))) return +mm[1];
  return null;
}

/* ============================================================
 * 【年龄门控】全站唯一体系（唯一入口，禁止各模块自行实现年龄判断）
 *   档位：baziAgeStage(age) → child(<16) / youth(16–23) / adult(24–59) / late(>=60)
 *   能力：
 *，ageCardNote(area, age)          领域卡片导语（child / youth / late 全覆盖）
 *，ageAdaptText(area, text, age)   单文本改写：含 drop 词之整句删除 + 词级替换
 *，ageGateEvents(events, age)      事件词数组过滤
 *，baziAgeCardNote / baziAgeAdapt  同义别名（见 ageCardNote / ageAdaptText）
 *   词表 AGE_WORD：drop（句级删除词，按档位）/ replace（词级替换，按档位）
 *   所有解读/叙事模块一律调用本体系。
 * ============================================================ */
const AGE_WORD = {
  drop: {
    infant: ['考试','升学','评级','名次','功名','纪律','课业','学业','师长','考公','晋升','就业','置业','购房','婚恋','情缘','配偶','职场','事业','创业','投资','信贷','合伙','上司','夫星','妻星','成家','择偶','姻缘','婚期'],
    child: ['置业','购房','安家','添丁','孕育','婚恋','情缘','夫妻','配偶','晋升','岗位调动','考公','经商','投资','信贷','担保','合伙','职场','上司','权贵','夫星','妻星','成家','择偶','婚配','姻缘','婚期'],
    late:  ['晋升','考公','置业','购房','安家','添丁','孕育','婚恋','情缘','桃花','夫妻','配偶','经商','投资','岗位','权贵','夫星','成家','择偶','婚配','姻缘','婚期','恋爱']
  },
  replace: {
    infant: {'事业心':'上进心','事业':'成长','谋事':'成长','学业与事业':'成长'},
    child: {'事业心':'上进心','事业':'学业','谋事':'课业','创业':'自主尝试','职场':'校园','子女':'手足玩伴','婚姻':'情缘','晚年':'年长之后','中年':'成年之后'},
    youth: {'事业':'学业与事业'},
    late:  {}
  }
};

function ageCardNote(area, age){
  const st = baziAgeStage(age); if(st==null || st==='adult') return '';
  const A = age+'岁';
  if(baziInfant(age)){
    if(area==='事业财运') return '命主现年'+A+'，尚在幼年。以下本为一生事业财运之禀赋，当下只作健康发育、启蒙养正与家庭助力看，成年后方逐步兑现。';
    if(area==='婚姻感情') return '命主现年'+A+'，尚在幼年。以下姻缘禀赋只作先天倾向看，不作现实婚配论。';
    if(area==='家庭子女') return '命主现年'+A+'，子女宫之象当下只作长辈照拂、健康养护看，育儿之论待其成年后再启。';
    if(area==='性格健康') return '命主现年'+A+'，体质随发育而变，以下宜作先天倾向与养护重点看，不作定论。';
    return '';
  }
  if(st==='child'){
    if(area==='事业财运') return '命主现年'+A+'，尚在就学之龄。以下本为一生事业财运之禀赋，当下宜作才性、学业取向与家庭助力看，成年后方逐步兑现。';
    if(area==='婚姻感情') return '命主现年'+A+'，未及婚龄。以下姻缘禀赋只作先天倾向看，不作现实婚配论。';
    if(area==='家庭子女') return '命主现年'+A+'，子女宫之象当下只作手足、玩伴与家中排行看，育儿之论待其成年后再启。';
    if(area==='性格健康') return '命主现年'+A+'，性格尚在塑形、体质随发育而变，以下宜作先天倾向与养护重点看，不作定论。';
    return '';
  }
  if(st==='youth'){
    if(area==='事业财运') return '命主现年'+A+'，正值学业与初入社会之交，以下事业之象宜先落在专业选择与起步方向上。';
    if(area==='婚姻感情') return '命主现年'+A+'，情缘初动之期，以下宜作择偶取向看，成家应期须以行运再定。';
    if(area==='家庭子女') return '命主现年'+A+'，子女之论尚早，当下宜作与父母、手足之关系看。';
    return '';
  }
  // late（>=60）：晚年领域导语
  if(area==='婚姻感情') return '命主现年'+A+'，婚姻已成、缘法已定，以下只作相守之道与晚年情谊看。';
  if(area==='事业财运') return '命主现年'+A+'，事业已入收束之期，以下宜作守成、余热与家业传承看。';
  if(area==='家庭子女') return '命主现年'+A+'，子女已成家立业，以下宜作子女孙辈、家宅安养看。';
  if(area==='性格健康') return '命主现年'+A+'，体质渐衰，以下宜作颐养、防病与调护重点看。';
  return '';
}

function ageAdaptText(area, text, age){
  if(age==null) return text;
  const st = baziAgeStage(age); if(!st || st==='adult') return text;
  const isInf = baziInfant(age);
  const drop = (isInf?AGE_WORD.drop.infant:AGE_WORD.drop[st]) || [];
  let out = String(text);
  if(drop.length){
    // 按句段切（每段=非。；连续字符 + 可选一个句尾标点），含 drop 词的整段删；
    // 杜绝旧 regex `[^。；]*(...)` 跨过 `<br>` / 中文数字标签一路吃，把 item 标题"X、名利层级" 一并吞掉的 bug。
    const segs = out.match(/[^。；]+[。；]?/g);
    if(segs){
      const dropRe = new RegExp(drop.join('|'));
      out = segs.filter(s => !dropRe.test(s)).join('');
    }
  }
  const repl = (isInf?AGE_WORD.replace.infant:AGE_WORD.replace[st]) || {};
  Object.keys(repl).forEach(k => { if(out.indexOf(k)>=0) out = out.split(k).join(repl[k]); });
  return out;
}

/* 人生议题卡片的年龄适配：对每条 item 拆出 "X、标题<br>" 前缀、只对内容做 drop/replace，
   再拼回标题，杜绝 ageAdaptText 把前缀连同含 drop 词的整段一并吞掉的 bug。
   标题前缀形如 "1、本命基调<br>" / "7、名利层级<br>"（renderCareer 出参的形态）。 */
function ageAdaptItem(text, age){
  if(age==null) return text;
  const st = baziAgeStage(age); if(!st || st==='adult') return text;
  const m = String(text||'').match(/^(\d+、[^<]*<br>)([\s\S]*)$/);
  if(!m) return window.ageAdaptText ? window.ageAdaptText('', text, age) : text;
  // 第二参数 area 已不重要，ageAdaptText 用 age 走档位，不依赖 area
  const adapt = (window.ageAdaptText || ageAdaptText)('', m[2], age);
  return m[1] + adapt;
}

function ageGateEvents(events, age){
  if(age==null || !events) return events;
  const st = baziAgeStage(age); if(!st || st==='adult') return events;
  const drop = (baziInfant(age)?AGE_WORD.drop.infant:AGE_WORD.drop[st]) || [];
  if(!drop.length) return events;
  return events.filter(e => !drop.some(k => e.indexOf(k)>=0));
}

window.ageCardNote = ageCardNote;

window.ageAdaptText = ageAdaptText;

window.ageAdaptItem = ageAdaptItem;

window.ageGateEvents = ageGateEvents;

/* 人生议题卡片的年龄适配导语（同义别名，见 ageCardNote） */
function baziAgeCardNote(area, age){ return ageCardNote(area, age); }

/* 领域结论按年龄自适应改写（同义别名，见 ageAdaptText） */
function baziAgeAdapt(area, text, age){ return ageAdaptText(area, text, age); }

const SCORE_BASE = 50;

const SCORE_MIN  = 0;

const SCORE_MAX  = 100;

function clampScore(x){ return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(x))); }

// 综合运势权重：大运主导，叠加流年/流月（两层）或流月+流日（三层）
const YUN_W_DAYUN  = 0.55;

const YUN_W_SUB    = 0.45;

const YUN_W_DAYUN3 = 0.40;

const YUN_W_MID    = 0.30;

// 用神损益评分中"天干/地支"损益在前后向评分里的分配权重（天干±12、地支±10/±5 已命名于 SCORE_GAN_W/SCORE_ZHI_BEN_W/SCORE_ZHI_HIDE_W）
const SPLIT_GAN_W = 0.7, SPLIT_ZHI_W = 0.3;

/* ============ 一、称骨（袁天罡称骨法，单位：钱，1两=10钱） ============ */
// 注：下列为常见《袁天罡称骨歌》年柱骨重（钱，1两=10钱），共 60 甲子全部收录，数值依通行称骨歌本。
// 称骨为民俗文化称量法，分等立说，仅供文化参考、不作命运定论。
const CHENGU_YEAR = {
  '甲子':12,'乙丑':9,'丙寅':6,'丁卯':7,'戊辰':12,'己巳':5,'庚午':7,'辛未':8,'壬申':7,'癸酉':8,
  '甲戌':15,'乙亥':9,'丙子':16,'丁丑':8,'戊寅':8,'己卯':9,'庚辰':12,'辛巳':6,'壬午':8,'癸未':7,
  '甲申':5,'乙酉':14,'丙戌':6,'丁亥':16,'戊子':15,'己丑':7,'庚寅':9,'辛卯':12,'壬辰':10,'癸巳':7,
  '甲午':15,'乙未':6,'丙申':5,'丁酉':14,'戊戌':14,'己亥':9,'庚子':7,'辛丑':8,'壬寅':9,'癸卯':12,
  '甲辰':12,'乙巳':7,'丙午':13,'丁未':5,'戊申':14,'己酉':9,'庚戌':9,'辛亥':17,'壬子':7,'癸丑':7,
  '甲寅':12,'乙卯':8,'丙辰':8,'丁巳':6,'戊午':9,'己未':6,'庚申':8,'辛酉':9,'壬戌':10,'癸亥':6
};

const CHENGU_MONTH = {'寅':6,'卯':7,'辰':18,'巳':9,'午':5,'未':16,'申':9,'酉':15,'戌':18,'亥':8,'子':9,'丑':5};

const CHENGU_DAY = {1:5,2:10,3:8,4:15,5:16,6:15,7:8,8:16,9:8,10:16,11:9,12:17,13:8,14:17,15:10,
  16:8,17:9,18:18,19:5,20:15,21:10,22:9,23:8,24:9,25:15,26:18,27:7,28:8,29:16,30:6};

const CHENGU_HOUR = {'子':16,'丑':6,'寅':7,'卯':10,'辰':9,'巳':16,'午':10,'未':8,'申':8,'酉':9,'戌':6,'亥':6};

function chenguVerdict(liang){
  const table=[
    [2.1,'根基薄弱，早年多劳，宜稳扎稳打、积厚成器'],
    [2.4,'衣禄平浅，谋事多赖自身勤勉，中年渐有起色'],
    [2.7,'初年平平，中年方兴，宜守不宜冒'],
    [3.0,'衣禄渐丰，六亲多靠，行事宜择机而动'],
    [3.3,'性聪好学，中年后运渐开，可凭技艺立身'],
    [3.6,'名利可期，然须防小人口舌，凡事留余地'],
    [3.9,'聪明有权，事业可成，宜修人和'],
    [4.2,'富贵双全，才德兼备，中年发福'],
    [4.5,'福禄厚重，家业兴隆，然宜谦以保盈'],
    [4.8,'官运亨通，利达功名，宜济物利人'],
    [5.1,'威权服众，事业宏展，须防盛极而衰'],
    [5.4,'文章显达，声名外扬，宜厚德载物'],
    [5.7,'福寿康宁，亲友得力，一生少凶'],
    [6.0,'权位崇隆，名利兼收，宜持盈保泰'],
    [6.3,'大富大贵，高处不胜寒，宜修阴骘'],
    [6.6,'古谓帝王之骨，才略过人，宜以仁御众'],
    [6.9,'极贵之格，功业巍然，须防盈满招损'],
    [7.2,'稀世之重，古谓非寻常人可比，宜立德立功']
  ];
  for(const r of table){ if(liang<=r[0]) return {cap:r[0], t:r[1]}; }
  return {cap:7.2, t:'极贵之格，古谓骨重逾常，宜立德立功、谦以持盈'};
}

function chenguCore(BZ){
  const yg=BZ.gans[0]+BZ.zhis[0], mz=BZ.zhis[1], tz=BZ.zhis[3];
  const yKnown=Object.prototype.hasOwnProperty.call(CHENGU_YEAR, yg);
  const yv=yKnown?CHENGU_YEAR[yg]:0, mv=CHENGU_MONTH[mz]||0;
  /* 日柱骨重：袁天罡称骨歌日表为农历日序（初一~三十），故须取农历日号 BZ.lunar.getDay()（非公历日 BZ.day）。
     date 模式 BZ.lunar 由 buildBaziState 挂载；pillar 模式填出生日期后 BZ.lunar 由 paipanPillar 挂载，未填则为 null → 无法定日骨重，走估算。 */
  const lunarDay=(BZ && BZ.lunar && typeof BZ.lunar.getDay==='function')?BZ.lunar.getDay():null;
  const dv=(lunarDay && CHENGU_DAY[lunarDay])?CHENGU_DAY[lunarDay]:null;
  const hv=CHENGU_HOUR[tz]||0;
  const total=yv+mv+(dv==null?0:dv)+hv;
  const liangInt=Math.floor(total/10), qian=total%10;
  const v=chenguVerdict(total/10);
  return {yg,yKnown,yv,mz,mv,dv,hv,tz,gans2:BZ.gans[2],zhis2:BZ.zhis[2],total,liangInt,qian,v};
}

function renderChengu(BZ){
  const c=chenguCore(BZ);
  const isEstimate=(c.dv==null) || (!c.yKnown);
  let parts=[`年柱${c.yg}${c.yKnown?(c.yv+'钱'):'数据暂缺（估算，已忽略）'}`];
  if(c.mv) parts.push(`月支${c.mz}${c.mv}钱`);
  if(c.dv!=null) parts.push(`日柱${c.gans2+c.zhis2}${c.dv}钱`);
  else parts.push(`日柱未确认（估算，按年月时计）`);
  parts.push(`时支${c.tz}${c.hv}钱`);
  const reasons=[];
  if(c.dv==null) reasons.push('日柱称量需出生日期，当前未确认，已按年月时估算');
  if(!c.yKnown) reasons.push(`年柱${c.yg}骨重数据暂缺，已忽略该柱`);
  const note=reasons.length?`（${reasons.join('；')}）`:'';
  let h=`<div class="life-card"><h5>袁天罡称骨</h5>`;
  // 输出顺序：各柱骨重 → 总骨重（估算盘附括注） → 文化解读 → 法理说明（置末）。
  h+=`<p class="ly-zh-p">各柱骨重：${parts.join('，')}。总骨重：${c.liangInt}两${c.qian}钱（${c.total}钱）${isEstimate?'（估算值）':''}${note}。文化解读：${c.v.t}。</p>`;
  h+=`</div>`;
  return h;
}

function _mod8(n){ n=((n%8)+8)%8; return n===0?8:n; }

function _mod6(n){ n=((n%6)+6)%6; return n===0?6:n; }

function attachHex(upNum, dnNum, yao){
  const upper=XT2NAME[upNum], lower=XT2NAME[dnNum];
  const ben=TRIGRAMS[lower].bits.concat(TRIGRAMS[upper].bits);
  const bian=ben.slice(); bian[yao-1]=bian[yao-1]?0:1;
  return {up:upper, dn:lower, yao, ben, bian,
    benInfo:hexInfo(ben), bianInfo:hexInfo(bian),
    palace:palaceInfo(ben), palaceBian:palaceInfo(bian)};
}

function lifeHex(BZ){
  const g=BZ.gans, z=BZ.zhis;
  const up=_mod8(GAN_NUM[g[0]]+ZHI_NUM[z[0]]);
  const dn=_mod8(GAN_NUM[g[1]]+ZHI_NUM[z[1]]);
  const yao=_mod6(GAN_NUM[g[0]]+ZHI_NUM[z[0]]+GAN_NUM[g[1]]+ZHI_NUM[z[1]]+GAN_NUM[g[2]]+ZHI_NUM[z[2]]+GAN_NUM[g[3]]+ZHI_NUM[z[3]]);
  return attachHex(up, dn, yao);
}

function liuNianHex(BZ, yearGz){
  const g=BZ.gans, z=BZ.zhis;
  const yg=yearGz[0], yz=yearGz[1];
  const up=_mod8(GAN_NUM[yg]+ZHI_NUM[yz]);
  const dn=_mod8(GAN_NUM[g[2]]+ZHI_NUM[yz]);
  const yao=_mod6(GAN_NUM[yg]+ZHI_NUM[yz]+GAN_NUM[g[2]]+ZHI_NUM[z[2]]);
  return attachHex(up, dn, yao);
}

function yearGz(Y){
  const G=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const Z=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  return G[((Y-4)%10+10)%10]+Z[((Y-4)%12+12)%12];
}

const HEX_MEAN={
  '乾为天':'刚健中正，自强不息，宜进取','天泽履':'履虎尾，慎行则吉，循礼而行','天火同人':'与人和同，同心协力，利交际',
  '天雷无妄':'不妄为，顺天合道，守正免灾','天风姤':'相遇不期，防阴长侵阳，宜慎交','天水讼':'争讼之象，宜止争求和，勿刚愎',
  '天山遁':'退避藏器，时退则退，待时而行','天地否':'天地不交，闭塞之世，宜隐忍','泽天夬':'决而能和，刚决柔除，果断去小人',
  '兑为泽':'喜悦和顺，朋友讲习，宜相悦','泽火革':'变革之时，顺天应人，除旧布新','泽雷随':'随时而动，从宜随顺，择善而从',
  '泽风大过':'大过则桡，独立不惧，宜救时弊','泽水困':'困穷守正，处困待变，勿妄动','泽山咸':'感应交欢，男女相悦，和而不同',
  '泽地萃':'荟萃聚集，物以类聚，宜聚人成事','火天大有':'大有所得，顺天休命，富有宜谦','火泽睽':'乖离求合，异中求同，宜化解隔阂',
  '离为火':'明两作离，继明照四方，宜附丽正道','火雷噬嗑':'咬合去梗，刑狱除奸，宜决断','火风鼎':'鼎新取象，烹饪养贤，宜稳进而革',
  '火水未济':'事未竟成，慎终如始，防功亏一篑','火山旅':'行旅在外，依善而安，不宜久居','火地晋':'明出地上，进而上行，宜升进',
  '雷天大壮':'阳刚壮盛，壮勿妄动，宜守正','雷泽归妹':'归妹以娣，男女有终，宜守礼','雷火丰':'丰大光明，盛极当忧，宜保泰',
  '震为雷':'震动惊惧，恐惧修省，出则有功','雷风恒':'恒久之道，守则不变，宜持久','雷水解':'险难消解，舒缓和济，宜解脱',
  '雷山小过':'小者过越，宜下不宜上，守小慎过','雷地豫':'逸豫和乐，顺动以悦，宜备患','风天小畜':'小有畜聚，蓄而待发，宜循序渐进',
  '风泽中孚':'诚信中孚，豚鱼可格，宜以信待人','风火家人':'家道正则，女主内男主外，宜齐家','风雷益':'损上益下，与时偕行，宜兴利',
  '巽为风':'顺而能入，谦逊行权，宜从顺','风水涣':'涣散而通，风行水上，宜聚散有道','风山渐':'渐次而进，女归吉，宜按部就班',
  '风地观':'观风察俗，省方设教，宜静观','水天需':'需待其时，饮食宴乐，宜耐心','水泽节':'节制有度，适可而止，宜守中',
  '水火既济':'事已成济，宜守成防初吉终乱','水雷屯':'屯难初生，万物始萌，宜建侯安民','水风井':'井养不穷，养民有常，宜修德',
  '坎为水':'重险习坎，维心亨，宜行险而不失信','水山蹇':'蹇难在前，反身修德，宜止而待时','水地比':'比亲相辅，先迷后得主，宜亲贤',
  '山天大畜':'大畜厚德，刚上尚贤，宜止而积','山泽损':'损下益上，损中有得，宜节欲','山火贲':'贲饰文采，质胜文野，宜文饰有度',
  '山雷颐':'颐养正道，慎言节食，宜自养','山风蛊':'蛊坏当治，振民育德，宜除弊','山水蒙':'蒙以养正，山下出泉，宜启蒙',
  '艮为山':'艮止其背，动静不失其时，宜止','山地剥':'剥落侵蚀，小人得势，宜顺而止','地天泰':'天地交泰，阴阳和畅，宜保和',
  '地泽临':'临下亲民，刚浸而长，宜临事以宽','地火明夷':'明入地中，韬光养晦，宜守正','地雷复':'一阳来复，反复其道，宜修身待时',
  '地风升':'地中生木，积小成高，宜渐升','地水师':'兵众用师，丈人吉，宜纪律','地山谦':'谦尊而光，卑而不可逾，宜谦','坤为地':'厚德载物，顺承天而行，宜守静'
};

function hexBody(lh){
  let s=`<div class="hex-row"><div class="hex-name">本卦：<b>${lh.benInfo.name}</b> <span class="hx">${lh.benInfo.lsym}${lh.benInfo.usym}</span></div>`;
  s+=`<div class="hex-meta">宫：${lh.palace.palace}　世：第${lh.palace.world}爻　应：第${lh.palace.ying}爻　类型：${lh.palace.type}</div>`;
  s+=`<div class="hex-mean">${HEX_MEAN[lh.benInfo.name]||''}</div>`;
  s+=`<div class="hex-name">变卦：<b>${lh.bianInfo.name}</b> <span class="hx">${lh.bianInfo.lsym}${lh.bianInfo.usym}</span>　动爻：第${lh.yao}爻</div>`;
  s+=`<div class="hex-mean">${HEX_MEAN[lh.bianInfo.name]||''}</div></div>`;
  return s;
}

function renderHex(BZ){
  let life; try{ life=lifeHex(BZ); }catch(e){ return ''; }
  // 流年卦：用实际所处大运（按年龄推算）。注：所选大运 BZ.curDy 当前恒为 null，故不另分支。
  let yunGz=null, years=[], yunLabel='';
  try{
    const ay=getActiveYun(BZ);
    if(ay && ay.step){ yunGz=ay.step.gz; years=ay.years; yunLabel=ay.step.gz; }
  }catch(e){}
  let h=`<details class="mh-ref" id="zrZhongShenGua" open><summary>终身卦 流年卦</summary>`;
  h+=`<div class="hex-h">终身卦（本命卦）</div><div class="hex-card">${hexBody(life)}</div>`;
  if(yunGz && years.length){
    h+=`<div class="hex-h">流年卦（当前大运 ${yunLabel} 十年）</div><div class="dyn-scroll"><table class="score-tbl hex-tbl"><thead><tr><th>流年</th><th>本卦</th><th>变卦</th><th>动爻</th><th>卦义</th></tr></thead><tbody>`;
    years.forEach(Y=>{
      const lh=liuNianHex(BZ, yearGz(Y));
      h+=`<tr><td class="yun-gz">${Y} ${yearGz(Y)}</td><td>${lh.benInfo.name}<br><span class="hx">${lh.benInfo.lsym}${lh.benInfo.usym}</span></td><td>${lh.bianInfo.name}<br><span class="hx">${lh.bianInfo.lsym}${lh.bianInfo.usym}</span></td><td>第${lh.yao}爻</td><td class="hex-mean">${HEX_MEAN[lh.benInfo.name]||''}</td></tr>`;
    });
    h+=`</tbody></table></div>`;
  } else {
    h+=`<div class="hex-h">流年卦</div><div class="sub-note">流年卦需确认出生时间（或四柱模式确认候选日期）后，按当前（或所选）大运十年逐岁起卦。</div>`;
  }
  h+=`</details>`;
  return h;
}

/* ============ 三、用神损益透明评分（大运 0-100 / 前后五年 / 流年合成实际分） ============ */
// 统一喜忌口径：优先综合/顺势（synthesis，特殊格=顺势、普通格=扶抑），回落扶抑原值（中和盘两皆空）
function effXi(A){ return (A.synthesis&&A.synthesis.xiWxEff&&A.synthesis.xiWxEff.length)?A.synthesis.xiWxEff:(A.xiWx||[]); }

function effJi(A){ return (A.synthesis&&A.synthesis.jiWxEff&&A.synthesis.jiWxEff.length)?A.synthesis.jiWxEff:(A.jiWx||[]); }

function wxW(w, A){ const xi=effXi(A), ji=effJi(A); return xi.indexOf(w)>=0?1 : ji.indexOf(w)>=0?-1 : 0; }

/* ============ 顶层格局取用判定（唯一归集，各处直接调用，杜绝各模块重复判"外格/杂格+喜忌"） ============
 * 命名带 ge 前缀规避 BZ 分析器内部局部 wxTag/wxXi/wxJi（如 bazi-core 五行"利/慎/平"语义的同名函数），
 * 保证全局唯一、跨函数可靠调用。 */
// 格局三模式：扶抑(普通格，身强弱参与) / 顺势(外格，专旺/从格/化气，弃命不扶身) / 本格(杂格，以本格喜忌为主)
function geGeMode(A){ return { isOuter: !!(A.outer&&A.outer.isOuter), isZaGe: !!A.isZaGe }; }
// 五行 wx 在命局是否喜（含外格"从喜"） / 忌（含"从忌"），synthesis 唯一直源，对普通/外格/杂格均已正确
function geWxXi(wx, A){ return effXi(A).indexOf(wx)>=0; }
function geWxJi(wx, A){ return effJi(A).indexOf(wx)>=0; }
// 五行取向标签：外格=从喜/从忌（弃命顺势），普通/杂格=喜用/忌神（扶抑正称）；无涉统一"喜忌无涉"
function geWxTag(wx, A){
  if(geWxXi(wx,A)) return geGeMode(A).isOuter?'从喜':'喜用';
  if(geWxJi(wx,A)) return geGeMode(A).isOuter?'从忌':'忌神';
  return '喜忌无涉';
}

// 用神损益评分权重：天干（本气）±12、地支本气±10、地支中气/余气±5（中余气同权）
const SCORE_GAN_W = 12;

const SCORE_ZHI_BEN_W = 10;

const SCORE_ZHI_HIDE_W = 5;

function pillarScoreParts(gz, A){
  const g=gz[0], z=gz[1];
  const gp=SCORE_GAN_W*wxW(GAN_WX[g], A);
  const z0=(effXi(A).indexOf(GAN_WX[g])>=0?'喜':(effJi(A).indexOf(GAN_WX[g])>=0?'忌':'中'));
  const parts=[`天干${g}（${z0}${gp>=0?'+':''}${gp}）`];
  const hide=HIDE[z]||[z];
  let zp=0; const zps=[];
  hide.forEach((hh,i)=>{ const d=(i===0?SCORE_ZHI_BEN_W:SCORE_ZHI_HIDE_W)*wxW(GAN_WX[hh], A); zp+=d; const zc=(effXi(A).indexOf(GAN_WX[hh])>=0?'喜':(effJi(A).indexOf(GAN_WX[hh])>=0?'忌':'中')); zps.push(`${hh}(${zc}${d>=0?'+':''}${d})`); });
  parts.push(`地支${z}[${zps.join(' ')}]`);
  const full=clampScore(SCORE_BASE + gp + zp);
  const front=clampScore(SCORE_BASE + gp*SPLIT_GAN_W + zp*SPLIT_ZHI_W);
  const back=clampScore(SCORE_BASE + gp*SPLIT_ZHI_W + zp*SPLIT_GAN_W);
  return {full, front, back, parts};
}

function getActiveYun(BZ){
  let dy; try{ dy=baziDaYunSteps(BZ); }catch(e){ return null; }
  if(!dy || !dy.steps || !dy.steps.length) return null;
  const real=dy.steps.filter(s=>s.gz && !s.empty);
  if(!real.length) return {dy, step:null, years:[]};
  // 与页面"大运，流年"一致：按大运起始年区间判定当前大运（当前公历年落入 [起始年, 起始年+10) 者）。
  // 年龄口径存在 ±1 虚岁/节令偏差，换运边界易错选，故统一用公历年判定。
  const curY=new Date().getFullYear();
  const step=real.filter(s=>s.year>0 && s.year<=curY).pop() || real[0];
  let years=[];
  if(step && step.year && step.year>0){ for(let k=0;k<10;k++) years.push(step.year+k); }
  return {dy, step, years};
}

/* ============ 四、十神定位论断（四柱宫位） ============ */
const SHEN_TEXT={
  '正官':'守正尽责，利名望与规管，宜循规蹈矩',
  '七杀':'果敢有魄，压力与机遇并存，宜制化以用',
  '正印':'仁厚得荫，利学业长辈，宜养德蓄能',
  '偏印':'思巧多谋，利专长偏业，宜防孤僻',
  '正财':'勤勉生财，重实务积蓄，宜稳进理财',
  '偏财':'外缘之财，利流动机遇，宜把握亦防散',
  '食神':'温润生才，利技艺表达，宜顺性而为',
  '伤官':'才思外显，利创新表露，宜收敛锋芒',
  '比肩':'同气相助，利同辈伙伴，宜合作亦防分',
  '劫财':'争中得助，利行动进取，宜防争夺'
};

function renderShiShenPos(BZ){
  const dg=BZ.dayGan;
  const dwx=GAN_WX[dg];
  const isMale = (BZ.sex===1||BZ.sex==='男'||BZ.sex===true||BZ.sex==='1');
  const pos=[{lbl:'年柱',g:BZ.gans[0],z:BZ.zhis[0],gong:'祖上宫'},
    {lbl:'月柱',g:BZ.gans[1],z:BZ.zhis[1],gong:'父母兄弟宫'},
    {lbl:'日柱',g:BZ.gans[2],z:BZ.zhis[2],gong:'自身配偶宫'},
    {lbl:'时柱',g:BZ.gans[3],z:BZ.zhis[3],gong:'子女宫'}];
  // 每宫十神（天干 + 地支本气）带五行，供相互作用分析
  const cell=pos.map(p=>{
    // 日柱天干即日主自身（"我"），不算十神、不判喜忌，避免"日干甲为比肩，忌神"式自指错误
    // 仅 p.g===dg 会把年/时干与日干同字者（比肩）误判为日主，故须同时锚定 lbl==='日柱'
    const isSelf=(p.g===dg && p.lbl==='日柱');
    const tg=isSelf ? null : tenGod(dg,p.g);
    const tz=tenGod(dg,zhiMain(p.z));
    return {lbl:p.lbl, gong:p.gong, g:p.g, z:p.z, tg, tgW:GAN_WX[p.g], tz, tzW:GAN_WX[zhiMain(p.z)], isSelf};
  });
  // 喜忌：取日主有效喜忌（synthesis：普通格=扶抑、特殊格=顺势）；天干十神五行 = 该十神类别五行，直接查集判定
  const A=getAnalysis(BZ);
  const xiWxSet=new Set(effXi(A)), jiWxSet=new Set(effJi(A));
  const tendOfWx=wx=>xiWxSet.has(wx)?'喜':(jiWxSet.has(wx)?'忌':'中');
  const tendTag=t=>t==='喜'?'喜用':(t==='忌'?'忌神':'中性');

  // 与页面 card() 渲染保持一致：引导句保留段落，各宫位行改表格
  const paras=[`以日干${dg}为基准，看各柱天干十神与地支本气十神落于何宫，综合论断六亲与人生侧重，为常规推演、仅供参考。`];
  const rows1=[];
  cell.forEach(c=>{
    if(c.isSelf){
      // 日主自身：只述自身之象，不算十神、不判喜忌（宫名在内容列，首列只留柱位）
      rows1.push([`${c.lbl}`, `${c.gong}。天干${c.g}为日主（自身），自坐${c.z}，地支本气为${c.tz}${SHEN_TEXT[c.tz]?('，'+SHEN_TEXT[c.tz]):''}。`]);
      return;
    }
    const tG=SHEN_TEXT[c.tg]||'', tZ=SHEN_TEXT[c.tz]||'';
    let s=`天干${c.g}为${c.tg}，${tendTag(tendOfWx(c.tgW))}；${tG||'常规之象'}；地支${c.z}本气为${c.tz}，${tendTag(tendOfWx(c.tzW))}`;
    if(tZ) s+=`，${tZ}`;
    s+='。';
    rows1.push([`${c.lbl}`, `${c.gong}。${s}`]);
  });

  // ===== 十神相互关系：走 REL.ten.rel 统一契约（相生 / 相克 各 5 对，十神对，非干支关系） =====
  // 双向喜忌门控（C4）：每对双方分别校验喜忌再综合损益；一方不现 → REL.ten.rel 内部 !la/!lb 对称分支处理能量缺失。
  const dwxR=GAN_WX[dg];
  const yinWxR=Object.keys(WX_SHENG).find(k=>WX_SHENG[k]===dwxR);
  const shangWxR=WX_SHENG[dwxR];
  const wealthWxR=WX_KE[dwxR];
  const killWxR=Object.keys(WX_KE).find(k=>WX_KE[k]===dwxR);
  const WXOF_R={'印星':yinWxR,'比劫':dwxR,'食伤':shangWxR,'财星':wealthWxR,'官杀':killWxR};
  const _gods=[]; BZ.gans.forEach(g=>_gods.push(tenGod(dg,g))); BZ.zhis.forEach(z=>_gods.push(tenGod(dg,zhiMain(z))));
  const _cnt=c=>_gods.filter(x=>x===c).length;
  const LQ_R={'印星':_cnt('正印')+_cnt('偏印'),'比劫':_cnt('比肩')+_cnt('劫财'),'食伤':_cnt('食神')+_cnt('伤官'),'财星':_cnt('正财')+_cnt('偏财'),'官杀':_cnt('正官')+_cnt('七杀')};
  const XI_R=new Set(effXi(A)), JI_R=new Set(effJi(A));
  const _eScore=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
  const tenE_R=_eScore?ssTenGodEnergy(BZ,_eScore):null;
  const _ctx={WXOF:WXOF_R, LQ:LQ_R, XI:XI_R, JI:JI_R, tenE:tenE_R, fuXi:effXi(A), fuJi:effJi(A)};
  const PAIR_SHENG=[['印星','比劫'],['比劫','食伤'],['食伤','财星'],['财星','官杀'],['官杀','印星']];
  const PAIR_KE=[['印星','食伤'],['比劫','财星'],['食伤','官杀'],['财星','印星'],['官杀','比劫']];
  const relItems=[];
  PAIR_SHENG.forEach(([a,b])=>relItems.push(REL.ten.rel(_ctx,a,b,'sheng')));
  PAIR_KE.forEach(([a,b])=>relItems.push(REL.ten.rel(_ctx,a,b,'ke')));
  // 十神相互关系表仅列生克组合（印生比劫…五生 + 印克食伤…五克）；经典组合（官印相生等）归入下方"十神断语"表。
  // 十神相互关系表格化：每项拆【组合：判定】两列，
  // 组合=冒号前（"印星生比劫（水生木）"），五行括号在判定列开头（"水生木。…"）；
  // 经典组合句（官印相生等无冒号）取句首组合名；判定开头"（X）："转"X，"（去括号断裂）
  // 组合名识别：①经典4名（官印/杀印/伤官配印/食伤泄秀） ②X生Y/X克Y十神对 ③正八格独名（印星/官杀/食伤…）
  const _shiShenN=['印星','比劫','食伤','财星','官杀'];
  const _comboName=s=>{
    for(const n of ['官印相生','杀印相生','伤官配印','食伤泄秀']) if(s.indexOf(n)===0) return n;
    let m=s.match(/^(印星|比劫|食伤|财星|官杀)(生|克)(印星|比劫|食伤|财星|官杀)/);
    if(m) return m[0];
    m=s.match(/^((?:印星|比劫|食伤|财星|官杀).{0,6}?(?:相生|相克|护|生|克))/);
    if(m) return m[1];
    return '';
  };
  const _comboLead=it=>{
    const i=it.indexOf('：');
    if(i>0 && i<=24) return {c:it.slice(0,i), j:it.slice(i+1)};
    const cn=_comboName(it);
    if(cn) return {c:cn, j:it.slice(cn.length)};
    return {c:'', j:it};
  };
  const _splitWx=c=>{ const m=c.match(/^(.+?)（([^）]+)）$/); return m?[m[1],m[2]]:[c,'']; };
  const _cleanJd=s=>{
    s=s.replace(/^（([^）]+)）：/,'$1，');
    s=s.replace(/^（([^）]+)）成立/,'$1成立');
    s=s.replace(/^（([^）]+)）之势在/,'$1之势在');
    return s;
  };
  const rows2=relItems.length
    ? relItems.map(it=>{
        const {c,j}=_comboLead(it);
        const [cCore,wxTxt]=_splitWx(c);
        return [cCore, (wxTxt?wxTxt+'。':'')+_cleanJd(j)];
      })
    : [['', '四柱十神之间无明显生克偏倚，气机较为调和。']];
  // 十神流转：统一用 buildCtx(BZ) 完整 ctx（含 tenCnt + tenE，与四卡同一能量口径，flowLiuzhuan 需 tenE 判每环保有力度，
  // 仅传 tenCnt 会致 E=空→五环能量全0→误判"全虚"。置于"十神相互关系"表末行）
  const _lzRow = (function(){ try{const cz=REL.tenCombo.buildCtx(BZ); const r=cz?REL.tenCombo.flowLiuzhuan(cz):null; return r?[r.label, r.say]:null;}catch(e){return null;} })();
  if (_lzRow) rows2.push(_lzRow);   // 十神流转置于表格最后一排

  // 六亲星落宫得位（正偏细分 + 性别区分 + 喜忌）
  // 日柱天干=日主自身，无十神，六亲落宫只以地支本气论（c.tg 为 null 时跳过天干分支）
  // 同十神类别临多柱时聚合判定，分宫位各主一面（年祖上/月环境/日自身/时晚运子女），以本位宫为归；禁逐柱裸列无主次
  const seatGroups={};
  cell.forEach(c=>{
    if(!c.tg) return; // 日柱天干（日主自身）不参与六亲星落宫
    const cat=shenCat(c.tg), t=tendOfWx(c.tgW);
    let text='';
    if(cat==='财星'){
      if(c.lbl==='日柱'){
        if(isMale) text=c.tg==='正财'
          ? `正财坐日支妻宫（妻星得位），主得内助、夫妻情契${t==='忌'?'；然妻星为忌，夫妻宜明算、防因财失和':''}`
          : `偏财坐日支妻宫，男命偏财为父星、外缘之财，主偏财可聚、亦防偏情分心`;
        else text=`财星坐日支夫妻宫，主自身财稳、亦利夫家之财${t==='忌'?'；然财为忌，宜节用':''}`;
      } else if(c.lbl==='时柱') text=`${c.tg}归时柱，主晚岁财厚、财有归宿${t==='喜'?'；晚景丰足':''}`;
      else if(c.lbl==='年柱') text=`${c.tg}在年柱（祖上宫），主得祖上财荫或远方之财`;
    } else if(cat==='食伤'){
      if(c.lbl==='时柱') text=`${c.tg}归时柱（子女宫），主才艺晚成、表达自如${isMale?'':'；女命食伤为子女星，主子女聪慧得力'}`;
      else if(c.lbl==='年柱'||c.lbl==='月柱') text=`${c.tg}在${c.lbl}，主早年才艺外显、以技艺立身`;
    } else if(cat==='印星'){
      if(c.lbl==='月柱'||c.lbl==='年柱') text=`${c.tg}坐${c.lbl}${c.gong}，主得${c.tg==='正印'?'生母':'偏业、偏长'}之荫${t==='喜'?'；荫庇得力':(t==='忌'?'；然印为忌，过荫反惰':'')}`;
      else if(c.lbl==='时柱') text=`${c.tg}在时柱，主晚年仍得荫、学养绵长`;
    } else if(cat==='官杀'){
      if(c.lbl==='月柱') text=`${c.tg}透月柱（父母宫），主事业有凭、得长辈引拔${t==='喜'?'；官杀得力':(t==='忌'?'；然官为忌，事业压力显':'')}`;
      else if(c.lbl==='日柱'){
        if(isMale) text=`${c.tg}坐日支妻宫，男命官杀非夫星，主妻性刚、或妻家有权势`;
        else text=`${c.tg}坐日支夫宫，${c.tg==='正官'?'夫星得位，主得良配、夫凭可倚':'七杀为偏夫，主情缘有波、宜择稳'}`;
      } else if(c.lbl==='时柱') text=`${c.tg}归时柱，主晚岁名望、职权可守`;
    } else if(cat==='比劫' && (c.lbl==='年柱'||c.lbl==='月柱')) text=`${c.tg}在${c.lbl}${c.gong}，主${c.tg==='比肩'?'兄弟同心、互助分进':'兄弟争进、亦防分夺'}${t==='喜'?'；同辈得力':(t==='忌'?'；然比劫为忌，同辈分财':'')}`;
    if(text) (seatGroups[cat]=seatGroups[cat]||[]).push({lbl:c.lbl, gong:c.gong, tg:c.tg, text});
  });
  // 本位宫：官杀（女命）/印星/比劫以月柱为归（父母兄弟宫），食伤/官杀（男命）以时柱为归（子女宫），财星以日支为归（妻宫/自身宫）
  const _home=cat=>{
    if(cat==='食伤') return '时柱';
    if(cat==='印星'||cat==='比劫') return '月柱';
    if(cat==='官杀') return isMale?'时柱':'月柱';
    if(cat==='财星') return '日柱';
    return '';
  };
  // 六亲星落宫得位（固定 5 排 比劫/食伤/财星/官杀/印星，每排干透支藏合并表述、只显 5 排）
  const SHOW_NAME={'比劫':'比劫','食伤':'食伤','财星':'财星','官杀':'官杀','印星':'印星'};
  const ORDER6=['比劫','食伤','财星','官杀','印星'];
  const PAL=['年','月','日','时'];
  const _zhiHome={'财星':'主财藏支中、待岁运引出','官杀':'主事业根基在支、宜稳扎','印星':'主荫庇暗藏','食伤':'主才华内敛','比劫':'主同辈之基在支'};
  // 地支藏干按类聚合（气不显、主暗藏之应；与命局断事"财藏支中待岁运引出"等口径一致）
  const _zhiByCat={};
  BZ.zhis.forEach((z,i)=>{
    (HIDE[z]||[]).forEach((hg,k)=>{
      if(!hg) return;
      const cat=shenCat(tenGod(dg,hg));
      if(!cat) return;
      const qk=k===0?'本气':k===1?'中气':'余气';
      (_zhiByCat[cat]=_zhiByCat[cat]||[]).push({hg, z, i, qk, t:tendOfWx(GAN_WX[hg])});
    });
  });
  const rows3=[];
  ORDER6.forEach(cat=>{
    const parts=[];
    // 天干透出（seatGroups 聚合句）
    const tian=seatGroups[cat];
    if(tian&&tian.length){
      let txt;
      if(tian.length===1){ txt=tian[0].text; }
      else {
        const home=_home(cat);
        const mi=tian.findIndex(i=>i.lbl===home);
        const main=mi>=0?tian.splice(mi,1)[0]:tian.shift();
        const rest=tian;
        txt=`${SHOW_NAME[cat]}临${[main].concat(rest).map(i=>i.lbl).join('、')}，分宫位各主一面：${[main].concat(rest).map(i=>i.text).join('；')}。以${main.lbl}（${main.gong}）为本位主判，余柱所主为参`;
      }
      parts.push('天干'+txt.replace(/[。；\s]+$/,''));
    }
    // 地支藏干（聚合为一段，按天干分组、同干省略重复）
    const zhi=_zhiByCat[cat]||[];
    if(zhi.length){
      const ts=new Set(zhi.map(x=>x.t));
      const tail=ts.size===1 ? (zhi[0].t==='喜'?'，为喜用、藏而待用':zhi[0].t==='忌'?'，为忌神、藏而不显反安':'') : '';
      const byGan={};
      zhi.forEach(x=>{ (byGan[x.hg]=byGan[x.hg]||[]).push(x); });
      const ganParts=Object.keys(byGan).map(gan=>{
        const items=byGan[gan];
        const head=`${gan}藏${PAL[items[0].i]}支${items[0].z}（${items[0].qk}）`;
        const rest=items.slice(1).map(x=>`${PAL[x.i]}支${x.z}（${x.qk}）`);
        return head+(rest.length?'、'+rest.join('、'):'');
      });
      parts.push(ganParts.join('，')+'，'+( _zhiHome[cat]||'主其气内藏')+tail);
    }
    if(!parts.length){
      // 天干地支均不现：不仅列"不现"，补该十神之喜忌意义（决定岁运引出时是福是祸，与命局断事财官口径一致）
      const cwx=WXOF_R[cat]||'';
      const cXi=cwx&&xiWxSet.has(cwx), cJi=cwx&&jiWxSet.has(cwx);
      const NONE_MEAN={
        '财星':cXi?'天干地支均不现，待岁运引出（所引为喜用，逢财旺之运得财）':cJi?'天干地支均不现（反免其扰，财为忌不现则宜守、忌引动破财）':'天干地支均不现，喜忌无涉、待岁运引出',
        '官杀':cXi?'天干地支均不现，待岁运引出（所引为喜用，逢官杀之运名位可得）':cJi?'天干地支均不现（反免其扰，官为忌不现则免权贵之累）':'天干地支均不现，喜忌无涉、待岁运引出',
        '印星':cXi?'天干地支均不现，待岁运引出（所引为喜用，逢印运得荫庇学养）':cJi?'天干地支均不现（反免其扰，印为忌不现则无过荫之惰）':'天干地支均不现，喜忌无涉、待岁运引出',
        '食伤':cXi?'天干地支均不现，待岁运引出（所引为喜用，逢食伤之运才艺得展）':cJi?'天干地支均不现（反免其扰，食伤为忌不现则免口舌耗神）':'天干地支均不现，喜忌无涉、待岁运引出',
        '比劫':cXi?'天干地支均不现，待岁运引出（所引为喜用，逢比劫之运得同侪之助）':cJi?'天干地支均不现（反免其扰，比劫为忌不现则免分财竞利）':'天干地支均不现，喜忌无涉、待岁运引出'
      }[cat]||'天干地支均不现';
      parts.push(NONE_MEAN);
    }
    rows3.push([SHOW_NAME[cat], parts.join('。')+'。']);
  });

  // 三块表格统一 .stab 两列样式（与人生议题表格同款；首列短标签，次列判定）
  const _tbl=(t1,t2,rows,cls)=>rows.length
    ? `<div class="tbl-wrap"><table class="stab${cls?' '+cls:''}"><tr><th>${t1}</th><th>${t2}</th></tr>${rows.map(r=>'<tr><td class="lbl">'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('')}</table></div>`
    : '';
  // ， 十神断语表（表二）：复用 REL.tenCombo 顶层判定，统一 ctx ，
  const _gCntD={}; _gods.forEach(g=>{_gCntD[g]=(_gCntD[g]||0)+1;});
  const _xjWxD={}; for(const k in WXOF_R){ _xjWxD[k]=xiWxSet.has(WXOF_R[k])?'喜':(jiWxSet.has(WXOF_R[k])?'忌':'中'); }
  const _strD = (A && A.strength) ? (A.strength.includes('强')?'强':A.strength.includes('弱')?'弱':'中') : '中';
  const _duanCtx={ BZ, A, fuXi:[...xiWxSet], fuJi:[...jiWxSet], tenCnt:LQ_R, gCnt:_gCntD, xjWx:_xjWxD, tenE:tenE_R, strength:_strD, isMale };
  const _duanHits=REL.tenCombo.matchAll(_duanCtx);
  // 按关系名合并（同名多条=同一关系的不同喜忌/身弱分支，判定列并列、关系名只显示一次）
  const _duanMerged={};
  _duanHits.forEach(h=>{ if(!_duanMerged[h.name]) _duanMerged[h.name]=h.say; else if(_duanMerged[h.name].indexOf(h.say)<0) _duanMerged[h.name]+='；'+h.say; });
  const rowsDua=Object.keys(_duanMerged).length ? Object.keys(_duanMerged).map(n=>[n,_duanMerged[n]]) : [['','四柱十神之间无可构成的关系断语，气机较为平淡。']];

  const h=`<div class="life-card shishen-card"><h5>十神宫位</h5>`
    + `<div class="nayin-h">基础关系</div>`
    + _tbl('宫位','内容',rows1,'stab-gw')
    + `<div class="sub-note">${paras[0]}</div>`
    + `<div class="nayin-h">十神相互关系</div>`
    + _tbl('组合','判定',rows2)
    + `<div class="nayin-h">十神断语</div>`
    + _tbl('关系','判定',rowsDua,'stab-ssd')
    + `<div class="nayin-h">六亲星落宫得位</div>`
    + _tbl('六亲','得位判定',rows3,'stab-gw')
    + `</div>`;
  return h;
}

/* 八字排盘全局公共工具层（lunar.js 模式：经典 <script>，全局函数）
 *
 * 集中承载全站共享的纯函数与记忆化引擎，避免各模块（bazi-page / career / marry）
 * 重复推导已算出的事实（配偶星、五行关系、十神关系、十二长生、旺衰分析等）。
 *
 * 依赖全局（须在本文件之前加载）：bazi-data.js（引擎）、gua.js（卦，供称骨、卦模块）
 *   baziAnalysis / tenGod / zhiMain / GAN_WX / ZHI_WX / WX_SHENG / WX_KE / getChangSheng
 *
 * 纪律：新的“派生事实 / 工具函数”须先写进本文件，各模块直接调用，
 *       禁止在模块内重新推导或复制本文件已有的函数。
 */
/* ---------- 引擎记忆化：同一 BZ 只跑一次 baziAnalysis（全站约 16 处调用共享）---------- */
  var _analysisCache = new WeakMap();

  function getAnalysis(BZ){
    if(BZ && typeof BZ === 'object'){
      if(_analysisCache.has(BZ)) return _analysisCache.get(BZ);
      var A = baziAnalysis(BZ);
      _analysisCache.set(BZ, A);
      return A;
    }
    return baziAnalysis(BZ);
  }

  window.getAnalysis = getAnalysis;

  /* ---------- 两五行关系（以 base 为“我”）：比和 / 生我 / 我生 / 克我 / 我克 ---------- */
  function wxRel(base, w){
    if(!base || !w) return { rel:'', tone:'' };
    if(w === base) return { rel:'比和', tone:'平' };
    if(WX_SHENG[w] === base) return { rel:'生我', tone:'吉' };
    if(WX_SHENG[base] === w) return { rel:'我生', tone:'耗' };
    if(WX_KE[w] === base) return { rel:'克我', tone:'制' };
    if(WX_KE[base] === w) return { rel:'我克', tone:'得' };
    return { rel:'', tone:'' };
  }

  window.wxRel = wxRel;

  /* ---------- 某五行相对日主的关系（标准短语）---------- */
  function relToDay(dwx, w){
    if(!w) return '';
    if(w === dwx) return '比和';
    if(WX_KE[w] === dwx) return '被日主所克';
    if(WX_KE[dwx] === w) return '克日主';
    if(WX_SHENG[w] === dwx) return '生日主';
    if(WX_SHENG[dwx] === w) return '日主所生';
    return '';
  }

  window.relToDay = relToDay;

  /* ---------- 某五行相对日主的关系（短关系词，供 marry 模块组句）---------- */
  function relShort(dwx, X){
    if(X === dwx) return '比和';
    if(WX_KE[X] === dwx) return '克日主';
    if(WX_SHENG[X] === dwx) return '生日主';
    if(WX_KE[dwx] === X) return '日主所克';
    if(WX_SHENG[dwx] === X) return '日主所生';
    return '比和';
  }

  window.relShort = relShort;

  /* ---------- 某五行相对日主的关系（ marriage 解读短语）---------- */
  function notePhrase(dwx, X){
    var r = relShort(dwx, X);
    if(r === '克日主') return '表示配偶容易带来规则约束，或和子女、事业压力有关';
    if(r === '生日主') return '表示配偶务实、关系偏实际，不尚虚谈';
    if(r === '日主所生') return '表示关系中多付出包容，但也可能比较耗神';
    if(r === '日主所克') return '表示关系中日主占主导、容易驾驭对方，注意不要独断';
    return '表示相处像朋友、适合共同承担';
  }

  window.notePhrase = notePhrase;

  /* ---------- 配偶星（夫妻宫本气十神）：日支本气之十神 ---------- */
  function spouseStarOf(BZ){ return tenGod(BZ.dayGan, zhiMain(BZ.dayZ)); }

  window.spouseStarOf = spouseStarOf;

  function isWetEarth(z){ return z==='辰'||z==='丑'; }

  function isDryEarth(z){ return z==='戌'||z==='未'; }

  window.isWetEarth = isWetEarth;

  window.isDryEarth = isDryEarth;

  /* ---------- 巳火变色龙（巳为阴火，本气丙、藏庚戊，随局合化而变其性）----------
     输出为"命局断事"用的后果句：点明巳火因何变格、及其对日主/喜用/忌神的实际影响。
     无显著合化（仅孤立巳）则不输出，避免无意义的机制罗列。 */
  function siHuoNote(BZ){
    if(!BZ.zhis.includes('巳')) return null;
    const A=getAnalysis(BZ), dayWx=GAN_WX[BZ.dayGan], dg=BZ.dayGan;
    const xi=new Set(effXi(A)), ji=new Set(effJi(A));
    const zs=BZ.zhis;
    let trans=null, wx=null;
    if(zs.includes('酉') && zs.includes('丑')){ trans='巳酉丑三合金局成，巳火随金化、失火性而带金气'; wx='金'; }
    else if(zs.includes('午') && zs.includes('未')){ trans='巳午未三会火局成，巳火势炽、火性愈显'; wx='火'; }
    else if(zs.includes('申')){ trans='巳申六合化水，巳火带水润之机'; wx='水'; }
    else {
      const parts=[];
      if(zs.includes('酉')) parts.push('见酉带合金意向、火性向金偏转');
      if(zs.includes('丑')) parts.push('见丑湿土晦火、金库收火');
      if(zs.includes('午')) parts.push('见午火火相叠、火性转盛');
      if(zs.includes('未')) parts.push('见未燥土晦火余热、带火土之燥');
      if(!parts.length) return null; // 孤立巳、无明确变格，不强行断
      trans=parts.join('，')+'，巳火暂随局微变其性';
    }
    let eff='';
    if(wx){
      if(wx===dayWx) eff='，日主'+dg+'（'+dayWx+'）由此得势';
      else if(xi.has(wx)) eff='，喜用'+wx+'得此助而有力';
      else if(ji.has(wx)) eff='，忌神'+wx+'得此助而势张、须防';
      else eff='，'+wx+'势为之增';
    }
    return '巳火变色龙：'+trans+eff+'。';
  }

  window.siHuoNote = siHuoNote;

 /* ---------- 两地支关系类型（单一真源：冲 / 害 / 破 / 刑 / 合 / 暗合）---------- */
  // 全站所有"两支柱之间的关系"检测（太岁、关系表、婚姻宜忌、地支关系段）统一走此函数，
  // 避免各模块各自重列 DIZHI_CHONG/HAI/PO/XING/HE6/ANHE 造成语义漂移。
  // 仅判定关系类型，不携带化神、刑名等展示信息（由调用方按需补充）。
  // 三合 / 三会为三支柱合局，不在本函数范围（由 zhiRelations 渲染）。
  function zhiRelTypes(z1, z2){
    const out = [];
    const chong = pairIn(z1, z2, DIZHI_CHONG);
    if(chong) out.push('冲');
    if(pairIn(z1, z2, DIZHI_HAI))   out.push('害');
    if(pairIn(z1, z2, DIZHI_PO))    out.push('破');
    if(pairIn(z1, z2, DIZHI_ANHE))  out.push('暗合');
    if(DIZHI_HE6.some(g=>(g[0]===z1&&g[1]===z2)||(g[0]===z2&&g[1]===z1))) out.push('合');
    if(z1===z2){ if(DIZHI_XING.some(g=>g.length<2 && g.indexOf(z1)>=0)) out.push('刑'); }
    // 刑：若此对同时是相冲，则"论冲不论刑"：相冲激烈、直接、明确，刑力被其覆盖；
    // 仅于寅巳申、丑戌未全成三刑时，刑作为相冲后之持续效果论（三刑汇总见 bazi-data 结构病药）。
    else if(DIZHI_XING.some(g=>g.length>=2 && g.indexOf(z1)>=0 && g.indexOf(z2)>=0) && !chong) out.push('刑');
    return out;
  }

  window.zhiRelTypes = zhiRelTypes;

// == M2 分值常量 ==
const GAN_BASE      = 36;

const ZHI_BEN_YUE   = 70, ZHI_BEN_OTHER = 40;

const ZHONG_QI      = 15, ZHONG_QI_ONLY = 25, YU_QI = 10;

const MONTH_COEF    = {旺:1.2, 相:1.1, 休:0.8, 囚:0.7, 死:0.5};

// 通根：天干自坐 禄(临官)/刃(帝旺) 地支时，该天干分 ×1.5
const TONGGEN = {
  甲:['寅','卯'], 乙:['卯','寅'], 丙:['巳','午'], 戊:['巳','午'],
  丁:['午','巳'], 己:['午','巳'], 庚:['申','酉'], 辛:['酉','申'],
  壬:['亥','子'], 癸:['子','亥']
};

// 合化五行（六合化神 / 三合化神），用于局势修正分归户
const HEHUA_WX = {'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'火'};

const SANHE_WX = {申:'水',子:'水',辰:'水', 亥:'木',卯:'木',未:'木', 寅:'火',午:'火',戌:'火', 巳:'金',酉:'金',丑:'金'};

const SANHUI   = [
  {grp:['寅','卯','辰'], wx:'木'}, {grp:['巳','午','未'], wx:'火'},
  {grp:['申','酉','戌'], wx:'金'}, {grp:['亥','子','丑'], wx:'水'}
];

// 月令系数：复用 bazi-data.js 的 wangXiang 得 旺/相/休/囚/死 标签，再映射系数
function monthCoef(wx, monthZ){
  const w = (typeof wangXiang === 'function') ? wangXiang(monthZ)[wx] : null;
  return MONTH_COEF[w] != null ? MONTH_COEF[w] : 1.0;
}

// M2-3 局势修正分（合冲会刑量化，分配到相关五行；系数参考文章，柱位远近衰减 紧贴/隔/遥）
function wxJuScore(zhis, monthZ){
  const out = {木:0,火:0,土:0,金:0,水:0};
  const wAdj = (d,full)=> d===1 ? full : (d===2 ? full*0.5 : full*0.25);
  const zWx  = z => ZHI_WX[z];
  // 三会：三字全且月令非死/囚 → 旺/相+80，休+50，囚死+0
  SANHUI.forEach(({grp, wx})=>{
    if(grp.every(z=>zhis.includes(z))){
      const m = wangXiang(monthZ)[wx];
      out[wx] += (m==='旺'||m==='相') ? 80 : (m==='休' ? 50 : 0);
    }
  });
  // 三合：全成局得月令支持 +60；半合(见二) +40
  [['申','子','辰'],['亥','卯','未'],['寅','午','戌'],['巳','酉','丑']].forEach(g=>{
    const hit = g.filter(z=>zhis.includes(z)).length;
    if(hit===3){ const wx=SANHE_WX[g[0]]; out[wx] += (wangXiang(monthZ)[wx]!=='死' && wangXiang(monthZ)[wx]!=='囚') ? 60 : 0; }
    else if(hit===2){ out[SANHE_WX[g[0]]] += 40; }
  });
  // 六合 → 化神五行 +30
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    const a=zhis[i], b=zhis[j];
    if(LIUHE[a]===b){ const hw = HEHUA_WX[a+LIUHE[a]]!=null ? HEHUA_WX[a+LIUHE[a]] : HEHUA_WX[LIUHE[a]+a]; if(hw) out[hw]+=30; }
  }
  // 六冲/刑/害 → 负向，分配到两柱本气五行（按柱位远近衰减）
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    const a=zhis[i], b=zhis[j], d=Math.abs(i-j);
    if(DIZHI_CHONG.some(([x,y])=>(a===x&&b===y)||(a===y&&b===x))){
      const v=wAdj(d,20); out[zWx(a)]-=v; out[zWx(b)]-=v;
    }
    if(zhiRelTypes(a,b).includes('刑')){
      const v=wAdj(d,8); out[zWx(a)]-=v; out[zWx(b)]-=v;
    }
    DIZHI_HAI.forEach(([x,y])=>{ if((a===x&&b===y)||(a===y&&b===x)){ const v=wAdj(d,3); out[zWx(a)]-=v; out[zWx(b)]-=v; } });
  }
  return out;
}

// M2 单个五行能量分（四步法）
function wxElementScore(BZ){
  const {gans, zhis, monthZ} = BZ;
  const score = {木:0,火:0,土:0,金:0,水:0};
  const base  = {木:0,火:0,土:0,金:0,水:0};   // 存在性基础分（仅含步骤1-2，不含局势修正；用于存在性地板判定）
  // 1) 天干分 = 36 × 月令系数(该干五行) × 通根系数(自坐禄刃)
  gans.forEach((g, i)=>{
    const wx = GAN_WX[g];
    const z  = zhis[i];                       // 同柱地支
    const tg = (TONGGEN[g] && TONGGEN[g].includes(z)) ? 1.5 : 1.0;
    const v  = GAN_BASE * monthCoef(wx, monthZ) * tg;
    score[wx] += v; base[wx] += v;
  });
  // 2) 藏干分：本气(月支70/其他40) + 中气(15 或 仅本气+中气时25) + 余气(10)
  zhis.forEach((z, i)=>{
    const hide = HIDE[z] || [];
    const ben  = (i===1) ? ZHI_BEN_YUE : ZHI_BEN_OTHER;   // i===1 为月支
    hide.forEach((h, k)=>{
      const wx = GAN_WX[h];
      let w;
      if(k===0)            w = ben;                        // 本气
      else if(k===1)       w = (hide.length===2 ? ZHONG_QI_ONLY : ZHONG_QI); // 中气
      else                 w = YU_QI;                      // 余气
      const v = w * monthCoef(wx, monthZ);
      score[wx] += v; base[wx] += v;
    });
  });
  // 3) 局势修正分（合冲会刑量化，分配到相关五行）
  const ju = wxJuScore(zhis, monthZ);
  for(const wx in ju){ score[wx] += ju[wx]; }
  // 4) 存在性地板：五行在干支中确有出现，则其能量分绝不可被冲/刑/害削至 0；
  //    至少保留“存在性基础分 × PRESENCE_FLOOR”的正分，以表达“存在但不旺 / 受冲克受损”。
  //    真不存在的五行（base=0）：无局势正分则保持 0，得三合/三会/六合正分则为正当之旺，负数归零。
  //    负向局势修正超过基础分即会被抹零，故设存在性地板保留正分，表达"存在但不旺 / 受冲克受损"。
  const PRESENCE_FLOOR = 0.08;
  for(const wx in score){
    if(base[wx] > 0){
      const floorV = base[wx] * PRESENCE_FLOOR;
      if(score[wx] < floorV) score[wx] = floorV;
    } else if(score[wx] < 0){
      score[wx] = 0;
    }
  }
  return score;
}

// M2b 十神能量分：与 wxElementScore 同源（天干 36×月令×通根 + 藏干本中余×月令，常量完全一致），
// 按十神粒度累加，再以五行能量分 eScore 做残差校正（把局势修正分，以及被排除的日干天干分，
// 按比例补回十神能量），使十神能量和＝五行能量分。日干(i=2)不计入十神（日主本身非十神），
// 其天干分随残差校正并入对应十神能量；其余逻辑与 wxElementScore 步骤 1、2 严格一致，避免两处常量漂移。
function ssTenGodEnergy(BZ, eScore){
  const {gans, zhis, monthZ} = BZ;
  const dg = BZ.dayGan;
  const dwx = GAN_WX[dg];
  const ctrlWx = Object.keys(WX_KE).find(k=>WX_KE[k]===dwx);
  const genWx  = Object.keys(WX_SHENG).find(k=>WX_SHENG[k]===dwx);
  const SS_ENERGY = {'比肩':0,'劫财':0,'食神':0,'伤官':0,'正财':0,'偏财':0,'七杀':0,'正官':0,'偏印':0,'正印':0};
  const baseByWx = {木:0,火:0,土:0,金:0,水:0};
  const occE = (g, z, i, k)=>{            // k<0 天干；k≥0 藏干层级(0本/1中/2余)
    const wx = GAN_WX[g];
    let v;
    if(k<0){ const tg=(TONGGEN[g]&&TONGGEN[g].includes(z))?1.5:1.0; v=GAN_BASE*monthCoef(wx,monthZ)*tg; }
    else { const hide=HIDE[z]||[]; const ben=(i===1)?ZHI_BEN_YUE:ZHI_BEN_OTHER;
      v = (k===0?ben : (k===1?(hide.length===2?ZHONG_QI_ONLY:ZHONG_QI) : YU_QI)) * monthCoef(wx,monthZ); }
    baseByWx[wx]+=v; return v;
  };
  // 天干分：前三柱为对应十神，日干(i=2)无十神、其天干分归入"比肩"（日主自身＝比劫/同我，避免日主五行被漏计）
  [0,1,2,3].forEach(i=>{ const g=gans[i]; if(!g)return; SS_ENERGY[i===2?'比肩':tenGod(dg,g)] += occE(g, zhis[i], i, -1); });
  zhis.forEach((z,i)=>{ (HIDE[z]||[]).forEach((h,k)=>{ SS_ENERGY[tenGod(dg,h)] += occE(h, z, i, k); }); });
  // 残差校正：eScore 含局势修正分(及日干天干分)，按各十神在元素内的占比补回，使十神能量和＝五行能量分
  const SS2WX = {'比肩':dwx,'劫财':dwx,'食神':WX_SHENG[dwx],'伤官':WX_SHENG[dwx],'正财':WX_KE[dwx],'偏财':WX_KE[dwx],'七杀':ctrlWx,'正官':ctrlWx,'偏印':genWx,'正印':genWx};
  ['木','火','土','金','水'].forEach(w=>{ const base=baseByWx[w]; const res=(eScore[w]||0)-base;
    if(base>1e-9){ Object.keys(SS_ENERGY).forEach(s=>{
      if(SS2WX[s]===w && SS_ENERGY[s]>0) SS_ENERGY[s] += res*(SS_ENERGY[s]/base); }); }
  });
  // 防负兜底：残差校正（尤其冲/刑扣分使 eScore<base 时，res 为负）可能把占比高的十神能量压至负值，
  // 与五行存在性地板一致，任何十神能量不得为负，至少保留存在性正分。
  Object.keys(SS_ENERGY).forEach(s=>{ SS_ENERGY[s] = Math.max(0, SS_ENERGY[s]); });
  return SS_ENERGY;
}

// M3 强弱分档阈值：以五行能量分均值为基准，高于 HI 倍为强、低于 LO 倍为弱，其间为中。
// 全站唯一定义，wxStrength 与各解读模块共用，避免阈值多处手写而漂移。
const WX_TIER_HI = 1.4;

const WX_TIER_LO = 0.7;

// M3 强弱（由分数相对均值派生；失衡判定另走分数比值，见 wxBalance）
function wxStrength(BZ){
  const sc = wxElementScore(BZ);
  const vals = Object.values(sc);
  const avg = vals.reduce((a,b)=>a+b,0) / vals.length;
  const r = {};
  for(const wx in sc){ r[wx] = (sc[wx] > WX_TIER_HI*avg) ? '强' : (sc[wx] < WX_TIER_LO*avg ? '弱' : '中'); }
  return r;
}

// M3b 五行能量档（按能量占比分五档）：真缺 / 平和而势弱 / 平和 / 偏旺 / 过旺。
// 阈值 0 / 0.10 / 0.20 / 0.40，与量化四柱、婚姻④、合婚五行互补同口径；全站唯一定义。
// 判定一律用占比，禁按五行个数。个数受藏干计数口径影响，与能量占比可明显背离（土常虚高）。
function wxTier(eS, wx){
  const e = (eS && eS[wx]) || 0;
  const tot = Object.values(eS || {}).reduce((a,b)=>a+b,0) || 1;
  if(e <= 1e-6) return '真缺';
  const p = e / tot;
  return p < 0.10 ? '平和而势弱' : (p <= 0.20 ? '平和' : (p <= 0.40 ? '偏旺' : '过旺'));
}

// M4 五行失衡（由【分数比值】判 克之太过/反克/生多为克；仅涉及日主或喜用神才输出）
function wxBalance(BZ){
  const sc = wxElementScore(BZ);
  const A  = getAnalysis(BZ);
  const dayWx = GAN_WX[BZ.dayGan];
  const xiSet = new Set(effXi(A));
  const items = [];
  const RATIO = 2.0;   // 失衡阈值：一方能量≥另一方 2 倍即失衡（可调）
  const avg = Object.values(sc).reduce((a,b)=>a+b,0)/5;
  // 相克对：克者 base → 被克者 w
  ['木','火','土','金','水'].forEach(base=>{
    const w = WX_KE[base];
    const Ea = sc[base], Eb = sc[w];
    if(Ea < 1e-6 || Eb < 1e-6) return;    // 克者或被克者分数≈0 → 归"缺"，不在此输出（克者不存在不能称反克）
    const ratio = Ea / Eb;
    if(ratio >= RATIO){
      items.push({type:'克之太过', base, w, ratio,
        focus:(base===dayWx||xiSet.has(base))?base:(w===dayWx||xiSet.has(w))?w:''});
    } else if(1/ratio >= RATIO){
      items.push({type:'反克', base, w, ratio,
        focus:(w===dayWx||xiSet.has(w))?w:(base===dayWx||xiSet.has(base))?base:''});
    }
  });
  // 相生对：生者 base → 受生者 w；生多为克(壅塞) 须受生者能量本就高(旺/相)且自身已成"强"(dominant)才成立
  ['木','火','土','金','水'].forEach(base=>{
    const w = WX_SHENG[base];
    const Ea = sc[base], Ew = sc[w];
    if(Ea < 1e-6 || Ew < 1e-6) return;    // 生者或被生者分数≈0 → 归"缺"，不在此输出
    const ratio = Ea / Ew;
    const wCoef = monthCoef(w, BZ.monthZ);
    // 壅塞三条件：① 受生者当令而旺/相(死/囚如寅月土死绝不壅塞) ② 受生者自身已成"强"(dominant) ③ 生者充裕(≥2×)
    if(ratio >= RATIO && wCoef >= 1.2 && Ew >= WX_TIER_HI*avg){
      items.push({type:'反生', base, w, ratio,
        focus:(w===dayWx||xiSet.has(w))?w:(base===dayWx||xiSet.has(base))?base:''});
    }
  });
  // 末道：仅保留涉及日主或喜用神的失衡（与命局无关不入此节）
  return items.filter(it=>{
    const harmed = (it.type==='反克') ? it.base : it.w;   // 真正被削弱的一方
    return (it.base===dayWx || it.w===dayWx) || xiSet.has(harmed);
  });
}

window.wxElementScore = wxElementScore;

window.wxStrength = wxStrength;

window.wxTier = wxTier;

window.wxBalance = wxBalance;

/* ========== 流通判定（宫位流通圈 + 五行十神相生链；各卡统一调用，禁散落手写套话）==========
 * ① flowPillarRing(BZ) 宫位流通圈：以日支（夫妻宫/自身宫）为起点，沿 时柱/月柱/年柱贯月 三路径
 *    支→干→…→日主→回日支，逐段判五行生克（相生/比和=通、相克=阻），返回各圈结构化结论。
 *    依据：宫位之气自夫妻宫经各柱干支流转回日主，成环则气机相资、断于克处则受制。
 * ② flowChain5(BZ, eScore) 五行十神相生链：木→火→土→金→水→木 相生环（十神视角：印星→比劫→食伤→财星→官杀→印星），
 *    以五行能量分判各环节存续，断处=流通受阻；供④⑤及后续卡统一调用。
 */
function flowPillarRing(BZ){
  const gans=BZ.gans||[], zhis=BZ.zhis||[], dwx=GAN_WX[BZ.dayGan]||'';
  const nodeOf=(k,i)=> k==='日主' ? {name:'日主'+BZ.dayGan, wx:dwx}
    : (k.indexOf('支')>=0 ? {name:k+zhis[i], wx:ZHI_WX[zhis[i]]||''} : {name:k+gans[i], wx:GAN_WX[gans[i]]||''});
  const paths=[
    { name:'时柱圈', seq:[['日支',2],['时支',3],['时干',3],['日主',2],['日支',2]] },
    { name:'月柱圈', seq:[['日支',2],['月支',1],['月干',1],['日主',2],['日支',2]] },
    { name:'年柱圈', seq:[['日支',2],['年支',0],['年干',0],['月干',1],['日主',2],['日支',2]] }
  ];
  return paths.map(p=>{
    const nodes=p.seq.map(([k,i])=>nodeOf(k,i));
    const steps=[];
    for(let s=0;s<nodes.length-1;s++){
      const a=nodes[s], b=nodes[s+1];
      let rel='平';
      if(a.wx&&b.wx){ if(a.wx===b.wx) rel='比和'; else if(WX_SHENG[a.wx]===b.wx||WX_SHENG[b.wx]===a.wx) rel='相生'; else rel='相克'; }
      steps.push({from:a,to:b,rel});
    }
    const blocks=steps.filter(s=>s.rel==='相克');
    return { name:p.name, nodes, steps, blocks,
      text:(nodes.map(n=>n.name).join('→'))
        +(blocks.length?('，于'+blocks.map(s=>s.from.name+'→'+s.to.name).join('、')+'相克受阻'):'，气机相生、流通顺畅') };
  });
}
function flowChain5(BZ, eScore){
  const WX5=['木','火','土','金','水'];
  const sc=eScore||{};
  const dwx=GAN_WX[BZ.dayGan]||'';
  // 五行→十神角色（以日主为参照：同气=比劫、我生=食伤、我克=财星、克我=官杀、生我=印星）
  const role=w=>{
    if(!w) return '';
    if(w===dwx) return '比劫';
    if(WX_SHENG[dwx]===w) return '食伤';
    if(WX_KE[dwx]===w) return '财星';
    if(Object.keys(WX_KE).some(k=>WX_KE[k]===dwx&&k===w)) return '官杀';
    if(Object.keys(WX_SHENG).some(k=>WX_SHENG[k]===dwx&&k===w)) return '印星';
    return '';
  };
  const present=WX5.filter(w=>(sc[w]||0)>1e-6);
  const missing=WX5.filter(w=>(sc[w]||0)<=1e-6);
  const links=[];   // 相生链环节：a 生 b（木→火→土→金→水→木）
  for(let i=0;i<5;i++){ const a=WX5[i], b=WX5[(i+1)%5]; if((sc[a]||0)>1e-6&&(sc[b]||0)>1e-6) links.push(a+'生'+b); }
  // 顺生断处：相生序中 a 现而 b 缺 → 流通止于 a
  const breaks=[];
  for(let i=0;i<5;i++){ const a=WX5[i], b=WX5[(i+1)%5]; if((sc[a]||0)>1e-6&&(sc[b]||0)<=1e-6) breaks.push({from:a,to:b}); }
  const text=missing.length
    ? (links.length?('五行相生'+links.join('、')+'，'+missing.join('、')+'缺、流通至'+breaks.map(b=>b.from+'处')+'中断'):'五行缺'+missing.join('、')+'，相生之链未成')
    : '五行五气俱全，木火土金水相生成环、流通顺畅';
  return { present, missing, links, breaks, text, role };
}
window.flowPillarRing = flowPillarRing;
window.flowChain5 = flowChain5;

  // 把【确认触及日主/用神】的失衡项（来自 wxBalance，基于统一能量分比值），
  // 转成“对旺衰/用神意义”的解读段落；无相关项则返回空串
  function specialShengKeNote(BZ){
    const rel = wxBalance(BZ);
    if(!rel.length) return '';
    const A = getAnalysis(BZ);
    const dayWx = GAN_WX[BZ.dayGan];
    const xiSet = new Set(effXi(A));
    const roleOf = wx => (wx===dayWx ? '日主' : (xiSet.has(wx) ? ('喜用（'+wx+'）') : wx));
    const clauses = rel.map(c=>{
      // 旺衰关注方 = wxBalance 已算好的 focus（涉及日主或喜用的一方）
      const focus = c.focus || ((c.type==='反克') ? c.base : c.w);
      const who = roleOf(focus);
      // 机制说明置于句尾括号
      let verb;
      if(c.type==='反生'){
        verb = (focus===c.w) ? '受生太过而壅塞、反失其用' : '泄秀太过、精气外倾';
        return `${who}${verb}（${c.base}生${c.w}，生多为克）`;
      } else if(c.type==='克之太过'){
        verb = (focus===c.w) ? '遭克伐太过、直接受制削弱' : '克伐太过、过刚易折';
        return `${who}${verb}（${c.base}克${c.w}，克之太过）`;
      }
      // 反克（相侮）
      verb = (focus===c.base) ? '克伐无功、反受牵制' : '势盛反制其克者、偏旺之象';
      return `${who}${verb}（${c.w}盛反制${c.base}之克，相侮）`;
    });
    return '五行失衡之象：' + clauses.join('；') + '。';
  }

  window.specialShengKeNote = specialShengKeNote;

  /* ---------- 日主 进气 / 退气（依十二长生，月令为枢）---------- */
  function dayJinTui(BZ){
    const dg = BZ.dayGan, mz = BZ.monthZ;
    const s = getChangSheng(dg, mz);
    const jin = ['长生','沐浴','冠带','临官','帝旺'];
    const tui = ['衰','病','死','墓','绝','胎','养'];
    if(jin.indexOf(s) >= 0) return `日主${dg}于月令${mz}临${s}，为进气（得令渐旺，生机方长）`;
    if(tui.indexOf(s) >= 0) return `日主${dg}于月令${mz}临${s}，为退气（失令渐弱，气数将收）`;
    return `日主${dg}于月令${mz}临${s}`;
  }

  window.dayJinTui = dayJinTui;

  /* ---------- 湿燥土机制（湿土生金、燥土脆金、火多转燥、水多转湿）----------
     供"调候用神"段的寒暖燥湿说明调用。仅当土之燥湿真正影响命局关键五行
     （金：土生金；土自身为日主/喜用/忌）时才输出具体分析，否则返回 null，
     杜绝“论金之出处须辨土之燥湿”这类无意义的提示。 */
  function earthWetDryNote(BZ){
    const zs = BZ.zhis;
    const wet = zs.filter(z=>isWetEarth(z)), dry = zs.filter(z=>isDryEarth(z));
    if(!wet.length && !dry.length) return null;
    const A = getAnalysis(BZ);
    const dayWx = GAN_WX[BZ.dayGan], dg = BZ.dayGan;
    const xi = new Set(effXi(A)), ji = new Set(effJi(A));
    const cnt = wxCountAll(BZ.gans, BZ.zhis);
    const fireBias = cnt['火'] >= (cnt['水']||0) + 2;   // 火多：湿土被烤转燥
    const waterBias = cnt['水'] >= cnt['火'] + 2;        // 水多：燥土被润转湿
    const out = [];
    // 金：土生金，湿土生、燥土脆
    const jinDay = dayWx==='金', jinXi = xi.has('金'), jinJi = ji.has('金');
    if(jinDay || jinXi || jinJi){
      const label = jinDay ? ('日主'+dg+'属金') : (jinXi ? '喜用为金' : '忌神为金');
      let s;
      if(wet.length && dry.length){
        s = label + '，局中湿土（' + wet.join('、') + '）可生金、燥土（' + dry.join('、') + '）反脆金，金根润燥参半';
      } else if(wet.length){
        s = label + '，湿土（' + wet.join('、') + '）润而生金，金得滋生有力';
        if(fireBias) s += '；然火盛水弱、湿土被烤转燥，生金力减';
      } else {
        s = label + '，燥土（' + dry.join('、') + '）含丁火脆金而不生，金根虚浮、用神不力';
        if(waterBias) s += '；然水盛火弱、燥土被润转湿，反得生金';
      }
      out.push(s);
    }
    // 土自身：日主戊己或喜用/忌
    const tuDay = dayWx==='土', tuXi = xi.has('土'), tuJi = ji.has('土');
    if(tuDay || tuXi || tuJi){
      const label = tuDay ? ('日主'+dg+'属土') : (tuXi ? '喜用为土' : '忌神为土');
      const wd = wet.length ? ('湿土'+wet.join('、')+'（含水润、性柔）') : '';
      const dd = dry.length ? ('燥土'+dry.join('、')+'（含火燥、性烈）') : '';
      const sep = (wet.length && dry.length) ? '，' : '';
      out.push(label + '，' + wd + sep + dd + '，燥湿之差直接定其性情与用事');
    }
    if(!out.length) return null;   // 土燥湿与日主/喜用无关，不啰嗦
    return out.join('；') + '。';
  }

  window.earthWetDryNote = earthWetDryNote;

  // 人生阶段（按虚岁）：复用全局 baziAgeStage，避免与 events 等模块各写一套边界导致口径矛盾。
  // child(<16)→school、youth(16–23)→college（学业进修期）、adult(24–59)→work（事业期）、late(>=60)→retire。
  function lifeStage(age){
    const st = baziAgeStage(age);
    if(st==='child') return 'school';
    if(st==='late')  return 'retire';
    if(st==='youth') return 'college';
    return 'work';
  }

  // 各阶段允许输出的人生领域（yunAreaText 据此过滤；数组顺序即展示主次）
  const STAGE_AREAS = {
    school:  ['学业','健康','家庭'],
    college: ['学业','健康','家庭'],
    work:    ['事业','感情','健康','家庭'],
    retire:  ['健康','家庭']
  };

  // 各阶段"应对"文案（按 吉/平/中/凶 映射）；工作阶段内部分深造期与事业期
  function stageCoping(rating, age){
    const stage = lifeStage(age);
    if(stage==='work' && age!=null && age<30){
      if(rating==='吉') return '事业起步或继续深造，把握能力与资源积累窗口';
      if(rating==='平') return '稳扎稳打、夯实专业根基，按部就班即可';
      if(rating==='中') return '用神根气被引动，宜主动沟通、灵活应变，防根基反复';
      return '谨慎防守、避冒进与重大决定，深造则宜专注学业';
    }
    const T = {
      school: {
        吉:'顺势成长、把握学业与兴趣发展的窗口',
        平:'稳扎稳打、按阶段积累，保持规律作息与身心平衡',
        中:'根基有波动，宜多沟通、灵活调整节奏',
        凶:'谨慎守成、避免冲动冒险，注意身心调护'
      },
      college: {
        吉:'学业进阶、拓展人脉视野，把握升学与方向发展窗口',
        平:'按部就班、夯实专业基础，宜规律作息',
        中:'学业人际有波动，宜多沟通、灵活应变',
        凶:'谨慎守成、专注学业，防分心与身心损耗'
      },
      work: {
        吉:'顺势进取、把握事业财运与感情正缘窗口',
        平:'稳扎稳打、蓄力待时，按部就班即可',
        中:'用神根气被引动，宜主动沟通、灵活应变，防根基反复',
        凶:'谨慎防守、避冲动与重大决定，宜静养蓄势、忌冒进'
      },
      retire: {
        吉:'颐养蓄势、把握身心调护与天伦之乐窗口',
        平:'安守本分、规律起居，顺时而行',
        中:'气机有波动，宜舒缓调摄、多沟通',
        凶:'谨慎守成、避劳累与冲动，宜静养蓄势'
      }
    };
    const m = T[stage] || T.work;
    return m[rating] || m['平'];
  }

  window.lifeStage = lifeStage;

  window.STAGE_AREAS = STAGE_AREAS;

  window.stageCoping = stageCoping;
