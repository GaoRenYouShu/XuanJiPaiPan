


(function () {
  ({C:W_C,ARC:W_ARC,OUT:W_OUT,IN:W_IN,CORE:W_CORE,LAB_OUT:W_LAB_OUT,LAB_IN:W_LAB_IN,HIT1:W_HIT1,TICK0:W_TICK0,TICK1:W_TICK1,P0:W_P0,P1:W_P1}=WHEEL.GEO440);
  LHL_SC_WHEEL = {
    id:'lhlScWheel', aria:'十二时辰吉凶盘',
    dataFn:lhlScData, now:xjNowDate, span:scSpan, mid:scMid,
    ids:{sel:'lhlScArc',anchor:'lhlScArcFix',needle:'lhlScNeedle',dot:'lhlScDot'},
    cids:{c1:'lhlScC1',c2:'lhlScC2',c3:'lhlScC3'},
    onclick:'lhlPickShichen',
    geo:{arc:W_ARC,rIn:W_IN,hit1:W_HIT1,tick0:W_TICK0,tick1:W_TICK1,p0:W_P0,p1:W_P1,out:W_OUT,core:W_CORE,labOut:W_LAB_OUT,labIn:W_LAB_IN,c:W_C},
    onState:function(data,cur){ LHL_SC=data; LHL_SC_CUR=cur; LHL_SC_SEL=cur; }
  };
  renderChrome('laohuangli.html');
    /* xjCalNav 查询钩子：共享件算出目标日期后由本页 query() 刷新各区 */
    xjCalNav.onQuery = function(){ query(); };
    xjq = xjCalQuery.init({
      mount:'xjQuery', grid:'calGrid', label:'内容检索', placeholder:'节日或神煞', filterLabel:'筛选',
      getYear:function(){ const v=document.getElementById('dInput').value; const y=+String(v).split('-')[0]; return y||xjNowDate().getFullYear(); },
      searchDay:function(y,m,d){
        const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), fp=festParts(solar,y,m,d);
        const arr=fp.all.slice(), zx=lunar.getZhiXing(), jq=lunar.getJieQi();
        arr.push(zx+'日', jian12Tag(zx), lunar.getDayTianShen(), lunar.getDayTianShenType(), lunar.getLiuYao());
        if(jq) arr.push(jq);
        lunar.getDayJiShen().forEach(function(n){ arr.push(n); });
        lunar.getDayXiongSha().forEach(function(n){ arr.push(n); });
        lunar.getDayYi().forEach(function(n){ arr.push(n); });
        lunar.getDayJi().forEach(function(n){ arr.push(n); });
        return arr;
      },
      filters:[
        {value:'fest',label:'节日'},{value:'jq',label:'节气'},{value:'mem',label:'纪念日'},{value:'huangdao',label:'黄道'}
      ],
      match:function(y,m,d,sel){
        const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), fp=festParts(solar,y,m,d);
        const jq=lunar.getJieQi(), ts=lunar.getDayTianShenType();
        const map={fest:fp.hasAny,jq:!!jq,mem:!!fp.mem,huangdao:ts==='黄道'};
        return sel.some(function(v){ return map[v]; });
      },
      onJump:function(date){ const i=document.getElementById('dInput'); if(i)i.value=date; query(); }
    });
    (function(){
      const JIAZI60=(function(){const G=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],Z=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];const a=[];for(let i=0;i<60;i++)a.push(G[i%10]+Z[i%12]);return a;})();
      window.JIAZI60 = JIAZI60;
    })();
    document.addEventListener('toggle',function(e){
      if(e.target && e.target.matches && e.target.matches('#out details.fold-block')) xjSaveOneFold('lhlFoldState','#out details.fold-block');
    },true);
    initDefault();
    mountAI(function(){
      const v=document.getElementById('dInput').value; if(!v) return '';
      const [y,m,d]=v.split('-').map(Number);
      const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar();
      const OPP={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
      const CHONG=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
      const isChong=(a,b)=>CHONG.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
      const yGZ=lunar.getYearInGanZhi(), mGZ=lunar.getMonthInGanZhi(), dGZ=lunar.getDayInGanZhi();
      const hTimes=lunar.getTimes(), hrNow=new Date().getHours();
      const hTime=hTimes.find(t=>{const lo=+t.getMinHm().slice(0,2), hi=+t.getMaxHm().slice(0,2); return hrNow>=lo&&hrNow<=hi;})||hTimes[0];
      const yearZhi=lunar.getYearZhi(), monthZhi=mGZ[1], dayGan=dGZ[0], dayZhi=dGZ[1];
      const suiPo=Object.keys(window.ZHI_FANG).find(k=>pairChong(k,yearZhi))||'';
      const xing=(XING_TAI[yearZhi]||[]).map(x=>ZHI_SHENG[x]).join('')||'无';
      const hai=ZHI_SHENG[HAI_TAI[yearZhi]]||'无', po=ZHI_SHENG[PO_TAI[yearZhi]]||'无';
      const yx=lunar.getYueXiang();
      let chong3=''; const gzs=[yGZ,mGZ,dGZ];
      for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){ if(isChong(gzs[i][1],gzs[j][1])) chong3+=(i===0?'年':i===1?'月':'日')+(j===0?'年':j===1?'月':'日')+'柱相冲('+gzs[i][1]+gzs[j][1]+')；'; }
      const shName=curShichen();
      const jqText=xjJieqiLines(lunar).join('\n');
      /* 导出用名与格内同式：数色五行加卦方北斗名，库不在时退回只列名与五行 */
      let hh='';
      try{
        const times=lunar.getTimes();
        const hmRange=t=>{const h=+t.getMaxHm().slice(0,2)+1; return t.getMinHm()+'-'+(h<24?String(h).padStart(2,'0')+':00':'24:00');};
        times.forEach((t,i)=>{ const luck=t.getTianShenLuck?t.getTianShenLuck():''; const gz=t.getGanZhi(); const yi=lhlYiText(t.getYi&&t.getYi().slice(0,3)); const zName=i===0?'子时':(i===times.length-1?'夜子时':gz.substring(1)+'时'); hh+=`${zName} ${hmRange(t)}：${luck==='吉'?'吉':'凶'}${t.getTianShen?('、'+t.getTianShen()):''} 宜：${yi}\n`; });
      }catch(e){ hh='（时辰数据暂不可用）'; }
      return `公历：${y}年${m}月${d}日 星期${'日一二三四五六'[solar.getWeek()]}
    农历：${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}
    生肖、星座：${lunar.getYearShengXiao()}、${solar.getXingZuo()}座
    月建：${monthZhi}　月相：${yx}
    宜：${lunar.getDayYi().join('、')||'诸事不宜'}
    忌：${lunar.getDayJi().join('、')||'无'}
    岁煞冲煞：
    太岁 ${yearZhi}（岁破${OPP[yearZhi]||'无'}）
    冲${lunar.getDayChongDesc()} 煞${lunar.getDaySha()}
    时冲${hTime.getChongDesc()} 煞${hTime.getSha()}
    太岁
    太岁神君：${TAISUI_STAR[yGZ]||'未载'}大将军；犯太岁：值${ZHI_SHENG[yearZhi]}冲${ZHI_SHENG[suiPo]}刑${xing}害${hai}破${po}
    三柱相冲
    三柱互冲：${chong3||'无'}
    值神（黄道黑道）
    值神：${lunar.getDayTianShen()}（${lunar.getDayTianShenType()}）
    建除（建除派黄黑）
    建除：${lunar.getZhiXing()}日（${jian12Tag(lunar.getZhiXing())}）
    吉神宜趋：${lunar.getDayJiShen().join('、')||'无'}
    凶煞宜忌：${lunar.getDayXiongSha().join('、')||'无'}
    纳音干支五行生肖：
    年 ${lunar.getYearNaYin()} ${yGZ} ${GAN_WX[yGZ[0]]} ${lunar.getYearShengXiao()}
    月 ${lunar.getMonthNaYin()} ${mGZ} ${GAN_WX[mGZ[0]]} ${lunar.getMonthShengXiao()}
    日 ${lunar.getDayNaYin()} ${dGZ} ${GAN_WX[dGZ[0]]} ${lunar.getDayShengXiao()}
    时 ${hTime.getNaYin()} ${hTime.getGanZhi()} ${GAN_WX[hTime.getGanZhi()[0]]} ${hTime.getShengXiao()}
     节气：${jqText}
    六曜：${lunar.getLiuYao()}
    时令：${shilingNote(y,m,d).join('；')||'无'}；物候：${shilingWuHou(lunar)||'无'}；经络当令：${shilingDangLing().text}
     空亡所值：
    年：${lunar.getYearXunKong()}
    月：${lunar.getMonthXunKong()}
    日：${lunar.getDayXunKong()}
    胎神：
    本月：${xjTaiShenMonth(lunar)}
    今日：${xjTaiShenDay(lunar)}
    吉神方位：喜神${lunar.getDayPositionXiDesc()}、福神${lunar.getDayPositionFuDesc()}、财神${lunar.getDayPositionCaiDesc()}
    阳贵${lunar.getDayPositionYangGuiDesc()}、阴贵${lunar.getDayPositionYinGuiDesc()}
    日禄：${lunar.getDayLu()}
    二十八宿：${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()}（${lunar.getXiuLuck()}）
    彭祖百忌：${lunar.getPengZuGan()}；${lunar.getPengZuZhi()}
    年占：${yearZhanRow(lunar.getYear())}
    季：${lunar.getSeason()}
    周次：${weekLine(y,m,d)}（本月共${monthWeekCount(y,m)}周）
    九宫飞星：
    年飞星（${FEI_NAME[yearStar(y)]}入中）：
    ${xjFeiText(yearStar(y))}
    月飞星（${FEI_NAME[mStar]}入中）：
    ${xjFeiText(mStar)}
    日飞星（${FEI_NAME[dayStar(y,m,d)]}入中）：
    ${xjFeiText(dayStar(y,m,d))}
    时飞星（当前${shName}时 ${FEI_NAME[hourStar(y,m,d)]}入中）：
    ${xjFeiText(hourStar(y,m,d))}
    时辰吉凶（24小时）：
    ${hh}`;
    }, '老黄历', { share:{ page:"laohuangli", title:"老黄历每日宜忌查询", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ const _d=document.getElementById('dInput'); if(!_d||!_d.value) setToday(); }); } } });
})();
