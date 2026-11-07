/* 精油芳疗页脚本：渲染名录与资料表、条件求解、历史记录、附加功能面板。
 * 求解与校验全部走 assets/aroma-engine.js，折叠开合走 assets/mod-fold.js。 */
(function () {
  'use strict';
  var A = window.AROMA, JL = window.JL;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 季节：按上一节气定四季，取 lunar.js 的节气表；取不到按春。 */
  var JQ_SEASON = {
    '立春': 'spring', '雨水': 'spring', '惊蛰': 'spring', '春分': 'spring', '清明': 'spring', '谷雨': 'spring',
    '立夏': 'summer', '小满': 'summer', '芒种': 'summer', '夏至': 'summer', '小暑': 'summer', '大暑': 'summer',
    '立秋': 'autumn', '处暑': 'autumn', '白露': 'autumn', '秋分': 'autumn', '寒露': 'autumn', '霜降': 'autumn',
    '立冬': 'winter', '小雪': 'winter', '大雪': 'winter', '冬至': 'winter', '小寒': 'winter', '大寒': 'winter'
  };
  function seasonNow() {
    try {
      if (!window.Solar) return 'spring';
      var l = window.Solar.fromDate(new Date()).getLunar();
      var jq = l.getPrevJieQi();
      var n = jq && jq.getName ? jq.getName() : '';
      return JQ_SEASON[n] || 'spring';
    } catch (e) { return 'spring'; }
  }

  /* 名称解析：顿号、逗号、空格分隔，命中名录才收。 */
  function parseNames(raw, names) {
    var out = [];
    String(raw || '').split(/[、,，\s]+/).forEach(function (s) {
      s = s.trim();
      if (s && names.indexOf(s) >= 0 && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }
  function oilNames() { return A.OILS.map(function (o) { return o.name; }); }
  function baseNames() { return A.BASES.map(function (b) { return b.name; }); }
  function pickVals(sel) {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll(sel + ' input:checked'), function (n) { out.push(n.value); });
    return out;
  }

  /* 指定下拉勾选：基础油十八种、单方按科属分组。 */
  function renderPicks() {
    $('jyPickBases').innerHTML = A.BASES.map(function (b) {
      return '<div class="field chk"><input type="checkbox" id="jyPB-' + b.id + '" value="' + esc(b.name) + '" onchange="jySyncSums()">'
        + '<label for="jyPB-' + b.id + '">' + esc(b.name) + '</label></div>';
    }).join('');
    var fams = [];
    A.OILS.forEach(function (o) { if (fams.indexOf(o.family) < 0) fams.push(o.family); });
    var h = '';
    fams.forEach(function (f) {
      h += '<div class="group-label">' + esc(f) + '</div>';
      A.OILS.filter(function (o) { return o.family === f; }).forEach(function (o) {
        h += '<div class="field chk"><input type="checkbox" id="jyPO-' + o.id + '" value="' + esc(o.name) + '" onchange="jySyncSums()">'
          + '<label for="jyPO-' + o.id + '">' + esc(o.name) + '</label></div>';
      });
    });
    $('jyPickOils').innerHTML = h;
  }
  function syncSums() {
    var rk = ['epilepsy', 'asthma', 'hypertension', 'liver', 'kidney', 'medication'].filter(function (id) {
      var n = $('rk-' + id); return n && n.checked;
    });
    $('jyRiskSum').textContent = rk.length ? '已选 ' + rk.length + ' 项' : '未选';
    var nb = pickVals('#jyPickBases').length;
    var no = pickVals('#jyPickOils').length;
    $('jyPickBaseSum').textContent = nb ? '已选 ' + nb + ' 种' : '未选';
    $('jyPickOilSum').textContent = no ? '已选 ' + no + ' 种' : '未选';
    for (var i = 0; i < 6; i++) {
      var nf = document.querySelectorAll('#fxBox' + i + ' input:checked').length;
      $('fxSum' + i).textContent = nf ? '已选 ' + nf + ' 项' : '未选';
    }
  }
  window.jySyncSums = syncSums;

  /* 单方名录：按科属分组，数据表逐味一行。 */
  function renderOils() {
    var fams = [];
    A.OILS.forEach(function (o) { if (fams.indexOf(o.family) < 0) fams.push(o.family); });
    var h = '';
    fams.forEach(function (f) {
      h += '<div class="rel-title">' + esc(f) + '</div><div class="tbl-hs"><table><thead><tr><th>单方</th><th>主要作用</th><th>具体作用</th><th>行业俗称</th><th>适用人群</th><th>学名</th><th>气味族</th><th>调位</th><th>性味</th><th>化学型</th><th>同源中药</th><th>安全</th><th>上限</th></tr></thead><tbody>';
      A.OILS.filter(function (o) { return o.family === f; }).forEach(function (o) {
        var x = A.OIL_EXTRA[o.id] || {};
        h += '<tr><td>' + esc(o.name) + '</td><td>' + esc(o.use.join('、')) + '</td><td>' + esc(x.act || '无') + '</td><td>' + esc(x.alias || '无')
          + '</td><td>' + esc(x.crowd || '无') + '</td><td>' + esc(o.latin) + '</td><td>' + esc(o.scent) + '</td><td>'
          + esc(o.layer) + '</td><td>' + esc(o.thermal) + '</td><td>' + esc(o.chemo || '无') + '</td><td>'
          + esc(o.herb || '无') + '</td><td>' + esc(o.safety.join('、') || '无') + '</td><td>' + o.concMax + '%</td></tr>';
      });
      h += '</tbody></table></div>';
    });
    $('jyOilList').innerHTML = h;
  }

  function renderBases() {
    var h = '<div class="tbl-hs"><table><thead><tr><th>基础油</th><th>主要作用</th><th>行业俗称</th><th>学名</th><th>质地</th><th>气味</th><th>保质</th><th>适用</th></tr></thead><tbody>';
    A.BASES.forEach(function (b) {
      h += '<tr><td>' + esc(b.name) + '</td><td>' + esc(b.main) + '</td><td>' + esc((A.BASE_EXTRA || {})[b.id] || '无') + '</td><td>' + esc(b.latin) + '</td><td>' + esc(b.tier) + '</td><td>' + esc(b.odor)
        + '</td><td>' + esc(b.keep) + '</td><td>' + esc(b.useOn) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    $('jyBaseList').innerHTML = h;
  }

  /* 纯露名录：来源、部位、主要成分、pH、保质、适用与禁忌，逐味一行；不参与配比与求解。 */
  function renderHydro() {
    var h = '<div class="tbl-hs"><table><thead><tr><th>纯露</th><th>来源植物</th><th>蒸馏部位</th><th>主要成分</th><th>pH</th><th>保质</th><th>适用</th><th>禁忌</th></tr></thead><tbody>';
    A.HYDRO.forEach(function (x) {
      h += '<tr><td>' + esc(x.name) + '</td><td>' + esc(x.plant) + '</td><td>' + esc(x.part) + '</td><td>' + esc(x.comp) + '</td><td>' + esc(x.ph) + '</td><td>' + esc(x.keep) + '</td><td>' + esc(x.use) + '</td><td>' + esc(x.avoid) + '</td></tr>';
    });
    $('jyHydroList').innerHTML = h + '</tbody></table></div><div class="sub-note">纯露不是精油稀释液；不口服，开封冷藏，无防腐剂时按短保用完。</div>';
  }

  function renderClassics() {
    var h = '';
    ['历史配方', '芳疗经典', '中医香囊'].forEach(function (k) {
      var list = A.CLASSICS.filter(function (c) { return c.kind === k; });
      if (!list.length) return;
      h += '<div class="rel-title">' + esc(k) + '</div><div class="tbl-hs"><table><thead><tr><th>组名</th><th>来历</th><th>原方形态</th><th>拟配</th><th>用法</th><th>浓度</th></tr></thead><tbody>';
      list.forEach(function (c) {
        h += '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.era) + '，' + esc(c.author) + '</td><td>' + esc(c.original)
          + '</td><td>' + esc(c.modern) + '</td><td>' + esc(c.method) + '</td><td>' + esc(c.conc) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    });
    $('jyClassicList').innerHTML = h;
  }

  function renderPeople() {
    var h = '<div class="rel-title">生理人群</div><div class="tbl-hs"><table><thead><tr><th>人群</th><th>常用</th><th>上限</th><th>宜用</th><th>禁用</th><th>用法限制</th></tr></thead><tbody>';
    A.GROUPS.forEach(function (g) {
      h += '<tr><td>' + esc(g.name) + '</td><td>' + esc(g.conc) + '</td><td>' + g.cap + '%</td><td>'
        + esc((g.safeOils || []).join('、') || '按效果选') + '</td><td>'
        + esc((g.avoidOils || []).join('、') || '无') + '</td><td>' + esc(g.limits) + '</td></tr>';
    });
    h += '</tbody></table></div><div class="rel-title">风险排查</div><div class="tbl-hs"><table><thead><tr><th>风险项</th><th>禁用</th><th>浓度上限</th><th>用法限制</th></tr></thead><tbody>';
    A.RISKS.forEach(function (r) {
      h += '<tr><td>' + esc(r.name) + '</td><td>' + esc((r.avoidOils || []).join('、') || '无') + '</td><td>' + r.cap + '%</td><td>' + esc(r.limits) + '</td></tr>';
    });
    h += '</tbody></table></div><div class="rel-title">职业与场景</div><div class="tbl-hs"><table><thead><tr><th>场景</th><th>常见诉求</th><th>用法</th><th>包装</th><th>禁忌</th></tr></thead><tbody>';
    A.SCENES.forEach(function (s) {
      h += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.needs) + '</td><td>' + esc(s.methods) + '</td><td>' + esc(s.package) + '</td><td>' + esc(s.limits) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    $('jyPeopleList').innerHTML = h;
  }

  function renderSeason() {
    var h = '<div class="rel-title">四季</div><div class="tbl-hs"><table><thead><tr><th>季</th><th>节气起止</th><th>阻断</th><th>警示</th></tr></thead><tbody>';
    A.SEASONS.forEach(function (s) {
      h += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.jq) + '</td><td>' + esc((s.block || []).join('、') || '无') + '</td><td>' + esc(s.warn) + '</td></tr>';
    });
    h += '</tbody></table></div><div class="rel-title">体质</div><div class="tbl-hs"><table><thead><tr><th>体质</th><th>阻断</th><th>警示</th><th>说明</th></tr></thead><tbody>';
    A.CONSTITUTION.forEach(function (c) {
      h += '<tr><td>' + esc(c.name) + '</td><td>' + esc((c.block || []).join('、') || '无') + '</td><td>' + esc(c.warn || '无') + '</td><td>' + esc(c.note) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    $('jySeasonList').innerHTML = h;
  }

  function renderSafety() {
    var h = '<div class="tbl-hs"><table><thead><tr><th>类</th><th>判据</th><th>命中</th></tr></thead><tbody>';
    A.SAFETY.forEach(function (s) {
      h += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.criteria) + '</td><td>' + esc(s.hits.join('、')) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    $('jySafetyList').innerHTML = h;
  }

  /* 经络与穴位：只出经络资料与常用穴，不按经推精油，免自造归经。 */
  function renderMeridian() {
    if (!JL || !JL.MERIDIANS) { $('jyMeridian').innerHTML = '<div class="sub-note">经络资料未装载。</div>'; return; }
    var opts = JL.MERIDIANS.map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>'; }).join('');
    $('jyMeridian').innerHTML = '<div class="form-row"><div class="field"><label for="jyMerSel">经络</label>'
      + '<select id="jyMerSel" onchange="jyDrawMeridian()" aria-label="选择经络">' + opts + '</select></div></div>'
      + '<div id="jyMerOut"></div><div class="sub-note">精油与经络的对应属当代推演，本站不按经推荐精油，只列该经当令时辰、循行与常用穴，精油按效果与性味另选。</div>';
    drawMeridian();
  }
  function drawMeridian() {
    var sel = $('jyMerSel'); if (!sel || !JL) return;
    var m = JL.MERIDIANS.filter(function (x) { return x.id === sel.value; })[0];
    if (!m) { $('jyMerOut').innerHTML = ''; return; }
    var pts = (JL.POINTS || []).filter(function (p) { return p.meridian === m.id; }).slice(0, 8);
    var h = '<div class="tbl-hs"><table class="tbl-kv">'
      + '<tr><th>当令时辰</th><td>' + esc(m.shichen) + '时 ' + esc(m.range) + '</td></tr>'
      + '<tr><th>循行</th><td>' + esc(m.xingFull || m.xing) + '</td></tr>'
      + '<tr><th>病候</th><td>' + esc(m.binghou) + '</td></tr>'
      + '<tr><th>常用穴</th><td>' + pts.map(function (p) { return esc(p.name) + '（' + esc(p.code) + '）'; }).join('、') + '</td></tr>'
      + '</table></div>';
    $('jyMerOut').innerHTML = h;
  }
  window.jyDrawMeridian = drawMeridian;

  /* 十二时辰当令表：引 shiling 的当令宜做，不按时辰推精油。 */
  function renderShichen() {
    var rows = (window.SHILING_JINGLUO || []);
    if (!rows.length) { $('jyWheelHost').innerHTML = '<div class="sub-note">时辰资料未装载。</div>'; return; }
    var h = '<div class="tbl-hs"><table class="tbl-kv">';
    rows.forEach(function (r) {
      h += '<tr><th>' + esc(r.zhi) + '时 ' + esc(r.jing) + '</th><td>' + esc(r.range) + '；' + esc(r.yi || '') + '</td></tr>';
    });
    h += '</table></div>';
    $('jyWheelHost').innerHTML = h;
    $('jyWheelDetail').innerHTML = '<div class="sub-note">时辰与精油的对应属当代推演，本站不按时辰推荐精油；按时辰用油请结合效果与人群另行选方。</div>';
  }

  /* 条件收集 */
  function stockNames(sel, inputId, names) {
    var out = pickVals(sel);
    parseNames($(inputId).value, names).forEach(function (n) { if (out.indexOf(n) < 0) out.push(n); });
    return out;
  }
  function collect() {
    var effects = [], risks = [];
    Array.prototype.forEach.call(document.querySelectorAll('.fx-box input:checked'), function (n) { effects.push(n.value); });
    ['epilepsy', 'asthma', 'hypertension', 'liver', 'kidney', 'medication'].forEach(function (id) {
      var n = $('rk-' + id); if (n && n.checked) risks.push(id);
    });
    return {
      effects: effects,
      people: $('jyPeople').value,
      age: $('jyAge').value,
      season: $('jySeason').value,
      thermal: $('jyThermal').value,
      risks: risks,
      scene: $('jyScene').value,
      method: $('jyMethod').value,
      volume: parseInt($('jyVolume').value, 10),
      count: parseInt($('jyCount').value, 10),
      baseCount: parseInt($('jyBaseCount').value, 10),
      conc: 0,
      stock: {
        oils: [],
        bases: stockNames('#jyPickBases', 'jyStockBasesIn', baseNames())
      },
      pinned: stockNames('#jyPickOils', 'jyStockOilsIn', oilNames())
    };
  }

  function seasonName(id) { var s = A.SEASONS.filter(function (x) { return x.id === id; })[0]; return s ? s.name : ''; }
  function therName(id) { var c = A.CONSTITUTION.filter(function (x) { return x.id === id; })[0]; return c ? c.name : ''; }
  function methodName(id) { return { roller: '滚珠', diffuse: '扩香', massage: '按摩', face: '面部' }[id] || ''; }

  function safetyText(p) {
    var tags = [];
    p.parts.forEach(function (x) {
      var o = A.OILS.filter(function (y) { return y.name === x.oil; })[0];
      if (o) (o.safety || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); });
    });
    return tags.length ? esc(tags.join('、')) : '无特殊禁忌';
  }
  function usageText(p) {
    if (!p.scene) return '按所选用法使用';
    return esc(p.scene.methods + '；' + p.scene.package + '；' + p.scene.limits);
  }

  /* 配方与基础油一律数据表：表头即数据维度，逐行一味。 */
  function planTable(p) {
    var h = '<div class="tbl-hs"><table><thead><tr><th>单方</th><th>角色</th><th>占比</th><th>滴数</th><th>性味</th><th>调位</th></tr></thead><tbody>';
    p.parts.forEach(function (x) {
      h += '<tr><td>' + esc(x.oil) + '</td><td>' + esc(x.role) + '</td><td>' + x.pct + '%</td><td>' + x.drops
        + '</td><td>' + esc(x.thermal) + '</td><td>' + esc(x.layer) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    if (p.bases && p.bases.length) {
      h += '<div class="tbl-hs"><table><thead><tr><th>基础油</th><th>占比</th><th>用量</th></tr></thead><tbody>';
      p.bases.forEach(function (b) {
        h += '<tr><td>' + esc(b.name) + '</td><td>' + b.pct + '%</td><td>' + b.ml + ' 毫升</td></tr>';
      });
      h += '</tbody></table></div>';
    }
    return h;
  }

  function renderPlan(p) {
    if (!p || !p.parts.length) {
      $('jyOut').innerHTML = '<div class="sub-note">按当前条件没有可用方案，请调整季节、体质或数量。</div>';
      return;
    }
    var effects = (p.cond.effects || []).map(function (id) {
      var e = A.EFFECTS.filter(function (x) { return x.id === id; })[0];
      return e ? e.name : id;
    }).join('、');
    var h = '<div class="rel-title">配方</div>';
    h += '<div class="tbl-hs"><table class="tbl-kv">'
      + '<tr><th>效果</th><td>' + esc(effects) + '</td></tr>'
      + '<tr><th>人群</th><td>' + esc((p.group && p.group.name) || '成人') + '</td></tr>'
      + '<tr><th>季节体质</th><td>' + esc(seasonName(p.cond.season)) + '，' + esc(therName(p.cond.thermal)) + '</td></tr>'
      + '<tr><th>用法</th><td>' + esc(methodName(p.cond.method)) + '，' + p.total.ml + ' 毫升</td></tr>'
      + '</table></div>';
    h += planTable(p);
    h += '<div class="tbl-hs"><table class="tbl-kv">'
      + '<tr><th>用量</th><td>共 ' + p.total.drops + ' 滴，浓度 ' + p.total.conc + '%，成品 ' + p.total.ml + ' 毫升</td></tr>'
      + '<tr><th>禁忌</th><td>' + safetyText(p) + '</td></tr>'
      + '<tr><th>施用</th><td>' + usageText(p) + '</td></tr>'
      + '</table></div>';
    if (p.notices && p.notices.length) h += '<div class="sub-note">' + esc(p.notices.join('；')) + '</div>';
    var problems = (p.checks || []).filter(function (c) { return !c.pass; });
    if (problems.length) h += '<div class="sub-note">' + esc(problems.map(function (c) { return c.note; }).join('；')) + '</div>';
    if (p.classics) h += '<div class="sub-note">最接近的经典方：' + esc(p.classics.name) + '，相似约 ' + p.classics.sim + '%。</div>';
    (p.alts || []).forEach(function (a, i) {
      h += '<div class="rel-title">备选 ' + (i + 1) + '</div>';
      h += planTable(a);
    });
    $('jyOut').innerHTML = h;
  }

  /* 历史：存条件，恢复后重算。 */
  function histSave() {
    var cond = collect();
    var e = {
      hEffects: cond.effects.join(','),
      hPeople: cond.people,
      hAge: cond.age,
      hSeason: cond.season,
      hThermal: cond.thermal,
      hScene: cond.scene,
      hMethod: cond.method,
      hVolume: String(cond.volume),
      hCount: String(cond.count),
      hBaseCount: String(cond.baseCount),
      hStockOils: stockNames('#jyPickOils', 'jyStockOilsIn', oilNames()).join('、'),
      hStockBases: stockNames('#jyPickBases', 'jyStockBasesIn', baseNames()).join('、')
    };
    window.xjHist.push('jyHistory', e, function (h) { return window.xjHist.key(h) === window.xjHist.key(e); });
  }
  var HIST_CFG = {
    mask: 'jyHistMask', list: 'jyHistList', key: 'jyHistory', title: '历史记录（最多9条）',
    restoreFn: 'jyRestore', delFn: 'jyDel',
    row: function (h) {
      var pn = (A.GROUPS.filter(function (g) { return g.id === h.hPeople; })[0] || {}).name || '成人';
      var sn = (A.SEASONS.filter(function (s) { return s.id === h.hSeason; })[0] || {}).name || '';
      return { t: (h.hEffects || '').split(',').length + ' 项效果，' + (h.hCount || '') + ' 种', main: pn + '，' + sn };
    }
  };
  function histOpen() { window.xjHist.open(HIST_CFG); }
  function histDel(i) { window.xjHist.del(HIST_CFG, i); }
  function histRestore(i) {
    var e = window.xjHist.get('jyHistory', i);
    if (!e) return;
    Array.prototype.forEach.call(document.querySelectorAll('.fx-box input'), function (n) {
      n.checked = (e.hEffects || '').split(',').indexOf(n.value) >= 0;
    });
    ['epilepsy', 'asthma', 'hypertension', 'liver', 'kidney', 'medication'].forEach(function (id) {
      var n = $('rk-' + id); if (n) n.checked = false;
    });
    if (e.hPeople) $('jyPeople').value = e.hPeople;
    if (e.hAge) $('jyAge').value = e.hAge;
    if (e.hSeason) $('jySeason').value = e.hSeason;
    if (e.hThermal) $('jyThermal').value = e.hThermal;
    if (e.hScene) $('jyScene').value = e.hScene;
    if (e.hMethod) $('jyMethod').value = e.hMethod;
    if (e.hVolume) $('jyVolume').value = e.hVolume;
    if (e.hCount) $('jyCount').value = e.hCount;
    if (e.hBaseCount) $('jyBaseCount').value = e.hBaseCount;
    Array.prototype.forEach.call(document.querySelectorAll('#jyPickOils input, #jyPickBases input'), function (n) { n.checked = false; });
    $('jyStockOilsIn').value = e.hStockOils || '';
    $('jyStockBasesIn').value = e.hStockBases || '';
    syncSums();
    runSolve();
  }
  window.jyRestore = histRestore;
  window.jyDel = histDel;

  var aiCtx = null;
  function runSolve() {
    var cond = collect();
    if (!cond.effects.length) {
      $('jyOut').innerHTML = '<div class="sub-note">先勾至少一项效果，再点查询方案。</div>';
      return;
    }
    var p = A.solve(cond);
    renderPlan(p);
    try { histSave(); } catch (e) { /* 历史不可用时不影响出方 */ }
    aiCtx = p;
  }

  function getContext() {
    if (!aiCtx) return '';
    var effects = (aiCtx.cond.effects || []).map(function (id) {
      var e = A.EFFECTS.filter(function (x) { return x.id === id; })[0];
      return e ? e.name : id;
    }).join('、');
    var lines = ['效果：' + effects, '人群：' + (aiCtx.group ? aiCtx.group.name : '成人')];
    aiCtx.parts.forEach(function (x) { lines.push(x.oil + ' ' + x.role + ' ' + x.pct + '% ' + x.drops + '滴'); });
    if (aiCtx.notices && aiCtx.notices.length) lines.push('提示：' + aiCtx.notices.join('；'));
    return lines.join('\n');
  }

  function init() {
    $('jySeason').value = seasonNow();
    renderPicks();
    renderOils();
    renderBases();
    renderHydro();
    renderClassics();
    renderPeople();
    renderSeason();
    renderSafety();
    renderMeridian();
    renderShichen();
    syncSums();
    $('jyBtn').addEventListener('click', runSolve);
    $('jyHistBtn').addEventListener('click', histOpen);
    /* 下拉勾选：点面板外任一区域即收起，点面板内只勾选不收起。 */
    document.addEventListener('click', function (e) {
      Array.prototype.forEach.call(document.querySelectorAll('.jy-pick[open]'), function (d) {
        if (!d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      Array.prototype.forEach.call(document.querySelectorAll('.jy-pick[open]'), function (d) { d.open = false; });
    });
    if (typeof window.mountAI === 'function') {
      try { window.mountAI(getContext, '精油芳疗'); } catch (e) { /* 面板挂载失败不影响主流程 */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      renderChrome('jingyou.html');
      init();
    }, 0);
  });
})();
