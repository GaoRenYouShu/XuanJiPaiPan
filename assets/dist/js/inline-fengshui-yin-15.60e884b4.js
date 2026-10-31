


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('fengshui-yin.html');
    (function(){
      const FS=FENGSHUI;
      window.FS = FS;
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
      const WX_CLS={水:'wx-shui',火:'wx-huo',土:'wx-tu',木:'wx-mu',金:'wx-jin'};
      window.WX_CLS = WX_CLS;
    })();
    (function(){
      const ZHI_FANG_Y={子:'北',丑:'东北',寅:'东北',卯:'东',辰:'东南',巳:'东南',午:'南',未:'西南',申:'西南',酉:'西',戌:'西北',亥:'西北',坤:'西南',艮:'东北',巽:'东南',乾:'西北'};
      window.ZHI_FANG_Y = ZHI_FANG_Y;
    })();
    (function(){
      const CHONG={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
      window.CHONG = CHONG;
    })();
    (function(){
      const FS_ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      window.FS_ZHI = FS_ZHI;
    })();
    (function(){
      const FS_ZB_ORDER=[9,2,7,6,1,8,3,4];
      window.FS_ZB_ORDER = FS_ZB_ORDER;
    })();
    (function(){
      const FS_PALACE_ZHI={1:['子'],2:['未','申'],3:['卯'],4:['辰','巳'],6:['戌','亥'],7:['酉'],8:['丑','寅'],9:['午']};
      window.FS_PALACE_ZHI = FS_PALACE_ZHI;
    })();
    (function(){
      const STAR_NAMES={1:'一白',2:'二黑',3:'三碧',4:'四绿',5:'五黄',6:'六白',7:'七赤',8:'八白',9:'九紫'};
      window.STAR_NAMES = STAR_NAMES;
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
      const FW_IN3=104, FW_LAB_ZW=152, FW_LAB_SX=120, FW_P1_3=100;
      window.FW_IN3 = FW_IN3; window.FW_LAB_ZW = FW_LAB_ZW; window.FW_LAB_SX = FW_LAB_SX; window.FW_P1_3 = FW_P1_3;
    })();
    (function(){
      let FS_DECL_TOUCH=false;
      window.FS_DECL_TOUCH = FS_DECL_TOUCH;
    })();
    (function(){
      const XL_ITEMS=[
      {id:'xl-ll', step:'觅龙', name:'来龙', tip:'龙势八格：进龙最吉，生龙、强龙、顺龙为吉，弱龙、退龙渐衰，逆龙、死龙不可立穴',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'进龙',t:'进龙（由低至高，节节增高）',w:1,d:'最吉，主进益发福，龙真穴的可乘'},
        {v:'生龙',t:'生龙（星辰起伏，枝脚活动）',w:0.8,d:'吉，气势生机，主生旺福气'},
        {v:'强龙',t:'强龙（奔走势力，枝脚撑拏）',w:0.8,d:'吉，力量雄盛，须防粗雄无收'},
        {v:'顺龙',t:'顺龙（枝脚顺出，抱穴如辑）',w:0.6,d:'吉，护卫有情，宜就枝脚环处点穴'},
        {v:'弱龙',t:'弱龙（懒缓瘦弱，峰峦无骨）',w:-0.2,d:'福力浅薄，纵有穴亦发迟'},
        {v:'退龙',t:'退龙（由高至低，步步后退）',w:-0.6,d:'主退败，须另寻前进之势'},
        {v:'逆龙',t:'逆龙（枝脚逆趋，回顾反背）',w:-0.9,d:'背离无情，穴不可立'},
        {v:'死龙',t:'死龙（直硬呆板，无起伏变易）',w:-1,d:'不可立穴，龙不真则穴亦虚'}
       ]},
      {id:'xl-xw', step:'察砂', name:'玄武（穴后）', tip:'穴后主坐后依托：垂头俯就为有情，昂首拒尸为无情',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'垂头俯就',t:'垂头俯就，缓坡有情',w:1,d:'后有真靠，坐后得力，主安稳久远'},
        {v:'有靠稍陡',t:'有靠而稍陡',w:0.6,d:'依托尚可用，须防压穴，宜退步就缓处'},
        {v:'平缓无依',t:'平缓无依',w:0,d:'无靠亦无压，须借龙虎与案朝补之'},
        {v:'昂首拒尸',t:'昂首拒尸，陡峻压穴',w:-1,d:'玄武不垂头，穴后无情，不可立穴'}
       ]},
      {id:'xl-zq', step:'察砂', name:'朱雀（案朝）', tip:'堂前主照应：案山端凝、朝山拱揖为有情，反背斜飞为无情',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'案朝拱揖',t:'案山端凝、朝山拱揖',w:1,d:'前有照应，堂气收摄，主贵速'},
        {v:'有案无朝',t:'有案无朝',w:0.6,d:'近案有情而远朝不足，主安稳不主大贵'},
        {v:'案朝低远',t:'案朝低远',w:0,d:'照应有而不力，堂气难收，须水城补救'},
        {v:'反背斜飞',t:'反背斜飞，水走无情',w:-1,d:'朱雀无情的，明堂不聚，改向或另寻'}
       ]},
      {id:'xl-lh', step:'察砂', name:'龙虎（左右）', tip:'左右主藏风：环抱相称为吉，缺漏高压反窜为凶；青龙宜蜿蜒，白虎宜驯俯',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'环抱相称',t:'环抱护卫，高低相称',w:1,d:'左右护卫，藏风聚气，全美之局'},
        {v:'有抱略偏',t:'有抱而略偏',w:0.6,d:'护卫可用而力不均，宜就偏重一侧避让'},
        {v:'长短不均',t:'一长一短，高低不称',w:0,d:'藏风不足，须借水口与案山补之'},
        {v:'缺漏反窜',t:'缺漏不全，高压反窜',w:-1,d:'龙虎不全或反窜，风吹气散，不可用'}
       ]},
      {id:'xl-sk', step:'观水', name:'水口', tip:'去水主内气关锁：罗星华表塞口为上，直泄无拦为凶',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'罗星华表',t:'华表罗星关锁',w:1,d:'水口有贵砂镇塞，主大贵，内气不泄'},
        {v:'关锁紧固',t:'关锁紧固，有砂拦截',w:0.6,d:'水口固则内气自聚，财丁可守'},
        {v:'有拦不紧',t:'有拦而不紧',w:0,d:'关锁不足，财来财去，宜培补或改向'},
        {v:'直泄无拦',t:'直泄无拦，一泻千里',w:-1,d:'水口无拦，财丁难聚，另寻为要'}
       ]},
      {id:'xl-js', step:'观水', name:'界水', tip:'五城水形：金城最吉，水城次之，土城平吉，木城直冲为凶，火城尖斜大凶',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'金城',t:'金城（弯环如带，环抱穴前）',w:1,d:'最吉，屈曲有情，主富贵绵长'},
        {v:'水城',t:'水城（玄曲徊环）',w:0.6,d:'吉，聪明文秀，与金城并美'},
        {v:'土城',t:'土城（方正横平）',w:0,d:'平吉，主稳健，须近身有情方可用'},
        {v:'木城',t:'木城（直急冲射）',w:-0.8,d:'凶，直冲穴前主凶祸，宜砂拦截或改向'},
        {v:'火城',t:'火城（尖斜反走）',w:-1,d:'大凶，主火灾刑伤、离乡败绝'}
       ]},
      {id:'xl-mt', step:'点穴', name:'明堂', tip:'明堂主容气容水：团聚平正为上，倾泻破碎狭逼污塞为凶',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'团聚宽畅',t:'团聚平正，洁净宽畅',w:1,d:'堂局端正，容气容水，穴情真的'},
        {v:'平正稍窄',t:'平正而稍窄',w:0.6,d:'堂局可容而局促，发福有限'},
        {v:'宽而不聚',t:'宽而不聚',w:0,d:'堂局散漫，气不凝聚，须界水与案山收束'},
        {v:'倾泻污塞',t:'倾泻破碎，狭逼污塞',w:-1,d:'明堂倾泻破碎，气散不聚，非真穴'}
       ]},
      {id:'xl-ts', step:'点穴', name:'土色', tip:'金井验土：细坚油润、五色俱备为贵，砂砾枯燥、黑湿臭秽无生气',
       opts:[
        {v:'',t:'未详',w:null,d:'实地详审后再定'},
        {v:'五色俱备',t:'细坚油润，五色俱备',w:1,d:'土润有气，金井之验得吉，生气所聚'},
        {v:'细润色正',t:'细坚润而色正',w:0.6,d:'土有生气而气未全，可用'},
        {v:'土色一般',t:'土色一般',w:0,d:'土无验可凭，须以龙穴砂水四证互参'},
        {v:'枯燥臭秽',t:'砂砾枯燥，黑湿臭秽',w:-1,d:'土无生气，非真穴所在'}
       ]}
    ];
      window.XL_ITEMS = XL_ITEMS;
    })();
    (function(){
      const XL_HOST_IN={'觅龙':'xlLlIn','察砂':'xlShaIn','观水':'xlShuiIn','点穴':'xlXueIn'};
      window.XL_HOST_IN = XL_HOST_IN;
    })();
    (function(){
      const XL_HOST_OUT={'觅龙':'xlLlOut','察砂':'xlShaOut','观水':'xlShuiOut','点穴':'xlXueOut'};
      window.XL_HOST_OUT = XL_HOST_OUT;
    })();
    (function(){
      let FS_XK_SEL=0, FS_XK_DATA=null;
      window.FS_XK_SEL = FS_XK_SEL; window.FS_XK_DATA = FS_XK_DATA;
    })();
    (function(){
      let FS_YSHAN_SEL=0;
      window.FS_YSHAN_SEL = FS_YSHAN_SEL;
    })();
    (function(){
      let FS_CT_SEL=0, FS_TD_SEL=0;
      window.FS_CT_SEL = FS_CT_SEL; window.FS_TD_SEL = FS_TD_SEL;
    })();
    (function(){
      let FS_XM_SEL=0, FS_XM_DATA=null;
      window.FS_XM_SEL = FS_XM_SEL; window.FS_XM_DATA = FS_XM_DATA;
    })();
    (function(){
      let FS_NS_SEL=0, FS_NS_HIT={}, FS_NS_GZ='';
      window.FS_NS_SEL = FS_NS_SEL; window.FS_NS_HIT = FS_NS_HIT; window.FS_NS_GZ = FS_NS_GZ;
    })();
    (function(){
      const SH_USE=FS.SH_USE;
      window.SH_USE = SH_USE;
    })();
    (function(){
      let FS_SH_SEL=0, FS_SH_DATA=null;
      window.FS_SH_SEL = FS_SH_SEL; window.FS_SH_DATA = FS_SH_DATA;
    })();
    (function(){
      const {OUT:FC_OUT,IN:FC_IN,CORE:FC_CORE,ARC:FC_ARC,TICK0:FC_TICK0,TICK1:FC_TICK1,
      LAB_SHAN:FC_LAB_SHAN,LAB_ZW:FC_LAB_ZW,LAB_GUA:FC_LAB_GUA,HIT0:FC_HIT0,HIT1:FC_HIT1,P0:FC_P0,P1:FC_P1}=FS.GEOFC;
      window.FC_OUT = FC_OUT; window.FC_IN = FC_IN; window.FC_CORE = FC_CORE; window.FC_ARC = FC_ARC; window.FC_TICK0 = FC_TICK0; window.FC_TICK1 = FC_TICK1; window.FC_LAB_SHAN = FC_LAB_SHAN; window.FC_LAB_ZW = FC_LAB_ZW; window.FC_LAB_GUA = FC_LAB_GUA; window.FC_HIT0 = FC_HIT0; window.FC_HIT1 = FC_HIT1; window.FC_P0 = FC_P0; window.FC_P1 = FC_P1;
    })();
    (function(){
      let FS_ZH_SEL=0, FS_ZH_DATA=null;
      window.FS_ZH_SEL = FS_ZH_SEL; window.FS_ZH_DATA = FS_ZH_DATA;
    })();
    (function(){
      let FINAL_ITEMS=[], FINAL_SCORE=null;
      window.FINAL_ITEMS = FINAL_ITEMS; window.FINAL_SCORE = FINAL_SCORE;
    })();
    (function(){
      const YIN_W={'1 觅龙':0.09,'2 察砂':0.06,'3 观水':0.06,'4 点穴':0.09,'5 立向':0.22,'6 定线':0.15,'7 配仙命':0.13,'8 择日':0.20};
      window.YIN_W = YIN_W;
    })();
    (function(){
      const YIN_POS_W=0.80, YIN_ZE_W=0.20;
      window.YIN_POS_W = YIN_POS_W; window.YIN_ZE_W = YIN_ZE_W;
    })();
    renderXlInput();
    fillBase();
    fsGeoInit('fsy_geo_manual');
    fillBuLong();
    (function(){
      /* 静态页已带定值，回填只补空框，载入不按访问日改盘。 */
      const n=new Date();
      const de=document.getElementById('baseYear2');
      if(de && !de.value) de.value=n.getFullYear();
      const zd=document.getElementById('zrDate');
      if(zd && !zd.value) zd.value=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
      /* 成课默认窗口：起始日起一个月 */
      const ckf=document.getElementById('ckFrom'), ckt=document.getElementById('ckTo');
      if(ckf && !ckf.value) ckf.value=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
      if(ckt && !ckt.value){
        const e=new Date(n.getTime()+30*86400000);
        ckt.value=e.getFullYear()+'-'+String(e.getMonth()+1).padStart(2,'0')+'-'+String(e.getDate()).padStart(2,'0');
      }
    })();
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) fsSaveModState();
    },true);
    fsRestoreModState();
    window.addEventListener("beforeunload", function(){ if(window.xjRefreshTakeover) return; try{ localStorage.setItem("fsy_scroll", String(window.scrollY)); }catch(e){} });
    try{
      if(!window.xjRefreshTakeover){
        const sy=parseInt(localStorage.getItem("fsy_scroll")||"0",10);
        if(sy>0) setTimeout(function(){ window.scrollTo(0, sy); }, 0);
      }
    }catch(e){};
    mountAI(function(){
      const b=getBase();
      let s='阴宅风水';
      const xk=FS.xuanKong(b.sitShan,b.faceShan,b.flowYear,b.deg,b.faceDeg);
      if(xk) s+=`\n玄空（坐${b.sitShan}向${b.faceShan} ${b.flowYear}年）：${xk.yun.yuan}${xk.yun.yun}运，格局${xk.geju}。`;
      try{
        const si=FS.shanInfo(b.sitShan,b.flowYear,b.deg);
        if(si) s+=`\n坐山${b.sitShan}山（${si.bagua}卦${si.wx}）${si.kongWang?'（空亡）':''}${si.jian?'（兼向）':''}。`;
      }catch(e){}
      try{
        const ns=FS.nianSha(b.flowYear); s+=`\n安葬流年（${b.flowYear}年）：太岁${ns.taiSui.zhi}、岁破${ns.suiPo.zhi}、三煞${ns.sanSha.map(x=>x.name+x.zhi).join('、')}、五黄${ns.wuHuang.dir}。`;
      }catch(e){}
      try{
        const xmGz=FS.yearGZ(b.xianMingYear);
        const sz=FS.SHAN_SHUANGZHI[b.sitShan];
        const rel=FS.zhiGuanXi(xmGz[1], sz);
        const lmg=FS.luMaGui(xmGz);
        s+=`\n仙命：${xmGz}（纳音${FS.nayin(xmGz).name}），配坐山双山支${sz}：${rel.name}（${rel.jx}）；禄${lmg.lu}、马${lmg.ma}、贵人${lmg.guiren.join('、')}。`;
      }catch(e){}
      try{
        const bs=FS.baSha(b.sitShan), tq=FS.huangQuan(b.faceShan), th=FS.taoHuaShui(b.sitShan);
        s+=`\n煞法：八煞${bs.gua}山忌${bs.zhi}方；${tq.none?'立'+b.faceShan+'向黄泉口诀未列':'立'+b.faceShan+'向黄泉在'+tq.zhi}方；桃花水在${th.zhi}方。`;
      }catch(e){}
      try{
        const tg=FS.tianXingGui(b.sitShan);
        s+=`\n天星立向：${tg.gui?('坐山应'+tg.star+'（'+tg.mean+'）'):'坐山无催官核心贵星，立向以玄空三合为主'}`;
      }catch(e){}
      try{
        const dv=document.getElementById('zrDate').value;
        if(dv){
          const [zy,zm,zd2]=dv.split('-').map(Number);
          const ctx=YIN_CTX(zy,zm,zd2);
          s+=`\n安葬择日（${dv}）：日课${ctx.yGz}年${ctx.mGz}月${ctx.dayGz}日，节气月建${ctx.mGz[1]}。`;
        }
      }catch(e){}
      return s;
    }, '阴宅风水', { share:{ page:"fengshui-yin", title:"阴宅风水", result:"#xkOut", recast:function(){ try{ fsApplyBase(); }catch(e){} } } });
  }, 0);
});
