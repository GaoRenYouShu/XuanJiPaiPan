/* 历法反查共享件：农历与佛历、道历共用一套农历月日适配器，只换纪元年偏移；
   藏历按饶迥年月日反查公历，闰月、重日、缺日三种边界一并处理。
   各历法页只提供输入区、年份标签与回填函数。 */
;(function(root){
  'use strict';
  function pad(n){ return String(n).padStart(2,'0'); }
  function ymd(y,m,d){ return y+'-'+pad(m)+'-'+pad(d); }
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function int(v){ var n=parseInt(v,10); return isNaN(n)?null:n; }
  var MONTH_CN=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  var MONTH_NUM=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  var DAY_CN=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  function lunarMonths(eraYear, offset){
    var ly=eraYear+offset;
    var y=LunarYear.fromYear(ly);
    var months=y.getMonths().map(function(m){
      return {month:Math.abs(m.getMonth()),leap:m.isLeap(),days:m.getDayCount()};
    });
    return {lunarYear:ly,leap:y.getLeapMonth(),months:months};
  }
  function lunarToSolar(eraYear, offset, month, leap, day){
    var ly=eraYear+offset;
    var m=leap?-Math.abs(month):Math.abs(month);
    var lunar=Lunar.fromYmd(ly,m,day);
    var s=lunar.getSolar();
    return {y:s.getYear(),m:s.getMonth(),d:s.getDay(),date:ymd(s.getYear(),s.getMonth(),s.getDay()),lunar:lunar};
  }
  function tibetanToSolar(school, jyear, month, leapMonth, day, leapDay){
    var cy=zlCycleYearOf(jyear);
    var r=zlToGregorian(school,cy.cycle,cy.year,month,leapMonth,day,leapDay);
    r.date=ymd(r.y,r.m,r.d);
    return r;
  }

  function mount(opts){
    var el=opts.el;
    if(!el) return null;
    var kind=opts.kind==='tibetan'?'tibetan':'lunar';
    var isTib=kind==='tibetan';
    var offset=opts.offset||0;
    var yearLabel=opts.yearLabel||(isTib?'藏历年':'农历年');
    var monthNames=isTib?MONTH_NUM:MONTH_CN;
    var getSchool=opts.getSchool||function(){ return 'phugpa'; };
    var getCurrent=opts.getCurrent||function(){ return null; };
    var onPick=opts.onPick||function(){};
    var schoolEl=opts.schoolEl||null;

    var monthOpts='';
    for(var i=0;i<12;i++) monthOpts+='<option value="'+(i+1)+'">'+monthNames[i]+'</option>';
    var dayOpts='';
    for(var j=1;j<=30;j++) dayOpts+='<option value="'+j+'">'+DAY_CN[j-1]+'</option>';
    el.innerHTML='<div class="rev-row">'
      +'<div class="form-row rev-fields">'
      +'<div class="field"><label for="rvYear">'+esc(yearLabel)+'</label>'
      +'<input type="number" id="rvYear" class="rv-year" step="1" min="'+(isTib?1027:1)+'" max="9999"></div>'
      +'<div class="field"><label for="rvMonth">月</label><select id="rvMonth" class="rv-month">'+monthOpts+'</select></div>'
      +'<div class="field rev-check"><label for="rvLeap">闰月</label><span class="rev-check-line"><input type="checkbox" id="rvLeap" class="rv-leap"></span></div>'
      +'<div class="field"><label for="rvDay">日</label><select id="rvDay" class="rv-day">'+dayOpts+'</select></div>'
      +(isTib?'<div class="field rev-check rv-leapday-wrap"><label for="rvLeapDay">重日</label><span class="rev-check-line"><input type="checkbox" id="rvLeapDay" class="rv-leapday"><span class="rev-check-hint">取前一日</span></span></div>':'')
      +'<button type="button" class="btn gold rv-go">反查公历</button>'
      +'</div>'
      +'<div class="rev-note rv-note" role="status"></div>'
      +'</div>';

    var yEl=el.querySelector('.rv-year'), mEl=el.querySelector('.rv-month'), leapEl=el.querySelector('.rv-leap');
    var dEl=el.querySelector('.rv-day'), ldEl=el.querySelector('.rv-leapday'), noteEl=el.querySelector('.rv-note');
    var btn=el.querySelector('.rv-go');

    function note(html){ noteEl.innerHTML=html||''; }
    function setDayCount(n){
      var cur=int(dEl.value)||1;
      var h='';
      for(var k=1;k<=n;k++) h+='<option value="'+k+'">'+DAY_CN[k-1]+'</option>';
      dEl.innerHTML=h;
      dEl.value=String(Math.min(cur,n));
    }
    function lunarRefresh(){
      var year=int(yEl.value), month=int(mEl.value), day=int(dEl.value)||1;
      if(year==null){ note('请填写'+esc(yearLabel)+'。'); return; }
      var info;
      try{ info=lunarMonths(year,offset); }catch(e){ note('该年超出农历可查范围。'); return; }
      var leapOk=info.leap===month;
      leapEl.disabled=!leapOk;
      if(!leapOk) leapEl.checked=false;
      var leap=leapEl.checked;
      var hit=null;
      for(var i=0;i<info.months.length;i++){
        var it=info.months[i];
        if(it.month===month&&it.leap===leap){ hit=it; break; }
      }
      if(!hit&&leap){ leapEl.checked=false; leap=false; }
      if(!hit){
        for(var j=0;j<info.months.length;j++){
          var it2=info.months[j];
          if(it2.month===month&&!it2.leap){ hit=it2; break; }
        }
      }
      if(!hit){ note('该年无此月。'); return; }
      setDayCount(hit.days);
      if(day>hit.days) dEl.value=String(hit.days);
      note('该年'+(leap?'闰':'')+monthNames[month-1]+'，可选 '+hit.days+' 天。');
    }
    function tibetanRefresh(){
      var jyear=int(yEl.value), month=int(mEl.value), day=int(dEl.value)||1;
      if(jyear==null||jyear<1027){ note('藏历年须不早于 1027 年。'); return; }
      var school=getSchool();
      var leapOk=false;
      try{ leapOk=zlIsLeapMonth(school,jyear,month); }catch(e){}
      leapEl.disabled=!leapOk;
      if(!leapOk) leapEl.checked=false;
      var leap=leapEl.checked;
      var trial;
      try{ trial=tibetanToSolar(school,jyear,month,leap,day,false); }
      catch(e){ note('该藏历日期超出可查范围。'); return; }
      if(ldEl){
        ldEl.disabled=!trial.repeated;
        if(!trial.repeated) ldEl.checked=false;
      }
      if(trial.skipped){
        note('该日缺日，藏历无此日；反查按下一日计算。');
      }else if(trial.repeated){
        note('该日重日，可勾选“重日取前一日”，不勾取后一日。');
      }else{
        note('藏历 '+jyear+' 年'+(leap?'闰':'')+monthNames[month-1]+DAY_CN[day-1]+'。');
      }
    }
    function refresh(){ if(isTib) tibetanRefresh(); else lunarRefresh(); }
    function initFromCurrent(){
      var c=getCurrent();
      if(!c){ var now=new Date(); c={y:now.getFullYear(),m:now.getMonth()+1,d:now.getDate()}; }
      try{
        if(isTib){
          var t=zlFromGregorian(getSchool(),c.y,c.m,c.d);
          yEl.value=String(t.jyear); mEl.value=String(t.month); dEl.value=String(t.day);
          leapEl.checked=!!t.leapMonth;
          if(ldEl) ldEl.checked=!!t.leapDay;
        }else{
          var lunar=Solar.fromYmd(c.y,c.m,c.d).getLunar();
          yEl.value=String(lunar.getYear()-offset);
          mEl.value=String(Math.abs(lunar.getMonth()));
          dEl.value=String(lunar.getDay());
          leapEl.checked=lunar.getMonth()<0;
        }
      }catch(e){}
      refresh();
    }
    function go(){
      var year=int(yEl.value), month=int(mEl.value), day=int(dEl.value);
      if(year==null||month==null||day==null){ note('请填写完整的年月日。'); return; }
      try{
        if(isTib){
          var school=getSchool();
          var r=tibetanToSolar(school,year,month,leapEl.checked,day,ldEl?ldEl.checked:false);
          var txt='藏历 '+year+' 年'+(leapEl.checked?'闰':'')+monthNames[month-1]+DAY_CN[day-1]+' → 公历 '+r.date;
          if(r.skipped) txt+='。该日缺日，藏历无此日，已按下一日反查。';
          else if(r.repeated) txt+='。该日重日，取'+(ldEl&&ldEl.checked?'前一日':'后一日')+'。';
          note(txt);
          onPick(r.date);
        }else{
          var s=lunarToSolar(year,offset,month,leapEl.checked,day);
          note(esc(yearLabel.replace(/年$/,''))+' '+year+' 年'+(leapEl.checked?'闰':'')+monthNames[month-1]+DAY_CN[day-1]+' → 公历 '+s.date);
          onPick(s.date);
        }
      }catch(e){
        note('该日期不存在：'+esc((e&&e.message)||String(e)));
      }
    }
    yEl.addEventListener('input',refresh);
    mEl.addEventListener('change',refresh);
    leapEl.addEventListener('change',refresh);
    dEl.addEventListener('change',refresh);
    if(ldEl) ldEl.addEventListener('change',refresh);
    btn.addEventListener('click',go);
    if(schoolEl) schoolEl.addEventListener('change',function(){ initFromCurrent(); });
    initFromCurrent();
    return {refresh:refresh,init:initFromCurrent};
  }

  root.XJ_CAL_REVERSE={lunarMonths:lunarMonths,lunarToSolar:lunarToSolar,tibetanToSolar:tibetanToSolar,mount:mount};
})(this);
