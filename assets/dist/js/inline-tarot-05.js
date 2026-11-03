


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('tarot.html');
    /* 刷新钩子由本页抽牌按钮承担。 */
    window.xjRefreshHook=function(){ };
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') trClose(); });
    mountAI(function(){
     if(!LAST) return '';
     let s=`塔罗占卜\n牌阵：${LAST.sp}\n`;
     if(LAST.q) s+=`所问：${LAST.q}\n`;
     let upN=0,revN=0;
     LAST.picks.forEach(p=>{
       const c=p.card,up=!p.rev;
       if(p.rev)revN++;else upN++;
       s+=`【${p.pos}】${c.name}（${up?'正位':'逆位'}）：${up?c.up:c.rev}\n关键词：${(up?c.kw:c.kwr).join('/')}；占星：${c.astro}；时间：${up?c.time:(c.timeR||c.time)}\n恋爱：${up?c.love:c.loveR}；事业：${up?c.work:c.workR}；财运：${up?c.wealth:c.wealthR}；健康：${up?c.health:c.healthR}\n合断：${comboLine(p)}\n`;
     });
     const tone = upN>revN?'正位居多，能量顺畅、事态向好，宜顺势而为。':revN>upN?'逆位居多，提示受阻、宜先梳理卡点再行动。':'正逆参半，须转化逆位提醒为正向行动。';
     const dg=[],pk=LAST.picks;
     const adj=ADJ[LAST.key]||pk.map((_,i)=>i).slice(0,-1).map(i=>[i,i+1]);
     adj.forEach(([i,j])=>{
       const a=pk[i].card.el,b=pk[j].card.el; if(!a||!b) return;
       const r=elRel(a,b); if(r[0]!=='中') dg.push(`${pk[i].pos}×${pk[j].pos}(${a}×${b})${r[1]}`);
     });
     const dom=domLines(pk),lack=lackLines(pk),tri=triadLines(pk,TRI_IDX[LAST.key]),echo=echoLines(pk,LAST.key);
     const elPat=[...dom,...lack];
     s+=`\n综合：正位 ${upN} 张、逆位 ${revN} 张，${tone}${dg.length?(' 元素互动：'+dg.join('；')):''}${elPat.length?(' 元素格局：'+elPat.join('；')):''}${tri.length?(' 三牌连判：'+tri.join('；')):''}${echo.length?(' 跨位呼应：'+echo.join('；')):''}`;
     return s;
    }, '塔罗牌', { share:{ page:"tarot", title:"在线塔罗牌占卜",
     collect:function(){
       if(!LAST) return {};
       return {sp:LAST.key,q:LAST.q||'',picks:LAST.picks.map(p=>({id:p.card.id,rev:p.rev?'1':'0'}))};
     },
     restore:function(d){ tarotRestore(d); }
    } });
  }, 0);
});
