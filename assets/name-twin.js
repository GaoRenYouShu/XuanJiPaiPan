/* ============================================================
 * 联名命名引擎（assets/name-twin.js）
 * 供 xingming.html联名推荐模式使用；纯函数、无 DOM 依赖。
 *
 * 定位：解决两个名字之间如何关联的横向设计问题，
 * 现有姓名学能力全部是单体纵向分析（一个名字 vs 八字/五格/音律/谐音），
 * 本引擎专司多子女（双胞胎、兄弟姐妹、龙凤胎）的成对命名。
 *
 * 输入：xing（姓 1~2 字）、opt{method, len, kind, count, xi, ji, avoid}
 * 输出：{ok, list:[{idiom, def, split, desc, names:[{name, chars, score}]}]}
 *
 * 数据来源（全部站内现成资产，不新增数据文件）：
 *   NAME_IDIOMS  成语库 11228 条（key=四字成语，value=释义）
 *   NAME_CHARS   起名候选字 4271 字，8/12 位元组
 *                [拼音,声调,康熙笔画,结构,义五行,义类,性别倾向,适用度,?,义类,寓意句]
 *                寓意句（index 10，仅扩展元组有）自带不宜入名凡字少用标记，
 *                是站内既有的字级质量信号，本引擎直接消费，不自造贬义词表。
 *
 * 口径与边界（必须如实呈现，勿夸大）：
 *   1. 成语库非全量：同心同德、大同小异、温润如玉、卓尔不群、上善若水等常见成语未收录
 *      （实测 11228 条覆盖有限），未命中属数据缺口，不代表该成语不可用。
 *   2. 筛选为机器粗筛 + 义类排序，不保证每一条都合用，输出仅供灵感，须人工斟酌。
 *   3. 义五行、笔画等仍以页面既有口径为准，本引擎只做配字与排序。
 * ============================================================ */
window.NAME_TWIN = (function(){

  var N = window.NAME_CHARS || {};

  /* 成语库：name-idioms.js 在首屏之后延迟取回，故每次现取，不在模块载入时捕获 */
  function idioms(){ return window.NAME_IDIOMS || {}; }

  /* 义类权重：吉祥/品德类最高，通用类最低；用于排序而非淘汰 */
  /* 通用给 1 而非 0.5：同心、大同这类虚处见巧的联名，
   * 其字多半只标通用，压得太低会让最好的一档沉到几千名之后。 */
  /* 字库实际存在的其余 7 类一并纳入（缺失者权重恒 0）。
   * 容貌多俊美字与珍宝同档；动作/器物/动物取通用档；虚词仿通用从宽（之兮以虚见巧）；
   * 僧道/后妃生僻类压低，靠语义筛选而非硬淘汰。 */
  var CLS_W = { '吉祥':3, '品德':3, '才学':2.5, '气度':2, '珍宝':2,
    '草木':1.5, '天象':1.5, '水泽':1.5, '山岳':1.5, '容貌':1.5,
    '色彩':1, '时令':1, '通用':1, '动作':1, '器物':1, '动物':1,
    '虚词':1, '僧道':0.5, '后妃':0.5 };

  /* 强贬义字：成语字面命中即排除。
   * 只收几乎不出现在褒义语境的字，宁可漏排也不要误荐。
   * 与字库自带的不宜入名标记互补：本表管成语字面，字库标记管单字质量。 */
  var EVIL = ('哀挨矮悲惨痴蠢愚狂妄奸诈骗贪淫贼盗匪窃奴丐暴虐狠凶'
    + '祸殃灾秽臭腥朽枯凋毁败罪罚诛杀崩溃污陋鄙妒嫉恨怨愤怒恶'
    + '愁苦痛伤亡死丧病疾穷贱卑吝奢侈伪诡陷害迷惑惧恐'
    /* 第二批：字面中性甚至所在成语为褒义、但字本身不宜入名的字。
     * 判据是字入名是否相宜而非整条成语是否褒义，
     * 如“不骄不躁”“临危不惧”整条皆好，拆出的“骄”“危”却不宜作名，故一并剔除。
     * （利有弊、争分夺秒一类亦同此例：宁可严一格，不把不宜入名的字送进名单。） */
    + '弊鬼乱血寡散孤弃危争夺暗废竭瑕傲患泣邪哭尸毒妖魔咒骂'
    + '浊浑荒瞒谎缺困拙敝骄悔损凄疵劣懒僵耗潦厄惰芜滞疚憾');

  /* 联名法注册表：后续联名法（拆字/共用字/同义对仗）按同一契约接入 */
  /* 输出条数：调用方给 count 即按其取，未给即不限（该法候选能出多少出多少） */
  function lim(opt){ var c = opt && opt.count; return c > 0 ? c : Infinity; }

  /* 续取契约：调用方把已出的组 key 回传为 opt.exclude，引擎在取用阶段跳过，
     使主按钮续取每次拿到未出现过的新组。组 key 由各法自定并挂在 item.key 上，
     两名成组者（成语拆名、拆字合名、同义对仗）一律取与序无关的两名键：
     异序成语（克勤克俭与克俭克勤）、换序部件、同义对的两名互换，产出的都是同组两名，
     键必须相同，否则续取会把换序重排当成新组再次列出。
     页面只负责累积回传，不解析其内部结构。 */
  var EX = {};
  function exSet(opt){
    EX = {};
    var e = opt && opt.exclude;
    if(e && e.length) for(var i = 0; i < e.length; i++) EX[e[i]] = 1;
  }
  /* 两名成组的序无关键：字典序定先后，两名换序同键 */
  function pairKey(a, b){
    return a < b ? a + '|' + b : b + '|' + a;
  }

  /* 候选规模随需求扩展：已列组数与本次要取的条数之和决定配字窗、共用字窗开多大。
     首段只建够出一批的窗，续取时窗随已列数单调放大，故远处候选按需纳入，首段不付全量枚举成本。
     count 未给（不限）时直接取全量窗。 */
  function needSize(opt){
    var ex = (opt && opt.exclude) ? opt.exclude.length : 0;
    var c = (opt && opt.count > 0) ? opt.count : 0;
    return (c ? ex + c : ex) + 12;
  }
  /* 配字窗：候选组合数随窗呈平方增长，故取需求量的平方根量级，再留一档余量 */
  function mateWindow(poolLen, need, base){
    return Math.min(poolLen, Math.max(base, Math.ceil(Math.sqrt(need * 2)) + Math.round(base / 3)));
  }

  /* 配额去重：同一配字全榜最多出场 PER_CHAR_MAX 组，同一共用字最多 PER_SHARED_MAX 组。
     取配额而非全榜唯一，是为每组都换过面孔（头部不连出同一个字），总量仍随候选窗增长。 */
  var PER_CHAR_MAX = 3;
  var PER_SHARED_MAX = 2;

  var METHODS = [
    { key:'idiom', name:'成语拆名', desc:'四字成语拆成两个名字，合读仍是原成语' },
    { key:'split', name:'拆字合名', desc:'一个合体字拆作两字，两人各取其一，合起来仍是原字' },
    { key:'shared', name:'共用一字', desc:'一字系住血缘，另一字各表其意，可扩展到三孩四孩' },
    { key:'rank', name:'排行字', desc:'伯仲叔季标明长幼，另一字由配字池择优' },
    { key:'synonym', name:'同义对仗', desc:'两位置各用同义字替换，寓意相等而字面全异' }
  ];

  /* ---- 拆字合名 ----
   * 数据源：assets/cezi-data.js 的 CEZI 拆字字典（2517 字，字→部件串＋断语＋取格＋出处）。
   *
   * ⚠ 流派分歧，两说并存，须注明：
   *  【文字学（六书）口径】斌＝文＋武、仁＝人＋二、信＝人＋言、明＝日＋月，是会意字，
   *    两部件各自表义、相加成义，这才是可作起名依据的拆字。
   *  【测字民俗口径】伟＝人＋韦、佑＝人＋右、侣＝人＋吕，实为形声字（右半只表音），
   *    测字术一律附会作会意。站内 cezi-data.js 已自注属民俗演绎口径，非严格训诂。
   *  本引擎只取前者入名单，后者不推荐；判据见 isPhonoSemantic。
   */
  /* 拆字字典：cezi-data.js 在首屏之后延迟取回，故未到货时回落空表且不缓存空值 */
  var CZ = null;
  function cezi(){
    var d = window.CEZI_DATA;
    if(!CZ && d && d.CEZI) CZ = d.CEZI;
    return CZ || {};
  }

  /* 不堪独立入名的部件类别：拆得出（隶、折、口、鸟）却不成其为名 */
  var WEAK_PART = { '动作':1, '器物':1, '动物':1, '容貌':1, '虚词':1 };

  /* 部件黑名单：字库义类标注不区分入名适应性，隶标才学（隶书）、折标吉祥、
   * 鸟标通用，按义类筛不掉，只能人工登记。皆为拆得出却不堪作名之字。
   * 人工维护、发现问题即增补。 */
  var PART_BLACK = '隶折口鸟皿艮兑兼专各卜尸犬豕虫鼠瓦臼';

  /* 拼音去声调：wěi→wei，用于声旁同音判定 */
  function stripTone(py){
    return (py || '').toLowerCase()
      .replace(/[āáǎà]/g, 'a').replace(/[ōóǒò]/g, 'o')
      .replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i')
      .replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜü]/g, 'v')
      .replace(/[^a-z]/g, '');
  }

  /* 形声判定：末部件（右半、下半）与整字同音，即典型的形旁＋声旁结构。
   * 只查末部件而不查首部件，是因为形旁兼声的情况（仁＝人＋二，人既是形旁也与仁同音）
   * 若一并查首部件会误判，查末部件则二(èr)与仁(rén)不同音，仁得留在本档。 */
  function isPhonoSemantic(whole, parts){
    var w = stripTone(pinyinOf(whole));
    if(!w) return false;
    var last = parts[parts.length - 1];
    var lp = stripTone(pinyinOf(last));
    return !!lp && lp === w;
  }

  function isNameChar(c){ return Object.prototype.hasOwnProperty.call(N, c); }

  /* 字库自带质量标记：寓意句含不宜入名者硬淘汰。
   * 寓意取 NAME_YUYI：覆盖全部 4271 字，判定口径一致（页面 xingming.html 先于本引擎加载）。 */
  var YY = window.NAME_YUYI || {};
  function yiNote(c){ return YY[c] || ''; }
  function isBadChar(c){
    if(!isNameChar(c)) return true;
    return yiNote(c).indexOf('不宜入名') >= 0;
  }
  function isRareChar(c){
    return yiNote(c).indexOf('凡字少用') >= 0;
  }
  function cls(c){ return isNameChar(c) ? N[c][5] : ''; }
  function genderOf(c){ return isNameChar(c) ? N[c][6] : 0; }
  function fitOf(c){ return isNameChar(c) ? N[c][7] : -1; }
  function pinyinOf(c){ return isNameChar(c) ? N[c][0] : ''; }

  /* 重复字模式：仅允许无重复与1=32=4（ABAC 型，天然产生共用字）。
   * AABB（安安稳稳）、ABCC（白发苍苍）、AABC（彬彬有礼）叠字成名单调，一律排除。 */
  function dupPattern(k){
    var c0=k[0], c1=k[1], c2=k[2], c3=k[3];
    if(c0===c2 && c1!==c3) return 'abac13';
    if(c1===c3 && c0!==c2) return 'abac24';
    if(c0!==c1 && c0!==c2 && c0!==c3 && c1!==c2 && c1!==c3 && c2!==c3) return 'none';
    return 'dup';
  }

  /* 成语字面命中强贬义字 → 排除 */
  function hasEvil(k){
    for(var i=0;i<k.length;i++){ if(EVIL.indexOf(k[i]) >= 0) return true; }
    return false;
  }

  /* 释义级贬义：字面全是好字、整条却是贬义的成语（一迎一和指一味迎合、
   * 小恩小惠），单看字抓不到，只能从释义的贬义语境词入手。 */
  var DEF_EVIL = ['一味','讥讽','讽刺','嘲讽','挖苦','鄙视','轻视','看不起','阿谀','奉承',
    '谄媚','投机','钻营','势利','圆滑','敷衍','苟且','堕落','腐化','荒淫','懒惰','怯懦',
    '懦弱','阴险','狡猾','虚伪','自私','贪婪','残暴','蛮横','专横','固执','顽固','愚昧',
    '鲁莽','草率','马虎','潦草','吹捧','标榜','炫耀','卖弄','招摇','欺瞒','哄骗','诱惑',
    '挑拨','离间','陷害','报复','嫉妒','贪图','图谋','算计','玩弄','作弄','戏弄','侮辱',
    '凌辱','迫害','虐待','剥削','压榨','敲诈','勒索','侵占','霸占','含贬义','含讽',
    /* 道德与后果类负面语境词（不义、卖国、违法乱纪、不务正业、祸患祸害等）；
     * 只在释义整体呈负面时命中，字义解释型的“苟且”“祸患”偶有误伤
     * （如“羚羊挂角…以避祸患”），宁可从严，不放不宜入名的组合进名单。 */
    '有弊','弊端','坏处','害处','祸患','祸害','忘义','负义','不义','不仁','不忠',
    '不孝','失信','背弃','卖国','祸国','殃民','害人','害群','作歹','作奸犯科',
    '违法乱纪','不务正业','游手好闲','好逸恶劳','好吃懒做','为非作歹',
    /* 贬义语境短语（两字以上）：单字表与单词表抓不到“释义整条以贬义句式叙述”的条目，
     * 例如“作威作福”“造谣生事”“与虎添翼”字面四字皆好字，释义却明写
     * 滥用权力、制造谣言、帮助坏人。本表按释义的贬义语境词收，
     * 释义里出现即排除，不放不宜入名的组合进名单。 */
    '贬义','讥笑','耻笑','取笑','嘲笑','蔑视','迎合','巴结','讨好','逢迎','攀附','攀高',
    '投靠','出卖','卖身','卖友','卖主','卖官','丧失人格','依仗','仗势','欺压','欺侮','欺凌',
    '恃强','凌弱','压迫','掠夺','抢夺','盗窃','偷窃','盗匪','奸诈','诈骗','欺骗','骗取',
    '蒙骗','捏造','虚构','造谣','谣言','诽谤','毁谤','中伤','诬陷','栽赃','嫁祸','罗织',
    '搬弄是非','煽动','煽风','蛊惑','教唆','纵容','姑息','包庇','窝藏','同流合污',
    '狼狈为奸','朋比','结党','营私','舞弊','徇私','贪污','受贿','行贿','中饱私囊','盘剥',
    '搜刮','巧取豪夺','豪夺','鱼肉百姓','横征暴敛','欺世盗名','沽名','钓誉','口是心非',
    '阳奉阴违','两面三刀','见风使舵','趋炎附势','附势','嫌贫爱富','忘恩','背信','弃义',
    '背叛','坑人','骗人','糊弄','得过且过','苟安','偷安','醉生梦死','行尸走肉','尸位素餐',
    '滥竽充数','鱼目混珠','冒充','假冒','招摇撞骗','花言巧语','甜言蜜语','油嘴滑舌',
    '反复无常','朝三暮四','朝秦暮楚','半途而废','浅尝辄止','一曝十寒','夭折','泡影','落空',
    '破灭','绝望','穷途','末路','潦倒','落魄','寄人篱下','仰人鼻息','低三下四','低声下气',
    '忍气吞声','逆来顺受','委曲求全','苟且偷生','苟延残喘','尸横','血流','家破人亡',
    '妻离子散','流离失所','颠沛流离','生灵涂炭','民不聊生','哀鸿遍野','饿殍','惨无人道',
    '灭绝人性','丧心病狂','丧尽天良','伤天害理','天理难容','人神共愤','天怒人怨','怨声载道',
    '残忍','凶残','暴虐','肆虐','荼毒','蹂躏','践踏','摧残','戕害','屠戮','杀戮','凶暴',
    '霸道','横行','妄为','妄自尊大','独断','专行','独揽','弄权','擅权','专权','骄横','跋扈',
    '嚣张','凶悍','无理取闹','荒谬','放肆','放荡','淫乱','下流','猥琐','无耻','卑鄙','卑劣',
    '龌龊','肮脏','丑恶','丑陋','衰败','没落','败落','破产','亏空','祸根','灾祸','惹是生非',
    '无事生非','兴风作浪','滥用','假象','蒙蔽','自欺','掩人耳目','混淆','颠倒黑白',
    '指鹿为马','颠倒是非','忘本','数典忘祖','不齿','笑柄','把柄','唾弃','忤逆','败坏',
    '谋害','坏人','恶人','恶势力','小人','卑躬','屈膝','屈服','刻薄','尖酸','浅薄','无用',
    '招惹是非','招惹嫌疑','毫无斗志','袖手旁观','掩饰','故作姿态','矫揉造作','自招','虚假',
    '腐臭','遗臭','无耻之尤'];

  /* 豁免表：释义含上述贬义语境词、整条却是褒义的成语，逐条登记放行。
   * 方向不可自动推导：“不贪污、不受贿”与“贪污受贿”含同一个词，“不与坏人同流合污”
   * 与“勾结坏人”含同一个词，只能靠人工白名单。登记即豁免，随发现问题即增补。
   * 前两条为字面含强贬义字（EVIL 表）却整条褒义者。 */
  var KEEP_IDIOM = ['一清如水','公平正直','廉明公正','以义断恩','前庭悬鱼','羊续悬鱼',
    '好生之德','守望相助','真心实意','真心诚意','爱人以德','独清独醒','束修自好','束身自修',
    '束身自爱','洁身自好','洁身自爱','人心大快','大快人心','壮士断腕','壮士解腕','大梦初醒',
    '大梦方醒','饮水思源','酌水知源','归正守丘','归正首丘','首丘之情','犁庭扫穴','翦草除根',
    '止戈为武','摇尾涂中','持盈保泰','祁奚之荐','众口销金','春色撩人','摧折豪强','束杖理民',
    '自圆其说','蹈厉之志','妙语惊人','山木自寇','百代文宗','风行水上'];

  function defEvil(def, key){
    if(!def) return false;
    if(key && KEEP_IDIOM.indexOf(key) >= 0) return false;
    for(var i=0;i<DEF_EVIL.length;i++){ if(def.indexOf(DEF_EVIL[i]) >= 0) return true; }
    return false;
  }

  /* 成语级黑名单：字面与释义都抓不到、实则不宜入名的条目。
   * 典型如小恩小惠，库内释义仅作恩、惠给人的好处，全无贬义标注，
   * 字面四字又都是好字，规则无从识别，只能人工登记。
   * 本表为人工维护、发现问题即增补，不为求全而假装自动判准。 */
  var BLACK_IDIOM = ['小恩小惠'];

  /* 可用成语池：四字全在起名库 + 无不宜入名 + 无强贬义 + 重复模式合格。
   * 成语库未到货时返回空池且不落缓存，到货后首次调用即重建。 */
  var POOL = null;
  function idiomPool(){
    if(POOL) return POOL;
    var ID = idioms(), ks = Object.keys(ID);
    if(!ks.length) return [];
    var out = [];
    ks.forEach(function(k){
      if(k.length !== 4) return;
      var cs = k.split('');
      for(var i=0;i<4;i++){ if(isBadChar(cs[i])) return; }
      if(hasEvil(k)) return;
      if(defEvil(ID[k], k)) return;
      if(BLACK_IDIOM.indexOf(k) >= 0) return;
      var dp = dupPattern(k);
      if(dp === 'dup') return;
      out.push({ idiom:k, def:ID[k], dup:dp });
    });
    POOL = out;
    return POOL;
  }

  /* 数字与量词：入名偏直白（成千、成万、一迎），降权而不淘汰，
   * 百炼成钢的百字仍可入选，只是不占头部。 */
  var NUMISH = '一二三两四五六七八九十百千万亿兆零半双诸众';

  /* 名字取分：义类权重和 + 适用度（4=热字）；生僻字与数字量词降权 */
  function nameScore(chars){
    var s = 0;
    for(var i=0;i<chars.length;i++){
      var c = chars[i];
      s += (CLS_W[cls(c)] || 0);
      var f = fitOf(c);
      if(f === 4) s += 0.5;
      if(isRareChar(c)) s -= 1;
      if(NUMISH.indexOf(c) >= 0) s -= 1.2;
    }
    return s;
  }

  /* 前后两名的性别取向：
   * brother 兄弟、sister 姐妹、mixed 龙凤胎男先、mixedF 龙凤胎女先。
   * 龙凤胎两种次序都要有，龙凤胎落地谁先谁后本无定数。 */
  function wants(kind){
    if(kind === 'brother') return ['m', 'm'];
    if(kind === 'sister') return ['f', 'f'];
    if(kind === 'mixed') return ['m', 'f'];
    if(kind === 'mixedF') return ['f', 'm'];
    return ['any', 'any'];
  }
  /* 配字池的性别口径：单一性别照取；龙凤胎须男女字都在池里，故取 any */
  function poolWant(kind){
    return (kind === 'brother') ? 'm' : (kind === 'sister' ? 'f' : 'any');
  }

  /* 性别适配：kind=brother 排除女字，sister 排除男字，mixed 各就各位 */
  function genderOk(chars, want){
    if(want === 'any') return true;
    for(var i=0;i<chars.length;i++){
      var g = genderOf(chars[i]);
      if(want === 'm' && g === -1) return false;
      if(want === 'f' && g === 1) return false;
    }
    return true;
  }

  /* 避讳：字与音节两层，与页面 parseAvoid 契约一致 */
  function avoidOk(chars, avoid){
    if(!avoid) return true;
    for(var i=0;i<chars.length;i++){
      if(avoid.chars && avoid.chars.indexOf(chars[i]) >= 0) return false;
      if(avoid.syls){
        var py = pinyinOf(chars[i]);
        for(var j=0;j<avoid.syls.length;j++){ if(py === avoid.syls[j]) return false; }
      }
    }
    return true;
  }

  /* 名与姓同字 → 淘汰（与页面五格口径一致：名与姓同字直接淘汰） */
  function xingOk(chars, xing){
    for(var i=0;i<chars.length;i++){
      if(xing.indexOf(chars[i]) >= 0) return false;
    }
    return true;
  }

  /* 拆分方案：len=2 取对半(AB|CD)与交错(AC|BD)；len=1 取 1-3 位与 2-4 位。
   * 交错拆只在四字互异时可用：ABAC 型（如 良知良能）交错会拆出良良这种叠字名。 */
  function splits(k, len, dup){
    var c = k.split('');
    if(len === 2){
      if(dup !== 'none'){
        return [ { split:'half', a:[c[0],c[1]], b:[c[2],c[3]], desc:'对半拆：各取成语一半' } ];
      }
      return [
        { split:'half',  a:[c[0],c[1]], b:[c[2],c[3]], desc:'对半拆：各取成语一半' },
        { split:'cross', a:[c[0],c[2]], b:[c[1],c[3]], desc:'交错拆：一三位、二四位各自成组' }
      ];
    }
    return [
      { split:'p13', a:[c[0]], b:[c[2]], desc:'各取一、三位' },
      { split:'p24', a:[c[1]], b:[c[3]], desc:'各取二、四位' }
    ];
  }

  /* 联名关系描述：只说两名之间是什么关系。
   * 卡头已列成语原文与拆法标签、卡内已列两名全名，此处再复述一遍即“学书学剑”式的同义反复，
   * 故只讲拆法的实质，不复述成语名与两名。 */
  function relDesc(item, dup, a, b){
    if(a.length === 1) return '四字成语各取一字成两名单名，余二字不入名。';
    if(dup === 'abac13') return '两名共用首字，另一字分别取成语第二、第四位。';
    if(dup === 'abac24') return '两名共用末字，另一字分别取成语第一、第三位。';
    if(item.split === 'cross') return '交错取字：一名取一、三位，另一名取二、四位，四字尽入两名。';
    return '对半取字：一名取前二字，另一名取后二字，四字尽入两名。';
  }

  /* 拆字合名：整字拆作两部件，两人各取其一（故只支持单字名）。
   * opt.whole 可指定合体字（留空则遍历拆字字典）。 */
  function genSplit(xing, opt){
    var CZD = cezi();
    if(!Object.keys(CZD).length){
      return { ok:false, reason:'拆字字典未加载，请确认 cezi-data.js 已引入。' };
    }
    var kind = opt.kind || 'any';
    var wd = wants(kind), wantA = wd[0], wantB = wd[1];
    var out = [], seen = {}, tally = {}, total = 0;

    var keys = Object.keys(CZD);
    var fixed = String(opt.whole || '').trim();
    if(fixed){
      if(fixed.length !== 1){
        return { ok:false, reason:'拆字合名请填单个汉字：一个合体字拆作两部件，恰成两个单字名。' };
      }
      if(!CZD[fixed]){
        return { ok:false, reason:'站内拆字字典未收录“' + fixed + '”，暂无法拆解；可换一字再试。' };
      }
      if(isBadChar(fixed)){
        return { ok:false, reason:'合体字“' + fixed + '”字库标注不宜入名，请更换。' };
      }
      keys = [fixed];
    }

    keys.forEach(function(z){
      var e = CZD[z];
      if(!e.c) return;
      /* 合体字本身须是好字：拆字联名的说服力正在于两人合起来是那个字，
       * 若整字只是桌、铿一类，两名之间的关联就落空了。 */
      if(isBadChar(z)) return;
      e.c.forEach(function(d){
        /* 吉凶只认字典自带的 l 字段（ji/ping/xiong）：山＋朋＝崩，崩坼之戒         * 女＋兼＝嫌，两嫌之隙这类凶拆，字面看不出来，唯有 l 标得住。 */
        if(d.l && d.l !== 'ji') return;
        /* 剔除结构兜底模板：未收录字由 cezi-engine 按字形自动生成的占位断语
         * （巩 为左右形，从工部，得凡之构，全库 724 条），不是真拆法，
         * 且这类字多为形声（巩、蹲、秸），拿来拆名毫无意义。 */
        if(/为(左右|上下|包围|半包围|独体|品字)形/.test(d.n || '')) return;
        if(/得.{1,2}之构/.test(d.n || '')) return;
        /* 拆型不作硬筛：斌在库中标离合而非会意，若只取会意会把最好的一例漏掉；
         * 排除象形即可，象形拆出的两部件多是笔画而非成字。 */
        if(d.t === '象形') return;
        var ps = (d.p || '').split('');
        if(ps.length !== 2 || ps[0] === ps[1]) return;
        if(isBadChar(ps[0]) || isBadChar(ps[1])) return;
        /* 两部件都得是能独立作名字的字：隶、折、口、鸟一类拆得出来却不堪入名 */
        if(WEAK_PART[cls(ps[0])] || WEAK_PART[cls(ps[1])]) return;
        if(PART_BLACK.indexOf(ps[0]) >= 0 || PART_BLACK.indexOf(ps[1]) >= 0) return;
        /* 形声字右半只表音，不作会意拆；但字典已标注会意者属会意兼形声，
           人工标注优先于拼音启发式，不再二次剔除 */
        if(d.t !== '会意' && isPhonoSemantic(z, ps)) return;
        var a = [ps[0]], b = [ps[1]];
        if(!genderOk(a, wantA) || !genderOk(b, wantB)) return;
        if(!avoidOk(a, opt.avoid) || !avoidOk(b, opt.avoid)) return;
        if(!xingOk(a, xing) || !xingOk(b, xing)) return;
        var key = pairKey(ps[0], ps[1]) + '|' + z;
        if(!tally[key]){ tally[key] = 1; total++; }
        if(seen[key] || EX[key]) return;
        seen[key] = 1;
        var sa = nameScore(a), sb = nameScore(b);
        /* 整字质量计入排序：义类权重为主，热字再加分，明（天象）、好（吉祥）由此得以前列 */
        var sw = (CLS_W[cls(z)] || 0) * 0.8 + (fitOf(z) === 4 ? 0.5 : 0);
        out.push({
          key:key, whole:z, parts:ps, note:d.n || '', ge:d.ge || '', geSrc:d.geSrc || '',
          names:[ { name:ps[0], chars:a, score:sa }, { name:ps[1], chars:b, score:sb } ],
          score:(sa + sb) / 2 + sw
        });
      });
    });

    if(!out.length){
      /* 全部候选都已在先前批次列出（剔尽）而非无候选：返回空名单交页面出列尽提示 */
      if(total) return { ok:true, method:'split', list:[], candidateCount:total };
      return { ok:false, reason: fixed
        ? '“' + fixed + '”未能拆出两个宜入名的部件：或字典只作形声与象形拆、或部件不宜入名（隶、折、口、鸟一类）、或与姓同字、或命中避讳。'
        : '当前条件下没有合格候选。' };
    }
    out.sort(function(p, q){ return q.score - p.score; });
    return { ok:true, method:'split', list:out.slice(0, lim(opt)), candidateCount:total };
  }

  /* ---- 共用字与排行字 ----
   * 共用一字（茁安、柚安、恩佐、恩佑）：一字系住血缘，另一字各表其意，
   * 且可扩展到三孩四孩（恩尚、恩夏），是民间最常用的联名法。
   * 排行字（伯阳、仲明）：伯仲叔季标明长幼，是宗法社会的旧制，今人取之多为古雅。 */

  /* 配字池：好义类 + 有适用度评级 + 非数字量词 + 性别适配，按分降序 */
  var POOL_CACHE = {};
  function matePool(want){
    if(POOL_CACHE[want]) return POOL_CACHE[want];
    var OK = { '吉祥':1, '品德':1, '才学':1, '气度':1, '珍宝':1, '草木':1, '天象':1, '水泽':1, '山岳':1 };
    var out = [];
    Object.keys(N).forEach(function(c){
      if(isBadChar(c)) return;
      if(hasEvil(c)) return; /* 与成语同一把尺：字面带负面义的字不作配字（骄、傲、孤、危一类） */
      if(!OK[cls(c)]) return;
      if(fitOf(c) < 0) return;
      if(NUMISH.indexOf(c) >= 0) return;
      if(want === 'm' && genderOf(c) === -1) return;
      if(want === 'f' && genderOf(c) === 1) return;
      out.push(c);
    });
    out.sort(function(a, b){ return nameScore([b]) - nameScore([a]); });
    POOL_CACHE[want] = out;
    return out;
  }
  /* 同义词配字池（仅供同义对仗方法内部查同义词用）：
   * 不限义类，同义字的义类未必与基准字同（例如宏的同义大属数理，雄属气度）；
   * 若套用 matePool 的 OK 义类过滤，多数真同义字被剔光，sim=1.0 永远落不到。
   * 此处只剔不宜入名 / 适用度 <0 / 数词，保留全部余下候选。 */
  var SYN_POOL_CACHE = {};
  function synPool(want){
    if(SYN_POOL_CACHE[want]) return SYN_POOL_CACHE[want];
    var out = [];
    Object.keys(N).forEach(function(c){
      if(isBadChar(c)) return;
      if(hasEvil(c)) return; /* 同 matePool：负面字不作同义配字 */
      if(fitOf(c) < 0) return;
      if(NUMISH.indexOf(c) >= 0) return;
      if(want === 'm' && genderOf(c) === -1) return;
      if(want === 'f' && genderOf(c) === 1) return;
      out.push(c);
    });
    out.sort(function(a, b){ return nameScore([b]) - nameScore([a]); });
    SYN_POOL_CACHE[want] = out;
    return out;
  }

  /* 排行字：男用伯仲叔季，女用孟仲叔季（孟姜之例），大、小、长、幼则男女通用 */
  var RANK_PAIRS = [
    { pair:['伯','仲'], kind:'m', desc:'伯为长、仲为次' },
    { pair:['伯','叔'], kind:'m', desc:'伯为长、叔为三' },
    { pair:['仲','季'], kind:'m', desc:'仲为次、季为幼' },
    { pair:['孟','仲'], kind:'f', desc:'孟为长、仲为次（女子亦用孟，如孟姜）' },
    { pair:['孟','季'], kind:'f', desc:'孟为长、季为幼' },
    { pair:['大','小'], kind:'any', desc:'长幼以大小别之，最直白' },
    { pair:['长','幼'], kind:'any', desc:'长幼相对' }
  ];

  /* 共用一字 */
  function genShared(xing, opt){
    var kind = opt.kind || 'any';
    var wd = wants(kind), wantA = wd[0], wantB = wd[1];
    var pool = matePool(poolWant(kind));
    if(!pool.length) return { ok:false, reason:'可用配字不足。' };
    var pos = opt.pos || 'tail';
    var fixed = opt.shared || '';
    if(fixed && isBadChar(fixed)){
      return { ok:false, reason:'共用字“' + fixed + '”字库未收录或标注不宜入名，拆出的名字无法核算五格，请换常用字。' };
    }
    if(fixed && xing.indexOf(fixed) >= 0){
      return { ok:false, reason:'共用字“' + fixed + '”与姓氏同字，五格口径下须避。' };
    }
    /* 配字窗随已列组数放大，续取时窗再扩；指定共用字时窗按单次总量取定值，候选口径批间恒定 */
    var need = fixed ? lim(opt) : needSize(opt);
    var M = mateWindow(pool.length, need, 24);
    var U = fixed ? 1 : Math.min(pool.length, Math.max(30, Math.ceil(need / (M * (M - 1) / 2 || 1)) + 8));
    var sharedList = fixed ? [fixed] : pool.slice(0, U);
    var out = [], tally = {}, total = 0;

    sharedList.forEach(function(sc){
      if(!fixed && isBadChar(sc)) return;
      var mates = [];
      for(var i = 0; i < pool.length && mates.length < M; i++){
        var m = pool[i];
        if(m === sc) continue;
        if(stripTone(pinyinOf(m)) === stripTone(pinyinOf(sc))) continue; /* 同音则不辨，失了各表其意的用处 */
        mates.push(m);
      }
      for(var a = 0; a < mates.length; a++){
        for(var b = a + 1; b < mates.length; b++){
          var n1 = (pos === 'head') ? [sc, mates[a]] : [mates[a], sc];
          var n2 = (pos === 'head') ? [sc, mates[b]] : [mates[b], sc];
          if(!genderOk(n1, wantA) || !genderOk(n2, wantB)) continue;
          if(!avoidOk(n1, opt.avoid) || !avoidOk(n2, opt.avoid)) continue;
          if(!xingOk(n1, xing) || !xingOk(n2, xing)) continue;
          var k = sc + '|' + mates[a] + mates[b];
          if(!tally[k]){ tally[k] = 1; total++; }
          if(EX[k]) continue;
          var sa = nameScore(n1), sb = nameScore(n2);
          out.push({
            key:k, shared:sc, pos:pos, mateKey:mates[a] + mates[b],
            names:[ { name:n1.join(''), chars:n1, score:sa },
                    { name:n2.join(''), chars:n2, score:sb } ],
            score:(sa + sb) / 2
          });
        }
      }
    });

    out.sort(function(p, q){ return q.score - p.score; });
    var used = {}, usedShared = {}, uniq = [];
    for(var i = 0; i < out.length; i++){
      var it = out[i], m0 = it.mateKey[0], m1 = it.mateKey[1];
      if((used[m0] || 0) >= PER_CHAR_MAX || (used[m1] || 0) >= PER_CHAR_MAX) continue;
      /* 用户指定了共用字时不再限共用字出场次数，他要的就是这一个字的多套配法 */
      if(!fixed && (usedShared[it.shared] || 0) >= PER_SHARED_MAX) continue;
      used[m0] = (used[m0] || 0) + 1; used[m1] = (used[m1] || 0) + 1;
      usedShared[it.shared] = (usedShared[it.shared] || 0) + 1;
      uniq.push(it);
      if(uniq.length >= (lim(opt))) break;
    }
    /* 窗内候选全部已列（剔尽）时交空名单，页面据此出列尽提示；
       candidateCount 为含已列的窗内全量候选数，批次间不再递减 */
    return { ok:true, method:'shared', list:uniq, candidateCount:total };
  }

  /* 排行字：排行字定长幼，另一字由配字池择优。
   * opt.rank 可指定排行字：两字即直接作排行对（如“伯仲”），
   * 一字则在内置排行对中找含该字者（如“伯”→伯仲、伯叔，取先出者）。 */
  function genRank(xing, opt){
    var kind = opt.kind || 'any';
    var wd = wants(kind), wantA = wd[0], wantB = wd[1];
    var pool = matePool(poolWant(kind));
    var out = [], tally = {}, total = 0;
    var fixed = String(opt.rank || '').trim();
    var pairs = RANK_PAIRS, userRank = false;

    if(fixed){
      userRank = true;
      var rk = fixed.split('');
      if(rk.length === 1){
        var hit = null;
        for(var h = 0; h < RANK_PAIRS.length; h++){
          if(RANK_PAIRS[h].pair.indexOf(rk[0]) >= 0){ hit = RANK_PAIRS[h]; break; }
        }
        if(!hit){
          return { ok:false, reason:'“' + rk[0] + '”不在内置排行字内（伯仲叔季、孟、大、小、长、幼）。'
            + '也可直接填两个字自定排行对，如“伯仲”。' };
        }
        pairs = [hit];
      } else if(rk.length === 2){
        if(rk[0] === rk[1]) return { ok:false, reason:'排行字请填两个不同的字，如“伯仲”。' };
        pairs = [{ pair:rk, kind:'any', desc:'指定排行字：' + rk[0] + '在前、' + rk[1] + '在后' }];
      } else {
        return { ok:false, reason:'排行字最多两个字，如“伯仲”。' };
      }
    }

    /* 配字窗随已列组数放大：每对排行字在窗内可组合出上千组，续取时窗再扩；
       指定排行字时窗按单次总量取定值，候选口径批间恒定 */
    var need = userRank ? lim(opt) : needSize(opt);
    var M = mateWindow(pool.length, need, 30);
    pairs.forEach(function(rp){
      if(!userRank){
        if(wantA !== wantB && wantA !== 'any'){
          /* 龙凤胎：伯仲为男序、孟为女序，男女不同排行体系，故只用大小、长幼等通用字 */
          if(rp.kind !== 'any') return;
        } else {
          if(wantA === 'm' && rp.kind === 'f') return;
          if(wantA === 'f' && rp.kind === 'm') return;
        }
      }
      if(isBadChar(rp.pair[0]) || isBadChar(rp.pair[1])) return;
      if(xing.indexOf(rp.pair[0]) >= 0 || xing.indexOf(rp.pair[1]) >= 0) return;
      var mates = pool.slice(0, M);
      for(var a = 0; a < mates.length; a++){
        for(var b = a + 1; b < mates.length; b++){
          var n1 = [rp.pair[0], mates[a]], n2 = [rp.pair[1], mates[b]];
          if(!genderOk(n1, wantA) || !genderOk(n2, wantB)) continue;
          if(!avoidOk(n1, opt.avoid) || !avoidOk(n2, opt.avoid)) continue;
          if(!xingOk(n1, xing) || !xingOk(n2, xing)) continue;
          var k = rp.pair.join('') + '|' + mates[a] + mates[b];
          if(!tally[k]){ tally[k] = 1; total++; }
          if(EX[k]) continue;
          var sa = nameScore(n1), sb = nameScore(n2);
          out.push({
            key:k, rankPair:rp.pair, rankDesc:rp.desc, mateKey:mates[a] + mates[b],
            names:[ { name:n1.join(''), chars:n1, score:sa },
                    { name:n2.join(''), chars:n2, score:sb } ],
            score:(sa + sb) / 2
          });
        }
      }
    });

    if(!out.length){
      /* 窗内候选全部已列（剔尽）而非无候选：交空名单由页面出列尽提示 */
      if(total) return { ok:true, method:'rank', list:[], candidateCount:total };
      return { ok:false, reason: fixed
        ? '按排行字“' + fixed + '”配不出合格的两名：或排行字与姓同字、或可用配字不足、或命中避讳。'
        : '当前条件下没有合格候选。' };
    }
    out.sort(function(p, q){ return q.score - p.score; });
    /* 排行字多样性：先按排行对（伯仲/伯叔/仲季/大小/长幼…）分组，每组各取 1 条占位，
     * 再按分数补足，否则高分 rp（笔画合局）会垄断前 20 条，其他排行对全军覆没。
     * 配字按全榜配额（每字最多 PER_CHAR_MAX 组），头部每组都换过配字，总量不受窗内字数所限。
     * 注：兄弟/姐妹模式下被 kind 过滤后只剩 5 种对；any 模式 7 种，皆足够多样。 */
    var byRP = {};
    out.forEach(function(it){
      var k = it.rankPair[0] + '+' + it.rankPair[1];
      (byRP[k] = byRP[k] || []).push(it);
    });
    var used = {}, uniq = [];
    Object.keys(byRP).forEach(function(k){
      var arr = byRP[k];
      if(!arr.length) return;
      var it = arr.shift();
      used[it.mateKey[0]] = (used[it.mateKey[0]] || 0) + 1;
      used[it.mateKey[1]] = (used[it.mateKey[1]] || 0) + 1;
      uniq.push(it);
    });
    /* 剩余按分数排序，配字按配额取 */
    var rest = [];
    Object.keys(byRP).forEach(function(k){ rest = rest.concat(byRP[k]); });
    rest.sort(function(p, q){ return q.score - p.score; });
    for(var i = 0; i < rest.length && uniq.length < (lim(opt)); i++){
      var it = rest[i];
      if((used[it.mateKey[0]] || 0) >= PER_CHAR_MAX || (used[it.mateKey[1]] || 0) >= PER_CHAR_MAX) continue;
      used[it.mateKey[0]] = (used[it.mateKey[0]] || 0) + 1;
      used[it.mateKey[1]] = (used[it.mateKey[1]] || 0) + 1;
      uniq.push(it);
    }
    return { ok:true, method:'rank', list:uniq.slice(0, lim(opt)), candidateCount:total };
  }

  /* ---- 同义对仗 ----
   * 亦卓、也越：两个位置各用同义字替换（亦＝也、卓＝越），
   * 寓意完全相等而字面一字不重，等于把一模一样的祝福写给两个人。
   * 站内无同义词词典，故以义类相同 + 寓意句字面重合度近似，
   * 属启发式，只作候选，是否真同义仍须人眼判定。 */

  /* 寓意句取寓之后的部分（卓尔不群、远见卓识）。
   * 取自 NAME_YUYI（4261 字全覆盖）而非字库第 11 位，后者仅扩展元组才有，
   * 卓、越、嘉、美这些恰恰没有，拿它算相似度会全线落空。 */
  function yuTail(c){
    var Y = window.NAME_YUYI || {};
    var s = Y[c] || yiNote(c);
    var i = s.indexOf('寓');
    return i >= 0 ? s.slice(i + 1) : s;
  }
  /* 字面重合度：同义字的寓意句往往用同样的字眼（嘉、美皆美好，卓、越皆超越） */
  function yuSim(c1, c2){
    var a = yuTail(c1), b = yuTail(c2);
    if(!a || !b || a === b) return 0;
    var set = {};
    for(var i = 0; i < a.length; i++) set[a[i]] = 1;
    var hit = 0;
    for(var j = 0; j < b.length; j++){ if(set[b[j]]) hit++; }
    return hit / Math.max(a.length, b.length, 1);
  }
  /* 同义词词林直查：若二字均被词林收录且互为同义，返回 1.0；
   * 否则回落到 yuSim 启发式估算（字面重合度）。
   * 数据源：assets/name-synonyms.js（哈工大《同义词词林扩展版》同义行；9291 组、37479 词条、38 万关系）。
   * 该表在首屏之后延迟取回，故每次调用现取，不在模块载入时捕获。*/
  function synSim(c1, c2){
    var SYN = window.NAME_SYNONYMS;
    if(SYN){
      var s1 = SYN[c1], s2 = SYN[c2];
      if(s1 && s1.indexOf(c2) >= 0) return 1.0;
      if(s2 && s2.indexOf(c1) >= 0) return 1.0;
    }
    return yuSim(c1, c2);
  }

  /* opt.syn 可指定同义字：填两字（如“卓越”）即以此二字为两名首字的对仗，
   * 第二字仍由引擎找一对同义字补全，保持“两个位置皆对仗”的方法本义；
   * 填一字则由词林为该字补一个同义伙伴。 */
  function genSynonym(xing, opt){
    var kind = opt.kind || 'any';
    var wd = wants(kind), wantA = wd[0], wantB = wd[1];
    var out = [], tally = {}, total = 0;
    var big = synPool('any');
    var fixed = String(opt.syn || '').trim();

    if(fixed){
      var fc = fixed.split('');
      if(fc.length > 2) return { ok:false, reason:'同义字最多两个字，如“卓越”。' };
      for(var q = 0; q < fc.length; q++){
        if(isBadChar(fc[q])) return { ok:false, reason:'同义字“' + fc[q] + '”字库未收录或标注不宜入名，拆出的名字无法核算五格，请换常用字。' };
      }
      var c1 = fc[0], c2 = fc[1] || '';
      if(c2 && c1 === c2) return { ok:false, reason:'同义字请填两个不同的字，如“卓越”。' };
      if(!c2){
        var best = '', bs = 0;
        for(var i = 0; i < big.length; i++){
          var t = big[i];
          if(t === c1) continue;
          if(stripTone(pinyinOf(t)) === stripTone(pinyinOf(c1))) continue;
          var s = synSim(t, c1);
          if(s > bs){ bs = s; best = t; }
        }
        if(!best){
          return { ok:false, reason:'站内同义词词典未收录“' + c1 + '”的同义字，请直接填两个字，如“卓越”。' };
        }
        c2 = best;
      }
      var simHead = synSim(c1, c2);
      var poolF = matePool(poolWant(kind));
      /* 全空间一次收齐：候选口径（含已列）批间恒定，续取整段剔除已列组，列尽才空；
         单批展示量由 lim 截取，不在此截断，否则候选数会随点击虚增 */
      for(var m = 0; m < poolF.length; m++){
        var p1 = poolF[m];
        if(p1 === c1 || p1 === c2) continue;
        var found = '', fs = 0;
        for(var n = 0; n < big.length; n++){
          var x = big[n];
          if(x === c1 || x === c2 || x === p1) continue;
          if(stripTone(pinyinOf(x)) === stripTone(pinyinOf(p1))) continue;
          var sx = synSim(x, p1);
          if(sx >= 0.15 && sx > fs){ fs = sx; found = x; }
        }
        if(!found) continue;
        var fn1 = [c1, p1], fn2 = [c2, found];
        if(!genderOk(fn1, wantA) || !genderOk(fn2, wantB)) continue;
        if(!avoidOk(fn1, opt.avoid) || !avoidOk(fn2, opt.avoid)) continue;
        if(!xingOk(fn1, xing) || !xingOk(fn2, xing)) continue;
        var fkf = pairKey(fn1.join(''), fn2.join(''));
        if(!tally[fkf]){ tally[fkf] = 1; total++; }
        if(EX[fkf]) continue;
        var fsa = nameScore(fn1), fsb = nameScore(fn2);
        out.push({
          key:fkf, base:fn1, syn:fn2, sim:(simHead + fs) / 2, userSyn:[c1, c2],
          names:[ { name:fn1.join(''), chars:fn1, score:fsa },
                  { name:fn2.join(''), chars:fn2, score:fsb } ],
          score:(fsa + fsb) / 2 + (simHead + fs) * 2
        });
      }
      if(!out.length){
        /* 全部候选已列（剔尽）而非配不出：交空名单由页面出列尽提示 */
        if(total) return { ok:true, method:'synonym', list:[], candidateCount:total };
        return { ok:false, reason:'按同义字“' + c1 + c2 + '”配不出合格的两名：或与姓同字、或命中避讳、或可用配字不足。' };
      }
      out.sort(function(p, q){ return q.score - p.score; });
      var usedF = {}, uniqF = [];
      for(var u = 0; u < out.length; u++){
        var itF = out[u];
        if(usedF[itF.key]) continue;
        usedF[itF.key] = 1;
        uniqF.push(itF);
        if(uniqF.length >= (lim(opt))) break;
      }
      return { ok:true, method:'synonym', list:uniqF, candidateCount:total };
    }

    /* 配字窗与配字对上限随已列组数放大：首段只取够一批的量，续取时窗再扩 */
    var need = needSize(opt);
    var fullPool = matePool(poolWant(kind));
    var pool = fullPool.slice(0, Math.min(fullPool.length, Math.max(260, need * 3)));
    var pairCap = Math.max(420, need * 4);
    var out = [];
    tally = {}; total = 0;
    /* 先取配字对（两名各自的首字），再为每一位各找一同义字构成第二组 */
    /* 基准字轮流当首字：每个首字最多配 6 个次字，保证首字多样 */
    var pairs = [];
    for(var a = 0; a < pool.length && pairs.length < pairCap; a++){
      var n = 0;
      for(var b = a + 1; b < pool.length && n < 6 && pairs.length < pairCap; b++){
        if(stripTone(pinyinOf(pool[a])) === stripTone(pinyinOf(pool[b]))) continue;
        pairs.push([pool[a], pool[b]]);
        n++;
      }
    }
    pairs.forEach(function(pr){
      var synA = [], synB = [];
      var big = synPool('any');
      for(var i = 0; i < big.length; i++){
        var c = big[i];
        if(c === pr[0] || c === pr[1]) continue;
        var s = synSim(c, pr[0]);
        if(s >= 0.15 && stripTone(pinyinOf(c)) !== stripTone(pinyinOf(pr[0]))) synA.push([c, s]);
      }
      for(var j = 0; j < big.length; j++){
        var c2 = big[j];
        if(c2 === pr[0] || c2 === pr[1]) continue;
        var s2 = synSim(c2, pr[1]);
        if(s2 >= 0.15 && stripTone(pinyinOf(c2)) !== stripTone(pinyinOf(pr[1]))) synB.push([c2, s2]);
      }
      synA.sort(function(p, q){ return q[1] - p[1]; });
      synB.sort(function(p, q){ return q[1] - p[1]; });
      synA.slice(0, 3).forEach(function(xa){
        synB.slice(0, 3).forEach(function(xb){
          var n1 = [pr[0], pr[1]], n2 = [xa[0], xb[0]];
          if(!genderOk(n1, wantA) || !genderOk(n2, wantB)) return;
          if(!avoidOk(n1, opt.avoid) || !avoidOk(n2, opt.avoid)) return;
          if(!xingOk(n1, xing) || !xingOk(n2, xing)) return;
          var fk = pairKey(n1.join(''), n2.join(''));
          if(!tally[fk]){ tally[fk] = 1; total++; }
          if(EX[fk]) return;
          var sa = nameScore(n1), sb = nameScore(n2);
          out.push({
            key:fk, base:n1, syn:n2, sim:(xa[1] + xb[1]) / 2,
            names:[ { name:n1.join(''), chars:n1, score:sa },
                    { name:n2.join(''), chars:n2, score:sb } ],
            score:(sa + sb) / 2 + (xa[1] + xb[1]) * 2
          });
        });
      });
    });
    out.sort(function(p, q){ return q.score - p.score; });
    /* 只约束四字全名不重复（base0+base1+syn0+syn1），不限单字重用：
     * 单字去重时高分字一被占即整组别名全砍，宏伟、清澄等真同义组会被挤出头部；
     * 按全名去重后，sim=1.0 的强同义组天然浮出。 */
    var used = {}, uniq = [];
    for(var i = 0; i < out.length; i++){
      var it = out[i];
      if(used[it.key]) continue;
      used[it.key] = 1;
      uniq.push(it);
      if(uniq.length >= (lim(opt))) break;
    }
    /* 窗内候选全部已列（剔尽）时交空名单，页面据此出列尽提示 */
    if(!uniq.length){
      if(total) return { ok:true, method:'synonym', list:[], candidateCount:total };
      return { ok:false, reason:'当前条件下没有合格候选。' };
    }
    return { ok:true, method:'synonym', list:uniq, candidateCount:total };
  }

  /* ---- 成语拆名 ----
   * opt.idiom 可指定成语（留空则由成语库择优）。指定时不再按库内规则静默丢弃，
   * 而是逐条给出不能用的原因，免得用户以为该成语不在库中。 */
  function genIdiom(xing, opt){
    var len = opt.len === 1 ? 1 : 2;
    var kind = opt.kind || 'any';
    var wd = wants(kind), wantA = wd[0], wantB = wd[1];
    var count = lim(opt);
    var fixed = String(opt.idiom || '').trim();
    var pool = idiomPool();
    var warn = '';
    if(fixed){
      if(fixed.length !== 4){
        return { ok:false, reason:'成语拆名请填四字成语：本模块只取“两字＋两字”一读，三字、五字以上拆不成两个名字。' };
      }
      var fc = fixed.split('');
      for(var q = 0; q < 4; q++){
        if(isBadChar(fc[q])){
          return { ok:false, reason:'成语“' + fixed + '”含字库未收录或标注不宜入名之字“' + fc[q] + '”，拆出的名字无法核算五格，请换一条各字均常见的成语。' };
        }
      }
      var fdef = idioms()[fixed];
      /* 贬义条目不静默丢弃：自动择优时一律不进池，用户指名则照拆，
       * 但必须把贬义一事写在输出界面上；不排除特立独行之人有意取用，故只提醒不拦。 */
      if(hasEvil(fixed)) warn = '字面含强贬义字';
      else if(defEvil(fdef, fixed)) warn = '释义含贬义';
      else if(BLACK_IDIOM.indexOf(fixed) >= 0) warn = '已登记为不宜入名的条目';
      var fdup = dupPattern(fixed);
      if(fdup === 'dup') return { ok:false, reason:'成语“' + fixed + '”为叠字结构（AABB、ABCC 一类），拆出的名字单调，已排除。' };
      pool = [{ idiom:fixed, def:fdef || '（本站成语库未收录此条释义，拆法仍可用）', dup:fdup }];
    }

    var out = [];
    var seen = {}, tally = {}, total = 0;

    for(var i=0;i<pool.length;i++){
      var item = pool[i];
      var sp = splits(item.idiom, len, item.dup);
      for(var s=0;s<sp.length;s++){
        var a = sp[s].a, b = sp[s].b;
        if(!genderOk(a, wantA) || !genderOk(b, wantB)) continue;
        if(!avoidOk(a, opt.avoid) || !avoidOk(b, opt.avoid)) continue;
        if(!xingOk(a, xing) || !xingOk(b, xing)) continue;
        var ka = a.join(''), kb = b.join('');
        if(ka === kb) continue;
        /* 键只认两名本身：异序成语（克勤克俭与克俭克勤）与同成语的另一拆法
           产出同组两名时键相同，续取不再把换序重排当新组列出 */
        var key = pairKey(ka, kb);
        if(!tally[key]){ tally[key] = 1; total++; }
        if(seen[key] || EX[key]) continue;
        seen[key] = 1;
        var sa = nameScore(a), sb = nameScore(b);
        out.push({
          key:key,
          idiom:item.idiom,
          def:item.def,
          split:sp[s].split,
          dup:item.dup,
          desc:relDesc({idiom:item.idiom, split:sp[s].split}, item.dup, a, b),
          warn:warn,
          shared:(item.dup === 'abac13') ? a[0] : (item.dup === 'abac24' ? a[a.length-1] : ''),
          names:[
            { name:ka, chars:a, score:sa },
            { name:kb, chars:b, score:sb }
          ],
          /* 共用一字（同心同德→同心、同德）是联名最见巧思的一档，加权要够高，
           * 否则会被福寿、康宁这类纯吉祥堆砌压在后面。 */
          score:(sa + sb) / 2 + (item.dup !== 'none' ? 2.0 : 0),
          variants:[]
        });
      }
    }

    if(!out.length){
      /* 全部候选已在先前批次列出（剔尽）而非无候选：交空名单由页面出列尽提示 */
      if(total) return { ok:true, method:'idiom', list:[], candidateCount:total };
      return { ok:false, reason: fixed
        ? '该成语在此条件下拆不出合格的两名：或与姓氏同字、或命中避讳、或两名完全相同。'
        : '当前条件下没有合格候选。' };
    }
    out.sort(function(p, q){ return q.score - p.score; });

    /* 去重两层：① 同一成语只保留最优拆法；② 用字集合相同的异序成语
     * （克勤克俭、克俭克勤、同心同德、同德同心）拆出的两名完全相同，只留其一。
     * 但被挤掉的变体要留在 variants 里一并注明，否则用户按通行写法（同心同德）
     * 来找，看到的是同德同心，会以为漏收。
     * 指定成语时两层都不适用：只有这一个成语，且对半拆与交错拆都要给用户看。 */
    var byIdiom = {}, bySet = {}, uniq = [];
    for(var u=0;u<out.length;u++){
      var it = out[u];
      if(fixed){
        uniq.push(it);
        if(uniq.length >= count) break;
        continue;
      }
      if(byIdiom[it.idiom]) continue;
      var setKey = it.idiom.split('').sort().join('');
      if(bySet[setKey]){
        var prev = bySet[setKey];
        if(prev.variants.indexOf(it.idiom) < 0) prev.variants.push(it.idiom);
        continue;
      }
      byIdiom[it.idiom] = 1;
      bySet[setKey] = it;
      uniq.push(it);
      if(uniq.length >= count) break;
    }

    return { ok:true, method:'idiom', list:uniq, candidateCount:total };
  }

  /* 主入口 */
  function generate(xing, opt){
    opt = opt || {};
    var method = opt.method || 'idiom';
    var kind = opt.kind || 'any';
    var count = lim(opt);
    /* 已出组集在本入口一次建好，各法取用阶段自查（引擎同步执行，无并发） */
    exSet(opt);

    if(!xing){ return { ok:false, reason:'请填写姓氏。' }; }
    if(method === 'idiom'){ return genIdiom(xing, opt); }
    if(method === 'split'){ return genSplit(xing, opt); }
    if(method === 'shared'){ return genShared(xing, opt); }
    if(method === 'rank'){ return genRank(xing, opt); }
    if(method === 'synonym'){ return genSynonym(xing, opt); }
    return { ok:false, reason:'该联名法尚未开放。' };
  }

  return {
    methods:METHODS,

    generate:generate,
    idiomPoolSize:function(){ return idiomPool().length; }
  };
})();
