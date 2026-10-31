
    const HJ_TERMS={
    core:{title:'核心概念',items:{
    '元会运世':{short:'邵雍的大时间单位：元里有会，会里有运，运里有世，一级套一级。',detail:'1元=12会=129600年；1会=30运=10800年；1运=12世=360年；1世=30年。天地一元，周而复始。'},
    '日月星辰':{short:'元、会、运、世四层的别称：元为日、会为月、运为星、世为辰。',detail:'如一日有十二时辰，一元有十二会；日月星辰即以一天喻一元，说明大小周期同构。'},
    '皇极':{short:'至高之中道，邵雍书名所本，指大中至正的天地之道。',detail:'语出《尚书》洪范篇九畴之皇极；邵雍借以名书，谓其学建天地之中极。'},
    '以运经世':{short:'原书的编年体例：以运为经线，以世为纬线记录史事。',detail:'《皇极经世书》以运经世，自唐尧即位起编年至五代，每世三十年记一朝大事。'}
    }},
    bigua:{title:'辟卦与卦气',items:{
    '十二辟卦':{short:'十二个代表月份的卦，从复卦到坤卦，显示一年阴阳消长。',detail:'复（子）、临（丑）、泰（寅）、大壮（卯）、夬（辰）、乾（巳）、姤（午）、遁（未）、否（申）、观（酉）、剥（戌）、坤（亥），又称十二消息卦。'},
    '值卦':{short:'原书每会选五个卦轮流管运，这五个卦就叫该会的值卦。',detail:'据《皇极经世书》以元经会篇：每会值五卦、各主六运，如子会值复、颐、屯、益、震，午会值姤、大过、鼎、恒、巽。'},
    '中卦':{short:'每会五个值卦中间的那一个，正当会的一半。',detail:'原书云屯当子会之中、鼎当午会之中；中卦前后各主一半会的时间。'},
    '闰卦':{short:'乾坤坎离四个正卦不直接管运，而是当闰卦，各自闰三个会。',detail:'原书：离闰子丑寅、乾闰卯辰巳、坎闰午未申、坤闰酉戌亥；闰卦初二等爻变所生之卦亦分主时段。'},
    '运卦世卦':{short:'后世在值卦之上加的爻变层：值卦六爻变生运卦，运卦六爻变生世卦。',detail:'原书年表不逐运世配卦；传承口径为值卦一爻主一运（360年），运卦一爻主二世（60年），通行嵌套表1984至2043世卦值火风鼎。'},
    '值年卦':{short:'民间流传的一年一卦，六十年转一圈，用来看每年的大气候。',detail:'六十卦一年一卦，按通行六十卦序，主流以公元1984年（甲子）值火风鼎起：2020年明夷、2025年泽火革、2026年天火同人；另有甲子起坤、甲子起复两种变体传承。'},
    '旬卦':{short:'十年一卦的更细分层，由世卦逐爻变出，一爻主十年。',detail:'世卦六爻变，一爻主十年，六爻共六十年，恰合一世卦所主之段，故旬卦段首须自世卦所主六十年段起算，与世卦同源。如1984至2043世卦火风鼎，六爻段依次得大有、旅、未济、蛊、姤、恒。'},
    '开物闭物':{short:'一元之中天地开合的两个标记点：开物于寅会之中，闭物于戌会之中。',detail:'据原书以会经运层開物始月寅之中等语衍伸；开物约公元前四万零一十七年前后，闭物约公元四万六千三百八十四年前后；开物之前人物未生，闭物之后归于闭塞。'},
    '卦气':{short:'以卦配时令的学说，四时十二月皆有其卦。',detail:'起于西汉孟喜，邵雍先天易学进一步以六十四卦配元会运世，为皇极经世卦气之本。'},
    '先天圆图':{short:'邵雍排出的六十四卦圆形图，左半阳右半阴。',detail:'先天六十四卦方圆图：圆图象天，卦以二进制次序环列；乾尽午中，坤尽子中。自乾起顺时针行，乾至复为阳半，坤居正下，剥至姤为阴半，复当子中、姤当午中，为阴阳初生之枢纽；去乾坤坎离四正卦余六十卦值运，即会值五卦之所本。'},
    '先天方图':{short:'与圆图并称的六十四卦方形图，八八六十四格，象地。',detail:'方圆二图并称，圆图象天、方图象地：方图八八六十四格，行列各配八卦，行主下卦（内卦）、列主上卦（外卦），上半逐行自左而右、下半逐行自右而左读之，即圆图之序；对角八格为八纯卦，乾坤坎离四正居对角之四，正是不用值运之四卦。'},
    '错卦':{short:'六爻阴阳全反所得之卦，是原卦的对待，观之以见事之反面。',detail:'一卦六爻阴变阳、阳变阴即得错卦，如天风姤错地雷复。错者对待之义，与综卦、互体合称错综复杂三变。'},
    '综卦':{short:'六爻倒转所得之卦，是原卦的反易，观之以见换个立场看。',detail:'一卦倒置即得综卦，如火风鼎综泽火革，犹同一事换个立场看。颐、大过、中孚、小过与乾坤坎离等八卦倒转仍是自身，其综卦即本卦。'},
    '以物观物':{short:'邵雍学问的立脚处：去掉一己好恶，就物本身看物。',detail:'《观物内篇》云：以我观物，情也；以物观物，性也。以我观物则所见染于喜怒而偏，以物观物则所见得其本来。邵子所谓反观，即反身自照而不以己意加于物。元会运世这套大尺度历法，正是为剥掉一时一己之私见而设。'},
    '皇帝王伯':{short:'邵雍判史的四等标尺：三皇、五帝、三王、五伯。',detail:'三皇尚自然、五帝尚让、三王尚政、五伯尚争，一代不如一代。此即原书以运经世编年所寓之褒贬，读年表须并观此四等，方知邵子记事取舍之所在。'}
    }},
    dangan:{title:'大事锚点',items:{
    '锚点':{short:'历史上可考的大事年份，用来校对元会运世的位置。',detail:'列尧即位、武王克商、共和元年等六十条，各标注其元会运世定位；唐尧一条依原书纪年，余依史学通行纪年。'},
    '断代工程':{short:'夏商周断代工程的简称，给出夏商周年份的学术参考值。',detail:'如武王克商定为公元前1046年、夏朝始于约公元前2070年，从之。'}
    }}
    };
    function renderTermGloss(){
    const el=document.getElementById('termGloss'); if(!el)return;
    let h='<table class="hj-np"><tbody>';
    Object.keys(HJ_TERMS).forEach(gid=>{
    const g=HJ_TERMS[gid];
    h+='<tr><td colspan="2" class="hj-gloss-g">'+g.title+'</td></tr>';
    Object.keys(g.items).forEach(k=>{ h+='<tr><td class="hj-term-nm">'+k+'</td><td>'+g.items[k].short+'</td></tr>'; });
    });
    h+='</tbody></table>';
    el.innerHTML=h;
    }
/* ============ 工具 ============ */
function fmtRange(a,b){
  const f=x=>x>=1?('公元'+x+'年'):('公元前'+(1-x)+'年');
  return f(a)+' ～ '+f(b);
}
function fmtRangeShort(a,b){
  const f=x=>x>=1?(''+x):('前'+(1-x));
  return f(a)+' ～ '+f(b);
}
function fmtYearShort(A){ return A>=1?('公元'+A+'年'):('公元前'+(1-A)+'年前后'); }
function yinShiTxt(n){ return '世内第'+n+'年'; }
/* 卦辞取全站经文库全文；经文库未载时回落引擎摘句 */
function ciOf(nm){
  if(typeof GUA_CI!=='undefined' && GUA_CI[nm]) return GUA_CI[nm];
  const gi=HJ.guaInfo(nm); return gi&&gi.ci?gi.ci:'';
}
/* ============ 状态与入口 ============ */
let LAST=null;
let directA=null;   /* 年份直达（支持公元前）：选日期、改口径时清除 */
/* 静态首屏只含定位盘与总览，data-built 记该日月度。
   加载只补日期框值；所记日期与今日相同则只补其余结果段，不同才整页重推。 */
function initDefault(){
  const now = xjNowDate();
  const key = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  const input = document.getElementById('dInput');
  if (input) { input.value = key; input.setAttribute('value', key); }
  const out = document.getElementById('out');
  if (!out || out.getAttribute('data-built') !== key) { query(); return; }
  query(true);
}
function jumpYear(){
  const raw=document.getElementById('yInput').value.trim();
  if(!raw){ directA=null; query(); return; }   /* 未填直达年份：按所选日期推演 */
  const A=HJ.parseYearInput(raw);
  if(A==null){ document.getElementById('infoLine').textContent='年份格式无法识别，请输入如 2026、前2357、-2357，或留空改用日期推演。'; return; }
  directA=A;                                    /* 直达年份独立生效，不改写日期输入框 */
  query();
}
function onDateChange(){ directA=null; document.getElementById('yInput').value=''; query(); }
function onBoundChange(){ directA=null; query(); }   /* 改年界口径即回到日期推演 */
/* 依年界口径把所选日期解析为天文年编号 A */
function resolveA(){
  const v=document.getElementById('dInput').value; if(!v) return null;
  const p=v.split('-').map(Number); const y=p[0];
  const bound=document.getElementById('yBound').value;
  if(y<1) return {A:y, note:'公元前年份按公历口径推演'};
  if(bound==='lunar'){
    try{
      const lunar=Solar.fromYmd(y,p[1],p[2]).getLunar();
      return {A:lunar.getYear(), note:'农历'+lunar.getYearInChinese()+'年'+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()};
    }catch(e){ return {A:y, note:'该日期农历不可得，已按公历口径'}; }
  }
  if(bound==='lichun'){
    try{
      const lc=Solar.fromYmd(y,2,1).getLunar().getJieQiTable()['立春'];
      const lcN=lc.getYear()*10000+lc.getMonth()*100+lc.getDay();
      const dN=y*10000+p[1]*100+p[2];
      if(dN>=lcN) return {A:y, note:'立春（'+lc.getYear()+'-'+pad2(lc.getMonth())+'-'+pad2(lc.getDay())+'）后，属'+y+'年'};
      const lcPrev=Solar.fromYmd(y-1,2,1).getLunar().getJieQiTable()['立春'];
      return {A:y-1, note:'立春（'+lcPrev.getYear()+'-'+pad2(lcPrev.getMonth())+'-'+pad2(lcPrev.getDay())+'）前，属'+(y-1)+'年'};
    }catch(e){ return {A:y, note:'立春不可得，已按公历口径'}; }
  }
  return {A:y, note:''};
}
/* ============ 渲染 ============ */
/* 折叠态属交互态：结果区与页体折叠块的开合由本页记忆，键按页独立，localStorage 主存、sessionStorage 隐私兜底 */
function query(restOnly){
 try{
  const r=(directA!=null)?{A:directA, note:directA<1?'公元前年份按公历口径推演':''}:resolveA();
  if(r==null){ document.getElementById('out').innerHTML=''; document.getElementById('infoLine').textContent='请先选择日期或输入年份。'; return; }
  const A=r.A, L=HJ.locate(A);
  if(!L){ document.getElementById('out').innerHTML='<p class="notice">年份超出可推算范围（限公元前100万年至公元999999年）。</p>'; return; }
  const AD=L.A>=1;
  /* 农历信息行：按所选日期出农历月日，年份直达只出干支岁 */
  let lunarTxt='';
  if(AD && directA==null){
    try{
      const dv=document.getElementById('dInput').value.split('-').map(Number);
      const lunar=Solar.fromYmd(dv[0],dv[1],dv[2]).getLunar();
      lunarTxt='农历'+lunar.getYearInChinese()+'年'+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()+'（'+lunar.getYearInGanZhi()+'）';
    }catch(e){ lunarTxt=''; }
  }
  document.getElementById('infoLine').textContent=
    HJ.fmtYear(L.A)+' '+L.gz+'岁'+(lunarTxt?'　'+lunarTxt:'')+(r.note?'　口径：'+r.note:'')+'　第'+L.yuanNo+'元';
  /* 原书逐年表数据接入 */
  if(!HJ.chronHas() && typeof CHRONICLE !== 'undefined') HJ.setChronicle(CHRONICLE);
  /* --- 定位总览卡 --- */
  const yunImpl=HJ.yunGua(L), yrImpl=HJ.yearGua(L), ybImpl=HJ.yunGuaBian(L), sbImpl=HJ.shiGuaBian(L);
  /* --- 定位总览：卷首带给出四级定位句，字段流给出各级起止与内部位置 --- */
  const yuanIn=L.hui.idx*HJ.CONST.HUI+L.hui.inYear;
  const bigLine='<b>'+L.hui.zhi+'会</b> 第<b>'+L.yun.noG+'</b>运（'+L.yun.gan+'，值'+HJ.shortGuaName(yunImpl.name)+'） 第<b>'+L.shi.noG+'</b>世（'+L.shi.zhi+'） '+yinShiTxt(L.shi.inYear);
  const ovRows=[
    ['元','第'+L.yuanNo+'元　一元十二万九千六百年，本元已过'+yuanIn+'年，余'+(HJ.CONST.YUAN-yuanIn)+'年'],
    ['会',L.hui.zhi+'会　辟卦'+HJ.huiGua(L.hui.idx)+'（民间移配）　'+fmtRange(L.hui.start,L.hui.end)+'　会内第'+L.hui.inYear+'年，余'+(HJ.CONST.HUI-L.hui.inYear)+'年'],
    ['运','全元第'+L.yun.noG+'运（'+L.yun.gan+'，会内第'+L.yun.noH+'运）　值'+HJ.shortGuaName(yunImpl.name)+'　'+fmtRange(L.yun.start,L.yun.end)+'　运内第'+L.yun.inYear+'年'],
    ['世','全元第'+L.shi.noG+'世（'+L.shi.zhi+'，运内第'+L.shi.noY+'世）　'+fmtRange(L.shi.start,L.shi.end)+'　世内第'+L.shi.inYear+'年']
  ];
  if(yrImpl) ovRows.push(['值年卦',yrImpl.name+'　六十卦一年一卦，按通行六十卦序，主流以公元1984年值火风鼎起']);
  const ovInfo='<div class="hj-info">'+ovRows.map(function(r){
    return '<div class="hj-i"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>';
  }).join('')+'</div>';
  /* --- 皇极尺 --- */
  function rulerRow(label,segs,curIdx,cap){
    let h='<div class="hj-ruler-row"><div class="hj-ruler-lab">'+label+'</div><div class="hj-ruler-bar">';
    for(let i=0;i<segs;i++) h+='<div class="hj-seg'+(i<curIdx?' past':(i===curIdx?' cur':''))+'"></div>';
    return h+'</div><div class="hj-ruler-cap">'+cap+'</div></div>';
  }
  const yunInHui=L.yun.noH-1, shiInYun=L.shi.noY-1;
  const kaiA=HJ.kaiwuA(), biA=HJ.biwuA();
  const kaiTxt='开物于寅会之中（'+fmtYearShort(kaiA)+'）';
  const biTxt='、闭物于戌会之中（'+fmtYearShort(biA)+'）';
  const kaiState=(L.A<kaiA)?'所推年在开物之前（天地未开物之段）':((L.A>biA)?'所推年在闭物之后':'今在开物之后、闭物之前，天地开物期内');
  const ruler=
    rulerRow('元（129600年）',12,L.hui.idx,'本元已过'+yuanIn+'年，余'+(HJ.CONST.YUAN-yuanIn)+'年')+
    rulerRow(L.hui.zhi+'会（10800年）',30,yunInHui,L.hui.zhi+'会已过'+L.hui.inYear+'年，余'+(HJ.CONST.HUI-L.hui.inYear)+'年')+
    rulerRow('运（360年）',12,shiInYun,'本运已过'+L.yun.inYear+'年，余'+(HJ.CONST.YUN-L.yun.inYear)+'年')+
    rulerRow('世（30年）',30,L.shi.inYear-1,'本世已过'+L.shi.inYear+'年，余'+(HJ.CONST.SHI-L.shi.inYear)+'年');
  /* --- 元会运世定位盘：三层同心环，几何与样式见 hjWheel --- */
  const yunStart=L.yun.start;
  const anchors=HJ.anchors().filter(a=>a.A>=yunStart&&a.A<=yunStart+HJ.CONST.YUN-1);
  const wheelHtml=hjWheels(L,anchors);
  const anchorRows=anchors.map(a=>'<tr><td>'+a.fmt+'（'+a.gz+'）</td><td>'+a.srcTxt+'</td><td>'+a.label+'</td><td>'+a.note+'</td></tr>').join('');
  /* --- 卦气盘（据《皇极经世书》以元经会篇：每会值五卦各主六运，中卦当会之中，
         闰卦乾坤坎离四正；运卦即当运所值之卦，一卦主六运七十二世；值年卦六十卦一年一卦） --- */
  function yaoHtml(bits6){
    let h='';
    for(let i=5;i>=0;i--){
      h+=bits6[i]?('<div class="hj-yao"><div class="y yang"></div></div>'):('<div class="hj-yao"><div class="y yin"></div><div class="y yin"></div></div>');
    }
    return h;
  }
  function guaCol(nm,lab,cls,sub,badge){
    if(!nm) return '';
    const gi=HJ.guaInfo(HJ.fullGuaName(nm));
    const ci=ciOf(HJ.fullGuaName(nm));
    return '<div class="hj-gua-col'+(cls?' '+cls:'')+'"><h4><span class="hj-gua-lab">'+lab+'</span><span class="hj-gua-nm">'+nm+(badge?' <span class="hj-gua-badge">'+badge+'</span>':'')+'</span></h4>'+yaoHtml(gi.bits6)
      +(sub?'<div class="ci">'+sub+'</div>':'')
      +(ci?'<div class="ci">'+ci+'</div>':'')+'</div>';
  }
  const yg=HJ.yunGua(L), xunA=HJ.xunGuaJia(L);
  /* 组头承担体系归属与组内通则，卡内只留本卡所特有的一条判据，同一句话全盘只出现一次 */
  function guaGroup(title,note,cards){
    return '<div class="hj-gua-group"><div class="hj-gua-head"><span class="hj-gua-t">'+title+'</span><span class="hj-gua-note">'+note+'</span></div>'
      +'<div class="hj-gua-wrap">'+cards.join('')+'</div></div>';
  }
  const guaZhi=HJ.huiGua5(L.hui.idx).map(function(nm,k){
    const isCur=yg&&yg.name===nm;
    const isMid=HJ.zhongGua(L.hui.idx)===nm;
    return guaCol(nm,'会内第'+(k*6+1)+'至'+(k*6+6)+'运',isCur?'big':'',isMid?'中卦当会之中':'',isCur?'当运':'');
  });
  const leapNm=HJ.leapGua(L.hui.idx);
  guaZhi.push(guaCol(leapNm,'闰卦','','本会所闰：'+leapNm+'，'+leapNm+'闰'+HJ.LEAP_HUI[leapNm],''));
  /* 爻变推演：值卦变运卦、运卦变世卦、世卦变旬卦，一脉相承 */
  const guaBian=[
    guaCol(ybImpl.name,'运卦','','值卦'+HJ.shortGuaName(ybImpl.zhiGua)+'第'+ybImpl.yao+'爻所变'),
    guaCol(sbImpl.name,'世卦','','运卦'+HJ.shortGuaName(sbImpl.yunGua)+'第'+sbImpl.yao+'爻所变；通行嵌套表以1984至2043值此卦'),
    guaCol(xunA.name,'旬卦','','世卦'+HJ.shortGuaName(xunA.base)+'六爻变，今处第'+xunA.yao+'爻段（'+HJ.fmtYear(xunA.from)+'至'+HJ.fmtYear(xunA.to)+'）；段首自世卦所主六十年段起算，与世卦同源')
  ];
  /* 民间通行：十二辟卦配会与六十卦值年，两条并行之说 */
  const guaMin=[
    guaCol(HJ.huiGua(L.hui.idx),'辟卦','','十二消息卦配十二月、移配十二会，与值五卦分属两序列，十二会中仅子、午两会同名，彼此不可互推'),
    guaCol(yrImpl.name,'值年卦','',''+HJ.fmtYear(L.A)+'所值；主流以1984年值火风鼎起，与2012年值复的锚点逐年等价')
  ];
  const guaHtml=guaGroup('原书值运','每会五卦各主六运，中卦当会之中；四正卦不用值运，闰卦单列',guaZhi)
    +guaGroup('爻变推演','值卦逐爻变出：一爻主一运为运卦，一爻主二世为世卦，一爻主十年为旬卦；此三层属后世传承，原书年表不逐运配卦',guaBian)
    +guaGroup('民间通行','十二辟卦配会与六十卦值年，皆民间通行之说，与原书值运体系并存；两套序列各自成说，不可互推',guaMin);
  /* --- 解卦层：卦既定，则观其象、玩其辞。上下体为观象之先，互体见卦中蕴藏，
         卦辞定一卦之总纲、爻辞定一爻之时位；经文取自全站通用经文库，与他页同源。 --- */
  const YAO_POS=['初','二','三','四','五','上'];
  /* 爻题通例：初、上两位位名在前（初九、上六），二三四五四位九六在前（九二、六五） */
  const yaoName=(p,b)=>(p==='初'||p==='上')?(p+(b?'九':'六')):((b?'九':'六')+p);
  /* 取经文：卦辞、大象、爻辞、小象，键名与全站经文库一致 */
  function jw(g,pos){
    if(typeof GUA_CI==='undefined') return {ci:'',dax:'',yao:'',xiaoxiang:''};
    return {ci:GUA_CI[g]||'', dax:(typeof GUA_DAXIANG!=='undefined'?GUA_DAXIANG[g]:'')||'',
            yao:pos&&typeof YAO_CI!=='undefined'?(YAO_CI[g+pos]||''):'',
            xiaoxiang:pos&&typeof YAO_XIAOXIANG!=='undefined'?(YAO_XIAOXIANG[g+pos]||''):''};
  }
  /* 解卦一行：卦名（上下体 + 互体）+ 卦辞 + 所主爻位之爻辞 */
  function jieBlock(nm,lab,yaoIdx,yaoDesc){
    if(!nm) return '';
    const gi=HJ.guaInfo(HJ.fullGuaName(nm)); if(!gi) return '';
    const hu=gi.hu;
    const j=jw(gi.name, yaoIdx?YAO_POS[yaoIdx-1]:'');
    const bit=yaoIdx?gi.bits6[yaoIdx-1]:0;
    let rows='<tr><td>上下体</td><td>'+gi.lsym+'　'+gi.lower+'下'+gi.upper+'上，即'+gi.lower+'为下体、'+gi.upper+'为上体。上下二体是观象之先：下体主内、主始、主己，上体主外、主终、主人。</td></tr>';
    if(hu) rows+='<tr><td>互体</td><td>'+hu.lowSym+'　'+hu.low+'下'+hu.up+'上，二三四爻成'+hu.low+'、三四五爻成'+hu.up+'，两互相重得'+hu.name+'。互体是卦中蕴藏之象，京房以来解卦通例，主事情中途的转折与内含之机。</td></tr>';
    /* 错卦与综卦：错者六爻阴阳全反，综者六爻倒转，与互体合称错综复杂三变。
       颐、大过、中孚、小过四卦倒转仍是自身（综同本卦），乾、坤、坎、离等八卦亦然，表中直书本卦。 */
    const cz=HJ.cuoZong(gi.name);
    if(cz){
      const cg=HJ.guaInfo(cz.cuo), zg=HJ.guaInfo(cz.zong);
      const same=cz.zong===gi.name?'倒转仍是自身，故综卦即本卦':'倒转成'+cz.zong;
      rows+='<tr><td>错卦</td><td>'+cz.cuo+'（'+(cg?cg.lsym+'　'+cg.lower+'下'+cg.upper+'上':'')+'）：六爻阴阳全反，是一卦之对待，观之以见事之反面。</td></tr>';
      rows+='<tr><td>综卦</td><td>'+cz.zong+'（'+(zg?zg.lsym+'　'+zg.lower+'下'+zg.upper+'上':'')+'）：'+same+'，是一卦之反易，观之以见换个立场看。</td></tr>';
    }
    if(j.dax) rows+='<tr><td>大象</td><td>'+j.dax+'</td></tr>';
    if(yaoIdx&&j.yao) rows+='<tr><td>'+yaoName(YAO_POS[yaoIdx-1],bit)+'爻辞</td><td>'+j.yao+(j.xiaoxiang?('　小象：'+j.xiaoxiang):'')+'（'+yaoDesc+'）</td></tr>';
    return '<div class="hj-jie"><h4>'+lab+'　'+gi.name+'</h4>'
      +'<table class="hj-np"><tbody>'+rows+'</tbody></table></div>';
  }
  /* 吉凶判语：只判卦象之刚柔消息与宜忌之理，不断个人祸福。辞必依卦爻辞与象义，不作凭空断语 */
  function panYu(nm){
    if(!nm) return '';
    const gi=HJ.guaInfo(HJ.fullGuaName(nm)); if(!gi) return '';
    const b=gi.bits6;
    const yang=b.reduce((s,x)=>s+x,0);
    /* 刚柔消息：以六爻阴阳多少与当位与否立论，此邵子观物之本法 */
    const dang=b.map((x,i)=>((i%2===0)===(x===1))).filter(Boolean).length;
    let qixiang;
    if(yang===6) qixiang='六爻纯阳，刚健之极';
    else if(yang===0) qixiang='六爻纯阴，柔顺之极';
    else if(yang>=4) qixiang='阳爻'+yang+'、阴爻'+(6-yang)+'，刚盛于柔';
    else if(yang<=2) qixiang='阳爻'+yang+'、阴爻'+(6-yang)+'，柔盛于刚';
    else qixiang='阳爻'+yang+'、阴爻'+(6-yang)+'，刚柔相均';
    const j=jw(gi.name,'');
    const ci=j.ci;
    const good=[];
    if(/元/.test(ci)) good.push('元');
    if(/亨/.test(ci)) good.push('亨');
    if(/利/.test(ci)) good.push('利');
    if(/吉/.test(ci)) good.push('吉');
    const bad=/凶|咎|厉|吝|悔|桡|眚|灾|勿用|不利/.test(ci);
    let yiJi='';
    if(good.length) yiJi+='卦辞见'+good.join('、')+'，宜顺势有为';
    if(bad) yiJi+=(yiJi?'；':'')+'戒象并见，宜守正慎动';
    if(!yiJi) yiJi='卦辞平实，宜静观其变';
    return '<tr><td>'+gi.name+'</td><td>'+qixiang+'，六爻中当位者'+dang+'爻；'+yiJi+'。</td></tr>';
  }
  const jieHtml=
    '<h3 class="rel-title">解卦：观象玩辞</h3>'
    +'<div class="sub-note">卦既定，次第有四：先看上下二体，次看互体，再看错卦与综卦，末玩卦爻辞。上下体定内外始终，互体见其中藏，错卦见事之反面、综卦见换个立场看（错综与互体合称错综复杂三变），卦辞总断一卦之德（卦辞已见卦气盘各卡内，此处不重出），爻辞分断一爻之时位。卦爻辞皆《周易》本经原文。</div>'
    +jieBlock(yg.name,'本运值卦',(L.yun.noG-1)%6+1,'值卦每爻主一运（后世传承），本运即此爻所主，故取此爻')
    +jieBlock(ybImpl.name,'运卦',ybImpl.yao,'运卦由值卦逐爻变出，本运正当其第'+ybImpl.yao+'爻')
    +jieBlock(sbImpl.name,'世卦',sbImpl.yao,'世卦一爻主二世六十年，本世正当其第'+sbImpl.yao+'爻')
    +jieBlock(xunA.name,'旬卦',xunA.yao,'旬卦一爻主十年，这一旬正当其第'+xunA.yao+'爻（'+HJ.fmtYear(xunA.from)+'至'+HJ.fmtYear(xunA.to)+'）')
    +jieBlock(yrImpl.name,'值年卦','','值年卦一年一卦，不别爻位')
    +'<h3 class="rel-title">吉凶判语</h3>'
    +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>卦</th><th>判语</th></tr></thead><tbody>'
    +panYu(yg.name)+panYu(yrImpl.name)
    +'</tbody></table></div>'
    +'<div class="sub-note">卦爻辞是《周易》本经原文，讲的是人事；皇极经世以卦配时段，讲的是气象。两套读法可以相参，但不是邵雍本旨。判语只就卦象刚柔消息与卦爻辞立论，说时段气象的宜忌，不断个人祸福；人事进退仍以现实情势与专业意见为准。</div>';
  /* --- 原书逐年表（折叠框） --- */
  let chronHtml='';
  if(window.HJ_CHRONICLE && window.HJ_CHRONICLE.length){
    const span=HJ.chronSpan();
    const CHRON_LAST_YUN=span.maxYun;
    const filterOn=window.__hjChronFilter||false;
    if(L.A>=span.minA&&L.A<=span.maxA){
      const rows=HJ.chronYun(L.yun.noG);
      const evRows=rows.filter(r=>r.t);
      const show=filterOn?evRows:rows;
      chronHtml='<details class="hj-ref" id="hjChronFold"><summary>原书逐年表（以运经世）</summary>'
        +'<div class="hj-nav"><button class="btn" onclick="navChron(-1)">上一运</button><button class="btn" onclick="navChron(1)">下一运</button><button class="btn" onclick="toggleChronFilter()">'+(filterOn?'显示全部干支年':'只看有记事之年')+'</button></div>'
        +'<table class="hj-np hj-chron"><colgroup><col class="c1"><col class="c2"><col></colgroup><tbody>'
        +show.map(r=>{
          const curCls=(r.A===L.A)?' class="hj-row-shi"':'';
          return '<tr'+curCls+'><td>'+HJ.fmtYear(r.A)+'</td><td>'+r.gz+'</td><td>'+(r.t||(filterOn?'':'（原书无记事）'))+'</td></tr>';
        }).join('')
        +'</tbody></table>'
        +(evRows.length?'':'<div class="sub-note">本运原书无记事。</div>')
        +(L.yun.noG===CHRON_LAST_YUN?'<div class="sub-note">本运为原书年表之末运。原书成于宋，以运经世止于后周显德六年己未（公元959），即本运第296年；本运余下六十余年原书未载，非缺漏。邵雍生于公元1011、卒于1077，已在年表之外，故年表中查不到邵雍本人。</div>':'')
        +'</details>';
    }else{
      chronHtml='<details class="hj-ref" id="hjChronFold"><summary>原书逐年表（以运经世）</summary>'
        +'<div class="sub-note">所推年份（'+HJ.fmtYear(L.A)+'）在年表范围外，已代显原书首运。原书年表起帝尧甲辰（公元前2357，巳会第180运）讫后周显德六年己未（公元959，第'+span.maxYun+'运）；书成于宋，止于五代，宋初以后原书不载，故邵雍本人（1011至1077）亦在表外。可点下方按钮在年表范围内浏览。</div>'
        +'<div class="hj-nav"><button class="btn" onclick="jumpYearTo('+span.minA+')">跳到年表首年（前2357）</button><button class="btn" onclick="jumpYearTo('+span.maxA+')">跳到年表末年(959)</button></div>'
        +chronYunTable(span.minYun)
        +'</details>';
    }
  }
  /* --- 大事锚点总表（三档着色与推演年份挂钩：本世绛底、本运浅绛底、同会绛字） --- */
  const allA=HJ.anchors();
  const anchorTable='<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>年份</th><th>纪年所本</th><th>大事</th><th>备注</th><th>元会运世定位</th></tr></thead><tbody>'
    +allA.map(a=>{
      const tier=(a.A>=L.shi.start&&a.A<=L.shi.end)?'hj-row-shi':((a.A>=L.yun.start&&a.A<=L.yun.end)?'hj-row-yun':((a.huiZhi===L.hui.zhi)?'hj-row-hui':''));
      return '<tr'+(tier?' class="'+tier+'"':'')+'><td>'+a.fmt+'（'+a.gz+'）</td><td>'+a.srcTxt+'</td><td>'+a.label+'</td><td>'+a.note+'</td><td>'+a.huiZhi+'会 第'+a.yunNoG+'运（'+a.yunGan+'） 第'+a.shiNoG+'世（'+a.shiZhi+'）</td></tr>';
    }).join('')+'</tbody></table></div>'
    +'<div class="sub-note">纪年所本一列辨两套纪年：标原书纪年者，依《皇极经世》以运经世所载之年；标通行史年者，依后世史学与夏商周断代工程之年。原书从殷历长纪年，与断代工程所定相差非一，故同一史事在两套纪年下所落之世可差数世，览者并观自辨。两套之差逐条列下，以见其概。</div>'
    +'<table class="hj-np"><thead><tr><th>史事</th><th>原书纪年</th><th>通行史年</th><th>相差</th></tr></thead><tbody>'
    +HJ.jiNianDuiZhao().map(function(r){
      return '<tr><td>'+r.label+'</td><td>'+r.sj+'</td><td>'+r.hx+'</td><td>'+r.gap+'</td></tr>';
    }).join('')
    +'</tbody></table>'
    +'<div class="sub-note">原书纪年一列为《皇极经世》以运经世所载之年，通行史年一列即大事锚点表所用之年。差数随史事而不同，非一条固定年差：克商相差七十六年，商汤建国相差一百六十六年，可见两套纪年并非整体平移，故不可用单一差数互推，唯逐年对读方准。</div>';
  
  const HUI_PLAIN={
  '子':'一元开天之时，如同一天的儿子夜，天地初分、万物未生，对应复卦一阳初动。',
  '丑':'天地既分而形质始成，如丑时鸡鸣欲晓，对应临卦阳气渐长。',
  '寅':'寅时天将明之会，对应泰卦三阳开泰；开物在寅会之中，生生之机自此而动。',
  '卯':'日出之会，如卯时日升，对应大壮卦阳气壮盛，文明渐启。',
  '辰':'日中之前，如辰时朝食，对应夬卦五阳决去一阴，风气大开。',
  '巳':'阳气极盛之会，如巳时日近中天，对应乾卦六阳纯健，人文极盛。',
  '午':'日中而昃之会，如午时日已中天，对应姤卦一阴始生，盛极而变之始。',
  '未':'阴气渐长之会，如未时日过中天，对应遁卦二阴浸长，宜退守。',
  '申':'收敛之会，如申时日斜，对应否卦三阴隔阳，天地不交。',
  '酉':'日落之会，如酉时日入，对应观卦四阴观阳，由明入晦。',
  '戌':'黄昏之会，如戌时天地闭，对应剥卦五阴剥阳，旧物渐尽。',
  '亥':'一元将终之会，如亥时人定，对应坤卦六阴纯静，贞下起元、另开新元。'
  };
  const huiP=HUI_PLAIN[L.hui.zhi];
  const yunP='本运为'+L.hui.zhi+'会三十运中的第'+L.yun.noH+'运（全元第'+L.yun.noG+'运，原书经运之'+L.yun.gan+'），值'+yunImpl.name+'卦，覆盖'+fmtRangeShort(L.yun.start,L.yun.end)+'这三百六十年，现处运内第'+L.yun.inYear+'年。';
  const shiP='本世为该运十二世中的第'+L.shi.noY+'世（全元第'+L.shi.noG+'世，原书经世之'+L.shi.zhi+'），覆盖'+fmtRangeShort(L.shi.start,L.shi.end)+'这三十年，现处世内第'+L.shi.inYear+'年。';
  let yrP='';
  if(yrImpl) yrP='值年卦（民间）'+yrImpl.name+'（六十卦一年一卦，1984年值火风鼎）。';
  const xunPlain=HJ.xunGuaJia(L);
  const xunP='旬卦'+xunPlain.name+'（世卦'+HJ.shortGuaName(xunPlain.base)+'第'+xunPlain.yao+'爻变，一爻主十年，段为'+fmtRangeShort(xunPlain.from,xunPlain.to)+'）。';
  const plain='<h3 class="det-h">白话解读</h3><div class="sub-note">皇极经世是古人给天地计时的大尺子：一元如一日，会如时辰，运如月份，世如日期。大周期、本会、本运本世、读法四层，由大到小说清位置与卦象，不作吉凶断言。</div>'
  +'<table class="hj-np"><tbody>'
  +'<tr><td>大周期</td><td>现处第'+L.yuanNo+'元。一元十二万九千六百年，如一日之十二时辰；本元已行至'+L.hui.zhi+'会，合全元第'+yuanIn+'年。'+huiP+'</td></tr>'
  +'<tr><td>本会</td><td>'+L.hui.zhi+'会共一万零八百年，配辟卦'+HJ.huiGua(L.hui.idx)+'（民间移配），起'+fmtRangeShort(L.hui.start,L.hui.end)+'。'+yunP+'</td></tr>'
  +'<tr><td>本运本世</td><td>'+shiP+(yrP||'')+(xunP||'')+'</td></tr>'
  +'<tr><td>顺序</td><td>由大到小：先看这一运值哪一卦，定三百六十年的气象；再看运卦、世卦、旬卦三层爻变，落到本年值年卦。会值五卦与闰卦出自原书，运卦、世卦、旬卦与值年卦出自后世传承和民间，来源不同，不可混推。</td></tr>'
  +'</tbody></table>';
/* 定位盘置首：盘上点任一段即跳年重排，盘若排在长文之后，每次点选都把人甩回页首，
   看不到盘面上的变化。盘在页首，点选后原地留在视野内（见 jumpYearTo 的 keep），无视觉切换。 */
const outHtml = wheelHtml
    +'<h3 class="rel-title">定位总览</h3>'
    +'<div class="hj-over"><div class="big">'+bigLine+'</div></div>'
    +ovInfo
    +'<h3 class="rel-title">皇极尺</h3>'
    +'<div class="hj-ruler">'+ruler+'</div>'
    +'<div class="sub-note">'+kaiTxt+biTxt+'，'+kaiState+'。</div>'
    +'<h3 class="rel-title">卦气盘</h3>'+guaHtml
    +'<h3 class="rel-title">先天六十四卦方图</h3>'
    +'<div class="hj-np-wrap">'+hjFangtu(yg.name)+'</div>'
    +'<div class="sub-note">方圆二图并称，圆图象天、方图象地，此其方图：行自上而下依次主下卦（内卦）乾兑离震巽坎艮坤，列自左而右依次主上卦（外卦）乾兑离震巽坎艮坤，上半逐行自左而右、下半逐行自右而左读之，即圆图之序；对角八格为八纯卦，其中绛字标出者即乾坤坎离四正，正是不用值运之四卦，余六十卦各主六运。淡底一格为本运所值之卦。</div>'
    +jieHtml
    +'<h3 class="rel-title">值年卦六十年速查表</h3>'
    +'<div class="hj-nav"><button class="btn" onclick="navYear(-1)">上一年</button><button class="btn" onclick="navYear(1)">下一年</button><button class="btn" onclick="navToYun()">跳到本运首年</button><button class="btn" onclick="navToShi()">跳到本世首年</button></div>'
    +'<div class="sub-note">六十卦一年一卦，自复起、按通行六十卦序、至剥而终，终则复始；本表按甲子一轮排，排其所在的一整轮，淡底一行即本年。锚点与算式见起例说明值年卦条，诸本锚点不一故逐年全异，用表前须先认明其以何年为起。</div>'
    +'<div class="hj-np-wrap">'+hjYearTable(L)+'</div>'
    +hjLiuNian(L)
    +(anchorRows?('<h3 class="rel-title">本运大事锚点</h3><div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>年份干支</th><th>纪年所本</th><th>事件</th><th>备注</th></tr></thead><tbody>'+anchorRows+'</tbody></table></div>'):'')
    +'<h3 class="rel-title">大事锚点表</h3>'
    +'<div class="sub-note">本表凡'+allA.length+'条，历代大事各标注元会运世定位。<span class="hj-mark">绛底</span>为本世（'+fmtRangeShort(L.shi.start,L.shi.end)+'）内、<span class="hj-mark">浅绛底</span>为本运（'+fmtRangeShort(L.yun.start,L.yun.end)+'）内、<span class="hj-mark">绛字</span>为同会（'+L.hui.zhi+'会）其余各条。锚点止于一九七八年，所取皆已成定论之史事，不作现实政治预测。</div>'
    +anchorTable
    +'<h3 class="rel-title">六日七分法</h3>'
        +'<div class="sub-note">孟喜卦气说：去坎离震兑四正，余六十卦各主六日七分（365.25÷60≈6.0875日），自冬至初中孚用事，依孟喜卦气图公辟侯卿全序推日，冬至取十二月二十二日。此系汉易卦气说，与邵雍以元经会的值卦分属两系，并列参照。输入月日即得当日卦气归属。</div>'
        +'<div class="form-row"><div class="field"><label for="hjQfM">月</label><input id="hjQfM" type="number" min="1" max="12" value="12" aria-label="月"></div><div class="field"><label for="hjQfD">日</label><input id="hjQfD" type="number" min="1" max="31" value="22" aria-label="日"></div><button class="btn gold" type="button" onclick="hjQiFen()">推算</button></div>'
        +'<div id="hjQfOut"></div>'
        +'<h3 class="rel-title">原书年表检索</h3>'
    +'<div class="sub-note">原书以运经世一千五百三十九条记事，跨运一次检索：输入人名、地名或事类关键词，即列其全部年份、干支与元会运世定位，并出原书记事。检索词简繁互通，所列记事一律转写简体。年表止于后周显德六年己未（公元959），宋初以后原书不载。</div>'
    +'<div class="jw-search"><input class="jw-input" id="hjChronQ" type="text" placeholder="输入人名、地名或事类关键词，如 孔子、牧野、決河" aria-label="原书年表检索" onkeydown="if(event.key===\'Enter\')hjChronSearch()"><button class="btn gold" type="button" onclick="hjChronSearch()">检索</button><span class="jw-count" id="hjChronN"></span></div>'
    +'<div id="hjChronHits"></div>'
    +'<h3 class="rel-title">年份互查</h3>'
    +'<div class="sub-note">填一个年份，出该年的元会运世定位、原书年表本年记事、本世三十年的原书全部记事，以及前后最近的两条大事锚点。原书纪年与通行史年之差随史事而不同、非整体平移，故此处不设换算系数，只把两套并列在同年之下供对读。</div>'
    +'<div class="form-row"><div class="field"><label for="hjLookQ">年份</label><input id="hjLookQ" type="text" placeholder="618 前1122" autocomplete="off" aria-label="互查年份" onkeydown="if(event.key===\'Enter\')hjYearLook()"></div><button class="btn gold" type="button" onclick="hjYearLook()">互查</button></div>'
    +'<div id="hjLookOut"></div>'
    +'<h3 class="rel-title">时间跨度计算</h3>'
    +'<div class="sub-note">填起讫两年，出相距年数、折合几世几运、两端的元会运世定位与所值之卦，并报所推这一段在原书年表中的记事条数。世以三十年、运以三百六十年为单位，故唐二百八十九年不出一运一类跨度感可逐段验算。</div>'
    +'<div class="form-row"><div class="field"><label for="hjSpanA">起年</label><input id="hjSpanA" type="text" placeholder="618 前2357" autocomplete="off" aria-label="起年" onkeydown="if(event.key===\'Enter\')hjSpan()"></div><div class="field"><label for="hjSpanB">讫年</label><input id="hjSpanB" type="text" placeholder="618 前2357" autocomplete="off" aria-label="讫年" onkeydown="if(event.key===\'Enter\')hjSpan()"></div><button class="btn gold" type="button" onclick="hjSpan()">计算</button></div>'
    +'<div id="hjSpanOut"></div>'
    +'<h3 class="rel-title">以元经会（逐世干支方阵，一元 4320 世）</h3>'
    +'<div class="sub-note">以元经会逐世定位：一元十二会、每会三十运、每运十二世，合四千三百二十世。世序 N 自 1 至 4320，会内运序自 1 至 30。可按世序 N 直达，或选会支、填会内运序、选世支三项定位；整会一览列该会三十运三百六十世，整运一览列该运十二世。</div>'
    +'<div class="form-row">'
    +'<div class="field"><label for="hjYjhN">世序 N</label><input id="hjYjhN" type="number" min="1" max="4320" placeholder="1" aria-label="世序N"></div>'
    +'<div class="field"><label for="hjYjhHui">会支</label><select id="hjYjhHui" aria-label="会支"></select></div>'
    +'<div class="field"><label for="hjYjhYun">会内运序</label><input id="hjYjhYun" type="number" min="1" max="30" placeholder="1" aria-label="会内运序"></div>'
    +'<div class="field"><label for="hjYjhShi">世支</label><select id="hjYjhShi" aria-label="世支"></select></div>'
    +'<button class="btn gold" type="button" onclick="hjYjhGo()">定位</button>'
    +'<button class="btn" type="button" onclick="hjYjhHuiAll()">整会一览</button>'
    +'<button class="btn" type="button" onclick="hjYjhYunAll()">整运一览</button>'
    +'</div>'
    +'<div id="hjYjhOut"></div>'
    +'<details class="hj-ref" id="hjYunAllFold"><summary>元会运世总表（一元三百六十运）</summary>'
    +'<div class="sub-note">一元十二会、每会三十运，合三百六十运；每运值一卦之爻（六十卦各六爻），故每卦主六运。绛底一运即本运，绛字各运即同会。</div>'
    +'<div class="hj-np-wrap">'+hjYunTable(L)+'</div>'
    +'</details>'
    +chronHtml;
  /* 静态首屏只含定位盘与总览，其余结果段在加载后补入，首屏 DOM 不重绘。 */
  const outEl = document.getElementById('out');
  if (restOnly) {
    const mark = '<h3 class="rel-title">皇极尺</h3>';
    const cut = outHtml.indexOf(mark);
    outEl.insertAdjacentHTML('beforeend', cut >= 0 ? outHtml.slice(cut) : outHtml);
  } else {
    outEl.innerHTML = outHtml;
  }
  
  /* 三件查询工具随整页重排复原：工具在结果区内，重排会重建其 DOM，
     故输入值存于 window，重排后回填并重算，读者换年份时工具结果不丢 */
  const qEl=document.getElementById('hjChronQ');
  if(qEl && window.__hjChronQ){ qEl.value=window.__hjChronQ; hjChronSearch(); }
  const lEl=document.getElementById('hjLookQ');
  if(lEl && window.__hjLookQ){ lEl.value=window.__hjLookQ; hjYearLook(); }
  const saEl=document.getElementById('hjSpanA'), sbEl=document.getElementById('hjSpanB');
  if(saEl && window.__hjSpanA){ saEl.value=window.__hjSpanA; sbEl.value=window.__hjSpanB||''; hjSpan(); }
  const prPlain=document.getElementById('plainRef'); if(prPlain) prPlain.innerHTML=plain;
  ['hjYjhHui','hjYjhShi'].forEach(function(id){
    var sel=document.getElementById(id); if(!sel) return;
    sel.innerHTML=HJ_YJH_ZHI.map(function(z){return '<option value="'+z+'">'+z+'</option>';}).join('');
  });
  xjApplyFold('hjFoldState','details[id]');
LAST={A:L.A, L:L, guaqi:HJ.GUAQI_READY(), note:r.note};
 }catch(e){
  document.getElementById('out').innerHTML='<p class="notice">推演出错：'+(e.message||e)+'</p>';
 }
}
/* 跳年工具：格子、盘面与年表按钮共用。keep 为真时只把定位盘兜回视野（已在视野内则原地不动），
   供盘上点选用：盘在页首，点选前后看到的是同一张盘，无跳转；年表按钮在页尾，仍回文档顶端。 */
function jumpYearTo(A,keep){
  A=Number(A);
  directA=A;
  document.getElementById('yInput').value = A>=1 ? String(A) : ('前'+(1-A));
  query();
  if(keep){
    const w=document.querySelector('#out .wheel-block');
    if(w) w.scrollIntoView({block:'nearest'});
    return;
  }
  try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
}
/* 原书逐年表：本运翻页 + 只看记事过滤 */
function navChron(d){
  if(!LAST||!window.HJ_CHRONICLE) return;
  const span=HJ.chronSpan();
  const target=Math.min(span.maxYun,Math.max(span.minYun,LAST.L.yun.noG+d));
  jumpYearTo(HJ.CONST.Y0+(target-1)*HJ.CONST.YUN);
}
function toggleChronFilter(){
  window.__hjChronFilter=!window.__hjChronFilter;
  query();
}
/* 逐年翻阅：值年卦一年一卦，前后年切换即换卦，与年份直达共用 jumpYearTo。
   翻年只改年份不动口径，故直接改 directA，不经输入框。 */
function navYear(d){
  if(!LAST) return;
  jumpYearTo(LAST.A+d);
}
/* 运世快速跳转：跳到本运或本世的首年，定位盘已能点选，此二钮给不便点盘时用（如窄屏盘小） */
function navToYun(){ if(!LAST) return; jumpYearTo(LAST.L.yun.start); }
function navToShi(){ if(!LAST) return; jumpYearTo(LAST.L.shi.start); }
/* 检索词简繁互通：年表原文为繁体，用户多按简体输入，故两形并检。
   简繁表取站内既有 jianfan.js（OpenCC 简→繁），逐码点遍历，兼收扩展区单字；
   该表只用于比对，原文显示另经 hjJianti 转简体。 */
function hjFan(t){
  if(typeof JIANFAN==='undefined') return t;
  let s='';
  for(const c of t) s+=JIANFAN[c]||c;
  return s;
}
/* 繁→简：jianfan.js 是简→繁表，倒排得繁→简（一繁对多简时取首个；乾等表外字原样保留，
   年表卦名与人名用字不受影响）。年表原文为四库本繁体，页面显示一律转简体。 */
let _FTS=null;
function hjJianti(t){
  if(typeof JIANFAN==='undefined') return t;
  if(!_FTS){ _FTS={}; Object.keys(JIANFAN).forEach(function(k){ const v=JIANFAN[k]; if(!_FTS[v]) _FTS[v]=k; }); }
  let s='';
  for(const c of t) s+=_FTS[c]||c;
  return s;
}
/* 原书年表全文检索：以运经世一千五百三十九条记事跨运检索，命中即列其元会运世定位与原文，
   点年份跳到该年。检索只重写结果区，不触发整页重排，故输入焦点与折叠态都不动。 */
function hjChronSearch(){
  const box=document.getElementById('hjChronHits'); if(!box) return;
  const el=document.getElementById('hjChronQ'); const q=(el?el.value:'').trim();
  const cnt=document.getElementById('hjChronN');
  window.__hjChronQ=q;
  if(!q){ box.innerHTML=''; if(cnt) cnt.textContent=''; return; }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fan=hjFan(q);
  const forms=fan===q?[q]:[q,fan];
  const all=HJ.chronAll();
  const hit=all.filter(r=>forms.some(f=>r.t.indexOf(f)>=0));
  if(cnt) cnt.textContent=hit.length?('检得 '+hit.length+' 条'):'未检得';
  if(!hit.length){
    box.innerHTML='<div class="sub-note">原书年表（前2357至公元959）内未检得含“'+esc(q)+'”的记事。年表为原书所载，书成于宋、止于五代，宋初以后不在表内；检索已兼收简体与繁体两种写法。</div>';
    return;
  }
  /* 命中上限：年表记事最长者百余字，一次全列会过长，故截前二百条并注明 */
  const LIMIT=200, show=hit.slice(0,LIMIT);
  const mark=s=>{
    let h=esc(s);
    forms.forEach(f=>{ h=h.split(esc(f)).join('<mark>'+esc(f)+'</mark>'); });
    return h;
  };
  box.innerHTML='<div class="sub-note">检得 <b>'+hit.length+'</b> 条'
    +(hit.length>LIMIT?('，下表列前 '+LIMIT+' 条，请再添字缩小范围'):'')
    +'。点年份跳到该年，全页定位随之重排。</div>'
    +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>年份</th><th>干支</th><th>元会运世定位</th><th>原书记事</th></tr></thead><tbody>'
    +show.map(r=>'<tr><td class="hj-go" onclick="jumpYearTo('+r.A+')">'+r.fmt+'</td><td>'+r.gz+'</td>'
      +'<td>'+r.huiZhi+'会 第'+r.yunNoG+'运（'+r.yunGan+'） 第'+r.shiNoG+'世（'+r.shiZhi+'）</td>'
      +'<td>'+hjJianti(mark(r.t))+'</td></tr>').join('')
    +'</tbody></table></div>';
}
/* 值年卦配五行、配方位、配人事：民间流年家以值年卦配五行、方位、人事者各有其法，诸本互异。
   本页所列为经典通行之配属，皆取卦所属之宫（先天八卦宫，即页首圆图外圈八宫）：
   五行取八卦五行（乾兑金、震巽木、坎水、离火、艮坤土）；
   方位两存，后天取《说卦传》帝出乎震一节，先天取天地定位一节；
   人事取《说卦传》乾称父、坤称母、震长男、巽长女、坎中男、离中女、艮少男、兑少女一节。
   此非某一家流年之说，读者若从某家，须先认其配法。 */
const HZ_WX={'乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土'};
const HZ_FANG_HOU={'坎':'北','艮':'东北','震':'东','巽':'东南','离':'南','坤':'西南','兑':'西','乾':'西北'};
const HZ_FANG_XIAN={'乾':'南','坤':'北','离':'东','坎':'西','兑':'东南','震':'东北','巽':'西南','艮':'西北'};
const HZ_REN={'乾':'父','坤':'母','震':'长男','巽':'长女','坎':'中男','离':'中女','艮':'少男','兑':'少女'};
/* 值年卦流年：民间一年一卦观年景之说。判语只就卦象刚柔消息与卦辞字面立论，
   不作命理推演、不涉个人八字、不落一人之祸福。
   🔴 口径冲突须并出：本页解卦层与吉凶判语两节声明不断个人祸福，此节按民间流年之说出宜忌，
   两处口径不同，故节首与节尾各注一次，读者自辨。 */
function hjLiuNian(L){
  const yg=HJ.yearGua(L); if(!yg) return '';
  const one=A=>{
    const g=HJ.yearGuaCalc(A), gi=HJ.guaInfo(HJ.fullGuaName(g.name));
    const yang=gi.bits6.reduce((s,x)=>s+x,0);
    const dang=gi.bits6.map((x,i)=>((i%2===0)===(x===1))).filter(Boolean).length;
    const ci=ciOf(HJ.fullGuaName(g.name));
    const bad=/凶|咎|厉|吝|悔|桡|眚|灾|勿用|不利/.test(ci);
    const good=/元|亨|利|吉/.test(ci);
    const jie=bad?'宜守正慎动':(good?'宜顺势有为':'宜静观其变');
    return {A:A, name:g.name, seq:g.seq, yang:yang, dang:dang, ci:ci, jie:jie, cur:A===L.A};
  };
  const cur=one(L.A), prev=one(L.A-1), next=one(L.A+1);
  const yi=[], ji=[];
  if(cur.yang>=4) yi.push('刚盛之岁，宜进取有为、宜开新局');
  else if(cur.yang<=2) ji.push('柔盛之岁，宜守成待时、忌强行进取');
  if(cur.dang>=4) yi.push('当位者众，宜循正轨行事');
  else if(cur.dang<=2) ji.push('当位者寡，宜审势而后动');
  if(/元/.test(cur.ci)&&/亨/.test(cur.ci)) yi.push('卦辞见元亨，宜举大事、宜会众');
  else if(/亨/.test(cur.ci)) yi.push('卦辞见亨，宜顺时通变');
  else if(/元/.test(cur.ci)) yi.push('卦辞见元，宜举大事');
  if(/利/.test(cur.ci)) yi.push('卦辞见利，宜谋为、宜涉远');
  if(/吉/.test(cur.ci)) yi.push('卦辞见吉，宜循正而行');
  if(/凶|咎|厉|吝|悔|桡|眚|灾|勿用|不利/.test(cur.ci)) ji.push('卦辞见戒辞，忌躁进、忌轻诺');
  if(!yi.length) yi.push('卦辞平实，宜循常守分');
  if(!ji.length) ji.push('卦无显戒，仍忌恃势妄动');
  const gA=HJ.guaInfo(HJ.fullGuaName(cur.name));
  const gong=hjXtGong(cur.name);
  const row=r=>'<tr'+(r.cur?' class="hj-row-shi"':'')+'><td>'+HJ.fmtYear(r.A)+'</td><td>第'+r.seq+'卦</td><td>'+r.name+'</td>'
    +'<td>'+r.yang+'阳'+(6-r.yang)+'阴，当位'+r.dang+'爻</td><td>'+r.jie+'</td></tr>';
  return '<h3 class="rel-title">值年卦流年</h3>'
    +'<div class="sub-note">这一段按民间一年一卦的说法讲宜忌。解卦层与吉凶判语只讲卦象，不断个人祸福，两者口径不同，读时分开看。</div>'
    +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>年份</th><th>序</th><th>值年卦</th><th>卦象</th><th>流年判语</th></tr></thead><tbody>'
    +row(prev)+row(cur)+row(next)
    +'</tbody></table></div>'
    +'<table class="hj-np"><tbody>'
    +'<tr><td>本年气象</td><td>'+gA.lsym+'　'+cur.name+'：'+cur.yang+'阳'+(6-cur.yang)+'阴，六爻中当位者'+cur.dang+'爻；卦辞'+cur.ci+'</td></tr>'
    +'<tr><td>本年之宜</td><td>'+yi.join('；')+'。</td></tr>'
    +'<tr><td>本年之忌</td><td>'+ji.join('；')+'。</td></tr>'
    +'</tbody></table>'
    +'<h4 class="det-h">本年值年卦的五行、方位与人事</h4>'
    +'<table class="hj-np"><thead><tr><th>配属</th><th>所据</th><th>本卦之属</th></tr></thead><tbody>'
    +'<tr><td>五行</td><td>八卦五行，乾兑金、震巽木、坎水、离火、艮坤土</td><td>'+cur.name+'属'+gong+'宫，宫之五行为'+(HZ_WX[gong]||'')+'</td></tr>'
    +'<tr><td>方位（后天）</td><td>《说卦传》帝出乎震一节</td><td>'+(HZ_FANG_HOU[gong]||'')+'方</td></tr>'
    +'<tr><td>方位（先天）</td><td>《说卦传》天地定位一节</td><td>'+(HZ_FANG_XIAN[gong]||'')+'方</td></tr>'
    +'<tr><td>人事</td><td>《说卦传》乾称父、坤称母、震长男、巽长女、坎中男、离中女、艮少男、兑少女</td><td>'+gong+'宫，于六子之列为'+(HZ_REN[gong]||'')+'</td></tr>'
    +'</tbody></table>'
    +'<div class="sub-note">值年卦是民间说法，原书只以卦配时段，不逐年配卦。判语只看卦象刚柔与卦辞；五行、方位、人事从本卦所属之宫推出，五行取八卦五行，方位先后天两说并列，人事取《说卦传》六子之列。宫有两系：这里用先天圆图八宫，另有京房八宫，分组不同则五行也不同，如风天小畜在先天圆图属乾宫金、在京房属巽宫木。民间流年家的配法各家不一，用前先认其法。解卦层与吉凶判语不断个人祸福，这里讲宜忌与配属，口径不同，分开看。</div>';
}
/* 十六位数时序配属与皇帝王伯：渲染 4×4 表，行主元会运世、列主元会运世，
   每格出四时配属（春行春等）与皇帝王伯配属（道行道等）。 */
function hjShixuRender(){
  const el=document.getElementById('hjShixuTable'); if(!el||!HJ.SHIXU16) return;
  const S=HJ.SHIXU_SEASONS;
  let h='<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th></th>'+S.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>';
  HJ.SHIXU16.forEach(function(row,i){
    h+='<tr><th>'+['元','会','运','世'][i]+'</th>';
    row.forEach(function(c,j){
      h+='<td>'+c.season+'<br><span class="hj-mark">'+c.emperor+'（'+c.action+'）</span></td>';
    });
    h+='</tr>';
  });
  h+='</tbody></table></div>';
  h+='<div class="sub-note">十六格以元会运世配春夏秋冬（元春、会夏、运秋、世冬），以皇帝王伯配道德功力（皇道、帝德、王功、伯力）。行主天（元会运世），列主时（春夏秋冬），每格即一行一时之交会。原文又以十六格配三皇五帝三王五伯十六人事，此处不重出，可参原书。</div>';
  el.innerHTML=h;
}
/* 六日七分法：去坎离震兑四正，余六十卦各主六日七分（365.25/60≈6.0875日），自冬至初中孚用事。 */
function hjQiFen(){
  const box=document.getElementById('hjQfOut'); if(!box) return;
  const m=parseInt(document.getElementById('hjQfM').value,10);
  const d=parseInt(document.getElementById('hjQfD').value,10);
  const md=[31,28,31,30,31,30,31,31,30,31,30,31];
  if(!m||!d||m<1||m>12||d<1||d>md[m-1]){ box.innerHTML='<div class="sub-note">请填有效月日，月取 1 至 12，日取该月实有之日。</div>'; return; }
  const r=HJ.liuRiQiFen(m,d);
  const ci=ciOf(HJ.fullGuaName(r.gua));
  box.innerHTML='<div class="hj-np-wrap"><table class="hj-np"><tbody>'
    +'<tr><td>月日</td><td>'+m+' 月 '+d+' 日</td></tr>'
    +'<tr><td>卦气卦</td><td>'+r.gua+'（六十卦序第 '+r.seq+' 卦，'+r.group+'卦）</td></tr>'
    +'<tr><td>距冬至</td><td>'+r.daysSinceWS+' 日（冬至中孚当值起算，冬至取十二月二十二日）</td></tr>'
    +'<tr><td>卦辞</td><td>'+(ci||'未载')+'</td></tr>'
    +'</tbody></table></div>'
    +'<div class="sub-note">六日七分出孟喜卦气说，去坎离震兑四正，余六十卦各主六日七分，合三百六十五日四分之一日；自冬至初中孚用事，依卦气图公辟侯卿全序推日。此系与邵雍以元经会的值卦分属两系：前者配日（一日一卦气时段），后者配年月运世（一卦主数年数十年）。并列参照，不可互推。</div>';
}
/* 时间跨度计算：起讫两年 → 相距年数、折合世与运、两端定位与值卦、期间年表记事条数。
   一世三十年约当一代人、一运三百六十年约当一个大朝代，此说本页原只作话说，此处做成可算的。 */
function hjSpan(){
  const box=document.getElementById('hjSpanOut'); if(!box) return;
  window.__hjSpanA=(document.getElementById('hjSpanA').value||'').trim();
  window.__hjSpanB=(document.getElementById('hjSpanB').value||'').trim();
  const A=HJ.parseYearInput(window.__hjSpanA);
  const B=HJ.parseYearInput(window.__hjSpanB);
  if(A==null||B==null){ box.innerHTML='<div class="sub-note">请填起讫两年，格式同年份直达（如 618、前2357、-2357）。</div>'; return; }
  const lo=Math.min(A,B), hi=Math.max(A,B);
  const La=HJ.locate(lo), Lb=HJ.locate(hi);
  if(!La||!Lb){ box.innerHTML='<div class="sub-note">年份超出可推算范围。</div>'; return; }
  const span=hi-lo;
  const shiN=Math.floor(span/HJ.CONST.SHI), shiR=span%HJ.CONST.SHI;
  const yunN=Math.floor(span/HJ.CONST.YUN);
  const gA=HJ.yunGua(La), gB=HJ.yunGua(Lb);
  const spanTxt='相距 '+span+' 年，合 '+shiN+' 世'+(shiR?('零 '+shiR+' 年'):'')
    +'；'+(yunN?(yunN+' 运'+(span%HJ.CONST.YUN?('零 '+(span%HJ.CONST.YUN)+' 年'):'')):'不出一运');
  const guaTxt=(gA&&gB&&gA.name===gB.name)
    ? ('期间值卦未更替，终始皆 '+gA.name+'（该卦主六运共二千一百六十年）')
    : ('期间值卦更替：起 '+gA.name+'，讫 '+gB.name);
  const cs=HJ.chronSpan();
  let chronTxt='';
  if(HJ.chronHas() && hi>=cs.minA && lo<=cs.maxA){
    const s=Math.max(lo,cs.minA), e=Math.min(hi,cs.maxA);
    const n=HJ.chronAll().filter(r=>r.A>=s&&r.A<=e).length;
    chronTxt='所推这一段落在原书年表范围内（'+HJ.fmtYear(s)+' 至 '+HJ.fmtYear(e)+'），原书有记事 '+n+' 条。'
      +((lo<cs.minA||hi>cs.maxA)?'（表外部分不计：原书年表起帝尧甲辰、讫后周显德六年己未）':'');
  }else{
    chronTxt='所推这一段与原书年表（前2357 至公元959）不相交，原书无记事可比。';
  }
  const pos=r=>r.hui.zhi+'会 第'+r.yun.noG+'运（'+r.yun.gan+'） 第'+r.shi.noG+'世（'+r.shi.zhi+'）　'+r.gz+'年';
  box.innerHTML='<div class="sub-note">'+spanTxt+'。</div>'
    +'<div class="hj-np-wrap"><table class="hj-np"><tbody>'
    +'<tr><td>起点</td><td>'+HJ.fmtYear(lo)+'　'+pos(La)+'　值卦'+HJ.shortGuaName(gA.name)+'</td></tr>'
    +'<tr><td>终点</td><td>'+HJ.fmtYear(hi)+'　'+pos(Lb)+'　值卦'+HJ.shortGuaName(gB.name)+'</td></tr>'
    +'<tr><td>值卦</td><td>'+guaTxt+'</td></tr>'
    +'<tr><td>年表</td><td>'+chronTxt+'</td></tr>'
    +'</tbody></table></div>';
}
/* 年份互查：给一个年份，出该年定位、该世原书记事、原书年表该年记事，与前后最近的大事锚点。
   两套纪年之差随史事而不同、非整体平移，故不设换算系数，只把两套并列在同年之下供对读。 */
function hjYearLook(){
  const box=document.getElementById('hjLookOut'); if(!box) return;
  const raw=(document.getElementById('hjLookQ').value||'').trim(); window.__hjLookQ=raw;
  const A=HJ.parseYearInput(raw);
  if(A==null){ box.innerHTML='<div class="sub-note">请填一个年份，格式同年份直达（如 618、前2357、-2357）。</div>'; return; }
  const L=HJ.locate(A);
  if(!L){ box.innerHTML='<div class="sub-note">年份超出可推算范围。</div>'; return; }
  const all=HJ.chronAll();
  const cur=all.find(r=>r.A===A);
  const shiRows=all.filter(r=>r.A>=L.shi.start&&r.A<=L.shi.end);
  const anch=HJ.anchors();
  const prev=anch.filter(x=>x.A<=A).slice(-1)[0], next=anch.find(x=>x.A>A);
  const cs=HJ.chronSpan();
  const shiInRange=HJ.chronHas() && L.shi.end>=cs.minA && L.shi.start<=cs.maxA;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const pos='元第'+L.yuanNo+'元　'+L.hui.zhi+'会 第'+L.yun.noG+'运（'+L.yun.gan+'） 第'+L.shi.noG+'世（'+L.shi.zhi+'）　'+L.gz+'年';
  let h='<div class="sub-note">'+HJ.fmtYear(A)+'　'+pos+'</div>';
  h+='<div class="hj-nav"><button class="btn" onclick="jumpYearTo('+A+')">跳到该年</button></div>';
  h+='<div class="hj-np-wrap"><table class="hj-np"><tbody>'
    +'<tr><td>原书本年</td><td>'+(cur?hjJianti(esc(cur.t)):'原书年表本年无记事'+(HJ.chronHas()&&(A<HJ.chronSpan().minA||A>HJ.chronSpan().maxA)?'（本年在年表范围外）':''))+'</td></tr>'
    +'<tr><td>前最近锚点</td><td>'+(prev?(prev.fmt+'（'+prev.gz+'，'+prev.srcTxt+'）　'+esc(prev.label)):'无')+'</td></tr>'
    +'<tr><td>后最近锚点</td><td>'+(next?(next.fmt+'（'+next.gz+'，'+next.srcTxt+'）　'+esc(next.label)):'无')+'</td></tr>'
    +'</tbody></table></div>';
  if(shiRows.length){
    h+='<div class="sub-note">本世（'+fmtRangeShort(L.shi.start,L.shi.end)+'）原书记事 '+shiRows.length+' 条：</div>'
      +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>年份</th><th>干支</th><th>原书记事</th></tr></thead><tbody>'
      +shiRows.map(r=>'<tr'+(r.A===A?' class="hj-row-shi"':'')+'><td class="hj-go" onclick="jumpYearTo('+r.A+')">'+r.fmt+'</td><td>'+r.gz+'</td><td>'+hjJianti(esc(r.t))+'</td></tr>').join('')
      +'</tbody></table></div>';
  }else if(HJ.chronHas()){
    h+='<div class="sub-note">本世（'+fmtRangeShort(L.shi.start,L.shi.end)+'）'+(shiInRange?'在原书年表范围内无记事。':'在年表范围外，原书止于公元959年。')+'</div>';
  }
  box.innerHTML=h;
}
/* 年表范围内某运的表体（供范围外提示复用） */
function chronYunTable(yunNo){
  const rows=HJ.chronYun(yunNo);
  const filterOn=window.__hjChronFilter||false;
  const show=filterOn?rows.filter(r=>r.t):rows;
  return '<table class="hj-np hj-chron"><colgroup><col class="c1"><col class="c2"><col></colgroup><tbody>'+show.map(r=>'<tr><td>'+HJ.fmtYear(r.A)+'</td><td>'+r.gz+'</td><td>'+(r.t||(filterOn?'':'（原书无记事）'))+'</td></tr>').join('')+'</tbody></table>';
}
/* ============ 元会运世定位盘 ============
   三层同心环，自外向内：一元十二会、本会三十运、本运十二世。三环各自成序、起点皆在正上，
   会十二格每格三十度、运三十格每格十二度、世十二格每格三十度，环上角度即“第几格”。
   当前所推的会、运、世各出一条加粗弧（.w-arc-cur），三层的落点在同一张盘上同时可见，
   盘心三行给出三层序数与标注。
   点任一层扇区即跳到该段首年，与皇极尺、大事锚点表共用同一个跳年入口 jumpYearTo；
   盘面自取 keep 口径（jumpYearTo 第二参），跳年后留在原地不动，见本盘置首的用意。
   运标十干、世标十二支，是原书“经运之癸、经世之未”的标注口径，两条独立小循环，非六十甲子。
   几何走 assets/wheel.js 的 WHEEL，样式走 style.css 圆盘通用件段的 .wheel 与 .w-*，
   颜色只绑 --wheel-* 令牌（见 .page-hj 主题段），本函数不写死任何颜色。 */
function hjWheel(L,anchors){
  const n=WHEEL.n, px=WHEEL.px, arc=WHEEL.arc, band=WHEEL.band, C=WHEEL.C;
  /* 半径自外向内：会名 206、会弧 188、会圈 179、会刻度 171 至 177
                   运名 158、运弧 140、运圈 131、运刻度 123 至 129
                   世名 112、世弧  94、世圈  85、世刻度  77 至  83、盘心 68
     每层热区自本层刻度外沿至上层刻度内沿，三层径向不重叠，故点谁是谁。 */
  const A={lab:206,arc:188,ring:179,t0:171,t1:177,h0:169,h1:215};
  const Y={lab:158,arc:140,ring:131,t0:123,t1:129,h0:121,h1:169};
  const S={lab:112,arc: 94,ring: 85,t0: 77,t1: 83,h0: 70,h1:121};
  const huiStart=L.hui.start, yunStart=L.yun.start;
  function tick(R,dg,on){
    const a=px(R.t0,dg), b=px(R.t1,dg);
    return '<line x1="'+n(a[0])+'" y1="'+n(a[1])+'" x2="'+n(b[0])+'" y2="'+n(b[1])+'" class="w-tick'+(on?' w-tick-j':'')+'"/>';
  }
  /* 取字角：最外圈（会名）沿圆周环布 WHEEL.ring，整圈读作一条环带；
     中环运干与内环世支皆单字，照旧走 WHEEL.dir（四正正立、其余沿半径散射） */
  function lab(R,dg,txt,on,outer){
    const p=px(R.lab,dg), rot=outer?WHEEL.ring(dg):WHEEL.dir(dg);
    return '<text x="'+n(p[0])+'" y="'+n(p[1])+'" class="w-lab'+(on?' w-lab-cur':'')+'" transform="rotate('+rot+' '+n(p[0])+' '+n(p[1])+')">'+txt+'</text>';
  }
  function hit(R,a0,a1,A0){
    return '<path d="'+band(R.h0,R.h1,a0,a1)+'" class="w-hit" onclick="jumpYearTo('+A0+',1)"/>'
      +'<path d="'+band(R.h0,R.h1,a0,a1)+'" class="w-sel"/>';
  }
  let s='';
  /* 三环底弧：各格一段，同色半透明，是骨不抢眼。会环加粗一档，把最粗一层与内两环分开，
     三环于是有“会重、运世轻”的层级，与皇极尺的分段条同一主次 */
  for(let i=0;i<12;i++) s+='<path d="'+arc(A.arc,i*30-15,i*30+15)+'" class="w-arc w-arc-b"/>';
  for(let k=1;k<=30;k++) s+='<path d="'+arc(Y.arc,(k-1)*12-6,(k-1)*12+6)+'" class="w-arc"/>';
  for(let k=1;k<=12;k++) s+='<path d="'+arc(S.arc,(k-1)*30-15,(k-1)*30+15)+'" class="w-arc"/>';
  /* 本会扇面：自盘心到会弧铺一层极淡绛色，把中环三十运与内环十二世一并罩进来，
     使“内两环皆属本会”这层嵌套关系一眼可见。压在最下层，不遮刻度与环名。 */
  s+='<path d="'+band(68,215,L.hui.idx*30-15,L.hui.idx*30+15)+'" class="hj-wedge"/>';
  /* 刻度与环名：刻度、环名与格心同轴，连成辐条。三环格心一律落 (序-1)×格宽，
     故子会、第一运、第一世同在正上，与全站“子落正上”的盘面朝向一致 */
  for(let i=0;i<12;i++) s+=tick(A,i*30,i===L.hui.idx)+lab(A,i*30,HJ.CONST.HUI_ZHI[i]+'会',i===L.hui.idx,true);
  for(let k=1;k<=30;k++) s+=tick(Y,(k-1)*12,k===L.yun.noH)+lab(Y,(k-1)*12,HJ.yunGan(L.yun.noG-L.yun.noH+k),k===L.yun.noH,false);
  for(let k=1;k<=12;k++) s+=tick(S,(k-1)*30,k===L.shi.noY)+lab(S,(k-1)*30,HJ.shiZhi(L.shi.noG-L.shi.noY+k),k===L.shi.noY,false);
  /* 点选热区：只负责命中；.w-sel 紧随其后，只负责悬停着色（紧邻兄弟选择器随悬停显隐） */
  for(let i=0;i<12;i++) s+=hit(A,i*30-15,i*30+15,HJ.huiRange(i,L.yuanNo).start);
  for(let k=1;k<=30;k++) s+=hit(Y,(k-1)*12-6,(k-1)*12+6,huiStart+(k-1)*HJ.CONST.YUN);
  for(let k=1;k<=12;k++) s+=hit(S,(k-1)*30-15,(k-1)*30+15,yunStart+(k-1)*HJ.CONST.SHI);
  /* 当前三段：加粗弧压在底弧上，全盘仅此三段抢眼 */
  s+='<path d="'+arc(A.arc,L.hui.idx*30-15,L.hui.idx*30+15)+'" class="w-arc w-arc-cur"/>';
  s+='<path d="'+arc(Y.arc,(L.yun.noH-1)*12-6,(L.yun.noH-1)*12+6)+'" class="w-arc w-arc-cur"/>';
  s+='<path d="'+arc(S.arc,(L.shi.noY-1)*30-15,(L.shi.noY-1)*30+15)+'" class="w-arc w-arc-cur"/>';
  /* 三圈界线与盘心 */
  s+='<circle cx="'+C+'" cy="'+C+'" r="'+A.ring+'" class="w-ring"/>';
  s+='<circle cx="'+C+'" cy="'+C+'" r="'+Y.ring+'" class="w-ring"/>';
  s+='<circle cx="'+C+'" cy="'+C+'" r="'+S.ring+'" class="w-ring"/>';
  s+='<circle cx="'+C+'" cy="'+C+'" r="68" class="w-core"/>';
  s+='<text x="'+C+'" y="'+(C-16)+'" class="w-c1">'+L.hui.zhi+'会</text>';
  s+='<text x="'+C+'" y="'+(C+14)+'" class="w-c2">第'+L.yun.noG+'运 '+L.yun.gan+'</text>';
  s+='<text x="'+C+'" y="'+(C+34)+'" class="w-c3">第'+L.shi.noG+'世 '+L.shi.zhi+'</text>';
  /* 大事锚点：本运十二世中藏有锚点者，在运刻度与世名之间点一小圆 */
  for(let k=1;k<=12;k++){
    const st=yunStart+(k-1)*HJ.CONST.SHI;
    if(!anchors.some(a=>a.A>=st&&a.A<st+HJ.CONST.SHI)) continue;
    const p=px(120.5,(k-1)*30);
    s+='<circle cx="'+n(p[0])+'" cy="'+n(p[1])+'" r="2" class="w-dot"/>';
  }
  return '<div class="wheel-block"><h4>元会运世定位盘</h4>'
    +'<svg class="wheel" id="hjWheel" viewBox="0 0 440 440" role="img" aria-label="元会运世定位盘：外环十二会、中环三十运、内环十二世">'+s+'</svg>'
    +'<div class="wheel-detail">三环自外向内：十二会、本会三十运、本运十二世，加粗段即当前所推<br>点任一段跳到该段首年；运刻度内的小圆点示本世藏有大事锚点</div></div>';
}
/* 双盘同排：定位盘示所推之年在元会运世中的位置，先天圆图示本运所值之卦在六十四卦中的位次，
   一者读其时、一者读其卦，两盘并观方见邵子以卦记时之意。容器走通用件 .wheel-wheels（两列网格，
   窄屏堆叠），与老黄历时辰宿盘、万年历节气经络盘、佛历宿盘斋日盘同制。 */
function hjWheels(L,anchors){
  return '<div class="wheel-wheels">'+hjWheel(L,anchors)+hjXiantuWheel(L)+'</div>';
}
/* 先天六十四卦圆盘：骨架与半径一律照全站通用件（同老黄历十二时辰盘、二十八宿盘、
   道历时辰盘与圣诞斋日盘），不另立一套：viewBox 440、盘心 220、外圈 182、内界 120、
   盘心圆 78、外签 206、内签 148、弧 192、刻度 168 至 176、指针 82 至 116、热区 120 至 198。
   卦序自正上乾起顺时针行，乾至复为阳半，坤居正下，剥至姤为阴半；复当子中、姤当午中，为圆图两枢纽。
   六十四卦各占 5.625 度，弧上不书名（格窄不足容字），故外圈只环布八卦宫名，
   内签不铺六十四名，改由指针指出本运所值之卦、盘心三行载卦名宫位与值运位次，点选另格则随之改写。
   取字角同全站：最外圈环名沿圆周环布 WHEEL.ring，内签两字走 WHEEL.radial 径向散射。
   几何走 assets/wheel.js 的 WHEEL，颜色只绑 --wheel-* 令牌，本函数不写死任何颜色。 */
var XT_C,XT_ARC,XT_OUT,XT_IN,XT_CORE,XT_LAB_OUT,XT_LAB_IN,XT_HIT1,XT_TICK0,XT_TICK1,XT_P0,XT_P1;
function hjXiantuWheel(L){
  const n=WHEEL.n, px=WHEEL.px, arc=WHEEL.arc, band=WHEEL.band;
  const N=64, STEP=360/N;
  const yg=HJ.yunGua(L);
  const curIdx=Math.max(0,HJ.XT_CIRCLE.indexOf(yg?yg.name:''));
  const curDg=(curIdx+0.5)*STEP;
  let s='';
  /* 六十四格底弧：段间不留缝，整圈是一条淡环；加粗那段另出一条，随本运值卦走 */
  for(let i=0;i<N;i++) s+='<path d="'+arc(XT_ARC,i*STEP,i*STEP+STEP)+'" class="w-arc"/>';
  /* 刻度落在每格中点，与外圈宫名同轴，连成辐条 */
  for(let i=0;i<N;i++){
    const dg=(i+0.5)*STEP, ta=px(XT_TICK0,dg), tb=px(XT_TICK1,dg);
    s+='<line x1="'+n(ta[0])+'" y1="'+n(ta[1])+'" x2="'+n(tb[0])+'" y2="'+n(tb[1])+'" class="w-tick"/>';
  }
  /* 热区只取环带，不盖盘心 */
  for(let i=0;i<N;i++){
    s+='<path d="'+band(XT_IN,XT_HIT1,i*STEP,i*STEP+STEP)+'" class="w-hit'+(i===curIdx?' is-on':'')+'" data-i="'+i+'" onclick="hjPickGua('+i+')"/>';
    s+='<path d="'+band(XT_IN,XT_HIT1,i*STEP,i*STEP+STEP)+'" class="w-sel"/>';
  }
  s+='<path id="hjXtArc" d="'+arc(XT_ARC,curIdx*STEP,curIdx*STEP+STEP)+'" class="w-arc w-arc-cur"/>';
  /* 外圈：八卦宫名，沿圆周环布（WHEEL.ring），整圈读作一条环带 */
  for(let g=0;g<8;g++){
    const dg=g*45+22.5, tp=px(XT_LAB_OUT,dg);
    s+='<text x="'+n(tp[0])+'" y="'+n(tp[1])+'" class="w-lab w-lab-xl"'
      +' transform="rotate('+WHEEL.ring(dg)+' '+n(tp[0])+' '+n(tp[1])+')">'+HJ.XT_CIRCLE_GONG[g]+'</text>';
  }
  /* 内签：不复铺六十四名（格窄不足容字），只标圆图两枢纽复、姤，两字径向散射（WHEEL.radial） */
  [[31,'复'],[63,'姤']].forEach(function(pair){
    const dg=(pair[0]+0.5)*STEP, tp=px(XT_LAB_IN,dg);
    s+='<text x="'+n(tp[0])+'" y="'+n(tp[1])+'" class="w-lab w-lab-lg"'
      +' transform="rotate('+WHEEL.radial(dg)+' '+n(tp[0])+' '+n(tp[1])+')">'+pair[1]+'</text>';
  });
  s+='<circle cx="'+XT_C+'" cy="'+XT_C+'" r="'+XT_OUT+'" class="w-ring"/>';
  s+='<circle cx="'+XT_C+'" cy="'+XT_C+'" r="'+XT_IN+'" class="w-ring"/>';
  s+='<circle cx="'+XT_C+'" cy="'+XT_C+'" r="'+XT_CORE+'" class="w-core"/>';
  /* 指针只走盘心与内界圈之间，不穿过盘心文字 */
  const q0=px(XT_P0,curDg), q1=px(XT_P1,curDg);
  s+='<line id="hjXtNeedle" x1="'+n(q0[0])+'" y1="'+n(q0[1])+'" x2="'+n(q1[0])+'" y2="'+n(q1[1])+'" class="w-needle"/>';
  s+='<circle id="hjXtDot" cx="'+n(q1[0])+'" cy="'+n(q1[1])+'" r="3.5" class="w-dot"/>';
  s+=hjXtCore(HJ.XT_CIRCLE[curIdx],true,((L.yun.noG-1)%6)+1);
  return '<div class="wheel-block"><h4>先天六十四卦圆盘</h4>'
    +'<svg class="wheel" id="hjXiantu" viewBox="0 0 440 440" role="img" aria-label="先天六十四卦圆盘：外圈八卦宫名，六十四卦刻度，指针示本运所值之卦">'+s+'</svg>'
    +'<div class="wheel-detail" id="hjXtDetail">'+hjXtDetail(HJ.XT_CIRCLE[curIdx],curIdx,true)+'</div></div>';
}
/* 盘心三行：本盘无中宫概念，w-c1 取所选之卦名、随点选变（与长生十二宫盘取所选之宫同义）。
   🔴 盘心只负责立极读数，卦辞与序次一律交给盘下详情条出一遍，盘心不重复；
   三行各守盘心弦宽（半径 78 下 y=C-16 处 152.7、C+14 处 153.5、C+34 处 140.4），卦名最长四字。
   c3 同各盘一律载实质内容（老黄历载干支与钟点、宿盘载其象、风水各盘载判定），
   此处载该卦在六十卦值运中的序次，不写点选状态一类自指之词。 */
function hjXtCore(nm,isCur,yao){
  return '<text x="'+XT_C+'" y="'+(XT_C-16)+'" class="w-c1" id="hjXtC1">'+nm+'</text>'
    +'<text x="'+XT_C+'" y="'+(XT_C+14)+'" class="w-c2" id="hjXtC2">'+hjXtGong(nm)+'宫</text>'
    +'<text x="'+XT_C+'" y="'+(XT_C+34)+'" class="w-c3" id="hjXtC3">'+hjXtYunWei(nm,isCur,yao)+'</text>';
}
/* 该卦在六十卦值运中的位次：四正卦不值运，余六十卦各主六运；本运所值之卦出本运在卦内之爻 */
function hjXtYunWei(nm,isCur,yao){
  const k=HJ.GUA60.indexOf(nm);
  if(k<0) return isCur?'本会所闰':'四正不用值运';
  return isCur?'值本运第'+yao+'爻':'主第'+(k*6+1)+'至'+(k*6+6)+'运';
}
/* 卦属何宫：先天圆图八宫按圆图次序八分，宫名即该段下卦 */
function hjXtGong(nm){ const gi=HJ.guaInfo(nm); return gi?gi.lower:''; }
/* 盘下详情条：卦名、序次、卦辞在此出一遍，盘心不载 */
function hjXtDetail(nm,idx,isCur){
  return (isCur?'本运所值之卦　':'')+nm+'，圆图第'+(idx+1)+'卦，属'+hjXtGong(nm)+'宫'
    +'<br>卦辞：'+(ciOf(nm)||'未载');
}
/* 值年卦六十年速查表：按甲子一轮排，逐年一列，锚点与算式见起例说明。
   表随所推年份走，本年在表中自见位置，不必逐年试算。 */
function hjYearTable(L){
  const span=60, JIAZI_ANCHOR=1984;
  /* 轮首对齐甲子一轮：与民间流传的六十年表同起同止，故逐年干支与卦序可自相校验 */
  const start=Math.floor((L.A-JIAZI_ANCHOR)/span)*span+JIAZI_ANCHOR;
  let h='<table class="hj-np"><thead><tr><th>公元年</th><th>干支</th><th>序</th><th>值年卦</th><th>公元年</th><th>干支</th><th>序</th><th>值年卦</th></tr></thead><tbody>';
  for(let k=0;k<span/2;k++){
    const a=start+k, b=start+k+span/2;
    /* 绛底标在行上（本页着色规则即 .hj-np tr.hj-row-shi td），标在单元格上取不到底色 */
    const cls=(a===L.A||b===L.A)?' class="hj-row-shi"':'';
    h+='<tr'+cls+'>';
    [a,b].forEach(function(A){
      const g=HJ.yearGuaCalc(A);
      h+='<td class="hj-go" onclick="jumpYearTo('+A+')">'+HJ.fmtYear(A)+'</td><td>'+HJ.gzOf(A)+'</td><td>第'+g.seq+'卦</td><td>'+g.name+'</td>';
    });
    h+='</tr>';
  }
  return h+'</tbody></table>';
}
/* 元会运世总表：一元三百六十运全景，逐运一列，会序、会内运序、十干、所值之卦与起止年。
   本页别处只出本运一张，此表补全景，数据自 yunTableAll 出，不另造。 */
function hjYunTable(L){
  const rows=HJ.yunTableAll(L.yuanNo);
  let h='<table class="hj-np"><thead><tr><th>会</th><th>运</th><th>干</th><th>值卦</th><th>起止</th><th>会</th><th>运</th><th>干</th><th>值卦</th><th>起止</th></tr></thead><tbody>';
  for(let k=0;k<180;k++){
    const p=rows[k], q=rows[k+180];
    /* 本运先判、同会次之：同会条款不得压过本运，故两项同真时只留绛底 */
    const cls=(p.noG===L.yun.noG||q.noG===L.yun.noG)?' class="hj-row-shi"'
      :((p.huiIdx===L.hui.idx||q.huiIdx===L.hui.idx)?' class="hj-row-hui"':'');
    h+='<tr'+cls+'>';
    [p,q].forEach(function(r){
      h+='<td>'+r.huiZhi+'</td><td>'+r.noG+'（'+r.noH+'）</td><td>'+r.gan+'</td><td>'+HJ.shortGuaName(r.gua)+'</td><td>'+fmtRangeShort(r.start,r.end)+'</td>';
    });
    h+='</tr>';
  }
  return h+'</tbody></table>';
}
/* 先天六十四卦方图：方圆二图并称，圆图象天、方图象地，缺方图则邵子先天之学只讲了一半。
   八八六十四格，横八行自右而左、纵八列自上而下，行主下卦（内卦）、列主上卦（外卦），
   逐行读之即圆图之序；对角八格为八纯卦，乾坤坎离四正居对角之四，即去四正不用之所指。
   形制走本页数据表（表头绛纸淡底、绛浅线描格），不另起卡片：格内只书名，本运所值之卦淡底标出，
   四正卦以绛字别之。方图只示卦位，不承担跳年，与圆图同属只读之图。 */
function hjFangtu(curGua){
  const G8=['乾','兑','离','震','巽','坎','艮','坤'];
  const FOUR=['乾为天','坤为地','坎为水','离为火'];
  let h='<table class="hj-np hj-ft"><thead><tr><th></th>';
  G8.forEach(g=>{ h+='<th class="hj-ft-h">'+g+'</th>'; });
  h+='</tr></thead><tbody>';
  HJ.GUA_SQUARE.forEach(function(row,r){
    h+='<tr><th class="hj-ft-h">'+G8[r]+'</th>';
    row.forEach(function(nm){
      const cls=nm===curGua?'hj-ft-on':(FOUR.indexOf(nm)>=0?'hj-ft-zs':'');
      h+='<td'+(cls?' class="'+cls+'"':'')+'>'+HJ.shortGuaName(nm)+'</td>';
    });
    h+='</tr>';
  });
  return h+'</tbody></table>';
}
/* 点选圆图一格：指针、加粗弧、盘心三行与盘下详情条随之改写，不改年份（本盘只读卦位，不承担跳年） */
function hjPickGua(i){
  const root=document.getElementById('hjXiantu'); if(!root) return;
  const nm=HJ.XT_CIRCLE[i]; if(!nm) return;
  const STEP=360/64, dg=(i+0.5)*STEP;
  WHEEL.pick('hjXiantu',i);
  const arcs=root.querySelectorAll('.w-arc:not(.w-arc-cur)');
  const cur=document.getElementById('hjXtArc');
  if(cur&&arcs[i]) cur.setAttribute('d',arcs[i].getAttribute('d'));
  const q0=WHEEL.px(XT_P0,dg), q1=WHEEL.px(XT_P1,dg);
  const nd=document.getElementById('hjXtNeedle'), dt=document.getElementById('hjXtDot');
  if(nd){ nd.setAttribute('x1',WHEEL.n(q0[0])); nd.setAttribute('y1',WHEEL.n(q0[1]));
          nd.setAttribute('x2',WHEEL.n(q1[0])); nd.setAttribute('y2',WHEEL.n(q1[1])); }
  if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
  const isCur=!!(LAST && LAST.L && HJ.yunGua(LAST.L).name===nm);
  const yao=isCur?((LAST.L.yun.noG-1)%6+1):0;
  WHEEL.text('hjXtC1',nm);
  WHEEL.text('hjXtC2',hjXtGong(nm)+'宫');
  WHEEL.text('hjXtC3',hjXtYunWei(nm,isCur,yao));
  const det=document.getElementById('hjXtDetail');
  if(det) det.innerHTML=hjXtDetail(nm,i,isCur);
}
/* 以元经会：纯干支方阵逐世定位。1元为12会、30运、12世之乘积，共4320世。
   引擎 HuangJiYJH 由维基文库四库本卷01、卷02 反验生成，坐标由世序 N 确定性推出，
   与 HJ.locate 的世序映射同构。本模块把抽象世序落到公历年份范围并显示。 */
var HJ_YJH_ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
function hjYjhYears(n){
  var Y0=HJ.CONST.Y0, SHI=HJ.CONST.SHI;
  return { start:Y0+(n-1)*SHI, end:Y0+n*SHI-1 };
}
function hjYjhSingle(s){
  var y=hjYjhYears(s.n);
  var yunArr=HuangJiYJH.yjhYun(s.yunXu), a=yunArr[0], b=yunArr[yunArr.length-1];
  var huiArr=HuangJiYJH.yjhHui(s.huiXu), ha=huiArr[0], hb=huiArr[huiArr.length-1];
  return '<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>项</th><th>定位</th><th>公历年份</th></tr></thead><tbody>'
    +'<tr><td>世序</td><td>第'+s.n+'世（1元4320世之第'+s.n+'）</td><td>'+HJ.fmtYear(y.start)+' 至 '+HJ.fmtYear(y.end)+'</td></tr>'
    +'<tr><td>元</td><td>'+s.yuan+'元（一元四千三百二十世）</td><td></td></tr>'
    +'<tr><td>会</td><td>'+s.hui+'会（第'+s.huiXu+'会，全元第'+ha.n+'至'+hb.n+'世）</td><td></td></tr>'
    +'<tr><td>运</td><td>经运之'+s.yun+'（全元第'+s.yunXu+'运，会内第'+s.yunXuHui+'运，第'+a.n+'至'+b.n+'世）</td><td></td></tr>'
    +'<tr><td>世支</td><td>经世之'+s.shi+'（运内第'+s.shiXu+'世）</td><td></td></tr>'
    +'</tbody></table></div>';
}
function hjYjhHuiView(huiXu){
  var zhi=HJ_YJH_ZHI[huiXu-1], rows='';
  for(var yh=1;yh<=30;yh++){
    var yunXu=(huiXu-1)*30+yh, arr=HuangJiYJH.yjhYun(yunXu);
    var s0=arr[0], s1=arr[arr.length-1], y0=hjYjhYears(s0.n), y1=hjYjhYears(s1.n);
    rows+='<tr><td>第'+yh+'运</td><td>'+s0.yun+'</td><td>第'+s0.n+'至'+s1.n+'世</td><td>'+HJ.fmtYear(y0.start)+' 至 '+HJ.fmtYear(y1.end)+'</td></tr>';
  }
  return '<div class="sub-note">'+zhi+'会（第'+huiXu+'会）含三十运三百六十世，下表逐运列出其运干、世序区间与公历年份范围。</div>'
    +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>会内运序</th><th>运干</th><th>世序区间</th><th>公历年份</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function hjYjhGo(){
  var box=document.getElementById('hjYjhOut'); if(!box) return;
  var nEl=document.getElementById('hjYjhN'), n=parseInt(nEl?nEl.value:'',10);
  if(n>=1&&n<=4320){ box.innerHTML=hjYjhSingle(HuangJiYJH.yjhShi(n)); return; }
  var huiZhi=(document.getElementById('hjYjhHui')||{}).value;
  var yunEl=document.getElementById('hjYjhYun'), yunInHui=parseInt(yunEl?yunEl.value:'',10);
  var shiZhi=(document.getElementById('hjYjhShi')||{}).value;
  var hi=HJ_YJH_ZHI.indexOf(huiZhi);
  if(hi<0){ box.innerHTML='<div class="sub-note">请选择会支。</div>'; return; }
  if(!(yunInHui>=1&&yunInHui<=30)){ box.innerHTML='<div class="sub-note">会内运序须为 1 至 30 的整数。</div>'; return; }
  var si=HJ_YJH_ZHI.indexOf(shiZhi);
  if(si<0){ box.innerHTML='<div class="sub-note">请选择世支。</div>'; return; }
  box.innerHTML=hjYjhSingle(HuangJiYJH.yjhShi((hi*30+yunInHui-1)*12+si+1));
}
function hjYjhHuiAll(){
  var box=document.getElementById('hjYjhOut'); if(!box) return;
  var huiZhi=(document.getElementById('hjYjhHui')||{}).value, hi=HJ_YJH_ZHI.indexOf(huiZhi);
  if(hi<0){ box.innerHTML='<div class="sub-note">请选择会支。</div>'; return; }
  box.innerHTML=hjYjhHuiView(hi+1);
}
function hjYjhYunAll(){
  var box=document.getElementById('hjYjhOut'); if(!box) return;
  var huiZhi=(document.getElementById('hjYjhHui')||{}).value, hi=HJ_YJH_ZHI.indexOf(huiZhi);
  var yunEl=document.getElementById('hjYjhYun'), yunInHui=parseInt(yunEl?yunEl.value:'',10);
  if(hi<0){ box.innerHTML='<div class="sub-note">请选择会支。</div>'; return; }
  if(!(yunInHui>=1&&yunInHui<=30)){ box.innerHTML='<div class="sub-note">会内运序须为 1 至 30 的整数。</div>'; return; }
  var arr=HuangJiYJH.yjhYun(hi*30+yunInHui), rows=arr.map(function(s){
    var y=hjYjhYears(s.n);
    return '<tr><td>第'+s.n+'世</td><td>'+s.shi+'（运内第'+s.shiXu+'世）</td><td>'+HJ.fmtYear(y.start)+' 至 '+HJ.fmtYear(y.end)+'</td></tr>';
  }).join('');
  box.innerHTML='<div class="sub-note">'+HJ_YJH_ZHI[hi]+'会第'+yunInHui+'运（经运之'+arr[0].yun+'，全元第'+(hi*30+yunInHui)+'运）含十二世，下表逐世列出其世支与公历年份范围。</div>'
    +'<div class="hj-np-wrap"><table class="hj-np"><thead><tr><th>世序</th><th>世支</th><th>公历年份</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
