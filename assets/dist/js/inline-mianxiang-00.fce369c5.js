


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    (function(){
    'use strict';
    function $(id){ return document.getElementById(id); }
    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function firstClause(s){ return String(s||'').split('；')[0].replace(/。$/,''); }

    var ST = window.XS_SANTING, MIANY = window.XS_MIANY;

    function mianToggleMod(id){ var el = $(id); if (el) el.classList.toggle('collapsed'); saveMxModState(); }
    window.mianToggleMod = mianToggleMod;

    /* 折叠状态持久化：localStorage 为主、sessionStorage 兜底，以已存为底 */
    var MX_MOD_KEY = 'mianModState';
    var mianModNavReady = false;
        function saveMxModState(){ xjSaveModCollapsed(MX_MOD_KEY, function(){ return mianModNavReady; }, '.mod[id]'); }
    function applyMxModState(){ xjApplyModCollapsed(MX_MOD_KEY, '.mod[id]'); }

    function qtabWrap(inner){ return '<div class="qtab-scroll"><table class="qtab">' + inner + '</table></div>'; }
    function bandOf(n){ return n >= 6 ? '吉档' : (n <= -6 ? '需留意档' : '平档'); }
    function sign(n){ return n > 0 ? '+' + n : String(n); }
    var CN_NO = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];

    /* 模块一：面相三停（出处统一注明，不逐条重复） */
    function renderSanTing(){
      var h = '<div class="info-box"><h4>三停之位</h4><p class="mian-note">三停定位与诀文取' + esc(ST.src) + '通行本。</p><p>' + esc(ST.def) + '</p><p>诀曰：' + esc(ST.jue) + '</p></div>';
      var t = '<thead><tr><th>停</th><th>部位</th><th>所主</th><th>诀文</th></tr></thead><tbody>';
      for (var i = 0; i < ST.rows.length; i++){
        var r = ST.rows[i];
        t += '<tr><td class="lbl">' + esc(r.ting) + '</td><td>' + esc(r.loc) + '</td><td>' + esc(r.zhu) + '</td><td>' + esc(r.jue) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<div class="info-box"><h4>三停匀称断语</h4><p><span class="yi">吉象</span>：' + esc(ST.ping.ji) + '</p><p><span class="ji">凶象</span>：' + esc(ST.ping.xiong) + '</p><p>三才：' + esc(ST.sancai) + '</p><p>' + esc(ST.note) + '</p></div>';
      $('mianSanTingBody').innerHTML = h;
    }

    /* 模块二：面相五官（官名照录《麻衣相法》通行，配属为医相通说，细断为通行归纳） */
    function renderOrgans(){
      var h = '<p class="mian-note">五官官名照录《麻衣相法》通行；五行五脏配属为传统医相通说；形态细断为通行归纳。五官合参：眼定基调、鼻定中年、眉看康健人缘、口看晚年福气、耳看根基寿元。</p>';
      var t = '<thead><tr><th>部位</th><th>官名</th><th>五行</th><th>五脏</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var os = MIANY.organs;
      for (var i = 0; i < os.length; i++){
        var o = os[i];
        t += '<tr><td class="lbl">' + esc(o.name) + '</td><td class="nw">' + esc(o.guan) + '</td><td>' + esc(o.wx) + '</td><td>' + esc(o.zang) + '</td><td>' + esc(o.zhu) + '</td><td>' + esc(o.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('mianOrganBody').innerHTML = h;
    }

    /* 模块三：面形与眼形（通行坊本分类，统一注明一次） */
    function renderMianxing(){
      var h = '<p class="mian-note">面形与眼形分类为通行坊本归纳，属观人经验之谈；断语系通行之说，不作典籍条文，亦不作人格评判。</p>';
      var t = '<thead><tr><th>面形</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var ss = MIANY.shapes;
      for (var i = 0; i < ss.length; i++){
        t += '<tr><td class="lbl">' + esc(ss[i].name) + '</td><td>' + esc(ss[i].feat) + '</td><td>' + esc(ss[i].duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>眼形</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var es = MIANY.eyes;
      for (var j = 0; j < es.length; j++){
        t2 += '<tr><td class="lbl">' + esc(es[j].name) + '</td><td>' + esc(es[j].feat) + '</td><td>' + esc(es[j].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('mianXingBody').innerHTML = h;
    }

    /* 模块四：气色与痣相（五色配属出医相通说，痣位断语为通行之说，统一注明一次） */
    function renderQise(){
      var h = '<p class="mian-note">气色五色配属出传统医相通说，吉凶等级为通行归纳；痣相通则与部位断语为通行之说。气色随时而变，只宜当日参照，不作长期命运之断。</p>';
      var t = '<thead><tr><th>气色</th><th>五行</th><th>五脏</th><th>本位</th><th>通行断语</th></tr></thead><tbody>';
      var qs = MIANY.qise;
      for (var i = 0; i < qs.length; i++){
        var q = qs[i];
        t += '<tr><td class="lbl">' + esc(q.name) + '</td><td>' + esc(q.wx) + '</td><td>' + esc(q.zang) + '</td><td>' + esc(q.season) + '</td><td>' + esc(q.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>部位</th><th>通行断语</th></tr></thead><tbody>';
      var ms = MIANY.moles;
      for (var j = 0; j < ms.length; j++){
        t2 += '<tr><td class="lbl">' + esc(ms[j].loc) + '</td><td>' + esc(ms[j].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('mianQiseBody').innerHTML = h;
    }

    /* 模块五：面相十二宫（十二条出处同一，模块首行一次注明） */
    function renderPalaces(){
      var h = '<p class="mian-note">以下十二条定位、主事与吉凶条文均照录' + esc(MIANY.palaces[0].src) + '通行本，正文不改一字，只作句读；计分与自查另见下方模块。</p>';
      var t = '<thead><tr><th>宫</th><th>定位</th><th>主事</th><th>吉象</th><th>凶象</th></tr></thead><tbody>';
      var ps = MIANY.palaces;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        t += '<tr><td class="lbl">' + CN_NO[i] + ' ' + esc(p.palace) + '</td><td>' + esc(p.loc) + '</td><td>' + esc(p.zhu) + '</td><td>' + esc(p.ji) + '</td><td>' + esc(p.xiong) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('mianPalBody').innerHTML = h;
    }

    /* 模块六：面相自查（十二宫丰陷气色计分） */
    var MORPH = { up:{t:'丰隆',w:2,d:'丰隆平满，宫位得势'}, mid:{t:'平',w:0,d:'平满如常，不喜不忌'}, down:{t:'陷',w:-2,d:'低陷有亏，宫位失势'} };
    var COLOR = { bright:{t:'明润',w:1,d:'气色明润，吉象增辉'}, normal:{t:'平常',w:0,d:'气色平常，吉凶不显'}, dull:{t:'晦暗',w:-1,d:'气色晦暗，纵吉亦减'} };
    function optList(map, defKey){
      var h = '';
      for (var k in map){ h += '<option value="' + k + '"' + (k === defKey ? ' selected' : '') + '>' + esc(map[k].t) + '（' + sign(map[k].w) + '）</option>'; }
      return h;
    }
    function renderMianForm(){
      var t = '<thead><tr><th>宫位</th><th>定位</th><th>形态</th><th>气色</th></tr></thead><tbody>';
      var ps = MIANY.palaces;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        t += '<tr><td class="lbl">' + CN_NO[i] + ' ' + esc(p.palace) + '</td><td>' + esc(p.loc) + '</td>'
          + '<td class="vmd"><div class="field"><select id="mianMorph-' + p.key + '" aria-label="' + esc(p.palace) + '形态">' + optList(MORPH, 'mid') + '</select></div></td>'
          + '<td class="vmd"><div class="field"><select id="mianColor-' + p.key + '" aria-label="' + esc(p.palace) + '气色">' + optList(COLOR, 'normal') + '</select></div></td></tr>';
      }
      t += '</tbody>';
      $('mianForm').innerHTML = qtabWrap(t) + '<p class="mian-note">计分口径：丰隆+2、平0、陷-2，明润+1、平常0、晦暗-1，本站归纳。</p>';
    }
    function mianGo(){
      var out = $('mianOut'), ps = MIANY.palaces, total = 0, lines = '';
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        var m = MORPH[($('mianMorph-' + p.key) || {}).value || 'mid'];
        var c = COLOR[($('mianColor-' + p.key) || {}).value || 'normal'];
        var sc = m.w + c.w;
        total += sc;
        var duan = m.d + '；' + c.d;
        if (m.w > 0) duan += '。参吉象：“' + firstClause(p.ji) + '”';
        else if (m.w < 0) duan += '。参凶象：“' + firstClause(p.xiong) + '”';
        lines += '<p>' + CN_NO[i] + ' ' + esc(p.palace) + ' ' + sign(sc) + '：' + esc(duan) + '</p>';
      }
      var h = '<div class="info-box"><h4>逐宫短断（本站归纳）</h4>' + lines + '</div>';
      h += '<p class="mian-note">十二宫合计 ' + total + ' 分，归' + bandOf(total) + '。各宫定位见十二宫古籍原图。相术为传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。</p>';
      out.innerHTML = h;
    }
    window.mianGo = mianGo;

    /* 模块七：面相理论流派（形神两宗与集成诸家并列，各注源流与判法，不作优劣之断） */
    function renderLiupai(){
      var h = '<p class="mian-note">面相之学以形法、神法两宗为主流，另有清代集成诸家与西洋、医家两支；各派并列存其名目，各注源出与判法。</p>';
      var t = '<thead><tr><th>流派</th><th>源流</th><th>代表典籍与人物</th><th>核心要素与判法</th></tr></thead><tbody>';
      var ls = MIANY.liupai;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i];
        t += '<tr><td class="lbl">' + esc(L.school) + '</td><td>' + esc(L.origin) + '</td><td>' + esc(L.book) + '</td><td>' + esc(L.method) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>题</th><th>述</th></tr></thead><tbody>';
      var ds = MIANY.dingwei;
      for (var j = 0; j < ds.length; j++){
        t2 += '<tr><td class="lbl">' + esc(ds[j].topic) + '</td><td>' + esc(ds[j].text) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('mianLpBody').innerHTML = h;
    }

    /* 渲染次序：整体（三停、面形眼形）、局部（五官、气色痣相）、细部（十二宫），末为自查与流派 */
    renderSanTing();
    renderMianxing();
    renderOrgans();
    renderQise();
    renderPalaces();
    renderMianForm();
    renderLiupai();

    /* AI 上下文：当前自查设定与计分口径 */
    function mianAiContext(){
      var s = '【面相页】面相三停、面形眼形、五官、气色痣相与十二宫自查，条文照录《麻衣相法》《神相全编》通行本。\n';
      s += '理论流派列形法派、神法派、清代集成诸家、西洋人相学、医家面诊五支，形法派立十二宫三停五官之骨架，神法派以观神察气为参证。\n';
      s += '计分口径：十二宫丰隆+2、平0、陷-2，明润+1、平常0、晦暗-1，本站归纳。\n';
      s += '面相是传统民俗，不作人格评判，也不作医疗依据。';
      return s;
    }

    /* 页面装配：共享壳件、折叠状态恢复与免责声明 */
    renderChrome('mianxiang.html');
    applyMxModState();
    mianModNavReady = true;
    if (window.mountAI) window.mountAI(mianAiContext, '面相', { share:{ page:"mianxiang", title:"面相在线自查", recast:function(){
      try{ if ($('mianOut').innerHTML) mianGo(); }catch(e){}
    }} });
    /* 盘面分享与数据（全站附加功能模块）：表单快照为盘面，链接/JSON 均可还原并重出已算的自查 */;
    })();
  }, 0);
});
