/* ============================================================================
 * 奇门遁甲 全功能排盘引擎 (qimen-engine.js)
 * ----------------------------------------------------------------------------
 * 设计目标：时家转盘、飞盘皆为规范排法；年、月/日家各有专属局数表（非时家同源重排），刻家采用时家节气局数配刻柱驱动（近似）。
 * 暴露 window.Qimen.calculate(date, opts) ，返回 qimen.html / qimen-extra.js 所需的完整盘对象。
 *
 * 核心算法（转盘、寄宫法）：
 *   1. 定局：节气 → 三元(上、中/下) → 局数；阳遁(冬至~芒种) / 阴遁(夏至~大雪)。
 *      支持 拆补法(默认) / 茅山法(交节日即上元) / 传统置闰法(拆补起局，标注置闰)。
 *   2. 地盘三奇六仪：戊从局数宫起，阳顺阴逆，含中五。
 *   3. 旬首六仪：由驱动干支(时家取时柱)求旬首 → 甲子戊…甲寅癸。
 *   4. 值符宫 = 旬首六仪在地盘之宫(中五寄坤二)；值符星、值使门 = 该宫原位星、门。
 *   5. 天盘(天盘干)：值符(旬首六仪)转到“时干落宫”，三奇六仪整体沿后天八卦顺时针外圈旋转；
 *      中五仪无宫位，落到天禽寄宫(坤二/艮八)。
 *   6. 九星：值符星转到时干落宫，沿后天八卦顺时针外圈布八宫(恒顺时针，不论阴阳遁)；
 *      中宫为天禽，随中五仪寄宫(坤二/艮八)。
 *   7. 八门：值使门“加时”：从值符宫起，走时辰旬内序数步(阳顺阴逆)，中五寄坤；八门整体沿
 *      后天八卦顺时针外圈转盘(恒顺时针，不论阴阳遁)。
 *   8. 八神：值符在时干落宫(=天盘值符宫)，沿后天八卦顺时针外圈布八宫，阳顺阴逆。
 *   转盘外圈序(先天洛书宫位按后天八卦环序)=坎1→艮8→震3→巽4→离9→坤2→兑7→乾6，见常量 OUTER。
 *   9. 暗干(隐干)：从值使门落宫起戊，阳顺阴逆布三奇六仪。
 *  10. 空亡(旬空两宫) / 驿马(支→宫) / 门迫门制 / 星旺相休囚废。
 *  11. 格局：伏吟、反吟、六仪击刑、三奇六仪入墓、五不遇时、庚四柱格(岁、月/日、时/飞干)、三奇得使、玉女守门、青龙回首、飞鸟跌穴、三奇升殿、九遁、十干克应。
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
  // 洛书转盘序（不含中五，八卦位序）
  const LUO = ['1','8','3','4','9','2','7','6'];
  // 后天八卦顺时针序（转盘外圈）：坎1→艮8→震3→巽4→离9→坤2→兑7→乾6，沿九宫外圈依次相邻。
  // 依据：传统转盘奇门“顺时针排布法（顺序 183459276）”，见百度百科，数字奇门遁甲；
  //       刘文元《奇门遁甲》、孟令伟、奇门派等皆同。九星、八门、八神转盘均以此序环布八宫。
  const OUTER = ['1','8','3','4','9','2','7','6'];
  // 飞盘顺飞序（含中五）
  const FLY = ['1','2','3','4','5','6','7','8','9'];
  const FLY_OUT = ['1','2','3','4','6','7','8','9']; // 飞盘八门、八神不入中五（飞盘按洛书数字顺飞，非外圈转盘）

  /* ---------------- 五行 / 吉凶 ---------------- */
  const GAN_WX = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
  const GAN_YANG = new Set(['甲','丙','戊','庚','壬']);
  const ZHI_WX = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
  const GONG_WX = {1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
  const ZHI_GONG = {'子':'1','丑':'8','寅':'8','卯':'3','辰':'4','巳':'4','午':'9','未':'2','申':'2','酉':'7','戌':'6','亥':'6'};
  // 驿马宫：申子辰→寅(艮8) 寅午戌→申(坤2) 巳酉丑→亥(乾6) 亥卯未→巳(巽4)
  const MA_ZHI = {'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'};
  const MA_GONG = {'申':'8','子':'8','辰':'8','寅':'2','午':'2','戌':'2','巳':'6','酉':'6','丑':'6','亥':'4','卯':'4','未':'4'};

  const XING_WX = {'天蓬':'水','天芮':'土','天冲':'木','天辅':'木','天禽':'土','天心':'金','天柱':'金','天任':'土','天英':'火'};
  const XING_JX = {'天蓬':'凶','天芮':'凶','天冲':'吉','天辅':'吉','天英':'平','天心':'吉','天柱':'凶','天任':'吉','天禽':'吉'};
  const MEN_JX  = {'休门':'吉','生门':'吉','景门':'吉','开门':'吉','伤门':'凶','杜门':'凶','死门':'凶','惊门':'凶'};
  const SHEN_JX = {'值符':'吉','太阴':'吉','六合':'吉','九地':'吉','九天':'吉','螣蛇':'凶','白虎':'凶','玄武':'凶'};

  // 旬首 → 六仪
  const XUNSHOU_LIUYI = {'甲子':'戊','甲戌':'己','甲申':'庚','甲午':'辛','甲辰':'壬','甲寅':'癸'};
  // 局数表（上、中/下元）；前12为阳遁，后12为阴遁
  const JIE_JU = {
    '冬至':[1,7,4],'小寒':[2,8,5],'大寒':[3,9,6],'立春':[8,5,2],'雨水':[9,6,3],'惊蛰':[1,7,4],
    '春分':[3,9,6],'清明':[4,1,7],'谷雨':[5,2,8],'立夏':[4,1,7],'小满':[5,2,8],'芒种':[6,3,9],
    '夏至':[9,3,6],'小暑':[8,2,5],'大暑':[7,1,4],'立秋':[2,5,8],'处暑':[1,4,7],'白露':[9,3,6],
    '秋分':[7,1,4],'寒露':[6,9,3],'霜降':[5,8,2],'立冬':[6,9,3],'小雪':[5,8,2],'大雪':[4,7,1]
  };
  const YANG_JIE = new Set(['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种']);

  // 六仪击刑（六仪所落之宫逢刑）：戊→震3 己→坤2 庚→艮8 辛→离9 壬→巽4 癸→坤2
  const JIXING = {'戊':'3','己':'2','庚':'8','辛':'9','壬':'4','癸':'2'};
  // 入库（三奇六仪入墓之宫）：乙丙戊墓戌(乾6) 丁己庚墓丑(艮8) 辛壬墓辰(巽4) 癸墓未(坤2)
  const RUMU = {'乙':'6','丙':'6','戊':'6','丁':'8','己':'8','庚':'8','辛':'4','壬':'4','癸':'2'};

  /* ---------------- 非时家专用局数表（日、月/年、刻 各自独立，非同源重排） ---------------- */
  // 年家奇门专用九星（洛书九星，区别于时家天蓬等）：一白~九紫，仅用于年家注释、配星
  // 年家三元：全部阴遁；上元甲子年阴1(坎1起戊)、中元甲子阴4(巽4)、下元甲子阴7(兑7)
  //   三元180年，以公元1864年(甲子)为上元第一年；局数=甲子基准逐年逆减(mod 9, 1-9)
  const YEAR_YUAN_BASE = [1, 4, 7];           // 上、中/下元 甲子年局数
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
  // 二十四山顺序（罗盘自壬起顺钟转）：每山15°，含三元局数（上/中/下三5°段）
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
  const WX_CN = {木:'木',火:'火',土:'土',金:'金',水:'水'};

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
  // 天盘/九星整体环转：地盘八外宫内容沿环序整体顺移 k = posIndex(值符落宫) − posIndex(值符宫)；
  // 中五（天禽、中五仪）无独立外宫，取寄宫镜像（中5 = 转后寄宫位的值）
  function rotateTianPan(zhiFuGong, luoGong, srcMap, jiGong){
    const fi = OUTER.indexOf(zhiFuGong), ti = OUTER.indexOf(luoGong);
    if(fi < 0 || ti < 0) return {};
    const k = (ti - fi + 8) % 8;
    const out = {};
    OUTER.forEach((g, i)=>{
      const src = OUTER[(i - k + 8) % 8];
      out[g] = srcMap[src] || '';
    });
    out['5'] = out[jiGong] || '';
    return out;
  }
  // 飞盘：以 base 宫起，按洛书数字顺飞（含中五）
  function flyPlace(base, items){
    const out = {}; let gi = FLY.indexOf(base); if(gi<0) gi=0;
    items.forEach((it,i)=>{ out[FLY[(gi+i)%9]] = it; });
    return out;
  }
  function flyPlaceOuter(base, items){
    const out = {}; let gi = FLY_OUT.indexOf(base); if(gi<0) gi=0;
    items.forEach((it,i)=>{ out[FLY_OUT[(gi+i)%8]] = it; });
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
  function le(a, b){ // a <= b (按日期)
    const da = solarToDate(a).getTime(), db = solarToDate(b).getTime();
    return da <= db;
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
  // 定局主函数：返回 {type(阳、阴), num, yuanText(上、中/下元), jieQiName}
  function determineJu(solar, school){
    const lunar = solar.getLunar();
    const cj = currentJieqi(solar, lunar);
    const jieQiName = cj.name;
    const jieqiDate = cj.jieqiDate;
    const type = YANG_JIE.has(jieQiName) ? 'yang' : 'yin';
    const triple = JIE_JU[jieQiName];
    let yuanIdx = 0, headDate;
    if(school==='茅山'){
      // 茅山法：交节日即为上元首日
      headDate = jieqiDate;
      yuanIdx = ((dayDiff(headDate, solar)) % 15 + 15) % 15;
      yuanIdx = Math.floor(yuanIdx/5) % 3;
    } else {
      // 拆补 / 传统置闰：以符头(甲己日)定上元
      const hb = findJiaJi(jieqiDate, -1); // 交节前最近甲己日
      const gap = dayDiff(hb, jieqiDate);   // 交节 - 符头
      if(gap <= 4) headDate = hb;           // 正常接气：符头在交节前≤4天
      else headDate = findJiaJi(jieqiDate, +1); // 超神：上元从交节后符头起（拆补）
      let dd = dayDiff(headDate, solar);
      if(dd < 0) dd += 15; // 安全
      yuanIdx = Math.floor(dd/5) % 3;
    }
    const num = triple[yuanIdx];
    const yuanText = ['上元','中元','下元'][yuanIdx];
    return { type, num, yuanIdx, yuanText, jieQiName, jieqiDate };
  }

  /* ---------------- 年家奇门专用局数（全部阴遁，三元180年，甲子基准逐年逆减） ---------------- */
  function determineYearJu(yearGZ, year){
    const n = gzIndex(yearGZ);                       // 年干支在六十甲子序号(0-59)
    let span = (((year - YEAR_EPOCH) % 180) + 180) % 180;  // 距上元甲子年的年数(0-179)
    let yuan = Math.floor(span / 60);                // 0上元 1中元 2下元
    const base = YEAR_YUAN_BASE[yuan];               // 该元甲子年局数(阴1/阴4/阴7)
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
    // 年支定三元（遁甲演義：四孟上元坎1 / 四仲中元兑7 / 四季下元巽4）
    const map = {'寅':'1','申':'1','巳':'1','亥':'1','子':'7','午':'7','卯':'7','酉':'7','辰':'4','戌':'4','丑':'4','未':'4'};
    const base = parseInt(map[yZhi] || '4', 10);
    const yuanText = (base === 1) ? '上元' : (base === 7 ? '中元' : '下元');
    // 月家局数固定为元本（每元管五年，不随月递减）；值符随月干、值使随月支在 buildPan 中重排
    const num = base;
    return { type:'yin', num, yuanText, base, blockYear: blockYearGZ, monthGZ };
  }

  /* ---------------- 日家奇门专用：休门落宫 / 八门 / 九星（与节气的阳阴遁） ---------------- */
  function dayXiuMenGong(dayGZ, type){
    // 依“领头三日组”日干支查休门宫（阳遁序，阴遁取10-宫）
    const g = dayGZ[0], z = dayGZ[1];
    let gong = null;
    if(z === '子')      gong = (['甲','戊','壬'].indexOf(g) >= 0) ? '1' : '6';
    else if(z === '卯') gong = (['丁','辛','乙'].indexOf(g) >= 0) ? '2' : '7';
    else if(z === '午') gong = (['戊','庚','甲'].indexOf(g) >= 0) ? '3' : '8';
    else if(z === '酉') gong = (['癸','丁','辛'].indexOf(g) >= 0) ? '4' : '9';
    else {
      // 非子午卯酉日：归并到其所在三日组的领头(子、卯/午、酉)日再查
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
  function buildDayPan(type, num, dayGZ, method, qinGong){
    const diPan = getDiPan(type, num);
    const liuyi = xunShouLiuYi(dayGZ);
    let zf = ''; for(const g in diPan){ if(!zf && diPan[g] === liuyi && g !== '5'){ zf = g; break; } }
    if(!zf) zf = qinJiGong(qinGong);
    // 日干落宫（天盘值符落宫）
    let luo = ''; for(const g in diPan){ if(diPan[g] === dayGZ[0] && g !== '5'){ luo = g; break; } }
    if(!luo && diPan['5'] === dayGZ[0]) luo = qinJiGong(qinGong);
    if(!luo) luo = zf;
    // 天盘三奇六仪（值符随日干落宫；天盘=地盘外环整体环移，中五寄宫镜像）
    const tianItems = rotateTo(SQ, liuyi);
    const jiGong = qinJiGong(qinGong);
    const tianPan = (method === '飞盘') ? flyPlace(luo, tianItems) : rotateTianPan(zf, luo, diPan, jiGong);
    // 日家八门（休门落宫 + 日干阴阳顺逆）
    const xiuGong = dayXiuMenGong(dayGZ, type);
    const baMen = dayBaMen(dayGZ, xiuGong, type);
    baMen['5'] = '';                                   // 八门不入中五
    // 日家九星（太乙起局）
    const jiuXing = dayJiuXing(dayGZ, type);
    // 八神（值符在日干落宫，阳顺阴逆；沿用时家八神名）
    const luoAs8 = (OUTER.indexOf(luo) >= 0) ? luo : qinJiGong(qinGong);
    const baShen = (method === '飞盘') ? flyPlaceOuter(luoAs8, SHEN) : rotateOuter(luoAs8, SHEN, type);
    // 暗干（从休门落宫起戊，沿外环阳顺阴逆布八宫，中五取寄宫镜像）
    const anItems = SQ;
    let anGan;
    if(method === '飞盘') anGan = flyPlace(xiuGong, anItems);
    else { anGan = rotateOuter(xiuGong, anItems.slice(0,8), type); anGan['5'] = anGan[jiGong] || ''; }
    const zhiFuXing = jiuXing[luo] || '太乙';
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
  function keGanZhi(dayGZ, hour, minute){ // 刻家（简化）：日干推进 floor(时辰/2) 位
    const hh = hour + (minute>=45?1:0);
    const n = Math.floor(hh/2);
    const di = GAN.indexOf(dayGZ[0]), zi = ZHI.indexOf(dayGZ[1]);
    return GAN[(di+n)%10] + ZHI[(zi+n)%12];
  }

  /* ---------------- 四盘排布 ---------------- */
  function buildPan(type, num, drivingGZ, method, over, qinGong){
    over = over || {};
    const diPan = over.diPan || getDiPan(type, num);
    const liuyi = over.xunShouLiuYi || xunShouLiuYi(drivingGZ);
    // 值符宫
    let zf=''; for(const g in diPan){ if(!zf && diPan[g]===liuyi && g!=='5'){ zf=g; break; } }
    if(!zf) zf=qinJiGong(qinGong);   /* 旬首仪落中五：随天禽寄宫（坤二/艮八） */
    const zfXing = over.zhiFuXing || BASIC_XING[zf];
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

    let tianPan, jiuXing, baMen, baShen;
    if(method==='飞盘'){
      tianPan = flyPlace(luo, tianItems);                     // 天盘填满九宫（中宫=中五仪）
      jiuXing = flyPlace(luo, xingItems);                    // 九星填满九宫（中宫=天禽）
      baMen   = flyPlaceOuter(zhiShiGong, menItems);         // 八门八宫外宫顺飞，中五恒空
      baShen  = flyPlaceOuter(luoAs8, SHEN);                 // 八神八宫外宫顺飞，中五恒空
    } else {
      const jiGong = qinJiGong(qinGong);
      tianPan = rotateTianPan(zf, luo, diPan, jiGong);       // 天盘=地盘外环整体环移，中五寄宫镜像
      jiuXing = rotateTianPan(zf, luo, BASIC_XING, jiGong);  // 九星整体环移（中宫=天禽随寄宫镜像）
      baMen   = rotateOuterDir(zhiShiGong, menItems, 1);     // 八门沿外环恒顺时针转盘，中五恒空
      baShen  = rotateOuter(luoAs8, SHEN, type);             // 八神沿外环阳顺阴逆，中五恒空
    }
    // 暗干（隐干）：从值使门落宫起戊，沿外环阳顺阴逆布八宫，中五取寄宫镜像
    const anItems = SQ;
    let anGan;
    if(method==='飞盘') anGan = flyPlace(zhiShiGong, anItems);
    else { anGan = rotateOuter(zhiShiGong, anItems.slice(0,8), type); anGan['5'] = anGan[qinJiGong(qinGong)] || ''; }

    return {
      diPan, tianPan, jiuXing, baMen, baShen, anGan,
      zhiFuGong:zf, zhiFuXing:zfXing, zhiShiGong, zhiShiMen:zfMen,
      zhiShiGongRaw:zsRaw, luoGongGan, xunShou:liuyi, qinGong: qinGong || '坤二'
    };
  }

  /* ---------------- 空亡 / 驿马 ---------------- */
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
    '戊己':'贵人入狱，公私皆不利',
    '戊庚':'值符飞宫，吉事成凶、凶事更烈',
    '戊辛':'青龙折足，招灾失财',
    '戊壬':'青龙入天牢，凡谋不利',
    '戊癸':'青龙华盖，争讼有碍',
    '戊丙':'青龙回首，百事吉昌、通达如意',
    '己己':'地户逢鬼，病者必死、百事不遂',
    '己庚':'刑格，官司受刑，出行尤忌',
    '己辛':'游魂入墓，易遭阴邪怪异',
    '己壬':'地网高张，狡童佚女、奸情伤杀',
    '己癸':'地刑玄武，阴司词讼、病危必死',
    '庚庚':'太白同宫（战格），官事争斗、兄弟失和',
    '庚辛':'太白重锋，防盗失财、夫妻离散',
    '庚壬':'小格（幼失兄长），谋事多变',
    '庚癸':'大格，出行官司、车马阻塞',
    '庚丙':'太白入荧，贼必来、防奸细',
    '庚丁':'亭亭之格，因私昵招讼、门吉稍安',
    '辛辛':'伏吟天庭，公废私就、讼狱自罹',
    '辛壬':'凶蛇入狱，争讼不息、先动失理',
    '辛癸':'天牢华盖，日月失明、误入天网',
    '辛丙':'干合孛师，荧惑出现在什么，门户破败、小人陷害',
    '辛丁':'狱神得奇，经商获倍利、囚人赦罪',
    '壬壬':'蛇入地网，外事缠绕、内事不定',
    '壬癸':'幼女奸淫，家丑外扬、门吉星凶',
    '壬丙':'水蛇入火，官灾刑禁、络绎不绝',
    '壬丁':'干合蛇刑，文书牵连、贵人匆匆',
    '癸癸':'天网四张，重临休废则殃、闭口藏身',
    '癸壬':'复见腾蛇，嫁娶重婚、后嫁无子',
    '癸丙':'华盖孛师，贵贱逢之皆不利',
    '癸丁':'腾蛇夭矫，文书官司、火惊怪异',
    '乙乙':'日奇伏吟，不宜见贵求名、只宜守分',
    '乙丙':'奇仪顺遂，吉星迁官进职、凶星夫妻离别',
    '乙丁':'奇仪相佐，最利文书、百事可为',
    '乙戊':'利阴害阳，门吉尚可、门凶破财',
    '乙己':'日奇入雾，被土暗昧、门凶必凶',
    '乙庚':'日奇被刑，争讼财产、夫妻怀私',
    '乙辛':'青龙逃走，奴仆拐带、六畜皆伤',
    '乙壬':'日奇入地，尊卑悖乱、官讼是非',
    '乙癸':'日奇入地网，宜退避、讼狱亏',
    '丙丙':'月奇悖师，文书逼迫、破耗遗失',
    '丙丁':'星奇逢朱雀，文章贵人、平步青云',
    '丙戊':'飞鸟跌穴，谋为百事吉、入官得高升',
    '丙己':'火孛入刑，囚人刑杖、文书不行',
    '丙庚':'荧惑太白，营私谋害、门吉犹安',
    '丙辛':'月奇相合，谋事成就、病人不凶',
    '丙壬':'火入天罗，为客不利、是非颇多',
    '丙癸':'月奇地网，阴人害事、灾祸频生',
    '丁丁':'奇入太阴，文书即至、喜事遂心',
    '丁戊':'青龙转光，官人升迁、常人威昌',
    '丁己':'火入勾陈，奸私仇冤、事因女人',
    '丁庚':'星奇受阻，文书阻隔、行人必归',
    '丁辛':'朱雀入狱，罪人释囚、求谋反失',
    '丁壬':'五神互合，贵人思诏、诉事得理',
    '丁癸':'朱雀投江，文状口舌、音信沉溺'
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
    // 入墓
    for(const g in pan.tianPan){
      const t = pan.tianPan[g];
      if(RUMU[t]===g) push(`${t}入墓（${GONG_NAME[g]}宫）`, 'xiong', `${t}落${GONG_NAME[g]}宫入库，气闷无力`, '《烟波钓叟歌》三奇入墓好思推');
    }
    // 伏吟 / 反吟（天盘干 vs 地盘干）
    let fuYin=0, fanYin=0;
    ['1','2','3','4','6','7','8','9'].forEach(g=>{
      const t=pan.tianPan[g], d=pan.diPan[g];
      if(t===d) fuYin++;
      else if(duichong(t,d)) fanYin++;
    });
    if(fuYin>=6) push('天盘伏吟','xiong','天盘干与地盘干多宫相同，宜静守、动则破财','《烟波钓叟歌》就中伏吟最为凶');
    if(fanYin>=6) push('天盘反吟','xiong','天盘干与地盘干多宫对冲，反复不定、宜守不宜攻','《烟波钓叟歌》天蓬若到天英上，须知即是反吟宫');
    // 九星伏吟：九星皆回本位（值符未转动时成立）
    let xingFu=true;
    ['1','2','3','4','6','7','8','9'].forEach(g=>{ if(pan.jiuXing[g]!==BASIC_XING[g]) xingFu=false; });
    if(xingFu) push('九星伏吟','xiong','九星皆回本位，静则吉、动则凶','《烟波钓叟歌》就中伏吟最为凶');
    // 五不遇时：时干克日干 且 同阴阳
    const dg=dayGZ[0], tg=timeGZ[0];
    if(KE[GAN_WX[dg]]===GAN_WX[tg] && GAN_YANG.has(dg)===GAN_YANG.has(tg))
      push('五不遇时','xiong','时干克日干且同阴阳，百事皆凶','《烟波钓叟歌》五不遇时龙不精');
    // 庚金四柱格（仅时家）：天盘庚与地盘年、月/日、时干同宫；飞干格为天盘日干加地盘庚
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
    // 三奇得使 / 玉女守门：三奇落值使门宫
    const zs = pan.zhiShiGong;
    ['乙','丙','丁'].forEach(qi=>{
      for(const g in pan.tianPan){ if(pan.tianPan[g]===qi && g===zs){
        if(qi==='丁') push('玉女守门','ji','丁奇临值使门，利嫁娶、阴私和合','《烟波钓叟歌》号为玉女守门扉');
        else push(`${qi}奇得使`,'ji',`${qi}奇临值使门（${GONG_NAME[zs]}宫），凡事皆宜`,'《烟波钓叟歌》三奇得使诚堪使');
      }}
    });
    // 天显时格（六甲时，天盘值符与地盘同）
    if('甲'.indexOf(timeGZ[0])>=0){
      let same=true; ['1','2','3','4','6','7','8','9'].forEach(g=>{ if(pan.tianPan[g]!==pan.diPan[g]) same=false; });
      if(same) push('天显时格','ji','六甲时，伏吟安妥，出兵安营大吉','《奇门遁甲统宗》天显时格');
    }
    // 三奇升殿（三奇临本殿之宫）：乙→震3、丙→离9、丁→兑7
    const SHENGDIAN = {'乙':'3','丙':'9','丁':'7'};
    ['乙','丙','丁'].forEach(qi=>{
      const g = SHENGDIAN[qi];
      if(pan.tianPan[g]===qi) push(`${qi}奇升殿（${GONG_NAME[g]}宫）`,'ji',`${qi}奇临${GONG_NAME[g]}宫升殿，百事可为、威权显赫`,'《奇门遁甲统宗》三奇贵人升殿');
    });
    // 九遁：三奇 + 吉门 + 八神、宫位组合。不同流派细节略有出入，此处采主流《神奇之门》组合，主吉。
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
    if(dunQiMenShen('丁','休门','九地') || dunQiMenShen('丁','杜门','九地')) push('鬼遁','ji','丁奇+休、杜门+九地，宜偷营伏击、探秘隐事','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    ['开门','休门','生门'].forEach(m=>{
      if(dunQiMenAt('乙',m,'4')) push('风遁','ji',`乙奇+${m}+巽四宫（风），宜顺风行事、传播声扬`,'《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
      if(dunQiMenAt('乙',m,'2')) push('云遁','ji',`乙奇+${m}+坤二宫（云），宜藏兵掩袭、暗度陈仓`,'《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
      if(dunQiMenAt('乙',m,'1')) push('龙遁','ji',`乙奇+${m}+坎一宫（水），宜涉水舟船、布雨济人`,'《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    });
    if(dunQiMenAt('乙','生门','8')) push('虎遁','ji','乙奇+生门+艮八宫（山），宜据险伏兵、固守得利','《烟波钓叟歌》风云龙虎并鬼神，始知九遁能为用');
    return geju;
  }
  function duichong(a,b){
    const pa={'戊':'己','己':'戊','庚':'辛','辛':'庚','壬':'癸','癸':'壬','乙':'丙','丙':'乙','甲':'庚','庚':'甲'};
    return pa[a]===b;
  }

  /* ---------------- 用神 + 综合断语 ---------------- */
  function buildAnalysis(pan, purpose, type, num, school, kongZhiText, family, yearGZ){
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
    const healthStar = (family === '日家') ? '天符' : '天芮';
    const USE={
      '综合':{g:pan.zhiFuGong,l:'值符（总体）'},
      '事业':{g:gongOf(pan.baMen,'开门'),l:'开门（事业）'},
      '财运':{g:gongOf(pan.baMen,'生门'),l:'生门（财运）'},
      '婚姻':{g:gongOf(pan.baMen,'休门'),l:'休门（婚姻）'},
      '健康':{g:gongOf(pan.jiuXing,healthStar),l:(family==='日家'?'天符（病符）':'天芮（病星）')},
      '学业':{g:gongOf(pan.baMen,'景门'),l:'景门（学业）'},
      '出行':{g:gongOf(pan.baMen,'伤门'),l:'伤门（出行）'},
      '失物':{g:gongOf(pan.baShen,'六合'),l:'六合（失物）'}
    };
    const use=USE[purpose]||USE['综合'];
    const uG=use.g||pan.zhiFuGong;
    const sugs=[];
    sugs.push({cat:'用神定位', text:`用神【${purpose}】看${use.l}所落${GONG_NAME[uG]}宫：星${pan.jiuXing[uG]||'无'}、门${pan.baMen[uG]||'无'}、神${pan.baShen[uG]||'无'}，吉凶：${JXCN[jg[uG]?jg[uG].jiXiong:'平']}。`});
    /* 年命用神：求测人生年天干落宫（兼看地盘/天盘），断其宫位吉凶与事体关联 */
    if(yearGZ && yearGZ.length>=1){
      let yg=yearGZ[0];
      // 年命天干若是甲（遁甲不显宫），映射为六仪（甲子→戊、甲戌→己…）
      if(yg==='甲' && yearGZ.length>=2) yg = XUNSHOU_LIUYI['甲'+yearGZ[1]] || yg;
      const yGong = gongOf(pan.tianPan, yg) || gongOf(pan.diPan, yg);
      if(yGong){
        sugs.push({cat:'年命用神', text:`年命【${yearGZ}】（${yg}）落${GONG_NAME[yGong]}宫：星${pan.jiuXing[yGong]||'无'}、门${pan.baMen[yGong]||'无'}、神${pan.baShen[yGong]||'无'}，吉凶：${JXCN[jg[yGong]?jg[yGong].jiXiong:'平']}，主此命在局中动静喜忌。`});
      }
    }
    /* 婚姻双用神（乙庚）：测婚姻兼看乙（女方）、庚（男方）落宫与吉凶 */
    if(purpose==='婚姻'){
      const yiG=gongOf(pan.tianPan,'乙')||gongOf(pan.diPan,'乙');
      const gengG=gongOf(pan.tianPan,'庚')||gongOf(pan.diPan,'庚');
      if(yiG) sugs.push({cat:'婚姻乙庚', text:`婚姻看乙（女方）落${GONG_NAME[yiG]}宫，星门神${JXCN[jg[yiG]?jg[yiG].jiXiong:'平']}。`});
      if(gengG) sugs.push({cat:'婚姻乙庚', text:`庚（男方）落${GONG_NAME[gengG]}宫，星门神${JXCN[jg[gengG]?jg[gengG].jiXiong:'平']}，乙庚二宫生克定姻缘和合。`});
    }
    ['开门','生门','休门','景门'].forEach(mn=>{ const g=gongOf(pan.baMen,mn); if(g) sugs.push({cat:'吉门分布', text:`吉门${mn}落${GONG_NAME[g]}宫（${JXCN[jg[g].jiXiong]}），主${mn==='开门'?'事业开创':mn==='生门'?'财源生发':mn==='休门'?'婚姻休养':'文书名声'}。`}); });
    ['伤门','杜门','死门','惊门'].forEach(mn=>{ const g=gongOf(pan.baMen,mn); if(g) sugs.push({cat:'凶门分布', text:`凶门${mn}落${GONG_NAME[g]}宫（${JXCN[jg[g].jiXiong]}），宜谨慎守静、勿妄动。`}); });
    ['白虎','玄武','螣蛇'].forEach(sn=>{ const g=gongOf(pan.baShen,sn); if(g) sugs.push({cat:'凶神临宫', text:`凶神${sn}临${GONG_NAME[g]}宫，防是非、损耗或虚惊。`}); });
    sugs.push({cat:'值符值使', text:`值符落${GONG_NAME[pan.zhiFuGong]}宫，百煞潜藏；值使${pan.zhiShiMen}落${GONG_NAME[pan.zhiShiGong]}宫。`});
    if(kongZhiText) sugs.push({cat:'空亡影响', text:`空亡${kongZhiText}，所临之宫吉凶减半、事多虚浮，行事宜留余地。`});
    let ji=0,xiong=0,ping=0; ['1','2','3','4','6','7','8','9'].forEach(g=>{ const j=jg[g].jiXiong; if(j==='吉')ji++; else if(j==='凶')xiong++; else ping++; });
    const docSchool = school==='茅山'?'茅山法交节日上元':(school==='传统'?'置闰法起局 拆补近似':'拆补法起局');
    const overall=`${type==='yang'?'阳遁':'阴遁'}${num}局（${docSchool}）：用神【${purpose}】在${GONG_NAME[uG]}宫，八宫${ji}吉${xiong}凶${ping}平，星门神综合以${ji>=xiong?'吉':'凶'}论为主，详见下式九宫。`;
    return { jiuGongAnalysis:jg, overallJiXiongText:overall, suggestions:sugs };
  }

  /* ---------------- 主入口 ---------------- */
  function calculate(date, opts){
    opts = opts || {};
    const family = opts.family || '时家';
    const method = opts.method || '转盘';
    const school = opts.school || '传统';
    const purpose = opts.purpose || '综合';
    const y=date.getFullYear(), mo=date.getMonth()+1, d=date.getDate(), h=date.getHours(), mi=date.getMinutes();
    const solar = Solar.fromYmd(y,mo,d), lunar = solar.getLunar();
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
      juMeta = { yuan: mj.yuanText, base: mj.base };
    } else if(family==='日家'){
      // 日家专用局数：阳遁1/7/4、阴遁9/3/6（按节气二至分阳阴遁、六十日一局近似）；八门、九星另用日家本系统
      const dayType = type0;                            // 冬至~芒种阳遁、夏至~大雪阴遁
      const BLOCK = (dayType === 'yang') ? [1,7,4] : [9,3,6];
      const dn = gzIndex(dayGZ);
      const bi = Math.floor((dn % 60) / 20) % 3;        // 六十日三局循环近似（上、中/下）
      num = BLOCK[bi]; yuanText = ['上元','中元','下元'][bi];
      type = dayType; jieQiName = '日家 '+dayGZ;
      juMeta = { dayType };
    } else if(family==='刻家'){
      // 刻家：后人所创，无统一专用局数表；唯一可据者为时家节气三元局，配刻干支驱动（学界通行近似）
      num = ju.num; yuanText = ju.yuanText; jieQiName = ju.jieQiName;
      juMeta = { note: '刻家无独立局数表，采用时家节气三元局配刻干支驱动' };
    }

    // 四盘
    let pan;
    if(family==='日家'){
      pan = buildDayPan(type, num, dayGZ, method, opts.qinGong);
    } else {
      pan = buildPan(type, num, drivingGZ, method, {}, opts.qinGong);
    }
    // 驱动干落宫（用于八神、天盘落宫定位）
    const luo = (function(){ let g=''; for(const k in pan.diPan){ if(pan.diPan[k]===drivingGZ[0] && k!=='5'){ g=k; break; } } if(!g && pan.diPan['5']===drivingGZ[0]) g=qinJiGong(opts.qinGong); if(!g) g=pan.zhiFuGong; return g; })();

    // 空亡 / 驿马
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

    // 格局（日家无独立格局体系，沿用天盘、门/神通用格局供参考）
    const geju = detectGeju(pan, dayGZ, timeGZ, type, siZhu, family);

    // 分析 + 用神
    const kongZhiText = kw.zhi.join('、');
    const analysis = buildAnalysis(pan, purpose, type, num, school, kongZhiText, family, opts.birthGZ);

    // 每宫吉凶 兼并 门迫、星旺 等信息进 jiuGongAnalysis
    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const a = analysis.jiuGongAnalysis[g] || (analysis.jiuGongAnalysis[g]={jiXiong:'平'});
      a.menRel = gongDetail[g].menRel;
      a.xingWang = gongDetail[g].xingWang;
      a.keYing = gongDetail[g].keYing;
      a.keYingSrc = gongDetail[g].keYingSrc;
    });

    const fullName = `${type==='yang'?'阳遁':'阴遁'}${num}局（${yuanText}）`;
    return {
      family, method, school,
      siZhu,
      juShu: { yuan: (type==='yang'?'阳遁':'阴遁')+yuanText, jieQiName, fullName, num, type, juMeta },
      xunShou: pan.xunShou, luoGongGan: drivingGZ[0], qinGong: pan.qinGong || '坤二',
      zhiFuGong: pan.zhiFuGong, zhiFuXing: pan.zhiFuXing,
      zhiShiGong: pan.zhiShiGong, zhiShiMen: pan.zhiShiMen,
      xingSystem: (family==='日家') ? '日家九星（太乙、摄提、轩辕、招摇、天符、青龙、咸池、太阴、天乙）' : '时家九星（天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英）',
      diPan: pan.diPan, tianPan: pan.tianPan, jiuXing: pan.jiuXing,
      baMen: pan.baMen, baShen: pan.baShen, anGan: pan.anGan,
      kongWangGong: Array.from(new Set(kw.gong)), kongWangZhi: kw.zhi, maStar: ma,
      jiuGongAnalysis: analysis.jiuGongAnalysis,
      geju,
      analysis: { overallJiXiongText: analysis.overallJiXiongText, suggestions: analysis.suggestions }
    };
  }

  /* ---------------- 山向奇门专用入口（道家阴盘山向体系） ---------------- */
  // 输入：{ shan (坐山), xiang (向山，默认坐山对宫), yearGZ (用事年干支),
  //         yuanIdx (0上元/1中元/2下元，或-1自动按度数), degree (可选度数),
  //         method ('转盘'/'飞盘'), purpose ('综合') }
  // 返回：与 calculate 同构的 pan 对象（含九宫盘、格局、分析等）
  function calculateShanXiang(opts){
    opts = opts || {};
    const shan = opts.shan || '子';
    const xiang = opts.xiang || shanOpposite(shan);
    const yearGZ = opts.yearGZ || '甲子';
    const method = opts.method || '转盘';
    const purpose = opts.purpose || '综合';
    const SHAN_JU_DATA = SHAN_JU;  // 引用顶层数据

    // 1. 阴阳遁：亥至巽为阳局（315°~134°），巳至乾为阴局（135°~314°）
    const shanIdx = SHAN_ORDER.indexOf(shan);
    const isYang = (shanIdx >= 0 && shanIdx < 12) ? true : false;  // 0-11: 壬~巳(阳) 12-23: 丙~亥(阴)
    const type = isYang ? 'yang' : 'yin';

    // 2. 定局数：按坐山三元局数表取段
    const juTbl = SHAN_JU_DATA[shan] || [1,7,4];
    let yuanIdx = opts.yuanIdx;
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
    const pan = buildPan(type, num, drivingGZ, method, {}, opts.qinGong);
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

    // 格局（山向沿用通用格局体系）
    const siZhu = { year:yearGZ, month:yearGZ, day:dayGZ, time:drivingGZ };
    const geju = detectGeju(pan, dayGZ, drivingGZ, type, siZhu, '时家');

    // 分析
    const kongZhiText = kw.zhi.join('、');
    const analysis = buildAnalysis(pan, purpose, type, num, '山向', kongZhiText, '时家', opts.yearGZ);

    ['1','2','3','4','5','6','7','8','9'].forEach(g=>{
      const a = analysis.jiuGongAnalysis[g] || (analysis.jiuGongAnalysis[g]={jiXiong:'平'});
      a.menRel = gongDetail[g].menRel;
      a.xingWang = gongDetail[g].xingWang;
      a.keYing = gongDetail[g].keYing;
      a.keYingSrc = gongDetail[g].keYingSrc;
    });

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
      analysis: { overallJiXiongText: analysis.overallJiXiongText, suggestions: analysis.suggestions },
      shanXiang: { shan, xiang, shanIdx, yuanIdx, yearGZ, drivingGZ }
    };
  }

  global.Qimen = { calculate, calculateShanXiang, SHAN_ORDER, SHAN_JU, shanOpposite, wuShuDun };
})(typeof window !== 'undefined' ? window : this);
