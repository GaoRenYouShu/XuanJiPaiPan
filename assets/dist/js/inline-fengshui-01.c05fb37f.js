


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('fengshui.html');
    (function(){
      const FS=FENGSHUI;
      window.FS = FS;
    })();
    (function(){
      const STAR_NAMES={1:'一白',2:'二黑',3:'三碧',4:'四绿',5:'五黄',6:'六白',7:'七赤',8:'八白',9:'九紫'};
      window.STAR_NAMES = STAR_NAMES;
    })();
    (function(){
      const FS_GRID=[4,9,2,3,5,7,8,1,6];
      window.FS_GRID = FS_GRID;
    })();
    (function(){
      const FS_GUA_NUM={坎:1,坤:2,震:3,巽:4,乾:6,兑:7,艮:8,离:9};
      window.FS_GUA_NUM = FS_GUA_NUM;
    })();
    (function(){
      const STAR_WX={1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
      window.STAR_WX = STAR_WX;
    })();
    (function(){
      const WX_CLS={水:'wx-shui',火:'wx-huo',土:'wx-tu',木:'wx-mu',金:'wx-jin'};
      window.WX_CLS = WX_CLS;
    })();
    (function(){
      const {C:FW_C,OUT:FW_OUT,IN:FW_IN,CORE:FW_CORE,LAB_OUT:FW_LAB_OUT,LAB_IN:FW_LAB_IN,ARC:FW_ARC,
      HIT1:FW_HIT1,TICK0:FW_TICK0,TICK1:FW_TICK1,P0:FW_P0,P1:FW_P1}=FS.GEO440;
      window.FW_C = FW_C; window.FW_OUT = FW_OUT; window.FW_IN = FW_IN; window.FW_CORE = FW_CORE; window.FW_LAB_OUT = FW_LAB_OUT; window.FW_LAB_IN = FW_LAB_IN; window.FW_ARC = FW_ARC; window.FW_HIT1 = FW_HIT1; window.FW_TICK0 = FW_TICK0; window.FW_TICK1 = FW_TICK1; window.FW_P0 = FW_P0; window.FW_P1 = FW_P1;
    })();
    (function(){
      const {fwZhiDeg,fwShanDeg,fwJxFill,fwWangFill}=FS;
      window.fwZhiDeg = fwZhiDeg; window.fwShanDeg = fwShanDeg; window.fwJxFill = fwJxFill; window.fwWangFill = fwWangFill;
    })();
    (function(){
      const FS_ZB_ORDER=[9,2,7,6,1,8,3,4];
      window.FS_ZB_ORDER = FS_ZB_ORDER;
    })();
    (function(){
      let FS_DECL_TOUCH=false;
      window.FS_DECL_TOUCH = FS_DECL_TOUCH;
    })();
    (function(){
      let FS_ZB_BOARDS=null, FS_ZB_SEL=0, FS_ZB_PICK=0;
      window.FS_ZB_BOARDS = FS_ZB_BOARDS; window.FS_ZB_SEL = FS_ZB_SEL; window.FS_ZB_PICK = FS_ZB_PICK;
    })();
    (function(){
      let FS_BA_SEL=0, FS_BA_INFO={}, FS_BA_MG=null;
      window.FS_BA_SEL = FS_BA_SEL; window.FS_BA_INFO = FS_BA_INFO; window.FS_BA_MG = FS_BA_MG;
    })();
    (function(){
      const FS_YOU_MEAN={'生气':'旺丁旺财，主生气勃发、事业进益','延年':'主和睦长寿，夫妻和顺、人缘得助',
      '天医':'主康泰祛病，得贵人之助、财禄渐积','伏位':'主平稳守成，宜安神位与主卧',
      '绝命':'主损丁破财、伤病官非，八宅最凶','五鬼':'主火厄盗贼、口舌官非','祸害':'主疾病孤寡、退财阻滞','六煞':'主淫邪散财、是非口舌'};
      window.FS_YOU_MEAN = FS_YOU_MEAN;
    })();
    (function(){
      const FS_YOU_JX={'生气':'大吉','延年':'上吉','天医':'次吉','伏位':'吉','绝命':'大凶','五鬼':'大凶','祸害':'凶','六煞':'凶'};
      window.FS_YOU_JX = FS_YOU_JX;
    })();
    (function(){
      const FS_ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      window.FS_ZHI = FS_ZHI;
    })();
    (function(){
      const FS_PALACE_ZHI={1:['子'],2:['未','申'],3:['卯'],4:['辰','巳'],6:['戌','亥'],7:['酉'],8:['丑','寅'],9:['午']};
      window.FS_PALACE_ZHI = FS_PALACE_ZHI;
    })();
    (function(){
      const FS_NUM_CN=['','一','二','三','四','五'];
      window.FS_NUM_CN = FS_NUM_CN;
    })();
    (function(){
      let FS_NS_SEL=0, FS_NS_HIT={}, FS_NS_GZ='', FS_NS_Y=0;
      window.FS_NS_SEL = FS_NS_SEL; window.FS_NS_HIT = FS_NS_HIT; window.FS_NS_GZ = FS_NS_GZ; window.FS_NS_Y = FS_NS_Y;
    })();
    (function(){
      let FS_SHAN_SEL=0;
      window.FS_SHAN_SEL = FS_SHAN_SEL;
    })();
    (function(){
      let FS_XK_SEL=0, FS_XK_DATA=null;
      window.FS_XK_SEL = FS_XK_SEL; window.FS_XK_DATA = FS_XK_DATA;
    })();
    (function(){
      let FS_SH_SEL=0, FS_SH_DATA=null;
      window.FS_SH_SEL = FS_SH_SEL; window.FS_SH_DATA = FS_SH_DATA;
    })();
    (function(){
      let FS_YZ_SEL=0, FS_YZ_PAL=[], FS_YZ_MG=null;
      window.FS_YZ_SEL = FS_YZ_SEL; window.FS_YZ_PAL = FS_YZ_PAL; window.FS_YZ_MG = FS_YZ_MG;
    })();
    (function(){
      const SD_IN=104, SD_ZW=152, SD_SX=120, SD_HIT1=198, SD_P0=82, SD_P1=100;
      window.SD_IN = SD_IN; window.SD_ZW = SD_ZW; window.SD_SX = SD_SX; window.SD_HIT1 = SD_HIT1; window.SD_P0 = SD_P0; window.SD_P1 = SD_P1;
    })();
    (function(){
      let FS_SD_SEL=0, FS_SD_DATA=null;
      window.FS_SD_SEL = FS_SD_SEL; window.FS_SD_DATA = FS_SD_DATA;
    })();
    (function(){
      const JSY_GRP=[
      {gua:'坎',dir:'北',fav:'砂',wx:'水',shan:[['壬','jsy-n'],['子','jsy-z'],['癸','jsy-g']],sid:'jsy-x1'},
      {gua:'坤',dir:'西南',fav:'砂',wx:'土',shan:[['未','jsy-w'],['坤','jsy-k'],['申','jsy-s']],sid:'jsy-x2'},
      {gua:'震',dir:'东',fav:'砂',wx:'木',shan:[['甲','jsy-j'],['卯','jsy-m'],['乙','jsy-y']],sid:'jsy-x3'},
      {gua:'巽',dir:'东南',fav:'砂',wx:'木',shan:[['辰','jsy-c'],['巽','jsy-xun'],['巳','jsy-si']],sid:'jsy-x4'},
      {gua:'乾',dir:'西北',fav:'水',wx:'金',shan:[['戌','jsy-xu'],['乾','jsy-qian'],['亥','jsy-hai']],sid:'jsy-x6'},
      {gua:'兑',dir:'西',fav:'水',wx:'金',shan:[['庚','jsy-geng'],['酉','jsy-you'],['辛','jsy-xin']],sid:'jsy-x7'},
      {gua:'艮',dir:'东北',fav:'水',wx:'土',shan:[['丑','jsy-chou'],['艮','jsy-gen'],['寅','jsy-yin']],sid:'jsy-x8'},
      {gua:'离',dir:'南',fav:'水',wx:'火',shan:[['丙','jsy-bing'],['午','jsy-wu'],['丁','jsy-ding']],sid:'jsy-x9'}
    ];
      window.JSY_GRP = JSY_GRP;
    })();
    (function(){
      const LS_FIELDS=[['lsDoor','door'],['lsRoad','road'],['lsStove','stove'],['lsStoveDir','stoveDir'],['lsBed','bed'],['lsWell','well'],['lsWc','wc'],['lsMill','mill']];
      window.LS_FIELDS = LS_FIELDS;
    })();
    (function(){
      const GUA_OPTS=['坎','坤','震','巽','乾','兑','艮','离'].map(g=>`<option value="${g}">${g}${FS.GUA_DIR[g]}</option>`).join('');
      window.GUA_OPTS = GUA_OPTS;
    })();
    (function(){
      const LT_TYPES=Object.keys(FS.LUANTOU_DEF);
      window.LT_TYPES = LT_TYPES;
    })();
    (function(){
      const FS_DIR_DEG={北:0,东北:45,东:90,东南:135,南:180,西南:225,西:270,西北:315};
      window.FS_DIR_DEG = FS_DIR_DEG;
    })();
    (function(){
      const {OUT:FC_OUT,IN:FC_IN,CORE:FC_CORE,ARC:FC_ARC,TICK0:FC_TICK0,TICK1:FC_TICK1,
      LAB_SHAN:FC_LAB_SHAN,LAB_ZW:FC_LAB_ZW,LAB_GUA:FC_LAB_GUA,HIT0:FC_HIT0,HIT1:FC_HIT1,P0:FC_P0,P1:FC_P1}=FS.GEOFC;
      window.FC_OUT = FC_OUT; window.FC_IN = FC_IN; window.FC_CORE = FC_CORE; window.FC_ARC = FC_ARC; window.FC_TICK0 = FC_TICK0; window.FC_TICK1 = FC_TICK1; window.FC_LAB_SHAN = FC_LAB_SHAN; window.FC_LAB_ZW = FC_LAB_ZW; window.FC_LAB_GUA = FC_LAB_GUA; window.FC_HIT0 = FC_HIT0; window.FC_HIT1 = FC_HIT1; window.FC_P0 = FC_P0; window.FC_P1 = FC_P1;
    })();
    (function(){
      let FS_ZJ_SEL=0, FS_ZJ_DATA=null;
      window.FS_ZJ_SEL = FS_ZJ_SEL; window.FS_ZJ_DATA = FS_ZJ_DATA;
    })();
    fillBase();
    fsGeoInit('fs_geo_manual');
    fillXiaoWang();
    drawXiaoWang();
    fillLiuShi();
    fillZhaiXing();
    addLtRow();
    drawZhaiXing();
    drawLuantou();
    (function(){
      const FS_ROOM_PAL=[['离','南'],['坤','西南'],['兑','西'],['乾','西北'],['坎','北'],['艮','东北'],['震','东'],['巽','东南']];
      window.FS_ROOM_PAL = FS_ROOM_PAL;
    })();
    (function(){
      const FS_JI_ORDER=['生气','延年','天医','伏位'];
      window.FS_JI_ORDER = FS_JI_ORDER;
    })();
    (function(){
      const FS_XIONG_ORDER=['绝命','五鬼','祸害','六煞'];
      window.FS_XIONG_ORDER = FS_XIONG_ORDER;
    })();
    (function(){
      const FS_GUA_WX={坎:'水',坤:'土',震:'木',巽:'木',乾:'金',兑:'金',艮:'土',离:'火'};
      window.FS_GUA_WX = FS_GUA_WX;
    })();
    (function(){
      const FS_WX_KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
      window.FS_WX_KE = FS_WX_KE;
    })();
    (function(){
      const FS_XS_NM=['天斩煞','路冲枪煞','反弓煞','割脚煞','穿堂煞','横梁压顶','尖角冲射','镰刀煞','孤阴独阳','声光电磁'];
      window.FS_XS_NM = FS_XS_NM;
    })();
    (function(){
      const FS_XS_HUA={'天斩煞':'正对处设屏风、山海镇或高身绿植遮挡，缝隙方门窗少开','路冲枪煞':'冲门者置石敢当、门内玄关屏风挡煞，门前设台阶绿植缓冲','反弓煞':'反弓方置石敢当或高绿植，其方宜静不宜开门','割脚煞':'贴身方植绿缓冲，气口移离逼临方','穿堂煞':'门与窗之间设玄关、屏风或高柜阻隔，使气回旋','横梁压顶':'移床移座避开梁下，或吊顶包梁、梁下置柜化压','尖角冲射':'正对窗置凸镜、绿植；对坐卧之位久者宜改位','镰刀煞':'反弓切宅方置石敢当、高绿植，其方少开窗','孤阴独阳':'邻近方实墙封闭少开窗，宅内明亮人常聚','声光电磁':'邻方隔音遮光，卧位移离电磁源'};
      window.FS_XS_HUA = FS_XS_HUA;
    })();
    (function(){
      const FS_LS_HUA={door:'改走吉方门路；不可改则门内设玄关屏风挡煞、门楣置凸镜',road:'动线移出凶方；不可改则通道常闭、置屏风使气转折',stove:'灶座移压凶方（坐凶向吉，压绝命五鬼尤宜）',stoveDir:'调转灶口朝向吉方',bed:'移床至吉方；不可移则床头靠吉方墙、床侧挂帘',well:'饮水位（水塔）移吉方；不可移则常加盖保洁',wc:'卫生间宜压凶方；已占吉方者常闭门、置绿植与常换气',mill:'洗衣机等动器移压凶方'};
      window.FS_LS_HUA = FS_LS_HUA;
    })();
    (function(){
      const FS_ST_ORD={veto:0,bad:1,warn:2,na:3,ok:4};
      window.FS_ST_ORD = FS_ST_ORD;
    })();
    (function(){
      let fsFinalTimer=null;
      window.fsFinalTimer = fsFinalTimer;
    })();
    ['drawLiuShi','drawJsy','drawXingSha','drawLuantou','drawZhaiXing','drawChuanGong','drawSanHe','drawXiaoWang'].forEach(function(n){
      const f=window[n];
      if(typeof f!=='function') return;
      window[n]=function(){ const r=f.apply(this,arguments); fsQueueFinal(); return r; };
    });
    fsRestoreModState();
    window.addEventListener("beforeunload", function(){ if(window.xjRefreshTakeover) return; try{ localStorage.setItem("fs_scroll", String(window.scrollY)); }catch(e){} });
    fsInitDefaults();
    try{ if(window.xjRefreshTakeover){} else { const sy=parseInt(localStorage.getItem("fs_scroll")||"0",10); if(sy>0) setTimeout(function(){ window.scrollTo(0, sy); }, 0); } }catch(e){};
    mountAI(function(){
      let s='风水';
      const b=getBase();
      const dv=document.getElementById('zbDate').value;
      if(dv){
        const [y,m,d]=dv.split('-').map(Number);
        const ctx=FS_ZB_CTX(y,m,d);
        const yb=FS.yearZiBai(ctx.yGzYear); const mb=FS.monthZiBai(ctx.yGz[1],ctx.mGz[1]);
        const dzb=FS.dayZiBai(ctx.off,ctx.asc,ctx.base);
        /* 入中各星的吉凶一并给出，与页面详情条同口径：只给星不给吉凶，读不出这一盘主星的好坏 */
        s+=`\n紫白飞星-${y}年${m}月${d}日（${ctx.yGz}年${ctx.mGz}月，日紫白${ctx.seg}${ctx.asc?'顺':'逆'}行）：年入中${STAR_NAMES[yb.inCenter]}（${FS.STAR_JX[yb.inCenter]}）、月入中${STAR_NAMES[mb.inCenter]}（${FS.STAR_JX[mb.inCenter]}）、日入中${STAR_NAMES[dzb.inCenter]}（${FS.STAR_JX[dzb.inCenter]}）。`;
      }
      try{
        const mg=mingGua(b.mingYear,b.male);
        if(mg) s+=`\n八宅（${b.mingYear}年${b.male?'男':'女'}命，立春换年）：命卦${mg.gua}（${mg.group}）。`;
      }catch(e){}
      try{
        const ns=FS.nianSha(b.flowYear); s+=`\n流年太岁（${b.flowYear}年）：太岁${ns.taiSui.zhi}、岁破${ns.suiPo.zhi}、三煞${ns.sanSha.map(x=>x.name+x.zhi).join('、')}、五黄${ns.wuHuang.dir}。`;
      }catch(e){}
      try{
        const lz=FS.lingZheng(FS.yunQi(b.flowYear).yun);
        if(lz) s+=`\n零正神（${b.flowYear}年${FS.yunQi(b.flowYear).yun}运）：正神${lz.zhengGua}${lz.zhengDir}、零神${lz.lingGua}${lz.lingDir}，正神宜高实、零神宜水。`;
      }catch(e){}
      try{
        const si=FS.shanInfo(b.sitShan,b.flowYear);
        if(si) s+=`\n坐山${b.sitShan}山（${si.bagua}卦${si.wx}）${si.kongWang?'（空亡）':''}${si.jian?'（兼向）':''}。`;
      }catch(e){}
      try{
        const xk=FS.xuanKong(b.sitShan,b.faceShan,b.flowYear,b.deg,b.faceDeg, b.yunOv);
        if(xk) s+=`\n玄空（坐${b.sitShan}向${b.faceShan} ${b.flowYear}年）：${xk.yun.yuan}${xk.yun.yun}运，格局${xk.geju}。`;
      }catch(e){}
      return s;
    }, '风水', { share:{ page:"fengshui", title:"风水", result:"#fsmod-l5", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ fsNow(); }); } } });
  }, 0);
});
