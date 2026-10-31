
/* 折叠态属交互态：页体折叠块的开合由本页记忆，键按页独立，localStorage 主存、sessionStorage 隐私兜底 */


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) xjSaveFold('xxFoldState','details[id]');
    },true);
    renderChrome('xingxiu.html');
    xjApplyFold('xxFoldState','details[id]');
  }, 0);
});

/* 模块折叠：与八字、河洛页同名同实现，切换 .collapsed 由共用样式开合与悬停。 */
function toggleMod(id){ var el=document.getElementById(id); if(el) el.classList.toggle('collapsed'); }
