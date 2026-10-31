


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('lingqian.html');
    document.addEventListener('toggle', function(e){
      const t = e.target;
      if(t && t.tagName === 'DETAILS' && t.id && t.closest('#out')) xjSaveFold('lqFoldState','#out details[id]');
    }, true);
    fillSet();
    document.getElementById('lqSet').addEventListener('change',()=>{ const k=document.getElementById('lqSet').value; saveSel(); show(curSet().signs[0], k); });
    (function initLq(){
      let saved='三山国王灵签41签';
      try{ const v=localStorage.getItem(LQ_SEL_KEY); if(v && LQ_SETS[v]) saved=v; }catch(e){}
      document.getElementById('lqSet').value=saved;
    })();
    mountAI(function(){
      if(!LAST) return '';
      const q=document.getElementById('question').value;
      let s=`${LAST_SET||'三山国王灵签41签'}\n第${LAST.no}签（${LAST.lv||'未标吉凶'}${LAST.gu?' '+LAST.gu:''}）\n签诗：${LAST.shi.join('，')}\n`;
      if(LAST.jie) s+=`解曰：${LAST.jie}\n`;
      if(LAST.fen) s+='逐项：'+Object.keys(LAST.fen).map(k=>`${k}-${LAST.fen[k]}`).join('；');
      if(q) s+=`\n所求：${q}`;
      return s;
    }, '灵签', { share:{ page:"lingqian", title:"在线灵签求签",
      collect:function(){
        if(!LAST) return {};
        return {set:LAST_SET, no:LAST.no, q:(document.getElementById('question')||{}).value||''};
      },
      restore:function(d){
        if(!d||!d.set||!d.no) return;
        const sel=document.getElementById('lqSet'); if(sel) sel.value=d.set;
        const q=document.getElementById('question'); if(q&&d.q) q.value=d.q;
        const set=LQ_SETS[d.set]; if(!set) return;
        const sign=set.signs.find(x=>x.no===d.no);
        if(sign) show(sign, d.set);
      }
    } });
  }, 0);
});
