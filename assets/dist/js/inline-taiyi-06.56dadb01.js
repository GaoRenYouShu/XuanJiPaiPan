


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('taiyi.html');
    /* xjCalNav 两钩子：onToday 回填本页时辰输入，onQuery 触发本页查询 */
    xjCalNav.onToday = function(){ const h=new Date().getHours(); document.getElementById('hInput').value=String((h===0||h===23)?23:(h%2?h:h-1)); };
    xjCalNav.onQuery = function(){ query(); };
    renderTermGloss();
    document.addEventListener('toggle', function(e){
      const t = e.target;
      if(t && t.tagName === 'DETAILS' && t.id) xjSaveModState('tyModState','details[id]','__tyInitDone');
    }, true);
    xjCalNav.onToday();
    mountAI(function(){
      if(!LAST) return '';
      const ct=(s,label)=>{
        const hd=calDes(s.homeCal), ad=calDes(s.awayCal);
        return `【${label}】${s.wen}
    太乙（主）居${GONG_NAME[s.tyGong]}宫　文昌（天目）居${GONG_NAME[s.wc]}宫　始击（客目）居${GONG_NAME[s.sh]}宫
    计神${s.ji}　太岁${s.taishui}
    主算${s.homeCal}（${hd.join('；')}）　客算${s.awayCal}（${ad.join('；')}）　定算${s.dingCal}（偏助客）
    八门值使${s.doorZhiShi}门（${(Taiyi.DOOR_INFO[s.doorZhiShi]||{}).吉凶}）　八门分布：${Taiyi.DOOR_ORDER.map(n=>NUM2GONG[n]+(s.doors[NUM2GONG[n]]||'')+'门').join('、')}
    主大将${s.shen.主大}宫、主参将${s.shen.主参}宫　客大将${s.shen.客大}宫、客参将${s.shen.客参}宫
    十神：君基${s.shen.君基} 臣基${s.shen.臣基} 民基${s.shen.民基} 四神${s.shen.四神} 天乙${s.shen.天乙} 地乙${s.shen.地乙} 直符${s.shen.直符} 飞符${s.shen.飞符} 五福${s.shen.五福}
    格局：${s.pattern||'无显明囚杜塞迫击格对'}
    五行生克：${Taiyi.wuxingShengFu(s).text}
    八门值使：${s.doorZhiShi}门（${(Taiyi.DOOR_INFO[s.doorZhiShi]||{}).吉凶}）　主大将临${s.shen.主大==='中'?'中宫八门杜塞':s.shen.主大+'宫'+s.doors[s.shen.主大]+'门'}　客大将临${s.shen.客大==='中'?'中宫八门杜塞':s.shen.客大+'宫'+s.doors[s.shen.客大]+'门'}
    占断：${s.tyGong===s.wc?'囚（太乙与文昌同宫，君臣被困，宜静守）；':''}主算${s.homeCal>s.awayCal?'盛、主占先':(s.homeCal<s.awayCal?'客算盛、客占先':'主客相埒')}；定算${s.dingCal}（偏助客）；主大将${s.shen.主大}宫、客大将${s.shen.客大}宫、计神${s.ji}。`;
      };
      return `太乙神数推演（${(LAST.tahun!==undefined?Taiyi.TAIYI_METHODS[LAST.tahun]:'太乙统宗')}体系，年、月、日计阳遁）
    【推算信息】${LAST.ly}　太岁${LAST.taishui}
    ${ct(LAST.R.year,'岁计　值年太乙')}
    ${ct(LAST.R.month,'月计　值月太乙')}
    ${ct(LAST.R.day,'日计　值日太乙')}
    ${LAST.Rshi?ct(LAST.Rshi,'时计　值时太乙'):''}
    【占断总纲】太乙为主、始击为客，文昌佐主；依局数对七十二取余的权威表查得主客算、十神、格局；囚（太乙与文昌同宫）、杜塞（主客大将入中宫）、迫击掩挟关对、计神所值，综合论岁气灾祥、兵谋胜负、水旱丰歉。太乙积年体系繁多，采${(LAST.tahun!==undefined?Taiyi.TAIYI_METHODS[LAST.tahun]:'太乙统宗')}一系整理，供参考。`;
    }, '太乙神数', { share:{ page:"taiyi", title:"太乙神数在线排盘", recast:function(){ try{ query(); }catch(e){} } } });
  }, 0);
});

/* 日期框默认取本机当日，时辰框取当前时辰段的偶时起点。 */
(function(){var n=new Date(),z=function(v){return('0'+v).slice(-2)},d=document.getElementById('dInput'),h=document.getElementById('hInput'),H=n.getHours();if(d)d.value=n.getFullYear()+'-'+z(n.getMonth()+1)+'-'+z(n.getDate());if(h)h.value=String((H===0||H===23)?23:(H%2?H:H-1));})();
