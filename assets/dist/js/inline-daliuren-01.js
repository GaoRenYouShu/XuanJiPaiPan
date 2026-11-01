
const GAN=Object.keys(GAN_WX), ZHI=Object.keys(ZHI_WX);
// 神煞共用表：咸池、华盖、将星、天赦、天德、月德、月厌、血支同读 assets/app.js 的 XJ_SHENSHA，本页不另存副本
const XJ_SS=window.XJ_SHENSHA;
// 日干寄宫
const JIGONG={甲:'寅',乙:'辰',丙:'巳',丁:'未',戊:'巳',己:'未',庚:'申',辛:'戌',壬:'亥',癸:'丑'};
// 五行生克取全站定本，本页不另存一份
const WX_KE2=XJ_WX_KE, SHENG=XJ_WX_SHENG;
const GANHE2={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};   // 天干五合
// 十二天将
const TIANJIANG=['贵人','螣蛇','朱雀','六合','勾陈','青龙','天空','白虎','太常','玄武','太阴','天后'];
// 月将（太阳过宫）名
const JIANG_NAME={子:'神后',丑:'大吉',寅:'功曹',卯:'太冲',辰:'天罡',巳:'太乙',午:'胜光',未:'小吉',申:'传送',酉:'从魁',戌:'河魁',亥:'登明'};
/* 起贵口诀两系，六壬起课最核心的文献分歧，两说并存：
   甲羊戊庚牛，甲日阳贵未、戊庚日阳贵丑；《御定六壬直指》起例明载（庚戊见牛甲在羊），四库本《六壬大全》提要引子胥范蠡二课亦作甲日丑为阴贵、戊日丑为阳贵。
   甲戊庚牛羊，甲戊庚日阳贵丑、阴贵未；西汉肩水金关汉简与六朝铜式盘所载正法，《五行大义》引《六壬式经》同。 */
const GUI_YANGNIU={
  yang:{甲:'未',戊:'丑',庚:'丑',乙:'申',己:'子',丙:'酉',丁:'亥',壬:'卯',癸:'巳',辛:'寅'},
  yin:{甲:'丑',戊:'未',庚:'未',乙:'子',己:'申',丙:'亥',丁:'酉',壬:'巳',癸:'卯',辛:'午'}
};
const GUI_ZHENGF={
  yang:{甲:'丑',戊:'丑',庚:'丑',乙:'子',己:'子',丙:'亥',丁:'亥',壬:'巳',癸:'巳',辛:'寅'},
  yin:{甲:'未',戊:'未',庚:'未',乙:'申',己:'申',丙:'酉',丁:'酉',壬:'卯',癸:'卯',辛:'午'}
};
const DLR_GUI={'甲羊戊庚牛':GUI_YANGNIU,'甲戊庚牛羊':GUI_ZHENGF};
/* 昼夜分界两说（取值为昼时所辖时辰下标，子=0）：
   卯至申为昼、酉至寅为夜，通行捷法，《御定六壬直指》起例明载正时自卯至申用昼贵、自酉至寅用夜贵。
   寅至酉为昼、戌至丑为夜，寅申分阴阳一说，《六壬大占》辨及。 */
const DLR_DAY={'卯至申为昼':[3,4,5,6,7,8],'寅至酉为昼':[2,3,4,5,6,7,8,9]};
/* 月将过宫两说：中气过宫一月换一将（《御定六壬直指》起例）、节气过宫即过节换将取月建六合为将 */
const DLR_JIANG={'中气过宫':'zhongqi','节气过宫':'jieqi'};
/* 中气与节各辖十二月将（太阳过宫之次），键为节气名，值为该节气后所用月将支 */
const JIANG_QI={雨水:'亥',春分:'戌',谷雨:'酉',小满:'申',夏至:'未',大暑:'午',处暑:'巳',秋分:'辰',霜降:'卯',小雪:'寅',冬至:'丑',大寒:'子'};
const JIANG_JIE={立春:'亥',惊蛰:'戌',清明:'酉',立夏:'申',芒种:'未',小暑:'午',立秋:'巳',白露:'辰',寒露:'卯',立冬:'寅',大雪:'丑',小寒:'子'};
// 干遁：禄（禄神支）、德（天德、干德）、丁（丁神支），用于断课精细层
const DUN_GAN={
  '甲':{lu:'寅',de:'寅',ding:'卯'},'乙':{lu:'卯',de:'申',ding:'巳'},
  '丙':{lu:'巳',de:'巳',ding:'午'},'丁':{lu:'午',de:'亥',ding:'未'},
  '戊':{lu:'巳',de:'巳',ding:'申'},'己':{lu:'午',de:'寅',ding:'酉'},
  '庚':{lu:'申',de:'申',ding:'戌'},'辛':{lu:'酉',de:'巳',ding:'亥'},
  '壬':{lu:'亥',de:'亥',ding:'子'},'癸':{lu:'子',de:'寅',ding:'丑'}
};
// 神煞（按日支、月查）：驿马、天马、天喜、天医、劫煞、灾煞、亡神、破碎
// 驿马：申子辰马寅、寅午戌马申、巳酉丑马亥、亥卯未马巳
const YIMA={'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'};
// 天马：正月起午，顺行六阳辰（午申戌子寅辰循环）
const TIANMA={'寅':'午','卯':'申','辰':'戌','巳':'子','午':'寅','未':'辰','申':'午','酉':'申','戌':'戌','亥':'子','子':'寅','丑':'辰'};
// 天喜：春戌夏丑秋辰冬未（按季节）
const TIANXI={'春':'戌','夏':'丑','秋':'辰','冬':'未'};
// 天医：正月起戌顺行（《协纪辨方》《六壬大全》通行；《六壬类集》作正月起辰，地医均为天医对冲）
const TIANYI={'寅':'戌','卯':'亥','辰':'子','巳':'丑','午':'寅','未':'卯','申':'辰','酉':'巳','戌':'午','亥':'未','子':'申','丑':'酉'};
// 劫煞、灾煞、亡神：按日支三合局
// 申子辰：劫煞巳、灾煞午、亡神亥；寅午戌：劫煞亥、灾煞子、亡神巳
// 巳酉丑：劫煞寅、灾煞卯、亡神申；亥卯未：劫煞申、灾煞酉、亡神寅
const JIESHA={'申':'巳','子':'巳','辰':'巳','寅':'亥','午':'亥','戌':'亥','巳':'寅','酉':'寅','丑':'寅','亥':'申','卯':'申','未':'申'};
const ZAISHA={'申':'午','子':'午','辰':'午','寅':'子','午':'子','戌':'子','巳':'卯','酉':'卯','丑':'卯','亥':'酉','卯':'酉','未':'酉'};
const WANGSHEN={'申':'亥','子':'亥','辰':'亥','寅':'巳','午':'巳','戌':'巳','巳':'申','酉':'申','丑':'申','亥':'寅','卯':'寅','未':'寅'};
// 破碎（金神）：按日支孟仲季取，《六壬大全》"四孟见酉，四仲见巳，四季见丑"（又名红砂）
const POSUI={寅:'酉',申:'酉',巳:'酉',亥:'酉',子:'巳',午:'巳',卯:'巳',酉:'巳',辰:'丑',戌:'丑',丑:'丑',未:'丑'};
// 三合局（日支三合）：主事体凝聚、团队合作
const SANHE_GROUP={'申':'申子辰','子':'申子辰','辰':'申子辰','寅':'寅午戌','午':'寅午戌','戌':'寅午戌','巳':'巳酉丑','酉':'巳酉丑','丑':'巳酉丑','亥':'亥卯未','卯':'亥卯未','未':'亥卯未'};
const SANHE_WX={'申子辰':'水局','寅午戌':'火局','巳酉丑':'金局','亥卯未':'木局'};
const chongZhi=z=>{const p=DIZHI_CHONG.find(p=>p[0]===z||p[1]===z);return p?(p[0]===z?p[1]:p[0]):z;};
// 月建索引：寅月为 0，与择日引擎月令丛辰表同口径，月厌数组按此起点逐月逆行
const monthIdxOf=z=>(ZHI.indexOf(z)-2+12)%12;
// 日德（干煞）：甲己德寅、乙庚德申、丙辛戊癸德巳、丁壬德亥，阳干取禄位，阴干取所合阳干之禄位
const RIDE={甲:'寅',乙:'申',丙:'巳',丁:'亥',戊:'巳',己:'寅',庚:'申',辛:'巳',壬:'亥',癸:'巳'};
// 丧门（岁前二辰）/吊客（岁后二辰）：按年支取
const SANGMEN={寅:'辰',卯:'巳',辰:'午',巳:'未',午:'申',未:'酉',申:'戌',酉:'亥',戌:'子',亥:'丑',子:'寅',丑:'卯'};
const DIAOKE={寅:'子',卯:'丑',辰:'寅',巳:'卯',午:'辰',未:'巳',申:'午',酉:'未',戌:'申',亥:'酉',子:'戌',丑:'亥'};
// 病符（去年太岁）：年支前一位即去年岁支
const BINGFU={寅:'丑',卯:'寅',辰:'卯',巳:'辰',午:'巳',未:'午',申:'未',酉:'申',戌:'酉',亥:'戌',子:'亥',丑:'子'};
// 五行墓库（六壬以五行墓为墓）：木墓未、火土墓戌、金墓丑、水墓辰
const WX_MU={木:'未',火:'戌',土:'戌',金:'丑',水:'辰'};
// 地支六合
const LIUHE=['子丑','寅亥','卯戌','辰酉','巳申','午未'];
const isLiuHe=(a,b)=>a!==b&&LIUHE.some(p=>p===a+b||p===b+a);
/* 三传十神简判：以日干五行为我，比、生、食、财、官、泄六类，课体与毕法共用一处 */
function tenOfZhi(ganWx,z){
  const w=ZHI_WX[z];
  if(w===ganWx) return '比';
  if(SHENG[ganWx]===w) return '生';
  if(SHENG[w]===ganWx) return '食';
  if(WX_KE2[ganWx]===w) return '财';
  if(WX_KE2[w]===ganWx) return '官';
  return '泄';
}
// 毕法赋（凌福之《六壬毕法赋》/《六壬大全》卷十一）：按课盘可判的条目，依原序排列
// 每条 {n:条号, title:条目名, say:释义}，命中即入表
// 判定所需：o（日干支、四课、三传、天将、旬空、旬首、年命等盘面数据）
function bifaVerdicts(o){
  const c=o.chuan; const tj=z=>o.jiangOnTian[z]||'';
  const tianOn=z=>o.tian[ZHI.indexOf(z)];
  const diUnder=z=>ZHI[o.tian.indexOf(z)];              // 天盘支所临地盘支
  const ganWx=GAN_WX[o.dGan], zhiWx=ZHI_WX[o.dZhi];
  const dun=DUN_GAN[o.dGan]||{};
  const luZhi=dun.lu;
  const jg=JIGONG[o.dGan];
  const ganShang=tianOn(jg), zhiShang=tianOn(o.dZhi);   // 干上神、支上神
  const mingShang=o.benMing?tianOn(o.benMing.zhi):'', nianShang=o.xingNian?tianOn(o.xingNian.zhi):'';
  // 三传十神简判：比、生、食、财、官、泄
  const tenOf = z => tenOfZhi(ganWx,z);
  const t1=tenOf(c.chu), t2=tenOf(c.zhong), t3=tenOf(c.mo);
  const wxS=z=>ZHI_WX[z];
  const sanChuan=[c.chu,c.zhong,c.mo];
  const keSides=o.ke.reduce((a,k)=>a.concat([k.u,k.d]),[]);   // 四课上下神共八神
  const yangZhi=z=>'子寅辰午申戌'.includes(z);
  const kongHit=z=>(o.kong||'').includes(z);            // 旬空
  const guiTab=DLR_GUI[o.guiMode]||DLR_GUI['甲羊戊庚牛'];
  const dayGui=guiTab.yang[o.dGan], nightGui=guiTab.yin[o.dGan];   // 昼贵、夜贵
  const fanGui=o.day?nightGui:dayGui;                   // 反贵：昼占取夜贵、夜占取昼贵
  const xunShou=(o.xun||'').charAt(1), xunWei=xunShou?ZHI[(ZHI.indexOf(xunShou)+9)%12]:'';
  const xunDing=xunShou?ZHI[(ZHI.indexOf(xunShou)+3)%12]:'';   // 旬内丁神：旬首支顺数三位
  const dingHit=!!xunDing&&[jg,o.dZhi,ganShang,zhiShang,mingShang,nianShang,c.chu,c.zhong,c.mo].concat(keSides).includes(xunDing);
  const qian=z=>ZHI[(ZHI.indexOf(z)+1)%12], hou=z=>ZHI[(ZHI.indexOf(z)+11)%12];
  const hits=[];
  // 第一 前后引从升迁吉：初末传所临地盘分居日干寄宫前一位、后一位，为引从；引从日支同法
  {
    const chuDi=diUnder(c.chu), moDi=diUnder(c.mo);
    const yinCong=b=>(chuDi===qian(b)&&moDi===hou(b))||(chuDi===hou(b)&&moDi===qian(b));
    if(yinCong(jg)) hits.push({n:'一',title:'前后引从升迁吉',say:'初末传引从日干，主得众人扶持、事有升迁兴旺之象。'});
    if(yinCong(o.dZhi)) hits.push({n:'一',title:'前后引从（引从日支）',say:'初末传引从日支，主宅舍兴旺、宜迁修家宅。'});
  }
  // 第二 首尾相见始终宜：干上神值旬尾、支上神值旬首
  if(xunWei&&ganShang===xunWei&&zhiShang===xunShou)
    hits.push({n:'二',title:'首尾相见始终宜',say:'干上神值旬尾、支上神值旬首，首尾相顾，主谋事有始有终。'});
  // 第三 帘幕贵人高甲第：反贵临干上或本命、行年上神
  if(ganShang===fanGui||mingShang===fanGui||nianShang===fanGui)
    hits.push({n:'三',title:'帘幕贵人高甲第',say:'昼夜反贵临干上或年命，主科第高显，功名得贵人照拂。'});
  // 第四 催官使者赴官期：克日干之鬼乘白虎，临干上或本命、行年上神
  {
    const cuiGuan=z=>!!z&&tenOf(z)==='官'&&tj(z)==='白虎';
    if(cuiGuan(ganShang)||cuiGuan(mingShang)||cuiGuan(nianShang))
      hits.push({n:'四',title:'催官使者赴官期',say:'官鬼乘白虎临干上或年命，主催官赴任，官职之期将至。'});
  }
  // 第五 六阳数足须公用：四课上下神与三传皆阳支
  if(keSides.every(yangZhi)&&sanChuan.every(yangZhi))
    hits.push({n:'五',title:'六阳数足须公用',say:'四课三传皆阳支，阳气纯聚，宜公门公用而不宜私谋。'});
  // 第六 六阴相继尽昏迷：四课上下神与三传皆阴支
  if(!keSides.some(yangZhi)&&!sanChuan.some(yangZhi))
    hits.push({n:'六',title:'六阴相继尽昏迷',say:'四课三传皆阴支，阴气重叠，主昏昧迟疑，私事纠缠难明。'});
  // 第七 旺禄临身徒妄作：日禄临干上且该禄旺于月建，宜守禄勿妄作
  if(ganShang===luZhi&&wxWangOf(ZHI_WX[luZhi],o.monthZhi)==='旺')
    hits.push({n:'七',title:'旺禄临身徒妄作',say:'日之旺禄临于干上，宜安守本禄；舍此而别谋，反多虚妄、得不偿失。'});
  // 第八 权摄不正禄临支：日干禄神加临日支上
  if(zhiShang===luZhi)
    hits.push({n:'八',title:'权摄不正禄临支',say:'日禄加临支上，主所谋权柄不正、受宅事或他人牵制，禄不自主。'});
  // 第十一 众鬼虽彰全不畏：三传皆官鬼，而干上或支上之神克鬼之五行
  if(t1==='官'&&t2==='官'&&t3==='官'&&(WX_KE2[wxS(ganShang)]===wxS(c.chu)||WX_KE2[wxS(zhiShang)]===wxS(c.chu)))
    hits.push({n:'十一',title:'众鬼虽彰全不畏',say:'三传皆鬼而干上或支上之神克鬼，鬼虽众不足畏，宜制之。'});
  // 第十二 虽忧狐假虎威仪：干上神克日干，支上神又克干上神
  if(WX_KE2[wxS(ganShang)]===ganWx&&WX_KE2[wxS(zhiShang)]===wxS(ganShang))
    hits.push({n:'十二',title:'虽忧狐假虎威仪',say:'干上神克日干而支上神克之，如狐假虎威，借他人之力制伏。'});
  // 第十七 进茹空亡宜退步：三传顺连茹而俱落旬空
  if(ZHI[(ZHI.indexOf(c.chu)+1)%12]===c.zhong&&ZHI[(ZHI.indexOf(c.zhong)+1)%12]===c.mo&&sanChuan.every(kongHit))
    hits.push({n:'十七',title:'进茹空亡宜退步',say:'三传顺连而俱落旬空，前进无所得，宜退守待时。'});
  // 第十八 踏脚空亡进用宜：三传逆连茹而俱落旬空
  if(ZHI[(ZHI.indexOf(c.chu)+11)%12]===c.zhong&&ZHI[(ZHI.indexOf(c.zhong)+11)%12]===c.mo&&sanChuan.every(kongHit))
    hits.push({n:'十八',title:'踏脚空亡进用宜',say:'三传逆连而俱落旬空，退步亦空，反宜向前进取。'});
  // 第二十一 交车相合交关利：干上神合日支，支上神合日干寄宫
  if(isLiuHe(ganShang,o.dZhi)&&isLiuHe(zhiShang,jg))
    hits.push({n:'二十一',title:'交车相合交关利',say:'干上合支、支上合干，交车相合，主内外交关顺遂、交易有利。'});
  // 第二十二 上下皆合两心齐：干上神与支上神合（交车）、日干寄宫与日支相合
  if(isLiuHe(ganShang,zhiShang)&&isLiuHe(jg,o.dZhi))
    hits.push({n:'二十二',title:'上下皆合两心齐',say:'干支上下皆合，主双方心意相合、宾主融洽，谋事顺遂。'});
  // 第二十三 彼求我事支传干：初传取支上神，末传归干上神
  if(ganShang!==zhiShang&&c.chu===zhiShang&&c.mo===ganShang)
    hits.push({n:'二十三',title:'彼求我事支传干',say:'初传取支上、末传归干上，彼来求我，事自外而入我。'});
  // 第二十四 我求彼事干传支：初传取干上神，末传归支上神
  if(ganShang!==zhiShang&&c.chu===ganShang&&c.mo===zhiShang)
    hits.push({n:'二十四',title:'我求彼事干传支',say:'初传取干上、末传归支上，我去求彼，事由己而及外。'});
  // 第二十五 金日逢丁凶祸动：金日（庚辛）逢丁神动
  if((o.dGan==='庚'||o.dGan==='辛')&&dingHit)
    hits.push({n:'二十五',title:'金日逢丁凶祸动',say:'庚辛金日而丁神动，主凶祸变动，家有惊扰，宜静守防意外。'});
  // 第二十六 水日逢丁财动之：水日（壬癸）逢丁神动
  if((o.dGan==='壬'||o.dGan==='癸')&&dingHit)
    hits.push({n:'二十六',title:'水日逢丁财动之',say:'壬癸水日而丁神动，主动财、财利有变，求财易动。'});
  // 第二十七 传财化鬼财休觅：三传皆财，而干上神为克日干之鬼
  if(t1==='财'&&t2==='财'&&t3==='财'&&tenOf(ganShang)==='官')
    hits.push({n:'二十七',title:'传财化鬼财休觅',say:'三传皆财而干上乘鬼，财旺生鬼，主求财反招祸，不宜贪取。'});
  // 第二十八 传鬼化财钱险危：初传为鬼、中末传为财
  if(t1==='官'&&(t2==='财'||t3==='财'))
    hits.push({n:'二十八',title:'传鬼化财钱险危',say:'初传为鬼而中末传化财，主险中求财，钱财来路险、易起是非，宜谨慎。'});
  // 第二十九 眷属丰盈居狭宅：三传五行生日干，日支又生三传
  if(sanChuan.every(z=>SHENG[wxS(z)]===ganWx)&&SHENG[zhiWx]===wxS(c.chu))
    hits.push({n:'二十九',title:'眷属丰盈居狭宅',say:'三传生干而支复生传，人旺宅狭，主眷属丰盈而居处迫窄。'});
  // 第三十 屋宅宽广致人衰：三传脱日干，三传又生日支
  if(sanChuan.every(z=>SHENG[ganWx]===wxS(z))&&SHENG[wxS(c.chu)]===zhiWx)
    hits.push({n:'三十',title:'屋宅宽广致人衰',say:'三传盗泄日干而生支，宅广人衰，主屋宽而人丁耗损。'});
  // 第三十一 三传递生人举荐：初生中、中生末、末生日干，或末生中、中生初、初生日干
  const shengChain = (SHENG[wxS(c.chu)]===wxS(c.zhong)&&SHENG[wxS(c.zhong)]===wxS(c.mo)&&SHENG[wxS(c.mo)]===ganWx)
    || (SHENG[wxS(c.mo)]===wxS(c.zhong)&&SHENG[wxS(c.zhong)]===wxS(c.chu)&&SHENG[wxS(c.chu)]===ganWx);
  if(shengChain)
    hits.push({n:'三十一',title:'三传递生人举荐',say:'三传递相生且生及日干，主得人层层举荐、步步有人提携，谋事易成。'});
  // 第三十二 三传互克众人欺：初克中、中克末、末克日干，或末克中、中克初、初克日干
  const keChain = (WX_KE2[wxS(c.chu)]===wxS(c.zhong)&&WX_KE2[wxS(c.zhong)]===wxS(c.mo)&&t3==='官')
    || (WX_KE2[wxS(c.mo)]===wxS(c.zhong)&&WX_KE2[wxS(c.zhong)]===wxS(c.chu)&&t1==='官');
  if(keChain)
    hits.push({n:'三十二',title:'三传互克众人欺',say:'三传递相克且克及日干，主同行相争、众人排挤，凡事多掣肘难成。'});
  // 第三十五 人宅受脱俱招盗：干上神脱日干、支上神脱日支，或干上脱支、支上脱干
  if((SHENG[ganWx]===wxS(ganShang)&&SHENG[zhiWx]===wxS(zhiShang))||(SHENG[zhiWx]===wxS(ganShang)&&SHENG[ganWx]===wxS(zhiShang)))
    hits.push({n:'三十五',title:'人宅受脱俱招盗',say:'干上支上互脱或各脱其本，人宅俱耗，主虚诈盗失。'});
  // 第四十一 富贵干支逢禄马：干上神为日支之驿马，支上神为日干之禄
  if(ganShang===YIMA[o.dZhi]&&zhiShang===luZhi)
    hits.push({n:'四十一',title:'富贵干支逢禄马',say:'干上乘支马、支上乘干禄，禄马交加，主富贵显达。'});
  // 第四十四 课传俱贵转无依：昼夜二贵俱现于四课上下神，且俱入三传
  if(keSides.includes(dayGui)&&keSides.includes(nightGui)&&sanChuan.includes(dayGui)&&sanChuan.includes(nightGui))
    hits.push({n:'四十四',title:'课传俱贵转无依',say:'四课三传俱乘贵人，贵多反无依倚，事多虚声难成。'});
  // 第四十七 贵虽在狱宜临干：贵人临地盘辰戌为入狱，乙辛日寄宫即辰戌，改判贵人临干
  if((o.dGan==='乙'||o.dGan==='辛')?ganShang===o.guiZhi:(diUnder(o.guiZhi)==='辰'||diUnder(o.guiZhi)==='戌'))
    hits.push({n:'四十七',title:'贵虽在狱宜临干',say:'贵人临辰戌为入狱，得临日干仍可取用，余则受困。'});
  // 第四十九 两贵受克难干贵：昼贵、夜贵所临地盘之支皆克贵人五行
  if(WX_KE2[wxS(diUnder(dayGui))]===wxS(dayGui)&&WX_KE2[wxS(diUnder(nightGui))]===wxS(nightGui))
    hits.push({n:'四十九',title:'两贵受克难干贵',say:'昼夜二贵所临之宫皆克贵人，贵不能施力，干贵难成。'});
  // 第五十 二贵皆空虚喜期：昼贵与夜贵俱落旬空
  if(kongHit(dayGui)&&kongHit(nightGui))
    hits.push({n:'五十',title:'二贵皆空虚喜期',say:'昼夜二贵俱落旬空，贵人虚设，所求之事空喜无实。'});
  // 第五十五 所谋多拙逢网罗：干上神之遁干为日干前一位，支上神为日支前一位
  {
    const dunOfZhi=z=>{ const d=(ZHI.indexOf(z)-ZHI.indexOf(xunShou)+12)%12; return d<10?GAN[d]:''; };
    const nextGan=GAN[(GAN.indexOf(o.dGan)+1)%GAN.length];
    if(ganShang&&dunOfZhi(ganShang)===nextGan&&zhiShang===qian(o.dZhi))
      hits.push({n:'五十五',title:'所谋多拙逢网罗',say:'干上遁干为日干前一位、支上为日支前一位，罗网缠身，所谋多拙。'});
  }
  // 第六十一 干乘墓虎无占病：干上神乘日干之墓又值白虎
  if(ganShang===WX_MU[ganWx]&&tj(ganShang)==='白虎')
    hits.push({n:'六十一',title:'干乘墓虎无占病',say:'干上神乘日墓又临白虎，占病尤忌，主病深难愈，宜早加防范。'});
  // 第六十二 支乘墓虎有伏尸：支上神乘日支之墓又值白虎
  if(zhiShang===WX_MU[zhiWx]&&tj(zhiShang)==='白虎')
    hits.push({n:'六十二',title:'支乘墓虎有伏尸',say:'支上神乘墓又临白虎，占宅主有伏尸暗疾、家宅不宁。'});
  // 第六十三 彼此全伤防两损：干上神克日干，支上神又克日支
  if(WX_KE2[wxS(ganShang)]===ganWx&&WX_KE2[wxS(zhiShang)]===zhiWx)
    hits.push({n:'六十三',title:'彼此全伤防两损',say:'干上克干、支上克支，彼此俱伤，防两损之患。'});
  // 第六十四 夫妇芜淫各有私：支上神克日干，干上神又克日支
  if(WX_KE2[wxS(zhiShang)]===ganWx&&WX_KE2[wxS(ganShang)]===zhiWx)
    hits.push({n:'六十四',title:'夫妇芜淫各有私',say:'支上克干、干上克支，夫妇芜淫，各有私心。'});
  // 第七十 鬼临三四讼灾随：三课、四课上神皆为克日干之鬼
  if(tenOf(o.ke[2].u)==='官'&&tenOf(o.ke[3].u)==='官')
    hits.push({n:'七十',title:'鬼临三四讼灾随',say:'三课四课上神皆鬼，鬼临三四，主讼灾随至，门庭不宁。'});
  // 第七十二 丧吊全逢挂缟衣：干上神、支上神恰为丧门与吊客
  {
    const sm=(o.sha||{}).sangmen, dk=(o.sha||{}).diaoke;
    if(sm&&dk&&((ganShang===sm&&zhiShang===dk)||(ganShang===dk&&zhiShang===sm)))
      hits.push({n:'七十二',title:'丧吊全逢挂缟衣',say:'干上支上恰逢丧门吊客，主丧吊之事相连，宜慎。'});
  }
  // 第七十四 空空如也事休追：三传皆落旬空
  if(sanChuan.every(kongHit))
    hits.push({n:'七十四',title:'空空如也事休追',say:'三传俱落旬空，空空无实，主事已虚，不宜再追。'});
  // 第七十七 互生俱生凡事益：干上神与支上神交相生，或各生其所临之干支
  if((SHENG[wxS(ganShang)]===zhiWx&&SHENG[wxS(zhiShang)]===ganWx)
    ||(SHENG[wxS(ganShang)]===ganWx&&SHENG[wxS(zhiShang)]===zhiWx))
    hits.push({n:'七十七',title:'互生俱生凡事益',say:'干上支上互生或各生其本，凡事相益，谋为顺遂。'});
  // 第七十八 互旺皆旺坐谋宜：干上神为日支五行之禄，支上神为日干之禄
  {
    const luOfWx={木:'寅',火:'巳',土:'巳',金:'申',水:'亥'};
    if(ganShang===luOfWx[zhiWx]&&zhiShang===luZhi)
      hits.push({n:'七十八',title:'互旺皆旺坐谋宜',say:'干上为支之禄、支上为干之禄，互旺皆旺，坐谋为宜。'});
  }
  // 第八十二 不行传者考初时：中传、末传俱落旬空
  if(kongHit(c.zhong)&&kongHit(c.mo))
    hits.push({n:'八十二',title:'不行传者考初时',say:'中末二传俱落旬空，传不能行，事止于初。'});
  // 第八十三 万事皆巧合三六合：三传成三合局，而干上或支上为该局六合之支
  {
    const ju=SANHE_GROUP[c.chu];
    const heOfJu={申子辰:'丑',寅午戌:'未',巳酉丑:'辰',亥卯未:'戌'}[ju];
    const full=!!ju&&SANHE_GROUP[c.zhong]===ju&&SANHE_GROUP[c.mo]===ju&&new Set(sanChuan).size===3;
    if(full&&heOfJu&&(ganShang===heOfJu||zhiShang===heOfJu))
      hits.push({n:'八十三',title:'万事皆巧合三六合',say:'三传成三合局，干上或支上又为该局六合之支。'});
  }
  // 第八十五 初遭夹克不由己：初传所临地盘克初传，所乘天将五行又克初传
  {
    const jw=TIANJIANG_WX[tj(c.chu)];
    if(keOf(diUnder(c.chu),c.chu)&&WX_KE2[jw]===wxS(c.chu))
      hits.push({n:'八十五',title:'初遭夹克不由己',say:'初传所临地盘与所乘天将俱克初传，夹克不由己。'});
  }
  // 第八十六 将逢内战所谋危：初传天将五行克初传地支
  {
    const jw=TIANJIANG_WX[tj(c.chu)];
    if(jw&&WX_KE2[jw]===wxS(c.chu))
      hits.push({n:'八十六',title:'将逢内战所谋危',say:'初传天将五行克初传地支，将逢内战，所谋多危。'});
  }
  // 第八十七 人宅坐墓甘招晦：寄宫与日支所临天盘皆其五行之墓
  if(ganShang===WX_MU[ZHI_WX[jg]]&&zhiShang===WX_MU[zhiWx])
    hits.push({n:'八十七',title:'人宅坐墓甘招晦',say:'寄宫与日支上神俱乘五行之墓，人宅坐墓，自招晦滞。'});
  // 第八十八 干支乘墓各昏迷：干上神为日干之墓，支上神为日支之墓
  if(ganShang===WX_MU[ganWx]&&zhiShang===WX_MU[zhiWx])
    hits.push({n:'八十八',title:'干支乘墓各昏迷',say:'干上乘日干之墓、支上乘日支之墓，干支俱昏。'});
  // 第八十九 任信丁马须言动：伏吟而三传或四课见旬丁、天马、驿马
  if(o.jiang&&o.shiZhi&&o.jiang===o.shiZhi){
    const seen=z=>!!z&&(sanChuan.includes(z)||keSides.includes(z));
    if(seen(xunDing)||seen((o.sha||{}).tianma)||seen((o.sha||{}).yima))
      hits.push({n:'八十九',title:'任信丁马须言动',say:'伏吟而三传或四课见旬丁、天马、驿马，主静极思动。'});
  }
  // 第九十 来去俱空岂动移：返吟而三传俱落旬空
  if(o.jiang&&o.shiZhi&&pairChong(o.jiang,o.shiZhi)&&sanChuan.every(kongHit))
    hits.push({n:'九十',title:'来去俱空岂动移',say:'返吟而三传俱落旬空，来去皆空，事不移动。'});
  // 第九十一 虎临干鬼凶速速：干上神为克日干之鬼又乘白虎
  if(tenOf(ganShang)==='官'&&tj(ganShang)==='白虎')
    hits.push({n:'九十一',title:'虎临干鬼凶速速',say:'干上神为鬼又乘白虎，虎临干鬼，主凶速至。'});
  // 第三十七 末助初兮三等：末传五行生初传，再看初传对日干为生克财三等
  if(SHENG[wxS(c.mo)]===wxS(c.chu)){
    const san=tenOf(c.chu);
    hits.push({n:'三十七',title:'末助初兮三等',say:'末传生初传，末助初势，初传为'+({生:'生',财:'财',官:'官',比:'比',食:'食',泄:'泄'}[san]||'—')+'，主后势助前谋。'});
  }
  // 第三十九 太阳照武宜擒贼：玄武所乘之支为月将，且为昼占
  {
    const xuan=ZHI.find(z=>tj(z)==='玄武');
    if(xuan&&xuan===o.jiang&&o.day) hits.push({n:'三十九',title:'太阳照武宜擒贼',say:'玄武所乘正值月将，昼占太阳照武，主盗贼易擒。'});
  }
  // 第五十一 魁度天门关隔定：初传戌而所临地盘为亥
  if(c.chu==='戌'&&diUnder('戌')==='亥') hits.push({n:'五十一',title:'魁度天门关隔定',say:'戌加亥发用，魁度天门，主关隔阻滞、事难通。'});
  // 第五十二 罡塞鬼户任谋为：天盘寅上为辰
  if(tianOn('寅')==='辰') hits.push({n:'五十二',title:'罡塞鬼户任谋为',say:'辰加寅，罡塞鬼户，主谋为可任、暗中得力。'});
  // 第五十六 天网自裹己招非：干上神为日干之墓，且本命支即该墓
  if(ganShang===WX_MU[ganWx]&&o.benMing&&o.benMing.zhi===ganShang)
    hits.push({n:'五十六',title:'天网自裹己招非',say:'干上乘墓又值本命，天网自裹，主自招是非。'});
  // 第六十 太阳射宅屋光辉：支上神为月将
  if(zhiShang===o.jiang) hits.push({n:'六十',title:'太阳射宅屋光辉',say:'月将临支，太阳射宅，主宅舍光辉、家道兴隆。'});
  // 第六十八 制鬼之位乃良医：支上神克日干之鬼
  {
    const gui=[ganShang,zhiShang,c.chu,c.zhong,c.mo].find(z=>tenOf(z)==='官');
    if(gui&&WX_KE2[wxS(zhiShang)]===wxS(gui)) hits.push({n:'六十八',title:'制鬼之位乃良医',say:'支上神克日鬼，制鬼得位，主得良医或制胜之策。'});
  }
  // 第六十九 虎乘遁鬼殃非浅：白虎所乘之支，其旬遁干为克日干之鬼
  {
    let hit=false;
    ZHI.forEach(z=>{
      if(tj(z)!=='白虎'||!xunShou) return;
      const d=(ZHI.indexOf(z)-ZHI.indexOf(xunShou)+12)%12;
      if(d<10&&WX_KE2[GAN_WX[GAN[d]]]===ganWx) hit=true;
    });
    if(hit) hits.push({n:'六十九',title:'虎乘遁鬼殃非浅',say:'白虎所乘之支遁干为鬼，虎乘遁鬼，主殃祸非浅。'});
  }
  // 第七十一 病符克宅全家患：病符临支且克支
  if((o.sha||{}).bingfu===zhiShang&&WX_KE2[wxS(zhiShang)]===zhiWx)
    hits.push({n:'七十一',title:'病符克宅全家患',say:'病符临支又克支，病符克宅，主全家患病。'});
  // 第九十四 喜惧空亡乃妙机：初传天盘空与所临地盘空分轻重
  {
    const tianKong=kongHit(c.chu), diKong=kongHit(diUnder(c.chu));
    if(tianKong||diKong) hits.push({n:'九十四',title:'喜惧空亡乃妙机',say:(tianKong&&diKong?'初传与所临之地俱空，空而又空，事多虚耗。':tianKong?'初传天盘落空，游行空亡，事有虚声。':'初传所临地盘落空，落底空亡，根基不实。')});
  }
  return hits;
}
/* 大六壬五派：按典籍署名，各持一套起课口径，四轴为起贵口诀、昼夜分界、月将过宫、发用取传。
   前两轴与月将轴可在表单单独切换，取传轴随派；五派预设互不相同。 */
const DALIUREN_SCHOOLS={
  '御定六壬直指':{gui:'甲羊戊庚牛',day:'卯至申为昼',jiang:'中气过宫',faYong:'standard'},
  '六壬大全':{gui:'甲羊戊庚牛',day:'寅至酉为昼',jiang:'中气过宫',faYong:'standard'},
  '六壬指南':{gui:'甲戊庚牛羊',day:'卯至申为昼',jiang:'节气过宫',faYong:'standard'},
  '大六壬断案':{gui:'甲戊庚牛羊',day:'寅至酉为昼',jiang:'节气过宫',faYong:'shehai'},
  '毕法赋':{gui:'甲戊庚牛羊',day:'卯至申为昼',jiang:'中气过宫',faYong:'shehai'}
};
// 各派三块（本盘落点由运行时算出）：典籍与传人、本派主张、与他派分歧
const DLR_SCHOOL_DOC={
  '御定六壬直指':{
    src:'清代御定，全称《御定大六壬直指》。卷首起例具载起天盘、定地盘、取四课、取三传、起贵人、定十二天将诸法，其后十二宫各系课经，逐课论断。',
    claim:'本典起例明载四轴：月将总以中气过宫，一月换一将；昼夜自卯至申用昼贵、自酉至寅用夜贵；起贵阳贵庚戊见牛、甲在羊，阴贵甲牛、庚戊羊；贵人临地盘亥子丑寅卯辰顺行、巳午未申酉戌逆行。取传循九宗门次第，先贼克，次比用，次涉害。',
    diff:'与他派之别在昼夜分界与起贵口诀：本派以卯酉为限、取甲羊戊庚牛一系（甲日阳贵未），故卯酉两时前后的占课昼夜归属，及甲、乙、丙、壬四干的贵人落宫，与取寅至酉为昼或取正法甲戊庚牛羊者不同。'
  },
  '六壬大全':{
    src:'明代郭载騋辑，四库全书子部术数类所收六壬完帙，十二卷。卷首总论起例与神将，卷三以下分课体与类占，卷十一载《毕法赋》。',
    claim:'月将总以中气过宫，太阳逢中气始过宫，据时宪书某日某时定之；起贵取甲羊戊庚牛一系，四库提要引《吴越春秋》子胥、范蠡二课，甲日丑为阴贵、戊日丑为阳贵。昼夜以寅申分阴阳，寅至酉为昼、戌至丑为夜，取古法日出入之定式。取传循九宗门次第，课体与神将类占并重。',
    diff:'与《御定六壬直指》同取甲羊戊庚牛、中气过宫，只昼夜分界不同：本派以寅申分阴阳，昼占时段较卯酉为限者多寅、酉两时，故这两时的占课天将排列整体错开。'
  },
  '六壬指南':{
    src:'明代陈公献撰，清顺治程起鸾、庄公远校刊。卷首为占验序与分门会纂，正文收《大六壬心印赋》《大六壬九天玄女指掌赋》二赋注解，卷末附《大六壬神煞指南》。',
    claim:'本典为赋注与占验专书，未特立起课口径，取通行：起贵取正法甲戊庚牛羊，昼夜取卯至申为昼，月将取节气过宫，过节即换月建六合为将。取传循九宗门次第，断法重神将象意与分门类占。',
    diff:'与他派之别在起贵口诀与月将过宫：本派取甲戊庚牛羊，甲日阳贵在丑而非未；月将以节换将，较中气过宫者早约半月，交节后至中气前的半月内两派月将相差一宫，天地盘整体错开。'
  },
  '大六壬断案':{
    src:'宋代邵彦和撰，后学辑录其占验课例二百余则，分天时、宅墓、前程仕进、终身、流年、婚姻、胎产诸门，以实例立断。',
    claim:'本典为课例专书，未特立起课口径，取通行：起贵取正法甲戊庚牛羊，昼夜取寅至酉为昼，月将取节气过宫。取传涉害优先，多克时先较涉害深浅，取涉害深者发用；深浅相同取孟神（见机），无孟取仲神（察微），复等阳日取干上神、阴日取支上神（缀瑕）。断法重类神与年命行年。',
    diff:'与他派之别在昼夜分界与取传：本派以寅申分阴阳，昼占时段较卯至申一系多寅、酉两时；遇多克不先比用，径较涉害，故课体复杂的盘上初传常与九宗门次第者不同。'
  },
  '毕法赋':{
    src:'宋代凌福之撰，六壬课体断语百法，见《六壬大全》卷十一，逐条以课体格局定吉凶。',
    claim:'本典为断语专书，未及起课口径，取通行：起贵取正法甲戊庚牛羊，昼夜取卯至申为昼，月将取中气过宫。取传涉害优先，断法以课体条文为纲，参神将类神。',
    diff:'与《大六壬断案》同取涉害优先，昼夜分界与月将过宫不同：本派取卯至申为昼、中气过宫，故寅酉两时的昼夜归属与交节后半月内的月将，两派各异。'
  }
};
/* 诸说并存：起贵、昼夜、月将三轴各有两说，均注明出处，可在表单单独切换 */
const DLR_SCHOOL_NOTE='诸说并存：起贵口诀有甲羊戊庚牛（《御定六壬直指》起例、四库本《六壬大全》提要古例）与甲戊庚牛羊（汉简与六朝式盘所载正法）两系；昼夜分界有卯至申为昼（通行捷法，《御定六壬直指》起例明载）与寅至酉为昼（寅申分阴阳一说，见《六壬大占》）两说；月将过宫有中气过宫与节气过宫（过节换将，取月建六合为将）两说。昼夜与月将两轴可在上方表单单独切换，起贵口诀随所选流派而定。';
function fillDlSchool(){document.getElementById('dlSchool').innerHTML=Object.keys(DALIUREN_SCHOOLS).map(k=>`<option value="${k}">《${k}》</option>`).join('');}
/* 换流派即套用该典籍预设口径，昼夜与月将两轴仍可单独切换 */
function dlrApplySchoolPreset(){
  const sc=DALIUREN_SCHOOLS[document.getElementById('dlSchool').value];
  if(!sc) return;
  document.getElementById('dlDay').value=sc.day;
  document.getElementById('dlJiang').value=sc.jiang;
}
// ===== 大六壬专业增强：天将吉凶象意、类神取用、三传应期 =====
// 天将五行（六壬十二天将各有五行）：贵人土、螣蛇火、朱雀火、六合木、勾陈土、青龙木、天空土、白虎金、太常土、玄武水、太阴金、天后水
const TIANJIANG_WX={'贵人':'土','螣蛇':'火','朱雀':'火','六合':'木','勾陈':'土','青龙':'木','天空':'土','白虎':'金','太常':'土','玄武':'水','太阴':'金','天后':'水'};
const TIANJIANG_INFO={
 '贵人':['吉','爵禄帮扶，解危济困'],'螣蛇':['凶','怪异惊恐，虚惊怪梦'],'朱雀':['凶','口舌文书，音信争讼'],
 '六合':['吉','婚姻和合，交易成就'],'勾陈':['凶','迟滞田土，争讼勾连'],'青龙':['吉','财喜舟车，恩荫喜庆'],
 '天空':['凶','虚诈不实，奴仆市井'],'白虎':['凶','丧服血光，兵戈威权'],'太常':['吉','酒食衣服，庆贺赏赐'],
 '玄武':['凶','盗贼阴私，失脱走逸'],'太阴':['吉','阴私和合，女人谋事'],'天后':['吉','婚姻喜庆，阴私恩泽']
};
const DRN_LEI={
 '自身人事':{yong:'日干',desc:'占自身、官贵、行人，以日干为类神（干为外为动、为所占之人）。'},
 '家宅求财':{yong:'日支',desc:'占家宅、求财、田土，以日支为类神（支为内为本、为宅与财源）。'},
 '官讼':{yong:'官鬼（克日干者）',desc:'占官讼、功名，以克日干之阳鬼、阴鬼为类神，视其临传与否。'},
 '婚姻':{yong:'男看日干、女看日支',desc:'占婚姻，男看日干、女看日支，参三传青龙、六合之吉凶。'},
 '疾病':{yong:'日干为身、官鬼为病',desc:'占病，以日干为身、官鬼为病根、子孙为药，观生克旺衰。'},
 '失物':{yong:'日支上神、财',desc:'占失物，以日支上神与妻财为类神，玄武主盗失之方。'},
 '出行':{yong:'日干为行、支为向',desc:'占出行，以日干为行人、支为去向，参天马、驿马之动。'},
 '天时':{yong:'天将所属',desc:'占天时，以天将所主（青龙风雨、白虎兵丧、玄武阴雨）与初传为类。'},
 '求财':{yong:'日支上神、财',desc:'占求财、谋利，以日支上神与妻财为类神，参青龙、太常吉神之临。'},
 '合作':{yong:'日干',desc:'占合作、合伙，以日干为己、日支为对方，参六合、青龙之吉凶。'},
 '交易':{yong:'日支',desc:'占交易、买卖，以日支为事、初传为成交，参六合、勾陈之象。'},
 '考试':{yong:'日干为身、官鬼为功名',desc:'占考试、学业，以日干为身、官鬼为功名、父母为文书，看三传生克。'},
 '升迁':{yong:'日干、官鬼',desc:'占升迁、官运，以日干为自身、官鬼为职位，参青龙、白虎、贵人动向。'},
 '行人':{yong:'日干为行、支为归',desc:'占行人、归期，以日干为行人、支为归期，参天马、驿马、三传动静。'},
 '生产':{yong:'日干为母、支为子',desc:'占生产、胎孕，以日干为母、日支为子，参天后、六合、青龙吉凶。'},
 '寻人':{yong:'日干为寻者、日支为被寻',desc:'占寻人、寻失联，以日干为寻者、日支为被寻之人，参玄武、天空方位。'}
};
function tianJiangTable(){
  let rows=TIANJIANG.map(n=>{
    const v=TIANJIANG_INFO[n]||['',''];
    const cls=v[0]==='吉'?'lr-ji':'lr-xiong';
    const w=TIANJIANG_WX[n]||'';
    return '<tr><td>'+n+'</td><td class="'+cls+'">'+v[0]+'</td><td>'+wxSpan(w)+'</td><td>'+v[1]+'</td></tr>';
  }).join('');
  return '<table class="lr-jx-tbl"><thead><tr><th>天将</th><th>吉凶</th><th>五行</th><th>象意</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
// 毕法赋断语表：将命中的毕法赋条目以表格呈现
function bifaTable(o){
  const hits=bifaVerdicts(o);
  if(!hits.length) return '<div class="sub-note">本课暂未命中毕法赋常格，未加断语。</div>';
  const rows=hits.map(h=>`<tr><th>第${h.n}　${h.title}</th><td>${h.say}</td></tr>`).join('');
  return '<table class="lr-bifa-tbl"><tbody>'+rows+'</tbody></table>';
}
/* 类神取用补列神煞：名、所值与所主一句同表，值一律取盘面已算出的支或干支 */
function shaTable(o){
  const s=o.sha;
  if(!s) return '';
  // 值型随值标注：天赦取日干支，天德按月或取干或取支，余皆取支
  const deType=v=>!v?'':(GAN.includes(v)?'干':'支');
  const rows=[
    ['驿马',s.yima?s.yima+'（支）':'','主出行、迁移、动变，临传则事动。'],
    ['天马',s.tianma?s.tianma+'（支）':'','主升迁、远行、急动，吉则速成。'],
    ['天喜',s.tianxi?s.tianxi+'（支）':'','主喜庆、婚姻、添丁，逢吉神尤验。'],
    ['天医',s.tianyi?s.tianyi+'（支）':'','主医药、疗愈，占病宜求此方。'],
    ['劫煞',s.jiesha?s.jiesha+'（支）':'','主劫夺、灾伤，临传防意外损失。'],
    ['灾煞',s.zaisha?s.zaisha+'（支）':'','主灾厄、官非，宜静守避祸。'],
    ['亡神',s.wangshen?s.wangshen+'（支）':'','主亡失、走失、心神不宁。'],
    ['破碎',s.posui?s.posui+'（支）':'','主破耗、残缺，事多不完整。'],
    ['日德',s.ride?s.ride+'（支）':'','主福德、解厄，临传可化凶。'],
    ['丧门',s.sangmen?s.sangmen+'（支）':'','主丧服、忧戚，占家宅宜避。'],
    ['吊客',s.diaoke?s.diaoke+'（支）':'','主吊问、丧事，与丧门同看。'],
    ['病符',s.bingfu?s.bingfu+'（支）':'','主疾病、缠绵，占病忌临身。'],
    ['旬空',(o.kong||'')?o.kong+'（支）':'','主虚耗、不实，临传事多落空。'],
    ['咸池',s.xianchi?s.xianchi+'（支）':'','主异性缘与情欲，吉则潇洒，凶则风流惹祸。'],
    ['华盖',s.huagai?s.huagai+'（支）':'','主聪明孤高、好艺术玄学，性近僧道而多独处。'],
    ['将星',s.jiangxing?s.jiangxing+'（支）':'','主统众任事之才，居中有威，宜掌权柄。'],
    ['天赦',s.tianshe?s.tianshe+'（日干支）':'','主赦过宥罪、逢凶化吉，灾咎可解。'],
    ['天德',s.tiande?s.tiande+'（'+deType(s.tiande)+'）':'','主转危为安、福德庇佑，凶煞可解。'],
    ['月德',s.yuede?s.yuede+'（干）':'','主仁慈化灾、添福解厄，安祥之吉神。'],
    ['月厌',s.yueyan?s.yueyan+'（支）':'','主阴私厌魅、事多阻滞，忌嫁娶远行。'],
    ['血支',s.xuezhi?s.xuezhi+'（支）':'','主血光疮伤、产厄，忌针灸与动土。'],
    ['岁破',s.suipo?s.suipo+'（支）':'','主岁君冲激、破耗动荡，忌兴造移徙。'],
    ['月破',s.yuepo?s.yuepo+'（支）':'','主月建冲散、成事难久，忌营造婚嫁。']
  ];
  return '<table class="lr-bh-tbl"><thead><tr><th>神煞</th><th>所值</th><th>所主</th></tr></thead><tbody>'
    +rows.map(r=>`<tr><th>${r[0]}</th><td>${r[1]||'-'}</td><td>${r[2]}</td></tr>`).join('')
    +'</tbody></table>';
}
function keOf(a,b){ // a克b?
  return xjWxRelCode(ZHI_WX[a],ZHI_WX[b])==='ke';
}
/* 类神落点：按占类取类神，返回所落天盘支、取用来源与对日干生克状态。
   起课模块与白话解读共用此一处，避免两处各算一套。 */
function leiSpot(o){
  const c=o.chuan, jg=JIGONG[o.dGan], tianOn=z=>o.tian[ZHI.indexOf(z)];
  const ganWx=GAN_WX[o.dGan];
  const isGuanGui=z=>WX_KE2[ZHI_WX[z]]===ganWx;
  const guanGuiHit=()=>{
    const ch=[c.chu,c.zhong,c.mo].filter(isGuanGui);
    if(ch.length) return {zhi:ch[0], from:'三传'};
    const ks=o.ke.map(k=>k.u).filter(isGuanGui);
    if(ks.length) return {zhi:ks[0], from:'四课上神'};
    return {zhi:'', from:''};
  };
  const ly=o.lei.yong;
  let zhi='', from='';
  if(ly==='日支'||ly==='日支上神、财'){ zhi=tianOn(o.dZhi); from='日支'+o.dZhi+'的上神'; }
  else if(ly==='天将所属'){ zhi=c.chu; from='初传天将'; }
  else if(ly.indexOf('官鬼')>=0){ const g=guanGuiHit(); zhi=g.zhi; from=g.zhi?(g.from+'所见官鬼'):''; }
  else if(ly==='男看日干、女看日支'){
    if(o.sex==='女'){ zhi=tianOn(o.dZhi); from='日支'+o.dZhi+'的上神'; }
    else { zhi=tianOn(jg); from='日干寄宫'+jg+'的上神'; }
  }
  else { zhi=tianOn(jg); from='日干寄宫'+jg+'的上神'; }
  let state;
  if(!zhi) state='课中未见官鬼，类神不现，宜参三传天将与年命另断';
  else {
    const rel=xjWxRelCode(ganWx,ZHI_WX[zhi]);
    if(rel==='same'||rel==='sheng') state='类神得日干生扶或比和，旺相有气，所占之事易成';
    else if(rel==='ke') state='日干可克类神（我制之），事情尚能掌控';
    else if(rel==='beike') state='类神反克日干，事多受制、费力';
    else state='类神与日干无甚生克，旺衰平平';
  }
  return {zhi,from,state};
}
/* 月将：太阳过宫，一月一将。中气过宫取中气，节气过宫取节（月建六合为将）。
   最近节气由历法库按交节时刻取，不按日切 */
function yueJiang(solar,mode){
  const lunar=solar.getLunar();
  const near=(mode==='jieqi')?lunar.getPrevJie(false):lunar.getPrevQi(false);
  if(!near) return '子';
  const tab=(mode==='jieqi')?JIANG_JIE:JIANG_QI;
  return tab[near.getName()]||'子';
}
let LAST=null;
/* 折叠态属交互态：模块与折叠块的开合由本页记忆，键按页独立，localStorage 主存、sessionStorage 隐私兜底 */
function dlrToggleMod(id){
  const el = document.getElementById(id);
  if(el) el.classList.toggle('collapsed');
  xjSaveModState('dlrModState','#out details[id]','__dlrInitDone');
}
function query(){
 try{
  const dv=document.getElementById('dInput').value; if(!dv)return;
  const tv=document.getElementById('dTime').value;
  if(!tv){ document.getElementById('infoLine').textContent='请填占测时刻，按 14:30 格式。'; return; }
  if(typeof dlCheckDateTime==='function' && !dlCheckDateTime()) return;
  let [y,m,d]=dv.split('-').map(Number);
  let [h,mi]=tv.split(':').map(Number);
  const dstMode=(document.getElementById('dlDst')||{}).value||'off';
  const ziMode=(document.getElementById('dlZi')||{}).value||'late';
  const sunMode=(document.getElementById('dlSun')||{}).value||'off';
  const lng=typeof dlBirthLng==='function'?dlBirthLng():null;
  if(sunMode!=='off'&&lng==null){ document.getElementById('infoLine').textContent='太阳时校正已开，但未定所在地：请选择省市区或填写经度；若所在地无考，把太阳时改为不校正。'; return; }
  const pto=typeof dlTimeOpts==='function'?dlTimeOpts():{overseas:false,baseLng:120,localDst:false};
  const clockTxt=typeof dlFmtClock==='function'?dlFmtClock(y,m,d,h,mi):'';
  let timeNote='';
  if(!pto.overseas && typeof applyDstCorrection==='function'){
    const ds=applyDstCorrection(y,m,d,h,mi,dstMode);
    if(ds.applied){ y=ds.y; m=ds.m; d=ds.d; h=ds.h; mi=ds.mi; timeNote=ds.note||''; }
  } else if(pto.overseas && pto.localDst && typeof shiftClockDay==='function'){
    const ld=shiftClockDay(y,m,d,h,mi,-60);
    timeNote='当地夏令时：钟面 '+pad2(h)+':'+pad2(mi)+' 折为标准时 '+pad2(ld.h)+':'+pad2(ld.mi);
    y=ld.y; m=ld.m; d=ld.d; h=ld.h; mi=ld.mi;
  }
  if(sunMode!=='off'&&lng!=null&&typeof trueSolarTime==='function'){
    const ts=trueSolarTime(y,m,d,h,mi,lng,sunMode,pto.baseLng==null?120:pto.baseLng);
    timeNote=(timeNote?timeNote+'；':'')+(sunMode==='mean'?'平太阳时':'真太阳时')+'：钟面 '+pad2(h)+':'+pad2(mi)+' 校正 '+ts.totalAdj+' 分，得 '+pad2(ts.h)+':'+pad2(ts.mi);
    y=ts.y; m=ts.m; d=ts.d; h=ts.h; mi=ts.mi;
  }
  let solar;
  try{ solar=Solar.fromYmdHms(y,m,d,h,mi,0); }catch(e){ document.getElementById('infoLine').textContent='时刻超出可排范围，请核对年月日与时刻。'; return; }
  const lunar=solar.getLunar();
  const shiIdx=lunar.getTimeZhiIndex();
  const shiZhi=ZHI[shiIdx];
  if(h===23) timeNote=(timeNote?timeNote+'；':'')+(ziMode==='late'?'晚子时：23时后日柱归次日':'早子时：23时仍归当日');
  const dgz=ziMode==='late'?lunar.getDayInGanZhiExact():lunar.getDayInGanZhiExact2();
  const dGan=dgz[0], dZhi=dgz[1];
  const kong=ziMode==='late'?lunar.getDayXunKongExact():lunar.getDayXunKongExact2();
  /* 三传遁干：日干支所在旬的十干支给出支上天干，旬空两支无遁干 */
  const xun=LunarUtil.getXun(dgz);
  const xunStart=LunarUtil.getJiaZiIndex(xun);
  const dunByZhi={};
  for(let i=0;i<10;i++){ const gz=LunarUtil.JIA_ZI[xunStart+i]; dunByZhi[gz[1]]=gz[0]; }
  const dunOf=z=>dunByZhi[z]||'空';
  const yearZhi=lunar.getYearZhiExact();
  const monthZhi=lunar.getMonthZhiExact();
  const skName=document.getElementById('dlSchool').value;
  const sc=DALIUREN_SCHOOLS[skName]||DALIUREN_SCHOOLS['御定六壬直指'];
  const dayKey=document.getElementById('dlDay').value;
  const jiangKey=document.getElementById('dlJiang').value;
  const guiTab=DLR_GUI[sc.gui]||GUI_YANGNIU;
  const jiang=yueJiang(solar,DLR_JIANG[jiangKey]); // 月将支
  const jiangIdx=ZHI.indexOf(jiang), shiZhiIdx=shiIdx;
  document.getElementById('infoLine').textContent=
    `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}　钟面 ${clockTxt}${timeNote?'　'+timeNote:''}　占时 ${shiZhi}时　日干支 ${dgz}　旬首 ${xun}　旬空 ${kong}　月将 ${jiang}（${JIANG_NAME[jiang]}）`;
  // 天盘：月将加时。地盘index i 上的天盘支 = (jiangIdx + (i - shiZhiIdx)) mod 12
  const tian=[]; // tian[i] = 地盘i位上的天盘支
  for(let i=0;i<12;i++){ tian[i]=ZHI[((jiangIdx+(i-shiZhiIdx))%12+12)%12]; }
  // 反查：某地盘支 -> 天盘支
  function tianOn(diZhi){ return tian[ZHI.indexOf(diZhi)]; }
  // 十二天将：昼取阳贵、夜取阴贵，昼夜分界按当前选择（卯至申为昼、寅至酉为昼）
  const day = (DLR_DAY[dayKey]||DLR_DAY['卯至申为昼']).includes(shiIdx);
  const guiZhi = day?guiTab.yang[dGan]:guiTab.yin[dGan];
  // 贵人临地盘之位：天盘贵人支落在地盘哪一宫，即以该宫定顺逆
  const guiDiIdx = tian.indexOf(guiZhi);
  // 顺逆：贵人临地盘 亥子丑寅卯辰 顺行，巳午未申酉戌 逆行
  const shun = [11,0,1,2,3,4].includes(guiDiIdx);
  const jiangOnTian={}; // 天盘支 -> 天将名
  for(let k=0;k<12;k++){
    const zi = shun? ((guiDiIdx+k)%12) : ((guiDiIdx-k)%12+12)%12;
    jiangOnTian[tian[zi]]=TIANJIANG[k];
  }
  // 四课
  const jg=JIGONG[dGan];
  const k1u=tianOn(jg);           // 一课上（日干寄宫的天盘）
  const k2u=tianOn(k1u);          // 二课上
  const k3u=tianOn(dZhi);         // 三课上（日支的天盘）
  const k4u=tianOn(k3u);          // 四课上
  const ke=[
    {u:k1u,d:jg, lbl:'一课（干）'},
    {u:k2u,d:k1u,lbl:'二课'},
    {u:k3u,d:dZhi,lbl:'三课（支）'},
    {u:k4u,d:k3u,lbl:'四课'},
  ];
  // 发三传：按本派发用法
  const dcat=document.getElementById('drnCat')?document.getElementById('drnCat').value:'自身人事';
  const lei=DRN_LEI[dcat]||DRN_LEI['自身人事'];
  const chuan=deriveChuan(ke,dGan,tianOn,sc.faYong,{dZhi,shiZhi,jiang,tianOn});
  // 本命行年：男命寅上起一岁顺行、女命申上起一岁逆行（虚岁）
  let birth=(document.getElementById('dBirth')||{}).value?document.getElementById('dBirth').value.trim():'';
  const sex=(document.getElementById('dSex')||{}).value||'男';
  let benMing=null, xingNian=null;
  if(birth && !/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(birth)){
    document.getElementById('infoLine').textContent+='　本命年请填干支两字，如 庚午，已按不填处理。';
    birth='';
  }
  if(birth && birth.length===2){
    const bi=LunarUtil.getJiaZiIndex(birth);
    if(bi<0){
      document.getElementById('infoLine').textContent+='　本命年须为六十甲子中的干支，如 庚午，已按不填处理。';
      birth='';
    }
    if(birth){
      const ci=LunarUtil.getJiaZiIndex(lunar.getYearInGanZhiExact());
      const ageY=((ci-bi+60)%60)+1; // 虚岁
      // 行年支：男 寅起顺、女 申起逆
      const start=sex==='女'?'申':'寅'; const startIdx=ZHI.indexOf(start);
      const xingZhi=ZHI[(((startIdx + (sex==='女'?-1:1)*(ageY-1))%12)+12)%12];
      benMing={gan:birth[0],zhi:birth[1]};
      xingNian={age:ageY, zhi:xingZhi};
    }
  }
  const o={y,m,d,lunar,dgz,dGan,dZhi,shiZhi,jiang,tian,jiangOnTian,ke,chuan,guiZhi,guiDiIdx,shun,day,dcat,lei,benMing,xingNian,sex,kong,xun,
    dun:{chu:dunOf(chuan.chu),zhong:dunOf(chuan.zhong),mo:dunOf(chuan.mo)},
    school:skName,guiMode:sc.gui,dayKey,jiangKey,faYong:sc.faYong,preset:(dayKey===sc.day&&jiangKey===sc.jiang),
    clockTxt,timeNote,sunMode,ziMode,dstMode,lng,yearZhi,monthZhi};
  o.kewei=keweiOf(o);
  // 神煞：驿马、天马、天喜、天医、劫煞、灾煞、亡神、破碎、三合、六冲、日德、丧门、吊客、病符、咸池、华盖、将星、天赦、天德、月德、月厌、血支、岁破、月破（按日支、月支、年支、日干查）
  const season = ['寅','卯','辰'].includes(monthZhi)?'春':(['巳','午','未'].includes(monthZhi)?'夏':(['申','酉','戌'].includes(monthZhi)?'秋':'冬'));
  const juWx=(SANHE_WX[SANHE_GROUP[dZhi]]||'').replace('局','');   // 日支三合局五行，咸池、华盖、将星按此查
  o.sha={
    yima:YIMA[dZhi]||'',
    tianma:TIANMA[monthZhi]||'',
    tianxi:TIANXI[season]||'',
    tianyi:TIANYI[monthZhi]||'',
    jiesha:JIESHA[dZhi]||'',
    zaisha:ZAISHA[dZhi]||'',
    wangshen:WANGSHEN[dZhi]||'',
    posui:POSUI[dZhi]||'',
    sanhe:SANHE_GROUP[dZhi]||'',
    liuchong:chongZhi(dZhi),
    ride:RIDE[dGan]||'',
    sangmen:SANGMEN[yearZhi]||'',
    diaoke:DIAOKE[yearZhi]||'',
    bingfu:BINGFU[yearZhi]||'',
    xianchi:XJ_SS.XIANCHI[juWx]||'',
    huagai:XJ_SS.HUAGAI[juWx]||'',
    jiangxing:XJ_SS.JIANGXING[juWx]||'',
    tianshe:(dgz===XJ_SS.TIAN_SHE[season])?dgz:'',
    tiande:XJ_SS.TIANDE[monthZhi]||'',
    yuede:XJ_SS.YUEDE_TG[monthZhi]||'',
    yueyan:XJ_SS.YUEYAN[monthIdxOf(monthZhi)]||'',
    xuezhi:XJ_SS.XUEZHI[monthZhi]||'',
    suipo:chongZhi(yearZhi),
    yuepo:chongZhi(monthZhi)
  };
  render(o);
  LAST={dgz,dGan,dZhi,shiZhi,jiang,tian,jiangOnTian,ke,chuan,guiZhi,day,school:document.getElementById('dlSchool').value,o};
 }catch(e){ if(window.console) console.error(e); document.getElementById('out').innerHTML='<p class="notice">起课出错：请核对日期与时辰后重试。</p>'; }
}
function deriveChuan(ke,dGan,tianOn,faYong,ctx){
  // 收集上克下、下克上
  const xiaKe=[], shangKe=[]; // 元素 {u,d}
  const seenKe=new Set();
  ke.forEach(k=>{
    const sig=k.u+k.d;
    if(seenKe.has(sig)) return;           // 四课不全时同课重出，按一课计
    seenKe.add(sig);
    if(keOf(k.d,k.u)) xiaKe.push(k);      // 下克上（贼）
    if(keOf(k.u,k.d)) shangKe.push(k);    // 上克下（克）
  });
  let chu=null, method='';
  const yangGan=['甲','丙','戊','庚','壬'].includes(dGan);
  const ctx2 = ctx||{};
  const dZhi=ctx2.dZhi||'';
  const jg=ctx2.jg||JIGONG[dGan];
  const tOn=ctx2.tianOn||tianOn;
  // 天盘支反查所临地盘：tian[i]=jiang+(i-shi)，故地盘位 i=天盘支-月将+占时
  const diUnderTian = z => (ctx2.jiang&&ctx2.shiZhi)
    ? ZHI[((ZHI.indexOf(z)-ZHI.indexOf(ctx2.jiang)+ZHI.indexOf(ctx2.shiZhi))%12+12)%12] : '';
  // 八专：日干寄宫与日支同宫（甲寅、庚申、丁未、己未、癸丑），四课只有两课
  const baZhuan = jg===dZhi;
  // 伏吟：天地盘同宫（月将与占时同支）；返吟：天地盘对冲（月将与占时相冲）
  const fuYin = ctx2.jiang===ctx2.shiZhi;
  const fanYin = !!(ctx2.jiang && ctx2.shiZhi && pairChong(ctx2.jiang,ctx2.shiZhi));
  function biYong(list){ // 比用：取与日干阴阳相同者；俱比或俱不比让位涉害
    const same=list.filter(k=>(['子','寅','辰','午','申','戌'].includes(k.u))===yangGan);
    return same.length===1?same[0].u:null;
  }
  // 涉害（见机、察微）：多克俱比、俱不比时，取"涉地盘归本家受克最深"者发用。
  // 深浅法：受克者从所临天盘之位顺数至地盘本位，沿途每遇克其五行之地支或藏干即计一重，涉害多者为用；
  // 涉害相同取孟神（寅申巳亥）为见机，无孟取仲神（子午卯酉）为察微，无孟仲则阳日取干上两课、阴日取支上两课（复等）。
  const CANG_GAN={'子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],'辰':['戊','乙','癸'],'巳':['丙','戊','庚'],'午':['丁','己'],'未':['己','丁','乙'],'申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']};
  function sheHai(list, prefix){
    // list 内元素 {u:上神(受克方), d:下神}；prefix 用于伏吟、返吟时的方法名前缀
    const depth = k => {
      const uWx=ZHI_WX[k.u];                     // 受克方五行
      const diIdx=ZHI.indexOf(k.d);               // 上神所临地盘位（起点）
      let n=0;
      for(let i=1;i<12;i++){
        const z=ZHI[(diIdx+i)%12];
        if(WX_KE2[ZHI_WX[z]]===uWx) n++;          // 沿途地支克受克方
        (CANG_GAN[z]||[]).forEach(g=>{ if(WX_KE2[GAN_WX[g]]===uWx) n++; });  // 藏干克受克方
        if(z===k.u) break;                          // 行至本家止
      }
      return n;
    };
    const maxD=Math.max(...list.map(depth));
    const deepest=list.filter(k=>depth(k)===maxD);
    if(deepest.length===1) return {chu:deepest[0].u, method:prefix+'涉害（取深）'};
    // 涉害相同：取孟神（见机）→ 无孟取仲神（察微）→ 复等
    const meng=deepest.filter(k=>['寅','申','巳','亥'].includes(k.u));
    if(meng.length) return {chu:meng[0].u, method:prefix+'涉害（见机）'};
    const zhong=deepest.filter(k=>['子','午','卯','酉'].includes(k.u));
    if(zhong.length) return {chu:zhong[0].u, method:prefix+'涉害（察微）'};
    // 缀瑕：深浅与孟仲皆同，阳日取干上神、阴日取支上神
    const target = yangGan? tOn(jg) : tOn(dZhi);
    const duok = (deepest.find(k=>k.u===target)||deepest[0]).u;
    return {chu:duok, method:prefix+'涉害（缀瑕取'+(yangGan?'干上神':'支上神')+'）'};
  }
  // 多克先比用，俱比或俱不比较涉害；单一克直取重审元首
  function keFa(list, kind){
    if(list.length===1) return {chu:list[0].u, method:(kind==='下贼'?'重审（下贼上）':'元首（上克下）')};
    const bi=biYong(list);
    if(bi) return {chu:bi, method:'比用（'+kind+'取一）'};
    return sheHai(list,'');
  }
  // 遥克：先取上神克日干（蒿矢），无则取日干克上神（弹射）；多克者取与日干阴阳相同者（比用）
  function yaoKe(){
    const keRi=ke.filter(k=>WX_KE2[ZHI_WX[k.u]]===GAN_WX[dGan]);   // 上神克日干（蒿矢）
    const riKe=ke.filter(k=>WX_KE2[GAN_WX[dGan]]===ZHI_WX[k.u]);   // 日干克上神（弹射）
    const bi = arr => { const same=arr.filter(k=>('子寅辰午申戌'.includes(k.u))===yangGan); return (same[0]||arr[0]).u; };
    if(keRi.length){ return {chu:keRi.length>1?bi(keRi):keRi[0].u, method:keRi.length>1?'遥克（蒿矢、上克日干取比）':'遥克（蒿矢、上克日干）'}; }
    if(riKe.length){ return {chu:riKe.length>1?bi(riKe):riKe[0].u, method:riKe.length>1?'遥克（弹射、日干克上取比）':'遥克（弹射、日干克上）'}; }
    return null;
  }
  // 昴星（无克且四课全）：阳日取地盘酉上神（昴星虎视），阴日取天盘酉下神（昴星冬蛇）
  function angXing(){
    if(yangGan) return tOn('酉')||ke[0].u;      // 阳日虎视：酉上神
    return diUnderTian('酉')||ke[0].u;           // 阴日冬蛇：天盘酉之下神
  }
  // 别责（四课不全且无克）：阳日取日干所合之干寄宫上神为初传，阴日取日支三合前一位之支上神为初传；中末皆取干上神。
  function bieZe(){
    const heGan = GANHE2[dGan];                 // 日干所合之干（甲己合、乙庚合、丙辛合、丁壬合、戊癸合）
    if(yangGan) return tOn(JIGONG[heGan])||ke[0].u;   // 阳日：干合干寄宫上神
    const sanHeQian = {'亥':'卯','卯':'未','未':'亥','申':'子','子':'辰','辰':'申','寅':'午','午':'戌','戌':'寅','巳':'酉','酉':'丑','丑':'巳'}; // 日支三合顺一位
    const qianZhi = sanHeQian[dZhi]||dZhi;
    return tOn(qianZhi)||ke[0].u;                     // 阴日：支三合顺一位之支的上神
  }
  // 四课不全（四课中有两课干支全同），为别责之前提；八专日另宗处理
  function sanBei(){
    if(baZhuan) return false;
    const sig=ke.map(k=>k.u+k.d);
    return new Set(sig).size<4;
  }
  // 伏吟无克：阳日自任取干上神、阴日自信取支上神
  function fuYinFa(){
    const ganShang=tOn(jg);
    const zhiShang=tOn(dZhi);
    if(yangGan) return ganShang||zhiShang||ke[0].u;   // 阳日自任
    return zhiShang||ganShang||ke[0].u;               // 阴日自信
  }
  // 返吟无克：井栏射（取日支驿马发用；无克惟己丑、丁丑、辛未、辛丑四日）
  function fanYinFa(){
    return YIMA[dZhi]||ke[0].u;
  }
  // 地支相刑（初刑中、中刑末）；自刑四支：辰午酉亥
  const XING={'子':'卯','卯':'子','寅':'巳','巳':'申','申':'寅','丑':'戌','戌':'未','未':'丑','辰':'辰','午':'午','酉':'酉','亥':'亥'};
  const isZiXing=z=>XING[z]===z;
  // 三传递传（贼克、比用、涉害、遥克通用）：中取初上神、末取中上神
  const diChuan=chu=>({chu, zhong:tianOn(chu), mo:tianOn(tianOn(chu))});
  // 伏吟：初刑为中传、中刑为末传；初传自刑则中取另一上神（见下），中传自刑则末取中冲
  function fuYinChuan(chu){
    let zhong, mo;
    if(isZiXing(chu)){ zhong = yangGan? tOn(dZhi) : tOn(jg); }
    else { zhong = XING[chu]||tianOn(chu); }
    mo = isZiXing(zhong)? chongZhi(zhong) : (XING[zhong]||tianOn(zhong));
    return {chu,zhong,mo};
  }
  if(baZhuan){
    // 八专：有克先取克（比用、涉害），无克取干上神顺逆数三位发用；中末不论阴阳皆取干上神
    if(xiaKe.length){ const r=keFa(xiaKe,'下贼'); chu=r.chu; method='八专：'+r.method; }
    else if(shangKe.length){ const r=keFa(shangKe,'上克'); chu=r.chu; method='八专：'+r.method; }
    else{
      // 无克：阳日自干上神顺数三位，阴日自第四课上神逆数三位；中末皆归干上神
      const ganShang=tOn(jg);
      const startIdx = yangGan? ZHI.indexOf(ganShang) : ZHI.indexOf(ke[3].u);
      const chuIdx = yangGan? (startIdx+2)%12 : ((startIdx-2)%12+12)%12;
      chu = ZHI[chuIdx];
      method=(yangGan?'八专（阳日顺数三位）':'八专（阴日逆数三位）');
    }
    const ganShang=tOn(jg);
    chu=chu||ganShang; const zhong=ganShang, mo=ganShang;
    return {chu,zhong,mo,method};
  }
  if(fuYin){
    // 伏吟：有克取克（比用、涉害），无克阳日自任取干上、阴日自信取支上；三传皆循刑，自刑则取冲
    if(xiaKe.length){ const r=keFa(xiaKe,'下贼'); chu=r.chu; method='伏吟：'+r.method; }
    else if(shangKe.length){ const r=keFa(shangKe,'上克'); chu=r.chu; method='伏吟：'+r.method; }
    else { chu=fuYinFa(); method='伏吟（'+(yangGan?'自任取干上神':'自信取支上神')+'）'; }
    const r=fuYinChuan(chu); return {chu:r.chu,zhong:r.zhong,mo:r.mo,method};
  }
  if(fanYin){
    // 返吟：有克取克（比用、涉害）为无依格，中末递传；无克为井栏射，取日支驿马（支冲）发用，中取支上、末取干上
    if(xiaKe.length){ const r=keFa(xiaKe,'下贼'); chu=r.chu; method='返吟无依：'+r.method; const d=diChuan(chu); return {chu:d.chu,zhong:d.zhong,mo:d.mo,method}; }
    if(shangKe.length){ const r=keFa(shangKe,'上克'); chu=r.chu; method='返吟无依：'+r.method; const d=diChuan(chu); return {chu:d.chu,zhong:d.zhong,mo:d.mo,method}; }
    chu=fanYinFa(); method='返吟井栏射（无克取支驿马发用）';
    return {chu, zhong:tOn(dZhi), mo:tOn(jg), method};
  }
  if(faYong==='shehai'){
    // 涉害优先：一克即定仍作重审与元首，多克不先比用，径较涉害深浅
    if(xiaKe.length===1){ chu=xiaKe[0].u; method='重审（下贼上）'; }
    else if(xiaKe.length>1){ const r=sheHai(xiaKe,''); chu=r.chu; method=r.method; }
    else if(shangKe.length===1){ chu=shangKe[0].u; method='元首（上克下）'; }
    else if(shangKe.length>1){ const r=sheHai(shangKe,''); chu=r.chu; method=r.method; }
    else{
      const yk=yaoKe();
      if(yk){ chu=yk.chu; method=yk.method; }
      else if(sanBei()){ chu=bieZe(); method=(yangGan?'别责（阳日取干合上神）':'别责（阴日取支前三合上神）');
        const ganShang=tOn(jg); return {chu,zhong:ganShang,mo:ganShang,method}; }
      else{ chu=angXing(); method=(yangGan?'昴星虎视（阳日取地盘酉上神）':'昴星冬蛇（阴日取天盘酉下神）');
        return yangGan? {chu, zhong:tOn(dZhi), mo:tOn(jg), method} : {chu, zhong:tOn(jg), mo:tOn(dZhi), method}; }
    }
  } else {
    if(xiaKe.length){ const r=keFa(xiaKe,'下贼'); chu=r.chu; method=r.method; }
    else if(shangKe.length){ const r=keFa(shangKe,'上克'); chu=r.chu; method=r.method; }
    else{
      const yk=yaoKe();
      if(yk){ chu=yk.chu; method=yk.method; }
      else if(sanBei()){ chu=bieZe(); method=(yangGan?'别责（阳日取干合上神）':'别责（阴日取支前三合上神）');
        const ganShang=tOn(jg); return {chu,zhong:ganShang,mo:ganShang,method}; }
      else{ chu=angXing(); method=(yangGan?'昴星虎视（阳日取地盘酉上神）':'昴星冬蛇（阴日取天盘酉下神）');
        return yangGan? {chu, zhong:tOn(dZhi), mo:tOn(jg), method} : {chu, zhong:tOn(jg), mo:tOn(dZhi), method}; }
    }
  }
  const d=diChuan(chu);
  return {chu:d.chu, zhong:d.zhong, mo:d.mo, method};
}
/* 课体六十四格：取传法十格由取传结果归一，格局按盘面判，可多中。
   旺相休囚死按月建所值之季：春木旺、夏火旺、秋金旺、冬水旺，辰戌丑未月土旺。 */
const WX_WANG={
  春:{木:'旺',火:'相',水:'休',金:'囚',土:'死'},
  夏:{火:'旺',土:'相',木:'休',水:'囚',金:'死'},
  秋:{金:'旺',水:'相',土:'休',火:'囚',木:'死'},
  冬:{水:'旺',木:'相',金:'休',土:'囚',火:'死'},
  四季:{土:'旺',金:'相',火:'休',木:'囚',水:'死'}
};
const WX_WANG_SEASON={寅:'春',卯:'春',辰:'四季',巳:'夏',午:'夏',未:'四季',申:'秋',酉:'秋',戌:'四季',亥:'冬',子:'冬',丑:'四季'};
/* 十五格释义，取课经通行说法，每条四十字内 */
const KEWEI_SAY={
  元首:'一课上克下、余课无克，事从上起，谋为顺遂。',
  重审:'四课一下贼上，事从下起，宜详审而后动。',
  知一:'多克取与日干比者发用，事有同类相从，宜择同气而谋。',
  涉害:'多克俱比，较涉害深浅取用，主事经险阻而后成。',
  遥克:'四课无克，取遥克日干或日干所克者发用，事在远方。',
  昴星:'无克而四课全，阳日取酉上、阴日取酉下发用，宜静守待机。',
  别责:'四课不全又无克，取干合或支前三合发用，主借力于人。',
  八专:'干支同宫，四课止二课，事专于一，宜专守勿杂。',
  伏吟:'天地盘同宫，三传循刑，主事静而不动，宜守旧待时。',
  返吟:'天地盘对冲，三传多动荡，主事反复迁移，宜动中求稳。',
  励德:'贵人临地盘卯酉，日月之门，主进退有节、赏罚分明。',
  全局:'三传合成三合局，事体结党成势，主谋望和合而成。',
  元胎:'三传皆四孟，如胎孕初成，事在酝酿，宜静养待时。',
  连珠:'三传相连如贯珠，事体相因递进，宜循序而进。',
  三光:'日干、日支与初传俱旺，初传又乘吉将，主光明顺遂。',
  三阳:'日干、日支与初传俱阳，阳气升发，主谋为光明顺遂。',
  三奇:'旬奇之支入于三传，奇神临课，主得意外助力。',
  六仪:'旬首之支入于三传，六仪临课，事有首绪可依。',
  六纯:'四课三传俱阳或俱阴，气势纯一，吉凶皆专。',
  斩关:'魁罡临干或临支发用，斩关破障，宜动不宜守。',
  闭口:'旬尾加旬首发用，闭口缄默，事难显言宜守密。',
  游子:'三传皆四季土，初传又值丁神或天马，主奔走不定。',
  乱首:'支上乘干寄宫而支克之，卑凌尊，事多起于下。',
  赘婿:'支上乘干寄宫而寄宫克支，依附于人，事不自主。',
  淫泆:'卯酉发用而乘天后或六合，情私酒色，防因色败事。',
  无禄:'四课俱上克下，下情不上达，所求难遂。',
  绝嗣:'四课俱下贼上，下悖其上，嗣续艰难。',
  度厄:'四课三课同向相克，厄难当前，宜修省禳解。',
  殃咎:'三传递克日干，或干支上神各乘其墓，灾咎叠至。',
  鬼墓:'初传为克干之鬼又为干墓，鬼入墓库，凶事纠缠。',
  时泰:'初传值岁建或月建，又乘龙合吉将而为财德，主时运通泰。',
  龙德:'岁建发用而乘贵人，主得尊长提携，谋事有德可依。',
  官爵:'驿马发用而中末见戌或太常，且临日辰，主官职迁动。',
  富贵:'贵人文昌发用而旺相生宫，且临日辰，主富贵双全。',
  轩盖:'午发用而中末见卯子，轩车华盖，主出行显达。',
  铸印:'巳发用而中传见戌，铸印成器，主受命任职。',
  斫轮:'卯发用而临申酉，斫轮成器，主技艺成名。',
  引从:'初末传分居干上神或支上神前后，引从拱夹，主得人扶助。',
  亨通:'三传递生日干，或干支上神互生，事体通达。',
  三交:'日支与三传皆四仲，初传乘后朱阴合，主交关牵连。',
  解离:'干克支上、支克干上，上下相克，主分离乖隔。',
  天网:'占时与初传同克日干，如罗网罩身，谋事受制。',
  盘珠:'三传与岁建月建日时俱在四课，如珠走盘，事体周遍。',
  死奇:'天盘辰临干寄宫或日支，死气临身，主晦滞。',
  灾厄:'初传值丧门吊客病符或日干之墓，灾厄临门。'
};
/* 取传法归一：chuan.method 读成名与子格，不改取传结果 */
function keweiMethod(m,o){
  const s=String(m||'');
  if(s.indexOf('八专')===0){
    const c=(o&&o.chuan)||{}, tj=(o&&o.jiangOnTian&&o.jiangOnTian[c.chu])||'';
    const guiYi=!!c.chu&&c.chu===c.zhong&&c.zhong===c.mo;
    const weiBo=['天后','六合','玄武'].includes(tj);
    return {name:'八专',sub:guiYi?'独足':(weiBo?'帷簿不修':'')};
  }
  if(s.indexOf('伏吟')===0) return {name:'伏吟',sub:s.indexOf('自任')>=0?'自任':(s.indexOf('自信')>=0?'自信':'杜传')};
  if(s.indexOf('返吟')===0) return {name:'返吟',sub:s.indexOf('井栏射')>=0?'井栏射':'无依'};
  if(s.indexOf('元首')===0) return {name:'元首',sub:''};
  if(s.indexOf('重审')===0) return {name:'重审',sub:''};
  if(s.indexOf('比用')===0) return {name:'知一',sub:'比用'};
  if(s.indexOf('涉害')===0) return {name:'涉害',sub:s.indexOf('见机')>=0?'见机':(s.indexOf('察微')>=0?'察微':(s.indexOf('缀瑕')>=0?'缀瑕':''))};
  if(s.indexOf('遥克')===0) return {name:'遥克',sub:s.indexOf('蒿矢')>=0?'蒿矢':(s.indexOf('弹射')>=0?'弹射':'')};
  if(s.indexOf('昴星')===0) return {name:'昴星',sub:s.indexOf('虎视')>=0?'虎视':(s.indexOf('冬蛇')>=0?'冬蛇':'')};
  if(s.indexOf('别责')===0) return {name:'别责',sub:''};
  return {name:s,sub:''};
}
/* 某五行当月的旺相休囚死 */
function wxWangOf(wx,monthZhi){
  const row=WX_WANG[WX_WANG_SEASON[monthZhi]||'四季']||{};
  return row[wx]||'';
}
/* 课体：取传法一格，格局五格可多中 */
function keweiOf(o){
  const c=o.chuan||{};
  const hits=[];
  // 励德：贵人临地盘卯酉
  if(ZHI[o.guiDiIdx]==='卯'||ZHI[o.guiDiIdx]==='酉') hits.push({name:'励德',sub:''});
  // 全局：三传三支各异且同属一个三合局
  const san=new Set([c.chu,c.zhong,c.mo]);
  if(san.size===3&&SANHE_GROUP[c.chu]&&SANHE_GROUP[c.chu]===SANHE_GROUP[c.zhong]&&SANHE_GROUP[c.chu]===SANHE_GROUP[c.mo])
    hits.push({name:'全局',sub:SANHE_WX[SANHE_GROUP[c.chu]]||''});
  // 元胎：三传皆四孟
  if([c.chu,c.zhong,c.mo].every(z=>['寅','申','巳','亥'].includes(z))) hits.push({name:'元胎',sub:''});
  // 连珠：三传顺连或逆连
  const step=(a,b)=>((b-a)%12+12)%12;
  const i1=ZHI.indexOf(c.chu), i2=ZHI.indexOf(c.zhong), i3=ZHI.indexOf(c.mo);
  if(step(i1,i2)===1&&step(i2,i3)===1) hits.push({name:'连珠',sub:'顺连'});
  else if(step(i1,i2)===11&&step(i2,i3)===11) hits.push({name:'连珠',sub:'逆连'});
  // 三光：初传、日干、日支皆旺于月建，初传又乘贵人、青龙、六合、太常之一
  const chuTj=(o.jiangOnTian||{})[c.chu]||'';
  if(['贵人','青龙','六合','太常'].includes(chuTj)
    && wxWangOf(ZHI_WX[c.chu],o.monthZhi)==='旺'
    && wxWangOf(GAN_WX[o.dGan],o.monthZhi)==='旺'
    && wxWangOf(ZHI_WX[o.dZhi],o.monthZhi)==='旺') hits.push({name:'三光',sub:''});
  // 第二批格局：按盘面判，与取传法无关，可多中
  const tOn=z=>o.tian[ZHI.indexOf(z)];
  const diUnder=z=>ZHI[o.tian.indexOf(z)];
  const ganWx=GAN_WX[o.dGan], zhiWx=ZHI_WX[o.dZhi];
  const jg=JIGONG[o.dGan];
  const ganShang=tOn(jg), zhiShang=tOn(o.dZhi);
  const sanChuan=[c.chu,c.zhong,c.mo];
  const yangZhi=z=>'子寅辰午申戌'.includes(z);
  const xunShou=(o.xun||'').charAt(1);
  const xunWei=xunShou?ZHI[(ZHI.indexOf(xunShou)+9)%12]:'';
  const xunQi={子:'丑',戌:'丑',申:'子',午:'子',辰:'亥',寅:'亥'}[xunShou]||'';
  const xunDingK=xunShou?ZHI[(ZHI.indexOf(xunShou)+3)%12]:'';
  const tianMa=TIANMA[o.monthZhi]||'';
  const keFull=new Set(o.ke.map(k=>k.u+k.d)).size===4;
  // 三阳：日干、日支与初传俱阳
  if('甲丙戊庚壬'.includes(o.dGan)&&yangZhi(o.dZhi)&&yangZhi(c.chu)) hits.push({name:'三阳',sub:''});
  // 三奇：旬奇之支入三传，甲子甲戌旬取丑、甲申甲午旬取子、甲辰甲寅旬取亥
  if(xunQi&&sanChuan.includes(xunQi)) hits.push({name:'三奇',sub:'旬奇'+xunQi});
  // 六仪：旬首之支入三传
  if(xunShou&&sanChuan.includes(xunShou)) hits.push({name:'六仪',sub:''});
  // 六纯：四课上下神与三传俱阳或俱阴
  {
    const sides=o.ke.reduce((a,k)=>a.concat([k.u,k.d]),[]);
    if(sides.every(yangZhi)&&sanChuan.every(yangZhi)) hits.push({name:'六纯',sub:'纯阳'});
    else if(!sides.some(yangZhi)&&!sanChuan.some(yangZhi)) hits.push({name:'六纯',sub:'纯阴'});
  }
  // 斩关：初传辰戌而所临地盘为日干寄宫或日支
  if((c.chu==='辰'||c.chu==='戌')&&(diUnder(c.chu)===jg||diUnder(c.chu)===o.dZhi)) hits.push({name:'斩关',sub:''});
  // 闭口：旬尾之支加旬首之支发用
  if(xunWei&&c.chu===xunWei&&diUnder(c.chu)===xunShou) hits.push({name:'闭口',sub:''});
  // 游子：三传皆四季土，初传为旬丁之支或天马
  if(sanChuan.every(z=>'辰戌丑未'.includes(z))&&((xunDingK&&c.chu===xunDingK)||(tianMa&&c.chu===tianMa)))
    hits.push({name:'游子',sub:c.chu===xunDingK?'丁神':'天马'});
  // 乱首：支上乘寄宫而日支克寄宫为自取，干上乘日支而日支克寄宫为上门
  if(zhiShang===jg&&keOf(o.dZhi,jg)) hits.push({name:'乱首',sub:'自取'});
  else if(ganShang===o.dZhi&&keOf(o.dZhi,jg)) hits.push({name:'乱首',sub:'上门'});
  // 赘婿：支上乘寄宫而寄宫克日支
  if(zhiShang===jg&&keOf(jg,o.dZhi)) hits.push({name:'赘婿',sub:''});
  // 淫泆：初传卯酉而乘天后或六合
  if((c.chu==='卯'||c.chu==='酉')&&['天后','六合'].includes(chuTj)) hits.push({name:'淫泆',sub:chuTj});
  // 无禄：四课全而四上克下
  if(keFull&&o.ke.every(k=>keOf(k.u,k.d))) hits.push({name:'无禄',sub:''});
  // 绝嗣：四课全而四下贼上
  if(keFull&&o.ke.every(k=>keOf(k.d,k.u))) hits.push({name:'绝嗣',sub:''});
  // 度厄：四课全而同向相克恰三课
  {
    const up=o.ke.filter(k=>keOf(k.u,k.d)).length, down=o.ke.filter(k=>keOf(k.d,k.u)).length;
    if(keFull&&((up===3&&down===0)||(down===3&&up===0))) hits.push({name:'度厄',sub:''});
  }
  // 殃咎：三传递克日干，或干上为日干之墓而支上为日支之墓
  {
    const sx=z=>ZHI_WX[z];
    const keChain=(WX_KE2[sx(c.chu)]===sx(c.zhong)&&WX_KE2[sx(c.zhong)]===sx(c.mo)&&WX_KE2[sx(c.mo)]===ganWx)
      ||(WX_KE2[sx(c.mo)]===sx(c.zhong)&&WX_KE2[sx(c.zhong)]===sx(c.chu)&&WX_KE2[sx(c.chu)]===ganWx);
    if(keChain) hits.push({name:'殃咎',sub:'传递克干'});
    else if(ganShang===WX_MU[ganWx]&&zhiShang===WX_MU[zhiWx]) hits.push({name:'殃咎',sub:'干支乘墓'});
  }
  // 鬼墓：初传为克日干之鬼又为日干之墓
  if(tenOfZhi(ganWx,c.chu)==='官'&&c.chu===WX_MU[ganWx]) hits.push({name:'鬼墓',sub:''});
  // 第三批：只依赖盘面与已有表，新增表一律 KW_ 前缀
  {
    const qian=z=>ZHI[(ZHI.indexOf(z)+1)%12], hou=z=>ZHI[(ZHI.indexOf(z)+11)%12];
    const chuDi=diUnder(c.chu);
    // 时泰：初传值岁建或月建，乘龙合，且为日干之财或日德
    if((c.chu===o.yearZhi||c.chu===o.monthZhi)&&['青龙','六合'].includes(chuTj)
      &&(tenOfZhi(ganWx,c.chu)==='财'||c.chu===RIDE[o.dGan])) hits.push({name:'时泰',sub:''});
    // 龙德：岁建发用而乘贵人
    if(c.chu===o.yearZhi&&chuTj==='贵人') hits.push({name:'龙德',sub:''});
    // 官爵：驿马发用，中末见戌或太常，且临日辰
    if(c.chu===YIMA[o.dZhi]&&(c.zhong==='戌'||c.mo==='戌'||[c.zhong,c.mo].some(z=>o.jiangOnTian[z]==='太常'))
      &&(c.chu===ganShang||c.chu===zhiShang)) hits.push({name:'官爵',sub:''});
    // 富贵：贵人发用而旺，生所临之宫，且临日辰
    if(chuTj==='贵人'&&wxWangOf(ZHI_WX[c.chu],o.monthZhi)==='旺'
      &&SHENG[ZHI_WX[c.chu]]===ZHI_WX[chuDi]&&(c.chu===ganShang||c.chu===zhiShang)) hits.push({name:'富贵',sub:''});
    // 轩盖：午发用，中末见卯子
    if(c.chu==='午'&&[c.zhong,c.mo].includes('卯')&&[c.zhong,c.mo].includes('子')) hits.push({name:'轩盖',sub:''});
    // 铸印：巳发用，中传戌
    if(c.chu==='巳'&&c.zhong==='戌') hits.push({name:'铸印',sub:''});
    // 斫轮：卯发用而临申酉
    if(c.chu==='卯'&&(chuDi==='申'||chuDi==='酉')) hits.push({name:'斫轮',sub:''});
    // 引从：初末传分居干上神或支上神前后
    if((c.chu===qian(ganShang)&&c.mo===hou(ganShang))||(c.chu===hou(ganShang)&&c.mo===qian(ganShang))
      ||(c.chu===qian(zhiShang)&&c.mo===hou(zhiShang))||(c.chu===hou(zhiShang)&&c.mo===qian(zhiShang)))
      hits.push({name:'引从',sub:''});
    // 亨通：末传生日干，或干支上神互生
    if(SHENG[ZHI_WX[c.mo]]===ganWx||SHENG[ZHI_WX[ganShang]]===zhiWx||SHENG[ZHI_WX[zhiShang]]===ganWx)
      hits.push({name:'亨通',sub:''});
    // 三交：日支与三传皆四仲，初传乘后朱阴合
    if(['子','午','卯','酉'].includes(o.dZhi)&&sanChuan.every(z=>['子','午','卯','酉'].includes(z))
      &&['天后','朱雀','太阴','六合'].includes(chuTj)) hits.push({name:'三交',sub:''});
    // 解离：干克支上、支克干上
    if(keOf(jg,zhiShang)&&keOf(o.dZhi,ganShang)) hits.push({name:'解离',sub:''});
    // 天网：占时与初传同克日干
    if(WX_KE2[ZHI_WX[o.shiZhi]]===ganWx&&WX_KE2[ZHI_WX[c.chu]]===ganWx) hits.push({name:'天网',sub:''});
    // 盘珠：三传与岁建月建日时俱在四课
    {
      const sides=[ganShang,zhiShang].concat(o.ke.map(k=>k.u),o.ke.map(k=>k.d));
      if(sanChuan.every(z=>sides.includes(z))&&[o.yearZhi,o.monthZhi,o.dZhi,o.shiZhi].every(z=>sides.includes(z)))
        hits.push({name:'盘珠',sub:''});
    }
    // 死奇：天盘辰临干寄宫或日支
    if(diUnder('辰')===jg||diUnder('辰')===o.dZhi) hits.push({name:'死奇',sub:''});
    // 灾厄：初传值丧门吊客病符或日干之墓
    {
      const sh=o.sha||{};
      if([sh.sangmen,sh.diaoke,sh.bingfu].includes(c.chu)||c.chu===WX_MU[ganWx]) hits.push({name:'灾厄',sub:''});
    }
  }
  return {method:keweiMethod(c.method,o),hits};
}
/* 课体模块内容：取传法一行，格局逐条列名与释义，无命中写明无特别格局 */
function keweiHtml(k){
  if(!k||!k.method) return '<div class="sub-note">本课无特别课体格局。</div>';
  const m=k.method;
  const rows=['<tr><th>取传法</th><td>'+m.name+(m.sub?'（'+m.sub+'）':'')+'　'+(KEWEI_SAY[m.name]||'')+'</td></tr>'];
  if(k.hits&&k.hits.length){
    k.hits.forEach(h=>{ rows.push('<tr><th>'+h.name+(h.sub?'（'+h.sub+'）':'')+'</th><td>'+(KEWEI_SAY[h.name]||'')+'</td></tr>'); });
  } else {
    rows.push('<tr><th>课体格局</th><td>本课无特别课体格局</td></tr>');
  }
  return '<table class="lr-bh-tbl"><tbody>'+rows.join('')+'</tbody></table>';
}
function baihua(o){
  const c=o.chuan;
  const tj=z=>o.jiangOnTian[z]||'';
  const tjInfo=z=>{const j=tj(z); if(!j) return '无天将'; const g=TIANJIANG_INFO[j]&&TIANJIANG_INFO[j][0]==='吉'?'吉神':'凶神'; return j+'（'+g+'）';};
  const hasKe=o.ke.some(k=>keOf(k.d,k.u)||keOf(k.u,k.d));
  const keDesc=hasKe?'四课里有上下相克，据此定出事情从哪一头发起':'四课里没有明显的上下相克，按无克之格取初传';
  const yz=z=>'子寅辰午申戌'.includes(z)?'阳传，应事较快':'阴传，应事较慢';
  // 类神定位与落宫：起课模块与白话解读共用 leiSpot
  const L=leiSpot(o);
  const leiZhi=L.zhi, leiFrom=L.from, leiState=L.state;
  const jg=JIGONG[o.dGan];
  const tianOn=z=>o.tian[ZHI.indexOf(z)];
  // 三传天将吉凶统计
  const tjs=[tj(c.chu),tj(c.zhong),tj(c.mo)].filter(Boolean);
  let jiN=0,xN=0; tjs.forEach(j=>{ if(TIANJIANG_INFO[j]&&TIANJIANG_INFO[j][0]==='吉')jiN++; else xN++; });
  const jxSpan = w => w==='吉'?'<span class="jx-ji">吉</span>':'<span class="jx-xiong">凶</span>';
  const tjSummary = tjs.length
    ? ('三传所临天将：'+tjs.map(j=>j+'('+jxSpan(TIANJIANG_INFO[j]&&TIANJIANG_INFO[j][0]==='吉'?'吉':'凶')+')').join('、')+'，'+(jiN>xN?'<span class="jx-ji">吉</span>神居多，事体偏顺':jiN<xN?'<span class="jx-xiong">凶</span>神居多，多有阻碍':'<span class="jx-ji">吉</span><span class="jx-xiong">凶</span>相参，成败在人谋')+'。')
    : '三传暂未配齐天将。';
  const yqChuFast=yz(c.chu).indexOf('快')>=0;
  const yq = yqChuFast?'初传为阳，应期较速（数日乃至旬内）':'初传为阴，应期较迟（经月乃至更久）';
  // 遁干：禄、德、丁神，落天盘查其吉凶
  const dun=DUN_GAN[o.dGan]||{};
  let dunLine='';
  if(dun.lu){
    const luT=tianOn(dun.lu), deT=tianOn(dun.de), dinT=tianOn(dun.ding);
    const jxSuffix = j => {
      if(!j) return '';
      const info = TIANJIANG_INFO[j];
      return info && info[0]==='吉' ? '吉神' : '凶神';
    };
    const luInfo=luT ? '，临'+tj(luT)+jxSuffix(tj(luT)) : '';
    const deInfo=deT ? '，临'+tj(deT)+jxSuffix(tj(deT)) : '';
    const dinInfo=dinT ? '，临'+tj(dinT)+jxSuffix(tj(dinT)) : '';
    dunLine=`${o.dGan}干之禄神在${dun.lu}（天盘${luT}）${luInfo}；德神在${dun.de}（天盘${deT}）${deInfo}；丁神在${dun.ding}（天盘${dinT}）${dinInfo}。禄德为旺气吉神，丁神主动应，视其临传与类神定其吉凶。`;
  }
  // 本命行年
  let benLine='';
  if(o.benMing&&o.xingNian){
    const bz=o.benMing.zhi, bzT=tianOn(bz);
    const xz=o.xingNian.zhi, xzT=tianOn(xz);
    benLine=`本命行年：本命 ${o.benMing.gan}${o.benMing.zhi}，${o.sex}命，虚岁 ${o.xingNian.age}，行年支 ${xz}，${xzT?'天盘'+xzT+'，临'+tjInfo(xzT):'天盘'+xzT}；本命支 ${bz}，${bzT?'天盘'+bzT+'，临'+tjInfo(bzT):'天盘'+bzT}。行年落宫之神即本人当前所行之气，参其吉凶与类神生克断事。`;
  }
  // 三传行（同句分号分隔）
  const chuanHtml = `初传 ${wxSpan(c.chu)} ${tjInfo(c.chu)}（${yz(c.chu)}）；中传 ${wxSpan(c.zhong)} ${tjInfo(c.zhong)}（${yz(c.zhong)}）；末传 ${wxSpan(c.mo)} ${tjInfo(c.mo)}（${yz(c.mo)}）`;
  const dunHtml = o.dun ? `；遁干 初传 ${o.dun.chu}、中传 ${o.dun.zhong}、末传 ${o.dun.mo}` : '';
  const rows = [
    ['起课', `本课排 ${o.dgz}日、${o.shiZhi}时，月将 ${o.jiang}。${o.day?'昼占阳贵':'夜占阴贵'}（贵人${o.guiZhi}）`],
    ['天地盘', '天盘为月将加占时布出的动态盘，地盘为十二地支本位；十二天将随天盘排布，各主吉凶。'],
    ['四课', `以日干、日支为中心取上方天盘之神成四层。${keDesc}。`],
    ['三传', `${chuanHtml}${dunHtml}`],
    ['类神', `本占（${o.dcat}）以 ${o.lei.yong} 为类神。${o.lei.desc}类神落 ${leiZhi?wxSpan(leiZhi):'未现'}（${leiFrom||'课中未见'}），临 ${leiZhi?tjInfo(leiZhi):'无'}。${leiState}。`],
    ['干遁', dunLine||'无'],
    ['本命', benLine||'未填本命年'],
    ['吉凶', tjSummary],
    ['应期', `${yq}（阳传应期速、阴传应期迟）。`],
    ['总结', `占${o.dcat}，以类神为事之核心，看类神旺衰与所临天将吉凶，再合三传定应期，${jiN>xN?'吉神多于凶神，整体偏利':jiN<xN?'凶神多于吉神，宜谨慎防阻':'吉凶参半，须审时度势'}。`]
  ];
  return '<table class="lr-bh-tbl"><tbody>'+rows.map(r=>`<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')+'</tbody></table>';
}
function render(o){
  const L=leiSpot(o);
  // 天地盘（方形四周十二宫）
  const pos={巳:[0,0],午:[0,1],未:[0,2],申:[0,3],辰:[1,0],酉:[1,3],卯:[2,0],戌:[2,3],寅:[3,0],丑:[3,1],子:[3,2],亥:[3,3]};
  let cells=Array.from({length:16},()=>'');
  ZHI.forEach(dz=>{
    const [r,c]=pos[dz]; const idx=r*4+c;
    const tp=o.tian[ZHI.indexOf(dz)];
    const jn=o.jiangOnTian[tp]||'';
    cells[idx]=`<div class="lr-cell">
      <div class="lr-jiang">${jn}</div>
      <div class="lr-tian">${wxSpan(tp)}</div>
      <div class="lr-di">${wxSpan(dz)}</div></div>`;
  });
  cells[5]=cells[6]=cells[9]=cells[10]=''; // 中间留空由说明占
  const c0=o.chuan;
  let center=`<div class="lr-center lr-center-mid">
    <div>日 ${o.dgz}</div><div>占时 ${o.shiZhi}</div><div>月将 ${o.jiang}</div>
    <div class="sub-note">${o.day?'昼占阳贵':'夜占阴贵'}（贵人${o.guiZhi}）</div>
    <div class="sub-note">初传${wxSpan(c0.chu)}</div></div>`;
  let grid='<div class="lr-board">';
  for(let i=0;i<16;i++){ if(i===5){grid+=center;} if([5,6,9,10].includes(i))continue; grid+=cells[i]; }
  grid+='</div>';
  // 四课
  const keHtml=o.ke.slice().reverse().map(k=>{
    const relCode=xjWxRelCode(ZHI_WX[k.d],ZHI_WX[k.u]);
    let rel, relCls='lr-rel-ping';
    if(relCode==='ke'){ rel='下贼上'; relCls='lr-rel-ke'; }
    else if(relCode==='beike'){ rel='上克下'; relCls='lr-rel-ke'; }
    else if(relCode==='same'){ rel='比和'; }
    else { rel=relCode==='sheng'?'下生上':'上生下'; }
    return `<div class="lr-ke">
    <div class="lr-ke-u">${wxSpan(k.u)}</div><div class="lr-ke-d">${wxSpan(k.d)}</div>
    <div class="lr-ke-l">${k.lbl}</div><div class="lr-ke-rel ${relCls}">${rel}</div></div>`;
  }).join('');
  // 三传
  const c=o.chuan;
  const tj=z=>o.jiangOnTian[z]||'';
  const trip=[['初传',c.chu],['中传',c.zhong],['末传',c.mo]].map(t=>{
    const jn=tj(t[1]); const wx=ZHI_WX[t[1]];
    const info=jn?TIANJIANG_INFO[jn]:null;
    const yin='子寅辰午申戌'.includes(t[1]);
    const yq = yin?'阳传、期速':'阴传、期迟';
    return `<div class="lr-chuan">
    <span class="lr-chuan-l">${t[0]}</span>
    <span class="lr-chuan-z">${wxSpan(t[1])}</span>
    <span class="lr-chuan-j">${jn?jn+'（'+(info?info[0]:'')+'）':''}${wx}</span>
    <span class="lr-chuan-yq">${yq}</span></div>`;
  }).join('');
  const skName=document.getElementById('dlSchool').value;
  const skDoc = DLR_SCHOOL_DOC[skName]||{src:'',claim:'',diff:''};
  const guiDiZhi=ZHI[o.guiDiIdx];
  const schoolHere=`本盘占时${o.shiZhi}时，${o.day?'昼占取阳贵':'夜占取阴贵'}，起贵口诀${o.guiMode}，贵人${o.guiZhi}；月将${o.jiang}（${JIANG_NAME[o.jiang]}），${o.jiangKey}。贵人临地盘${guiDiZhi}位，十二天将自${guiDiZhi}位起${o.shun?'顺':'逆'}布。发用取${c.method}，初传${c.chu}、中传${c.zhong}、末传${c.mo}。`;
  const presetNote=o.preset?'':'　本盘昼夜或月将已改本派预设，按表单当前选择重排。';
  document.getElementById('out').innerHTML=`
    <section class="mod collapsed" id="dlrModPan"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModPan')"><span class="mod-caret">▾</span><span class="mod-title">天地盘</span><span class="mod-sub">${o.jiangKey} 十二天将</span></div><div class="mod-body">${grid}</div></section>
    <section class="mod collapsed" id="dlrModKe"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModKe')"><span class="mod-caret">▾</span><span class="mod-title">四课</span><span class="mod-sub">干支阴阳</span></div><div class="mod-body"><div class="lr-kes">${keHtml}</div></div></section>
    <section class="mod collapsed" id="dlrModChuan"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModChuan')"><span class="mod-caret">▾</span><span class="mod-title">三传</span><span class="mod-sub">初传 中传 末传</span></div><div class="mod-body"><div class="lr-chuans">${trip}</div><p class="sub-note">取法：${c.method}；旬空 ${o.kong||'-'}；遁干 初${o.dun?o.dun.chu:'-'}、中${o.dun?o.dun.zhong:'-'}、末${o.dun?o.dun.mo:'-'}。</p></div></section>
    <section class="mod collapsed" id="dlrModKewei"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModKewei')"><span class="mod-caret">▾</span><span class="mod-title">课体</span><span class="mod-sub">${o.kewei?o.kewei.method.name+(o.kewei.method.sub?'（'+o.kewei.method.sub+'）':''):''}</span></div><div class="mod-body">${keweiHtml(o.kewei)}</div></section>
    <section class="mod collapsed" id="dlrModLei"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModLei')"><span class="mod-caret">▾</span><span class="mod-title">类神取用</span><span class="mod-sub">${o.dcat}</span></div><div class="mod-body"><div class="info-box lr-lei" id="lrLeiBox"><p>本占（${o.dcat}）以 <b>${o.lei.yong}</b> 为类神。${L.zhi?`类神落 ${wxSpan(L.zhi)}（${L.from}），临 ${o.jiangOnTian[L.zhi]||'无天将'}。${L.state}。`:`${L.state}。`}${o.lei.desc}</p>${o.benMing&&o.xingNian?`<p class="lr-lei-sub"><b>本命行年</b>：${o.benMing.gan}${o.benMing.zhi}命、${o.sex}、虚岁${o.xingNian.age}、行年 ${o.xingNian.zhi}（${o.jiangOnTian[o.tian[ZHI.indexOf(o.xingNian.zhi)]]?'临'+o.jiangOnTian[o.tian[ZHI.indexOf(o.xingNian.zhi)]]:'天盘'+o.tian[ZHI.indexOf(o.xingNian.zhi)]}）</p>`:''}${o.sha?`<p class="lr-lei-sub"><b>支间关系</b>：日支三合${o.sha.sanhe||'-'}${SANHE_WX[o.sha.sanhe]||''}，六冲${o.sha.liuchong||'-'}</p>`:''}</div>${shaTable(o)}</div></section>
    <section class="mod collapsed" id="dlrModSchool"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModSchool')"><span class="mod-caret">▾</span><span class="mod-title">流派解读</span><span class="mod-sub">《${skName}》</span></div><div class="mod-body"><div class="info-box lr-school">
       <table class="lr-school-tbl"><tbody>
         <tr><th>典籍与传人</th><td>${skDoc.src}</td></tr>
         <tr><th>本派主张</th><td>${skDoc.claim}</td></tr>
         <tr><th>本盘落点</th><td>${schoolHere}</td></tr>
         <tr><th>与他派分歧</th><td>${skDoc.diff}</td></tr>
       </tbody></table>
       <p class="sub-note">${DLR_SCHOOL_NOTE}${presetNote}</p>
     </div></div></section>
    <section class="mod collapsed" id="dlrModSynth"><div class="mod-head" role="button" tabindex="0" onclick="dlrToggleMod('dlrModSynth')"><span class="mod-caret">▾</span><span class="mod-title">综合判断</span><span class="mod-sub">白话总断</span></div><div class="mod-body">${baihua(o)}</div></section>
    <details class="lr-bifa" id="lrBifa"><summary>毕法赋断语（《六壬大全》卷十一，凌福之）</summary>${bifaTable(o)}</details>
    <details class="lr-jx" id="lrJx"><summary>十二天将吉凶象意（参考）</summary>${tianJiangTable()}</details>`;
  xjApplyModState('dlrModState','#out details[id]');
}
