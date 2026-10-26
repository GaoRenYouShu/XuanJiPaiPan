/* ============================================================================
 * 奇门遁甲 全功能排盘引擎 (qimen-engine.js)
 * ----------------------------------------------------------------------------
 * 设计目标：时家转盘、飞盘皆为规范排法；年、月、日家各有专属局数表（非时家同源重排），刻家采用时家节气局数配刻柱驱动（近似）。
 * 暴露 window.Qimen.calculate(date, opts) ，返回 qimen.html / qimen-extra.js 所需的完整盘对象。
 *
 * 核心算法（转盘、寄宫法）：
 *   1. 定局：节气 → 三元(上、中、下) → 局数；阳遁(冬至~芒种) / 阴遁(夏至~大雪)。
 *      支持 拆补法(默认) / 茅山法(交节日即上元) / 传统置闰法(依《遁甲演义》超神接气置闰诀)。
 *   2. 地盘三奇六仪：戊从局数宫起，阳顺阴逆，含中五。
 *   3. 旬首六仪：由驱动干支(时家取时柱)求旬首 → 甲子戊…甲寅癸。
 *   4. 值符宫 = 旬首六仪在地盘之宫(中五寄坤二)；值符星、值使门 = 该宫原位星、门。
 *   5. 天盘(天盘干)：值符(旬首六仪)转到“时干落宫”，三奇六仪整体沿后天八卦顺时针外圈旋转；
 *      中五仪无宫位，落到天禽寄宫(坤二、艮八)。
 *   6. 九星：值符星转到时干落宫，沿后天八卦顺时针外圈布八宫(恒顺时针，不论阴阳遁)；
 *      中宫为天禽，随中五仪寄宫(坤二、艮八)。
 *   7. 八门：值使门“加时”：从值符宫起，走时辰旬内序数步(阳顺阴逆)，中五寄坤；八门整体沿
 *      后天八卦顺时针外圈转盘(恒顺时针，不论阴阳遁)。
 *   8. 八神：值符在时干落宫(=天盘值符宫)，沿后天八卦顺时针外圈布八宫，阳顺阴逆。
 *   转盘外圈序(先天洛书宫位按后天八卦环序)=坎1→艮8→震3→巽4→离9→坤2→兑7→乾6，见常量 OUTER。
 *   9. 暗干(隐干)：从值使门落宫起戊，阳顺阴逆布三奇六仪。
 *  10. 空亡(旬空两宫) / 驿马(支→宫) / 门迫门制、星旺相休囚废。
 *  11. 格局：伏吟、反吟、六仪击刑、三奇六仪入墓、五不遇时、庚四柱格(岁、月、日、时、飞干)、三奇得使、玉女守门、青龙回首、飞鸟跌穴、三奇升殿、九遁、十干克应。
 *  12. 用神取用 + 综合断语。
 *
 * 说明：本引擎为程序化简化推演，定局以拆补法为主，结果仅供参考，请勿迷信。
 * ==========================================================================*/
(function(global){
  const Lunar = global.Lunar, Solar = global.Solar;
  if(!Lunar || !Solar){ console.error('[qimen-engine] lunar.js 未加载'); return; }

  /* ---------------- 基础常量 ---------------- */
  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const ZHI_CHONG = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
  // 三奇六仪（戊起顺布）：戊己庚辛壬癸丁丙乙
  const SQ = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];
  // 九宫信息
  const GONG = {
    1:{name:'坎',dir:'正北',wx:'水'}, 2:{name:'坤',dir:'西南',wx:'土'}, 3:{name:'震',dir:'正东',wx:'木'},
    4:{name:'巽',dir:'东南',wx:'木'}, 5:{name:'中',dir:'中宫',wx:'土'}, 6:{name:'乾',dir:'西北',wx:'金'},
    7:{name:'兑',dir:'正西',wx:'金'}, 8:{name:'艮',dir:'东北',wx:'土'}, 9:{name:'离',dir:'正南',wx:'火'}
  };
  const GONG_NAME = {1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兑',8:'艮',9:'离'};
  const GONG_DIR  = {1:'正北',2:'西南',3:'正东',4:'东南',5:'中宫',6:'西北',7:'正西',8:'东北',9:'正南'};
  // 原位九星（洛书）：坎蓬 坤芮 震冲 巽辅 中禽 乾心 兑柱 艮任 离英
  const BASIC_XING = {1:'天蓬',8:'天任',3:'天冲',4:'天辅',9:'天英',2:'天芮',7:'天柱',6:'天心',5:'天禽'};
  // 原位八门（洛书）：坎休 艮生 震伤 巽杜 离景 坤死 兑惊 乾开；中五无门
  const BASIC_MEN = {1:'休门',8:'生门',3:'伤门',4:'杜门',9:'景门',2:'死门',7:'惊门',6:'开门',5:''};
  const SHEN = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'];
  const SHEN_GOUCHEN = ['值符','螣蛇','太阴','六合','勾陈','朱雀','九地','九天'];
  // 洛书转盘序（不含中五，八卦位序）
  const LUO = ['1','8','3','4','9','2','7','6'];
  // 后天八卦顺时针序（转盘外圈）：坎1→艮8→震3→巽4→离9→坤2→兑7→乾6，沿九宫外圈依次相邻。
  // 依据：传统转盘奇门“顺时针排布法（顺序 183459276）”，见百度百科，数字奇门遁甲；
  //       刘文元《奇门遁甲》、孟令伟、奇门派等皆同。九星、八门、八神转盘均以此序环布八宫。
  const OUTER = ['1','8','3','4','9','2','7','6'];
  // 飞盘顺飞序（含中五）
  const FLY = ['1','2','3','4','5','6','7','8','9'];
  const FLY_OUT = ['1','2','3','4','6','7','8','9']; // 飞盘八门、八神不入中五（飞盘按洛书数字顺飞，非外圈转盘）

  /* ---------------- 五行、吉凶 ---------------- */
  const GAN_WX = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
  const GAN_YANG = new Set(['甲','丙','戊','庚','壬']);
  const ZHI_WX = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
  const GONG_WX = {1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
  const ZHI_GONG = {'子':'1','丑':'8','寅':'8','卯':'3','辰':'4','巳':'4','午':'9','未':'2','申':'2','酉':'7','戌':'6','亥':'6'};
  const WX_NUM = {水:[1,6],火:[2,7],木:[3,8],金:[4,9],土:[5,10]};
  const SHENG_REV = {木:'水',火:'木',土:'火',金:'土',水:'金'};
  const KE_REV = {木:'金',火:'水',土:'木',金:'火',水:'土'};
  const CS_START = {甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'};
  const CS_NAMES = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
  const GONG_ZHI = {1:['子'],2:['未','申'],3:['卯'],4:['辰','巳'],5:[],6:['戌','亥'],7:['酉'],8:['丑','寅'],9:['午']};
  const DUI_GONG = {'1':'9','9':'1','2':'8','8':'2','3':'7','7':'3','4':'6','6':'4','5':''};
  // 驿马宫：申子辰→寅(艮8) 寅午戌→申(坤2) 巳酉丑→亥(乾6) 亥卯未→巳(巽4)
  const MA_ZHI = {'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'};
  const MA_GONG = {'申':'8','子':'8','辰':'8','寅':'2','午':'2','戌':'2','巳':'6','酉':'6','丑':'6','亥':'4','卯':'4','未':'4'};

  const XING_WX = {'天蓬':'水','天芮':'土','天冲':'木','天辅':'木','天禽':'土','天心':'金','天柱':'金','天任':'土','天英':'火'};
  const XING_JX = {'天蓬':'凶','天芮':'凶','天冲':'吉','天辅':'吉','天英':'平','天心':'吉','天柱':'凶','天任':'吉','天禽':'吉'};
  const MEN_JX  = {'休门':'吉','生门':'吉','景门':'平','开门':'吉','伤门':'凶','杜门':'凶','死门':'凶','惊门':'凶'};
  const MEN_WX  = {'休门':'水','生门':'土','伤门':'木','杜门':'木','景门':'火','死门':'土','惊门':'金','开门':'金'};
  const SHEN_JX = {'值符':'吉','太阴':'吉','六合':'吉','九地':'吉','九天':'吉','螣蛇':'凶','白虎':'凶','玄武':'凶','勾陈':'凶','朱雀':'凶'};

  // 旬首 → 六仪
  const XUNSHOU_LIUYI = {'甲子':'戊','甲戌':'己','甲申':'庚','甲午':'辛','甲辰':'壬','甲寅':'癸'};
  // 局数表（上、中、下元）；前12为阳遁，后12为阴遁
  const JIE_JU = {
    '冬至':[1,7,4],'小寒':[2,8,5],'大寒':[3,9,6],'立春':[8,5,2],'雨水':[9,6,3],'惊蛰':[1,7,4],
    '春分':[3,9,6],'清明':[4,1,7],'谷雨':[5,2,8],'立夏':[4,1,7],'小满':[5,2,8],'芒种':[6,3,9],
    '夏至':[9,3,6],'小暑':[8,2,5],'大暑':[7,1,4],'立秋':[2,5,8],'处暑':[1,4,7],'白露':[9,3,6],
    '秋分':[7,1,4],'寒露':[6,9,3],'霜降':[5,8,2],'立冬':[6,9,3],'小雪':[5,8,2],'大雪':[4,7,1]
  };
  const YANG_JIE = new Set(['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种']);

  // 六仪击刑（六仪所落之宫逢刑）：戊→震3 己→坤2 庚→艮8 辛→离9 壬→巽4 癸→巽4
  const JIXING = {'戊':'3','己':'2','庚':'8','辛':'9','壬':'4','癸':'4'};
  // 入库（三奇六仪入墓之宫）：乙丙戊墓戌(乾6) 丁己庚墓丑(艮8) 辛壬墓辰(巽4) 癸墓未(坤2)
  const RUMU = {'乙':'6','丙':'6','戊':'6','丁':'8','己':'8','庚':'8','辛':'4','壬':'4','癸':'2'};

  /* ---------------- 非时家专用局数表（日、月、年、刻 各自独立，非同源重排） ---------------- */
  // 年家奇门专用九星（洛书九星，区别于时家天蓬等）：一白~九紫，仅用于年家注释、配星
  // 年家三元：全部阴遁；上元甲子年阴1(坎1起戊)、中元甲子阴4(巽4)、下元甲子阴7(兑7)
  //   三元180年，以公元1864年(甲子)为上元第一年；局数=甲子基准逐年逆减(mod 9, 1-9)
  const YEAR_YUAN_BASE = [1, 4, 7];           // 上、中、下元 甲子年局数
  const YEAR_EPOCH = 1864;                    // 上元甲子年（阴1局）
  // 月家奇门专用（遁甲演義）：阴遁；甲己年所在五年一元，年支定三元
  //   四孟(寅申巳亥)→上元阴1(坎1)  四仲(子午卯酉)→中元阴7(兑7)  四季(辰戌丑未)→下元阴4(巽4)
  //   每10个月逆减1局；值符随月干、值使随月支
  // 日家奇门专用九星（太乙九星，区别于时家）：太乙、摄提、轩辕、招摇、天符、青龙、咸池、太阴、天乙
  const RIXING = ['太乙','摄提','轩辕','招摇','天符','青龙','咸池','太阴','天乙'];
  const RIXING_WX = {'太乙':'水','摄提':'木','轩辕':'土','招摇':'木','天符':'土','青龙':'金','咸池':'金','太阴':'水','天乙':'火'};
  const RIXING_JX = {'太乙':'吉','摄提':'平','轩辕':'平','招摇':'凶','天符':'凶','青龙':'吉','咸池':'凶','太阴':'吉','天乙':'吉'};
  // 日家九星旬首起宫（一日一宫，顺、逆移）
  const RIXING_XUN_YANG = {'甲子':'8','甲戌':'9','甲申':'1','甲午':'2','甲辰':'3','甲寅':'4'};
  const RIXING_XUN_YIN  = {'甲子':'2','甲戌':'1','甲申':'9','甲午':'8','甲辰':'7','甲寅':'6'};
  // 日家八门：休门落宫（阳遁序1→2→3→4→6→7→8→9；阴遁序9→8→7→6→4→3→2→1，不入中五）
  //   由“领头三日组”日干支查休门宫（见 dayXiuMenGong）；日干阳顺布、阴逆布
  const RIMEN_ORDER = ['休门','生门','伤门','杜门','景门','死门','惊门','开门'];
  // 日家九星、八门 顺时针宫序（后天八卦：坎1→艮8→震3→巽4→离9→坤2→兑7→乾6）
  const BA_GUA_SHUN = ['1','8','3','4','9','2','7','6'];

  /* ---------------- 山向奇门专用（道家阴盘山向体系） ---------------- */
  // 二十四山顺序（罗盘自壬起顺钟转）：每山15°，含三元局数（上、中、下三5°段）
  const SHAN_ORDER = ['壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥'];
  // 二十四山三元局数表（每山3个局：上元5°、中元5°、下元5°；依《一年二十四节气奇门遁甲用事表》）
  const SHAN_JU = {
    '壬':[1,7,4],'子':[2,8,5],'癸':[3,9,6],'丑':[8,5,2],'艮':[9,6,3],'寅':[1,7,4],
    '甲':[3,9,6],'卯':[4,1,7],'乙':[5,2,8],'辰':[4,1,7],'巽':[5,2,8],'巳':[6,3,9],
    '丙':[9,3,6],'午':[8,2,5],'丁':[7,1,4],'未':[2,5,8],'坤':[1,4,7],'申':[9,3,6],
    '庚':[7,1,4],'酉':[6,9,3],'辛':[5,8,2],'戌':[6,9,3],'乾':[5,8,2],'亥':[4,7,1]
  };
  // 双山配支：每两山共一支（壬子=子…乾亥=亥）；向的支作为本局"时支"
  const SHAN_SHUANG_ZHI = {
    '壬':'子','子':'子','癸':'丑','丑':'丑','艮':'寅','寅':'寅',
    '甲':'卯','卯':'卯','乙':'辰','辰':'辰','巽':'巳','巳':'巳',
    '丙':'午','午':'午','丁':'未','未':'未','坤':'申','申':'申',
    '庚':'酉','酉':'酉','辛':'戌','戌':'戌','乾':'亥','亥':'亥'
  };
  // 二十四山对宫（坐山→向山）：罗盘穿山对冲，相隔180°=12位（如壬对丙、子对午、甲对庚）
  function shanOpposite(shan){
    const i = SHAN_ORDER.indexOf(shan); if(i<0) return '';
    return SHAN_ORDER[(i+12)%24];
  }
  // 五鼠遁：日干推时干（时干甲己还甲子等）；向支为时支，用事年干为日干
  function wuShuDun(dayGan, shiZhi){
    const start = {'甲':'甲','乙':'丙','丙':'戊','丁':'庚','戊':'壬','己':'甲','庚':'丙','辛':'戊','壬':'庚','癸':'壬'}[dayGan]||'甲';
    const ziIdx = ZHI.indexOf(shiZhi);
    // 时干序 = 起干序 + 时支序（寅起月建同理，但此处时支从子起）
    const g = GAN[(GAN.indexOf(start)+ziIdx)%10];
    return g + shiZhi;
  }

  /* ---------------- 通用工具 ---------------- */
  const SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  const KE    = {木:'土',土:'水',水:'火',火:'金',金:'木'};

  function gzIndex(gz){
    const gi = GAN.indexOf(gz[0]), zi = ZHI.indexOf(gz[1]);
    if(gi<0||zi<0) return 0;
    for(let n=0;n<60;n++){ if(n%10===gi && n%12===zi) return n; }
    return 0;
  }
  function xunShouOf(gz){ const seq = gzIndex(gz); const head = Math.floor(seq/10)*10; return GAN[head%10] + ZHI[head%12]; }
  function xunShouLiuYi(gz){ return XUNSHOU_LIUYI[xunShouOf(gz)] || '戊'; }
  // 把 arr 旋转使 el 到 index0
  function rotateTo(arr, el){ const i = arr.indexOf(el); if(i<=0) return arr.slice(); return arr.slice(i).concat(arr.slice(0,i)); }

  // 地盘三奇六仪
  function getDiPan(type, num){
    const r = {}; let cur = num;
    for(let i=0;i<9;i++){
      r[cur.toString()] = SQ[i];
      if(type==='yang'){ cur++; if(cur>9) cur=1; } else { cur--; if(cur<1) cur=9; }
    }
    return r;
  }
  // 转盘（八门、八神通用外宫）：八外宫数值顺行序 OUTER，中五恒空（阳顺阴逆）
  function rotateOuter(zf, items, type){
    const fi = OUTER.indexOf(zf); if(fi < 0) return {};
    const dir = (type==='yang') ? 1 : -1;
    const out = {};
    items.forEach((it, i)=>{
      let idx = (fi + dir*i) % 8; if(idx < 0) idx += 8;
      out[OUTER[idx]] = it;
    });
    return out;
  }
  // 转盘核心：沿 OUTER 环序布阵，dir=+1 恒顺时针（九星、八门转盘用）/ dir=-1 逆时针
  function rotateOuterDir(zf, items, dir){
    const fi = OUTER.indexOf(zf); if(fi < 0) return {};
    const out = {};
    items.forEach((it, i)=>{
      let idx = (fi + dir*i) % 8; if(idx < 0) idx += 8;
      out[OUTER[idx]] = it;
    });
    return out;
  }
  // 寄宫流派解析：'坤二'（主流，缺省）、'艮八'（道家阴盘）
  function qinJiGong(qinGong){ return qinGong === '艮八' ? '8' : '2'; }
  // 天盘、九星整体环转：地盘八外宫内容沿环序整体顺移 k = posIndex(值符落宫) − posIndex(值符宫)；
  // 中五无独立外宫，取本位值：天盘干取地盘中五干，九星取天禽
  function rotateTianPan(zhiFuGong, luoGong, srcMap){
    const fi = OUTER.indexOf(zhiFuGong), ti = OUTER.indexOf(luoGong);
    if(fi < 0 || ti < 0) return {};
    const k = (ti - fi + 8) % 8;
    const out = {};
    OUTER.forEach((g, i)=>{
      const src = OUTER[(i - k + 8) % 8];
      out[g] = srcMap[src] || '';
    });
    out['5'] = srcMap['5'] || '';
    return out;
  }
  // 飞盘：以 base 宫起，按洛书数字飞布（含中五）；阳遁顺飞、阴遁逆飞
  function flyPlace(base, items, type){
    const out = {}; let gi = FLY.indexOf(base); if(gi<0) gi=0;
    const dir = type==='yin' ? -1 : 1;
    items.forEach((it,i)=>{ let idx=(gi+dir*i)%9; if(idx<0) idx+=9; out[FLY[idx]] = it; });
    return out;
  }
  function flyPlaceOuter(base, items, type){
    const out = {}; let gi = FLY_OUT.indexOf(base); if(gi<0) gi=0;
    const dir = type==='yin' ? -1 : 1;
    items.forEach((it,i)=>{ let idx=(gi+dir*i)%8; if(idx<0) idx+=8; out[FLY_OUT[idx]] = it; });
    return out;
  }
  // 宫序走步（阳顺阴逆，1..9 循环，遇5跳为2用于寄宫）
  function stepGong(from, steps, type){
    let g = from;
    for(let i=0;i<steps;i++){
      g += (type==='yang'?1:-1);
      if(g>9) g=1; if(g<1) g=9;
    }
    return g;
  }

  /* ---------------- 定局：节气 → 三元 → 局数 ---------------- */
  // 取包含该日期的当前节气及其交节日期
  function currentJieqi(solar, lunar){
    const year = solar.getYear();
    const table = {};
    // 取 上一年冬至 至 今年 的节气，确保跨年边界正确
    [year-1, year].forEach(yr=>{
      const s = Solar.fromYmd(yr,6,1); const l = s.getLunar();
      const t = l.getJieQiTable();
      for(const k in t){ if(JIE_JU[k] && t[k]) table[k] = t[k]; }
    });
    const list = Object.keys(table).map(k=>({name:k, d:table[k]})).filter(x=>x.d)
      .sort((a,b)=> a.d.getYear()*372 + a.d.getMonth()*31 + a.d.getDay() - (b.d.getYear()*372 + b.d.getMonth()*31 + b.d.getDay()));
    // 找到最后一个 交节日 <= 当前日期 的节气
    const cur = solar;
    let pick = list[0], pickIdx = 0;
    for(let i=0;i<list.length;i++){
      if(le(list[i].d, cur)){ pick = list[i]; pickIdx = i; } else break;
    }
    return { name:pick.name, jieqiDate:pick.d, next: list[(pickIdx+1)%list.length] };
  }
  function solarToDate(s){ return safeDate(s.getYear(), s.getMonth(), s.getDay()); }
  function dateToSolar(dt){ return Solar.fromYmd(dt.getFullYear(), dt.getMonth()+1, dt.getDate()); }
  function solarStamp(s){
    return Date.UTC(s.getYear(), s.getMonth()-1, s.getDay(), s.getHour?s.getHour():0, s.getMinute?s.getMinute():0);
  }
  function le(a, b){ // a <= b (按交节时刻)
    return solarStamp(a) <= solarStamp(b);
  }
  function fmtSolar(s){
    const p=n=>('0'+n).slice(-2);
    return s.getYear()+'-'+p(s.getMonth())+'-'+p(s.getDay())+' '+p(s.getHour())+':'+p(s.getMinute());
  }
  function dayDiff(a, b){ // b - a 的天数（按日期）
    return Math.round((solarToDate(b).getTime() - solarToDate(a).getTime())/86400000);
  }
  function isJiaJi(solarDate){ // 日干支是否为甲或己
    const gz = solarDate.getLunar().getDayInGanZhi();
    return gz[0]==='甲' || gz[0]==='己';
  }
  function findJiaJi(solarDate, dir){ // dir=+1 向后找第一个甲己日，dir=-1 向前
    let dt = solarToDate(solarDate); const max=15;
    for(let i=0;i<max;i++){
      const s = dateToSolar(dt);
      if(isJiaJi(s)) return s;
      dt = safeDate(dt.getFullYear(), dt.getMonth()+1, dt.getDate() + (dir>0?1:-1));
    }
    return solarDate;
  }
  // 上元符头：节气前最近的甲己日，且日支为子午卯酉
  function findShangYuanFuTou(solarDate){
    let dt = solarToDate(solarDate);
    for(let i=0;i<15;i++){
      const s = dateToSolar(dt);
      if(isJiaJi(s)){
        const gz = s.getLunar().getDayInGanZhi();
        if('子午卯酉'.indexOf(gz[1])>=0) return s;
      }
      dt = safeDate(dt.getFullYear(), dt.getMonth()+1, dt.getDate()-1);
    }
    return findJiaJi(solarDate, -1);
  }
  // 符头三吉定元：子午卯酉上元、寅申巳亥中元、辰戌丑未下元
  function branchYuanOf(gz){
    const z=gz[1];
    if('子午卯酉'.indexOf(z)>=0) return 0;
    if('寅申巳亥'.indexOf(z)>=0) return 1;
    return 2;
  }
  // 定局主函数：返回 {type(阳、阴), num, yuanText(上、中、下元), jieQiName}
  function determineJu(solar, school){
    const lunar = solar.getLunar();
    const cj = currentJieqi(solar, lunar);
    const jieQiName = cj.name;
    const jieqiDate = cj.jieqiDate;
    const type = YANG_JIE.has(jieQiName) ? 'yang' : 'yin';
    const triple = JIE_JU[jieQiName];
    let yuanIdx = 0, headDate;
    let run = false;
    if(school==='茅山'){
      // 茅山法：交节日即为上元首日
      headDate = jieqiDate;
      yuanIdx = ((dayDiff(headDate, solar)) % 15 + 15) % 15;
      yuanIdx = Math.floor(yuanIdx/5) % 3;
    } else {
      // 拆补：交节前最近符头起元，符头三吉定上中下，五日一元顺推
      const hb = findJiaJi(jieqiDate, -1);
      const gap = dayDiff(hb, jieqiDate);
      headDate = gap <= 4 ? hb : findJiaJi(jieqiDate, +1);
      let dd = dayDiff(headDate, solar);
      if(dd < 0) dd += 15;
      const baseYuan = branchYuanOf(headDate.getLunar().getDayInGanZhi());
      yuanIdx = (baseYuan + Math.floor(dd/5)) % 3;
      // 传统置闰：依《遁甲演义》卷一超神接气置闰诀，芒种、大雪超神九日以上置闰，
      // 闰奇重复本节三元；小满、小雪不置闰。
      if(school==='传统' && (jieQiName==='芒种'||jieQiName==='大雪')){
        const sy = findShangYuanFuTou(jieqiDate);
        const syGap = dayDiff(sy, jieqiDate);
        const ddSY = dayDiff(sy, solar);
        if(syGap >= 8 && ddSY >= 15){
          run = true;
          headDate = sy;
          yuanIdx = Math.floor((ddSY-15)/5) % 3;
        }
      }
    }
    const num = triple[yuanIdx];
    const yuanText = run ? ['闰上元','闰中元','闰下元'][yuanIdx] : ['上元','中元','下元'][yuanIdx];
    return { type, num, yuanIdx, yuanText, jieQiName, jieqiDate, headDate, run };
  }
  // 手动定局：yang-1 至 yang-9、yin-1 至 yin-9
  function parseManualJu(v){
    const m=/^(yang|yin)-([1-9])$/.exec(String(v||''));
    return m?{type:m[1],num:parseInt(m[2],10)}:null;
  }

  /* ---------------- 年家奇门专用局数（全部阴遁，三元180年，甲子基准逐年逆减） ---------------- */
  function determineYearJu(yearGZ, year){
    const n = gzIndex(yearGZ);                       // 年干支在六十甲子序号(0-59)
    let span = (((year - YEAR_EPOCH) % 180) + 180) % 180;  // 距上元甲子年的年数(0-179)
    let yuan = Math.floor(span / 60);                // 0上元 1中元 2下元
    const base = YEAR_YUAN_BASE[yuan];               // 该元甲子年局数(阴1、阴4、阴7)
    let num = ((base - n) % 9 + 9) % 9; if(num === 0) num = 9;  // 逐年逆减(阴遁)
    return { type:'yin', num, yuanText:['上元','中元','下元'][yuan], yuan, n };
  }

  /* ---------------- 月家奇门专用局数（阴遁，遁甲演義：甲己年+年支定三元，每10月逆减） ---------------- */
  function findJiaJiYearOffset(yearGZ){
    // 甲、己年每5年出现一次；取“不晚于当前年”最近一个甲、己年（向后回退0~5年）作为五年一元的起始年
    const idx = gzIndex(yearGZ);
    for(let off=0; off<=5; off++){
      const g = GAN[((idx - off) % 10 + 10) % 10];
      if(g === '甲' || g === '己') return off;
    }
    return 0;
  }
  function determineMonthJu(yearGZ, monthGZ){
    const yi = findJiaJiYearOffset(yearGZ);          // 距起始甲己年的年差(0-5)
    const blockYearGZ = (function(){                 // 五年一元起始甲己年干支
      let idx = (gzIndex(yearGZ) - yi) % 60; if(idx < 0) idx += 60;
      return GAN[idx % 10] + ZHI[idx % 12];
    })();
    const yZhi = blockYearGZ[1];
    // 年支定三元（遁甲演義：四孟上元坎1、四仲中元兑7、四季下元巽4）
    const map = {'寅':'1','申':'1','巳':'1','亥':'1','子':'7','午':'7','卯':'7','酉':'7','辰':'4','戌':'4','丑':'4','未':'4'};
    const base = parseInt(map[yZhi] || '4', 10);
    const yuanText = (base === 1) ? '上元' : (base === 7 ? '中元' : '下元');
    // 月家局数每10个月逆减1局；五年块首寅月为丙寅，月序自丙寅起算
    const offset = (gzIndex(monthGZ) - 2 + 60) % 60;
    let num = ((base - Math.floor(offset/10)) % 9 + 9) % 9;
    if(num === 0) num = 9;
    return { type:'yin', num, yuanText, base, blockYear: blockYearGZ, monthGZ };
  }

  /* ---------------- 日家奇门专用：休门落宫、八门、九星（与节气的阳阴遁） ---------------- */
  function dayXiuMenGong(dayGZ, type){
    // 依“领头三日组”日干支查休门宫（阳遁序，阴遁取10-宫）
    const g = dayGZ[0], z = dayGZ[1];
    let gong = null;
    if(z === '子')      gong = (['甲','戊','壬'].indexOf(g) >= 0) ? '1' : '6';
    else if(z === '卯') gong = (['丁','辛','乙'].indexOf(g) >= 0) ? '2' : '7';
    else if(z === '午') gong = (['戊','庚','甲'].indexOf(g) >= 0) ? '3' : '8';
    else if(z === '酉') gong = (['癸','丁','辛'].indexOf(g) >= 0) ? '4' : '9';
    else {
      // 非子午卯酉日：归并到其所在三日组的领头(子、卯、午、酉)日再查
      const idx = gzIndex(dayGZ);
      const leader = (function(){ let li = Math.floor(idx / 3) * 3; return GAN[li % 10] + ZHI[li % 12]; })();
      return dayXiuMenGong(leader, type);
    }
    if(type === 'yin') gong = (gong === '5') ? '5' : String(10 - parseInt(gong, 10));
    return gong;
  }
  function dayBaMen(dayGZ, xiuGong, type){
    // 日干阳(甲丙戊庚壬)顺布、阴(乙丁己辛癸)逆布；按后天八卦顺时针序排八门
    const fi = BA_GUA_SHUN.indexOf(xiuGong);
    const dir = (GAN_YANG.has(dayGZ[0])) ? 1 : -1;
    const out = {};
    RIMEN_ORDER.forEach((m, i)=>{
      let idx = (fi + dir * i) % 8; if(idx < 0) idx += 8;
      out[BA_GUA_SHUN[idx]] = m;
    });
    return out;
  }
  function dayJiuXing(dayGZ, type){
    // 太乙九星：旬首起宫 + 一日一宫（阳顺阴逆），填满九宫（天符居中五）
    const xs = xunShouOf(dayGZ);
    const base = (type === 'yang' ? RIXING_XUN_YANG : RIXING_XUN_YIN)[xs] || '8';
    const dayIdx = gzIndex(dayGZ) - gzIndex(xs);    // 旬内日序(0-9)
    const P9 = ['1','2','3','4','5','6','7','8','9'];
    const bi = P9.indexOf(base), dir = (type === 'yang') ? 1 : -1;
    const out = {};
    RIXING.forEach((xing, i)=>{
      let idx = (bi + dir * (dayIdx + i)) % 9; if(idx < 0) idx += 9;
      out[P9[idx]] = xing;
    });
    return out;
  }

  /* ---------------- 日家专用排盘（八门、九星用日家本系统，天盘、八神仍按时家理） ---------------- */
  function buildDayPan(type, num, dayGZ, method, qinGong, baShenSect){
    const diPan = getDiPan(type, num);
    const liuyi = xunShouLiuYi(dayGZ);
    let zf = ''; for(const g in diPan){ if(!zf && diPan[g] === liuyi && g !== '5'){ zf = g; break; } }
    if(!zf) zf = qinJiGong(qinGong);
    // 日干落宫（天盘值符落宫）
    let luo = ''; for(const g in diPan){ if(diPan[g] === dayGZ[0] && g !== '5'){ luo = g; break; } }
    if(!luo && diPan['5'] === dayGZ[0]) luo = qinJiGong(qinGong);
    if(!luo) luo = zf;
    // 天盘三奇六仪（值符随日干落宫；天盘=地盘外环整体环移，中五取地盘中五干）
    const tianItems = rotateTo(SQ, liuyi);
    const tianPan = (method === '飞盘') ? flyPlace(luo, tianItems, type) : rotateTianPan(zf, luo, diPan);
    // 日家八门（休门落宫 + 日干阴阳顺逆）
    const xiuGong = dayXiuMenGong(dayGZ, type);
    const baMen = dayBaMen(dayGZ, xiuGong, type);
    baMen['5'] = '';                                   // 八门不入中五
    // 日家九星（太乙起局）
    const jiuXing = dayJiuXing(dayGZ, type);
    // 八神（值符在日干落宫，阳顺阴逆；沿用时家八神名）
    const luoAs8 = (OUTER.indexOf(luo) >= 0) ? luo : qinJiGong(qinGong);
    const shenItems = (baShenSect==='gouchen' && type==='yin') ? SHEN_GOUCHEN : SHEN;
    const baShen = (method === '飞盘') ? flyPlaceOuter(luoAs8, shenItems, type) : rotateOuter(luoAs8, shenItems, type);
    // 暗干（从休门落宫起戊，沿外环阳顺阴逆布八宫，中五取第九干乙）
    const anItems = SQ;
    let anGan;
    if(method === '飞盘') anGan = flyPlace(xiuGong, anItems, type);
    else { anGan = rotateOuter(xiuGong, anItems.slice(0,8), type); anGan['5'] = anItems[8] || ''; }
    const zhiFuXing = jiuXing[zf] || '太乙';
    return {
      diPan, tianPan, jiuXing, baMen, baShen, anGan,
      zhiFuGong: zf, zhiFuXing, zhiShiGong: xiuGong, zhiShiMen: '休门',
      zhiShiGongRaw: xiuGong, luoGongGan: dayGZ[0], xunShou: liuyi, qinGong: qinGong || '坤二'
    };
  }

  /* ---------------- 时柱 ---------------- */
  function timeGanZhi(dayGZ, hour){
    const di = GAN.indexOf(dayGZ[0]);
    const ziIdx = Math.floor((hour+1)/2) % 12; // 子时含23-1
    const ze = ZHI[ziIdx];
    const tg = GAN[(di%5*2 + ziIdx) % 10];
    return tg + ze;
  }
  function keGanZhi(dayGZ, hour, minute){ // 刻柱：时柱加刻序，每时辰八刻、每刻十五分
    const tgz = timeGanZhi(dayGZ, hour);
    const mins = (((hour+1)%24)%2)*60 + minute;
    const keIdx = Math.floor(mins/15);
    return GAN[(GAN.indexOf(tgz[0])+keIdx)%10] + ZHI[(ZHI.indexOf(tgz[1])+keIdx)%12];
  }

  /* ---------------- 四盘排布 ---------------- */
  function buildPan(type, num, drivingGZ, method, over, qinGong){
    over = over || {};
    const diPan = over.diPan || getDiPan(type, num);
    const liuyi = over.xunShouLiuYi || xunShouLiuYi(drivingGZ);
    // 值符宫
    let zf=''; for(const g in diPan){ if(!zf && diPan[g]===liuyi && g!=='5'){ zf=g; break; } }
    if(!zf) zf=qinJiGong(qinGong);   /* 旬首仪落中五：随天禽寄宫（坤二、艮八） */
    const zfXing = over.zhiFuXing || (diPan['5']===liuyi ? '天禽' : BASIC_XING[zf]);
    const zfMen  = over.zhiShiMen  || BASIC_MEN[zf];
    // 时干落宫（天盘值符落宫）
    let luo=''; for(const g in diPan){ if(diPan[g]===drivingGZ[0] && g!=='5'){ luo=g; break; } }
    if(!luo && diPan['5']===drivingGZ[0]) luo=qinJiGong(qinGong);
    if(!luo) luo = zf;
    const luoGongGan = drivingGZ[0];
    // 值使落宫（加时）：从旬首六仪落宫（=值符宫）起，值使随时辰地支转动（阳顺阴逆）
    // 步数 = (时支序数 - 旬首支序数) mod 12，即旬首本时在值符宫、逐时一宫推进到问时时支
    const xunShouGZ = xunShouOf(drivingGZ);
    const xunShouZhi = xunShouGZ[1];
    const step = ((ZHI.indexOf(drivingGZ[1]) - ZHI.indexOf(xunShouZhi)) % 12 + 12) % 12;
    let zs = stepGong(parseInt(zf,10), step, type);
    const zsRaw = zs; if(zs===5) zs=+qinJiGong(qinGong);
    zs = zs.toString();
    const zhiShiGong = over.zhiShiGong || zs;
    const zhiShiMen  = over.zhiShiMen  || zfMen;

    // 天盘三奇六仪（九宫，含中五）
    const tianItems = rotateTo(SQ, liuyi);
    // 九星序列（洛书数字序 1-9，中宫=天禽）
    const xingSeq = ['1','2','3','4','5','6','7','8','9'].map(g=>BASIC_XING[g]);
    const xingItems = rotateTo(xingSeq, zfXing);
    // 八门序列：八宫外宫数值序（中五无门恒空），值使门置首，整体随值使宫转盘、飞布
    const menItems = rotateTo(OUTER.map(g=>BASIC_MEN[g]), zfMen);
    // 八神锚点（时干落宫，外宫序）
    const luoAs8 = (OUTER.indexOf(luo)>=0) ? luo : qinJiGong(qinGong);
    const shenItems = (over.baShenSect==='gouchen' && type==='yin') ? SHEN_GOUCHEN : SHEN;

    let tianPan, jiuXing, baMen, baShen;
    if(method==='飞盘'){
      tianPan = flyPlace(luo, tianItems, type);              // 天盘填满九宫（中宫=中五仪）
      jiuXing = flyPlace(luo, xingItems, type);              // 九星填满九宫（中宫=天禽）
      baMen   = flyPlaceOuter(zhiShiGong, menItems, type);   // 八门八宫外宫阳顺阴逆飞布，中五恒空
      baShen  = flyPlaceOuter(luoAs8, shenItems, type);      // 八神八宫外宫阳顺阴逆飞布，中五恒空
    } else {
      tianPan = rotateTianPan(zf, luo, diPan);               // 天盘=地盘外环整体环移，中五取地盘中五干
      jiuXing = rotateTianPan(zf, luo, BASIC_XING);          // 九星整体环移，中宫恒天禽
      baMen   = rotateOuterDir(zhiShiGong, menItems, 1);     // 八门沿外环恒顺时针转盘，中五恒空
      baShen  = rotateOuter(luoAs8, shenItems, type);        // 八神沿外环阳顺阴逆，中五恒空
    }
    // 暗干（隐干）：从值使门落宫起戊，沿外环阳顺阴逆布八宫，中五取第九干乙
    const anItems = SQ;
    let anGan;
    if(method==='飞盘') anGan = flyPlace(zhiShiGong, anItems, type);
    else { anGan = rotateOuter(zhiShiGong, anItems.slice(0,8), type); anGan['5'] = anItems[8] || ''; }

    return {
      diPan, tianPan, jiuXing, baMen, baShen, anGan,
      zhiFuGong:zf, zhiFuXing:zfXing, zhiShiGong, zhiShiMen:zfMen,
      zhiShiGongRaw:zsRaw, luoGongGan, xunShou:liuyi, qinGong: qinGong || '坤二'
    };
  }

  /* ---------------- 空亡、驿马 ---------------- */
  function kongWang(drivingGZ){
    const xs = xunShouOf(drivingGZ);
    const zhi = xs[1];
    const zi = ZHI.indexOf(zhi);
    const k1 = ZHI[(zi+10)%12], k2 = ZHI[(zi+11)%12];
    const g1 = ZHI_GONG[k1], g2 = ZHI_GONG[k2];
    return { zhi:[k1,k2], gong:[g1,g2] };
  }
  function yiMa(drivingZhi){
    const mz = MA_ZHI[drivingZhi] || '';
    const g = MA_GONG[drivingZhi] || '2';
    return { zhi: mz, gong: g, from: drivingZhi };
  }

  /* ---------------- 宫位分析：门迫、门制、星旺衰 ---------------- */
  function menRelation(men, gong){
    if(!men) return '';
    const mwx = GONG_WX[gong];
    const menWx = {'休门':'水','生门':'土','伤门':'木','杜门':'木','景门':'火','死门':'土','惊门':'金','开门':'金'}[men];
    if(!menWx) return '';
    if(KE[menWx]===mwx) return '门迫';     // 门克宫
    if(KE[mwx]===menWx) return '门制';     // 宫克门
    return '';
  }
  function xingWang(xing, monthEl, wxMap){
    const ex = (wxMap || XING_WX)[xing]; if(!ex||!monthEl) return '';
    if(ex===monthEl) return '旺';
    if(SHENG[monthEl]===ex) return '相';   // 我生者相
    if(SHENG[ex]===monthEl) return '休';   // 生我者休
    if(KE[monthEl]===ex) return '囚';      // 克我者囚
    if(KE[ex]===monthEl) return '废';      // 我克者废
    return '';
  }

  /* ---------------- 十干克应 ---------------- */
  // 重点格局典籍出处（有明确古籍原文者，来源可查；其余十干克应多为后世汇编，不强行标源）
  const KR_SRC = {
    '戊丙':'《烟波钓叟歌》甲加丙兮龙返首',
    '丙戊':'《烟波钓叟歌》丙加甲兮鸟跌穴',
    '乙辛':'《烟波钓叟歌》六乙加辛龙逃走',
    '辛乙':'《烟波钓叟歌》六辛加乙虎猖狂',
    '丁癸':'《烟波钓叟歌》六丁加癸雀入江',
    '癸丁':'《烟波钓叟歌》六癸加丁蛇夭矫',
    '庚丙':'《烟波钓叟歌》六庚加丙白入荧',
    '丙庚':'《烟波钓叟歌》六丙加庚荧入白',
    '庚癸':'《烟波钓叟歌》庚加癸兮为大格',
    '庚壬':'《烟波钓叟歌》加壬之时为上格',
    '庚己':'《烟波钓叟歌》加己为刑格最不宜'
  };
  const KR = {
    '戊戊':'伏吟，凡事不利，静守为宜',
    '戊乙':'青龙合灵，门吉事吉、门凶事凶',
    '戊丙':'青龙返首，百事吉昌、通达如意',
    '戊丁':'青龙耀明，谒贵求名、吉利',
    '戊己':'贵人入狱，公私皆不利',
    '戊庚':'值符飞宫，吉事成凶、凶事更烈',
    '戊辛':'青龙折足，招灾失财',
    '戊壬':'青龙入天牢，凡谋不利',
    '戊癸':'青龙华盖，争讼有碍',
    '乙戊':'利阴害阳，门吉尚可、门凶破财',
    '乙乙':'日奇伏吟，不宜见贵求名、只宜守分',
    '乙丙':'奇仪顺遂，吉星迁官进职、凶星夫妻离别',
    '乙丁':'奇仪相佐，最利文书、百事可为',
    '乙己':'日奇入雾，被土暗昧、门凶必凶',
    '乙庚':'日奇被刑，争讼财产、夫妻怀私',
    '乙辛':'青龙逃走，奴仆拐带、六畜皆伤',
    '乙壬':'日奇入地，尊卑悖乱、官讼是非',
    '乙癸':'华盖逢星，遁迹修道、隐匿藏形',
    '丙戊':'飞鸟跌穴，谋为百事吉、入官得高升',
    '丙乙':'日月并行，公谋私为皆吉',
    '丙丙':'月奇悖师，文书逼迫、破耗遗失',
    '丙丁':'星奇朱雀，贵人文书吉利、常人平静',
    '丙己':'火悖入刑，囚人刑杖、文书不行',
    '丙庚':'荧入太白，门户破败、盗贼耗失',
    '丙辛':'月奇相合，谋事成就、病人不凶',
    '丙壬':'火入天罗，为客不利、是非颇多',
    '丙癸':'华盖悖师，阴人害事、灾祸频生',
    '丁戊':'青龙转光，官人升迁、常人威昌',
    '丁乙':'人遁吉格，贵人加官晋爵、常人婚姻财喜',
    '丁丙':'星随月转，贵人越级高升、常人乐里生悲',
    '丁丁':'奇入太阴，文书即至、喜事遂心',
    '丁己':'火入勾陈，奸私仇冤、事因女人',
    '丁庚':'文书阻隔，行人必归',
    '丁辛':'朱雀入狱，罪人释囚、求谋反失',
    '丁壬':'五神互合，贵人恩诏、讼狱公平',
    '丁癸':'朱雀投江，文书口舌、音信沉溺',
    '己戊':'犬遇青龙，门吉谋望遂意、门凶枉费心机',
    '己乙':'墓神不明，地户逢星、宜遁迹隐形',
    '己丙':'火悖地户，阳人冤冤相害',
    '己丁':'朱雀入墓，文状词讼、先曲后直',
    '己己':'地户逢鬼，病者必死、百事不遂',
    '己庚':'刑格返名，词讼先动者不利',
    '己辛':'游魂入墓，易遭阴邪鬼魅',
    '己壬':'地网高张，狡童佚女、奸情伤杀',
    '己癸':'地刑玄武，男女病危、阴司词讼',
    '庚戊':'天乙伏宫，百事不可谋',
    '庚乙':'太白蓬星，退吉进凶',
    '庚丙':'太白入荧，贼必来、防奸细',
    '庚丁':'亭亭之格，因私昵招讼、门吉稍安',
    '庚己':'刑格，官司受刑、出行尤忌',
    '庚庚':'太白同宫，战格、官事争斗、兄弟失和',
    '庚辛':'白虎干格，远行车折马伤',
    '庚壬':'上格，谋事多变、远行迷失道路',
    '庚癸':'大格，出行官司、车马阻塞',
    '辛戊':'困龙被伤，官司破财',
    '辛乙':'白虎猖狂，家败人亡',
    '辛丙':'干合悖师，荧惑出现、谋事主先难后易',
    '辛丁':'狱神得奇，经商获倍利、囚人赦罪',
    '辛己':'入狱自刑，奴仆背主',
    '辛庚':'白虎出力，刀刃相交',
    '辛辛':'伏吟天庭，公废私就、讼狱自罹',
    '辛壬':'凶蛇入狱，争讼不息、先动失理',
    '辛癸':'天牢华盖，日月失明、误入天网',
    '壬戊':'小蛇化龙，男人发达',
    '壬乙':'小蛇得势，女人柔顺',
    '壬丙':'水蛇入火，官灾刑禁、络绎不绝',
    '壬丁':'干合蛇刑，文书牵连、贵人匆匆',
    '壬己':'反吟蛇刑，大祸将至',
    '壬庚':'太白擒蛇，刑狱公平',
    '壬辛':'螣蛇相缠，纵得吉门亦不能安',
    '壬壬':'蛇入地罗，外人缠绕、内事索索',
    '壬癸':'幼女奸淫，家丑外扬、门吉星凶',
    '癸戊':'天乙合会，吉格',
    '癸乙':'华盖逢星，贵人禄位',
    '癸丙':'华盖悖师，贵贱逢之皆不利',
    '癸丁':'螣蛇夭矫，文书官司、火惊怪异',
    '癸己':'华盖地户，男女占之音信皆阻',
    '癸庚':'太白入网，暴力争讼',
    '癸辛':'网盖天牢，占讼占病',
    '癸壬':'复见螣蛇，嫁娶重婚、后嫁无子',
    '癸癸':'天网四张，万物尽伤、闭口藏身'
  };

  /* ---------------- 格局识别 ---------------- */
  function detectGeju(pan, dayGZ, timeGZ, type, siZhu, family){
    const geju = [];
    const push = (name, jx, explain, src)=> geju.push({name, jiXiong:jx, explain, src});
    // 六仪击刑
    for(const g in pan.tianPan){
      const t = pan.tianPan[g];
      if(JIXING[t]===g) push(`${t}击刑（${GONG_NAME[g]}宫）`, 'xiong', `${t}落${GONG_NAME[g]}宫逢刑，主伤残刑狱`, '《烟波钓叟歌》六仪击刑何太凶');
    }
    // 三奇入墓
    for(const g in pan.tianPan){
      const t = pan.tianPan[g];
      if(['乙','丙','丁'].indexOf(t)>=0 && RUMU[t]===g) push(`${t}入墓（${GONG_NAME[g]}宫）`, 'xiong', `${t}落${GONG_NAME[g]}宫入库，气闷无力`, '《烟波钓叟歌》三奇入墓好思推');
    }
    // 伏吟、反吟：伏吟看天盘干与地盘干多宫相同；反吟看值符加对冲宫
    let fuYin=0;
    ['1','2','3','4','6','7','8','9'].forEach(g=>{
      if(pan.tianPan[g]===pan.diPan[g]) fuYin++;
    });
    if(fuYin>=6) push('天盘伏吟','xiong','天盘干与地盘干多宫相同，宜静守、动则破财','《烟波钓叟歌》就中伏吟最为凶');
    let tianZfGong='';
    for(const g of OUTER){ if(pan.tianPan[g]===pan.xunShou){ tianZfGong=g; break; } }
    if(tianZfGong && (OUTER.indexOf(tianZfGong)-OUTER.indexOf(String(pan.zhiFuGong))+8)%8===4)
      push('天盘反吟','xiong','值符加对冲宫，九星八门反吟，反复不定、宜守不宜攻','《烟波钓叟歌》天蓬若到天英上，须知即是反吟宫');
    // 九星伏吟：九星皆回本位（值符未转动时成立）
    let xingFu=true;
    ['1','2','3','4','6','7','8','9'].forEach(g=>{ if(pan.jiuXing[g]!==BASIC_XING[g]) xingFu=false; });
    if(xingFu) push('九星伏吟','xiong','九星皆回本位，静则吉、动则凶','《烟波钓叟歌》就中伏吟最为凶');
    // 五不遇时：时干克日干 且 同阴阳，仅时家以时柱判
    const dg=dayGZ[0], tg=timeGZ[0];
    if(family==='时家' && KE[GAN_WX[dg]]===GAN_WX[tg] && GAN_YANG.has(dg)===GAN_YANG.has(tg))
      push('五不遇时','xiong','时干克日干且同阴阳，百事皆凶','《烟波钓叟歌》五不遇时龙不精');
    // 庚金四柱格（仅时家）：天盘庚与地盘年、月、日、时干同宫；飞干格为天盘日干加地盘庚
    if(family==='时家' && siZhu){
      const gongOfGan = (arr,w)=>{ for(const g of ['1','2','3','4','6','7','8','9']) if(arr[g]===w) return g; return null; };
      const tgGong = gongOfGan(pan.tianPan,'庚');
      if(tgGong){
        if(gongOfGan(pan.diPan,siZhu.year[0])===tgGong) push('岁格','xiong','天盘庚加地盘年干，用兵遭困、出行不利','《烟波钓叟歌》又嫌岁月日时逢');
        if(gongOfGan(pan.diPan,siZhu.month[0])===tgGong) push('月格','xiong','天盘庚加地盘月干，谋事迟滞、阴人牵制','《烟波钓叟歌》又嫌岁月日时逢');
        if(gongOfGan(pan.diPan,siZhu.day[0])===tgGong) push('日格（伏干格）','xiong','天盘庚加地盘日干，主客相格、官事缠身','《烟波钓叟歌》庚加日干为伏干');
        if(gongOfGan(pan.diPan,siZhu.time[0])===tgGong) push('时格','xiong','天盘庚加地盘时干，事多牵绊、动静皆阻','《烟波钓叟歌》又嫌岁月日时逢');
      }
      const rgGong = gongOfGan(pan.diPan,'庚');
      if(rgGong && gongOfGan(pan.tianPan,siZhu.day[0])===rgGong) push('飞干格','xiong','天盘日干加地盘庚，战宜固守、出行有灾','《烟波钓叟歌》日干加庚飞干格');
    }
    // 三奇得使：三奇加特定六仪，乙加己辛、丙加戊庚、丁加壬癸
    const DESHI = {'乙':['己','辛'],'丙':['戊','庚'],'丁':['壬','癸']};
    ['乙','丙','丁'].forEach(qi=>{
      for(const g of ['1','2','3','4','6','7','8','9']){
        if(pan.tianPan[g]===qi && DESHI[qi].indexOf(pan.diPan[g])>=0)
          push(`${qi}奇得使`,'ji',`${qi}奇加${pan.diPan[g]}，三奇得使，凡事皆宜`,'《烟波钓叟歌》三奇得使诚堪使');
      }
    });
    // 玉女守门：丁奇临值使门
    const zs = pan.zhiShiGong;
    for(const g of ['1','2','3','4','6','7','8','9']){
      if(pan.tianPan[g]==='丁' && g===zs)
        push('玉女守门','ji','丁奇临值使门，利嫁娶、阴私和合','《烟波钓叟歌》号为玉女守门扉');
    }
    // 天显时格（六甲时，天盘值符与地盘同），仅时家
    if(family==='时家' && '甲'.indexOf(timeGZ[0])>=0){
      let same=true; ['1','2','3','4','6','7','8','9'].forEach(g=>{ if(pan.tianPan[g]!==pan.diPan[g]) same=false; });
      if(same) push('天显时格','ji','六甲时，伏吟安妥，出兵安营大吉','《奇门遁甲统宗》天显时格');
    }
    // 三奇升殿（三奇临本殿之宫）：乙→震3、丙→离9、丁→兑7
    const SHENGDIAN = {'乙':'3','丙':'9','丁':'7'};
    ['乙','丙','丁'].forEach(qi=>{
      const g = SHENGDIAN[qi];
      if(pan.tianPan[g]===qi) push(`${qi}奇升殿（${GONG_NAME[g]}宫）`,'ji',`${qi}奇临${GONG_NAME[g]}宫升殿，百事可为、威权显赫`,'《奇门遁甲统宗》三奇贵人升殿');
    });
    // 九遁：三奇 + 门 + 八神、宫位组合。本站取《烟波钓叟歌》主流组合，风、云、龙三遁取休门一门；
    // 另有以开、休、生三门泛取者，本站不取，流派差异见术语速查。
    const dunQiMenShen = (qi, men, shen)=>{ // 三奇、门、神同宫
      for(const g of ['1','2','3','4','6','7','8','9'])
        if(pan.tianPan[g]===qi && pan.baMen[g]===men && pan.baShen[g]===shen) return g;
      return null;
    };
    const dunQiMenAt = (qi, men, gong)=>{ // 三奇、门同落指定宫
      for(const g of ['1','2','3','4','6','7','8','9'])
        if(pan.tianPan[g]===qi && pan.baMen[g]===men && g===gong) return g;
      return null;
    };
    if(dunQiMenShen('丙','生门','九天')) push('天遁','ji','丙奇+生门+九天，百事兴旺、宜远行征战','《烟波钓叟歌》生门六丙合六丁，此为天遁自分明');
    if(dunQiMenShen('乙','开门','九地')) push('地遁','ji','乙奇+开门+九地，宜埋伏安营、求财纳福','《烟波钓叟歌》开门六乙合六己，地遁如斯而已矣');
    if(dunQiMenShen('丁','休门','太阴')) push('人遁','ji','丁奇+休门+太阴，宜遣使合和、谋为遂意','《烟波钓叟歌》休门六丁共太阴，欲求人遁无过此');
    if(dunQiMenShen('丙','开门','九天')) push('神遁','ji','丙奇+开门+九天，宜出师献策、扬名显达','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    if(dunQiMenShen('丁','杜门','九地')) push('鬼遁','ji','丁奇+杜门+九地，宜偷营伏击、探秘隐事','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    if(dunQiMenAt('乙','休门','4')) push('风遁','ji','乙奇+休门+巽四宫（风），宜顺风行事、传播声扬','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    if(dunQiMenAt('乙','休门','2')) push('云遁','ji','乙奇+休门+坤二宫（云），宜藏兵掩袭、暗度陈仓','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    if(dunQiMenAt('乙','休门','1')) push('龙遁','ji','乙奇+休门+坎一宫（水），宜涉水舟船、布雨济人','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    if(dunQiMenAt('乙','生门','8')) push('虎遁','ji','乙奇+生门+艮八宫（山），宜据险伏兵、固守得利','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    return geju;
  }

  /* ---------------- 断局特征层与多派权重 ---------------- */
  // 五派并列，各自权重独立；权重只对本派所取层生效，权重为本站归纳，待核。
  const QIMEN_SCHOOLS = {
    gongQi:{name:'宫气派', note:'以宫气旺衰为主', weights:{gongQi:1, menRel:0.6, xingWang:0.6, shen:0.3, kongMa:0.5}},
    yongShen:{name:'用神派', note:'以用神与求测人宫关系为主', weights:{qiuCe:1, fuYong:0.5, yuanJi:0.7, kongMa:0.4}},
    changSheng:{name:'长生派', note:'以十二长生为主', weights:{changSheng:1, gongQi:0.6, menRel:0.5, xingWang:0.5}},
    zhiFu:{name:'值符派', note:'以值符值使为主', weights:{zhiFu:1, qiuCe:0.5, menRel:0.5, xingWang:0.5}},
    geju:{name:'格局派', note:'以格局吉凶为主', weights:{geju:1, gongQi:0.4, xingWang:0.4}}
  };
  const LAYER_CN = {gongQi:'宫气', menRel:'门宫', xingWang:'星旺', shen:'神煞', qiuCe:'求测', fuYong:'辅用', yuanJi:'原忌仇', kongMa:'空马', changSheng:'长生', zhiFu:'值符', geju:'格局'};
  function gongOfArr(arr,key){
    for(const g of ['1','2','3','4','5','6','7','8','9']){ if((arr[g]||'')===key) return g; }
    return null;
  }
  // 甲不显宫，按旬首六仪落宫（甲子戊、甲戌己…）
  function ganOfGZ(gz){ if(!gz) return ''; let g=gz[0]; if(g==='甲'&&gz.length>=2) g=XUNSHOU_LIUYI['甲'+gz[1]]||g; return g; }
  function useGongOf(pan,purpose,family){
    const healthStar=(family==='日家')?'天符':'天芮';
    const USE={
      '综合':{g:pan.zhiFuGong,l:'值符（总体）'},
      '事业':{g:gongOfArr(pan.baMen,'开门'),l:'开门（事业）'},
      '财运':{g:gongOfArr(pan.baMen,'生门'),l:'生门（财运）'},
      '婚姻':{g:gongOfArr(pan.baMen,'休门'),l:'休门（婚姻）'},
      '健康':{g:gongOfArr(pan.jiuXing,healthStar),l:(family==='日家'?'天符（病符）':'天芮（病星）')},
      '学业':{g:gongOfArr(pan.baMen,'景门'),l:'景门（学业）'},
      '出行':{g:gongOfArr(pan.baMen,'伤门'),l:'伤门（出行）'},
      '失物':{g:gongOfArr(pan.baShen,'六合'),l:'六合（失物）'}
    };
    const use=USE[purpose]||USE['综合'];
    return {g:use.g||pan.zhiFuGong, l:use.l};
  }
  // 用神多取：主用神之外，按所问加辅用神；辅用神只作同参，不改主用神定位
  function useSetOf(pan,purpose,family,yearGZ){
    const primary=useGongOf(pan,purpose,family);
    const list=[{gong:primary.g,label:primary.l,role:'主用神'}];
    const add=(g,label)=>{ if(g) list.push({gong:g,label:label,role:'辅用神'}); };
    const at=(arr,key)=>gongOfArr(arr,key);
    if(purpose==='事业') add(pan.zhiFuGong,'值符（主事）');
    if(purpose==='财运') add(at(pan.tianPan,'戊')||at(pan.diPan,'戊'),'戊（财星）');
    if(purpose==='婚姻'){
      add(at(pan.tianPan,'乙')||at(pan.diPan,'乙'),'乙（女方）');
      add(at(pan.tianPan,'庚')||at(pan.diPan,'庚'),'庚（男方）');
      add(at(pan.baShen,'六合'),'六合（媒合）');
    }
    if(purpose==='健康'){
      const yg=ganOfGZ(yearGZ);
      add(yg?(at(pan.tianPan,yg)||at(pan.diPan,yg)):null,'年命（本人）');
    }
    if(purpose==='学业'){
      add(at(pan.jiuXing,'天辅'),'天辅（文星）');
      add(at(pan.tianPan,'丁')||at(pan.diPan,'丁'),'丁（文书）');
    }
    if(purpose==='出行'&&pan.maStar) add(pan.maStar.gong,'驿马');
    if(purpose==='综合') add(pan.zhiShiGong,'值使（执行）');
    return list;
  }
  // 五行旺衰取 xingWang 真源：把五行本身当作“星”查同一张表
  function wxWangShuai(wx,monthEl){ return xingWang(wx, monthEl, wx?{[wx]:wx}:{}); }
  function changShengOf(gan,zhi){
    const start=CS_START[gan]; if(!start) return '';
    const si=ZHI.indexOf(start), zi=ZHI.indexOf(zhi);
    if(si<0||zi<0) return '';
    const step=GAN_YANG.has(gan)?((zi-si+12)%12):((si-zi+12)%12);
    return CS_NAMES[step]||'';
  }
  function gongsOfWx(wx){
    const out=[];
    ['1','2','3','4','6','7','8','9'].forEach(g=>{ if(GONG_WX[g]===wx) out.push(g); });
    return out;
  }
  function wxRel(a,b){
    if(!a||!b) return '';
    const rels=[['比和',a===b],['生',SHENG[a]===b],['克',KE[a]===b],['被生',SHENG[b]===a],['被克',KE[b]===a]];
    for(let i=0;i<rels.length;i++){ if(rels[i][1]) return rels[i][0]; }
    return '';
  }
  function buildFeatures(pan, purpose, family, yearGZ, siZhu, monthEl, uG){
    const use=useGongOf(pan,purpose,family);
    const ug=uG||use.g;
    const useSet=useSetOf(pan,purpose,family,yearGZ);
    const gongQi={};
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const wx=GONG_WX[g]||'';
      const zhi=GONG_ZHI[g]||[];
      const tian=pan.tianPan[g]||'';
      gongQi[g]={
        wx:wx, wangShuai:wxWangShuai(wx,monthEl), nums:WX_NUM[wx]||[],
        tian:tian, zhi:zhi,
        changSheng:zhi.map(z=>({zhi:z, stage:tian?changShengOf(tian,z):''})).filter(x=>x.stage)
      };
    });
    const yongWx=GONG_WX[ug]||'';
    const yuanWx=SHENG_REV[yongWx]||'';
    const jiWx=KE_REV[yongWx]||'';
    const chouWx=SHENG_REV[jiWx]||'';
    const qiuCe={day:null,time:null,year:null};
    if(siZhu){
      const dg=ganOfGZ(siZhu.day), tg=ganOfGZ(siZhu.time);
      const dayGong=gongOfArr(pan.tianPan,dg)||gongOfArr(pan.diPan,dg);
      const timeGong=gongOfArr(pan.tianPan,tg)||gongOfArr(pan.diPan,tg);
      qiuCe.day=dayGong?{gong:dayGong,wx:GONG_WX[dayGong],wangShuai:wxWangShuai(GONG_WX[dayGong],monthEl)}:null;
      qiuCe.time=timeGong?{gong:timeGong,wx:GONG_WX[timeGong],wangShuai:wxWangShuai(GONG_WX[timeGong],monthEl)}:null;
    }
    if(yearGZ){
      const yg=ganOfGZ(yearGZ);
      const yGong=gongOfArr(pan.tianPan,yg)||gongOfArr(pan.diPan,yg);
      qiuCe.year=yGong?{gong:yGong,wx:GONG_WX[yGong],wangShuai:wxWangShuai(GONG_WX[yGong],monthEl)}:null;
    }
    const yongShenSet=useSet.map(x=>{
      const q=gongQi[x.gong]||{};
      return {gong:x.gong,label:x.label,role:x.role,wx:q.wx||'',wangShuai:q.wangShuai||'',
        kong:(pan.kongWangGong||[]).indexOf(x.gong)>=0,
        ma:!!(pan.maStar&&pan.maStar.gong===x.gong)};
    });
    const yuanGongs=gongsOfWx(yuanWx), jiGongs=gongsOfWx(jiWx), chouGongs=gongsOfWx(chouWx);
    const pairs=[];
    const addPair=(a,labelA,b,labelB)=>{
      if(!a||!b) return;
      pairs.push({
        a:a,b:b,labelA:labelA,labelB:labelB,
        rel:wxRel(GONG_WX[a],GONG_WX[b]),
        chong:DUI_GONG[a]===b,
        kongA:(pan.kongWangGong||[]).indexOf(a)>=0,
        kongB:(pan.kongWangGong||[]).indexOf(b)>=0,
        maA:!!(pan.maStar&&pan.maStar.gong===a),
        maB:!!(pan.maStar&&pan.maStar.gong===b)
      });
    };
    addPair(ug,'用神',qiuCe.day?qiuCe.day.gong:null,'日干');
    addPair(ug,'用神',qiuCe.time?qiuCe.time.gong:null,'时干');
    addPair(ug,'用神',qiuCe.year?qiuCe.year.gong:null,'年命');
    yuanGongs.forEach(g=>addPair(ug,'用神',g,'原神'));
    jiGongs.forEach(g=>addPair(ug,'用神',g,'忌神'));
    chouGongs.forEach(g=>addPair(ug,'用神',g,'仇神'));
    return {
      yongShen:{gong:ug,label:use.l,wx:yongWx,wangShuai:wxWangShuai(yongWx,monthEl),
        kong:(pan.kongWangGong||[]).indexOf(ug)>=0,
        ma:!!(pan.maStar&&pan.maStar.gong===ug)},
      yongShenSet:yongShenSet,
      gongQi:gongQi,
      yuan:{wx:yuanWx,gongs:yuanGongs}, ji:{wx:jiWx,gongs:jiGongs}, chou:{wx:chouWx,gongs:chouGongs},
      qiuCe:qiuCe, pairs:pairs
    };
  }
  function gradeOfScore(score){
    if(score>=4) return '大吉';
    if(score>=2) return '吉';
    if(score>-2) return '平';
    if(score>-4) return '凶';
    return '大凶';
  }
  function judgeFeatures(features,pan,gongJx,geju){
    const items=[];
    const push=(layer,score,text,src)=>{ items.push({layer:layer,layerName:LAYER_CN[layer]||layer,score:score,text:text,src:src}); };
    const ug=features.yongShen.gong, ua=(gongJx||{})[ug]||{};
    const gq=features.gongQi[ug]||{};
    if(gq.wangShuai){
      const s=(gq.wangShuai==='旺'||gq.wangShuai==='相')?2:(gq.wangShuai==='休'?0:-1.5);
      push('gongQi',s,`用神宫${GONG_NAME[ug]}宫气${gq.wangShuai}`,'五行旺相休囚废通行法');
    }
    if(ua.menRel){ push('menRel',ua.menRel==='门迫'?-2:-1,`用神宫${ua.menRel}`,'《烟波钓叟歌》门迫门制条'); }
    if(ua.xingWang){
      const s=(ua.xingWang==='旺'||ua.xingWang==='相')?1:((ua.xingWang==='囚'||ua.xingWang==='废')?-1:0);
      push('xingWang',s,`用神宫星${ua.xingWang}`,'五行旺相休囚废通行法');
    }
    if(ua.jiXiong){ push('shen',ua.jiXiong==='吉'?1:(ua.jiXiong==='凶'?-1:0),`用神宫门星神合判${ua.jiXiong}`,'奇门门星神吉凶通行法'); }
    // 辅用神：按所问加取，宫气旺相得助、空亡受制，只作同参
    (features.yongShenSet||[]).filter(x=>x.role==='辅用神').forEach(x=>{
      const q=features.gongQi[x.gong]||{};
      const s=(q.wangShuai==='旺'||q.wangShuai==='相')?0.6:(q.wangShuai==='休'?0:-0.6);
      push('fuYong',s,`辅用神${x.label}在${GONG_NAME[x.gong]}宫，宫气${q.wangShuai||'无'}`,'奇门用神多取通行法');
      if((pan.kongWangGong||[]).indexOf(x.gong)>=0) push('fuYong',-0.6,`辅用神${x.label}空亡`,'旬空通行法');
    });
    // 格局派：吉格助成、凶格受阻，逐格入证
    (geju||[]).forEach(g=>{
      const s=g.jiXiong==='ji'?1:(g.jiXiong==='xiong'?-1:0);
      if(s) push('geju',s,`${g.name}为${g.jiXiong==='ji'?'吉格':'凶格'}`,g.src||'未载');
    });
    // 日干、年命为“人”，以事对人论：事生人得利、事克人受制、人耗于事、人制事可掌控；
    // 时干为“事体”，以用神自身强弱论：得生为助、被克受制、生他泄气、克他制事。
    const relToPerson={'生':1.2,'克':-1.5,'被生':-0.3,'被克':0.8,'比和':0};
    const relToMatter={'生':-0.5,'克':1,'被生':1.5,'被克':-2,'比和':0};
    features.pairs.forEach(p=>{
      if(p.labelB==='日干'||p.labelB==='时干'||p.labelB==='年命'){
        const toMatter=p.labelB==='时干';
        const scale=p.labelB==='日干'?1:(p.labelB==='时干'?0.6:0.8);
        const relText=p.rel==='生'?`用神生${p.labelB}`:(p.rel==='克'?`用神克${p.labelB}`:(p.rel==='被生'?`${p.labelB}生用神`:(p.rel==='被克'?`${p.labelB}克用神`:'比和')));
        const note=toMatter
          ? (p.rel==='生'?'（用神泄于事）':(p.rel==='克'?'（用神制事）':(p.rel==='被生'?'（用神得助）':(p.rel==='被克'?'（用神受制）':''))))
          : (p.rel==='生'?'（事生人）':(p.rel==='克'?'（事克人）':(p.rel==='被生'?'（人耗于事）':(p.rel==='被克'?'（人制事）':''))));
        // 比和亦入证据（得零分），使判项可逐条复核
        const m=toMatter?relToMatter:relToPerson;
        push('qiuCe',(m[p.rel]!=null?m[p.rel]:0)*scale,`用神宫与${p.labelB}宫：${relText}${note}`,'奇门用神生克通行法');
      }
    });
    // 原神、忌神、仇神逐宫入证；旺相力显，休囚力弱，分数按旺衰折减
    const wxPower=(w)=>(w==='旺'||w==='相')?1:(w==='休'?0.5:0.3);
    features.yuan.gongs.forEach(g=>{ const w=features.gongQi[g]&&features.gongQi[g].wangShuai; push('yuanJi',wxPower(w),`原神宫${GONG_NAME[g]}${w||'无气'}，生用神`,'奇门原神生用神通行法'); });
    features.ji.gongs.forEach(g=>{ const w=features.gongQi[g]&&features.gongQi[g].wangShuai; push('yuanJi',-wxPower(w),`忌神宫${GONG_NAME[g]}${w||'无气'}，克用神`,'奇门忌神克用神通行法'); });
    features.chou.gongs.forEach(g=>{ const w=features.gongQi[g]&&features.gongQi[g].wangShuai; push('yuanJi',-wxPower(w)*0.5,`仇神宫${GONG_NAME[g]}${w||'无气'}，生忌神`,'奇门仇神生忌神通行法'); });
    if((pan.kongWangGong||[]).indexOf(ug)>=0) push('kongMa',-1.5,'用神空亡','旬空通行法');
    if(pan.maStar&&pan.maStar.gong===ug) push('kongMa',0.5,'用神临驿马','驿马通行法');
    const csOf=(g)=>{ const q=features.gongQi[g]; return (q&&q.changSheng)||[]; };
    const csScore=(stage)=>{ if(!stage) return 0; if(['长生','冠带','临官','帝旺'].indexOf(stage)>=0) return 1.5; if(['衰','病','死','墓','绝'].indexOf(stage)>=0) return -1.5; return 0; };
    // 一宫两支者（艮丑寅、巽辰巳、坤未申、乾戌亥）两支并看取均值，不择一支代替
    const csAvg=(list)=>{ if(!list.length) return 0; return list.reduce((s,x)=>s+csScore(x.stage),0)/list.length; };
    const csText=(list)=>list.map(x=>x.zhi+x.stage).join('、');
    const ucs=csOf(ug); if(ucs.length) push('changSheng',csAvg(ucs),`用神天盘干在${GONG_NAME[ug]}宫：${csText(ucs)}`,'《三命通会》十二长生');
    if(features.qiuCe.day){ const c=csOf(features.qiuCe.day.gong); if(c.length) push('changSheng',csAvg(c)*0.8,`日干在${GONG_NAME[features.qiuCe.day.gong]}宫：${csText(c)}`,'《三命通会》十二长生'); }
    if(features.qiuCe.year){ const c=csOf(features.qiuCe.year.gong); if(c.length) push('changSheng',csAvg(c)*0.8,`年命在${GONG_NAME[features.qiuCe.year.gong]}宫：${csText(c)}`,'《三命通会》十二长生'); }
    const zfG=pan.zhiFuGong;
    const zfRel=wxRel(GONG_WX[zfG],GONG_WX[ug]);
    const zfScore=zfRel==='生'?1.5:(zfRel==='克'?-1.5:(zfRel==='被生'?-0.5:(zfRel==='被克'?0.5:0)));
    const relPhrase=(a,b,rel)=>rel==='生'?`${a}生${b}`:(rel==='克'?`${a}克${b}`:(rel==='被生'?`${b}生${a}`:(rel==='被克'?`${b}克${a}`:`${a}与${b}比和`)));
    push('zhiFu',zfScore,relPhrase(`值符宫${GONG_NAME[zfG]}（${GONG_WX[zfG]}）`,'用神宫',zfRel),'《烟波钓叟歌》值符值使条');
    const zsm=pan.zhiShiMen, zsj=MEN_JX[zsm]||'平';
    if(zsj!=='平') push('zhiFu',zsj==='吉'?0.8:-0.8,`值使${zsm}为${zsj}`,'《烟波钓叟歌》值符值使条');
    // 值使门五行对用神宫：门克宫用神受制，门生宫得助，宫克门门力受制
    const zsRel=wxRel(MEN_WX[zsm]||'',GONG_WX[ug]);
    const zsRelScore=zsRel==='克'?-1:(zsRel==='生'?0.8:(zsRel==='被克'?0.3:(zsRel==='被生'?-0.3:0)));
    if(zsRel) push('zhiFu',zsRelScore,relPhrase(`值使${zsm}（${MEN_WX[zsm]||'无'}）`,'用神宫',zsRel),'《烟波钓叟歌》值符值使条');
    const zfW=features.gongQi[zfG]&&features.gongQi[zfG].wangShuai;
    if(zfW==='旺'||zfW==='相') push('zhiFu',0.8,`值符宫宫气${zfW}`,'五行旺相休囚废通行法');
    else if(zfW==='囚'||zfW==='废') push('zhiFu',-0.8,`值符宫宫气${zfW}`,'五行旺相休囚废通行法');
    else if(zfW==='休') push('zhiFu',0,`值符宫宫气${zfW}`,'五行旺相休囚废通行法');
    const schools=Object.keys(QIMEN_SCHOOLS).map(key=>{
      const def=QIMEN_SCHOOLS[key];
      // 本派只取权重表列出的层，未列层不计分；同一事实可入多派，各按本派权重折算
      const its=items.filter(i=>def.weights[i.layer]!=null);
      const score=its.reduce((s,i)=>s+i.score*def.weights[i.layer],0);
      const weightText=Object.keys(def.weights).map(k=>`${LAYER_CN[k]||k}${def.weights[k]}`).join(' ');
      // 关键证据取本派权重最高的三项，全量证据留在出处表
      const topItems=its.slice().sort((a,b)=>Math.abs(b.score*def.weights[b.layer])-Math.abs(a.score*def.weights[a.layer])).slice(0,3);
      // 判名按展示值定档
      const shown=Math.round(score*10)/10;
      return {key:key,name:def.name,note:def.note,weights:def.weights,weightText:weightText,score:shown,grade:gradeOfScore(shown),items:its,topItems:topItems};
    });
    return {schools:schools, synthesis:synthesizeJudgments(schools)};
  }

  /* ---------------- 多派综合：共识统计与分歧裁断 ---------------- */
  // 裁断次序：问事以用神为纲，值符主事之成败，宫气定事之根基，长生定气之始终。
  const SCHOOL_PRIORITY = [
    {key:'yongShen', role:'主', why:'问事以用神为纲'},
    {key:'zhiFu', role:'辅', why:'值符为盘主之神，主事之成败'},
    {key:'gongQi', role:'体', why:'宫气旺衰定事之根基'},
    {key:'changSheng', role:'用', why:'十二长生定气之始终'},
    {key:'geju', role:'证', why:'格局吉凶定事之成阻'}
  ];
  const STANCE_HINT = {
    yongShen:'看事与人的关系，分歧在此，须先明确所求与自身处境。',
    zhiFu:'看主事者与上级，分歧在此，须先理顺上下关系。',
    gongQi:'看事之根基，分歧在此，须先补足条件。',
    changSheng:'看气之始终，分歧在此，须看时机早晚。',
    geju:'看格局成阻，分歧在此，须看吉格凶格是否落于用神。'
  };
  function stanceOfGrade(g){
    if(g==='大吉'||g==='吉') return '吉';
    if(g==='大凶'||g==='凶') return '凶';
    return '平';
  }
  function priorityOfSchool(s){
    for(let i=0;i<SCHOOL_PRIORITY.length;i++){ if(SCHOOL_PRIORITY[i].key===s.key) return i; }
    return SCHOOL_PRIORITY.length;
  }
  // 取该派权重最高的证据，作分歧理由与主判依据
  function topReasonOfSchool(s){
    const w=s.weights||{};
    const top=(s.items||[]).slice().sort((a,b)=>Math.abs(b.score*(w[b.layer]||0))-Math.abs(a.score*(w[a.layer]||0)))[0];
    return top?`${top.text}（${top.src}）`:'无成项';
  }
  function synthesizeJudgments(schools){
    const total=schools.length;
    const CN={2:'两',3:'三',4:'四',5:'五'};
    const groups={'吉':[],'平':[],'凶':[]};
    schools.forEach(s=>groups[stanceOfGrade(s.grade)].push(s));
    let consensusStance='', consensusSchools=[];
    ['吉','平','凶'].forEach(st=>{ if(groups[st].length>=3){ consensusStance=st; consensusSchools=groups[st]; } });
    let primary=null, basis='';
    if(consensusStance){
      primary=consensusSchools.slice().sort((a,b)=>priorityOfSchool(a)-priorityOfSchool(b))[0];
      basis=`${CN[consensusSchools.length]||consensusSchools.length}派同判${consensusStance}，取其中${primary.name}为主`;
    } else {
      const y=schools.filter(s=>s.key==='yongShen')[0], z=schools.filter(s=>s.key==='zhiFu')[0];
      if(y&&z&&stanceOfGrade(y.grade)===stanceOfGrade(z.grade)){
        primary=y;
        basis=`用神派与值符派同判${stanceOfGrade(y.grade)}，按裁断次序取用神派为主`;
      } else if(y){
        primary=y;
        basis=`${total}派分歧，按裁断次序取用神派为主`;
      } else {
        primary=schools[0];
        basis=`${total}派分歧，取首位派别为主`;
      }
    }
    const stance=stanceOfGrade(primary.grade);
    const same=schools.filter(s=>s!==primary&&stanceOfGrade(s.grade)===stance).sort((a,b)=>priorityOfSchool(a)-priorityOfSchool(b));
    const secondary=same[0]||schools.filter(s=>s!==primary).sort((a,b)=>priorityOfSchool(a)-priorityOfSchool(b))[0]||null;
    const conflicts=schools.filter(s=>stanceOfGrade(s.grade)!==stance).map(s=>({
      key:s.key,name:s.name,grade:s.grade,score:s.score,reason:topReasonOfSchool(s)
    }));
    const count=schools.filter(s=>stanceOfGrade(s.grade)===stance).length;
    const consensusLabel=count===total?`${CN[total]||total}派同判`:(count>=3?`${CN[count]||count}派同判`:(count===2?'两派同判':`${CN[total]||total}派分歧`));
    const headline=count>=3
      ? `${consensusLabel}${stance}，主判${primary.name}${primary.grade}（${primary.score}）`
      : `${CN[total]||total}派分歧，主判${primary.name}${primary.grade}（${primary.score}）`;
    const primaryReason=topReasonOfSchool(primary);
    const base={吉:'主判偏吉，事有可成之机，宜乘势而进；',平:'主判吉凶相半，事可谋而后动，先看条件是否齐备；',凶:'主判偏凶，宜守不宜攻，先避其锋、再图转机；'}[stance];
    let advice=base;
    if(conflicts.length){
      // 只展开裁断次序最靠前的分歧，其余并列点名
      const ordered=conflicts.slice().sort((a,b)=>priorityOfSchool(a)-priorityOfSchool(b));
      const mainC=ordered[0], restC=ordered.slice(1);
      advice+=`${mainC.name}判${mainC.grade}，${STANCE_HINT[mainC.key]||''}`;
      if(restC.length) advice+=`${restC.map(c=>c.name+'判'+c.grade).join('、')}，与主判不同。`;
      const secTxt=(secondary&&secondary.key!==mainC.key)?(secondary.opposed?'，'+secondary.name+'之警作次':'、'+secondary.name+'为次'):'';
      advice+=`取舍以${primary.name}为主${secTxt}，其余作辅。`;
    } else {
      advice+=`${CN[total]||total}派同向，结论较稳，仍以用神落宫的具体条件为准。`;
    }
    const plain=count>=3
      ? `${CN[total]||total}派中${count}派同看，主看${primary.name}，判${primary.grade}${conflicts.length?'；'+conflicts.map(c=>c.name+'判'+c.grade).join('、')+'，与主判不同':'，各家一致'}。`
      : `${CN[total]||total}派意见不一，主看${primary.name}判${primary.grade}；${conflicts.map(c=>c.name+'判'+c.grade).join('、')}。`;
    const criterion=[
      {key:'派别立场', basis:`${total}派各按本派权重取层计分，得分定判名`, result:schools.map(s=>`${s.name}${s.grade}（${s.score}）`).join('、')},
      {key:'共识统计', basis:'同判派数达三派即共识，不足三派按裁断次序', input:{吉:groups['吉'].length,平:groups['平'].length,凶:groups['凶'].length}, result:count>=3?`${consensusLabel}${stance}`:`${CN[total]||total}派分歧`},
      {key:'裁断次序', basis:'用神派为先、值符派为次、宫气派为体、长生派为用、格局派为证', result:`主判${primary.name}，次判${secondary?secondary.name:'无'}`},
      {key:'分歧', basis:'与主判立场不同的派别，取其权重最高的证据', result:conflicts.length?conflicts.map(c=>`${c.name}：${c.reason}`).join('；'):'无'}
    ];
    return {
      primary:{key:primary.key,name:primary.name,grade:primary.grade,score:primary.score,note:primary.note,reason:primaryReason},
      secondary:secondary?{key:secondary.key,name:secondary.name,grade:secondary.grade,score:secondary.score,note:secondary.note,reason:topReasonOfSchool(secondary),opposed:stanceOfGrade(secondary.grade)!==stance}:null,
      conflicts:conflicts,
      consensus:{stance:stance,label:consensusLabel,count:count},
      headline:headline, basis:basis, primaryReason:primaryReason, advice:advice, plain:plain, criterion:criterion
    };
  }

  /* ---------------- 应期多法：诸家取法并列，不合成单一日期 ---------------- */
  function buildYingQiSchools(yq,monthEl,baseDate){
    const methods=[];
    const uniq=a=>a.filter((x,i)=>x&&a.indexOf(x)===i).sort((x,y)=>x-y);
    const pad2=n=>('0'+n).slice(-2);
    const fmtDate=dt=>`${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
    const nextDayByZhi=zhi=>{
      if(!zhi||!baseDate) return '';
      for(let i=0;i<60;i++){
        const dt=new Date(baseDate.getFullYear(),baseDate.getMonth(),baseDate.getDate()+i);
        const gz=Solar.fromDate(dt).getLunar().getDayInGanZhi();
        if(gz[1]===zhi) return `${fmtDate(dt)}（${gz}日）`;
      }
      return '';
    };
    const nextMonthByZhi=zhi=>{
      if(!zhi||!baseDate) return '';
      for(let i=0;i<400;i++){
        const dt=new Date(baseDate.getFullYear(),baseDate.getMonth(),baseDate.getDate()+i);
        const l=Solar.fromDate(dt).getLunar();
        if(l.getDay()===1 && l.getMonthInGanZhi()[1]===zhi) return `${fmtDate(dt)}（${l.getMonthInGanZhi()}月）`;
      }
      return '';
    };
    const zhiDates=zhi=>[nextDayByZhi(zhi),nextMonthByZhi(zhi)].filter(Boolean).join('、');
    const gongNum=parseInt(yq.gong,10);
    const wxNums=(yq.wxNums||[]).slice();
    const ugZhi=(GONG_ZHI[yq.gong]||[])[0]||'';
    const ugDate=zhiDates(ugZhi);
    methods.push({
      key:'gongShu', name:'用神宫数法',
      method:`用神落${GONG_NAME[yq.gong]}宫，宫数 ${gongNum}；${yq.wx}之成数 ${wxNums.join('、')}；宫支 ${ugZhi||'无'}`,
      result:`近事取 ${uniq([gongNum].concat(wxNums)).join('、')} 日，远事取同数月${ugDate?'；宫支近应 '+ugDate:''}`,
      src:'奇门应期通行法；河图五行成数',
      note:'宫数与五行成数并取，宫支定具体干支日'
    });
    const zsNum=parseInt(yq.zhiShiGong,10);
    const zsZhi=(GONG_ZHI[yq.zhiShiGong]||[])[0]||'';
    const zsDate=zhiDates(zsZhi);
    methods.push({
      key:'zhiShi', name:'值使门数法',
      method:`值使${yq.zhiShiMen}落${GONG_NAME[yq.zhiShiGong]}宫，宫数 ${zsNum}；宫支 ${zsZhi||'无'}`,
      result:`应期取 ${zsNum} 日或 ${zsNum} 月${zsDate?'；近应 '+zsDate:''}`,
      src:'奇门应期通行法',
      note:'值使门为管事之门，落宫数与宫支并参'
    });
    const kongDates=yq.kong?[yq.kong.zhi[0],yq.kong.chong[0]].map(z=>z?zhiDates(z):'').filter(Boolean).join('；'):'';
    methods.push(yq.kong?{
      key:'kongWang', name:'空亡填实法',
      method:`用神逢空，空支 ${yq.kong.zhi.join('、')}，冲支 ${yq.kong.chong.join('、')}`,
      result:`待填实 ${yq.kong.zhi.join('、')} 或冲空 ${yq.kong.chong.join('、')} 之期${kongDates?'；近应 '+kongDates:''}`,
      src:'旬空通行法',
      note:'空亡主虚浮，须待填实或冲空'
    }:{
      key:'kongWang', name:'空亡填实法',
      method:'用神不逢空',
      result:'不取此期',
      src:'旬空通行法',
      note:'空亡不现，此法不作'
    });
    const maDate=yq.ma?zhiDates(yq.ma.zhi):'';
    methods.push(yq.ma?{
      key:'maXing', name:'马星法',
      method:`用神临驿马，马星 ${yq.ma.zhi}（自 ${yq.ma.from} 起）`,
      result:`应在 ${yq.ma.zhi} 日或 ${yq.ma.zhi} 月${maDate?'；近应 '+maDate:''}`,
      src:'驿马通行法',
      note:'马主动，事有变动则验'
    }:{
      key:'maXing', name:'马星法',
      method:'用神不临驿马',
      result:'不取此期',
      src:'驿马通行法',
      note:'马星不现，此法不作'
    });
    const wang=wxWangShuai(yq.wx,monthEl)||'';
    methods.push({
      key:'wangShuai', name:'旺衰远近法',
      method:`用神五行 ${yq.wx}，月令宫气 ${wang||'无'}`,
      result:(wang==='旺'||wang==='相')?'事近，应在当月当日；旺相之月更验':'事缓，应在休囚之月，待旺相之期',
      src:'奇门应期通行法',
      note:'旺相应近、休囚应远'
    });
    return methods;
  }

  /* ---------------- 用神 + 综合断语 ---------------- */
  function buildAnalysis(pan, purpose, type, num, school, kongZhiText, family, yearGZ, dayGZ){
    family = family || '时家';
    const XING_JX_USE = (family === '日家') ? RIXING_JX : XING_JX;   // 日家用太乙九星吉凶
    const jg = {};
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const x=pan.jiuXing[g]||'', m=pan.baMen[g]||'', s=pan.baShen[g]||'';
      let sc=0;
      if(XING_JX_USE[x]==='吉') sc++; else if(XING_JX_USE[x]==='凶') sc--;
      if(MEN_JX[m]==='吉') sc++; else if(MEN_JX[m]==='凶') sc--;
      if(SHEN_JX[s]==='吉') sc++; else if(SHEN_JX[s]==='凶') sc--;
      jg[g]={ jiXiong: sc>0?'吉':(sc<0?'凶':'平') };
    });
    const JXCN={'吉':'吉','凶':'凶','平':'平'};
    const gongOf=(arr,key)=>{ for(const g of ['1','2','3','4','5','6','7','8','9']){ if((arr[g]||'')===key) return g; } return null; };
    const use=useGongOf(pan,purpose,family);
    const uG=use.g;
    const sugs=[];
    sugs.push({cat:'用神定位', text:`用神【${purpose}】看${use.l}所落${GONG_NAME[uG]}宫：星${pan.jiuXing[uG]||'无'}、门${pan.baMen[uG]||'无'}、神${pan.baShen[uG]||'无'}；门星神三项合判${JXCN[jg[uG]?jg[uG].jiXiong:'平']}（仅此三项，不含宫气与十二长生）。`});
    /* 用神与日干生克：时家、日家以日干落宫与用神落宫论生克 */
    let useRel='';
    if(dayGZ && (family==='时家'||family==='日家')){
      let dg=dayGZ[0];
      if(dg==='甲'&&dayGZ.length>=2) dg=XUNSHOU_LIUYI['甲'+dayGZ[1]]||dg;
      const dayGong = gongOf(pan.tianPan, dg) || gongOf(pan.diPan, dg);
      if(dayGong && uG){
        const uw=GONG_WX[uG], dw=GONG_WX[dayGong];
        let rel='';
        if(uw===dw) rel='比和';
        else if(SHENG[uw]===dw) rel='用神生日干';
        else if(SHENG[dw]===uw) rel='日干生用神';
        else if(KE[uw]===dw) rel='用神克日干';
        else if(KE[dw]===uw) rel='日干克用神';
        if(rel){ useRel=rel; sugs.push({cat:'用神生克', text:`用神在${GONG_NAME[uG]}宫，日干落${GONG_NAME[dayGong]}宫，${rel}。`}); }
      }
    }
    /* 年命用神：求测人生年天干落宫（兼看地盘、天盘），断其宫位吉凶与事体关联 */
    if(yearGZ && yearGZ.length>=1){
      let yg=yearGZ[0];
      // 年命天干若是甲（遁甲不显宫），映射为六仪（甲子→戊、甲戌→己…）
      if(yg==='甲' && yearGZ.length>=2) yg = XUNSHOU_LIUYI['甲'+yearGZ[1]] || yg;
      const yGong = gongOf(pan.tianPan, yg) || gongOf(pan.diPan, yg);
      if(yGong){
        sugs.push({cat:'年命用神', text:`年命【${yearGZ}】（${yg}）落${GONG_NAME[yGong]}宫：星${pan.jiuXing[yGong]||'无'}、门${pan.baMen[yGong]||'无'}、神${pan.baShen[yGong]||'无'}；门星神三项合判${JXCN[jg[yGong]?jg[yGong].jiXiong:'平']}，主此命在局中动静喜忌。`});
      }
    }
    /* 婚姻双用神（乙庚）：测婚姻兼看乙（女方）、庚（男方）落宫与吉凶 */
    if(purpose==='婚姻'){
      const yiG=gongOf(pan.tianPan,'乙')||gongOf(pan.diPan,'乙');
      const gengG=gongOf(pan.tianPan,'庚')||gongOf(pan.diPan,'庚');
      if(yiG) sugs.push({cat:'婚姻乙庚', text:`婚姻看乙（女方）落${GONG_NAME[yiG]}宫，星门神${JXCN[jg[yiG]?jg[yiG].jiXiong:'平']}。`});
      if(gengG) sugs.push({cat:'婚姻乙庚', text:`庚（男方）落${GONG_NAME[gengG]}宫，星门神${JXCN[jg[gengG]?jg[gengG].jiXiong:'平']}，乙庚二宫生克定姻缘和合。`});
      if(yiG&&gengG){
        const yw=GONG_WX[yiG], gw=GONG_WX[gengG];
        let rel='';
        if(yw===gw) rel='比和';
        else if(SHENG[yw]===gw) rel='乙宫生庚宫';
        else if(SHENG[gw]===yw) rel='庚宫生乙宫';
        else if(KE[yw]===gw) rel='乙宫克庚宫';
        else if(KE[gw]===yw) rel='庚宫克乙宫';
        if(rel) sugs.push({cat:'婚姻乙庚', text:`乙（女方）落${GONG_NAME[yiG]}宫，庚（男方）落${GONG_NAME[gengG]}宫，二宫${rel}。`});
      }
    }
    ['开门','生门','休门','景门'].forEach(mn=>{ const g=gongOf(pan.baMen,mn); if(g) sugs.push({cat:'吉门分布', text:`吉门${mn}落${GONG_NAME[g]}宫（${JXCN[jg[g].jiXiong]}），主${mn==='开门'?'事业开创':mn==='生门'?'财源生发':mn==='休门'?'婚姻休养':'文书名声'}。`}); });
    ['伤门','杜门','死门','惊门'].forEach(mn=>{ const g=gongOf(pan.baMen,mn); if(g) sugs.push({cat:'凶门分布', text:`凶门${mn}落${GONG_NAME[g]}宫（${JXCN[jg[g].jiXiong]}），宜谨慎守静、勿妄动。`}); });
    ['白虎','玄武','螣蛇','勾陈','朱雀'].forEach(sn=>{ const g=gongOf(pan.baShen,sn); if(g) sugs.push({cat:'凶神临宫', text:`凶神${sn}临${GONG_NAME[g]}宫，防是非、损耗或虚惊。`}); });
    sugs.push({cat:'值符值使', text:`值符落${GONG_NAME[pan.zhiFuGong]}宫，百煞潜藏；值使${pan.zhiShiMen}落${GONG_NAME[pan.zhiShiGong]}宫。`});
    if(kongZhiText) sugs.push({cat:'空亡影响', text:`空亡${kongZhiText}，所临之宫吉凶减半、事多虚浮，行事宜留余地。`});
    let ji=0,xiong=0,ping=0; ['1','2','3','4','6','7','8','9'].forEach(g=>{ const j=jg[g].jiXiong; if(j==='吉')ji++; else if(j==='凶')xiong++; else ping++; });
    const DOC_SCHOOL={茅山:'茅山法交节日上元',传统:'置闰法起局',拆补:'拆补法起局',山向:'山向定局'};
    const FAM_DOC={日家:'日家六十日三局',月家:'月家每10个月逆减',年家:'年家三元逆减',刻家:'刻家刻柱驱动'};
    const docSchool = FAM_DOC[family] || DOC_SCHOOL[school] || '拆补法起局';
    const level = ji>xiong?'吉':(ji<xiong?'凶':'平');
    const overall=`${type==='yang'?'阳遁':'阴遁'}${num}局（${docSchool}）：用神【${purpose}】在${GONG_NAME[uG]}宫，八宫${ji}吉${xiong}凶${ping}平，星门神综合${level==='平'?'吉凶相半':('以'+level+'论为主')}，详见下式九宫。`;
    const WX_NUM={水:[1,6],火:[2,7],木:[3,8],金:[4,9],土:[5,10]};
    const CHONG=ZHI_CHONG;
    const wx=GONG_WX[uG]||'';
    const kongHit=(pan.kongWangGong||[]).indexOf(uG)>=0;
    const maHit=pan.maStar&&pan.maStar.gong===uG;
    const yingQi={
      gong:uG, gongNum:parseInt(uG,10), wx:wx, wxNums:WX_NUM[wx]||[],
      zhiShiGong:pan.zhiShiGong, zhiShiMen:pan.zhiShiMen,
      kong:kongHit?{zhi:(pan.kongWangZhi||[]).slice(),chong:(pan.kongWangZhi||[]).map(z=>CHONG[z]||'')}:null,
      ma:maHit?{zhi:pan.maStar.zhi,from:pan.maStar.from}:null
    };
    return { jiuGongAnalysis:jg, overallJiXiongText:overall, overallLevel:(level==='吉'?'ji':(level==='凶'?'xiong':'ping')), useGong:uG, useRelation:useRel, yingQi:yingQi, suggestions:sugs };
  }

  /* ---------------- 主入口 ---------------- */
  function calculate(date, opts){
    opts = opts || {};
    const family = opts.family || '时家';
    const method = opts.method || '转盘';
    const school = opts.school || '传统';
    const purpose = opts.purpose || '综合';
    let y=date.getFullYear(), mo=date.getMonth()+1, d=date.getDate(), h=date.getHours(), mi=date.getMinutes();
    const ziMode = opts.ziMode === 'early' ? 'early' : 'late';
    if(h===23 && ziMode==='late'){
      const nd = new Date(y, mo-1, d+1);
      y=nd.getFullYear(); mo=nd.getMonth()+1; d=nd.getDate(); h=0;
    }
    const solar = Solar.fromYmdHms(y,mo,d,h,mi,0), lunar = solar.getLunar();
    const yearGZ = lunar.getYearInGanZhi();
    const monthGZ = lunar.getMonthInGanZhi();
    const dayGZ = lunar.getDayInGanZhi();
    const timeGZ = timeGanZhi(dayGZ, h);
    const keGZ = keGanZhi(dayGZ, h, mi);
    const siZhu = { year:yearGZ, month:monthGZ, day:dayGZ, time:timeGZ };

    // 驱动干支
    let drivingGZ = dayGZ;
    if(family==='时家') drivingGZ = timeGZ;
    else if(family==='日家') drivingGZ = dayGZ;
    else if(family==='月家') drivingGZ = monthGZ;
    else if(family==='年家') drivingGZ = yearGZ;
    else if(family==='刻家') drivingGZ = keGZ;

    // 定局：各家数使用各自独立的专用局数表（非同源重排）
    const ju = determineJu(solar, school);              // 时家节气三元局（刻家亦同源使用，见下注）
    const type0 = ju.type;
    let num, yuanText, jieQiName, type = type0, juMeta = {};
    if(family==='时家'){
      num = ju.num; yuanText = ju.yuanText; jieQiName = ju.jieQiName;
    } else if(family==='年家'){
      // 年家专用局数：全部阴遁，三元180年，甲子基准逐年逆减
      const yj = determineYearJu(yearGZ, y);
      num = yj.num; yuanText = yj.yuanText; type = 'yin'; jieQiName = '年家 '+yearGZ;
      juMeta = { yuan: yj.yuanText, base: YEAR_YUAN_BASE[yj.yuan], epoch: YEAR_EPOCH };
    } else if(family==='月家'){
      // 月家专用局数：阴遁，遁甲演義 甲己年+年支定三元，每10月逆减
      const mj = determineMonthJu(yearGZ, monthGZ);
      num = mj.num; yuanText = mj.yuanText; type = 'yin'; jieQiName = '月家 '+yearGZ+' '+monthGZ;
      juMeta = { yuan: mj.yuanText, base: mj.base, note: '月家局数每10个月逆减1局' };
    } else if(family==='日家'){
      // 日家专用局数：阳遁1/7/4、阴遁9/3/6（按节气二至分阳阴遁、六十日一局近似）；八门、九星另用日家本系统
      const dayType = type0;                            // 冬至~芒种阳遁、夏至~大雪阴遁
      const BLOCK = (dayType === 'yang') ? [1,7,4] : [9,3,6];
      const dn = gzIndex(dayGZ);
      const bi = Math.floor((dn % 60) / 20) % 3;        // 六十日三局循环近似（上、中、下）
      num = BLOCK[bi]; yuanText = ['上元','中元','下元'][bi];
      type = dayType; jieQiName = '日家 '+dayGZ;
      juMeta = { dayType, note: '日家局数按六十日三局循环近似' };
    } else if(family==='刻家'){
      // 刻家：后人所创，无统一专用局数表；唯一可据者为时家节气三元局，配刻柱驱动
      num = ju.num; yuanText = ju.yuanText; jieQiName = ju.jieQiName;
      juMeta = { note: '刻家无独立局数表，采用时家节气三元局配刻柱驱动' };
    }
    const manual = parseManualJu(opts.manualJu);
    if(manual && (family==='时家'||family==='刻家')){
      type=manual.type; num=manual.num; yuanText='手动'; jieQiName='手动定局'; juMeta={manual:true};
    }

    // 四盘
    let pan;
    if(family==='日家'){
      pan = buildDayPan(type, num, dayGZ, method, opts.qinGong, opts.baShenSect);
    } else {
      pan = buildPan(type, num, drivingGZ, method, {baShenSect: opts.baShenSect}, opts.qinGong);
    }
    // 驱动干落宫（用于八神、天盘落宫定位）
    const luo = (function(){ let g=''; for(const k in pan.diPan){ if(pan.diPan[k]===drivingGZ[0] && k!=='5'){ g=k; break; } } if(!g && pan.diPan['5']===drivingGZ[0]) g=qinJiGong(opts.qinGong); if(!g) g=pan.zhiFuGong; return g; })();

    // 空亡、驿马
    const kw = kongWang(drivingGZ);
    const ma = yiMa(drivingGZ[1]);

    // 月令五行（星旺相休囚废）
    const monthEl = ZHI_WX[monthGZ[1]];

    // 十干克应 + 门迫、门制 + 星旺衰，写入每宫
    const gongDetail = {};
    const xingWxMap = (family === '日家') ? RIXING_WX : XING_WX;
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const t=pan.tianPan[g]||'', dp=pan.diPan[g]||'';
      const kr = (t&&dp)? KR[t+dp] : '';
      const krSrc = (t&&dp)? KR_SRC[t+dp] : '';
      const mr = menRelation(pan.baMen[g], g);
      const xw = xingWang(pan.jiuXing[g], monthEl, xingWxMap);
      gongDetail[g] = { keYing:kr, keYingSrc:krSrc, menRel:mr, xingWang:xw };
    });

    // 格局（日家无独立格局体系，沿用天盘、门、神通用格局供参考）
    const geju = detectGeju(pan, dayGZ, timeGZ, type, siZhu, family);

    // 分析 + 用神
    const kongZhiText = kw.zhi.join('、');
    const analysis = buildAnalysis(pan, purpose, type, num, school, kongZhiText, family, opts.birthGZ, dayGZ);

    // 每宫吉凶 兼并 门迫、星旺 等信息进 jiuGongAnalysis
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const a = analysis.jiuGongAnalysis[g] || (analysis.jiuGongAnalysis[g]={jiXiong:'平'});
      a.menRel = gongDetail[g].menRel;
      a.xingWang = gongDetail[g].xingWang;
      a.keYing = gongDetail[g].keYing;
      a.keYingSrc = gongDetail[g].keYingSrc;
    });
    const uG = analysis.useGong;
    if(uG){
      const ua = analysis.jiuGongAnalysis[uG] || {};
      if(ua.xingWang) analysis.suggestions.push({cat:'用神旺衰', text:`用神在${GONG_NAME[uG]}宫，星之旺衰为${ua.xingWang}。`});
      if(kw.gong.indexOf(uG)>=0) analysis.suggestions.push({cat:'用神空亡', text:`用神在${GONG_NAME[uG]}宫，正逢空亡，吉凶减半。`});
      if(ma && ma.gong===uG) analysis.suggestions.push({cat:'用神驿马', text:`用神在${GONG_NAME[uG]}宫，临驿马，主变动、出行。`});
    }
    // 特征层与判项共用空亡、驿马落宫，先并入盘对象再取用
    pan.kongWangGong = Array.from(new Set(kw.gong));
    pan.kongWangZhi = kw.zhi;
    pan.maStar = ma;
    if(uG){
      analysis.yingQi.kong = pan.kongWangGong.indexOf(uG)>=0 ? {zhi:pan.kongWangZhi.slice(),chong:pan.kongWangZhi.map(z=>ZHI_CHONG[z]||'')} : null;
      analysis.yingQi.ma = (pan.maStar&&pan.maStar.gong===uG) ? {zhi:pan.maStar.zhi,from:pan.maStar.from} : null;
    }
    analysis.features = buildFeatures(pan, purpose, family, opts.birthGZ, siZhu, monthEl, uG);
    analysis.judgments = judgeFeatures(analysis.features, pan, analysis.jiuGongAnalysis, geju);
    analysis.yingQi.schools = buildYingQiSchools(analysis.yingQi, monthEl, date);

    const fullName = juMeta.manual ? `${type==='yang'?'阳遁':'阴遁'}${num}局` : `${type==='yang'?'阳遁':'阴遁'}${num}局（${yuanText}）`;
    const juFuTou = !manual && (family==='时家'||family==='刻家') && ju.headDate ? ju.headDate.getLunar().getDayInGanZhi() : '';
    const juJiaoJie = !manual && (family==='时家'||family==='刻家') && ju.jieqiDate ? fmtSolar(ju.jieqiDate) : '';
    return {
      family, method, school,
      siZhu,
      juShu: { yuan: juMeta.manual ? (type==='yang'?'阳遁':'阴遁') : ((type==='yang'?'阳遁':'阴遁')+yuanText), jieQiName, fullName, num, type, juMeta, run: !!ju.run, fuTou: juFuTou, jiaoJie: juJiaoJie },
      xunShou: pan.xunShou, luoGongGan: drivingGZ[0], keZhu: keGZ, qinGong: pan.qinGong || '坤二',
      zhiFuGong: pan.zhiFuGong, zhiFuXing: pan.zhiFuXing,
      zhiShiGong: pan.zhiShiGong, zhiShiMen: pan.zhiShiMen,
      xingSystem: (family==='日家') ? '日家九星（太乙、摄提、轩辕、招摇、天符、青龙、咸池、太阴、天乙）' : '时家九星（天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英）',
      diPan: pan.diPan, tianPan: pan.tianPan, jiuXing: pan.jiuXing,
      baMen: pan.baMen, baShen: pan.baShen, anGan: pan.anGan,
      kongWangGong: Array.from(new Set(kw.gong)), kongWangZhi: kw.zhi, maStar: ma,
      jiuGongAnalysis: analysis.jiuGongAnalysis,
      geju,
      analysis: { overallJiXiongText: analysis.overallJiXiongText, overallLevel: analysis.overallLevel, useGong: analysis.useGong, useRelation: analysis.useRelation, yingQi: analysis.yingQi, suggestions: analysis.suggestions, features: analysis.features, judgments: analysis.judgments }
    };
  }

  /* ---------------- 山向奇门专用入口（道家阴盘山向体系） ---------------- */
  // 输入：{ shan (坐山), xiang (向山，默认坐山对宫), yearGZ (用事年干支),
  //         yuanIdx (0上元、1中元、2下元，或-1自动按度数), degree (可选度数),
  //         method ('转盘'/'飞盘'), purpose ('综合') }
  // 返回：与 calculate 同构的 pan 对象（含九宫盘、格局、分析等）
  function calculateShanXiang(opts){
    opts = opts || {};
    let shan = opts.shan || '子';
    let xiang = opts.xiang || shanOpposite(shan);
    const yearGZ = opts.yearGZ || '甲子';
    const method = opts.method || '转盘';
    const purpose = opts.purpose || '综合';
    const SHAN_JU_DATA = SHAN_JU;  // 引用顶层数据
    // 按度数定山与元：二十四山每山15度，自山起点顺时针分上元、中元、下元各5度
    let yuanIdx = opts.yuanIdx;
    const degRaw = opts.degree;
    const deg = Number(degRaw);
    const degreeUsed = degRaw != null && String(degRaw).trim() !== '' && isFinite(deg);
    let degreeVal = null;
    if(degreeUsed){
      degreeVal = ((deg % 360) + 360) % 360;
      const idx = Math.floor(((degreeVal + 22.5) % 360) / 15);
      shan = SHAN_ORDER[idx];
      xiang = shanOpposite(shan);
      const start = (idx*15 - 22.5 + 360) % 360;
      const within = (degreeVal - start + 360) % 360;
      yuanIdx = Math.floor(within/5);
    }

    // 1. 阴阳遁：亥至巽为阳局（亥、壬、子、癸、丑、艮、寅、甲、卯、乙、辰、巽），巳至乾为阴局
    const shanIdx = SHAN_ORDER.indexOf(shan);
    const isYang = (shanIdx === 23 || (shanIdx >= 0 && shanIdx <= 10));
    const type = isYang ? 'yang' : 'yin';

    // 2. 定局数：按坐山三元局数表取段
    const juTbl = SHAN_JU_DATA[shan] || [1,7,4];
    if(yuanIdx == null || yuanIdx < 0 || yuanIdx > 2){
      // 默认取上元（能量最大）
      yuanIdx = 0;
    }
    const num = juTbl[yuanIdx];
    const yuanText = ['上元','中元','下元'][yuanIdx];

    // 3. 构造驱动干支：向的双山支做"时支"，用事年干做"日干"→五鼠遁
    const xiangZhi = SHAN_SHUANG_ZHI[xiang] || '子';
    const drivingGZ = wuShuDun(yearGZ[0], xiangZhi);
    const dayGZ = yearGZ;  // 用事年干支做日干支

    // 4. 排盘：复用 buildPan（地盘、天盘、星门神等）
    const pan = buildPan(type, num, drivingGZ, method, {baShenSect: opts.baShenSect}, opts.qinGong);
    if(!pan) return { error:true, message:'山向排盘失败' };

    // 5. 补充字段
    const kw = kongWang(drivingGZ);
    const ma = yiMa(drivingGZ[1]);
    const monthEl = ZHI_WX[xiangZhi];  // 山向以向支为月令参照

    const gongDetail = {};
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const t=pan.tianPan[g]||'', dp=pan.diPan[g]||'';
      const kr = (t&&dp)? KR[t+dp] : '';
      const krSrc = (t&&dp)? KR_SRC[t+dp] : '';
      const mr = menRelation(pan.baMen[g], g);
      const xw = xingWang(pan.jiuXing[g], monthEl, XING_WX);
      gongDetail[g] = { keYing:kr, keYingSrc:krSrc, menRel:mr, xingWang:xw };
    });

    // 格局（山向沿用盘面格局，五不遇时、庚格、天显时格等时家四柱格不参与）
    const siZhu = { year:yearGZ, month:yearGZ, day:dayGZ, time:drivingGZ };
    const geju = detectGeju(pan, dayGZ, drivingGZ, type, siZhu, '山向');

    // 分析：山向无用事人年命，年命项不出
    const kongZhiText = kw.zhi.join('、');
    const analysis = buildAnalysis(pan, purpose, type, num, '山向', kongZhiText, '时家', '', '');

    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const a = analysis.jiuGongAnalysis[g] || (analysis.jiuGongAnalysis[g]={jiXiong:'平'});
      a.menRel = gongDetail[g].menRel;
      a.xingWang = gongDetail[g].xingWang;
      a.keYing = gongDetail[g].keYing;
      a.keYingSrc = gongDetail[g].keYingSrc;
    });
    const uG = analysis.useGong;
    if(uG){
      const ua = analysis.jiuGongAnalysis[uG] || {};
      if(ua.xingWang) analysis.suggestions.push({cat:'用神旺衰', text:`用神在${GONG_NAME[uG]}宫，星之旺衰为${ua.xingWang}。`});
      if(kw.gong.indexOf(uG)>=0) analysis.suggestions.push({cat:'用神空亡', text:`用神在${GONG_NAME[uG]}宫，正逢空亡，吉凶减半。`});
      if(ma && ma.gong===uG) analysis.suggestions.push({cat:'用神驿马', text:`用神在${GONG_NAME[uG]}宫，临驿马，主变动、出行。`});
    }
    // 特征层与判项共用空亡、驿马落宫，先并入盘对象再取用
    pan.kongWangGong = Array.from(new Set(kw.gong));
    pan.kongWangZhi = kw.zhi;
    pan.maStar = ma;
    if(uG){
      analysis.yingQi.kong = pan.kongWangGong.indexOf(uG)>=0 ? {zhi:pan.kongWangZhi.slice(),chong:pan.kongWangZhi.map(z=>ZHI_CHONG[z]||'')} : null;
      analysis.yingQi.ma = (pan.maStar&&pan.maStar.gong===uG) ? {zhi:pan.maStar.zhi,from:pan.maStar.from} : null;
    }
    analysis.features = buildFeatures(pan, purpose, '时家', '', null, monthEl, uG);
    analysis.judgments = judgeFeatures(analysis.features, pan, analysis.jiuGongAnalysis, geju);
    analysis.yingQi.schools = buildYingQiSchools(analysis.yingQi, monthEl, new Date());

    const fullName = `${type==='yang'?'阳遁':'阴遁'}${num}局（${yuanText}）`;
    return {
      family:'山向', method, school:'山向',
      siZhu: { year:yearGZ, month:'', day:dayGZ, time:drivingGZ },
      juShu: { yuan: (type==='yang'?'阳遁':'阴遁')+yuanText, jieQiName:'山向 '+shan+'山'+xiang+'向', fullName, num, type },
      xunShou: pan.xunShou, luoGongGan: drivingGZ[0], qinGong: pan.qinGong || '坤二',
      zhiFuGong: pan.zhiFuGong, zhiFuXing: pan.zhiFuXing,
      zhiShiGong: pan.zhiShiGong, zhiShiMen: pan.zhiShiMen,
      xingSystem: '时家九星（天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英）',
      diPan: pan.diPan, tianPan: pan.tianPan, jiuXing: pan.jiuXing,
      baMen: pan.baMen, baShen: pan.baShen, anGan: pan.anGan,
      kongWangGong: Array.from(new Set(kw.gong)), kongWangZhi: kw.zhi, maStar: ma,
      jiuGongAnalysis: analysis.jiuGongAnalysis,
      geju,
      analysis: { overallJiXiongText: analysis.overallJiXiongText, overallLevel: analysis.overallLevel, useGong: analysis.useGong, useRelation: analysis.useRelation, yingQi: analysis.yingQi, suggestions: analysis.suggestions, features: analysis.features, judgments: analysis.judgments },
      shanXiang: { shan, xiang, shanIdx, yuanIdx, yearGZ, drivingGZ, degree: degreeVal }
    };
  }

  global.Qimen = { calculate, calculateShanXiang, SHAN_ORDER, SHAN_JU, shanOpposite, wuShuDun, XING_JX, MEN_JX, SHEN_JX };
})(typeof window !== 'undefined' ? window : this);
