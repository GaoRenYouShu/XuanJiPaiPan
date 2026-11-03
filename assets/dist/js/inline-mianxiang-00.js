


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
    /* 档位阈值：十一宫计分，满分三十三分；十八分及以上为吉档，负十二分及以下为需留意档，余为平档；阈值为本站归纳 */
    function bandOf(n){ return n >= 18 ? '吉档' : (n <= -12 ? '需留意档' : '平档'); }
    function sign(n){ return n > 0 ? '+' + n : String(n); }
    var CN_NO = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
    /* 计分与档位说明：阈值为本站归纳 */
    var MIAN_SCORE_NOTE = '十一宫丰隆+2、平0、陷-2，明润+1、平常0、晦暗-1；相貌宫为总览，不计分；合计十八分及以上为吉档，负十二分及以下为需留意档，余为平档；计分与档位阈值为本站归纳，非典籍成法。';

    /* 模块一：面相三停（节录与归纳口径统一注明，不逐条重复） */
    function renderSanTing(){
      var h = '<div class="info-box"><h4>三停之位</h4><p class="mian-note">三停定位与诀文节录' + esc(ST.src) + '通行本，只作句读；所主年岁区间为通行归纳，非典籍成法。</p><p>' + esc(ST.def) + '</p><p>诀曰：' + esc(ST.jue) + '</p></div>';
      var t = '<thead><tr><th>停</th><th>部位</th><th>所主（通行归纳）</th><th>诀文</th></tr></thead><tbody>';
      for (var i = 0; i < ST.rows.length; i++){
        var r = ST.rows[i];
        t += '<tr><td class="lbl">' + esc(r.ting) + '</td><td>' + esc(r.loc) + '</td><td>' + esc(r.zhu) + '</td><td>' + esc(r.jue) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<div class="info-box"><h4>三停匀称断语</h4><p><span class="yi">吉象</span>：' + esc(ST.ping.ji) + '</p><p><span class="ji">凶象</span>：' + esc(ST.ping.xiong) + '</p><p>三才：' + esc(ST.sancai) + '</p><p>' + esc(ST.zhuNote) + '</p><p>' + esc(ST.variant) + '</p><p>' + esc(ST.note) + '</p></div>';
      $('mianSanTingBody').innerHTML = h;
    }

    /* 模块二：面相五官（官名照录《麻衣相法》通行；五行配属取相术通行说，与医家开窍分属两套） */
    function renderOrgans(){
      var h = '<p class="mian-note">五官官名照录《麻衣相法》通行；五行五脏配属为相术五行配属通行说，与医家开窍（肝目、心舌、脾口、肺鼻、肾耳）分属两套；形态细断为通行归纳。同页气色表从医家五行，两套配属不同，各随其表，不互替。五官合参：眼定基调、鼻定中年、眉看康健人缘、口看晚年福气、耳看根基寿元。</p>';
      var t = '<thead><tr><th>部位</th><th>官名</th><th>五行</th><th>五脏（相术配属）</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
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

    /* 模块四：气色与痣相（五色配属从医家五行，五色生死句标明素问原文与通行改写，痣相为通行归纳） */
    function renderQise(){
      var h = '<p class="mian-note">气色五色配属从医家五行（青肝、赤心、黄脾、白肺、黑肾），与五官表的相术配属分属两套，不互替；气色以润泽为正、干焦为邪。五色生死句源出《素问·五藏生成篇》，见《重广补注黄帝内经素问》卷第三；页面按通行相书简作吉凶，青如枯草、赤如丹砂、赤如赭土为通行改写，原文分别作草兹、鸡冠、衃血；吉凶等级为通行归纳。痣相通则与部位断语为通行归纳，非典籍条文，不作应验承诺。气色随时而变，只宜当日参照，不作长期命运之断。</p>';
      var t = '<thead><tr><th>气色</th><th>五行</th><th>五脏（医家）</th><th>本位</th><th>通行断语</th></tr></thead><tbody>';
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

    /* 模块五：面相十二宫（十二条出处同一，模块首行一次注明节录与归纳范围） */
    function renderPalaces(){
      var h = '<p class="mian-note">以下十二条定位与吉凶条文节录' + esc(MIANY.palaces[0].src) + '，见《古今图书集成》博物汇编艺术典卷631，通行本卷一；非全文照录，所据本与取舍见凡例；主事列为站内归纳。计分与自查另见下方模块。</p>';
      var t = '<thead><tr><th>宫</th><th>定位</th><th>主事（本站归纳）</th><th>吉象</th><th>凶象</th></tr></thead><tbody>';
      var ps = MIANY.palaces;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        t += '<tr><td class="lbl">' + CN_NO[i] + ' ' + esc(p.palace) + '</td><td>' + esc(p.loc) + '</td><td>' + esc(p.zhu) + '</td><td>' + esc(p.ji) + '</td><td>' + esc(p.xiong) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('mianPalBody').innerHTML = h;
    }

    /* 模块六：面相自查（十一宫丰陷气色计分，相貌宫总览不计分） */
    var MORPH = { up:{t:'丰隆',w:2,d:'丰隆平满，宫位得势'}, mid:{t:'平',w:0,d:'平满如常，不喜不忌'}, down:{t:'陷',w:-2,d:'低陷有亏，宫位失势'} };
    var COLOR = { bright:{t:'明润',w:1,d:'气色明润，吉象增辉'}, normal:{t:'平常',w:0,d:'气色平常，吉凶不显'}, dull:{t:'晦暗',w:-1,d:'气色晦暗，纵吉亦减'} };
    function optList(map){
      var h = '<option value="" selected>未选择</option>';
      for (var k in map){ h += '<option value="' + k + '">' + esc(map[k].t) + '（' + sign(map[k].w) + '）</option>'; }
      return h;
    }
    function renderMianForm(){
      var t = '<thead><tr><th>宫位</th><th>定位</th><th>形态</th><th>气色</th></tr></thead><tbody>';
      var ps = MIANY.palaces;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        if (p.key === 'xiangmao'){
          t += '<tr><td class="lbl">' + CN_NO[i] + ' ' + esc(p.palace) + '</td><td>' + esc(p.loc) + '</td><td class="vmd" colspan="2">总览诸宫，不另计分</td></tr>';
          continue;
        }
        t += '<tr><td class="lbl">' + CN_NO[i] + ' ' + esc(p.palace) + '</td><td>' + esc(p.loc) + '</td>'
          + '<td class="vmd"><div class="field"><select id="mianMorph-' + p.key + '" aria-label="' + esc(p.palace) + '形态">' + optList(MORPH) + '</select></div></td>'
          + '<td class="vmd"><div class="field"><select id="mianColor-' + p.key + '" aria-label="' + esc(p.palace) + '气色">' + optList(COLOR) + '</select></div></td></tr>';
      }
      t += '</tbody>';
      $('mianForm').innerHTML = qtabWrap(t) + '<p class="mian-note">计分口径：' + MIAN_SCORE_NOTE + '</p>';
    }
    function mianGo(){
      var out = $('mianOut'), ps = MIANY.palaces, total = 0, lines = '', ji = 0, ping = 0, xiong = 0;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        if (p.key === 'xiangmao') continue;
        var mEl = $('mianMorph-' + p.key), cEl = $('mianColor-' + p.key);
        var m = mEl ? MORPH[mEl.value] : null;
        var c = cEl ? COLOR[cEl.value] : null;
        if (!m || !c){
          var el = !m ? mEl : cEl;
          if (el){
            el.scrollIntoView({ block: 'center' });
            try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
          }
          out.innerHTML = '<div class="info-box"><h4>面相自查</h4><p>未选满：先从“' + esc(p.palace) + '”作答。</p></div>';
          return;
        }
        var sc = m.w + c.w;
        total += sc;
        if (sc > 0) ji++; else if (sc < 0) xiong++; else ping++;
        var duan = m.d + '；' + c.d;
        if (m.w > 0) duan += '。参吉象：“' + firstClause(p.ji) + '”';
        else if (m.w < 0) duan += '。参凶象：“' + firstClause(p.xiong) + '”';
        lines += '<p>' + CN_NO[i] + ' ' + esc(p.palace) + ' ' + sign(sc) + '：' + esc(duan) + '</p>';
      }
      lines += '<p>十二 相貌宫 总览：不计分，计分诸宫吉 ' + ji + '、平 ' + ping + '、凶 ' + xiong + '。</p>';
      var h = '<div class="info-box"><h4>逐宫短断（本站归纳）</h4>' + lines + '</div>';
      h += '<p class="mian-note">十一宫合计 ' + total + ' 分（相貌宫总览不计分），归' + bandOf(total) + '。档位阈值为本站归纳：十八分及以上为吉档，负十二分及以下为需留意档，余为平档。各宫定位见十二宫古籍原图。</p>';
      h += '<p class="mian-dis">相术为传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。</p>';
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

    /* AI 上下文：当前自查设定、计分口径与档位阈值 */
    function mianAiContext(){
      var ps = MIANY.palaces, total = 0, parts = [], missing = false, ji = 0, ping = 0, xiong = 0;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        if (p.key === 'xiangmao') continue;
        var mEl = $('mianMorph-' + p.key), cEl = $('mianColor-' + p.key);
        var m = mEl ? MORPH[mEl.value] : null;
        var c = cEl ? COLOR[cEl.value] : null;
        if (!m || !c){ missing = true; break; }
        var sc = m.w + c.w;
        total += sc;
        if (sc > 0) ji++; else if (sc < 0) xiong++; else ping++;
        if (m.w !== 0 || c.w !== 0) parts.push(CN_NO[i] + ' ' + p.palace + '：' + m.t + '、' + c.t + '（' + sign(sc) + '）');
      }
      var s = '【面相页】十一宫自查当前设定。\n';
      if (missing){
        s += '计分诸宫尚未选满，未出分。\n';
      } else {
        s += parts.length ? parts.join('；') + '。\n' : '计分诸宫均为平、平常。\n';
        s += '合计 ' + total + ' 分（十一宫，相貌宫总览不计分），归' + bandOf(total) + '；相貌宫总览：吉 ' + ji + '、平 ' + ping + '、凶 ' + xiong + '。\n';
      }
      s += '计分口径与档位阈值：' + MIAN_SCORE_NOTE + '\n';
      s += '面相是传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。';
      return s;
    }

    /* 页面装配：共享壳件、折叠状态恢复与免责声明 */
    renderChrome('mianxiang.html');
    applyMxModState();
    mianModNavReady = true;
    if (window.mountAI) window.mountAI(mianAiContext, '面相', { share:{ page:'mianxiang', title:'面相在线自查', result:'#mianOut', collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ mianGo(); }); } } });
    /* 分享与数据：表单快照即盘面，链接与 JSON 还原后重出自查。 */
    })();
  }, 0);
});
