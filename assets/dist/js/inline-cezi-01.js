/* 所在地三级下拉与境外两项：填充与取值走 latlng.js 的共享件；进页经共享归属地反查预填，
   定位成功才回写，用户手改后不再覆盖。太阳时缺省不校正，未定所在地不开校正。 */
function czInitRegion(){
  const pp=document.getElementById('czProv');
  if(!pp||typeof fillPlaceTrio!=='function') return;
  const cp=document.getElementById('czCity'), dp=document.getElementById('czDist');
  const tzSel=document.getElementById('czTz');
  if(tzSel&&typeof overseasTzOptions==='function') tzSel.innerHTML=overseasTzOptions();
  window.__czPlaceTrio=fillPlaceTrio(pp,cp,dp,function(){ czSyncOverseas(); });
  pp.addEventListener('change',czSyncOverseas);
  cp.addEventListener('change',czSyncOverseas);
  if(typeof placeIpPrefill==='function'){
    placeIpPrefill({manualKey:'cz_geo_manual', group:document.getElementById('czGeoGroup'), trio:window.__czPlaceTrio, onDone:czSyncOverseas});
  }
  czSyncOverseas();
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('cezi.html');
    czFillCat();
    czInitRegion();
    /* 日期与时刻一经改动即记用户设定：共享默认值轮询见标记即不再回写当下，
       表单快照据此在刷新时恢复所载时刻，起测锚点才落得回盘面 */
    ['czDate','czTime'].forEach(function(id){
      const el=document.getElementById(id); if(!el) return;
      ['input','change'].forEach(function(name){
        el.addEventListener(name,function(){ el.setAttribute('data-user-set','1'); });
      });
    });
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id && t.closest('#out')) xjSaveFold('czFoldState','#out details[id]');
    },true);
    (function initCz(){
      let restored=false;
      try{
        const saved=JSON.parse(localStorage.getItem('ceziForm')||'null');
        if(saved&&saved.czCat&&CEZI_DATA.CATS[saved.czCat]) document.getElementById('czCat').value=saved.czCat;
        if(saved&&saved.czChar){ document.getElementById('czChar').value=saved.czChar; restored=true; }
      }catch(e){}
      if(!restored) document.getElementById('czChar').value='玄';
    })();
    mountAI(function(){
      if(!LAST) return '';
      return CEZI_ENGINE.contextText(LAST)+'\n所问：'+document.getElementById('czCat').value;
    }, '测字', { share:{
      page:"cezi", title:"在线测字拆字",
      /* 起测时刻锚点取表单所载年月日时分：分享与导入带走的锚点即盘面实际所用的那一刻 */
      collect:function(){
        const d=xjShareCollect();
        const t=czClock();
        if(t&&t.date&&t.hm) d.xjAnchor=t.date+' '+t.hm;
        d.czChar=document.getElementById('czChar').value;
        d.czCat=document.getElementById('czCat').value;
        return d;
      },
      restore:function(d){
        d=d||{};
        xjShareRestore(d);
        const ch=(d.czChar||'').trim(); if(ch) document.getElementById('czChar').value=ch;
        const cat=(d.czCat&&CEZI_DATA.CATS[d.czCat])?d.czCat:'zong'; document.getElementById('czCat').value=cat;
        /* 三级下拉的级联不随逐项赋值重建，所载之地经共享件整组落位；
           时区与当地夏令时在落位之后重放，免被所载城市的自带偏移覆盖 */
        if(window.__czPlaceTrio) window.__czPlaceTrio.set(d.czProv,d.czCity,d.czDist);
        const tzEl=document.getElementById('czTz');
        if(tzEl){
          if(d.czTz){ tzEl.value=d.czTz; tzEl.dataset.lastCity=d.czCity||''; }
          else{ tzEl.dataset.lastCity=''; tzEl.value=''; }
        }
        const ld=document.getElementById('czLocalDst'); if(ld) ld.checked=d.czLocalDst==='1';
        czSyncOverseas();
        try{ localStorage.setItem('ceziForm',JSON.stringify({czChar:ch,czCat:cat})); }catch(e){}
      },
      recast:function(){ xjShareRecast(function(){ try{ draw(); }catch(e){} }); }
    } });
  }, 0);
});
