


document.addEventListener('DOMContentLoaded', function () {
  ({C:FW_C,ARC:FW_ARC,OUT:FW_OUT,IN:FW_IN,CORE:FW_CORE,LAB_OUT:FW_LAB_OUT,LAB_IN:FW_LAB_IN,HIT1:FW_HIT1,TICK0:FW_TICK0,TICK1:FW_TICK1,P0:FW_P0,P1:FW_P1}=WHEEL.GEO440);({C:FZ_C,ARC:FZ_ARC,OUT:FZ_OUT,IN:FZ_IN,CORE:FZ_CORE,LAB_OUT:FZ_LAB_OUT,LAB_IN:FZ_LAB_IN,HIT1:FZ_HIT1,TICK0:FZ_TICK0,TICK1:FZ_TICK1,P0:FZ_P0,P1:FZ_P1}=WHEEL.GEO440);
  FOLI_XIU=FotoUtil.XIU_27;
  FOLI_XIU_W=360/FOLI_XIU.length;
  setTimeout(function () {
    renderChrome('foli.html');
    /* xjCalNav 查询钩子：共享件算出目标日期后由本页 jumpToDate 刷新月历与详情 */
    xjCalNav.onQuery = function(v){ jumpToDate(v); };
    xjq = xjCalQuery.init({
      mount:'xjQuery', grid:'calGrid', label:'圣诞斋日检索', placeholder:'圣诞或斋日', filterLabel:'筛选',
      getYear:function(){ return cur.getFullYear(); },
      searchDay:function(y,m,d){
        const foto=Solar.fromYmd(y,m,d).getLunar().getFoto();
        const arr=foto.getOtherFestivals().slice().concat(collectZhai(foto));
        if(foto.isMonthZhai()) arr.push('三长斋月');
        return arr;
      },
      filters:[
        {value:'dan',label:'圣诞'},{value:'dao',label:'成道'},{value:'shuo',label:'朔望斋'},
        {value:'liu',label:'六斋日'},{value:'shi',label:'十斋日'},{value:'guan',label:'观音斋'},{value:'month',label:'三长斋月'}
      ],
      match:function(y,m,d,sel){
        const foto=Solar.fromYmd(y,m,d).getLunar().getFoto(), fest=foto.getOtherFestivals();
        const map={dan:fest.some(function(n){return n.indexOf('诞')>=0;}),
          dao:fest.some(function(n){return n.indexOf('成道')>=0||n.indexOf('涅槃')>=0;}),
          shuo:foto.isDayZhaiShuoWang(),liu:foto.isDayZhaiSix(),shi:foto.isDayZhaiTen(),
          guan:foto.isDayZhaiGuanYin(),month:foto.isMonthZhai()};
        return sel.some(function(v){ return map[v]; });
      },
      onJump:function(date){ jumpToDate(date); }
    });
    initDefault();
    mountAI(function(){
      if(!lastKey) return '';
      const [y,m,d]=lastKey.split('-').map(Number);
      const solar=Solar.fromYmd(y,m,d), lunar=solar.getLunar(), foto=lunar.getFoto();
      const fests=collectFestNames(foto).join('、')||'无';
      const zt=collectZhai(foto);
      const zhai = zt.length?('本日逢'+zt.join('、')+'，属斋期；佛子宜茹素持戒、诵经、礼忏'):'本日非斋期，饮食起居无特别禁戒';
      const monthFest=monthFestList(y,m);
      const mfText=monthFest.length?monthFest.flatMap(g=>g.items).join('\n'):'本月无';
      const monthZhai=monthZhaiList(y,m);
      const zhText=monthZhai.length?monthZhai.join('\n'):'本月无';
      const foText=foliDateText(foto);
      const busha = foliBusha(lunar,true);
      return `公历：${y}年${m}月${d}日 星期${'日一二三四五六'[solar.getWeek()]}\n佛历：${foto.getYearInChinese()}年${foto.getMonthInChinese()}月${foto.getDayInChinese()}\n农历：${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}、${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日\n生肖、星座：${lunar.getYearShengXiao()}、${solar.getXingZuo()}座、月建 ${lunar.getMonthInGanZhi().slice(-1)}月、月相${lunar.getYueXiang()}\n${foto.getGong()}方 ${foto.getShou()}、${foto.getAnimal()}\n佛历文书：${foText}\n宿曜二十七宿：${foto.getXiu()}${foto.getZheng()}${foto.getAnimal()}（${foto.getXiuLuck()}）\n佛菩萨圣诞、节庆：${fests}\n佛吉祥日即南传卫塞节，与汉传四月初八佛诞分列\n本日斋期综合判定：${zhai}\n宿曜吉凶歌：${foto.getXiuSong()}\n南传布萨：${busha}\n当月佛菩萨圣诞一览：\n${mfText}\n当月斋日一览：\n${zhText}`;
    }, '佛历', { share:{ page:"foli", title:"佛历在线查询", recast:function(){ try{ if(!lastKey) setToday(); }catch(e){} } } });
  }, 0);
});
