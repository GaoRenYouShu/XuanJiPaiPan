


(function () {
    renderChrome('wannianli.html');
    /* xjCalNav 查询钩子：共享件算出目标日期后由本页 jumpToDate 刷新月历与详情 */
    xjCalNav.onQuery = function(v){ jumpToDate(v); };
    xjq = xjCalQuery.init({
      mount:'xjQuery', grid:'calGrid', label:'节日检索', placeholder:'节日或节气', filterLabel:'筛选',
      getYear:function(){ return cur.getFullYear(); },
      searchDay:function(y,m,d){
        const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), fp=festParts(solar,y,m,d);
        const arr=fp.all.slice(), jq=lunar.getJieQi();
        if(jq) arr.push(jq);
        const h=holidayOf(y,m,d); if(h){ arr.push(h.off?'休':'班'); if(h.name) arr.push(h.name); }
        return arr;
      },
      filters:[
        {value:'fest',label:'节日'},{value:'jq',label:'节气'},{value:'mem',label:'纪念日'},
        {value:'off',label:'休'},{value:'work',label:'班'}
      ],
      match:function(y,m,d,sel){
        const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), fp=festParts(solar,y,m,d);
        const jq=lunar.getJieQi();
        const h=holidayOf(y,m,d);
        const off=h?h.off:false;
        const work=h?!h.off:false;
        const map={fest:fp.hasAny,jq:!!jq,mem:!!fp.mem,off:!!off,work:!!work};
        return sel.some(function(v){ return map[v]; });
      },
      onJump:function(date){ jumpToDate(date); }
    });
    initDefault();
    mountAI(function(){
      const str = lastSel || `${cur.getFullYear()}-${cur.getMonth()+1}-${cur.getDate()}`;
      const [y,m,d]=str.split('-').map(Number);
      const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar();
      const aiFp=festParts(solar,y,m,d);
      const festText=aiFp.all.length?('\n节日：'+festLine(aiFp.all)):'';
      const jqText=xjJieqiLines(lunar).join('\n');
      const ygz=lunar.getYearInGanZhi(), mgz=lunar.getMonthInGanZhi(), dgz=lunar.getDayInGanZhi();
      const hTimes=lunar.getTimes(), hrNow=xjNowDate().getHours();
      const hTime=hTimes.find(t=>{const lo=+t.getMinHm().slice(0,2), hi=+t.getMaxHm().slice(0,2); return hrNow>=lo&&hrNow<=hi;})||hTimes[0];
      const ngw=(lab,ny,gz,wx,sx)=>`${lab} ${ny} ${gz} ${wx} ${sx}`;
      const ngwText=[
        ngw('年',lunar.getYearNaYin(),ygz,GAN_WX[ygz[0]],lunar.getYearShengXiao()),
        ngw('月',lunar.getMonthNaYin(),mgz,GAN_WX[mgz[0]],lunar.getMonthShengXiao()),
        ngw('日',lunar.getDayNaYin(),dgz,GAN_WX[dgz[0]],lunar.getDayShengXiao()),
        ngw('时',hTime.getNaYin(),hTime.getGanZhi(),GAN_WX[hTime.getGanZhi()[0]],hTime.getShengXiao())
      ].join('\n');
      return `公历：${y}年${m}月${d}日 星期${'日一二三四五六'[solar.getWeek()]}\n农历：${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}\n生肖、星座：${lunar.getYearShengXiao()}、${solar.getXingZuo()}座\n月建：${lunar.getMonthInGanZhi()[1]}月\n月相：${lunar.getYueXiang()}\n纳音干支五行生肖：\n${ngwText}\n节气：${jqText}\n时令：${shilingNote(y,m,d).join('、')||'无'}；物候：${shilingWuHou(lunar)||'无'}；经络当令：${shilingDangLing().text}${festText}
年占：${yearZhanRow(lunar.getYear())}
季：${lunar.getSeason()}
六曜：${lunar.getLiuYao()}
周次：${weekLine(y,m,d)}（本月共${monthWeekCount(y,m)}周）
冲煞：日冲${lunar.getDayChongDesc()} 煞${lunar.getDaySha()}；时冲${hTime.getChongDesc()} 煞${hTime.getSha()}\n宜：${lunar.getDayYi().join('、')||'诸事不宜'}\n忌：${lunar.getDayJi().join('、')||'无'}`;
    }, '万年历', { share:{ page:"wannianli", title:"万年历在线查询", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ if(!lastSel) setToday(); }); } } });
})();
