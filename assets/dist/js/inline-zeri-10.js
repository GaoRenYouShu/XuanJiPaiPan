
(function(){
  function syncZaozang(){
    var ev=(document.getElementById('event')||{}).value||'';
    var zao=['动土','安葬','破土','装修','修造','安门','上梁','竖柱'].indexOf(ev)>=0;
    var yin=['安葬','破土'].indexOf(ev)>=0;
    var map={shan:zao,laiLong:yin,fenJin:ev==='安葬',xmYear:ev==='安葬'};
    Object.keys(map).forEach(function(id){
      var el=document.getElementById(id); if(el) el.closest('.field').classList.toggle('field-off',!map[id]);
    });
  }
  document.addEventListener('DOMContentLoaded',function(){
    syncZaozang();
    var ev=document.getElementById('event'); if(ev) ev.addEventListener('change',syncZaozang);
    var sc=document.getElementById('zrSchool');
    if(sc) sc.addEventListener('change',function(){ document.querySelectorAll('[data-school]').forEach(function(el){ el.classList.toggle('field-off', sc.value!==el.getAttribute('data-school')); }); });
    if(sc) sc.dispatchEvent(new Event('change'));
    var shan=document.getElementById('shan');
    if(shan) shan.addEventListener('change',function(){
      if(!window.FENGSHUI) return;
      var v=shan.value, fj=document.getElementById('fenJin');
      if(v){ fj.innerHTML='<option value="">不辨分金</option>'+FENGSHUI.fenJin(v).map(function(x){return '<option value="'+x.gz+'">'+x.gz+'（'+x.wang+'）</option>';}).join(''); fj.setAttribute('data-shan',v); }
      else { fj.innerHTML='<option value="">不辨分金</option>'; fj.removeAttribute('data-shan'); }
    });
  });
})();
