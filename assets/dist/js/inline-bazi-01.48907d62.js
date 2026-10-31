


/* 默认态即页面终值：日期框、时辰、性别与出生地取值已写在静态页内。
   data-built 记生成当日，访问日与所记不同只改日期框的值，表单结构不动。 */
function initDefault(){
  const pad=function(x){return String(x).padStart(2,'0');};
  const n=new Date();
  const key=n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate());
  const field=document.getElementById('fDate');
  const date=document.getElementById('bDate');
  if(!field||!date) return;
  if(field.getAttribute('data-built')!==key) date.value=key;
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    initDefault();
    if(!document.querySelector('#linkList .link-item')) renderLinkCards();
    if(typeof bindCelebInput==='function') bindCelebInput();
    /* 历史出生年份口径提示：日期、农历年与输入方式三处变化即重判显隐，初次进入也判一次 */
    ['bDate','bLunarY','bMode'].forEach(function(id){
      var el=document.getElementById(id); if(!el) return;
      el.addEventListener('change', eraTimeNote);
      el.addEventListener('input', eraTimeNote);
    });
    eraTimeNote();
    /* 境外出生地两项与口径说明：初次进入按已恢复的出生地同步一次 */
    if(typeof syncOverseasUi==='function') syncOverseasUi();
    try{ document.addEventListener('toggle', e=>{ const t=e.target; if(t && t.classList && t.classList.contains('zr-mod') && t.open){ const host=t.closest('#mod-yiti')||t; _scheduleYitiAlign(host); } }, true); }catch(e){};
    (function(){
      if(window._alignYitiBound) return; window._alignYitiBound = true;
      var _t=null;
      window.addEventListener('resize', ()=>{
        clearTimeout(_t);
        _t = setTimeout(()=>{
          try{
            const sec=document.getElementById('mod-yiti');
            if(typeof layoutYitiTables==='function') layoutYitiTables(sec||document);
            if(typeof alignLblCols==='function') alignLblCols(document);
          }catch(e){}
        }, 150);
      });
    })();
    /* 重排入口先挂出，再挂附加功能面板：分享还原在挂载时即可回调本页 go。 */
    window.baziRecast = go;
    if (window.baziMountAI) window.baziMountAI();
  }, 0);
});
