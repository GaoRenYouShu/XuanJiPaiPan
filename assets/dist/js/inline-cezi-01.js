


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('cezi.html');
    czFillCat();
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
      collect:function(){
        const t=czNow();
        return { czChar:document.getElementById('czChar').value, czCat:document.getElementById('czCat').value, __date:t.date, __hm:t.hm };
      },
      restore:function(d){
        d=d||{};
        const ch=(d.czChar||'').trim(); if(!ch) return;
        document.getElementById('czChar').value=ch;
        const cat=(d.czCat&&CEZI_DATA.CATS[d.czCat])?d.czCat:'zong';
        document.getElementById('czCat').value=cat;
        try{ localStorage.setItem('ceziForm',JSON.stringify({czChar:ch,czCat:cat})); }catch(e){}
      },
      /* 刷新重出：全站顶层机制回填输入后按此钩子重绘，无字则不动 */
      recast:function(){
        const ch=(document.getElementById('czChar').value||'').trim();
        if(!ch) return;
        try{ draw(); }catch(e){}
      }
    } });
  }, 0);
});
