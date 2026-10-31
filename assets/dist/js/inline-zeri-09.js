
/* ===== 模式切换：择事、造命 =====
   两模式判据不同、口径互斥，故整组显隐、选中哪个就输出哪个：
     择事模式（shishi）＝传统择吉，判据为"日子本身吉凶"（宜忌、丛辰、黄黑道、周堂、坐山）；
     造命模式（zaoming）＝剖腹产择日，判据为"八字相对命主的吉凶"（八字质量、大运、家长缘分），
     传统择吉在其中只作避凶底线。 */
var ZR_MODE='shishi';
/* 卷首说明按模式各写一句：两模式判据不同，说明随模式切换 */
var ZR_LEAD={
  shishi:'先查黄道吉日得候选，再参命主喜用神与真太岁方位，由精择吉日综合定序。',
  zaoming:'为剖腹产择时，按八字质量、大运与家长缘分评断，传统择吉只作避凶底线。'
};
function setZrMode(mode){
  if(mode!=='zaoming' && mode!=='shishi') return;
  ZR_MODE=mode;
  var ld=document.getElementById('zrLead'); if(ld) ld.textContent=ZR_LEAD[mode];
  document.querySelectorAll('.zr-mode-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-mode')===mode); });
  document.querySelectorAll('[data-mode-block]').forEach(function(el){ el.hidden = (el.getAttribute('data-mode-block')!==mode); });
  try{ localStorage.setItem('zeri_mode_v1', mode); }catch(e){}
  if(mode==='zaoming') initZaomingUI();
}
/* 刷新钩子由本页查吉日按钮承担。 */
window.xjRefreshHook=function(){ };
const EVENTS=['嫁娶','订婚','纳采','安床','裁衣','冠笄','祭祀','祈福','求医','出行','入宅','移徙','安香','出火','开市','开业','交易','纳财','求财','立券','签约','置产','动土','安门','上梁','竖柱','安葬','破土','装修','开工','搬家'];
const EVENT_ALIAS={'订婚':['纳采','嫁娶'],'装修':['修造','动土'],'开工':['开市','动土'],'签约':['立券','交易'],'搬家':['入宅','移徙'],'开业':['开市'],'置产':['纳财','交易'],'安床':['安床']};
const HUANGDAO=['青龙','明堂','金匮','天德','玉堂','司命']; /* 六黄道吉神 */
/* 择日各流派：不同流派对黄道、建除、天神的权重不同，切换会真实影响吉度排序 */
const ZERI_SCHOOLS={
  '建除派':    {w:{huang:8,jian:22,ts:8}},
  '丛辰派':    {w:{huang:30,jian:6,ts:8}},
  '神煞派':    {w:{huang:14,jian:10,ts:16}},
  '董公通书派':{w:{huang:18,jian:14,ts:10}},
  '杨公造命派':{w:{huang:12,jian:10,ts:24}},
  '玄空紫白派':{w:{huang:10,jian:10,ts:14}}
};
function fillZrSchool(){document.getElementById('zrSchool').innerHTML=Object.keys(ZERI_SCHOOLS).map(k=>`<option>${k}</option>`).join('');}
function fillEvents(){document.getElementById('event').innerHTML=EVENTS.map(e=>`<option>${e}</option>`).join('');}
/* 结束日期恒为起始日期加六十天：起始日期一改即重算并覆盖结束日期，结束日期仍可单独改，
   下一次起始变更再覆盖；按本地日历进位，跨月跨年由 Date 自动处理，不按毫秒数累加。 */
function zrEndDate(fromDate){
  return new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()+60);
}
function zrSyncEnd(){
  const f=document.getElementById('from'), t=document.getElementById('to');
  const m=f&&t?/^(\d{4})-(\d{2})-(\d{2})$/.exec(f.value):null;
  if(!m) return;
  t.value=zmFmtD(zrEndDate(new Date(+m[1], +m[2]-1, +m[3])));
}
/* 择日窗口结束是派生值：起始日期加二十一日。起始日期由全站统一函数写入当下。 */
function zmSyncWindow(){
  const f=document.getElementById('zmFrom'), t=document.getElementById('zmTo');
  const m=f?/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(f.value||''):null;
  if(t && m) t.value=zmFmtD(new Date(+m[1], +m[2]-1, +m[3]+21));
}
function initDates(){
  const f=document.getElementById('from');
  if(f) f.addEventListener('change', zrSyncEnd);
  zrSyncEnd();
  zmSyncWindow();
}
/* 默认态是表单与空结果区；起始日期由全站统一函数写入当下，
   结束日期是派生值，按起始加六十日重算，不自动出结果。 */
function initDefault(){ initDates(); }
/* ============ 模块① 黄道吉日 ============ */
let LAST=null;
function query(){
 try{
  const ev=document.getElementById('event').value;
  const fv=document.getElementById('from').value, tv=document.getElementById('to').value;
  if(!fv||!tv)return;
  const keys=[ev].concat(EVENT_ALIAS[ev]||[]);
  const [fy,fm,fd]=fv.split('-').map(Number),[ty,tm,td]=tv.split('-').map(Number);
  let cur=safeDate(fy,fm,fd), end=safeDate(ty,tm,td);
  if(cur>end){ document.getElementById('out').innerHTML='<p class="notice">起始日期不能晚于结束日期，请调整后重试。</p>'; LAST=null; return; }
  const diffDays=Math.round((end-cur)/86400000);
  if(diffDays>365){ document.getElementById('out').innerHTML=`<p class="notice">起止间隔为 ${diffDays} 天，超过上限 365 天（最多约一年）。请缩小查询范围后再试。</p>`; LAST=null; return; }
  const results=[];
  const excluded=[];
  let guard=0;
  while(cur<=end && guard<400){
    guard++;
    const solar=Solar.fromYmd(cur.getFullYear(),cur.getMonth()+1,cur.getDate());
    const lunar=solar.getLunar();
    const yi=lunar.getDayYi(), ji=lunar.getDayJi();
    const zhiXing=lunar.getZhiXing();
    const tsLuck=lunar.getDayTianShenLuck(), tShen=lunar.getDayTianShen();
    const hitKeys=keys.filter(k=>yi.includes(k));
    const banKeys=keys.filter(k=>ji.includes(k));
    const banned=banKeys.length>0;
    const huangdao=HUANGDAO.includes(tShen);
    if(hitKeys.length && !banned){
      const w=ZERI_SCHOOLS[document.getElementById('zrSchool').value].w;
      let score=60;
      if(huangdao) score+=w.huang;
      if(ZERI.jianchuGood().includes(zhiXing)) score+=w.jian;
      if(tsLuck==='吉') score+=w.ts;
      score=Math.min(100,score);
      const dayGZ=lunar.getDayInGanZhi();
      results.push({
        solar, lunar, score, huangdao, zhiXing, tShen, tsLuck,
        wk:'日一二三四五六'[solar.getWeek()],
        chong:lunar.getDayChongDesc(), sha:lunar.getDaySha(),
        yi:yi.slice(0,8).join('、'),
        dayGZ, dayGan:dayGZ[0], dayZhi:dayGZ[1]
      });
    } else if(hitKeys.length || huangdao){
      /* 落选候选留档：合宜项被忌项否决，或黄道而宜项未列本事项，两者都值得回查 */
      const dayGZ=lunar.getDayInGanZhi();
      excluded.push({
        solar, dayGZ, tShen, huangdao, zhiXing, ban: hitKeys.length>0,
        why: hitKeys.length ? '合宜项犯忌：'+banKeys.join('、') : '黄道日，宜项未列'+ev
      });
    }
    cur=new Date(cur.getTime()+86400000);
  }
  results.sort((a,b)=>b.score-a.score || (a.solar.toYmd()<b.solar.toYmd()?-1:1));
  const top=results.slice(0,30);
  if(!top.length){ document.getElementById('out').innerHTML=`<p class="notice">该范围内暂无适宜“${ev}”的吉日，可扩大日期范围或更换事项。</p>`; LAST=null; return; }
  let cards=top.map((r,i)=>`<div class="zr-card ${r.score>=88?'zr-hd':''}">
    <div class="zr-rank">${i<3?'★':''}</div>
    <div class="zr-date">
      <div class="zr-sol">${r.solar.getYear()}年${r.solar.getMonth()}月${r.solar.getDay()}日 <span>周${r.wk}</span></div>
      <div class="zr-lun">农历${r.lunar.getMonthInChinese()}月${r.lunar.getDayInChinese()} ${r.dayGZ}日</div>
    </div>
    <div class="zr-tags">
      <span class="zr-tag ${r.huangdao?'gold':''}">${r.tShen}${r.huangdao?'（黄道）':'（黑道）'}</span>
      <span class="zr-tag">${r.zhiXing}日</span>
      <span class="zr-tag">冲${r.chong} 煞${r.sha}</span>
    </div>
    <div class="zr-score ${r.score>=88?'score-high':''}">${r.score}<span class="zr-grade">${xjJzGrade(r.score,ZR_GRADE).t}</span></div>
  </div>`).join('');
  const school=document.getElementById('zrSchool').value;
  const cut=results.length>top.length ? `<p class="sub-note">范围内共 ${results.length} 天合宜，按吉度列出前 ${top.length} 天；如需更多可缩小日期范围分段查看。</p>` : '';
  const schoolNote = school==='玄空紫白派' ? '<p class="sub-note">初筛按黄道、建除、太岁三项权重排序；玄空紫白的飞星与联珠在精择第④步计入。</p>' : '';
  document.getElementById('out').innerHTML=`
    <h4 class="jz-h">“${ev}”黄道吉日（${school} ${results.length} 天合宜${results.length>top.length?'，列前 '+top.length+' 天':''}，按吉度排序）</h4>
    ${schoolNote}${cut}
    <div class="zr-list">${cards}</div>`;
  excluded.sort((a,b)=>(b.ban?1:0)-(a.ban?1:0));
  LAST={ev,top,excluded:excluded.slice(0,20),exTotal:excluded.length};
 }catch(e){ document.getElementById('out').innerHTML='<p class="notice">查询出错：'+(e.message||e)+'</p>'; }
}
/* ============ 模块② 命主喜用神 ============ */
let CITY_LNG=null;
let ZR_USER_PLACE=null;
let USER_XI=[], USER_JI=[], USER_USE='', USER_DWX='', USER_NAYIN_WX='', USER_NAYIN='', USER_READY=false, USER_MING_GZ='';
function buildUserBZ(){
  const dv=document.getElementById('bDate').value;
  const tv=document.getElementById('bTime').value||'12:00';
  if(!dv){ return null; }
  const sex=parseInt(document.getElementById('bSex').value);
  const ziMode=document.getElementById('bZi').value;
  const useTrue=document.getElementById('bTrue').checked;
  const manualLng=document.getElementById('bLng').value;
  let [y,m,d]=dv.split('-').map(Number);
  let [h,mi]=tv.split(':').map(Number);
  let lng;
  if(manualLng!=='') lng=parseFloat(manualLng);
  else lng=findLng(document.getElementById('bProv').value, document.getElementById('bCity').value, document.getElementById('bDist').value);
  if(lng!=null && isNaN(lng)) lng=null;
  /* 出生地未定即无经度可校：此时按钟面标准时排盘，并在结论旁注明未校，
     不回退东经 120 度，那是替用户坐到别人家的经度上折一道，折了多少盘面一字不著。 */
  const _pto=placeTimeOptsOf({prov:'bProv',city:'bCity',lng:'bLng',tz:'bTzOff',dst:'bLocalDst'});
  let cy=y,cm=m,cd=d,ch=h,cmi=mi;
  if(!_pto.overseas && typeof applyDstCorrection==='function'){
    const ds=applyDstCorrection(cy,cm,cd,ch,cmi,'auto');
    if(ds.applied){ cy=ds.y; cm=ds.m; cd=ds.d; ch=ds.h; cmi=ds.mi; }
  }
  if(_pto.localDst && typeof shiftClockDay==='function'){
    const ld=shiftClockDay(cy,cm,cd,ch,cmi,-60);
    cy=ld.y; cm=ld.m; cd=ld.d; ch=ld.h; cmi=ld.mi;
  }
  let adj={y:cy,m:cm,d:cd,h:ch,mi:cmi};
  if(useTrue && lng!=null){ const ts=trueSolarTime(cy,cm,cd,ch,cmi,lng,'true',_pto.overseas?_pto.baseLng:120); adj={y:ts.y,m:ts.m,d:ts.d,h:ts.h,mi:ts.mi}; }
  const zadj=adjustZiShi(adj.y,adj.m,adj.d,adj.h,adj.mi,ziMode); adj=zadj;
  const solar=Solar.fromYmdHms(adj.y,adj.m,adj.d,adj.h,adj.mi,0);
  const lunar=solar.getLunar();
  const ec=lunar.getEightChar();
  const dayGan=ec.getDayGan();
  const yearGZ=ec.getYear(), monthGZ=ec.getMonth(), dayGZ=ec.getDay(), timeGZ=ec.getTime();
  const yearZ=yearGZ[1], monthZ=monthGZ[1], dayZ=dayGZ[1];
  let timeStem=timeGZ[0], timeZ=timeGZ[1];
  if(ziMode==='early' && adj.h===23){
    const tg=wuShuDun(dayGan,0);
    timeStem=tg[0]; timeZ='子';
  }
  return {sex, dayGan, gans:[yearGZ[0],monthGZ[0],dayGZ[0],timeStem], zhis:[yearZ,monthZ,dayZ,timeZ], monthZ, yearGZ:yearGZ[0]+yearZ, sunOff:useTrue&&lng==null};
}
/* 境外出生地界面同步：选到境外城市时挂出时区与当地夏令时并写说明行；
   境内还原。显隐与文案由共享件 syncOverseasFields 一处判。 */
function zmSyncOverseas(){
  syncOverseasFields({prov:'bProv',city:'bCity',lng:'bLng',tz:'bTzOff',dst:'bLocalDst',
    tzField:'bTzOffField',dstField:'bLocalDstField',note:'bOverseasNote'});
}
/* 境外时区或当地夏令时改动后按新口径重算喜用神 */
function zmOverseasChange(){
  zmSyncOverseas();
  if(document.getElementById('bDate').value && USER_READY) calcUserXi();
}
function calcUserXi(){
  const out=document.getElementById('xiOut');
  const BZ=buildUserBZ();
  if(!BZ){ out.innerHTML='<p class="notice">请先填写出生日期、时间、性别。</p>'; return; }
  const A=baziAnalysis(BZ);
  USER_XI=A.xiWx.slice(); USER_JI=A.jiWx.slice();
  USER_USE=A.synthesis.primary.wx; USER_DWX=GAN_WX[BZ.dayGan]; USER_READY=true;
  const ny=nayinOf(BZ.yearGZ); USER_NAYIN=ny; USER_NAYIN_WX=(NAYIN_INFO[ny]||{}).wx||'';
  USER_MING_GZ=BZ.yearGZ;
  const xiStr=USER_XI.join('、')||'无';
  const jiStr=USER_JI.join('、')||'无';
  out.innerHTML=`<div class="info-box">
    <p class="ly-zh-p">日主 <span class="zr-k">${BZ.dayGan}（${USER_DWX}）</span>　首选用神：<span class="zr-k">${USER_USE}</span></p>
    <p class="ly-zh-p">喜神（生扶用神）：<span class="zr-good">${xiStr}</span>　忌神：<span class="zr-bad">${jiStr}</span></p>
    <p class="ly-zh-p">本命年命纳音：<span class="zr-k">${USER_NAYIN}（${USER_NAYIN_WX||'无'}）</span></p>
    ${BZ.sunOff?'<p class="ly-zh-p zr-mini">（未定出生地，未作太阳时校正，按钟面标准时）</p>':''}
    <p class="ly-zh-p zr-mini">（扶抑法，含调候、通关、病药、格局综合；日主${A.strength}）</p>
  </div>`;
}
/* ============ 模块③ 真太岁方位 ============ */
let TS_RES=null;
function calcTaisui(){
  const mode=document.getElementById('tsMode').value;
  const raw=(document.getElementById('tsYear').value||'').trim();
  let yr=parseInt(raw,10);
  const nowY=xjNowDate().getFullYear();
  if(mode==='zhen' && (!yr||isNaN(yr))){
    TS_RES=null;
    document.getElementById('tsOut').innerHTML='<p class="notice">本命真太岁须填写出生年份；年份留空时不取当年，以免与流年论法混同。</p>';
    return;
  }
  if(mode==='liu'||!yr||isNaN(yr)) yr=nowY;
  const gz=Solar.fromYmd(yr,2,10).getLunar().getYearInGanZhiByLiChun();
  const zhi=gz[1], cp=ZERI.CHONG[zhi], ss=ZERI.SANSHA[zhi];
  const label=mode==='liu'?'流年太岁（当年）':'本命真太岁（出生年）';
  TS_RES={zhi, mode, cp, ss:[ss[0],ss[1],ss[2]]};
  const fz=ZERI.ZHI_FANG, gua=z=>ZERI.shanGuaOf(z)||'';
  document.getElementById('tsOut').innerHTML=
   `<div class="ts-title">${yr} ${gz}年 ${label} 太岁在${zhi}（${fz[zhi]}）</div>
    <table class="ts-tbl">
      <thead><tr><th>项目</th><th>地支</th><th>方位</th><th>卦宫</th></tr></thead>
      <tbody>
        <tr><td>太岁方</td><td>${zhi}</td><td>${fz[zhi]}</td><td>${gua(zhi)}</td></tr>
        <tr><td>岁破方（对冲）</td><td>${cp}</td><td>${fz[cp]}</td><td>${gua(cp)}</td></tr>
        <tr><td>三煞方</td><td>${ss[0]} ${ss[1]} ${ss[2]}</td><td>${fz[ss[1]]}</td><td>${[ss[0],ss[1],ss[2]].map(gua).join(' ')}</td></tr>
      </tbody>
    </table>
   `;
}
/* ============ 模块④ 精择吉日 ============ */
const ZR_GRADE={da:'大吉',daK:'v-daji',daD:'诸吉汇聚，百事可为',zhong:'中吉',zhongK:'v-zhongji',zhongD:'吉神得力，可择',ping:'平',pingK:'v-ping',pingD:'吉凶参半，斟酌而行',xiong:'凶',xiongK:'v-xiong',xiongD:'凶煞较多，宜避',daXiong:'大凶',daXiongK:'v-daxiong',daXiongD:'凶煞叠见，切勿用'};
function jingze(){
  const out=document.getElementById('jingzeOut');
  if(!LAST || !LAST.top.length){ out.innerHTML='<p class="notice">请先在第①步查吉日，得到候选日期后再精择。</p>'; return; }
  const ev=LAST.ev;
  const school=document.getElementById('zrSchool').value;
  const tsRes = document.getElementById('noTs').checked ? null : TS_RES;
  const fam = ZERI.familyOf(ev);
  const notes=[];
  if(USER_READY) notes.push(`已纳入日课生扶命主（日主${USER_DWX}；喜：${USER_XI.join('、')}；忌：${USER_JI.join('、')}；年命纳音：${USER_NAYIN_WX||'无'}）`);
  else notes.push('未填写八字喜用神，暂不按命主喜忌修正');
  if(tsRes) notes.push(`已纳入真太岁方位（${tsRes.mode==='liu'?'流年':'本命'}太岁在 ${tsRes.zhi}）`);
  else notes.push(document.getElementById('noTs').checked ? '已关闭真太岁方位校正' : '未取得真太岁方位，本次不校验：请回第③步查方位，本命论法须先填出生年');
  const shanZhi=document.getElementById('shan').value||null;
  let fenJin=null, XIANMING_GZ=null;
  if(window.FENGSHUI && shanZhi){
    const fj=document.getElementById('fenJin');
    if(!fj.options.length || fj.getAttribute('data-shan')!==shanZhi){
      fj.innerHTML='<option value="">不辨分金</option>'+FENGSHUI.fenJin(shanZhi).map(x=>`<option value="${x.gz}">${x.gz}（${x.wang}）</option>`).join('');
      fj.setAttribute('data-shan',shanZhi);
    }
    fenJin=fj.value||null;
    if(fenJin){ const fg=fenJin[0], fz=fenJin[1]; fj.setAttribute('data-chong', fg+CHONG[fz]); }
    else if(fj.hasAttribute('data-chong')) fj.removeAttribute('data-chong');
    const ym=document.getElementById('xmYear').value;
    XIANMING_GZ=ym?Solar.fromYmd(parseInt(ym,10),7,1).getLunar().getYearInGanZhiByLiChun():null;
  }
  const laiLong=document.getElementById('laiLong') ? (document.getElementById('laiLong').value||null) : null;
  const timeZhi=document.getElementById('zhongShi').value||null;
  const yunSel=document.getElementById('yuanYun'), xsSel=document.getElementById('xiangShan');
  const yunN=({'一运':1,'二运':2,'三运':3,'四运':4,'五运':5,'六运':6,'七运':7,'八运':8,'九运':9})[yunSel.value]||null;
  const xiangShan=xsSel.value||null;
  if(fam.fangSha){
    if(shanZhi) notes.push(`已纳入坐山 ${shanZhi}（补龙扶山，山方煞到山判定）`);
    else notes.push('未填坐山（造葬动土建议填坐山）');
  } else {
    if(shanZhi) notes.push(`已纳入坐山 ${shanZhi}（本事事类不参坐山吉凶，仅供参考）`);
    else notes.push('本事事类不参坐山');
  }
  if(timeZhi) notes.push(`已选用事时辰 ${timeZhi}时（日课格局：日时干支合参）`);
  else notes.push('未选时辰（选按时辰可启用日课格局与贵人驿马判定）');
  if(school==='玄空紫白派') notes.push('已启用玄空紫白飞星（日家紫白中宫及坐山宫星曜）');
  if(laiLong) notes.push('已纳入入首龙 '+laiLong+'（来龙三煞参断，永远真煞）');
  else notes.push('未填入首龙（来龙三煞不参，城市阳宅难定来龙者免参）');
  if(ev==='安葬' && fenJin) notes.push('已辨坐山分金 '+fenJin+'（此分金冲丁日＝'+(document.getElementById('fenJin').getAttribute('data-chong')||'')+'，选日须避）');
  if(fenJin&&XIANMING_GZ&&ev==='安葬') notes.push('已辨坐山分金 '+fenJin+'，仙命 '+XIANMING_GZ+'（分金合仙命参断；仙命为亡者年命，与事主命主分列）');
  else if(fenJin||XIANMING_GZ) notes.push('分金与仙命须同填且事类为安葬方参分金合仙命');
  if(USER_MING_GZ) notes.push('已纳入本命年干支 '+USER_MING_GZ+'（人元三煞即本命真三煞参断）');
  else notes.push('未填命主八字（人元三煞不参）');
  const list=LAST.top.map(r=>{
    const res=ZERI.jingzeScore(r, ev, {USER_XI, USER_JI, USER_DWX, USER_READY, TS_RES: tsRes, USER_NAYIN_WX, USER_MING_GZ, shanZhi, laiLong, fenJin, XIANMING_GZ, timeZhi, school, LIANZHU:(yunN&&xiangShan&&school==='玄空紫白派')?{yun:yunN,xiang:xiangShan}:null});
    return Object.assign({}, r, {jscore:res.score, reasons:res.reasons, res});
  });
  list.sort((a,b)=> b.jscore-a.jscore || (a.solar.toYmd()<b.solar.toYmd()?-1:1));
  LAST.peer={best:list[0]?list[0].jscore:null, worst:list.length?list[list.length-1].jscore:null,
    avg:list.length?Math.round(list.reduce((a,x)=>a+x.jscore,0)/list.length*10)/10:null, n:list.length};
  const cards=list.map((r,i)=>{
    const d=r.res;
    const g = xjJzGrade(r.jscore, ZR_GRADE);
    const detail=(d.geju.length||d.shensha.ji.length||d.shensha.xiong.length||d.zr.ji.length||d.zr.xiong.length||d.zhoutang||d.zhiNote||(d.kongwang&&d.kongwang.length)||d.xiu||d.jiuyao||d.najia||(d.tongshu&&(d.tongshu.ji.length||d.tongshu.xiong.length))||d.pz||d.fzXi||d.fzCai||d.fzFu)?
      `<div class="jz-detail">
        ${d.geju.length?`<p class="ly-zh-p"><span class="zr-k">日课格局</span>：${d.geju.join('、')}</p>`:''}
        ${d.shensha.ji.length?`<p class="ly-zh-p"><span class="zr-good">日柱神煞（吉）</span>：${d.shensha.ji.join('、')}</p>`:''}
        ${d.shensha.xiong.length?`<p class="ly-zh-p"><span class="zr-bad">日柱神煞（凶）</span>：${d.shensha.xiong.join('、')}</p>`:''}
        ${d.zr.ji.length?`<p class="ly-zh-p"><span class="zr-good">择日丛辰（吉）</span>：${d.zr.ji.join('、')}</p>`:''}
        ${d.zr.xiong.length?`<p class="ly-zh-p"><span class="zr-bad">择日丛辰（凶）</span>：${d.zr.xiong.join('、')}</p>`:''}
        ${d.zhoutang?`<p class="ly-zh-p"><span class="zr-k">${d.zhoutang.title}</span>：落“${d.zhoutang.pos}” ${d.zhoutang.good?'（吉位）':'（凶位）'}</p>`:''}
        ${d.zhiNote?`<p class="ly-zh-p"><span class="zr-k">坐山</span>：${d.zhiNote}</p>`:''}
        ${(d.kongwang&&d.kongwang.length)?`<p class="ly-zh-p"><span class="zr-k">日柱空亡</span>：${d.kongwang.join('、')}（诸吉减力）</p>`:''}
        ${d.xiu?`<p class="ly-zh-p"><span class="zr-k">二十八宿</span>：${d.xiu}${d.xiuZhu?`<span class="sub-note">　${d.xiuZhu}</span>`:""}</p>`:''}
        ${d.jiuyao?`<p class="ly-zh-p"><span class="zr-k">九曜</span>：${d.jiuyao}</p>`:''}
        ${d.najia?`<p class="ly-zh-p"><span class="zr-k">纳甲</span>：${d.najia}</p>`:''}
        ${d.tongshu&&d.tongshu.ji.length?`<p class="ly-zh-p"><span class="zr-k">通书吉神</span>：${d.tongshu.ji.join('、')}</p>`:''}
        ${d.tongshu&&d.tongshu.xiong.length?`<p class="ly-zh-p"><span class="zr-k">通书凶神</span>：${d.tongshu.xiong.join('、')}</p>`:''}
        ${d.pz?`<p class="ly-zh-p"><span class="zr-k">彭祖百忌</span>：${d.pz}</p>`:''}
        ${(d.fzXi||d.fzCai||d.fzFu)?`<p class="ly-zh-p"><span class="zr-k">喜神</span>：${d.fzXi||'-'}　<span class="zr-k">财神</span>：${d.fzCai||'-'}　<span class="zr-k">福神</span>：${d.fzFu||'-'}</p>`:''}
      </div>`:'';
    const verdict = (d.zr.ji.concat(d.shensha.ji)).slice(0,3).join('、');
    const bad = (d.zr.xiong.concat(d.shensha.xiong)).slice(0,3).join('、');
    return `<div class="zr-card ${r.jscore>=88?'zr-hd':''}">
      <div class="zr-rank">${i<3?'★':''}</div>
      <div class="zr-date">
        <div class="zr-sol">${r.solar.getYear()}年${r.solar.getMonth()}月${r.solar.getDay()}日 <span>周${r.wk}</span></div>
        <div class="zr-lun">农历${r.lunar.getMonthInChinese()}月${r.lunar.getDayInChinese()} ${r.dayGZ}日</div>
      </div>
      <div class="zr-tags">
        <span class="zr-tag ${r.huangdao?'gold':''}">${r.tShen}${r.huangdao?'（黄道）':'（黑道）'}</span>
        <span class="zr-tag">${r.zhiXing}日</span>
        <span class="zr-tag">冲${r.chong} 煞${r.sha}</span>
        ${d.reasons.map(x=>{
          const v=Math.abs(x.delta||0);
          const cls = v>=5 ? 'jz-strong' : ((x.delta||0)<0 ? 'jz-bad' : 'jz-good');
          return `<span class="zr-tag ${cls}">${x.text}</span>`;
        }).join('')}
      </div>
      ${detail}
      <div class="jz-verdict ${g.k}">【${g.t}】${g.d}</div>
      <div class="zr-score ${r.jscore>=88?'score-high':''}">${r.jscore}</div>
    </div>`;
  }).join('');
  const lose=(LAST.excluded||[]);
  const loseHtml = lose.length ? `<h4 class="jz-h">未入选的候选（前 ${lose.length} 天，共 ${LAST.exTotal} 天）</h4>
    <p class="sub-note">只列合宜项被忌项否决、或黄道而宜项未列本事项的日期；建除与黄黑道并列，便于回查为何落选。</p>
    <table class="ts-tbl">
      <thead><tr><th>日期</th><th>日柱</th><th>黄黑道与建除</th><th>未入选原因</th></tr></thead>
      <tbody>${lose.map(x=>`<tr><td>${x.solar.getMonth()}月${x.solar.getDay()}日</td><td>${x.dayGZ}</td><td>${x.tShen}${x.huangdao?'（黄道）':'（黑道）'} ${x.zhiXing}日</td><td>${x.why}</td></tr>`).join('')}</tbody>
    </table>` : '';
  out.innerHTML=`<h4 class="jz-h">精择结果 “${ev}” 综合判定（${list.length} 天　事类：${fam.name}${school?('　流派：'+school):''}）</h4>
    <p class="sub-note">${notes.join('；')}。</p>
    <div class="zr-list">${cards}</div>${loseHtml}`;
  const mod=document.getElementById('dzMod'); if(mod) mod.open=true;
}
/* ============ 造命模式（剖腹产择日）============
   与择事模式判据不同：枚举窗口内全部"日期 × 时辰"，逐个排盘后按四层评分排序。
   四层权重（本站归纳）：八字质量 55 ＋ 大运 20 ＋ 家长缘分 15 ＋ 避凶底线 10。 */
var ZM_INIT=false, ZM_RES=null, ZM_CTX=null, ZM_VIEW='rank';
function zmFmtD(dt){ return dt.getFullYear()+'-'+pad2(dt.getMonth()+1)+'-'+pad2(dt.getDate()); }
/* 出生地三级联动绑定：宝宝（pfx=''）、父（'F'）、母（'M'）三处共用同一套省市县逻辑，
   避免复制三份 fillCity/fillDist。经度由 findLng 取；手动经度优先，见 zmReadParent 与 zmRun。 */
function zmBindGeo(pfx){
  var sp=document.getElementById('zm'+pfx+'Prov'), sc=document.getElementById('zm'+pfx+'City'), sd=document.getElementById('zm'+pfx+'Dist');
  if(!sp||!sc||!sd) return null;
  return fillPlaceTrio(sp, sc, sd, null);
}
function initZaomingUI(){
  if(ZM_INIT) return;
  var wrap=document.getElementById('zmHours');
  if(!wrap) return;
  ZM_INIT=true;
  /* 十二时辰框须带稳定 id：全站顶层刷新机制按 input[id] 采集快照，无 id 的控件不入快照。
     勾选态只有 checked 一个真源，高亮由 CSS 派生，不另存类。 */
  wrap.innerHTML=ZERI.HOURS.map(function(o){
    return '<label class="zm-hr" data-h="'+o.i+'"><input type="checkbox" id="zmH'+o.i+'" value="'+o.i+'" checked><span>'+o.z+'（'+o.s+'）</span></label>';
  }).join('');
  zmSyncWindow();
  /* 宝宝、家长一、家长二三处出生地均按同一逻辑初始化（家长出生地用于真太阳时经度校正） */
  zmBindGeo('');
  zmBindGeo('P1');
  zmBindGeo('P2');
  wrap.addEventListener('change', zmSyncHours);
  zmSyncHours();
}
/* 把 checked 同步成 .on 类，供不认 :has() 的旧内核取用高亮。
   须在取用前调用：顶层刷新恢复与分享还原都是程序化赋 checked，不派发 change，事件驱动会漏同步。 */
function zmSyncHours(){
  Array.prototype.forEach.call(document.querySelectorAll('#zmHours .zm-hr'), function(lab){
    var cb=lab.querySelector('input'); if(!cb) return;
    lab.classList.toggle('on', !!cb.checked);
  });
}
function zmPreset(kind){
  var map={all:[0,1,2,3,4,5,6,7,8,9,10,11], day:[4,5,6,7,8,9], am:[2,3,4,5,6], pm:[7,8,9,10], none:[]};
  var sel=map[kind]||[];
  Array.prototype.forEach.call(document.querySelectorAll('#zmHours .zm-hr'), function(lab){
    var cb=lab.querySelector('input'); if(!cb) return;
    cb.checked = sel.indexOf(parseInt(cb.value,10))>=0;
    /* 预设是程序化赋值，不派发则顶层快照收不到这次变更，刷新后仍按旧勾选恢复 */
    try{ cb.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
  });
  zmSyncHours();
}
function zmSelectedHours(){
  zmSyncHours();          /* 读取即同步：高亮镜像从 checked 派生，取用时保证一致 */
  var out=[];
  Array.prototype.forEach.call(document.querySelectorAll('#zmHours input[type=checkbox]'), function(cb){
    if(cb.checked) out.push(parseInt(cb.value,10));
  });
  return out;
}
/* 读一位家长的出生信息（pfx='P1' 家长一、'P2' 家长二）。
   返回 {y,m,d,h,mi,lng,useTrue,sex,label}；lng 取"手动经度优先、否则出生地"，与宝宝出生地同口径。
   sex 不预设父母：两位家长各自选，只决定六亲星取用（男家长取偏财、女家长取正印）。 */
function zmReadParent(pfx){
  var dEl=document.getElementById('zm'+pfx+'Date'), tEl=document.getElementById('zm'+pfx+'Time');
  if(!dEl) return null;
  var dv=(dEl.value||'').trim();
  if(!dv) return null;
  var p=dv.split('-').map(Number);
  if(p.length<3 || !p[0]) return null;
  var t=((tEl&&tEl.value)||'12:00').split(':').map(Number);
  var sEl=document.getElementById('zm'+pfx+'Sex');
  var o={y:p[0], m:p[1], d:p[2], h:(t[0]||0), mi:(t[1]||0), lng:null, useTrue:false,
         sex:(sEl && sEl.value==='女') ? '女' : '男',
         label:(pfx==='P1') ? '家长一' : '家长二'};
  var lEl=document.getElementById('zm'+pfx+'Lng');
  var manual=lEl ? (lEl.value||'').trim() : '';
  if(manual!==''){
    var mv=parseFloat(manual); if(!isNaN(mv)) o.lng=mv;
  } else {
    var gEl=document.getElementById('zm'+pfx+'Prov'), cEl=document.getElementById('zm'+pfx+'City'), xEl=document.getElementById('zm'+pfx+'Dist');
    var f=findLng(gEl?gEl.value:'', cEl?cEl.value:'', xEl?xEl.value:'');
    if(f!=null) o.lng=f;
  }
  var uEl=document.getElementById('zm'+pfx+'True');
  o.useTrue = uEl ? !!uEl.checked : false;
  return o;
}
/* quiet=1 为恢复性重出（刷新重排、分享还原）：只出结果，不改折叠态。
   折叠态的真源是 details 自身的开合与本页记忆，渲染函数不写它；点排盘按钮时才展开结果区。 */
function zmRun(quiet){
  var out=document.getElementById('zmOut');
  if(!window.ZAOMING){ out.innerHTML='<p class="notice">造命引擎未加载。</p>'; return; }
  var fv=(document.getElementById('zmFrom').value||'').trim();
  var tv=(document.getElementById('zmTo').value||'').trim();
  if(!fv||!tv){ out.innerHTML='<p class="notice">请填写窗口起止日期。</p>'; return; }
  var f1=fv.split('-').map(Number), t1=tv.split('-').map(Number);
  if(f1.length<3||t1.length<3||!f1[0]||!t1[0]){ out.innerHTML='<p class="notice">日期格式应为 yyyy-mm-dd。</p>'; return; }
  var from={y:f1[0],m:f1[1],d:f1[2]}, to={y:t1[0],m:t1[1],d:t1[2]};
  var d1=new Date(from.y,from.m-1,from.d), d2=new Date(to.y,to.m-1,to.d);
  if(d1>d2){ out.innerHTML='<p class="notice">窗口起始不能晚于结束日期。</p>'; return; }
  var span=Math.round((d2-d1)/86400000)+1;
  if(span>60){ out.innerHTML='<p class="notice">窗口 '+span+' 天，超过上限 60 天。枚举量为"天数 × 时辰数"，请缩小范围。</p>'; return; }
  var lateZi=document.getElementById('zmZi').value==='late';
  var hours=zmSelectedHours();
  if(!hours.length){ out.innerHTML='<p class="notice">请至少勾选一个可用时辰。</p>'; return; }
  var total=span*hours.length;
  if(total>720){ out.innerHTML='<p class="notice">候选量 '+total+' 个，超过上限 720。请减少天数或时辰数。</p>'; return; }
  var manual=(document.getElementById('zmLng').value||'').trim();
  var lng=null;
  if(manual!=='') lng=parseFloat(manual);
  else { var f=findLng(document.getElementById('zmProv').value, document.getElementById('zmCity').value, document.getElementById('zmDist').value); lng=(f!=null)?f:null; }
  if(isNaN(lng)) lng=null;
  var sex=parseInt(document.getElementById('zmSex').value,10);
  var useTrue=document.getElementById('zmTrue').checked;
  var parent1=zmReadParent('P1');
  var parent2=zmReadParent('P2');
  var useTS=document.getElementById('zmTs').checked;
  out.innerHTML='<p class="notice">正在枚举 '+total+' 个候选（'+span+' 天 × '+hours.length+' 时辰）并逐个排盘评分，请稍候…</p>';
  setTimeout(function(){
    var res;
    try{ res=ZAOMING.enumerate({from:from,to:to,hours:hours,sex:sex,lng:lng,useTrue:useTrue,parent1:parent1,parent2:parent2,useTS:useTS,lateZi:lateZi}); }
    catch(e){ out.innerHTML='<p class="notice">排盘出错：'+(e.message||e)+'</p>'; return; }
    ZM_RES=res;
    ZM_CTX={from:from,to:to,hours:hours,sex:sex,parent1:parent1,parent2:parent2,useTS:useTS,lng:lng,useTrue:useTrue};
    ZM_VIEW='rank';
    renderZm();
    if(!quiet){ var mod=document.getElementById('zmMod3'); if(mod) mod.open=true; }
  }, 30);
}
function zmSetView(v){ ZM_VIEW=v; renderZm(); }
/* 评分明细逐项：层内一行内联排列（项间以 .zm-li 右外边距留白），
   层标题与各项同段，四层共四行 */
function zmLayerBlock(title, items){
  if(!items||!items.length) return '';
  var body=items.map(function(x){
    var cls = x.kind==='ji' ? 'zr-good' : (x.kind==='xiong' ? 'zr-bad' : '');
    var d = (typeof x.delta==='number' && x.delta!==0) ? ((x.delta>0?'+':'')+x.delta+' ') : '';
    /* 带 grp 的层（家长缘分）按家长分组：组标题独占一行、组内每条一行；
       其余三层不带 grp，仍为层内一行内联排列 */
    var head = x.grpHead ? '<span class="zm-grp">【'+x.grp+'】</span>' : '';
    return head+'<span class="zm-li'+(x.grp?' blk':'')+'"><span class="'+cls+'">'+d+'</span>'+x.name+'</span>';
  }).join('');
  return '<p class="zm-lb"><span class="zm-lt">'+title+'</span>'+body+'</p>';
}
function renderZm(){
  var out=document.getElementById('zmOut');
  var res=ZM_RES, ctx=ZM_CTX;
  if(!res || !res.count){ out.innerHTML='<p class="notice">窗口内无可用候选。</p>'; return; }
  var list = (ZM_VIEW==='day') ? ZAOMING.bestPerDay(res.list) : res.list;
  var byDay={};
  list.forEach(function(it){ var k=it.y+'-'+it.m+'-'+it.d; (byDay[k]=byDay[k]||[]).push(it); });
  var diffNotes={};
  Object.keys(byDay).forEach(function(k){
    var arr=byDay[k]; if(arr.length<2) return;
    var hi=arr[0], lo=arr[arr.length-1];
    var hiH=ZERI.HOURS[hi.hourIdx].z, loH=ZERI.HOURS[lo.hourIdx].z;
    var dr=(hi.res.total-lo.res.total).toFixed(1);
    diffNotes[k]=hiH+'时优于'+loH+'时（差 '+dr+' 分），主因：'+((hi.res.Q.score!==lo.res.Q.score)?'八字质量不同':'同八字而家长缘分或避凶底线有别');
  });
  var hasTop=list.some(function(it){ return it.res.total>=88; });
  var degradeNote=hasTop?'':(list.length?('窗口内未出上吉之选（无 88 分以上），可扩大日期范围；若工期所限，取排序最前者并重点核对避凶底线明细。'):'');
  var top=list.slice(0,30);
  var hasParent = !!(ctx.parent1||ctx.parent2);
  var degradeHtml = degradeNote ? ('<div class="zm-degrade"><span class="zr-k">择时说明</span>：'+degradeNote+'</div>') : '';
  var pInfo = hasParent
    ? degradeHtml+'已纳入家长缘分（'+[(ctx.parent1?ctx.parent1.label:''),(ctx.parent2?ctx.parent2.label:'')].filter(Boolean).join('、')+'完整八字）'
    : '未填家长信息，家长缘分层不参与（其余三层按剩余权重等比放大）';
  /* 宝宝出生地未定而真太阳时开着：整批候选按钟面标准时排，明写出来免被当作已校正 */
  var noPlaceNote = (ctx.useTrue && ctx.lng==null) ? '　宝宝出生地未定，全部候选按钟面标准时排盘，未作太阳时校正。' : '';
  var cards=top.map(function(it,i){
    var r=it.res, g=r.grade; var dKey=it.y+'-'+it.m+'-'+it.d; var dNote=diffNotes[dKey]||'';
    var diffHtml = dNote ? ('<div class="zm-diff">'+dNote+'</div>') : '';
    var layers='<div class="zm-layers">'
      +'<span class="zm-layer">八字质量 '+r.Q.score+'</span>'
      +'<span class="zm-layer">前三步大运 '+(r.Y.score==null?'无':r.Y.score)+'</span>'
      +'<span class="zm-layer">家长缘分 '+(r.P?r.P.score:'无')+'</span>'
      +'<span class="zm-layer">避凶底线 '+r.B.score+'</span>'
      +'</div>';
    var dy = (r.Y.steps&&r.Y.steps.length)
      ? ('<div class="zm-dy"><span class="zr-k">前三步大运</span>：'+r.Y.steps.map(function(s){
          return s.gz+'（'+s.age+'岁起 '+s.year+'）<b>'+s.rating+'</b>';
        }).join('　')+(r.Y.start?('　起运 '+r.Y.start.age+' 岁（'+r.Y.start.solar+'）'):'')+'</div>')
      : '';
    var gs = (r.B.guansha&&r.B.guansha.length)
      ? ('<div class="zm-dy zm-gs"><span class="zr-k">小儿关煞</span>：'+r.B.guansha.map(function(x){
          return x.name+'（'+x.basis+'，'+x.lv+'级）';
        }).join('；')+'</div>')
      : '';
    /* 评分明细：按精择吉日的口径直接铺开，复用 .jz-detail 绿框，四层各占一列，与择事模式明细观感统一 */
    var detail='<div class="jz-detail zm-detail">'
      + zmLayerBlock('① 八字质量 '+r.Q.score, r.Q.items)
      + zmLayerBlock('② 前三步大运 '+(r.Y.score==null?'无':r.Y.score), r.Y.items)
      + (r.P ? zmLayerBlock('③ 家长缘分 '+r.P.score, r.P.items) : '')
      + zmLayerBlock('④ 避凶底线 '+r.B.score, r.B.items)
      + '</div>';
    var scoreCls = r.total>=88?'score-high':'';
    return '<div class="zr-card '+(r.total>=88?'zr-hd':'')+'">'
      +'<div class="zr-rank">'+(i<3?'★':'')+'</div>'
      +'<div class="zr-date">'
      +'<div class="zr-sol">'+it.y+'年'+it.m+'月'+it.d+'日 '+ZERI.HOURS[it.hourIdx].z+'时（'+it.clockTime+'）'+(it.trueNote?(' <span>真太阳时 '+it.trueTime+'</span>'):'')+'</div>'
      +'<div class="zr-lun">农历'+it.lunarText+'　'+it.pillars.join(' ')+'</div>'
      +(diffHtml?'<div class="zr-diff">'+diffHtml+'</div>':'')
      +'</div>'
      +'<div class="zr-tags">'
      +'<span class="zr-tag">日主'+it.dayGan+'（'+it.dayWx+'）</span>'
      +'<span class="zr-tag">生肖'+it.zodiac+'</span>'
      +'<span class="zr-tag">'+(it.geName||'无')+(it.geLevel?('：'+it.geLevel):'')+'</span>'
      +'<span class="zr-tag">'+it.strength+'</span>'
      +'<span class="zr-tag">喜'+((it.xiWx||[]).join('')||'无')+'</span>'
      +'<span class="zr-tag">忌'+((it.jiWx||[]).join('')||'无')+'</span>'
      +'<span class="zr-tag">'+it.nayin+'（'+it.nayinWx+'）</span>'
      +'</div>'
      + layers + dy + gs + detail
      +'<div class="jz-verdict '+g.k+'">【'+g.t+'】'+g.d+'</div>'
      +'<div class="zr-score '+scoreCls+'">'+r.total+'</div>'
      +'</div>';
  }).join('');
  out.innerHTML='<h4 class="jz-h">造命排盘：综合判定（共 '+res.count+' 个候选：'+res.days+' 天 × '+ctx.hours.length+' 时辰）</h4>'
    +'<p class="sub-note">'+pInfo+'；'+(ctx.useTS?'已纳入各候选出生年的流年太岁（岁破、三煞）':'未纳入太岁避凶')+'。'+noPlaceNote+'</p>'
    +'<p class="sub-note zm-dis">择时为医生许可窗口内的优选参考，非逆天改命；早产与医学指征优先。本结果不构成医疗建议，分娩时机请以产科医生判断为准。</p>'
    +'<div class="zm-tabs">'
    +'<button type="button" class="zm-tab '+(ZM_VIEW==='rank'?'active':'')+'" onclick="zmSetView(\'rank\')">整体排名（前 30）</button>'
    +'<button type="button" class="zm-tab '+(ZM_VIEW==='day'?'active':'')+'" onclick="zmSetView(\'day\')">每日最优时辰</button>'
    +'</div>'
    +'<div class="zr-list">'+cards+'</div>';
}
