


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
    function bandOf(n){ return n >= 6 ? '吉档' : (n <= -6 ? '需留意档' : '平档'); }

    /* 模块一：手相三大主线（经文出处统一在此注明，不逐条重复） */
    function renderHand(){
      var h = '<div class="info-box"><h4>三才纹总诀</h4><p>' + esc(SHOU.jing) + '</p></div>';
      h += '<p class="sx-note">总诀与以下三条走向、经文均照录' + esc(SHOU.jingSrc) + '通行本，正文不改一字，只作句读；变体断语为通行归纳。</p>';
      var t = '<thead><tr><th>主线</th><th>别名</th><th>走向</th><th>经文</th><th>常见变体通行断语</th></tr></thead><tbody>';
      var ls = SHOU.lines;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], vs = [];
        for (var j = 0; j < L.variants.length; j++){ vs.push(esc(L.variants[j].k) + '：' + esc(L.variants[j].duan)); }
        t += '<tr><td class="lbl">' + esc(L.name) + '</td><td>' + esc(L.alias) + '</td><td>' + esc(L.loc) + '</td><td>' + esc(L.jing) + '</td><td>' + vs.join('；') + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHandBody').innerHTML = h;
    }

    /* 模块二：手相九宫八丘（宫位取通行掌相说、丘名为中西对照称谓，口径统一注明，不逐条重复） */
    function renderGong(){
      var h = '<p class="sx-note">掌中九宫为通行掌相说，宫位依后天八卦布于掌上，各宫分司一事；断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>宫位</th><th>方位</th><th>所对掌丘</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var gs = SHOU.gong;
      for (var i = 0; i < gs.length; i++){
        var g = gs[i];
        t += '<tr><td class="lbl">' + esc(g.gong) + '</td><td>' + esc(g.fang) + '</td><td>' + esc(g.qiu) + '</td><td>' + esc(g.zhu.replace(/^主/, '')) + '</td><td>' + esc(g.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxGongBody').innerHTML = h;
    }

    function renderHills(){
      var h = '<p class="sx-note">八丘名目为通行坊本中西对照称谓，古籍无载；位置与所主依掌纹分区通行说，丰隆断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>丘名</th><th>位置</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var hs = SHOU.hills;
      for (var i = 0; i < hs.length; i++){
        var q = hs[i];
        t += '<tr><td class="lbl">' + esc(q.name) + '</td><td>' + esc(q.loc) + '</td><td>' + esc(q.zhu.replace(/^主/, '')) + '</td><td>' + esc(q.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHillBody').innerHTML = h;
    }

    /* 模块三：辅助线纹与标记（通行之说，统一注明一次） */
    function renderAux(){
      var h = '<p class="sx-note">辅助线纹与特殊标记为通行坊本中西合参称谓，古籍无载；名目、走向与断语均为通行归纳，不作典籍条文。</p>';
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
      var h = '<p class="sx-note">掌色五色配属出传统医相通说，吉凶等级为通行归纳；掌质三目为通行之说。掌色随四时与起居而变，只宜当时参照，不作久远之断。</p>';
      var t = '<thead><tr><th>掌色</th><th>五行</th><th>五脏</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var zs = SHOU.zhangse;
      for (var i = 0; i < zs.length; i++){
        var z = zs[i];
        t += '<tr><td class="lbl">' + esc(z.name) + '</td><td>' + esc(z.wx) + '</td><td>' + esc(z.zang) + '</td><td>' + esc(z.zhu) + '</td><td>' + esc(z.duan) + '</td></tr>';
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

    /* 模块三：五指与指甲（五指五行所主为传统配属，指端与指甲断语为通行之说，统一注明一次） */
    function renderWuZhi(){
      var h = '<p class="sx-note">五指五行所主为传统配属；指端四形（尖、方、圆、铲）与指甲形色之断语为通行归纳，兼采医家手诊之说，明标口径、不附会典籍。</p>';
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
      var t3 = '<thead><tr><th>指甲</th><th>通行断语</th></tr></thead><tbody>';
      var ns = SHOU.nails;
      for (var n = 0; n < ns.length; n++){
        t3 += '<tr><td class="lbl">' + esc(ns[n].name) + '</td><td>' + esc(ns[n].duan) + '</td></tr>';
      }
      t3 += '</tbody>';
      h += qtabWrap(t3);
      $('sxWuZhiBody').innerHTML = h;
    }

    /* 模块七：手相理论流派（四派名目并列，各注源流与判法，不作优劣之断） */
    function renderLiupai(){
      var h = '<p class="sx-note">手相之学源出中国、印度、西洋三支，另有医学健康一支；四派并列存其名目，各注源出与判法。</p>';
      var t = '<thead><tr><th>流派</th><th>源流</th><th>代表典籍与人物</th><th>核心要素与判法</th></tr></thead><tbody>';
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
      var h = qtabWrap(t);
      h += '<div class="form-row" id="sxHillChk">';
      var hs = SHOU.hills;
      for (var k = 0; k < hs.length; k++){
        h += '<label class="field chk"><input type="checkbox" id="sxHill-' + hs[k].key + '"><span>' + esc(hs[k].name) + '</span></label>';
      }
      h += '</div>';
      h += '<p class="sx-note">计分口径：三线按形态 +2、+1、-1、-2，八丘丰隆每丘 +1、未勾不计，本站归纳。</p>';
      $('sxShouForm').innerHTML = h;
    }
    function sxShouGo(){
      var out = $('sxShouOut'), ls = SHOU.lines, hs = SHOU.hills, total = 0, lines = '';
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], v = L.variants[+($('sxLine-' + L.key) || {}).value || 0];
        total += v.w;
        lines += '<p>' + esc(L.name) + ' ' + sign(v.w) + '：' + esc(v.duan) + '（' + esc(v.k) + '，本站归纳）</p>';
      }
      for (var k = 0; k < hs.length; k++){
        var q = hs[k], ck = $('sxHill-' + q.key);
        if (ck && ck.checked){
          total += 1;
          lines += '<p>' + esc(q.name) + ' +1：' + esc(q.duan) + '</p>';
        }
      }
      var h = '<div class="info-box"><h4>逐项短断（本站归纳）</h4>' + lines + '</div>';
      h += '<p class="sx-note">三线八丘合计 ' + total + ' 分，归' + bandOf(total) + '。未勾选之丘不计分。相术为传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。</p>';
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

    /* AI 上下文：当前自查设定与计分口径 */
    function sxAiContext(){
      var s = '【手相页】掌形掌色、掌中九宫八丘、五指指甲、三大主线、辅助线纹与标记的名目条文对照与自查，条文照录《麻衣相法·论手掌纹》通行本。\n';
      s += '掌中九宫依后天八卦布于掌上，八丘为通行坊本中西对照称谓；理论流派列中国相掌派、西洋手相学、印度掌纹学、医学健康派四支。\n';
      s += '计分口径：三线按形态 +2、+1、-1、-2，八丘丰隆每丘 +1，本站归纳。\n';
      s += '手相是传统民俗，不作人格评判，也不作医疗依据。';
      return s;
    }

    /* 页面装配：共享壳件、折叠状态恢复与免责声明 */
    renderChrome('shouxiang.html');
    applySxModState();
    sxModNavReady = true;
    if (window.mountAI) window.mountAI(sxAiContext, '手相', { share:{ page:"shouxiang", title:"手相在线自查", recast:function(){
      try{ if ($('sxShouOut').innerHTML) sxShouGo(); }catch(e){}
    }} });
    /* 盘面分享与数据（全站附加功能模块）：表单快照为盘面，链接/JSON 均可还原并重出已算的自查 */;
    })();
  }, 0);
});
