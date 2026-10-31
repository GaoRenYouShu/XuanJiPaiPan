
const LENO_TONE=c=>c.tone===1?'吉牌':c.tone===-1?'需留意之牌':'中性牌';
/* 大全景时区（按宫位所在列：1-2 过去、3-4 当下、5-6 未来）与四角、中央 */
const GT_ZONE=h=>{const c=(h-1)%6;return c<2?'过去':c<4?'当下':'未来';};
const GT_CORNERS=[[1,'起点与主题'],[6,'大势所向'],[31,'收束将近'],[36,'终局归宿']];
const GT_CENTER=[15,16,21,22];
/* 位×牌合断：位置角色 × 牌面吉凶基调（1 吉 0 中 -1 滞）组合成一句断语 */
const COMBO_LN={
  guide:{1:'此牌给出明确可行的指引，照做即是',0:'指引中性，宜再观察一轮','-1':'此牌提醒先停下整理，勿急着走'},
  past:{1:'来处有助力，旧日积累仍是本钱',0:'往事平叙，影响渐淡','-1':'旧事余波未平，宜先了结根源'},
  state:{1:'现状与牌义相成，势头正可用',0:'现状平稳，留意变量即可','-1':'现状承压，牌面照见症结所在'},
  future:{1:'走向向好，顺势推进可期',0:'走向未定，随当下选择而变','-1':'走向有阻，宜提前布局规避'},
  block:{1:'阻碍中藏生机，此位得此牌反是转机',0:'阻力不重，属可协商的摩擦','-1':'阻力确实棘手，先解结再图进'},
  advice:{1:'牌面赞成推进，宜果断执行',0:'宜观望评估，择机而动','-1':'宜收敛调整，勿沿旧路硬推'},
  env:{1:'外部环境于你有助，可借势',0:'外缘中性，风向未定','-1':'外部压力不小，宜减少消耗'},
  self:{1:'你自身状态与能量正处佳位',0:'你的态度决定走向，先安顿自己','-1':'当下自我消耗较大，宜先照顾自己'},
  other:{1:'对方姿态开放，互动可期',0:'对方态度含蓄，宜直接沟通','-1':'对方有所保留，或自顾不暇'},
  result:{1:'结局偏顺，可安心收官',0:'结局平顺中有保留，落点取决于过程','-1':'结局偏滞涩，宜调整路径再收束'},
  core:{1:'核心明亮，整局有主心骨',0:'核心平稳，成事在人为','-1':'核心承压，此局之结在此牌'}
};
/* Fisher-Yates 洗牌 */
function shuffle(a){ return xjShuffle(a); }
function comboLine(p){return (COMBO_LN[p.role]&&COMBO_LN[p.role][p.card.tone])||'';}
function keyPick(picks,sp){
  const byPos=n=>picks.find(p=>p.pos===n);
  return byPos('结果')||byPos('走向')||byPos('⑤ 核心')||byPos('归宿')||byPos('指引')||picks[picks.length-1];
}
let LAST=null;
function draw(){
 try{
  const sp=document.getElementById('spread').value;
  const sig=document.getElementById('sig').value;
  const layout=POS[sp];
  const deck=shuffle(LENO_DECK.slice());
  const picks=layout.map(o=>({card:deck.pop(),pos:o.pos,desc:o.desc,role:o.role||'state',cls:o.cls||'',house:sp==='gt'?(o.pos.replace('宫','')|0):0}));
  LAST={q:document.getElementById('question').value,sp,key:document.getElementById('spread').selectedOptions[0].text,sig,picks:null};
  renderSpread(picks,sp);
 }catch(e){ document.getElementById('out').innerHTML='<p class="notice">抽牌出错：'+(e.message||e)+'</p>'; }
}
/* 指标牌选择仅关系阵与大全景用到 */
function sigShow(){
  const sp=document.getElementById('spread').value;
  document.getElementById('sigField').style.display=(sp==='rel'||sp==='gt')?'':'none';
}
/* 卡面：小牌阵用整卡，大全景用宫位小砖 */
function cardFace(p,idx){
  const c=p.card;
  return `<div class="leno-card ${p.cls}" onclick="lenoOpen(${idx})">
    <div class="leno-pos">${p.pos}</div>
    <div class="leno-em">${c.em}</div>
    <div class="leno-name">${c.no}. ${c.n}</div>
    <div class="leno-k2">${c.kw.slice(0,2).join('、')}</div>
    <div class="leno-hint">${comboLine(p)}</div>
  </div>`;
}
function gtTile(p,idx){
  const c=p.card;
  const isSig=(c.no===28||c.no===29);
  return `<div class="gt-tile ${isSig?'sig':''}" onclick="lenoOpen(${idx})">
    <div class="gt-h">${p.pos} ${LENO_HOUSE[p.house]}</div>
    <div class="gt-em">${c.em}</div>
    <div class="gt-n">${c.no}. ${c.n}</div>
    <div class="gt-k2">${c.kw.slice(0,2).join('、')}</div>
    ${isSig?`<span class="gt-badge">${sigName(c.no)}</span>`:''}
  </div>`;
}
function sigName(no){
  const sel=document.getElementById('sig');
  const s=(sel&&sel.value)||'f';
  const n=Number(no);
  if(s==='auto') return n===28?'男牌':'女牌';
  return n===28?(s==='m'?'我':'他'):(s==='f'?'我':'她');
}
function renderSpread(picks,sp){
  LAST.picks=picks;
  let cardsHtml='';
  if(sp==='9'){ cardsHtml=`<div class="leno-9">${picks.map(cardFace).join('')}</div>`; }
  else if(sp==='box'){ /* 下排落位 8→5（右→左），镜像两两垂直相对 */
    const order=[0,1,2,3,7,6,5,4];
    cardsHtml=`<div class="leno-box">${order.map(i=>cardFace(picks[i],i)).join('')}</div>`;
  }
  else if(sp==='gt'){
    cardsHtml=`<div class="leno-gt">${picks.map((p,i)=>gtTile(p,i)).join('')}</div>`;
  }
  else{ cardsHtml=`<div class="leno-row">${picks.map(cardFace).join('')}</div>`; }
  document.getElementById('out').innerHTML=`${cardsHtml}${lenoRead(sp,picks)}`;
}
/* 综合判断（表格版）：连读成句、组合词典、结构读法、吉凶统计与牌阵指南逐行进表 */
function lenoRead(sp,picks){
  const n=picks.length;
  const kp=keyPick(picks,sp);
  const keyCard=kp.card;
  const toneTxt=LENO_GOOD.includes(keyCard.n)?'整体走向偏顺、可期成。':LENO_BAD.includes(keyCard.n)?'提示阻力或考验，宜谨慎应对、做好预案。':'事态平稳，重在结合前后牌意细察。';
  let goodN=0,badN=0;
  picks.forEach(p=>{ if(p.card.tone===1)goodN++; else if(p.card.tone===-1)badN++; });
  const rows=[];
  /* 连读成句：单张无串可连，大全景 36 词太长，均不展示 */
  if(sp!=='gt'&&sp!=='1') rows.push(['连读成句','把各牌关键词串联，可理解为"'+picks.map(p=>p.card.kw[0]).join('，')+'"。']);
  if(sp==='gt'){
    gtRead(picks).forEach(r=>rows.push(r));
  }else if(sp==='9'){
    const g=i=>picks[i].card;
    ['大势层面','当下氛围','收尾走向'].forEach((lab,r)=>rows.push([['上排','中排','下排'][r],lab+'，'+lenoPair(g(r*3),g(r*3+1))+'，'+lenoPair(g(r*3+1),g(r*3+2))]));
    rows.push(['中列','纵轴贯穿，'+lenoPair(g(1),g(4))+'，'+lenoPair(g(4),g(7))]);
    rows.push(['对角线',lenoPair(g(0),g(4))+'，'+lenoPair(g(4),g(8))+'；'+lenoPair(g(2),g(4))+'，'+lenoPair(g(4),g(6))]);
  }else if(sp==='box'){
    const m=(a,b)=>lenoPair(picks[a].card,picks[b].card);
    rows.push(['近况×基调','整局底色，'+m(0,7)]);
    rows.push(['进展×阻力','推进之卡，'+m(1,6)]);
    rows.push(['远因×转机','背后之源，'+m(2,5)]);
    rows.push(['外缘×归宿','外力之落，'+m(3,4)]);
    rows.push(['上排','由近及远，'+m(0,1)+'，'+m(1,2)+'，'+m(2,3)]);
    rows.push(['下排','由远归近，'+m(4,5)+'，'+m(5,6)+'，'+m(6,7)]);
  }else{
    for(let i=0;i<picks.length-1;i++) rows.push([picks[i].pos+' → '+picks[i+1].pos,lenoPair(picks[i].card,picks[i+1].card)]);
  }
  rows.push(['关键位',kp.pos+'，'+keyCard.n+'（'+LENO_TONE(keyCard)+'），'+toneTxt]);
  rows.push(['本阵','共 '+n+' 张；吉牌 '+goodN+'、需留意之牌 '+badN+'、中性'+(n-goodN-badN)+'。']);
  const spreadGuide={
    '1':'单张即断。此牌就是当下的答案或提醒，不枝不蔓，直读其义。',
    '3':'三卡牌阵按线性时序解读，首牌明当前境况之来由，中牌见发展之趋势，末牌（结果位）为收束之归宿；读牌时以末牌作主语，前两牌为推进之铺垫。',
    '5':'五卡牌阵展开完整时间线，过去、现在、趋势层层递进，外因位交代外部推动或牵制，结果位为最终落点；读牌时以外因与趋势为变数，结果位定其结局。',
    'rel':'关系阵以我、对方双轴并读，先看双方牌义是否相容（人物牌所指），再读关系位定互动基调，阻碍位见功课，走向位收束结局；若人物牌落在 我、对方 位，所应更切。',
    '9':'九宫牌阵为全景俯瞰，中央位（⑤ 核心）为整局之焦点，四周八牌从不同面向围绕核心展开；读牌时以核心牌为纲，三行看大势、当下与收尾，中列纵轴看贯穿主线，两条对角线互为印证。',
    'box':'八宫箱阵八牌两两镜像相照，照处即见因与果、表与里，先读四组镜像定格局，再以上排由近及远、下排由远归近连读，归宿牌收束全盘。',
    'gt':'大全景(Grand Tableau)以 36 张牌落 36 宫，宫宫有定义，读法次第为先看四角定大局，再看中央四宫定核心场域，然后锁定指标牌看其宫位、四邻与马步所及，最后按左两列过去、中两列当下、右两列未来分区收束。'
  }[sp]||'';
  if(spreadGuide) rows.push(['读法指南',spreadGuide]);
  rows.push(['提醒','雷诺曼直白肯定、不作宿命之断；组合句供取向参考，请结合所问之事与现实情境综合判断。']);
  const body=rows.map(r=>'<tr><td class="k">'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('');
  return `<h3 class="rel-title">综合判断</h3><table class="ln-table"><thead><tr><th>项目</th><th>解读</th></tr></thead><tbody>${body}</tbody></table>`;
}
/* 大全景结构读法行：四角、中央、指标牌（宫位、四邻、马步）、时区统计、开篇成句 */
function gtRead(picks){
  const byH=h=>picks[h-1];
  const nm=p=>p.card.no+'.'+p.card.n;
  const corners=GT_CORNERS.map(([h,lab])=>lab+'（'+h+'宫，'+nm(byH(h))+'）').join('；');
  const center=GT_CENTER.map(h=>nm(byH(h))+'（'+h+'宫，'+LENO_HOUSE[h]+'）').join('，');
  const sel=document.getElementById('sig');
  const sigNo=(sel&&sel.value)==='m'?28:29;
  const sigPick=byH(sigNo);
  const r=Math.floor((sigPick.house-1)/6),c=(sigPick.house-1)%6;
  const around=[[r-1,c,'上'],[r+1,c,'下'],[r,c-1,'左'],[r,c+1,'右']];
  const nbrs=around.filter(([rr,cc])=>rr>=0&&rr<6&&cc>=0&&cc<6)
    .map(([rr,cc,lab])=>{const h=rr*6+cc+1;return lab+'方 '+nm(byH(h))+'（'+h+'宫，'+LENO_HOUSE[h]+'）';}).join('，');
  const kn=[];
  [[r-1,c-2],[r-1,c+2],[r+1,c-2],[r+1,c+2],[r-2,c-1],[r-2,c+1],[r+2,c-1],[r+2,c+1]].forEach(([rr,cc])=>{
    if(rr>=0&&rr<6&&cc>=0&&cc<6){const h=rr*6+cc+1;kn.push(nm(byH(h))+'（'+h+'宫，'+LENO_HOUSE[h]+'）');}
  });
  const cnt={过去:0,当下:0,未来:0};
  picks.forEach(p=>cnt[GT_ZONE(p.house)]++);
  const pairTxt=picks.slice(0,8).map((p,i)=>lenoPair(p.card,picks[i+1].card)).slice(0,7).join('；');
  /* 同宫强化：牌落自己名下的宫位，牌义加倍活化 */
  const own=picks.filter(p=>p.card.no===p.house).map(p=>p.card.no+'.'+p.card.n+'（'+p.house+'宫）');
  /* 镜像呼应：沿盘心对称（37-h）的两牌互为映照，取指标牌与四角所在的镜像对 */
  const seen={},mirTxt=[];
  [1,6,31,36,sigPick.house].forEach(h=>{
    const m=37-h,k=Math.min(h,m)+'-'+Math.max(h,m);
    if(h!==m&&!seen[k]){seen[k]=1;mirTxt.push(nm(byH(h))+'（'+h+'宫）映'+nm(byH(m))+'（'+m+'宫）');}
  });
  return [
    ['四角',corners+'。'],
    ['中央四宫','15、16、21、22 四宫居第3-4行×第3-4列，为整局核心场域，'+center+'。'],
    ['指标牌',nm(sigPick)+'落于'+sigPick.house+'宫（'+LENO_HOUSE[sigPick.house]+'，'+GT_ZONE(sigPick.house)+'区），即所问之事落在'+LENO_HOUSE[sigPick.house]+'的领域。'],
    ['四邻','贴身影响，'+nbrs+'。'],
    ['马步八点','远因脉络，'+kn.join('，')+'。'],
    ['镜像呼应','盘心对称两牌互为映照，'+mirTxt.join('；')+'。'],
    ['同宫强化',own.length?'牌落本宫、义气加倍，'+own.join('，')+'。':'无牌落本宫，宫义与牌义交叠处即事之焦点。'],
    ['首尾呼应','宫1 与宫36 首尾相扣，'+lenoPair(byH(1).card,byH(36).card)+'。'],
    ['时区统计','过去区 '+cnt['过去']+' 张、当下区 '+cnt['当下']+' 张、未来区 '+cnt['未来']+' 张，'+(cnt['未来']>cnt['过去']?'重心落在未来区，事在前进而非回望。':cnt['过去']>cnt['未来']?'重心落在过去区，旧事牵扯较多，宜先理旧再图新。':'时区均衡，事在当下盘桓，进退皆看此一步。')],
    ['开篇成句','宫1至宫8 相邻示范，'+pairTxt+'。']
  ];
}
/* 牌面详批弹窗：关键词、总义、四域牌义、扑克对应与位次信息 */
function lenoOpen(i){
  const p=(LAST&&LAST.picks||[])[i]; if(!p) return;
  const c=p.card;
  const tl=LENO_TONE(c);
  const posTxt=LAST&&LAST.sp==='gt'?(p.pos+'（'+LENO_HOUSE[p.house]+'）'):p.pos;
  document.getElementById('lnModalBox').innerHTML=`
   <div class="lm-close" onclick="lnClose()">×</div>
   <div class="lm-head">
    <div class="lm-em">${c.em}</div>
    <div class="lm-b">
     <h3>${c.no}. ${c.n} <span class="lm-en">${c.en}</span></h3>
     <div class="lm-tags"><span>${tl}</span><span>主题：${c.th}</span><span>扑克对应：${c.pc}</span><span>时间：${c.time}</span></div>
     <p class="lm-kw"><b>关键词</b>：${c.kw.join('、')}</p>
     <p class="lm-core"><b>总义</b>：${c.up}</p>
     ${c.person?`<p class="lm-person"><b>人物所指</b>：${c.person}</p>`:''}
    </div>
   </div>
   <div class="lm-grid">
    <div class="lm-dom"><h4>所象之人</h4><p>${c.person}</p></div>
    <div class="lm-dom"><h4>所主之事</h4><p>${c.area}</p></div>
    <div class="lm-dom"><h4>行动指引</h4><p>${c.advice}</p></div>
    <div class="lm-dom"><h4>时间指引</h4><p>${c.time}</p></div>
   </div>
   <div class="lm-pos"><b>位次</b>：${posTxt}　${p.desc||''}${p.desc?'<br>':''}${comboLine(p)}　（${tl}）</div>`;
  document.getElementById('lnMask').classList.add('on');
}
function lnClose(){ document.getElementById('lnMask').classList.remove('on'); }
