
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
