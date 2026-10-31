


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('ziwei.html');
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id && t.closest('#out')) xjSaveModState(ZW_MOD_KEY,'#out details[id]','__zwInitDone');
    },true);
    /* 出生地默认停在未知地：起首若是某地，未动过表单的盘便按该地折过一道，校正量的来历盘上不著一字。
       主盘与第二人两组下拉各自独立，共 fillPlaceTrio 同一份填充与取值。 */
    (function initZwBirth(){
      const sp=document.getElementById('zProv'); if(!sp||typeof provList!=='function') return;
      const sc=document.getElementById('zCity'), sd=document.getElementById('zDist');
      window.__zwPlaceTrio=fillPlaceTrio(sp, sc, sd, zwSyncOverseas);
    })();
    (function initZwFBirth(){
      const sp=document.getElementById('zFProv'); if(!sp||typeof provList!=='function') return;
      const sc=document.getElementById('zFCity'), sd=document.getElementById('zFDist');
      fillPlaceTrio(sp, sc, sd, zwSyncFOverseas);
      const tzF=document.getElementById('zFTz'), tz0=document.getElementById('zTz');
      if(tzF&&tz0) tzF.innerHTML=tz0.innerHTML;
      zwSyncFOverseas();
      /* 第二人性别默认取主表单性别的相异项（男盘默认女、女盘默认男）；用户手动改过第二人性别时不覆盖 */
      const fse=document.getElementById('zFSex');
      if(fse){
        let fsexTouched=false;
        fse.addEventListener('change',function(){ fsexTouched=true; });
        const syncFSex=()=>{ const sv=document.getElementById('zSex'); if(!fsexTouched&&sv) fse.value=(sv.value==='男')?'女':'男'; };
        const se0=document.getElementById('zSex');
        if(se0){ se0.addEventListener('change',syncFSex); syncFSex(); }
      }
    })();
    window.addEventListener('resize', ()=>zwDrawLinks(document.querySelector('.zw-focused')?.dataset?.name));
    zwFillGZSelects();
    zwRestoreMode();
    (function(){
      const p=new URLSearchParams(window.location.search);
      if(p.get('fromBazi')!=='1'){ return; }
      const d=p.get('bDate'), t=p.get('bTime'), s=p.get('sex');
      const de=document.getElementById('zDate'), te=document.getElementById('zTime'), se=document.getElementById('zSex');
      if(de&&d) de.value=d;
      if(te&&t) te.value=t;
      if(se&&s) se.value=(s==='女')?'女':'男';
      const lngEl=document.getElementById('zLng');
      if(window.__zwPlaceTrio) window.__zwPlaceTrio.set(p.get('bProv'), p.get('bCity'), p.get('bDist'));
      if(lngEl&&p.get('bLng')) lngEl.value=p.get('bLng');
      /* 太阳时口径随八字页下发值走，两页才不会一校正一不校正而结论对不上；
         旧链只带布尔 bTrue 时按它派生（off 之外皆为启用）。夏令时与子时八字页未下发，留本页默认。 */
      const sunEl=document.getElementById('zSun');
      if(sunEl&&p.get('bSun')) sunEl.value=p.get('bSun');
      else if(sunEl&&p.get('bTrue')) sunEl.value=(p.get('bTrue')==='1')?'true':'off';
    })();
    mountAI(function(){ return __zw||''; }, '紫微斗数', { share:{ page:"ziwei", title:"紫微斗数在线排盘", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ paipan(); }); } } });
    (function(){
      const apply=zwRelToggle;
      if(document.readyState==='complete') setTimeout(apply,0);
      else document.addEventListener('DOMContentLoaded',function(){ setTimeout(apply,0); });
    })();;
  }, 0);
});
