
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    var el=document.getElementById("calReverse");
    if(!el || !window.XJ_CAL_REVERSE) return;
    XJ_CAL_REVERSE.mount({
      el:el, kind:"lunar", offset:0, yearLabel:"农历年",
      getCurrent:function(){
        var v=document.getElementById("dInput").value;
        var p=v?v.split("-").map(Number):[];
        if(!p[0]){ var t=xjNowDate(); p=[t.getFullYear(),t.getMonth()+1,t.getDate()]; }
        return {y:p[0],m:p[1],d:p[2]};
      },
      onPick:function(date){ var i=document.getElementById("dInput"); if(i)i.value=date; query(); }
    });
  },0);
});

/* 从梅花等页带入日期（?date=YYYY-MM-DD）：写入日期框并出当日盘，标记 data-keep 免被当下同步覆盖 */
function initDateFromQuery(){
  var p=new URLSearchParams(location.search);
  var dt=p.get('date');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dt||'')) return;
  var el=document.getElementById('dInput');
  if(!el) return;
  el.value=dt;
  el.setAttribute('data-keep','1');
  try{ query(); }catch(e){}
}
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(initDateFromQuery, 50);
});
