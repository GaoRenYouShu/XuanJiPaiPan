


document.addEventListener('DOMContentLoaded', function () {
  ({C:DL_C,ARC:DL_ARC,OUT:DL_OUT,IN:DL_IN,CORE:DL_CORE,LAB_OUT:DL_LAB_OUT,LAB_IN:DL_LAB_IN,HIT1:DL_HIT1,TICK0:DL_TICK0,TICK1:DL_TICK1,P0:DL_P0,P1:DL_P1}=WHEEL.GEO440);
  DL_SC_WHEEL = {
    id:'daoScWheel', aria:'十二时辰吉凶盘',
    dataFn:dlScData, now:xjNowDate, span:dlScSpan, mid:dlScMid,
    ids:{sel:'daoScArc',anchor:'daoScArcFix',needle:'daoScNeedle',dot:'daoScDot'},
    cids:{c1:'daoScC1',c2:'daoScC2',c3:'daoScC3'},
    onclick:'daoPickShichen',
    geo:{arc:DL_ARC,rIn:DL_IN,hit1:DL_HIT1,tick0:DL_TICK0,tick1:DL_TICK1,p0:DL_P0,p1:DL_P1,out:DL_OUT,core:DL_CORE,labOut:DL_LAB_OUT,labIn:DL_LAB_IN,c:DL_C},
    onState:function(data,cur){ DL_SC=data; DL_SC_CUR=cur; DL_SC_SEL=cur; }
  };
  setTimeout(function () {
    renderChrome('daoli.html');
    DAO_XIU_28 = Object.keys(LunarUtil.XIU_LUCK).filter(function(k){return k.charAt(0)!=='{';});
    (function(){
      const JIAZI60=(function(){const G=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],Z=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];const a=[];for(let i=0;i<60;i++)a.push(G[i%10]+Z[i%12]);return a;})();
      window.JIAZI60 = JIAZI60;
    })();
    document.addEventListener('toggle',function(e){
      if(e.target && e.target.matches && e.target.matches('#dayDetail details.fold-block')) xjSaveOneFold('dlFoldState','#dayDetail details.fold-block');
    },true);
    /* xjCalNav 查询钩子：共享件算出目标日期后由本页 jumpToDate 刷新月历与详情 */
    xjCalNav.onQuery = function(v){ jumpToDate(v); };
    xjq = xjCalQuery.init({
      mount:'xjQuery', grid:'calGrid', label:'节日检索', placeholder:'神名或节日名', filterLabel:'斋期筛选',
      getYear:function(){ return cur.getFullYear(); },
      searchDay:function(y,m,d){
        const tao=Solar.fromYmd(y,m,d).getLunar().getTao();
        return collectFests(tao).concat(collectSpecial(tao));
      },
      filters:DL_ZHAI_ORDER.map(function(k){ return {value:k,label:DL_ZHAI_LABEL[k]}; }),
      match:function(y,m,d,sel){
        const lunar=Solar.fromYmd(y,m,d).getLunar(), tao=lunar.getTao();
        return dlZhaiTypes(lunar,tao).some(function(t){ return sel.indexOf(t)>=0; });
      },
      onJump:function(date){ jumpToDate(date); }
    });
    initDefault();
    mountAI(function(){
      if(!lastKey) return '';
      const [y,m,d]=lastKey.split('-').map(Number);
      const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), tao=lunar.getTao();
      const jqText=xjJieqiLines(lunar).join('\n');
      const fests=collectFests(tao);
      const sp=collectSpecial(tao);
      const ygz=lunar.getYearInGanZhi(), yZhi=ygz[1];
      const dyGZ=lunar.getDayInGanZhi(), dyGan=dyGZ[0], dyZhi=dyGZ[1];
      const mgz=lunar.getMonthInGanZhi(), mZhi=mgz[1];
      const hTimes=lunar.getTimes(), hrNow=xjNowDate().getHours();
      const hTime=hTimes.find(t=>{const lo=+t.getMinHm().slice(0,2), hi=+t.getMaxHm().slice(0,2); return hrNow>=lo&&hrNow<=hi;})||hTimes[0];
      const suiPo = Object.keys(window.ZHI_FANG).find(k=>pairChong(k,yZhi))||'';
      const xing=(XING_TAI[yZhi]||[]).map(x=>ZHI_SHENG[x]).join('')||'无';
      const hai=ZHI_SHENG[HAI_TAI[yZhi]]||'无', po=ZHI_SHENG[PO_TAI[yZhi]]||'无';
      const mingWu=tao.isDayMingWu(), anWu=tao.isDayAnWu();
      const wuText = (mingWu&&anWu)?'明戊兼暗戊':(mingWu?'明戊':(anWu?'暗戊':'非戊日'));
      const GAN_WX={'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
      const monthTao=monthTaoList(y,m);
      const mtText=monthTao.length?monthTao.flatMap(g=>g.items).join('\n'):'本月无';
      /* 斋期判定与 cell 角标、圣诞斋日盘 dlDanBuild、showDay 斋期条同口径 */
      /* 与 cell 角标、圣诞斋日盘、showDay 斋期条同一函数，导出文本与页面不会两说 */
      const zhaiTypes=dlZhaiTypes(lunar,tao);
      const zhaiText=zhaiTypes.length?zhaiTypes.join('、'):'非斋期';
      /* 月飞星与十二消息月卦同 showDay 取 mZhi，导出文本与页面不会两说 */
      const mStar2=monthStar(y,yZhi,mZhi);
      /* 当日卦象四层与 showDay 同口径 */
      const dyGuaNajia2=dayGuaName(dyGan,dyZhi), dyGuaXT2=dayGuaXiantian(dyGZ);
      const dyPalace2=dayGuaPalace(dyGuaNajia2);
      const dyXiaoxi2=dayXiaoxi(mZhi);
      /* 导出用名与格内同式：数色五行加卦方北斗名，库不在时退回只列名与五行 */
      let shichenCopy='';
      try{
        const times=lunar.getTimes();
        const hmRange=t=>{const h=+t.getMaxHm().slice(0,2)+1; return t.getMinHm()+'-'+(h<24?String(h).padStart(2,'0')+':00':'24:00');};
        times.forEach((t,i)=>{ const luck=t.getTianShenLuck?t.getTianShenLuck():''; const gz=t.getGanZhi(); const yi=dlYiText(t.getYi&&t.getYi().slice(0,3)); const zName=i===0?'子时':(i===times.length-1?'夜子时':gz.substring(1)+'时'); shichenCopy+=`${zName}(${hmRange(t)})：${luck==='吉'?'吉':'凶'}${t.getTianShen?('、'+t.getTianShen()):''} 宜：${yi}\n`; });
      }catch(e){ shichenCopy='（时辰数据暂不可用）'; }
      return `公历：${y}年${m}月${d}日 星期${'日一二三四五六'[solar.getWeek()]}
    道历：${tao.getYearInChinese()}年${tao.getMonthInChinese()}月${tao.getDayInChinese()}
    道历纪年说明：黄帝纪元，道历年份以农历年计，等于农历年数加 2697，年界随农历正月初一；公历年初至正月初一之前仍属上一道历年。黄帝纪元另有加 2698 之算法，本站采加 2697。
    农历：${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}、${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日
    生肖、星座：${lunar.getYearShengXiao()}、${solar.getXingZuo()}座、月建 ${lunar.getMonthInGanZhi().slice(-1)}月、月相${lunar.getYueXiang()}
    宜：${lunar.getDayYi().join('、')||'诸事不宜'}
    忌：${lunar.getDayJi().join('、')||'无'}
    斋期：${zhaiText}${zhaiTypes.length?'，宜茹素、持戒、诵经、礼忏':''}
    岁煞冲煞：
    太岁 ${yZhi}（${window.ZHI_FANG[yZhi]}）　岁破 ${suiPo}（${window.ZHI_FANG[suiPo]}）
    冲${lunar.getDayChongDesc()} 煞${lunar.getDaySha()}
    时冲${hTime.getChongDesc()} 煞${hTime.getSha()}
    太岁
    太岁神君：${TAISUI_STAR[ygz]||'未载'}大将军；犯太岁：值${ZHI_SHENG[yZhi]}冲${ZHI_SHENG[suiPo]}刑${xing}害${hai}破${po}
    值神（黄道黑道）：
    值神 ${lunar.getDayTianShen()}（${lunar.getDayTianShenType()}）
    建除（建除派黄黑）：
    建除 ${lunar.getZhiXing()}日（${jian12Tag(lunar.getZhiXing())}）
    吉神宜趋：${lunar.getDayJiShen().join('、')||'无'}
    凶煞宜忌：${lunar.getDayXiongSha().join('、')||'无'}
    纳音干支五行生肖：
    年 ${lunar.getYearNaYin()} ${ygz} ${GAN_WX[ygz[0]]} ${lunar.getYearShengXiao()}
    月 ${lunar.getMonthNaYin()} ${mgz} ${GAN_WX[mgz[0]]} ${lunar.getMonthShengXiao()}
    日 ${lunar.getDayNaYin()} ${dyGZ} ${GAN_WX[dyGZ[0]]} ${lunar.getDayShengXiao()}
    时 ${hTime.getNaYin()} ${hTime.getGanZhi()} ${GAN_WX[hTime.getGanZhi()[0]]} ${hTime.getShengXiao()}
    节气：${jqText}
    六曜：${lunar.getLiuYao()}
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
    物候：
    ${shilingWuHou(lunar)}
    彭祖百忌：${lunar.getPengZuGan()}；${lunar.getPengZuZhi()}
    季：${lunar.getSeason()}
    周次：${weekLine(y,m,d)}（本月共${monthWeekCount(y,m)}周）
    当日卦象：
    纳甲重卦 ${dyGuaNajia2} ${GUA_CI[dyGuaNajia2]||''}；八宫世应 ${dyPalace2?dyPalace2.palace+' '+dyPalace2.type+'，世'+dyPalace2.world+'爻应'+dyPalace2.ying+'爻':'未载'}；先天值日卦 ${dyGuaXT2} ${GUA_CI[dyGuaXT2]||''}；十二消息月卦（按节气月）${dyXiaoxi2}${mZhi?'（'+mZhi+'月）':''}
    神仙圣诞、道教节庆：${fests.length?fests.join('、'):'无'}
    道教吉日、忌日：${sp.length?sp.join('、'):'平日'}
    戊日、斋醮参考：${wuText}
    道历文书：${daoFullText(tao,lunar)}
    当月道历圣诞一览：
    ${mtText}
    九宫飞星：
    年飞星（${FEI_NAME[yearStar(y)]}入中）：
    ${xjFeiText(yearStar(y))}
    月飞星（${FEI_NAME[mStar2]}入中，按节气月${mZhi}月）：
    ${xjFeiText(mStar2)}
    日飞星（${FEI_NAME[dayStar(y,m,d)]}入中）：
    ${xjFeiText(dayStar(y,m,d))}
    时飞星（${FEI_NAME[hourStar(y,m,d)]}入中）：
    ${xjFeiText(hourStar(y,m,d))}
    时辰吉凶：
    ${shichenCopy}`;
    }, '道历', { share:{ page:"daoli", title:"道历在线查询", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ if(!lastKey) setToday(); }); } } });
  }, 0);
});
