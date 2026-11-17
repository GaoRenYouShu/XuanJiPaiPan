
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    var el=document.getElementById('calReverse');
    if(!el || !window.XJ_CAL_REVERSE) return;
    window._zlReverse=XJ_CAL_REVERSE.mount({
      el:el, kind:'tibetan', yearLabel:'藏历年',
      schoolEl:document.getElementById('schoolSel'),
      getSchool:function(){ return document.getElementById('schoolSel').value; },
      getCurrent:function(){
        var v=document.getElementById('dInput').value;
        var p=v?v.split('-').map(Number):[];
        if(!p[0]){ var t=xjNowDate(); p=[t.getFullYear(),t.getMonth()+1,t.getDate()]; }
        return {y:p[0],m:p[1],d:p[2]};
      },
      onPick:function(date){ jumpToDate(date); }
    });
  }, 0);
});
