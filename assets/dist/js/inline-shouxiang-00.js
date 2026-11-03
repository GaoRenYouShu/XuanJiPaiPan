


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    (function(){
    'use strict';
    function $(id){ return document.getElementById(id); }
    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    var SHOU = window.XS_SHOU;

    function sxToggleMod(id){ var el = $(id); if (el) el.classList.toggle('collapsed'); saveSxModState(); }
    window.sxToggleMod = sxToggleMod;

    /* 折叠状态持久化：localStorage 为主、sessionStorage 兜底，以已存为底 */
    var SX_MOD_KEY = 'sxModState';
    var sxModNavReady = false;
        function saveSxModState(){ xjSaveModCollapsed(SX_MOD_KEY, function(){ return sxModNavReady; }, '.mod[id]'); }
    function applySxModState(){ xjApplyModCollapsed(SX_MOD_KEY, '.mod[id]'); }

    function qtabWrap(inner){ return '<div class="qtab-scroll"><table class="qtab">' + inner + '</table></div>'; }
    function sign(n){ return n > 0 ? '+' + n : String(n); }
    /* 档位阈值：满分十四分，七分及以上为吉档，负三分及以下为需留意档，余为平档 */
    function bandOf(n){ return n >= 7 ? '吉档' : (n <= -3 ? '需留意档' : '平档'); }

    /* 模块一：手相三大主线（经文出处统一在此注明，不逐条重复） */
    function renderHand(){
      var h = '<div class="info-box"><h4>三才纹总诀</h4><p>' + esc(SHOU.jing) + '</p></div>';
      h += '<p class="sx-note">总诀与三条经文节录' + esc(SHOU.jingSrc) + '，见《古今图书集成》艺术典卷640，止于三纹莹净句；坊本题作《麻衣相法·论掌纹》；走向与变体断语为通行归纳。</p>';
      var t = '<thead><tr><th>主线</th><th>别名</th><th>走向</th><th>经文</th><th>常见变体通行断语</th></tr></thead><tbody>';
      var ls = SHOU.lines;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], vs = [];
        for (var j = 0; j < L.variants.length; j++){ if (L.variants[j].neutral) continue; vs.push(esc(L.variants[j].k) + '：' + esc(L.variants[j].duan)); }
        t += '<tr><td class="lbl">' + esc(L.name) + '</td><td>' + esc(L.alias) + '</td><td>' + esc(L.loc) + '</td><td>' + esc(L.jing) + '</td><td>' + vs.join('；') + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHandBody').innerHTML = h;
    }

    /* 模块二：手相九宫八丘（宫位取通行掌相说、丘名为中西对照称谓，口径统一注明，不逐条重复） */
    function renderGong(){
      var h = '<p class="sx-note">掌心八卦之分见于《玉掌记》（《古今图书集成》艺术典卷640）先看八卦、次察五行；九宫逐位布掌为通行掌相说，古籍未见逐位排列；九宫与西洋掌丘的逐一对应未见古籍，各本不一，本页只作合参对照；断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>宫位</th><th>方位</th><th>所对掌丘或部位</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var gs = SHOU.gong;
      for (var i = 0; i < gs.length; i++){
        var g = gs[i];
        t += '<tr data-key="' + esc(g.key) + '"><td class="lbl">' + esc(g.gong) + '</td><td>' + esc(g.fang) + '</td><td>' + esc(g.qiu) + '</td><td>' + esc(g.zhu.replace(/^主/, '')) + '</td><td>' + esc(g.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<p class="sx-note">图版名目录自《手相学》第十二、十三图原件标注：有通行释义者取通行释义，其余存原件名目、释义未详；火星野为掌中火星平原，与第一、第二火星丘非一名。</p>';
      var t2 = '<thead><tr><th>图版名目</th><th>释义</th></tr></thead><tbody>';
      var pn = SHOU.plateNames;
      for (var j = 0; j < pn.length; j++){
        t2 += '<tr><td class="lbl">' + esc(pn[j].name) + '</td><td>' + esc(pn[j].def) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxGongBody').innerHTML = h;
    }

    function renderHills(){
      var h = '<p class="sx-note">八丘名目为通行坊本中西对照称谓，古籍无载；位置与所主依掌纹分区通行说，丰隆断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>丘名</th><th>位置</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var hs = SHOU.hills;
      for (var i = 0; i < hs.length; i++){
        var q = hs[i];
        t += '<tr data-key="' + esc(q.key) + '"><td class="lbl">' + esc(q.name) + '</td><td>' + esc(q.loc) + '</td><td>' + esc(q.zhu.replace(/^主/, '')) + '</td><td>' + esc(q.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHillBody').innerHTML = h;
    }

    /* 模块三：辅助线纹与标记（通行之说，统一注明一次） */
    function renderAux(){
      var h = '<p class="sx-note">辅助线纹与特殊标记为通行坊本中西合参称谓，古籍无载；名目、走向与断语均为通行归纳，不作典籍条文；健康线起止与凯罗原书方向相反，本页从坊本图。</p>';
      var t = '<thead><tr><th>线名</th><th>走向</th><th>主事</th><th>通行断语</th></tr></thead><tbody>';
      var as = SHOU.aux;
      for (var i = 0; i < as.length; i++){
        var a = as[i];
        t += '<tr><td class="lbl">' + esc(a.name) + '</td><td>' + esc(a.loc) + '</td><td>' + esc(a.zhu) + '</td><td>' + esc(a.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>标记</th><th>形状</th><th>常见位置</th><th>通行断语</th></tr></thead><tbody>';
      var ms = SHOU.marks;
      for (var j = 0; j < ms.length; j++){
        var m = ms[j];
        t2 += '<tr><td class="lbl">' + esc(m.name) + '</td><td>' + esc(m.shape) + '</td><td>' + esc(m.loc) + '</td><td>' + esc(m.duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxAuxBody').innerHTML = h;
    }

    /* 模块一：掌形与掌色（掌形七类为通行坊本中西合参称谓，古籍无载；掌色配属出医相通说，统一注明一次） */
    function renderZhi(){
      var h = '<p class="sx-note">掌形七类为通行坊本中西合参称谓，古籍无载；形态与断语均为通行归纳，不作典籍条文。</p>';
      var t = '<thead><tr><th>掌形</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var ps = SHOU.palms;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        t += '<tr><td class="lbl">' + esc(p.name) + '</td><td>' + esc(p.feat) + '</td><td>' + esc(p.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxZhiBody').innerHTML = h;
    }

    function renderZhangse(){
      var h = '<p class="sx-note">掌色五色配属出传统医相通说，吉凶等级为通行归纳；五色生死句源出《素问·五藏生成篇》，页面按通行相书简作吉凶，青如枯草、赤如丹砂、赤如赭土为通行改写，原文分别作草兹、鸡冠、衃血；掌质四目为通行之说。掌色随四时与起居而变，只宜当时参照，不作久远之断。</p>';
      var t = '<thead><tr><th>掌色</th><th>五行</th><th>五脏</th><th>本位</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var zs = SHOU.zhangse;
      for (var i = 0; i < zs.length; i++){
        var z = zs[i];
        t += '<tr><td class="lbl">' + esc(z.name) + '</td><td>' + esc(z.wx) + '</td><td>' + esc(z.zang) + '</td><td>' + esc(z.season) + '</td><td>' + esc(z.zhu) + '</td><td>' + esc(z.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>掌质</th><th>通行断语</th></tr></thead><tbody>';
      var qs = SHOU.zhangzhi;
      for (var j = 0; j < qs.length; j++){
        t2 += '<tr><td class="lbl">' + esc(qs[j].name) + '</td><td>' + esc(qs[j].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxSeBody').innerHTML = h;
    }

    /* 模块三：五指与指甲（五指五行所主为传统配属，指端、指纹与指甲断语为通行之说，统一注明一次） */
    function renderWuZhi(){
      var h = '<p class="sx-note">五指五行所主为传统配属；指端四形（尖、方、圆、铲）为通行归纳；指纹三型取皮纹学通行说，指节纹为通行掌相说，古籍无载，只作形态参考，不作命运定论；指甲形色与反甲、纵纹、横纹取医家手诊通行说，只论形色之常变，不作病名之断。</p>';
      var t = '<thead><tr><th>手指</th><th>五行</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var fs = SHOU.fingers;
      for (var j = 0; j < fs.length; j++){
        var f = fs[j];
        t += '<tr><td class="lbl">' + esc(f.name) + '</td><td>' + esc(f.wx) + '</td><td>' + esc(f.zhu) + '</td><td>' + esc(f.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>指端</th><th>通行断语</th></tr></thead><tbody>';
      var ts = SHOU.tips;
      for (var k = 0; k < ts.length; k++){
        t2 += '<tr><td class="lbl">' + esc(ts[k].name) + '</td><td>' + esc(ts[k].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      var t3 = '<thead><tr><th>指纹</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var fps = SHOU.fingerprints;
      for (var m = 0; m < fps.length; m++){
        t3 += '<tr><td class="lbl">' + esc(fps[m].name) + '</td><td>' + esc(fps[m].feat) + '</td><td>' + esc(fps[m].duan) + '</td></tr>';
      }
      t3 += '</tbody>';
      h += qtabWrap(t3);
      var t3b = '<thead><tr><th>指节纹</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var kns = SHOU.knuckles;
      for (var kn = 0; kn < kns.length; kn++){
        t3b += '<tr><td class="lbl">' + esc(kns[kn].name) + '</td><td>' + esc(kns[kn].feat) + '</td><td>' + esc(kns[kn].duan) + '</td></tr>';
      }
      t3b += '</tbody>';
      h += qtabWrap(t3b);
      var t4 = '<thead><tr><th>指甲</th><th>通行断语</th></tr></thead><tbody>';
      var ns = SHOU.nails;
      for (var n = 0; n < ns.length; n++){
        t4 += '<tr><td class="lbl">' + esc(ns[n].name) + '</td><td>' + esc(ns[n].duan) + '</td></tr>';
      }
      t4 += '</tbody>';
      h += qtabWrap(t4);
      $('sxWuZhiBody').innerHTML = h;
    }

    /* 模块七：手相理论流派（四派名目并列，各注源流与判法，不作优劣之断） */
    function renderLiupai(){
      var h = '<p class="sx-note">手相之学源出中国、印度、西洋三支，另有医学健康一支；四派并列存其名目，各注源出与判法。</p>';
      var t = '<thead><tr><th>流派</th><th>源流</th><th>代表典籍、人物或学科</th><th>核心要素与判法</th></tr></thead><tbody>';
      var ls = SHOU.liupai;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i];
        t += '<tr><td class="lbl">' + esc(L.school) + '</td><td>' + esc(L.origin) + '</td><td>' + esc(L.book) + '</td><td>' + esc(L.method) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>题</th><th>述</th></tr></thead><tbody>';
      var ds = SHOU.dingwei;
      for (var j = 0; j < ds.length; j++){
        t2 += '<tr><td class="lbl">' + esc(ds[j].topic) + '</td><td>' + esc(ds[j].text) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxLpBody').innerHTML = h;
    }

    /* 模块五：手相自查（三线形态与八丘丰隆计分） */
    function renderShouForm(){
      var h = '<div class="form-row"><label class="field"><span>所察之手</span><select id="sxHand" aria-label="所察之手"><option value="left">左手（先天之基）</option><option value="right">右手（后天之运）</option><option value="both">双手合参</option></select></label></div>';
      h += '<div class="form-row"><label class="field"><span>掌形对照</span><select id="sxPalm" aria-label="掌形对照"><option value="">未选择</option>';
      var ps = SHOU.palms;
      for (var p = 0; p < ps.length; p++) h += '<option value="' + p + '">' + esc(ps[p].name) + '</option>';
      h += '</select></label><label class="field"><span>掌色对照</span><select id="sxSeColor" aria-label="掌色对照"><option value="">未选择</option>';
      var zs = SHOU.zhangse;
      for (var z = 0; z < zs.length; z++) h += '<option value="' + z + '">' + esc(zs[z].name) + '</option>';
      h += '</select></label></div>';
      var t = '<thead><tr><th>主线</th><th>形态</th></tr></thead><tbody>';
      var ls = SHOU.lines;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], o = '';
        for (var j = 0; j < L.variants.length; j++){
          var v = L.variants[j];
          o += '<option value="' + j + '"' + (j === 0 ? ' selected' : '') + '>' + esc(v.k) + '（' + sign(v.w) + '）</option>';
        }
        t += '<tr><td class="lbl">' + esc(L.name) + '</td><td class="vmd"><div class="field"><select id="sxLine-' + L.key + '" aria-label="' + esc(L.name) + '形态">' + o + '</select></div></td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<div class="form-row" id="sxHillChk">';
      var hs = SHOU.hills;
      for (var k = 0; k < hs.length; k++){
        h += '<label class="field chk"><input type="checkbox" id="sxHill-' + hs[k].key + '"><span>' + esc(hs[k].name) + '</span></label>';
      }
      h += '</div>';
      h += '<p class="sx-note">计分口径：三线按形态 +2、+1、0、-1、-2，八丘丰隆每丘 +1、未勾不计；合计七分及以上为吉档，负三分及以下为需留意档，余为平档，本站归纳。掌形、掌色只作对照，不计分。</p>';
      $('sxShouForm').innerHTML = h;
    }
    function sxShouGo(){
      var out = $('sxShouOut'), ls = SHOU.lines, hs = SHOU.hills, total = 0, lines = '';
      var handEl = $('sxHand');
      var hand = handEl ? handEl.value : 'left';
      var handText = hand === 'right' ? '右手（后天之运）' : (hand === 'both' ? '双手合参' : '左手（先天之基）');
      lines += '<p>所察：' + esc(handText) + '</p>';
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], v = L.variants[+($('sxLine-' + L.key) || {}).value || 0];
        total += v.w;
        lines += '<p>' + esc(L.name) + ' ' + sign(v.w) + '：' + esc(v.duan) + '（' + esc(v.k) + '）</p>';
      }
      for (var k = 0; k < hs.length; k++){
        var q = hs[k], ck = $('sxHill-' + q.key);
        if (ck && ck.checked){
          total += 1;
          lines += '<p>' + esc(q.name) + ' +1：' + esc(q.duan) + '</p>';
        }
      }
      var palmEl = $('sxPalm'), seEl = $('sxSeColor');
      var palm = palmEl && palmEl.value !== '' ? SHOU.palms[+palmEl.value] : null;
      var se = seEl && seEl.value !== '' ? SHOU.zhangse[+seEl.value] : null;
      if (palm) lines += '<p>掌形：' + esc(palm.name) + '，' + esc(palm.duan) + '（非计分）</p>';
      if (se) lines += '<p>掌色：' + esc(se.name) + '，' + esc(se.duan) + '（非计分）</p>';
      var h = '<div class="info-box"><h4>逐项短断（本站归纳）</h4>' + lines + '</div>';
      h += '<p class="sx-note">三线八丘合计 ' + total + ' 分，归' + bandOf(total) + '。未勾选之丘不计分。</p>';
      out.innerHTML = h;
    }
    window.sxShouGo = sxShouGo;

    /* 渲染次序：整体（掌形掌色）、局部（九宫八丘、五指指甲）、细节（三大主线、辅助线纹），末为自查与流派 */
    renderZhi();
    renderZhangse();
    renderGong();
    renderHills();
    renderWuZhi();
    renderHand();
    renderAux();
    renderShouForm();
    renderLiupai();

    /* 图与表联动：点九宫、八丘图中的宫丘名，定位并高亮对应表行 */
    var SX_GONG_KEYS = { '巽': 'xun', '离': 'li', '坤': 'kun', '震': 'zhen', '明堂': 'zhong', '兑': 'dui', '艮': 'gen', '坎': 'kan', '乾': 'qian' };
    var SX_HILL_KEYS = { '木星丘': 'muxing', '土星丘': 'tuxing', '太阳丘': 'taiyang', '水星丘': 'shuixing', '火星丘': 'huoxing', '金星丘': 'jinxing', '月丘': 'yuexing', '地丘': 'diqiu' };
    function sxHitRow(host, key){
      var row = host ? host.querySelector('tr[data-key="' + key + '"]') : null;
      if (!row) return;
      var old = document.querySelectorAll('.sx-hit');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('sx-hit');
      row.classList.add('sx-hit');
      try { row.scrollIntoView({ block: 'center' }); } catch (e) {}
      setTimeout(function(){ row.classList.remove('sx-hit'); }, 2400);
    }
    function sxBindFig(){
      var figs = document.querySelectorAll('.sx-jg');
      for (var i = 0; i < figs.length; i++){
        var texts = figs[i].querySelectorAll('text');
        for (var j = 0; j < texts.length; j++){
          (function(t){
            var name = (t.textContent || '').replace(/\s+/g, '');
            var isGong = Object.prototype.hasOwnProperty.call(SX_GONG_KEYS, name);
            var key = isGong ? SX_GONG_KEYS[name] : SX_HILL_KEYS[name];
            if (!key) return;
            var host = isGong ? $('sxGongBody') : $('sxHillBody');
            t.setAttribute('tabindex', '0');
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', '查看' + name + '释义');
            var go = function(){ sxHitRow(host, key); };
            t.addEventListener('click', go);
            t.addEventListener('keydown', function(e){
              if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); }
            });
          })(texts[j]);
        }
      }
    }
    var SX_GONG_NAMES = {}, SX_HILL_NAMES = {};
    Object.keys(SX_GONG_KEYS).forEach(function(n){ SX_GONG_NAMES[SX_GONG_KEYS[n]] = n; });
    Object.keys(SX_HILL_KEYS).forEach(function(n){ SX_HILL_NAMES[SX_HILL_KEYS[n]] = n; });
    function sxHitFig(key, isGong){
      var name = isGong ? SX_GONG_NAMES[key] : SX_HILL_NAMES[key];
      if (!name) return;
      var texts = document.querySelectorAll('.sx-jg text'), hit = [], fig = null;
      for (var i = 0; i < texts.length; i++){
        if ((texts[i].textContent || '').replace(/\s+/g, '') === name){
          hit.push(texts[i]);
          if (!fig && texts[i].closest) fig = texts[i].closest('figure');
        }
      }
      if (!hit.length) return;
      var old = document.querySelectorAll('.sx-fig-hit');
      for (var j = 0; j < old.length; j++) old[j].classList.remove('sx-fig-hit');
      for (var k = 0; k < hit.length; k++) hit[k].classList.add('sx-fig-hit');
      if (fig){ try { fig.scrollIntoView({ block: 'center' }); } catch (e) {} }
      setTimeout(function(){ for (var m = 0; m < hit.length; m++) hit[m].classList.remove('sx-fig-hit'); }, 2400);
    }
    function sxBindRows(){
      [['sxGongBody', true], ['sxHillBody', false]].forEach(function(g){
        var host = $(g[0]);
        if (!host) return;
        host.addEventListener('click', function(e){
          var tr = e.target && e.target.closest ? e.target.closest('tr[data-key]') : null;
          if (tr) sxHitFig(tr.getAttribute('data-key'), g[1]);
        });
      });
    }
    sxBindFig();
    sxBindRows();

    /* AI 上下文：当前自查设定与计分口径 */
    function sxAiContext(){
      var ls = SHOU.lines, hs = SHOU.hills, total = 0, lineParts = [], hillParts = [];
      var handEl = $('sxHand');
      var hand = handEl ? handEl.value : 'left';
      var handText = hand === 'right' ? '右手（后天之运）' : (hand === 'both' ? '双手合参' : '左手（先天之基）');
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], v = L.variants[+($('sxLine-' + L.key) || {}).value || 0];
        total += v.w;
        lineParts.push(L.name + '：' + v.k + '（' + sign(v.w) + '）');
      }
      for (var k = 0; k < hs.length; k++){
        var q = hs[k], ck = $('sxHill-' + q.key);
        if (ck && ck.checked){ total += 1; hillParts.push(q.name); }
      }
      var palmEl = $('sxPalm'), seEl = $('sxSeColor');
      var palm = palmEl && palmEl.value !== '' ? SHOU.palms[+palmEl.value] : null;
      var se = seEl && seEl.value !== '' ? SHOU.zhangse[+seEl.value] : null;
      var s = '【手相页】所察：' + handText + '。\n';
      s += '三线：' + lineParts.join('；') + '。\n';
      s += hillParts.length ? '八丘已勾：' + hillParts.join('、') + '。\n' : '八丘均未勾选。\n';
      if (palm) s += '掌形参照（非计分）：' + palm.name + '，' + palm.duan + '。\n';
      if (se) s += '掌色参照（非计分）：' + se.name + '，' + se.duan + '。\n';
      s += '合计 ' + total + ' 分，归' + bandOf(total) + '。\n';
      s += '计分口径：三线按形态 +2、+1、0、-1、-2，八丘丰隆每丘 +1，本站归纳。\n';
      s += '手相是传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。';
      return s;
    }

    /* 页面装配：共享壳件、折叠状态恢复与免责声明 */
    renderChrome('shouxiang.html');
    applySxModState();
    sxModNavReady = true;
    if (window.mountAI) window.mountAI(sxAiContext, '手相', { share:{ page:'shouxiang', title:'手相在线自查', result:'#sxShouOut', collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ sxShouGo(); }); } } });
    /* 分享与数据：表单快照即盘面，链接与 JSON 还原后重出自查。 */
    })();
  }, 0);
});
