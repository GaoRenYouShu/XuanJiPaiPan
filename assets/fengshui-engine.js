/* 风水引擎：年月日时紫白飞星 / 八宅游年 / 流年方位煞 / 玄空飞星 / 三合水法 / 分金龙例，确定性计算。
   【定源体例】各算法块以【定源】注明典籍依据与可校验锚点（如八运子山午向=旺山旺向壬山三格癸亥/空亡/甲子），
   流派分歧处注明本页取舍；FS.selfTest() 集中校验全部锚点，任何修改后自检须全部通过；
   改锚点须先给出典籍出处，防止改对改错。 */
(function(global){
  const NINE_ORDER=[1,2,3,4,5,6,7,8,9];
  const NINE_DIR={1:'北',2:'西南',3:'东',4:'东南',5:'中',6:'西北',7:'西',8:'东北',9:'南'};
  const NINE_BAGUA={1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兑',8:'艮',9:'离'};
  const STAR_MEAN={
    1:'一白贪狼水，主财官与桃花，吉',
    2:'二黑巨门土，病符星，凶',
    3:'三碧禄存木，蚩尤星，是非口舌官讼，凶',
    4:'四绿文曲木，文昌星，利学业文贵，吉',
    5:'五黄廉贞土，正关煞，大凶',
    6:'六白武曲金，偏财与贵气，吉',
    7:'七赤破军金，盗贼与退气，凶',
    8:'八白左辅土，正财星，当旺大吉',
    9:'九紫右弼火，喜庆星，吉'
  };
  const STAR_JX={1:'吉',2:'凶',3:'凶',4:'吉',5:'大凶',6:'吉',7:'凶',8:'大吉',9:'吉'};
  const GAN='甲乙丙丁戊己庚辛壬癸', ZHI='子丑寅卯辰巳午未申酉戌亥';
  const ZHI_IDX={子:0,丑:1,寅:2,卯:3,辰:4,巳:5,午:6,未:7,申:8,酉:9,戌:10,亥:11};
  function gzIndex(gz){ for(let i=0;i<60;i++){ if(GAN[i%10]===gz[0]&&ZHI[i%12]===gz[1]) return i; } return 0; }
  function gzAtIndex(i){ i=((i%60)+60)%60; return GAN[i%10]+ZHI[i%12]; }
  function yearGZ(y){ return gzAtIndex(y-4); }
  function yearGZIndex(y){ return ((y-4)%60+60)%60; }
  function mod9(v){ const r=((v%9)+9)%9; return r===0?9:r; }
  /* 【定源】年家紫白（《协纪辨方书》三元紫白，通书通行例）：上元甲子年一白入中、中元甲子年四绿入中、
     下元甲子年七赤入中，此后每年逆退一星，180年一周。
     锚点：1864/1924/1984甲子年分别一白/四绿/七赤入中；2024三碧、2025二黑、2026一白；2026年五黄落离（南）。
     入参 year 须为立春分界之年（调用方经节气表取得）。 */
  function yearZiBai(year){
    const idx180=((year-1864)%180+180)%180;
    const base=idx180<60?1:(idx180<120?4:7);
    const off=((year-1864)%60+60)%60;
    const inCenter=mod9(base-off);
    return {inCenter, board:buildBoard(inCenter)};
  }
  function yearZiBaiByIndex(idx){
    return yearZiBai(((idx%60)+60)%60+1984);
  }
  /* 【定源】月家紫白（《协纪辨方书》通行例）：按节气月（正月=寅月）。子午卯酉年正月八白入中、
     辰戌丑未年正月五黄入中、寅申巳亥年正月二黑入中，逐月逆退一星。
     锚点：午年寅月八白、同年卯月七赤；辰年寅月五黄；寅年寅月二黑。
     入参为年支、节气月支（如 '午'、'申'），以立春与节为准，由调用方取得。
     【异说并陈】月入中之年支起例另有两说：一以"节气未至则用前月"（月入中星随节气严格换月），
     一以农历正朔定月（不依节气）；又有"甲年正月亦起二黑"之简法（不论年支三组，仅分二元）。
     本页取《协纪》通书通行三组例（子午卯酉八白、辰戌丑未五黄、寅申巳亥二黑）按节气月，
     与年家立春界口径一致；三说差异仅在闰月与节气交接数日，不影响常态月盘。 */
  function monthZiBai(yearZhi, monthZhi){
    const first={子:8,午:8,卯:8,酉:8,辰:5,戌:5,丑:5,未:5,寅:2,申:2,巳:2,亥:2}[yearZhi]||8;
    const m={寅:0,卯:1,辰:2,巳:3,午:4,未:5,申:6,酉:7,戌:8,亥:9,子:10,丑:11}[monthZhi]||0;
    const inCenter=mod9(first-m);
    return {inCenter, board:buildBoard(inCenter), yearZhi, monthZhi};
  }
  /* 飞星顺布九宫：入中星在中宫，沿洛书序顺飞（宫n飞星=入中+(n-5) mod9） */
  function buildBoard(inCenter){
    return NINE_ORDER.map(n=>{
      const s=mod9(inCenter+n-5);
      return {palace:n, dir:NINE_DIR[n], gua:NINE_BAGUA[n], star:s, mean:STAR_MEAN[s], jx:STAR_JX[s]};
    });
  }
  function fiveYellow(board){ const c=board.find(x=>x.star===5); return c?c.palace:5; }
  /* 【定源】日家紫白（《选择求真》三元阴阳遁，通书通行例）：阳遁上元（冬至至雨水）甲子日起一白顺行、
     中元（雨水至谷雨）甲子日起七赤、下元（谷雨至夏至）甲子日起四绿；阴遁上元（夏至至处暑）甲子日起九紫逆行、
     中元（处暑至霜降）甲子日起三碧、下元（霜降至冬至）甲子日起六白。值日星=本元甲子起星±距甲子日数（甲子日每六十日一现，段内唯一）。
     锚点：阳遁上元甲子日一白、八日后（癸酉）九紫；阴遁上元甲子日九紫、八日后一白。
     流派：另有冬至后一律一白顺、夏至后一律九紫逆之简法，不分三元，本页取三元分法。 */
  function dayZiBai(diff, asc, base){
    const b=base||(asc?1:9);
    const d=((diff%9)+9)%9;
    const inCenter=asc?mod9(b+d):mod9(b-d);
    return {inCenter, board:buildBoard(inCenter)};
  }
  /* 【定源】时家紫白（《协纪辨方书》通行例）：冬至后顺行、夏至后逆行，按日支三组定时首星：
     子午卯酉日子时一白（顺）/九紫（逆）；辰戌丑未日子时四绿（顺）/六白（逆）；寅申巳亥日子时七赤（顺）/三碧（逆）。
     锚点：子日子时顺一白、逆九紫；寅日寅时顺行第三时辰九紫；辰日辰时逆行第四时辰二黑。
     dayZhi=日支，hourZhiIdx=时支序（子0…亥11） */
  function hourZiBai(dayZhi, hourZhiIdx, asc){
    const g={子:0,午:0,卯:0,酉:0,辰:1,戌:1,丑:1,未:1,寅:2,申:2,巳:2,亥:2}[dayZhi]||0;
    const start=asc?[1,4,7][g]:[9,6,3][g];
    const t=((hourZhiIdx%12)+12)%12;
    const inCenter=asc?mod9(start+t):mod9(start-t);
    return {inCenter, board:buildBoard(inCenter)};
  }
  /* 【定源】八宅大游年歌（《八宅明镜》《阳宅三要》通行，歌诀定游年九星落宫）：
     乾六天五祸绝延生，坎五天生延绝祸六，艮六绝祸生延天五，震延生祸绝五天六，
       巽天五六祸生绝延，离六五绝延祸生天，坤天延绝生祸五六，兑生祸延绝六五天。
     锚点：坎：艮五鬼、震天医、巽生气、离延年、坤绝命、兑祸害、乾六煞；兑生气在乾；离延年在坎；乾绝命在离。 */
  const BAZHAI={
    坎:{group:'东四命',ji:{生气:'巽',延年:'离',天医:'震',伏位:'坎'},xiong:{绝命:'坤',五鬼:'艮',祸害:'兑',六煞:'乾'}},
    震:{group:'东四命',ji:{生气:'离',延年:'巽',天医:'坎',伏位:'震'},xiong:{绝命:'兑',五鬼:'乾',祸害:'坤',六煞:'艮'}},
    巽:{group:'东四命',ji:{生气:'坎',延年:'震',天医:'离',伏位:'巽'},xiong:{绝命:'艮',五鬼:'坤',祸害:'乾',六煞:'兑'}},
    离:{group:'东四命',ji:{生气:'震',延年:'坎',天医:'巽',伏位:'离'},xiong:{绝命:'乾',五鬼:'兑',祸害:'艮',六煞:'坤'}},
    乾:{group:'西四命',ji:{生气:'兑',延年:'坤',天医:'艮',伏位:'乾'},xiong:{绝命:'离',五鬼:'震',祸害:'巽',六煞:'坎'}},
    坤:{group:'西四命',ji:{生气:'艮',延年:'乾',天医:'兑',伏位:'坤'},xiong:{绝命:'坎',五鬼:'巽',祸害:'震',六煞:'离'}},
    艮:{group:'西四命',ji:{生气:'坤',延年:'兑',天医:'乾',伏位:'艮'},xiong:{绝命:'巽',五鬼:'坎',祸害:'离',六煞:'震'}},
    兑:{group:'西四命',ji:{生气:'乾',延年:'艮',天医:'坤',伏位:'兑'},xiong:{绝命:'震',五鬼:'离',祸害:'坎',六煞:'巽'}}
  };
  const GUA_DIR={坎:'北',震:'东',巽:'东南',离:'南',乾:'西北',坤:'西南',艮:'东北',兑:'西'};
  function baZhai(gua){
    const b=BAZHAI[gua];
    if(!b) return null;
    return {
      gua, group:b.group,
      ji:Object.keys(b.ji).map(k=>({name:k, gua:b.ji[k], dir:GUA_DIR[b.ji[k]]})),
      xiong:Object.keys(b.xiong).map(k=>({name:k, gua:b.xiong[k], dir:GUA_DIR[b.xiong[k]]}))
    };
  }
  /* 【定源】流年方位煞（《协纪辨方书》）：太岁=流年地支；岁破=对冲；三煞=劫煞灾煞岁煞，
     申子辰（年）煞在南方巳午未、寅午戌煞在北方亥子丑、巳酉丑煞在东方寅卯辰、亥卯未煞在西方申酉戌；
     年五黄按年家紫白盘落宫。
     锚点：2026丙午：太岁午、岁破子、三煞亥子丑、五黄在离（南）。 */
  const SANSHA_ZHI={申:['巳','午','未'],子:['巳','午','未'],辰:['巳','午','未'],
    寅:['亥','子','丑'],午:['亥','子','丑'],戌:['亥','子','丑'],
    巳:['寅','卯','辰'],酉:['寅','卯','辰'],丑:['寅','卯','辰'],
    亥:['申','酉','戌'],卯:['申','酉','戌'],未:['申','酉','戌']};
  const SANSHA_NAME={0:'劫煞',1:'灾煞',2:'岁煞'};
  /* 相冲支（子午、丑未、寅申、卯酉、辰戌、巳亥） */
  const CHONG={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  function nianSha(year){
    const yz=yearGZ(year)[1];
    const zhai=SANSHA_ZHI[yz]||['巳','午','未'];
    const ss=zhai.map((z,i)=>({name:SANSHA_NAME[i],zhi:z}));
    const cp=CHONG[yz];
    const yb=yearZiBai(year);
    const wy=fiveYellow(yb.board);
    return {yearZhi:yz, taiSui:{zhi:yz}, suiPo:{zhi:cp}, sanSha:ss, wuHuang:{palace:wy, dir:NINE_DIR[wy]}};
  }
  /* 二十四山 */
  /* 【定源】二十四山（《罗经》地盘正针通行例）：起子山、子山正中为周天0°，每山15度，顺布
     子癸丑艮寅甲卯乙辰巽巳丙午丁未坤申庚酉辛戌乾亥壬；八干四维随双山配支（壬子、癸丑、艮寅…乾亥）；
     山五行取正体五行（巽木、坤土、艮土、乾金，四维随卦）。 */
  const SHAN_LIST=['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
  const SHAN_BAGUA={'子':'坎','癸':'坎','丑':'艮','艮':'艮','寅':'艮','甲':'震','卯':'震','乙':'震','辰':'巽','巽':'巽','巳':'巽','丙':'离','午':'离','丁':'离','未':'坤','坤':'坤','申':'坤','庚':'兑','酉':'兑','辛':'兑','戌':'乾','乾':'乾','亥':'乾','壬':'坎'};
  const SHAN_ZHI={'子':'子','癸':'丑','丑':'丑','艮':'寅','寅':'寅','甲':'卯','卯':'卯','乙':'辰','辰':'辰','巽':'巳','巳':'巳','丙':'午','午':'午','丁':'未','未':'未','坤':'申','申':'申','庚':'酉','酉':'酉','辛':'戌','戌':'戌','乾':'亥','亥':'亥','壬':'子'};
  const SHAN_WX={'子':'水','癸':'水','丑':'土','艮':'土','寅':'木','甲':'木','卯':'木','乙':'木','辰':'土','巽':'木','巳':'火','丙':'火','午':'火','丁':'火','未':'土','坤':'土','申':'金','庚':'金','酉':'金','辛':'金','戌':'土','乾':'金','亥':'水','壬':'水'};
  /* 【定源】坐度判定（《沈氏玄空学》通行例，通说）：每山十五度，中线左右各四度半共九度为正向（下卦）；
     逾四度半为兼向，须起替卦；压两山交界线（距交界四分之一度内）为骑缝空亡，不可立向。
     卦与卦交界八缝（癸丑、寅甲、乙辰、巳丙、丁未、申庚、辛戌、亥壬，即周天22.5°+45°k）为大空亡（出卦空亡），
     卦内山与山交界（如壬子、子癸）为阴阳差错。
     锚点：子山±4.5度内正向；偏5度兼癸、偏-5度（355°）兼壬；子山7.5度骑缝=阴阳差错；壬山337.5度骑缝=大空亡。
     流派：正向范围另有正中六度一说，本页取通说九度；中州派对兼向另有同气不替之辨，见 xuanKong 注。 */
  function panJue(shan, deg){
    const i=SHAN_LIST.indexOf(shan);
    if(i<0) return null;
    const center=i*15;
    if(typeof deg!=='number'||isNaN(deg)){
      return {center, deg:null, offset:null, zheng:true, jian:false, kong:false, jianTo:'', kongType:''};
    }
    const d=((deg%360)+360)%360;
    let diff=d-center;
    diff=((diff+540)%360)-180;   /* 归一至 -180~180，正确处理跨零度山（如子山） */
    const off=Math.abs(diff);
    let jian=false, kong=false, jianTo='', kongType='';
    if(off>=7.25){
      kong=true;
      const edge=((diff>0?center+7.5:center-7.5)%360+360)%360;
      kongType=((edge-22.5)%45+45)%45===0?'大空亡（出卦空亡）':'阴阳差错（卦内山界空亡）';
    }else if(off>4.5){
      jian=true;
      jianTo=diff>0?SHAN_LIST[(i+1)%24]:SHAN_LIST[(i+23)%24];
    }
    return {center, deg:d, offset:Math.round(off*10)/10, zheng:!jian&&!kong, jian, kong, jianTo, kongType};
  }
  /* 【定源】三盘三针（《罗经透解》通行坊本，与指南 1.4 同）：三盘同刻二十四山，唯子山中心各异。
     地盘正针子山心为零度，用于立向、格龙、乘气；人盘中针较地盘逆偏七点五度（子山心落三百五十二点五度），
     用于消砂；天盘缝针较地盘顺偏七点五度（子山心落七点五度），用于纳水。
     总诀为地盘立向、人盘消砂、天盘纳水，三盘不可混用：同一实测读数在三盘下落作不同山名，
     故立向必以正针为准，消砂方用中针，纳水方用缝针。
     【流派】中针、缝针之偏度另有偏三度与偏半山等异说，本页取通行坊本之七点五度。
     锚点：周天零度在正针为子山正中、在中针落癸山、在缝针落子山初度。 */
  const ZHEN_LIST=[
    {key:'zheng', name:'正针', full:'地盘正针', c0:0,     use:'立向格龙'},
    {key:'zhong', name:'中针', full:'人盘中针', c0:352.5, use:'消砂'},
    {key:'feng',  name:'缝针', full:'天盘缝针', c0:7.5,   use:'纳水'}
  ];
  /* 按针制求落山：deg 为周天实测度（地盘子山中心为零度、向东递增），
     返回该针制下的落山、山内偏移与正兼向判定（阈值与 panJue 同一口径） */
  function zhenShan(deg, key){
    const z=ZHEN_LIST.find(x=>x.key===key)||ZHEN_LIST[0];
    const d=(((Number(deg)||0)%360)+360)%360;
    const rel=((d-z.c0+7.5)%360+360)%360;
    const idx=Math.floor(rel/15)%24, off=rel%15-7.5, abs=Math.abs(off);
    return {zhen:z, idx, shan:SHAN_LIST[idx], off:Math.round(off*100)/100,
      kong:abs>=7.25, jian:abs>4.5&&abs<7.25};
  }
  /* 坐山信息：子山正中为周天0°，每山15度。measuredDeg（选填）为罗盘实测度数，用于判正向/兼向/骑缝空亡 */
  function shanInfo(shan, year, measuredDeg){
    const i=SHAN_LIST.indexOf(shan);
    if(i<0) return null;
    const center=i*15;
    const start=((center-7.5)%360+360)%360;
    const end=(start+15)%360;
    const bagua=SHAN_BAGUA[shan], zhi=SHAN_ZHI[shan], wx=SHAN_WX[shan];
    const pj=panJue(shan, measuredDeg);
    const measured=typeof measuredDeg==='number'&&!isNaN(measuredDeg)?
      {deg:pj.deg, offset:pj.offset, zheng:pj.zheng, jian:pj.jian, kong:pj.kong, jianTo:pj.jianTo, kongType:pj.kongType}:null;
    const n=nianSha(year);
    /* 坐山煞到山：太岁、岁破、三煞按坐山所属双山配支判定（壬子同子、癸丑同丑、艮寅同寅…，八干四维随所配双山同断）；年五黄按卦宫判定 */
    const sz=SHAN_SHUANGZHI[shan]||shan;
    const atTaiSui = sz===n.taiSui.zhi;
    const atSuiPo  = sz===n.suiPo.zhi;
    const atSanSha = n.sanSha.some(s=>s.zhi===sz);
    const atWuHuang= SHAN_BAGUA[shan]===NINE_BAGUA[n.wuHuang.palace];
    return {shan, center, start, end, bagua, zhi, wx, kongWang:pj.kong, jian:pj.jian, measured,
      jianTo:pj.jianTo, kongType:pj.kongType,
      nianSha:n, atTaiSui, atSuiPo, atSanSha, atWuHuang};
  }
  /* ===================== 玄空飞星盘（山向盘） ===================== */
  /* 【定源】三元九运（通行例）：1864甲子年起上元一运，每运20年：一运1864-1883…九运2024-2043，180年一周。
     锚点：2020八白运、2024-2043九紫运（下元）。 */
  const YUN_NAMES={1:'一白坎',2:'二黑坤',3:'三碧震',4:'四绿巽',5:'五黄中',6:'六白乾',7:'七赤兑',8:'八白艮',9:'九紫离'};
  function yunQi(year, yunOverride){
    let idx=Math.floor((year-1864)/20);
    if(yunOverride){
      /* 换运盘：宅运由起宅（改运）之年定，不随流年；取最近一个该运的二十年区间 */
      const want=((yunOverride-1)%9+9)%9;
      idx=idx-((idx-want)%9+9)%9;
    }
    const yun=mod9((idx%9)+1);
    const yuan=['上元','中元','下元'][Math.floor((idx%9)/3)];
    const start=1864+idx*20;
    return {yun, yuan, name:YUN_NAMES[yun], start, end:start+19, yuanIndex:idx};
  }
  /* 飞星逆布九宫（入中星在中宫，沿洛书序逆飞） */
  function buildBoardRev(inCenter){
    return NINE_ORDER.map(n=>{
      const s=mod9(inCenter-(n-5));
      return {palace:n, dir:NINE_DIR[n], gua:NINE_BAGUA[n], star:s, mean:STAR_MEAN[s], jx:STAR_JX[s]};
    });
  }
  /* 坐山→洛书宫位 */
  const SHAN_BAZI={子:1,癸:1,丑:8,艮:8,寅:8,甲:3,卯:3,乙:3,辰:4,巽:4,巳:4,丙:9,午:9,丁:9,未:2,坤:2,申:2,庚:7,酉:7,辛:7,戌:6,乾:6,亥:6,壬:1};
  /* 【定源】沈氏替星口诀（《沈氏玄空学》）：子癸并甲申，贪狼一路行；壬卯乙未坤，五位为巨门；
     乾亥辰巽巳，连戌武曲名；酉辛丑艮丙，天星说破军；寅午庚丁上，右弼四星临。二十四山全有替星。
     锚点：替星以"运星所临宫之同元山"查诀（非本山直查）。如八运子山兼癸：山星4临巽宫、
     子天元取巽，巽替六白→6入中；向星3临震宫、午天元取卯，卯替二黑→2入中。 */
  const TI_GUA={子:1,癸:1,甲:1,申:1,壬:2,卯:2,乙:2,未:2,坤:2,乾:6,亥:6,辰:6,巽:6,巳:6,戌:6,酉:7,辛:7,丑:7,艮:7,丙:7,寅:9,午:9,庚:9,丁:9};
  /* 【定源】三元龙阴阳（《沈氏玄空学》通行例）：天元四维乾坤艮巽阳、四正子午卯酉阴；
     人元寅申巳亥阳、乙辛丁癸阴；地元甲庚丙壬阳、辰戌丑未阴。阳顺飞、阴逆飞。 */
  const SHAN_YINYANG={
    乾坤艮巽:true,子午卯酉:false,  /* 天元：四维阳、四正阴 */
    寅申巳亥:true,乙辛丁癸:false,  /* 人元：寅申巳亥阳、乙辛丁癸阴 */
    甲庚丙壬:true,辰戌丑未:false   /* 地元：甲庚丙壬阳、辰戌丑未阴 */
  };
  function shanYang(shan){ /* 阳顺飞、阴逆飞 */
    for(const k in SHAN_YINYANG){ if(k.indexOf(shan)>=0) return SHAN_YINYANG[k]; }
    return true;
  }
  /* 元旦盘卦宫三山（洛书本位）与本山三元龙归属 */
  const PALACE_SHANS={1:['壬','子','癸'],2:['未','坤','申'],3:['甲','卯','乙'],4:['辰','巽','巳'],6:['戌','乾','亥'],7:['庚','酉','辛'],8:['丑','艮','寅'],9:['丙','午','丁']};
  function yuanOf(shan){
    if('乾坤艮巽子午卯酉'.indexOf(shan)>=0) return '天';
    if('寅申巳亥乙辛丁癸'.indexOf(shan)>=0) return '人';
    return '地';
  }
  /* 元旦盘某卦宫中与本山同三元龙之山（如坎宫之天元山为子、巽宫之地元山为辰） */
  function sameYuanShan(palace, shan){
    const list=PALACE_SHANS[palace];
    if(!list) return shan;
    const y=yuanOf(shan);
    return list.find(s=>yuanOf(s)===y)||shan;
  }
  /* 【定源】下卦飞星顺逆（无常派章仲山《阴阳二宅录验》挨星例；陈益峰《玄空飞星的下卦与替卦排盘》、无常派教程同法）：
     山盘/向盘以运盘到山（到向）之星入中，查此星数在元旦盘所落卦宫，取宫中与坐山（向首）同三元龙之山，
     以该山阴阳定顺逆：阳顺阴逆；五黄入中无卦可取，依坐山（向首）本山阴阳定。
     锚点：八运子山午向山星4入中顺飞（4临巽宫、子天元取巽阳）、向星3入中逆飞（3临震宫、午天元取卯阴）＝双星到向；
     八运壬山丙向山星4入中逆飞（壬地元取巽宫地元辰阴）、向星3入中顺飞（丙地元取震宫地元甲阳）＝双星会坐；
     九运子山午向山星5入中依子阴逆飞、向星4入中依巽阳顺飞＝双星会坐（通行实盘，三六风水网九运二十四山图）；
     七运卯山酉向山星5入中依卯阴逆飞＝旺山旺向。
     【流派】坊间另有径以坐山自身三元龙阴阳定顺逆之说，与章氏例多盘不合，本页不取。 */
  function flyYang(k, shan){
    if(k===5) return shanYang(shan);
    return shanYang(sameYuanShan(k, shan));
  }
  /* 兼向替星：依入中运星所临宫之同元山查沈氏替星口诀（被替者即此同元山）；五黄入中依本山查诀。
     锚点：八运子山午向兼壬丙（兼癸丁排法同）：山星4临巽宫、子天元取巽，巽替六白6入中；向星3临震宫、取卯，卯替二黑2入中；
     八运壬山丙向兼子午：山星4取巽宫地元辰、辰替6入中，向星3取震宫地元甲、甲替1入中。 */
  function tiXing(k, shan){
    return TI_GUA[k===5?shan:sameYuanShan(k, shan)];
  }
  /* 坐向入中星：正向（下卦）山星取运盘坐山宫之星、向星取运盘向首宫之星，顺逆依 flyYang（同元山阴阳）定；
     兼向（实测度数偏离本山中线逾四度半、未压交界）依沈氏替星口诀起替卦，入中星改用同元山之替星数，顺逆仍依原运星同元山阴阳；
     压两山交界线为骑缝空亡，不可立向，盘式仍按正向下卦排出仅供参详。
     【定源锚点】八运子山午向=双星到向（山星4、向星3入中，山顺向逆）；八运壬山丙向=双星会坐；九运子山午向=双星会坐；
     八运乾山巽向=旺山旺向（山9逆、向7逆）；七运卯山酉向=旺山旺向（卯五黄入中逆）；
     八运子山兼癸/兼壬（偏6度）山星替6入中顺、向星替2入中逆。
     【流派】中州派另主张同卦宫内同阴阳相兼可不起替，阴阳不同方用替，本页取沈氏通行例：兼向一律起替。 */
  function xuanKong(sitShan, faceShan, year, sitDeg, faceDeg, yunOverride){
    const yq=yunQi(year, yunOverride);
    const yunBoard=buildBoard(yq.yun);
    const sitNum=SHAN_BAZI[sitShan], faceNum=SHAN_BAZI[faceShan];
    if(!sitNum||!faceNum) return null;
    const sitPj=panJue(sitShan, sitDeg), facePj=panJue(faceShan, faceDeg);
    const sitJian=sitPj.jian, faceJian=facePj.jian;
    const sitKong=sitPj.kong, faceKong=facePj.kong;
    const sitRaw=yunBoard.find(x=>x.palace===sitNum).star;
    const faceRaw=yunBoard.find(x=>x.palace===faceNum).star;
    const sitShun=flyYang(sitRaw, sitShan), faceShun=flyYang(faceRaw, faceShan);
    const sitIn=sitJian?tiXing(sitRaw, sitShan):sitRaw;
    const faceIn=faceJian?tiXing(faceRaw, faceShan):faceRaw;
    const sitBoard=sitShun?buildBoard(sitIn):buildBoardRev(sitIn);
    const faceBoard=faceShun?buildBoard(faceIn):buildBoardRev(faceIn);
    const toSit  = sitBoard.find(x=>x.palace===sitNum).star;
    const toFace = faceBoard.find(x=>x.palace===faceNum).star;
    const shanToFace=sitBoard.find(x=>x.palace===faceNum).star;
    const faceToSit =faceBoard.find(x=>x.palace===sitNum).star;
    /* 伏吟：山盘或向盘与运盘全同；反吟：山盘或向盘与运盘合十 */
    const sameBoard=(bd)=>bd.every(x=>x.star===yunBoard.find(y=>y.palace===x.palace).star);
    const he10Board=(bd)=>bd.every(x=>x.star+yunBoard.find(y=>y.palace===x.palace).star===10);
    const fuSit=sameBoard(sitBoard), fuFace=sameBoard(faceBoard);
    const fanSit=he10Board(sitBoard), fanFace=he10Board(faceBoard);
    let geju;
    if(toSit===yq.yun && toFace===yq.yun) geju='旺山旺向';
    else if(shanToFace===yq.yun && faceToSit===yq.yun) geju='上山下水';
    else if(shanToFace===yq.yun && toFace===yq.yun) geju='双星到向';
    else if(toSit===yq.yun && faceToSit===yq.yun) geju='双星到山';
    else if(toSit===yq.yun) geju='单旺星到山（旺丁）';
    else if(toFace===yq.yun) geju='单旺星到向（旺财）';
    else if(shanToFace===yq.yun) geju='旺星下水（损丁）';
    else if(faceToSit===yq.yun) geju='旺星上山（破财）';
    else geju='丁财不济';
    const notes=[];
    if(fuSit||fuFace) notes.push((fuSit?'山':'')+(fuSit&&fuFace?'、':'')+(fuFace?'向':'')+'盘伏吟');
    if(fanSit||fanFace) notes.push((fanSit?'山':'')+(fanSit&&fanFace?'、':'')+(fanFace?'向':'')+'盘反吟');
    if(notes.length) geju+='，'+notes.join('，');
    return {
      year, yun:yq, sitShan, faceShan, sitNum, faceNum,
      sitIn, faceIn, sitShun, faceShun, tiGua:sitJian||faceJian,
      sitJian, faceJian, sitKong, faceKong,
      yunBoard, sitBoard, faceBoard, geju,
      fuYin:{sit:fuSit, face:fuFace}, fanYin:{sit:fanSit, face:fanFace},
      toSit, toFace, shanToFace, faceToSit,
      sitMean:sitBoard.find(x=>x.palace===sitNum).mean,
      faceMean:faceBoard.find(x=>x.palace===faceNum).mean
    };
  }
  /* ===================== 九星旺衰与丁财断 ===================== */
  /* 【定源】依与当运之距定旺衰（玄空通行例）：当令为旺，来一运为生气，去一运为退气，去二运为死气，其余为煞气。
     流派：旺衰分段另有细分（去三运死、余煞等），本页取通行四段；山管人丁、水管财，逐宫山星断丁、向星断财。 */
  const WANG_SHUAI_MAP={0:'旺',1:'生',8:'退',7:'死'};
  function starWangShuai(star, yun){
    const d=((star-yun)%9+9)%9;
    return WANG_SHUAI_MAP[d]||'煞';
  }
  /* 逐宫丁财断：山星管丁、向星管财，据旺衰判丁财吉凶 */
  function gongDingCai(sitStar, faceStar, yun){
    const sWang=starWangShuai(sitStar, yun);
    const fWang=starWangShuai(faceStar, yun);
    const sJi=sWang==='旺'||sWang==='生';
    const fJi=fWang==='旺'||fWang==='生';
    if(sJi&&fJi) return {jx:'大吉', mean:'旺丁旺财，当令星到山到向，丁财两旺'};
    if(sJi) return {jx:'吉', mean:'旺丁，山星当令、生气，主人口兴旺、健康；向星退死，财平'};
    if(fJi) return {jx:'吉', mean:'旺财，向星当令、生气，主财运进益；山星退死，丁平'};
    if(sWang==='退'||fWang==='退') return {jx:'平', mean:'丁财皆平，退气星当宫，宜守成'};
    return {jx:'凶', mean:'丁财皆衰，死煞星到宫，宜静不宜动'};
  }
  /* 【定源】九星组合（山向星相会）断语，全45组，以《玄机赋》《紫白诀》《飞星赋》通行文义归纳：
     一四同宫准发科名之显、一六共宗、二七同道、三八为朋、四九为友；二三斗牛煞、六七交剑煞、
     七九回禄（火灾）、六九火烧天门、二五交加、五黄叠临诸凶局。各流派措辞有异，吉凶终以当令失令权衡
     （comboJx 之 jx 为归纳性参考，非派别定论）。键=两星数字升序拼接 */
  /* 可核典籍原文出处（仅录原文可查证之条目，逐条核对；其余条目为通行文义归纳，见 COMBO_MEAN 头注，不附会原文） */
  const COMBO_SRC={
    '14':'《紫白诀》原文：“四一同宫，准发科名之显。”',
    '79':'《紫白诀》原文：“七九合辙，常招回禄之灾。”',
    '25':'《紫白诀》有“二五交加”之诫（通行引作“罹死亡并生疾病”，诸本引文文字有异，义同）。'
  };
  const COMBO_MEAN={
    '11':'双一并行，双水成河，非水泛木浮之象，主聪明智慧，旺则文贵近官，衰则漂泊不定、桃花暗伏。',
    '12':'一二同行，土克水，坎宫水冷土塞，主中男受制、耳肾之疾、腹疾水厄；衰时尤验。',
    '13':'一三同行，水生木，震得水滋主发秀一时，但三碧是非随生，得运则文名骤起，失运则是非口舌缠身。',
    '14':'一四同宫，准发科名之显，一白四绿水木相生，文昌大格，利考试科甲、文书声名，最宜书房、书桌。',
    '15':'一五同宫，土克水，中男闭塞、肾耳之疾，主病伤缠绵之患；此方不宜动土，忌见红色黄色增凶。',
    '16':'一六共宗，金水相生，主聪明文贵、声名与财，利文书科甲；旺时大吉，衰时亦无大碍。',
    '17':'一金生水，金水多情，主口才机变、偏财暗昧；衰时主酒色耗财、口舌之争。',
    '18':'一八同宫，一白与八白，土克水，少男克中男，土水相战：旺时财源不断（财星得用），衰时主小口疾、耳肾之伤。',
    '19':'一九相会，水火既济，主聪明富足，但水克火，盛极须防起伏。',
    '22':'双二并临，巨土重叠，病符加重，主疾缠绵、寡宿断肠；忌动土，宜静宜金泄。',
    '23':'二三相会，斗牛煞，二黑三碧木土相克，主斗牛之凶、官非刑狱、六畜伤损、胃腹之疾，此方大忌冲动。',
    '24':'二四相合，利文房之贵，二黑四绿木克土，木入病土：得令主文贵田产，失令主妇人当权、姑嫂相争。',
    '25':'二五交加，病符见廉贞，主重病灾祸，田宅不安；须静不宜动，防意外伤亡。',
    '26':'二六相交，武曲病符土金相生，得令主地产厚财，失令主孤寒老疾，富屋贫人之象。',
    '27':'二七同道，河图二七合火而生土，主财利田宅；但二黑病符七赤破军相叠，旺财之时尤须防病伤与破耗。',
    '28':'二八合十，土土比和，富并陶朱，二黑八白皆土，得令主田宅巨富，失令病符暗伏，宜静不宜动。',
    '29':'二九相合，火土相生，主财喜，但二黑加九紫，旺财中防病符。',
    '33':'双三并行，蚩尤叠出，是非口舌倍增，主争斗官讼、肝胆之疾；得令暂发，失令大凶。',
    '34':'三四同行，同气之木，震巽比扶，主兄弟同心、事业开拓；过旺主固执互斗，妇女须防。',
    '35':'三五叠临，禄存见五黄，主是非官非、破败丧亡，多口舌之灾。',
    '36':'三六相会，金克木，武曲克禄存，天克地冲：主头足之伤、官非车厄，衰时尤验。',
    '37':'三七叠临，金木相战，为穿心煞：主劫盗官非、手足肝胆之伤病、刀兵车厄、兄弟失和；当令主文武兼权，失令则穿心为祸。',
    '38':'三八为朋，木土相克，主竞争与是非，兄弟朋友助力；当旺主开拓，失运主口舌争斗。',
    '39':'三九相会，木火通明，主文昌喜庆，名声大振，当旺大吉。',
    '44':'双四并行，文曲叠秀，利科名考试、文昌勃发；女命尤吉，然失令主风声外扬、姻缘反复。',
    '45':'四五相逢，文昌见五黄，主抑郁压抑、病灾纠缠，读书人尤须调理身心。',
    '46':'四六相会，金克木，武曲克文曲，主文书受阻、官非刑杖；得令反主武贵兼文权。',
    '47':'四七相会，金克木，主口舌风波、金木相战，妇人须防；亦主刀伤金创。',
    '48':'四八相会，木克土，长女克少男，主小口损伤、风波跌扑；得令亦主文名有阻。',
    '49':'四九为友，木火通明，主文昌名声、喜庆婚嫁，利读书考试与求名；当令大吉。',
    '55':'双五叠临，廉贞重煞，大凶之局，病灾横祸倍重，此方绝对宜静，忌动土、忌红黄色。',
    '56':'五六相会，土金相生而五黄独凶，主暗病缠身、官非破财；宜金泄静守。',
    '57':'五七相逢，破军见五黄，主贼盗官非、损丁破财，须防小人暗算。',
    '58':'五八相会，土土比和而五黄为祸，主财库受损、病痛积聚，须防脾胃之疾。',
    '59':'五九交临，火生土凶，右弼见五黄，主喜庆中藏灾，火土燥热，须防目疾心火。',
    '66':'双六并行，武曲重权，主权威武贵、财源广进；金气过刚，老人须防肺疾。',
    '67':'六七相会，交剑煞，双金争斗，主口舌是非、破财官非、刀伤金创；亦主争斗劫掠。',
    '68':'六八相会，土金相生，富贵双全，武曲左辅生扶，主田宅置业、财官两旺，当令大吉。',
    '69':'六九相会，火克金，为火烧天门：主老父长房受灾、头颈血肺之疾、咳血吐血，兼见官非；当令不作凶论，失运大凶，此方忌见炉灶火形。',
    '77':'双七叠临，破军重逢，主劫盗横祸、口舌破财、少女之伤；宜水泄静守。',
    '78':'七八相会，土生金，左辅生破军，财星生劫星：得令主财中藏险，失令主破财盗失。',
    '79':'七九相遇，火克金，主破财口舌、火灾血光，须防冲动。',
    '88':'双八叠临，左辅重财，田宅巨富之格，当令大发丁财，迟发绵长。',
    '89':'八九同临，火生土，主喜庆添丁、财帛丰盈，当令大吉。',
    '99':'双九并行，火炎土燥，主喜庆双至、聪明好礼；过旺主目疾心火、血光之灾，妇人须防。'
  };
  function comboJx(a,b){
    const key=[a,b].sort().join('');
    const mean=COMBO_MEAN[key]||'比和，随当令与宫位断吉凶';
    /* 吉凶依组合释义判定：五黄廉贞最凶，二黑病符为凶，河图吉合为吉；斗牛（23）交剑（67）为名凶局 */
    let jx='平';
    if(key==='55'||key==='25'||key==='35') jx='大凶';
    else if(key.indexOf('5')>=0) jx='凶';
    else if(key==='23'||key==='37'||key==='67'||key==='69'||key==='77'||key==='79') jx='凶';  /* 斗牛煞（二三木克土）、穿心煞（三七金克木）、交剑煞（六七金金交战）、火烧天门（六九火克金）、双七破军重逢、回禄（七九火克金）均为凶局 */
    else if(key==='22'||key==='33'||key==='36'||key==='47'||key==='48'||key==='46') jx='凶';
    else if(['14','49','16','68','88','39'].includes(key)) jx='大吉';
    else if(['38','28','66','78','89'].includes(key)) jx='吉';
    else if(['11','13','17','19','24','26','27','29','34','44','99'].includes(key)) jx='吉或平';
    else if(['12','18'].includes(key)) jx='平或凶';
    return {jx, mean, src:COMBO_SRC[key]||null};
  }
  /* ===================== 三合水法（长生十二宫+四大局） ===================== */
  /* 【典籍注疏】蔡元定《发微论》为龙穴砂水哲理总纲（生死、强弱、顺逆十六篇辩证），本页峦头纲要之龙势八格（生克强弱顺逆进退）与其同一义理框架；赖布衣《催官篇》以二十八宿天星度数配向论贵（天星理气），本页立向取玄空三合而未设天星模块，禄马贵人方之贵气推算与其催官义理相通。
  【定源】杨公三合四大局（阴阳二局中取四阳水局顺行，通行例）：火局长生在寅（寅午戌）、水局在申（申子辰）、
     金局在巳（巳酉丑）、木局在亥（亥卯未），十二宫顺布；三合联珠配山：坤壬乙→水、艮丙辛→火、巽庚癸→金、
     乾甲丁→木，二十四山全覆盖。
     收水口诀：乙丙交而趋戌、辛壬会而聚辰、斗牛纳丁庚之气、金羊收癸甲之灵。
     来水宜生旺（长生冠带临官帝旺），去水宜衰病死墓绝。
     锚点：水局长生申、帝旺子、墓辰；乙山属水局、辛山属火局、丁山属木局。 */
  const SHENG_LONG_ORDER=['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
  /* 四大局长生：火局（寅午戌）水局（申子辰）金局（巳酉丑）木局（亥卯未）
     三合联珠配山：坤壬乙→水局、艮丙辛→火局、巽庚癸→金局、乾甲丁→木局（八干四维全覆盖） */
  const SANHE_JU={
    '寅午戌':{ju:'火局',zs:'寅',miao:'午',mu:'戌',shou:'乙丙交而趋戌，水出戌方',yun:'艮寅同气'},
    '申子辰':{ju:'水局',zs:'申',miao:'子',mu:'辰',shou:'辛壬会而聚辰，水出辰方',yun:'坤申同气'},
    '巳酉丑':{ju:'金局',zs:'巳',miao:'酉',mu:'丑',shou:'斗牛纳丁庚之气，水出丑方',yun:'巽巳同气'},
    '亥卯未':{ju:'木局',zs:'亥',miao:'卯',mu:'未',shou:'金羊收癸甲之灵，水出未方',yun:'乾亥同气'}
  };
  /* 二十四山→三合局（含八干四维按三合联珠配局） */
  const SHAN_SANHE={
    寅:'寅午戌',午:'寅午戌',戌:'寅午戌',艮:'寅午戌',丙:'寅午戌',辛:'寅午戌',
    申:'申子辰',子:'申子辰',辰:'申子辰',坤:'申子辰',壬:'申子辰',乙:'申子辰',
    巳:'巳酉丑',酉:'巳酉丑',丑:'巳酉丑',巽:'巳酉丑',庚:'巳酉丑',癸:'巳酉丑',
    亥:'亥卯未',卯:'亥卯未',未:'亥卯未',乾:'亥卯未',甲:'亥卯未',丁:'亥卯未'
  };
  /* 十二宫来去取用（短签，供盘心第二行用）：与 GONG_NOTE、盘下取角说明同源，只取“来去”两字结论。
     杨公水法通例：来水宜长生、冠带、临官、帝旺；去水宜衰、病、死、墓、绝、胎；沐浴桃花宜去不宜来；养方平缓，来去皆可。 */
  const SH_USE=['宜来水朝堂','宜去水','宜来水朝堂','宜来水朝堂','宜来水朝堂','宜去水','宜去水','宜去水','宜去水（水口）','宜去水，忌来','宜去水，其方宜静','来去皆可'];
  function sanHeWater(shan){
    const key=SHAN_SANHE[shan];
    if(!key) return null;
    const j=SANHE_JU[key];
    const zsIdx=ZHI_IDX[j.zs];
    const gong=SHENG_LONG_ORDER.map((name,i)=>{
      const z=ZHI[(zsIdx+i)%12];
      return {gong:name, zhi:z};
    });
    /* 十二宫吉凶与来去取用（杨公水法通行例）：长生冠带临官帝旺宜来水朝堂；沐浴桃花来水不吉、去之反吉；
       衰病死墓绝宜去水（水口开在衰绝之方）；绝胎宜去不宜来（来则损幼丁）；胎养平缓，胎方宜静。 */
    const GONG_JX=['吉','平','吉','吉','大吉','平','凶','凶','平','大凶','凶','平'];
    const GONG_NOTE=['生气方，来水朝堂主荫后人','桃花沐浴，来水不吉、去水反吉','冠带水，主功名','临官禄水，主贵','帝旺水，主旺财丁','衰水，去水吉','病水，宜去不宜来','死水，宜去不宜来','墓库水，宜去不宜来（去而闭）','绝宫水，宜去不宜来，来水大凶','胎水，宜去不宜来，其方宜静','养水，平缓可用'];
    return {ju:j.ju, zs:j.zs, miao:j.miao, mu:j.mu, shou:j.shou, gong,
      gongJx:GONG_JX, gongNote:GONG_NOTE, gongUse:SH_USE, j};
  }
  /* 【定源】三合水法取角口径（指南第 9 层双山与宫心条）：三合以双山为宫，双山之名取自地盘二十四山，
     而其层位在天盘缝针；缝针较地盘顺偏半山，双山宽三十度、两山取中，宫心遂恒等于地盘本支山心
     （乙辰宫中心落周天一百二十度即地盘辰山之心），故十二宫在地盘上读与本支山同轴、不必另错半山。
     【流派】诸家于双山所属之层有异说，或谓把地盘二十四山分为十二宫；二说可通，本站取缝针（指南同）。
     阳宅、阴宅两页水法盘详情条同取此串，取角口径只此一处书写，两页不漂。 */
  const SH_QUJIAO='取角 三合纳水于地盘定坐向后换用天盘缝针，本盘十二宫取缝针双山（每宫含缝针两山，缝针顺偏半山，双山取中，宫心正落地盘本支山心，故十二宫在地盘上读与本支山同轴、不必另错半山），精确定位用天盘百二十分金。';
  /* ===================== 二十八宿配山 / 分金 ===================== */
  const XIU_28=['角','亢','氐','房','心','尾','箕','斗','牛','女','虚','危','室','壁',
    '奎','娄','胃','昴','毕','觜','参','井','鬼','柳','星','张','翼','轸'];
  /* 【定源】二十八宿配二十四山：依宿序逆布、四正四维之山兼跨两宿（子虚危、寅尾箕、巽角轸、亥奎壁，共28宿）。
     【流派】此配法诸家罗盘因宿度宽窄不等而分配有出入，本表为一例，仅作信息展示、不参与吉凶计算。 */
  const SHAN_XIU={
    子:['虚','危'],癸:['女'],丑:['牛'],艮:['斗'],寅:['箕','尾'],甲:['心'],卯:['房'],
    乙:['氐'],辰:['亢'],巽:['角','轸'],巳:['翼'],丙:['张'],午:['星'],丁:['柳'],
    未:['鬼'],坤:['井'],申:['参'],庚:['觜'],酉:['毕'],辛:['昴'],戌:['胃'],
    乾:['娄'],亥:['奎','壁'],壬:['室']
  };
  /* ===================== 天星立向（赖布衣《催官篇》体系） =====================
     【定源】《催官篇》（赖文俊布衣，四库全书术数类著录）以二十四山配天星论贵贱：
       亥山应紫微垣（天皇星）为至尊贵向、艮山应天市垣（市楼星）、丁山应南极（寿星）、
       辛山应天乙太乙（贵人）、丙山应天贵星、乙山应天官星、巽山应太微垣照……
       催官之义：向得贵星照临则速发官贵；歌诀以"催官"名篇（如"催官第一天皇亥……"）。
     【定源】宿度五行（浑天星度五行，宋后罗经外盘度数层通行例）：每宿周天度数按五行分派，
       "金十二度论"者谓每宿度数中金度十二数为用（取二十八宿度数总数适符）；
       取穴立向避空亡、关煞之度，取生坐山、旺仙命之度线。
     【流派】二十八宿配山诸家分配有出入（本表 SHAN_XIU 为一例）；天星派与三合、玄空并列
       三大立向法脉，本页三法并陈、由用户自选主线，不由本页裁断。
     锚点：亥山催官第一（天皇）、酉山少微（说本兑卦）。宿度五行为简化轮排表（每宿 18 度
       轮值五行、逐宿移位相接，非古本原表），仅作分金线度参考展示、不参与吉凶裁断；
       古本"金十二度论"通行值（如虚宿初度土）与本表排法不必相符，诸家本有出入。 */
  /* 催官贵向表（二十四山核心条目，《催官篇》通行摘句归纳；山→[天星名, 催官义]） */
  const CUI_GUI={
    '亥':['紫微垣、天皇','催官第一天皇亥，紫微垣照极贵之向'],
    '艮':['天市垣、市楼','催官第二礴石艮，天市垣照主财货官贵'],
    '巽':['太微垣、阳枢','太微垣照，主文明官贵'],
    '辛':['天乙、太乙','天乙太乙贵人照，主清贵'],
    '丙':['天贵','天贵星照，主官贵'],
    '丁':['南极、寿星','南极寿星照，主寿考康宁'],
    '乙':['天官','天官星照，主官秩'],
    '酉':['少微、贵气','少微垣照，主贵气（说本兑卦，酉山应之）'],
    '庚':['天潢、微垣','天潢星照，主武贵'],
    '壬':['天辅','天辅星照，主文昌'],
    '甲':['阴枢、天官','阴枢星照，主贵而速'],
    '癸':['天汉、瑤光','天汉星照，主近贵']
  };
  /* 宿度五行（金十二度论通行表）：每宿按度数分派五行，简表给每宿首五行与金度位次。
     通行法：二十八宿度数五行以"火一二三、四五六金、七八九土、十水十一木"轮派为常用简例；
     本表取通行简例轮派（宿度五行诸家亦有小异，取一例并注明）。 */
  const XIU_DU_WX=['火','火','火','金','金','金','土','土','土','水','木','金','金','水','水','水','土','土','土','木','木','木','金','金','金','火','火','土'];
  function xiuDuWuxing(xiu, du){
    const idx=XIU_28.indexOf(xiu);
    if(idx<0||!(du>=1)) return null;
    const off=(idx*18+du-1)%XIU_DU_WX.length;
    return {xiu, du, wx:XIU_DU_WX[off]};
  }
  /* 催官贵向判定：坐山→天星贵义（有则给出贵向义理，无则平） */
  function tianXingGui(shan){
    const g=CUI_GUI[shan];
    if(!g) return {shan, gui:false, star:'', mean:''};
    return {shan, gui:true, star:g[0], mean:g[1]};
  }
  /* 天星煞度（宿度空亡关煞，通行例）：空亡度（每宿末一度为关、隔宿交界为空亡），
     立向避之；本表按度序取空亡（du 为该宿总度数时为关煞度） */
  const XIU_DU_SHU={'角':12,'亢':9,'氐':16,'房':5,'心':6,'尾':18,'箕':9,'斗':22,'牛':7,'女':11,
    '虚':9,'危':16,'室':18,'壁':9,'奎':18,'娄':12,'胃':15,'昴':10,'毕':16,'觜':1,
    '参':9,'井':31,'鬼':2,'柳':13,'星':6,'张':18,'翼':20,'轸':17};
  function tianXingSha(shan, xiu, du){
    const total=XIU_DU_SHU[xiu];
    if(!total||!(du>=1)) return null;
    if(du>total) return {xiu, du, sha:'越度', mean:xiu+'宿止'+total+'度，'+du+'度越入邻宿空亡，不可取线'};
    if(du===total) return {xiu, du, sha:'关煞', mean:xiu+'宿末度（第'+total+'度）为关煞度，立向避之'};
    return {xiu, du, sha:'', mean:''};
  }

  /* 六十甲子纳音五行（30组配60干支） */
  const NAYIN_WX={海中金:'金',炉中火:'火',大林木:'木',路旁土:'土',剑锋金:'金',山头火:'火',涧下水:'水',城头土:'土',
    白蜡金:'金',杨柳木:'木',泉中水:'水',屋上土:'土',霹雳火:'火',松柏木:'木',长流水:'水',沙中金:'金',
    山下火:'火',平地木:'木',壁上土:'土',金箔金:'金',覆灯火:'火',天河水:'水',大驿土:'土',钗钏金:'金',
    桑柘木:'木',大溪水:'水',沙中土:'土',天上火:'火',石榴木:'木',大海水:'水'};
  const NAYIN_NAMES=Object.keys(NAYIN_WX);
  function nayin(gz){
    const i=gzIndex(gz);
    const name=NAYIN_NAMES[Math.floor(i/2)];
    return {name, wx:NAYIN_WX[name]};
  }
  /* 分金与年命纳音生克：比和/分金生年命为吉；年命生分金（泄）与两相克战均为凶性关系，综合评定时按 fenJinZong 降级。
     label=宅主（阳宅）或仙命（阴宅） */
  const WX_SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
  const WX_KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
  /* 克我者（官煞之行）：金命煞在火。WX_KE[a]=a所克之行，克 a 者须反查 */
  const WX_KE_ME={木:'金',金:'火',火:'水',水:'土',土:'木'};
  function zhuMingJx(fenWx, zhuWx, label){
    const L=label||'宅主';
    if(fenWx===zhuWx) return {jx:'吉', mean:'比和，同气相扶'};
    if(WX_SHENG[fenWx]===zhuWx) return {jx:'吉', mean:'分金生'+L+'年命，生扶为吉'};
    if(WX_SHENG[zhuWx]===fenWx) return {jx:'凶', mean:L+'年命生分金，泄气不取'};
    if(WX_KE[zhuWx]===fenWx) return {jx:'凶', mean:L+'年命克分金，受制不取'};
    if(WX_KE[fenWx]===zhuWx) return {jx:'凶', mean:'分金克'+L+'年命，克出不取'};
    return {jx:'平', mean:'比和'};
  }
  /* 【定源】孤虚旺相以龙/分金之天干定（《罗经透解》珠宝火坑例，通书通行口径）：
     丙庚为旺、丁辛为相（丙丁庚辛四干通称珠宝，皆可用；旺档吉力更强、相档次之）、
     甲壬为孤、乙癸为虚（差错）、戊己为龟甲空亡。穿山七十二龙、透地六十龙与
     一百二十分金共用此一天干口径（阳支五子甲丙戊庚壬、阴支五子乙丁己辛癸）。
     锚点：子山五分金甲子孤、丙子旺、戊子龟甲、庚子旺、壬子孤；酉山五分金乙酉虚、
     丁酉相、己酉龟甲、辛酉相、癸酉虚；壬山穿山癸亥虚、甲子孤；寅山丙寅旺、戊寅龟甲。 */
  function wangXiang(gan){
    return ({丙:'旺',庚:'旺',丁:'相',辛:'相',甲:'孤',壬:'孤',乙:'虚',癸:'虚',戊:'龟甲',己:'龟甲'})[gan]||'孤';
  }
  /* 双山配支：壬子、癸丑、艮寅、甲卯、乙辰、巽巳、丙午、丁未、坤申、庚酉、辛戌、乾亥 */
  const SHAN_SHUANGZHI={壬:'子',子:'子',癸:'丑',丑:'丑',艮:'寅',寅:'寅',甲:'卯',卯:'卯',乙:'辰',辰:'辰',巽:'巳',巳:'巳',
    丙:'午',午:'午',丁:'未',未:'未',坤:'申',申:'申',庚:'酉',酉:'酉',辛:'戌',戌:'戌',乾:'亥',亥:'亥'};
  /* 【定源】一百二十分金（《罗经透解》通行例）：每山五分金（各3度），甲子起子山初度（352.5°）顺布，
     各山取本山双山所属地支五子（阳支配甲丙戊庚壬、阴支配乙丁己辛癸）。
     子山以中线为0°，占352.5°~7.5°；锚点：子山五分金甲子丙子戊子庚子壬子，正中戊子为龟甲空亡，
     丙子、庚子两分金（中线±1.5°~4.5°）正合下卦九度（见 panJue）。 */
  function fenJin(shan){
    const i=SHAN_LIST.indexOf(shan);
    if(i<0) return [];
    const zhi=SHAN_SHUANGZHI[shan]||shan;
    const zhiIdx=ZHI.indexOf(zhi);
    const yang=zhiIdx%2===0;            /* 子寅辰午申戌为阳 */
    const gans=yang?['甲','丙','戊','庚','壬']:['乙','丁','己','辛','癸'];
    const result=[];
    for(let k=0;k<5;k++){
      const gan=gans[k];
      const gi=gzIndex(gan+zhi);
      const ny=nayin(gan+zhi);
      const start=Math.round(((i*15-7.5+3*k)%360+360)%360*10)/10;
      const end=Math.round((start+3)%360*10)/10;
      result.push({gan, zhi, gz:gan+zhi, idx:gi, wang:wangXiang(gan), nayin:ny.name, nayinWx:ny.wx, start, end});
    }
    return result;
  }
  /* 双山组五子：阳支（子寅辰午申戌）配甲丙戊庚壬、阴支（丑卯巳未酉亥）配乙丁己辛癸 */
  function shuangZhiWuZi(z){
    const g=z%2===0?['甲','丙','戊','庚','壬']:['乙','丁','己','辛','癸'];
    return g.map(x=>x+ZHI[z]);
  }
  /* 实测坐度定位分金：deg 为罗盘实测坐度，返回所落之一百二十分金与线位说明。
     锚点：子山0度落正中戊子（pct=50，龟甲空亡）；355度落甲子（本山首格）。 */
  function fenJinLocate(shan, deg){
    const list=fenJin(shan);
    if(!list.length||typeof deg!=='number'||isNaN(deg)) return null;
    const d=((deg%360)+360)%360;
    const f=list.find(x=>(d>=x.start&&d<x.end)||(x.end<x.start&&(d>=x.start||d<x.end)));
    if(!f) return null;
    const pct=Math.round(((d-f.start+360)%360)/3*100);
    return {shan, deg:d, fen:f, pct, insideZheng:pct>=10&&pct<=90};
  }
  /* 【定源】穿山七十二龙（《罗经透解》通行坊本排法）：每龙5度，甲子龙起壬山之末格（壬子之交 347.5°~352.5°），
     依双山五子局顺布。地支山三格取本组二三四子（如子山丙子、戊子、庚子，正中戊子为龟甲空亡）；
     八干四维山三格取前组末子、本组首子，正中一格无干支所配，为十二大空亡龙。
     如壬山：癸亥、大空亡、甲子；癸山：壬子、大空亡、乙丑；艮山：癸丑、大空亡、甲寅。
     锚点：壬山首格癸亥起337.5°、甲子占347.5°；大空亡全盘恰12格。
     【流派】甲子起格另有顾陵冈等起辛刻异说，本页取通行坊本甲子起壬子之交。 */
  function chuanShan72(shan){
    const i=SHAN_LIST.indexOf(shan);
    if(i<0) return [];
    const diZhi=i%2===0;                 /* 地支山取本组二三四季，干维山取前组末子与本组首子 */
    const z=diZhi?i/2:((i+1)/2)%12;      /* 本山所属双山地支 */
    const wuzi=shuangZhiWuZi(z), prev=shuangZhiWuZi((z+11)%12);
    const result=[];
    for(let k=0;k<3;k++){
      const start=Math.round(((i*15-7.5+5*k)%360+360)%360*10)/10;
      const end=Math.round((start+5)%360*10)/10;
      const gz=diZhi?wuzi[k+1]:(k===0?prev[4]:(k===2?wuzi[0]:''));
      if(!gz){
        result.push({gan:'', zhi:'', gz:'', idx:-1, wang:'空', kong:true, nayin:'大空亡', nayinWx:'', start, end});
        continue;
      }
      const ny=nayin(gz);
      result.push({gan:gz[0], zhi:gz[1], gz, idx:gzIndex(gz), wang:wangXiang(gz[0]), kong:false, nayin:ny.name, nayinWx:ny.wx, start, end});
    }
    return result;
  }
  /* 【定源】透地六十龙（通行坊本排法）：每龙6度，甲子龙起壬山之初（337.5°），每双山三十度下依次布本组五子
     （如壬子双山布甲子、丙子、戊子、庚子、壬子），即穿山七十二龙去十二大空亡龙重布。
     本山列出与之相交之龙，边界相交者为半交。锚点：壬山相交甲子丙子戊子（半）；子山正中0°落庚子（旺线）。
     【流派】起格亦有异说（见穿山注）；本页与穿山同取通行坊本。 */
  function touDi60(shan){
    const i=SHAN_LIST.indexOf(shan);
    if(i<0) return [];
    const z=i%2===0?i/2:((i+1)/2)%12;
    const wuzi=shuangZhiWuZi(z);
    const s=((i*15-7.5)%360+360)%360, e=s+15;
    const zs=((337.5+30*z)%360+360)%360;
    const result=[];
    for(let k=0;k<5;k++){
      let best=0, bk=0;
      const raw=zs+6*k;
      for(const c of [raw-360, raw, raw+360]){
        const ov=Math.min(e, c+6)-Math.max(s, c);
        if(ov>best){ best=ov; bk=c; }
      }
      if(best<=0) continue;
      const gz=wuzi[k];
      const ny=nayin(gz);
      const start=Math.round(((bk%360)+360)%360*10)/10;
      const end=Math.round((((bk+6)%360)+360)%360*10)/10;
      result.push({gan:gz[0], zhi:gz[1], gz, idx:gzIndex(gz), wang:wangXiang(gz[0]), kong:false,
        nayin:ny.name, nayinWx:ny.wx, start, end, half:best<6});
    }
    return result;
  }
  /* 穿山/透地龙吉凶（古法孤虚旺相）：丙丁庚辛为珠宝旺相可用，甲乙为孤、壬癸为虚为差错不用，
     戊己龟甲为火坑空亡，八干四维正中为大空亡，皆不可用 */
  function longJx(d){
    if(d.kong) return {jx:'大凶', mean:'大空亡龙，落八干四维正中，格龙立向皆不可用'};
    if(d.wang==='旺') return {jx:'大吉', mean:'旺气珠宝龙，可用'};
    if(d.wang==='相') return {jx:'吉', mean:'相气珠宝龙，可用'};
    if(d.wang==='龟甲') return {jx:'大凶', mean:'龟甲火坑空亡，不可用'};
    return {jx:'凶', mean:'孤虚空亡差错之龙，不可用'};
  }
  /* 分金综合吉凶：孤虚旺相（按天干）为先、合年命（label 宅主/仙命）次之；龟甲大凶不论年命。
     孤虚之线不因合年命转吉（上限平），旺相之线克泄年命不取吉（上限平）。 */
  function fenJinZong(fenItem, xmInfo, yun, label){
    const L=label||'宅主';
    const wangScore=fenItem.wang==='旺'?3:(fenItem.wang==='相'?2:0);
    const xmJx=xmInfo?zhuMingJx(fenItem.nayinWx, xmInfo.nayin.wx, L):null;
    const xmScore=xmJx? (xmJx.jx==='吉'?2:(xmJx.jx==='凶'?-2:0)) : 0;
    const total=wangScore+xmScore;
    let zong;
    if(fenItem.wang==='龟甲'||fenItem.wang==='空') zong='大凶';
    else if(fenItem.wang==='孤'||fenItem.wang==='虚') zong='凶';
    else if(total>=5) zong='大吉';
    else if(total>=3) zong='吉';
    else zong='平';
    const meanParts=[];
    meanParts.push(fenItem.wang==='旺'?'旺相分金可用':(fenItem.wang==='相'?'相气分金可用':
      (fenItem.wang==='龟甲'?'龟甲空亡大凶':(fenItem.wang==='孤'?'孤线不可用（不因合年命转吉）':(fenItem.wang==='虚'?'虚线不可用（不因合年命转吉）':'空亡线不可用')))));
    if(xmJx) meanParts.push(xmJx.mean);
    else meanParts.push('未填'+L+'年命，按旺相判');
    return {zong, mean:meanParts.join('；')};
  }
  /* 游年星：from 卦起游年，to 卦落何星（阳宅三要主断用） */
  function youXing(from, to){
    const b=BAZHAI[from];
    if(!b) return null;
    if(from===to) return '伏位';
    for(const k in b.ji){ if(b.ji[k]===to) return k; }
    for(const k in b.xiong){ if(b.xiong[k]===to) return k; }
    return null;
  }
  /* ===================== 阴宅专法：八煞 黄泉 桃花水 仙命配山 禄马贵人 择日神煞 ===================== */
  /* 【定源】八煞曜（《罗经》八煞歌，通行）：坎龙坤兔震山猴，巽鸡乾马兑蛇头，艮虎离猪为八煞，墓宅逢之一例休。
     八卦各取其曜煞支，坐山按卦宫取煞：其方忌来水冲射、高砂逼压与动土修造。
     锚点：坎山煞在辰（坎龙）、震山煞在申（震山猴）、乾山煞在午（乾马）、离山煞在亥（离猪）。 */
  const GUA_BASHA={坎:'辰',坤:'卯',震:'申',巽:'酉',乾:'午',兑:'巳',艮:'寅',离:'亥'};
  function baSha(shan){
    const gua=SHAN_BAGUA[shan];
    if(!gua) return null;
    return {shan, gua, zhi:GUA_BASHA[gua], mean:gua+'山犯'+GUA_BASHA[gua]+'煞（'+gua+'宫曜煞），其方忌来水冲射、高砂逼压与动土修造'};
  }
  /* 【定源】黄泉煞（《青囊》系口诀，通书通行）：庚丁坤上是黄泉，乙丙须防巽水先，甲癸向中忧见艮，辛壬水路怕当乾。
     口诀只列八干向：立庚/丁向忌坤方水、乙/丙向忌巽方水、甲/癸向忌艮方水、辛/壬向忌乾方水。
     来去之辨诸家有异（去水或作救贫论），本页按口诀列方，断语注明须实地详审来去。
     锚点：庚向黄泉坤、丁向黄泉坤、癸向黄泉艮；午向口诀未列。 */
  const HUANGQUAN={庚:'坤',丁:'坤',乙:'巽',丙:'巽',甲:'艮',癸:'艮',辛:'乾',壬:'乾'};
  function huangQuan(faceShan){
    const z=HUANGQUAN[faceShan];
    if(!z) return {none:true, face:faceShan};
    return {none:false, face:faceShan, zhi:z, mean:'立'+faceShan+'向，'+z+'方之水为黄泉（向上黄泉），须详审来去'};
  }
  /* 【定源】咸池桃花水（《协纪辨方书》咸池：申子辰在酉、寅午戌在卯、巳酉丑在午、亥卯未在子）：
     以坐山所属三合局取咸池支，其方来水为桃花水，忌来水缠绕注穴；去水别论（通说去反吉）。
     锚点：水局桃花在酉、火局在卯。 */
  const SANHE_TAOHUA={'申子辰':'酉','寅午戌':'卯','巳酉丑':'午','亥卯未':'子'};
  function taoHuaShui(shan){
    const key=SHAN_SANHE[shan];
    if(!key) return null;
    return {shan, ju:SANHE_JU[key].ju, zhi:SANHE_TAOHUA[key]};
  }
  /* 【定源】仙命配山（造葬通书通行法）：以仙命年支与坐山所属双山地支论支神关系：
     比旺、三合、六合为吉；正冲大忌（冲命断不可用），相刑、相害次忌。
     坐山取双山配支（壬子同子、癸丑同丑、艮寅同寅…八干四维随双山同断，见 SHAN_SHUANGZHI）。
     锚点：子命坐午山正冲大忌、坐申山三合、坐丑山六合；子卯相刑、子未相害、寅巳申三刑、申亥相害。
     【两法并陈】另有仙命纳音法（部分流派用）：以仙命年柱纳音与分金纳音论生克（分金生命印绶吉、比和吉、命克山平、命生山泄平、山克命大忌），本页已在分金合仙命总表（fenJinZong→zhuMingJx）中作辅注列示；年支双山支神法为主判、纳音法为辅注，两法并陈不由本页裁断（通书多用年支法）。 */
  const LIUHE_ZHI={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  const SANHE_ZHI={申:['子','辰'],子:['申','辰'],辰:['子','申'],
    寅:['午','戌'],午:['寅','戌'],戌:['午','寅'],
    巳:['酉','丑'],酉:['巳','丑'],丑:['巳','酉'],
    亥:['卯','未'],卯:['亥','未'],未:['亥','卯']};
  /* 相刑：子卯无礼、寅巳申无恩、丑戌未持势（依次互刑）、辰午酉亥自刑（自刑不用于配山，同支先判比旺） */
  const XIANG_XING={子:'卯',卯:'子',寅:'巳',巳:'申',申:'寅',丑:'戌',戌:'未',未:'丑'};
  const XIANG_HAI={子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  function zhiGuanXi(a, b){
    const ia=ZHI_IDX[a], ib=ZHI_IDX[b];
    if(ia===undefined||ib===undefined) return null;
    if(a===b) return {name:'比旺', jx:'吉', mean:a+'命与'+b+'山同气比旺，山命相扶为吉'};
    if((ia+6)%12===ib) return {name:'正冲', jx:'大凶', mean:a+'命正冲'+b+'山，冲命大忌，断不可用'};
    if(SANHE_ZHI[a].indexOf(b)>=0) return {name:'三合', jx:'吉', mean:a+'命与'+b+'山三合，山命相合为吉'};
    if(LIUHE_ZHI[a]===b) return {name:'六合', jx:'吉', mean:a+'命与'+b+'山六合，山命相合为吉'};
    if(XIANG_XING[a]===b) return {name:'相刑', jx:'凶', mean:a+'命与'+b+'山相刑，刑命为忌，慎用'};
    if(XIANG_HAI[a]===b) return {name:'相害', jx:'凶', mean:a+'命与'+b+'山相害，害命次忌'};
    return {name:'无刑冲合害', jx:'平', mean:a+'命与'+b+'山无刑冲合害，平可用'};
  }
  /* 【定源】禄马贵人（《协纪辨方书》义例/《渊海子平》通行）：
     禄：甲禄寅、乙卯、丙戊巳、丁己午、庚申、辛酉、壬亥、癸子（按年干）；
     驿马：申子辰马在寅、寅午戌马在申、巳酉丑马在亥、亥卯未马在巳（按年支）；
     天乙贵人：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎（按年干）。
     造葬以禄马贵人到山到向、三方拱照为吉。
     锚点：甲禄在寅；子年马在寅；甲干贵人丑未；辛干贵人午寅。 */
  const GAN_LU={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  const ZHI_MA={申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'};
  const GAN_GUIREN={甲:['丑','未'],戊:['丑','未'],庚:['丑','未'],乙:['子','申'],己:['子','申'],
    丙:['亥','酉'],丁:['亥','酉'],壬:['卯','巳'],癸:['卯','巳'],辛:['午','寅']};
  function luMaGui(gz){
    const gan=gz[0], zhi=gz[1];
    return {lu:GAN_LU[gan]||null, ma:ZHI_MA[zhi]||null, guiren:GAN_GUIREN[gan]||[]};
  }
  /* 【定源】重丧日（通书通行，按节气月建本气定日干）：寅月甲、卯乙、辰戊、巳丙、午丁、未己、申庚、酉辛、
     戌戊、亥壬、子癸、丑己。安葬日犯之为重丧，大忌。
     锚点：寅月甲日重丧、戌月戊日、丑月己日。
     【流派】三月九月另有作己之说，本页取月建本气（辰戌本气戊）。 */
  const ZHONG_SANG={寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬',子:'癸',丑:'己'};
  /* 【定源】复日（《协纪辨方书》义例篇引《历例》）：正七连甲庚，二八乙辛当，三九六腊戊己是，四十丙壬方，五十一丁癸，
     按节气月：寅月甲庚、卯乙辛、辰戊己、巳丙壬、午丁癸、未戊己、申甲庚、酉乙辛、戌戊己、亥丙壬、子丁癸、丑戊己。
     安葬犯之主重复丧事，次忌（有制化可解，从严避之）。
     锚点：寅月甲庚二干、子月丁癸二干。 */
  const FU_RI={寅:['甲','庚'],卯:['乙','辛'],辰:['戊','己'],巳:['丙','壬'],午:['丁','癸'],未:['戊','己'],
    申:['甲','庚'],酉:['乙','辛'],戌:['戊','己'],亥:['丙','壬'],子:['丁','癸'],丑:['戊','己']};
  /* 【定源】往亡日（《协纪辨方书》引《历例》，按农历月）：正月寅、二月巳、三月申、四月亥、五月卯、六月午、
     七月酉、八月子、九月辰、十月未、十一月戌、十二月丑。往亡忌出行、安葬尤忌。
     锚点：正月寅日、七月酉日。 */
  const WANG_WANG={1:'寅',2:'巳',3:'申',4:'亥',5:'卯',6:'午',7:'酉',8:'子',9:'辰',10:'未',11:'戌',12:'丑'};
  /* 【定源】杨公忌日（民间通书通行十三忌，按农历）：正月十三、二月十一、三月初九、四月初七、五月初五、
     六月初三、七月初一、七月廿九、八月廿七、九月廿五、十月廿三、十一月廿一、十二月十九（七月两忌）。
     造葬嫁娶皆避。锚点：正月十三、七月廿九。 */
  const YANG_GONG_JI={1:[13],2:[11],3:[9],4:[7],5:[5],6:[3],7:[1,29],8:[27],9:[25],10:[23],11:[21],12:[19]};
  /* 【定源】岁德岁德合（《协纪辨方书》）：阳年干自德、阴年干以所合为德；岁德合反之。
     锚点：甲年岁德甲岁德合己、乙年岁德庚岁德合乙。 */
  const GAN_HE={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  function suiDe(yearGan){
    const yang=['甲','丙','戊','庚','壬'].indexOf(yearGan)>=0;
    return {de:yang?yearGan:GAN_HE[yearGan], he:yang?GAN_HE[yearGan]:yearGan};
  }
  /* 【定源】天德（《协纪辨方书》义例篇通行表，按节气月）：正月丁、二月坤、三月壬、四月辛、五月乾、
     六月甲、七月癸、八月艮、九月丙、十月乙、十一月巽、十二月庚。
     二五八十一月德在四维（坤乾艮巽），无天德日（以月德代吉）；余月天干即天德日之干。
     锚点：寅月天德丁（有日）、卯月天德坤（维神无日）。 */
  const TIAN_DE={寅:{v:'丁',gan:true},卯:{v:'坤',gan:false},辰:{v:'壬',gan:true},巳:{v:'辛',gan:true},
    午:{v:'乾',gan:false},未:{v:'甲',gan:true},申:{v:'癸',gan:true},酉:{v:'艮',gan:false},
    戌:{v:'丙',gan:true},亥:{v:'乙',gan:true},子:{v:'巽',gan:false},丑:{v:'庚',gan:true}};
  function tianDe(monthZhi){ return TIAN_DE[monthZhi]||null; }
  /* 【定源】月德月德合（《协纪辨方书》，按节气月）：寅午戌月德丙（合辛）、申子辰月德壬（合丁）、
     亥卯未月德甲（合己）、巳酉丑月德庚（合乙）。
     锚点：寅月月德丙、子月月德壬。 */
  const YUE_DE={寅:['丙','辛'],午:['丙','辛'],戌:['丙','辛'],申:['壬','丁'],子:['壬','丁'],辰:['壬','丁'],
    亥:['甲','己'],卯:['甲','己'],未:['甲','己'],巳:['庚','乙'],酉:['庚','乙'],丑:['庚','乙']};
  function yueDe(monthZhi){
    const y=YUE_DE[monthZhi];
    return y?{de:y[0], he:y[1]}:null;
  }
  /* 【定源】天赦（《协纪辨方书》）：春戊寅、夏甲午、秋戊申、冬甲子（按节气月支四季）。百无禁忌之吉日。
     锚点：春戊寅、夏甲午为天赦；春甲午非。 */
  function tianShe(monthZhi, dayGZ){
    const g={寅:'春',卯:'春',辰:'春',巳:'夏',午:'夏',未:'夏',申:'秋',酉:'秋',戌:'秋',亥:'冬',子:'冬',丑:'冬'}[monthZhi];
    const expect={春:'戊寅',夏:'甲午',秋:'戊申',冬:'甲子'}[g];
    return {season:g, expect, is:dayGZ===expect};
  }
  /* ===================== 补龙扶山相主（造命三纲） =====================
     【定源】《钦定协纪辨方书》卷三十三選擇要論（出《選擇宗鏡》）：葬以補龍為主，而山向亡命次之；
     凡逺龍不論，單以到穴之小脈為主，以正五行論生尅，日時四柱生扶之則吉，尅洩之則凶；
     補龍古課（俱以正五行論）分列五行龙的三合旺局/印局/财局/泄局/煞局与喜干；
     論扶山：坐山不必補，但宜扶起不宜尅倒：忌太岁冲山（岁破到山）、三煞、阴府、年克占山，喜四柱与山比肩一气、印绶生山、禄贵到山；
     論相主：從來皆論生年不論生日：取天干合官（干合）、比肩、印绶、禄马贵人，忌七煞（克命干）、天克地冲、天比地冲、冲命支。
     锚点：水龙（亥壬子癸）旺局申子辰、印局巳酉丑、财局寅午戌、泄局亥卯未、鬼局辰戌丑未；木龙（寅甲卯乙巽）旺局亥卯未；
     火龙（巳丙午丁）旺局寅午戌；金龙（申庚酉辛乾）旺局巳酉丑、土局为印；土龙（艮坤辰戌丑未）与水同宫生申旺子墓辰、以申子辰为旺局、寅午戌为印局。
     【流派】补龙另有唐一行、宋托长老四柱纳音补龙及洪范变运起纳音之法，本页以正五行三合局为纲、纳音参看。 */
  const LONG_WX={亥:'水',壬:'水',子:'水',癸:'水',寅:'木',甲:'木',卯:'木',乙:'木',巽:'木',
    巳:'火',丙:'火',午:'火',丁:'火',申:'金',庚:'金',酉:'金',辛:'金',乾:'金',
    艮:'土',坤:'土',辰:'土',戌:'土',丑:'土',未:'土'};
  /* 净阴阳十二龙（《协纪》引杨公一要阴阳不溷杂注：乾甲坤乙坎癸申辰离壬寅戌属阳，艮丙巽辛震庚亥未兑丁巳丑属阴。
     表以坎离代其山：坎即子山、离即午山，故子午属阳龙；巳丑属阴龙） */
  const LONG_YANG=['乾','甲','坤','乙','坎','癸','申','辰','离','壬','寅','戌'];
  const LONG_YANG_SHAN=['乾','甲','坤','乙','子','癸','申','辰','午','壬','寅','戌'];
  /* 补龙局表：按龙正五行取三合局吉凶（旺局上吉、印局吉、财局次吉、泄局煞局凶），悉依《协纪》補龍古課原文 */
  const BU_LONG_JU={
    水:{wang:'申子辰', lin:'亥', yin:'巳酉丑', cai:'寅午戌', xie:'亥卯未', sha:'辰戌丑未', gan:['壬','癸','庚','辛']},
    土:{wang:'申子辰', lin:'亥', yin:'寅午戌', cai:null,     xie:'巳酉丑', sha:'亥卯未', gan:['丙','丁','戊','己']},
    木:{wang:'亥卯未', lin:'寅', yin:'申子辰', cai:null,     xie:'寅午戌', sha:'巳酉丑', gan:['壬','癸','甲','乙']},
    火:{wang:'寅午戌', lin:'巳', yin:'亥卯未', cai:'巳酉丑', xie:'辰戌丑未', sha:'申子辰', gan:['丙','丁','甲','乙']},
    金:{wang:'巳酉丑', lin:'申', yin:'辰戌丑未', cai:'亥卯未', xie:'申子辰', sha:'寅午戌', gan:['庚','辛','戊','己']}
  };
  const SANHE_JU_NAMES={水:'水局',木:'木局',火:'火局',金:'金局',土:'土局'};
  /* 四柱地支按三合局取用：旺局（与龙同五行三合）上吉、临官字吉、印局（生龙）吉、财局（龙克）次吉、泄局（龙生）凶、煞局（克龙）大凶 */
  function zhiJuScore(zhi, longWx){
    const ju=BU_LONG_JU[longWx];
    if(ju.wang.indexOf(zhi)>=0) return {name:'旺局', jx:'大吉'};
    if(ju.lin===zhi) return {name:'临官', jx:'吉'};
    if(ju.yin.indexOf(zhi)>=0) return {name:'印局', jx:'吉'};
    if(ju.cai&&ju.cai.indexOf(zhi)>=0) return {name:'财局', jx:'次吉'};
    if(ju.xie.indexOf(zhi)>=0) return {name:'泄局', jx:'凶'};
    if(ju.sha.indexOf(zhi)>=0) return {name:'煞局', jx:'大凶'};
    return {name:'', jx:'平'};
  }
  /* 补龙：longShan=入首龙/坐山（二十四山字），zhiArr=四柱地支数组，ganArr=四柱天干数组。
     凡補龍全在四柱地支，天干氣輕地支力重；三合局不必全三字（二字亦可），喜干佐之。
     权重分层（《宗镜》造命以月日时为主，年支太岁之气力缓）：
     首柱=年支时按年家之忌归因：煞局泄局单字不否决全课，降为总断提示；
     月日时支煞局泄局成两字以上才判凶（可换月日时解），单字煞局扣分而不断凶。
     返回逐柱评与总断；葬以补龙为主（山向亡命次之）。 */
  function buLong(longShan, zhiArr, ganArr){
    const wx=LONG_WX[longShan];
    if(!wx||!zhiArr) return null;
    const ju=BU_LONG_JU[wx];
    const rows=zhiArr.map(z=>({zhi:z, ...zhiJuScore(z, wx)}));
    /* 年支归因：首柱视为年支（调用方按四柱序传入），仅参与成局计数，不触发否决 */
    const yZhi=rows[0];
    const mdtRows=rows.slice(1);
    const wangN=rows.filter(r=>r.name==='旺局').length;
    const linN=rows.filter(r=>r.name==='临官').length;
    const yinN=rows.filter(r=>r.name==='印局').length;
    const caiN=rows.filter(r=>r.name==='财局').length;
    const badRows=rows.filter(r=>r.jx==='凶'||r.jx==='大凶');
    const badMdt=mdtRows.filter(r=>r.jx==='凶'||r.jx==='大凶');
    const zhiStr=zhiArr.join('');
    const juStr=ju.wang;
    let zong, mean;
    /* 煞局成局（月日时两字以上同煞局）→ 大凶否决；仅年支单字煞泄 → 归年家提示不否决；月日时单字煞泄 → 凶 */
    const shaZhi=badRows.filter(r=>r.name==='煞局').map(r=>r.zhi);
    const xieZhi=badRows.filter(r=>r.name==='泄局').map(r=>r.zhi);
    if(badMdt.length>=2){
      zong='大凶';
      const grp=badMdt[0].name;
      mean='月日时支'+badMdt.map(r=>r.zhi).join('')+'同犯'+grp+'（'+(grp==='煞局'?'克龙':'龙生泄气')+'），'+wx+'龙受克泄成局，大忌，另择月日。';
    }else if(badMdt.length===1){
      zong='凶';
      mean='月日时支'+badMdt.map(r=>r.zhi).join('')+'犯'+badMdt[0].name+'（'+(badMdt[0].name==='煞局'?'克龙':'龙生泄气')+'），单字克泄'+wx+'龙气，宜再取'+juStr+'局之支制化或另择日。';
    }else if(wangN+linN>=3&&new Set(zhiArr.filter(z=>juStr.indexOf(z)>=0)).size>=2){
      zong='上吉';
      mean='四柱地支全得'+juStr+(linN?'兼临官'+ju.lin:'')+'，三合旺局补'+wx+'龙，龙气得补，上上吉。';
    }else if(wangN+linN+yinN>=2){
      zong='吉';
      mean='三合旺局'+wangN+'字'+(linN?'、临官'+linN+'字':'')+(yinN?'、印局'+yinN+'字（'+ju.yin+'生'+wx+'）':'')+'，龙气得生扶，吉课。';
    }else if(wangN+linN+yinN+caiN>0){
      zong='平';
      mean='得生扶'+(wangN+linN+yinN)+'字'+(caiN?'、财局'+caiN+'字（'+wx+'克为财）':'')+'，补龙之力薄，宜再添'+juStr+'局之字。';
    }else{
      zong='平';
      mean='四柱无补龙之字（'+wx+'龙宜'+juStr+'局，'+ju.yin+'局亦可），龙气无扶，宜调整月日时支。';
    }
    /* 年支煞泄局：年家之忌，改年可解，附注提示不否决 */
    if(badRows.length>badMdt.length){
      mean+='　年支'+yZhi.zhi+'犯'+yZhi.name+'（'+(yZhi.name==='煞局'?'克龙':'泄龙')+'），属年家之忌，年内补龙之力已损，能改期至他年更吉。';
    }
    /* 喜干参断（天干气轻，作辅助） */
    const ganHit=(ganArr||[]).filter(g=>ju.gan.indexOf(g)>=0).length;
    if(ganHit>0) mean+='　天干得'+ganHit+'字喜干（'+ju.gan.join('')+'），佐之。';
    return {longShan, wx, ju, rows, zong, mean};
  }
  /* 【定源】天干五合（甲己、乙庚、丙辛、丁壬、戊癸）与十神关系。
     論相主以命干（仙命/祭主生年天干）与四柱天干论：合官（他干为命干之官且与命干五合，贵格）、
     合财（他干为命干之财且五合，富格）、比肩（上吉）、印绶（生我）、七煞（克我，大忌）、食伤（我生，泄气平）。
     锚点：乙命见庚=合官、甲命见己=合财、己命见己=比肩、甲命见癸=印绶、乙命见辛=七煞。 */
  const GAN_WUHE={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  const GAN_WX5={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  function ganShiShen(mingGan, gan){
    const my=GAN_WX5[mingGan], other=GAN_WX5[gan];
    const he=GAN_WUHE[mingGan]===gan;             /* 他干与命干五合 */
    if(mingGan===gan) return {name:'比肩', jx:'吉'};                        /* 同干=比肩，上吉 */
    if(WX_KE[other]===my) return he?{name:'合官', jx:'大吉'}:{name:'七煞', jx:'大凶'};  /* 他克我：合则化官为贵，不合为七煞 */
    if(WX_KE[my]===other) return he?{name:'合财', jx:'大吉'}:{name:'财星', jx:'吉'};    /* 我克他：合则合财为富 */
    if(WX_SHENG[other]===my) return {name:'印绶', jx:'吉'};   /* 他生我 = 印 */
    if(other===my) return {name:'劫财', jx:'凶'};             /* 同五行异干 = 劫财（如己命多见戊，凶） */
    if(WX_SHENG[my]===other) return {name:'食伤', jx:'平'};   /* 我生他 = 食伤 */
    return {name:'', jx:'平'};
  }
  /* 相主总核：mingGZ=生年干支（葬以仙命为主，祭主止忌冲压），ganArr/zhiArr=四柱干支。
     從來皆論生年不論生日；忌七煞克命干、四柱支冲命支、天克地冲/天比地冲（安葬日课四柱任一柱与命柱）。 */
  function xiangZhu(mingGZ, ganArr, zhiArr){
    if(!mingGZ||!ganArr) return null;
    const mingGan=mingGZ[0], mingZhi=mingGZ[1];
    const shiRows=ganArr.map(g=>({gan:g, ...ganShiShen(mingGan, g)}));
    const heGuan=shiRows.filter(r=>r.name==='合官').length;
    const heCai=shiRows.filter(r=>r.name==='合财').length;
    const biJian=shiRows.filter(r=>r.name==='比肩').length;
    const yin=shiRows.filter(r=>r.name==='印绶').length;
    const sha=shiRows.filter(r=>r.name==='七煞').length;
    const jie=shiRows.filter(r=>r.name==='劫财').length;
    const cai=shiRows.filter(r=>r.name==='财星').length;
    const chongPair=CHONG[mingZhi];
    const chongZhi=zhiArr?zhiArr.filter(z=>z===chongPair):[];
    const tuChong='辰戌丑未'.indexOf(mingZhi)>=0;
    let tianKeDiChong=false;
    if(zhiArr&&zhiArr.length){
      zhiArr.forEach((z,i)=>{
        if(z===chongPair){
          const g=ganArr[i];
          if(WX_KE[GAN_WX5[g]]===GAN_WX5[mingGan]||g===mingGan) tianKeDiChong=true;
        }
      });
    }
    let zong, mean;
    if(tianKeDiChong){
      zong='大凶'; mean='四柱有柱天干克命干且地支冲命（天克地冲或天比地冲），断不可用。';
    }else if(sha>=2){
      zong='凶'; mean='四柱见七煞'+sha+'字克命干（'+mingGan+'命，'+WX_KE_ME[GAN_WX5[mingGan]]+'为其煞），原文七煞二字必凶，断不可用。';
    }else if(sha===1){
      /* 【定源】《协纪》論相主：七煞“忌用或年月利而干係七煞一（字）可得四柱中天干食神制之為妙若至二（字）必凶”：
         一见七煞有食神制之可用，无制则凶。食神=命干所生同阴阳之干（庚阳金命见壬、乙阴木命见丁）。 */
      const yangMing='甲丙戊庚壬'.indexOf(mingGan)>=0;
      const shiWx=WX_SHENG[GAN_WX5[mingGan]];                       /* 食神五行=命干所生之行 */
      const shiGanMap={木:['甲','乙'],火:['丙','丁'],土:['戊','己'],金:['庚','辛'],水:['壬','癸']};
      const zhiName=shiGanMap[shiWx][yangMing?0:1];                 /* 同阴阳之干 */
      const controlled=ganArr.indexOf(zhiName)>=0;
      /* 年干归因：七煞字若独在年干（首柱），月日时干无煞 → 年家之忌，换年可解，不否决本课 */
      const shaGan=shiRows.find(r=>r.name==='七煞').gan;
      const shaInMonthDay=ganArr.slice(1).some(g=>ganShiShen(mingGan, g).name==='七煞');
      const shaYearOnly=(ganArr[0]===shaGan)&&!shaInMonthDay;
      if(controlled){
        zong='平'; mean='四柱见七煞1字克命干（'+mingGan+'命，'+WX_KE_ME[GAN_WX5[mingGan]]+'为其煞），得食神'+zhiName+'制之，可用。';
      }else if(shaYearOnly){
        zong='平'; mean='七煞'+shaGan+'独占年干（'+mingGan+'命，'+WX_KE_ME[GAN_WX5[mingGan]]+'为其煞），月日时干无煞，属年家之忌，换年可解；本课命主无月日之煞压，权用，择年更吉。';
      }else{
        zong='凶'; mean='四柱见七煞1字克命干（'+mingGan+'命，'+WX_KE_ME[GAN_WX5[mingGan]]+'为其煞），无食神制之，煞压命主，另择。';
      }
    }else if(chongZhi.length>0){
      zong='凶'; mean='四柱地支'+chongZhi.join('')+'冲命支'+mingZhi+'，'+(tuChong?'土命冲土稍轻，然太岁冲之亦凶。':'冲命大忌，太岁冲命尤凶。');
    }else if(jie>=2){
      zong='凶'; mean='四柱'+jie+'见劫财之干（同五行异干，如己命多见戊），劫夺命气，凶。';
    }else if(heGuan+heCai>0){
      zong='大吉'; mean='四柱天干与命'+(heGuan&&heCai?'合官合财并用':(heGuan?'合官':'合财'))+'，'+(heGuan?'贵格':'富格')+'，命主得扶，上上格。';
    }else if(biJian+yin+cai>0){
      zong='吉'; mean=[biJian?'比肩'+biJian+'字（与命一气）':'', yin?'印绶'+yin+'字（生扶命干）':'', cai?'财星'+cai+'字':''].filter(Boolean).join('、')+'相扶命主，吉。';
    }else{
      zong='平'; mean='四柱天干与命无合无比亦无克，命主无扶，平。宜取与'+mingGan+'命合官合财或比肩印绶之干。';
    }
    return {mingGZ, mingGan, mingZhi, shiRows, heGuan, heCai, biJian, yin, sha, jie, cai, chongN:chongZhi.length, tianKeDiChong, zong, mean};
  }
  /* 扶山核对：坐山不必补、扶起不克倒。山五行用正体五行（SHAN_WX）。
     吉=四柱与山比肩一气（同五行之支）/印绶生山（生山五行之干）；大忌=地支冲山；次忌=天干克山；
     四柱纳音克山者，葬以月日纳音制之（制者当令、克者休囚乃稳）。
     锚点：子山（水）四柱见午=冲山大凶；见申子=比肩一气；见庚辛=印绶生山。 */
  function fuShan(shan, ganArr, zhiArr){
    const wx=SHAN_WX[shan];
    if(!wx||!zhiArr) return null;
    const shanPair=CHONG[shan];
    const chong=zhiArr.filter(z=>z===shanPair);
    const keShan=ganArr?ganArr.filter(g=>WX_KE[GAN_WX5[g]]===wx):[];
    const sameQi=zhiArr.filter(z=>LONG_WX[z]===wx);
    const shengShan=ganArr?ganArr.filter(g=>WX_SHENG[GAN_WX5[g]]===wx):[];
    let zong, mean;
    if(chong.length>0){
      zong='大凶'; mean='四柱'+chong.join('')+'支冲坐山'+shan+'，克倒坐山，大忌；太岁冲山尤忌，日月时止一字冲犹可，冲多则破。';
    }else if(keShan.length>=2){
      zong='凶'; mean='四柱天干'+keShan.join('')+'克山（'+shan+'山属'+wx+'），天干克山多见必凶。';
    }else if(keShan.length===1){
      /* 天干克山为次忌（一字须审），非否决：降为平，断语注明须审 */
      zong='平'; mean='四柱天干'+keShan.join('')+'克山（'+shan+'山属'+wx+'），天干克山次忌，一字须审，得印绶比扶之干制化则安。';
    }else if(sameQi.length>=2||shengShan.length>=2){
      zong='吉'; mean=[sameQi.length>=2?'地支'+sameQi.join('')+'与山同气比扶':'', shengShan.length>=2?'天干'+shengShan.join('')+'印绶生山':''].filter(Boolean).join('，')+'，坐山扶起。';
    }else{
      zong='平'; mean='坐山无冲无克亦无多扶，平（坐山不必补，有吉星照、无凶煞占即扶）。';
    }
    return {shan, wx, chongN:chong.length, keN:keShan.length, zong, mean};
  }
  /* ===================== 课格识别器（补龙古课格） =====================
     【定源】《钦定协纪辨方书》卷三十三補龍古課總論：“或三合局，或三合中止用二字，或三合兼臨官，或單臨官帝旺二字，
     或天干一氣，或地支一氣，總之皆補龍也”；杨公造命课例：壬龙四癸亥（支干一气/聚禄格）、亥龙申子亥（三合兼临官）、
     子龙用四子支（地支一气）；“四柱多用甲字（山之干）名堆禄格”。另《千金歌》注：四干一様为一氣堆干。
     课格识别：四柱地支/天干 + 入首龙 + 坐山，输出古课格名列表（可并列）。
     锚点：子龙（水）四支[申子辰子]=三合旺局；亥龙四支[申子亥子]=三合兼临官；壬龙四支[亥亥亥亥]+四干[癸癸癸癸]=地支一气/干支一气；
     寅山四柱干见甲=堆禄（甲禄到寅）。 */
  function keGe(longShan, sitShan, ganArr, zhiArr){
    if(!longShan||!zhiArr||zhiArr.length<3) return [];
    const wx=LONG_WX[longShan];
    if(!wx) return [];
    const ju=BU_LONG_JU[wx];
    const ges=[];
    const zhiStr=zhiArr.join('');
    const ganStr=(ganArr||[]).join('');
    /* 三合局：全支在旺局字内（临官字亦计入，构成"三合兼临官"） */
    const allWang=zhiArr.every(z=>ju.wang.indexOf(z)>=0||z===ju.lin);
    const wangZi=new Set(zhiArr.filter(z=>ju.wang.indexOf(z)>=0)).size;
    /* 临官字数 */
    const linN=zhiArr.filter(z=>z===ju.lin).length;
    if(allWang&&wangZi>=2&&linN>0) ges.push({name:'三合兼临官局', jx:'上上吉'});
    else if(allWang&&wangZi>=2) ges.push({name:'三合旺局', jx:'上吉'});
    /* 官旺局：单用临官帝旺二字（《协纪》卯龙官旺局例）；临官格：全支临官（如壬龙四亥，原文：名临官格又名聚禄格）。
       帝旺即三合局中神（wang 串序为 长生、帝旺、墓，故取 wang[1]）；子字虽在 wang 内，
       但只出现 临官+帝旺 二字者不作"三合"论，故此处不另设 wangZi 门槛。 */
    const wangZhi=ju.wang[1];
    const diWangN=zhiArr.filter(z=>z===wangZhi).length;
    if(linN>0&&diWangN>0&&linN+diWangN===zhiArr.length) ges.push({name:'官旺局（临官帝旺二字）', jx:'吉'});
    else if(linN>0&&linN===zhiArr.length) ges.push({name:'临官格（聚禄）', jx:'吉'});
    /* 地支一气 */
    if(new Set(zhiArr).size===1) ges.push({name:'地支一气局', jx:'上吉'});
    /* 天干一气 */
    if(ganArr&&ganArr.length>=3&&new Set(ganArr).size===1) ges.push({name:'天干一气（一气堆干）', jx:'上吉'});
    /* 干支一气：四柱干支完全相同（如四癸亥） */
    if(ganArr&&ganArr.length===4&&new Set(ganArr).size===1&&new Set(zhiArr).size===1) ges.push({name:'干支一气格', jx:'上上吉'});
    /* 堆禄：四柱干或支多见坐山之禄（坐山双山支的禄干，如子山见多甲：甲禄在子？非。堆禄=多见命禄、山禄之字：
       《协纪》：如寅山多用甲字（甲禄到寅）、甲山多用寅字（寅为甲之禄）名堆禄格。坐山之禄有两向：
       1) 坐山支为某干之禄（寅山=甲禄）→四柱多见该干；2) 坐山干之禄支（甲山→寅）→四柱多见该支 */
    const shanZhi=SHAN_SHUANGZHI[sitShan]||sitShan;
    const luGan=Object.keys(GAN_LU).find(g=>GAN_LU[g]===shanZhi);       /* 坐山支是何干之禄 */
    const shanGan=SHAN_LIST.indexOf(sitShan)>=0?sitShan:null;
    const luZhi=GAN_LU[shanGan];                                        /* 坐山干之禄支 */
    if(luGan&&(ganArr||[]).filter(g=>g===luGan).length>=2) ges.push({name:'堆禄格（'+luGan+'禄到'+sitShan+'山）', jx:'吉'});
    if(luZhi&&zhiArr.filter(z=>z===luZhi).length>=2) ges.push({name:'聚禄格（'+luZhi+'禄到'+shanGan+'干）', jx:'吉'});
    /* 龙禄：入首龙支为某干之禄，四柱多见该干（如壬龙四癸亥：亥为壬龙禄地） */
    const longZhi=SHAN_SHUANGZHI[longShan]||longShan;
    const longLuGan=Object.keys(GAN_LU).find(g=>GAN_LU[g]===longZhi);
    if(longLuGan&&longLuGan!==luGan&&(ganArr||[]).filter(g=>g===longLuGan).length>=2) ges.push({name:'龙禄格（'+longLuGan+'禄到'+longShan+'龙）', jx:'吉'});
    return ges;
  }
  /* ===================== 三合大利坐向（本局生旺墓三向） =====================
     【定源】《地理五诀》四大局立向：每局取长生、帝旺、墓库三吉向（双山论）：
     火局（乙丙交而趋戌）：生向艮寅、旺向丙午、墓向辛戌；
     水局（辛壬会而聚辰）：生向坤申、旺向壬子、墓向乙辰；
     金局（斗牛纳丁庚之气）：生向巽巳、旺向庚酉、墓向癸丑；
     木局（金羊收癸甲之灵）：生向乾亥、旺向甲卯、墓向丁未。
     向首双山配局（SHAN_SANHE）定所属，正生旺墓三向为大利；自生自旺借向诸家异说不列。
     锚点：向首丙午=火局旺向；向首壬子=水局旺向；向首艮寅=火局生向；向首丁未=木局墓向。 */
  const DAJU_XIANG={
    '寅午戌':{sheng:['艮','寅'],wang:['丙','午'],mu:['辛','戌']},
    '申子辰':{sheng:['坤','申'],wang:['壬','子'],mu:['乙','辰']},
    '巳酉丑':{sheng:['巽','巳'],wang:['庚','酉'],mu:['癸','丑']},
    '亥卯未':{sheng:['乾','亥'],wang:['甲','卯'],mu:['丁','未']}
  };
  function daJuXiang(faceShan){
    const key=SHAN_SANHE[faceShan];
    if(!key) return null;
    const d=DAJU_XIANG[key];
    let type=null;
    if(d.sheng.indexOf(faceShan)>=0) type='生向';
    else if(d.wang.indexOf(faceShan)>=0) type='旺向';
    else if(d.mu.indexOf(faceShan)>=0) type='墓向';
    const ju=SANHE_JU[key];
    return {faceShan, ju:ju.ju, key, type,
      san:[{name:'生向', shan:d.sheng[0]}, {name:'旺向', shan:d.wang[0]}, {name:'墓向', shan:d.mu[0]}],
      shou:ju.shou};
  }
  /* 当运玄空吉向扫描：24 向首 × 当前运，列旺山旺向/双星到向/双星到山候选 */
  function xkDaLiXiang(year){
    const out=[];
    for(const face of SHAN_LIST){
      const sit=SHAN_LIST[(SHAN_LIST.indexOf(face)+12)%24];
      const xk=xuanKong(sit, face, year);
      if(!xk) continue;
      const gj=xk.geju;
      const fanFu=gj.indexOf('伏吟')>=0||gj.indexOf('反吟')>=0;
      if(gj.indexOf('旺山旺向')===0) out.push({sit, face, gj, grade:fanFu?'上格而犯伏吟反吟（慎用）':'上格'});
      else if(gj.indexOf('双星到向')===0&&!fanFu) out.push({sit, face, gj, grade:'次格（须向首有水外有山）'});
    }
    return out;
  }
  /* ===================== 零正神方位（拨水入零堂） =====================
     【定源】《天玉经》零正法（通行简法）：当运旺星所临之宫为正神方，与运星合十之宫为零神方。
     正神方宜高实静满（山、高大建筑、常坐之正用），忌低空动水；零神方宜低空虚动（明堂、门路、水光），
     拨水入零堂主旺财。零神即当运衰气之方，衰位反用故以空动纳之。
     锚点：一运正神坎（北）、零神离（南）；八运正神艮（东北）、零神坤（西南）；九运正神离（南）、零神坎（北）。
     【流派】零正取用另有兼论照神（生成数宫）配水之说，本页取合十通行简法。 */
  function lingZheng(yun){
    const y=Math.round(Number(yun));
    if(!(y>=1&&y<=9)) return null;
    const zp=y, lp=10-y;
    return {yun:y, zhengPalace:zp, zhengDir:NINE_DIR[zp], zhengGua:NINE_BAGUA[zp],
      lingPalace:lp, lingDir:NINE_DIR[lp], lingGua:NINE_BAGUA[lp],
      zhengMean:'正神方，当运旺气所临：宜高实静满，山体、高大建筑、常坐常动之正用皆宜；忌低陷动水，旺气宜满不宜空。',
      lingMean:'零神方，衰气之位反用：宜低空虚动，明堂、门路、水光动气皆宜，拨水入零堂主旺财；忌高压实塞。'};
  }
  /* ===================== 消亡水（先后天卦位水口） =====================
     【定源】先天八卦方位配后天罗盘（罗经先天八卦层通行例）：乾南（离位）、坤北（坎位）、离东（震位）、
     坎西（兑位）、震东北（艮位）、兑东南（巽位）、巽西南（坤位）、艮西北（乾位）。
     消水：先天卦位来水、流去其后天卦位；亡水：后天卦位来水、流去其先天卦位。
     来去以卦宫论（二十四山各随其卦），消亡水主丁财两败，通说较八煞黄泉尤忌，去水口犯之尤凶。
     锚点：坎卦先天在西（兑位宫7）、后天在北（宫1）：酉方来水去子方=犯消水（坎），子方来水去酉方=犯亡水（坎）；
     乾卦先天在南（宫9）、后天在西北（宫6）：午方来水去乾方=犯消水（乾）。 */
  const XIAN_TIAN_GONG={乾:9,兑:4,离:3,震:8,巽:2,坎:7,艮:6,坤:1};
  function xiaoWangShui(laiShan, quShan){
    if(!SHAN_BAGUA[laiShan]||!SHAN_BAGUA[quShan]) return null;
    const laiPalace=SHAN_BAZI[laiShan], quPalace=SHAN_BAZI[quShan];
    const houGong={坎:1,坤:2,震:3,巽:4,乾:6,兑:7,艮:8,离:9};
    let xiao=null, wang=null;
    for(const g in XIAN_TIAN_GONG){
      if(laiPalace===XIAN_TIAN_GONG[g]&&quPalace===houGong[g]) xiao=g;
      if(laiPalace===houGong[g]&&quPalace===XIAN_TIAN_GONG[g]) wang=g;
    }
    const parts=[];
    if(xiao) parts.push(xiao+'卦先天位来水（'+NINE_DIR[XIAN_TIAN_GONG[xiao]]+'）流去其后天位（'+NINE_DIR[houGong[xiao]]+'），犯消水，主败丁破财，去水口见之尤忌');
    if(wang) parts.push(wang+'卦后天位来水（'+NINE_DIR[houGong[wang]]+'）流去其先天位（'+NINE_DIR[XIAN_TIAN_GONG[wang]]+'），犯亡水，主伤丁损寿，去水口见之尤忌');
    if(laiShan===quShan) parts.push('来去同宫，无消亡可论');
    if(!parts.length) parts.push('来去二方不构成先后天卦位对流，不犯消亡水');
    return {laiShan, quShan, laiPalace, quPalace, xiao, wang, mean:parts.join('；')+'。'};
  }
  /* ===================== 洪范五行与山运（《選擇紀要·洪範五行遁山運》，扶山正法） =====================
     【定源】歌诀定本（南秉吉《選擇紀要》1867，与《协纪》所引同源，二十四山全覆盖）：
     甲寅辰巽大江水，戌子申辛水一同；癸丑坤庚未土看，午壬丙乙火为宗；
     卯艮巳山原属木，酉丁乾亥金生中；惟有金山冬至后，变作下年墓运通。
     归属：水=甲寅辰巽戌子申辛（8）、土=癸丑坤庚未（5）、火=午壬丙乙（4）、木=卯艮巳（3）、金=酉丁乾亥（4）。
     山运遁法（原文）：不论阴阳，只寻其山之墓运：用值年岁干起五鼠遁，遁至其墓位，所得干支纳音五行即山运。
     墓位：水土山墓辰、木山墓未、火山墓戌、金山墓丑。
     金山冬至后先变运：交冬至用下年岁干遁（从年前冬至起筹）。
     山运吉凶：忌年月日时纳音克山运（年克山家）；墓运与四柱纳音相生不相悖为全美（罗龙渊）。
     锚点：巽山（水）丙午年遁至辰得壬辰（长流水）=山运水；丁山（金）丙午年冬至前己丑（霹雳火）、冬至后辛丑（壁上土）；
     子山（水）丙午年遁辰亦壬辰=水。 */
  const HONGFAN_WX={甲:'水',寅:'水',辰:'水',巽:'水',戌:'水',子:'水',申:'水',辛:'水',
    癸:'土',丑:'土',坤:'土',庚:'土',未:'土',
    午:'火',壬:'火',丙:'火',乙:'火',
    卯:'木',艮:'木',巳:'木',
    酉:'金',丁:'金',乾:'金',亥:'金'};
  const HONGFAN_MU={水:'辰',土:'辰',木:'未',火:'戌',金:'丑'};
  const WUZI_QI={甲:'甲',己:'甲',乙:'丙',庚:'丙',丙:'戊',辛:'戊',丁:'庚',壬:'庚',戊:'壬',癸:'壬'};
  function shanYun(shan, yearGZ, afterDongZhi){
    const wx=HONGFAN_WX[shan];
    if(!wx) return null;
    const muZhi=HONGFAN_MU[wx];
    /* 金山冬至后变运：用下年岁干遁 */
    let gan=yearGZ[0];
    if(wx==='金'&&afterDongZhi){
      gan=gzAtIndex(gzIndex(yearGZ)+1)[0];  /* 冬至后用下年岁干 */
    }
    /* 五鼠遁：年干起子时干，顺数至墓支 */
    const qi=WUZI_QI[gan];
    const muIdx=ZHI_IDX[muZhi];
    const yunGan=GAN[(GAN.indexOf(qi)+muIdx)%10];
    const yunGZ=yunGan+muZhi;
    const ny=nayin(yunGZ);
    return {shan, wx, muZhi, yunGZ, yunWx:ny.wx, yunNayin:ny.name, yearGZ, afterDongZhi:!!afterDongZhi&&wx==='金'};
  }
  /* 年克山家（《選擇紀要·神殺義例》原文定式）：“年克者，本年納音克洪範山運納音也。修造最凶。
     如甲子年作水土山，當取火月日時生旺兼主火命祿馬貴人制之……安葬則月日納音制之。制者當令，克者休囚，乃穩。
     子葬父不忌年克，葬母不忌月克。”
     判定：年干支纳音五行克山运纳音五行=犯；月柱/日柱纳音克年纳音五行=有制（葬课以月日制年克）。
     锚点：甲子年水土山（山运戊辰木）：甲子海中金克木=犯年克；月柱纳音火制金=有制。 */
  function nianKeShan(shan, yearGZ, monthGZ, dayGZ, afterDongZhi){
    const sy=shanYun(shan, yearGZ, afterDongZhi);
    if(!sy) return null;
    const yNayin=nayin(yearGZ).wx;
    const kePair={金:'木',木:'土',土:'水',水:'火',火:'金'};
    const hit=kePair[yNayin]===sy.yunWx;
    let controlled=false, ctrlBy='';
    if(hit&&monthGZ){
      const mNayin=nayin(monthGZ).wx, dNayin=dayGZ?nayin(dayGZ).wx:null;
      if(kePair[mNayin]===yNayin){ controlled=true; ctrlBy='月纳音'+nayin(monthGZ).name; }
      else if(dNayin&&kePair[dNayin]===yNayin){ controlled=true; ctrlBy='日纳音'+nayin(dayGZ).name; }
    }
    let zong, mean;
    if(!hit){ zong='吉'; mean=yearGZ+'年纳音'+nayin(yearGZ).name+'（'+yNayin+'）不克山运'+sy.yunNayin+'（'+sy.yunWx+'），不犯年克。'; }
    else if(controlled){ zong='平'; mean='年纳音克山运（'+yNayin+'克'+sy.yunWx+'），得'+ctrlBy+'制之，葬课可用（制者当令、克者休囚乃稳）。'; }
    else{ zong='凶'; mean='年纳音'+nayin(yearGZ).name+'（'+yNayin+'）克山运'+sy.yunNayin+'（'+sy.yunWx+'），犯年克山家，修造最凶；葬课须月日纳音制之，无制另择。'; }
    return {shan, yearGZ, yunGZ:sy.yunGZ, yunWx:sy.yunWx, yearWx:yNayin, hit, controlled, zong, mean};
  }
  /* ===================== 月家煞到山（择月层：先择月、后择日） =====================
     【定源】月家方位煞（《协纪辨方书》义例，月与年同例）：
     月三煞以月建三合局起（寅午戌月煞北亥子丑、申子辰月煞南巳午未、巳酉丑月煞东寅卯辰、亥卯未月煞西申酉戌）；
     月破＝月建所冲之支，冲山为大煞，其月内忌动土修造；
     月刑＝月建所刑之支（三刑例：寅刑巳、巳刑申、申刑寅，丑刑戌、戌刑未、未刑丑，子刑卯、卯刑子，辰午酉亥自刑）；
     月害＝六害（子未、丑午、寅巳、卯辰、申亥、酉戌两两相害）；
     月五黄按月家紫白盘落宫（月紫白按年支三分组与节气月起，见 monthZiBai）。
     坐山取双山配支（SHAN_SHUANGZHI），卦宫取 SHAN_BAGUA。
     锚点：亥月破巳、午月三煞在亥子丑、子月刑卯、午月害丑、午年酉月五黄落离（坐丙犯月五黄）。 */
  const YUE_XING={寅:'巳',卯:'子',辰:'辰',巳:'申',午:'午',未:'丑',申:'寅',酉:'酉',戌:'未',亥:'亥',子:'卯',丑:'戌'};
  const YUE_HAI={寅:'巳',卯:'辰',辰:'卯',巳:'寅',午:'丑',未:'子',申:'亥',酉:'戌',戌:'酉',亥:'申',子:'未',丑:'午'};
  function yueShaShan(shan, mZhi, yZhi){
    const sz=SHAN_SHUANGZHI[shan]||shan;
    const hits=[];
    const mss=SANSHA_ZHI[mZhi]||[];
    if(mss.indexOf(sz)>=0) hits.push({name:'月三煞到山', zhi:sz, w:-14});
    if(CHONG[mZhi]===sz) hits.push({name:'月破到山', zhi:sz, w:-14});
    if(YUE_XING[mZhi]===sz) hits.push({name:'月刑到山', zhi:sz, w:-4});
    if(YUE_HAI[mZhi]===sz) hits.push({name:'月害到山', zhi:sz, w:-4});
    const wuPalace=fiveYellow(monthZiBai(yZhi, mZhi).board);
    if(SHAN_BAGUA[shan]===NINE_BAGUA[wuPalace]) hits.push({name:'月五黄到山', zhi:NINE_DIR[wuPalace]+'方', w:-8});
    return {shan, mZhi, sz, hits, zong:hits.length?(hits.some(h=>h.w<=-14)?'凶':'慎'):'吉'};
  }
  /* ===================== 时家神煞（葬课定时辰用） =====================
     【定源】五不遇时（《协纪辨方书》引《三命通会》通行例）：时干克日干为五不遇时：
     甲庚相克之类：甲日庚午、乙日辛巳、丙日壬辰、丁日癸卯、戊日甲寅、己日乙丑、庚日丙子、
     辛日丁酉、壬日戊申、癸日己未（时干克日干，阳克阳阴克阴；时支即该克干之禄位）。
     安葬用事时犯之大忌。
     锚点：甲日庚午时五不遇、乙日辛巳时五不遇；甲日己巳时非（阴克阳不取）。
     【定源】时破（时破日冲）：用时地支与日支相冲为时破，诸事不宜，安葬尤忌。
     锚点：子日午时为时破。
     【定源】旬空时：用时地支落日柱旬空（甲子旬中戌亥空之类），吉时减力。
     【定源】日禄时（五鼠遁禄时）：用时地支为日干之禄（甲日子时非禄、甲日寅时无：五鼠遁甲己日起甲子，
     甲日时支为寅之干支是丙寅，非禄到；禄时正确取法：时支=日干禄位之支，如甲日卯时？非：
     甲禄在寅，甲日丙寅时即禄时（时支寅）。锚点：甲日丙寅时=日禄时（禄神登时）。
     【定源】贵人登天时（《协纪辨方书·贵人登天时》通行例，按日干定吉时）：
     甲戊庚日丑未时、乙己日子申时、丙丁日亥酉时、壬癸日卯巳时、辛日午寅时为天乙贵人时，用事吉。
     锚点：甲日丑未时贵人登时；辛日午寅时贵人登时。 */
  const WU_BUYU={甲:'庚午',乙:'辛巳',丙:'壬辰',丁:'癸卯',戊:'甲寅',己:'乙丑',庚:'丙子',辛:'丁酉',壬:'戊申',癸:'己未'};
  /* 日柱旬空（甲子旬戌亥空…） */
  const XUN_KONG={'甲子':['戌','亥'],'甲戌':['申','酉'],'甲申':['午','未'],'甲午':['辰','巳'],'甲辰':['寅','卯'],'甲寅':['子','丑']};
  function shiJiaSha(dayGZ, hourIdx){
    if(!dayGZ||hourIdx==null||hourIdx<0) return null;
    const dayGan=dayGZ[0], dayZhi=dayGZ[1];
    const hZhi=ZHI[hourIdx%12];
    /* 五鼠遁起时干 */
    const qi=WUZI_QI[dayGan];
    const hGan=GAN[(GAN.indexOf(qi)+hourIdx)%10];
    const hGZ=hGan+hZhi;
    const hits=[], ji=[];
    /* 五不遇时：时干克日干且同阴阳（阳克阳、阴克阴），以本日干支查表即唯一时辰 */
    if(WU_BUYU[dayGan]===hGZ){
      hits.push({name:'五不遇时', gz:hGZ, sev:'大', mean:'时干'+hGan+'克日干'+dayGan+'且同趋，五不遇时，安葬大忌'});
    }
    /* 时破：时支冲日支 */
    if(CHONG[hZhi]===dayZhi){
      hits.push({name:'时破', gz:hGZ, sev:'大', mean:'时支'+hZhi+'冲日支'+dayZhi+'，时破大忌'});
    }
    /* 旬空时 */
    const nkIdx=gzIndex(dayGZ);
    const xunStart=nkIdx-nkIdx%10;
    const xk=XUN_KONG[GAN[xunStart%10]+ZHI[xunStart%12]];
    if(xk&&xk.indexOf(hZhi)>=0){
      hits.push({name:'旬空时', gz:hGZ, sev:'中', mean:'时支'+hZhi+'落日柱旬空，吉力减'});
    }
    /* 日禄时：时支为日干禄位 */
    if(GAN_LU[dayGan]===hZhi){
      ji.push({name:'日禄时', gz:hGZ, mean:'时支'+hZhi+'为日干禄位，禄神登时，吉'});
    }
    /* 贵人登天时：时支为日干天乙贵人位 */
    if(GAN_GUIREN[dayGan]&&GAN_GUIREN[dayGan].indexOf(hZhi)>=0){
      ji.push({name:'贵人登时', gz:hGZ, mean:'时支'+hZhi+'为日干天乙贵人位，贵人登时，吉'});
    }
    const bad=hits.some(h=>h.sev==='大');
    return {dayGZ, hourIdx, hGZ, hGan, hZhi, hits, ji, usable:!bad};
  }
  /* ===================== 自检锚点 ===================== */
  /* FS.selfTest()：集中校验上列全部【定源】锚点。任何修改后须全部通过方可发布；
     需改锚点时必须先给出典籍出处并同步【定源】注释，防止改对改错、错处漏改。 */
  /* ===================== 玄空高级格局（全局三般卦 连茹格 七星打劫 城门诀 令星入囚） ===================== */
  /* 【定源】父母三般卦数组：一四七、二五八、三六九。全局三般卦（《沈氏玄空学》三般卦格）：全盘九宫运、山、向
     三星合成一四七或二五八或三六九，主三元不败；连茹格（连珠三般卦）：全盘九宫运、山、向三星成连续三元
     （一二三、二三四……九一二，九连一回环）。诸书所列成局坐向互有出入，本页按定义逐宫判定。
     锚点：八运艮山坤向=全局父母三般卦（山盘2入中顺、向盘5入中顺，逐宫皆合三般）。 */
  const SAN_BAN_GROUPS=[[1,4,7],[2,5,8],[3,6,9]];
  function sanBanGroupIdx(star){ return SAN_BAN_GROUPS.findIndex(g=>g.indexOf(star)>=0); }
  function lianRuMatch(stars){
    const set=stars.slice().sort((a,b)=>a-b);
    for(let n=1;n<=9;n++){
      const seq=[n, n%9+1, (n+1)%9+1].sort((a,b)=>a-b);
      if(set[0]===seq[0]&&set[1]===seq[1]&&set[2]===seq[2]) return true;
    }
    return false;
  }
  /* 【定源】七星打劫（章氏《阴阳二宅录验》例，沈氏《玄空学》述）：须双星到向（山向两旺星同会向首），
     震、乾、离三宫山向飞星合成一四七、二五八、三六九者为真打劫（离宫打劫，用离）；
     坎、巽、兑三宫合成者为假打劫（坎宫打劫，用坎）。用离则不能用坎。犯伏吟反吟不可用；
     打劫局主劫取未来旺气、三元不败，三宫宜门路通气、外有明堂。
     【流派】有单取向星到向即可成劫之宽式，本页从严取双星到向。 */
  function daJieCheck(xk){
    if(xk.geju!=='双星到向') return null;
    const grpPalaces=(palaces)=>{
      const g=new Set(palaces.map(p=>sanBanGroupIdx(xk.sitBoard.find(x=>x.palace===p).star)));
      palaces.forEach(p=>g.add(sanBanGroupIdx(xk.faceBoard.find(x=>x.palace===p).star)));
      if(g.size!==1||g.has(-1)) return null;
      const stars=[...new Set(palaces.flatMap(p=>[xk.sitBoard.find(x=>x.palace===p).star, xk.faceBoard.find(x=>x.palace===p).star]))];
      return stars.length===3?SAN_BAN_GROUPS[[...g][0]]:null;
    };
    const fanFu=xk.fuYin.sit||xk.fuYin.face||xk.fanYin.sit||xk.fanYin.face;
    const zhen=grpPalaces([9,3,6]);   /* 离、震、乾 */
    const jia=grpPalaces([1,4,7]);    /* 坎、巽、兑 */
    if(!zhen&&!jia) return null;
    return {type:zhen?'真打劫（离宫打劫）':'假打劫（坎宫打劫）', group:zhen||jia,
      palaces:zhen?[9,3,6]:[1,4,7], fanFu};
  }
  /* 【定源】城门诀（《沈氏玄空学》城门法）：城门者，向首两旁卦宫也。立天元向取两旁宫之天元位、人元取人元位、
     地元取地元位；两旁中与向首卦合生成之数（一六共宗、二七同道、三八为朋、四九为友）者为正城门，余为副城门。
     取用：以城门位之运盘星入中，依城门位之山阴阳顺逆飞布，当运旺星能飞到城门位者方可取用；
     城门吉力仅限本运，运过即败；形局须旁有缺口、水光或通路（形法前提，本页仅排理气）。
     锚点：八运乾山巽向：向首巽宫（四），生成四九之友，正城门在离宫（天元位午）；八运子山午向：正城门巽宫（天元位巽）。 */
  const CHENG_MEN_GEN={1:6,6:1,2:7,7:2,3:8,8:3,4:9,9:4};
  const CHENG_MEN_NB={1:[6,8],8:[1,3],3:[8,4],4:[3,9],9:[4,2],2:[9,7],7:[2,6],6:[7,1]};
  function chengMenCheck(xk){
    const fp=xk.faceNum, yun=xk.yun.yun;
    const nb=CHENG_MEN_NB[fp];
    if(!nb) return null;
    const judge=(p)=>{
      const shan=sameYuanShan(p, xk.faceShan);
      const m=xk.yunBoard.find(x=>x.palace===p).star;
      const board=shanYang(shan)?buildBoard(m):buildBoardRev(m);
      return {palace:p, shan, usable:board.find(x=>x.palace===p).star===yun};
    };
    const two=nb.map(judge);
    const zheng=two.find(x=>CHENG_MEN_GEN[x.palace]===fp)||two[0];
    const fu=two.find(x=>x!==zheng);
    return {zheng, fu};
  }
  /* 【定源】令星入囚（《沈氏玄空学》入囚法；知乎《地运入囚》、白鹤鸣九运入囚说同）：宅运盘山盘/向盘入中之星
     困于中宫，行至其数当令之运，当令旺星即被囚于中宫不能作用，主该运损丁（山星）损财（向星）。
     锚点：八运子山午向山星4入中（应四运山星入囚）、向星3入中（应三运向星入囚）；
     九运子山午向山星5入中（应五运入囚）、向星4入中（应四运入囚）。 */
  function ruQiuCheck(xk){
    const info=(k)=>{
      const y=yunQi(1864+(k-1)*20+4);
      return {yun:k, name:y.name, start:y.start, end:y.end};
    };
    return {shan:info(xk.sitIn), face:info(xk.faceIn)};
  }
  /* 汇总高级格局判定：入参 xuanKong 结果 */
  function gaoGeJu(xk){
    if(!xk) return null;
    let sanBan=true, lianRu=true;
    for(const n of [1,2,3,4,6,7,8,9]){
      const ys=xk.yunBoard.find(x=>x.palace===n).star;
      const ss=xk.sitBoard.find(x=>x.palace===n).star;
      const fs=xk.faceBoard.find(x=>x.palace===n).star;
      const g=sanBanGroupIdx(ys);
      if(g<0||sanBanGroupIdx(ss)!==g||sanBanGroupIdx(fs)!==g) sanBan=false;
      if(!lianRuMatch([ys,ss,fs])) lianRu=false;
    }
    return {sanBan, lianRu, daJie:daJieCheck(xk), chengMen:chengMenCheck(xk), ruQiu:ruQiuCheck(xk)};
  }
  /* ===================== 流年飞星叠宅运盘（岁运叠断） ===================== */
  /* 【定源】玄空岁运叠断通行法：以流年紫白年星入中飞布八方（年家紫白见 yearZiBai 定源），
     将流年星与宅运盘各宫山、向星参断：流年吉星（一白四绿六白八白九紫及当运生气）临宅盘旺宫、门路主应其年引动；
     流年凶星（二黑病符、三碧蚩尤、五黄关煞、七赤破军）临向首、大门、坐山之宫，其年须避忌静守、依凶星化解。
     向首为纳气之口、大门为出入之口，两者不必同宫：门设向首时合一，门在别宫时各按其宫出断，
     故本函数收 doorGua 一参（宅门所在之卦），与向首宫分开判、分开报。
     流年太岁、岁破、三煞方位另见避煞层，此处不重列。
     锚点：2026丙午年星一白入中、五黄落离（南）；2024甲辰年星三碧入中、五黄落西（七宫）。 */
  function suiNianDie(xk, year, doorGua){
    if(!xk) return null;
    const yb=yearZiBai(year);
    const gatePalace=doorGua?(Object.keys(NINE_BAGUA).find(k=>NINE_BAGUA[k]===doorGua)*1||null):null;
    const hasGate=!!gatePalace&&gatePalace!==xk.faceNum;
    const rows=[1,2,3,4,5,6,7,8,9].map(n=>{
      const ns=yb.board.find(x=>x.palace===n).star;
      const ss=xk.sitBoard.find(x=>x.palace===n).star;
      const fs=xk.faceBoard.find(x=>x.palace===n).star;
      return {palace:n, dir:NINE_DIR[n], nian:ns, sit:ss, face:fs,
        comboSM:comboJx(ns, ss), comboSF:comboJx(ns, fs),
        isDoor:n===xk.faceNum, isSit:n===xk.sitNum, isGate:hasGate&&n===gatePalace};
    });
    const door=rows.find(r=>r.isDoor), sit=rows.find(r=>r.isSit), gate=rows.find(r=>r.isGate)||null;
    /* 九星名按洛书宫数直取，一白至九紫一一对应，缺位即取空 */
    const wNm=s=>['','一白','二黑病符','三碧是非','四绿','五黄','六白','七赤破军','八白','九紫'][s]||'';
    const gateTxt=gate?('大门（门在'+NINE_BAGUA[gate.palace]+NINE_DIR[gate.palace]+'）'):'大门';
    const warnings=[];
    /* 门设向首时向首即大门，两句合一；门在别宫时向首与大门各出各的一条 */
    if(gate){
      if(door.nian===5) warnings.push('流年五黄到向首之宫，向首为纳气之口，其年忌动土、宜静守化解（金泄之）');
      if(gate.nian===5) warnings.push('流年五黄到'+gateTxt+'之宫，当年大门忌动土、宜静守化解（金泄之）');
    }else if(door.nian===5){
      warnings.push('流年五黄到向首（大门）之宫，当年大门忌动土、宜静守化解（金泄之）');
    }
    if(sit.nian===5) warnings.push('流年五黄到坐山之宫，当年坐山宜静，忌动土修造');
    [2,3,7].forEach(s=>{
      if(gate){
        if(door.nian===s) warnings.push('流年'+wNm(s)+'到向首之宫，其年口舌病符破耗，宜依星化解');
        if(gate.nian===s) warnings.push('流年'+wNm(s)+'到'+gateTxt+'，其年口舌病符破耗，宜依星化解');
      }else if(door.nian===s) warnings.push('流年'+wNm(s)+'到大门，其年口舌病符破耗，宜依星化解');
      if(sit.nian===s) warnings.push('流年'+wNm(s)+'到坐山，其年宅长宜静养、忌动');
    });
    const jiYin=rows.filter(r=>[1,4,6,8,9].includes(r.nian)&&(r.sit===xk.yun.yun||r.face===xk.yun.yun))
      .map(r=>NINE_BAGUA[r.palace]+NINE_DIR[r.palace]);
    if(jiYin.length) warnings.push('流年吉星引动宅盘旺宫：'+jiYin.join('、')+'（其年宜开门纳气、动而用之）');
    return {year, inCenter:yb.inCenter, wuHuangPalace:fiveYellow(yb.board),
      door:{palace:xk.faceNum, nian:door.nian}, sit:{palace:xk.sitNum, nian:sit.nian},
      gate:gate?{palace:gate.palace, nian:gate.nian}:null, rows, warnings};
  }
  /* ===================== 八宅穿宫九星（竹节贯井法） ===================== */
  /* 【定源】《入地眼全书·阳宅卷十》竹节贯井法：“从大门起游星，数至向上第一栋，逆生而入，以辨某栋为三吉宜高，
     某栋为四凶宜低也。如正中开大门，则大门即第一前重也。”
     逐进递进（动宅常理）：贪狼生气木生五鬼廉贞火，五鬼火生祸害禄存土，天医巨门土生延年武曲金，祸害土生绝命破军金，
     延年破军金生六煞文曲水，六煞水单生生气贪狼木：吉生吉、凶生凶。
     变宅（六七进）：“五鬼火生天医土，天医土反生绝命金，祸害土反生延年金”。
     化宅（八九进）：双土双金双木并进以全九星之用，末栋辅弼星随门化（例：坎宅巽门九栋：天土祸土绝金延金六水生木辅木五火右弼）。
     第一栋定星：从门卦起游星数至向首卦（傍角开门）；正中开大门（门即向首第一重）则以宅卦查门卦所落游年星。
     锚点：坎宅离门第一栋延年金星、二栋六煞水、三栋生气木；坎宅巽门（向离）第一栋天医土、二栋延年金、三栋六煞水、四栋生气木、五栋五鬼火。 */
  const CHUAN_NEXT={'生气':'五鬼','五鬼':'祸害','天医':'延年','祸害':'绝命','延年':'六煞','绝命':'六煞','六煞':'生气','伏位':'五鬼'};
  const CHUAN_BIAN={'五鬼':'天医','天医':'绝命','祸害':'延年'};
  const CHUAN_PARTNER={'生气':'伏位','伏位':'生气','天医':'祸害','祸害':'天医','延年':'绝命','绝命':'延年'};
  const YOU_JI={'生气':'大吉','天医':'次吉','延年':'上吉','伏位':'吉','绝命':'大凶','五鬼':'大凶','祸害':'凶','六煞':'凶'};
  function chuanGong(zhaiGua, doorGua, faceGua, n){
    if(!BAZHAI[zhaiGua]||!BAZHAI[doorGua]||!BAZHAI[faceGua]) return null;
    const first=doorGua===faceGua?youXing(zhaiGua, doorGua):youXing(doorGua, faceGua);
    const stars=[first];
    const zhaiType=n<=5?'动宅':(n<=7?'变宅':'化宅');
    if(n<=7){
      for(let i=2;i<=n;i++){
        const prev=stars[i-2];
        const nxt=(n>=6&&i>=6&&CHUAN_BIAN[prev])?CHUAN_BIAN[prev]:CHUAN_NEXT[prev];
        stars.push(nxt);
      }
    }else{
      /* 化宅：先并进同五行配星（双土双金双木），再按常理递进，末栋辅弼星随门化 */
      while(stars.length<n-1){
        const prev=stars[stars.length-1], prev2=stars[stars.length-2];
        const p=CHUAN_PARTNER[prev];
        if(p&&prev2!==p){ stars.push(p); continue; }
        const nxt=CHUAN_NEXT[prev]||CHUAN_BIAN[prev]||'生气';
        stars.push(nxt);
      }
      stars.push('伏位');
    }
    return {zhaiGua, doorGua, faceGua, n, zhaiType,
      firstRule:doorGua===faceGua?'正中开大门，门即第一前重，以宅卦查门星':'从门卦起游星数至向首卦',
      stars:stars.map(s=>({star:s, jx:YOU_JI[s], gao:(['生气','天医','延年'].indexOf(s)>=0)?'宜高':'宜低'}))};
  }
  /* ===================== 统一断语阶梯与模块评分 =====================
     【定源体例】评分三制（替代旧散数制）：
     一、统一断语阶梯 JIE_TI：典籍断语本以凶度语言分档（断不可用/大凶/凶/次忌/平/小吉/吉/上吉），
        本站将语言档映射为点数，一处定义、各模块引用，杜绝散数互不成比例。语言档归档举典：
        《罗经透解》龟甲火坑"不可用"→否决；《协纪辨方书》五黄"正关煞"、年克山家"修造最凶"→大凶；
        三煞"大煞"、岁破冲→凶；《八宅明镜》祸害六煞→次忌、生气延年→吉；旺山旺向→上吉。
        档点数值为本站归纳，语言档划分有典可据；各模块断语归档随注依据，归档无典者明标站内归纳。
     二、一票否决：典籍明言"断不可用"者（骑缝空亡线、龟甲火坑线等），不论总分直接 0 分，吉不敌禁。
     三、体用分离：宅评（静态诸法加权，srZhaiPing）与年评（流年叠断，scoreSuiyun）分列，
        蒋大鸿一系宅运与流年两断：宅评定"可居与否"，年评定"当年宜忌"，不再混入一个百分。
     模块分式：got = 60（宅盘中枢）+ Σ阶梯档点，封顶100下限0；方位避忌类以100为基逐项扣（另注）。
     等级：≥88 上格、≥76 中格、≥60 平、≥40 慎用、<40 另择（全站同尺，与择日页精择分、阴宅页综合判定一致）。
     缺输入依据之处一律不评（返回 null）。 */
  function srGrade(got){ return got>=88?'上格':(got>=76?'中格':(got>=60?'平':(got>=40?'慎用':'另择'))); }
  const JIE_TI={'大凶':-25,'凶':-15,'次忌':-8,'平':0,'小吉':8,'吉':15,'上吉':25};
  function jieTiSum(levels){ const a=Array.isArray(levels)?levels:[levels]; return a.reduce((s,l)=>s+(JIE_TI[l]||0),0); }
  function srFromLadder(levels){ return Math.max(0, Math.min(100, 60+jieTiSum(levels))); }
  function srVeto(note){ return {got:0, grade:srGrade(0), veto:true, note}; }
  const STAR_NAMES_CN={1:'一白',2:'二黑',3:'三碧',4:'四绿',5:'五黄',6:'六白',7:'七赤',8:'八白',9:'九紫'};
  /* 玄空格局分（阶梯制）：格局档：旺山旺向上吉（通行断"上上吉格"）、双星到山/到向吉、单旺小吉、
     上山下水凶、丁财不济大凶；三般卦连茹吉（原文"三元不败"，然成局极罕，作救局之吉计）；
     可用城门小吉、打劫可用吉；伏吟凶、反吟凶（通行断"伏吟反吟泣呻吟"）、兼向替卦次忌；骑缝空亡否决。
     锚点：八运乾山巽向=93上格（旺山旺向上吉+可用城门小吉）；八运子山午向=90上格（双星到向+真打劫）；
     八运艮山坤向=68平（上山下水凶+全局三般卦吉+可用城门小吉）；八运子山兼压线=0否决。 */
  function scoreGeju(xk){
    if(!xk) return null;
    if(xk.sitKong||xk.faceKong) return srVeto('坐向压交界线犯骑缝空亡，典籍断不可立向，一票否决。');
    const LV={'旺山旺向':'上吉','双星到山':'吉','双星到向':'吉','单旺星到山（旺丁）':'小吉','单旺星到向（旺财）':'小吉','上山下水':'凶','丁财不济':'大凶'};
    const lvs=[LV[xk.geju]||'平'];
    const parts=[xk.geju+'（'+lvs[0]+'）'];
    const gg=gaoGeJu(xk);
    if(gg.sanBan||gg.lianRu){ lvs.push('吉'); parts.push((gg.sanBan?'全局三般卦':'连茹格')+'（三元不败）'); }
    if(gg.daJie&&!gg.daJie.fanFu){ lvs.push('吉'); parts.push(gg.daJie.type); }
    if(gg.chengMen&&(gg.chengMen.zheng.usable||gg.chengMen.fu.usable)){ lvs.push('小吉'); parts.push('可用城门'); }
    if(xk.fuYin.sit||xk.fuYin.face){ lvs.push('凶'); parts.push('伏吟'); }
    if(xk.fanYin.sit||xk.fanYin.face){ lvs.push('凶'); parts.push('反吟'); }
    if(xk.sitJian){ lvs.push('次忌'); parts.push('坐山兼向起替卦'); }
    if(xk.faceJian){ lvs.push('次忌'); parts.push('向首兼向起替卦'); }
    const got=srFromLadder(lvs);
    return {got, grade:srGrade(got), note:parts.join('；')+'。'};
  }
  /* 立极坐度分（宅评（静态））：体用分离，只论坐度本体：下卦正向为立极之上、兼向替卦次之、骑缝空亡否决；
     流年太岁岁破三煞五黄到山归年评（scoreSuiyun），与静态坐度分算。
     本模块为单项合规判定，合规即记满分：正向（下卦）坐度得本山正气，记 100；兼向起替卦须精确复测，记 76（中格线）；
     未填实测坐度无从判向，按宅盘中枢 60 计；骑缝空亡断不可立，否决。
     锚点：子山未填度数=60平；子山3度正向=100上格；子山5度兼癸=76中格；子山7.5度骑缝=0否决。 */
  function scoreLixiang(sitShan, deg){
    if(SHAN_LIST.indexOf(sitShan)<0) return null;
    if(typeof deg!=='number'||isNaN(deg)) return {got:60, grade:srGrade(60), note:'未填实测坐度，正向兼向未判，按宅盘中枢计。'};
    const pj=panJue(sitShan, deg);
    if(pj.kong) return srVeto('坐线犯'+pj.kongType+'，典籍断不可立向，一票否决（煞项移年评另计）。');
    const got=pj.jian?76:100;
    return {got, grade:srGrade(got), note:pj.jian?'兼向'+pj.jianTo+'起替卦，坐度仍可用而须精确复测。':'下卦正向，坐度得本山正气，立极之上。'};
  }
  /* 分金分（阶梯制）：旺相珠宝线得本山正气（旺优于相）、孤虚线为孤虚空亡差错不可取用、龟甲火坑线否决
     （《罗经透解》龟甲空亡断不可用）；合宅主年命纳音比和或生年命记吉、克泄记凶（合命从轻加减）。
     本模块为线位合规判定，珠宝线得本山正气即记上格：旺 90、相 80；孤虚线属孤虚空亡差错，记 35；
     合宅主年命纳音比和或生年命再加而不溢顶、克泄再减。
     锚点：子山3度庚子（旺）无年命=90上格；子山3度合庚午年命（纳音比和）=100上格；子山5度孤虚=35另择；子山0度戊子龟甲=0否决。 */
  function scoreFenjin(sitShan, deg, birthYear){
    if(typeof deg!=='number'||isNaN(deg)) return null;
    const pj=panJue(sitShan, deg);
    if(pj.kong) return srVeto('压交界线空亡，无分金可取，一票否决。');
    const fj=fenJinLocate(sitShan, deg);
    if(!fj||!fj.fen) return null;
    let got; const parts=[fj.fen.gz+fj.fen.nayin+'（'+fj.fen.wang+'）'];
    if(fj.fen.wang==='旺'){ got=90; parts.push('珠宝线得正气，线位之上'); }
    else if(fj.fen.wang==='相'){ got=80; parts.push('珠宝线得正气，稍逊于旺'); }
    else if(fj.fen.wang==='龟甲') return srVeto(fj.fen.gz+'龟甲火坑空亡线，典籍断不可用，一票否决。');
    else { got=35; parts.push('孤虚线属孤虚空亡差错，宜移线取珠宝'); }
    if(birthYear){
      const zhu=nayin(yearGZ(birthYear));
      const zm=zhuMingJx(nayin(fj.fen.gz).wx, zhu.wx, '宅主');
      if(zm.jx==='吉'){ got+=10; parts.push(zm.mean+'，合命加分'); }
      else if(zm.jx==='凶'){ got-=15; parts.push(zm.mean+'，合命减分'); }
      else parts.push(zm.mean);
    } else parts.push('未填宅主年命，合命不计');
    got=Math.max(0,Math.min(100,Math.round(got)));
    return {got, grade:srGrade(got), note:parts.join('；')+'。'};
  }
  /* 阳宅三要分（阶梯制，门主灶分权）：《阳宅三要》三要并称而门为先（门为宅之口、纳气第一），灶次之（养命之源）。
     权重门0.5、主0.3、灶0.2为本站归纳（典据：《阳宅三要》三要并称而"门为先"：门为纳气之口、主为居之堂、灶为养命之源，次序即书之纲领；门0.5 取"门先"为主、主0.3 灶0.2 依其次，量值本站拟定）；
   游星档：生气延年吉（《八宅明镜》断生气贪狼木、延年武曲金上吉）、天医伏位小吉（天医巨门土主康泰、伏位辅弼木主平和）、祸害六煞次忌、绝命五鬼凶（绝命破军金最凶、五鬼廉贞火主火厄官非，通行断）。
     逐要得分=60+本模块档点（吉记满分、小吉次之、次忌凶依次扣减），三分加权平均，三要俱吉者达满分线。
     锚点：坎命门延年主天医灶伏位=93上格；坎命门绝命主天医灶伏位=63平。 */
  function scoreSanyao(mingGua, doorGua, mainGua, stoveGua){
    const raw=BAZHAI[mingGua];
    if(!raw||!BAZHAI[doorGua]||!BAZHAI[mainGua]||!BAZHAI[stoveGua]) return null;
    const lvOf=g=>{
      if(g===mingGua) return '小吉';
      for(const k in raw.ji){ if(raw.ji[k]===g) return (k==='生气'||k==='延年')?'吉':'小吉'; }
      for(const k in raw.xiong){ if(raw.xiong[k]===g) return (k==='祸害'||k==='六煞')?'次忌':'凶'; }
      return '平';
    };
    const W={door:0.5, main:0.3, stove:0.2};
    const T={'吉':40,'小吉':25,'次忌':-10,'凶':-20,'平':0};
    const item=g=>60+(T[lvOf(g)]||0);
    const got=Math.round(item(doorGua)*W.door+item(mainGua)*W.main+item(stoveGua)*W.stove);
    return {got, grade:srGrade(got),
      note:mingGua+'命：门落'+doorGua+'（'+lvOf(doorGua)+'，门为先）、主落'+mainGua+'（'+lvOf(mainGua)+'）、灶落'+stoveGua+'（'+lvOf(stoveGua)+'），三要加权合成（《阳宅三要》门为宅之口）。'};
  }
  /* 穿宫分（阶梯制）：三吉栋（生气天医延年）吉、伏位小吉、祸害六煞次忌、绝命五鬼凶，逐进均分于中枢60上。
     本模块档点按全进皆三吉达满分线配平（吉记满分、小吉次之、次忌凶依次扣减）。
     锚点：坎宅巽门五栋（天医延年六煞生气五鬼）=75中格；五进皆三吉=100上格。 */
  function scoreChuangong(cg){
    if(!cg||!cg.stars||!cg.stars.length) return null;
    const lvOf=s=>(['生气','天医','延年'].indexOf(s)>=0)?'吉':(s==='伏位'?'小吉':((s==='祸害'||s==='六煞')?'次忌':'凶'));
    const T={'吉':40,'小吉':25,'次忌':-15,'凶':-30,'平':0};
    const sum=cg.stars.reduce((a,x)=>a+(T[lvOf(x.star)]||0),0);
    const got=Math.max(0, Math.min(100, 60+Math.round(sum/cg.stars.length)));
    const ji=cg.stars.filter(x=>['生气','天医','延年'].indexOf(x.star)>=0).length;
    return {got, grade:srGrade(got), note:cg.stars.length+'进（层）中三吉栋'+ji+'进，逐进归档均分（吉栋宜高大纳气、凶栋宜低矮卑伏）。'};
  }
  /* 年评分（体用分离之"用"）：流年叠断与流年煞到门坐合参，基线100逐项扣加。
     门取实际门位（doorGua；未填则回落向首，即门开向首之例，与旧值同）；
     档归：流年五黄到门大凶-25（正关煞临纳气口，归档《协纪》"正关煞"）、到坐凶-15；
     流年二黑三碧七赤到门凶-15、到坐次忌-8（门重于坐，纳气之口）；坐山流年煞：
     太岁到坐次忌-8（太岁可坐不可向，坐山值太岁降为次忌）、岁破到坐凶-15、三煞到坐凶-15（"大煞"归档）、年五黄到坐凶-15；
     流年与宅盘凶组合叠宫：大凶组合-8、凶-4，门坐二宫倍计，合计封顶-40；流年吉星引动宅盘旺宫每宫+8封顶+16。
     锚点：九运子山午向2026（坐子山）：五黄到门-25、岁破三煞到坐-30、流年凶组合叠宫封顶-40、吉星引动+8 → 13另择（实值见selfTest）。 */
  function scoreSuiyun(xk, year, sitShan, doorGua){
    if(!xk) return null;
    const sd=suiNianDie(xk, year, doorGua);
    if(!sd) return null;
    let got=100; const ns=[];
    const gateRow=sd.rows.find(r=>r.isGate)||sd.rows.find(r=>r.isDoor);
    const doorNian=gateRow.nian, sitNian=sd.rows.find(r=>r.isSit).nian;
    const doorAt=sd.gate?('门在'+NINE_BAGUA[sd.gate.palace]+NINE_DIR[sd.gate.palace]):'门设向首';
    if(doorNian===5){ got-=25; ns.push('流年五黄到门（正关煞临纳气口，'+doorAt+'）'); }
    else if([2,3,7].indexOf(doorNian)>=0){ got-=15; ns.push('流年'+STAR_NAMES_CN[doorNian]+'到门（'+doorAt+'）'); }
    if(sitNian===5){ got-=15; ns.push('流年五黄到坐'); }
    else if([2,3,7].indexOf(sitNian)>=0){ got-=8; ns.push('流年'+STAR_NAMES_CN[sitNian]+'到坐'); }
    if(sitShan&&SHAN_LIST.indexOf(sitShan)>=0){
      const si=shanInfo(sitShan, year);
      if(si.atTaiSui){ got-=8; ns.push('太岁到坐，宜静不宜动'); }
      if(si.atSuiPo){ got-=15; ns.push('岁破到坐'); }
      if(si.atSanSha){ got-=15; ns.push('三煞到坐'); }
      if(si.atWuHuang){ got-=15; ns.push('年五黄到坐'); }
    }
    let comboDed=0, jiHit=0;
    sd.rows.forEach(r=>{
      const heavy=(r===gateRow||r.isSit)?2:1;
      [r.comboSM, r.comboSF].forEach(cb=>{
        if(cb.jx.indexOf('大凶')>=0) comboDed+=8*heavy;
        else if(cb.jx.indexOf('凶')>=0) comboDed+=4*heavy;
      });
      if([1,4,6,8,9].indexOf(r.nian)>=0&&(xk.sitBoard.find(x=>x.palace===r.palace).star===xk.yun.yun||xk.faceBoard.find(x=>x.palace===r.palace).star===xk.yun.yun)) jiHit++;
    });
    comboDed=Math.min(40, comboDed);
    if(comboDed){ got-=comboDed; ns.push('流年凶组合叠宫'); }
    if(jiHit){ const b=Math.min(16, jiHit*8); got+=b; ns.push('流年吉星引动旺宫'+jiHit+'宫'); }
    got=Math.max(0, Math.min(100, got));
    return {got, grade:srGrade(got), note:(ns.length?ns.join('；'):'流年无凶星叠门坐，亦无凶组合，亦无坐山流年煞')+'。'};
  }
  /* 形煞分（第五层　形煞自检）：近犯（近距离正对）每项-15、远犯（远距离斜对）每项-7，
     近远分档为本站归纳权重；近远合计犯三项以上交加另-25
     锚点：近犯2项=70平；近1远1=78中格；近犯3项=100-45-25=30另择；远犯3项=100-21-25=54慎用；0犯=100上格。 */
  function scoreXingsha(nearN, farN){
    if((nearN!=null&&(typeof nearN!=='number'||isNaN(nearN)||nearN<0))||
       (farN!=null&&(typeof farN!=='number'||isNaN(farN)||farN<0))) return null;
    const n=nearN>0?nearN:0, f=farN>0?farN:0;
    const got=Math.max(0, 100-n*15-f*7-((n+f)>=3?25:0));
    const ns=[];
    if(n) ns.push('近犯'+n+'项');
    if(f) ns.push('远犯'+f+'项');
    if(n+f) {
      if(n+f>=3) ns.push('三项以上交加，凶力相叠');
      return {got, grade:srGrade(got), note:'犯形煞：'+ns.join('，')+'。轻重以远近大小正对程度论，分档仅粗核。'};
    }
    return {got, grade:srGrade(got), note:'未犯形煞（未核对项不计），本项满分。'};
  }
  /* 金锁砂水分（第五层　金锁玉关）：未选山不评（返回 null）；逐山合局（坎坤震巽喜砂、乾兑艮离喜水），
     形差减半，合局率即得分
     锚点：子砂午水（2比2合局）=100；子水午砂（0比2）=0。 */
  function scoreJsy(jsyShans, jsyXing){
    const jsy=jsyShans||{};
    const keys=Object.keys(jsy).filter(k=>jsy[k]);
    if(!keys.length) return null;
    let hit=0;
    keys.forEach(k=>{
      const g=SHAN_BAGUA[k];
      const want=(g==='坎'||g==='坤'||g==='震'||g==='巽')?'砂':'水';
      let one=jsy[k]===want?1:0;
      if(one&&jsyXing&&jsyXing[g]==='凶') one=0.5;
      hit+=one;
    });
    const got=Math.round(100*hit/keys.length);
    return {got, grade:srGrade(got), note:'已选'+keys.length+'山，合局'+Math.round(hit*10)/10+'山（形差减半），合局率'+Math.round(100*hit/keys.length)+'%。'};
  }
  /* 宅评汇总（体）：静态诸法加权平均，缺输入之模块剔除后权重归一（能评则评、不能评不强评）。
     权重为本站归纳（量值拟定，主从有典据）：玄空格局0.28（宅运之纲《玄空辨正》一系以宅运为宅之体，《沈氏玄空学》同旨）、
     峦头形煞0.20（形为体，外六事之吉凶直接决定可居与否，《阳宅十书》系）、阳宅三要0.20（门主灶人事之要，《阳宅三要》门为先）、
     金锁砂水0.09（水法收气之要，与峦头并重）、穿宫九星0.08（内局层进吉凶）、立极坐度0.07、分金0.08（二者为坐度与线位之合规判定，合规即满分、不合规即否决，故权重从轻）。
     任一含否决项（veto，空亡线/龟甲线等"断不可用"）→ 宅评整体 0 分：吉不敌禁。
     入参 parts: {geju, sanyao, luantou, chuangong, lixiang, fenjin, jsy} 各为模块评分对象或 null。
     锚点：九运子山午向（正向、珠宝线、延年门、五进）＝85 中格；八运乾山巽向全项俱优＝上格；含否决项=0。 */
  function srZhaiPing(parts){
    if(!parts) return null;
    const W={geju:0.28, sanyao:0.20, luantou:0.20, chuangong:0.08, lixiang:0.07, fenjin:0.08, jsy:0.09};
    const NM={geju:'玄空格局', sanyao:'阳宅三要', luantou:'峦头形煞', chuangong:'穿宫九星', lixiang:'立极坐度', fenjin:'分金', jsy:'金锁砂水'};
    const vetoes=[], used=[];
    let sum=0, wsum=0;
    for(const k in W){
      const p=parts[k];
      if(!p||typeof p.got!=='number') continue;
      if(p.veto){ vetoes.push(NM[k]); continue; }
      sum+=p.got*W[k]; wsum+=W[k]; used.push(NM[k]);
    }
    if(!wsum&&!vetoes.length) return null;
    if(vetoes.length) return {got:0, grade:srGrade(0), veto:true, note:vetoes.join('、')+'犯"断不可用"之禁，宅评一票否决；须改线改向后再评。'};
    const got=Math.round(sum/wsum);
    return {got, grade:srGrade(got), used, note:'已评：'+used.join('、')+'（未评模块已剔除）。宅评为体（可居与否），年评为用（当年宜忌），两分分列不混算。'};
  }
  /* ===================== 峦头三因子模型（形煞强度量化） =====================
     【定源】距离分带取"千尺为势、百尺为形"（《管氏地理指蒙》，通行引作郭璞系）：百尺约当今 32 米为"形"之尺度，
     ≤32 米形煞成立足力（形带），逾 32 米入"势"之尺度煞力减半（势带）。
     角度因子（站内归纳）：来物中线与宅面法线夹角≤15°正冲足力（1）、15°~45°斜射减半（0.5）、逾45°不论（0）。
     高低因子（站内归纳，仅逼压类适用）：邻物明显高于宅足力（1）、约同减半（0.5）、低于宅不论（0）。
     基础档（凶度语言归档）：路冲枪煞、天斩煞、反弓煞、尖角冲射、逼压（白虎抬头）=凶
     （路冲"如枪直刺"、反弓"主退财"为通行形法大忌，《阳宅十书》系；白虎抬头通说凶）；
     割脚煞、孤阴孤阳、声光电煞=次忌；玉带环抱（吉水）、玄武有靠（吉山）=吉（正向）。
     强度分=基础档绝对值×距离带×角度×高低（各0~1），逐物累加：got=100-Σ强度+吉形项×8，封顶下限。
     距离未填按形带足力计（从严）、角度未填按正对计（从严）、高低未填按足力计，缺项不隐瞒只从严，断语注明。
     锚点：路冲正对20米=100-15=85上格；同物60米势带=100-8=92上格；斜30°减半同92；逾45°=100不上榜；
     玉带环抱一项=100+8封顶100。 */
  const LUANTOU_DEF={
    '路冲枪煞':{lv:'凶', h:false, mean:'道路长巷直冲宅之门窗，如枪直刺（通行形法大忌）', hua:'门内设玄关屏风挡煞、门楣置凸镜，冲大门者尤忌'},
    '天斩煞':{lv:'凶', h:false, mean:'两幢高楼间狭窄缝隙正对门窗，缝愈窄愈长愈凶（通行形法）', hua:'正对处设屏风、山海镇或高身绿植遮挡，缝隙方门窗少开'},
    '反弓煞':{lv:'凶', h:false, mean:'道路河流反弓外撇，形似弯弓背我（《阳宅十书》系通行"反弓主退财"）', hua:'反弓方置石敢当或高绿植，其方宜静不宜开门'},
    '尖角冲射':{lv:'凶', h:false, mean:'邻屋墙角、屋脊、塔尖、招牌尖角正对门窗（尖角、壁刀煞）', hua:'正对窗置凸镜、绿植；对坐卧之位久者宜改位'},
    '逼压白虎抬头':{lv:'凶', h:true, mean:'邻宅高楼逼近逼压，西侧（白虎方）高过本宅为白虎抬头（通行形法）', hua:'逼压方宜实墙少开窗，宅内明厅亮堂以扶阳'},
    '割脚煞':{lv:'次忌', h:false, mean:'道路河流紧贴宅基逼临而过，无余地带（通行形法）', hua:'贴身方植绿缓冲，气口移离逼临方'},
    '孤阴孤阳':{lv:'次忌', h:false, mean:'紧邻医院殡仪馆庙宇监狱警局变电站等孤阴孤阳之所（通行形法）', hua:'邻近方实墙封闭少开窗，宅内明亮人常聚'},
    '声光电煞':{lv:'次忌', h:false, mean:'高架车流噪音、霓虹光污染、高压电塔基站逼近（现代形法）', hua:'邻方隔音遮光，卧位移离电磁源'},
    '玉带环抱':{lv:'吉', h:false, pos:true, mean:'道路河流弯环抱宅，如玉带缠腰（《阳宅十书》系通行"环抱主聚财"）', hua:'抱方宜开门纳气'},
    '玄武有靠':{lv:'吉', h:true, pos:true, mean:'宅后有山或有高于本宅之建筑为靠，坐实朝空（通行图诀"后高前低"之吉）', hua:'靠方宜实宜静，宜安床设主位'}
  };
  function luantou(items){
    if(!Array.isArray(items)) return null;
    const used=items.filter(x=>x&&x.type&&LUANTOU_DEF[x.type]);
    if(!used.length) return null;
    const rows=used.map(it=>{
      const d=LUANTOU_DEF[it.type];
      const dist=(typeof it.dist==='number'&&!isNaN(it.dist)&&it.dist>=0)?it.dist:null;
      const band=dist==null?'形（未填从严）':(dist<=32?'形':'势');
      const bandF=dist!=null&&dist>32?0.5:1;
      const ang=(typeof it.angle==='number'&&!isNaN(it.angle))?it.angle:null;
      let angF=1, angTxt='正对（未填从严）';
      if(ang!=null){ if(ang>45){ angF=0; angTxt='逾45°不论'; } else if(ang>15){ angF=0.5; angTxt='斜射'; } else angTxt='正对'; }
      let hiF=1, hiTxt='';
      if(d.h){ if(it.height==='高'){ hiF=1; hiTxt='高于宅'; } else if(it.height==='同'){ hiF=0.5; hiTxt='约同'; } else if(it.height==='低'){ hiF=0; hiTxt='低于宅（不论）'; } else hiTxt='未填（从严）'; }
      const base=Math.abs(JIE_TI[d.lv]);
      const strength=Math.round(base*bandF*angF*hiF*10)/10;
      return {type:it.type, dir:it.dir||'', dist, band, ang, angTxt, height:hiTxt, strength,
        jx:d.pos?(strength>0?'吉':'平'):(strength>0?(d.lv==='凶'?'凶':'次忌'):'不论'),
        mean:d.mean+(d.pos?'（正向）':''), hua:d.hua,
        factor:'带'+bandF+'×角'+angF+(d.h?'×高'+hiF:'')};
    });
    const ded=rows.filter(r=>!LUANTOU_DEF[r.type].pos).reduce((s,r)=>s+r.strength,0);
    const bonus=Math.min(16, rows.filter(r=>LUANTOU_DEF[r.type].pos&&r.strength>0).length*8);
    const got=Math.max(0, Math.min(100, 100-Math.round(ded)+bonus));
    const bad=rows.filter(r=>!LUANTOU_DEF[r.type].pos&&r.strength>0).length;
    return {rows, got, grade:srGrade(got),
      note:(bad||bonus?['形物'+rows.length+'项：犯'+bad+'项'+(bonus?'，另见吉形':'')]:['形物'+rows.length+'项：逾45°或低于宅者不论，无计入强度'])+'；距离带依"百尺为形"（32米）分形势两带，缺项从严计并已注明。'};
  }
  /* ===================== 阳宅六事（《八宅明镜》《阳宅集成》六事法+安床） =====================
     【定源】六事：门、路、灶、井、坑厕、碓磨（《阳宅集成》等通行六事法），以命卦起八宅游年取用：
     门、路：纳气动处宜生气延年天医（吉星）；床：安床宜吉方（生气延年天医伏位）；
     灶座：宜压凶方（《八宅明镜》灶法"坐凶向吉"，压绝命五鬼尤吉）；灶口（向）：宜朝吉方；
     井（今饮水位）：宜生气天医，忌压凶方（水动于凶方引凶）；坑厕（今卫生间）：宜压凶方、忌压吉方；
     碓磨（今洗衣机）：动器宜压凶方以泄其气。
     六事归属吉凶：place/face 类吉星吉、凶星凶；press 类（灶座坑厕碓磨）凶星吉、吉星反凶（压吉伤吉）。
     现代对应：井→饮水位/水塔、碓磨→洗衣机、坑厕→卫生间。
     锚点：坎命门巽=生气吉；坎命厕艮=五鬼压之吉；坎命灶坤=绝命压之吉；坎命灶口震=天医朝吉；
     坎命门坤=绝命凶（宜移）。 */
  const LIUSHI_DEF={
    door:{nm:'门', mode:'place', tip:'纳气之口宜吉星'},
    road:{nm:'路', mode:'place', tip:'动线来路宜吉星'},
    stove:{nm:'灶座', mode:'press', tip:'坐凶向吉（《八宅明镜》灶法）'},
    stoveDir:{nm:'灶口（向）', mode:'face', tip:'灶口朝吉方纳吉'},
    bed:{nm:'床', mode:'place', tip:'安床宜吉方'},
    well:{nm:'井（饮水位）', mode:'place', tip:'水动之处宜吉星'},
    wc:{nm:'坑厕（卫生间）', mode:'press', tip:'压凶方化凶，忌压吉方'},
    mill:{nm:'碓磨（洗衣机）', mode:'press', tip:'动器压凶方泄其气'}
  };
  function liuShi(mingGz, items){
    const raw=BAZHAI[mingGz];
    if(!raw||!items) return null;
    const isJi=s=>['生气','天医','延年','伏位'].indexOf(s)>=0;
    const rows=[]; const parts=[];
    for(const k in LIUSHI_DEF){
      const g=items[k];
      if(!g||!BAZHAI[g]) continue;
      const def=LIUSHI_DEF[k];
      const star=youXing(mingGz, g);
      if(!star) continue;
      let jx, mean, lv;
      if(def.mode==='press'){
        if(!isJi(star)){ jx='吉'; lv='吉'; mean=g+'方落'+star+'，压凶化凶，'+def.tip+'为吉'; }
        else { jx='凶'; lv='凶'; mean=g+'方落'+star+'，压吉方反伤吉气（《八宅明镜》所忌），宜移'; }
      }else{
        if(isJi(star)){ jx='吉'; lv='吉'; mean=g+'方落'+star+'，'+def.tip+'为吉'; }
        else { jx='凶'; lv='凶'; mean=g+'方落'+star+'，凶星之地不宜'+def.nm+'，宜移吉方'; }
      }
      rows.push({key:k, name:def.nm, gua:g, star, jx, mean});
      parts.push(lv);
    }
    if(!rows.length) return null;
    const got=Math.max(0, Math.min(100, 100+jieTiSum(parts)));
    return {mingGua:mingGz, rows, got, grade:srGrade(got),
      note:'六事逐项归档：吉+15、凶-15，'+rows.length+'项合计。坎命灶座以压绝命五鬼为上吉，详见逐项断。'};
  }
  /* ===================== 宅形图诀（《阳宅十书》外形图诀选目） =====================
     【定源】《阳宅十书》系通行图诀选最通行诸式：宅形四平方正吉；"前狭后宽居之稳，富贵平安旺子孙；
     前宽后狭似棺形，住宅当时不安宁"（通行引作《阳宅十书》图诀）；三角斜出火形主灾（通行形法）；
     前高后低（坐空朝满）之忌与后高前低（坐实朝空）之吉（通行图诀）。缺角八式与长宽两式为现代户型
     应用归纳，无典籍原文可附，明标站内归纳。
     锚点：fangzheng=吉、qianzhai=吉、qiankuan=凶、sanjiao=凶、qiangao=凶、houGao=吉、queGen=平带注。 */
  const ZHAI_XING_RULES={
    fangzheng:{nm:'四平方正', src:'《阳宅十书》系通行图诀', jx:'吉', mean:'宅形方正，久居富贵安宁（通行图诀）；现代对应户型方正无缺角'},
    qianzhai:{nm:'前狭后宽', src:'《阳宅十书》系通行图诀', jx:'吉', mean:'“前狭后宽居之稳，富贵平安旺子孙”'},
    qiankuan:{nm:'前宽后狭', src:'《阳宅十书》系通行图诀', jx:'凶', mean:'“前宽后狭似棺形，住宅当时不安宁”；现代对应户型前大后小'},
    sanjiao:{nm:'三角斜出（火形宅）', src:'通行形法（火形尖斜主灾）', jx:'凶', mean:'宅形三角尖出，火形不定，主口舌灾疾；现代对应异形斜边户型'},
    qiangao:{nm:'前高后低', src:'通行图诀（坐空朝满之忌）', jx:'凶', mean:'宅前高耸宅后低陷，坐空朝满，主退败不安；现代对应前有高楼背后低洼'},
    houGao:{nm:'后高前低', src:'通行图诀（坐实朝空之吉）', jx:'吉', mean:'宅后有靠前开朗，坐实朝空，主安稳纳福；现代对应背有高楼面向开阔'},
    changN:{nm:'南北长东西窄（长形）', src:'站内归纳（现代宅形应用）', jx:'吉', mean:'南北纵深长而东西窄，气聚不散，细长之宅宜格局规整'},
    changX:{nm:'东西长南北窄（横形）', src:'站内归纳（现代宅形应用）', jx:'平', mean:'横长之宅气稍散，宜以玄关柜屏风收气'},
    queQian:{nm:'前侧缺角（巽巳或辰）', src:'站内归纳（现代户型缺角应用）', jx:'平', mean:'前侧缺角损长女文书之气，宜其方置高柜绿植补之'},
    queHou:{nm:'后侧缺角（乾亥或戌）', src:'站内归纳（现代户型缺角应用）', jx:'凶', mean:'后侧缺角损老父靠山之气，靠山不实，宜其方实柜补之'},
    queZuo:{nm:'左缺角（震甲或乙）', src:'站内归纳（现代户型缺角应用）', jx:'平', mean:'左缺角损长男青龙之气，宜其方置木质高物'},
    queYou:{nm:'右缺角（兑庚或辛）', src:'站内归纳（现代户型缺角应用）', jx:'平', mean:'右缺角损少女白虎之气，宜其方置矮柜圆润之物'},
    queGen:{nm:'东北缺角（艮丑寅）', src:'站内归纳（现代户型缺角应用）', jx:'平', mean:'东北缺角损少男与生气之方（八运尤忌），宜其方置陶瓷山石'},
    queKun:{nm:'西南缺角（坤未申）', src:'站内归纳（现代户型缺角应用）', jx:'平', mean:'西南缺角损老母坤土之气，宜其方置陶瓷厚重之物'},
    queZhong:{nm:'中宫受侵（电梯井水管道穿心）', src:'站内归纳（现代户型应用）', jx:'凶', mean:'中宫为宅之心，电梯井水管穿心则宅心受侵，主宅运不定；宜中宫静置厚重之物'}
  };
  function zhaiXing(id){
    const r=ZHAI_XING_RULES[id];
    if(!r) return null;
    return {id, nm:r.nm, src:r.src, jx:r.jx, mean:r.mean,
      lvNote:r.src.indexOf('站内归纳')>=0?'（站内归纳，无典籍原文，现代应用）':'（有通行图诀原文）'};
  }
  /* ===================== 玄空六法（谈养吾《玄空六法》参断） =====================
     【定源】谈氏六法：零正、雌雄、金龙、挨星、城门、太岁（《大玄空路透》《玄空六法》讲义系）。
     本页取盘面可算两项与沈氏体系并列参断：
     一、零正（谈氏原法）：上元一二三四运以一二三四宫为正神、六七八九宫为零神；下元六七八九运反之；
        五运前十年承四运、后十年启六运（通行处理）。与本页零正神模块之合十简法（当运为正、合十为零）
        为两派取用，并列展示不由本页裁断。
     二、太岁应期：流年太岁到方（支神方位）与流年紫白到宫合参，谈氏以太岁为六法之用神主应期。
     雌雄（山水相对）、金龙（须实地山水形势）、挨星（谈沈异本无定）盘面不可算，列入理法辨异面板不设计算。
     锚点：一运谈氏正神一二三四宫零神六七八九宫；五运前十年正神同四运、后十年同六运；九运正神六七八九宫；
     2026丙午太岁方在午（离南九宫）；2016丙申太岁方在申（坤西南二宫，与 SHAN_BAZI 申=2 一致）。 */
  const ZHI_GONG={子:1,丑:8,寅:8,卯:3,辰:4,巳:4,午:9,未:2,申:2,酉:7,戌:6,亥:6};
  function liuFa(yun, yunDecade){
    const y=Math.round(Number(yun));
    if(!(y>=1&&y<=9)) return null;
    let eff=y, effNote='';
    if(y===5){ eff=(yunDecade==='after')?6:4; effNote='（五运前十年承四运、后十年启六运，通行处理）'; }
    const zheng=eff<=4?[1,2,3,4]:[6,7,8,9];
    const ling=eff<=4?[6,7,8,9]:[1,2,3,4];
    return {yun:y, eff, effNote,
      zhengPalaces:zheng, lingPalaces:ling,
      zhengDirs:zheng.map(p=>FS9(p)), lingDirs:ling.map(p=>FS9(p)),
      zhengMean:'谈氏正神方（'+zheng.map(p=>NINE_BAGUA[p]+NINE_DIR[p]).join('、')+'）宜高实静满；零神方（'+ling.map(p=>NINE_BAGUA[p]+NINE_DIR[p]).join('、')+'）宜低空虚动，拨水入零堂'+effNote};
  }
  function FS9(p){ return NINE_DIR[p]; }
  function taiSuiFang(year){
    const z=yearGZ(year)[1];
    const palace=ZHI_GONG[z];
    return {year, zhi:z, palace, gua:NINE_BAGUA[palace], dir:NINE_DIR[palace]};
  }
  /* ===================== 理法综合裁决（跨派主从） =====================
     【定源体例】域切分（站内归纳，依各法经典之核心设问）：玄空论宅运纳气（蒋大鸿一系以宅运为纲）、
     八宅论命卦门主灶（《阳宅三要》三要并称而门为先）、三合论坐度水口（《地理五诀》）、
     金锁玉关论砂水配置、形法论外部峦头。同域两派异断之裁决则（站内归纳，仿"断凶易、断吉难"之古义）：
     凶一致从凶（参法两家以上一致断凶方从凶，单参法异断不足推翻主法）；主法断凶从凶（凶从重，吉不敌禁）；
     主法吉而参法凶：取主法吉、附参法条件卡（吉不断死）；主法平参法吉从吉。主参权重3:1之取与域表为
     本站归纳，主法可配置（玄空主/八宅主/三合主）。
     入参 verdicts: [{yu:'lixiang|men|zao|fangwei', fa:'玄空|八宅|三合|金锁|形法', jx, mean}]，
     preset: {lixiang:'三合',...} 覆盖默认主法。
     锚点：立向域玄空吉+三合吉→吉；玄空吉+三合凶→吉（附条件）；玄空凶+三合吉→凶；
     玄空吉+三合凶+形法凶（参法一致凶）→凶。 */
  const ZHEN_YU={lixiang:'立向总评', men:'门位纳气', zao:'灶位', fangwei:'方位催动'};
  const ZHEN_MAIN={lixiang:'玄空', men:'玄空', zao:'八宅', fangwei:'玄空'};
  function zhenJue(verdicts, preset){
    if(!Array.isArray(verdicts)||!verdicts.length) return null;
    const jxLv=s=>{ if(!s) return '平'; if(s.indexOf('大凶')>=0) return '大凶'; if(s.indexOf('凶')>=0) return '凶'; if(s.indexOf('吉')>=0) return '吉'; return '平'; };
    const groups={};
    verdicts.forEach(v=>{ if(v&&v.yu&&ZHEN_YU[v.yu]&&v.fa) (groups[v.yu]=groups[v.yu]||[]).push(v); });
    const out=Object.keys(ZHEN_YU).map(yu=>{
      const vs=groups[yu]||[];
      if(!vs.length) return {yu, name:ZHEN_YU[yu], jx:'缺参', mean:'本域无可用断语（相应模块未填输入），不强评。', entries:[]};
      const mainName=(preset&&preset[yu])||ZHEN_MAIN[yu];
      const mv=vs.find(v=>v.fa===mainName)||vs[0];
      const cvs=vs.filter(v=>v!==mv);
      const mBad=jxLv(mv.jx).indexOf('凶')>=0;
      const cBad=cvs.filter(v=>jxLv(v.jx).indexOf('凶')>=0);
      const cGood=cvs.filter(v=>jxLv(v.jx).indexOf('吉')>=0);
      /* 断要只写主法自身的理由与裁决规则，各参法的理由归 entries 由参断列出，
         同一条理由不在主法与参断里各写一遍；参法是否同断，看参断栏即知，断要不再复述 */
      let jx, mean, conflict=false;
      if(mBad){
        jx=jxLv(mv.jx); conflict=cGood.length>0;
        mean='主法（'+mv.fa+'）断凶，从凶（凶从重）：'+mv.mean
          +(cGood.length?'；参法虽吉，吉不敌主法之禁。':'');
      }else if(cvs.length>=2&&cBad.length===cvs.length){
        jx='凶'; conflict=true;
        mean='主法（'+mv.fa+'）断吉（'+mv.mean+'）不取；参法一致断凶（'+cBad.map(v=>v.fa).join('、')+'），凶一致从凶。';
      }else if(cBad.length){
        jx='吉'; conflict=true;
        mean='主法（'+mv.fa+'）断吉，从主（吉不断死）：'+mv.mean+'；参法异断者附条件核实。';
      }else if(jxLv(mv.jx).indexOf('吉')>=0||cGood.length){
        jx='吉';
        mean='主法（'+mv.fa+'）断吉，从主：'+mv.mean;
      }else{
        jx='平'; mean='本域诸法平断或依据不足：'+mv.mean;
      }
      return {yu, name:ZHEN_YU[yu], main:mv.fa, jx, mean, conflict, entries:cvs};
    });
    return {domains:out, conflictN:out.filter(d=>d.conflict).length};
  }
  function selfTest(){
    const rs=[]; const t=(name,cond)=>rs.push({name, pass:!!cond});
    const eq=(name,got,want)=>t(name, JSON.stringify(got)===JSON.stringify(want));
    /* 年月日时紫白 */
    eq('年紫白1864甲子一白', yearZiBai(1864).inCenter, 1);
    eq('年紫白1984甲子七赤', yearZiBai(1984).inCenter, 7);
    eq('年紫白2024三碧', yearZiBai(2024).inCenter, 3);
    eq('年紫白2025二黑', yearZiBai(2025).inCenter, 2);
    eq('年紫白2026一白', yearZiBai(2026).inCenter, 1);
    eq('2026年五黄落离', fiveYellow(yearZiBai(2026).board), 9);
    eq('月紫白午年寅月八白', monthZiBai('午','寅').inCenter, 8);
    eq('月紫白午年卯月七赤', monthZiBai('午','卯').inCenter, 7);
    eq('月紫白辰年寅月五黄', monthZiBai('辰','寅').inCenter, 5);
    eq('月紫白寅年寅月二黑', monthZiBai('寅','寅').inCenter, 2);
    eq('日紫白阳遁上元甲子一白', dayZiBai(0,true,1).inCenter, 1);
    eq('日紫白阳遁上元癸酉九紫', dayZiBai(8,true,1).inCenter, 9);
    eq('日紫白阴遁上元甲子九紫', dayZiBai(0,false,9).inCenter, 9);
    eq('日紫白阴遁上元癸酉一白', dayZiBai(8,false,9).inCenter, 1);
    eq('时紫白子日子时顺一白', hourZiBai('子',0,true).inCenter, 1);
    eq('时紫白子日子时逆九紫', hourZiBai('子',0,false).inCenter, 9);
    eq('时紫白寅日寅时顺九紫', hourZiBai('寅',2,true).inCenter, 9);
    eq('时紫白辰日辰时逆二黑', hourZiBai('辰',4,false).inCenter, 2);
    /* 八宅游年 */
    const bzk=baZhai('坎');
    t('坎生气巽', bzk.ji.find(x=>x.name==='生气').gua==='巽');
    t('坎延年离', bzk.ji.find(x=>x.name==='延年').gua==='离');
    t('坎天医震', bzk.ji.find(x=>x.name==='天医').gua==='震');
    t('坎绝命坤', bzk.xiong.find(x=>x.name==='绝命').gua==='坤');
    t('坎五鬼艮', bzk.xiong.find(x=>x.name==='五鬼').gua==='艮');
    t('兑生气乾', baZhai('兑').ji.find(x=>x.name==='生气').gua==='乾');
    t('离延年坎', baZhai('离').ji.find(x=>x.name==='延年').gua==='坎');
    t('乾绝命离', baZhai('乾').xiong.find(x=>x.name==='绝命').gua==='离');
    t('游年坎→巽生气', youXing('坎','巽')==='生气');
    t('游年坤→坤伏位', youXing('坤','坤')==='伏位');
    /* 流年煞 */
    const ns=nianSha(2026);
    eq('2026太岁午', ns.taiSui.zhi, '午');
    eq('2026岁破子', ns.suiPo.zhi, '子');
    eq('2026三煞亥子丑', ns.sanSha.map(s=>s.zhi), ['亥','子','丑']);
    eq('2026年五黄南', ns.wuHuang.dir, '南');
    /* 三元九运与玄空 */
    eq('2020八运', yunQi(2020).yun, 8);
    eq('2026九运', yunQi(2026).yun, 9);
    eq('换运八运', yunQi(2026,8).yun, 8);
    eq('换运八运区间', yunQi(2026,8).start, 2004);
    eq('换运一运区间', yunQi(2026,1).start, 1864);
    /* 玄空下卦顺逆依入中运星同元山阴阳（无常派章氏例，见 flyYang 定源） */
    const xk8=xuanKong('子','午',2020);
    eq('八运子山午向双星到向', xk8.geju, '双星到向');
    eq('八运子山山星4入中', xk8.sitIn, 4);
    eq('八运午山向星3入中', xk8.faceIn, 3);
    t('八运子山山盘顺飞（4临巽宫取巽阳）', xk8.sitShun===true);
    t('八运午向向盘逆飞（3临震宫取卯阴）', xk8.faceShun===false);
    const xkR=xuanKong('壬','丙',2020);
    eq('八运壬山丙向双星到山（会坐）', xkR.geju, '双星到山');
    t('八运壬山山盘逆飞（辰阴）', xkR.sitShun===false);
    t('八运丙向向盘顺飞（甲阳）', xkR.faceShun===true);
    const xk9=xuanKong('子','午',2024);
    eq('九运子山午向双星到山（会坐）', xk9.geju, '双星到山');
    t('九运子山5入中依子阴逆飞', xk9.sitShun===false);
    t('九运午向4入中依巽阳顺飞', xk9.faceShun===true);
    eq('八运乾山巽向旺山旺向', xuanKong('乾','巽',2020).geju, '旺山旺向');
    eq('七运卯山酉向旺山旺向', xuanKong('卯','酉',1990).geju, '旺山旺向');
    eq('七运卯山五黄入中', xuanKong('卯','酉',1990).sitIn, 5);
    t('七运卯山五入中依卯阴逆飞', xuanKong('卯','酉',1990).sitShun===false);
    const xkt=xuanKong('子','午',2020,6,186);
    t('兼向起替', xkt.tiGua===true);
    eq('子兼癸山星替6入中（巽替武曲）', xkt.sitIn, 6);
    eq('午兼丁向星替2入中（卯替巨门）', xkt.faceIn, 2);
    t('正向不起替', xuanKong('子','午',2020,0).tiGua===false);
    /* 坐度判定 */
    t('子山0度正向', panJue('子',0).zheng===true);
    t('子山4.5度仍正向', panJue('子',4.5).zheng===true);
    const pj5=panJue('子',5), pj355=panJue('子',355), pj75=panJue('子',7.5), pjN=panJue('壬',337.5);
    eq('子山偏5度兼癸', [pj5.jian,pj5.jianTo], [true,'癸']);
    eq('子山355度兼壬', [pj355.jian,pj355.jianTo], [true,'壬']);
    eq('子山7.5度骑缝阴阳差错', [pj75.kong,pj75.kongType], [true,'阴阳差错（卦内山界空亡）']);
    eq('壬山337.5度大空亡', [pjN.kong,pjN.kongType], [true,'大空亡（出卦空亡）']);
    /* 分金 */
    const fjz=fenJin('子');
    eq('子山五分金', fjz.map(f=>f.gz), ['甲子','丙子','戊子','庚子','壬子']);
    eq('子山分金起352.5度', fjz[0].start, 352.5);
    eq('子山正中戊子龟甲', fjz[2].wang, '龟甲');
    /* 穿山七十二龙 */
    eq('壬山三龙癸亥空甲子', chuanShan72('壬').map(d=>d.gz||'空'), ['癸亥','空','甲子']);
    eq('子山三龙丙戊庚子', chuanShan72('子').map(d=>d.gz), ['丙子','戊子','庚子']);
    eq('癸山三龙壬子空乙丑', chuanShan72('癸').map(d=>d.gz||'空'), ['壬子','空','乙丑']);
    eq('艮山三龙癸丑空甲寅', chuanShan72('艮').map(d=>d.gz||'空'), ['癸丑','空','甲寅']);
    eq('壬山首格起337.5度', chuanShan72('壬')[0].start, 337.5);
    let kongN=0; for(const s of SHAN_LIST) for(const d of chuanShan72(s)) if(d.kong) kongN++;
    eq('大空亡共12格', kongN, 12);
    /* 透地六十龙 */
    eq('壬山相交龙甲丙戊子（半）', touDi60('壬').map(d=>d.gz+(d.half?'半':'')), ['甲子','丙子','戊子半']);
    eq('子山相交龙戊子（半）庚壬子', touDi60('子').map(d=>d.gz+(d.half?'半':'')), ['戊子半','庚子','壬子']);
    eq('子山中线落庚子旺', touDi60('子')[1].wang, '旺');
    /* 龙吉凶（孤虚旺相以天干定：丙庚旺、丁辛相、甲壬孤、乙癸虚、戊己龟甲） */
    eq('旺龙大吉', longJx({wang:'旺',kong:false}).jx, '大吉');
    eq('相龙吉', longJx({wang:'相',kong:false}).jx, '吉');
    eq('孤龙凶', longJx({wang:'孤',kong:false}).jx, '凶');
    eq('龟甲大凶', longJx({wang:'龟甲',kong:false}).jx, '大凶');
    eq('空亡大凶', longJx({wang:'空',kong:true}).jx, '大凶');
    /* 孤虚旺相逐干锚点（《罗经透解》珠宝火坑例：丙庚旺、丁辛相、甲壬孤、乙癸虚） */
    eq('壬山癸亥虚', chuanShan72('壬')[0].wang, '虚');
    eq('壬山甲子孤', chuanShan72('壬')[2].wang, '孤');
    eq('子山戊子龟甲', chuanShan72('子')[1].wang, '龟甲');
    eq('子山庚子旺', chuanShan72('子')[2].wang, '旺');
    eq('寅山丙寅旺', chuanShan72('寅')[0].wang, '旺');
    eq('寅山戊寅龟甲', chuanShan72('寅')[1].wang, '龟甲');
    eq('子山丙子旺', fenJin('子').find(x=>x.gz==='丙子').wang, '旺');
    eq('子山壬子孤', fenJin('子').find(x=>x.gz==='壬子').wang, '孤');
    eq('酉山丁酉相', fenJin('酉').find(x=>x.gz==='丁酉').wang, '相');
    eq('酉山辛酉相', fenJin('酉').find(x=>x.gz==='辛酉').wang, '相');
    eq('酉山乙酉虚', fenJin('酉').find(x=>x.gz==='乙酉').wang, '虚');
    eq('酉山癸酉虚', fenJin('酉').find(x=>x.gz==='癸酉').wang, '虚');
    /* 太岁方位支→宫（与 SHAN_BAZI 同口径：巳辰属巽4、申未属坤2） */
    eq('巳太岁巽四宫', ZHI_GONG['巳'], 4);
    eq('申太岁坤二宫', ZHI_GONG['申'], 2);
    /* 五不遇时：阳克阳/阴克阴，逐日查表 */
    eq('甲日庚午五不遇', WU_BUYU['甲'], '庚午');
    eq('乙日辛巳五不遇', WU_BUYU['乙'], '辛巳');
    eq('甲日己巳非（阴不克阳）', WU_BUYU['甲']==='己巳', false);
    /* 催官贵向：酉山（说本兑卦）应命中 */
    eq('酉山催官少微', tianXingGui('酉').gui, true);
    eq('亥山催官天皇', tianXingGui('亥').star.indexOf('天皇')>=0, true);
    /* 三合水法 */
    const shz=sanHeWater('子');
    t('子山水局', shz.ju==='水局');
    eq('水局长生申帝旺子墓辰', [shz.gong[0].zhi,shz.gong[4].zhi,shz.gong[8].zhi], ['申','子','辰']);
    t('乙山水局', sanHeWater('乙').ju==='水局');
    t('辛山火局', sanHeWater('辛').ju==='火局');
    t('丁山木局', sanHeWater('丁').ju==='木局');
    t('庚山金局', sanHeWater('庚').ju==='金局');
    /* 纳音 */
    eq('甲子海中金', nayin('甲子').name, '海中金');
    eq('戊子霹雳火', nayin('戊子').name, '霹雳火');
    /* 阴宅专法：八煞黄泉桃花 */
    eq('坎山八煞辰', baSha('子').zhi, '辰');
    eq('震山八煞申', baSha('卯').zhi, '申');
    eq('乾山八煞午', baSha('乾').zhi, '午');
    eq('离山八煞亥', baSha('午').zhi, '亥');
    eq('庚向黄泉坤', huangQuan('庚').zhi, '坤');
    eq('丁向黄泉坤', huangQuan('丁').zhi, '坤');
    eq('癸向黄泉艮', huangQuan('癸').zhi, '艮');
    t('午向口诀未列黄泉', huangQuan('午').none===true);
    eq('水局桃花酉', taoHuaShui('子').zhi, '酉');
    eq('火局桃花卯', taoHuaShui('丙').zhi, '卯');
    /* 仙命配山 */
    t('子命坐午山正冲', zhiGuanXi('子','午').name==='正冲');
    t('子命坐申山三合', zhiGuanXi('子','申').name==='三合');
    t('子命坐丑山六合', zhiGuanXi('子','丑').name==='六合');
    t('子命坐卯山相刑', zhiGuanXi('子','卯').name==='相刑');
    t('子命坐未山相害', zhiGuanXi('子','未').name==='相害');
    t('子命坐子山比旺', zhiGuanXi('子','子').name==='比旺');
    t('寅巳相刑', zhiGuanXi('寅','巳').name==='相刑');
    t('申亥相害', zhiGuanXi('申','亥').name==='相害');
    /* 禄马贵人 */
    eq('甲禄在寅', luMaGui('甲子').lu, '寅');
    eq('乙禄在卯', luMaGui('乙丑').lu, '卯');
    eq('子年马在寅', luMaGui('甲子').ma, '寅');
    eq('甲干贵人丑未', luMaGui('甲子').guiren.join(''), '丑未');
    eq('辛干贵人午寅', luMaGui('辛卯').guiren.join(''), '午寅');
    /* 择日神煞 */
    eq('寅月重丧甲', ZHONG_SANG['寅'], '甲');
    eq('戌月重丧戊', ZHONG_SANG['戌'], '戊');
    eq('丑月重丧己', ZHONG_SANG['丑'], '己');
    t('寅月复日甲庚', FU_RI['寅'].join('')==='甲庚');
    t('子月复日丁癸', FU_RI['子'].join('')==='丁癸');
    eq('正月往亡寅', WANG_WANG[1], '寅');
    eq('七月往亡酉', WANG_WANG[7], '酉');
    t('正月十三杨公忌', YANG_GONG_JI[1].indexOf(13)>=0);
    t('七月廿九杨公忌', YANG_GONG_JI[7].indexOf(29)>=0);
    eq('甲年岁德甲', suiDe('甲').de, '甲');
    eq('甲年岁德合己', suiDe('甲').he, '己');
    eq('乙年岁德庚', suiDe('乙').de, '庚');
    eq('乙年岁德合乙', suiDe('乙').he, '乙');
    eq('寅月天德丁', tianDe('寅').v, '丁');
    t('卯月天德坤无日', tianDe('卯').gan===false);
    eq('寅月月德丙', yueDe('寅').de, '丙');
    eq('子月月德壬', yueDe('子').de, '壬');
    eq('戌月月德合辛', yueDe('戌').he, '辛');
    t('春戊寅天赦', tianShe('寅','戊寅').is===true);
    t('夏甲午天赦', tianShe('巳','甲午').is===true);
    t('春甲午非天赦', tianShe('寅','甲午').is===false);
    /* 补龙扶山相主（《协纪辨方书》卷三十三選擇宗鏡） */
    eq('水龙旺局申子辰', BU_LONG_JU['水'].wang, '申子辰');
    eq('水龙印局巳酉丑', BU_LONG_JU['水'].yin, '巳酉丑');
    eq('水龙财局寅午戌', BU_LONG_JU['水'].cai, '寅午戌');
    eq('土龙与水同宫旺局申子辰', BU_LONG_JU['土'].wang, '申子辰');
    eq('土龙印局寅午戌', BU_LONG_JU['土'].yin, '寅午戌');
    eq('木龙旺局亥卯未', BU_LONG_JU['木'].wang, '亥卯未');
    eq('火龙印局亥卯未', BU_LONG_JU['火'].yin, '亥卯未');
    eq('金龙印局辰戌丑未', BU_LONG_JU['金'].yin, '辰戌丑未');
    eq('龙五行艮土', LONG_WX['艮'], '土');
    eq('龙五行乾金', LONG_WX['乾'], '金');
    eq('子入首属阳龙（坎）', LONG_YANG_SHAN.indexOf('子')>=0, true);
    eq('午入首属阳龙（离）', LONG_YANG_SHAN.indexOf('午')>=0, true);
    eq('巳入首属阴龙', LONG_YANG_SHAN.indexOf('巳')<0, true);
    const blw=buLong('子',['申','子','辰','子'],['壬','癸','庚','辛']);
    eq('水龙申子辰旺课上吉', blw.zong, '上吉');
    t('水龙课四支全入旺局', blw.rows.every(r=>r.name==='旺局'));
    const bls=buLong('卯',['酉','卯','亥','未'],['乙','丁','辛','己']);
    /* 年支煞局归年家之忌不否决全课（《协纪·选择宗镜》：补龙以月日时为主，年家之忌能改年可解，故降为附注提示） */
    eq('木龙年支酉煞归年家不否决', bls.zong, '上吉');
    t('木龙年支酉煞附注', bls.mean.indexOf('年支酉犯煞局')>=0);
    t('木龙月日时两字煞局大凶', buLong('卯',['亥','酉','酉','卯']).zong==='大凶');
    eq('木龙酉支判煞局', buLong('卯',['酉','亥','卯','未']).rows[0].name, '煞局');
    eq('水龙午支判财局', buLong('子',['午','子','申','辰']).rows[0].name, '财局');
    eq('水龙亥支判临官', buLong('子',['亥','子','申','辰']).rows[0].name, '临官');
    /* 十神锚点 */
    eq('乙见庚合官', ganShiShen('乙','庚').name, '合官');
    eq('甲见己合财', ganShiShen('甲','己').name, '合财');
    eq('己见己比肩', ganShiShen('己','己').name, '比肩');
    eq('甲见癸印绶', ganShiShen('甲','癸').name, '印绶');
    eq('乙见辛七煞', ganShiShen('乙','辛').name, '七煞');
    eq('己见戊劫财', ganShiShen('己','戊').name, '劫财');
    eq('甲见戊财星', ganShiShen('甲','戊').name, '财星');
    eq('甲见丙食伤', ganShiShen('甲','丙').name, '食伤');
    /* 相主课例（协纪论相主原文课例） */
    eq('乙亥命四庚合官大吉', xiangZhu('乙亥',['庚','庚','庚','庚'],['寅','辰','寅','辰']).zong, '大吉');
    eq('壬午命四丁未合财大吉', xiangZhu('壬午',['丁','丁','丁','丁'],['未','未','未','未']).zong, '大吉');
    eq('甲子命庚午天克地冲大凶', xiangZhu('甲子',['庚','甲','甲','甲'],['午','子','子','子']).zong, '大凶');
    t('乙卯命七煞凶', xiangZhu('乙卯',['辛','辛','己','己'],['丑','卯','亥','未']).zong==='凶');
    t('己巳命三戊劫财凶', xiangZhu('己巳',['戊','戊','戊','己'],['巳','巳','巳','巳']).zong==='凶');
    /* 七煞食神制化（《协纪》：七煞一字得食神制之可用，二字必凶；煞独占年干归年家之忌，换年可解不否决本课） */
    eq('庚命1煞得食神壬制平用', xiangZhu('庚辰',['丙','壬','庚','庚'],['午','子','申','辰']).zong, '平');
    eq('庚命1煞独年干权用平', xiangZhu('庚辰',['丙','庚','庚','庚'],['午','子','申','辰']).zong, '平');
    eq('庚命月干1煞无制凶', xiangZhu('庚辰',['庚','丙','庚','庚'],['午','子','申','辰']).zong, '凶');
    eq('庚命2煞必凶', xiangZhu('庚辰',['丙','丙','庚','庚'],['午','子','申','辰']).zong, '凶');
    eq('乙命1煞得食神丁制平用', xiangZhu('乙亥',['辛','丁','乙','乙'],['未','丑','亥','卯']).zong, '平');
    eq('甲命1煞得食神丙制平用', xiangZhu('甲子',['庚','丙','甲','甲'],['申','寅','子','子']).zong, '平');
    /* 扶山锚点 */
    eq('子山四柱午冲山大凶', fuShan('子',['甲','丙','戊','庚'],['午','子','申','辰']).zong, '大凶');
    eq('子山申子辰亥扶起吉', fuShan('子',['壬','癸','庚','辛'],['申','子','辰','亥']).zong, '吉');
    eq('子山庚辛印绶生山', fuShan('子',['庚','辛','甲','乙'],['申','辰','子','亥']).keN, 0);
    t('午山壬癸二干克山检出', fuShan('午',['壬','癸','庚','辛'],['寅','戌','午','巳']).keN===2);
    /* 课格识别（《协纪》補龍古課格名） */
    eq('子龙申子辰子三合旺局', keGe('子','子',['壬','癸','庚','辛'],['申','子','辰','子']).map(g=>g.name), ['三合旺局']);
    eq('亥龙申子亥子三合兼临官', keGe('亥','壬',['庚','庚','丙','丙'],['申','子','亥','子']).map(g=>g.name), ['三合兼临官局']);
    t('壬龙四癸亥得临官聚禄格', keGe('壬','子',['癸','癸','癸','癸'],['亥','亥','亥','亥']).some(g=>g.name==='临官格（聚禄）'));
    t('壬龙四癸亥得干支一气', keGe('壬','子',['癸','癸','癸','癸'],['亥','亥','亥','亥']).some(g=>g.name==='干支一气格'));
    t('壬龙四癸亥得堆禄格', keGe('壬','子',['癸','癸','癸','癸'],['亥','亥','亥','亥']).some(g=>g.name.indexOf('堆禄格')>=0));
    eq('寅山多甲堆禄格', keGe('寅','寅',['甲','甲','丙','丙'],['寅','亥','戌','午']).map(g=>g.name), ['堆禄格（甲禄到寅山）']);
    eq('卯龙卯卯寅亥三合兼临官', keGe('卯','卯',['乙','己','庚','己'],['卯','卯','寅','亥']).map(g=>g.name), ['三合兼临官局']);
    /* 官旺局（《协纪》单用临官帝旺二字之例：木龙 临官寅、帝旺卯） */
    t('卯龙寅卯寅卯得官旺局', keGe('卯','卯',['甲','乙','丙','丁'],['寅','卯','卯','寅']).some(g=>g.name==='官旺局（临官帝旺二字）'));
    t('子龙亥子子亥得官旺局', keGe('子','子',['壬','癸','甲','乙'],['亥','子','子','亥']).some(g=>g.name==='官旺局（临官帝旺二字）'));
    t('三合全字不判官旺局', !keGe('卯','卯',['甲','乙','丙','丁'],['寅','卯','未','卯']).some(g=>g.name==='官旺局（临官帝旺二字）'));
    t('普通课无格', keGe('子','子',['丙','戊','辛','己'],['午','戌','子','辰']).length===0);
    /* 三合大利坐向（《地理五诀》四大局生旺墓三向） */
    eq('向首丙火局旺向', daJuXiang('丙').type, '旺向');
    eq('向首壬水局旺向', daJuXiang('壬').type, '旺向');
    eq('向首艮火局生向', daJuXiang('艮').type, '生向');
    eq('向首丁木局墓向', daJuXiang('丁').type, '墓向');
    eq('向首庚金局旺向', daJuXiang('庚').type, '旺向');
    eq('向首癸金局墓向', daJuXiang('癸').type, '墓向');
    t('火局三向生艮旺丙墓辛', JSON.stringify(daJuXiang('丙').san.map(x=>x.shan))===JSON.stringify(['艮','丙','辛']));
    t('水局三向生坤旺壬墓乙', JSON.stringify(daJuXiang('壬').san.map(x=>x.shan))===JSON.stringify(['坤','壬','乙']));
    /* 玄空大利坐向扫描 */
    t('玄空扫描2020乾巽旺山旺向', xkDaLiXiang(2020).some(x=>x.face==='巽'&&x.sit==='乾'&&x.gj==='旺山旺向'));
    t('玄空扫描2020子午双星到向', xkDaLiXiang(2020).some(x=>x.face==='午'&&x.sit==='子'&&x.gj==='双星到向'));
    t('玄空扫描降级伏吟反吟', xkDaLiXiang(1990).every(x=>x.grade.indexOf('慎用')<0||x.gj.indexOf('吟')>=0));
    /* 零正神（《天玉经》零正法，合十通行简法） */
    eq('一运正神坎', lingZheng(1).zhengPalace, 1);
    eq('一运零神离', lingZheng(1).lingPalace, 9);
    eq('八运正神艮', lingZheng(8).zhengPalace, 8);
    eq('八运零神坤', lingZheng(8).lingPalace, 2);
    eq('九运正神离', lingZheng(9).zhengPalace, 9);
    eq('九运零神坎', lingZheng(9).lingPalace, 1);
    /* 消亡水（先后天卦位水口） */
    eq('酉来子去犯消水（坎）', xiaoWangShui('酉','子').xiao, '坎');
    eq('子来酉去犯亡水（坎）', xiaoWangShui('子','酉').wang, '坎');
    eq('酉来子去不犯亡水', xiaoWangShui('酉','子').wang, null);
    eq('午来乾去犯消水（乾）', xiaoWangShui('午','乾').xiao, '乾');
    eq('乾来午去犯亡水（乾）', xiaoWangShui('乾','午').wang, '乾');
    t('子来卯去不犯消亡', xiaoWangShui('子','卯').xiao===null&&xiaoWangShui('子','卯').wang===null);
    t('同宫不论消亡', xiaoWangShui('酉','酉').mean.indexOf('同宫')>=0);
    /* 组合断语典籍出处（仅可核原文条目） */
    t('一四组合出处四一同宫', COMBO_SRC['14'].indexOf('四一同宫')>=0);
    t('七九组合出处回禄', COMBO_SRC['79'].indexOf('回禄')>=0);
    t('一九组合无出处标注', comboJx(1,9).src===null);
    /* 洪范五行与山运（《選擇紀要·洪範五行遁山運》，与《协纪》同源体系） */
    eq('洪范巽山属水', HONGFAN_WX['巽'], '水');
    eq('洪范庚山属土', HONGFAN_WX['庚'], '土');
    eq('洪范巳山属木', HONGFAN_WX['巳'], '木');
    eq('洪范丁山属金', HONGFAN_WX['丁'], '金');
    eq('洪范壬山属火', HONGFAN_WX['壬'], '火');
    eq('洪范亥山属金', HONGFAN_WX['亥'], '金');
    /* 山运遁例（《選擇紀要》原文）：巽山（水）丙午年遁至辰得壬辰长流水=山运水；
       丁山（金）丙辛年遁至丑得己丑霹雳火=山运火，冬至后变辛丑壁上土 */
    eq('巽山丙午年山运水', shanYun('巽', '丙午').yunWx, '水');
    eq('巽山丙午年遁得壬辰', shanYun('巽', '丙午').yunGZ, '壬辰');
    eq('丁山丙午年山运火', shanYun('丁', '丙午').yunWx, '火');
    eq('丁山丙午年冬至前己丑', shanYun('丁', '丙午', false).yunGZ, '己丑');
    eq('丁山丙午年冬至后辛丑', shanYun('丁', '丙午', true).yunGZ, '辛丑');
    eq('子山丙午年山运水', shanYun('子', '丙午').yunWx, '水');
    /* 年克山家（《選擇紀要》定式） */
    eq('甲子年巽山犯年克', nianKeShan('巽','甲子').zong, '凶');
    eq('甲子年巽山得丙寅月制平用', nianKeShan('巽','甲子','丙寅','甲子').zong, '平');
    eq('丙午年巽山不犯年克', nianKeShan('巽','丙午').zong, '吉');
    eq('甲子年巽山运戊辰木', nianKeShan('巽','甲子').yunGZ, '戊辰');
    /* 月家煞到山（择月层） */
    t('亥月破巳到山', yueShaShan('巳','亥','午').hits.some(h=>h.name==='月破到山'));
    t('午月三煞在亥子丑', yueShaShan('子','午','午').hits.some(h=>h.name==='月三煞到山'));
    t('子月刑卯到山', yueShaShan('卯','子','午').hits.some(h=>h.name==='月刑到山'));
    t('午月害丑到山', yueShaShan('丑','午','午').hits.some(h=>h.name==='月害到山'));
    t('午年酉月丙山犯月五黄', yueShaShan('丙','酉','午').hits.some(h=>h.name==='月五黄到山'));
    t('亥月无煞之山吉', yueShaShan('子','亥','午').zong==='慎'||yueShaShan('子','亥','午').zong==='吉');
    /* 时家神煞（葬课定时辰） */
    eq('甲日庚午时五不遇', shiJiaSha('甲子',6).hits.some(h=>h.name==='五不遇时'), true);
    eq('乙日辛巳时五不遇', shiJiaSha('乙丑',5).hits.some(h=>h.name==='五不遇时'), true);
    t('甲日己巳时非五不遇', !shiJiaSha('甲子',5).hits.some(h=>h.name==='五不遇时'));
    eq('子日午时时破', shiJiaSha('甲子',6).hits.some(h=>h.name==='时破'), true);
    t('甲戌日申时旬空', shiJiaSha('甲戌',8).hits.some(h=>h.name==='旬空时'));
    eq('甲日丙寅时日禄', shiJiaSha('甲子',2).ji.some(x=>x.name==='日禄时'), true);
    eq('甲日丑时贵人登时', shiJiaSha('甲子',1).ji.some(x=>x.name==='贵人登时'), true);
    eq('辛日午时贵人登时', shiJiaSha('辛未',6).ji.some(x=>x.name==='贵人登时'), true);
    t('五不遇时不可用', shiJiaSha('甲子',6).usable===false);
    t('吉时可用', shiJiaSha('甲子',2).usable===true);
    /* 实测坐度定位分金 */
    const flz=fenJinLocate('子',0);
    eq('子山0度正中戊子', [flz.fen.gz,flz.pct], ['戊子',50]);
    eq('子山1.5度庚子线首', fenJinLocate('子',1.5).fen.gz, '庚子');
    eq('子山4度庚子', fenJinLocate('子',4).fen.gz, '庚子');
    eq('子山6.8度壬子', fenJinLocate('子',6.8).fen.gz, '壬子');
    eq('子山355度甲子', fenJinLocate('子',355).fen.gz, '甲子');
    t('戊子线龟甲不可用', fenJinLocate('子',0).fen.wang==='龟甲');
    /* 玄空高级格局（见 gaoGeJu 等定源） */
    const gg8=gaoGeJu(xk8);
    t('八运子山午向不犯全局三般卦', gg8.sanBan===false);
    eq('八运子山午向城门正城门巽', gg8.chengMen.zheng.palace, 4);
    t('八运子山午向入囚应期', gg8.ruQiu.shan.yun===4&&gg8.ruQiu.face.yun===3);
    const ggG=gaoGeJu(xuanKong('艮','坤',2020));
    t('八运艮山坤向全局父母三般卦', ggG.sanBan===true);
    const ggD=gaoGeJu(xuanKong('乾','巽',2020));
    eq('八运乾山巽向正城门离宫', ggD.chengMen.zheng.palace, 9);
    /* 岁运叠断 */
    const sd26=suiNianDie(xuanKong('子','午',2024), 2026);
    eq('2026流年一白入中', sd26.inCenter, 1);
    eq('2026流年五黄落离', sd26.wuHuangPalace, 9);
    eq('2026九运子午向首宫流年五黄', sd26.door.nian, 5);
    t('2026五黄到门出警告', sd26.warnings.some(w=>w.indexOf('五黄到向首')>=0));
    /* 门位与向首分开判：门在向首时合一（gate 为空），门在别宫时另出到门一条 */
    t('门设向首时无独立门宫', sd26.gate===null);
    const sdG=suiNianDie(xuanKong('子','午',2024), 2026, '坤');
    eq('门在坤西南取该宫流年星', sdG.gate.palace, 2);
    eq('门在坤西南流年七赤', sdG.gate.nian, 7);
    t('门离向首另出到门警告', sdG.warnings.some(w=>w.indexOf('七赤破军到大门（门在坤西南）')>=0));
    t('门离向首仍报向首五黄', sdG.warnings.some(w=>w.indexOf('五黄到向首之宫')>=0));
    /* 流年凶星名按宫数直取，不得错位（二黑三碧四绿七赤各归其数） */
    t('2024门在巽报二黑病符', suiNianDie(xuanKong('子','午',2024),2024,'巽').warnings.some(w=>w.indexOf('流年二黑病符到大门（门在巽东南）')>=0));
    t('2032门在巽报三碧是非', suiNianDie(xuanKong('子','午',2024),2032,'巽').warnings.some(w=>w.indexOf('流年三碧是非到大门（门在巽东南）')>=0));
    /* 穿宫九星 */
    const cg1=chuanGong('坎','离','离',3);
    eq('坎宅离门三栋', cg1.stars.map(s=>s.star), ['延年','六煞','生气']);
    const cg2=chuanGong('坎','巽','离',5);
    eq('坎宅巽门五栋', cg2.stars.map(s=>s.star), ['天医','延年','六煞','生气','五鬼']);
    t('三吉栋宜高', cg2.stars[0].gao==='宜高'&&cg2.stars[3].gao==='宜高');
    t('凶栋宜低', cg2.stars[2].gao==='宜低'&&cg2.stars[4].gao==='宜低');
    const cg6=chuanGong('坎','巽','离',6);
    eq('坎宅巽门六栋变宅五鬼生天医', cg6.stars.map(s=>s.star), ['天医','延年','六煞','生气','五鬼','天医']);
    const cg9=chuanGong('坎','巽','离',9);
    eq('坎宅巽门九栋化宅', cg9.stars.map(s=>s.star), ['天医','祸害','绝命','延年','六煞','生气','伏位','五鬼','伏位']);
    /* 统一断语阶梯与模块评分（阶梯制锚点，见各 score 函数定源） */
    eq('评分玄空乾巽八运93（旺山旺向+可用城门）', scoreGeju(xuanKong('乾','巽',2020)).got, 93);
    eq('评分玄空子午八运90（双星到向吉+真打劫吉）', scoreGeju(xuanKong('子','午',2020)).got, 90);
    eq('评分玄空艮坤八运68（上山下水凶+三般卦吉+城门小吉）', scoreGeju(xuanKong('艮','坤',2020)).got, 68);
    t('评分玄空压线否决', scoreGeju(xuanKong('子','午',2020,7.5)).veto===true);
    eq('评分立极未填度60平', scoreLixiang('子').got, 60);
    eq('评分立极子山兼向76', scoreLixiang('子',5).got, 76);
    t('评分立极骑缝否决', scoreLixiang('子',7.5).veto===true);
    eq('评分分金子3度旺90', scoreFenjin('子',3).got, 90);
    eq('评分分金子3度合庚午命100', scoreFenjin('子',3,1990).got, 100);
    t('评分分金龟甲否决', scoreFenjin('子',0).veto===true);
    t('评分分金未填坐度不评', scoreFenjin('子')===null);
    eq('评分三要坎命延年天医伏位93', scoreSanyao('坎','离','震','坎').got, 93);
    eq('评分三要坎命门绝命63（门为先降分）', scoreSanyao('坎','坤','震','坎').got, 63);
    eq('评分穿宫五栋75（三吉3进）', scoreChuangong(chuanGong('坎','巽','离',5)).got, 75);
    t('评分年评九运子山午向2026≤55慎用以下', scoreSuiyun(xuanKong('子','午',2024),2026,'子').got<55);
    eq('评分形煞近犯2项70', scoreXingsha(2,0).got, 70);
    eq('评分形煞近犯3项30（交加）', scoreXingsha(3,0).got, 30);
    eq('评分形煞近1远1=78', scoreXingsha(1,1).got, 78);
    eq('评分形煞远犯3项54（交加）', scoreXingsha(0,3).got, 54);
    t('评分形煞负数不评', scoreXingsha(-1,0)===null);
    eq('评分金锁子砂午水100', scoreJsy({子:'砂',午:'水'}).got, 100);
    eq('评分金锁子水午砂0', scoreJsy({子:'水',午:'砂'}).got, 0);
    t('评分金锁未选山不评', scoreJsy({})===null);
    /* 宅评汇总（体用分离之体，权重站内归纳见 srZhaiPing 定源） */
    const zp1=srZhaiPing({geju:{got:85}, sanyao:{got:97}, lixiang:{got:60}});
    eq('宅评三模块归一权重86', zp1.got, 86);
    t('宅评含否决归零', srZhaiPing({geju:{got:85}, lixiang:{got:0, veto:true}}).got===0);
    t('宅评全空不评', srZhaiPing({})===null);
    /* 峦头三因子（百尺为形分带，见 luantou 定源） */
    eq('峦头路冲正对20米85', luantou([{type:'路冲枪煞', dist:20, angle:0}]).got, 85);
    eq('峦头路冲60米势带92', luantou([{type:'路冲枪煞', dist:60, angle:0}]).got, 92);
    eq('峦头斜射30度减半92', luantou([{type:'路冲枪煞', dist:20, angle:30}]).got, 92);
    eq('峦头逾45度不论100', luantou([{type:'路冲枪煞', dist:20, angle:60}]).got, 100);
    eq('峦头双凶交加70', luantou([{type:'路冲枪煞', dist:20, angle:0},{type:'天斩煞', dist:20, angle:0}]).got, 70);
    eq('峦头吉形封顶100', luantou([{type:'玉带环抱', dist:15, angle:0}]).got, 100);
    t('峦头逼压低于宅不论', luantou([{type:'逼压白虎抬头', dist:20, angle:0, height:'低'}]).got===100);
    t('峦头空输入不评', luantou([])===null);
    /* 阳宅六事（八宅六事法，见 liuShi 定源） */
    const ls1=liuShi('坎',{door:'巽', wc:'艮', stove:'坤', stoveDir:'震', bed:'离'});
    eq('六事坎命全合100', ls1.got, 100);
    t('六事门巽生气吉', ls1.rows.find(r=>r.key==='door').jx==='吉');
    t('六事厕艮压五鬼吉', ls1.rows.find(r=>r.key==='wc').jx==='吉');
    t('六事灶坤压绝命吉', ls1.rows.find(r=>r.key==='stove').jx==='吉');
    const ls2=liuShi('坎',{door:'坤'});
    t('六事门坤绝命凶', ls2.rows[0].jx==='凶');
    eq('六事门凶85', ls2.got, 85);
    t('六事空输入不评', liuShi('坎',{})===null);
    /* 宅形图诀（《阳宅十书》系选目，见 ZHAI_XING_RULES 定源） */
    eq('宅形四平方正吉', zhaiXing('fangzheng').jx, '吉');
    eq('宅形前狭后宽吉', zhaiXing('qianzhai').jx, '吉');
    eq('宅形前宽后狭凶', zhaiXing('qiankuan').jx, '凶');
    eq('宅形三角凶', zhaiXing('sanjiao').jx, '凶');
    eq('宅形前高后低凶', zhaiXing('qiangao').jx, '凶');
    eq('宅形后高前低吉', zhaiXing('houGao').jx, '吉');
    t('宅形缺角标注站内归纳', zhaiXing('queGen').src.indexOf('站内归纳')>=0);
    t('宅形未知不评', zhaiXing('xxx')===null);
    /* 玄空六法（谈氏零正与太岁，见 liuFa 定源） */
    eq('六法一运正神一二三四', liuFa(1).zhengPalaces.join(''), '1234');
    eq('六法一运零神六七八九', liuFa(1).lingPalaces.join(''), '6789');
    eq('六法九运正神六七八九', liuFa(9).zhengPalaces.join(''), '6789');
    eq('六法五运前十年承四运', liuFa(5,'before').eff, 4);
    eq('六法五运后十年启六运', liuFa(5,'after').eff, 6);
    eq('六法2026太岁午在离九宫', taiSuiFang(2026).palace, 9);
    eq('六法2026太岁方南', taiSuiFang(2026).dir, '南');
    /* 理法综合裁决（跨派主从，见 zhenJue 定源） */
    eq('裁决玄空吉三合吉立向吉', zhenJue([
      {yu:'lixiang', fa:'玄空', jx:'吉', mean:'旺山旺向'},
      {yu:'lixiang', fa:'三合', jx:'吉', mean:'水局旺向'}
    ]).domains[0].jx, '吉');
    const zj2=zhenJue([
      {yu:'lixiang', fa:'玄空', jx:'吉', mean:'旺山旺向'},
      {yu:'lixiang', fa:'三合', jx:'凶', mean:'犯八煞'}
    ]).domains[0];
    eq('裁决主吉参凶取吉附条件', zj2.jx, '吉');
    t('裁决主吉参凶标注冲突', zj2.conflict===true);
    eq('裁决主凶参吉从凶', zhenJue([
      {yu:'men', fa:'玄空', jx:'凶', mean:'向首上山下水'},
      {yu:'men', fa:'八宅', jx:'吉', mean:'门开生气'}
    ], {men:'玄空'}).domains[1].jx, '凶');
    eq('裁决参法一致凶从凶', zhenJue([
      {yu:'lixiang', fa:'玄空', jx:'吉', mean:'旺山旺向'},
      {yu:'lixiang', fa:'三合', jx:'凶', mean:'消亡水'},
      {yu:'lixiang', fa:'形法', jx:'凶', mean:'路冲'}
    ]).domains[0].jx, '凶');
    t('裁决缺域不强评', zhenJue([{yu:'men', fa:'八宅', jx:'吉', mean:'生气'}]).domains[0].jx==='缺参');
    const zjP=zhenJue([
      {yu:'lixiang', fa:'玄空', jx:'凶', mean:'上山下水'},
      {yu:'lixiang', fa:'三合', jx:'吉', mean:'生向'}
    ], {lixiang:'三合'}).domains[0];
    t('裁决换主法（三合主）主吉单参异断附条件', zjP.jx==='吉'&&zjP.conflict===true);
    /* 参断只列参法，主法理由不在断要里重写一遍（同一条理由两处各写一遍即重复） */
    const zjD=zhenJue([
      {yu:'lixiang', fa:'玄空', jx:'吉', mean:'旺山旺向'},
      {yu:'lixiang', fa:'三合', jx:'吉', mean:'水局旺向'}
    ]).domains[0];
    eq('参断只列参法', zjD.entries.map(v=>v.fa), ['三合']);
    t('断要不含参法理由', zjD.mean.indexOf('水局旺向')<0&&zjD.mean.indexOf('旺山旺向')>=0);
    return rs;
  }
  /* ===================== 风水两页圆盘的骨架与取角（共用一处） ===================== */
  /* 【定源】骨架照规则档第七节：外圈 182、内界圈 120、盘心 78、外签 206、内签 148、
     弧 192、热区外沿 198、刻度 168 至 176、指针 82 至 116。五层及以下一律走这套，不得自定一套；
     阳宅紫白盘曾把内界圈压到 74、盘心缩到 64、显示宽放大到 480，与别页并排完全不是同一套东西。
     综合罗盘（五层罗经）只把内界圈收到 108、内签由 148 拆成 148 与 120 两圈，其余逐值不动。
     两页各写一份曾是分歧之源（同名常量在不同页取不同值时，肉眼并排也看不出），故收在此一处。 */
  const GEO440={C:220,OUT:182,IN:120,CORE:78,LAB_OUT:206,LAB_IN:148,ARC:192,HIT1:198,TICK0:168,TICK1:176,P0:82,P1:116};
  const GEOFC={OUT:182,IN:108,CORE:78,ARC:192,TICK0:168,TICK1:176,LAB_SHAN:206,LAB_ZW:148,LAB_GUA:120,HIT0:110,HIT1:198,P0:82,P1:104};
  /* 取角两式：支 j 之心落周天 j*30 度、山 i 之心落周天 i*15 度，皆加 180 使午在上子在下，
     与页内九宫表（戴九履一、左三右七）同向，免两种方位读法打架。
     二十四山与十二支同以地盘正针为基准；三盘三针的中针、缝针只在画时各加或减七点五度，
     不在本式内预置偏角（偏角是层与层之间的相对错位，搬进本式就等于把整层又旋转一次）。 */
  function fwZhiDeg(j){ return (((j*30+180)%360)+360)%360; }
  function fwShanDeg(i){ return (((i*15+180)%360)+360)%360; }
  /* 盘内字色只取吉凶二值：盘上除主体色与其深浅档外不许出现第三支色相，九星本色一律不上盘 */
  function fwJxFill(jx){ return jx.indexOf('凶')>=0?'var(--wheel-bad)':(jx.indexOf('吉')>=0?'var(--wheel-good)':''); }
  /* 旺衰档着色：当令与生气为吉、死煞为凶、退气不着墨色以外的第三支色相 */
  function fwWangFill(w){ return (w==='旺'||w==='生')?'var(--wheel-good)':((w==='死'||w==='煞')?'var(--wheel-bad)':'var(--wheel-ink2)'); }
  global.FENGSHUI={NINE_ORDER,NINE_DIR,NINE_BAGUA,STAR_MEAN,STAR_JX,GAN,ZHI,gzIndex,gzAtIndex,yearGZ,yearGZIndex,mod9,
    GEO440,GEOFC,fwZhiDeg,fwShanDeg,fwJxFill,fwWangFill,
    yearZiBai,yearZiBaiByIndex,monthZiBai,dayZiBai,hourZiBai,buildBoard,fiveYellow,BAZHAI,GUA_DIR,baZhai,youXing,nianSha,SHAN_LIST,SHAN_BAGUA,SHAN_ZHI,SHAN_WX,shanInfo,panJue,ZHEN_LIST,zhenShan,
    YUN_NAMES,yunQi,buildBoardRev,shanYang,xuanKong,SHAN_BAZI,TI_GUA,starWangShuai,gongDingCai,
    PALACE_SHANS,yuanOf,sameYuanShan,flyYang,tiXing,SAN_BAN_GROUPS,gaoGeJu,suiNianDie,chuanGong,srGrade,scoreGeju,scoreLixiang,scoreFenjin,scoreSanyao,scoreChuangong,scoreSuiyun,scoreXingsha,scoreJsy,
    COMBO_MEAN,COMBO_SRC,comboJx,SHENG_LONG_ORDER,SANHE_JU,SHAN_SANHE,sanHeWater,SH_USE,SH_QUJIAO,XIU_28,SHAN_XIU,fenJin,
    NAYIN_WX,NAYIN_NAMES,nayin,WX_SHENG,WX_KE,zhuMingJx,fenJinZong,chuanShan72,touDi60,longJx,wangXiang,selfTest,
    GUA_BASHA,baSha,HUANGQUAN,huangQuan,CUI_GUI,xiuDuWuxing,tianXingGui,tianXingSha,XIU_DU_SHU,SANHE_TAOHUA,taoHuaShui,LIUHE_ZHI,SANHE_ZHI,XIANG_XING,XIANG_HAI,zhiGuanXi,
    SHAN_SHUANGZHI,GAN_LU,ZHI_MA,GAN_GUIREN,luMaGui,ZHONG_SANG,FU_RI,WANG_WANG,YANG_GONG_JI,GAN_HE,suiDe,TIAN_DE,tianDe,YUE_DE,yueDe,tianShe,
    LONG_WX,LONG_YANG,BU_LONG_JU,zhiJuScore,buLong,ganShiShen,xiangZhu,fuShan,keGe,daJuXiang,xkDaLiXiang,DAJU_XIANG,HONGFAN_WX,HONGFAN_MU,shanYun,nianKeShan,yueShaShan,YUE_XING,YUE_HAI,shiJiaSha,WU_BUYU,fenJinLocate,CHONG,GAN_WUHE,GAN_WX5,
    lingZheng,XIAN_TIAN_GONG,xiaoWangShui,
    JIE_TI,jieTiSum,srFromLadder,srVeto,srZhaiPing,luantou,LUANTOU_DEF,liuShi,LIUSHI_DEF,zhaiXing,ZHAI_XING_RULES,
    liuFa,taiSuiFang,ZHI_GONG,zhenJue,ZHEN_YU,ZHEN_MAIN,STAR_NAMES_CN};
})(typeof window!=='undefined'?window:this);
