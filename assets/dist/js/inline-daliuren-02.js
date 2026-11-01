
function dlFmtClock(y,mo,d,h,mi){ return y+'年'+mo+'月'+d+'日 '+pad2(h)+':'+pad2(mi); }
/* 所在地经度：手动经度优先，其次省市区三级经度真源；两处皆未定返回空，不按他地兜底 */
function dlBirthLng(){
  return typeof xjLocalLng==='function'?xjLocalLng('dlLng','dlProv','dlCity','dlDist'):null;
}
function dlTimeOpts(){
  if(typeof placeTimeOptsOf==='function') return placeTimeOptsOf({prov:'dlProv',city:'dlCity',lng:'dlLng',tz:'dlTzOff',dst:'dlLocalDst'});
  return {overseas:false,baseLng:120,localDst:false,lng:null};
}
/* 境外所在地：选到境外城市时挂出时区与当地夏令时，显隐与文案由共享件 syncOverseasFields 一处判 */
function dlSyncOverseas(){
  if(typeof syncOverseasFields==='function'){
    syncOverseasFields({prov:'dlProv',city:'dlCity',lng:'dlLng',tz:'dlTzOff',dst:'dlLocalDst',
      tzField:'dlTzOffField',dstField:'dlLocalDstField',note:'dlOverseasNote',chinaDstField:'dlDstField'},{chinaDst:true});
  }
}
function dlOverseasChange(){ dlSyncOverseas(); }
/* 日期与时刻在离框时即校验，不等到起课才报；起课仍按同一判据再核一次 */
function dlCheckDateTime(){
  const line=document.getElementById('infoLine');
  const dv=document.getElementById('dInput').value;
  if(dv){
    const y=Number(String(dv).split('-')[0]);
    if(!(Number.isFinite(y)&&y>=1&&y<=9999)){ line.textContent='年份不合，请按 2026-10-31 填写。'; return false; }
    if(!xjValidDate(dv)){ line.textContent='日期不存在，请核对年月日。'; return false; }
  }
  const tv=document.getElementById('dTime').value;
  if(tv){
    const [h,mi]=tv.split(':').map(Number);
    if(!(h>=0&&h<=23&&mi>=0&&mi<=59)){ line.textContent='时刻格式不合，请按 14:30 填写。'; return false; }
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('daliuren.html');
    fillDlSchool();
    dlrApplySchoolPreset();
    const tEl=document.getElementById('dTime');
    if(tEl&&!tEl.value){ const n=new Date(); tEl.value=pad2(n.getHours())+':'+pad2(n.getMinutes()); }
    const tzSel=document.getElementById('dlTzOff');
    if(tzSel&&typeof overseasTzOptions==='function') tzSel.innerHTML=overseasTzOptions();
    if(typeof fillPlaceTrio==='function'){
      window.__dlPlaceTrio=fillPlaceTrio(document.getElementById('dlProv'),document.getElementById('dlCity'),document.getElementById('dlDist'),function(){ dlSyncOverseas(); });
      if(typeof placeIpPrefill==='function'){
        placeIpPrefill({manualKey:'dl_geo_manual', group:document.getElementById('dlBirthGroup'), trio:window.__dlPlaceTrio, onDone:dlSyncOverseas});
      }
    }
    dlSyncOverseas();
    document.getElementById('dlSchool').addEventListener('change', function(){ dlrApplySchoolPreset(); });
    ['dInput','dTime'].forEach(function(id){
      const el=document.getElementById(id); if(el) el.addEventListener('blur', dlCheckDateTime);
    });
    document.addEventListener('toggle', function(e){
      const t = e.target;
      if(t && t.tagName === 'DETAILS' && t.id && t.closest('#out')) xjSaveModState('dlrModState','#out details[id]','__dlrInitDone');
    }, true);
    document.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){
        const h=e.target.closest?e.target.closest('.mod-head'):null;
        if(h){ e.preventDefault(); h.click(); }
      }
    });
    window.__dlrInitDone=true;
    mountAI(function(){
      if(!LAST||!LAST.tian) return '';
      const sk=LAST.school, o=LAST.o||{};
      let td='天地盘（天盘=月将加时，地盘=十二支本位）：\n';
      ZHI.forEach(dz=>{
        const tp=LAST.tian[ZHI.indexOf(dz)];
        const jn=LAST.jiangOnTian[tp]||'';
        td+=`${dz}（地） → ${tp}（天）${jn?' 、天将'+jn:''}\n`;
      });
      const keStr=LAST.ke.map(k=>`${k.lbl}：${k.u}（天）、${k.d}（地）`).join('\n');
      const c=LAST.chuan;
      const tj=z=>LAST.jiangOnTian[z]||'';
      const wx=z=>ZHI_WX[z]||'';
      const chuan=`三传（${c.method}）：\n初传 ${c.chu} ${tj(c.chu)}（${wx(c.chu)}）\n中传 ${c.zhong} ${tj(c.zhong)}（${wx(c.zhong)}）\n末传 ${c.mo} ${tj(c.mo)}（${wx(c.mo)}）`;
      const dun=LAST.o&&LAST.o.dun?`\n三传遁干：初传 ${LAST.o.dun.chu}、中传 ${LAST.o.dun.zhong}、末传 ${LAST.o.dun.mo}`:'';
      const read = LAST.o ? baihua(LAST.o).replace(/<br>/g,'\n').replace(/<\/p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,'') : '';
      const sha=LAST.o&&LAST.o.sha?`\n神煞：驿马${LAST.o.sha.yima||'-'}，天马${LAST.o.sha.tianma||'-'}，天喜${LAST.o.sha.tianxi||'-'}，天医${LAST.o.sha.tianyi||'-'}，劫煞${LAST.o.sha.jiesha||'-'}，灾煞${LAST.o.sha.zaisha||'-'}，亡神${LAST.o.sha.wangshen||'-'}，破碎${LAST.o.sha.posui||'-'}`:'';
      const benLine = (LAST.o&&LAST.o.benMing&&LAST.o.xingNian)?`\n本命：${LAST.o.benMing.gan}${LAST.o.benMing.zhi}、${LAST.o.sex}、虚岁${LAST.o.xingNian.age}、行年${LAST.o.xingNian.zhi}`:'';
      const timeLine = (o.timeNote||o.clockTxt) ? `\n时间折算：${o.clockTxt||''}${o.timeNote?'；'+o.timeNote:''}` : '';
      return `大六壬起课（流派：${sk}）\n日干支：${LAST.dgz}　占时：${LAST.shiZhi}　月将：${LAST.jiang}（${JIANG_NAME[ZHI.indexOf(LAST.jiang)]||''}，${o.jiangKey||''}）\n起贵口诀：${o.guiMode||''}　昼夜分界：${o.dayKey||''}（贵人${LAST.guiZhi}，${LAST.day?'昼占阳贵':'夜占阴贵'}；贵人临地盘${ZHI[o.guiDiIdx]||''}位，天将${LAST.o&&LAST.o.shun?'顺':'逆'}布）\n发用法则：${o.faYong==='shehai'?'涉害优先':'贼克比用'}${timeLine}\n${td}\n四课：\n${keStr}\n${chuan}${dun}${benLine}${sha}\n\n【综合判断】\n${read}`;
    }, '大六壬', { share:{ page:"daliuren", title:"大六壬在线排盘", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ try{ query(); }catch(e){} }); } } });
  }, 0);
});
