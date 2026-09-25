/* ============================================================
   八字增强引擎 bazi-data.js
   依赖全局: Solar / Lunar (lunar-javascript)，app.js (GAN_WX/ZHI_WX/wxSpan)
   提供：
     - 行政区划经度库 PROV（省市区、县，本地内置，含东经）
     - 真太阳时校正 trueSolarTime()（本地天文算法，参考寿星天文历 EoT）
     - 早晚子时修正 + 五鼠遁 wuShuDun()
     - 十二长生(地势、自坐) getChangSheng()
     - 空亡 kongWang()
     - 四柱神煞引擎 pillarSha()（日干、年支、月支、日柱专属）
     - 五行统计与旺相休囚死 wangXiang()
     - 天干、地支 合化，生克 关系分析
     - 纳音 NAYIN_INFO（六十甲子逐条释义）
     - 详情词典 DICT（十神、神煞、纳音、长生、旺相、合化）
   ============================================================

   -------- 动态文案编码约定（本引擎尤须遵守）--------
   本文件大量动态拼接中文解读文案。全角括号只包裹确定不含全角括号的纯文本或标量；
   多值需分隔时改用间隔号或冒号，绝不写“开括号加拼接变量加闭括号”去包可能含括号的动态串。
   反例：把可能含括号的拼接串再包一层全角括号，拼成后即成括号套括号。
   静态检查按源码逐行扫描，扫不到运行时拼接产生的嵌套，故此处全靠书写时自查括号成对。
   ============================================================================ */

/* ===========================================================
   行政区划经度库（东经，度），本地内置，精确到区、县
   数据源自公开地理坐标，精确到 0.01°（对真太阳时误差 < 0.04 分，可忽略）
   真太阳时算法参考寿星天文历（sxwnl）：平太阳时 + 均时差 + 经度差
   经纬度表 PROV/PROV_COORD/PROV_CENTER 与 findLng/findLat/coordOf/provCenter
   由 assets/latlng.js 提供（全站唯一真源，需先于本文件加载）
   =========================================================== */

/* ---------- 五行生克 ---------- */
const WX_SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'}; // 我生
const WX_KE    = {木:'土',火:'金',土:'水',金:'木',水:'火'}; // 我克
/* 五行取本气阳干（全站单点真源）：把五行折成可入十二长生的阳干。
 * 用途：纳音自坐（纳音五行在本柱地支的十二长生，nayinZizuo）、事业议题喜用干回推（WX_TO_STEM[喜用五行]）等。
 * 阳干长生即该五行之气生处，如金（庚）长生在巳、死于子，故甲子纳音海中金在子为死。 */
const WX_TO_STEM = {木:'甲',火:'丙',土:'戊',金:'庚',水:'壬'};
/* ---------- 十神类映射唯一真源 ----------
 * 十神→类（比肩/劫财→比劫…）与 十神类→五行（比劫=日主、印星=生我、食伤=我生、财星=我克、官杀=克我）
 * 只在此定义一次；bazi-duanyu.js / bazi-core.js 等一律引用本真源（window.catToWx / 词法 TEN_CLASS），
 * 严禁另建同义表，同义表散落多处会造成喜忌双口径。
 */
const TEN_CLASS = {比肩:'比劫',劫财:'比劫',正印:'印星',偏印:'印星',食神:'食伤',伤官:'食伤',正财:'财星',偏财:'财星',正官:'官杀',七杀:'官杀'};
function tenClassOf(ten){ return TEN_CLASS[ten]||ten; }
function catToWx(cat, BZ){
  const dwx = GAN_WX[BZ.dayGan]; if(!dwx) return null;
  const grp = TEN_CLASS[cat]||cat;
  if(grp==='比劫') return dwx;
  if(grp==='印星') return shengWxOfC(dwx);
  if(grp==='食伤') return WX_SHENG[dwx];
  if(grp==='财星') return WX_KE[dwx];
  if(grp==='官杀') return keWxOfC(dwx);
  return null;
}
if(typeof window!=='undefined'){ window.TEN_CLASS=TEN_CLASS; window.tenClassOf=tenClassOf; window.catToWx=catToWx; }

/* ---------- 四柱宫位，身体，人事总表（顶层设计）----------
 * 消费方（事业六亲 / 性格脏腑等）一律读本真源，严禁另建同义表。
 * 依据：
 *  身体，四柱分治通行体系（命理医学）：年柱=头部（肩以上：脑神经/眼目/面/耳鼻齿舌/毛发）、
 *    月柱=胸部（肩至腰：肺/心/上焦）、日柱=腹部（腰/脐/小肠/消化，支含肾/大肠/膀胱/泌尿）、
 *    时柱=下肢（胯/腿/膝/踝/足/精血）。干支分治：天干主该段上部表浅（十干体外歌
 *    “甲头乙项丙肩求，丁心戊肋己属腹，庚是脐轮辛为股，壬是胫部癸为足”）、
 *    地支主该段下部深部（地支类象“子膀胱水道耳…戌命门腿踝足，亥水为头及肾囊”）。
 *  人事，六亲宫位体系事业化：年=祖辈父母宫（长辈根基人脉）、月=父母兄弟宫（同辈互动合作）、
 *    日=自身夫妻宫（自身+亲密搭档深度合作）、时=子女宫（晚辈传承下属）。
 */
const PILLAR_BODY = {
  年柱:{区域:'肩部以上', 天干:'头、面、脑、发、耳、鼻、齿', 地支:'颈项、咽喉、肩部'},
  月柱:{区域:'肩至腰（胸背）', 天干:'胸、背、上肢、上焦', 地支:'心肺、肝胆、肋'},
  日柱:{区域:'腰至胯（腹腰）', 天干:'腹、胃、肠', 地支:'肾、膀胱、大肠、小肠、生殖、泌尿'},
  时柱:{区域:'腰以下（下肢）', 天干:'胯、腿、膝、胫', 地支:'踝、足、下肢筋骨、精血'}
};
/* ============ 顶层，干支字去重列举（全局唯一，各模块统一调用） ============
 * 背景：命局四柱若天干/地支多柱同字（如四柱皆癸、皆亥），逐字罗列"癸癸癸癸"既冗长又易混。
 * 约定：凡"列举见哪些干支字"的文案（命局天干/地支、某十神透干字形等）统一经本函数去重，
 *      保留各字首次出现顺序、重复字只显一次（如 癸癸癸癸→癸，亥亥亥戌→亥戌）。
 * 注意：四柱表格/逐柱单元格（须保留每柱原样）不应用本函数。
 * 用法：dedupChars(['癸','癸','癸','癸']) → '癸'；也可传字符串 dedupChars('癸癸癸壬') → '癸壬'。 */
function dedupChars(list){
  if(typeof list === 'string') list = list.split('');
  const seen = new Set(), out = [];
  for(const x of list){ if(!x || x === '') continue; if(seen.has(x)) continue; seen.add(x); out.push(x); }
  return out.join('');
}
const PILLAR_CAREER = {
  年柱:'长辈、根基、人脉资源',
  月柱:'同辈、互动、合作',
  日柱:'自身、亲密搭档、深度合作',
  时柱:'晚辈、传承、下属'
};
/* 五行脏腑→柱位分野（供性格脏腑倾向挂柱位；与 PILLAR_BODY 同一体系）。
 * 土之脾不笼统定位于"月柱腹上"，脾由月干戊己土所主（天干主上表浅）、部位偏胸肋上腹，
 * 腹部胃肠系统由日柱统领（见需求表 1.3.1 分野考证）。 */
const WX_PILLAR_ZANG = {
  木:'肝胆分野在月柱肋下',
  火:'心分野在月柱胸膈、小肠在日柱腰腹',
  土:'脾分野看月干戊己土、胃分野在日柱腰腹',
  金:'肺分野在月柱胸膈、大肠在日柱下腹',
  水:'肾与膀胱分野在日柱下腹'
};

/* ---------- 脏腑特性养护总表 ZANG_CARE（脏腑→养护方向唯一真源，供健康卡脏腑旺衰挂养护建议）
 * 传统医学侧重各异：肝宜疏、心宜清、脾宜健、肺宜润、肾宜补，不能一概"旺清养、弱培补"千篇一律。
 * 每脏腑三态：[旺, 弱, 平]；字段值不含全角括号。 */
const ZANG_CARE = {
  '肝':['肝气偏旺，宜疏肝理气、畅达情志防郁化','肝血不足，宜养肝补血、濡筋明目','肝气平和，宜疏调守中'],
  '胆':['胆气偏旺，宜清胆泄热、利胆舒畅','胆气不足，宜养胆宁神、勿多虑','胆气平和，宜畅达少阳'],
  '心':['心火易亢，宜清泻心火、宁心安神','心血不足，宜养心安神、调摄情志','心气平和，宜养神敛心'],
  '小肠':['小肠火偏旺，宜清利小肠、导火下行','小肠气弱，宜温养小肠、助泌别','小肠气平，宜和调泌别'],
  '脾':['脾气壅，宜健脾化湿、和胃消滞','脾气虚弱，宜健脾益气、培补中州','脾气平和，宜养中气'],
  '胃':['胃气偏亢，宜和胃降逆、消导滞','胃气不足，宜养胃生津、助运化','胃气平和，宜和胃养中'],
  '命门':['命门火旺，宜引火归元、防相火妄动','命门火衰，宜温补命门、培元','命门平和，宜守元温养'],
  '肺':['肺金气燥，宜清肺润燥、肃降理气','肺气不足，宜补肺益气、润养','肺气平和，宜养肺肃降'],
  '大肠':['大肠气燥，宜润肠通便、理气','大肠虚寒，宜温养大肠、助传导','大肠气平，宜理肠传导'],
  '肾':['肾气偏亢，宜平补肾阴、防相火妄动','肾气不足，宜补肾固本、培元化气','肾气平和，宜固肾藏精'],
  '膀胱':['膀胱气滞，宜通利膀胱、化气行水','膀胱气弱，宜温固膀胱、助气化','膀胱气平，宜和调水道'],
  '水道':['水道气滞，宜通利水道','水道不固，宜固摄水道','水道气平，宜畅调水道'],
  '经络':['经络气滞，宜通络活血','经络失养，宜滋养经络','经络气平，宜通和脉络'],
  '脊':['脊气受动，宜护脊养肾','脊骨失养，宜补肾强脊','脊之平和，宜养脊固肾'],
  '膈':['膈气受制，宜宽膈和中','膈气不足，宜养膈和中','膈气平和，宜宽中和膈'],
  '筋脉':['筋脉气强，宜柔筋养血','筋脉失濡，宜养肝濡筋','筋脉平和，宜柔养筋脉']
};

/* ---------- 干支对应脏腑总表 GAN_ZANG / ZHI_ZANG（干支→脏腑唯一真源，禁另建同义表）----------
 * 天干，《针灸大全·十二经纳天干歌》：甲胆乙肝丙小肠，丁心戊胃己脾乡，庚属大肠辛属肺，壬属膀胱癸肾脏；
 *   三焦亦向壬中寄，包络同归入癸方（另有《针灸逢源》"三焦归丙、包络归丁"之异说，此处取主流旧云）。
 * 地支，《十二地支人体类象歌诀》：子属膀胱水道耳，丑为胞肚及脾乡，寅胆发脉并两手，卯木十指内肝方，
 *   辰土为皮肩胸类，巳面齿咽下尻肛，午火精神司眼目，未土胃脘隔脊梁，申金大肠经络肺，酉中精血小肠藏，
 *   戌胃命门腿踝足，亥水为头及肾囊；脏器名兼采藏干所属（辰藏戊土主胃、巳午藏火主心、未藏己土主脾、
 *   酉藏辛金主肺、戌藏戊土主胃）。字段值不含全角括号（消费方拼外层括号时防嵌套）。
 */
const GAN_ZANG = {
  甲:'胆', 乙:'肝', 丙:'小肠', 丁:'心', 戊:'胃', 己:'脾',
  庚:'大肠', 辛:'肺', 壬:'膀胱、三焦', 癸:'肾、心包络'
};
const ZHI_ZANG = {
  子:'膀胱、水道、耳', 丑:'脾、胞肚、腹肌', 寅:'胆、筋脉、两手', 卯:'肝、十指、神经',
  辰:'胃、皮肤、肩胸', 巳:'心、面、齿、咽、肛门', 午:'心、眼目、精神', 未:'胃、脾、脊梁、膈膜',
  申:'大肠、肺、经络', 酉:'肺、精血、小肠', 戌:'命门、胃、腹肌、腿踝足', 亥:'肾、头、生殖泌尿'
};

/* ---------- 五行关系总表 WX_FIVE（唯一真源，全站五行对应统一调用，禁另建同义表）----------
 * 每五行 20 维对应（含四隅方位）。依据：《素问·阴阳应象大论》五方/五色/五味/五脏/五体/五志/五液、
 * 《洪范》五事、河图洛书五数、五音角徵宫商羽、五常仁义礼智信；五经配五行取通行说（木《乐》火《礼》土《诗》金《书》水《易》）。
 * 四隅方位按后天八卦：东北艮土、东南巽木、西南坤土、西北乾金（正位：东木南火西金北水，中央土）。
 */
const WX_FIVE = {
  木:{ 方:'东', 四隅:'东南（巽）', 色:'青', 季:'春', 兽:'青龙', 音:'角', 数:'3、8', 味:'酸', 常:'仁', 经:'《乐》', 事:'貌', 脏:'肝', 腑:'胆', 体:'筋', 志:'怒', 恶:'风', 液:'泪', 劳:'久行伤筋', 指:'食指', 官:'目' },
  火:{ 方:'南', 四隅:'—', 色:'赤', 季:'夏', 兽:'朱雀', 音:'徵', 数:'2、7', 味:'苦', 常:'礼', 经:'《礼》', 事:'视', 脏:'心', 腑:'小肠', 体:'脉', 志:'喜', 恶:'热', 液:'汗', 劳:'久视伤血', 指:'中指', 官:'舌' },
  土:{ 方:'中', 四隅:'东北（艮）、西南（坤）', 色:'黄', 季:'长夏', 兽:'黄龙', 音:'宫', 数:'5、10', 味:'甘', 常:'信', 经:'《诗》', 事:'思', 脏:'脾', 腑:'胃', 体:'肉', 志:'思', 恶:'湿', 液:'涎', 劳:'久坐伤肉', 指:'大拇指', 官:'口' },
  金:{ 方:'西', 四隅:'西北（乾）', 色:'白', 季:'秋', 兽:'白虎', 音:'商', 数:'4、9', 味:'辛', 常:'义', 经:'《书》', 事:'言', 脏:'肺', 腑:'大肠', 体:'皮毛', 志:'悲', 恶:'燥', 液:'涕', 劳:'久卧伤气', 指:'无名指', 官:'鼻' },
  水:{ 方:'北', 四隅:'—', 色:'黑', 季:'冬', 兽:'玄武', 音:'羽', 数:'1、6', 味:'咸', 常:'智', 经:'《易》', 事:'听', 脏:'肾', 腑:'膀胱', 体:'骨', 志:'恐', 恶:'寒', 液:'唾', 劳:'久立伤骨', 指:'小指', 官:'耳' }
};
/* 四隅方位 → 五行（后天八卦，供方位五行判定：东北艮土、东南巽木、西南坤土、西北乾金） */
const WX_CORNER = { '东北':'土','东南':'木','西南':'土','西北':'金' };

/* ---------- 四柱多维对应总表 PILLAR_MAP（统一调用）----------
 * 把四柱各维度的“一一对应”关系收编于此，消费方（四卡/神煞落宫/运势等）一律读本表，
 * 严禁在消费方另建同义映射。各维度依据：
 *  六亲宫位，《三命通会》宫位论：年上祖上、月上父母兄弟、日上自身妻财、时上子女。
 *  人生阶段，通行四柱管岁（约数）：年 1-16 童少年 / 月 17-32 青年 / 日 33-48 中年 / 时 49 后晚年。
 *  四柱之喻，经典“年为根、月为苗、日为花、时为果”。
 *  神煞落宫，与项目 PILLAR_MARRY_NOTE 同口径（年=早年家门祖上 / 月=青年环境父母 /
 *    日=自身夫妻宫 / 时=晚运情缘子女）。
 *  社会圈层/身心层次/财富阶段/环境远近，由六亲宫位体系事业化、生活化推演（不另设依据）。
 *  约定：字段值一律不含全角括号（消费方常拼入外层括号，嵌套会违规，见本文件顶部文案编码约定）；
 *    解释性内容（祖父母外祖父母、日支为夫妻宫、正缘等）入本注释，不入字段值。
 */
const PILLAR_MAP = {
  年柱:{
    六亲宫位:'祖辈宫', /* 祖辈宫（祖父母、外祖父母） */
    人生阶段:'早年（1-16 岁，童少年）',
    四柱之喻:'根（根基、祖上）',
    神煞落宫:'早年家门、祖上根基',
    社会圈层:'长辈、权威、祖荫',
    身心层次:'先天禀赋、精神根基',
    财富阶段:'祖业、遗产',
    环境远近:'远（社会背景、出生根基）'
  },
  月柱:{
    六亲宫位:'父母宫、兄弟宫',
    人生阶段:'青年（17-32 岁）',
    四柱之喻:'苗（月令提纲、生长环境）',
    神煞落宫:'青年环境、父母教养',
    社会圈层:'同辈、朋友、同僚',
    身心层次:'气质教养、情绪底色',
    财富阶段:'青年置业',
    环境远近:'中（社交圈、职场）'
  },
  日柱:{
    六亲宫位:'自身宫、夫妻宫', /* 自身宫（日支为夫妻宫） */
    人生阶段:'中年（33-48 岁）',
    四柱之喻:'花（自身、夫妻）',
    神煞落宫:'自身、夫妻宫、正缘',
    社会圈层:'核心圈（配偶、密友、贴身搭档）',
    身心层次:'本我心性、内在',
    财富阶段:'中年成业',
    环境远近:'近（家庭核心、自我）'
  },
  时柱:{
    六亲宫位:'子女宫',
    人生阶段:'晚年（49 岁后）',
    四柱之喻:'果（归宿、子女、晚景）',
    神煞落宫:'晚运、情缘、子女',
    社会圈层:'晚辈、下属、门生',
    身心层次:'归宿、晚景心性',
    财富阶段:'晚年守成、传家',
    环境远近:'未来（晚景、传承）'
  }
};
if(typeof window!=='undefined'){ window.PILLAR_BODY=PILLAR_BODY; window.PILLAR_CAREER=PILLAR_CAREER; window.WX_PILLAR_ZANG=WX_PILLAR_ZANG; window.PILLAR_MAP=PILLAR_MAP; window.WX_FIVE=WX_FIVE; window.WX_CORNER=WX_CORNER; window.GAN_ZANG=GAN_ZANG; window.ZHI_ZANG=ZHI_ZANG; window.ZANG_CARE=ZANG_CARE; }
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const YANG = ['甲','丙','戊','庚','壬','子','寅','辰','午','申','戌']; // 阳干+阳支
/* ---------- 阴阳论命 顶层真源：十干象 + 四象五行阴阳 ----------
 * 消费约定：阴阳总纲折叠块、性格卡十干性情、有情无情视角（十神阴阳）统一读本表；
 *   阳/阴判定一律用 YANG 表（上方），禁另建同义表。
 * 依据：《滴天髓·天干论》（十干象与性情）、任铁樵注"阴阳本乎太极，五行播于四时"（四象五行）。
 */
const GAN_NATURE = {
  '甲':{yy:'阳',xiang:'参天大树',xing:'仁厚正直、有进取心',src:'《滴天髓·天干论》'},
  '乙':{yy:'阴',xiang:'花草藤萝',xing:'柔韧细腻、善谋多虑',src:'《滴天髓·天干论》'},
  '丙':{yy:'阳',xiang:'太阳之火',xing:'热情礼敬、光明磊落',src:'《滴天髓·天干论》'},
  '丁':{yy:'阴',xiang:'灯烛星火',xing:'心思细腻、注重细节',src:'《滴天髓·天干论》'},
  '戊':{yy:'阳',xiang:'高山厚土',xing:'厚重诚信、包容稳重',src:'《滴天髓·天干论》'},
  '己':{yy:'阴',xiang:'田园湿土',xing:'温顺细心、务实多思',src:'《滴天髓·天干论》'},
  '庚':{yy:'阳',xiang:'刀剑顽金',xing:'刚毅果断、重义守信',src:'《滴天髓·天干论》'},
  '辛':{yy:'阴',xiang:'珠玉细金',xing:'精致冷静、重情善感',src:'《滴天髓·天干论》'},
  '壬':{yy:'阳',xiang:'江河大水',xing:'灵动智慧、善变多谋',src:'《滴天髓·天干论》'},
  '癸':{yy:'阴',xiang:'雨露之水',xing:'温柔内敛、感知敏锐',src:'《滴天髓·天干论》'}
};
const WX_SIXIANG = {
  木:'少阳（阳之始、阴消阳长）',火:'太阳（阳极）',土:'中和（阴阳交会、承载万物）',
  金:'少阴（阴之始、阳消阴长）',水:'太阴（阴极）'
};
function zhiOpp(z){ const i=ZHI_ORDER.indexOf(z); return ZHI_ORDER[(i+6)%12]; }

/* 公历闰年、月长、真太阳时校正由全站共享库 assets/xuanji-lib.js 提供，全站唯一真源 */

/* ---------- 时辰 ---------- */
const ZHI_HOUR = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

/* ---------- 五鼠遁：日上起时 ---------- */
const WUSHU = {甲:0,乙:2,丙:4,丁:6,戊:8,己:0,庚:2,辛:4,壬:6,癸:8};
function wuShuDun(dayGan, zhiIdx){
  const g = (WUSHU[dayGan] + zhiIdx) % 10;
  return GAN[g] + ZHI_HOUR[zhiIdx];
}

/* ---------- 早晚子时修正 ----------
   入参 (y,m,d,h,mi) 已是“真太阳时校正后的本地真太阳时刻”。
   子时窗口为本地真太阳时刻 23:00–01:00，日界判定以此为准：
     晚子时(late)：23:00–01:00 全部归次日（日柱、时柱均按次日日干遁子）。
     早子时(early)：23:00–24:00 归当日（时柱按当日子时），00:00–01:00 归次日。
   注意：00:00–01:00 在两种约定下恒为“次日子时”，必须 +1 日；
   仅处理 h===23 会令 00:xx 出生（如凌晨 0:30）在两模式下都错误沿用当日日柱。 */
function adjustZiShi(y,m,d,h,mi,mode){
  if(h===23){
    if(mode==='late'){
      const solar = Solar.fromYmd(y,m,d).nextDay(1);
      return {y:solar.getYear(), m:solar.getMonth(), d:solar.getDay(), h:0, mi,
              note:'晚子时：23时后归次日，日柱按时干遁'};
    }
    /* early：23:00–24:00 仍归当日，日柱不变、时柱按当日子时 */
    return {y,m,d,h:23,mi, note:'早子时：23时仍归当日，日柱不变'};
  }
  if(h===0){
    /* 00:00–01:00 在两种约定下均属“次日子时”，日柱、时柱均按次日 */
    const solar = Solar.fromYmd(y,m,d).nextDay(1);
    return {y:solar.getYear(), m:solar.getMonth(), d:solar.getDay(), h:0, mi,
            note:(mode==='late'?'晚子时':'早子时')+'：00时后归次日，日柱按时干遁'};
  }
  return {y,m,d,h,mi, note:''};
}

/* ---------- 十二长生（日干在某地支的状态）---------- */
const CHANGSHENG = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
/* 十二长生（火土同宫派，子平主流）：戊土随丙长生在寅、己土随丁长生在酉；
   阳干顺行、阴干逆行（阴干长生为次等根，流派依《渊海子平》）。另有水土同宫派（土长生申），本站不采用。 */
const CS_START = {甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'};
function getChangSheng(gan, zhi){
  const start = CS_START[gan];
  const si = ZHI_ORDER.indexOf(start), zi = ZHI_ORDER.indexOf(zhi);
  if(si<0||zi<0) return '';
  const yang = YANG.indexOf(gan) >= 0;
  const idx = yang ? (zi - si + 12) % 12 : (si - zi + 12) % 12;
  return CHANGSHENG[idx];
}

/* ---------- 空亡（旬空）---------- */
const KONG = [['戌','亥'],['申','酉'],['午','未'],['辰','巳'],['寅','卯'],['子','丑']];
function kongWang(gz){
  const g = GAN.indexOf(gz[0]), z = ZHI_ORDER.indexOf(gz[1]);
  if(g<0||z<0) return [];
  let n1 = ((g+1)*6 - (z+1)*5) % 60; if(n1<=0) n1+=60;
  return KONG[Math.floor((n1-1)/10)];
}

/* ============================================================
   四柱神煞引擎
   ============================================================ */
const TIANYI = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']};
const WENCHANG = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
/* 羊刃取法，历代有两派并存，本站并列同出。
 * 帝旺派（阴阳同取帝旺，阳顺阴逆，清《星平会海》后主流校正）：甲卯、乙寅、丙午、丁巳、戊午、己巳、庚酉、辛申、壬子、癸亥。
 *   依据：羊刃取"盛极为刃"义，不论阴阳，皆从临官（禄）前一位之帝旺取；戊刃在午随丙（火土同宫）。
 * 禄前派（阳干取帝旺、阴干取禄前一辰，即《星平会海》诀）：甲卯、乙辰、丙午、丁未、戊午、己未、庚酉、辛戌、壬子、癸丑。
 *   依据：《三车一览》"羊刃常居禄前一辰"；阴干在此派落于冠带（乙辰、丁未、己未、辛戌、癸丑）。
 * 阳干两派一致（甲卯、丙午、戊午、庚酉、壬子），分歧只在阴干。 */
const YANGREN = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'};
const YANGREN_LUQIAN = {甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'};
const LU = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const TAIJI = {甲:['子','午'],乙:['子','午'],丙:['卯','酉'],丁:['卯','酉'],戊:['辰','戌','丑','未'],己:['辰','戌','丑','未'],庚:['寅','亥'],辛:['寅','亥'],壬:['巳','申'],癸:['巳','申']};
/* 福星贵人（《三命通会》甲丙相邀入虎乡歌）：甲丙见寅子、乙癸见卯丑、戊见申、己见未、丁见亥、
   庚见午、辛见巳、壬见辰。甲丙乙癸原本两见，此处各取其前一位，与查法"见其一即是"一致。 */
const FUXING = {甲:'寅',乙:'丑',丙:'子',丁:'亥',戊:'申',己:'未',庚:'午',辛:'巳',壬:'辰',癸:'卯'};
// 天厨贵人 = 食神之禄
function shiShenGan(dg){ const wx=WX_SHENG[GAN_WX[dg]]; for(const g of GAN){ if(GAN_WX[g]===wx && (YANG.indexOf(g)>=0)===(YANG.indexOf(dg)>=0)) return g; } return null; }
const TIANCHU = {}; GAN.forEach(g=>{ const sg=shiShenGan(g); if(sg) TIANCHU[g]=LU[sg]; });
// 顶层设计：用途句（geUse.xi/ji）在数据层编译一次成结构化十神类集与五行集，消费方直接读结构化字段，不解析句子文本。
// 解析规则：① 先剥离括号注释（如"身弱须兼用印比扶身"），只解析用途主句；② 动词前=施动/主题→加入；
// ③ 受益动词(生/护/配)后=目的→加入；④ 受害动词(夺/分/争/见/制/泄/克/刑/冲/害/破)后=受动对象→不加（方向相反，如"比劫夺财"的财不进忌神集）；
// ⑤ "无X则孤"类跳过（缺而可惜者方向相反）；⑥ 先剔除"伤官"再查"官"，防误入官杀。
function extractCats(str){
  const out=new Set();
  const add=(x)=>{ if(!x) return;
    const nx=x.replace(/伤官/g,'');
    if(/官|杀/.test(nx)) out.add('官杀');
    if(/印|枭/.test(x)) out.add('印星');
    if(/食|伤/.test(x)) out.add('食伤');
    if(/劫|比|刃/.test(x)) out.add('比劫');
    if(/财/.test(x)) out.add('财星'); };
  (str||'').replace(/[（(][^）)]*[）)]/g,'').split(/[、,，，]/).forEach(t=>{
    const tt=t.trim(); if(!tt||/^无/.test(tt)) return;
    const verb=tt.match(/[生护配制夺分争见泄克刑冲害破化驾伏合去解调]/);
    if(!verb){ add(tt); return; }
    const head=tt.slice(0,verb.index), tail=tt.slice(verb.index+1);
    if(head) add(head);
    else if(!/^[官杀印食伤劫比刃财]/.test(tail)) add(tail);
    if(/[生护配]/.test(tt)) add(tail);
  });
  return Array.from(out);
}
/* 飞刃 = 羊刃之冲，随帝旺派主口径取冲：甲酉、乙申、丙子、丁亥、戊子、己亥、庚卯、辛寅、壬午、癸巳。 */
const FEIREN = {}; GAN.forEach(g=> FEIREN[g]=zhiOpp(YANGREN[g]));
/* 血刃取法（《三命通会》血刃歌诀，按日干起）：甲乙见午、丙丁见未、戊己见辰、庚辛见酉、壬癸见申。 */
const XUEREN={甲:'午',乙:'午',丙:'未',丁:'未',戊:'辰',己:'辰',庚:'酉',辛:'酉',壬:'申',癸:'申'};
// 顶层设计（第二刀）：十神类→五行派生。普通格用神类集按日主五行映射；外格 xi/ji 直接是五行名，取五行字符。
function structWxOf(cats, raw, dwx, isOuter){
  const set=new Set();
  if(isOuter){
    String(raw||'').replace(/[（(][^）)]*[）)]/g,'').split(/[、,，，]/).forEach(t=>{ const x=t.trim(); if('木火土金水'.indexOf(x)>=0) set.add(x); });
  } else {
    const CAT_WX={ '食伤':WX_SHENG[dwx], '财星':WX_KE[dwx], '官杀':keWxOfC(dwx), '印星':shengWxOfC(dwx), '比劫':dwx };
    (cats||[]).forEach(c=>{ const w=CAT_WX[c]; if(w) set.add(w); });
  }
  return Array.from(set);
}
function keWxOfC(dwx){ for(const w in WX_KE) if(WX_KE[w]===dwx) return w; return null; }
function shengWxOfC(dwx){ for(const w in WX_SHENG) if(WX_SHENG[w]===dwx) return w; return null; }
// 顶层设计（第四刀）：具体十神名→十神类，精确枚举表。消灭"伤官含官""劫财含财"类单字子串匹配
// （如 spouse.indexOf('官') 会把"伤官"误判为官杀）。标准十神名：比肩/劫财/食神/伤官/偏财/正财/七杀/正官/偏印/正印
function godClass(god){
  const T=(typeof TEN_CLASS!=='undefined')?TEN_CLASS:{'比肩':'比劫','劫财':'比劫','食神':'食伤','伤官':'食伤','偏财':'财星','正财':'财星','七杀':'官杀','正官':'官杀','偏印':'印星','正印':'印星'}; // 十神→类：统一引用顶层唯一真源 TEN_CLASS
  return T[god]||'';
}
// 顶层设计（第五刀）：地支关系文本统一为"类型字+宫位(支)"格式（如"冲年支(子)"），首字符即关系类型。
// relTypeOf 提取类型字，替代 xxx.indexOf('冲') 类任意位置子串匹配（依赖文本巧合，非结构保证）。
function relTypeOf(r){ const m=String(r||'').match(/^(冲|合|刑|害|破)/); return m?m[1]:''; }
const HONGYAN = {甲:'午',乙:'申',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'};
// 三合局
const JU = {水:['申','子','辰'],火:['寅','午','戌'],金:['巳','酉','丑'],木:['亥','卯','未']};
const JU_OF = {}; Object.keys(JU).forEach(k=>JU[k].forEach(z=>JU_OF[z]=k));
const YIMA={水:'寅',火:'申',金:'亥',木:'巳'};
const TAOHUA={水:'酉',火:'卯',金:'午',木:'子'};
const HUAGAI={水:'辰',火:'戌',金:'丑',木:'未'};
const JIANGXING={水:'子',火:'午',金:'酉',木:'卯'};
const JIESHA={水:'巳',火:'亥',金:'寅',木:'申'};
const ZAISHA={水:'午',火:'子',金:'卯',木:'酉'};
const WANGSHEN={水:'亥',火:'巳',金:'申',木:'寅'};
// 年支类
const FANG={寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥',亥:'寅',子:'寅',丑:'寅'};
const FANG_GUA={寅:'丑',卯:'丑',辰:'丑',巳:'辰',午:'辰',未:'辰',申:'未',酉:'未',戌:'未',亥:'戌',子:'戌',丑:'戌'};
const HONGLUAN={子:'卯',丑:'寅',寅:'丑',卯:'子',辰:'亥',巳:'戌',午:'酉',未:'申',申:'未',酉:'午',戌:'巳',亥:'辰'};
const TIANXI={}; Object.keys(HONGLUAN).forEach(z=> TIANXI[z]=zhiOpp(HONGLUAN[z]));
const SANGMEN={}; ZHI_ORDER.forEach((z,i)=> SANGMEN[z]=ZHI_ORDER[(i+2)%12]);
const DIAOKE={}; ZHI_ORDER.forEach((z,i)=> DIAOKE[z]=ZHI_ORDER[(i+10)%12]);
/* 破碎煞（《三命通会·论破碎》：此煞三名吟呻、破碎、白衣）：子午卯酉见巳、寅申巳亥见酉、辰戌丑未见丑 */
const POSUI={}; ZHI_ORDER.forEach(z=> POSUI[z]= (['子','午','卯','酉'].indexOf(z)>=0)?'巳':(['寅','申','巳','亥'].indexOf(z)>=0)?'酉':'丑');
// 月德 / 天德（月柱）
const YUEDE_TG={}; Object.keys(JU).forEach(k=>{ const tg={水:'壬',火:'丙',金:'庚',木:'甲'}[k]; JU[k].forEach(z=> YUEDE_TG[z]=tg); });
const YUEDE_HE={丙:'辛',壬:'丁',甲:'己',庚:'乙'};
const TIANDE={寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'};
// 天德合（月支查，见参考歌诀）：寅壬、卯巳、辰丁、巳丙、午寅、未己、申戊、酉亥、戌辛、亥庚、子申、丑乙
const TIANDE_HE={寅:'壬',卯:'巳',辰:'丁',巳:'丙',午:'寅',未:'己',申:'戊',酉:'亥',戌:'辛',亥:'庚',子:'申',丑:'乙'};
// 披麻（年支后三位，即年支+9）：子酉、丑戌、寅亥、卯子、辰丑、巳寅、午卯、未辰、申巳、酉午、戌未、亥申
const PIMA={子:'酉',丑:'戌',寅:'亥',卯:'子',辰:'丑',巳:'寅',午:'卯',未:'辰',申:'巳',酉:'午',戌:'未',亥:'申'};
// 元辰（又名大耗）：阳男阴女用 A，阴男阳女用 B，年支查余支
const YUAN_CHEN_A={子:'未',丑:'申',寅:'酉',卯:'戌',辰:'亥',巳:'子',午:'丑',未:'寅',申:'卯',酉:'辰',戌:'巳',亥:'午'};
const YUAN_CHEN_B={子:'巳',丑:'午',寅:'未',卯:'申',辰:'酉',巳:'戌',午:'亥',未:'子',申:'丑',酉:'寅',戌:'卯',亥:'辰'};
// 十灵日（查日柱）
const SHI_LING=['甲辰','乙亥','丙辰','丁酉','戊午','庚戌','庚寅','辛亥','壬寅','癸未'];
// 六秀日（查日柱）
const LIU_XIU=['丙午','丁未','戊子','戊午','己丑','己未'];
// 天转 / 地转（月支查日柱）：春、夏/秋、冬
const TIAN_ZHUAN={春:'乙卯',夏:'丙午',秋:'辛酉',冬:'壬子'};
const DI_ZHUAN={春:'辛卯',夏:'戊午',秋:'癸酉',冬:'丙子'};
// 日柱专属
const KUI_GANG=['庚戌','庚辰','壬辰','戊戌'];
const JINSHEN=['乙丑','己巳','癸酉'];
// 外格杂格（日柱/时柱特殊格局，独立于正格八格与变格专旺/从/两气/化气）
// 全表：子平外格之主要者，凡命局符合即识别，供格局用神行补充标注（不覆盖正格/变格取格）。
const ZAGE_DEF=[
  // pri=成格严格度（成格条件越苛刻、越贵，主格越优先）：三合/看全柱贵格高，仅日柱离散格低
  {n:'魁罡格', pri:10, d:['庚戌','庚辰','壬辰','戊戌'], xi:'印星、比劫', ji:'财星、官杀', yun:'喜身强运任之，忌财官显露、刑冲克破', note:'刚烈果决、掌权持重；喜身强、印比助。'},
  {n:'金神格', pri:10, d:['乙丑','己巳','癸酉'], xi:'火', ji:'水', yun:'行火乡最吉，水乡则凶', note:'刚毅武贵、性烈。'},
  {n:'壬骑龙背格', pri:20, c:BZ=>BZ.dayGan==='壬'&&(BZ.zhis[3]==='辰'||BZ.zhis.filter(z=>z==='辰').length>=2)&&BZ.zhis[1]!=='辰', xi:'比劫、印星', ji:'财星、官杀', yun:'喜寅辰拱合，忌戌亥冲破', note:'壬日见辰（辰多尤妙），龙背驼财官。'},
  {n:'六乙鼠贵格', pri:28, c:BZ=>BZ.dayGan==='乙'&&BZ.zhis[3]==='子'&&BZ.zhis.indexOf('午')<0, xi:'印星', ji:'官杀', yun:'贵在子，忌午冲丑绊', note:'乙日子时，鼠贵暗合申中庚官；喜子水清贵。'},
  {n:'日贵格', pri:8, d:['丁酉','丁亥','癸卯','癸巳'], xi:'比劫、印星', ji:'财星、官杀', yun:'喜贵人明现，忌空冲', note:'丁癸坐天乙贵人（酉亥卯巳），主贵气、得助。'},
  {n:'日德格', pri:8, d:['甲寅','丙辰','戊辰','庚辰','壬戌'], xi:'印星、比劫', ji:'财星、官杀', yun:'喜身强不犯刑冲', note:'五日坐德，性慈、逢凶化吉；喜身强、印助。'},
  // 井栏叉：庚日申子辰三合水局；时柱见丙丁火（天干）或巳午（地支）则破格（古籍时遇丙子乃偏官见巳午破格）。
  // 典籍改立细则（多方验证：《渊海子平》卷二内十八格原文"若是遇丙子，则是偏官；若时是申时，则是归禄格，
  // 而非井栏叉矣"；《三命通会》卷六"时遇丙子，为时上偏官，甲申为日禄归时，难成此格"，
  // 两典一致），井栏叉格自足成立（申子辰全、无寅午戌、无丙丁巳午）后，还须排除两种"改立"时柱：
  //   ① 时支申（庚日申时＝日禄归时）→ 归禄格，非井栏叉（本表另立"归禄格"条接手判定）；
  //   ② 时柱丙子（天干丙火透）→ 时上偏官（丙丁破格之特例，丙丁时干已拦，天然排除，注文明示）；
  // 《三命通会》另有"时遇子申，其福减半"之说：时逢子或申虽不减为它格（子时仍是井栏叉、申时改归禄），
  // 然福气不全，故评分层（zeri-zaoming）对时支子/申者另设"福减半"减分条，识别与量值两层分开。
  {n:'井栏叉格', pri:40, c:BZ=>BZ.dayGan==='庚'&&['申','子','辰'].every(z=>BZ.zhis.indexOf(z)>=0)&&!['寅','午','戌'].some(z=>BZ.zhis.indexOf(z)>=0)&&!['丙','丁'].includes(BZ.gans[3])&&!['巳','午'].includes(BZ.zhis[3])&&BZ.zhis[3]!=='申'&&!(BZ.gans[3]==='丙'&&BZ.zhis[3]==='子'), xi:'金、水', ji:'火', yun:'喜水局纯，忌冲坏', note:'庚日申子辰三合水局（井栏叉），冲出寅中丙火；时柱见丙丁火或巳午地支则破格；时支申为日禄归时（归禄格）、时柱丙子为时上偏官，皆改立它格而非井栏叉（《渊海子平》《三命通会》同此说）；时遇子申其福减半。'},
  // 归禄格（日禄归时）：庚日申时（申为庚禄），古法专指（《渊海子平》井栏叉条"若时是申时，则是归禄格"）。
  // pri 取 12（日柱自坐禄位即得，条件与魁罡、日德同量级；远苛于三合局全之井栏叉 40）。
  {n:'归禄格', pri:12, c:BZ=>BZ.dayGan==='庚'&&BZ.zhis[3]==='申', xi:'印星、比劫', ji:'财星、官杀', yun:'喜禄旺身强，忌刑冲破禄', note:'庚日申时，日禄归时（归禄格）；《渊海子平》井栏叉条明言"若时是申时，则是归禄格，而非井栏叉矣"。'},
  {n:'丑遥巳格', pri:20, c:BZ=>BZ.dayGan==='辛'&&(BZ.zhis[3]==='丑'||BZ.zhis.filter(z=>z==='丑').length>=2)&&BZ.zhis[1]!=='丑'&&BZ.zhis.indexOf('子')<0&&BZ.zhis.indexOf('巳')<0, xi:'官杀、比劫', ji:'印星', yun:'丑多遥巳为用', note:'辛日见丑，遥合巳中丙官；喜丑多无子绊。'},
  {n:'子遥巳格', pri:20, c:BZ=>BZ.dayGan==='甲'&&(BZ.zhis[3]==='子'||BZ.zhis.filter(z=>z==='子').length>=2)&&BZ.zhis[1]!=='子'&&BZ.zhis.indexOf('丑')<0&&BZ.zhis.indexOf('巳')<0, xi:'食伤、财星', ji:'官杀', yun:'忌巳填实', note:'甲日见子，遥合巳中丙戊；喜子多无丑绊。'},
  {n:'财官双美格', pri:8, d:['壬午','癸巳'], xi:'比劫、印星', ji:'食伤', yun:'财官同宫，喜旺忌破', note:'日坐财官（壬午、癸巳），财官双美。'},
  {n:'飞天禄马格', pri:20, d:['庚子','壬子','辛亥','癸亥'], xi:'比劫、印星', ji:'财星、官杀', yun:'喜冲，忌实忌合', note:'庚壬辛亥癸坐子亥，冲出巳中丙戊官杀（飞天禄马）；喜局中无子绊。'},
  {n:'六阴朝阳格', pri:20, c:BZ=>BZ.dayGan==='辛'&&BZ.zhis[3]==='子', xi:'食伤', ji:'官杀', yun:'朝阳喜清，忌午冲丑绊', note:'辛日子时（戊子时），朝阳（巳中丙官）；喜水局清。'},
  {n:'六甲趋乾格', pri:20, c:BZ=>BZ.dayGan==='甲'&&(BZ.zhis[3]==='亥'||BZ.zhis.filter(z=>z==='亥').length>=2)&&BZ.zhis[1]!=='亥', xi:'印星', ji:'食伤', yun:'亥为天门，喜润忌刑冲', note:'甲日见亥（亥为乾），趋乾得贵。'},
  {n:'六壬趋艮格', pri:20, c:BZ=>BZ.dayGan==='壬'&&(BZ.zhis[3]==='寅'||BZ.zhis.filter(z=>z==='寅').length>=2)&&BZ.zhis[1]!=='寅', xi:'食伤', ji:'印星', yun:'寅为艮山，喜木生忌申', note:'壬日见寅（寅为艮），趋艮得禄。'},
  {n:'勾陈得位格', pri:20, c:BZ=>BZ.dayGan==='戊'&&['寅','卯','辰'].indexOf(BZ.zhis[2])>=0&&['寅','卯','辰'].indexOf(BZ.zhis[1])<0, xi:'官杀', ji:'比劫', yun:'土得位喜木疏', note:'戊日坐寅卯辰（勾陈得位），土临东方得用。'},
  {n:'玄武当权格', pri:32, c:BZ=>['壬','癸'].indexOf(BZ.dayGan)>=0&&['申','子','辰'].every(z=>BZ.zhis.indexOf(z)>=0), xi:'水', ji:'土', yun:'水得位喜纯忌壅', note:'壬癸日得申子辰水局（玄武当权），润下得势。'}
];
const SHI_E_BAI=['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥'];
const BA_ZHUAN=['甲寅','乙卯','丁未','己未','庚申','辛酉','癸丑'];
const JIU_CHOU=['戊子','戊午','壬子','壬午','乙卯','乙酉','辛卯','辛酉'];
const GU_LUAN=['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午'];
const YIN_CHA_YANG=['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'];
function seasonOf(mz){ if('寅卯辰'.indexOf(mz)>=0)return'春'; if('巳午未'.indexOf(mz)>=0)return'夏'; if('申酉戌'.indexOf(mz)>=0)return'秋'; return'冬'; }
const SI_FEI={春:['庚申','辛酉'],夏:['壬子','癸亥'],秋:['甲寅','乙卯'],冬:['丙午','丁巳']};
const TIAN_SHE={春:'戊寅',夏:'甲午',秋:'戊申',冬:'甲子'};
/* 三奇贵人：甲戊庚、乙丙丁、壬癸辛三组，须按“年、月、日”柱序顺布（次序不可乱、不可隔位到时柱）。
   gans 传四柱天干数组 [年,月,日,时]，仅取前三柱按序匹配。 */
function isSanQi(gans){
  const ymd=(gans||[]).slice(0,3);           // 年月日三柱（顺布口径）
  const trips=[['甲','戊','庚'],['乙','丙','丁'],['壬','癸','辛']];
  for(const t of trips){ if(t[0]===ymd[0]&&t[1]===ymd[1]&&t[2]===ymd[2]) return true; }
  return false;
}
/* ---------- 神煞辅助 ---------- */
// 正印（生我同性）天干
function zhengYinGan(dg){ const myWx=GAN_WX[dg]; const shengWx=Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===myWx);
  for(const g of GAN){ if(GAN_WX[g]===shengWx && (YANG.indexOf(g)>=0)===(YANG.indexOf(dg)>=0)) return g; } return null; }
// 六合对照
const LIUHE = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
// 流霞（日干）：甲酉乙戌丙未丁申戊巳己午庚辰辛卯壬亥癸寅
const LIUXIA = {甲:'酉',乙:'戌',丙:'未',丁:'申',戊:'巳',己:'午',庚:'辰',辛:'卯',壬:'亥',癸:'寅'};
// 金舆（日干）：甲辰乙巳丙未丁申戊辰己巳庚戌辛亥壬丑癸寅
const JINYU = {甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'辰',己:'巳',庚:'戌',辛:'亥',壬:'丑',癸:'寅'};
// 天医（月支后一位）：寅丑、卯寅…午巳…
function tianYiZhiOf(mz){ const i=ZHI_ORDER.indexOf(mz); return i<0?'':ZHI_ORDER[(i+11)%12]; }
// 德秀贵人：月支三合局五行之天干透出
function hasDexiu(gans, mz){ const juWx=JU_OF[mz]; if(!juWx) return false;
  const tg={木:['甲','乙'],火:['丙','丁'],土:['戊','己'],金:['庚','辛'],水:['壬','癸']}[juWx];
  return (gans||[]).some(g=>tg.includes(g)); }
/* 计算某柱神煞。col={gz,z,lbl,isDay,isMonth,isYear,isTime,gan}; ctx={dayGan,monthGan,yearZ,monthZ,dayZ,gans}
   opts.axisGan='day'|'year'：干类神煞以日干、年干为基准；opts.axisZhi='year'|'day'：部分支类神煞以年支、日支为基准；
   opts.tldw='diZhi'|'naYin'：天罗地网用地支查法、纳音查法。默认保持原行为。 */
function pillarSha(col, ctx, opts){
  opts = opts || {};
  const z=col.z, dg=ctx.dayGan, yz=ctx.yearZ, dz=ctx.dayZ, mz=ctx.monthZ, mg=ctx.monthGan;
  const yg=ctx.gans[0];
  const axisGan = opts.axisGan || 'day';
  const axisZhi = opts.axisZhi || 'year';
  const tldw = opts.tldw || 'diZhi';
  const refGan = axisGan==='year' ? yg : dg;
  const refZhi = axisZhi==='day' ? dz : yz;
  const out=[];
  // 干类神煞（按 axisGan 取日干或年干）
  if((TIANYI[refGan]||[]).includes(z)) out.push('天乙贵人');
  if(WENCHANG[refGan]===z) out.push('文昌贵人');
  if(YANGREN[refGan]===z) out.push('羊刃');
  if(YANGREN_LUQIAN[refGan]===z && YANGREN_LUQIAN[refGan]!==YANGREN[refGan]) out.push('羊刃（禄前派）');
  if(LU[refGan]===z) out.push('禄神');
  if((TAIJI[refGan]||[]).includes(z)) out.push('太极贵人');
  if(FUXING[refGan]===z) out.push('福星贵人');
  if(TIANCHU[refGan]===z) out.push('天厨贵人');
  if(FEIREN[refGan]===z) out.push('飞刃');
  if(HONGYAN[refGan]===z) out.push('红艳煞');
  if(LIUXIA[refGan]===z) out.push('流霞');
  if(CS_START[refGan]===z) out.push('学堂');                              // 长生位
  { const sg=shiShenGan(refGan); if(sg && LU[sg]===z) out.push('词馆'); } // 食神之禄
  { const zy=zhengYinGan(refGan); if(zy && LU[zy]===z) out.push('国印贵人'); }
  if(JINYU[refGan]===z) out.push('金舆');
  if(z===XUEREN[refGan]) out.push('血刃');                               // 血刃歌诀取法（按干起）
  if(LIUHE[LU[refGan]]===z) out.push('暗禄');                            // 禄之六合
  // 天医（月支后一位）- 与年、日轴无关
  if(z===tianYiZhiOf(mz)) out.push('天医');
  // 德秀贵人（月令三合局五行透干）- 与年、日轴无关
  if(col.isDay && hasDexiu(ctx.gans, mz)) out.push('德秀贵人');
  // 三合局长生类：传统以年支或日支查，此处同时查两方，避免任一方遗漏
  [yz,dz].forEach(bz=>{ const ju=JU_OF[bz]; if(!ju)return;
    if(YIMA[ju]===z) out.push('驿马');
    if(TAOHUA[ju]===z) out.push('桃花');
    if(HUAGAI[ju]===z) out.push('华盖');
    if(JIANGXING[ju]===z) out.push('将星');
    if(JIESHA[ju]===z) out.push('劫煞');
    if(ZAISHA[ju]===z) out.push('灾煞');
    if(WANGSHEN[ju]===z) out.push('亡神');
  });
  // 年支、日支类（按 axisZhi）
  if(FANG[refZhi]===z) out.push('孤辰');
  if(FANG_GUA[refZhi]===z) out.push('寡宿');
  if(HONGLUAN[refZhi]===z) out.push('红鸾');
  if(TIANXI[refZhi]===z) out.push('天喜');
  if(SANGMEN[refZhi]===z) out.push('丧门');
  if(DIAOKE[refZhi]===z) out.push('吊客');
  if(POSUI[refZhi]===z) out.push('破碎煞');
  if(PIMA[refZhi]===z) out.push('披麻');
  // 元辰（大耗）
  if(ctx.sex!==undefined && ctx.sex!==null){
    const ygYang = GAN.indexOf(ctx.gans[0])%2===0;
    const isMale = (ctx.sex===1 || ctx.sex===true);
    const ym = (ygYang===isMale) ? YUAN_CHEN_A : YUAN_CHEN_B;
    if(ym[refZhi]===z) out.push('元辰');
  }
  const refZhiJu=JU_OF[refZhi];
  if(refZhiJu){ const yang=YANG.indexOf(refZhi)>=0;
    const gou=yang?refZhiJu[2]:refZhiJu[0], jiao=yang?refZhiJu[0]:refZhiJu[2];
    if(z===gou) out.push('勾煞'); if(z===jiao) out.push('绞煞');
  }
  // 天罗地网：地支查法 vs 纳音查法
  if(tldw==='diZhi'){
    if(z==='戌'||z==='亥') out.push('天罗');
    if(z==='辰'||z==='巳') out.push('地网');
  } else {
    const nyWx = (NAYIN_INFO[nayinOf(ctx.gans[0]+ctx.yearZ)]||{}).wx || '';
    if(nyWx==='火' && (z==='戌'||z==='亥')) out.push('天罗');
    if((nyWx==='水'||nyWx==='土') && (z==='辰'||z==='巳')) out.push('地网');
  }
  // 月德、天德（与轴无关）
  if(col.isMonth){
    const yd=YUEDE_TG[mz];
    if(yd && mg===yd) out.push('月德贵人');
    if(yd && YUEDE_HE[yd] && mg===YUEDE_HE[yd]) out.push('月德合');
    const td=TIANDE[mz];
    if(td){ if(GAN.indexOf(td)>=0){ if(mg===td) out.push('天德贵人'); } else if(z===td) out.push('天德贵人'); }
    const th=TIANDE_HE[mz];
    if(th){ if(GAN.indexOf(th)>=0){ if(mg===th) out.push('天德合'); } else if(z===th) out.push('天德合'); }
  }
  // 日柱专属（与轴无关）
  if(col.isDay){
    if(KUI_GANG.includes(col.gz)) out.push('魁罡');
    if(JINSHEN.includes(col.gz)) out.push('金神');
    if(SHI_E_BAI.includes(col.gz)) out.push('十恶大败');
    if(BA_ZHUAN.includes(col.gz)) out.push('八专');
    if(JIU_CHOU.includes(col.gz)) out.push('九丑');
    if(GU_LUAN.includes(col.gz)) out.push('孤鸾');
    if(YIN_CHA_YANG.includes(col.gz)) out.push('阴差阳错');
    if(SHI_LING.includes(col.gz)) out.push('十灵日');
    if(LIU_XIU.includes(col.gz)) out.push('六秀日');
    const _sz = seasonOf(mz);
    if(TIAN_ZHUAN[_sz]===col.gz) out.push('天转');
    if(DI_ZHUAN[_sz]===col.gz) out.push('地转');
    const s=seasonOf(mz);
    if(SI_FEI[s] && SI_FEI[s].includes(col.gz)) out.push('四废');
    if(TIAN_SHE[s]===col.gz) out.push('天赦');
    if(isSanQi(ctx.gans)) out.push('三奇贵人');
  }
  // 童子煞（全口径，判定单源见 tongziHit）：季节句+纳音句，任一命中即为童子，查日支/时支
  if((col.isDay||col.isTime)){
    if(tongziHit(ctx.gans[0]+ctx.yearZ, mz, z)) out.push('童子');
  }
  return Array.from(new Set(out));
}

/* 童子命中判（排盘神煞与合婚页共用单源）：渊海子平民俗童子口诀全口径：
 * 季节句：春秋寅子贵、冬夏卯未辰（按月支定季节，不拘纳音，查日支/时支）
 * + 纳音句：金木马卯合、水火鸡犬多、土命逢辰巳（年柱纳音五行立极，查日支/时支）。 */
function tongziHit(yGz, mz, ...zhis){
  const nyWx=(NAYIN_INFO[nayinOf(yGz)]||{}).wx||'';
  const TZ={'金':'午卯','木':'午卯','水':'酉戌','火':'酉戌','土':'辰巳'};
  const sea=seasonOf(mz);
  const S=(sea==='春'||sea==='秋')?'寅子':'卯未辰';
  return zhis.some(zz=>!!zz && ((TZ[nyWx]&&TZ[nyWx].indexOf(zz)>=0)||S.indexOf(zz)>=0));
}
if(typeof window!=='undefined'){ window.tongziHit=tongziHit; }

/* 纳音查法神煞：以年柱纳音五行（学堂词馆孤辰寡宿天罗地网）/月支纳音五行（德秀）/纳音金干支（金神）立极，
   给出与主流“日干+年支”体系并行的另一套结果。仅收录传统上确属“纳音查法”的神煞。 */
const WX_CS_START = {木:'亥',火:'寅',金:'巳',水:'申',土:'申'};   // 纳音五行长生位（纳音法独立口径：土随水长生在申，与日干十二长生的火土同宫派互不相涉）
function pillarShaNaYin(col, ctx){
  const z=col.z, gz=col.gz;
  const nyGz=ctx.gans[0]+ctx.yearZ;
  const nyWx=(NAYIN_INFO[nayinOf(nyGz)]||{}).wx||'';
  const out=[];
  // 天罗地网（纳音）：火命戌亥天罗，水土命辰巳地网（金木命无）
  if(nyWx==='火' && (z==='戌'||z==='亥')) out.push('天罗');
  if((nyWx==='水'||nyWx==='土') && (z==='辰'||z==='巳')) out.push('地网');
  // 学堂、词馆（纳音）：年柱纳音五行的长生位=学堂、临官位=词馆
  // 孤辰、寡宿（纳音）：年柱纳音五行的绝位=孤辰、胎位=寡宿
  const cs=WX_CS_START[nyWx];
  if(cs){ const si=ZHI_ORDER.indexOf(cs);
    if(si>=0){
      const tang=ZHI_ORDER[(si+0)%12];   // 长生
      const guan=ZHI_ORDER[(si+3)%12];   // 临官
      const jue =ZHI_ORDER[(si+9)%12];   // 绝
      const tai =ZHI_ORDER[(si+10)%12];  // 胎
      if(z===tang) out.push('学堂');
      if(z===guan) out.push('词馆');
      if(z===jue)  out.push('孤辰');
      if(z===tai)  out.push('寡宿');
    }
  }
  // 金神（纳音）：乙丑、己巳、癸酉（纳音金），以日柱、时柱为主
  if((col.isDay||col.isTime) && ['乙丑','己巳','癸酉'].includes(gz)) out.push('金神');
  // 德秀贵人（纳音）：月支纳音五行，四柱天干透出该五行
  if(col.isDay){
    const mNy=(NAYIN_INFO[nayinOf(ctx.monthGan+ctx.monthZ)]||{}).wx||'';
    const tg={木:['甲','乙'],火:['丙','丁'],土:['戊','己'],金:['庚','辛'],水:['壬','癸']}[mNy];
    if(tg && (ctx.gans||[]).some(g=>tg.includes(g))) out.push('德秀贵人');
  }
  return Array.from(new Set(out));
}

/* 合并多套神煞：主查法（日干+年支+地支天罗）+ 备查（年干、日支、纳音），去重并加查法后缀 */
function pillarShaMerged(col, ctx){
  const primary = pillarSha(col, ctx);
  const fromYearGan = pillarSha(col, ctx, {axisGan:'year', axisZhi:'year', tldw:'diZhi'});
  const fromDayZhi = pillarSha(col, ctx, {axisGan:'day', axisZhi:'day', tldw:'diZhi'});
  const fromNaYin = pillarShaNaYin(col, ctx);
  const out = primary.slice();
  const has = new Set(primary);
  fromYearGan.forEach(s=>{ if(!has.has(s)){ has.add(s); out.push(s); } });
  fromDayZhi.forEach(s=>{ if(!has.has(s)){ has.add(s); out.push(s); } });
  fromNaYin.forEach(s=>{ if(!has.has(s)){ has.add(s); out.push(s+'（纳音）'); } });
  return out;
}

/* ---------- 五行统计 & 旺相休囚死 ---------- */
function wxCount(gans, zhis){
  const cnt = {木:0,火:0,土:0,金:0,水:0};
  gans.forEach(g=>{ if(GAN_WX[g]) cnt[GAN_WX[g]]++; });
  zhis.forEach(z=>{ if(ZHI_WX[z]) cnt[ZHI_WX[z]]++; });
  return cnt;
}
// 计入藏干（天干 + 地支全部藏干）
function wxCountAll(gans, zhis){
  const cnt = {木:0,火:0,土:0,金:0,水:0};
  gans.forEach(g=>{ if(GAN_WX[g]) cnt[GAN_WX[g]]++; });
  zhis.forEach(z=>{ (HIDE[z]||[]).forEach(h=>{ if(GAN_WX[h]) cnt[GAN_WX[h]]++; }); });
  return cnt;
}
// 十二地支八卦方位（用于文昌位等）
const ZHI_FANG = {子:'正北',丑:'东北',寅:'东北',卯:'正东',辰:'东南',巳:'东南',午:'正南',未:'西南',申:'西南',酉:'正西',戌:'西北',亥:'西北'};
// 五行 → 利、忌方位（career/marry/schools 共用单一真源，避免各文件重复定义并遮蔽孤辰表 FANG）
const WX_FANG = {
  '木':{li:['东方','东南'],ji:['西方','西北']},
  '火':{li:['南方','东南'],ji:['北方','西南']},
  '土':{li:['中央','西南','东北'],ji:['东方','东南']},
  '金':{li:['西方','西北'],ji:['南方','东方']},
  '水':{li:['北方','西北'],ji:['南方','中央']}
};
/* 八宅命卦（东西四命）：由公历出生年推命卦，命卦即所居之"宫"，东四命主东四宅、西四命主西四宅，为可跨人比较的同一坐标框架。
 * 男 1900-1999：(100−后两位)÷9 取余；2000+：(99−后两位)÷9 取余。
 * 女 1900-1999：(后两位−4)÷9 取余；2000+：(后两位+6)÷9 取余。
 * 余数→卦：1坎 2坤 3震 4巽 5男坤女艮 6乾 7兑 8艮 9离（无余视为9）。
 * 东四命：坎震巽离；西四命：乾坤艮兑。 */
function mingGua(year, isMale){
  const y2=((year%100)+100)%100;
  let r;
  if(isMale){ r = year>=2000 ? (99-y2) : (100-y2); }
  else { r = year>=2000 ? (y2+6) : (y2-4); }
  r=((r%9)+9)%9; if(r===0) r=9;
  let gua;
  if(r===5) gua=isMale?'坤':'艮';
  else gua={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兑',8:'艮',9:'离'}[r];
  const dong=['坎','震','巽','离'].includes(gua);
  return {gua, dong, group:dong?'东四命':'西四命'};
}
if(typeof window!=='undefined'){ window.mingGua=mingGua; }
/* 命卦年（立春为界）：八宅命卦换年以立春为界，立春前出生按前一年计（与年柱、生肖换年同界）。
 * 取公历生日前最近一次立春所在公历年为命卦年；节气表不可用时退回公历年。 */
function mgYearOf(y, m, d){
  const key=y*10000+(m||1)*100+(d||1);
  let best=y, bestV=-1;
  try{
    for(let ly=y-1; ly<=y+1; ly++){
      const jq=(Solar.fromYmd(ly,1,1).getLunar().getJieQiTable()||{})['立春'];
      if(!jq) continue;
      const v=jq.getYear()*10000+jq.getMonth()*100+jq.getDay();
      if(v<=key && v>bestV){ bestV=v; best=jq.getYear(); }
    }
  }catch(e){}
  return best;
}
/* 按出生公历年月日取命卦（立春界），与 mingGua(year,isMale) 同参同返回 */
function mingGuaDate(y, m, d, isMale){ return mingGua(mgYearOf(y,m,d), isMale); }
if(typeof window!=='undefined'){ window.mgYearOf=mgYearOf; window.mingGuaDate=mingGuaDate; }
function wangXiang(monthZhi){
  const mx = ZHI_WX[monthZhi] || '土';
  const res = {};
  ['木','火','土','金','水'].forEach(wx=>{
    if(wx===mx) res[wx]='旺';
    else if(WX_SHENG[mx]===wx) res[wx]='相';
    else if(WX_SHENG[wx]===mx) res[wx]='休';
    else if(WX_KE[wx]===mx) res[wx]='囚';
    else if(WX_KE[mx]===wx) res[wx]='死';
  });
  return res;
}

/* ---------- 量化四柱：十神 / 阴阳 / 生克 统计 ---------- */
// 十神统计（不含日干自身；统计 年、月/时 干 + 四柱全部藏干）
function ssCount(gans, zhis, dayGan){
  const cnt={'比肩':0,'劫财':0,'食神':0,'伤官':0,'正财':0,'偏财':0,'七杀':0,'正官':0,'偏印':0,'正印':0};
  [gans[0],gans[1],gans[3]].forEach(g=>{ if(g) cnt[tenGod(dayGan,g)]++; });
  zhis.forEach(z=>{ (HIDE[z]||[]).forEach(h=>{ cnt[tenGod(dayGan,h)]++; }); });
  return cnt;
}
// 十神 → 六亲（比劫、食伤、财星、官杀、印星）
function ssLiuqin(ss){
  return {
    '比劫': ss['比肩']+ss['劫财'],
    '食伤': ss['食神']+ss['伤官'],
    '财星': ss['正财']+ss['偏财'],
    '官杀': ss['正官']+ss['七杀'],
    '印星': ss['正印']+ss['偏印']
  };
}
// 阴阳统计（全部干支，含日干）
function yyCount(gans, zhis){
  let yin=0, yang=0;
  const all=[...gans, ...zhis.flatMap(z=>(HIDE[z]||[]))];
  all.forEach(c=>{ if(YANG.indexOf(c)>=0) yang++; else yin++; });
  return {yin, yang, total:yin+yang};
}
// 阴阳 × 五行（10 类，全部干支）
function yyWxCount(gans, zhis){
  const cnt={};
  ['阴','阳'].forEach(y=>['木','火','土','金','水'].forEach(w=>cnt[y+w]=0));
  const all=[...gans, ...zhis.flatMap(z=>(HIDE[z]||[]))];
  all.forEach(c=>{ const y=YANG.indexOf(c)>=0?'阳':'阴'; const w=GAN_WX[c]||ZHI_WX[c]; if(w) cnt[y+w]++; });
  return cnt;
}
// 生克关系（以日主五行为“我”；不含日干自身）
function shengKeCount(gans, zhis, dayGan){
  const dwx=GAN_WX[dayGan];
  const cnt={'生我':0,'同我':0,'我生':0,'克我':0,'我克':0};
  const add=wx=>{
    if(WX_SHENG[wx]===dwx) cnt['生我']++;
    else if(wx===dwx) cnt['同我']++;
    else if(WX_SHENG[dwx]===wx) cnt['我生']++;
    else if(WX_KE[wx]===dwx) cnt['克我']++;
    else if(WX_KE[dwx]===wx) cnt['我克']++;
  };
  [gans[0],gans[1],gans[3]].forEach(g=>{ if(g) add(GAN_WX[g]); });
  zhis.forEach(z=>{ (HIDE[z]||[]).forEach(h=>add(GAN_WX[h])); });
  return cnt;
}

/* ---------- 天干合化，生克 ---------- */
const TIANGAN_HE = [['甲','己','土'],['乙','庚','金'],['丙','辛','水'],['丁','壬','木'],['戊','癸','火']];
// 天干相冲（阳干对峙：甲庚、乙辛、丙壬、丁癸；戊己居中不冲）
const TIANGAN_CHONG = [['甲','庚'],['乙','辛'],['丙','壬'],['丁','癸']];
// 地支暗合（寅丑、亥午、子巳、卯申）：暗中来合，主隐秘、私下、不易察觉之合
const DIZHI_ANHE = [['寅','丑'],['亥','午'],['子','巳'],['卯','申']];
function tianGanHe(a,b){
  for(const [x,y,h] of TIANGAN_HE){ if((a===x&&b===y)||(a===y&&b===x)) return h; }
  return null;
}
function ganRelations(gans, ctx, labels){
  const rel=[];
  const heParts=[];                 // 记录参与五合的天干（含位置），用于争合/妒合/隔位分流检测
  const hePairs=[];                 // 五合配对（含两端位置），供贴身/隔位判定
  for(let i=0;i<gans.length;i++)for(let j=i+1;j<gans.length;j++){
    const a=gans[i], b=gans[j];
    const la = labels? labels[i] : '';
    const lb = labels? labels[j] : '';
    const lab = labels? `${la}${lb}` : '';
    const he=tianGanHe(a,b);
    if(he){
      let txt = labels ? `${lab}${a}${b}合化${he}` : `${a}${b}合化${he}`;
      if(ctx && !heHuaOK(he, ctx.gans||gans, ctx.zhis||[], ctx.monthZ||'')) txt = labels ? `${lab}${a}${b}合而不化（绊）` : `${a}${b}合而不化（绊）`;
      rel.push({cls:'he', text:txt});
      heParts.push({g:a,i}); heParts.push({g:b,j});
      hePairs.push({ga:a,ia:i,gb:b,ib:j});
    }
    if(pairIn(a,b,TIANGAN_CHONG)) rel.push({cls:'gchong', text: labels ? `${lab}${a}${b}相冲` : `${a}${b}相冲`});   // 天干相冲
    if(WX_SHENG[GAN_WX[a]]===GAN_WX[b]) rel.push({cls:'sheng', text: labels ? `${lab}${a}${b}相生` : `${a}生${b}`});
    else if(WX_KE[GAN_WX[a]]===GAN_WX[b]) rel.push({cls:'ke', text: labels ? `${lab}${a}${b}相克` : `${a}克${b}`});
    else if(WX_SHENG[GAN_WX[b]]===GAN_WX[a]) rel.push({cls:'sheng', text: labels ? `${lab}${b}${a}相生` : `${b}生${a}`});   // b 生 a：顺序须生者在前
    else if(WX_KE[GAN_WX[b]]===GAN_WX[a]) rel.push({cls:'ke', text: labels ? `${lab}${b}${a}相克` : `${b}克${a}`});   // b 克 a 同理
    else rel.push({cls:'bihe', text: labels ? (a===b?`${lab}${a}${b}比肩`:`${lab}${a}${b}比和`) : (a===b?`${a}${b}比肩`:`${a}${b}比和`)});   // 同五行：比肩（同干同名）/比和（同五行异干）
  }
  // 争合/妒合/隔位分流：同一天干被两组合，贴身（相邻）为真争合、隔位为气分两处（分流）
  // 博主辨：隔位合不算争合，顶多算分流（如两己争一甲，己在年、甲在日隔月干，为气分两处非名分分夺）
  const _pairOf=g=>hePairs.filter(p=>p.ga===g||p.gb===g);
  const _dist=(p,g)=>Math.abs((p.ga===g?p.ia:p.ib)-(p.ga===g?p.ib:p.ia));
  const cnt={};
  heParts.forEach(p=> cnt[p.g]=(cnt[p.g]||0)+1);
  Object.keys(cnt).forEach(g=>{ if(cnt[g]>=2){
    const pairs=_pairOf(g);
    const adj=pairs.some(p=>_dist(p,g)===1), far=pairs.some(p=>_dist(p,g)>1);
    const lbl = labels ? gans.map((x,idx)=>x===g?labels[idx]:null).filter(Boolean).join('') : '';
    let txt;
    if(adj&&far) txt=labels?`${lbl}${g}争合（妒合）：贴身之合为主、隔位者气分，主次分明`:`${g}争合（妒合）：贴身之合为主、隔位者气分，主次分明`;
    else if(!adj) txt=labels?`${lbl}${g}与两方隔位相合，非争合、气分两处（分流），合而不专`:`${g}与两方隔位相合，非争合、气分两处（分流），合而不专`;
    else txt=labels?`${lbl}${g}争合（妒合）：被两方贴身争合，名分不定、立场摇摆`:`${g}争合（妒合）：被两方贴身争合，名分不定、立场摇摆`;
    rel.push({cls:'zheng', text:txt});
  }});
  return rel;
}

/* ---------- 地支合化，生克 ---------- */
const DIZHI_HE6 = [['子','丑','土'],['寅','亥','木'],['卯','戌','火'],['辰','酉','金'],['巳','申','水'],['午','未','土']];
const DIZHI_SANHE = [['申','子','辰','水'],['亥','卯','未','木'],['寅','午','戌','火'],['巳','酉','丑','金']];
const DIZHI_SANHUI = [['寅','卯','辰','木'],['巳','午','未','火'],['申','酉','戌','金'],['亥','子','丑','水']];
// DIZHI_CHONG（地支六冲）的唯一权威定义位于 assets/xuanji-lib.js（全站共享）。
// 本文件直接引用该全局常量，避免与 xuanji-lib.js 顶层 const 重名导致整段 SyntaxError。
const DIZHI_XING = [['寅','巳','申'],['丑','戌','未'],['子','卯'],['辰'],['午'],['酉'],['亥']];
const DIZHI_HAI = [['子','未'],['丑','午'],['寅','巳'],['卯','辰'],['申','亥'],['酉','戌']];
const DIZHI_PO = [['子','酉'],['寅','亥'],['卯','午'],['辰','丑'],['巳','申'],['未','戌']];
// 相刑种类（子卯无礼、寅巳申无恩、丑戌未恃势、同支自刑；寅申因冲覆盖不单列刑）
function xingKindOf(a,b){
  if(a===b) return '自刑';
  if((a==='子'&&b==='卯')||(a==='卯'&&b==='子')) return '无礼之刑';
  if((a==='寅'&&b==='巳')||(a==='巳'&&b==='寅')||(a==='巳'&&b==='申')||(a==='申'&&b==='巳')) return '无恩之刑';
  if((a==='丑'&&b==='戌')||(a==='戌'&&b==='丑')||(a==='戌'&&b==='未')||(a==='未'&&b==='戌')||(a==='丑'&&b==='未')||(a==='未'&&b==='丑')) return '恃势之刑';
  return '';
}
function pairIn(a,b,arr){ return arr.some(g=>g.indexOf(a)>=0 && g.indexOf(b)>=0 && g.length>=2 && (g.indexOf(a)!==g.indexOf(b))); }
// 合化是否成立：化神五行“透干 / 得令(月令同气或令生) / 得根(地支藏干含化神本干)”三者居其一即化，否则合而不化（合绊）
function heHuaOK(huaWx, gans, zhis, monthZ){
  if(!huaWx) return false;
  const stems = GAN_OF_WX[huaWx] || [];
  const tou = stems.some(g=> (gans||[]).includes(g));
  const gen = stems.some(g=> (zhis||[]).some(z=> (HIDE[z]||[]).includes(g)));
  const ml = (monthZ && ZHI_WX[monthZ]) || '';
  const ling = ml && (ml===huaWx || WX_SHENG[ml]===huaWx);
  return !!(tou || gen || ling);
}
// 三合局中两支组合类型：0=生 1=旺 2=墓 ： 生旺半合(0,1)力全 / 旺墓半合(1,2)力半 / 拱(0,2,生墓)虚拱待发
function sanheKind(g, present){
  const order=g.slice(0,3);
  const pos=order.map(z=> present.includes(z) ? order.indexOf(z) : -1);
  const has=pos.filter(i=>i>=0);
  if(has.length!==2) return null;
  const set=has.join(',');
  if(set==='0,1') return 'shengwang';
  if(set==='1,2') return 'wangmu';
  if(set==='0,2') return 'gong';
  return null;
}
function zhiRelations(zhis, ctx, labels){
  const rel=[];
  for(let i=0;i<zhis.length;i++)for(let j=i+1;j<zhis.length;j++){
    const a=zhis[i], b=zhis[j];
    const la = labels? labels[i] : '';
    const lb = labels? labels[j] : '';
    const lab = labels? `${la}${lb}` : '';
    let f;
    if((f=DIZHI_HE6.find(g=>(g[0]===a&&g[1]===b)||(g[0]===b&&g[1]===a)))){
      let txt = labels ? `${lab}${a}${b}合化${f[2]}` : `${a}${b}合化${f[2]}`;
      if(ctx && !heHuaOK(f[2], ctx.gans||[], zhis, ctx.monthZ||'')) txt = labels ? `${lab}${a}${b}合而不化（绊）` : `${a}${b}合而不化（绊）`;
      rel.push({cls:'he', text:txt});
    }
    if(pairIn(a,b,DIZHI_CHONG)) rel.push({cls:'chong', text: labels ? `${lab}${a}${b}相冲` : `${a}${b}相冲`});
    if(pairIn(a,b,DIZHI_HAI)) rel.push({cls:'hai', text: labels ? `${lab}${a}${b}相害` : `${a}${b}相害`});
    if(pairIn(a,b,DIZHI_PO)) rel.push({cls:'po', text: labels ? `${lab}${a}${b}相破` : `${a}${b}相破`});
    if(pairIn(a,b,DIZHI_ANHE)) rel.push({cls:'anhe', text: labels ? `${lab}${a}${b}暗合` : `${a}${b}暗合`});   // 地支暗合
  }
  for(let i=0;i<zhis.length;i++)for(let j=i+1;j<zhis.length;j++)for(let k=j+1;k<zhis.length;k++){
    const t=[zhis[i],zhis[j],zhis[k]].sort().join('');
    const sh=DIZHI_SANHE.find(g=>[g[0],g[1],g[2]].sort().join('')===t);
    if(sh){ const la=labels?labels[i]:'',lb=labels?labels[j]:'',lc=labels?labels[k]:''; rel.push({cls:'he', text: labels?`${la}${lb}${lc}${sh[0]}${sh[1]}${sh[2]}三合${sh[3]}局`:`${sh[0]}${sh[1]}${sh[2]}三合${sh[3]}局`}); }
    const hui=DIZHI_SANHUI.find(g=>[g[0],g[1],g[2]].sort().join('')===t);
    if(hui){ const la=labels?labels[i]:'',lb=labels?labels[j]:'',lc=labels?labels[k]:''; rel.push({cls:'he', text: labels?`${la}${lb}${lc}${hui[0]}${hui[1]}${hui[2]}三会${hui[3]}局`:`${hui[0]}${hui[1]}${hui[2]}三会${hui[3]}局`}); }
  }
  // 半合 / 拱 分级：三合局中只见两支
  DIZHI_SANHE.forEach(g=>{
    const present=g.slice(0,3).filter(z=>zhis.includes(z));
    if(present.length===2){
      const miss=g.slice(0,3).find(z=>!zhis.includes(z));
      const kind=sanheKind(g, present);
      // 找出是哪两个位置出现
      const idxs = present.map(z=> zhis.indexOf(z)).filter(i=>i>=0);
      const la=labels?labels[idxs[0]]:'', lb=labels?labels[idxs[1]]:'';
      let core, full;
      if(kind==='shengwang'){ core=`${present[0]}${present[1]}半合${g[3]}局（生旺，力全）`; full=`${la}${lb}${present[0]}${present[1]}半合${g[3]}局（生旺，力全）`; }
      else if(kind==='wangmu'){ core=`${present[0]}${present[1]}半合${g[3]}局（旺墓，力半）`; full=`${la}${lb}${present[0]}${present[1]}半合${g[3]}局（旺墓，力半）`; }
      else { core=`${present[0]}${present[1]}拱${g[3]}局（虚拱${miss}，待时而发）`; full=`${la}${lb}${present[0]}${present[1]}拱${g[3]}局（虚拱${miss}，待时而发）`; }
      // 半合、拱成局需化神显；化神不显则虚（拱本就虚，不另标）
      if(ctx && kind!=='gong' && !heHuaOK(g[3], ctx.gans||[], zhis, ctx.monthZ||'')){ core+=`（化神不显，虚）`; full+=`（化神不显，虚）`; }
      rel.push({cls:'he', text: labels?full:core});
    }
  });
  // 刑：统一走全站单一真源 zhiRelTypes（寅申因冲覆盖刑，不单列刑）
  zhis.forEach((z1,i)=>{
    zhis.forEach((z2,j)=>{
      if(i<j && zhiRelTypes(z1,z2).includes('刑')){
        const la=labels?labels[i]:'', lb=labels?labels[j]:'';
        const txt = (z1===z2?`${z1}${z2}自刑`:`${z1}${z2}相刑`);
        rel.push({cls:'xing', text: labels?`${la}${lb}${txt}`:txt});
      }
    });
  });
  const seen=new Set(); const out=[];
  rel.forEach(r=>{ if(!seen.has(r.text)){seen.add(r.text); out.push(r);} });
  return out;
}

/* ---------- 地支藏干 ---------- */
const HIDE = {
  子:['癸'], 丑:['己','癸','辛'], 寅:['甲','丙','戊'], 卯:['乙'],
  辰:['戊','乙','癸'], 巳:['丙','庚','戊'], 午:['丁','己'], 未:['己','丁','乙'],
  申:['庚','壬','戊'], 酉:['辛'], 戌:['戊','辛','丁'], 亥:['壬','甲']
};

/* ---------- 纳音（六十甲子，逐条释义）----------
 * 来源：三十纳音取象本义（NAYIN_D）系本站依《三命通会·论纳音》《渊海子平》所载纳音取象义例归纳撰写，
 *   非古籍原文照录；每两名纳音共用一条释义，NAYIN_INFO 由 NAYIN_LIST 与 NAYIN_D 对位生成。 */
const NAYIN_LIST = [
  '海中金','炉中火','大林木','路旁土','剑锋金','山头火','涧下水','城头土','白蜡金','杨柳木',
  '泉中水','屋上土','霹雳火','松柏木','长流水','沙中金','山下火','平地木','壁上土','金箔金',
  '覆灯火','天河水','大驿土','钗钏金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'
];
const NAYIN_D = [
  '藏于深海之金，内敛潜藏，需待时而发，主贵气内蕴。',
  '炉灶之火，炼物成器，主温暖、锻造与内在功力。',
  '山林之木，茂盛成材，主仁厚、有担当、能成事。',
  '道旁之土，承载往来，主踏实、勤劳、得用。',
  '百炼成锋之金，刚锐无比，主威严、果决，刑伤亦带贵。',
  '山之高处火，显耀远方，主声望、光明、外扬。',
  '山涧细流，清澈绵长，主智慧、沉静、积小成。',
  '城墙之土，守卫稳固，主屏障、坚守、权责。',
  '饰物之金，外美内柔，主精巧、文饰、依附得贵。',
  '随风之木，柔韧多姿，主机巧、善变、人缘。',
  '涌泉之水，源源不竭，主灵动、聪慧、生养。',
  '屋顶之土，遮风挡雨，主安宅、庇护、归宿。',
  '雷火，骤发骤止，主骤贵、突变、威势。',
  '耐寒之木，坚贞不朽，主长寿、操守、刚毅。',
  '奔流不息之水，主通达、迁动、不居。',
  '混于沙石之金，淘洗方现，主晚成、勤勉得财。',
  '暮山之火，余晖温婉，主晚景、温和、蓄势。',
  '田园之木，安稳成才，主平和、务实、得地。',
  '墙壁之土，装饰屏障，主内秀、文饰、安稳。',
  '贴饰之金，薄而华美，主表面荣华、虚名浮利。',
  '灯烛之火，照夜引路，主文采、指引、幽明。',
  '银河之水，清贵高远，主聪颖、脱俗、贵气。',
  '驿道之土，通达四方，主交际、奔波、成事。',
  '首饰之金，精致贵重，主温情、情缘、享福。',
  '养蚕之木，实用多益，主勤恳、衣食、技艺。',
  '汇流成溪，主汇聚、交际、成势。',
  '沙里之土，混杂待清，主蕴藏、磨砺、晚发。',
  '太阳之火，普照万物，主光明、磊落、尊贵。',
  '多子之木，繁盛外显，主多才、外华、人丁。',
  '浩瀚之水，包容万物，主胸襟、潜藏、变化。'
];
const NAYIN_MAP = {}, NAYIN_INFO = {};
(function(){
  for(let i=0;i<60;i++){
    const g=GAN[i%10], z=ZHI_ORDER[i%12];
    const name=NAYIN_LIST[Math.floor(i/2)];
    NAYIN_MAP[g+z]=name;
    NAYIN_INFO[name]={wx:name.slice(-1), d:NAYIN_D[Math.floor(i/2)]};
  }
})();
function nayinOf(gz){ return NAYIN_MAP[gz]||''; }

/* ================= 神煞，纳音，十二长生 顶层真源表=================
 * 四张表统一收编"神煞/十二长生/纳音"的基础本义 + 四卡（事业财运/婚姻感情/性格健康/家庭子女）针对性解读 + 古籍依据。
 * 消费约定：四卡神煞/长生/纳音段一律读本表（SHA_LIFE/CS_MEAN/CS_MARRY/naNote/relNote 四组表集中于此，不再分置）；
 *   DICT 中神煞/十二长生条目由本表 base 字段生成（排盘表格点击 tooltip 的基础本义继续用，见 DICT 定义后）。
 * 神煞查法/落宫规则仍走 BZ.sha*（bazi-core 推算），本表只管"含义与解读"。
 * ============================================================================= */
const SHA_MEAN = {
  /* ， 吉神贵人（日干/月令类），
   * 主事归位：神煞各有主事领域（古籍本义），非矩阵化。综合解厄吉神（天乙/天德/月德/福星等）四卡各一句；
   * 专主神煞只保留有传统命理依据的方向（如羊刃按宫位分野论日支夫妻、年祖上/月父母/时子孙），
   * 无相关含义的方向一律不写、不输出，严禁生造硬编（消费点 m[area] 字段存在性过滤，代码零改动）。
   * 判定方法：结合大模型（《三命通会》《渊海子平》等古籍知识）核对，宁缺毋滥。
   * 依据：《三命通会》神煞各论，羊刃"在年祖上破败、在月父母刑伤、在日夫妻不和、在时子孙不肖"按宫位分野；
   * 咸池主酒色情欲、驿马主动迁奔波、华盖主孤高技艺，神煞天然只在一二领域论事。 */
  '天乙贵人':{base:'命中最吉之神，主逢凶化吉、得贵人相助，日干见特定地支即得（《三命通会》：天乙乃天上之神，吉神之最）',career:'多遇贵人、事业得助，宜借力上位',marry:'得长辈媒妁之助、婚缘有贵人牵线',health:'逢凶化吉、得医得助，病厄易解',family:'父母为贵人、得长辈荫庇',src:'《三命通会·论天乙贵人》'},
  '太极贵人':{base:'主聪明好学、喜神秘玄学，遇难有贵人扶（《三命通会》：太极者太初之极，主心性圆融）',career:'多遇明师贵人、思虑深远，宜谋定后动',src:'《三命通会·论太极贵人》'},
  '福星贵人':{base:'主一生福寿安康、多平安顺遂（《三命通会》：福星主福禄安闲）',career:'平安得福、处事顺遂，利稳守成业',marry:'姻缘顺遂、少波折',health:'福体安康、少病厄',family:'家宅安泰、亲缘和顺',src:'《三命通会·论福星贵人》'},
  '天厨贵人':{base:'食神之禄位，主衣食丰足、厨艺宴享之福（《三命通会·论天厨》）',career:'衣食丰足、利餐饮饮食之业',family:'家道殷实、餐食丰裕',src:'《三命通会·论天厨贵人》'},
  '文昌贵人':{base:'主聪明好学、利文途考试，日干见特定地支为文昌（《渊海子平》：文昌主文贵）',career:'利考试进修、文才立身，宜文书案牍之业',src:'《渊海子平·论文昌》'},
  '学堂':{base:'日干长生之地，主聪慧好学、有文才，如人入学堂受教（《三命通会·论学堂词馆》）',career:'利学业深造、有真才实学，宜学术专技',src:'《三命通会·论学堂词馆》'},
  '词馆':{base:'食神之禄位（与天厨同源），主文章、才学、利科名（《三命通会·论学堂词馆》）',career:'利文章功名、才学受用，宜文教出版',src:'《三命通会·论学堂词馆》'},
  '国印贵人':{base:'正印之禄位，主掌印、权柄、诚信，宜公门公职（《三命通会·论国印》）',career:'掌印信、宜公职文书，名分有凭',src:'《三命通会·论国印贵人》'},
  '禄神':{base:'日干临官之地，主俸禄、安稳、享福，为养命之源（《三命通会·论禄》）',career:'俸禄安稳、居官得禄，衣食有源',family:'家底殷实、衣食无忧',src:'《三命通会·论禄》'},
  '暗禄':{base:'日干禄位之六合支，主暗中有福、贵人暗助（《渊海子平·论暗禄》）',career:'暗得俸禄、偏财有源，闷声得利',family:'家底暗中厚实',src:'《渊海子平·论暗禄》'},
  '金舆':{base:'日干之金舆（舆者车也），主富贵荣华、得妻财之助（《三命通会·论金舆》）',career:'车马之福、出行得利，人脉通达',marry:'婚嫁排场、得舆服之荣，配偶助力',src:'《三命通会·论金舆》'},
  '华盖':{base:'主聪明孤高、喜艺术宗教玄学，性近僧道、孤芳自赏（《三命通会·论将星华盖》：多主孤寡）',career:'技艺专精、好玄学数术，宜专业深耕',marry:'感情偏出世、宜精神契合',health:'性孤喜静、防孤郁，宜主动社交',src:'《三命通会·论将星华盖》'},
  '天德贵人':{base:'月支对应之德神，主转危为安、逢凶化吉，最解凶煞（《三命通会·论天德贵人》）',career:'逢凶化吉、德望服众，危中有救',marry:'婚姻有德解、化险为夷',health:'病得化解、厄难有解',family:'家宅得庇、平安顺遂',src:'《三命通会·论天德贵人》'},
  '月德贵人':{base:'月支三合局之阳干，主仁慈、化灾、添福（《三命通会·论月德贵人》）',career:'慈和得助、逢凶化吉，人缘为福',marry:'夫妻仁和、少口角',health:'病得化解、体气安和',family:'家宅平安、亲慈子孝',src:'《三命通会·论月德贵人》'},
  '天赦':{base:'春戊寅、夏甲午、秋戊申、冬甲子，主罪过消解、逢凶化吉（《三命通会·论天赦》）',career:'罪过可赦、事多转机，危中有救',health:'灾厄易解、逢凶化吉',src:'《三命通会·论天赦》'},
  '三奇贵人':{base:'天干顺布甲戊庚、乙丙丁、壬癸辛，主奇才异能、富贵清奇（《三命通会·论三奇》）',career:'格局清奇、人中之秀、异路功名',src:'《三命通会·论三奇》'},
  '德秀贵人':{base:'月令三合局五行透干，主慈善、聪秀、逢凶化吉（《三命通会·论德秀》）',career:'才秀德备、利文途清贵',family:'子女秀慧、家教有方',src:'《三命通会·论德秀贵人》'},
  /* ， 武权类 ， */
  '将星':{base:'三合局之中神，主组织领导才能、有权威（《三命通会·论将星华盖》）',career:'掌权统御、有领导才，宜管理军警之业',src:'《三命通会·论将星华盖》'},
  '羊刃':{base:'日干帝旺之地，刚烈逞强，吉则掌权、凶则伤灾（《三车一览》：主伤残之灾，亦主刑法犯罪）。阴干取支有帝旺派与禄前派两说，本站并列同出',career:'掌权果决、敢作敢为，宜武职竞争',marry:'羊刃临日支主夫妻不和，性刚易争、宜多让（宫位分野）',health:'性刚易伤、男防血光女防刑克',family:'羊刃临年祖上破败、月父母刑伤、时子孙不肖，家防刚烈宜柔济（宫位分野）',src:'《三命通会·论羊刃》'},
  '魁罡':{base:'庚戌、庚辰、壬辰、戊戌四日，主刚烈果决、掌权、性严（《三命通会·论魁罡》）',career:'性刚果决、掌权有声，宜纪律之业',health:'性刚气盛、宜疏解情绪',src:'《三命通会·论魁罡》'},
  '金神':{base:'乙丑、己巳、癸酉三日，主刚毅、武贵，遇火乡发福（《三命通会·论金神》）',career:'刚毅有为、逆境奋发，遇火乡发福',src:'《三命通会·论金神》'},
  /* ， 财禄类 ， */
  '驿马':{base:'三合局冲位，主变动、远行、奔波，动中得财（《三命通会·论驿马》：驿马者动也）',career:'好动、宜外出发展，奔波中求财求学',marry:'聚少离多、姻缘或在他乡',health:'防车马出行之险，宜慎旅途',family:'早年或随家迁徙',src:'《三命通会·论驿马》'},
  '破碎煞':{base:'主破败耗散、财物有损，做事多波折（《渊海子平·论破碎》）',career:'防破财损耗，理财宜保守',family:'家财防耗、宜节俭',src:'《渊海子平·论破碎》'},
  '十恶大败':{base:'十日大败，主花钱无度、仓库空虚（《三命通会·论十恶大败》）',career:'防财库虚耗、不宜冒进求财',family:'家财防空、宜勤俭',src:'《三命通会·论十恶大败》'},
  '劫煞':{base:'三合局绝位，主狡黠多变、偶有不测劫夺（《三命通会·论劫煞》）',career:'财防劫夺、动中防失',health:'防意外劫夺、出行谨慎',src:'《三命通会·论劫煞》'},
  '元辰':{base:'年支查余支，主耗损、口舌、颠倒不安，性喜酒色（《三命通会·论元辰》）',career:'防是非暗昧、口舌耗损',marry:'防情缘暗昧、口角是非',health:'防心神不宁、酒色伤身',family:'家防口舌、宜静守',src:'《三命通会·论元辰》'},
  '勾煞':{base:'勾连纠缠之神，主牵绊、是非、官讼（《三命通会·论勾绞》）',career:'防勾连是非、合同牵绊',family:'家防纠缠、宜明断',src:'《三命通会·论勾绞》'},
  '绞煞':{base:'绞绕束缚之神，主困顿、纠缠、身心不宁（《三命通会·论勾绞》）',career:'防纠缠官非、困顿阻隔',health:'防身心不宁、宜舒展',src:'《三命通会·论勾绞》'},
  /* ， 情缘类（婚恋神煞）， */
  '红鸾':{base:'主婚恋喜庆、姻缘早动，桃花之正配（《星平会海》：红鸾主婚配喜庆）',marry:'桃花喜庆、姻缘早动，婚缘有喜',src:'《星平会海》'},
  '天喜':{base:'主喜事临门、化解忧疑，与红鸾相辅（《星平会海》：天喜主喜庆）',marry:'婚恋多喜庆、喜事临门',src:'《星平会海》'},
  '桃花':{base:'主异性缘、情欲、人缘，吉则潇洒多情、凶则风流惹祸（《三命通会·论咸池》：多性巧、耽酒色）',career:'人缘旺、宜社交公关之业',marry:'人缘异性缘佳、须防纷扰',health:'防酒色耗神、宜节制',src:'《三命通会·论咸池》'},
  '咸池':{base:'桃花之别名，主风流多情、异性缘浓（《三命通会·论咸池》：如生旺则美容仪、耽酒色）',career:'交际得利、宜人脉之业',marry:'桃花艳丽、感情多采，须专一',health:'防情欲耗神、宜养心',src:'《三命通会·论咸池》'},
  '红艳煞':{base:'主异性缘浓、风情多欲，亦主浪漫才情（《渊海子平·论红艳》）',career:'才情浪漫、宜文艺之业',marry:'情缘外露、易有偏缘，宜守正',src:'《渊海子平·论红艳》'},
  '孤鸾':{base:'主女克夫、男克妻，婚姻多迟或多变（《渊海子平·论孤鸾》）',marry:'婚姻宜迟、宜多沟通经营',health:'性孤防郁、宜外向',src:'《渊海子平·论孤鸾》'},
  '阴差阳错':{base:'主婚姻不顺、门户差错、是非牵缠（《三命通会·论女命》）',career:'事多阴错阳差、宜守正',marry:'婚缘迟误、宜包容晚成',src:'《三命通会·论女命》'},
  '孤辰':{base:'主孤僻少合、六亲缘薄，男女皆忌、主迟婚或离群（《三命通会·论孤辰寡宿》）',marry:'婚缘宜迟、性孤',health:'性孤防郁、宜外向社交',family:'六亲缘淡、宜主动亲近',src:'《三命通会·论孤辰寡宿》'},
  '寡宿':{base:'主孤寡冷清、夫妻缘浅，与孤辰并见尤甚（《三命通会·论孤辰寡宿》）',marry:'婚缘宜迟、性孤',family:'子女缘偏薄、宜用心维系',src:'《三命通会·论孤辰寡宿》'},
  '八专':{base:'八日专气，主情欲偏重、夫妻恩深亦易纠葛（《三命通会·论八专》）',marry:'情欲偏重、宜节制，恩深亦易纠葛',src:'《三命通会·论八专》'},
  '九丑':{base:'九丑日生人，主容貌秀丽、多情，然感情易生波折（《三命通会·论九丑》）',career:'才貌双全、宜台前之业',marry:'感情多波、宜慎宜晚',src:'《三命通会·论九丑》'},
  '童子':{base:'童子煞（查日支、时支：季节句春秋生人见寅子、冬夏生人见卯未辰；纳音句金木命见午卯、水火命见酉戌、土命见辰巳），民俗主姻缘迟滞、体弱多磨，仅供民俗参考（《渊海子平》民俗神煞）',marry:'婚姻迟缓、恋爱波折多，晚婚或易离婚，但并非注定孤寡',health:'主从小体弱多病、或有慢性怪病之扰；心思敏感多思、好神秘之学或艺术天赋较高',src:'《渊海子平》民俗神煞'},
  /* ， 伤灾类 ， */
  '血刃':{base:'血刃临支，主血光刑伤，防刀伤、手术、产厄（《三命通会》血刃歌诀）',career:'宜避刀兵之业、慎风险',health:'防血光、手术、意外伤，出行运动谨慎',src:'《三命通会》血刃歌诀'},
  '飞刃':{base:'羊刃对冲之地，性烈易伤，主血光刑伤（《三命通会·论羊刃》衍）',career:'宜避风险行业、慎动',health:'防血光意外伤、宜谨慎',src:'《三命通会·论羊刃》衍'},
  '天医':{base:'月支后一位，主医药、逢凶化吉，多从事医卜星相或体弱得医（《三命通会·论天医》）',career:'宜医药养生之业、救人得福',health:'与医药有缘、弱处得医',src:'《三命通会·论天医》'},
  '天刑':{base:'主刑伤、官非之象，宜修身慎行（《三命通会·论天刑》）',career:'防刑责是非、宜守规矩',health:'防刑伤、手术，宜慎行',src:'《三命通会·论天刑》'},
  '灾煞':{base:'与将星对冲，主灾患刑伤、防意外血光（《三命通会·论灾煞》）',career:'防灾祸变故、宜稳守',health:'防灾厄意外、慎出行',src:'《三命通会·论灾煞》'},
  '亡神':{base:'主心思深沉、谋略，过旺则易惹官非口舌（《三命通会·论亡神》）',career:'谋略深沉、宜幕后策划',family:'家宅宜静、防口舌',src:'《三命通会·论亡神》'},
  '天罗':{base:'戌亥为天罗，主困滞、网罗，男命尤忌（《三命通会·论天罗地网》）',career:'防困滞网罗、官非之灾',health:'防牢狱官非之灾、慎行',src:'《三命通会·论天罗地网》'},
  '地网':{base:'辰巳为地网，主拘束、困顿，女命尤忌（《三命通会·论天罗地网》）',career:'防拘束困顿、宜破局',health:'防牢狱官非之灾、慎行',src:'《三命通会·论天罗地网》'},
  '流霞':{base:'日干所主之霞光煞（己日见午等），主酒色、血光（《渊海子平·论流霞》）',career:'防酒色误事、慎应酬',health:'防血光、产厄，男防酒色女防产',src:'《渊海子平·论流霞》'},
  '丧门':{base:'主孝服丧事、阴晦之忧，宜谨慎避争（《渊海子平》流年神煞）',family:'防家中有哀、宜慎丧祭',src:'《渊海子平》流年神煞'},
  '吊客':{base:'主吊唁哀戚、是非纠缠（《渊海子平》流年神煞）',family:'防吊唁之忧、宜慎',src:'《渊海子平》流年神煞'},
  '披麻':{base:'年支后三位，主孝服丧事、破财伤病（《渊海子平》流年神煞）',health:'防伤病、宜护养',family:'防孝服之忧、宜慎',src:'《渊海子平》流年神煞'},
  /* ， 日格类 ， */
  '十灵日':{base:'甲辰、乙亥、丙辰、丁酉、戊午、庚戌、庚寅、辛亥、壬寅、癸未十日，主灵慧聪颖、悟性高、近五术玄学（《渊海子平》日格）',career:'性灵慧、宜术数玄学策划之业',src:'《渊海子平》日格'},
  '六秀日':{base:'丙午、丁未、戊子、戊午、己丑、己未六日，主聪明秀气、才貌双全、人缘佳（《渊海子平》日格）',career:'才貌清秀、利文艺台前之业',marry:'姿仪动人、缘多人喜',src:'《渊海子平》日格'}
};

/* 十二长生 顶层真源表：十二长生状态 → {base 本义, 四卡解读, src 古籍}
 * 消费约定：婚姻卡 CS_MEAN/CS_MARRY 收编于此（marry 字段）；健康卡日支元气注读 health；
 *   家庭卡年支/时支长生注读 family；事业卡 PILLAR_CS_NOTE（长生×柱位矩阵）与 XI_CS_NOTE（喜用强弱）为
 *   柱位/强弱专用微调、保留消费本表 base；DICT 长生条目由本表 base 生成（tooltip 用）。
 * 依据：长生十二宫出《五行大义》《渊海子平·论长生》，三命通会"五行生旺衰绝"承其说。
 */
const CS_MEAN_ALL = {
  '长生':{base:'万物始生，如人之初生，主生机、朝气、发端（《渊海子平·论长生》）',career:'根基初立、事业起步，宜开创新局',marry:'婚缘有生发之机，关系易见成长',health:'元气初生、生机旺，宜顺势养正',family:'家运始兴、新添人丁之喜',src:'《渊海子平·论长生》'},
  '沐浴':{base:'如婴儿洗浴，主风流、脱败，亦主新局初成之脆弱（《渊海子平·论沐浴》）',career:'新局未稳、防骄纵失机，宜谦持',marry:'感情易波动、须专一，防露水缘',health:'气血外浮、防酒色耗神',family:'家运初立未稳、防外扰',src:'《渊海子平·论沐浴》'},
  '冠带':{base:'如人加冠束带，主成长、名誉渐立（《渊海子平·论冠带》）',career:'名位渐立、才学受用，宜竞取功名',marry:'配偶得体、关系成形稳定',health:'元气渐充、体魄渐健',family:'家声渐起、子弟成才',src:'《渊海子平·论冠带》'},
  '临官':{base:'如人出仕，主自立、有权、得名利（《渊海子平·论临官》）',career:'自立掌权、得名利之位，宜乘势而进',marry:'配偶自立有成、婚姻得力',health:'元气旺盛、精力充沛',family:'家道自立、门庭得势',src:'《渊海子平·论临官》'},
  '帝旺':{base:'如人壮年极盛，主精力充沛、事业顶峰，过则易折（《渊海子平·论帝旺》）',career:'事业顶峰、势不可挡，然盛极防折',marry:'夫妻宫当令、关系主导力强',health:'元气极旺、然过旺防亢',family:'家运极盛、防盛极而衰',src:'《渊海子平·论帝旺》'},
  '衰':{base:'盛极而衰，主气力减弱、守成（《渊海子平·论衰》）',career:'攻势转守、宜守成聚势，不宜冒进',marry:'婚姻气弱、须主动经营',health:'元气转弱、宜养守',family:'家运转平、宜守成',src:'《渊海子平·论衰》'},
  '病':{base:'主虚弱、困顿，需养（《渊海子平·论病》）',career:'事多困顿、宜养精蓄锐待时',marry:'感情易生嫌隙、多体贴沟通',health:'元气偏弱、易倦怠，宜调养',family:'家运有滞、宜养息',src:'《渊海子平·论病》'},
  '死':{base:'主静止、终结，非凶，乃旧气收敛、新气未萌之过渡（《渊海子平·论死》）',career:'旧局收敛、新机未萌，宜守静待时',marry:'感情偏淡、宜培养',health:'元气内敛、宜静养固本',family:'家运收敛、宜积蓄待新',src:'《渊海子平·论死》'},
  '墓':{base:'如入库收藏，主收敛、积蓄，亦为归宿（《渊海子平·论墓》）',career:'积累成库、宜收成储势，勿泄其库',marry:'感情内敛慢热、宜晚婚经营',health:'元气藏蓄、宜固本防郁',family:'家资入库、宜积累传家',src:'《渊海子平·论墓》'},
  '绝':{base:'主断绝、潜伏，旧气已尽、新气未生（《渊海子平·论绝》）',career:'旧路已断、新机待萌，宜蛰伏转型',marry:'情缘易绝、须主动维系',health:'元气潜伏、宜静养待复',family:'家运潜伏、宜蓄力',src:'《渊海子平·论绝》'},
  '胎':{base:'如受孕，主新机萌动、酝酿（《渊海子平·论胎》）',career:'新机酝酿、宜规划布局，静待其发',marry:'缘起微弱、宜渐次培养',health:'新气始萌、宜培元',family:'家运怀新、人丁有望',src:'《渊海子平·论胎》'},
  '养':{base:'如胎养，主滋养、待发，蓄势阶段（《渊海子平·论养》）',career:'蓄势待发、宜养才储力',marry:'关系需养护、宜温和经营',health:'元气待养、宜进补',family:'家运养息、蓄势待兴',src:'《渊海子平·论养》'}
};

/* 纳音五行与日主生克关系 顶层真源表：{base 本义, 四卡解读}
 * 消费约定：婚姻 naNote / 健康 relNote / 家庭纳音段 / 事业日柱纳音 一律读本表；
 *   六十甲子纳音逐条本义仍走 NAYIN_INFO（tooltip 用）。
 * 标源口径：纳音取象本义见《三命通会·论纳音》；然“以纳音五行与日主正五行论生克”一法，两书无明文成说，
 *   属本站按纳音独立辅助地位所作推演，故各条 src 统一记“本站依古法推演”，不冒称古籍原文。
 */
const NAYIN_REL_MEAN = {
  '生日主':{base:'纳音之气生日主，如母之养子，主得外助、根基有养',career:'纳音生日主，事业得滋养、根基稳、贵人暗助',marry:'配偶宫纳音生日主，关系得助、对方滋养自身',health:'纳音生日主，体质得补、先天得养',family:'纳音生日主，家运得补、祖荫有情',src:'本站依古法推演'},
  '克日主':{base:'纳音之气克日主，如官之制身，主受制、须自强调和',career:'纳音克日主，事业有制、压力偏重，宜以实力化解',marry:'配偶宫纳音克身，配偶气质偏冷、关系对日主有约束，宜温润调和',health:'纳音克日主，体质受制、宜养护',family:'纳音克日主，家运有制、宜以和济之',src:'本站依古法推演'},
  '日主所生':{base:'日主之纳音生外，主付出、泄耗，宜量力而为',career:'日主纳音生外，事业多付出、利创造开拓',marry:'日主生配偶宫纳音，关系中日主多付出、易为对方耗神',health:'纳音泄日主，精力多耗、宜节劳',family:'日主纳音生家，为家付出、宜量力',src:'本站依古法推演'},
  '日主所克':{base:'日主之纳音克外，主得制、驾驭，宜防独断',career:'日主纳音克外，事业可驾驭掌控、宜掌主导',marry:'日主克配偶宫纳音，关系中日主占主导、注意不要独断',health:'纳音为日主所克，体气易过用、宜疏泄有度',family:'日主纳音制家，家计由己主导、宜宽和',src:'本站依古法推演'},
  '比和':{base:'纳音与日主同气，主同气相扶、相处平顺',career:'纳音与日主比和，事业平稳、同气相助',marry:'配偶宫纳音与日主比和，相处平顺',health:'纳音与日主比和，体质平和、以常养为要',family:'纳音与日主比和，家运平顺、亲缘和合',src:'本站依古法推演'}
};
/* 纳音六亲宫 顶层真源表：禄命古法以年命纳音为身，四柱纳音分主四宫。
 *   年纳音＝祖上根基（称“年命”，为全局本位）、月纳音＝父母兄弟宫、日纳音＝夫妻宫、时纳音＝子息宫。
 *   各宫以“本柱纳音相对年命纳音之向”论向背，键与 wxRel(年命, 本柱).rel 同口径：
 *   生我＝本柱生年命、我生＝年命生本柱、克我＝本柱克年命、我克＝年命克本柱、比和＝同气；
 *   倾向沿用 wxRel 的 tone（吉、耗、制、得、平）。
 *   两字段各归其位（同 SHA_MEAN 四卡式）：
 *     gong ＝六亲宫释义，供纳音深度模块“六亲宫”表（言父母兄弟、夫妻、子息）；
 *     stage＝阶段释义，供事业财运议题纳音段（月主青年、时主晚运，只言运程向背，不谈六亲称谓）。
 *   禁另建同义表；日宫不入事业卡，故只有 gong。 */
const NAYIN_GONG_MEAN = {
  月:{ '生我':{gong:'父母兄弟之纳音生助年命，青年得家荫、根基有扶', stage:'月柱纳音生助年命，青年得荫助、根基有扶，利技艺学业起步'},
       '我生':{gong:'年命生及父母兄弟之纳音，青年多付出、根基荫及亲长', stage:'年命生及月柱纳音，青年多付出、宜稳扎积累'},
       '克我':{gong:'父母兄弟之纳音克年命，青年家计有制、宜自持自立', stage:'月柱纳音克年命，青年有制、宜自持自立'},
       '我克':{gong:'年命克父母兄弟之纳音，青年由己主导、亲长从己意', stage:'年命克月柱纳音，青年由己主导、宜主动开拓'},
       '比和':{gong:'父母兄弟之纳音与年命同气，青年平顺、亲缘和合', stage:'月柱纳音与年命同气，青年平顺、宜顺势经营'} },
  日:{ '生我':{gong:'夫妻宫纳音生助年命，配偶之质补己、婚姻有助'},
       '我生':{gong:'年命生及夫妻宫纳音，婚姻中己多付出、易为对方费心'},
       '克我':{gong:'夫妻宫纳音克年命，配偶气质偏制、宜温润调和'},
       '我克':{gong:'年命克夫妻宫纳音，婚姻中己占主导、宜防独断'},
       '比和':{gong:'夫妻宫纳音与年命同气，相处平顺、缘分稳固'} },
  时:{ '生我':{gong:'子息之纳音生助年命，晚运得子女之益、根基延于后', stage:'时柱纳音生助年命，晚运得益助、宜守成'},
       '我生':{gong:'年命生及子息之纳音，晚年为子女付出、荫及后代', stage:'年命生及时柱纳音，晚年多付出、宜量力'},
       '克我':{gong:'子息之纳音克年命，晚运有制、宜循序交接', stage:'时柱纳音克年命，晚运有制、宜沉潜蓄势'},
       '我克':{gong:'年命克子息之纳音，晚年由己主导、子息从己意', stage:'年命克时柱纳音，晚年由己主导、宜早作布局'},
       '比和':{gong:'子息之纳音与年命同气，晚运平顺、嗣息和合', stage:'时柱纳音与年命同气，晚运平顺、宜沉淀蓄养'} }
};
if(typeof window!=='undefined'){ window.SHA_MEAN=SHA_MEAN; window.CS_MEAN_ALL=CS_MEAN_ALL; window.NAYIN_REL_MEAN=NAYIN_REL_MEAN; window.NAYIN_GONG_MEAN=NAYIN_GONG_MEAN; window.GAN_NATURE=GAN_NATURE; window.WX_SIXIANG=WX_SIXIANG; }

/* ---------- 十神（同五行异干比肩、劫财）---------- */
function tenGod(dg, og){
  if(dg===og) return '比肩';
  const yin = s=>YANG.indexOf(s)>=0;
  const same = yin(dg)===yin(og);
  const dw=GAN_WX[dg], ow=GAN_WX[og];
  if(dw===ow) return same?'比肩':'劫财';            // 同五行异干
  if(WX_SHENG[dw]===ow) return same?'食神':'伤官';   // 我生
  if(WX_KE[dw]===ow)   return same?'偏财':'正财';    // 我克
  if(WX_SHENG[ow]===dw) return same?'偏印':'正印';   // 生我
  if(WX_KE[ow]===dw)   return same?'七杀':'正官';    // 克我
  return '';
}
/* 具体十神名  类别（与扶抑用神 xi/ji 的类别一致：比劫、食伤、财星、官杀、印星） */
function shenCat(t){
  if(t==='比肩'||t==='劫财') return '比劫';
  if(t==='食神'||t==='伤官') return '食伤';
  if(t==='正财'||t==='偏财') return '财星';
  if(t==='正官'||t==='七杀'||t==='七杀（偏官）') return '官杀';
  if(t==='正印'||t==='偏印'||t==='偏印（枭神）') return '印星';
  return t;
}

/* ---------- 详情词典 ---------- */
const DICT = {
  /* 十神 */
  '比肩':{t:'比肩',d:'与日主同五行同阴阳的天干。代表同辈、朋友、自我意识，主帮扶。'},
  '劫财':{t:'劫财',d:'与日主同五行异阴阳的天干。代表兄弟、竞争、破耗，亦助身但易争财。'},
  '食神':{t:'食神',d:'日主所生、同阴阳者。代表才华、口福、表达，性情温和为福神。'},
  '伤官':{t:'伤官',d:'日主所生、异阴阳者。代表聪明外露、叛逆创新，克官杀。'},
  '正财':{t:'正财',d:'日主所克、同阴阳者。代表稳定收入、妻子（男命）、务实。'},
  '偏财':{t:'偏财',d:'日主所克、异阴阳者。代表横财、父亲、交际、意外之财。'},
  '正官':{t:'正官',d:'克日主、同阴阳者。代表事业、名利、约束、丈夫（女命）。'},
  '七杀':{t:'七杀（偏官）',d:'克日主、异阴阳者。代表压力、权威、魄力，亦为小人灾厄。'},
  '正印':{t:'正印',d:'生日主、同阴阳者。代表母亲、学识、庇护，为贵人福神。'},
  '偏印':{t:'偏印（枭神）',d:'生日主、异阴阳者。代表冷门才学、孤独，过旺为枭神夺食。'},
  /* 六亲（十神归组，量化模块点击释义用） */
  '比劫':{t:'比劫（兄弟）',d:'比肩与劫财的合称，六亲属兄弟、同辈，含日主自身。代表兄弟姐妹、朋友、同事、竞争与分夺；与日主同气，主帮扶也主争财。'},
  '食伤':{t:'食伤（子孙）',d:'食神与伤官的合称，六亲属子孙、晚辈，为日主所生。代表子女、才华、口才、技艺与表达；生财之源，亦泄日主之气。'},
  '财星':{t:'财星（妻财）',d:'正财与偏财的合称，六亲属妻财，为日主所克。代表财富、资产、妻子（男命）、父亲（偏财）；养命之源，亦耗日主。'},
  '官杀':{t:'官杀（官鬼）',d:'正官与七杀的合称，六亲属官鬼，为克日主者。代表事业、名望、丈夫（女命）、管束与压力；成格为贵，过旺为灾。'},
  '印星':{t:'印星（父母）',d:'正印与偏印的合称，六亲属父母、长辈，为生日主者。代表母亲、学识、庇护与贵人；正印为福，偏印过旺为枭神夺食。'},
  /* 神煞（日干类） */
  '天乙贵人':{t:'天乙贵人',d:'命中最吉之神，主逢凶化吉、得贵人相助。日干见特定地支即得。'},
  '文昌贵人':{t:'文昌贵人',d:'主聪明好学、利文途考试。日干见特定地支为文昌。'},
  '文昌':{t:'文昌贵人',d:'主聪明好学、利文途考试。'},
  '羊刃':{t:'羊刃',d:'日干帝旺之地，刚烈逞强，吉则掌权、凶则伤灾。男防血光，女防刑克。阴干取支有帝旺、禄前两派，本站并列同出。'},
  '禄神':{t:'禄神',d:'日干临官之地，主俸禄、安稳、享福，为养命之源。'},
  '太极贵人':{t:'太极贵人',d:'主聪明好学、喜神秘玄学，遇难有贵人扶。'},
  '福星贵人':{t:'福星贵人',d:'主一生福寿安康，多平安顺遂。'},
  '天厨贵人':{t:'天厨贵人',d:'食神之禄位，主衣食丰足、厨艺宴享之福。'},
  '飞刃':{t:'飞刃',d:'羊刃对冲之地，性烈易伤，主血光刑伤，须防意外。'},
  '红艳煞':{t:'红艳煞',d:'主异性缘浓、风情多欲，亦主浪漫才情，桃花之外又一重情缘。'},
  '天医':{t:'天医',d:'月支后一位（如午月见巳）。主医药、逢凶化吉，多从事医卜星相或体弱得医。'},
  '流霞':{t:'流霞',d:'日干所主之霞光煞（己日见午等）。主酒色、血光，男防酒色之灾、女防产厄，宜修身。'},
  '词馆':{t:'词馆',d:'食神之禄位（与天厨同源）。主文章、才学、利科名，聪明善文。'},
  '学堂':{t:'学堂',d:'日干长生之地。主聪慧好学、有文才，如人入学堂受教。'},
  '国印贵人':{t:'国印贵人',d:'正印之禄位。主掌印、权柄、诚信，宜公门公职。'},
  '金舆':{t:'金舆',d:'日干之金舆（舆者车也）。主富贵荣华、得妻财之助，出行安稳。'},
  '血刃':{t:'血刃',d:'血刃临支（按日干起，甲乙午、丙丁未、戊己辰、庚辛酉、壬癸申）。主血光刑伤，防刀伤、手术、产厄，宜谨慎。'},
  '德秀贵人':{t:'德秀贵人',d:'月令三合局五行透干（如木局见甲乙）。主慈善、聪秀、逢凶化吉。'},
  '暗禄':{t:'暗禄',d:'日干禄位之六合支。主暗中有福、贵人暗助，虽不见显达而实得庇护。'},
  '文昌位':{t:'文昌位',d:'文昌贵人地支对应的八卦方位（如巳在东南）。主利读书、考试、文才，可于此方位布文昌塔。'},
  '童子':{t:'童子煞',d:'童子煞全口径（查日支或时支）：季节句，春秋生人见寅、子，冬夏生人见卯、未、辰；纳音句，年柱纳音金木命见午、卯，水火命见酉、戌，土命见辰、巳。民俗所谓“童子命”主姻缘迟滞、体弱多磨，仅供民俗参考，切勿迷信。'},
  /* 三合局类（年、日支） */
  '驿马':{t:'驿马',d:'主变动、远行、奔波。命中带驿马者多外出、迁居、动中得财。'},
  '桃花':{t:'桃花（咸池）',d:'主异性缘、情欲、人缘。吉则潇洒多情，凶则风流惹祸。'},
  '华盖':{t:'华盖',d:'主聪明孤高、喜艺术宗教玄学，性近僧道，孤芳自赏。'},
  '将星':{t:'将星',d:'主组织领导才能，有权威，多在军警政界显达。'},
  '劫煞':{t:'劫煞',d:'主狡黠多变、偶有不测劫夺，宜修德免灾。'},
  '灾煞':{t:'灾煞',d:'主灾患刑伤，与将星对冲，防意外血光。'},
  '亡神':{t:'亡神',d:'主心思深沉、谋略，过旺则易惹官非口舌。'},
  /* 年支类 */
  '孤辰':{t:'孤辰',d:'主孤僻少合、六亲缘薄，男女皆忌，主迟婚或离群。'},
  '寡宿':{t:'寡宿',d:'主孤寡冷清、夫妻缘浅，与孤辰并见尤甚。'},
  '红鸾':{t:'红鸾',d:'主婚恋喜庆、姻缘早动，桃花之正配。'},
  '天喜':{t:'天喜',d:'主喜事临门、化解忧疑，与红鸾相辅。'},
  '丧门':{t:'丧门',d:'主孝服丧事、阴晦之忧，宜谨慎避争。'},
  '吊客':{t:'吊客',d:'主吊唁哀戚、是非纠缠，与丧门并见防孝服。'},
  '破碎煞':{t:'破碎煞（大耗）',d:'主破败耗散、财物有损，做事多波折。'},
  '披麻':{t:'披麻',d:'年支后三位（如子年见酉）。主孝服丧事、破财伤病，多与丧门、吊客并论，常见于流年引动。'},
  '元辰':{t:'元辰（大耗）',d:'年支查余支，阳男阴女与阴男阳女所查不同。主耗损、口舌、颠倒不安，性喜酒色；逢六合则转吉。日柱见之克配偶。'},
  '勾煞':{t:'勾煞',d:'勾连纠缠之神，主牵绊、是非、官讼。'},
  '绞煞':{t:'绞煞',d:'绞绕束缚之神，主困顿、纠缠、身心不宁。'},
  '天罗':{t:'天罗',d:'地支查法：戌亥为天罗，主困滞、网罗，男命尤忌。纳音查法：年柱纳音为火者，见戌亥亦为天罗。'},
  '地网':{t:'地网',d:'地支查法：辰巳为地网，主拘束、困顿，女命尤忌。纳音查法：年柱纳音为水、土者，见辰巳亦为地网。'},
  /* 月柱类 */
  '月德贵人':{t:'月德贵人',d:'月支三合局之阳干，主仁慈、化灾、添福，为安祥之吉神。'},
  '月德合':{t:'月德合',d:'月德天干之五合干，吉同月德，主和合、助益。'},
  '天德贵人':{t:'天德贵人',d:'月支对应之德神，主转危为安、逢凶化吉，最解凶煞。'},
  '天德合':{t:'天德合',d:'天德天干之五合干（或四维天德所合之干），吉同天德，主逢凶化吉、和合助益，无天德而有天德合亦能解凶。'},
  /* 日柱专属 */
  '魁罡':{t:'魁罡',d:'庚戌、庚辰、壬辰、戊戌四日。主刚烈果决、掌权，性严衣禄。'},
  '金神':{t:'金神',d:'乙丑、己巳、癸酉三日。主刚毅、武贵，遇火乡发福。'},
  '十恶大败':{t:'十恶大败',d:'十日大败，主花钱无度、仓库空虚，需勤俭补救。'},
  '八专':{t:'八专',d:'八日专气，主情欲偏重、夫妻恩深亦易纠葛。'},
  '九丑':{t:'九丑',d:'九丑日（戊子、戊午、壬子、壬午、乙卯、乙酉、辛卯、辛酉）生人，主容貌秀丽、多情，然感情易生波折，婚姻宜稳、宜晚。'},
  '孤鸾':{t:'孤鸾',d:'主女克夫、男克妻，婚姻多迟或多变。'},
  '阴差阳错':{t:'阴差阳错',d:'主婚姻不顺、门户差错、是非牵缠。'},
  '四废':{t:'四废',d:'四季废日，主精力不济、谋事难成，宜守不宜攻。'},
  '天赦':{t:'天赦',d:'春戊寅、夏甲午、秋戊申、冬甲子。主罪过消解、逢凶化吉，最吉。'},
  '三奇贵人':{t:'三奇贵人',d:'天干顺布甲戊庚、乙丙丁、壬癸辛。主奇才异能、富贵清奇。'},
  '十灵日':{t:'十灵日',d:'甲辰、乙亥、丙辰、丁酉、戊午、庚戌、庚寅、辛亥、壬寅、癸未十日。主灵慧聪颖、直觉敏锐，善察言观色、悟性高，多近五术玄学。'},
  '六秀日':{t:'六秀日',d:'丙午、丁未、戊子、戊午、己丑、己未六日。主聪明秀气、多才多艺、相貌俊秀、人缘佳。'},
  '天转':{t:'天转',d:'春乙卯、夏丙午、秋辛酉、冬壬子。五行极旺之转日，盛极而衰，古诀谓“行人在路须忧死”，主大凶，忌出行、经商、建筑、嫁娶。'},
  '地转':{t:'地转',d:'春辛卯、夏戊午、秋癸酉、冬丙子。与天转同类，五行极旺而转，主大凶，格局无制者多磨难。'},
  /* 十二长生 */
  '长生':{t:'长生',d:'万物始生，主生机、朝气，如人之初生。'},
  '沐浴':{t:'沐浴（败）',d:'如婴儿洗浴，主风流、脱败，亦主新局初成之脆弱。'},
  '冠带':{t:'冠带',d:'如人加冠束带，主成长、名誉渐立。'},
  '临官':{t:'临官',d:'如人出仕，主自立、有权、得名利。'},
  '帝旺':{t:'帝旺',d:'如人壮年极盛，主精力充沛、事业顶峰，过则易折。'},
  '衰':{t:'衰',d:'盛极而衰，主气力减弱、守成。'},
  '病':{t:'病',d:'主虚弱、困顿，需养。'},
  '死（长生）':{t:'死（长生）',d:'十二长生“死”位：主静止、终结，非凶，乃阶段转换，为旧气收敛、新气未萌之过渡。'},
  '墓':{t:'墓（库）',d:'如入库收藏，主收敛、积蓄，亦为归宿。'},
  '绝':{t:'绝',d:'主断绝、潜伏，旧气已尽、新气未生。'},
  '胎':{t:'胎',d:'如受孕，主新机萌动、酝酿。'},
  '养':{t:'养',d:'如胎养，主滋养、待发，蓄势阶段。'},
  /* 旺相休囚死 */
  '旺':{t:'旺',d:'当令者旺。五行得月令之气最盛，如木旺于春。'},
  '相':{t:'相',d:'我生者相。受旺气所生，次旺，如木生火，火相于春。'},
  '休':{t:'休',d:'生我者休。生旺气者功成身退，暂歇，如水生木，水休于春。'},
  '囚':{t:'囚',d:'克我者囚。被旺气所克，囚困无力，如金克木，金囚于春。'},
  '死':{t:'死',d:'我克者死。被旺气所克耗，气绝，如土被木克，土死于春。'},
  /* 纳音 */
  '__NAYIN__':{t:'纳音五行',d:'将干支按六十甲子纳音归为金木水火土之一，用以辅助判别五行强弱与意象。点击具体纳音可见其名与所属五行。'},
  /* 合化，关系 */
  '__HE__':{t:'天干五合',d:'甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火。合为吸引、合作；合化则两干之气归于一五行。'},
  '__HE6__':{t:'地支六合',d:'子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土。主融洽、结合。'},
  '__GANCHONG__':{t:'天干相冲',d:'甲庚、乙辛、丙壬、丁癸相冲（阳干对峙，戊己居中不冲）。主动荡、离散、外力冲击、口舌是非；冲日主或冲用神根基为病，冲去忌神为药。'},
  '__ANHE__':{t:'地支暗合',d:'寅丑、亥午、子巳、卯申暗合。主隐秘、私下、不易察觉之合，如暗中相助或暗恋；牵绊日主、用神为病，暗中去忌为药。'},
  '__HEBUHUA__':{t:'合而不化（合绊）',d:'两干、两支相合，但化神五行未透干、未得令、未得根，不能真正合化，仅相互牵绊（合绊），各不失其本性；主迟滞、分心、事多羁绊。'},
  '__ZHENGHE__':{t:'争合（妒合）',d:'一干被两干所合（如两甲争一己、两己争一甲），名分不定、意见分夺、立场摇摆；日主被争合则气势被分夺。'},
  '__SANHE__':{t:'地支三合',d:'申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金。三柱汇聚一五行之气，力量强。'},
  '__SANHUI__':{t:'地支三会',d:'寅卯辰会东方木、巳午未会南方火、申酉戌会西方金、亥子丑会北方水。会一方之气，力量最大。'},
  '__CHONG__':{t:'地支六冲',d:'子午、丑未、寅申、卯酉、辰戌、巳亥相冲。主冲突、变动、离散。'},
  '__XING__':{t:'地支相刑',d:'寅巳申无恩之刑、丑戌未恃势之刑、子卯无礼之刑、辰午酉亥自刑。主刑伤、是非。'},
  '__HAI__':{t:'地支相害（相穿）',d:'子未、丑午、寅巳、卯辰、申亥、酉戌相害。主暗损、阻隔、不和。'},
  '__PO__':{t:'地支相破',d:'子酉、寅亥、卯午、辰丑、巳申、未戌相破。主破坏、离散、暗耗。'},
  '__SHENG__':{t:'五行相生',d:'木生火、火生土、土生金、金生水、水生木。主滋生、帮扶、流通。'},
  '__KE__':{t:'五行相克',d:'木克土、土克水、水克火、火克金、金克木。主制约、消耗、压力。'},
  '__BIHE__':{t:'天干比和，比肩',d:'同五行天干相助：同干同名（如甲甲）为比肩，同五行异干（如甲乙、丙丁）为比和。主同气帮扶、同辈协助、自我意识；过旺则为争竞、分夺。'}
};
/* DICT 中神煞/十二长生条目由顶层真源表生成（基础本义唯一产地=SHA_MEAN/CS_MEAN_ALL，
 * 排盘表格 tooltip 继续读 DICT 基础本义；保留 DICT 原标题 t 与其它非神煞条目不动） */
(function(){
  Object.keys(SHA_MEAN).forEach(k=>{ DICT[k]={t:(DICT[k]&&DICT[k].t)||k, d:SHA_MEAN[k].base}; });
  Object.keys(CS_MEAN_ALL).forEach(k=>{ DICT[k]={t:(DICT[k]&&DICT[k].t)||k, d:CS_MEAN_ALL[k].base}; });
  /* 墓库释义：供基础信息排盘表"墓库"栏点击弹出（与神煞弹出一致样式） */
  DICT['水库']={t:'水库',d:'辰为水库，收藏蓄积，水之归宿。藏物待用，逢冲则库门开、库中物得用；未冲则藏而不显。'};
  DICT['火库']={t:'火库',d:'戌为火库，归藏待发，火之归宿。藏物待用，逢冲则库门开、库中物得用；未冲则藏而不显。'};
  DICT['金库']={t:'金库',d:'丑为金库，凝炼收藏，金之归宿。藏物待用，逢冲则库门开、库中物得用；未冲则藏而不显。'};
  DICT['木库']={t:'木库',d:'未为木库，生养归藏，木之归宿。藏物待用，逢冲则库门开、库中物得用；未冲则藏而不显。'};
})();
function tipHtml(key){
  const o = DICT[key];
  if(!o) return `<div class="tip-body">（暂无说明）</div>`;
  return `<h3 class="tip-title">${o.t}</h3><div class="tip-body">${o.d}</div>`;
}

/* ============================================================
   格局分析，喜用神引擎（扶抑 / 调候 / 通关 / 格局）， 全局共享
   八字排盘与命理圆桌会共用本引擎（baziAnalysis）。
   ============================================================ */
const GAN_OF_WX = {'木':['甲','乙'],'火':['丙','丁'],'土':['戊','己'],'金':['庚','辛'],'水':['壬','癸']};
const LU_OF  = {'甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
const REN_OF = {'甲':'卯','乙':'寅','丙':'午','丁':'巳','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'};
const GE_USE = {
  '正官格':{xi:'财星、财生官、印星、印护官',ji:'伤官克官、官杀混杂、地支刑冲'},
  '七杀格':{xi:'食神制杀、印星化杀',ji:'财星生杀、杀重无制'},
  '正印格':{xi:'官杀、比劫',ji:'财星破印、食伤泄印'},
  '偏印格':{xi:'财星、比劫',ji:'食神、枭神夺食'},
  '食神格':{xi:'财星、食神生财',ji:'偏印夺食'},
  '伤官格':{xi:'财星、印星',ji:'正官、伤官见官'},
  '正财格':{xi:'食伤生财、官杀护财',ji:'比劫夺财'},
  '偏财格':{xi:'食伤、官杀',ji:'比劫分财'},
  '比肩格':{xi:'财官食伤',ji:'比劫争财'},
  '劫财格':{xi:'官杀制劫、食伤',ji:'重比劫、夺财'},
  '建禄格':{xi:'财官食伤',ji:'比劫争财、无财官则孤'},
  '羊刃格':{xi:'官杀制刃、食伤泄秀',ji:'刑冲重刃、无制则凶'}
};
const BZ_QUOTE = {
  strong:'《滴天髓·体用》云：“旺则宜泄宜伤，强者抑之。”身强宜克、泄、耗以达中和。',
  weak:'《滴天髓·体用》云：“弱者益之，衰者助之。”身弱宜生、扶以培其根。',
  tiao:'《穷通宝鉴·序》（余春台辑）重调候：“天道有寒暖，地道有燥湿，调候为急。”',
  ge:'《子平真诠·论用神》云：“八字用神，专求月令。”格局以月令本气为体。',
  tong:'《滴天髓·通关》云：“关内有织女，关外有牛郎，此关若通也，相将上天堂。”两行相战，取通关为用。',
  geYuanhai:'《渊海子平·继善篇》云：格局专取月令，月令为用神之府；提纲得用，方成贵格。',
  geSanming:'《三命通会·看命口诀》云：看命先取提纲（月令），次审日主，次观财官；提纲有用，命局乃立。',
  geShenfeng:'《神峰通考·病药》云：命贵中和，偏盛偏衰皆为病；去其所偏、补其所缺，是为用药。',
  geYujing:'《玉井奥诀》云：月令提纲乃命之枢，格清局正，福基乃固。',
  geXingping:'《星平会海》云：论命以月令为经、日干为纬，经纬相得，格局乃成。'
};
// 出处说明：所引为各典籍通行要旨（章句以原典为准，版本多有异文，此处取义理大意），重在明理、不作定论。
const BZ_QUOTE_NOTE='以上为各典籍通行要旨（章句以原典为准：版本多有异文，此处取义理大意），命理古籍重在明理，引文仅供参证、不作定论。';
/* ---------- 调候具体干支取法（《穷通宝鉴》四时取用）常量 ---------- */
// 按月令给出调候优先天干序列：先调候之急，后辅根、疏土。冬用丙(太阳)暖，夏用壬(江河)润，春秋酌情。
const TIAOHOU_GAN = {
  '寅':['丙','甲','癸'], '卯':['丙','癸','甲'], '辰':['丙','甲','庚'],
  '巳':['壬','癸','庚'], '午':['壬','癸','庚'], '未':['壬','癸','甲','庚'],
  '申':['壬','癸','甲'], '酉':['壬','癸'],       '戌':['壬','癸','甲'],
  '亥':['丙','丁','甲'], '子':['丙','丁'],       '丑':['丙','甲','庚']
};

/* 局势修正（结构战和轴）：地支合冲会刑的简化量化，仅用于旺衰分析的结构参看，不计入身强、身弱档位。
   权重为经验值，随柱位远近衰减（紧贴 full / 隔 0.5 / 遥 0.25）。三合、三会取成局方，六合取融合，六冲、刑/害取战损。 */
function juShi(zhis){
  const Z=zhis; let s=0; const lines=[];
  const wAdj=(d,full)=> d===1?full : d===2?full*0.5 : full*0.25;
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    if(DIZHI_CHONG.some(([a,b])=>(Z[i]===a&&Z[j]===b)||(Z[i]===b&&Z[j]===a))){
      const v=-wAdj(Math.abs(i-j),0.8); s+=v; lines.push(`支${Z[i]}${Z[j]}六冲（冲战离散） ${v.toFixed(1)}`);
    }
    if(LIUHE[Z[i]]===Z[j]){ const v=wAdj(Math.abs(i-j),0.4); s+=v; lines.push(`支${Z[i]}${Z[j]}六合（融合） +${v.toFixed(1)}`); }
    if(Z[i]!==Z[j] && zhiRelTypes(Z[i],Z[j]).includes('刑')){ const v=-wAdj(Math.abs(i-j),0.3); s+=v; lines.push(`支${Z[i]}${Z[j]}相刑（内耗） ${v.toFixed(1)}`); }
    DIZHI_HAI.forEach(([a,b])=>{ if((Z[i]===a&&Z[j]===b)||(Z[i]===b&&Z[j]===a)){ const v=-wAdj(Math.abs(i-j),0.1); s+=v; lines.push(`支${Z[i]}${Z[j]}相害（暗损） ${v.toFixed(1)}`); } });
  }
  [['申','子','辰'],['亥','卯','未'],['寅','午','戌'],['巳','酉','丑']].forEach(g=>{
    const hit=g.filter(z=>Z.includes(z)).length;
    if(hit>=3){ s+=1.0; lines.push(`${g.join('')}三合局（聚会成势） +1.0`); }
    else if(hit===2){ s+=0.4; lines.push(`${g.join('')}三合见二（半合待成） +0.4`); }
  });
  DIZHI_SANHUI.forEach(g=>{ const three=g.slice(0,3); if(three.every(z=>Z.includes(z))){ s+=1.2; lines.push(`${three.join('')}三会${g[3]}局（一方之气） +1.2`); } });
  [...new Set(Z)].forEach(z=>{ if(zhiRelTypes(z,z).includes('刑') && Z.filter(x=>x===z).length>=2){ s-=0.3; lines.push(`支${z}自刑（重复内耗） −0.3`); } });
  return {score:s, lines};
}

function baziAnalysis(BZ){
  const dg=BZ.dayGan, dwx=GAN_WX[dg];
  const gans=BZ.gans, zhis=BZ.zhis, mz=BZ.monthZ;
  const cnt=wxCount(gans,zhis);
  const mBen=(HIDE[mz]&&HIDE[mz][0])||mz; const mbWx=GAN_WX[mBen];
  // 旺衰评分：显式拆为得令，得地，得势 三因子，合计即 score；
  // 得势按天干五行的生克耗泄计分：印比助身为正，官杀食伤财透干为负（明面力量须计消耗）；
  // 另列局势为地支合冲会刑的结构战和轴，不计入身强、身弱档位（旺衰与战和为两轴，参看不混）。
  let score=0; const basis=[]; const sub={ling:0,di:0,shi:0};
  const mLabel=`月令${mz}本气${mbWx}`;
  if(mbWx===dwx){ sub.ling+=4; basis.push(`${mLabel}与日主同气得根  得令 +4`); }
  else if(WX_SHENG[mbWx]===dwx){ sub.ling+=3; basis.push(`${mLabel}生扶日主  得令 +3`); }
  else if(WX_SHENG[dwx]===mbWx){ sub.ling+=1; basis.push(`日主生${mbWx}（月令），我生为泄  得令 +1`); }
  else if(WX_KE[mbWx]===dwx){ sub.ling-=1; basis.push(`月令${mbWx}克日主  得令 −1`); }
  else if(WX_KE[dwx]===mbWx){ sub.ling-=2; basis.push(`日主克月令${mbWx}，我克为耗  得令 −2`); }
  zhis.forEach((z,i)=>{(HIDE[z]||[]).forEach(h=>{
    if(i===1) return;   // 月支由得令覆盖，藏干不再重复计得地，避免月支双计
    const hw=GAN_WX[h];
    if(hw===dwx){ sub.di+=1.2; basis.push(`地支${z}藏干${h}（${hw}）助日主  得地 +1.2`); }
    else if(WX_SHENG[hw]===dwx){ sub.di+=1; basis.push(`地支${z}藏干${h}（${hw}）生日主  得地 +1`); }
  });});
  gans.forEach((g,i)=>{ if(i===2) return;   // 跳过日干位置；年/月/时干中与日干同字之比劫须计分
    const gw=GAN_WX[g];
    if(WX_SHENG[gw]===dwx){ sub.shi+=1.5; basis.push(`天干${g}（${gw}）生日主  得势 +1.5`); }
    else if(gw===dwx){ sub.shi+=1; basis.push(`天干${g}（${dwx}）助日主  得势 +1`); }
    else if(WX_KE[gw]===dwx){ sub.shi-=0.8; basis.push(`天干${g}（${gw}）克日主  得势 −0.8`); }
    else if(WX_SHENG[dwx]===gw){ sub.shi-=0.6; basis.push(`天干${g}（${gw}）泄日主  得势 −0.6`); }
    else if(WX_KE[dwx]===gw){ sub.shi-=0.6; basis.push(`天干${g}（${gw}）耗日主  得势 −0.6`); }
  });
  // 禄(临官)/刃(帝旺)根：日主最旺之根，须显式加权（子平强根，权重大于藏干同气）。
  // 柱位权重：自坐(日支)最重、时支次之、年支再次；月支已由得令覆盖，且得地不计月支藏干，禄刃仅查年/日/时三支。
  const LU={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  const REN={甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'};
  const luZ=LU[dg], renZ=REN[dg];
  // 专业序：帝旺(羊刃)为极致之强，临官(禄)为稳固之强，故同柱位下 刃 > 禄；
  // 同时保留“自坐(日支)最重”的柱位权重（自坐禄、刃皆是极强之根），使丙午(日禄+时刃)仍归中和偏强不破阈。
  const luRenW={2:{lu:3.6,ren:4.0}, 3:{lu:3.1,ren:3.5}, 0:{lu:2.4,ren:2.7}};
  [0,2,3].forEach(i=>{
    const z=zhis[i]; if(!luZ) return; const w=luRenW[i];
    if(z===luZ){ sub.di+=w.lu; basis.push(`地支${z}为日主${dg}之禄（临官、稳固之强根）  得地 +${w.lu}`); }
    else if(z===renZ){ sub.di+=w.ren; basis.push(`地支${z}为日主${dg}之刃（帝旺、极致之强根）  得地 +${w.ren}`); }
  });
  // 长生(生源)根：十二长生“长生”位，力量次之。阳干长生（甲亥、丙寅、庚巳、壬申）为有力之根，
  // 阴干长生（乙午、丁酉、辛子、癸卯）为次等根。阳干长生按“有力之根”加权、阴干长生按“次等根”加权；
  // 柱位仍自坐最重、时支次、年支再次；月支由得令覆盖。
  const csZ = CS_START[dg];
  if(csZ){
    const csW = {2:{y:2.2,n:1.4}, 3:{y:1.6,n:1.0}, 0:{y:1.3,n:0.8}};
    [0,2,3].forEach(i=>{
      const z=zhis[i]; const w=csW[i]; const yang=YANG.indexOf(dg)>=0;
      if(z===csZ){ const add=yang?w.y:w.n; sub.di+=add; basis.push(`地支${z}为日主${dg}之长生根（${yang?'阳干有力之根':'阴干次等根'}）  得地 +${add}`); }
    });
  }
  score = sub.ling + sub.di + sub.shi;   // 三因子显式求和 ≡ 原经验值 score，档位 3/6/9 不变
  // 局势（结构战和轴）：地支合冲会刑量化，仅作旺衰分析的结构参看
  const ju = juShi(zhis);
  const juScore = ju.score;
  const strength = score>=9?'身强': score>=6?'中和偏强': score>=3?'中和偏弱':'身弱';
  const strong = strength.indexOf('强')>=0, weak = strength.indexOf('弱')>=0;
  const strengthRule='≥9 身强、≥6 中和偏强、≥3 中和偏弱、<3 身弱';
  /* 旺衰阈值敏感性：score = 得令+得地+得势（权重为经验值），3/6/9 三档为经验阈值，
     非绝对界线，±1 分左右即可能跨档；局势为结构战和轴，不计入档位，须与旺衰并参。
     实际强弱须结合根气、合化、透干、寒暖燥湿综合判断，本判定仅供初步参考。 */
  const strengthNote='旺衰以得令，得地，得势 三因子简化计分（权重为经验值）判定：得令看月令、得地看地支藏干根气、得势看天干比劫印之助与官杀食伤财之耗（透干克泄耗计负分）；3、6、9 三档为经验阈值，±1 分左右即可能跨档。另列局势为地支合冲会刑的结构战和轴：冲战伤根则根基动荡、合局会方则气机凝聚，不计入身强、身弱档位，但须与旺衰一并参看。实际强弱须综合寒暖燥湿、透干、合化判断，本结论仅供初步参考，不可执一。';
  // 喜忌五行集合（扶抑 / 调候 / 通关 / 病药 / 结构 共用）
  const xiCats = weak ? ['印星','比劫'] : ['官杀','食伤','财星'];
  const jiCats = weak ? ['官杀','食伤','财星'] : ['印星','比劫'];
  const catToWx=cat=>{
    if(cat==='比劫') return dwx;
    if(cat==='印星'){ for(const w in WX_SHENG) if(WX_SHENG[w]===dwx) return w; return null; }
    if(cat==='食伤') return WX_SHENG[dwx];
    if(cat==='财星') return WX_KE[dwx];
    if(cat==='官杀'){ for(const w in WX_KE) if(WX_KE[w]===dwx) return w; return null; }
    return null;
  };
  const xiWxSet=new Set(xiCats.map(catToWx).filter(Boolean));
  const jiWxSet=new Set(jiCats.map(catToWx).filter(Boolean));
  const xiWx=[...xiWxSet], jiWx=[...jiWxSet];
  // 扶抑，三得（得令 / 得地 / 得势）分解：解释“为何强 / 弱”
  const deLing = (mbWx===dwx) || (WX_SHENG[mbWx]===dwx);                       // 月令同气或生扶日主
  const rootN = BZ.zhis.filter(z=>(HIDE[z]||[]).includes(dg)).length;          // 日主之根（地支藏日主本干）
  const yinRootN = BZ.zhis.filter(z=>((HIDE[z]||[]).some(h=>WX_SHENG[GAN_WX[h]]===dwx))).length; // 印星根
  const luRenN = [0,2,3].filter(i=>zhis[i]===luZ||zhis[i]===renZ).length;      // 禄(临官)/刃(帝旺)强根数
  const biGanN = gans.filter((g,i)=>i!==2 && GAN_WX[g]===dwx).length;           // 比劫天干（含同字比劫）
  const yinGanN = gans.filter(g=>WX_SHENG[GAN_WX[g]]===dwx).length;            // 印星天干
  const deDi = rootN+yinRootN+luRenN, deShi = biGanN+yinGanN;
  const sanDe={ling:deLing, di:deDi, shi:deShi};
  let fu;
  // 顶层设计（第三刀）：扶抑用神直接编译结构化（xiCats/jiCats 类名、xiWx/jiWx 五行），零字符串解析；
  // xi/ji 保留原文案（含"（生）（扶）"作用注）供页面展示
  if(strong) fu={xi:['官杀（克）','食伤（泄）','财星（耗）'], ji:['印星（生）','比劫（扶）'],
    xiCats:['官杀','食伤','财星'], jiCats:['印星','比劫'],
    xiWx:[keWxOfC(dwx), WX_SHENG[dwx], WX_KE[dwx]], jiWx:[shengWxOfC(dwx), dwx]};
  else if(weak) fu={xi:['印星（生）','比劫（扶）'], ji:['官杀（克）','食伤（泄）','财星（耗）'],
    xiCats:['印星','比劫'], jiCats:['官杀','食伤','财星'],
    xiWx:[shengWxOfC(dwx), dwx], jiWx:[keWxOfC(dwx), WX_SHENG[dwx], WX_KE[dwx]]};
  else fu={xi:['身平则扶抑不拘，以调候、通关为急'], ji:['视岁运而定'], xiCats:[], jiCats:[], xiWx:[], jiWx:[]};
  const SEASON={'寅':'春','卯':'春','辰':'春','巳':'夏','午':'夏','未':'夏','申':'秋','酉':'秋','戌':'秋','亥':'冬','子':'冬','丑':'冬'};
  const s=SEASON[mz];
  let tiao;
  if(s==='冬') tiao={wx:'火',gan:['丙','丁'],d:'冬月严寒，水寒金冷，非丙火不温。'};
  else if(s==='夏') tiao={wx:'水',gan:['壬','癸'],d:'夏月燥热，火炎土燥，非壬水不润。'};
  else if(s==='秋') tiao={wx:'水',gan:['壬','癸'],d:'秋月金旺燥气，喜壬水润局、湿土（丑辰）助润。'};
  else tiao={wx:'火',gan:['丙','丁'],d:'春月木旺，初春（寅）犹寒、暮春（辰）湿，喜丙火暖局。'};
  // 调候深化：由全局水火(寒暖)与燥湿土判定程度，而非仅看季节
  // 寒暖以月令季节为纲（夏月偏热、冬月偏寒），水火个数只做修正，午月天干多水不得判"寒"
  const _sHot=(s==='夏')?2:(s==='冬')?-2:0;   // 夏月火势占优、冬月火势受抑
  const _sCold=(s==='冬')?2:(s==='夏')?-2:0;
  const cold=(cnt['水']||0)+_sCold, hot=(cnt['火']||0)+_sHot;
  const wetLand=BZ.zhis.filter(z=>isWetEarth(z)).length, dryLand=BZ.zhis.filter(z=>isDryEarth(z)).length;
  // 燥湿须以月令季节为纲（春冬湿润、夏秋偏燥），仅数燥湿土会误判
  const _sMoist=(s==='春'||s==='冬')?1:0, _sDry=(s==='夏'||s==='秋')?1:0;
  const wetN=wetLand+_sMoist, dryN=dryLand+_sDry;
  let grade;
  if(cold>=hot+2) grade='寒（水冷金寒，需火暖）';
  else if(hot>=cold+2) grade='燥热（火炎土燥，需水润）';
  else if(wetN>dryN) grade='偏湿（湿土多，宜燥土、火助）';
  else if(dryN>wetN) grade='偏燥（燥土多，宜水润）';
  else grade='寒暖燥湿尚均';
  const tTou=gans.some(g=>tiao.gan.includes(g)), tRoot=BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>tiao.gan.includes(h)));
  const tPower=(tTou&&tRoot)?'强（透干得根）':(tTou||tRoot)?'有（有气）':'弱（虚浮无根）';
  const tWx=tiao.wx;
  let tConflict;
  if(jiWxSet.has(tWx)) tConflict='⚠调候用神“'+tWx+'”恰为日主忌神，调候与扶抑相左，宜借岁运扶调候或通关化解，不可执一。';
  else if(xiWxSet.has(tWx)) tConflict='调候用神即日主喜用，一物两用，最为得力。';
  else tConflict='调候与扶抑无直接冲突，可并行。';
  tiao.grade=grade; tiao.power=tPower; tiao.conflict=tConflict;
  // 调候具体干支取法（按月令优先序列，《穷通宝鉴》风格）+ 真假调候
  const TH = TIAOHOU_GAN[mz] || tiao.gan;
  const thTou = TH.some(g=>gans.includes(g));
  const thRoot = BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>TH.includes(h)));
  tiao.zhiGan = TH;
  tiao.zhen = (thTou||thRoot) ? '真（透干得根、得力）' : '假（虚浮无根，须岁运引出方验）';
  const thTouArr=TH.filter(g=>gans.includes(g));
  const thRootArr=TH.filter(g=>BZ.zhis.some(z=>(HIDE[z]||[]).includes(g)));
  tiao.d = `《穷通宝鉴》${SEASON[mz]}生（${mz}月）调候，宜用 ${TH.join('、')}（${thTouArr.length?thTouArr.join('')+'已透干':thRootArr.length?thRootArr.join('')+'藏支得根':'原局未现，待岁运'}）。`;
  // 通关深化：扫描任意两行相战（含单边），优先喜用通关，判定通关用神力量
  let tong=null;
  const wars=[];
  ['木','火','土','金','水'].forEach(a=>{ const b=WX_KE[a]; if((cnt[a]||0)>=1 && (cnt[b]||0)>=1) wars.push({a,b,ma:cnt[a],mb:cnt[b]}); });
  if(wars.length){
    wars.sort((x,y)=>{
      const mx=WX_SHENG[x.a], my=WX_SHENG[y.a];
      const sx=xiWxSet.has(mx)?1:0, sy=xiWxSet.has(my)?1:0;
      if(sx!==sy) return sy-sx;                 // 优先通关落在喜用者
      return (y.ma+y.mb)-(x.ma+x.mb);           // 其次选战得最凶者
    });
    const w=wars[0]; const mid=WX_SHENG[w.a];
    const mGans=GAN_OF_WX[mid];
    const mTou=gans.some(g=>mGans.includes(g)), mRoot=BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>mGans.includes(h)));
    const mPower=(mTou&&mRoot)?'强（透干得根）':(mTou||mRoot)?'有（有气）':'弱（需岁运助）';
    const mTend=jiWxSet.has(mid)?'但此通关恰为日主忌神，宜慎用或借岁运扶之':'且其五行正合日主喜用，一通百和';
    tong={wx:mid,gan:GAN_OF_WX[mid],war:`${w.a}（${w.ma}）克${w.b}（${w.mb}）`,power:mPower,
      note:`${w.a}（${w.ma}）克${w.b}（${w.mb}）相战，取“${mid}”通关（${GAN_OF_WX[mid].join('')}）；通关用神${mPower}，${mTend}。`};
    if(wars.length>1) tong.note+=`（另有相战：${wars.slice(1).map(x=>x.a+'克'+x.b).join('、')}）`;
    // 真假通关：通关用神本身是否被其忌神所克
    const keMid = Object.keys(WX_KE).find(w=>WX_KE[w]===mid);   // 克 mid 之五行
    const midAttacked = keMid && (cnt[keMid]||0)>0;
    tong.zhen = midAttacked ? ('假（通关用神“'+mid+'”被'+keMid+'克，须先制'+keMid+'方得通）') : '真（通关得力）';
    // 连环相战化解顺序：按凶度排序，共用通关者一举两得
    tong.order = wars.map(w2=>{ const m=WX_SHENG[w2.a]; return {war:`${w2.a}克${w2.b}（${w2.ma}、${w2.mb}）`, mediator:m, sameAsPrimary:(m===mid)}; });
  }
  let geName, geGan;
  if(mz===LU_OF[dg]) geName='建禄格';
  else if(mz===REN_OF[dg]) geName='羊刃格';
  else {
    // 取格以月令本气为体（本气优先）：立格之名恒取月令本气之十神；
    // 透干与否只影响格局之“清浊、层次”，不改变立格之名（参《子平真诠》月令为用神所出）。
    const mHide=HIDE[mz]||[mz];
    geGan=mHide[0];
    geName=tenGod(dg,geGan)+'格';
  }
  let geUse=GE_USE[geName]||{xi:'依格局而定',ji:'依格局而定'};
  // 身强身弱属“状态”而非“用神条目”，原写死进格局用神表（如偏财格 ji 恒带“身弱”），会使所有该格盘不论强弱都显示同一句身弱、身强，不能适应所有八字。
  // 格局用神只表格局本身的十神、五行喜忌；身弱由本处按实际强弱动态叠加（身强则不显示身弱）。外格在下面会重建 geUse，此处叠加不生效。
  if(weak && geUse.xi && geUse.xi.indexOf('身弱')<0){
    geUse={xi: geUse.xi+'（身弱，用神之外须兼用印比扶身，方堪任财官）', ji: geUse.ji};
  }
  // 外格识别（特殊格局）：从格 / 专旺 / 两气成象
  const wxSet2=new Set();
  gans.forEach(g=>wxSet2.add(GAN_WX[g]));
  zhis.forEach(z=>(HIDE[z]||[z]).forEach(h=>wxSet2.add(GAN_WX[h])));
  const wxDistinct=[...wxSet2];
  // 专旺看“异类（克我、我克、我生，即克泄耗）”是否近无；从格看“印比”是否仅日主自身
  const shengWo=(()=>{ for(const w in WX_SHENG) if(WX_SHENG[w]===dwx) return w; return null; })(); // 生我（印）
  const keWo=(()=>{ for(const w in WX_KE) if(WX_KE[w]===dwx) return w; return null; })();          // 克我（官杀）
  const woKe=WX_KE[dwx];   // 我克（财）
  const woSheng=WX_SHENG[dwx]; // 我生（食伤）
  const yiTotal=(cnt[keWo]||0)+(cnt[woKe]||0)+(cnt[woSheng]||0); // 异类（克泄耗）总量（本气口径）
  const yinBiTotal=(cnt[dwx]||0)+(cnt[shengWo]||0);               // 印比总量（含日主，本气口径）
  // 含藏干印比总量（从格展示用：本气口径印比仅日主，但藏干仍有微弱印比之气时须说明，避免与旺衰“得地”行打架）
  const cntAll=wxCountAll(gans,zhis);
  const yinBiAll=(cntAll[dwx]||0)+(cntAll[shengWo]||0);
  const congC = yiTotal>0 ? (yinBiTotal/yiTotal) : (yinBiTotal>0?999:0);  // 同党(印比)/异党(克泄耗) 比值，从格交叉验证
  let geOuter=null, geOuterNote='', geOuterDoubt='';
  // 化气格（天干五合）：日主参与五合、对方天干相见、且化神当令（月令本气=化神）则化气成格。
  // 此格以合化立局，与专旺、从/两气判法不同，须先于彼等判定，避免被误归普通格或外格。
  let huaShen=null, geHuaQi=null;
  const WUHE=[['甲','己','土'],['乙','庚','金'],['丙','辛','水'],['丁','壬','木'],['戊','癸','火']];
  const huaPair=WUHE.find(p=>p[0]===dg||p[1]===dg);
  if(huaPair){
    const other=huaPair[0]===dg?huaPair[1]:huaPair[0];
    huaShen=huaPair[2];
    if(gans.includes(other) && mbWx===huaShen){
      geHuaQi=huaShen+'化气格';
      geOuter=geHuaQi;
      geOuterNote='日主'+dg+'与'+other+'天干五合（'+huaPair[0]+huaPair[1]+'合化'+huaShen+'），化神'+huaShen+'当令（月令'+mz+'本气'+mbWx+'），化气格成立。喜行化神旺地、顺其化气，忌原局印比扶身破化、克化神者损化。';
    }
  }
  if(!geOuter){
    // ==== 变格细判：专旺/从旺/从强三格（判据据《滴天髓》五格 + 用户典籍资料综合）====
    const _heOf=(wx)=>{ for(const g of DIZHI_SANHE) if(g[3]===wx&&g.slice(0,3).every(z=>zhis.includes(z))) return `${g[0]}${g[1]}${g[2]}三合${wx}局`; for(const g of DIZHI_SANHUI) if(g[3]===wx&&g.slice(0,3).every(z=>zhis.includes(z))) return `${g[0]}${g[1]}${g[2]}三会${wx}局`; return ''; };
    const _dwxHe=_heOf(dwx), _bi=cnt[dwx]||0, _yin=cnt[shengWo]||0, _gu=cnt[keWo]||0, _cai=cnt[woKe]||0, _shi=cnt[woSheng]||0;
    // 三合/三会成局之五行若属克泄耗日主（官杀/财/食伤），旺气被引去、非纯一势，专旺/从旺/从强均不成立
    const _juLeak=(()=>{ if(_gu||_cai||_shi){ for(const g of DIZHI_SANHE){ if([keWo,woKe,woSheng].indexOf(g[3])>=0 && g.slice(0,3).every(z=>zhis.includes(z))) return g[3]; } for(const g of DIZHI_SANHUI){ if([keWo,woKe,woSheng].indexOf(g[3])>=0 && g.slice(0,3).every(z=>zhis.includes(z))) return g[3]; } } return ''; })();
    // 极旺顺势变格总门槛（原"专旺格"门槛：日主极旺、克泄耗近无；三合泄耗局则非纯一势）→ 内部分 专旺/从旺/从强
    if(strong && yiTotal<=1 && !_juLeak){
      // ① 专旺格：日主得令 + 地支三合/三会成日主局 + 官杀不见 → 一字独旺（最纯贵格）
      if(_gu===0 && _dwxHe && mbWx===dwx){
        const zn={'木':'曲直格','火':'炎上格','土':'稼穑格','金':'从革格','水':'润下格'}[dwx]||'专旺格';
        geOuter='专旺格'; geOuterNote='日主'+dg+'得令（月令本气'+dwx+'）、地支'+_dwxHe+'，日主极旺而官杀不见，一气独旺成'+zn+'。喜比劫、印、食伤泄秀；忌官杀（最忌），原局无食伤则忌财。';
      }
      // ② 从旺格：比劫主导（比劫>印）、不见官杀与财
      else if(_bi>_yin){
        geOuter='从旺格'; geOuterNote='满盘比劫（'+_bi+'位）主导、印星'+_yin+'为辅，日主极旺而官杀、财星不见，顺比劫旺势（从旺）。喜比劫、印；忌财星（比劫争财）、官杀；食伤视印轻重（印轻比重可泄秀）。';
      }
      // ③ 从强格：印主导/印比并旺（印≥比劫）、日主不失令
      else {
        geOuter='从强格'; geOuterNote='印星'+shengWo+'主导、印比并旺（'+_yin+'位'+( _yin>=_bi?'≥':'>')+'比劫'+_bi+'），全局无财官食伤杂入（官杀生印虽不忌），日主不失令，顺印比之势（从强）。喜印比；忌财星坏印、食伤抗争。';
      }
    }
    // 从印（极旺之外、日主弱而印旺）：日主极弱无根、无比劫帮身而顺印势
    else if(weak && _yin>=2 && mbWx===shengWo && _yin>_bi && _cai===0 && _shi===0){
      geOuter='从印格'; geOuterNote='日主'+dg+'极弱无根、无比劫帮身，印星'+shengWo+'当令独旺（'+_yin+'位）主导，财克印、食伤泄印俱无，弃身顺从印势（从印）。喜印比；忌财星克印、食伤泄印；官杀生印不忌。';
    }
    else if(weak && yinBiTotal<=1){
      // 从格：日主极弱、印比俱无（仅日主自身）。从神须为实际最旺之异党（克我、我克、我生），
      // 直接按五行分布判定，不依赖 jiWxSet（从格时喜忌可能被清空，若为空会误归从杀）。
      const yiCands=[
        { wx:keWo, name:'从杀格', c:cnt[keWo]||0 },                 // 克我（官杀）
        { wx:WX_KE[dwx], name:'从财格', c:cnt[WX_KE[dwx]]||0 },     // 我克（财）
        { wx:WX_SHENG[dwx], name:'从儿格', c:cnt[WX_SHENG[dwx]]||0 } // 我生（食伤）
      ].sort((a,b)=> b.c-a.c);
      const topC=yiCands[0];
      const cn = topC.c>0 ? topC.name : '从格';   // 无明确异党可從（理论不发生，因 yinBiTotal<=1 必有异党）
      geOuter=cn; geOuterNote='日主极弱、印比俱无（仅日主自身），弃命相从：“'+cn+'”，喜行从神旺地、忌见印比扶身。'
        + ' 同党（印比）'+yinBiTotal+' 位、异党（克泄耗）'+yiTotal+' 位，比值 C≈'+(congC>=999?'∞':congC.toFixed(2))+'，几近弃命，从格成立。'
        + (yinBiAll>yinBiTotal ? '（按本气计印比仅日主；藏干中尚有微弱印比之气，力量单薄不足以扶身，仍以从论）' : '');
    }
    else if(weak && congC<0.25 && yinBiTotal>=2){
      // 比值交叉验证：印比不止一枚但同党远少于异党，几近从弱，留疑待斟酌（不强行从格）
      geOuterDoubt='日主印比虽不止一枚（'+yinBiTotal+' 位），但同党、异党比值 C≈'+congC.toFixed(2)+'(<0.25)，几近从弱之象；实务须斟酌是否真从、抑或仅为身弱待岁运扶起。';
    }
    else if(wxDistinct.length<=2){ geOuter='两气成象'; geOuterNote='全局仅 '+wxDistinct.join('、')+' 两行，两气成象、清纯专凝，喜顺其气、忌杂入他行。'; }
    else if(huaPair && gans.includes(huaPair[0]===dg?huaPair[1]:huaPair[0]) && mbWx!==huaShen){
      // 日主参与五合、对方相见，但化神未当令：合而不化，仅作天干五合论，不构成化气格
      const other=huaPair[0]===dg?huaPair[1]:huaPair[0];
      geOuterDoubt='日主'+dg+'与'+other+'天干五合（'+huaPair[0]+huaPair[1]+'合化'+huaShen+'），然化神'+huaShen+'未当令（月令'+mz+'本气'+mbWx+'），合而不化、化气格不真，仅作天干五合论。';
    }
  }
  if(geOuter) geName=geOuter;
  // 外格杂格识别（ZAGE_DEF 全表，16 式）：正格/变格/杂格三者互斥，只取其一，
  // 变格（专旺/从/两气/化气）优先；无变格且杂格命中时，杂格即为主格（以杂格自身立格、取喜忌），不并列正格。
  // 多格命中：按 pri（成格严格度，越大越贵/越苛刻）降序取主格；命中全部保留进 geZaGeAll 供分段展示。
  const geZaGeAll=[];
  for(const z of ZAGE_DEF){ const hit=z.d?(z.d.indexOf(BZ.gans[2]+BZ.zhis[2])>=0):(z.c&&z.c(BZ)); if(hit) geZaGeAll.push(z); }
  geZaGeAll.sort((a,b)=>(b.pri||0)-(a.pri||0));                 // 按成格严格度降序
  const geZaGe = geZaGeAll.map(z=>z.n);
  const isZaGe = geZaGe.length>0 && !geOuter;
  if(isZaGe){
    const zMain=geZaGeAll[0];   // 多格命中取成格严格度最高者（pri 最大）为主格
    geName=zMain.n; geGan=null; // 杂格不取月令藏干
    geUse={xi:zMain.xi||'依格局而定', ji:zMain.ji||'依格局而定'};
  }
  // 外格取法：专旺、从/两气，不取月令藏干
  if(geOuter==='专旺格'){
    const zwName={'木':'曲直格','火':'炎上格','土':'稼穑格','金':'从革格','水':'润下格'}[dwx]||'专旺格';
    geGan=zwName;                                  // 取代“取格藏干 X”
    const _shi0=(cnt[woSheng]||0)<=0;
    geUse={xi:`${dwx}、${shengWo}（日主一气独旺，顺其势；食伤泄秀亦可）`, ji:`${keWo}（官杀逆克最忌）${_shi0?('、'+woKe+'（原局无食伤则忌财破局）'):''}`};
    // 取格疑问：异类（克泄耗）未绝、仅余微弱 1 位时，专旺格成立但已伏破格之患，须点明取格之疑
    if(yiTotal>0){
      const weak=[];
      if((cnt[keWo]||0)>0) weak.push(keWo+'（官杀）');
      if((cnt[woKe]||0)>0) weak.push(woKe+'（财）');
      if((cnt[woSheng]||0)>0) weak.push(woSheng+'（食伤）');
      geOuterDoubt='然本局异类（克、泄、耗）仅 '+yiTotal+' 位且微弱：'+weak.join('、')+'，专旺格虽立却非绝对纯粹，岁运逢其旺地（扶起官杀、财、食伤或逆克专旺）则专旺破，转为身强普通格。取格宜留此一问，实务仍当斟酌。';
    }
  } else if(geOuter==='从旺格'){
    // 从旺：顺比劫旺势。喜比劫、印；忌财（比劫争财）、官杀（逆旺）；食伤视印轻重（印重忌抗争、印轻比重可泄秀）
    geGan=null;
    const _yinN=cnt[shengWo]||0;
    const _shiNote=(cnt[woSheng]||0)>0 ? (_yinN>=2?woSheng+'（印重忌食伤抗争）':woSheng+'（印轻比重，食伤可泄秀，不忌）') : '';
    geUse={xi:`${dwx}、${shengWo}（顺比劫旺势）`, ji:`${woKe}（比劫争财）、${keWo}（官杀逆旺）${_shiNote?('、'+_shiNote):''}`};
  } else if(geOuter==='从印格'||geOuter==='从强格'){
    // 从印/从强：顺印比之势，非弃命从异党。喜印比助势，忌财克印、食伤与印抗争；官杀生印不忌
    geGan=null;
    geUse={xi:`${shengWo}、${dwx}（顺印比之势）`, ji:`${woKe}（财克印）、${woSheng}（食伤与印争）`};
  } else if(geOuter && geOuter.indexOf('从')===0){
    let cm=null,cc=-1; jiWxSet.forEach(w=>{ const c=cnt[w]||0; if(c>cc){cc=c;cm=w;} });
    const shengCm=(()=>{ for(const w in WX_SHENG) if(WX_SHENG[w]===cm) return w; return null; })();
    geGan=null;                                    // 从格无“月令藏干”取法
    // 用神优先：从儿格 shengCm 恰为日主原气(dwx)时，忌中的 dwx 与喜重叠，剔除并同步说明词（如甲日主从儿火，木在喜=生食伤之源，又岂能复列为忌）
    const xiArrFrom=[cm, shengCm].filter(Boolean);
    const jiArrFrom=[dwx, shengWo].filter(Boolean);
    const xiSetFrom=new Set(xiArrFrom);
    const jiCleanFrom=jiArrFrom.filter(w=>!xiSetFrom.has(w));
    const jiNoteFrom=(jiCleanFrom.length===jiArrFrom.length)?'（印比扶身则破从）':(jiCleanFrom.length?'（印扶身则破从）':'');
    geUse={xi:xiArrFrom.join('、')+'（从神旺地）', ji:jiCleanFrom.join('、')+jiNoteFrom};
  } else if(geOuter==='两气成象'){
    geGan=null;
    const two=wxDistinct.join('、'), other=['木','火','土','金','水'].filter(w=>!wxDistinct.includes(w)).join('、');
    geUse={xi:`${two}（两气专凝，顺其气）`, ji:`${other}（杂入他行则破）`};
  } else if(geOuter && geOuter.indexOf('化气')>=0){
    // 化气格用神：化神旺地（化神本身及其生源）恒为喜。
    // 忌分两种：日主被化去(dwx≠化神)时，印比扶身则破化，故日主原气+印星+克化神者为忌；
    //          日主即化神(dwx=化神，如庚日乙庚化金)时，印比本是化神同类、反助化，仅克化神者为忌。
    const shengHua=(()=>{ for(const w in WX_SHENG) if(WX_SHENG[w]===huaShen) return w; return null; })();
    const keHua=(()=>{ for(const w in WX_KE) if(WX_KE[w]===huaShen) return w; return null; })();
    const xieHua=WX_SHENG[huaShen]||null;  /* 泄化神者（化神所生），泄化神则损化 → 忌 */
    const keShengHua=shengHua?(()=>{ for(const w in WX_KE) if(WX_KE[w]===shengHua) return w; return null; })():null; /* 克生源者，损化神生源 → 忌 */
    const uniq=a=>{ const s=new Set(); return a.filter(x=>{ if(s.has(x)) return false; s.add(x); return true; }); };
    const xiArr=uniq([huaShen, shengHua].filter(Boolean));
    const selfHua=(dwx===huaShen); // 日主即化神：庚日乙庚化金、戊日戊癸化火、甲日甲己化土、壬日丁壬化木、丙日丙辛化水
    const jiArrRaw=selfHua ? uniq([keHua, xieHua, keShengHua].filter(Boolean))
                           : uniq([dwx, shengWo, keHua, xieHua, keShengHua].filter(Boolean));
    // 用神优先：非 selfHua 且印星=化神时（丁壬化木，丁日主、戊癸化火，戊日主），shengWo 恰在喜中，剔除并同步说明词，防"喜火又忌火"
    const xiSet2=new Set(xiArr);
    const jiArr2=jiArrRaw.filter(w=>!xiSet2.has(w));
    let jiNote2=selfHua?'（克化神者损化）':'（印比扶身破化、克化神者损化）';
    if(!selfHua && jiArr2.length!==jiArrRaw.length){
      const parts=[];
      if(jiArr2.includes(dwx)) parts.push('比劫扶身则破化');
      if(jiArr2.includes(keHua)) parts.push('克化神者损化');
      jiNote2=parts.length?('（'+parts.join('、')+'）'):'';
    }
    geGan=null;
    geUse={xi:xiArr.join('、')+'（化神旺地，顺其化气）',
           ji:jiArr2.join('、')+jiNote2};
  }
  // 全命中格局并列展示（geUse 已全部设置完）：变格用其 geUse.xi/ji、外格杂格用 z.xi/z.ji，每个都列出喜忌（数据多样性）。
  // 主格（喜忌之依）恒为排最前者：变格命中→变格为主；仅杂格→pri 最高者为主。其他模块只读主格 geName/geUse，保证唯一性。
  const geAllDisplay=[];
  if(geOuter){ geAllDisplay.push({tag:'变格', name:geOuter, note:geOuterNote||'', xg:'喜 '+geUse.xi+'；忌 '+geUse.ji, main:true, pri:900}); }
  geZaGeAll.forEach((z,i)=>{ geAllDisplay.push({tag:'外格', name:z.n, note:z.note+(z.yun?' 运向：'+z.yun:''), xg:(z.xi?('喜 '+z.xi+'；忌 '+z.ji):''), main:(!geOuter&&i===0), pri:(z.pri||0)}); });
  geAllDisplay.sort((a,b)=>b.pri-a.pri);
  // 单格不标序号直接输出；多格"以下格局供参考"并按序分段（每条以句号收尾）
  const _onePt=r=>{ const s=r.name+'【'+(r.main?'主':'次')+r.tag+'】'+r.note+(r.xg?('；'+r.xg):''); return s.replace(/[。；\s]+$/,'')+'。'; };
  const geZaGeNote = geAllDisplay.length ? (geAllDisplay.length===1 ? ('所应格局：'+_onePt(geAllDisplay[0])) : ('所应格局：以下格局供参考。'+geAllDisplay.map((r,i)=>'<br>'+(i+1)+'. '+_onePt(r)).join(''))) : '';
  // 顶层设计：用途句在此编译一次为结构化（十神类集 xiCats/jiCats + 五行集 xiWx/jiWx），
  // 编译点位于 geUse 全部赋值完成后，消费方只读编译产物字段，不解析句子文本
  // 杂格主格：xi/ji 为杂格本格喜忌（五行字直接取，十神类按日主映射，如魁罡"印星、比劫"跨日主亦成立）
  const _zageWx=(s)=>{ const set=new Set(); String(s||'').replace(/[（(][^）)]*[）)]/g,'').split(/[、,，，]/).forEach(t=>{ const x=t.trim(); if('木火土金水'.indexOf(x)>=0) set.add(x); else if(/印|枭/.test(x)) set.add(shengWxOfC(dwx)); else if(/比|劫|刃/.test(x)) set.add(dwx); else if(/食|伤/.test(x)) set.add(WX_SHENG[dwx]); else if(/财/.test(x)) set.add(WX_KE[dwx]); else if(/官|杀/.test(x)) set.add(keWxOfC(dwx)); }); return Array.from(set); };
  const _gxiWx = isZaGe ? _zageWx(geUse.xi) : structWxOf(extractCats(geUse.xi), geUse.xi, dwx, !!geOuter);
  // 冲突消解：同五行既在喜又在忌（如正官格"官为用神"喜官杀，忌句又含"官杀混杂"），
  // 用神五行优先，忌五行剔除，避免喜忌同五行自相矛盾
  const _gjiWx = (isZaGe ? _zageWx(geUse.ji) : structWxOf(extractCats(geUse.ji), geUse.ji, dwx, !!geOuter)).filter(w=>_gxiWx.indexOf(w)<0);
  geUse={ ...geUse,
    xiCats: extractCats(geUse.xi), jiCats: extractCats(geUse.ji),
    xiWx: _gxiWx, jiWx: _gjiWx };
  // 格局清浊（喜用透干得根则清、成；外格另论；杂格以本格喜用判，不依扶抑集）
  const _judgeWx = isZaGe ? (geUse.xiWx||[]) : xiWx;
  const xiGans=_judgeWx.flatMap(w=>GAN_OF_WX[w]);
  const xiTou=gans.some(g=>xiGans.includes(g));
  const xiRoot=BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>xiGans.includes(h)));
  let geQing = geOuter ? (geOuter==='从格'||geOuter.indexOf('从')===0?'从神旺则清（弃命相从，从神即用）':'清纯（特殊格局，一气专凝）')
                       : (xiTou&&xiRoot)?'清（喜用透干得根，格局成立）':(xiTou||xiRoot)?'半清（喜用有一气）':'浊（喜用虚浮，待岁运引出）';
  // 格局层次：成格 / 变格 / 破格（正格按用神透干得根判定；外格另论）
  let geLevel, geLevelNote;
  if(geOuter){
    geLevel='成格（特殊格）';
    geLevelNote='专旺、从、两气、化气等外格，一气专凝或化气成形，格局成立；破格之患在岁运逆其势（专旺逢逆克、化气格逢印比扶身或克化神）';
  } else {
    // 用神五行：直接读编译好的 geUse.xiWx（结构化，不再解析句子文本）
    const _useWx=new Set(geUse.xiWx||[]);
    const guWx=_useWx;
    const guGans=[...guWx].flatMap(w=>GAN_OF_WX[w]);
    const guTou=gans.some(g=>guGans.includes(g));
    const guRoot=BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>guGans.includes(h)));
    const guFails=!guTou && !guRoot;   // 用神彻底虚浮（不透干且不得根）
    // 破格判定：用神虚浮，且存在专破此格之力（克用神之五行成势 / 用神根被冲 / 财格比劫夺财）。
    // 关键：破格之力不得是用神本身（避免把“用神成势”误判为破格）。
    const breakWx=new Set();
    [...guWx].forEach(w=>{ const ke=Object.keys(WX_KE).find(k=>WX_KE[k]===w); if(ke && !guWx.has(ke)) breakWx.add(ke); }); // 克用神者
    if(/财/.test(geName) && !isZaGe && !guWx.has(dwx)) breakWx.add(dwx);          // 财格：比劫夺财（杂格不套正格破格特判）
    if(/官杀|正官|七杀/.test(geName) && !isZaGe) breakWx.delete(keWo);            // 官杀乃格局本体，不作文破格力（杂格不套）
    const breakGans=[...breakWx].flatMap(w=>GAN_OF_WX[w]);
    const breakTou=gans.some(g=>breakGans.includes(g));
    const breakRoot=BZ.zhis.some(z=>(HIDE[z]||[]).some(h=>breakGans.includes(h)));
    const poStrong=(breakTou||breakRoot) && [...breakWx].some(w=>(cnt[w]||0)>=2);
    // 用神之根被冲（地支六冲抵消用神根气）
    const guZhiSet=new Set(BZ.zhis.filter(z=>(HIDE[z]||[]).some(h=>guGans.includes(h))));
    const rootChong=guZhiSet.size>0 && BZ.zhis.some(z=>{ const c=DIZHI_CHONG.find(p=>p[0]===z||p[1]===z); const other=c?(c[0]===z?c[1]:c[0]):null; return other && guZhiSet.has(other); });
    const isPo=guFails && (poStrong || rootChong);
    if(guTou&&guRoot){ geLevel='成格（清纯）'; geLevelNote='用神透干得根，格局成立、清纯。'; }
    else if(isPo){ geLevel='破格'; geLevelNote='用神虚浮不上局，且局中'+[...breakWx].map(w=>w+'行').join('、')+(rootChong?'冲克用神之根':'成势专破此格（'+geName+'）')+'，格局被破，宜制化破格之力、借岁运扶用神。'; }
    else if(guTou||guRoot){ geLevel='半成格（用神半透）'; geLevelNote='用神仅得透干或得根其一，格局半成，岁运引出方全。'; }
    else { geLevel='待成格（用神未透）'; geLevelNote='用神未透干不得根，且无明显破格之力，格局待成，须岁运引动。'; }
  }
  // 病药法（日主视角）：《滴天髓》重“偏枯”，核心是全局失衡之根源。
  // 偏枯之“病”= 对日主有害（忌神：克、泄/耗）且数量最多之五行，它正是失衡来源；
  // “药”= 克制该病神之五行，天然落在日主喜用（印、比）一侧，与扶抑法自洽。
  // 若所有忌神皆缺失（无过旺之忌可制），则病在“喜用不足”，药转为补益喜用之五行。
  // 喜忌类别直接由日主强弱推导，避免对中文字面值做脆弱的子串匹配。
  const wxCat=w=>{ const g=GAN_OF_WX[w][0]; return shenCat(tenGod(dg,g)); };
  const restrain = w => { for(const k in WX_KE){ if(WX_KE[k]===w) return k; } return w; }; // 克 w 之五行（药方向）
  const jiEls=['金','土','水','木','火'].filter(w=>jiCats.indexOf(wxCat(w))>=0);   // 忌神（克、泄/耗）
  const xiEls=['木','火','金','土','水'].filter(w=>xiCats.indexOf(wxCat(w))>=0);   // 喜神（生、扶）
  let bingWx=null, bingCnt=-1;
  jiEls.forEach(w=>{ const c=cnt[w]||0; if(c>0 && c>bingCnt){ bingCnt=c; bingWx=w; } }); // 先取过旺忌神为病
  let yaoWx, yaoKind;
  if(bingWx){
    // 病 = 忌神过旺；药 = 克病之五行  天然落在喜用一侧
    yaoWx=restrain(bingWx);
    yaoKind='克病之五行为药，制其过旺之忌';
    if(jiCats.indexOf(wxCat(yaoWx))>=0){ yaoWx=dwx; yaoKind='克病反成忌，转取日主比劫扶身为药'; }
  } else {
    // 忌神皆缺、无过旺：偏枯在“喜用(印比)过盛”，病=喜用中最多者，药=克泄耗以平衡（病药制偏）
    let bingMax=-1; xiEls.forEach(w=>{ const c=cnt[w]||0; if(c>bingMax){ bingMax=c; bingWx=w; } });
    if(bingWx){ yaoWx=restrain(bingWx); yaoKind='忌神皆缺，喜用过盛为病，取克泄耗为药，病药制偏'; }
    else { bingWx=dwx; yaoWx=dwx; yaoKind='五行俱平，无明确偏枯'; }
  }
  const bingYao={bing:bingWx, bingCnt, yao:yaoWx, yaoKind,
    note:`病药法（日主${strength}）：“${bingWx}”（${bingCnt}个）为偏枯之病，乃日主忌神之过旺者；${yaoKind.indexOf('克病反成忌')===0?('转取“'+yaoWx+'”扶身为药'):('取“'+yaoWx+'”制衡为药')}（${yaoKind}）。`};
  // ===== 结构病（干支关系）=====
  // 《滴天髓》《子平真诠》并重“结构失衡”：五行计数之外，干支之冲、刑/害、破/合、三合、三会，
  // 若伤及日主根基 / 用神之根 / 月令，即为“结构之病”；若合住或冲去忌神、三会成用神，则为“结构之药”。
  const CHONG_MAP={}; DIZHI_CHONG.forEach(([a,b])=>{CHONG_MAP[a]=b;CHONG_MAP[b]=a;});
  const zhiCharsOf=t=>ZHI_ORDER.filter(z=>t.indexOf(z)>=0);
  const ganCharsOf=t=>GAN.filter(g=>t.indexOf(g)>=0);
  const vxOf=z=>GAN_WX[(HIDE[z]||[z])[0]];
  const dz=BZ.zhis[2], mz2=BZ.monthZ;
  const rootZhiSet=new Set(BZ.zhis.filter(z=>(HIDE[z]||[]).includes(dg)));   // 含日主本干之支（日主之根）
  // 结构病药用“有效喜忌”：外格（从/专旺/两气/化气）以格局用神五行（geUse.xiWx/jiWx，顺势口径）为准，
  // 普通格以扶抑 xiWxSet/jiWxSet 为准，避免外格盘（如从财格喜火）把喜用之根误判为“忌神之根”。
  const xiWxS = ((geOuter||isZaGe) && geUse.xiWx) ? new Set(geUse.xiWx) : xiWxSet;
  const jiWxS = ((geOuter||isZaGe) && geUse.jiWx) ? new Set(geUse.jiWx) : jiWxSet;
  const xiRootSet=new Set(BZ.zhis.filter(z=>xiWxS.has(vxOf(z))));          // 用神之根支
  const jiRootSet=new Set(BZ.zhis.filter(z=>jiWxS.has(vxOf(z))));          // 忌神之根支
  const ganKe=(a,b)=>{ const wa=GAN_WX[a], wb=GAN_WX[b]; return WX_KE[wa]===wb||WX_KE[wb]===wa; };
  const allIdx=z=>{ const r=[]; BZ.zhis.forEach((v,i)=>{ if(v===z) r.push(i); }); return r; };
  const tianKeDiChong=zs=>{ const idxs=zs.flatMap(z=>allIdx(z)); for(let p=0;p<idxs.length;p++)for(let q=p+1;q<idxs.length;q++){ if(ganKe(BZ.gans[idxs[p]],BZ.gans[idxs[q]]) && pairIn(BZ.zhis[idxs[p]],BZ.zhis[idxs[q]],DIZHI_CHONG)) return true; } return false; };
  const struct=[];
  const pushDis=(rel,cls,sev,why,yaoWx,yaoText,kind,pos)=>struct.push({rel:rel.text,cls,sev,why,yaoWx,yaoText,kind,pos:pos||[]});
  const PALACE=['年','月','日','时'];
  const palaceOf=idxs=>idxs.map(i=>PALACE[i]+'柱').join('、');
  const zsOf=r=>ZHI_ORDER.filter(z=>r.indexOf(z)>=0);
  const zhis4=BZ.zhis;
  // ---- A. 逐柱对地支关系（保留多重性，不去重）：冲、刑/害、破/六合 ----
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    const a=zhis4[i], b=zhis4[j];
    const zs=[a,b];
    const emit=(cls,text)=>{
      const rel={text};
      const tdc=tianKeDiChong(zs);
      const touchDay=zs.includes(dz) || [...rootZhiSet].some(z=>zs.includes(z));
      const touchMonth=zs.includes(mz2);
      const touchXi=[...xiRootSet].some(z=>zs.includes(z));
      const touchJi=[...jiRootSet].some(z=>zs.includes(z));
      if(cls==='chong'){
        if(touchDay) pushDis(rel,'chong',tdc?'重':'中',`${text}${tdc?'（天克地冲）':''}：冲日支、日主根基（${dz}），根基动荡，${weak?'日主本弱、冲则更无依傍':'日主之气被冲散'}。`,dwx,`扶日主${dwx}（印比），或以六合解冲。`,'病',[i,j]);
        else if(touchMonth) pushDis(rel,'chong',tdc?'重':'中',`${text}${tdc?'（天克地冲）':''}：冲月令${mz2}（用神之本），月令动摇则取用失据。`,mbWx,`固月令本气${mbWx}，通关化解。`,'病',[i,j]);
        else if(touchXi) pushDis(rel,'chong','中',`${text}：冲用神之根（${zs.join('')}），用神被冲散、吉力受损。`,[...xiWxS][0]||dwx,`补用神${[...xiWxS][0]||dwx}、合住忌冲。`,'病',[i,j]);
        else if(touchJi) pushDis(rel,'chong','轻',`${text}：冲忌神之根（${zs.join('')}），忌神被冲去，反为去病之象。`,null,`顺势而去，不补不制。`,'药',[i,j]);
        else pushDis(rel,'chong','轻',`${text}：两柱相冲，主变动离散，未直伤日主、用神。`,null,`静守待时，逢合则解。`,'病',[i,j]);
      } else if(cls==='xing'){
        const kx = a===b ? '' : '（'+xingKindOf(a,b)+'）';
        if(touchDay||touchXi) pushDis(rel,'xing','中',`${text}${kx}：刑伤${touchDay?'日支根基':''}${touchXi?(touchDay?'、':''):''}${touchXi?'用神之根':''}，主内耗、是非、刑伤。`,touchDay?dwx:([...xiWxS][0]||dwx),`扶日主、用神化解内耗。`,'病',[i,j]);
        else if(touchJi) pushDis(rel,'xing','轻',`${text}${kx}：刑忌神之根，忌神受刑、反减其凶。`,null,`顺势制忌。`,'药',[i,j]);
        else pushDis(rel,'xing','轻',`${text}${kx}：地支相刑，主暗中小人、口舌。`,null,`谨言慎行。`,'病',[i,j]);
      } else if(cls==='hai'){
        if(touchDay||touchXi) pushDis(rel,'hai','轻',`${text}：相害暗损${touchDay?'日支':''}${touchXi?'用神':''}，主阻隔不和。`,touchDay?dwx:([...xiWxS][0]||dwx),`通关解害。`,'病',[i,j]);
        else if(touchJi) pushDis(rel,'hai','轻',`${text}：害忌神，暗中去忌。`,null,`顺势。`,'药',[i,j]);
        else pushDis(rel,'hai','轻',`${text}：相害，主暗损、阻隔。`,null,`静守。`,'病',[i,j]);
      } else if(cls==='po'){
        if(touchDay||touchXi) pushDis(rel,'po','轻',`${text}：相破${touchDay?'日支':''}${touchXi?'用神':''}，主破坏离散、暗耗。`,touchDay?dwx:([...xiWxS][0]||dwx),`补用神化解。`,'病',[i,j]);
        else if(touchJi) pushDis(rel,'po','轻',`${text}：破忌神，破其凶势。`,null,`顺势。`,'药',[i,j]);
        else pushDis(rel,'po','轻',`${text}：相破，主破坏离散。`,null,`静守。`,'病',[i,j]);
      } else if(cls==='he'){
        const gchars=ganCharsOf(text);
        const dayGanHe=gchars.includes(dg);
        const dayZhiHe=zs.includes(dz) || [...rootZhiSet].some(z=>zs.includes(z));
        const huaWx=(text.match(/合化([木火土金水])/)||[])[1]||null;
        if(dayGanHe) pushDis(rel,'he','中',`${text}：日主${dg}被合${huaWx||''}，${weak?'身弱无依、日主之气被夺':'日主被羁绊'}。`,dwx,`扶日主${dwx}（印比）解合。`,'病',[i,j]);
        else if(dayZhiHe){
          if(huaWx&&jiWxSet.has(huaWx)) pushDis(rel,'he','轻',`${text}：合住、合化忌神${huaWx}，忌神被羁，吉。`,null,`顺用。`,'药',[i,j]);
          else if(huaWx&&xiWxSet.has(huaWx)) pushDis(rel,'he','中',`${text}：合化、合住用神${huaWx}，用神被羁绊夺走。`,huaWx,`补用神${huaWx}、或以冲解合。`,'病',[i,j]);
          else pushDis(rel,'he','轻',`${text}：日支被合绊，根基受制。`,dwx,`扶日主${dwx}。`,'病',[i,j]);
        }
        else if(huaWx&&jiWxSet.has(huaWx)) pushDis(rel,'he','轻',`${text}：合化忌神${huaWx}，忌神被制，吉。`,null,`顺用。`,'药',[i,j]);
        else if(huaWx&&xiWxSet.has(huaWx)) pushDis(rel,'he','轻',`${text}：合化用神${huaWx}，用神得助，吉。`,null,`顺用。`,'药',[i,j]);
      } else if(cls==='anhe'){
        if(touchDay||touchXi) pushDis(rel,'anhe','轻',`${text}：暗合牵绊${touchDay?'日支根基':''}${touchXi?'用神之根':''}，主隐伏、私下之合，气机暗滞。`,touchDay?dwx:([...xiWxS][0]||dwx),`扶日主、用神以定其根。`,'病',[i,j]);
        else if(touchJi) pushDis(rel,'anhe','轻',`${text}：暗合忌神之根，暗中去忌，吉。`,null,`顺势。`,'药',[i,j]);
        else pushDis(rel,'anhe','轻',`${text}：暗合，主隐秘、私下之合，吉凶不显。`,null,`静观。`,'病',[i,j]);
      }
    };
    if(pairIn(a,b,DIZHI_CHONG)) emit('chong',`${a}${b}相冲`);
    if(pairIn(a,b,DIZHI_HAI)) emit('hai',`${a}${b}相害`);
    if(pairIn(a,b,DIZHI_PO)) emit('po',`${a}${b}相破`);
    // 刑：统一走全站单一真源 zhiRelTypes（寅申因冲覆盖刑，此处亦不单列刑）
    if(zhiRelTypes(a,b).includes('刑')) emit('xing', a===b?`${a}${b}自刑`:`${a}${b}相刑`);
    if(pairIn(a,b,DIZHI_ANHE)) emit('anhe',`${a}${b}暗合`);
    DIZHI_HE6.forEach(g=>{ if((g[0]===a&&g[1]===b)||(g[0]===b&&g[1]===a)){ const ok=heHuaOK(g[2],BZ.gans,BZ.zhis,BZ.monthZ); emit('he', ok?`${a}${b}合化${g[2]}`:`${a}${b}合而不化（绊）`); } });
  }
  // ---- B. 三合、三会、半合（三柱成局，保留宫位）----
  const emitSan=(cls,text,huaWx,idxs,kind)=>{
    const rel={text};
    const weak3=(kind==='ban'||kind==='gong');            // 半合、拱 力量弱
    const ok=(kind? heHuaOK(huaWx,BZ.gans,BZ.zhis,BZ.monthZ) : true);
    if(weak3 && !ok){ pushDis(rel,'sanhe','轻',`${text}：半合、拱而化神不显，虚拱待时、暂不成局，吉凶未著。`,null,`待岁运引动。`,'病',idxs); return; }
    const down = s => weak3 ? (s==='重'?'中':(s==='中'?'轻':'轻')) : s;   // 半合、拱 降一级
    if(huaWx&&jiWxSet.has(huaWx)) pushDis(rel,'sanhe',down('重'),`${text}：忌神${huaWx}聚会成势，忌神极旺为病。`,restrain(huaWx),`以“${restrain(huaWx)}”克忌神、分散其势。`,'病',idxs);
    else if(huaWx&&xiWxSet.has(huaWx)) pushDis(rel,'sanhe',down('轻'),`${text}：用神${huaWx}聚会得力，吉。`,null,`顺用。`,'药',idxs);
    else if(huaWx===dwx) pushDis(rel,'sanhe',down(weak?'轻':'中'),`${text}：比劫${huaWx}聚会成势，${weak?'帮身有力（吉）':'身强则争财耗身'}。`,weak?null:restrain(huaWx),weak?'':'以“'+restrain(huaWx)+'”分散比劫。',weak?'药':'病',idxs);
    else pushDis(rel,'sanhe',down('轻'),`${text}：聚会成${huaWx||'局'}，中性。`,null,`静观。`,'病',idxs);
  };
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)for(let k=j+1;k<4;k++){
    const t=[zhis4[i],zhis4[j],zhis4[k]].sort().join('');
    const sh=DIZHI_SANHE.find(g=>[g[0],g[1],g[2]].sort().join('')===t);
    if(sh) emitSan('sanhe',`${sh[0]}${sh[1]}${sh[2]}三合${sh[3]}局`,sh[3],[i,j,k]);
    const hui=DIZHI_SANHUI.find(g=>[g[0],g[1],g[2]].sort().join('')===t);
    if(hui) emitSan('sanhe',`${hui[0]}${hui[1]}${hui[2]}三会${hui[3]}局`,hui[3],[i,j,k]);
  }
  DIZHI_SANHE.forEach(g=>{
    const present=g.slice(0,3).filter(z=>zhis4.includes(z));
    if(present.length===2){
      const miss=g.slice(0,3).find(z=>!zhis4.includes(z));
      const kind=sanheKind(g, present);
      const idxs=zhis4.map((z,ii)=>present.includes(z)?ii:-1).filter(ii=>ii>=0);
      let label, kd;
      if(kind==='shengwang'){ label=`${present[0]}${present[1]}半合${g[3]}局（生旺，力全）`; kd='ban'; }
      else if(kind==='wangmu'){ label=`${present[0]}${present[1]}半合${g[3]}局（旺墓，力半）`; kd='ban'; }
      else { label=`${present[0]}${present[1]}拱${g[3]}局（虚拱${miss}，待时而发）`; kd='gong'; }
      emitSan('sanhe', label, g[3], idxs, kd);
    }
  });
  // 争合、妒合：日主同时被两干所合
  const gRel=ganRelations(BZ.gans, BZ);
  const dayHe=gRel.filter(r=>r.cls==='he'&&ganCharsOf(r.text).includes(dg));
  if(dayHe.length>1) pushDis({text:`日主${dg}被争合（妒合）`},'he','中',`日主${dg}同时被 ${dayHe.length} 干所合（妒合、争合），日主之气被分夺、立场不定。`,dwx,`扶日主${dwx}（印比）定其根。`,'病',[]);
  // 天干相冲：阳干对峙，主动荡、离散、外力冲击
  gRel.filter(r=>r.cls==='gchong').forEach(r=>{
    const [x,y]=r.text.replace('相冲','').split('');
    const touchDay=(x===dg||y===dg);
    const xiHit=xiWxSet.has(GAN_WX[x])||xiWxSet.has(GAN_WX[y]);
    const jiHit=jiWxSet.has(GAN_WX[x])||jiWxSet.has(GAN_WX[y]);
    if(touchDay) pushDis({text:r.text},'gchong','中',`${r.text}：日主${dg}之干被冲，根基动摇、主变动。`,dwx,`扶日主${dwx}（印比）定其根。`,'病',[]);
    else if(jiHit) pushDis({text:r.text},'gchong','轻',`${r.text}：冲去忌神，忌神被制，反为有利。`,null,`顺势。`,'药',[]);
    else if(xiHit) pushDis({text:r.text},'gchong','中',`${r.text}：冲伤用神，用神根基受损。`,null,`补用神化解。`,'病',[]);
    else pushDis({text:r.text},'gchong','轻',`${r.text}：干支相激，主变动、口舌。`,null,`静守。`,'病',[]);
  });
  // ---- C. 聚合（保留重复次数与宫位，按次数升级严重度）----
  const SEV_ORDER={重:0,中:1,轻:2};
  const groups={};
  struct.forEach(d=>{
    const zs=zsOf(d.rel);
    const key=d.cls+':'+(zs.length?zs.sort().join(''):d.rel);
    if(!groups[key]) groups[key]={rel:d.rel,cls:d.cls,sev:d.sev,why:d.why,yaoWx:d.yaoWx,yaoText:d.yaoText,kind:d.kind,count:0,pairs:[],tdc:false};
    const g=groups[key]; g.count++; g.pairs.push(d.pos);
    if(/天克地冲/.test(d.why)) g.tdc=true;
    // 同一关系反复出现  升级（特殊盘的“全局共振”）
    if(g.count>=3 && g.sev!=='重') g.sev='重';
    if(g.count>=2 && g.sev==='轻' && g.kind==='病') g.sev='中';
  });
  const structDisease=Object.values(groups).map(g=>{
    const posText=g.pairs.filter(p=>p&&p.length).map(p=>palaceOf(p)).join('、');
    let why=g.why;
    if(g.count>=2) why+=`（全局×${g.count}：${posText}${g.pairs.flat().length>=4?'，四宫俱动':''}）`;
    return {rel:g.rel,cls:g.cls,sev:g.sev,why,yaoWx:g.yaoWx,yaoText:g.yaoText,kind:g.kind,count:g.count,positions:g.pairs};
  });
  structDisease.sort((a,b)=>SEV_ORDER[a.sev]-SEV_ORDER[b.sev]);
  const disB=structDisease.filter(d=>d.kind==='病'), disY=structDisease.filter(d=>d.kind==='药');
  // ---- D. 全局特殊结构（格局级：伏吟 / 纯阴纯阳 / 干支不杂；只用有古籍出处的标准术语，禁自造）----
  const specialStruct=[];
  const gz4=[BZ.gans[0]+BZ.zhis[0],BZ.gans[1]+BZ.zhis[1],BZ.gans[2]+BZ.zhis[2],BZ.gans[3]+BZ.zhis[3]];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    if(gz4[i]===gz4[j]) specialStruct.push({name:'伏吟',detail:`${PALACE[i]}柱${gz4[i]}与${PALACE[j]}柱${gz4[j]}相同（${PALACE[i]}、${PALACE[j]}伏吟），主反复、迟滞、旧事重演。`,sev:'中',tend:'凶'});
  }
  const isYin=s=>YANG.indexOf(s)<0;
  const allYinG=gz4.every(x=>isYin(x[0])), allYangG=gz4.every(x=>!isYin(x[0]));
  const allYinZ=gz4.every(x=>isYin(x[1])), allYangZ=gz4.every(x=>!isYin(x[1]));
  if(allYinG&&allYinZ) specialStruct.push({name:'四柱纯阴',detail:'四天干皆阴、四地支皆阴，纯阴之局：内敛、潜藏、多思少发。',sev:'轻',tend:'凶'});
  if(allYangG&&allYangZ) specialStruct.push({name:'四柱纯阳',detail:'四天干皆阳、四地支皆阳，纯阳之局：外扬、刚猛、多动态少静。',sev:'轻',tend:'凶'});
  // 天元一气/地物合一/四柱全同（《三命通会·卷六·一气生成》"天元一气定尊荣，不杂天干一字清"）：
  // 天元一气=四天干全同（四干纯一不杂），地物合一=四地支全同（四支纯一不杂，名芝兰并秀格）。
  // 四柱干支完全并同（四柱天干地支均同一个干支）为"四柱全同"，天元一气与地物合一兼得，乃一气生成极格。
  const allG=gz4.every(x=>x[0]===gz4[0][0]);
  const allZ=gz4.every(x=>x[1]===gz4[0][1]);
  const allGZ=gz4.every(x=>x===gz4[0]);
  if(allG) specialStruct.push({name:'天元一气',detail:'四柱天干皆同（'+gz4[0][0]+'），四干纯一不杂，勿以比肩论；《三命通会》"天元一气定尊荣，不杂天干一字清"，如带财官印合格、岁运不背，必当大贵；冲刑克制亦凶。',sev:'重',tend:'吉'});
  if(allZ) specialStruct.push({name:'地物合一',detail:'四柱地支皆同（'+gz4[0][1]+'），四支纯一不杂，名芝兰并秀格；须看干元是支福聚祸聚，福聚合格多居两府之贵。',sev:'重',tend:'吉'});
  if(allGZ) specialStruct.push({name:'四柱全同',detail:'四柱干支完全并同（'+gz4[0]+'年、月、日、时），天元一气与地物合一兼得，一气生成之极格；此类极罕见，气机高度专一，吉凶倍显，成败系于用神是否被引动、岁运是否背其势。',sev:'极重',tend:'中性'});
  const dG=[...new Set(BZ.gans)]; if(dG.length<=2) specialStruct.push({name:'天干不杂',detail:`天干仅 ${dG.join('、')} 两字（两干不杂），气机专一。`,sev:'轻',tend:'吉'});
  const dZ=[...new Set(BZ.zhis)]; if(dZ.length<=2) specialStruct.push({name:'地支不杂',detail:`地支仅 ${dZ.join('、')} 两字（地支不杂），局势专凝。`,sev:'轻',tend:'吉'});
  let structNote='';
  if(disB.length||disY.length){
    if(disB.length) structNote+=`伤日主根基、用神者为“病”（凶）${disB.length} 项：${disB.map(d=>`${d.rel}${d.count>=2?('×'+d.count):''}（${d.sev}）`).join('、')}；`;
    if(disY.length) structNote+=`解病或成用神者为“药”（吉）${disY.length} 项：${disY.map(d=>`${d.rel}${d.count>=2?('×'+d.count):''}`).join('、')}。`;
  } else structNote+='未见明显冲刑害破，气机平稳。';
  if(specialStruct.length) structNote+=' 全局特殊结构：'+[...new Set(specialStruct.map(s=>s.name))].join('、')+'。';
  // 神煞辅格：天乙贵人、文昌、禄/桃花临用神根、日主、月令，辅格局成败
  const geSha=[];
  const tyz=[...(new Set(TIANYI[dg]||[]))];
  tyz.forEach(z=>{ if(BZ.zhis.includes(z)){ const eff= xiRootSet.has(z)?'贵人临用神之根，格局得贵气助成':(z===dz?'贵人临日支，日主得贵助':(z===mz2?'贵人临月令，用神得贵':'')); if(eff) geSha.push({sha:'天乙贵人',zhi:z,eff}); } });
  if(BZ.zhis.includes(WENCHANG[dg])) geSha.push({sha:'文昌',zhi:WENCHANG[dg],eff: xiRootSet.has(WENCHANG[dg])?'文昌临用神，文贵有助':'文昌临局，利文教'});
  if(BZ.zhis.includes(LU[dg])) geSha.push({sha:'禄神',zhi:LU[dg],eff:(LU[dg]===dz?'禄神临日支（专禄），日主得地有力':(BZ.zhis.indexOf(LU[dg])+1)+'柱见禄，日主得地')});
  const TAOHUA_MAP={'申':'酉','子':'酉','辰':'酉','亥':'子','卯':'子','未':'子','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午'};
  const taoby=TAOHUA_MAP[BZ.yearZ]||TAOHUA_MAP[BZ.dayZ]||'';
  if(taoby && BZ.zhis.includes(taoby)){ const eff= jiRootSet.has(taoby)?'桃花临忌神之根，破格之累（防感情纷扰）':'桃花临局，主才情人缘'; geSha.push({sha:'桃花',zhi:taoby,eff}); }
  const geShaNote = geSha.length? ('神煞辅格：'+geSha.map(s=>s.sha+'('+s.zhi+')'+s.eff).join('；')+'。') : '神煞辅格：本局无明显贵人、文昌、禄、桃花临用神或月令。';
  // 用神随运岁转换说明（供岁运引动区块引用）
  const geYunNote = geOuter ? '用神随运岁：外格须顺其势，大运流年逢从神旺地则成、逢逆克、扶起日主则破格。'
                             : (isZaGe ? '用神随运岁：杂格以本格喜忌为纲，大运流年逢喜用五行（'+(geUse.xiWx||[]).join('、')+'）则得力、逢忌神五行（'+(geUse.jiWx||[]).join('、')+'）则受制；破格之患在刑冲克破本格之根。'
                                       : '用神随运岁：大运流年逢生扶用神（'+[...xiWxSet].join('、')+'）则得力、逢克泄忌神（'+[...jiWxSet].join('、')+'）则受制；原局破格者更需岁运扶用神、制忌神。');
  // 古籍引证：随格局 / 日主 / 旺衰 / 病药动态变化（每盘不同）
  const quotes=[];
  quotes.push(`《子平真诠》论"${geName}"：八字用神专求月令；${dg}日主${strength.replace(/（.*?）/g,'')}，取用须合月令${mz}之气的强弱。`);
  quotes.push(BZ_QUOTE.geYuanhai);
  quotes.push(BZ_QUOTE.geSanming);
  if(strong) quotes.push(BZ_QUOTE.strong); else if(weak) quotes.push(BZ_QUOTE.weak);
  quotes.push(`《穷通宝鉴》${SEASON[mz]}生人：${tiao.d}`);
  quotes.push(`《滴天髓·疾病章》云："${bingWx}"为病、"${yaoWx}"为药，有病方为贵，无伤不是奇。`);
  if(tong) quotes.push(BZ_QUOTE.tong);
  if(structDisease.length) quotes.push(`《滴天髓》结构：本命${disB.length?('结构病 '+disB.map(d=>`${d.rel}${d.count>=2?('×'+d.count):''}`).join('、')):'结构尚和'}${disY.length?('；结构药 '+disY.map(d=>`${d.rel}${d.count>=2?('×'+d.count):''}`).join('、')):''}。`);
  if(structDisease.length) quotes.push(BZ_QUOTE.geShenfeng);
  if(specialStruct.length) quotes.push(`《滴天髓》特殊结构：本命格局特殊，${[...new Set(specialStruct.map(s=>s.name))].join('、')}；此类盘气机回环、重复共振，吉凶皆被放大，岁运引动时反应强烈，宜以"专一、制化、和解"为用。`);
  if(specialStruct.length){ quotes.push(BZ_QUOTE.geYujing); quotes.push(BZ_QUOTE.geXingping); }
  if(geOuter && geOuter.indexOf('化气')>=0) quotes.push(`《滴天髓》化气格：天干五合、化神当令则化气成格，顺其化气则贵，逆其化气（印比扶身、克化神）则破。`);
  // ============ 综合用神合成：五法用神按共识度排序，解决“各说各话” ============
  // 外格（专旺、从格、两气成象）的常规扶抑喜忌本不适用，改用外格真实喜忌；杂格主格同样以杂格本格喜忌为准
  let xiWxEff=xiWxSet, jiWxEff=jiWxSet;
  if(isZaGe){ xiWxEff=new Set(geUse.xiWx||[]); jiWxEff=new Set(geUse.jiWx||[]); }
  else if(geOuter==='专旺格'){ xiWxEff=new Set([dwx, shengWo]); jiWxEff=new Set([keWo, woKe, woSheng]); }
  else if(geOuter && geOuter.indexOf('从')===0){
    let cm=null,cc=-1; jiWxSet.forEach(w=>{ const c=cnt[w]||0; if(c>cc){cc=c;cm=w;} });
    const shengCm=(()=>{ for(const w in WX_SHENG) if(WX_SHENG[w]===cm) return w; return null; })();   // 生从神者（从杀=财、从财=食伤）
    const woShengC=WX_SHENG[dwx];                       // 食伤（我生）
    const keWoC=(()=>{ for(const w in WX_KE) if(WX_KE[w]===dwx) return w; return null; })();          // 官杀（克我）
    let xiBase=[cm, shengCm];
    if(cm===woShengC) xiBase=[cm, WX_SHENG[cm]];        // 从儿格：从神=食伤，喜食伤+财（食伤所生者）
    xiWxEff=new Set(xiBase.filter(Boolean));
    // 从格忌：印比（扶身破从）+ 官杀（克身破从、泄从神；从杀格官杀=从神本身在喜，由安全网剔除）
    //          + 食伤（从杀/从旺时克从神或泄身破从；从儿/从财时食伤为从神或财之生源、在喜，由安全网处理）
    const jiBase=[dwx, shengWo, keWoC].filter(Boolean);
    if(cm!==woShengC && cm!==shengCm) jiBase.push(woShengC);
    jiWxEff=new Set(jiBase);
  } else if(geOuter==='两气成象'){ xiWxEff=new Set(wxDistinct); jiWxEff=new Set(['木','火','土','金','水'].filter(w=>!wxDistinct.includes(w))); }
  else if(geOuter && geOuter.indexOf('化气')>=0){
    const shengHua=(()=>{ for(const w in WX_SHENG) if(WX_SHENG[w]===huaShen) return w; return null; })();
    const keHua=(()=>{ for(const w in WX_KE) if(WX_KE[w]===huaShen) return w; return null; })();
    const keShengHua=keHua?(()=>{ for(const w in WX_KE) if(WX_KE[w]===shengHua) return w; return null; })():null;  // 克化神之生源者（损化源，亦忌）
    const woShengC=WX_SHENG[dwx];                       // 食伤（泄化神/泄身，损化局之气，亦忌；与喜重叠由安全网剔除）
    const xieHua=WX_SHENG[huaShen]||'';                 // 化神所生者（泄化神，损化局之气，亦忌；官杀/财泄化神皆然）
    xiWxEff=new Set([huaShen, shengHua].filter(Boolean));
    const selfHua=(dwx===huaShen);
    jiWxEff=new Set(selfHua ? [keHua, keShengHua, woShengC].filter(Boolean) : [dwx, shengWo, keHua, keShengHua, woShengC, xieHua].filter(Boolean));
  }
  // 安全网：用神与忌神不可重叠（化气格日主印星恰为化神时，生我=化神会同时落入宜见/忌见）。
  // 重叠时从忌神剔除，用神优先（顺势取用为本）。普通格 xi/ji 本就互斥，此行为 no-op。
  jiWxEff = new Set([...jiWxEff].filter(w => !xiWxEff.has(w)));
  // 收集五法用神（五行）：直接读编译好的 geUse.xiWx（外格取五行字符、普通格由类集派生）
  const geWx=new Set(geUse.xiWx||[]);
  const mVotes=[];
  // 外格无常规扶抑，其 xiWxEff 为顺势取用（专旺/从/两气/化气），投票标签用“顺势”，与“外格不取常规扶抑法”不矛盾
  xiWxEff.forEach(w=>mVotes.push({m: geOuter?'顺势':(isZaGe?'格局':'扶抑'), w}));
  if(tiao && tiao.wx) mVotes.push({m:'调候', w:tiao.wx});
  if(tong && tong.wx) mVotes.push({m:'通关', w:tong.wx});
  geWx.forEach(w=>mVotes.push({m:'格局', w}));
  if(bingYao && bingYao.yao) mVotes.push({m:'病药', w:bingYao.yao});
  // 共识统计（同法只算一票）
  const vMap={};
  mVotes.forEach(v=>{ if(!vMap[v.w]) vMap[v.w]={wx:v.w, methods:[], count:0, isXi:xiWxEff.has(v.w), isJi:jiWxEff.has(v.w)}; if(vMap[v.w].methods.indexOf(v.m)<0){ vMap[v.w].methods.push(v.m); vMap[v.w].count++; } });
  const ranked=Object.values(vMap).sort((a,b)=> (b.isXi-a.isXi) || (b.count-a.count) || (xiWxSet.has(b.wx)?1:0)-(xiWxSet.has(a.wx)?1:0));
  // 冲突点：某法用神恰为有效忌神
  const conflicts=ranked.filter(r=>r.isJi).map(r=>({wx:r.wx, methods:r.methods, note:`“${r.methods.join('，')}”取 ${r.wx} 为用神，但 ${r.wx} 为日主${geOuter?('（'+geOuter+'）'):''}忌神，与扶抑（喜 ${[...xiWxEff].join('、')}）相左，岁运见之须权衡。`}));
  const primary=ranked[0]||null;
  const secondary=ranked.find(r=>r!==primary)||null;
  // 用神天干取用（透干优先，其次得根）
  let gan={all:[], tou:[], root:[]};
  if(primary){ const pg=GAN_OF_WX[primary.wx]||[]; gan.all=pg; gan.tou=pg.filter(g=>BZ.gans.includes(g)); gan.root=pg.filter(g=>BZ.zhis.some(z=>(HIDE[z]||[]).includes(g))); }
  const xiList=[...xiWxEff], jiList=[...jiWxEff];
  // 综合/顺势喜忌的十神类口径（带标注，与 fu.xi 格式一致：比劫（扶）/印星（生）/食伤（泄）/财星（耗）/官杀（克））
  // 供速览卡、宜忌选择等消费方统一取用，避免特殊格盘扶抑/顺势两套口径并存造成"喜用木金水 vs 喜土火"类矛盾
  const wxTenEff=(wx)=>{
    if(wx===dwx) return '比劫（扶）';
    if(WX_SHENG[wx]===dwx) return '印星（生）';   // wx 生日主
    if(WX_SHENG[dwx]===wx) return '食伤（泄）';   // 日主生 wx
    if(WX_KE[wx]===dwx) return '官杀（克）';      // wx 克日主
    return '财星（耗）';                           // 日主克 wx
  };
  const xiCatsEff=xiList.map(wxTenEff), jiCatsEff=jiList.map(wxTenEff);
  const advice=`岁运宜见 ${xiList.join('、')}（助用神、生扶），忌见 ${jiList.join('、')}（助忌神）${conflicts.length?('；⚠ '+conflicts[0].wx+' 兼具调候、格局之用而犯扶抑之忌，须借岁运通关或权衡轻重'):''}。`;
  const synthesis={ ranked, primary, secondary, conflicts, gan, advice, xiWxEff:xiList, jiWxEff:jiList, xiCatsEff, jiCatsEff };
  // ============ 墓库与财库（辰戌丑未 库地 / 逢冲刑开库 / 逢合锁库 / 三合三会化局）============
  const MU_WX={'辰':'水','戌':'火','丑':'金','未':'木'};
  const MU_LABEL={'辰':'水库','戌':'火库','丑':'金库','未':'木库'};
  /* 库之开合（墓库与财库共用同一口径）：库支逢冲、刑为开库，库门洞开、所藏得用；
     逢六合为锁库，库门锁闭、藏而不显，须岁运冲开合局；库支入三合、三会成局则化于局、
     所藏随局显用而不作库论。冲解合，故开库优先于锁库。 */
  const kuState=z=>{
    const zi=BZ.zhis.indexOf(z), open=new Set(), lock=new Set();
    BZ.zhis.forEach((pz,i)=>{ if(i===zi) return;
      if(pairIn(z,pz,DIZHI_CHONG)) open.add(pz+'冲');
      else if(pairIn(z,pz,DIZHI_XING)) open.add(pz+'刑');
      else if(pairIn(z,pz,DIZHI_HE6)) lock.add(pz+'合');
    });
    const ju=(DIZHI_SANHE.concat(DIZHI_SANHUI)).find(g=>g.slice(0,3).indexOf(z)>=0 && g.slice(0,3).every(x=>BZ.zhis.indexOf(x)>=0));
    return {open:[...open], lock:[...lock], ju, byOpen:open.size?('逢'+[...open].join('、')+'开库'):''};
  };
  const mukuList=[];
  ['辰','戌','丑','未'].forEach(mz=>{
    if(!BZ.zhis.includes(mz)) return;
    const sw=MU_WX[mz];
    const st=kuState(mz);
    const tou=(HIDE[mz]||[]).filter(h=>BZ.gans.includes(h));
    const opened=st.open.length>0||tou.length>0;             // 冲、刑开库；库中物透干则出而为用
    const byWhat=st.open.length?st.byOpen:(tou.length?('天干透出所藏（'+tou.join('')+'）'):'');
    const closed=st.lock.length?('逢'+st.lock.join('、')+'锁库'):'';
    const juTxt=st.ju?(mz+'入'+st.ju[3]+'局、库化于局'):'';
    const activeTxt=opened?byWhat:(st.ju?juTxt:closed);      // 库门有动：开库、化局、锁库；三者皆无则为空串
    const stateTxt=activeTxt||'库门未开';
    const shown=opened||!!st.ju;                             // 物已出库：开库、透干，或化于局而随局显用
    let tend, detail;
    if(sw===dwx){
      if(shown){ tend='中'; detail=`${mz}为${MU_LABEL[mz]}（藏${sw}），日主${dg}（${dwx}）之根库，${stateTxt}，根气发动得力`; }
      else { tend='凶'; detail=`${mz}为${MU_LABEL[mz]}（藏${sw}），日主${dg}（${dwx}）入墓，${stateTxt}，根气收藏偏弱，须岁运冲开、透出方显`; }
    } else if(xiWxEff.has(sw)){
      if(shown){ tend='吉'; detail=`${mz}为${MU_LABEL[mz]}（藏用神${sw}），${stateTxt}，用神得力`; }
      else { tend='中'; detail=`${mz}为${MU_LABEL[mz]}（藏用神${sw}），${stateTxt}，用神收藏，须岁运冲开、透出方显`; }
    } else if(jiWxEff.has(sw)){
      if(shown){ tend='凶'; detail=`${mz}为${MU_LABEL[mz]}（藏忌神${sw}），${stateTxt}，忌神显而为病`; }
      else { tend='吉'; detail=`${mz}为${MU_LABEL[mz]}（藏忌神${sw}），${stateTxt}，忌神蓄藏不发，岁运冲开则忌动`; }
    } else { tend='中'; detail=`${mz}为${MU_LABEL[mz]}（藏${sw}），${activeTxt||'静守'}，吉凶不显`; }
    mukuList.push({zhi:mz, sw, opened, locked:st.lock.length>0, ju:st.ju?st.ju[3]:'', tend, detail});
  });
  const mukuNote = mukuList.length ? (mukuList.map(m=>m.detail).join('；')+'。') : '四柱无辰戌丑未墓库之地。';
  // ============ 十二长生 / 空亡 / 神煞 深化（排盘表已有原始数据，此处合成结论）============
  const csDg=BZ.dayGan;
  const csStates=BZ.zhis.map(z=>({z, s:getChangSheng(csDg,z)}));
  const weakCs=['死','墓','绝','胎','养'], strongCs=['长生','冠带','临官','帝旺'];
  let csNote=`日主${csDg}（${GAN_WX[csDg]}）于四柱：`+BZ.zhis.map((z,i)=>`${PALACE[i]}支${z}（${csStates[i].s}）`).join('、')+'。';
  if(weakCs.includes(csStates[2].s)) csNote+=`日支临${csStates[2].s}，日主根气偏弱；`;
  else if(strongCs.includes(csStates[2].s)) csNote+=`日支临${csStates[2].s}，日主得根有力；`;
  if(weakCs.includes(csStates[1].s)) csNote+=`月令（提纲）临${csStates[1].s}，日主失令之基；`;
  else if(strongCs.includes(csStates[1].s)) csNote+=`月令临${csStates[1].s}，日主得令之基；`;
  if(primary){ const wx=primary.wx, rep=GAN_OF_WX[wx][0];
    csNote+=`再参喜用${wx}之长生：`+BZ.zhis.map((z,i)=>`${PALACE[i]}支${z}（${getChangSheng(rep,z)}）`).join('；')+'。'; }
  const kw=kongWang(BZ.gans[2]+BZ.zhis[2]);
  const kwSet=new Set(kw);
  let kwNote=`以日柱（${BZ.gans[2]+BZ.zhis[2]}）论，旬空 ${kw.join('、')}。`;
  const kwHit=BZ.zhis.filter(z=>kwSet.has(z));
  if(kwHit.length){
    kwNote+=`四柱地支 ${kwHit.join('、')} 落空亡；`;
    if(kwSet.has(BZ.dayZ)) kwNote+='日支空亡，夫妻宫虚；';
    if(primary){ const px=GAN_OF_WX[primary.wx]||[]; const pxRoot=BZ.zhis.filter(z=>(HIDE[z]||[]).some(h=>px.includes(h)));
      if(pxRoot.some(z=>kwSet.has(z))) kwNote+='用神之根落空，用神虚浮无力；'; }
    kwNote+='空者虚而不实，逢冲逢合填实则转实。';
  } else kwNote+='四柱地支不落空亡。';
  // ============ 财库（财星之墓库：我克者为财，取财星五行之墓库）============
  // 四库分配：辰为水库、戌为火库、丑为金库、未为木库；土库辰戌二说，本盘取戌。开合判据与墓库同源（kuState）。
  const CAI_KU={'木':'未','火':'戌','土':'戌','金':'丑','水':'辰'};
  const wealthWx=WX_KE[dwx];
  const caiKuZhi=CAI_KU[wealthWx]||'';
  const caiKuIdx=BZ.zhis.indexOf(caiKuZhi);
  const caiXi=xiWxEff.has(wealthWx), caiJi=jiWxEff.has(wealthWx);
  const caiKuTag=caiXi?'<span class="tip sha-ji">喜用</span>':(caiJi?'<span class="tip sha-xiong">忌神</span>':'喜忌无涉');
  const kuTuShuo=wealthWx!=='土'?'':'土之墓库古有二说：子平通行火土同宫，戊土长生在寅、墓在戌，故取戌为土库；水土同宫一派（《五行大义》载土墓在辰）以辰为土库。本盘从火土同宫取戌，'
    +(caiKuIdx>=0?(BZ.zhis.indexOf('辰')>=0?'本局辰戌并见，二说之库皆在局中。':'本局四柱无辰，别派之说无所取。')
      :(BZ.zhis.indexOf('辰')>=0?'本局四柱见辰，若从别派则财库在辰。':'本局四柱辰戌俱无，二说皆无财库。'));
  let caiKuNote, kuStateTxt='', caiKuKaihe='';
  if(caiKuIdx>=0){
    const st=kuState(caiKuZhi);
    const caiTou=BZ.gans.some(g=>{ const t=tenGod(dg,g); return t==='正财'||t==='偏财'; });
    kuStateTxt=st.open.length?`${st.byOpen}，库门洞开、库中之财得用`
        :st.lock.length?`逢${st.lock.join('、')}锁库，库门锁闭、财藏不显，须待岁运冲开合局`
          :st.ju?`${caiKuZhi}入${st.ju[3]}局、库化于局，所藏之财随局显用，不作库论`
            :'库门未开亦未锁，财藏库中，须岁运冲刑引动方显';
    /* 开合二说（多流派并列，不可择一）：库逢冲为开库，别派任铁樵谓非开反破，二说并存 */
    caiKuKaihe=st.open.length?'库逢冲开为开库之说，别派任铁樵《滴天髓阐微》谓四库之冲藏气受伤、非开反破，二说并存，其别在库中物是否为日主所需。':'';
    caiKuNote=`我克者为财，财星属${wealthWx}，${wealthWx}之墓库为${caiKuZhi}，故以${caiKuZhi}为财库。`
      +`四柱${PALACE[caiKuIdx]}支见${caiKuZhi}，原局带财库，`
      +kuStateTxt
      +(caiTou?'；所藏之财透干，财气外显得用':'')
      +`。财为${caiKuTag}，${caiXi?'库开则财得用、聚财之机显':caiJi?'库开则财耗、宜防因财致累':'库开则财机自见'}；`
      +(weak?'日主偏弱，库中之财须行帮身之运方能担':strong?'日主有力，足以担财':'日主中和，可担财')
      +'。'
      +(kwSet.has(caiKuZhi)?'财库支落空亡，库虚不实、聚而难守。':'')
      +caiKuKaihe
      +kuTuShuo;
  } else {
    caiKuNote=`我克者为财，财星属${wealthWx}，${wealthWx}之墓库为${caiKuZhi}，故以${caiKuZhi}为财库。`
      +`四柱不见${caiKuZhi}，原局无财库，财气多凭流转积累、无库可蓄，须岁运逢${caiKuZhi}方能蓄财，逢冲刑开库之年方显聚财之机。`
      +kuTuShuo;
  }
  /* 财库库位（纯事实，供本命分析速查行取用）：只出财库支与四柱见否，不含定性、状态与二说 */
  const caiKuWhere=`${caiKuZhi}（${wealthWx}之墓库），四柱${caiKuIdx>=0?PALACE[caiKuIdx]+'支见'+caiKuZhi:'不见'+caiKuZhi}`;
  /* 财库定调（一句话）：只出财库有无与库的当前状态，供事业财运本命基调表取用。
     开合二说与土库辰戌二说归本命分析财库速查项，聚财之机与岁运应期不再单出，三处互不重复。 */
  const caiKuBrief=caiKuIdx>=0
    ?`财星属${wealthWx}，${wealthWx}之墓库为${caiKuZhi}，四柱${PALACE[caiKuIdx]}支见${caiKuZhi}，原局带财库，${kuStateTxt}`
    :`财星属${wealthWx}，${wealthWx}之墓库为${caiKuZhi}，四柱不见${caiKuZhi}，原局无财库、无库可蓄`;
  const shaCtx={dayGan:BZ.dayGan, monthGan:BZ.gans[1], yearZ:BZ.zhis[0], monthZ:BZ.zhis[1], dayZ:BZ.dayZ, gans:BZ.gans};
  const shaAll={};
  [['年',0,true],['月',1,false],['日',2,false],['时',3,false]].forEach(([lbl,i,isYear])=>{
    const gz=BZ.gans[i]+BZ.zhis[i];
    pillarSha({gz, z:BZ.zhis[i], lbl, isYear, isMonth:(i===1), isDay:(i===2), isTime:(i===3), gan:BZ.gans[i]}, shaCtx)
      .forEach(s=>{ (shaAll[s]=shaAll[s]||[]).push(lbl+'柱'); });
  });
  /* 神煞落柱清单由页面 renderBenmingClickable 依 REL.sha.collect 的四轴（日干、年干、日支、纳音）出，
     引擎侧不再另出一份单轴版本，免两处口径不一。此处只出倾向断语。 */
  const shaTend=[];
  if(shaAll['天乙贵人']) shaTend.push('天乙贵人临局，主逢凶化吉、得外力相助（吉）');
  if(shaAll['羊刃']) shaTend.push('羊刃临局，刚烈逞强，吉则掌权、凶则血光刑伤（须制）');
  if(shaAll['羊刃（禄前派）']) shaTend.push('羊刃（禄前派）临局，按禄前一辰取刃法，刚烈逞强同论、须制');
  if(shaAll['驿马']) shaTend.push('驿马临局，主变动远行、动中得财');
  if(shaAll['桃花']) shaTend.push('桃花临局，主才情人缘，亦须防感情纷扰');
  if(shaAll['华盖']) shaTend.push('华盖临局，主聪慧孤高、喜玄学技艺');
  // 文名/权威类神煞与"名利层级"模块同源（学堂/太极/将星/文昌）：bazi-data 的 shaAll 由 pillarSha 产出（缺学堂），
  // 这里直接用引擎 BZ.sha* 全量判断（与 bazi-core shaNames 同源），保证两节神煞清单一致。
  const _shaRaw=(BZ.shaYear||[]).concat(BZ.shaMonth||[],BZ.shaDay||[],BZ.shaTime||[]).map(s=>(s||'').replace(/（[^）]+）$/,''));
  const _shaHit=n=>_shaRaw.includes(n);
  if(_shaHit('文昌贵人')) shaTend.push('文昌贵人临局，主文思敏捷、利考学文名');
  if(_shaHit('学堂')) shaTend.push('学堂临局，主学养深厚、利文名');
  if(_shaHit('太极贵人')) shaTend.push('太极贵人临局，主悟性通达、利专业名望');
  if(_shaHit('将星')) shaTend.push('将星临局，增权威气象、主统御之才');
  const shaTendNote=shaTend.length?(' '+shaTend.join('；')+'。'):'';
  // 取格说明标签（详尽经典表述）：正格显示"月令X中Y本气透干/未透"；外格（专旺等）保留原名；无则不显示
  let geGanLabel='';
  if(geGan){
    if(geOuter) geGanLabel=`（${geGan}）`;
    else { const _tou=gans.includes(geGan); geGanLabel=`（月令${mz}中${geGan}${GAN_WX[geGan]}本气${_tou?'透干':'，未透'}）`; }
  }
  // ============ 顶层喜忌一致性回填============
  // 喜忌唯一真源 = synthesis（普通格=扶抑、外格=顺势）。下游各卡只读 synthesis / outer，不得再自判喜忌。
  const _xiEff=new Set(synthesis.xiWxEff||[]), _jiEff=new Set(synthesis.jiWxEff||[]);
  if(tiao){
    if(_jiEff.has(tiao.wx)) tiao.conflict='⚠调候用神“'+tiao.wx+'”为全局忌神，调候与喜忌相左，宜借岁运权衡，不可执一。';
    else if(_xiEff.has(tiao.wx)) tiao.conflict='调候用神与日主喜用一致，一物两用，最为得力。';
    else tiao.conflict='调候与喜忌无直接冲突，可并行。';
  }
  if(tong){
    const _mTend=_jiEff.has(tong.wx)?'但此通关恰为全局忌神，宜慎用或借岁运扶之':'且其五行正合日主喜用，一通百和';
    const _extra=(tong.note||'').match(/（另有相战：[^）]+）/g)||[];
    tong.note=`${tong.war}相战，取“${tong.wx}”通关（${(GAN_OF_WX[tong.wx]||[]).join('')}）；通关用神${tong.power}，${_mTend}。${_extra.join('')}`;
  }
  // 外格（专旺/从/两气/化气）：一气成势或化气成形，五行制衡的病药法不适用（制从神、逆专旺皆破格），
  // 只保留结构病药（刑冲害合），五行病药段改述顺势语义，避免"专旺水旺反称病"类自相矛盾。
  if(geOuter){
    bingYao.bing=null; bingYao.bingCnt=0; bingYao.yao=null;
    bingYao.yaoKind='外格顺其势，不取扶抑病药制衡';
    bingYao.note=`病药法（${geOuter}）：本命${geUse.xi?'喜 '+geUse.xi:'从势'}、${geUse.ji?'忌 '+geUse.ji:'顺化'}，一气成势，不取五行制衡为药；结构病药见下。`;
  }
  // 外格上下文（供命局断事/婚姻/健康等下游消费）：身弱语义、外格禁忌、喜忌集合一次给全
  const outer={
    isOuter: !!geOuter,
    type: geOuter||'',
    xiWx: synthesis.xiWxEff||[], jiWx: synthesis.jiWxEff||[],
    xiCatsEff: synthesis.xiCatsEff||[], jiCatsEff: synthesis.jiCatsEff||[],
    weakSemantics: geOuter
      ? (geOuter.indexOf('从')===0?'弃命相从，从神为贵，忌印比扶身破从'
         : geOuter.indexOf('化气')>=0?'化气成形，顺化神之势，忌印比扶身破化、克化神者损化'
         : geOuter==='两气成象'?'两气专凝，顺其气，忌杂入他行'
         : '一气专旺，顺其势，忌逆克（扶起日主则破）')
      : (weak?'身弱宜生扶（印比）以固本':'身强宜克泄耗以中和'),
    imprint: geOuter
      ? (geOuter.indexOf('从')===0||geOuter.indexOf('化气')>=0?'忌印比扶身'
         : geOuter==='两气成象'?'忌杂入他行'
         : '忌逆克专旺')
      : ''
  };
  // 顶层设计：用途句编译已上移（geUse 全部赋值完成后），此处直接返回结构化字段
  return {strength,strengthNote,score,cnt,fu,tiao,tong,geName,geGan,geGanLabel,geUse,geOuter,isZaGe,geOuterNote,geOuterDoubt,geQing,geLevel,geLevelNote,geSha,geShaNote,geYunNote,geZaGe,geZaGeNote,geZaGeAll,sanDe,quotes,scoreBasis:basis,subLing:sub.ling,subDi:sub.di,subShi:sub.shi,juScore,juLines:ju.lines,strengthRule,congC,bingYao,structDisease,structNote,specialStruct,xiWx,jiWx,synthesis,outer,muku:{list:mukuList,note:mukuNote,caiku:caiKuNote,kuTuShuo:kuTuShuo,caiKuZhi:caiKuZhi,caiKuWhere:caiKuWhere,caiKuKaihe:caiKuKaihe,caiKuBrief:caiKuBrief},changsheng:csNote,kongwang:kwNote,shaTend:shaTendNote};
}

/* ============ 岁运引动：从 lunar 库取大运序列（复用 buildYunData 的锚点步进避开首步空值） ============ */
function baziDaYunSteps(BZ){
  const yun=BZ.ec.getYun(BZ.sex);
  const dys=yun.getDaYun(11);                 // index 0 起运前，1~10 真实大运
  const _GAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const _ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const _gzIndex=gz=>{ for(let k=0;k<60;k++) if(_GAN[k%10]===gz[0]&&_ZHI[k%12]===gz[1]) return k; return 0; };
  let firstReal=dys.findIndex((d,i)=>i>0 && d.getGanZhi());
  if(firstReal<0) firstReal=1;
  /* 起运年龄统一虚岁口径：Yun.getStartYear() 是起运折算年数（6.9 年折为 7），
     虚岁 = 起运公历年 − 出生年 + 1（与 DaYun.getStartAge() 同口径，避免“起运前”步与大运步差 1 岁）。 */
  const _birthYear=BZ.birthYear||((BZ.lunar&&BZ.lunar.getSolar&&BZ.lunar.getSolar().getYear())||0);
  const _startSolar=(yun.getStartSolar&&yun.getStartSolar())||null;
  const startAge=(_startSolar&&_birthYear)?(_startSolar.getYear()-_birthYear+1):(yun.getStartYear&&yun.getStartYear())||0;
  const startYear=_startSolar?_startSolar.getYear():0;
  const startSolar=_startSolar?_startSolar.toYmd():'';
  const steps=[{idx:0, gz:'', gan:'', zhi:'', age:startAge, year:startYear, kind:'起运前'}];
  for(let i=firstReal;i<dys.length;i++){
    const dy=dys[i]; const gz=dy.getGanZhi(); if(!gz) continue;
    const age=(dy.getStartAge&&dy.getStartAge())||(startAge+(i-firstReal)*10);
    // 起始年用确定性的算术推导（起运年 + 步差×10），避免 lunar.js DaYun.getStartYear() 多次调用被惰性改写导致的整体偏移
    const year=startYear+(i-firstReal)*10;
    steps.push({idx:i, gz, gan:gz[0], zhi:gz[1], age, year, kind:'大运'});
  }
  return {start:{age:startAge, month:(yun.getStartMonth&&yun.getStartMonth())||0, solar:startSolar}, steps};
}

/* ============ 岁运引动：对每步大运(及可指定流年)干支分解五行，比合成用神喜忌，判吉凶与关键引动 ============ */
/* ============ 岁运引动：对单步(大运、流年)干支分解五行，比合成用神喜忌，判吉凶与关键引动 ============ */
function evalGZ(BZ, A, step){
  if(!step.gz) return {gz:'', kind:step.kind, age:step.age, year:step.year, empty:true};
  const xiEff=new Set(A.synthesis.xiWxEff), jiEff=new Set(A.synthesis.jiWxEff);
  const zhiWx=z=>GAN_WX[(HIDE[z]&&HIDE[z][0])||z];
  const xiZhiSet=new Set(BZ.zhis.filter(z=>xiEff.has(zhiWx(z))));
  const jiZhiSet=new Set(BZ.zhis.filter(z=>jiEff.has(zhiWx(z))));
  const ganAll=A.synthesis.gan.all||[];
  const PALACE=['年','月','日','时'];
  const g=step.gan, z=step.zhi;
  const added=[GAN_WX[g], ...(HIDE[z]||[z]).map(h=>GAN_WX[h])];   // 天干 + 地支本气、藏干
    let xiHits=0, jiHits=0;
    added.forEach(w=>{ if(xiEff.has(w)) xiHits++; if(jiEff.has(w)) jiHits++; });
    const keys=[];
    const dg=BZ.dayGan, dwx=GAN_WX[dg];
    if(ganAll.includes(g)) keys.push(`天干${g}（${GAN_WX[g]}）正为<span class="tip sha-ji">用神</span>天干，引动<span class="tip sha-ji">用神</span>透干力增`);
    const MU=['辰','戌','丑','未'];
    let muTouched=false;
    // 地支与命局各支的关系（冲、合/刑、害/破、暗合，并把墓库逢冲合标注为“库开”）
    BZ.zhis.forEach((pz,idx)=>{
      if(pz===z) return;
      if(pairIn(z,pz,DIZHI_CHONG)){
        const muAnno=(MU.includes(z)||MU.includes(pz))?'（墓库逢冲，库门洞开、所藏发动）':'';
        if(xiZhiSet.has(pz)) keys.push(`支${z}冲${PALACE[idx]}支${pz}（<span class="tip sha-ji">用神</span>之根），<span class="tip sha-ji">用神</span>根基动荡，宜合解${muAnno}`);
        else if(jiZhiSet.has(pz)) keys.push(`支${z}冲${PALACE[idx]}支${pz}（<span class="tip sha-xiong">忌神</span>之根），冲去<span class="tip sha-xiong">忌神</span>，反为去病之吉${muAnno}`);
        else keys.push(`支${z}冲${PALACE[idx]}支${pz}，主变动离散${muAnno}`);
        if(MU.includes(z)) muTouched=true;
      }
      if(pairIn(z,pz,DIZHI_HE6)){
        const hg=DIZHI_HE6.find(grp=>(grp[0]===z&&grp[1]===pz)||(grp[0]===pz&&grp[1]===z));
        const muAnno=(MU.includes(z)||MU.includes(pz))?'（墓库引动）':'';
        keys.push(`支${z}合${PALACE[idx]}支${pz}${hg&&hg[2]?('（合化'+hg[2]+'）'):''}${muAnno}`);
        if(MU.includes(z)) muTouched=true;
      }
      if(pairIn(z,pz,DIZHI_XING) && !pairIn(z,pz,DIZHI_CHONG)) keys.push(`支${z}刑${PALACE[idx]}支${pz}（${xingKindOf(z,pz)}），刑伤、是非、牵绊`);
      if(pairIn(z,pz,DIZHI_HAI)) keys.push(`支${z}害${PALACE[idx]}支${pz}，暗损、妨害`);
      if(pairIn(z,pz,DIZHI_PO)) keys.push(`支${z}破${PALACE[idx]}支${pz}，破坏、离散`);
      if(pairIn(z,pz,DIZHI_ANHE)) keys.push(`支${z}暗合${PALACE[idx]}支${pz}，暗中牵绊`);
    });
    // 三合、三会、半合、拱 引动（与曲线评分 step 9b 同口径）
    const triMap={'申子辰':'水','亥卯未':'木','寅午戌':'火','巳酉丑':'金'};
    for(const tri in triMap){
      if(tri.indexOf(z)>=0){
        const others=tri.split('').filter(c=>c!==z);
        if(others.every(c=>BZ.zhis.includes(c))){
          const w=triMap[tri];
          if(jiEff.has(w)) keys.push(`支${z}引动三合${w}局（<span class="tip sha-xiong">忌神</span>${w}聚会成势），库开则<span class="tip sha-xiong">忌神</span>显现`);
          else if(xiEff.has(w)) keys.push(`支${z}引动三合${w}局（<span class="tip sha-ji">用神</span>${w}聚会得力），大运助喜用`);
        } else if(others.filter(c=>BZ.zhis.includes(c)).length===1){
          const w=triMap[tri]; const ok=heHuaOK(w,BZ.gans,BZ.zhis,BZ.monthZ);
          if(ok){ if(jiEff.has(w)) keys.push(`支${z}半合、拱${w}局（<span class="tip sha-xiong">忌神</span>${w}化神显，岁运引动为病）`); else if(xiEff.has(w)) keys.push(`支${z}半合、拱${w}局（<span class="tip sha-ji">用神</span>${w}化神显，岁运引动则吉）`); }
        }
      }
    }
    // 墓库闭库、入墓（仅当该墓库支未与命局冲、合时补注）
    if(MU.includes(z) && !muTouched){
      const storeWx={'辰':'水','戌':'火','丑':'金','未':'木'}[z];
      const tou=(HIDE[z]||[]).some(h=>BZ.gans.includes(h));
      if(tou) keys.push(`支${z}（${storeWx}墓库）天干透出所藏，库开、所藏${storeWx}得用`);
      else if(storeWx===dwx) keys.push(`支${z}（${storeWx}墓库）闭库无冲、天干不透，日主${dg}（${dwx}）入墓，根气收藏偏弱`);
      else if(xiEff.has(storeWx)) keys.push(`支${z}（${storeWx}墓库）闭库，所藏<span class="tip sha-ji">用神</span>${storeWx}被收，待岁运冲开、透出方显`);
      else if(jiEff.has(storeWx)) keys.push(`支${z}（${storeWx}墓库）闭库，所藏<span class="tip sha-xiong">忌神</span>${storeWx}蓄藏，岁运冲开则忌发`);
      else keys.push(`支${z}（${storeWx}墓库）闭库静守`);
    }
    // 天干五合 / 天干冲 / 天克地冲（命局同干合并为“两X”一次述；天克地冲须遍历各同干位置找真实冲处）
    const ganSeen={};
    const ganCnt=pg=>BZ.gans.filter(x=>x===pg).length;
    const ganPl=pg=>ganCnt(pg)>1?('两'+pg):pg;
    BZ.gans.forEach((pg,idx)=>{
      const wa=GAN_WX[g], wb=GAN_WX[pg];
      const he=tianGanHe(g,pg);
      if(he && !ganSeen['he'+pg]){ ganSeen['he'+pg]=true; const ok=heHuaOK(he,BZ.gans,BZ.zhis,BZ.monthZ);
        keys.push(`天干${g}与${ganPl(pg)}${ok?('合化'+he):'合而不化（绊）'}，气机交合、羁绊`); }
      const tdc=(WX_KE[wa]===wb||WX_KE[wb]===wa) && pairIn(z,BZ.zhis[idx],DIZHI_CHONG);
      if(pairIn(g,pg,TIANGAN_CHONG) && !tdc && !ganSeen['ch'+pg]){ ganSeen['ch'+pg]=true; keys.push(`天干${g}与${ganPl(pg)}相冲，干头交战`); }
      if(tdc && !ganSeen['tdc'+pg]){ ganSeen['tdc'+pg]=true; keys.push(`天干${g}与${ganPl(pg)}相战，且支${z}成天克地冲，引动剧烈`); }
    });
    let rating = (jiHits===0&&xiHits>0)?'吉' : (xiHits===0&&jiHits>0)?'凶' : '平';
    /* keys 内含 HTML 标签，“用神”与“之根”之间夹着 </span>，故正则须容忍该标签，
       否则此降档规则永不触发（旧写法 /用神之根/ 即因此失效）。 */
    const chongXi=keys.some(k=>/用神(<\/span>)?之根/.test(k) && /根基动荡/.test(k));
    const quJi   =keys.some(k=>/去病之吉/.test(k));
    if(chongXi && (rating==='吉'||rating==='平')) rating='中';
    // 冲去忌神之根为“去病”：兼引动用神则上调为吉；纯助忌神而去病者，凶象减等为平
    if(!chongXi && quJi){
      if(rating==='平' && xiHits>0) rating='吉';
      else if(rating==='凶') rating='平';
    }
    const xiStr=(HIDE[z]||[z]).filter(h=>xiEff.has(GAN_WX[h])).map(h=>h+GAN_WX[h]).join(' ');
    const jiStr=(HIDE[z]||[z]).filter(h=>jiEff.has(GAN_WX[h])).map(h=>h+GAN_WX[h]).join(' ');
    const eff= xiHits>jiHits ? ('<span class="tip sha-ji">助喜用</span>（'+(xiStr||GAN_WX[g])+'）') : jiHits>xiHits ? ('<span class="tip sha-xiong">助忌神</span>（'+(jiStr||GAN_WX[g])+'）') : xiHits>0 ? ('<span class="tip sha-neutral">喜忌交参</span>（<span class="sha-axis">喜</span>'+(xiStr||GAN_WX[g])+' <span class="sha-axis">忌</span>'+(jiStr||GAN_WX[g])+'）') : '中性（不助不损）';
    // 天干亦助喜忌的纯文本说明：附于关键引动句（keys）末尾；地支藏干已含该天干字时不重复
    if(jiEff.has(GAN_WX[g]) && (jiStr||'').indexOf(g)<0) keys.push('天干'+g+'亦助忌神');
    else if(xiEff.has(GAN_WX[g]) && (xiStr||'').indexOf(g)<0) keys.push('天干'+g+'亦助喜用');
    // ===== 关键引动，生活模块含义：数据驱动，绑定命局已判结论，补机械干支动作未译之人事物 =====
    const lifeTrig=[];
    const tgSet=new Set([tenGod(dg,g)]); (HIDE[z]||[]).forEach(h=>tgSet.add(tenGod(dg,h)));
    const isMaleLocal=(BZ.sex===1||BZ.sex==='男'||BZ.sex===true);
    const SHENG={'木':'火','火':'土','土':'金','金':'水','水':'木'};
    const yinWx=Object.keys(SHENG).find(w=>SHENG[w]===dwx); // 生我=印星
    const shangWx=SHENG[dwx]; // 我生=食伤
    const wealthWx=WX_KE[dwx]; // 我克=财星
    const killWx=Object.keys(WX_KE).find(w=>WX_KE[w]===dwx); // 克我=官杀
    const caip= tgSet.has('正财')||tgSet.has('偏财');
    const guanp=tgSet.has('正官')||tgSet.has('七杀');
    const bijp= tgSet.has('比肩')||tgSet.has('劫财');
    const yinp= tgSet.has('正印')||tgSet.has('偏印');
    const shangp=tgSet.has('食神')||tgSet.has('伤官');
    // 人生阶段：依“该运起运年龄”过滤不合现实逻辑之模块（少年未立业、无婚育；晚年事业已退且长辈多不在）
    const age=step.age;
    const isChild=age<16;   // 童年少年期
    const isLate =age>=60;  // 晚年期
    // 学业（少年/青年进修期 <24 岁）：与事业同源十神、换学业语境；24 岁后由事业段承担
    const study=[];
    if(!isLate && age<24){
      if(age<7){   // 幼儿（<7）：无学业可言，只论成长发育（与 xuanji-lib baziInfant 同口径）
        study.push(jiEff.has(yinWx)?'宜养正、勿过虑':'身心成长顺、启蒙养正');
      } else {
        if(yinp)  study.push(jiEff.has(yinWx)?'印星为忌、思多行少、课业易滞':'印星得引，学业顺遂、师长提携、文书考试有利');
        if(shangp)study.push(jiEff.has(shangWx)?'食伤为忌、言动宜慎、易分心':'食伤得引，才艺表达、兴趣发展');
        if(guanp) study.push(jiEff.has(killWx)?'官杀为忌、课业压力大':'官杀得引，纪律自觉、升学节点可期');
        if(caip)  study.push(age<16?(jiEff.has(wealthWx)?'财星为忌、家计不宽、学业用度宜节':'财星得引，家资助力、学用无忧'):(jiEff.has(wealthWx)?'财星为忌、易分心外物、开销宜控':'财星得引，零用宽裕'));
        if(bijp)  study.push(jiEff.has(dwx)?'比劫为忌、同辈竞争、心神易分':'比劫得引，同学互助、竞争得胜');
      }
      if(study.length) lifeTrig.push('学业：'+study.join('；'));
    }
    // 事业财运：仅青壮年立业期（24–59 岁）；印星“长辈荫庇”亦仅此阶段成立
    const career=[];
    if(!isLate && age>=24){
      if(caip)  career.push(jiEff.has(wealthWx)?'财星得引却<span class="tip sha-xiong">为忌</span>，财来财去宜守':'财星得引，财运利好');
      if(guanp) career.push(jiEff.has(killWx)?'官杀得引却<span class="tip sha-xiong">为忌</span>，压力易增':'官杀得引，事业权贵有利');
      if(bijp)  career.push(jiEff.has(dwx)?'比劫夺财，钱财防散':'比劫帮扶，得同辈之助');
      if(yinp)  career.push(jiEff.has(yinWx)?'印旺<span class="tip sha-xiong">为忌</span>，思多行少':'印星生身，得长辈荫庇');
      if(shangp)career.push(jiEff.has(shangWx)?'食伤<span class="tip sha-xiong">为忌</span>，言动宜慎':'食伤泄秀，才华得展');
      if(career.length) lifeTrig.push('事业：'+career.join('；'));
    }
    // 婚姻感情：少年无解；晚年不谈婚恋机缘与桃花红鸾，仅留夫妻宫（伴侣/居处）变动
    const marry=[];
    if(!isChild){
      if(!isLate){
        if(isMaleLocal){ if(caip)  marry.push(jiEff.has(wealthWx)?'妻星（财星）得引却<span class="tip sha-xiong">为忌</span>，感情易生波':'妻星（财星）得引，婚恋机缘易动'); }
        else           { if(guanp) marry.push(jiEff.has(killWx)?'夫星（官杀）得引却<span class="tip sha-xiong">为忌</span>，感情易生波':'夫星（官杀）得引，婚恋机缘易动'); }
        if(pairIn(z,BZ.dayZ,DIZHI_CHONG)||pairIn(z,BZ.dayZ,DIZHI_HE6)) marry.push('夫妻宫动，感情易波动或有缘');
        const thZhi=[JU_OF[BZ.yearZ],JU_OF[BZ.dayZ]].map(ju=>ju&&TAOHUA[ju]).filter(Boolean);
        if(thZhi.indexOf(z)>=0) marry.push('桃花临运，情缘信号显露');
        if(HONGLUAN[BZ.yearZ]===z||HONGLUAN[BZ.dayZ]===z) marry.push('红鸾临运，婚喜易动');
      } else if(pairIn(z,BZ.dayZ,DIZHI_CHONG)||pairIn(z,BZ.dayZ,DIZHI_HE6)) {
        marry.push('夫妻宫动，晚景伴侣或居处易有变');
      }
      if(marry.length) lifeTrig.push('婚姻：'+marry.join('；'));
    }
    // 家庭子女：宫位取主流口径，年柱祖辈宫、月柱父母宫、时柱子女宫（年祖月父日妻时子）；
    // 子女宫/子女星（非童年、非晚年，免“添丁”之误）；儿童/青少年（<24 岁）家庭预判带“学业联动”：
    // 家宅不宁则学业心境受扰，家宅安宁则学业得靠；祖辈宫动亦影响家宅根基
    const fam=[];
    if(!isLate){
      const fBad=pairIn(z,BZ.zhis[1],DIZHI_CHONG)||pairIn(z,BZ.zhis[1],DIZHI_XING)||pairIn(z,BZ.zhis[1],DIZHI_HAI);
      const fGood=pairIn(z,BZ.zhis[1],DIZHI_HE6)||pairIn(z,BZ.zhis[1],DIZHI_ANHE);
      if(fBad) fam.push(age<24?(age<7?'父母宫动、家宅不宁，起居心绪宜安顿、宜安其心':'父母宫动、家宅不宁，学业心境易受扰、宜安其心'):'父母宫动，家宅易变动宜多沟通');
      else if(fGood) fam.push(age<24?(age<7?'父母宫合、家宅安宁，幼年安稳、成长顺遂':'父母宫合、家宅安宁，学业得靠、成长顺遂'):'父母宫合、家宅和睦，长辈助力顺');
      if(pairIn(z,BZ.zhis[0],DIZHI_CHONG)||pairIn(z,BZ.zhis[0],DIZHI_XING)||pairIn(z,BZ.zhis[0],DIZHI_HAI)) fam.push(isChild?'祖辈宫动、家宅根基有变，宜安其心':'祖辈宫动、祖荫家声有变，宜敬祖顾家');
    }
    if(!isChild){
      if(pairIn(z,BZ.zhis[3],DIZHI_CHONG)||pairIn(z,BZ.zhis[3],DIZHI_XING)) fam.push(isLate?'子女宫动，子女境缘易有变':'子女宫动，子女缘有波动、宜用心经营');
      const childWx=isMaleLocal?killWx:shangWx;
      if(!isLate && (isMaleLocal?guanp:shangp)) fam.push(jiEff.has(childWx)?'子女星得引却<span class="tip sha-xiong">为忌</span>，子女缘易生波折、宜用心维系':'子女星得引，子女缘厚易有添丁之喜');
    }
    if(fam.length) lifeTrig.push('家庭：'+fam.join('；'));
    // 性格健康：各年龄段皆相关；按喜忌引动多寡分主次，且织入该步引动字（数据驱动、逐层各异），避免好坏并列、逐层雷同
    const heal=[];
    if(xiHits>jiHits) heal.push((xiStr?xiStr.replace(/ /g,'、')+'引动，':'')+'身心得养，健康少扰');
    else if(jiHits>xiHits) heal.push((jiStr?jiStr.replace(/ /g,'、')+'引动，':'')+'<span class="tip sha-xiong">忌神</span>得势，健康宜调护');
    else if(xiHits>0) heal.push('喜忌相参，身心平稳、宜规律作息');
    if(YANGREN[dg]===z) heal.push('羊刃临运，防外伤血光');
    if(XUEREN[dg]===z) heal.push('血刃临运，防外伤血光');
    if(heal.length) lifeTrig.push('健康：'+heal.join('；'));
    return {gz:step.gz, gan:g, zhi:z, kind:step.kind, age:step.age, year:step.year, rating, eff, xiHits, jiHits, keys, lifeTrig};
}

function baziYunDong(BZ, A, dy, liuNianYear){
  const steps=dy.steps.map(s=>evalGZ(BZ,A,s));
  let liuNian=null;
  // 历史盘守卫：出生距今 >120 年（无"当前年份"概念）时不生成"当前流年"行，
  // 否则默认取今年（如 2026）对 570 年古人出"流年 2026"荒谬（1456 岁）。
  const _HIST = !(BZ.birthYear>0 && (new Date().getFullYear())-BZ.birthYear+1<=120);
  if(_HIST) return {start:dy.start, steps, liuNian};
  const ty=(typeof liuNianYear==='number')?liuNianYear:(new Date().getFullYear());
  try{
    /* 流年干支：以"立春"为干支年界（非公历元旦）。公历年 ty 的流年 = 该年立春后生效的干支，
       周期公式 (ty-4) mod 60 与 lunar.js getYearInGanZhi（立春感知）在 1900–2100 全区间一致。
       按立春界推算，1月（立春前）也给出与"年内主流年"一致的干支，避免跨年歧义。 */
    const gzLn=liunianGZ(ty);
    liuNian=Object.assign({year:ty}, evalGZ(BZ,A,{gz:gzLn, gan:gzLn[0], zhi:gzLn[1], age:ty-BZ.birthYear, year:ty, kind:'流年'}));
  }catch(e){}
  return {start:dy.start, steps, liuNian};
}
