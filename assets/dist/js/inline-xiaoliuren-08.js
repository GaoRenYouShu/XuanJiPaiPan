


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('xiaoliuren.html');
    fillSchool();
    fillShichen();
    renderRef();
    xjApplyFold('xlrFoldState','details[id]');
    switchQiMode();
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) xjSaveFold('xlrFoldState','details[id]');
    },true);
    setNow();
    mountAI(function(){
      if(!LAST) return '';
      const fg=GONG[LAST.gTime];
      const sch=LAST.schId?SCHOOLS.find(s=>s.id===LAST.schId):null;
      const aiFour=(LAST.gFour!==null&&LAST.gFour!==undefined)?('\n占事盘：'+GONG[LAST.gFour].n+'（'+GONG[LAST.gFour].luck+'）'):'';
      const aiMath='\n起课数理（算法）：月'+LAST.lm+'、日'+LAST.ld+'、时'+LAST.shi+'（序号 1 大安 … 6 空亡循环）。月宫='+GONG[LAST.gMonth].n+'，日宫='+GONG[LAST.gDay].n+'，时宫='+fg.n+(LAST.gFour!==null&&LAST.gFour!==undefined?('，占事盘='+GONG[LAST.gFour].n):'')+'。';
      return `小六壬起课（${sch?sch.name:''}）\n农历：${LAST.lunarStr}（月${LAST.lm}日${LAST.ld}时${LAST.shi}）\n月宫：${GONG[LAST.gMonth].n}\n日宫：${GONG[LAST.gDay].n}\n时宫（结果）：${fg.n}（${fg.luck}）${aiFour}\n六神：${fg.sx}　五行：${fg.wx}　方位：${fg.fx}　主数：${GONG_NUM[fg.n]}　颜色：${GONG_COLOR[fg.n]}\n断语：${fg.duan}\n白话提要：${fg.brief}${aiMath}`;
    }, '小六壬', { share:{ page:"xiaoliuren", title:"小六壬在线掐算",
      collect:function(){
        const d={m:document.getElementById('qiMode').value};
        ['dInput','shichen','qNum1','qNum2','qNum3','qChar','school'].forEach(function(id){ const el=document.getElementById(id); if(el) d[id]=el.value; });
        return d;
      },
      restore:function(d){
        if(!d||!d.m) return;
        Object.keys(d).forEach(function(k){
          if(k==='m') return;
          const el=document.getElementById(k); if(el) el.value=d[k];
        });
        const m=document.getElementById('qiMode'); if(m){ m.value=d.m; }
        try{ switchQiMode(); }catch(e){}
      },
      /* 刷新重出：全站顶层机制回填输入后按此钩子起重课 */
      recast:function(){ try{ query(); }catch(e){} }
    } });
  }, 0);
});
