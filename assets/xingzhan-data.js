/* 占星术 参考数据表 + 星历调用入口
   星历计算由 astronomy-engine（VSOP87，MIT）通过 xz-ephem.js 适配层提供，全部浏览器本地计算。
   本文件含：
   - 星座/守护星/元素/宫位含义/庙旺落陷/相位容许度/27宿/九曜大运 参考数据
   - 数学辅助（归一化/黄经取度/儒略日/上升点/岁差/庙旺落陷判定/整宫制/相位/Vimshottari）
   标注：所有结果为近似，落宫、相位 orb 采用常用容许度。 */

'use strict';

/* 角度原语 XZ_DEG、XZ_RAD 由 assets/xz-ephem.js 提供，本页加载顺序在前 */

/* ---------- 十二星座（西洋黄道，0°=白羊） ---------- */
const XZ_SIGNS = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
const XZ_SIGN_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const XZ_SIGN_EL = ['火','土','风','水','火','土','风','水','火','土','风','水']; // 元素
const XZ_SIGN_GLYPH = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const XZ_SIGN_KEY = {
  白羊:'开拓、冲动、自信、竞争力', 金牛:'稳定、务实、感官、固执',
  双子:'机变、沟通、好奇、善变', 巨蟹:'情感、守护、敏感、怀旧',
  狮子:'自我、领导、慷慨、爱表现', 处女:'分析、细致、服务、挑剔',
  天秤:'平衡、关系、审美、犹豫', 天蝎:'深刻、执念、洞察、隐秘',
  射手:'自由、探索、乐观、直率', 摩羯:'责任、自律、野心、保守',
  水瓶:'独立、革新、博爱、疏离', 双鱼:'浪漫、直觉、慈悲、迷离'
};
// 星座守护星（庙、本垣）
const XZ_SIGN_RULER = {
  白羊:'火星', 金牛:'金星', 双子:'水星', 巨蟹:'月亮', 狮子:'太阳', 处女:'水星',
  天秤:'金星', 天蝎:'火星', 射手:'木星', 摩羯:'土星', 水瓶:'土星', 双鱼:'木星'
};

/* 现代守护主（三王星发现后的补充归属），首位为定位星链的主定位星，次位为传统主 */
const XZ_SIGN_RULER_MODERN = {
  白羊:['火星'], 金牛:['金星'], 双子:['水星'], 巨蟹:['月亮'], 狮子:['太阳'], 处女:['水星'],
  天秤:['金星'], 天蝎:['冥王星','火星'], 射手:['木星'], 摩羯:['土星'], 水瓶:['天王星','土星'], 双鱼:['海王星','木星']
};

/* ---------- 核心解读具体化数据 ---------- */
// 十宫（官禄宫）落座的事业领域指向
const XZ_CAREER_FIELD = {
  白羊:'开创型与竞争型领域：销售、军警、体育、机械、创业',
  金牛:'资金与实物业：金融、财务、艺术、餐饮、奢侈品',
  双子:'信息流通业：传媒、写作、教学、交通、电商经纪',
  巨蟹:'民生与照护业：餐饮、地产家居、母婴、历史文保',
  狮子:'台前与权威岗：管理、演艺、创意、教育、珠宝',
  处女:'精细与技术岗：审计、医疗、编辑、数据分析、手艺',
  天秤:'协调与美业：法务、外交、公关、设计、贸易',
  天蝎:'深水与转化业：投行、保险、心理、研究、资源回收',
  射手:'跨境与推广业：外贸、出版、留学、法律、旅游',
  摩羯:'长线权威岗：政务、工程、制造、管理咨询、地产',
  水瓶:'科技与新潮业：互联网、科研、社群、航空、公益',
  双鱼:'灵感与疗愈业：影像、音乐、心理疗愈、慈善、航运'
};
// 星体落十宫的加成含义（key 对应 XZ_PLANETS.key）
const XZ_PLANET_IN10 = {
  sun:'主名望，易在台前或管理层获得认可',
  moon:'主口碑与流动性，事业易受大众情绪、家庭事务牵动',
  mercury:'主技艺与文教，宜策划、写作、中介、传播类',
  venus:'主人缘与审美，宜美业、艺术、公关与女性向市场',
  mars:'主开拓与竞争，宜攻坚岗、工程、销售与技术一线',
  jupiter:'主机遇，易得贵人提携、升迁较快',
  saturn:'主沉淀，起步慢但根基稳，大器晚成',
  uranus:'主创新，宜科技、新兴行业或自由职业',
  neptune:'主理想，宜影像、艺术、疗愈与公益方向',
  pluto:'主权力与整合，宜金融、研究、资源掌控类'
};
// 金星落座的吸引方式（月亮火星落座亦借用其直白特质）
const XZ_LOVE_STYLE = {
  白羊:'直球热烈，喜欢就行动，易一见钟情',
  金牛:'慢热专一，以陪伴和实际付出表达心意',
  双子:'重交流与趣味，喜欢聊得来的人',
  巨蟹:'重安全感，倾向彼此照顾、建立家庭',
  狮子:'重仪式感，喜欢大方直接的表达与被欣赏',
  处女:'细水长流，以服务和细节表达在意',
  天秤:'重和谐体面，欣赏有品味、懂分寸的人',
  天蝎:'爱得深且专，感情浓度与占有欲都强',
  射手:'重自由，喜欢能一起玩、一起冒险的人',
  摩羯:'慢热长情，先观察考量再投入',
  水瓶:'重精神共鸣，先做朋友再谈感情',
  双鱼:'浪漫理想化，容易共情与心软'
};
// 七宫（夫妻宫）落座的伴侣画像
const XZ_PARTNER = {
  白羊:'果断直率、行动快，相处节奏偏快',
  金牛:'稳重务实、可靠，关系进展偏慢',
  双子:'健谈灵活、消息灵通，相处轻松不黏腻',
  巨蟹:'顾家敏感、重视情绪回应',
  狮子:'体面大气、有主见，存在感强',
  处女:'细致挑剔、能照顾生活细节',
  天秤:'温和有礼、讲究相处分寸',
  天蝎:'深沉专注、感情浓度高',
  射手:'开朗爱自由、见多识广',
  摩羯:'自律踏实、责任感重',
  水瓶:'独立有趣、思维不落俗套',
  双鱼:'温柔体贴、感性包容'
};
// 二宫（财帛宫）落座的进财方式
const XZ_WEALTH = {
  白羊:'凭冲劲抢机会，来钱快、花得也快',
  金牛:'稳收慢蓄，工资与固定资产是主力',
  双子:'多渠道灵活收入，副业与信息差变现',
  巨蟹:'积攒置产，钱多流向家庭与房产',
  狮子:'高进高出，赚钱与排场成正比',
  处女:'精算细管，储蓄率与预算意识强',
  天秤:'合伙与分成，人脉直接带来收入',
  天蝎:'深水财，善用他人资金与杠杆',
  射手:'外向财，异地、跨境与推广收入',
  摩羯:'长线积累，越往后越厚',
  水瓶:'新兴渠道，科技与社群变现',
  双鱼:'收入波动大，宜固定储蓄兜底'
};
// 星座对应的身体部位（医疗占星传统对应）
const XZ_BODY = {
  白羊:'头部、面部', 金牛:'颈、咽喉、甲状腺', 双子:'手臂、肩、肺与支气管',
  巨蟹:'胸、胃', 狮子:'心脏、脊背', 处女:'肠道、消化系统',
  天秤:'腰、肾、皮肤', 天蝎:'泌尿与生殖系统', 射手:'髋、大腿、坐骨神经',
  摩羯:'膝、骨、关节', 水瓶:'小腿、踝、循环系统', 双鱼:'足部、淋巴、免疫'
};
// 上升元素的体质基调
const XZ_EL_HEALTH = {
  火:'代谢偏旺，怕热易燥，炎症与劳损来得快去得也快',
  土:'骨架肌肉是底子，耐受力强但易僵滞、代谢偏慢',
  风:'神经系统敏感，易过劳失眠，呼吸系统先报警',
  水:'情绪与内分泌联动，压力大易水肿，免疫力随情绪起伏'
};

/* ---------- 星座档案（出生星座速览） ---------- */
/* 星座四元素总述 */
const XZ_EL_TRAIT = {
  火:'热情、行动、直觉：行动力强、乐观自信，急躁冲动、缺乏耐心',
  土:'务实、稳定、落地：稳重可靠、执行力强，固执保守、缺乏弹性',
  风:'思维、沟通、社交：聪明灵活、善于表达，善变疏离、想多做少',
  水:'情感、直觉、共情：敏感体贴、富有创意，情绪化、优柔寡断'
};
/* 阴阳极性：阳性主动外向，阴性被动内敛 */
const XZ_SIGN_POLAR = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];
/* 三态：开创始新局、固定守成、变动应变 */
const XZ_SIGN_MODAL = ['开创','固定','变动','开创','固定','变动','开创','固定','变动','开创','固定','变动'];
/* 星座档案：守护星（古/今）、诞生石、幸运色、幸运数、幸运日、恋爱倾向、事业倾向、财运倾向、最佳配对、挑战配对 */
const XZ_SIGN_PROFILE = {
  白羊:{ruler:'火星（古今同）', birth:'钻石', color:'红', num:'1、9', day:'星期二',
    love:'爱得热烈直接，喜欢就表白，享受追求的过程，需要一个尊重其独立的伴侣，学着配合对方的节奏是长期课题',
    work:'天生领导型，快思考、行动导向，抗压能力强，管理、体育、创业是自然归宿',
    money:'赚得到也花得快，活在当下少想明天，好在总有办法把花掉的钱补回来，财来财去宜定投兜底',
    best:'狮子、射手', hard:'巨蟹、摩羯'},
  金牛:{ruler:'金星（古今同）', birth:'祖母绿', color:'绿、粉', num:'2、6、9', day:'星期一、五',
    love:'慢热专一，以陪伴和实际付出表达心意，认定后极为忠诚，感官与安全感的稳定供给是关系底座',
    work:'耐心细致、执行力强，宜需要长期投入的领域：财务、艺术、餐饮、园艺、实业经营',
    money:'善积累重储蓄，收入稳、消费克制，适合置产与长线投资，财富如土地般慢慢变厚',
    best:'处女、摩羯', hard:'狮子、水瓶'},
  双子:{ruler:'水星（古今同）', birth:'珍珠', color:'浅绿、黄', num:'5、7、14、23', day:'星期三',
    love:'重交流与趣味，聊得来是第一吸引力，需要心智刺激与新鲜感，感情易起于话题也需防散于话题',
    work:'信息处理与表达天赋，宜传媒、写作、教学、销售、经纪等流动性行业，一心多用是优势',
    money:'多渠道灵活收入，副业与信息差变现是强项，开销散碎但来路也多，宜做预算归集',
    best:'天秤、水瓶', hard:'处女、双鱼'},
  巨蟹:{ruler:'月亮（古今同）', birth:'红宝石', color:'白、银', num:'2、3、15、20', day:'星期一、四',
    love:'重安全感与情绪回应，倾向彼此照顾、以家庭为归宿，付出细腻但需对方给足确定性',
    work:'照护与经营直觉，宜餐饮、地产家居、母婴、历史文保、团队后勤，把人安顿好就是本事',
    money:'积攒置产，钱多流向家庭与房产，储蓄习惯好，情绪化消费是唯一漏洞',
    best:'天蝎、双鱼', hard:'白羊、天秤'},
  狮子:{ruler:'太阳（古今同）', birth:'橄榄石', color:'金、黄、橙', num:'1、3、10、19', day:'星期日',
    love:'重仪式感与被欣赏，爱得大方坦荡、存在感强，需要崇拜也愿意保护，给足面子则忠心不二',
    work:'台前与权威气质，宜管理、演艺、创意、教育、珠宝等能被看见的领域，天生自带舞台',
    money:'高进高出，赚钱与排场成正比，舍得为体面与体验付费，宜设上限防过度消费',
    best:'白羊、射手', hard:'天蝎、金牛'},
  处女:{ruler:'水星（古今同）', birth:'蓝宝石', color:'灰、米、淡黄', num:'5、14、15、23', day:'星期三',
    love:'细水长流，以服务和细节表达在意，挑剔背后是认真，被理解了就非常可靠',
    work:'分析与技艺天赋，宜审计、医疗、编辑、数据分析、手艺等精细岗，流程与质量意识一流',
    money:'精算细管，储蓄率与预算意识强，花钱讲性价比，宜用记账把长处发挥到极致',
    best:'金牛、摩羯', hard:'双子、射手'},
  天秤:{ruler:'金星（古今同）', birth:'蛋白石', color:'粉、浅蓝', num:'4、6、13、15、24', day:'星期五',
    love:'重和谐体面，欣赏有品味、懂分寸的人，怕冲突而回避表态，学会直面分歧是关系进阶课',
    work:'协调与审美天赋，宜法务、外交、公关、设计、贸易，一人撑起一桌平衡',
    money:'合伙与分成，人脉直接带来收入，审美也能变现，犹豫不决误时机是主要损耗',
    best:'双子、水瓶', hard:'摩羯、巨蟹'},
  天蝎:{ruler:'冥王星（传统火星）', birth:'黄玉', color:'深红、暗紫', num:'8、11、18、22', day:'星期二',
    love:'爱得深且专，感情浓度与占有欲都强，信任建立慢、一旦交心不轻改，忌试探与控制',
    work:'深水与转化能力，宜投行、保险、心理、研究、资源回收等需要穿透力的行业',
    money:'深水财，善用他人资金与杠杆，洞察力带来别人拿不到的机会，忌赌性与孤注',
    best:'巨蟹、双鱼', hard:'狮子、水瓶'},
  射手:{ruler:'木星（古今同）', birth:'绿松石', color:'紫、深蓝', num:'3、7、9、12、21', day:'星期四',
    love:'重自由，喜欢能一起玩、一起冒险的人，直率坦诚但怕被束缚，需要同行的独立者',
    work:'跨境与推广天赋，宜外贸、出版、留学、法律、旅游，视野与乐观是最好的名片',
    money:'外向财，异地、跨境与推广收入，钱随行动流动，宜留基础盘防大起大落',
    best:'白羊、狮子', hard:'处女、双鱼'},
  摩羯:{ruler:'土星（古今同）', birth:'石榴石', color:'棕、深灰', num:'4、8、13、22', day:'星期六',
    love:'慢热长情，先观察考量再投入，承诺即负责，表达含蓄需对方读到行动里的心意',
    work:'长线权威气质，宜政务、工程、制造、管理咨询、地产，时间越久壁垒越厚',
    money:'长线积累，越往后越厚，消费务实克制，宜早做养老与资产配置',
    best:'金牛、处女', hard:'白羊、天秤'},
  水瓶:{ruler:'天王星（传统土星）', birth:'紫水晶', color:'蓝、银', num:'4、7、11、22、29', day:'星期六',
    love:'重精神共鸣，先做朋友再谈感情，独立不黏腻，需要保持各自空间的同伴式关系',
    work:'科技与新潮嗅觉，宜互联网、科研、社群、航空、公益，越前沿越有主场感',
    money:'新兴渠道，科技与社群变现，收入模式常不循常规，宜保留一条稳定现金流',
    best:'双子、天秤', hard:'金牛、天蝎'},
  双鱼:{ruler:'海王星（传统木星）', birth:'海蓝宝', color:'淡紫、水蓝', num:'3、9、12、15、18、24', day:'星期四',
    love:'浪漫理想化，容易共情与心软，爱里自带滤镜，需要学会分辨浪漫与现实的边界',
    work:'灵感与疗愈天赋，宜影像、音乐、心理疗愈、慈善、航运，直觉常比数据准',
    money:'收入波动大，随灵感与状态起伏，宜固定储蓄与自动扣款兜底，防心软借贷',
    best:'巨蟹、天蝎', hard:'双子、射手'}
};
const XZ_HOUSE_MEAN = {
  1:'命宫，自我、外貌、气质、人生起点',
  2:'财帛宫，财富、价值观、才艺与正财',
  3:'兄弟宫，沟通、手足、短途、基础教育',
  4:'田宅宫，家庭、根基、父母、不动产',
  5:'子女宫，恋爱、创造力、子女、娱乐',
  6:'健康宫，日常工作、健康、服务、琐碎',
  7:'夫妻宫，婚姻、合伙、公开的对手',
  8:'偏财宫，危机、深层转化、他人资源',
  9:'迁移宫，远行、高教、信仰、法律',
  10:'官禄宫，事业、社会成就、名声',
  11:'福德宫，朋友、社群、愿望、偏财',
  12:'玄秘宫，潜意识、隐秘、孤独、终结'
};

/* ---------- 十大星体 ---------- */
const XZ_PLANETS = [
  {key:'sun', name:'太阳', glyph:'☉', cn:'太阳'},
  {key:'moon', name:'月亮', glyph:'☽', cn:'月亮'},
  {key:'mercury', name:'水星', glyph:'☿', cn:'水星'},
  {key:'venus', name:'金星', glyph:'♀', cn:'金星'},
  {key:'mars', name:'火星', glyph:'♂', cn:'火星'},
  {key:'jupiter', name:'木星', glyph:'♃', cn:'木星'},
  {key:'saturn', name:'土星', glyph:'♄', cn:'土星'},
  {key:'uranus', name:'天王星', glyph:'♅', cn:'天王星'},
  {key:'neptune', name:'海王星', glyph:'♆', cn:'海王星'},
  {key:'pluto', name:'冥王星', glyph:'♇', cn:'冥王星'}
];

/* ---------- 庙旺落陷（西洋古典，本垣、旺/弱、落） ---------- */
const XZ_DIGNITY = {
  sun:    {dom:['狮子'],            exa:'白羊', det:['水瓶'],          fal:'天秤'},
  moon:   {dom:['巨蟹'],            exa:'金牛', det:['摩羯'],          fal:'天蝎'},
  mercury:{dom:['双子','处女'],     exa:'处女', det:['射手','双鱼'],    fal:'双鱼'},
  venus:  {dom:['金牛','天秤'],     exa:'双鱼', det:['白羊','天蝎'],    fal:'处女'},
  mars:   {dom:['白羊','天蝎'],     exa:'摩羯', det:['天秤','金牛'],    fal:'巨蟹'},
  jupiter:{dom:['射手','双鱼'],     exa:'巨蟹', det:['双子','处女'],    fal:'摩羯'},
  saturn: {dom:['摩羯','水瓶'],     exa:'天秤', det:['巨蟹','狮子'],    fal:'白羊'},
  uranus: {dom:['水瓶'],            exa:'天蝎', det:['狮子'],          fal:'金牛'},
  neptune:{dom:['双鱼'],            exa:'狮子', det:['处女'],          fal:'水瓶'},
  pluto:  {dom:['天蝎'],            exa:'处女', det:['金牛'],          fal:'双鱼'}
};

/* ---------- 相位 ---------- */
const XZ_ASPECTS = [
  {name:'合', en:'Conjunction', angle:0,   orb:8},
  {name:'六合', en:'Sextile',    angle:60,  orb:5},
  {name:'刑', en:'Square',       angle:90,  orb:6},
  {name:'三合', en:'Trine',      angle:120, orb:6},
  {name:'冲', en:'Opposition',   angle:180, orb:8}
];
/* 相位容许度（度）：以 XZ_ASPECTS 的 orb 为基准，按两端星体性质调整。
   发光体（太阳、月亮）视直径大，合冲放大 2 度、其余相位放大 1 度；
   轴点（上升、中天）是几何点而非星体，只认合、刑、冲三类硬相位，且容许度收紧。
   本命盘、行运盘、运势评分三处的相位判定共用此函数。 */
const XZ_ORB_LUMINARY = {sun:1, moon:1};
const XZ_ORB_AXIS = {合:5, 刑:4, 冲:5};
function xz_orbOf(type, kA, kB){
  const axis = kA === 'asc' || kA === 'mc' || kA === 'dsc' || kB === 'asc' || kB === 'mc' || kB === 'dsc';
  if(axis) return XZ_ORB_AXIS[type] || 0;
  const luminary = XZ_ORB_LUMINARY[kA] || XZ_ORB_LUMINARY[kB];
  const asp = XZ_ASPECTS.find(a => a.name === type);
  if(!asp) return 0;
  return asp.orb + (luminary ? (type === '合' || type === '冲' ? 2 : 1) : 0);
}
/* 两黄经之间的相位：命中返回相位类型、偏差与紧密余量，未命中返回 null。
   容许度统一由 xz_orbOf 决定，返回 0 的相位类型（如轴点的三合、六合）直接跳过。 */
function xz_aspectBetween(lonA, lonB, kA, kB){
  let diff = Math.abs(xz_norm360(lonA - lonB));
  if(diff > 180) diff = 360 - diff;
  for(const asp of XZ_ASPECTS){
    const orb = xz_orbOf(asp.name, kA, kB);
    if(orb <= 0) continue;
    const dd = Math.abs(diff - asp.angle);
    if(dd <= orb)
      return {type:asp.name, en:asp.en, orb:+(diff - asp.angle).toFixed(2), exact:+(orb - dd).toFixed(1)};
  }
  return null;
}
const XZ_ASPECT_KEY = {
  合:'聚焦、强化', 六合:'机遇、和谐', 刑:'张力、挑战', 三合:'顺畅、天赋', 冲:'对立、拉扯'
};

/* ---------- Vimshottari（印度占星 120 年大运） ---------- */
const XZ_DASHA_SEQ = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const XZ_DASHA_YEARS = {Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17};
const XZ_NAV_GRAHA = {Ketu:'计都', Venus:'金星', Sun:'太阳', Moon:'月亮', Mars:'火星', Rahu:'罗睺', Jupiter:'木星', Saturn:'土星', Mercury:'水星'};
// 27 宿（由白羊 0° 起算，每宿 13°20′）及其主曜
const XZ_NAKSHATRA = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const XZ_NAK_NAME = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

/* 九曜（Navagraha）：七曜加罗睺、计都两交点为一套体系；与十大星体（含天王海王冥王）各自独立 */
const XZ_NAV_KEYS = ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'];
const XZ_NAV_NAME = {sun:'太阳', moon:'月亮', mars:'火星', mercury:'水星', jupiter:'木星', venus:'金星', saturn:'土星', rahu:'罗睺', ketu:'计都'};

/* 27 宿详情：汉名、守护神、象征、宿性 Gana、四 Pada 姓名首音节、义涵。
   汉名为与印度 27 宿起点对应的中国二十八宿通行对译；Gana 分天神(Deva)、人(Manushya)、阿修罗(Rakshasa)。
   Nadi（风量/火量/水量）各派口传不一，本表不列，以免给出不确数据。 */
const XZ_NAK_INFO = [
  {cn:'娄宿', deva:'双马神童 Ashwini Kumaras', sym:'马头', gana:'天神', pada:['Chu','Che','Cho','La'], mean:'行动迅捷，善开启，宜急事与医事'},
  {cn:'胃宿', deva:'阎摩 Yama', sym:'女阴', gana:'人', pada:['Li','Lu','Le','Lo'], mean:'承载与约束，含取舍与蜕变之象'},
  {cn:'昴宿', deva:'火神 Agni', sym:'火焰剃刀', gana:'阿修罗', pada:['A','I','U','E'], mean:'锐利灼炼，意志坚强，宜断不宜拖'},
  {cn:'毕宿', deva:'梵天 Brahma', sym:'牛车', gana:'人', pada:['O','Va','Vi','Vu'], mean:'滋长丰美，重安稳与感官之享受'},
  {cn:'觜宿', deva:'月神 Soma', sym:'鹿头', gana:'天神', pada:['Ve','Vo','Ka','Ke'], mean:'寻索探求，好奇善变，心思活跃'},
  {cn:'参宿', deva:'鲁陀罗 Rudra', sym:'泪滴', gana:'人', pada:['Ku','Gha','Ng','Chha'], mean:'破而后立，情绪激烈，宜疏导转化'},
  {cn:'井宿', deva:'阿底提 Aditi', sym:'弓与箭袋', gana:'天神', pada:['Ke','Ko','Ha','Hi'], mean:'复归更新，能失而复得，宜重建'},
  {cn:'鬼宿', deva:'祭主 Brihaspati', sym:'花环', gana:'天神', pada:['Hu','He','Ho','Da'], mean:'滋养守护，最为吉祥，宜教养积蓄'},
  {cn:'柳宿', deva:'蛇神 Naga', sym:'盘蛇', gana:'阿修罗', pada:['Di','Du','De','Do'], mean:'缠缚深入，洞察力强，宜防执念'},
  {cn:'星宿', deva:'祖灵 Pitrs', sym:'王座', gana:'阿修罗', pada:['Ma','Mi','Mu','Me'], mean:'承继祖荫，重名位与家族传承'},
  {cn:'张宿', deva:'跋伽 Bhaga', sym:'床榻', gana:'人', pada:['Mo','Ta','Ti','Tu'], mean:'欢爱享乐，重情致与创造力'},
  {cn:'翼宿', deva:'阿厘耶摩 Aryaman', sym:'床榻', gana:'人', pada:['Te','To','Pa','Pi'], mean:'契约合作，宜结盟与长期承诺'},
  {cn:'轸宿', deva:'娑维德利 Savitr', sym:'手掌', gana:'天神', pada:['Pu','Sha','Na','Tha'], mean:'巧手成事，技艺精纯，宜实干'},
  {cn:'角宿', deva:'毗首羯磨 Vishvakarma', sym:'珍宝', gana:'阿修罗', pada:['Pe','Po','Ra','Ri'], mean:'华美构造，重形式与设计感'},
  {cn:'亢宿', deva:'风神 Vayu', sym:'嫩芽', gana:'天神', pada:['Ru','Re','Ro','Ta'], mean:'独立自由，随风而动，宜自主'},
  {cn:'氐宿', deva:'因陀罗与火神 Indra-Agni', sym:'拱门', gana:'阿修罗', pada:['Ti','Tu','Te','To'], mean:'目标执着，攻势强，宜专一志'},
  {cn:'房宿', deva:'密特拉 Mitra', sym:'莲花', gana:'天神', pada:['Na','Ni','Nu','Ne'], mean:'忠信结群，贵人缘厚，宜协作'},
  {cn:'心宿', deva:'因陀罗 Indra', sym:'耳环', gana:'阿修罗', pada:['No','Ya','Yi','Yu'], mean:'居长掌权，锋芒外露，宜守度'},
  {cn:'尾宿', deva:'尼利提 Nirriti', sym:'束根', gana:'阿修罗', pada:['Ye','Yo','Bha','Bhi'], mean:'拔根究底，破旧立新，宜溯源'},
  {cn:'箕宿', deva:'水神 Apas', sym:'象与扇', gana:'人', pada:['Bhu','Dha','Pha','Dha'], mean:'不可阻遏，信念坚定，宜远行'},
  {cn:'斗宿', deva:'诸天 Vishvedevas', sym:'象牙', gana:'人', pada:['Bhe','Bho','Ja','Ji'], mean:'终成正果，持久者胜，宜守成'},
  {cn:'牛宿', deva:'毗湿奴 Vishnu', sym:'耳', gana:'天神', pada:['Ju','Je','Jo','Ghi'], mean:'听闻学习，名声传布，宜受教'},
  {cn:'女宿', deva:'八婆苏 Vasus', sym:'鼓与笛', gana:'阿修罗', pada:['Ga','Gi','Gu','Ge'], mean:'声名与财，节奏感强，宜表现'},
  {cn:'虚宿', deva:'伐楼那 Varuna', sym:'空圆', gana:'阿修罗', pada:['Go','Sa','Si','Su'], mean:'孤高医理，隐秘探究，宜独处'},
  {cn:'危宿', deva:'独脚羊 Aja Ekapada', sym:'剑', gana:'人', pada:['Se','So','Da','Di'], mean:'烈火炼心，偏于极端，宜调节'},
  {cn:'室宿', deva:'深渊之蛇 Ahir Budhnya', sym:'双生', gana:'人', pada:['Du','Cha','Jna','Tra'], mean:'沉潜深厚，后发有力，宜积累'},
  {cn:'壁宿', deva:'普善 Pushan', sym:'鱼与鼓', gana:'天神', pada:['De','Do','Cha','Chi'], mean:'圆满收束，慈悲通达，宜收尾'}
];

/* 印度体系九曜尊贵：旺 exalt{星座,度数}、陷 debil、本垣 own[2]、本垣强位 mt{星座,起,止} */
const XZ_VEDIC_DIGNITY = {
  sun:     {exalt:['白羊',10], debil:['天秤',10], own:['狮子'], mt:['狮子',0,20]},
  moon:    {exalt:['金牛',3],  debil:['天蝎',3],  own:['巨蟹'], mt:['金牛',4,30]},
  mercury: {exalt:['处女',15], debil:['双鱼',15], own:['双子','处女'], mt:['处女',15,20]},
  venus:   {exalt:['双鱼',27], debil:['处女',27], own:['金牛','天秤'], mt:['天秤',0,15]},
  mars:    {exalt:['摩羯',28], debil:['巨蟹',28], own:['白羊','天蝎'], mt:['白羊',0,12]},
  jupiter: {exalt:['巨蟹',5],  debil:['摩羯',5],  own:['射手','双鱼'], mt:['射手',0,10]},
  saturn:  {exalt:['天秤',20], debil:['白羊',20], own:['摩羯','水瓶'], mt:['水瓶',0,20]},
  rahu:    {exalt:['金牛',20], debil:['天蝎',20], own:[], mt:null},
  ketu:    {exalt:['天蝎',20], debil:['金牛',20], own:[], mt:null}
};

/* =================== 数学辅助 =================== */
function xz_signIndex(lon){ return Math.floor(xz_norm360(lon) / 30); }
function xz_signName(lon){ return XZ_SIGNS[xz_signIndex(lon)]; }
function xz_degInSign(lon){ const n = xz_norm360(lon); return n - Math.floor(n/30)*30; }
function xz_fmtDeg(lon){
  const n = xz_norm360(lon);
  let d = Math.floor(n), m = Math.round((n - d) * 60);
  if(m === 60){ d += 1; m = 0; }
  d = d >= 360 ? 0 : d;
  return d + '°' + (m < 10 ? '0'+m : m) + '′';
}

/* =================== 儒略日 =================== */
function xz_jd(y, m, d, hh, mm, tz){
  let hour = hh + mm / 60 - tz; // 转为 UT 小时
  if(m <= 2){ y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  jd += hour / 24;
  return jd;
}

/* =================== 岁差 Lahiri ayanamsa =================== */
function xz_ayanamsa(jd){
  const y = 2000 + (jd - 2451545.0) / 365.25;
  return 23.854 + (y - 2000) * 0.01396; // 度
}

/* =================== 上升点（黄道：地平交线数值解） =================== */
function xz_ascendant(jd, lon, lat){
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T*T*T / 38710000;
  const lst = xz_norm360(gmst + lon);              // RAMC（度）
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const er = eps * XZ_DEG, fr = lat * XZ_DEG, lstR = lst * XZ_DEG;
  // 解析法求上升点（黄道与东方地平线交点＝上升 ASC），精度达机器级
  // 标准公式（Meeus）：tan(ASC) = cos(RAMC) / -( sin(RAMC)cosε + tanφsinε )
  //  => ASC = atan2( cos(RAMC), -( sin(RAMC)cosε + tanφsinε ) )，结果即黄道黄经，归一化 0..360
  const y = Math.cos(lstR);
  const x = -(Math.sin(lstR) * Math.cos(er) + Math.tan(fr) * Math.sin(er));
  const ascLon = xz_norm360(Math.atan2(y, x) * XZ_RAD);
  // 中天 MC：黄道与子午线交点，tan(MC) = tan(RAMC) / cosε
  const mcLon = xz_norm360(Math.atan2(Math.sin(lstR), Math.cos(lstR) * Math.cos(er)) * XZ_RAD);
  return {lon: ascLon, mc: mcLon, ramc: lst, eps};
}

/* =================== 庙旺落陷判定 =================== */
function xz_dignity(key, signName){
  const d = XZ_DIGNITY[key]; if(!d) return {level:'', note:''};
  const dom = Array.isArray(d.dom) ? d.dom : [d.dom];
  const det = Array.isArray(d.det) ? d.det : [d.det];
  if(dom.includes(signName)) return {level:'庙', note:'入本垣（庙旺），力量强、特质顺畅发挥'};
  if(signName === d.exa)    return {level:'旺', note:'入垣升殿（旺），天赋被放大、易得机遇'};
  if(det.includes(signName))return {level:'弱', note:'失势（弱），力量受阻、需后天努力'};
  if(signName === d.fal)    return {level:'落', note:'降卑（落），天赋打折、易有损耗'};
  return {level:'平', note:'游走（中和），无特殊尊贵，看相位与宫位'};
}

/* =================== 埃及界与 Chaldean 面 ===================
   界（terms）：每星座 30° 分五段，各段归一位界主；面（face）：每 10° 一段归一位面主，
   按 Chaldean 序自星座守护星起排。界主权重高于面主，与庙旺落陷合成综合尊贵。 */
const XZ_EGYPTIAN_BOUNDS = {
  '白羊': [[6,'木星'],[12,'金星'],[20,'水星'],[25,'火星'],[30,'土星']],
  '金牛': [[8,'金星'],[14,'水星'],[22,'木星'],[27,'土星'],[30,'火星']],
  '双子': [[6,'水星'],[12,'木星'],[17,'金星'],[24,'土星'],[30,'火星']],
  '巨蟹': [[7,'火星'],[13,'金星'],[19,'水星'],[26,'木星'],[30,'土星']],
  '狮子': [[6,'木星'],[11,'金星'],[18,'土星'],[24,'水星'],[30,'火星']],
  '处女': [[7,'水星'],[17,'金星'],[21,'木星'],[28,'火星'],[30,'土星']],
  '天秤': [[6,'土星'],[14,'水星'],[21,'木星'],[28,'金星'],[30,'火星']],
  '天蝎': [[7,'火星'],[11,'金星'],[19,'水星'],[24,'木星'],[30,'土星']],
  '射手': [[12,'木星'],[17,'金星'],[21,'水星'],[26,'土星'],[30,'火星']],
  '摩羯': [[7,'水星'],[14,'木星'],[21,'金星'],[26,'土星'],[30,'火星']],
  '水瓶': [[7,'水星'],[13,'金星'],[20,'木星'],[25,'火星'],[30,'土星']],
  '双鱼': [[12,'金星'],[16,'木星'],[19,'水星'],[28,'火星'],[30,'土星']]
};
const XZ_CHALDEAN_FACE = {
  '白羊': ['火星','太阳','金星'], '金牛': ['水星','月亮','土星'],
  '双子': ['木星','火星','太阳'], '巨蟹': ['金星','水星','月亮'],
  '狮子': ['土星','木星','火星'], '处女': ['太阳','金星','水星'],
  '天秤': ['月亮','土星','木星'], '天蝎': ['火星','太阳','金星'],
  '射手': ['水星','月亮','土星'], '摩羯': ['木星','火星','太阳'],
  '水瓶': ['金星','水星','月亮'], '双鱼': ['土星','木星','火星']
};
function xz_boundsFace(lonT){
  const n = xz_norm360(lonT);
  const signName = XZ_SIGNS[Math.floor(n / 30)];
  const deg = n % 30;
  let boundLord = '';
  for(const seg of (XZ_EGYPTIAN_BOUNDS[signName] || [])){
    if(deg < seg[0]){ boundLord = seg[1]; break; }
  }
  const faces = XZ_CHALDEAN_FACE[signName] || [];
  const faceLord = faces[Math.min(2, Math.floor(deg / 10))] || '';
  return {signName, deg, boundLord, faceLord};
}
/* 综合尊贵：庙旺落陷为体，落本界加二分，落本面加一分，失势降卑扣分 */
function xz_totalDignity(key, signName, lonT, planetName){
  const base = xz_dignity(key, signName);
  const bf = xz_boundsFace(lonT);
  let score = 0;
  if(base.level === '庙') score += 5;
  else if(base.level === '旺') score += 4;
  else if(base.level === '弱') score -= 5;
  else if(base.level === '落') score -= 4;
  const selfBound = bf.boundLord === planetName;
  const selfFace = bf.faceLord === planetName;
  if(selfBound) score += 2;
  if(selfFace) score += 1;
  const bSeg = selfBound ? '界主即自身（落本界），细部力量加成' : `界主${bf.boundLord}`;
  const fSeg = selfFace ? '面主亦即自身（落本面），辅位小贵' : `面主${bf.faceLord}`;
  const tail = (selfBound || selfFace) ? '' : '，细部归他星管辖';
  return {level: base.level, note: base.note + '；' + bSeg + '、' + fSeg + tail,
          score, boundLord: bf.boundLord, faceLord: bf.faceLord, selfBound, selfFace};
}

/* =================== 定位星链 ===================
   每颗行星所在星座的守护星即其定位星，沿主定位星（现代主首位）递归，
   直到某星自身即其所在星座的守护星（最终定位星）；链回到已访问之星则为环。 */
function xz_dispositorChain(planets){
  const nameToKey = {};
  for(const p of XZ_PLANETS) nameToKey[p.name] = p.key;
  const out = {};
  for(const p of XZ_PLANETS){
    const pl = planets[p.key];
    const rulers = XZ_SIGN_RULER_MODERN[pl.signT] || [XZ_SIGN_RULER[pl.signT]];
    const chain = [pl.name];
    let final = null, loop = false, self = false;
    if(rulers[0] === pl.name){
      self = true; final = pl.name;
    } else {
      const seen = new Set([pl.name]);
      let cur = rulers[0];
      while(true){
        if(seen.has(cur)){ loop = true; break; }
        seen.add(cur);
        chain.push(cur);
        const ck = nameToKey[cur];
        if(!ck) break;
        const cRulers = XZ_SIGN_RULER_MODERN[planets[ck].signT] || [XZ_SIGN_RULER[planets[ck].signT]];
        if(cRulers[0] === cur){ final = cur; break; }
        cur = cRulers[0];
      }
    }
    out[p.key] = {by: rulers[0], secondary: rulers[1] || '', chain, final, loop, self};
  }
  return out;
}

/* =================== 宫位制：整宫制 / Placidus =================== */
/* 整宫制：第 1 宫即上升点所在整个星座，宫头为星座边界（asc 星座 0° 起，每 30° 一宫） */
function xz_houseOf(lon, ascSignIdx){
  return ((xz_signIndex(lon) - ascSignIdx + 12) % 12) + 1;
}
/* Placidus 分宫：以中天 MC 与上升 ASC 为锚，把昼半弧/夜半弧按时间三等分求中间宫头。
   昼半弧 SA=90°+AD、夜半弧 SN=90°−AD，AD=asin(tanφ×tanδ)（升差，随宫头赤纬变化），
   因此每个宫头黄经须固定点迭代：RA←RAMC+f×SA（11/12 宫，东侧地平上）
   与 RA←RAMC+180°−g×SN（2/3 宫，东侧地平下），再由 RA 反解黄经，迭代至收敛。
   高纬 |tanφ×tanδ|≥1（极昼极夜 AD 无定义）或迭代不收敛时返回 null，调用方回退整宫制。 */
function xz_placidusCusps(ramcDeg, epsDeg, latDeg){
  const D = XZ_DEG, ramc = ramcDeg * D, ep = epsDeg * D, lat = latDeg * D;
  const cosE = Math.cos(ep), sinE = Math.sin(ep);
  const tanF = Math.tan(lat);
  if(!isFinite(tanF)) return null;
  const ra2lon = (ra) => {
    const n = ((ra % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.atan2(Math.sin(n), Math.cos(n) * cosE); // RA→黄经（β=0），cosE>0 保象限
  };
  /* 固定点迭代求单个宫头黄经（弧度）。upper=true 用昼半弧（11/12 宫），否则用夜半弧（2/3 宫）。 */
  function solve(f, upper){
    let ra = upper ? ramc + f * (Math.PI / 2) : ramc + Math.PI - f * (Math.PI / 2);
    for(let i = 0; i < 60; i++){
      const lon = ra2lon(ra);
      const sd = sinE * Math.sin(lon);
      if(sd > 1 || sd < -1) return null;
      const delta = Math.asin(sd);
      const arg = tanF * Math.tan(delta);
      if(arg > 1 || arg < -1) return null;
      const ad = Math.asin(arg);
      const raN = upper ? ramc + f * (Math.PI / 2 + ad) : ramc + Math.PI - f * (Math.PI / 2 - ad);
      if(Math.abs(raN - ra) < 1e-10){ ra = raN; break; }
      ra = raN;
    }
    return ra2lon(ra);
  }
  /* 宫头对应比例：11 宫距 MC 1/3 昼弧（RA=RAMC+SA/3）、12 宫 2/3；2 宫距 IC 2/3 夜弧、3 宫 1/3 */
  const h11 = solve(1 / 3, true);   // 11 宫头
  const h12 = solve(2 / 3, true);   // 12 宫头
  const h2 = solve(2 / 3, false);   // 2 宫头
  const h3 = solve(1 / 3, false);   // 3 宫头
  if(h11 == null || h12 == null || h2 == null || h3 == null) return null;
  return [h11, h12, h2, h3]; /* 弧度黄经，供组装 */
}
/* 整宫制 12 宫头黄经（度）：宫头即 ASC 所在星座边界（该星座 0° 起，每 30° 一宫），
   与 xz_houseOf 的星座偏移定位一致，仅提供统一的 cusps 数组形态供 xz_houseAt 使用 */
function xz_wholeCusps(ascLonDeg){
  const start = xz_signIndex(ascLonDeg) * 30;
  const cusps = [];
  for(let h = 0; h < 12; h++) cusps.push(xz_norm360(start + h * 30));
  return cusps;
}
/* 组装 12 宫头黄经（度，0..360）。入参为页面 asc 对象（含 lon/mc/ramc/eps）。 */
function xz_houseCusps(asc, latDeg){
  const mid = xz_placidusCusps(asc.ramc, asc.eps, latDeg);
  if(!mid) return null;
  const norm = xz_norm360;
  const [h11, h12, h2, h3] = mid.map(r => norm(r * XZ_RAD));
  const ac = norm(asc.lon), mc = norm(asc.mc);
  /* 宫位顺序（黄经逆时针）：1=ASC、2/3 向 IC、4=IC、5/6 向 DSC、7=DSC、8/9 向 MC、
     10=MC、11/12 向 ASC。5=11 对宫、6=12 对宫、8=2 对宫、9=3 对宫（各差 180°）。 */
  return [ac, h2, h3, norm(mc + 180), norm(h11 + 180), norm(h12 + 180),
          norm(ac + 180), norm(h2 + 180), norm(h3 + 180), mc, h11, h12];
}
/* 宫头黄经落座：整宫制返回宫头星座名；分宫制返回该宫头黄经所在星座 */
function xz_cuspSign(chart, houseNum){
  return XZ_SIGNS[xz_signIndex(chart.cusps[houseNum - 1])];
}
/* 行星按宫头区间定位（1..12）：以第 1 宫头为 0 基准展开 0..360 后查落在哪个宫段 */
function xz_houseAt(lonDeg, cusps){
  const base = cusps[0];
  let off = xz_norm360(lonDeg - base);
  for(let h = 0; h < 12; h++){
    const a = h === 0 ? 0 : xz_norm360(cusps[h] - base);
    const b = h === 11 ? 360 : xz_norm360(cusps[h + 1] - base);
    if(off >= a && off < b) return h + 1;
  }
  return 12; /* 数值边界：off 取 360 或落在末段开区间外时归入第 12 宫 */
}

/* =================== 主要相位 =================== */
function xz_aspects(longitudes){
  // 相位只取十大星体：罗睺、计都为月亮交点，不参与西洋相位
  const keys = XZ_PLANETS.map(p => p.key).filter(k => longitudes[k] != null);
  const res = [];
  for(let i = 0; i < keys.length; i++){
    for(let j = i + 1; j < keys.length; j++){
      const a = keys[i], b = keys[j];
      const hit = xz_aspectBetween(longitudes[a], longitudes[b], a, b);
      if(hit) res.push({a, b, type:hit.type, en:hit.en, orb:hit.orb, exact:hit.exact});
    }
  }
  res.sort((x,y) => y.exact - x.exact);
  return res;
}

/* =================== 星盘格局图形识别 =================== */
/* 基于主要相位表识别经典几何格局：大三角、T三角、大十字、风筝、Yod（上帝手指）、
   大六合（Grand Sextile）、神秘矩形（Mystic Rectangle）、星群。
   Yod 所需 150° 梅花角距在此独立计算（容差 3°），不并入主要相位表，不影响相位区块展示。
   大六合用 DFS 找 6 星闭环，神秘矩形由两组对冲对交叉四边（六合+三合）构成。
   弱格局若为强格局成员集的子集（大十字含 T三角、风筝含大三角）则跳过。 */
function xz_patterns(aspects, planets){
  const keys = XZ_PLANETS.map(p => p.key).filter(k => planets[k]);
  const lonOf = k => planets[k].lonT;
  // 两星角距（0..180，含环绕归一）
  const ang = (a, b) => {
    let d = Math.abs(xz_norm360(lonOf(a) - lonOf(b)));
    if(d > 180) d = 360 - d;
    return d;
  };
  // 相位邻接表：key -> [{other, type}]
  const adj = {};
  for(const k of keys) adj[k] = [];
  for(const a of aspects){
    adj[a.a].push({other: a.b, type: a.type});
    adj[a.b].push({other: a.a, type: a.type});
  }
  const has = (a, b, type) => adj[a].some(e => e.other === b && e.type === type);
  // 候选格局按强度分级：大十字 > 风筝 > 大三角/Yod > T三角 > 星群
  const cands = [];
  const names = ks => ks.map(k => XZ_PLANETS.find(p => p.key === k).name);
  const sig = ks => ks.slice().sort().join('|');

  // 大三角：三星两两三合（候选）
  for(let i = 0; i < keys.length; i++) for(let j = i + 1; j < keys.length; j++) for(let l = j + 1; l < keys.length; l++){
    const t = [keys[i], keys[j], keys[l]];
    if(has(t[0], t[1], '三合') && has(t[1], t[2], '三合') && has(t[0], t[2], '三合'))
      cands.push({name:'大三角', en:'Grand Trine', members:t, sig:sig(t), level:2,
        note:'三星两两三合，同一元素能量自洽循环，天赋顺畅但易安于现状'});
  }

  // T三角：对冲对 + 第三星与对冲两端均成刑（候选）
  for(const a of aspects) if(a.type === '冲'){
    for(const c of keys){
      if(c === a.a || c === a.b) continue;
      if(has(c, a.a, '刑') && has(c, a.b, '刑')){
        const t = [a.a, a.b, c];
        cands.push({name:'T三角', en:'T-Square', members:t, sig:sig(t), level:1,
          note:'两端对冲、顶点星受双刑，张力集中于顶点，是驱动行动与突破的紧张轴'});
      }
    }
  }

  // 大十字：两组对冲对，四条交叉边均为刑（候选，最强）
  const opps = aspects.filter(a => a.type === '冲');
  for(let i = 0; i < opps.length; i++) for(let j = i + 1; j < opps.length; j++){
    const s1 = [opps[i].a, opps[i].b], s2 = [opps[j].a, opps[j].b];
    if(s1.some(k => s2.indexOf(k) >= 0)) continue;
    const cross = [[s1[0], s2[0]], [s1[0], s2[1]], [s1[1], s2[0]], [s1[1], s2[1]]];
    if(cross.every(c => has(c[0], c[1], '刑'))){
      const t = s1.concat(s2);
      cands.push({name:'大十字', en:'Grand Cross', members:t, sig:sig(t), level:4,
        note:'四星两两对冲、相邻互刑，四方张力均衡，需在多轴拉扯中寻得平衡'});
    }
  }

  // 风筝：大三角 + 第四星与其中一颗对冲、与另两颗六合（候选）
  const gts = cands.filter(c => c.name === '大三角');
  for(const gt of gts){
    for(const d of keys){
      if(gt.members.indexOf(d) >= 0) continue;
      for(let w = 0; w < 3; w++){
        const apex = gt.members[w], rest = gt.members.filter((_, x) => x !== w);
        if(has(d, apex, '冲') && rest.every(r => has(d, r, '六合'))){
          const t = gt.members.concat([d]);
          cands.push({name:'风筝', en:'Kite', members:t, sig:sig(t), level:3,
            note:'大三角之外第四星与顶点对冲、与底边六合，为顺流天赋提供对冲焦点与落地出口'});
        }
      }
    }
  }

  // Yod：两星六合为底，第三星与两者均约 150°，第三星为顶点（候选）
  for(let i = 0; i < keys.length; i++) for(let j = i + 1; j < keys.length; j++){
    if(!has(keys[i], keys[j], '六合')) continue;
    for(const c of keys){
      if(c === keys[i] || c === keys[j]) continue;
      const da = ang(c, keys[i]), db = ang(c, keys[j]);
      if(Math.abs(da - 150) <= 3 && Math.abs(db - 150) <= 3){
        const t = [keys[i], keys[j], c];
        cands.push({name:'Yod（上帝手指）', en:'Yod', members:t, sig:sig(t), level:2,
          note:'两星六合为底、顶点星受双梅花 150° 指向，顶点星是需反复调适的特殊使命点'});
      }
    }
  }

  // 大六合（Grand Sextile）：六星构成六合闭环，相邻星两两成六合（候选，level=3）
  // 用 DFS 找六合连通图，从中提取 6 星闭环
  const sextMembers = new Set();
  for(let i = 0; i < keys.length; i++) for(let j = i + 1; j < keys.length; j++)
    if(has(keys[i], keys[j], '六合')){ sextMembers.add(keys[i]); sextMembers.add(keys[j]); }
  const sextArr = [...sextMembers];
  if(sextArr.length >= 6){
    const sextAdj = {};
    for(const k of sextArr) sextAdj[k] = [];
    for(let i = 0; i < sextArr.length; i++) for(let j = i + 1; j < sextArr.length; j++)
      if(has(sextArr[i], sextArr[j], '六合')){ sextAdj[sextArr[i]].push(sextArr[j]); sextAdj[sextArr[j]].push(sextArr[i]); }
    // 从每个星开始 DFS 找 6 星闭环（不走回头路，路径须 φ=6 且首尾六合）
    const dfsRing = (start, cur, visited, path) => {
      if(path.length === 6){
        if(has(cur, start, '六合')) return [...path, start];
        return null;
      }
      for(const nb of sextAdj[cur]){
        if(visited.has(nb)) continue;
        visited.add(nb);
        const r = dfsRing(start, nb, visited, [...path, nb]);
        if(r) return r;
        visited.delete(nb);
      }
      return null;
    };
    const ringsSeen = new Set();
    for(const k of sextArr){
      const visited = new Set([k]);
      const ring = dfsRing(k, k, visited, [k]);
      if(ring){
        const sigR = ring.slice().sort().join('|');
        if(!ringsSeen.has(sigR)){
          ringsSeen.add(sigR);
          cands.push({name:'大六合', en:'Grand Sextile', members:ring, sig:sigR, level:3,
            note:'六星连环六合，能量流转圆融，是天赋最高的和谐格局，但易因太顺畅而少动力'});
        }
      }
    }
  }

  // 神秘矩形（Mystic Rectangle）：两组对冲对错位 60°，交叉四边中两六合、两三合（候选）
  // 判定：从冲相位表取两组无公共星的对冲对，s1 两端与 s2 两端交叉成边，
  // 其中一对对角边同为六合、另一对对角边同为三合（对角边同型 + 两型互补）
  for(let i = 0; i < opps.length; i++) for(let j = i + 1; j < opps.length; j++){
    const s1 = [opps[i].a, opps[i].b], s2 = [opps[j].a, opps[j].b];
    if(s1.some(k => s2.indexOf(k) >= 0)) continue;
    const t1 = has(s1[0], s2[0], '六合') && has(s1[1], s2[1], '六合');
    const t1b = has(s1[0], s2[0], '三合') && has(s1[1], s2[1], '三合');
    const t2 = has(s1[0], s2[1], '三合') && has(s1[1], s2[0], '三合');
    const t2b = has(s1[0], s2[1], '六合') && has(s1[1], s2[0], '六合');
    if((t1 && t2) || (t1b && t2b)){
      const t = s1.concat(s2);
      cands.push({name:'神秘矩形', en:'Mystic Rectangle', members:t, sig:sig(t), level:3,
        note:'两组对冲与两组六合、两组三合交织成矩形，在张弛之间形成可借势转换的天赋格局'});
    }
  }

  // 星群：同一星座（整宫制下亦即同宫）四星及以上（候选）
  const bySign = {};
  for(const k of keys){
    const s = planets[k].signT;
    (bySign[s] = bySign[s] || []).push(k);
  }
  for(const s in bySign){
    const g = bySign[s];
    if(g.length >= 4)
      cands.push({name:'星群', en:'Stellium', members:g, sig:sig(g), level:0,
        note:`${s}座内聚集${g.length}星，该星座与对应宫位成为全盘能量重心`});
  }

  // 按强度降序收录：成员集被更强格局完整覆盖的弱格局跳过，同型同组去重；
  // 同型多组（如同轴多顶点、或近轴多组 T三角）合并为一个条目，members 取并集，combos 记各组合供页面区分
  cands.sort((x, y) => y.level - x.level);
  const out = [];
  for(const c of cands){
    if(out.some(o => o.sig === c.sig || c.members.every(k => o.members.indexOf(k) >= 0))) continue;
    out.push(c);
  }
  const merged = {};
  const order = [];
  out.forEach(o => {
    if(!merged[o.name]){ merged[o.name] = {name:o.name, en:o.en, note:o.note, all:[], combos:[]}; order.push(o.name); }
    const m = merged[o.name];
    o.members.forEach(k => { if(m.all.indexOf(k) < 0) m.all.push(k); });
    m.combos.push(names(o.members).join('、'));
  });
  return order.map(n => ({name:n, en:merged[n].en, members:names(merged[n].all), note:merged[n].note, combos:merged[n].combos}));
}

/* =================== Vimshottari 大运 =================== */
function xz_vimshottari(sidMoon){
  const span = 360 / 27;
  const idx = Math.floor(xz_norm360(sidMoon) / span);
  const within = xz_norm360(sidMoon) - idx * span;
  const f = within / span;                 // 已渡过该宿的比例
  const lord = XZ_NAKSHATRA[idx];
  const lordYears = XZ_DASHA_YEARS[lord];
  const balance = (1 - f) * lordYears;     // 出生后本大运剩余年
  const start = XZ_DASHA_SEQ.indexOf(lord);
  let cursor = 0;                          // 时间轴自出生点（0 岁）起算，首段为出生时主曜余运
  const list = [];
  for(let i = 0; i < 9; i++){
    const g = XZ_DASHA_SEQ[(start + i) % 9];
    const yy = i === 0 ? balance : XZ_DASHA_YEARS[g];
    list.push({graha:g, from:+cursor.toFixed(1), to:+(cursor + yy).toFixed(1), years:+yy.toFixed(2)});
    cursor += yy;
  }
  return {idx, name:XZ_NAK_NAME[idx], pada:Math.floor(within / (span/4)) + 1, lord, f:+f.toFixed(3), balance:+balance.toFixed(2), list};
}

/* 某黄经所属宿与宿分 Pada（27 宿均分，每宿 13°20′，再四分为 Pada） */
function xz_nakOf(lonS){
  const span = 360 / 27;
  const idx = Math.floor(xz_norm360(lonS) / span);
  const within = xz_norm360(lonS) - idx * span;
  return {idx, name:XZ_NAK_NAME[idx], pada:Math.floor(within / (span/4)) + 1, lord:XZ_NAKSHATRA[idx], info:XZ_NAK_INFO[idx]};
}

/* Navamsa（D9）分盘：每星座 30° 九等分，活动宫自白羊起、固定宫自摩羯起、变动宫自天秤起顺数 */
function xz_navamsa(lonS){
  const n = xz_norm360(lonS);
  const si = Math.floor(n / 30), deg = n - si * 30;
  const step = 30 / 9;
  const part = Math.min(8, Math.floor(deg / step));
  const start = [0, 9, 6][si % 3];  // 活动/固定/变动宫对应起始星座序号
  return xz_signName((start + part) * 30 + 1);
}

/* D9 Navamsa 宫位：以 D9 上升（Lagna 的 Navamsa）为第 1 宫（入参为星座序号） */
function xz_navamsaHouse(signIdxA, signIdxB){
  return ((signIdxA - signIdxB + 12) % 12) + 1;
}

/* 大运主曜主题：印度占星传统中九曜所主运程的基调、机遇与挑战 */
const XZ_DASHA_THEME = {
  Ketu:{theme:'灵性转折、内在探索', good:'直觉敏锐，灵性体悟加深，旧有技能重现', bad:'对物质事务的专注下降，易迷失方向、倾向独处'},
  Venus:{theme:'爱、美与物质丰盈', good:'婚恋与艺术创作顺遂，财务增长，人际圆融', bad:'易放纵感官、关系依赖，价值观冲突'},
  Sun:{theme:'自我表达、确立权威', good:'事业晋升，担任领导角色，与父亲或权威的关系得以修复', bad:'自我中心，易与权威冲突，体力透支'},
  Moon:{theme:'情绪流动、滋养与被滋养', good:'家庭和睦，创作力开花，与公众连接良好', bad:'情绪波动大、神经过敏，母亲相关议题浮现'},
  Mars:{theme:'行动、竞争与突破', good:'事业推进，体能充沛，守护在意的人与事', bad:'决策冲动，冲突增多，谨防意外伤害'},
  Rahu:{theme:'世俗攀升与外部剧变', good:'物质进展迅速，接触新文化与新技术，创新机遇多', bad:'方向感迷失，欲望膨胀，关系动荡'},
  Jupiter:{theme:'扩张、智慧与福报', good:'高等教育、灵性成长、子女喜事，社会地位提升', bad:'过度乐观，摊子铺太大，判断失准'},
  Saturn:{theme:'纪律、业力结算与长线根基', good:'深耕成专家，结构性成就，晚年安稳', bad:'压力大、事多延迟、孤立感，注意身体疲劳'},
  Mercury:{theme:'学习、沟通与商业', good:'写作、教学、商业增长，智识成就显著', bad:'思虑过度，神经紧张，信息过载'}
};

/* 九曜自然表征（Naisargika Karaka）：main 用于 Bhava 落宫的本盘指向，d9 用于婚姻与内在成熟期的本盘指向 */
const XZ_GRAHA_KARAKA = {
  sun:     {main:'自我、父亲、权威与功名', d9:'自信与领导力'},
  moon:    {main:'情绪、母亲、内心与家', d9:'心绪与滋养力'},
  mars:    {main:'行动、手足、勇气与不动产', d9:'胆气与执行力'},
  mercury: {main:'言谈、智识、学业与商业', d9:'谈吐与思辨力'},
  jupiter: {main:'智慧、子女、财富与法缘', d9:'福慧与指引力'},
  venus:   {main:'婚恋、审美、享受与伴侣', d9:'情爱与审美力'},
  saturn:  {main:'纪律、劳作、长寿与功课', d9:'忍耐与担当力'},
  rahu:    {main:'欲望、突破、外邦与非常规', d9:'突破与野心'},
  ketu:    {main:'灵性、解脱、断离与隐秘', d9:'出离与直觉'}
};

/* 印度 Bhava（整宫宫位）十二宫义：把曜的表征落到本盘具体人生领域 */
const XZ_BHAVA_MEAN = {
  1:'自我与气场', 2:'积蓄与财帛', 3:'手足与沟通', 4:'家宅与田产', 5:'子女与才智', 6:'劳役与疾厄',
  7:'婚配与伙伴', 8:'变故与寿元', 9:'法缘与远行', 10:'功名与事业', 11:'收益与人脉', 12:'出离与损耗'
};

/* D9 Navamsa 十二宫义（婚姻与内在成熟语境）：D9 本盘指向的真源 */
const XZ_D9_HOUSE_MEAN = {
  1:'婚姻中的自我形象与相处姿态', 2:'婚后积蓄与亲密安全感', 3:'与伴侣的日常沟通', 4:'婚后家宅与内心安稳',
  5:'婚恋中的浪漫与子女缘', 6:'婚姻中的磨合与责任分担', 7:'配偶状态与二人互动', 8:'关系深度绑定与共同资源',
  9:'婚后共同信念与远行', 10:'婚姻带来的社会身份', 11:'婚姻延伸的人脉与收益', 12:'私密相处与彼此退让'
};

/* 大运组合判读：Mahadasha × Antardasha 的吉凶叠加（和谐/紧张/交点） */
function xz_dashaPair(m, a){
  const HAR = {sun:'月亮、火星、木星', moon:'太阳、水星、木星', mars:'太阳、月亮、木星', mercury:'月亮、金星、木星',
               jupiter:'太阳、月亮、火星', venus:'水星、土星', saturn:'水星、金星', rahu:'', ketu:''};
  const TEN = {sun:'土星、罗睺、计都', moon:'火星、土星、罗睺', mars:'月亮、土星', mercury:'太阳、火星、土星',
               jupiter:'水星、金星', venus:'太阳、月亮、火星', saturn:'太阳、月亮、火星', rahu:'', ketu:''};
  const key = a[0] + a[1] + a[2];
  const isNode = (g) => g === 'Rahu' || g === 'Ketu';
  if(isNode(a)) return {tone:'变', text:'交点副运：无论大运为何曜，罗睺或计都作副运多带不稳定与转折，变化容易加速，宜顺势布局少硬扛'};
  if((HAR[m] || '').indexOf(key) >= 0) return {tone:'吉', text:'和谐叠加：两曜能量相互放大，多为阶段高点，可把握推进'};
  if((TEN[m] || '').indexOf(key) >= 0) return {tone:'紧', text:'紧张叠加：两曜能量互相牵制，需有意识地平衡，宜稳字当头'};
  return {tone:'平', text:'中性叠加：运程平稳，按常规节奏推进即可'};
}

/* Sidereal 整宫 Bhava：以恒星黄道上升（Lagna）为第 1 宫 */
function xz_vedicHouse(lonS, lagnaS){
  return ((xz_signIndex(lonS) - xz_signIndex(lagnaS) + 12) % 12) + 1;
}

/* 印度体系尊贵：旺 / 陷 / 本垣强位 / 本垣 / 平 */
function xz_vedicDignity(key, lonS){
  const d = XZ_VEDIC_DIGNITY[key];
  if(!d) return {tag:'平', note:'未纳入印度尊贵体系'};
  const sign = xz_signName(lonS), deg = xz_degInSign(lonS);
  if(d.exalt[0] === sign) return {tag:'旺', note:`${sign}为${xz_cnName(key)}的旺位（近 ${d.exalt[1]}° 最强），力量得以充分发挥`};
  if(d.debil[0] === sign) return {tag:'陷', note:`${sign}为${xz_cnName(key)}的陷位（近 ${d.debil[1]}° 最弱），需借他星或宫位补救`};
  if(d.mt && d.mt[0] === sign && deg >= d.mt[1] && deg < d.mt[2]) return {tag:'本垣强位', note:`${sign} ${deg.toFixed(1)}° 落在${xz_cnName(key)}的 Moolatrikona（本垣强位），仅次于旺位`};
  if(d.own.indexOf(sign) >= 0) return {tag:'本垣', note:`${sign}为${xz_cnName(key)}所主，如归自家，表达稳定`};
  return {tag:'平', note:`${sign}对${xz_cnName(key)}为中性位置，力量取常`};
}
function xz_cnName(key){
  return XZ_NAV_NAME[key] || key;
}

/* D9 尊贵（星座级）：Navamsa 只取落座不取度数，按印度体系九曜尊贵表判旺、陷、本垣、平 */
function xz_d9Dignity(key, signName){
  const d = XZ_VEDIC_DIGNITY[key];
  if(!d) return {tag:'平', note:'未纳入印度尊贵体系'};
  if(d.exalt[0] === signName) return {tag:'旺', note:`${signName}为${xz_cnName(key)}的旺位，D9 得力，婚恋与内在成熟期该曜所主之事顺遂`};
  if(d.debil[0] === signName) return {tag:'陷', note:`${signName}为${xz_cnName(key)}的陷位，D9 失力，婚恋与内在成熟期该曜所主之事需多历练`};
  if(d.own.indexOf(signName) >= 0) return {tag:'本垣', note:`${signName}为${xz_cnName(key)}所主，D9 归位，该曜在人生后段表达稳定`};
  return {tag:'平', note:`${signName}对${xz_cnName(key)}为中性位置，力量取常`};
}

/* Antardasha 副运：在给定主运时段 [from, to] 内按各曜年数比例拆为九段，自该主曜起依固定顺序轮转 */
function xz_antardasha(mahaGraha, mahaFrom, mahaTo){
  const M = XZ_DASHA_YEARS[mahaGraha];
  const span = mahaTo - mahaFrom;
  const start = XZ_DASHA_SEQ.indexOf(mahaGraha);
  let c = mahaFrom;
  const list = [];
  for(let i = 0; i < 9; i++){
    const g = XZ_DASHA_SEQ[(start + i) % 9];
    const yy = span * XZ_DASHA_YEARS[g] / 120;
    list.push({graha:g, from:+c.toFixed(1), to:+(c + yy).toFixed(1), years:+yy.toFixed(2)});
    c += yy;
  }
  return list;
}

/* Pratyantar Dasha 三级副运：在给定副运时段 [antaraFrom, antaraTo] 内按各曜年数比例拆为九段，
   自该副运主曜起轮转；全九段累加即当前副运全长，首段大运为余运时随之等比缩短。 */
function xz_pratyantardasha(antaraGraha, antaraFrom, antaraTo){
  const span = antaraTo - antaraFrom;
  const aStart = XZ_DASHA_SEQ.indexOf(antaraGraha);
  let c = antaraFrom;
  const list = [];
  for(let i = 0; i < 9; i++){
    const g = XZ_DASHA_SEQ[(aStart + i) % 9];
    const yy = span * XZ_DASHA_YEARS[g] / 120;
    list.push({graha:g, from:+c.toFixed(3), to:+(c + yy).toFixed(3), years:+yy.toFixed(3)});
    c += yy;
  }
  return list;
}

/* Dosha 与 Yoga 判定：以恒星黄道整宫 Bhava 为准 */
function xz_vedicYoga(chart){
  const lagnaS = xz_norm360(chart.asc.lon - chart.ayan);
  const H = {};
  for(const k of XZ_NAV_KEYS) H[k] = xz_vedicHouse(chart.sid[k], lagnaS);
  const out = [];

  const marsH = H.mars;
  const kuja = [1,2,4,7,8,12].indexOf(marsH) >= 0;
  out.push({
    name:'Mangal Dosha（火星煞）',
    hit:kuja,
    base:`火星落第 ${marsH} 宫${kuja ? '（属 1、2、4、7、8、12 宫之一）' : '（不在 1、2、4、7、8、12 宫）'}`,
    note:kuja ? '传统认为火星在此六宫会加重婚姻中的摩擦与急进，需双方多给缓冲；此为象征性提示，不作定论'
             : '传统所论的火星煞位未成，婚姻议题少一层火星带来的急进张力'
  });

  const rahuS = chart.sid.rahu, ketuS = chart.sid.ketu;
  const inHalf = (lon) => ((xz_norm360(lon - rahuS) < 180) ? 1 : -1);
  const bodyKeys = ['sun','moon','mars','mercury','jupiter','venus','saturn'];
  const sides = bodyKeys.map(k => inHalf(chart.sid[k]));
  const sameSide = sides.every(v => v === sides[0]);
  out.push({
    name:'Kaal Sarp Yoga（罗睺计都夹命）',
    hit:sameSide,
    base:`罗睺在 ${xz_signName(rahuS)}、计都在 ${xz_signName(ketuS)}，七曜${sameSide ? '全部位于罗睺计都轴的同一侧' : '分列罗睺计都轴两侧'}`,
    note:sameSide ? '传统称诸曜被罗计之轴所夹，人生易有强烈而集中的主题与反复；轻重仍看各曜落宫与尊贵'
                  : '诸曜分列轴线两侧，传统所论的罗计夹命之象未成'
  });

  const sep = ((xz_signIndex(chart.sid.jupiter) - xz_signIndex(chart.sid.moon) + 12) % 12) + 1;
  const gaja = [1,4,7,10].indexOf(sep) >= 0;
  out.push({
    name:'Gajakesari Yoga（象狮之格）',
    hit:gaja,
    base:`木星与月亮相距 ${sep} 宫${gaja ? '（成 1、4、7、10 之角位）' : '（未成角位）'}`,
    note:gaja ? '木星居月亮的角位，传统视为智慧与声望之格，行事易得助力与好名声'
              : '木月未成角位，此格未成，吉助仍需看木星自身落宫与尊贵'
  });

  const budha = H.sun === H.mercury;
  out.push({
    name:'Budhaditya Yoga（水日同宫）',
    hit:budha,
    base:`太阳在第 ${H.sun} 宫、水星在第 ${H.mercury} 宫${budha ? '，两星同宫' : '，未同宫'}`,
    note:budha ? '水星与太阳同宫，传统认为主聪辩与表达的锐度，宜从事需要思辨与表述的事'
               : '水日未同宫，此格未成，思辨与表达仍看水星自身落宫与尊贵'
  });

  /* 五大人格格（Pancha Mahapurusha）：五星任一居角宫且入旺或本垣 */
  const KEN = [1,4,7,10];
  const pmpDef = [
    {k:'mars', n:'Ruchaka', cn:'战神格'},
    {k:'mercury', n:'Bhadra', cn:'贤者格'},
    {k:'jupiter', n:'Hamsa', cn:'天鹅格'},
    {k:'venus', n:'Malavya', cn:'富贵格'},
    {k:'saturn', n:'Sasa', cn:'权杖格'}
  ];
  let pmpHit = null;
  for(const d of pmpDef){
    const dg = xz_vedicDignity(d.k, chart.sid[d.k]);
    if(KEN.indexOf(H[d.k]) >= 0 && (dg.tag === '旺' || dg.tag === '本垣' || dg.tag === '本垣强位')){ pmpHit = d; break; }
  }
  out.push({
    name:'Pancha Mahapurusha（五大人格格）',
    hit:!!pmpHit,
    base:pmpHit
      ? `${XZ_NAV_NAME[pmpHit.k]}落第 ${H[pmpHit.k]} 宫（角宫）且处${xz_vedicDignity(pmpHit.k, chart.sid[pmpHit.k]).tag}，成${pmpHit.cn}（${pmpHit.n}）`
      : '五大人格格要求火星、水星、木星、金星、土星任一居角宫且入旺或本垣，本盘未成',
    note:pmpHit
      ? `${XZ_NAV_NAME[pmpHit.k]}得位得势，传统视为塑造突出人格特质之格，该曜所主领域易出成绩`
      : '此格未成，人格特质仍以各曜落宫与尊贵常态论'
  });

  /* 月火互动（Chandra-Mangala）：月亮与火星同宫或互为角宫 */
  const cmSep = ((xz_signIndex(chart.sid.moon) - xz_signIndex(chart.sid.mars) + 12) % 12) + 1;
  const cmHit = cmSep === 1 || [1,4,7,10].indexOf(cmSep) >= 0;
  out.push({
    name:'Chandra-Mangala Yoga（月火相成）',
    hit:cmHit,
    base:`月亮与火星相距 ${cmSep} 宫${cmHit ? '（同宫或成角位）' : '（未成互动）'}`,
    note:cmHit ? '月火相成，传统视为进取与财利之格，情感驱动行动、行动创造收益'
               : '月火未成互动，此格未成，行动力与情绪的配合仍看两曜落宫'
  });

  /* 财富格（Dhana Yoga）：财帛宫主与福德宫主同宫（经典），
     4 条子判定：① 2 宫主与 11 宫主同宫（经典财格）
     ② 5 宫主与 9 宫主同宫（智慧/运气财格）
     ③ 命主与 2/5/9/11 任一宫主同宫（命主参与财格）
     ④ 2/5/9/11/命宫主之间有互视（parivartana，宫主互换宫位，是财富流通之格） */
  const dhLords = [1, 2, 5, 9, 11];
  // 计算各宫宫主
  const lordOf = {};
  for(const hn of dhLords){
    const hSign = xz_signIndex(lagnaS + (hn - 1) * 30);
    const lordName = XZ_SIGN_RULER[xz_signName(hSign * 30 + 1)];
    let lordKey;
    for(const k of XZ_NAV_KEYS){ if(XZ_NAV_NAME[k] === lordName){ lordKey = k; break; } }
    lordOf[hn] = {name:lordName, key:lordKey, house:H[lordKey]};
  }
  const dhOut = [];
  // ① 2 与 11 同宫
  if(lordOf[2].house === lordOf[11].house){
    dhOut.push({type:'2-11 同宫',
      detail:`财帛宫主${lordOf[2].name}与福德宫主${lordOf[11].name}同在第 ${lordOf[2].house} 宫，传统财格成立`});
  }
  // ② 5 与 9 同宫
  if(lordOf[5].house === lordOf[9].house){
    dhOut.push({type:'5-9 同宫',
      detail:`5宫主${lordOf[5].name}与9宫主${lordOf[9].name}同在第 ${lordOf[5].house} 宫，智慧与运气联动，亦属财富之格`});
  }
  // ③ 命主与 2/5/9/11 任一同宫
  for(const hn of [2,5,9,11]){
    if(lordOf[1].house === lordOf[hn].house && lordOf[1].key !== lordOf[hn].key){
      dhOut.push({type:'命主与 ' + hn + ' 宫主同宫',
        detail:`命主${lordOf[1].name}与${hn}宫主${lordOf[hn].name}同在第 ${lordOf[1].house} 宫，命主直接参与财格`});
      break;
    }
  }
  // ④ 互视（parivartana）：两宫主互换宫位
  const dhPairs = [[1,2],[1,5],[1,9],[1,11],[2,5],[2,9],[2,11],[5,9],[5,11],[9,11]];
  for(const [a, b] of dhPairs){
    if(lordOf[a].key === lordOf[b].key) continue;
    if(lordOf[a].house === b && lordOf[b].house === a){
      dhOut.push({type:`${a} 宫与 ${b} 宫主互换（互视）`,
        detail:`${a}宫主${lordOf[a].name}落第 ${b} 宫、${b}宫主${lordOf[b].name}落第 ${a} 宫，城垛互换，财富能量流通`});
      break; /* 只取一条互视 */
    }
  }
  out.push({
    name:'Dhana Yoga（财富格）',
    hit:dhOut.length > 0,
    base: dhOut.length > 0
      ? dhOut.map(o => `${o.type}：${o.detail}`).join('；')
      : `财帛宫主${lordOf[2].name}落第 ${lordOf[2].house} 宫、福德宫主${lordOf[11].name}落第 ${lordOf[11].house} 宫，5宫主${lordOf[5].name}落第 ${lordOf[5].house} 宫、9宫主${lordOf[9].name}落第 ${lordOf[9].house} 宫，命主${lordOf[1].name}落第 ${lordOf[1].house} 宫，均未成同宫或互视`,
    note: dhOut.length > 0
      ? '传统财富格（2-11 同宫、5-9 同宫、命主参与 2、5、9、11 宫、或宫主互视），财富积累与流通渠道丰富'
      : '此格未成，财富积累仍看 2 宫、11 宫落座与宫内星体'
  });

  return {lagnaS, lagnaSign:xz_signName(lagnaS), houses:H, list:out};
}

/* =================== 主计算入口 =================== */
/* system: 'whole'（整宫制，默认）或 'placidus'（Placidus 分宫制）。
   Placidus 在极昼极夜等高纬场景 AD 无定义（|tanφ×tanδ|≥1）时自动回退整宫制，
   以 sysFallback 标记供界面提示。吠陀判读恒用恒星黄道整宫制，与本制式无关。 */
function xz_compute(y, m, d, hh, mm, sex, tz, lon, lat, system){
  const want = system === 'placidus' ? 'placidus' : 'whole';
  const jd = xz_jd(y, m, d, hh, mm, tz);
  const longitudes = xz_ephem_longitudes(jd);
  const speeds = xz_ephem_speeds(jd);
  const ayan = xz_ayanamsa(jd);
  const asc = xz_ascendant(jd, lon, lat);
  const sid = {};
  for(const k in longitudes) sid[k] = xz_norm360(longitudes[k] - ayan);

  const ascSignIdx = xz_signIndex(asc.lon);
  /* 宫头黄经（度）：整宫制=ASC 星座边界起每 30° 一宫；Placidus=分宫迭代求宫头。
     回退时 cusps 为整宫数组，system 记实际生效制式，sysFallback 标记回退供界面提示 */
  let cusps, sysFallback = false;
  if(want === 'placidus'){
    const pc = xz_houseCusps(asc, lat);
    if(pc){ cusps = pc; } else { cusps = xz_wholeCusps(asc.lon); sysFallback = true; }
  } else {
    cusps = xz_wholeCusps(asc.lon);
  }
  const sysUsed = sysFallback ? 'whole' : want;
  const decls = xz_ephem_declinations(jd);
  const planets = {};
  for(const p of XZ_PLANETS){
    const lonT = longitudes[p.key];
    const lonS = sid[p.key];
    const dign = xz_totalDignity(p.key, xz_signName(lonT), lonT, p.name);
    planets[p.key] = {
      name: p.name, glyph: p.glyph, cn: p.cn,
      lonT, signT: xz_signName(lonT), degT: xz_degInSign(lonT),
      lonS, signS: xz_signName(lonS), degS: xz_degInSign(lonS),
      house: xz_houseAt(lonT, cusps),
      dignity: dign.level, dignNote: dign.note,
      dignScore: dign.score, boundLord: dign.boundLord, faceLord: dign.faceLord,
      selfBound: dign.selfBound, selfFace: dign.selfFace,
      dec: decls.dec[p.key], oob: Math.abs(decls.dec[p.key]) > decls.eps,
      speed: speeds[p.key], retro: speeds[p.key] < 0
    };
  }
  const aspects = xz_aspects(longitudes);
  const vim = xz_vimshottari(sid.moon);
  /* 幸运点 Part of Fortune 的昼夜判定：太阳按整宫制落第 7..12 宫视为白昼，
     不随宫位制切换而变，保证幸运点黄经在两种制式下一致（其公式与宫位制无关） */
  const isDay = xz_houseOf(longitudes.sun, ascSignIdx) >= 7;
  const fortuneLon = isDay ? xz_norm360(asc.lon + longitudes.moon - longitudes.sun)
                           : xz_norm360(asc.lon + longitudes.sun - longitudes.moon);
  const disp = xz_dispositorChain(planets);
  for(const k in disp) planets[k].disp = disp[k];

  return {
    jd, dt:{y,m,d,hh,mm}, sex, tz, lon, lat,
    ayan, asc, ascSignIdx, system: sysUsed, sysFallback, cusps,
    longitudes, speeds, sid, planets, aspects, vim,
    patterns: xz_patterns(aspects, planets),
    fortune: {lon: fortuneLon, day: isDay},
    ftPts: xz_natalPoints({planets, asc})
  };
}

/* =================== 行运 Transits =================== */
/* 行运盘快照：jdT 时刻十大星体回归黄道位置，并以出生盘宫头定位其落本命宫。
   cusps 沿用出生盘所选宫位制（整宫或 Placidus），故此处的宫号即行运星过本命第几宫。 */
function xz_transitSnap(jdT, cusps){
  const lon = xz_ephem_longitudes(jdT);
  const spd = xz_ephem_speeds(jdT);
  return XZ_PLANETS.map(p => {
    const l = lon[p.key];
    return {key:p.key, name:p.name, glyph:p.glyph, cn:p.cn,
      lonT:l, signT:xz_signName(l), degT:xz_degInSign(l),
      house:xz_houseAt(l, cusps),
      speed:+spd[p.key].toFixed(3), retro:spd[p.key] < 0};
  });
}

/* 行运对本命敏感点（十星 + 上升 + 中天）的相位：本命点取出生盘黄经，
   容许度由 xz_orbOf 按发光体与轴点分别裁定，轴点只成硬相位。方向判别取 jdT+0.25 日的行运黄经做差分：
   与本命点角距较当前趋小为入相位（正在逼近），趋大为出相位（正在离开）。 */
function xz_transitAspects(chart, jdT){
  const lonA = xz_ephem_longitudes(jdT);
  const lonB = xz_ephem_longitudes(jdT + 0.25);
  const res = [];
  for(const p of XZ_PLANETS){
    const la = lonA[p.key];
    if(la == null) continue;
    for(const pt of chart.ftPts){
      const hit = xz_aspectBetween(la, pt.lon, p.key, pt.key);
      if(!hit) continue;
      let d1 = Math.abs(xz_norm360(la - pt.lon)); if(d1 > 180) d1 = 360 - d1;
      let d2 = Math.abs(xz_norm360(lonB[p.key] - pt.lon)); if(d2 > 180) d2 = 360 - d2;
      res.push({t:p.key, n:pt.key, nName:pt.name, nHouse:pt.house, type:hit.type, en:hit.en,
        orb:hit.orb, exact:hit.exact,
        dir: Math.abs(d2 - d1) < 1e-9 ? '持平' : (d2 < d1 ? '入相' : '出相')});
    }
  }
  res.sort((x,y) => y.exact - x.exact);
  return res;
}

/* 未来慢速行运扫描（时间线）：自 jdStart（当地正午）逐日推进 days 天，
   追踪外行星（木土天海冥）与本命敏感点（十星+上升+中天）的主要相位精确日，
   以及与本命宫头（换宫）的精确相遇日。
   数值法：相对固定点黄经差连续展开后按 30° 分箱（主要相位位置恰落在整 30° 网格），
   分箱变化即穿越某相位或宫头，再对穿越日前后二分求精确儒略日。 */
function xz_slowTransitScan(chart, jdStart, days){
  const slow = ['jupiter','saturn','uranus','neptune','pluto'];
  const nm = {};
  XZ_PLANETS.forEach(p => nm[p.key] = p.name);
  const NB = 12, PHI = 30;
  const POS_A = {0:'合', 60:'六合', 90:'刑', 120:'三合', 180:'冲', 240:'三合', 270:'刑', 300:'六合'};
  const targets = [];
  XZ_PLANETS.forEach(p => targets.push({k:p.key, lon:chart.planets[p.key].lonT, name:p.name, house:chart.planets[p.key].house}));
  targets.push({k:'asc', lon:chart.asc.lon, name:'上升', house:1});
  targets.push({k:'mc', lon:chart.asc.mc, name:'中天', house:10});
  const rel = {}, relCusp = {};
  const evs = [];
  /* 逐日预计算一次十星黄经，主循环只查表 */
  const dayLon = [];
  for(let d = 0; d <= days; d++) dayLon[d] = xz_lons10(jdStart + d);
  const crossingBin = (pb, cb) => {
    if(Math.abs(cb - pb) >= NB - 1) return 0;          // 环绕（经 0/360）
    return cb > pb ? pb + 1 : pb;
  };
  /* 精确相遇时刻：相位点绝对黄经 = 目标黄经 + ang（取距前一日黄经最近一侧）。
     二分期间儒略日为小数，逐次用单星黄经即可，不必全量星历。 */
  function bisect(jdLo, jdHi, tk, absLon){
    let lo = jdLo, hi = jdHi;
    for(let i = 0; i < 28; i++){
      const m = (lo + hi) / 2;
      let g = xz_norm360(xz_planetLon(m, tk) - absLon);
      const s = g > 180 ? g - 360 : g;
      const g0 = xz_norm360(xz_planetLon(jdLo, tk) - absLon);
      const s0 = g0 > 180 ? g0 - 360 : g0;
      if(s0 < 0 ? s > 0 : s < 0) hi = m; else lo = m;
    }
    return (lo + hi) / 2;
  }
  const exactByBin = (day, tk, refLon, ang) => {
    /* 相位绝对黄经候选两侧，取与 (day-1) 日黄经较近者 */
    const prevLon = dayLon[day - 1][tk];
    const c1 = xz_norm360(refLon + ang), c2 = xz_norm360(refLon - ang);
    let da = Math.abs(xz_norm360(prevLon - c1)); if(da > 180) da = 360 - da;
    let db = Math.abs(xz_norm360(prevLon - c2)); if(db > 180) db = 360 - db;
    const absLon = da <= db ? c1 : c2;
    return bisect(jdStart + day - 1, jdStart + day, tk, absLon);
  };
  for(const tk of slow){
    let prev = null;
    for(let d = 0; d <= days; d++){
      const lon = dayLon[d][tk];
      if(prev == null){
        prev = lon;
        for(const t of targets) rel[t.k] = xz_norm360(lon - t.lon);
        for(let h = 0; h < 12; h++) relCusp[h] = xz_norm360(lon - chart.cusps[h]);
        continue;
      }
      prev = lon;
      for(const t of targets){
        const cur = xz_norm360(lon - t.lon);
        const pb = Math.floor(rel[t.k] / PHI), cb = Math.floor(cur / PHI);
        if(pb !== cb){
          const crossed = crossingBin(pb, cb);
          const an = crossed * PHI;
          const aname = POS_A[an];
          if(aname){
            const jdE = exactByBin(d, tk, t.lon, an);
            evs.push({jd:jdE, tkey:tk, tname:nm[tk], kind:'phase', aspect:aname, ok:t.name, ohouse:t.house});
          }
        }
        rel[t.k] = cur;
      }
      for(let h = 0; h < 12; h++){
        const pb = Math.floor(relCusp[h] / PHI);
        const cur = xz_norm360(lon - chart.cusps[h]);
        const cb = Math.floor(cur / PHI);
        if(pb !== cb && crossingBin(pb, cb) === 0){
          /* 顺行（pb=11 环绕经 0）越入下一宫；逆行（pb=0 越回）退入上一宫 */
          const dirUp = pb === 11 && cb === 0;
          const jdE = bisect(jdStart + d - 1, jdStart + d, tk, chart.cusps[h]);
          const jLon = dirUp ? xz_norm360(chart.cusps[h] + 0.5) : xz_norm360(chart.cusps[h] - 0.5);
          evs.push({jd:jdE, tkey:tk, tname:nm[tk], kind:'cusp', aspect:'', ok:'', ohouse:xz_houseAt(jLon, chart.cusps), dir:dirUp ? 1 : -1});
        }
        relCusp[h] = cur;
      }
    }
  }
  evs.sort((a,b) => a.jd - b.jd);
  return evs;
}

/* =================== 推运：次限、太阳弧、太阳回归（#1178） =================== */
/* 儒略日 → 当地钟表日期时分。自含 Meeus 公历回推，禁 Date（防公元 1-99 映射 bug）。 */
function xz_localFromJd(jd, tz){
  const jdL = jd + tz / 24;
  const Z = Math.floor(jdL + 0.5);
  const F = jdL + 0.5 - Z;
  const alpha = Math.floor((Z - 1867216.25) / 36524.25);
  const A = Z + 1 + alpha - Math.floor(alpha / 4);
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  let dd = B - D - Math.floor(30.6001 * E);
  const mm = E < 14 ? E - 1 : E - 13;
  let y = mm > 2 ? C - 4716 : C - 4715;
  let hh = Math.floor(F * 24);
  let mi = Math.floor((F * 24 - hh) * 60 + 0.5);
  if(mi === 60){ mi = 0; hh += 1; }
  if(hh === 24){ hh = 0; dd += 1; }
  if(dd > 28 && !((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && mm === 2){ dd = 1; mm = 3; }
  else if(dd > 29 && mm === 2){ dd = 1; mm = 3; }
  else if(dd > 30 && [4, 6, 9, 11].indexOf(mm) >= 0){ dd = 1; mm += 1; }
  else if(dd > 31){ dd = 1; mm += 1; }
  if(mm === 13){ mm = 1; y += 1; }
  return {y, m: mm, d: dd, hh, mm: mi};
}
/* 本命敏感点表：十星 + 上升 + 中天，供推运各法与行运共用（含宫号，供主题句带领域）。
   withDsc 为真时追加下降点（上升正对，伴侣与他者之轴），仅供合盘使用：
   推运与行运沿用传统十二点口径，不受影响。 */
function xz_natalPoints(chart, withDsc){
  const pts = [];
  XZ_PLANETS.forEach(p => pts.push({key: p.key, name: p.name, house: chart.planets[p.key].house, lon: chart.planets[p.key].lonT}));
  pts.push({key:'asc', name:'上升', house:1, lon: chart.asc.lon});
  pts.push({key:'mc', name:'中天', house:10, lon: chart.asc.mc});
  if(withDsc) pts.push({key:'dsc', name:'下降', house:7, lon: xz_norm360(chart.asc.lon + 180)});
  return pts;
}
/* 事件盘星体中文名：行星取 XZ_PLANETS，四轴单独给名 */
function xz_dispName(key){
  const p = XZ_PLANETS.find(q => q.key === key);
  if(p) return p.name;
  return key === 'asc' ? '上升' : key === 'mc' ? '中天' : key === 'dsc' ? '下降' : key;
}
/* 跨盘主要相位：lonsA（事件盘黄经，键为行星或 asc/mc）对照本命敏感点 pts。
   orbs 传 null 用 XZ_ASPECTS 默认容许度，或传 {合:…,冲:…} 按相位收紧（推运常用窄容许）。
   skipSame 为 true 时跳过同键自相对（推进星对本命同星、回归太阳对本命太阳等无信息量）。
   结果按近精程度（exact）降序。 */
function xz_crossAspects(lonsA, pts, orbs, skipSame){
  const res = [];
  for(const k in lonsA){
    for(const pt of pts){
      if(skipSame && pt.key === k) continue;
      let d = Math.abs(xz_norm360(lonsA[k] - pt.lon));
      if(d > 180) d = 360 - d;
      for(const asp of XZ_ASPECTS){
        const orb = orbs && orbs[asp.name] != null ? orbs[asp.name] : xz_orbOf(asp.name, k, pt.key);
        const dd = Math.abs(d - asp.angle);
        if(dd <= orb){
          res.push({a: k, b: pt.key, bName: pt.name, bHouse: pt.house,
            type: asp.name, en: asp.en, orb: +(d - asp.angle).toFixed(2), exact: +(orb - dd).toFixed(1)});
          break;
        }
      }
    }
  }
  res.sort((x, y) => y.exact - x.exact);
  return res;
}
/* 所选日期正午（当地时区）与出生时刻相差的年数（次限一日一年的基准） */
function xz_yearsSince(chart, y, m, d){
  const jdT = xz_jd(y, m, d, 12, 0, chart.tz);
  return {jdT, years: (jdT - chart.jd) / 365.2422};
}
/* 次限推进：出生后一日即一岁。pjd = 出生时刻 + years 日，取该时刻十星回归黄经
   对照本命宫位；推进上升、中天同时参与对本命敏感点的相位。容许度收紧（合冲 2°、
   其余 1.5°），快速推进星（月亮年行约 13°）的相位是次限的定时针。 */
function xz_secProg(chart, y, m, d){
  const {jdT, years} = xz_yearsSince(chart, y, m, d);
  if(jdT < chart.jd) return {neg: true};
  const pjd = chart.jd + years;
  const list = xz_transitSnap(pjd, chart.cusps);
  const pasc = xz_ascendant(pjd, chart.lon, chart.lat);
  const lons = {};
  list.forEach(p => lons[p.key] = p.lonT);
  lons.asc = pasc.lon;
  lons.mc = pasc.mc;
  const hits = xz_crossAspects(lons, xz_natalPoints(chart),
    {合: 2, 冲: 2, 刑: 1.5, 三合: 1.5, 六合: 1.5}, true).slice(0, 18);
  return {years, pjd, list, hits};
}
/* 太阳弧：以次限太阳推进度数作全盘统一弧值，十星与上升、中天各前移同一弧后
   对照本命敏感点。容许度统一 1°，命中稀疏属正常，是"岁运方向"级指示。 */
function xz_solarArc(chart, y, m, d){
  const {jdT, years} = xz_yearsSince(chart, y, m, d);
  if(jdT < chart.jd) return {neg: true};
  const pjd = chart.jd + years;
  let arc = xz_norm360(xz_planetLon(pjd, 'sun') - chart.planets.sun.lonT);
  if(arc > 180) arc -= 360;
  const dir = {};
  XZ_PLANETS.forEach(p => dir[p.key] = xz_norm360(chart.planets[p.key].lonT + arc));
  dir.asc = xz_norm360(chart.asc.lon + arc);
  dir.mc = xz_norm360(chart.asc.mc + arc);
  const hits = xz_crossAspects(dir, xz_natalPoints(chart),
    {合: 1, 冲: 1, 刑: 1, 三合: 1, 六合: 1}, true).slice(0, 12);
  return {years, arc, hits};
}
/* 太阳回归：求指定年份内太阳（回归黄道）回到本命太阳黄经的精确时刻，取该时刻
   十星落座与顺逆行、过本命宫（年盘星体对本命宫的重叠即年度主题领域），并对本命
   敏感点列主要相位（跳过同键自对，容许度沿用默认）。回归日与生日差数小时至两日，
   为正常现象（太阳每日行约 1°）。 */
function xz_solarReturn(chart, yr){
  const tgt = chart.planets.sun.lonT;
  const bd = chart.dt;
  let mm = bd.m, dd = bd.d;
  if(mm === 2 && dd === 29 && !((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0)) dd = 28;
  const start = xz_jd(yr, mm, dd, 12, 0, chart.tz);
  const g = j => {
    const x = xz_norm360(xz_planetLon(j, 'sun') - tgt);
    return x > 180 ? x - 360 : x;
  };
  let lo = null, hi = null;
  for(let k = -8; k < 8; k++){
    if(g(start + k) <= 0 && g(start + k + 1) > 0){ lo = start + k; hi = start + k + 1; break; }
  }
  if(lo == null){ lo = start - 8; hi = start + 8; }
  for(let i = 0; i < 40; i++){
    const m = (lo + hi) / 2;
    if(g(m) > 0) hi = m; else lo = m;
  }
  const jdR = (lo + hi) / 2;
  const list = xz_transitSnap(jdR, chart.cusps);
  const ascR = xz_ascendant(jdR, chart.lon, chart.lat);
  const lons = {};
  list.forEach(p => lons[p.key] = p.lonT);
  const hits = xz_crossAspects(lons, xz_natalPoints(chart), null, true).slice(0, 24);
  return {yr, jdR, loc: xz_localFromJd(jdR, chart.tz), ascR, list, hits};
}

/* =================== 古典计时法：小限、法达、黄道释放与 Vimshottari 年份轴（#1179） =================== */
/* 黄道释放（Zodiacal Releasing）星座级段年数：每星座按其守护星小年数（Minor Years）计年，
   土星所主二座取传统口径摩羯 27、水瓶 30。 */
const XZ_ZR_YEARS = {白羊:15, 金牛:8, 双子:20, 巨蟹:25, 狮子:19, 处女:20, 天秤:8, 天蝎:15, 射手:12, 摩羯:27, 水瓶:30, 双鱼:12};

/* 法达（Firdaria）主周期：七政两交点各主年数，合计 75 年一轮；
   昼生自太阳起、夜生自月亮起，均沿同一链推进。 */
const XZ_FIRD_YEARS = {sun:10, venus:8, mercury:13, moon:9, saturn:11, jupiter:12, mars:7, rahu:3, ketu:2};
const XZ_FIRD_ORDER = {
  day:   ['sun','venus','mercury','moon','saturn','jupiter','mars','rahu','ketu'],
  night: ['moon','saturn','jupiter','mars','sun','venus','mercury','rahu','ketu']
};
const XZ_FIRD_NAME = {sun:'太阳', moon:'月亮', mars:'火星', mercury:'水星', jupiter:'木星', venus:'金星', saturn:'土星', rahu:'北交', ketu:'南交'};
const XZ_FIRD_NOTE = {
  sun:'名声、权威与自我确立', moon:'家宅、情绪与大众缘', mars:'行动、竞争与开创',
  mercury:'学业、沟通与商贸', jupiter:'扩张、贵人与社会跃升', venus:'关系、财富与美事',
  saturn:'责任、劳碌与业力结算', rahu:'外缘、突破与非常规', ketu:'内省、了结与转折'
};

/* 出生后第 k 回归年的公历年（自出生时刻起算；各运段时间轴均自出生点起算，k 非负） */
function xz_calYearAt(chart, k){
  return xz_localFromJd(chart.jd + k * 365.2422, chart.tz).y;
}

/* 小限（Annual Profections）：自本命上升星座起每过一个生日黄经前移 30°（一星座）。
   周岁 a 对应主题宫 = (a mod 12) + 1（0 岁即第 1 主题宫，主题取命宫）；推进星座为上升
   星座向后数 a 位。时间主星即该推进星座的古典守护星，落宫给主题落地的生活领域。 */
function xz_profections(chart, age0, ageN){
  const ascIdx = chart.ascSignIdx;
  const rows = [];
  for(let a = age0; a <= ageN; a++){
    const house = (a % 12) + 1;
    const sign = XZ_SIGNS[(ascIdx + a) % 12];
    const ruler = XZ_SIGN_RULER[sign];
    const rp = XZ_PLANETS.find(p => p.name === ruler);
    rows.push({age:a, sign, house, ruler,
      rulerHouse: rp ? chart.planets[rp.key].house : null,
      calY: xz_calYearAt(chart, a)});
  }
  return rows;
}

/* 法达主周期段：自出生起沿昼夜定序累计至覆盖 toAge 岁。
   每段给起止岁、对应公历年份（首段自出生时起）与所主领域。 */
function xz_firdaria(chart, toAge){
  const ord = chart.fortune.day ? XZ_FIRD_ORDER.day : XZ_FIRD_ORDER.night;
  const rows = [];
  let cursor = 0;
  outer:
  while(cursor < toAge){
    for(const g of ord){
      const yy = XZ_FIRD_YEARS[g];
      rows.push({graha:g, years:yy, from:+cursor.toFixed(2), to:+(cursor + yy).toFixed(2),
        calFrom:xz_calYearAt(chart, cursor), calTo:xz_calYearAt(chart, cursor + yy),
        note:XZ_FIRD_NOTE[g], name:XZ_FIRD_NAME[g]});
      cursor += yy;
      if(cursor >= toAge) break outer;
    }
  }
  return rows;
}

/* 黄道释放（Zodiacal Releasing）星座级 L1：自 Lot 所在星座起依黄道序逐星座释放，
   每星座年数取守护星小年数。Lot of Spirit 作行动与事业轴、Lot of Fortune 作身体与
   物质轴，日生夜生两 Lot 取式相反；相对 Lot 的角宫位段（第 1、4、7、10 位）为古典
   所称峰期，主题最易显化。自出生即入首段，段边界即人生章节切换点。 */
function xz_zodiacalRelease(chart, toAge){
  const day = chart.fortune.day;
  const asc = chart.asc.lon, sunL = chart.longitudes.sun, moonL = chart.longitudes.moon;
  const spiritLon = day ? xz_norm360(asc + sunL - moonL) : xz_norm360(asc + moonL - sunL);
  const build = (lotLon) => {
    const startIdx = xz_signIndex(lotLon);
    const rows = [];
    let cursor = 0, i = 0;
    while(cursor < toAge && i < 36){
      const sIdx = (startIdx + i) % 12;
      const sign = XZ_SIGNS[sIdx];
      const yy = XZ_ZR_YEARS[sign];
      const pos = (i % 12) + 1;
      rows.push({sign, years:yy, from:+cursor.toFixed(2), to:+(cursor + yy).toFixed(2),
        pos, zone: pos === 1 || pos === 4 || pos === 7 || pos === 10 ? '角'
             : (pos === 2 || pos === 5 || pos === 8 || pos === 11 ? '续' : '果'),
        calFrom:xz_calYearAt(chart, cursor), calTo:xz_calYearAt(chart, cursor + yy)});
      cursor += yy; i += 1;
    }
    return {lotLon, startSign:XZ_SIGNS[startIdx], rows};
  };
  return {day, spirit:build(spiritLon), fortune:build(chart.fortune.lon)};
}

/* Vimshottari 大运年龄轴转公历年份轴：每段以出生时刻后 from/to 回归年换算公历年，
   时间轴自出生点起算，各段 from/to 均非负。 */
function xz_vimYears(chart){
  return chart.vim.list.map(v => ({
    graha:v.graha, from:v.from, to:v.to,
    calFrom:xz_calYearAt(chart, v.from), calTo:xz_calYearAt(chart, v.to)
  }));
}

/* =================== 双人合盘：Synastry 比较盘、Composite 组合盘、Davison 时空中点盘（#1180） =================== */
/* 黄道中点：取两黄经间较短弧的中点（处理 0/360 环绕）。a=350 b=10 中点归 0 而非 180。 */
function xz_midpoint(a, b){
  const d = xz_norm360(b - a);
  return d <= 180 ? xz_norm360(a + d / 2) : xz_norm360(b + (360 - d) / 2);
}
/* 一方行星（十星+上升+中天）落入另一方盘第几宫：返回按星体序的行，供 Synastry 落宫互参。
   与 overlay 的宫义均取对方盘 cusps（沿用其宫位制）。 */
function xz_overlayRows(overChart, baseChart, withDsc){
  const pts = xz_natalPoints(overChart, withDsc);
  return pts.map(pt => {
    const p = pt.key === 'asc' || pt.key === 'mc' ? null : XZ_PLANETS.find(q => q.key === pt.key);
    return {
      key: pt.key, name: pt.name,
      glyph: p ? p.glyph : (pt.key === 'asc' ? '↑' : pt.key === 'dsc' ? '↓' : '☊'),
      lonT: pt.lon, signT: xz_signName(pt.lon), degT: xz_degInSign(pt.lon),
      house: xz_houseAt(pt.lon, baseChart.cusps)
    };
  });
}
/* Synastry 交叉相位：甲方十三敏感点（十星＋上升＋中天＋下降）对乙方十三敏感点逐一量角，
   与行运相位同容许度口径（XZ_ASPECTS），不跳同名星（甲太阳对乙太阳的合相是合盘核心信息）。
   下降点为上升的对宫，对方星体合我方下降是伴侣轴的经典指标，故合盘口径纳入。
   返回 a=甲方键、b=乙方键 的命中，按近精确降序。 */
function xz_synastryAspects(chartA, chartB){
  const lonsA = {};
  XZ_PLANETS.forEach(p => lonsA[p.key] = chartA.planets[p.key].lonT);
  lonsA.asc = chartA.asc.lon;
  lonsA.mc = chartA.asc.mc;
  lonsA.dsc = xz_norm360(chartA.asc.lon + 180);
  return xz_crossAspects(lonsA, xz_natalPoints(chartB, true), null, false);
}
/* 轴点去重：上升与下降是一条轴的两端，同一条几何接触必然以两种写法各出现一次
   （合上升即冲下降、三合上升即六合下降、刑上升即刑下降）。计分前按"甲方键>乙方键"
   归并，下降键折算为上升键，同一条接触只留一条，优先留合相端（星体压在角上的写法），
   两端都不是合相时留更紧密的一条，避免同一事实重复计分。 */
function xz_axisDedupe(hits){
  const axOf = k => k === 'dsc' ? 'asc' : k;
  const keep = new Map();
  hits.forEach(h => {
    const id = axOf(h.a) + '>' + axOf(h.b);
    const prev = keep.get(id);
    if(!prev){ keep.set(id, h); return; }
    const better = (x, y) => (x.type === '合' && y.type !== '合') ? x
      : (y.type === '合' && x.type !== '合') ? y
      : (x.exact >= y.exact ? x : y);
    keep.set(id, better(prev, h));
  });
  return Array.from(keep.values());
}
/* 合盘评分共享上下文：七维与专项同用一批交叉相位与组合盘，一次算好两处复用。
   hits 为轴点去重后的计分口径（展示用的全量相位由 xz_synastryAspects 直接取）。 */
function xz_matchCtx(chartA, chartB){
  return { hits: xz_axisDedupe(xz_synastryAspects(chartA, chartB)), comp: xz_compositeChart(chartA, chartB) };
}
/* Composite 组合中点盘：每颗行星取两人同名星黄经中点，轴点（上升/中天）同取中点。
   组合盘无真实出生时刻与地点，宫位制不依赖分宫迭代，恒用整宫（中点 ASC 起第 1 宫），
   属组合盘的通用呈现口径。返回行星落座与内部主要相位。 */
function xz_compositeChart(chartA, chartB){
  const ascLon = xz_midpoint(chartA.asc.lon, chartB.asc.lon);
  const mcLon = xz_midpoint(chartA.asc.mc, chartB.asc.mc);
  const cusps = xz_wholeCusps(ascLon);
  const mids = {};
  XZ_PLANETS.forEach(p => {
    const lon = xz_midpoint(chartA.planets[p.key].lonT, chartB.planets[p.key].lonT);
    mids[p.key] = lon;
  });
  const planets = XZ_PLANETS.map(p => {
    const lon = mids[p.key];
    return {
      key: p.key, name: p.name, glyph: p.glyph,
      lonT: lon, signT: xz_signName(lon), degT: xz_degInSign(lon),
      house: xz_houseAt(lon, cusps)
    };
  });
  return {
    ascLon, mcLon,
    ascSignT: xz_signName(ascLon), mcSignT: xz_signName(mcLon),
    cusps, planets, aspects: xz_aspects(mids)
  };
}
/* Davison 时空中点盘：取两人出生时刻的儒略日中点为盘时刻，经纬度取两人出生地中点
   （经度按最短弧跨线归位），以该时刻起一张真实星盘。宫位制沿用 chartA.system（Placidus
   高纬无解自动回退整宫）。返回行星落座（含顺逆行）、轴点与盘内主要相位。 */
function xz_davisonChart(chartA, chartB, want){
  const jdD = (chartA.jd + chartB.jd) / 2;
  let lonD = (chartA.lon + chartB.lon) / 2;
  if(Math.abs(chartA.lon - chartB.lon) > 180){
    const a = chartA.lon, b = chartB.lon;
    const pa = a > 0 ? a - 360 : a, pb = b > 0 ? b - 360 : b;
    lonD = (pa + pb) / 2;
    if(lonD < -180) lonD += 360;
  }
  const latD = (chartA.lat + chartB.lat) / 2;
  const asc = xz_ascendant(jdD, lonD, latD);
  let cusps, sysFallback = false;
  if(want === 'placidus'){
    const pc = xz_houseCusps(asc, latD);
    if(pc){ cusps = pc; } else { cusps = xz_wholeCusps(asc.lon); sysFallback = true; }
  } else {
    cusps = xz_wholeCusps(asc.lon);
  }
  const lons = xz_ephem_longitudes(jdD);
  const list = XZ_PLANETS.map(p => {
    const l = lons[p.key];
    return {key:p.key, name:p.name, glyph:p.glyph, cn:p.cn,
      lonT:l, signT:xz_signName(l), degT:xz_degInSign(l),
      house:xz_houseAt(l, cusps)};
  });
  /* 顺逆行标记：取 davison 时刻前后半日黄经差分 */
  const spd = xz_ephem_speeds(jdD);
  list.forEach(p => { p.retro = spd[p.key] < 0; });
  return {
    jd: jdD, loc: xz_localFromJd(jdD, chartA.tz),
    lon: lonD, lat: latD, system: sysFallback ? 'whole' : (want === 'placidus' ? 'placidus' : 'whole'),
    sysFallback,
    ascLon: asc.lon, mcLon: asc.mc,
    ascSignT: xz_signName(asc.lon), mcSignT: xz_signName(asc.mc),
    cusps, list, aspects: xz_aspects(lons)
  };
}
/* 双人合盘匹配度评分：七维核心满分 100，按专业合盘权重定基数，发光体最重：
   日月互融17（一人太阳对另一人月亮，古典婚配第一指标）、月亮情感共鸣17（长期关系的安全感底盘）、
   金火吸引力13、土星承诺13（由专项升入：专业合盘中土星是承诺与持久的头号权重星）、
   宫位互落13、轴点宿命13（由专项升入：轴点连线是命运感最强的接触类型）、
   整体相位基调14（按星体权重统计全部交叉相位的和谐占比，补上前六维按星对抽取时丢弃的相位信息）。
   太阳星座速览降入专项（xz_matchSpec）：通行配对速览在专业口径中权重最低。
   证据口径：各维以"无交叉相位即取本维低档"为起点（日月6、月月8、金火4、土星4、宫位4、轴点3、
   相位基调5，零证据合计34），分数由实际相位逐条加减而来，不给无联结的组合发放中段保底分。
   专项层与综合分聚合见下方 xz_matchSpec / xz_matchFinal
   判定原料全部来自本文件已有真源（xz_matchCtx、xz_overlayRows、xz_compositeChart、
   XZ_DIGNITY），不引入新的星历计算。ctx 为可选共享上下文（xz_matchFinal 传入以免重复计算），
   缺省则自行构建。交叉相位取轴点去重后的计分口径（上升与下降同一条接触只计一次）。
   返回 items（名、得分、满分、判语）与 total。
   （综合分 = 七维核心归一×0.7 + 专项归一×0.3，与八字合婚页同口径）。 */
function xz_matchScore(chartA, chartB, ctx){
  const c0 = ctx || xz_matchCtx(chartA, chartB);
  const hits = c0.hits, comp = c0.comp;
  const find2 = (x, y) => hits.find(h => (h.a === x && h.b === y) || (h.a === y && h.b === x));
  const GOOD = ['合', '三合', '六合'], HARD = ['刑', '冲'];
  const items = [];

  /* 1 日月互融（17）：一人太阳对另一人月亮的交叉相位，古典婚配第一指标；
     合相最吉，冲主互补相吸，刑为课题；双向皆成相（double whammy）为最强联结形态 */
  const lumiHits = hits.filter(h => (h.a === 'sun' && h.b === 'moon') || (h.a === 'moon' && h.b === 'sun'));
  let s1 = 6; const d1 = [];
  if(!lumiHits.length){ d1.push('双方日月无直接相位，意志与情感缺少天然咬合，联结靠后天经营建立'); }
  else {
    lumiHits.forEach(h => {
      if(h.type === '合') s1 += 7;
      else if(h.type === '三合') s1 += 5;
      else if(h.type === '六合') s1 += 4;
      else if(h.type === '冲') s1 += 2;
      else s1 -= 2;
    });
    if(lumiHits.length >= 2) s1 += 2;
    d1.push(lumiHits.map(h => `第一人${xz_dispName(h.a)}与第二人${h.bName}成${h.type}`).join('、'));
    if(lumiHits.length >= 2) d1.push('双向日月皆成相，意志与情感深度咬合，古典婚配中最强的联结形态');
    else if(GOOD.includes(lumiHits[0].type)) d1.push('日月相位和谐，意志与情感自然相投，古典婚配第一吉象');
    else if(lumiHits[0].type === '冲') d1.push('日月对冲，互补相吸的磁场，也须练习翻译彼此的情绪语言');
    else d1.push('日月相刑，意志与情感须刻意对齐，磨合出默契');
  }
  items.push(['日月互融', Math.max(2, Math.min(17, s1)), 17, d1.join('，')]);

  /* 2 月亮情感共鸣（17）：月月相位为主轴，月亮与其余星体的相位数为辅 */
  const mm = find2('moon', 'moon');
  let s2;
  const d2 = [];
  if(mm && GOOD.includes(mm.type)){ s2 = mm.type === '合' ? 18 : (mm.type === '三合' ? 16 : 14); d2.push(`双方月亮成${mm.type}，情绪节奏同步，彼此安心`); }
  else if(mm && mm.type === '冲'){ s2 = 10; d2.push('双方月亮对冲，情绪需求互补但易拉扯，须练习共情'); }
  else if(mm){ s2 = 6; d2.push('双方月亮相刑，安全感供给方式不同，须多体谅'); }
  else { s2 = 8; d2.push('双方月亮无主要相位，情感各自独立，宜主动分享心情'); }
  const moonAll = hits.filter(h => h.a === 'moon' || h.b === 'moon');
  const mGood = moonAll.filter(h => GOOD.includes(h.type)).length;
  const mHard = moonAll.filter(h => HARD.includes(h.type)).length;
  s2 += Math.max(-3, Math.min(3, mGood - mHard));
  d2.push(`月亮与他星和谐相位 ${mGood} 条、紧张 ${mHard} 条，按条数互抵（上限±3）计入本项`);
  items.push(['月亮情感共鸣', Math.max(2, Math.min(17, s2)), 17, d2.join('，')]);

  /* 3 金火吸引力（13）：金星火星之间全部交叉相位，和谐加分、紧张减分 */
  const pairsVF = hits.filter(h => (h.a === 'venus' || h.a === 'mars') && (h.b === 'venus' || h.b === 'mars'));
  const VN = {venus:'金星', mars:'火星'};
  let s3;
  const d3 = [];
  if(pairsVF.length){
    const g3 = pairsVF.filter(h => GOOD.includes(h.type)).length;
    const h3 = pairsVF.filter(h => HARD.includes(h.type)).length;
    s3 = Math.max(2, Math.min(13, 4 + g3 * 3 - h3 * 2));
    d3.push(pairsVF.map(h => `第一人${VN[h.a]}与第二人${VN[h.b]}成${h.type}`).join('、'));
    d3.push(`吸引与张力并存（和谐 ${g3} 条、紧张 ${h3} 条）`);
  } else { s3 = 4; d3.push('金火无主要相位，缺少天然的吸引与火花，吸引力须靠相处积累'); }
  items.push(['金火吸引力', s3, 13, d3.join('，')]);

  /* 4 土星承诺（13）：双方土星交叉相位为主轴，组合盘土星庙旺为辅，专业合盘中土星是承诺与持久的头号权重星 */
  const satHits = hits.filter(h => (h.a === 'saturn' || h.b === 'saturn') && h.a !== h.b);
  const sg = satHits.filter(h => GOOD.includes(h.type)).length;
  const sh = satHits.filter(h => HARD.includes(h.type)).length;
  let s4; const d4 = [`双方土星交叉相位和谐 ${sg} 条、紧张 ${sh} 条`];
  if(!satHits.length){ s4 = 4; d4.push('土星无主要相位，关系缺少结构性的黏合，承诺须完全自觉经营'); }
  else if(sh === 0){ s4 = 4 + Math.min(7, sg * 3); d4.push('土星相位尽和谐，责任与承诺自然成形，关系经得起时间'); }
  else if(sg === 0){ s4 = 4 - Math.min(3, sh * 2); d4.push('土星紧张相位偏重，相处自带考验与重量，是压力也是长期胶着点'); }
  else { s4 = 4 + Math.min(5, sg * 3) - Math.min(3, sh * 2); d4.push('土星和谐与张力并存，承诺在磨合中成形，熬过考验反而牢固'); }
  const digSat = XZ_DIGNITY.saturn, cSat = comp.planets.find(p => p.key === 'saturn');
  if(digSat.dom.includes(cSat.signT) || digSat.exa === cSat.signT){ s4 += 2; d4.push(`组合土星落${cSat.signT}（庙旺），责任结构清晰`); }
  else if(digSat.det.includes(cSat.signT) || digSat.fal === cSat.signT){ s4 -= 2; d4.push(`组合土星落${cSat.signT}（弱陷），承诺面偏涩，宜明责分工`); }
  items.push(['土星承诺', Math.max(2, Math.min(13, s4)), 13, d4.join('，')]);

  /* 5 宫位互落（13）：只取合盘中的重量级落宫点（日月金火与轴点）逐条计，关系宫（第一、五、七、八宫）
     每处加2分，疏离宫（第六、十二宫）每处减2分；余星落宫在整宫制下命中率过高，不具个体区分度故不计 */
  const relH = [1, 5, 7, 8], offH = [6, 12], KEYH = ['sun', 'moon', 'venus', 'mars', 'asc', 'mc'];
  const cntHouse = rows => {
    let r = 0; const names = [];
    rows.forEach(row => {
      if(!KEYH.includes(row.key)) return;
      if(relH.includes(row.house)){ r += 2; names.push(`${row.name}落对方第 ${row.house} 宫`); }
      else if(offH.includes(row.house)){ r -= 2; names.push(`${row.name}落对方第 ${row.house} 宫（疏离宫）`); }
    });
    return {r, names};
  };
  const cA = cntHouse(xz_overlayRows(chartA, chartB, true)), cB = cntHouse(xz_overlayRows(chartB, chartA, true));
  const s5 = Math.max(2, Math.min(13, 4 + Math.max(-3, Math.min(8, cA.r + cB.r))));
  const d5 = [`只计日月金火与轴点的落宫，关系宫每处加2分、疏离宫每处减2分，第一人净 ${cA.r} 格、第二人净 ${cB.r} 格`];
  const ex = cA.names.concat(cB.names).slice(0, 4).join('、');
  d5.push(ex ? `如：${ex}` : '双方重量级星体较少落入对方关系宫，亲密感需后天经营');
  items.push(['宫位互落', s5, 13, d5.join('，')]);

  /* 6 轴点宿命（13）：上升、下降、中天与对方星体的接触计分，直连日月为命运感最强的连线类型。
     上升与下降是一条轴的两端，计分前已按轴去重（xz_axisDedupe），同一条接触只计一次 */
  const AXIS = ['asc', 'dsc', 'mc'], LUMI = ['sun', 'moon'];
  const axHits = hits.filter(h => AXIS.includes(h.a) || AXIS.includes(h.b));
  const axLum = axHits.filter(h => LUMI.includes(h.a) || LUMI.includes(h.b));
  let s6 = 3; const d6 = [];
  if(!axHits.length){ d6.push('双方上升、下降、中天无主要接触，关系少宿命色彩，靠性格自然吸引'); }
  else {
    if(axLum.length) s6 += Math.min(7, axLum.length * 3);
    if(axHits.length > axLum.length) s6 += Math.min(3, axHits.length - axLum.length);
    d6.push(axHits.slice(0, 4).map(h => `第一人${xz_dispName(h.a)}与第二人${h.bName}成${h.type}`).join('、'));
    d6.push(axLum.length ? '轴点直连日月，是命运感最强的连线类型' : '轴点与他星连线，关系带明显的切入感与时机色彩');
  }
  items.push(['轴点宿命', Math.min(13, s6), 13, d6.join('，')]);

  /* 7 整体相位基调（14）：前六维只抽取特定星对，会丢弃大部分交叉相位信息（两张相近的盘可有五十余条
     相位却与陌生人同分）。本维按星体权重统计全部交叉相位的和谐占比：发光体1.5、个人星1.2、
     木土与轴点1.0、外行星0.7，两端取均值加权；和谐占比0.4起计分、0.8封顶，无交叉相位取低档5分。
     条数按轴点去重后的计分口径计（上升与下降是同一条轴线，不重复计）。 */
  const PT_W = {sun:1.5, moon:1.5, mercury:1.2, venus:1.2, mars:1.2, jupiter:1.0, saturn:1.0, asc:1.0, mc:1.0, dsc:1.0, uranus:0.7, neptune:0.7, pluto:0.7};
  let wG = 0, wH2 = 0;
  hits.forEach(h => {
    const wt = ((PT_W[h.a] || 1) + (PT_W[h.b] || 1)) / 2;
    if(GOOD.includes(h.type)) wG += wt;
    else if(HARD.includes(h.type)) wH2 += wt;
  });
  const wSum = wG + wH2;
  let s7; const d7 = [`全部交叉相位 ${hits.length} 条，加权后和谐 ${wG.toFixed(1)}、紧张 ${wH2.toFixed(1)}`];
  if(!wSum){ s7 = 5; d7.push('两张星盘之间没有成形的交叉相位，缺少互相牵引的作用力'); }
  else {
    const ratio = wG / wSum;
    s7 = Math.max(1, Math.min(14, Math.round(14 * (ratio - 0.4) / 0.4)));
    d7.push(`和谐占比 ${(ratio * 100).toFixed(0)}%，${ratio >= 0.7 ? '整体基调以和谐为主，相处顺手、摩擦少' : ratio >= 0.55 ? '和谐略占上风，偶有摩擦但多能化解' : ratio >= 0.45 ? '和谐与紧张大致相当，关系的甜与涩都来自同一批相位' : '紧张相位压过和谐，相处须持续投入耐心'}`);
  }
  items.push(['整体相位基调', s7, 14, d7.join('，')]);

  const total = items.reduce((s, it) => s + it[1], 0);
  return { items, total, level: xz_matchLevel(total), advice: xz_matchAdvice(total) };
}

/* 七维/综合分共用档位：五档映射与判语，合婚页同款（81/61/41/21 分界）。
   level 供综合分盒展示，advice 供综合建议；七维与综合分同用一套档位口径。 */
function xz_matchLevel(total){
  if(total >= 81) return '深度契合';
  if(total >= 61) return '良性契合';
  if(total >= 41) return '磨合互补';
  if(total >= 21) return '张力偏大';
  return '课题较多';
}
function xz_matchAdvice(total){
  if(total >= 81) return '两张星盘在情感、思维与吸引层面多点共振，是难得的契合组合；相位中的紧张面也可转化为共同成长的动力，宜珍惜经营。';
  if(total >= 61) return '整体契合度良好，个别相位带来的摩擦属正常互动张力，彼此包容沟通，关系可长稳发展。';
  if(total >= 41) return '双方各有引力也有张力，属磨合互补型组合；把紧张相位的课题谈开，关系反而走得更深。';
  if(total >= 21) return '紧张相位偏多，价值观与情绪节奏差异明显，须以真诚沟通与边界共识弥补，不宜过分乐观。';
  return '两盘共振点少、张力点多，相处费力；若仍愿同行，须正视差异、放低预期，以长期经营代替速配期待。';
}

/* 双人合盘专项评分：专项层满分 48，收留专业权重较低或属独立技法的指标，与 xz_matchScore 配套。
   组合盘三柱10（关系实体骨架，独立技法）、水星沟通10、元素互补10（气质背景）、
   外行星时代8（世代星背景）、情绪底色6（月亮元素气质）、太阳速览4（通行配对速览，
   专业口径中权重最低，由核心降入，满分压到专项最小，对综合分的影响控制在一点上下）。
   综合分 = 七维核心归一×0.7 + 专项归一×0.3（xz_matchFinal）。
   外行星-外行星的同代自对不计入（同代人生辰相近几乎必然成相，无个体信息量）。
   判定原料全部来自本文件已有真源（xz_matchCtx、xz_compositeChart、XZ_SIGN_PROFILE、XZ_SIGN_EL），
   不引入新的星历计算。ctx 为可选共享上下文（xz_matchFinal 传入以免重复计算），缺省则自行构建。
   返回 items（名、得分、满分、判语）与 total、max。 */
function xz_matchSpec(chartA, chartB, ctx){
  const c0 = ctx || xz_matchCtx(chartA, chartB);
  const hits = c0.hits, comp = c0.comp;
  const find2 = (x, y) => hits.find(h => (h.a === x && h.b === y) || (h.a === y && h.b === x));
  const GOOD = ['合', '三合', '六合'], HARD = ['刑', '冲'];
  const EL_GOOD = {火:'风', 风:'火', 土:'水', 水:'土'};
  const items = [];

  /* 1 组合盘三柱（10）：组合日月元素同调、组合日月相位、组合上升与双方本命上升同象，关系实体的骨架 */
  const elOf = lon => XZ_SIGN_EL[xz_signIndex(lon)];
  const cSun = comp.planets.find(p => p.key === 'sun'), cMoon = comp.planets.find(p => p.key === 'moon');
  const elCS = elOf(cSun.lonT), elCM = elOf(cMoon.lonT);
  let s1 = 4; const d1 = [`组合盘三柱：太阳${cSun.signT}、月亮${cMoon.signT}、上升${comp.ascSignT}`];
  if(elCS === elCM){ s1 += 2; d1.push(`组合日月同属${elCS}象，关系目标与情绪基调同调`); }
  else if(EL_GOOD[elCS] === elCM){ s1 += 1; d1.push('组合日月元素相生（火风相生、水土相济），目标与情感互为支撑'); }
  const cSM = comp.aspects.find(a2 => (a2.a === 'sun' && a2.b === 'moon') || (a2.a === 'moon' && a2.b === 'sun'));
  if(cSM){ if(GOOD.includes(cSM.type)){ s1 += 2; d1.push(`组合日月成${cSM.type}，关系内在顺畅`); } else { s1 += 1; d1.push(`组合日月成${cSM.type}，目标与情绪须刻意对齐`); } }
  else { d1.push('组合日月无主要相位，目标与情绪各自运作'); }
  const elCA = elOf(comp.ascLon);
  if(elCA === elOf(chartA.asc.lon) || elCA === elOf(chartB.asc.lon)){ s1 += 1; d1.push(`组合上升${comp.ascSignT}与一方本命上升同象，外在步调合拍`); }
  items.push(['组合盘三柱', Math.max(2, Math.min(10, s1)), 10, d1.join('，')]);

  /* 2 水星沟通（10）：水星水星相位优先，无则以水星全部交叉相位计 */
  const mmr = find2('mercury', 'mercury');
  let s2;
  const d2 = [];
  if(mmr){
    const tense = HARD.includes(mmr.type);
    s2 = tense ? 5 : 9;
    d2.push(`双方水星成${mmr.type}，${tense ? '思维方式差异明显，沟通须放慢确认' : '思维频道一致，聊得来'}`);
  } else {
    const mercAll = hits.filter(h => h.a === 'mercury' || h.b === 'mercury');
    const g2 = mercAll.filter(h => GOOD.includes(h.type)).length;
    const h2 = mercAll.filter(h => HARD.includes(h.type)).length;
    s2 = Math.max(3, Math.min(9, 5 + g2 - h2));
    d2.push(`双方水星无直接相位，靠共同话题经营沟通（和谐 ${g2} 条、紧张 ${h2} 条）`);
  }
  items.push(['水星沟通', s2, 10, d2.join('，')]);

  /* 3 元素互补（10）：十星四元素分布对照，一方至多1星的元素在另一方达3星及以上视为补益 */
  const elDist = c => {
    const d = {火:0, 土:0, 风:0, 水:0};
    XZ_PLANETS.forEach(p => { d[XZ_SIGN_EL[xz_signIndex(c.planets[p.key].lonT)]]++; });
    return d;
  };
  const dA = elDist(chartA), dB = elDist(chartB);
  let s3 = 4;
  const d3 = [];
  ['火', '土', '风', '水'].forEach(e => {
    if(dA[e] <= 1 && dB[e] >= 3){ s3 += 2; d3.push(`第一人缺${e}象，第二人以 ${dB[e]} 星补益`); }
    else if(dB[e] <= 1 && dA[e] >= 3){ s3 += 2; d3.push(`第二人缺${e}象，第一人以 ${dA[e]} 星补益`); }
    else if(dA[e] <= 1 && dB[e] <= 1){ s3 -= 2; d3.push(`双方同缺${e}象，该面向无人补位`); }
  });
  s3 = Math.max(2, Math.min(10, s3));
  const distStr = c => ['火', '土', '风', '水'].map(e => `${e}${c[e]}`).join('、');
  d3.unshift(`第一人十星 ${distStr(dA)}，第二人 ${distStr(dB)}`);
  if(!d3.slice(1).length) d3.push('双方元素分布相近，气质同调');
  items.push(['元素互补', s3, 10, d3.join('，')]);

  /* 4 外行星时代（8）：天海冥与对方敏感点的接触，和谐偏启发、紧张偏消融与动荡 */
  const OUT = ['uranus', 'neptune', 'pluto'];
  const outHits = hits.filter(h => (OUT.includes(h.a) || OUT.includes(h.b)) && !(OUT.includes(h.a) && OUT.includes(h.b)));
  const og = outHits.filter(h => GOOD.includes(h.type)).length;
  const oh = outHits.filter(h => HARD.includes(h.type)).length;
  let s4; const d4 = [];
  if(!outHits.length){ s4 = 3; d4.push('外行星与对方个人星无主要接触，关系基调由内行星主导，相处风格直白清晰'); }
  else {
    s4 = Math.max(2, Math.min(8, 3 + og - oh));
    d4.push(outHits.slice(0, 3).map(h => `第一人${xz_dispName(h.a)}与第二人${h.bName}成${h.type}`).join('、'));
    d4.push(og > oh ? '时代星以启发为主，关系带新鲜感与共同成长' : oh > og ? '时代星张力偏重，须防理想化、善变与权力暗流' : '时代星启发与张力并存，张力处即是功课');
  }
  items.push(['外行星时代', s4, 8, d4.join('，')]);

  /* 5 情绪底色（6）：双方月亮星座元素互照，相位量角度关系，元素量气质类别，两镜互补 */
  const elMA = XZ_SIGN_EL[xz_signIndex(chartA.planets.moon.lonT)], elMB = XZ_SIGN_EL[xz_signIndex(chartB.planets.moon.lonT)];
  let s5; const d5 = [`第一人月亮${chartA.planets.moon.signT}（${elMA}象）、第二人月亮${chartB.planets.moon.signT}（${elMB}象）`];
  if(elMA === elMB){ s5 = 6; d5.push(`月亮同属${elMA}象，安全感供给方式同频，情绪底色一致`); }
  else if(EL_GOOD[elMA] === elMB){ s5 = 4; d5.push('月亮元素相生（火风相生、水土相济），情绪上互为滋养'); }
  else if((elMA === '火' && elMB === '水') || (elMA === '水' && elMB === '火') || (elMA === '土' && elMB === '风') || (elMA === '风' && elMB === '土')){ s5 = 2; d5.push('月亮元素相冲（火水、土风），情绪节奏天生异频，须刻意共情'); }
  else { s5 = 3; d5.push('月亮元素相邻不同调，情绪表达方式有别，磨合后可互补'); }
  items.push(['情绪底色', s5, 6, d5.join('，')]);

  /* 6 太阳速览（4）：通行配对速览，专业口径中权重最低，满分与摆幅都压到专项最小，
     只作趣味参考，实际契合以七维交叉相位为准 */
  const sunA = xz_signName(chartA.planets.sun.lonT), sunB = xz_signName(chartB.planets.sun.lonT);
  const bestA = (XZ_SIGN_PROFILE[sunA].best || '').split('、');
  const hardA = (XZ_SIGN_PROFILE[sunA].hard || '').split('、');
  const bestB = (XZ_SIGN_PROFILE[sunB].best || '').split('、');
  const hardB = (XZ_SIGN_PROFILE[sunB].hard || '').split('、');
  const elSunA = XZ_SIGN_EL[xz_signIndex(chartA.planets.sun.lonT)], elSunB = XZ_SIGN_EL[xz_signIndex(chartB.planets.sun.lonT)];
  let s6; const d6 = [`第一人太阳${sunA}、第二人太阳${sunB}`];
  if(bestA.includes(sunB) && bestB.includes(sunA)){ s6 = 4; d6.push('互为通行最佳配对，速览层面高度契合'); }
  else if(sunA === sunB){ s6 = 3; d6.push('太阳同座，自我意志同频'); }
  else if(bestA.includes(sunB) || bestB.includes(sunA)){ s6 = 3; d6.push('一方落在另一方通行最佳配对之列'); }
  else if(elSunA === elSunB){ s6 = 3; d6.push(`太阳同属${elSunA}象，行事节奏相近`); }
  else if(hardA.includes(sunB) || hardB.includes(sunA)){ s6 = 1; d6.push('一方落在另一方通行挑战配对之列，性格易生摩擦'); }
  else { s6 = 2; d6.push('太阳速览层面平和'); }
  items.push(['太阳速览', s6, 4, d6.join('，')]);

  const total = items.reduce((s, it) => s + it[1], 0);
  const max = items.reduce((s, it) => s + it[2], 0);
  return { items, total, max };
}

/* 综合分聚合：综合分 = 七维核心归一×0.7 + 专项归一×0.3（与八字合婚页 SPEC_W=0.3 同口径），
   档位与判语按综合分重新定档。七维与专项共用一份交叉相位与组合盘（xz_matchCtx 一次算好），
   不重复调用 xz_synastryAspects 与 xz_compositeChart。返回 core（七维）、spec（专项）、
   composite、level、advice。 */
function xz_matchFinal(chartA, chartB){
  const ctx = xz_matchCtx(chartA, chartB);
  const core = xz_matchScore(chartA, chartB, ctx);
  const spec = xz_matchSpec(chartA, chartB, ctx);
  const specW = 0.3;
  const spec100 = spec.max ? spec.total / spec.max * 100 : 0;
  const composite = Math.round((1 - specW) * core.total + specW * spec100);
  return { core, spec, specW, composite, level: xz_matchLevel(composite), advice: xz_matchAdvice(composite) };
}

/* =================== 运势（日运、月运、年运：行运相位加权评分） ===================
   数据源为西占行运：逐日取真实星历（回归黄道地心黄经），行运十星对本命十星起主要相位，
   吉星（日金木水）和谐与合相加分，凶星（土火天海冥）刑冲减分，聚合成日分、月分、年分；
   代数和经 xz_ftPct 折算为百分制（50 分为中性基准，满分 100），档位一律按百分制划定。 */
const XZ_FT_BENEFIC = {sun:0.8, moon:0.5, mercury:0.6, venus:1.2, jupiter:1.6};
const XZ_FT_MALEFIC = {mars:-1.2, saturn:-1.2, uranus:-0.5, neptune:-0.5, pluto:-0.8};
/* 过轴加权力度：行运星合刑冲本命上升或中天是阶段性主线事件，其影响强于对一般本命星的同类相位 */
const XZ_FT_AXIS_W = 1.3;

/* 单条行运相位的吉凶分：行运星定基调，相位定方向；合相随行运星吉凶 */
function xz_ftAspectScore(tKey, type){
  if(type === '合') return (XZ_FT_BENEFIC[tKey] != null) ? XZ_FT_BENEFIC[tKey] : (XZ_FT_MALEFIC[tKey] || 0);
  if(type === '三合') return (tKey === 'jupiter') ? 1.6 : 1;
  if(type === '六合') return 0.7;
  if(type === '刑') return (XZ_FT_MALEFIC[tKey] != null) ? XZ_FT_MALEFIC[tKey] : -0.6;
  if(type === '冲') return (XZ_FT_MALEFIC[tKey] != null) ? XZ_FT_MALEFIC[tKey] * 0.8 : -0.5;
  return 0;
}

/* 由预计算黄经表求行运对本命敏感点（十星 + 上升 + 中天）的相位并计分（供批量逐日扫描） */
function xz_ftAspectsFromLons(chart, lon){
  const res = [];
  for(const p of XZ_PLANETS){
    const tl = lon[p.key];
    if(tl == null) continue;
    for(const pt of chart.ftPts){
      const hit = xz_aspectBetween(tl, pt.lon, p.key, pt.key);
      if(!hit) continue;
      const axis = pt.key === 'asc' || pt.key === 'mc';
      const s = xz_ftAspectScore(p.key, hit.type) * (axis ? XZ_FT_AXIS_W : 1);
      res.push({t:p.key, n:pt.key, nName:pt.name, nHouse:pt.house, type:hit.type, en:hit.en,
        exact:hit.exact, s:+s.toFixed(2)});
    }
  }
  return res;
}

function xz_ftScoreOf(asp){ return +asp.reduce((s, a) => s + a.s * (a.exact >= 0.5 ? 1.15 : 1), 0).toFixed(1); }
/* 百分制换算：raw 为加权代数和（无固定满分），按常规量程正负 10 分折算，50 分为中性基准；
   超出常规区间的极端值经双曲正切平滑压缩，不越出 0 至 100，保证任何日子都落在百分制内 */
function xz_ftPct(raw){ return Math.round(50 + 50 * Math.tanh(raw / 10)); }
/* 五档定级按百分制划定：65 顺遂 55 顺畅 45 平稳 35 波动，其余承压 */
function xz_ftLevel(pct){
  if(pct >= 65) return '顺遂';
  if(pct >= 55) return '顺畅';
  if(pct > 45) return '平稳';
  if(pct > 35) return '波动';
  return '承压';
}

/* 日运：当日综合分与五档、月亮过座过宫（情绪主场）、月亮相位、关键相位（按分绝对值取前五） */
function xz_fortuneDay(chart, y, m, d){
  const jd = xz_jd(y, m, d, 12, 0, chart.tz);
  const lon = xz_ephem_longitudes(jd);
  const asp = xz_ftAspectsFromLons(chart, lon);
  const score = xz_ftScoreOf(asp);
  const moonHouse = xz_houseAt(lon.moon, chart.cusps);
  const items = asp.slice().sort((x, y) => Math.abs(y.s) - Math.abs(x.s)).slice(0, 5);
  const pct = xz_ftPct(score);
  return {score, pct, level:xz_ftLevel(pct), moonSign:xz_signName(lon.moon), moonHouse,
    moonAsp:asp.filter(a => a.t === 'moon'), items};
}

/* 月运：逐日扫描当月，出逐日分、上中下旬均分、最佳与承压日、新月满月日、太阳过座过宫轨迹 */
function xz_fortuneMonth(chart, y, m){
  const dim = new Date(y, m, 0).getDate();
  const jd0 = xz_jd(y, m, 1, 12, 0, chart.tz);
  const dayLon = [];
  for(let i = 0; i < dim; i++) dayLon[i] = xz_lons10(jd0 + i);
  const scores = dayLon.map(L => xz_ftScoreOf(xz_ftAspectsFromLons(chart, L)));
  const pcts = scores.map(xz_ftPct);
  const segAvg = (a, b) => { let s = 0; for(let i = a; i < b; i++) s += pcts[i]; return Math.round(s / (b - a)); };
  const order = scores.map((s, i) => ({i, s})).sort((x, y) => y.s - x.s);
  let nmD = 1, fmD = 1, nmGap = 999, fmGap = 999;
  for(let i = 0; i < dim; i++){
    let el = Math.abs(xz_norm360(dayLon[i].moon - dayLon[i].sun)); if(el > 180) el = 360 - el;
    if(el < nmGap){ nmGap = el; nmD = i + 1; }
    if(180 - el < fmGap){ fmGap = 180 - el; fmD = i + 1; }
  }
  return {dim, scores, pcts, avg:Math.round(pcts.reduce((a, b) => a + b, 0) / dim), level:xz_ftLevel(Math.round(pcts.reduce((a, b) => a + b, 0) / dim)),
    xun:[segAvg(0, 10), segAvg(10, 20), segAvg(20, dim)],
    best:order.slice(0, 3).map(o => o.i + 1), hard:order.slice(-3).reverse().map(o => o.i + 1),
    newMoon:nmD, fullMoon:fmD,
    sunFrom:{sign:xz_signName(dayLon[0].sun), house:xz_houseAt(dayLon[0].sun, chart.cusps)},
    sunTo:{sign:xz_signName(dayLon[dim - 1].sun), house:xz_houseAt(dayLon[dim - 1].sun, chart.cusps)}};
}

/* 年运：逐日扫描全年，出十二个月均分与峰值、低谷月，并留存全年逐日分供量程与分位参照 */
function xz_fortuneYear(chart, y){
  const monthAvg = [], dayScores = [], dayPcts = [];
  for(let m = 1; m <= 12; m++){
    const r = xz_fortuneMonth(chart, y, m);
    monthAvg.push(r.avg);
    for(let i = 0; i < r.scores.length; i++){ dayScores.push(r.scores[i]); dayPcts.push(r.pcts[i]); }
  }
  const peak = monthAvg.indexOf(Math.max.apply(null, monthAvg)) + 1;
  const low = monthAvg.indexOf(Math.min.apply(null, monthAvg)) + 1;
  const avg = Math.round(dayPcts.reduce((a, b) => a + b, 0) / dayPcts.length);
  return {monthAvg, dayScores, dayPcts, peak, low, avg, level:xz_ftLevel(avg)};
}
