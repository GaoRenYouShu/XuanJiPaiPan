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

  /* ===== 顾山三法：洪范山运、年克山家、阴府太岁、巡山罗睺 =====
     皆坐山专有，必以二十四山坐山为凭；与三煞、岁破、太岁到山同属顾山一系而另有其例。
     【定源】洪范五行遁山运（歌诀定本，二十四山全覆盖）：
       甲寅辰巽大江水，戌子申辛水一同；癸丑坤庚未土看，午壬丙乙火为宗；
       卯艮巳山原属木，酉丁乾亥金生中；惟有金山冬至后，变作下年墓运通。
     山运遁法：不论阴阳，只寻其山之墓运，用值年岁干起五鼠遁遁至其墓位，所得干支纳音五行即山运。
     墓位：水土山墓辰、木山墓未、火山墓戌、金山墓丑。金山交冬至用下年岁干遁。
     锚点：巽山（水）丙午年遁辰得壬辰长流水＝山运水。 */
  const HF_WX = {甲:'水',寅:'水',辰:'水',巽:'水',戌:'水',子:'水',申:'水',辛:'水',
    癸:'土',丑:'土',坤:'土',庚:'土',未:'土',
    午:'火',壬:'火',丙:'火',乙:'火',
    卯:'木',艮:'木',巳:'木',
    酉:'金',丁:'金',乾:'金',亥:'金'};
  const HF_MU = {水:'辰',土:'辰',木:'未',火:'戌',金:'丑'};
  // 五鼠遁：年干起子时干（甲己还加甲、乙庚丙作初…）
  const WUZI_QI = {甲:'甲',己:'甲',乙:'丙',庚:'丙',丙:'戊',辛:'戊',丁:'庚',壬:'庚',戊:'壬',癸:'壬'};
  const NAYIN_WX = {金:'金',木:'木',水:'水',火:'火',土:'土'};
  const WX_KE_OF = {金:'木',木:'土',土:'水',水:'火',火:'金'};  // 我克者
  /* 【定源】阴府太岁（正、傍二例）。起例为日课四柱天干化气，克坐山纳甲化气。
     化气：甲己土、乙庚金、丙辛水、丁壬木、戊癸火。京房纳甲：乾纳甲壬、坤纳乙癸、
     艮纳丙、兑纳丁、坎纳戊、离纳己、震纳庚、巽纳辛。
     正阴府歌：甲己二干艮巽凶，乙庚乾兑祸重重；丙辛坤坎君莫犯，
               丁壬离乾主无宗，戊癸震坤为大杀。
     傍阴府歌：丙辛化气为水乡，甲己傍阴来相伤；寅戌甲壬山属土，
               最怕丁壬木相伤；丁壬巳丑加甲木，傍阴却是乙庚金；
               申辰癸乙火房，丙辛二干傍阴旺；亥未乙庚化气金，正怕戊癸共相侵。
     锚点（万年图山向通利便览定局，六十年为纲逐年实证，五十八年样本，十干全等）：
     甲己年正艮巽、乙庚年正酉乾、丙辛年正坤子、丁壬年正午、戊癸年正卯。
     歌诀丁壬、戊癸两句之后一位（乾、坤）为逐年定局所不载，并存而不取。
     单干不化则不忌。 */
  const ZHENG_YINFU = {
    甲:['艮','巽'], 己:['艮','巽'], 乙:['酉','乾'], 庚:['酉','乾'],
    丙:['坤','子'], 辛:['坤','子'], 丁:['午'],     壬:['午'],
    戊:['卯'],     癸:['卯']
  };
  const HUAQI_OF = {甲:'土',己:'土',乙:'金',庚:'金',丙:'水',辛:'水',丁:'木',壬:'木',戊:'火',癸:'火'};
  const HUAQI_GAN = {土:['甲','己'],金:['乙','庚'],水:['丙','辛'],木:['丁','壬'],火:['戊','癸']};
  const NAJIA_GUA_OF = {甲:'乾',壬:'乾',乙:'坤',癸:'坤',丙:'艮',丁:'兑',戊:'坎',己:'离',庚:'震',辛:'巽'};
  const GUA_SHAN = {乾:'乾',坤:'坤',艮:'艮',兑:'酉',坎:'子',离:'午',震:'卯',巽:'巽'};
  // 纳甲三合：坎离震兑四正卦兼纳八支，取与本卦支成三合局
  const NAJIA_SANHE = {坎:['申','辰','癸'],离:['寅','戌','壬'],震:['亥','未','庚'],兑:['巳','丑','丁']};
  function yinfuParts(gan, shan){
    if(!HUAQI_OF[gan]) return null;
    const my = HUAQI_OF[gan];
    const tgt = WX_KE_OF[my];               // 我克者
    if(!tgt || !HUAQI_GAN[tgt]) return null;
    const tg = HUAQI_GAN[tgt];
    const gua = tg.map(g=>NAJIA_GUA_OF[g]);
    const zheng = (ZHENG_YINFU[gan] || gua.map(g=>GUA_SHAN[g])).slice();
    const zhengGua = gua.slice();
    // 傍阴府：正卦所纳之干与本卦支，加四正卦的纳甲三合山
    const bang = [];
    gua.forEach(g=>{
      const nagan = Object.keys(NAJIA_GUA_OF).filter(k=>NAJIA_GUA_OF[k]===g);
      nagan.forEach(k=>bang.push(k));
      (NAJIA_SANHE[g]||[]).forEach(s=>bang.push(s));
      const gs = GUA_SHAN[g];
      if(gs && bang.indexOf(gs)<0) bang.push(gs);
    });
    return {huaqi:my, ke:tgt, zhengGua:zhengGua, zheng:zheng, bang:bang,
            hitZ: zheng.indexOf(shan)>=0, hitB: bang.indexOf(shan)>=0};
  }
  /* 坐山罗睺（《选择天镜》逐年定局）：忌开山，与巡山罗睺各主一事而不同方，
     二者同名连称而实为两煞，不可混为一谈。逐年取八卦宫之正中一山：
     子年在乾、丑年在艮、寅年在卯、卯年在午、辰年在酉、巳年在坤、
     午年在坤、未年在艮、申年在子、酉年在子、戌年在巽、亥年在乾。
     原文大书只忌开山，正与巡山罗睺只忌立向相对。 */
  const ZUOSHAN_LUOHOU = {
    子:'乾', 丑:'艮', 寅:'卯', 卯:'午', 辰:'酉', 巳:'坤',
    午:'坤', 未:'艮', 申:'子', 酉:'子', 戌:'巽', 亥:'乾'
  };
  function zuoshanLuohou(yearZhi){
    return ZUOSHAN_LUOHOU[yearZhi] || null;
  }
  /* 巡山罗睺（《协纪辨方书·义例》）：太岁前一位，二十四山顺行一位。
     子年在癸、丑年在艮、寅年在甲、卯年在乙、辰年在巽、巳年在丙、
     午年在丁、未年在坤、申年在庚、酉年在辛、戌年在乾、亥年在壬。
     只忌立向，开山修方不忌；以一白水星制之。 */
  function xunshanLuohou(yearZhi){
    const i = SHAN_LIST.indexOf(yearZhi);
    return i>=0 ? SHAN_LIST[(i+1)%24] : null;
  }
  /* 坐煞、向煞（三合局中位为灾煞，其同宫两天干为坐煞，灾煞对冲宫两天干为向煞）。
     锚点：万年图六十年逐年实证，坐煞十二支全中、向煞十二支全中。
     三煞可向不可坐；坐煞大忌，向煞可避则避。 */
  const GONG_GAN = {子:['壬','癸'],午:['丙','丁'],卯:['甲','乙'],酉:['庚','辛']};
  function zuoXiangSha(yearZhi){
    const san = SANSHA[yearZhi];
    if(!san) return null;
    const zai = san[1];                       // 三煞中位即灾煞
    return {zai:zai, zuo:GONG_GAN[zai]||[], xiang:GONG_GAN[CHONG[zai]]||[]};
  }
  /* 【定源】浮天空亡（岁家大凶煞，九星翻卦纳甲）。流年太岁天干所纳本宫卦，
     取其中爻变之卦（先天卦序隔二位：乾离、坤坎、艮巽、兑震互为中爻变），
     即绝命破军所落之卦，并该卦所纳之干，即当年浮天空亡。
     二十四山纳甲：甲乾、乙坤、丙艮、丁兑、庚震、辛巽、壬离、癸坎（戊随坎、己随离）。
     十干逐年（十干全等校验）：甲离壬、乙坎癸、丙巽辛、丁震庚、戊坤乙、
     己乾甲、庚兑丁、辛艮丙、壬乾甲、癸坤乙。占山、占向、占方皆忌，
     开山立向与修方并忌；老宅修造亦宜避。 */
  const NAJIA24 = {甲:'乾',乙:'坤',丙:'艮',丁:'兑',戊:'坎',己:'离',庚:'震',辛:'巽',壬:'离',癸:'坎'};
  const ZHONGYAO_BIAN = {乾:'离',离:'乾',坤:'坎',坎:'坤',艮:'巽',巽:'艮',兑:'震',震:'兑'};
  const GUA_NAGAN = {乾:'甲',坤:'乙',艮:'丙',兑:'丁',坎:'癸',离:'壬',震:'庚',巽:'辛'};
  function futianKongwang(yearGan){
    const ben = NAJIA24[yearGan];
    if(!ben) return null;
    const po = ZHONGYAO_BIAN[ben];
    return {benGua:ben, poGua:po, poGan:GUA_NAGAN[po], shan:(SHAN_BAGUA[po]||[]).slice()};
  }
  /* 【定源】弓箭煞（坐山专有，不论方向）。天干禄顺一位为羊刃（箭），
     羊刃对冲为飞刃（弓）；弓箭两支俱全方忌，单支（有弓无箭、有箭无弓）不忌。
     十二地支山与乾坤艮巽四维无弓箭。歌：甲庚卯酉全为祸，乙辛龙犬杀人多；
     丁癸牛羊死满地，丙壬子午动干戈。
     十干逐年校验全等：甲庚卯酉、乙辛辰戌、丁己丑未、丙戊壬子午。 */
  const GAN_LU = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  function gongjianSha(shan){
    if(!GAN_LU[shan]) return null;            // 支山与四维山不论
    const ren = ZHI_ORDER[(ZHI_ORDER.indexOf(GAN_LU[shan])+1)%12];
    return {lu:GAN_LU[shan], ren:ren, fei:CHONG[ren], pair:[ren, CHONG[ren]]};
  }
  /* 【定源】小儿煞（即小月建、飞天大煞，月家凶煞，与大月建并论）。
     歌：阳起中宫阴起离，阴阳二年并顺推；九宫数至遇何月，到此一宫杀小儿。
     年分阴阳取岁干（阳干甲丙戊庚壬、阴干乙丁己辛癸），自正月起按月顺飞，
     每宫占三山。阳年：中乾兑艮离坎坤震巽；阴年：离坎坤震巽中乾兑艮。
     忌修方，占山占向占方皆宜避；修造犯之主伤幼童。 */
  const LUOSHU_FLIGHT = ['中','乾','兑','艮','离','坎','坤','震','巽'];
  function xiaoerSha(yearGan, lunarMonth){
    if(lunarMonth<1 || lunarMonth>12) return null;
    const yang = '甲丙戊庚壬'.indexOf(yearGan)>=0;
    const start = yang ? '中' : '离';
    const s = LUOSHU_FLIGHT.indexOf(start);
    const g = LUOSHU_FLIGHT[(s + lunarMonth - 1)%9];
    return {yang:yang, gong:g, shan:(SHAN_BAGUA[g]||[]).slice()};
  }
  /* 【定源】千斤杀（六畜栏圈、修造动土所忌）。诸书排法不一，两系并存：
     一为岁系（《象吉通书》，按年支起，并忌其方与其日）：
       子戌巳在寅、午丑亥在辰、卯申在亥、未寅在丑、辰酉在巳。
     二为季系（《三元总录》《鳌头通书》，按四立分季，各占四维）：
       春巽、夏坤、秋乾、冬艮。两系不同源，本页各依所宗并存，不强行合一。 */
  /* 【定源】戊己都天与夹都天（岁家土煞）。从太岁五虎遁（年上起月）遁至本年
     戊、己二干所落之支，即戊己都天之方；戊与己两山在二十四山序中相隔一位，
     其中间之山即为夹都天，亦大凶。戊都天主速、己都天主迟。
     锚点（《求真》《辟谬》原文三条全中）：甲己年辰巳为都天、巽为夹煞；
     戊癸年午未为都天、丁为夹煞；乙庚年寅卯及子丑为都天、甲与癸为夹煞。
     戊都、己都各随遁得之支分列，两山隔一位而中夹之山为夹都天。
     忌开山立向修方。葬课可否，诸书不一：《象吉通书》谓犯之大凶而惟葬不忌，
     《求真》《辟谬》一系则以阴宅大忌不可犯、阳宅可制化而用。
     本站从后说，取其忌严，并仍保留前说于注中以备稽考。
     制化三法：日课得亥卯未三合木局或寅卯辰三会木局、太阳到山到方、母仓日。
     别有二法：《辟谬》谓制之者用年家纳音克之为稳，胜于专用甲乙干克；
     变煞之说谓戊己所临之支即其煞性，加寅卯为木煞、加午未为火煞、
     加亥子为水煞、加申酉为金煞，各以其所克者制之。
     坐山犯都天者，动土择日并忌戊日、己日。 */
  /* 【定源】母仓日（犯戊己都天者用以制化）。取生月气之辰，即日支五行生月支五行：
     寅卯月用亥子日、巳午月用寅卯日、申酉月用辰戌丑未日、亥子月用申酉日、
     辰戌丑未月用巳午日（四季末月归土，取火生土）。十二月校验全等。 */
  const ZHI_WX_SIJI = {寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',
                       申:'金',酉:'金',戌:'土',亥:'水',子:'水',丑:'土'};
  function mucangZhi(monthZhi){
    const wx = ZHI_WX_SIJI[monthZhi];
    if(!wx) return [];
    return ZHI_ORDER.filter(z=>WX_SHENG[ZHI_WX_SIJI[z]]===wx);
  }
  const WUHU_QI = {甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'};
  function dujianDutian(yearGan){
    const qi = WUHU_QI[yearGan];
    if(!qi) return null;
    const s = ZHI_ORDER.indexOf('寅');
    const seq = [];
    for(let i=0;i<12;i++) seq.push({z:ZHI_ORDER[(s+i)%12], g:GAN[(GAN.indexOf(qi)+i)%10]});
    const fang=[], jia=[];
    for(let i=0;i<12;i++){
      if(seq[i].g==='戊' && seq[(i+1)%12].g==='己'){
        const a=seq[i].z, b=seq[(i+1)%12].z;
        fang.push(a,b);
        const ia = SHAN_LIST.indexOf(a), ib = SHAN_LIST.indexOf(b);
        if(ib===(ia+2)%24) jia.push(SHAN_LIST[(ia+1)%24]);
      }
    }
    return {fang:fang, jia:jia, wu:fang.filter((_,i)=>i%2===0), ji:fang.filter((_,i)=>i%2===1)};
  }
  const QIANJIN_YEAR = {子:'寅',戌:'寅',巳:'寅',午:'辰',丑:'辰',亥:'辰',
                        卯:'亥',申:'亥',未:'丑',寅:'丑',辰:'巳',酉:'巳'};
  const QIANJIN_SEASON = {春:'巽',夏:'坤',秋:'乾',冬:'艮'};
  function qianjinSha(yearZhi, season){
    return {fangYear:QIANJIN_YEAR[yearZhi]||null, fangSeason:QIANJIN_SEASON[season]||null};
  }
  /* 【定源】冲丁煞（分金煞，风水择日专有）。日柱天干与坐山分金天干相同而地支相冲，
     即天比地冲，犯之主人丁损伤；天克地冲分金者亦不用。只忌日，不忌时辰。
     一百二十分金，每山五干，阳支配阳干、阴支配阴干，二十四山无重无漏。
     定式推论：一山之五个分金恰为其本气地支的全部合法干支，五分金所忌之日合集
     即为对冲支之全部干支，故冲丁日只须坐山本气地支求其六冲支，不必辨第几分金。
     子癸山忌午日、丑艮山忌未日、寅甲山忌申日、卯乙山忌酉日、辰巽山忌戌日、
     巳丙山忌亥日、午丁山忌子日、未坤山忌丑日、申庚山忌寅日、酉辛山忌卯日、
     戌乾山忌辰日、亥壬山忌巳日。
     安床只论方位以卦为主，不涉二十四山，故不论此煞。 */
  function chongdingSha(shan){
    const zhi = SHAN_ZHI[shan];
    if(!zhi) return null;
    const chong = CHONG[zhi];
    if(!chong) return null;
    const carry = GAN.filter(g=>((GAN.indexOf(g)%2)===(ZHI_ORDER.indexOf(chong)%2)));
    return {zhi:zhi, chong:chong, days:carry.map(g=>g+chong), stems:carry.slice()};
  }
  /* 【定源】太阳到山到向太阴到山到向（天星择日）。太阳为万宿之主，照临之方大小凶煞
     可化；立春起壬山逆行二十四山，一节气一山，十二节气一周天，到山与到向恰隔十二山。
     太阴立春起艮山顺行，一节气一山。到向为上吉取光辉直照，三合方次吉取光辉拱我，
     到山至尊，阳宅平民难承而葬坟可用。太阳须昼时而用，太阴须夜时而用。
     三合方：坤壬乙、乾甲丁、艮丙辛、巽庚癸各为一局，坐山与其同局两山互为三合方。
     锚点：壬山立春到山午山立秋则壬到向、乾山惊蛰巽山白露、艮山大雪坤山芒种，
     二十四山之到山到向四十八项逐项核过全中；太阴二十四山全中。
     岁破三煞五黄临山之方，太阳亦不可强行制化。 */
  const JIEQI_24 = ['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至',
                    '小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪',
                    '大雪','冬至','小寒','大寒'];
  const SHAN_SANHE = {
    坤:['坤','壬','乙'], 壬:['坤','壬','乙'], 乙:['坤','壬','乙'],
    乾:['乾','甲','丁'], 甲:['乾','甲','丁'], 丁:['乾','甲','丁'],
    艮:['艮','丙','辛'], 丙:['艮','丙','辛'], 辛:['艮','丙','辛'],
    巽:['巽','庚','癸'], 庚:['巽','庚','癸'], 癸:['巽','庚','癸'],
    子:['坤','壬','乙'], 辰:['坤','壬','乙'], 申:['坤','壬','乙'],
    午:['艮','丙','辛'], 戌:['艮','丙','辛'], 寅:['艮','丙','辛'],
    卯:['乾','甲','丁'], 亥:['乾','甲','丁'], 未:['乾','甲','丁'],
    酉:['巽','庚','癸'], 巳:['巽','庚','癸'], 丑:['巽','庚','癸']
  };
  function taiyangDaoshan(jieqi){
    const i = JIEQI_24.indexOf(jieqi);
    if(i<0) return null;
    const k = SHAN_LIST.indexOf('壬');
    return SHAN_LIST[(((k-i)%24)+24)%24];
  }
  /* 太阳到山到向只能是白天，太阴须夜时：此二句必须落实为时辰判据。
     昼时取卯辰巳午未申，其余为夜时。 */
  function _taiyangZhi(r, shan, timeZhi){
    let jq = '';
    try{ const p = r.lunar.getPrevJieQi(true); if(p) jq = p.getName(); }catch(e){}
    const lam=_taiyangLambda(r);
    if(lam!=null){ const ps=taiyangDaoShanDu(lam); const dayP='卯辰巳午未申'.indexOf(timeZhi)>=0;
      if(ps===shan&&dayP) return {on:true, name:'太阳到山（精）', bright:'sun'}; }
    if(!jq) return {on:false, name:'', bright:''};
    const zf = taiyangZhaofang(shan, jq);
    const yin = taiyinDaoshan(jq);
    const day = '卯辰巳午未申'.indexOf(timeZhi)>=0;
    if(zf && zf.daoShan===jq && day) return {on:true, name:'太阳到山', bright:'sun'};
    if(zf && zf.daoXiang===jq && day) return {on:true, name:'太阳到向', bright:'sun'};
    if(zf && zf.sanhe.some(function(o){return o.jieqi===jq;}) && day) return {on:true, name:'太阳三合方', bright:'sun'};
    if(yin===shan && !day) return {on:true, name:'太阴到山', bright:'moon'};
    const xiang = SHAN_LIST[(SHAN_LIST.indexOf(shan)+12)%24];
    if(yin===xiang && !day) return {on:true, name:'太阴到向', bright:'moon'};
    if(SHAN_SANHE[shan] && SHAN_SANHE[shan].indexOf(yin)>=0 && !day) return {on:true, name:'太阴三合方', bright:'moon'};
    return {on:false, name:'', bright:''};
  }
  function taiyinDaoshan(jieqi){
    const i = JIEQI_24.indexOf(jieqi);
    if(i<0) return null;
    const k = SHAN_LIST.indexOf('艮');
    return SHAN_LIST[(k+i)%24];
  }
  function taiyangZhaofang(shan, jieqi){
    const cur = taiyangDaoshan(jieqi);
    if(!cur) return null;
    const ju = SHAN_SANHE[shan];
    if(!ju) return null;
    const xiang = SHAN_LIST[(SHAN_LIST.indexOf(shan)+12)%24];
    return {
      daoShan: cur===shan ? jieqi : null,
      daoXiang: cur===xiang ? jieqi : null,
      sanhe: ju.filter(s=>s!==shan).map(s=>({shan:s, jieqi:JIEQI_24[(((((SHAN_LIST.indexOf('壬')-SHAN_LIST.indexOf(s))%24)+24)%24))]})),
      liuMaster: cur
    };
  }
  /* 【定源】山方煞（又称先后天煞）。山卦之后天方位所居之先天卦、与山卦先天方位
     所居之后天卦，二卦各取其官鬼爻（爻支五行克该卦宫五行者，配其纳甲干），
     即山方煞所忌之干支；日犯大忌、时犯小忌，造葬修均忌。
     官鬼爻定式：坤乙卯、兑丁巳、震庚申、乾壬午、离己亥、艮丙寅、巽辛酉、坎戊辰
     （坎宫土爻辰戌二支，取内卦辰）。
     先天方位：乾南坤北离东坎西、震东北兑东南巽西南艮西北；
     后天方位：坎北艮东北震东巽东南离南坤西南兑西乾西北。
     锚点（原文十六项逐项核过全中）：坎山忌乙卯丁巳、艮山忌庚申壬午、震山忌己亥丙寅、
     巽山忌丁巳乙卯、离山忌壬午庚申、坤山忌辛酉戊辰、兑山忌戊辰辛酉、乾山忌丙寅己亥。
     干山与支山从其宫卦（甲卯乙从震、辰巽巳从巽之类），八纯卦山即本卦。 */
  const GUA_GUANGUI = {坤:'乙卯',兑:'丁巳',震:'庚申',乾:'壬午',离:'己亥',艮:'丙寅',巽:'辛酉',坎:'戊辰'};
  /* 后天卦之方位所居先天卦（X1），与该卦先天方位所居后天卦（X2）。 */
  const XT_AT_HT = {北:'坤',东北:'震',东:'离',东南:'兑',南:'乾',西南:'巽',西:'坎',西北:'艮'};
  const HT_AT_XT = {北:'坎',东北:'艮',东:'震',东南:'巽',南:'离',西南:'坤',西:'兑',西北:'乾'};
  const GUA_HT_DIR = {坎:'北',艮:'东北',震:'东',巽:'东南',离:'南',坤:'西南',兑:'西',乾:'西北'};
  const GUA_XT_DIR = {乾:'南',坤:'北',离:'东',坎:'西',震:'东北',兑:'东南',巽:'西南',艮:'西北'};
  function shanFangSha(shan){
    const gua = najiaGuaOf(shan);
    if(!gua) return null;
    const g1 = XT_AT_HT[GUA_HT_DIR[gua]];
    const g2 = HT_AT_XT[GUA_XT_DIR[gua]];
    const days = [];
    [g1, g2].forEach(g=>{
      const d = GUA_GUANGUI[g];
      if(d && days.indexOf(d)<0) days.push(d);
    });
    return {gua:gua, rel:[g1, g2], days:days};
  }
  /* 【定源】天星地曜煞（星曜煞）。日课日、时柱干支与坐山正五行成克者：
     干支同气（干支五行相同）且克坐山正五行，取其全部合法干支。日犯大忌、时犯小忌。
     二十四山正五行归组：亥壬子癸水、巳丙午丁火、寅甲卯乙巽木、申庚酉辛乾金、
     辰戌丑未艮坤土（四维从卦气：巽木乾金艮坤土）。
     水山忌戊辰戊戌己丑己未、火山忌壬子癸亥、木山忌庚申辛酉、
     金山忌丙午丁巳、土山忌甲寅乙卯。修造葬均忌。 */
  const ZHENG_WX_SHAN = {
    甲:'木',乙:'木',丙:'火',丁:'火',庚:'金',辛:'金',壬:'水',癸:'水',
    寅:'木',卯:'木',巳:'火',午:'火',申:'金',酉:'金',亥:'水',子:'水',
    辰:'土',戌:'土',丑:'土',未:'土',巽:'木',乾:'金',艮:'土',坤:'土'
  };
  function tianXingDiYao(shan){
    const wx = ZHENG_WX_SHAN[shan];
    if(!wx) return null;
    const ke = Object.keys(WX_KE_OF).filter(k=>WX_KE_OF[k]===wx);
    if(!ke.length) return null;
    const days = [];
    GAN.forEach(g=>{
      if(GAN_WX[g]!==ke[0]) return;
      ZHI_ORDER.forEach(z=>{
        const zw = ZHI_WX[z]||ZHI_WX_SIJI[z];
        if(zw!==ke[0]) return;
        if((GAN.indexOf(g)%2)===(ZHI_ORDER.indexOf(z)%2)) days.push(g+z);
      });
    });
    return {wx:wx, ke:ke[0], days:days};
  }
  /* 【定源】太岁堆黄。年干五虎遁遁至本年太岁之支，所得天干之山即犯太岁堆黄。
     最忌修宅修坟，新造安葬不忌。遁得戊己二干者无干山可堆，记无。 */
  function taisuiDuiHuang(yearGan, yearZhi){
    const qi = WUHU_QI[yearGan];
    if(!qi || !yearZhi) return null;
    const off = (ZHI_ORDER.indexOf(yearZhi) - ZHI_ORDER.indexOf('寅') + 12)%12;
    const g = GAN[(GAN.indexOf(qi)+off)%10];
    return {gan:g, shan:(g==='戊'||g==='己')?null:g};
  }
  /* 【定源】剑锋煞。月建天干过旺之方，与重丧同推：干山取其临官禄位之月，
     四维山取巽三月、乾九月、艮十二月、坤六月；十二支山不论。修坟安葬忌，竖造不忌，
     太阳照临可解。 */
  const JIANFENG_YUE = {甲:'寅',乙:'卯',丙:'巳',丁:'午',庚:'申',辛:'酉',壬:'亥',癸:'子',
                        巽:'辰',乾:'戌',艮:'丑',坤:'未'};
  function jianFengSha(shan){
    return JIANFENG_YUE[shan]||null;
  }
  /* 【定源】消灭煞。以月之盈亏定卦之所纳，阴爻消阳爻为消、阳爻灭阴爻为灭，
     消灭同犯合称消灭。十二山定式转录：坤乙二山忌庚子庚午、卯庚二山忌丁卯丁酉、
     巽辛二山忌丙午丙子、酉丁二山忌甲辰壬戌、艮丙二山忌乙卯癸酉、乾甲二山忌辛丑辛未。
     十二日皆八纯卦之爻（庚子庚午震爻、丁卯丁酉兑爻、丙午丙子艮爻、甲辰壬戌乾爻、
     乙卯癸酉坤爻、辛丑辛未巽爻），最忌开门放水占方，造葬忌日犯。 */
  const XIAOMIE = {
    '坤':['庚子','庚午'], '乙':['庚子','庚午'],
    '卯':['丁卯','丁酉'], '庚':['丁卯','丁酉'],
    '巽':['丙午','丙子'], '辛':['丙午','丙子'],
    '酉':['甲辰','壬戌'], '丁':['甲辰','壬戌'],
    '艮':['乙卯','癸酉'], '丙':['乙卯','癸酉'],
    '乾':['辛丑','辛未'], '甲':['辛丑','辛未']
  };
  /* 【定源】马前炙退（皇天炙退）。三合五行死方：申子辰年在卯、寅午戌年在酉、
     巳酉丑年在子、亥卯未年在午，故唯子午卯酉四山有之。修方大忌，开山立向安葬亦忌。
     死地无气须补扶不须克制：取旺相得令之月、三合六合或一方秀气补扶；
     酉午二山不宜一方秀气补扶（犯刑山）。 */
  const ZHITUI_FANG = {申:'卯',子:'卯',辰:'卯',寅:'酉',午:'酉',戌:'酉',
                       巳:'子',酉:'子',丑:'子',亥:'午',卯:'午',未:'午'};
  /* 【定源】大月建（月家第一凶煞）。按年支起宫逆布九宫：
     子午卯酉年起艮、辰戌丑未年起中、寅申巳亥年起坤，每月逆推一位。
     歌：子午卯酉起艮乡，辰戌丑未起中央，寅申巳亥坤位发，逆布九宫定煞详。
     锚点：己卯年正月艮、二月兑、三月乾、四月中、五月巽、六月震、七月坤、
     八月坎、九月离、十月艮、十一月兑、十二月乾，与原书序列全合。
     修造动土忌，修方切忌，开山立向不犯为妙，安葬可不忌；
     唯太阳帝星可制，帝星起例未列，本页取太阳照临为制。 */
  const DYJ_START = {子:'艮',午:'艮',卯:'艮',酉:'艮',辰:'中',戌:'中',丑:'中',未:'中',
                     寅:'坤',申:'坤',巳:'坤',亥:'坤'};
  function daYuejianGong(yearZhi, lunarMonth){
    const st = DYJ_START[yearZhi];
    if(!st || lunarMonth<1 || lunarMonth>12) return null;
    const s = ZB_FLIGHT.indexOf(st);
    return ZB_FLIGHT[(((s-lunarMonth+1)%9)+9)%9];
  }
  /* 【定源】天德方、月德方、岁德方与岁德合方（德神到山到向，趋吉首选）。
     天德歌：正丁二坤宫，三壬四辛同，五乾六甲上，七癸八艮逢，九丙十居乙，子巽丑庚中。
     月德从三合取旺方：寅午戌月在丙、申子辰月在壬、亥卯未月在甲、巳酉丑月在庚。
     岁德阳年即岁干、阴年从阳（取岁干所合之阳干），岁德合取其阴干：
     甲己年德甲合己、乙庚年德庚合乙、丙辛年德丙合辛、丁壬年德壬合丁、戊癸年德戊合癸。
     锚点：《大六壬探原》《星学大成》天德月德歌逐句全合；岁德阴年从阳见《六壬大全》。
     德神到山到向皆吉，本页到山加八、到向加五（量值本站归纳）。 */
  const TIANDE_FANG = {寅:'丁',卯:'坤',辰:'壬',巳:'辛',午:'乾',未:'甲',
                       申:'癸',酉:'艮',戌:'丙',亥:'乙',子:'巽',丑:'庚'};
  const YUEDE_FANG = {寅:'丙',午:'丙',戌:'丙',申:'壬',子:'壬',辰:'壬',
                      亥:'甲',卯:'甲',未:'甲',巳:'庚',酉:'庚',丑:'庚'};
  const SUI_DE    = {甲:'甲',己:'甲',乙:'庚',庚:'庚',丙:'丙',辛:'丙',
                     丁:'壬',壬:'壬',戊:'戊',癸:'戊'};
  const SUI_DE_HE = {甲:'己',己:'己',乙:'乙',庚:'乙',丙:'辛',辛:'辛',
                     丁:'丁',壬:'丁',戊:'癸',癸:'癸'};
  function deFang(shan, monthZhi, yearGan){
    const xiang = SHAN_LIST[(SHAN_LIST.indexOf(shan)+12)%24];
    const des = [TIANDE_FANG[monthZhi], YUEDE_FANG[monthZhi], SUI_DE[yearGan], SUI_DE_HE[yearGan]].filter(Boolean);
    return {daoShan:des.filter(d=>d===shan), daoXiang:des.filter(d=>d===xiang)};
  }
  /* 【定源】补龙正法（杨公造命）。入首龙从双山三合取局，课取本局地支补之：
     坤壬乙水局申子辰、乾甲丁木局亥卯未、艮丙辛火局寅午戌、巽庚癸金局巳酉丑。
     课支得本局三支全为补龙得力，得局之旺支（中位）为小补。
     与太阳三合方同一双山体系，二十四山归局全覆盖。三字全加十、旺支加四，量值本站归纳。 */
  const LONG_JU_ZHI = {'坤壬乙':['申','子','辰'],'乾甲丁':['亥','卯','未'],
                       '艮丙辛':['寅','午','戌'],'巽庚癸':['巳','酉','丑']};
  function buLong(laiLongShan, zhiArr){
    const ju = SHAN_SANHE[laiLongShan];
    if(!ju) return null;
    const zhi = LONG_JU_ZHI[ju.join('')];
    if(!zhi) return null;
    const zi = zhiArr.filter(Boolean);
    return {ju:ju.join(''), zhi:zhi,
            full:zhi.every(z=>zi.indexOf(z)>=0),
            wang:zi.indexOf(zhi[1])>=0};
  }
  /* 【定源】太阳到山到向精确到日。真黄经（VSOP87，定气同源）每十五度一山：
     立春真黄经三百一十五度太阳入壬山，逐节气顺推，一山一度区间：
     壬起三百一十五、亥三百三十、乾三百四十五，周天二十四山循环。
     与节气粒度表同源同界（节入即山入），有真黄经数据源时按日按度取用。 */
  const SUN_SECTOR0 = 315;
  function taiyangDaoShanDu(lambdaDeg){
    if(typeof lambdaDeg!=='number' || !isFinite(lambdaDeg)) return null;
    const k = Math.floor(((((lambdaDeg%360)+360)%360)-SUN_SECTOR0+360)%360/15);
    const k0 = SHAN_LIST.indexOf('壬');
    return SHAN_LIST[((k0-k)%24+24)%24];
  }
  /* 【定源】罗天大退（年家方位与时家）。年歌：罗天大退凶非常，丙丁二年居艮乡，
     戊己却来坤上立，庚辛巽位不堪迁；壬癸逢鸡人口损，甲岁营造子位伤，乙岁震宫切须忌。
     时歌：甲己戊癸忌巳时，乙庚忌申，丙辛忌亥，丁壬忌丑。
     年家忌修方造葬，时家忌开业搬家等；强旺五行生扶坐山或罗天大进可制，大进未列。 */
  const LTDT_FANG = {甲:'坎',乙:'震',丙:'艮',丁:'艮',戊:'坤',己:'坤',庚:'巽',辛:'巽',壬:'兑',癸:'兑'};
  const LTDT_SHI = {甲:'巳',己:'巳',戊:'巳',癸:'巳',乙:'申',庚:'申',丙:'亥',辛:'亥',丁:'丑',壬:'丑'};
  function luoTianDaTuiFang(yearGan){ return LTDT_FANG[yearGan]||null; }
  /* 【定源】罗天大进（大退制神）。年：甲子年起兑位顺飞九宫逐年一位，年泊之宫即大进方，
     癸酉复兑九位一周（甲子兑、乙丑艮、丙寅离、丁卯坎，逐位核过）。
     日：农历日歌初二猴初四亥、初六子、初八兔、十二羊、十四龙、十八狗、二十牛、
     廿二蛇、廿四虎、廿六马、廿八鸡，得日于对应方位行事催财。
     时：甲己戊癸子、乙庚卯、丙辛午、丁壬酉。月大进诸本自相缠绕，未列。 */
  function luoTianDaJinNian(yearGZ){
    if(!yearGZ) return null;
    const gi=GAN.indexOf(yearGZ[0]), zi=ZHI_ORDER.indexOf(yearGZ[1]);
    const off=(gi*6-zi*5+600)%60;
    return ZB_FLIGHT[(ZB_FLIGHT.indexOf('兑')+off)%9];
  }
  const LTJ_DAY={2:'申',4:'亥',6:'子',8:'卯',12:'未',16:'辰',18:'戌',20:'丑',22:'巳',24:'寅',26:'午',28:'酉'};
  /* 【定源】罗天大进月（歌：罗天大进喜非常，问四寻风顺数详，在天三月下乾乡，再从乾宫顺飞翔）。
     问四：年支顺数四位（含本支）寻风起巽宫；月建支逐位顺飞巽中乾兑艮离坎坤震，
     乾宫独停三月（连位三格）。锚点：酉年子月起巽、丑中、寅卯辰连乾、巳兑午艮未离申坎酉坤戌震、
     亥回巽，与未年戌月起巽、子丑寅连乾、未月至坤，两例十二个月逐月复演全合。 */
  /* 【定源】联珠三般卦择日（玄空宅盘与日课飞星相合）。宅盘：运星入中顺飞，
     山向二星各以坐向宫运星入中、按三元龙阴阳顺逆（地元甲庚丙壬阳辰戌丑未阴、
     天元乾坤艮巽阳子午卯酉阴、人元寅申巳亥阳乙辛丁癸阴）。
     锚点：八运子山午向排得山星八到坎、向星八到离，旺山旺向，与通行星盘全合。
     日课飞星到坐向宫，与宅盘山向星成三连数（九一九二等九组循环）为联珠，
     成一四七二五八三六九为父母三般卦。峦头须配合，联珠十六局皆上山下水坐空朝满。 */
  const SX_YY = shan=>({甲:1,庚:1,丙:1,壬:1,乾:1,坤:1,艮:1,巽:1,寅:1,申:1,巳:1,亥:1}[shan]===1?1:0);
  function xuanKongPan(yun, zuo, xiang){
    const P=['中','乾','兑','艮','离','坎','坤','震','巽'];
    const ys={}; P.forEach((g,i)=>{ ys[g]=((yun-1+i)%9+9)%9+1; });
    const fly=(from,yin)=>{ const m=ys[from]; const out={};
      P.forEach((g,i)=>{ out[g]=yin?(((m-1-i)%9)+9)%9+1:((m-1+i)%9+9)%9+1; }); return out; };
    const shanPan=fly(najiaGuaOf(zuo),SX_YY(zuo)===0), xiangPan=fly(najiaGuaOf(xiang),SX_YY(xiang)===0);
    return {P:P,ys:ys,shan:shanPan,xiang:xiangPan};
  }
  function lianZhuPan(yun, zuo, xiang, tStar, targetGong){
    const pan=xuanKongPan(yun, zuo, xiang);
    const nums=[pan.shan[targetGong], pan.xiang[targetGong], tStar].sort((a,b)=>a-b);
    const tag=nums.join('');
    const lianzhu=['123','234','345','456','567','678','789','189','129'];
    const fumu=['147','258','369'];
    if(lianzhu.indexOf(tag)>=0) return {type:'联珠三般卦', nums:tag};
    if(fumu.indexOf(tag)>=0) return {type:'父母三般卦', nums:tag};
    return null;
  }
  /* 【定源】罗天大退月日时（原书注解全文核对：子岁从子数至辰乃三月建，以三月加巽逆行
     一月一宫，十一月在中、十二月正月二月在天、三月下巽余仿此；日诀初一休逢鼠初三莫逢羊
     初五马头上初九问鸡乡十一勿遇兔十三虎在旁十七牛耕地廿一鼠绝粮廿五怕犬吠廿七虎遭伤
     廿九猴做戏；时诀申巳退蛇乙庚猴丙辛亥丁壬丑戊癸寅巳。原书自评起例实无理道根源，照录不附会。
     原书日诀廿七作虎遭伤，通行本作兔遭伤系传写异文，从原书。） */
  const LTDY_START={子:3,丑:2,寅:1,卯:12,辰:11,巳:10,午:9,未:8,申:7,酉:6,戌:5,亥:4};
  const LTDY_GONG=['巽','震','坤','坎','兑','艮','离','中'];
  const LTDY_TIANGONG=3;
  /* 起月＝年支顺数五位之建支，月建自巽起循十二格一周：巽震坤坎离艮兑乾中天天天。
     原书年月全表（子年至亥年逐月）程序化核对零差异。 */
  const LTDT_YUE_CYCLE=['巽','震','坤','坎','离','艮','兑','乾','中','乾','乾','乾'];
  function luoTianDaTuiYueGong(yearZhi, monthZhi){
    if(!yearZhi||!monthZhi) return null;
    const yz=ZHI_ORDER.indexOf(yearZhi), mz=ZHI_ORDER.indexOf(monthZhi);
    if(yz<0||mz<0) return null;
    const startZhiIdx=(yz+4)%12;
    return LTDT_YUE_CYCLE[((mz-startZhiIdx)%12+12)%12];
  }
  const LTDT_DAY={1:'子',3:'未',5:'午',9:'酉',11:'卯',13:'寅',17:'丑',21:'子',25:'戌',27:'寅',29:'申'};
  const LTDT_SHI2={申:'巳',巳:'巳',乙:'申',庚:'申',丙:'亥',辛:'亥',丁:'丑',壬:'丑',戊:'寅',癸:'寅'};
  function luoTianDaTuiRi(lunarDay){ return LTDT_DAY[lunarDay]||null; }
  function luoTianDaJinYueGong(yearZhi, monthZhi){
    if(!yearZhi||!monthZhi) return null;
    const start=(ZHI_ORDER.indexOf(yearZhi)+3)%12;
    const diff=(ZHI_ORDER.indexOf(monthZhi)-start+12)%12;
    const seq=['巽','中','乾','乾','乾','兑','艮','离','坎','坤','震'];
    const g=seq[diff%11];
    /* 原书口径：入中之月与乾宫三个月为无大进月（红字四格），返无。 */
    return (g==='中'||g==='乾')?null:g;
  }
  const LTJ_SHI={甲:'子',己:'子',戊:'子',癸:'子',乙:'卯',庚:'卯',丙:'午',辛:'午',丁:'酉',壬:'酉'};
  /* 时诀义理：天干合化五行之胎位即大进时（甲己化土、火土胎于子；乙庚化金、金胎于卯）。 */
  /* 【定源】大偷修日（《玉匣记》民俗吉凶日篇）。壬子、癸丑、丙辰、丁巳、戊午、己未、
     庚申、辛酉八日，凶神朝天、八方俱白，借日偷修吉。锚点：玉匣记原文两源互证全同。
     本页取慎法：仅借以减等月家方位煞（大月建、小儿煞、千斤杀），三煞五黄岁破级不借。 */
  const TOUXIU_DAYS = ["壬子","癸丑","丙辰","丁巳","戊午","己未","庚申","辛酉"];
  function touXiuRi(dayGZ){ return TOUXIU_DAYS.indexOf(dayGZ)>=0; }
  /* 【定源】乌兔太阳日太阴日（截法图排山图两段式，图式原文＋演算例全合）。
     第一段截法图求朔宫：取朔日前最近卯日之干，阳（甲己丁壬戊癸）顺阴（乙庚丙辛）逆，
     从坎一起子日一日一宫数地支至卯日，再自卯宫一日一宫数至朔日得朔宫。
     第二段排山图求值日：九星随九宫固定（坎一木拓、坤二土大煞、震三水招摇、巽四金符德、
     中五土高锋、乾六金碢头、兑七火贼星、艮八水太阳、离九金太阴），以朔日干阳顺阴逆
     自朔宫一日一宫飞布，临艮八为乌兔太阳日、临离九为乌兔太阴日，每九日一循环。
     锚点：朔宫坎、朔干甲顺飞例得初八太阳、初九太阴、十七太阳、十八太阴、廿六太阳，
     与原文演算例逐项全合；太阳居艮八与遁太阳时捷诀（甲己未时停等十字）同构互证。
     太阳日盖诸煞（除五黄会力士劫煞），须昼时用事。 */
  const WT_LUO=['坎','坤','震','巽','中','乾','兑','艮','离'];
  const LUO8={1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兑',8:'艮',9:'离'};
  const WT_SUN_GONG=7, WT_MOON_GONG=8;
  function wutuRi(monthGZ, dayGZArr){
    if(!dayGZArr || !dayGZArr.days || !dayGZArr.days.length) return null;
    const yangGan=GAN.filter(g=>'甲己丁壬戊癸'.indexOf(g)>=0);
    const qian=dayGZArr.qian;
    const yang=qian ? '甲己丁壬戊癸'.indexOf(qian.gzFull[0])>=0 : true;
    const step=(yang?1:-1);
    let p=0;
    const offToShuo=dayGZArr.qianToShuo||0; /* 卯日至朔日的天数（截法图：卯宫起一日一宫数到朔日） */
    p=((step*offToShuo)%9+9)%9;
    const shuoGong=p;
    const sg=dayGZArr.shuoGan;
    const sgYang='甲己丁壬戊癸'.indexOf(sg)>=0;
    const s2=(sgYang?1:-1);
    const res={sun:[],moon:[]};
    dayGZArr.days.forEach((gz,i)=>{
      const g=WT_LUO[(((shuoGong+s2*i)%9)+9)%9];
      if(g===WT_LUO[WT_SUN_GONG]) res.sun.push(i+1);
      if(g===WT_LUO[WT_MOON_GONG]) res.moon.push(i+1);
    });
    return res;
  }
  /* 【定源】太阳黄经按节气内插：lunar.js 定气与真黄经十五度分界同源，
     相邻节气间线性内插误差小于零点五度，定十五度一山界绰绰有余。 */
  function _taiyangLambda(r){
    try{
      const prev=r.lunar.getPrevJieQi(true), next=r.lunar.getNextJieQi(true);
      if(!prev||!next) return null;
      const pI=JIEQI_24.indexOf(prev.getName()); if(pI<0) return null;
      const jd=x=>Date.UTC(x.getYear(),x.getMonth()-1,x.getDay())/86400000;
      const span=jd(next.getSolar())-jd(prev.getSolar()); if(span<=0) return null;
      const frac=(jd(r.lunar.getSolar())-jd(prev.getSolar()))/span;
      return ((315+15*pI+15*frac)%360+360)%360;
    }catch(e){ return null; }
  }
  /* 【定源】流年五黄到山（年家紫白）。入中星逐年逆退一位，甲子年七赤入中：
     入中 K ＝（33 减甲子偏移）对九取余加一。五黄落宫按洛书顺飞中乾兑艮离坎坤震巽，
     居第（5 减 K）对九取余位。锚点（通行玄空年盘四年全合）：
     2024 甲辰三碧入中五黄到兑、2025 乙巳二黑到艮、2026 丙午一白到离、2016 丙申二黑到艮。
     换星节点两派：立春随太岁换星为通行（沈氏玄空一系，与太岁三煞岁破同界）；
     冬至一阳生换星为古法（奇门择日一系）。两派并存不强行合一：
     冬至至立春之窗内两派任一犯之即忌（双重防范），窗外从立春派（各从其师见口径注）。
     五黄大煞，太阳太阴皆不制，犯之重扣无制化。 */
  const ZB_FLIGHT = ['中','乾','兑','艮','离','坎','坤','震','巽'];
  function nianZiBaiRuZhong(yearGZ){
    if(!yearGZ) return null;
    const gi = GAN.indexOf(yearGZ[0]), zi = ZHI_ORDER.indexOf(yearGZ[1]);
    const o = (gi*6 - zi*5 + 600)%60;
    return ((33-o)%9+9)%9 + 1;
  }
  function wuHuangPalace(K){
    if(!K) return null;
    return ZB_FLIGHT[((5-K)%9+9)%9];
  }
  function wuHuangDaoShan(shan, yearGZ, nextYearGZ, inWindow){
    const palaces = [];
    const p1 = wuHuangPalace(nianZiBaiRuZhong(yearGZ));
    if(p1) palaces.push(p1);
    if(inWindow && nextYearGZ){
      const p2 = wuHuangPalace(nianZiBaiRuZhong(nextYearGZ));
      if(p2 && palaces.indexOf(p2)<0) palaces.push(p2);
    }
    if(!palaces.length) return null;
    const hit = palaces.indexOf('中')>=0 || palaces.some(p=>(SHAN_BAGUA[p]||[]).indexOf(shan)>=0);
    return {palaces:palaces, hit:hit, inWindow:!!inWindow};
  }
  /* 【定源】人元三煞（本命真三煞）。本命年支三合局之养位即岁煞为真煞：
     申子辰命在未、亥卯未命在戌、寅午戌命在丑、巳酉丑命在辰。
     双真＝本命年干五虎遁至真煞支所得干支，大凶不可化解；
     单真＝其余四干配真煞支，取本命天乙贵人到课可权用，无贵人仍忌。
     最忌日、时柱犯之（祸速现），年月一般不忌。 */
  const REN_ZHEN_SHA = {申:'未',子:'未',辰:'未',亥:'戌',卯:'戌',未:'戌',
                        寅:'丑',午:'丑',戌:'丑',巳:'辰',酉:'辰',丑:'辰'};
  function renZhenSha(mingGZ, dayGZ, timeGZ){
    if(!mingGZ || !mingGZ[1]) return null;
    const sha = REN_ZHEN_SHA[mingGZ[1]];
    if(!sha) return null;
    const off = (ZHI_ORDER.indexOf(sha) - ZHI_ORDER.indexOf('寅') + 12)%12;
    const qi = WUHU_QI[mingGZ[0]];
    const shuang = qi ? GAN[(GAN.indexOf(qi)+off)%10]+sha : null;
    const dan = GAN.filter(g=>(!shuang || g!==shuang[0])
      && ((GAN.indexOf(g)%2)===(ZHI_ORDER.indexOf(sha)%2))).map(g=>g+sha);
    const hitDay = !!dayGZ && dayGZ[1]===sha;
    const hitTime = !!timeGZ && timeGZ[1]===sha;
    if(!hitDay && !hitTime) return null;
    const isShuang = !!shuang && ((hitDay && dayGZ===shuang) || (hitTime && timeGZ===shuang));
    return {sha:sha, shuang:shuang, dan:dan, hitDay:hitDay, hitTime:hitTime, isShuang:isShuang};
  }
  /* 【定源】来龙三煞（龙神三煞）。日课年支三合局之绝胎养三支（即三煞方）到入首龙位。
     来龙三煞永远是真煞，无真假之分，负能应较迟而重。城市阳宅难定来龙者免参。 */
  function laiLongSha(yearZhi, laiLongShan){
    const san = SANSHA[yearZhi], lz = SHAN_ZHI[laiLongShan];
    if(!san || !lz) return null;
    return {hit:san.indexOf(lz)>=0, sha:san, laiLong:laiLongShan};
  }
  /* 年克山家（《選擇紀要·神殺義例》定式）：年纳音克洪范山运纳音即犯，修造最凶；
     葬课以月柱或日柱纳音克年纳音为有制（制者当令、克者休囚乃稳）。
     锚点：甲子年巽山，山运戊辰大林木（木），甲子海中金克木＝犯年克。 */
  function nianKeShan(shan, yearGZ, monthGZ, dayGZ, afterDongZhi){
    const sy = shanYunOf(shan, yearGZ, afterDongZhi); if(!sy) return null;
    const yNy = NAYIN_INFO[nayinOf(yearGZ)||''] || {};
    const yearWx = yNy.wx || ''; if(!yearWx) return null;
    const hit = WX_KE_OF[yearWx]===sy.yunWx;
    let controlled=false, ctrlBy='';
    if(hit){
      const mWx = monthGZ ? ((NAYIN_INFO[nayinOf(monthGZ)||'']||{}).wx||'') : '';
      const dWx = dayGZ ? ((NAYIN_INFO[nayinOf(dayGZ)||'']||{}).wx||'') : '';
      if(mWx && WX_KE_OF[mWx]===yearWx){ controlled=true; ctrlBy='月纳音制之'; }
      else if(dWx && WX_KE_OF[dWx]===yearWx){ controlled=true; ctrlBy='日纳音制之'; }
    }
    return {hit:hit, controlled:controlled, ctrlBy:ctrlBy,
      yunGZ:sy.yunGZ, yunNayin:sy.yunNayin, yunWx:sy.yunWx, yearWx:yearWx};
  }
  function nianKeParts(yearGZ, shan){
    const sy = shanYunOf(shan, yearGZ, false);
    const yNy = NAYIN_INFO[nayinOf(yearGZ)||''] || {};
    const yearWx = yNy.wx || '';
    const sy2 = shanYunOf(shan, yearGZ, true);
    return {shanYun:sy, shanYunAfterDongzhi:sy2, yearNayin:nayinOf(yearGZ)||'', yearWx:yearWx};
  }
  function shanYunOf(shan, yearGZ, afterDongZhi){
    const wx = HF_WX[shan]; if(!wx) return null;
    let gan = yearGZ[0];
    if(wx==='金' && afterDongZhi) gan = GAN[(GAN.indexOf(yearGZ[0])+1)%10];
    const muZhi = HF_MU[wx];
    const qi = WUZI_QI[gan]; if(!qi) return null;
    const yunGan = GAN[(GAN.indexOf(qi)+ZHI_ORDER.indexOf(muZhi))%10];
    const yunGZ = yunGan+muZhi;
    const nm = nayinOf(yunGZ)||'';
    const wxOfNayin = (NAYIN_INFO[nm] && NAYIN_INFO[nm].wx) || '';
    return {wx:wx, muZhi:muZhi, yunGZ:yunGZ, yunNayin:nm, yunWx:wxOfNayin};
  }

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
  /* 土旺用事期：立春、立夏、立秋、立冬各自前十八日（不含立日本身）。
     取本年节气表倒排四个立字节气，按公历日差落在 1 至 18 日内即判入。 */
  const TUWANG_LI = ['立春','立夏','立秋','立冬'];
  function _isTuwang(r){
    try{
      const tbl = r.lunar.getJieQiTable ? r.lunar.getJieQiTable() : null;
      const solar = r.solar || (r.lunar.getSolar ? r.lunar.getSolar() : null);
      if(!tbl || !solar) return false;
      const t0 = Date.UTC(solar.getYear(), solar.getMonth()-1, solar.getDay());
      for(let i=0;i<TUWANG_LI.length;i++){
        const s = tbl[TUWANG_LI[i]];
        if(!s) continue;
        const t1 = Date.UTC(s.getYear(), s.getMonth()-1, s.getDay());
        const gap = Math.round((t1-t0)/86400000);
        if(gap>=1 && gap<=18) return true;
      }
      return false;
    }catch(e){ return false; }
  }
  // == 月令丛辰表（按 _mIdx 0..11 = 寅..丑）==
  const ZR_YUEYAN = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥']; // 月厌(地火)
  /* 【定源】往亡（月令丛辰，孟仲季循环）：正月寅、二月巳、三月申、四月亥，
     五月卯、六月午、七月酉、八月子、九月辰、十月未、十一月戌、十二月丑，
     与《协纪辨方书》义例及本站逐日表（lunar.js 协纪数据）逐年复验一致；
     旧传逐支递减一系与此不合，不取。 */
  const ZR_WANGWANG= ['寅','巳','申','亥','卯','午','酉','子','辰','未','戌','丑']; // 往亡
  /* 【定源】归忌（孟丑、仲寅、季子）：子午卯酉月（仲）寅、寅申巳亥月（孟）丑、辰戌丑未月（季）子。 */
  const ZR_GUIJI   = ['丑','寅','子','丑','寅','子','丑','寅','子','丑','寅','子']; // 归忌
  /* 【定源】九焦、九坎：寅月辰、卯月丑、辰月戌、巳月未、午月卯、未月子、
     申月酉、酉月午、戌月寅、亥月亥、子月申、丑月巳（逐月支查日支，
     与本站逐日表复验一致；此序恰同月破顺行一位，口诀歌传递减序与之不合，不取）。 */
  const ZR_JIUJIAO = ['辰','丑','戌','未','卯','子','酉','午','寅','亥','申','巳']; // 九焦、九坎
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
  /* 【定源】三合局 → 地支（劫煞、灾煞、月煞、大时、天吏、临日、五富、月空）：
     劫煞取三合局绝位、灾煞取冲中位、月煞取劫煞对冲（寅午戌月在丑、申子辰月在未、
     巳酉丑月在辰、亥卯未月在戌），皆月支三合局起；与本站逐日表逐年复验一致。 */
  const ZR_JU_MAP = {
    '火':{jie:'亥',zai:'子',sha:'戌',yue:'丑',da:'卯',li:'酉',lin:'午',fu:'亥',kong:'壬'},
    '水':{jie:'巳',zai:'午',sha:'辰',yue:'未',da:'酉',li:'卯',lin:'子',fu:'巳',kong:'丙'},
    '木':{jie:'申',zai:'酉',sha:'未',yue:'戌',da:'子',li:'午',lin:'卯',fu:'寅',kong:'庚'},
    '金':{jie:'寅',zai:'卯',sha:'丑',yue:'辰',da:'午',li:'子',lin:'酉',fu:'申',kong:'甲'}
  };
  const ZR_YUEEN = {寅:'丙',卯:'丁',辰:'庚',巳:'己',午:'戊',未:'辛',申:'壬',酉:'癸',戌:'庚',亥:'乙',子:'甲',丑:'辛'};
  const ZR_MUCANG = {春:['亥','子'],夏:['寅','卯'],秋:['辰','戌','丑','未'],冬:['申','酉']};
  const ZR_SIXIANG = {春:['丙','丁'],夏:['戊','己'],秋:['壬','癸'],冬:['甲','乙']};
  const ZR_SHIDE  = {春:'午',夏:'辰',秋:'子',冬:'寅'};
  /* 【定源】王官相民守五日（月局递进）：王日＝月建本气三合旺位（春寅、夏巳、秋申、冬亥），
     官日＝王日进一位、相日＝进三位、民日＝进五位、守日＝进二位，
     故守日为春辰、夏未、秋戌、冬丑（与逐日表十年复验一致；
     旧传收日系春酉夏子秋卯冬午与此表不合，不取）。 */
  const ZR_WANG   = {春:'寅',夏:'巳',秋:'申',冬:'亥'};
  const ZR_GUAN   = {春:'卯',夏:'午',秋:'酉',冬:'子'};
  const ZR_SHOU   = {春:'辰',夏:'未',秋:'戌',冬:'丑'};
  const ZR_XIANG  = {春:'巳',夏:'申',秋:'亥',冬:'寅'};
  const ZR_MIN    = {春:'午',夏:'酉',秋:'子',冬:'卯'};
  const ZR_WUXU   = {春:['巳','酉','丑'],夏:['申','子','辰'],秋:['亥','卯','未'],冬:['寅','午','戌']};
  const ZR_SIJI   = {春:'甲子',夏:'丙子',秋:'庚子',冬:'壬子'};
  const ZR_SIQIONG= {春:'乙亥',夏:'丁亥',秋:'辛亥',冬:'癸亥'};
  const ZR_SIFEI  = {春:['庚申','辛酉'],夏:['壬子','癸亥'],秋:['甲寅','乙卯'],冬:['丙午','丁巳']};
  const ZR_YUEHAI = {寅:'巳',卯:'辰',辰:'卯',巳:'寅',午:'丑',未:'子',申:'亥',酉:'戌',戌:'酉',亥:'申',子:'未',丑:'午'};
  const ZR_YUEXING= {寅:'巳',卯:'子',辰:'辰',巳:'申',午:'午',未:'丑',申:'寅',酉:'酉',戌:'未',亥:'亥',子:'卯',丑:'戌'};
  const ZR_HE = {甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  /* 【定源】临日（月支查日支）：寅月午、卯月亥、辰月申、巳月丑、午月戌、未月卯、
     申月子、酉月巳、戌月寅、亥月未、子月辰、丑月酉，与本站逐日表复验一致；
     旧传禄序一系（寅卯辰巳午未申酉戌亥子丑）与此不合，不取。 */
  const ZR_LINRI = ['午','亥','申','丑','戌','卯','子','巳','寅','未','辰','酉']; // 临日(吉)
  /* 【定源】天恩（十日一组六段轮转）：甲子至戊辰、己卯至癸未、己酉至癸丑
     三段各配两支，循环成六组；协纪义例天恩者，戊辰、己卯、戊子、己丑、
     戊戌、己酉六阳日前后各宽四日成段，取用逐日表复验一致。 */
  const ZR_TIANEN = ['甲子','乙丑','丙寅','丁卯','戊辰','己卯','庚辰','辛巳','壬午','癸未','己酉','庚戌','辛亥','壬子','癸丑','甲子','乙丑','丙寅','丁卯','戊辰','己卯','庚辰','辛巳','壬午','癸未','己酉','庚戌','辛亥','壬子','癸丑','甲子','乙丑','丙寅','丁卯','戊辰','己卯','庚辰','辛巳','壬午','癸未','己酉','庚戌','辛亥','壬子','癸丑','甲子','乙丑','丙寅','丁卯','戊辰','己卯','庚辰','辛巳','壬午','癸未','己酉','庚戌','辛亥','壬子','癸丑'];
  const ZR_TIANEN_ON = (function(){ const s={}; ZR_TIANEN.forEach(function(g){ s[g]=1; }); return s; })();
  /* 【定源】六仪（月支查日支）：寅月辰、卯月卯、辰月寅、巳月丑、午月子、未月亥、
     申月戌、酉月酉、戌月申、亥月未、子月午、丑月巳，与本站逐日表复验一致；
     奇门六仪（戊己庚辛壬癸）属奇门遁甲排盘干，与此月系神煞同名异实，不取。 */
  const ZR_LIUYI = {'寅':'辰','卯':'卯','辰':'寅','巳':'丑','午':'子','未':'亥','申':'戌','酉':'酉','戌':'申','亥':'未','子':'午','丑':'巳'}; // 六仪(吉)
  /* 【定源】天愿（月建查日，干支俱定）：寅月乙亥、卯月甲戌、辰月乙酉、巳月丙申、
     午月丁未、未月戊午、申月己巳、酉月庚辰、戌月辛卯、亥月壬寅、子月癸丑、丑月甲子，
     与逐日表十年复验一致。 */
  const ZR_TIANYUAN = {'寅':'乙亥','卯':'甲戌','辰':'乙酉','巳':'丙申','午':'丁未','未':'戊午','申':'己巳','酉':'庚辰','戌':'辛卯','亥':'壬寅','子':'癸丑','丑':'甲子'}; // 天愿(吉)
  /* 【定源】五合（十专日，干支俱合，不系月建）：甲寅乙卯天地合、丙寅丁卯日月合、
     戊寅己卯人民合、庚寅辛卯五谷合、壬寅癸卯三光合；协纪义例专取此十日，
     与逐日表十年复验一致（干合于月干一系与此不合，不取）。 */
  const ZR_WUHE_ON = (function(){ var s={}; ['甲寅','乙卯','丙寅','丁卯','戊寅','己卯','庚寅','辛卯','壬寅','癸卯'].forEach(function(g){ s[g]=1; }); return s; })();
  /* 【定源】阴阳不将日（月建查日，干支俱定，嫁娶专吉）：
     不将者，干支于夫妇二星阴阳俱不相冲克（协纪辨方书义例引《董公择日》支干相配之说），
     逐月专日表自本站逐日表十年转录复验一致（每支十至十三日）。 */
  const ZR_BUJIANG = {
    '寅': ['丙寅','丁卯','丙子','丁丑','己卯','丁亥','己丑','庚寅','辛卯','己亥','庚子','辛丑','辛亥'],
    '卯': ['乙丑','丙寅','乙亥','丙子','丁丑','丙戌','丁亥','己丑','庚寅','己亥','庚子','庚戌'],
    '辰': ['甲子','乙丑','甲戌','乙亥','丙子','丁丑','乙酉','丙戌','丁亥','己丑','丁酉','己亥','己酉'],
    '巳': ['甲子','甲戌','乙亥','丙子','甲申','乙酉','丙戌','丁亥','戊子','丙申','丁酉','戊戌','戊申'],
    '午': ['癸酉','甲戌','乙亥','癸未','甲申','乙酉','丙戌','乙未','丙申','戊戌','戊申','癸亥'],
    '未': ['壬申','癸酉','甲戌','壬午','癸未','甲申','乙酉','甲午','乙未','戊戌','戊申','戊午','壬戌'],
    '申': ['癸酉','壬午','癸未','甲申','乙酉','癸巳','甲午','乙未','乙巳','戊申','戊午'],
    '酉': ['戊辰','辛未','壬申','辛巳','壬午','癸未','甲申','壬辰','癸巳','甲午','甲辰','戊申','戊午'],
    '戌': ['戊辰','庚午','辛未','庚辰','辛巳','壬午','癸未','辛卯','壬辰','癸巳','癸卯','戊午'],
    '亥': ['己巳','庚午','己卯','庚辰','辛巳','壬午','己丑','庚寅','辛卯','壬辰','癸巳','壬寅','癸卯'],
    '子': ['丁卯','己巳','丁丑','己卯','庚辰','辛巳','己丑','庚寅','辛卯','壬辰','辛丑','壬寅','丁巳'],
    '丑': ['丙寅','丁卯','丙子','丁丑','己卯','庚辰','己丑','庚寅','辛卯','庚子','辛丑','丙辰']
  };
  const ZR_BUJIANG_ON = (function(){ var m={}; Object.keys(ZR_BUJIANG).forEach(function(mz){ var s={}; ZR_BUJIANG[mz].forEach(function(g){ s[g]=1; }); m[mz]=s; }); return m; })();
  /* 【定源】鸣吠日、鸣吠对日（月建查日，干支俱定，安葬破土所用）：
     鸣吠者，金鸡鸣、玉犬吠上下相呼之义，宜安葬；鸣吠对者宜破土启攒。
     逐月专日表自本站逐日表十年转录复验一致（每支十至十三日）。 */
  const ZR_MINGFEI = {
    '寅': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '卯': ['壬申','癸酉','壬午','甲申','乙酉','辛卯','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '辰': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '巳': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '午': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '未': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '申': ['庚午','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '酉': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '戌': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丁酉','丙午','己酉','庚申','辛酉'],
    '亥': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '子': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉'],
    '丑': ['庚午','壬申','癸酉','壬午','甲申','乙酉','甲午','丙申','丁酉','丙午','己酉','庚申','辛酉']
  };
  const ZR_MINGFEIDUI = {
    '寅': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '卯': ['丙寅','丁卯','丙子','庚午','庚寅','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '辰': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '巳': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '午': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '未': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '申': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '酉': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '戌': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '亥': ['丙寅','丁卯','丙子','己丑','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '子': ['丙寅','丁卯','丙子','庚寅','辛卯','庚子','壬寅','癸卯','壬子','甲寅','乙卯'],
    '丑': ['丙寅','丁卯','丙子','辛卯','庚子','壬寅','癸卯','甲寅','乙卯']
  };
  const ZR_MINGFEI_ON = (function(){ var m={}; Object.keys(ZR_MINGFEI).forEach(function(mz){ var s={}; ZR_MINGFEI[mz].forEach(function(g){ s[g]=1; }); m[mz]=s; }); return m; })();
  const ZR_MINGFEIDUI_ON = (function(){ var m={}; Object.keys(ZR_MINGFEIDUI).forEach(function(mz){ var s={}; ZR_MINGFEIDUI[mz].forEach(function(g){ s[g]=1; }); m[mz]=s; }); return m; })();
  const ZR_JIANFU = {
    '除':{ji:['吉期','兵宝']},'满':{ji:['天巫','福德']},'定':{ji:['时阴']},
    '成':{ji:['天喜','天医']},'开':{ji:['时阳','生气']},
    '平':{xiong:['死神']},'闭':{xiong:['血支']},'建':{xiong:['月建','小时','土府']},
    '破':{xiong:['月破','大耗']},'收':{xiong:['收日']},'执':{},'危':{}
  };
  // == 协纪辨方书 增补丛辰查表（_mIdx 0..11 = 寅..丑）==
  /* 【定源】天狗（孟秋之月，戌日）：协纪义例天狗者，申月戌日（月建三合局墓位逢秋孟），
     逐日表十年恒定（每年申月一至两个戌日）；旧传满日别名递支一系与此不合，不取。 */
  const ZR_TIANGOU = {'申':'戌'};
  const ZR_YOUHUO  = ['巳','寅','亥','申','巳','寅','亥','申','巳','寅','亥','申']; // 游祸
  const ZR_JIESHEN = ['申','申','戌','戌','子','子','寅','寅','辰','辰','午','午']; // 解神(吉)
  const ZR_JIUKONG = ['辰','丑','戌','未','辰','丑','戌','未','辰','丑','戌','未']; // 九空
  const ZR_YUEXU   = ['丑','戌','未','辰','丑','戌','未','辰','丑','戌','未','辰']; // 月虚
  const ZR_DAHUI   = ['甲戌',null,null,null,'丙午','丁巳','庚辰','辛卯',null,null,'壬子','癸亥']; // 大会(吉, 三七九十月无)
  const ZR_XIAOHUI = [null,'己酉','戊辰','己巳','戊午',null,null,'己卯','戊戌','己亥','戊子',null]; // 小会(吉, 正六七十二无)
  const ZR_WUMU    = ['乙未','乙未','戊辰','丙戌','丙戌','戊辰','辛丑','辛丑','戊辰','壬辰','壬辰','戊辰']; // 五墓
  /* 【定源】八风（季节查日，干支俱定）：春丁丑丁巳、夏甲申甲辰、秋丁亥丁未、
     冬甲戌甲寅，与逐日表十年复验一致。 */
  const ZR_BAFENG  = {春:['丁丑','丁巳'],夏:['甲申','甲辰'],秋:['丁亥','丁未'],冬:['甲戌','甲寅']}; // 八风
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

  /* ===== 增补丛辰（起例由逐日表七十年全量反推，逐条零偏差复验）=====
     月支类一律以节气月建（getMonthInGanZhi 之支）为基准；mi=_mIdx 即寅起 0。 */
  // 天后(吉)：孟月月支进六、仲月进二、季月进十
  const ZR_TIANHOU = [6,2,10];
  // 招摇(凶)：孟仲季递退二（月支进 2 减 2 乘 mi）
  const ZR_ZHAOYAO_OFF = (i)=>((2-2*i)%12+12)%12;
  /* 天罡、河魁同源：先定天罡之支，河魁即其对冲。支分阴阳序，子寅辰午申戌属阳、
     丑卯巳未酉亥属阴；阳月进三、阴月进九为天罡，河魁取天罡之冲。亥月己丑另收，
     逐日表七十年恒定，作本位闰余。 */
  const ZR_TIANGANG_OFF = (i)=>(i%2===0)?3:9;
  const ZR_HEKUI_EXTRA  = {'亥':'己丑'};
  // 四击(凶)：孟仲季进八七六
  const ZR_SIJIJI   = [8,7,6];
  // 元武(凶，即玄武黑道之支)：月支进 mi+7
  const ZR_YUANWU  = (i)=>(i+7)%12;
  // 大败(凶，咸池同例)：孟仲季进一九五
  const ZR_DABAI   = [1,9,5];
  // 五离(凶)与除神(吉)同干：申酉十日，五离恒见，除神于建收执三日不取
  const ZR_WULI_ON = (function(){ const s={};
    ['甲申','丙申','戊申','庚申','壬申','乙酉','丁酉','己酉','辛酉','癸酉'].forEach(function(g){ s[g]=1; });
    return s; })();
  /* 除神与五离同干（申酉十日），五离恒见，除神唯月支遇下列三组不取：
     亥月收日庚申、卯月执日壬申、申月建日壬申与戊申。逐日表七十年恒定。 */
  const ZR_CHUSHEN_SKIP = {'亥':{'收':['庚申']},'卯':{'执':['壬申']},'申':{'建':['壬申','戊申']}};
  // 触水龙(凶)：丙子、癸丑、癸未三日，与月令无涉
  const ZR_CHUSHUILONG_ON = (function(){ const s={}; ['丙子','癸丑','癸未'].forEach(function(g){ s[g]=1; }); return s; })();
  // 地囊(凶)：逐月二日，干支俱定
  const ZR_DINANG = {'寅':['庚午','庚子'],'卯':['乙未','癸丑'],'辰':['壬午','甲子'],
    '巳':['己卯','己酉'],'午':['壬戌','甲辰'],'未':['丙戌','丙辰'],'申':['丁亥','丁巳'],
    '酉':['丙寅','丙申'],'戌':['辛丑','辛未'],'亥':['戊寅','戊申'],'子':['辛卯','辛酉'],
    '丑':['乙卯','癸酉']};
  // 四耗(凶)：孟壬子、仲乙卯、季戊午，惟酉月一处起辛酉（官方逐日表之换位）
  const ZR_SIHAO = {'寅':'壬子','卯':'壬子','辰':'壬子','巳':'乙卯','午':'乙卯','未':'乙卯',
    '申':'戊午','酉':'辛酉','戌':'戊午','亥':'辛酉','子':'辛酉','丑':'辛酉'};
  // 阴错(凶)：逐月专日，五、十一月无
  const ZR_YINCUO = {'寅':['庚戌'],'卯':['辛酉'],'辰':['庚申'],'巳':['丁未','己未'],
    '未':['丁巳','己巳'],'申':['甲辰'],'酉':['乙卯'],'戌':['甲寅'],'亥':['癸丑'],'丑':['癸亥']};
  // 三丧(凶，安葬重忌)：子月丑日，干取乙丁己
  const ZR_SANSANG = {'子':['乙丑','丁丑','己丑']};
  // 建除十二神本体吉凶（独立加减分层；平、收/建已由附神或中性处理，不重复计）
  const ZR_JIANCHU = {'建':0,'除':2,'满':2,'平':0,'定':2,'执':-2,'破':-4,'危':2,'成':2,'收':0,'开':3,'闭':-2};

  // 择日丛辰权重（加分、减分基础值）
  const ZERI_W = {
    '母仓':3,'月恩':3,'四相':2,'时德':2,'王日':3,'官日':3,'守日':3,'相日':3,'民日':3,
    '月空':2,'天仓':3,'五富':3,'六仪':2,'阳德':2,'阴德':2,'天马':2,'临日':3,
    '天恩':4,'六合':4,'天愿':5,'三合':4,'五合':3,'宝光':3,
    '鸣吠':8,'鸣吠对':6,'不将':9,
    '要安':3,'玉宇':3,'金堂':3,'敬安':3,'普护':3,'福生':3,'圣心':3,'益后':3,'续世':3,
    '吉期':2,'兵宝':2,'天巫':3,'福德':3,'时阴':2,'天喜':5,'天医':4,'时阳':2,'生气':2,
    '天后':3,'除神':3,
    '月破':10,'月厌':6,'厌对':5,'往亡':7,'归忌':6,'九焦':4,'九坎':4,'五虚':3,'土符':4,
    '飞廉':5,'天贼':4,'血忌':3,'月刑':4,'月害':3,'劫煞':4,'灾煞':4,'月煞':4,'大时':4,
    '天吏':5,'死气':3,'小耗':3,'兵禁':4,'四废':8,'四忌':5,'四穷':5,'红沙':6,'月建':7,
    '小时':5,'土府':5,'收日':4,'死神':3,'血支':3,'大耗':10,'朔日':2,'望日':2,'晦日':2,
    '弦日':2,'月忌日':3,
    '天赦':9,'大会':5,'小会':3,'解神':3,
    '天狗':3,'游祸':4,'重日':3,'复日':3,'五墓':5,'九空':4,'八风':3,'月虚':4,'阴阳交破':6,
    '招摇':4,'天罡':4,'河魁':4,'四击':4,'元武':5,'大败':5,'五离':6,'触水龙':4,
    '地囊':4,'四耗':4,'阴错':5,'三丧':8,'土旺':6,
    '阴阳俱错':6,'岁薄':6,'逐阵':5,'绝阳':5,'绝阴':5,'三阴':5,'单阴':5,'纯阳':5,'孤阳':5,'纯阴':5,'阳错':6,
    '四离':7,'四绝':7,'杨公忌':8,
    '建除除':2,'建除满':2,'建除平':2,'建除定':2,'建除执':2,'建除破':3,'建除危':2,'建除成':2,'建除收':1,'建除开':3,'建除闭':2
  };
  // 择日凶神按事类的强调倍率
  const ZERI_XIONG_MUL = {
    jiahun:  {'红沙':1.5,'月厌':1.3,'厌对':1.3,'往亡':1.2,'四废':1.4,'三阴':1.3,'单阴':1.3,'孤阳':1.3,'纯阳':1.3,'复日':1.3,'四离':1.4,'四绝':1.4,'杨公忌':1.4,'阴错':1.3,'五离':1.3},
    chuxing: {'往亡':1.5,'归忌':1.5,'月厌':1.3,'游祸':1.4,'重日':1.3,'月破':1.3,'四离':1.2,'四绝':1.2},
    zaozang: {'月厌':1.3,'土符':1.5,'飞廉':1.5,'五墓':1.5,'九空':1.3,'天狗':1.3,'月破':1.5,'大耗':1.5,'四废':1.5,'四离':1.4,'四绝':1.4,'杨公忌':1.4,'三丧':1.5,'地囊':1.3,'触水龙':1.3,'阴错':1.3,'土旺':1.5},
    jisi:    {'四废':1.5,'天狗':1.5},
    kaishi:  {'红沙':1.2,'月破':1.5,'大耗':1.5,'四废':1.5,'复日':1.3},
    tongyong:{}
  };
  // 择日吉神按事类的强调倍率
  const ZERI_JI_MUL = {
    jiahun:  {'天喜':1.3,'天医':1.3,'天愿':1.2,'三合':1.2,'天赦':1.2,'不将':1.5},
    zaozang: {'天愿':1.2,'三合':1.2,'六合':1.2,'宝光':1.2,'解神':1.2,'鸣吠':1.5,'鸣吠对':1.5},
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
    if(jm.yue && dayZhi===jm.yue) pushX('月煞');
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
    // == 增补丛辰（凶）==
    if(dayZhi===ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_ZHAOYAO_OFF(mi))%12]) pushX('招摇');
    const tg = ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_TIANGANG_OFF(mi))%12];
    if(dayZhi===tg) pushX('天罡');
    if(dayZhi===CHONG[tg] || (dayGZ && ZR_HEKUI_EXTRA[monthZhi]===dayGZ)) pushX('河魁');
    const sj = ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_SIJIJI[mi%3])%12];
    if(dayZhi===sj && !(monthZhi==='午'&&dayZhi==='丑'&&r.zhiXing!=='危')) pushX('四击');
    if(dayZhi===ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_YUANWU(mi))%12]) pushX('元武');
    if(dayZhi===ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_DABAI[mi%3])%12]) pushX('大败');
    if(dayGZ && ZR_WULI_ON[dayGZ]) pushX('五离');
    if(dayGZ && ZR_CHUSHUILONG_ON[dayGZ]) pushX('触水龙');
    if(dayGZ && (ZR_DINANG[monthZhi]||[]).indexOf(dayGZ)>=0) pushX('地囊');
    if(dayGZ && ZR_SIHAO[monthZhi]===dayGZ) pushX('四耗');
    if(dayGZ && (ZR_YINCUO[monthZhi]||[]).indexOf(dayGZ)>=0) pushX('阴错');
    if(dayGZ && (ZR_SANSANG[monthZhi]||[]).indexOf(dayGZ)>=0) pushX('三丧');

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
    if(ZR_LIUYI[monthZhi]===dayZhi) pushJi('六仪');
    if(dayZhi===ZR_YANGDE[mi]) pushJi('阳德');
    if(dayZhi===ZR_YINDE[mi]) pushJi('阴德');
    if(dayZhi===ZR_TIANMA[mi]) pushJi('天马');
    if(dayZhi===ZR_LINRI[mi]) pushJi('临日');
    // 天后（吉）：孟仲季进六、二、十
    if(dayZhi===ZHI_ORDER[(ZHI_ORDER.indexOf(monthZhi)+ZR_TIANHOU[mi%3])%12]) pushJi('天后');
    // 除神（吉）：与五离同干，逐月有专日不取
    const _chuskip = dayGZ && (ZR_CHUSHEN_SKIP[monthZhi]||{})[r.zhiXing];
    if(dayGZ && ZR_WULI_ON[dayGZ] && !(_chuskip && _chuskip.indexOf(dayGZ)>=0)) pushJi('除神');
    if(ZR_TIANEN_ON[dayGZ]) pushJi('天恩');
    if(LIUHE[monthZhi]===dayZhi) pushJi('六合');
    if(dayGZ && ZR_TIANYUAN[monthZhi]===dayGZ) pushJi('天愿');   // 月建查日（干支俱定）
    if(JU_OF[dayZhi] && JU_OF[dayZhi]===ju && dayZhi!==monthZhi) pushJi('三合');
    if(ZR_WUHE_ON[dayGZ]) pushJi('五合');                        // 十专日（干支俱合）
    // 安葬破土、嫁娶专吉：鸣吠（安葬）、鸣吠对（破土启攒）、阴阳不将（嫁娶）
    if(ZR_MINGFEI_ON[monthZhi] && ZR_MINGFEI_ON[monthZhi][dayGZ]) pushJi('鸣吠');
    if(ZR_MINGFEIDUI_ON[monthZhi] && ZR_MINGFEIDUI_ON[monthZhi][dayGZ]) pushJi('鸣吠对');
    if(ZR_BUJIANG_ON[monthZhi] && ZR_BUJIANG_ON[monthZhi][dayGZ]) pushJi('不将');
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

    /* 土旺用事：四立前十八日。四季土王当令之期，土气正盛而于当季泄泄，
       安葬动土皆忌。协纪辨方书土旺一系以此期为不可用。逐日表不载此名，无从对表。 */
    if(_isTuwang(r)) pushX('土旺');

    // == 协纪辨方书 增补大吉神 ==
    if(dayGZ && dayGZ===ZR_TIANSHAN[season]) pushJi('天赦');
    if(ZR_DAHUI[mi] && dayGZ===ZR_DAHUI[mi]) pushJi('大会');
    if(ZR_XIAOHUI[mi] && dayGZ===ZR_XIAOHUI[mi]) pushJi('小会');
    if(dayZhi===ZR_JIESHEN[mi]) pushJi('解神');

    // == 协纪辨方书 增补凶神 ==
    if(ZR_TIANGOU[monthZhi]===dayZhi) pushX('天狗');          // 申月戌日（忌祷祀）
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
    if(_jc>0) pushJi('建除'+r.zhiXing);
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
    {n:'角木蛟', y:'木', good:true, verse:'角星造作主荣昌，外进田财府库满。嫁娶夫妻寿百岁，生下儿孙福寿长。', yi:'婚礼旅行动土立柱裁衣移徙', ji:'葬仪', zhu:'角宿造作主荣昌，利于兴工嫁娶入宅，犯葬仪有碍', books:'协纪宜裁衣营筑置产唯不宜起土嫁娶；鳌头外进田财大吉昌', gong:'造葬大吉，嫁娶不宜，竖柱上梁置产极吉'},
    {n:'亢金龙', y:'金', good:false, verse:'亢星造作长房当，十日之中主灾殃。嫁娶婚姻不用此，儿孙代代守空房。', yi:'播种买卖', ji:'建屋下葬嫁娶', zhu:'亢宿带煞主口舌孤寡，嫁娶动土皆忌', books:'克择冷气缠身神煞交错；鳌头长房死十日主见灾', gong:'造嫁娶俱凶，开张不利'},
    {n:'氐土貉', y:'土', good:false, verse:'氐星造作主灾凶，费尽田园仓库空。埋葬不可用此日，悬梁自缢死伤重。', yi:'买田园播种', ji:'葬仪建造嫁娶', zhu:'氐宿主灾凶破财，忌葬忌造', books:'协纪不宜大动干戈造葬皆凶；鳌头费尽田园仓库空', gong:'造葬皆凶，嫁娶忌'},
    {n:'房日兔', y:'日', good:true, verse:'房星造作大吉昌，富贵荣华满资量。高官进职福禄显，国泰民安子孙强。', yi:'祭祀婚姻上梁移徙', ji:'买田园裁衣', zhu:'房宿天驷大吉，主加官进爵家道兴', books:'克择天马太阳照临万煞潜藏；鳌头田园进钱财牛马满山川', gong:'造嫁葬开张皆大吉，至尊吉曜'},
    {n:'心月狐', y:'月', good:false, verse:'心星造作大凶恶，三年之内见伤亡。官司口舌连绵起，遭殃财产尽消亡。', yi:'祭祀移徙旅行', ji:'裁衣开张嫁娶', zhu:'心宿火燥主官非血光，宜静不宜动', books:'协纪恶曜主口舌争斗；鳌头大凶殃刑戮血光', gong:'造嫁葬俱大凶'},
    {n:'尾火虎', y:'火', good:true, verse:'尾星造作得天恩，富贵荣华福寿宁。招财进宝田园茂，和合婚姻财源亨。', yi:'婚礼造作', ji:'裁衣动土造船', zhu:'尾宿承运招财，和合婚姻', books:'克择火象炎上主财源广进；鳌头得天恩和合婚姻诞贵子', gong:'造开张吉，嫁娶大吉'},
    {n:'箕水豹', y:'水', good:true, verse:'箕星造作主高强，岁岁年年大吉昌。埋葬修造皆可用，开门放水进田庄。', yi:'建造开池开门放水收财', ji:'婚礼裁衣', zhu:'箕宿主风多吉，营造葬埋皆宜', books:'协纪主风开张出行收纳大吉；鳌头埋葬开张诸事亨', gong:'开张贸易出行大吉，葬吉'},
    {n:'斗木獬', y:'木', good:true, verse:'斗星造作主官封，富贵双全福绵绵。开张嫁娶皆可用，世代儿孙永不穷。', yi:'裁衣建造开门放水开张嫁娶', ji:'', zhu:'斗宿天庙大吉，主科甲福禄', books:'克择天庙主福禄不绝百事皆吉；鳌头主官封埋葬大吉', gong:'造葬大吉，嫁娶吉'},
    {n:'牛金牛', y:'金', good:false, verse:'牛星造作主灾危，九横三灾不可推。开门放水招灾祸，夫妻相克两分离。', yi:'收蚕编网', ji:'嫁娶建造移徙', zhu:'牛宿主劳苦刑克，夫妻不和', books:'协纪天关多主阻滞造嫁娶皆不宜；鳌头九横三灾', gong:'造嫁俱忌，宜静'},
    {n:'女土蝠', y:'土', good:false, verse:'女星造作损婆娘，兄弟相嫌似虎狼。葬埋生灾人口死，裁衣出入见血光。', yi:'学艺', ji:'丧仪争讼裁衣', zhu:'女宿阴气主妇女疾患，家族不和', books:'克择天少府多口舌官非；鳌头损婆娘兄弟分张', gong:'嫁娶裁衣忌，造不吉'},
    {n:'虚日鼠', y:'日', good:false, verse:'虚星造作主灾殃，男女相逢不吉昌。内退田园多疾病，若行埋葬见损伤。', yi:'', ji:'开门放水嫁娶', zhu:'虚宿主虚耗疾病，诸事退守', books:'协纪主虚耗空亡诸事不宜唯祭祀除外；鳌头主悲哭财产消磨', gong:'唯祭祀吉，余俱凶'},
    {n:'危月燕', y:'月', good:false, verse:'危星造作亦不吉，灾殃百端主哭泣。埋葬若还逢此日，周年便见死人危。', yi:'出行纳财祭祀', ji:'起造埋葬开门放水', zhu:'危宿主倾覆险厄，忌高危动土', books:'克择高险主登高跌扑；鳌头灾难多刑戮血光', gong:'忌登高动土行船，葬不吉'},
    {n:'室火猪', y:'火', good:true, verse:'室星造作大吉昌，富贵荣华世代长。进财进宝生贵子，文武官员高职登。', yi:'婚礼移徙建造祭祀掘井', ji:'丧仪', zhu:'室宿天营大吉，建造入宅上吉', books:'协纪军粮之府大吉宜修造开张嫁娶入宅；鳌头进田牛儿孙公侯', gong:'造嫁入宅开张俱大吉'},
    {n:'壁水貐', y:'水', good:true, verse:'壁星造作主增财，富贵荣华福自来。嫁娶开张皆可用，世代儿孙进秀才。', yi:'婚礼建造埋葬', ji:'往南方', zhu:'壁宿文章之府，主子孙聪明', books:'克择图书之府文章显达；鳌头主荣华埋葬子孙高官', gong:'修造竖柱上梁开学大吉，嫁葬吉'},
    {n:'奎木狼', y:'木', good:false, verse:'奎星造作主歪斜，家财破散主灾刑。买卖开张多不利，若行葬埋见伤亡。', yi:'出行裁衣修屋', ji:'开张开业安葬', zhu:'奎宿主破败官非，忌开张', books:'协纪主文章然值日多不宁造作招非；鳌头见灾凶家产化空', gong:'造葬不利，闭门读书创作稍可'},
    {n:'娄金狗', y:'金', good:true, verse:'娄星造作主富贵，财源广进福禄随。嫁娶开张多吉利，儿孙代代有名声。', yi:'婚礼修屋造庭开张动土', ji:'', zhu:'娄宿聚财之宿，家业兴旺', books:'克择聚众之府主衣食足人口兴旺最宜嫁娶开张；鳌头主荣华', gong:'嫁娶开张大吉，葬吉'},
    {n:'胃土雉', y:'土', good:true, verse:'胃星造作大吉昌，富贵荣华满资量。开门放水多生财，夫妻和顺永安康。', yi:'嫁娶下葬公事开张', ji:'私事', zhu:'胃宿天仓主储蓄，财谷丰登', books:'协纪天仓主蓄积宜入仓开市修造；鳌头进田庄金银满库', gong:'开市入仓嫁娶造葬俱吉'},
    {n:'昴日鸡', y:'日', good:false, verse:'昴星造作主灾殃，伤折人丁见血光。埋葬不可逢此日，长房先死后儿孙。', yi:'', ji:'结婚嫁娶开门放水', zhu:'昴宿杀气重，婚姻大忌', books:'克择西秦之气刚烈多伤；鳌头主灾殃官司口舌', gong:'造嫁葬诉讼皆忌'},
    {n:'毕月乌', y:'月', good:true, verse:'毕星造作主光前，买卖开张福自全。婚姻嫁娶生贵子，世代儿孙掌大权。', yi:'造屋葬仪嫁娶造桥掘井', ji:'', zhu:'毕宿天网主安宁，得贵人助', books:'协纪主边兵又主雨修造安葬吉嫁娶亦可用；鳌头主荣华福禄双全', gong:'造葬嫁娶俱吉'},
    {n:'觜火猴', y:'火', good:false, verse:'觜星造作主徒刑，三年之内见伤亡。埋葬若逢此日用，人丁散败财产倾。', yi:'', ji:'建造下葬入宅开张', zhu:'觜宿主刑讼，百事凶', books:'克择狭小主盗贼惊恐诸事勿用；鳌头主大凶三年孤穷', gong:'诸事忌，签约转账尤忌'},
    {n:'参水猿', y:'水', good:true, verse:'参星造作旺人家，文星高照福无涯。唯有婚姻须谨慎，埋葬修造大吉昌。', yi:'旅行立门建造起盖', ji:'婚礼埋葬', zhu:'参宿威猛带孤克，造作吉而婚姻谨慎', books:'协纪天狱然于造作嫁娶属大吉；鳌头进田财文武鼎台', gong:'造嫁开张俱吉，婚娶稍慎'},
    {n:'井木犴', y:'木', good:true, verse:'井星造作大吉昌，买卖开张福禄长。嫁娶生下端正子，埋葬安坟子孙强。', yi:'祭祀播种建造修墙', ji:'裁衣远行', zhu:'井宿主泉源清洁，万事顺遂', books:'克择泉源主清洁最宜修造动土安葬不宜嫁娶；鳌头主荣华', gong:'造葬大吉，嫁娶不宜'},
    {n:'鬼金羊', y:'金', good:false, verse:'鬼星造作主灾殃，丁人损失见血光。埋葬引鬼入家门，儿孙代代守空房。', yi:'下葬祭祀求神', ji:'建造嫁娶探病', zhu:'鬼宿主祠祭，利于祭祀而忌嫁葬', books:'协纪祭祀之星不宜造作嫁娶但宜埋葬；鳌头唯有葬埋逢此日儿孙高官', gong:'唯安葬祭祖大吉，造嫁严禁'},
    {n:'柳土獐', y:'土', good:false, verse:'柳星造作主遭官，口舌是非不得安。葬埋逢此遭恶死，出入行船见伤残。', yi:'', ji:'开门放水葬仪出行', zhu:'柳宿主口舌官非，忌水路', books:'克择天厨多主哭泣造作退财嫁娶则散；鳌头长房死主见灾', gong:'造嫁俱凶，招工忌'},
    {n:'星日马', y:'日', good:false, verse:'星星造作主灾殃，兄弟不和见血光。埋葬若逢此日用，儿孙代代守空房。', yi:'婚礼播种', ji:'丧仪', zhu:'星宿主急躁火气，骨肉不睦', books:'协纪值日多变故造作不宜嫁娶防争端；鳌头大凶殃刑戮血光', gong:'造嫁葬俱忌'},
    {n:'张月鹿', y:'月', good:true, verse:'张星造作大吉昌，财源茂盛福禄长。嫁娶开张皆可用，世代儿孙进田庄。', yi:'婚礼开市祭祀埋葬', ji:'', zhu:'张宿主宴饮开张，宾客盈门', books:'克择天府主进财宜开张修造嫁娶求官；鳌头进田牛儿孙公侯', gong:'开张高端活动嫁娶俱大吉，造吉'},
    {n:'翼火蛇', y:'火', good:false, verse:'翼星造作主灾凶，费尽田园仓库空。埋葬不可用此日，家财破散见丁忧。', yi:'出行出国迁移', ji:'下葬嫁娶建造', zhu:'翼宿主变动，诗诀作凶，出行略可', books:'协纪主乐然值日多不宁造作易惹是非；鳌头主灾凶田园仓库空', gong:'嫁娶造葬不宜，纯娱乐稍可'},
    {n:'轸水蚓', y:'水', good:true, verse:'轸星造作主增财，富贵荣华福自来。嫁娶开张皆可用，儿孙代代名誉高。', yi:'买田园入学建造婚礼裁衣', ji:'向北方旅行', zhu:'轸宿主车兵远行，财源滚滚', books:'克择天车主急速发福最宜修造开张出行嫁娶；鳌头福重重走马登科', gong:'急速催发诸事大吉'}
  ];
  function dayXiu(dayGZ){
    const idx = JIAZI60.indexOf(dayGZ);
    if(idx<0) return null;
    const x = XX[((idx % 28) + 28) % 28];
    return { name:x.n, yao:x.y, good:x.good, verse:x.verse||'', yi:x.yi||'', ji:x.ji||'', zhu:x.zhu||'', books:x.books||'', gong:x.gong||'', text: x.n + '（' + x.y + '曜，' + (x.good?'吉':'凶') + '）' };
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
  /* 【定源】流派分层倍率（本站归纳量值）：各派对判据体系各有侧重，倍率只调所在层的
     加减幅度、不改名录与起例：
       建除派　重建除十二值本体与附神，丛辰黄道从轻（建除 2.0、丛辰 0.6）；
       丛辰派　重月令丛辰与黄黑道，建除从轻（丛辰 1.6、建除 0.5）；
       神煞派　重日柱神煞与太岁方位（神煞 1.6、方位煞 1.4、丛辰 0.8）；
       董公通书派　重日课格局与黄道附神（格局 1.6、丛辰 1.1、建除 1.2）；
       杨公造命派　重相主、纳音、补龙扶山（生扶命主 1.5、纳音 1.5、坐山 1.5、丛辰 0.7）；
       玄空紫白派　重九宫飞星（紫白层已按派单算），余从通用（各层 1.0）。 */
  const SCHOOL_LAYER_MUL = {
    '建除派':    {jian:2.0, cong:0.6, sha:1.0, geju:1.0, zhu:1.0, fang:1.0},
    '丛辰派':    {jian:0.5, cong:1.6, sha:1.0, geju:1.0, zhu:1.0, fang:1.0},
    '神煞派':    {jian:1.0, cong:0.8, sha:1.6, geju:1.0, zhu:1.0, fang:1.4},
    '董公通书派': {jian:1.2, cong:1.1, sha:1.0, geju:1.6, zhu:1.0, fang:1.0},
    '杨公造命派': {jian:1.0, cong:0.7, sha:1.0, geju:1.0, zhu:1.5, fang:1.0},
    '玄空紫白派': {jian:1.0, cong:1.0, sha:1.0, geju:1.0, zhu:1.0, fang:1.0}
  };
  function jingzeScore(r, ev, opts){
    opts = opts||{};
    const famKey = FAMILY_OF[ev]||'tongyong';
    const fam = FAMILY[famKey];
    const ztKind = ZT_OF[ev]||null;
    let s = (typeof r.score==='number' && isFinite(r.score)) ? r.score : 0;
    const reasons = [];
  let zhiNote = '';
    const dayGan = r.dayGan, dayZhi = r.dayZhi;
    const monthGZ = r.lunar.getMonthInGanZhi();
    const monthGan = monthGZ[0], monthZhi = monthGZ[1];
    const yearGZ = r.lunar.getYearInGanZhiByLiChun();
    const yearGan = yearGZ[0], yearZhi = yearGZ[1];
    const timeZhi = opts.timeZhi!=null ? opts.timeZhi : null;
    const timeGan = (timeZhi!=null) ? wuShuDun(dayGan, ZHI_HOUR.indexOf(timeZhi))[0] : null;
    const timeGZ = (timeZhi!=null) ? wuShuDun(dayGan, ZHI_HOUR.indexOf(timeZhi)) : null;
    const sm = SCHOOL_LAYER_MUL[opts.school] || SCHOOL_LAYER_MUL['玄空紫白派'];

    // ① 日课生扶命主（造命择日：以日课四柱五行生扶命主日主与喜用神为吉，克泄耗为凶；杨公造命派加重）
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
        net = Math.round(net*sm.zhu);
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

    // ② 真太岁方位（方位煞仅造葬动土族重扣，其他轻扣；神煞派加重）
    if(opts.TS_RES){
      const ts = opts.TS_RES;
      if(dayZhi===CHONG[ts.zhi]){ const w = Math.round((fam.fangSha?-15:-12)*sm.fang); s+=w; reasons.push('岁破日'+w); }
      else if(ts.ss.indexOf(dayZhi)>=0){ const w = Math.round((fam.fangSha?-12:-4)*sm.fang); s+=w; reasons.push('三煞日'+w); }
      else if(dayZhi===ts.zhi){ const w = Math.round((fam.fangSha?-6:-3)*sm.fang); s+=w; reasons.push('伏吟太岁'+w); }
    }

    // ③ 日课神煞（八字神煞，复用 pillarSha，与择日丛辰严格隔离；神煞派加重）
    const sha = dayShensha(dayGan, dayZhi, monthGan, monthZhi, yearGan, yearZhi, timeGan, timeZhi);
    sha.ji.forEach(n=>{ const w=Math.round((SHA_W[n]||3)*sm.sha); s += w; reasons.push('+'+w+' '+n); });
    const mul = XIONG_MUL[FAMILY_OF[ev]||'tongyong']||{};
    sha.xiong.forEach(n=>{
      let w = Math.round((SHA_W[n]||5)*sm.sha); const m = mul[n]; if(m) w = Math.round(w*m);
      s -= w; reasons.push('-'+w+' '+n);
    });

    // ③-b 择日专属丛辰（协纪辨方书：月令丛辰 + 建除、黄道附神 + 农历日凶神）
    // 与八字神煞为两套独立体系，分别计分、分别展示，不混用。
    // 建除派、丛辰派对建除系条目（建除本体与附神）与丛辰系条目分别取倍率。
    const zr = zeriSha(r);
    const zrJiMul = ZERI_JI_MUL[famKey]||{};
    const isJianName = (n)=> n.indexOf('建除')===0 || ['吉期','兵宝','天巫','福德','时阴','时阳','生气','死神','血支','月建','小时','土府','月破','大耗','收日'].indexOf(n)>=0;
    zr.ji.forEach(n=>{
      let w=ZERI_W[n]||3; const m=zrJiMul[n]; if(m) w=Math.round(w*m);
      w = Math.round(w*(isJianName(n)?sm.jian:sm.cong));
      s += w; reasons.push('+'+w+' '+n);
    });
    const zrMul = ZERI_XIONG_MUL[famKey]||{};
    const JI_SHI_FAM = ['jiahun','jisi','kaishi']; // 重日：利吉事、忌凶事
    zr.xiong.forEach(n=>{
      let delta;
      if(n==='重日'){
        delta = (JI_SHI_FAM.indexOf(famKey)>=0) ? 3 : -3;
        const m = zrMul['重日']; if(m) delta = Math.round(delta*m);
      } else {
        let w = ZERI_W[n]||4; const m = zrMul[n]; if(m) w = Math.round(w*m);
        w = Math.round(w*(isJianName(n)?sm.jian:sm.cong));
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
      /* 金神七煞（角亢奎娄牛鬼星值日）：起造婚姻尤忌，出兵行船居官并凶。 */
      if('角亢奎娄牛鬼星'.indexOf(xiu.name[0])>=0){
        const w=Math.round(4*xiuMul.xiong); s-=w; reasons.push('金神七煞-'+w);
        zhiNote=(zhiNote?zhiNote+'；':'')+'金神七煞（'+xiu.name+'值日，起造婚姻切忌）';
      }
      /* 宿建相合（建除十二值与二十八宿交叉）：诸书口诀文字有异，待定本后接计分。 */
      /* 四季宜忌：春木吉土忌、夏火吉金忌、秋金吉木忌、冬水吉火忌（宿五行从季节）。 */
      const sx={寅:'春',卯:'春',辰:'春',巳:'夏',午:'夏',未:'夏',申:'秋',酉:'秋',戌:'秋',亥:'冬',子:'冬',丑:'冬'}[monthZhi];
      const yi={春:'木',夏:'火',秋:'金',冬:'水'}[sx], ji2={春:'土',夏:'金',秋:'木',冬:'火'}[sx];
      if(xiu.yao===yi){ const w=Math.round(2*xiuMul.ji); s+=w; reasons.push('宿得季+'+w); }
      else if(xiu.yao===ji2){ const w=Math.round(2*xiuMul.xiong); s-=w; reasons.push('宿失季-'+w); }
      /* 宿日生克（演禽法）：宿生节、节生宿以吉论，宿克节、节克宿减等。 */
      const dyWx = GAN_WX[dayGan];
      if(dyWx && WX_KE[dyWx]===xiu.yao){ const w=Math.round(1*xiuMul.ji); s+=w; reasons.push('节生宿+'+w); }
      else if(dyWx && WX_KE[xiu.yao]===dyWx){ const w=Math.round(1*xiuMul.xiong); s-=w; reasons.push('宿克节-'+w); }
      if(xiu.zhu) zhiNote=(zhiNote?zhiNote+'；':'')+'二十八宿详注（'+xiu.name+'，宜：'+(xiu.yi||'无')+'；忌：'+(xiu.ji||'无')+'）';
    }

    /* 日层黄黑道值神（青龙明堂金匮天德玉堂司命为黄道加二，天刑朱雀白虎天牢玄武勾陈为黑道减二）。 */
    try{
      const dts=r.lunar.getDayTianShen?r.lunar.getDayTianShen():null;
      const dtType=r.lunar.getDayTianShenType?r.lunar.getDayTianShenType():null;
      if(dts && dtType==='黄道'){ const w=Math.round(2*sm.zhu); s+=w; reasons.push('黄道值神+'+w);
        zhiNote=(zhiNote?zhiNote+'；':'')+'黄道值神（'+dts+'临日）'; }
      else if(dts && dtType==='黑道'){ const w=Math.round(2*sm.zhu); s-=w; reasons.push('黑道值神-'+w);
        zhiNote=(zhiNote?zhiNote+'；':'')+'黑道值神（'+dts+'临日）'; }
    }catch(e){}

    /* 罗天大进日（农历日取支，催财讨债于大进方位）：开市求财族加四，余族注而不计。 */
    try{
      const ld=r.lunar.getDay(), ltj=LTJ_DAY[ld];
      if(ltj){
        const gj=SHAN_BAGUA[({申:'坤',亥:'乾',子:'坎',卯:'震',未:'坤',辰:'巽',戌:'乾',丑:'艮',巳:'巽',寅:'艮',午:'离',酉:'兑'})[ltj]];
        if(famKey==='kaishi'){ const w=Math.round(4*sm.zhu); s+=w; reasons.push('罗天大进日+'+w); }
        reasons.push('罗天大进日（'+ld+'日'+(gj||'')+'方' +'，催财于'+ltj+'方）');
      }
    }catch(e){}

    /* 乌兔太阳日（截法图排山图，当月逐日飞布）：临艮八为太阳日、临离九为太阴日，
       太阳盖诸煞（除五黄会力士劫煞），昼时用事方显其力。 */
    try{
      const lmWutu=Math.abs(r.lunar.getMonth());
      const daysWutu=[];
      let qianWutu=null;
      let qianToShuo=0;
      for(let back=1;back<=40;back++){
        try{ const lu=r.lunar.getSolar().next(-back).getLunar();
          if(lu.getDayInGanZhi()[1]==="卯"){ qianWutu={gzFull:lu.getDayInGanZhi()}; qianToShuo=back; break; }
        }catch(e){}
      }
      for(let dd=1;dd<=30;dd++){
        try{ const lu=r.lunar.getSolar().next(dd-r.lunar.getDay()).getLunar();
          if(Math.abs(lu.getMonth())!==lmWutu) continue;
          daysWutu[dd-1]=lu.getDayInGanZhi();
        }catch(e){}
      }
        const wt=wutuRi(null, {qian:qianWutu, days:daysWutu, shuoGan:daysWutu[0][0], qianToShuo:qianToShuo});
        if(wt && wt.sun.length){
          const dayIdxWt=r.lunar.getDay()-1;
          if(wt.sun.indexOf(dayIdxWt+1)>=0){
            const day2='卯辰巳午未申'.indexOf(timeZhi||'')>=0;
            const w=day2?Math.round(6*sm.zhu):0;
            if(w){ s+=w; reasons.push('乌兔太阳日+'+w); }
            zhiNote=(zhiNote?zhiNote+'；':'')+'乌兔太阳日（本月初'+(dayIdxWt+1)+'日值太阳，盖诸煞除五黄会力士劫煞）'+(day2?'，昼时用事力显':'，须昼时用事方显');
          }
          else if(wt.moon.indexOf(dayIdxWt+1)>=0){
            zhiNote=(zhiNote?zhiNote+'；':'')+'乌兔太阴日（本月初'+(dayIdxWt+1)+'日值太阴，夜时用事为宜）';
          }
        }
    }catch(e){}

    /* 罗天大退日（农历日诀十二位）：逢之日退最难当，开业搬家安葬修造皆忌。 */
    try{
      const ltr=luoTianDaTuiRi(r.lunar.getDay());
      if(ltr && ltr===dayZhi){
        const w=Math.round(8*sm.zhu); s-=w; reasons.push('罗天大退日-'+w);
        zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大退日（农历'+r.lunar.getDay()+'日逢'+ltr+'日，日退最难当）'; }
    }catch(e){}

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

    // ④ 日课格局（董公通书派加重）
    const gj = rikeGeju(dayGan, dayZhi, timeGan, timeZhi);
    gj.forEach(g=>{ const w=Math.round(g.w*sm.geju); if(g.good){ s+=w; reasons.push(g.name+'+'+w); } else { s-=w; reasons.push(g.name+'-'+w); } });

    // ⑤ 本命年命纳音相主（造葬、嫁娶；杨公造命派加重）
    if(opts.USER_NAYIN_WX && fam.nayin){
      const dNayin = nayinOf(dayGan+dayZhi);
      const dWx = (NAYIN_INFO[dNayin]||{}).wx || '';
      if(dWx){
        if(WX_SHENG[dWx]===opts.USER_NAYIN_WX){ const w=Math.round(6*sm.zhu); s+=w; reasons.push('课生年命+'+w); }
        else if(dWx===opts.USER_NAYIN_WX){ const w=Math.round(4*sm.zhu); s+=w; reasons.push('课比年命+'+w); }
        else if(WX_KE[dWx]===opts.USER_NAYIN_WX){ const w=Math.round(4*sm.zhu); s-=w; reasons.push('课克年命-'+w); }
        else if(WX_KE[opts.USER_NAYIN_WX]===dWx){ const w=Math.round(2*sm.zhu); s+=w; reasons.push('年命克课+'+w); }
      }
    }

    // ⑥ 坐山补龙扶山 + 制化（仅造葬动土族；杨公造命派加重）
    if(opts.shanZhi && fam.fangSha){
      const shan = opts.shanZhi;
      let hitBad=false, badName='', shanW=0;
      if(opts.TS_RES){
        if(opts.TS_RES.ss.indexOf(shan)>=0){ hitBad=true; badName='三煞到山'; shanW=-Math.round(18*sm.zhu); }
        else if(CHONG[opts.TS_RES.zhi]===shan){ hitBad=true; badName='岁破到山'; shanW=-Math.round(18*sm.zhu); }
        else if(opts.TS_RES.zhi===shan){ hitBad=true; badName='坐太岁（太岁到山）'; shanW=-Math.round(18*sm.zhu); }
      }
      let canZhi=false, zhiBy='';
      if(JU_OF[shan] && JU_OF[shan]===JU_OF[monthZhi]){ canZhi=true; zhiBy='月支三合'; }
      if(LIUHE[monthZhi]===shan){ canZhi=true; zhiBy=(zhiBy?'、':'')+'六合'; }
      if((TIANYI[dayGan]||[]).indexOf(shan)>=0){ canZhi=true; zhiBy=(zhiBy?'、':'')+'天乙贵人'; }
      if(hitBad){
        if(canZhi){ const w=Math.round(9*sm.zhu); s=Math.min(100, s+w); zhiNote=''+badName+'（有制：'+zhiBy+'，可化）'; reasons.push(badName+'有制+'+w); }
        else { s+=shanW; zhiNote=''+badName+'（无制，大凶）'; reasons.push(badName+''+shanW); }
      } else { const w=Math.round(4*sm.zhu); s+=w; zhiNote='坐山得地+'+w; reasons.push('坐山得地+'+w); }
      // 纳甲到山（杨公造命：日干纳甲卦与坐山本卦同宫，扶山大吉）
      const nj2 = NAJIA[dayGan];
      if(nj2){
        const sg = najiaGuaOf(shan);
        if(sg && sg===nj2.gua){ const w=Math.round(6*sm.zhu); s+=w; reasons.push('纳甲到山+'+w); zhiNote=(zhiNote?zhiNote+'；':'')+'纳甲归干到山(+'+w+')'; }
      }
      /* 年克山家（洪范山运，葬课可用月日纳音制之）：犯而无制为修造最凶，
         有制减等，不犯不论。安葬动土族方参。 */
      try{
        const yearGZ = yearGan+yearZhi, monthGZ2 = monthGan+monthZhi, dayGZ2 = dayGan+dayZhi;
        let afterDZ=false;
        const jqTbl = r.lunar && r.lunar.getJieQiTable ? r.lunar.getJieQiTable() : null;
        if(jqTbl && jqTbl['冬至']){
          const dz = jqTbl['冬至'], so = r.solar||r.lunar.getSolar();
          if(dz && so) afterDZ = Date.UTC(so.getYear(),so.getMonth()-1,so.getDay()) >= Date.UTC(dz.getYear(),dz.getMonth()-1,dz.getDay());
        }
        const nk = nianKeShan(shan, yearGZ, monthGZ2, dayGZ2, afterDZ);
        if(nk && nk.hit){
          if(nk.controlled){
            const w=Math.round(5*sm.zhu); s-=w; reasons.push('年克山家有制-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'年克山家（'+nk.ctrlBy+'）';
          } else {
            const w=Math.round(16*sm.zhu); s-=w; reasons.push('年克山家无制-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'年克山家（'+nk.yearWx+'克山运'+nk.yunNayin+'，无制大凶）';
          }
        } else if(nk){
          zhiNote=(zhiNote?zhiNote+'；':'')+'山运'+nk.yunNayin+'（'+nk.yunWx+'），年纳音不克';
        }
      }catch(e){}

      /* 阴府太岁（日课四柱天干化气克坐山纳甲化气）：正阴府双干全切忌不用、
         单干须制化；傍阴府双干全仍忌，单干不忌。忌坐山，修方修向不忌。 */
      try{
        const pillars = [yearGan, monthGan, dayGan, timeGan].filter(Boolean);
        const cnt = {};
        pillars.forEach(g=>{ cnt[g]=(cnt[g]||0)+1; });
        let zhengHit=[], bangHit=[];
        Object.keys(cnt).forEach(g=>{
          const p = yinfuParts(g, shan);
          if(!p) return;
          if(p.hitZ) zhengHit.push({g:g, n:cnt[g]});
          else if(p.hitB) bangHit.push({g:g, n:cnt[g]});
        });
        if(zhengHit.length){
          const shuang = zhengHit.filter(o=>o.n>=2);
          const w = shuang.length ? Math.round(18*sm.zhu) : Math.round(9*sm.zhu);
          s -= w;
          const nm = shuang.length ? '正阴府双干' : '正阴府单干';
          reasons.push(nm+'-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+nm+'（'+zhengHit.map(o=>o.g).join('、')+'化气克山）';
        } else if(bangHit.length){
          const shuang = bangHit.filter(o=>o.n>=2);
          if(shuang.length){
            const w=Math.round(7*sm.zhu); s-=w; reasons.push('傍阴府双干-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'傍阴府双干（'+shuang.map(o=>o.g).join('、')+'）';
          }
        }
      }catch(e){}

      /* 坐煞（三合局灾煞同宫两天干）：坐山大忌，较三煞到山稍轻而同类。 */
      try{
        const zx = zuoXiangSha(yearZhi);
        if(zx && zx.zuo.indexOf(shan)>=0){
          const w=Math.round(14*sm.zhu); s-=w; reasons.push('坐煞-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'坐煞（灾煞在'+zx.zai+'）';
        }
      }catch(e){}

      /* 浮天空亡（岁家，太岁天干所纳卦之绝命破军）：占山占向占方皆忌。 */
      try{
        const ft = futianKongwang(yearGan);
        if(ft && ft.shan.indexOf(shan)>=0){
          const w=Math.round(15*sm.zhu); s-=w; reasons.push('浮天空亡-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'浮天空亡（'+ft.poGua+'卦）';
        }
      }catch(e){}

      /* 冲丁煞（分金煞）：日柱与本山分金天比地冲，主人丁损伤。只忌日，不忌时辰。
         本山五个分金所忌之日合集即其六冲支之全部干支，故但以本气地支求冲。
         太阳太阴照临可制：太阳须昼时，太阴须夜时。 */
      try{
        const cd = chongdingSha(shan);
        let fjHit=null;
        if(opts.FENJIN){ const fg=opts.FENJIN[0], fz=opts.FENJIN[1], cz=CHONG[fz];
          if(dayZhi===cz) fjHit=(dayGan===fg)?'天比地冲':((WX_KE[dayGan]===fg)?'天克地冲':null); }
        if(fjHit){
          const w=Math.round((fjHit==='天比地冲'?16:13)*sm.zhu); s-=w;
          reasons.push('冲丁煞（精）-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'冲丁煞（分金'+opts.FENJIN+'，'+dayGZ+fjHit+'，忌'+opts.FENJIN[0]+CHONG[opts.FENJIN[1]]+'日）';
        } else if(cd && cd.chong===dayZhi){
          const ty = _taiyangZhi(r, shan, timeZhi);
          if(ty.on){
            zhiNote=(zhiNote?zhiNote+'；':'')+'冲丁煞（'+shan+'山'+cd.zhi+'气分金，'+dayGZ+'天比地冲），'+ty.name+'照临制之';
          } else {
            const w=Math.round(13*sm.zhu); s-=w; reasons.push('冲丁煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'冲丁煞（'+shan+'山'+cd.zhi+'气，'+dayGZ+'天比地冲，忌'+cd.chong+'日）';
          }
        }
      }catch(e){}

      /* 山方煞（先后天煞）：日犯大忌、时犯小忌，造葬修均忌。 */
      try{
        const sf = shanFangSha(shan);
        if(sf && sf.days.length){
          const dHit = sf.days.indexOf(dayGZ)>=0;
          const tHit = !dHit && timeGZ && sf.days.indexOf(timeGZ)>=0;
          if(dHit || tHit){
            const w=Math.round((dHit?12:4)*sm.zhu); s-=w;
            reasons.push('山方煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'山方煞（'+sf.gua+'卦官鬼爻，忌'+sf.days.join('、')+(dHit?'日':'时')+'）';
          }
        }
      }catch(e){}

      /* 天星地曜煞（星曜煞）：日时柱干支同气克坐山正五行。日犯大忌、时犯小忌。 */
      try{
        const ty2 = tianXingDiYao(shan);
        if(ty2 && ty2.days.length){
          const dHit = ty2.days.indexOf(dayGZ)>=0;
          const tHit = !dHit && timeGZ && ty2.days.indexOf(timeGZ)>=0;
          if(dHit || tHit){
            const w=Math.round((dHit?14:5)*sm.zhu); s-=w;
            reasons.push('天星地曜-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'天星地曜煞（'+ty2.wx+'山，'+(dHit?'日':'时')+'柱'+(dHit?dayGZ:timeGZ)+'干支同气克山）';
          }
        }
      }catch(e){}

      /* 马前炙退（三合死方）：唯子午卯酉四山有之；死地无气须补扶不须克制。 */
      try{
        const ztf = ZHITUI_FANG[yearZhi];
        if(ztf && shan===ztf){
          const ju = [dayZhi, monthZhi, timeZhi].filter(Boolean);
          const SAN_JU = {卯:['亥','未'],酉:['巳','丑'],子:['申','辰'],午:['寅','戌']};
          const bu = SAN_JU[ztf] ? SAN_JU[ztf].every(p=>ju.indexOf(p)>=0) : false;
          const lh = LIUHE && LIUHE[ztf] && ju.indexOf(LIUHE[ztf])>=0;
          const w=Math.round((bu||lh?5:10)*sm.zhu); s-=w;
          reasons.push('马前炙退-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'马前炙退（'+yearZhi+'年死方在'+ztf+(bu||lh?'，得三合六合补扶减等':'，须补扶不须克制')+'）';
        }
      }catch(e){}

      /* 流年五黄到山（年家紫白）：大煞，太阳太阴皆不制。冬至至立春窗内两派任一犯之即忌。 */
      try{
        let inW = false;
        try{
          const pj5 = r.lunar.getPrevJieQi(true);
          const jn = pj5 ? pj5.getName() : '';
          inW = (jn==='冬至'||jn==='小寒'||jn==='大寒');
        }catch(e){}
        const nGZ = GAN[(GAN.indexOf(yearGan)+1)%10]+ZHI_ORDER[(ZHI_ORDER.indexOf(yearZhi)+1)%12];
        const wh = wuHuangDaoShan(shan, yearGZ, nGZ, inW);
        if(wh && wh.hit){
          const w=Math.round(20*sm.zhu); s-=w; reasons.push('五黄到山-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'流年五黄到'+wh.palaces.join('、')+'宫'
            +(wh.palaces.indexOf('中')>=0?'（五黄入中八方皆犯）':'')
            +(wh.inWindow?'（冬至至立春窗内，两派任一犯之即忌）':'（立春派）');
        }
      }catch(e){}

      /* 弓箭煞（坐山专有）：弓箭两支俱全方忌，单支不忌。 */
      try{
        const gj2 = gongjianSha(shan);
        if(gj2){
          const zi = [dayZhi, monthZhi, yearZhi, timeZhi].filter(Boolean);
          const all = gj2.pair.every(p=>zi.indexOf(p)>=0);
          if(all){
            const w=Math.round(12*sm.zhu); s-=w; reasons.push('弓箭煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'弓箭煞（'+gj2.pair.join('、')+'俱全）';
          }
        }
      }catch(e){}

      /* 罗天大进月到山（问四寻风顺数详，乾停三月）：月建泊大进宫到山，催吉。 */
      try{
        const lym=luoTianDaJinYueGong(yearZhi, monthZhi);
        if(lym && (SHAN_BAGUA[lym]||[]).indexOf(shan)>=0){
          const w=Math.round(8*sm.zhu); s+=w; reasons.push('罗天大进月+'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大进月到山（'+yearZhi+'年'+monthZhi+'月大进泊'+lym+'宫）'; }
      }catch(e){}

      /* 事主禄贵到课（相主层）：事主年干之禄、天乙贵人临日课年月日时柱地支，每项加四。 */
      try{
        if(opts.USER_MING_GZ && typeof LU!=='undefined'){
          const mg=opts.USER_MING_GZ[0];
          const cols=[yearGZ, monthGZ2, dayGZ2, timeGZ].filter(Boolean);
          const hits2=[];
          if(LU[mg] && cols.some(c=>c[1]===LU[mg])) hits2.push('禄');
          if(TIANYI[mg] && TIANYI[mg].some(z=>cols.some(c=>c[1]===z))) hits2.push('贵人');
          if(hits2.length){ const w=Math.round(4*hits2.length*sm.zhu); s+=w;
            reasons.push('禄贵到课+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'事主'+hits2.join('、')+'到课（年干'+mg+'临日课柱），相主吉'; }
        }
      }catch(e){}

      /* 罗天大退月（问五寻风逆数推）：月建泊大退宫，诸事不宜。 */
      try{
        const lty=luoTianDaTuiYueGong(yearZhi, monthZhi);
        if(lty && (SHAN_BAGUA[lty]||[]).indexOf(shan)>=0){
          const w=Math.round(10*sm.zhu); s-=w; reasons.push('罗天大退月-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大退月到山（'+yearZhi+'年'+monthZhi+'月大退泊'+lty+'宫）'; }
      }catch(e){}

      /* 罗天大进年宫到山（大退制神，催吉）。 */
      try{
        const lj=luoTianDaJinNian(yearGZ);
        if(lj && (SHAN_BAGUA[lj]||[]).indexOf(shan)>=0){
          const w=Math.round(6*sm.zhu); s+=w; reasons.push('罗天大进+'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大进年宫到山（'+yearGZ+'年大进在'+lj+'宫，发福催吉）'; }
      }catch(e){}

      /* 事主禄马贵人到山（相主层）：事主年干之禄、驿马、贵人临坐山本气支，到山皆吉。 */
      try{
        if(opts.USER_MING_GZ && typeof LU!=='undefined'){
          const mg=opts.USER_MING_GZ[0], sz=SHAN_ZHI[shan];
          const hits=[];
          if(LU[mg]===sz) hits.push('禄');
          if(YIMA[mg]===sz) hits.push('驿马');
          if(TIANYI[mg] && TIANYI[mg].indexOf(sz)>=0) hits.push('贵人');
          if(hits.length){ const w=Math.round(6*hits.length*sm.zhu); s+=w;
            reasons.push('禄马贵人到山+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'事主'+hits.join('、')+'到山（年干'+mg+'），相主吉'; }
        }
      }catch(e){}


      /* 罗天大退（年家方位）：年干取宫，宫内三山皆忌，修方造葬大凶。 */
      try{
        const lf=luoTianDaTuiFang(yearGan);
        if(lf && (SHAN_BAGUA[lf]||[]).indexOf(shan)>=0){
          const w=Math.round(12*sm.zhu); s-=w; reasons.push('罗天大退-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大退（'+yearGan+'年退'+lf+'宫，忌修方造葬）';
        }
      }catch(e){}

      /* 罗天大进月到山（问四寻风顺数详，乾停三月）：月建泊大进宫到山，催吉。 */
      try{
        const lym=luoTianDaJinYueGong(yearZhi, monthZhi);
        if(lym && (SHAN_BAGUA[lym]||[]).indexOf(shan)>=0){
          const w=Math.round(8*sm.zhu); s+=w; reasons.push('罗天大进月+'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大进月到山（'+yearZhi+'年'+monthZhi+'月大进泊'+lym+'宫）'; }
      }catch(e){}

      /* 事主禄贵到课（相主层）：事主年干之禄、天乙贵人临日课年月日时柱地支，每项加四。 */
      try{
        if(opts.USER_MING_GZ && typeof LU!=='undefined'){
          const mg=opts.USER_MING_GZ[0];
          const cols=[yearGZ, monthGZ2, dayGZ2, timeGZ].filter(Boolean);
          const hits2=[];
          if(LU[mg] && cols.some(c=>c[1]===LU[mg])) hits2.push('禄');
          if(TIANYI[mg] && TIANYI[mg].some(z=>cols.some(c=>c[1]===z))) hits2.push('贵人');
          if(hits2.length){ const w=Math.round(4*hits2.length*sm.zhu); s+=w;
            reasons.push('禄贵到课+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'事主'+hits2.join('、')+'到课（年干'+mg+'临日课柱），相主吉'; }
        }
      }catch(e){}

      /* 罗天大退月（问五寻风逆数推）：月建泊大退宫，诸事不宜。 */
      try{
        const lty=luoTianDaTuiYueGong(yearZhi, monthZhi);
        if(lty && (SHAN_BAGUA[lty]||[]).indexOf(shan)>=0){
          const w=Math.round(10*sm.zhu); s-=w; reasons.push('罗天大退月-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大退月到山（'+yearZhi+'年'+monthZhi+'月大退泊'+lty+'宫）'; }
      }catch(e){}

      /* 罗天大进年宫到山（大退制神，催吉）。 */
      try{
        const lj=luoTianDaJinNian(yearGZ);
        if(lj && (SHAN_BAGUA[lj]||[]).indexOf(shan)>=0){
          const w=Math.round(6*sm.zhu); s+=w; reasons.push('罗天大进+'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大进年宫到山（'+yearGZ+'年大进在'+lj+'宫，发福催吉）'; }
      }catch(e){}

      /* 事主禄马贵人到山（相主层）：事主年干之禄、驿马、贵人临坐山本气支，到山皆吉。 */
      try{
        if(opts.USER_MING_GZ && typeof LU!=='undefined'){
          const mg=opts.USER_MING_GZ[0], sz=SHAN_ZHI[shan];
          const hits=[];
          if(LU[mg]===sz) hits.push('禄');
          if(YIMA[mg]===sz) hits.push('驿马');
          if(TIANYI[mg] && TIANYI[mg].indexOf(sz)>=0) hits.push('贵人');
          if(hits.length){ const w=Math.round(6*hits.length*sm.zhu); s+=w;
            reasons.push('禄马贵人到山+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'事主'+hits.join('、')+'到山（年干'+mg+'），相主吉'; }
        }
      }catch(e){}

      /* 罗天大退（年家方位）：年干取宫，宫内三山皆忌，修方造葬大凶。 */
      try{
        const lf=luoTianDaTuiFang(yearGan);
        if(lf && (SHAN_BAGUA[lf]||[]).indexOf(shan)>=0){
          const w=Math.round(12*sm.zhu); s-=w; reasons.push('罗天大退-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'罗天大退（'+yearGan+'年退'+lf+'宫，忌修方造葬）';
        }
      }catch(e){}

      /* 德神到山到向（趋吉）：天德方、月德方、岁德、岁德合。到山加八、到向加五。 */
      try{
        const df = deFang(shan, monthZhi, yearGan);
        if(df.daoShan.length || df.daoXiang.length){
          const w=Math.round((df.daoShan.length*8 + df.daoXiang.length*5)*sm.zhu); s+=w;
          reasons.push('德神到山'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'德神到'+(df.daoShan.length?'山（'+df.daoShan.join('、')+'）':'')
            +(df.daoShan.length&&df.daoXiang.length?'、':'')+(df.daoXiang.length?'向（'+df.daoXiang.join('、')+'）':'')+'，吉';
        }
      }catch(e){}

      /* 分金合仙命（复用风水引擎 fenJin、fenJinZong、zhuMingJx 同名同源判据）：
         安葬以仙命为主，仙命与事主命主两不相干、分输入；分金旺相吉、孤虚空亡龟甲凶，
         仙命纳音生克辅断。大吉加八、吉加五、凶减六、大凶减十，量值本站归纳。 */
      try{
        if(typeof FENGSHUI!=='undefined' && opts.FENJIN){
          const it=(FENGSHUI.fenJin(shan)||[]).filter(x=>x.gz===opts.FENJIN)[0];
          if(it){
            const ben=it.wang==='空'||it.wang==='龟甲'?-12:(it.wang==='孤'||it.wang==='虚')?-6:0;
            if(ben){ s+=ben; reasons.push('分金本体'+ben);
              zhiNote=(zhiNote?zhiNote+'；':'')+'分金本体（'+it.gz+'分金，'+it.wang+'，孤虚空亡龟甲不可用）'; }
            if(opts.XIANMING_GZ && ev==='安葬'){
              const xmNy=(NAYIN_INFO[nayinOf(opts.XIANMING_GZ)||'']||{}).wx||'';
              const zt=FENGSHUI.fenJinZong(it,{nayin:{wx:xmNy}},null,'仙命');
              const w=zt==='大吉'?8:zt==='吉'?5:zt==='大凶'?-10:zt==='凶'?-6:0;
              if(w){ s+=w; reasons.push('分金合仙命'+(w>0?'+':'')+w); }
              zhiNote=(zhiNote?zhiNote+'；':'')+'分金合仙命（'+it.gz+'分金，仙命'+opts.XIANMING_GZ+'，'+zt+'）';
            }
          }
        }
      }catch(e){}

      /* 太岁堆黄：年干五虎遁至太岁之支，其干之山犯之。最忌修宅修坟，新造安葬不忌。 */
      try{
        const dh = taisuiDuiHuang(yearGan, yearZhi);
        if(dh && dh.shan && dh.shan===shan && ev!=='安葬'){
          const w=Math.round(8*sm.zhu); s-=w; reasons.push('太岁堆黄-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'太岁堆黄（'+yearGZ+'年遁得太岁在'+dh.gan+'，'+dh.gan+'山犯之，忌修宅修坟）';
        }
      }catch(e){}

      /* 剑锋煞：干山禄月与四维之月，修坟安葬忌、竖造不忌；太阳照临可解。 */
      try{
        const jf = jianFengSha(shan);
        if(jf && jf===monthZhi && ev!=='竖柱' && ev!=='上梁' && ev!=='安门'){
          const ty3 = _taiyangZhi(r, shan, timeZhi);
          if(ty3.on){
            zhiNote=(zhiNote?zhiNote+'；':'')+'剑锋煞（'+shan+'山在'+jf+'月），'+ty3.name+'照临破解';
          } else {
            const w=Math.round(8*sm.zhu); s-=w; reasons.push('剑锋煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'剑锋煞（'+shan+'山剑锋在'+jf+'月，与重丧同推）';
          }
        }
      }catch(e){}

      /* 消灭煞：以月之盈亏定卦之所纳。最忌开门放水占方，造葬忌日犯。 */
      try{
        const xm2 = XIAOMIE[shan];
        if(xm2 && xm2.indexOf(dayGZ)>=0){
          const w=Math.round(12*sm.zhu); s-=w; reasons.push('消灭煞-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'消灭煞（'+dayGZ+'日犯，日犯消者穷、犯灭者绝）';
        }
      }catch(e){}

      /* 戊己都天与夹都天（岁家土煞）：忌开山立向修方，修坟竖造同忌；葬课可否诸书不一，
         《象吉通书》与通行选择书谓犯之大凶而惟葬不忌，《求真》《辟谬》一系谓阴宅大忌
         不可犯。两说并存，本页取其分际：安葬不忌，修坟修造竖造皆忌；阳宅得制减等。
         制化：日课得亥卯未三合木局或寅卯辰三会木局、年纳音克土、太阳太阴照临、母仓日。
         坐山犯都天者并忌戊日、己日。 */
      try{
        const dt = dujianDutian(yearGan);
        const zang = (ev==='安葬');
        if(dt && !zang){
          const inJia = dt.jia.indexOf(shan)>=0;
          const inFang = dt.fang.indexOf(shan)>=0;
          if(inJia || inFang){
            const zi = [dayZhi, monthZhi, timeZhi].filter(Boolean);
            const muJu = zi.indexOf('亥')>=0 && zi.indexOf('卯')>=0 && zi.indexOf('未')>=0;
            const huiJu = zi.indexOf('寅')>=0 && zi.indexOf('卯')>=0 && zi.indexOf('辰')>=0;
            const muCang = mucangZhi(monthZhi).indexOf(dayZhi)>=0;
            /* 纳音制化：制戊己煞用年家纳音克之为稳，胜于专用甲乙干克。 */
            const yNy = (NAYIN_INFO[nayinOf(yearGZ)||'']||{}).wx || '';
            const naYinZhi = !!yNy && (WX_KE[yNy]==='土');
            /* 太阳到山到向、太阴到山到向为制化之一，须分昼夜取用。 */
            const tyDto = _taiyangZhi(r, shan, timeZhi);
            const zhi = muJu || huiJu || muCang || naYinZhi || tyDto.on;
            const wuJiDay = dayGan==='戊' || dayGan==='己';
            const base = inJia ? 17 : 14;
            const w = Math.round((zhi ? base*0.4 : base)*sm.zhu);
            s -= w;
            reasons.push((inJia?'夹都天':'戊己都天')+(zhi?'有制':'')+'-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+(inJia?'夹都天':'戊己都天')
              +'（'+(inJia?'戊己之间':'戊己所落')+'，'+(zhi?'有制：':'')
              +(zhi?((muJu?'亥卯未木局':'')+(huiJu?(muJu?'、':'')+'寅卯辰木局':'')+(muCang?(muJu||huiJu?'、':'')+'母仓日':'')+((naYinZhi||tyDto.on)&&(muJu||huiJu||muCang)?'、':'')+(naYinZhi?'年纳音克土':'')+((tyDto.on&&naYinZhi)?'、':'')+(tyDto.on?tyDto.name:'')+'制之'):'阴宅大忌不可犯')+'）';
            if(wuJiDay){
              const w2 = Math.round(5*sm.zhu); s -= w2;
              reasons.push('都天犯戊己日-'+w2);
              zhiNote=(zhiNote?zhiNote+'；':'')+dayGan+'日，犯都天者动土忌戊己日';
            }
          }
        }
      }catch(e){}

      /* 千斤杀（六畜栏圈、修造动土所忌）：岁系按其方与日，季系按四立分季占四维。 */
      try{
        const qj = qianjinSha(yearZhi, _season(_mIdx(monthZhi)));
        if(qj){
          const zi = [dayZhi, monthZhi, timeZhi].filter(Boolean);
          const hitY = qj.fangYear && (qj.fangYear===shan || zi.indexOf(qj.fangYear)>=0);
          const hitS = qj.fangSeason && (SHAN_BAGUA[qj.fangSeason]||[]).indexOf(shan)>=0;
          if(hitY || hitS){
            const tx3=touXiuRi(dayGZ); const w=Math.round((tx3?3:6)*sm.zhu); s-=w; reasons.push('千斤杀-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'千斤杀（'+(hitY?'岁系在'+qj.fangYear:'')+(hitY&&hitS?'、':'')+(hitS?'季系在'+qj.fangSeason+'宫':'')+'）';
          }
        }
      }catch(e){}
    }

      /* 来龙三煞（龙神三煞）：日课年支三煞方到入首龙位，永远真煞，无制化。 */
      try{
        const ll = opts.laiLong ? laiLongSha(yearZhi, opts.laiLong) : null;
        if(ll && ll.hit){
          const w=Math.round(18*sm.zhu); s-=w; reasons.push('来龙三煞-'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'来龙三煞（'+yearZhi+'年煞在'+ll.sha.join('、')+'，入首龙'+opts.laiLong+'犯之）';
        }
      }catch(e){}

      /* 补龙正法（杨公造命）：入首龙双山三合取局，课支得本局三字全为补龙得力，
         得局之旺支为小补。仅造葬动土族参，须填入首龙。 */
      try{
        if(opts.laiLong && fam.fangSha){
          const bl = buLong(opts.laiLong, [yearZhi, monthZhi, dayZhi, timeZhi]);
          if(bl && bl.full){
            const w=Math.round(10*sm.zhu); s+=w; reasons.push('补龙得力+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'补龙得力（入首龙'+opts.laiLong+'属'+bl.ju+'局，课得'+bl.zhi.join('')+'三合全）';
          } else if(bl && bl.wang){
            const w=Math.round(4*sm.zhu); s+=w; reasons.push('补龙小补+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'补龙小补（得本局旺支'+bl.zhi[1]+'，三支未全）';
          }
        }
      }catch(e){}

      /* 人元三煞（本命真三煞）：最忌日时柱犯。双真不可解，单真得本命天乙贵人到课可权用。 */
      try{
        const rz = opts.USER_MING_GZ ? renZhenSha(opts.USER_MING_GZ, dayGan+dayZhi, timeGZ) : null;
        if(rz){
          if(rz.isShuang){
            const w=Math.round(18*sm.zhu); s-=w; reasons.push('本命双真三煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'本命双真三煞（'+rz.shuang+'，'+(rz.hitDay?'日':'时')+'柱犯之，不可化解）';
          } else {
            const ty4 = TIANYI && TIANYI[opts.USER_MING_GZ[0]] ? TIANYI[opts.USER_MING_GZ[0]] : [];
            const gz = [dayGan+dayZhi, timeGZ].filter(Boolean);
            const hasTy = ty4.some(z=>gz.some(g2=>g2.indexOf(z)>=0));
            const w=Math.round((hasTy?4:8)*sm.zhu); s-=w;
            reasons.push('本命单真三煞-'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+'本命单真三煞（'+(rz.hitDay?dayGan+dayZhi:timeGZ)
              +'，真煞在'+rz.sha+'）'+(hasTy?'，本命天乙贵人到课权用':'，无贵人化解仍忌');
          }
        }
      }catch(e){}



    /* 大月建（月家第一凶煞）：按年支起宫逆布九宫，每月一位，每宫占三山。
       修造动土忌，修方切忌，安葬可不忌；太阳照临为制（帝星起例未列）。
       try{
         const dyj = daYuejianGong(yearZhi, Math.abs(r.lunar.getMonth()));
         if(dyj){
           const dyShan = SHAN_BAGUA[dyj]||[];
           if(!opts.shanZhi || dyShan.indexOf(opts.shanZhi)>=0){
             const ty5 = opts.shanZhi ? _taiyangZhi(r, opts.shanZhi, timeZhi) : {on:false,name:''};
             if(ty5.on){
               if(opts.shanZhi) zhiNote=(zhiNote?zhiNote+'；':'')+'大月建在'+dyj+'宫，'+ty5.name+'照临制之';
             } else {
               const tx1=touXiuRi(dayGZ); const w=Math.round((tx1?6:12)*sm.zhu); s-=w; reasons.push('大月建-'+w);
               zhiNote=(zhiNote?zhiNote+'；':'')+'大月建（月家第一凶煞，在'+dyj+'宫：'+dyShan.join('')+'，忌修方动土）';
             }
           }
         }
       }catch(e){}

    /* 小儿煞（小月建、飞天大煞，月家凶煞）：按月飞宫，每宫占三山，忌修方动土。 */
    try{
      const lm = r.lunar.getMonth();
      const xe = xiaoerSha(yearGan, Math.abs(lm));
      if(xe && (!opts.shanZhi || xe.shan.indexOf(opts.shanZhi)>=0)){
        const tx2=touXiuRi(dayGZ); const w=Math.round((tx2?5:10)*sm.zhu); s-=w; reasons.push('小儿煞-'+w);
        zhiNote=(zhiNote?zhiNote+'；':'')+'小儿煞在'+xe.gong+'宫（'+xe.shan.join('')+'）';
      }
    }catch(e){}

    /* 巡山罗睺（太岁前一位）：止忌立向，开山修方不忌，以一白水星制之。
       坐山自有本评，此处只论向；页面未取向时以年支单向表提示。 */
    try{
      const xl = xunshanLuohou(yearZhi);
      if(xl) zhiNote=(zhiNote?zhiNote+'；':'')+'巡山罗睺在'+xl+'（只忌立向）';
    }catch(e){}

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

    /* 截路空亡时（歌：甲己申酉最为愁，乙庚午未不须求，丙辛辰巳何劳问，
       丁壬寅卯一场空，戊癸子丑君须记）。法由日干五鼠遁至壬癸二干所临之支，百事不宜。
       锚点：歌诀三源互证；通行六十日时辰表逐时比对本歌吻合，惟该表部分日漏标
       （甲子日壬申作吉、甲寅日壬申作凶，表内自相矛盾），本页从歌诀定式。 */
    try{
      const jl=[];
      for(let h=0;h<12;h++){ const gz=wuShuDun(dayGan,h); if(gz[0]==='壬'||gz[0]==='癸') jl.push(gz[1]); }
      if(timeZhi && jl.indexOf(timeZhi)>=0){
        const w=Math.round(6*sm.zhu); s-=w; reasons.push('截路空亡-'+w);
        shiNote=(shiNote?shiNote+'；':'')+'截路空亡时（'+dayGan+'日'+jl.join('、')+'时，百事不宜）';
      }
    }catch(e){}

    /* 嫁娶小利月（协纪体系：小利月即妨媒氏月，媒人避送亲即可，无媒人不忌，只注不计）：
       鼠马正七、牛羊四十、虎猴三九、兔鸡二八、龙狗五十一、蛇猪六腊。 */
    /* 嫁娶大利月（女命生肖大利月歌：正七迎鸡兔，二八虎与猴，三九蛇共猪，
       四十龙和狗，牛羊五十一，鼠马六十二）；小利月诸书排法不一，未列。 */
    try{
      if(ev==='嫁娶' && opts.USER_MING_GZ){
        const mz=opts.USER_MING_GZ[1];
        const dali={子:['六月','十二月'],午:['六月','十二月'],丑:['五月','十一月'],未:['五月','十一月'],
                    寅:['二月','八月'],申:['二月','八月'],卯:['正月','七月'],酉:['正月','七月'],
                    辰:['四月','十月'],戌:['四月','十月'],巳:['三月','九月'],亥:['三月','九月']}[mz];
        const cm={寅:'正月',卯:'二月',辰:'三月',巳:'四月',午:'五月',未:'六月',申:'七月',酉:'八月',戌:'九月',亥:'十月',子:'十一月',丑:'十二月'}[monthZhi];
        if(dali && dali.indexOf(cm)>=0){
          const w=Math.round(6*sm.zhu); s+=w; reasons.push('大利月+'+w);
          zhiNote=(zhiNote?zhiNote+'；':'')+'女命'+mz+'大利月（'+cm+'），嫁娶首取'; }
      }
    }catch(e){}

    /* 罗天大退时（原书辩例：申巳退蛇乙庚猴丙辛亥丁壬丑戊癸寅巳），与大退日并验。 */
    try{
      const ls2=LTDT_SHI2[dayGan]||LTDT_SHI2[dayZhi];
      if(ls2 && timeZhi===ls2){
        const w=Math.round(5*sm.zhu); s-=w; reasons.push('罗天大退时(例)-'+w);
        shiNote=(shiNote?shiNote+'；':'')+'罗天大退时（'+(LTDT_SHI2[dayGan]?dayGan+'日':dayZhi+'日')+'忌'+ls2+'时）'; }
    }catch(e){}

    /* 罗天大进时：甲己戊癸子、乙庚卯、丙辛午、丁壬酉，催财吉时（与截路空亡相对）。 */
    try{
      const lj2=LTJ_SHI[dayGan];
      if(lj2 && timeZhi===lj2){
        const w=Math.round(4*sm.zhu); s+=w; reasons.push('罗天大进时+'+w);
        shiNote=(shiNote?shiNote+'；':'')+'罗天大进时（'+dayGan+'日'+lj2+'时，催财吉时）';
      }
    }catch(e){}

    /* 乌兔太阳时（天元乌兔经）：起宫甲己坎一、乙庚兑七、丙辛震三、丁壬离九、戊癸中五，
       日干甲己丁壬戊癸为阳顺数、乙庚丙辛为阴逆数，时泊艮八为太阳、坤二为太阴，皆盖诸煞。
       锚点（遁太阳时捷诀十字）：甲己未时停、丁壬乙庚申、丙辛辰时起、戊癸卯时真，
       十干逐一复算与捷诀全合。 */
    try{
      const qy='甲己丁壬戊癸'.indexOf(dayGan)>=0;
      const qg={甲:1,己:1,乙:7,庚:7,丙:3,辛:3,丁:9,壬:9,戊:5,癸:5}[dayGan];
      if(timeZhi && qg){
        const h=ZHI_HOUR.indexOf(timeZhi);
        const p=qy?((qg-1+h)%9+9)%9+1:(((qg-1-h)%9)+9)%9+1;
        const pGong=LUO8[p];
        const shanGong=(function(g){ for(const k in SHAN_BAGUA){ if(k===g) return g; } return null; })(pGong);
        let toNote='';
        if(opts.shanZhi){
          const myG=Object.keys(SHAN_BAGUA).find(k=>SHAN_BAGUA[k].indexOf(opts.shanZhi)>=0);
          const myX=Object.keys(SHAN_BAGUA).find(k=>SHAN_BAGUA[k].indexOf(SHAN_LIST[(SHAN_LIST.indexOf(opts.shanZhi)+12)%24])>=0);
          if(pGong===myG) toNote='，太阳太阴到山（'+pGong+'宫）';
          else if(pGong===myX) toNote='，太阳太阴到向（'+pGong+'宫）';
        }
        if(p===8||p===2){
          const w=Math.round(4*sm.zhu); s+=w;
          reasons.push((p===8?'乌兔太阳时':'乌兔太阴时')+'+'+w);
          shiNote=(shiNote?shiNote+'；':'')+(p===8?'乌兔太阳时（太阳盖诸煞）':'乌兔太阴时（母仪化凶）')+toNote;
        }
      }
    }catch(e){}

    // ⑦-b 时家神煞（仅当选定用事时辰）：五不遇时、时辰黄黑道、贵人登天时
    let shiNote = '';
    /* 罗天大退时：甲己戊癸忌巳、乙庚忌申、丙辛亥、丁壬丑，忌开业搬家等。 */
    try{
      const ls=LTDT_SHI[dayGan];
      if(ls && timeZhi===ls){
        const w=Math.round(6*sm.zhu); s-=w; reasons.push('罗天大退时-'+w);
        shiNote=(shiNote?shiNote+'；':'')+'罗天大退时（'+dayGan+'日忌'+ls+'时）';
      }
    }catch(e){}
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
      /* 联珠三般卦择日（仅玄空紫白派且填元运向方）：日飞星到坐向宫与宅盘山向星
         成三连数为联珠、成一四七二五八三六九为父母三般卦；进宅引向宫、动土引坐宫。 */
      try{
        if(opts.LIANZHU && opts.school==='玄空紫白派' && zb){
          const tGong=(ev==='入宅')?najiaGuaOf(opts.LIANZHU.xiang):najiaGuaOf(shan);
          const gi=ZB_FLIGHT.indexOf(tGong);
          const tStar=((zb.k-1+gi)%9+9)%9+1;
          const lz=lianZhuPan(opts.LIANZHU.yun, shan, opts.LIANZHU.xiang, tStar, tGong);
          if(lz){ const w=Math.round(12*sm.zhu); s+=w; reasons.push(lz.type+'+'+w);
            zhiNote=(zhiNote?zhiNote+'；':'')+lz.type+'成（'+tGong+'宫山向星加日飞星得'+lz.nums+'，'+(ev==='入宅'?'引向动财':'引山动丁')+'）'; }
        }
      }catch(e){}

      /* 年家紫白到山（沈氏玄空年月日时四盘并用之主流用法；单用日盘者不取此层，差异见口径注） */
      try{
        const yK=nianZiBaiRuZhong(yearGZ);
        if(yK && opts.shanZhi){ const pg=najiaGuaOf(opts.shanZhi);
          if(pg){ const gi=ZB_FLIGHT.indexOf(pg);
            const ys=((yK-1+gi)%9+9)%9+1; const yw=ZB_STAR_W[ys]||0;
            s+=yw; reasons.push('年紫白坐山'+ys+(yw>=0?'+':'')+yw); } }
      }catch(e){}
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
      /* 协纪全录互斥归一计分层：官方凶煞表与吉神表逐名对照本页已计 reason，
         同实异名者（白虎天牢勾陈玄武即黑道值神、月建即建除之建、致死即天吏）按已计者归并不再计，
         真未计名目以低权重入分（凶一至二、吉加一），定位拾遗不与自算八十七名并列。 */
      /* 同实异名映射：官方表名 → 本页已计名（命中则归并不再计） */
      const YS_MAP={'白虎':'黑道值神','天牢':'黑道值神','勾陈':'黑道值神','玄武':'黑道值神','月建':'建除','致死':'天吏'};
      if(_xs){ const miss=[]; ['月破','劫煞','灾煞','月煞','天吏','五虚','往亡','四废','天贼','游祸',
        '血支','白虎','月建','小时','土府','天牢','大煞','死神','致死','勾陈','死气','咸池'].forEach(nm=>{
        if(_xs.indexOf(nm)<0) return;
        const alt=YS_MAP[nm];
        if(alt && (reasons.some(rr=>rr.indexOf(alt)>=0) || ZHI_XIONG.some(z=>reasons.some(rr=>rr.indexOf(z)>=0)&&ZHI_XIONG.indexOf(nm)>=0))) return;
        if(reasons.some(rr=>rr.indexOf(nm)>=0)) return;
        miss.push(nm); });
        if(miss.length){
          const LOWX={'血支':1,'小时':1,'土府':1,'大煞':2,'死神':2,'死气':1,'咸池':2,'白虎':0,'天牢':0,'勾陈':0,'玄武':0,'月建':0,'致死':0};
          const df=[]; let dw=0;
          miss.forEach(nm=>{ const w=LOWX[nm]!=null?LOWX[nm]:1; df.push(nm); dw+=w; });
          if(dw>0){ s-=dw; reasons.push('协纪拾遗-'+dw); }
          zhiNote=(zhiNote?zhiNote+'；':'')+'协纪全录拾遗（'+df.join('、')+'，低权重'+(dw?'':'归并')+'）';
        }
      const _js2 = r.lunar.getDayJiShen ? r.lunar.getDayJiShen() : null;
      }
      if(_js2){ const missJ=[]; ['天德','月德','天德合','月德合','天赦','天愿','月恩','四相','时德','三合','六合','五富','天喜','天医','母仓'].forEach(nm=>{
        if(_js2.indexOf(nm)>=0 && !reasons.some(rr=>rr.indexOf(nm)>=0)) missJ.push(nm); });
        if(missJ.length) reasons.push('协纪吉神表另有：'+missJ.join('、')+'（校验提示，未计分）'); }
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
      xiuZhu: xiu ? ((xiu.verse?xiu.verse+'　':'')+(xiu.zhu||'')+(xiu.books?('　书证：'+xiu.books):'')+(xiu.gong?('　功用：'+xiu.gong):'')) : '',
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
    shanYunOf, nianKeParts, nianKeShan,
    yinfuParts, xunshanLuohou, zuoshanLuohou, zuoXiangSha,
    futianKongwang, gongjianSha, xiaoerSha, qianjinSha, dujianDutian, mucangZhi,
    zuoshanLuohou, chongdingSha, taiyangDaoshan, taiyinDaoshan, taiyangZhaofang, SHAN_SANHE,
    shanFangSha, tianXingDiYao, taisuiDuiHuang, jianFengSha, XIAOMIE, ZHITUI_FANG,
    nianZiBaiRuZhong, wuHuangPalace, wuHuangDaoShan, renZhenSha, laiLongSha, REN_ZHEN_SHA,
    daYuejianGong, deFang, buLong, taiyangDaoShanDu, TIANDE_FANG, YUEDE_FANG,
    luoTianDaTuiFang, touXiuRi, TOUXIU_DAYS, luoTianDaJinNian, LTJ_DAY, LTJ_SHI, luoTianDaJinYueGong, xuanKongPan, lianZhuPan, luoTianDaTuiYueGong, luoTianDaTuiRi, LTDT_DAY, wutuRi, WT_LUO,
    dayShensha, rikeGeju, zhouTang, zeriSha, jingzeScore, dayXiu, dayJiuYao
  };
})();
