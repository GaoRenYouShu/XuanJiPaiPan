


/* 结果区默认留空，点起盘才出盘；盘成之后改日期、时辰与流派即时重算。 */

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('tieban.html');
    renderTermGloss();
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) xjSaveFold('tbFoldState','details[id]');
    },true);
    window.addEventListener('resize', ()=>{ clearTimeout(_citeT); _citeT = setTimeout(fitCiteCols, 150); });
    document.getElementById('bLng').addEventListener('change', ()=>{ if(LAST && readSunMode()!=='off') query(); });
    document.getElementById('sexInput').addEventListener('change', ()=>{ if(LAST) query(); });
    ['ziInput','sunInput','dstInput','yearInput','qyInput'].forEach(id=>{
      document.getElementById(id).addEventListener('change', ()=>{ if(LAST) query(); });
    });
    document.getElementById('kInput').addEventListener('change', ()=>{ ADOPT=null; if(LAST) query(); });
    document.getElementById('fInput').addEventListener('change', ()=>{ ADOPT=null; if(LAST) query(); });
    document.getElementById('dInput').addEventListener('change', ()=>{ ADOPT=null; if(LAST) query(); });
    buildPlace();
    rebuildKeOptions();
    rebuildFengOptions();
    loadAns();
    applyLinkParams();
    xjApplyFold('tbFoldState','details[id]');
    mountAI(function(){
      if(!LAST) return '';
      const R = LAST;
      const pick = (cid) => { const t = Tieban.pickText(cid, R.H, keyFor(cid), 1); return t ? (t.catName+'：'+t.t+'，'+t.b) : ''; };
      const dyLines = (R.dayun&&R.dayun.steps?R.dayun.steps.map(s=>{
        const tx = Tieban.pickStepText('dayun', s.gz, s.startYear, 1, {age: s.startAge});
        return s.gz+' 运 '+s.startAge+'-'+s.endAge+' 岁：'+(tx?(tx.t+'，'+tx.b):'');
      }).join('\n'):'');
      const thisYear = xjNowDate().getFullYear();
      const lnLines = (()=>{ let out=[]; for(let i=0;i<8;i++){ const y=thisYear+i; const gz=Solar.fromYmd(y,6,1).getLunar().getYearInGanZhi(); const tx=Tieban.pickStepText('liunian', gz, y, 1, {age: y-R.Y+1, birthGZ: R.yearGZ}); out.push(y+' 年 '+gz+'：'+(tx?(tx.t+'，'+tx.b):'')); } return out.join('\n'); })();
      return `铁板神数推演
    【出生与四柱】公历 ${R.Y}-${pad2(R.M)}-${pad2(R.D)} ${pad2(R.h)}:${pad2(R.mi)}　${R.zhiName}${R.keName}（${R.keRange}）　分金：${FENG_NAMES[R.feng]}
    钟面所取：${R.clockZhiName}${R.clockKeName}（${R.clockRange}）${R.clockFeng!==R.feng?('，分金 '+FENG_NAMES[R.clockFeng]):''}
    四柱：${R.pillars.map(p=>p.gz).join(' ')}
    纳音：${R.pillars.map(p=>p.nayin).join('、')}
    时刻口径：太阳时 ${R.sunMode==='true'?'真太阳时':(R.sunMode==='mean'?'平太阳时':'不校正')}；夏令时 ${R.dstApplied?'已折回一小时':'未折算'}；子时 ${R.ziMode==='early'?'早子时':'晚子时'}；年界 ${R.yearAxis==='chunjie'?'春节换年':(R.yearAxis==='dongzhi'?'冬至换年':'立春换年')}；起运 ${R.dayun&&R.dayun.sect===2?'分钟折算':'时辰折算'}
    ${R.ziNote?('子时口径：'+R.ziNote+'。'):''}${R.dstNote?('夏令时口径：'+R.dstNote+'。'):''}${R.yearNote?('年界口径：'+R.yearNote+'。'):''}${R.usedTrue?'太阳时校正：按出生地经度 '+R.lng+' 校正 '+R.adj+' 分钟（均时差 '+R.adjE+'、经度差 '+R.adjLng+'），校正后 '+pad2(R.h)+':'+pad2(R.mi)+'，实际归属 '+R.zhiName+R.keName+'。':'未作太阳时校正。'}
    【化数与皇极总数】太玄数逐柱：${R.pillars.map(p=>p.gz.charAt(0)+'='+p.txGan+'、'+p.gz.charAt(1)+'='+p.txZhi).join('；')}
    天干和 ${R.ganSum}、地支和 ${R.zhiSum}、化数总数 ${R.total}；刻分序 ${R.keSeq}（${R.zhiName}${R.keName}${FENG_NAMES[R.feng]}，刻序 ${R.ke} 乘十五加分金序 ${R.feng}）；刻分修正数 ${R.keFix}；皇极总数 ${R.H}
    【河洛理数】${(()=>{ if(typeof guaName!=='function'||!window.TIEBAN_HEGU) return '不可用'; const HL=Tieban.heLuoPan(R.ganSum,R.zhiSum); const sn=XT2NAME[HL.xianShang], xn=XT2NAME[HL.xianXia]; const gn=guaName(sn,xn); const b6=TRIGRAMS[xn].bits.concat(TRIGRAMS[sn].bits); const pi=typeof palaceInfo==='function'?palaceInfo(b6):null; const hg=window.TIEBAN_HEGU.gua[gn]||{c:'',b:''}; const ci=guaCiOf(gn); const yTie=(R.H%6)||6; const yt=(typeof YAO_CI==='object')?(YAO_CI[gn+YAO_POS[yTie-1]]||''):''; const b2=b6.slice(); b2[HL.dong-1]=b2[HL.dong-1]?0:1; const gn2=guaName(trigramName(b2.slice(3,6)),trigramName(b2.slice(0,3))); const bT=b6.slice(); bT[yTie-1]=bT[yTie-1]?0:1; const gTie=guaName(trigramName(bT.slice(3,6)),trigramName(bT.slice(0,3))); return '天数 '+HL.tian+'、地数 '+HL.di+'；先天卦 '+sn+'上'+xn+'下，得'+gn+'（'+ci+'）'+(hg.b?('；'+hg.b):'')+'；铁板元堂：皇极总数 '+R.H+' 除六取余在'+YAO_NAME[yTie-1]+'，爻辞：'+(yt||'缺')+'，动而变之得'+gTie+'；梅花参考动爻在'+YAO_NAME[HL.dong-1]+'，变卦'+gn2+'；'+(pi?(pi.palace+'、'+pi.type+'卦、世'+pi.world+'应'+pi.ying+'；'):'')+'洛书数：上'+HL.ls+'、下'+HL.lx;})()}
    【六亲答卷】父母：${ANS.fumu?Tieban.FUMU_LABEL[ANS.fumu]:'未答'}；手足：${ANS.sib!=null?(ANS.sib+' 人'):'未答'}；婚姻：${ANS.marry?Tieban.MARRY_LABEL[ANS.marry]:'未答'}；子女参考：${ANS.child!=null?Tieban.CHILD_LABEL[Math.min(5,Math.max(0,ANS.child))]:'未答'}
    【考刻】${(()=>{const k=(ANS.fumu!=null&&ANS.sib!=null&&ANS.marry!=null)?Tieban.locateKe(Tieban.FUMU_KEYS.indexOf(ANS.fumu),ANS.sib,Tieban.MARRY_KEYS.indexOf(ANS.marry)):null; if(k==null) return '三主问未答齐，未定位正刻'; return '考得正刻 '+R.clockZhiName+Tieban.KE_NAMES[k]+'（考刻数定位）'+(ADOPT!=null&&ADOPT===k?'，已采用':'，未采用');})()}
    【十类条文】
    ${TW_CATS.map(cid=>pick(cid)).filter(Boolean).join('\n')}
    【真典断语】${(()=>{ const b=_tbBaziState(R); if(!b||!b.BZ||typeof window.matchDuanyu!=='function') return '不可用'; const A=window.getAnalysis(b.BZ); let pool=[]; Object.keys(window.DUANYU||{}).forEach(cat=>{ (window.matchDuanyu(cat,b.BZ,A,{})||[]).forEach(x=>{ if(x&&x.say) pool.push(x); }); }); if(!pool.length) return '本命未命中古法断语'; pool.sort((p,q)=>(q.w||1)-(p.w||1)); const seen={}, uniq=[]; pool.forEach(x=>{ const rel=JSON.stringify(x.when||{})+'|'+x.src; if(rel in seen) return; seen[rel]=true; uniq.push(x); }); const picks=[]; for(let n=1;n<=2;n++){ const seed=((R.H%100003)*7919+n*104729+20011)%100003; const it=uniq[seed%uniq.length]; if(it&&!picks.some(p=>p.say===it.say)) picks.push(it); } return picks.map(p=>p.say+'，出自'+p.src).join('；'); })()}
    【大运条文】起运 ${R.dayun&&R.dayun.ageYears!=null?(R.dayun.ageYears+' 年 '+R.dayun.ageMonths+' 个月 '+R.dayun.ageDays+' 天，'+(R.dayun.forward?'顺排':'逆排')):'不可用'}
    ${dyLines}
    【流年条文】
    ${lnLines}
    `;
    }, '铁板神数', { share:{ page:'tieban', title:'铁板神数在线排盘', collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ try{ query(); }catch(e){} }); } } });
    if(window.mountJingWenRef) mountJingWenRef({cls:'mh-ref'});
    xjApplyFold('tbFoldState','details[id]');
  }, 0);
});
