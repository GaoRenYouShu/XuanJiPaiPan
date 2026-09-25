/* 星宿页渲染逻辑（xingxiu.html）
 * 真源：值宿/七曜/禽/四象/吉凶/吉凶歌取 lunar.js；本命宿/演禽算法依《宿曜经》《选择纪要》《禽星易见》。
 * 所有数据调用均经真实算法，不附会。 */
(function () {
  'use strict';
  var Lunar = window.Lunar;
  var Solar = window.Solar;
  var $ = function (id) { return document.getElementById(id); };

  /* 二十八宿通行序（含觜参倒置前的惯用序，与 XX_XIU28 一致） */
  var XX_ORDER = ['角','亢','氐','房','心','尾','箕','斗','牛','女','虚','危','室','壁','奎','娄','胃','昴','毕','觜','参','井','鬼','柳','星','张','翼','轸'];

  function xiuObj(name) {
    for (var i = 0; i < XX_XIU28.length; i++) if (XX_XIU28[i].n === name) return XX_XIU28[i];
    return null;
  }
  function days(y, m, d) { return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
  function gzCn(n) { var s = ['零','一','二','三','四','五','六','七','八','九','十']; if (n <= 10) return s[n]; if (n === 20) return '二十'; if (n === 30) return '三十'; return n < 20 ? '十' + s[n - 10] : '二十' + s[n - 20]; }

  /* ===== 一、本日值宿卡 ===== */
  function renderToday() {
    var sol = Solar.fromDate(new Date());
    var l = sol.getLunar();
    var name = l.getXiu();
    var o = xiuObj(name);
    var box = $('xxToday');
    if (!o) { box.innerHTML = '值宿数据缺失'; return; }
    var luckCls = o.luck === '吉' ? 'xx-luck-j' : 'xx-luck-x';
    box.innerHTML =
      '<div class="xx-card">' +
        '<div class="xx-card-h"><span class="xx-xname">' + name + o.yao + o.qin + '</span>' +
          '<span class="xx-tag xx-tag-xiang xx-' + o.xiang + '">' + o.xiang + '</span>' +
          '<span class="xx-tag ' + luckCls + '">' + (o.luck === '吉' ? '吉' : '凶') + '</span></div>' +
        '<div class="xx-card-row"><span>七曜（五行）</span><b>' + o.yao + '</b></div>' +
        '<div class="xx-card-row"><span>禽</span><b>' + o.qin + '</b></div>' +
        '<div class="xx-card-row"><span>距星</span><b>' + o.star + '（' + o.starEn + '）</b></div>' +
        '<div class="xx-card-song">' + XX_SONG[name] + '</div>' +
      '</div>';
  }

  /* ===== 二、宿位总表 ===== */
  function renderTable() {
    var rows = XX_XIU28.map(function (o) {
      var luckCls = o.luck === '吉' ? 'xx-luck-j' : 'xx-luck-x';
      return '<tr>' +
        '<td class="xx-c0">' + o.n + o.yao + o.qin + '</td>' +
        '<td>' + o.yao + '</td>' +
        '<td>' + o.qin + '</td>' +
        '<td><span class="xx-tag xx-tag-xiang xx-' + o.xiang + '">' + o.xiang + '</span></td>' +
        '<td>' + o.gong + '</td>' +
        '<td><span class="xx-tag ' + luckCls + '">' + (o.luck === '吉' ? '吉' : '凶') + '</span></td>' +
        '<td class="xx-song-cell">' + (XX_SONG[o.n] || '') + '</td>' +
      '</tr>';
    }).join('');
    $('xxTableBody').innerHTML = rows;
  }

  /* ===== 三、十二宫次与分野 ===== */
  function renderGong() {
    var rows = XX_GONG.map(function (g) {
      return '<tr>' +
        '<td class="xx-c0">' + g.ci + '</td>' +
        '<td>' + g.xiu.join('、') + '</td>' +
        '<td>' + g.guo + '</td>' +
        '<td>' + g.zhou + '</td>' +
        '<td class="xx-note-cell">' + g.note + '</td>' +
      '</tr>';
    }).join('');
    $('xxGongBody').innerHTML = rows;
  }

  /* ===== 四、本命宿查询 =====
   * 表单输入为公历生日（yyyy-mm-dd 文本框，自建日历弹层选择）：
   * 先转 Lunar 取农历月日，再按《宿曜经》望宿逆顺数定宿。 */
  function parseYmd(v) {
    var p = String(v || '').split('-').map(Number);
    if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return null;
    return p;
  }
  function calcMing(y, m, d) {
    var l = Solar.fromYmd(y, m, d).getLunar();
    var lm = Math.abs(l.getMonth()), ld = l.getDay();
    var wk = l.getSolar().getWeek();
    var yao = ['日', '月', '火', '水', '木', '金', '土'][wk];
    var wang = XX_WANG[lm];
    var wi = XX_SU27.indexOf(wang);
    var idx = (ld <= 15) ? ((wi - (15 - ld)) % 27 + 27) % 27 : ((wi + (ld - 15)) % 27);
    var su = XX_SU27[idx];
    return { su: su, yao: yao, lm: lm, ld: ld, leap: l.getMonth() < 0, ming: XX_MING[su] || '（判语未辑录）' };
  }
  function renderMing() {
    var p = parseYmd($('xxMingDate').value);
    var out = $('xxMingOut');
    if (!p) { out.innerHTML = '<div class="xx-empty">请选择公历生日。</div>'; return; }
    var r = calcMing(p[0], p[1], p[2]);
    var o = xiuObj(r.su);
    var luckCls = o.luck === '吉' ? 'xx-luck-j' : 'xx-luck-x';
    var bai = XX_MING_BAI[r.su];
    var baiRow = (bai && bai !== '无') ?
      '<div class="xx-card-row"><span>判语白话</span><b>' + bai + '</b></div>' : '';
    out.innerHTML =
      '<div class="xx-card">' +
        '<div class="xx-card-h"><span class="xx-xname">' + r.su + o.yao + o.qin + '</span>' +
          '<span class="xx-tag xx-tag-xiang xx-' + o.xiang + '">' + o.xiang + '</span>' +
          '<span class="xx-tag ' + luckCls + '">' + (o.luck === '吉' ? '吉' : '凶') + '</span>' +
          '<span class="xx-tag xx-tag-yao">' + r.yao + '曜</span></div>' +
        '<div class="xx-card-row"><span>本命宿</span><b>' + r.su + '宿（农历 ' + (r.leap ? '闰' : '') + gzCn(r.lm) + '月' + gzCn(r.ld) + '日推算）</b></div>' +
        '<div class="xx-card-row"><span>宿直生人</span><b>' + r.ming + '</b></div>' +
        baiRow +
      '</div>';
  }

  /* ===== 五、演禽查询 ===== */
  function qiyuanOf(y, m, d) {
    var n = Math.floor((days(y, m, d) - days(XX_QIYUAN_ANCHOR.y, XX_QIYUAN_ANCHOR.m, XX_QIYUAN_ANCHOR.d)) / 60);
    var q = ((1 + n) % 7 + 7) % 7;
    return q === 0 ? 7 : q;
  }
  function shiQinOf(riName, shiIdx) {
    var o = xiuObj(riName);
    if (!o) return null;
    var base = XX_SHIQIN[o.yao];
    var bi = XX_ORDER.indexOf(base);
    return XX_ORDER[(bi + shiIdx) % 28];
  }
  /* 年禽正法：《演禽通纂》三元旬头起手例。生年干支定所属旬（六旬配三元，两旬一元），
   * 取该旬旬头甲日所值之宿，再按生年干支在旬内之序顺数去牛二十八宿得年禽。
   * 旬内序：甲子 0、乙丑 1，至癸亥 59。 */
  function xunOfIndex(i) { return Math.floor(i / 10); } // 六旬：甲子、甲戌、甲申、甲午、甲辰、甲寅
  function nianQinOf(gzIndex) {
    var xun = xunOfIndex(gzIndex);
    var pos = gzIndex % 10; // 旬内干支序（0=甲某）
    var yuan = XX_NIAN_QIN.xunYuan[xun];
    var xunKey = ['jiazi', 'jiaxu', 'jiashen', 'jiawu', 'jiachen', 'jiayin'][xun];
    var head = XX_NIAN_QIN.yuan[yuan][xunKey];
    var hi = XX_ORDER.indexOf(head);
    /* 旬内顺数：甲起旬头宿，每进一支顺进一宿，去牛不用 */
    var cnt = 0, cur = hi;
    for (var k = 0; k < pos; k++) {
      cur = (cur + 1) % 28;
      if (XX_ORDER[cur] === '牛') { cur = (cur + 1) % 28; }
      cnt++;
    }
    return { xiu: XX_ORDER[cur], yuan: yuan, xun: xun, head: head };
  }
  /* 月禽：《演禽通纂》月禽歌诀。以年禽七曜定正月所值之宿，
   * 自正月起顺数全二十八宿（含牛，与年禽去牛例不同）至生月得月禽。 */
  function yueQinOf(nianXiuName, lunarMonth) {
    var nObj = xiuObj(nianXiuName);
    if (!nObj) return null;
    var base = XX_YUE_QIN[nObj.yao];
    if (!base) return null;
    var bi = XX_ORDER.indexOf(base);
    var mi = ((lunarMonth - 1) % 28 + 28) % 28;
    return XX_ORDER[(bi + mi) % 28];
  }
  function renderYan() {
    var p = parseYmd($('xxYanDate').value);
    var out = $('xxYanOut');
    if (!p) { out.innerHTML = '<div class="xx-empty">请选择公历日期。</div>'; return; }
    var y = p[0], m = p[1], d = p[2];
    var sol = Solar.fromYmd(y, m, d);
    var l = sol.getLunar();
    var ri = l.getXiu();
    var o = xiuObj(ri);
    var q = qiyuanOf(y, m, d);
    var full = ri + o.yao + o.qin;
    var shiIdx = +($('xxYanShi').value || 0);
    var shiName = shiQinOf(ri, shiIdx);
    var shiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    var td = XX_YIJI[ri];
    var tan = XX_TUNDAN[full];
    var suo = XX_SUOPO[ri];
    var ySX = l.getYearShengXiao();
    var benQin = XX_SHENGXIAO_XIU[ySX] || '';
    var gzIdx = ((y - 4) % 60 + 60) % 60;
    var nq = nianQinOf(gzIdx);
    var nqObj = xiuObj(nq.xiu);
    var nqFull = nq.xiu + nqObj.yao + nqObj.qin;
    var yuanName = ['', '上元', '中元', '下元'][nq.yuan];
    var xunName = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'][nq.xun];
    var lmAbs = Math.abs(l.getMonth());
    var yq = yueQinOf(nq.xiu, lmAbs);
    var yqObj = yq ? xiuObj(yq) : null;
    var yqFull = yq ? yq + (yqObj ? yqObj.yao + yqObj.qin : '') : '未定';
    var html = '<div class="xx-card">' +
      '<div class="xx-card-h"><span class="xx-xname">' + full + '</span>' +
        '<span class="xx-tag xx-tag-qiyuan">第' + gzCn(q) + '元</span>' +
        '<span class="xx-tag ' + (o.luck === '吉' ? 'xx-luck-j' : 'xx-luck-x') + '">' + (o.luck === '吉' ? '吉' : '凶') + '</span></div>' +
      '<div class="xx-card-row"><span>本命禽</span><b>' + (benQin ? ySX + '年生本命禽为 ' + benQin : '生年地支未配，余俟补') + '</b></div>' +
      '<div class="xx-card-row"><span>年禽</span><b>' + nqFull + '（' + l.getYearInGanZhi() + '，' + yuanName + xunName + '旬，旬头' + nq.head + '宿）</b></div>' +
      '<div class="xx-card-row"><span>月禽</span><b>' + yqFull + '（农历' + (l.getMonth() < 0 ? '闰' : '') + gzCn(lmAbs) + '月，年禽' + nqObj.yao + '曜正月起' + XX_YUE_QIN[nqObj.yao] + '，顺数' + gzCn(lmAbs) + '月）</b></div>' +
      '<div class="xx-card-row"><span>日禽（值宿）</span><b>' + ri + o.yao + o.qin + '（' + o.xiang + '，' + o.gong + '方）</b></div>' +
      '<div class="xx-card-row"><span>七元</span><b>第' + gzCn(q) + '元（甲子日值' + Object.keys(XX_QIYUAN).filter(function (k) { return XX_QIYUAN[k] === q; })[0] + '宿）</b></div>' +
      '<div class="xx-card-row"><span>时禽</span><b>' + shiNames[shiIdx] + '时 → ' + shiName + (xiuObj(shiName) ? xiuObj(shiName).yao + xiuObj(shiName).qin : '') + '</b></div>';
    if (tan) html += '<div class="xx-card-row"><span>吞啖</span><b>食 ' + tan.shi.join('、') + '；畏 ' + tan.wei.join('、') + '</b></div>';
    if (suo) html += '<div class="xx-card-row"><span>锁泊</span><b>' + suo + '</b></div>';
    if (td) html += '<div class="xx-card-row"><span>值宿宜忌</span><b>宜 ' + td.yi.join('、') + '；忌 ' + td.ji.join('、') + '；伏断 ' + td.fu + '时</b></div>';
    html += '</div>';
    out.innerHTML = html;
  }

  /* ===== 六、值宿宜忌与伏断 ===== */
  function renderYiJi() {
    var rows = XX_XIU28.map(function (o) {
      var y = XX_YIJI[o.n];
      if (!y) return '';
      var gy = y.gy === '吉' ? 'xx-luck-j' : (y.gy === '凶' ? 'xx-luck-x' : 'xx-luck-m');
      return '<tr>' +
        '<td class="xx-c0">' + o.n + o.yao + o.qin + '</td>' +
        '<td class="xx-yi">宜 ' + y.yi.join('、') + '</td>' +
        '<td class="xx-ji">忌 ' + y.ji.join('、') + '</td>' +
        '<td>' + y.fu + '时</td>' +
        '<td><span class="xx-tag ' + gy + '">' + y.gy + '</span></td>' +
      '</tr>';
    }).filter(Boolean).join('');
    $('xxYiJiBody').innerHTML = rows;
  }

  /* ===== 七、二十四山配宿 ===== */
  function renderShan() {
    var order = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
    var rows = order.map(function (s) {
      var xs = XX_SHAN[s] || [];
      return '<tr><td class="xx-c0">' + s + '</td><td>' + (xs.join('、') || '无') + '</td></tr>';
    }).join('');
    $('xxShanBody').innerHTML = rows;
  }

  /* ===== 八、《天官书》占辞表 ===== */
  function renderZhanci() {
    var rows = XX_XIU28.map(function (o) {
      return '<tr>' +
        '<td class="xx-c0">' + o.n + o.yao + o.qin + '</td>' +
        '<td class="xx-song-cell">' + (XX_ZHANCI[o.n] || '无专句') + '</td>' +
      '</tr>';
    }).join('');
    $('xxZhanciBody').innerHTML = rows;
  }

  /* ===== 八b、三家占辞表（《开元占经》卷六十至六十三） ===== */
  function renderZhanci3Jia() {
    var rows = XX_XIU28.map(function (o) {
      var items = XX_ZHANCI_3JIA[o.n] || [];
      var body = items.map(function (it) {
        return '<div class="xx-z3j-item"><span class="xx-tag xx-tag-yao">' + it.jia + '</span>' + it.wen + '</div>';
      }).join('');
      return '<tr>' +
        '<td class="xx-c0">' + o.n + o.yao + o.qin + '</td>' +
        '<td class="xx-note-cell">' + (body || '余俟补') + '</td>' +
      '</tr>';
    }).join('');
    $('xxZ3jBody').innerHTML = rows;
  }

  /* ===== 九、距度与岁差 ===== */
  /* 太阳视黄经（度）：简化 VSOP 公式（Jean Meeus《Astronomical Algorithms》低阶项），
   * 精度约 0.01 度，足够宿界判断；只作观象参考，不作择日依据。 */
  function sunLon(y, m, d) {
    var jd = Date.UTC(y, m - 1, d, 12) / 86400000 + 2440587.5;
    var T = (jd - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var Mr = M * Math.PI / 180;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
    var trueLon = L0 + C;
    var omega = 125.04 - 1934.136 * T;
    return ((trueLon - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180)) % 360 + 360) % 360;
  }
  /* 太阳入宿：J2000 宿界黄经即各宿距星 lon，太阳黄经落入某宿区间即入某宿。
   * 宿区间从本宿距星 lon 起、至下一宿距星 lon 止（跨 0 度环绕）。 */
  function sunInXiu(y, m, d) {
    var sl = sunLon(y, m, d);
    var segs = [];
    for (var i = 0; i < 28; i++) {
      var a = XX_XIU28[i], b = XX_XIU28[(i + 1) % 28];
      segs.push({n: a.n, from: a.lon, to: b.lon});
    }
    /* 按 J2000 顺序重排为升序环列 */
    segs.sort(function (p, q) { return p.from - q.from; });
    for (var k = 0; k < segs.length; k++) {
      var s = segs[k], e = segs[(k + 1) % segs.length];
      var lo = s.from, hi = e.from <= s.from ? e.from + 360 : e.from;
      var adj = sl < lo ? sl + 360 : sl;
      if (adj >= lo && adj < hi) return {xiu: s.n, lon: sl};
    }
    return {xiu: '', lon: sl};
  }
  function renderDu() {
    var now = Solar.fromDate(new Date());
    var si = sunInXiu(now.getYear(), now.getMonth(), now.getDay());
    var siObj = xiuObj(si.xiu);
    var siName = siObj ? si.xiu + siObj.yao + siObj.qin : (si.xiu || '未定');
    var html = '<div class="xx-card-row xx-sun-row"><span>今日太阳</span><b>视黄经 ' + si.lon.toFixed(2) + ' 度，入 ' + siName + '（J2000 宿界口径，观象参考）</b></div>';
    var duText = XX_DU_TEXT.replace(/。/g, '。 ');
    html += '<div class="xx-quote">' + duText + '</div>';
    html += '<div class="xx-tbl-wrap"><table class="xx-tbl"><thead><tr>' +
      '<th>宿</th><th>距度（古度）</th><th>宿</th><th>距度（古度）</th></tr></thead><tbody>';
    for (var i = 0; i < 14; i++) {
      var a = XX_ORDER[i], b = XX_ORDER[i + 14];
      html += '<tr><td class="xx-c0">' + a + '</td><td>' + XX_DU[a] + '</td>' +
        '<td class="xx-c0">' + b + '</td><td>' + XX_DU[b] + '</td></tr>';
    }
    html += '</tbody></table></div>';
    $('xxDuOut').innerHTML = html;
  }

  /* ===== 十、三十六禽 ===== */
  function renderSan36() {
    var html = '<div class="xx-quote">' + XX_SAN36_TOTAL + '</div>';
    html += '<div class="xx-tbl-wrap"><table class="xx-tbl"><thead><tr>' +
      '<th>支</th><th>旦禽</th><th>昼禽</th><th>暮禽</th><th>取象之由</th></tr></thead><tbody>';
    var rows = XX_SAN36.map(function (r) {
      return '<tr>' +
        '<td class="xx-c0">' + r.zhi + '</td>' +
        '<td>' + r.chao + '</td>' +
        '<td>' + r.zhou + '</td>' +
        '<td>' + r.mu + '</td>' +
        '<td class="xx-note-cell">' + r.note + '</td>' +
      '</tr>';
    }).join('');
    html += rows + '</tbody></table></div>';
    $('xxSan36Body').innerHTML = html;
  }

  /* ===== 十b、二十八宿示意星图（玄夜鎏金，圆形图版） =====
   * 骨架与站内圆盘通用件同制式（440 见方、盘心 220）：外圈线 182、内界圈 100、盘心圈 60、
   * 刻度 168–176、宿名环 148（一字沿圆周环布 WHEEL.ring）。夜幕底色以圆形图版嵌入纸页——
   * 圆形（半径 182）内为玄夜鎏金，圆外留纸本白底，鎏金细圈收束图版外缘，外圈鎏金刻线环与
   * 四象柔光弧贴在盘缘内侧；二十八宿按通行宿序环天一周（屏幕角逆时针递减、起点 135°），
   * 宿点带四象色柔光晕，连成细金环；今日值宿以十芒金星加虚线光环高亮，宿名以 .w-lab-cur
   * 加粗。盘心三行 .w-c1/.w-c2/.w-c3 与全站盘心字号对齐。宿点与四象方位仍为示意，非真实天象。 */
  function renderSky() {
    var box = $('xxSky');
    if (!box) return;
    var todayName = Solar.fromDate(new Date()).getLunar().getXiu();
    /* 半径：盘心 220、外圈线 182（鎏金图版外缘）、刻度 168–176、内界圈 108（柔光圈，让出盘心区）、
       盘心圈 60；宿名 144（最外圈一字环布）、宿点 130、四象弧 180（盘缘内侧贴）、四象名 198。
       二十八项每项 12.86° 太窄，省略 28 段弧带（与经络盘 12 段不同），盘面以刻线、宿点、骨架圆为主，更克制 */
    var S = 440, R_OUT = 182, R_TICK0 = 168, R_TICK1 = 176, R_IN = 108, R_CORE = 60;
    var R_NAME = 144, R_DOT = 130, R_XIANG = 180, R_XT = 198;
    var cEnd = [], acc = 0, t;
    for (t = 0; t < 28; t++) { cEnd[t] = acc; acc += XX_DU[XX_ORDER[t]]; }
    cEnd[28] = acc;
    /* 屏幕角折到 WHEEL 口径：旧式 0 度在正右，WHEEL 以正上为 0，整体加 90；起点 135° 让角宿起于正右偏上 */
    var cumB = [], midA = [];
    for (t = 0; t < 28; t++) {
      cumB[t] = 135 - 360 * cEnd[t] / acc;
      midA[t] = 135 - 360 * (cEnd[t] + XX_DU[XX_ORDER[t]] / 2) / acc;
    }
    function pol(r, deg) { var p = WHEEL.px(r, deg); return { x: p[0], y: p[1] }; }
    var svg = '<svg class="wheel xx-sky" viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="二十八宿示意星图">';
    /* 夜幕底色以 clipPath 限制在盘内圆（圆形图版嵌入纸页），三档止色由 style.css 的 .sk-n1 至 .sk-n3 给 */
    svg += '<defs><radialGradient id="xxsg" cx="50%" cy="48%" r="50%"><stop class="sk-n1" offset="0%"/><stop class="sk-n2" offset="65%"/><stop class="sk-n3" offset="100%"/></radialGradient>';
    svg += '<filter id="xxgl" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg += '<clipPath id="xxsd"><circle cx="' + WHEEL.C + '" cy="' + WHEEL.C + '" r="' + R_OUT + '"/></clipPath></defs>';
    /* 圆外留白：透明矩形覆盖整张画布作背景，圆内由下方填充 */
    svg += '<rect x="0" y="0" width="' + S + '" height="' + S + '" fill="transparent"/>';
    svg += '<g clip-path="url(#xxsd)"><circle cx="' + WHEEL.C + '" cy="' + WHEEL.C + '" r="' + R_OUT + '" fill="url(#xxsg)"/></g>';
    /* 远景散星：均匀分布在盘内环带（内界圈 108 与外圈线 182 之间），中心题字区与盘缘不撒；提一颗可见度 */
    for (var i = 0; i < 110; i++) {
      var s1 = Math.sin(i * 12.9898) * 43758.5453; s1 = s1 - Math.floor(s1);
      var s2 = Math.sin(i * 78.233) * 12543.17; s2 = s2 - Math.floor(s2);
      var r0 = R_IN + 12 + s1 * (R_OUT - R_IN - 24);
      var a0 = s2 * 360;
      var pp = pol(r0, a0);
      svg += '<circle class="sk-star" cx="' + pp.x.toFixed(1) + '" cy="' + pp.y.toFixed(1) + '" r="' + (0.5 + s1 * 1.2).toFixed(2) + '" opacity="' + (0.32 + s1 * 0.42).toFixed(2) + '"/>';
    }
    /* 骨架圆：盘缘鎏金圈、内界圈冷蓝虚线、盘心圈；与通用件同制式（.w-ring / .w-core） */
    svg += '<circle class="w-ring" cx="' + WHEEL.C + '" cy="' + WHEEL.C + '" r="' + R_OUT + '"/>';
    svg += '<circle class="w-ring w-ring-in" cx="' + WHEEL.C + '" cy="' + WHEEL.C + '" r="' + R_IN + '"/>';
    svg += '<circle class="w-core" cx="' + WHEEL.C + '" cy="' + WHEEL.C + '" r="' + R_CORE + '"/>';
    /* 二十八道宿界刻度：每宿一刻自外圈线向内落，七宿一长加重（象界）；保留通用件索引一缕口径 */
    for (t = 0; t < 28; t++) {
      var xj = t % 7 === 0;
      var q1 = pol(R_OUT, cumB[t]), q2 = pol(xj ? R_TICK0 - 8 : R_TICK0, cumB[t]);
      svg += '<line class="w-tick' + (xj ? ' w-tick-j' : '') + '" x1="' + q1.x.toFixed(1) + '" y1="' + q1.y.toFixed(1) + '" x2="' + q2.x.toFixed(1) + '" y2="' + q2.y.toFixed(1) + '"/>';
    }
    /* 四象柔光弧：r=R_XIANG=184 贴盘缘外侧；弧段按各象距度合计分段 */
    var xiangSeg = [
      { n: '青龙', dir: '东方青龙', s: 0 },
      { n: '玄武', dir: '北方玄武', s: 7 },
      { n: '白虎', dir: '西方白虎', s: 14 },
      { n: '朱雀', dir: '南方朱雀', s: 21 }
    ];
    xiangSeg.forEach(function (sc, xi) {
      var a1 = cumB[sc.s], a2 = 135 - 360 * cEnd[sc.s + 7] / acc;
      var o1 = pol(R_XIANG, a1), o2 = pol(R_XIANG, a2);
      svg += '<path class="sk-xiang sk-' + sc.n + '" d="M' + o1.x.toFixed(1) + ' ' + o1.y.toFixed(1) + ' A' + R_XIANG + ' ' + R_XIANG + ' 0 0 0 ' + o2.x.toFixed(1) + ' ' + o2.y.toFixed(1) + '" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>';
      /* 四象名：r=R_XT=200 沿弧环布（textPath）；弧按极角递增（顺时针）绘制，字头才恒朝盘外 */
      var b1 = pol(R_XT, a2), b2 = pol(R_XT, a1);
      var pid = 'xxXg' + xi;
      svg += '<path id="' + pid + '" fill="none" stroke="none" d="M' + b1.x.toFixed(1) + ' ' + b1.y.toFixed(1) + ' A' + R_XT + ' ' + R_XT + ' 0 ' + ((a1 - a2) > 180 ? 1 : 0) + ' 1 ' + b2.x.toFixed(1) + ' ' + b2.y.toFixed(1) + '"/>';
      svg += '<text class="w-lab sk-xt sk-' + sc.n + '" font-size="13" fill="currentColor"><textPath href="#' + pid + '" startOffset="50%" text-anchor="middle">' + sc.dir + '</textPath></text>';
    });
    /* 宿宿连线成环：细金线闭合，落在宿点环上 */
    var ring = '';
    for (t = 0; t < 28; t++) {
      var rp = pol(R_DOT, midA[t]);
      ring += (t ? ' ' : '') + rp.x.toFixed(1) + ',' + rp.y.toFixed(1);
    }
    svg += '<polyline class="sk-link" points="' + ring + ' ' + ring.split(' ')[0] + '"/>';
    /* 二十八宿点位（宿点 + 四象柔光晕）；宿名一字沿圆周环布 WHEEL.ring，正上字横排、右半圈顺时针转、正下倒排，整圈读作一条环带 */
    for (t = 0; t < 28; t++) {
      var name = XX_ORDER[t];
      var o = xiuObj(name);
      var isToday = name === todayName;
      var p = pol(R_DOT, midA[t]);
      svg += '<circle class="sk-halo sk-' + o.xiang + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4.5" fill="currentColor" opacity=".35" filter="url(#xxgl)"/>';
      svg += '<circle class="sk-dot' + (isToday ? ' is-today' : '') + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (isToday ? 2.6 : 1.8) + '"' + (isToday ? ' filter="url(#xxgl)"' : '') + '/>';
      var ln = pol(R_NAME, midA[t]);
      var rot = WHEEL.ring(midA[t]);
      svg += '<text class="w-lab' + (isToday ? ' is-today' : '') + '" x="' + ln.x.toFixed(1) + '" y="' + ln.y.toFixed(1) + '" data-i="' + t + '" transform="rotate(' + rot + ' ' + ln.x.toFixed(1) + ' ' + ln.y.toFixed(1) + ')">' + name + '</text>';
    }
    /* 今日值宿高亮：虚线光环 + 十芒金星 */
    var ti = -1;
    for (t = 0; t < 28; t++) if (XX_ORDER[t] === todayName) ti = t;
    if (ti >= 0) {
      var tp = pol(R_DOT, midA[ti]), sp = 7, tx = tp.x, ty = tp.y;
      svg += '<circle class="sk-today-ring" cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="9" fill="none" stroke-opacity=".85" stroke-width="1" stroke-dasharray="2.5 2.5"/>';
      svg += '<path class="sk-today-star" d="M' + tx.toFixed(1) + ' ' + (ty - sp).toFixed(1) + ' Q' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ' ' + (tx + sp).toFixed(1) + ' ' + ty.toFixed(1) + ' Q' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + (ty + sp).toFixed(1) + ' Q' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ' ' + (tx - sp).toFixed(1) + ' ' + ty.toFixed(1) + ' Q' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + (ty - sp).toFixed(1) + ' Z" filter="url(#xxgl)"/>';
    }
    /* 盘心三行：通用件字号（.w-c1 22px 主值、.w-c2 12.5px 副值、.w-c3 11.5px 注），与全站盘心对齐 */
    var tObj = xiuObj(todayName);
    var tFull = todayName + (tObj ? tObj.yao + tObj.qin : '');
    svg += '<text class="w-c1" x="' + WHEEL.C + '" y="' + (WHEEL.C - 14) + '">' + tFull + '</text>';
    svg += '<text class="w-c2" x="' + WHEEL.C + '" y="' + (WHEEL.C + 10) + '">距度 ' + XX_DU[todayName] + ' 度，' + (tObj ? tObj.xiang : '') + '</text>';
    svg += '<text class="w-c3" x="' + WHEEL.C + '" y="' + (WHEEL.C + 28) + '">今日值宿</text>';
    svg += '</svg>';
    box.innerHTML = svg;
  }

  /* ===== AI 上下文 ===== */
  function xxAiContext() {
    var s = '【星宿页】二十八宿为中国古天文与择日体系，星官与占辞并列，不作命理定论。\n';
    var t = Solar.fromDate(new Date()).getLunar();
    var tn = t.getXiu();
    s += '本日值宿：' + tn + (xiuObj(tn) ? xiuObj(tn).yao + xiuObj(tn).qin : '') + '（' + (xiuObj(tn) ? xiuObj(tn).luck : '') + '）。\n';
    s += '二十八宿分四象：东方青龙（角亢氐房心尾箕）、北方玄武（斗牛女虚危室壁）、西方白虎（奎娄胃昴毕觜参）、南方朱雀（井鬼柳星张翼轸）。\n';
    s += '十二宫次配宿与分野见宫次表；本命宿依《宿曜经》二十七宿推算；演禽依七元甲子，年禽依《演禽通纂》三元旬头起手例（生年干支入旬推宿），生年生肖配本命禽。《天官书》占辞、《开元占经》三家（石氏、甘氏、巫咸）占辞、《汉书·律历志》距度、《五行大义》三十六禽均逐字照录底本，异文并列标注，不作附会推断。';
    return s;
  }

  /* ===== 共享状态（shareWait） ===== */
  function xxCollect() {
    return {
      mingDate: $('xxMingDate').value,
      yanDate: $('xxYanDate').value, yanShi: $('xxYanShi').value
    };
  }
  function xxRestore(s) {
    if (!s) return;
    if (s.mingDate) { $('xxMingDate').value = s.mingDate; renderMing(); }
    if (s.yanDate) { $('xxYanDate').value = s.yanDate; $('xxYanShi').value = s.yanShi; renderYan(); }
  }

  /* ===== 初始化 ===== */
  function init() {
    renderToday(); renderTable(); renderGong(); renderYiJi(); renderShan(); renderZhanci(); renderZhanci3Jia(); renderDu(); renderSan36(); renderSky();
    $('xxMingBtn').addEventListener('click', renderMing);
    $('xxYanBtn').addEventListener('click', renderYan);
    if (window.mountAI) window.mountAI(xxAiContext, '星宿');
    if (window.shareWait) window.shareWait({
      page: 'xingxiu', title: '星宿',
      collect: xxCollect, restore: xxRestore, recast: function () { renderMing(); renderYan(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
