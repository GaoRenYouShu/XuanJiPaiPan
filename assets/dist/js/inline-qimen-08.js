/* 默认日期与时间随页面一同写出，即首屏终值；
   日期与时辰初值由全站统一函数在首绘前写入。 */

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('qimen.html');
    document.addEventListener('toggle', function(e){
      const t = e.target;
      if(t && t.tagName === 'DETAILS' && t.id) xjSaveModState('qmModState','details[id]','__qmInitDone');
    }, true);
    document.addEventListener('click',function(e){
      const cell=e.target.closest?e.target.closest('.qi-cell'):null;
      if(cell&&cell.getAttribute('data-g')){ const g=cell.getAttribute('data-g'); highlightGong(g); showGongDetail(g); }
    });
    document.addEventListener('keydown',function(e){
      if((e.key==='Enter'||e.key===' ')){
        const t=e.target;
        if(t&&t.classList&&t.classList.contains('qi-cell')&&t.getAttribute('data-g')){ e.preventDefault(); const g=t.getAttribute('data-g'); highlightGong(g); showGongDetail(g); }
      }
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){
        const h=e.target.closest?e.target.closest('.mod-head'):null;
        if(h){ e.preventDefault(); h.click(); }
      }
    });
    if(Qimen&&Qimen.SHAN_ORDER){ fillShan(); };
    qFamilyChange();
    const tzSel=document.getElementById('qmTzOff');
    if(tzSel&&typeof overseasTzOptions==='function') tzSel.innerHTML=overseasTzOptions();
    if(typeof fillPlaceTrio==='function'){
      fillPlaceTrio(document.getElementById('qmProv'),document.getElementById('qmCity'),document.getElementById('qmDist'),function(){ qmSyncOverseas(); });
    }
    qmSyncOverseas();
    qmRestoreSnapshotBeforeRender();
    mountAI(function(){ return __qm||''; }, '奇门遁甲', {
      systemPrompt: QIMEN_AI_PROMPT,
      temperature: 0.3,
      schools: QIMEN_AI_SCHOOLS,
      schoolLabel: '断局流派',
      schoolClosing: '每派段末写明本派判名、得分与关键证据，证据须带出处，不混入他派口径。',
      schoolSummary: '五派成段后另起一段总收，先列共识、再列分歧，并写明主判、次判与取用；不得把五派混成一句。',
      share:{ page:"qimen", title:"奇门遁甲在线排盘", recast:function(){ try{ paiju(); }catch(e){} } }
    });
  }, 0);
});
