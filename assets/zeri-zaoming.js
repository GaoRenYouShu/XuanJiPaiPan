/* ============================================================
   新生儿造命择日引擎  zeri-zaoming.js  (window.ZAOMING)
   ============================================================
   【定位】本文件与 zeri-engine.js 并列，服务两种不同的择日范式：
     zeri-engine.js  → "择事模式"：传统择吉，判据＝日子本身吉凶（宜忌、丛辰、黄黑道）；
     zeri-zaoming.js → "造命模式"：剖腹产择日，判据＝八字相对命主的吉凶。
   两者范式不同、口径互斥，故独立成文件，绝不在择事流水线上打补丁。

   【定源】
   - 小儿关煞：《小儿关煞图》通行口诀。以百度百科"小儿关煞"词条与山煜子
     《论小儿关煞·月令论时章第二》两份资料互校，口诀一致者采录；两说并存者并列注明，
     并标明各说查法（详 GUANSHA_* 各表注）。
   - 八字质量：复用 bazi-data.js 的 baziAnalysis（扶抑、调候、通关、病药、格局 综合引擎），
     不自建第二套旺衰与格局口径。
   - 大运质量：复用 bazi-data.js 的 baziDaYunSteps（阳男阴女顺、阴男阳女逆）
     与 evalGZ（岁运引动评级 吉、中、平、凶）。
   - 家长缘分：生肖合冲刑害破依 bazi-data.js 关系表；喜用补益依家长八字 baziAnalysis；
     六亲星依十神（男家长取偏财、女家长取正印，子平通行，按家长各自所填性别取用）。
   - 四层权重与各分项量值：本站归纳者，如实标注，不冒典籍。

   【依赖全局】(zeri.html 已加载 lunar.js、app.js、xuanji-lib.js、latlng.js、
     bazi-data.js、bazi-rel.js、zeri-engine.js)
     GAN_WX ZHI_WX WX_SHENG WX_KE CHONG LIUHE JU_OF ZHI_ORDER HIDE
     DIZHI_CHONG DIZHI_XING DIZHI_HAI DIZHI_PO DIZHI_SANHE DIZHI_SANHUI
     tenGod nayinOf NAYIN_INFO TIAOHOU_GAN Solar LunarYear
     baziAnalysis baziDaYunSteps evalGZ pairIn trueSolarTime ZERI
   ============================================================ */
(function(){
  'use strict';

  var GAN10 = '甲乙丙丁戊己庚辛壬癸';
  var WX5 = ['金','木','水','火','土'];
  var SEASON4 = ['春','夏','秋','冬'];
  /* 地支六冲：优先取 zeri-engine.js 导出的 ZERI.CHONG（单一真源），
     该表在 zeri-engine 的 IIFE 内、仅经 window.ZERI 暴露，故此处回退自持一份，避免跨模块耦合。 */
  var CHONG = (typeof window!=='undefined' && window.ZERI && window.ZERI.CHONG)
    ? window.ZERI.CHONG
    : {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};

  /* ---------- 基础工具 ---------- */
  function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }
  function seasonIdx(mz){ var i=ZHI_ORDER.indexOf(mz); return Math.floor(((i-2+12)%12)/3); }
  /* 六十甲子旬空（通行例：甲子旬戌亥、甲戌旬申酉、甲申旬午未、甲午旬辰巳、甲辰旬寅卯、甲寅旬子丑） */
  var _JZ60=(function(){ var a=[]; for(var n=0;n<60;n++) a.push(GAN10[n%10]+ZHI_ORDER[n%12]); return a; })();
  var _XK={'甲子':['戌','亥'],'甲戌':['申','酉'],'甲申':['午','未'],'甲午':['辰','巳'],'甲辰':['寅','卯'],'甲寅':['子','丑']};
  function xunKong(gz){ var n=_JZ60.indexOf(gz); if(n<0) return []; return _XK[_JZ60[n-n%10]]||[]; }

  /* ============================================================
     一、小儿关煞表
     【定源】《小儿关煞图》通行口诀，两份资料互校一致者采录。
     查法分四系：按月令（季节）、按月序（农历月）、按年干、按年支、按纳音。
     等级 lv：3＝重（−8）、2＝中（−5）、1＝轻（−2）；量值为本站归纳，不冒典籍。
     ============================================================ */

  /* 按月令（季节）查时支。季节由月支推（寅卯辰春、巳午未夏、申酉戌秋、亥子丑冬） */
  var GS_SEASON = [
    {n:'阎王关', lv:3, s:[['丑','未'],['辰','戌'],['子','午'],['寅','卯']],
     note:'春忌牛羊水上波，夏逢辰戌见阎罗，秋逢子午君须避，冬时生人虎兔没。日主旺不妨、弱则难养；带天德、月德可解。'},
    {n:'四季关', lv:1, s:[['巳','丑'],['申','辰'],['亥','未'],['寅','卯']],
     note:'春生巳丑不为祥，夏遇申辰惹祸殃，秋季猪羊都不吉，冬逢虎兔两伤亡。四季天地荒芜日，主有始无终、苗而不秀。'},
    {n:'将军箭', lv:3, s:[['酉','戌','辰'],['未','卯','子'],['寅','午'],['亥','申','巳']],
     note:'酉戌辰时春不旺，未卯子时夏中亡，三寅午时秋并忌，冬季亥申巳为殃。一箭伤三岁、二箭六岁、三箭九岁、四箭十二。须八字有相冲（弓）方成箭，无冲则不忌。'},
    {n:'急脚关', lv:1, s:[['亥','子'],['卯','未'],['寅','戌'],['辰','戌']],
     note:'春忌亥子不过关，夏逢卯未在中间，秋季寅戌还须忌，冬月辰戌死不难。即八座杀，忌修造动土。'},
    {n:'浴盆关', lv:1, s:[['辰'],['未'],['戌'],['丑']],
     note:'浴盆之煞最无良，春月忌龙夏忌羊，秋季犬儿须切忌，冬月逢牛定主伤。忌初生用脚盆洗浴，只忌月内。'},
    {n:'水火关', lv:1, s:[['戌','未'],['丑','辰'],['丑','戌'],['未','辰']],
     note:'春月生戌未，夏月见丑辰，秋月生丑戌，冬月见未辰。防水火之灾、脓血疮毒。'},
    {n:'深水关', lv:2, s:[['寅','申'],['未'],['酉'],['丑']],
     note:'春忌寅申夏忌羊，秋生鸡嘴实堪伤，三冬切忌牛生角。童限最忌麻痘灾，忌近河边水池。'},
    {n:'无情关', lv:1, s:[['寅','酉','子'],['戌','亥','巳'],['申','丑'],['子','午']],
     note:'春生寅酉子，夏生戌亥巳，秋生申丑亡，冬生子午推。又名下情关，忌闻刀斧之声，宜重拜父母。'},
    {n:'阴锁关', lv:1, s:[['丑','巳'],['寅','辰'],['亥','未'],['子','申']],
     note:'春季牛蛇锁难开，夏季寅龙命难长，秋季猪羊位，冬季鼠猴阴锁在。又名偷生关。'},
    {n:'夜啼关', lv:1, s:[['午'],['酉'],['子'],['卯']],
     note:'春人怕马夏逢鸡，秋子冬卯不暂移。主三周半夜啼。另有一系按年支：子午卯酉怕未、寅申巳亥怕寅未、辰戌丑未怕酉（子午卯酉单怕羊，寅申巳亥虎羊乡，辰戌丑未鸡常叫），两说并存，本表采季节系。'}
  ];

  /* 按月序（农历月 1-12）查时支 */
  var GS_MONTH = [
    {n:'四柱关', lv:1, m:{1:['巳','亥'],2:['辰','戌'],3:['卯','酉'],4:['寅','申'],5:['丑','未'],6:['子','午'],7:['巳','亥'],8:['辰','戌'],9:['卯','酉'],10:['寅','申'],11:['丑','未'],12:['子','午']},
     note:'正七休生巳亥时，二八辰戌不堪推，三九卯酉生儿恶，四十寅申主哭悲，五十一月丑未死，六十二月子午啼。止忌生时，大抵无甚凶；忌坐栏杆椅太早。'},
    {n:'断桥关', lv:2, m:{1:['寅'],2:['卯'],3:['申'],4:['丑'],5:['戌'],6:['酉'],7:['辰'],8:['巳'],9:['午'],10:['未'],11:['亥'],12:['子']},
     note:'正寅二兔三猴走，四月耕牛懒下田，五犬六鸡门外立，七龙戏水八蛇缠，九马十羊十一猪，冬季老鼠闹喧喧。忌过桥、汲水照影。'},
    {n:'血刃关', lv:1, m:{1:['丑'],2:['未'],3:['寅'],4:['申'],5:['卯'],6:['酉'],7:['辰'],8:['戌'],9:['巳'],10:['亥'],11:['午'],12:['子']},
     note:'正月丑、二月未、三月寅、四月申、五月卯、六月酉、七月辰、八月戌、九月巳、十月亥、冬月午、腊月子。又名血光关。'},
    {n:'基败关', lv:1, m:{1:['未','戌','亥'],2:['未','戌','亥'],3:['未','戌','亥'],4:['子','辰','巳'],5:['子','辰','巳'],6:['子','辰','巳'],7:['丑','申','酉'],8:['丑','申','酉'],9:['丑','申','酉'],10:['寅','卯','午'],11:['寅','卯','午'],12:['寅','卯','午']},
     note:'正二三月生未戌亥时，四五六月生子辰巳时，七八九月生丑申酉时，十冬腊月生寅卯午时。'},
    {n:'金锁关', lv:2, m:{1:['申'],2:['酉'],3:['戌'],4:['亥'],5:['子','巳'],6:['丑'],7:['申'],8:['酉'],9:['戌'],10:['亥'],11:['子','巳'],12:['丑']},
     note:'正七逢申为金锁，二八遇鸡凶难脱，三九见犬命危难，四十见猪亦凶恶，五十一月子大败，六十二月丑折磨（一作"正七逢申人必死，二八鸡哥命必厄，三九犬儿寻声吠，四十逢猪是锁匙，五十一逢子巳死，六十二与丑非奇"，即金钥匙）。忌佩金银锁片、钱币、纽扣绳索之物。另有一系按男女：男逢辰戌、女逢丑未为关（见 GS_SEX），两说并存，本表采月序系。'}
  ];

  /* 按年干查时支 */
  var GS_YG = [
    {n:'千日关', lv:2, m:{'甲':['午'],'乙':['午'],'丙':['酉','申'],'丁':['酉','申'],'戊':['巳'],'己':['巳'],'庚':['寅'],'辛':['寅'],'壬':['丑','亥'],'癸':['丑','亥']},
     note:'甲乙马头龙不住，丙丁鸡猴奔山岗，戊己逢藏蛇在草，庚辛遇虎于林下，壬癸丑亥时须忌，孩儿值此有烦恼。'},
    {n:'落井关', lv:2, m:{'甲':['巳'],'己':['巳'],'乙':['子'],'庚':['子'],'丙':['申'],'辛':['申'],'丁':['戌'],'壬':['戌'],'戊':['卯'],'癸':['卯']},
     note:'甲己见蛇伤，乙庚鼠内藏，丙辛猴觅果，丁壬犬吠汪，戊癸愁逢兔，孩儿有水殃。忌近井边水池。'},
    {n:'雷公打脑关', lv:1, m:{'甲':['丑'],'乙':['午'],'丙':['子'],'丁':['子'],'戊':['戌'],'己':['戌'],'庚':['寅'],'辛':['寅'],'壬':['酉'],'癸':['亥']},
     note:'甲牛乙马丙丁鼠，戊己原来在犬，庚辛逢虎须防避，壬鸡癸猪有忧煌。遇流年天厄、卒暴、羊刃、火值则主雷火之厄，带天月二德可解。'},
    {n:'鸡飞关', lv:1, m:{'甲':['巳','酉','丑'],'乙':['巳','酉','丑'],'庚':['亥','卯','未'],'辛':['亥','卯','未'],'壬':['寅','午','戌'],'癸':['寅','午','戌'],'丙':['子'],'丁':['子'],'戊':['子'],'己':['子']},
     note:'甲乙巳酉丑、孩儿难保守。庚辛亥卯未、父母哭断肠。壬癸寅午戌、生下不见日。戊己丙丁子、不过三朝死。此关难养，夜生不妨。'},
    {n:'急脚煞', lv:1, m:{'甲':['申','酉'],'乙':['申','酉'],'丙':['亥','子'],'丁':['亥','子'],'戊':['寅','卯'],'己':['寅','卯'],'庚':['巳','午'],'辛':['巳','午'],'壬':['丑','未','辰','戌'],'癸':['丑','未','辰','戌']},
     note:'甲乙命人申酉是，丙丁亥子实堪悲，戊己怕寅卯上逢，庚辛巳午不须疑，壬癸切须防丑未，更加辰戌命遭危。主幼小之年难养。'}
  ];

  /* 按年支（生肖）查时支 */
  var GS_YZ = [
    {n:'鬼门关', lv:3, m:{'子':['酉','午','未'],'丑':['酉','午','未'],'寅':['酉','午','未'],'卯':['申','戌','亥'],'辰':['申','戌','亥'],'巳':['申','戌','亥'],'午':['丑','寅','卯'],'未':['丑','寅','卯'],'申':['丑','寅','卯'],'酉':['子','辰','巳'],'戌':['子','辰','巳'],'亥':['子','辰','巳']},
     note:'子丑寅生人、酉午未时真。卯辰巳生人、申戌亥为刑。午未申生人、莫犯丑寅卯。酉戌亥生人、子辰巳难乎。忌夜出入大门。'},
    {n:'短命关', lv:3, m:{'寅':['辰'],'午':['辰'],'戌':['辰'],'巳':['寅'],'酉':['寅'],'丑':['寅'],'申':['巳'],'子':['巳'],'辰':['巳'],'亥':['未'],'卯':['未'],'未':['未']},
     note:'寅午戌龙当，巳酉丑虎郎，申子辰蛇上，亥卯未寻羊。生时上带主惊呼夜啼难养，日干健则无事、日主弱凶。'},
    {n:'天狗关', lv:2, m:{'子':['戌'],'丑':['亥'],'寅':['子'],'卯':['丑'],'辰':['寅'],'巳':['卯'],'午':['辰'],'未':['巳'],'申':['午'],'酉':['未'],'戌':['申'],'亥':['酉']},
     note:'子人见戌丑人亥，寅人见子卯人丑，辰人见寅巳人卯，午人见辰未人巳，申人见午酉人未，戌人见申亥人酉。时上带则防狗伤之厄。'},
    {n:'五鬼关', lv:2, m:{'子':['辰'],'丑':['卯'],'寅':['寅'],'卯':['丑'],'辰':['子'],'巳':['亥'],'午':['戌'],'未':['申'],'申':['酉'],'酉':['未'],'戌':['午'],'亥':['巳']},
     note:'子人见辰丑人见卯，寅人见寅卯人见丑，辰人见子巳人见亥，午人见戌未人见申，申人见酉酉人见未，戌人见午亥人见巳。四柱多见难养，忌入庵堂寺院。'},
    {n:'天吊关', lv:3, m:{'申':['巳','午'],'子':['巳','午'],'辰':['巳','午'],'寅':['辰','午'],'午':['辰','午'],'戌':['辰','午'],'亥':['申','午'],'卯':['申','午'],'未':['申','午'],'巳':['卯','子'],'酉':['卯','子'],'丑':['卯','子']},
     note:'申子辰生巳午时，寅午戌生龙马侵，亥卯未生申午起，巳酉丑生卯子真。主烦恼不宁、眼睛直望。'},
    {n:'埋儿关', lv:3, m:{'子':['丑'],'午':['丑'],'卯':['丑'],'酉':['丑'],'寅':['申'],'申':['申'],'巳':['申'],'亥':['申'],'辰':['卯'],'戌':['卯'],'丑':['卯'],'未':['卯']},
     note:'子午卯酉逢野牛，寅申巳亥山猿群，辰戌丑未兔惊闹。忌看出山、凶丧之事。'},
    {n:'汤火关', lv:1, m:{'子':['午'],'午':['午'],'卯':['午'],'酉':['午'],'寅':['寅'],'申':['寅'],'巳':['寅'],'亥':['寅'],'辰':['未'],'戌':['未'],'丑':['未'],'未':['未']},
     note:'子午卯酉休逢马，寅申巳亥虎惊人，辰戌丑未羊相触，常防汤火厄相侵。'},
    {n:'和尚关', lv:1, m:{'子':['辰','戌','丑','未'],'午':['辰','戌','丑','未'],'卯':['辰','戌','丑','未'],'酉':['辰','戌','丑','未'],'辰':['子','午','卯','酉'],'戌':['子','午','卯','酉'],'丑':['子','午','卯','酉'],'未':['子','午','卯','酉'],'寅':['寅','申','巳','亥'],'申':['寅','申','巳','亥'],'巳':['寅','申','巳','亥'],'亥':['寅','申','巳','亥']},
     note:'子午卯酉忌辰戌丑未，辰戌丑未忌子午卯酉，寅申巳亥忌寅申巳亥。又名休庵关，忌见僧道尼。'}
  ];

  /* 按纳音五行查时支 */
  var GS_NAYIN = [
    {n:'白虎关', lv:2, m:{'火':['子'],'金':['卯'],'水':['午'],'土':['午'],'木':['酉']},
     note:'火人白虎须在子，金人白虎在卯方，水土生人白虎午，木人白虎酉中藏。主惊风之症、血光损伤。'},
    {n:'铁蛇关', lv:2, m:{'金':['戌'],'火':['未','申'],'木':['辰'],'水':['丑','寅']},
     note:'金戌化成铁，火向未申绝，木辰枝叶枯，水上丑寅灭。以命纳音取用。（通行口诀缺土命一系，土命不列。）'}
  ];

  /* 按男女查时支（金锁关另一系） */
  var GS_SEX = [
    {n:'金锁关（男女系）', lv:2, m:{1:['辰','戌'],0:['丑','未']},
     note:'戌上起子不通番，顺年顺月任循环，顺日顺时依此煞，男逢辰戌便为关，女逢丑未轮为害。忌佩金银铁锁、纽扣绳索之物。此为金锁关另一系（按月序系见上），两说并存。'}
  ];

  /* 按年支查农历月（劫煞关，窗口内基本恒定，跨月时才有分别） */
  var GS_MONTHFIX = [
    {n:'劫煞关', lv:1, m:{'申':[4],'子':[4],'辰':[4],'巳':[1],'酉':[1],'丑':[1],'寅':[10],'午':[10],'戌':[10],'亥':[7],'卯':[7],'未':[7]},
     note:'申子辰年生于四月，巳酉丑年生于正月，寅午戌年生于十月，亥卯未年生于七月。按月论、非按时论，故同一窗口内恒定。'}
  ];

  /* 关煞总目录（供页面说明展示） */
  var GUANSHA_CATALOG = (function(){
    var out=[];
    function add(arr, byWhat){
      arr.forEach(function(g){ out.push({name:g.n, level:g.lv, byWhat:byWhat, note:g.note}); });
    }
    add(GS_SEASON,'月令（季节）查时支');
    add(GS_MONTH,'农历月序查时支');
    add(GS_YG,'年干查时支');
    add(GS_YZ,'年支查时支');
    add(GS_NAYIN,'纳音五行查时支');
    add(GS_SEX,'男女查时支');
    add(GS_MONTHFIX,'年支查农历月');
    return out;
  })();

  /* 判定某八字所犯小儿关煞。
     ctx: { lunarMonth, sex }，lunarMonth 为农历月（1-12），sex 1男 0女 */
  function guanShaOf(BZ, ctx){
    ctx = ctx||{};
    var out = [];
    var yg = BZ.gans[0], yz = BZ.zhis[0], mz = BZ.zhis[1], dz = BZ.zhis[2], tz = BZ.zhis[3];
    var si = seasonIdx(mz);
    var lm = ctx.lunarMonth||0;
    var sex = (ctx.sex===0||ctx.sex==='0') ? 0 : 1;
    var nayinWx = (NAYIN_INFO[nayinOf(BZ.gans[0]+BZ.zhis[0])]||{}).wx || '';
    var seen = {};

    function hit(name, lv, note, basis){
      if(seen[name]) return;
      seen[name] = 1;
      out.push({name:name, lv:lv, note:note, basis:basis});
    }

    GS_SEASON.forEach(function(g){
      var list = g.s[si]||[];
      if(list.indexOf(tz)>=0){
        /* 将军箭附加条件：须八字有相冲（弓）方成箭 */
        if(g.n==='将军箭'){
          var hasChong = false;
          for(var i=0;i<4 && !hasChong;i++) for(var j=i+1;j<4;j++){
            if(pairIn(BZ.zhis[i], BZ.zhis[j], DIZHI_CHONG)){ hasChong=true; break; }
          }
          if(!hasChong) return;
          hit(g.n, g.lv, g.note+'（本命四支有冲，弓箭俱全，成箭）', SEASON4[si]+'月见'+tz+'时');
          return;
        }
        hit(g.n, g.lv, g.note, SEASON4[si]+'月见'+tz+'时');
      }
    });

    GS_MONTH.forEach(function(g){
      if(!lm) return;
      var list = g.m[lm]||[];
      if(list.indexOf(tz)>=0) hit(g.n, g.lv, g.note, '农历'+lm+'月见'+tz+'时');
    });

    GS_YG.forEach(function(g){
      var list = g.m[yg]||[];
      if(list.indexOf(tz)>=0) hit(g.n, g.lv, g.note, '年干'+yg+'见'+tz+'时');
    });

    GS_YZ.forEach(function(g){
      var list = g.m[yz]||[];
      if(list.indexOf(tz)>=0) hit(g.n, g.lv, g.note, '年支'+yz+'见'+tz+'时');
    });

    GS_NAYIN.forEach(function(g){
      var list = (nayinWx && g.m[nayinWx]) || [];
      if(list.indexOf(tz)>=0) hit(g.n, g.lv, g.note, '纳音'+nayinWx+'见'+tz+'时');
    });

    GS_SEX.forEach(function(g){
      var list = g.m[sex]||[];
      if(list.indexOf(tz)>=0) hit(g.n, g.lv, g.note, (sex?'男':'女')+'命见'+tz+'时');
    });

    GS_MONTHFIX.forEach(function(g){
      if(!lm) return;
      var list = g.m[yz]||[];
      if(list.indexOf(lm)>=0) hit(g.n, g.lv, g.note, '年支'+yz+'生于农历'+lm+'月');
    });

    return out;
  }

  /* ============================================================
     二、八字质量（权重 55）
     基准 60，各分项加减后钳制 [0,100]。
     分项：旺衰中和、格局成破、调候到位、五行流通、地支刑冲合害破、神煞、旬空。
     ============================================================ */

  /* 神煞权重（本站归纳量值，神煞名录与吉凶属性依 bazi-data.js pillarSha 与《协纪辨方书》） */
  var SS_JI_W = {'天乙贵人':6,'天德贵人':6,'月德贵人':6,'三奇贵人':5,'天赦':6,'天德合':4,'月德合':4,
    '文昌贵人':4,'禄神':4,'金舆':3,'将星':3,'学堂':3,'天医':3,'太极贵人':3,'福星贵人':3,
    '天厨贵人':3,'词馆':3,'国印贵人':3,'德秀贵人':3,'驿马':2,'华盖':2,'天喜':3,'红鸾':2,'暗禄':2};
  var SS_XIONG_W = {'十恶大败':8,'孤鸾':6,'羊刃':5,'魁罡':5,'阴差阳错':5,'四废':6,'金神':4,
    '亡神':4,'劫煞':4,'勾煞':4,'绞煞':4,'天罗':4,'地网':4,'飞刃':4,'流霞':4,'血刃':3,
    '丧门':4,'吊客':4,'孤辰':3,'寡宿':3,'破碎煞':3,'童子':3,'八专':3,'九丑':3,'红艳煞':3,'受死':4};

  /* 地支关系权重：按宫位分（日支＝婚姻宫最重、月支＝根基、时支＝子女宫、年支＝祖上） */
  var GONG_W = {0:3, 1:6, 2:8, 3:5};   // 年、月、日、时
  var GONG_NAME = ['年','月','日','时'];

  function baziQuality(BZ, A){
    var items = [], s = 60;
    function push(name, delta, kind){ items.push({name:name, delta:delta, kind:kind}); }

    /* ① 旺衰中和度（±12）：中和为贵，过强过弱皆偏枯。
       措辞用"适中"而非"中和"，避免与 A.strength 的"中和偏强、偏弱"档位名相冲突。 */
    var sc = (typeof A.score==='number') ? A.score : 6;
    if(sc>=4.5 && sc<=8.5){ s+=12; push('旺衰适中（'+A.strength+'，三因子 '+sc.toFixed(1)+'）', 12, 'ji'); }
    else if((sc>=3 && sc<4.5) || (sc>8.5 && sc<=10)){ s+=7; push('旺衰略偏（'+A.strength+'，三因子 '+sc.toFixed(1)+'）', 7, 'ji'); }
    else if((sc>=1.5 && sc<3) || (sc>10 && sc<=12)){ s+=2; push('旺衰偏枯（'+A.strength+'，三因子 '+sc.toFixed(1)+'）', 2, 'neutral'); }
    else { s-=5; push('旺衰过偏（'+A.strength+'，三因子 '+sc.toFixed(1)+'）', -5, 'xiong'); }

    /* ② 格局成破（±15）＋ 变格、外格奇格加权（+2~+8）
       分支顺序必须"先具体、后笼统"：'半成格（用神半透）'、'待成格（用神未透）' 皆含 '成格' 二字，
       若先判 '成格' 则二者被截胡（半成格拿成格的 +11、待成格也拿 +11），旧码正是此序，
       半成格与待成格两档形同虚设，现予改正。
       变格（专旺、从、两气、化气）与外格奇格（井栏叉、玄武当权、飞天禄马…）另立一途：
       其成格条件是自足的（井栏叉＝庚日＋申子辰三合水局全＋无丙丁巳午破格，见《三命通会》），
       而 bazi-data 的 geLevel 对杂格沿用正格"用神透干得根"口径，会把已成立之奇格再降为"半成格"
       （庚辰时的上等井栏叉即因此只落半成）。故此处对变格、杂格改按 geQing
       （依格局用神判的清浊：清、半清、浊）定档，不再采 geLevel 的透干得根口径。
       加权依 bazi-data ZAGE_DEF 的 pri，该字段是本站归纳的"成格严格度"量值（非古籍），
       pri≥32 者须三合、三会局全方成（井栏叉 40、玄武当权 32），远苛于仅凭日柱即得的
       魁罡、日德（pri 8~10），故分档加权，使上等奇格不致与寻常正格同分。 */
    var lv = A.geLevel||'', gn = A.geName||'', qing = A.geQing||'';
    if(lv.indexOf('破格')>=0){ s-=12; push('破格：'+gn, -12, 'xiong'); }
    else if(A.geOuter){ s+=11; push('成格（特殊格）：'+gn, 11, 'ji'); }
    else if(A.isZaGe){
      if(qing.indexOf('半清')>=0){ s+=11; push('成格：'+gn, 11, 'ji'); }
      else if(qing.indexOf('清（')>=0){ s+=15; push('格局清纯：'+gn, 15, 'ji'); }
      else if(lv.indexOf('待成格')>=0){ s+=1; push('待成格：'+gn, 1, 'neutral'); }
      else { s+=5; push('半成格：'+gn, 5, 'ji'); }
    }
    else if(lv.indexOf('清纯')>=0){ s+=15; push('格局清纯：'+gn, 15, 'ji'); }
    else if(lv.indexOf('半成格')>=0){ s+=5; push('半成格：'+gn, 5, 'ji'); }
    else if(lv.indexOf('待成格')>=0){ s+=1; push('待成格：'+gn, 1, 'neutral'); }
    else if(lv.indexOf('成格')>=0){ s+=11; push('成格：'+gn, 11, 'ji'); }
    else if(gn){ s+=3; push('格局：'+gn, 3, 'neutral'); }
    /* 变格、外格奇格加权（破格则贵气已失，不加） */
    if(lv.indexOf('破格')<0){
      var pri = 0, extKind = '';
      if(A.geOuter){ pri = 24; extKind = '变格'; }
      else if(A.isZaGe && A.geZaGeAll && A.geZaGeAll.length){ pri = A.geZaGeAll[0].pri||0; extKind = '外格奇格'; }
      var geAdd = pri>=32 ? 8 : pri>=20 ? 5 : pri>0 ? 2 : 0;
      if(geAdd>0){ s+=geAdd; push(extKind+'加权：'+gn+'（成格严格度 '+pri+'）', geAdd, 'ji'); }
    }
    /* 井栏叉格专属细则（典籍明文，非本站杜撰；仅当主格确为井栏叉时适用）：
       ① 三庚透干加成 +4：《渊海子平》"不必三个庚字，若有三庚尤妙"、《三命通会》
          "天干透三庚，乃为全逢润下""井栏润下三庚为妙"，三庚为格局纯粹度之最直接表征；
       ② 时遇子申福减半 −4：《三命通会》"时遇子申，其福减半"（时支子或申者，虽成格而福气不全；
          申时另立归禄格不在此列，此条实际只落子时）；
       ③ 壬癸透干伤贵 −3：《三命通会》"若天干有壬癸字，则引申子辰为伤官……乃减分数"
          （井栏叉以冲出寅中丙火为贵，壬癸透则转伤官、贵气受损；癸未时的癸即属此）；
       ④ 戊己填实减分 −3：《三命通会》"戊巳字克伤水局不能冲寅午戌火贵，乃减分数"
          （燥土浊水局、井口填实；郭统制例戊申年之戊即古人亦不避，故仅小幅减分而非破格）。 */
    if(gn==='井栏叉格'){
      var gCount = BZ.gans.filter(function(g){ return g==='庚'; }).length;
      if(gCount>=3){ s+=4; push('井栏叉三庚透干（若有三庚尤妙，《渊海子平》）', 4, 'ji'); }
      if(BZ.zhis[3]==='子'||BZ.zhis[3]==='申'){ s-=4; push('时遇'+BZ.zhis[3]+'，福减半（《三命通会》）', -4, 'xiong'); }
      if(BZ.gans.indexOf('壬')>=0||BZ.gans.indexOf('癸')>=0){ s-=3; push('壬癸透干引作伤官，贵气减分（《三命通会》）', -3, 'xiong'); }
      if(BZ.gans.indexOf('戊')>=0||BZ.gans.indexOf('己')>=0){ s-=3; push('戊己透干克伤水局（填实减分，《三命通会》）', -3, 'xiong'); }
    }

    /* ③ 调候到位（±10）：《穷通宝鉴》"调候为急"，冬生须火、夏生须水 */
    var TH = (typeof TIAOHOU_GAN!=='undefined' && TIAOHOU_GAN[BZ.monthZ]) || [];
    if(TH.length){
      var tou = TH.some(function(g){ return BZ.gans.indexOf(g)>=0; });
      var cang = TH.some(function(g){ return BZ.zhis.some(function(z){ return (HIDE[z]||[]).indexOf(g)>=0; }); });
      if(tou){ s+=10; push('调候到位（'+TH.join('、')+'透干）', 10, 'ji'); }
      else if(cang){ s+=6; push('调候得根（'+TH.join('、')+'藏支）', 6, 'ji'); }
      else { s-=8; push('调候不足（'+TH.join('、')+'未现）', -8, 'xiong'); }
    }

    /* ④ 五行流通（±10）：忌严重偏枯，喜齐全流通。
       豁免：缺格局所忌之行，于格无损，井栏叉忌火、专旺忌官杀，此类格局正以"忌神不现"为成格要件
       （井栏叉"喜水局纯、忌火破格"，局中无火反为宜）。旧码一律按偏枯扣分，等于惩罚成格要件。 */
    var cnt = A.cnt||{};
    var jiGeWx = (A.geUse && A.geUse.jiWx) || [];
    var missing = WX5.filter(function(w){ return !(cnt[w]>0); });
    var missJi = missing.filter(function(w){ return jiGeWx.indexOf(w)>=0; });
    var miss = missing.filter(function(w){ return jiGeWx.indexOf(w)<0; });
    if(missJi.length) push('缺'+missJi.join('、')+'（格局所忌，缺之无损）', 0, 'neutral');
    if(miss.length===0){ s+=8; push('五行齐全', 8, 'ji'); }
    else if(miss.length===1){ s+=2; push('缺'+miss[0]+'一行', 2, 'neutral'); }
    else if(miss.length===2){ s-=5; push('缺'+miss.join('、')+'两行（偏枯）', -5, 'xiong'); }
    else { s-=10; push('五行缺'+miss.length+'行（严重偏枯）', -10, 'xiong'); }

    /* ⑤ 地支刑冲合害破（±18）：宫位分轻重 */
    var z = BZ.zhis;
    for(var i=0;i<4;i++){
      for(var j=i+1;j<4;j++){
        var a=z[i], b=z[j], pairTxt=GONG_NAME[i]+GONG_NAME[j];
        if(pairIn(a,b,DIZHI_CHONG)){
          var w = -Math.max(GONG_W[i], GONG_W[j]);
          s+=w; push(pairTxt+'支相冲（'+a+b+'冲）', w, 'xiong');
        } else if(pairIn(a,b,DIZHI_XING) && a!==b){
          s-=5; push(pairTxt+'支相刑（'+a+b+'刑）', -5, 'xiong');
        } else if(a===b && '辰午酉亥'.indexOf(a)>=0){
          s-=3; push(GONG_NAME[i]+'支自刑（'+a+a+'）', -3, 'xiong');
        } else if(pairIn(a,b,DIZHI_HAI)){
          s-=3; push(pairTxt+'支相害（'+a+b+'害）', -3, 'xiong');
        } else if(pairIn(a,b,DIZHI_PO)){
          s-=2; push(pairTxt+'支相破（'+a+b+'破）', -2, 'xiong');
        } else if(LIUHE[a]===b){
          s+=3; push(pairTxt+'支六合（'+a+b+'合）', 3, 'ji');
        }
      }
    }
    /* 三合、三会成局：成喜用则吉、成忌神则凶 */
    (DIZHI_SANHE||[]).forEach(function(g){
      if(g.length<4) return;
      if(g.slice(0,3).every(function(x){ return z.indexOf(x)>=0; })){
        var w=g[3];
        if((A.xiWx||[]).indexOf(w)>=0){ s+=6; push('三合'+w+'局（喜用）', 6, 'ji'); }
        else if((A.jiWx||[]).indexOf(w)>=0){ s-=5; push('三合'+w+'局（忌神）', -5, 'xiong'); }
      }
    });
    (DIZHI_SANHUI||[]).forEach(function(g){
      if(g.length<4) return;
      if(g.slice(0,3).every(function(x){ return z.indexOf(x)>=0; })){
        var w=g[3];
        if((A.xiWx||[]).indexOf(w)>=0){ s+=5; push('三会'+w+'局（喜用）', 5, 'ji'); }
        else if((A.jiWx||[]).indexOf(w)>=0){ s-=5; push('三会'+w+'局（忌神）', -5, 'xiong'); }
      }
    });

    /* ⑥ 神煞（±12）：日柱为主（复用 ZERI.dayShensha，与择事模式同一神煞源）。
       神煞、格局同名去重：魁罡、金神、日德、日贵等在 bazi-data 里既入杂格表（成格则加分）
       又被 dayShensha 列为凶煞，同一张盘自相打分，庚辰日既"魁罡格成格 +15"又"魁罡 −5"。
       故凡本命已命中的格局名（geZaGe 全表＋主格名，去"格"字），同名凶煞不再重复计分；
       十恶大败、流霞、地网等与格局名不同源者照常计，十恶大败为"无禄日"，
       与魁罡各是一事（《三命通会》《渊海子平》分列），不因取魁罡格而免。 */
    var geHit = {};
    (A.geZaGe||[]).concat(gn?[gn]:[]).forEach(function(n){ geHit[String(n).replace(/格$/,'')] = 1; });
    if(window.ZERI && ZERI.dayShensha){
      var sha = ZERI.dayShensha(BZ.gans[2], BZ.zhis[2], BZ.gans[1], BZ.zhis[1], BZ.gans[0], BZ.zhis[0], BZ.gans[3], BZ.zhis[3]);
      var jiSum=0, xiongSum=0, xiongNm=[];
      (sha.ji||[]).forEach(function(n){ jiSum += (SS_JI_W[n]||3); });
      (sha.xiong||[]).forEach(function(n){
        if(geHit[n]) return;
        xiongNm.push(n); xiongSum += (SS_XIONG_W[n]||4);
      });
      jiSum = Math.min(12, jiSum); xiongSum = Math.min(12, xiongSum);
      if(jiSum>0){ s+=jiSum; push('吉神：'+(sha.ji||[]).join('、'), jiSum, 'ji'); }
      if(xiongSum>0){ s-=xiongSum; push('凶煞：'+xiongNm.join('、'), -xiongSum, 'xiong'); }
    }

    /* ⑦ 旬空（±7）：日支空亡＝婚姻宫空、时支空亡＝子女宫空 */
    var xk = xunKong(BZ.gans[2]+BZ.zhis[2]);
    if(xk.indexOf(z[2])>=0){ s-=4; push('日支旬空（婚姻宫空）', -4, 'xiong'); }
    if(xk.indexOf(z[3])>=0){ s-=3; push('时支旬空（子女宫空）', -3, 'xiong'); }

    return {score: clamp(Math.round(s), 0, 100), items: items, raw: s};
  }

  /* 格局用神口径的 A 视图：大运层判"是否悖格"须依格局所喜所忌，不能只依扶抑、调候之综合口径。
     注意：evalGZ（bazi-data:2155）读的是 A.synthesis.xiWxEff、jiWxEff，不是 A.xiWx、A.jiWx，
     故本函数必须一并改写 synthesis，否则等于没改。
     做法：喜＝（有效喜 ∪ 格局所喜）\ 格局所忌；忌＝（有效忌 ∪ 格局所忌）\ 喜。
     即格局所忌优先级最高（破格之神恒列忌），扶抑调候口径只在其不与格局冲突处保留。
     对杂格、变格，bazi-data 已令 synthesis.xiWxEff 直接等于格局用神（bazi-data:1937），
     本函数对其无变化则原样返回 A，不重复叠加。 */
  function geLensA(A){
    if(!A || !A.geUse) return A;
    var xiGe = A.geUse.xiWx||[], jiGe = A.geUse.jiWx||[];
    if(!xiGe.length && !jiGe.length) return A;
    var syn = A.synthesis || {};
    var bXi = (syn.xiWxEff && syn.xiWxEff.length) ? syn.xiWxEff : (A.xiWx||[]);
    var bJi = (syn.jiWxEff && syn.jiWxEff.length) ? syn.jiWxEff : (A.jiWx||[]);
    var xi = bXi.slice(), ji = bJi.slice();
    xiGe.forEach(function(w){ if(xi.indexOf(w)<0) xi.push(w); });
    jiGe.forEach(function(w){ if(ji.indexOf(w)<0) ji.push(w); });
    var xi2 = xi.filter(function(w){ return jiGe.indexOf(w)<0; });
    var ji2 = ji.filter(function(w){ return xi2.indexOf(w)<0; });
    if(!xi2.length || !ji2.length) return A;
    if(xi2.join()===bXi.join() && ji2.join()===bJi.join()) return A;
    var B = {}; for(var k in A){ B[k] = A[k]; }
    var S = {}; for(var s in syn){ S[s] = syn[s]; }
    S.xiWxEff = xi2; S.jiWxEff = ji2;
    B.synthesis = S; B.xiWx = xi2; B.jiWx = ji2;
    return B;
  }

  /* ============================================================
     三、大运质量（权重 20）
     取前三步大运（0-30 岁，童限与青年运），逐运以 evalGZ 评级加减。
     【定源】大运排法复用 bazi-data.js baziDaYunSteps（阳男阴女顺、阴男阳女逆），
     评级复用 evalGZ（喜忌五行对干支逐位损益），本文件不另立口径；
     唯喜忌集合改以格局用神为主（见 geLensA），使行运不悖于所成之格。
     ============================================================ */
  function dayunQuality(BZ, A){
    var items = [], s = 60, steps = [], start = null;
    var dy;
    try{ dy = baziDaYunSteps(BZ); }catch(e){ return {score:null, items:[{name:'大运排布失败', delta:0, kind:'neutral'}], steps:[], start:null}; }
    start = dy.start;
    var AG = geLensA(A);
    if(AG !== A){
      items.push({name:'行运喜忌按格局口径：喜'+(AG.xiWx||[]).join('、')+'、忌'+(AG.jiWx||[]).join('、')
                       +'（格局所忌恒列忌，不因扶抑调候而翻转）', delta:0, kind:'neutral'});
    }
    var real = dy.steps.filter(function(x){ return x.kind==='大运'; }).slice(0,3);
    if(!real.length) return {score:null, items:[{name:'无可用大运', delta:0, kind:'neutral'}], steps:[], start:start};
    real.forEach(function(st, i){
      /* 评级与连续量并用：rating 只有 吉、中、平、凶 四档，且"喜忌交参"时多判为"平"，
         若只取 rating 则二十余个候选的大运层会大量同分、丧失区分度。
         故以 evalGZ 的 xiHits（干支各字助喜用之数）− jiHits（助忌神之数）作连续量，
         再以 rating 作结构修正（"中"＝冲用神之根，喜中有损须打折；"凶"保底加重）。 */
      var r = '平', diff = 0, xiHits = 0, jiHits = 0;
      try{ var ev = evalGZ(BZ, AG, st); r = ev.rating || '平'; xiHits = ev.xiHits||0; jiHits = ev.jiHits||0; diff = xiHits - jiHits; }catch(e){}
      var d = diff>=3 ? 14 : diff===2 ? 11 : diff===1 ? 7 : diff===0 ? 0 : diff===-1 ? -7 : diff===-2 ? -11 : -14;
      if(r==='吉' && d<7) d += 3;
      else if(r==='中' && d>0) d -= 3;
      else if(r==='凶' && d>-7) d -= 3;
      s += d;
      steps.push({gz:st.gz, age:st.age, year:st.year, rating:r, delta:d, xiHits:xiHits, jiHits:jiHits});
      items.push({name:(i+1)+'运 '+st.gz+'（'+st.age+'岁起 '+st.year+'）→ '+r
                    +'（助喜用 '+xiHits+'、助忌神 '+jiHits+'）', delta:d,
                  kind: d>0?'ji' : d<0?'xiong' : 'neutral'});
    });
    /* 起运岁数：1–10 岁为常，过晚（>10）童限无运可依，略减 */
    if(start && start.age>10){ s-=3; items.push({name:'起运偏晚（'+start.age+'岁）', delta:-3, kind:'xiong'}); }
    return {score: clamp(Math.round(s), 0, 100), items: items, steps: steps, start: start, raw: s};
  }

  /* ============================================================
     四、家长缘分（权重 15）
     每位家长各算一份子分（基准 60），最终取平均。
     分项：① 生肖关系（宝宝年支 vs 家长年支）② 日课相主（宝宝日支 vs 家长生肖）
           ③ 喜用补益（宝宝五行合家长喜用）④ 六亲星（男家长取偏财、女家长取正印）
           ⑤ 年命纳音（宝宝年命 vs 家长年命）
     【定源】生肖合冲刑害破依 bazi-data.js DIZHI_* 关系表（相破 DIZHI_PO 为本站补入，
     旧择事模式漏判此一项）；六亲星依子平通行"父为偏财、母为正印"，
     此处按家长各自所填性别取用，不预设谁是父谁是母（支持男男、女女等组合）。
     ============================================================ */
  function parentOne(babyBZ, babyA, p){
    var items = [], s = 60, tag = p.label;
    var bzYear = babyBZ.zhis[0], bzDay = babyBZ.zhis[2], pz = p.BZ.zhis[0];
    function push(name, delta, kind){ items.push({name:name, delta:delta, kind:kind}); }

    /* ① 生肖关系：宝宝年支（生肖）与家长年支（生肖），此为用户所问之"生肖关系"。
       条目名不带家长称谓：本层按家长分组输出（见 parentsFate），组标题已标明是哪位家长，
       逐条再冠家长一/二只会满屏重复，反而淹没干支与关系本身 */
    if(LIUHE[bzYear]===pz){ s+=6; push('宝宝生肖六合（'+bzYear+pz+'合）', 6, 'ji'); }
    else if(JU_OF[bzYear] && JU_OF[bzYear]===JU_OF[pz] && bzYear!==pz){ s+=5; push('宝宝生肖三合（'+bzYear+pz+'）', 5, 'ji'); }
    else if(CHONG[bzYear]===pz){ s-=10; push('宝宝生肖相冲（'+bzYear+pz+'冲）', -10, 'xiong'); }
    else if(pairIn(bzYear, pz, DIZHI_XING)){ s-=7; push('宝宝生肖相刑（'+bzYear+pz+'刑）', -7, 'xiong'); }
    else if(pairIn(bzYear, pz, DIZHI_HAI)){ s-=5; push('宝宝生肖相害（'+bzYear+pz+'害）', -5, 'xiong'); }
    else if(pairIn(bzYear, pz, DIZHI_PO)){ s-=4; push('宝宝生肖相破（'+bzYear+pz+'破）', -4, 'xiong'); }

    /* ② 日课相主：宝宝日支（日柱）与家长生肖，传统"相主"，与①并存而不替代 */
    if(LIUHE[bzDay]===pz){ s+=3; push('宝宝日支六合（相主）', 3, 'ji'); }
    else if(CHONG[bzDay]===pz){ s-=6; push('宝宝日支相冲（相主）', -6, 'xiong'); }
    else if(pairIn(bzDay, pz, DIZHI_XING)){ s-=4; push('宝宝日支相刑（相主）', -4, 'xiong'); }
    else if(pairIn(bzDay, pz, DIZHI_HAI)){ s-=3; push('宝宝日支相害（相主）', -3, 'xiong'); }
    else if(pairIn(bzDay, pz, DIZHI_PO)){ s-=2; push('宝宝日支相破（相主）', -2, 'xiong'); }

    /* ③ 喜用补益：宝宝命局五行对家长喜用神的补益程度 */
    var cnt = babyA.cnt||{}, all=0, xiTot=0;
    WX5.forEach(function(w){ var c=cnt[w]||0; all+=c; if((p.A.xiWx||[]).indexOf(w)>=0) xiTot+=c; });
    var ratio = all ? xiTot/all : 0;
    if(ratio>=0.45){ s+=12; push('宝宝五行旺喜用（占'+(ratio*100).toFixed(0)+'%，补益显著）', 12, 'ji'); }
    else if(ratio>=0.3){ s+=6; push('宝宝五行合喜用（占'+(ratio*100).toFixed(0)+'%）', 6, 'ji'); }
    else if(ratio>=0.15){ push('宝宝五行与喜用平平（占'+(ratio*100).toFixed(0)+'%）', 0, 'neutral'); }
    else { s-=6; push('宝宝五行少喜用（占'+(ratio*100).toFixed(0)+'%）', -6, 'xiong'); }

    /* ④ 六亲星：男家长取偏财、女家长取正印（子平通行"父为偏财、母为正印"），看是否现于命局 */
    var want = (p.sex===0) ? '正印' : '偏财';
    var bdg = babyBZ.gans[2], found = false, gname = null;
    for(var i=0;i<10;i++){ var g = GAN10[i]; if(typeof tenGod==='function' && tenGod(bdg,g)===want){ gname=g; break; } }
    if(gname){
      if(babyBZ.gans.indexOf(gname)>=0) found = true;
      else found = babyBZ.zhis.some(function(zz){ return (HIDE[zz]||[]).indexOf(gname)>=0; });
    }
    if(found){ s+=4; push(want+'现于命局（'+gname+'）', 4, 'ji'); }
    else { push(want+'未现于命局', 0, 'neutral'); }

    /* ⑤ 年命纳音：宝宝年命 vs 家长年命（造葬嫁娶之"相主"同源） */
    var bny = p.babyNayinWx, pny = p.nayinWx;
    if(bny && pny){
      if(WX_SHENG[bny]===pny){ s+=4; push('宝宝年命相生（'+bny+'生'+pny+'）', 4, 'ji'); }
      else if(bny===pny){ s+=2; push('宝宝年命相同（'+bny+'）', 2, 'ji'); }
      else if(WX_KE[bny]===pny){ s-=4; push('宝宝年命相克（'+bny+'克'+pny+'）', -4, 'xiong'); }
      else if(WX_KE[pny]===bny){ s+=2; push('家长年命克宝宝年命（'+pny+'克'+bny+'）', 2, 'neutral'); }
    }
    return {score: clamp(Math.round(s), 0, 100), items: items, raw: s, label: tag};
  }

  function parentsFate(babyBZ, babyA, parents){
    var valid = (parents||[]).filter(function(p){ return p && p.BZ; });
    if(!valid.length) return null;
    var subs = valid.map(function(p){ return parentOne(babyBZ, babyA, p); });
    var avg = subs.reduce(function(a,b){ return a+b.score; }, 0) / subs.length;
    var items = [];
    /* 按家长分组：每条带 grp（组名）与 grpHead（组首条）。渲染时组标题独占一行，
       组内各条不再重复家长一/二，逐条冠称谓只会满屏重复，把干支与关系本身淹掉 */
    subs.forEach(function(sb){
      sb.items.forEach(function(it, i){
        items.push({name:it.name, delta:it.delta, kind:it.kind, grp:sb.label, grpHead:(i===0)});
      });
    });
    return {score: Math.round(avg), items: items, subs: subs};
  }

  /* ============================================================
     五、避凶底线（权重 10，基准 100，只扣不加）
     传统凶日只作"避凶底线"，不作选吉主体，这是与择事模式最大的分野。
     ============================================================ */
  function baselineAvoid(BZ, ctx){
    ctx = ctx||{};
    var items = [], s = 100;
    function push(name, delta){ items.push({name:name, delta:delta, kind:'xiong'}); }
    var dz = BZ.zhis[2], mz = BZ.zhis[1];

    if(CHONG[mz]===dz){ s-=10; push('月破日（日支冲月建）', -10); }
    if(ctx.TS){
      if(CHONG[ctx.TS.zhi]===dz){ s-=10; push('岁破日（日支冲太岁）', -10); }
      else if((ctx.TS.ss||[]).indexOf(dz)>=0){ s-=6; push('三煞日（日支落三煞方）', -6); }
    }
    var ld = ctx.lunarDay||0;
    if(ld===5||ld===14||ld===23){ s-=4; push('月忌日（初五、十四、廿三）', -4); }
    if(ld===1){ s-=3; push('朔日', -3); }
    if(ld===15){ s-=3; push('望日', -3); }

    var gs = guanShaOf(BZ, ctx);
    gs.forEach(function(g){
      var d = g.lv===3 ? -8 : g.lv===2 ? -5 : -2;
      s += d;
      push('小儿关煞：'+g.name+'（'+g.basis+'）', d);
    });

    return {score: clamp(Math.round(s), 0, 100), items: items, guansha: gs, raw: s};
  }

  /* ============================================================
     六、综合评分与枚举
     权重（本站归纳，非典籍量值）：八字质量 55 ＋ 大运 20 ＋ 家长缘分 15 ＋ 避凶底线 10。
     家长未填时该层跳过，其余三层按剩余权重等比放大。
     大运层权重取 20 而非更高：该层只取前三步（童限与青年运），跨度短、候选间差异小，
     其在综合分中的角色是结构修正而非等权评分，量值按此拟定。
     ============================================================ */
  var WEIGHTS = {bazi:55, dayun:20, parents:15, avoid:10};

  /* 等级阈值：全站同尺（88/76/60/40 五档），与择日页精择分、风水页宅评地评的档位语义一致。
     大运层（20%）只取前三步（童限与青年运），同一月令窗口内各候选月柱相同、大运序列基本一致，
     该层差异天然小且以 60 为基线，会小幅压低综合分；此处不另设特例上吉线，改由权重如实承担
     （见 WEIGHTS 说明），故"上吉"唯命局结构、大运、家长缘、避凶四项俱优者可得，符"诸项俱优"之义。 */
  function gradeOf(t){
    if(t>=88) return {t:'上吉', k:'v-daji', d:'命局结构佳、大运不悖、家长缘合，诸项俱优'};
    if(t>=76) return {t:'中吉', k:'v-zhongji', d:'命局可用、无明显破败，可择'};
    if(t>=60) return {t:'平',   k:'v-ping', d:'吉凶参半，须权衡短板'};
    if(t>=40) return {t:'可备', k:'v-ping', d:'有明显短板，仅作备选；伤损较重者宜避'};
    return {t:'不宜', k:'v-daxiong', d:'结构破败或关煞叠见，切勿用'};
  }

  function scoreOne(BZ, A, ctx){
    var Q = baziQuality(BZ, A);
    var Y = dayunQuality(BZ, A);
    var P = parentsFate(BZ, A, ctx.parents);
    var B = baselineAvoid(BZ, ctx);
    var total;
    if(P){
      total = WEIGHTS.bazi*Q.score + WEIGHTS.dayun*(Y.score==null?Q.score:Y.score) + WEIGHTS.parents*P.score + WEIGHTS.avoid*B.score;
      total = total/100;
    } else {
      var wsum = WEIGHTS.bazi + WEIGHTS.dayun + WEIGHTS.avoid;
      var yv = (Y.score==null?Q.score:Y.score);
      total = (WEIGHTS.bazi*Q.score + WEIGHTS.dayun*yv + WEIGHTS.avoid*B.score)/wsum;
    }
    total = Math.round(total*10)/10;
    return {total:total, grade:gradeOf(total), Q:Q, Y:Y, P:P, B:B};
  }

  /* 排一个候选的八字（不调 adjustZiShi，本引擎自定日界：23 时后归次日） */
  function paiPan(y,m,d,h,mi,opts){
    var ty=y, tm=m, td=d, th=h, tmi=mi, trueNote='';
    if(opts && opts.useTrue && opts.lng!=null && typeof trueSolarTime==='function'){
      try{
        var ts = trueSolarTime(y,m,d,h,mi,opts.lng);
        ty=ts.y; tm=ts.m; td=ts.d; th=ts.h; tmi=ts.mi;
        trueNote = '真太阳时';
      }catch(e){}
    }
    var solar = Solar.fromYmdHms(ty,tm,td,th,tmi,0);
    var lunar = solar.getLunar();
    var ec = lunar.getEightChar();
    var yearGZ=ec.getYear(), monthGZ=ec.getMonth(), dayGZ=ec.getDay(), timeGZ=ec.getTime();
    var BZ = {
      sex: opts.sex,
      dayGan: dayGZ[0],
      gans: [yearGZ[0], monthGZ[0], dayGZ[0], timeGZ[0]],
      zhis: [yearGZ[1], monthGZ[1], dayGZ[1], timeGZ[1]],
      monthZ: monthGZ[1],
      yearGZ: yearGZ,
      ec: ec,
      lunar: lunar,
      birthYear: ty,
      solar: solar
    };
    return {BZ:BZ, lunar:lunar, solar:solar, trueNote:trueNote, y:ty, m:tm, d:td, h:th, mi:tmi};
  }

  /* 构造家长命主对象（生肖、喜用、纳音、性别），供家长缘分层使用。
     sex（1=男、0=女）随对象带回：六亲星据此取用（男取偏财、女取正印），
     不由称谓推断，故支持男男、女女等组合。
     lng/useTrue 与宝宝同一口径：家长亦按出生地经度作真太阳时校正（页面可勾选关闭），
     避免"宝宝校正、家长不校正"两套时制，致使家长时柱与六亲星判定失真。 */
  function buildParent(y,m,d,h,mi,label,sex,lng,useTrue){
    if(!y) return null;
    var r = paiPan(y,m,d,h||12,mi||0,{sex:sex, lng:(lng==null?null:lng), useTrue:!!useTrue});
    var A = baziAnalysis(r.BZ);
    var nayin = nayinOf(r.BZ.gans[0]+r.BZ.zhis[0]);
    return {BZ:r.BZ, A:A, label:label, sex:sex, nayinWx:(NAYIN_INFO[nayin]||{}).wx||''};
  }

  /* 枚举：窗口内每一天 × 每个可用时辰，逐个排盘评分。
     opts: {
       from:{y,m,d}, to:{y,m,d},
       hours:[0..11]（0=子、1=丑 … 11=亥），
       sex:1|0, lng, useTrue, lunarMonthMode:true,
       parent1:{y,m,d,h,mi,lng,useTrue,sex:'男'|'女',label},   // 旧名 father 仍兼容
       parent2:{...同上},                                      // 旧名 mother 仍兼容
       TS:{zhi, ss}
     }
     返回 {list, count, days, elapsed} */
  function enumerate(opts){
    var t0 = (typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
    /* 两位家长各自选性别（页面下拉），不预设父母。sex 只决定六亲星取用（男取偏财、女取正印），
       与生肖、日课相主、喜用补益、年命纳音诸项无关 */
    var p1 = opts.parent1 || opts.father || {}, p2 = opts.parent2 || opts.mother || {};
    var parent1 = buildParent(p1.y, p1.m, p1.d, p1.h, p1.mi, p1.label||'家长一', (p1.sex==='女'?0:1), p1.lng, p1.useTrue);
    var parent2 = buildParent(p2.y, p2.m, p2.d, p2.h, p2.mi, p2.label||'家长二', (p2.sex==='女'?0:1), p2.lng, p2.useTrue);
    var parents = [parent1, parent2].filter(Boolean);
    var babyNayinCache = {};

    var list = [], days = 0;
    var cur = new Date(opts.from.y, opts.from.m-1, opts.from.d);
    var end = new Date(opts.to.y, opts.to.m-1, opts.to.d);
    var hours = (opts.hours&&opts.hours.length) ? opts.hours : [0,1,2,3,4,5,6,7,8,9,10,11];

    while(cur<=end && days<400){
      days++;
      var y=cur.getFullYear(), m=cur.getMonth()+1, d=cur.getDate();
      var dateKey = y+'-'+m+'-'+d;
      for(var hi=0; hi<hours.length; hi++){
        var hIdx = hours[hi];
        /* 时辰中点（钟表时）：子时取 0:30（早子时口径，日柱归当日），其余取整点 */
        var clockH = (hIdx*2)%24, clockMi = (hIdx===0) ? 30 : 0;
        var r;
        try{ r = paiPan(y,m,d,clockH,clockMi,{sex:opts.sex, lng:opts.lng, useTrue:opts.useTrue}); }catch(e){ continue; }
        var A;
        try{ A = baziAnalysis(r.BZ); }catch(e){ continue; }
        var babyNayin = nayinOf(r.BZ.gans[0]+r.BZ.zhis[0]);
        var babyNayinWx = (NAYIN_INFO[babyNayin]||{}).wx||'';
        var ctxParents = parents.map(function(p){ return {BZ:p.BZ, A:p.A, label:p.label, sex:p.sex, nayinWx:p.nayinWx, babyNayinWx:babyNayinWx}; });
        var ctx = {
          lunarMonth: Math.abs(r.lunar.getMonth()),
          lunarDay: r.lunar.getDay(),
          sex: opts.sex,
          TS: opts.TS,
          parents: ctxParents
        };
        var res = scoreOne(r.BZ, A, ctx);
        list.push({
          y:y, m:m, d:d, hourIdx:hIdx,
          clockTime: (clockH<10?'0':'')+clockH+':'+(clockMi<10?'0':'')+clockMi,
          trueTime: (r.h<10?'0':'')+r.h+':'+(r.mi<10?'0':'')+r.mi,
          trueNote: r.trueNote,
          pillars: [r.BZ.gans[0]+r.BZ.zhis[0], r.BZ.gans[1]+r.BZ.zhis[1], r.BZ.gans[2]+r.BZ.zhis[2], r.BZ.gans[3]+r.BZ.zhis[3]],
          dayGan: r.BZ.dayGan, dayWx: GAN_WX[r.BZ.dayGan],
          zodiac: '鼠牛虎兔龙蛇马羊猴鸡狗猪'[ZHI_ORDER.indexOf(r.BZ.zhis[0])]||'',
          nayin: babyNayin, nayinWx: babyNayinWx,
          strength: A.strength, geName: A.geName, geLevel: A.geLevel,
          xiWx: (A.xiWx||[]).slice(), jiWx: (A.jiWx||[]).slice(),
          lunarText: r.lunar.getMonthInChinese()+'月'+r.lunar.getDayInChinese(),
          lunarMonth: ctx.lunarMonth,
          res: res
        });
      }
      cur = new Date(cur.getTime()+86400000);
    }
    list.sort(function(a,b){ return b.res.total - a.res.total; });
    var t1 = (typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
    return {list:list, count:list.length, days:days, elapsed:Math.round(t1-t0), parents:parents.map(function(p){return p.label;})};
  }

  /* 单日最优时辰（"按日看最优时辰"视图） */
  function bestPerDay(list){
    var map = {};
    list.forEach(function(it){
      var k = it.y+'-'+it.m+'-'+it.d;
      if(!map[k] || it.res.total > map[k].res.total) map[k] = it;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a,b){ return b.res.total-a.res.total; });
  }

  window.ZAOMING = {
    WEIGHTS: WEIGHTS,
    GUANSHA_CATALOG: GUANSHA_CATALOG,
    guanShaOf: guanShaOf,
    baziQuality: baziQuality,
    dayunQuality: dayunQuality,
    parentsFate: parentsFate,
    baselineAvoid: baselineAvoid,
    scoreOne: scoreOne,
    gradeOf: gradeOf,
    paiPan: paiPan,
    buildParent: buildParent,
    enumerate: enumerate,
    bestPerDay: bestPerDay
  };
})();
