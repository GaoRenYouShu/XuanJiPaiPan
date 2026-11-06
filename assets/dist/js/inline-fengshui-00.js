
/* 八宅命卦（独立内联，不依赖 bazi-data.js） */
function mingGua(year,isMale){
  const y2=((year%100)+100)%100;
  let r=isMale?(year>=2000?99-y2:100-y2):(year>=2000?y2+6:y2-4);
  r=((r%9)+9)%9; if(r===0) r=9;
  if(r===5) return {gua:isMale?'坤':'艮',dong:false,group:'西四命'};
  const g={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兑',8:'艮',9:'离'}[r];
  return {gua:g,dong:['坎','震','巽','离'].includes(g),group:['坎','震','巽','离'].includes(g)?'东四命':'西四命'};
}
/* 命卦年按立春分界：立春前出生属前一年，与命理年度一致 */
function mingGuaYear(y,m,d){
  if(!y||!m||!d) return y;
  try{
    const lc=Solar.fromYmd(y,1,1).getLunar().getJieQiTable()['立春'];
    if(lc&&y*10000+m*100+d<lc.getYear()*10000+lc.getMonth()*100+lc.getDay()) return y-1;
  }catch(e){}
  return y;
}
/* 方位显示：FS.GUA_DIR 四正只给单字，显示时补正字作正北、正南、正东、正西；四隅照旧。
   本函数只供显示，查表取值（如 FS_DIR_DEG 取角）仍用 FS.GUA_DIR 原值。 */
function fsDir(g){
  const d=FS.GUA_DIR[g]||'';
  return (d==='北'||d==='南'||d==='东'||d==='西')?'正'+d:d;
}
/* 家人宫位：命卦按出生日期与性别，角色宫按乾父坤母震长男巽长女坎中男离中女艮少男兑少女；
   身体取角色宫象身，财位取命卦生气方，流年只报四煞到角色宫。 */
const FS_MEM_BODY={乾:'头、肺',坤:'腹、脾',震:'足、肝',巽:'股、胆',坎:'耳、肾',离:'眼、心',艮:'手、脾',兑:'口、肺'};
const FS_GUA_PALACE={乾:'西北',坤:'西南',震:'东',巽:'东南',坎:'北',离:'南',艮:'东北',兑:'西'};
const FS_MEM_ROLE_GUA={父:'乾',母:'坤',长男:'震',长女:'巽',中男:'坎',中女:'离',少男:'艮',少女:'兑'};
const FS_MEM_ROLE_SEX={父:'1',母:'0',长男:'1',长女:'0',中男:'1',中女:'0',少男:'1',少女:'0'};
const FS_MEM_ROLE_SWAP={父:'母',母:'父',长男:'长女',长女:'长男',中男:'中女',中女:'中男',少男:'少女',少女:'少男'};
const FS_MEM_ENV=[
  {n:1,nm:'采光不足',impact:'长期昏暗影响情绪与用眼',adv:'增加照明与浅色反射，卧室优先自然光。',conf:'高'},
  {n:2,nm:'通风不畅',impact:'空气滞浊、潮湿与呼吸道不适',adv:'形成对流，厨房与卫生间装排风，潮湿季节除湿。',conf:'高'},
  {n:3,nm:'潮湿霉味',impact:'霉斑与湿气加重呼吸道、关节不适',adv:'查渗漏与返潮，修防水、加通风除湿，霉斑及时清理。',conf:'高'},
  {n:4,nm:'噪声振动',impact:'睡眠与情绪受扰',adv:'临街窗加双层玻璃与厚帘，卧室避开噪声源。',conf:'高'},
  {n:5,nm:'排水渗漏',impact:'渗水损结构、滋生霉变',adv:'清理天沟地漏，修外墙与管道渗漏，保持宅基干燥。',conf:'高'},
  {n:6,nm:'尖角路冲邻近',impact:'直视冲射感强，心理压迫与安全风险',adv:'正对处设屏风、绿植或遮挡，减少直视与冲射感。',conf:'中'},
  {n:7,nm:'隐私视线压迫',impact:'对视与压迫感影响休息',adv:'加帘、格栅或绿植，降低对窗对视与压迫感。',conf:'高'},
  {n:8,nm:'维护安全隐患',impact:'结构、电气、燃气、防滑风险',adv:'先修结构、电气、燃气与防滑，安全优先于方位。',conf:'高'}
];
function fsMemCalc(dateStr, male){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr||''));
  if(!m) return null;
  const y=mingGuaYear(+m[1],+m[2],+m[3]);
  const g=mingGua(y,male);
  const bz=FS.baZhai(g.gua);
  const qi=bz&&bz.ji?bz.ji.find(x=>x.name==='生气'):null;
  return {y,g,palace:FS_GUA_PALACE[g.gua]||'',qi,pn:FS_GUA_NUM[g.gua]};
}
function fsMemNian(ns,pn){
  const hit=[];
  if(!ns||!pn) return '无';
  if(ns.wuHuang&&ns.wuHuang.palace===pn) hit.push('五黄');
  if(ns.taiSui&&FS.ZHI_GONG[ns.taiSui.zhi]===pn) hit.push('太岁');
  if(ns.suiPo&&FS.ZHI_GONG[ns.suiPo.zhi]===pn) hit.push('岁破');
  if(ns.sanSha&&ns.sanSha.some(x=>FS.ZHI_GONG[x.zhi]===pn)) hit.push('三煞');
  return hit.length?hit.join('、'):'无';
}
function fsMemRoleGua(role){ return FS_MEM_ROLE_GUA[role]||''; }
const FS_MEM_STAR_ALIAS={生气:'贪狼木',延年:'武曲金',天医:'巨门土',伏位:'辅弼木',绝命:'破军金',五鬼:'廉贞火',祸害:'禄存土',六煞:'文曲水'};
function fsMemStar(gua,roleGua){
  if(!gua||!roleGua) return null;
  const bz=FS.baZhai(gua); if(!bz) return null;
  const ji=(bz.ji||[]).find(x=>x.gua===roleGua);
  if(ji) return {name:ji.name,good:true};
  const x=(bz.xiong||[]).find(y=>y.gua===roleGua);
  return x?{name:x.name,good:false}:null;
}
function fsMemSyncRoles(){
  const sels=[...document.querySelectorAll('[id^=fsMemRole]')];
  const seen=new Set();
  sels.forEach(s=>{ if(s.value&&seen.has(s.value)) s.value=''; if(s.value) seen.add(s.value); });
  const used={}; sels.forEach(s=>{ if(s.value) used[s.value]=1; });
  sels.forEach(s=>{ [...s.options].forEach(o=>{ if(o.value) o.disabled=!!used[o.value]&&o.value!==s.value; }); });
}
function fsMemRoleChange(el){
  const sels=[...document.querySelectorAll('[id^=fsMemRole]')];
  const used=sels.filter(s=>s!==el).map(s=>s.value).filter(Boolean);
  if(el.value&&used.indexOf(el.value)>=0) el.value='';
  const row=el.closest('tr'), sex=row&&row.querySelector('select[id^=fsMemSex]');
  if(sex&&FS_MEM_ROLE_SEX[el.value]) sex.value=FS_MEM_ROLE_SEX[el.value];
  if(el.id==='fsMemRole1'){ fsMemBaseChange(); return; }
  fsMemSyncRoles(); drawMembers();
}
function fsMemSexChange(el){
  const row=el.closest('tr'), role=row&&row.querySelector('select[id^=fsMemRole]');
  if(role&&role.value&&FS_MEM_ROLE_SEX[role.value]&&FS_MEM_ROLE_SEX[role.value]!==el.value){
    const sw=FS_MEM_ROLE_SWAP[role.value];
    if(sw){
      const other=[...document.querySelectorAll('[id^=fsMemRole]')].find(x=>x!==role&&x.value===sw);
      if(other&&role.id==='fsMemRole1'){ other.value=role.value; role.value=sw; }
      else role.value=other?'':sw;
    }
  }
  if(el.id==='fsMemSex1'){ fsMemBaseChange(); return; }
  fsMemSyncRoles(); drawMembers();
}
function fsMemBaseChange(){
  const d=document.getElementById('fsMemDate1'), s=document.getElementById('fsMemSex1');
  const bd=document.getElementById('baseDate'), bs=document.getElementById('baseSex');
  if(d&&bd){ bd.value=d.value; bd.setAttribute('data-user-set','1'); }
  if(s&&bs) bs.value=s.value;
  fsApplyBase();
}
function fsMemEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function drawMembers(){
  const body=document.getElementById('fsMemBody'); if(!body) return;
  fsMemSyncRoles();
  const b=getBase(), ns=FS.nianSha(b.flowYear);
  const bd0=(document.getElementById('baseDate')||{}).value||'';
  const male=((document.getElementById('baseSex')||{}).value==='1');
  const d1=document.getElementById('fsMemDate1'), s1=document.getElementById('fsMemSex1');
  const bd=bd0||(d1&&d1.value)||xjNowStr().slice(0,10);
  if(d1) d1.value=bd;
  if(s1) s1.value=male?'1':'0';
  const rows=[], seen=new Set();
  const z=fsMemCalc(d1?d1.value:bd, s1?s1.value==='1':male);
  const role1El=document.getElementById('fsMemRole1');
  let role1=(role1El||{}).value||'';
  if(role1El&&s1&&role1&&FS_MEM_ROLE_SEX[role1]&&s1.value!==FS_MEM_ROLE_SEX[role1]){
    const sw=FS_MEM_ROLE_SWAP[role1];
    const used=[...document.querySelectorAll('[id^=fsMemRole]')].some(x=>x!==role1El&&x.value===sw);
    if(sw&&!used){ role1El.value=sw; role1=sw; }
  }
  const name1=((document.getElementById('fsMemName1')||{}).value||'').trim();
  if(z&&role1&&!seen.has(role1)){seen.add(role1); rows.push({role:role1,name:name1,date:d1?d1.value:bd,c:z,roleGua:fsMemRoleGua(role1)});}
  for(let i=2;i<=6;i++){
    const role=(document.getElementById('fsMemRole'+i)||{}).value||'';
    const nm=((document.getElementById('fsMemName'+i)||{}).value||'').trim();
    const dt=(document.getElementById('fsMemDate'+i)||{}).value||'';
    const sex=((document.getElementById('fsMemSex'+i)||{}).value==='1');
    const c=fsMemCalc(dt,sex);
    if(!role||!c||seen.has(role)) continue;
    seen.add(role); rows.push({role,name:nm,date:dt,c,roleGua:fsMemRoleGua(role)});
  }
  body.innerHTML=rows.length?rows.map(r=>{
    const star=r.roleGua?fsMemStar(r.c.g.gua,r.roleGua):null;
    const gong=r.roleGua?r.roleGua+'（'+FS_GUA_PALACE[r.roleGua]+'）'+(star?'，<span class="'+(star.good?'fs-badge-g':'fs-badge-r')+'">'+star.name+'（'+(FS_MEM_STAR_ALIAS[star.name]||'')+'）</span>':'，—'):'—';
    const hit=r.roleGua?fsMemNian(ns,FS_GUA_NUM[r.roleGua]):'—';
    return `<tr><td class="lbl-1">${r.role}${r.name?'（'+fsMemEsc(r.name)+'）':''}</td><td>${r.date.slice(0,4)}年</td><td>${r.c.g.gua}（${r.c.g.group}）</td><td>${gong}</td><td>${r.roleGua?FS_MEM_BODY[r.roleGua]:'—'}</td><td>${r.c.qi?fsDir(r.c.qi.gua)+'（生气）':'—'}</td><td>${hit}</td></tr>`;
  }).join(''):'<tr><td colspan="7" class="sub-note">选角色并填出生日期后出表。</td></tr>';
}
function drawEnv(){
  const out=document.getElementById('fsEnvOut'); if(!out) return;
  const hit=FS_MEM_ENV.filter(x=>{const el=document.getElementById('env-'+x.n); return el&&el.checked;});
  out.innerHTML=hit.length?'<b>环境项 '+hit.length+' 项</b>：'+hit.map(x=>x.nm).join('、')+'。<br>'+hit.map(x=>'<b>'+x.nm+'</b>：影响：'+x.impact+'；建议：'+x.adv+'；依据：现场观察，置信：'+x.conf).join('<br>'):'未勾选环境项。';
}
const FS_SW_SIDES=[
  {k:'hou',id:'ssHou',name:'后',role:'长房',good:['高起有靠','路环'],flat:['平缓','凸出','水抱'],bad:['低陷','缺失','冲射','压迫','破败','水直','路冲'],judge:{吉:'根基稳',平:'根基平常',凶:'根基弱，长房先应'}},
  {k:'zuo',id:'ssZuo',name:'左',role:'长男',good:['高起有靠','水抱','路环'],flat:['平缓','凸出'],bad:['低陷','缺失','冲射','压迫','破败','水直','路冲'],judge:{吉:'长男得势',平:'长男平常',凶:'长男受制'}},
  {k:'you',id:'ssYou',name:'右',role:'幼房',good:['平缓','水抱','路环'],flat:['凸出'],bad:['高起有靠','低陷','缺失','冲射','压迫','破败','水直','路冲'],judge:{吉:'幼房安',平:'幼房平常',凶:'幼房受制'}},
  {k:'qian',id:'ssQian',name:'前',role:'中房',good:['平缓','水抱','路环'],flat:['凸出'],bad:['高起有靠','低陷','缺失','冲射','压迫','破败','水直','路冲'],judge:{吉:'明堂得用',平:'明堂平常',凶:'明堂受煞，财源先应'}}
];
const FS_SW_ADV={
  '高起有靠':'保持完整，勿开大窗泄气。',
  '平缓':'形势平常，重在门主灶与维护。',
  '低陷':'宜补形、围墙、植树或挡土，具体从现场定。',
  '缺失':'缺位之方宜补形、遮挡，不宜再开门泄气。',
  '凸出':'凸出过甚者宜修整，避免独高招风。',
  '冲射':'正对处设屏风、绿植或遮挡，减少直视冲射。',
  '压迫':'高压方宜低伏、遮挡，门窗少开。',
  '破败':'先修破损、排水与结构，安全优先。',
  '水抱':'水宜清、缓、环抱；忌污水与急流。',
  '水直':'直水宜缓冲、遮挡，忌贴基急流。',
  '路环':'路宜环抱缓行；忌反弓与直冲。',
  '路冲':'冲门处设玄关、屏风或绿植，门少开。'
};
function fsSiShiGate(){
  const wrap=document.getElementById('ssWrap');
  if(!wrap) return false;
  const t=(document.getElementById('baseType')||{}).value||'house';
  const on=t==='house';
  wrap.hidden=!on;
  return on;
}
function drawSiShi(){
  const body=document.getElementById('ssBody'); if(!body) return;
  if(!fsSiShiGate()){
    body.innerHTML='<tr><td colspan="5" class="sub-note">当前场所类型非住宅别墅，外局四势与房份不适用。</td></tr>';
    const o=document.getElementById('ssOut'); if(o) o.textContent='';
    return;
  }
  const rows=[], bad=[];
  FS_SW_SIDES.forEach(s=>{
    const el=document.getElementById(s.id), v=el?el.value:'';
    if(!v) return;
    const lv=s.good.indexOf(v)>=0?'吉':(s.flat.indexOf(v)>=0?'平':'凶');
    let adv=FS_SW_ADV[v]||'具体从现场定。';
    if(s.k==='hou'&&v==='水抱') adv='后宜山不宜水，水抱先防潮、排水，具体从现场定。';
    if((s.k==='you'||s.k==='qian')&&v==='高起有靠') adv='过高逼压者宜遮挡、退让，不宜再抬高。';
    rows.push({s,v,lv,adv});
    if(lv==='凶') bad.push(s.name);
  });
  body.innerHTML=rows.length?rows.map(r=>'<tr><td class="lbl-1">'+r.s.name+'</td><td>'+r.v+'</td><td>'+r.s.role+'</td><td>'+r.s.judge[r.lv]+'</td><td>'+r.adv+'</td></tr>').join(''):'<tr><td colspan="5" class="sub-note">四势未选，先选后、左、右、前的主要形势。</td></tr>';
  const out=document.getElementById('ssOut');
  if(!out) return;
  if(!rows.length){ out.textContent=''; return; }
  const list=rows.map(r=>r.s.name+'方'+r.v).join('；');
  const tail=bad.length?'受煞方：'+bad.join('、')+'，先化后调。':'四势未见重煞，仍须合距离、角度、高低与流年。';
  out.innerHTML='<b>外局大势</b>：'+list+'。'+tail+' 本块只断外局大势，不入宅评总分；应期见第四层流年。';
}
/* 盘下详情条：通用件 .wheel-detail 制式 */
function fwDetail(id,html){ const e=document.getElementById(id); if(e) e.innerHTML=html; }
/* 所在地三级下拉默认停在未知地：起首若是某地，未动过表单的盘便按该地取磁偏角，
   来历不著。填充与取值走 latlng.js 的 fillPlaceTrio，各页同一份。
   手填经纬度与三级下拉是两条独立的定地途径，故手填框不归它管。 */
/* 取所在地经纬度：手填两项齐全即优先，否则按省市区经 latlng.js 取数。
   所在地未定即无坐标可取，返回空而磁偏角留空不折算（磁偏角框空即古法直读磁北），
   不回退任一城市坐标：按别人的所在地折出来的磁偏角不著来历。 */
function fsDeclTouch(){
  FS_DECL_TOUCH=document.getElementById('baseDecl').value!=='';
  fsMagNote();
}
function fsDeclNow(){ return xjNowDate(); }
/* 罗盘实测读数为磁北，按当地磁偏角折真北：东偏为正、西偏为负，真方位＝磁方位＋磁偏角。
   磁偏角留空即不折算（古法直读磁北）。 */
/* 实测坐度已填时，坐山随折算后坐度所属之山：坐度是罗盘实测读数，坐山是它的归类，两者不得各行其是。
   磁偏角折算把真北坐度推入邻山时，坐山若不跟随即误报骑缝空亡：实测坐度 100 度、磁偏角 -7.56 度，
   真北坐度 92.44 度落卯山（82.5 至 97.5 度），坐山若仍留乙则与乙山中线（105 度）差 12.56 度，
   越过 7.25 度即判骑缝空亡；坐山随坐度落卯，与卯山中线（90 度）只差 2.44 度，判正向。
   坐度留空则不动，坐山仍可自由选。取地盘正针定山，与立向口径一致。 */
/* 提示行只出专业结果：未填坐度不出；已填坐度时给折算与否与折算后坐度，
   不写取数来源、模型名、经纬度与两源差值 */
/* 重新取当地磁偏角：按所在地取数填入磁偏角框，并据新值重算全页；取不到则保持现值不动，
   不向页面报取数过程 */
/* 全局基础设定读取 */
function getBase(){
  const bd=(document.getElementById('baseDate').value||'').split('-').map(Number);
  const by=bd[0]||1990;
  const mingYear=mingGuaYear(by, bd[1], bd[2]);
  const male=document.getElementById('baseSex').value==='1';
  const sit=document.getElementById('baseSit').value||'子';
  const face=document.getElementById('baseFace').value||'午';
  const fy=parseInt(document.getElementById('baseYear2').value,10)||2026;
  const yov=parseInt(document.getElementById('baseYun').value,10)||null;
  const type=document.getElementById('baseType').value||'house';
  const doorEl=document.getElementById('baseDoor');
  const doorGua=(doorEl&&doorEl.value)||FS.SHAN_BAGUA[face]||'离';
  const dv=document.getElementById('baseDeg').value;
  const deg=fsMagTrue(dv===''?null:parseFloat(dv));
  return {birthYear:by, mingYear, male, sitShan:sit, faceShan:face, flowYear:fy, yunOv:yov, type, deg, doorGua,
    faceDeg:deg===undefined?undefined:((deg+180)%360)};
}
/* 紫白飞星历法上下文：以 lunar.js 取立春年干支、节气月支、三元阴阳遁分段 */
function FS_ZB_CTX(y,m,d){
  const solar=Solar.fromYmd(y,m,d);
  const lunar=solar.getLunar();
  const gzIdx=gz=>{ for(let k=0;k<60;k++){ if(FS.GAN[k%10]+FS.ZHI[k%12]===gz) return k; } return 0; };
  /* 跨年检索节气公历日：after=false 取最近且<=ref者，after=true 取>ref最近者（遍历近三年节气表保证跨年可得） */
  const pickJQ=(name,ref,after)=>xjPickJQ(name,ref,after,y);
  const q=y*10000+m*100+d;
  const DZ=pickJQ('冬至',q,false), YS=pickJQ('雨水',DZ,true), GY=pickJQ('谷雨',DZ,true),
        XZ=pickJQ('夏至',DZ,true), CZ=pickJQ('处暑',DZ,true), SJ=pickJQ('霜降',DZ,true);
  /* 日紫白三元阴阳遁（《选择求真》）：阳遁上元（冬至-雨水）甲子一白、中元（雨水-谷雨）七赤、下元（谷雨-夏至）四绿，顺行；
     阴遁上元（夏至-处暑）甲子九紫、中元（处暑-霜降）三碧、下元（霜降-冬至）六白，逆行；值日星=本元甲子入中星±距甲子日数 */
  let base,dir,seg;
  if(q>=DZ&&q<YS){ base=1; dir=1; seg='阳遁上元'; }
  else if(q>=YS&&q<GY){ base=7; dir=1; seg='阳遁中元'; }
  else if(q>=GY&&q<XZ){ base=4; dir=1; seg='阳遁下元'; }
  else if(q>=XZ&&q<CZ){ base=9; dir=-1; seg='阴遁上元'; }
  else if(q>=CZ&&q<SJ){ base=3; dir=-1; seg='阴遁中元'; }
  else { base=6; dir=-1; seg='阴遁下元'; }
  const dayGz=lunar.getDayInGanZhi();
  const mGz=lunar.getMonthInGanZhi();
  const yGz=lunar.getYearInGanZhiByLiChun();
  const LC=pickJQ('立春',q,false);
  const yGzYear=Math.floor(LC/10000);
  return {yGz, yGzYear, mGz, dayGz, asc:dir>0, base, off:gzIdx(dayGz), seg};
}
/* 基础设定联动：全页重算 */
function fsApplyBase(){
  fsSitFromDeg();
  drawZiBai();
  drawBazhai(); drawNianSha(); drawShan(); drawXuanKong(); drawXiuFen(); drawSanHe(); drawLingZheng(); drawLayout(); drawCui();
  drawCaiWei(); drawWenChang(); drawTaoHua(); drawLuBan(); drawLouCeng(); drawChangSuo();
  drawLiuFa(); drawLiuShi(); drawZhenJue(); drawMembers(); fsSiShiGate();
  /* 九星组合继承玄空盘，直接用同一坐向推算 */
  const b=getBase();
  const xk=FS.xuanKong(b.sitShan, b.faceShan, b.flowYear, b.deg, b.faceDeg, b.yunOv);
  if(xk) document.getElementById('cbOut').innerHTML=drawComboFromXk(xk);
  drawGaoJi(); drawSuiYun(); drawChuanGong(); drawSanYao();
  /* 重排末尾把真值刷回各层坐向与门位控件，全页十余个入口恒显示同一组值 */
  syncLocalBase();
  fsMagNote();
}
/* 填充基础坐山、向首、门位选择，向首默认对宫，门位默认向首卦（门开向首之例）；
   坐山变更时同步向首并重算全页 */
function fillBase(){
  const sitEl=document.getElementById('baseSit');
  const faceEl=document.getElementById('baseFace');
  const doorEl=document.getElementById('baseDoor');
  if(!sitEl||!faceEl) return;
  sitEl.innerHTML=FS.SHAN_LIST.map((s,i)=>`<option value="${s}">${s}山</option>`).join('');
  faceEl.innerHTML=FS.SHAN_LIST.map((s,i)=>`<option value="${s}"${i===12?' selected':''}>${s}山</option>`).join('');
  if(doorEl){ doorEl.innerHTML=GUA_OPTS; doorEl.value=FS.SHAN_BAGUA[faceEl.value]||'离'; }
  sitEl.onchange=function(){ faceEl.selectedIndex=(FS.SHAN_LIST.indexOf(this.value)+12)%24; fsApplyBase(); };
  fillLocalBase();
}
/* 各层坐向控件：全页真值只一份（基础设定那一组），层内控件只是同一真值的另一个入口。
   改任一层即写回真值再整页重排，重排末尾由 syncLocalBase 把真值刷回所有层，
   故不存在多份状态互不同步；程序赋值不触发 change 事件，也不会回环。 */
/* 各层门位控件：门位全页真值只一份（基础设定那一栏），三要、穿宫、六事三处的门位
   只是同一真值的另一个入口，机制与坐向块同（改任一处即写回真值再整页重排） */
function fsSetLocalDoor(el){
  const t=document.getElementById('baseDoor');
  if(t) t.value=el.value;
  fsApplyBase();
}
function fillLocalBase(){
  const sit=document.getElementById('baseSit'), face=document.getElementById('baseFace'), door=document.getElementById('baseDoor');
  if(!sit||!face) return;
  document.querySelectorAll('.fs-lb-sit').forEach(el=>{ el.innerHTML=sit.innerHTML; });
  document.querySelectorAll('.fs-lb-face').forEach(el=>{ el.innerHTML=face.innerHTML; });
  if(door) document.querySelectorAll('.fs-lb-door').forEach(el=>{ el.innerHTML=door.innerHTML; });
  syncLocalBase();
}
function syncLocalBase(){
  fsSyncLocalBase([
    {sel:'.fs-lb-sit',src:'baseSit'},{sel:'.fs-lb-face',src:'baseFace'},{sel:'.fs-lb-door',src:'baseDoor'},{sel:'.fs-lb-deg',src:'baseDeg'},{sel:'.fs-lb-year',src:'baseYear2'}
  ]);
}
/* 紫白飞星：年月日时四盘分开，盘式参考大六壬天地盘 */
function drawZiBai(){
  const dv=document.getElementById('zbDate').value;
  if(!dv)return;
  const [y,m,d]=dv.split('-').map(Number);
  const hh=parseInt(document.getElementById('zbHour').value,10);
  const ctx=FS_ZB_CTX(y,m,d);
  const yb=FS.yearZiBai(ctx.yGzYear);
  const mb=FS.monthZiBai(ctx.yGz[1],ctx.mGz[1]);
  const dayGz=ctx.dayGz;
  const dzb=FS.dayZiBai(ctx.off,ctx.asc,ctx.base);
  const hhNow=hh>=0?hh:0;
  const hzb=FS.hourZiBai(dayGz[1],hhNow,ctx.asc);
  const wuZhu={'甲':'甲','己':'甲','乙':'丙','庚':'丙','丙':'戊','辛':'戊','丁':'庚','壬':'庚','戊':'壬','癸':'壬'};
  /* 五鼠遁：日干定子时天干，其后各时辰天干按时支序依次顺推 */
  const ziGan=wuZhu[dayGz[0]];
  const gz=FS.GAN[(FS.GAN.indexOf(ziGan)+hhNow)%10]+FS.ZHI[hhNow];
  const hourLabel=gz+'时'+(hh<0?'（默认子时）':'');
  /* 玄空飞星派称年月日时飞星，选择家（择日）称年月日时紫白，两派同指，详情条内并列标注 */
  const ZB_DATA=[{label:'年飞星',alt:'年紫白',sub:ctx.yGz+'年',board:yb.board,ic:yb.inCenter},
    {label:'月飞星',alt:'月紫白',sub:ctx.mGz+'月（'+ctx.mGz[1]+'建）',board:mb.board,ic:mb.inCenter},
    {label:'日飞星',alt:'日紫白',sub:dayGz+'日　'+ctx.seg+'（'+(ctx.asc?'顺':'逆')+'行）',board:dzb.board,ic:dzb.inCenter},
    {label:'时飞星',alt:'时紫白',sub:hourLabel,board:hzb.board,ic:hzb.inCenter}];
  FS_ZB_BOARDS=ZB_DATA;
  /* 四层切换按钮排在日期与时辰之后同一行，随输入行自适应；日期或时辰改动由控件 onchange 直接重排，不再另设排盘按钮 */
  ZB_DATA.forEach((b,i)=>{
    const el=document.getElementById('zbTab'+i);
    if(el) el.className='btn'+(i===FS_ZB_SEL?' gold':'');
  });
  /* 盘与盘下细目走通用件 .wheel-block 制式，标题、间距、图注全站同一副 */
  document.getElementById('zibaiOut').innerHTML=`<div class="wheel-block fs-mt-3"><h4>紫白飞星盘（${ZB_DATA[FS_ZB_SEL].label}）</h4>`
    +`<div id="fsZbWheelHost">${fsZbWheelSvg()}</div>`
    +`<div class="wheel-detail" id="fsZbDetail"></div></div>`;
  fsZbDetail();
}
function fsZbTab(i){ FS_ZB_SEL=i; FS_ZB_PICK=0; drawZiBai(); }
/* 点选只改弧、指针与盘心三行，不整盘重绘：改哪一处就看哪一处，盘面不跳 */
const FS_PICK_CONF = {
  zb:{state:function(v){FS_ZB_PICK=v;},wheel:'fsZbWheel',cur:'fsZbCur',needle:fsZbNeedle,core:fsZbCore,detail:fsZbDetail},
  ba:{state:function(v){FS_BA_SEL=v;},wheel:'fsBaWheel',cur:'fsBaCur',needle:fsBaNeedle,core:fsBaCore,detail:fsBaDetail},
  ns:{state:function(v){FS_NS_SEL=v;},wheel:'fsNsWheel',cur:'fsNsCur',needle:fsNsNeedle,core:fsNsCore,detail:fsNsDetail},
  shan:{state:function(v){FS_SHAN_SEL=v;},wheel:'fsShanWheel',cur:'fsShanCur',needle:fsShanNeedle,core:fsShanCore,detail:fsShanDetail},
  xk:{state:function(v){FS_XK_SEL=v;},wheel:'fsXkWheel',cur:'fsXkCur',needle:fsXkNeedle,core:fsXkCore,detail:fsXkDetail},
  sh:{state:function(v){FS_SH_SEL=v;},wheel:'fsShWheel',cur:'fsShCur',needle:fsShNeedle,core:fsShCore,detail:fsShDetail},
  yz:{state:function(v){FS_YZ_SEL=v;},wheel:'fsYzWheel',cur:'fsYzCur',needle:fsYzNeedle,core:fsYzCore,detail:fsYzDetail},
  sd:{state:function(v){FS_SD_SEL=v;},wheel:'fsSdWheel',cur:'fsSdCur',needle:fsSdNeedle,core:fsSdCore,detail:fsSdDetail},
  zj:{state:function(v){FS_ZJ_SEL=v;},wheel:'fsZjWheel',cur:'fsZjCur',needle:fsZjNeedle,core:fsZjCore,detail:fsZjDetail,beforeCore:function(i){
    const root=document.getElementById('fsZjWheel');
    if(!root) return;
    const gi=FS_ZB_ORDER.indexOf(FS_GUA_NUM[FS.SHAN_BAGUA[FS.SHAN_LIST[i]]]);
    const ins=root.querySelectorAll('[data-g]');
    for(let k=0;k<ins.length;k++) ins[k].classList.toggle('w-lab-cur', +ins[k].getAttribute('data-g')===gi);
  }},
};
function fsPickZb(i){ fsPickCommon(i, FS_PICK_CONF.zb); }
function fsZbNeedle(i){ fsNeedleCommon('fsZbNeedle','fsZbDot',i*45,false); }
/* 盘心两行：第一行恒为入中之星（常驻），第二行随点选给该宫之星与吉凶（判定）。
   若把选中宫的星放大在盘心，会被读成该星入中，故选中宫的星一律退到第二行 */
function fsZbCore(i){
  const b=FS_ZB_BOARDS[FS_ZB_SEL], n=FS_ZB_ORDER[i];
  const c=b.board.find(x=>x.palace===n);
  const jx=FS.STAR_JX[c.star], icJx=FS.STAR_JX[b.ic];
  WHEEL.text('fsZbC1',STAR_NAMES[b.ic]);
  WHEEL.text('fsZbC2','入中 '+icJx,fwJxFill(icJx)||'var(--wheel-ink2)');
  WHEEL.text('fsZbC3',FS.NINE_BAGUA[n]+'宫 '+STAR_NAMES[c.star]+' '+jx);
}
/* 盘面元素按通用件骨架逐项出：淡弧成圈、刻度落中点、热区、加粗弧、外圈字、内圈字、三圈线、指针、盘心两行 */
function fsZbWheelSvg(){
  const b=FS_ZB_BOARDS[FS_ZB_SEL];
  const n0=FS_ZB_ORDER[FS_ZB_PICK], c0=b.board.find(x=>x.palace===n0), jx0=FS.STAR_JX[c0.star], icJx=FS.STAR_JX[b.ic];
  return WHEEL.render({
    id:'fsZbWheel', aria:'紫白飞星盘：外圈八卦宫、内圈飞星，点选一方看该方主事',
    n:8,
    span:function(i){ return [i*45-22.5,i*45+22.5]; },
    mid:function(i){ return i*45; },
    arc:FW_ARC, rIn:FW_IN, hit1:FW_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:FW_P0, p1:FW_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_ZB_PICK,
    selId:'fsZbCur', needleId:'fsZbNeedle', dotId:'fsZbDot',
    onclick:'fsPickZb',
    labelsOut:function(i,dg){
      const a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_ZB_PICK?' w-lab-cur':''}" data-i="${i}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.NINE_BAGUA[FS_ZB_ORDER[i]]}</text>`;
    },
    labelsIn:function(i,dg){
      const c=b.board.find(x=>x.palace===FS_ZB_ORDER[i]), a=WHEEL.px(FW_LAB_IN,dg);
      const f=fwJxFill(FS.STAR_JX[c.star]);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_ZB_PICK?' w-lab-cur':''}" data-i="${i}"`
        +(f?` style="fill:${f}"`:'')
        +` transform="rotate(${WHEEL.radial(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${STAR_NAMES[c.star]}</text>`;
    },
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsZbC1', text:STAR_NAMES[b.ic]},
      {y:FW_C+14, cls:'w-c2', id:'fsZbC2', text:'入中 '+icJx, style:'font-weight:700;fill:'+(fwJxFill(icJx)||'var(--wheel-ink2)')},
      {y:FW_C+34, cls:'w-c3', id:'fsZbC3', text:FS.NINE_BAGUA[n0]+'宫 '+STAR_NAMES[c0.star]+' '+jx0}
    ]
  });
}
function fsZbDetail(){
  const b=FS_ZB_BOARDS[FS_ZB_SEL], n=FS_ZB_ORDER[FS_ZB_PICK];
  const c=b.board.find(x=>x.palace===n);
  const jx=FS.STAR_JX[c.star];
  const cls=jx.indexOf('凶')>=0?'wd-x':(jx.indexOf('吉')>=0?'wd-g':'');
  /* 入中之星亦是一星，吉凶与八方之星同一张表出，不给则首行只读到"入中某"而不知这一盘的主星是好是坏 */
  const icJx=FS.STAR_JX[b.ic];
  const icCls=icJx.indexOf('凶')>=0?'wd-x':(icJx.indexOf('吉')>=0?'wd-g':'');
  const mean=(FS.STAR_MEAN[c.star]||'').split(/[，,]/)[1]||'';
  const five=FS.NINE_DIR[FS.fiveYellow(b.board)];
  fwDetail('fsZbDetail',
    `${b.label}（${b.alt}）${b.sub}，入中${STAR_NAMES[b.ic]}，<span class="${icCls}">${icJx}</span>，五黄落${five}方`
    +`<span class="wd-br"></span>`
    +`${FS.NINE_BAGUA[n]}宫（${FS.NINE_DIR[n]}方） ${STAR_NAMES[c.star]} ${STAR_WX[c.star]}行 <span class="${cls}">${jx}</span> ${mean}`);
}
/* 九星吉凶速查表 */
function renderStarMean(){
  const JX_CLS={大吉:'fs-badge-g',吉:'fs-badge-g',平:'s-gold',凶:'fs-badge-r',大凶:'fs-badge-r'};
  const out=FS.NINE_ORDER.map(n=>{
    const m=FS.STAR_MEAN[n];
    const sp=m.split(/[，,]/);
    const jx=FS.STAR_JX[n];
    return `<tr><td class="fei-${n}">${STAR_NAMES[n]}</td><td class="${WX_CLS[STAR_WX[n]]}">${STAR_WX[n]}</td><td class="${JX_CLS[jx]}">${jx}</td><td>${sp[1]||''}</td></tr>`;
  }).join('');
  document.getElementById('starMeanOut').innerHTML=`
    <div class="fs-mt-3"><div class="fs-board-title fs-title-left">九星主事速查</div>
    <div class="fs-tbl-scroll">
      <table class="fs-mean-tbl"><thead><tr><th>星名</th><th>五行</th><th>吉凶</th><th>主事</th></tr></thead>
      <tbody>${out}</tbody></table>
    </div></div>`;
}
/* 八宅吉凶方位：八方天然成环，用圆盘出（洛书方位，盘心命卦） */
function drawBazhai(){
  const b=getBase(), y=b.mingYear, male=b.male;
  const mg=mingGua(y,male);
  if(!mg||!mg.gua){ document.getElementById('bazhaiOut').innerHTML='<div class="sub-note fs-t-red">命卦计算失败，请确认出生年有效。</div>'; return; }
  const bz=FS.baZhai(mg.gua);
  if(!bz){ document.getElementById('bazhaiOut').innerHTML='<div class="sub-note fs-t-red">八宅数据异常。</div>'; return; }
  const info={};
  bz.ji.forEach(x=>info[x.gua]={name:x.name,good:true});
  bz.xiong.forEach(x=>info[x.gua]={name:x.name,good:false});
  info[mg.gua]={name:'伏位',good:true};
  FS_BA_INFO=info; FS_BA_MG=mg;
  FS_BA_SEL=FS_ZB_ORDER.indexOf(FS_GUA_NUM[mg.gua]);
  if(FS_BA_SEL<0) FS_BA_SEL=0;
  document.getElementById('bazhaiOut').innerHTML=`
    <div class="sub-note">${y}年${male?'男':'女'}命：命卦 <b>${mg.gua}</b>（${mg.group}）　宜居${mg.group==='东四命'?'东四宅（坎震巽离）':'西四宅（乾坤艮兑）'}，大门、主卧、灶位宜向吉方。</div>
    <div class="wheel-block fs-mt-3"><h4>八宅游年方位盘（${mg.gua}命 ${mg.group}）</h4>
      <div id="fsBaWheelHost">${fsBaWheelSvg()}</div>
      <div class="wheel-detail" id="fsBaDetail"></div></div>
    <div class="sub-note">吉方：${bz.ji.map(x=>x.name+'（'+fsDir(x.gua)+'）').join('、')}　凶方：${bz.xiong.map(x=>x.name+'（'+fsDir(x.gua)+'）').join('、')}。吉方宜安门、置床、设灶，凶方宜作厕所、储物，主静避冲。</div>`;
  fsBaDetail();
}
function fsBaGua(i){ return FS.NINE_BAGUA[FS_ZB_ORDER[i]]; }
function fsPickBa(i){ fsPickCommon(i, FS_PICK_CONF.ba); }
function fsBaNeedle(i){ fsNeedleCommon('fsBaNeedle','fsBaDot',i*45,false); }
/* 盘心三行：第一行常驻命卦，第二行随点选给该方游年星与吉凶（判定），第三行给该宫与方位 */
function fsBaCoreTxt(i){
  const g=fsBaGua(i), inf=FS_BA_INFO[g]||{name:'伏位',good:true};
  return [(FS_BA_MG?FS_BA_MG.gua:'')+'命', inf.name+' '+FS_YOU_JX[inf.name],
    g+'宫'+fsDir(g)+'方', inf.good?'var(--wheel-good)':'var(--wheel-bad)'];
}
function fsBaCore(i){
  const t=fsBaCoreTxt(i);
  WHEEL.text('fsBaC1',t[0]);
  WHEEL.text('fsBaC2',t[1],t[3]);
  WHEEL.text('fsBaC3',t[2]);
}
function fsBaWheelSvg(){
  const ct=fsBaCoreTxt(FS_BA_SEL);
  return WHEEL.render({
    id:'fsBaWheel', aria:'八宅游年方位盘：外圈八卦宫、内圈游年九星，点选一方看该方吉凶与宜忌',
    n:8,
    span:function(i){ return [i*45-22.5,i*45+22.5]; },
    mid:function(i){ return i*45; },
    arc:FW_ARC, rIn:FW_IN, hit1:FW_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:FW_P0, p1:FW_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_BA_SEL,
    selId:'fsBaCur', needleId:'fsBaNeedle', dotId:'fsBaDot',
    onclick:'fsPickBa',
    labelsOut:function(i,dg){
      const a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_BA_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${fsBaGua(i)}</text>`;
    },
    labelsIn:function(i,dg){
      const g=fsBaGua(i), inf=FS_BA_INFO[g]||{name:'伏位',good:true}, a=WHEEL.px(FW_LAB_IN,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_BA_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` style="fill:${inf.good?'var(--wheel-good)':'var(--wheel-bad)'}"`
        +` transform="rotate(${WHEEL.radial(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${inf.name}</text>`;
    },
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsBaC1', text:ct[0]},
      {y:FW_C+14, cls:'w-c2', id:'fsBaC2', text:ct[1], style:'font-weight:700;fill:'+ct[3]},
      {y:FW_C+34, cls:'w-c3', id:'fsBaC3', text:ct[2]}
    ]
  });
}
function fsBaDetail(){
  const g=fsBaGua(FS_BA_SEL), inf=FS_BA_INFO[g]||{name:'伏位',good:true};
  fwDetail('fsBaDetail',
    `${g}宫（${fsDir(g)}方） ${inf.name} <span class="${inf.good?'wd-g':'wd-x'}">${FS_YOU_JX[inf.name]}</span> ${inf.good?'吉方':'凶方'}`
    +`<span class="wd-br"></span>`
    +`${FS_YOU_MEAN[inf.name]} ${inf.good?'宜安门、置床、设灶':'宜作厕所、储物，主静避冲'}`);
}
/* 真太岁方位：流年太岁 + 本命真太岁 */
function drawNianSha(){
  const b=getBase(), y=b.flowYear;
  const birth=parseInt(document.getElementById('nsBirth').value,10);
  const ns=FS.nianSha(y);
  const gz=FS.yearGZ(y);
  const hit={};
  FS_ZHI.forEach(z=>hit[z]=[]);
  hit[ns.taiSui.zhi].push({name:'太岁',mean:'太岁当头，宜静不宜动，忌修造、动土、搬迁'});
  hit[ns.suiPo.zhi].push({name:'岁破',mean:'冲太岁之方，忌动土修造，犯之主破败'});
  ns.sanSha.forEach(s=>hit[s.zhi].push({name:'三煞',mean:s.name+'所在，忌坐山、动土，犯之主伤病官非'}));
  (FS_PALACE_ZHI[ns.wuHuang.palace]||[]).forEach(z=>hit[z].push({name:'五黄',mean:'正关煞，宜静不宜动，忌开门、动土、安床'}));
  if(birth){
    const bz=FS.yearGZ(birth);
    hit[bz[1]].push({name:'真太岁',mean:'本命真太岁，造葬动土须避此方'});
  }
  FS_NS_HIT=hit; FS_NS_GZ=gz; FS_NS_Y=y;
  FS_NS_SEL=FS_ZHI.indexOf(ns.taiSui.zhi);
  let html=`<div class="sub-note">${y} ${gz}年　太岁在<b>${ns.taiSui.zhi}</b>方、岁破在<b>${ns.suiPo.zhi}</b>方、三煞在<b>${ns.sanSha.map(s=>s.zhi).join('')}</b>方、年五黄落<b>${ns.wuHuang.dir}</b>方。</div>
    <div class="wheel-block fs-mt-3"><h4>流年方位煞盘（${y} ${gz}年）</h4>
      <div id="fsNsWheelHost">${fsNsWheelSvg()}</div>
      <div class="wheel-detail" id="fsNsDetail"></div></div>`;
  if(birth){
    const bz=FS.yearGZ(birth);
    html+=`<div class="sub-note fs-bordertop-s"><b>本命真太岁</b>（${birth}年 ${bz}）：本命太岁在<b>${bz[1]}</b>方，造葬动土须避太岁方与岁破方（${bz[1]}之对冲 ${FS.nianSha(birth).suiPo.zhi}）。</div>`;
  }
  document.getElementById('nianshaOut').innerHTML=html;
  fsNsDetail();
}
function fsNsZhiDir(z){ return fsDir(FS.SHAN_BAGUA[z]); }
function fsPickNs(i){ fsPickCommon(i, FS_PICK_CONF.ns); }
function fsNsNeedle(j){ fsNeedleCommon('fsNsNeedle','fsNsDot',fwZhiDeg(j),false); }
/* 盘心三行：第一行常驻流年干支，第二行给该方所犯之煞（判定，带吉凶色），第三行给该方方位与并临煞数 */
function fsNsCoreTxt(j){
  const z=FS_ZHI[j], hs=FS_NS_HIT[z]||[];
  return [FS_NS_GZ+'年', z+'方 '+(hs.length?hs[0].name:'无煞'),
    fsNsZhiDir(z)+' '+(hs.length?FS_NUM_CN[hs.length]+'煞并临':'平安无事'),
    hs.length?'var(--wheel-bad)':'var(--wheel-good)'];
}
function fsNsCore(j){
  const t=fsNsCoreTxt(j);
  WHEEL.text('fsNsC1',t[0]);
  WHEEL.text('fsNsC2',t[1],t[3]);
  WHEEL.text('fsNsC3',t[2]);
}
function fsNsWheelSvg(){
  const ct=fsNsCoreTxt(FS_NS_SEL);
  return WHEEL.render({
    id:'fsNsWheel', aria:'流年方位煞盘：外圈十二支方位、内圈所犯之煞，点选一支看该方宜忌',
    n:12,
    span:function(j){ return [fwZhiDeg(j)-15,fwZhiDeg(j)+15]; },
    mid:function(j){ return fwZhiDeg(j); },
    arc:FW_ARC, rIn:FW_IN, hit1:FW_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:FW_P0, p1:FW_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_NS_SEL,
    selId:'fsNsCur', needleId:'fsNsNeedle', dotId:'fsNsDot',
    onclick:'fsPickNs',
    labelsOut:function(j,dg){
      const a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${j===FS_NS_SEL?' w-lab-cur':''}" data-i="${j}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS_ZHI[j]}</text>`;
    },
    labelsIn:function(j,dg){
      const z=FS_ZHI[j], hs=FS_NS_HIT[z]||[], a=WHEEL.px(FW_LAB_IN,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${j===FS_NS_SEL?' w-lab-cur':''}" data-i="${j}"`
        +` style="fill:${hs.length?'var(--wheel-bad)':'var(--wheel-good)'}"`
        +` transform="rotate(${WHEEL.radial(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${hs.length?hs[0].name:'安'}</text>`;
    },
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsNsC1', text:ct[0]},
      {y:FW_C+14, cls:'w-c2', id:'fsNsC2', text:ct[1], style:'font-weight:700;fill:'+ct[3]},
      {y:FW_C+34, cls:'w-c3', id:'fsNsC3', text:ct[2]}
    ]
  });
}
function fsNsDetail(){
  const z=FS_ZHI[FS_NS_SEL], hs=FS_NS_HIT[z]||[];
  fwDetail('fsNsDetail',
    `${z}方（${fsNsZhiDir(z)}） ${hs.length?'<span class="wd-x">'+hs.map(h=>h.name).join('、')+'</span>':'<span class="wd-g">本年无太岁、岁破、三煞、五黄到此方</span>'}`
    +`<span class="wd-br"></span>`
    +`${hs.length?hs.map(h=>h.mean).join('；'):'此方平安，宜开门、安床、设灶，用事无妨'}`);
}
/* 模块内评分行：null（无输入依据）不显示；key 给出依据与置信度，只展示不改分。 */
const FS_SC_META={
  lixiang:{src:'玄空：立极分金',conf:'高'},
  fenjin:{src:'三合：百二十分金',conf:'高'},
  geju:{src:'玄空：山向飞星',conf:'高'},
  suiyun:{src:'玄空：流年紫白',conf:'高'},
  sanyao:{src:'八宅：三要',conf:'中'},
  chuangong:{src:'八宅：穿宫九星',conf:'中'},
  liushi:{src:'八宅：六事',conf:'中'},
  jsy:{src:'金锁玉关（站内归纳）',conf:'中'},
  xingsha:{src:'形法：十项形煞（站内归纳）',conf:'低'},
  luantou:{src:'形法：峦头三因子（站内归纳）',conf:'低'}
};
function srLine(sc,key){
  if(!sc) return '';
  const vetoTxt=sc.veto?'　<b class="fs-t-red">一票否决</b>':'';
  const m=FS_SC_META[key]||null;
  return '<div class="sub-note fs-mt-2">模块评分：<span class="fs-score">'+sc.got+'</span> 分（'+sc.grade+'）'+vetoTxt+'　'+sc.note
    +(m?'　<span class="fs-src">依据：'+m.src+'　置信：'+m.conf+'</span>':'')+'</div>';
}
/* 二十四山 */
function drawShan(){
  const b=getBase();
  FS_SHAN_SEL=FS.SHAN_LIST.indexOf(b.sitShan);
  if(FS_SHAN_SEL<0) FS_SHAN_SEL=0;
  document.getElementById('shanOut').innerHTML=`<div class="wheel-block fs-mt-3"><h4>二十四山坐山立极盘</h4>`
    +`<div id="fsShanWheelHost">${fsShanWheelSvg()}</div>`
    +`<div class="wheel-detail" id="fsShanDetail"></div>`
    +`<div id="fsShanInfo"></div></div>`;
  fsShanDetail();
}
/* 立极信息随点选之山重出：点选即视为以该山立极，周天、立向状态、坐山朝对、犯煞与模块评分一并跟着变 */
/* 断语取度：实测坐度只对坐山生效，他山按该山正向的山心度立极，免得拿同一度数去判别的山而误断兼向空亡；
   未填实测时坐山传 undefined，交引擎出未填实测坐度那一档，山心度不可冒充实测度，否则正向兼向会被凭空判出来 */
function fsShanDegOf(i){
  const b=getBase();
  return FS.SHAN_LIST[i]===b.sitShan?b.deg:(i*15);
}
/* 盘面取度：口径与断语同，只把未填实测的坐山回落成山心度，供圆盘与坐向轴画线，盘上不留空值 */
function fsShanDegNum(i){
  const b=getBase();
  const own=FS.SHAN_LIST[i]===b.sitShan;
  return (own&&b.deg!==undefined)?b.deg:(i*15);
}
function fsShanInfoHtml(i){
  const b=getBase(), shan=FS.SHAN_LIST[i], own=(shan===b.sitShan);
  const s=FS.shanInfo(shan, b.flowYear, fsShanDegOf(i));
  if(!s) return '';
  /* 年五黄与太岁、岁破、三煞到山，盘下详情条已逐项报出；此处只算详情条没有的月、日、时三层五黄 */
  const wuHuangPts=[];
  const atWu=(palace)=>FS.SHAN_BAGUA[shan]===FS.NINE_BAGUA[palace];
  const zdv=document.getElementById('zbDate').value;
  if(zdv){
    try{
      const [zy,zm,zd]=zdv.split('-').map(Number);
      const zctx=FS_ZB_CTX(zy,zm,zd);
      const mb2=FS.monthZiBai(zctx.yGz[1],zctx.mGz[1]);
      const dzb2=FS.dayZiBai(zctx.off,zctx.asc,zctx.base);
      const hh2=parseInt(document.getElementById('zbHour').value,10);
      const hzb2=FS.hourZiBai(zctx.dayGz[1],hh2>=0?hh2:0,zctx.asc);
      if(atWu(FS.fiveYellow(mb2.board))) wuHuangPts.push('月五黄');
      if(atWu(FS.fiveYellow(dzb2.board))) wuHuangPts.push('日五黄');
      if(atWu(FS.fiveYellow(hzb2.board))) wuHuangPts.push('时五黄');
    }catch(e){}
  }
  const wuTxt=wuHuangPts.length?`<div class="fs-warn"><i>${wuHuangPts.join('、')}到山：该山当月当日当时忌动土修造，宜静守化解。</i></div>`:'';
  const tip=own?'':`<div class="sub-note fs-t-gold">以下按 ${shan} 山立极推演（本宅坐山 ${b.sitShan} 山；实测坐度只对坐山生效，他山按该山正向计）。</div>`;
  return tip
    +`<div class="sub-note">坐山朝对：${shan}山必朝对宫 ${FS.SHAN_LIST[(i+12)%24]}山；用事以坐山定坐向、以朝向定门路。</div>`
    +wuTxt
    +srLine(FS.scoreLixiang(shan, fsShanDegOf(i)),'lixiang');
}
function fsPickShan(i){ fsPickCommon(i, FS_PICK_CONF.shan); }
function fsShanNeedle(i){ fsNeedleCommon('fsShanNeedle','fsShanDot',fwShanDeg(i),false); }
/* 盘心三行：第一行常驻本宅坐向，第二行随点选给该山周天中线，第三行给卦行与配支 */
function fsShanCoreTxt(i){
  const b=getBase();
  const s=FS.shanInfo(FS.SHAN_LIST[i], b.flowYear, fsShanDegOf(i));
  return ['坐'+b.sitShan+'向'+b.faceShan, FS.SHAN_LIST[i]+'山 中 '+s.center+'°',
    s.bagua+'卦'+s.wx+'行 配'+s.zhi];
}
function fsShanCore(i){
  const t=fsShanCoreTxt(i);
  WHEEL.text('fsShanC1',t[0]);
  WHEEL.text('fsShanC2',t[1]);
  WHEEL.text('fsShanC3',t[2]);
}
function fsShanWheelSvg(){
  const b=getBase();
  const info=FS.SHAN_LIST.map(sh=>FS.shanInfo(sh,b.flowYear));
  const bad=i=>(info[i].atTaiSui||info[i].atSuiPo||info[i].atSanSha||info[i].atWuHuang);
  const ct=fsShanCoreTxt(FS_SHAN_SEL);
  return WHEEL.render({
    id:'fsShanWheel', aria:'二十四山立极盘：外圈二十四山、内圈双山配支，点选一山看该山立极详情',
    n:24,
    span:function(i){ const d=fwShanDeg(i); return [d-7.5,d+7.5]; },
    mid:function(i){ return fwShanDeg(i); },
    arc:FW_ARC, rIn:FW_IN, hit1:FW_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:FW_P0, p1:FW_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_SHAN_SEL,
    selId:'fsShanCur', needleId:'fsShanNeedle', dotId:'fsShanDot',
    onclick:'fsPickShan',
    labelsOut:function(i,dg){
      const a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_SHAN_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.SHAN_LIST[i]}</text>`;
    },
    labelsIn:function(i,dg){
      const a=WHEEL.px(FW_LAB_IN,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_SHAN_SEL?' w-lab-cur':''}" data-i="${i}"`
        +(bad(i)?' style="fill:var(--wheel-bad)"':'')
        +` transform="rotate(${WHEEL.dir(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${info[i].zhi}</text>`;
    },
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsShanC1', text:ct[0]},
      {y:FW_C+14, cls:'w-c2', id:'fsShanC2', text:ct[1], style:'font-weight:700'},
      {y:FW_C+34, cls:'w-c3', id:'fsShanC3', text:ct[2]}
    ]
  });
}
function fsShanDetail(){
  const b=getBase();
  const s=FS.shanInfo(FS.SHAN_LIST[FS_SHAN_SEL], b.flowYear, fsShanDegOf(FS_SHAN_SEL));
  const hit=[];
  if(s.atTaiSui) hit.push('太岁到山');
  if(s.atSuiPo) hit.push('岁破到山');
  if(s.atSanSha) hit.push('三煞到山');
  if(s.atWuHuang) hit.push('年五黄到山');
  /* 立向一档：填了实测坐度才判正向兼向；未填时坐山写未填实测坐度，他山写按某山正向计，
     与上方立极信息同一口径，不拿山心度冒充实测度去报正向 */
  const own=(s.shan===b.sitShan);
  const st=s.measured?(s.measured.kong?'骑缝空亡（'+s.measured.kongType+'）':(s.measured.jian?'兼'+s.measured.jianTo+'向（须起替卦）':'正向（下卦）'))
    :(own?'未填实测坐度':'按'+s.shan+'山正向计');
  fwDetail('fsShanDetail',
    `${s.shan}山 周天 ${s.start}°~${s.end}°（中 ${s.center}°） ${s.bagua}卦${s.wx}行 双山配${s.zhi}`
    +`<span class="wd-br"></span>`
    +`立向 ${st} ${hit.length?'<span class="wd-x">'+hit.join('、')+'</span>':'<span class="wd-g">本年无太岁、岁破、三煞、年五黄到山</span>'}`);
  const host=document.getElementById('fsShanInfo');
  if(host) host.innerHTML=fsShanInfoHtml(FS_SHAN_SEL);
}
/* 玄空飞星盘（山向盘） */
function drawXuanKong(){
  const b=getBase(), sit=b.sitShan, face=b.faceShan, y=b.flowYear;
  const xk=FS.xuanKong(sit,face,y,b.deg,b.faceDeg, b.yunOv);
  if(!xk){ document.getElementById('xkOut').innerHTML='<div class="sub-note fs-t-red">坐向数据异常。</div>'; return; }
  /* 实测罗盘度数判兼向：兼向已按沈氏替星口诀起替卦；压交界线为骑缝空亡，不可立向 */
  let jianWarn='';
  if(xk.sitKong||xk.faceKong){
    const kt=(xk.sitKong&&xk.faceKong)?'坐山、向首':(xk.sitKong?'坐山':'向首');
    jianWarn='<div class="sub-note fs-t-red">实测坐度显示'+kt+'压两山交界线，犯骑缝空亡：空亡线不可立向，本盘仍按正向下卦排出，仅供参详，须重新立向避开交界。</div>';
  }else if(xk.tiGua){
    const jt=(xk.sitJian&&xk.faceJian)?'坐山、向首':(xk.sitJian?'坐山':'向首');
    jianWarn='<div class="sub-note fs-t-gold">实测坐度显示'+jt+'兼向（偏离中线逾四度半）：本盘已按沈氏替星口诀起替卦。</div>';
  }
  const xkGrid=b=>FS_GRID.map(n=>{
    const c=b.find(x=>x.palace===n);
    const isC=n===5;
    return `<div class="fs-cell ${'fei-'+c.star}">
      <div class="fs-star">${c.star}</div>
      <div class="fs-dir">${isC?'中':FS.NINE_DIR[n]}</div>
      ${isC?'':'<div class="fs-gua">'+FS.NINE_BAGUA[n]+'</div>'}</div>`;
  }).join('');
  FS_XK_DATA=xk;
  FS_XK_SEL=FS_ZB_ORDER.indexOf(FS_GUA_NUM[FS.SHAN_BAGUA[face]]);
  if(FS_XK_SEL<0) FS_XK_SEL=0;
  document.getElementById('xkOut').innerHTML=`
    <div class="sub-note">${y}年 ${xk.yun.yuan}${xk.yun.yun}运（${xk.yun.name}，${xk.yun.start}-${xk.yun.end}）${b.yunOv?'　换运盘：起宅定运，不随流年':''}　${sit}山${face}向（坐${sit}向${face}）　入中：山${xk.sitIn}、向${xk.faceIn}　${xk.sitShun?'山顺':'山逆'}、${xk.faceShun?'向顺':'向逆'}${xk.tiGua?'（替卦）':'（下卦）'}</div>
    <div class="sub-note fs-t-gold">格局：${xk.geju}　到坐山之星 ${xk.toSit}、到向首之星 ${xk.toFace}</div>
    ${jianWarn}
    <div class="wheel-block fs-mt-3"><h4>玄空飞星山向盘（${y}年 ${xk.yun.yuan}${xk.yun.yun}运 坐${sit}山向${face}）</h4>
      <div id="fsXkWheelHost">${fsXkWheelSvg()}</div>
      <div class="wheel-detail" id="fsXkDetail"></div></div>
    <div class="fs-xk">
      <div class="fs-xk-board"><div class="fs-board-title">运盘（${xk.yun.yun}运）</div><div class="fs-grid">${xkGrid(xk.yunBoard)}</div></div>
      <div class="fs-xk-board"><div class="fs-board-title">山盘（坐${sit}）</div><div class="fs-grid">${xkGrid(xk.sitBoard)}</div></div>
      <div class="fs-xk-board"><div class="fs-board-title">向盘（向${face}）</div><div class="fs-grid">${xkGrid(xk.faceBoard)}</div></div>
    </div>
    <div class="sub-note">${xk.sitShan}山坐宫之星（${xk.toSit}）：${xk.sitMean}　${xk.faceShan}向向首之星（${xk.toFace}）：${xk.faceMean}</div>
    <div class="fs-tbl-scroll fs-mt-3">
      <table class="fs-mean-tbl"><thead><tr><th>宫位</th><th>山星</th><th>向星</th><th>旺衰</th><th>丁财断</th><th>说明</th></tr></thead>
        <tbody>${FS_GRID.map(n=>{
          const sc=xk.sitBoard.find(x=>x.palace===n);
          const fc=xk.faceBoard.find(x=>x.palace===n);
          const sw=FS.starWangShuai(sc.star, xk.yun.yun);
          const fw=FS.starWangShuai(fc.star, xk.yun.yun);
          const dc=FS.gongDingCai(sc.star, fc.star, xk.yun.yun);
          const dCls=dc.jx==='大吉'||dc.jx==='吉'?'fs-badge-g':(dc.jx==='凶'?'fs-badge-r':'');
          return `<tr><td class="lbl-1">${n===5?'中宫':FS.NINE_BAGUA[n]+FS.NINE_DIR[n]}</td>
            <td class="fei-${sc.star}">${sc.star}${sw}</td>
            <td class="fei-${fc.star}">${fc.star}${fw}</td>
            <td>山${sw}向${fw}</td>
            <td class="${dCls}">${dc.jx}</td><td>${dc.mean}</td></tr>`;
        }).join('')}</tbody></table>
    </div>`;
  fsXkDetail();
}
function fsXkRow(i){ return fsXkRowCommon(i); }
/* 盘心三行：第一行常驻当运星，第二行给该宫宫名方位与运星，第三行给山向相会与吉凶（判定，带吉凶色） */
function fsXkCoreTxt(i){ return fsXkCoreTxtCommon(i); }
function fsXkCore(i){
  const t=fsXkCoreTxt(i);
  WHEEL.text('fsXkC1',t[0]);
  WHEEL.text('fsXkC2',t[1]);
  WHEEL.text('fsXkC3',t[2],t[3]);
}
function fsXkNeedle(i){
  const root=document.getElementById('fsXkWheel'); if(!root) return;
  const nd=root.querySelector('#fsXkNeedle'), dt=root.querySelector('#fsXkDot');
  if(!nd||!dt) return;
  const a=i*45, q0=WHEEL.px(SD_P0,a), q1=WHEEL.px(SD_P1,a);
  nd.setAttribute('x1',WHEEL.n(q0[0])); nd.setAttribute('y1',WHEEL.n(q0[1]));
  nd.setAttribute('x2',WHEEL.n(q1[0])); nd.setAttribute('y2',WHEEL.n(q1[1]));
  dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1]));
}
function fsXkWheelSvg(){ return xjFsXkWheelSvg({axis:function(){return {sit:null,face:null};},geo:{in:window.SD_IN||104,hit1:window.SD_HIT1||198,zw:window.SD_ZW||152,sx:window.SD_SX||120,p0:window.SD_P0||82,p1:window.SD_P1||100,out:window.FW_OUT||182,core:window.FW_CORE||78,c:window.FW_C||220}}); }
/* 盘下详情条由共享件出：坐向取山名，宫位比对照卦名，共享件先经 SHAN_BAGUA 转卦名 */
function fsXkDetail(){ return xjFsXkDetail(); }
function fsPickXk(i){ fsPickCommon(i, FS_PICK_CONF.xk); }
/* 九星组合断事（继承玄空盘结果） */
function drawComboFromXk(xk){
  const b=getBase(), sit=b.sitShan, face=b.faceShan, y=b.flowYear;
  const rows=FS_GRID.map(n=>{
    const s=xk.sitBoard.find(x=>x.palace===n);
    const f=xk.faceBoard.find(x=>x.palace===n);
    const cj=FS.comboJx(s.star,f.star);
    const dir=FS.NINE_DIR[n];
    /* 吉凶上色走页面统一规则：大吉、吉着绿，大凶、凶着红，平着暗金；复合值（吉或平、平或凶）按含凶即红、含吉即绿 */
    const jxCls=cj.jx.indexOf('凶')>=0?'fs-badge-r':(cj.jx.indexOf('吉')>=0?'fs-badge-g':'s-gold');
    return `<tr><td class="lbl-1">${n===5?'中宫':n+dir}</td>
      <td class="fei-${s.star}">${s.star}</td>
      <td class="fei-${f.star}">${f.star}</td>
      <td class="${jxCls}">${cj.jx}</td><td>${cj.mean||'比和，随当令断'}${cj.src?'<div class="fs-src">'+cj.src+'</div>':''}</td></tr>`;
  }).join('');
  return `
    <div class="sub-note">${y}年 ${sit}山${face}向　山星入中${xk.sitIn}、向星入中${xk.faceIn}，各宫山向相会成局：</div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>宫位</th><th>山星</th><th>向星</th><th>吉凶</th><th>断事</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function fsShDeg(i){
  const d=FS_SH_DATA; if(!d) return 0;
  return fwZhiDeg(FS_ZHI.indexOf(d.gong[i].zhi));
}
/* 盘心三行：第一行给所选之宫（本盘盘心是所选之宫，不套常驻中宫之义），第二行给该宫支方与吉凶（判定，带吉凶色），
   第三行给来去取用。局与起长生、墓库盘下详情条末段已逐条给出，故不入盘心；
   来去取用短签 FS.SH_USE 由引擎给出，与阴宅页同一水法口径，本页只此一处出处 */
function fsShCoreTxt(i){
  const d=FS_SH_DATA, g=d.gong[i];
  return [g.gong, g.zhi+'方 '+d.gongJx[i], FS.SH_USE[i]];
}
function fsShCore(i){
  const t=fsShCoreTxt(i);
  WHEEL.text('fsShC1',t[0]);
  WHEEL.text('fsShC2',t[1],fwJxFill(FS_SH_DATA.gongJx[i])||'var(--wheel-ink2)');
  WHEEL.text('fsShC3',t[2]);
}
function fsShNeedle(i){ fsNeedleCommon('fsShNeedle','fsShDot',fsShDeg(i),true,'fsShWheel'); }
function fsShWheelSvg(){ return xjFsShWheelSvg(); }
function fsShDetail(){ return fsShDetailCommon(); }
function fsPickSh(i){ fsPickCommon(i, FS_PICK_CONF.sh); }
function drawSanHe(){
  const out=document.getElementById('shOut'); if(!out) return;
  const b=getBase(), shan=b.sitShan;
  const sw=FS.sanHeWater(shan);
  if(!sw){ out.innerHTML='<div class="sub-note fs-t-red">水法数据异常。</div>'; return; }
  FS_SH_DATA=sw;
  /* 默认落在帝旺宫：水法首看旺水到堂，一进页面即见 */
  FS_SH_SEL=4;
  out.innerHTML=`<div class="wheel-block fs-mt-3"><h4>长生十二宫水法盘（${shan}山属${sw.ju}）</h4>
    <div id="fsShWheelHost">${fsShWheelSvg()}</div>
    <div class="wheel-detail" id="fsShDetail"></div></div>`;
  fsShDetail();
}
/* 消亡水（先后天卦位水口） */
function drawXiaoWang(){
  const l=document.getElementById('xwLai').value, q=document.getElementById('xwQu').value;
  const r=FS.xiaoWangShui(l,q);
  if(!r){ document.getElementById('xwOut').innerHTML='<div class="sub-note fs-t-red">请选择来去水位。</div>'; return; }
  const jx=(r.xiao||r.wang)?'fs-badge-r':'fs-badge-g';
  const verdict=(r.xiao||r.wang)?[r.xiao?'犯消水':'',r.wang?'犯亡水':''].filter(Boolean).join('、'):'不犯';
  document.getElementById('xwOut').innerHTML=
    `<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>核对</th><th>判定</th><th>断要</th></tr></thead><tbody>`+
    `<tr><td class="lbl-1">来水${l}山　去水${q}山</td><td class="${jx}">${verdict}</td><td>${r.mean}</td></tr>`+
    '</tbody></table></div>';
}
/* 五运无独立正零：前十年承四运、后十年启六运（通行处理）。按落在该运区间内的年份取段，
   流年在本运区间内即取本流年，换运盘使流年出于区间者按最近一端取，故不恒取前十年。 */
function fsYunDecade(yq, year){
  if(!yq||yq.yun!==5) return undefined;
  const y=(typeof year==='number'&&!isNaN(year))?year:yq.start;
  const inYun=Math.min(Math.max(y, yq.start), yq.end);
  return inYun<yq.start+10?'before':'after';
}
/* 零正神（拨水入零堂） */
function drawLingZheng(){
  const b=getBase();
  const yq=FS.yunQi(b.flowYear, b.yunOv);
  const lz=FS.lingZheng(yq.yun, fsYunDecade(yq, b.flowYear));
  if(!lz) return;
  document.getElementById('lzOut').innerHTML=
    `<div class="sub-note">${b.flowYear}年${yq.yuan}${yq.yun}运${lz.note?'（'+lz.note+'）':''}：正神在${lz.zhengGua}（${lz.zhengDir}，洛书${lz.zhengPalace}宫）、零神在${lz.lingGua}（${lz.lingDir}，洛书${lz.lingPalace}宫）。</div>`+
    `<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>方位</th><th>取用</th></tr></thead><tbody>`+
    `<tr><td class="lbl-1">正神${lz.zhengDir}方（${lz.zhengGua}）</td><td>${lz.zhengMean}</td></tr>`+
    `<tr><td class="lbl-1">零神${lz.lingDir}方（${lz.lingGua}）</td><td>${lz.lingMean}</td></tr>`+
    '</tbody></table></div>';
}
/* 填充消亡水来去水二十四山选择（默认卯来酉去，东西对流不犯）。
   下拉可能已由静态件带出选项而选中项停在首山，故首调按默认落值，此后由用户改选。 */
function fillXiaoWang(){
  const opts=FS.SHAN_LIST.map(s=>`<option value="${s}">${s}山</option>`).join('');
  const l=document.getElementById('xwLai'), q=document.getElementById('xwQu');
  if(l&&!l.options.length) l.innerHTML=opts;
  if(q&&!q.options.length) q.innerHTML=opts;
  if(l&&!l.__xwDefaulted){ l.value='卯'; l.__xwDefaulted=true; }
  if(q&&!q.__xwDefaulted){ q.value='酉'; q.__xwDefaulted=true; }
}
/* 二十八宿分金（五子分金、合宅主年命） */
function drawXiuFen(){
  const b=getBase(), shan=b.sitShan, y=b.flowYear;
  const xm=parseInt(document.getElementById('fjXm').value,10)||0;
  const xiu=FS.SHAN_XIU[shan]||[''];
  const fj=FS.fenJin(shan);
  const yq=FS.yunQi(y);
  /* 宅主年命纳音 */
  let xmInfo=null;
  if(xm){
    const xmGz=FS.yearGZ(xm);
    xmInfo={gz:xmGz, nayin:FS.nayin(xmGz)};
  }
  const rows=fj.map(f=>{
    const wCls=f.wang==='旺'?'s-gold':(f.wang==='相'?'s-gold':'fs-badge-r');
    const zong=FS.fenJinZong(f, xmInfo, yq.yun);
    const zCls=zong.zong==='大吉'||zong.zong==='吉'?'fs-badge-g':(zong.zong==='大凶'||zong.zong==='凶'?'fs-badge-r':'s-gold');
    return `<tr><td class="lbl-1">${f.gan}${f.zhi}</td><td>${f.start}°~${f.end}°</td><td>${f.nayin}</td><td class="${WX_CLS[f.nayinWx]}">${f.nayinWx}</td>
      <td class="${wCls}">${f.wang}</td><td class="${zCls}">${zong.zong}</td><td>${zong.mean}</td></tr>`;
  }).join('');
  document.getElementById('fjOut').innerHTML=`
    <div class="sub-note">${shan}山（${FS.SHAN_BAGUA[shan]}卦${FS.SHAN_WX[shan]}五行）　二十八宿：${xiu.join('、')}宿　${y}年${yq.yuan}${yq.yun}运（${yq.name}）${xmInfo?'　宅主'+xmInfo.gz+'（纳音'+xmInfo.nayin.name+'）':''}</div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>分金</th><th>线度</th><th>纳音</th><th>五行</th><th>孤虚旺相</th><th>综合吉凶</th><th>说明</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="fs-tbl-scroll fs-mt-4">
      <div class="fs-board-title fs-title-left">穿山七十二龙（每龙5度，格龙用；甲子起壬山之末、壬子之交，八干四维正中为大空亡）</div>
      <table class="fs-mean-tbl"><thead><tr><th>龙</th><th>纳音</th><th>五行</th><th>孤虚旺相</th><th>吉凶</th><th>角度</th></tr></thead>
        <tbody>${FS.chuanShan72(shan).map(d=>{
          const lj=FS.longJx(d);
          const lCls=lj.jx==='大吉'||lj.jx==='吉'?'fs-badge-g':(lj.jx==='大凶'||lj.jx==='凶'?'fs-badge-r':'');
          return `<tr><td class="lbl-1">${d.kong?'〔大空亡〕':d.gz}</td><td>${d.kong?'无':d.nayin}</td><td class="${d.kong?'':WX_CLS[d.nayinWx]}">${d.kong?'无':d.nayinWx}</td><td>${d.wang}</td><td class="${lCls}">${lj.jx}</td><td>${d.start}°-${d.end}°</td></tr>`;
        }).join('')}</tbody></table>
    </div>
    <div class="fs-tbl-scroll fs-mt-3">
      <div class="fs-board-title fs-title-left">透地六十龙（每龙6度，坐穴用；甲子起壬山之初，每双山布本组五子）</div>
      <table class="fs-mean-tbl"><thead><tr><th>龙</th><th>纳音</th><th>五行</th><th>孤虚旺相</th><th>吉凶</th><th>角度</th></tr></thead>
        <tbody>${FS.touDi60(shan).map(d=>{
          const lj=FS.longJx(d);
          const lCls=lj.jx==='大吉'||lj.jx==='吉'?'fs-badge-g':(lj.jx==='大凶'||lj.jx==='凶'?'fs-badge-r':'');
          return `<tr><td class="lbl-1">${d.gz}${d.half?'（半交）':''}</td><td>${d.nayin}</td><td class="${WX_CLS[d.nayinWx]}">${d.nayinWx}</td><td>${d.wang}</td><td class="${lCls}">${lj.jx}</td><td>${d.start}°-${d.end}°</td></tr>`;
        }).join('')}</tbody></table>
    </div>
    ${srLine(FS.scoreFenjin(shan, b.deg, xm||null),'fenjin')}`;
}
/* 阳宅布局建议（九宫格，综合八宅+玄空当运旺星） */
function drawLayout(){
  const b=getBase(), y=b.mingYear, male=b.male, sitShan=b.sitShan, faceShan=b.faceShan, flowY=b.flowYear;
  const mg=mingGua(y,male);
  if(!mg){ document.getElementById('yzOut').innerHTML='<div class="sub-note fs-t-red">命卦计算失败。</div>'; return; }
  const bz=FS.baZhai(mg.gua);
  const info={};
  bz.ji.forEach(x=>info[x.gua]={name:x.name,good:true});
  bz.xiong.forEach(x=>info[x.gua]={name:x.name,good:false});
  info[mg.gua]={name:'伏位',good:true};
  const xk=FS.xuanKong(sitShan, faceShan, flowY, b.deg, b.faceDeg, b.yunOv);
  /* 旺衰、丁财、当令与生气星全取玄空盘所起之运（xk 已按宅运换运起盘），不再另按流年取运，
     同页只留一套运，免得盘按换运、表按流年两下相左 */
  const yun=xk?xk.yun:null;
  /* 吉凶方位对应宜忌 */
  const GOOD_USE={生气:'宜开门纳气',延年:'宜主卧安床',天医:'宜厨房灶位',伏位:'宜神位静处'};
  const BAD_USE={绝命:'宜厕所压之',五鬼:'宜储物镇之',祸害:'宜杂用避冲',六煞:'宜通道过之'};
  /* 逐宫合参：八宅本体档叠玄空山向星旺衰与丁财，合成综合吉凶与宜忌，供盘与详情条用 */
  const pal=FS_ZB_ORDER.map(n=>{
    const gua=FS.NINE_BAGUA[n];
    const inf=info[gua];
    /* 玄空该宫山向星 + 旺衰丁财断 */
    let xkStar='', xkScore=0, dingCai='';
    if(xk){
      const sc=xk.sitBoard.find(x=>x.palace===n);
      const fc=xk.faceBoard.find(x=>x.palace===n);
      if(sc&&fc){
        xkStar='山'+sc.star+'向'+fc.star;
        /* 合成权重（本站归纳）：玄空逐星旺衰 旺2 生1 退0 死煞-1；组合大凶-3 凶-2（斗牛交剑交加等重于单星） */
        const rk=w=>w==='旺'?2:(w==='生'?1:(w==='退'?0:-1));
        xkScore+=rk(FS.starWangShuai(sc.star, yun.yun))+rk(FS.starWangShuai(fc.star, yun.yun));
        const cj=FS.comboJx(sc.star, fc.star);
        if(cj.jx.indexOf('大凶')>=0) xkScore-=3;
        else if(cj.jx.indexOf('凶')>=0) xkScore-=2;
        const dc=FS.gongDingCai(sc.star, fc.star, yun.yun);
        dingCai=dc.jx==='大吉'||dc.jx==='吉'?'旺丁财':(dc.jx==='凶'?'衰丁财':'丁财平');
      }
    }
    /* 八宅分层（本站归纳）：四吉+2，绝命五鬼-3，祸害六煞-2 */
    const baScore=inf&&inf.good?2:(inf.name==='绝命'||inf.name==='五鬼'?-3:-2);
    const total=baScore+xkScore;
    let zongJx, use;
    if(total>=3){ zongJx='大吉'; use=inf&&inf.good?(GOOD_USE[inf.name]||'吉方'):'吉'; }
    else if(total>=1){ zongJx='吉'; use=inf&&inf.good?(GOOD_USE[inf.name]||'吉方'):'平'; }
    else if(total>= -1){ zongJx='平'; use='宜神位过道'; }
    else if(total>= -3){ zongJx='凶'; use=BAD_USE[inf?inf.name:'']||'宜厕所压之'; }
    else { zongJx='大凶'; use='忌动土修造'; }
    return {n, gua, dir:fsDir(gua), baName:inf?inf.name:'-', baGood:!!(inf&&inf.good),
      xkStar, dingCai, zongJx, use};
  });
  FS_YZ_PAL=pal; FS_YZ_MG=mg;
  FS_YZ_SEL=FS_ZB_ORDER.indexOf(FS_GUA_NUM[FS.SHAN_BAGUA[sitShan]]);
  if(FS_YZ_SEL<0) FS_YZ_SEL=0;
  const yzOut=document.getElementById('yzOut');
  if(!yzOut)return;
  /* 六要位方位：综合吉凶评分选位，直白方位词 */
  const rank=[];
  for(let n=1;n<=9;n++){
    if(n===5) continue;
    const gua=FS.NINE_BAGUA[n];
    const inf=info[gua];
    const sc=xk?xk.sitBoard.find(x=>x.palace===n):null;
    const fc=xk?xk.faceBoard.find(x=>x.palace===n):null;
    let s=0;
    if(sc&&fc){
      const rk=w=>w==='旺'?2:(w==='生'?1:(w==='退'?0:-1));
      s+=rk(FS.starWangShuai(sc.star, yun.yun))+rk(FS.starWangShuai(fc.star, yun.yun));
      const cj=FS.comboJx(sc.star, fc.star);
      if(cj.jx.indexOf('大凶')>=0) s-=3;
      else if(cj.jx.indexOf('凶')>=0) s-=2;
    }
    s+=inf&&inf.good?2:(inf.name==='绝命'||inf.name==='五鬼'?-3:-2);
    rank.push({n, gua, dir:FS.NINE_DIR[n], name:inf?inf.name:'-', good:!!(inf&&inf.good), score:s});
  }
  rank.sort((a,b)=>b.score-a.score);
  const dirTxt=d=>d.dir==='北'?'正北':d.dir==='南'?'正南':d.dir==='东'?'正东':d.dir==='西'?'正西':d.dir;
  /* 按游年分配全部空间：吉方承载吉用，凶方承载压制，按场所类型切换 */
  const TYPE_CONF={
    house:{title:'住宅别墅',PICK:{'大门':'生气','玄关':'生气','书房':'生气','主卧':'延年','客厅':'延年','阳台':'延年','厨房':'天医','餐厅':'天医','次卧':'天医','神位':'伏位','厕所':'五鬼','浴室':'祸害','家政间':'祸害','储物间':'绝命','楼梯电梯':'六煞'},
      TIP:{'大门':'气口纳气宜吉','玄关':'入户纳气第一关','书房':'书桌背靠面吉','主卧':'安床主卧宜此','客厅':'聚气会客宜此','阳台':'纳气休闲宜此','厨房':'厨房居吉方；灶口压凶向吉为两事，灶座见第三层三要','餐厅':'饮食纳福宜此','次卧':'子女客房宜此','神位':'宜静宜吉','厕所':'以凶压之化凶','浴室':'水湿压凶方','家政间':'洗衣杂物压凶','储物间':'杂物压凶方','楼梯电梯':'动线压凶方'}},
    office:{title:'办公室',PICK:{'大门':'生气','前台':'生气','接待区':'生气','老板位':'延年','办公桌':'延年','会议室':'延年','财务室':'天医','资料室':'天医','茶水间':'天医','神位':'伏位','厕所':'五鬼','杂物间':'祸害','仓库':'祸害','档案室':'绝命','走廊':'六煞'},
      TIP:{'大门':'气口纳气宜吉','前台':'员工聚气宜此','接待区':'纳客宜吉','老板位':'坐旺方宜延年','办公桌':'背后有靠面吉','会议室':'聚财会客宜此','财务室':'财位宜吉','资料室':'文件资料宜此','茶水间':'员工休憩宜吉','神位':'宜静宜吉','厕所':'以凶压之','杂物间':'杂乱宜压凶方','仓库':'旧物宜压凶','档案室':'文档宜凶方','走廊':'通道宜动线'}},
    shop:{title:'商铺门店',PICK:{'大门':'生气','橱窗':'生气','收银台':'生气','主货架':'延年','试衣间':'延年','贵宾区':'延年','仓库':'天医','员工区':'天医','财神位':'伏位','厕所':'五鬼','杂货区':'祸害','退货区':'祸害','死角':'绝命','通道':'六煞'},
      TIP:{'大门':'纳客气口宜吉','橱窗':'展示纳气宜吉','收银台':'财位关键宜生气','主货架':'主货架宜吉方','试衣间':'试衣体验宜此','贵宾区':'高客接待宜吉','仓库':'存货宜压凶','员工区':'员工休憩宜此','财神位':'供奉财神宜静','厕所':'以凶压之','杂货区':'杂货宜凶','退货区':'退货宜凶','死角':'杂物死角宜此','通道':'动线宜六煞'}},
    factory:{title:'厂房车间',PICK:{'大门':'生气','办公区':'生气','车间':'延年','主生产线':'延年','仓库':'天医','配电房':'天医','神位':'伏位','厕所':'五鬼','废料区':'祸害','污水处理':'祸害','废品站':'绝命','通道':'六煞'},
      TIP:{'大门':'气口纳气宜吉','办公区':'管理办公宜吉','车间':'生产作业宜延年','主生产线':'主产线宜吉方','仓库':'存货宜压凶','配电房':'电力宜吉','神位':'宜静宜吉','厕所':'以凶压之','废料区':'废料宜凶方','污水处理':'水污宜凶','废品站':'废品死角宜绝命','通道':'动线宜六煞'}}
  };
  const dirByName={};
  rank.forEach(r=>{ dirByName[r.name]=r; });
  const bType=getBase().type||'house';
  const conf=TYPE_CONF[bType]||TYPE_CONF.house;
  const PICK=conf.PICK, TIP=conf.TIP;
  /* 用位×流年煞交叉警示（本站归纳：关键用位当年避忌）与大门城门诀补救（吉力仅本运） */
  const ybBoard=FS.yearZiBai(flowY).board;
  const cm=xk?FS.gaoGeJu(xk).chengMen:null;
  const rows=Object.keys(PICK).map(name=>{
    const d=dirByName[PICK[name]]||rank[0];
    const gx=d.good?'吉':'凶';
    /* 该空间所在卦宫的玄空山向旺衰：丁=山星、财=向星，分开标注（旺与生绿、退暗金、死煞红） */
    let dcTxt='未排盘';
    if(xk&&d){
      const pn=FS_GUA_NUM[d.gua];
      const sc=xk.sitBoard.find(x=>x.palace===pn);
      const fc=xk.faceBoard.find(x=>x.palace===pn);
      if(sc&&fc){
        const sw=FS.starWangShuai(sc.star, yun.yun), fw=FS.starWangShuai(fc.star, yun.yun);
        const tag=w=>w==='旺'?'旺':(w==='生'?'生':(w==='退'?'退':'衰'));
        const cls=w=>(w==='旺'||w==='生')?'fs-badge-g':(w==='退'?'s-gold':'fs-badge-r');
        dcTxt='<span class="'+cls(sw)+'">丁'+tag(sw)+'</span> <span class="'+cls(fw)+'">财'+tag(fw)+'</span>';
      }
    }
    let flowSha='无';
    if(d){
      const pn2=FS_GUA_NUM[d.gua];
      const yst=ybBoard.find(x=>x.palace===pn2).star;
      const sheng=(xk.yun.yun%9)+1;
      if(yst===5) flowSha='<span class="fs-badge-r">'+flowY+'流年五黄到宫，正关煞，忌动土修造</span>';
      else if([2,3,7].indexOf(yst)>=0) flowSha='<span class="fs-badge-r">'+flowY+'流年'+STAR_NAMES[yst]+'到宫，宜静不宜动，化解见凶星化解表</span>';
      else if(yst===xk.yun.yun||yst===sheng) flowSha='<span class="fs-badge-g">'+flowY+'流年'+STAR_NAMES[yst]+'到宫（'+(yst===xk.yun.yun?'当令':'生气')+'），最宜布局催动</span>';
      else flowSha='<span class="s-gold">'+flowY+'流年'+STAR_NAMES[yst]+'到宫，吉神到宫，可顺势布局</span>';
    }
    let tipTxt=TIP[name]||'';
    if(name==='大门'&&cm){
      tipTxt+='；大门未落旺方时可取城门补救：正城门'+cm.zheng.shan+'方（'+(cm.zheng.usable?'可用':'不可用')+'）、副城门'+cm.fu.shan+'方（'+(cm.fu.usable?'可用':'不可用')+'），吉力仅本运';
    }
    return `<tr><td class="lbl-1">${name}</td><td>${dirTxt(d)}</td><td class="${gx==='吉'?'fs-badge-g':'fs-badge-r'}">${PICK[name]}（${gx}）</td><td>${dcTxt}</td><td>${flowSha}</td><td>${tipTxt}</td></tr>`;
  }).join('');
  /* 当年流年提示：体常运变，宅体按命卦格局一次定好，逐年旺衰神煞仅主当年避忌 */
  const ns=FS.nianSha(flowY);
  /* 当运旺星（当令星）落宫：山盘管丁、向盘管财 */
  let wangDing='未排盘', wangCai='未排盘';
  if(xk){
    const dingR=xk.sitBoard.filter(x=>x.star===yun.yun).map(x=>FS.NINE_DIR[x.palace]);
    const caiR=xk.faceBoard.filter(x=>x.star===yun.yun).map(x=>FS.NINE_DIR[x.palace]);
    if(dingR.length) wangDing=dingR.join('、');
    if(caiR.length) wangCai=caiR.join('、');
  }
  const flowRows=[
    `<tr><td class="lbl-1">当运旺星（山管丁）</td><td>${wangDing}</td><td>当令星到山，主旺丁、人口兴旺，宜作吉用</td></tr>`,
    `<tr><td class="lbl-1">当运旺星（向管财）</td><td>${wangCai}</td><td>当令星到向，主旺财、进益，宜作吉用</td></tr>`,
    `<tr><td class="lbl-1">五黄正关煞</td><td>${ns.wuHuang.dir}</td><td>忌动土修造，宜静</td></tr>`,
    `<tr><td class="lbl-1">岁破</td><td>${ns.suiPo.zhi}方</td><td>忌动土修造</td></tr>`,
    `<tr><td class="lbl-1">三煞</td><td>${ns.sanSha.map(s=>s.zhi+'方').join('、')}</td><td>忌修造动土</td></tr>`,
    `<tr><td class="lbl-1">吉方遇煞星</td><td>方位之吉不变</td><td>当年不动土、少动即可，次年自解</td></tr>`,
    `<tr><td class="lbl-1">凶方遇吉星</td><td>凶的本质不变</td><td>仅当年妨害稍减，次年复旧</td></tr>`
  ];
  const guide=`
    <div class="fs-mt-4">
      <div class="fs-board-title fs-title-left">方位布置　${conf.title}（本体按命卦固定，流年旺衰逐年变）</div>
      <div class="fs-tbl-scroll fs-tbl-lay"><table class="fs-mean-tbl fs-lay-tbl">
        <thead><tr><th>空间</th><th>方位</th><th>本体吉凶</th><th>流年丁财</th><th>流年</th><th>宜忌</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="fs-mt-3">
        <div class="fs-board-title fs-title-left">${flowY}年流年神煞提示（宅体为常、流年为用，仅主当年避忌）</div>
        <div class="fs-tbl-scroll"><table class="fs-mean-tbl">
          <thead><tr><th>流年</th><th>吉凶本质</th><th>当年宜忌</th></tr></thead>
          <tbody>${flowRows.join('')}</tbody>
        </table></div>
      </div>
    </div>`;
  yzOut.innerHTML=`
    <div class="sub-note">${y}年${male?'男':'女'}命：命卦 ${mg.gua}（${mg.group}）　${sitShan}山${faceShan}向　${flowY}年${yun?yun.yuan+yun.yun+'运':'未排盘'}${b.yunOv?'（换运盘，起宅定运）':''}　${xk?xk.geju:''}</div>
    <div class="wheel-block fs-mt-3"><h4>阳宅布局综合方位盘（${mg.gua}命 ${mg.group}）</h4>
      <div id="fsYzWheelHost">${fsYzWheelSvg()}</div>
      <div class="wheel-detail" id="fsYzDetail"></div></div>
    ${guide}
    <div class="fs-mt-3">
      <div class="fs-board-title fs-title-left">方位指北与吉凶</div>
      <div class="fs-tbl-scroll"><table class="fs-mean-tbl">
        <thead><tr><th>分类</th><th>内容</th></tr></thead>
        <tbody>
          <tr><td class="lbl-1">吉方</td><td class="fs-badge-g">${bz.ji.map(x=>x.name+'（'+fsDir(x.gua)+'）').join('、')}</td></tr>
          <tr><td class="lbl-1">凶方</td><td class="fs-badge-r">${bz.xiong.map(x=>x.name+'（'+fsDir(x.gua)+'）').join('、')}</td></tr>
        </tbody>
      </table></div>
    </div>`;
  fsYzDetail();
}
function fsYzFill(jx){ return jx==='大吉'||jx==='吉'?'var(--wheel-good)':(jx==='大凶'||jx==='凶'?'var(--wheel-bad)':''); }
function fsPickYz(i){ fsPickCommon(i, FS_PICK_CONF.yz); }
function fsYzNeedle(i){ fsNeedleCommon('fsYzNeedle','fsYzDot',i*45,false); }
/* 盘心三行：第一行常驻命卦，第二行给该宫与综合吉凶（判定，带吉凶色），第三行给宜忌取用 */
function fsYzCoreTxt(i){
  const p=FS_YZ_PAL[i];
  return [(FS_YZ_MG?FS_YZ_MG.gua:'')+'命', p.gua+'宫 '+p.zongJx, p.use, fsYzFill(p.zongJx)||'var(--wheel-ink2)'];
}
function fsYzCore(i){
  const t=fsYzCoreTxt(i);
  WHEEL.text('fsYzC1',t[0]);
  WHEEL.text('fsYzC2',t[1],t[3]);
  WHEEL.text('fsYzC3',t[2]);
}
function fsYzWheelSvg(){
  const ct=fsYzCoreTxt(FS_YZ_SEL);
  return WHEEL.render({
    id:'fsYzWheel', aria:'阳宅布局综合方位盘：外圈八卦宫、内圈综合吉凶，点选一宫看该宫合参与宜忌',
    n:8,
    span:function(i){ return [i*45-22.5,i*45+22.5]; },
    mid:function(i){ return i*45; },
    arc:FW_ARC, rIn:FW_IN, hit1:FW_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:FW_P0, p1:FW_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_YZ_SEL,
    selId:'fsYzCur', needleId:'fsYzNeedle', dotId:'fsYzDot',
    onclick:'fsPickYz',
    labelsOut:function(i,dg){
      const a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_YZ_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS_YZ_PAL[i].gua}</text>`;
    },
    labelsIn:function(i,dg){
      const a=WHEEL.px(FW_LAB_IN,dg), f=fsYzFill(FS_YZ_PAL[i].zongJx);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_YZ_SEL?' w-lab-cur':''}" data-i="${i}"`
        +(f?` style="fill:${f}"`:'')
        +` transform="rotate(${WHEEL.radial(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS_YZ_PAL[i].zongJx}</text>`;
    },
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsYzC1', text:ct[0]},
      {y:FW_C+14, cls:'w-c2', id:'fsYzC2', text:ct[1], style:'font-weight:700;fill:'+ct[3]},
      {y:FW_C+34, cls:'w-c3', id:'fsYzC3', text:ct[2]}
    ]
  });
}
function fsYzDetail(){
  const p=FS_YZ_PAL[FS_YZ_SEL];
  if(!p) return;
  const x=p.zongJx==='大凶'||p.zongJx==='凶';
  fwDetail('fsYzDetail',
    `${p.gua}宫（${p.dir}方） 八宅 ${p.baName}（${p.baGood?'吉':'凶'}）${p.xkStar?' 玄空 '+p.xkStar:''}${p.dingCai?' 流年'+p.dingCai:''}`
    +`<span class="wd-br"></span>`
    +`综合 <span class="${x?'wd-x':'wd-g'}">${p.zongJx}</span> ${p.use}`);
}
/* 金锁玉关（过路阴阳）：二十四山逐山砂水 + 形状吉凶。坎坤震巽喜砂，乾兑艮离喜水（同卦三山喜忌一致）
   输出走线条模式：按八卦分八段，段间以细线分隔，段内三山逐行排开，不用表格方框 */
function drawJsy(){
  const GRP=[
    {gua:'坎',dir:'北',fav:'砂',wx:'水',shan:[['壬','jsy-n'],['子','jsy-z'],['癸','jsy-g']],sid:'jsy-x1'},
    {gua:'坤',dir:'西南',fav:'砂',wx:'土',shan:[['未','jsy-w'],['坤','jsy-k'],['申','jsy-s']],sid:'jsy-x2'},
    {gua:'震',dir:'东',fav:'砂',wx:'木',shan:[['甲','jsy-j'],['卯','jsy-m'],['乙','jsy-y']],sid:'jsy-x3'},
    {gua:'巽',dir:'东南',fav:'砂',wx:'木',shan:[['辰','jsy-c'],['巽','jsy-xun'],['巳','jsy-si']],sid:'jsy-x4'},
    {gua:'乾',dir:'西北',fav:'水',wx:'金',shan:[['戌','jsy-xu'],['乾','jsy-qian'],['亥','jsy-hai']],sid:'jsy-x6'},
    {gua:'兑',dir:'西',fav:'水',wx:'金',shan:[['庚','jsy-geng'],['酉','jsy-you'],['辛','jsy-xin']],sid:'jsy-x7'},
    {gua:'艮',dir:'东北',fav:'水',wx:'土',shan:[['丑','jsy-chou'],['艮','jsy-gen'],['寅','jsy-yin']],sid:'jsy-x8'},
    {gua:'离',dir:'南',fav:'水',wx:'火',shan:[['丙','jsy-bing'],['午','jsy-wu'],['丁','jsy-ding']],sid:'jsy-x9'}
  ];
  const out=document.getElementById('jsyOut');
  /* 一山未定则整区不出断，只留一行提示：勘宅时只填见到的几山，未填的不占版面 */
  const anyPicked=GRP.some(g=>g.shan.some(([,id])=>document.getElementById(id).value));
  if(!anyPicked){ out.innerHTML='<div class="sub-note">逐山选砂水后断：坎坤震巽喜砂，乾兑艮离喜水；未选之山不出断，选定即出。</div>'; return; }
  const segs=GRP.map(g=>{
    const shape=document.getElementById(g.sid).value;
    const shapeTxt=!shape?'形质未填':(shape==='吉'?'形质佳':'形质差');
    const picked=g.shan.filter(([,id])=>document.getElementById(id).value);
    const rows=picked.map(([shan,id])=>{
      const sel=document.getElementById(id).value;
      /* 形状吉凶按所择砂水定义：砂宜高圆、水宜清环 */
      const shapeName=!shape?'':(sel==='砂'?(shape==='吉'?'高圆':'破碎'):(shape==='吉'?'清环':'直冲'));
      const ben=sel===g.fav, shapeJx=shape==='吉';
      let jx,mean,cls;
      if(ben&&shapeJx){ jx='大吉'; mean='此山宜'+g.fav+'，'+shapeName+'之美，吉上加吉'; cls='fs-badge-g'; }
      else if(ben&&!shape){ jx='吉'; mean='合'+g.fav+'之性，此山为吉'; cls='fs-badge-g'; }
      else if(ben&&shape==='凶'){ jx='平'; mean='方位得位但'+shapeName+'为煞，吉中带损'; cls=''; }
      else if(!ben&&shapeJx){ jx='平'; mean=shapeName+'虽美但方位失位，宜改'; cls=''; }
      else if(!ben&&shape==='凶'){ jx='凶'; mean='方位失位且'+shapeName+'冲煞，此山大凶'; cls='fs-badge-r'; }
      else { jx='凶'; mean='此山忌'+sel+'，宜'+g.fav; cls='fs-badge-r'; }
      return `<div class="fs-jsy-i">
        <span class="fs-jsy-sn">${shan}山</span>
        <span class="fs-jsy-sv">${sel}</span>
        <span class="fs-jsy-sp">${shapeName||'形质未填'}</span>
        <span class="fs-jsy-j ${cls}">${jx}</span>
        <span class="fs-jsy-m">${mean}</span></div>`;
    }).join('');
    return `<div class="fs-jsy-g">
      <div class="fs-jsy-gh"><span class="fs-jsy-gn">${g.gua}宫（${g.dir}）</span>
        <span class="fs-jsy-gf">喜${g.fav}　${g.wx}</span>
        <span class="fs-jsy-gs">${shapeTxt}</span>
        <span class="fs-jsy-gc">已定 ${picked.length}/${g.shan.length}</span></div>${rows}</div>`;
  }).join('');
  out.innerHTML=`<div class="fs-jsy">${segs}</div>${srLine(FS.scoreJsy(collectJsy().shans, collectJsy().xing),'jsy')}`;
}
/* 阳宅三要：《阳宅三要》门主灶以游年星定吉凶为主，五行生克为辅参 */
function drawSanYao(){
  const b=getBase();
  const zhaiGua=FS.SHAN_BAGUA[b.sitShan]||'坎';
  const door=b.doorGua;
  const main=document.getElementById('yzMain').value;
  const stove=document.getElementById('yzStove').value;
  const stoveDir=document.getElementById('yzStoveDir').value;
  const wx={坎:'水',坤:'土',震:'木',巽:'木',乾:'金',兑:'金',艮:'土',离:'火'};
  const sheng={木:'火',火:'土',土:'金',金:'水',水:'木'};
  const ke={木:'土',土:'水',水:'火',火:'金',金:'木'};
  /* 五行生克（辅参）：《阳宅三要》以相生为吉、相克为凶、比和亦吉，不论生克方向 */
  function rel(a,c){
    if(wx[a]===wx[c]) return {jx:'吉',cls:'s-gold',mean:wx[a]+'与'+wx[c]+'比和，同气相扶为吉'};
    if(sheng[wx[a]]===wx[c]) return {jx:'吉',cls:'fs-badge-g',mean:wx[a]+'生'+wx[c]+'，相生为吉'};
    if(sheng[wx[c]]===wx[a]) return {jx:'吉',cls:'fs-badge-g',mean:wx[c]+'生'+wx[a]+'，相生为吉'};
    if(ke[wx[a]]===wx[c]) return {jx:'凶',cls:'fs-badge-r',mean:wx[a]+'克'+wx[c]+'，相克为凶'};
    if(ke[wx[c]]===wx[a]) return {jx:'凶',cls:'fs-badge-r',mean:wx[c]+'克'+wx[a]+'，相克为凶'};
    return {jx:'平',cls:'',mean:''};
  }
  /* 游年星（三要主断）：法一以宅卦（坐山）起伏位；法二以门卦起伏位（门为伏位）。八宅九星：生气贪狼木、天医巨门土、延年武曲金、伏位辅弼木、绝命破军金、五鬼廉贞火、祸害禄存土、六煞文曲水 */
  const JIXING={'生气':'上吉（贪狼木）','延年':'上吉（武曲金）','天医':'中吉（巨门土）','伏位':'小吉（辅弼木）',
    '绝命':'大凶（破军金）','五鬼':'凶（廉贞火）','祸害':'凶（禄存土）','六煞':'凶（文曲水）'};
  const method=(document.getElementById('yzMethod').value==='door')?'door':'sit';
  const qiGua=method==='door'?door:zhaiGua;   /* 伏位卦：门或坐山 */
  const qiName=method==='door'?('门卦（门为伏位）'):('宅卦（坐山为伏位）');
  const doorStar=method==='door'?'伏位':FS.youXing(zhaiGua,door),
    mainStar=main?FS.youXing(qiGua,main):'', stoveStar=stove?FS.youXing(qiGua,stove):'', dirStar=stoveDir?FS.youXing(qiGua,stoveDir):'';
  const isJi=s=>['生气','延年','天医','伏位'].includes(s);
  /* 三要断法：门为第一要（宅之口），主为第二要（宅之腹），灶为第三要（宅之养），递进主断。
     主、灶座、灶向未填即不评，不以空值充吉充凶，总断只就已填之要合断 */
  const doorOk=isJi(doorStar);
  const mainOk=main?isJi(mainStar):null, stoveOk=stove?!isJi(stoveStar):null, dirOk=stoveDir?isJi(dirStar):null;
  const miss=[];
  if(!main) miss.push('主');
  if(!stove) miss.push('灶座');
  if(!stoveDir) miss.push('灶向');
  let zong, zy;
  if(!doorOk){ zong='凶'; zy='门为宅之口，门落凶星则纳气不正，三要之首已失，纵主灶得宜亦难安'; }
  else if(mainOk===false){ zong='凶'; zy='主为宅之腹，主房落凶星则宅主受损，家口难宁'; }
  else if(mainOk===null){ zong='吉'; zy=miss.join('、')+'未填不评，门已落吉星，按已填之要合断，补全后重断'; }
  else if(stoveOk===null||dirOk===null){ zong='吉'; zy='门主皆落吉星，'+miss.join('、')+'未填不评，按已填之要合断，补全后重断'; }
  else if(stoveOk&&dirOk){ zong='大吉'; zy='门主皆落吉星，灶座坐凶向吉，三要全合，为阳宅上吉之局'; }
  else if(stoveOk||dirOk){ zong='吉'; zy='门主皆吉，灶仅半合（座或向失其一），主吉局，灶位宜微调'; }
  else { zong='平'; zy='门主虽吉而灶座向俱不合，宅无大碍，灶为养命之源宜速调整'; }
  const zCls=zong==='大吉'||zong==='吉'?'fs-badge-g':(zong==='凶'?'fs-badge-r':'');
  /* 宅命相配：东四命住东四宅、西四命住西四宅为配 */
  const mg=mingGua(b.mingYear,b.male);
  const zhaiGroup=(['坎','震','巽','离'].includes(zhaiGua))?'东四宅':'西四宅';
  const mingGroup=mg?mg.group.replace('命','宅'):'';
  const pei=zhaiGroup===mingGroup?'吉（宅命同组，相配）':'凶（宅命异组，不相配）';
  const peiCls=zhaiGroup===mingGroup?'fs-badge-g':'fs-badge-r';
  const starCell=(s,ok)=>`<span class="${ok?'fs-badge-g':'fs-badge-r'}">${s}${JIXING[s]?'　'+JIXING[s]:''}</span>`;
  const rowOf=(label,gua,cell,yi,relTxt)=>gua
    ?`<tr><td class="lbl-1">${label}</td><td>${gua}${fsDir(gua)}</td><td>${cell}</td><td>${yi}</td><td>${relTxt}</td></tr>`
    :`<tr><td class="lbl-1">${label}</td><td colspan="4" class="s-gold">未填，本项不评（补填后重断）</td></tr>`;
  const relRow=(label,a,c)=>{
    if(!a||!c) return `<tr><td class="lbl-1">${label}</td><td colspan="3" class="s-gold">未填，本项不评</td></tr>`;
    const r=rel(a,c);
    return `<tr><td class="lbl-1">${label}</td><td>${wx[a]}对${wx[c]}</td><td class="${r.cls}">${r.jx}</td><td>${r.mean}</td></tr>`;
  };
  document.getElementById('sanyaoOut').innerHTML=`
    <div class="sub-note">起星法：${qiName}（${qiGua}）　宅卦：${zhaiGua}（坐${b.sitShan}山，${zhaiGroup}，五行${wx[zhaiGua]}）　宅主命卦：${mg?mg.gua+'（'+mg.group+'）':'未填'}　宅命相配：<b class="${peiCls}">${pei}</b></div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>要</th><th>方位</th><th>游年星（门主主断，灶为辅参）</th><th>宜忌</th><th>五行（辅参）</th></tr></thead><tbody>
      ${rowOf('门',door,starCell(doorStar,isJi(doorStar)),isJi(doorStar)?'门开吉方，纳气为吉':'门开凶方，宜改吉方或改门路',method==='door'?'门为伏位起星点':rel(door,zhaiGua).mean)}
      ${rowOf('主',main,starCell(mainStar,isJi(mainStar)),isJi(mainStar)?'主房安吉方，利宅主':'主房落凶方，宜移或改作他用',rel(main,zhaiGua).mean)}
      ${rowOf('灶座',stove,starCell(stoveStar,isJi(stoveStar)),!isJi(stoveStar)?'灶压凶方，以火化煞为吉':'灶压吉方，反伤吉气（三要忌之）',rel(stove,zhaiGua).mean)}
      ${rowOf('灶向',stoveDir,starCell(dirStar,isJi(dirStar)),isJi(dirStar)?'灶向朝吉方，纳吉为吉':'灶向朝凶方，宜改向',rel(stoveDir,zhaiGua).mean)}
    </tbody></table></div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>关系</th><th>五行生克（辅参）</th><th>吉凶</th><th>说明</th></tr></thead><tbody>
      ${relRow('门→主',door,main)}
      ${relRow('主→灶',main,stove)}
      ${relRow('灶→门',stove,door)}
    </tbody></table></div>
    <div class="sub-note">总体：<b class="${zCls}">${zong}</b>。${zy}。</div>${srLine(FS.scoreSanyao(qiGua, door, main, stove),'sanyao')}`;
}
/* 催旺布局：依玄空当运旺星与九星专主，定财位、文昌位、桃花位、官贵位、催丁位并附催法 */
function drawCui(){
  const b=getBase(), sit=b.sitShan, face=b.faceShan, y=b.flowYear;
  const xk=FS.xuanKong(sit,face,y,b.deg,b.faceDeg, b.yunOv);
  if(!xk){ document.getElementById('cuiOut').innerHTML='<div class="sub-note fs-t-red">坐向数据异常。</div>'; return; }
  /* 九星专主 + 结构化催法：摆物、颜色、数量（河图生成数）、材质、动静、忌；凶星附化解 */
  const STAR_ZHU={
    1:{name:'一白贪狼',zhu:'桃花人缘、名望、偏财',wx:'水',
       cui:{摆物:'鱼缸（活水循环）、流水景、白色水晶球',颜色:'白、蓝、黑',数量:'一件或六件（河图一六共宗水）',材质:'水族器皿（水之比和）、玻璃器皿（通书归水，盛水则纯以水论）',动静:'宜动，水须循环流动，忌死水久贮',忌:'忌黄色陶土之物克水，忌全干无水'}},
    4:{name:'四绿文曲',zhu:'文昌科甲、名声、文职',wx:'木',
       cui:{摆物:'文昌塔、毛笔四支（配砚台）、富贵竹等绿植',颜色:'绿、青',数量:'四支（文昌本数习俗）或三件、八件（河图三八为朋木）',材质:'木质、竹质、纸质（皆木之属，比和）',动静:'宜静，文书之地忌喧闹震动',忌:'忌金属刀剑克木，忌红色火物泄木'}},
    6:{name:'六白武曲',zhu:'官贵武职、权威、偏财',wx:'金',
       cui:{摆物:'铜印、铜葫芦、金属令牌、骏马摆件',颜色:'白、金、银',数量:'四件或九件（四九为友金）',材质:'铜、金属（金之比和）、玉石（土生金，印材）',动静:'宜静，官贵之物忌摇动',忌:'忌红色火物克金，忌劣质合金'}},
    8:{name:'八白左辅',zhu:'正财田宅、置业',wx:'土',
       cui:{摆物:'聚宝盆、黄水晶、陶瓷貔貅、山石盆景',颜色:'黄、米、咖啡',数量:'五件或十件（五十同途土）',材质:'陶瓷、玉石、石材（皆土之属，比和）',动静:'宜静，财库忌动，安置后不移',忌:'忌绿植木物克土；水之用分山向：向星得令见水催财可，山星见水损丁'}},
    9:{name:'九紫右弼',zhu:'喜庆婚嫁、桃花人缘',wx:'火',
       cui:{摆物:'红灯、紫色水晶、红色喜饰、暖光灯',颜色:'红、紫、橙',数量:'两件或七件（二七同道火）',材质:'木质灯座（木生火，印材助火气）、红色织物（火之比和）',动静:'宜动，灯宜长明，气色须鲜活',忌:'忌黑色水物克火，忌冷色调'}},
    2:{name:'二黑巨门',zhu:'病符',wx:'土',hua:'铜葫芦收化，或六帝钱泄土气；忌黄色陶瓷增旺病符'},
    3:{name:'三碧禄存',zhu:'是非口舌',wx:'木',hua:'红色物泄木（红地毯、红画），火雷噬嗑化是非；忌绿植助木'},
    5:{name:'五黄廉贞',zhu:'正关煞',wx:'土',hua:'铜铃、六帝钱、金属风铃以金泄土；此方忌动土、忌红黄两色，宜静不宜催'},
    7:{name:'七赤破军',zhu:'破败盗贼',wx:'金',hua:'黑色水物泄金（深色水景、黑曜石），或静置不动；忌金属利器增凶'}
  };
  const rows=FS_GRID.map(n=>{
    if(n===5) return '';
    const sc=xk.sitBoard.find(x=>x.palace===n);
    const fc=xk.faceBoard.find(x=>x.palace===n);
    const sw=FS.starWangShuai(sc.star, xk.yun.yun);
    const fw=FS.starWangShuai(fc.star, xk.yun.yun);
    /* 可催判定：山星主丁、向星主财，当令、生气方为可催；不可催者逐星标出实际旺衰档，退死煞三档各自出字 */
    const sOk=sw==='旺'||sw==='生', fOk=fw==='旺'||fw==='生';
    const fuyin=xk.fuYin.sit||xk.fuYin.face||xk.fanYin.sit||xk.fanYin.face;
    const canCui=[];
    if(fuyin) canCui.push({ok:false, txt:'全局伏吟反吟，宜静不宜动，暂不催'});
    else if(sOk) canCui.push({ok:true, txt:`山星${sc.star}${STAR_ZHU[sc.star].name}（${sw}）可催丁`});
    else if(fOk) canCui.push({ok:true, txt:`向星${fc.star}${STAR_ZHU[fc.star].name}（${fw}）可催财`});
    if(!fuyin&&!canCui.length) canCui.push({ok:false, txt:`山${sc.star}${sw}、向${fc.star}${fw}，二星俱失令，不宜催`});
    const cuiTxt=canCui.map(c=>`<span class="${c.ok?'fs-badge-g':'fs-badge-r'}">${c.txt}</span>`).join('<br>');
    /* 催动要点与化解要点分列短句；摆物、颜色、数量、材质、动静、忌等类目按星查下方"九星催法速查" */
    const cuiYao=[], huaYao=[];
    if(fuyin) cuiYao.push('全局伏吟反吟，宜静不宜动');
    if(sOk){ const z=STAR_ZHU[sc.star]; cuiYao.push('催丁（'+z.name+'，'+sw+'）：山星宜静乘丁气，安床稳坐、置山形稳物，辅'+z.wx+'性摆设（详见速查）'); }
    if(fOk){ const z=STAR_ZHU[fc.star]; cuiYao.push('催财（'+z.name+'，'+fw+'）：向星宜动引财气，动水或门路动气引之，辅'+z.wx+'性摆设（详见速查）'); }
    if(!sOk&&!fOk&&!fuyin) cuiYao.push('山向二星俱失令，宜静待当运再论催动');
    [[sc.star,sw,'山星'],[fc.star,fw,'向星']].forEach(p=>{
      const z=STAR_ZHU[p[0]];
      if(!z.hua) return;
      huaYao.push((p[1]==='旺'||p[1]==='生') ? p[2]+p[0]+z.name+'（'+p[1]+'）当令不作凶论，无须化解' : p[2]+p[0]+z.name+'（'+p[1]+'）：'+z.hua);
    });
    return `<tr><td class="lbl-1">${FS.NINE_BAGUA[n]}${FS.NINE_DIR[n]}</td>
      <td class="fei-${sc.star}">${sc.star}${sw}</td>
      <td class="fei-${fc.star}">${fc.star}${fw}</td>
      <td>${cuiTxt}</td>
      <td>${cuiYao.join('<br>')||'无'}</td>
      <td>${huaYao.join('<br>')||'无'}</td></tr>`;
  }).join('');
  /* 按目标速查：催财、催丁、催官、催文昌、催桃花 → 从盘中自动选当旺最旺宫位
     定源体例：催财催丁以向星或山星得令为准（写死星号组会漏当令之星，如七运七赤、六运六白）；
     催官催文昌催桃花依九星专主，目标星失令减力、死煞不催；组合吉格（一四同宫文昌、四九为友）并入可催；
     伏吟反吟局宜静不宜动，诸目标暂不催；令星入囚之宅催而无功，见高级格局。 */
  const fuyin=xk.fuYin.sit||xk.fuYin.face||xk.fanYin.sit||xk.fanYin.face;
  const wsOf=st=>FS.starWangShuai(st, xk.yun.yun);
  const palaces=FS_GRID.filter(n=>n!==5).map(n=>{
    const sc=xk.sitBoard.find(x=>x.palace===n);
    const fc=xk.faceBoard.find(x=>x.palace===n);
    const sw=wsOf(sc.star), fw=wsOf(fc.star);
    const rank=w=>w==="旺"?2:(w==="生"?1:0);
    const stars=[sc.star, fc.star];
    return {n, gong:FS.NINE_BAGUA[n]+FS.NINE_DIR[n], sc:String(sc.star), fc:String(fc.star),
      sOk:sw==="旺"||sw==="生", fOk:fw==="旺"||fw==="生", rank:rank(sw)+rank(fw),
      has6:stars.includes(6), has4:stars.includes(4), has1:stars.includes(1), has9:stars.includes(9),
      combo14:stars.includes(1)&&stars.includes(4), combo49:stars.includes(4)&&stars.includes(9),
      ok6:["旺","生","退"].includes(wsOf(6)), ok4:["旺","生","退"].includes(wsOf(4)),
      ok1:["旺","生","退"].includes(wsOf(1)), ok9:["旺","生","退"].includes(wsOf(9))};
  });
  const GOALS=[
    {k:"催财",  pick:p=>p.fOk,  tip:"向星当令或生气即财星可催（不以固定星号取）：动水、催财摆物置此方，应期当运与流年引动"},
    {k:"催丁",  pick:p=>p.sOk,  tip:"山星当令或生气即丁星可催：静物安放催人丁，安置后不移"},
    {k:"催官",  pick:p=>p.has6&&p.ok6,  tip:"六白武曲专主官贵：星宜旺相，失令减力，死煞之气不催；铜印金属宜静"},
    {k:"催文昌",pick:p=>(p.has4&&p.ok4)||p.combo14||p.combo49,  tip:"四绿文曲专主文昌，一四同宫为文昌大格、四九为友亦利科名；书桌文昌塔宜静"},
    {k:"催桃花",pick:p=>(p.has1&&p.ok1)||(p.has9&&p.ok9),  tip:"一白九紫专主桃花人缘（九星专主一法，未含命卦延年、流年咸池等法）：活水红灯，失令减力"}
  ];
  const yinYi=n=>{
    const years=[];
    for(let Y=y;Y<=y+9;Y++){
      const st=FS.yearZiBai(Y).board.find(x=>x.palace===n).star;
      if(st===xk.yun.yun||st===(xk.yun.yun%9)+1) years.push(Y);
    }
    return years;
  };
  const shaYi=n=>{
    const out=[];
    for(let Y=y;Y<=y+9;Y++){
      const st=FS.yearZiBai(Y).board.find(x=>x.palace===n).star;
      if([2,3,5,7].indexOf(st)>=0) out.push(Y+STAR_NAMES[st]);
    }
    return out;
  };
  const goalRows=GOALS.map(g=>{
    let hits=palaces.filter(g.pick);
    if(g.k==="催文昌") hits=hits.slice().sort((a,b)=>((b.combo14?1:0)-(a.combo14?1:0))||(b.rank-a.rank)||(a.n-b.n));
    else hits=hits.slice().sort((a,b)=>(b.rank-a.rank)||(a.n-b.n));
    if(fuyin) return `<tr><td class="lbl-1">${g.k}</td><td>全局伏吟反吟，宜静不宜动</td><td>本局暂不宜催动，先审局再论</td></tr>`;
    if(!hits.length) return `<tr><td class="lbl-1">${g.k}</td><td>本盘无该目标所主之得令星（或该星失令）</td><td>宜待流年引动后再催</td></tr>`;
    const names=hits.map(p=>{const yy=yinYi(p.n);return `${p.gong}（山${p.sc}向${p.fc}${p.combo14?"　一四同宫":""}${p.combo49?"　四九为友":""}）${yy.length?"："+yy.join("、")+"年流年旺星到宫引动":""}`;}).join("、");
    return `<tr><td class="lbl-1">${g.k}</td><td>${names}</td><td>${g.tip}</td></tr>`;
  }).join("");
    const has=(p,arr)=>arr.includes(p.sc)||arr.includes(p.fc);
  /* 应期年表（本站归纳）：未来十年流年当令或生气星到宫之年为催旺引动；流年凶星（二三四五七黑）到宫之年为凶煞发动 */
  /* 凶星化解：盘内二黑、三碧、五黄、七赤落宫逐列；失令为凶须化，得令不作凶论；双凶同宫以组合煞为重 */
  const HUA_COMBO={
    "23":"二三斗牛煞：木土相战，红色泄木兼铜葫芦泄土（泄而不克），忌动土",
    "25":"二五交加：病符关煞并临，此方绝对宜静，铜器金泄双重，忌动土、忌红黄两色",
    "27":"二七同道：病符破军并临，铜葫芦泄土为先，水泄金气次之",
    "35":"三五叠临：是非关煞并至，宜静，金泄土、红色泄木分置",
    "37":"三七穿心煞：金木相战，宜水通关（金生水、水生木），忌金木之物增势",
    "57":"五七相逢：关煞破军并至，金泄五黄为主，静置防盗劫"
  };
  const huaRows=palaces.filter(p=>has(p,["2","3","5","7"])).map(p=>{
    const stars=[...new Set([p.sc,p.fc].filter(x=>["2","3","5","7"].includes(x)))].map(Number);
    let huaTxt;
    if(stars.length===2){
      const key=stars.slice().sort((a,b)=>a-b).join("");
      huaTxt='<span class="fs-t-gold">'+HUA_COMBO[key]+'</span>';
    }else{
      const z=STAR_ZHU[stars[0]];
      const ws=wsOf(stars[0]);
      huaTxt=(ws==="旺"||ws==="生")?z.name+"（"+ws+"）当令不作凶论，无须化解":z.name+"（"+ws+"）"+z.hua;
      const isShan=p.sc===String(stars[0]), isXiang=p.fc===String(stars[0]);
      huaTxt+=isShan&&isXiang?"（山向同临，动静两处皆宜化解）":(isShan?"（山星之煞化于静处，宜在坐卧方位处置）":"（向星之煞化于动处，宜在门路水口处置）");
      const sy=shaYi(p.n);
      if(sy.length) huaTxt+="<br>流年凶星叠至："+sy.join("、")+"，其年发动尤须防";
    }
    return `<tr><td class="lbl-1">${p.gong}</td><td>${stars.map(s=>{const z=STAR_ZHU[s];return z.name+"（"+z.zhu+"）";}).join("、")}</td><td>${huaTxt}</td></tr>`;
  }).join("");
    document.getElementById('cuiOut').innerHTML=`
    <div class="sub-note">${y}年${xk.yun.yuan}${xk.yun.yun}运（${xk.yun.name}）　${sit}山${face}向（坐${sit}向${face}）　当令星${xk.yun.yun}、生气星${(xk.yun.yun%9)+1}。山管丁、水管财，向星旺则催财，山星旺则催丁。</div>
    <div class="fs-tbl-scroll fs-tbl-cui"><table class="fs-mean-tbl"><thead><tr><th>宫位</th><th>山星</th><th>向星</th><th>可催</th><th>催动要点</th><th>化解要点</th></tr></thead><tbody>${rows}</tbody></table></div>
    <h3 class="rel-title fs-mt-3">九星催法速查（催法按星不按宫，摆设类目逐星查此表）</h3>
    <div class="fs-tbl-scroll fs-tbl-cuifa"><table class="fs-mean-tbl"><thead><tr><th>星</th><th>专主</th><th>摆物</th><th>颜色</th><th>数量</th><th>材质</th><th>动静</th><th>忌与化解</th></tr></thead><tbody>${[1,4,6,8,9,2,3,5,7].map(st=>{
      const z=STAR_ZHU[st];
      const detail=z.cui
        ? '<td>'+z.cui.摆物+'</td><td>'+z.cui.颜色+'</td><td>'+z.cui.数量+'</td><td>'+z.cui.材质+'</td><td>'+z.cui.动静+'</td><td>'+z.cui.忌+'</td>'
        : '<td>无</td><td>无</td><td>无</td><td>无</td><td>宜静不宜动</td><td>'+z.hua+'</td>';
      return '<tr><td class="lbl-1 fei-'+st+'">'+z.name+'</td><td>'+z.zhu+'</td>'+detail+'</tr>';
    }).join('')}</tbody></table></div>
    <h3 class="rel-title fs-mt-3">按目标速查（列出全部可催旺宫位）</h3>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>目标</th><th>可催旺宫位</th><th>催法要点</th></tr></thead><tbody>${goalRows}</tbody></table></div>
    <h3 class="rel-title fs-mt-3">凶星化解（盘内病符、是非、关煞、破军落宫）</h3>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>宫位</th><th>凶星</th><th>化解</th></tr></thead><tbody>${huaRows||'<tr><td colspan="3">盘内无失令之二黑、三碧、五黄、七赤落宫。</td></tr>'}</tbody></table></div>`;
}
/* 财位、文昌、桃花：以基础设定的坐向、门位、流年与宅主年命取数。
   明财位为形法通俗位，暗财位取八宅生气、玄空向星、流年八白、本命生气四法并列；
   文昌取本命年干、流年四绿、八宅生气、玄空四绿；桃花取本命咸池、流年咸池、八宅延年、玄空一白九紫。
   四法各出各条，不混拼第三值；不一致时以理气位为主、形法位为辅。 */
const FS_GUA_CHONG={乾:'巽',巽:'乾',坎:'离',离:'坎',艮:'坤',坤:'艮',震:'兑',兑:'震'};
const FS_ZHI_DIR={子:'正北',丑:'东北',寅:'东北',卯:'正东',辰:'东南',巳:'东南',午:'正南',未:'西南',申:'西南',酉:'正西',戌:'西北',亥:'西北'};
const FS_WENCHANG={甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
const FS_XIANCHI={申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'};
function fsGuaAngle(g){
  const d=FS.GUA_DIR[g]||'';
  return {北:0,东北:45,东:90,东南:135,南:180,西南:225,西:270,西北:315}[d];
}
function fsDoorSide(){
  const b=getBase();
  const door=document.getElementById('baseDoor').value||'';
  const faceGua=FS.SHAN_BAGUA[b.faceShan]||'';
  const da=fsGuaAngle(door), fa=fsGuaAngle(faceGua);
  if(da==null||fa==null) return {side:'未知',txt:'门位或向首未定'};
  const rel=((da-fa)%360+360)%360;
  if(rel<45||rel>315) return {side:'中',txt:'门在向首正中'};
  if(rel<180) return {side:'右',txt:'门在向首右侧，属白虎方'};
  return {side:'左',txt:'门在向首左侧，属青龙方'};
}
function fsMingOfBase(){
  const dv=document.getElementById('baseDate').value||'';
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(dv);
  if(!m) return null;
  const y=mingGuaYear(+m[1],+m[2],+m[3]);
  const male=document.getElementById('baseSex').value==='1';
  return {year:y, male, mg:mingGua(y,male), gz:FS.yearGZ(y)};
}
function fsGongName(n){ return n===5?'中宫':FS.NINE_BAGUA[n]+FS.NINE_DIR[n]; }
function fsYearStarPalaces(year, star){
  return FS.yearZiBai(year).board.filter(x=>x.star===star).map(x=>fsGongName(x.palace));
}
function fsXkBoard(){
  const b=getBase();
  return FS.xuanKong(b.sitShan,b.faceShan,b.flowYear,b.deg,b.faceDeg,b.yunOv);
}
function fsXkPalaces(xk, pred){
  return FS_GRID.filter(n=>n!==5).map(n=>{
    const sc=xk.sitBoard.find(x=>x.palace===n), fc=xk.faceBoard.find(x=>x.palace===n);
    return {n, gong:fsGongName(n), sc, fc};
  }).filter(pred);
}
function fsWangOk(star, yun){ const w=FS.starWangShuai(star,yun); return w==='旺'||w==='生'; }
function fsBaZhaiStar(gua, name){
  const bz=FS.baZhai(gua); if(!bz) return null;
  const j=(bz.ji||[]).find(x=>x.name===name); if(j) return j;
  return (bz.xiong||[]).find(x=>x.name===name)||null;
}
function drawCaiWei(){
  const host=document.getElementById('cwOut'); if(!host) return;
  const b=getBase();
  const door=document.getElementById('baseDoor').value||'';
  const side=fsDoorSide();
  const ming=fsMingOfBase();
  const xk=fsXkBoard();
  const yun=xk?xk.yun.yun:null;
  let mingTxt, mingPos;
  if(side.side==='左'){ mingTxt='进门右斜对角，客厅右后角'; mingPos='门在左，取右后角'; }
  else if(side.side==='右'){ mingTxt='进门左斜对角，客厅左后角'; mingPos='门在右，取左后角'; }
  else if(side.side==='中'){ mingTxt='客厅与门相对的最远一角'; mingPos='门居中，取实墙无窗之一角'; }
  else { mingTxt='未定'; mingPos='门位未定'; }
  const zhaiGua=FS.SHAN_BAGUA[b.sitShan]||'';
  const sheng=zhaiGua?fsBaZhaiStar(zhaiGua,'生气'):null;
  let caiPal='未排盘';
  if(xk){
    const arr=fsXkPalaces(xk,p=>p.fc&&fsWangOk(p.fc.star,yun));
    caiPal=arr.length?arr.map(p=>p.gong+'，向星'+p.fc.star).join('、'):'本盘无向星得令或生气之宫';
  }
  const y8=fsYearStarPalaces(b.flowYear,8);
  let benMing='出生日期未填';
  if(ming){
    const ms=fsBaZhaiStar(ming.mg.gua,'生气');
    benMing=ms?(ms.gua+fsDir(ms.gua)):'无';
  }
  const shengTxt=sheng?(sheng.gua+fsDir(sheng.gua)):'宅卦未定';
  const same=sheng&&side.side!=='未知'&&sheng.gua===FS_GUA_CHONG[door];
  const rows=[
    `<tr><td class="lbl-1 fs-nowrap">明财位</td><td>${mingTxt}</td><td>${mingPos}；住宅取客厅，店铺取收银台后方</td><td>宜静、宜亮、靠实墙；忌空、漏、压、污，忌对厕所厨房</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">八宅财位（暗）</td><td>${shengTxt}</td><td>宅卦${zhaiGua||'未定'}游年生气方</td><td>宜聚气，可置财箱、聚宝盆；忌厕所厨房压</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">玄空财位（暗）</td><td>${caiPal}</td><td>向星得令或生气之宫</td><td>向星方宜动、宜见水；山星方忌见水</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">流年财位</td><td>${y8.length?y8.join('、'):'无'}</td><td>${b.flowYear}年八白左辅到宫</td><td>当年宜催动，忌动土修造</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">本命财位</td><td>${benMing}</td><td>宅主命卦${ming?ming.mg.gua:'未定'}游年生气方</td><td>宜个人聚财，忌污损</td></tr>`
  ].join('');
  const note=same
    ?'明财位所对之方与八宅生气方同宫，形法与理气一致，吉上加吉。'
    :`明财位在进门斜对角，八宅生气方在${shengTxt}，两者不同宫；以暗财位为主、明财位为辅。暗财位落厕所、厨房、走廊者不可用，改取明财位。`;
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>财位</th><th>方位</th><th>取法</th><th>宜忌</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="sub-note">${note}</div>
    <div class="sub-note">财位是聚气位，财神位是供奉位；财神位可安在明财位，但财位不等于神位。财位见水之说分两派：八宅以水为财，玄空向星得令见水催财；另有财位忌水、以水化财之说，两说并列，取用随所依师承。</div>
    <div class="fs-src">依据：明财位取《八宅明镜》财位说与通行进门斜对角法；暗财位取八宅游年生气、玄空向星、流年紫白八白、命卦生气；置信中；不作财数之断。</div>`;
}
function drawWenChang(){
  const host=document.getElementById('wcOut'); if(!host) return;
  const b=getBase();
  const ming=fsMingOfBase();
  const xk=fsXkBoard();
  const yun=xk?xk.yun.yun:null;
  let ben='出生日期未填', benNote='本命文昌取年干';
  if(ming){
    const zhi=FS_WENCHANG[ming.gz[0]];
    ben=zhi?(FS_ZHI_DIR[zhi]+'，'+zhi+'方'):'无';
    benNote='本命文昌取'+ming.gz[0]+'年干，口诀甲乙巳午、丙戊申、丁己酉、庚亥、辛子、壬寅、癸卯';
  }
  const liu=fsYearStarPalaces(b.flowYear,4);
  const zhaiGua=FS.SHAN_BAGUA[b.sitShan]||'';
  const sheng=zhaiGua?fsBaZhaiStar(zhaiGua,'生气'):null;
  const bazhai=sheng?(sheng.gua+fsDir(sheng.gua)):'宅卦未定';
  let xkArr='未排盘';
  if(xk){
    const arr=fsXkPalaces(xk,p=>{
      const stars=[p.sc.star,p.fc.star];
      const has4=stars.includes(4)&&(fsWangOk(p.sc.star,yun)||fsWangOk(p.fc.star,yun));
      const c14=stars.includes(1)&&stars.includes(4);
      const c49=stars.includes(4)&&stars.includes(9);
      return has4||c14||c49;
    });
    xkArr=arr.length?arr.map(p=>p.gong+(p.sc.star===4||p.fc.star===4?'，四绿':'')+(p.sc.star===1||p.fc.star===1?'，一白':'')+(p.sc.star===9||p.fc.star===9?'，九紫':'')).join('、'):'本盘无四绿得令或一四、四九同宫';
  }
  const rows=[
    `<tr><td class="lbl-1 fs-nowrap">本命文昌</td><td>${ben}</td><td>${benNote}</td><td>书桌坐此方，文昌塔、毛笔四支、富贵竹</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">流年文昌</td><td>${liu.length?liu.join('、'):'无'}</td><td>${b.flowYear}年四绿文曲到宫</td><td>当年书桌、文具置此方，忌堆杂物</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">八宅文昌</td><td>${bazhai}</td><td>宅卦游年生气方，另一说取伏位</td><td>宜静、宜明亮，忌厕所压文昌</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">玄空文昌</td><td>${xkArr}</td><td>四绿得令，或一四同宫、四九为友</td><td>书桌文昌塔宜静，忌金属刀剑与红色火物</td></tr>`
  ].join('');
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>文昌位</th><th>方位</th><th>取法</th><th>催法</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="sub-note">本命文昌取年干，另一法取日干；八宅文昌取生气方，另一说取伏位；两说并列，取用随所依师承。文昌位忌背门、忌横梁压顶、忌厕所与厨房压。</div>
    <div class="fs-src">依据：本命文昌取通行命理口诀（甲乙巳午报君知）；流年文昌取紫白四绿；八宅文昌取《八宅明镜》生气方；玄空取一四同宫、四九为友通行法；置信中。</div>`;
}
function drawTaoHua(){
  const host=document.getElementById('thOut'); if(!host) return;
  const b=getBase();
  const ming=fsMingOfBase();
  const xk=fsXkBoard();
  const yun=xk?xk.yun.yun:null;
  let ben='出生日期未填', benNote='本命桃花取年支咸池';
  if(ming){
    const zhi=FS_XIANCHI[ming.gz[1]];
    ben=zhi?(FS_ZHI_DIR[zhi]+'，'+zhi+'方'):'无';
    benNote='本命桃花取'+ming.gz[1]+'年支咸池，申子辰在酉、寅午戌在卯、巳酉丑在午、亥卯未在子';
  }
  const ny=FS.yearGZ(b.flowYear)[1];
  const liuZhi=FS_XIANCHI[ny];
  const liu1=fsYearStarPalaces(b.flowYear,1), liu9=fsYearStarPalaces(b.flowYear,9);
  const liu=liuZhi?(FS_ZHI_DIR[liuZhi]+'，'+liuZhi+'方'):'无';
  const zhaiGua=FS.SHAN_BAGUA[b.sitShan]||'';
  const yan=zhaiGua?fsBaZhaiStar(zhaiGua,'延年'):null;
  const bazhai=yan?(yan.gua+fsDir(yan.gua)):'宅卦未定';
  let xkArr='未排盘';
  if(xk){
    const arr=fsXkPalaces(xk,p=>{
      const stars=[p.sc.star,p.fc.star];
      const has1=stars.includes(1)&&(fsWangOk(p.sc.star,yun)||fsWangOk(p.fc.star,yun));
      const has9=stars.includes(9)&&(fsWangOk(p.sc.star,yun)||fsWangOk(p.fc.star,yun));
      return has1||has9;
    });
    xkArr=arr.length?arr.map(p=>p.gong+(p.sc.star===1||p.fc.star===1?'，一白':'')+(p.sc.star===9||p.fc.star===9?'，九紫':'')).join('、'):'本盘无一白九紫得令之宫';
  }
  const rows=[
    `<tr><td class="lbl-1 fs-nowrap">本命桃花</td><td>${ben}</td><td>${benNote}</td><td>未婚宜催，已婚不宜强催；鲜花、粉色、成对摆件</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">流年桃花</td><td>${liu}；一白${liu1.length?liu1.join('、'):'无'}；九紫${liu9.length?liu9.join('、'):'无'}</td><td>${b.flowYear}年咸池与一白九紫到宫</td><td>当年可催，忌假花、带刺植物、空瓶</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">八宅延年</td><td>${bazhai}</td><td>宅卦游年延年方，主夫妻和睦</td><td>宜整洁、成对摆件，忌厕所压</td></tr>`,
    `<tr><td class="lbl-1 fs-nowrap">玄空桃花</td><td>${xkArr}</td><td>一白贪狼、九紫右弼得令</td><td>活水、红灯；已婚者不宜强催</td></tr>`
  ].join('');
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>桃花位</th><th>方位</th><th>取法</th><th>宜忌</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="sub-note">桃花位分本命、流年、八宅、玄空四法；已婚者以延年夫妻位为主，不宜再催桃花。桃花位宜干净、明亮、鲜花，忌假花、带刺植物、空瓶与杂物堆积。</div>
    <div class="fs-src">依据：咸池取《三命通会》神煞通行口诀；流年取紫白一白九紫；八宅取《八宅明镜》延年方；玄空取一白九紫专主；置信中。</div>`;
}
/* 鲁班尺、楼层、室内细部、化煞物品、选房验房：五者皆属布局与验收，不并入宅评总分。
   鲁班尺取八格通行本，楼层取河图尾数五行，室内与化煞取通行阳宅忌形与法器用法，
   选房验房取形法与居住实况核查项；各表只作对照与处置提示，不作财数病名之断。 */
const FS_LUBAN_LEN=42.9, FS_LUBAN_SEG=FS_LUBAN_LEN/8;
const FS_LUBAN=[
  {n:'财',jx:'吉',mu:'财德、宝库、六合、迎福',use:'大门、房门、神桌、收银台'},
  {n:'病',jx:'凶',mu:'退财、公事、牢执、孤寡',use:'忌作门、床、神桌'},
  {n:'离',jx:'凶',mu:'长库、劫财、官鬼、失脱',use:'忌作门、床'},
  {n:'义',jx:'吉',mu:'添丁、益利、贵子、大吉',use:'房门、床、灶台'},
  {n:'官',jx:'吉',mu:'顺科、横财、进益、富贵',use:'大门、书房、神桌'},
  {n:'劫',jx:'凶',mu:'死别、退口、离乡、财失',use:'忌作门、床'},
  {n:'害',jx:'凶',mu:'灾至、死绝、病临、口舌',use:'忌作门、床、灶'},
  {n:'本',jx:'吉',mu:'财至、登科、进宝、兴旺',use:'大门、房门、床、灶台'}
];
function fsLuBanOf(cm){
  if(!isFinite(cm)||cm<=0) return null;
  const r=((cm%FS_LUBAN_LEN)+FS_LUBAN_LEN)%FS_LUBAN_LEN;
  const i=Math.min(7,Math.floor(r/FS_LUBAN_SEG));
  return {i, seg:FS_LUBAN[i], r, chi:cm/FS_LUBAN_LEN};
}
function drawLuBan(){
  const host=document.getElementById('lbOut'); if(!host) return;
  const cm=parseFloat(document.getElementById('lbCm').value);
  const use=document.getElementById('lbUse').value||'大门';
  const one=fsLuBanOf(cm);
  let row='';
  if(one){
    const s=one.seg;
    row=`<tr><td class="lbl-1">${use}</td><td>${cm} 厘米</td><td>${one.chi.toFixed(2)} 尺</td><td>${s.n}<span class="${s.jx==='吉'?'fs-badge-g':'fs-badge-r'}">${s.jx}</span></td><td>${s.mu}</td><td>${s.use}</td></tr>`;
  }
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>用途</th><th>尺寸</th><th>尺数</th><th>格</th><th>格内四目</th><th>宜忌</th></tr></thead><tbody>${row||'<tr><td colspan="6">填入尺寸后量尺。</td></tr>'}</tbody></table></div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>格</th><th>吉凶</th><th>四目</th><th>宜用</th></tr></thead><tbody>${FS_LUBAN.map(s=>`<tr><td class="lbl-1">${s.n}</td><td class="${s.jx==='吉'?'fs-badge-g':'fs-badge-r'}">${s.jx}</td><td>${s.mu}</td><td>${s.use}</td></tr>`).join('')}</tbody></table></div>
    <div class="fs-src">依据：鲁班尺八格财病离义官劫害本为通行本；尺长 42.9 厘米为通行制，另有 50.4 厘米等坊本；量门取门框内径，量床取床板长宽，量灶取灶面长宽；置信中。</div>`;
}
const FS_LOU_WX={0:'土',1:'水',2:'火',3:'木',4:'金',5:'土',6:'水',7:'火',8:'木',9:'金'};
const FS_LOU_GUA_WX={坎:'水',坤:'土',震:'木',巽:'木',乾:'金',兑:'金',艮:'土',离:'火'};
const FS_LOU_SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
const FS_LOU_KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
function fsWxRelOf(a,b){
  if(a===b) return {jx:'吉',txt:'同气'};
  if(FS_LOU_SHENG[a]===b) return {jx:'吉',txt:'楼层生命卦'};
  if(FS_LOU_KE[a]===b) return {jx:'凶',txt:'楼层克命卦'};
  if(FS_LOU_SHENG[b]===a) return {jx:'平',txt:'命卦生楼层，泄气'};
  if(FS_LOU_KE[b]===a) return {jx:'平',txt:'命卦克楼层'};
  return {jx:'平',txt:'无生克'};
}
function drawLouCeng(){
  const host=document.getElementById('lcOut'); if(!host) return;
  const f=parseInt(document.getElementById('lcFloor').value,10);
  const ming=fsMingOfBase();
  const wx=isFinite(f)?FS_LOU_WX[Math.abs(f)%10]:null;
  let row='';
  if(wx&&ming){
    const mgWx=FS_LOU_GUA_WX[ming.mg.gua]||'';
    const rel=fsWxRelOf(wx,mgWx);
    row=`<tr><td class="lbl-1">${f} 层</td><td>${wx}</td><td>${ming.mg.gua}命（${mgWx}）</td><td class="${rel.jx==='吉'?'fs-badge-g':(rel.jx==='凶'?'fs-badge-r':'s-gold')}">${rel.jx}</td><td>${rel.txt}</td></tr>`;
  }
  const tab=[[1,'水','水命、木命'],[2,'火','火命、土命'],[3,'木','木命、火命'],[4,'金','金命、水命'],[5,'土','土命、金命'],[6,'水','水命、木命'],[7,'火','火命、土命'],[8,'木','木命、火命'],[9,'金','金命、水命'],[0,'土','土命、金命']]
    .map(r=>`<tr><td class="lbl-1">${r[0]===0?'10 或 0':r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>楼层</th><th>楼层五行</th><th>宅主命卦</th><th>生克</th><th>判断</th></tr></thead><tbody>${row||'<tr><td colspan="5">填入楼层与出生日期后看。</td></tr>'}</tbody></table></div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>尾数</th><th>五行</th><th>宜</th></tr></thead><tbody>${tab}</tbody></table></div>
    <div class="fs-src">依据：楼层五行取河图一六水、二七火、三八木、四九金、五十土通行说；与命卦论生克，同气与楼层生命卦为吉，楼层克命卦为凶，余为平；置信中；地下层按绝对层数取。</div>`;
}
const FS_INDOOR=[
  {k:'镜对床',mean:'镜面照床，主心神不宁、睡眠不安',hua:'移镜或加帘，卧室内不设大镜'},
  {k:'镜对门',mean:'镜对大门，主气散、口舌',hua:'移镜、加屏风，门内不设反射面'},
  {k:'镜对灶',mean:'镜照灶台，主火气反射、口舌',hua:'移镜或遮帘'},
  {k:'门对门',mean:'两门直对，主口舌、隐私外泄',hua:'常闭一门、挂门帘、设屏风'},
  {k:'大门对电梯楼梯',mean:'气口对动线，主气不聚',hua:'玄关、屏风、门槛，门常闭'},
  {k:'厕占中宫',mean:'宅心受污，主宅运不定',hua:'常闭、排气、绿植、铜葫芦，保持干燥'},
  {k:'厨厕同宫',mean:'水火相战，主健康与口舌',hua:'隔断、常闭、通风，灶与厕不相对'},
  {k:'床对门',mean:'床对门，主睡眠不安、隐私外泄',hua:'移床、挂帘、屏风'},
  {k:'横梁压床压桌',mean:'梁下久坐卧，主压迫、运滞',hua:'移床移桌、吊顶包梁、梁下置柜'},
  {k:'鱼缸对灶',mean:'水火相冲，主口舌与健康',hua:'移缸或移灶，二者不相对'},
  {k:'假花带刺植物',mean:'假花主虚情，带刺主口舌',hua:'换真花、圆叶常绿植物'},
  {k:'杂物堆积',mean:'气滞不畅，主运滞',hua:'定期清理，通道与财位保持通畅'},
  {k:'神位对厕对床',mean:'神位受污或不敬',hua:'移神位，背靠实墙，高于人头'},
  {k:'沙发书桌背门',mean:'背后无靠、背门而坐，主不安',hua:'移座背实墙，或设屏风'}
];
function fillIndoor(){
  const host=document.getElementById('indRow'); if(!host||host.children.length) return;
  host.innerHTML=FS_INDOOR.map((x,i)=>`<div class="field chk"><input type="checkbox" id="ind-${i}" onchange="drawIndoor()"><label for="ind-${i}">${x.k}</label></div>`).join('');
}
function drawIndoor(){
  const host=document.getElementById('indOut'); if(!host) return;
  const hit=FS_INDOOR.filter((x,i)=>{const el=document.getElementById('ind-'+i);return el&&el.checked;});
  if(!hit.length){ host.innerHTML='<div class="sub-note">未勾选忌形；若有表中未列之项，按同法先改结构、再以帘、屏风、常闭、通风化解。</div>'; return; }
  host.innerHTML=`<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>忌形</th><th>影响</th><th>化解</th></tr></thead><tbody>${hit.map(x=>`<tr><td class="lbl-1">${x.k}</td><td>${x.mean}</td><td>${x.hua}</td></tr>`).join('')}</tbody></table></div><div class="sub-note">已勾 ${hit.length} 项。先改结构，不能改者用帘、屏风、常闭、通风与绿植化解；化解以对症为先，不宜堆叠法器。</div>`;
}
const FS_HUASHA=[
  {n:'八卦镜',use:'挡路冲、尖角、反弓',how:'凸镜挡煞、凹镜收气、平镜反射，悬于门外或窗外正对煞方',taboo:'忌对室内、忌对邻家门窗，室内不宜'},
  {n:'山海镇',use:'挡天斩、路冲、反弓',how:'正对煞方悬挂或立置，取山海镇守之意',taboo:'小空间与卧室内不宜'},
  {n:'石敢当',use:'路冲、反弓、桥煞',how:'立于冲处或埋于墙脚，字朝煞方',taboo:'埋设须稳，不宜半露松动'},
  {n:'五帝钱',use:'挡煞、招财、化五黄',how:'门楣、门槛、财位或五黄方，串挂或平放',taboo:'忌污损、忌仿品；化五黄以铜质为先'},
  {n:'铜葫芦',use:'化病符、五黄、二黑',how:'病符方、床头或梁下，开口葫芦收病气，闭口葫芦化煞',taboo:'忌对厕、忌破损'},
  {n:'貔貅',use:'招财、守财',how:'财位或收银台，头朝外，成对摆放',taboo:'忌对厕、忌对床、忌单只'},
  {n:'麒麟',use:'化煞、催丁、镇宅',how:'门两侧或客厅，成对',taboo:'忌对厕、忌破损'},
  {n:'泰山石',use:'补靠山、挡缺角',how:'缺角方或座位背后，取稳实之意',taboo:'不宜过多，室内小空间慎用'},
  {n:'铜铃风铃',use:'化五黄、二黑',how:'五黄方悬挂铜铃，以金泄土',taboo:'卧室不宜，声扰睡眠'},
  {n:'绿植',use:'化煞、催文昌、活气',how:'圆叶常绿植物，置煞方或文昌方',taboo:'忌带刺、藤蔓、枯黄、假花'}
];
function drawHuaSha(){
  const host=document.getElementById('csOut'); if(!host) return;
  host.innerHTML=`<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>物品</th><th>用途</th><th>用法</th><th>禁忌</th></tr></thead><tbody>${FS_HUASHA.map(x=>`<tr><td class="lbl-1">${x.n}</td><td>${x.use}</td><td>${x.how}</td><td>${x.taboo}</td></tr>`).join('')}</tbody></table></div><div class="fs-src">依据：八卦镜、山海镇、石敢当、五帝钱、铜葫芦、貔貅、麒麟、泰山石、铜铃与绿植用法取阳宅化煞通行说与《鲁班经》石敢当条；置信中；法器以对症为先，不宜堆叠。</div>`;
}
const FS_XUANFANG={
  buy:[
    ['外局','路冲、反弓、天斩、割脚、高压线、庙宇殡仪','先避外煞，再看户型'],
    ['楼栋','采光、通风、朝向、楼间距','南向或东南向优先，实地看早晚光'],
    ['户型','方正、缺角、穿堂、厕占中宫','方正优先，缺角按方位补，穿堂设玄关'],
    ['楼层','尾数五行与命卦生克','见楼层五行模块'],
    ['门向','大门纳气、门对电梯楼梯','门开吉方，忌直对电梯楼梯'],
    ['厨房','灶位、灶厕相对、通风','灶不压吉、不厕相对，通风为先'],
    ['卫生间','是否占中宫、是否对门','常闭、排气、干燥'],
    ['卧室','床向、采光、噪音','床头靠实墙，避噪声源'],
    ['阳台','杂物、晾晒、对外形煞','保持通畅，煞方遮挡'],
    ['邻里','噪音、异味、纠纷','实地多时段看']
  ],
  rent:[
    ['结构','不可大改，先看采光通风','以移床、帘、屏风、绿植、常闭、通风为主'],
    ['潮湿','霉斑、渗漏、异味','查卫生间与外墙，潮湿重者不租'],
    ['噪音','临街、电梯、邻居','夜间实地听'],
    ['前任','前任住户与空置时长','问清空置原因'],
    ['门向','大门对电梯楼梯、门对门','设帘、屏风、常闭'],
    ['床位','床对门、床对镜、横梁','移床或加帘']
  ],
  second:[
    ['产权','产权清晰、无纠纷','核产权与抵押'],
    ['前任','前任住户、是否凶宅','问邻居与物业，合同写明'],
    ['结构','渗漏、裂缝、霉变','请专业人员验房'],
    ['异味','霉味、烟味、宠物味','通风后复看'],
    ['邻里','纠纷、噪音、治安','多时段实看']
  ],
  xiong:[
    ['价格','明显低于同区','低价先问原因'],
    ['空置','长期空置、急售','问空置与急售原因'],
    ['异味','异常气味、动物不愿进','实地多次复看'],
    ['采光','长期昏暗、潮湿','白天看采光'],
    ['邻里','避谈、纠纷、事故','向邻居与物业核实'],
    ['处置','核实后仍不安','可换房；不制造恐慌，以事实为先']
  ]
};
function drawXuanFang(){
  const host=document.getElementById('xfOut'); if(!host) return;
  const k=document.getElementById('xfScene').value||'buy';
  const rows=FS_XUANFANG[k]||[];
  host.innerHTML=`<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>核查项</th><th>判据</th><th>处置</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="lbl-1">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div><div class="fs-src">依据：选房验房取阳宅形法与居住实况通行核查项；凶宅以事实核验为先，不作臆断；置信中。</div>`;
}
/* 场所专法：按基础设定的场所类型给选址、门、核心位与忌；行业五行另表，只作参考。 */
const FS_CHANGSUO={
  house:{nm:'住宅别墅',rows:[
    ['选址','近路冲、反弓、天斩、高压线、庙宇殡仪者先避；安静、采光、通风为先','先避外煞，再看户型'],
    ['门','大门纳气，门开吉方，忌直对电梯楼梯','门内设玄关，门常闭'],
    ['核心位','客厅明财位、主卧延年、厨房天医、神位伏位','按八宅与玄空并参'],
    ['忌','穿堂、厕占中宫、厨厕同宫、横梁压床','先改结构，再以帘、屏风化解']
  ]},
  office:{nm:'办公室',rows:[
    ['选址','写字楼外局先避路冲、反弓、天斩；采光通风与电梯动线为先','选层选位见楼层五行'],
    ['门','大门纳气宜吉，忌直对电梯口与走廊尽头','前台置于门内明处'],
    ['核心位','老板桌坐旺向吉、财务室生气天医、会议室延年、前台生气','老板桌背后靠实墙'],
    ['忌','老板桌背门、财务室压凶、厕占中宫、通道直穿','先调座位，再以屏风与绿植化解']
  ]},
  shop:{nm:'商铺门店',rows:[
    ['选址','人流来向、街角与转角优先；忌反弓、路冲、天桥压顶与死巷','先看人流与可见度'],
    ['门','门面纳气宜宽畅，忌被遮挡、忌对电梯口与垃圾站','门内留缓冲，收银台可见'],
    ['核心位','收银台生气、橱窗纳气、财神位静、主货架延年','收银台不宜对门直冲'],
    ['忌','收银台对厕、财神位对门、仓库占吉方、通道直穿','先调收银与货架，再化煞']
  ]},
  factory:{nm:'厂房车间',rows:[
    ['选址','地势平整、排水通畅；忌低洼积水、高压线、路冲与反弓','先看地质与排水'],
    ['门','大门纳气宜吉，货车出入口与人员入口分开','门内留回车与缓冲'],
    ['核心位','办公区生气、主生产线延年、仓库天医、配电房吉','生产线宜顺不宜逆'],
    ['忌','污水废料占吉方、厕占中宫、通道直穿车间','先改布局，再以绿化与隔断化解']
  ]}
};
const FS_HANGYE=[
  ['金','金融、机械、五金、珠宝','宜金旺之方与尾数 4、9 楼层，白、金、银色','忌火气过旺'],
  ['木','教育、文化、木材、服装','宜木旺之方与尾数 3、8 楼层，绿、青色','忌金器过多'],
  ['水','贸易、物流、旅游、水产','宜水旺之方与尾数 1、6 楼层，黑、蓝、灰色','忌土重阻塞'],
  ['火','餐饮、能源、电子、美容','宜火旺之方与尾数 2、7 楼层，红、紫、橙色','忌水重克火'],
  ['土','房产、建筑、农业、陶瓷','宜土旺之方与尾数 5、10 楼层，黄、棕、米色','忌木重克土']
];
function drawChangSuo(){
  const host=document.getElementById('csTypeOut'); if(!host) return;
  const cur=getBase().type||'house';
  const order=['house','office','shop','factory'];
  const rows=order.map(k=>{
    const c=FS_CHANGSUO[k];
    return c.rows.map((r,i)=>`<tr><td class="lbl-1">${i===0?c.nm+(k===cur?'<span class="fs-badge-g">当前</span>':''):''}</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  }).join('');
  host.innerHTML=`
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>场所</th><th>项目</th><th>要点</th><th>处置</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>行业五行</th><th>行业举例</th><th>宜</th><th>忌</th></tr></thead><tbody>${FS_HANGYE.map(r=>`<tr><td class="lbl-1">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>
    <div class="fs-src">依据：场所专法取《阳宅三要》门主灶与八宅游年，兼取商业与厂房通行布局说；行业五行取五行归类通行说；置信中；行业与楼层、方位只作参考，不作经营成败之断。</div>`;
}
/* 玄空高级格局：全局三般卦、连茹格、七星打劫、城门诀、令星入囚（继承玄空盘） */
function drawGaoJi(){
  const b=getBase();
  const xk=FS.xuanKong(b.sitShan, b.faceShan, b.flowYear, b.deg, b.faceDeg, b.yunOv);
  const g=xk?FS.gaoGeJu(xk):null;
  if(!g){ document.getElementById('ggOut').innerHTML=''; return; }
  const yq=xk.yun;
  const jxCls=v=>v.indexOf('凶')>=0?'fs-badge-r':(v.indexOf('吉')>=0||v.indexOf('可用')>=0?'fs-badge-g':'s-gold');
  const dj=g.daJie, cm=g.chengMen, rq=g.ruQiu;
  const cmTxt=x=>x.shan+'方（'+FS.NINE_BAGUA[x.palace]+'宫，运盘星入中'+(x.usable?'<span class="fs-badge-g">旺星可到，可用</span>':'<span class="fs-badge-r">旺星不到，不可用</span>')+'）';
  const sitPal=FS_GUA_NUM[FS.SHAN_BAGUA[b.sitShan]]||5;
  const facePal=FS_GUA_NUM[FS.SHAN_BAGUA[b.faceShan]]||5;
  const sitS=xk.sitBoard.find(x=>x.palace===sitPal).star;
  const sitF=xk.faceBoard.find(x=>x.palace===sitPal).star;
  const faceS=xk.sitBoard.find(x=>x.palace===facePal).star;
  const faceF=xk.faceBoard.find(x=>x.palace===facePal).star;
  const yunS=xk.yun.yun, shengS=(yunS%9)+1;
  const shouShan=sitS===yunS, chuSha=faceF===yunS;
  const shangShan=faceS===yunS&&sitF===yunS;
  const shuangXiang=faceS===faceF&&(faceS===yunS||faceS===shengS);
  const shuangZuo=sitS===sitF&&(sitS===yunS||sitS===shengS);
  const rows=[
    `<tr><td class="lbl-1">父母三般卦（全局）</td><td class="${g.sanBan?'fs-badge-g':'s-gold'}">${g.sanBan?'成局':'未成局'}</td>
      <td>${g.sanBan?'全盘九宫运、山、向三星合成一四七、二五八、三六九之一，通三元之气，主三元不败、丁财绵长。':'全盘九宫三星未合成三般（一四七、二五八、三六九），属常态；此格成局极罕，八运艮坤寅申四局为著例。'}</td></tr>`,
    `<tr><td class="lbl-1">连茹格（连珠三般卦）</td><td class="${g.lianRu?'fs-badge-g':'s-gold'}">${g.lianRu?'成局':'未成局'}</td>
      <td>${g.lianRu?'全盘九宫运、山、向三星连成递进一数（一二三、二三四……九一二），亦主气脉绵长、三元不败。':'全盘九宫三星未成连珠之数，属常态。'}</td></tr>`,
    `<tr><td class="lbl-1">七星打劫</td><td class="${dj?(dj.fanFu?'fs-badge-r':'fs-badge-g'):'s-gold'}">${dj?(dj.fanFu?'成局犯伏反吟':'成局（'+dj.type+'）'):'不成立'}</td>
      <td>${dj?'本盘双星到向，'+(dj.type.indexOf('真')>=0?'离、震、乾':'坎、巽、兑')+'三宫山向飞星合成'+dj.group.join('')+'三般，劫取未来之气，主三元不败；三宫宜门路通气、外有明堂方应。'+(dj.fanFu?'惟犯伏吟反吟，不可用。':'用'+(dj.type.indexOf('真')>=0?'离':'坎')+'则不能用'+(dj.type.indexOf('真')>=0?'坎':'离')+'。'):'本盘非双星到向，或三宫未合成三般之数，无打劫之用（打劫以双星到向为前提，从严）。'}</td></tr>`,
    `<tr><td class="lbl-1">城门诀</td><td class="${(cm.zheng.usable||cm.fu.usable)?'fs-badge-g':'s-gold'}">${cm.zheng.usable||cm.fu.usable?'有可用城门':'正副城门均不可用'}</td>
      <td>向首${b.faceShan}向两旁取同元位：正城门（合生成之数）${cmTxt(cm.zheng)}；副城门${cmTxt(cm.fu)}。可用者当运以城门方水光、通路纳气补向首之用，最吉为大门正对；城门吉力仅限本运(${yq.start}-${yq.end})，运过即败。形局须宅旁另有缺口、水光或通路，方论城门。</td></tr>`,
    `<tr><td class="lbl-1">令星入囚</td><td class="${(xk.yun.yun===rq.shan.yun||xk.yun.yun===rq.face.yun)?'fs-badge-r':'s-gold'}">${xk.yun.yun===rq.shan.yun?'现运山星入囚':(xk.yun.yun===rq.face.yun?'现运向星入囚':'现运不入囚')}</td>
      <td>山星${xk.sitIn}入中，行至${rq.shan.yun}运(${rq.shan.start}-${rq.shan.end})山星入囚，主该运损丁；向星${xk.faceIn}入中，行至${rq.face.yun}运(${rq.face.start}-${rq.face.end})向星入囚，主该运破财。囚于中宫之气不能作用，宜中宫天井动象或向首放光之水解救。</td></tr>`,
    `<tr><td class="lbl-1">收山出煞</td><td class="${shouShan&&chuSha?'fs-badge-g':'s-gold'}">${shouShan&&chuSha?'成局':(shouShan||chuSha?'半合':'未成局')}</td>
      <td>当运山星到坐山为收山，当运向星到向首为出煞。${shouShan&&chuSha?'本盘坐山得山星'+sitS+'、向首得向星'+faceF+'，丁财两旺，坐山宜实、向首宜通。':'本盘坐山山星'+sitS+'、向首向星'+faceF+'，'+(shouShan?'收山已备而出煞未全，向首宜通气补水。':(chuSha?'出煞已备而收山未全，坐山宜培实补丁。':'收山出煞俱未备，宜静守待运。'))}</td></tr>`,
    `<tr><td class="lbl-1">上山下水</td><td class="${shangShan?'fs-badge-r':'s-gold'}">${shangShan?'犯局':'不犯'}</td>
      <td>${shangShan?'当运山星到向首、当运向星到坐山，丁财两失，宜静守或改向，待运过再论。':'本盘山星与向星未互换失位，不犯上山下水。'}</td></tr>`,
    `<tr><td class="lbl-1">双星会向</td><td class="${shuangXiang?'fs-badge-g':'s-gold'}">${shuangXiang?'成局':'未成局'}</td>
      <td>${shuangXiang?'山向两星同到向首（当令或生气），主财旺；向首宜开门纳气、见水，坐山宜静实。':'山向两星未同到向首，或所同之星非当令生气。'}</td></tr>`,
    `<tr><td class="lbl-1">双星会坐</td><td class="${shuangZuo?'fs-badge-g':'s-gold'}">${shuangZuo?'成局':'未成局'}</td>
      <td>${shuangZuo?'山向两星同到坐山（当令或生气），主丁旺；坐山宜静实、宜有靠，向首宜通。':'山向两星未同到坐山，或所同之星非当令生气。'}</td></tr>`
  ];
  document.getElementById('ggOut').innerHTML=`
    ${srLine(FS.scoreGeju(xk),'geju')}
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>格局</th><th>判定</th><th>断要</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}
/* 玄空大卦抽爻换象：六十四卦名取通行卦序，逐爻变卦只出变卦，不作吉凶断。
   卦名表为本页立向参详所需，与别页卦名库不互引，免为一件小工具牵动全站装载。 */
const FS_GUA64_ORDER=['乾','兑','离','震','巽','坎','艮','坤'];
const FS_GUA64_TBL={
  乾:['乾为天','天泽履','天火同人','天雷无妄','天风姤','天水讼','天山遁','天地否'],
  兑:['泽天夬','兑为泽','泽火革','泽雷随','泽风大过','泽水困','泽山咸','泽地萃'],
  离:['火天大有','火泽睽','离为火','火雷噬嗑','火风鼎','火水未济','火山旅','火地晋'],
  震:['雷天大壮','雷泽归妹','雷火丰','震为雷','雷风恒','雷水解','雷山小过','雷地豫'],
  巽:['风天小畜','风泽中孚','风火家人','风雷益','巽为风','风水涣','风山渐','风地观'],
  坎:['水天需','水泽节','水火既济','水雷屯','水风井','坎为水','水山蹇','水地比'],
  艮:['山天大畜','山泽损','山火贲','山雷颐','山风蛊','山水蒙','艮为山','山地剥'],
  坤:['地天泰','地泽临','地火明夷','地雷复','地风升','地水师','地山谦','坤为地']
};
const FS_TRIGRAM_BITS={乾:[1,1,1],兑:[1,1,0],离:[1,0,1],震:[1,0,0],巽:[0,1,1],坎:[0,1,0],艮:[0,0,1],坤:[0,0,0]};
function fsGua64Name(upper,lower){ return FS_GUA64_TBL[upper][FS_GUA64_ORDER.indexOf(lower)]; }
function fsBitsToTrigram(bits){ for(const n of FS_GUA64_ORDER){ if(FS_TRIGRAM_BITS[n].join('')===bits.join('')) return n; } return ''; }
function fsBitsToGua(bits6){ const lower=fsBitsToTrigram(bits6.slice(0,3)); const upper=fsBitsToTrigram(bits6.slice(3,6)); return {name:fsGua64Name(upper,lower),upper,lower}; }
function fsGua64Bits(name){
  for(const u of FS_GUA64_ORDER){
    const i=FS_GUA64_TBL[u].indexOf(name);
    if(i>=0){ const l=FS_GUA64_ORDER[i]; return [...FS_TRIGRAM_BITS[l],...FS_TRIGRAM_BITS[u]]; }
  }
  return null;
}
function fillChouYao(){
  const el=document.getElementById('cyGua'); if(!el||el.options.length) return;
  el.innerHTML=FS_GUA64_ORDER.map(u=>`<optgroup label="上卦${u}">${FS_GUA64_TBL[u].map(n=>`<option value="${n}">${n}</option>`).join('')}</optgroup>`).join('');
}
function drawChouYao(){
  const host=document.getElementById('cyOut'); if(!host) return;
  const name=document.getElementById('cyGua').value||'乾为天';
  const bits=fsGua64Bits(name);
  if(!bits){ host.innerHTML='<div class="sub-note">未选卦。</div>'; return; }
  const labels=['初爻','二爻','三爻','四爻','五爻','上爻'];
  const rows=labels.map((lab,i)=>{
    const b=bits.slice(); b[i]=b[i]?0:1;
    const g=fsBitsToGua(b);
    return `<tr><td class="lbl-1">${lab}变</td><td>${g.name}</td><td>${g.upper}上${g.lower}下</td><td>${b.map(x=>x?'阳':'阴').join('')}</td></tr>`;
  }).join('');
  const orig=fsBitsToGua(bits);
  host.innerHTML=`<div class="sub-note">本卦：<b>${orig.name}</b>（${orig.upper}上${orig.lower}下）。抽爻换象只出变卦，不作吉凶断。</div><div class="fs-tbl-scroll fs-mt-2"><table class="fs-mean-tbl"><thead><tr><th>爻变</th><th>变卦</th><th>上下卦</th><th>六爻自下而上</th></tr></thead><tbody>${rows}</tbody></table></div><div class="fs-src">依据：六十四卦名取通行卦序，抽爻换象取玄空大卦逐爻变卦通行法；置信中；吉凶须结合卦运、爻位与山向，不单以变卦断。</div>`;
}
function fsSdRow(i){ return FS_SD_DATA.rows.find(r=>r.palace===FS_ZB_ORDER[i]); }
/* 盘心三行：第一行恒为中宫入中之星（常驻，与紫白盘同制式，放大字不得给选中宫之星，否则被读成该星入中）；
   第二行给该星入中与吉凶，第三行给该宫流年×山与流年×向的双重裁决（判定，带吉凶色），这是“叠”字的落点；
   圈上只有星名与山向数，组合吉凶只在此处与盘下详情条。 */
function fsSdCoreTxt(i){
  const d=FS_SD_DATA, r=fsSdRow(i);
  const jxs=[r.comboSM.jx, r.comboSF.jx];
  const bad=jxs.some(x=>x.indexOf('凶')>=0), good=jxs.every(x=>x.indexOf('吉')>=0);
  return [STAR_NAMES[d.inCenter], '入中 '+(FS.STAR_JX[d.inCenter]||''),
    '叠断 山'+r.comboSM.jx+' 向'+r.comboSF.jx,
    bad?'var(--wheel-bad)':(good?'var(--wheel-good)':'var(--wheel-ink2)')];
}
function fsSdCore(i){
  const t=fsSdCoreTxt(i);
  WHEEL.text('fsSdC1',t[0]);
  WHEEL.text('fsSdC2',t[1]);
  WHEEL.text('fsSdC3',t[2],t[3]);
}
function fsSdNeedle(i){
  const root=document.getElementById('fsSdWheel'); if(!root) return;
  const nd=root.querySelector('#fsSdNeedle'), dt=root.querySelector('#fsSdDot');
  if(!nd||!dt) return;
  const a=i*45, q0=WHEEL.px(SD_P0,a), q1=WHEEL.px(SD_P1,a);
  nd.setAttribute('x1',WHEEL.n(q0[0])); nd.setAttribute('y1',WHEEL.n(q0[1]));
  nd.setAttribute('x2',WHEEL.n(q1[0])); nd.setAttribute('y2',WHEEL.n(q1[1]));
  dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1]));
}
function fsSdWheelSvg(){
  const d=FS_SD_DATA; if(!d) return '';
  const ct=fsSdCoreTxt(FS_SD_SEL);
  return WHEEL.render({
    id:'fsSdWheel', aria:'流年飞星叠宅运盘：外圈八宫方位，内两圈为流年星与山向星，点选一宫看流年叠断',
    n:8,
    span:function(i){ return [i*45-22.5,i*45+22.5]; },
    mid:function(i){ return i*45; },
    arc:FW_ARC, rIn:SD_IN, hit1:SD_HIT1, tick0:FW_TICK0, tick1:FW_TICK1, p0:SD_P0, p1:SD_P1, out:FW_OUT, core:FW_CORE, c:FW_C,
    sel:FS_SD_SEL,
    selId:'fsSdCur', needleId:'fsSdNeedle', dotId:'fsSdDot',
    onclick:'fsPickSd',
    labelsOut:function(i,dg){
      const n=FS_ZB_ORDER[i], a=WHEEL.px(FW_LAB_OUT,dg);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_SD_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.NINE_BAGUA[n]}${FS.NINE_DIR[n]}</text>`;
    },
    labelsMid:function(i,dg){
      const r=fsSdRow(i), a=WHEEL.px(SD_ZW,dg), f=fwJxFill(FS.STAR_JX[r.nian]);
      return `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_SD_SEL?' w-lab-cur':''}" data-i="${i}"`
        +(f?` style="fill:${f}"`:'')
        +` transform="rotate(${WHEEL.radial(dg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${STAR_NAMES[r.nian]}</text>`;
    },
    labelsIn:function(i,dg){
      const r=fsSdRow(i);
      let out='';
      [[-12,'山'+r.sit,fwJxFill(r.comboSM.jx)],[12,'向'+r.face,fwJxFill(r.comboSF.jx)]].forEach(pr=>{
        const ang=dg+pr[0], a=WHEEL.px(SD_SX,ang);
        out+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_SD_SEL?' w-lab-cur':''}" data-i="${i}"`
          +(pr[2]?` style="fill:${pr[2]}"`:'')
          +` transform="rotate(${WHEEL.radial(ang)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${pr[1]}</text>`;
      });
      return out;
    },
    rings:[{r:FW_OUT,cls:'w-ring'},{r:SD_IN,cls:'w-ring'},{r:FW_CORE,cls:'w-core'}],
    center:[
      {y:FW_C-16, cls:'w-c1', id:'fsSdC1', text:ct[0]},
      {y:FW_C+14, cls:'w-c2', id:'fsSdC2', text:ct[1], style:'font-weight:700;fill:'+ct[3]},
      {y:FW_C+34, cls:'w-c3', id:'fsSdC3', text:ct[2]}
    ]
  });
}
function fsSdDetail(){
  const d=FS_SD_DATA; if(!d) return;
  const r=fsSdRow(FS_SD_SEL);
  const tag=(r.isDoor?'向首宫 ':'')+(r.isGate?'门宫 ':'')+(r.isSit?'坐山宫 ':'');
  const mid=d.rows.find(x=>x.palace===5);
  /* 盘心行一是中宫入中之星，其吉凶在详情条给出：与紫白飞星盘同口径，入中主星的好坏不落空 */
  const midJx=FS.STAR_JX[mid.nian], midX=midJx.indexOf('凶')>=0;
  fwDetail('fsSdDetail',
    `${FS.NINE_BAGUA[r.palace]}宫（${r.dir}方） ${tag}流年${STAR_NAMES[r.nian]} 山星${r.sit} 向星${r.face}`
    +`<span class="wd-br"></span>`
    +`流年×山 <span class="${r.comboSM.jx.indexOf('凶')>=0?'wd-x':(r.comboSM.jx.indexOf('吉')>=0?'wd-g':'')}">${r.comboSM.jx}</span> ${r.comboSM.mean}`
    +`<span class="wd-br"></span>`
    +`流年×向 <span class="${r.comboSF.jx.indexOf('凶')>=0?'wd-x':(r.comboSF.jx.indexOf('吉')>=0?'wd-g':'')}">${r.comboSF.jx}</span> ${r.comboSF.mean}`
    +`<span class="wd-br"></span>`
    +`中宫：入中${STAR_NAMES[mid.nian]}（<span class="${midX?'wd-x':'wd-g'}">${midJx}</span>）、山星${mid.sit}、向星${mid.face} 五黄落${FS.NINE_DIR[d.wuHuangPalace]}方`
    +`<span class="wd-br"></span>`
    +`流年吉星（一白、四绿、六白、八白、九紫）飞临宅盘当运之星所在之宫者，其年动而用之最验。`);
}
function fsPickSd(i){ fsPickCommon(i, FS_PICK_CONF.sd); }
function drawSuiYun(){
  const b=getBase();
  const xk=FS.xuanKong(b.sitShan, b.faceShan, b.flowYear, b.deg, b.faceDeg, b.yunOv);
  const out=document.getElementById('sdOut'); if(!out) return;
  if(!xk){ out.innerHTML=''; return; }
  const sd=FS.suiNianDie(xk, b.flowYear, b.doorGua);
  FS_SD_DATA=sd;
  FS_SD_SEL=FS_ZB_ORDER.indexOf(FS_GUA_NUM[FS.SHAN_BAGUA[b.faceShan]]);
  if(FS_SD_SEL<0) FS_SD_SEL=0;
  out.innerHTML=`<div class="wheel-block fs-mt-3"><h4>流年飞星叠宅运盘（${sd.year}年叠${b.sitShan}山${b.faceShan}向${xk.yun.yuan}${xk.yun.yun}运）</h4>
    <div id="fsSdWheelHost">${fsSdWheelSvg()}</div>
    <div class="wheel-detail" id="fsSdDetail"></div></div>`
    +`<div class="sub-note">内两圈：外为流年星，内为山星与向星（山在左、向在右），字色即流年叠断之裁决。</div>`
    +(sd.warnings.length?'<div class="fs-warn">'+sd.warnings.map(w=>'<i>'+w+'</i>').join('')+'</div>':'')
    +srLine(FS.scoreSuiyun(xk, b.flowYear, b.sitShan, b.doorGua),'suiyun');
  fsSdDetail();
}
/* 八宅穿宫九星（竹节贯井） */
function drawChuanGong(){
  const b=getBase();
  const zhai=FS.SHAN_BAGUA[b.sitShan], face=FS.SHAN_BAGUA[b.faceShan];
  const door=b.doorGua;
  const n=parseInt(document.getElementById('cgN').value,10)||5;
  const cg=FS.chuanGong(zhai, door, face, n);
  if(!cg){ document.getElementById('cgOut').innerHTML=''; return; }
  const jxCls=j=>j==='大吉'||j==='上吉'||j==='次吉'||j==='吉'?'fs-badge-g':'fs-badge-r';
  const rows=cg.stars.map((s,i)=>`<tr><td class="lbl-1">第 ${i+1} ${n<=7?'进':'进（层）'}</td>
    <td class="${jxCls(s.jx)}">${s.star}</td><td>${s.jx}</td><td>${s.gao}${s.gao==='宜高'?'（纳气受福）':'（卑伏避凶）'}</td></tr>`).join('');
  document.getElementById('cgOut').innerHTML=`
    <div class="sub-note">${zhai}宅（坐${b.sitShan}）　门开${door}方　向${face}（向首${b.faceShan}）　${n}进　${cg.zhaiType}　第一栋定法：${cg.firstRule}。</div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>进（层）</th><th>九星</th><th>吉凶</th><th>宜忌</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${srLine(FS.scoreChuangong(cg),'chuangong')}`;
}
/* 金锁玉关现状收集（drawJsy 与评分共用） */
function collectJsy(){
  const shans={}, xing={};
  JSY_GRP.forEach(g=>{
    const sid=document.getElementById(g.sid);
    if(sid&&sid.value) xing[g.gua]=sid.value;
    g.shan.forEach(p=>{ const el=document.getElementById(p[1]); if(el&&el.value) shans[p[0]]=el.value; });
  });
  return {shans, xing};
}
/* 形煞推断：只读峦头三因子给建议，用户点采纳才写入十项核对；不自动改分。 */
function fsSuggestXingSha(){
  const box=document.getElementById('xsSuggest'); if(!box) return;
  const map={'天斩煞':1,'路冲枪煞':2,'反弓煞':3,'割脚煞':4,'尖角冲射':7,'孤阴孤阳':9,'声光电煞':10};
  const out=[];
  collectLt().forEach(r=>{
    const idx=map[r.type]; if(!idx) return;
    if(r.angle>=60){ out.push({idx,nm:r.type,v:'',note:'侧对不论'}); return; }
    if(r.dist==null){ out.push({idx,nm:r.type,v:'',note:'距离未填，待实测'}); return; }
    const v=r.dist<=32?'近':'远';
    out.push({idx,nm:r.type,v,note:(v==='近'?'近':'远')+'距 '+r.dist+' 米'});
  });
  if(!out.length){ box.textContent='峦头三因子中暂无可对应的形煞项。'; return; }
  box.innerHTML='<b>推断建议</b>（点采纳才写入形煞核对，不自动改分）：<br><span class="fs-src">依据：峦头三因子（距离、角度、高低）；置信：中；只建议，采纳才写入。</span><br>'+out.map(x=>`<span class="fs-sug">${x.nm}：${x.note}${x.v?'，建议'+x.v+'犯':''}${x.v?` <button class="btn" type="button" onclick="fsAdoptSug(${x.idx},'${x.v}')">采纳</button>`:''}</span>`).join('<br>');
}
function fsAdoptSug(idx,v){ const el=document.getElementById('xs-'+idx); if(!el) return; el.value=v; drawXingSha(); fsSuggestXingSha(); }
/* 阳宅形煞自检（外部峦头核对）：近犯（近距离正对）重、远犯（远距离斜对）轻，分档为本站归纳 */
function drawXingSha(){
  const NM=['天斩煞','路冲枪煞','反弓煞','割脚煞','穿堂煞','横梁压顶','尖角冲射','镰刀煞','孤阴独阳','声光电磁'];
  const vals=NM.map((nm,i)=>({nm, v:(document.getElementById('xs-'+(i+1))||{}).value||''}));
  const checked=vals.filter(x=>x.v);
  const near=vals.filter(x=>x.v==='近'||x.v==='犯');
  const far=vals.filter(x=>x.v==='远');
  const fanN=near.length+far.length;
  let jx, mean;
  const nearNm=near.map(x=>x.nm), farNm=far.map(x=>x.nm);
  const posDesc=(nearNm.length?'近犯：'+nearNm.join('、'):'')+(nearNm.length&&farNm.length?'　':'')+(farNm.length?'远犯：'+farNm.join('、'):'');
  if(checked.length===0){
    jx='待核'; mean='逐项核对宅外环境后断。形煞核对为外部峦头粗核，与第二层以下理气诸法参看：形煞为先，理气为用。';
  }else if(fanN===0){
    jx='安'; mean='已核对'+checked.length+'项均未犯，外部峦头无硬冲射，可专以理气方位取用。';
  }else if(fanN===1){
    jx='小疵'; mean=posDesc+'一项：属小疵，依该项化解之法处理即可，不碍理气取用；形煞轻重仍以远近、大小、正对程度论。';
  }else if(fanN===2){
    jx='见重'; mean=posDesc+'两项：形煞见重，先化解为先是问，化解不及者重门改位避煞，再参理气方位取用。';
  }else{
    jx='交加'; mean=posDesc+'等'+fanN+'项：形煞交加，纵理气诸法无差亦难取用：形为体、气为用，体先受损气何所附；宜移门换位避煞为先，避不及者慎居。';
  }
  const jCls=jx==='安'?'fs-badge-g':(jx==='交加'||jx==='见重'?'fs-badge-r':'s-gold');
  document.getElementById('xsOut').innerHTML=
    '<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>核对</th><th>判定</th><th>断要</th></tr></thead><tbody>'+
    `<tr><td class="lbl-1">${checked.length?'已核'+checked.length+'项':'未核'}　近犯${near.length}　远犯${far.length}</td><td class="${jCls}">${jx}</td><td>${mean}</td></tr>`+
    '</tbody></table></div>'+srLine(FS.scoreXingsha(near.length, far.length, checked.length),'xingsha');
}
/* 玄空六法（谈氏参断）：零正（谈氏原法）对照合十简法、太岁应期 */
function drawLiuFa(){
  const out=document.getElementById('lfOut'); if(!out) return;
  const b=getBase();
  const yq=FS.yunQi(b.flowYear, b.yunOv);
  const dec=fsYunDecade(yq, b.flowYear);
  const lf=FS.liuFa(yq.yun, dec);
  if(!lf){ out.innerHTML=''; return; }
  const lz=FS.lingZheng(yq.yun, dec);
  const ts=FS.taiSuiFang(b.flowYear);
  const row=(k,v)=>`<tr><td class="lbl-1">${k}</td><td>${v}</td></tr>`;
  out.innerHTML=`
    <div class="sub-note">${b.flowYear}年${yq.yuan}${yq.yun}运（${yq.name}）谈氏六法参断：</div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><tbody>
      ${row('零正（谈氏原法）', lf.zhengMean)}
      ${row('对照（合十简法）', '本页零正神模块（见上）：当运'+lz.zhengGua+lz.zhengDir+'为正、合十'+lz.lingGua+lz.lingDir+'为零。')}
      ${row('太岁应期', ts.year+'年'+ts.zhi+'太岁到'+ts.gua+'宫（'+ts.dir+'）。谈氏以太岁到方与流年紫白到宫合断应期：'+ts.dir+'方是年宜静，此方有动象（修造、开门、动土）者吉凶立应。')}
      ${row('未列三法', '雌雄须实地山水相对、金龙须审来水口形势、挨星谈沈异本无定，皆盘面不可算。')}
    </tbody></table></div>`;
}
function fillLiuShi(){
  /* 灶座、灶向真值在三要（yzStove、yzStoveDir，灶座灶向成对、三要为纲），六事两枚只作镜像：
     选项与值一律取自三要那一组，故同一口灶两处恒同值，不再出现两份真值各断各的 */
  const yzS=document.getElementById('yzStove'), yzD=document.getElementById('yzStoveDir');
  LS_FIELDS.forEach(p=>{
    const el=document.getElementById(p[0]);
    if(!el||el.options.length) return;
    if(p[1]==='stove'&&yzS){ el.innerHTML=yzS.innerHTML; el.value=yzS.value; return; }
    if(p[1]==='stoveDir'&&yzD){ el.innerHTML=yzD.innerHTML; el.value=yzD.value; return; }
    el.innerHTML='<option value="">未填</option>'+GUA_OPTS;
  });
  fsSyncStove();
}
function fsSyncStove(){
  const yzS=document.getElementById('yzStove'), yzD=document.getElementById('yzStoveDir');
  document.querySelectorAll('.fs-lb-stove').forEach(el=>{ if(el.id!=='yzStove'&&yzS) el.value=yzS.value; });
  document.querySelectorAll('.fs-lb-stovedir').forEach(el=>{ if(el.id!=='yzStoveDir'&&yzD) el.value=yzD.value; });
}
function getLiuShi(){
  const it={};
  /* 门位取全页真值（基础设定那一栏），不读层内控件，免得重排次序把旧值读进来 */
  it.door=getBase().doorGua;
  LS_FIELDS.forEach(p=>{ if(p[1]==='door') return; const el=document.getElementById(p[0]); const v=el&&el.value; if(v) it[p[1]]=v; });
  return it;
}
function drawLiuShi(){
  const out=document.getElementById('lsOut'); if(!out) return;
  const b=getBase();
  const mg=mingGua(b.mingYear, b.male);
  const r=FS.liuShi(mg?mg.gua:null, getLiuShi());
  if(!r){ out.innerHTML='<div class="sub-note">逐项填六事所在方位后断（至少一项）；命卦见上方八宅模块。</div>'; return; }
  const rows=r.rows.map(x=>`<tr><td class="lbl-1">${x.name}</td><td>${x.gua}${fsDir(x.gua)}</td><td>${x.star}</td><td class="${x.jx==='吉'?'fs-badge-g':'fs-badge-r'}">${x.jx}</td><td>${x.mean}</td></tr>`).join('');
  out.innerHTML=`
    <div class="sub-note">${b.mingYear}年${b.male?'男':'女'}命　命卦${mg.gua}（${mg.group}）起游年，六事逐断：</div>
    <div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>事</th><th>方位</th><th>游年星</th><th>吉凶</th><th>断要</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${srLine(r,'liushi')}`;
}
function addLtRow(){
  const box=document.getElementById('ltRows');
  if(!box) return;
  const dirOpts='<option value="">未知</option>'+FS.SHAN_LIST.map(s=>`<option value="${s}">${s}</option>`).join('');
  const typeOpts='<option value="">选形物</option>'+LT_TYPES.map(t=>`<option value="${t}">${t}</option>`).join('');
  const div=document.createElement('div');
  div.className='lt-row';
  div.innerHTML=`<select class="lt-type" aria-label="形物" onchange="drawLuantou()">${typeOpts}</select>
    <span class="lt-f">方位<select class="lt-dir" aria-label="方位" onchange="drawLuantou()">${dirOpts}</select></span>
    <span class="lt-f">距离<input type="number" class="lt-dist" aria-label="距离（米）" min="0" step="1" placeholder="米" onchange="drawLuantou()"></span>
    <span class="lt-f">朝向<select class="lt-ang" aria-label="朝向" onchange="drawLuantou()"><option value="0">正对</option><option value="30">斜对</option><option value="60">侧对（不论）</option></select></span>
    <span class="lt-f">高低<select class="lt-h" aria-label="高低" onchange="drawLuantou()"><option value="">未填</option><option value="高">高于宅</option><option value="同">约同</option><option value="低">低于宅</option></select></span>
    <button class="btn" type="button" onclick="this.parentNode.remove();drawLuantou()">删</button>`;
  box.appendChild(div);
}
function collectLt(){
  const rows=[];
  document.querySelectorAll('#ltRows .lt-row').forEach(r=>{
    const type=r.querySelector('.lt-type').value;
    if(!type) return;
    const distV=r.querySelector('.lt-dist').value;
    rows.push({type, dir:r.querySelector('.lt-dir').value,
      dist:distV===''?null:parseFloat(distV),
      angle:parseFloat(r.querySelector('.lt-ang').value)||0,
      height:r.querySelector('.lt-h').value||null});
  });
  return rows;
}
/* 峦头三因子精断：不用表格方框，走线条模式。
   每项一段，段间以细线分隔；强度另出一根细线，按界体满分 25（JIE_TI 上限）取比例，
   故各项线条可直接比长短；线色取吉凶二值，平与不论回落主体色。
   三因子不折进断语，单列一行照距离×角度×高低原序摆出，并附引擎给出的因子乘积 */
function drawLuantou(){
  const out=document.getElementById('ltOut'); if(!out) return;
  const r=FS.luantou(collectLt());
  if(!r){ out.innerHTML='<div class="sub-note">添加宅外形物后断（选类型即计，距离角度高低未填者从严按足力计）。</div>'; return; }
  const bad=x=>x.jx.indexOf('凶')>=0, good=x=>x.jx.indexOf('吉')>=0;
  const items=r.rows.map(x=>{
    const w=Math.max(0,Math.min(100,Math.abs(x.strength)/25*100));
    return `<div class="fs-lt-i">
      <div class="fs-lt-h"><span class="fs-lt-n">${x.type}${x.dir?'（'+x.dir+'）':''}</span>
        <span class="fs-lt-j ${bad(x)?'fs-badge-r':(good(x)?'fs-badge-g':'')}">${x.jx}</span>
        <span class="fs-lt-bar ${bad(x)?'fs-lt-bad':(good(x)?'fs-lt-good':'fs-lt-flat')}"><i style="width:${WHEEL.n(w)}%"></i></span>
        <span class="fs-lt-s">强度 ${x.strength}</span></div>
      <div class="fs-lt-f">距离 <span class="fs-lt-v">${x.dist==null?'未填，从严':x.dist+'m'}</span>（${x.band}）
        　角度 <span class="fs-lt-v">${x.ang==null?'未填，从严':x.ang+'°'}</span>（${x.angTxt}）
        　高低 <span class="fs-lt-v">${x.height||'不判'}</span>　<span class="fs-lt-x">因子 ${x.factor}</span></div>
      <div class="fs-lt-m">${x.mean}<span class="fs-lt-hua">化解：${x.hua}</span></div>
    </div>`;
  }).join('');
  out.innerHTML=`<div class="fs-lt">${items}</div>${srLine(r,'luantou')}`;
}
/* 宅形自检（《阳宅十书》图诀选目） */
function fillZhaiXing(){
  const el=document.getElementById('zxSel');
  if(el&&!el.options.length) el.innerHTML='<option value="">未选</option>'+Object.keys(FS.ZHAI_XING_RULES).map(k=>`<option value="${k}">${FS.ZHAI_XING_RULES[k].nm}</option>`).join('');
}
function drawZhaiXing(){
  const out=document.getElementById('zxOut'); if(!out) return;
  const id=document.getElementById('zxSel').value;
  if(!id){ out.innerHTML='<div class="sub-note">选择宅形后断。</div>'; return; }
  const r=FS.zhaiXing(id);
  const cls=r.jx==='吉'?'fs-badge-g':(r.jx==='凶'?'fs-badge-r':'s-gold');
  out.innerHTML=`<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>宅形</th><th>吉凶</th><th>图诀断要</th><th>出处</th></tr></thead><tbody>
    <tr><td class="lbl-1">${r.nm}</td><td class="${cls}">${r.jx}</td><td>${r.mean}</td><td>${r.src}${r.lvNote}</td></tr></tbody></table></div>`;
}
/* 理法综合裁决（跨派主从）：收集各模块断语，按域主从裁决（引擎 zhenJue） */
function zjPresetMap(){
  const v=document.getElementById('zjPreset').value;
  if(v==='xk') return {lixiang:'玄空', men:'玄空', zao:'玄空', fangwei:'玄空'};
  if(v==='bz') return {lixiang:'八宅', men:'八宅', zao:'八宅', fangwei:'八宅'};
  if(v==='sh') return {lixiang:'三合', men:'八宅', zao:'八宅', fangwei:'八宅'};
  return null;
}
function collectVerdicts(){
  const b=getBase(), vs=[];
  const xk=FS.xuanKong(b.sitShan, b.faceShan, b.flowYear, b.deg, b.faceDeg, b.yunOv);
  const mg=mingGua(b.mingYear, b.male);
  /* 立向域：玄空格局、三合大利向、形法峦头 */
  if(xk){
    const gj=xk.geju;
    const bad=gj.indexOf('上山下水')>=0||gj.indexOf('不济')>=0;
    const good=gj.indexOf('旺山旺向')===0||gj.indexOf('双星')===0;
    vs.push({yu:'lixiang', fa:'玄空', jx:bad?'凶':(good?'吉':'平'),
      mean:gj+'（'+xk.yun.yuan+xk.yun.yun+'运，'+b.sitShan+'山'+b.faceShan+'向'+(xk.tiGua?'，替卦':'')+'）'});
    const dv=FS.daJuXiang(b.faceShan);
    if(dv) vs.push({yu:'lixiang', fa:'三合', jx:dv.type?'吉':'平',
      mean:'向首属'+dv.ju+(dv.type?'，为'+dv.type+'（本局大利向）':'，非生旺墓三向，须实地水口详审')});
  }
  const lt=FS.luantou(collectLt());
  if(lt) vs.push({yu:'lixiang', fa:'形法', jx:lt.got>=76?'吉':(lt.got<60?'凶':'平'), mean:'外部峦头强度评'+lt.got+'（'+lt.grade+'）'});
  /* 门域、灶域：八宅参法与三要同一起星基准卦（宅卦或以门起伏位时的门卦），
     不与八宅方位模块的命卦混用，免同一门灶两处断语相反 */
  const e=fsSanYao(), qiGua=e.qiGua;
  const doorGua=b.doorGua||'';
  if(doorGua&&qiGua){
    const star=e.doorStar;
    const isJi=['生气','天医','延年','伏位'].indexOf(star)>=0;
    vs.push({yu:'men', fa:'八宅', jx:isJi?'吉':'凶', mean:'门开'+doorGua+'（'+fsDir(doorGua)+'）落'+star+'（'+qiGua+'起星）'});
    if(xk){
      const pn=FS_GUA_NUM[doorGua];
      const fw=FS.starWangShuai(xk.faceBoard.find(x=>x.palace===pn).star, xk.yun.yun);
      vs.push({yu:'men', fa:'玄空', jx:(fw==='旺'||fw==='生')?'吉':(fw==='退'?'平':'凶'),
        mean:'门宫向星'+fw+'（'+((fw==='旺'||fw==='生')?'纳得旺气':(fw==='退'?'退气平平':'纳的是死煞之气'))+'）'});
    }
  }
  /* 灶域：八宅灶座压凶、玄空灶宫星气 */
  const stoveGua=e.stove||'';
  if(stoveGua&&qiGua){
    const star=e.stoveStar;
    const isJi=['生气','天医','延年','伏位'].indexOf(star)>=0;
    vs.push({yu:'zao', fa:'八宅', jx:isJi?'凶':'吉', mean:'灶座'+stoveGua+'落'+star+(isJi?'（压吉伤吉，宜移）':'（坐凶化吉）')+'（'+qiGua+'起星）'});
    if(xk){
      const pn=FS_GUA_NUM[stoveGua];
      const sc=xk.sitBoard.find(x=>x.palace===pn).star, fc=xk.faceBoard.find(x=>x.palace===pn).star;
      const ws=FS.starWangShuai(sc, xk.yun.yun), wf=FS.starWangShuai(fc, xk.yun.yun);
      const sha=[2,3,5,7].indexOf(sc)>=0||[2,3,5,7].indexOf(fc)>=0;
      const live=ws==='旺'||ws==='生'||wf==='旺'||wf==='生';
      vs.push({yu:'zao', fa:'玄空', jx:(sha&&!live)?'吉':(live?'凶':'平'),
        mean:'灶宫山'+sc+'向'+fc+(sha&&!live?'（失令凶星，灶火压之为吉）':(live?'（旺气之方，灶压之伤吉）':'（平气之方）'))});
    }
  }
  /* 方位催动域：玄空旺方、八宅生气方、金锁合局 */
  if(xk){
    const caiPal=xk.faceBoard.filter(x=>x.star===xk.yun.yun).map(x=>x.palace);
    vs.push({yu:'fangwei', fa:'玄空', jx:caiPal.length?'吉':'平',
      mean:'当运向星旺方（催财）在'+(caiPal.map(p=>p===5?'中宫':FS.NINE_BAGUA[p]+FS.NINE_DIR[p]).join('、')||'中宫（不入方）')});
  }
  if(mg){
    const sg=FS.baZhai(mg.gua).ji.find(x=>x.name==='生气');
    if(sg) vs.push({yu:'fangwei', fa:'八宅', jx:'吉', mean:'命卦生气方在'+sg.gua+'（'+sg.dir+'）'});
  }
  const jsy=FS.scoreJsy(collectJsy().shans, collectJsy().xing);
  if(jsy) vs.push({yu:'fangwei', fa:'金锁', jx:jsy.got>=76?'吉':(jsy.got<60?'凶':'平'), mean:'金锁砂水合局评'+jsy.got+'（'+jsy.grade+'）'});
  return vs;
}
function drawZhenJue(){
  const out=document.getElementById('zjOut'); if(!out) return;
  FS_ZJ_DATA=fsZjData();
  FS_ZJ_SEL=FS.SHAN_LIST.indexOf(FS_ZJ_DATA.b.sitShan);
  if(FS_ZJ_SEL<0) FS_ZJ_SEL=0;
  const head=`<div class="wheel-block fs-mt-3"><h4>阳宅综合罗盘（${FS_ZJ_DATA.gz}年）</h4>
    <div id="fsZjWheelHost">${fsZjWheelSvg()}</div>
    <div class="wheel-detail" id="fsZjDetail"></div></div>`;
  const r=FS.zhenJue(collectVerdicts(), zjPresetMap());
  if(!r){ out.innerHTML=head+'<div class="sub-note">暂无可用断语（相应模块未排盘或未填输入）。</div>'; fsZjDetail(); return; }
  const cls=j=>j==='吉'?'fs-badge-g':(j==='凶'?'fs-badge-r':'');
  const rows=r.domains.map(d=>{const vm=FS_VERDICT_META[d.main]||null;return `<tr><td class="lbl-1">${d.name}</td><td>${d.main||'未评'}</td><td class="${cls(d.jx)}">${d.jx}</td>
    <td>${d.mean||'本域无可用断语（相应模块未填输入），不强评。'}${vm?'<i class="fs-src">依据：'+vm.src+'　置信：'+vm.conf+'</i>':''}${d.entries.length?'<i class="fs-ib-mt">参断　'+d.entries.map(e=>e.fa+'：'+e.jx+'，'+e.mean).join('；')+'</i>':''}</td></tr>`;}).join('');
  out.innerHTML=head+`<div class="fs-tbl-scroll"><table class="fs-mean-tbl"><thead><tr><th>问题域</th><th>主法</th><th>裁决</th><th>断要与参断</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${r.conflictN?'<div class="sub-note fs-t-gold">本局有 '+r.conflictN+' 域存在跨派分歧，已在表中标明异断与附条件，宜实地核实后再行取舍。</div>':''}`;
  fsZjDetail();
}
/* 每宫三山：以宫中心周天角为零、按相对角先后排，坎宫壬子癸跨零度，只如此排方得不乱序 */
function fsGuaShans(gua){
  const c=FS_DIR_DEG[FS.GUA_DIR[gua]]||0;
  return FS.SHAN_LIST.filter(s=>FS.SHAN_BAGUA[s]===gua)
    .map(s=>({s, r:(((FS.SHAN_LIST.indexOf(s)*15-c+180)%360+360)%360-180)}))
    .sort((a,b)=>a.r-b.r).map(o=>o.s).join('');
}
function fsZjData(){
  const b=getBase(), y=b.flowYear;
  const yb=FS.yearZiBai(y);
  const mg=mingGua(b.mingYear,b.male);
  const bz=(mg&&mg.gua)?FS.baZhai(mg.gua):null;
  const bzInfo={};
  if(bz){
    bz.ji.forEach(x=>bzInfo[x.gua]={name:x.name,good:true});
    bz.xiong.forEach(x=>bzInfo[x.gua]={name:x.name,good:false});
    bzInfo[mg.gua]={name:'伏位',good:true};
  }
  const ns=FS.nianSha(y);
  const pal=FS_ZB_ORDER.map(n=>{
    const gua=FS.NINE_BAGUA[n], at=z=>FS.SHAN_BAGUA[z]===gua;
    const c=yb.board.find(x=>x.palace===n);
    const sha=[];
    if(ns.wuHuang.palace===n) sha.push('年五黄');
    if(at(ns.taiSui.zhi)) sha.push('太岁');
    if(at(ns.suiPo.zhi)) sha.push('岁破');
    ns.sanSha.forEach(s=>{ if(at(s.zhi)) sha.push(s.name); });
    return {n, gua, dir:fsDir(gua), shans:fsGuaShans(gua), star:c.star,
      jx:FS.STAR_JX[c.star], you:bzInfo[gua]||null, sha};
  });
  return {b, y, gz:FS.yearGZ(y), yun:FS.yunQi(y), mg, ic:yb.inCenter, pal};
}
/* 选中山所属之宫：年紫白与八宅游星按宫出，一宫辖三山，三山共用该宫之星 */
function fsZjPalOf(shan){
  return FS_ZJ_DATA.pal[FS_ZB_ORDER.indexOf(FS_GUA_NUM[FS.SHAN_BAGUA[shan]])];
}
function fsPickZj(i){ fsPickCommon(i, FS_PICK_CONF.zj); }
/* 指针与端点随选中山转，只走盘心圆与内界圈之间，不穿过盘心文字 */
function fsZjNeedle(i){ fsNeedleCommon('fsZjNeedle','fsZjDot',fwShanDeg(i),true,'fsZjWheel',{p0:FC_P0,p1:FC_P1}); }
function fsZjCoreTxt(i){
  const d=FS_ZJ_DATA, shan=FS.SHAN_LIST[i], p=fsZjPalOf(shan);
  return ['坐'+d.b.sitShan+'向'+d.b.faceShan,
    shan+'山',
    p.gua+'宫　三山'+p.shans,
    '年紫白'+STAR_NAMES[p.star],
    fwJxFill(p.jx)||'var(--wheel-ink2)'];
}
function fsZjCore(i){ fsCoreCommon(['fsZjC0','fsZjC1','fsZjC2','fsZjC3'],function(){ return fsZjCoreTxt(i); }); }
function fsZjWheelSvg(){
  const d=FS_ZJ_DATA; if(!d) return '';
  let s='';
  /* 天心十道：四正的读盘十字，压在最下层，自盘心圆外沿通到弧带 */
  for(let k=0;k<4;k++){
    const o=WHEEL.px(FC_CORE,k*90), t=WHEEL.px(FC_ARC,k*90);
    s+=`<line x1="${WHEEL.n(o[0])}" y1="${WHEEL.n(o[1])}" x2="${WHEEL.n(t[0])}" y2="${WHEEL.n(t[1])}" class="fs-zj-cross"/>`;
  }
  /* 坐向轴：本宅坐度至朝度的直径线，压在各圈环名之下，只在天池外露两段 */
  const sd=(((fsShanDegNum(FS.SHAN_LIST.indexOf(d.b.sitShan))+180)%360)+360)%360;
  const e0=WHEEL.px(FC_ARC,sd), e1=WHEEL.px(FC_ARC,sd+180);
  s+=`<line x1="${WHEEL.n(e0[0])}" y1="${WHEEL.n(e0[1])}" x2="${WHEEL.n(e1[0])}" y2="${WHEEL.n(e1[1])}" class="fs-zj-axis"/>`;
  /* 弧带：二十四山逐格淡弧 */
  for(let i=0;i<24;i++){
    const a=fwShanDeg(i);
    s+=`<path d="${WHEEL.arc(FC_ARC,a-7.5,a+7.5)}" class="w-arc"/>`;
  }
  /* 周天刻度：每五度一条，每十五度加长，长刻度与二十四山的山心同轴 */
  for(let k=0;k<72;k++){
    const a=((k*5+180)%360+360)%360, lg=k%3===0;
    const p0=WHEEL.px(lg?FC_TICK0:FC_TICK1-5,a), p1=WHEEL.px(FC_TICK1,a);
    s+=`<line x1="${WHEEL.n(p0[0])}" y1="${WHEEL.n(p0[1])}" x2="${WHEEL.n(p1[0])}" y2="${WHEEL.n(p1[1])}" class="w-tick"/>`;
  }
  /* 热区：二十四山逐格，环带通铺，落在任一签上皆可点 */
  for(let i=0;i<24;i++){
    const a=fwShanDeg(i), bd=WHEEL.band(FC_HIT0,FC_HIT1,a-7.5,a+7.5);
    s+=`<path d="${bd}" class="w-hit${i===FS_ZJ_SEL?' is-on':''}" data-i="${i}" onclick="fsPickZj(${i})"/>`
      +`<path d="${bd}" class="w-sel"/>`;
  }
  s+=`<path id="fsZjCur" d="${WHEEL.arc(FC_ARC,fwShanDeg(FS_ZJ_SEL)-7.5,fwShanDeg(FS_ZJ_SEL)+7.5)}" class="w-arc w-arc-cur"/>`;
  /* 外签：二十四山，环布 */
  for(let i=0;i<24;i++){
    const a=WHEEL.px(FC_LAB_SHAN,fwShanDeg(i));
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_ZJ_SEL?' w-lab-cur':''}" data-i="${i}"`
      +` transform="rotate(${WHEEL.ring(fwShanDeg(i))} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.SHAN_LIST[i]}</text>`;
  }
  /* 次圈：年紫白星名，放射，吉凶二值着色 */
  FS_ZB_ORDER.forEach((n,i)=>{
    const p=d.pal[i], a=WHEEL.px(FC_LAB_ZW,i*45), f=fwJxFill(p.jx);
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg" data-g="${i}"`
      +(f?` style="fill:${f}"`:'')
      +` transform="rotate(${WHEEL.radial(i*45)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${STAR_NAMES[p.star]}</text>`;
  });
  /* 内圈：八卦宫，单字取字角，四正放正 */
  FS_ZB_ORDER.forEach((n,i)=>{
    const a=WHEEL.px(FC_LAB_GUA,i*45), gua=FS.NINE_BAGUA[n];
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg" data-g="${i}"`
      +` transform="rotate(${WHEEL.dir(i*45)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${gua}</text>`;
  });
  /* 三条圈线 */
  s+=`<circle cx="${FW_C}" cy="${FW_C}" r="${FC_OUT}" class="w-ring"/>`
    +`<circle cx="${FW_C}" cy="${FW_C}" r="${FC_IN}" class="w-ring"/>`
    +`<circle cx="${FW_C}" cy="${FW_C}" r="${FC_CORE}" class="w-core"/>`;
  /* 指针与端点 */
  const q0=WHEEL.px(FC_P0,fwShanDeg(FS_ZJ_SEL)), q1=WHEEL.px(FC_P1,fwShanDeg(FS_ZJ_SEL));
  s+=`<line id="fsZjNeedle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
    +`<circle id="fsZjDot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
  /* 盘心天池四行：坐向轴读数、选中山、宫与三山、年紫白 */
  const ct=fsZjCoreTxt(FS_ZJ_SEL);
  s+=`<text id="fsZjC0" x="${FW_C}" y="${FW_C-50}" class="w-c2">${ct[0]}</text>`
    +`<text id="fsZjC1" x="${FW_C}" y="${FW_C-18}" class="w-c1">${ct[1]}</text>`
    +`<text id="fsZjC2" x="${FW_C}" y="${FW_C+12}" class="w-c2">${ct[2]}</text>`
    +`<text id="fsZjC3" x="${FW_C}" y="${FW_C+34}" class="w-c3" style="fill:${ct[4]}">${ct[3]}</text>`;
  return `<svg class="wheel" id="fsZjWheel" viewBox="0 0 440 440" role="img" aria-label="阳宅综合罗盘：外圈二十四山，其内为周天刻度、年紫白飞星与八卦宫，盘心为天池；点选一山看该山诸法合参">${s}</svg>`;
}
function fsZjDetail(){
  const d=FS_ZJ_DATA; if(!d) return;
  const i=FS_ZJ_SEL, shan=FS.SHAN_LIST[i], p=fsZjPalOf(shan);
  const x=p.jx.indexOf('凶')>=0;
  /* 年紫白入中之星同样要给吉凶：与紫白飞星盘详情条同口径，入中是这一盘的主星，不给则读不出主星好坏 */
  const icJx=FS.STAR_JX[d.ic], icX=icJx.indexOf('凶')>=0;
  fwDetail('fsZjDetail',
    `${shan}山 周天${fsShanDegNum(i).toFixed(1)}度 ${p.gua}宫（${p.dir}方） 三山${p.shans}`
    +`<span class="wd-br"></span>`
    +`年紫白${STAR_NAMES[p.star]}（<span class="${x?'wd-x':'wd-g'}">${p.jx}</span>） 八宅${p.you?p.you.name+'（'+(p.you.good?'吉':'凶')+'）':'命卦未填'} ${p.sha.length?'<span class="wd-x">'+p.sha.join('、')+'到宫</span>':'<span class="wd-g">流年无太岁、岁破、三煞、五黄到宫</span>'}`
    +`<span class="wd-br"></span>`
    +`本宅坐${d.b.sitShan}向${d.b.faceShan} ${d.mg&&d.mg.gua?d.mg.gua+'命':'命卦未填'} ${d.gz}年（${d.yun.name}）年紫白入中${STAR_NAMES[d.ic]}（<span class="${icX?'wd-x':'wd-g'}">${icJx}</span>）`
    +`<span class="wd-br"></span>`
    +`${x?'此方年星不吉，宜静不宜动，忌开门、安床、设灶':'此方年星得吉，宜开门、纳气、安床、设灶'}`);
}
/* 基础设定日期时间：同步到第四层紫白飞星输入并重排 */
function syncZibaiDate(){
  /* 出生日期只用于命卦重排；第四层日期为流年信息，独立输入不被覆盖 */
  fsApplyBase();
}
/* 页面加载初始化：日期与时间由全站统一函数写入当下；流年日期与流年时辰与主日期同源。
   流年静态值只作构建日兜底：用户未动过流年即改写为当下年份，动过则记 data-user-set、一律不覆盖；
   写值不经 change，故不会因默认值自动出盘。 */
function fsInitDefaults(){
  const n=xjNowDate();
  const de=document.getElementById('baseDate');
  const zd=document.getElementById('zbDate');
  if(zd) zd.value=de?de.value:'';
  const zhr=document.getElementById('zbHour');
  if(zhr) zhr.value=String(Math.floor(((n.getHours()+1)%24)/2));
  const by=document.getElementById('baseYear2');
  if(!by) return;
  if(!by.hasAttribute('data-user-set')) by.value=String(n.getFullYear());
  /* 层内流年与基础设定同源，经层内改年份亦算用户设定，此后不再被当下年份覆盖 */
  document.querySelectorAll('.fs-lb-year').forEach(function(el){
    if(el.__fsYearSetBound) return;
    el.__fsYearSetBound=true;
    el.addEventListener('input',function(){ by.setAttribute('data-user-set','1'); });
  });
  drawMembers();
  drawSiShi();
}
/* 用户主动查询：按当前输入全排。 */
function fsCalc(){
  drawZiBai(); renderStarMean(); fsApplyBase(); drawXingSha();
}
function fsNow(){
  fsInitDefaults();
  fsCalc();
}
/* 折叠与展开并持久化状态：用 localStorage 跨会话保持（sessionStorage 关标签即清空，刷新易丢；与阴宅页同例） */
function fsSaveModState(){
  try{
    const st={};
    document.querySelectorAll('section.fs-mod').forEach(m=>{ st[m.id]=m.classList.contains('collapsed')?'1':'0'; });
    localStorage.setItem('fs_mod_state', JSON.stringify(st));
  }catch(e){}
}
function fsToggleMod(el){
  if(!el) return;
  el.classList.toggle('collapsed');
  fsSaveModState();
}
function fsRoomVal(g){ const el=document.getElementById('fsRoom-'+g); return (el&&el.value)?el.value.trim():''; }
function fsRoomTxt(g){ const r=fsRoomVal(g); return r?(r+'（'+g+'宫）'):(g+'宫'); }
function fillRoomRow(){
  const host=document.getElementById('fsRoomRow'); if(!host||host.__fsRoomDone) return;
  host.innerHTML=FS_ROOM_PAL.map(p=>`<span class="fs-room-i"><label for="fsRoom-${p[0]}">${p[0]}${p[1]}</label><input type="text" id="fsRoom-${p[0]}" maxlength="6" placeholder="房间名" onchange="fsDrawFinal()"></span>`).join('');
  host.__fsRoomDone=true;
}
function jumpMod(id){
  const el=document.getElementById(id); if(!el) return;
  const sec=el.closest('section.fs-mod');
  if(sec) sec.classList.remove('collapsed');
  if(el.classList.contains('collapsed')) el.classList.remove('collapsed');
  el.scrollIntoView({behavior:'smooth',block:'start'});
}
/* 三要入口重算式：三要为灶之真值，改三要即刷六事镜像与本诊断卡 */
function fsReSanYao(){ fsSyncStove(); drawSanYao(); drawLiuShi(); drawZhenJue(); fsDrawFinal(); }
function fsSetLocalStove(el){ const t=document.getElementById('yzStove'); if(t) t.value=el.value; fsReSanYao(); }
function fsSetLocalStoveDir(el){ const t=document.getElementById('yzStoveDir'); if(t) t.value=el.value; fsReSanYao(); }
/* 金锁八宫粗选：一键带三山，逐山精填仍可覆改 */
function jsyQuick(sel){
  (sel.getAttribute('data-sids')||'').split(',').forEach(id=>{ const el=document.getElementById(id); if(el) el.value=sel.value||''; });
  drawJsy();
}
/* 形煞快捷核档：逐项记"未犯" */
function fsXingShaAllOk(){
  for(let i=1;i<=10;i++){ const el=document.getElementById('xs-'+i); if(el) el.value='无'; }
  drawXingSha();
}
/* 三要评估（含未填保护；仅诊断与调整卡复用，三要模块显示仍走 drawSanYao 原函数，不改其口径） */
function fsSanYao(){
  const b=getBase(), mg=mingGua(b.mingYear,b.male);
  const zhaiGua=FS.SHAN_BAGUA[b.sitShan]||'坎', door=b.doorGua;
  const main=(document.getElementById('yzMain')||{}).value||'';
  const stove=(document.getElementById('yzStove')||{}).value||'';
  const stoveDir=(document.getElementById('yzStoveDir')||{}).value||'';
  const method=((document.getElementById('yzMethod')||{}).value==='door')?'door':'sit';
  const qiGua=method==='door'?door:zhaiGua;
  const isJi=s=>['生气','延年','天医','伏位'].indexOf(s)>=0;
  const st=g=>(g&&FS_GUA_WX[g])?FS.youXing(qiGua,g):'';
  return {b,mg,zhaiGua,door,main,stove,stoveDir,method,qiGua,isJi,
    doorStar:method==='door'?'伏位':(door?FS.youXing(zhaiGua,door):''),
    mainStar:st(main), stoveStar:st(stove), dirStar:st(stoveDir)};
}
/* 层内均分：缺评者剔除后归一；任一项否决则整层否决 */
function fsMean(arr){
  const v=arr.filter(x=>x&&typeof x.got==='number');
  if(!v.length) return null;
  if(v.some(x=>x.veto)) return {got:0, veto:true};
  return {got:Math.round(v.reduce((s,x)=>s+x.got,0)/v.length)};
}
const FS_ITEM_META={
  '第一层 实勘':{src:'形法：形煞峦头（站内归纳）',conf:'低'},
  '第二层 立向':{src:'玄空：立向分金',conf:'高'},
  '第三层 定人':{src:'八宅：三要六事',conf:'中'},
  '第四层 避煞':{src:'玄空：流年紫白',conf:'高'}
};
const FS_VERDICT_META={玄空:{src:'玄空：飞星',conf:'高'},八宅:{src:'八宅：游年',conf:'中'},三合:{src:'三合：水法',conf:'中'},形法:{src:'形法：峦头（站内归纳）',conf:'低'},金锁:{src:'金锁玉关（站内归纳）',conf:'中'}};
function fsItemMeta(step,name){
  const n=String(name||'');
  if(step==='第二层 立向'){
    if(n.indexOf('坐度')===0) return {src:'玄空：立极分金',conf:'高'};
    if(n.indexOf('玄空格局')===0) return {src:'玄空：山向飞星',conf:'高'};
    if(n.indexOf('宿度分金')===0) return {src:'三合：百二十分金',conf:'高'};
    if(n.indexOf('三合配局')===0) return {src:'三合：水法',conf:'中'};
  }
  if(step==='第三层 定人'){
    if(/^(门|主|灶座|灶向)/.test(n)) return {src:'八宅：三要',conf:'中'};
    if(/^(床|路|井|卫生间|碓磨)/.test(n)) return {src:'八宅：六事',conf:'中'};
    if(n.indexOf('穿宫')===0) return {src:'八宅：穿宫九星',conf:'中'};
    if(n.indexOf('宅命相配')===0) return {src:'八宅：命卦',conf:'中'};
    if(n.indexOf('主灶五行')===0) return {src:'五行：主灶生克',conf:'低'};
  }
  if(step==='第四层 避煞') return {src:'玄空：流年紫白与太岁三煞',conf:'高'};
  if(step==='第一层 实勘'){
    if(n.indexOf('形煞')>=0||n.indexOf('峦头')>=0) return {src:'形法：形煞峦头（站内归纳）',conf:'低'};
    if(n.indexOf('金锁')===0) return {src:'金锁玉关（站内归纳）',conf:'中'};
    if(n.indexOf('宅形')===0) return {src:'阳宅十书：宅形图诀',conf:'中'};
  }
  return FS_ITEM_META[step]||null;
}
function fsFinalData(){
  const b=getBase(), e=fsSanYao(), mg=e.mg;
  const xk=FS.xuanKong(b.sitShan,b.faceShan,b.flowYear,b.deg,b.faceDeg, b.yunOv);
  const parts={}, items=[];
  const P=(step,name,st,txt,act,jump,pal)=>{const m=fsItemMeta(step,name); items.push({step,name,st,txt:txt||'',act:act||'',jump:jump||'',pal:pal||'',basis:m?m.src:'',conf:m?m.conf:''});};
  /* 第二层 立向：坐度、格局、分金、三合参断 */
  parts.lixiang=FS.scoreLixiang(b.sitShan,b.deg);
  const xmEl=document.getElementById('fjXm'), xmY=(xmEl&&xmEl.value)?parseInt(xmEl.value,10):null;
  parts.fenjin=FS.scoreFenjin(b.sitShan,b.deg,xmY||null);
  parts.geju=xk?FS.scoreGeju(xk):null;
  if(parts.lixiang&&parts.lixiang.veto) P('第二层 立向','坐度','veto',parts.lixiang.note,'实测坐度压交界线，须移线复测重立向（典籍断不可用）','fsmod-l2');
  else if(xk&&(xk.sitKong||xk.faceKong)) P('第二层 立向','坐向空亡','veto','坐向压卦界犯骑缝空亡，典籍断不可立向。','移线避开交界，重定坐向','fsmod-l2');
  else if(xk&&(xk.sitJian||xk.faceJian)) P('第二层 立向','兼向替卦','warn','坐度逾正向四度半入兼向，须起替卦并精确复测。','复测罗盘坐度，核对替卦盘与卦界阴阳差错','fsmod-l2');
  else if(typeof b.deg!=='number') P('第二层 立向','坐度','na','未填实测坐度，正向、兼向与骑缝空亡俱未判，坐度一项不出结论。','量取罗盘正针坐度填入，重断正向兼向','fsmod-l2');
  else P('第二层 立向','坐度','ok',(parts.lixiang?parts.lixiang.note:''),'','fsmod-l2');
  if(parts.geju){
    if(parts.geju.veto) P('第二层 立向','玄空格局','veto',parts.geju.note,'改向择旺山旺向，或移线出空亡','fsmod-l2');
    else if(parts.geju.got<60) P('第二层 立向','玄空格局','bad','格局 '+parts.geju.got+' 分：'+parts.geju.note,'以城门、七星打劫救局，或改向取旺山旺向；辅以旺方开门设主','fsmod-l2');
    else if(parts.geju.got<76) P('第二层 立向','玄空格局','warn','格局 '+parts.geju.got+' 分：'+parts.geju.note,'可用而力缓，宜以旺方开门设主，以催法引动','fsmod-l2');
    else P('第二层 立向','玄空格局','ok','格局 '+parts.geju.got+' 分：'+parts.geju.note,'','fsmod-l2');
  }
  if(parts.fenjin){
    if(parts.fenjin.veto) P('第二层 立向','宿度分金','veto',parts.fenjin.note,'压龟甲火坑线，移线取珠宝线','fsmod-l2');
    else if(parts.fenjin.got<60) P('第二层 立向','宿度分金','warn',parts.fenjin.note,'孤虚空亡差错线不可取用，移线取旺相珠宝线','fsmod-l2');
    else P('第二层 立向','宿度分金','ok',parts.fenjin.note,'','fsmod-l2');
  }
  try{
    const dj=FS.daJuXiang(b.faceShan);
    if(dj){
      const good=(dj.type==='生向'||dj.type==='旺向');
      P('第二层 立向','三合配局',good?'ok':'warn','向首'+b.faceShan+'得'+dj.ju+dj.type+'（三合参断，非主断）。',good?'':'三合不与玄空相权，作参断佐证；不合者以玄空立向为准','fsmod-l2');
    }
  }catch(err){}
  /* 第三层 定人：三要（门主灶）、六事、穿宫、宅命相配。
     三要主、灶座、灶向未填则三要分不评（引擎返回 null，缺项剔除后归一），对应病点亦不出 */
  parts.sanyao=FS.scoreSanyao(e.qiGua, e.door, e.main, e.stove);
  const dOk=e.isJi(e.doorStar);
  const mOk=e.main?e.isJi(e.mainStar):null, sOk=e.stove?!e.isJi(e.stoveStar):null, dirOk=e.stoveDir?e.isJi(e.dirStar):null;
  if(!dOk) P('第三层 定人','门 '+fsRoomTxt(e.door),'bad','门为宅之口而落'+e.doorStar+'凶星，纳气不正，三要之首已失。','改门至吉方（生气延年天医）；不可改则玄关屏风、门楣凸镜，门常闭','fsmod-l3',e.door);
  else P('第三层 定人','门 '+fsRoomTxt(e.door),'ok','门开'+e.doorStar+'吉方，纳气为吉。','','fsmod-l3',e.door);
  if(mOk===false) P('第三层 定人','主 '+fsRoomTxt(e.main),'bad','主为宅之腹，主房落'+e.mainStar+'凶星，宅主受损、家口难宁。','主卧或宅主位移吉方；不可移则改作他用（储物），另择吉房为主','fsmod-l3',e.main);
  else if(mOk===true) P('第三层 定人','主 '+fsRoomTxt(e.main),'ok','主房安'+e.mainStar+'吉方，利宅主。','','fsmod-l3',e.main);
  if(sOk===false) P('第三层 定人','灶座 '+fsRoomTxt(e.stove),'bad','灶压'+e.stoveStar+'吉方，反伤吉气（《阳宅三要》所忌）。','灶座移压凶方（绝命五鬼尤宜），灶口调向吉方','fsmod-l3',e.stove);
  else if(sOk===true) P('第三层 定人','灶座 '+fsRoomTxt(e.stove),'ok','灶压'+e.stoveStar+'凶方，以火化煞为吉（坐凶向吉）。','','fsmod-l3',e.stove);
  if(dirOk===false) P('第三层 定人','灶向 '+fsRoomTxt(e.stoveDir),'warn','灶口朝'+e.dirStar+'凶方，纳气不正。','调转灶口使朝吉方','fsmod-l3',e.stoveDir);
  const lsp=getLiuShi(), lsr=FS.liuShi(mg?mg.gua:null, lsp);
  if(lsr) lsr.rows.forEach(r=>{
    /* 门、灶座、灶向三项真值在三要，已由三要出行；六事只补床、路、井、厕、磨，免同一口灶出两条病点 */
    if(r.key==='door'||r.key==='stove'||r.key==='stoveDir') return;
    const isBad=r.jx==='凶';
    P('第三层 定人', r.name+' '+fsRoomTxt(r.gua), isBad?'bad':'ok', r.mean, isBad?(FS_LS_HUA[r.key]||''):'', 'fsmod-l3', r.gua);
  });
  const zhaiG=FS.SHAN_BAGUA[b.sitShan], faceG=FS.SHAN_BAGUA[b.faceShan];
  const cgN=parseInt((document.getElementById('cgN')||{}).value,10)||5;
  const cg=FS.chuanGong(zhaiG, e.door, faceG, cgN);
  parts.chuangong=cg?FS.scoreChuangong(cg):null;
  if(cg){
    const xn=cg.stars.map((s,i)=>({s,i})).filter(x=>['生气','天医','延年','伏位'].indexOf(x.s.star)<0);
    if(xn.length) P('第三层 定人','穿宫九星（'+cgN+'进）','warn','第'+xn.map(x=>x.i+1).join('、')+'进落'+xn.map(x=>x.s.star).join('、')+'，凶栋宜低矮封闭，忌作卧室与大门。','凶栋宜低矮封闭，吉栋宜高大','fsmod-l3');
  }
  const dong=['坎','震','巽','离'];
  if(mg && (dong.indexOf(e.zhaiGua)>=0)!==(dong.indexOf(mg.gua)>=0))
    P('第三层 定人','宅命相配','warn','宅为'+(dong.indexOf(e.zhaiGua)>=0?'东四':'西四')+'宅而命属'+mg.group+'，异组不相配。','以门主灶三要调和（门开本命吉方）、床位就命卦吉方；或另择合命之宅','fsmod-l3');
  if(e.main&&e.stove&&FS_WX_KE[FS_GUA_WX[e.main]]===FS_GUA_WX[e.stove])
    P('第三层 定人','主灶五行','warn',FS_GUA_WX[e.main]+'克'+FS_GUA_WX[e.stove]+'（主→灶），五行相克为凶（辅参）。','以灶口朝向与颜色材质通关（如木克土者以火通关）','fsmod-l3');
  /* 第四层 避煞（年评域）：流年星到门，太岁岁破三煞五黄到坐与诸方位 */
  const nian=xk?FS.scoreSuiyun(xk,b.flowYear,b.sitShan,e.door):null;
  const ns=FS.nianSha(b.flowYear), yb=FS.yearZiBai(b.flowYear).board;
  const starAt=g=>{ const p=FS_GUA_NUM[g]; const r=yb.find(x=>x.palace===p); return r?r.star:0; };
  const whGua=FS.NINE_BAGUA[ns.wuHuang.palace], taiGua=FS.SHAN_BAGUA[ns.taiSui.zhi], poGua=FS.SHAN_BAGUA[ns.suiPo.zhi];
  const ssGua=ns.sanSha.map(x=>FS.SHAN_BAGUA[x.zhi]);
  const dNian=starAt(e.door);
  if(dNian===5) P('第四层 避煞','流年五黄到门','bad','流年五黄（正关煞）到门（'+e.door+'宫），纳气口犯正关煞，主病灾破财。','此方宜静：铜器金泄（铜铃铜葫芦），忌动土修门、忌红黄两色','fsmod-l4',e.door);
  else if([2,3,7].indexOf(dNian)>=0) P('第四层 避煞','流年凶星到门','warn','流年'+STAR_NAMES[dNian]+'到门（'+e.door+'宫），'+({2:'病符',3:'是非',7:'破军盗劫'}[dNian])+'临纳气口。','按星化解（二黑铜葫芦、三碧红色泄木、七赤水通关），此方少动','fsmod-l4',e.door);
  if(xk){
    const si=FS.shanInfo(b.sitShan,b.flowYear);
    if(si){
      if(si.atSuiPo) P('第四层 避煞','岁破到坐','bad','岁破到坐山（'+b.sitShan+'），主破耗动摇。','坐方忌动土修造；以静制动，岁破方不裁不挖','fsmod-l4');
      if(si.atSanSha) P('第四层 避煞','三煞到坐','warn','三煞到坐山，忌修造动土。','三煞方可坐不可向，是年不动土、不拆改','fsmod-l4');
      if(si.atTaiSui) P('第四层 避煞','太岁到坐','warn','太岁到坐山（太岁可坐不可向），宜静。','太岁方宜静，忌向太岁开门动土','fsmod-l4');
      if(si.atWuHuang) P('第四层 避煞','年五黄到坐','warn','年五黄到坐山，宜静不宜动。','铜器金泄，此方忌动土与红黄之物','fsmod-l4');
    }
  }
  [['床',lsp.bed],['灶座',e.stove],['卫生间',lsp.wc],['路',lsp.road]].forEach(pr=>{
    const nm=pr[0], g=pr[1]; if(!g) return;
    if(g===whGua) P('第四层 避煞','五黄到'+nm,'bad',nm+'居'+fsRoomTxt(g)+'，流年五黄到方（正关煞），主病灾。','此方宜静，铜器金泄，忌动土与红黄之物','fsmod-l4',g);
    else if(ssGua.indexOf(g)>=0) P('第四层 避煞','三煞到'+nm,'warn',nm+'居'+fsRoomTxt(g)+'，流年三煞到方，主是非灾病。','是年此方忌动土修造；宜静置','fsmod-l4',g);
    else if(g===poGua) P('第四层 避煞','岁破到'+nm,'warn',nm+'居'+fsRoomTxt(g)+'，流年岁破到方。','是年此方忌动土拆改','fsmod-l4',g);
    else if(g===taiGua) P('第四层 避煞','太岁到'+nm,'warn',nm+'居'+fsRoomTxt(g)+'，流年太岁到方，宜静。','太岁方可坐不可向，此方忌动土','fsmod-l4',g);
  });
  /* 第一层 实勘：形煞、金锁、峦头、宅形 */
  const xsVals=FS_XS_NM.map((nm,i)=>({nm, v:((document.getElementById('xs-'+(i+1))||{}).value)||''}));
  const xsChecked=xsVals.filter(x=>x.v);
  const xsNear=xsVals.filter(x=>x.v==='近'||x.v==='犯'), xsFar=xsVals.filter(x=>x.v==='远');
  xsNear.forEach(x=>P('第一层 实勘',x.nm+'（近犯）','bad',x.nm+'近距离正对门窗，形为体之伤，体先受损则气无所附。',FS_XS_HUA[x.nm]||'','fsmod-l1'));
  xsFar.forEach(x=>P('第一层 实勘',x.nm+'（远犯）','warn',x.nm+'远距斜对，属小疵，轻重以远近、正对程度论。',FS_XS_HUA[x.nm]||'','fsmod-l1'));
  /* 形煞分按已核项数计：一项未核即不评，已核而全未犯方记满分 */
  parts.xingsha=FS.scoreXingsha(xsNear.length, xsFar.length, xsChecked.length);
  const jsy=collectJsy(), jsyPal={};
  JSY_GRP.forEach(g=>{
    const sel=Object.keys(jsy.shans).filter(s=>FS.SHAN_BAGUA[s]===g.gua);
    const wrong=sel.filter(s=>jsy.shans[s]!==g.fav);
    if(sel.length) jsyPal[g.gua]={sel:sel.length, wrong:wrong.length, wrongShans:wrong};
    if(sel.length&&wrong.length) P('第一层 实勘','金锁 '+g.gua+'宫（喜'+g.fav+'）','warn',wrong.join('、')+'得'+jsy.shans[wrong[0]]+'，与金锁"'+g.gua+'宫喜'+g.fav+'"不合（'+wrong.length+'/3 山失局）。','按金锁玉关调该宫砂水：喜砂宫宜高实静、喜水宫宜低虚动；不可改则以遮挡与摆件权衡','fsmod-l1',g.gua);
  });
  parts.jsy=FS.scoreJsy(jsy.shans, jsy.xing);
  const lt=FS.luantou(collectLt());
  parts.luantou=lt;
  if(lt) lt.rows.forEach(r=>{
    const isBad=r.jx.indexOf('凶')>=0, isWarn=r.jx.indexOf('次忌')>=0;
    if(isBad||isWarn) P('第一层 实勘','峦头 '+r.type+(r.dir?'（'+r.dir+'）':''), isBad?'bad':'warn', r.mean+'　强度 '+r.strength+'（距离×角度×高低）。','化解：'+r.hua,'fsmod-l1');
  });
  const zxEl=document.getElementById('zxSel'), zxId=zxEl?zxEl.value:'', zx=zxId?FS.zhaiXing(zxId):null;
  if(zx&&zx.jx==='凶') P('第一层 实勘','宅形 '+zx.nm,'bad',zx.mean,zx.mean,'fsmod-l1');
  else if(zx&&zx.jx==='平') P('第一层 实勘','宅形 '+zx.nm,'warn',zx.mean,zx.mean,'fsmod-l1');
  /* 待核清算：未填之项不影响已评模块（引擎缺项剔除后归一），但须如实列出 */
  const pend=[];
  const xsMiss=10-xsChecked.length; if(xsMiss) pend.push('形煞未核 '+xsMiss+' 项');
  const jsyMiss=24-Object.keys(jsy.shans).length; if(jsyMiss) pend.push('金锁未选 '+jsyMiss+' 山');
  if(!lt) pend.push('峦头三因子未录');
  if(typeof b.deg!=='number') pend.push('实测坐度未填');
  if(!((document.getElementById('xwLai')||{}).value)) pend.push('来水位未填');
  if(!((document.getElementById('xwQu')||{}).value)) pend.push('去水位未填');
  if(!zxId) pend.push('宅形未选');
  const lsMiss=['road','bed','well','wc','mill'].filter(k=>!lsp[k]).length; if(lsMiss) pend.push('六事未填 '+lsMiss+' 事');
  if(!((document.getElementById('nsBirth')||{}).value)) pend.push('本命真太岁未填');
  /* 待核不清算进 items：它随表尾以待核清算组呈现（见 fsItemsTable），免与层内检查项混排重复 */
  const zhaiPing=FS.srZhaiPing(parts);
  const l1=fsMean([parts.xingsha,parts.jsy,parts.luantou]);
  const l2=fsMean([parts.geju,parts.lixiang,parts.fenjin]);
  const l3=fsMean([parts.sanyao,parts.chuangong]);
  items.sort((a,b2)=>(FS_ST_ORD[a.st]||9)-(FS_ST_ORD[b2.st]||9));
  const badN=items.filter(x=>x.st==='bad'||x.st==='veto').length;
  const warnN=items.filter(x=>x.st==='warn').length;
  const naN=pend.length+items.filter(x=>x.st==='na').length;
  const okN=items.filter(x=>x.st==='ok').length;
  return {b,e,mg,xk,parts,items,pend,zhaiPing,nian,l1,l2,l3,l4:nian,badN,warnN,naN,okN,jsyPal,lsPos:lsp,xsNear,xsFar,zx};
}
/* 病点清单表：以层分组。层行给该层得分与该层最重档，层下明细行给逐项断语与化解动作；
   列宽取层与检查项 118、层分 70、档 64、断要自适应，与阴宅页总判定同制。
   键列只放短名（层名四至六字、检查项二至六字）故不溢出；长文只落末列流式折行。
   短列若不给定宽，等分会把档列摊成数百像素、反把长文列挤窄，行高骤增，故四列宽须齐给。 */
function fsItemsTable(d){
  const PROB=d.items.filter(x=>x.st!=='ok');
  const badge=st=>st==='veto'?'<span class="fs-badge-r">否决</span>':(st==='bad'?'<span class="fs-badge-r">凶</span>'
    :(st==='warn'?'<span class="s-gold">小疵</span>':(st==='na'?'<span class="s-gold">待核</span>':'<span class="fs-badge-g">合</span>')));
  let html='<div class="fs-tbl-scroll fs-mt-2"><table class="fs-mean-tbl fs-tbl-fixed"><thead><tr>'
    +'<th class="fs-w118">层与检查项</th><th class="fs-w70px">层分</th><th class="fs-w64px">档</th><th>断要与化解（点层名跳回该层改）</th></tr></thead><tbody>';
  [{k:'第一层 实勘',m:'fsmod-l1',sc:d.l1},{k:'第二层 立向',m:'fsmod-l2',sc:d.l2},
   {k:'第三层 定人',m:'fsmod-l3',sc:d.l3},{k:'第四层 避煞',m:'fsmod-l4',sc:d.l4}].forEach(layer=>{
    const list=PROB.filter(x=>x.step===layer.k);
    if(!list.length) return;
    const veto=list.some(x=>x.st==='veto');
    const worst=veto?'veto':(list.some(x=>x.st==='bad')?'bad':(list.some(x=>x.st==='warn')?'warn':'na'));
    const sc=layer.sc;
    const bar=(sc&&!sc.veto)?'<div class="scbar"><i class="'+(sc.got>=88?'b-hi':(sc.got>=60?'b-mid':'b-low'))+'" style="width:'+sc.got+'%"></i></div>':'';
    html+=`<tr class="${veto?'fs-row-veto':(sc&&sc.got>=76?'fs-row-hi':'fs-bg-paper')}">`
      +`<td class="lbl-1 fs-nowrap"><span class="fs-jump" onclick="jumpMod('${layer.m}')">${layer.k}</span></td>`
      +`<td>${sc?(sc.veto?'<b class="fs-t-red">0</b>':'<b class="fs-score">'+sc.got+'</b>'+bar):'未评'}</td>`
      +`<td>${badge(worst)}</td><td>本层 ${list.length} 项${worst==='na'?'待核':'待改'}</td></tr>`;
    list.forEach(x=>{
      html+=`<tr><td class="fs-pad-l18">${x.name}</td><td>无</td><td>${badge(x.st)}</td>`
        +`<td>${x.txt}${x.act?'<i class="fs-ib-mt">→ '+x.act+'</i>':''}${x.basis?'<i class="fs-src">依据：'+x.basis+'　置信：'+x.conf+'</i>':''}</td></tr>`;
    });
  });
  if(d.pend.length){
    html+=`<tr class="fs-bg-paper"><td class="lbl-1 fs-nowrap">待核清算</td><td>未评</td>`
      +`<td><span class="s-gold">${d.pend.length} 项</span></td>`
      +`<td>未勘之项不影响已评模块（缺项剔除后权重归一），故现有结论只对已勘之项成立。</td></tr>`;
    d.pend.forEach(t=>{
      html+=`<tr><td class="fs-pad-l18">${t.replace(/\s.*$/,'')}</td><td>未评</td><td><span class="s-gold">待核</span></td>`
        +`<td>${t}。补齐该项后分数与本清单即时刷新。</td></tr>`;
    });
  }
  html+='</tbody></table></div>';
  return html;
}
/* 宅况档案条：全页唯一真值的汇总视图，供用户一眼核对"系统以为你家长什么样" */
function fsZkBar(d){
  const host=document.getElementById('fsZkFinal'); if(!host) return;
  const b=d.b, mg=d.mg, lsp=d.lsPos, e=d.e;
  const it=(nm,g,extra)=>(g?(nm+' <b>'+fsRoomTxt(g)+'</b>'+(extra?'（'+extra+'）':'')):(nm+' 未填'));
  const parts=[
    '坐向 <b>'+b.sitShan+'山'+b.faceShan+'向</b>'+(typeof b.deg==='number'?'（实测坐度 '+b.deg+'°）':'（坐度未填）'),
    '流年 <b>'+b.flowYear+'</b>',
    '宅主命卦 <b>'+(mg?mg.gua+'（'+mg.group+'）':'未填')+'</b>',
    it('门', e.door, e.doorStar),
    it('主', e.main, e.mainStar),
    it('灶座', e.stove, e.stoveStar),
    it('灶向', e.stoveDir, e.dirStar),
    it('床', lsp.bed), it('卫生间', lsp.wc),
    it('井', lsp.well), it('碓磨', lsp.mill), it('路', lsp.road)
  ];
  host.innerHTML='<div class="sub-note"><b>宅况档案</b>（灶以三要为真值、六事同源；改任一处全页联动）：'+parts.join('　')+'。</div>';
}
/* 结论卡：宅评（体）与年评（用）两分分列，病点计数与行动行 */
function fsRenderVerdict(d){
  const host=document.getElementById('fvCard'); if(!host) return;
  const zp=d.zhaiPing, np=d.nian;
  const veto=!!(zp&&zp.veto);
  let st='st-warn', txt='宜调';
  if(veto){ st='st-bad'; txt='否决'; }
  else if(d.badN){ st='st-bad'; txt='宜改'; }
  else if(zp&&zp.got>=76&&!d.warnN){ st='st-ok'; txt='可居'; }
  else if(zp&&zp.got>=76){ st='st-warn'; txt='可居，宜微调'; }
  const okNames=d.items.filter(x=>x.st==='ok').map(x=>x.name).slice(0,8);
  host.className='fs-verdict fs-mt-3 '+st;   /* 档类落在卡上，.st-bad/.st-warn/.st-ok 方能着色（同阴宅页总判定之制） */
  let html=`<div class="fv-top"><span class="fv-label">最终结论</span><span class="fv-status">${txt}</span>`
    +`<span class="fv-why">宅评（体）<b class="fs-score${veto?' fs-t-red':''}">${zp?zp.got:'无'}</b> 分${zp?'（'+zp.grade+'）':''}${veto?'　<b class="fs-t-red">一票否决</b>':''}　年评（用）<b class="fs-score">${np?np.got:'无'}</b> 分${np?'（'+np.grade+'）':''}</span></div>`
    +`<div class="fv-note">体用分离：<b>宅评</b>由第一、二、三层诸理法加权（气 .28、三要 .20、峦头 .20、金锁 .09、穿宫 .08、分金 .08、坐度 .07），判"此宅可居与否"；<b>年评</b>由第四层流年叠断独立评定，判"当年宜忌"。<b>两分分列不混算</b>：改屋不动流年，改宅与当年用事本属两类行动。评分一律基线 60、满 100、否决归零，缺输入之模块剔除后权重归一。</div>`
    +`<div class="fv-note">病点：<b class="fs-t-red">${d.badN}</b> 项否决或凶　<b class="s-gold">${d.warnN}</b> 项小疵　<b>${d.naN}</b> 项待核${d.okN?'　合局 '+d.okN+' 项（'+(okNames.join('、')||'无')+(d.okN>okNames.length?' 等':'')+'）':''}</div>`;
  html+=fsItemsTable(d);
  html+='<div class="fv-note">依据与置信度：高＝输入完整、算法确定；中＝有流派异说或派生输入；低＝外部未实测或站内归纳。置信度只作读法提示，不进总分。</div>';
  if(d.pend.length) html+=`<div class="fv-act"><b>待核清算</b>：${d.pend.join('；')}。未勘之项一律不评，故现有分数为"以已填项为准"的分，补齐后即时刷新。</div>`;
  /* 行动行：先否决、次形煞、次三要门主灶、次年煞 */
  const acts=[];
  if(veto) acts.push('坐向或分金犯空亡（断不可用），先移线重立向，余法皆后');
  if(d.xsNear.length) acts.push('先化外局形煞近犯 '+d.xsNear.length+' 项（形为体，体先受损）');
  const e=d.e;
  if(!e.isJi(e.doorStar)) acts.push('门落凶星，改门或设玄关为第一要');
  else if(e.main&&!e.isJi(e.mainStar)) acts.push('主房落凶星，移主卧或改作他用');
  else if(e.stove&&e.isJi(e.stoveStar)) acts.push('灶压吉方反伤吉气，移灶压凶、灶口向吉');
  if(np&&np.got<60) acts.push('年评偏低，是年宜静守，按上述流年煞项避忌，忌动土修造');
  html+=`<div class="fv-act"><b>优先行动</b>：${acts.length?acts.join('；')+'。':'未见硬伤，按布局调整卡择吉方微调即可。'}</div>`;
  html+=`<div class="fv-note">本卡分数与清单随上方任一输入即时重算；改后即为"调整后"之值，可与调整前对照。</div>`;
  host.innerHTML=html;
}
/* 布局调整卡：现状（已填）vs 建议（同法推荐宫），附落实方式与调整后宅评预估 */
function fsRecGua(qiGua,mode,cur){
  const bz=FS.baZhai(qiGua); if(!bz) return null;
  const arr=(mode==='press')?bz.xiong:bz.ji;
  const order=(mode==='press')?FS_XIONG_ORDER:FS_JI_ORDER;
  const sorted=arr.slice().sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name));
  return sorted.filter(x=>x.gua!==cur)[0]||sorted[0]||null;
}
function fsAdjRows(d){
  const e=d.e, mg=d.mg, lsp=d.lsPos;
  const defs=[
    {k:'door',nm:'门',mode:'place',gua:e.door,star:e.doorStar,src:'三要',qi:e.qiGua},
    {k:'main',nm:'主卧',mode:'place',gua:e.main,star:e.mainStar,src:'三要',qi:e.qiGua},
    {k:'stove',nm:'灶座',mode:'press',gua:e.stove,star:e.stoveStar,src:'三要',qi:e.qiGua},
    {k:'stoveDir',nm:'灶向',mode:'face',gua:e.stoveDir,star:e.dirStar,src:'三要',qi:e.qiGua},
    {k:'bed',nm:'床',mode:'place',gua:lsp.bed,star:mg&&lsp.bed?FS.youXing(mg.gua,lsp.bed):'',src:'六事',qi:mg?mg.gua:null},
    {k:'wc',nm:'卫生间',mode:'press',gua:lsp.wc,star:mg&&lsp.wc?FS.youXing(mg.gua,lsp.wc):'',src:'六事',qi:mg?mg.gua:null},
    {k:'well',nm:'井',mode:'place',gua:lsp.well,star:mg&&lsp.well?FS.youXing(mg.gua,lsp.well):'',src:'六事',qi:mg?mg.gua:null},
    {k:'mill',nm:'碓磨',mode:'press',gua:lsp.mill,star:mg&&lsp.mill?FS.youXing(mg.gua,lsp.mill):'',src:'六事',qi:mg?mg.gua:null},
    {k:'road',nm:'路',mode:'place',gua:lsp.road,star:mg&&lsp.road?FS.youXing(mg.gua,lsp.road):'',src:'六事',qi:mg?mg.gua:null}
  ];
  return defs.filter(x=>x.gua&&FS_GUA_WX[x.gua]).map(x=>{
    const ok=(x.mode==='press')?!(e.isJi(x.star)):e.isJi(x.star);
    const rec=x.qi?fsRecGua(x.qi,x.mode,x.gua):null;
    return Object.assign({},x,{ok,rec});
  });
}
function fsAdjustCard(d){
  const host=document.getElementById('fsAdjOut'); if(!host) return;
  const rows=fsAdjRows(d);
  if(!rows.length){ host.innerHTML='<div class="sub-note fs-mt-2">逐项填三要（门主灶）与六事（床厕井磨路）所在宫位后，本卡按现状出调整方案。</div>'; return; }
  const modeTxt=m=>m==='press'?'宜压凶方（坐凶向吉）':(m==='face'?'宜朝吉方（纳吉）':'宜居吉方');
  /* 四列齐给宽：事项 118、现状 118、建议 118、落实方式吃余宽。
     不给短列定宽时等分会把现状与建议两列各摊近三百像素（五字内容占满一列），
     反把最长的落实方式列挤到同宽，长文被迫折成三数行，行高骤增。 */
  let html='<div class="fs-tbl-scroll fs-mt-2"><table class="fs-mean-tbl fs-tbl-fixed"><thead><tr>'
    +'<th class="fs-w118">事项</th><th class="fs-w118">现状</th><th class="fs-w118">建议</th><th>落实方式（可改结构、不可改结构两档）</th></tr></thead><tbody>';
  const group=(title,list)=>{
    if(!list.length) return;
    html+=`<tr class="fs-row-hi"><td class="lbl-1" colspan="4">${title}</td></tr>`;
    list.forEach(r=>{
      const cur=r.gua+'宫，'+(r.star||'不论');
      const rec=r.rec?(r.rec.gua+'宫，'+r.rec.name):'无';
      const dir=(r.rec&&r.rec.dir)?('（'+r.rec.dir+'）'):'';
      let act;
      if(r.ok) act='已合局（'+modeTxt(r.mode)+'），不必动；可在此方加催法引动';
      else if(r.k==='stove'||r.k==='wc'||r.k==='mill') act='<b>可改结构</b>：移'+(r.rec?r.rec.gua+'宫'+dir:'凶方')+'压之；<b>不可改</b>：'+(FS_LS_HUA[r.k]||'就地化解');
      else if(r.k==='door') act='<b>可改结构</b>：改门走'+(r.rec?r.rec.gua+'宫'+dir:'吉方')+'；<b>不可改</b>：门内设玄关屏风、门楣凸镜，门常闭';
      else if(r.k==='main'||r.k==='bed') act='<b>可改结构</b>：移'+(r.rec?r.rec.gua+'宫'+dir:'吉方')+'；<b>不可改</b>：'+(FS_LS_HUA[r.k]||'挂帘、床头靠吉方墙');
      else act=(FS_LS_HUA[r.k]||'就地化解');
      html+=`<tr><td class="lbl-1 fs-nowrap">${r.nm}${r.ok?'<span class="fs-badge-g">合</span>':'<span class="fs-badge-r">不合</span>'}</td>`
        +`<td class="fs-nowrap">${cur}</td><td class="fs-nowrap">${rec}</td><td>${act}</td></tr>`;
    });
  };
  group('三要（门、主、灶；以宅卦或门卦起游年，灶座坐凶向吉）', rows.filter(r=>r.src==='三要'));
  group('六事（床、厕、井、磨、路；以命卦起游年，坑厕碓磨宜压凶方）', rows.filter(r=>r.src==='六事'));
  html+='</tbody></table></div>';
  /* 调整后宅评预估：仅按建议改写"门、主"两项（皆属三要，权重 0.20）。
     灶座不并入预估：灶座依《八宅明镜》"坐凶向吉"（压凶方为吉，压吉反伤），
     而本站三要分的灶项按游年吉星计（吉星加分、凶星减分），两口径相反；
     若把按古法移灶后的方位代进去，会得出"依古法调整反而降分"的误读。
     故灶项一律以三要模块自身断法（灶压凶为吉）为准，不进本预估。六事床厕磨与外局形峦亦不在宅评内，
     故本预估为保守下限，只量化"改门、改主"这一部分的收益。 */
  const rec=fsAdjRows(d).reduce((o,r)=>{ o[r.k]=r; return o; },{});
  const dNeed=!!(rec.door&&!rec.door.ok&&rec.door.rec), mNeed=!!(rec.main&&!rec.main.ok&&rec.main.rec);
  const stoveNeed=!!(rec.stove&&!rec.stove.ok);
  let d2=d.e.door, m2=d.e.main;
  if(dNeed) d2=rec.door.rec.gua;
  if(mNeed) m2=rec.main.rec.gua;
  let proj=null;
  try{
    /* 预估与三要同一基础卦；主、灶座、灶向未填时引擎返回 null，预估随之不出，不以空值凑分 */
    const sanyao=FS.scoreSanyao(d.e.qiGua, d2, m2, d.e.stove);
    if(sanyao) proj=FS.srZhaiPing(Object.assign({}, d.parts, {sanyao}));
  }catch(err){}
  const zp=d.zhaiPing;
  if(proj&&zp){
    const delta=proj.got-zp.got;
    const stoveNote=stoveNeed?'灶座虽压吉不合，但其吉凶以"坐凶向吉"独立判定、不进三要分，故分数不动而吉凶实变，移灶仍属必要。':'';
    if(!dNeed&&!mNeed){
      html+=`<div class="fv-act"><b>调整后宅评预估</b>：门、主已合局，改之无益，宅评仍 <b class="fs-score">${zp.got}</b> 分（${zp.grade}），可改者只在化煞与催旺。${stoveNote}六事床厕与外局形峦不在宅评内。</div>`;
    }else{
      const chg=[dNeed?('门→'+d2):'', mNeed?('主→'+m2):''].filter(Boolean).join('、');
      html+=`<div class="fv-act"><b>调整后宅评预估</b>：${zp.got} 分（${zp.grade}）→ <b class="fs-score">${proj.got}</b> 分（${proj.grade}）${delta>0?'<b class="fs-badge-g">+'+delta+'</b>':(delta<0?delta:'持平')}。按建议改 ${chg}。${stoveNote}六事床厕与外局形峦不在宅评内，故此为保守下限。</div>`;
    }
  }
  html+=`<div class="fv-note">落实分两档：<b>可改结构</b>（改门、移灶、挪床）效益直接而费工；<b>不可改结构</b>（屏风、摆设、颜色、遮挡）即时可行而力缓。各事项所属法门见组行注记：三要以宅卦或门卦起伏位，六事以命卦起游年。</div>`;
  host.innerHTML=html;
}
/* 层徽标与结论徽标（与结论卡同源） */
function fsModScores(d){
  const put=(id,v)=>{ const el=document.getElementById(id); if(!el) return;
    el.className='mod-score'; el.textContent='';
    if(!v) { el.textContent='未评'; return; }
    el.textContent=v.got+(v.veto?' 否决':'');
    if(v.veto) el.classList.add('s-low'); else if(v.got>=76) el.classList.add('s-hi'); else if(v.got<60) el.classList.add('s-low');
  };
  put('modSc-l1',d.l1); put('modSc-l2',d.l2); put('modSc-l3',d.l3); put('modSc-l4',d.l4); put('modSc-final',d.zhaiPing);
}
function fsDrawFinal(){
  if(!document.getElementById('fvCard')) return;
  try{
    fillRoomRow();
    const d=fsFinalData();
    fsZkBar(d);
    fsRenderVerdict(d);
    fsAdjustCard(d);
    fsModScores(d);
    drawMembers();
  }catch(err){
    const host=document.getElementById('fvCard');
    if(host) host.innerHTML='<div class="sub-note fs-t-red">综合诊断渲染异常：'+(err&&err.message?err.message:err)+'</div>';
  }
}
function fsQueueFinal(){
  if(fsFinalTimer) return;
  fsFinalTimer=setTimeout(function(){ fsFinalTimer=null; fsDrawFinal(); }, 0);
}
/* 加载时恢复折叠状态（兼容读旧 sessionStorage 键） */
function fsRestoreModState(){
  try{
    const raw=localStorage.getItem('fs_mod_state')||sessionStorage.getItem('fs_mod_state');
    const st=JSON.parse(raw||'{}');
    document.querySelectorAll('section.fs-mod').forEach(m=>{ if(st[m.id]==='1') m.classList.add('collapsed'); });
  }catch(e){}
}
