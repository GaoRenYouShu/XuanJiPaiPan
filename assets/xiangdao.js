/* 香道页脚本（assets/xiangdao.js）
 * 依赖：assets/lunar.js、assets/xiangdao-data.js。
 * 查询与资料表只读数据件；当令节气由历法库按访问时刻取，不自算。 */
(function (g) {
  'use strict';
  var D = g.XD_DATA || {};
  var MAT = D.materials || [];
  var FOR = D.formulas || [];
  var LAST = { mode: '', params: {} };
  var DONE = {};

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }
  function arr(v) { return Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]); }
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }

  function currentJieQi() {
    try {
      var l = g.Solar.fromDate(new Date()).getLunar();
      var jq = l.getPrevJieQi(true);
      return jq && jq.getName ? jq.getName() : '';
    } catch (e) { return ''; }
  }

  var EFFECT_GROUPS = {
    '安神': /安神|清心|宁神|禅悦|养心/,
    '辟秽': /辟秽|辟邪|祛秽|除浊/,
    '开窍': /开窍|醒神|通窍/,
    '温中': /温中|温阳|散寒|助阳|温经|暖中/,
    '行气': /行气|解郁|理气|疏肝|宽中/,
    '化湿': /化湿|燥湿|健脾|祛湿|和中|燥脾/,
    '清热': /清热|泻火|解毒|凉血|除烦/,
    '活血': /活血|散瘀|行血|止痛|调经/
  };

  function natureHit(nature, want) {
    if (!want) return true;
    return nature === want;
  }
  function effectHit(m, want) {
    if (!want) return true;
    var re = EFFECT_GROUPS[want];
    if (!re) return true;
    return arr(m.effect).some(function (e) { return re.test(e); });
  }
  function kwHit(text, kw) {
    if (!kw) return true;
    var t = String(text || '');
    return kw.split(/\s+/).filter(Boolean).every(function (k) { return t.indexOf(k) >= 0; });
  }

  function aux(text) { return '<div class="xd-aux">' + esc(text) + '</div>'; }
  function empty(text) { return '<div class="xd-empty">' + esc(text) + '</div>'; }
  function tag(text, cls) { return '<span class="xd-tag' + (cls ? ' ' + cls : '') + '">' + esc(text) + '</span>'; }
  function row(k, v) {
    if (!v) return '';
    return '<div class="xd-row"><div class="xd-k">' + esc(k) + '</div><div class="xd-v">' + esc(v) + '</div></div>';
  }

  function materialCard(m) {
    var h = '<div class="xd-card">';
    h += '<div class="xd-card-h"><span class="xd-name">' + esc(m.name) + '</span>';
    if (arr(m.alias).length) h += '<span class="xd-alias">' + esc(arr(m.alias).join('、')) + '</span>';
    h += tag(m.cat || '未载');
    h += tag(m.nature || '未载', 'ok');
    if (arr(m.meridians).length) h += tag(arr(m.meridians).join('') + '经');
    h += '</div>';
    h += row('性味', (arr(m.flavor).join('') || '未载') + '，' + (m.nature || '未载'));
    h += row('香用', arr(m.effect).join('，'));
    h += row('用法', m.method);
    h += row('产地', m.origin);
    h += row('要略', m.use);
    if (arr(m.caution).length) h += '<div class="xd-alert">' + esc(arr(m.caution).map(function (t) { return String(t).replace(/[。；，]+$/, ''); }).join('；')) + '。</div>';
    h += row('出处', m.source);
    h += '</div>';
    return h;
  }

  function formulaCard(f) {
    var h = '<div class="xd-card">';
    h += '<div class="xd-card-h"><span class="xd-name">' + esc(f.name) + '</span>';
    h += tag(f.era || '未载');
    h += tag(f.type || '未载', 'ok');
    h += '</div>';
    h += row('组成', f.ingredients);
    h += row('制法', f.method);
    h += row('用法', f.use);
    h += row('功用', f.function);
    h += row('出处', f.source);
    h += '</div>';
    return h;
  }

  function renderMaterials(list, params) {
    var out = $('xdOut');
    if (!out) return;
    var cond = [];
    if (params.kw) cond.push('关键词 ' + params.kw);
    if (params.cat) cond.push('类别 ' + params.cat);
    if (params.nature) cond.push('性味 ' + params.nature);
    if (params.mer) cond.push('归经 ' + params.mer);
    if (params.eff) cond.push('香用 ' + params.eff);
    var h = aux('香材查询：' + (cond.length ? cond.join('；') : '全部') + '；共 ' + list.length + ' 味。');
    h += list.length ? list.map(materialCard).join('') : empty('无匹配香材，换关键词或放宽筛选。');
    out.innerHTML = h;
  }

  function searchMaterials() {
    var p = {
      kw: val('xdMatKw'),
      cat: val('xdMatCat'),
      nature: val('xdMatNature'),
      mer: val('xdMatMer'),
      eff: val('xdMatEffect')
    };
    var list = MAT.filter(function (m) {
      if (p.cat && m.cat !== p.cat) return false;
      if (!natureHit(m.nature || '', p.nature)) return false;
      if (p.mer && arr(m.meridians).indexOf(p.mer) < 0) return false;
      if (!effectHit(m, p.eff)) return false;
      if (!kwHit([m.name].concat(arr(m.alias)).join(' ') + ' ' + arr(m.effect).join(' ') + ' ' + (m.origin || ''), p.kw)) return false;
      return true;
    });
    LAST = { mode: 'materials', params: p };
    renderMaterials(list, p);
  }

  function searchFormulas() {
    var p = {
      kw: val('xdForKw'),
      use: val('xdForUse'),
      type: val('xdForType'),
      era: val('xdForEra')
    };
    var list = FOR.filter(function (f) {
      if (p.use && String(f.use || '').indexOf(p.use) < 0) return false;
      if (p.type && f.type !== p.type) return false;
      if (p.era && f.era !== p.era) return false;
      if (!kwHit([f.name, f.ingredients, f.function, f.method].join(' '), p.kw)) return false;
      return true;
    });
    LAST = { mode: 'formulas', params: p };
    var cond = [];
    if (p.kw) cond.push('关键词 ' + p.kw);
    if (p.use) cond.push('用法 ' + p.use);
    if (p.type) cond.push('剂型 ' + p.type);
    if (p.era) cond.push('朝代 ' + p.era);
    var out = $('xdOut');
    if (!out) return;
    var h = aux('香方查询：' + (cond.length ? cond.join('；') : '全部') + '；共 ' + list.length + ' 首。');
    h += list.length ? list.map(formulaCard).join('') : empty('无匹配香方，换关键词或放宽筛选。');
    out.innerHTML = h;
  }

  function searchSeasonal() {
    var pick = val('xdTerm');
    var term = pick && pick !== 'auto' ? pick : currentJieQi();
    var cid = val('xdConst');
    var t = (D.solarTerms || []).filter(function (x) { return x.term === term; })[0] || null;
    var c = cid ? (D.constitutions || []).filter(function (x) { return x.id === cid; })[0] : null;
    LAST = { mode: 'seasonal', params: { term: pick, const: cid } };
    var out = $('xdOut');
    if (!out) return;
    var h = aux('当令香养：节气 ' + (term || '未取到') + (c ? '；体质 ' + c.name : '') + '。');
    if (t) {
      h += '<div class="xd-card"><div class="xd-card-h"><span class="xd-name">' + esc(t.term) + '</span>' + tag(t.season + '令', 'ok') + '</div>';
      h += row('香养方向', t.direction);
      h += row('宜用香材', arr(t.materials).join('、'));
      h += row('取法', '取其性味与节令相应，焚熏佩浴各随其宜；体弱者从轻从少。');
      h += row('出处', '素问 四气调神大论；性味见各香材条');
      h += '</div>';
    }
    if (c) {
      h += '<div class="xd-card"><div class="xd-card-h"><span class="xd-name">' + esc(c.name) + '</span>' + tag('体质', 'ok') + '</div>';
      h += row('常见征象', c.signs);
      h += row('香养方向', c.direction);
      h += row('宜用香材', arr(c.materials).join('、'));
      h += row('忌用', arr(c.avoid).join('、'));
      h += '<div class="xd-alert">体质香养为本站依性味与四时归纳，不冒典籍；辨识须由医师。</div>';
      h += '</div>';
    }
    if (!t && !c) h += empty('未取到节气，改选具体节气再查。');
    out.innerHTML = h;
  }

  function table(head, rows) {
    var h = '<div class="tbl-hs"><table class="xd-tbl' + (head.length > 4 ? ' wide' : '') + '"><thead><tr>';
    head.forEach(function (x) { h += '<th>' + esc(x) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>';
      r.forEach(function (c) { h += '<td>' + esc(c) + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function renderMod(kind) {
    if (DONE[kind]) return;
    var box = {
      material: 'xdMaterialBody', formula: 'xdFormulaBody', rite: 'xdRiteBody',
      tool: 'xdToolBody', odor: 'xdOdorBody', const: 'xdConstBody',
      term: 'xdTermBody', caution: 'xdCautionBody', note: 'xdNoteBody'
    }[kind];
    var el = box ? $(box) : null;
    if (!el) return;
    var h = '';
    if (kind === 'material') {
      h = table(['香材', '类别', '性味', '归经', '香用', '用法', '产地', '出处'], MAT.map(function (m) {
        return [m.name, m.cat || '未载', (arr(m.flavor).join('') || '未载') + ' ' + (m.nature || ''),
          arr(m.meridians).length ? arr(m.meridians).join('') : '未载', arr(m.effect).join('，'), m.method || '', m.origin || '', m.source || ''];
      }));
      h += '<p class="sub-note">性味归经以《中华本草》与《中国药典》为主据，《本草纲目》并列；归经未载者不列。</p>';
    } else if (kind === 'formula') {
      h = table(['方名', '朝代', '剂型', '组成', '制法', '用法', '功用', '出处'], FOR.map(function (f) {
        return [f.name, f.era || '', f.type || '', f.ingredients || '', f.method || '', f.use || '', f.function || '', f.source || ''];
      }));
      h += '<p class="sub-note">古方原量只作配香比例，觔作斤，两钱分厘照原文，不折现代用量；底本阙字未辨者不录。</p>';
    } else if (kind === 'rite') {
      h = table(['法式', '器具', '步骤', '要点', '出处'], (D.rites || []).map(function (r) {
        return [r.name, r.tools || '', r.steps || '', r.point || '', r.source || ''];
      }));
    } else if (kind === 'tool') {
      h = table(['器名', '形制', '用途', '出处'], (D.tools || []).map(function (t) {
        return [t.name, t.form || '', t.use || '', t.source || ''];
      }));
    } else if (kind === 'odor') {
      h = table(['五臭', '五脏', '方位', '取义', '出处'], (D.fiveOdors || []).map(function (o) {
        return [o.odor, o.organ, o.direction, o.meaning, o.source];
      }));
      h += '<p class="sub-note">五臭见《素问·金匮真言论》；香入脾、鼻为肺窍，为香药归经与用香取法之据。</p>';
    } else if (kind === 'const') {
      h = table(['体质', '常见征象', '香养方向', '宜用香材', '忌用'], (D.constitutions || []).map(function (c) {
        return [c.name, c.signs, c.direction, arr(c.materials).join('、'), arr(c.avoid).join('、')];
      }));
      h += '<p class="sub-note">体质香养为本站依性味与四时归纳，不冒典籍；体质辨识须由医师。</p>';
    } else if (kind === 'term') {
      h = table(['节气', '时令', '香养方向', '宜用香材'], (D.solarTerms || []).map(function (t) {
        return [t.term, t.season, t.direction, arr(t.materials).join('、')];
      }));
      h += '<p class="sub-note">节气香养为本站归纳，四季原则本《素问·四气调神大论》。</p>';
    } else if (kind === 'caution') {
      h = table(['忌项', '缘由', '处置', '出处'], (D.cautions || []).map(function (c) {
        return [c.item, c.reason, c.action, c.source];
      }));
    } else if (kind === 'note') {
      var n = D.notes || {};
      h = table(['凡例', '说明'], [
        ['选本', n.edition || ''],
        ['异说', n.variant || ''],
        ['阙字', n.lost || ''],
        ['原量', n.measure || ''],
        ['归纳', n.induction || ''],
        ['边界', n.boundary || '']
      ]);
      h += '<p class="sub-note">书目与在线读本见典籍参考页养生门；本页只列选本、异说、阙字与凡例。</p>';
    }
    el.innerHTML = h;
    DONE[kind] = true;
  }

  function aiContext() {
    var s = '页面：香道\n';
    var p = LAST.params || {};
    if (LAST.mode === 'materials') s += '查询：香材 ' + (p.kw || '全部') + '\n';
    else if (LAST.mode === 'formulas') s += '查询：香方 ' + (p.kw || '全部') + '\n';
    else if (LAST.mode === 'seasonal') s += '查询：当令香养 ' + (p.term || '当令') + '\n';
    var out = $('xdOut');
    s += '结果摘要：' + (out ? String(out.innerText || '').slice(0, 3000) : '');
    return s;
  }

  function shareCollect() { return { mode: LAST.mode, params: LAST.params }; }

  function shareRestore(d) {
    d = d || {};
    var p = d.params || {};
    var maps = {
      materials: { xdMatKw: p.kw, xdMatCat: p.cat, xdMatNature: p.nature, xdMatMer: p.mer, xdMatEffect: p.eff },
      formulas: { xdForKw: p.kw, xdForUse: p.use, xdForType: p.type, xdForEra: p.era },
      seasonal: { xdTerm: p.term, xdConst: p.const }
    };
    var map = maps[d.mode] || {};
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (el && map[id] != null) el.value = map[id];
    });
    LAST = { mode: d.mode || '', params: p };
  }

  function recast() {
    if (LAST.mode === 'materials') searchMaterials();
    else if (LAST.mode === 'formulas') searchFormulas();
    else if (LAST.mode === 'seasonal') searchSeasonal();
  }

  function mountAI() {
    if (g.mountAI) {
      g.mountAI(aiContext, '香道', {
        share: { page: 'xiangdao', result: '#xdOut', collect: shareCollect, restore: shareRestore, recast: recast }
      });
    }
  }

  function bindMods() {
    Array.prototype.forEach.call(document.querySelectorAll('details[data-mod]'), function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) renderMod(d.getAttribute('data-mod'));
      });
    });
  }

  bindMods();

  g.XD = {
    mountAI: mountAI,
    searchMaterials: searchMaterials,
    searchFormulas: searchFormulas,
    searchSeasonal: searchSeasonal,
    renderMod: renderMod
  };
})(window);
