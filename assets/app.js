/* 共享工具：导航、五行着色、日期辅助。依赖全局 Solar/Lunar（lunar-javascript） */

/* 分组导航：首页 + 历法 / 命理 / 三式 / 占卜 / 民俗 / 运气 / 相术 / 附录（八卷谱系） */
const NAV_GROUPS = [
  {type:'link', href:'index.html', name:'首页'},
  {type:'group', name:'历法', items:[
    {href:'wannianli.html', name:'万年历'},
    {href:'laohuangli.html', name:'老黄历'},
    {href:'foli.html', name:'佛历'},
    {href:'daoli.html', name:'道历'},
    {href:'zangli.html', name:'藏历'},
    {href:'zeri.html', name:'择日'},
    {href:'huangji.html', name:'皇极经世'},
  ]},
  {type:'group', name:'命理', items:[
    {href:'bazi.html', name:'八字排盘'},
    {href:'hehun.html', name:'八字合婚'},
    {href:'ziwei.html', name:'紫微斗数'},
    {href:'heluo.html', name:'河洛理数'},
    {href:'tieban.html', name:'铁板神数'},
    {href:'xingming.html', name:'姓名学'},
    {href:'xingzhan.html', name:'占星术'},
    {href:'qizheng.html', name:'七政四余'},
  ]},
  {type:'group', name:'三式', items:[
    {href:'qimen.html', name:'奇门遁甲'},
    {href:'daliuren.html', name:'大六壬'},
    {href:'taiyi.html', name:'太乙神数'},
  ]},
  {type:'group', name:'占卜', items:[
    {href:'liuyao.html', name:'六爻'},
    {href:'meihua.html', name:'梅花易数'},
    {href:'xiaoliuren.html', name:'小六壬'},
    {href:'lingqian.html', name:'灵签'},
    {href:'tarot.html', name:'塔罗牌'},
    {href:'lenormand.html', name:'雷诺曼'},
  ]},
  {type:'group', name:'民俗', items:[
    {href:'minsu.html', name:'民俗占法'},
    {href:'cezi.html', name:'测字'},
    {href:'zhougong.html', name:'周公解梦'},
    {href:'xingxiu.html', name:'二十八宿'},
    {href:'taisui.html', name:'太岁生肖'},
  ]},
  {type:'group', name:'运气', items:[
    {href:'yunqi.html', name:'五运六气'},
  ]},
  {type:'group', name:'相术', items:[
    {href:'shouxiang.html', name:'手相'},
    {href:'mianxiang.html', name:'面相'},
    {href:'fengshui.html', name:'阳宅风水'},
    {href:'fengshui-yin.html', name:'阴宅风水'},
  ]},
  {type:'group', name:'附录', items:[
    {href:'dianji.html', name:'典籍参考'},
    {href:'shuoming.html', name:'说明文档'},
    {href:'opensource.html', name:'算法数据'},
  ]},
];

function renderChrome(active){
  let navHtml = '';
  NAV_GROUPS.forEach((g,gi)=>{
    if(g.type==='link'){
      const cls = g.href===active ? 'nav-link active' : 'nav-link';
      navHtml += `<a class="${cls}" href="${g.href}">${g.name}</a>`;
    } else {
      const hasActive = g.items.some(it=>it.href===active);
      const items = g.items.map(it=>{
        const c = it.href===active ? 'active' : '';
        return `<a class="${c}" href="${it.href}">${it.name}</a>`;
      }).join('');
      navHtml += `<div class="nav-group${hasActive?' has-active':''}" data-gi="${gi}">
        <button class="nav-top" onclick="toggleNavGroup(this)">${g.name}<span class="caret">▾</span></button>
        <div class="nav-menu">${items}</div>
      </div>`;
    }
  });

  /* 站标印面由 assets/logo 静态文件加载；备用墨底版为 assets/logo/xuanji-seal-ink.svg，改下行 src 即切换 */
  document.getElementById('topbar').innerHTML = `
  <div class="topbar"><div class="wrap">
    <a class="brand" href="index.html" aria-label="玄机排盘 首页">
      <span class="seal" aria-hidden="true"><img src="assets/logo/xuanji-seal.svg?v=20260914c" alt=""></span>
      <span class="wordmark"><b>玄机排盘</b><i>XUANJI&nbsp;PAIPAN</i></span>
    </a>
    <nav class="nav" id="nav">${navHtml}<button class="ai-gear" id="aiGear" title="AI 解析配置" onclick="if(window.openAiConfig)openAiConfig()">⚙ AI</button></nav>
    <button class="menu-btn" id="menuBtn" title="导航菜单" aria-expanded="false" onclick="toggleMenu()">☰</button>
  </div></div>`;

  const f = document.getElementById('footer');
  if(f){
    f.innerHTML = `<div class="wrap">
    <div class="dis">排盘结果由<a href="opensource.html" class="os-link">开源算法库</a>与自研算法共同生成，仅供文化研究与娱乐参考，请勿迷信。</div>
  </div>`;
    /* 页脚在主题容器之外，把本页主色令牌接到页脚，注记文字与页面同色 */
    const pg = document.querySelector('.page');
    if(pg){
      const cs = getComputedStyle(pg);
      ['--foot-ink','--gold2','--red'].forEach(k=>{
        const v = cs.getPropertyValue(k).trim();
        if(v) f.style.setProperty(k,v);
      });
    }
  }

  injectSkeleton();
  defaultToday();
  initPickers();
  injectBaziLinkBanner();
  injectScrollJump();
}

/* 到顶与到底：右侧边缘吸附的翻页指示。
   页面不足一屏或尚在首屏时不出现，避免首屏多一个控件；到达顶端或底端时对应那枚淡出。
   控件挂在 body 下，取不到页容器上的主题变量，故按页把主色令牌抄到自身（与页脚注记同法）；
   无 .page 容器的页面回退取 body，页面令牌块仍须把全站强调令牌族落到本页色族 */
function injectScrollJump(){
  if(document.getElementById('scrollJump')) return;
  const pg = document.querySelector('.page') || document.body;
  const el = document.createElement('div');
  el.className = 'scroll-jump';
  el.id = 'scrollJump';
  el.innerHTML = '<button type="button" class="sj-btn" data-to="top" title="回到顶部" aria-label="回到顶部">▴</button>'
               + '<button type="button" class="sj-btn" data-to="bottom" title="到页面底部" aria-label="到页面底部">▾</button>';
  document.body.appendChild(el);
  const cs = getComputedStyle(pg);
  ['--gold','--gold2','--paper'].forEach(k=>{
    const v = cs.getPropertyValue(k).trim();
    if(v) el.style.setProperty(k, v);
  });
  el.addEventListener('click', function(e){
    const b = e.target.closest('.sj-btn');
    if(!b) return;
    const toEnd = b.dataset.to === 'bottom';
    window.scrollTo({top: toEnd ? document.documentElement.scrollHeight : 0, behavior:'smooth'});
  });
  function sync(){
    const doc = document.documentElement;
    const y = window.scrollY || doc.scrollTop || 0;
    const max = doc.scrollHeight - window.innerHeight;
    el.classList.toggle('show', max > 160 && y > 120);
    el.querySelector('[data-to="top"]').disabled = y <= 8;
    el.querySelector('[data-to="bottom"]').disabled = y >= max - 8;
  }
  window.addEventListener('scroll', sync, {passive:true});
  window.addEventListener('resize', sync);
  sync();
}

/* 八字联动横幅：从八字页跳转进入（?fromBazi=1）时，在页面顶部显示命盘背景信息 + 返回八字页按钮 */
function injectBaziLinkBanner(){
  const p=new URLSearchParams(location.search);
  if(p.get('fromBazi')!=='1') return;
  const pg=document.querySelector('.page'); if(!pg) return;
  if(document.getElementById('baziLinkBanner')) return;
  const dg=p.get('dayGan')||'', yg=p.get('yearGZ')||'', sx=p.get('sex')||'', xi=(p.get('xi')||'').split(',').filter(Boolean).join('、'), ji=(p.get('ji')||'').split(',').filter(Boolean).join('、');
  const bar=document.createElement('div');
  bar.className='bazi-link-banner';
  bar.id='baziLinkBanner';
  const backBtn='<button class="btn" type="button" style="padding:3px 10px;font-size:12px;float:right" onclick="location.href=\'bazi.html\'">← 返回八字排盘</button>';
  bar.innerHTML='📌 已从<b>八字命盘</b>联动进入：日主 <b>'+dg+'</b>　年命 <b>'+yg+'</b>　'+(sx?'性别 '+sx+'　':'')+'喜用【'+(xi||'未明')+'】　忌神【'+(ji||'未明')+'】。'+backBtn+'<div style="clear:both"></div>';
  pg.insertBefore(bar, pg.firstChild);
}

/* 顶栏菜单开合：按钮形制与文案随开合态切换（☰ 收起、✕ 展开），供窄屏导航面板用 */
function toggleMenu(){
  const nav = document.querySelector('.topbar nav.nav'), btn = document.getElementById('menuBtn');
  if(!nav) return;
  const open = nav.classList.toggle('open');
  if(btn){ btn.textContent = open ? '✕' : '☰'; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
}

function toggleNavGroup(btn){
  const grp = btn.parentElement;
  const open = grp.classList.contains('open');
  document.querySelectorAll('.nav-group.open').forEach(g=>g.classList.remove('open'));
  if(!open) grp.classList.add('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.nav-group')) document.querySelectorAll('.nav-group.open').forEach(g=>g.classList.remove('open'));
});

/* 五行 → css class */
const WX_CLASS = {'木':'wx-mu','火':'wx-huo','土':'wx-tu','金':'wx-jin','水':'wx-shui'};
const GAN_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const ZHI_WX = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};

/* 上色引擎原语（wxOfChar / wxSpan / wxColorSpan / gzColorSpan / nayinWx / nayinColorSpan，
   及 gzAllColorSpan / WX_WORD_DENY 主体）由 assets/xuanji-lib.js 统一提供，全站统一调用；
   本文件仅保留框架级常量 WX_CLASS / GAN_WX / ZHI_WX。 */
/* 句末标点归一：去掉结尾已有的句末标点（。？！；：、，.），补一个中文句号。
   用于“补充说明”类独立小注，从顶层杜绝“符号多/没有”的不一致。 */
function endDot(s){
  if(s==null) return s;
  s=(''+s).replace(/\s+$/,'');
  s=s.replace(/[。？！；：、，．.]+$/,'');
  return s+'。';
}
/* 上色引擎主体（gzAllColorSpan / WX_WORD_DENY）由 assets/xuanji-lib.js 统一提供，全站统一调用。 */

/* 神煞吉凶分类：吉神 / 凶煞 / 中性（其余）。用于四柱表与详情着色 */
const SHA_JI = ['天乙贵人','文昌贵人','禄神','太极贵人','福星贵人','天厨贵人','学堂','词馆','国印贵人','金舆','暗禄','天医','德秀贵人','红鸾','天喜','月德贵人','月德合','天德贵人','天赦','三奇贵人','天德合','十灵日','六秀日'];
const SHA_XIONG = ['羊刃','飞刃','红艳煞','流霞','血刃','劫煞','灾煞','亡神','孤辰','寡宿','丧门','吊客','破碎煞','勾煞','绞煞','天罗','地网','十恶大败','八专','九丑','孤鸾','阴差阳错','四废','童子','元辰','披麻','天转','地转'];
function shaCat(n){ const base=(n||'').replace(/（[^）]+）$/,''); if(SHA_JI.indexOf(base)>=0) return 'ji'; if(SHA_XIONG.indexOf(base)>=0) return 'xiong'; return 'neutral'; }

function pad2(n){return (n<10?'0':'')+n;}

/* ===== 共享自定义日期、时间选择器 =====
   Chrome DevTools 响应式模式下原生日期时间选择器无法弹出，此处自建弹层。
   同时把所有"空"的日期、时间输入默认值设为当天、当前时间。 */
(function(){
  let mask, body;

  /* 当前页面的主题后缀（wnl 等）：日期图标与日期弹框共用同一份，免两处各写一份页面清单 */
  function pageThemeSuffix(){
    const el=document.querySelector('.page-wnl,.page-lhl,.page-foli,.page-daoli,.page-zeri,.page-hj,.page-hh,.page-bazi,.page-zw,.page-tieban,.page-nm,.page-xz,.page-qz,.page-qm,.page-dlr,.page-ty,.page-ly,.page-mh,.page-xlr,.page-lq,.page-tr,.page-ln,.page-ms,.page-xx,.page-ts,.page-fs,.page-fy,.page-hl,.page-zl,.page-yq,.page-sx,.page-mian');
    const c=el ? [...el.classList].find(x=>/^page-/.test(x)) : '';
    return c ? c.slice(5) : '';
  }
  /* 暴露给自绘下拉（文末另一 IIFE）复用同一份页面清单，免两处各写一份 */
  window.pageThemeSuffix = pageThemeSuffix;

  function ensureDom(){
    if(mask) return;
    mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.id = 'dtMask';
    mask.innerHTML = `<div class="modal dt-modal"><span class="close" id="dtClose">×</span><div id="dtBody"></div></div>`;
    /* 日期选择弹框主题：按当前页面的主题类（page-wnl 等）给弹框加 dtm-* 标识，由 style.css 的 dtm-* 段统一着色 */
    const t=pageThemeSuffix();
    if(t) mask.firstElementChild.classList.add('dtm-'+t);
    document.body.appendChild(mask);
    mask.addEventListener('click', e=>{ if(e.target===mask) closePicker(); });
    document.getElementById('dtClose').addEventListener('click', closePicker);
  }
  function closePicker(){ if(mask) mask.classList.remove('show'); }
  window.closePicker = closePicker;

  /* 说明弹窗主题：各页的说明、历史、宫位详情弹窗自建后挂到 body，不在页容器内，
     故由这里按页面主题类补 dtm-* 标识，与日期弹框共用同一套令牌与样式。
     弹窗有的先插入、后写内容，故连子树一并观察；日期弹框与 AI 配置弹窗各有自己的边框规则，跳过。 */
  function themeModal(maskEl){
    const m = maskEl.querySelector(':scope > .modal');
    if(!m || m.classList.contains('dt-modal') || m.classList.contains('ai-cfg')) return;
    const t = pageThemeSuffix();
    if(t) m.classList.add('dtm-'+t);
  }
  function themeAllModals(){
    document.querySelectorAll('.modal-mask').forEach(themeModal);
  }
  themeAllModals();
  new MutationObserver(muts=>{
    for(const mu of muts){
      for(const n of mu.addedNodes){
        if(n.nodeType!==1 || !n.classList || !n.classList.contains) continue;
        if(n.classList.contains('modal-mask')) themeModal(n);
        else if(n.classList.contains('modal') && n.parentElement && n.parentElement.classList.contains('modal-mask')) themeModal(n.parentElement);
      }
    }
  }).observe(document.body, {childList:true, subtree:true});

  /* 安全构造 Date：规避 JS 引擎对公元 0-99 年自动映射为 1900-1999 的缺陷。
     setFullYear() 不受该偏移影响，故对 <100 的年份用 setFullYear 校正。 */
  function safeDate(y, m, d, h, mi, s){
    const dt = new Date(y, m-1, d, h||0, mi||0, s||0);
    if(y>=0 && y<100) dt.setFullYear(y);
    return dt;
  }
  window.safeDate = safeDate;
  function todayStr(){ const n=new Date(); return `${n.getFullYear()}-${pad2(n.getMonth()+1)}-${pad2(n.getDate())}`; }

  function openDatePicker(input){
    ensureDom();
    let val = input.value || todayStr();
    let parts = val.split('-').map(Number);
    let y = parts[0], m = parts[1];
    if(!y || !m){ const n=new Date(); y=n.getFullYear(); m=n.getMonth()+1; }
    renderDate(y,m,input);
    mask.classList.add('show');
  }
  function renderDate(y,m,input){
    const tStr = todayStr();
    const first = safeDate(y, m, 1);
    const lead = (first.getDay()+6)%7;
    const days = safeDate(y, m+1, 0).getDate();
    let cells = '';
    for(let i=0;i<lead;i++) cells += `<div class="dt-cell empty"></div>`;
    for(let d=1; d<=days; d++){
      const ds = `${y}-${pad2(m)}-${pad2(d)}`;
      const isT = ds===tStr;
      cells += `<div class="dt-cell${isT?' today':''}" data-d="${ds}">${d}</div>`;
    }
    const wd = ['一','二','三','四','五','六','日'];
    const moOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}"${i+1===m?' selected':''}>${i+1}月</option>`).join('');
    body = document.getElementById('dtBody');
    /* 头部：«» 年步进、‹› 月步进（跨年自动进位），中间为可直输年份与月份下拉 */
    body.innerHTML = `<div class="dt-head">
        <button data-act="y-" type="button" title="上一年">«</button>
        <button data-act="m-" type="button" title="上个月">‹</button>
        <input type="number" id="dtYear" class="dt-year" value="${y}" min="1" max="9999" title="输入年份(1~9999)" data-y="${y}">
        <select id="dtMonth" class="dt-month">${moOpts}</select>
        <button data-act="m+" type="button" title="下个月">›</button>
        <button data-act="y+" type="button" title="下一年">»</button></div>
      <div class="dt-week">${wd.map(w=>`<span>${w}</span>`).join('')}</div>
      <div class="dt-grid">${cells}</div>`;
    body.querySelector('.dt-head').addEventListener('click', e=>{
      const act = e.target.getAttribute('data-act');
      if(!act) return;
      let ny = y, nm = m;
      if(act==='y-') ny = Math.max(1, y-1);
      else if(act==='y+') ny = Math.min(9999, y+1);
      else if(act==='m-'){ nm = m-1; if(nm<1){ nm = 12; ny = Math.max(1, y-1); } }
      else if(act==='m+'){ nm = m+1; if(nm>12){ nm = 1; ny = Math.min(9999, y+1); } }
      if(ny!==y||nm!==m){ renderDate(ny, nm, input); return; }
    });
    const yrInp = body.querySelector('#dtYear');
    yrInp.addEventListener('change',()=>{
      let ny=parseInt(yrInp.value,10);
      if(isNaN(ny)||ny<1) ny=1; if(ny>9999) ny=9999;
      renderDate(ny, m, input);
    });
    body.querySelector('#dtMonth').addEventListener('change', function(){
      renderDate(y, parseInt(this.value,10), input);
    });
    body.querySelectorAll('.dt-cell[data-d]').forEach(c=>{
      c.addEventListener('click', ()=>{
        input.value = c.getAttribute('data-d');
        input.dispatchEvent(new Event('change',{bubbles:true}));
        closePicker();
      });
    });
  }

  function openTimePicker(input){
    ensureDom();
    let h = new Date().getHours(), mi = new Date().getMinutes();
    if(input.value){ const p = input.value.split(':'); h=Number(p[0]); mi=Number(p[1]); }
    renderTime(h, mi, input);
    mask.classList.add('show');
  }
  function renderTime(h, mi, input){
    body = document.getElementById('dtBody');
    let hrs='', mins='';
    for(let i=0;i<24;i++) hrs += `<div class="dt-opt${i===h?' on':''}" data-h="${i}">${pad2(i)}</div>`;
    for(let i=0;i<60;i++)   mins += `<div class="dt-opt${i===mi?' on':''}" data-mi="${i}">${pad2(i)}</div>`;
    body.innerHTML = `<div class="dt-head"><div class="dt-title">选择时间</div></div>
      <div class="dt-time"><div class="dt-col" id="dtH">${hrs}</div><div class="dt-col" id="dtM">${mins}</div></div>`;
    const hc = body.querySelector('#dtH'), mc = body.querySelector('#dtM');
    hc.querySelectorAll('.dt-opt').forEach(o=>o.addEventListener('click',()=>{
      h = Number(o.getAttribute('data-h'));
      hc.querySelectorAll('.dt-opt').forEach(x=>x.classList.remove('on')); o.classList.add('on');
      input.value = `${pad2(h)}:${pad2(mi)}`;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }));
    mc.querySelectorAll('.dt-opt').forEach(o=>o.addEventListener('click',()=>{
      mi = Number(o.getAttribute('data-mi'));
      mc.querySelectorAll('.dt-opt').forEach(x=>x.classList.remove('on')); o.classList.add('on');
      input.value = `${pad2(h)}:${pad2(mi)}`;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }));
  }

  /* 调用当天：把空的日期、时间输入设为今天、当前时间 */
  window.defaultToday = function(){
    document.querySelectorAll('input[type="text"].dt-input').forEach(inp=>{ if(!inp.value) inp.value = todayStr(); });
    document.querySelectorAll('input[type="time"]').forEach(inp=>{
      if(!inp.value){ const n=new Date(); inp.value = `${pad2(n.getHours())}:${pad2(n.getMinutes())}`; }
    });
  };

  /* 为每个原生 date/time 输入追加外部弹出图标，并将输入置为只读（禁用原生日历，仅通过自建弹层修改） */
  window.initPickers = function(){
    document.querySelectorAll('input[type="text"].dt-input,input[type="time"]').forEach(inp=>{
      if(inp.dataset.pk) return;
      inp.dataset.pk = '1';
      inp.classList.add('dt-input');
      inp.readOnly = true;
      const wrap = document.createElement('span');
      const t = pageThemeSuffix();
      wrap.className = 'dt-wrap' + (t ? ' dtm-'+t : '');
      inp.parentNode.insertBefore(wrap, inp);
      wrap.appendChild(inp);
      const ic = document.createElement('span');
      ic.className = 'dt-ic';
      const isTime = inp.type==='time';
      ic.textContent = isTime ? '🕐' : '📅';
      ic.setAttribute('role','button');
      ic.setAttribute('aria-label', isTime ? '选择时间' : '选择日期');
      wrap.appendChild(ic);
      const open = ()=>{ if(isTime) openTimePicker(inp); else openDatePicker(inp); };
      ic.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); open(); });
      inp.addEventListener('click', e=>{ e.preventDefault(); open(); });
    });
  };

  /* 骨架屏：日历网格加载占位（JS 渲染前显示，render() 自动替换） */
  window.injectSkeleton = function(){
    const grid = document.getElementById('calGrid');
    if(!grid || grid.children.length) return;
    const wds = ['一','二','三','四','五','六','日'];
    let html = wds.map(w => `<div class="sk-cell wd"></div>`).join('');
    for(let r=0;r<6;r++){
      for(let c=0;c<7;c++) html += '<div class="sk-cell"></div>';
    }
    grid.innerHTML = html;
  };
})();

/* ===== 全站刷新机制（顶层）：刷新后位置不变、输入不变、结果按恢复的输入重出 =====
   滚动位置与表单输入由顶层统一快照与恢复，
   折叠态仍由各页按模块与 details 清单自管。整页退出：<html data-xj-refresh="off">。 */
(function(){
  try{
    if(document.documentElement&&document.documentElement.dataset.xjRefresh==='off') return;
    if('scrollRestoration' in history){ try{ history.scrollRestoration='manual'; }catch(e){} }
    var page=(location.pathname.split('/').pop()||'index').replace(/\.html?$/,'')||'index';
    var K_S='xj:scroll:'+page, K_F='xj:form:'+page;
    function rd(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
    function wr(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
    function pos(){ return String(Math.max(0,window.scrollY||window.pageYOffset||0)); }

    /* 滚动位置：节流记录，离开前补记；回填期间不记，免得把回填途中的中间位置当成用户位置 */
    var st=null, filling=false;
    window.addEventListener('scroll',function(){
      if(filling) return;
      clearTimeout(st); st=setTimeout(function(){ wr(K_S,pos()); },200);
    },{passive:true});
    window.addEventListener('pagehide',function(){ wr(K_S,pos()); });

    /* 表单快照：有 id 的输入控件，排除无稳定标识与不宜留存者 */
    function fields(){
      return Array.prototype.filter.call(document.querySelectorAll('input[id],select[id],textarea[id]'),function(el){
        if(el.type==='file'||el.type==='password') return false;
        return !el.hasAttribute('data-norefresh');
      });
    }
    function val(el){ return (el.type==='checkbox'||el.type==='radio')?el.checked:el.value; }
    var ft=null;
    function saveForm(){
      var o={};
      fields().forEach(function(el){ o[el.id]=val(el); });
      wr(K_F,JSON.stringify(o));
    }
    document.addEventListener('input',function(){ clearTimeout(ft); ft=setTimeout(saveForm,250); },true);
    document.addEventListener('change',function(){ clearTimeout(ft); ft=setTimeout(saveForm,250); },true);
    window.addEventListener('pagehide',saveForm);

    /* select 赋值守卫：仅当快照值在当前选项列表中确有对应项时才赋。
       否则保持页面既有取值，典型两种情形：① 快照里固化了空串（省/市下拉无空选项，
       直接赋会把 selectedIndex 打成 -1、显示为空白）；② 上级下拉尚未级联出本级选项。
       注意：区县级下拉首项 value="" 表示"全市"，属合法取值，能匹配故不受影响。 */
    function selHas(el,v){
      if(el.tagName!=='SELECT') return true;
      for(var i=0;i<el.options.length;i++) if(el.options[i].value===v) return true;
      return false;
    }
    function fire(el){
      try{ el.dispatchEvent(new Event('input',{bubbles:true})); }catch(e){}
      try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
    }
    function restore(){
      var changed=[],raw=rd(K_F);
      /* 结果重出：页面自注册的钩子优先，其次复用附加功能模块已注册的 recast，均无则逐项派发变更事件 */
      var hook=(typeof window.xjRefreshHook==='function')?window.xjRefreshHook
              :((typeof window.xjRecast==='function')?function(){ window.xjRecast(); }:null);
      if(raw){
        try{
          var o=JSON.parse(raw);
          fields().forEach(function(el0){
            var id=el0.id;
            if(!(id in o)) return;
            var el=document.getElementById(id)||el0;  /* 变更处理器可能已重建控件，按 id 重新取 */
            var v=o[id];
            if(el.type==='checkbox'||el.type==='radio'){
              if(el.checked!==v){ el.checked=v; changed.push(el); if(!hook) fire(el); }
            }else if(el.value!==String(v)&&selHas(el,String(v))){
              el.value=String(v); changed.push(el);
              /* 级联下拉（省/市/区县）必须"赋一个、派发一个"，按 DOM 顺序逐级推进：
                 下级的选项由上级 change 处理器重建，若先全部赋值再统一派发，
                 下级取值在旧选项里匹配不上会被守卫跳过而丢失（表现即刷新后城市/区县变空白）。
                 有重排钩子的页面（ai.js 挂了 window.xjRecast）结果重排仍交给钩子，
                 但 select 依旧逐项派发，级联属表单内部依赖，钩子不会替下拉重建下级的选项。 */
              if(!hook||el.tagName==='SELECT') fire(el);
            }
          });
        }catch(e){}
      }
      if(hook){ try{ hook(changed); }catch(e){} }
      var sy=parseInt(rd(K_S)||'0',10);
      var raf=(window.requestAnimationFrame&&window.requestAnimationFrame.bind(window))||function(f){ setTimeout(f,16); };
      /* 位置回填：刷新后结果区与折叠区是整块重建的，重建途中文档高度先塌后长，
         塌陷那一刻浏览器会把滚动位置钳到当时的文档末尾，位置就此丢失（实测阳宅页高由 41013
         塌到 11570，位置被钳到 10726，铺回 24771 后停在 10726）。
         故按帧持续回填整个重建窗口，而不是落点一到就收手；
         用户自行滚动即让位：位置与目标不符而文档高度未变，即判为用户滚动，停止回填。 */
      if(sy>0){
        var until=Date.now()+2500, lastH=0;
        var stop=function(){
          filling=false;
          window.removeEventListener('wheel',bail); window.removeEventListener('touchstart',bail);
          window.removeEventListener('keydown',bail); window.removeEventListener('mousedown',bail);
        };
        var bail=function(){ if(filling) stop(); };
        window.addEventListener('wheel',bail,{passive:true});
        window.addEventListener('touchstart',bail,{passive:true});
        window.addEventListener('keydown',bail);
        window.addEventListener('mousedown',bail);
        filling=true;
        (function fill(){
          if(!filling) return;
          var h=document.documentElement.scrollHeight;
          var aim=Math.min(sy,Math.max(0,h-window.innerHeight));
          if(h===lastH&&Math.abs(window.scrollY-aim)>8){ stop(); return; }
          window.scrollTo(0,aim);
          lastH=h;
          if(Date.now()>until){ stop(); return; }
          raf(fill);
        })();
      }
    }
    if(document.readyState==='complete') setTimeout(restore,0);
    else window.addEventListener('load',function(){ setTimeout(restore,0); });
    window.xjRefreshTakeover=true;
  }catch(e){}
})();

/* ===== 窄屏表格滚动兜底（顶层）：每表在窄屏都归入一个 .tbl-hs 滚动容器 =====
   移动端表格列宽契约按内容定宽，列宽之和因此可能超出视口：
   已有横向滚动容器且该容器只装本表的，就地挂名 .tbl-hs；容器夹带表格外内容的，以及无容器的表，
   一律在表格外补一层只装该表的 .tbl-hs，横滑范围即表格本身，不牵动标题与正文。
   列宽契约的 CSS 因此只认 .tbl-hs 一层，通用样式区不写任何页级类名。
   宽屏一律除名或解包还原；仅窄屏包裹一层，页面脚本取到的仍是原 table 元素本身。
   甲型键值表另加 .tbl-kv 标记（表取满容器、值列折行），与数据表的按内容定宽契约分道。
   🔴 处理状态挂在 table 元素自身，重复 fit 对已处理的表不再动结构：
   本机制自身改 DOM 会触发 MutationObserver，若每轮都解包重包，滚动容器被反复重建，
   横向滚动条随之闪烁且拖不动（滚动位置每轮归零），故幂等是本机制的硬要求。 */
(function(){
  var W = 640, timer = null, busy = false, mo = null;
  /* 只装本表的容器：容器内除该表外不得有元素或非空文本。
     容器同时装着盘面标题、折叠摘要或整段正文时（阳宅 .fs-tbl-scroll 与标题同层、
     皇极经世 details.hj-ref 与摘要和正文同层、奇门与姓名 .mod-body 与整个模块同层），
     横滑会把表格外的文字一并拖动，故这类容器不予认领。 */
  function pureHost(p, tb){
    var n = p.firstChild;
    while(n){
      if(n.nodeType === 3){ if(n.nodeValue.trim()) return false; }
      else if(n.nodeType === 1){ if(n !== tb) return false; }
      n = n.nextSibling;
    }
    return true;
  }
  /* 已有的横向滚动容器：按计算样式向上找，不写页级类名，故各页容器改名不影响本机制 */
  function scrollHost(el){
    var p = el && el.parentNode, n = 0;
    while(p && p.nodeType === 1 && n < 6){
      var ov = window.getComputedStyle(p).overflowX;
      if((ov === 'auto' || ov === 'scroll') && pureHost(p, el)) return p;
      p = p.parentNode; n++;
    }
    return null;
  }
  /* 甲型键值表标记：无表头行、每行首格是属性名、列数不超过三，判定口径与样式表窄屏契约同源。
     此类表的值列随屏折行、表取满容器宽，不参与按内容定宽的数据表契约：
     内容宽往往只超出容器数十像素，照数据表取 max-content 表宽会为这点宽度长出横向滚动条
     （实测占星三要素溢出 51px、速览表溢出 110px）。标记值未变时不写属性，故不惊动 MutationObserver。 */
  function kv(tb){
    var rows = tb.rows, yes = true;
    if(tb.tHead || !rows.length) yes = false;
    else for(var i = 0; i < rows.length; i++){
      var c = rows[i].cells;
      if(!c.length || c.length > 3 || c[0].tagName !== 'TH'){ yes = false; break; }
    }
    tb.classList.toggle('tbl-kv', yes);
  }
  /* 还原：解包自建层、撤掉挂名，只在档位切换时执行一次 */
  function release(tb){
    var host = tb.__xjHost;
    if(!host) return;
    if(tb.__xjMade && host.parentNode){ host.parentNode.insertBefore(tb, host); host.parentNode.removeChild(host); }
    else { host.classList.remove('tbl-hs'); host.style.removeProperty('--xj-cap'); }
    tb.__xjHost = null; tb.__xjMade = false;
  }
  /* 挂滚动容器：已有容器就地挂名，无容器才补一层 */
  function mount(tb){
    var h = scrollHost(tb);
    if(h){ h.classList.add('tbl-hs'); tb.__xjHost = h; tb.__xjMade = false; return; }
    var p = tb.parentNode;
    if(!p) return;
    var box = document.createElement('div');
    box.className = 'tbl-hs';
    p.insertBefore(box, tb);
    box.appendChild(tb);
    tb.__xjHost = box; tb.__xjMade = true;
  }
  /* 列宽上限按容器实宽动态判定：上限写死在 CSS 里会给不出容器真实可用宽（页内左右内距各页不同，
     70vw 在 390 视口只给出 273px，而容器实有 304px，白丢 31px 令长文列多折一行），
     故由本机制量出容器可用宽写进 --xj-cap，交由 .xj-tc 取用；量不到时回落 CSS 里的静态上限。
     键值表的键列按内容定宽、不参与上限，故上限取容器可用宽减去键列实宽：
     表宽即键列与值列之和，恰等于容器宽，既不横滑也不把键列压到折行（实测六爻键列被压到 66px、
     四字键名断成三加一）。 */
  function cap(tb){
    var host = tb.__xjHost;
    if(!host) return;
    var avail = host.clientWidth;
    var kvTb = tb.classList.contains('tbl-kv');
    /* 上限落在值列上，故内距取值列（键值表的第二格），其余表取首格 */
    var c = (kvTb && tb.rows.length && tb.rows[0].cells[1]) || tb.querySelector('th,td');
    if(!avail || !c){ host.style.removeProperty('--xj-cap'); return; }
    var cs = window.getComputedStyle(c);
    var fs = parseFloat(cs.fontSize) || 13;
    var inner = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) +
                (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    var limit = avail - inner;
    if(kvTb && tb.rows.length) limit -= tb.rows[0].cells[0].getBoundingClientRect().width;
    /* 下限取 4 字位：列窄于四字会把四字词断成三加一（单字成行） */
    host.style.setProperty('--xj-cap', Math.round(Math.max(fs * 4, limit)) + 'px');
  }
  /* 断行策略只给撞上限的长文格：格宽已等于上限者才是折行格、才有末行孤字；未撞上限的格列宽由
     自身内容定，套上断行策略会压塌其内容宽（首列短标签整列单字成行，实测皇极经世与藏历两页中招）。 */
  function pretty(tb){
    var host = tb.__xjHost;
    if(!host) return;
    var capv = parseFloat(host.style.getPropertyValue('--xj-cap')) || 0;
    var list = tb.querySelectorAll('.xj-tc');
    for(var i = 0; i < list.length; i++){
      var b = list[i];
      if(capv) b.classList.toggle('xj-tc-pretty', b.clientWidth >= capv - 1);
      else b.classList.remove('xj-tc-pretty');
    }
  }
  /* 单元格内容层：列宽上限只能靠内容块落实，Chrome 表格布局忽略列级 max-width，
     长文列取 max-content 会整段一行（实测 444px 超屏宽），故把上限落在内容块上，
     列宽即内容块宽：短语列就是短语宽、长文列撞上限后换行。 */
  function cells(tb, on){
    var list = tb.querySelectorAll('th,td');
    for(var i = 0; i < list.length; i++){
      var c = list[i], d = c.firstElementChild;
      var has = d && d.classList && d.classList.contains('xj-tc');
      if(on){
        if(has) continue;
        var box = document.createElement('div');
        box.className = 'xj-tc';
        while(c.firstChild) box.appendChild(c.firstChild);
        c.appendChild(box);
      }else if(has){
        while(d.firstChild) c.appendChild(d.firstChild);
        c.removeChild(d);
      }
    }
  }
  function fit(){
    busy = true;
    var narrow = window.innerWidth <= W, mark = narrow ? 1 : 0;
    var list = document.querySelectorAll('table');
    for(var i = 0; i < list.length; i++){
      var tb = list[i];
      if(!tb.getClientRects().length) continue;
      kv(tb);
      if(tb.__xjFit === mark){ cells(tb, narrow); if(narrow){ cap(tb); pretty(tb); } continue; }
      if(tb.__xjFit !== undefined) release(tb);
      cells(tb, narrow);
      if(narrow){ mount(tb); cap(tb); pretty(tb); }
      tb.__xjFit = mark;
    }
    busy = false;
    /* 本轮自身造成的 DOM 变动一次丢弃，避免 MutationObserver 自激成死循环 */
    if(mo) mo.takeRecords();
  }
  function schedule(){
    if(busy) return;
    clearTimeout(timer);
    timer = setTimeout(fit, 150);
  }
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('load', schedule);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
  if(window.MutationObserver){
    mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {childList: true, subtree: true});
  }
})();

/* ===== 自绘下拉 =====
   为何不用原生下拉：其展开列表由浏览器进程绘制，取不到页面自托管的思源宋体，只能落到系统字体；
   而 Windows 自带中文字体（雅黑、等线、宋体、楷体、仿宋、黑体）都是商业字体，不可免费商用
   （雅黑著作权归北大方正，微软只拿到系统内嵌授权，方正维权积极）。
   自绘下拉不动 DOM、不复制控件样式：隐藏的（offsetParent 为 null）、动态新增的 select 一律自动生效，
        不存在“尺寸为 0 仍被接管”的脏状态。
   逃生开关：给 select 加 data-native 即保持原生。 */
(function(){
  var cur = null;

  function skip(sel){
    return !sel || sel.tagName !== 'SELECT' || sel.multiple || sel.size > 1 ||
           sel.dataset.native !== undefined;
  }
  function close(reason){
    if(!cur) return;
    if(cur.list.parentNode) cur.list.parentNode.removeChild(cur.list);
    cur = null;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
  }
  function reposition(e){
    if(!cur) return;
    /* 列表自身滚动不重定位（e.target 在列表内就是 list 自己在滚）——
       不守卫会把 maxHeight 短暂清零再重设，把 scrollTop 归 0，用户感觉就是滚不动 */
    if(e && e.target && cur.list.contains(e.target)) return;
    /* 弹框内的 select 锚点不会随窗口滚动而位移（弹框是 position:fixed 居中），
       在弹框里再做重定位会把 maxHeight 清零重设，把列表 scrollTop 抹掉——
       这是用户反馈“月份下拉无法滚动选择”的另一条根因 */
    if(cur.inModal) return;
    /* 滚动/缩放只重定位，不关闭：列表是 position:fixed，跟着视口走；
       弹框打开瞬间 Chrome 会派发 scroll（scrollbar 出现/消失），
       若直接关闭，刚展开的列表就被自灭了 */
    try{ place(cur.sel, cur.list); }catch(_){}
  }
  function onKey(e){
    if(!cur) return;
    if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); close(); }
  }
  function place(sel, list){
    var gap = 6, vh = window.innerHeight, vw = window.innerWidth;
    var r = sel.getBoundingClientRect();
    list.style.minWidth = Math.round(r.width) + 'px';
    list.style.left = '0px'; list.style.top = '0px';
    list.style.maxHeight = '';
    var w = list.offsetWidth, h = list.offsetHeight;
    /* 若 select 被祖先弹框包裹（.modal / .dt-modal / .ai-cfg），把列表也夹进该弹框内 —— 既不溢出弹框下方，
       也不从弹框上方露出，与弹框整体语言一致；弹框常带 overflow:auto，列表超出必然被裁 */
    var host = sel.closest && sel.closest('.modal,.dt-modal,.ai-cfg');
    var hb = host ? host.getBoundingClientRect() : null;
    var bottom = hb ? hb.bottom - 2 : vh;
    var topEdge = hb ? hb.top + 2 : 0;
    var below = Math.max(0, bottom - r.bottom - gap);
    var above = Math.max(0, r.top - topEdge - gap);
    var up = below < h && above > below;
    var room = Math.max(64, up ? above : below);
    if(room < h){ list.style.maxHeight = room + 'px'; h = Math.min(h, room); }
    var left = Math.min(Math.max(4, r.left), Math.max(4, vw - w - 4));
    if(hb){
      /* 水平也夹到弹框内，避免列表从弹框左右溢出 */
      left = Math.max(hb.left + 4, Math.min(left, hb.right - w - 4));
    }
    var top = up ? Math.max(topEdge, r.top - h - 2) : r.bottom + 2;
    list.style.left = left + 'px';
    list.style.top = top + 'px';
  }
  /* 只取“身份类”外观（字体、字色、底色、边框、圆角），让列表与它所属的控件同貌 */
  var PROPS = ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor',
    'borderTopWidth','borderTopStyle','borderTopColor',
    'borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'];
  function restyle(sel, list){
    var cs = getComputedStyle(sel);
    PROPS.forEach(function(p){ if(cs[p]) list.style[p] = cs[p]; });
  }
  function open(sel){
    close();
    var list = document.createElement('div');
    /* 主题标识：与日期弹框共用同一套 dtm-* 变量（--tk 等），使选中项取当前页主体色，
       而非全站写死的 --red，使各页选中项随本页主体色 */
    var tk = (window.pageThemeSuffix && window.pageThemeSuffix()) || '';
    list.className = 'sel-list' + (tk ? ' dtm-' + tk : '');
    list.setAttribute('role', 'listbox');
    /* 选项行高 = 控件行高，
       用 CSS 变量从 select 的实际高度传进来，使每行与控件同高，
       12 项 312px ≈ 弹框下方 315px，整列恰好不溢出、不必滚动；
       长列表（择日 31 项等）超出时再就地压缩滚动 */
    var rh = Math.round(sel.getBoundingClientRect().height);
    if(rh > 0) list.style.setProperty('--sel-opt-h', rh + 'px');
    restyle(sel, list);
    [].forEach.call(sel.options, function(o, i){
      var it = document.createElement('div');
      it.className = 'sel-opt' + (i === sel.selectedIndex ? ' on' : '');
      it.setAttribute('role', 'option');
      it.textContent = o.textContent;
      it.addEventListener('click', function(e){
        e.stopPropagation();
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', {bubbles:true}));
        close();
        try{ sel.focus({preventScroll:true}); }catch(_){ sel.focus(); }
      });
      list.appendChild(it);
    });
    document.body.appendChild(list);
    place(sel, list);
    var on = list.querySelector('.sel-opt.on');
    if(on && on.scrollIntoView) on.scrollIntoView({block:'nearest'});
    cur = {sel:sel, list:list, inModal: !!(sel.closest && sel.closest('.modal,.dt-modal,.ai-cfg'))};
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    /* 部分页面的 select 有 border-color 过渡（如 .hh-card .field select{transition:border-color .15s}），
       展开那一瞬取到的是过渡起始色；180ms 后按稳定值补一次，避免列表边框与控件当前边框不同色 */
    setTimeout(function(){ if(cur && cur.list === list) restyle(sel, list); }, 180);
  }
  function onDown(e){
    if(e.button !== 0) return;
    var t = e.target;
    if(cur && t && cur.list.contains(t)) return;      /* 列表内：交给它自己的 click */
    var sel = t && t.closest ? t.closest('select') : null;
    if(!sel || skip(sel)){ if(cur) close('onDown no-sel'); return; }
    e.preventDefault();                               /* 拦下原生展开 */
    try{ sel.focus({preventScroll:true}); }catch(_){ sel.focus(); }
    if(cur && cur.sel === sel){ close('toggle'); return; }
    open(sel);
  }
  document.addEventListener('mousedown', onDown, true);
  /* 键盘：聚焦到 select 后按空格、回车展开（不含下箭头，保留原生“上下键改值”） */
  document.addEventListener('keydown', function(e){
    if(cur) return;
    var sel = document.activeElement;
    if(skip(sel)) return;
    if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); open(sel); }
  }, true);
})();
