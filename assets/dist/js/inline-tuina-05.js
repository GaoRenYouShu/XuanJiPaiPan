/* 推拿按跷页脚本：读输入区选择，从 TN 与 JL 取终值渲染结果与四个资料模块。
   只做交互与渲染，不重画首屏；展示值一律取数据对象，不解析自生成文案。 */
(function () {
  'use strict';
  var TN = window.TN || {}, JL = window.JL || {};
  var $ = function (id) { return document.getElementById(id); };

  var PT = {};
  (JL.POINTS || []).forEach(function (p) { PT[p.name] = p; });
  var M = {};
  (TN.METHODS || []).forEach(function (m) { M[m.id] = m; });
  function merOf(p) {
    for (var i = 0; i < (JL.MERIDIANS || []).length; i++) {
      if (JL.MERIDIANS[i].id === p.meridian) return JL.MERIDIANS[i];
    }
    return null;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pick(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }
  function tbl(head, rows, cls) {
    var h = '<div class="tbl-hs"><table class="tn-tbl' + (cls ? ' ' + cls : '') + '"><thead><tr>';
    head.forEach(function (x) { h += '<th scope="col">' + esc(x) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>';
      r.forEach(function (c) { h += '<td>' + c + '</td>'; });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* 取穴集：部位与症状两路并集，经脉一路取该经在本页有取法的穴 */
  function collectPoints(region, sym, mer) {
    var out = [], seen = {};
    function add(n) { if (n && !seen[n] && PT[n]) { seen[n] = 1; out.push(n); } }
    if (region) region.points.forEach(add);
    if (sym) sym.points.forEach(add);
    if (mer) {
      (TN.POINT_OPS || []).forEach(function (o) {
        var p = PT[o.point];
        if (p && p.meridian === mer.id) add(o.point);
      });
    }
    if (!out.length) {
      var all = pick(TN.REGIONS || [], 'quanshen');
      if (all) all.points.forEach(add);
    }
    return out.slice(0, 12);
  }

  function opOf(name) {
    for (var i = 0; i < (TN.POINT_OPS || []).length; i++) {
      if (TN.POINT_OPS[i].point === name) return TN.POINT_OPS[i];
    }
    return null;
  }

  /* 禁忌：按部位、症状与力度现算命中项，不出全表 */
  function limitsFor(region, sym, forceId) {
    var ids = {};
    if (region && (region.id === 'yaodi' || region.id === 'xiongfu' || region.id === 'quanshen')) {
      ids.preg = 1; ids.period = 1; ids.meal = 1;
    }
    if (sym && /jingqian|fuzhang|bianmi/.test(sym.id)) { ids.preg = 1; ids.period = 1; ids.meal = 1; }
    if (forceId === 'heavy') { ids.osteo = 1; ids.bleed = 1; }
    if (sym && sym.id === 'yundongsuan') { ids.trauma = 1; }
    if (sym && (sym.id === 'tuichen' || sym.id === 'xiaotuizhang')) { ids.thrombus = 1; }
    var out = (TN.LIMITS || []).filter(function (x) { return ids[x.id]; });
    if (!out.length) {
      /* 未命中特定情形时只回三条对所有人成立的，不拿孕期、经期、骨质疏松这类有条件项凑数。 */
      out = (TN.LIMITS || []).filter(function (x) {
        return x.id === 'preg' || x.id === 'meal' || x.id === 'drunk';
      });
    }
    return out.slice(0, 5);
  }

  function run() {
    var region = pick(TN.REGIONS || [], $('tnPart').value);
    var sym = pick(TN.SYMPTOMS || [], $('tnSx').value);
    var merId = $('tnMer').value;
    var mer = null;
    for (var i = 0; i < (JL.MERIDIANS || []).length; i++) {
      if (JL.MERIDIANS[i].id === merId) { mer = JL.MERIDIANS[i]; break; }
    }
    var forceId = $('tnForce').value;
    var force = pick(TN.FORCES || [], forceId);
    var media = pick(TN.MEDIA || [], $('tnMedia').value);

    var head = [];
    if (region) head.push('部位 ' + region.name);
    if (sym) head.push('症状 ' + sym.name);
    if (mer) head.push('经脉 ' + mer.name);
    head.push('力度 ' + (force ? force.name : '中'));
    if (media) head.push('介质 ' + media.name);

    var h = '<div class="tn-card"><div class="tn-head">' + esc(head.join('，')) + '</div></div>';

    var names = collectPoints(region, sym, mer);
    if (names.length) {
      var fxRows = names.map(function (n) {
        var p = PT[n], mm = merOf(p);
        return [esc(n) + '（' + esc(p.code) + '）', esc(mm ? mm.short : ''), esc(p.fx || ''), esc(p.zz || '')];
      });
      h += '<div class="tn-card"><h3 class="tn-sec">穴位功效与主治</h3>'
        + tbl(['穴名与代码', '归经', '功效', '主治'], fxRows, 'tn-tbl-4')
        + '<div class="tn-note">功效与主治取经穴资料，按本页所取诸穴逐条列出；各穴的推拿取法见下表。</div></div>';
      var rows = names.map(function (n) {
        var p = PT[n], o = opOf(n);
        var m = o ? M[o.m] : null;
        var loc = esc(p.loc) + (p.method ? '；' + esc(p.method) : '');
        var op = (m ? esc(m.name) : '按揉') + (o ? '，' + esc(o.dir) : '') + (o ? '，力度 ' + esc(o.force) : '');
        var dur = o ? esc(o.dur) : (m ? esc(m.dur) : '');
        if (o && o.avoid) dur += '；忌 ' + esc(o.avoid);
        return [esc(n) + '（' + esc(p.code) + '）', loc, op, dur];
      });
      h += '<div class="tn-card"><h3 class="tn-sec">取穴与手法</h3>'
        + tbl(['穴名与代码', '定位与取穴', '手法与力度', '时长与次数'], rows, 'tn-tbl-4')
        + '<div class="tn-note">定位取经穴国标，手法与力度按本页手法表；力度档随所选档取，酸痛明显时减档。</div></div>';
    }

    if (mer) {
      var route = mer.xingFull || mer.xing || '';
      var shi = mer.shichen ? (mer.shichen + '时 ' + mer.range) : '不拘时辰';
      h += '<div class="tn-card"><h3 class="tn-sec">经脉循行与病候</h3>'
        + tbl(['经脉与当令', '循行', '病候'],
          [[esc(mer.name) + '；当令 ' + esc(shi), esc(route), esc(mer.binghou || '')]], 'tn-tbl-3')
        + '<div class="tn-note">病候出《灵枢》经脉与《奇经八脉考》节述，即本经主治所系；循经推法自起点沿经单向推，每条线五至十遍，逢穴加揉按；当令时辰只作参考，不作取穴依据。</div></div>';
    }

    var lim = limitsFor(region, sym, forceId);
    if (lim.length) {
      h += '<div class="tn-card"><h3 class="tn-sec">本方案禁忌</h3>'
        + tbl(['情形', '不宜', '替代'], lim.map(function (x) {
          return [esc(x.name), esc(x.avoid), esc(x.alt)];
        }))
        + '</div>';
    }

    if (media) {
      h += '<div class="tn-card"><h3 class="tn-sec">介质</h3><div class="tn-note">'
        + esc(media.name) + '：' + esc(media.use) + '。' + esc(media.note) + '</div>';
      if (media.link) {
        h += '<div class="tn-note"><a href="' + esc(media.link) + '">配方与浓度见精油芳疗页</a></div>';
      }
      h += '</div>';
    }

    h += '<div class="tn-card"><div class="tn-note">本页只作取穴、功效与手法的查法说明，不作诊疗，不替代就医；手法出现疼痛加重、麻木或头晕即停。</div></div>';

    $('tnOut').innerHTML = h;
  }

  var done = {};
  function renderMod(which) {
    if (done[which]) return;
    done[which] = 1;
    if (which === 'methods') {
      $('tnMethodsBody').innerHTML = tbl(['手法', '着力与方向', '力度与时长', '适用与禁忌'],
        (TN.METHODS || []).map(function (m) {
          return [esc(m.name) + '（' + esc(m.alias) + '）', esc(m.part) + '；' + esc(m.dir),
            esc(m.force) + '；' + esc(m.dur), esc(m.useOn) + '；忌 ' + esc(m.avoid)];
        }), 'tn-tbl-4');
    } else if (which === 'region') {
      $('tnRegionBody').innerHTML = tbl(['部位', '常用手法', '常用穴', '参考时长'],
        (TN.REGIONS || []).map(function (r) {
          var ms = (r.methods || []).map(function (id) { return M[id] ? M[id].name : id; }).join('、');
          return [esc(r.name), esc(ms), esc((r.points || []).join('、')), esc(r.dur)];
        }), 'tn-tbl-4') + '<div class="tn-note">部位手法为先手与主手，实际操作按个体反应加减。</div>';
    } else if (which === 'kids') {
      /* 小儿推拿只作体系介绍：不列穴位位置、不列操作次数、不作诊疗；点开才渲染，与其余四模块同款。 */
      $('tnKidsBody').innerHTML =
        '<div class="tn-note">小儿推拿另是一系。本节只作体系介绍，不列穴位位置、不列操作次数、不作诊疗，也不替代专业培训。</div>'
        + '<h3 class="tn-sec">与成人推拿之别</h3>'
        + tbl(['项', '成人推拿', '小儿推拿'], [
          [esc('穴位体系'), esc('十四经三百六十一穴加经外奇穴，按寸定位'), esc('多用小儿特定穴，集中于掌面、掌背与前臂，另有头面、胸腹、腰背、下肢诸穴')],
          [esc('计量单位'), esc('按穴计，出时长与频次'), esc('按操作次数计，古法逐症列配穴与次数')],
          [esc('手法与力度'), esc('按、揉、推、拿等十六法，分轻中重三档'), esc('以推、揉、运、掐、捏为主，辨补泄；手法轻快柔和，平稳着实')],
          [esc('适用年龄'), esc('成人'), esc('以六岁以下为主，三岁以下为宜')],
          [esc('介质'), esc('干推、滑石粉、葱姜水、按摩油、清水、药酒'), esc('多用滑石粉、爽身粉一类吸湿介质')],
          [esc('操作次序'), esc('按部位分次操作，次序随取穴定'), esc('先头面、次上肢、再胸腹腰背、最后下肢')]
        ])
        + '<h3 class="tn-sec">源流与专著</h3>'
        + tbl(['书', '作者与版本', '要旨与本站取法'], [
          [esc('小儿推拿秘诀'), esc('明周于蕃撰，万历三十三年首刊，康熙二十四年翻刻；未分卷，三十余节'), esc('看面色、察指纹三关，阳掌诀法与阴掌穴法，身中十二拿法，诸惊症候逐条列配穴与次数。取穴位体系与按次数计之据')],
          [esc('幼科推拿秘书'), esc('清骆如龙撰，五卷'), esc('卷二穴象手法列全身穴道与五指，卷三推拿手法含十三大手法，卷四按病症分类。取手法分类之据')],
          [esc('推拿广意'), esc('清熊应雄辑，陈世凯重订，三卷；日本国立国会图书馆与美国 HathiTrust 均有著录，书格存清道光十二年重刊本书影'), esc('据著录列书名、作者与卷数，未得全文者不作手法依据')],
          [esc('小儿推拿秘旨'), esc('明龚廷贤撰，通行著录；暂无开放读本'), esc('存目，只列书名，不作依据')],
          [esc('小儿按摩经'), esc('旧题明四明陈氏，一名保婴神术，通行著录；暂无开放读本'), esc('存目，只列书名，不作依据')]
        ])
        + '<h3 class="tn-sec">一般原则</h3>'
        + '<div class="tn-note">穴位与按次数计之据取小儿推拿秘诀与幼科推拿秘书；手法力度、适用年龄、介质与操作次序按推拿学通行本录入。古籍另有养护之说，即要得小儿安、多受饥与寒，指节乳食、避风寒、病后调养，属养育之说，不是推拿手法。</div>'
        + '<h3 class="tn-sec">何时停手就医</h3>'
        + '<div class="tn-note">发热、皮疹或皮肤破损、外伤与骨折、囟门未闭处、传染病、精神萎靡或抽搐，先就医，不作推拿。本条为本站边界，不据古籍。</div>';
    } else if (which === 'limits') {
      $('tnLimitsBody').innerHTML = tbl(['情形', '不宜', '替代'],
        (TN.LIMITS || []).map(function (x) { return [esc(x.name), esc(x.avoid), esc(x.alt)]; }))
        + '<div class="tn-note">表列情形先停手，必要时就医；孕妇与儿童另按专门口径。</div>';
    } else if (which === 'books') {
      $('tnBooksBody').innerHTML = tbl(['书', '卷次与要旨', '本站取法'],
        (TN.BOOKS || []).map(function (b) {
          return [esc(b.book) + '（' + esc(b.grade) + '）', esc(b.part), esc(b.take)];
        })) + '<div class="tn-note">甲为可直接引用，乙宜对照异文，丙只作旁证；现代教材与国标单列。</div>';
    }
  }

  function getContext() {
    var region = pick(TN.REGIONS || [], $('tnPart').value);
    var sym = pick(TN.SYMPTOMS || [], $('tnSx').value);
    var mer = null, merId = $('tnMer').value;
    for (var i = 0; i < (JL.MERIDIANS || []).length; i++) {
      if (JL.MERIDIANS[i].id === merId) { mer = JL.MERIDIANS[i]; break; }
    }
    var out = [];
    if (region) out.push('部位 ' + region.name);
    if (sym) out.push('症状 ' + sym.name);
    if (mer) out.push('经脉 ' + mer.name);
    out.push('力度 ' + $('tnForce').value);
    out.push('介质 ' + $('tnMedia').value);
    var names = collectPoints(region, sym, mer);
    return '推拿按跷：' + out.join('，') + '；取穴 ' + names.join('、');
  }

  function init() {
    window.TNUI = { run: run, renderMod: renderMod };
    if (typeof window.mountAI === 'function') {
      try { window.mountAI(getContext, '推拿按跷'); } catch (e) { /* 面板挂载失败不影响主流程 */ }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
