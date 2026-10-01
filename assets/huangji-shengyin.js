/* huangji-shengyin.js 《皇极经世》声音唱和全表与声律检索
 * 数据来源：维基文库四库本《皇極經世書》卷七上观物篇三十五起唱和诸图逐位录字，
 * 与维基百科皇极经世声音唱和图条目（据李荣《切韵音系》归纳）互校定稿；
 * 四库录文中的形近讹字依音理与通行本勘正：乾蚪作乾虬、目兒作目皃（皃与馬美米同属明母）、
 * 普扑作普朴、寤聲之卜作十（缉入与禁欠同摄）、七声之卜作十、义赤作叉赤。
 * 声表十行：每声開日、翕月、開星、翕辰四组，每组平上去入四位；○为有声无字、计用声，●为黑方不用。
 * 音表十二行：每音清水、濁火、清土、濁石四组，每组開發收閉四位；□为有音无字、计用音，■为黑方不用。
 * 自校验：声一百六十位去黑四十八用一百一十二；音一百九十二位去黑四十用一百五十二；
 * 用声乘用音一万七千零二十四，即观物篇六十一动数，不符即拒载。
 * 表文数据留四库本繁体为单一真源，显示一律转简体（与年表同制，倒排站内简繁表，
 * 乾等表外用字原样保留），检索简繁两形并收。
 */
(function (global) {
  'use strict';

  var SG_GROUPS = ['開日', '翕月', '開星', '翕辰'];
  var SG_TONES = ['平', '上', '去', '入'];
  var YN_GROUPS = ['清水', '濁火', '清土', '濁石'];
  var YN_DEGS = ['開', '發', '收', '閉'];
  var SG_NAMES = ['一声', '二声', '三声', '四声', '五声', '六声', '七声', '八声', '九声', '十声'];
  var YN_NAMES = ['一音', '二音', '三音', '四音', '五音', '六音', '七音', '八音', '九音', '十音', '十一音', '十二音'];

  var SHENG = [
    [['多', '可', '个', '舌'], ['禾', '火', '化', '八'], ['開', '宰', '愛', '○'], ['回', '每', '退', '○']],
    [['良', '兩', '向', '○'], ['光', '廣', '況', '○'], ['丁', '井', '亘', '○'], ['兄', '永', '瑩', '○']],
    [['千', '典', '旦', '○'], ['元', '犬', '半', '○'], ['臣', '引', '艮', '○'], ['君', '允', '巽', '○']],
    [['刀', '早', '孝', '岳'], ['毛', '寶', '報', '霍'], ['牛', '斗', '奏', '六'], ['○', '○', '○', '玉']],
    [['妻', '子', '四', '日'], ['衰', '○', '帥', '骨'], ['○', '○', '○', '德'], ['龜', '水', '貴', '北']],
    [['宮', '孔', '眾', '○'], ['龍', '甬', '用', '○'], ['魚', '鼠', '去', '○'], ['烏', '虎', '兔', '○']],
    [['心', '審', '禁', '○'], ['○', '○', '○', '十'], ['男', '坎', '欠', '○'], ['○', '○', '○', '妾']],
    [['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●']],
    [['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●']],
    [['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●'], ['●', '●', '●', '●']]
  ];

  var YIN = [
    [['古', '甲', '九', '癸'], ['□', '□', '近', '揆'], ['坤', '巧', '丘', '弃'], ['□', '□', '乾', '虬']],
    [['黑', '花', '香', '血'], ['黃', '華', '雄', '賢'], ['五', '瓦', '仰', '□'], ['吾', '牙', '月', '堯']],
    [['安', '亞', '乙', '一'], ['□', '爻', '王', '寅'], ['母', '馬', '美', '米'], ['目', '皃', '眉', '民']],
    [['夫', '法', '□', '飛'], ['父', '凡', '□', '吠'], ['武', '晚', '□', '尾'], ['文', '萬', '□', '未']],
    [['卜', '百', '丙', '必'], ['步', '白', '備', '鼻'], ['普', '朴', '品', '匹'], ['旁', '排', '平', '瓶']],
    [['東', '丹', '帝', '■'], ['兌', '大', '弟', '■'], ['土', '貪', '天', '■'], ['同', '覃', '田', '■']],
    [['乃', '妳', '女', '■'], ['內', '南', '年', '■'], ['老', '冷', '呂', '■'], ['鹿', '犖', '離', '■']],
    [['走', '哉', '足', '■'], ['自', '在', '匠', '■'], ['草', '采', '七', '■'], ['曹', '才', '全', '■']],
    [['思', '三', '星', '■'], ['寺', '□', '象', '■'], ['□', '□', '□', '■'], ['□', '□', '□', '■']],
    [['■', '山', '手', '■'], ['■', '士', '石', '■'], ['■', '□', '耳', '■'], ['■', '□', '二', '■']],
    [['■', '莊', '震', '■'], ['■', '乍', '□', '■'], ['■', '叉', '赤', '■'], ['■', '崇', '辰', '■']],
    [['■', '卓', '中', '■'], ['■', '宅', '直', '■'], ['■', '坼', '丑', '■'], ['■', '茶', '呈', '■']]
  ];

  /* 展平为位表：use 为真即计入用数（字位与无字位），black 为黑方 */
  function flatten(src, noneCh, blackCh) {
    var cells = [];
    for (var r = 0; r < src.length; r++) {
      for (var g = 0; g < 4; g++) {
        for (var t = 0; t < 4; t++) {
          var ch = src[r][g][t];
          cells.push({ r: r, g: g, t: t, ch: ch, use: ch !== blackCh, none: ch === noneCh, black: ch === blackCh });
        }
      }
    }
    var used = cells.filter(function (c) { return c.use; });
    return { cells: cells, used: used, noneN: used.filter(function (c) { return c.none; }).length, blackN: cells.length - used.length };
  }

  var SG = flatten(SHENG, '○', '●');
  var YN = flatten(YIN, '□', '■');
  var TOTAL = SG.used.length * YN.used.length;

  /* 原典自校：数不合即拒载，防转录走样后静默上站 */
  (function verify() {
    var bad = [];
    if (SG.cells.length !== 160) bad.push('声位' + SG.cells.length);
    if (SG.used.length !== 112) bad.push('用声' + SG.used.length);
    if (SG.blackN !== 48) bad.push('声黑方' + SG.blackN);
    if (YN.cells.length !== 192) bad.push('音位' + YN.cells.length);
    if (YN.used.length !== 152) bad.push('用音' + YN.used.length);
    if (YN.blackN !== 40) bad.push('音黑方' + YN.blackN);
    if (TOTAL !== 17024) bad.push('唱和' + TOTAL);
    if (bad.length) throw new Error('皇极声音唱和数据自校验未过：' + bad.join('、'));
  })();

  /* 唱和一格：音字与声字相合成音节；无字位以 □、○ 原样占位 */
  function comboText(yc, sc) {
    return (yc === '□' ? '□' : yc) + (sc === '○' ? '○' : sc);
  }

  function posName(kind, p) {
    if (kind === 's') return SG_NAMES[p.r] + SG_GROUPS[p.g] + SG_TONES[p.t] + '位';
    return YN_NAMES[p.r] + YN_GROUPS[p.g] + YN_DEGS[p.t] + '位';
  }

  function usedIndex(list, p) {
    for (var i = 0; i < list.used.length; i++) {
      var u = list.used[i];
      if (u.r === p.r && u.g === p.g && u.t === p.t) return i + 1;
    }
    return 0;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 显示层繁转简：复用年表的 hjJianti（倒排站内简繁表，一繁对多简取首个，表外字原样），
   * 仅在 innerHTML 落点整体转换，数据层仍为四库本繁体；无 hjJianti 的环境（单测）原样返回。 */
  function disp(t) {
    var f = global.hjJianti;
    return typeof f === 'function' ? f(t) : t;
  }

  /* 源表（声表或音表）：组头两行＋逐位格 */
  function sourceTable(kind) {
    var isS = kind === 's';
    var list = isS ? SG : YN;
    var groups = isS ? SG_GROUPS : YN_GROUPS;
    var cols = isS ? SG_TONES : YN_DEGS;
    var names = isS ? SG_NAMES : YN_NAMES;
    var src = isS ? SHENG : YIN;
    var h1 = '<tr><th rowspan="2">' + (isS ? '声' : '音') + '</th>';
    var h2 = '<tr>';
    for (var g = 0; g < 4; g++) {
      h1 += '<th colspan="4">' + groups[g] + '</th>';
      for (var t = 0; t < 4; t++) h2 += '<th>' + cols[t] + '</th>';
    }
    var body = '';
    for (var r = 0; r < src.length; r++) {
      body += '<tr><th>' + names[r] + '</th>';
      for (g = 0; g < 4; g++) {
        for (t = 0; t < 4; t++) {
          var ch = src[r][g][t];
          var cls = ch === '●' || ch === '■' ? ' sy-b' : (ch === '○' || ch === '□' ? ' sy-n' : '');
          body += '<td class="sy-c' + cls + '">' + esc(ch) + '</td>';
        }
      }
      body += '</tr>';
    }
    return '<table class="hj-np sy-grid"><thead>' + h1 + '</tr>' + h2 + '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  /* 唱和条：固定一个用声位（或用音位），与对方全表逐位相唱和 */
  function comboStrip(kind, p) {
    var fixS = kind === 's';
    var sc = fixS ? SG.cells[p.r * 16 + p.g * 4 + p.t] : null;
    var yc = fixS ? null : YN.cells[p.r * 16 + p.g * 4 + p.t];
    var rows = fixS ? YIN : SHENG;
    var rowNames = fixS ? YN_NAMES : SG_NAMES;
    var groups = fixS ? YN_GROUPS : SG_GROUPS;
    var cols = fixS ? YN_DEGS : SG_TONES;
    var fixName = posName(fixS ? 's' : 'y', p);
    var h1 = '<tr><th rowspan="2">' + (fixS ? '声' : '音') + '与' + (fixS ? '音' : '声') + '</th>';
    var h2 = '<tr>';
    for (var g = 0; g < 4; g++) {
      h1 += '<th colspan="4">' + groups[g] + '</th>';
      for (var t = 0; t < 4; t++) h2 += '<th>' + cols[t] + '</th>';
    }
    var body = '';
    for (var r = 0; r < rows.length; r++) {
      body += '<tr><th>' + rowNames[r] + '</th>';
      for (g = 0; g < 4; g++) {
        for (t = 0; t < 4; t++) {
          var y2, s2, txt, cls = ' sy-c';
          if (fixS) { y2 = rows[r][g][t]; s2 = sc.ch; }
          else { y2 = yc.ch; s2 = rows[r][g][t]; }
          if (y2 === '■' || s2 === '●') { txt = y2 === '■' ? '■' : '●'; cls += ' sy-b'; }
          else { txt = comboText(y2, s2); if (y2 === '□' || s2 === '○') cls += ' sy-n'; }
          body += '<td class="' + cls + '">' + esc(txt) + '</td>';
        }
      }
      body += '</tr>';
    }
    var n = fixS ? YN.used.length : SG.used.length;
    return '<div class="sub-note">字 ' + esc(fixS ? sc.ch : yc.ch) + ' 在' + (fixS ? '声' : '音') + '表：' + esc(fixName) +
      '，用' + (fixS ? '声' : '音') + '第 ' + usedIndex(fixS ? SG : YN, p) + ' 位；与' + (fixS ? '地音' : '天声') +
      '全表逐位唱和得 ' + n + ' 格，黑方格不入用数。</div>' +
      '<table class="hj-np sy-grid"><thead>' + h1 + '</tr>' + h2 + '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  /* 检索：单字直查两表，兼收简体输入（经站内简繁表转繁后复检） */
  function lookup(ch) {
    var cands = [ch];
    var jf = global.JIANFAN;
    if (jf && jf[ch]) cands.push(jf[ch]);
    var hitS = [], hitY = [];
    SG.cells.forEach(function (c) { if (cands.indexOf(c.ch) >= 0) hitS.push(c); });
    YN.cells.forEach(function (c) { if (cands.indexOf(c.ch) >= 0) hitY.push(c); });
    return { sheng: hitS, yin: hitY };
  }

  function search(q) {
    q = String(q || '').trim();
    if (!q) return '<p class="notice">请输入一个字。</p>';
    if ([...q].length !== 1) return '<p class="notice">声律检索只收单字，请改用一个汉字。</p>';
    if ('○□●■'.indexOf(q) >= 0) return '<p class="notice">' + esc(q) + ' 是位标不是字，请输入表中之字。</p>';
    var hit = lookup(q);
    if (!hit.sheng.length && !hit.yin.length) {
      return '<p class="notice">字 ' + esc(q) + ' 不见于声表与音表。两表只收邵雍原定的一百六十声位、一百九十二音位所载之字。</p>';
    }
    var out = '';
    hit.sheng.forEach(function (p) { out += comboStrip('s', p); });
    hit.yin.forEach(function (p) { out += comboStrip('y', p); });
    return out;
  }

  /* 矩阵分块：声之一组（十六位）乘音之一组（十六位），黑方格不入用数 */
  function block(si, yi) {
    var h1 = '<tr><th rowspan="2">' + SG_NAMES[si] + '与' + YN_NAMES[yi] + '</th><th rowspan="2">声与音</th>';
    var h2 = '<tr>';
    for (var g = 0; g < 4; g++) {
      h1 += '<th colspan="4">' + YN_GROUPS[g] + '</th>';
      for (var t = 0; t < 4; t++) h2 += '<th>' + YN_DEGS[t] + '</th>';
    }
    var body = '', nUse = 0;
    for (var sg = 0; sg < 4; sg++) {
      for (var st = 0; st < 4; st++) {
        body += (st === 0 ? '<tr><th rowspan="4" class="sy-grp">' + SG_GROUPS[sg] + '</th>' : '<tr>');
        body += '<th class="sy-tone">' + SG_TONES[st] + '</th>';
        for (g = 0; g < 4; g++) {
          for (t = 0; t < 4; t++) {
            var sc = SHENG[si][sg][st], yc = YIN[yi][g][t], txt, cls = ' sy-c';
            if (sc === '●') { txt = '●'; cls += ' sy-b'; }
            else if (yc === '■') { txt = '■'; cls += ' sy-b'; }
            else {
              txt = comboText(yc, sc);
              if (yc === '□' || sc === '○') cls += ' sy-n';
              nUse++;
            }
            body += '<td class="' + cls + '">' + esc(txt) + '</td>';
          }
        }
        body += '</tr>';
      }
    }
    var cap = '本块用声 ' + SG.used.filter(function (c) { return c.r === si; }).length +
      ' 位、用音 ' + YN.used.filter(function (c) { return c.r === yi; }).length +
      ' 位，两两相唱和得 ' + nUse + ' 格；全矩阵 ' + SG.used.length + ' 乘 ' + YN.used.length +
      ' 为 ' + TOTAL + ' 唱和。';
    return '<div class="sub-note">' + cap + '</div>' +
      '<table class="hj-np sy-grid"><thead>' + h1 + '</tr>' + h2 + '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  function el(id) { return document.getElementById(id); }

  function init() {
    var stats = el('hjSyStats');
    if (stats) {
      stats.innerHTML = '声一百六十位：黑方四十八（八、九、十声全黑），用声一百一十二，内有声无字二十九位；' +
        '音一百九十二位：黑方四十，用音一百五十二，内有音无字二十位；' +
        '用声乘用音得 ' + TOTAL + '，即观物篇六十一动数（植数同），再自乘得动植通数二万八千九百八十一万六千五百七十六，与观物篇数表同口径。';
    }
    var sh = el('hjSySheng'); if (sh) sh.innerHTML = disp(sourceTable('s'));
    var yn = el('hjSyYin'); if (yn) yn.innerHTML = disp(sourceTable('y'));

    var q = el('hjSyQ');
    if (q) {
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') runSearch(); });
      var b = el('hjSyGo'); if (b) b.addEventListener('click', runSearch);
    }
    var sb = el('hjSySb'), yb = el('hjSyYb');
    if (sb && yb) {
      var oh = '', j;
      for (j = 0; j < 10; j++) oh += '<option value="' + j + '">' + SG_NAMES[j] + '</option>';
      sb.innerHTML = oh;
      oh = '';
      for (j = 0; j < 12; j++) oh += '<option value="' + j + '">' + YN_NAMES[j] + '</option>';
      yb.innerHTML = oh;
      var re = function () { el('hjSyBlock').innerHTML = disp(block(+sb.value, +yb.value)); };
      sb.addEventListener('change', re);
      yb.addEventListener('change', re);
      re();
    }
  }

  function runSearch() {
    var q = el('hjSyQ'), out = el('hjSyHits');
    if (!q || !out) return;
    out.innerHTML = disp(search(q.value));
  }

  global.HUANGJI_SY = {
    SHENG: SHENG, YIN: YIN, SG: SG, YN: YN, TOTAL: TOTAL,
    lookup: lookup, search: search, sourceTable: sourceTable, block: block, init: init
  };

  if (typeof document !== 'undefined') {
    var boot = function () { if (el('hjSyStats')) init(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : this);
