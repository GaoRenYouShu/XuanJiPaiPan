


document.addEventListener('DOMContentLoaded', function () {
  ({C:ZW_C,ARC:ZW_ARC,OUT:ZW_OUT,IN:ZW_IN,CORE:ZW_CORE,LAB_OUT:ZW_LAB_OUT,LAB_IN:ZW_LAB_IN,HIT1:ZW_HIT1,TICK0:ZW_TICK0,TICK1:ZW_TICK1,P0:ZW_P0,P1:ZW_P1}=WHEEL.GEO440);
  setTimeout(function () {
    renderChrome('zangli.html');
    renderDoc();
    /* xjCalNav 查询钩子：共享件算出目标日期后由本页 jumpToDate 刷新月历与详情 */
    xjCalNav.onQuery = function(v){ jumpToDate(v); };
    xjq = xjCalQuery.init({
      mount:'xjQuery', grid:'calGrid', label:'殊胜日检索', placeholder:'殊胜日或节日', filterLabel:'筛选',
      getYear:function(){ return cur.getFullYear(); },
      searchDay:function(y,m,d){
        const f=zlDayFlags(y,m,d), t=f.t; if(!t) return [];
        const arr=[], ss=ZL_SHUSHENG[t.day];
        arr.push(ZL_DAY_CN[t.day-1], zlMonthName(t.month, t.leapMonth));
        if(ss){ arr.push(ss.short); if(ss.name) arr.push(ss.name); }
        zlFestOf(t).forEach(function(x){ arr.push(x.name); });
        if(f.cm.d) arr.push(f.cm.d);
        if(f.cm.l) arr.push(f.cm.l);
        const yn=zlYearName(t.jyear); arr.push(yn.ganzhi,yn.wx,yn.yx,yn.sx);
        const ex=zlFiveExtra(school,t.count,t.day);
        arr.push(ZL_XIU27[ex.xiu].n, ZL_YOGA27[ex.yoga].cn, ZL_KARANA11[ex.karana].cn);
        if(zlIsFlyFlag(t)) arr.push('飞幡日');
        zlEclipseOf(y,m,d).forEach(function(e){ arr.push('日月食', ZL_ECLIPSE_TYPE[e[1]]); });
        return arr;
      },
      filters:[
        {value:'ss',label:'殊胜日'},{value:'fest',label:'节日'},{value:'rep',label:'重日'},
        {value:'skip',label:'缺日'},{value:'leap',label:'闰月首日'},{value:'fly',label:'飞幡日'},
        {value:'ecl',label:'日月食'}
      ],
      match:function(y,m,d,sel){
        const f=zlDayFlags(y,m,d), t=f.t; if(!t) return false;
        const map={ss:!!ZL_SHUSHENG[t.day],fest:zlFestOf(t).length>0,rep:f.cm.d==='重',
          skip:f.cm.d==='缺',leap:f.cm.l==='闰',fly:zlIsFlyFlag(t),ecl:zlEclipseOf(y,m,d).length>0};
        return sel.some(function(v){ return map[v]; });
      },
      onJump:function(date){ jumpToDate(date); }
    });
    initDefault();
    mountAI(function(){
      if(!lastKey) return '';
      const p = lastKey.split('-').map(Number);
      const solar = Solar.fromYmd(p[0], p[1], p[2]), lunar = solar.getLunar();
      const t = zlFromGregorian(school, p[0], p[1], p[2]);
      const yn = zlYearName(t.jyear);
      const cy = zlCycleYearOf(t.jyear);
      const ss = ZL_SHUSHENG[t.day];
      const fs = zlFestOf(t);
      const mf = monthFestList(p[0], p[1]);
      const st = zlSkipStat();
      const ex = zlFiveExtra(school, t.count, t.day);
      return '公历：' + p[0] + '年' + p[1] + '月' + p[2] + '日 星期' + '日一二三四五六'[solar.getWeek()] + '\n'
        + '藏历（' + ZL_SCHOOLS[school].name + '）：第' + cy.cycle + '饶迥第' + cy.year + '年 ' + zlMonthName(t.month, t.leapMonth) + zlDayText(t) + '\n'
        + '年名：' + yn.text + '（' + yn.ganzhi + '年）' + '\n曜：' + zlWeekName(solar.getWeek()) + '\n'
        + '星宿：' + ZL_XIU27[ex.xiu].n + '宿(' + ZL_XIU27[ex.xiu].sa + ')\n'
        + '会合：' + ZL_YOGA27[ex.yoga].cn + '(' + ZL_YOGA27[ex.yoga].sa + ')\n'
        + '作用：' + ZL_KARANA11[ex.karana].cn + '(' + ZL_KARANA11[ex.karana].sa + ')\n'
        + '农历：' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese() + '、' + lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInGanZhi() + '月 ' + lunar.getDayInGanZhi() + '日' + '\n'
        + '本日殊胜：' + (ss ? ss.name + '，' + ss.desc + (ss.mult !== '无' ? '，传统所说作何善恶成' + ss.mult : '') + (ss.note ? '（' + ss.note + '）' : '') : '非每月固定殊胜日') + '\n'
        + '年内节日：' + (fs.length ? fs.map(function(f){ return f.name + '（' + f.desc + '）'; }).join('、') : '无') + '\n'
        + '飞幡日：' + (zlIsFlyFlag(t) ? '是，不宜悬挂风马旗、经幡' : '否') + '\n'
        + '日月食：' + zlEclipseText(p) + '\n'
        + '本月重日：' + (st.leap.length ? st.leap.join('、') : '无') + '\n'
        + '本月缺日：' + (st.skip.length ? st.skip.join('、') : '无') + '\n'
        + '当月殊胜日一览：\n' + (mf.length ? mf.map(function(g){ return g.items.join('\n'); }).join('\n') : '本月无');
    }, '藏历', { share:{ page:"zangli", title:"藏历在线查询", recast:function(){ try{ if(!lastKey) setToday(); }catch(e){} } } });
    (function(){
      const box=document.getElementById('zlDocFold'); if(!box) return;
      function save(){ const v=JSON.stringify({doc:box.open});
        try{ localStorage.setItem('zlFoldState', v); }catch(e){}
        try{ sessionStorage.setItem('zlFoldState', v); }catch(e){} }
      let s=null; try{ s=JSON.parse(localStorage.getItem('zlFoldState')||sessionStorage.getItem('zlFoldState')||'null'); }catch(e){}
      if(s && typeof s.doc==='boolean') box.open=s.doc;
      box.addEventListener('toggle', save);
    })();
  }, 0);
});
