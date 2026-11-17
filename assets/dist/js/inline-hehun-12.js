


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('hehun.html');
    window.hhSexChanged=hhSexChanged;
    (function initHehunBirth(){
      const SAVE='hehunForm';
      let saved={}; try{ saved=JSON.parse(localStorage.getItem(SAVE))||{}; }catch(e){ saved={}; }
      function persist(){ try{ const s={}, g=t=>document.getElementById(t); ['m','f'].forEach(x=>{ s[x+'HhName']=g(x+'HhName').value; s[x+'Date']=g(x+'Date').value; s[x+'Time']=g(x+'Time').value; s[x+'Sex']=g(x+'Sex')?g(x+'Sex').value:''; s[x+'Prov']=g(x+'Prov').value; s[x+'City']=g(x+'City').value; s[x+'Dist']=g(x+'Dist').value; s[x+'Lng']=g(x+'Lng').value; s[x+'ResSame']=g(x+'ResSame').checked; s[x+'ResProv']=g(x+'ResProv').value; s[x+'ResCity']=g(x+'ResCity').value; s[x+'ResDist']=g(x+'ResDist').value; s[x+'ResLng']=g(x+'ResLng').value; }); localStorage.setItem(SAVE,JSON.stringify(s)); }catch(e){} }
      function bindPersist(t){ ['Date','Time','Lng','ResLng'].forEach(k=>{ const el=document.getElementById(t+k); if(el) el.addEventListener(k.endsWith('Lng')?'input':'change', persist); }); ['Sex','ResSame'].forEach(k=>{ const el=document.getElementById(t+k); if(el) el.addEventListener('change', persist); }); const nm=document.getElementById(t+'HhName'); if(nm){ nm.addEventListener('input',()=>{ hhApplyNames(); persist(); }); nm.addEventListener('change',()=>{ if(window.__hh) hehun(); }); } }
      function buildCity(dId,pId,cId,t){
        const sp=document.getElementById(pId),sc=document.getElementById(cId),sd=document.getElementById(dId);
        if(!sp||!sc||!sd) return;
        /* 出生地默认停在未知地：起首若是某地，未动过表单的造便按该地折过一道，
           校正量的来历盘上不著一字。填充与取值走 latlng.js 的 fillPlaceTrio，各页同一份。
           回填期间不落存档：初始填充与恢复本身不是用户改动，写进去会把上次存的出生地抹成未知地。 */
        let ready=false;
        const tzSel=document.getElementById(t+'Tz');
        if(tzSel) tzSel.innerHTML=overseasTzOptions();
        const trio=fillPlaceTrio(sp, sc, sd, ()=>{ if(ready) persist(); hhSyncOverseas(); });
        sd.onchange=()=>{ if(ready) persist(); };
        const sv=saved[t+'Prov'], cv=saved[t+'City'], dv=saved[t+'Dist'];
        if(sv&&(PROV[sv]||isOverseasProv(sv))) trio.set(sv, cv, dv);
        ready=true;
      }
      function restoreOther(t){           // 姓名、日期、时间、经度、性别：有历史恢复已填，无历史不动（保留 defaultToday 填的今天）
        const g=id=>document.getElementById(id), dt=g(t+'Date'), tm=g(t+'Time'), lg=g(t+'Lng'), sx=g(t+'Sex'), nm=g(t+'HhName');
        if(saved[t+'HhName']) nm.value=saved[t+'HhName'];
        if(saved[t+'Date']) dt.value=saved[t+'Date'];
        if(saved[t+'Time']) tm.value=saved[t+'Time'];
        if(saved[t+'Lng']) lg.value=saved[t+'Lng'];
        if(sx){ if(saved[t+'Sex']) sx.value=saved[t+'Sex']; hhSexChanged(t==='m'?1:2); }   // 恢复后同步图标与卡片配色
        bindPersist(t);
      }
      buildCity('mDist','mProv','mCity','m');
      buildCity('fDist','fProv','fCity','f');
      buildCity('mResDist','mResProv','mResCity','mRes');
      buildCity('fResDist','fResProv','fResCity','fRes');
      restoreOther('m');
      restoreOther('f');
      function restoreRes(t){
        const same=document.getElementById(t+'ResSame');
        if(same&&saved[t+'ResSame']===false) same.checked=false;
        hhResToggle(t==='m'?1:2);
      }
      restoreRes('m');
      restoreRes('f');
      hhApplyNames();
    })();
    (function(){
      const p=new URLSearchParams(window.location.search);
      if(p.get('fromBazi')!=='1'){ return; }
      const dt=p.get('bDate'), tm=p.get('bTime'), sx=p.get('sex'), dg=p.get('dayGan'), yg=p.get('yearGZ');
      const xi=(p.get('xi')||'').split(',').filter(Boolean).join('、'), ji=(p.get('ji')||'').split(',').filter(Boolean).join('、');
      const side=(sx==='女'||sx==='0')?'f':'m';
      const sxE=document.getElementById(side+'Sex');
      if(sxE){ sxE.value=(sx==='女'||sx==='0')?'女':'男'; hhSexChanged(side==='f'?2:1); }   // 联动性别写入对应卡并同步图标
      const de=document.getElementById(side+'Date'), te=document.getElementById(side+'Time');
      if(de&&dt) de.value=dt;
      if(te&&tm) te.value=tm;
      /* 出生地（省市区、经度）：同步级联，禁止 setTimeout。
         八字页传来的 bTrue 参数随真太阳时勾选一并作废：本页太阳时口径已由上方选项行统管，
         该参数无对应控件，读入即弃。 */
      const prov=p.get('bProv'), city=p.get('bCity'), dist=p.get('bDist'), lng=p.get('bLng');
      const provEl=document.getElementById(side+'Prov'), cityEl=document.getElementById(side+'City'), distEl=document.getElementById(side+'Dist');
      const lngEl=document.getElementById(side+'Lng');
      if(provEl&&prov){ provEl.value=prov; provEl.onchange(); }
      if(cityEl&&city){ cityEl.value=city; cityEl.onchange(); }
      if(distEl&&dist) distEl.value=dist;
      if(lngEl&&lng) lngEl.value=lng;
      const note=document.createElement('div');
      note.className='sub-note hh-frombazi';
      note.textContent='已从八字命盘自动填入'+(sx==='女'||sx==='0'?LB:LA)+'出生信息（含出生地、经度）；请填写另一人资料后点击"开始合婚"。';
      const host=document.querySelector('.hehun-forms')||document.querySelector('.page');
      if(host) host.parentNode.insertBefore(note, host.nextSibling);
    })();
    mountAI(function(){
      const h=window.__hh; if(!h) return '';
      const M=h.M,F=h.F;
      function dump(C,who){
        let s=`【${who} 八字四柱详情】\n`;
        C.cols.forEach(c=>{
          s+=`${c.lbl} ${c.gz}　藏干 ${c.hide.join('、')}（${c.ssz.join('、')}）　十神（干） ${c.ssg}　纳音 ${c.ny}　地势 ${c.di}　自坐 ${c.di2}　神煞 ${c.sha.length?c.sha.join('、'):'无'}\n`;
        });
        s+=`五行统计：${wxStr(C.wx)}　生肖${C.sx}　年命纳音${C.yearNaYin}\n`;
        return s;
      }
      let s=`${LA}（${M.sex}）八字：${M.pillars.join(' ')}（属${M.sx}，日主${M.dayGan}）\n${LB}（${F.sex}）八字：${F.pillars.join(' ')}（属${F.sx}，日主${F.dayGan}）\n合婚综合分（先天${pct(1-h.liveW)}＋现居参看${pct(h.liveW)}${h.liveScore==null?'，现居未填按先天计':''}）：得分${h.composite}，先天分${h.natalScore}${h.liveScore==null?'':'，现居参看'+Math.round(h.liveScore)}\n六维核心分：满分100，核心${h.total}；专项参考：满分${h.specMax}，小计${h.specTotal}\n各维度评分：\n`;
      h.items.forEach(it=>{ s+=`${it[0]}：${it[1]}/${it[2]} ： ${it[3]}\n`; });
      s+=dump(M,LA)+dump(F,LB);
      // 专项分析完整输出：六项全部经由 h.spec 逐一列出（含宫位法、方向表法、八宅命卦、喜忌、神煞、财官桃花），保证复制数据与页面模块完整一致
      s+='专项分析：\n';
      (h.spec||[]).forEach(it=>{ s+=`${it[0]}：${it[1]}/${it[2]} ： ${it[3]}\n`; });
      s+='现居参看（占综合分'+pct(h.liveW)+'）：\n';
      (h.live||[]).forEach(it=>{ s+=`${it[0]}：${it[4]===false?'无判据':it[1]+'/'+it[2]} ： ${it[3]}\n`; });
      // 综合建议完整输出：等级总结、亮点、短板、相处之道，与页面模块一致（命理依据已并入各维度评分行，不重复输出）
      if(h.adv){
        s+=`综合建议（等级总结：${h.adv.level}）\n`;
        (h.adv.highlights||[]).forEach(x=>{ s+=`亮点（${x.tag}）：${x.text}\n`; });
        (h.adv.weaknesses||[]).forEach(x=>{ s+=`短板（${x.tag}）：${x.text}\n`; });
        if(!(h.adv.highlights||[]).length&&!(h.adv.weaknesses||[]).length) s+='亮点：六维与专项未见突出合象，诸维中性。\n短板：各模块均未跌破短板线，中性平过。\n';
        (h.adv.tips||[]).forEach(x=>{ s+=`相处之道（${x.tag}）：${x.text}\n`; });
      }
      return s;
    }, '八字合婚', { share:{ page:"hehun", title:"在线八字合婚", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ hehun(); }); } } });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeTip(); });
  }, 0);
});
