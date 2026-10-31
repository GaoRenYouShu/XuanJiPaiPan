


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('lenormand.html');
    if(/[#&]xj=/.test(location.hash||'')){
      try{
        const pg=(location.pathname.split('/').pop()||'index').replace(/\.html?$/,'')||'index';
        sessionStorage.removeItem('xj:form:'+pg);
        sessionStorage.removeItem('xj:scroll:'+pg);
      }catch(e){}
    };
    (function(){
      const LENO_GOOD=LENO_DECK.filter(c=>c.tone===1).map(c=>c.n);
      window.LENO_GOOD = LENO_GOOD;
    })();
    (function(){
      const LENO_BAD=LENO_DECK.filter(c=>c.tone===-1).map(c=>c.n);
      window.LENO_BAD = LENO_BAD;
    })();
    (function(){
      const POS={
      '1':[{pos:'指引',role:'guide',desc:'当前最该留意的讯息与指引'}],
      '3':[{pos:'情况',role:'state',desc:'当前境况与来由'},{pos:'发展',role:'future',desc:'事态推进的走向'},{pos:'结果',role:'result',desc:'收束之归宿'}],
      '5':[{pos:'过去',role:'past',desc:'已经过去的影响'},{pos:'现在',role:'state',desc:'你当下的处境'},{pos:'趋势',role:'future',desc:'顺流而下的走向'},{pos:'外因',role:'env',desc:'外部推动或牵制'},{pos:'结果',role:'result',desc:'最终落点'}],
      'rel':[{pos:'我',role:'self',desc:'你在关系中的状态与姿态'},{pos:'对方',role:'other',desc:'对方在关系中的状态与姿态'},{pos:'关系',role:'state',desc:'两人之间的连接与互动基调'},{pos:'阻碍',role:'block',desc:'关系当前的难点与功课'},{pos:'走向',role:'future',desc:'若维持现状关系可能的走向'}],
      '9':[{pos:'①',role:'past',desc:'事之来由（上排看大势）'},{pos:'②',role:'state',desc:'当下氛围'},{pos:'③',role:'future',desc:'大势所向'},{pos:'④',role:'past',desc:'当下根基（中排看当下）'},{pos:'⑤ 核心',role:'core',desc:'整局之焦点，读牌之纲'},{pos:'⑥',role:'future',desc:'当下去向'},{pos:'⑦',role:'past',desc:'收尾之底（下排看收尾）'},{pos:'⑧',role:'state',desc:'收尾之势'},{pos:'⑨',role:'result',desc:'收尾之归宿'}],
      'box':[{pos:'近况',role:'state',desc:'眼下的情形'},{pos:'进展',role:'future',desc:'正在推进之事'},{pos:'远因',role:'past',desc:'背后的远因'},{pos:'外缘',role:'env',desc:'外部的人与事'},{pos:'归宿',role:'result',desc:'此局最终归宿'},{pos:'转机',role:'guide',desc:'可借力的转机'},{pos:'阻力',role:'block',desc:'明显的阻力'},{pos:'基调',role:'state',desc:'整局的底色基调'}],
      'gt':Array.from({length:36},(_,i)=>({pos:'宫'+(i+1),role:GT_ZONE(i+1)==='过去'?'past':GT_ZONE(i+1)==='当下'?'state':'future',desc:'第'+(i+1)+'宫（'+LENO_HOUSE[i+1]+'）'}))
    };
      window.POS = POS;
    })();
    sigShow();
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') lnClose(); });
    mountAI(function(){
     if(!LAST) return '';
     const isGt=LAST.sp==='gt';
     let s=`雷诺曼占卜\n牌阵：${LAST.key}\n`;
     if(LAST.q) s+=`所问：${LAST.q}\n`;
     if(isGt){
      const sigNo=LAST.sig==='m'?28:29;
      s+=(LAST.sig==='auto'?'指标牌：未指定，默认以女人牌为问卜者、男人牌为对方。':'指标牌：'+(sigNo===28?'男人':'女人')+'牌为问卜者。')+'\n';
      LAST.picks.forEach(p=>{ s+=`宫${p.house}（${LENO_HOUSE[p.house]}）：${p.card.no}.${p.card.n}［${p.card.kw.join('/')}，${LENO_TONE(p.card)}］\n`; });
      const sigP=LAST.picks[sigNo-1];
      s+=`\n指标牌落于宫${sigP.house}（${LENO_HOUSE[sigP.house]}）；四角：`+GT_CORNERS.map(([h,l])=>l+'='+LAST.picks[h-1].card.n).join('、')+'；中央四宫：'+GT_CENTER.map(h=>LAST.picks[h-1].card.n).join('、')+'；首尾呼应：宫1 '+LAST.picks[0].card.n+' 与宫36 '+LAST.picks[35].card.n+' 相扣。'+(()=>{const own=LAST.picks.filter(p=>p.card.no===p.house).map(p=>p.card.no+'.'+p.card.n);return own.length?('同宫强化（牌落本宫、义气加倍）：'+own.join('、')+'。'):'无牌落本宫。';})()+'\n请按大全景读法（四角、中央、指标牌宫位四邻马步、同宫强化、镜像、首尾、时区）综合成文。';
     }else{
      LAST.picks.forEach(p=>{ const c=p.card;
       s+=`【${p.pos}】${c.no}.${c.n}（${LENO_TONE(c)}，扑克${c.pc}）：${c.up}\n关键词：${c.kw.join('/')}；时间：${c.time}\n所象之人：${c.person}；所主之事：${c.area}；行动指引：${c.advice}\n合断：${comboLine(p)}\n`; });
      const pairs=[];
      if(LAST.sp==='9'){
       const g=i=>LAST.picks[i].card;
       pairs.push(lenoPair(g(0),g(4)),lenoPair(g(4),g(8)),lenoPair(g(2),g(4)),lenoPair(g(4),g(6)));
      }else if(LAST.sp==='box'){
       const m=(a,b)=>lenoPair(LAST.picks[a].card,LAST.picks[b].card);
       pairs.push(m(0,7),m(1,6),m(2,5),m(3,4));
      }else{
       for(let i=0;i<LAST.picks.length-1;i++) pairs.push(lenoPair(LAST.picks[i].card,LAST.picks[i+1].card));
      }
      const keyCard=keyPick(LAST.picks,LAST.sp).card;
      s+=`\n组合成句：${pairs.join('；')}\n关键位：${keyCard.n}（${LENO_TONE(keyCard)}）。请按雷诺曼直白语法组合解读，给出整体判断。`;
     }
     return s;
    }, '雷诺曼卡', { share:{ page:"lenormand", title:"雷诺曼卡在线占卜",
     collect:function(){
       if(!LAST) return {};
       return {sp:LAST.sp,q:LAST.q||'',sig:LAST.sig||'f',picks:LAST.picks.map(p=>p.card.no)};
     },
     restore:function(d){
       if(!d||!d.sp||!Array.isArray(d.picks)) return;
       const fire=el=>{ try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){} };
       const sel=document.getElementById('spread'); if(sel&&sel.value!==String(d.sp)){ sel.value=d.sp; fire(sel); }
       sigShow();
       const sigSel=document.getElementById('sig'); if(sigSel&&d.sig&&sigSel.value!==String(d.sig)){ sigSel.value=d.sig; fire(sigSel); }
       const q=document.getElementById('question'); if(q&&d.q&&q.value!==d.q){ q.value=d.q; fire(q); }
       const layout=POS[d.sp]; if(!layout) return;
       const byNo={}; LENO_DECK.forEach(c=>byNo[c.no]=c);
       const picks=d.picks.map((no,i)=>byNo[no]?({card:byNo[no],pos:layout[i]?layout[i].pos:'位'+(i+1),desc:layout[i]?layout[i].desc:'',role:layout[i]?(layout[i].role||'state'):'state',cls:layout[i]?(layout[i].cls||''):'',house:d.sp==='gt'?(i+1):0}):null).filter(Boolean);
       if(!picks.length) return;
       LAST={q:d.q||'',sp:d.sp,key:document.getElementById('spread').selectedOptions[0].text,sig:(sigSel&&sigSel.value)||'f',picks:null};
       renderSpread(picks,d.sp);
     }
    } });
  }, 0);
});
