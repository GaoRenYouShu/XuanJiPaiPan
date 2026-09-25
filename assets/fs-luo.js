/* 风水页罗经立向盘（三盘三针）共享件：骨架、取角、盘面绘制与点选三件套。
 *
 * 两页同一套函数：盘面文案与盘下详情条按页以参数区分，骨架与几何只此一处，改一处两页同改。
 * 本件不含盘下详情条（两页文案不同：阴宅给三针落山、用事、本设坐山定盘与分金环读法，
 * 阳宅给立向判定与到山方煞），详情条仍由各页自负。
 *
 * 骨架 528：圈数多于他盘（周天刻度、正兼向度数带、三盘三针三环、百二十分金共六层），
 * 440 骨架可用径向仅 104 单位而六层按站内层宽需 183 单位，装不下，故另立一套，见规则档第七节。
 * 径向分配（自盘心向外）：盘心 56 载两行读数、地盘正针 28、百二十分金 52、人盘中针 28、
 * 天盘缝针 28、正兼向度数带 26、周天刻度 28，合计 246。正针环内沿与盘心同沿，中间不留空带。
 * 层序依指南由内向外：地盘正针（第四层）在最内，其外即地盘正针百二十分金（第六层），
 * 再外为人盘中针（第七层）、天盘缝针（第九层）。真实罗盘正针在内、分金在二十四山之外，
 * 读数自内而外先正针后分金；若把分金压到盘心一侧，首读层即变成分金，与真实盘次序相左。
 * 盘心只占外圈半径的百分之二十三：盘心是盘眼，只留立极结论与判定两行，
 * 三针落山与分金线位随点选走盘下详情条，同一句话不在盘上盘下各出一遍。
 * 盘心两行的最大包围盒反推：最宽的立向判定行（骑缝空亡态）取十号时半宽五十单位，
 * 落在 y 十处的下角距盘心五十二点二单位，尚余三点八单位，不出盘心圆。
 * 风水页罗经盘为规则档第七条登记之外的独立骨架，复检时不得回改 440 那套。
 *
 * 取角以地盘正针为基准（子在下、午在上），中针逆偏七点五度、缝针顺偏七点五度。
 * 盘内字色一律取本页主色，按 fill-opacity 分正针、中针、缝针三档浓淡：
 * 近黑档是留给大标题的，密集小字用它会把盘面压成一片黑，不成纸本调。
 *
 * 用法（页面侧）：
 *   const L=FS_LUO;
 *   L.wheelSvg({id:'fsYShanWheel', curId:'fsYShanCur', pick:'fsPickYShan', sel:FS_YSHAN_SEL,
 *     degOf:i=>..., bad:i=>..., core:i=>[行一, 行二, 行二色], label:'…'})
 *   L.needle({id:'fsYShanWheel', needleId:'fsYShanNeedle', dotId:'fsYShanDot', i, degOf})
 *   L.pick({id, curId, i, needleId, dotId, degOf})   点选三件套：热区 is-on、环名 w-lab-cur、当前弧 d
 */
(function(global){
'use strict';
const LY_C=264, LY_OUT=246, LY_TICK0=218, LY_JIAN0=192,
  LY_R1=164, LY_R2=136, LY_R3=84, LY_FEN0=84, LY_CORE=56, LY_DEGNUM=256;
/* 盘面角自正上起顺时针增，故减九十度；盘心在 LY_C */
function px(r,deg){ const a=(deg-90)*Math.PI/180; return [LY_C+r*Math.cos(a), LY_C+r*Math.sin(a)]; }
function arc(r,a0,a1){
  const p0=px(r,a0), p1=px(r,a1), lg=(a1-a0)>180?1:0;
  return `M${WHEEL.n(p0[0])} ${WHEEL.n(p0[1])}A${r} ${r} 0 ${lg} 1 ${WHEEL.n(p1[0])} ${WHEEL.n(p1[1])}`;
}
function band(r0,r1,a0,a1){
  const A=px(r1,a0), B=px(r1,a1), D=px(r0,a1), E=px(r0,a0), lg=(a1-a0)>180?1:0;
  return `M${WHEEL.n(A[0])} ${WHEEL.n(A[1])}A${r1} ${r1} 0 ${lg} 1 ${WHEEL.n(B[0])} ${WHEEL.n(B[1])}`
    +`L${WHEEL.n(D[0])} ${WHEEL.n(D[1])}A${r0} ${r0} 0 ${lg} 0 ${WHEEL.n(E[0])} ${WHEEL.n(E[1])}Z`;
}
/* 一百二十分金逐格天干：每山五分金各三度，按本山双山所属地支阴阳取五子
   （阳支配甲丙戊庚壬、阴支配乙丁己辛癸） */
function fenGan(n){
  const FS=global.FENGSHUI;
  const shan=FS.SHAN_LIST[Math.floor(n/5)];
  const zhi=FS.SHAN_SHUANGZHI[shan]||shan;
  return (FS.ZHI.indexOf(zhi)%2===0?['甲','丙','戊','庚','壬']:['乙','丁','己','辛','癸'])[n%5];
}
/* 游标：自盘心圆直出外沿，指向所选之山的取度（盘面角为地理度加一百八十，子在下） */
function needle(o){
  const root=document.getElementById(o.id); if(!root) return;
  const ln=root.querySelector('#'+o.needleId), dt=root.querySelector('#'+o.dotId);
  if(!ln||!dt) return;
  const pa=(((o.degOf(o.i)+180)%360)+360)%360;
  const a=px(LY_CORE,pa), c=px(LY_OUT,pa);
  ln.setAttribute('x1',WHEEL.n(a[0])); ln.setAttribute('y1',WHEEL.n(a[1]));
  ln.setAttribute('x2',WHEEL.n(c[0])); ln.setAttribute('y2',WHEEL.n(c[1]));
  dt.setAttribute('cx',WHEEL.n(c[0])); dt.setAttribute('cy',WHEEL.n(c[1]));
}
/* 点选三件套：热区 is-on、带 data-i 的环名 w-lab-cur、当前弧 d 取自本格逐格弧（不另算角度） */
function pick(o){
  WHEEL.pick(o.id,o.i);
  WHEEL.lab(o.id,o.i);
  const root=document.getElementById(o.id), cur=document.getElementById(o.curId);
  if(root&&cur){
    const arcs=root.querySelectorAll('.w-arc:not(.w-arc-cur)');
    if(arcs[o.i]) cur.setAttribute('d',arcs[o.i].getAttribute('d'));
  }
  needle(o);
}
/* 盘面绘制。opts：
     id、curId、pick（点选函数名）、sel（当前山序）、degOf（山序取度，供游标）、
     bad（山序判是否犯煞，犯煞之山取凶色）、core（山序出盘心两行文案与第二行色）、label（无障碍说明） */
function wheelSvg(o){
  const FS=global.FENGSHUI;
  const sel=o.sel;
  let s='';
  /* 正针环底色：三盘之中正针为立向基准，独予淡底使其自成一盘，中针、缝针留白为宾 */
  s+=`<circle cx="${LY_C}" cy="${LY_C}" r="${(LY_CORE+LY_R3)/2}" fill="none" stroke="var(--wheel-line)" stroke-opacity=".5" stroke-width="${LY_R3-LY_CORE}"/>`;
  /* 正针环逐格弧：本环二十四格，本身不着色，专作点选态取 d 之源 */
  for(let i=0;i<24;i++){
    const d=FS.fwShanDeg(i);
    s+=`<path d="${arc((LY_CORE+LY_R3)/2,d-7.5,d+7.5)}" class="w-arc" style="stroke-width:${LY_R3-LY_CORE};stroke-opacity:0"/>`;
  }
  /* 周天三百六十度：每度短线、每五度中线、每十五度长线，每三十度标数字 */
  for(let d=0;d<360;d++){
    const r2=d%15===0?LY_TICK0:(d%5===0?LY_OUT-16:LY_OUT-8);
    const a=px(LY_OUT,d), c=px(r2,d);
    s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="${d%15===0?'w-tick-j':'w-tick'}"/>`;
  }
  for(let d=0;d<360;d+=30){
    const p=px(LY_DEGNUM,d);
    s+=`<text x="${WHEEL.n(p[0])}" y="${WHEEL.n(p[1])}" text-anchor="middle" dominant-baseline="central" style="font-size:9px;fill:var(--fy);fill-opacity:.55">${d}</text>`;
  }
  /* 正兼向度数带：山界全长线、山心中线、正向九度界（中线左右各四点五度），判定走刻度形态与盘下详情条 */
  for(let i=0;i<24;i++){
    const d=FS.fwShanDeg(i);
    let a=px(LY_JIAN0,d-7.5), c=px(LY_TICK0,d-7.5);
    s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick-j"/>`;
    a=px(LY_JIAN0,d); c=px(LY_JIAN0+13,d);
    s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
    for(const k of [-1,1]){
      a=px(LY_TICK0-9,d+k*4.5); c=px(LY_TICK0,d+k*4.5);
      s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
    }
  }
  /* 三盘三针：天盘缝针、人盘中针、地盘正针。三环同取本页主色，只以 fill-opacity 分浓淡，
     正针为立向基准取全浓与最大字号，中针、缝针依次转淡，使三环有主次可辨，不致读成三重影；
     正针环犯煞之山取凶色且不加淡。字号取环厚（二十八）的四成上下，字不顶圈线，环内留白。
     正针环在最内紧贴盘心，其外才是百二十分金、人盘中针、天盘缝针，合指南由内而外的层序 */
  const rings=[
    {r0:LY_R1,r1:LY_JIAN0,off:7.5, fs:11,op:.6, fill:'var(--fy)'},
    {r0:LY_R2,r1:LY_R1,   off:-7.5,fs:11,op:.78,fill:'var(--fy)'},
    {r0:LY_CORE,r1:LY_R3, off:0,   fs:12,op:1,  fill:'var(--fy)'}
  ];
  for(const rg of rings){
    const rc=(rg.r0+rg.r1)/2, zheng=rg.off===0;
    for(let i=0;i<24;i++){
      const d=FS.fwShanDeg(i)+rg.off, p=px(rc,d);
      const ba=zheng&&o.bad(i);
      const fill=ba?'var(--wheel-bad)':rg.fill;
      s+=`<text x="${WHEEL.n(p[0])}" y="${WHEEL.n(p[1])}" class="w-lab${i===sel?' w-lab-cur':''}" data-i="${i}"`
        +` style="font-size:${rg.fs}px;fill:${fill};fill-opacity:${ba?1:rg.op}"`
        +` transform="rotate(${WHEEL.ring(d)} ${WHEEL.n(p[0])} ${WHEEL.n(p[1])})">${FS.SHAN_LIST[i]}</text>`;
    }
  }
  /* 百二十分金：二十四山每山五分金、每分三度，全环一百二十格。
     每山五格的位置是定数：居中一格为戊己龟甲（空亡），其左右各一格为丙庚丁辛旺相（珠宝线），
     两端两格为甲壬乙癸孤虚（火坑线）。本环只画前两档。
     居中一格取凶色长线：全环只有这一个位子要人避开，落此即空亡，值得单独一支色。
     左右两格取本页主色短线，与圈线同族而更淡，读作可取的一格，不抢红线的眼。
     线长按环厚（五十二）的七成与四成半取三十六与二十四，环外沿仍留十六单位空带，
     使本环读作一道刻度，不读作一片扇骨，也不与正针环的圈线顶在一起。
     孤虚不画：其线色与圈线无从分辨，一百二十格里多出的四十八条只把环面填成一片梳齿。
     环面因此只有一支主色加一支警示色，不引绿：红绿是互补色，并置即成一柄花梳子，
     与本页纸本调也不是一族。某山某分金的吉凶另有文字口径（盘下详情条），
     故本环只作位置提示，不逐格着色到满。 */
  const fen0=FS.fwShanDeg(0)-7.5;
  for(let n=0;n<120;n++){
    const w=FS.wangXiang(fenGan(n));
    if(w!=='旺'&&w!=='相'&&w!=='龟甲') continue;
    const kong=w==='龟甲', d=fen0+3*n;
    const a=px(LY_FEN0,d), c=px(LY_FEN0+(kong?36:24),d);
    s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" style="stroke:${kong?'var(--wheel-bad)':'var(--fy)'};stroke-opacity:${kong?.8:.38};stroke-width:${kong?1.6:1}"/>`;
  }
  /* 圈线：自外圈起依次为周天刻度内沿、正兼向带外沿与内沿、缝针中针界线、中针分金界线、分金正针界线、正针内沿 */
  const circles=[LY_OUT,LY_TICK0,LY_JIAN0,LY_R1,LY_R2,LY_R3,LY_CORE];
  for(let i=0;i<circles.length;i++){
    const edge=(i>0&&i<circles.length-1);
    s+=`<circle cx="${LY_C}" cy="${LY_C}" r="${circles[i]}" class="w-ring" style="stroke-width:${edge?1.2:1};${edge?'stroke:var(--wheel-arc);stroke-opacity:.3':''}"/>`;
  }
  s+=`<circle cx="${LY_C}" cy="${LY_C}" r="${LY_CORE}" class="w-core" style="stroke:var(--wheel-arc);stroke-opacity:.3"/>`;
  /* 点选态：正针环上所选之山的一段高亮弧，d 与逐格弧同源 */
  s+=`<path id="${o.curId}" class="w-arc w-arc-cur" d="${arc((LY_CORE+LY_R3)/2,FS.fwShanDeg(sel)-7.5,FS.fwShanDeg(sel)+7.5)}" style="stroke-width:${LY_R3-LY_CORE};stroke-opacity:.2"/>`;
  /* 热区：按正针山名分格，径向自正针内沿至正兼向带外沿，点任一处皆按正针落山选中 */
  for(let i=0;i<24;i++){
    const d=FS.fwShanDeg(i), bd=band(LY_CORE,LY_TICK0,d-7.5,d+7.5);
    s+=`<path d="${bd}" class="w-hit${i===sel?' is-on':''}" data-i="${i}" onclick="${o.pick}(${i})"/>`;
    s+=`<path d="${bd}" class="w-sel"/>`;
  }
  /* 游标：自盘心圆直出外沿，指向所选之山的取度；盘面角为地理度加一百八十（子在下） */
  const pa=(((o.degOf(sel)+180)%360)+360)%360;
  const q0=px(LY_CORE,pa), q1=px(LY_OUT,pa);
  s+=`<line id="${o.needleId}" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle" style="stroke-opacity:.55"/>`
    +`<circle id="${o.dotId}" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="4" class="w-dot"/>`;
  /* 盘心两行：行距与字号按盘心半径五十六反推，最宽态（骑缝空亡）取十号时不出盘心圆。 */
  const ct=o.core(sel);
  const ys=[-10,10], sz=[13,10];
  const fills=['var(--fy)',ct[2]];
  for(let i=0;i<2;i++){
    s+=`<text id="${o.c1}${i+1}" x="${LY_C}" y="${LY_C+ys[i]}" text-anchor="middle" dominant-baseline="central"`
      +` style="font-size:${sz[i]}px;fill:${fills[i]};font-weight:700">${ct[i]}</text>`;
  }
  return `<svg class="wheel wheel-luo" id="${o.id}" viewBox="0 0 528 528" role="img" aria-label="${o.label}">${s}</svg>`;
}
global.FS_LUO={LY_C,LY_OUT,LY_TICK0,LY_JIAN0,LY_R1,LY_R2,LY_R3,LY_FEN0,LY_CORE,LY_DEGNUM,
  px,arc,band,fenGan,needle,pick,wheelSvg};
})(typeof window!=='undefined'?window:this);
