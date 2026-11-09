/* 食疗页引擎（assets/shiliao.js）
 * 依赖：assets/lunar.js、assets/shiliao-data.js。
 * 对外接口：window.SL 的 searchFoods、searchRecipes、searchSeasonal、planMeal、planWeek、copyShopping、renderMod。
 * 数据件给终值，本件只做筛选、评分与渲染；不从结果文案回读数据。 */
(function (g) {
  'use strict';

  var D = g.SL_DATA || {};
  var FOODS = D.foods || [];
  var RECIPES = D.recipes || [];
  var YAOSHI = D.yaoshi || [];
  var BOOKS = D.books || [];
  var CONST = D.constitutions || [];
  var SEASONS = D.seasons || [];
  var REGIONS = D.regions || [];
  var PROVS = D.provinces || [];
  var GROUPS = D.groups || [];
  var LIMITS = D.limits || [];
  var BALANCE = D.balance || [];
  var HAZARDS = D.hazards || [];
  var INTER = D.interactions || [];
  var CITIES = D.cities || [];
  var CITY_FOODS = D.cityFoods || {};
  var FLAVORS = D.flavors || [];
  var NATURES = D.natures || [];

  var FBYNAME = {}, FBYID = {}, HERB_BAN = {}, SCENE_TAGS = {};
  FOODS.forEach(function (f) { FBYNAME[f.name] = f; FBYID[f.id] = f; });
  YAOSHI.forEach(function (y) { if (y.status === '目录外') HERB_BAN[y.name] = 1; });
  (D.scenes || []).forEach(function (s) { SCENE_TAGS[s.name] = s.tags || []; });

  var CATS = ['谷薯', '豆类', '蔬菜', '果品', '畜肉', '禽蛋', '水产', '乳品', '菌藻', '坚果种子', '调味', '药食同源'];
  var COST_TIERS = ['平价', '中等', '较高'];
  var MERIDIANS = ['心', '肝', '脾', '肺', '肾', '胃', '胆', '大肠', '小肠', '膀胱', '三焦', '心包'];
  var SEASON_IDS = ['spring', 'summer', 'changxia', 'autumn', 'winter'];
  var SEASON_NAMES = { spring: '春', summer: '夏', changxia: '长夏', autumn: '秋', winter: '冬' };
  var LAST = { mode: '', params: {} };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function arr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
  function uniq(a) { var o = [], s = {}; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function has(a, x) { return a && a.indexOf(x) >= 0; }
  function byId(a, id) { for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function fmt(a) { return arr(a).join('、'); }
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, '').toLowerCase(); }

  function sourceOf(f) {
    if (!f.sourceBook) return '未载';
    var ch = f.sourceChapter && f.sourceChapter !== '待核' ? f.sourceChapter : '';
    return ch ? '《' + f.sourceBook + '·' + ch + '》' : '《' + f.sourceBook + '》';
  }
  function joinClause(a, b) {
    var s = String(a == null ? '' : a), t = String(b == null ? '' : b);
    if (!s) return t;
    if (!t) return s;
    return /[。；，、！？]$/.test(s) ? s + t : s + '；' + t;
  }
  function joinList(a, sep) {
    sep = sep || '；';
    return arr(a).reduce(function (s, x) {
      var t = String(x == null ? '' : x);
      if (!s) return t;
      if (!t) return s;
      return /[。；，、！？]$/.test(s) ? s + t : s + sep + t;
    }, '');
  }
  function natureText(f) { return fmt(f.flavor) + '，' + f.nature; }
  function meridianText(f) { return f.meridians && f.meridians.length ? '归' + fmt(f.meridians) + '经' : '归经未载'; }
  function originText(f) {
    var s = f.originMain || '主产区未载';
    if (f.originGeo) s = joinClause(s, '传统产区：' + f.originGeo);
    if (f.originNote) s = joinClause(s, f.originNote);
    return s;
  }
  function yaoshiLabel(f) {
    if (f.yaoshi === '目录内') return '药食同源';
    if (HERB_BAN[f.name]) return '目录外，不作食用推荐';
    return '普通食材';
  }
  function costOf(f) { return (f && f.cost) || '未标'; }
  function safetyAlert(f) {
    var t = arr(f.caution).join('') + arr(f.allergens).join('');
    var hit = [];
    if (/孕|哺乳/.test(t)) hit.push('孕期与哺乳期请先询医师');
    if (/婴幼儿|儿童|一岁/.test(t)) hit.push('儿童与婴幼儿按年龄调整');
    if (/过敏/.test(t) || arr(f.allergens).length) hit.push('过敏体质注意过敏原');
    if (/服药|药物/.test(t)) hit.push('服药者请先询医师或药师');
    if (!hit.length) return '';
    return '<div class="sl-alert">' + esc(uniq(hit).join('；')) + '。</div>';
  }
  function tag(text, cls) { return '<span class="sl-tag' + (cls ? ' ' + cls : '') + '">' + esc(text) + '</span>'; }

  function currentJieQi() {
    try {
      var l = g.Solar.fromDate(new Date()).getLunar();
      var jq = l.getPrevJieQi(true);
      return jq && jq.getName ? jq.getName() : '';
    } catch (e) { return ''; }
  }
  function currentSeason() {
    var n = currentJieQi();
    if (/立春|雨水|惊蛰|春分|清明|谷雨/.test(n)) return 'spring';
    if (/立夏|小满|芒种|夏至|小暑|大暑/.test(n)) return 'summer';
    if (/立秋|处暑|白露|秋分|寒露|霜降/.test(n)) return 'autumn';
    if (/立冬|小雪|大雪|冬至|小寒|大寒/.test(n)) return 'winter';
    var m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }
  function seasonId(v) { return !v || v === 'auto' ? currentSeason() : v; }
  function citiesOf(province) {
    return province ? CITIES.filter(function (c) { return c.province === province; }) : [];
  }
  function cityFoodsOf(city) {
    return city ? arr(CITY_FOODS[city]) : [];
  }
  function fillCity(selId, province, keep) {
    var sel = $(selId);
    if (!sel) return;
    var list = citiesOf(province);
    var h = '';
    if (!list.length) {
      h = '<option value="">' + (province ? '不限' : '先选地区') + '</option>';
    } else if (list.length === 1 && /^(全市|全境)$/.test(list[0].name)) {
      h = '<option value="">' + esc(list[0].name) + '</option>';
    } else {
      h = '<option value="">全省</option>';
      list.forEach(function (c) { h += '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>'; });
    }
    sel.innerHTML = h;
    if (keep && list.some(function (c) { return c.name === keep; })) sel.value = keep;
  }
  function syncCities(which) {
    var province = which === 'season' ? val('slSeasonProvince') : val('slPlanProvince');
    fillCity(which === 'season' ? 'slSeasonCity' : 'slPlanCity', province, '');
  }
  function initCities() {
    fillCity('slSeasonCity', val('slSeasonProvince'), val('slSeasonCity'));
    fillCity('slPlanCity', val('slPlanProvince'), val('slPlanCity'));
  }
  function regionOf(province) {
    if (!province) return null;
    for (var i = 0; i < PROVS.length; i++) {
      if (PROVS[i].province !== province) continue;
      var key = PROVS[i].region;
      for (var j = 0; j < REGIONS.length; j++) {
        if (REGIONS[j].name === key || REGIONS[j].id === key) return REGIONS[j];
      }
    }
    return null;
  }
  function seasonOf(id) { return byId(SEASONS, id); }
  function constitutionOf(id) { return byId(CONST, id); }
  function groupOf(id) { return byId(GROUPS, id); }
  function limitOf(id) { return byId(LIMITS, id); }
  function checkedLimits() {
    var box = $('slPlanLimitBox');
    if (!box) return [];
    return Array.prototype.slice.call(box.querySelectorAll('input[type=checkbox]:checked')).map(function (x) { return x.value; });
  }
  function syncLimitSum() {
    var sum = $('slPlanLimitSum');
    if (!sum) return;
    var n = checkedLimits().length;
    sum.textContent = n ? '已选 ' + n + ' 项' : '未选';
  }

  function foodSearchText(f) {
    var scenes = [];
    Object.keys(SCENE_TAGS).forEach(function (name) {
      var tags = SCENE_TAGS[name];
      if (tags.some(function (t) { return has(f.effect, t); })) scenes.push(name);
    });
    return norm([f.name, fmt(f.alias), f.py || '', f.trad || '', f.cat, f.nature, fmt(f.flavor), fmt(f.meridians), fmt(f.effect), f.use, f.originMain, f.originGeo, scenes.join(' ')].join(' '));
  }
  function recipeSearchText(r) {
    return norm([r.name, r.cat, fmt(r.effect), r.suitable, r.caution, arr(r.ingredients).map(function (x) { return x.name; }).join('')].join(' '));
  }

  function table(head, rows, cls) {
    var h = '<div class="tbl-hs"><table class="sl-tbl' + (cls ? ' ' + cls : '') + '"><thead><tr>';
    head.forEach(function (x) { h += '<th scope="col">' + esc(x) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>';
      r.forEach(function (c) { h += '<td>' + c + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }
  function empty(msg) { return '<div class="sl-empty">' + esc(msg) + '</div>'; }
  function outMeta(s) { return '<div class="sl-aux">' + esc(s) + '</div>'; }

  function foodCard(f) {
    var rows = [
      ['性味', esc(natureText(f))],
      ['归经', esc(meridianText(f))],
      ['食养方向', esc(fmt(f.effect))],
      ['传统应用', esc(f.use || '未载')],
      ['用法用量', esc(f.foodUse || '未载')],
      ['成本档', esc(costOf(f))],
      ['宜忌', esc(arr(f.caution).length ? joinList(f.caution) : '无特别记载')],
      ['主产区产地差异', esc(originText(f))],
      ['出处与档位', esc(sourceOf(f) + '，' + f.grade + '档，' + (f.status === '已核' ? '已核' : '待核'))]
    ];
    var h = '<div class="sl-card">';
    h += '<div class="sl-card-h"><span class="sl-name">' + esc(f.name) + '</span>';
    if (f.alias && f.alias.length) h += '<span class="sl-alias">' + esc(fmt(f.alias)) + '</span>';
    h += tag(f.cat) + tag(yaoshiLabel(f), f.yaoshi === '目录内' ? 'ok' : '');
    if (f.status !== '已核') h += tag('待核', 'warn');
    h += '</div>';
    h += safetyAlert(f);
    if (arr(f.allergens).length) h += '<div class="sl-alert">过敏原：' + esc(fmt(f.allergens)) + '。</div>';
    rows.forEach(function (r) {
      h += '<div class="sl-row"><span class="sl-k">' + esc(r[0]) + '</span><span class="sl-v">' + r[1] + '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function recipeCard(r) {
    var ing = arr(r.ingredients).map(function (x) { return x.name + ' ' + x.amount; }).join('、');
    var rows = [
      ['组成', esc(ing)],
      ['制法', esc(joinList(r.method))],
      ['食养方向', esc(fmt(r.effect))],
      ['适宜', esc(r.suitable || '未载')],
      ['宜忌', esc(r.caution || '无特别记载')],
      ['原方与今用', esc(joinClause(r.original ? '原方：' + r.original : '', r.modern ? '今用参考量：' + r.modern : '按常用烹饪量'))],
      ['出处与档位', esc(sourceOf(r) + '，' + r.grade + '档，' + (r.status === '已核' ? '已核' : '待核'))]
    ];
    var h = '<div class="sl-card">';
    h += '<div class="sl-card-h"><span class="sl-name">' + esc(r.name) + '</span>' + tag(r.cat);
    if (r.status !== '已核') h += tag('待核', 'warn');
    h += '</div>';
    if (r.adaptation) h += '<div class="sl-aux">' + esc(r.adaptation) + '</div>';
    rows.forEach(function (x) {
      h += '<div class="sl-row"><span class="sl-k">' + esc(x[0]) + '</span><span class="sl-v">' + x[1] + '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function sortFoods(a, kw) {
    var q = norm(kw);
    return a.sort(function (x, y) {
      function rank(f) {
        if (!q) return 0;
        if (norm(f.name) === q) return 0;
        if (norm(f.name).indexOf(q) === 0) return 1;
        if (norm(fmt(f.alias)).indexOf(q) >= 0) return 2;
        if (norm(f.originMain + f.originGeo).indexOf(q) >= 0) return 3;
        return 4;
      }
      var d = rank(x) - rank(y);
      if (d) return d;
      return x.name.localeCompare(y.name, 'zh');
    });
  }

  function searchFoods() {
    var kw = val('slFoodKw');
    var cat = val('slFoodCat');
    var nature = val('slFoodNature');
    var mer = val('slFoodMer');
    var ys = val('slFoodYaoshi');
    var q = norm(kw);
    if (!q && !cat && !nature && !mer && !ys) {
      LAST = { mode: 'foods', params: { kw: '', cat: '', nature: '', mer: '', ys: '' } };
      $('slOut').innerHTML = empty('请输入食材关键词，或至少选择一项筛选条件。');
      return;
    }
    var list = FOODS.filter(function (f) {
      if (cat && f.cat !== cat) return false;
      if (nature && f.nature !== nature) return false;
      if (mer && !has(f.meridians, mer)) return false;
      if (ys) {
        if (ys === '目录内' && f.yaoshi !== '目录内') return false;
        if (ys === '普通' && f.yaoshi === '目录内') return false;
      }
      if (q && foodSearchText(f).indexOf(q) < 0) return false;
      return true;
    });
    sortFoods(list, kw);
    var total = list.length;
    var show = list.slice(0, 50);
    LAST = { mode: 'foods', params: { kw: kw, cat: cat, nature: nature, mer: mer, ys: ys } };
    var h = outMeta('共 ' + total + ' 味' + (total > 50 ? '，显示前 50 味，请收窄条件' : '') + '。');
    if (!total) h += empty('未找到匹配食材，可换关键词或减少筛选。');
    show.forEach(function (f) { h += foodCard(f); });
    $('slOut').innerHTML = h;
  }

  function searchRecipes() {
    var kw = val('slRecipeKw');
    var cat = val('slRecipeCat');
    var eff = val('slRecipeEffect');
    var q = norm(kw);
    if (!q && !cat && !eff) {
      LAST = { mode: 'recipes', params: { kw: '', cat: '', eff: '' } };
      $('slOut').innerHTML = empty('请输入食疗方关键词，或至少选择类别或功效方向。');
      return;
    }
    var list = RECIPES.filter(function (r) {
      if (cat && r.cat !== cat) return false;
      if (eff && norm(fmt(r.effect)).indexOf(norm(eff)) < 0) return false;
      if (q && recipeSearchText(r).indexOf(q) < 0) return false;
      return true;
    });
    list.sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); });
    LAST = { mode: 'recipes', params: { kw: kw, cat: cat, eff: eff } };
    var h = outMeta('共 ' + list.length + ' 首。古方原量与今用参考量并列，待核方只作资料。');
    if (!list.length) h += empty('未找到匹配食疗方，可换关键词或类别。');
    list.forEach(function (r) { h += recipeCard(r); });
    $('slOut').innerHTML = h;
  }

  function seasonalOf(region, sid) {
    if (!region || !region.seasonal) return [];
    var a = region.seasonal[sid] || [];
    return arr(a);
  }

  function searchSeasonal() {
    var province = val('slSeasonProvince');
    var city = val('slSeasonCity');
    var sid = seasonId(val('slSeasonSeason'));
    var region = regionOf(province);
    LAST = { mode: 'seasonal', params: { province: province, city: city, season: val('slSeasonSeason') } };
    if (!region) {
      $('slOut').innerHTML = empty('请选择地区，再查当令食材。');
      return;
    }
    var names = seasonalOf(region, sid);
    var rows = names.map(function (n) {
      var f = FBYNAME[n];
      return [esc(n), f ? esc(natureText(f)) : '未入食材表', f ? esc(fmt(f.effect)) : '未载'];
    });
    var jq = currentJieQi();
    var h = outMeta('地区：' + region.name + (province ? '（' + province + (city ? ' ' + city : '') + '）' : '') + '；季节：' + (SEASON_NAMES[sid] || sid) + (jq ? '；当前节气：' + jq : '') + '。当令为通行上市期，受气候与小气候影响。');
    h += table(['当令食材', '性味', '食养方向'], rows);
    if (city) {
      var local = cityFoodsOf(city);
      h += '<div class="sl-aux">' + esc(city + '常产食材：' + (local.length ? local.join('、') : '按所在地区通行物产')) + '。</div>';
    }
    var cards = names.map(function (n) { return FBYNAME[n]; }).filter(Boolean).slice(0, 8);
    cards.forEach(function (f) { h += foodCard(f); });
    h += '<div class="sl-aux">' + esc(region.climate || '') + '食养原则：' + esc(region.principle || '') + '</div>';
    $('slOut').innerHTML = h;
  }

  var LIMIT_NAMES = {
    kangtang: ['白糖', '冰糖', '红糖', '蜂蜜', '糖果', '糕点', '含糖饮料', '荔枝', '龙眼', '大枣'],
    kongyan: ['盐', '酱油', '豆豉', '腐乳', '腌菜', '咸菜', '腊肉', '香肠', '火腿'],
    kongzhi: ['猪油', '肥肉', '奶油', '黄油', '油炸'],
    dipiaoling: ['猪肝', '鸡肝', '羊肾', '虾', '蟹', '贝', '沙丁鱼', '凤尾鱼', '浓汤'],
    dijia: ['香蕉', '橙', '土豆', '菠菜', '海带', '紫菜', '蘑菇', '香菇'],
    rutang: ['牛奶', '酸奶', '奶酪', '乳酪', '奶油'],
    fuzhi: ['小麦', '大麦', '黑麦', '面条', '面包', '馒头', '面筋'],
    jianguo: ['核桃', '杏仁', '腰果', '花生', '松子', '榛子', '开心果', '芝麻', '瓜子']
  };
  function limitBan(f, ids) {
    var list = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    if (!list.length) return false;
    return list.some(function (id) {
      var names = LIMIT_NAMES[id] || [];
      if (has(names, f.name)) return true;
      if (id === 'jianguo' && f.cat === '坚果种子') return true;
      if (id === 'rutang' && f.cat === '乳品') return true;
      if (id === 'fuzhi' && (f.name.indexOf('麦') >= 0 || f.name.indexOf('面') >= 0)) return true;
      return false;
    });
  }
  function groupBan(f, group) {
    if (!group) return false;
    var avoid = arr(group.avoid);
    if (has(avoid, '蜂蜜') && f.name === '蜂蜜') return true;
    if (has(avoid, '整粒坚果') && f.cat === '坚果种子') return true;
    if ((has(avoid, '高盐') || has(avoid, '过咸')) && limitBan(f, 'kongyan')) return true;
    if ((has(avoid, '高糖') || has(avoid, '过甜')) && limitBan(f, 'kangtang')) return true;
    if (group.id === 'sushizhe' && (f.cat === '畜肉' || f.cat === '水产')) return true;
    if (group.id === 'yunqi' && ['山楂', '薏苡仁', '桂圆', '肉桂', '丁香', '花椒', '干姜', '甘草'].indexOf(f.name) >= 0) return true;
    if (group.id === 'buruqi' && ['麦芽', '山楂'].indexOf(f.name) >= 0) return true;
    return false;
  }
  function seasonScore(f, season) {
    if (!season) return 0;
    var s = 0;
    if (has(arr(season.eat), f.name)) s += 1;
    if (has(arr(season.avoid), '过酸') && has(f.flavor, '酸')) s -= 1;
    if (has(arr(season.avoid), '辛辣') && has(f.flavor, '辛')) s -= 1;
    if (has(arr(season.avoid), '生冷') && (f.nature === '寒' || f.nature === '凉')) s -= 1;
    return s;
  }
  function constitutionScore(f, c) {
    if (!c) return 0;
    var s = 0;
    if (has(arr(c.eat), f.name)) s += 1;
    var avoid = arr(c.avoid);
    if ((has(avoid, '生冷') || has(avoid, '寒凉') || has(avoid, '冰饮')) && (f.nature === '寒' || f.nature === '凉')) s -= 2;
    if (has(avoid, '辛辣') && has(f.flavor, '辛')) s -= 1;
    if (has(avoid, '过酸') && has(f.flavor, '酸')) s -= 1;
    if ((has(avoid, '油腻') || has(avoid, '肥甘') || has(avoid, '厚味')) && f.cat === '畜肉') s -= 1;
    return s;
  }
  function regionScore(f, region) {
    if (!region) return 0;
    var s = 0;
    if (has(arr(region.localFoods), f.name)) s += 2;
    var eff = arr(f.effect).join('');
    arr(region.prefer).forEach(function (p) { if (eff.indexOf(p) >= 0) s += 1; });
    arr(region.avoid).forEach(function (a) { if (eff.indexOf(a) >= 0) s -= 2; });
    return s;
  }
  function groupScore(f, group) {
    if (!group) return 0;
    var s = 0;
    if (has(arr(group.eat), f.name)) s += 1;
    return s;
  }
  function scoreOf(f, ctx) {
    var city = has(arr(ctx.cityFoods), f.name) ? 4 : 0;
    return city + regionScore(f, ctx.region) + seasonScore(f, ctx.season) + constitutionScore(f, ctx.constitution) + groupScore(f, ctx.group);
  }
  function recipeScore(r, ctx) {
    var ings = arr(r.ingredients).map(function (x) { return ingredientFood(x.name); }).filter(Boolean);
    if (!ings.length) return 0;
    var sum = 0;
    ings.forEach(function (f) { sum += scoreOf(f, ctx); });
    return sum / ings.length;
  }
  function pick(pool, cats, used, n) {
    var list = pool.filter(function (f) {
      return cats.indexOf(f.cat) >= 0 && !used[f.name];
    });
    list.sort(function (a, b) {
      var d = (b.__score || 0) - (a.__score || 0);
      if (d) return d;
      return a.name.localeCompare(b.name, 'zh');
    });
    return list.slice(0, n);
  }
  function scaleAmount(text, factor) {
    var s = String(text == null ? '' : text);
    if (!factor || factor === 1) return s;
    var m = s.match(/^(\d+(?:\.\d+)?)\s*(\S.*)$/);
    if (!m) return s;
    var n = parseFloat(m[1]) * factor;
    var unit = m[2];
    if (/^(个|只|根|副|片|枚|条|把|颗|粒|朵|块|杯|碗)$/.test(unit)) n = Math.max(1, Math.round(n));
    else n = Math.round(n * 10) / 10;
    return n + ' ' + unit;
  }
  function amountOf(f, factor) {
    var m = { '谷薯': '75 克', '豆类': '30 克', '蔬菜': '150 克', '果品': '150 克', '畜肉': '60 克', '禽蛋': '1 个', '水产': '60 克', '乳品': '200 毫升', '菌藻': '50 克', '坚果种子': '15 克', '调味': '少量', '药食同源': '适量' };
    return scaleAmount(m[f.cat] || '适量', factor);
  }
  function foodLine(f, factor) { return f.name + ' ' + amountOf(f, factor); }
  function recipeLine(r, factor) {
    return r.name + '：' + arr(r.ingredients).map(function (x) {
      return x.name + ' ' + scaleAmount(x.amount, factor);
    }).join('、');
  }
  function ingredientFood(name) {
    var f = FBYNAME[name];
    if (f) return f;
    var m = D.maps && D.maps[name];
    return m ? FBYNAME[m] : null;
  }
  function parseAmount(s) {
    var m = String(s == null ? '' : s).match(/^(\d+(?:\.\d+)?)\s*(\S.*)$/);
    return m ? { n: parseFloat(m[1]), unit: m[2] } : { n: null, unit: String(s == null ? '' : s) };
  }
  function mergeAmount(a, b) {
    var x = parseAmount(a), y = parseAmount(b);
    if (x.n != null && y.n != null) {
      if (x.unit === y.unit) return (Math.round((x.n + y.n) * 10) / 10) + ' ' + x.unit;
      return a + '、' + b;
    }
    if (x.n != null) return a;
    if (y.n != null) return b;
    return a === b ? a : a + '、' + b;
  }
  function buildPlanExtras(items, factor, sizeLabel) {
    var foodMap = {}, foods = [];
    var shopMap = {}, shopOrder = [];
    function addFood(f) {
      if (f && !foodMap[f.name]) { foodMap[f.name] = 1; foods.push(f); }
    }
    function addShop(name, amount, cat) {
      if (!shopMap[name]) {
        var f = FBYNAME[name] || ingredientFood(name);
        shopMap[name] = { name: name, cat: cat || (f ? f.cat : '其他'), amount: amount };
        shopOrder.push(name);
      } else {
        shopMap[name].amount = mergeAmount(shopMap[name].amount, amount);
      }
    }
    items.forEach(function (x) {
      if (x.kind === 'food') {
        addFood(x.f);
        addShop(x.f.name, amountOf(x.f, factor), x.f.cat);
      } else {
        arr(x.r.ingredients).forEach(function (y) {
          var f = FBYNAME[y.name] || ingredientFood(y.name);
          addFood(f);
          addShop(y.name, scaleAmount(y.amount, factor), f ? f.cat : '其他');
        });
      }
    });
    var byCat = {};
    shopOrder.forEach(function (n) {
      var it = shopMap[n];
      (byCat[it.cat] = byCat[it.cat] || []).push(it);
    });
    var catOrder = CATS.concat(['其他']).filter(function (c) { return byCat[c] && byCat[c].length; });
    var groups = catOrder.map(function (c) {
      byCat[c].sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); });
      return { cat: c, items: byCat[c] };
    });
    var text = ['食疗配膳购物清单：' + sizeLabel];
    groups.forEach(function (grp) {
      text.push(grp.cat);
      grp.items.forEach(function (it) { text.push(it.name + ' ' + it.amount); });
    });
    return { foods: foods, groups: groups, text: text.join('\n') };
  }
  function planCost(foods) {
    var counts = { '平价': 0, '中等': 0, '较高': 0 };
    foods.forEach(function (f) {
      var t = costOf(f);
      if (counts[t] != null) counts[t]++;
    });
    var total = counts['平价'] + counts['中等'] + counts['较高'];
    if (!total) return { tier: '未标', maxTier: '未标', counts: counts };
    var tier = '平价';
    COST_TIERS.forEach(function (t) { if (counts[t] >= counts[tier]) tier = t; });
    var maxTier = '平价';
    COST_TIERS.forEach(function (t) { if (counts[t] > 0) maxTier = t; });
    return { tier: tier, maxTier: maxTier, counts: counts };
  }
  function renderShopping(extras, sizeLabel) {
    var h = '<div class="sl-sub">购物清单</div>';
    h += '<div class="sl-aux">按' + esc(sizeLabel) + '汇总，同名食材已合并。只列食材与用量，不含功效。</div>';
    extras.groups.forEach(function (grp) {
      h += '<div class="sl-shop-cat">' + esc(grp.cat) + '</div>';
      grp.items.forEach(function (it) {
        h += '<div class="sl-row"><span class="sl-k">' + esc(it.name) + '</span><span class="sl-v">' + esc(it.amount) + '</span></div>';
      });
    });
    h += '<div class="sl-shop-copy"><button class="btn" type="button" onclick="SL.copyShopping()">复制清单</button>';
    h += '<span id="slShopMsg" class="sl-aux" role="status"></span></div>';
    return h;
  }
  function copyShopping() {
    var msg = $('slShopMsg');
    var text = LAST.shopText || '';
    function ok() { if (msg) msg.textContent = '已复制 ' + text.length + ' 字'; }
    function fail() { if (msg) msg.textContent = '复制失败，请手动选择清单文字'; }
    if (!text) { fail(); return; }
    if (typeof g.shareCopyText === 'function') {
      g.shareCopyText(text).then(ok, fail);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fail);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      document.body.removeChild(ta);
      done ? ok() : fail();
    }
  }

  function composePlan(ctx, limits, group, prev) {
    prev = prev || {};
    var prevCongee = prev.congee || '';
    var prevTea = prev.tea || '';
    var prevLunchCat = prev.lunchCat || '';
    var prevDinnerCat = prev.dinnerCat || '';
    var pool = FOODS.filter(function (f) {
      if (f.status !== '已核') return false;
      if (HERB_BAN[f.name]) return false;
      if (limitBan(f, limits)) return false;
      if (groupBan(f, group)) return false;
      return true;
    });
    pool.forEach(function (f) { f.__score = scoreOf(f, ctx); });
    var used = {};
    var gaps = [];
    var lunchCat = '';
    var dinnerCat = '';
    function take(cats, n, role) {
      var a = pick(pool, cats, used, n);
      if (!a.length) gaps.push(role);
      a.forEach(function (f) { used[f.name] = 1; });
      return a;
    }
    function takeProtein(cats, meal, role) {
      var best = null;
      cats.forEach(function (cat) {
        var list = pool.filter(function (f) { return f.cat === cat && !used[f.name]; });
        list.sort(function (a, b) { return (b.__score || 0) - (a.__score || 0); });
        if (!list.length) return;
        var s = list[0].__score || 0;
        if (meal === 'lunch' && cat === prevLunchCat) s -= 1.5;
        if (meal === 'dinner' && cat === prevDinnerCat) s -= 1.5;
        if (meal === 'dinner' && lunchCat && cat === lunchCat) s -= 2;
        if (!best || s > best.s) best = { f: list[0], s: s, cat: cat };
      });
      if (!best) { gaps.push(role); return []; }
      used[best.f.name] = 1;
      if (meal === 'lunch') lunchCat = best.cat; else dinnerCat = best.cat;
      return [best.f];
    }
    var breakfast = [];
    var br = RECIPES.filter(function (r) {
      if (r.status !== '已核' || r.cat !== '粥') return false;
      return arr(r.ingredients).every(function (x) {
        var f = ingredientFood(x.name);
        return f && f.status === '已核' && !HERB_BAN[f.name] && !limitBan(f, limits) && !groupBan(f, group);
      });
    }).sort(function (a, b) {
      var d = recipeScore(b, ctx) - recipeScore(a, ctx);
      return d || a.name.localeCompare(b.name, 'zh');
    });
    var congee = null;
    for (var i = 0; i < br.length; i++) {
      if (br[i].name !== prevCongee) { congee = br[i]; break; }
    }
    if (congee) {
      breakfast.push({ kind: 'recipe', r: congee });
      arr(congee.ingredients).forEach(function (x) { var f = ingredientFood(x.name); if (f) used[f.name] = 1; });
    } else {
      take(['谷薯'], 1, '早餐主食').forEach(function (f) { breakfast.push({ kind: 'food', f: f }); });
    }

    var lunch = [];
    take(['谷薯'], 1, '午餐主食').forEach(function (f) { lunch.push({ kind: 'food', f: f }); });
    takeProtein(['豆类', '畜肉', '禽蛋', '水产', '乳品'], 'lunch', '午餐蛋白').forEach(function (f) { lunch.push({ kind: 'food', f: f }); });
    take(['蔬菜', '菌藻'], 2, '午餐蔬菜').forEach(function (f) { lunch.push({ kind: 'food', f: f }); });

    var dinner = [];
    take(['谷薯'], 1, '晚餐主食').forEach(function (f) { dinner.push({ kind: 'food', f: f }); });
    takeProtein(['豆类', '水产', '禽蛋', '乳品', '畜肉'], 'dinner', '晚餐蛋白').forEach(function (f) { dinner.push({ kind: 'food', f: f }); });
    take(['蔬菜', '菌藻'], 2, '晚餐蔬菜').forEach(function (f) { dinner.push({ kind: 'food', f: f }); });

    var snack = [];
    take(['果品'], 1, '加餐水果').forEach(function (f) { snack.push({ kind: 'food', f: f }); });
    var teaList = RECIPES.filter(function (r) {
      if (r.status !== '已核' || r.cat !== '茶饮') return false;
      return arr(r.ingredients).every(function (x) {
        var f = ingredientFood(x.name);
        return f && f.status === '已核' && !HERB_BAN[f.name] && !limitBan(f, limits) && !groupBan(f, group);
      });
    }).sort(function (a, b) {
      var d = recipeScore(b, ctx) - recipeScore(a, ctx);
      return d || a.name.localeCompare(b.name, 'zh');
    });
    var tea = null;
    for (var j = 0; j < teaList.length; j++) {
      if (teaList[j].name !== prevTea) { tea = teaList[j]; break; }
    }
    if (tea) snack.push({ kind: 'recipe', r: tea });

    return {
      breakfast: breakfast,
      lunch: lunch,
      dinner: dinner,
      snack: snack,
      gaps: gaps,
      params: { congee: congee ? congee.name : '', tea: tea ? tea.name : '', lunchCat: lunchCat, dinnerCat: dinnerCat, usedNames: Object.keys(used) }
    };
  }

  function planMeal() {
    var province = val('slPlanProvince');
    var city = val('slPlanCity');
    var cid = val('slPlanConstitution');
    var sidRaw = val('slPlanSeason');
    var gid = val('slPlanGroup');
    var limits = checkedLimits();
    var limitNames = limits.map(function (id) { var l = limitOf(id); return l ? l.name : ''; }).filter(Boolean);
    var region = regionOf(province);
    var sid = seasonId(sidRaw);
    var season = seasonOf(sid);
    var constitution = constitutionOf(cid);
    var group = groupOf(gid);
    var ctx = { region: region, season: season, constitution: constitution, group: group, cityFoods: cityFoodsOf(city) };
    var size = val('slPlanSize') === '2' ? 2 : 1;
    var factor = size;
    var sizeLabel = factor === 2 ? '三至四人' : '一至二人';
    if (val('slPlanRange') === 'week') {
      planWeek(ctx, limits, group, size, sizeLabel);
      return;
    }
    var prev = LAST.mode === 'plan' ? (LAST.params || {}) : {};
    var plan = composePlan(ctx, limits, group, prev);
    var breakfast = plan.breakfast;
    var lunch = plan.lunch;
    var dinner = plan.dinner;
    var snack = plan.snack;
    var gaps = plan.gaps;
    var allItems = breakfast.concat(lunch, dinner, snack);
    var extras = buildPlanExtras(allItems, factor, sizeLabel);
    var pc = planCost(extras.foods);
    var used = {};
    plan.params.usedNames.forEach(function (n) { used[n] = 1; });
    LAST = {
      mode: 'plan',
      params: {
        province: province, city: city, constitution: cid, season: sidRaw, group: gid, limits: limits,
        size: String(size), range: 'day',
        congee: plan.params.congee, tea: plan.params.tea, lunchCat: plan.params.lunchCat, dinnerCat: plan.params.dinnerCat
      },
      shopText: extras.text
    };
    var h = '';
    if (gaps.length > 2) {
      h += empty('当前条件无解，可放宽饮食限制或换一个季节再试。');
      h += outMeta('未取到的角色：' + gaps.join('、') + '。');
      $('slOut').innerHTML = h;
      return;
    }
    h += outMeta('条件：' + (province || '全国通用') + (city ? ' ' + city : '') + '；体质 ' + (constitution ? constitution.name : '平和') + '；季节 ' + (SEASON_NAMES[sid] || sid) + '；人群 ' + (group ? group.name : '成人') + '；限制 ' + (limitNames.length ? limitNames.join('、') : '无') + '。');
    if (group && ['yunqi', 'buruqi', 'yingyouer', 'xuelingqian', 'ertongqingshaonian', 'laoren'].indexOf(group.id) >= 0) {
      h += '<div class="sl-alert">' + esc(group.name) + '的食养建议须结合年龄与身体状况，具体请遵医师或营养师指导。</div>';
    }
    var rows = [];
    function addMeal(name, items) {
      if (!items.length) return;
      var text = items.map(function (x) {
        return x.kind === 'recipe' ? recipeLine(x.r, factor) : foodLine(x.f, factor);
      }).join('、');
      var nature = items.map(function (x) {
        return x.kind === 'recipe' ? '方' : (x.f.nature || '');
      }).join('、');
      var role = items.map(function (x) {
        return x.kind === 'recipe' ? x.r.cat : x.f.cat;
      }).join('、');
      rows.push([esc(name), esc(text), esc(nature), esc(role)]);
    }
    addMeal('早餐', breakfast);
    addMeal('午餐', lunch);
    addMeal('晚餐', dinner);
    addMeal('加餐', snack);
    h += table(['餐次', '菜品与食材用量', '性味', '角色'], rows);
    h += '<div class="sl-sub">成本档位</div>';
    h += '<div class="sl-aux">本方案档位：' + esc(pc.tier === '未标' ? '未标' : pc.tier + '为主') + '；单味最高档 ' + esc(pc.maxTier) + '。档位为常用食材的相对档，不按报价，不含外食与调料价格。</div>';
    h += renderShopping(extras, sizeLabel);
    h += '<div class="sl-sub">地域适配</div>';
    h += '<div class="sl-aux">' + esc(region ? region.name + '：' + region.climate + '食养原则：' + region.principle : '未选地区，按全国通用。') + '</div>';
    var localUsed = [];
    var cityList = cityFoodsOf(city);
    if (region || cityList.length) {
      Object.keys(used).forEach(function (n) { if (has(arr(region && region.localFoods), n) || has(cityList, n)) localUsed.push(n); });
    }
    h += '<div class="sl-aux">本方案用到的地方食材：' + esc(localUsed.length ? localUsed.join('、') : '按当季常见食材搭配') + '。</div>';
    h += '<div class="sl-sub">忌口与替换</div>';
    h += '<div class="sl-aux">' + esc((limitNames.length ? '饮食限制：' + limitNames.join('、') + '。' : '') + (group ? '人群注意：' + arr(group.avoid).join('、') + '。' : '') + '同类食材可按性味相近替换，替换后仍须避开过敏原与禁忌。') + '</div>';
    h += '<div class="sl-sub">依据</div>';
    h += '<div class="sl-aux">食材性味归经与出处见食材卡；地区与季节见资料区；油、盐、添加糖按膳食指南控制。本方案是食养示例，不替代医师或营养师的诊疗意见。</div>';
    $('slOut').innerHTML = h;
  }

  function planWeek(ctx, limits, group, size, sizeLabel) {
    var province = val('slPlanProvince');
    var city = val('slPlanCity');
    var cid = val('slPlanConstitution');
    var sidRaw = val('slPlanSeason');
    var gid = val('slPlanGroup');
    var sid = seasonId(sidRaw);
    var constitution = constitutionOf(cid);
    var region = ctx.region;
    var limitNames = limits.map(function (id) { var l = limitOf(id); return l ? l.name : ''; }).filter(Boolean);
    var dayNames = ['一', '二', '三', '四', '五', '六', '七'];
    var prev = {};
    var days = [];
    var allItems = [];
    var usedNames = [];
    var rows = [];
    var unsolved = 0;
    function mealText(list) {
      return list.map(function (x) { return x.kind === 'recipe' ? recipeLine(x.r, size) : foodLine(x.f, size); }).join('、');
    }
    for (var d = 0; d < 7; d++) {
      var plan = composePlan(ctx, limits, group, prev);
      prev = plan.params;
      days.push({ congee: plan.params.congee, tea: plan.params.tea, lunchCat: plan.params.lunchCat, dinnerCat: plan.params.dinnerCat });
      plan.params.usedNames.forEach(function (n) { if (usedNames.indexOf(n) < 0) usedNames.push(n); });
      if (plan.gaps.length > 2) {
        unsolved++;
        rows.push([esc('第' + dayNames[d] + '日'), esc('无解'), '—', '—', '—']);
        continue;
      }
      allItems = allItems.concat(plan.breakfast, plan.lunch, plan.dinner, plan.snack);
      rows.push([esc('第' + dayNames[d] + '日'), esc(mealText(plan.breakfast)), esc(mealText(plan.lunch)), esc(mealText(plan.dinner)), esc(mealText(plan.snack))]);
    }
    LAST = {
      mode: 'week',
      params: { province: province, city: city, constitution: cid, season: sidRaw, group: gid, limits: limits, size: String(size), range: 'week', days: days },
      shopText: ''
    };
    var h = '';
    if (unsolved === 7) {
      h += empty('当前条件无解，可放宽饮食限制或换一个季节再试。');
      $('slOut').innerHTML = h;
      return;
    }
    var extras = buildPlanExtras(allItems, size, sizeLabel);
    var pc = planCost(extras.foods);
    LAST.shopText = extras.text;
    h += outMeta('条件：' + (province || '全国通用') + (city ? ' ' + city : '') + '；体质 ' + (constitution ? constitution.name : '平和') + '；季节 ' + (SEASON_NAMES[sid] || sid) + '；人群 ' + (group ? group.name : '成人') + '；限制 ' + (limitNames.length ? limitNames.join('、') : '无') + '；范围 七日；份量 ' + sizeLabel + '。');
    if (group && ['yunqi', 'buruqi', 'yingyouer', 'xuelingqian', 'ertongqingshaonian', 'laoren'].indexOf(group.id) >= 0) {
      h += '<div class="sl-alert">' + esc(group.name) + '的食养建议须结合年龄与身体状况，具体请遵医师或营养师指导。</div>';
    }
    h += table(['日次', '早餐', '午餐', '晚餐', '加餐'], rows);
    h += '<div class="sl-sub">成本档位</div>';
    h += '<div class="sl-aux">本方案档位：' + esc(pc.tier === '未标' ? '未标' : pc.tier + '为主') + '；单味最高档 ' + esc(pc.maxTier) + '。档位为常用食材的相对档，不按报价，不含外食与调料价格。</div>';
    h += renderShopping(extras, sizeLabel);
    h += '<div class="sl-sub">地域适配</div>';
    h += '<div class="sl-aux">' + esc(region ? region.name + '：' + region.climate + '食养原则：' + region.principle : '未选地区，按全国通用。') + '</div>';
    var localUsed = [];
    var cityList = cityFoodsOf(city);
    if (region || cityList.length) {
      usedNames.forEach(function (n) { if (has(arr(region && region.localFoods), n) || has(cityList, n)) localUsed.push(n); });
    }
    h += '<div class="sl-aux">本方案用到的地方食材：' + esc(localUsed.length ? localUsed.join('、') : '按当季常见食材搭配') + '。</div>';
    h += '<div class="sl-sub">忌口与替换</div>';
    h += '<div class="sl-aux">' + esc((limitNames.length ? '饮食限制：' + limitNames.join('、') + '。' : '') + (group ? '人群注意：' + arr(group.avoid).join('、') + '。' : '') + '同类食材可按性味相近替换，替换后仍须避开过敏原与禁忌。') + '</div>';
    h += '<div class="sl-sub">依据</div>';
    h += '<div class="sl-aux">食材性味归经与出处见食材卡；地区与季节见资料区；油、盐、添加糖按膳食指南控制。本方案是食养示例，不替代医师或营养师的诊疗意见。</div>';
    $('slOut').innerHTML = h;
  }

  function renderMod(name) {
    var map = {
      foods: ['slFoodsBody', renderFoodTable],
      recipes: ['slRecipesBody', renderRecipeTable],
      yaoshi: ['slYaoshiBody', renderYaoshiTable],
      flavor: ['slFlavorBody', renderFlavorTable],
      constitution: ['slConstBody', renderConstitutionTable],
      season: ['slSeasonBody', renderSeasonTable],
      region: ['slRegionBody', renderRegionTable],
      group: ['slGroupBody', renderGroupTable],
      balance: ['slBalanceBody', renderBalanceTable],
      cook: ['slCookBody', renderCookTable],
      hazard: ['slHazardBody', renderHazardTable],
      origin: ['slOriginBody', renderOriginTable],
      taboo: ['slTabooBody', renderTabooTable],
      books: ['slBooksBody', renderBookTable],
      note: ['slNoteBody', renderNote]
    };
    var m = map[name];
    if (!m) return;
    var host = $(m[0]);
    if (!host || host.getAttribute('data-rendered') === '1') return;
    host.innerHTML = m[1]();
    host.setAttribute('data-rendered', '1');
  }

  function renderFoodTable() {
    var rows = FOODS.slice().sort(function (a, b) {
      var d = CATS.indexOf(a.cat) - CATS.indexOf(b.cat);
      return d || a.name.localeCompare(b.name, 'zh');
    }).map(function (f) {
      return [esc(f.name), esc(f.cat), esc(natureText(f)), esc(meridianText(f)), esc(fmt(f.effect)), esc(yaoshiLabel(f)), esc(costOf(f)), esc(f.originMain || '未载'), esc(sourceOf(f))];
    });
    return table(['食材', '分类', '性味', '归经', '食养方向', '药食同源', '成本档', '主产区', '出处'], rows, 'wide');
  }
  function renderRecipeTable() {
    var rows = RECIPES.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); }).map(function (r) {
      return [esc(r.name), esc(r.cat), esc(arr(r.ingredients).map(function (x) { return x.name; }).join('、')), esc(fmt(r.effect)), esc(r.suitable || '未载'), esc(sourceOf(r))];
    });
    return table(['食疗方', '类别', '组成', '食养方向', '适宜', '出处'], rows);
  }
  function renderYaoshiTable() {
    var rows = YAOSHI.map(function (y) {
      return ['<span class="sl-nowrap">' + esc(y.name) + '</span>', '<span class="sl-nowrap">' + esc(y.status) + '</span>', esc(y.note || '')];
    });
    return table(['名称', '状态', '备注'], rows, 'sl-wrap');
  }
  function renderFlavorTable() {
    var h = table(['五味', '所入', '所喜', '所伤'], FLAVORS.map(function (x) { return [esc(x.flavor), esc(x.organ), esc(x.like), esc(x.harm)]; }));
    h += table(['五性', '作用', '备注'], NATURES.map(function (x) { return [esc(x.nature), esc(x.effect), esc(x.note || '')]; }));
    return h;
  }
  function renderConstitutionTable() {
    var rows = CONST.map(function (c) { return [esc(c.name), esc(c.traits), esc(c.principle), esc(fmt(c.eat)), esc(fmt(c.avoid)), esc(c.source)]; });
    return table(['体质', '特征', '食养原则', '宜食', '少食', '出处'], rows);
  }
  function renderSeasonTable() {
    var rows = SEASONS.map(function (s) { return [esc(s.name), esc(s.period || ''), esc(s.principle), esc(fmt(s.eat)), esc(fmt(s.avoid)), esc(s.note || ''), esc(s.source)]; });
    return table(['季节', '节气区间', '食养原则', '宜食', '少食', '备注', '出处'], rows);
  }
  function renderRegionTable() {
    var rows = REGIONS.map(function (r) { return [esc(r.name), esc(fmt(r.provinces)), esc(r.climate), esc(r.principle), esc(fmt(r.localFoods)), esc(r.notes || '')]; });
    return '<p class="sub-note">地域食养取《素问·异法方宜论》五方古法与气候物产通行说，分区是查询分区，不是医学分区。</p>' + table(['地区', '省级单位', '气候与饮食特点', '食养原则', '地方食材', '备注'], rows);
  }
  function renderGroupTable() {
    var h = table(['人群', '年龄', '食养要点', '宜', '忌', '用量提示'], GROUPS.map(function (g) { return [esc(g.name), esc(g.age || ''), esc(g.principle), esc(fmt(g.eat)), esc(fmt(g.avoid)), esc(g.amount || '')]; }));
    h += table(['饮食限制', '限用', '可替', '注意'], LIMITS.map(function (l) { return [esc(l.name), esc(fmt(l.avoid)), esc(fmt(l.replace)), esc(l.note || '')]; }));
    h += table(['食物', '药物', '影响', '建议'], INTER.map(function (x) { return [esc(x.food), esc(x.drug), esc(x.effect), esc(x.advice)]; }));
    return h;
  }
  function renderBalanceTable() {
    return table(['类别', '成人每日参考量', '说明'], BALANCE.map(function (b) { return [esc(b.cat), esc(b.amount), esc(b.note || '')]; }));
  }
  function renderCookTable() {
    var rows = [
      ['烹调', '蒸、煮、炖、焖、凉拌、少油炒为主，少煎炸烤。'],
      ['淘洗', '淘米一至二次，不搓洗；蔬菜先洗后切，急火快炒。'],
      ['焯水', '菠菜、竹笋、蕨菜一类先焯水；豆类彻底煮熟。'],
      ['豆浆', '生豆浆煮沸后再小火五分钟。'],
      ['剩菜', '两小时内冷藏，二十四小时内吃完，复热不超过一次。'],
      ['用量', '一汤匙约十五毫升，一茶匙约五毫升，一碗米饭约一百五十克。'],
      ['油盐糖', '油二十五至三十克，盐少于五克，添加糖少于二十五克。']
    ];
    var h = table(['项目', '要点'], rows);
    h += '<div class="sl-sub">手量对照</div>';
    h += '<div class="sl-aux">手量为估量法，不替代秤量。成人每日参考量见膳食结构；儿童、老人按人群用量提示增减。</div>';
    h += table(['手量', '大致分量', '对应每日参考', '说明'], [
      ['一拳头主食', '熟米饭约 100 至 150 克，折合生米 50 至 75 克；馒头约 80 克；熟面条约 150 克', '谷类 200 至 300 克，薯类 50 至 100 克', '每餐一拳头，每日二至三拳头；全谷物与杂豆占一部分。'],
      ['一掌蛋白', '畜禽瘦肉、鱼虾约 50 至 75 克，生重；豆腐约 100 克；鸡蛋 1 个约 50 克', '畜禽肉 40 至 75 克，水产 40 至 75 克，蛋 40 至 50 克', '一掌指不含手指、厚度约一指；每日一至两掌，蛋奶豆轮换。'],
      ['两手蔬菜', '生叶菜约 100 至 150 克；切块蔬菜约 150 至 200 克', '蔬菜 300 至 500 克', '双手捧起为一份，每日三至五份，深色蔬菜占一半。']
    ]);
    return h;
  }
  function renderHazardTable() {
    return table(['风险', '风险物', '处理要点', '涉及人群'], HAZARDS.map(function (h) { return [esc(h.name), esc(h.hazard), esc(h.handling), esc(fmt(h.groups))]; }));
  }
  function renderOriginTable() {
    var list = FOODS.slice().sort(function (a, b) {
      var d = (b.originGeo ? 1 : 0) - (a.originGeo ? 1 : 0);
      return d || a.name.localeCompare(b.name, 'zh');
    }).slice(0, 80);
    return table(['食材', '主产区', '传统产区或地理标志', '产地差异与选购'], list.map(function (f) { return [esc(f.name), esc(f.originMain || '未载'), esc(f.originGeo || '未载'), esc(f.originNote || '按需少量购买，防霉防虫')]; }));
  }
  function renderTabooTable() {
    var h = '<p class="sub-note">本站不列民间食物相克表。只列典籍明载、药典标注、人群禁忌与药物相互作用四类。发物无统一现代定义，按个人过敏与医嘱处理；以形补形不作食养依据；药酒属药，不是普通食品；药食同源目录内物质不等同于保健食品。</p>';
    h += table(['食物', '药物', '影响', '建议'], INTER.map(function (x) { return [esc(x.food), esc(x.drug), esc(x.effect), esc(x.advice)]; }));
    return h;
  }
  function renderBookTable() {
    return table(['书名', '作者', '时代', '评级', '用途'], BOOKS.map(function (b) { return [esc(b.name), esc(b.author || ''), esc(b.era || ''), esc(b.grade || ''), esc(b.use || '')]; }));
  }
  function renderNote() {
    return '<p class="sub-note">性味归经以《中华本草》《中国药典》2020 年版一部为主，食疗方以《饮膳正要》《食疗本草》《随息居饮食谱》等谱录为主。古方原量照录，今用参考量另列；待核条目不进配膳。药食同源按现行目录，目录外药材不作食用推荐。本页为传统食养与食材查询，不构成诊疗建议。</p>';
  }

  function aiContext() {
    var s = '页面：食疗\n';
    if (LAST.mode === 'foods') s += '查询：食材 ' + (LAST.params.kw || '全部') + '\n';
    else if (LAST.mode === 'recipes') s += '查询：食疗方 ' + (LAST.params.kw || '全部') + '\n';
    else if (LAST.mode === 'seasonal') s += '查询：当令食材 ' + (LAST.params.province || '全国') + (LAST.params.city ? ' ' + LAST.params.city : '') + '\n';
    else if (LAST.mode === 'plan') s += '查询：配膳 ' + (LAST.params.province || '全国') + (LAST.params.city ? ' ' + LAST.params.city : '') + '\n';
    else if (LAST.mode === 'week') s += '查询：配膳 七日 ' + (LAST.params.province || '全国') + (LAST.params.city ? ' ' + LAST.params.city : '') + '\n';
    var out = $('slOut');
    s += '结果摘要：' + (out ? String(out.innerText || '').slice(0, 3000) : '');
    return s;
  }
  function shareCollect() { return { mode: LAST.mode, params: LAST.params }; }
  function shareRestore(d) {
    d = d || {};
    var p = d.params || {};
    var map = {
      slFoodKw: p.kw, slFoodCat: p.cat, slFoodNature: p.nature, slFoodMer: p.mer, slFoodYaoshi: p.ys,
      slRecipeKw: p.kw, slRecipeCat: p.cat, slRecipeEffect: p.eff,
      slSeasonProvince: p.province, slSeasonSeason: p.season,
      slPlanProvince: p.province, slPlanConstitution: p.constitution, slPlanSeason: p.season,
      slPlanGroup: p.group, slPlanSize: p.size, slPlanRange: p.range
    };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (el && map[id] != null) el.value = map[id];
    });
    initCities();
    if (p.city) {
      ['slSeasonCity', 'slPlanCity'].forEach(function (id) {
        var el = $(id);
        if (el && Array.prototype.some.call(el.options, function (o) { return o.value === p.city; })) el.value = p.city;
      });
    }
    var box = $('slPlanLimitBox');
    if (box) {
      var sel = p.limits || (p.limit ? [p.limit] : []);
      Array.prototype.slice.call(box.querySelectorAll('input[type=checkbox]')).forEach(function (x) {
        x.checked = sel.indexOf(x.value) >= 0;
      });
      syncLimitSum();
    }
    LAST = { mode: d.mode || '', params: p };
  }
  function recast() {
    if (LAST.mode === 'foods') searchFoods();
    else if (LAST.mode === 'recipes') searchRecipes();
    else if (LAST.mode === 'seasonal') searchSeasonal();
    else if (LAST.mode === 'plan') planMeal();
    else if (LAST.mode === 'week') planMeal();
  }

  function mountAI() {
    initCities();
    if (g.mountAI) {
      g.mountAI(aiContext, '食疗', {
        share: { page: 'shiliao', result: '#slOut', collect: shareCollect, restore: shareRestore, recast: recast }
      });
    }
  }

  g.SL = {
    mountAI: mountAI,
    searchFoods: searchFoods,
    searchRecipes: searchRecipes,
    searchSeasonal: searchSeasonal,
    planMeal: planMeal,
    planWeek: planWeek,
    copyShopping: copyShopping,
    syncCities: syncCities,
    syncLimitSum: syncLimitSum,
    renderMod: renderMod
  };
})(window);
