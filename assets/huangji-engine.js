/* ============================================================
 * huangji-engine.js 皇极经世引擎（纯计算，无 DOM 依赖，暴露全局 HJ）
 * 口径：据四库本《皇极经世书》卷一、卷五校录
 * 体系：邵雍《皇极经世书》元会运世
 *   1 元 = 12 会 = 360 运 = 4320 世 = 129600 年
 *   1 会 = 30 运 = 10800 年；1 运 = 12 世 = 360 年；1 世 = 30 年
 * 锚点：元 1 年 = 公元前 67017 年（天文年编号 A = -67016）。
 *   检验：唐尧即位（前 2357，甲辰）落 巳会 第 180 运（癸亥）第 2156 世（己未）；
 *         午会起点 = 公元前 2217 年；公元 2026 年在 午会 第 192 运（乙亥）第 2302 世（乙酉）。
 * 纪年：内部一律天文年编号 A（公元 m 年 = m；公元前 n 年 = 1 - n，0 年 = 公元前 1 年）。
 * 干支：自算，干支 = 甲子起 (A-4) mod 60（floor mod，对公元前同样成立）。
 * 元循环：超出 129600 年按 元序号 顺延/逆推（第 N 元），本元为第 1 元。
 * 依赖：无（引擎自带卦数据与圆图序）。
 * ============================================================ */

const HJ = (function () {

  /* ---------------- 基本常数 ---------------- */
  var YUAN = 129600, HUI = 10800, YUN = 360, SHI = 30;
  var Y0 = -67016;                 // 元 1 年（天文编号）：公元前 67017 年
  var HUI_ZHI = '子丑寅卯辰巳午未申酉戌亥';
  /* 十二辟卦（消息卦）配十二会：子会复起，亥会坤终 */
  var BIGUA = ['复', '临', '泰', '大壮', '夬', '乾', '姤', '遁', '否', '观', '剥', '坤'];
  /* 辟卦短名 → 六十四卦全名（供卦画渲染与卦辞查取） */
  var BIGUA_FULL = ['地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '乾为天', '天风姤', '天山遁', '天地否', '风地观', '山地剥', '坤为地'];
  var JIAZI = (function () {
    var G = '甲乙丙丁戊己庚辛壬癸', Z = '子丑寅卯辰巳午未申酉戌亥', a = [];
    for (var i = 0; i < 60; i++) a.push(G[i % 10] + Z[i % 12]);
    return a;
  })();
  /* 运、世标注（据四库本卷五原书实证：經運之癸一百八十、經世之未二千一百五十六）：
     运标十干循环、世标十二支循环，两条独立小循环，非六十甲子合成。 */
  var GAN10 = '甲乙丙丁戊己庚辛壬癸', ZHI12 = '子丑寅卯辰巳午未申酉戌亥';
  function yunGan(noG) { return GAN10[(((noG - 1) % 10) + 10) % 10]; }
  function shiZhi(noG) { return ZHI12[(((noG - 1) % 12) + 12) % 12]; }

  /* ---------------- 卦数据（引擎内置，避免跨文件依赖） ---------------- */
  /* 八卦三爻：自下而上 [初,中,上]，1=阳 0=阴 */
  var TRI_BITS = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  };
  /* 六十四卦名 GUA64[上卦][下卦序]（下卦序按 乾兑离震巽坎艮坤 = 0..7） */
  var TRI_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  var GUA64 = {
    '乾': ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
    '兑': ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
    '离': ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
    '震': ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
    '巽': ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
    '坎': ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
    '艮': ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
    '坤': ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地']
  };
  /* 卦名 → bits6（自下而上）。由 GUA64 与 TRI_BITS 生成一次。 */
  var BITS_BY_NAME = (function () {
    var m = {};
    TRI_ORDER.forEach(function (up) {
      GUA64[up].forEach(function (nm, li) {
        var low = TRI_ORDER[li];
        m[nm] = TRI_BITS[low].concat(TRI_BITS[up]);
      });
    });
    return m;
  })();
  /* 先天六十四卦圆图次序（乾一起，八方各八卦，至坤终；同 daoli 页所用序） */
  var XT_ROUND = ['乾为天', '泽天夬', '火天大有', '雷天大壮', '风天小畜', '水天需', '山天大畜', '地天泰',
    '天泽履', '兑为泽', '火泽睽', '雷泽归妹', '风泽中孚', '水泽节', '山泽损', '地泽临',
    '天火同人', '泽火革', '离为火', '雷火丰', '风火家人', '水火既济', '山火贲', '地火明夷',
    '天雷无妄', '泽雷随', '火雷噬嗑', '震为雷', '风雷益', '水雷屯', '山雷颐', '地雷复',
    '天风姤', '泽风大过', '火风鼎', '雷风恒', '巽为风', '水风井', '山风蛊', '地风升',
    '天水讼', '泽水困', '火水未济', '雷水解', '风水涣', '坎为水', '山水蒙', '地水师',
    '天山遁', '泽山咸', '火山旅', '雷山小过', '风山渐', '水山蹇', '艮为山', '地山谦',
    '天地否', '泽地萃', '火地晋', '雷地豫', '风地观', '水地比', '山地剥', '坤为地'];
  /* bits 串 → 卦名（供爻变后反查卦名） */
  var NAME_BY_BITS = (function () {
    var m = {};
    XT_ROUND.forEach(function (nm) { m[BITS_BY_NAME[nm].join('')] = nm; });
    return m;
  })();
  /* 卦名 → 圆图序号（0..63） */
  var XT_INDEX = (function () {
    var m = {};
    XT_ROUND.forEach(function (nm, i) { m[nm] = i; });
    return m;
  })();
  /* 六十四卦卦辞（同全站 daoli 页整理文本，一句为限） */
  var GUACI = {
    '乾为天': '元，亨，利，贞。', '坤为地': '元亨，利牝马之贞。',
    '水雷屯': '元亨，利贞。勿用有攸往，利建侯。', '山水蒙': '亨。匪我求童蒙，童蒙求我。',
    '水天需': '有孚，光亨，贞吉。利涉大川。', '天水讼': '有孚窒，惕中吉。终凶。',
    '地水师': '贞，丈人吉，无咎。', '水地比': '吉。原筮，元永贞，无咎。',
    '风天小畜': '亨。密云不雨，自我西郊。', '天泽履': '履虎尾，不咥人，亨。',
    '地天泰': '小往大来，吉亨。', '天地否': '否之匪人，不利君子贞，大往小来。',
    '天火同人': '同人于野，亨。利涉大川。', '火天大有': '元亨。',
    '地山谦': '亨，君子有终。', '雷地豫': '利建侯行师。',
    '泽雷随': '元亨利贞，无咎。', '山风蛊': '元亨，利涉大川。先甲三日，后甲三日。',
    '地泽临': '元，亨，利，贞。至于八月有凶。', '风地观': '盥而不荐，有孚颙若。',
    '火雷噬嗑': '亨。利用狱。', '山火贲': '亨。小利有攸往。',
    '山地剥': '不利有攸往。', '地雷复': '亨。出入无疾，朋来无咎。',
    '天雷无妄': '元，亨，利，贞。其匪正有眚，不利有攸往。', '山天大畜': '利贞。不家食吉，利涉大川。',
    '山雷颐': '贞吉。观颐，自求口实。', '泽风大过': '栋桡，利有攸往，亨。',
    '坎为水': '习坎，有孚，维心亨，行有尚。', '离为火': '利贞，亨。畜牝牛，吉。',
    '泽山咸': '亨，利贞。取女吉。', '雷风恒': '亨，无咎，利贞，利有攸往。',
    '天山遁': '亨，小利贞。', '雷天大壮': '利贞。',
    '火地晋': '康侯用锡马蕃庶，昼日三接。', '地火明夷': '利艰贞。',
    '风火家人': '利女贞。', '火泽睽': '小事吉。',
    '水山蹇': '利西南，不利东北。利见大人，贞吉。', '雷水解': '利西南。无所往，其来复吉。',
    '山泽损': '有孚，元吉，无咎，可贞。', '风雷益': '利有攸往，利涉大川。',
    '泽天夬': '扬于王庭，孚号有厉。', '天风姤': '女壮，勿用取女。',
    '泽地萃': '亨。王假有庙，利见大人。', '地风升': '元亨，用见大人，勿恤，南征吉。',
    '泽水困': '亨，贞，大人吉，无咎。', '水风井': '改邑不改井，无丧无得，往来井井。',
    '泽火革': '巳日乃孚，元亨利贞，悔亡。', '火风鼎': '元吉，亨。',
    '震为雷': '亨。震来虩虩，笑言哑哑。', '艮为山': '艮其背，不获其身，行其庭，不见其人，无咎。',
    '风山渐': '女归吉，利贞。', '雷泽归妹': '征凶，无攸利。',
    '雷火丰': '亨，王假之，勿忧，宜日中。', '火山旅': '小亨，旅贞吉。',
    '巽为风': '小亨，利有攸往，利见大人。', '兑为泽': '亨，利贞。',
    '风水涣': '亨。王假有庙，利涉大川，利贞。', '水泽节': '亨。苦节不可贞。',
    '风泽中孚': '豚鱼吉，利涉大川，利贞。', '雷山小过': '亨，利贞。可小事，不可大事。',
    '水火既济': '亨，小利贞。初吉终乱。', '火水未济': '亨。小狐汔济，濡其尾，无攸利。'
  };

  /* ---------------- 干支与纪年 ---------------- */
  function gzOf(A) {
    var i = (A - 4) % 60; if (i < 0) i += 60;
    return JIAZI[i];
  }
  /* 公元前 / 公元 显示（A 为天文年编号） */
  function fmtYear(A) {
    return A >= 1 ? ('公元' + A + '年') : ('公元前' + (1 - A) + '年');
  }
  /* 年份输入解析：支持 2026 / -2357 / 前2357 / 公元前2357 / 公元2026 */
  function parseYearInput(s) {
    if (s == null) return null;
    s = String(s).trim().replace(/\s+/g, '');
    if (!s) return null;
    var m = s.match(/^(公元前|前|BC|-)\s*(\d{1,6})(年)?$/i) || s.match(/^(公元)?(\d{1,6})\s*(年)?$/);
    if (!m) return null;
    if (/^(公元前|前|BC|-)$/i.test(m[1])) {
      var n = parseInt(m[2], 10);
      return (n >= 1 && n <= 999999) ? (1 - n) : null;   // 公元前 n 年 → 1-n
    }
    var p = parseInt(m[2], 10);
    return (p >= 1 && p <= 999999) ? p : null;
  }

  /* ---------------- 核心定位 ---------------- */
  /* A → 元会运世四级定位（含各层起止天文年、干支、辟卦） */
  function locate(A) {
    if (typeof A !== 'number' || !isFinite(A) || A < -1999999 || A > 999999) return null;
    var off = A - Y0;                                   // 0 基全序年
    var yuanNo = Math.floor(off / YUAN) + 1;            // 元序号（本元 = 1）
    var offYuan = ((off % YUAN) + YUAN) % YUAN;         // 元内 0 基年序
    var huiI = Math.floor(offYuan / HUI);               // 会序 0..11
    var offHui = offYuan - huiI * HUI;
    var yunG = Math.floor(offYuan / YUN) + 1;           // 运（元内全局序 1..360）
    var yunH = Math.floor(offHui / YUN) + 1;            // 运（会内序 1..30）
    var offYun = offHui - (yunH - 1) * YUN;
    var shiG = Math.floor(offYuan / SHI) + 1;           // 世（元内全局序 1..4320）
    var shiH = Math.floor(offHui / SHI) + 1;            // 世（会内序 1..360）
    var shiY = Math.floor(offYun / SHI) + 1;            // 世（运内序 1..12）
    var offShi = offYun - (shiY - 1) * SHI;
    var yinShi = offShi + 1;                            // 世内第 N 年（1..30）
    var huiStart = A - offHui;
    return {
      A: A, gz: gzOf(A), fmt: fmtYear(A),
      yuanNo: yuanNo,
      hui: {
        idx: huiI, zhi: HUI_ZHI[huiI], bigua: BIGUA[huiI],
        start: huiStart, end: huiStart + HUI - 1,
        inYear: offHui + 1                              // 会内第 N 年
      },
      yun: {
        noG: yunG, noH: yunH, gan: yunGan(yunG),
        start: A - offYun, end: A - offYun + YUN - 1,
        inYear: offYun + 1                              // 运内第 N 年
      },
      shi: {
        noG: shiG, noH: shiH, noY: shiY, zhi: shiZhi(shiG),
        start: A - offShi, end: A - offShi + SHI - 1,
        inYear: yinShi                                  // 世内第 N 年
      }
    };
  }
  /* 会序 0..11 → 该会起止（本元内） */
  function huiRange(huiI, yuanNo) {
    var base = Y0 + ((yuanNo || 1) - 1) * YUAN;
    return { start: base + huiI * HUI, end: base + (huiI + 1) * HUI - 1 };
  }
  /* 干支序数（0..59）→ 干支名 */
  function jiazi(i) { return JIAZI[((i % 60) + 60) % 60]; }

  /* ---------------- 卦气层（据《皇极经世书》以元经会篇原文定稿） ----------------
     原文（观物篇一至十一）：每会直五卦（子会复颐屯益震、丑会噬嗑随无妄明夷贲、
     寅会既济家人丰革同人、卯会临损节中孚归妹、辰会睽兑履泰大畜、巳会需小畜大壮大有夬、
     午会姤大过鼎恒巽、未会井蛊升讼困、申会未济解涣蒙师、酉会遁咸旅小过渐、
     戌会蹇艮谦否萃、亥会晋豫观比剥），每卦主六运；中卦当会之中；
     闰卦为乾坤坎离四正卦（离闰子丑寅，乾闰卯辰巳，坎闰午未申，坤闰酉戌亥）。
     由此得六十卦序（先天圆图去乾坤坎离）：运卦 = 六十卦序[ floor((运全元序-1)/6) ]，
     校验：运1=复（子会起）、运13至18=屯（屯当子会之中）、运181=姤（午会起）、
           运193至198=鼎（鼎当午会之中）、运355至360=剥（亥会末）。 */
  var GUA60 = ['地雷复', '山雷颐', '水雷屯', '风雷益', '震为雷',
    '火雷噬嗑', '泽雷随', '天雷无妄', '地火明夷', '山火贲',
    '水火既济', '风火家人', '雷火丰', '泽火革', '天火同人',
    '地泽临', '山泽损', '水泽节', '风泽中孚', '雷泽归妹',
    '火泽睽', '兑为泽', '天泽履', '地天泰', '山天大畜',
    '水天需', '风天小畜', '雷天大壮', '火天大有', '泽天夬',
    '天风姤', '泽风大过', '火风鼎', '雷风恒', '巽为风',
    '水风井', '山风蛊', '地风升', '天水讼', '泽水困',
    '火水未济', '雷水解', '风水涣', '山水蒙', '地水师',
    '天山遁', '泽山咸', '火山旅', '雷山小过', '风山渐',
    '水山蹇', '艮为山', '地山谦', '天地否', '泽地萃',
    '火地晋', '雷地豫', '风地观', '水地比', '山地剥'];
  /* 每会闰卦（四正卦各闰三会） */
  var LEAP_GUA = ['离', '离', '离', '乾', '乾', '乾', '坎', '坎', '坎', '坤', '坤', '坤'];
  /* 值年卦：六十卦一年一卦、自复起剥终（60年一周）；锚点取公元2012年（壬辰）值复卦，
     与通行值年表相合（2020年明夷、2025年泽火革、2026年天火同人）。 */
  var ZHINIAN_ANCHOR = 2012;
  /* 会卦 = 十二辟卦（民间通行参照层，与六十卦体系并存展示） */
  function huiGua(huiI) { return BIGUA[((huiI % 12) + 12) % 12]; }
  /* 某会直五卦（原书以元经会口径） */
  function huiGua5(huiI) {
    var base = (((huiI % 12) + 12) % 12) * 5;
    return GUA60.slice(base, base + 5);
  }
  /* 某会之中卦 */
  function zhongGua(huiI) { return huiGua5(huiI)[2]; }
  /* 某会闰卦（乾坤坎离） */
  function leapGua(huiI) { return LEAP_GUA[((huiI % 12) + 12) % 12]; }
  /* 直卦（原书《以元经会》口径）：运 n（元内全元序 1..360）所属之卦，每卦主六运 */
  function yunGuaOf(noG) {
    var off = ((((noG - 1) % 360) + 360) % 360);
    var idx = Math.floor(off / 6);
    return { name: GUA60[idx], seqIdx: idx, from: idx * 6 + 1, to: idx * 6 + 6 };
  }
  /* 定位结果 → 直卦信息（原书口径：本运所直之卦，主六运七十二世） */
  function yunGua(l) {
    if (!l) return null;
    var g = yunGuaOf(l.yun.noG);
    return { name: g.name, seqIdx: g.seqIdx, from: g.from, to: g.to };
  }
  /* 爻变运卦（后世传承 A/C 口径，非原书年表原文）：直卦六爻变，一爻主一运 */
  function yunGuaBian(l) {
    if (!l) return null;
    var g = yunGuaOf(l.yun.noG);
    var yao = ((l.yun.noG - 1) % 6) + 1;             /* 直卦内第几运 → 第几爻 */
    var bits = BITS_BY_NAME[g.name].slice();
    bits[yao - 1] = bits[yao - 1] ? 0 : 1;
    return { name: NAME_BY_BITS[bits.join('')], zhiGua: g.name, yao: yao };
  }
  /* 爻变世卦（后世传承）：运卦六爻变，一爻主二世六十年。
     锚点核验：192运运卦=姤（大过上爻变），姤五爻变=火风鼎（1984-2043 世卦，与通行嵌套表相合）。 */
  function shiGuaBian(l) {
    if (!l) return null;
    var yg = yunGuaBian(l);
    var k = Math.min(6, Math.floor((l.A - l.yun.start) / 60) + 1);
    var bits = BITS_BY_NAME[yg.name].slice();
    bits[k - 1] = bits[k - 1] ? 0 : 1;
    return { name: NAME_BY_BITS[bits.join('')], yunGua: yg.name, yao: k };
  }
  /* 值年卦：一年一卦，六十卦自复起剥终循环 */
  function yearGua(l) {
    if (!l) return null;
    var idx = (((l.A - ZHINIAN_ANCHOR) % 60) + 60) % 60;
    return { name: GUA60[idx], seqIdx: idx };
  }
  /* 旬卦两说（后世传承，分歧待考）：
     甲说（爻变顺推）：世卦六爻变，一爻主十年，段序由世卦起自初爻顺数；
     乙说（通行表并载）：以段首年即值该卦（壬水居士表 2014-2023 蛊、2024-2033 丰）。
     两说在世卦中段互不相容，页内以甲说展示并注明分歧；乙说接口保留备考。 */
  function xunGuaJia(l) {
    if (!l) return null;
    var sg = shiGuaBian(l);
    var yao = (Math.floor((l.A - l.shi.start) / 10) % 6) + 1;
    var bits = BITS_BY_NAME[sg.name].slice();
    bits[yao - 1] = bits[yao - 1] ? 0 : 1;
    var segStart = l.shi.start + Math.floor((l.A - l.shi.start) / 10) * 10;
    return { name: NAME_BY_BITS[bits.join('')], base: sg.name, yao: yao, from: segStart, to: segStart + 9 };
  }
  function xunGuaYi(l) { return xunGuaJia(l); }

  /* 辟卦短名（复、临…）与八卦单名（乾、离…）转六十四卦全名；其余原样返回 */
  var TRI_FULL = { '乾': '乾为天', '兑': '兑为泽', '离': '离为火', '震': '震为雷', '巽': '巽为风', '坎': '坎为水', '艮': '艮为山', '坤': '坤为地' };
  function fullGuaName(nm) {
    var i = BIGUA.indexOf(nm);
    if (i >= 0) return BIGUA_FULL[i];
    return TRI_FULL[nm] || nm;
  }
  /* 六十四卦全名转短名：天风姤→姤、震为雷→震、泽风大过→大过、火雷噬嗑→噬嗑 */
  function shortGuaName(nm) {
    if (!nm) return '';
    return nm.indexOf('为') >= 0 ? nm.charAt(0) : nm.slice(-2);
  }
  /* 卦名 → {name, bits6, upper, lower, sym, ci} */
  function guaInfo(nm) {
    var bits = BITS_BY_NAME[nm];
    if (!bits) return null;
    var low = TRI_ORDER[0] && '';
    for (var i = 0; i < 8; i++) {
      if (TRI_BITS[TRI_ORDER[i]].join('') === bits.slice(0, 3).join('')) low = TRI_ORDER[i];
    }
    var up = '';
    for (var j = 0; j < 8; j++) {
      if (TRI_BITS[TRI_ORDER[j]].join('') === bits.slice(3, 6).join('')) up = TRI_ORDER[j];
    }
    var SYM = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' };
    return {
      name: nm, bits6: bits, upper: up, lower: low,
      usym: SYM[up], lsym: SYM[low],
      xt: XT_INDEX[nm], ci: GUACI[nm] || ''
    };
  }

  /* ---------------- 大事锚点（约 35 条，兼作校验样本） ----------------
     A 为天文年编号（公元前 n 年 = 1-n）。src 标注来源性质：
     hx = 史学通行纪年（含断代工程结论）；sj = 《皇极经世》原书纪年锚点。 */
  var ANCHORS = [
    { A: -2356, label: '唐尧即位', note: '甲辰。《皇极经世》以运经世起算之锚', src: 'sj' },
    { A: -2254, label: '虞舜摄位', note: '约年，举贤禅让之始', src: 'hx' },
    { A: -2069, label: '大禹受禅、夏朝肇建', note: '夏商周断代工程推定约前 2070', src: 'hx' },
    { A: -1599, label: '商汤灭夏、商朝建立', note: '断代工程推定约前 1600', src: 'hx' },
    { A: -1299, label: '盘庚迁殷', note: '商都定于殷，甲骨文时代', src: 'hx' },
    { A: -1045, label: '武王克商、西周建立', note: '乙未，断代工程定为前 1046', src: 'hx' },
    { A: -840, label: '共和元年', note: '庚申，中国史籍连续纪年之始', src: 'hx' },
    { A: -769, label: '平王东迁、春秋始', note: '辛未', src: 'hx' },
    { A: -550, label: '孔子诞生', note: '庚戌，约前 551', src: 'hx' },
    { A: -476, label: '战国始', note: '三家分晋后，约前 475', src: 'hx' },
    { A: -220, label: '秦统一六国', note: '庚辰，始皇称皇帝', src: 'hx' },
    { A: -201, label: '汉高祖即位、西汉建立', note: '己亥', src: 'hx' },
    { A: -137, label: '张骞通西域', note: '凿空丝路', src: 'hx' },
    { A: 8, label: '王莽代汉立新', note: '戊辰', src: 'hx' },
    { A: 25, label: '汉光武中兴、东汉建立', note: '乙酉', src: 'hx' },
    { A: 184, label: '黄巾起义', note: '甲子，汉祚倾颓之兆', src: 'hx' },
    { A: 220, label: '曹丕代汉、三国始', note: '庚子', src: 'hx' },
    { A: 280, label: '西晋灭吴、短暂一统', note: '庚子', src: 'hx' },
    { A: 589, label: '隋灭陈、南北一统', note: '己酉', src: 'hx' },
    { A: 618, label: '李渊建唐', note: '戊寅', src: 'hx' },
    { A: 627, label: '贞观之治开启', note: '丁亥', src: 'hx' },
    { A: 713, label: '开元盛世开启', note: '癸丑', src: 'hx' },
    { A: 755, label: '安史之乱', note: '乙未，唐由盛转衰', src: 'hx' },
    { A: 960, label: '赵匡胤建宋', note: '庚申，陈桥兵变', src: 'hx' },
    { A: 1012, label: '邵雍诞生', note: '壬子，字尧夫，谥康节', src: 'hx' },
    { A: 1127, label: '靖康之变、宋室南渡', note: '丁未', src: 'hx' },
    { A: 1077, label: '邵雍卒', note: '丁巳，《皇极经世》成书于此前', src: 'hx' },
    { A: 1271, label: '元朝建立', note: '辛未，忽必烈定国号', src: 'hx' },
    { A: 1368, label: '明朝建立', note: '戊申，朱元璋称帝', src: 'hx' },
    { A: 1405, label: '郑和首下西洋', note: '乙酉', src: 'hx' },
    { A: 1644, label: '明亡清入关', note: '甲申之变', src: 'hx' },
    { A: 1662, label: '康熙即位', note: '壬寅', src: 'hx' },
    { A: 1840, label: '鸦片战争', note: '庚子，近代之始', src: 'hx' },
    { A: 1911, label: '辛亥革命', note: '辛亥，帝制终结', src: 'hx' },
    { A: 1912, label: '中华民国建立', note: '壬子', src: 'hx' },
    { A: 1949, label: '中华人民共和国成立', note: '己丑', src: 'hx' },
    { A: 1978, label: '改革开放', note: '戊午', src: 'hx' }
  ];
  /* 每条锚点附其元会运世定位（惰性缓存） */
  var _anchorLoc = null;
  function anchors() {
    if (_anchorLoc) return _anchorLoc;
    _anchorLoc = ANCHORS.map(function (a) {
      var l = locate(a.A);
      return {
        A: a.A, label: a.label, note: a.note, src: a.src, fmt: fmtYear(a.A),
        huiZhi: l.hui.zhi, yunNoG: l.yun.noG, yunGan: l.yun.gan,
        shiNoG: l.shi.noG, shiZhi: l.shi.zhi, gz: l.gz
      };
    });
    return _anchorLoc;
  }

  /* ---------------- 原书逐年表（huangji-chronicle.js 提供数据） ---------------- */
  /* 取某运（元内全元序 1..360）的逐年数组 [{A, gz, t}]，t 为原书记事（无记事为空串）。
     仅当年表范围（第180至189运，前2357至959）内有数据。 */
  var _chron = null;   /* 归一化：{天文年: 记事文本} */
  function _normChron(d) {
    if (!d) return null;
    if (!Array.isArray(d)) return d;
    var m = {};
    d.forEach(function (r) { if (r && r.length >= 2) m[r[0]] = r[1]; });
    return m;
  }
  function setChronicle(d) { _chron = _normChron(d); }
  if (typeof window !== 'undefined' && window.HJ_CHRONICLE) setChronicle(window.HJ_CHRONICLE);
  function chronYun(noG) {
    if (!_chron) return [];
    var start = Y0 + (noG - 1) * YUN;
    var rows = [];
    for (var i = 0; i < YUN; i++) {
      var A = start + i;
      rows.push({ A: A, gz: gzOf(A), t: _chron[A] ? _chron[A] : '' });
    }
    return rows;
  }
  function chronSpan() {
    if (!_chron) return { minA: 0, maxA: 0, minYun: 180, maxYun: 180, count: 0 };
    var As = Object.keys(_chron).map(Number);
    return {
      minA: Math.min.apply(null, As), maxA: Math.max.apply(null, As),
      minYun: Math.floor((Math.min.apply(null, As) - Y0) / YUN) + 1,
      maxYun: Math.floor((Math.max.apply(null, As) - Y0) / YUN) + 1,
      count: As.length
    };
  }
  function chronHas() { return !!_chron; }

  /* ---------------- 开物 / 闭物节点（原书以会经运衍伸定说） ----------------
     开物：寅会之中（星始用事，约公元前 40017 前后）；闭物：戌会之中。
     一会 10800 年，会中即会内第 5401 年。 */
  function kaiwuA() { return Y0 + 2 * HUI + HUI / 2; }        /* 寅会之中 */
  function biwuA() { return Y0 + 10 * HUI + HUI / 2; }        /* 戌会之中 */
  const HJ_API = {
    CONST: { YUAN: YUAN, HUI: HUI, YUN: YUN, SHI: SHI, Y0: Y0, HUI_ZHI: HUI_ZHI, BIGUA: BIGUA, JIAZI: JIAZI },
    gzOf: gzOf, fmtYear: fmtYear, parseYearInput: parseYearInput,
    locate: locate, huiRange: huiRange, jiazi: jiazi, yunGan: yunGan, shiZhi: shiZhi,
    huiGua: huiGua, yunGua: yunGua, yearGua: yearGua,
    yunGuaBian: yunGuaBian, shiGuaBian: shiGuaBian, xunGuaJia: xunGuaJia, xunGuaYi: xunGuaYi,
    huiGua5: huiGua5, zhongGua: zhongGua, leapGua: leapGua, yunGuaOf: yunGuaOf,
    chronYun: chronYun, chronSpan: chronSpan, chronHas: chronHas, setChronicle: setChronicle,
    kaiwuA: kaiwuA, biwuA: biwuA,
    guaInfo: guaInfo, guaCi: GUACI, fullGuaName: fullGuaName, shortGuaName: shortGuaName, BIGUA_FULL: BIGUA_FULL,
    GUA60: GUA60, LEAP_GUA: LEAP_GUA, ZHINIAN_ANCHOR: ZHINIAN_ANCHOR,
    XT_ROUND: XT_ROUND, BITS_BY_NAME: BITS_BY_NAME,
    anchors: anchors, GUAQI_READY: function () { return true; }
  };
  /* 浏览器挂 window（同 taiyi-engine 惯例）；CommonJS 环境挂 module.exports */
  if (typeof window !== 'undefined') window.HJ = HJ_API;
  if (typeof module !== 'undefined' && module.exports) module.exports = HJ_API;
  return HJ_API;
})();
