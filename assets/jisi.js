/* 祭祀供奉页引擎（assets/jisi.js）
 * 依赖：assets/lunar.js、assets/lunar-patch.js、assets/jisi-data.js。
 * 对外接口：window.JISI 的 init、renderDate、renderObject、renderMatter。
 * 日期匹配以农历月日为主，节气另立一型；佛道名目只作同日参看，不与本站祭日合并。 */
(function (g) {
  'use strict';

  var FEST = g.JISI_FEST || [];
  var DEITY = g.JISI_DEITY || [];
  var MATTER = g.JISI_MATTER || [];
  var OFFER = g.JISI_OFFER || [];
  var TABOO = g.JISI_TABOO || [];
  var BOOKS = g.JISI_BOOKS || [];
  var POS = g.JISI_POS || [];
  var TABOO_G = {};
  TABOO.forEach(function (t) { if (t && t.n && t.g) TABOO_G[t.n] = t.g; });
  var LAST = { act: '', date: '', obj: '', matter: '' };
  var MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var CN_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var CN_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  var GROUP_ORDER = ['佛', '道', '民间', '祖先', '行业'];

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function dayCn(n) {
    var a = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十'];
    if (n <= 10) return a[n - 1];
    if (n < 20) return '十' + ['一', '二', '三', '四', '五', '六', '七', '八', '九'][n - 11];
    if (n === 20) return '二十';
    if (n < 30) return '廿' + ['一', '二', '三', '四', '五', '六', '七', '八', '九'][n - 21];
    return '三十';
  }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }
  function parseLunar(y, mo, d, leap) {
    if (!(y >= 1900 && y <= 2100)) return { err: '农历年份须在 1900 至 2100 之间。' };
    if (!(mo >= 1 && mo <= 12)) return { err: '农历月须在正月至腊月之间。' };
    if (!(d >= 1 && d <= 30)) return { err: '农历日须在初一至三十之间。' };
    if (leap) {
      var lym = 0;
      try { if (g.LunarYear && g.LunarYear.fromYear) lym = g.LunarYear.fromYear(y).getLeapMonth() || 0; } catch (e0) { lym = 0; }
      if (lym !== mo) {
        return { err: '农历 ' + y + ' 年无闰' + CN_MONTH[mo - 1] + '月' + (lym ? '（该年闰' + CN_MONTH[lym - 1] + '月）' : '（该年无闰月）') + '，请核对月份与闰月设置。' };
      }
    }
    try {
      var l = g.Lunar.fromYmd(y, leap ? -mo : mo, d);
      var got = l.getMonth();
      if (Math.abs(got) !== mo || (leap ? got >= 0 : got < 0) || l.getDay() !== d) {
        return { err: '农历 ' + y + ' 年无' + (leap ? '闰' : '') + CN_MONTH[mo - 1] + '月' + CN_DAYS[d - 1] + '，请核对年月日与闰月。' };
      }
      return { l: l, sol: l.getSolar() };
    } catch (e) { return { err: '农历日期无效，请核对年月日与闰月。' }; }
  }
  function listOf(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v) return v.split(/[、,，\s]+/);
    return [];
  }
  function lunarInfo(dt) {
    if (!g.Solar || !dt) return null;
    var l;
    try { l = g.Solar.fromYmd(dt.y, dt.m, dt.d).getLunar(); } catch (e) { return null; }
    var rawMonth = l.getMonth();
    var lm = Math.abs(rawMonth);
    var ld = l.getDay();
    var monthDays = 30;
    try { var lmObj = g.LunarMonth.fromYm(l.getYear(), rawMonth); if (lmObj) monthDays = lmObj.getDayCount(); } catch (e2) {}
    var term = '';
    try { term = l.getJieQi() || ''; } catch (e3) {}
    return {
      dt: dt, lunar: l, rawMonth: rawMonth, lm: lm, ld: ld, monthDays: monthDays,
      term: term, yi: listOf(l.getDayYi ? l.getDayYi() : []), ji: listOf(l.getDayJi ? l.getDayJi() : []),
      monthName: l.getMonthInChinese(), dayName: l.getDayInChinese(),
      gz: l.getDayInGanZhi(), yearGz: l.getYearInGanZhi()
    };
  }
  function festMatch(f, info) {
    if (f.type === 'term') return info.term === f.term;
    if (f.type === 'solar') return info.dt.m === f.m && info.dt.d === f.d;
    if (info.lm !== f.m) return false;
    if (f.lastDay) return info.ld === info.monthDays;
    if (f.fallbackLast && f.d === 30) return info.ld === 30 || (info.monthDays === 29 && info.ld === 29);
    return info.ld === f.d;
  }
  function auxNames(info) {
    var key = info.lm + '-' + info.ld, out = [];
    function add(tbl) {
      var arr = tbl && tbl[key];
      if (!arr) return;
      arr.forEach(function (it) {
        var n = '';
        try { n = it && it.getName ? it.getName() : String(it); } catch (e) { n = ''; }
        if (n && out.indexOf(n) < 0) out.push(n);
      });
    }
    add(g.FotoUtil && g.FotoUtil.FESTIVAL);
    add(g.TaoUtil && g.TaoUtil.FESTIVAL);
    return out;
  }
  function findFest(id) { return FEST.filter(function (x) { return x.id === id; })[0] || null; }
  function findDeity(id) { return DEITY.filter(function (x) { return x.id === id; })[0] || null; }
  function findMatter(id) { return MATTER.filter(function (x) { return x.id === id; })[0] || null; }
  function srcLine(src) {
    return (src || []).map(function (s) {
      return '《' + s.b + '》' + s.c + (s.g === '乙' ? '，通行说' : '');
    }).join('；');
  }
  function srcLineOf(x) { return x && x.srcText ? x.srcText : srcLine(x && x.src); }
  /* 异说源名：首词为本页书目者补书名号，通行说与地域源名原样出。 */
  function varSrc(s) {
    var str = String(s || ''), m = /^(\S+)\s+(.+)$/.exec(str);
    if (m) {
      for (var i = 0; i < BOOKS.length; i++) if (BOOKS[i].n === m[1]) return '《' + m[1] + '》' + m[2];
    }
    return str;
  }
  function tabooText(x) {
    return (x.taboo || []).map(function (t) {
      return esc(t) + (TABOO_G[t] === '乙' ? '（通行说）' : '');
    }).join('；');
  }
  function placeLine(x) {
    var note = String(x.placeNote || '').replace(/。$/, '');
    var p = String(x.place || '');
    if (!p) return note ? note + '。' : '';
    return p + (note ? '；' + note : '');
  }
  function deityDateText(x) {
    var head = MONTH_NAMES[x.m - 1] + '月' + (x.lastDay ? '末日' : dayCn(x.d));
    if (x.lastDay) return head + '（月小取廿九）';
    if (x.fallbackLast && x.d === 30) return head + '（月小取廿九）';
    return head;
  }
  function row(k, v) { return '<div class="jsi-row"><span class="jsi-k">' + k + '</span><span class="jsi-v">' + v + '</span></div>'; }
  function ol(items) { return '<ol class="jsi-ol">' + (items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'; }
  function tag(t) { return '<span class="jsi-tag">' + esc(t) + '</span>'; }

  /* 方位按条目所立神位与场所取：先取本条目定值，再按场所归位，末回落门外香案。 */
  var DIRS = {
    yuandan: '门庭爆竹向外，祭祖面向祖先位；拜尊长依长幼次序。',
    jiecaishen: '财神位面向店门或大门，供桌朝外；接路头时开门向外行礼，迎神入内。',
    'jizao-n': '灶君位在灶台上方或灶侧，祭拜者面向灶台；糖瓜置于灶口。',
    'jizao-s': '灶君位在灶台上方或灶侧，祭拜者面向灶台；糖瓜置于灶口。',
    shangyuan: '门首祠门户，面向门外；灯悬门首。',
    muji: '供桌设于墓前，祭拜者面向墓碑；不向他人坟茔。',
    hanyi: '墓前焚寒衣，祭拜者面向墓碑；家宅门外焚化者面向门外。',
    zhongyuan: '家宅祭祖面向祖先位或门外；河灯放于水滨，顺流而下。',
    chuxi: '祭祖面向祖先位；接神开门向外，迎神入内。',
    yuhuang: '香案设于厅前，面向门外；祭拜者面向香案。',
    menshen: '门神贴于门扇两侧，神像面朝门外；祭拜者面向大门。',
    anchuang: '床头靠实墙，忌正对房门；床身不以梁压，镜不照床。',
    dongtu: '土地位设于宅基或工地一侧，面向宅基；破土先向土地位行礼。',
    kaishi: '财神位面向店门，供桌朝外；开市开门后向外行礼。',
    jiasi: '祖先位面向门外，供桌朝外；祭拜者面向祖先位。',
    citang: '神主依世次排列，主位居中面向门外；祭拜者面向神主。',
    jiri: '祖先位面向门外；祭拜者面向祖先位。',
    chuxijizu: '祭祖面向祖先位；接神开门向外。',
    jizao: '灶君位在灶台上方或灶侧，祭拜者面向灶台。',
    xietu: '土地位设于宅基一侧，面向宅基；祭拜者面向土地位。',
    huanyuan: '神位面向殿门或门外；祭拜者面向神位。',
    qifu: '神位面向殿门或门外；祭拜者面向神位。',
    qizi: '神位面向殿门；祭拜者面向神位。',
    caishen: '财神位面向店门或大门，供桌朝外；接财神开门向外，迎神入内。',
    zaojun: '灶君位在灶台上方或灶侧，祭拜者面向灶台。',
    zuxian: '祖先位面向门外，供桌朝外；墓祭面向墓碑。',
    tudi: '土地位面向外，供桌朝外；祭拜者面向土地位。',
    guandi: '神位面向殿门或门外；祭拜者面向神位。',
    mazu: '神位面向殿门或门外；祭拜者面向神位。',
    guanyin: '佛像面向殿门或门外；祭拜者面向佛像。',
    shijia: '佛像面向殿门或门外；祭拜者面向佛像。',
    laojun: '神像面向殿门或门外；祭拜者面向神像。',
    lvzu: '神像面向殿门或门外；祭拜者面向神像。',
    wenchang: '神位面向门外，供桌朝外；祭拜者面向神位。',
    dizang: '佛像面向殿门或门外；祭拜者面向佛像。',
    luban: '神位面向门外或工位；祭拜者面向神位。',
    yaowang: '神位面向门外；祭拜者面向神位。',
    longtai: '祭土地面向土地位；引龙自门外入灶间。',
    duanwu: '门首悬艾蒲，水滨祭屈原面向水；龙舟竞渡顺流。',
    tiankuang: '晒书晒衣面向日，祭祖面向祖先位。',
    qixi: '庭院陈瓜果，面向织女星；拜者面向香案。',
    zhongqiu: '庭院拜月面向月，祭祖面向祖先位。',
    chongyang: '登高面向高处，归家祭祖面向祖先位。',
    dongzhi: '祠堂祭祖面向神主，拜冬面向尊长。',
    laba: '佛前供粥面向佛像，家宅祭祖面向祖先位。',
    yufo: '佛像面向殿门，浴佛面向佛像。'
  };
  function dirOf(x) {
    if (x.dir) return x.dir;
    if (DIRS[x.id]) return DIRS[x.id];
    var p = String(x.place || '');
    if (p.indexOf('墓') >= 0) return '供桌设于墓前，祭拜者面向墓碑；不向他人坟茔。';
    if (p.indexOf('灶') >= 0) return '祭拜者面向灶台，供桌置于灶前。';
    if (p.indexOf('店') >= 0) return '神位面向店门，供桌朝外；祭拜者面向神位。';
    if (/寺|观|庙/.test(p)) return '神位面向殿门，供桌朝外；祭拜者面向神位。';
    if (p.indexOf('水') >= 0) return '祭席设于水岸，祭拜者面向水；放灯顺流，不逆水。';
    if (p.indexOf('庭') >= 0) return '香案设于庭中，面向月或面向门；祭拜者面向香案。';
    if (/田|工地|宅基/.test(p)) return '土地位设于一侧，面向宅基或田地；祭拜者面向土地位。';
    if (p.indexOf('卧') >= 0) return '床头靠实墙，忌正对房门；床身不以梁压。';
    return '神位面向门外，供桌朝外；祭拜者面向神位。';
  }
  /* 祭日与事项共用神明安放条：祭日 id 先归到神明 id，再取神位安放表。 */
  var POS_ID = {
    jiecaishen: 'caishen', caishendan: 'caishen', caishenjie: 'caishen',
    'jizao-n': 'zaojun', 'jizao-s': 'zaojun', jizao: 'zaojun',
    guanyindan: 'guanyin', guanyinchengdao: 'guanyin', guanyinchujia: 'guanyin',
    jiasi: 'zuxian', citang: 'zuxian', jiri: 'zuxian', chuxi: 'zuxian', chuxijizu: 'zuxian',
    muji: 'zuxian', hanyi: 'zuxian', zhongyuan: 'zuxian',
    guandidan: 'guandi', mazudan: 'mazu', mazushengtian: 'mazu', yufo: 'shijia',
    longtai: 'tudi', tudidan: 'tudi', xietu: 'tudi', dongtu: 'tudi',
    lvzudan: 'lvzu', 'shijia-chujia': 'shijia', 'shijia-niepan': 'shijia',
    laojundan: 'laojun', yaowangdan: 'yaowang', lubandan: 'luban'
  };
  function posParts(x) {
    var pid = POS_ID[x.id] || x.id;
    for (var i = 0; i < POS.length; i++) {
      if (POS[i].id === pid) {
        return { kind: 'pos', place: POS[i].place, face: POS[i].face, avoid: String(POS[i].avoid || '').replace(/^忌/, '') };
      }
    }
    return { kind: 'dir', text: dirOf(x) };
  }
  function posText(x) {
    var p = posParts(x);
    if (p.kind === 'pos') return '位：' + p.place + '；向：' + p.face + '；忌：' + p.avoid;
    return p.text;
  }

  function cardForFest(f, info) {
    var h = '<article class="jsi-card">';
    h += '<div class="jsi-card-h"><span class="jsi-name">' + esc(f.name) + '</span>';
    if (f.alias) h += '<span class="jsi-alias">' + esc(f.alias) + '</span>';
    h += tag(f.kind) + tag(f.region + ' ' + f.era) + '</div>';
    var time = '公历 ' + info.dt.y + '年' + info.dt.m + '月' + info.dt.d + '日，农历' + info.monthName + '月' + info.dayName + '，' + info.gz + '日';
    if (info.term) time += '，' + info.term;
    h += row('时', esc(time));
    h += row('所', esc(placeLine(f)));
    h += row('方位', esc(posText(f)));
    var wu = (f.offer || []).join('、');
    if (f.offerFull && f.offerFull.length) wu += '。全供：' + f.offerFull.join('、');
    h += row('物', esc(wu));
    h += row('仪', ol(f.rite));
    h += row('禁', tabooText(f));
    h += row('据', esc(srcLineOf(f)));
    if (f.variants && f.variants.length) {
      h += row('异说', f.variants.map(function (v) {
        var vt = String(v.text || '').replace(/。$/, '');
        return '<span class="jsi-var"><b>' + esc(v.region) + '，' + esc(v.era) + '</b>：' + esc(vt) + '，' + esc(varSrc(v.src)) + '</span>';
      }).join(''));
    }
    h += '</article>';
    return h;
  }

  function nextFest(info, days) {
    var out = [], seen = {}, base = new Date(info.dt.y, info.dt.m - 1, info.dt.d);
    for (var i = 1; i <= days && out.length < 5; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      var dt = { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
      var li = lunarInfo(dt);
      if (!li) continue;
      var hits = FEST.filter(function (f) { return festMatch(f, li); });
      if (!hits.length) continue;
      var key = hits[0].id;
      if (seen[key]) continue;
      seen[key] = 1;
      out.push({
        date: dt.y + '-' + p2(dt.m) + '-' + p2(dt.d),
        lunar: li.monthName + '月' + li.dayName,
        name: hits.map(function (f) { return f.name; }).join('、')
      });
    }
    return out;
  }

  function yjLine(info) {
    var yj = [];
    if (info.yi.length) yj.push('通书宜：' + info.yi.slice(0, 8).join('、'));
    if (info.ji.length) yj.push('忌：' + info.ji.slice(0, 8).join('、'));
    return yj.length ? '<div class="jsi-aux">' + esc(yj.join('；')) + '</div>' : '';
  }

  function renderDate(dateStr) {
    var out = document.getElementById('jsiOut');
    if (!out) return;
    var dt = parseDate(dateStr);
    if (!dt) { out.innerHTML = '<p class="jsi-empty">日期格式应为 YYYY-MM-DD。</p>'; return; }
    var info = lunarInfo(dt);
    if (!info) { out.innerHTML = '<p class="jsi-empty">历法数据未就绪，请刷新后重试。</p>'; return; }
    LAST = { act: 'date', date: dateStr, obj: '', matter: '' };
    var hits = FEST.filter(function (f) { return festMatch(f, info); });
    var aux = auxNames(info);
    var head = '<div class="jsi-head">' + esc(dt.y + '年' + dt.m + '月' + dt.d + '日') + '，农历' + esc(info.monthName + '月' + info.dayName) + '，' + esc(info.gz) + '日' + (info.term ? '，' + esc(info.term) : '') + '</div>';
    if (aux.length) head += '<div class="jsi-aux">同日佛道历名目：' + esc(aux.join('、')) + '；与本站祭日两系并列，不合并裁断。</div>';
    head += yjLine(info);
    if (!hits.length) {
      var next = nextFest(info, 60);
      var ml = monthList(info.lm);
      var monthHtml = ml.length ? '<div class="jsi-next"><div class="jsi-sub">本月祭仪</div>' + ml.map(function (f) {
        return '<div class="jsi-next-row"><b>' + (f.lastDay ? '末日' : dayCn(f.d)) + '</b> ' + esc(f.name) + '，' + esc(f.region) + '</div>';
      }).join('') + '</div>' : '';
      var nextHtml = next.length ? '<div class="jsi-next"><div class="jsi-sub">下一祭日</div>' + next.map(function (n) {
        return '<div class="jsi-next-row"><b>' + esc(n.date) + '</b> 农历' + esc(n.lunar) + ' ' + esc(n.name) + '</div>';
      }).join('') + '</div>' : '';
      out.innerHTML = head + '<p class="jsi-empty">今日无岁时祭仪。</p>' + monthHtml + nextHtml + '<div class="jsi-aux">同名祭日并列同出；供品分简供与全供，详见下方总表与供品释义。</div>';
      return;
    }
    out.innerHTML = head + hits.map(function (f) { return cardForFest(f, info); }).join('');
  }

  function renderObject(id) {
    var d = findDeity(id), out = document.getElementById('jsiOut');
    if (!out) return;
    if (!d) { out.innerHTML = '<p class="jsi-empty">未找到该对象。</p>'; return; }
    LAST = { act: 'obj', date: '', obj: id, matter: '' };
    var h = '<article class="jsi-card">';
    h += '<div class="jsi-card-h"><span class="jsi-name">' + esc(d.name) + '</span>';
    if (d.alias) h += '<span class="jsi-alias">' + esc(d.alias) + '</span>';
    h += tag(d.group) + tag(d.region + ' ' + d.era) + '</div>';
    var dates = (d.dates || []).map(function (x) { return '农历' + deityDateText(x) + ' ' + x.name; }).join('；');
    h += row('日', esc(dates || '无固定祭日，随节令与家祭行之'));
    h += row('所', esc(placeLine(d)));
    h += row('方位', esc(posText(d)));
    h += row('物', esc((d.offer || []).join('、')));
    h += row('仪', ol(d.rite));
    h += row('禁', tabooText(d));
    var fs = (d.fest || []).map(function (fid) { var f = findFest(fid); return f ? f.name : ''; }).filter(Boolean);
    if (fs.length) h += row('祭日', esc(fs.join('、')));
    var ms = (d.matters || []).map(function (mid) { var m = findMatter(mid); return m ? m.name : ''; }).filter(Boolean);
    if (ms.length) h += row('仪注', esc(ms.join('、')));
    h += row('据', esc(srcLineOf(d)));
    h += '</article>';
    out.innerHTML = h;
  }

  function renderMatter(id) {
    var m = findMatter(id), out = document.getElementById('jsiOut');
    if (!out) return;
    if (!m) { out.innerHTML = '<p class="jsi-empty">未找到该事项。</p>'; return; }
    LAST = { act: 'mat', date: '', obj: '', matter: id };
    var h = '<article class="jsi-card">';
    h += '<div class="jsi-card-h"><span class="jsi-name">' + esc(m.name) + '</span>';
    if (m.alias) h += '<span class="jsi-alias">' + esc(m.alias) + '</span>';
    h += tag(m.place) + '</div>';
    if (m.intro) h += '<p class="jsi-intro">' + esc(m.intro) + '</p>';
    h += row('序', ol(m.steps));
    h += row('所', esc(placeLine(m)));
    h += row('方位', esc(posText(m)));
    h += row('物', esc((m.offer || []).join('、')));
    h += row('禁', tabooText(m));
    h += row('据', esc(srcLineOf(m)));
    h += '</article>';
    out.innerHTML = h;
  }

  function monthList(lm) {
    return FEST.filter(function (f) { return f.type === 'lunar' && f.m === lm; })
      .sort(function (a, b) { return (a.lastDay ? 31 : a.d) - (b.lastDay ? 31 : b.d); });
  }

  function renderMonth(lm) {
    var box = document.getElementById('jsiMonth');
    var note = document.getElementById('jsiMonthNote');
    if (!box) return;
    var list = monthList(lm);
    if (note) note.textContent = '农历' + MONTH_NAMES[lm - 1] + '月共 ' + list.length + ' 条岁时祭日；节气祭日另见总表。';
    if (!list.length) { box.innerHTML = '<p class="jsi-empty">本月无岁时祭日。</p>'; return; }
    box.innerHTML = '<ul class="jsi-month">' + list.map(function (f) {
      return '<li><span class="jsi-mday">' + (f.lastDay ? '末日' : dayCn(f.d)) + '</span><span class="jsi-mname">' + esc(f.name) + '</span><span class="jsi-mmeta">' + esc(f.region) + ' ' + esc(f.era) + '</span><span class="jsi-moffer">' + esc((f.offer || []).slice(0, 4).join('、')) + '</span></li>';
    }).join('') + '</ul>';
  }

  function renderYearTable() {
    var body = document.getElementById('jsiYearBody');
    if (!body) return;
    var rows = '';
    for (var m = 1; m <= 12; m++) {
      var list = monthList(m);
      if (!list.length) { rows += '<tr><td>' + MONTH_NAMES[m - 1] + '月</td><td>无</td><td>无</td><td>无</td></tr>'; continue; }
      rows += '<tr><td>' + MONTH_NAMES[m - 1] + '月</td><td>' + list.map(function (f) { return esc(f.name) + ' ' + (f.lastDay ? '末日' : dayCn(f.d)); }).join('<br>') + '</td><td>' + list.map(function (f) { return esc(f.kind); }).join('<br>') + '</td><td>' + list.map(function (f) { return esc(f.region); }).join('<br>') + '</td></tr>';
    }
    var terms = FEST.filter(function (f) { return f.type === 'term'; });
    rows += '<tr><td>节气</td><td>' + terms.map(function (f) { return esc(f.name) + ' 节气'; }).join('<br>') + '</td><td>' + terms.map(function (f) { return esc(f.kind); }).join('<br>') + '</td><td>' + terms.map(function (f) { return esc(f.region); }).join('<br>') + '</td></tr>';
    body.innerHTML = rows;
  }

  function renderDeityTable() {
    var body = document.getElementById('jsiDeityBody');
    if (!body) return;
    var rows = '';
    GROUP_ORDER.forEach(function (grp) {
      DEITY.filter(function (d) { return d.group === grp; }).forEach(function (d) {
        var dates = (d.dates || []).map(function (x) { return deityDateText(x) + ' ' + x.name; }).join('<br>') || '无固定祭日';
        rows += '<tr><td>' + esc(d.name) + '</td><td>' + esc(d.group) + '</td><td>' + dates + '</td><td>' + esc((d.offer || []).join('、')) + '</td><td>' + esc(d.region) + '</td></tr>';
      });
    });
    body.innerHTML = rows;
  }

  function renderPosTable() {
    var body = document.getElementById('jsiPosBody');
    if (!body) return;
    body.innerHTML = POS.map(function (p) {
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.place) + '</td><td>' + esc(p.face) + '</td><td>' + esc(p.avoid) + '</td><td>' + esc(p.src) + '</td></tr>';
    }).join('');
  }

  function renderOfferTable() {
    var body = document.getElementById('jsiOfferBody');
    if (!body) return;
    body.innerHTML = OFFER.map(function (o) {
      return '<tr><td>' + esc(o.n) + '</td><td>' + esc(o.tier) + '</td><td>' + esc(o.note) + '</td></tr>';
    }).join('');
  }

  function renderTabooTable() {
    var body = document.getElementById('jsiTabooBody');
    if (!body) return;
    body.innerHTML = TABOO.map(function (t) {
      return '<tr><td>' + esc(t.n) + '</td><td>' + esc(t.g === '甲' ? '甲' : '乙') + '</td><td>' + esc(t.note) + '</td></tr>';
    }).join('');
  }

  function renderBookTable() {
    var body = document.getElementById('jsiBookBody');
    if (!body) return;
    body.innerHTML = BOOKS.map(function (b) {
      return '<tr><td>' + esc(b.n) + '</td><td>' + esc(b.a) + '</td><td>' + esc(b.e) + '</td><td>' + esc(b.role) + '</td><td>' + esc(b.note) + '</td></tr>';
    }).join('');
  }

  function fillSelects() {
    var obj = document.getElementById('jiObj');
    if (obj && !obj.options.length) {
      GROUP_ORDER.forEach(function (grp) {
        var list = DEITY.filter(function (d) { return d.group === grp; });
        if (!list.length) return;
        var og = document.createElement('optgroup');
        og.label = grp;
        list.forEach(function (d) {
          var op = document.createElement('option');
          op.value = d.id;
          op.textContent = d.name + (d.alias ? '，' + d.alias : '');
          og.appendChild(op);
        });
        obj.appendChild(og);
      });
    }
    var mat = document.getElementById('jiMatter');
    if (mat && !mat.options.length) {
      MATTER.forEach(function (m) {
        var op = document.createElement('option');
        op.value = m.id;
        op.textContent = m.name + (m.alias ? '，' + m.alias : '');
        mat.appendChild(op);
      });
    }
  }

  function fillLunarSelects() {
    var mSel = document.getElementById('jiCnMonth');
    var dSel = document.getElementById('jiCnDay');
    var i, o;
    if (mSel && !mSel.options.length) {
      for (i = 1; i <= 12; i++) {
        o = document.createElement('option');
        o.value = String(i);
        o.textContent = CN_MONTH[i - 1] + '月';
        mSel.appendChild(o);
      }
    }
    if (dSel && !dSel.options.length) {
      for (i = 1; i <= 30; i++) {
        o = document.createElement('option');
        o.value = String(i);
        o.textContent = CN_DAYS[i - 1];
        dSel.appendChild(o);
      }
    }
  }

  /* 默认今天：公历框填今天，农历年月日闰同步填今天，切换即有值。 */
  function fillTodayLunar() {
    try {
      var sol = g.Solar.fromYmd(+todayStr().slice(0, 4), +todayStr().slice(5, 7), +todayStr().slice(8, 10));
      var ln = sol.getLunar();
      var y = document.getElementById('jiCnYear');
      var leap = document.getElementById('jiCnLeap');
      var m = document.getElementById('jiCnMonth');
      var d = document.getElementById('jiCnDay');
      if (y) y.value = String(ln.getYear());
      if (leap) leap.value = ln.getMonth() < 0 ? '1' : '0';
      if (m) m.value = String(Math.abs(ln.getMonth()));
      if (d) d.value = String(ln.getDay());
    } catch (e) { /* 预填失败不阻断 */ }
  }

  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  /* 输入方式切换：公历模式只显公历日期框，农历模式只显农历年月闰日四项；显隐走类名。 */
  function toggleMode() {
    var mode = document.getElementById('jiMode');
    var solar = !mode || mode.value === 'solar';
    var fs = document.getElementById('jiFSolar');
    if (fs) fs.classList.toggle('jsi-off', !solar);
    ['jiFCnY', 'jiFCnM', 'jiFCnLeap', 'jiFCnD'].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.classList.toggle('jsi-off', solar);
    });
  }

  function queryDate() {
    var mode = document.getElementById('jiMode');
    if (!mode || mode.value === 'solar') {
      return val('jiDate');
    }
    var pl = parseLunar(parseInt(val('jiCnYear'), 10), +val('jiCnMonth'), +val('jiCnDay'), val('jiCnLeap') === '1');
    if (pl.err) {
      var out = document.getElementById('jsiOut');
      if (out) out.innerHTML = '<p class="jsi-empty">' + esc(pl.err) + '</p>';
      return '';
    }
    return pl.sol.toYmd();
  }

  /* 分享与刷新按最后一次查询重出：act 记查询路，obj 与 matter 记对象事项 id。 */
  function recast() {
    if (LAST.act === 'obj' && LAST.obj) { renderObject(LAST.obj); return; }
    if (LAST.act === 'mat' && LAST.matter) { renderMatter(LAST.matter); return; }
    var ds = queryDate();
    if (ds) renderDate(ds);
  }
  function shareCollect() {
    return {
      jiMode: val('jiMode'), jiDate: val('jiDate'), jiCnYear: val('jiCnYear'), jiCnMonth: val('jiCnMonth'),
      jiCnLeap: val('jiCnLeap'), jiCnDay: val('jiCnDay'), jiObj: val('jiObj'), jiMatter: val('jiMatter'),
      act: LAST.act, obj: LAST.obj, matter: LAST.matter
    };
  }
  function shareRestore(d) {
    Object.keys(d || {}).forEach(function (k) {
      var el = document.getElementById(k);
      if (el) el.value = d[k];
    });
    LAST = { act: d.act || '', date: '', obj: d.obj || '', matter: d.matter || '' };
    toggleMode();
  }

  /* AI 上下文取引擎终值：按最后一次查询路从数据件重构，不读结果区文案。 */
  function aiContext() {
    var mode = document.getElementById('jiMode');
    var q = mode && mode.value === 'lunar'
      ? '农历 ' + val('jiCnYear') + ' 年 ' + val('jiCnMonth') + ' 月 ' + val('jiCnDay') + ' 日' + (val('jiCnLeap') === '1' ? '（闰月）' : '')
      : '公历 ' + val('jiDate');
    var s = '页面：祭祀供奉\n查询：' + q + '\n';
    if (LAST.act === 'obj') {
      var d = findDeity(LAST.obj);
      if (d) s += '对象：' + d.name + (d.alias ? '（' + d.alias + '）' : '') + '\n' +
        '日：' + ((d.dates || []).map(function (x) { return '农历' + deityDateText(x) + ' ' + x.name; }).join('；') || '无固定祭日') + '\n' +
        '所：' + placeLine(d) + '\n方位：' + posText(d) + '\n物：' + (d.offer || []).join('、') + '\n仪：' + (d.rite || []).join('、') + '\n禁：' + (d.taboo || []).join('；') + '\n据：' + srcLineOf(d);
    } else if (LAST.act === 'mat') {
      var m = findMatter(LAST.matter);
      if (m) s += '事项：' + m.name + '\n序：' + (m.steps || []).join('、') + '\n所：' + placeLine(m) + '\n方位：' + posText(m) + '\n物：' + (m.offer || []).join('、') + '\n禁：' + (m.taboo || []).join('；') + '\n据：' + srcLineOf(m);
    } else {
      var dt = parseDate(LAST.date || val('jiDate'));
      var info = dt ? lunarInfo(dt) : null;
      if (info) {
        var hits = FEST.filter(function (f) { return festMatch(f, info); });
        s += '日期：公历 ' + (LAST.date || val('jiDate')) + '，农历' + info.monthName + '月' + info.dayName + '，' + info.gz + '日' + (info.term ? '，' + info.term : '') + '\n';
        if (info.yi.length) s += '通书宜：' + info.yi.slice(0, 8).join('、') + '\n';
        if (info.ji.length) s += '通书忌：' + info.ji.slice(0, 8).join('、') + '\n';
        s += '当日祭仪：' + (hits.length ? hits.map(function (f) { return f.name; }).join('、') : '无') + '\n';
        s += hits.map(function (f) {
          return '【' + f.name + '】方位：' + posText(f) + '；物：' + (f.offer || []).join('、') + '；仪：' + (f.rite || []).join('、') + '；禁：' + (f.taboo || []).join('；') + '；据：' + srcLineOf(f);
        }).join('\n');
      }
    }
    return s + '\n口径：异说并列，佛道历名目与本站祭日两系并列，不合并裁断。';
  }

  function bind() {
    var mode = document.getElementById('jiMode');
    var date = document.getElementById('jiDate');
    var btnDate = document.getElementById('jiDateBtn');
    var btnObj = document.getElementById('jiObjBtn');
    var btnMat = document.getElementById('jiMatterBtn');
    if (mode) mode.addEventListener('change', toggleMode);
    if (date && !date.value) date.value = todayStr();
    if (btnDate) btnDate.addEventListener('click', function () {
      var ds = queryDate();
      if (ds) renderDate(ds);
    });
    if (btnObj) btnObj.addEventListener('click', function () {
      var el = document.getElementById('jiObj');
      if (el) renderObject(el.value);
    });
    if (btnMat) btnMat.addEventListener('click', function () {
      var el = document.getElementById('jiMatter');
      if (el) renderMatter(el.value);
    });
    document.querySelectorAll('.form-row').forEach(function (rowEl) {
      rowEl.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var b = rowEl.querySelector('button');
        if (b) { e.preventDefault(); b.click(); }
      });
    });
  }

  function init() {
    fillSelects();
    fillLunarSelects();
    fillTodayLunar();
    toggleMode();
    bind();
    var date = document.getElementById('jiDate');
    var info = date ? lunarInfo(parseDate(date.value)) : null;
    if (info) renderMonth(info.lm);
    renderYearTable();
    renderDeityTable();
    renderPosTable();
    renderOfferTable();
    renderTabooTable();
    renderBookTable();
    if (g.mountAI) g.mountAI(aiContext, '祭祀供奉', {
      share: { page: 'jisi', result: '#jsiOut', collect: shareCollect, restore: shareRestore, recast: recast }
    });
  }

  function toggleMod(id) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('collapsed');
  }

  g.toggleMod = toggleMod;
  g.JISI = {
    init: init,
    renderDate: renderDate,
    renderObject: renderObject,
    renderMatter: renderMatter,
    renderMonth: renderMonth
  };
})(window);
