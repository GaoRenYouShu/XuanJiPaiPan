/* ============================================================
   专业择日增强引擎 zeri-engine.js  (window.ZERI)
   【定源体例】对齐 fengshui-engine.js：各算法块以【定源】注明典籍依据与可校验锚点；
   神煞以《协纪辨方书》义例为纲（《選擇紀要》歌诀同源互校）、日课格局以通书通行例；
   流派分歧处注明本页取舍；权重与分档为本站归纳者如实标注，不冒典籍。
   依赖全局（app.js / bazi-data.js / lunar.js）：
     GAN_WX ZHI_WX WX_SHENG WX_KE CHONG JU_OF LIUHE
     TIANYI YIMA YUEDE_TG YUEDE_HE TIANDE LU WENCHANG
     nayinOf NAYIN_INFO pillarSha wuShuDun ZHI_ORDER YANG
     pairIn DIZHI_XING DIZHI_HAI
   本文件不重复声明常量，仅做择日专用组合与判定。
   ============================================================ */
(function(){
  // ---- 【定源】二十四山本气地支（《罗经》地盘正针通行例，八干四维随双山取本气）----
  // ---- 用于坐山补龙扶山、神煞到山；子癸同旺、艮寅同局之类皆双山同气 ----
  const SHAN_ZHI = {
    '子': '子','癸': '子','丑': '丑','艮': '丑','寅': '寅','甲': '寅','卯': '卯','乙': '卯',
    '辰': '辰','巽': '辰','巳': '巳','丙': '巳','午': '午','丁': '午','未': '未','坤': '未',
    '申': '申','庚': '申','酉': '酉','辛': '酉','戌': '戌','乾': '戌','亥': '亥','壬': '亥'
  };
  const SHAN_LIST = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];

  // ---- 地支→八卦方位（太岁方位提示用，与 zeri.html 同源）----
  const ZHI_BAGUA = {'子':'北','丑':'东北','寅':'东北','卯':'东','辰':'东南','巳':'东南','午':'南','未':'西南','申':'西南','酉':'西','戌':'西北','亥':'西北'};
  const CHONG = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
  /* 【定源】三煞（劫煞灾煞岁煞，《协纪辨方书》义例）：申子辰年煞在南方（巳午未）、
     寅午戌年煞在北方（亥子丑）、巳酉丑年煞在东方（寅卯辰）、亥卯未年煞在西方（申酉戌），
     阳年顺布取三支占方；到山到向忌动土修造，安葬尤忌。
     锚点：子年三煞巳午未、午年三煞亥子丑。 */
  const SANSHA = {
    '申':['巳','午','未','南'],'子':['巳','午','未','南'],'辰':['巳','午','未','南'],
    '寅':['亥','子','丑','北'],'午':['亥','子','丑','北'],'戌':['亥','子','丑','北'],
    '亥':['申','酉','戌','西'],'卯':['申','酉','戌','西'],'未':['申','酉','戌','西'],
    '巳':['寅','卯','辰','东'],'酉':['寅','卯','辰','东'],'丑':['寅','卯','辰','东']
  };
  const ZHI_HOUR = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  /* 【定源】天德合（《协纪辨方书》义例篇天德表之合干）：正月丁合壬、二月坤合巽以支代……
     六合取化气，与天德同例解凶。 */
  const TIANDE_HE = {'丁':'壬','壬':'丁','辛':'丙','丙':'辛','癸':'戊','戊':'癸','甲':'己','己':'甲','乙':'庚','庚':'乙'};

  // ---- 事类族（用事法则切换核心）----
  // fangSha: 是否扣方位煞（三煞、岁破、太岁到山）；nayin: 是否看本命年命纳音相主
  const FAMILY = {
    jiahun:  {name:'嫁娶安床族', fangSha:false, nayin:true,  desc:'嫁娶、订婚、纳采、安床。重天喜、三合、六合、天德月德；忌四离四绝、杨公忌、红沙、孤鸾；并看嫁娶、安床周堂。'},
    zaozang: {name:'造葬动土族', fangSha:true,  nayin:true,  desc:'动土、修造、安葬、破土。重补龙扶山、坐山得地；三煞、岁破、太岁到山大凶，须有制神方可化；重本命年命纳音相主。'},
    kaishi:  {name:'开市交易族', fangSha:false, nayin:false, desc:'开市、开业、交易、纳财、立券、签约、置产。重成日开日、三合六合、天德月德。'},
    chuxing: {name:'出行移徙族', fangSha:false, nayin:false, desc:'出行、入宅、移徙、搬家。重三合六合、天德月德、驿马（利行）；忌往亡、归忌。'},
    jisi:    {name:'祭祀祈福族', fangSha:false, nayin:false, desc:'祭祀、祈福、求医。重天德月德、天赦；忌四废、十恶大败。'},
    tongyong:{name:'通用',       fangSha:false, nayin:false, desc:'通用择吉，不专属神煞体系。'}
  };
  const FAMILY_OF = {
    '嫁娶':'jiahun','订婚':'jiahun','纳采':'jiahun','安床':'jiahun','裁衣':'jiahun','冠笄':'jiahun',
    '动土':'zaozang','安葬':'zaozang','破土':'zaozang','装修':'zaozang','修造':'zaozang','安门':'zaozang','上梁':'zaozang','竖柱':'zaozang',
    '开市':'kaishi','开业':'kaishi','交易':'kaishi','纳财':'kaishi','求财':'kaishi','立券':'kaishi','签约':'kaishi','置产':'kaishi',
    '出行':'chuxing','入宅':'chuxing','移徙':'chuxing','搬家':'chuxing','安香':'chuxing','出火':'chuxing',
    '祭祀':'jisi','祈福':'jisi','求医':'jisi'
  };
  // 周堂类型（按事件细分）
  const ZT_OF = {'嫁娶':'jia','订婚':'jia','纳采':'jia','安床':'an','入宅':'yi','移徙':'yi','搬家':'yi','出行':'yi'};

  // ---- 神煞吉凶分类 ----
  const JI_SET = new Set(['天乙贵人','文昌贵人','禄神','太极贵人','福星贵人','天厨贵人','词馆','国印贵人','暗禄','德秀贵人','驿马','华盖','将星','天医','天德贵人','月德贵人','天德合','月德合','三奇贵人','天喜','红鸾','金舆','学堂','天赦']);
  // 注：月令丛辰（月破、归忌、往亡、五虚、红沙、劫煞、灾煞、死气、四废 等）属择日专属体系，
  // 择日凶神在 zeriSha 中独立计算，故不放入八字 XIONG_SET，避免重复计分。
  const XIONG_SET = new Set(['羊刃','飞刃','血刃','流霞','红艳煞','孤辰','寡宿','丧门','吊客','破碎煞','勾煞','绞煞','天罗','地网','亡神','十恶大败','八专','九丑','孤鸾','阴差阳错','童子','受死','魁罡','金神']);

  // 神煞权重（加分、减分基础值）
  /* 【定源】神煞权重（SHA_W/XIONG_MUL，本站归纳量值）：吉煞加分、凶煞乘数皆本站拟定档位，
     神煞名录与吉凶属性依《协纪辨方书》义例；权重不冒典籍，仅作排序参考。 */
  const SHA_W = {
    '天德贵人':6,'月德贵人':6,'天德合':4,'月德合':4,'天乙贵人':5,'驿马':3,'三奇贵人':5,
    '天赦':8,'天喜':8,'德秀贵人':3,'华盖':2,'将星':2,'文昌贵人':2,'禄神':2,'金舆':2,
    '十恶大败':10,'孤鸾':6,'八专':4,'九丑':4,'阴差阳错':4,'四废':8,'童子':3,
    '归忌':6,'往亡':8,'破碎煞':4,'丧门':5,'吊客':5,'寡宿':4,'孤辰':4,'红艳煞':3,
    '羊刃':4,'劫煞':4,'灾煞':4,'亡神':4,'月破':10,'红沙':6,'受死':5,'死气':3,'五虚':3,'魁罡':5,'金神':4
  };
  // 凶神按事类的强调倍率
  const XIONG_MUL = {
    jiahun:  {'孤鸾':2,'红沙':1.5,'阴差阳错':1.5},
    zaozang: {'十恶大败':1.5,'八专':1.5,'四废':1.5,'月破':1.5},
    chuxing: {'往亡':1.5,'归忌':1.5},
    jisi:    {'四废':1.5,'十恶大败':1.5},
    kaishi:  {'孤鸾':0,'红沙':1},
    tongyong:{}
  };

  // ---- 【定源】日课神煞（bazi-data.js pillarSha 按日柱取，本表补天德月德天德合月德合；
  //        神煞义例均出《协纪辨方书》义例篇，歌诀与《選擇紀要》同源）----
  // ---- 锚点：寅月天德丁、月德丙（寅午戌月德丙）；甲日贵人丑未（甲戊庚牛羊）----
  function dayShensha(dayGan, dayZhi, monthGan, monthZhi, yearGan, yearZhi, timeGan, timeZhi){
    const gans = [yearGan, monthGan, dayGan, timeGan];
    const ctx = {dayGan, monthGan, yearZ:yearZhi, monthZ:monthZhi, dayZ:dayZhi, gans};
    const list = pillarSha({gz:dayGan+dayZhi, z:dayZhi, lbl:'日', isDay:true}, ctx);
    const ji = [], xiong = [];
    list.forEach(n=>{ if(JI_SET.has(n)) ji.push(n); else if(XIONG_SET.has(n)) xiong.push(n); });
    // 天德、月德（月支起，临日干支）
    const td = TIANDE[monthZhi];
    if(td){ if(GAN_WX[td]!==undefined){ if(dayGan===td||dayZhi===td) ji.push('天德贵人'); } else if(dayZhi===td) ji.push('天德贵人'); }
    const yd = YUEDE_TG[monthZhi];
    if(yd && (dayGan===yd||dayZhi===yd)) ji.push('月德贵人');
    const th = TIANDE_HE[td]; if(th && (dayGan===th||dayZhi===th)) ji.push('天德合');
    const yh = YUEDE_HE[yd]; if(yd && yh && (dayGan===yh||dayZhi===yh)) ji.push('月德合');
    return {all: Array.from(new Set(list.concat(ji)), x=>(x)), ji: Array.from(new Set(ji)), xiong: Array.from(new Set(xiong))};
  }

  /* ============ 择日专属丛辰（协纪辨方书 量级）============
     与八字神煞严格隔离：本组只依据 月支、日支、日干、月干、建除值神、黄黑道值神、农历日
     推算“月令丛辰 + 建除、黄道附神 + 农历日凶神”，绝不调用 pillarSha，亦不读取任何八字神煞。
     返回 {ji:[], xiong:[]}（择日专用神煞名，与八字神煞分别展示、分别计分）。 */
  const _MJ_Z = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑']; // 月支索引 0..11
  function _mIdx(z){ const i = ZHI_ORDER.indexOf(z); return (i-2+12)%12; }
  function _ju(z){ return JU_OF[z] || ''; }
  function _season(i){ return i<3?'春':i<6?'夏':i<9?'秋':'冬'; }
  // == 月令丛辰表（按 _mIdx 0..11 = 寅..丑）==
  const ZR_YUEYAN = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥']; // 月厌(地火)
  const ZR_WANGWANG= ['寅','丑','子','亥','戌','酉','申','未','午','巳','辰','卯']; // 往亡
  const ZR_GUIJI   = ['丑','寅','子','丑','寅','子','丑','寅','子','丑','寅','子']; // 归忌(孟丑、仲寅、季子)
  const ZR_JIUJIAO = ['辰','卯','寅','丑','子','亥','戌','酉','申','未','午','巳']; // 九焦、九坎
  const ZR_TUFU    = ['丑','巳','酉','寅','午','戌','卯','未','亥','辰','申','子']; // 土符
  const ZR_FEILIAN = ['戌','巳','午','未','寅','卯','辰','亥','子','丑','申','酉']; // 飞廉(大煞)
  const ZR_TIANZEI = ['丑','子','亥','戌','酉','申','未','午','巳','辰','卯','寅']; // 天贼
  const ZR_XUEJI   = ['丑','未','寅','申','卯','酉','辰','戌','巳','亥','午','子']; // 血忌
  const ZR_BINGJIN = ['寅','子','戌','申','午','辰','寅','子','戌','申','午','辰']; // 兵禁
  const ZR_TIANCANG= ['寅','丑','子','亥','戌','酉','申','未','午','巳','辰','卯']; // 天仓
  const ZR_YANGDE  = ['戌','子','寅','辰','午','申','戌','子','寅','辰','午','申']; // 阳德
  const ZR_YINDE   = ['酉','未','巳','卯','丑','亥','酉','未','巳','卯','丑','亥']; // 阴德
  const ZR_TIANMA  = ['午','申','戌','子','寅','辰','午','申','戌','子','寅','辰']; // 天马
  const ZR_YAOAN   = ['寅','申','卯','酉','辰','戌','巳','亥','午','子','未','丑']; // 要安
  const ZR_YUYU    = ['卯','酉','辰','戌','巳','亥','午','子','未','丑','申','寅']; // 玉宇
  const ZR_JINTANG = ['辰','戌','巳','亥','午','子','未','丑','申','寅','酉','卯']; // 金堂
  const ZR_JINGAN  = ['未','丑','申','寅','酉','卯','戌','辰','亥','巳','子','午']; // 敬安
  const ZR_PUHU    = ['申','寅','酉','卯','戌','辰','亥','巳','子','午','丑','未']; // 普护
  const ZR_FUSHENG = ['酉','卯','戌','辰','亥','巳','子','午','丑','未','寅','申']; // 福生
  const ZR_SHENGXIN= ['亥','巳','子','午','丑','未','寅','申','卯','酉','辰','戌']; // 圣心
  const ZR_YIHOU   = ['子','午','丑','未','寅','申','卯','酉','辰','戌','巳','亥']; // 益后
  const ZR_XUSH    = ['丑','未','寅','申','卯','酉','辰','戌','巳','亥','午','子']; // 续世
  // 三合局 → 地支（劫煞、灾煞、月煞、大时、天吏、临日、五富、月空）
  const ZR_JU_MAP = {
    '火':{jie:'亥',zai:'子',sha:'戌',da:'卯',li:'酉',lin:'午',fu:'亥',kong:'壬'},
    '水':{jie:'巳',zai:'午',sha:'辰',da:'酉',li:'卯',lin:'子',fu:'巳',kong:'丙'},
    '木':{jie:'申',zai:'酉',sha:'未',da:'子',li:'午',lin:'卯',fu:'寅',kong:'庚'},
    '金':{jie:'寅',zai:'卯',sha:'丑',da:'午',li:'子',lin:'酉',fu:'申',kong:'甲'}
  };
  const ZR_YUEEN = {寅:'丙',卯:'丁',辰:'庚',巳:'己',午:'戊',未:'辛',申:'壬',酉:'癸',戌:'庚',亥:'乙',子:'甲',丑:'辛'};
  const ZR_MUCANG = {春:['亥','子'],夏:['寅','卯'],秋:['辰','戌','丑','未'],冬:['申','酉']};
  const ZR_SIXIANG = {春:['丙','丁'],夏:['戊','己'],秋:['壬','癸'],冬:['甲','乙']};
  const ZR_SHIDE  = {春:'午',夏:'辰',秋:'子',冬:'寅'};
  const ZR_WANG   = {春:'寅',夏:'巳',秋:'申',冬:'亥'};
  const ZR_GUAN   = {春:'卯',夏:'午',秋:'酉',冬:'子'};
  const ZR_SHOU   = {春:'酉',夏:'子',秋:'卯',冬:'午'};
  const ZR_XIANG  = {春:'巳',夏:'申',秋:'亥',冬:'寅'};
  const ZR_MIN    = {春:'午',夏:'酉',秋:'子',冬:'卯'};
  const ZR_WUXU   = {春:['巳','酉','丑'],夏:['申','子','辰'],秋:['亥','卯','未'],冬:['寅','午','戌']};
  const ZR_SIJI   = {春:'甲子',夏:'丙子',秋:'庚子',冬:'壬子'};
  const ZR_SIQIONG= {春:'乙亥',夏:'丁亥',秋:'辛亥',冬:'癸亥'};
  const ZR_SIFEI  = {春:['庚申','辛酉'],夏:['壬子','癸亥'],秋:['甲寅','乙卯'],冬:['丙午','丁巳']};
  const ZR_BINGJI = {0:['子','丑','寅','卯'],1:['亥','子','丑','寅'],2:['戌','亥','子','丑'],3:['酉','戌','亥','子'],4:['申','酉','戌','亥'],5:['未','申','酉','戌'],6:['午','未','申','酉'],7:['巳','午','未','申'],8:['辰','巳','午','未'],9:['卯','辰','巳','午'],10:['寅','卯','辰','巳'],11:['丑','寅','卯','辰']};
  const ZR_YUEHAI = {寅:'巳',卯:'辰',辰:'卯',巳:'寅',午:'丑',未:'子',申:'亥',酉:'戌',戌:'酉',亥:'申',子:'未',丑:'午'};
  const ZR_YUEXING= {寅:'巳',卯:'子',辰:'辰',巳:'申',午:'午',未:'丑',申:'寅',酉:'酉',戌:'未',亥:'亥',子:'卯',丑:'戌'};
  const ZR_HE = {甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  const ZR_TIANEN = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉'];
  const ZR_BINGYI = ['戊','己','庚','辛','壬','癸']; // 六仪
  const ZR_JIANFU = {
    '除':{ji:['吉期','兵宝']},'满':{ji:['天巫','福德']},'定':{ji:['时阴']},
    '成':{ji:['天喜','天医']},'开':{ji:['时阳','生气']},
    '平':{xiong:['死神']},'闭':{xiong:['血支']},'建':{xiong:['月建','小时','土府']},
    '破':{xiong:['月破','大耗']},'收':{xiong:['收日']},'执':{},'危':{}
  };
  // == 协纪辨方书 增补丛辰查表（_mIdx 0..11 = 寅..丑）==
  const ZR_TIANGOU = ['辰','巳','午','未','申','酉','戌','亥','子','丑','寅','卯']; // 天狗(满日别名，忌祷祀)
  const ZR_YOUHUO  = ['巳','寅','亥','申','巳','寅','亥','申','巳','寅','亥','申']; // 游祸
  const ZR_JIESHEN = ['申','申','戌','戌','子','子','寅','寅','辰','辰','午','午']; // 解神(吉)
  const ZR_JIUKONG = ['辰','丑','戌','未','辰','丑','戌','未','辰','丑','戌','未']; // 九空
  const ZR_YUEXU   = ['丑','戌','未','辰','丑','戌','未','辰','丑','戌','未','辰']; // 月虚
  const ZR_DAHUI   = ['甲戌',null,null,null,'丙午','丁巳','庚辰','辛卯',null,null,'壬子','癸亥']; // 大会(吉, 三七九十月无)
  const ZR_XIAOHUI = [null,'己酉','戊辰','己巳','戊午',null,null,'己卯','戊戌','己亥','戊子',null]; // 小会(吉, 正六七十二无)
  const ZR_WUMU    = ['乙未','乙未','戊辰','丙戌','丙戌','戊辰','辛丑','辛丑','戊辰','壬辰','壬辰','戊辰']; // 五墓
  const ZR_BAFENG  = {春:['丁丑','己酉'],夏:['甲申','甲辰'],秋:['辛未','丁未'],冬:['甲戌','甲寅']}; // 八风
  const ZR_FURI    = {0:['甲'],1:['乙'],2:['戊'],3:['丙'],4:['丁'],5:['己'],6:['庚'],7:['辛'],8:['戊'],9:['壬'],10:['癸'],11:['己']}; // 复日（月建之干与日干同，协纪辨方书：寅甲、卯乙、辰戊、巳丙、午丁、未己、申庚、酉辛、戌戊、亥壬、子癸、丑己）
  const ZR_TIANSHAN= {春:'戊寅',夏:'甲午',秋:'戊申',冬:'甲子'}; // 天赦(吉)
  const ZR_YINYANG_JP = {3:'癸亥',9:'丁巳'};       // 阴阳交破
  const ZR_YINYANG_JC = {4:'丙午',10:'壬子'};       // 阴阳俱错
  const ZR_SUIBO   = {3:['丙午','戊午'],9:['壬子','戊子']}; // 岁薄
  const ZR_ZHUCEN  = {5:['戊午','丙午'],11:['壬子','戊子']}; // 逐阵
  const ZR_JUEYANG = {9:'己亥'};  // 绝阳
  const ZR_JUEYIN  = {3:'己巳'};  // 绝阴
  const ZR_SANYIN  = {0:'辛酉',6:'乙卯'};  // 三阴
  const ZR_DANYIN  = {2:'戊辰'};  // 单阴
  const ZR_GUYANG  = {8:'戊戌'};  // 孤阳
  const ZR_CHUNYANG= {3:'己巳'};  // 纯阳
  const ZR_CHUNYIN = {10:'己亥'}; // 纯阴
  const ZR_YANGCUO = {0:['甲寅'],1:['乙卯'],2:['甲辰'],3:['丁巳','己巳'],5:['丁未','己未'],6:['庚申'],7:['辛酉'],8:['庚戌'],9:['癸亥'],11:['癸丑']}; // 阳错(五、十一月无)
  // 建除十二神本体吉凶（独立加减分层；平、收/建已由附神或中性处理，不重复计）
  const ZR_JIANCHU = {'建':0,'除':2,'满':2,'平':0,'定':2,'执':-2,'破':-4,'危':2,'成':2,'收':0,'开':3,'闭':-2};

  // 择日丛辰权重（加分、减分基础值）
  const ZERI_W = {
    '母仓':3,'月恩':3,'四相':2,'时德':2,'王日':3,'官日':3,'守日':3,'相日':3,'民日':3,
    '月空':2,'天仓':3,'五富':3,'六仪':2,'兵吉':2,'阳德':2,'阴德':2,'天马':2,'临日':3,
    '天恩':4,'六合':4,'天愿':5,'三合':4,'五合':3,'宝光':3,
    '要安':3,'玉宇':3,'金堂':3,'敬安':3,'普护':3,'福生':3,'圣心':3,'益后':3,'续世':3,
    '吉期':2,'兵宝':2,'天巫':3,'福德':3,'时阴':2,'天喜':5,'天医':4,'时阳':2,'生气':2,
    '月破':10,'月厌':6,'厌对':5,'往亡':7,'归忌':6,'九焦':4,'九坎':4,'五虚':3,'土符':4,
    '飞廉':5,'天贼':4,'血忌':3,'月刑':4,'月害':3,'劫煞':4,'灾煞':4,'月煞':4,'大时':4,
    '天吏':5,'死气':3,'小耗':3,'兵禁':4,'四废':8,'四忌':5,'四穷':5,'红沙':6,'月建':7,
    '小时':5,'土府':5,'收日':4,'死神':3,'血支':3,'大耗':10,'朔日':2,'望日':2,'晦日':2,
    '弦日':2,'月忌日':3,
    '天赦':9,'大会':5,'小会':3,'解神':3,
    '天狗':3,'游祸':4,'重日':3,'复日':3,'五墓':5,'九空':4,'八风':3,'月虚':4,'阴阳交破':6,
    '阴阳俱错':6,'岁薄':6,'逐阵':5,'绝阳':5,'绝阴':5,'三阴':5,'单阴':5,'纯阳':5,'孤阳':5,'纯阴':5,'阳错':6,
    '四离':7,'四绝':7,'杨公忌':8,
    '建除除':2,'建除满':2,'建除平':2,'建除定':2,'建除执':2,'建除破':3,'建除危':2,'建除成':2,'建除收':1,'建除开':3,'建除闭':2
  };
  // 择日凶神按事类的强调倍率
  const ZERI_XIONG_MUL = {
    jiahun:  {'红沙':1.5,'月厌':1.3,'厌对':1.3,'往亡':1.2,'四废':1.4,'三阴':1.3,'单阴':1.3,'孤阳':1.3,'纯阳':1.3,'复日':1.3,'四离':1.4,'四绝':1.4,'杨公忌':1.4},
    chuxing: {'往亡':1.5,'归忌':1.5,'月厌':1.3,'游祸':1.4,'重日':1.3,'月破':1.3,'四离':1.2,'四绝':1.2},
    zaozang: {'月厌':1.3,'土符':1.5,'飞廉':1.5,'五墓':1.5,'九空':1.3,'天狗':1.3,'月破':1.5,'大耗':1.5,'四废':1.5,'四离':1.4,'四绝':1.4,'杨公忌':1.4},
    jisi:    {'四废':1.5,'天狗':1.5},
    kaishi:  {'红沙':1.2,'月破':1.5,'大耗':1.5,'四废':1.5,'复日':1.3},
    tongyong:{}
  };
  // 择日吉神按事类的强调倍率
  const ZERI_JI_MUL = {
    jiahun:  {'天喜':1.3,'天医':1.3,'天愿':1.2,'三合':1.2,'天赦':1.2},
    zaozang: {'天愿':1.2,'三合':1.2,'六合':1.2,'宝光':1.2,'解神':1.2},
    kaishi:  {'天愿':1.3,'三合':1.3,'六合':1.3,'宝光':1.3,'建除开':1.3},
    chuxing: {'天马':1.3,'六合':1.2,'三合':1.2,'解神':1.2},
    jisi:    {'天赦':1.2,'解神':1.2},
    tongyong:{}
  };
  // 二十八宿（值日）按事类的权重倍率：嫁娶、祭祀重星宿、造葬次之、商贸、出行较轻
  const XIU_MUL = {
    jiahun:  {ji:1.3, xiong:1.3},
    zaozang: {ji:1.2, xiong:1.2},
    jisi:    {ji:1.3, xiong:1.2},
    kaishi:  {ji:0.9, xiong:0.9},
    chuxing: {ji:0.85, xiong:0.85},
    tongyong:{ji:1.0, xiong:1.0}
  };

  function zeriSha(r){
    const ji=[], xiong=[];
    const dayGZ = r.dayGZ, dayGan = r.dayGan, dayZhi = r.dayZhi;
    const mgz = r.lunar.getMonthInGanZhi(); const monthGan = mgz[0], monthZhi = mgz[1];
    const mi = _mIdx(monthZhi);
    const ju = _ju(monthZhi); const jm = ZR_JU_MAP[ju] || {};
    const season = _season(mi);
    const pushJi=(n)=>{ if(ji.indexOf(n)<0) ji.push(n); };
    const pushX=(n)=>{ if(xiong.indexOf(n)<0) xiong.push(n); };

    // == 月令丛辰（凶）==
    if(dayZhi===CHONG[monthZhi]) pushX('月破');
    if(dayZhi===ZR_YUEYAN[mi]) pushX('月厌');
    if(dayZhi===CHONG[ZR_YUEYAN[mi]]) pushX('厌对');
    if(dayZhi===ZR_WANGWANG[mi]) pushX('往亡');
    if(dayZhi===ZR_GUIJI[mi]) pushX('归忌');
    if(dayZhi===ZR_JIUJIAO[mi]){ pushX('九焦'); pushX('九坎'); }
    if(ZR_WUXU[season].indexOf(dayZhi)>=0) pushX('五虚');
    if(dayZhi===ZR_TUFU[mi]) pushX('土符');
    if(dayZhi===ZR_FEILIAN[mi]) pushX('飞廉');
    if(dayZhi===ZR_TIANZEI[mi]) pushX('天贼');
    if(dayZhi===ZR_XUEJI[mi]) pushX('血忌');
    if(dayZhi===ZR_YUEXING[monthZhi]) pushX('月刑');
    if(dayZhi===ZR_YUEHAI[monthZhi]) pushX('月害');
    if(jm.jie && dayZhi===jm.jie) pushX('劫煞');
    if(jm.zai && dayZhi===jm.zai) pushX('灾煞');
    if(jm.sha && dayZhi===jm.sha) pushX('月煞');
    if(jm.da  && dayZhi===jm.da)  pushX('大时');
    if(jm.li  && dayZhi===jm.li){ pushX('天吏'); pushX('死气'); }
    const xh = ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+5)%12]; // 小耗=月破前一位
    if(dayZhi===xh) pushX('小耗');
    if(dayZhi===ZR_BINGJIN[mi]) pushX('兵禁');
    if(r.dayGZ && ZR_SIFEI[season].indexOf(dayGZ)>=0) pushX('四废');
    if(r.dayGZ && r.dayGZ===ZR_SIJI[season]) pushX('四忌');
    if(r.dayGZ && r.dayGZ===ZR_SIQIONG[season]) pushX('四穷');
    const hongsha = (mi%3===0)?'酉':(mi%3===1)?'巳':'丑'; // 孟酉、仲巳、季丑
    if(dayZhi===hongsha) pushX('红沙');

    // == 月令丛辰（吉）==
    if(ZR_MUCANG[season].indexOf(dayZhi)>=0) pushJi('母仓');
    if(ZR_YUEEN[monthZhi] && dayGan===ZR_YUEEN[monthZhi]) pushJi('月恩');
    if(ZR_SIXIANG[season].indexOf(dayGan)>=0) pushJi('四相');
    if(dayZhi===ZR_SHIDE[season]) pushJi('时德');
    if(dayZhi===ZR_WANG[season]) pushJi('王日');
    if(dayZhi===ZR_GUAN[season]) pushJi('官日');
    if(dayZhi===ZR_SHOU[season]) pushJi('守日');
    if(dayZhi===ZR_XIANG[season]) pushJi('相日');
    if(dayZhi===ZR_MIN[season]) pushJi('民日');
    if(jm.kong && dayGan===jm.kong) pushJi('月空');
    if(dayZhi===ZR_TIANCANG[mi]) pushJi('天仓');
    if(jm.fu && dayZhi===jm.fu) pushJi('五富');
    if(ZR_BINGYI.indexOf(dayGan)>=0) pushJi('六仪');
    if(ZR_BINGJI[mi].indexOf(dayZhi)>=0) pushJi('兵吉');
    if(dayZhi===ZR_YANGDE[mi]) pushJi('阳德');
    if(dayZhi===ZR_YINDE[mi]) pushJi('阴德');
    if(dayZhi===ZR_TIANMA[mi]) pushJi('天马');
    if(jm.lin && dayZhi===jm.lin) pushJi('临日');
    if(ZR_TIANEN.indexOf(dayGZ)>=0) pushJi('天恩');
    if(LIUHE[monthZhi]===dayZhi){ pushJi('六合'); pushJi('天愿'); }
    if(JU_OF[dayZhi] && JU_OF[dayZhi]===ju && dayZhi!==monthZhi) pushJi('三合');
    if(ZR_HE[dayGan]===monthGan) pushJi('五合');
    // 九神
    if(dayZhi===ZR_YAOAN[mi]) pushJi('要安');
    if(dayZhi===ZR_YUYU[mi]) pushJi('玉宇');
    if(dayZhi===ZR_JINTANG[mi]) pushJi('金堂');
    if(dayZhi===ZR_JINGAN[mi]) pushJi('敬安');
    if(dayZhi===ZR_PUHU[mi]) pushJi('普护');
    if(dayZhi===ZR_FUSHENG[mi]) pushJi('福生');
    if(dayZhi===ZR_SHENGXIN[mi]) pushJi('圣心');
    if(dayZhi===ZR_YIHOU[mi]) pushJi('益后');
    if(dayZhi===ZR_XUSH[mi]) pushJi('续世');

    // == 建除附神 ==
    const jf = ZR_JIANFU[r.zhiXing];
    if(jf){ (jf.ji||[]).forEach(n=>pushJi(n)); (jf.xiong||[]).forEach(n=>pushX(n)); }

    // == 黄道附神 ==
    if(r.tShen==='金匮') pushJi('宝光');

    // == 农历日凶神 ==
    let ld=1; try{ ld = r.lunar.getDay(); }catch(e){}
    if(ld===1) pushX('朔日');
    if(ld===15) pushX('望日');
    if(ld===8||ld===23) pushX('弦日');
    if(ld===5||ld===14||ld===23) pushX('月忌日');
    try{ if(ld===r.lunar.getDayCount()) pushX('晦日'); }catch(e){}

    // == 协纪辨方书 增补大吉神 ==
    if(dayGZ && dayGZ===ZR_TIANSHAN[season]) pushJi('天赦');
    if(ZR_DAHUI[mi] && dayGZ===ZR_DAHUI[mi]) pushJi('大会');
    if(ZR_XIAOHUI[mi] && dayGZ===ZR_XIAOHUI[mi]) pushJi('小会');
    if(dayZhi===ZR_JIESHEN[mi]) pushJi('解神');

    // == 协纪辨方书 增补凶神 ==
    if(dayZhi===ZR_TIANGOU[mi]) pushX('天狗');                 // 满日别名（忌祷祀）
    if(dayZhi===ZR_YOUHUO[mi]) pushX('游祸');
    if(dayZhi==='巳'||dayZhi==='亥') pushX('重日');            // 利吉事忌凶事
    if((ZR_FURI[mi]||[]).indexOf(dayGan)>=0) pushX('复日');
    if(dayGZ && dayGZ===ZR_WUMU[mi]) pushX('五墓');
    if(dayZhi===ZR_JIUKONG[mi]) pushX('九空');
    if(ZR_BAFENG[season].indexOf(dayGZ)>=0) pushX('八风');
    if(dayZhi===ZR_YUEXU[mi]) pushX('月虚');
    if(ZR_YINYANG_JP[mi] && dayGZ===ZR_YINYANG_JP[mi]) pushX('阴阳交破');
    if(ZR_YINYANG_JC[mi] && dayGZ===ZR_YINYANG_JC[mi]) pushX('阴阳俱错');
    if((ZR_SUIBO[mi]||[]).indexOf(dayGZ)>=0) pushX('岁薄');
    if((ZR_ZHUCEN[mi]||[]).indexOf(dayGZ)>=0) pushX('逐阵');
    if(ZR_JUEYANG[mi] && dayGZ===ZR_JUEYANG[mi]) pushX('绝阳');
    if(ZR_JUEYIN[mi] && dayGZ===ZR_JUEYIN[mi]) pushX('绝阴');
    if(ZR_SANYIN[mi] && dayGZ===ZR_SANYIN[mi]) pushX('三阴');
    if(ZR_DANYIN[mi] && dayGZ===ZR_DANYIN[mi]) pushX('单阴');
    if(ZR_GUYANG[mi] && dayGZ===ZR_GUYANG[mi]) pushX('孤阳');
    if(ZR_CHUNYANG[mi] && dayGZ===ZR_CHUNYANG[mi]) pushX('纯阳');
    if(ZR_CHUNYIN[mi] && dayGZ===ZR_CHUNYIN[mi]) pushX('纯阴');
    if((ZR_YANGCUO[mi]||[]).indexOf(dayGZ)>=0) pushX('阳错');

    // == 四离四绝、杨公忌（节气交替忌 + 民俗十三忌）==
    /* 【定源】四绝：四立（立春立夏立秋立冬）前一日；四离：二分二至（春秋分冬夏至）前一日。
       出《玉门子》至前一天为离，节前一天为绝，《协纪辨方书》卷四十七引录；通书皆标四离四绝，
       大事勿用，百事忌（尤忌嫁娶、出行、造葬）。判定用 lunar 节气表前推一日， avoids 手工日期表逐年漂移。 */
    /* 【定源】杨公忌（杨公十三忌）：世传杨筠松所订，民俗百事忌日。十三日为
       正月十三、二月十一、三月初九、四月初七、五月初五、六月初三、七月初一、七月廿九、
       八月廿七、九月廿五、十月廿三、十一月廿一、十二月十九（七月两日，此后每月递减二日）。
       歌诀神仙留下十三日，举动须防多损失……婚姻嫁娶亦非宜……安葬若还逢此日，后代儿孙必乞食       （民间通书通行本）。权重 −8、嫁娶/造葬 1.4 倍为本站归纳量值。 */
    try{
      const prevJq = r.lunar.getPrevJieQi(true);          // 距今日最近（已过）的节气
      if(prevJq){
        const jqSolar = prevJq.getSolar();
        const today = r.lunar.getSolar();
        if(today && today.getYear()===jqSolar.getYear() && today.getMonth()===jqSolar.getMonth() && today.getDay()===jqSolar.getDay()+1){
          // 今日 = 节气次日 → 昨日即节气日；若昨日为节（四立）则今日为四绝，为气（二分二至）则为四离
          if(prevJq._p && prevJq._p.jie) pushX('四绝');
          else if(prevJq._p && prevJq._p.qi) pushX('四离');
        }
      }
    }catch(e){}
    try{
      // isDayYangGong 挂在 Foto 对象（lunar.getFoto() 桥接），不在 Lunar 原型上
      const _yang = r.lunar.getFoto ? r.lunar.getFoto() : null;
      if(_yang && _yang.isDayYangGong && _yang.isDayYangGong()) pushX('杨公忌');
    }catch(e){}

    // == 建除十二神本体吉凶（独立层，与附神不重复命名）==
    const _jc = ZR_JIANCHU[r.zhiXing];
    // 满日不再计“建除满”：满日本体已由“天狗”别名覆盖（忌祷祀），避免双计
    if(r.zhiXing==='满'){ /* 计入天狗，不再计建除满 */ }
    else if(_jc>0) pushJi('建除'+r.zhiXing);
    else if(_jc<0) pushX('建除'+r.zhiXing);

    return {ji, xiong};
  }

  // ---- 【定源】日课格局（日时干支组合之课格）：天地鸳鸯双合、双催（日时同贵人）、
  //        干支三朋、双飞（天干连茹）等，皆通书成课通行格局（见《選擇宗鏡》成课总论义例）；
  //        格局加分档为本站归纳量值 ----
  function rikeGeju(dayGan, dayZhi, timeGan, timeZhi){
    const out = [];
    if(timeGan==null || timeZhi==null) return out;
    const luZ = LU[dayGan], jz = JU_OF[dayZhi], ymZ = jz?YIMA[jz]:null, tys = TIANYI[dayGan]||[];
    let lm = 0;
    if(luZ===dayZhi||luZ===timeZhi) lm++;
    if(ymZ && (ymZ===dayZhi||ymZ===timeZhi)) lm++;
    if(tys.indexOf(dayZhi)>=0 || tys.indexOf(timeZhi)>=0) lm++;
    if(lm>=2) out.push({name:'禄马贵人聚', good:true, w:8});
    else if(lm===1) out.push({name:'禄马贵人', good:true, w:4});
    if(dayGan===timeGan && dayZhi===timeZhi) out.push({name:'天地同流', good:true, w:8});
    else if(dayGan===timeGan) out.push({name:'日时天比', good:true, w:4});
    if(LIUHE[dayZhi]===timeZhi) out.push({name:'蝴蝶双飞', good:true, w:6});
    if(jz && JU_OF[timeZhi]===jz && dayZhi!==timeZhi) out.push({name:'日时三合', good:true, w:5});
    if(WENCHANG[dayGan]===dayZhi || WENCHANG[dayGan]===timeZhi) out.push({name:'文昌到位', good:true, w:3});
    return out;
  }

  // ---- 周堂（嫁娶、安床、移徙）----
  // 通用法则：大月顺排、小月逆排（小月从该堂“对宫字”逆推）。
  // 嫁娶周堂：大月从“夫”顺，小月从“妇”逆；吉位 第、堂、厨、灶，凶位 夫、姑、翁、妇（须避开）。
  // 安床周堂：大月从“床”顺，小月从“妇”逆；吉位 第、床、堂、蟾，凶位 姑、翁、妇、夫。
  // 移徙周堂：大月从“徙”顺，小月从“徙”逆；吉位 入、归、安、宁、吉，凶位 徙、出、凶。
  const ZHOUTANG = {
    jia: {
      big:  ['夫','姑','翁','第','灶','妇','堂','厨'],
      small:['妇','堂','厨','第','灶','翁','姑','夫'],
      good: new Set(['第','堂','厨','灶']),
      title:'嫁娶周堂'
    },
    an: {
      big:  ['床','姑','蟾','堂','翁','第','妇','夫'],
      small:['妇','夫','第','翁','堂','蟾','姑','床'],
      good: new Set(['第','床','堂','蟾']),
      title:'安床周堂'
    },
    yi: {
      big:  ['徙','入','出','归','安','宁','吉','凶'],
      small:['徙','凶','吉','宁','安','归','出','入'],
      good: new Set(['入','归','安','宁','吉']),
      title:'移徙周堂'
    }
  };
  function zhouTang(kind, lunarDay, isBigMonth){
    const t = ZHOUTANG[kind]; if(!t) return null;
    const order = t.big ? (isBigMonth ? t.big : t.small) : t.order;
    const pos = order[((lunarDay-1)%8+8)%8];
    return {pos, good:t.good.has(pos), title:t.title};
  }

  // ---- 日家紫白（玄空紫白派用，洛书九宫飞星）----
  /* 【定源】日家三元紫白（《协纪辨方书》《选择纪要》《儒门崇理折衷堪舆完孝录》通例）：
     阴阳以冬至、夏至为界，三元以节气为界，一元六十日，元内自最近甲子日起该元基数、一日一宫顺逆推。
     阳遁（冬至后）：冬至→雨水甲子起一白、雨水→谷雨甲子起七赤、谷雨→夏至甲子起四绿，顺行。
     阴遁（夏至后）：夏至→处暑甲子起九紫、处暑→霜降甲子起三碧、霜降→冬至甲子起六白，逆行。
     锚点：冬至后首甲子日一白入中；夏至后首甲子日九紫入中。 */
  const ZB_STAR_W = {1:4,6:4,8:4,9:1,3:-1,4:-1,7:-1,2:-6,5:-8}; // 紫白星 → 加减分（一六八白吉，二黑五黄大凶）
  // 地支 → 洛书飞布索引（0中/1乾/2兑/3艮/4离/5坎/6坤/7震/8巽）
  const ZB_ZHI_FLY = {'子':5,'丑':3,'寅':3,'卯':7,'辰':8,'巳':8,'午':4,'未':6,'申':6,'酉':2,'戌':1,'亥':1};
  function _zbStar(k, idx, yin){ return ((k-1 + (yin? -idx : idx)) % 9 + 9) % 9 + 1; }
  /* 取指定节气在参考日前后最近的一个公历日期（date 格式 YYYYMMDD） */
  function _zbJq(solar, refQ, name, greater){
    const cand = [];
    for(const ly of [solar.getYear()-1, solar.getYear(), solar.getYear()+1]){
      const s = Solar.fromYmd(ly,1,1).getLunar().getJieQiTable()[name];
      if(s) cand.push(s.getYear()*10000+s.getMonth()*100+s.getDay());
    }
    cand.sort((x,y)=>x-y);
    if(!greater){ let ch=null; for(const c of cand) if(c<=refQ) ch=c; return ch===null?cand[0]:ch; }
    let ch=cand[cand.length-1]; for(const c of cand) if(c>refQ){ ch=c; break; } return ch;
  }
  function dayZiBai(r){
    if(!r.solar || !r.lunar) return null;
    const y=r.solar.getYear(), m=r.solar.getMonth(), d=r.solar.getDay();
    const q=y*10000+m*100+d;
    const dz=_zbJq(r.solar, q, '冬至', false);            /* 本周期起点：最近且<=当日的冬至 */
    const ys=_zbJq(r.solar, dz, '雨水', true), gy=_zbJq(r.solar, dz, '谷雨', true), xz=_zbJq(r.solar, dz, '夏至', true);
    let base, yin, yuan;
    if(q<ys){ base=1; yin=false; yuan=0; }
    else if(q<gy){ base=7; yin=false; yuan=1; }
    else if(q<xz){ base=4; yin=false; yuan=2; }
    else{
      const cz=_zbJq(r.solar, xz, '处暑', true), sj=_zbJq(r.solar, xz, '霜降', true);
      if(q<cz){ base=9; yin=true; yuan=0; }
      else if(q<sj){ base=3; yin=true; yuan=1; }
      else { base=6; yin=true; yuan=2; }
    }
    const off = (gIdxLocal(r.lunar.getDayInGanZhi())+60)%60;   /* 距最近甲子日天数 */
    const k = base;
    const centerStar = ((k-1 + (yin?-off:off))%9+9)%9+1;
    return { name:(yin?'阴遁':'阳遁'), yuan, k, yin, centerStar };
  }
  /* 六十甲子序（0 基），供日家紫白计距甲子日数 */
  function gIdxLocal(gz){
    const G='甲乙丙丁戊己庚辛壬癸', Z='子丑寅卯辰巳午未申酉戌亥';
    const gi=G.indexOf(gz[0]), zi=Z.indexOf(gz[1]);
    return (gi*6 - zi*5 + 600)%60;
  }

  // ---- 【定源】旬空（六十甲子旬空，通行例）：日柱所在旬之空亡二支，空亡则诸吉减力、凶煞照常 ----
  const JIAZI60 = (function(){ const G='甲乙丙丁戊己庚辛壬癸', Z='子丑寅卯辰巳午未申酉戌亥', a=[]; for(let n=0;n<60;n++) a.push(G[n%10]+Z[n%12]); return a; })();
  const XK = {'甲子':['戌','亥'],'甲戌':['申','酉'],'甲申':['午','未'],'甲午':['辰','巳'],'甲辰':['寅','卯'],'甲寅':['子','丑']};
  function xunkong(gz){ const n=JIAZI60.indexOf(gz); if(n<0) return []; return XK[JIAZI60[n-n%10]] || []; }

  // 二十八宿（值日）：甲子日起角宿，每日起一宿循环二十八；y=五行曜（木金土日月火水）；good=吉凶
  const XX = [
    {n:'角木蛟', y:'木', good:false}, {n:'亢金龙', y:'金', good:false}, {n:'氐土貉', y:'土', good:false},
    {n:'房日兔', y:'日', good:true},  {n:'心月狐', y:'月', good:false}, {n:'尾火虎', y:'火', good:true},
    {n:'箕水豹', y:'水', good:true},  {n:'斗木獬', y:'木', good:true},  {n:'牛金牛', y:'金', good:false},
    {n:'女土蝠', y:'土', good:false}, {n:'虚日鼠', y:'日', good:false}, {n:'危月燕', y:'月', good:false},
    {n:'室火猪', y:'火', good:true},  {n:'壁水貐', y:'水', good:true},  {n:'奎木狼', y:'木', good:false},
    {n:'娄金狗', y:'金', good:true},  {n:'胃土雉', y:'土', good:true},  {n:'昴日鸡', y:'日', good:false},
    {n:'毕月乌', y:'月', good:true},  {n:'觜火猴', y:'火', good:false}, {n:'参水猿', y:'水', good:true},
    {n:'井木犴', y:'木', good:true},  {n:'鬼金羊', y:'金', good:false}, {n:'柳土獐', y:'土', good:false},
    {n:'星日马', y:'日', good:false}, {n:'张月鹿', y:'月', good:true},  {n:'翼火蛇', y:'火', good:false},
    {n:'轸水蚓', y:'水', good:true}
  ];
  function dayXiu(dayGZ){
    const idx = JIAZI60.indexOf(dayGZ);
    if(idx<0) return null;
    const x = XX[((idx % 28) + 28) % 28];
    return { name:x.n, yao:x.y, good:x.good, text: x.n + '（' + x.y + '曜，' + (x.good?'吉':'凶') + '）' };
  }

  // 九曜（值日）：依农历日顺布，初一太阳、初二太阴、初三火、初四水、初五木、初六金、初七土、初八罗睺、初九计都，循环九日；吉曜加、凶曜减
  const JIUYAO = [
    {n:'太阳', w:3,  good:true},   // 初一
    {n:'太阴', w:2,  good:true},   // 初二
    {n:'火曜', w:-2, good:false},  // 初三
    {n:'水曜', w:1,  good:true},   // 初四
    {n:'木曜', w:2,  good:true},   // 初五
    {n:'金曜', w:-2, good:false},  // 初六
    {n:'土曜', w:-2, good:false},  // 初七
    {n:'罗睺', w:-4, good:false},  // 初八
    {n:'计都', w:-4, good:false}   // 初九
  ];
  function dayJiuYao(r){
    const ld = r.lunar.getDay();
    const j = JIUYAO[((ld-1)%9+9)%9];
    return { name:j.n, w:j.w, good:j.good, text: j.n + '（' + (j.good?'吉':'凶') + '）' };
  }

  // 京房纳甲：天干纳八卦与五行（用于相主与到山）
  const NAJIA = {
    '甲':{gua:'乾', wx:'金'}, '壬':{gua:'乾', wx:'金'},
    '乙':{gua:'坤', wx:'土'}, '癸':{gua:'坤', wx:'土'},
    '丙':{gua:'艮', wx:'土'},
    '丁':{gua:'兑', wx:'金'},
    '庚':{gua:'震', wx:'木'},
    '辛':{gua:'巽', wx:'木'},
    '戊':{gua:'离', wx:'火'},
    '己':{gua:'坎', wx:'水'}
  };
  // 坐山（24山）→ 本卦（用于纳甲到山判定）
  const SHAN_BAGUA = {
    '乾':['戌','乾','亥'], '坤':['未','坤','申'], '艮':['丑','艮','寅'],
    '兑':['庚','酉','辛'], '震':['甲','卯','乙'], '巽':['辰','巽','巳'],
    '离':['丙','午','丁'], '坎':['壬','子','癸']
  };
  function najiaGuaOf(shanZhi){
    for(const g in SHAN_BAGUA){ if(SHAN_BAGUA[g].indexOf(shanZhi)>=0) return g; }
    return null;
  }

  /* 主判定：对单条候选重算精择分。
     r: 模块①候选；ev: 事项；opts: {USER_XI,USER_JI,USER_DWX,USER_READY,TS_RES,USER_NAYIN_WX,shanZhi,timeZhi,school} */
  function jingzeScore(r, ev, opts){
    opts = opts||{};
    const famKey = FAMILY_OF[ev]||'tongyong';
    const fam = FAMILY[famKey];
    const ztKind = ZT_OF[ev]||null;
    let s = r.score;
    const reasons = [];
    const dayGan = r.dayGan, dayZhi = r.dayZhi;
    const monthGZ = r.lunar.getMonthInGanZhi();
    const monthGan = monthGZ[0], monthZhi = monthGZ[1];
    const yearGZ = r.lunar.getYearInGanZhiByLiChun();
    const yearGan = yearGZ[0], yearZhi = yearGZ[1];
    const timeZhi = opts.timeZhi!=null ? opts.timeZhi : null;
    const timeGan = (timeZhi!=null) ? wuShuDun(dayGan, ZHI_HOUR.indexOf(timeZhi))[0] : null;
    const timeGZ = (timeZhi!=null) ? wuShuDun(dayGan, ZHI_HOUR.indexOf(timeZhi)) : null;

    // ① 日课生扶命主（造命择日：以日课四柱五行生扶命主日主与喜用神为吉，克泄耗为凶）
    if(opts.USER_READY){
      const dwx = opts.USER_DWX;
      if(dwx){
        // 列：日课各柱五行 [五行, 权重, 是否参与喜忌加权]；日干即命主日主不计入生扶
        const cols = [
          [GAN_WX[monthGan], 1.5, true],
          [ZHI_WX[monthZhi], 1.5, true],
          [ZHI_WX[dayZhi], 1.0, true],
          [GAN_WX[yearGan], 0.5, true],
          [ZHI_WX[yearZhi], 0.5, true]
        ];
        if(timeGan!=null){ cols.push([GAN_WX[timeGan], 1.0, true]); cols.push([ZHI_WX[timeZhi], 1.0, true]); }
        let net=0;
        cols.forEach(([w,wt,extra])=>{
          if(!w || wt<=0) return;
          let v=0;
          if(WX_SHENG[w]===dwx) v=2;          // 生我（印）
          else if(w===dwx) v=1;               // 比助
          else if(WX_SHENG[dwx]===w) v=-1;    // 我生（泄）
          else if(WX_KE[w]===dwx) v=-2;       // 克我（官杀）
          else if(WX_KE[dwx]===w) v=-1;       // 我克（耗）
          if(extra){
            if(opts.USER_XI.indexOf(w)>=0) v+=1;
            if(opts.USER_JI.indexOf(w)>=0) v-=1;
          }
          net += v*wt;
        });
        net = Math.max(-12, Math.min(12, Math.round(net)));
        if(net>0){ s+=net; reasons.push('生扶命主+'+net); }
        else if(net<0){ s+=net; reasons.push('泄耗命主'+net); }
      } else {
        // 回退口径：仅看日柱干支是否属喜用神
        const ws = [GAN_WX[dayGan], ZHI_WX[dayZhi]].filter(Boolean);
        let xi=false, ji=false;
        ws.forEach(w=>{ if(opts.USER_XI.indexOf(w)>=0) xi=true; if(opts.USER_JI.indexOf(w)>=0) ji=true; });
        if(xi){ s+=6; reasons.push('喜用神+6'); }
        if(ji){ s-=8; reasons.push('犯忌神-8'); }
      }
    }

    // ② 真太岁方位（方位煞仅造葬动土族重扣，其他轻扣）
    if(opts.TS_RES){
      const ts = opts.TS_RES;
      if(dayZhi===CHONG[ts.zhi]){ const w = fam.fangSha?-15:-12; s+=w; reasons.push('岁破日'+w); }
      else if(ts.ss.indexOf(dayZhi)>=0){ const w = fam.fangSha?-12:-4; s+=w; reasons.push('三煞日'+w); }
      else if(dayZhi===ts.zhi){ const w = fam.fangSha?-6:-3; s+=w; reasons.push('伏吟太岁'+w); }
    }

    // ③ 日课神煞（八字神煞，复用 pillarSha，与择日丛辰严格隔离）
    const sha = dayShensha(dayGan, dayZhi, monthGan, monthZhi, yearGan, yearZhi, timeGan, timeZhi);
    sha.ji.forEach(n=>{ const w=SHA_W[n]||3; s += w; reasons.push('+'+w+' '+n); });
    const mul = XIONG_MUL[FAMILY_OF[ev]||'tongyong']||{};
    sha.xiong.forEach(n=>{
      let w = SHA_W[n]||5; const m = mul[n]; if(m) w = Math.round(w*m);
      s -= w; reasons.push('-'+w+' '+n);
    });

    // ③-b 择日专属丛辰（协纪辨方书：月令丛辰 + 建除、黄道附神 + 农历日凶神）
    // 与八字神煞为两套独立体系，分别计分、分别展示，不混用。
    const zr = zeriSha(r);
    const zrJiMul = ZERI_JI_MUL[famKey]||{};
    zr.ji.forEach(n=>{ let w=ZERI_W[n]||3; const m=zrJiMul[n]; if(m) w=Math.round(w*m); s += w; reasons.push('+'+w+' '+n); });
    const zrMul = ZERI_XIONG_MUL[famKey]||{};
    const JI_SHI_FAM = ['jiahun','jisi','kaishi']; // 重日：利吉事、忌凶事
    zr.xiong.forEach(n=>{
      let delta;
      if(n==='重日'){
        delta = (JI_SHI_FAM.indexOf(famKey)>=0) ? 3 : -3;
        const m = zrMul['重日']; if(m) delta = Math.round(delta*m);
      } else {
        let w = ZERI_W[n]||4; const m = zrMul[n]; if(m) w = Math.round(w*m);
        delta = -w;
      }
      s += delta; reasons.push((delta>=0?'+':'')+delta+' '+n);
    });

    // ③-c 日柱空亡（日支落旬空，诸吉减力）
    const xk = xunkong(dayGan+dayZhi);
    if(xk.indexOf(dayZhi)>=0){ s -= 1; reasons.push('日空亡-1'); }

    // ③-d 二十八宿（值日）：吉宿 +2、凶宿 −3，按事类权重区分（嫁娶、祭祀重、造葬次、商贸、出行轻）
    const xiuMul = XIU_MUL[famKey]||{ji:1,xiong:1};
    const xiu = dayXiu(r.dayGZ);
    if(xiu){
      if(xiu.good){ const w=Math.round(2*xiuMul.ji); s+=w; reasons.push('二十八宿+'+(w>=0?w:0)); }
      else { const w=Math.round(3*xiuMul.xiong); s-=w; reasons.push('二十八宿-'+w); }
    }

    // ③-e 九曜（值日）：依农历日顺布（初一太阳…初九计都），吉曜加、凶曜减
    const jy = dayJiuYao(r);
    if(jy){ s += jy.w; reasons.push('九曜'+(jy.w>=0?'+':'')+jy.w); }

    // ③-f 纳甲相主（京房纳甲：日干纳八卦五行，生扶命主为吉、泄耗克命主为凶）
    const nj = NAJIA[dayGan];
    if(nj && opts.USER_READY && opts.USER_DWX){
      const dwx = opts.USER_DWX;
      let nv=0;
      if(WX_SHENG[nj.wx]===dwx) nv=3;
      else if(nj.wx===dwx) nv=2;
      else if(WX_SHENG[dwx]===nj.wx) nv=-1;
      else if(WX_KE[nj.wx]===dwx) nv=-3;
      else if(WX_KE[dwx]===nj.wx) nv=-1;
      if(opts.USER_XI.indexOf(nj.wx)>=0) nv+=1;
      if(opts.USER_JI.indexOf(nj.wx)>=0) nv-=1;
      if(nv>0){ s+=nv; reasons.push('纳甲相主+'+nv); }
      else if(nv<0){ s+=nv; reasons.push('纳甲泄命主'+nv); }
    }

    // ④ 日课格局
    const gj = rikeGeju(dayGan, dayZhi, timeGan, timeZhi);
    gj.forEach(g=>{ if(g.good){ s+=g.w; reasons.push(g.name+'+'+g.w); } else { s-=g.w; reasons.push(g.name+'-'+g.w); } });

    // ⑤ 本命年命纳音相主（造葬、嫁娶）
    if(opts.USER_NAYIN_WX && fam.nayin){
      const dNayin = nayinOf(dayGan+dayZhi);
      const dWx = (NAYIN_INFO[dNayin]||{}).wx || '';
      if(dWx){
        if(WX_SHENG[dWx]===opts.USER_NAYIN_WX){ s+=6; reasons.push('课生年命+6'); }
        else if(dWx===opts.USER_NAYIN_WX){ s+=4; reasons.push('课比年命+4'); }
        else if(WX_KE[dWx]===opts.USER_NAYIN_WX){ s-=4; reasons.push('课克年命-4'); }
        else if(WX_KE[opts.USER_NAYIN_WX]===dWx){ s+=2; reasons.push('年命克课+2'); }
      }
    }

    // ⑥ 坐山补龙扶山 + 制化（仅造葬动土族）
    let zhiNote = '';
    if(opts.shanZhi && fam.fangSha){
      const shan = opts.shanZhi;
      let hitBad=false, badName='';
      if(opts.TS_RES){
        if(opts.TS_RES.ss.indexOf(shan)>=0){ hitBad=true; badName='三煞到山'; s-=18; }
        else if(CHONG[opts.TS_RES.zhi]===shan){ hitBad=true; badName='岁破到山'; s-=18; }
        else if(opts.TS_RES.zhi===shan){ hitBad=true; badName='坐太岁（太岁到山）'; s-=18; }
      }
      let canZhi=false, zhiBy='';
      if(JU_OF[shan] && JU_OF[shan]===JU_OF[monthZhi]){ canZhi=true; zhiBy='月支三合'; }
      if(LIUHE[monthZhi]===shan){ canZhi=true; zhiBy=(zhiBy?'、':'')+'六合'; }
      if((TIANYI[dayGan]||[]).indexOf(shan)>=0){ canZhi=true; zhiBy=(zhiBy?'、':'')+'天乙贵人'; }
      if(hitBad){
        if(canZhi){ s=Math.min(100, s+9); zhiNote=''+badName+'（有制：'+zhiBy+'，可化）'; reasons.push(badName+'有制+9'); }
        else { zhiNote=''+badName+'（无制，大凶）'; reasons.push(badName+'-18'); }
      } else { s+=4; zhiNote='坐山得地+4'; reasons.push('坐山得地+4'); }
      // 纳甲到山（杨公造命：日干纳甲卦与坐山本卦同宫，扶山大吉）
      const nj2 = NAJIA[dayGan];
      if(nj2){
        const sg = najiaGuaOf(shan);
        if(sg && sg===nj2.gua){ s+=6; reasons.push('纳甲到山+6'); zhiNote=(zhiNote?zhiNote+'；':'')+'纳甲归干到山(+6)'; }
      }
    }

    // ⑦ 周堂（嫁娶、安床、移徙）：大月顺排、小月逆排
    let zt = null;
    if(ztKind){
      const lt = r.lunar.getDay();
      let isBig = true;
      try{ const ly = LunarYear.fromYear(r.lunar.getYear()); const lm = ly.getMonth(r.lunar.getMonth()); if(lm) isBig = lm.getDayCount()>=30; }catch(e){}
      zt = zhouTang(ztKind, lt, isBig);
      if(zt.good){ s+=6; reasons.push(zt.title+zt.pos+'+6'); }
      else { s-=8; reasons.push(zt.title+zt.pos+'-8'); }
    }

    // ⑦-b 时家神煞（仅当选定用事时辰）：五不遇时、时辰黄黑道、贵人登天时
    let shiNote = '';
    if(timeZhi!=null && timeGan!=null){
      /* 【定源】五不遇时（时干克日干、阳克阳阴克阴，即时上七杀）：《烟波钓叟歌》时干克日
         有灾危，奇门择时首避；歌诀甲日庚午乙辛巳，丙壬辰丁癸卯，戊甲寅己乙丑，庚丙子
         辛丁酉，壬戊申癸己未。不必死记表：由五鼠遁得时干，再验时干克日干且同性即成。
         锚点：甲日庚午时、癸日己未时。 */
      if(GAN_WX[timeGan] && WX_KE[GAN_WX[timeGan]]===GAN_WX[dayGan] && ((GAN.indexOf(timeGan)%2)===(GAN.indexOf(dayGan)%2))){
        const w = -6; s += w; reasons.push('五不遇时'+w);
        shiNote = '五不遇时（'+timeGZ+'，时干'+timeGan+'克日干'+dayGan+'，百事不宜）';
      }
      /* 【定源】时辰黄黑道（《诸日起吉时歌》，传统嫁娶择日通行例，与《奇门遁甲秘笈大全》
         黄黑道日时同源）：寅申须加子，卯酉却居寅，辰戌龙位上，巳亥午上存，子午临申地，
         丑未戌相寻，即日支寅/申青龙起子时、卯/酉起寅时、辰/戌起辰时（本位）、巳/亥起
         午时、子/午起申时、丑/未起戌时；自青龙顺布青龙明堂天刑朱雀金匮天德白虎玉堂天牢
         玄武司命勾陈，青龙明堂金匮天德玉堂司命为黄道吉时。锚点：寅申日子时青龙、午时
         白虎；申日申时天牢。吉时+3、黑道不加不减（不作首选即可）。 */
      try{
        const qld = {'寅':'子','申':'子','卯':'寅','酉':'寅','辰':'辰','戌':'辰','巳':'午','亥':'午','子':'申','午':'申','丑':'戌','未':'戌'}[dayZhi];
        const TS12 = ['青龙','明堂','天刑','朱雀','金匮','天德','白虎','玉堂','天牢','玄武','司命','勾陈'];
        if(qld){
          const off = (ZHI_HOUR.indexOf(timeZhi) - ZHI_HOUR.indexOf(qld) + 12) % 12;
          const tShen = TS12[off];
          const HUANG = ['青龙','明堂','金匮','天德','玉堂','司命'];
          if(HUANG.indexOf(tShen)>=0){
            const w = 3; s += w; reasons.push('黄道时'+tShen+'+'+w);
            shiNote = (shiNote?shiNote+'；':'')+'黄道吉时（'+tShen+'）';
          } else {
            shiNote = (shiNote?shiNote+'；':'')+'黑道时（'+tShen+'）';
          }
        }
      }catch(e){}
      /* 【定源】贵人登天时（《钦定协纪辨方书·卷七·义例五》贵登天门时，通书称选时第一义）：
         以月将加用时，天乙贵人临乾亥（天门）即贵人登天门，诸煞潜藏（神藏煞没）。
         推法：贵人宫起月将顺数至亥，登天时支 = 月将支 + (亥 − 贵人宫)（mod 12）。
         昼夜分用（通书）：时贵人，昼用阳贵，夜用阴贵。阳/阴贵两表从《协纪》考原定论
         当以起未而顺者为阳，起丑而逆者为阴（曹震圭旦大吉夕小吉说被考原明辨为
         阴阳倒置，不取）：阳贵起未顺行 甲未乙申丙酉丁亥戊丑己子庚丑辛寅壬卯癸巳；
         阴贵起申逆行 甲丑乙子丙亥丁酉戊未己申庚子辛午壬巳癸卯。
         不得用八字神煞表 TIANYI 之表序推昼夜，歌诀甲戊庚牛羊……两贵本无昼夜义，
         其表序与昼夜对应各干不一（如乙[0]子为阴贵、壬[0]卯却是阳贵）。
         昼夜界从卯酉限（昼=卯…申、夜=酉…寅；考原主以日出入为定，取时通例以卯酉为限；
         通书另有子至巳用阳贵、午至亥用阴贵一说，于界时或有小异，两说并列备注）。
         卯酉辰戌四时兼占昼夜（《协纪》：卯酉辰戌时兼占昼夜，故一日有两时者；
         昼不得阳、夜不得阴则一日不得一时，皆依《协纪》原义）。
         月将：中气后换将，将=月支六合（雨水亥将、春分戌将……大寒子将）。
         钦定算例（本实现全部吻合）：雨水后甲日卯时阳贵（未）登天门、酉时阴贵（丑）登天门；
         大寒后甲日辰时阳贵、戌时阴贵。+5 为本站归纳量值。 */
      try{
        const GUI_YANG = {甲:'未',乙:'申',丙:'酉',丁:'亥',戊:'丑',己:'子',庚:'丑',辛:'寅',壬:'卯',癸:'巳'};
        const GUI_YIN  = {甲:'丑',乙:'子',丙:'亥',丁:'酉',戊:'未',己:'申',庚:'子',辛:'午',壬:'巳',癸:'卯'};
        const quy = ZHI_HOUR.indexOf(timeZhi);            // 时支序（子=0 夜半）
        const isDay = (quy>=3 && quy<9);                   // 昼=卯…申（卯酉为限）
        const isNight = (quy>=9 || quy<3);                 // 夜=酉…寅
        const isBJ = (quy===3||quy===4||quy===9||quy===10); // 卯酉辰戌兼占昼夜
        // 月将：中气后换将，将=月支六合。先取已过的最近中气定将
        const JIANG_BY_QI = {'雨水':'亥','春分':'戌','谷雨':'酉','小满':'申','夏至':'未','大暑':'午','处暑':'巳','秋分':'辰','霜降':'卯','小雪':'寅','冬至':'丑','大寒':'子'};
        let jiang = null;
        const jqs = r.lunar.getJieQiTable ? r.lunar.getJieQiTable() : null;
        if(jqs){
          const todayYmd = r.lunar.getSolar().toYmd();
          let best = null;
          for(const k in jqs){
            const nm = JIANG_BY_QI[k] ? k : String(k).replace(/^\{jq\.|\}$/g,'');
            if(!JIANG_BY_QI[nm]) continue;
            let ymd=''; try{ ymd = jqs[k].toYmd(); }catch(e){ continue; }
            if(ymd<=todayYmd && (!best || ymd>best.ymd)) best = {nm, ymd};
          }
          if(best) jiang = JIANG_BY_QI[best.nm];
        }
        if(jiang){
          // 登天时支 = 月将支 + (亥宫 - 贵人宫) 步：贵人宫起月将顺数，数至亥（天门）即止
          const target = ZHI_HOUR.indexOf('亥');
          const yangZhi = GUI_YANG[dayGan], yinZhi = GUI_YIN[dayGan];
          const dengOf = function(gz){ return ZHI_HOUR[(ZHI_HOUR.indexOf(jiang) + (target - ZHI_HOUR.indexOf(gz)) + 24) % 12]; };
          // 候选：昼验阳贵、夜验阴贵；卯酉辰戌兼占昼夜，两贵皆验，命中即记
          const cands = [];
          if(isDay || isBJ) cands.push({g:yangZhi, tag:'昼贵'});
          if(isNight || isBJ) cands.push({g:yinZhi, tag:'夜贵'});
          for(const c of cands){
            if(!c.g) continue;
            if(dengOf(c.g)===timeZhi){
              const w = 5; s += w; reasons.push('贵人登天时+'+w);
              shiNote = (shiNote?shiNote+'；':'')+'贵人登天时（'+c.tag+c.g+'、'+jiang+'将）';
              break; // 一时只记一次
            }
          }
        }
      }catch(e){}
    }

    // ⑧ 玄空紫白（仅玄空紫白派）：日家紫白飞星，中宫 + 坐山宫 星曜吉凶
    if(opts.school==='玄空紫白派'){
      const zb = dayZiBai(r);
      if(zb){
        const cw = ZB_STAR_W[zb.centerStar]||0;
        s += cw; reasons.push('紫白中宫'+zb.centerStar+(cw>=0?'+':'')+cw);
        if(opts.shanZhi && ZB_ZHI_FLY[opts.shanZhi]!=null){
          const ss = _zbStar(zb.k, ZB_ZHI_FLY[opts.shanZhi], zb.yin);
          const sw = ZB_STAR_W[ss]||0;
          s += sw; reasons.push('紫白坐山'+ss+(sw>=0?'+':'')+sw);
        } else {
          reasons.push('紫白中宫'+zb.centerStar);
        }
      }
    }

    const floor = fam.fangSha ? 0 : 30; // 造葬动土不保底，以暴露大凶日
    s = Math.max(floor, Math.min(100, Math.round(s)));
    // 通书每日吉凶神全录（lunar.js 官方《协纪辨方书》表），纯展示参考，不参与计分
    let tsJi = '', tsXiong = '';
    try{
      const _js = r.lunar.getDayJiShen ? r.lunar.getDayJiShen() : null;
      const _xs = r.lunar.getDayXiongSha ? r.lunar.getDayXiongSha() : null;
      if(_js && _js.length) tsJi = _js.join('、');
      if(_xs && _xs.length) tsXiong = _xs.join('、');
    }catch(e){}
    // 彭祖百忌 + 喜神/财神/福神方位（民俗展示层，不参与计分）
    let pz = '', fzXi = '', fzCai = '', fzFu = '';
    try{
      if(r.lunar.getPengZuGan) pz = (r.lunar.getPengZuGan()||'') + (r.lunar.getPengZuZhi ? r.lunar.getPengZuZhi() : '');
      if(r.lunar.getDayPositionXiDesc) fzXi = r.lunar.getDayPositionXiDesc();
      if(r.lunar.getDayPositionCaiDesc) fzCai = r.lunar.getDayPositionCaiDesc();
      if(r.lunar.getDayPositionFuDesc) fzFu = r.lunar.getDayPositionFuDesc();
    }catch(e){}
    return {
      score:s, reasons, geju:gj.map(g=>g.name+(g.good?'':'（凶）')),
      shensha:sha, zr, zhoutang:zt, zhiNote, shiNote, family:fam.name, kongwang:xk, school:opts.school||'',
      xiu: xiu ? xiu.text : '',
      jiuyao: jy ? jy.text : '',
      najia: nj ? ('纳甲'+nj.gua+'（'+nj.wx+'）') : '',
      tsJi, tsXiong, pz, fzXi, fzCai, fzFu
    };
  }

  window.ZERI = {
    SHAN_LIST, SHAN_ZHI, ZHI_BAGUA, CHONG, SANSHA, FAMILY,
    familyOf: ev=>FAMILY[FAMILY_OF[ev]||'tongyong'],
    familyDesc: ev=>(FAMILY[FAMILY_OF[ev]||'tongyong']||{}).desc||'',
    eventHasZhoutang: ev=>!!ZT_OF[ev],
    dayShensha, rikeGeju, zhouTang, zeriSha, jingzeScore, dayXiu, dayJiuYao
  };
})();
