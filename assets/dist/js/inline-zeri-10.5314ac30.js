


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('zeri.html');
    (function(){
      const K_OPEN='zeri_mod_open_v2';
      function saveOpen(){
        try{
          const cur=JSON.parse(localStorage.getItem(K_OPEN)||'{}');
          document.querySelectorAll('details.zr-mod').forEach(function(m){ if(m.id) cur['mod:'+m.id]=!!m.open; });
          localStorage.setItem(K_OPEN, JSON.stringify(cur));
        }catch(e){}
      }
      function restore(){
        try{
          const cur=JSON.parse(localStorage.getItem(K_OPEN)||'{}');
          document.querySelectorAll('details.zr-mod').forEach(function(m){
            if(m.id && 'mod:'+m.id in cur) m.open=cur['mod:'+m.id];
          });
        }catch(e){}
      }
      try{
        window.addEventListener('beforeunload', saveOpen);
        window.addEventListener('pagehide', saveOpen);
        document.querySelectorAll('details.zr-mod').forEach(function(m){
          m.addEventListener('toggle', saveOpen);
        });
        restore();
        window.addEventListener('pageshow', function(){ saveOpen(); restore(); });
      }catch(e){}
    })();
    fillEvents();
    fillZrSchool();
    document.getElementById('shan').innerHTML='<option value="">不按坐山</option>'+ZERI.SHAN_LIST.map(s=>`<option value="${s}">${s}</option>`).join('');
    document.getElementById('laiLong').innerHTML='<option value="">不按来龙</option>'+ZERI.SHAN_LIST.map(s=>`<option value="${s}">${s}</option>`).join('');
    document.getElementById('xiangShan').innerHTML='<option value="">不按向方</option>'+ZERI.SHAN_LIST.map(s=>`<option value="${s}">${s}</option>`).join('');
    document.getElementById('zhongShi').innerHTML='<option value="">不选则只论日柱</option>'+ZERI.HOURS.map(o=>`<option value="${o.z}">${o.z}（${o.s}）</option>`).join('');
    document.getElementById('zrSchool').addEventListener('change', query);
    initDefault();
    (function initUserBirth(){
      const sp=document.getElementById('bProv'), sc=document.getElementById('bCity'), sd=document.getElementById('bDist');
      if(!sp) return;
      const tzSel=document.getElementById('bTzOff');
      if(tzSel&&typeof overseasTzOptions==='function') tzSel.innerHTML=overseasTzOptions();
      ZR_USER_PLACE=fillPlaceTrio(sp, sc, sd, ()=>{
        CITY_LNG=findLng(sp.value, sc.value, sd.value);
        zmSyncOverseas();
      });
      zmSyncOverseas();
      /* 出生信息改即重算，免精择沿用上一份喜用神 */
      ['bDate','bTime','bSex','bZi','bProv','bCity','bDist','bLng','bTrue','bTzOff','bLocalDst'].forEach(function(id){
        const el=document.getElementById(id); if(!el) return;
        el.addEventListener('change', function(){
          if(!document.getElementById('bDate').value){ USER_READY=false; return; }
          if(USER_READY) calcUserXi();
        });
      });
    })();
    document.getElementById('tsMode').addEventListener('change',function(){
      document.getElementById('tsYear').value='';
      document.getElementById('tsYear').placeholder=this.value==='liu'?'留空即取当年':'如 1988（出生年）';
      calcTaisui();
    });
    document.getElementById('tsYear').addEventListener('input',calcTaisui);
    calcTaisui();
    (function(){
      const p=new URLSearchParams(window.location.search);
      if(p.get('fromBazi')!=='1') return;
      const dt=p.get('bDate'), tm=p.get('bTime'), sx=p.get('sex');
      const de=document.getElementById('bDate'), te=document.getElementById('bTime'), se=document.getElementById('bSex');
      if(de&&dt) de.value=dt;
      if(te&&tm) te.value=tm;
      if(se&&sx) se.value=(sx==='女'||sx==='0')?'0':'1';
      const lngEl=document.getElementById('bLng'), trEl=document.getElementById('bTrue');
      if(ZR_USER_PLACE) ZR_USER_PLACE.set(p.get('bProv'), p.get('bCity'), p.get('bDist'));
      if(lngEl&&p.get('bLng')) lngEl.value=p.get('bLng');
      if(trEl) trEl.checked=(p.get('bTrue')==='1');
      try{ calcUserXi(); }catch(e){}
    })();
    mountAI(function(){
      if(ZR_MODE==='zaoming'){
        if(!ZM_RES || !ZM_CTX) return '';
        let s=`造命择日（剖腹产择日）：窗口 ${ZM_CTX.from.y}-${ZM_CTX.from.m}-${ZM_CTX.from.d} 至 ${ZM_CTX.to.y}-${ZM_CTX.to.m}-${ZM_CTX.to.d}，共 ${ZM_RES.count} 个候选（${ZM_RES.days} 天 × ${ZM_CTX.hours.length} 时辰）\n`;
        s+=`权重：八字质量为主，前三步大运、家长缘分次之，避凶底线为底\n`;
        ZM_RES.list.slice(0,10).forEach(function(it,i){
          const r=it.res;
          s+=`${i+1}. ${it.y}-${it.m}-${it.d} ${ZERI.HOURS[it.hourIdx].z}时(${it.clockTime}) ${it.pillars.join(' ')} 日主${it.dayGan}（${it.dayWx}） ${it.strength} ${it.geName||''} 综合${r.total}【${r.grade.t}】\n`;
        });
        return s;
      }
      if(!LAST) return '';
      let s=`择日：${LAST.ev}（流派：${document.getElementById('zrSchool').value}）\n候选吉日（共${LAST.top.length}天，按吉度排序）：\n`;
      LAST.top.forEach(r=>{ s+=`${r.solar.toYmd()} 周${r.wk} 农历${r.lunar.getMonthInChinese()}月${r.lunar.getDayInChinese()} ${r.dayGZ}日 ${r.tShen}${r.huangdao?'黄道':'黑道'} ${r.zhiXing}日 冲${r.chong} 吉度${r.score}\n`; });
      if(USER_READY) s+=`\n命主喜用神：喜（${USER_XI.join('、')}） 忌（${USER_JI.join('、')}） 首选用神${USER_USE} 年命纳音${USER_NAYIN}（${USER_NAYIN_WX}）`;
      if(TS_RES) s+=`\n真太岁：${TS_RES.zhi}（${TS_RES.mode==='liu'?'流年':'本命'}） 岁破${TS_RES.cp} 三煞${TS_RES.ss.join('')}`;
      const shan=document.getElementById('shan').value, zs=document.getElementById('zhongShi').value;
      if(shan) s+=`\n坐山：${shan}`;
      if(zs) s+=`\n用事时辰：${zs}时`;
      return s;
    }, '择日', { share:{ page:"zeri", title:"择日择吉在线", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ try{ if(ZR_MODE==='zaoming'){ initZaomingUI(); zmRun(); } else { query(); } }catch(e){} }); } } });
    (function(){ try{ if(localStorage.getItem('zeri_mode_v1')==='zaoming') setZrMode('zaoming'); }catch(e){} })();;
  }, 0);
});
