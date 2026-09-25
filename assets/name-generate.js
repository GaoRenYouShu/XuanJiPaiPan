/* ============================================================
 * 起名推荐引擎（纯函数，无 DOM 依赖）
 * 依赖：name-data.js、name-engine.js、name-chars.js、name-phonetics.js
 * 链路：五格剪枝（人格、地格、总格非凶）→ 候选枚举 → 数理缓存评分
 *       → 音律调分 → 义类联动调分 → 排序 → 多样性择优
 * 放宽档：五行约束选择即必出，可用候选不足时依次降档（放宽三才 → 数理欠佳放行并标注）
 * ============================================================ */
window.NAME_GENERATE = (function () {
  var D = window.NAME_DATA;
  var E = window.NAME_ENGINE;
  var C = window.NAME_CHARS || {};
  /* 候选集跨调用缓存（键含一切影响候选集的参数）；随机档 rand 只改排序抖动不改候选集，
     故重复点击可直接命中缓存跳过全量枚举。缓存对象不含任何逐次随机状态，安全复用 */
  var __GEN_CACHE = {};
  var __CACHE_KEYS = [];

  /* ---- 拼音声调：字库内字段为准（含补录字），NAME_PHON 兜底 ----
   * NAME_PHON 末位数字是结构索引，非声调，故兜底分支须从带调符号反查 */
  var TONE_CH = { 'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4, 'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
    'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4, 'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
    'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4, 'ü': 1, 'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4 };
  function pyOf(ch) {
    if (C[ch]) return { py: C[ch][0], tone: C[ch][1] };
    var raw = window.NAME_PHON && window.NAME_PHON[ch];
    if (!raw) return null;
    var py = raw.replace(/[0-9]$/, '');
    var tone = 0;
    for (var i = 0; i < py.length; i++) {
      if (TONE_CH[py[i]] !== undefined) { tone = TONE_CH[py[i]]; break; }
    }
    return { py: py, tone: tone };
  }
  /* 韵母近似切分：去掉声母（含 zh、ch、sh 与 y、w），余部作韵母 */
  var INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
    'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
  function finalOf(py) {
    for (var i = 0; i < INITIALS.length; i++) {
      if (py.indexOf(INITIALS[i]) === 0) return py.slice(INITIALS[i].length);
    }
    return py;
  }

  /* ---- 候选池按笔画档分组（一次建表） ---- */
  var BUCKETS = {};
  (function () {
    Object.keys(C).forEach(function (c) {
      var b = C[c][2];
      (BUCKETS[b] = BUCKETS[b] || []).push(c);
    });
  })();

  /* ---- 候选池 ----
   * 池不按请求性别预过滤：性别构成由挑选端三级档控制，异性字须保留在池中才能兜底；
   * 仅剔除通用低画填充字（适用度 -1，如 丁/人/乙，非名字用字） */
  function poolFor() {
    var out = {};
    Object.keys(BUCKETS).forEach(function (b) {
      var arr = BUCKETS[b].filter(function (c) { return (C[c][7] || 0) >= 0; });
      if (arr.length) out[b] = arr;
    });
    return out;
  }

  /* ---- 数理缓存：五格、三才、成功运与基础运只由笔画决定 ----
   * 键 = xst|名笔画；值 = {base, sancai, renWx, zongWx}
   * 数理零否决：凶格不淘汰，按 80 分制原始分入总分（候选经 10 分制折算后自然沉底），
   * 缓存下限 1 分防零分候选与"缓存 falsy 值"语义冲突（null 曾作淘汰标记，今无淘汰） */
  var GRID_CACHE = {};
  var __enumScale = 1; /* 枚举预算系数：五行定向补枚举时打折，平时恒 1 */
  function gridScore(xst, mst) {
    var key = xst.join(':') + '|' + mst.join(':');
    if (GRID_CACHE[key] !== undefined) return GRID_CACHE[key];
    var wg = E.calcWuge(xst, mst);
    var ren = E.n81(wg.ren), di = E.n81(wg.di), zong = E.n81(wg.zong), wai = E.n81(wg.wai), tian = E.n81(wg.tian);
    function lk(n) { return D.NAME81[n - 1].luck; }
    function g8(l) { return l === 'ji' ? 8 : (l === 'xj' ? 5 : 1); }
    function g30(l) { return l === 'ji' ? 30 : (l === 'xj' ? 18 : 6); }
    function g5(l) { return l === 'xiong' ? 2 : (l === 'xj' ? 4 : 5); }
    var st = D.WX_OF_NUM[wg.tian % 10], sr = D.WX_OF_NUM[wg.ren % 10], sd = D.WX_OF_NUM[wg.di % 10];
    var sc = D.SANCAI[st + sr + sd] || { luck: 'xj' };
    function rel(a, b) { return E.relName(a, b); }
    var s = g8(lk(tian)) + g8(lk(ren)) + g8(lk(di)) + g8(lk(wai)) + g8(lk(zong)) + g30(sc.luck);
    s += g5(rel(sr, st) === '克我' ? 'xiong' : (rel(sr, st) === '我克' ? 'xj' : 'ji'));
    s += g5(rel(sr, sd) === '克我' ? 'xiong' : (rel(sr, sd) === '我克' ? 'xj' : 'ji'));
    GRID_CACHE[key] = { base: Math.max(1, s), sancai: sc.luck, renWx: sr, zongWx: D.WX_OF_NUM[wg.zong % 10] };
    return GRID_CACHE[key];
  }

  /* ---- 喜用补益分（义五行口径，镜像 name-engine.analyze 的 match 双轨判定） ----
   * r 传候选的 charYi（名字段各字义五行）；姓不入补益（名学通例为名补喜用）。
   * 返回档位 4 / 7 / 9 / 11 / 15，满档为双轨补益得力。 */
  function yiWxOf(ch) {
    return (C[ch] && C[ch][4]) || '';
  }

  /* 成词库：名字段两字成词命中时加分并记词义，推荐卡展示组合释义与出处 */
  var WORDS = null; /* generate 首调用时惰性取 window.NAME_WORDS，规避 script 加载顺序 */
  function wordHit(chs) {
    if (chs.length !== 2) return null;
    if (WORDS === null) WORDS = window.NAME_WORDS || {};
    return WORDS[chs[0] + chs[1]] || null;
  }

  /* 重名热度：全名用字均在热度表（4/3 档）时降权，防撞名网红款 */
  var HEAT = null;
  function heatOf(chs) {
    if (HEAT === null) HEAT = window.NAME_HEAT || {};
    var top = 0;
    chs.forEach(function (c) { var h = HEAT[c] || 0; if (h > top) top = h; });
    return top;
  }
  function xiMatchScore(chars, xi, ji) {
    if (!(xi && xi.length) && !(ji && ji.length)) return null;
    var D = window.NAME_DATA;
    var good = 0, bad = 0, sg = 0, sb = 0, eff = 0;
    chars.forEach(function (ch) {
      var w = yiWxOf(ch);
      var sw = D.WX_OF_NUM[(C[ch] ? C[ch][2] : 0) % 10];
      if (w) {
        eff++;
        if (xi.indexOf(w) >= 0) good++;
        if (ji.indexOf(w) >= 0) bad++;
      }
      if (xi.indexOf(sw) >= 0) sg++;
      if (ji.indexOf(sw) >= 0) sb++;
    });
    var sc = good * 2 - bad * 2 + sg - sb + (good > 0 && bad === 0 && sb === 0 ? 1 : 0);
    var label, luck, v;
    if (eff === 0 && sg === 0 && sb === 0) { label = '名字无五行可参'; luck = 'neutral'; v = 9; }
    else if (sc >= 4) { label = '双轨补益得力'; luck = 'ji'; v = 15; }
    else if (sc >= 2) { label = '补益得力'; luck = 'ji'; v = 15; }
    else if (sc >= 1) { label = '略有助益'; luck = 'xj'; v = 11; }
    else if (sc <= -3) { label = '双轨犯忌'; luck = 'xiong'; v = 4; }
    else if (sc <= -2) { label = '多与忌神同气'; luck = 'xiong'; v = 4; }
    else if (sc <= -1) { label = '略有妨碍'; luck = 'xj'; v = 7; }
    else { label = '平淡'; luck = 'neutral'; v = 9; }
    return { label: label, luck: luck, v: v, good: good, bad: bad };
  }

  /* ---- 音律调分 ---- */
  function soundScore(pyArr) {
    /* pyArr：全名各字 {py, tone}，缺拼音的字跳过相关规则 */
    var valid = pyArr.filter(function (p) { return p && p.tone; });
    if (valid.length < 2) return { v: 0, note: '无音律调分' };
    var tones = valid.map(function (p) { return p.tone; });
    var finals = valid.map(function (p) { return finalOf(p.py); });
    var initials = valid.map(function (p) {
      for (var i = 0; i < INITIALS.length; i++) {
        if (p.py.indexOf(INITIALS[i]) === 0) return INITIALS[i];
      }
      return '';
    });
    var v = 0, notes = [];
    var uniq = {};
    tones.forEach(function (t) { uniq[t] = 1; });
    if (Object.keys(uniq).length === 1) { v -= 3; notes.push('全名声调雷同，欠起伏'); }
    else {
      v += 2;
      var pingze = tones.map(function (t) { return t === 3 || t === 4 ? '仄' : '平'; });
      if (pingze[0] !== pingze[pingze.length - 1]) { v += 1; notes.push('首尾平仄相间，读来上口'); }
    }
    var SONORANT=/^(l|m|n|r)$/;
    var son1=initials[0] && SONORANT.test(initials[0]);
    if (initials[0] && initials[0] === initials[1] && !son1) { v -= 2; notes.push('姓与名首字双声，稍拗口'); }
    if (initials.length === 3 && initials[1] === initials[2] && !SONORANT.test(initials[1])) { v -= 2; notes.push('名内两字双声，稍拗口'); }
    if (finals[0] === finals[finals.length - 1]) { v -= 1; notes.push('姓与名末字叠韵'); }
    if (finals.length === 3 && finals[1] === finals[2]) { v -= 1; notes.push('名内两字叠韵'); }
    return { v: v, note: notes.length ? notes.join('；') : '声韵协调' };
  }

  /* ---- 谐音避忌：与页面 NM_TABOO 同源同规 ----
   * 读音无调比对，来源与页面 nmSyll 一致（字库拼音优先、拼音表兜底）
   * 硬忌（2）直接淘汰；软忌（1）记档，排序时扣 40 分沉底，不淘汰 */
  var TONE_MARK = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g;
  var TONE_MAP = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i', 'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u', 'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' };
  function plainPy(py) { return String(py).replace(TONE_MARK, function (m) { return TONE_MAP[m]; }); }
  /* 音节与结构逐字缓存：候选量以十万计，避免每候选重复做正则与切片 */
  var SYL_CACHE = {}, STRUCT_CACHE = {};
  function sylOf(ch) {
    if (SYL_CACHE[ch] === undefined) {
      var p = pyOf(ch);
      SYL_CACHE[ch] = p ? plainPy(p.py) : null;
    }
    return SYL_CACHE[ch];
  }
  function structOf(ch) {
    if (STRUCT_CACHE[ch] === undefined) {
      var p = window.NAME_PHON && window.NAME_PHON[ch];
      STRUCT_CACHE[ch] = p ? parseInt(p.slice(-1), 10) : -1;
    }
    return STRUCT_CACHE[ch];
  }
  /* 首音节倒排：绝大多数音节查表即落空，比对成本摊到近乎为零 */
  var TABOO_IDX = null;
  function tabooIndex() {
    if (TABOO_IDX) return TABOO_IDX;
    var idx = {}, T = window.NM_TABOO || [];
    for (var k = 0; k < T.length; k++) {
      var s = T[k][0], h = s[0];
      (idx[h] = idx[h] || []).push({ rest: s.slice(1), lv: T[k][3] || 1, word: T[k][1] });
    }
    TABOO_IDX = idx;
    return idx;
  }
  /* 音节近音变体：前后鼻音与平翘舌混淆组（软忌提示口径，硬忌仍精确匹配） */
  function sylVariants(s) {
    var v = [s], t;
    var PAIRS = [['an', 'ang'], ['en', 'eng'], ['in', 'ing'], ['z', 'zh'], ['c', 'ch'], ['s', 'sh']];
    for (var i = 0; i < PAIRS.length; i++) {
      var n0 = v.length;
      for (var j = 0; j < n0; j++) {
        var cur = v[j];
        for (var d = 0; d < 2; d++) {
          var a = PAIRS[i][d], b = PAIRS[i][1 - d];
          var pos = cur.lastIndexOf(a);
          if (pos >= 0 && pos + a.length === cur.length) {
            var nv = cur.slice(0, pos) + b;
            if (v.indexOf(nv) < 0) v.push(nv);
          }
        }
      }
    }
    return v;
  }
  /* 近音档：软忌阈值。返回 {lv, word, near}；near=true 表示经近音变体命中 */
  function tabooLevel(seq) {
    var idx = tabooIndex(), worst = 0, word = '';
    for (var i = 0; i < seq.length; i++) {
      var list = idx[seq[i]];
      if (!list) continue;
      for (var k = 0; k < list.length; k++) {
        var e = list[k], n = e.rest.length;
        if (i + n > seq.length - 1) continue;
        var ok = true;
        for (var j = 0; j < n; j++) { if (seq[i + 1 + j] !== e.rest[j]) { ok = false; break; } }
        if (ok && e.lv > worst) { worst = e.lv; word = e.word; }
      }
    }
    /* 近音轮：变体音节命中且 lv>0 时降为软忌提示（lv 不升到硬忌） */
    if (worst < 1) {
      var seenSyl = {};
      for (var vi = 0; vi < seq.length; vi++) {
        var vs = sylVariants(seq[vi]);
        for (var vk = 0; vk < vs.length; vk++) {
          if (vs[vk] === seq[vi] || seenSyl[vs[vk]]) continue;
          seenSyl[vs[vk]] = 1;
          var vlist = idx[vs[vk]];
          if (!vlist) continue;
          for (var vk2 = 0; vk2 < vlist.length; vk2++) {
            var ve = vlist[vk2], vn = ve.rest.length;
            if (vi + vn > seq.length - 1) continue;
            var vok = true;
            for (var vj = 0; vj < vn; vj++) { if (seq[vi + 1 + vj] !== ve.rest[vj]) { vok = false; break; } }
            if (vok && ve.lv > worst) { worst = ve.lv > 1 ? 1 : ve.lv; word = ve.word; }
          }
        }
      }
    }
    return { lv: worst, word: word };
  }

  /* ---- 字形观感分：镜像页面 formBlock 的评断规则（结构取 NAME_PHON 末位，笔画取康熙口径）
   * 只取合计用于同分带内的排序微调，不参与五格数理 */
  function formScore(chs) {
    var P = window.NAME_PHON || {}, st = [], sc = [], n = chs.length, v = 0;
    for (var i = 0; i < n; i++) {
      sc.push(C[chs[i]] ? C[chs[i]][2] : 0);
      st.push(structOf(chs[i]));
    }
    var cnt = {};
    st.forEach(function (s) { if (s >= 0) cnt[s] = (cnt[s] || 0) + 1; });
    var maxSame = 0;
    Object.keys(cnt).forEach(function (s) { if (cnt[s] > maxSame) maxSame = cnt[s]; });
    if (n >= 2 && maxSame === n) v -= (n === 2 ? 3 : 5);
    else if (n >= 3 && maxSame >= 2) v -= 3;
    else if (n >= 2 && maxSame === 1 && Object.keys(cnt).length === n) v += 3;
    var wb = st.filter(function (s) { return s === 3; }).length;
    if (wb >= 2) v -= 5; else if (wb === 1 && n >= 2) v -= 2;
    var pz = st.filter(function (s) { return s === 5; }).length;
    if (pz >= 2) v -= 6; else if (pz === 1) v -= 3;
    var dt = st.filter(function (s) { return s === 4; }).length;
    if (n >= 2 && dt === n) v -= 3;
    if (n >= 2) {
      var mx = Math.max.apply(null, sc), mn = Math.min.apply(null, sc), gap = mx - mn;
      if (gap >= 12) v -= 5; else if (gap >= 8) v -= 3; else if (gap <= 3) v += 2;
    }
    var sum = sc.reduce(function (a, b) { return a + b; }, 0);
    var avg = Math.round(sum / n * 10) / 10;
    if (avg > 14) v -= 4;
    else if (avg < 4) v -= 3;
    else if (avg >= 6 && avg <= 11) v += 2;
    return v;
  }

  /* ---- 义类联动 ----
   * 相生相映的组合加分，同组 parallel 视组合而定，虚词泛用降分 */
  var AFFIN = { '品德才学': 2, '天象水泽': 2, '草木水泽': 2, '珍宝吉祥': 2, '山岳草木': 2,
    '才学气度': 2, '容貌品德': 2, '时令天象': 2, '色彩珍宝': 2, '吉祥品德': 2,
    '天象吉祥': 1, '水泽吉祥': 1, '才学山岳': 1, '气度山岳': 1, '草木天象': 1, '品德水泽': 1 };
  var PARALLEL_OK = { '品德': 1, '才学': 1, '吉祥': 1, '气度': 1 };
  /* 成词硬忌：姓名连读构成的不当实词（关系称谓、情恋事由），组合违和直接淘汰 */
  var NM_WORD_TABOO = ['恋人', '情人', '爱人', '仇人', '罪人', '犯人', '敌人', '夫人', '媳妇', '老婆', '寡妇', '情夫', '初恋', '暗恋', '失恋', '绝情', '负心', '变心', '外遇', '情敌', '私奔', '媒人', '佣人', '仆人', '主子'];
  function semScore(g1, g2, gen1, gen2) {
    /* 性别混搭方向化：女字冠首男字煞尾（倩伟式）观感违和，直接淘汰；
       男字冠首女字煞尾（恕婉式，偏女名）降档放行，由性别构成档决定是否取用 */
    if (gen1 === -1 && gen2 === 1) return { v: -99, note: '女字冠首男字煞尾' };
    var femTail = gen1 === 1 && gen2 === -1;
    var v = 0, note = '';
    if (g1 === '虚词' || g2 === '虚词') {
      var other = g1 === '虚词' ? g2 : g1;
      if (other === '吉祥' || other === '品德') { v = 1; note = '虚实相生'; }
      else { v = -3; note = '虚词泛用，实感不足'; }
      if (femTail) { v -= 2; note = '男冠女尾，偏女名'; }
      return { v: v, note: note };
    }
    var k1 = g1 + g2, k2 = g2 + g1;
    if (AFFIN[k1] !== undefined) { v = AFFIN[k1]; note = '义类相映'; }
    else if (AFFIN[k2] !== undefined) { v = AFFIN[k2]; note = '义类相映'; }
    else if (g1 === g2) {
      v = PARALLEL_OK[g1] ? 1 : 0;
      note = PARALLEL_OK[g1] ? '同义并列' : '同义类并列';
    } else { v = 1; note = '义类互补'; }
    if (femTail) { v -= 2; note = '男冠女尾，偏女名'; }
    return { v: v, note: note };
  }

  /* ---- 主入口 ----
   * xing：姓氏字符串；opts：{gender:'m'|'f'|'a', single:false, xi:[], ji:[], count:30} */
  function generate(xing, opts) {
    opts = opts || {};
    var pref = opts.gender || 'a';
    var xi = opts.xi || [], ji = opts.ji || [];
    /* count：本次输出的候选条数；不传或传 0 即输出窗口内全部候选 */
    var count = opts.count > 0 ? opts.count : Infinity;
    var nameLen = parseInt(opts.len, 10) || (opts.single ? 1 : 2);
    if ([1, 2, 3, 4].indexOf(nameLen) < 0) nameLen = 2;
    var single = nameLen === 1;

    /* ---- 五行要求（按名首字五行计）----
     * 正数：名单中该五行至少几名，名额在各正数五行间轮转分配；
     * 显式 0：排除该五行，全名任何位置都不出现（候选生成时过滤）；
     * 未提及：不干预；候选不足时取用候补只来自未排除五行 */
    var quota = null;
    var wxExcl = {};
    if (opts.wxQuota) {
      quota = {};
      Object.keys(opts.wxQuota).forEach(function (w) {
        var v = +opts.wxQuota[w];
        if (v > 0) quota[w] = v;
        else if (v === 0) wxExcl[w] = 1;
      });
      if (!Object.keys(quota).length) quota = null;
    }
    var wxActive = !!(quota || Object.keys(wxExcl).length);

    var xchars = [...xing];
    var xplans = xchars.map(function (c) { return E.planChar(c); });
    var badX = xplans.filter(function (p) { return !p.strokes; });
    if (badX.length) return { ok: false, reason: '姓氏含未收录字：' + badX.join('') };
    var xst = xplans.map(function (p) { return p.strokes; });
    var xpy = xchars.map(pyOf);

    var pool = poolFor();
    /* 字辈字：强制入池，防性别过滤把字辈字滤掉导致零候选 */
    var beizi = opts.beizi || '';
    var bzIdx = single ? 0 : (parseInt(opts.bzPos, 10) || 0);
    var bzSt = beizi ? C[beizi][2] : 0;
    var comboByTag = {}; /* 同一次调用内各放宽档的笔画组合枚举共享缓存（组合集随放宽档而异） */
    if (beizi) {
      if (!C[beizi]) return { ok: false, reason: '字辈字 ' + beizi + ' 不在站内候选字库（现收 ' + Object.keys(C).length + ' 字），无法取其康熙笔画与字义档案，请更换用字；常用字辈字如 德、祖、传、绍、延、庆 等均已收录。' };
      var bzBucket = C[beizi][2];
      if (!(pool[bzBucket] || []).some(function (c) { return c === beizi; })) {
        pool[bzBucket] = pool[bzBucket] || [];
        pool[bzBucket].push(beizi);
      }
    }
    /* 避讳：chars 同字、syls 同音（去调），只约束名，姓不可改不检查 */
    var avChars = (opts.avoid && opts.avoid.chars) || [];
    var avSyls = (opts.avoid && opts.avoid.syls) || [];
    var bk = Object.keys(pool);

    /* target：收集数组；tier 恒 0（数理零否决后不再分档，保留字段兼容取用端） */
    function build(target, tier, chs) {
      /* 五行排除/配额：按义五行计（水字属水）；无共识的字不属任何五行，不受排除约束；
         字辈字为宗族必用字，豁免排除 */
      for (var wxi = 0; wxi < chs.length; wxi++) {
        if (chs[wxi] !== beizi && wxExcl[yiWxOf(chs[wxi])]) return;
      }
      /* 字辈与避讳先判：硬性条件不符直接淘汰，免做后续笔画、音律、义类计算 */
      if (beizi && chs[bzIdx] !== beizi) return;
      for (var ai = 0; ai < chs.length; ai++) {
        if (avChars.indexOf(chs[ai]) >= 0) return;
        var as = sylOf(chs[ai]);
        if (as && avSyls.indexOf(as) >= 0) return;
      }
      var mst = chs.map(function (c) { return C[c][2]; });
      var r = gridScore(xst, mst);
      var py2 = chs.map(pyOf);
      /* 名与姓同字或同音直接淘汰 */
      for (var i = 0; i < xchars.length; i++) {
        for (var j = 0; j < chs.length; j++) {
          if (chs[j] === xchars[i]) return;
          if (xpy[i] && py2[j] && xpy[i].py === py2[j].py) return;
        }
      }
      for (var a = 0; a < py2.length; a++) {
        for (var b = a + 1; b < py2.length; b++) {
          if (py2[a] && py2[b] && py2[a].py === py2[b].py) return;
        }
      }

      /* 谐音避忌：全名连读比对，硬忌即淘汰，软忌记档由排序扣分沉底 */
      var tseq = xchars.concat(chs).map(sylOf);
      var tb = tabooLevel(tseq);
      if (tb.lv >= 2) return;

      /* 成词避忌：全名连读构成不当实词（称谓、情恋事由等，如 恋人）直接淘汰 */
      var whole = xchars.concat(chs).join('');
      for (var wi = 0; wi < NM_WORD_TABOO.length; wi++) {
        if (whole.indexOf(NM_WORD_TABOO[wi]) >= 0) return;
      }

      /* 性别位置规则：偏男字用于女名仅可冠首（恕婉式），偏女字用于男名仅可煞尾；
         违位组合（如 才恕）无论构成档位如何都不产出 */
      if (pref === 'f' && !single) {
        for (var gp = 1; gp < chs.length; gp++) { if (C[chs[gp]][6] === 1) return; }
      } else if (pref === 'm' && !single) {
        for (var gq = 0; gq < chs.length - 1; gq++) { if (C[chs[gq]][6] === -1) return; }
      }

      var cs = chs.map(function (c) { return C[c]; });
      /* 喜用补益：义五行口径，取 4 / 7 / 9 / 11 / 15 档后折 25 分制（姓不入补益，只看名字段） */
      var xiM = xiMatchScore(chs, xi, ji);
      /* 总分（确定性）：数理 80 分制折 10 分制 + 喜用 25 + 字义 15 + 意境 15 + 音律 20 + 字形 5；
         数理凶格不再否决，靠折算低分自然沉底 */
      var shuli10 = Math.round(r.base / 80 * 10);
      var ziyi15 = 15; /* 字库候选已过褒贬筛，整档计；单字互义细则由义类联动承担 */
      var yijing10 = semScore(cs[0][5], cs.length > 1 ? cs[1][5] : '', cs[0][6], cs.length > 1 ? cs[1][6] : 0).v >= 2 ? 10 : 8;
      var snd = soundScore(xpy.concat(py2));
      var yinlv20 = Math.max(0, Math.min(20, 14 + snd.v * 2));
      var fm = formScore(chs) * 0.5;
      if (fm > 3) fm = 3; else if (fm < -3) fm = -3;
      var xing5 = Math.max(0, Math.min(5, Math.round(3 + fm / 3)));
      var sem;
      if (cs.length <= 2) {
        sem = semScore(cs[0][5], cs.length > 1 ? cs[1][5] : '', cs[0][6], cs.length > 1 ? cs[1][6] : 0);
      } else {
        /* 3~4 字名：相邻两两义类联动，性别混搭全对核查 */
        var sv = 0, notes = [];
        for (var k = 0; k < cs.length - 1; k++) {
          var p = semScore(cs[k][5], cs[k + 1][5], 0, 0);
          sv += p.v;
          if (p.note && p.note !== '义类互补' && p.note !== '男女字混搭') notes.push(chs[k] + chs[k + 1] + p.note);
        }
        for (var a2 = 0; a2 < cs.length; a2++) {
          for (var b2 = a2 + 1; b2 < cs.length; b2++) {
            /* 与两字名同口径：女字在前男字在后淘汰；男前女后降档由 semScore 处理 */
            if (cs[a2][6] === -1 && cs[b2][6] === 1) sv = -99;
            else if (cs[a2][6] === 1 && cs[b2][6] === -1) sv -= 2;
          }
        }
        sem = { v: sv, note: notes.length ? notes.join('；') : '义类互补' };
      }
      if (sem.v <= -99) return;
      /* 确定性总分：排序主键（随机档叠加抖动），六项合计满分 90 带，
         另典籍正源加 12、成词加 4、当代热字减 6 或 3；
         数理凶格不否决，靠 shuli10 低分自然沉底；预存便于跨调用缓存候选集 */
      var word = wordHit(chs);
      var classic = word && word[3] && word[3].indexOf('取意') < 0; /* 典籍正源（非取意化用） */
      var heat = heatOf(chs);
      var dscore = shuli10 + (xiM ? Math.round(xiM.v * 25 / 15) : 15) + ziyi15 + Math.round(yijing10 * 15 / 10) + yinlv20 + xing5
        + (classic ? 12 : word ? 4 : 0)
        - (heat === 4 ? 6 : heat === 3 ? 3 : 0)
        - (tb.lv >= 1 ? 40 : 0);
      /* 多样性派生字段生成时一次算好（取用端只读字段不再重算）；
         字辈位让位口径与取用端一致，beizi/bzPos 已入缓存键，随候选缓存安全 */
      var mh = chs[0], mt = chs[chs.length - 1];
      if (beizi && nameLen > 1) {
        if (parseInt(opts.bzPos, 10) || 0) { if (mt === beizi) mt = chs[chs.length - 2]; }
        else { if (mh === beizi) mh = chs[1]; }
      }
      var mpat = chs.map(function (c) { return C[c][5]; }).join('+');
      /* 候选性别类：含女字→f；否则含男字→m；全中性→n（性别构成三级档的计量单位） */
      var gcls = 'n';
      for (var gc = 0; gc < chs.length; gc++) {
        if (C[chs[gc]][6] === -1) { gcls = 'f'; break; }
        if (C[chs[gc]][6] === 1) gcls = 'm';
      }
      var mpk = chs.map(function (c) { return C[c][2]; }).join(':');
      target.push({
        name: chs.join(''),
        shuli: shuli10,
        q: cs.reduce(function (s, c) { return s + (c[7] || 0); }, 0),
        grid: r,
        gridNote: '三才' + (r.sancai === 'ji' ? '吉' : r.sancai === 'xj' ? '次吉' : '凶'),
        sound: snd,
        sem: sem,
        xi: xiM,
        pinyin: xpy.map(function (p) { return p ? p.py : '?'; }).concat(py2.map(function (p) { return p ? p.py : '?'; })).join(' '),
        charWx: chs.map(function (c) { return yiWxOf(c) || '—'; }),
        charWxShu: cs.map(function (c) { return D.WX_OF_NUM[c[2] % 10]; }),
        word: word ? { def: word[0], src: word[3] || '', classic: classic } : null,
        heat: heat,
        chars: chs.slice(),
        taboo: tb.lv, tabooWord: tb.word, form: formScore(chs),
        _dscore: dscore,
        _head: mh, _tail: mt, _pat: mpat, _pk: mpk, _gcls: gcls,
        tier: tier
      });
    }

    /* 枚举一层候选：1~2 字全量枚举；3~4 字先按笔画组合过数理筛（gridScore 带缓存），
       组合按数理分降序逐组铺字，每笔画档字按适用度预排序截断，防止全量枚举超时；
       firstBs 限名首字笔画档（五行定向补枚举用） */
    function enumerate(target, tier, firstBs) {
      var heads = firstBs || bk;
      if (nameLen === 1) {
        heads.forEach(function (b) { pool[b].forEach(function (c) { build(target, tier, [c]); }); });
      } else if (nameLen === 2) {
        /* 两字名全量枚举但设预算上限：数理零否决后候选量大幅增加（实测王姓 11.7 万→77 万），
           无上限会让 build 全量跑 5 秒+；预算 22 万足够 capTier 窗口（3000）与多样性保底，
           组合按首档内序铺开，超出预算即止（余下为低分长尾，截断不损名单质量） */
        var budget2 = Math.floor(220000 * __enumScale);
        (function walkHeads(hi) {
          if (hi >= heads.length || target.length > budget2) return;
          var b1 = heads[hi];
          pool[b1].forEach(function (ca) {
            if (target.length > budget2) return;
            bk.forEach(function (b2) {
              if (target.length > budget2) return;
              pool[b2].forEach(function (cb) {
                if (target.length > budget2) return;
                build(target, tier, [ca, cb]);
              });
            });
          });
          walkHeads(hi + 1);
        })(0);
      } else {
        /* 笔画组合枚举：字辈定位时组合中字辈位笔画恒为字辈字笔画（先滤再筛，免全量铺排）；
           组合集缓存共享（数理零否决后组合集唯一，无放宽档之别） */
        function collectCombos() {
          var list = [];
          (function rec(arr) {
            if (arr.length === nameLen) {
              if (bzSt && arr[bzIdx] !== bzSt) return;
              var r = gridScore(xst, arr.slice());
              list.push({ m: arr.slice(), base: r.base });
              return;
            }
            (arr.length === 0 ? heads : bk).forEach(function (b) { arr.push(+b); rec(arr); arr.pop(); });
          })([]);
          return list;
        }
        var combos;
        if (firstBs) combos = collectCombos();
        else {
          if (!comboByTag[0]) comboByTag[0] = collectCombos();
          combos = comboByTag[0];
        }
        /* 4 字名组合空间为 3 字名的数十倍，铺字宽度收窄（6^4）、预算收紧（18 万），
           省下的预算换取更多笔画组合轮转，多样性优于单组合深铺 */
        var cap = nameLen === 3 ? 12 : 6, budget = Math.floor((nameLen === 3 ? 240000 : 180000) * __enumScale);
        var top = {};
        heads.concat(bk).forEach(function (b) {
          if (top[b]) return;
          top[b] = pool[b].slice().sort(function (x, y) { return (C[y][7] || 0) - (C[x][7] || 0); }).slice(0, cap);
        });
        function lay(cm) {
          (function rec2(arr, idx) {
            if (target.length > budget) return;
            if (idx === nameLen) { build(target, tier, arr); return; }
            /* 字辈位恒铺字辈字本身，其余位照常按笔画档取候选字 */
            var bs = (beizi && idx === bzIdx) ? [beizi] : (top[cm.m[idx]] || []);
            for (var t = 0; t < bs.length; t++) { arr.push(bs[t]); rec2(arr, idx + 1); arr.pop(); }
          })([], 0);
        }
        if (wxActive) {
          /* 五行约束激活：组合按首字笔画档分组、组内按数理分降序、组间逐组合轮转铺字，
             预算均摊到每个首字档，使每个五行（笔画尾数）都有足量候选入池 */
          var groups = {}, order = [];
          combos.forEach(function (cm) {
            if (!groups[cm.m[0]]) { groups[cm.m[0]] = []; order.push(cm.m[0]); }
            groups[cm.m[0]].push(cm);
          });
          order.forEach(function (b) { groups[b].sort(function (x, y) { return y.base - x.base; }); });
          order.sort(function (a, b) { return groups[b][0].base - groups[a][0].base; });
          var idxByG = {}, doneG = 0, gi = 0;
          order.forEach(function (b) { idxByG[b] = 0; });
          while (target.length <= budget && doneG < order.length) {
            var gb = order[gi % order.length];
            if (idxByG[gb] < groups[gb].length) { lay(groups[gb][idxByG[gb]]); idxByG[gb]++; }
            else doneG++;
            gi++;
          }
        } else {
          combos.sort(function (x, y) {
            if (y.base !== x.base) return y.base - x.base;
            /* 同分组合按散列打散，避免铺字集中在少数首字档 */
            function h(c) { return c.m.reduce(function (s, b) { return (s * 31 + b) % 997; }, 7); }
            return h(x) - h(y);
          });
          combos.some(function (cm) {
            lay(cm);
            return target.length > budget;
          });
        }
      }
    }

    var rawT = [[], [], []];

    /* 三档枚举：0 严格、1 放宽三才、2 数理欠佳放行；按需枚举，档间共享 */

    /* 候选集跨调用缓存：同一 姓氏/性别/字数/字辈/避讳字　音/喜用/忌用/三才口径 下候选集完全相同，
       rand 只改排序抖动不改候选集，故随机分析重复点击可跳过全量枚举（首点仍付一次成本） */
    function __cacheSig() {
      return xing + '|' + pref + '|' + nameLen + '|' + beizi + '|' + (parseInt(opts.bzPos, 10) || 0)
        + '|' + avChars.join(',') + '|' + avSyls.join(',') + '|' + xi.join(',') + '|' + ji.join(',')
        + '|' + (opts.strictSancai !== false) + '|' + (single ? 1 : 0)
        + '|' + (opts.wxQuota ? JSON.stringify(opts.wxQuota) : '')
        /* 已列集合参与窗口构建，故入签名；摘要取条数加首末名，续段间互不相同 */
        + '|' + (opts.exclude && opts.exclude.length
          ? opts.exclude.length + ':' + opts.exclude[0] + ':' + opts.exclude[opts.exclude.length - 1] : '');
    }
    /* 每层枚举后按确定性分截断 Top-K：窗口须保住多样性，首字、尾字各不少于 22 个不同字，
       两字及以上还须不少于 22 个不同笔画组合，每个池中存在的五行（按名首字）还须不少于
       推荐数量条候选（高分段常被个别五行占据，不做保底则配额与排除约束在窗口内无米下锅），
       任一维度不足时逐级扩窗至全量 */
    function __capTier(t) {
      var arr = rawT[t];
      if (!arr || !arr.length) return;
      /* 按名字去重（整层枚举与定向补枚举叠加时可能重复），恒落确定性分降序 */
      var seenN = {}, uniq = [];
      for (var u = 0; u < arr.length; u++) {
        if (!seenN[arr[u].name]) { seenN[arr[u].name] = 1; uniq.push(arr[u]); }
      }
      var sorted = uniq.sort(function (a, b) { return b._dscore - a._dscore; });
      /* 已列候选整段剔除后再建窗口：续段取的是排序序贯的下一段，段与段互不重复 */
      if (opts.exclude && opts.exclude.length) {
        sorted = sorted.filter(function (n) { return !__exSet[n.name]; });
      }
      /* 池内各五行总量：五行保底的取用依据（窗口要求不超过池存量） */
      var poolEl = {};
      for (var p = 0; p < sorted.length; p++) {
        var e0 = sorted[p].charWx[0];
        poolEl[e0] = (poolEl[e0] || 0) + 1;
      }
      var win = Math.min(3000, sorted.length);
      var needTails = nameLen > 1 ? 22 : 0; /* 单字名首尾同字，只查首字 */
      var needPairs = nameLen > 1 ? 22 : 0;
      for (;;) {
        var seenH = {}, seenT = {}, seenK = {}, seenE = {}, heads = 0, tails = 0, pairs = 0;
        for (var i = 0; i < win; i++) {
          var n = sorted[i], h = n._head, tl = n._tail, k = n._pk, e = n.charWx[0];
          if (!seenH[h]) { seenH[h] = 1; heads++; }
          if (!seenT[tl]) { seenT[tl] = 1; tails++; }
          if (!seenK[k]) { seenK[k] = 1; pairs++; }
          seenE[e] = (seenE[e] || 0) + 1;
        }
        var wxOk = true;
        for (var e2 in poolEl) {
          /* 五行保底量＝该五行的配额需求（无配额取基础量 22），与首字、尾字、笔画组合的保底同级：
             高分段常被个别五行占据，窗口不做保底则配额与排除约束无米下锅 */
          var needE = quota ? (quota[e2] || 0) : 0;
          if (needE < 22) needE = 22;
          if ((seenE[e2] || 0) < Math.min(needE, poolEl[e2])) { wxOk = false; break; }
        }
        if ((heads >= 22 && tails >= needTails && pairs >= needPairs && wxOk) || win >= sorted.length) break;
        win = Math.min(sorted.length, win * 2);
      }
      rawT[t] = sorted.slice(0, win);
      /* 五行索引：窗口内按 _dscore 序为每个五行收集候选，quota 段直接取用免全窗扫描；
         exclude 集随调用变化不预过滤，由取用侧跳过 */
      var widx = {}, kept = rawT[t];
      for (var wi = 0; wi < kept.length; wi++) {
        var we = kept[wi].charWx[0];
        (widx[we] = widx[we] || []).push(kept[wi]);
      }
      rawT.wx = rawT.wx || {};
      rawT.wx[t] = widx;
    }

    var soft = false;
    var __sig = __cacheSig();
    /* 随机分析排除：会话内已展示的名字挑选前剔除，不影响候选集缓存 */
    var __exSet = {};
    (opts.exclude || []).forEach(function (x) { __exSet[x] = 1; });

    /* 五行定向补枚举：配额五行（义五行口径）在已枚举池内候选不足推荐数量时，
       仅以该五行对应笔画档为首档补枚举，枚举预算按比例缩减；
       补枚举经同一 build 筛选，排除五行不会产出；结果随候选集缓存 */
    function __wxTopUp() {
      if (!quota) return;
      function missingWx() {
        var poolEl = {};
        rawT[0].forEach(function (n) {
          var e = n.charWx[0];
          if (e === '—') return; /* 无共识字不占五行配额 */
          poolEl[e] = (poolEl[e] || 0) + 1;
        });
        return Object.keys(quota).filter(function (w) { return (poolEl[w] || 0) < (quota[w] || 0); });
      }
      var miss = missingWx();
      if (!miss.length) return;
      /* 义五行 → 笔画档：义五行的字可能落在任意笔画档，用首字义五行直接筛字而非筛档：
         以每档全部字构建临时名单，取义五行匹配的字为铺字首档（定向铺字由 build 内
         义五行排除与候选排序保证），此处按桶铺开走 firstBs 机制即可覆盖 */
      function bucketsOf(list) {
        /* 义五行对应的所有笔画档不可知，退化为全档定向补枚举（预算 0.25 折已控时） */
        return bk.slice();
      }
      __enumScale = 0.25;
      enumerate(rawT[0], 0, bucketsOf(miss));
      __capTier(0);
      __enumScale = 1;
    }
    if (__GEN_CACHE[__sig]) {
      rawT = __GEN_CACHE[__sig];
    } else {
      enumerate(rawT[0], 0, null);
      /* 保留真实候选总数供展示（candidateCount 不随截断缩水），再按多样性保底截断 */
      rawT.count = rawT[0].length;
      __capTier(0);
      __wxTopUp();
      rawT.full = [true, false, false];
      __GEN_CACHE[__sig] = rawT;
      /* 续段时每段各占一签，只留最近三签，免长会话缓存无界增长 */
      __CACHE_KEYS.push(__sig);
      while (__CACHE_KEYS.length > 3) delete __GEN_CACHE[__CACHE_KEYS.shift()];
    }
    rawT.full = rawT.full || [true, false, false];
    if (!rawT[0].length) {
      return { ok: false, xst: xst, reason: '该姓氏与当前筛选条件下无候选（避讳、字辈或五行排除过严），请调整后重试。' };
    }

    /* 随机分析：rand 开启时每个候选叠加 0~6 分随机抖动，同质量带内顺序刷新，
       数理明显更优者仍排前；抖动值逐候选缓存保证单次排序自洽，每次调用重新生成 */
    var RJ = opts.rand ? (+opts.rand || 6) : 0;
    /* 排序键：确定性总分（数理+音律+义类+喜用+软忌+字形），随机档叠加一次抖动；
       抖动不写回候选对象，缓存候选在多次调用间可安全复用 */
    var sortFn = function (a, b) {
      function key(n) {
        return n._dscore + (RJ ? Math.random() * RJ : 0);
      }
      return key(b) - key(a);
    };

    /* ---- 取用 ----
     * 多样性口径：同首字、同末字、同笔画组合各限 tailLimit（单字名不限笔画组合），同义类搭配限 3；
     * take 的 scale 为多样性放宽档（各上限 +scale），由配额与足额阶段逐级调用 */
    var picked = [], nameSet = {};
    var headCnt = {}, tailCnt = {}, patCnt = {}, pairCnt = {};
    var tailLimit = nameLen >= 3 ? 3 : 2;
    /* 性别构成三级上限（点名性别时生效）：本性别百分百 → 本性别:中性 9:1 → 本性别:中性:异性 7:2:1，
       先按第一级设定，取不足推荐数量时由构成升级段放行 */
    var reqCls = pref === 'm' ? 'm' : 'f';
    var oppCls = pref === 'm' ? 'f' : 'm';
    var CLIM = pref === 'm' ? { m: count, n: 0, f: 0 }
      : pref === 'f' ? { f: count, m: 0, n: 0 }
      : null;
    var clsCnt = { m: 0, n: 0, f: 0 };
    function take(n, scale) {
      var s = scale || 0;
      if (nameSet[n.name]) return false;
      if (CLIM) {
        var cls = n._gcls || 'n';
        if (clsCnt[cls] >= CLIM[cls]) return false;
      }
      var head = n._head, tail = n._tail, pat = n._pat, pk = n._pk;
      if ((headCnt[head] || 0) >= tailLimit + s) return false;
      if ((tailCnt[tail] || 0) >= tailLimit + s) return false;
      if ((patCnt[pat] || 0) >= 3 + s) return false;
      if (nameLen >= 2 && (pairCnt[pk] || 0) >= tailLimit + s) return false;
      headCnt[head] = (headCnt[head] || 0) + 1;
      tailCnt[tail] = (tailCnt[tail] || 0) + 1;
      patCnt[pat] = (patCnt[pat] || 0) + 1;
      pairCnt[pk] = (pairCnt[pk] || 0) + 1;
      nameSet[n.name] = 1;
      if (CLIM) clsCnt[n._gcls || 'n']++;
      picked.push(n);
      return true;
    }
    var sortedT = {};
    function liveTier() {
      return rawT[0];
    }
    function sortedTier() {
      if (!sortedT[0]) {
        var base = liveTier();
        if (RJ) {
          /* 随机档：抖动排序只作用于窗口前段，其余按确定性序衔接，避免每次点击全量重排 */
          var K = Math.min(base.length, 3000);
          var head = base.slice(0, K);
          head.sort(sortFn);
          sortedT[0] = head.concat(base.slice(K));
        } else {
          /* 确定性档：cap 已保证确定性分降序，直接复用 */
          sortedT[0] = base;
        }
      }
      return sortedT[0];
    }
    /* 指定五行的候选列表（cap 已建五行索引，确定性分序；已列候选在建索引前整段剔除，此处无须再筛） */
    function wxList(w) {
      var idx = (rawT.wx && rawT.wx[0]) || {};
      return idx[w] || [];
    }
    if (quota) {
      /* 最少条数：逐五行按确定性分序取足；常态口径取不足时以放宽口径（上限 +6）重试 */
      Object.keys(quota).forEach(function (w) {
        var need = quota[w], got = 0;
        var scales = [0, 6];
        for (var si = 0; si < scales.length && got < need && picked.length < count; si++) {
          var list = wxList(w);
          for (var i = 0; i < list.length && got < need && picked.length < count; i++) {
            if (take(list[i], scales[si])) got++;
          }
        }
      });
      /* 差额轮转：推荐数量的余额在配额五行间轮转均分（各五行候选按确定性分序）；
         配额五行候选取尽仍不足时，由后续常态取用从其余未排除五行补足 */
      var wxKeys = Object.keys(quota), wxSeq = {}, wxCur = {};
      wxKeys.forEach(function (w) {
        wxSeq[w] = wxList(w); wxCur[w] = 0;
      });
      var moved = true;
      while (picked.length < count && moved) {
        moved = false;
        for (var k = 0; k < wxKeys.length && picked.length < count; k++) {
          var w2 = wxKeys[k], seq2 = wxSeq[w2], i2 = wxCur[w2];
          while (i2 < seq2.length && !take(seq2[i2])) i2++;
          wxCur[w2] = i2;
          if (i2 < seq2.length) moved = true;
        }
      }
    }
    /* 常态与逐级放宽取用至推荐数量：先常态口径再放宽（上限 +1~+6） */
    var relaxedLv = 0;
    function fillRelax(target) {
      var list = sortedTier();
      for (var i = 0; i < list.length && picked.length < target; i++) take(list[i], 0);
      for (var s = 1; s <= 6 && picked.length < target; s++) {
        for (var i2 = 0; i2 < list.length && picked.length < target; i2++) {
          if (take(list[i2], s) && s > relaxedLv) relaxedLv = s;
        }
      }
    }
    fillRelax(count);
    /* 性别构成升级：本性别类取不足推荐数量时逐级放行，缺口不超过一成补中性（9:1），
       缺口更大补中性与异性（7:2:1）；升级后重新走常态与放宽取用 */
    if (CLIM && picked.length < count) {
      var needG = count - picked.length;
      if (needG <= Math.ceil(count * 0.1)) {
        CLIM.n = needG;
      } else {
        CLIM.n = Math.round(count * 0.2);
        CLIM[oppCls] = Math.round(count * 0.1);
      }
      fillRelax(count);
    }
    /* 终极兜底：极窄池（字辈固定、生僻姓、强约束叠加）仍不足推荐数量时，仅按名字去重取满 */
    if (picked.length < count) {
      var fl = sortedTier();
      for (var j5 = 0; j5 < fl.length && picked.length < count; j5++) {
        if (!nameSet[fl[j5].name]) {
          nameSet[fl[j5].name] = 1;
          picked.push(fl[j5]);
          relaxedLv = 9;
        }
      }
    }
    /* 名单实际各五行条数（按名首字）与配额达成情况（以最终名单实数为准） */
    var wxAll = {}, wxGot = {}, wxShort = {};
    picked.forEach(function (n) { wxAll[n.charWx[0]] = (wxAll[n.charWx[0]] || 0) + 1; });
    if (quota) {
      Object.keys(quota).forEach(function (w) {
        wxGot[w] = wxAll[w] || 0;
        if (wxGot[w] < quota[w]) wxShort[w] = quota[w] - wxGot[w];
      });
    }

    if (quota && !picked.length) {
      return { ok: false, xst: xst, reason: '所选五行在该姓氏下无候选（按义五行计），请调整五行组合、数量或名字字数。' };
    }

    return { ok: true, xing: xing, xst: xst, candidateCount: rawT.count || rawT[0].length, len: nameLen,
      relaxed: relaxedLv,
      wxQuota: quota, wxGot: wxGot, wxShort: wxShort, wxCount: wxAll,
      wxExcl: Object.keys(wxExcl).length ? Object.keys(wxExcl) : null,
      bzExemptWx: beizi && wxExcl[yiWxOf(beizi)] ? beizi : null,
      list: picked.map(function (n) {
        return { name: n.name, pinyin: n.pinyin, shuli: n.shuli,
          gridNote: n.gridNote,
          q: n.q, sound: n.sound, sem: n.sem, charWx: n.charWx, charWxShu: n.charWxShu,
          xi: n.xi, word: n.word,
          chars: n.chars,
          taboo: n.taboo, tabooWord: n.tabooWord, form: n.form };
      }) };
  }

  /* 排序口径一句话：页面口径说明与 AI 摘要共用同一份，权重改动只落在 dscore 与本函数两处相随 */
  function rankNote(){
    return '喜用 25、字义 15、意境 15、音律 20、字形 5、数理 10，另典籍正源加 12、成词加 4、当代热字减 6 或 3';
  }

  return { generate: generate, rankNote: rankNote };
})();
