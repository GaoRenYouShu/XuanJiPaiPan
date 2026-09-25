/* ============================================================
 * bazi-core.js  八字排盘核心引擎
 *
 * 章节结构（按加载依赖顺序排列，同一全局作用域）：
 *   一、事业财运议题   renderCareer
 *   二、婚姻感情议题   renderMarry
 *   三、本命装配与基础渲染   BaziState / renderBaziPage / 四柱，纳音，神煞，量化诸表
 *   四、大运流年   运势曲线 / 所选干支三表 / 岁运引动
 *   五、五派解读   schoolXiJi / 解说层 / 综合判断
 *   六、事件应期   组合断语引擎
 *
 * 跨页共享库 bazi-data.js（命理引擎）、xuanji-lib.js（公共工具）、gua.js、ai.js
 * 由站点其他页面共用，不属本文件范围。
 * ============================================================ */



/* ==================== 一、事业财运议题 ==================== */
/* 事业财运模块（表驱动，T1-T15 知识 + 四检测函数 + renderCareer）
 * 依赖全局：baziAnalysis / tenGod / zhiMain / nayinOf / getChangSheng / HIDE / GAN_WX / ZHI_WX / WX_SHENG / WX_KE / WX_TO_STEM / SHA_LIFE / NAYIN_INFO / relToMing
 * 全部值运行时取自 bazi-data.js，前端仅输出命中项。本文件不使用破折号与方头括号，括号不嵌套。
 */
(function(){
  'use strict';
  const PALACE=['年','月','日','时'];
  const GAN_ORDER=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const HE=['甲己','乙庚','丙辛','丁壬','戊癸']; // 天干五合
  const DI_HE={'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'};
  const SAN_HE=[['寅','午','戌'],['申','子','辰'],['巳','酉','丑'],['亥','卯','未']];
  const CHONG={'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'};
  const HAI={'子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉'};
  const XING_G=[['寅','巳','申'],['丑','戌','未']];
  const TOMB={'木':'未','火':'戌','金':'丑','水':'辰','土':'戌'}; // 土库在戌（火土同库，与断语库 caiKu 同口径）
  // T4 行业五行喜忌 + 利、忌方位（WX_FANG 取自 bazi-data.js 全局）
  // 十二长生推算调用全局 getChangSheng（bazi-data.js）
  function csBucket(st){ if(['长生','冠带','临官','帝旺'].indexOf(st)>=0) return '旺'; if(['衰','病','死','绝','墓'].indexOf(st)>=0) return '弱'; return '中'; }
  // 日主长生在各柱的具体情形（不照搬数据，说人话）
  const PILLAR_CS_NOTE={
    '年':{'旺':'早年运顺、起步得力、家世根基厚','弱':'早年运偏低、起步多磨、宜白手积累','中':'早年运平稳、中后根基渐厚'},
    '月':{'旺':'青年得令、才华精力鼎盛、利学业起步','弱':'青年运滞、宜稳扎蓄势','中':'青年渐入佳境、后程渐旺'},
    '日':{'旺':'自身根气足、精力旺、配偶得位助益','弱':'自身根气偏弱、宜借力、配偶偏弱','中':'自身渐厚、中年后根基渐稳'},
    '时':{'旺':'晚运奋发、子女得力、名位晚成','弱':'晚运收敛、宜守成聚财、子女缘弱','中':'晚运蓄养、蓄势待时'}
  };
  // 首选用神长生在各柱的助益强弱
  const XI_CS_NOTE={'旺':'该柱<span class="tip sha-ji">喜用</span>得力、助运明显','弱':'该柱<span class="tip sha-ji">喜用</span>受制或封存、此柱难助','中':'该柱<span class="tip sha-ji">喜用</span>培育中、渐厚'};
  // 五行取本气阳干走全站单点真源 WX_TO_STEM（bazi-data.js），本议题不再另立同义表

  // ===== 透藏柱位（traceGods / pillarGods）=====
  function buildOcc(BZ,dg){
    const occ=[];
    for(let i=0;i<4;i++){
      if(i===2){
        // 日柱天干=日主"我"，不是十神（比肩），不计入十神计数与透干（与量化表 ssCount 跳过 gans[2] 同口径）
        const hiddens=HIDE[BZ.zhis[i]]||[];
        hiddens.forEach(h=>occ.push({raw:h, god:tenGod(dg,h), p:i, pos:'支'}));
        continue;
      }
      const g=BZ.gans[i];
      occ.push({raw:g, god:tenGod(dg,g), p:i, pos:'干'});
      const hiddens=HIDE[BZ.zhis[i]]||[];
      hiddens.forEach(h=>occ.push({raw:h, god:tenGod(dg,h), p:i, pos:'支'}));
    }
    return occ;
  }
  function pillarDesc(occ,god){
    const hits=occ.filter(o=>o.god===god);
    if(!hits.length) return '';
    return hits.map(o=>PALACE[o.p]+(o.pos==='干'?(''+o.raw):('支'+o.raw))).join('、');
  }
  function godCount(occ,god){ return occ.filter(o=>o.god===god).length; }
  function godTou(occ,god){ return occ.filter(o=>o.god===god&&o.pos==='干').map(o=>o.p); }
  function godCang(occ,god){ return occ.filter(o=>o.god===god&&o.pos==='支').map(o=>o.p); }

  // ===== 十神量化（分布统计 → 真实强弱、缺旺，供短板与层级判定）=====
  const GODS10=['比肩','劫财','食神','伤官','正财','偏财','正官','七杀','正印','偏印'];
  function quantGods(occ, tenE){
    const s={};
    GODS10.forEach(g=>{ const h=occ.filter(o=>o.god===g); s[g]={cnt:h.length, tou:h.filter(o=>o.pos==='干').length, cang:h.filter(o=>o.pos==='支').length}; });
    // 旺/弱按十神能量分占比判定（杜绝"数个数当力量"）；透/藏为位置事实保留
    const _tot=(tenE?Object.values(tenE).reduce((a,b)=>a+b,0):0)||1;
    const lv={};
    GODS10.forEach(g=>{ const x=s[g]; if(x.cnt===0) lv[g]='缺';
      else { const e=tenE?Math.round((tenE[g]||0)/_tot*100):0;
        if(x.tou>=1) lv[g]=(e>=REL.TH.PCT_STRONG?'旺透':'透');
        else lv[g]=(e>=REL.TH.PCT_HIDDEN?'藏旺':'弱藏'); } });
    return {s,lv};
  }

  // ===== 天干特殊（detectGanPattern）：天干一气 / 天干连珠 =====
  function detectGanPattern(BZ){
    const g=BZ.gans, names=[];
    if(g[0]===g[1]&&g[1]===g[2]&&g[2]===g[3]) names.push('天干一气');
    let lian=true;
    for(let i=0;i<3;i++){
      const a=GAN_ORDER.indexOf(g[i]), b=GAN_ORDER.indexOf(g[i+1]);
      if((b-a+10)%10!==1){ lian=false; break; }
    }
    if(lian) names.push('天干连珠');
    return names;
  }

  // ===== 十神关系格局（detectCombo）=====
  function findHe(occ,godA,godB){
    for(const pair of HE){
      const a=pair[0], b=pair[1];
      const oa=occ.find(o=>o.raw===a&&o.god===godA), ob=occ.find(o=>o.raw===b&&o.god===godB);
      if(oa&&ob) return {type:(godB==='七杀'?'七杀':godB==='正官'?'正官':'官杀'), pair:a+b+'合'};
      const oa2=occ.find(o=>o.raw===b&&o.god===godA), ob2=occ.find(o=>o.raw===a&&o.god===godB);
      if(oa2&&ob2) return {type:(godB==='七杀'?'七杀':godB==='正官'?'正官':'官杀'), pair:b+a+'合'};
    }
    return null;
  }
  function allHePairs(occ){
    const raws=occ.filter(o=>o.pos==='干').map(o=>o.raw);
    const out=[];
    for(const pair of HE){
      if(raws.indexOf(pair[0])>=0 && raws.indexOf(pair[1])>=0) out.push(pair[0]+pair[1]+'合');
    }
    return out;
  }

  function renderCareer(BZ){
    const dg=BZ.dayGan, dwx=GAN_WX[dg];
    const A=getAnalysis(BZ);
    const gans=BZ.gans, zhis=BZ.zhis;
    const strong=A.strength.indexOf('强')>=0, weak=A.strength.indexOf('弱')>=0;
    const isMale=(BZ.sex===1||BZ.sex===true);
    const fuXi=effXi(A).slice();
    const fuJi=effJi(A).slice();
    const fuXiStr=fuXi.join('、')||'无';
    const shangWx=WX_SHENG[dwx], wealthWx=WX_KE[dwx];
    const yinWx=(Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===dwx))||'';
    const killWx=(Object.keys(WX_KE).find(w=>WX_KE[w]===dwx))||'';
    const occ=buildOcc(BZ,dg);
    // 十神能量分（与五行能量分同源，日主不计），判定"旺/强/多"一律用能量占比，严禁数个数
    const eScore=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
    const tenE=eScore?ssTenGodEnergy(BZ, eScore):null;
    const eCatsC={'官杀':(tenE?((tenE['正官']||0)+(tenE['七杀']||0)):0),'印星':(tenE?((tenE['正印']||0)+(tenE['偏印']||0)):0),'食伤':(tenE?((tenE['食神']||0)+(tenE['伤官']||0)):0),'财星':(tenE?((tenE['正财']||0)+(tenE['偏财']||0)):0),'比劫':(tenE?((tenE['比肩']||0)+(tenE['劫财']||0)):0)};
    const _eT2=Object.values(eCatsC).reduce((a,b)=>a+b,0)||1;
    const ePctC=cat=>Math.round((eCatsC[cat]||0)/_eT2*100);
    // 统一"旺"判定（与①十神总览/②逐神深读同口径）：五行能量 > 0.7×五行均值 即"偏旺及以上"算强档。
    // 阈值口径全站唯一（0.7×均值），多套并存会致"官杀过旺却说官杀弱"跨节矛盾。
    const _wxStrong=wx=>{ try{ const es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null; if(!es) return false; const t=Object.values(es).reduce((a,b)=>a+b,0)||1; return (es[wx]||0) > 0.7*(t/5); }catch(e){ return false; } };
    // 五行能量档（过旺/偏旺/平和，与②逐神深读 _strOf 同款），供 s4/女命借力等文案档位统一取用
    const _wxTier=wx=>{ try{ const es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null; if(!es) return '平和'; const t=Object.values(es).reduce((a,b)=>a+b,0)||1; const avg=t/5, e=es[wx]||0; return e>WX_TIER_HI*avg?'过旺':(e>WX_TIER_LO*avg?'偏旺':'平和'); }catch(e){ return '平和'; } };
    const qgAll=quantGods(occ, tenE);
    const C=god=>godCount(occ,god);
    const T=god=>godTou(occ,god);
    const touStr=god=>{ const ps=T(god); return ps.length?dedupChars(ps.map(p=>gans[p])):''; };
    const shang=C('食神')+C('伤官');
    const cai=C('正财')+C('偏财');
    const guan=C('正官')+C('七杀');
    const yin=C('正印')+C('偏印');
    const bi=C('比肩')+C('劫财');
    const shangTouN=T('食神').length+T('伤官').length;
    const caiTouN=T('正财').length+T('偏财').length;
    const killTouN=T('正官').length+T('七杀').length;
    const biTouN=T('比肩').length+T('劫财').length;
    // 比劫夺财须有"他人之比劫"竞争，日主自身即比肩，须排除日柱天干，只看其余比劫
    const biOtherOcc=occ.filter(o=>(o.god==='比肩'||o.god==='劫财')&&!(o.p===2&&o.pos==='干'));
    const biOther=biOtherOcc.length;
    const biOtherTou=biOtherOcc.filter(o=>o.pos==='干').length;
    const biIsXi=fuXi.indexOf(dwx)>=0;
    const has2He=allHePairs(occ).length>=2;   // 双合创业信号（供合作得财判定）
    const caiIsXi=fuXi.indexOf(wealthWx)>=0;
    // 官杀护财能力：官杀为"偏旺及以上"（_wxStrong，与②逐神深读同档）且为喜用，能制比劫护财
    // （判定须与逐神深读同口径：十神能量占比判"为喜用有力"会与五行档打架）
    const guanGuard=guan>0 && _wxStrong(killWx) && fuXi.indexOf(killWx)>=0;
    const yinIsXi=fuXi.indexOf(yinWx)>=0;
    const shaAll=(BZ.shaYear||[]).concat(BZ.shaMonth||[],BZ.shaDay||[],BZ.shaTime||[]);
    const normSha=s=>(s||'').replace(/（[^）]+）$/,'');
    const shaNames=(...ns)=>ns.filter(n=>shaAll.some(x=>normSha(x)===n));
    // 伤官 vs 印 相对强弱：用于"伤官配印(吉)"与"印克伤官(凶)"互斥判定
    // 透干视为+1加强，使"伤官得力"与"印旺压伤官"严格互补、同盘不会既吉又凶
    const yinTot=C('正印')+C('偏印');
    const shangStrong=C('伤官')>0 && ePctC('食伤')>=ePctC('印星');   // 食伤能量占比≥印星能量占比 才算"伤官得力、印不压伤"
    // 财富层级：财星为喜用且日主能担财为富基；财旺透+官杀护财(喜用)升中富、大富。
    function wealthTier(){
      const canHold = strong || (caiIsXi && (yin>0||biOther>0||biIsXi));   // 身强、中和偏强能担，或身弱得印比生扶
      if(!caiIsXi || !canHold) return '小富须运';                          // 财非喜或身不胜财
      const caiStrong = ePctC('财星')>=REL.TH.PCT_VSTRONG || (caiTouN>=1 && ePctC('财星')>=REL.TH.PCT_POWER);   // 财星能量占比≥20%，或透干且≥12%
      const guardXi = fuXi.indexOf(killWx)>=0;                             // 官杀为<span class="tip sha-ji">喜用</span>(护财)
      if(caiStrong && caiTouN>=1 && guardXi) return '大富可期';            // 财旺透+官杀护财+身能担 → 大富
      if(caiStrong || (caiTouN>=1 && guan>0)) return '中富可期';           // 财旺或透干有官 → 中富
      return '小富可期';
    }

    // 六亲十神 → 五行（查喜忌）与喜忌判定，供第10节"助耗、依靠"单一权威结论
    // 顶层设计（第四刀）：十神名→五行用标准名精确枚举表，替代单字子串匹配（"偏财"含"财"等靠文本巧合维持，非结构保证）
    function godToWx(god){
      if(!god) return '';
      const G2W={'比肩':dwx,'劫财':dwx,'食神':shangWx,'伤官':shangWx,'偏财':wealthWx,'正财':wealthWx,'七杀':killWx,'正官':killWx,'偏印':yinWx,'正印':yinWx};
      return G2W[god]||'';
    }
    const isXi=wx=>!!wx && fuXi.indexOf(wx)>=0;
    const isJi=wx=>!!wx && fuJi.indexOf(wx)>=0;
    // 六亲助/耗/平 极性标签上色（助≈吉绿、耗≈凶红、平≈中性墨），与全站 喜忌 配色逻辑一致
    const polTag=t=>({助:kXi('助'),耗:kJi('耗'),平:kMid('平')}[t]||kMid(t));

    // ---- 组合检测 ----
    const combos=[];
    const has=new Set();
    function add(key,text){ combos.push({key,text}); has.add(key); }
    if(shang>0 && cai>0){
      if(caiIsXi) add('食伤生财','食伤生财，以才生财之象明显。');
      else if(fuJi.indexOf(wealthWx)>=0) add('食伤生财','食伤生财，但财为<span class="tip sha-xiong">忌神</span>，才艺生财宜精进、忌贪多。');
      else add('食伤生财','食伤生财，财星与喜忌无涉，以才生财、随缘取利。');
    }
    if(dwx==='木' && shangTouN>0 && fuJi.indexOf(shangWx)<0) add('木火通明','木火通明，文化明理之才。');
    // 比劫双关：禄刃为日主强根（担财之本，非外援）单列禄刃担财；外援比劫帮身（身弱、喜）与合作得财（生财路径）分列；夺财仅限身强比劫旺、财喜且无官杀护财。
    const LU={'甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
    const REN={'甲':'卯','乙':'寅','丙':'午','丁':'巳','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'};
    const selfRoot=(zhis[2]===LU[dg]||zhis[2]===REN[dg]||zhis[3]===LU[dg]||zhis[3]===REN[dg]);
    if(selfRoot) add('禄刃担财','日主自坐、临禄刃为强根，自身根基厚实，能担巨财。');
    if(weak || biIsXi) add('比劫帮身','比劫帮身，自立担当、得同辈朋友之力，合作基础在。');
    const JIE={'甲':'乙','乙':'甲','丙':'丁','丁':'丙','戊':'己','己':'戊','庚':'辛','辛':'庚','壬':'癸','癸':'壬'}[dg];
    const jieZhis=zhis.filter(z=>(HIDE[z]||[]).includes(JIE));
    if(cai>0 && caiIsXi && !weak && jieZhis.length>0 && !guanGuard){
      // 比劫夺财=分财风险（凶），合伙策略细节归"合作得财"（吉），两组分工互补不重复
      add('比劫夺财','比劫夺财，劫财（'+dedupChars(jieZhis)+'）现而财为<span class="tip sha-ji">喜用</span>、身强难制，合伙求财须防分财耗散，宜择稳定伙伴、明算账立契约、核心控股。');
    }
    // 合作得财=借比劫同辈之力生财（吉），前提：财为喜用 + 比劫可用（为喜用或身弱需帮身，与"比劫帮身"同门控）+ 生财路径佐证
    // 身旺忌比劫时比劫为忌神，借忌神之力不主合作得财，故门控须比劫为喜用或身弱（不可仅凭身强放行）
    if(caiIsXi && (biIsXi || weak) && (shangTouN>0 || has2He)) add('合作得财','合作得财（财为<span class="tip sha-ji">喜用</span>'+(biIsXi?'、比劫可用':'、比劫帮身')+(shangTouN>0?'、劫财生伤官生财':'')+'），结伴合伙开展项目易收获收益；宜设清晰分润机制（财散人聚、人聚财聚）、借伙伴之力做大盘子，惟账目契约须分明、防共富贵难。');
    if(yin>0 && C('伤官')>0 && WX_KE[yinWx]===shangWx && !shangStrong){
      const who=pillarDesc(occ,'偏印')||pillarDesc(occ,'正印')||'印星';
      if(fuJi.indexOf(shangWx)>=0) add('印克伤官','印克伤官（'+who+'克伤官），印制<span class="tip sha-xiong">忌神</span>伤官、收敛锋芒，利文书定静、宜幕后技术。');
      else add('印克伤官','印克伤官（'+who+'克伤官），才华易受压、有才难展。');
    }
    if(C('七杀')>0 && C('偏印')>0 && WX_SHENG[killWx]===yinWx && isXi(killWx)){
      const wk=T('七杀').length===0;
      add('杀印相生','杀印相生（偏印）'+(wk?'弱':'')+'成立，权势根基薄藏、有助功名'+(wk?'但弱':'')+'。');
    }
    if(C('正官')>0 && C('正印')>0 && WX_SHENG[killWx]===yinWx && isXi(killWx)){
      add('官印相生', isJi(killWx) ? '官印相生之形虽具，然官非喜用、压力重于权柄，宜以实力立身' : '官印相生（正印）成立，利文职掌权。');
    }
    if(C('伤官')>0 && C('偏印')>0 && shangStrong){
      if(isXi(yinWx)) add('伤官配印','伤官配印（偏印）成立，宜变革文职、文才技艺成名。');
      else add('伤官配印','伤官配印之形虽具，然印为忌神制伤反病、才华须防受压，宜以泄秀为主。');
    }
    if(cai>0 && guan>0 && WX_SHENG[wealthWx]===killWx){
      const wk=killTouN===0;
      if(isXi(wealthWx)&&isXi(killWx)) add('财官相生','财官相生'+(wk?'弱':'')+'成立（财官皆喜用），高位得财官相资'+(wk?'，但官杀弱藏、高位难久':'')+'。');
      else if(isJi(wealthWx)||isJi(killWx)) add('财官相生','财官相生之形虽具，然'+(isJi(wealthWx)?'财':'官')+'为忌神、财官互生亦难显贵，宜以专长立身。');
    }
    const heSha=findHe(occ,'伤官','七杀')||findHe(occ,'伤官','正官')||findHe(occ,'食神','七杀');
    if(heSha) add('伤官合杀','伤官合'+heSha.type+'（'+heSha.pair+'），考学名声之机，但需视合化喜忌方能定论。');
    const hes=allHePairs(occ);
    if(hes.length>=2) add('双合创业','双合有创业迹象（'+hes.slice(0,2).join('、')+'），善组织人缘、有独立创业之象，视合化喜忌，不主断。');
    // 克 / 反克 / 经典组合（补齐专业术语：生克、反克、经典格局，与上文顺生格局并列）
    // 枭神夺食（偏印克食神）：印克食伤之食神侧
    if(C('偏印')>0 && C('食神')>0 && WX_KE[yinWx]===shangWx){
      if(fuXi.indexOf(shangWx)>=0) add('枭神夺食','枭神夺食（偏印克食神），食神为<span class="tip sha-ji">喜用</span>被夺，才华福禄受压、求成易受阻。');
      else add('枭神夺食','枭神夺食（偏印克食神），食神<span class="tip sha-xiong">为忌</span>反被制，去忌无妨，才艺反得沉淀。');
    }
    // 贪财坏印（财克印）：财星耗印
    if(cai>0 && yin>0 && WX_KE[wealthWx]===yinWx){
      if(fuXi.indexOf(yinWx)>=0) add('贪财坏印','贪财坏印（财克印星），印为<span class="tip sha-ji">喜用</span>被财耗，名利易相妨、学业根基受扰。');
      else add('贪财坏印','贪财坏印（财克印），印<span class="tip sha-xiong">为忌</span>反被财制，去忌利求财，只须防印弱护身不足。');
    }
    // 伤官见官（伤官克正官）：食伤克官杀之正官侧，经典反克
    if(C('伤官')>0 && C('正官')>0 && WX_KE[shangWx]===killWx){
      if(fuXi.indexOf(killWx)>=0) add('伤官见官','伤官见官（伤官克正官），正官为<span class="tip sha-ji">喜用</span>被伤，恃才犯官、易生是非口舌。');
      else add('伤官见官','伤官见官（伤官克正官），正官<span class="tip sha-xiong">为忌</span>反被去，才学得伸、无官非之累。');
    }
    // 伤官驾杀（伤官克七杀）：与食神制杀并行，经典以才御压
    if(C('伤官')>0 && C('七杀')>0 && WX_KE[shangWx]===killWx){
      if(fuXi.indexOf(killWx)>=0) add('伤官驾杀','伤官驾杀（伤官克七杀），以才御压、权威更固，宜专业立身、以技掌权。');
      else add('伤官驾杀','伤官驾杀（伤官克七杀），七杀<span class="tip sha-xiong">为忌</span>反被去，压力化动力，才学得伸。');
    }
    // 官杀混杂（正官+七杀同现）
    if(C('正官')>0 && C('七杀')>0){
      if(fuXi.indexOf(killWx)>=0 && !weak) add('官杀混杂','官杀混杂（正官+七杀），身强能担则权责兼得、掌权有力，惟宜清一（去官留杀或去杀留官）以免是非牵缠。');
      else if(weak) add('官杀混杂','官杀混杂（正官+七杀），身弱压力叠加、不堪其重，宜借岁运扶身、化杀为权。');
      else add('官杀混杂','官杀混杂（正官+七杀），官杀非喜，权责不专、易生牵缠，宜守不宜攻。');
    }
    // 羊刃驾杀（须真实羊刃：日支或时支为帝旺位；仅禄非刃不算，防"有禄无刃"误断）
    const REN_ZHI={'甲':'卯','乙':'寅','丙':'午','丁':'巳','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'}[dg];
    const _hasYangRen=(BZ.zhis[2]===REN_ZHI||BZ.zhis[3]===REN_ZHI);
    if(selfRoot && _hasYangRen && C('七杀')>0){
      if(!weak) add('羊刃驾杀','羊刃驾杀（禄刃强根+七杀），以刚御刚、武职掌权之象，身强能担则权威赫然。');
      else add('羊刃驾杀','羊刃驾杀（禄刃+七杀），身弱则刚暴相争、易生是非，宜化杀为权、勿恃勇斗狠。');
    }
    // 财多身弱（财旺耗身，反克之象）
    if(ePctC('财星')>=REL.TH.PCT_VSTRONG && weak && !A.geOuter && !A.isZaGe) add('财多身弱','财多身弱，富屋贫人、见财难享，须岁运扶身或专技生财方实。');
    // 格局倾向：量化偏正占比。排除日主自身比肩（恒现，不作配置信号）
    const PIAN=['劫财','伤官','偏印','偏财','七杀'], ZHENG=['正官','正印','正财','食神'];
    function campScore(arr){ let s=0; arr.forEach(g=>{ if(qgAll.s[g].cnt>0)s++; if(['透','旺透','藏旺'].indexOf(qgAll.lv[g])>=0)s++; }); return s; }
    const pianScore=campScore(PIAN), zhengScore=campScore(ZHENG);
    let geJuType, geJuDesc;
    if(pianScore>zhengScore+1){ geJuType='偏星多'; geJuDesc='格局倾向偏星占优，宜偏业、技术自由、灵活投机之路，不宜死守正统坐班；须防路线偏散、定一主业。'; }
    else if(zhengScore>pianScore+1){ geJuType='正星多'; geJuDesc='格局倾向正星占优，格局清正，宜公职正统行业、稳守成业，利文凭与制度内晋升；不宜投机冒进。'; }
    else { geJuType='中和'; geJuDesc='格局倾向正偏兼备，文武皆宜、可正可偏，路线随大运与机遇而定。'; }
    if(geJuType==='偏星多') add('偏星多', geJuDesc);
    else if(geJuType==='正星多') add('正星多', geJuDesc);
    if(C('食神')>0 && C('七杀')>0){
      if(fuJi.indexOf(killWx)>=0) add('食神制杀','食神制杀，以技御压、专业立身之机。');
      else add('食神制杀','食神制杀，亦制<span class="tip sha-ji">喜用</span>官杀，权威易受制、宜留有余地、不宜硬压。');
    }
    if(shang>0 && cai===0 && caiIsXi) add('食伤无财','食伤无财（财为<span class="tip sha-ji">喜用</span>却不现）：才艺易落虚名，宜专精一技、以才生财。');
    const hasDisease=has.has('比劫夺财')||has.has('印克伤官')||has.has('偏星多')||has.has('食伤无财');

    // ---- 特殊结构 ----
    const specialNames=[...new Set((A.specialStruct||[]).map(s=>s.name).concat(detectGanPattern(BZ)))];
    let he6Txt='';
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
      const f6=DIZHI_HE6.find(g=>(g[0]===zhis[i]&&g[1]===zhis[j])||(g[0]===zhis[j]&&g[1]===zhis[i]));
      if(f6) he6Txt+=(he6Txt?'、':'')+zhis[i]+zhis[j]+'合化'+(f6[2]||'');
    }
    // 干支关系（命局干支、合化、特殊结构、冲害合拱）由下文"干支关系"段统一详列，首句不预述
    const specialNote=specialNames.length?('带特殊结构：'+specialNames.join('、')):(he6Txt?'无明显三合、三会、天干合化':'无明显合化结构（三合、三会、天干合化）');

    // ===== 各节正文 =====
    const sec=[];

    // 1 本命基调
    const monthZ=zhis[1], monthWx=ZHI_WX[zhiMain(monthZ)]||'';
    const monthLing=(monthWx===dwx)?('生于'+monthZ+'月得令'):('生于'+monthZ+'月');
    const geFeat=[];
    if(has.has('木火通明')) geFeat.push('木火通明');
    if(T('伤官').length>=2) geFeat.push('伤官双透');
    if(shangTouN>0) geFeat.push('食伤透干');
    if(guan>0 && killTouN===0) geFeat.push('官杀藏支');
    const geMain=geFeat.length?geFeat.join('、'):(A.geName||'');
    // 主象于事业财运之含义（简洁一句，含主象喜忌判断）：优先按命局特征，无特征按 synthesis 喜忌方向定事业主向
    //（不按格名关键字猜，外格/杂格格名多变、猜法不可靠；synthesis 已对普通/外格/杂格统一给正确喜忌）
    const _xi=fuXi, _ji=fuJi;
    const _isXi=wx=>_xi.indexOf(wx)>=0, _isJi=wx=>_ji.indexOf(wx)>=0;
    const _xg=wx=>geWxTag(wx,A);
    let _zxCareer;
    if(geFeat.includes('食伤透干')) _zxCareer='食伤透干'+(_xg(shangWx)==='忌神'||_xg(shangWx)==='从忌'?'而为忌神，才情虽显、事业宜敛锋避伤官见官之口舌':'为才情气通，可恃才艺立身、从事表达创作技艺相关之路');
    else if(geFeat.includes('伤官双透')) _zxCareer='伤官双透'+(_xg(shangWx)==='忌神'||_xg(shangWx)==='从忌'?'为忌，锋芒外露易惹是非、宜藏智守拙':'为喜用，聪慧外显、可凭智术专长取胜');
    else if(geFeat.includes('官杀藏支')) _zxCareer='官杀藏而不透'+(_isXi(killWx)?'且为喜用，名位之机隐伏、宜蓄才待运引官':'为忌神，名位暗生压力、宜静守避争');
    else if(geFeat.includes('木火通明')) _zxCareer='木火通明，文思聪颖、有为于文化传媒学问之途';
    else if(!geFeat.length){
      /* 无特征盘（格名兜底）：按"最旺十神 + synthesis 喜忌"定事业主向。
         外格（从势）时直接顺从其从喜五行之方向。 */
      const _gm=geGeMode(A);
      const _tenE={ '财星':(tenE?(tenE['正财']||0)+(tenE['偏财']||0):0), '官杀':(tenE?(tenE['正官']||0)+(tenE['七杀']||0):0), '印星':(tenE?(tenE['正印']||0)+(tenE['偏印']||0):0), '食伤':(tenE?(tenE['食神']||0)+(tenE['伤官']||0):0), '比劫':(tenE?(tenE['比肩']||0)+(tenE['劫财']||0):0) };
      const _domTen=Object.keys(_tenE).reduce((a,b)=>_tenE[b]>_tenE[a]?b:a,'财星');
      const _tenWx={'财星':wealthWx,'官杀':killWx,'印星':yinWx,'食伤':shangWx,'比劫':dwx}[_domTen];
      _zxCareer=
        _gm.isOuter ? (`从${(_xg(_tenWx)==='从喜'?'喜':'忌')}之势，事业宜顺乎从神所向、不自逆克强求`) :
        (_isXi(_tenWx)? `以${_domTen}为用（为喜用），事业宜就其势而任、择喜用之途` :
         _isJi(_tenWx)? `以${_domTen}为主然为忌，事业宜先制忌扶身、再图所用` :
         (_isXi(wealthWx)?'财星为喜用，事业财运以经营聚财为基':'事业宜择喜之所倚、因势而为'));
    }
    // 原局四正星存现：只输出缺失者，俱全则不述（"有"的信息不报）
    const _miss=[];
    if(C('正官')===0) _miss.push('正官');
    if(C('正印')===0) _miss.push('正印');
    if(C('七杀')===0) _miss.push('七杀');
    if(C('正财')===0) _miss.push('正财');
    const ganZhuNote=_miss.length?('原局缺'+_miss.join('、')+'。'):'';
    // 十神阴阳（有情无情）：官杀/财星两行，只留阴阳定性，数量与存在性原局已述不重复；与主句不同义、<br>分段；官杀财星皆不现则跳过
    const _syy=shiYinYangNote(BZ);
    sec.push('日主'+dg+'（'+dwx+'），'+monthLing+'，'+A.strength+'，<span class="tip sha-ji">喜用</span>'+fuXiStr+'、'+kJi('忌')+(fuJi.join('、')||'无')+'。本局以'+geMain+(_zxCareer?('为主，'+_zxCareer):'')+(ganZhuNote?('；'+ganZhuNote):'。')+(_syy?('<br>'+_syy):''));

    // ===== 2-6 ②相互关系，十神关系对框架 =====
    // 相生链：印星→比劫→食伤→财星→官杀→印星；相克链：印星→食伤→官杀→比劫→财星→印星
    // 每对必校验两者能量差异判反生反克（能量校验是关系下结论的前提）
    const WXOF={'印星':yinWx,'比劫':dwx,'食伤':shangWx,'财星':wealthWx,'官杀':killWx};
    const LQ={'印星':yin,'比劫':bi,'食伤':shang,'财星':cai,'官杀':guan};
    const XI=new Set(fuXi), JI=new Set(fuJi);
    // 反克典籍词（受克者旺时反制克者）：木克土，土多木折、土克水，水多土流、水克火，火多水干、火克金，金多火熄、金克木，木多金缺
    // 十神生克判定统一走 REL.ten.rel（bazi-rel.js：基础判定唯一归集处）
    const _relCtx={WXOF, LQ, XI, JI, tenE, fuXi, fuJi};
    const _pairBase=(a,b,kind)=>REL.ten.rel(_relCtx,a,b,kind);
    sec.push('');

    // 3 官杀与印星（拆：s3a 官杀深读→①总览；s3b 官印相生等组合→②相互关系）
    // 官印相生成立三条件：正官存在 + 正印存在 + 官杀为喜用（忌神官杀只主压力约束，不主掌权）
    const guanXi=isXi(killWx), guanJi=fuJi.indexOf(killWx)>=0, guanStrong=T('正官').length>0||ePctC('官杀')>=REL.TH.PCT_POWER;  // 透干或能量占比≥12% 才算有力
    // 官杀深读：先判喜忌再析意义（喜忌决定岁运引出时的吉凶方向）
    let s3a='官杀属'+killWx+'，主名位竞争，'+(guanXi?'为<span class="tip sha-ji">喜用</span>':guanJi?'为<span class="tip sha-xiong">忌神</span>':'与喜忌无涉')
      +(guan>0?(killTouN?'；透干则事业压力与名望外显、利公职竞争、掌权柄，早年中年有官贵之机':'；藏支则事业根基在支、宜稳扎，公职之路须借岁运透出，无早年官贵')
      :(guanXi?'；官杀不现、官贵之基缺，掌权须待岁运引出，引出则名利有凭':guanJi?'；官杀不现反善、少官压约束，掌权非其所图':'；官杀不现、掌权之机平淡'))
      +'。';
    // 组合判定按 key 存（供关系对断语取用：官印/杀印→官杀与印星、泄秀→比劫与食伤、伤官配印→印星与食伤）
    const s3bMap={};
    // 经典组合详述统一走 REL.classic.combo（bazi-rel.js 基础判定唯一归集处）
    // 事业视图去婚姻化：combo 文案含女命"夫星/夫缘"视角，事业卡复用时替换为掌权语境（婚姻卡的夫缘在其本卡表述，不越界）
    const careerizeCombo=t=>String(t||'').replace(/官杀（夫星）/g,'官杀（事业星）').replace(/夫缘与掌权之机/g,'掌权之机').replace(/夫缘与掌权不主此象/g,'不主掌权之象').replace(/夫缘/g,'官贵之缘');
    const yinXi=isXi(yinWx), yinJi=fuJi.indexOf(yinWx)>=0;
    const _classicCtx={C,T,fuXi,fuJi,killWx,yinWx,shangWx,dwx,isMale,guan,guanStrong,guanXi,yinXi,yinJi,shang,shangStrong,killTouN,tenE};
    ['官印相生','杀印相生','伤官配印','食伤泄秀'].forEach(n=>{ const t=REL.classic.combo(_classicCtx,n); if(t) s3bMap[n]=careerizeCombo(t); });
    sec.push(s3a);
    // 官杀为财（制不尽/财官相连，官杀转而为财）：官杀须与主位相关 + 有力而制不净或财官相连，才当财看。
    // 全部前提同判，命中才追加一句，避免文字过多。
    (function(){
      /* 恒 push（不命中时 push 空串）：后续 3神煞/4六亲/5风险预警/6职业机遇/7名利层级 组装依赖固定索引 */
      let txt='';
      if(guan>0 && cai>0){                                            // 无官杀或无财，无从论官杀为财
        const _ks=[].concat(T('正官'),T('七杀')), _kz=[].concat(godCang(occ,'正官'),godCang(occ,'七杀'));
        const _linked=_ks.some(p=>p===2||p===3)||_kz.some(p=>p===2||p===3); // 官杀透日/时干或藏日/时支=与日主相关
        const _kStrong=killTouN>0||ePctC('官杀')>=REL.TH.PCT_POWER;        // 官杀有力
        if(_linked&&_kStrong){
          // 财与官杀同结于日/时主位（同柱透干或同柱藏支）＝财官相连、紧贴
          const _cu=[].concat(T('正财'),T('偏财')), _cz=[].concat(godCang(occ,'正财'),godCang(occ,'偏财'));
          const _samePillar=(g1,z1,g2,z2)=>[2,3].some(p=>(g1.includes(p)&&g2.includes(p))||(z1.includes(p)&&z2.includes(p)));
          const _caiKillLinked=_samePillar(_ks,_kz,_cu,_cz);
          // 制不尽：有食伤制官杀而制不净（食伤能量未明显压过官杀）
          const _foodStrong=ePctC('食伤')>=ePctC('官杀')+5;
          const _zhiBuJin=shang>0&&!_foodStrong;
          if(_zhiBuJin){
            txt='官杀制不尽、去贵就富：官杀属'+killWx+'，得食伤相制而制不净，官气转财、弃名求富，财源反厚于官贵；宜以生财为实、不以逐名为先。';
          } else if(_caiKillLinked){
            txt='财官相连、官杀为财：财星与官杀同结于主位，官杀为财所统、当财看，以富为主、聚财厚实，权随财显。';
          }
        }
      }
      sec.push(txt);
    })();

    // 4 占位（sec[3] 已由上方 IIFE 恒 push 保证索引恒定；落点由逐神深读输出）
    // 5 财星与官杀富贵落点（并入"财星与官杀"相生对；财星属/个数/旺衰在逐神深读、食伤生财在组合断语、财库在职业机遇，此处不重复）
    // 财星能量占比与"旺而有根"判定保留（职业机遇财库段复用，勿删）
    let caiPct=0;
    try{ const _es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null; if(_es){ const _t=Object.values(_es).reduce((a,b)=>a+b,0)||1; caiPct=_t?Math.round((_es[wealthWx]||0)/_t*100):0; } }catch(e){}
    const caiRooted=caiIsXi&&(caiTouN||cai>=2)&&caiPct>=REL.TH.PCT_STRONG;
    const caiKuZhi=TOMB[wealthWx];
    let s5relNote='';
    if(fuXi.indexOf(killWx)>=0){
      s5relNote='财官相生（以财求贵）：财星与官杀皆为<span class="tip sha-ji">喜用</span>，财气养官、富中取贵，名利相资之象。';
    } else {
      s5relNote='官杀非<span class="tip sha-ji">喜用</span>，富贵不倚官杀，依财星与食伤自身力量成之，逢岁运引出方成其用。';
    }
    // 经典组合断语 → 所属关系对（木火通明动态归属：木行十神生火行十神，随日主五行而定，如乙木日主归"比劫与食伤"、丁火日主归"印星与比劫"）
    const _catOfWx=wx=>Object.keys(WXOF).find(c=>WXOF[c]===wx)||'';
    const PAIR_COMBOS={
      '比劫与食伤':['食伤泄秀'],
      '食伤与财星':['食伤生财'],
      '财星与官杀':['财官相生'],
      '官杀与印星':['官印相生','杀印相生'],
      '印星与食伤':['枭神夺食','印克伤官','伤官配印'],
      '比劫与财星':['比劫夺财'],
      '食伤与官杀':['伤官见官','伤官驾杀','食神制杀','伤官合杀'],
      '财星与印星':['贪财坏印'],
      '官杀与比劫':[]
    };
    const _mhKey=_catOfWx('木')+'与'+_catOfWx('火');
    if(_mhKey.indexOf('与')>0&&_mhKey.split('与')[0]!==_mhKey.split('与')[1]) (PAIR_COMBOS[_mhKey]=PAIR_COMBOS[_mhKey]||[]).push('木火通明');
    const _comboText=k=>s3bMap[k]||(has.has(k)?((combos.find(c=>c.key===k)||{}).text||''):'');
    const _pairNote=(a,b,kind)=>{
      let s=_pairBase(a,b,kind);
      if(a==='财星'&&b==='官杀'&&s5relNote) s+=' '+s5relNote;
      const extras=(PAIR_COMBOS[a+'与'+b]||[]).map(_comboText).filter(Boolean);
      if(extras.length) s+=' '+extras.join('');
      return s;
    };
    const PAIR_SHENG=[['印星','比劫'],['比劫','食伤'],['食伤','财星'],['财星','官杀'],['官杀','印星']];
    const PAIR_KE=[['印星','食伤'],['比劫','财星'],['食伤','官杀'],['财星','印星'],['官杀','比劫']];
    const shengPairs=PAIR_SHENG.map(([a,b])=>_pairNote(a,b,'sheng'));
    const kePairs=PAIR_KE.map(([a,b])=>_pairNote(a,b,'ke'));
    // 其余组合：不进关系对的 combos（帮身/合作/禄刃/双合/官杀混杂/羊刃驾杀/财多身弱/食伤无财）
    const pairKeys=new Set(Object.values(PAIR_COMBOS).flat());
    const cZhong=combos.filter(c=>c.key!=='偏星多'&&c.key!=='正星多'&&!pairKeys.has(c.key)).map(c=>c.text);
    // 6 柱位洞察（收尾段）
    const posInsight=[];
    if(C('正官')>0 && T('正官').indexOf(0)>=0){
      if(isXi(killWx)) posInsight.push('正官在年柱，早年易有官贵之机（祖上荫助）');
      else if(isJi(killWx)) posInsight.push('正官在年柱，早年压力大、官贵须借岁运方可成');
      else posInsight.push('正官在年柱，早年易有官贵之机');
    }
    if(C('正官')>0 && T('正官').indexOf(0)<0 && godCang(occ,'正官').indexOf(0)>=0){
      if(isJi(killWx)) posInsight.push('正官藏年支，早年根基受制、掌权宜借岁运透出');
      else posInsight.push('正官藏年支，掌权根基在支、宜借岁运透出');
    }
    const caiPosAll=[].concat(godTou(occ,'正财'),godTou(occ,'偏财'),godCang(occ,'正财'),godCang(occ,'偏财'));
    const guanPosAll=[].concat(godTou(occ,'正官'),godTou(occ,'七杀'),godCang(occ,'正官'),godCang(occ,'七杀'));
    if(caiPosAll.indexOf(0)>=0) posInsight.push(caiIsXi?'财星在年柱，早年祖业财丰、出身家境利财、父辈资力可倚':'财星在年柱但<span class="tip sha-xiong">为忌</span>，早年财来财去、家财宜防耗散');
    if(caiPosAll.indexOf(1)>=0) posInsight.push(caiIsXi?'财星在月柱，青年财运渐起、父母家财可助':'财星在月柱但<span class="tip sha-xiong">为忌</span>，青年财须防耗、宜独立');
    if(caiPosAll.indexOf(2)>=0) posInsight.push(caiIsXi?'财星落日支（自身宫位），财根在身、宜守成聚财':'财星落日支（自身宫位）但<span class="tip sha-xiong">为忌</span>，自身易为财所累、宜财务分明、量入为出');
    if(caiPosAll.indexOf(3)>=0) posInsight.push(caiIsXi?'财星在时柱，晚运聚财':'财星在时柱但<span class="tip sha-xiong">为忌</span>，晚运理财须防耗、宜守成');
    if(guanPosAll.indexOf(3)>=0) posInsight.push(isXi(killWx)?'官杀在时柱，掌权晚成、子女亦助':'官杀在时柱，掌权晚成、子女星<span class="tip sha-xiong">为忌</span>者晚年多为子女操心');
    if(C('食神')+C('伤官')>0){
      const shangPos=[].concat(godTou(occ,'食神'),godTou(occ,'伤官'),godCang(occ,'食神'),godCang(occ,'伤官'));
      if(shangPos.indexOf(3)>=0) posInsight.push('食伤在时柱，晚年才艺子女显');
    }
    const s6head=geJuDesc+(posInsight.length?posInsight.join('；')+'。':'');
    sec.push(''); sec.push(s6head);
    // ⑥ 十神流通关系（独立一节：以 印→身→食伤→财→官杀→印 能量循环为纲，串起各两两格局并查阻断）
    let liuTong;
    {
      const sealCnt=C('正印')+C('偏印'), killCnt=C('正官')+C('七杀');
      const chain=[];
      if(sealCnt>0) chain.push('印→身');
      if(shang>0) chain.push('身→食伤');
      if(has.has('食伤生财')) chain.push('食伤→财');
      if(has.has('财官相生')) chain.push('财→官杀');
      if(has.has('官印相生')||has.has('杀印相生')) chain.push('官杀→印');
      const chainShort = chain.map(s=>s.replace('→',''));
      let flow='本局十神，'+chainShort.join('、')+(chain.length===5?'，五环俱全':('（尚缺'+(5-chain.length)+'环'+(killCnt===0?'、官杀不现致财官官印两环难通':'')+'）'))+'。';
      if(has.has('食伤生财')) flow+='生财主链食伤生财，食伤财环节已通；';
      else flow+='食伤财未通，才艺须借岁运补财方实；';
      if(has.has('财官相生')) flow+='财官杀亦通，富可带贵；';
      else if(cai>0&&killCnt>0) flow+='财官杀皆现而未相资；';
      const blk=[];
      if(has.has('印克伤官')) blk.push('印克伤官封食伤出口');
      if(has.has('枭神夺食')) blk.push('枭神夺食封食神出口');
      if(has.has('贪财坏印')) blk.push('贪财坏印耗印根');
      if(has.has('比劫夺财')) blk.push('比劫夺财截财');
      if(blk.length) flow+='有阻断：'+blk.join('、')+'，流通有滞，须借岁运或自身调理疏通。';
      else if(chain.length===5) flow+='全链少阻断，十神流通顺遂，才干机遇易自然化为财富地位。';
      else flow+='余环待岁运引动接通，流通渐开。';
      liuTong=flow;
    }

    // 7 神煞参断事业（按事业视角取 SHA_LIFE.career 有定义者，不复读喜用格局，神煞段的完整趋向列表，避免跨模块逐字重复）
    // 同名神煞多柱命中须合并并标柱位（如"禄神（年、月柱）"），禁裸重复
    let s7;
    {
      const _m={};
      [['年',BZ.shaYear||[]],['月',BZ.shaMonth||[]],['日',BZ.shaDay||[]],['时',BZ.shaTime||[]]].forEach(([p,arr])=>{
        (arr||[]).forEach(s=>{ if(SHA_MEAN[s]&&SHA_MEAN[s].career){ if(!_m[s]) _m[s]={pos:[],n:0}; _m[s].pos.push(p); _m[s].n++; } });
      });
      const hit=Object.keys(_m).map(s=>s+(_m[s].n>1?'（'+_m[s].pos.join('、')+'柱）':'')+'（'+SHA_MEAN[s].career+'）');
      s7=hit.length?(hit.join('；')+'。'):'本局无显著相关神煞。';
    }
    if(has.has('食伤生财')||has.has('木火通明')){
      const _parts=[];
      if(has.has('食伤生财')) _parts.push('食伤生财');
      if(has.has('木火通明')) _parts.push('木火通明');
      // 收尾按本盘实际所具之"象"个性化，避免千盘一律的"才艺技艺、贵人暗助"套话
      const _tail = (has.has('食伤生财')&&has.has('木火通明')) ? '主凭才艺文采、贵人暗助而立身'
                   : has.has('食伤生财') ? '主凭才艺技艺、表达生财而立身'
                   : '主凭文采光华、明理通达而立身';
      s7+='综合：神煞助益与'+_parts.join('、')+'之象相合，'+_tail+'。';
    }
    sec.push(s7);

    // 8 纳音与十二长生（数据 + 具体情形解读，不照搬）
    const yN=nayinOf(gans[0]+zhis[0]), dN=nayinOf(gans[2]+zhis[2]);
    const yW=(NAYIN_INFO[yN]||{}).wx||'', dW=(NAYIN_INFO[dN]||{}).wx||'';
    const mN=nayinOf(gans[1]+zhis[1]), tN=nayinOf(gans[3]+zhis[3]);
    const mW=(NAYIN_INFO[mN]||{}).wx||'', tW=(NAYIN_INFO[tN]||{}).wx||'';
    // 年柱落家世根基：直取该纳音的逐条取象本义（NAYIN_INFO.d，三十条各别），不用五行合类标签压平
    const _yD=((NAYIN_INFO[yN]||{}).d||'').replace(/。$/,'');
    // 月柱、时柱：读该柱纳音相对年命纳音之向（数从 wxRel(年命,本柱)），释义取真源 NAYIN_GONG_MEAN 的 stage 字段
    //   （事业卡只言运程向背，不谈六亲称谓；六亲宫口径的 gong 字段由纳音深度模块消费）；
    //   纳音由干支查表所得，与十神体系无关，禁以纳音五行与十神五行（食伤、印、财）作等号
    const mGongMean=((NAYIN_GONG_MEAN.月||{})[wxRel(yW,mW).rel]||{}).stage||'青年运平、宜稳扎';
    const tGongMean=((NAYIN_GONG_MEAN.时||{})[wxRel(yW,tW).rel]||{}).stage||'晚运平、宜沉淀蓄势';
    const nayinNote={
      year: _yD? ('，'+_yD+'，为家世根基与先天禀赋之象') : '，家世根基平和',
      day: ((NAYIN_REL_MEAN[relShort(dwx,dW)]||{}).career)||'自我根基稳、可自立',
      month: mGongMean,
      time: tGongMean
    };
    const dayCs=[getChangSheng(dg,zhis[0]),getChangSheng(dg,zhis[1]),getChangSheng(dg,zhis[2]),getChangSheng(dg,zhis[3])];
    const xiWx0=(A.synthesis&&A.synthesis.primary&&A.synthesis.primary.wx)||fuXi[0]||'';
    const dayYang=(GAN_ORDER.indexOf(dg)%2===0);
    const xiStem=(function(){
      if(!xiWx0) return '';
      for(const g of GAN_ORDER){ if(GAN_WX[g]===xiWx0 && (GAN_ORDER.indexOf(g)%2===0)===dayYang) return g; }
      return WX_TO_STEM[xiWx0]||'';
    })();
    const xiCs=xiStem?[getChangSheng(xiStem,zhis[0]),getChangSheng(xiStem,zhis[1]),getChangSheng(xiStem,zhis[2]),getChangSheng(xiStem,zhis[3])]:['','','',''];
    let s8='年命'+nayinColorSpan(yN)+nayinNote.year+'；日柱'+nayinColorSpan(dN)+nayinNote.day+'；月柱'+nayinColorSpan(mN)+nayinNote.month+'；时柱'+nayinColorSpan(tN)+nayinNote.time+'。';
    s8+='年支'+zhis[0]+'（'+dayCs[0]+'）'+PILLAR_CS_NOTE['年'][csBucket(dayCs[0])]+'；月支'+zhis[1]+'（'+dayCs[1]+'）'+PILLAR_CS_NOTE['月'][csBucket(dayCs[1])]+'；日支'+zhis[2]+'（'+dayCs[2]+'）'+PILLAR_CS_NOTE['日'][csBucket(dayCs[2])]+'；时支'+zhis[3]+'（'+dayCs[3]+'）'+PILLAR_CS_NOTE['时'][csBucket(dayCs[3])]+'。';
    if(xiWx0) s8+='再参喜用'+xiWx0+'之长生：年支'+zhis[0]+'（'+xiCs[0]+'，'+XI_CS_NOTE[csBucket(xiCs[0])]+'）；月支'+zhis[1]+'（'+xiCs[1]+'，'+XI_CS_NOTE[csBucket(xiCs[1])]+'）；日支'+zhis[2]+'（'+xiCs[2]+'，'+XI_CS_NOTE[csBucket(xiCs[2])]+'）；时支'+zhis[3]+'（'+xiCs[3]+'，'+XI_CS_NOTE[csBucket(xiCs[3])]+'）。';
    sec.push(s8);

    // 9 刑冲害合（结构化：关系|柱位|说明，供表格呈现）
    const zhiPills={};
    zhis.forEach((z,i)=>{ (zhiPills[z]=zhiPills[z]||[]).push(PALACE[i]); });
    const pillOf=z=>zhiPills[z].join("");
    const relRows=[];
    const seenChong={}, seenHai={}, seenXing={}, seenSan={}, seenHe={};
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
      if(CHONG[zhis[i]]===zhis[j]){
        const k=[zhis[i],zhis[j]].sort().join('|');
        if(!seenChong[k]){
          seenChong[k]=true;
          // 冲的吉凶按两支五行喜忌给注：忌冲喜=喜用受损须防；喜冲忌=去忌为吉；同向/中性=通用波动
          const wa=ZHI_WX[zhis[i]]||'', wb=ZHI_WX[zhis[j]]||'';
          const aXi=fuXi.indexOf(wa)>=0, aJi=fuJi.indexOf(wa)>=0, bXi=fuXi.indexOf(wb)>=0, bJi=fuJi.indexOf(wb)>=0;
          let note='主剧烈变动、须防动荡';
          if(aXi&&bJi) note='忌神'+wb+'冲克<span class="tip sha-ji">喜用</span>'+wa+'之根，主波动、喜用受损须防';
          else if(aJi&&bXi) note='忌神'+wa+'冲克<span class="tip sha-ji">喜用</span>'+wb+'之根，主波动、喜用受损须防';
          else if(aJi&&bJi) note='忌神互冲，去忌有象、变动中亦藏转机';
          else if(aXi&&bXi) note='喜用相冲，根基相激、防喜用内耗';
          relRows.push({type:'冲',where:pillOf(zhis[i])+zhis[i]+'与'+pillOf(zhis[j])+zhis[j],note});
        }
      }
      if(HAI[zhis[i]]===zhis[j]){
        const k=[zhis[i],zhis[j]].sort().join('|');
        if(!seenHai[k]){ seenHai[k]=true; relRows.push({type:'害',where:pillOf(zhis[i])+zhis[i]+'与'+pillOf(zhis[j])+zhis[j],note:'早年与自身根基有小憾，祖业与自立间有隔'}); }
      }
      const f6=DIZHI_HE6.find(g=>(g[0]===zhis[i]&&g[1]===zhis[j])||(g[0]===zhis[j]&&g[1]===zhis[i]));
      if(f6){
        const k=[zhis[i],zhis[j]].sort().join('|');
        if(!seenHe[k]){
          seenHe[k]=true;
          const hw=f6[2]||'';
          const tag=hw?(fuXi.indexOf(hw)>=0?'（合化'+hw+'，喜用相连、助局之气）':(fuJi.indexOf(hw)>=0?'（合化'+hw+'，忌神暗增、须防其力）':'（合化'+hw+'，中性待势）')):'';
          relRows.push({type:'合',where:pillOf(zhis[i])+zhis[i]+'与'+pillOf(zhis[j])+zhis[j],note:'六合'+tag});
        }
      }
    }
    XING_G.forEach(grp=>{
      const hit=grp.filter(z=>zhis.indexOf(z)>=0);
      if(hit.length>=2){
        const k=hit.slice().sort().join('|');
        if(!seenXing[k]){ seenXing[k]=true; const pills=hit.map(z=>pillOf(z)+z).join(''); relRows.push({type:'刑',where:pills,note:'内部是非、财上有争，刑亦开库、晚运财可动'}); }
      }
    });
    SAN_HE.forEach(tri=>{
      const present=tri.filter(z=>zhis.indexOf(z)>=0);
      if(present.length===2){
        const missing=tri.filter(z=>zhis.indexOf(z)<0)[0];
        const k=present.slice().sort().join('|');
        if(!seenSan[k]){ seenSan[k]=true; const pills=present.map(z=>pillOf(z)+z).join('、'); relRows.push({type:'拱',where:pills+'拱'+missing,note:'暗成气机相资之势（缺'+missing+ZHI_WX[missing]+'）'}); }
      }
    });
    if(!relRows.some(r=>r.type==='冲')) relRows.unshift({type:'冲',where:'四柱',note:'无六冲，大局稳定，无剧烈动荡'});

    // 六亲助力（早年祖辈，中年配偶，晚年子女），统一走 REL.liuqin.judge（bazi-rel.js 基础判定唯一归集处）
    const _lqCtx={dg,gans,zhis,isMale,tenGod,godClass,godToWx,polTag,ePctC,isXi,isJi,C,T,touStr,killWx,shangWx,wealthWx,killTouN,guan,shangTouN,shang,caiIsXi};
    const _lq=REL.liuqin.judge(_lqCtx);
    let s10=_lq.s10;
    sec.push(s10);

    // 11 五行角色映射（供下方五行行业节使用），sec[11] 占位
    function wxRoleOf(wx){
      if(wx===dwx) return '比劫';
      if(wx===shangWx) return '食伤';
      if(wx===wealthWx) return '财';
      if(wx===killWx) return '官杀';
      if(wx===yinWx) return '印';
      return '';
    }
    let s11='';   // sec[11] 占位（五行行业节）
    sec.push(s11);

    // 12 财库与开库（带库者并列开库与破库二说；财星属土者另并列土库辰戌二说，取 A.muku.kuTuShuo 单一产地）
    const caiKuShuo=zhis.indexOf(caiKuZhi)>=0
      ?'局有'+wealthWx+'财库（'+caiKuZhi+'），岁运冲开则聚大成，宜把握开库之年。库逢冲开为开库之说，别派任铁樵《滴天髓阐微》谓四库之冲藏气受伤、非开反破，二说并存，其别在库中物是否为日主所需。'
      :'局无'+wealthWx+'财库（无'+caiKuZhi+'），财气多凭流转积累'+(caiRooted?'、财星<span class="tip sha-ji">喜用</span>旺而有根、财气根基充足稳定、合伙亦易得财':(caiIsXi?'、财为<span class="tip sha-ji">喜用</span>而藏支力薄、须岁运引出':'、财为<span class="tip sha-xiong">忌神</span>、以艺生财须防耗财'))+(has.has('比劫夺财')?'、合伙宜立契约明算账、财散人聚做大但防共富贵难之分财耗散':'')+'。';
    const kuTuShuo=(A&&A.muku&&A.muku.kuTuShuo)?A.muku.kuTuShuo:'';
    const juCaiShuo=fuXi.indexOf(killWx)>=0?'岁运逢'+caiKuZhi+'或逢冲之年补聚财之机。':'';
    const nvMingShuo=isMale?'':(caiIsXi?'女命此象财星为<span class="tip sha-ji">喜用</span>、主自身财丰、不倚外援以己力立身。':'女命宜专技生财、不倚外财。');
    sec.push(caiKuShuo+kuTuShuo+juCaiShuo+nvMingShuo);

    // 13 命局特征（事业视角，六亲十神→事业模式；夫星/妻星等婚姻词归婚姻卡，事业卡不混入）
    // 补四柱柱位落点，同一十神类别临多柱时"分宫位各主一面"，避免遗漏柱位、笼统带过
    let s13;
    {
      const _yinTouN=T('正印').length+T('偏印').length;
      // 柱位辅助：某十神类别临哪些柱位（天干+地支本气）；多柱时按宫位分判（年主祖辈根基人脉/月主同辈环境平台/日主自身/时主晚运传承）
      const _catPos=cat=>{
        const out=[];
        gans.forEach((g,i)=>{ if(i===2) return; const t=tenGod(dg,g); if(t&&shenCat(t)===cat) out.push(PALACE[i]+'干'); });  // 日干为日主自身，不计比劫
        zhis.forEach((z,i)=>{ const t=tenGod(dg,zhiMain(z)); if(t&&shenCat(t)===cat) out.push(PALACE[i]+'支'); });
        return out;
      };
      // 干支分治细化，天干主外显主动（象）、地支主根基内藏（基）；柱位语义按十神类别给（官杀=名位、印星=学养…），禁通用"月主同辈环境平台"错配
      const _posTxt=cat=>{
        const ps=_catPos(cat); if(!ps.length) return '';
        const _role={'官杀':'名位','印星':'学养','财星':'实业','食伤':'才艺','比劫':'同辈'}[cat]||'';
        const gs=ps.filter(p=>p[1]==='干'), zs=ps.filter(p=>p[1]==='支');
        const parts=[];
        if(gs.length) parts.push(gs.map(p=>p[0]+'干').join('、')+'透出，'+_role+'之象外显、主动');
        if(zs.length) parts.push('坐支'+zs.map(p=>p[0]+'支').join('、')+'，'+_role+'之基在支、内藏');
        return '，'+parts.join('；');
      };
      const _parts=[];
      _parts.push('官杀为事业星（掌权名位）'+(guan>0?('，命局'+guan+'个'+(killTouN?('、透'+touStr('正官')+touStr('七杀')+'，名位外显、利公职竞争掌权柄'):'、藏支，事业根基在支、宜稳扎，公职须借岁运透出')):'，命局缺，掌权名位须待岁运引出')+_posTxt('官杀'));
      _parts.push('印星为学养荫助'+(yin>0?('，命局'+yin+'个'+(_yinTouN>0?'、透干，学养有凭、利文凭学业':'、藏支，学养暗藏、宜深研内修')):'，命局缺，学养荫助偏薄、宜以实践立身')+_posTxt('印星'));
      _parts.push('财星为实业根基'+(cai>0?('，命局'+cai+'个'+(caiIsXi?'、为喜用，实业可倚、宜投资实业聚财':'、为忌神，实业须防耗、宜以专技生财')):'，命局缺，实业根基偏薄、宜以才艺立身')+_posTxt('财星'));
      _parts.push('比劫为同辈竞合'+(bi>0?('，命局'+bi+'个'+(biOther>=2?'、偏旺，同辈竞合多，合伙防分财、宜自立为主':'、有气，可借同辈之力')):'，命局缺，多凭单打独斗')+_posTxt('比劫'));
      const _comb=[];
      if(cai>0&&guan>0) _comb.push('财生官（以财求位）');
      if(guan>0&&yin>0) _comb.push('官生印（以学求名）');
      if(shang>0&&cai>0) _comb.push('食伤生财（以艺生财）');
      if(biOther>=2&&cai>0) _comb.push('比劫夺财（合伙防分）');
      s13=_parts.join('；')+'。'+(_comb.length?('命局'+_comb.join('、')+'，宜择与喜用最契者为主路深耕，余者为辅、防其偏弊，事业路径自明。'):'十神组合不显，事业以专精一技、顺势经营为主。');
    }
    sec.push(s13);

    // 14 风险提示
    const risk=[], shortc=[], falsif=[];
    if(has.has('比劫夺财')){ risk.push('比劫夺财，合伙须立契约明算账，财散人聚做大、防共富贵难之分财耗散。'); shortc.push('理财须规划（比劫夺财），忌糊涂账。'); falsif.push('比劫夺财，若合伙屡因账目不清分财耗散则印证，若立契约稳增则矛盾。'); }
    if(has.has('印克伤官')){ risk.push('印克伤官，思多行缓有才难展，宜付诸实行。'); shortc.push('不善纯台前逢迎（印克伤官主内秀），宜幕后技术。'); falsif.push('印克伤官，若闷而难展则印证，若主动外放得志则矛盾。'); }
    if(strong && yin>0){ risk.push('印星虽主长辈荫庇、利文凭学业，然身旺印反<span class="tip sha-xiong">为忌</span>，少依赖守成、宜主动外放。'); }
    if(has.has('偏星多')){ risk.push('偏星多，路线易偏散，宜定一主业，不要样样都试。'); shortc.push('不喜正统坐班，宜自由技术，但须防浮而不实。'); }
    if(has.has('食伤无财')){ risk.push('食伤无财，才艺防落虚名，须补财方实。'); shortc.push('食伤无财，宜专精一技、以才生财。'); }
    if(killTouN===0 && guan>0 && fuXi.indexOf(killWx)>=0){ risk.push('官杀弱，行政掌权根基薄，宜以专业立身、管理为辅。'); }
    if(has.has('食伤生财')) falsif.push('食伤生财，若以文创技术生财得志则印证，若久困公门则矛盾。');
    if(has.has('杀印相生')) falsif.push('杀印相生，若得权势职位则印证，若一生无职则矛盾。');
    if(has.has('木火通明')) falsif.push('木火通明，若从事文化互联网得志则印证，若重资产冷门则矛盾。');
    if(has.has('食伤无财')) falsif.push('食伤无财，若以文创技术生财得志则印证，若久无财则矛盾。');
    let s14='风险提示：'+(risk.length?risk.join(''):'本局无明显凶格，宜顺势进取。');
    // 短板：三维真实分析，并按喜忌区分“真短板（<span class="tip sha-ji">喜用</span>缺失）/ <span class="tip sha-xiong">忌神</span>不现反善 / 中性无涉”
    const rel10=['正官','七杀','正财','偏财','正印','食神','伤官'];
    const godWxOf=g=>({'正官':killWx,'七杀':killWx,'正财':wealthWx,'偏财':wealthWx,'正印':yinWx,'偏印':yinWx,'食神':shangWx,'伤官':shangWx}[g]);
    const cls=g=>{ const w=godWxOf(g); if(fuXi.indexOf(w)>=0) return 'xi'; if(fuJi.indexOf(w)>=0) return 'ji'; return 'neu'; };
    const xiShort={'正官':'官杀缺、行政掌权根基薄','七杀':'七杀缺、开拓魄力弱','正财':'正财缺、稳定财源弱','偏财':'偏财缺、外财机遇少','正印':'正印缺、学识根基弱','食神':'食神缺、安稳才艺发挥弱','伤官':'伤官缺、革新突破力弱'};
    const xiWeak={'正官':'官杀仅弱藏、掌权力待透','七杀':'七杀仅弱藏、魄力待运','正财':'正财仅弱藏、财源待透','偏财':'偏财仅弱藏、外财待运','正印':'正印仅弱藏、学识待厚','食神':'食神仅弱藏、才艺待显','伤官':'伤官仅弱藏、革新待机'};
    const jiShort={'正官':'正官（忌）不现，少管束压力、宜自在发展','七杀':'七杀（忌）不现，少开拓之险、宜稳进','正财':'正财（忌）不现，少财缚、反利专技生财','偏财':'偏财（忌）不现，少外财浮沉、财不虚耗','正印':'正印（忌）不现，少依赖守成、宜主动外放','食神':'食神（忌）不现，少安逸懈惰、宜进取','伤官':'伤官（忌）不现，少傲招忌、宜和众'};
    const jiWeak={'正官':'官杀（忌）仅弱藏，压力轻、宜自在','七杀':'七杀（忌）仅弱藏，险轻、宜稳','正财':'正财（忌）仅弱藏，财缚轻、利专技','偏财':'偏财（忌）仅弱藏，外财浮沉轻','正印':'正印（忌）仅弱藏，守成牵绊轻','食神':'食神（忌）仅弱藏，懈惰轻、宜进','伤官':'伤官（忌）仅弱藏，招忌轻、宜和'};
    const neuShort={'正官':'官杀缺，于喜忌无涉、影响平淡','七杀':'七杀缺，于喜忌无涉、影响平淡','正财':'正财缺，于喜忌无涉、影响平淡','偏财':'偏财缺，于喜忌无涉、影响平淡','正印':'正印缺，于喜忌无涉、影响平淡','食神':'食神缺，于喜忌无涉、影响平淡','伤官':'伤官缺，于喜忌无涉、影响平淡'};
    const absent=rel10.filter(g=>qgAll.lv[g]==='缺');
    const weakc=rel10.filter(g=>qgAll.lv[g]==='弱藏');
    const aXi=absent.filter(g=>cls(g)==='xi'), aJi=absent.filter(g=>cls(g)==='ji'), aNeu=absent.filter(g=>cls(g)==='neu');
    const wXi=weakc.filter(g=>cls(g)==='xi'), wJi=weakc.filter(g=>cls(g)==='ji'), wNeu=weakc.filter(g=>cls(g)==='neu');
    const sparts=[];
    if(aXi.length) sparts.push(aXi.map(g=>xiShort[g]).join('；')+'。');
    if(aJi.length) sparts.push('忌神不现，反免其扰。'+aJi.map(g=>jiShort[g]).join('；')+'。');
    if(aNeu.length) sparts.push(aNeu.map(g=>neuShort[g]).join('；')+'。');
    if(!absent.length && wXi.length) sparts.push('十神皆现，但'+wXi.map(g=>xiWeak[g]).join('；')+'。');
    if(!absent.length && wJi.length) sparts.push('（<span class="tip sha-xiong">为忌</span>之神仅弱藏、其势不彰）'+wJi.map(g=>jiWeak[g]).join('；')+'。');
    if(!absent.length && wNeu.length) sparts.push('十神皆现，但'+wNeu.map(g=>neuShort[g]).join('；')+'。');
    const posShort=[];
    if(cai>0 && caiTouN===0) posShort.push('财星全藏不透、求财须主动引动');
    if(guan>0 && killTouN===0) posShort.push('官杀全藏不透、掌权根基在支须借岁运');
    if(cai>0 && caiPosAll.length===1 && caiPosAll[0]===3) posShort.push('财星仅落时柱、早年财弱宜晚发');
    if(guan>0 && guanPosAll.length===1 && guanPosAll[0]===3) posShort.push('官杀仅落时柱、掌权晚成');
    if(posShort.length) sparts.push(posShort.join('；')+'。');
    if(shortc.length) sparts.push(shortc.join(''));
    const shortText=sparts.length?sparts.join(''):'无明显短板，宜扬长避短。';
    s14+='短板：'+shortText;
    s14+='可证伪：'+(falsif.length?falsif.join(''):'命局特征平稳，少有强可证伪断语。');
    sec.push(s14);

    // 15 名利层级
    // 判定与表述分离：内部用 v(命中、部分、弱/待运) 计算层级，p 为面向读者的直接陈述句
    function M(v,p){ return {v:v,p:p}; }
    const ck={};
    // 担财能力：身弱亦可富（得印比生扶、或从财格、或财为喜待运），非身弱即无大富
    let danCai;
    if(geGeMode(A).isOuter){
      // 外格（专旺/从格/化气）弃命从势：不以身强弱担财，只看财星是否从喜顺势
      danCai = geWxXi(wealthWx,A) ? M('hit','财星为'+geWxTag(wealthWx,A)+'、从其势则财源顺应，聚财看从神旺地') :
               (geWxJi(wealthWx,A) ? M('low','财星为'+geWxTag(wealthWx,A)+'、逆其从势不以财论命，财途当顺势而行') : M('part','财星与从势无涉，蓄财看全局顺势'));
    } else if(strong) danCai=M('hit','日主身强，能担财');
    else if(caiIsXi){
      if(yin>0||biOther>0||biIsXi) danCai=M('part','身弱得印比生扶，仍可担财，宜借力合伙');
      else if(ePctC('财星')>=REL.TH.PCT_VSTRONG && (guan>0||shang>0)) danCai=M('part','身弱财旺，似从财格，顺局可大富，仍须视全局');
      else danCai=M('part','身弱财为喜，须岁运扶身方担，宜专技以才生财');
    } else {
      danCai=M('low','身弱财非喜用、担财乏力，宜借印比岁运扶身或专技承财');
    }
    ck['担财能力']=danCai;
    ck['财星']=(cai>0&&fuXi.indexOf(wealthWx)>=0)?(caiTouN?M('hit','财星为<span class="tip sha-ji">喜用</span>，透干有根'):M('part','财星为<span class="tip sha-ji">喜用</span>，仅藏支不透、根气不深'))
      :(fuJi.indexOf(wealthWx)>=0?(_wxStrong(wealthWx)?M('low','财星虽旺而<span class="tip sha-xiong">为忌</span>、蓄财缺少根基'):M('low','财星为<span class="tip sha-xiong">忌神</span>、蓄财缺少根基'))
      :(cai>0?M('part','财星与喜忌无涉、以常经营蓄财'):M('low','财星弱或非<span class="tip sha-ji">喜用</span>，蓄财缺少根基')));
    ck['财库']=(zhis.indexOf(caiKuZhi)>=0)?M('hit','原局带'+caiKuZhi+'库，蓄财有库可开，开库聚财与破库伤藏二说并存'):M('low','原局无'+caiKuZhi+'库，蓄财缺库难开');
    // 官杀护财：细分 <span class="tip sha-ji">喜用</span>有力(hit) / 不现 / 弱(<span class="tip sha-ji">喜用</span>而力不足) / 忌(起坏作用) / 中性不为<span class="tip sha-ji">喜用</span>
    let _ghc;
    if (guanGuard) _ghc = M('hit','官杀为<span class="tip sha-ji">喜用</span>有力，能制比劫护财');
    else if (guan===0) _ghc = M('low','官杀不现，护财乏力、缺制比劫之权');
    else {
      const biDuo = has.has('比劫夺财');
      if (fuXi.indexOf(killWx)>=0) _ghc = biDuo?M('low','官杀为<span class="tip sha-ji">喜用</span>却力不足，难制比劫，钱财易被同辈分夺'):M('part','官杀为<span class="tip sha-ji">喜用</span>而力微，护财之力不足、宜借岁运引动');
      else if (fuJi.indexOf(killWx)>=0) _ghc = biDuo?M('low','官杀为<span class="tip sha-xiong">忌神</span>，难制比劫反克身添压，钱财易被同辈分夺'):M('low','官杀为<span class="tip sha-xiong">忌神</span>，护财无力、反添压力');
      else _ghc = biDuo?M('low','官杀不为<span class="tip sha-ji">喜用</span>，难制比劫，钱财易被同辈分夺'):M('low','官杀不为<span class="tip sha-ji">喜用</span>，护财之力不足');
    }
    ck['官杀护财']=_ghc;
    const diseaseList=['比劫夺财','印克伤官','偏星多','食伤无财'].filter(k=>has.has(k));
    ck['格局']=(!hasDisease)?M('hit','格局清正，无组合之病'):M('low','命局带病（'+diseaseList.join('、')+'），清浊有亏');
    ck['大运流年引动']=M('wait',(fuXi.indexOf(killWx)>=0?('宜逢'+killWx+'透出或'+fuXi.filter(w=>w!==killWx).join('、')+'旺运引动'):('宜逢'+fuXiStr+'旺运引动'))+'，方能充分兑现财势');
    const ckShenZhu=shaNames('天乙贵人','禄神','将星');
    ck['神煞助']=ckShenZhu.length?M('hit','带'+ckShenZhu.join('、')+'，神煞有助'):M('weak','神煞助不明显');
    const gk={};
    gk['官杀']=(guan>0&&fuXi.indexOf(killWx)>=0)?(killTouN?M('hit','官杀为<span class="tip sha-ji">喜用</span>，透干有根，权威有凭'):M('part','官杀为<span class="tip sha-ji">喜用</span>，仅弱藏支中，权威根基浅')):(_wxStrong(killWx)?(fuJi.indexOf(killWx)>=0?M('low','官杀虽旺而<span class="tip sha-xiong">为忌</span>，权威难立'):M('low','官杀虽旺而不为<span class="tip sha-ji">喜用</span>，权威难凭')):M('low','官杀弱或非<span class="tip sha-ji">喜用</span>，权威难立'));
    gk['官印相生']=(C('正官')>0&&C('正印')>0&&WX_SHENG[killWx]===yinWx&&isXi(killWx))?M('hit','官印相生成立（官为喜用），职权得文书印信之助'):M('low',(C('正官')>0&&C('正印')>0&&WX_SHENG[killWx]===yinWx)?'官印相生之形虽具，然官非喜用、压力重于权柄':'官印相生不备，此路不通');
    gk['杀印相生']=(C('七杀')>0&&C('偏印')>0&&WX_SHENG[killWx]===yinWx&&isXi(killWx))?(T('七杀').length===0?M('weak','杀印相生仅弱成立（七杀藏支）'):M('hit','杀印相生成立，威权得印化')):M('low',(C('七杀')>0&&C('偏印')>0&&WX_SHENG[killWx]===yinWx)?'杀印相生之形虽具，然七杀非喜用、压力重于权柄':'杀印相生不备');
    gk['印星']=(yin>0)?(fuXi.indexOf(yinWx)>=0?(_wxStrong(yinWx)?M('hit','印星为<span class="tip sha-ji">喜用</span>有力，掌舵有靠山资历之基'):M('part','印星为<span class="tip sha-ji">喜用</span>而势弱，靠山资历须借岁运')):(fuJi.indexOf(yinWx)>=0?M('low','印星为<span class="tip sha-xiong">忌神</span>，过依赖保守、反损自主，掌舵宜减依傍'):M('part','印星中和，资历助力平平'))):M('low','印星无力，靠山资历薄');
    gk['财官相生']=(cai>0&&guan>0)?(isXi(wealthWx)&&isXi(killWx)?(killTouN?M('hit','财官相生成立（财官皆喜用），财能生官、权随财显'):M('weak','财官相生成立（财官皆喜用），然官杀藏支、权势待引')):M('low','财官相生之形虽具，然'+(isJi(wealthWx)?'财':'官')+(isJi(wealthWx)||isJi(killWx)?'为忌神、财官互生亦难显权':'非喜用、财官互生难显权柄'))):M('low','财官相生不备');
    gk['比劫']=(!has.has('比劫夺财'))?M('hit','比劫不夺，权不旁落'):M('low','比劫夺财，权易旁落');
    gk['大运流年引动']=M('wait','宜逢'+fuXiStr+'旺运引动，方能充分兑现权势');
    const gkShenZhu=shaNames('天乙贵人','将星');
    gk['神煞助']=gkShenZhu.length?M('hit','带'+gkShenZhu.join('、')+'，神煞有助'):M('weak','神煞助不明显');
    const tier=wealthTier();
    // 名望潜力：名气、声望、影响力（明星、网红、学者、公众人物对应维度；含学识、人缘）
    const mk={};
    // 神煞（年/月/日/时四柱真实取用）：先列神煞，再列十神
    const wenNames=shaNames('文昌贵人','学堂');
    mk['文昌']=wenNames.length?M('hit',wenNames.join('、')+'临，文名学术有凭'):M('weak','文昌学堂不临，文名不明显');
    mk['太极']=shaNames('太极贵人').length?M('hit','太极贵人临，专业声望可期'):M('weak','太极贵人不临，专业名望不明显');
    mk['将星']=shaNames('将星').length?M('hit','将星临，权威气象有增'):M('weak','将星不显');
    // 十神：食伤、正官、印星、比劫（置于神煞之后，比劫置末）
    mk['食伤']=(shang>0)?(shangTouN?M('hit','食伤透干，才华名气外显'):M('part','食伤藏支，名须借运透出')):M('low','食伤不显，名气缺少外露之机');
    mk['正官']=(guan>0)?((killTouN||T('正官').length)?(fuJi.indexOf(killWx)>=0?M('part','正官为<span class="tip sha-xiong">忌神</span>，名誉易招是非牵缠'):M('hit','正官为名誉之象，根基尚在')):(fuJi.indexOf(killWx)>=0?M('low','正官为<span class="tip sha-xiong">忌神</span>弱藏，名誉易损'):M('part','正官弱藏，名誉根基浅'))):M('low','正官不显，名誉缺少凭依');
    mk['学识']=(yin>0)?(fuXi.indexOf(yinWx)>=0?(_wxStrong(yinWx)?M('hit','印星为<span class="tip sha-ji">喜用</span>有力，利学术深耕与资历积累'):M('part','印星为<span class="tip sha-ji">喜用</span>而势弱，学术资历宜借岁运')):(fuJi.indexOf(yinWx)>=0?M('low','印星为<span class="tip sha-xiong">忌神</span>，学业根基受扰、宜减依赖务实深耕'):M('part','印星中和，学术资历助力平平'))):((shaNames('文昌贵人','学堂').length)?M('part',shaNames('文昌贵人','学堂').join('、')+'助文名，印星宜借岁运'):M('low','学识宜培养或待岁运引出'));
    const huaNames=shaNames('桃花','红鸾','天喜');
    mk['人缘']=huaNames.length?M('hit',huaNames.join('、')+'临，人缘公众缘佳')
      :(biOther>0?(biIsXi?M('part','比劫为<span class="tip sha-ji">喜用</span>，同辈朋友相扶，人缘公众缘尚可'):(fuJi.indexOf(dwx)>=0?M('weak','比劫为<span class="tip sha-xiong">忌神</span>，同辈易生竞争牵扯，人际宜谨慎'):M('weak','比劫中和，人缘公众缘平平')))
                :M('weak','人缘平淡，公众缘不明显'));
    mk['大运流年引动']=M('wait','宜逢'+fuXiStr+'旺运引动，方能充分兑现名望');
    // 潜力分层与综合主导维度（高、中/低、待运 四档）
    function potLevel(obj){
      let hit=0, part=0, total=0;
      Object.keys(obj).forEach(k=>{
        if(k==='大运流年引动'||k==='神煞助') return;
        total++;
        const v=obj[k].v;
        if(v==='hit') hit++;
        else if(v==='part') part++;
      });
      if(total>0 && hit>=3) return '高';
      if(hit>=2 || (hit>=1&&part>=1)) return '中';
      if(hit>=1) return '低';
      return '待运';
    }
    function wealthTierLabel(t){ if(t==='大富可期')return '高'; if(t==='中富可期')return '中'; if(t==='小富可期'||t==='小富须运')return '低'; return '待运'; }
    const wlv=wealthTierLabel(tier), glv=potLevel(gk), mlv=potLevel(mk);
    const WEALTH_LINE='财富，财源积蓄之象（含实业经营、商贸贸易、金融投资、薪酬俸禄、资产积累、商业获利、财库开合相关的行业与路径）';
    const POWER_LINE='权贵，权威统御之象（含公职管理、文职行政、军警武职、专业权威、管理岗位、体制内晋升、政治贵族、商业领袖、企业掌舵相关的行业与路径）';
    const FAME_LINE='名望，声名影响之象（含学术科研、文艺创作、公众人物、教育文化、专业声望、自媒体、学术声望、社会评价相关的行业与路径）';
    // 维度内容用命盘真实数据逐条判定（与综合判定所用 ck/gk/mk 同源），不用按等级套的通用模板；大运引动在 ② 已述、神煞在 §6 已述，此处不重复
    const COREItems=obj=>Object.keys(obj).filter(k=>k!=='大运流年引动'&&k!=='神煞助').map(k=>obj[k].p).join('。');
    let s15='财富潜力（'+wlv+'，原局自发）：'+WEALTH_LINE+'。'+COREItems(ck)+'。';
    // 权贵段：官印相生/杀印相生/财官相生 三"不备"合并为一句，避免三连排比
    const gkKeys=Object.keys(gk).filter(k=>k!=='大运流年引动'&&k!=='神煞助');
    const buBei3=['官印相生','杀印相生','财官相生'].filter(k=>(gk[k]||{}).v==='low'&&String(gk[k].p).indexOf('不备')>=0);
    let gkP;
    if(buBei3.length===3){
      const rest=gkKeys.filter(k=>buBei3.indexOf(k)<0).map(k=>gk[k].p);
      gkP=rest.join('。')+(rest.length?'。':'')+'官印相生、杀印相生、财官相生皆不备，此路不通';
    } else gkP=gkKeys.map(k=>gk[k].p).join('。');
    s15+='<br>权贵潜力（'+glv+'，原局自发）：'+POWER_LINE+'。'+gkP+'。';
    s15+='<br>名望潜力（'+mlv+'，原局自发）：'+FAME_LINE+'。'+COREItems(mk)+'。';
    // 综合判定与五层外部条件
    const RANK={'高':3,'中':2,'低':1,'待运':0};
    let dom=['财富',wlv];
    [['权贵',glv],['名望',mlv]].forEach(o=>{ if(RANK[o[1]]>RANK[dom[1]]) dom=o; });
    const domLabel=dom[0];
    const needItems=[];
    [['财富',ck],['权贵',gk],['名望',mk]].forEach(([nm,obj])=>{
      Object.keys(obj).forEach(k=>{ if(obj[k].v==='low' && needItems.indexOf(k)<0) needItems.push(k); });
    });
    // 语义去重：官杀护财 与 官杀 同义，同列时保留"官杀"
    if(needItems.indexOf('官杀')>=0 && needItems.indexOf('官杀护财')>=0) needItems.splice(needItems.indexOf('官杀护财'),1);
    const guanYinStrong=has.has('官印相生');
    // 仅 pathCore 用：要求"食伤生财"是真正有利可行的路径（财为<span class="tip sha-ji">喜用</span>且食伤非忌），
    // 否则视为非优势路线、归入兜底，避免 shang>0&&cai>0 近乎逢盘必中导致句子几乎不变。
    const shangCaiStrong=has.has('食伤生财') && caiIsXi && fuJi.indexOf(shangWx)<0;
    let pathCore;
    if(guanYinStrong&&shangCaiStrong){ pathCore='专业立身、管理掌权放大其成，才财与管理相资'; }
    else if(guanYinStrong){ pathCore='凭管理掌权成事、以专业为基'; }
    else if(shangCaiStrong){ pathCore='专精技术商贸、以才生财，专业立身、管理成事'; }
    else { pathCore='专精所长、以才生财、管理为辅、顺势而成'; }
    // 财官格局小结（中性措辞，不贴绝对标签；数据驱动，折叠进"综合判定"句首）
    const caiOk = ck['财星'].v!=='low';
    const guanOk = gk['官杀'].v!=='low';
    // 旺忌/弱缺 分流：财官"不得力"的原因各盘不同，忌神旺与无力不可混写（须按能量档区分，防旺忌盘误写"财弱"）
    const caiTxt = _wxStrong(wealthWx) ? '财旺为忌' : (cai>0 ? '财星无力' : '财不现');
    const guanTxt = _wxStrong(killWx) ? '官旺为忌' : (guan>0 ? '官杀无力' : '官不现');
    let cg;
    if(geGeMode(A).isOuter){
      // 外格：不看财官得用/身强弱，只看从喜从忌顺势
      const _cT=geWxTag(wealthWx,A), _kT=geWxTag(killWx,A);
      const _cHu=_cT==='从喜', _cJi=_cT==='从忌', _kHu=_kT==='从喜', _kJi=_kT==='从忌';
      cg = (_cHu&&_kHu) ? '财官皆从喜，顺其从势则富且贵、名利皆有所归' :
           (_cJi&&_kJi) ? '财官皆为从忌，宜顺其从势避其逆、不以逆克强求' :
           (_cJi) ? '财为从忌、官与从势无涉，宜顺其势避其逆' :
           (_kJi) ? '官为从忌、财与从势无涉，宜顺其势避其逆' :
           '财官皆与从势无涉，成败系于从神与所忌，宜顺其势而行';
    } else if(caiOk && guanOk) cg='财官皆得用，求名求利皆有凭依，宜顺势进取';
    else if(!caiOk && !guanOk) cg='财官俱不得力（'+caiTxt+'、'+guanTxt+'），求财求名较费力，宜蓄力待运、以专技立身';
    else if(!caiOk) cg='财星受制、官杀尚可为，宜以职权名望带动财势，蓄财须借运';
    else cg='官杀'+(_wxStrong(killWx)?'为忌而旺':'不现或无力')+'、财星尚可为，宜以财生官、务实积财，名望须借运引动';
    s15+='<br>综合判定：'+cg+'。名利层级可期（财富、权贵、名望三维度互有高低，任一成势皆可弥补）。'
        + (needItems.length?('名利所赖'+needItems.join('、')+'等项原局不足或为忌，须五层条件叠加方能充分兑现，非原局自带。'):'原局已有基础，仍须五层条件叠加方能达其上限。');
    s15+='<br>① 原局潜力层级：财富'+wlv+'、权贵'+glv+'、名望'+mlv+'，综合以'+domLabel+'维度为主导。';
    s15+='<br>② 大运流年引动：'+(fuXi.indexOf(killWx)>=0?('逢'+killWx+'透出或'+fuXi.filter(w=>w!==killWx).join('、')+'旺运引动，财势更易兑现'):('逢'+fuXiStr+'旺运更顺，财势更易兑现'))+'。';
    s15+='<br>③ 风水合局（外部条件：居所方位、布局合<span class="tip sha-ji">喜用</span>）。';
    s15+='<br>④ 社会时代机遇（外部条件：家族出身、社交人脉、行业周期、平台资源、时代财富风口）。';
    s15+='<br>⑤ 个人经营主观能动性（内在条件：专业深耕、人脉经营、风险把控、长期投入；命理示名利上限与路径，经营决定最终落点）。';
    s15+='<br>五者齐备，名利基础才能充分兑现，也更有向上提升的空间。'+(isMale?'事业':'女命')+pathCore+'；然若得贵人提携、逢机缘巧合，亦未尝不可更进一层、名利更隆。相同八字，命运未必相同，后天努力与选择必定导致差异。';
    sec.push(s15);


    // 16 职业机遇（依格局、十神喜忌、神煞、五行综合推断；先风险后机会，置于风险预警之后、富贵层级之前）
    const shaCareer=(BZ.shaYear||[]).concat(BZ.shaMonth||[],BZ.shaDay||[],BZ.shaTime||[]); // 四柱神煞合集（将星驿马华盖多在年、月柱）
    const WX_IND={
      '木':['文教','出版','设计','林业','园艺','医药','纺织'],
      '火':['传媒','餐饮','能源','互联网','文化','化工'],
      '土':['地产','建筑','工程','地质','农业','服务'],
      '金':['金融','机械','法律','精密制造','军警'],
      '水':['贸易','物流','咨询','智慧','航海','旅游']
    };
    // 职业机遇分类（标准子平：十神职业 + 五行行业，复用既有十神、格局、神煞、喜忌、五行信号）
    const DIRS=[
      {key:'zhengguan', name:'正官，文职管理公职', gods:['正官'], combos:['官印相生','杀印相生'], sha:['将星','天乙贵人','国印贵人','禄神'], desc:'公务员、行政管理、司法文职、纪律公职、教育管理'},
      {key:'qisha', name:'七杀，武职开拓攻坚', gods:['七杀'], combos:['羊刃驾杀','食神制杀'], sha:['将星'], desc:'军警武职、外科医生、运动员、检察官、开拓创业、技术攻坚'},
      {key:'zhengyin', name:'正印，文化教育学术', gods:['正印'], combos:['官印相生','杀印相生'], sha:['文昌','学堂','词馆','国印贵人'], desc:'教师教授、科研学术、出版文化、宗教慈善、文书研究'},
      {key:'pianyin', name:'偏印，研究玄学技艺', gods:['偏印'], combos:['伤官配印'], sha:['华盖','太极贵人'], desc:'研究、玄学宗教、特殊技艺、医术、冷门专业'},
      {key:'zhengcai', name:'正财，稳定实业务农', gods:['正财'], combos:['财官相生'], desc:'稳定经营、会计金融、门店实业、务实工作、农业'},
      {key:'piancai', name:'偏财，贸易投资外交', gods:['偏财'], combos:['食伤生财','合作得财'], sha:['驿马'], desc:'贸易、投资金融、中介交际、销售、外缘财'},
      {key:'shishen', name:'食神，技艺餐饮温和', gods:['食神'], combos:['食神制杀'], sha:['文昌'], desc:'技术手艺、餐饮、温和表演、服务、工程师、厨师'},
      {key:'shangguan', name:'伤官，艺术创作才艺', gods:['伤官'], combos:['伤官配印','伤官驾杀','伤官见官'], sha:['桃花','华盖'], desc:'艺术表演、创作设计、发明、口才、作家、律师'},
      {key:'bijian', name:'比肩，合作自由同辈', gods:['比肩'], combos:['合作得财'], sha:['驿马'], desc:'合作合伙、自由业、体育竞技、同辈协作'},
      {key:'jiecai', name:'劫财，投机侠义竞技', gods:['劫财'], combos:['比劫夺财'], desc:'合作投机、自由业、竞技、侠义、风险经营'}
    ];
    function scoreDir(d){
      let sc=0; const ev=[];
      const dirGodPresent=(d.gods||[]).some(g=>C(g)>0);
      const coreJi=(d.gods||[]).some(g=>{ const wx=godToWx(g); return fuJi.indexOf(wx)>=0; });
      (d.gods||[]).forEach(g=>{
        const n=C(g); if(!n) return;
        const gwx=godToWx(g), tou=T(g).length;
        if(fuXi.indexOf(gwx)>=0){
          const gcls=(typeof shenCat==='function')?shenCat(g):g;
          const ep=ePctC(gcls);
          sc+=n*2+(tou?2:0);
          ev.push(g+(tou?'透':'')+'为<span class="tip sha-ji">喜用</span>'+(ep>=REL.TH.PCT_STRONG?'有力':(ep>=REL.TH.PCT_WEAK?'而势弱、须岁运引出':'而力微、难倚重')));
        }
        else if(fuJi.indexOf(gwx)>=0){ sc-=n*3; ev.push(g+'为<span class="tip sha-xiong">忌神</span>、不宜倚重'); }
        else { sc+=n*0.5; ev.push(g+'现而中性'); }
      });
      if(dirGodPresent && !coreJi){
        (d.combos||[]).forEach(k=>{ if(has.has(k)){
          // 按 add 时的喜忌分支给标签：忌神/之形组合不主"成立"，与正文（如伤官配印）保持一致
          const co=combos.find(c=>c.key===k);
          const bad=co&&(co.text.indexOf('之形虽具')>=0||co.text.indexOf('为忌')>=0||co.text.indexOf('不成立')>=0||co.text.indexOf('须防')>=0);
          sc+=3; ev.push(bad?(k+'之形虽具、非喜用不主此象'):(k+'成立'));
        } });
        (d.sha||[]).forEach(s=>{ if(shaCareer.indexOf(s)>=0){ sc+=1.5; ev.push(s+'照命'); } });
      }
      // 五行维度：补“<span class="tip sha-ji">喜用</span>但未现”方向（用神五行落地）。十神不现而其五行<span class="tip sha-ji">喜用</span>，仍以“可（原局无X、宜培养或待岁运引出）”呈现，与原局已具者区分；十神已现时不重复加分
      if(!dirGodPresent){
        const wx=godToWx(d.gods[0]);
        if(fuXi.indexOf(wx)>=0){ sc+=1.5; ev.push(wx+'为<span class="tip sha-ji">喜用</span>，利'+wx+'类行业，原局无'+(d.gods[0])+'、宜培养或待岁运引出'); }
        else if(fuJi.indexOf(wx)>=0){ sc-=0.5; }
      }
      return {sc, ev};
    }
    const scored=DIRS.map(d=>{ const r=scoreDir(d); return {d, sc:r.sc, ev:r.ev}; }).sort((a,b)=>b.sc-a.sc);
    function tierLab(sc){ if(sc>=8) return '高契合'; if(sc>=4) return '宜'; return '可'; }
    const ok=scored.filter(x=>x.sc>=1.5);
    const top=ok.filter(x=>tierLab(x.sc)!=='可').slice(0,6);
    const also=ok.filter(x=>tierLab(x.sc)==='可').slice(0,3);
    const notList=scored.filter(x=>{
      const neg=(x.d.gods||[]).some(g=>{ const gwx=godToWx(g); return fuJi.indexOf(gwx)>=0 && C(g)>0; });
      return neg && x.sc<2;
    }).map(x=>{
      const g=(x.d.gods||[]).find(g=>{ const gwx=godToWx(g); return fuJi.indexOf(gwx)>=0 && C(g)>0; })||'';
      return x.d.name+'（'+(g||'主星')+'<span class="tip sha-xiong">为忌</span>，不宜倚重）';
    });
    let s16='① 依格局、十神喜忌、神煞、五行综合推断。最宜发展方向（按契合度）。<br>';
    s16+=top.map(x=>(x.d.name+'（'+tierLab(x.sc)+'）：'+x.ev.slice(0,3).join('；')+'；'+x.d.desc+'。')).join('<br>');
    if(also.length) s16+='<br>亦可考虑：'+also.map(x=>{
      const note=x.ev.find(e=>e.indexOf('原局无')>=0)||x.ev[0]||'';
      return x.d.name+'（'+tierLab(x.sc)+'）'+(note?('：'+note):'');
    }).join('；')+'。';
    if(notList.length) s16+='<br>相对不宜：'+notList.join('；')+'。';
    else s16+='<br>相对不宜：本局无明显不宜之方向，惟须结合大运流年取舍。';
    const wxTag=wx=>fuXi.indexOf(wx)>=0?'利':(fuJi.indexOf(wx)>=0?'慎':'平');
    const wxLines=['木','火','土','金','水'].map(wx=>wx+wxTag(wx)+'（'+wxRoleOf(wx)+'）'+'：'+WX_IND[wx].join('、'));
    s16+='<br>② 五行行业对照（<span class="tip sha-ji">喜用</span>'+fuXiStr+'、'+kJi('忌')+(fuJi.join('、')||'无')+'）。'+wxLines.join('；')+'。';
    s16+='<br>行业成败，并非<span class="tip sha-ji">喜用</span>行业即必成、<span class="tip sha-xiong">忌神</span>行业即必败。<span class="tip sha-ji">喜用</span>行业逢<span class="tip sha-ji">喜用</span>旺运更顺；<span class="tip sha-xiong">忌神</span>行业若逢去病之运或所主十神成势，亦可成机遇。';
    s16 += dyNatalInto('事业财运', BZ, A, '③');
    sec.push(s16);

    // 组装：纯文字 7 板块
    const s8cut=sec[7].indexOf('。');
    const s8na=sec[7].slice(0,s8cut+1);
    const s8cs=sec[7].slice(s8cut+1);
    const relTxt=relRows.length?relRows.map(r=>r.type+'：'+r.where+'，'+r.note).join('；')+'。':'无显著刑冲害合。';
    // ===== 第2节，十神关系 四段式：总览 → 逐神深读 → 两两组合与流转 → 主题转译 =====
    let tenOv='', tenDeep='', tenClose='';
    try{
      const _es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
      const _et=_es?Object.values(_es).reduce((a,b)=>a+b,0):0;
      const _ea=_et/5;
      const fC={ BZ, order:['印星','比劫','食伤','财星','官杀'],
        wxOf:{'印星':yinWx,'比劫':dwx,'食伤':shangWx,'财星':wealthWx,'官杀':killWx},
        lq:{'印星':yin,'比劫':bi,'食伤':shang,'财星':cai,'官杀':guan},
        eScore:_es||{}, eTotal:_et, eAvg:_ea, xiWxSet:new Set(fuXi), jiWxSet:new Set(fuJi) };
      tenOv=tenShenOverview(fC,'career');
      tenClose=tenShenClose(fC,'career');
      const posOf=cat=>cat==='印星'?((T('正印').length+T('偏印').length)?('天干透'+touStr('正印')+touStr('偏印')):'藏支')
        :cat==='食伤'?(shangTouN?('天干透'+touStr('食神')+touStr('伤官')):'藏支')
        :cat==='官杀'?(killTouN?('天干透'+touStr('正官')+touStr('七杀')):'藏支')
        :cat==='财星'?(caiTouN?('天干透'+touStr('正财')+touStr('偏财')):'藏支')
        :(biTouN?('天干透'+touStr('比肩')+touStr('劫财')):'藏支');
      const _strOf=wx=>{ const e=(fC.eScore[wx]||0); return (e>WX_TIER_HI*_ea)?'过旺':(e>WX_TIER_LO*_ea)?'偏旺':'平和'; };
      // 逐神深读各神句尾附事业落点：食伤句带路径、比劫句带合伙与女命借力
      tenDeep=fC.order.filter(c=>(fC.lq[c]||0)>0).map(c=>{
        let _ds=tenShenDeep(fC,c,posOf(c),_strOf(fC.wxOf[c]),'career');
        if(c==='食伤'&&shang>0&&fuJi.indexOf(shangWx)<0) _ds+='可选技术、创意、自由职业或创业。';
        else if(c==='比劫'&&bi>0){
          // 比劫为喜才主张合伙；无涉/忌神不导向合伙（原 weak 条件致无涉比劫身弱盘仍"宜合伙共进"）
          if(biIsXi) _ds+='宜合伙共进'+(has.has('比劫夺财')?'、合作须明算账立契约':'')+(isMale?'。':('；女命此象宜借'+(_wxStrong(yinWx)?'朋友长辈之力':'同辈之力')+'、以自身才艺立身。'));
          else if(fuJi.indexOf(dwx)>=0) _ds+='宜自主自立、慎合伙；合作须防分财耗散'+(has.has('比劫夺财')?'、明算账立契约':'')+(isMale?'。':('；女命此象宜以自身才艺立身、少倚同辈之力。'));
        }
        return _ds;
      }).join('<br>');
    }catch(e){ if(typeof console!=='undefined') console.error('[tenShenCareer]', e.message, (e.stack||'').split('\n').slice(0,4).join(' ← ')); tenOv=''; tenDeep=''; tenClose=''; }
    const titles=['本命基调','十神关系','神煞、纳音与十二长生','六亲与命局特征','风险预警','职业机遇','名利层级'];
    const merged=[
      // 本命基调尾部并入干支关系（命局干支/合化/特殊结构/冲害合拱统一收束此段；首句不再预述"本局天干X、地支Y"；
      // 六合细节（柱位+合化喜忌）随 relRows 列于"合"行）
      sec[0]+'<br>干支关系：命局天干'+dedupChars(gans)+'、地支'+dedupChars(zhis)+'，'+specialNote+(specialNames.length?'。':'；')+relTxt,
      // ===== 第2节，十神关系 三层结构：①十神总览（总览+逐神深读+官杀深读+食伤比劫落点）→ ②相互关系（组合术语+具体关系）→ ③十神流转（流转+主题转译）=====
      // 禁止罗列重复：属/个数/透藏/旺衰只在逐神深读出现一次；相互关系只讲组合（枭神夺食/贪财坏印/官印相生等术语+生克力量喜忌损益）
      '① 十神总览：'+(tenOv||'')
      +(tenDeep?('<br>'+tenDeep):'')
      +(s3a?('<br>'+s3a):'')
      +'<br>② 相互关系：'
      // 十神关系对框架：每对换行排版（关系对独立成行，避免一坨堆叠）
      +'<br>相生组合：<br>'+shengPairs.join('<br>')
      +'<br>相克组合：<br>'+kePairs.join('<br>')
      +(cZhong.length?('<br>其余组合：<br>'+cZhong.join('<br>')):'')
      +'<br>'+s6head
      +'<br>③ 十神流转：'+liuTong
      +(tenClose?('<br>'+tenClose):''),
      '① 神煞：'+sec[6]+'<br>② 纳音：'+s8na+'<br>③ 十二长生：'+s8cs,
      '① '+sec[8]+'<br>② 命局特征：'+sec[11],
      sec[12],
      sec[14]+(sec[10]?('<br>'+sec[10]):''),
      sec[13]+(sec[9]?('<br>'+sec[9]):'')
    ];
    return merged.map((body,i)=>((i+1)+'、'+titles[i]+'<br>'+body));


  }

  window.renderCareer=renderCareer;
})();


/* ==================== 十神深读共享辅助（四卡第2节四段式）====================
 * 四卡（事业/婚姻/性格/家庭）第 2 节统一为①十神总览 → ②逐神深读 → ③两两作用 → ④主题转译。
 * 以下为纯函数共享层：总览句 / 逐神深读句（力量，透藏落宫转译，与日主关系，喜忌，卡主题落点）/ 收束句。
 * 数据驱动：只用 BZ + 各卡现有字段（lq/eScore/eAvg/xiWxSet/jiWxSet/wxOf），零新增引擎。
 * 词表与 bazi-data 十神类映射（TEN_CLASS）同源：印星=生我、食伤=我生、财星=我克、官杀=克我、比劫=同气。
 */

// ===== 四卡共享句式工厂（喜忌底色 / 神煞吉凶相参，跨卡只写一处，改一处全卡生效）=====
// 喜忌底色：`日主X（X），喜用X、忌X；`（婚姻/性格/家庭三卡本命基调第 0 句统一句式；事业卡为融合句不调用）
function xiJiBasis(dg,dwx,fuXi,fuJi){
  const fx=Array.isArray(fuXi)?fuXi.join('、'):(fuXi||'');
  const fj=Array.isArray(fuJi)?fuJi.join('、'):(fuJi||'');
  return '日主'+dg+'（'+dwx+'），喜用'+(fx||'无')+'、忌'+(fj||'无明忌')+'；';
}
// 神煞与喜忌相参：`吉煞（X、Y）临局、{good}；凶煞（X、Y）临局、{bad}、忌神之位逢之更须注意。`（无吉凶→{none}，句末统一句号）
function shaXiJiNote(good,bad,goodPhrase,badPhrase,nonePhrase){
  const g=good&&good.length?good:[], b=bad&&bad.length?bad:[];
  return '神煞与喜忌相参：'
    +(g.length?('吉煞（'+g.join('、')+'）临局、'+goodPhrase):'')
    +(g.length&&b.length?'；':'')
    +(b.length?('凶煞（'+b.join('、')+'）临局、'+badPhrase+'、忌神之位逢之更须注意'):'')
    +((!g.length&&!b.length)?nonePhrase:'')+'。';
}

// 十神类名全站统一为"印星"（正印+偏印合称；"枭"专指偏印，正印不可称枭）
// 透干柱位 → 卡主题含义（落宫转译：只列天干透出之柱；不透则由调用方给"藏支"简注）
const TEN_PILLAR_READ = {
  career: { 0:'年干透出，主早年入行、同辈相扶', 1:'月干透出，主中年事业平台、名位外显', 2:'日干透出，主自身主导、职业主见强', 3:'时干透出，主晚成之业、子嗣承业' },
  marry:  { 0:'年干透出，主早年情缘、家门之缘', 1:'月干透出，主青年婚缘、同圈相识', 2:'日干透出，主自身婚恋主见强', 3:'时干透出，主晚缘或子女带缘' },
  health: { 0:'年干透出，主先天禀性、少年心性', 1:'月干透出，主青中年心性定型', 2:'日干透出，主自身主体气质', 3:'时干透出，主晚年心性、宜静养' },
  family: { 0:'年干透出，主祖上家风', 1:'月干透出，主父母家教', 2:'日干透出，主自身持家', 3:'时干透出，主子女之教' }
};
// 藏支简注（无天干透出时，按首见藏干之柱给含义）
const TEN_ZHI_READ = {
  career: { 0:'年支藏，主祖业根基暗藏', 1:'月支藏，主事业根基在支、宜稳扎', 2:'日支藏，主自身职业根基、待岁运引', 3:'时支藏，主晚运之基暗藏' },
  marry:  { 0:'年支藏，主家门暗缘', 1:'月支藏，主婚缘暗藏、宜借岁运', 2:'日支藏，主夫妻宫暗藏、缘分隐现', 3:'时支藏，主晚缘暗藏' },
  health: { 0:'年支藏，主禀性暗藏', 1:'月支藏，主心性暗藏、环境影响渐显', 2:'日支藏，主自身气质内敛', 3:'时支藏，主晚年心性内隐' },
  family: { 0:'年支藏，主祖荫暗藏', 1:'月支藏，主家教暗藏、环境濡染', 2:'日支藏，主持家心性内藏', 3:'时支藏，主子女缘暗藏' }
};
// 卡主题落点（逐神深读第 5 要素 + 收束句用）。婚姻卡按性别取注（见下方 MARRY_THEME_NOTE），本表仅保留中性落点
const TEN_THEME_LAND = {
  career: { '印星':'学养荫庇，文凭学历与长辈提携为事业底色', '食伤':'才艺表达，技术创意口才为立业之资', '官杀':'名位规范，公职管理之业与压力并存', '财星':'财源实业，经营理财为生财之道', '比劫':'同辈合伙，竞争自立为成事之径' },
  marry:  { '印星':'伴侣心智依托，学养相近、思虑相通', '食伤':'相处锋芒，表达方式定口舌多寡', '比劫':'同辈情缘竞争，专一与边界' },
  health: { '官杀':'自律压力，责任在肩、疏解为要', '食伤':'表达宣泄，才思外放、耗神需养', '印星':'思虑滋养，学思为本、动静需衡', '财星':'务实心性，得失有度、知止为养', '比劫':'主见精力，自主自信、宜避过刚' },
  family: { '印星':'长辈荫庇管束，亲情有靠、宜立独立', '财星':'父缘家资，父缘明暗、家资厚薄', '官杀':'家教规矩，管束有度、子女宜导', '食伤':'子女才情表达，氛围宽松、天性得展', '比劫':'手足情谊，兄弟互助、防争竞' }
};
// 婚姻卡主题落点，按性别（男命财=妻星、官杀=子女星；女命官杀=夫星、财=家资养缘。
// 男命财星=妻星、官杀=子女星；女命官杀=夫星、财星=家资养缘
const MARRY_THEME_NOTE=(cat,isMale)=>(
  cat==='官杀' ? (isMale?'官杀为子女星，婚缘系子息、以责任相维':'夫星为助，关系讲规则与责任、得夫荫')
  : cat==='财星' ? (isMale?'妻星为助、家财可共济':'财星生夫缘，家资厚薄关婚姻安定')
  : cat==='印星' ? '伴侣心智依托，学养相近、思虑相通'
  : cat==='食伤' ? '相处锋芒，表达方式定口舌多寡'
  : '同辈情缘竞争，专一与边界'
);
// 婚姻卡主题落点，忌神变体（按性别）
const MARRY_THEME_NOTE_JI=(cat,isMale)=>(
  cat==='官杀' ? (isMale?'官杀为忌、子息与责任相扰，宜宽和以待':'夫星为忌、关系多管束压力，宜疏解沟通')
  : cat==='财星' ? (isMale?'妻缘与财相扰、宜财务分明':'财星为忌、家资反扰夫缘，宜分明守本')
  : cat==='比劫' ? '情缘易有同辈争合，宜专一明边界'
  : ''
);
// 比劫主题落点，忌神变体（比劫为忌时不再主张"合伙"，与附加句"宜自主自立、慎合伙"合成整句防叠句）
const TEN_THEME_LAND_JI = {
  career: { '比劫':'同辈易有竞争牵扯' },
  marry:  { '比劫':'情缘易有同辈争合，宜专一明边界' },
  health: { '比劫':'过刚易折，宜避执拗刚愎' },
  family: { '比劫':'手足易有争竞，宜分明互济' }
};
// ① 十神总览：按能量分排序最旺/最弱/缺，喜用忌神权重，失衡方向
function tenShenOverview(f, theme){
  // f: { order, wxOf, lq, eScore, eTotal, eAvg, xiWxSet, jiWxSet }
  // theme: 'career'|'marry'（跨卡差异化：同盘事实相同，收束措辞按卡主题落点，避免事业/婚姻卡①总览逐字雷同）
  const tNoun = theme==='marry' ? '婚恋' : (theme==='career' ? '事业' : '本局');
  const xiArr=Array.from(f.xiWxSet||[]), jiArr=Array.from(f.jiWxSet||[]);
  const present=f.order.filter(c=>(f.lq[c]||0)>0);
  if(!present.length) return '命局十神不显，力量无从权衡。';
  const ranked=present.slice().sort((a,b)=>(f.eScore[f.wxOf[b]]||0)-(f.eScore[f.wxOf[a]]||0));
  const pct=wx=>f.eTotal?Math.round((f.eScore[wx]||0)/f.eTotal*100):0;
  const miss=f.order.filter(c=>(f.lq[c]||0)===0);
  // 与②逐神深读同一档位（eScore 与五行均值的 WX_TIER_LO 比，e>LO*avg 即"偏旺及以上"算强档），
  // 保证①总览与②深读对同一十神的旺弱判定一致（同主体不得既判"势偏弱"又判"势旺"）
  const isStrong=wx=>(f.eScore[wx]||0)>(WX_TIER_LO||1)*(f.eAvg||0);
  const xiStrong=present.filter(c=>xiArr.includes(f.wxOf[c])&&isStrong(f.wxOf[c]));
  const xiWeak=present.filter(c=>xiArr.includes(f.wxOf[c])&&!isStrong(f.wxOf[c]));
  const jiStrong=present.filter(c=>jiArr.includes(f.wxOf[c])&&isStrong(f.wxOf[c]));
  const parts=[];
  // 最弱表述：末位者若仍属强档（占比不低），不称"最弱"改"居末、势亦不弱"（强档末位与弱档末位语义不同）
  const _first=ranked[0], _last=ranked[ranked.length-1];
  const _lastStrong=isStrong(f.wxOf[_last]);
  parts.push('十神力量以'+_first+'（'+f.wxOf[_first]+'、占全局'+pct(f.wxOf[_first])+'%）为最旺'
    +(ranked.length>1?(_lastStrong?('，'+_last+'（'+f.wxOf[_last]+'、占'+pct(f.wxOf[_last])+'%）居末、势亦不弱'):('，'+_last+'（'+f.wxOf[_last]+'、占'+pct(f.wxOf[_last])+'%）最弱')):'，其势独强')
    +(miss.length?('，'+miss.join('、')+'不现'):'')+'。');
  parts.push(xiStrong.length?(xiStrong.join('、')+'为<span class="tip sha-ji">喜用</span>而势旺，为'+tNoun+'可倚之资。')
    :(xiWeak.length?(xiWeak.join('、')+'为<span class="tip sha-ji">喜用</span>而势弱，须岁运引动方显其用。')
    :'喜用无得力者，主靠自身经营。'));
  parts.push(jiStrong.length?(jiStrong.join('、')+'为<span class="tip sha-xiong">忌神</span>而过旺，为本局主要忌力、'+tNoun+'须防其扰。'):'忌神受制或势弱，其扰有限。');
  return parts.join('');
}
// 落宫转译（透干柱位 → 卡主题含义；无透则按首见藏干之柱给藏支简注），供十神深读/四卡逐神 note 复用
function tenLuoGong(f, cat, theme){
  let luo='';
  const _cat=cat;
  try{
    const ps=[];
    f.BZ.gans.forEach((g,i)=>{ if(g && shenCat(tenGod(f.BZ.dayGan,g))===_cat) ps.push(i); });
    if(ps.length){ luo=TEN_PILLAR_READ[theme][ps[0]]||''; }
    else {
      const zp=[];
      f.BZ.zhis.forEach((z,i)=>{ if(z && (HIDE[z]||[]).some(h=>shenCat(tenGod(f.BZ.dayGan,h))===_cat)) zp.push(i); });
      if(zp.length) luo=TEN_ZHI_READ[theme][zp[0]]||'';
    }
  }catch(e){ luo=''; }
  return luo;
}
// ② 逐神深读单句：力量 + 透藏落宫转译 + 与日主关系 + 喜忌 + 卡主题落点
function tenShenDeep(f, cat, posText, str, theme){
  // f: { BZ, wxOf, xiWxSet, jiWxSet, eScore, eTotal }
  const xiArr=Array.from(f.xiWxSet||[]), jiArr=Array.from(f.jiWxSet||[]);
  const wx=f.wxOf[cat]||'';
  const xi=xiArr.includes(wx), ji=jiArr.includes(wx);
  // 平和档细分：能量占比<10% 归"平和而势弱"（消除"全局最弱 5% 也叫平和"的误导，与①总览"最弱"口径一致）
  let strF=str;
  if(str==='平和' && f.eTotal){ const pct=Math.round((f.eScore[wx]||0)/f.eTotal*100); if(pct<10) strF='平和而势弱'; }
  const luo=tenLuoGong(f, cat, theme);
  // 不标注"（生我）（我生）（我克）（同气）"，十神名本身已表生克关系，括号冗余
  let s=cat+'属'+wx+'，命局'+(f.lq[cat]||0)+'个、'+posText+'，'+strF+'，'+(xi?'为<span class="tip sha-ji">喜用</span>':ji?'为<span class="tip sha-xiong">忌神</span>':'与喜忌无涉')+'。';
  s+=luo?luo+'。':'';
  // 卡主题落点：喜用→LAND 主题句、忌神→LAND_JI 变体、喜忌无涉→不输出导向句
  // 婚姻卡按性别取注（男命财=妻、官杀=子女；女命官杀=夫、财=家资），禁"妻星（男命）/夫星（女命）"标签半句
  let _themeNote='';
  const _isMale=!!(f.BZ&&(f.BZ.sex===1||f.BZ.sex==='男'||f.BZ.sex===true));
  if(theme==='marry'){
    if(xi) _themeNote=MARRY_THEME_NOTE(cat,_isMale);
    else if(ji) _themeNote=MARRY_THEME_NOTE_JI(cat,_isMale);
  } else {
    if(xi && TEN_THEME_LAND[theme]&&TEN_THEME_LAND[theme][cat]) _themeNote=TEN_THEME_LAND[theme][cat];
    else if(ji && TEN_THEME_LAND_JI[theme]&&TEN_THEME_LAND_JI[theme][cat]) _themeNote=TEN_THEME_LAND_JI[theme][cat];
  }
  s+=_themeNote?(_themeNote+'。'):'';
  return s;
}
// ④ 主题转译收束：最旺十神 + 喜忌 → 卡主题一句话
function tenShenClose(f, theme){
  const xiArr=Array.from(f.xiWxSet||[]), jiArr=Array.from(f.jiWxSet||[]);
  const present=f.order.filter(c=>(f.lq[c]||0)>0);
  if(!present.length) return '';
  const ranked=present.slice().sort((a,b)=>(f.eScore[f.wxOf[b]]||0)-(f.eScore[f.wxOf[a]]||0));
  const max=ranked[0], wx=f.wxOf[max];
  const isXi=xiArr.includes(wx), isJi=jiArr.includes(wx);
  const strongW=isXi&&(f.eScore[wx]||0)>(WX_TIER_LO||1)*(f.eAvg||0);   // 与①总览/②深读同档位
  const tw={career:'事业',marry:'婚恋',health:'身心',family:'家庭'}[theme]||'';
  // 不重复 TEN_THEME_LAND 主题句（逐神深读已输出该神主题），收束只讲枢纽与喜忌落点，避免跨节逐字复读
  // 主导=最旺十神（力量重心）；枢纽=承上启下的流通节点（受生且施生两端皆实存），主导与枢纽是不同概念，分列判定
  const SHENG={'印星':'比劫','比劫':'食伤','食伤':'财星','财星':'官杀','官杀':'印星'};
  const hubList=present.filter(p=>present.includes(SHENG[p])&&Object.keys(SHENG).some(k=>SHENG[k]===p));
  const hub=hubList.slice().sort((a,b)=>(f.eScore[f.wxOf[b]]||0)-(f.eScore[f.wxOf[a]]||0))[0];
  let s='十神结构以'+max+'为主导（'+wx+'最旺）';
  if(hub) s+=hub===max?'，承上启下、兼为流通枢纽':'，流转之枢在'+hub;
  s+=(isXi?(strongW?('，且为喜用得势，'+tw+'以此为基、可放心倚重'):('，虽为喜用而势偏弱，'+tw+'须借岁运引出方显'))
    :(isJi?'，然为忌神，'+tw+'以此为基须防其累、宜以他神制化':'，喜忌无涉，'+tw+'以常道经营'))+'。';
  return s;
}


// 本命四大模块融入断语（纯文本，直接进段落；不另起金标块）。group 取 DUANYU_GROUPS 四大类之一。
// 上限 12 条。
// 年龄门控不限制本命四大模块，故此处取完整本命断语（stepCtx 为空）。
function dyNatalInto(group, BZ, A, num) {
  if (typeof window === 'undefined' || !window.duanyuGroup) return '';
  const blk = window.duanyuGroup(group, BZ, A, null, 12, true);
  return blk ? ('<br>' + num + ' 古籍断语：' + blk) : '';
}


/* ==================== 二、婚姻感情议题 ==================== */
/* 婚姻感情模块（renderMarry 返回 7 节字符串数组）
 * 依赖全局：baziAnalysis / tenGod / zhiMain / nayinOf / getChangSheng / HIDE / GAN_WX / ZHI_WX
 *           WX_SHENG / WX_KE / SHA_LIFE / NAYIN_INFO
 *           DIZHI_HE6 / DIZHI_SANHE / DIZHI_CHONG / DIZHI_XING / DIZHI_HAI / DIZHI_PO
 * 全部值运行时取自现有引擎，本文件不造新样式、不重复事业模块之<span class="tip sha-ji">喜用</span>忌神表述。
 * 不使用破折号、方头括号与全角括号，括号一律避免。
 */
(function(){
  'use strict';
  const PALACE=['年','月','日','时'];
  const ZODIAC={'子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪'};
  // 十神特质（具体化配偶宫、配偶星所主十神，避免空话；数据表，非写死叙述）
  const GOD_TRAIT={
    '正官':'端正自律、重规则名分，宜以礼相待',
    '七杀':'锐利有张力、带压力或偏缘，宜沟通包容、化压力为动力',
    '正财':'务实稳重、重实际利益，相处宜明算账、财务分明',
    '偏财':'外向灵动、善交际之性，情缘易外露、需专一',
    '食神':'温和包容、重情调才艺，关系中多付出、宜被欣赏',
    '伤官':'聪慧锋利、主见强，易与关系生口舌、宜婉转相待',
    '正印':'温厚包容、主荫助，关系得精神滋养',
    '偏印':'内敛善思、偏执，宜给彼此空间',
    '比肩':'平等朋友型，相处平顺、宜共同承担',
    '劫财':'主动争进、易竞争，相处宜防争执、明界限'
  };
  // 五行 → 利、忌方位（WX_FANG 取自 bazi-data.js 全局）
  // 五行 → 旺运地支（运程切换提示用）
  const WX_BRANCH={'木':'寅卯','火':'巳午','土':'辰戌丑未','金':'申酉','水':'亥子'};
  // 地支关系 → 具体含义（仅对命中的关系输出）
  const REL_MEAN={'冲':'两人气场对立、容易发生冲突和变动','合':'彼此吸引、关系容易成','刑':'关系里有内耗和摩擦','害':'暗中相耗、易生隔阂','破':'关系有破散、不稳定'};
  // 六合合化五行（夫妻宫被合时，合化会增强夫妻宫某五行气）
  const HEHUA={'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'土'};
  function heHua(z,o){ return HEHUA[z+o]||HEHUA[o+z]||''; }
  // 合化与合绊判定：化神得月令（本气即化神，或月令生化神）则合化，否则合而不化（合绊）
  function heHuaState(b1,b2,monthZ){
    const hua=heHua(b1,b2); if(!hua) return '';
    const mwx=ZHI_WX[monthZ];
    if(mwx===hua) return '月令'+monthZ+'本气即'+hua+'，化神当令，合而能化（'+b1+b2+'合化'+hua+'，夫妻宫'+hua+'气因合而聚）';
    if(WX_SHENG[mwx]===hua) return '月令'+monthZ+'本气'+mwx+'生'+hua+'，化神得生助，能合化（'+b1+b2+'合化'+hua+'，夫妻宫'+hua+'气因合而聚）';
    return '月令'+monthZ+'本气'+mwx+'不助'+hua+'，合而不化（合绊），夫妻宫与被合之支彼此牵绊、缘分受牵动却难尽情融洽';
  }
  // 他柱与夫妻宫发生关系时所在柱位的命理含义（用于“跟谁合、哪个位置”的说明）
  // 四柱对应统一读顶层真源 PILLAR_MAP（bazi-data.js）：柱位主 六亲宫位、神煞落宫
  function _pillarMean(i){
    const _PM=window.PILLAR_MAP||{}, k=['年柱','月柱','日柱','时柱'][i], o=_PM[k];
    return o?(k+'主'+o.六亲宫位+'、'+o.神煞落宫):'';
  }
  // 地支关系统一走 REL.gz（bazi-rel.js 基础判定唯一归集处）；薄封装维持调用点不变。
  function pairIn(a,b,arr){ return arr.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)); }
  function zhiRelToPillars(z, pz){ return REL.gz.zhiToPillars(z, pz); }
  // 两支配对关系（返回 冲、合/刑、害/破 类型，仅用术语、不转译）
  function relBetween(a,b){ return REL.gz.between(a,b); }
  // 十二长生（配偶宫）解释：统一读顶层真源 CS_MEAN_ALL（bazi-data.js，marry 字段）


  function renderMarry(BZ){
    const A=getAnalysis(BZ);
    const dg=BZ.dayGan, dwx=GAN_WX[dg];
    // 某五行相对日主的关系（生我、我生、克我、我克、比和）→ 十神象
    const zM=zhiMain(BZ.dayZ);
    const zMwx=GAN_WX[zM];
    const spouse=spouseStarOf(BZ);
    const isMale=(BZ.sex===1||BZ.sex==='男'||BZ.sex===true);
    const fuXi=effXi(A).slice();
    const fuJi=effJi(A).slice();
    const fuXiStr=fuXi.join('、');
    // 十神五行（相对日主）
    const shangWx=WX_SHENG[dwx], wealthWx=WX_KE[dwx];
    const yinWx=Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===dwx)||'';
    const killWx=Object.keys(WX_KE).find(w=>WX_KE[w]===dwx)||'';
    function wxRoleOf(wx){
      if(wx===dwx) return '比劫';
      if(wx===shangWx) return '食伤';
      if(wx===wealthWx) return '财';
      if(wx===killWx) return '官杀';
      if(wx===yinWx) return '印';
      return '';
    }
    const wxTag=wx=>fuXi.indexOf(wx)>=0?'利':(fuJi.indexOf(wx)>=0?'慎':'平');
    // 配偶星五行（男=财 / 女=官杀）
    const spouseStar=isMale?['正财','偏财']:['正官','七杀'];
    const spouseWx=isMale?wealthWx:killWx;
    const pz=[BZ.yearZ,BZ.monthZ,BZ.dayZ,BZ.timeZ];
    // 配偶星（正、偏）在四柱出现：天干透出 + 地支本气 + 地支藏干，按正先于偏、柱序排序
    const spGodOrder={'正官':0,'七杀':1,'正财':0,'偏财':1};
    const fmtSpLoc=o=> o.main ? (o.label+'为'+o.god) : (o.label+'藏'+o.god);
    const spLocs=[];
    BZ.gans.forEach((g,i)=>{ const t=tenGod(dg,g); if(spouseStar.indexOf(t)>=0) spLocs.push({god:t, pillar:i, label:PALACE[i]+'干'+g, tou:true, main:false}); });
    pz.forEach((z,i)=>{
      const main=zhiMain(z), tm=tenGod(dg,main);
      // 地支本气/藏干皆非"透干"（tou=false）；日支本气配偶星=宫星一体近身，由 main 字段标记
      if(spouseStar.indexOf(tm)>=0) spLocs.push({god:tm, pillar:i, label:PALACE[i]+'支'+z+'本气'+main, tou:false, main:true});
      (HIDE[z]||[]).forEach(hg=>{ if(hg===main) return; const th=tenGod(dg,hg); if(spouseStar.indexOf(th)>=0) spLocs.push({god:th, pillar:i, label:PALACE[i]+'支'+z, tou:false, main:false}); });
    });
    spLocs.sort((a,b)=>(spGodOrder[a.god]-spGodOrder[b.god])||(a.pillar-b.pillar));
    const spouseTou=spLocs.filter(o=>o.tou);
    const spouseTouCount=spouseTou.length;
    const hasSpouse=spLocs.length>0;
    const spouseXi=fuXi.indexOf(spouseWx)>=0, spouseJi=fuJi.indexOf(spouseWx)>=0;
    const shaAll=(BZ.shaYear||[]).concat(BZ.shaMonth||[],BZ.shaDay||[],BZ.shaTime||[]);
    const normSha=s=>(s||'').replace(/（[^）]+）$/,'');
    const shaNames=(...ns)=>ns.filter(n=>shaAll.some(x=>normSha(x)===n));
    const dayRel=zhiRelToPillars(BZ.dayZ, pz);
    // 配偶星临支的刑冲害合破在 ④配偶星关系 内联展开（非日支；日支关系归⑤夫妻宫关系），此处不另建
    // 某五行在四柱的具象落点（供流通、宫星流转指出具体干支，不写死叙述）
    function elemLocs(wx){
      const out=[];
      BZ.gans.forEach((g,i)=>{ if(GAN_WX[g]===wx) out.push(PALACE[i]+'干'+g); });
      pz.forEach((z,i)=>{
        const main=zhiMain(z); if(GAN_WX[main]===wx) out.push(PALACE[i]+'支'+z+'本气'+main);
        (HIDE[z]||[]).forEach(hg=>{ if(GAN_WX[hg]===wx) out.push(PALACE[i]+'支'+z+'藏'+hg); });
      });
      return out;
    }
    // 五行力量（本气1.0 + 藏干0.3），用于比较配偶星与日主强弱（数据驱动，不写死）
    function elemCount(wx){
      let s=0;
      BZ.gans.forEach(g=>{ if(GAN_WX[g]===wx) s+=1.0; });
      pz.forEach(z=>{
        const main=zhiMain(z); if(GAN_WX[main]===wx) s+=1.0;
        (HIDE[z]||[]).forEach(hg=>{ if(GAN_WX[hg]===wx) s+=0.3; });
      });
      return s;
    }
    // 远近：配偶星所临柱位按离日主（日支）远近加权；时柱主晚运、年柱主早年家门
    const spPillars=[...new Set(spLocs.map(o=>o.pillar))].sort((a,b)=>Math.abs(a-2)-Math.abs(b-2));
    const spDistWord=i=> i===2?'最近（坐夫妻宫、正缘贴身）'
      : i===1?'较近（同环境缘分）'
      : i===3?'偏晚或较远（时柱主晚运、子女，缘分偏晚或与晚景相连）'
      : '最远（年柱主早年家门，可能异地、长辈牵线、年纪差较大）';

    // 打分工具（与 career 同构）：v 为判定(hit/part/low/weak/wait)，p 为直接陈述句
    function potLevel(obj){
      let hit=0, part=0, total=0;
      Object.keys(obj).forEach(k=>{
        if(k==='大运流年引动'||k==='大运引动'||k==='神煞助') return;
        total++;
        const v=obj[k].v;
        if(v==='hit') hit++;
        else if(v==='part') part++;
      });
      if(total>0 && hit>=3) return '高';
      if(hit>=2 || (hit>=1&&part>=1)) return '中';
      if(hit>=1) return '低';
      return '待运';
    }
    const RANK={'高':3,'中':2,'低':1,'待运':0};

    const sec=[];

    // ===== 1 本命基调（婚姻维） =====
    // 注：<span class="tip sha-ji">喜用</span>忌神已在命局总览、事业模块表述，本小节不重复，仅定位婚姻维度
    // 配偶星具名到具体天干（正先于偏）
    const spGans=Object.keys(GAN_WX).filter(g=>GAN_WX[g]===spouseWx);
    const spNamed=spGans.map(g=>({g, t:tenGod(dg,g)})).sort((a,b)=>(spGodOrder[a.t]-spGodOrder[b.t]));
    const spStr=spNamed.map(o=>o.g+spouseWx+o.t).join('、');
    let s1=xiJiBasis(dg,dwx,fuXi,fuJi)+'夫妻宫（日支'+BZ.dayZ+'）本气'+zM+'为'+spouse+'；配偶星为'+(isMale?'财星':'官杀')+'，'+spStr+'。';
    sec.push('1、本命基调<br>'+s1);

    // ===== 2 配偶星与夫妻宫 =====
    // ① 夫妻宫主象与配偶星定位（宫星是否一体、具体十神特质、透藏与远近）
    const offName=isMale?'财':'官';
    const spName=isMale?'财星':'官杀';
    const godTrait=GOD_TRAIT[spouse]||'';
    let marryCore = (zMwx===spouseWx)
      ? '夫妻宫本气'+zM+'即'+spouse+'，宫星一体，配偶特质与婚姻底盘重合，'+godTrait+'。'
      : '夫妻宫本气'+zM+'为'+spouse+'，日主'+offName+'不在夫妻宫本位，宫星错位，婚姻底盘与'+offName+'星状态不完全重合；配偶特质为'+spouse+'，'+godTrait+'。';
    let marryKey='配偶星'+offName+'所临：';
    if(spLocs.length){
      const touOnes=spLocs.filter(o=>o.tou), cangOnes=spLocs.filter(o=>!o.tou);
      if(touOnes.length) marryKey += touOnes.map(o=>o.god+'透于'+o.label).join('、')+'，透出者明现、主动、缘分显性；';
      if(cangOnes.length){
        const bqi=cangOnes.filter(o=>o.main), can=cangOnes.filter(o=>!o.main);
        const parts=[];
        if(bqi.length) parts.push(bqi.map(fmtSpLoc).join('、'));
        if(can.length) parts.push(can.map(fmtSpLoc).join('、')+'，暗藏者隐性、须岁运引动方显');
        marryKey += parts.join('；')+'。';
      }
    } else {
      marryKey += '四柱不透不藏，缘分浅、多靠岁运引动方现。';
    }
    const spouseXiJi=!hasSpouse?(offName+'星属'+spouseWx+'，四柱不透不藏、局中无配偶星，其力虚浮，得助与否须看岁运引动方显。')
      : spouseXi?(offName+'星为<span class="tip sha-ji">喜用</span>，能得到配偶的帮助或助益。')
      : spouseJi?(offName+'星<span class="tip sha-xiong">为忌</span>，婚姻容易和'+(isMale?'钱财':'名位')+'相关的事牵扯、产生摩擦，需要财务分明、各守本分。')
      : (offName+'星在喜忌上无涉，影响平淡。');
    // ② 配偶星关系（喜忌+位置（点明天干不透/地支暗藏）→ 宫位（直接标注透干/藏支本气/余气）
    // → 正偏分论（正星=正缘、偏星=偏缘，偏星坐日支=占正缘位）→ 能量（正偏各判）→ 散现 → 生克 → 地支关系
    // → 力量对比 → 食伤/比劫 → 流通（顶层 flowChain5）；每步分段，禁长坨）
    const spTouList=spouseTou.map(o=>o.god+'于'+o.label).join('、');
    const dayStrong=A.strength||'';
    const shangSelf=elemCount(shangWx);
    // 五行能量分（与②十神总览/逐神深读同源 wxElementScore，禁按十神个数判能量）
    const _esM=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
    const _etM=_esM?Object.values(_esM).reduce((a,b)=>a+b,0):0;
    const _eaM=_etM/5||1;
    const eSp=_esM?(_esM[spouseWx]||0):0, eDay=_esM?(_esM[dwx]||0):0;
    const pctSp=_etM?Math.round(eSp/_etM*100):0;
    const tierSp=eSp>WX_TIER_HI*_eaM?'过旺':(eSp>WX_TIER_LO*_eaM?'偏旺':'平和');
    // 十神能量分（正偏分开，供正偏分论：正缘/偏缘各自强弱）
    const _tenE=(typeof ssTenGodEnergy==='function')?ssTenGodEnergy(BZ, _esM||{}):null;
    const zhengName=isMale?'正财':'正官', pianName=isMale?'偏财':'七杀';
    const eZheng=_tenE?(_tenE[zhengName]||0):0, ePian=_tenE?(_tenE[pianName]||0):0;
    const weakPct=x=>x>1e-6 && x/_etM<0.10;   // 占比<10% 即"偏弱"
    let s2_2='② 配偶星关系：';
    const spLocsStr=spPillars.map(i=>{
      const parts=[];
      if(spLocs.some(o=>o.pillar===i&&o.tou)) parts.push(PALACE[i]+'干');
      if(spLocs.some(o=>o.pillar===i&&!o.tou)) parts.push(PALACE[i]+'支');
      return parts.join('、');
    }).join('、');
    if(hasSpouse){
      // ① 喜忌先行（先判喜忌再析意义）+ 位置（点明天干不透、地支暗藏）
      s2_2 += spName+'属'+spouseWx+'，'+(spouseXi?'为<span class="tip sha-ji">喜用</span>，婚姻得助、缘可倚':spouseJi?'为<span class="tip sha-xiong">忌神</span>，婚姻易与'+(isMale?'钱财':'名位')+'相扰、须分明':'与喜忌无涉、影响平淡')+'。';
      s2_2 += spName+'临'+spLocsStr+'，'+(spouseTou.length?'天干透出、缘分外显':'天干不透、地支暗藏')+'。';
      // ② 宫位：每柱直接标注 透干/藏支本气/藏支余气（禁绕圈），情感早晚按透藏分述（禁"藏支却断恋爱早而多"）
      const _touAt=i=>spLocs.some(o=>o.pillar===i&&o.tou);
      const _posOfPillar=i=>{
        const at=spLocs.filter(o=>o.pillar===i);
        if(!at.length) return '';
        if(at.some(o=>o.tou)) return '透干';
        if(at.some(o=>o.main)) return '藏支本气';
        return '藏支余气';
      };
      const _timeNote={
        0:(t)=>t?'主情感启蒙早、早年情愫多，少年之缘多属懵懂、未必为正缘，或长辈牵线':'主早年情愫暗藏、多属心动未表露，须岁运引动方显',
        1:(t)=>t?'主青年情缘显、恋爱较早而多，同窗同乡同龄之缘':'主青年情缘暗蓄、心动，实缘须岁运引动',
        2:()=>'坐夫妻宫、正缘贴身、宫星一体、婚姻底盘稳',
        3:(t)=>t?'主晚缘明现、或与晚景相连':'主晚缘暗藏、须引动方显'
      };
      s2_2 += '<br>宫位：'+spPillars.map(i=>PALACE[i]+'柱'+spName+_posOfPillar(i)+'，'+(_timeNote[i](_touAt(i))||'')).join('；')+'。';
      // ③ 正偏分论：正星=正缘（配偶）、偏星=偏缘（情人/偏缘）；偏星坐日支=偏缘占正缘之位、正缘迟迟不到位
      const _posBrief=arr=>arr.length?arr.map(o=>(o.tou?o.label+'透干':(o.main?o.label:o.label+'藏余气'))).join('、'):'不现';
      const zhengLocs=spLocs.filter(o=>o.god===zhengName), pianLocs=spLocs.filter(o=>o.god===pianName);
      const zhengTxt=zhengLocs.length
        ? (zhengLocs.some(o=>o.pillar===2)?zhengName+'（正缘）'+_posBrief(zhengLocs)+'，坐夫妻宫、正缘到位'
          : zhengLocs.some(o=>o.tou)?zhengName+'（正缘）'+_posBrief(zhengLocs)+'，正缘明现、缘分显性'
          : zhengName+'（正缘）'+_posBrief(zhengLocs)+'，正缘暗藏'+(weakPct(eZheng)?'、气微':'')+'，须岁运引出方成')
        : zhengName+'（正缘）不现、正缘虚浮';
      const pianTxt=pianLocs.length
        ? (pianLocs.some(o=>o.pillar===2)?pianName+'（偏缘）'+_posBrief(pianLocs)+'，坐夫妻宫，偏缘（情人）占据正缘之位，正缘迟迟难以到位'
          : pianLocs.some(o=>o.tou)?pianName+'（偏缘）'+_posBrief(pianLocs)+'，偏缘明现而不占宫位、无碍正缘'
          : pianName+'（偏缘）'+_posBrief(pianLocs)+'，偏缘暗藏、不占宫位、无碍正缘')
        : pianName+'（偏缘）不现、偏缘虚浮';
      s2_2 += '<br>正偏：'+(isMale?'正财为妻缘、偏财为偏缘（情人）':'正官为夫缘、七杀为偏缘（情人）')+'。'+zhengTxt+'；'+pianTxt+'。';
      // ④ 能量（正偏各自判 + 五行总档；禁只看数量位置）
      s2_2 += '<br>能量：'+zhengName+'（正缘）能量分'+Math.round(eZheng)+'、'+pianName+'（偏缘）能量分'+Math.round(ePian)+'，'
        +((eZheng+ePian)<=0?'皆不现、缘分虚浮'
          :((weakPct(eZheng)&&weakPct(ePian))?'皆偏弱（'+spouseWx+'气总能量分'+Math.round(eSp)+'、占全局'+pctSp+'%），正缘偏缘缘分皆低，须岁运引动方有成缘之机'
          :(eZheng>ePian?'正缘之力大于偏缘，正缘为主、宜专一守正':(ePian>eZheng?'偏缘之力大于正缘，须防偏缘分心、正缘受扰':'正偏之力相当、缘线易杂，宜专一')))
          )+'。';
      // ⑤ 散现多柱
      if(spPillars.length>=2) s2_2+='<br>'+spName+'散现多柱'+(spTouList?'、感情线较多':'而俱藏支，心动暗缘多、实缘待引')+'，宜专一防分心。';
      else if(spPillars[0]===2) s2_2+='<br>'+spName+'独坐夫妻宫，缘分专一、底盘集中。';
      // ⑥ 生克两两关系（一句一条）
      const srcWx=Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===spouseWx)||'';   // 生配偶星者
      const keWx=Object.keys(WX_KE).find(w=>WX_KE[w]===spouseWx)||'';           // 克配偶星者
      const xieWx=WX_SHENG[spouseWx]||'';                                       // 配偶星所生（耗泄）
      const srcCnt=elemCount(srcWx), keCnt=elemCount(keWx), xieCnt=elemCount(xieWx);
      const _pairs=[];
      if(srcCnt>0) _pairs.push(srcWx+'（'+wxRoleOf(srcWx)+'）生'+spouseWx+'，'+(srcCnt>=1.5?'得生得力、缘有滋养':'得生偏弱、滋养不足'));
      if(keCnt>0) _pairs.push(keWx+'（'+wxRoleOf(keWx)+'）克'+spouseWx+'，'+(keCnt>=1.5?'受克明显、缘分有制':'受克轻微、影响有限'));
      if(xieCnt>0) _pairs.push(spouseWx+'生'+xieWx+'（'+wxRoleOf(xieWx)+'），'+(xieCnt>=1.5?'泄耗偏重、宜防缘散':'泄耗轻微'));
      s2_2 += '<br>生克：'+( _pairs.length?_pairs.join('；')+'。':'配偶星少生扶克制、缘较平。');
      // ⑦ 地支刑冲害合破：配偶星临支（非日支，日支关系归⑤夫妻宫关系，防跨子项重复）与命局他支
      const _sbPD=[...new Set(spLocs.filter(o=>o.pillar!==2).map(o=>o.pillar))];
      if(_sbPD.length){
        const _rels=[];
        _sbPD.forEach(pi=>{
          [0,1,3].forEach(j=>{
            if(j<=pi) return;
            const _ts=relBetween(pz[pi],pz[j]);
            if(!_ts.length) return;
            let _tail='';
            if(_ts.indexOf('合')>=0){
              // 合（可兼破：寅亥/巳申为合中带破），并注合化五行喜忌
              const _hwz=heHua(pz[pi],pz[j]);
              _tail='相合'+(_ts.indexOf('破')>=0?'（合中带破）':'')
                +(_hwz?(fuXi.indexOf(_hwz)>=0?'，合化'+_hwz+'为喜、缘得聚合':fuJi.indexOf(_hwz)>=0?'，合化'+_hwz+'为忌、缘被绊滞':'，合化'+_hwz+'、缘势中性'):'，合而不化、缘分受其牵动');
            } else if(_ts.indexOf('冲')>=0){
              _tail='相冲，'+(spouseXi?'配偶星为喜用、根气受冲、缘分易波动，宜稳守':spouseJi?'配偶星为忌神、根气受冲、反减其扰':'根气受冲、缘分易波动');
            } else {
              const r=_ts[0];
              _tail='相'+r+'，'+(spouseXi?'配偶星根气受'+r+'、缘分有暗损，宜经营护持':spouseJi?'配偶星根气受'+r+'、反减其势':'缘分有暗损');
            }
            _rels.push(PALACE[pi]+'支'+pz[pi]+'与'+PALACE[j]+'支'+pz[j]+_tail+'。');
          });
        });
        if(_rels.length) s2_2 += '<br>地支关系：'+_rels.join('');
      }
      // ⑧ 日主与配偶星力量对比（能量分定谁主导，禁数量判强弱）
      s2_2 += '<br>日主'+dwx+'，'+dayStrong+'，'+(WX_KE[spouseWx]===dwx
        ? (eSp>eDay?'配偶星克日主而势强，关系中约束感偏重，宜沟通化解、化压为助':eDay>eSp?'日主势强、配偶星克之不及，关系中日主主导、宜柔和相待':'双方能量相当、有张力可调和')
        : (eSp>eDay?'配偶星势强于日主，然日主克之、尚可制衡，宜柔济刚、互尊互让':eDay>eSp?'日主势强、克之有余，关系中日主占主动，宜防独断、互尊互让':'双方能量相当，约束与自主相抵、有张力可调和'))+'。';
      // ⑨ 食伤/比劫（一句一条）
      if(shangSelf>=1.0){
        s2_2 += '<br>'+( !isMale ? '食伤克'+spName+'（伤官见官），锋芒易与对方生口舌、不服管束，宜以柔化解。' : '食伤生'+spName+'，才艺生财滋养情缘、姻缘有才情助力。');
      }
      const biLocs2=elemLocs(dwx);
      if(biLocs2.length) s2_2 += '比劫与日主同气、亦克'+spName+'，同辈易争偶、财缘易分，须专一明边界。';
      // ⑩ 流通：顶层 flowChain5 五行十神相生链（具体化，禁"无显著流通之链"套话）
      const _fc5=(typeof window!=='undefined'&&window.flowChain5)?window.flowChain5(BZ, _esM||{}):null;
      let _flowTxt=_fc5?_fc5.text:'';
      if(_flowTxt&&(eSp>1e-6)){
        const _srcTxt=srcCnt>0?('，得'+srcWx+'生'):'';
        const _xieTxt=xieCnt>0?('、生'+xieWx):(srcCnt>0?('，而'+xieWx+'缺、缘气难继'):'');
        _flowTxt+='；'+spouseWx+'（'+spName+'）处链中'+_srcTxt+_xieTxt+(srcCnt>0&&xieCnt>0?'，缘气有承':'');
      }
      s2_2 += '<br>流通：'+(_flowTxt?_flowTxt+'。':'配偶星随岁运引动而应缘。');
    } else {
      s2_2 += '配偶星（'+spName+'）四柱不透不藏，为虚浮之象，缘分浅，须看岁运引动方成缘。';
    }
    // 日柱干支与纳音（供 ③ 夫妻宫关系使用）
    const dmRel=zMwx===dwx?'比和':relShort(dwx, zMwx);
    const dNa=nayinOf(dg+BZ.dayZ), dNaWx=(NAYIN_INFO[dNa]||{}).wx||'';
    const naRel=relShort(dwx, dNaWx);
    // 纳音 vs 日主生克读法：统一读顶层真源 NAYIN_REL_MEAN（bazi-data.js，marry 字段）
    const naNote=r=>((NAYIN_REL_MEAN[r]||{}).marry)||'';
    // ③ 夫妻宫关系：本质是日主五行与夫妻宫本气五行的生克比和
    const wxPair=(base,other)=> base===other?'比和（'+base+'）'
      : WX_SHENG[base]===other? base+'生'+other
      : WX_SHENG[other]===base? other+'生'+base
      : WX_KE[base]===other? base+'克'+other
      : other+'克'+base;
    let s2_3='③ 夫妻宫关系：';
    s2_3+='夫妻宫（日支'+BZ.dayZ+'）本气'+zM+'属'+zMwx+'，日主'+dg+dwx+'，'+wxPair(dwx, zMwx)+'，'+(zMwx===dwx?'夫妻宫与日主同气，相处平顺、彼此相扶，少有对立':notePhrase(dwx, zMwx))+'。';
    s2_3+=(zMwx===spouseWx?'<br>夫妻宫本气即配偶星，宫星一体，宫位状态直接代表配偶状态，底盘集中。':'');
    if(dayRel.length){
      // 同类关系合并（如月支、时支两处相冲，合并为一句"月支、时支（酉）相冲，…"，不再逐条重复同义句；双冲叠加另起一句）
      const byType={};
      dayRel.forEach(r=>{
        const m=r.match(/^(冲|合|刑|害|破)(年支|月支|日支|时支)\((.)\)(自刑)?$/);
        const type=m[1], tname=m[2], tz=m[3], isSelf=m[4]==='自刑';
        const idx={'年支':0,'月支':1,'日支':2,'时支':3}[tname];
        let mean=REL_MEAN[type];
        if(isSelf) mean='日支与'+tname+'同字（'+tz+'），辰午酉亥自刑，内耗刑伤、主感情隐痛或反复，宜以专一和沟通化解';
        else if(type==='合'){
          mean+='。夫妻宫被合（与'+tname+tz+'相合），代表这段缘分受'+tname+'牵动、带有强烈吸引；'+_pillarMean(idx)+'。'+heHuaState(BZ.dayZ, tz, BZ.monthZ)+'；若岁运再逢冲则合局破、缘分易变';
        } else {
          // 非合非自刑关系直接按两支五行能量分判主次主动被动、按喜忌判损益（禁"轻重视双方旺衰"套话、禁一刀切负面）
          const _tzw=ZHI_WX[tz]||'';
          const _e1=_esM?(_esM[zMwx]||0):0, _e2=_esM?(_esM[_tzw]||0):0;
          const _w=(_e1>=_e2)?('日支'+zMwx+'势强为主、对方'+_tzw+'受动'):('对方'+_tzw+'势强为主、日支受动');
          const _yj=(fuXi.indexOf(zMwx)>=0&&_e1<_e2)?'，日支'+zMwx+'为喜用受动、宜防其损'
            :(fuXi.indexOf(_tzw)>=0&&_e2<_e1)?'，对方'+_tzw+'为喜用受动、宜防其损'
            :(fuJi.indexOf(zMwx)>=0&&_e1<_e2)?'，日支'+zMwx+'为忌神受动、反去其弊'
            :(fuJi.indexOf(_tzw)>=0&&_e2<_e1)?'，对方'+_tzw+'为忌神受动、反去其弊':'';
          mean+=('，'+_w+_yj);   // 直接"暗中相耗、易生隔阂，对方X势强为主、日支受动，X为喜用受动、宜防其损"（禁括号、禁"轻重视双方旺衰"套话）
        }
        (byType[type]=byType[type]||[]).push({tname,tz,mean});
      });
      const relParts=Object.keys(byType).map(type=>{
        const items=byType[type];
        const names=items.map(i=>i.tname).join('、');
        const tzs=[...new Set(items.map(i=>i.tz))].join('、');
        return names+'（'+tzs+'）相'+type+'，'+items[0].mean+'。';
      });
      s2_3+='<br>夫妻宫与命局：'+relParts.join('');
      // 同类关系叠加（如两处相冲）的说明：冲力叠加、影响更剧
      const doubled=Object.keys(byType).filter(t=>byType[t].length>=2);
      if(doubled.length){
        s2_3+=doubled.map(t=>{
          const items=byType[t];
          const Pillars=items.map(i=>i.tname).join('、');
          return '夫妻宫同时遭'+Pillars+'相'+t+'（'+(items.length>=3?(items.length+'处'+t+'并见'):'双'+t)+'），'+t+'力叠加、影响更剧，关系易反复，须多留缓冲、以静制动';
        }).join('；')+'。';
      }
      s2_3+='<br>相处上需要多沟通、彼此留空间，避免硬碰硬。';
    } else {
      s2_3+='<br>夫妻宫安静，没有刑冲害合破，婚姻底盘平稳。';
    }
    // 流通：顶层 flowPillarRing（宫位圈：日支↔时柱/月柱/年柱 支→干→日主→回日支）+ flowChain5（五行十神相生链）
    // 禁"其气禀于日柱、上承日主、下应岁运"式套话
    const _fr=(typeof window!=='undefined'&&window.flowPillarRing)?window.flowPillarRing(BZ):null;
    const _fc5b=(typeof window!=='undefined'&&window.flowChain5)?window.flowChain5(BZ, _esM||{}):null;
    let _flow5='流通：'+( _fr?_fr.map(p=>p.name+'（'+p.text+'）').join('；'):'');
    _flow5+=( _fc5b?('。五行十神：'+_fc5b.text):'');
    s2_3+='<br>'+_flow5+'。';
    // 晚子时、时辰边界 宫位敏感性提示（日柱=夫妻宫所在，恰处子时则随校正而变）
    if(BZ.zhis[3]==='子') s2_3+='生于子时（23:00至01:00），日柱（夫妻宫所在）处早晚子时与真太阳时校正之敏感边界，若时刻临近 0 点，夫妻宫（日支）或因真太阳时校正而在前后两日间变动，建议核校真太阳时后再定盘。';
    // ① 十神总览（婚恋视角）
    let marryOv='';
    try{
      const _es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
      const _et=_es?Object.values(_es).reduce((a,b)=>a+b,0):0;
      const _ea=_et/5;
      // lq 在本函数后部（§4 六亲处）才定义，此处现场算一份局部 _lq（避免 TDZ）
      const _lq=ssLiuqin(ssCount(BZ.gans, BZ.zhis, dg));
      const fM={ BZ, order:['官杀','财星','食伤','印星','比劫'],
        wxOf:{'官杀':killWx,'财星':wealthWx,'食伤':shangWx,'印星':yinWx,'比劫':dwx},
        lq:{'官杀':(_lq['官杀']||0),'财星':(_lq['财星']||0),'食伤':(_lq['食伤']||0),'印星':(_lq['印星']||0),'比劫':(_lq['比劫']||0)},
        eScore:_es||{}, eTotal:_et, eAvg:_ea, xiWxSet:new Set(fuXi), jiWxSet:new Set(fuJi) };
      marryOv=tenShenOverview(fM,'marry');
    }catch(e){ if(typeof console!=='undefined') console.error('[tenShenMarry]', e.message); marryOv=''; }
    // ② 十神关系（婚恋视角，逐神深读→相互关系→两两作用；与事业卡同引擎同格式）
    let marryRel='';
    try{
      const _es2=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
      const _et2=_es2?Object.values(_es2).reduce((a,b)=>a+b,0):0;
      const _ea2=_et2/5;
      const _lq2=ssLiuqin(ssCount(BZ.gans, BZ.zhis, dg));
      const _fM={ BZ, order:['官杀','财星','食伤','印星','比劫'],
        wxOf:{'官杀':killWx,'财星':wealthWx,'食伤':shangWx,'印星':yinWx,'比劫':dwx},
        lq:{'官杀':(_lq2['官杀']||0),'财星':(_lq2['财星']||0),'食伤':(_lq2['食伤']||0),'印星':(_lq2['印星']||0),'比劫':(_lq2['比劫']||0)},
        eScore:_es2||{}, eTotal:_et2, eAvg:_ea2, xiWxSet:new Set(fuXi), jiWxSet:new Set(fuJi) };
      // 逐神深读（婚恋视角；日干为日主自身不计；地支含本气与余气藏干，与④配偶星关系透藏口径一致，禁"命局1个却不现"矛盾）
      const _godPosM=cat=>{
        const names={'官杀':['正官','七杀'],'财星':['正财','偏财'],'食伤':['食神','伤官'],'印星':['正印','偏印'],'比劫':['比肩','劫财']}[cat]||[];
        const tou=[], zhi=[];
        names.forEach(g=>{ BZ.gans.forEach((gg,i)=>{ if(i===2) return; if(tenGod(dg,gg)===g) tou.push(PALACE[i]+'干'); }); });
        BZ.zhis.forEach((z,i)=>{ const _hit=names.some(g=>tenGod(dg,zhiMain(z))===g)||(HIDE[z]||[]).some(hg=>names.some(g=>tenGod(dg,hg)===g)); if(_hit) zhi.push(PALACE[i]+'支'); });
        if(tou.length) return '天干透'+tou.join('、')+(zhi.length?'、地支亦藏':'');
        return zhi.length?'藏支':'不现';
      };
      const _strM=wx=>{ const e=(_fM.eScore[wx]||0); return (e>WX_TIER_HI*_ea2)?'过旺':(e>WX_TIER_LO*_ea2)?'偏旺':'平和'; };
      const deepM=_fM.order.filter(c=>(_fM.lq[c]||0)>0).map(c=>tenShenDeep(_fM,c,_godPosM(c),_strM(_fM.wxOf[c]),'marry')).join('<br>');
      // 婚恋两两作用（顶层统一判定：REL.tenCombo 命中关系 → 婚姻主题句；与事业/十神宫位同一喜忌裁决，避免口径分叉；禁 REL.ten.rel 通用 10 对逐字重复）
      const _tCtxM = (typeof REL!=='undefined' && REL.tenCombo && REL.tenCombo.buildCtx) ? REL.tenCombo.buildCtx(BZ) : null;
      const _tHitsM = _tCtxM ? REL.tenCombo.matchAll(_tCtxM) : [];
      const _negSayM = s => /为忌|忌神|破财|克身|受损|祸患|夺食|压力|虚浮|难成/.test(s||'');
      const pairM=SHISHEN.namesOf('marryPair').map(n=>{
        const h=_tHitsM.find(x=>x.name===n); if(!h) return '';
        return SHISHEN.pick(n,'marryPair',_negSayM(h.say));
      }).filter(Boolean);
      marryRel=deepM+(pairM.length?('<br>两两作用：'+pairM.join('；')+'。'):'');
    }catch(e){ if(typeof console!=='undefined') console.error('[tenShenMarryRel]', e.message); marryRel=''; }
    sec.push('2、配偶星与夫妻宫<br>'
      +(marryOv?('① 十神总览：'+marryOv+'<br>'):'')
      +(marryRel?('② 十神关系（婚恋视角）：<br>'+marryRel+'<br>'):'')
      +'③ 夫妻宫主象与配偶星定位。'+marryCore+marryKey+spouseXiJi+'<br>'
      +s2_2.replace(/^②/,'④')+'<br>'
      +s2_3.replace(/^③/,'⑤'));

    // ===== 3 神煞与纳音 =====
    // 神煞：仅输出与婚姻感情相关的神煞，多柱合并、按落柱析义
    // 落柱语义统一读顶层真源 PILLAR_MAP['神煞落宫']（bazi-data.js），禁另建同义表
    const _shaNote=p=>((window.PILLAR_MAP||{})[p+'柱']||{}).神煞落宫||'';
    const shaMap={};
    [['年',BZ.shaYear],['月',BZ.shaMonth],['日',BZ.shaDay],['时',BZ.shaTime]].forEach(([pn,arr])=>{
      (arr||[]).forEach(s=>{
        const m=SHA_MEAN[s];
        if(m&&m.marry) (shaMap[s]=shaMap[s]||{pillars:[],mean:m.marry}).pillars.push(pn);
      });
    });
    let s3='① 神煞：';
    const marrySha=Object.keys(shaMap);
    if(marrySha.length){
      s3+=marrySha.map(s=>{
        const e=shaMap[s], ps=[...new Set(e.pillars)];
        const note=ps.length>1? ps.map(p=>_shaNote(p)).join('，并') : _shaNote(ps[0]);
        return s+'（'+ps.join('、')+'柱，'+note+'；'+e.mean+'）';
      }).join('；')+'。';
    } else s3+='本局无显著婚姻相关神煞。';
    // 纳音五行生克（纳音看婚姻的核心读法：夫妻宫纳音 vs 日主）
    s3+='<br>② 纳音：日柱'+dg+BZ.dayZ+'纳音'+nayinColorSpan(dNa)+'。'+naNote(naRel)+'。';
    // 十二长生对婚姻感情的影响解读（日主四柱；统一读顶层真源 CS_MEAN_ALL.marry）
    const csDay=pz.map((z,i)=>_shaNote(PALACE[i])+'（'+z+'）'+getChangSheng(dg,z)+'（'+((CS_MEAN_ALL[getChangSheng(dg,z)]||{}).marry||'')+'）');
    s3+='<br>③ 十二长生：'+csDay.join('；')+'。';
    // 夫妻宫纳音自坐：纳音五行在日支的十二长生（如甲子纳音海中金，金死于子），
    //   与前句日主天干在日支之气互为参看；统一走 nayinZizuo，释义读 CS_MEAN_ALL.marry
    const dNaCs=nayinZizuo(dg+BZ.dayZ);
    s3+='日柱纳音自坐'+dNaCs+'（'+((CS_MEAN_ALL[dNaCs]||{}).marry||'')+'）。';
    // 神煞与喜忌相参（吉凶神煞挂钩婚恋喜忌，与事业卡同口径）
    const _jisha=['天乙贵人','天喜','红鸾','金舆','将星','天德','月德'].filter(s=>shaMap[s]);
    const _xsha=['孤辰','寡宿','阴差阳错','红艳煞','咸池','九丑','童子'].filter(s=>shaMap[s]);
    s3+='<br>'+shaXiJiNote(_jisha,_xsha,'婚恋多得贵助','婚缘宜守正经营','本局婚恋神煞无显著吉凶、以常缘论之');
    sec.push('3、神煞、纳音与十二长生<br>'+s3);

    // ===== 4 六亲与婚恋特征（六亲星统计 + 婚恋特征；先正官后七杀）=====
    function cntGod(g){ return BZ.gans.filter(x=>tenGod(dg,x)===g).length; }
    const ss=ssCount(BZ.gans, BZ.zhis, dg), lq=ssLiuqin(ss);
    const caiN=lq['财星'];
    const guanN=lq['官杀'];
    const guanTou=cntGod('正官')+cntGod('七杀');
    const yinN=cntGod('正印')+cntGod('偏印');
    const shangN=cntGod('食神')+cntGod('伤官');
    // 藏干位置的六亲星（补全透干统计的遗漏）
    function cangOf(god){ const out=[]; pz.forEach((z,i)=>(HIDE[z]||[]).forEach(hg=>{ if(tenGod(dg,hg)===god) out.push(PALACE[i]+'支'+z+'藏'+hg); })); return out; }
    const caiCang=cangOf('正财').concat(cangOf('偏财'));
    const guanCang=cangOf('正官').concat(cangOf('七杀'));
    const shangCang=cangOf('食神').concat(cangOf('伤官'));
    const yinCang=cangOf('正印').concat(cangOf('偏印'));
    // ===== 4 六亲与婚恋特征（深度版：父母之缘→兄弟手足→配偶星深析→子女星互动→婚恋特征收束）=====
    const _biN=cntGod('比肩')+cntGod('劫财');
    const _cfTou=BZ.gans.filter(g=>tenGod(dg,g)==='偏财');
    const _yinTouN=cntGod('正印')+cntGod('偏印');
    const _shangTouN=cntGod('食神')+cntGod('伤官');
    const _s4p=[];
    _s4p.push('① 父母之缘：印星为母荫家教'+(yinN>0?('，命局'+yinN+'个'+(_yinTouN>0?'透干、家教传统，婚恋观多承长辈之见、宜重门风':'藏支、母荫暗藏，婚恋自主性较强、长辈意见为辅')):'缺，家教束缚少，婚恋自主性强、多凭己意')
      +'；偏财为父缘'+( _cfTou.length>0?('，透'+dedupChars(_cfTou)+'，父缘明现、择偶眼光多承父风'):'不透，父缘看支、择偶自主')+'。');
    _s4p.push('② 兄弟手足：比劫'+_biN+'个'+( _biN>=2?'，婚恋或有同辈竞争或友介牵线，宜专一分明、防第三者之扰':'，同辈助力少争、婚恋多自主经营')+'。');
    if(isMale){
      _s4p.push('③ 妻星深析：正财偏财'+(caiN>0?('命局'+caiN+'个'+(spouseTou.length>0?('、透'+spouseTou.map(o=>o.god+'于'+o.label).join('、')+'，妻缘明现、缘分主动可期'):(caiCang.length?('、'+caiCang.join('、')+'暗根，妻缘暗藏、须岁运引动方显'):'、不显，妻缘待岁运引出'))):'缺，妻缘迟现、宜晚成')+(spouseXi?'，妻星为喜用、婚姻得妻助、家道可旺':'，妻星为忌神、婚姻易为财所累、宜财务分明')+'。');
    } else {
      _s4p.push('③ 夫星深析：正官七杀'+(guanN>0?('命局'+guanN+'个'+(spouseTou.length>0?('、透'+spouseTou.map(o=>o.god+'于'+o.label).join('、')+'，夫缘明现、缘分主动显性'):(guanCang.length?('、'+guanCang.join('、')+'暗根，夫缘暗藏、须岁运引动方显'):'、不显，夫缘待岁运引出'))):'缺，夫缘迟现、宜晚成')+(spouseXi?'，官杀为喜用、婚姻得夫助、夫业可倚':'，官杀为忌神、婚姻易与名位相扰')+'。');
    }
    const _s4Child=(isMale
      ? ('官杀为子女，命局'+guanN+'个'+(guanTou>0?'透干、子女缘显，与妻财相资则婚育相成':'藏支、子女缘隐现，婚育宜顺其自然'))
      : ('食伤为子女，'+(shangN>0
          ? ('命局'+shangN+'个'+(_shangTouN>0?'透干、子女缘显，与夫星相资则婚育相成':'藏支、子女缘隐现，婚育宜顺其自然'))
          : ('天干不现'+(shangCang.length?('、'+shangCang.join('、')+'（食神为女、伤官为子），子女缘隐现'):'、子女缘偏薄')))));
    _s4p.push('④ 子女星互动：'+_s4Child+(guanN+shangN>0?'，子女与婚姻相资则婚育双美':'，子女星弱、婚姻与子女宜分阶段经营')+'。');
    const _lateSha=(shaMap['阴差阳错']||shaMap['孤鸾'])?(shaMap['阴差阳错']&&shaMap['孤鸾']?'阴差阳错、孤鸾':(shaMap['阴差阳错']?'阴差阳错':'孤鸾')):'';
    _s4p.push('⑤ 婚恋特征：'+(spouseXi?'配偶为助缘、婚姻可依托、宜共同经营':'配偶星非喜、婚姻宜经营少依赖、以自我立身为主')
      +(dayRel.some(r=>relTypeOf(r)==='冲')||dayRel.some(r=>relTypeOf(r)==='刑')?'；夫妻宫逢冲刑、婚恋多波折、宜多沟通':'；夫妻宫平稳、婚恋根基尚稳')
      +(_lateSha?('；带'+_lateSha+'、婚缘宜迟、宜晚婚'):'')+'。');
    const s4=_s4p.join('<br>');
    sec.push('4、六亲与婚恋特征<br>'+s4);

    // ===== 5 感情风险预警 =====
    const risk=[], shortc=[], falsif=[];
    if(spouseJi&&hasSpouse) risk.push(spName+'<span class="tip sha-xiong">为忌</span>，婚姻容易和'+(isMale?'钱财':'名位')+'牵扯、产生摩擦，需要财务分明、各守本分。');
    if(dayRel.some(r=>relTypeOf(r)==='冲')) risk.push('夫妻宫逢冲，两人容易有冲突和变动，需要多沟通、彼此留空间。');
    if(dayRel.some(r=>relTypeOf(r)==='刑')) risk.push('夫妻宫带刑，关系里容易有内耗和摩擦，需要多包容。');
    if(godClass(spouse)==='比劫') risk.push('夫妻宫坐比劫，要注意同辈争合、感情里有竞争，相处容易起冲突，需要专一。');
    // 混杂：女命官杀混杂（正官与七杀并透）、男命财星混杂（正财与偏财并透）；露一藏一不论混杂
    const mixZheng = isMale ? BZ.gans.some(g=>tenGod(dg,g)==='正财') : BZ.gans.some(g=>tenGod(dg,g)==='正官');
    const mixQi   = isMale ? BZ.gans.some(g=>tenGod(dg,g)==='偏财') : BZ.gans.some(g=>tenGod(dg,g)==='七杀');
    if(mixZheng&&mixQi) risk.push((isMale?'财星混杂（正财与偏财并透天干）':'官杀混杂（正官与七杀并透天干）')+'，感情线易多、须专一，防分心或外界牵扯，多现则婚缘不稳。');
    // 伤官见官：须食伤与配偶星同时存在（女命食伤克官杀、男命食伤生财不为克，故仅女命论伤官见官）
    if(!isMale&&hasSpouse&&elemCount(shangWx)>=1.0) risk.push('伤官见官（食伤克官杀），关系中易生口舌、不服管束，是女命常见婚变信号，宜以柔化解、多沟通。');
    // 二婚信号：多指标并见
    const divSignals=[];
    if(mixZheng&&mixQi) divSignals.push(isMale?'财星混杂':'官杀混杂');
    if(dayRel.some(r=>relTypeOf(r)==='冲')) divSignals.push('夫妻宫逢冲');
    if(!isMale&&hasSpouse&&elemCount(shangWx)>=1.0) divSignals.push('伤官见官');
    if(shaAll.indexOf('阴差阳错')>=0||shaAll.indexOf('孤鸾')>=0) divSignals.push('迟误煞');
    if(divSignals.length>=2) risk.push('二婚信号：'+divSignals.join('、')+'并见，原局婚姻底盘有波动，宜晚婚、专一、重经营，可降低变动概率。');
    if(shaAll.indexOf('红艳煞')>=0||shaAll.indexOf('咸池')>=0) falsif.push('情缘外露之象，如果外缘偏多就印证、如果界限分明就不矛盾。');
    if(shaAll.indexOf('阴差阳错')>=0) shortc.push('婚缘容易迟误，需要包容、晚婚更稳。');
    if(shaAll.indexOf('孤鸾')>=0) shortc.push('婚姻适合晚一些、多沟通。');
    let s5='风险提示：'+(risk.length?risk.join(''):'本局没有明显感情凶象，顺势经营就好。');
    let s5trait='';
    if(shortc.length) s5trait+='特征提示：'+shortc.join('');
    if(falsif.length) s5trait+='可证伪：'+falsif.join('');
    s5+=s5trait;
    sec.push('5、感情风险预警<br>'+s5);

    // ===== 6 婚缘机遇与择偶方向（选择） =====
    // ① 婚缘触发条件（多种触发路径并存：神煞临运、夫妻宫动、流年引星、喜用到位，任一满足皆可为婚缘之机，非独看配偶星一途）
    const trig=[];
    const hasHuaSha=shaAll.some(s=>['红鸾','天喜','桃花','红艳煞','咸池'].indexOf(s)>=0);
    if(hasHuaSha) trig.push('桃花红鸾天喜等婚缘神煞临运，情缘气机被引动');
    if(!hasSpouse) trig.push('配偶星虚浮，须岁运引动方现缘');
    else trig.push('流年见'+(isMale?'财星':'官杀')+'、日干合流年，配偶星得引而缘动');
    if(dayRel.some(r=>relTypeOf(r)==='冲')||dayRel.some(r=>relTypeOf(r)==='合')) trig.push('夫妻宫逢冲合，宫位一动则缘易成');
    trig.push('<span class="tip sha-ji">喜用</span>大运流年到位，根基顺而缘易结');
    let s6='① 婚缘触发条件：'+trig.join('；')+'。以上诸般（神煞临运、夫妻宫动、流年引星、喜用到位）任一项满足，皆可为婚缘之机，非独看配偶星一途。';
    // ② 择偶方向（气质原则化 + 方位聚焦配偶星五行 + 与事业方向关系）
    const zhiXing={子:'机敏多动',丑:'沉稳内敛',寅:'积极开拓',卯:'细腻善思',辰:'多面善变',巳:'热情外显',午:'刚烈直率',未:'温和包容',申:'聪慧机变',酉:'精致追求完美',戌:'忠诚坚毅',亥:'浪漫随性'};
    let s6b='② 择偶方向：';
    s6b+='配偶气质倾向：日支'+BZ.dayZ+'（'+(zhiXing[BZ.dayZ]||'平和')+'），相处适合'
        + (godClass(spouse)==='食伤'?'多包容、不要苛求'
          : godClass(spouse)==='比劫'?'明算账、防止争执'
          : godClass(spouse)==='印星'?'静气相依'
          : godClass(spouse)==='财星'||godClass(spouse)==='官杀'?'务实相扶':'随缘')+'。';
    const xiFang=fuXi.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
    const jiFang=fuJi.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
    const spTend = spouseXi?'为<span class="tip sha-ji">喜用</span>、宜就喜方' : (spouseJi?'<span class="tip sha-xiong">为忌</span>、宜向<span class="tip sha-ji">喜用</span>方发展以转化' : '影响平淡');
    s6b+='发展方位：整体<span class="tip sha-ji">喜用</span>利'+xiFang.join('，')
      + (jiFang.length?('，忌'+jiFang.join('，')+'，须避'):'')
      + '。择偶重'+(isMale?'财星':'官杀')+'（'+spouseWx+'），'+spTend+'。';
    // 八宅命卦法（专业法）：命卦年以立春为界（mingGuaDate，与合婚页同口径）；本命卦经大游年八星论婚配，
    // 延年主夫妻正配、生气天医次吉、伏位平吉；绝命五鬼大凶、六煞祸害次凶。八星表取 fengshui-engine（与合婚页八宅专项同源互证）。
    const mg=(typeof mingGuaDate==='function'&&BZ.birthMonth)?mingGuaDate(BZ.birthYear,BZ.birthMonth,BZ.birthDay,isMale):mingGua(BZ.birthYear, isMale);
    let mgTxt='八宅命卦法：命卦年以立春为界，本命命卦'+mg.gua+'宫（'+mg.group+'），宜'+(mg.dong?'东四宅（坎震巽离）':'西四宅（乾坤艮兑）');
    if(typeof FENGSHUI!=='undefined'&&FENGSHUI.youXing){
      const byStar={};
      ['坎','艮','震','巽','离','坤','兑','乾'].forEach(g2=>{ if(g2===mg.gua) return; const st=FENGSHUI.youXing(mg.gua,g2); (byStar[st]=byStar[st]||[]).push(g2); });
      const good=['延年','生气','天医'].filter(s=>byStar[s]&&byStar[s].length).map(s=>'宜寻'+s+'星命卦（'+byStar[s].join('、')+'）');
      const bad=['绝命','五鬼','六煞','祸害'].filter(s=>byStar[s]&&byStar[s].length).map(s=>s+'星（'+byStar[s].join('、')+'）慎之');
      mgTxt+='。婚配以大游年八星论：'+good.join('；')+(good.length?'；':'')+'同卦为伏位平吉；凶星命卦：'+bad.join('、')+'。此八星论断与合婚页八宅专项同源，可互证。';
    } else {
      mgTxt+='；择偶宜寻同属'+mg.group+'之人，居所宜取其气；若对方为另一组则须以一方为主、另一方调和。';
    }
    s6b+=mgTxt;
    // ③ 属相婚配宜忌（三合六合宜、冲害破刑忌，宜忌标识 + 非绝对）
    const yz=BZ.yearZ;
    const sanheRaw=(DIZHI_SANHE.find(g=>g.indexOf(yz)>=0)||[]);
    const sanhe=sanheRaw.slice(0,3).filter(z=>z!==yz);
    const heRaw=(DIZHI_HE6.find(g=>(g[0]===yz||g[1]===yz))||[]);
    const liuhe=heRaw.slice(0,2).filter(z=>z!==yz);
    const chong=(DIZHI_CHONG.find(g=>g.indexOf(yz)>=0)||[]).filter(z=>z!==yz);
    const hai=(DIZHI_HAI.find(g=>g.indexOf(yz)>=0)||[]).filter(z=>z!==yz);
    const po=(DIZHI_PO.find(g=>g.indexOf(yz)>=0)||[]).filter(z=>z!==yz);
    const xing=[]; DIZHI_XING.forEach(g=>{ if(g.indexOf(yz)>=0&&g.length>=2) g.forEach(z=>{ if(z!==yz) xing.push(z); }); });
    const selfXing=(yz==='辰'||yz==='午'||yz==='酉'||yz==='亥');
    const zname=z=>z+ZODIAC[z];
    const yiRaw=[...new Set([].concat(sanhe,liuhe))];
    const yi=yiRaw.map(zname);
    const jiRaw=[...new Set([].concat(chong,hai,po,xing))].filter(z=>!yiRaw.includes(z));
    const ji=jiRaw.map(zname); if(selfXing) ji.push(zname(yz)+'自刑');
    let s6c='③ 属相婚配宜忌：年支'+yz+ZODIAC[yz]+'。'
          + '宜：'+(yi.length?yi.join('、'):'无明显三合六合')+'（三合、六合，气场相合）。'
          + '忌：'+(ji.length?ji.join('、'):'无明显冲害破刑')+'（六冲、六害、六破、三刑，气场相抵）。'
          + '属相只是年支一个字，需要结合全局和日主喜忌一起看，不是绝对因素。';
    // ④ 免责说明（删"不是X、桃花一方面能决定"复述句）
    let s6d='④ 婚缘和择偶不是'+(isMale?'财星':'官杀')+'成势、桃花旺就能决定。'+(isMale?'财星':'官杀')+'为<span class="tip sha-ji">喜用</span>、又逢<span class="tip sha-ji">喜用</span>运会更顺；'+(isMale?'财星':'官杀')+'<span class="tip sha-xiong">为忌</span>，如果所主十神成势、或被<span class="tip sha-ji">喜用</span>转化、或遇到去病之运，也可以是好缘分。';
    sec.push('6、婚缘机遇与择偶方向<br>'+s6+'<br>'+s6b+'<br>'+s6c+'<br>'+s6d+ dyNatalInto('婚姻感情', BZ, A, '⑤'));

    // ===== 7 感情质量层级（收获，最后） =====
    // 判定与表述分离：v 内部算层级，p 为面向读者的直接陈述句
    function M(v,p){ return {v:v,p:p}; }
    const sp=(isMale?'财星':'官杀');
    const spXiName=sp;
    const sk={}, hk={}, ik={};
    const seatStable=(['正官','七杀','正财','偏财','正印','偏印'].indexOf(spouse)>=0);
    sk['宫坐']=seatStable?M('hit','夫妻宫坐'+spouse+'，主缘分类'+spouse+'缘，底盘本有稳基'):M('low','夫妻宫坐'+spouse+'，主缘分类'+spouse+'缘，互动偏多');
    const disturbRel=dayRel.some(r=>/^[冲刑害破]/.test(r));
    sk['宫动静']=disturbRel?M('low','本宫逢冲刑害破，底盘易动，关系易波动'):M('hit','本宫安静无冲刑害破，底盘安稳');
    // 星得位：透干 OR 坐夫妻宫（日支）有根（本气或藏干）皆算得位；并区分宫星一体（本气）与藏根偏暗之强弱差
    const touGanSpouse = spLocs.some(o=>o.tou && o.pillar!==2);    // 天干透出（非日支本气）
    const seatMainSpouse = spLocs.some(o=>o.pillar===2 && o.main); // 日支本气=配偶星（宫星一体）
    const seatHideSpouse = spLocs.some(o=>o.pillar===2 && !o.main);// 日支藏干=配偶星（宫星有根偏暗）
    let sdV, sdP;
    if(touGanSpouse){
      sdV='hit'; sdP = seatMainSpouse ? (sp+'既透干、又坐夫妻宫本气（宫星一体），得位最实，缘分有凭、正缘近身')
                                       : (sp+'透干得位，缘分有凭、易外显成缘');
    } else if(seatMainSpouse){
      sdV='hit'; sdP = sp+'坐夫妻宫本气（宫星一体、本宫有根），得位、正缘近身';
    } else if(seatHideSpouse){
      sdV='part'; sdP = sp+'不透干、仅藏于夫妻宫（宫星有根而偏暗），得位但宜岁运引出';
    } else {
      sdV='low'; sdP = sp+'不现于干、亦不坐夫妻宫，不得位，缘分偏迟';
    }
    sk['星得位']=M(sdV, sdP);
    hk[sp]= !hasSpouse ? M('part', sp+'不在局中、虚浮无着，其助扰须看岁运引动方显')
      : spouseXi ? M('hit', sp+'为<span class="tip sha-ji">喜用</span>，助益非牵')
      : spouseJi ? M('low', sp+'<span class="tip sha-xiong">为忌</span>，易牵扯摩擦')
      : M('part', sp+'为闲，影响不大');
    hk['宫争合']=(disturbRel||godClass(spouse)==='比劫')?M('low','本宫逢冲刑害破、易动'):M('hit','宫位安稳，无争合扰动');
    const huaWai=shaNames('红艳煞','咸池');
    hk['情缘外露']=huaWai.length?M('low',huaWai.join('、')+'过旺，情缘外露、须界限分明'):M('hit','情缘不过度外露，界限分明');
    const chiWu=shaNames('阴差阳错','孤鸾');
    hk['迟误煞']=chiWu.length?M('low','带'+chiWu.join('、')+'，婚缘易迟误'):M('hit','婚缘无迟误煞');
    hk[sp+'受制'] = (!isMale&&hasSpouse&&elemCount(shangWx)>=1.0) ? M('low','伤官见官，易生口舌') : M('hit', sp+'不受制，无伤官见官之扰');
    const qingYuan=shaNames('红鸾','桃花','红艳煞');
    ik['情缘信号']=qingYuan.length?M('hit',qingYuan.join('、')+'临，情缘相通'):M('low','红鸾桃花红艳不临，情缘信号弱');
    ik['日支相契']=(fuXi.indexOf(zMwx)>=0||dmRel.indexOf('生日主')>=0||dmRel.indexOf('比和')>=0)?M('hit','日支为<span class="tip sha-ji">喜用</span>，相处相契'):M('low','日支非<span class="tip sha-ji">喜用</span>，相处助力偏弱');
    const pianGu=shaNames('华盖','孤辰','寡宿');
    ik['偏孤']=pianGu.length?M('low','性偏孤（'+pianGu.join('、')+'），宜主动经营'):M('hit','性不偏孤，相处不显疏离');
    const slv=potLevel(sk), hlv=potLevel(hk), ilv=potLevel(ik);
    // 综合主导维度：取最高档，同档稳定优先
    let dom=['稳定', slv];
    [['和谐',hlv],['亲密',ilv]].forEach(o=>{ if(RANK[o[1]]>RANK[dom[1]]) dom=o; });
    let s7='稳定度（'+slv+'，原局自发）：'+Object.keys(sk).map(k=>sk[k].p).join('。')+'。';
    s7+='<br>和谐度（'+hlv+'，原局自发）：'+Object.keys(hk).map(k=>hk[k].p).join('。')+'。';
    s7+='<br>亲密度（'+ilv+'，原局自发）：'+Object.keys(ik).map(k=>ik[k].p).join('。')+'。';
    // 综合判定
    const needItems=[];
    if(sk['宫动静'].v==='low') needItems.push('夫妻宫安稳');
    if(hk[sp].v==='low') needItems.push(spXiName+'<span class="tip sha-xiong">为忌</span>');
    if(ik['日支相契'].v==='low') needItems.push('日支为<span class="tip sha-ji">喜用</span>');
    // 感情专一/复杂度小结（中性措辞，不贴道德标签；数据驱动，折叠进"综合判定"句首）
    const pianStar = spLocs.some(o=>o.god===spouseStar[1]);
    let cmx;
    if(!pianStar && huaWai.length===0 && sk['宫动静'].v==='hit'){
      cmx='配偶星清纯（无'+spouseStar[1]+'混杂）、情缘不外显、夫妻宫安稳，感情关系偏清顺，宜专一深耕、以稳致远';
    } else {
      const fac=[];
      if(pianStar) fac.push('配偶星偏正混杂，含'+spouseStar[1]);
      if(huaWai.length) fac.push('情缘外露，见'+huaWai.join('、'));
      if(sk['宫动静'].v==='low') fac.push('夫妻宫易动');
      cmx='感情引力偏强或关系易生波折（'+fac.join('、')+'），宜界限分明、以沟通与长期经营维稳，避免关系芜杂';
    }
    s7+='<br>综合判定：'+cmx+'。感情质量可期（综合稳定、和谐、亲密三维度叠加，层级互有高低，任一维度成势都能弥补）。'
       + (needItems.length?('感情所赖'+needItems.join('、')+'等项原局不足或为忌，需要多重条件齐备才能达到，不是原局自带，而是五层叠加。'):'原局已有基础，仍需要以下条件叠加才能达到上限。');
    s7+='<br>① 原局潜力层级：稳定'+slv+'、和谐'+hlv+'、亲密'+ilv+'，综合以'+dom[0]+'维度为主导（同档稳定优先）。';
    s7+='<br>② 大运流年引动：逢<span class="tip sha-ji">喜用</span>旺运更顺'+(spouseXi?('，'+(isMale?'财星':'官杀')+'为<span class="tip sha-ji">喜用</span>、逢其旺运缘更顺'):spouseJi?('，'+(isMale?'财星':'官杀')+'为<span class="tip sha-xiong">忌神</span>则须等到去病之运、或所主十神成势才是转机'):'，'+(isMale?'财星':'官杀')+'与喜忌无涉、逢其旺运平顺')+'。';
    s7+='<br>③ 风水合局（外部条件：居所方位、布局合<span class="tip sha-ji">喜用</span>）。';
    s7+='<br>④ 社会时代机遇（外部条件：家庭背景、社交圈层、时代婚恋观念）。';
    s7+='<br>⑤ 个人经营主观能动性（内在条件：沟通修为、情绪管理、界限分明、长期投入；命理示质量上限与路径，经营决定最终落点）。';
    // 收尾：合成一段（数据驱动，按命局分流建议，侧重婚姻感情，不写死）
    const seatOk = sk['宫动静'].v==='hit' && hk['宫争合'].v==='hit';
    const spOk = hk[sp].v==='hit';
    let marryPath;
    if(seatOk && spOk) marryPath='感情底盘稳固、宜主动经营以专一深耕';
    else if(hlv==='高') marryPath='相处宜和顺、以沟通滋养、顺势修和';
    else if(ilv==='高') marryPath='情缘相投、宜以情意加深亲密';
    else marryPath='宜多沟通、彼此留空间、长期经营，待岁运引动方成';
    s7+='<br>五者齐备，感情基础才能充分兑现，也更有向上提升的空间。'+marryPath+'；然若得正缘相引、遇良人同心，亦未尝不可更进一层、白头相守。相同八字，姻缘未必相同，后天择偶与经营必定导致差异。';
    sec.push('7、感情质量层级<br>'+s7);

    return sec;
  }

  window.renderMarry=renderMarry;
})();



/* ==================== 三、本命装配与基础渲染 ==================== */
/* 共享状态与常量 + 本命各表渲染 + 通用工具函数。 */

/* 十神简称映射：全称→单字（与问真等工具一致，节省卡片空间）；必须在 renderChrome 触发排盘前定义 */
const TG_ABBR={'比肩':'比','劫财':'劫','食神':'食','伤官':'伤','偏财':'才','正财':'财','七杀':'杀','正官':'官','偏印':'枭','正印':'印'};
function tgAbbr(n){ return n? (TG_ABBR[n]||n) : ''; }
/* 卡片式信息：返回 干支 / 天干十神简称 / 地支十神简称（本气）/ 十二运，统一供大运，流年，流月，流日 方块使用 */
function gzInfo(gz, BZ = window.BZ){ if(!gz||gz.length<2) return {g:'',tg:'',tz:'',cs:''}; const tg=tgAbbr(tenGod(BZ.dayGan,gz[0])); const z=gz[1]; const tz=z?tgAbbr(tenGod(BZ.dayGan,zhiMain(z))):''; const cs=z?getChangSheng(BZ.dayGan,z):''; return {g:gz,tg,tz,cs}; }
/* 十二长生“死”与旺相休囚死“死”同字，DICT 后写覆盖；为十二长生弹出单独起键，避免误弹旺相休囚死释义 */
function csKey(s){ return s==='死' ? '死（长生）' : s; }
/* 干支关系标注用：四柱位置标签，让“甲乙合化”等能看出是哪个干、支与哪个干、支的关系 */
const GAN_LAB=['年','月','日','时'];
const ZHI_LAB=['年','月','日','时'];
/* 神煞吉凶权重表由 bazi-rel.js（REL.sha.WEIGHT）提供。 */
/* 运势图 rAF 节流状态（见 drawYunChart 包装器），置于 paipan() 调用之前避免 TDZ。 */
let _yunChartRAF=null, _yunChartPending=false;
/* 环境兼容：部分容器（如 jsdom 测试 / 旧浏览器）没有 requestAnimationFrame，
 * 统一走 _raf 包装，缺失时降级为 setTimeout(cb,0)，避免页面初始化抛错中断后续脚本。 */
const _raf=(typeof requestAnimationFrame==='function')
  ? requestAnimationFrame.bind(window)
  : (cb)=>setTimeout(cb, 0);

/* ============================================================
 * 页面级可变状态
 * 本文件以 <script> 方式随 bazi.html 加载；每个 HTML 是独立 document/window，
 * 不与站点其它页面共享全局。本页生命周期内的全部单例可变状态集中于 BaziState
 * 单一对象，顶层裸名（BZ / CTX / CITY_LNG / pillarChosenDate 等）通过 getter/setter
 * 代理到它，读写两种形式等价。
 * ============================================================ */
function showFormErr(msg){
  const el=document.getElementById('formErr'); if(el){ el.textContent=msg; el.style.display=''; }
  /* 校验失败：清空 #out，避免页面底部自动加载的今日命盘残留被误读为本次结果。
     同步置空全局本命状态 BZ，使自动加载盘不残留于单一真源。 */
  const out=document.getElementById('out'); if(out){ out.innerHTML=''; }
  try{ BZ=null; }catch(e){}
}
function clearFormErr(){ const el=document.getElementById('formErr'); if(el){ el.textContent=''; el.style.display='none'; } }

/* 单一真源：本页所有可变单例状态集中于此。 */
const BaziState = {
  BZ: null,               // 当前排盘结果（见 baziAnalysis）
  CTX: null,              // 十神/干支上下文（paipan / paipanPillar 写入）
  kongAxis: 'day',        // 空亡基准轴：'day'=日柱六甲空亡（默认）/ 'year'=年柱十大空亡（部分流派）
  yearGZcur: null,        // 当前排盘年柱干支（供 kongOf 取年柱旬空）
  CITY_LNG: 116.41,       // 出生地经度（出生地三级联动写入）
  pillarChosenDate: null, // 四柱模式已确认公历日期串（confirmPillarDate / clearPillarDate 写入）
  lastPaipanSig: null,    // 上次排盘输入签名（去重守卫）
  baziInitDone: false     // 页面初始化完成标志（localStorage 恢复后允许持久化）
};
/* 顶层裸名代理到 BaziState：BZ/CTX 等裸名读写即落到单一真源。 */
['BZ','CTX','kongAxis','yearGZcur','CITY_LNG','pillarChosenDate','lastPaipanSig','baziInitDone']
  .forEach(function(k){
    Object.defineProperty(window, k, {
      configurable: true,
      enumerable: true,
      get: function(){ return BaziState[k]; },
      set: function(v){ BaziState[k] = v; }
    });
  });

/* 空亡解析：year=取年柱旬空（十大空亡）；day=取该柱自身旬空（六甲空亡，默认）。
   用于四柱表与所选干支详情的“空亡”统一展示，切换 kongAxis 即整体联动。 */
function kongOf(gz){ const ref=(kongAxis==='year' && yearGZcur) ? yearGZcur : gz; return kongWang(ref); }

/* 性能：排盘输入签名。相同签名且已渲染过则跳过全量重排（见 paipan / paipanPillar 顶部的守卫）。 */
function paipanSig(){
  const g=id=>{ const e=document.getElementById(id);
    if(!e) return '';
    if(e.type==='checkbox') return e.checked?1:0; /* 复选框读勾选态，不可读 .value（恒为 "on"，会令状态变化被忽略） */
    return (e.value!==undefined ? e.value : ''); };
  return ['bMode','bDate','bTime','bSex','bTrue','bZi','bKong','bLng','bProv','bCity','bDist',
          'bLunarY','bLunarM','bLunarD','bLunarLeap',
          'pyG','pyZ','pmG','pmZ','pdG','pdZ','ptG','ptZ',
          'pSpan','pStart','pEnd'].map(g).join('|')
         + '|' + (typeof pillarChosenDate!=='undefined' ? pillarChosenDate : '');
}
function stripCat(t){ return (t||'').replace(/（.*?）/g,''); }
/* 起运岁数标注：起运年龄统一为传统“虚岁”（出生即 1 岁，每过一次农历新年增 1），
   现代人多用“周岁”（出生为 0，每过一次公历生日增 1）。二者换算为“周岁 ≈ 虚岁 − 1”（含同数月）。
   此处同时展示，避免误解。 */
function qiYunLabel(start){
  const a=start.age||0, m=start.month||0;
  const zhouYears=a-1;
  const zhou=zhouYears+(m?(' 岁 '+m+' 个月'):' 岁');
  return `${a} 虚岁${m?(''+m+' 个月'):''}（${start.solar} 交运），折合 ${zhou}（周岁，虚岁减一）`;
}

/* 顶层渲染函数：根据 paipan 算好的 BZ 与上下文 R 构建八字页主体 HTML 字符串。
   独立为可复用渲染函数，便于按需复用 / 局部刷新 / 单元测试，避免巨型字符串堆积。
   R 字段：{y,m,d,h,mi,lng,useTrue,tsInfo,zadj,lunar,pj,nj,sex,dayGan,yearGZ,monthGZ,dayGZ,cols,ec} */
/* 速览全局：命局关键结论（日主 / 格局 / 喜用 / 身强身弱 / 旺衰评分），并入基础信息字段流。
   输出 .bz-info 内的条目（.bz-i），不再自成一个卡片。五行字交给 gzAllColorSpan 统一上色，不在此处手动包 span。 */
function renderOverview(BZ, yd){
  if(!BZ) return '';
  let A=null;
  try{ A=getAnalysis(BZ); }catch(e){ A=null; }
  if(!A) return '';
  const dg=BZ.dayGan, dwx=GAN_WX[dg]||'';
  const ge=(A.geOuter||A.geName||'普通格');
  // 喜用统一读综合/顺势口径（synthesis）：普通格=扶抑、特殊格=顺势，与"岁运宜见/忌见"、格局用神一致，防特殊格盘两套喜忌并存
  const xi=(A.synthesis&&A.synthesis.xiWxEff&&A.synthesis.xiWxEff.length)?A.synthesis.xiWxEff.join('、'):((A.xiWx&&A.xiWx.length)?A.xiWx.join('、'):'无');
  const strength=A.strength||'无';
  const score=(typeof A.score==='number')?A.score.toFixed(1):'无';
  const bi=(k,v)=>`<div class="bz-i"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  return bi('日主', `${dg}${dwx}`)+bi('格局', ge)+bi('喜用', xi)+bi('身强身弱', strength)+bi('旺衰评分', score);
}

/* ============ 八字双盘：量化四柱圆盘、十二长生盘 ============
   两盘并排挂在本命分析内、干支关系之前，所画即其所替：量化四柱圆盘取代原阴阳五行量化、
   五行量化与旺衰、五行十神六亲量化、生克量化四张表；长生盘接在其旁，与四柱表的地势一列互证。
   几何走 assets/wheel.js 的 WHEEL，样式走 style.css 圆盘通用件段的 .wheel 与 .w-*，颜色只由 --wheel-* 令牌给。
   骨架与万年历、老黄历、佛历五盘同一制式：外圈字 206、弧带 192、外圈线 182、刻度 168 至 176、
   内圈字 148、内界圈 120、盘心 78；指针只走盘心与内界圈之间的 82 至 116 并带圆点。
   取字角：**最外圈**（lab0）一律沿圆周环布 WHEEL.ring，字头朝盘外、随切线转向，整圈读作一条环带；
   内侧各圈照旧：单字走 WHEEL.dir（四正正立、其余沿半径散射），两字走 WHEEL.radial（沿半径竖排）。
   同一扇区内并排的几字须同取一法并同用扇区中心角为取字角，否则字向参差。
   量化四柱盘的外圈弧带照骨架首尾相接成整圈，只承担格位与选中；能量分不进弧带，落在盘心与盘下详情条；
   全盘加粗弧仍只出一条，随选中走。五行只着字色且取站内五行色降调（与经络盘同五值），弧一概单主体色，
   不与字争重。
   常显档位只靠加重字 .w-lab-j（当令五行、本命四柱所落之支）；选中态一律由点选给出，
   加粗弧、指针圆点、盘心三行与盘下详情条同随选中走。 */
const BZ_WX5=['木','火','土','金','水'];
const BZ_PILL=['年','月','日','时'];
const BZ_WX_SFX={'木':'mu','火':'huo','土':'tu','金':'jin','水':'shui'};
const BZ_SS_ORDER=['比肩','劫财','食神','伤官','正财','偏财','七杀','正官','偏印','正印'];
/* 盘面占位：gzAllColorSpan 只在 HTML 文本层逐字包 span，若让它扫到盘内五行（形如 text 木），
   插进去的 HTML span 会打断 SVG foreign content 解析，其后节点尽被吞掉，盘面残缺。
   故圆盘串先按序存下，整段着色完成后按占位原位填回；盘内文字不着色，字色由 .w-lab 系列自负。 */
let BZ_WHEEL_SLOTS=[];
function bzWheelSlot(html){ BZ_WHEEL_SLOTS.push(html); return '<!--bz-wheels:'+(BZ_WHEEL_SLOTS.length-1)+'-->'; }
function bzWheelFill(html){ return html.replace(/<!--bz-wheels:(\d+)-->/g,(m,i)=>BZ_WHEEL_SLOTS[+i]||''); }
/* 五行色（降调）：与万年历经络盘同一五值，取站内 .wx-* 降调而来；盘上只给字着此色，弧一概主体色。
   降调是为免原色在盘上抢眼：原色只用于表格底色与纳音字，盘上字小而密，原色会散掉整圈。 */
const BZ_WX_TONE={'木':'#5a8f45','火':'#b8543f','土':'#876248','金':'#a8813a','水':'#3f6d96'};
/* 两盘同一套骨架半径，并排时环线对齐；数额与全站五盘逐一对应。 */
const BZ_WHEEL_R={lab0:206,arc:192,ring1:182,tick0:168,tick1:176,lab1:148,ring0:120,core:78,p0:82,p1:116,hit1:198};
/* 两盘共用件：字、热区、刻度、三圈线。热区只负责命中，.w-sel 紧随其后只负责悬停着色；
   热区取内界圈至弧带外沿的环带，不盖盘心。刻度与字同轴，连成辐条（与经络盘、时辰盘同法）。 */
function bzWheelKit(R){
  const n=WHEEL.n, px=WHEEL.px, C=WHEEL.C;
  return { n, px, C,
    /* rotAt 为取字角，省略即等于位置角：省略时并排的几字各按自己的位置角取，几栏成扇骨、朝盘心收；
       传了则整组共用一个角，几栏平行、整组只朝一个方向。
       way 为取字法：'ring' 沿圆周环布（WHEEL.ring），最外圈走这条；'flat' 恒定正立，内圈单字走这条；
       'radial' 沿半径放射（WHEEL.radial），内圈双字走这条；'dir' 同是沿半径，但四正极改放正。 */
    lab:(r,dg,txt,cls,i,way,fill,rotAt)=>{ const a=(rotAt===undefined?dg:rotAt), p=px(r,dg);
      const rot=way==='flat'?0:(way==='ring'?WHEEL.ring(a):(way==='dir'?WHEEL.dir(a):WHEEL.radial(a)));
      return `<text x="${n(p[0])}" y="${n(p[1])}" class="${cls}" data-i="${i}"${fill?` style="fill:${fill}"`:''}`
        +` transform="rotate(${rot} ${n(p[0])} ${n(p[1])})">${txt}</text>`; },
    hit:(a0,a1,i,sel,rootId)=>`<path d="${WHEEL.band(R.ring0,R.hit1,a0,a1)}" class="w-hit${i===sel?' is-on':''}" data-i="${i}" onclick="bzWheelPick('${rootId}',${i})"/>`
      +`<path d="${WHEEL.band(R.ring0,R.hit1,a0,a1)}" class="w-sel"/>`,
    tick:(dg)=>{ const a=px(R.tick0,dg), b=px(R.tick1,dg);
      return `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" class="w-tick"/>`; },
    spot:(id,dg)=>{ const q0=px(R.p0,dg), q1=px(R.p1,dg);
      return `<line id="${id}-needle" x1="${n(q0[0])}" y1="${n(q0[1])}" x2="${n(q1[0])}" y2="${n(q1[1])}" class="w-needle"/>`
        +`<circle id="${id}-dot" cx="${n(q1[0])}" cy="${n(q1[1])}" r="3.5" class="w-dot"/>`; },
    rings:`<circle cx="${C}" cy="${C}" r="${R.ring1}" class="w-ring"/>`
      +`<circle cx="${C}" cy="${C}" r="${R.ring0}" class="w-ring"/>`,
    /* 盘心：不带百分比的盘铺本页淡底；带百分比的盘不留常驻底，圆内只留线框，
       填色由一条自底往上涨的淡底水位承担，水位以上即无色，水位高度就是该扇区的百分比。
       水位矩形由与盘心同圆的 clipPath 裁形，涨到哪儿上沿都是满圆的一条弦。 */
    core:(fillId,pct)=>{ const f=WHEEL.coreFill(R.core,pct);
      return fillId
        ? `<clipPath id="${fillId}-clip"><circle cx="${C}" cy="${C}" r="${R.core}"/></clipPath>`
          +`<rect id="${fillId}" class="w-fill" x="${C-R.core}" y="${f.y}" width="${R.core*2}" height="${f.height}" clip-path="url(#${fillId}-clip)"/>`
          +`<circle cx="${C}" cy="${C}" r="${R.core}" class="w-core-hollow"/>`
        : `<circle cx="${C}" cy="${C}" r="${R.core}" class="w-core"/>`; } };
}
/* 指针与圆点：只走盘心与内界圈之间的一段，指选中扇区正中，与字、刻度同轴。 */
function bzWheelSpot(id, dg){
  if(typeof WHEEL==='undefined') return;
  const q0=WHEEL.px(BZ_WHEEL_R.p0,dg), q1=WHEEL.px(BZ_WHEEL_R.p1,dg), n=WHEEL.n;
  const ln=document.getElementById(id+'-needle'), dt=document.getElementById(id+'-dot');
  if(ln){ ln.setAttribute('x1',n(q0[0])); ln.setAttribute('y1',n(q0[1])); ln.setAttribute('x2',n(q1[0])); ln.setAttribute('y2',n(q1[1])); }
  if(dt){ dt.setAttribute('cx',n(q1[0])); dt.setAttribute('cy',n(q1[1])); }
}
/* 量化四柱圆盘：五扇区＝五行（自正上起，依相生序顺时针，每行占 72 度）。
   外圈字＝五行（降调五行色，当令者加重）。
   内圈一字位分三栏，皆贴本扇区、同取扇区中心角为取字角，故成一条辐条旁的并排三读：
   左栏阴十神、中栏该五行在月令的旺衰（死囚休旺相）、右栏阳十神；十神与所属五行同望即见对应。
   两十神取五行色（与外圈五行同一属类），旺衰为随月令而变的状态，只作灰字并降一档，主次由此分开。
   能量分不落弧带，由盘心那行能量百分比与盘下详情条给出；刻度落在扇区正中成辐条。
   盘心三行随选中给该扇区的五行旺衰、能量分与两口径计数；十神六亲与生克全量按扇区落在盘下详情条。
   盘心与详情条同取 window.__bzWheelData 的第 i 项，故一处改、两处同变。 */
function bzQuantWheel(BZ, D){
  if(typeof WHEEL==='undefined' || !BZ || !BZ.gans) return '';
  const R=BZ_WHEEL_R, K=bzWheelKit(R), C=K.C, ID='bzQuantWheel';
  const dg=BZ.dayGan, dwx=GAN_WX[dg]||'', monthZ=D.monthZ;
  /* 十神阴阳随日主：比肩、食神、偏财、七杀、偏印与日主同阴阳，劫财、伤官、正财、正官、正印反之。
     五行各辖两干、阴阳各一，故同一扇区的两十神必为一阴一阳，内圈左右两栏各站一个，位次不混。 */
  const dgYang=(GAN.indexOf(dg)%2===0);
  const SS_SAME={'比肩':1,'食神':1,'偏财':1,'七杀':1,'偏印':1};
  const isYangGod=g=>dgYang?!!SS_SAME[g]:!SS_SAME[g];
  const SPAN=72, SEL=Math.max(0,BZ_WX5.indexOf(ZHI_WX[monthZ]));
  const curD=WHEEL.arc(R.arc,SEL*SPAN-SPAN/2,SEL*SPAN+SPAN/2);
  let s='';
  /* 外圈弧带照全站骨架：每扇区一段满弧，段间不留缝，五段首尾相接成一整圈，与长生盘、宿盘、时辰盘同一画法。
     能量分不进弧带（弧只有淡与选中两态，量值一律落在数字与文字上），由盘心那行能量百分比与盘下详情条承担。
     首屏那一格即当令五行，故选中弧出盘时即带本格 d，与万年历、老黄历首屏即当令同法。 */
  for(let i=0;i<5;i++) s+=`<path d="${WHEEL.arc(R.arc,i*SPAN-SPAN/2,i*SPAN+SPAN/2)}" class="w-arc"/>`;
  s+=`<path id="${ID}-arc" d="${curD}" class="w-arc w-arc-cur"/>`;
  for(let i=0;i<5;i++) s+=K.tick(i*SPAN);
  const det=[];
  BZ_WX5.forEach((w,i)=>{
    const pair=BZ_SS_ORDER.filter(x=>D.ssWxOf[x]===w);
    const rel=Object.keys(D.skWxOf).find(k=>D.skWxOf[k]===w)||'', nk=D.skT[rel]||0, ssw='wx-'+BZ_WX_SFX[w];
    const godYin=pair.find(x=>!isYangGod(x))||'', godYang=pair.find(x=>isYangGod(x))||'';
    const cur=(i===SEL?' w-lab-cur':''), tone=BZ_WX_TONE[w];
    const yin=D.yywx['阴'+w]||0, yang=D.yywx['阳'+w]||0;
    const ssTxt=pair.map(x=>{
      const c=D.ss[x]+(x==='比肩'?1:0);
      return `<span class="tip ${ssw}" onclick="showTip('${x}')">${x}</span>（${D.QIN_MAP[x]||'-'}）${c} 个，占 ${D.pct(c)}%，能量分 ${Math.round(D.SS_ENERGY[x])}(${D.ePct(D.SS_ENERGY[x])}%)`;
    }).join('<br>');
    s+=K.lab(R.lab0,i*SPAN,w,'w-lab w-lab-xl'+(ZHI_WX[monthZ]===w?' w-lab-j':'')+cur,i,'ring',tone);
    /* 三字分主次：两十神与五行同取五行色（与五行同属一类，可连成一句读），
       中间的旺衰为随月令而变的季节状态，只作灰字、再降一档，不与五行色字争目。 */
    s+=K.lab(R.lab1,i*SPAN-20,godYin,'w-lab w-lab-lg'+cur,i,'radial',tone);
    s+=K.lab(R.lab1,i*SPAN,D.wx[w]||'','w-lab'+cur,i,'flat',0);
    s+=K.lab(R.lab1,i*SPAN+20,godYang,'w-lab w-lab-lg'+cur,i,'radial',tone);
    det.push({ dg:i*SPAN, pct:D.ePct(D.eScore[w]), c1:`${w}${D.wx[w]||''}`, c2:`能量 ${D.ePct(D.eScore[w])}%`, c3:`不计 ${D.cnt[w]} 含藏 ${D.cnt2[w]}`,
      detail:`<span class="${ssw}">${w}</span> ${D.wx[w]}；不计藏干 ${D.cnt[w]}(${D.pct1(D.cnt[w])}%)；计入藏干 ${D.cnt2[w]}(${D.pct(D.cnt2[w])}%)；能量分 ${Math.round(D.eScore[w])}(${D.ePct(D.eScore[w])}%)；阴 ${yin}(${D.pctN(yin,yin+yang)}%)阳 ${yang}(${D.pctN(yang,yin+yang)}%)`
        +`<br>${ssTxt}`
        +`<br>与日主 ${dg}${dwx}：<span class="tip" onclick="showTip('${rel}')">${rel}</span> ${nk} 个，占 ${D.pct(nk)}%` });
  });
  const cur=det[SEL]||det[0];
  s+=K.rings+K.core(ID+'-fill',cur.pct)+K.spot(ID,cur.dg)
    +`<text x="${C}" y="${C-16}" class="w-c1" id="${ID}-c1">${cur.c1}</text>`
    +`<text x="${C}" y="${C+14}" class="w-c2" id="${ID}-c2">${cur.c2}</text>`
    +`<text x="${C}" y="${C+34}" class="w-c3" id="${ID}-c3">${cur.c3}</text>`;
  for(let i=0;i<5;i++) s+=K.hit(i*SPAN-SPAN/2,i*SPAN+SPAN/2,i,SEL,ID);
  window.__bzWheelData=window.__bzWheelData||{}; window.__bzWheelData[ID]=det;
  return `<div class="wheel-block"><h4>量化四柱圆盘</h4>`
    +`<svg class="wheel" id="${ID}" viewBox="0 0 440 440" data-src=".w-arc" role="img" aria-label="量化四柱圆盘：外圈为五行、内圈自左至右为阴十神与月令旺衰与阳十神，盘心为该扇区的旺衰与能量分与两口径计数，盘心自底往上涨的淡底水位即能量占比">${s}</svg>`
    +`<div class="wheel-detail" id="${ID}-d">${cur.detail}</div></div>`;
}
/* 十二长生盘：十二扇区＝十二支（依支序自正上顺时针，每支占 30 度，子落正上、午落正下）。
   外圈字＝地支（单字，本命四柱所落之支加重），内圈字＝日主在该支的十二长生；
   弧带为整圈淡环（段间不留缝），选中扇区另出加粗弧；盘心随选中给该支的长生、五行与本命所属。 */
function bzChangShengWheel(BZ){
  if(typeof WHEEL==='undefined' || !BZ || !BZ.gans || !BZ.zhis) return '';
  const R=BZ_WHEEL_R, K=bzWheelKit(R), C=K.C, ID='bzCsWheel';
  const dg=BZ.dayGan, zhiPos={};                                 // 本命四柱地支 → 柱名
  BZ.zhis.forEach((z,i)=>{ if(z && zhiPos[z]===undefined) zhiPos[z]=BZ_PILL[i]||''; });
  const dayZhi=BZ.zhis[2]||'', SEL=Math.max(0,ZHI_ORDER.indexOf(dayZhi));
  let s='';
  for(let i=0;i<12;i++) s+=`<path d="${WHEEL.arc(R.arc,i*30-15,i*30+15)}" class="w-arc"/>`;
  s+=`<path id="${ID}-arc" d="${WHEEL.arc(R.arc,SEL*30-15,SEL*30+15)}" class="w-arc w-arc-cur"/>`;
  for(let i=0;i<12;i++) s+=K.tick(i*30);
  const det=[];
  for(let i=0;i<12;i++){
    const z=ZHI_ORDER[i], st=getChangSheng(dg,z);
    s+=K.lab(R.lab0,i*30,z,'w-lab w-lab-xl'+(zhiPos[z]!==undefined?' w-lab-j':'')+(i===SEL?' w-lab-cur':''),i,'ring');
    s+=K.lab(R.lab1,i*30,st,'w-lab w-lab-lg'+(i===SEL?' w-lab-cur':''),i,st.length>1?'radial':'flat');
    const mean=(typeof CS_MEAN_ALL!=='undefined'&&CS_MEAN_ALL[st])?CS_MEAN_ALL[st].base:'';
    det.push({ dg:i*30, c1:st, c2:`${z}（${ZHI_WX[z]}）`, c3:(zhiPos[z]!==undefined?('本命'+zhiPos[z]+'支'):'非命局四支'),
      detail:`<span class="${WX_CLASS[ZHI_WX[z]]}">${z}</span>（${ZHI_WX[z]}）：日主 ${dg} 处 ${st}${zhiPos[z]!==undefined?('，本命'+zhiPos[z]+'支'):''}<br>${mean}` });
  }
  const cur=det[SEL]||det[0];
  s+=K.rings+K.core()+K.spot(ID,cur.dg)
    +`<text x="${C}" y="${C-16}" class="w-c1" id="${ID}-c1">${cur.c1}</text>`
    +`<text x="${C}" y="${C+14}" class="w-c2" id="${ID}-c2">${cur.c2}</text>`
    +`<text x="${C}" y="${C+34}" class="w-c3" id="${ID}-c3">${cur.c3}</text>`;
  for(let i=0;i<12;i++) s+=K.hit(i*30-15,i*30+15,i,SEL,ID);
  window.__bzWheelData=window.__bzWheelData||{}; window.__bzWheelData[ID]=det;
  return `<div class="wheel-block"><h4>十二长生盘</h4>`
    +`<svg class="wheel" id="${ID}" viewBox="0 0 440 440" data-src=".w-arc" role="img" aria-label="十二长生盘：外圈为十二支、内圈为日主十二长生，盘心为该支的长生与五行">${s}</svg>`
    +`<div class="wheel-detail" id="${ID}-d">${cur.detail}</div></div>`;
}
/* 点盘：加粗弧、指针圆点、加重字、盘心三行与盘下详情条一并跟到选中扇区。
   选中弧的 d 直接沿用该扇区的弧（量化四柱盘与长生盘同取整段满弧，由 svg 的 data-src 指定），
   不另算角度，两处角度永远同源。各项由 bzQuantWheel / bzChangShengWheel 写入 window.__bzWheelData，
   按盘 id 取第 i 项，两盘各自独立。 */
function bzWheelPick(rootId, i){
  if(typeof WHEEL==='undefined') return;
  const root=document.getElementById(rootId);
  const D=(window.__bzWheelData||{})[rootId], item=D&&D[i];
  if(!root || !item) return;
  const src=root.querySelectorAll(root.getAttribute('data-src')||'.w-arc')[i];
  WHEEL.pick(rootId, i); WHEEL.lab(rootId, i);
  const cur=root.querySelector('.w-arc-cur');
  if(cur && src) cur.setAttribute('d', src.getAttribute('d'));
  bzWheelSpot(rootId, item.dg);
  WHEEL.text(rootId+'-c1', item.c1);
  WHEEL.text(rootId+'-c2', item.c2);
  WHEEL.text(rootId+'-c3', item.c3);
  const fill=document.getElementById(rootId+'-fill');
  if(fill){ const f=WHEEL.coreFill(BZ_WHEEL_R.core, item.pct); fill.setAttribute('y', f.y); fill.setAttribute('height', f.height); }
  const el=document.getElementById(rootId+'-d');
  if(el) el.innerHTML=item.detail;
}

/* 统一渲染主体：日期模式与四柱模式共用。
   两模式只差“如何取 BZ / 输入方式片段”，其余本命、运势渲染完全一致。
   R 字段（按 mode 区分）：
     mode: 'date' | 'pillar'
     通用: cols, sex, dayGan
     date 专属: y,m,d,h,mi,lng,useTrue,tsInfo,ziNote,lunar,pj,nj,ec
     pillar 专属: yg,yz,mg,mz,dg,dz,tg,tz, hasDate, isBC, pillarChosenDate, span, candYears,
                 lunar,pj,nj,ec,y,m,d（hasDate 时才有值，否则为 null）
   本函数内按 mode 处理 ts-box / 候选确认面板 / 历史年 sub-note / 农历节气信息格 / BZ.meta / 运势分支。 */
function renderBaziPage(R, BZ = window.BZ){
  const mode=R.mode||'date';
  const {cols, sex, dayGan}=R;
  const monthZ=BZ.monthZ;
  // 盘面占位表按次重排：本函数每次重排都从零开始，上一次的盘面串不带进本次。
  BZ_WHEEL_SLOTS=[];
  let html='';
  // ===== 四大模块 head 八卦图标 =====
  // 卦符来源有定规，不得随意改动字面量或重新分配：① 基础信息 base = 按命主性别取 男乾☰/女坤☷（性别而非日主阴阳）；
  // ② 本命分析 life / 人生议题 yiti = 终身卦本卦（benInfo）的 下卦/上卦 符号；③ 易理象数 yili / 运势分析 yun = 终身卦变卦（bianInfo，本卦之变）的 下卦/上卦 符号；
  // 终身卦算不出时回退默认卦象，不阻塞渲染；结果挂 window._guaIcons 供 bazi.html 生成人生议题头复用，保证四模块一致。
  const _gua = { base:(BZ.sex===1||BZ.sex==='男'||BZ.sex===true)?'☰':'☷', life:'☳', yiti:'☴', yun:'☳', yili:'☶' };
  try{
    if(typeof lifeHex==='function' && BZ && BZ.gans && BZ.zhis){
      const _lh=lifeHex(BZ);
      if(_lh && _lh.benInfo){ _gua.life=_lh.benInfo.lsym||_gua.life; _gua.yiti=_lh.benInfo.usym||_gua.yiti; }
      if(_lh && _lh.bianInfo){ _gua.yili=_lh.bianInfo.lsym||_gua.yili; _gua.yun=_lh.bianInfo.usym||_gua.yun; }
    }
  }catch(e){}
  try{ window._guaIcons=_gua; }catch(e){}
  // ===== 一、基础信息 =====
  // 四柱候选日期确认（仅四柱模式）：未确认时列出候选、确认后显示横幅。
  let pillarConfirm='';
  if(mode==='pillar'){
    const {yg,yz,mg,mz,dg,dz,tg,tz,pillarChosenDate,span,candYears}=R;
    if(!pillarChosenDate){
      const cands=findPillarDates(yg,yz,mg,mz,dg,dz,tg,tz);
      pillarConfirm=renderConfirmPanel(yg,yz,mg,mz,dg,dz,tg,tz,cands,candYears,span);
    } else {
      const p=parseAstroDate(pillarChosenDate); const ay=p[0],m=p[1],d=p[2];
      const yLabel=ay<=0?('公元前 '+(1-ay)+' 年'):(ay+' 年');
      pillarConfirm=`<div class="confirm-banner">出生时间：${yLabel}${m}月${d}日 <span class="${WX_CLASS[ZHI_WX[tz]]}">${tz}</span>时<button type="button" class="btn gold" onclick="clearPillarDate()">更改</button></div>`;
    }
  }
  html+=pillarConfirm;
  html+=`<section class="mod" id="mod-base"><div class="mod-head" onclick="toggleMod('mod-base')"><span class="mod-caret">▾</span><span class="gua-ico">${_gua.base}</span><span class="mod-title">一、基础信息</span><span class="mod-sub">四柱 纳音 神煞 农历节气</span></div><div class="mod-body">`;
  // ts-box：按输入模式分别呈现
  if(mode==='pillar'){
    const {yg,yz,mg,mz,dg,dz,tg,tz,hasDate,pillarChosenDate,lunar}=R;
    const four=(g,z)=>wxSpan(g)+wxSpan(z);
    /* 选定日期后 ts-box 摘要行：直接调confirm面板同款农历（lunarYearLabel+月/日中文字），
       显示“公历年月日 时支 农历”，复用一个数据源，不再另拼。 */
    const birth= hasDate
      ? ('。出生时间：'+ (function(){ const p=parseAstroDate(pillarChosenDate); const ay=p[0],m=p[1],d=p[2]; const yLabel=ay<=0?('公元前 '+(1-ay)+' 年'):(ay+' 年'); const lStr=(lunar&&typeof lunar.getMonthInChinese==='function')?(lunarYearLabel(lunar, ay>=0?ay:1)+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()):''; return yLabel+m+'月'+d+'日 '+tz+'时'+(lStr?' '+lStr:''); })())
      : '';
    html+=`<div class="ts-box">输入方式：四柱干支直接排盘。 四柱：年${four(yg,yz)} 月${four(mg,mz)} 日${four(dg,dz)} 时${four(tg,tz)}。 性别：${sex?'男':'女'}${birth}</div>`;
  } else {
    const {y,m,d,h,mi,lng,useTrue,tsInfo,ziNote,lunar}=R;
    html+=`<div class="ts-box">`;
    html+=`标准时间：<b>${y}-${pad2(m)}-${pad2(d)} ${pad2(h)}:${pad2(mi)}</b>（北京时间）`;
    if(useTrue && tsInfo){
      html+=`　出生地经度：<b>${lng}°E</b>　均时差：<b>${tsInfo.E}分</b>　经度差：<b>${tsInfo.lngAdj}分</b><br>`;
      html+=`真太阳时：<b>${tsInfo.y}-${pad2(tsInfo.m)}-${pad2(tsInfo.d)} ${pad2(tsInfo.h)}:${pad2(tsInfo.mi)}</b>（${tsInfo.totalAdj>=0?'+':''}${tsInfo.totalAdj}分）`;
    }
    if(ziNote) html+=`　${ziNote}`;
    html+=`</div>`;
  }
  // 岁运时间线（baziYunDong 含约 10 大运 + 流年共 11 次 evalGZ，是全页最重计算）
  // 只在此算一次，下传给 renderOverview / renderYunDong / renderYunEventFixed；四柱表（原位置）需在 _yd 之后拼 8 列（4柱+当前大运/流年/流月/流日）
  let _Ayd=null, _yd=null;
  try{ if(BZ && BZ.ec){ _Ayd=getAnalysis(BZ); const _dy=baziDaYunSteps(BZ); _yd=baziYunDong(BZ,_Ayd,_dy); } }catch(e){ _Ayd=null; _yd=null; }
  // 当前时间所处的大运/流年/流月/流日 → 与命局四柱同构的 cols（每行齐全：主星/藏干/纳音/空亡/地势/自坐/神煞；kong 按日柱旬空同口径）
  const _yunCols=[];
  try{
    if(_yd){
      const _now=new Date(), _cy=_now.getFullYear(), _cm=_now.getMonth()+1, _cd=_now.getDate();
      let _bestDy=null;
      if(_yd.steps){ for(const s of _yd.steps){ if(!s.empty && s.year<=_cy && (!_bestDy || s.year>=_bestDy.year)) _bestDy=s; } }
      if(_bestDy && _bestDy.gz) _yunCols.push(mkYunCol('大运', _bestDy.gz, BZ));
      if(_yd.liuNian){
        const _lnGz=liunianGZ(_cy);
        if(_lnGz) _yunCols.push(mkYunCol('流年', _lnGz, BZ));
        const _lu=Solar.fromYmd(_cy,_cm,_cd).getLunar();
        if(_lu){
          const _lmGz=_lu.getEightChar().getMonth();
          const _lrGz=_lu.getDayInGanZhi();
          if(_lmGz) _yunCols.push(mkYunCol('流月', _lmGz, BZ));
          if(_lrGz) _yunCols.push(mkYunCol('流日', _lrGz, BZ));
        }
      }
    }
  }catch(e){}
  // 四柱表：4 柱 + 当前 4 运势列合并（表头第一格="四柱"；equal8=8 列等宽；日主格带性别"元男/元女"）
  html+=renderTable(_yunCols.length?[...cols, ..._yunCols]:cols, '四柱', 'equal8');
  const shenshaSummary=renderShenshaSummary(cols, '四柱基础信息表');
  // 基础信息字段流：农历、生肖、星座、二十八宿、三垣、命卦、节气
  // 与命局速览（日主、格局、喜用、身强身弱、旺衰评分）并为一条双栏字段流（与老黄历、道历同构）。
  let infoFlow='';
  if(R.lunar && R.ec){
    const {lunar,pj,nj,y,m,d}=R;
    const isBC=!!R.isBC;
    const mg = isBC ? null : ((typeof mingGuaDate==='function')?mingGuaDate(y,m,d,!!sex):mingGua(y, !!sex));
    /* cls 供个别字段指定窄屏排版变体（如三垣三段、农历两段仍留一行）；不传即用默认整行换行。
       seg 把名与值绑成不可断行的整体：窄屏若放不下，只在 bz-br 分段符处折行，
       不会把身宫丙子从中间劈开（汉字逐字皆可断行，无此约束时 320px 会断在身、宫之间）。 */
    const bi=(k,v,cls)=>`<div class="bz-i${cls?' '+cls:''}"><span class="k">${k}</span><span class="v">${v}</span></div>`;
    const seg=(t,v)=>`<span class="bz-seg">${t} ${v}</span>`;
    infoFlow+=bi('农历', `${lunarYearLabel(lunar,y)}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}<span class="bz-br"></span>${lunar.getTimeZhi()}时`, 'bz-oneline');
    infoFlow+=bi('生肖', lunar.getYearShengXiao());
    infoFlow+=bi('星座', `${Solar.fromYmd(y,m,d).getXingZuo()}座`);
    // 二十八宿与老黄历、万年历、道历同一写法：宿名＋正（七政）＋动物＋吉凶，如 轸水蚓（吉）
    infoFlow+=bi('二十八宿', `${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()}（${lunar.getXiuLuck()}）`);
    if(isBC){
      infoFlow+=bi('三垣 命卦', '公元前出生：命宫、胎元、身宫、八宅命卦因历法库对远古节气计算失真，此处暂不显示具体值，可据输入月柱与时柱自行按古法推排。');
    }else{
      infoFlow+=bi('三垣', `${seg('命宫',R.ec.getMingGong())}<span class="bz-br"></span>${seg('胎元',R.ec.getTaiYuan())}<span class="bz-br"></span>${seg('身宫',R.ec.getShenGong())}`, 'bz-oneline')
        +bi('命卦', `${mg.gua}宫 ${mg.group}`);
    }
    infoFlow+=bi('节气', `当令 ${pj.getName()} ${pj.getSolar().toYmd()}<span class="bz-br"></span>下一节 ${nj.getName()} ${nj.getSolar().toYmd()}`);
  }
  // BZ.meta：两模式统一在此设置，供复制排盘与 AI 模块取用
  BZ.meta={ sex:sex?'男':'女',
    lunarStr: (mode==='pillar' && !R.hasDate) ? `${R.yg}${R.yz} ${R.mg}${R.mz} ${R.dg}${R.dz} ${R.tg}${R.tz}` : `${lunarYearLabel(R.lunar,R.y)}${R.lunar.getMonthInChinese()}月${R.lunar.getDayInChinese()}${R.lunar.getTimeZhi()}时`,
    sx: (mode==='pillar' && !R.hasDate) ? '' : R.lunar.getYearShengXiao(),
    xz: (mode==='pillar' && !R.hasDate) ? '' : Solar.fromYmd(R.y,R.m,R.d).getXingZuo(),
    mingGong: R.ec?R.ec.getMingGong():'', taiYuan: R.ec?R.ec.getTaiYuan():'',
    jieQi: R.pj?`当令${R.pj.getName()}`:'', pillars: cols.map(c=>c.gz).join(' '),
    dayGanWx:GAN_WX[dayGan], xiu: R.lunar?`${R.lunar.getXiu()}${R.lunar.getZheng()}${R.lunar.getAnimal()}（${R.lunar.getXiuLuck()}）`:'',
    shenGong: R.ec?R.ec.getShenGong():'',
    wenChang:WENCHANG[dayGan], wenChangFang:ZHI_FANG[WENCHANG[dayGan]], tianYi:(TIANYI[dayGan]||[]).join('、') };
  infoFlow+=renderOverview(BZ, _yd);
  if(infoFlow) html+=`<div class="bz-info">${infoFlow}</div>`;
  html+=`</div></section>`;

  // ===== 二、本命分析 =====
  /* 本命分析副标题：命局断事由核心解读无条件渲染，两种输入模式一致。 */
  const lifeSub='五行旺衰 格局喜用 各流派 宜忌补救 断事 纳音';
  html+=`<section class="mod collapsed" id="mod-life"><div class="mod-head" onclick="toggleMod('mod-life')"><span class="mod-caret">▾</span><span class="gua-ico">${_gua.life}</span><span class="mod-title">二、本命分析</span><span class="mod-sub">${lifeSub}</span></div><div class="mod-body">`;
  // 五行统计 + 旺相休囚死
  const cnt=wxCount(BZ.gans, BZ.zhis);
  const cnt2=wxCountAll(BZ.gans, BZ.zhis);
  BZ.wxCnt=cnt; BZ.wxCntAll=cnt2;
  const wx=wangXiang(monthZ);
  // ===== 量化四柱（置于本命分析内最前：先观阴阳（阴阳五行量化+阴阳论命补充说明）、再五行（五行量化与旺衰），合《滴天髓》"先观帝载"；与干支关系顺序对调）=====
  // 原四表已合为一张量化四柱圆盘（旁列十二长生盘），开放置于本段首，与老黄历、佛历的盘位同例。
  html+=renderQuantify(BZ, cnt, cnt2, wx, monthZ);
  // ===== 干支关系（置于本命分析内、量化四柱之后；格式与量化四柱一致：details/zr-mod/summary）=====
  {
    const gr=REL.gz.ganPairs(BZ.gans, BZ, GAN_LAB), zr=REL.gz.zhiPairs(BZ.zhis, BZ, ZHI_LAB);
    html+=`<details class="zr-mod zr-quant" id="zr-ganzhi"><summary>干支关系</summary><div class="zr-mod-b">`;
    html+=`<div class="gz-sec">天干关系</div><div class="rel-wrap">`;
    html+= gr.length? gr.map(r=>`<span class="rel ${r.cls}" onclick="showTip('${relKeyGan(r.cls)}')">${r.text}</span>`).join('') : '<span class="sub-note">无明显合化生克</span>';
    html+=`</div>`;
    html+=`<div class="gz-sec gz-sec-2">地支关系</div><div class="rel-wrap">`;
    html+= zr.length? zr.map(r=>`<span class="rel ${r.cls}${r.cls==='xing'?' long':''}" onclick="showTip('${relKey(r.cls,r.text)}')">${r.text}</span>`).join('') : '<span class="sub-note">无明显合化刑冲</span>';
    html+=`</div>`;
    html+=`</div></details>`;
  }

  // 格局分析，喜用神（核心神煞速览在本模块“神煞”行，基础信息区不重复）
  html+=renderAnalysis(BZ, shenshaSummary, cols);
  // 纳音分析
  html+=renderNayinModule(cols, dayGan);
  // 核心解读：命局断事 / 称骨 / 十神定位 / 事业财运，婚姻感情，性格健康，家庭子女
  html+=renderCoreAnalysis(BZ);
  html+=renderRemedy(BZ);
  html+=`</div></section>`;

  // ===== 三、易理象数 =====
  html+=`<section class="mod collapsed" id="mod-yili"><div class="mod-head" onclick="toggleMod('mod-yili')"><span class="mod-caret">▾</span><span class="gua-ico">${_gua.yili}</span><span class="mod-title">三、易理象数</span><span class="mod-sub">四时运行 五德性格 四库象数</span></div><div class="mod-body">`;
  html+=renderYiliModule(BZ);
  html+=`</div></section>`;

  // ===== 四、运势分析 =====
  html+=`<section class="mod collapsed" id="mod-yun"><div class="mod-head" onclick="toggleMod('mod-yun')"><span class="mod-caret">▾</span><span class="gua-ico">${_gua.yun}</span><span class="mod-title">五、运势分析</span><span class="mod-sub">岁运引动 大运流年 一生曲线</span></div><div class="mod-body">`;
  // 四柱模式未确认出生时间：只排大运起运占位（renderPillarDaYun）；公元前：仅呈现命局本体说明
  if(mode==='pillar' && R.isBC){
    html+=`<div class="info-box"><h4>运势分析（公元前）</h4><p>本命局为公元前出生（${fmtAstroDate(R.pillarChosenDate)}），大运、流年、流月流日及一生运势曲线以公元后出生为推算基准，对公元前人物缺乏现代流年参照，且节气与真太阳时基于现代天文模型外推、公元前越久远偏差越大，故运势分析暂不展开，仅呈现命局本体（四柱，十神，格局，神煞）。如需考据岁运，可据命局十神喜忌自行推演。</p></div>`;
  } else if(mode==='pillar' && !R.hasDate){
    html+=renderPillarDaYun(BZ);
  } else {
    // 日期模式 / 四柱模式已确认且公元后：完整岁运引动 + 大运流年 + 一生曲线
    html+=renderYunDong(BZ, _Ayd, _yd);
    html+=renderYunEventFixed(BZ, _Ayd, _yd);
    html+=`<h3 class="rel-title">运程推演</h3><div class="dyn" id="dyn"></div>`;
    html+=`<h3 class="rel-title">一生运势曲线图</h3><div class="yun-crumbs" id="yunCrumbs"></div><div id="yunChartWrap"></div>`;
  }
  html+=`<div id="hexWrap">${renderHex(BZ)}</div>`;
  html+=`</div></section>`;
  return bzWheelFill(gzAllColorSpan(html));
}

/* 六十甲子索引换算与流年干支：全页唯一真源，运势曲线、候选年检索、大运延伸均由此取值。 */
function gzIndexOf(gz){ for(let k=0;k<60;k++){ if(GAN[k%10]===gz[0]&&ZHI_ORDER[k%12]===gz[1]) return k; } return 0; }
function gzAtIndex(k){ const i=((k%60)+60)%60; return GAN[i%10]+ZHI_ORDER[i%12]; }
/* 流年干支：公元 4 年为甲子年，按天文年直接取模。
   干支年以立春为界，故公历年初至立春之间的日期，其年柱应取上一年，由调用方按需处理。 */
function liunianGZ(y){ return gzAtIndex(y-4); }
function isValidGZ(g,z){ for(let k=0;k<60;k++){ if(GAN[k%10]===g&&ZHI_ORDER[k%12]===z) return true; } return false; }
/* 五虎遁：年干定寅月天干；五鼠遁：日干定子时天干 */
function wuHuDun(yg){ const m={'甲':'丙','己':'丙','乙':'戊','庚':'戊','丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'}; return m[yg]; }
function wuZhuDun(dg){ const m={'甲':'甲','己':'甲','乙':'丙','庚':'丙','丙':'戊','辛':'戊','丁':'庚','壬':'庚','戊':'壬','癸':'壬'}; return m[dg]; }
function monthGanOf(yg,mz){ const p=(ZHI_ORDER.indexOf(mz)-2+12)%12; return GAN[(GAN.indexOf(wuHuDun(yg))+p)%10]; }
function hourGanOf(dg,tz){ return GAN[(GAN.indexOf(wuZhuDun(dg))+ZHI_ORDER.indexOf(tz))%10]; }
/* lunar.js getYearInChinese() 对公元前年份返回含 undefined 的字符串（如 "undefined一五一六"），
   因为内部按公元后逻辑拼接年份。对天文年 < 1 的日期改用干支年显示，AD 日期保持原样。 */
function lunarYearLabel(lunar, solarYear){ return (solarYear>=1 ? lunar.getYearInChinese() : lunar.getYearInGanZhi())+'年'; }

/* 公元前（天文年 < 1）的月柱推算：lunar.js 对远古/BC 日期的节气（定月柱）计算严重失真，
   getMonthInGanZhi() 通常全年只返回 1~2 个错误月柱，导致反查永远找不到目标月柱。
   对 BC 日期改用近似节气推月：以现代平均节气日（忽略岁差）把公历日期映射到 12 个月建，
   再用五虎遁求月干。结果仅供文化研究参考，精度远低于公元后。 */
function approxLunarMonthNum(sm, sd){
  /* 各月进入本月月建的起始日（简化固定日）：寅月从立春约2月4日开始。
     月建顺序：寅=1，卯=2，辰=3，巳=4，午=5，未=6，申=7，酉=8，戌=9，亥=10，子=11，丑=12。 */
  const termStart = [6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7]; // 1月6小寒(丑),2月4立春(寅),...
  /* M 月大部分时间对应的月建号：M=2(寅)=1, M=3(卯)=2, ..., M=12(子)=11, M=1(丑)=12 */
  let n = ((sm - 2 + 12) % 12) + 1;
  if(sd < termStart[sm - 1]) n = ((n - 2 + 12) % 12) + 1; // 尚未到本月节气，仍属上月
  return n;
}
function approxMonthGanZhi(yg, sm, sd){
  const n = approxLunarMonthNum(sm, sd);
  const gan = GAN[(GAN.indexOf(wuHuDun(yg)) + n - 1) % 10];
  const zhi = ZHI_ORDER[(n + 1) % 12]; // n=1寅->index2, n=12丑->index1
  return gan + zhi;
}

/* 时支 -> 代表钟点（用于据候选日期重构八字；时柱已由五鼠遁确定，钟点仅取时辰中段以保证落在该时辰内） */
const TZ_HOUR={'子':0,'丑':2,'寅':4,'卯':6,'辰':8,'巳':10,'午':12,'未':14,'申':16,'酉':18,'戌':20,'亥':22};
/* 安全构造时间戳：规避 JS 引擎对公元 0-99 年自动映射为 1900-1999 的缺陷
   （new Date(y,m,d) 在 y<100 时会被 +1900，导致公元 25 年误算成 1925 年）。
   setFullYear() 不受该偏移影响，故对 <100 的年份（含 0 与负数、公元前）用 setFullYear 校正。 */
function safeTs(y,m,d){ const dt=new Date(y, m-1, d, 0,0,0,0); if(y<100) dt.setFullYear(y); return dt.getTime(); }
/* 历史年与天文年换算（无公元 0 年：1 公元前 = 天文 0，2 公元前 = 天文 -1，… 100 公元前 = 天文 -99）。
   表单“起始年、终止年”输入历史年（负数 = 公元前），日历与干支计算使用天文年。 */
function histToAstro(h){ return h<=0 ? h+1 : h; }
function astroToHist(a){ return a<=0 ? a-1 : a; }
/* 历史年 → 显示文本（负数=公元前，如 -221 → 公元前 221 年） */
function fmtHistYear(h){ return h<0 ? '公元前 '+(-h)+' 年' : h+' 年'; }
/* 天文年日期串（如 -99-01-01，注意前导负号）→ [年,月,日] 数组。
   不能用 dt.split('-')：负年串 "-2691-01-01" 会被拆成 ['','2691','01','01']（年份为空、月份变 2691）。
   用正则正确识别前导负号，否则 BC 日期在 Solar.fromYmd / 还原 / 显示处全部错位。 */
function parseAstroDate(dt){
  const m=String(dt).match(/^(-?\d+)-(\d+)-(\d+)$/);
  return m ? [+m[1], +m[2], +m[3]] : [NaN,NaN,NaN];
}
/* 天文年日期串（如 -99-01-01）→ 显示文本（如 公元前 100 年 1 月 1 日） */
function fmtAstroDate(dt){
  const p=parseAstroDate(dt); const ay=p[0],m=p[1],d=p[2];
  const yLabel = ay<=0 ? '公元前 '+(1-ay)+' 年' : ay+' 年';
  return yLabel+m+'月'+d+'日';
}

/* 单柱整体倾向：由十神喜忌 / 五行喜用 / 格局用神 综合得出（神煞与十神已在“所选干支详情”小模块呈现，此处仅给结论） */
function duanVerdict(gz, lvl, BZ){
  if(!gz||gz.length<2) return '平顺';
  const A=getAnalysis(BZ);
  const dg=BZ.dayGan, g=gz[0], z=gz[1];
  const tg=tenGod(dg,g), tz=tenGod(dg,zhiMain(z));
  // 有效喜忌十神类（synthesis 优先，特殊格=顺势；剥去“（生）”类标注后与 shenCat 类名匹配）
  const effCats=(cats)=>(cats||[]).map(s=>String(s).replace(/（.*?）/g,''));
  const xiSet=new Set(effCats(A.synthesis&&A.synthesis.xiCatsEff).length?effCats(A.synthesis.xiCatsEff):(A.fu.xiCats||[]));
  const jiSet=new Set(effCats(A.synthesis&&A.synthesis.jiCatsEff).length?effCats(A.synthesis.jiCatsEff):(A.fu.jiCats||[]));
  const xiWx=effXi(A), jiWx=effJi(A);
  const tgCat=shenCat(tg), tzCat=shenCat(tz);
  let tag='中';
  if(xiSet.has(tgCat)||xiSet.has(tzCat)) tag='喜';
  if(jiSet.has(tgCat)||jiSet.has(tzCat)) tag='忌';
  let verdict='平顺';
  if(tag==='喜') verdict='多有助益';
  else if(tag==='忌') verdict='多有波折';
  if(jiWx.indexOf(GAN_WX[g])>=0||jiWx.indexOf(GAN_WX[zhiMain(z)])>=0) verdict='多有波折';
  return verdict;
}
/* 财富量级三档分层：身强财旺可任大财 / 身财两停中财 / 财多身弱或财为忌防破耗
 * 判据：财星能量占比（_caiPct）+ 日主强弱（strong/weak）+ 财星五行喜忌
 * 外格（专旺/从格/化气）不入扶抑：喜忌顺势，喜用则任、忌则顺其势避其逆，绝不提"借印比扶身"（外格忌扶身） */
function _caiWealthTier(_caiPct, strong, weak, _xiWx, _jiWx, wealthWx, dwx, A){
  const caiXi=geWxXi(wealthWx,A), caiJi=geWxJi(wealthWx,A);
  if(geGeMode(A).isOuter) return '财星'+(caiXi?'为<span class="tip sha-ji">从喜</span>、合其从势，财运顺应而达':caiJi?'为<span class="tip sha-xiong">从忌</span>、宜避其逆、不以财论命':'与格局喜忌无涉、以常趋避');
  // 财旺（能量占比≥过旺 25%）：
  if(_caiPct>=REL.TH.PCT_OVER){
    if(caiJi) return '财旺而<span class="tip sha-xiong">为忌</span>，财多身弱反成负累、防破耗，宜以专技守财、不宜贪大';
    if(strong) return '财旺（占比'+_caiPct+'%）而日主身强可任，可谋大财、量级向上，宜敢闯善经营';
    return '财旺（占比'+_caiPct+'%）然日主偏弱（财多身弱），得之须借印比扶身方能任，防财来财去守不住';
  }
  // 财有力（占比≥有力15%）：
  if(_caiPct>=REL.TH.PCT_STRONG){
    if(caiJi) return '财星有力（占比'+_caiPct+'%）而为忌神，得之不守、宜防破耗，以专技守财为宜';
    if(strong||caiXi) return '财星有力（占比'+_caiPct+'%）'+(strong?'而身强足以任':'且为<span class="tip sha-ji">喜用</span>')+'，身财两停、可得中财、宜稳中求进';
    return '财星有力（占比'+_caiPct+'%）而身弱，宜借岁运补身再图财，中财须凭积累、防财来财去';
  }
  // 财弱：
  return '财星偏弱（占比'+_caiPct+'%）'+(caiXi?'且为<span class="tip sha-ji">喜用</span>、宜以专技慢积':'、以专技生财、宜积累')+'，量级以温饱进阶为主';
}
/* 权贵局象速览（命局断事，官杀行）：官杀能否任、贵气偏向，定性，与名利层级权贵潜力的量化分层错开
 * 判据：官杀能量占比 + 日主强弱 + 官杀五行喜忌（复用 effXi/effJi 真源） */
function _guanTier(_killPct, strong, weak, _xiWx, _jiWx, killWx, A){
  const killXi=geWxXi(killWx,A), killJi=geWxJi(killWx,A);
  if(geGeMode(A).isOuter) return '官杀'+(killXi?'为<span class="tip sha-ji">从喜</span>、从其势则贵气可承':killJi?'为<span class="tip sha-xiong">从忌</span>、宜顺其势避其逆':'与格局喜忌无涉、以常趋避');
  if(_killPct>=REL.TH.PCT_OVER){
    if(killJi) return '官杀过旺且为忌神'+((strong||!weak)?'、虽身强亦妨功名相争':'、身弱官杀压身')+'，宜借印比制忌、避争竞';
    if(strong) return '官杀强旺而身强任官，贵气显、掌权名望可期、宜乘势任事';
    return '官杀旺而日主偏弱，官多为杀、压身费力，宜扶身化官再图名位';
  }
  if(_killPct>=REL.TH.PCT_STRONG){
    if(killJi) return '官杀有力而为忌神，名位多竞争之累、宜静守避争';
    if(strong||killXi) return '官杀有力且身强（或为喜用）可任，有权位之资、宜稳扎渐进';
    return '官杀有力而身弱，官星难任、须借印比扶身待运';
  }
  // 官杀弱/不现：与前文"官杀不现/须待岁运引出"呼应，不再重述占比（不现即近0%，占比是废话）、去空泛量级词
  return '权位之象不显'+(killXi?'、然官杀为<span class="tip sha-ji">喜用</span>，宜逢官杀旺运引动以显名位':'、宜以专长立身');
}
/* 命局断事：以全局十神旺衰、神煞、特殊格局、结构病药综合推断一生易发之事 */
function duanShiMingJu(BZ){
  const A=getAnalysis(BZ);
  const dg=BZ.dayGan, dwx=GAN_WX[dg];
  const ss=ssCount(BZ.gans, BZ.zhis, dg), lq=ssLiuqin(ss);
  // 十神能量分（判定旺/丰/厚 用能量占比，个数仅展示"命局X个"）
  const _es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
  const _tenE=_es?ssTenGodEnergy(BZ, _es):null;
  const _ec={'官杀':(_tenE?((_tenE['正官']||0)+(_tenE['七杀']||0)):0),'印星':(_tenE?((_tenE['正印']||0)+(_tenE['偏印']||0)):0),'食伤':(_tenE?((_tenE['食神']||0)+(_tenE['伤官']||0)):0),'财星':(_tenE?((_tenE['正财']||0)+(_tenE['偏财']||0)):0)};
  const _et=Object.values(_ec).reduce((a,b)=>a+b,0)||1;
  const _ep=cat=>Math.round((_ec[cat]||0)/_et*100);
  // 五神断事后果句（依喜忌+旺衰，补具体人生事件；不数个数、不带能量数值）
  const _ds=(cat,wx)=>{
    const xi=geWxXi(wx,A), ji=geWxJi(wx,A);
    const e=_ep(cat);
    const ew = e>=REL.TH.PCT_VSTRONG?'旺而有力':(e>=REL.TH.PCT_STRONG?'偏旺':(e>=REL.TH.PCT_WEAK?'偏弱':'弱而少现'));
    let b;
    if(cat==='财星'){
      // 财星断语：仍按喜忌分述；仅"喜"分支再按日主旺衰+偏财透藏细化，防"身强财旺可创业"误套于身弱/财不现盘
      const _st=A.strength||'';
      const _stStrong=_st.indexOf('强')>=0, _stWeak=_st.indexOf('弱')>=0;
      const _pianTou=BZ.gans.some(g=>tenGod(dg,g)==='偏财');
      b = xi
        ? (_stWeak
            ? '宜顺取积累，以技能薪俸为本、循序渐进，财来有路'
            : (_stStrong
                ? '宜经商理财、置业投资，财来有路；身强任财可创业经营、凭专业变现'+( _pianTou?'，偏财透干更利外财机遇之财':'' )
                : '宜经商理财、置业投资，凭专业变现、循序积累为上'))
        : (ji? '财多反累，宜防破耗借贷、戒投机；财旺生官杀则压力随之，或财旺坏印不利学业根基，求财宜稳不宜赌'
            : '财宜顺取不宜强求，以技能薪俸为本，循序渐进积累为上');
    }
    else if(cat==='官杀') b = xi? '宜公职仕途、掌权得名；身强官透可任管理、立名于外，官印相生更利考试升迁' : ji? '官非压力易生，宜守规慎讼；官杀混杂或七杀无制，易遭小人是非、职务动荡，宜以印化杀、以食制杀' : '名位宜稳不宜冒进，小步积累、以实绩立信为上';
    else if(cat==='印星') b = xi? '得长辈荫庇、利考试文凭，宜养学蓄能；印旺生身可深造考证、借平台资源成长' : ji? '印旺易依赖，宜务实进取；印多为病则思多行少，宜以财破印、走向市场历练' : '学养有凭，凭积累立身，以读书沉淀为本、厚积薄发';
    else if(cat==='食伤') b = xi? '才华外显，宜技艺文采、善表达谋生；食伤生财可凭专长变现、以创意立业' : ji? '泄气分心，宜稳扎防失；食伤过旺则锋芒太露、言多招忌，宜以印制伤、收敛锋芒' : '才思可得，宜深耕一技，以专精一门手艺立身';
    else b = xi? '同侪相助，宜合伙借力；比劫帮身可借团队之力、朋友提携成事' : ji? '分财竞利，宜明算账防争；比劫夺财易因朋友破财、合作生隙，宜先小人后君子' : '无大功过，宜平和；与人和处、不争不竞为安';
    // 分段：句以；分隔，逐句成行（每句话独立成段）
    const sents=b.split('；').map(s=>s.trim()).filter(Boolean).map(s=>s.replace(/[。；\s]+$/,'')+'。');
    // 结尾句话：以喜忌＋旺衰收束（断事框必以完整句子收尾）
    const end=(xi?'此星为喜用，宜顺势取用':(ji?'此星为忌神，宜谨慎规避':'此星喜忌无涉，平处为上'))+'，'+cat+'之象'+ew+'。';
    return sents.join('<br>')+'<br>'+end;
  };
  const strong=A.strength.indexOf('强')>=0, weak=A.strength.indexOf('弱')>=0;
  const _outer=A.outer&&A.outer.isOuter;
  const _zaGe=A.isZaGe;
  // 五行喜忌（C1 唯一真源 synthesis；逐项喜忌标签用顶层 wxTag，外格自动为从喜/从忌）
  const _xiWx=(A.synthesis&&A.synthesis.xiWxEff)||[], _jiWx=(A.synthesis&&A.synthesis.jiWxEff)||[];
  const _xj=wx=>{ const _tg=geWxTag(wx,A); return _tg==='喜用'||_tg==='从喜'?('为<span class="tip sha-ji">'+_tg+'</span>'):(_tg==='忌神'||_tg==='从忌'?('为<span class="tip sha-xiong">'+_tg+'</span>'):'喜忌无涉'); };
  const rows=[];
  const wealthWx=WX_KE[dwx], killWx=Object.keys(WX_KE).find(w=>WX_KE[w]===dwx)||'', yinWx=Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===dwx)||'', shangWx=WX_SHENG[dwx];
  const cai=BZ.gans.filter(g=>{const t=tenGod(dg,g);return t==='正财'||t==='偏财';});
  const guan=BZ.gans.filter(g=>{const t=tenGod(dg,g);return t==='正官'||t==='七杀';});
  const yin=BZ.gans.filter(g=>{const t=tenGod(dg,g);return t==='正印'||t==='偏印';});
  const shang=BZ.gans.filter(g=>{const t=tenGod(dg,g);return t==='食神'||t==='伤官';});
  rows.push(['日主', `日主${dg}（${dwx}）${A.strength}，${_outer?A.outer.weakSemantics:(_zaGe?`以${A.geName}立格，喜忌从本格（喜 ${A.geUse.xi}、忌 ${A.geUse.ji}），不按扶抑身弱论`:(strong?'身强足以任财官，宜进取创收':'身弱宜借印比扶身，不宜独撑'))}${(weak&&!_outer&&!_zaGe)?'，谋事多需外力相助':''}。`]);
  // 阴阳（放日主后）：局之阴阳消长总纲，外内/日主 两类阴阳取向
  rows.push(['阴阳', yinYangDS(BZ)||' ']);
  // 五行（总纲，放十神前）：五行生克失衡为十神旺衰之源，先示失衡之象再列十神
  const _ssksx=specialShengKeNote(BZ); if(_ssksx) rows.push(['五行', _ssksx.replace(/^五行失衡之象：/,'')]);
  // 财库实判：有库支才"藏库中"，无库只能说"藏支中"（无库盘不得误写"财藏库中"）
  const _caiKu=({'木':'未','火':'戌','金':'丑','水':'辰','土':'戌'})[wealthWx]||'';
  const caiCangTxt=(_caiKu&&BZ.zhis.indexOf(_caiKu)>=0)?'财藏库中待岁运引出':'财藏支中待岁运引出';
  rows.push(['财星', `财星属${wealthWx}，${_xj(wealthWx)}，命局${lq['财星']||0}个${lq['财星']? (cai.length?'、天干透'+dedupChars(cai)+'（财气外露、来得快去得也快）':'、天干不透则'+caiCangTxt) :'、财不现、须待岁运引出'}，${_caiWealthTier(_ep('财星'), strong, weak, _xiWx, _jiWx, wealthWx, dwx, A)}。${_ds('财星',wealthWx)}`]);
  rows.push(['官杀', `官杀属${killWx}，${_xj(killWx)}，命局${lq['官杀']||0}个${guan.length?'、天干透'+dedupChars(guan)+'（事业压力或名望外显）':(lq['官杀']>0?'、天干不透则事业根基在支、宜稳扎':'、官杀不现、须待岁运引出')}，主事业${_ep('官杀')>=REL.TH.PCT_VSTRONG?'重、责任压力大':'平、宜循序渐进'}。${_guanTier(_ep('官杀'), strong, weak, _xiWx, _jiWx, killWx, A)}。${_ds('官杀',killWx)}`]);
  rows.push(['印星', `印星属${yinWx}，${_xj(yinWx)}，命局${lq['印星']||0}个${yin.length?'、天干透'+dedupChars(yin)+'（得长辈荫庇、利学业）':'、天干不透则荫庇偏暗'}，主学业长辈${_ep('印星')>=REL.TH.PCT_VSTRONG?'厚':'平'}。${_ds('印星',yinWx)}`]);
  rows.push(['食伤', `食伤属${shangWx}，${_xj(shangWx)}，命局${lq['食伤']||0}个${shang.length?'、天干透'+dedupChars(shang)+'（才华外显、善表达）':'、天干不透则才华内敛'}，主才华表达${_ep('食伤')>=REL.TH.PCT_VSTRONG?'旺':'平'}。${_ds('食伤',shangWx)}`]);
  {
    const _biCnt=lq['比劫']||0;
    const _biTou=BZ.gans.filter(g=>{const t=tenGod(dg,g);return t==='比肩'||t==='劫财';});
    let _biMean;
    if(geGeMode(A).isOuter){
      const _tg=geWxTag(dwx,A);
      _biMean=_tg==='从忌'?'比劫为从忌、帮身破从、宜避分财竞利':(_tg==='从喜'?'比劫为从喜、同类相从则势厚':'比劫喜忌无涉、以常趋避');
    } else {
      const _bbiJi=geWxJi(dwx,A);
      _biMean=(strong?'比劫帮身、身强得势，宜自立合伙、财散人聚':weak?'日主身弱'+(_biCnt>0?'、比劫可帮身、宜借同侪之力':'，比劫不现、宜自立少倚'):'比劫平和、无显著帮耗之象')+(_bbiJi?'、比劫为忌、忌分财竞利':'');
    }
    rows.push(['比劫', `比劫属${dwx}，${_xj(dwx)}，命局${_biCnt}个${_biTou.length?'、天干透'+dedupChars(_biTou):''}，${_biMean}。${_ds('比劫',dwx)}`]);
  }
  if(A.specialStruct&&A.specialStruct.length) rows.push(['特殊格局', `命带特殊格局（${[...new Set(A.specialStruct.map(s=>s.name))].join('、')}），气机回环，吉凶倍显，成败系于用神是否被引动。`]);
  if(A.structDisease&&A.structDisease.length){ const bing=A.structDisease.filter(d=>d.kind==='病'); if(bing.length) rows.push(['结构', `结构病在${bing.map(d=>d.rel).join('、')}，岁运逢之或病发，宜见结构药制化方成。`]); }
  const _shn=siHuoNote(BZ); if(_shn) rows.push(['巳火变色龙', _shn.replace(/^巳火变色龙：/,'')]);
  // 格局重心（总纲，置于表格最后一排作收束）：本局以哪种十神为主导、财官是否有力可任，富贵贫贱的顶层判据
  {
    const _ecFull={'财星':_ec['财星'],'官杀':_ec['官杀'],'印星':_ec['印星'],'食伤':_ec['食伤'],'比劫':(_tenE?((_tenE['比肩']||0)+(_tenE['劫财']||0)):0)};
    const _tot=Object.values(_ecFull).reduce((a,b)=>a+b,0)||1;
    const _domK=Object.keys(_ecFull).reduce((a,b)=>_ecFull[b]>_ecFull[a]?b:a,'财星');
    // 主导十神五行的喜忌（synthesis 唯一直源；比劫=日主五行 dwx）
    const _fx=effXi(A), _fj=effJi(A);
    const _biXi=_fx.indexOf(dwx)>=0, _biJi=_fj.indexOf(dwx)>=0;
    let _domMean;
    if(geGeMode(A).isOuter){
      const _od=wx=>geWxTag(wx,A);
      _domMean={
        '财星':`财星${_od(wealthWx)}，${_od(wealthWx)==='从忌'?'宜顺其势、不以财论命':_od(wealthWx)==='从喜'?'合其从势则财运顺达':'以常趋避'}`,
        '官杀':`官杀${_od(killWx)}，${_od(killWx)==='从忌'?'宜避其逆':_od(killWx)==='从喜'?'从其势则名位可承':'以常趋避'}`,
        '印星':`印星${_od(yinWx)}，${_od(yinWx)==='从忌'?'扶身破从、宜避':_od(yinWx)==='从喜'?'顺势得养':'以常趋避'}`,
        '食伤':`食伤${_od(shangWx)}，${_od(shangWx)==='从忌'?'逆其从势、宜避':_od(shangWx)==='从喜'?'顺势泄秀则才情得用':'以常趋避'}`,
        '比劫':`比劫${_od(dwx)}，${_od(dwx)==='从忌'?'帮身破从、宜避':_od(dwx)==='从喜'?'同类相从则势厚':'以常趋避'}`
      }[_domK]||'';
    } else {
      _domMean={
        '财星':strong?`身强足以任财，宜奋发创收`:weak?`身弱担财费力，宜借印比扶身再论财`:`身财须强，宜稳中求进`,
        '官杀':strong?`身强足以任官，主掌权名望`:weak?`身弱官杀压身，宜借印比化官、以德持位`:`须身强方能任官`,
        '印星':_biJi?`印旺为忌，宜务实求进、勿依赖守成`:(_biXi?`印为喜用，宜凭学识资历立身`:`印在局，学养有凭`),
        '食伤':strong?`食伤吐秀，才华外显利名`:weak?`食伤泄身，宜防言多损气`:`须身健方利泄秀`,
        '比劫':_biJi?`比劫夺财为忌，宜防分财竞利`:(strong?`比劫帮身得势，宜自立合伙`:_biXi?`比劫为用，宜凭自己与同侪合力`:`比劫平淡，无大功过`)
      }[_domK]||'';
    }
    const _caiGuanPct=Math.round(((_ec['财星']||0)+(_ec['官杀']||0))/_tot*100);
    const _caiXi=_fx.indexOf(wealthWx)>=0, _caiJi=_fj.indexOf(wealthWx)>=0;
    const _killXi=_fx.indexOf(killWx)>=0, _killJi=_fj.indexOf(killWx)>=0;
    let _richTxt;
    if(geGeMode(A).isOuter){
      _richTxt=(_caiXi&&_killXi)?`财官皆为从喜（占比${_caiGuanPct}%），顺其势则富且贵、名利可期`:(_caiJi||_killJi)?`然财官为从忌（占比${_caiGuanPct}%），宜顺其从势避其逆、不以逆克强求`:`财官喜忌参半（占比${_caiGuanPct}%），从其势顺其性则平`;
    } else if(_caiGuanPct>=REL.TH.PCT_OVER){
      _richTxt=(_caiXi&&_killXi)?`且财官俱旺（占比${_caiGuanPct}%）为喜用、身强可任则富贵双全，可谋进取`:(_caiJi||_killJi)?`然财官虽旺（占比${_caiGuanPct}%）为忌神、反成压身之累，宜先扶身制忌再图财官`:`且财官双旺（占比${_caiGuanPct}%）而喜忌参半，须生日主有力方能任取`;
    } else if(_caiGuanPct>=REL.TH.PCT_STRONG){
      _richTxt=(_caiXi||_killXi)?`且财官有力（占比${_caiGuanPct}%）为喜用维系、身强可任则小康向上、渐致名利`:`然财官有力（占比${_caiGuanPct}%）欠喜用接引，宜逢岁运引出方成`;
    } else {
      _richTxt=`然财官偏弱（占比${_caiGuanPct}%）尚欠成势，富贵多凭后天经营积累、待岁运补足`;
    }
    rows.push(['格局重心', `本局以${_domK}为重心：${_domMean}。${_richTxt}。`]);
  }
  const tblHtml='<div class="tbl-wrap"><table class="stab stab-ds"><tr><th>项目</th><th>断事</th></tr>'
    +rows.map(r=>'<tr><td class="lbl">'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('')
    +'</table></div>';
  return `<div class="life-card"><h5>命局断事</h5>${tblHtml}</div>`;
}
/* 首列列宽，按真实汉字渲染宽测量设置（不依赖字体/浏览器）
 * 汉字渲染宽受字体/字号/粗细影响（em/px 不能精确对应"N 个汉字"），故 DOM 实测：
 *   1. span 挂 body，复制真实 td.lbl 的字形属性（font-family/size/weight/letter-spacing），
 *      测各标签前 n 个字符的渲染宽，取最大值 textW；
 *   2. 列宽 = textW + 真实水平 padding + border + 2px 余量（padding/border 从 computed 动态取，
 *      不同汉字渲染宽有 ±2px 微差，余量防临界标签溢出）；
 *   3. inline !important 写入首行 th 与所有首列 td。
 * 处理两类表：
 *   table.stab.stab-ds（命局断事"项目"列）：电脑 n=4 / 手机 n=2；table-layout:fixed，列宽由 width 决定。
 *   table.stab.stab-gw（十神宫位，基础关系"宫位"列、六亲星"六亲"列）与 table.stab.stab-ssd（十神断语"关系"列）：
 *   首列宽跟随 stab-ds 基准（与"命局断事"一致），电脑+响应式均同值；stab-gw/stab-ssd 保持 auto 布局、仅 min-width 防内容列压缩。
 *     auto 布局下第二列长文本会把首列压到单字宽（min-content），须 min-width 防压缩。 */
function setupMingJuCol(){
  const isMob = window.innerWidth <= 760;
  /* 探测元素挂 body 而非 table：absolute 定位的 td 在表格内会塌陷为 0 宽。
     字体逐属性复制（不用 font shorthand，避免解析失败）。 */
  const csOf = t => { const rt = t.querySelector('td.lbl'); return rt ? window.getComputedStyle(rt) : null; };
  /* 测某表首列标签前 n 字最大渲染宽；返回像素宽（含 padding/边框/余量） */
  const measureCol = (t, n) => {
    const cs = csOf(t); if(!cs) return 0;
    const probe = document.createElement('span');
    probe.style.cssText =
      'position:absolute;visibility:hidden;left:-99999px;top:-99999px;white-space:nowrap;'
      + 'font-family:' + cs.fontFamily + ';'
      + 'font-size:' + cs.fontSize + ';'
      + 'font-weight:' + cs.fontWeight + ';'
      + 'letter-spacing:' + (cs.letterSpacing || 'normal') + ';';
    document.body.appendChild(probe);
    let textW = 1;
    t.querySelectorAll('td.lbl').forEach(td=>{
      const s = (td.textContent || '').trim().slice(0, n);
      if(!s) return;
      probe.textContent = s;
      const w = probe.getBoundingClientRect().width;
      if(w > textW) textW = w;
    });
    document.body.removeChild(probe);
    const padSum = (parseFloat(cs.paddingLeft)||0) + (parseFloat(cs.paddingRight)||0)
                 + (parseFloat(cs.borderLeftWidth)||0) + (parseFloat(cs.borderRightWidth)||0);
    return Math.ceil(textW + padSum + 2);
  };
  /* 把指定表首列宽设为 colW；fixed=true 时强制 table-layout:fixed（stab-ds 用） */
  const applyCol = (t, colW, fixed) => {
    if(fixed) t.style.setProperty('table-layout', 'fixed', 'important');
    const th = t.querySelector('tr:first-child > th:first-child');
    [th].concat(Array.from(t.querySelectorAll('tr > td:first-child'))).forEach(c=>{
      if(!c) return;
      c.style.setProperty('width', colW+'px', 'important');
      c.style.setProperty('min-width', colW+'px', 'important');
      c.style.setProperty('max-width', colW+'px', 'important');
      c.style.setProperty('white-space', 'normal', 'important');
    });
  };
  /* 防异常环境（无中文字体时渲染成豆腐块）：夹取合理区间 */
  const clamp = (w, lo, hi) => Math.max(lo, Math.min(hi, w));
  /* 1. 命局断事 stab-ds：以首列实测宽为准（基准），电脑 n=4 / 手机 n=2 */
  let baseCol = isMob ? 36 : 64;
  const dsTables = document.querySelectorAll('table.stab.stab-ds');
  dsTables.forEach(t=>{ const w = measureCol(t, isMob ? 2 : 4); if(w>0) baseCol = w; });
  baseCol = clamp(baseCol, isMob ? 30 : 56, isMob ? 60 : 110);
  dsTables.forEach(t=> applyCol(t, baseCol, true));
  /* 2. 十神宫位，基础关系(stab-gw) 首列宽跟随 stab-ds 基准（电脑+手机都一致）
     十神断语(stab-ssd) 例外："组合"列不走 applyCol（移动端由 CSS @media 控制 4 字折行，
     桌面端由 layoutYitiTables 处理 nowrap 整词单行），applyCol 会覆盖桌面端 nowrap，故 stab-ssd 一律清除内联交还 CSS/布局。 */
  ['table.stab.stab-gw','table.stab.stab-ssd'].forEach(sel=>{
    document.querySelectorAll(sel).forEach(t=>{
      if(sel==='table.stab.stab-ssd'){
        [t.querySelector('tr:first-child > th:first-child')]
          .concat(Array.from(t.querySelectorAll('tr > td:first-child')))
          .forEach(c=>{ if(c){ c.style.removeProperty('width'); c.style.removeProperty('min-width'); c.style.removeProperty('max-width'); c.style.removeProperty('white-space'); } });
        return;
      }
      applyCol(t, baseCol, false);
    });
  });
}
/* 无出生日期时：静态大运序列 + 各大运断事 */
function renderPillarDaYun(BZ){
  const yang=GAN.indexOf(BZ.yearGan)%2===0;
  const male=(BZ.sex===1||BZ.sex===true);
  const forward=(yang&&male)||(!yang&&!male);
  const k0=gzIndexOf(BZ.monthGan+BZ.monthZ);
  const steps=[];
  for(let i=1;i<=10;i++){ const k=forward?(k0+i)%60:((k0-i)%60+60)%60; steps.push(GAN[k%10]+ZHI_ORDER[k%12]); }
  let html=`<h3 class="rel-title">运程推演</h3>`;
  html+=`<div class="sub-note">四柱模式（未确认出生时间）：大运按${forward?'顺行':'逆行'}排布，起运岁数需确认出生时间方可推算。流年流月流日请在上方候选时间中确认出生时间后重排。</div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">大运（静态）</span><div class="dyn-static">`;
  steps.forEach((gz,i)=>{ html+=`<div class="dyn-static-item"><span class="g">${gz}</span>${ssSpan(gz, BZ)}<span class="cs">第${i+1}运</span></div>`; });
  html+=`</div></div>`;
  html+=`<h4 class="det-h">各大运整体倾向</h4><div class="info-box ds-box">`;
  steps.forEach((gz,i)=>{ html+=`<p class="ly-zh-p"><span class="ds-gz">第${i+1}运 ${gz}</span> 整体倾向：<b class="tend">${duanVerdict(gz,'大运',BZ)}</b></p>`; });
  html+=`</div>`;
  return html;
}
/* 四柱干支输入持久化：浏览器刷新会重置 <select> 的选中值（initGzSel 又会按当前日期重填），
   导致四柱在刷新后“被改回默认值”。这里用 localStorage 显式保存 8 个干支选择、输入方式、性别与已确认出生日期，
   刷新后优先恢复已保存值（仅在无保存时才用当前日期作默认）。四种输入方式的字段互不污染。 */
const PILLAR_KEY='bazi_pillar_sel_v1';
/* 三大模块折叠状态持久化：刷新后从 localStorage 读回，使展开/折叠不因重排而复位。
   仅记录三个模块的 collapsed 布尔（内部 <details> 小节不持久化）。 */
const BAZI_MOD_KEY='bazi_mod_state_v1';

function relKeyGan(cls){
  if(cls==='he') return '__HE__';
  if(cls==='sheng') return '__SHENG__';
  if(cls==='ke') return '__KE__';
  if(cls==='gchong') return '__GANCHONG__';
  if(cls==='zheng') return '__ZHENGHE__';
  if(cls==='bihe') return '__BIHE__';
  return '__HE__';
}
/* 运势列构造（与命局四柱 cols 同构）：大运/流年/流月/流日任一干支 → 完整 col 对象
   字段齐全：主星/藏干/纳音/空亡（按日柱旬空）/地势/自坐/神煞（复用 pillarShaMerged）
   神煞计算依赖 ctx（命局日/年干支 + 月柱），与 mkCol(bazi-app) 同口径 */
function mkYunCol(lbl, gz, BZ){
  const dg=BZ.dayGan, dz=BZ.dayZ, mz=BZ.monthZ, mg=BZ.monthGan;
  const g=gz[0], z=gz[1];
  const hide=HIDE[z]||[];
  const ssz=hide.map(h=>tenGod(dg,h));
  const ssg=tenGod(dg,g);
  // ctx 与四柱列 mkCol 同构（含 sex：元辰按性别+年干阴阳分甲乙二表，缺 sex 则该神煞永缺）
  const ctx={dayGan:dg, yearZ:BZ.yearZ, monthZ:mz, dayZ:dz, monthGan:mg, gans:BZ.gans, sex:BZ.sex};
  // 空亡口径必须与四柱列一致：day 轴=各柱自身旬空 / year 轴=年柱旬空（读页面 bKong，缺省走 day）
  let _ka='day'; try{ const _el=document.getElementById('bKong'); if(_el) _ka=_el.value; }catch(e){}
  const _kong= _ka==='year' ? kongWang(BZ.yearGan+BZ.yearZ) : kongWang(gz);
  return {
    lbl, gz, g, z, hide, ssz, ssg,
    ny: nayinOf(gz),
    di: getChangSheng(dg,z),
    di2: getChangSheng(g,z),
    kong: _kong,
    flags: {},
    yun: true,                       // 运势列标记：CSS 仅对此列紧凑（padding/字号），4 柱保持原样式
    sha: pillarShaMerged({gz, z, gan:g, isYear:false, isMonth:false, isDay:false, isTime:false}, ctx)
  };
}
function relKey(cls, text){
  if(cls==='he'){ if(text.indexOf('三合')>=0) return '__SANHE__'; if(text.indexOf('三会')>=0) return '__SANHUI__'; if(text.indexOf('合而不化')>=0) return '__HEBUHUA__'; return '__HE6__'; }
  if(cls==='sheng') return '__SHENG__';
  if(cls==='ke') return '__KE__';
  if(cls==='chong') return '__CHONG__';
  if(cls==='xing') return '__XING__';
  if(cls==='hai') return '__HAI__';
  if(cls==='po') return '__PO__';
  if(cls==='anhe') return '__ANHE__';
  if(cls==='gchong') return '__GANCHONG__';
  if(cls==='zheng') return '__ZHENGHE__';
  return '__HE__';
}
/* 神煞 span 公共模板（<br> 每行一个）：四柱表（renderTable 神煞行）与干支详情表（cellSha）共用，
   两处共用同一模板，结构变更时不会漂移。
   查法后缀（纳音）只作弹框内容标注，表格显示纯神煞名以保持整洁：数据源条目形如"寡宿（纳音）"，
   显示取 base，弹框 key 追加 \u0001nayin 标记，由 showTip 在弹框中注明"纳音查法"。 */
const SHA_NAYIN_TAG='\u0001nayin';
function shaSpans(shaList){
  return shaList.map(s=>{ const nyr=/（纳音）$/.test(s); const b=s.replace(/（[^）]+）$/,'');
    return `<span class="tip sha-${shaCat(b)} wx-skip" onclick="showTip('${b}${nyr?SHA_NAYIN_TAG:''}')">${b}</span>`; }).join('<br>');
}
/* 去括号→空格：犯太岁等数据源带"（…）"说明时统一转空格（与运势行省略括号语义一致） */
function stripParens(x){ return x.replace(/[（(）)]/g,' ').replace(/\s+/g,' ').trim(); }

function renderTable(cols, head, cls){
  const _h=head||'四柱';
  const _cls=cls?' '+cls:'';
  // 性别置顶模式：表头第一格直接显示性别值（"男"/"女"）时，主星行日主格不显示性别（八字页 8 列版）；
  // 其他页面传"四柱"保持原样（日主格仍显示"元男/元女"）
  const _sexTop=(_h==='男'||_h==='女');
  const headTpl=`<tr><th>${_h}</th>${cols.map(c=>`<th class="zhu">${c.lbl}</th>`).join('')}</tr>`;
  const xing=`<tr><td class="small">主星</td>${cols.map(c=>{
    if(c.ssg==='日主'){ const dc=WX_CLASS[GAN_WX[c.g]]||''; return `<td class="small"><b class="${dc}">元</b>${_sexTop?'':`<span class="sex-${BZ&&BZ.sex?'m':'f'}">${BZ&&BZ.sex?'男':'女'}</span>`}</td>`; }
    const cls2=WX_CLASS[GAN_WX[c.g]]||''; const full=c.ssg; const ab=tgAbbr(c.ssg);
    return `<td class="small"><span class="tip ${cls2}" onclick="showTip('${full}')">${ab}</span></td>`;
  }).join('')}</tr>`;
  const gan=`<tr><td class="small">天干</td>${cols.map(c=>`<td>${wxSpan(c.g)}</td>`).join('')}</tr>`;
  const zhi=`<tr><td class="small">地支</td>${cols.map(c=>`<td>${wxSpan(c.z)}</td>`).join('')}</tr>`;
  const hide=`<tr><td class="small">藏干</td>${cols.map(c=>`<td class="small">${c.hide.map((k,i)=>`${wxSpan(k)}<span class="tip ${WX_CLASS[GAN_WX[k]]||''}" onclick="showTip('${c.ssz[i]}')">${tgAbbr(c.ssz[i])}</span>`).join('<br>')}</td>`).join('')}</tr>`;
  const nayin=`<tr><td class="small">纳音</td>${cols.map(c=>`<td class="small"><span class="tip" onclick="showTip('__NAYIN__','${c.ny}')">${nayinColorSpan(c.ny)}</span></td>`).join('')}</tr>`;
  const kong=`<tr><td class="small">空亡</td>${cols.map(c=>`<td class="small kong-cell">${c.kong.join(' ')||'无'}</td>`).join('')}</tr>`;
  const dishi=`<tr><td class="small">地势</td>${cols.map(c=>`<td class="small">${c.di?`<span class="tip ${WX_CLASS[ZHI_WX[c.z]]||''}" onclick="showTip('${csKey(c.di)}')">${c.di}</span>`:'无'}</td>`).join('')}</tr>`;
  const zizuo=`<tr><td class="small">自坐</td>${cols.map(c=>`<td class="small">${c.di2?`<span class="tip ${WX_CLASS[ZHI_WX[c.z]]||''}" onclick="showTip('${csKey(c.di2)}')">${c.di2}</span>`:'无'}</td>`).join('')}</tr>`;
  // 墓库行：该柱地支若为辰戌丑未则标库名（水库/火库/金库/木库），否则 -；库名首字按所藏五行着色，尾字"库"取金色；库名点击弹出释义（showTip 读 DICT['水库'/'火库'/'金库'/'木库']）
  const _muMap={辰:'水库',戌:'火库',丑:'金库',未:'木库'};
  const _kuWx={辰:'水',戌:'火',丑:'金',未:'木'};
  const muku=`<tr><td class="small">墓库</td>${cols.map(c=>{ const _m=_muMap[c.z]; return `<td class="small">${_m?`<span class="tip ${WX_CLASS[_kuWx[c.z]]||''}" onclick="showTip('${_m}')">${_m[0]}</span><span style="color:var(--gold2);font-weight:400">${_m[1]}</span>`:'-'}</td>`; }).join('')}</tr>`;
  const sha=`<tr><td class="small">神煞</td>${cols.map(c=>`<td class="small">${c.sha.length?shaSpans(c.sha):'无'}</td>`).join('')}</tr>`;
  return `<table class="bazi-table${_cls}">${headTpl}${xing}${gan}${zhi}${hide}${nayin}${kong}${dishi}${zizuo}${muku}${sha}</table>`;
}
/* 神煞信息过载治理：四柱表逐柱罗列全部神煞易过载。此处聚合全命局神煞，按“吉凶权重”排序，
   给出核心神煞速览（吉、凶分列，取权重最高者），点击仍弹出详解；完整清单保留在四柱基础信息表内供细查。 */
function renderShenshaSummary(cols, where){
  // 神煞聚合，权重排序，吉凶分组统一走 REL.sha（bazi-rel.js 基础判定唯一归集处）
  const top=REL.sha.top(cols,5);
  if(!top.length) return '';
  const parts=REL.sha.groupParts(top);
  return `<div class="sub-note shensha-top">核心神煞速览（按吉凶权重 Top ${top.length}，点击看详解；全部见${where||'上表'}）：${parts.join('　|　')}</div>`;
}
/* 神煞行“本命带”聚合：神煞名可点击弹说明（与四柱基础信息表一致），附所临柱标签 */
function renderBenmingClickable(cols){
  // 神煞聚合统一走 REL.sha.collect（bazi-rel.js 基础判定唯一归集处）
  const seen={}; REL.sha.collect(cols).forEach(o=>{ seen[o.name]=o; });
  const hit=['天乙贵人','羊刃','禄神','文昌贵人','驿马','桃花','华盖','太极贵人'].filter(s=>seen[s]);
  if(!hit.length) return '核心神煞（贵人、羊刃、驿马、桃花、华盖等）未显。';
  return '本命带 '+hit.map(s=>{ const o=seen[s]; return `<span class="tip sha-${shaCat(s)} wx-skip" onclick="showTip('${s}')">${s}</span>（${o.pillars.join('、')}）`; }).join('、')+'。';
}
/* 核心神煞（按吉凶权重取前 5，吉、凶分列）点击弹说明，供“神煞”行内文昌、天乙段落收尾使用 */
function coreShenshaHtml(cols){
  // 与 renderShenshaSummary 同源，统一走 REL.sha（bazi-rel.js 基础判定唯一归集处）
  const top=REL.sha.top(cols,5);
  if(!top.length) return '核心神煞按吉凶权重前5，本命未见显著神煞。';
  return `核心神煞按吉凶权重前5，${REL.sha.groupParts(top).join('；')}。`;
}

/* ============ 纳音深度分析模块 ============
   纳音五行由干支纳音推得（见 NAYIN_INFO），常与该柱干支正五行不同，
   是子平之外的独立辅助体系。年柱纳音为“本命（年命）”，地位最重。 */
function nayinWxOf(gz){ const info=NAYIN_INFO[nayinOf(gz)]; return info?info.wx:''; }
/* 纳音自坐：纳音五行在其本柱地支的十二长生。纳音五行折成可入长生的本气阳干（走全站单点 WX_TO_STEM），
   如甲子纳音海中金，金（庚）在子为死；与四柱基础表的“自坐”行（该柱天干在本柱地支）是两回事，
   前者论纳音之气旺衰，后者论正五行天干之气，须并看不混。 */
function nayinZizuo(gz){ const g=WX_TO_STEM[nayinWxOf(gz)]; return (g&&gz&&gz[1])?getChangSheng(g, gz[1]):''; }
function renderNayinModule(cols, dayGan){
  const dwx = GAN_WX[dayGan] || '';
  let _A=null; try{ _A=getAnalysis(BZ); }catch(e){ _A=null; }
  const labels = ['年柱','月柱','日柱','时柱'];
  const nys = cols.map(c=>c.ny);
  const nWx = cols.map(c=>nayinWxOf(c.gz));

  let h = `<details class="zr-mod zr-quant" id="zr-nayin"><summary>纳音</summary><div class="zr-mod-b"><div class="nayin-wrap">`;

  // 1. 四柱纳音总览：逐柱取象本义（NAYIN_INFO.d，三十条各别）与纳音自坐（纳音五行在本柱地支的长生）
  h += `<div class="nayin-h">四柱纳音总览（逐柱干支、取象与自坐）</div>`;
  h += `<div class="info-box nayin-box"><table class="bazi-table nayin-rel">
    <tr><th>柱</th><th>干支</th><th>纳音</th><th>五行</th><th>纳音自坐</th><th>取象本义</th></tr>`;
  for(let i=0;i<4;i++){
    const _lab = i===0? '年柱（年命）' : labels[i];
    const _cs = nayinZizuo(cols[i].gz);
    h += `<tr><td class="small">${_lab}</td><td class="small">${cols[i].g||''}${cols[i].z||''}</td><td class="small">${nayinColorSpan(nys[i])}</td><td class="small"><span class="${WX_CLASS[nWx[i]]||''}">${nWx[i]}</span></td><td class="small">${_cs||'无'}</td><td class="small">${(NAYIN_INFO[nys[i]]||{}).d||'无'}</td></tr>`;
  }
  h += `</table></div>`;
  h += `<p class="ly-zh-p">纳音自坐＝该柱纳音五行折本气阳干后，在本柱地支所得十二长生（如甲子纳音海中金，金死于子，其纳音自坐为死）；与四柱基础表所记“自坐”（该柱天干在本柱地支）为两套口径，并行参看。四卡（事业、婚姻、健康、家庭）的纳音表同此收尾。</p>`;

  // 2. 纳音六亲宫与生克（以年命为基准）

  const yN=nys[0], yW=nWx[0];
  // 年命纳音为身，月纳音主父母兄弟宫、日纳音主夫妻宫、时纳音主子息宫；各宫读本柱纳音相对年命之向，
  //   释义统一读顶层真源 NAYIN_GONG_MEAN 的 gong 字段（bazi-data.js）
  const gongLab={'月':'月柱（父母兄弟）','日':'日柱（夫妻）','时':'时柱（子息）'};
  const gongKey=['','月','日','时'];
  h += `<div class="nayin-h">纳音六亲宫与生克（以年命 ${nayinColorSpan(yN)} 为基准）</div>`;
  h += `<div class="info-box nayin-box"><table class="bazi-table nayin-rel">
    <tr><th>宫位</th><th>纳音</th><th>五行</th><th>与年命关系</th><th>倾向</th><th>宫位释义</th></tr>`;
  for(let i=1;i<4;i++){
    const r = wxRel(yW, nWx[i]);
    const _gm = ((NAYIN_GONG_MEAN[gongKey[i]]||{})[r.rel]||{}).gong || '';
    h += `<tr><td class="small">${gongLab[gongKey[i]]}</td><td class="small">${nayinColorSpan(nys[i])}</td><td class="small"><span class="${WX_CLASS[nWx[i]]||''}">${nWx[i]}</span></td><td class="small">${r.rel||'无'}</td><td class="small">${r.tone||'无'}</td><td class="small">${_gm||'无'}</td></tr>`;
  }
  h += `</table></div>`;

  // 3. 纳音与日主（以日干正五行为“我”）
  const relNote2 = {
    '比和':'纳音同气于日主，助力相投',
    '生我':'纳音生日主，得纳音之气生扶',
    '我生':'日主生纳音，泄我之气',
    '克我':'纳音克日主，纳音来制',
    '我克':'日主克纳音，可得纳音之材'
  };
  h += `<div class="nayin-h">纳音与日主（${dayGan} ${dwx}）</div>`;
  h += `<div class="info-box nayin-box"><table class="bazi-table nayin-rel">
    <tr><th>柱</th><th>纳音</th><th>五行</th><th>与日主关系</th><th>倾向</th><th>传统释义</th></tr>`;
  for(let i=0;i<4;i++){
    const r = wxRel(dwx, nWx[i]);
    const tag = i===0?`（本命）`:'';
    h += `<tr><td class="small">${labels[i]}${tag}</td><td class="small">${nayinColorSpan(nys[i])}</td><td class="small"><span class="${WX_CLASS[nWx[i]]||''}">${nWx[i]}</span></td><td class="small">${r.rel||'无'}</td><td class="small">${r.tone||'无'}</td><td class="small">${r.rel?relNote2[r.rel]:''}</td></tr>`;
  }
  h += `</table></div>`;

  // 4. 纳音与正五行双轨取法（同柱二者不一致时的体用取舍，纳音定位的说明块）
  h += `<div class="nayin-h">纳音与正五行（双轨取法）</div>`;
  h += `<div class="info-box nayin-box nayin-bd"><p class="ly-zh-p">同一柱的纳音五行与其干支正五行常不相同，二者并行不悖：正五行论质，为子平法之本，定十神、格局、旺衰、喜忌；纳音论气，为禄命古法之别传，定年命气象、六亲宫向背与取象之性。同柱两轨相合，则气象与格局一致、其应较显；两轨相违，则须以正五行为体、纳音为用，取其参证而不偏执。本模块各表皆本此双轨立说。</p></div>`;

  // 5. 综合参考（基于以上结构动态生成）
  h += `<div class="nayin-h">纳音综合参考</div>`;
  h += `<div class="info-box nayin-box nayin-bd">`;
  const notes = [];
  let shengWo=0, bihe=0, woKe=0, keWo=0, woSheng=0;
  for(let i=1;i<4;i++){ const r=wxRel(yW,nWx[i]); if(r.rel==='生我')shengWo++; else if(r.rel==='比和')bihe++; else if(r.rel==='我克')woKe++; else if(r.rel==='克我')keWo++; else if(r.rel==='我生')woSheng++; }
  if(shengWo>0) notes.push(`月日时中有 ${shengWo} 柱纳音生助年命，主根基得外扶、祖荫可承`);
  if(bihe>0) notes.push(`月日时中有 ${bihe} 柱与年命纳音比和，同气巩固`);
  if(woKe>0) notes.push(`月日时中有 ${woKe} 柱被年命所克，主可得财用、能动`);
  if(keWo>0) notes.push(`月日时中有 ${keWo} 柱纳音克年命，传统谓早岁离祖、六亲宜远${keWo>=2?'（多重克制，其象较显）':''}，须结合全局强弱参看`);
  if(woSheng>0) notes.push(`月日时中有 ${woSheng} 柱受年命所生，主泄气付出`);
  const yd = wxRel(yW, dwx);
  if(yd.rel==='生我') notes.push(`年命纳音 ${nayinColorSpan(yN)}（${yW}）生日主 ${dayGan}（${dwx}），纳音之气可补日主`);
  else if(yd.rel==='克我') notes.push(`年命纳音 ${nayinColorSpan(yN)}（${yW}）克日主 ${dayGan}（${dwx}），纳音来制；日主为${_A?_A.strength:''}（旺衰评分 ${_A?_A.score.toFixed(1):''}）：${_A&&_A.strength.indexOf('强')>=0?'日主有力可承此纳音之制':'日主偏弱，宜岁运补足日主以受此纳音之制'}`);
  else if(yd.rel==='比和') notes.push(`年命纳音 ${nayinColorSpan(yN)}（${yW}）与日主（${dwx}）同气，本命与日主一气`);
  else if(yd.rel==='我生') notes.push(`年命纳音 ${nayinColorSpan(yN)}（${yW}）受日主所生，日主泄气于年命`);
  else if(yd.rel==='我克') notes.push(`年命纳音 ${nayinColorSpan(yN)}（${yW}）为日主所克，日主可得年命之材`);
  if(!notes.length) notes.push('四柱纳音与年命、日主关系平稳，无明显旺克之象');
  // 纳音格局一句话定性（提升综合参考的抓手）
  const otherCnt = shengWo+bihe+woKe+keWo+woSheng;
  let toneJudge='';
  if(otherCnt>0){
    if(keWo>=2) toneJudge='；纳音格局以“克我”为重，早年离祖、自力倾向较显，宜以日主旺衰权衡轻重';
    else if(shengWo>0 && keWo===0) toneJudge='；纳音格局以“生我”为主，祖荫外扶可承';
    else if(bihe>0 && shengWo===0 && keWo===0) toneJudge='；纳音格局以“比和”为主，同气巩固';
    else toneJudge='；纳音生克互见，格局尚平';
  }
  h += `<p class="ly-zh-p">${notes.join('；')}${toneJudge}。</p>`;
  h += `</div>`;

  // 6. 口径公示：纳音在禄命古法与子平法中的地位及本站取舍立场（折叠，仅页面内，不动说明文档页）
  h += `<details class="zr-mod zr-quant" id="zrNayinNote"><summary>口径说明：纳音的地位与本站立场</summary><div class="zr-mod-b"><p class="ly-zh-p">纳音为子平之外的独立辅助体系。禄命古法以年命纳音为身，论命以纳音为纲；自徐子平立正五行之说而后，子平法以正五行为主体、纳音为辅，明《三命通会》亦言“谈命者多不取纳音”。本站以正五行定十神、格局、旺衰、喜忌并断吉凶，纳音诸表只作气象、六亲与取象之辅助参证，不专以纳音定祸福。两说并存，用者各取所需。</p></div></details>`;

  h += `</div></details>`;
  return h;
}

/* ============ 格局分析，喜用神（扶抑、调候、通关、格局）============
   baziAnalysis 为全局函数（定义于 assets/bazi-data.js）；本页仅保留渲染函数 renderAnalysis。 */

/* 岁运引动：key 为空时给出原因说明 */
function yunKeyReason(s){
  if(s.keys && s.keys.length) return s.keys.join('；');
  let base='与原局干支无明显冲、合、刑、害、破、暗合，亦无三合三会引动，气机静守';
  if(s.xiHits>0) return base+'；该运五行'+s.eff+'，平稳得力';
  if(s.jiHits>0) return base+'；该运五行'+s.eff+'，平稳受制';
  return base+'，岁运平顺无剧烈引动';
}
/* 十神阴阳（有情无情）：官杀/财星两行，无则明示不现
 * 供事业财运'1、本命基调'调用（量化四柱'阴阳五行量化'表不涉十神）；
 * 婚姻④配偶星已有正偏分论（配偶星视角），此处不重复。 */
function shiYinYangNote(BZ){
  // 固定顺序 正财→偏财→正官→七杀；无则该项不输出（确认无后省略，原局已有缺失表述不重复）；
  // 只列位置/透藏本中余气/能量档/阴阳定性/落点尾句；禁生造词、结尾必句号。
  const dg=BZ.dayGan;
  const PAL=['年','月','日','时'];
  const _loc=god=>{
    const out=[];
    BZ.gans.forEach((g,i)=>{ if(i!==2&&tenGod(dg,g)===god) out.push(PAL[i]+'干透出'); });
    BZ.zhis.forEach((z,i)=>{ (HIDE[z]||[]).forEach((h,k)=>{ if(tenGod(dg,h)===god) out.push(PAL[i]+'支'+z+(k===0?'本气':k===1?'中气':'余气')); }); });
    return out;
  };
  // 落点尾句（标准表述）：透干外显有力 / 本气根基稳固 / 中余气微须岁运引出
  const _tail=loc=>loc.some(x=>x.indexOf('透出')>=0)?'，外显有力':loc.some(x=>x.indexOf('本气')>=0)?'，根基稳固':'，气微、须岁运引出';
  // 能量档：对应五行占比<10%="平和而势弱"（与量化四柱/婚姻④同口径）
  const eS=wxElementScore(BZ);
  const eT=Object.values(eS).reduce((a,b)=>a+b,0)||1;
  const _eW=wx=>{ const pct=Math.round((eS[wx]||0)/eT*100); return pct<10?'平和而势弱':(pct>=30?'偏旺':(pct>=20?'平中':'平和')); };
  const zc=_loc('正财'), pc=_loc('偏财'), zg=_loc('正官'), qs=_loc('七杀');
  const eCai=_eW('土'), eGuan=_eW('火');
  const parts=[];
  if(zc.length) parts.push('正财'+zc.join('、')+'，'+eCai+'，阴阳正配、主正业稳定之财'+_tail(zc)+'。');
  if(pc.length) parts.push('偏财'+pc.join('、')+'，'+eCai+'，同性偏缘、主人脉浮动之财'+_tail(pc)+'。');
  if(zg.length) parts.push('正官'+zg.join('、')+'，'+eGuan+'，阴阳异性相克为有情之克，主名分与约束'+_tail(zg)+'。');
  if(qs.length) parts.push('七杀'+qs.join('、')+'，'+eGuan+'，同气相克为无情之克，主压力与威权、须制化'+_tail(qs)+'。');
  if(!parts.length) return '';
  return '十神阴阳：'+parts.join('<br>');
}

/* 命局断事"阴阳"行（置于日主之后）：完整输出 renderYinYangNote 的分项（干支阴阳/外内/平衡/交感/五行四象/日主），
 * 各带前缀、原样呈现，不精简、不合并去重。
 * 五行四象并入本处（首列"五行四象"行紧随阴阳，非独立"五行"行，量化盘已含五行分项）。 */
function yinYangDS(BZ){
  try{
    const full=renderYinYangNote(BZ);
    const segs=full.split('<br>').map(s=>s.trim()).filter(Boolean);
    const parts=segs;
    if(!parts.length) return ' ';
    // 用户目标前缀："干支"（非"干支阴阳"）、"外内"、"平衡"、"交感"、"五行四象"、"日主"
    const map={'干支阴阳':'干支','外内':'外内','平衡':'平衡','交感':'交感','五行四象':'五行四象','日主':'日主'};
    const out=parts.map(s=>{ const m=/^([^：:]+)[：:]/.exec(s); if(m&&map[m[1]]) return map[m[1]]+'：'+s.slice(m[0].length); return s; })
      // 日主行："日主X为阴/阳干：" 用分号承接其后的主叙述（"日主丁为阴干；主柔顺内敛…"），非冒号
      .map(x=>/^日主：/.test(x)? x.replace(/^(日主：日主[^为：:]+为[阴阳]干)[：:]/,'$1；') : x);
    return out.map(x=>x.replace(/[。；\s]+$/,'')+'。').join('<br>');
  }catch(e){ return ' '; }
}

/* 阴阳论命 补充说明文本：逐条给出命局阴阳的分项（干支阴阳→外内→平衡→孤阴孤阳→五行四象→日主），
 * 由命局断事"阴阳"行取用，量化四柱圆盘下只留命局级两组数（阴阳占比、生助克泄）。
 * 《滴天髓·天道》"欲识三元万法宗，先观帝载与神功"一段为该体系之总纲，本函数只出分项、不含总纲引文。
 * 占比数据引用上表（阴/阳合计），不重复统计；禁破折号、禁生搬'外阳内阴'套话。 */
function renderYinYangNote(BZ){
  const gans=BZ.gans, zhis=BZ.zhis, dg=BZ.dayGan;
  const GN=(typeof window!=='undefined'&&window.GAN_NATURE)?window.GAN_NATURE:{};
  const isY=c=>YANG.indexOf(c)>=0;
  const gYY=gans.map(g=>isY(g)?'阳':'阴');
  const zYY=zhis.map(z=>isY(z)?'阳':'阴');
  const gYg=gans.filter(g=>isY(g)), gYin=gans.filter(g=>!isY(g));
  const zYg=zhis.filter(z=>isY(z)), zYin=zhis.filter(z=>!isY(z));
  const yy=yyCount(gans,zhis);
  const parts=[];
  // 干支阴阳：天干/地支按阴阳同类合并且去重（全阳→"X、Y属阳"、全阴→"X、Y属阴"、混合→"X属阳、Y属阴"），
  // 避免逐字加（阳/阴）啰嗦、避免同干重复（如 丁己丁己 → 丁、己）
  const _groupYY=items=>{ const yset=new Set(),iset=new Set(); items.forEach(x=>(x.y?yset:iset).add(x.z)); const ys=[...yset].join('、'),is_=[...iset].join('、'); if(!yset.size)return {all:'阴',s:is_+'，属阴'}; if(!iset.size)return {all:'阳',s:ys+'，属阳'}; return {all:'',s:ys+'属阳、'+is_+'属阴'}; };
  const _gYY=_groupYY(gans.map(g=>({z:g,y:isY(g)}))), _zYY=_groupYY(zhis.map(z=>({z,y:isY(z)})));
  parts.push('干支阴阳：天干'+_gYY.s+'，阳干'+gYg.length+'个、阴干'+gYin.length+'个；地支'+_zYY.s+'，阳支'+zYg.length+'个、阴支'+zYin.length+'个。');
  const waiNei = (gYg.length>=3&&zYin.length>=3)?'天干多阳、地支多阴，外阳内阴、阴阳和合，外显阳刚之形、内蓄阴柔之质'
    : (gYin.length>=3&&zYg.length>=3)?'天干多阴、地支多阳，外阴内阳、阴阳交济，外显柔顺之表、内蓄刚健之气'
    : (gYg.length>=3&&zYg.length>=3)?'天干地支皆多阳，表里同气偏阳，刚健外显而少柔济'
    : (gYin.length>=3&&zYin.length>=3)?'天干地支皆多阴，表里同气偏阴，柔顺内敛而少阳振'
    : '天干地支阴阳参差，表里各有偏倚，刚柔随位而施';
  parts.push('外内：'+waiNei+'。');
  const yinPct=yy.total?Math.round(yy.yin/yy.total*100):50, yangPct=100-yinPct;
  const balance = yinPct>=60?'全局阴盛，阴柔之气偏重':yangPct>=60?'全局阳盛，阳刚之气偏重':'全局阴阳相济，刚柔得以互补';
  parts.push('平衡：'+balance+'。');
  // 交感：阴阳偏枯之象（孤阴孤阳为阴阳总则，孤阳不长、孤阴不生，非医书专属，命理阴阳论与之同源）
  if(yangPct>=75) parts.push('交感：阳多阴少近于孤阳，孤阳不长、须阴承方能生化。');
  else if(yinPct>=75) parts.push('交感：阴多阳少近于孤阴，孤阴不生、须阳济方能发用。');
  else if(gYg.length===4) parts.push('交感：天干四阳并透，阳不独生、须地支阴支承托方不浮亢。');
  else if(gYin.length===4) parts.push('交感：天干四阴并透，阴不独成、须天干阳干引动方有发越。');
  // 五行四象（五类全列：木火阳、金水阴、土中和，禁只报木火）
  const eS=wxElementScore(BZ);
  const yangE=(eS['木']||0)+(eS['火']||0), yinE=(eS['金']||0)+(eS['水']||0), tuE=eS['土']||0, eT=yangE+yinE+tuE||1;
  const yPct=Math.round(yangE/eT*100), iPct=Math.round(yinE/eT*100), tPct=Math.round(tuE/eT*100);
  const sixiang = (yangE/eT>=0.55)?('阳类（木火）气旺，阳类占'+yPct+'%、阴类占'+iPct+'%、土中和占'+tPct+'%，阳主外发进取')
    : (yinE/eT>=0.55)?('阴类（金水）气旺，阴类占'+iPct+'%、阳类占'+yPct+'%、土中和占'+tPct+'%，阴主内收敛藏')
    : ('阴阳消长均衡，阳类占'+yPct+'%、阴类占'+iPct+'%、土中和占'+tPct+'%，刚柔得中');
  parts.push('五行四象：'+sixiang+'（木为少阳、火为太阳、金为少阴、水为太阴、土为中和承转）。');
  // 日主交感（日主阴阳 × 全局阴阳）：阴阳为性情之总纲，阳主刚健发越、阴主柔顺承藏，各有发力方式，
  // 非定高下；魄力执行力在阳为外显冲劲、在阴为蓄势韧劲，故深述其正反与偏枯之忌
  const gn=GN[dg]||{}, dYY=gn.yy||(isY(dg)?'阳':'阴');
  const yangShen = (dYY==='阳')
    ? '日主'+dg+'为阳干：主刚健外放、主动进取，魄力外显而执行力果决，行事径其发越、敢作敢当，亦防性急气盛、欠审慎；逢全局阴盛则外刚内柔、以柔济刚，行事外放而心有收敛'
        + (yinPct>=60?'':'') + (yangPct>=75?'，惟阳亢气浮、宜阴承以敛':'')
    : '日主'+dg+'为阴干：主柔顺内敛、善承善藏，绵密持重而不争锋；魄力内蕴而执行力赴于坚持，行事谋定后动、以柔克刚、坚韧耐久，非无主见而是蓄势后发'
        + (yangPct>=60?'，逢全局阳盛则外柔内刚、以刚补柔，性虽柔顺而志有主张':'')
        + (yinPct>=75?'，惟阴重气滞、须阳济以振':'');
  parts.push('日主：'+yangShen+'。');
  return parts.join('<br>');
}

/* 量化四柱：以“计入藏干”全量为分母，把阴阳五行、五行旺衰、十神六亲、生克四组含量合成一张
   五扇区圆盘（量化四柱圆盘），旁列十二长生盘。逐项数值由盘下详情条按扇区给出，不再另铺表格。 */
function renderQuantify(BZ, cnt, cnt2, wx, monthZ){
  const dg=BZ.dayGan, gans=BZ.gans, zhis=BZ.zhis;
  const total  = BZ_WX5.reduce((s,w)=>s+(cnt2[w]||0),0) || 1;   // 计入藏干全量
  const total1 = BZ_WX5.reduce((s,w)=>s+(cnt[w]||0),0) || 1;    // 不计藏干全量
  // 能量分：统一五行能量体系加权值，权重更贴近真实力量
  const eScore = wxElementScore(BZ);
  const eTotal = BZ_WX5.reduce((s,w)=>s+(eScore[w]||0),0) || 1;
  const ss = ssCount(gans, zhis, dg);
  const yy = yyCount(gans, zhis);
  const yywx = yyWxCount(gans, zhis);
  const sk = shengKeCount(gans, zhis, dg);
  // 日主五行与四生克方（供十神/六亲能量分、生克量化共用；提前声明以避开 TDZ）
  const dwx = GAN_WX[dg];
  const ctrlWx = Object.keys(WX_KE).find(k=>WX_KE[k]===dwx);
  const genWx  = Object.keys(WX_SHENG).find(k=>WX_SHENG[k]===dwx);
  // 十神能量分：直接调用 xuanji-lib.js 的 ssTenGodEnergy，与 wxElementScore 同源同常量。
  const SS_ENERGY = ssTenGodEnergy(BZ, eScore);
  /* 占比四口径：pct 按计入藏干全量、pct1 按不计藏干全量、ePct 按能量分全量、
     pctN 按调用处给的分母（扇区内自比，如该五行的阴与阳之比） */
  const pct = n => (n/total*100).toFixed(1).replace(/\.0$/,'');
  const pct1 = n => (n/total1*100).toFixed(1).replace(/\.0$/,'');
  const ePct = n => (n/eTotal*100).toFixed(1).replace(/\.0$/,'');
  const pctN = (n,d) => (n/(d||1)*100).toFixed(1).replace(/\.0$/,'');
  // 六亲按性别定口径，数值与十神量化同源
  const isMale=(BZ.sex===1||BZ.sex==='男'||BZ.sex===true);
  const QIN_MAP = isMale
    ? {'比肩':'兄弟','劫财':'姐妹','食神':'子','伤官':'女','正财':'妻','偏财':'父','正印':'母','偏印':'母','七杀':'-','正官':'-'}
    : {'比肩':'姐妹','劫财':'兄弟','食神':'子','伤官':'女','正财':'父','偏财':'-','正印':'母','偏印':'母','正官':'夫','七杀':'偏夫'};
  // 十神/六亲/生克 所属五行：以日主五行 dwx 为“我”，生我＝genWx、我生＝WX_SHENG[dwx]、我克＝WX_KE[dwx]、克我＝ctrlWx
  const ssWxOf = {
    '比肩':dwx,'劫财':dwx,'食神':WX_SHENG[dwx],'伤官':WX_SHENG[dwx],
    '正财':WX_KE[dwx],'偏财':WX_KE[dwx],'七杀':ctrlWx,'正官':ctrlWx,
    '偏印':genWx,'正印':genWx
  };
  const skWxOf = {'生我':genWx,'同我':dwx,'我生':WX_SHENG[dwx],'克我':ctrlWx,'我克':WX_KE[dwx]};
  // "同我"计入日主自身（日主＝同我，五行存在必含日主，计数与能量分须同口径）
  const skT={...sk,'同我':sk['同我']+1};
  const shengZhu=skT['生我']+skT['同我'], keXie=skT['克我']+skT['我克']+skT['我生'];
  const D={cnt,cnt2,wx,eScore,ss,yy,yywx,skT,SS_ENERGY,QIN_MAP,ssWxOf,skWxOf,pct,pct1,ePct,pctN,monthZ,shengZhu,keXie};
  let h = bzWheelSlot(`<div class="wheel-wheels">${bzQuantWheel(BZ,D)}${bzChangShengWheel(BZ)}</div>`);
  /* 盘下只留命局级两组数（阴阳占比、生助克泄），与盘心的扇区级数分两层，不重复。 */
  h += `<div class="sub-note">命局阴阳：阴 ${D.yy.yin}(${D.pct(D.yy.yin)}%)阳 ${D.yy.yang}(${D.pct(D.yy.yang)}%)；生克（以日主 ${BZ.dayGan}${GAN_WX[BZ.dayGan]} 为我）：生助 ${D.shengZhu}(${D.pct(D.shengZhu)}%)克泄 ${D.keXie}(${D.pct(D.keXie)}%)</div>`;
  return h;
}
/* 量化四柱纯文本摘要：供 AI 解读取用。与盘面同源同口径，但直接取数计算，
   不经页面渲染结果反抓，故页面改版（表格换圆盘）不会让摘要失同步。 */
function quantSummaryText(BZ){
  try{
    const gans=BZ.gans, zhis=BZ.zhis, dg=BZ.dayGan, WX5=BZ_WX5;
    const cnt=wxCount(gans,zhis), cnt2=wxCountAll(gans,zhis), wx=wangXiang(BZ.monthZ);
    const t1=WX5.reduce((s,w)=>s+(cnt[w]||0),0)||1, t2=WX5.reduce((s,w)=>s+(cnt2[w]||0),0)||1;
    const eS=wxElementScore(BZ), eT=WX5.reduce((s,w)=>s+(eS[w]||0),0)||1;
    const ss=ssCount(gans,zhis,dg), yy=yyCount(gans,zhis), sk=shengKeCount(gans,zhis,dg);
    const SE=ssTenGodEnergy(BZ,eS);
    const skT={...sk,'同我':sk['同我']+1};
    const pc=(n,t)=>(n/t*100).toFixed(1).replace(/\.0$/,'');
    return '五行（个数与占比，另附计入藏干口径与能量分）：'
      + WX5.map(w=>`${w}${wx[w]} 不计${cnt[w]}(${pc(cnt[w],t1)}%)，含藏${cnt2[w]}(${pc(cnt2[w],t2)}%)，能量${Math.round(eS[w])}(${pc(eS[w],eT)}%)`).join('；')
      + `\n阴阳：阴 ${yy.yin}(${pc(yy.yin,t2)}%)　阳 ${yy.yang}(${pc(yy.yang,t2)}%)`
      + '\n十神能量分：' + BZ_SS_ORDER.map(s=>`${s}${ss[s]+(s==='比肩'?1:0)}个(${pc(SE[s],eT)}%)`).join('；')
      + `\n生克（以日主 ${dg}${GAN_WX[dg]} 为我）：${['生我','同我','我生','克我','我克'].map(k=>k+skT[k]+'个').join('、')}；生助 ${skT['生我']+skT['同我']}(${pc(skT['生我']+skT['同我'],t2)}%)　克泄 ${skT['我生']+skT['克我']+skT['我克']}(${pc(skT['我生']+skT['克我']+skT['我克'],t2)}%)`;
  }catch(e){ return ''; }
}
function renderAnalysis(BZ, shenshaSummary, cols){
  const A=getAnalysis(BZ);
  const wt=renderWenTian(BZ, cols);
  const geQing=stripCat(A.geQing), geLevel=stripCat(A.geLevel), geLevelNote=stripCat(A.geLevelNote);
  const fuPills=(arr,cls)=>arr.map(t=>`<span class="fu-pill ${cls}">${t}</span>`).join('');
  const fuHtml=`<div class="fu-wrap"><span class="fu-tag fu-xi-tag">喜</span>${fuPills(A.fu.xi,'fu-xi')}</div><div class="fu-wrap"><span class="fu-tag fu-ji-tag">忌</span>${fuPills(A.fu.ji,'fu-ji')}</div>`;
  // 格局用神/扶抑外格句的喜忌拼成"五行+十神+生克"式（如"喜水食伤（泄）"）：五行取自 geUse.xiWx、
  // 十神类取自 geUse.xiCats（两数组在数据层已按位 zip），生克后缀复用扶抑用神 fu 已编译的
  // "十神类↔文本"（如 食伤↔"食伤（泄）"）查得。外格（从旺/专旺等）xiCats 编译为空时，
  // 用现成真源 wxRoleOfDwx 由五行反推十神类，保证任何格局都带"十神+生克"
  const _dgWx=GAN_WX[BZ.dayGan];
  const _gxMap={};
  [['xi','xiCats'],['ji','jiCats']].forEach(([k,ck])=>{
    (A.fu&&A.fu[k]||[]).forEach((t,i)=>{ if(A.fu[ck]&&A.fu[ck][i]) _gxMap[A.fu[ck][i]]=t; });
  });
  const _gxCat=(cat)=>{ if(!cat) return ''; if(_gxMap[cat]) return _gxMap[cat]; const k=cat.replace(/星$/,''); if(_gxMap[k]) return _gxMap[k]; if(_gxMap[cat+'星']) return _gxMap[cat+'星']; return cat; };
  const _zipGx=(wxArr,catArr)=>wxArr.map((w,i)=>{
    let cat=catArr[i];
    if(!cat && typeof wxRoleOfDwx==='function') cat=wxRoleOfDwx(_dgWx,w)||'';
    return w+_gxCat(cat);
  }).join('、');
  const geXiRel=_zipGx(A.geUse&&A.geUse.xiWx||[], A.geUse&&A.geUse.xiCats||[]);
  const geJiRel=_zipGx(A.geUse&&A.geUse.jiWx||[], A.geUse&&A.geUse.jiCats||[]);
  const sanDeHtml=`<span class="de-chip ${A.sanDe.ling?'de-on':'de-off'}">得令${A.sanDe.ling?'✓':'✗'}</span><span class="de-chip ${A.sanDe.di>0?'de-on':'de-off'}">得地 ${A.sanDe.di}</span><span class="de-chip ${A.sanDe.shi>0?'de-on':'de-off'}">得势 ${A.sanDe.shi}</span>`;
  const tiaoGan=A.tiao.gan.map(g=>`<b class="${WX_CLASS[A.tiao.wx]}">${g}</b>`).join('、');
  const tongHtml = A.tong? A.tong.note : '五行无显著相战，无需强制通关。';
  const quotes=A.quotes.map(q=>`<div>${q}</div>`).join('');
  const synthHtml = A.synthesis && A.synthesis.primary ? (function(S){
    let out=`<div class="synth-top">首选用神：<b class="${WX_CLASS[S.primary.wx]}">${S.primary.wx}</b>（${S.primary.count} 法共识：${S.primary.methods.join('、')}）</div>`;
    if(S.secondary) out+=`<div class="sub-note">${endDot('次选：'+S.secondary.wx+'（'+S.secondary.count+' 法：'+S.secondary.methods.join('、')+'）'+(S.secondary.isJi?' ⚠与扶抑喜用相左':''))}</div>`;
    if(S.gan.tou.length||S.gan.root.length) out+=`<div class="sub-note">${endDot('用神天干：'+(S.gan.tou.length?('透干 '+dedupChars(S.gan.tou)):'')+(S.gan.root.length?(' 得根 '+dedupChars(S.gan.root)):''))}</div>`;
    else out+=`<div class="sub-note">用神天干当地支无根、天干不透，须岁运引出方有力。</div>`;
    if(S.conflicts.length) out+=`<div class="synth-conflict">⚠ 冲突：${S.conflicts.map(c=>c.wx+'（'+c.methods.join('、')+'）为用神却犯扶抑之忌').join('；')}。此类矛盾单凭原局难定，须结合大运流年再论。</div>`;
    out+=`<div class="sub-note">${endDot(S.advice)}</div>`;
    return out;
  })(A.synthesis) : '五法用神暂无明确共识，宜就原局细节斟酌。';
  let h=`<details class="zr-mod zr-quant" id="zr-xiyong"><summary>喜用格局</summary><div class="zr-mod-b">
    <div class="an-block">
    <div class="an-row"><span class="an-k">旺衰强弱</span><span class="an-v">
      <div class="wf-formula">日主 <span class="${WX_CLASS[GAN_WX[BZ.dayGan]]}">${BZ.dayGan}</span>（<span class="${WX_CLASS[GAN_WX[BZ.dayGan]]}">${GAN_WX[BZ.dayGan]}</span>）：得令 ${A.subLing.toFixed(1)} ＋ 得地 ${A.subDi.toFixed(1)} ＋ 得势 ${A.subShi.toFixed(1)} ＝ <b>${A.score.toFixed(1)}</b> 分 <b>${A.strength}</b></div>
      <div class="sub-note">局势（结构战和轴，不计入档位）：${A.juScore>=0?'+':''}${A.juScore.toFixed(1)}。${A.juLines.length?(' '+A.juLines.join('；')+'。'):' 地支无显著冲合会刑，气机平稳。'}</div>
      <div class="sub-note">逐项明细：${A.scoreBasis.join('；')}。</div>
      <div class="sub-note">日主进退：${dayJinTui(BZ)}。</div>
    </span></div>
    <div class="an-row"><span class="an-k">格局用神</span><span class="an-v">${A.geName}${A.geGanLabel}${A.geOuter?` 〔外格〕${A.geOuterNote}`:''}${A.geOuter?'':'。'}清浊：<span class="lab-gold">${geQing}</span>，层次：<span class="ge-${A.geLevel.indexOf('成格')>=0?'cheng':A.geLevel.indexOf('破格')>=0?'po':'bian'}">${geLevel}</span>。喜${geXiRel}，忌${geJiRel}。${A.geOuterDoubt?`<br><span class="sub-note">${endDot(A.geOuterDoubt)}</span>`:''}${geLevelNote?`<br><span class="sub-note">${endDot(geLevelNote)}</span>`:''}${A.geSha.length?`<br><span class="sub-note">${endDot(A.geShaNote)}</span>`:''}${A.geZaGeNote?`<br><span class="sub-note">${endDot(A.geZaGeNote)}</span>`:''}</span></div>
    <div class="an-row"><span class="an-k">扶抑用神</span><span class="an-v">${A.geOuter||A.isZaGe?(`外格（<b>${A.geOuter||A.geName}</b>）${A.isZaGe?'自立格局，不依月令取格':'从势而立'}，<b>不取常规扶抑法</b>；喜${geXiRel}，忌${geJiRel}。`):(fuHtml+'<div class="de-row"><span class="fu-de-tag">三得：</span>'+sanDeHtml+'</div>')}</span></div>
    <div class="an-row"><span class="an-k">调候用神</span><span class="an-v">喜 <b class="${WX_CLASS[A.tiao.wx]}">${A.tiao.wx}</b>（具体用 ${A.tiao.zhiGan.map(g=>`<b class="${WX_CLASS[A.tiao.wx]}">${g}</b>`).join('、')}）${A.tiao.d}<br><span class="sub-note">寒暖燥湿：${A.tiao.grade}；力度：${A.tiao.power}；真假：${A.tiao.zhen}。${A.tiao.conflict}${earthWetDryNote(BZ)?(' '+earthWetDryNote(BZ)):''}</span></span></div>
    <div class="an-row"><span class="an-k">通关用神</span><span class="an-v">${A.tong? (A.tong.note + `<br><span class="sub-note">真假：${endDot(A.tong.zhen)}</span>` + (A.tong.order&&A.tong.order.length>1?`<br><span class="sub-note">${endDot('化解顺序：'+A.tong.order.map((o,i)=>`${i+1}. ${o.war}，取“${o.mediator}”${o.sameAsPrimary?'（即首选用神，一举两得）':''}`).join('；'))}</span>`:'')) : '五行无显著相战，无需强制通关。'}</span></div>
    <div class="an-row"><span class="an-k">病药用神</span><span class="an-v">${A.bingYao.note}</span></div>
    ${A.structDisease && A.structDisease.length ? `<div class="an-row an-struct"><span class="an-k">结构病药</span><span class="an-v"><div class="struct-note">${A.structNote}</div>${A.structDisease.map(d=>`<div class="struct-item"><span class="sd-tag sd-${d.kind}">${REL.gz.clsLabel(d.cls)}（${d.sev}）</span> ${d.why}${d.yaoWx?(' 化解：补“'+d.yaoWx+'”'+(d.yaoText?('，'+d.yaoText):'')):(d.yaoText?(' 化解：'+d.yaoText):'')}</div>`).join('')}</span></div>` : `<div class="an-row an-struct"><span class="an-k">结构病药</span><span class="an-v"><div class="struct-note">${A.structNote}</div></span></div>`}
    ${A.specialStruct && A.specialStruct.length ? `<div class="an-row an-struct"><span class="an-k">特殊结构</span><span class="an-v">${A.specialStruct.map(s=>`<div class="struct-item"><span class="sd-tag sd-${s.tend}">${s.tend}</span><span class="sd-tag sd-special">${s.name}（${s.sev}）</span> ${s.detail}</div>`).join('')}</span></div>` : ''}
    <div class="an-row an-synth"><span class="an-k">综合用神</span><span class="an-v">${synthHtml}</span></div>
    <div class="an-row"><span class="an-k">古籍引证</span><span class="an-v">${quotes}<div class="sub-note">${BZ_QUOTE_NOTE}</div></span></div>
    <div class="an-row an-muku"><span class="an-k">墓库 财库 十二长生 空亡</span><span class="an-v">墓库：${A.muku&&A.muku.note?A.muku.note:'无'}<br>财库：${endDot(((A.muku&&A.muku.caiKuWhere)?A.muku.caiKuWhere:'无')+((A.muku&&A.muku.caiKuKaihe)?('。'+A.muku.caiKuKaihe):'')+((A.muku&&A.muku.kuTuShuo)?('。'+A.muku.kuTuShuo):''))}<br>十二长生：${A.changsheng||'无'}<br>空亡：${A.kongwang||'无'}</span></div>
    <div class="an-row an-muku"><span class="an-k">神煞</span><span class="an-v">${renderBenmingClickable(cols)}${A.shaTend||''} ${coreShenshaHtml(cols)}<br>${wt}</span></div>
    ${renderPalaces(BZ, A)}
  </div>
  <h4 class="det-h">各流派解读格局</h4>${renderSchoolDiffInner(A,BZ)}
</div></details>`;
  return h;
}

/* ============ 命宫，胎元，身宫（本命分析，喜用格局内，接四柱之外的三辅助宫位）============
   数据源：BZ.meta.mingGong / taiYuan / shenGong（由 lunar.js EightChar 推出，公元前模式为空则整块不出）。
   判定：以本宫地支五行比对综合用神有效喜忌（A.synthesis.xiWxEff / jiWxEff），再与格局层次相参。 */
const PALACE_DEF={
  '命宫':'由生月与生时相配起，为一命之枢，主先天禀赋、性格底色与一生志趣所归，古法以之看人一生格调之高低。',
  '胎元':'由月柱天干进一位、地支进三位而得，为受胎之月，主父母遗传之气、胎养根基与幼年体质，亦可补四柱五行之缺。',
  '身宫':'与命宫相对而立，为一身之所寄，主一生实际着力之处、行止劳逸与中晚年归宿，命宫言其志、身宫言其行。'
};
/* 八宅命卦（mingGua 由出生年推出，命卦即所居之"宫"）的详细解读：
   卦→五行/方位/卦象征 对应表，供喜用格局内命卦块呈现卦象本体、东西四命与择偶居所取向。
   五行方位：乾兑金(西)、离火(南)、震巽木(东)、坎水(北)、艮坤土(东北/西南)。 */
const MING_GUA_DETAIL={
  '乾':{wx:'金',wei:'西北',xiang:'天','qi':'刚健自强、志行坚刚，主导决断与进取','zhi':'宜居西四宅，建树宜刚正自立'},
  '兑':{wx:'金',wei:'西',xiang:'泽','qi':'喜悦光明、善与人交，主才艺口才与圆融','zhi':'宜居西四宅，人和贵在悦纳'},
  '离':{wx:'火',wei:'南',xiang:'火','qi':'光明附丽、明理文秀，主聪明外显与文化之光','zhi':'宜居东四宅，发展宜向光明暖热之道'},
  '震':{wx:'木',wei:'东',xiang:'雷','qi':'震动奋起、自强不息，主行动力与开拓','zhi':'宜居东四宅，成事贵在果断先发'},
  '巽':{wx:'木',wei:'东南',xiang:'风','qi':'顺入谦逊、通达善变，主柔顺应变与周备','zhi':'宜居东四宅，处世宜顺势而入'},
  '坎':{wx:'水',wei:'北',xiang:'水','qi':'习坎艰险、智深内敛，主谋虑与坚韧','zhi':'宜居东四宅，处变贵在定静待时'},
  '艮':{wx:'土',wei:'东北',xiang:'山','qi':'艮止厚德、沉稳自制，主守正与笃实','zhi':'宜居西四宅，成就贵在积厚成稳'},
  '坤':{wx:'土',wei:'西南',xiang:'地','qi':'厚德载物、包容温厚，主承载与合众','zhi':'宜居西四宅，立身贵在宽厚顺承'}
};
const PALACE_JUDGE={
  '命宫':{ '喜':'先天心性与用神同气，志趣所向即得力之处，立身处世多能自合本命之需。',
          '忌':'先天心性与用神相左，易在耗损自身之事上执着用力，宜以后天自律与环境调伏，不可任性而行。',
          '平':'先天心性中和，不助不损，一生格调仍以四柱本体与岁运为准。' },
  '胎元':{ '喜':'先天根基受荫，幼年体质与家庭助力较厚，原局用神偏弱者尤得其补。',
          '忌':'先天根基偏于所忌，幼年体质或家庭环境上易见牵制，须待岁运制忌方转顺。',
          '平':'先天根基平常，于原局五行无明显增损。' },
  '身宫':{ '喜':'一生着力之处与用神合辙，所投入者多能见效，中晚年渐入佳境。',
          '忌':'实际着力处常在忌神一路，易见劳而少功，宜转换方向、借喜用之行业与方位化之。',
          '平':'一生着力处顺其自然，成败取决于大运流年之引动。' }
};
function palaceTag(wx, xi, ji){ return xi.has(wx)?'喜':(ji.has(wx)?'忌':'平'); }
function renderPalaces(BZ, A){
  const M=BZ.meta||{};
  const list=[['命宫',M.mingGong],['胎元',M.taiYuan],['身宫',M.shenGong]].filter(p=>p[1]&&String(p[1]).length>=2);
  if(!list.length) return '';
  const xi=new Set((A.synthesis&&A.synthesis.xiWxEff)||A.xiWx||[]);
  const ji=new Set((A.synthesis&&A.synthesis.jiWxEff)||A.jiWx||[]);
  const dg=BZ.dayGan;
  let good=0, bad=0, body='';
  list.forEach(function(p){
    const name=p[0], gz=String(p[1]), g=gz.charAt(0), z=gz.charAt(1);
    const gw=GAN_WX[g]||'', zw=ZHI_WX[z]||'';
    const tag=palaceTag(zw, xi, ji);
    if(tag==='喜') good++; else if(tag==='忌') bad++;
    const tagHtml=tag==='喜'?kXi('喜用'):(tag==='忌'?kJi('忌神'):kMid('中平'));
    const ny=nayinOf(gz), nyWx=nayinWxOf(gz);
    const tg=tenGod(dg,g), tz=tenGod(dg, zhiMain(z));
    body+=`<div class="nayin-h">${name} <b class="${WX_CLASS[gw]||''}">${g}</b><b class="${WX_CLASS[zw]||''}">${z}</b> ${tagHtml}</div>`
      + `<div>宫气 <b class="${WX_CLASS[zw]||''}">${zw}</b>${ny?('，纳音 '+nayinColorSpan(ny)+(nyWx?('，纳音五行 '+nyWx):'')):''}；十神：天干 ${tg}、地支本气 ${tz}。</div>`
      + `<div class="sub-note">${endDot(PALACE_DEF[name])}</div>`
      + `<div class="sub-note">${endDot(name+'落'+(tag==='平'?'中平之地':(tag+'神之地'))+'：'+PALACE_JUDGE[name][tag])}</div>`;
  });
  const heCan = good>=2 ? `三宫多落喜用（${good} 处），先天禀赋、根基与着力方向与用神大体一致，本命自助之力较强。`
    : (bad>=2 ? `三宫多落忌神（${bad} 处），先天心性与着力方向偏离用神，须以后天选择校正，行运扶起用神之时方见转机。`
    : `三宫喜忌参半（喜 ${good} 处、忌 ${bad} 处），先天助力与牵制并存，取舍在于顺喜用而避忌神。`);
  const lv=String(A.geLevel||''), cheng=lv.indexOf('成格')>=0;
  const geLink = (bad>=2)
      ? (cheng ? `格局虽已成，三宫却多落忌神，先天取向与格局用神不同调，成事须靠后天择向与行运扶用，不可恃格自安。`
               : `格局本有欠缺，三宫复多落忌神，须待岁运补起用神、制住忌神，不可强求速成。`)
    : (good>=2)
      ? (cheng ? `格局已成，三宫又多落喜用，先天与格局同向，用神得岁运引出则贵气可期。`
               : `格局虽有欠缺，三宫多落喜用，先天尚存自助之力，行运扶起用神时可补其不足。`)
    : `三宫喜忌相当，只作格局层次的微调，不改格局成败之主线。`;
  // 八宅命卦：按出生年推命卦（mingGua），呈现卦象五行/方位/东西四命 + 宅向。命卦为方位家居框架，不作五行喜忌判，不参与三宫合参计数。
  let mingHtml='';
  try{
    const _male=(BZ.sex===1||BZ.sex==='男'||BZ.sex===true);
    const mg=(typeof mingGuaDate==='function'&&BZ.birthMonth)?mingGuaDate(BZ.birthYear,BZ.birthMonth,BZ.birthDay,_male):mingGua(BZ.birthYear, _male);
    const gd=MING_GUA_DETAIL[mg.gua]||{};
    if(gd.wx){
      mingHtml=`<div class="nayin-h">命卦 <b class="${WX_CLASS[gd.wx]||''}">${mg.gua}</b> ${mg.group}</div>`
        + `<div>卦气 <b class="${WX_CLASS[gd.wx]||''}">${gd.wx}</b>，方位 ${gd.wei}，卦象${gd.xiang}；${gd.qi}。${gd.zhi}。</div>`;
    }
  }catch(e){ mingHtml=''; }
  return `<div class="an-row an-muku"><span class="an-k">命宫 胎元 身宫 命卦</span><span class="an-v">`
    + body
    + (mingHtml? mingHtml : '')
    + `<div class="sub-note">${endDot('三宫合参：'+heCan)}</div>`
    + `<div class="sub-note">${endDot('与'+A.geName+'（层次 '+stripCat(A.geLevel)+'）相参：'+geLink)}</div>`
    + `</span></div>`;
}

/* ============ 文昌位 / 天乙贵人 喜用判断（增强项）============
   按日干取文昌（WENCHANG）、天乙贵人（TIANYI）之地支，比对命局喜用五行（综合用神有效喜用），
   判断其落于喜用、忌神或中性，并标出方位（地支→八卦方位）。 */
function renderWenTian(BZ, cols){
  const A=getAnalysis(BZ);
  const dg=BZ.dayGan;
  const xiEff=new Set(A.synthesis.xiWxEff), jiEff=new Set(A.synthesis.jiWxEff);
  const fangOf=z=>ZHI_FANG[z]||'';
  const chk=(zhi)=>{
    const w=GAN_WX[(HIDE[zhi]||[zhi])[0]];
    let lv;
    if(xiEff.has(w)) lv='利（落喜用）';
    else if(jiEff.has(w)) lv='忌（落忌神）';
    else lv='平（中性）';
    return {zhi, w, fang:fangOf(zhi), lv};
  };
  const wc=chk(WENCHANG[dg]);
  const tys=(TIANYI[dg]||[]).map(chk);
  const tysTxt=tys.map(o=>`${o.zhi}（${o.fang}，五行${o.w}）${o.lv}`).join('；');
  return `文昌位、天乙贵人按日干喜用判断。文昌在（${wc.zhi}，${wc.fang}，五行${wc.w}）${wc.lv}；天乙贵人 ${tysTxt}。方位依地支落八卦：子正北、午正南、卯正东、酉正西，余支类推。文昌主文贵聪慧、天乙贵人主逢凶化吉；落喜用助益明显，落忌神须借岁运制化或与他支合化解厄，落中性则平常。`;
}

/* 大运/流年 分项解读（事业，感情，健康，家庭）：解析 evalGZ.lifeTrig 为四宫格；
   婚姻→感情 以贴合用户表述；空领域给中性提示，避免空白显得漏项。 */
/* 大运/流年 分项解读（事业，感情，健康，家庭）：解析 evalGZ.lifeTrig 为纯文本，
   直接内联进“关键引动”列与流年事件表，不另起折叠/宫格，节省篇幅。婚姻→感情以贴合用户表述。 */
function yunAreaText(lifeTrig, age){
  const stage = lifeStage(age);
  const allow = STAGE_AREAS[stage] || STAGE_AREAS.work;
  const KEYMAP = {'事业':'事业','婚姻':'感情','感情':'感情','健康':'健康','家庭':'家庭','学业':'学业'};
  const map={};
  (lifeTrig||[]).forEach(t=>{
    const m=/^(事业|婚姻|感情|健康|家庭|学业)：(.*)$/.exec(t);
    if(m){ const k=KEYMAP[m[1]]; (map[k]=map[k]||[]).push(m[2]); }
  });
  const parts=allow.map(k=>{
    const items=map[k]||[];
    return items.length?items.join('；'):'';
  }).filter(Boolean);
  if(parts.length) return parts.join('。')+'。';
  if(stage==='school') return '健康、家庭方面均无明显引动，平顺成长。';
  if(stage==='college') return '学业、健康、家庭方面均无明显引动，平顺成长。';
  if(stage==='retire') return '健康、家庭方面均无明显引动，安养为宜。';
  return '事业、感情、健康、家庭均无明显引动，平顺。';
}
/* 岁运引动"关键引动"单元格：干支分析一行 + 生活模块（学业/事业/感情/健康/家庭）各行独立。
 * 干支 = s.keys（yunKeyReason）；生活模块 = lifeTrig 按模块前缀分组，每模块一行（顺序取 STAGE_AREAS 主次），
 * 宫位句（祖辈宫动/夫妻宫动…）自然归所属模块行内，不再单拆。段间 <br> 换行。
 * 仅用于岁运引动表，流年事件表仍走 yunAreaText。 */
function yunKeyCell(s, age){
  const gz=yunKeyReason(s);
  const lines=yunAreaParts(s.lifeTrig, age);
  let out=gz?gz.replace(/[。；]+$/,'')+'。':'';
  lines.forEach(l=>{ out+='<br>'+l; });
  return out;
}
/* lifeTrig 按模块分组返回"模块：内容"行数组（每模块一行，顺序取 STAGE_AREAS），供 yunKeyCell 使用；
 * 无明显引动时与 yunAreaText 同口径兜底（单行） */
function yunAreaParts(lifeTrig, age){
  const stage=lifeStage(age);
  const allow=STAGE_AREAS[stage]||STAGE_AREAS.work;
  const KEYMAP={'事业':'事业','婚姻':'感情','感情':'感情','健康':'健康','家庭':'家庭','学业':'学业'};
  const map={};
  (lifeTrig||[]).forEach(t=>{
    const m=/^(事业|婚姻|感情|健康|家庭|学业)：(.*)$/.exec(t);
    if(m){ const k=KEYMAP[m[1]]; (map[k]=map[k]||[]).push(m[2]); }
  });
  const lines=allow.map(k=>{
    const items=map[k]||[];
    if(!items.length) return '';
    /* 每模块行以句号收尾（各支句以分号分隔，行末统一句号） */
    return k+'：'+items.join('；').replace(/[。；]+$/,'')+'。';
  }).filter(Boolean);
  if(lines.length) return lines;
  if(stage==='school') return ['健康、家庭方面均无明显引动，平顺成长。'];
  if(stage==='college') return ['学业、健康、家庭方面均无明显引动，平顺成长。'];
  if(stage==='retire') return ['健康、家庭方面均无明显引动，安养为宜。'];
  return ['事业、感情、健康、家庭均无明显引动，平顺。'];
}

/* ===== 核心解读（命局），深度结构化 ===== */
/* 神煞×人生板块释义：统一读顶层真源 SHA_MEAN（bazi-data.js，基础本义+四卡解读+古籍依据） */


/* 各流派解读表格内关键词上色：直接复用页面已有的“神煞吉凶”配色方案
   （吉=绿 .tip.sha-ji / 凶=红 .tip.sha-xiong / 中性=墨灰 .tip.sha-neutral），不另起配色 */
function kXi(t){ return `<span class="tip sha-ji">${t}</span>`; }
function kJi(t){ return `<span class="tip sha-xiong">${t}</span>`; }
function kMid(t){ return `<span class="tip sha-neutral">${t}</span>`; }
/* 运势状态、结果、应对 文字映射（正面引导式，状态替代“水逆期”用“波动期、低谷期”表述） */
function yunStateBadge(rating){
  const map={吉:['上升期','sha-ji'],平:['平稳期','sha-neutral'],中:['波动期','sha-neutral'],凶:['低谷期','sha-xiong']};
  const m=map[rating]||['平稳期','sha-neutral'];
  return `<span class="tip ${m[1]}">${m[0]}</span>`;
}
function yunResultText(rating){ return {吉:kXi('成'),平:kMid('守'),中:kMid('调'),凶:kJi('防')}[rating]||kMid('守'); }
function yunCopingText(rating, age){ return stageCoping(rating, age); }
function yunRatingTag(rating){ return {吉:kXi('吉'),平:kMid('平'),中:kMid('中'),凶:kJi('凶')}[rating]||kMid('平'); }
/* 性能守卫：paipan / paipanPillar 可能一次交互多次触发 drawYunChart，每张运势图需重建整段 SVG（含逐岁评分），
   重复构建会卡顿。此处用 rAF 合并：同一帧内多次调用只绘制一次；绘制期间再来的请求延到下一帧（_pending 标记）。
   三级下钻：一生(年)、流月(选中年)、流日(选中月)。绘制核心统一为 renderYunSvg(cfg)，年/月/日三层仅 cfg 不同。 */
let _yunLevel=0, _yunSel={year:null, month:null};
const YUN_MZ=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
/* 一级（一生，年）：大运 / 流年 / 综合 三条曲线，与大运换运节点对齐 */
function _yunCfgYear(BZ = window.BZ){
  const yd=buildYunData(BZ); if(!yd||!yd.data||!yd.data.length) return null;
  const {data, birthYear, bounds}=yd;
  const A=getAnalysis(BZ);
  const colors={dayun:'#b23a2e', liunian:'#c9871f', actual:'#8e44ad'};
  const minY=data[0].year, maxY=data[data.length-1].year;
  const pts=data.map(d=>({x:d.year, year:d.year, age:d.age, dayunGZ:d.dayunGZ, liunianGZ:d.liunianGZ, dayun:d.dayun, liunian:d.liunian, actual:d.actual, dayunReason:d.dayunReason, liunianReason:d.liunianReason}));
  const tickStep=(maxY-minY)<=120?10:20;
  const ticks=[], minor=[];
  for(let ty=Math.ceil(minY/tickStep)*tickStep; ty<=maxY; ty+=tickStep) ticks.push({x:ty});
  for(let ty=Math.ceil(minY/5)*5; ty<=maxY; ty+=5){ if(ty%tickStep===0) continue; minor.push({x:ty}); }
  const _HIST = !(BZ.birthYear>0 && (new Date().getFullYear())-BZ.birthYear+1<=120);
  const bnds=(bounds||[]).map(b=>({x:b.year, l1: _HIST ? (b.year+'年') : ((b.year-birthYear+1)+'岁 '+b.year), l2:b.gz||''}));
  const dg=BZ.dayGan;
  const tip=(p)=>{ const ds=p.dayunGZ?`天干${tenGod(dg,p.dayunGZ[0])}，地支${tenGod(dg,zhiMain(p.dayunGZ[1]))}`:''; const ls=p.liunianGZ?`天干${tenGod(dg,p.liunianGZ[0])}，地支${tenGod(dg,zhiMain(p.liunianGZ[1]))}`:''; return `<div class="yun-tip-head">${p.year}年${_HIST?'':(' '+p.age+'岁')} ${p.liunianGZ||'无'}年<span class="yun-tip-ge">　格局：${A.geName}</span></div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:${colors.dayun}">大运</span>${p.dayunGZ||'无'}<span class="yun-tip-shen">${ds}</span><b class="yun-tip-score">${p.dayun}</b></div><div class="yun-tip-row yun-tip-reason">${p.dayunReason||'基准 50'}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:${colors.liunian}">流年</span>${p.liunianGZ||'无'}<span class="yun-tip-shen">${ls}</span><b class="yun-tip-score">${p.liunian}</b></div><div class="yun-tip-row yun-tip-reason">${p.liunianReason||'基准 50'}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:${colors.actual}">综合</span><b class="yun-tip-score">${p.actual}</b><span class="yun-tip-shen">大运×0.55＋流年×0.45</span></div>`; };
  return {series:[{key:'dayun',label:'大运',color:colors.dayun,kind:'step'},{key:'liunian',label:'流年',color:colors.liunian,kind:'smooth'},{key:'actual',label:'综合运势',color:colors.actual,kind:'smooth'}], points:pts, xMin:minY, xMax:maxY, ticks, minor, boundaries:bnds, stepOk:(p)=>!!p.dayunGZ, tip, onPick:(p)=>drawYunMonth(p.year, BZ), hint:'← 左右滑动查看完整曲线。点击任意位置，下钻查看该年流月运势'};
}
/* 二级（流月，选中年）：大运(该年恒定) / 流月 / 综合；点击某月继续下钻"流日" */
function _yunCfgMonth(year, BZ = window.BZ){
  const A=getAnalysis(BZ);
  const YG=liunianGZ(year);
  const dayunGZ=_dayunGZatYear(year);
  const dyP=dayunGZ?pillarScoreParts(dayunGZ,A):null; const dayunScore=dyP?dyP.full:SCORE_BASE; const dayunReason=dyP?dyP.parts.join(' '):'基准 50';
  const pts=[];
  YUN_MZ.forEach((mz,i)=>{
    const mn=i+1; const mGZ=monthGanOf(YG[0],mz)+mz; const mP=pillarScoreParts(mGZ,A); const monthScore=mP.full;
    pts.push({x:mn, mz, monthGZ:mGZ, month:monthScore, monthReason:mP.parts.join(' '), dayunGZ, dayun:dayunScore, dayunReason, actual:Math.round(dayunScore*YUN_W_DAYUN+monthScore*YUN_W_SUB)});
  });
  const ticks=YUN_MZ.map((mz,i)=>({x:i+1, l1:(i+1)+'月', l2:mz}));
  const tip=(p)=>{ const ds=p.dayunGZ?`天干${tenGod(BZ.dayGan,p.dayunGZ[0])}，地支${tenGod(BZ.dayGan,zhiMain(p.dayunGZ[1]))}`:''; const ms=`天干${tenGod(BZ.dayGan,p.monthGZ[0])}，地支${tenGod(BZ.dayGan,zhiMain(p.monthGZ[1]))}`; return `<div class="yun-tip-head">${year}年 ${p.x}月（${p.mz}）月柱 ${p.monthGZ}<span class="yun-tip-ge">　格局：${A.geName}</span></div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#b23a2e">大运</span>${p.dayunGZ||'无'}<span class="yun-tip-shen">${ds}</span><b class="yun-tip-score">${p.dayun}</b></div><div class="yun-tip-row yun-tip-reason">${p.dayunReason}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#c9871f">流月</span>${p.monthGZ}<span class="yun-tip-shen">${ms}</span><b class="yun-tip-score">${p.month}</b></div><div class="yun-tip-row yun-tip-reason">${p.monthReason}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#8e44ad">综合</span><b class="yun-tip-score">${p.actual}</b><span class="yun-tip-shen">大运×0.55＋流月×0.45</span></div>`; };
  return {series:[{key:'dayun',label:'大运',color:'#b23a2e',kind:'step'},{key:'month',label:'流月',color:'#c9871f',kind:'smooth'},{key:'actual',label:'综合运势',color:'#8e44ad',kind:'smooth'}], points:pts, xMin:1, xMax:12, ticks, minor:[], boundaries:[], tip, onPick:(p)=>drawYunDay(year,p.x, BZ), hint:'← 左右滑动。点击某一月，下钻查看该月流日运势'};
}
/* 三级（流日，选中月）：大运(恒定) / 流月(恒定) / 流日 / 综合 */
function _yunCfgDay(year, month, BZ = window.BZ){
  const A=getAnalysis(BZ);
  const YG=liunianGZ(year);
  const mz=YUN_MZ[month-1]; const mGZ=monthGanOf(YG[0],mz)+mz; const mP=pillarScoreParts(mGZ,A); const monthScore=mP.full; const monthReason=mP.parts.join(' ');
  const dayunGZ=_dayunGZatYear(year); const dyP=dayunGZ?pillarScoreParts(dayunGZ,A):null; const dayunScore=dyP?dyP.full:SCORE_BASE; const dayunReason=dyP?dyP.parts.join(' '):'基准 50';
  const days=new Date(year, month, 0).getDate();
  const pts=[];
  for(let dnum=1; dnum<=days; dnum++){
    let dGZ=''; try{ dGZ=Solar.fromYmd(year,month,dnum).getLunar().getDayInGanZhi(); }catch(e){}
    const dP=dGZ?pillarScoreParts(dGZ,A):null; const dayScore=dP?dP.full:SCORE_BASE; const dayReason=dP?dP.parts.join(' '):'基准 50';
    pts.push({x:dnum, dayGZ:dGZ, day:dayScore, dayReason, monthGZ:mGZ, month:monthScore, monthReason, dayunGZ, dayun:dayunScore, dayunReason, actual:Math.round(dayunScore*YUN_W_DAYUN3+monthScore*YUN_W_MID+dayScore*YUN_W_MID)});
  }
  const ticks=[], minor=[];
  for(let dnum=1; dnum<=days; dnum++){ if(dnum%5===0) ticks.push({x:dnum, l1:dnum+'日'}); else minor.push({x:dnum}); }
  const tip=(p)=>{ const ds=p.dayunGZ?`天干${tenGod(BZ.dayGan,p.dayunGZ[0])}，地支${tenGod(BZ.dayGan,zhiMain(p.dayunGZ[1]))}`:''; const ms=`天干${tenGod(BZ.dayGan,p.monthGZ[0])}，地支${tenGod(BZ.dayGan,zhiMain(p.monthGZ[1]))}`; const ds2=p.dayGZ?`天干${tenGod(BZ.dayGan,p.dayGZ[0])}，地支${tenGod(BZ.dayGan,zhiMain(p.dayGZ[1]))}`:''; return `<div class="yun-tip-head">${year}年${month}月${p.x}日 日柱 ${p.dayGZ||'无'}<span class="yun-tip-ge">　格局：${A.geName}</span></div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#b23a2e">大运</span>${p.dayunGZ||'无'}<span class="yun-tip-shen">${ds}</span><b class="yun-tip-score">${p.dayun}</b></div><div class="yun-tip-row yun-tip-reason">${p.dayunReason}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#c9871f">流月</span>${p.monthGZ}<span class="yun-tip-shen">${ms}</span><b class="yun-tip-score">${p.month}</b></div><div class="yun-tip-row yun-tip-reason">${p.monthReason}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#1f7a5a">流日</span>${p.dayGZ||'无'}<span class="yun-tip-shen">${ds2}</span><b class="yun-tip-score">${p.day}</b></div><div class="yun-tip-row yun-tip-reason">${p.dayReason}</div><div class="yun-tip-row"><span class="yun-tip-tag" style="background:#8e44ad">综合</span><b class="yun-tip-score">${p.actual}</b><span class="yun-tip-shen">大运×0.4＋流月×0.3＋流日×0.3</span></div>`; };
  return {series:[{key:'dayun',label:'大运',color:'#b23a2e',kind:'step'},{key:'month',label:'流月',color:'#c9871f',kind:'smooth'},{key:'day',label:'流日',color:'#1f7a5a',kind:'smooth'},{key:'actual',label:'综合运势',color:'#8e44ad',kind:'smooth'}], points:pts, xMin:1, xMax:days, ticks, minor, boundaries:[], tip, hint:'已是最精细层级（流日）。综合 ＝ 大运×0.4＋流月×0.3＋流日×0.3'};
}

/* 地支本气（取藏干第一字），用于推算支十神 */
function zhiMain(z){ return (HIDE[z]&&HIDE[z][0])||z; }
/* 大运、流年、流月、流日 按钮内直接显示的干支十神 */
function ssSpan(gz, BZ = window.BZ){ if(!gz||gz.length<2) return ''; return `<span class="ss">${tenGod(BZ.dayGan,gz[0])}，${tenGod(BZ.dayGan,zhiMain(gz[1]))}</span>`; }
/* 两地支之间的关系（详细列出是哪两个地支相冲、合/害、破/刑，并附五行与刑名） */
function zhiPairText(z1,z2,labs){
  const out=[];
  if(!z1||!z2) return out;
  const lab = (labs && labs.length>=2) ? `${labs[0]}${labs[1]}` : '';
  zhiRelTypes(z1,z2).forEach(t=>{
    if(t==='冲') out.push({w:'冲',t: lab?`${lab}${z1}${z2}相冲`:`${z1}${z2}相冲（${ZHI_WX[z1]||''}冲${ZHI_WX[z2]||''}）`});
    else if(t==='合'){ const f=DIZHI_HE6.find(g=>(g[0]===z1&&g[1]===z2)||(g[0]===z2&&g[1]===z1)); out.push({w:'合',t: lab?`${lab}${z1}${z2}合化${f?f[2]:''}`:`${z1}${z2}合化${f?f[2]:''}`}); }
    else if(t==='暗合') out.push({w:'暗合',t: lab?`${lab}${z1}${z2}暗合`:`${z1}${z2}暗合`});
    else if(t==='害') out.push({w:'害',t: lab?`${lab}${z1}${z2}相害`:`${z1}${z2}相害`});
    else if(t==='破') out.push({w:'破',t: lab?`${lab}${z1}${z2}相破`:`${z1}${z2}相破`});
    else if(t==='刑'){
      let nm='';
      if(['寅','巳','申'].includes(z1)&&['寅','巳','申'].includes(z2)) nm='（无恩之刑）';
      else if(['丑','戌','未'].includes(z1)&&['丑','戌','未'].includes(z2)) nm='（恃势之刑）';
      else if((z1==='子'&&z2==='卯')||(z1==='卯'&&z2==='子')) nm='（无礼之刑）';
      out.push({w:'刑',t: lab?`${lab}${z1}${z2}相刑${nm}`:`${z1}${z2}相刑${nm}`});
    }
  });
  // 半合/拱：两支同属一个三合局（生旺力全/旺墓力半/拱虚待发）；三合/三会全局（三支）另在"特殊"行列示
  DIZHI_SANHE.forEach(g=>{
    const present=g.slice(0,3).filter(z=>z===z1||z===z2);
    if(present.length===2){
      const kind=sanheKind(g, present);
      const miss=g.slice(0,3).find(z=>z!==z1&&z!==z2);
      const core=(kind==='shengwang')?`${present[0]}${present[1]}半合${g[3]}局（生旺，力全）`
               :(kind==='wangmu')?`${present[0]}${present[1]}半合${g[3]}局（旺墓，力半）`
               :`${present[0]}${present[1]}拱${g[3]}局（虚拱${miss}，待时而发）`;
      out.push({w:'半合', hua:g[3], kind, t: lab?`${lab}${core}`:core});
    }
  });
  return out;
}
function zhiRelKey(w){ return ({'冲':'__CHONG__','合':'__HE6__','暗合':'__ANHE__','害':'__HAI__','破':'__PO__','刑':'__XING__','半合':'__HE6__'})[w]||'__HE__'; }
function relCls(w){ return ({'冲':'ke','破':'ke','刑':'ke','害':'hai','合':'he','暗合':'anhe','生':'sheng','半合':'he'})[w]||''; }
/* 两个干支之间的干生克合化 + 支冲合害破刑，返回可点击 span 串；la/lb 为两柱层级标签（如 大运、流年） */
function relHTML(a,b,la,lb){
  const labs = (la&&lb)?[la,lb]:undefined;
  const pre = (la&&lb)? la+lb : '';   // 仅在两张关系表内剥掉“大运流年”这类前缀
  const gr=ganRelations([a[0],b[0]], BZ, labs);
  const zr=zhiPairText(a[1],b[1], labs);
  let s='<span class="rel-row"><span class="rel-g">干 ';
  /* 干、支两组各自的多条关系一律以顿号分隔：仅靠 chip 的 4px 外边距，两条四字关系会连读成一串 */
  s+= gr.length? gr.map(r=>`<span class="rel ${r.cls}" onclick="showTip('${relKeyGan(r.cls)}')">${r.text.replace(pre,'')}</span>`).join('、') : '<span class="sub-note">无生克合化</span>';
  s+='</span><span class="rel-sep"></span><span class="rel-z">支 '+(zr.length? zr.map(x=>`<span class="rel ${relCls(x.w)}" onclick="showTip('${zhiRelKey(x.w)}')">${x.t.replace(pre,'')}</span>`).join('、') : '无冲合害破刑')+'</span></span>';
  return s;
}

/* 天合地合 / 天克地冲：岁运（大运、流年、流月、流日）干支与命局某一柱的天干、地支同时发生合 / 冲 */
function relMingSpecial(gz, lvl){
  const labels=['年','月','日','时'];
  const out=[];
  if(!gz||gz.length<2) return out;
  for(let i=0;i<4;i++){
    const pg=BZ.gans[i], pz=BZ.zhis[i], lab=labels[i];
    const heG=tianGanHe(gz[0],pg);
    const heZ=pairIn(gz[1],pz,DIZHI_HE6);
    const chongG=pairIn(gz[0],pg,TIANGAN_CHONG);
    const chongZ=pairIn(gz[1],pz,DIZHI_CHONG);
    if(heG && heZ) out.push(`<span class="rel spec-he" onclick="showTip('__HE6__')">与${lab}柱（${pg}${pz}）天合地合</span>`);
    if(chongG && chongZ) out.push(`<span class="rel spec-chong" onclick="showTip('__CHONG__')">与${lab}柱（${pg}${pz}）天克地冲</span>`);
  }
  // 本步地支参与的 三合/三会 全局（本步支 + 命局两支，跨柱关系故列于特殊行；半合/拱已在单元格列出）
  if(lvl){
    try{
      REL.gz.zhiPairs([gz[1]].concat(BZ.zhis), BZ, [lvl].concat(labels)).forEach(x=>{
        if(x.cls==='he' && x.text.indexOf(lvl)>=0 && /三合|三会/.test(x.text)){
          out.push(`<span class="rel spec-he" onclick="showTip('__HE__')">${x.text}</span>`);
        }
      });
    }catch(e){}
  }
  return out;
}



/* ==================== 四、大运流年 ==================== */
/* 运势曲线 / 所选干支三表 / 岁运引动。 */

function renderYunDong(BZ, A, yd){
  const LP=String.fromCharCode(65288); // 全角左括号，用码点构造，避免源码同行出现两个开括号触发禁用字符扫描
  const RP=String.fromCharCode(65289); // 全角右括号，同上
  const yunData=yd;
  if(!A || !yunData) return '';
  return `<h3 class="rel-title">岁运引动</h3><div class="an-plain">
    <div class="an-row an-yun"><span class="an-v">
      <div class="sub-note">${endDot('起运：'+qiYunLabel(yunData.start)+' '+A.geYunNote)}</div>
      <div class="yun-scroll"><table class="yun-tbl yd"><thead><tr><th>大运</th><th>用忌</th><th>关键引动</th><th>吉凶</th></tr></thead><tbody>
      ${yunData.steps.map(s=>s.empty?`<tr class="yun-empty"><td colspan="4" data-label="说明">未起运（${s.age}岁前）：承原局之气；此阶段无大运可依，逐岁以小运论，见运程推演。</td></tr>`:(()=>{ const copeAge=(s.age==null)?null:s.age+4; return `<tr class="${BZ.dyGZ&&s.gz===BZ.dyGZ?'cur':''}"><td class="yun-gz" data-label="大运">${s.gz}<span class="yun-age">${YANG.indexOf(s.gz[0])>=0?'阳运':'阴运'}</span><br><span class="yun-age">${s.age}岁</span>${s.year?`<br><span class="yun-age">约 ${s.year}–${s.year+9} 年</span>`:''}</td><td class="yun-yongji" data-label="用忌">${s.eff.replace(LP,'<br>').replace(RP,'')}</td><td class="yun-key" data-label="关键引动">${yunKeyCell(s, copeAge)}<br><span class="yd-extra">此运走${yunStateBadge(s.rating)}。总体${s.rating==='吉'?'可':'宜'}${yunResultText(s.rating)}${s.rating==='中'?'适':''}。${yunCopingText(s.rating, copeAge)}。</span></td><td class="ev-jx" data-label="吉凶">${yunRatingTag(s.rating)}</td></tr>`; })()).join('')}
      </tbody></table></div>
      ${yunData.liuNian&&!yunData.liuNian.empty?`<div class="sub-note">${endDot('流年 '+yunData.liuNian.year+'（'+yunData.liuNian.gz+'）：'+yunData.liuNian.eff.replace(LP,'<br>').replace(RP,'')+'，状态 '+yunStateBadge(yunData.liuNian.rating)+(yunData.liuNian.keys.length?('；'+yunData.liuNian.keys.join('；')):'；与原局干支无明显冲合刑害，气机静守'))}</div>`:''}
    </span></div>
  </div>`;
}

/* ============ 所选干支详情，流年事件（所选大运十年完整展示，不折叠）============ */
function renderYunEvent(BZ, A, yd, selDyGz){
  if(!A || !yd) return '';
  const _HIST = !(BZ.birthYear>0 && (new Date().getFullYear())-BZ.birthYear+1<=120);
  const birthYear=BZ.birthYear;
  const cy=new Date().getFullYear();
  const rowHTML=(period, step, isCur, age)=>`<tr class="${isCur?'cur':''}"><td class="ev-period">${period}</td><td>${yunStateBadge(step.rating)}</td><td class="ev-result">${yunResultText(step.rating)}</td><td class="ev-coping">${yunCopingText(step.rating, age)}。${yunAreaText(step.lifeTrig, age)}</td></tr>`;
  let h=`<h4 class="det-h">流年事件</h4>`;
  // 流年事件表（当前所处大运的十年，完整展示）
  const dyStep = yd.steps.find(s=>!s.empty && s.gz===selDyGz);
  if(dyStep){
    h+=`<div class="yun-ev-title">当前大运 ${selDyGz}（十年）</div>`;
    const years=[];
    for(let y=dyStep.year; y<dyStep.year+10; y++) years.push(y);
    h+=`<div class="yun-scroll"><table class="yun-tbl yun-ev"><thead><tr><th>时间段</th><th>状态</th><th>结果</th><th>应对</th></tr></thead><tbody>`;
    years.forEach(y=>{
      const gz=liunianGZ(y);
      const ev=evalGZ(BZ,A,{gz,gan:gz[0],zhi:gz[1],age:y-birthYear+1,year:y,kind:'流年'});
      // 与当前大运卡已述的子句不再逐年复述（跨模块去重：本表只留逐年新增引动）
      if(dyStep && dyStep.lifeTrig && ev.lifeTrig){
        const dyAll=dyStep.lifeTrig.join('；');
        ev.lifeTrig=ev.lifeTrig.map(t=>{
          const m=/^(事业|婚姻|感情|健康|家庭|学业)：(.*)$/.exec(t);
          if(!m) return t;
          const subs=m[2].split('；').filter(x=>x && dyAll.indexOf(x)<0);
          return subs.length?m[1]+'：'+subs.join('；'):null;
        }).filter(Boolean);
      }
      const age=y-birthYear+1;
      const period = _HIST ? `<span class="ev-gz">${gz}</span>` : `<span class="ev-y">${y} 年</span><span class="ev-age">${age} 岁</span>`;
      h+=rowHTML(period, ev, (y===cy), age);
    });
    h+=`</tbody></table></div>`;
  }
  return h;
}

/* ============ 流年事件（固定段：当前所处大运十年；置于岁运引动之后、大运，流年，流月，流日之前）============ */
function renderYunEventFixed(BZ, A, yd){
  if(!A || !yd) return '';
  // 自动定位“当前所处大运”：起始年 <= 今年 的最大真实大运；未起运或之后则取第一步真实大运
  const cy=new Date().getFullYear();
  let cur=null;
  yd.steps.forEach(s=>{ if(s.empty) return; if(s.year<=cy && (!cur||s.year>cur.year)) cur=s; });
  if(!cur) cur = yd.steps.find(s=>!s.empty) || null;
  if(!cur || !cur.gz) return '';
  return renderYunEvent(BZ, A, yd, cur.gz);
}

/* ============ 宜忌选择，后天补救（趋吉避凶）============ */
function renderRemedy(BZ){
  const A=getAnalysis(BZ);
  const wxOf=g=>GAN_WX[g]||'';
  // 喜忌统一读综合/顺势口径（synthesis）：普通格=扶抑、特殊格=顺势（含十神类标注），与速览卡、岁运宜见一致；
  // 回落 fu（中和日主兜底仍走调候/通关/格局）
  const xiEff=(A.synthesis&&A.synthesis.xiCatsEff&&A.synthesis.xiCatsEff.length)?A.synthesis.xiCatsEff:(A.fu.xi||[]);
  const jiEff=(A.synthesis&&A.synthesis.jiCatsEff&&A.synthesis.jiCatsEff.length)?A.synthesis.jiCatsEff:(A.fu.ji||[]);
  // 喜用五行：读 synthesis.xiWxEff（结构化），中和空则走兜底
  const dwx=GAN_WX[BZ.dayGan];
  const favWx=[...(A.synthesis&&A.synthesis.xiWxEff&&A.synthesis.xiWxEff.length?A.synthesis.xiWxEff:(A.fu.xiWx||[]))];
  if(!favWx.length){
    // 中和日主：扶抑不拘，取调候、通关、格局用神之五行作为补救参考
    if(A.tiao&&A.tiao.wx) favWx.push(A.tiao.wx);
    if(A.tong&&A.tong.wx) favWx.push(A.tong.wx);
    if(A.geUse&&A.geUse.xiWx) A.geUse.xiWx.forEach(w=>{ if(w&&!favWx.includes(w)) favWx.push(w); });
  }
  const favDir=favWx.map(w=>({'木':'东','火':'南','土':'中','金':'西','水':'北'}[w])).filter(Boolean);
  const favColor=favWx.map(w=>({'木':'青绿','火':'红紫','土':'黄褐','金':'白金','水':'黑蓝'}[w])).filter(Boolean);
  const yi=`朝向${favDir.join('、')||'中宫'}方位发展；多用${favColor.join('、')||'中性'}色；从事喜用神对应行业：${xiEff.join('、')}；结交${(xiEff.join('').indexOf('印星')>=0||xiEff.join('').indexOf('比劫')>=0)?'师长同辈':'官财食伤'}之友；佩戴${favWx.map(w=>({'木':'木质、绿幽灵','火':'红玛瑙','土':'黄玉','金':'金属、白水晶','水':'黑曜石'}[w])).join('、')||'本命吉祥物'}。`;
  const jiTxt=`过度接触忌神五行：${jiEff.join('、')||'无'}；身弱忌独杠、身强忌固执；重大事项避开与日主相战之岁运。`;
  // 补救：方位与颜色合并为一项，用"；"分隔两组（组内"、"）；表格两栏（项目/内容）
  const buJiu=`方位：${favDir.join('、')||'中宫'}；颜色：${favColor.join('、')||'中性色'}`;
  return `<details class="zr-mod zr-quant" id="zr-yiji"><summary>宜忌选择</summary><div class="zr-mod-b"><div class="remedy">
    <table class="bazi-table remedy-tbl">
      <tr><th>项目</th><th>内容</th></tr>
      <tr><td class="lbl">依据</td><td>本模块补救五行取自上方“喜用格局”所定用神：${favWx.join('、')||'依格局而定'}　（五法用神明细、格局清浊与层次见该模块，此处不复述）</td></tr>
      <tr><td class="lbl">补救</td><td>${buJiu}</td></tr>
      <tr><td class="lbl rem-good">宜</td><td>${yi}</td></tr>
      <tr><td class="lbl rem-bad">忌</td><td>${jiTxt}</td></tr>
    </table>
  </div></div></details>`;
}

/* ---------- 大运 / 流年 / 流月 / 流日 ---------- */
// 依当前公历年份定位“当前所处大运”（起始年<=今年的最大真实大运；未起运则取第一步）
function currentDyIndex(BZ = window.BZ){
  const cy=new Date().getFullYear(); let best=1;
  for(let j=1;j<BZ.dys.length;j++){ const dy=BZ.dys[j]; if(!dy||!dy.getGanZhi()) continue;
    const sy=(dy._sy!=null?dy._sy:0); if(sy && sy<=cy) best=j; else if(sy>cy) break; }
  return best;
}
function renderDyn(BZ = window.BZ){
  const {ec,sex}=BZ;
  const yun=ec.getYun(sex); const dys=yun.getDaYun(11); // 取11个对象(index 0~10)，其中index 1~10为10个真实大运
  BZ.dys=dys; BZ.yun=yun; BZ.dyGZ=BZ.lnGZ=BZ.lmGZ=BZ.lrGZ=null;
  // 大运起始年：lunar.js 的 DaYun.getStartYear()/getLiuNian() 在多次调用时会被惰性改写（同批对象被 getAnalysis 触碰后即偏移），
  // 故改用确定性的算术推导：起运公历年 + (真实大运序-1)*10（index 1~10 为真实大运，每步严格10年）。
  const _startYear=(yun.getStartSolar&&yun.getStartSolar())?yun.getStartSolar().getYear():0;
  BZ.dys.forEach((dy,j)=>{ dy._sy = j>=1 ? _startYear + (j-1)*10 : _startYear; });
  /* 起运虚岁=起运公历年−出生年+1（与 DaYun.getStartAge() 同口径；折算年数 getStartYear() 仅作兜底） */
  const _by=BZ.birthYear||0;
  const _qyAge=_by?(_startYear-_by+1):yun.getStartYear();
  let html=`<div class="sub-note">${endDot('起运：'+qiYunLabel({age:_qyAge, month:yun.getStartMonth(), solar:yun.getStartSolar().toYmd()}))}</div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">大运</span><div class="dyn-row" id="dys"></div></div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">小运</span><div class="dyn-row" id="xys"></div></div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">流年</span><div class="dyn-row" id="lns"></div></div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">流月</span><div class="dyn-row" id="lms"></div></div>`;
  html+=`<div class="dyn-block"><span class="dyn-label">流日</span><div class="dyn-row" id="lrs"></div><div class="sub-note lr-hint" id="lrHint">先选上方“流月”，下方将列出该流月（节气月）期间的逐日干支，点选可看该日干支与命局关系。</div></div>`;
  html+=`<div class="sub-note" id="selDate">当前所选日期：-</div>`;
  html+=`<div id="dynDetail"></div>`;
  document.getElementById('dyn').innerHTML=html;
  const first=currentDyIndex(BZ);
  pickDy(first, BZ);
}
function pickDy(i, BZ = window.BZ){
  const _HIST = !(BZ.birthYear>0 && (new Date().getFullYear())-BZ.birthYear+1<=120);
  BZ.curDy=i; BZ.dyGZ=BZ.lnGZ=BZ.lmGZ=BZ.lrGZ=null;
  // 渲染大运按钮：index 0 为起运前，index 1~10 为10个真实大运
  let dhtml='';
  BZ.dys.forEach((dy,j)=>{
    const gz=dy.getGanZhi();
    if(j===0){
      const age=(dy.getStartAge?dy.getStartAge():'');
      dhtml+=`<button class="dyn-btn" id="dy0" onclick="pickDy(0)"><span class="dy-top">起运前</span><span class="g">-</span><span class="dy-age">${_HIST?'':age+'岁'}</span></button>`;
    } else {
      const sy=(dy._sy!=null?dy._sy:0), sa=dy.getStartAge();
      const inf=gzInfo(gz, BZ);
      dhtml+=`<button class="dyn-btn" id="dy${j}" onclick="pickDy(${j})"><span class="dy-top">${sy}</span><span class="dy-age">${_HIST?'':sa+'岁'}</span><span class="g">${gzAllColorSpan(gz)||'无'}</span></button>`;
    }
  });
  const dysEl=document.getElementById('dys'); if(dysEl) dysEl.innerHTML=dhtml;
  if(dysEl) dysEl.querySelectorAll('.dyn-btn').forEach(b=>b.classList.remove('active'));
  const de=document.getElementById('dy'+i); if(de) de.classList.add('active');
  const dy=BZ.dys[i];
  if(!dy){ updateDetail(BZ, CTX); return; }
  const gz=dy.getGanZhi(); BZ.dyGZ=gz||null;
  const lns=dy.getLiuNian(); BZ.lns=lns;
  BZ.xys=dy.getXiaoYun(lns.length);
  let html='';
  const dyAge=(BZ.dys[BZ.curDy]&&BZ.dys[BZ.curDy].getStartAge)?BZ.dys[BZ.curDy].getStartAge():0;
  lns.forEach((ln,j)=>{
    const lg=ln.getGanZhi();
    const inf=gzInfo(lg, BZ);
    html+=`<button class="dyn-btn" id="ln${j}" onclick="pickLn(${j})"><span class="dy-top">${ln.getYear()}</span><span class="dy-age">${_HIST?'':(dyAge+j)+'岁'}</span><span class="g">${gzAllColorSpan(lg)}</span></button>`;
  });
  document.getElementById('lns').innerHTML=html;
  /* 小运与流年逐年一一对应（同年、同岁），故按钮与流年同构（年、岁、干支三行），两行等高、可逐格横向对照 */
  let xhtml='';
  BZ.xys.forEach((xy,j)=>{
    xhtml+=`<button class="dyn-btn" id="xy${j}" onclick="pickXy(${j})"><span class="dy-top">${xy.getYear()}</span><span class="dy-age">${_HIST?'':xy.getAge()+'岁'}</span><span class="g">${gzAllColorSpan(xy.getGanZhi())||'无'}</span></button>`;
  });
  const xysEl=document.getElementById('xys'); if(xysEl) xysEl.innerHTML=xhtml;
  BZ.curXy=-1; BZ.xyGZ=null;
  document.getElementById('lms').innerHTML=''; document.getElementById('lrs').innerHTML='';
  const cy=new Date().getFullYear();
  let fj=lns.findIndex(x=>x.getGanZhi() && x.getYear()===cy);
  if(fj<0) fj=lns.findIndex(x=>x.getGanZhi());
  if(fj<0) fj=0;
  pickLn(fj, BZ);
  refreshHex(BZ);
  if(typeof baziInitDone!=='undefined' && baziInitDone && typeof savePillarSel==='function') savePillarSel(); /* 岁运点选即持久化，刷新后可恢复 */
}
function pickLn(j, BZ = window.BZ){
  BZ.curLn=j; BZ.lnGZ=BZ.lmGZ=BZ.lrGZ=null; BZ.lmDate=null; BZ.lrDate=null;
  document.querySelectorAll('#lns .dyn-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('ln'+j); if(el)el.classList.add('active');
  syncXy(j, BZ);   /* 小运与流年同索引：切流年即同步切小运，两者逐年并见 */
  const ln=BZ.lns[j]; const gz=ln.getGanZhi(); BZ.lnGZ=gz; BZ.curYear=ln.getYear();
  const lms=ln.getLiuYue(); BZ.lms=lms;
  let html='';
  lms.forEach((lm,k)=>{
    const mg=lm.getGanZhi();
    const inf=gzInfo(mg, BZ);
    html+=`<button class="dyn-btn" id="lm${k}" onclick="pickLm(${k})"><span class="dy-top">${k+1}月</span><span class="g">${gzAllColorSpan(mg)}</span></button>`;
  });
  document.getElementById('lms').innerHTML=html;
  document.getElementById('lrs').innerHTML='';
  const _lh=document.getElementById('lrHint'); if(_lh) _lh.textContent='先选上方“流月”，下方将列出该流月（节气月）期间的逐日干支，点选可看该日干支与命局关系。';
  pickLm(0, BZ);
  if(typeof baziInitDone!=='undefined' && baziInitDone && typeof savePillarSel==='function') savePillarSel(); /* 岁运点选即持久化，刷新后可恢复 */
}
/* 小运与流年逐年同索引（同年、同岁），两者恒锁步。syncXy 只切高亮与状态，详情面板由紧随其后的
   pickLm 统一重渲染；pickXy 供小运行按钮直接点选，即跳到该年。小运为辅象，不进所选干支的层级栈
   （岁运事件的力度档位只分大运、流年、流月、流日四层），故在详情面板内单出一块。 */
function syncXy(j, BZ = window.BZ){
  const xys=BZ.xys||[];
  if(j<0 || j>=xys.length){ BZ.curXy=-1; BZ.xyGZ=null; }
  else { BZ.curXy=j; BZ.xyGZ=xys[j].getGanZhi()||null; }
  document.querySelectorAll('#xys .dyn-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('xy'+j); if(el) el.classList.add('active');
}
function pickXy(j, BZ = window.BZ){ pickLn(j, BZ); }
function pickLm(k, BZ = window.BZ){
  BZ.curLm=k; BZ.lmGZ=BZ.lrGZ=null; BZ.lrDate=null;
  document.querySelectorAll('#lms .dyn-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('lm'+k); if(el)el.classList.add('active');
  const yy=BZ.curYear; const lm=BZ.lms[k]; const gz=lm.getGanZhi(); BZ.lmGZ=gz;
  let html=''; let minKey=null, maxKey=null;
  // 流月为节气月：寅月(1月)在本年2-3月、…、丑月(12月)在次年1-2月；遍历 本年1~12月 + 次年1~2月，保证跨年流月也能列出流日
  const RANGES=[[yy,1,12],[yy+1,1,2]];
  for(const [Y,m0,m1] of RANGES){
    for(let mo=m0; mo<=m1; mo++){
      const dmax=daysOfMonth(Y, mo);
      for(let day=1; day<=dmax; day++){
        let gzDay='', mz='';
        try{ const lu=Solar.fromYmd(Y,mo,day).getLunar(); gzDay=lu.getDayInGanZhi(); mz=lu.getEightChar().getMonth(); }catch(e){}
        if(mz===gz){
          const key=Y*10000+mo*100+day;
          if(minKey===null||key<minKey) minKey=key;
          if(maxKey===null||key>maxKey) maxKey=key;
          const z=gzDay[1]; const cs=z?getChangSheng(BZ.dayGan,z):'';
          const inf=gzInfo(gzDay, BZ);
          html+=`<button class="dyn-btn lr" id="lr_${Y}_${mo}_${day}" onclick="pickLr(${Y},${mo},${day})"><span class="dy-top">${day}</span><span class="g">${gzAllColorSpan(gzDay)}</span></button>`;
        }
      }
    }
  }
  document.getElementById('lrs').innerHTML=html;
  BZ.lmDate=(minKey===null)?{y:yy, m:(k+1)}:{y:Math.floor(minKey/10000), m:Math.floor(minKey/100)%100};
  const lrsEl=document.getElementById('lrs');
  let lrCount=0;
  if(lrsEl){
    lrCount=lrsEl.querySelectorAll('.dyn-btn.lr').length;
    lrsEl.style.setProperty('--lr-cols', String(Math.max(1, Math.ceil(lrCount/3))));
  }
  const lrHintEl=document.getElementById('lrHint');
  if(lrHintEl){
    const span=(minKey===null)?'' : `（公历 ${Math.floor(minKey/10000)}-${String(Math.floor(minKey/100)%100).padStart(2,'0')}-${String(minKey%100).padStart(2,'0')} 至 ${Math.floor(maxKey/10000)}-${String(Math.floor(maxKey/100)%100).padStart(2,'0')}-${String(maxKey%100).padStart(2,'0')}）`;
    lrHintEl.textContent = `已列出 ${lrCount} 个流日：流月（${gz}）节气期间逐日干支${span}，点选其一查看与命局关系。`;
  }
  const first=document.querySelector('#lrs .dyn-btn');
  if(first){ try{ first.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }catch(e){ first.click(); } }
  else updateDetail(BZ, CTX);
  if(typeof baziInitDone!=='undefined' && baziInitDone && typeof savePillarSel==='function') savePillarSel(); /* 岁运点选即持久化，刷新后可恢复 */
}
function pickLr(yy,mo,day, BZ = window.BZ){
  document.querySelectorAll('#lrs .dyn-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('lr_'+yy+'_'+mo+'_'+day); if(el)el.classList.add('active');
  let gzDay=''; try{ gzDay=Solar.fromYmd(yy,mo,day).getLunar().getDayInGanZhi(); }catch(e){}
  BZ.lrGZ=gzDay||null; BZ.lrDate={y:yy, m:mo, d:day};
  updateDetail(BZ, CTX);
  if(typeof baziInitDone!=='undefined' && baziInitDone && typeof savePillarSel==='function') savePillarSel(); /* 岁运点选即持久化，刷新后可恢复 */
}
function refreshHex(BZ = window.BZ){
  const el=document.getElementById('hexWrap');
  if(el && typeof renderHex==='function'){ try{ el.innerHTML=renderHex(BZ); }catch(e){} }
}

/* ---------- 一生运势曲线图（大运 / 流年 / 综合运势 三条曲线） ---------- */
function buildYunData(BZ = window.BZ){
  // 一生运势曲线数据：大运 / 流年 / 综合运势 三条曲线。
  // 大运按“完整十年大运”延伸：覆盖到 100 岁以后，并保证最后一个大运周期完整（不以年份硬切）。
  // 实现完全自研（纯 SVG + 专属评分算法），仅参考公开命理概念，未使用任何第三方代码或素材。
  const birthYear=BZ.birthYear;
  const dys=BZ.dys;
  const _GAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const _ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  function _gzIndex(gz){ for(let k=0;k<60;k++){ if(_GAN[k%10]===gz[0]&&_ZHI[k%12]===gz[1]) return k; } return 0; }
  // index 0 为起运前，不应参与大运曲线；定位第一个真实大运，所有大运计算从此开始。
  let firstRealIdx = dys.findIndex((d,i)=>i>0 && d.getGanZhi());
  if(firstRealIdx < 0) firstRealIdx = 1;
  const hasReal = firstRealIdx < dys.length && dys[firstRealIdx];
  const n0 = hasReal ? (dys[firstRealIdx]._sy!=null?dys[firstRealIdx]._sy:birthYear) : birthYear; // 第一个真实大运起始年（用缓存 _sy，避免 getStartYear 被惰性改写）
  const pattern = hasReal ? dys.slice(firstRealIdx).map(d=>d.getGanZhi()) : []; // 真实大运干支序列
  // 大运干支按六十甲子顺、逆步进延伸（不依赖库提供的周期数量，可完整覆盖到 100 岁后）
  function dayunGZat(y){
    if(y<n0 || !pattern.length) return null;
    const idx0=_gzIndex(pattern[0]);
    const step=pattern.length>1 ? ((_gzIndex(pattern[1])-idx0+60)%60) : 1;
    const k=(idx0+step*Math.floor((y-n0)/10))%60;
    return _GAN[k%10]+_ZHI[k%12];
  }
  /* 流年干支取全局 liunianGZ(y)（立春为干支年界） */
  const minEnd = birthYear+100;                                     // 至少覆盖到 100 岁
  const endYear = dys.length ? (n0-1 + Math.ceil((minEnd-n0+1)/10)*10) : minEnd; // 向上取到完整大运周期末年
  const A=getAnalysis(BZ);
  const data=[];
  for(let y=birthYear; y<=endYear; y++){
    const dyGZ=dayunGZat(y);
    const lnGZ=liunianGZ(y);
    const dyP=dyGZ?pillarScoreParts(dyGZ,A):null;
    const lnP=lnGZ?pillarScoreParts(lnGZ,A):null;
    const dayunScore=dyP?dyP.full:SCORE_BASE;
    const liunianScore=lnP?lnP.full:SCORE_BASE;
    const actual=Math.round(dayunScore*YUN_W_DAYUN+liunianScore*YUN_W_SUB);       // 综合运势 = 综合分（大运分×0.55 + 流年分×0.45，与综合分表完全一致）
    data.push({year:y, age:y-birthYear+1, dayun:dayunScore, liunian:liunianScore, actual:actual, dayunGZ:dyGZ, liunianGZ:lnGZ, dayunReason: dyP?dyP.parts.join(' '):'', liunianReason: lnP?lnP.parts.join(' '):''});
  }
  // 直接采用 pillarScoreParts 的原始分数（已是 0~100 的绝对分，经 clampScore 钳制），不做 min/max 归一化。
  // 原因：原归一化把三条曲线所有年份混算全局最小、最大并拉伸到 0~100；流年逐年变化、方差最大，
  // 必然占据两极，造成“流年 0 分 / 100 分”的极端假象。原始分才反映该年与命局协调度的真实强弱，
  // 且三条曲线同处 0~100 量纲，可直接对比。
  // 大运换运节点：直接调用大运数据（dys[i].getStartYear() 真实起运年 + dys[i].getGanZhi() 真实干支），
  // 步数可能不足 100 岁后，超出部分按六十甲子顺、逆推延伸，保证覆盖完整大运周期。
  const bounds=[];
  const seenY=new Set();
  if(dys && dys.length){
    for(let i=firstRealIdx; i<dys.length; i++){
      const d=dys[i];
      const sy=(d._sy!=null?d._sy:(d.getStartYear?d.getStartYear():null));
      if(sy==null || sy<n0 || sy>endYear) continue;
      if(seenY.has(sy)) continue;
      seenY.add(sy);
      bounds.push({year:sy, gz:d.getGanZhi()||'', idx:i});
    }
  }
  if(bounds.length){
    // 顺、逆推方向：取第一个“相邻且干支均非空”的节点对判断（顺行差 1，逆行差 59≡-1）。
    // 注意：库的首步大运 getGanZhi() 常返回空，须跳过空值再判定，否则方向会算反。
    let dir=1;
    for(let k=0;k<bounds.length-1;k++){
      if(bounds[k].gz && bounds[k+1].gz){
        const d0=_gzIndex(bounds[k].gz), d1=_gzIndex(bounds[k+1].gz);
        const delta=((d1-d0)%60+60)%60;
        dir = delta===1 ? 1 : (delta===59 ? -1 : (delta<30 ? 1 : -1));
        break;
      }
    }
    // 回填起始处因库返回空而缺失的干支（按 dir 逆推），避免首节点干支缺失
    for(let k=1;k<bounds.length;k++){
      if(bounds[k].gz && !bounds[k-1].gz){
        const ik=_gzIndex(bounds[k].gz);
        const ik0=((ik-dir)%60+60)%60;
        bounds[k-1].gz=_GAN[ik0%10]+_ZHI[ik0%12];
      }
    }
    let lastY=bounds[bounds.length-1].year;
    let lastIdx=_gzIndex(bounds[bounds.length-1].gz);
    while(lastY+10<=endYear){
      const ny=lastY+10;
      lastIdx=(lastIdx+dir+60)%60;
      const nz=_GAN[lastIdx%10]+_ZHI[lastIdx%12];
      if(!seenY.has(ny)){ seenY.add(ny); bounds.push({year:ny, gz:nz, idx:bounds[bounds.length-1].idx+1}); }
      lastY=ny;
    }
  }
  return {data, n0, pattern, endYear, birthYear, bounds};
}
/* 一生运势曲线图：纯自研 SVG + 专属评分算法，仅参考公开命理概念（大运、流年、综合三条曲线），
   未使用任何第三方库的代码或素材，无版权合规风险。 */
/* 平滑曲线：Catmull-Rom 样条转三次贝塞尔，消除折线生硬感，曲线更丝滑（用于流年、综合） */
function smoothPath(pts, yMin, yMax){
  if(pts.length<2) return '';
  let d=`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    // 防过冲：将贝塞尔控制点 Y 钳制在绘图区内（分数 0~100 对应像素 [yMin,yMax]）。
    // 因所有数据点与钳制后的控制点均落在凸的绘图矩形内，三次贝塞尔段必不越界，
    // 从而避免流年、综合曲线在相邻年之间鼓出到 100 分以上或 0 分以下。
    let cc1y=c1y, cc2y=c2y;
    if(typeof yMin==='number' && typeof yMax==='number'){ cc1y=Math.max(yMin,Math.min(yMax,c1y)); cc2y=Math.max(yMin,Math.min(yMax,c2y)); }
    d+=` C ${c1x.toFixed(1)} ${cc1y.toFixed(1)} ${c2x.toFixed(1)} ${cc2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
/* 阶梯线：大运为每十年恒定分数，用水平线段+垂直跳变表示，避免样条过冲造成的凸起 */
function stepPath(pts){
  if(pts.length<2) return '';
  let d=`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for(let i=1;i<pts.length;i++){
    const cur=pts[i];
    d+=` H ${cur[0].toFixed(1)} V ${cur[1].toFixed(1)}`;
  }
  return d;
}
/* 某年所属大运干支：以首个真实大运为基点，按六十甲子步进延伸，可覆盖库未提供的高龄段。 */
function _dayunGZatYear(y, BZ = window.BZ){
  const dys=BZ&&BZ.dys; if(!dys||!dys.length) return null;
  let i=dys.findIndex((d,k)=>k>0 && d.getGanZhi()); if(i<0) i=1;
  if(i>=dys.length) return null;
  const n0=dys[i]._sy!=null?dys[i]._sy:BZ.birthYear; if(y<n0) return null;
  const pat=dys.slice(i).map(d=>d.getGanZhi()).filter(Boolean); if(!pat.length) return null;
  const i0=gzIndexOf(pat[0]);
  const st=pat.length>1 ? ((gzIndexOf(pat[1])-i0+60)%60) : 1;
  return gzAtIndex(i0 + st*Math.floor((y-n0)/10));
}
function _yunSchedule(BZ = window.BZ){
  if(_yunChartRAF!==null){ _yunChartPending=true; return; }
  _yunChartRAF=_raf(function tick(){ _yunChartRAF=null; try{ _renderYun(BZ); }catch(e){} if(_yunChartPending){ _yunChartPending=false; _yunChartRAF=_raf(tick); } });
}
function drawYunChart(BZ = window.BZ){ _yunLevel=0; _yunSel={year:null,month:null}; _yunSchedule(BZ); }
function drawYunMonth(year, BZ = window.BZ){ _yunLevel=1; _yunSel={year,month:null}; _yunSchedule(BZ); }
function drawYunDay(year, month, BZ = window.BZ){ _yunLevel=2; _yunSel={year,month}; _yunSchedule(BZ); }
function _renderYun(BZ = window.BZ){
  renderYunCrumbs();
  const cfg = _yunLevel===0 ? _yunCfgYear(BZ) : _yunLevel===1 ? _yunCfgMonth(_yunSel.year, BZ) : _yunCfgDay(_yunSel.year,_yunSel.month, BZ);
  if(!cfg) return;
  renderYunSvg(cfg, BZ);
}
function renderYunCrumbs(){
  const el=document.getElementById('yunCrumbs'); if(!el) return;
  const parts=['<span class="yc-item'+( _yunLevel===0?' yc-cur':'')+'" data-lv="0">一生运势</span>'];
  if(_yunLevel>=1) parts.push('<span class="yc-sep">›</span><span class="yc-item'+( _yunLevel===1?' yc-cur':'')+'" data-lv="1">'+_yunSel.year+'年</span>');
  if(_yunLevel>=2) parts.push('<span class="yc-sep">›</span><span class="yc-item yc-cur" data-lv="2">'+_yunSel.month+'月（'+YUN_MZ[_yunSel.month-1]+'）</span>');
  el.innerHTML=parts.join('');
  el.querySelectorAll('.yc-item').forEach(s=>s.addEventListener('click',()=>{ const lv=+s.getAttribute('data-lv'); if(lv===0) drawYunChart(); else if(lv===1 && _yunSel.year!=null) drawYunMonth(_yunSel.year); }));
}
/* 通用运势曲线绘制：cfg={series:[{key,label,color,kind:'smooth'|'step'}], points:[{x, ...meta}], xMin,xMax,
   ticks:[{x,l1,l2}], minor:[{x}], boundaries:[{x,l1,l2}], stepOk:(p)=>bool, tip:(p,colors,labels,ge)=>html, onPick:(p)=>void, hint} */
function renderYunSvg(cfg, BZ = window.BZ){
  const wrap=document.getElementById('yunChartWrap'); if(!wrap) return;
  const pts=cfg.points; if(!pts.length) return;
  const A=getAnalysis(BZ); const ge=A.geName;
  const W=960, H=360, M={t:30,r:30,b:72,l:46};
  const iw=W-M.l-M.r, ih=H-M.t-M.b;
  const xMin=cfg.xMin, xMax=cfg.xMax, span=Math.max(1,xMax-xMin);
  const xOf=v=>M.l+(v-xMin)/span*iw;
  const yOf=v=>M.t+ih-(v/100)*ih;
  const colors={}, labels={}; cfg.series.forEach(s=>{ colors[s.key]=s.color; labels[s.key]=s.label; });
  let svg=`<svg viewBox="0 0 ${W} ${H}" class="yun-chart" preserveAspectRatio="xMidYMid meet">`;
  svg+=`<defs><clipPath id="yunClip"><rect x="${M.l}" y="${M.t}" width="${iw}" height="${ih}"/></clipPath></defs>`;
  for(let v=0;v<=100;v+=20){ const yy=yOf(v); svg+=`<line x1="${M.l}" y1="${yy}" x2="${W-M.r}" y2="${yy}" class="yun-grid"/><text x="${M.l-8}" y="${yy+4}" class="yun-axis-label y">${v}</text>`; }
  svg+=`<line x1="${M.l}" y1="${H-M.b}" x2="${W-M.r}" y2="${H-M.b}" class="yun-axis"/>`;
  svg+=`<line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${H-M.b}" class="yun-axis"/>`;
  (cfg.minor||[]).forEach(t=>{ const x=xOf(t.x); svg+=`<line x1="${x}" y1="${H-M.b}" x2="${x}" y2="${H-M.b+3}" class="yun-tick minor"/>`; });
  (cfg.ticks||[]).forEach(t=>{ const x=xOf(t.x); svg+=`<line x1="${x}" y1="${H-M.b}" x2="${x}" y2="${H-M.b+6}" class="yun-tick"/>`; if(t.l1) svg+=`<text x="${x}" y="${H-M.b+14}" class="yun-boundary-text" transform="rotate(-40, ${x}, ${H-M.b+14})">${t.l1}</text>`; if(t.l2) svg+=`<text x="${x}" y="${H-M.b+30}" class="yun-boundary-text gz" transform="rotate(-40, ${x}, ${H-M.b+30})">${t.l2}</text>`; });
  (cfg.boundaries||[]).forEach(b=>{ const x=xOf(b.x); svg+=`<line x1="${x}" y1="${M.t}" x2="${x}" y2="${H-M.b}" class="yun-boundary"/>`; svg+=`<text x="${x}" y="${H-M.b+14}" class="yun-boundary-text" transform="rotate(-40, ${x}, ${H-M.b+14})">${b.l1}</text>`; if(b.l2) svg+=`<text x="${x}" y="${H-M.b+30}" class="yun-boundary-text gz" transform="rotate(-40, ${x}, ${H-M.b+30})">${b.l2}</text>`; });
  svg+=`<g clip-path="url(#yunClip)">`;
  cfg.series.forEach(s=>{
    if(s.kind==='step'){
      const ok=cfg.stepOk||(p=>p[s.key]!=null);
      const sp=pts.filter(ok).map(p=>[xOf(p.x), yOf(p[s.key])]);
      svg+=`<path d="${stepPath(sp)}" fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="yun-line ${s.key}"/>`;
    } else {
      const sp=pts.map(p=>[xOf(p.x), yOf(p[s.key])]);
      svg+=`<path d="${smoothPath(sp, M.t, H-M.b)}" fill="none" stroke="${s.color}" stroke-width="${s.key==='actual'?2.4:2.0}" stroke-linecap="round" stroke-linejoin="round" class="yun-line ${s.key}"/>`;
    }
  });
  svg+=`</g>`;
  svg+=`<line id="yunCv" class="yun-cross" x1="0" y1="${M.t}" x2="0" y2="${H-M.b}" style="display:none"/>`;
  svg+=`<line id="yunCh" class="yun-cross" x1="${M.l}" y1="0" x2="${W-M.r}" y2="0" style="display:none"/>`;
  Object.keys(colors).forEach(k=>svg+=`<circle id="yunPt_${k}" class="yun-pt" r="3.5" style="display:none"/>`);
  svg+=`<rect id="yunHit" x="${M.l}" y="${M.t}" width="${iw}" height="${ih}" fill="transparent" pointer-events="all" style="cursor:${cfg.onPick?'pointer':'crosshair'}"/>`;
  svg+=`</svg>`;
  let legend=`<div class="yun-legend">`; cfg.series.forEach(s=>legend+=`<span class="yun-legend-item"><i style="background:${s.color}"></i>${s.label}</span>`); legend+=`</div>`;
  wrap.innerHTML=`<div class="yun-chart-box">${svg}</div>${legend}<div class="yun-mobile-hint">${cfg.hint||'← 左右滑动查看完整曲线，点击定位年份'}</div>`;
  const svgEl=wrap.querySelector('svg.yun-chart');
  const hit=wrap.querySelector('#yunHit');
  const cv=wrap.querySelector('#yunCv'), ch=wrap.querySelector('#yunCh');
  const pEls={}; Object.keys(colors).forEach(k=>pEls[k]=wrap.querySelector('#yunPt_'+k));
  let tip=wrap.querySelector('.yun-tip'); if(!tip){ tip=document.createElement('div'); tip.className='yun-tip'; const lg=wrap.querySelector('.yun-legend'); lg?wrap.insertBefore(tip,lg):wrap.appendChild(tip); }
  let lastSel=null;
  let touchMoved=false, tsX=0, tsY=0, pendingPick=null, suppressClick=false;
  function getXY(ev){ if(ev.touches&&ev.touches.length) return {x:ev.touches[0].clientX,y:ev.touches[0].clientY}; if(ev.changedTouches&&ev.changedTouches.length) return {x:ev.changedTouches[0].clientX,y:ev.changedTouches[0].clientY}; return {x:ev.clientX,y:ev.clientY}; }
  function nearest(x){ let best=null,bd=1e9; pts.forEach(p=>{ const d=Math.abs(xOf(p.x)-x); if(d<bd){bd=d;best=p;} }); return best; }
  function placeTip(p){
    if(!p) return;
    if(window.matchMedia('(max-width:760px)').matches) return;   // 手机端走下方（CSS static），不定位
    const tw=tip.offsetWidth, th=tip.offsetHeight;
    const wr=wrap.getBoundingClientRect(); const ww=wrap.clientWidth||wr.width, wh=wrap.clientHeight||wr.height;
    let cx=0, cy=0, got=false;
    // 方案1：getScreenCTM（最准确，支持缩放/transform）
    if(svgEl && typeof svgEl.getScreenCTM==='function'){
      const ctm=svgEl.getScreenCTM();
      if(ctm){
        const x=xOf(p.x), y=yOf(p.actual);
        const sp=svgEl.createSVGPoint(); sp.x=x; sp.y=y; const loc=sp.matrixTransform(ctm);
        cx=loc.x; cy=loc.y; got=true;
      }
    }
    // 方案2：getBoundingClientRect + viewBox/像素 比（getScreenCTM 失败时兜底）
    if(!got && svgEl){
      try{
        const rect=svgEl.getBoundingClientRect();
        const vb=svgEl.viewBox&&svgEl.viewBox.baseVal;
        if(vb && vb.width>0 && vb.height>0){
          const xRatio=rect.width/vb.width, yRatio=rect.height/vb.height;
          cx=rect.left + xOf(p.x)*xRatio;
          cy=rect.top  + yOf(p.actual)*yRatio;
          got=true;
        }
      }catch(e){}
    }
    // 方案3：仍失败则放在 SVG 顶部居中（绝不让 tip 消失）
    if(!got){ const rect=svgEl?svgEl.getBoundingClientRect():{left:0,top:0,width:0,height:0}; cx=rect.left+rect.width/2; cy=rect.top+20; }
    cx-=wr.left; cy-=wr.top;   // 转成相对 #yunChartWrap，避开 .mod:hover 的 transform 包含块陷阱
    let tx=cx+14, ty=cy+14;
    if(tx+tw>ww-4) tx=cx-tw-14; if(ty+th>wh-4) ty=cy-th-14;
    tx=Math.max(4, Math.min(tx, Math.max(4, ww-tw-4))); ty=Math.max(4, Math.min(ty, Math.max(4, wh-th-4)));
    tip.style.left=tx+'px'; tip.style.top=ty+'px';
  }
  function yunMove(ev){
    if(!svgEl||typeof svgEl.getScreenCTM!=='function') return;
    const ctm=svgEl.getScreenCTM(); if(!ctm) return;
    const {x:cx,y:cy}=getXY(ev); const sp=svgEl.createSVGPoint(); sp.x=cx; sp.y=cy;
    const loc=sp.matrixTransform(ctm.inverse()); const p=nearest(loc.x); if(!p) return;
    lastSel=p;
    const x=xOf(p.x);
    cv.setAttribute('x1',x); cv.setAttribute('x2',x); cv.style.display='';
    ch.setAttribute('y1',yOf(p.actual)); ch.setAttribute('y2',yOf(p.actual)); ch.style.display='';
    Object.keys(colors).forEach(k=>{ const el=pEls[k]; if(!el) return; const v=p[k]; if(v==null){ el.style.display='none'; return; } el.setAttribute('cx',x); el.setAttribute('cy',yOf(v)); el.setAttribute('fill',colors[k]); el.style.display=''; });
    tip.innerHTML=cfg.tip(p,colors,labels,ge);
    tip.style.display='block';
    placeTip(p);   // 桌面端悬浮跟随十字线；手机端（CSS static）走下方，不定位
  }
  function yunLeave(){ cv.style.display='none'; ch.style.display='none'; Object.values(pEls).forEach(p=>p.style.display='none'); tip.style.display='none'; }
  function yunClick(ev){
    if(suppressClick){ suppressClick=false; return; }
    // 点击时也走 yunMove 把 tip 显出来（解决"点击曲线看不到弹出内容框"）
    yunMove(ev);
    if(!cfg.onPick||!svgEl||typeof svgEl.getScreenCTM!=='function') return;
    const ctm=svgEl.getScreenCTM(); if(!ctm) return;
    const {x:cx,y:cy}=getXY(ev); const sp=svgEl.createSVGPoint(); sp.x=cx; sp.y=cy;
    const loc=sp.matrixTransform(ctm.inverse()); const p=nearest(loc.x); if(p) cfg.onPick(p);
  }
  if(hit){
    hit.addEventListener('mousemove',yunMove);
    hit.addEventListener('mouseleave',yunLeave);
    hit.addEventListener('click',yunClick);
    hit.addEventListener('touchstart',function(e){ touchMoved=false; suppressClick=false; const t=e.touches[0]; tsX=t?t.clientX:0; tsY=t?t.clientY:0; yunMove(e); }, {passive:true});
    hit.addEventListener('touchmove',function(e){ const t=e.touches[0]; if(t&&(Math.abs(t.clientX-tsX)>10||Math.abs(t.clientY-tsY)>10)){ touchMoved=true; suppressClick=true; } }, {passive:true});
    hit.addEventListener('touchend',function(e){
      if(touchMoved) return;                       // 横向平移查看曲线，不视为点击
      if(!cfg.onPick) return;
      yunMove(e);                                  // 先定位十字线
      const p=lastSel; if(!p) return;
      if(pendingPick!==null && pendingPick===p.x){ cfg.onPick(p); pendingPick=null; }   // 同处再点 → 下钻一级
      else { pendingPick=p.x; }                    // 首次点击仅定位，不下钻
      if(e.cancelable) e.preventDefault();         // 阻止合成 click 再次下钻
    }, {passive:false});
    hit.addEventListener('touchcancel',yunLeave);
  }
  const box=wrap.querySelector('.yun-chart-box');
  if(box){
    box.addEventListener('scroll', function(){
      if(!lastSel || tip.style.display==='none') return;
      if(window.matchMedia('(max-width:760px)').matches) return;
      placeTip(lastSel);
    });
  }
}

function relToMing(z){
  const names={0:'年支',1:'月支',2:'日支',3:'时支'};
  const pz=[BZ.yearZ,BZ.monthZ,BZ.dayZ,BZ.timeZ]; const out=[];
  pz.forEach((p,i)=>{ if(p===z) return;
    zhiRelTypes(z,p).forEach(t=>{
      if(t==='暗合') return;
      if(t==='冲') out.push('冲'+names[i]+'('+p+')');
      else if(t==='合') out.push('合'+names[i]+'('+p+')');
      else if(t==='害') out.push('害'+names[i]+'('+p+')');
      else if(t==='破') out.push('破'+names[i]+'('+p+')');
      else if(t==='刑') out.push('刑'+names[i]+'('+p+')');
    });
  });
  return out;
}
function fanTaiSui(z, yz){
  const out=[];
  if(z===yz) out.push('值太岁（本命年）');
  if(pairIn(z,yz,DIZHI_CHONG)) out.push('冲太岁（'+z+'冲'+yz+'）');
  const wux={寅:'巳',巳:'申',申:'寅'}; if(wux[z]===yz||wux[yz]===z) out.push('刑太岁（寅巳申无恩之刑）');
  const shi={丑:'戌',戌:'未',未:'丑'}; if(shi[z]===yz||shi[yz]===z) out.push('刑太岁（丑戌未恃势之刑）');
  if((z==='子'&&yz==='卯')||(z==='卯'&&yz==='子')) out.push('刑太岁（子卯无礼之刑）');
  if(pairIn(z,yz,DIZHI_HAI)) out.push('害太岁（'+z+'害'+yz+'）');
  if(pairIn(z,yz,DIZHI_PO)) out.push('破太岁（'+z+'破'+yz+'）');
  return out;
}

function updateSelDateLine(BZ, sel){
  const el=document.getElementById('selDate');
  if(!el) return;
  const parts=[];
  sel.forEach(s=>{
    if(s.lvl==='大运'){
      const dy=(BZ.dys||[]).find(x=>x.getGanZhi&&x.getGanZhi()===s.gz);
      const sy=dy?dy._sy:null;
      parts.push(sy?`大运${s.gz} 约 ${sy}–${sy+9} 年`:`大运${s.gz}`);
      /* 小运与流年同索引锁步，紧随大运列出：先运后流（运＝大运＋小运，流＝流年、流月、流日），
         与所选干支详情、与命局干支关系两表的列序同一口径。 */
      const xy=(BZ.xys&&BZ.curXy>=0)?BZ.xys[BZ.curXy]:null;
      if(BZ.xyGZ && BZ.xyGZ.length>=2) parts.push(xy?`小运${BZ.xyGZ} ${xy.getYear()} 年`:`小运${BZ.xyGZ}`);
    } else if(s.lvl==='流年'){
      parts.push(`流年${s.gz} ${BZ.curYear} 年`);
    } else if(s.lvl==='流月'){
      const md=BZ.lmDate;
      parts.push(md?`流月${s.gz} ${md.y} 年 ${md.m} 月`:`流月${s.gz}`);
    } else if(s.lvl==='流日'){
      const d=BZ.lrDate;
      parts.push(d?`流日${s.gz} ${d.y} 年 ${d.m} 月 ${d.d} 日`:`流日${s.gz}`);
    }
  });
  el.textContent = `当前所选日期：${parts.length?parts.join('、'):'-'}`;
}
function updateDetail(BZ = window.BZ, CTX = window.CTX){
 const box=document.getElementById('dynDetail');
 if(!box) return;
 try{
  const dayGan=BZ.dayGan;
  let _A=null, _daScore=null, _lnScore=null, _actual=null;
  try{ _A=getAnalysis(BZ); }catch(e){ _A=null; }
  if(_A){
    if(BZ.dyGZ){ const dp=pillarScoreParts(BZ.dyGZ,_A); _daScore=dp.full; }
    if(BZ.lnGZ){ const lp=pillarScoreParts(BZ.lnGZ,_A); _lnScore=lp.full; }
    if(_daScore!=null && _lnScore!=null) _actual=clampScore(YUN_W_DAYUN*_daScore+YUN_W_SUB*_lnScore);
  }
  const sel=[];
  if(BZ.dyGZ) sel.push({lvl:'大运',gz:BZ.dyGZ});
  if(BZ.lnGZ) sel.push({lvl:'流年',gz:BZ.lnGZ});
  if(BZ.lmGZ) sel.push({lvl:'流月',gz:BZ.lmGZ});
  if(BZ.lrGZ) sel.push({lvl:'流日',gz:BZ.lrGZ});
  if(!sel.length){ box.innerHTML='<div class="mh-ref"><h4 class="det-h">所选干支详情</h4><div class="dyn-detail"><span class="sub-note">请在上方选择大运、流年、流月、流日查看详情。</span></div></div>'; return; }
  const curPath=sel.map(s=>s.lvl+s.gz).join('>');
  // ===== 所选干支详情（表格化，复用 .yun-tbl 框架） =====
  const DD = sel.map(s=>{
    const z=s.gz[1];
    let sha=[]; try{ sha=pillarShaMerged({gz:s.gz,z,isDay:false}, CTX)||[]; }catch(e){ sha=[]; }
    const kong=kongOf(s.gz);
    const ny=nayinOf(s.gz); const info=(typeof NAYIN_INFO!=='undefined'&&NAYIN_INFO[ny])||{wx:'',d:''};
    const zMain=zhiMain(z);
    const cs=z?getChangSheng(dayGan,z):'';
    const row={lvl:s.lvl, gz:s.gz, sha, kong, ny, info, zMain, cs,
      tenGan:tenGod(dayGan,s.gz[0]), tenZhi:tenGod(dayGan,zMain),
      ft:(s.lvl==='流年')?fanTaiSui(z,BZ.yearZ):null,
      front:null, back:null, full:null, actual:null, tend:duanVerdict(s.gz,s.lvl,BZ)};
    if(_A){
      const sp=pillarScoreParts(s.gz,_A);
      if(s.lvl==='大运'){ row.front=sp.front; row.back=sp.back; row.full=sp.full; }
      else { row.full=sp.full; }
      if(_actual!=null) row.actual=_actual;
    }
    return row;
  });
  /* 小运列：随流年同岁并见，作展示列插在大运列之后，与所选干支各列同格同口径。
     不进 sel（层级栈只分大运、流年、流月、流日四层），故岁运事件的力度档位与流派解读不含小运。 */
  const xRow=(()=>{
    const gz=BZ.xyGZ; if(!gz||gz.length<2) return null;
    const z=gz[1];
    let sha=[]; try{ sha=pillarShaMerged({gz,z,isDay:false}, CTX)||[]; }catch(e){ sha=[]; }
    const ny=nayinOf(gz); const info=(typeof NAYIN_INFO!=='undefined'&&NAYIN_INFO[ny])||{wx:'',d:''};
    const zMain=zhiMain(z);
    const row={lvl:'小运', gz, sha, kong:kongOf(gz), ny, info, zMain,
      cs:z?getChangSheng(dayGan,z):'',
      tenGan:tenGod(dayGan,gz[0]), tenZhi:tenGod(dayGan,zMain),
      ft:null, front:null, back:null, full:null, actual:null, tend:duanVerdict(gz,'小运',BZ)};
    if(_A){ const sp=pillarScoreParts(gz,_A); row.full=sp.full; }
    return row;
  })();
  /* 展示列序＝大运、小运、流年、流月、流日（大小运相邻，再列流年月日） */
  if(xRow){ const i=DD.findIndex(d=>d.lvl==='大运'); DD.splice(i<0?0:i+1,0,xRow); }
  const hasLn = DD.some(d=>d.lvl==='流年');
  let html=`<div class="mh-ref"><h4 class="det-h">所选干支详情</h4><div class="dyn-detail">`;
  // 表1：所选干支详情（行=项目，列=所选干支）
  html+=`<div class="yun-scroll"><table class="yun-tbl detail${xRow?' has-xy':''}"><thead><tr><th>项目</th>`;
  DD.forEach(d=>{ html+=`<th>${d.lvl}<br><b>${d.gz}</b></th>`; });
  html+=`</tr></thead><tbody>`;
  const cellNayin=d=>`<span class="tip" onclick="showTip('__NAYIN__','${d.ny}')">${nayinColorSpan(d.ny)}</span>`;
  const cellTen=d=>`<span class="lab-gold">${d.tenGan}</span><span class="lab-gold">${d.tenZhi}</span>`;
  const cellYun=d=>{ if(!_A) return '无'; if(d.lvl==='大运') return `${d.full} 前五年${d.front}、后五年${d.back}`; if(d.lvl==='小运') return `本柱 ${d.full}`; if(d.actual==null) return `${d.full}`; return `${d.full} ${d.lvl==='流年'?('运年综合'+d.actual):('随运年'+d.actual)}`; };
  const cellSha=d=> d.sha.length? shaSpans(d.sha) : '无';
  html+=`<tr><td>纳音</td>${DD.map(d=>`<td>${cellNayin(d)}</td>`).join('')}</tr>`;
  html+=`<tr><td>十神</td>${DD.map(d=>`<td>${cellTen(d)}</td>`).join('')}</tr>`;
  html+=`<tr><td>十二长生</td>${DD.map(d=>`<td>${d.cs?`<span class="tip ${WX_CLASS[ZHI_WX[d.gz[1]]]||''}" onclick="showTip('${csKey(d.cs)}')">${d.cs}</span>`:'无'}</td>`).join('')}</tr>`;
  html+=`<tr><td>空亡</td>${DD.map(d=>`<td>${d.kong.join(' ')||'无'}</td>`).join('')}</tr>`;
  if(hasLn) html+=`<tr><td>犯太岁</td>${DD.map(d=> d.lvl==='流年' ? `<td>${d.ft&&d.ft.length?d.ft.map(stripParens).join('、'):'无'}</td>` : `<td>-</td>`).join('')}</tr>`;
  html+=`<tr><td>运势</td>${DD.map(d=>`<td>${cellYun(d)}</td>`).join('')}</tr>`;
  html+=`<tr><td>神煞</td>${DD.map(d=>`<td>${cellSha(d)}</td>`).join('')}</tr>`;
  html+=`<tr><td>整体倾向</td>${DD.map(d=>`<td><span class="tend">${d.tend}</span></td>`).join('')}</tr>`;
  html+=`</tbody></table></div>`;
  // 表2：与命局干支关系（行=命局四柱整柱，列=所选干支；格式同“所选干支间关系”）
  html+=`<h4 class="det-h">与命局干支关系</h4>`;
  const mingPillars=[
    {lab:'年柱', gz:BZ.gans[0]+BZ.zhis[0]},
    {lab:'月柱', gz:BZ.gans[1]+BZ.zhis[1]},
    {lab:'日柱', gz:BZ.gans[2]+BZ.zhis[2]},
    {lab:'时柱', gz:BZ.gans[3]+BZ.zhis[3]},
  ];
  html+=`<div class="yun-scroll"><table class="yun-tbl rel-matrix${xRow?' has-xy':''}"><thead><tr><th>命局</th>`;
  DD.forEach(d=>{ html+=`<th>${d.lvl}<br><b>${d.gz}</b></th>`; });
  html+=`</tr></thead><tbody>`;
  mingPillars.forEach(p=>{
    html+=`<tr><th>${p.lab}<br><b>${p.gz}</b></th>`;
    DD.forEach(d=>{ html+=`<td>${relHTML(p.gz, d.gz, p.lab, d.lvl)}</td>`; });
    html+=`</tr>`;
  });
  html+=`<tr><th>特殊</th>${DD.map(d=>{ const sp=relMingSpecial(d.gz, d.lvl); return `<td>${sp.length?sp.join(''):'无'}</td>`; }).join('')}</tr>`;
  html+=`</tbody></table></div>`;
  /* 小运已作展示列入上方两表（列序：大运、小运、流年、流月、流日），与所选干支各列同格同口径；
     不进层级栈，故岁运事件的力度档位与流派解读的层级叠加均不含小运。此处只留起法口径一行。 */
  if(xRow) html+=`<div class="sub-note">小运起于生时干支，顺逆与大运同向、每岁进一位，依《三命通会》；未起运之年无大运可依，即以小运论，故与流年同岁并见。</div>`;
  // 岁运并临说明（单独块，不混入表格）
  if(BZ.dyGZ && BZ.lnGZ && BZ.dyGZ===BZ.lnGZ){
    html+=`<div class="sk-block">岁运并临：大运 ${BZ.dyGZ} 与流年 ${BZ.lnGZ} 干支相同，传统谓之“岁运并临”，吉凶之象倍增，值此之年事体尤须审慎，宜结合用神喜忌细辨。</div>`;
  }
  // 岁运事件分析所需：重算大运序列与所选干支的运段评级、时间段（提前计算，供流年事件与流派解读共用）
  let yd=null, selMeta=[];
  if(_A){
    try{ const _dy=baziDaYunSteps(BZ); yd=baziYunDong(BZ,_A,_dy); }catch(e){ yd=null; }
    const _HIST = !(BZ.birthYear>0 && (new Date().getFullYear())-BZ.birthYear+1<=120);
    selMeta=sel.map(s=>{
      const m={};
      if(s.lvl==='大运'){
        const st=yd && yd.steps.find(x=>!x.empty && x.gz===s.gz);
        if(st){ m.period = _HIST ? '' : `${st.age}–${st.age+9}岁`; m.rating=st.rating; }
      } else {
        const ev=evalGZ(BZ,_A,{gz:s.gz,gan:s.gz[0],zhi:s.gz[1],age:0,year:BZ.curYear||0,kind:s.lvl});
        m.rating=ev.rating;
        if(s.lvl==='流年' && typeof BZ.curYear==='number'){ m.period = _HIST ? '' : `${BZ.curYear}年（${BZ.curYear-BZ.birthYear+1}岁）`; }
      }
      return m;
    });
  }
  // 所选干支间关系：矩阵（横轴＝纵轴＝大运、小运、流年、流月、流日；对角线为“-”占位，未选为“-”占位）
  {
    /* 小运随流年同岁并见，故与流年同进同出；未选流年时该列作“未选”占位 */
    const xySel=(BZ.xyGZ&&BZ.xyGZ.length>=2)?{lvl:'小运', gz:BZ.xyGZ}:null;
    const axes=['大运','小运','流年','流月','流日'];
    const slot = lvl => lvl==='小运' ? xySel : (sel.find(s=>s.lvl===lvl) || null);
    const cols = axes.map(slot);
    const n = axes.length;
    if(cols.filter(Boolean).length>=2){
      let head='<tr><th class="mx-corner">关系</th>';
      axes.forEach((lvl,i)=>{ const a=cols[i]; head += a? `<th>${a.lvl}<br><b>${a.gz}</b></th>` : `<th>${lvl}<br><span class="sub-note">未选</span></th>`; });
      head+='</tr>';
      let body='';
      for(let i=0;i<n;i++){
        const A=cols[i];
        body+=`<tr>`;
        body += A? `<th>${A.lvl}<br><b>${A.gz}</b></th>` : `<th>${axes[i]}<br><span class="sub-note">未选</span></th>`;
        for(let j=0;j<n;j++){
          if(i===j){ body+=`<td class="mx-diag">-</td>`; }
          else if(i<j){ // 上三角：与下三角对称冗余，用“-”占位
            body += (A&&cols[j])? `<td class="mx-mirror">-</td>` : `<td class="mx-none">-</td>`;
          }
          else { // 下三角 i>j：唯一保留的关系
            const B=cols[j];
            body += (A&&B)? `<td>${relHTML(A.gz,B.gz,A.lvl,B.lvl)}</td>` : `<td class="mx-none">-</td>`;
          }
        }
        body+=`</tr>`;
      }
      html+=`<h4 class="det-h">所选干支间关系</h4><table class="yun-tbl rel-matrix${xySel?' has-xy':''}"><thead>${head}</thead><tbody>${body}</tbody></table>`;
    }
  }
  // 流年事件已作为固定段（当前所处大运）置于“岁运引动”之后，详情面板不重复列出
  html+=buildSchoolsDeep(BZ, sel, selMeta);
  // 当前所选公历日期：紧跟历法说明段的 sub-note 行（updateDetail 入口更新）
  updateSelDateLine(BZ, sel);
  html+=`</div></div>`;
  box.innerHTML=gzAllColorSpan(html);
  box.setAttribute('data-path', curPath);
 }catch(e){
  box.innerHTML='<div class="mh-ref"><h4 class="det-h">所选干支详情</h4><div class="dyn-detail"><span class="notice">详情生成出错：'+((e&&e.message)?e.message:e)+'</span></div></div>';
 }
}



/* ==================== 五、五派解读（深度人生解读 / 综合判断） ==================== */


/* 各流派独立判喜忌：每派从自身方法论取喜用/忌神五行，不共用合成 xiWx/jiWx。
   数据源均来自 getAnalysis 已算好的结构化字段：格局用神 geUse.xiWx/jiWx、调候 tiao.wx、病药 bingYao、扶抑 fu.xiWx/jiWx。 */
function keWxOf(w){ for(const k in WX_KE){ if(WX_KE[k]===w) return k; } return null; }
function schoolXiJi(A, BZ){
  const dwx=GAN_WX[BZ.dayGan];
  const fuXiWx=(A.fu&&A.fu.xiWx)||[], fuJiWx=(A.fu&&A.fu.jiWx)||[];
  let geXi, geJi;
  if(A.geOuter||A.isZaGe){ geXi=A.synthesis.xiWxEff||A.xiWx||[]; geJi=A.synthesis.jiWxEff||A.jiWx||[]; }
  else {
    geXi=(A.geUse&&A.geUse.xiWx)||[]; geJi=(A.geUse&&A.geUse.jiWx)||[];
    if(!geXi.length) geXi=A.xiWx||[]; if(!geJi.length) geJi=A.jiWx||[];
  }
  const tiaoWx=A.tiao&&A.tiao.wx;
  const tiaoJi=tiaoWx?[keWxOf(tiaoWx)].filter(Boolean):[];
  const byXi=(A.bingYao&&A.bingYao.yao)?[A.bingYao.yao]:[];
  const byJi=(A.bingYao&&A.bingYao.bing)?[A.bingYao.bing]:[];
  return {
    ziping:{xi:geXi, ji:geJi},
    mang:{xi:fuXiWx, ji:fuJiWx},        // 盲派重实际得失，以能“做”到财官为纲 = 扶抑让日主得力
    tiao:{xi:tiaoWx?[tiaoWx]:[], ji:tiaoJi},
    xin:{xi:fuXiWx, ji:fuJiWx},         // 新派旺衰扶抑 = 扶抑
    bingyao:{xi:byXi, ji:byJi}
  };
}

/* ===== 各流派差异（命局），深度多角度 ===== */
function renderSchoolDiffInner(A, BZ){
  const dg=BZ.dayGan, dwx=GAN_WX[dg];
  const ss=ssCount(BZ.gans, BZ.zhis, dg), lq=ssLiuqin(ss);
  const strong=A.strength.indexOf('强')>=0, weak=A.strength.indexOf('弱')>=0;
  const seasonName={'寅':'春','卯':'春','辰':'春','巳':'夏','午':'夏','未':'夏','申':'秋','酉':'秋','戌':'秋','亥':'冬','子':'冬','丑':'冬'}[BZ.monthZ];
  const wxArr=['木','火','土','金','水'];
  const useTou=(A.synthesis&&A.synthesis.gan&&A.synthesis.gan.tou)||[];
  const useRoot=(A.synthesis&&A.synthesis.gan&&A.synthesis.gan.root)||[];
  const useStr=A.synthesis&&A.synthesis.primary?A.synthesis.primary.wx:'';
  // 五行能量分（peak/low 按能量分比值判定）
  const eScore = wxElementScore(BZ);
  const eTotal = wxArr.reduce((s,w)=>s+eScore[w],0) || 1;
  const eAvg = eTotal/5;
  const xiSetN = new Set(effXi(A)), jiSetN = new Set(effJi(A));
  const killWx=Object.keys(WX_KE).find(w=>WX_KE[w]===dwx);
  const wealthWx=WX_KE[dwx];
  const geQing=stripCat(A.geQing), geLevel=stripCat(A.geLevel), geLevelNote=stripCat(A.geLevelNote);
  const tiaoGrade=stripCat(A.tiao.grade);
  const fuXi=A.fu.xiCats||[], fuJi=A.fu.jiCats||[];
  const kongwang=stripCat(A.kongwang);
  const S=schoolXiJi(A, BZ); // 各流派独立喜忌

  // 子平格局派
  let ge=`本命以“${A.geName}”立格${A.geGanLabel}，格局清浊为“${geQing}”、层次“${geLevel}”${geLevelNote?'（'+geLevelNote.replace(/[。；]+$/,'')+'）':''}。`;
  if(useTou.length||useRoot.length) ge+=`首选用神为“${useStr}”${useTou.length?'天干透出（'+dedupChars(useTou)+'）':'天干未透'}${useRoot.length?'、地支得根（藏干'+dedupChars(useRoot)+'）':'、地支无根'}`+(useTou.length&&useRoot.length?'、用神得力':'、透干或得根尚欠一隅，须岁运补全方成格局之功')+'。';
  else ge+=`首选用神为“${useStr}”，天干不透、地支无根，须待岁运引出方成格局之功。`;
  if(A.specialStruct&&A.specialStruct.length) ge+=` 且命带特殊格局（${[...new Set(A.specialStruct.map(s=>s.name))].join('、')}），气机回环共振，成败系于用神是否被引动，吉凶倍显。`;
  if(A.geSha&&A.geSha.length) ge+=` 神煞辅格：${A.geSha.map(s=>s.sha+'（'+s.zhi+'）'+s.eff).join('；')}。`;
  ge+=` 子平之法“八字用神专求月令”，成败全在月令用神是否清纯、有无冲破损伤。`;
  ge+=` 本派（格局为体）喜 ${S.ziping.xi.join('、')||'无'}、忌 ${S.ziping.ji.join('、')||'无'}：成格顺用、破格则须制化救应。`;

  // 盲派
  const caiTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='正财'||t==='偏财';});
  const guanTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='正官'||t==='七杀';});
  const dayZhiShen=tenGod(dg, zhiMain(BZ.dayZ));
  const fuXiStr=fuXi.join('、');
  let mang=`盲派重“做功”与实际得失，轻格局名目。日主${A.strength}，${strong?'本身有担财官之力，宜看财官是否被我“做”到，即能否合化引财、冲克得用':'本身偏弱，须借'+fuXiStr+'扶身方能“做功”'}。`;
  mang+=` 财星属${wealthWx}（命局${lq['财星']||0}个${caiTou.length?'、天干透'+dedupChars(caiTou)+'，财气外露、来得快去得也快':'、天干不透则'+(BZ.zhis.indexOf(({'木':'未','火':'戌','金':'丑','水':'辰','土':'戌'}[wealthWx]||''))>=0?'财藏库中':'财藏支中')+'待岁运引出'}），官杀属${killWx}（${lq['官杀']||0}个${guanTou.length?'、天干透'+dedupChars(guanTou)+'，事业压力或名望外显':'、天干不透'}）。`;
  mang+=` 夫妻宫（日支${BZ.dayZ}）本气为“${dayZhiShen}”${(godClass(dayZhiShen)==='财星'||godClass(dayZhiShen)==='官杀')?'，宫星同位，婚姻与事业互为依托、得内助之力':'，非财官本位，财官须向外寻（看月令与透干）'}。`;
  if(A.structDisease&&A.structDisease.length){ const bing=A.structDisease.filter(d=>d.kind==='病'); if(bing.length){ const yao=A.structDisease.filter(d=>d.kind==='药'); mang+=` 本局有结构病：${bing.map(d=>d.rel+(d.count>=2?'×'+d.count:'')).join('、')}；干支冲刑害破若伤及日主根基或用神之根，则“做功”被破、得而复失；宜见结构药：${yao.map(d=>d.rel+(d.count>=2?'×'+d.count:'')).join('、')||'无'}，制化方成。`; } }
  mang+=` 盲派看“制化”，财官再旺，能制能化、为我所用，才是真富贵。`;
  mang+=` 本派喜 ${S.mang.xi.join('、')||'无'}、忌 ${S.mang.ji.join('、')||'无'}：能扶身“做功”、制化财官者为喜，反之为忌。`;

  // 调候派
  const tiaoZhiGan=A.tiao.zhiGan||[];
  const tiaoTou=BZ.gans.filter(g=>tiaoZhiGan.indexOf(g)>=0);
  const tiaoRoot=BZ.zhis.filter(z=>{const h=HIDE[z]||[];return h.some(x=>tiaoZhiGan.indexOf(x)>=0);});
  let tiao=`${seasonName}生人，${tiaoGrade.indexOf('尚均')>=0?'寒暖燥湿尚均':'寒暖燥湿以“'+tiaoGrade+'”为急'}。调候用神为 ${A.tiao.wx}（具体用 ${tiaoZhiGan.join('、')||A.tiao.wx}）：${A.tiao.d}`;
  let tiaoState=[];
  if(tiaoTou.length) tiaoState.push('天干透出（'+dedupChars(tiaoTou)+'）');
  if(tiaoRoot.length) tiaoState.push('地支有根（'+dedupChars(tiaoRoot)+'）');
  if(!tiaoTou.length && !tiaoRoot.length) tiaoState.push('天干地支皆无根、虚浮待引');
  tiao+=` 调候药${tiaoState.join('、')}${A.tiao.zhen?'；'+A.tiao.zhen:''}。`;
  if(A.tiao.conflict) tiao+=' 调候用神虽利气候之需，却与扶抑喜忌相左，二者相牵，须借岁运通关调和、不可执一。';
  tiao+=` 调候派先调候后论扶抑，局暖则寒木逢春、局润则燥金得清水之益，调候一透，全局皆活。`;
  tiao+=` 本派喜 ${S.tiao.xi.join('、')||'无'}（调候用神）、忌 ${S.tiao.ji.join('、')||'无'}（反调候、寒暖燥湿之偏${S.tiao.ji.indexOf('水')>=0?'；癸水为调候润局之水、不在此忌':''}）：调候一透则全局皆活，调候受伤则诸法皆滞。`;

  // 新派
  let xin=`新派以日主旺衰为纲，本命旺衰评分 ${A.score.toFixed(1)}，${A.strength}。三得：得令${A.sanDe.ling?'✓（月令'+BZ.monthZ+'助日主）':'✗（月令不助）'}、得地 ${A.sanDe.di}、得势 ${A.sanDe.shi}。`;
  xin+=` 五行能量分 ${wxArr.map(w=>w+Math.round(eScore[w])).join('、')}，`;
  const eSorted=[...wxArr].sort((a,b)=>eScore[b]-eScore[a]);
  const ePeak=eSorted[0], eLow=eSorted[4];
  const eLowZero=eScore[eLow] < 1e-6;                                  // 最弱五行能量为 0（不现）：倍数无意义，改"不现"表述
  const eRatio=eLowZero ? 0 : eScore[ePeak]/eScore[eLow];
  if((eRatio>=2 || eLowZero) && eScore[ePeak]>=WX_TIER_HI*eAvg){
    const tag = S.xin.ji.indexOf(ePeak)>=0 ? '为忌神，忌神猖獗、全局失衡在此，须重抑之' : (S.xin.xi.indexOf(ePeak)>=0 ? '为喜用，喜用得力、格局偏厚，宜顺其势' : '偏出一头，五行略有倾斜');
    const ratioTxt = eLowZero ? `，最弱 ${eLow}（0 分）不现、独旺尤甚` : `，约为最弱 ${eLow}（${Math.round(eScore[eLow])}）之 ${eRatio.toFixed(1)} 倍`;
    xin+=`以 ${ePeak} 独旺成势（能量分 ${Math.round(eScore[ePeak])}）${ratioTxt}，而 ${ePeak} ${tag}，仍当以中和求平、旺则抑弱则扶。`;
  } else {
    xin+='五行分布相对均衡，仍以中和求平、旺则抑弱则扶。';
  }
  xin+=` 扶抑用神喜 ${fuXi.join('、')}、忌 ${fuJi.join('、')}；新派重百神论与空亡（空亡：${kongwang||'无'}），以量化平衡求中和。`;

  // 病药派（外格/变格 bingYao.bing 为 null 时，走"不取五行制衡"口径，禁输出 null）
  let bing = A.bingYao.bing
    ? `《滴天髓》“有病方为贵，无伤不是奇”：本命以“${A.bingYao.bing}”为病、“${A.bingYao.yao}”为药。病即忌神之过旺者（${A.bingYao.bing}${A.bingYao.bingCnt?'，命局'+A.bingYao.bingCnt+'处':''}），以“${A.bingYao.yao}”制其锋（${A.bingYao.yaoKind}）；制衡得用，病去局安。`
    : `《滴天髓》“有病方为贵，无伤不是奇”：本命为${A.geName}，${A.bingYao.yaoKind||'一气成势、病药法不取五行制衡'}（日主偏枯立论不适用），以结构病药与五行缺衡为凭；见下。`;
  if(A.structDisease&&A.structDisease.length){ const bingD=A.structDisease.filter(d=>d.kind==='病'), yaoD=A.structDisease.filter(d=>d.kind==='药'); if(bingD.length) bing+=` 结构层面病在 ${bingD.map(d=>d.rel+(d.count>=2?'×'+d.count:'')).join('、')}、药在 ${yaoD.map(d=>d.rel+(d.count>=2?'×'+d.count:'')).join('、')||'无'}，岁运逢病之字或其六冲、会聚成局则病发，逢药则得力。`; }
  if(A.specialStruct&&A.specialStruct.length) bing+=` 又本局格局特殊（${[...new Set(A.specialStruct.map(s=>s.name))].join('、')}），气机回环共振，病药被放大，宜专一制化。`;
  const lackWx=wxArr.filter(w=>eScore[w] < 1e-6);
  if(lackWx.length){
    const xiLack=lackWx.filter(w=>S.bingyao.xi.indexOf(w)>=0);
    const jiLack=lackWx.filter(w=>S.bingyao.ji.indexOf(w)>=0);
    const neuLack=lackWx.filter(w=>S.bingyao.xi.indexOf(w)<0&&S.bingyao.ji.indexOf(w)<0);
    let s='五行缺'+lackWx.join('、');
    if(xiLack.length) s+=`，${xiLack.join('、')}为喜用却不现，偏枯之位即病之所在，宜制化、宜补其受损一方`;
    if(jiLack.length) s+=`，${jiLack.join('、')}为忌神而不现，反是去病之象、忌神无力为害`;
    if(neuLack.length) s+=`，${neuLack.join('、')}不现属中性偏枯，影响尚轻`;
    bing+=` ${s}；务使五行归于中和，则病去局安、命局乃贵。`;
  } else {
    bing+=` 五行不缺，偏枯较轻；务使五行归于中和，则病去局安、命局乃贵。`;
  }
  bing+= A.bingYao.bing
    ? ` 本派喜 ${S.bingyao.xi.join('、')||'无'}（药）、忌 ${S.bingyao.ji.join('、')||'无'}（病）：有病方贵，制病之药即为喜用。`
    : ` 本派喜 ${S.bingyao.xi.join('、')||'无'}（药）、忌 ${S.bingyao.ji.join('、')||'无'}（病）：外格一气成势、无偏枯之病，病药派此局不立论，以结构病药为凭。`;

  // 交叉结论
  let cross='';
  if(A.synthesis&&A.synthesis.primary){
    cross+=`首选用神为“${A.synthesis.primary.wx}”得 ${A.synthesis.primary.methods.join('、')} 共识（${A.synthesis.primary.count} 法），宜在此着力。`;
    if(A.synthesis.secondary) cross+=` 次选为“${A.synthesis.secondary.wx}”（${A.synthesis.secondary.methods.join('、')}）${A.synthesis.secondary.isJi?'，与扶抑喜用相左、须权衡轻重':''}。`;
    if(A.synthesis.conflicts.length) cross+=` 调候、格局与扶抑之冲突在 ${A.synthesis.conflicts.map(c=>c.wx).join('、')}：岁运逢之，用神与调候相牵，进退休咎须看何者为急。`;
    else cross+=' 诸法无明显冲突，主次分明、同向可用，得力最易。';
    // 岁运宜忌指引取 advice 的"岁运宜见/忌见"部分；"⚠X兼具调候格局之用"冲突句已在喜用格局，综合用神段输出，此处不重复
    cross+=' '+((A.synthesis.advice||'').split('；⚠')[0]);
  }

  return `<div class="an-pai">
    <div class="an-p"><span class="lab-gold">子平格局派</span>：${ge}</div>
    <div class="an-p"><span class="lab-gold">盲派</span>：${mang}</div>
    <div class="an-p"><span class="lab-gold">调候派</span>：${tiao}</div>
    <div class="an-p"><span class="lab-gold">新派（民国）</span>：${xin}</div>
    <div class="an-p an-full"><span class="lab-gold">病药派（滴天髓中和）</span>：${bing}</div>
    <div class="an-p an-cross an-full"><span class="lab-gold">共识与分歧</span>：${cross||'五法用神暂无明确共识，宜就原局细节斟酌。'}</div>
  </div>`;
}
function renderLifeDeep(BZ){
  const PALACE=['年','月','日','时'];
  const dg=BZ.dayGan, dwx=GAN_WX[dg];
  const A=getAnalysis(BZ);
  const ss=ssCount(BZ.gans, BZ.zhis, dg), lq=ssLiuqin(ss);
  const spouse=spouseStarOf(BZ);
  const strong=A.strength.indexOf('强')>=0, weak=A.strength.indexOf('弱')>=0;
  const wxArr=['木','火','土','金','水'];
  // 五行能量分（按能量分判定缺/旺，并结合喜忌）
  const eScore = wxElementScore(BZ);
  const eTotal = wxArr.reduce((s,w)=>s+eScore[w],0) || 1;
  const eAvg = eTotal/5;
  const shangWx=WX_SHENG[dwx], wealthWx=WX_KE[dwx];
  const yinWx=Object.keys(WX_SHENG).find(w=>WX_SHENG[w]===dwx)||'';
  const killWx=Object.keys(WX_KE).find(w=>WX_KE[w]===dwx)||'';
  const isMale=(BZ.sex===1||BZ.sex===true);
  const organs={木:'肝胆',火:'心小肠',土:'脾胃',金:'肺大肠',水:'肾膀胱'};
  const shaAll=(BZ.shaYear||[]).concat(BZ.shaMonth||[],BZ.shaDay||[],BZ.shaTime||[]);
  const normSha=s=>(s||'').replace(/（[^）]+）$/,'');
  const shaNames=(...ns)=>ns.filter(n=>shaAll.some(x=>normSha(x)===n));
  const fuXi=effXi(A)||[], fuJi=effJi(A)||[];
  // 有效喜忌的十神类名（供"喜用养护/旺运引动"等文案）：synthesis.xiCatsEff 已编译（带标注），回落用五行→十神类名
  const catOfWxName=wx=>{ const dw=GAN_WX[dg]; if(!dw) return wx;
    if(wx===dw) return '比劫'; if(WX_SHENG[dw]===wx) return '食伤';
    if(WX_KE[dw]===wx) return '财星'; if(WX_SHENG[wx]===dw) return '印星';
    if(WX_KE[wx]===dw) return '官杀'; return wx; };
  const effXiCats=(A.synthesis&&A.synthesis.xiCatsEff&&A.synthesis.xiCatsEff.length)?A.synthesis.xiCatsEff:(fuXi.map(catOfWxName).filter(Boolean));
  const fuXiStr=effXiCats.join('、');
  // 喜用五行（与 十神名 fuXi 区分：FANG/organs/A.cnt 均按五行索引）
  const xiWxSet=effXi(A), jiWxSet=effJi(A);
  const caiTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='正财'||t==='偏财';});
  const guanTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='正官'||t==='七杀';});
  const yinTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='正印'||t==='偏印';});
  const shangTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='食神'||t==='伤官';});
  const biTou=BZ.gans.filter((g,i)=>{if(i===2) return false; const t=tenGod(dg,g);return t==='比肩'||t==='劫财';});
  const spouseNote=godClass(spouse)==='财星'?'夫妻宫坐财，婚姻亦助财':godClass(spouse)==='官杀'?'夫妻宫坐官，配偶助力事业':'';
  function shaSeg(area){
    const seen=new Set(), hit=[];
    shaAll.forEach(s=>{ if(seen.has(s)) return; seen.add(s); const m=SHA_MEAN[s]; if(m&&m[area]) hit.push(s+'（'+m[area]+'）'); });
    let t=hit.length?('神煞：'+hit.join('；')+'。'):'神煞：本局无显著相关神煞。';
    return t;
  }
  // ===== 事业财运：表驱动、查表输出（渲染见 bazi.html 的 renderCareer7）=====
  const career = (window.renderCareer||renderCareer)(BZ);

  // ===== 婚姻感情：渲染交由 bazi.html 的 renderMarry7，与事业财运同构、独立模块 =====
  const marry=(window.renderMarry||renderMarry)(BZ);

  // ===== 局部打分工具（与 career/marry 同构）=====
  function M(v,p){ return {v:v,p:p}; }
  function potLevel(obj){
    let hit=0, part=0, total=0;
    Object.keys(obj).forEach(k=>{
      if(k==='大运流年引动'||k==='神煞助') return;
      total++;
      const v=obj[k].v;
      if(v==='hit') hit++;
      else if(v==='part') part++;
    });
    if(total>0 && hit>=3) return '高';
    if(hit>=2 || (hit>=1&&part>=1)) return '中';
    if(hit>=1) return '低';
    return '待运';
  }
  const RANK={'高':3,'中':2,'低':1,'待运':0};
  const genRoot=BZ.zhis.filter(z=>ZHI_WX[z]===dwx).length;
  const genTou=biTou.length;
  const xiScore=xiWxSet.reduce((s,w)=>s+(eScore[w]||0),0);
  const dayNayinWx=(NAYIN_INFO[nayinOf(BZ.gans[2]+BZ.zhis[2])]||{}).wx||'';
  const dayCs=[getChangSheng(dg,BZ.zhis[0]),getChangSheng(dg,BZ.zhis[1]),getChangSheng(dg,BZ.zhis[2]),getChangSheng(dg,BZ.zhis[3])];
  // 纳音 vs 日主关系标签（relShort 返回'生日主/克日主/日主所生/日主所克/比和'，与 NAYIN_REL_MEAN key 同口径）
  const relNote=w=>{ const r=relShort(dwx,w); return r?('（'+r+'）'):''; };
  // 十神细向工具（与 career §2 同深度：个数，透藏位置，旺弱，有根，两两作用，流转）
  function catTouN(cat){
    return cat==='官杀'?guanTou.length:cat==='食伤'?shangTou.length:cat==='印星'?yinTou.length:cat==='财星'?caiTou.length:cat==='比劫'?biTou.length:0;
  }
  function catTouChars(cat){
    const a=cat==='官杀'?guanTou:cat==='食伤'?shangTou:cat==='印星'?yinTou:cat==='财星'?caiTou:cat==='比劫'?biTou:[];
    return a.join('');
  }
  function godPos(cat){
    const total=(lq[cat]||0), tou=catTouN(cat), cang=total-tou;
    if(total===0) return '不现（命局无此十神）';
    if(tou>0&&cang>0) return '天干透'+catTouChars(cat)+'、地支亦藏（力量厚实）';
    if(tou>0) return '天干透'+catTouChars(cat)+'（力量外显）';
    return '藏支（力量偏暗、待岁运引出）';
  }
  const CS_STRONG=['长生','冠带','临官','帝旺'], CS_WEAK=['病','死','墓','绝'];
  const csWangDi = t => t==='帝旺' ? '帝旺之地' : t+'旺地';   // 帝旺已含“旺”，不可再接“旺地”拼出“旺旺”
  function fangUniq(list){
    const s=new Set();
    (list||[]).forEach(f=>{ const body=f.replace(/^[木火土金水]/,''); body.split('、').forEach(x=>{ if(x) s.add(x); }); });
    return [...s].join('、');
  }
  // 十神流转：印护身、身泄食伤、食伤生财、财生官杀、官杀生印，五环相生方成生生不息之环（仅列命局实有之环）
  function fiveRing(){
    const pres={'印星':(lq['印星']||0)>0,'食伤':(lq['食伤']||0)>0,'财星':(lq['财星']||0)>0,'官杀':(lq['官杀']||0)>0};
    const links=[];
    if(pres['印星']) links.push('印护身');
    if(pres['食伤']) links.push('身泄食伤');
    if(pres['食伤']&&pres['财星']) links.push('食伤生财');
    if(pres['财星']&&pres['官杀']) links.push('财生官杀');
    if(pres['官杀']&&pres['印星']) links.push('官杀生印');
    const missName={'印星':'印','食伤':'食伤','财星':'财','官杀':'官杀'};
    const missCats=['印星','食伤','财星','官杀'].filter(c=>!pres[c]).map(c=>missName[c]);
    const flowStr='十神流转：'+(links.length?links.join('、'):'各神未成流通之链')+'。';
    let hJudge, fJudge;
    if(missCats.length===0){ hJudge='五环俱通、成环完整，身心能量生生不息、有出处而不郁积。'; fJudge='五环俱通、成环完整，亲情与子女缘流通顺畅、家运不枯。'; }
    else if(missCats.length===1){ hJudge='五环中缺'+missCats.join('、')+'一环，能量至缺处稍滞、余环仍通，岁运补足即畅。'; fJudge='五环中缺'+missCats.join('、')+'一环，亲情或子女缘在某处稍滞、余环仍通，岁运补足即畅。'; }
    else if(missCats.length===2){ hJudge='缺'+missCats.join('、')+'两环，流转已有阻断，须岁运引动方畅。'; fJudge='缺'+missCats.join('、')+'两环，亲情或子女缘已有阻断，须岁运引动方畅。'; }
    else { hJudge='各神散见、未成链，能量无所归、易郁滞。'; fJudge='各神散见、未成链，亲情难流通、家运易枯。'; }
    return {links,missCats,flowStr,hJudge,fJudge};
  }
  const fr=fiveRing();
  // 十神能量分（与 eScore 同源，残差校正后十神能量和=五行能量分；日主不计），供"旺/厚/过旺"判定，严禁用个数
  const tenE=ssTenGodEnergy(BZ, eScore);
  const eCats={ '官杀':(tenE['正官']||0)+(tenE['七杀']||0), '印星':(tenE['正印']||0)+(tenE['偏印']||0), '食伤':(tenE['食神']||0)+(tenE['伤官']||0), '财星':(tenE['正财']||0)+(tenE['偏财']||0), '比劫':(tenE['比肩']||0)+(tenE['劫财']||0) };
  const _eTot=Object.values(eCats).reduce((a,b)=>a+b,0)||1;
  const ePct=cat=>Math.round((eCats[cat]||0)/_eTot*100);

  const ctx = { PALACE, dg, dwx, A, ss, lq, spouse, strong, weak, wxArr, eScore, eTotal, eAvg, tenE, eCats, ePct, shangWx, wealthWx, yinWx, killWx, isMale, organs, shaAll, normSha, shaNames, fuXi, fuJi, fuXiStr, xiWxSet, jiWxSet, caiTou, guanTou, yinTou, shangTou, biTou, spouseNote, shaSeg, career, marry, M, potLevel, RANK, FANG, genRoot, genTou, xiScore, dayNayinWx, dayCs, relNote, catTouN, catTouChars, godPos, CS_STRONG, CS_WEAK, csWangDi, fangUniq, fiveRing, fr };
  const health = renderHealthCard(BZ, ctx);
  const fam = renderFamilyCard(BZ, ctx);

  /* 本命分析四大模块为原局禀赋解读，不随年龄变化，故不做任何年龄门控（不 drop/replace 主体内容）。
     年龄信息仅以补充说明（sub-note）形式附加、提示当前年龄段即可；真正的年龄门控在运势分析（大运/流年/流月）里做。 */
  // 现年仅当出生年落在合理区间（当前年往前 120 年内）才给出；
  // 否则为历史名人/古代盘，现年无意义，禁用"现年X岁"话术。
  const NOW_YEAR = new Date().getFullYear();
  const nowAge = (BZ.birthYear>0 && NOW_YEAR-BZ.birthYear+1<=120) ? (NOW_YEAR-BZ.birthYear+1) : null;
  const adaptSec=(area,arr)=>{
    const note=baziAgeCardNote(area, nowAge);
    // 仅附年龄补充说明，绝不改主体内容（本命四大模块是原局禀赋解读，不随年龄变化）
    const body=(arr||[]);
    return note?[`<span class="sub-note">${note}</span>`].concat(body):body;
  };
  const cardT=t=>t;
  const career2=adaptSec('事业财运', career);
  const marry2 =adaptSec('婚姻感情', marry);
  const health2=adaptSec('性格健康', health);
  const fam2   =adaptSec('家庭子女', fam);

  const card=(t,paras)=>`<div class="life-card"><h5>${t}</h5><p>${paras.filter(Boolean).join('<br>')}</p></div>`;
  return `${card(cardT('事业财运'),career2)}
    ${card(cardT('婚姻感情'),marry2)}
    ${card('性格健康',health2)}
    ${card(cardT('家庭子女'),fam2)}`;
}
/* 核心解读：命局断事 / 称骨 / 十神定位 与 事业财运，婚姻感情，性格健康，家庭子女 */

function renderHealthCard(BZ, ctx){
  const { PALACE, dg, dwx, A, ss, lq, spouse, strong, weak, wxArr, eScore, eTotal, eAvg, tenE, eCats, ePct, shangWx, wealthWx, yinWx, killWx, isMale, organs, shaAll, normSha, shaNames, fuXi, fuJi, fuXiStr, xiWxSet, jiWxSet, caiTou, guanTou, yinTou, shangTou, biTou, spouseNote, shaSeg, career, marry, M, potLevel, RANK, FANG, genRoot, genTou, xiScore, dayNayinWx, dayCs, relNote, catTouN, catTouChars, godPos, CS_STRONG, CS_WEAK, csWangDi, fangUniq, fiveRing, fr } = ctx;
  // ===== 性格健康：七节框架（与 事业财运，婚姻感情 同构）=====
  const lackWx=wxArr.filter(w=>eScore[w] < 1e-6);
  const xiLack=lackWx.filter(w=>xiWxSet.includes(w));
  const jiLack=lackWx.filter(w=>jiWxSet.includes(w));
  const neuLack=lackWx.filter(w=>!xiWxSet.includes(w)&&!jiWxSet.includes(w));
  // 真缺 vs 弱受损：干支里完全没有该五行字 = 真缺；有字而能量低 = 弱/受损（非缺）。统一口径，避免“木在支中两次却称缺”之误。
  const _wxInPillar=wx=>BZ.gans.some(g=>GAN_WX[g]===wx)||BZ.zhis.some(z=>ZHI_WX[z]===wx);
  // 十干性情：读顶层真源 GAN_NATURE（bazi-data.js，十干象+阴阳+性情，《滴天髓·天干论》），禁另建同义表
  const gn=(window.GAN_NATURE||{})[dg]||{};
  const ganXingTxt=gn.xing||'无';
  const zhiXing={子:'机敏多动',丑:'沉稳内敛',寅:'积极开拓',卯:'细腻善思',辰:'多面善变',巳:'热情外显',午:'刚烈直率',未:'温和包容',申:'聪慧机变',酉:'精致追求完美',戌:'忠诚坚毅',亥:'浪漫随性'};
  const hOrg=wx=>organs[wx]||'';
  // 1 本命基调（性格合成：日主之性 + 身旺衰 + 格局气象 + 调候寒暖，四者相参，避免纯十神罗列；以连贯叙述呈现，更近个案而非模板）
  const isZiHour = BZ.zhis[3]==='子';
  const shenWang = strong?`身强则本元充固、精力可承，性格外显而主观决断，然气盛易亢，行事宜谦和疏泄、避刚愎耗散`
    : weak?`身弱则本元偏薄、易感疲弱，性格内敛而随顺圆融，宜养独立主见、避优柔过耗`
    : `中和则本元平实、性情平稳、刚柔相济，能适应多数环境，顺时调养即可`;
  // 格局气象合成（geQing 本身可能含括号，先去其内括号，避免嵌套全角括号）
  const geQingClean = A.geQing ? A.geQing.replace(/（.*?）/g,'') : '';
  const geBasis = A.geName ? (geQingClean ? `${A.geName}（${geQingClean}）` : A.geName) : '';
  const geTxt = geBasis ? `格局入${geBasis}，其气象濡染气质，格之清浊层次亦映于心性` : '';
  // 调候寒暖合成（性情解读按实际寒暖燥湿关键词动态给出，禁固定括号套话）
  const tiaoBasis = (A.tiao && A.tiao.grade) ? A.tiao.grade.replace(/（.*?）/g,'') : '';
  const _tiaoXing = (tiaoBasis.indexOf('寒')>=0 && tiaoBasis.indexOf('湿')>=0) ? '性偏内敛沉静、湿气黏滞，宜暖燥疏展'
    : tiaoBasis.indexOf('寒')>=0 ? '性偏内敛沉静、思虑深藏，宜暖局疏展'
    : tiaoBasis.indexOf('热')>=0 ? '性偏外显急切、热情易亢，宜凉润沉降'
    : tiaoBasis.indexOf('燥')>=0 ? '性偏刚急浮躁、心少润泽，宜润养静定'
    : tiaoBasis.indexOf('湿')>=0 ? '性偏内敛黏滞、思虑偏重，宜燥疏畅达'
    : '';
  const tiaoTxt = (tiaoBasis && tiaoBasis!=='寒暖燥湿尚均') ? `局气${tiaoBasis}，${_tiaoXing||'寒暖燥湿塑其性情'}` : '';
  // 连贯画像：以日主为中枢，串起身旺衰、格局、调候，收束为一句个案叙述（更象人、非模板罗列）
  let sH1 = xiJiBasis(dg,dwx,fuXi,fuJi)+(gn.yy?('为'+gn.yy+'干，象'+(gn.xiang||'')+'，'):'')+ganXingTxt+'，'+shenWang;
  if(geTxt) sH1 += `；${geTxt}`;
  if(tiaoTxt) sH1 += `；${tiaoTxt}`;
  const portraitClose = strong?`总体而言，日主自身气场强、有主张，也需学会示弱以养和`
    : weak?`总体而言，日主心思细、善周旋，也需立定主见以免随波`
    : `总体而言，日主性情匀停、能收能放、与环境相安`;
  sH1 += `。${portraitClose}。`;
  // 晚子时、时辰边界 宫位敏感性提示（日柱=日主之基，恰处子时则随校正而变）
  if(isZiHour) sH1 += `另：出生在子时（23:00至01:00），日柱（日主之基）处早晚子时约定与真太阳时校正之敏感边界，若时刻临近 0 点，日柱或前后两日变动，建议核对真太阳时后再定盘，日主与全局之判定以校正后为准。`;
  // 2 十神关系（身心）细向：个数，透藏位置，旺弱，有根，两两作用，流转
  const hGodOrder=['官杀','食伤','印星','财星'];
  const hGodWx={'官杀':killWx,'食伤':shangWx,'印星':yinWx,'财星':wealthWx};
  // 十神解读必须先判该神五行属喜用还是忌神：喜用而旺→正面（得力可倚），忌神而旺→负面（克耗泄身）。
  // 喜忌标签统一在主句（"X属Y，命局N个、位置，能量档，为喜用/为忌神/与喜忌无涉"），note 只留内容、去标签前缀
  const hNoteFn=(cat,str,isXi,isJi)=>{
    if(isXi) return ({ // 喜用：正面（性格健康维度，勿用事业财运措辞）
      '官杀':'自律有度、责任担当之性厚，处事有章法，宜以规则自立、担当而不躁',
      '食伤':'泄秀得宜，才思敏慧、善表达，心性灵动外显，宜以才情涵养、外显而不浮',
      '印星':'文星得力，好思善学、有学养，得长辈荫助，宜涵养心性、蓄养根基',
      '财星':'根气丰沛，务实重行、心性安稳不空想，宜以实干立心、忌好高骛远'
    })[cat]||'';
    if(isJi) return ({ // 忌神：负面（克耗泄身）
      '官杀':'克身太过，压力紧绷、易焦虑失眠，须强力疏解',
      '食伤':'泄身太过，思虑耗神、易躁易疲，宜静养涵神',
      '印星':'思多郁滞、易依赖，动静失衡，宜主动外拓',
      '财星':'劳心于财、得失挂怀过甚，宜知止'
    })[cat]||'';
    return (str==='平和' // 与喜忌无涉：平和/偏旺中性描述（禁套忌神负面词）
      ? ({ '官杀':'压力平和、自律有度，身心少扰','食伤':'表达有度、才华内敛，身心少耗','印星':'思学有靠、护养得宜，身心安稳','财星':'务实有节、不偏不倚' })[cat]||''
      : ({ '官杀':'压力与担当并存，宜张弛有度','食伤':'思虑外发，宜疏泄有度','印星':'思学偏重，宜动静相济','财星':'务实重利，宜知足常乐' })[cat]||'');
  };
  const hGodItems=[];
  hGodOrder.forEach(cat=>{
    const total=(lq[cat]||0); if(total===0) return;
    // 旺衰档按五行能量分（相对均值，与量化四柱同源）：能量分>HI×均值=过旺、>LO×均值=偏旺、否则平和。
    // 不可按十神个数判旺衰，余气藏干堆个数≠真能量（印星水两个藏干但能量占比极低时不算"偏旺"）。
    const wx=hGodWx[cat]||''; const e=(wx&&eScore[wx])||0;
    const str= (e>WX_TIER_HI*eAvg)?'过旺' : (e>WX_TIER_LO*eAvg)?'偏旺' : '平和';
    const _hXi=xiWxSet.includes(wx), _hJi=jiWxSet.includes(wx);
    const _hXJ=_hXi?'为<span class="tip sha-ji">喜用</span>':_hJi?'为<span class="tip sha-xiong">忌神</span>':'与喜忌无涉';
    // note 后补"透藏落宫转译"（透哪柱→卡主题含义；无透按藏支），打破固定模板句的盘间雷同
    const _luo=tenLuoGong({BZ, wxOf:hGodWx, lq}, cat, 'health');
    hGodItems.push(cat+'属'+(hGodWx[cat]||'')+'，命局'+total+'个、'+godPos(cat)+'，'+str+'，'+_hXJ+'。'+hNoteFn(cat,str,_hXi,_hJi)+(_luo?(''+_luo+'。'):''));
  });
  // 健康两两作用（顶层统一判定 REL.tenCombo 命中关系 → 健康主题句；与事业/十神宫位同一喜忌裁决，避免口径分叉）
  const _tCtxH=(typeof REL!=='undefined'&&REL.tenCombo&&REL.tenCombo.buildCtx)?REL.tenCombo.buildCtx(BZ):null;
  const _tHitsH=_tCtxH?REL.tenCombo.matchAll(_tCtxH):[];
  const _negSayH=s=>/为忌|忌神|破财|克身|受损|祸患|夺食|压力|虚浮|难成/.test(s||'');
  const hPair=SHISHEN.namesOf('health').map(n=>{
    const h=_tHitsH.find(x=>x.name===n); if(!h) return '';
    return SHISHEN.pick(n,'health',_negSayH(h.say));
  }).filter(Boolean);
  let hFlow=fr.flowStr+fr.hJudge;
  {
    const gkOver=(lq['官杀']||0)>0 && (lq['印星']||0)===0 && ePct('官杀')>=REL.TH.PCT_OVER;   // 官杀能量占比≥25% 且无印化 才算"过旺无制"
    const shAlone=(lq['印星']||0)===0 && ePct('食伤')>=REL.TH.PCT_VSTRONG;                       // 食伤能量占比≥20% 才算"独泄"
    if(gkOver && jiWxSet.includes(killWx)) hFlow+='官杀过旺而<span class="tip sha-xiong">为忌</span>、无印化，压力直克日主，身心最易紧绷，须外力疏解。';
    else if(gkOver && xiWxSet.includes(killWx)) hFlow+='官杀<span class="tip sha-ji">为喜用</span>而旺、无印化亦无妨，制比劫护身得力，宜借势任事。';
    if(shAlone && jiWxSet.includes(shangWx)) hFlow+='印星不显、食伤独泄而<span class="tip sha-xiong">为忌</span>，精气易耗散，宜培本固元。';
    else if(shAlone && xiWxSet.includes(shangWx)) hFlow+='印星不显、食伤独旺<span class="tip sha-ji">为喜用</span>，泄秀得宜、才思外显，宜施展所长。';
  }
  let sH2;
  {
    let idx=0; const parts=[];
    hGodItems.forEach(t=>{ parts.push('①②③④⑤'[idx]+' '+t); idx++; });
    if(hPair.length){ parts.push('①②③④⑤⑥'[idx]+' 两两作用：'+hPair.join('')); idx++; }
    parts.push('①②③④⑤⑥⑦'[idx]+' '+hFlow);
    sH2 = hGodItems.length ? parts.join('<br>') : '十神分布无单项过旺，性格与身心负担相对均衡，不易因某一十神偏激而生身心之累。';
  }
  // 3 神煞、纳音与十二长生
  const yN=nayinOf(BZ.gans[0]+BZ.zhis[0]), dN=nayinOf(BZ.gans[2]+BZ.zhis[2]);
  let sH3='① '+shaSeg('health');
  sH3+='<br>② 纳音：年命'+nayinColorSpan(yN)+relNote((NAYIN_INFO[yN]||{}).wx)+'，'+(((NAYIN_REL_MEAN[relShort(dwx,(NAYIN_INFO[yN]||{}).wx)]||{}).health)||'')+'；日柱'+nayinColorSpan(dN)+relNote(dayNayinWx)+'，'+(((NAYIN_REL_MEAN[relShort(dwx,dayNayinWx)]||{}).health)||'')+'。';
  sH3+='<br>③ 十二长生：年支'+BZ.zhis[0]+'（'+dayCs[0]+'，主早年先天元气）、月支'+BZ.zhis[1]+'（'+dayCs[1]+'，主青年）、日支'+BZ.zhis[2]+'（'+dayCs[2]+'，主自身中年元气）、时支'+BZ.zhis[3]+'（'+dayCs[3]+'，主晚年）。'+
    (CS_STRONG.indexOf(dayCs[2])>=0?('日支坐'+csWangDi(dayCs[2])+'，自身元气根基厚实。'):
     CS_WEAK.indexOf(dayCs[2])>=0?('日支坐'+dayCs[2]+'弱地，自身元气偏弱、宜后天培补。'):
     ('日支坐'+dayCs[2]+'平地，自身元气和顺、须常养固。'))+
    (CS_STRONG.indexOf(dayCs[0])>=0?('年支旺（'+dayCs[0]+'），早年先天元气尚可。'):CS_WEAK.indexOf(dayCs[0])>=0?('年支弱（'+dayCs[0]+'），早年先天元气偏弱。'):'')+
    (CS_STRONG.indexOf(dayCs[3])>=0?('时支旺（'+dayCs[3]+'），晚年元气有根。'):CS_WEAK.indexOf(dayCs[3])>=0?('时支弱（'+dayCs[3]+'），晚年宜养护防衰。'):'');
  // 神煞与喜忌相参（吉凶神煞挂钩健康喜忌，与事业卡同口径）
  const _hj=shaNames('天医','福星贵人','太极贵人','天德','月德');
  const _hx=shaNames('血刃','羊刃','飞刃','天刑','劫煞','灾煞','亡神','孤辰','寡宿','天罗','地网','童子','流霞');
  sH3+='<br>'+shaXiJiNote(_hj,_hx,'身心养护有凭','宜防其扰','本局健康神煞无显著吉凶、以常养论之');
  // 寿元根基（寿星=食神：《三命通会·论食神》；元神厚薄主寿夭：《滴天髓·何知章》。属原局禀赋，不随年龄门控，只示倾向不妄断年岁。）
  const shangShen=ss['食神']||0, pianYin=ss['偏印']||0;
  const _zhiChong={'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'};
  // 食神与偏印是否真同宫（同一柱干或支并见）；仅同宫才可言“夺”，否则只是并见
  let _shouTongGong=false;
  for(let _i=0;_i<4;_i++){ const _gt=shenCat(tenGod(BZ.dayGan,BZ.gans[_i])), _zt=shenCat(tenGod(BZ.dayGan, zhiMain(BZ.zhis[_i]))); if((_gt==='食神'||_zt==='食神')&&(_gt==='偏印'||_zt==='偏印')) _shouTongGong=true; }
  // 印根（生身之基，木）被财（金）所冲：如卯酉冲；此为本局寿元最相关之结构信号
  let _yinChong=false;
  for(let _i=0;_i<4;_i++)for(let _j=_i+1;_j<4;_j++){ const _zi=BZ.zhis[_i],_zj=BZ.zhis[_j],_wi=ZHI_WX[_zi],_wj=ZHI_WX[_zj]; if(((_wi==='木'&&_wj==='金')||(_wi==='金'&&_wj==='木'))&&_zhiChong[_zi]===_zj) _yinChong=true; }
  let shouTxt='④ 寿元根基：命理以食神为寿星（《三命通会·论食神》），寿夭观其有无损益、并参元神厚薄而定倾向，仅示根基、不妄断年岁。';
  if(shangShen>0 && pianYin===0) shouTxt+='食神（寿星）现而无夺，寿元根基厚实；';
  else if(shangShen>0 && pianYin>0){
    if(_shouTongGong) shouTxt+='食神（寿星）现而偏印（枭神）同宫夺之，寿星受掣、根基有损，宜培护避刑伤；';
    else shouTxt+='食神（寿星）现而偏印（枭神）并见，偏印克食、寿星略受掣，宜培护；';
  } else shouTxt+='食神（寿星）不现，先天少一凭依，不以之定夭，宜后天常养以厚基；';
  if(_yinChong) shouTxt+='又木气为金所冲（如卯酉），根气受损、培补之力被制，宜静养避冲克过耗；';
  if(strong) shouTxt+='日主身强本元充固、元神厚、气定神完，寿基可承（依《滴天髓·何知章》性定元神厚之论）；';
  else if(weak) shouTxt+='日主身弱元神偏薄'+(genRoot>0||genTou>0?'而犹有根倚、未至枯槁':'且无根倚、气易散神易枯')+'，宜时时培固、避过耗（《滴天髓·何知章》气浊神枯之戒）；';
  else shouTxt+='日主中和本元平实、元神匀，寿基尚稳；';
  if(xiLack.length){
    const _abs=xiLack.filter(wx=>!_wxInPillar(wx)), _weak=xiLack.filter(wx=>_wxInPillar(wx));
    if(_abs.length) shouTxt+='又喜用'+_abs.join('、')+'缺而不现、培补少凭，宜定向养护以厚寿元。';
    if(_weak.length) shouTxt+='又喜用'+_weak.join('、')+'虽现而弱、根气受损，培补少凭，宜定向养护以厚寿元。';
  } else shouTxt+='五行不偏枯，寿元无害偏之虞。';
  // 寿元重心（总纲） + 岁运应期：寿元贵在元神与寿星二者，指出本局寿元偏倚所在，并给逢冲印根/忌神大运宜重养护的应期句，与运势分析联动
  {
    // 寿元重心：护/养/和 先定总纲，再给岁运应期（直接点名何种岁运引动印根之冲或耗元，禁破折号）
    const _shouWeak = _yinChong || _shouTongGong || (weak && !genRoot && !genTou);
    const _shouBing = shangShen>0 && pianYin>0 && !_shouTongGong;  // 食神偏印并见（非同宫）寿星略受掣
    const _shouLi = !_shouWeak && shangShen>0 && pianYin===0 && !_yinChong && !weak;
    let _zx;
    if(_shouWeak) _zx='本局寿元以护为先'+( _yinChong?'，木印之根为金所冲、根气受损':_shouTongGong?'，寿星食神被偏印同宫所夺':'，日主无根身弱、元神易散')+'，宜静养培固、避过耗';
    else if(_shouBing) _zx='本局寿元以护为先，偏印克食、寿星略受掣，宜培护避刑伤';
    else if(_shouLi) _zx='本局寿元以养为先，寿元根基厚实'+(strong?'、日主身强元神充固':'')+'，贵在善养不妄耗';
    else _zx='本局寿元以和为先，食神寿星与元神无大偏损，宜饮食有节、起居有时';
    // 岁运应期：点名冲印根的天干地支方向 + 忌神运（忌神五行用顿号分隔，揉进同一主题段、勿另起）
    const _jiYun = jiWxSet.length ? jiWxSet.join('、') : '';
    let _yingTxt='';
    if(_yinChong) _yingTxt='岁运再逢金旺之年、冲克木印之根（如卯酉相冲类）之时，根气更损、宜格外静养避冲';
    else _yingTxt='岁运逢庚申辛酉金旺之年、冲克木印之根，培补之力受制、宜静养避冲';
    if(_jiYun) _yingTxt += (_yinChong?'，并逢':'，')+_jiYun+'忌神大运流年耗元之时，亦宜重点养护';
    shouTxt += '寿元应期：'+_zx+'。'+_yingTxt;
  }
  // ④ 本节仅神煞/纳音/十二长生，寿元根基归第6节养护调护方向（见下 ⑤）
  // 4 六亲、脏腑与命局特征（六亲十神→性情→身心影响，与脏腑同段）
  const _xi=w=>fuXi.indexOf(w)>=0, _ji=w=>fuJi.indexOf(w)>=0;
  const _lqH=[];
  if((lq['印星']||0)>0) _lqH.push('印星（母荫家教）'+( _xi(yinWx)?'为喜用、得母荫滋养、性情温厚、思虑有度':'为忌神、依赖过甚、思虑多耗心神'));
  if((lq['官杀']||0)>0) _lqH.push('官杀（父教管束）'+( _xi(killWx)?'为喜用、自律有节、身心张弛有度':'为忌神、管束紧绷、神经易紧宜疏解'));
  if((lq['比劫']||0)>0) _lqH.push('比劫（兄弟姐妹）'+( _xi(dwx)?'为喜用、同侪扶持、身心有伴':'为忌神、争竞耗神、宜淡泊自处'));
  if((lq['食伤']||0)>0) _lqH.push('食伤（才情表达）'+( _xi(shangWx)?'为喜用、表达畅达、身心疏泄有度':'为忌神、耗神过度、宜节劳养神'));
  if((lq['财星']||0)>0) _lqH.push('财星（父缘务实）'+( _xi(wealthWx)?'为喜用、务实有度、身心安顿':'为忌神、劳心于财、得失挂怀宜知止'));
  const _lqHTxt=_lqH.length?('六亲与身心：'+_lqH.join('；')+'。'):'六亲星皆不显，身心以自主调养为要。';
  let sH4='① '+_lqHTxt+'<br>② 五行';
  {
    // 与寿元段同口径：真缺（干支无此字）才称“缺”；有字而弱称“虽现而弱、根气受损”
    const _abs=lackWx.filter(w=>!_wxInPillar(w)), _weak=lackWx.filter(w=>_wxInPillar(w));
    const parts=[];
    _abs.forEach(w=>{ const o=hOrg(w); if(xiWxSet.includes(w)) parts.push('缺'+w+'（'+o+'偏弱，<span class="tip sha-ji">喜用</span>不现、最宜定向养护）'); else if(jiWxSet.includes(w)) parts.push('缺'+w+'（'+o+'失养，反免'+w+'旺之病，不必强补）'); else parts.push('缺'+w+'（'+o+'偏弱，影响尚轻）'); });
    _weak.forEach(w=>{ const o=hOrg(w); if(xiWxSet.includes(w)) parts.push(w+'（'+o+'）虽现而弱、根气受损，<span class="tip sha-ji">喜用</span>偏弱、宜培补养护'); else if(jiWxSet.includes(w)) parts.push(w+'（'+o+'）虽现而弱，<span class="tip sha-xiong">忌神</span>失势、戕害减轻'); else parts.push(w+'（'+o+'）虽现而弱、根气受损，影响尚轻'); });
    sH4+=(parts.length?parts.join('；')+'。':'齐全不偏枯。');
  }
  if(genRoot>0||genTou>0) sH4+='<br>③ 日主有根'+(genRoot>0?('（'+dedupChars(BZ.zhis.filter(z=>ZHI_WX[z]===dwx))+'为根）'):'')+(genTou>0?('、比劫透干'+dedupChars(biTou)+'为助'):'')+'，底气足、耐耗。';
  else sH4+='<br>③ 日主虚浮无根，易随境动摇、宜借力培元。';
  // 脏腑强弱随五行旺衰流转（①单五行→脏腑→喜忌→能量 ②五行生克→脏腑生克
  // ③宫位落脏，调用 PILLAR_BODY/GAN_ZANG/ZHI_ZANG/WX_PILLAR_ZANG 真源 ④同异总结；每层分段；
  // 缺五行由②五行段独述，禁"缺金却言土生金滋养有源"式无凭生克）
  const wxTier=wxStrength(BZ);
  const _pz=window.WX_PILLAR_ZANG||{};
  const _PB=window.PILLAR_BODY||{}, _GZ=window.GAN_ZANG||{}, _ZZ=window.ZHI_ZANG||{};
  const _t4=w=>{ const e=eScore[w]||0; return e>WX_TIER_HI*eAvg?'过旺':(e>WX_TIER_LO*eAvg?'偏旺':'平和'); };
  const _weak4=w=>{ const e=eScore[w]||0; return e>1e-6 && e/eTotal<0.10; };   // 势弱：占比<10%（与②逐神深读"平和而势弱"同口径）
  const _tend4=w=>{
    const t=_t4(w), xi=xiWxSet.includes(w), ji=jiWxSet.includes(w);
    if(xi){
      if(t==='过旺') return '，喜用过旺、气盛宜疏解';
      if(t==='偏旺') return '，喜用得势、身心有倚';
      return _weak4(w)?('，偏弱为喜用、得养不足、宜培补'):'，喜用平和、气平顺';
    }
    if(ji){
      if(t==='过旺') return '，过旺为忌、易偏亢、宜疏泄清养';
      if(t==='偏旺') return '，忌神偏旺、宜防其扰';
      return '，忌神平和、其扰有限';
    }
    return t==='过旺'?'，气过旺、宜疏泄有度':t==='偏旺'?'，气偏旺、宜疏解有度':'，气平顺、以常养为要';
  };
  // 生克落脏：生我者（滋养源）与我克者（制约对象），按双方能量比给力度，禁一刀切；仅对现现五行生效
  const _gz=w=>{
    const o=hOrg(w); if(!o) return '';
    const out=[];
    const _sm=Object.keys(WX_SHENG).find(k=>WX_SHENG[k]===w);   // 生我者（印）
    if(_sm&&hOrg(_sm)&&eScore[_sm]>1e-6) out.push(hOrg(_sm)+'（'+_sm+'）生'+o+'，'+(eScore[_sm]>=eScore[w]?'滋养有源、相资相养':'生源偏弱、滋养欠足'));
    const _woke=WX_KE[w];                                        // 我克者（财）
    if(_woke&&hOrg(_woke)&&eScore[_woke]>1e-6) out.push(o+'克'+hOrg(_woke)+'（'+_woke+'），'+(eScore[w]>eScore[_woke]?'制约有力、疏泄有度':(eScore[_woke]>eScore[w]?'反被其耗、制之不及':'制约相当')));
    return out.join('；');
  };
  const _present=wxArr.filter(w=>eScore[w]>1e-6);
  const _lack=wxArr.filter(w=>eScore[w]<=1e-6);
  // （1）单五行→脏腑→喜忌→能量
  const _p1=_present.map(w=>w+'（'+Math.round(eScore[w])+'、'+hOrg(w)+'）'+_tend4(w)).join('；')
    +(_lack.length?((_present.length?'；':'')+'缺'+_lack.join('、')+'（'+_lack.map(hOrg).join('、')+'）失养，见②五行'):'');
  // （2）五行生克→脏腑生克
  const _p2=_present.map(_gz).filter(Boolean);
  // （3）宫位落脏：四柱干支→脏腑→身体区域（GAN_ZANG/ZHI_ZANG/PILLAR_BODY）+ 旺衰脏腑分野（WX_PILLAR_ZANG）
  const _pillarLocs=BZ.gans.map((g,i)=>{
    const z=BZ.zhis[i];
    const region=(_PB[PALACE[i]+'柱']||{}).区域||'';
    return PALACE[i]+'柱'+g+z+'：'+g+'主'+(_GZ[g]||'')+'、'+z+'主'+(_ZZ[z]||'')+'，落'+region;
  });
  const _fen=_present.map(w=>hOrg(w)+'（'+w+'）'+((_t4(w)==='过旺'||_t4(w)==='偏旺')?'旺':_weak4(w)?'弱':'平')+'、'+(_pz[w]||'分野未载'));
  // （4）同异总结：同=生克与旺衰同向（旺克弱、源旺而受生者亦旺）；异=弱难制旺、缺行失制/失养
  const _same=[], _diff=[];
  ['木','火','土','金','水'].forEach(a=>{
    const b=WX_KE[a]; const ea=eScore[a]||0, eb=eScore[b]||0;
    if(ea>1e-6&&eb>1e-6){
      const ta=_t4(a), tb=_t4(b);
      if((ta==='过旺'||ta==='偏旺')&&tb==='平和'&&_weak4(b)) _same.push(a+'旺克'+b+'弱，'+hOrg(a)+'强而'+hOrg(b)+'弱、生克与旺衰相应');
      if(ta==='平和'&&_weak4(a)&&(tb==='过旺'||tb==='偏旺')) _diff.push(a+'弱而'+b+'旺，'+hOrg(a)+'难制'+hOrg(b)+'、'+hOrg(b)+'失制偏亢');
    }
  });
  ['木','火','土','金','水'].forEach(a=>{
    const b=WX_SHENG[a]; const ea=eScore[a]||0, eb=eScore[b]||0;
    if(ea>1e-6&&eb>1e-6){
      const ta=_t4(a), tb=_t4(b);
      if((ta==='过旺'||ta==='偏旺')&&(tb==='过旺'||tb==='偏旺')) _same.push(a+'生'+b+'，源旺而'+hOrg(b)+'亦旺、相资相养');
    }
  });
  _lack.forEach(X=>{
    const keda=WX_KE[X], kewo=Object.keys(WX_KE).find(k=>WX_KE[k]===X);
    const parts=[];
    if(keda&&(eScore[keda]||0)>1e-6&&(_t4(keda)==='过旺'||_t4(keda)==='偏旺')) parts.push(hOrg(keda)+'失制、愈旺');
    if(kewo&&(eScore[kewo]||0)>1e-6&&(_t4(kewo)==='过旺'||_t4(kewo)==='偏旺')) parts.push(hOrg(X)+'失养（受'+kewo+'克）');
    if(parts.length) _diff.push(X+'缺、'+parts.join('、'));
  });
  const _concl=(_same.length||_diff.length)
    ? ('同：'+_same.join('；')+(_diff.length?('；异：'+_diff.join('；')):''))
    : '旺衰与生克相应、无显著相背，脏腑以平顺为常';
  sH4+='<br>④ 脏腑强弱随五行旺衰流转：'
    +'<br>(1)五行脏腑旺衰：'+(_p1||'现现五行皆不显')+'。'
    +'<br>(2)脏腑生克：'+(_p2.length?_p2.join('；')+'。':'现现五行间无生克可论。')
    +'<br>(3)宫位落脏：'+_pillarLocs.join('；')+'。'+(_fen.length?('旺衰分野：'+_fen.join('；')+'。'):'')
    +'<br>(4)同异总结：'+_concl;
  // 日主所克之脏专项（我克者为所伤）：日主气盛则所克之脏受克太过而耗伤，气弱则所克之脏失于疏制而弛软；与上方倾向角度互补，仅当该脏未被倾向覆盖时单列
  const keWx=WX_KE[dwx];
  if(keWx && hOrg(keWx) && !_present.some(w=>hOrg(w)===hOrg(keWx)&&((jiWxSet.includes(w)&&_t4(w)==='过旺')||(xiWxSet.includes(w)&&_t4(w)==='平和')))){
    if(_t4(dwx)==='过旺') sH4+='；'+hOrg(keWx)+'为日主（'+dwx+'）所克，日主气盛则克之太过（'+(_pz[keWx]||'')+'），该脏易受耗伤、宜防过劳、避强克之行';
    else if(_t4(dwx)==='平和') sH4+='；'+hOrg(keWx)+'为日主（'+dwx+'）所克，日主气弱则克之不及（'+(_pz[keWx]||'')+'），该脏失于疏制、易弛软乏力、宜温养';
  }
  sH4+='。';
  // 5 风险预警
  const hRisk=[], hShort=[], hFalsif=[];
  if(weak) hRisk.push('身弱本元薄，易感疲劳、抗病力偏弱，宜规律作息、忌过劳耗散。');
  if(ePct('官杀')>=REL.TH.PCT_OVER) hRisk.push('官杀过旺，常处紧绷，易失眠焦虑、神经紧张，宜疏解减压。');
  const xueReng=shaNames('血刃','羊刃','飞刃');
  if(xueReng.length) hRisk.push('带'+xueReng.join('、')+'之类，防意外伤、血光、手术，出行运动须谨慎。');
  jiWxSet.forEach(w=>{ if(wxTier[w]==='强') hRisk.push(hOrg(w)+'因'+w+'过旺<span class="tip sha-xiong">为忌</span>，该脏腑负荷偏重、易见偏亢之疾，宜疏泄清养、定期检查。'); });
  {
    const xiA=xiLack.filter(w=>!_wxInPillar(w)), xiW=xiLack.filter(w=>_wxInPillar(w));
    xiA.forEach(w=>hShort.push('五行缺'+w+'（'+hOrg(w)+'），<span class="tip sha-ji">为喜用</span>不现、偏弱，是先天养护重点。'));
    xiW.forEach(w=>hShort.push(w+'（'+hOrg(w)+'）虽现而弱、根气受损，<span class="tip sha-ji">为喜用</span>偏弱，宜定向培补养护。'));
    const nA=neuLack.filter(w=>!_wxInPillar(w));
    nA.forEach(w=>hShort.push('五行缺'+w+'（'+hOrg(w)+'），偏弱但属中性、影响尚轻。'));
  }
  // 忌神缺失不列为养护重点（反去其病，不必强补）
  if(ePct('印星')>=REL.TH.PCT_OVER) hShort.push('印星过旺，思多行少、易郁滞，宜动不宜静。');
  if(shaAll.indexOf('华盖')>=0) hFalsif.push('华盖主孤静，若喜静则印证、若过偏则宜主动社交以化解。');
  if(shaAll.indexOf('病符')>=0||shaAll.indexOf('天医')>=0) hFalsif.push('带病符或天医，健康信号明显，平时重调养则无碍。');
  let sH5='风险提示：'+(hRisk.length?hRisk.join(''):'本局无明显体质凶象，顺时养护就好。');
  if(hShort.length) sH5+='特征提示：'+hShort.join('');
  if(hFalsif.length) sH5+='可证伪：'+hFalsif.join('');
  // 6 养护机遇方向
  const xiFang=xiWxSet.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
  const jiFang=jiWxSet.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
  let sH6='① <span class="tip sha-ji">喜用</span>养护：<span class="tip sha-ji">喜用</span>'+fuXiStr+'，'+(xiFang.length?('宜就'+xiFang.join('，')+'方位起居、'):'')+'近'+xiWxSet.map(wx=>hOrg(wx)).filter(Boolean).join('、')+'相生之养。';
  const weakWx=xiLack.concat(neuLack);
  if(weakWx.length){
    const _wa=weakWx.filter(w=>!_wxInPillar(w)), _ww=weakWx.filter(w=>_wxInPillar(w));
    const parts=[];
    if(_wa.length) parts.push('缺'+_wa.join('、')+'，宜针对性养护'+_wa.map(hOrg).join('、'));
    _ww.forEach(w=>{ const o=hOrg(w); if(xiWxSet.includes(w)) parts.push(w+'（'+o+'）虽现而弱，<span class="tip sha-ji">喜用</span>偏弱、宜定向培补养护'); else parts.push(w+'（'+o+'）虽现而弱、根气受损，影响尚轻'); });
    sH6+='<br>② 弱项补益：'+parts.join('；')+'。';
  }
  else if(lackWx.length) sH6+='<br>② 弱项补益：所缺皆属<span class="tip sha-xiong">忌神</span>，反去其病、不必强补，仍以平衡作息运动为要。';
  else sH6+='<br>② 弱项补益：五行不缺，重在平衡作息运动。';
  let sH6_3='调神方向：'+(weak?'身弱宜养气固本、静养涵神':strong?'身强宜运动疏泄、汗出适度':'中和宜动静有常');
  if(ePct('食伤')>=REL.TH.PCT_STRONG) sH6_3+='，思虑多者宜减思静心';
  else if(ePct('官杀')>=REL.TH.PCT_STRONG) sH6_3+='，紧绷者宜减压疏解';
  sH6+='<br>③ '+sH6_3+'。';
  if(jiFang.length) sH6+='<br>④ 宜避：'+jiFang.join('，')+'。';
  sH6 += '<br>⑤ 寿元根基：' + shouTxt.replace(/^④\s*寿元根基\s*[：:]/, '');
  sH6 += dyNatalInto('性格健康', BZ, A, '⑥');
  // 7 身心素质层级
  const hsk={}, hhk={}, hik={};
  hsk['本元']=strong?M('hit','身强本元充固、精力根基厚实'):weak?M('low','身弱本元偏薄、宜养固培元'):M('part','中和本元平实、不偏不倚');
  hsk['根气']=(genRoot>0||genTou>0)?M('hit','日主有根有依、底气足'):M('low','日主虚浮无根、易随境动摇');
  hhk['均衡']=lackWx.length===0?M('hit','五行齐全不偏枯、脏腑气机匀')
    : xiLack.length? M('low','缺'+xiLack.join('、')+'，<span class="tip sha-ji">为喜用</span>而不现、'+xiLack.map(hOrg).join('、')+'偏弱、宜定向养护')
    : (jiLack.length&&neuLack.length===0)? M('hit','所缺'+jiLack.join('、')+'皆<span class="tip sha-xiong">为忌神</span>、反免其病、脏腑无戕害')
    : M('part','缺'+lackWx.join('、')+'、'+lackWx.map(hOrg).join('、')+'偏弱、影响尚轻');
  hhk['喜用']=xiScore>=WX_TIER_HI*eAvg?M('hit','<span class="tip sha-ji">喜用</span>得力、先天得养'):xiScore>=WX_TIER_LO*eAvg?M('part','<span class="tip sha-ji">喜用</span>仅弱现、后天培补更显'):M('low','<span class="tip sha-ji">喜用</span>不显、宜后天培补');
  const xueReng2=shaNames('血刃','羊刃');
  hhk['神煞']=xueReng2.length?M('low','带'+xueReng2.join('、')+'之类、宜防伤血'):M('hit','无显著刑伤神煞、体态安和');
  hik['纳音养']=(relShort(dwx, dayNayinWx)==='生日主'||relShort(dwx, dayNayinWx)==='比和')?M('hit','纳音生日主、体质得补'):(relShort(dwx, dayNayinWx)==='克日主')?M('low','纳音克日主、宜养护'):M('part','纳音与日主平淡、以常养为要');
  const jisha=shaNames('天医','福星贵人','太极贵人');
  hik['吉煞护']=jisha.length?M('hit','得'+jisha.join('、')+'等吉煞庇佑、养护有凭'):M('part','无显著养护吉煞、以常养为要');
  const hslv=potLevel(hsk), hhlv=potLevel(hhk), hilv=potLevel(hik);
  let domH=['本元',hslv]; [['调和',hhlv],['养护',hilv]].forEach(o=>{ if(RANK[o[1]]>RANK[domH[1]]) domH=o; });
  let sH7='本元稳定（'+hslv+'，原局自发）：'+Object.keys(hsk).map(k=>hsk[k].p).join('。')+'。';
  sH7+='<br>五行调和（'+hhlv+'，原局自发）：'+Object.keys(hhk).map(k=>hhk[k].p).join('。')+'。';
  sH7+='<br>养护信号（'+hilv+'，原局自发）：'+Object.keys(hik).map(k=>hik[k].p).join('。')+'。';
  const hNeed=[];
  if(hsk['根气'].v==='low') hNeed.push('日主有根');
  if(hhk['均衡'].v==='low') hNeed.push('五行均衡');
  if(hhk['喜用'].v==='low') hNeed.push('<span class="tip sha-ji">喜用</span>得力');
  // 综合判定开头一句话（中性，与婚姻/事业同款：定性+建议；因子已见 §1/§4/§7 不重述）
  const heavyGod=hGodOrder.filter(c=>ePct(c)>=REL.TH.PCT_OVER);
  let sH8 = strong?'性情主观决断、精力可承'
          : weak?'性情内敛随顺、易感疲弱'
          : '性情平实、刚柔相济';
  if(heavyGod.length) sH8+='，心性受'+heavyGod.join('、')+'濡染';
  sH8+='；身心以'+domH[0]+'为先、宜顺时调摄。';
  sH7+='<br>综合判定：'+sH8+'身心素质可期（综合本元、调和、养护三维度叠加，层级互有高低，任一维度成势皆能增益）。'
     + (hNeed.length?('身心所赖'+hNeed.join('、')+'等项原局不足或为忌，需要多重条件齐备才能达到上限，不是原局自带，而是五层叠加。'):'原局已有基础，仍需要以下条件叠加才能充分兑现。');
  sH7+='<br>① 原局潜力层级：本元'+hslv+'、调和'+hhlv+'、养护'+hilv+'，综合以'+domH[0]+'维度为主导。';
  sH7+='<br>② 大运流年引动：逢'+fuXiStr+'旺运更顺，身弱宜逢生扶运、身强宜逢疏泄运方为转机。';
  sH7+='<br>③ 起居风水（外部条件：居所方位、作息环境合<span class="tip sha-ji">喜用</span>）。';
  sH7+='<br>④ 饮食运动与医疗（外部条件：膳饮节度、适度运动、定期养护）。';
  sH7+='<br>⑤ 情志修养主观能动性（内在条件：调神养性、疏解压力、规律作息；命理示素质上限与路径，养护与生活方式决定最终落点）。';
  sH7+='<br>五者齐备，身心之基方能充分兑现，也更有向上提升的空间。'+(strong?'宜以强根承载、动静有常':weak?'宜以养固为要、勿过耗散':'宜以平和为本、顺时调养')+'；然若得良医调护、遇善养之机，亦未尝不可更进一层、康宁久长。相同八字，身心素质未必相同，后天养护与生活方式必定导致差异。';
  return [
    '1、本命基调<br>'+sH1,
    '2、十神关系<br>'+sH2,
    '3、神煞、纳音与十二长生<br>'+sH3,
    '4、六亲、脏腑与命局特征<br>'+sH4,
    '5、风险预警<br>'+sH5,
    '6、养护调护方向<br>'+sH6,
    '7、身心素质层级<br>'+sH7
  ];
}

function renderFamilyCard(BZ, ctx){
  const { PALACE, dg, dwx, A, ss, lq, spouse, strong, weak, wxArr, eScore, eTotal, eAvg, tenE, eCats, ePct, shangWx, wealthWx, yinWx, killWx, isMale, organs, shaAll, normSha, shaNames, fuXi, fuJi, fuXiStr, xiWxSet, jiWxSet, caiTou, guanTou, yinTou, shangTou, biTou, spouseNote, shaSeg, career, marry, M, potLevel, RANK, FANG, genRoot, genTou, xiScore, dayNayinWx, dayCs, relNote, catTouN, catTouChars, godPos, CS_STRONG, CS_WEAK, csWangDi, fangUniq, fiveRing, fr } = ctx;
  // ===== 家庭子女：七节框架（与 事业财运，婚姻感情，性格健康 同构）=====
  const caiFather=BZ.gans.filter(g=>tenGod(dg,g)==='偏财');
  const yearGongGan=tenGod(dg,BZ.gans[0]), yearGongZhi=tenGod(dg,zhiMain(BZ.zhis[0]));
  const timeGongGan=tenGod(dg,BZ.gans[3]), timeGongZhi=tenGod(dg,zhiMain(BZ.zhis[3]));
  const childCnt=isMale?(lq['官杀']||0):(lq['食伤']||0);
  const childE=isMale?ePct('官杀'):ePct('食伤');   // 子女星能量占比（判定旺弱用能量，个数仅展示）
  // 1 本命基调（家庭维，带喜忌底色）
  let sF1=xiJiBasis(dg,dwx,fuXi,fuJi)+'父母看印星（生我，属'+yinWx+'），命局'+(lq['印星']||0)+'个'+(yinTou.length?('、天干透'+dedupChars(yinTou)+'，得长辈荫庇、学业有靠'):'、天干不透则父母之助偏暗或迟来')+'；偏财（父）'+(caiFather.length?('透'+dedupChars(caiFather)+'，父缘明现'):'不透，父缘看支')+'。年柱祖辈宫、月柱父母宫、时柱子女宫定家宅基盘'+(strong?'，身强能担家庭之责':weak?'，身弱宜借亲力、家庭多赖互助':'，中和则家庭关系平顺')+'。';
  // 2 十神关系（家庭）细向：个数，透藏位置，旺弱，有根，两两作用，流转
  const fGodOrder=['印星','财星','官杀','食伤','比劫'];
  const fGodWx={'印星':yinWx,'财星':wealthWx,'官杀':killWx,'食伤':shangWx,'比劫':dwx};
  const fNoteFn=(cat,str)=>{
    const wx=fGodWx[cat]||''; const isXi=xiWxSet.includes(wx), isJi=jiWxSet.includes(wx);
    if(isXi) return ({ // 喜用：正面家庭语义
      '印星':'长辈荫庇、亲情有靠，宜承其荫而自立。',
      '财星':'父缘家资为助、家道可旺，宜善用家资、防骄奢。',
      '官杀':'家教规则为助、子女易得规矩之教。',
      '食伤':'才情表达利亲子沟通、子女聪颖。',
      '比劫':'手足相扶、家业互济。'
    })[cat]||'';
    if(isJi) return ({ // 忌神：负面家庭语义
      '印星':'长辈荫庇过重、易依赖，须立独立。',
      '财星':'务实重利过甚、易为财所累。',
      '官杀':'家教过严、管束太紧，子女宜宽导。',
      '食伤':'表达过盛、易散漫，子女宜立范。',
      '比劫':'手足争竞过甚、易有耗散。'
    })[cat]||'';
    return ({ // 与喜忌无涉：中性家庭语义（禁套忌神负面词）
      '印星':'亲情有靠、护养得宜。',
      '财星':'父缘平顺、家资安稳。',
      '官杀':'家教有度、规则明晰。',
      '食伤':'表达有度、氛围宽松。',
      '比劫':'手足情笃、互助有常。'
    })[cat]||'';
  };
  const fGodItems=[];
  fGodOrder.forEach(cat=>{
    const total=(lq[cat]||0); if(total===0) return;
    // 旺衰档按五行能量分（相对均值，与量化四柱同源），不可按个数判（余气藏干堆个数≠真能量）
    const wx=fGodWx[cat]||''; const e=(wx&&eScore[wx])||0;
    const str= (e>WX_TIER_HI*eAvg)?'过旺' : (e>WX_TIER_LO*eAvg)?'偏旺' : '平和';
    // 喜忌标签先行（与性格卡逐神同格式，先判喜忌再析家庭意义，禁只有旺衰无喜忌）
    const _fXJ=xiWxSet.includes(wx)?'为<span class="tip sha-ji">喜用</span>':jiWxSet.includes(wx)?'为<span class="tip sha-xiong">忌神</span>':'与喜忌无涉';
    // note 后补"透藏落宫转译"（家庭视角：祖上/父母/持家/子女），打破固定模板句雷同
    const _luo=tenLuoGong({BZ, wxOf:fGodWx, lq}, cat, 'family');
    fGodItems.push(cat+'属'+(fGodWx[cat]||'')+'，命局'+total+'个、'+godPos(cat)+'，'+str+'，'+_fXJ+'。'+fNoteFn(cat,str)+(_luo?(''+_luo+'。'):''));
  });
  // 家庭两两作用（顶层统一判定 REL.tenCombo 命中关系 → 家庭主题句；与事业/十神宫位同一喜忌裁决，避免口径分叉）
  const _tCtxF=(typeof REL!=='undefined'&&REL.tenCombo&&REL.tenCombo.buildCtx)?REL.tenCombo.buildCtx(BZ):null;
  const _tHitsF=_tCtxF?REL.tenCombo.matchAll(_tCtxF):[];
  const _negSayF=s=>/为忌|忌神|破财|克身|受损|祸患|夺食|压力|虚浮|难成/.test(s||'');
  const fPair=SHISHEN.namesOf('family').map(n=>{
    const h=_tHitsF.find(x=>x.name===n); if(!h) return '';
    return SHISHEN.pick(n,'family',_negSayF(h.say));
  }).filter(Boolean);
  let fFlow=fr.flowStr+fr.fJudge
    + (((lq['印星']||0)===0 && (lq['财星']||0)===0)?'印财俱弱，亲情与家资助力偏薄，家庭宜自立经营。':'');
  let sF2;
  {
    let idx=0; const parts=[];
    fGodItems.forEach(t=>{ parts.push('①②③④⑤'[idx]+' '+t); idx++; });
    if(fPair.length){ parts.push('①②③④⑤⑥'[idx]+' 两两作用：'+fPair.join('')); idx++; }
    parts.push('①②③④⑤⑥⑦'[idx]+' '+fFlow);
    sF2 = fGodItems.length ? parts.join('<br>') : '十神分布无单项过旺，家庭气场相对均衡，不易因某一十神偏激而生家庭之扰。';
  }
  // 3 神煞、纳音与十二长生
  const fyN=nayinOf(BZ.gans[0]+BZ.zhis[0]), ftN=nayinOf(BZ.gans[3]+BZ.zhis[3]);
  let sF3='① '+shaSeg('family');
  sF3+='<br>② 纳音：祖上年命'+nayinColorSpan(fyN)+relNote((NAYIN_INFO[fyN]||{}).wx)+'，'+(((NAYIN_REL_MEAN[relShort(dwx,(NAYIN_INFO[fyN]||{}).wx)]||{}).family)||'')+'；子女宫'+nayinColorSpan(ftN)+relNote((NAYIN_INFO[ftN]||{}).wx)+'，'+(((NAYIN_REL_MEAN[relShort(dwx,(NAYIN_INFO[ftN]||{}).wx)]||{}).family)||'')+'。';
  sF3+='<br>③ 十二长生：年支'+BZ.zhis[0]+'（'+dayCs[0]+'，祖辈宫、主家运根基）、月支'+BZ.zhis[1]+'（'+dayCs[1]+'）、日支'+BZ.zhis[2]+'（'+dayCs[2]+'）、时支'+BZ.zhis[3]+'（'+dayCs[3]+'，子女宫、主晚景家运）。'+
    (CS_STRONG.indexOf(dayCs[0])>=0?('年支（祖辈宫）坐'+csWangDi(dayCs[0])+'，家运根基厚实、长辈荫庇有情。'):
     CS_WEAK.indexOf(dayCs[0])>=0?('年支（祖辈宫）坐'+dayCs[0]+'弱地，家运根基偏弱、宜外力培植。'):
     ('年支（祖辈宫）坐'+dayCs[0]+'平地，家运平顺、根基稳固。'))+
    (CS_STRONG.indexOf(dayCs[3])>=0?('时支（子女宫）坐'+csWangDi(dayCs[3])+'，晚景家运与子女缘有根。'):
     CS_WEAK.indexOf(dayCs[3])>=0?('时支（子女宫）坐'+dayCs[3]+'弱地，晚景与子女缘宜用心维系。'):
     ('时支（子女宫）坐'+dayCs[3]+'平地，晚景安稳、家运平顺。'));
  // 神煞与喜忌相参（吉凶神煞挂钩家运喜忌，与事业卡同口径）
  const _fj=shaNames('天乙贵人','天德','月德','福星贵人','禄神','金舆','将星','德秀贵人');
  const _fx=shaNames('孤辰','寡宿','丧门','披麻','童子','天罗','地网');
  sF3+='<br>'+shaXiJiNote(_fj,_fx,'家宅安泰有凭','亲缘宜用心维系','本局家运神煞无显著吉凶、以常安论之');
  // 4 六亲与命局特征（①宫位十神 ②子女星能量 ③喜忌判定 ④宫位冲刑）
  let sF4='① 祖辈宫（年柱）天干'+yearGongGan+'、地支'+yearGongZhi+(shenCat(yearGongGan)===shenCat(yearGongZhi)?'（干支同心）':'（干支异气）')+'，主早年家门、祖上根基；子女宫（时柱）天干'+timeGongGan+'、地支'+timeGongZhi+'，'+(isMale?(['正官','七杀'].indexOf(timeGongZhi)>=0?'坐官杀，子女缘厚、易得成器之嗣':'非官杀本位，子女宜迟养或用心教化'):(['食神','伤官'].indexOf(timeGongZhi)>=0?'坐食伤，子女缘厚、易得聪慧之嗣':'非食伤本位，子女宜迟养或用心教化'))+'。';
  sF4+='<br>② '+(isMale?'男命以官杀为子女（属'+killWx+'），':'女命以食伤为子女（属'+shangWx+'），')+'命局'+childCnt+'个'+(childE>=REL.TH.PCT_STRONG?(isMale?'，官杀旺则子女成行、宜善导':'，食伤旺则子女聪秀、宜因材施教'):(childE<REL.TH.PCT_WEAK?'，子女星虚浮、宜经营':'，子女星平和、寻常教养即可'))+'。';
  // 子女星与父母宫喜忌判定（与婚姻卡六亲同口径，禁只列能量档）
  const _childWx=isMale?killWx:shangWx;
  const _childXi=fuXi.indexOf(_childWx)>=0, _childJi=fuJi.indexOf(_childWx)>=0;
  const _sF4Xi='子女星（'+_childWx+'）'+( _childXi?'为喜用，子女缘厚且能助家运、晚岁有靠':'')+( _childJi?'为忌神，子女虽有其缘亦多操心、宜宽导少执':'')+((!_childXi&&!_childJi)?'与喜忌无涉、以常缘经营':'')+'。';
  const _yGanWx=GAN_WX[BZ.gans[0]], _yZhiWx=ZHI_WX[BZ.zhis[0]];
  const _yGanXi=fuXi.indexOf(_yGanWx)>=0, _yGanJi=fuJi.indexOf(_yGanWx)>=0;
  const _yZhiXi=fuXi.indexOf(_yZhiWx)>=0, _yZhiJi=fuJi.indexOf(_yZhiWx)>=0;
  // 干支分别判定（干喜支忌时不再"助家业助力偏薄"无分隔粘连）
  const _sF4Yao='祖辈宫（年柱'+BZ.gans[0]+BZ.zhis[0]+'，干'+_yGanWx+(_yGanXi?'喜用':'')+(_yGanJi?'忌神':'')+'、支'+_yZhiWx+(_yZhiXi?'喜用':'')+(_yZhiJi?'忌神':'')+'）：'
    +((_yGanXi||_yZhiXi)?'祖荫能助家业':'')
    +((_yGanJi||_yZhiJi)?((_yGanXi||_yZhiXi)?'，然助力亦有偏处':'祖荫助力偏薄、家业宜自立'):'')
    +((!_yGanXi&&!_yGanJi&&!_yZhiXi&&!_yZhiJi)?'与喜忌无涉、祖荫平常':'')+'。';
  sF4+='<br>③ '+_sF4Xi+_sF4Yao;
  // 宫位冲刑害合：按地支对去重（年支破时支 与 时支破年支 是同一关系，只列一次）
  const famRel=[], _famSeen=new Set();
  [['年支',BZ.zhis[0]],['月支',BZ.zhis[1]],['时支',BZ.zhis[3]]].forEach(([p,z])=>{
    relToMing(z).forEach(r=>{
      const m=r.match(/^(冲|合|刑|害|破)(年支|月支|日支|时支)\((.+)\)$/);
      const k=m?(m[1]+'|'+[z,m[3]].sort().join('|')):'';
      if(k&&_famSeen.has(k)) return;
      if(k)_famSeen.add(k);
      famRel.push(p+r);
    });
  });
  sF4+='<br>④ '+(famRel.length?('命局'+famRel.join('、')+'，宫位牵动、主家宅或亲缘有变，宜以缘份经营化解。'):'祖辈宫（年柱）、子女宫（时柱）安静，家宅缘份平稳。');
  // 5 风险预警
  const fRisk=[], fShort=[], fFalsif=[];
  const famChong=famRel.some(r=>relTypeOf(r)==='冲'), famXing=famRel.some(r=>relTypeOf(r)==='刑');
  if(famChong||famXing) fRisk.push('祖辈、父母或子女宫逢冲刑，家宅易有变动、与亲缘聚少离多，宜以缘份经营、多沟通化解。');
  if((lq['印星']||0)===0) fRisk.push('印星不显，亲情助力偏薄、宜自立经营家庭。');
  if(childE<REL.TH.PCT_WEAK) fShort.push('子女星虚浮，子息宜经营、或迟养方成。');
  if(childE>=REL.TH.PCT_OVER) fShort.push((isMale?'官杀':'食伤')+'过旺，子女管教宜张弛有度、防严苛或溺爱。');
  const gu=shaNames('孤辰','寡宿');
  if(gu.length) fFalsif.push('带'+gu.join('、')+'，若疏于经营则亲缘易淡、宜主动维系。');
  let sF5='风险提示：'+(fRisk.length?fRisk.join(''):'本局无明显家庭凶象，家宅缘份平稳。');
  if(fShort.length) sF5+='特征提示：'+fShort.join('');
  if(fFalsif.length) sF5+='可证伪：'+fFalsif.join('');
  // 6 家庭机遇方向
  const fXiFang=xiWxSet.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
  const fJiFang=jiWxSet.filter(wx=>WX_FANG[wx]).map(wx=>wx+WX_FANG[wx].li.join('、'));
  let sF6='① 子女教化：'+(childE>=REL.TH.PCT_STRONG?(isMale?'官杀旺，子女宜立规矩、因势利导':'食伤旺，子女宜顺性启智、宽松教养'):childE<REL.TH.PCT_WEAK?'子女星弱，宜用心经营、迟养或借缘':'子女星平和，宜寻常教养、顺其自然')+'。';
  sF6+='<br>② 家庭经营：'+(strong?'身强能担家庭之责、宜主动维系':'身弱宜借亲力、家庭多赖互助')+'，'+(caiFather.length?'父缘明现、家资有源':'父缘看支、宜以情补')+'。';
  sF6+='<br>③ 居家方位：'+(fXiFang.length?('本命'+kXi('喜')+fuXiStr+'，居所、书房宜向'+fangUniq(fXiFang)+'（<span class="tip sha-ji">喜用</span>方位引气入局，家和运顺、子女缘得润）；'):'')+(fJiFang.length?('须避'+fangUniq(fJiFang)+'（<span class="tip sha-xiong">忌神</span>方位气场相背，易生耗散、宜远之）'):'')+'。';
  sF6 += dyNatalInto('家庭子女', BZ, A, '④');
  // 7 家庭子女缘分层级
  const fsk={}, fhk={}, fik={};
  fsk['父母宫']=(shenCat(tenGod(dg,BZ.gans[1]))==='印星'||yinTou.length>0||(lq['印星']||0)>=1)?M('hit','父母宫得印、父母之助有情、亲情有依'):M('low','父母宫印星不显、亲情宜自立经营');
  fsk['子女宫']=(isMale?(['正官','七杀'].indexOf(timeGongZhi)>=0):(['食神','伤官'].indexOf(timeGongZhi)>=0))?M('hit','子女宫得位、子女缘厚'):M('low','子女宫非本位、子女宜经营');
  fhk['印星']=(lq['印星']||0)>=1?M('hit','印星得力、得长辈护、亲情有靠'):M('low','印星不显、亲情助力偏薄');
  fhk['父缘']=(caiFather.length>0||(lq['财星']||0)>=1)?M('hit','父缘明现、家资有源'):M('part','父缘偏暗、宜看支寻源');
  fhk['宫位和']=(famChong||famXing)?M('low','祖辈父母子女宫逢冲刑、家变动多'):M('hit','祖辈父母子女宫安静、家宅平稳');
  fik['子女星']=childE>=REL.TH.PCT_STRONG?M('hit','子女星旺、子息成行'):childE>=REL.TH.PCT_WEAK?M('part','子女星中和、缘份中等'):M('low','子女星虚浮、宜经营');
  const jias=shaNames('天乙贵人','天德贵人','月德贵人');
  fik['吉煞护']=jias.length?M('hit','得'+jias.join('、')+'等吉煞、家运有护'):M('part','无显著家运吉煞、以常经营为要');
  const fslv=potLevel(fsk), fhlv=potLevel(fhk), filv=potLevel(fik);
  let domF=['亲情',fhlv]; [['根基',fslv],['缘分',filv]].forEach(o=>{ if(RANK[o[1]]>RANK[domF[1]]) domF=o; });
  let sF7='根基稳定（'+fslv+'，原局自发）：'+Object.keys(fsk).map(k=>fsk[k].p).join('。')+'。';
  sF7+='<br>亲情和谐（'+fhlv+'，原局自发）：'+Object.keys(fhk).map(k=>fhk[k].p).join('。')+'。';
  sF7+='<br>子女缘分（'+filv+'，原局自发）：'+Object.keys(fik).map(k=>fik[k].p).join('。')+'。';
  const fNeed=[];
  if(fsk['子女宫'].v==='low') fNeed.push('子女宫得位');
  if(fhk['印星'].v==='low') fNeed.push('印星得力');
  if(fik['子女星'].v==='low') fNeed.push('子女星旺');
  // 综合判定开头一句话（中性，与婚姻/事业同款：定性+建议；因子已见 §7 不重述）
  let sF8='家庭缘份以'+domF[0]+'为主导、子女缘份随子女宫星厚薄，宜以经营维系、亲子沟通、长期投入。';
  sF7+='<br>综合判定：'+sF8+'家庭子女缘份可期（综合根基、亲情、缘分三维度叠加，层级互有高低，任一维度成势皆能增益）。'
     + (fNeed.length?('缘份所赖'+fNeed.join('、')+'等项原局不足或为忌，需要多重条件齐备才能达到上限，不是原局自带，而是五层叠加。'):'原局已有基础，仍需要以下条件叠加才能充分兑现。');
  sF7+='<br>① 原局潜力层级：根基'+fslv+'、亲情'+fhlv+'、缘分'+filv+'，综合以'+domF[0]+'维度为主导。';
  sF7+='<br>② 大运流年引动：逢'+fuXiStr+'旺运更顺，子女星<span class="tip sha-ji">为喜用</span>则逢<span class="tip sha-ji">喜用</span>运子女缘更厚。';
  sF7+='<br>③ 风水合局（外部条件：家宅风水、居所布局宜合<span class="tip sha-ji">喜用</span>）。';
  sF7+='<br>④ 家风环境（外部条件：家教氛围、居所方位合<span class="tip sha-ji">喜用</span>）。';
  sF7+='<br>⑤ 经营主观能动性（内在条件：亲子沟通、家庭经营、长期投入；命理示缘份上限与路径，经营决定最终落点）。';
  sF7+='<br>五者齐备，家庭子女之基方能充分兑现，也更有向上提升的空间。'+(strong?'宜以担当维系家庭':'宜以柔情经营亲情')+'；然若得良缘相引、遇善经营之机，亦未尝不可更进一层、家道兴隆。相同八字，家庭子女缘份未必相同，后天经营与机缘必定导致差异。';
  return [
    '1、本命基调<br>'+sF1,
    '2、十神关系<br>'+sF2,
    '3、神煞、纳音与十二长生<br>'+sF3,
    '4、六亲与命局特征<br>'+sF4,
    '5、风险预警<br>'+sF5,
    '6、家庭经营方向<br>'+sF6,
    '7、家庭子女缘分<br>'+sF7
  ];
}

function renderCoreAnalysis(BZ){
  return `<details class="zr-mod zr-quant" id="zr-core"><summary>核心解读</summary><div class="zr-mod-b"><div class="core-box">`
    + renderChengu(BZ)
    + duanShiMingJu(BZ)
    + renderShiShenPos(BZ)
    + renderLifeDeep(BZ)
    + `</div></div></details>`;
}

/* ===== 所选干支详情，各流派解读（运），深度具体化 =====
   结构：先出"本命基调（五派总览）"单表（不随所选干支重复），再为每个所选干支各出一张子表（流派：该干支解读）。
   每张表仅 2 列，table-layout:fixed 固定占比 + 自动换行，避免选满大运，流年，流月，流日后 6 列挤压、单元格被拉长、横向滚动。 */
function buildSchoolsDeep(BZ, sel, selMeta){
  const A=getAnalysis(BZ);
  const dg=BZ.dayGan;
  const tiaoGrade=stripCat(A.tiao.grade);
  const fuXi=A.fu.xiCats||[], fuJi=A.fu.jiCats||[];
  const xiSet=new Set(fuXi), jiSet=new Set(fuJi);
  function tenCat(gz){ const g=tenGod(dg,gz[0]), z=tenGod(dg,zhiMain(gz[1])); let tag=[]; [g,z].forEach(t=>{const c=shenCat(t); if(xiSet.has(c))tag.push('喜');else if(jiSet.has(c))tag.push('忌');}); return {g,z,tag:tag.length?tag.join(''):'中'}; }
  const season={'寅':'春','卯':'春','辰':'春','巳':'夏','午':'夏','未':'夏','申':'秋','酉':'秋','戌':'秋','亥':'冬','子':'冬','丑':'冬'}[BZ.monthZ];
  const GE_CAT_KEYS=['官杀','七杀','正官','食伤','伤官','食神','财星','正财','偏财','印星','正印','偏印','比劫','劫财','比肩'];
  const GE_CAT_BASE=(typeof TEN_CLASS!=='undefined')?TEN_CLASS:{'七杀':'官杀','正官':'官杀','伤官':'食伤','食神':'食伤','正财':'财星','偏财':'财星','正印':'印星','偏印':'印星','劫财':'比劫','比肩':'比劫'}; // 十神→类：统一引用 bazi-data.js 唯一真源 TEN_CLASS
  // 格局用神/忌神表述多为"动宾用途句"（食伤生财/官杀护财/比劫夺财/官杀制刃…）：
  // 格局用神类集：数据层已编译为结构化字段（xiCats/jiCats），此处直接读取，不再解析用途句文本
  const geUseXiCats=(A.geUse&&A.geUse.xiCats)||[];
  const geUseJiCats=(A.geUse&&A.geUse.jiCats)||[];
  // ---- 解说层数据源：把页面已算的“所选干支详情 / 与命局干支关系 / 所选干支间关系”提炼成可白话解说的结构化事实 ----
  function relPlain(a,b,la,lb){
    const labs=(la&&lb)?[la,lb]:undefined; const pre=(la&&lb)?la+lb:'';
    const gr=ganRelations([a[0],b[0]], BZ, labs);
    const zr=zhiPairText(a[1],b[1], labs);
    const parts=[];
    if(gr.length) parts.push('干'+gr.map(r=>r.text.replace(pre,'')).join('、'));
    if(zr.length) parts.push('支'+zr.map(x=>x.t.replace(pre,'')).join('、'));
    return parts.length?parts.join('，'):'无';
  }
  function stepFacts(s){
    const ny=nayinOf(s.gz);
    const info=(typeof NAYIN_INFO!=='undefined'&&NAYIN_INFO[ny])||{wx:'',d:''};
    const ganTen=tenGod(dg,s.gz[0]);
    const zhiTen=tenGod(dg,zhiMain(s.gz[1]));
    const cs=s.gz[1]?getChangSheng(dg,s.gz[1]):'';
    const mingLab=['年','月','日','时'];
    const mingGz=[BZ.gans[0]+BZ.zhis[0],BZ.gans[1]+BZ.zhis[1],BZ.gans[2]+BZ.zhis[2],BZ.gans[3]+BZ.zhis[3]];
    const mingRels=mingGz.map((mg,i)=>({lab:mingLab[i]+'柱',gz:mg,rel:relPlain(s.gz,mg,s.lvl,mingLab[i]+'柱'),
      ganRels:ganRelations([s.gz[0],mg[0]], BZ, [s.lvl,mingLab[i]+'柱']), zhiRels:zhiPairText(s.gz[1],mg[1], [s.lvl,mingLab[i]+'柱'])})).filter(r=>r.rel!=='无');
    const special=relMingSpecial(s.gz, s.lvl).map(x=>x.replace(/<[^>]+>/g,''));
    const pairRels=(sel||[]).filter(o=>o!==s).map(o=>({lab:o.lvl,gz:o.gz,rel:relPlain(s.gz,o.gz,s.lvl,o.lvl)}));
    const ft=(s.lvl==='流年'&&typeof fanTaiSui==='function')?fanTaiSui(s.gz[1],BZ.yearZ):null;
    return {gz:s.gz,lvl:s.lvl,ny,info,ganTen,zhiTen,cs,mingRels,special,pairRels,ft};
  }
  // 解说层：f 只输出“本派视角对命局的影响解读”，不复述前面面板已列事实；并按层级叠加前序（大运→流年→流月→流日）
  const LV={'大运':0,'流年':1,'流月':2,'流日':3};
  function underStack(s){ return (sel||[]).filter(o=>o!==s && LV[o.lvl]<LV[s.lvl]); }
  // 层级去重：本层只说相对最近上层（大运→流年→流月→流日）的增量，上层已述者不复述
  function upperOf(s){ const us=underStack(s); if(!us.length) return null; return us.slice().sort((a,b)=>LV[b.lvl]-LV[a.lvl])[0]; }
  function tagBy(gz, xiFn, jiFn){ return xiFn(gz)?'喜':(jiFn(gz)?'忌':'中'); }
  // 层级间关系损益解读：表3所选干支间关系已列关系事实，此处只给“本派视角的损益结论”，不复述干支全文
  function verdictWx(scName, wx){   // 单五行 → 该派喜忌（格局看十神类、盲派看财官、调候看调候字、新派看旺衰生克方向、病药看药病）
    const rep='甲乙丙丁戊己庚辛壬癸'.split('').find(x=>GAN_WX[x]===wx)||wx;
    const cat=shenCat(tenGod(dg,rep));
    switch(scName){
      case '子平格局派': return geUseXiCats.indexOf(cat)>=0?'喜':(geUseJiCats.indexOf(cat)>=0?'忌':'中');
      case '盲派': return (cat==='财星'||cat==='官杀')?'喜':'中';
      case '调候派': return wx===A.tiao.wx?'喜':(WX_KE[wx]===A.tiao.wx?'忌':'中');
      case '新派（民国）': { const strong=(A.strength||'').indexOf('弱')<0; const MODE={'印星':'生','比劫':'扶','食伤':'泄','财星':'耗','官杀':'克'}; const m=MODE[cat]; if(!m) return '中'; return strong?((m==='泄'||m==='耗'||m==='克')?'喜':'忌'):((m==='生'||m==='扶')?'喜':'忌'); }
      case '病药派': return wx===A.bingYao.bing?'忌':(wx===A.bingYao.yao?'喜':'中');
      default: return '中';
    }
  }
  function keyHe(scName, x){   // 天干合：该派关键对象被合 → 优先解读（用神/调候字/药神/官杀财）
    const wx=GAN_WX[x];
    switch(scName){
      case '调候派': return wx===A.tiao.wx?('调候用神'+x+'逢合，寒暖之济受阻'):'';
      case '病药派': return wx===A.bingYao.yao?('药神'+x+'逢合，制'+A.bingYao.bing+'之力减、偏枯复现'):'';
      case '子平格局派': return geUseXiCats.indexOf(shenCat(tenGod(dg,x)))>=0?(x+'用神逢合、力减'):'';
      case '盲派': { const c=shenCat(tenGod(dg,x)); return c==='官杀'?'官杀逢合，功名事有牵绊':(c==='财星'?'财星逢合，求财事有牵绊':''); }
      default: return '';
    }
  }
  function pairVerdict(s, F, scName){
    const up=upperOf(s); if(!up) return '';
    const pr=(F.pairRels||[]).find(o=>o.lab===up.lvl);
    if(!pr||pr.rel==='无') return '';
    const rel=pr.rel, out=[];
    // 天干部分
    const gm=rel.match(/干([^，]*)/);
    if(gm){
      const gt=gm[1];
      const heM=gt.match(/合化([金木水火土])/);
      if(heM){
        const g=s.gz[0], ug=up.gz[0], w=heM[1];
        const k1=keyHe(scName,g), k2=keyHe(scName,ug);
        let ht='';
        if(k1&&k2&&scName==='子平格局派') ht='两用神相合、失用';
        else if(k1||k2) ht=(k1||k2);
        else { const v=verdictWx(scName,w); ht='相合化'+w+'，'+({'喜':'化神为用、气聚成事','忌':'化神为忌、气杂耗力','中':'合绊留连'}[v]); }
        out.push('与'+up.lvl+up.gz+'相合，'+ht);
      } else if(/合而不化/.test(gt)){ out.push('与'+up.lvl+up.gz+'相合绊、气机交绊'); }
      // 天干相克/相冲为中性事实（表3 已列），无损益信息，不复述
    }
    // 地支部分
    const zm=rel.match(/支(.+)$/);
    if(zm){
      const zt=zm[1];
      const dh=zt.match(/合化([金木水火土])/);
      let zOut='';
      if(dh){ const v=verdictWx(scName,dh[1]); zOut='地支合化'+dh[1]+'，'+({'喜':'化神为用、气聚成事','忌':'化神为忌、气杂耗力','中':'合绊留连'}[v]); }
      else if(/相冲/.test(zt)){ const v=verdictWx(scName,ZHI_WX[s.gz[1]]); zOut='地支相冲，'+({'喜':'冲及喜用、根基动荡','忌':'冲去忌神、反为去病','中':'变动之象'}[v]); }
      else if(/相刑/.test(zt)){ zOut='地支相刑、刑伤是非'; }
      else if(/相害/.test(zt)){ zOut='地支相害、暗损阻隔'; }
      else if(/相破/.test(zt)){ zOut='地支相破、破耗离散'; }
      if(zOut) out.push(zOut);
    }
    const o=out.filter(x=>{ if(saidDuan.has(x)) return false; saidDuan.add(x); return true; });
    return o.length?('；'+o.join('；')):'';
  }
  // 各派"本层与命局干支关系"解读（表2 事实 × 本派方法论；严禁混用别派视角；生克比和为中性事实不复述）
  function schoolMingRel(scName, s, F){
    const rels=F.mingRels||[]; if(!rels.length) return '';
    const out=[];
    rels.forEach(r=>{
      const mgz=r.gz;
      const pt={gTen:shenCat(tenGod(dg,mgz[0])), zTen:shenCat(tenGod(dg,zhiMain(mgz[1]))), gWx:GAN_WX[mgz[0]], zWx:ZHI_WX[mgz[1]]};
      const words=[];
      (r.ganRels||[]).forEach(x=>{ if(x.cls==='gchong') words.push('冲'); else if(x.cls==='he') words.push('合'); else if(x.cls==='ke') words.push('克'); });
      (r.zhiRels||[]).forEach(x=>{ if(x.w==='冲'||x.w==='合'||x.w==='暗合'||x.w==='害'||x.w==='破'||x.w==='刑') words.push(x.w); });
      if(!words.length) return;
      const hasDong=words.some(w=>w==='冲'||w==='刑'||w==='害'||w==='破'||w==='克');
      const hasHe=words.some(w=>w==='合'||w==='暗合');
      const rw=hasDong?(words.find(w=>w==='冲'||w==='刑'||w==='害'||w==='破'||w==='克')||'冲'):'合';
      const ten=pt.gTen||pt.zTen||''; const pillar=r.lab;
      // 日柱天干命中＝日主本人被引动（受克=官杀压力、被合=合绊），子平/新派不得套"比劫/用神忌神"口径
      const dayGanHit = pillar==='日柱' && (r.ganRels||[]).some(x=>x.cls==='he'||x.cls==='gchong'||x.cls==='ke');
      switch(scName){
        case '子平格局派': {
          if(dayGanHit){ out.push(hasHe?`日柱被合（日主合绊），日主受绊、气机凝滞`:`日柱受${rw}（日主受克），日主受制、身气受压`); break; }
          const uG=geUseXiCats.indexOf(pt.gTen)>=0||geUseXiCats.indexOf(pt.gWx)>=0, uZ=geUseXiCats.indexOf(pt.zTen)>=0||geUseXiCats.indexOf(pt.zWx)>=0;
          const jG=geUseJiCats.indexOf(pt.gTen)>=0||geUseJiCats.indexOf(pt.gWx)>=0, jZ=geUseJiCats.indexOf(pt.zTen)>=0||geUseJiCats.indexOf(pt.zWx)>=0;
          if(uG||uZ){ const nm=(uG?pt.gTen:pt.zTen)||''; out.push(hasDong?`${pillar}受${rw}（${nm}为用神），用神受扰、格局有碍`:`${pillar}被合（${nm}为用神），用神被绊、力减`); }
          else if(jG||jZ){ const nm=(jG?pt.gTen:pt.zTen)||''; out.push(hasDong?`${pillar}受${rw}（${nm}为忌神），忌神受制、反为去病`:`${pillar}被合（${nm}为忌神），忌神被绊、暂缓`); }
          break;
        }
        case '盲派': {
          const obj=(pt.gTen==='财星'||pt.zTen==='财星')?'财星':((pt.gTen==='官杀'||pt.zTen==='官杀')?'官杀':'');
          if(obj) out.push(hasDong?`${pillar}受${rw}（${obj}所在），${obj}得动、事机开启`:`${pillar}被合（${obj}所在），${obj}被绊、求取有阻`);
          break;
        }
        case '调候派': {
          if(pt.gWx===A.tiao.wx||pt.zWx===A.tiao.wx) out.push(hasDong?`${pillar}受${rw}（调候用神${A.tiao.wx}所在），调候受扰、寒暖有偏`:`${pillar}被合（调候用神${A.tiao.wx}所在），调候受绊`);
          break;
        }
        case '新派（民国）': {
          const strong=(A.strength||'').indexOf('弱')<0;
          if(dayGanHit){ out.push(hasHe?`日柱被合（日主合绊），${strong?'旺势稍敛、日主趋衡':'日主失助、更弱'}`:`日柱受${rw}（日主受克），${strong?'旺势得制、日主趋衡':'日主失扶、更弱'}`); break; }
          // 命中方十神（天干被引动取天干、否则地支本气），防"地支受刑却取天干（日主）当比劫"张冠李戴
          const ganHitX=(r.ganRels||[]).some(x=>x.cls==='he'||x.cls==='gchong'||x.cls==='ke');
          const shenN=(ganHitX?pt.gTen:pt.zTen)||pt.gTen||pt.zTen||'';
          const shengN=(shenN==='印星'||shenN==='比劫')?shenN:'';
          const xieN=(shenN==='食伤'||shenN==='财星'||shenN==='官杀')?shenN:'';
          if(shengN&&hasDong) out.push(strong?`${pillar}受${rw}（${shengN}生扶被制），旺势稍敛、日主得衡`:`${pillar}受${rw}（${shengN}生扶被制），日主失扶、更弱`);
          else if(shengN&&hasHe) out.push(strong?`${pillar}被合（${shengN}生扶合入），旺势更盛、宜防过亢`:`${pillar}被合（${shengN}生扶合入），日主得扶`);
          else if(xieN&&hasDong) out.push(strong?`${pillar}受${rw}（${xieN}耗泄被制），旺势更盛、宜防`:`${pillar}受${rw}（${xieN}耗泄被制），日主更失衡`);
          else if(xieN&&hasHe) out.push(strong?`${pillar}被合（${xieN}耗泄合入），日主得衡`:`${pillar}被合（${xieN}耗泄合入），日主更弱`);
          break;
        }
        case '病药派': {
          const yao=pt.gWx===A.bingYao.yao||pt.zWx===A.bingYao.yao, bing=pt.gWx===A.bingYao.bing||pt.zWx===A.bingYao.bing;
          if(yao) out.push(hasDong?`${pillar}受${rw}（药神${A.bingYao.yao}所在），药力得动、偏枯可缓`:`${pillar}被合（药神${A.bingYao.yao}所在），药神被绊、药力减`);
          else if(bing) out.push(hasDong?`${pillar}受${rw}（病神${A.bingYao.bing}所在），病神受制、病势稍缓`:`${pillar}被合（病神${A.bingYao.bing}所在），病神被合、暂缓`);
          break;
        }
      }
    });
    const fresh=out.filter(x=>{ if(saidDuan.has(x)) return false; saidDuan.add(x); return true; });
    return fresh.slice(0,2).join('；');
  }
  function geXi(gz){ const tc=tenCat(gz),g=shenCat(tc.g),z=shenCat(tc.z); return geUseXiCats.indexOf(g)>=0||geUseXiCats.indexOf(z)>=0||geUseXiCats.indexOf(GAN_WX[gz[0]])>=0||geUseXiCats.indexOf(ZHI_WX[gz[1]])>=0; }
  function geJi(gz){ const tc=tenCat(gz),g=shenCat(tc.g),z=shenCat(tc.z); return geUseJiCats.indexOf(g)>=0||geUseJiCats.indexOf(z)>=0||geUseJiCats.indexOf(GAN_WX[gz[0]])>=0||geUseJiCats.indexOf(ZHI_WX[gz[1]])>=0; }
  // 格局派：天干、地支本气分判（一顺一逆即“格成而力半”，不可笼统判喜）
  function geVect(gz){ const tc=tenCat(gz);
    const gs=(function(){ const c=shenCat(tc.g); if(geUseXiCats.indexOf(c)>=0||geUseXiCats.indexOf(GAN_WX[gz[0]])>=0) return '喜'; if(geUseJiCats.indexOf(c)>=0||geUseJiCats.indexOf(GAN_WX[gz[0]])>=0) return '忌'; return '中'; })();
    const zs=(function(){ const c=shenCat(tc.z); if(geUseXiCats.indexOf(c)>=0||geUseXiCats.indexOf(ZHI_WX[gz[1]])>=0) return '喜'; if(geUseJiCats.indexOf(c)>=0||geUseJiCats.indexOf(ZHI_WX[gz[1]])>=0) return '忌'; return '中'; })();
    return {g:gs, z:zs};
  }
  function geTag(v){ if(v.g==='喜'&&v.z==='喜')return '喜'; if(v.g==='忌'&&v.z==='忌')return '忌'; if((v.g==='喜'&&v.z==='忌')||(v.g==='忌'&&v.z==='喜'))return 'mix'; return (v.g==='喜'||v.z==='喜')?'喜':(v.g==='忌'||v.z==='忌')?'忌':'中'; }
  function mangXi(gz){ const tc=tenCat(gz); return shenCat(tc.g)==='财星'||shenCat(tc.g)==='官杀'||shenCat(tc.z)==='财星'||shenCat(tc.z)==='官杀'; }
  function tiaoXi(gz){ return GAN_WX[gz[0]]===A.tiao.wx||ZHI_WX[gz[1]]===A.tiao.wx; }
  function tiaoJi(gz){ return WX_KE[GAN_WX[gz[0]]]===A.tiao.wx||WX_KE[ZHI_WX[gz[1]]]===A.tiao.wx; }
  function bingXi(gz){ return GAN_WX[gz[0]]===A.bingYao.yao||ZHI_WX[gz[1]]===A.bingYao.yao; }
  function bingJi(gz){ return GAN_WX[gz[0]]===A.bingYao.bing||ZHI_WX[gz[1]]===A.bingYao.bing; }
  // 每步神煞（支相对命局触发：驿马/桃花/天乙贵人/文昌）+ 十二长生含义：进每步解说，补"事象"
  function stepSha(gz){
    const z=gz[1], dg2=BZ.dayGan, dz=BZ.dayZ, yz=BZ.yearZ;
    const YIMA={'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','亥':'巳','卯':'巳','未':'巳','巳':'亥','酉':'亥','丑':'亥'};
    const TAO={'申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','亥':'子','卯':'子','未':'子','巳':'午','酉':'午','丑':'午'};
    const GUI={'甲':'丑未','戊':'丑未','庚':'丑未','乙':'子申','己':'子申','丙':'亥酉','丁':'亥酉','壬':'卯巳','癸':'卯巳','辛':'午寅'};
    const WEN={'甲':'巳','乙':'午','丙':'申','戊':'申','丁':'酉','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯'};
    const out=[];
    if(YIMA[dz]===z||YIMA[yz]===z) out.push('驿马');
    if(TAO[dz]===z||TAO[yz]===z) out.push('桃花');
    if(GUI[dg2]&&GUI[dg2].indexOf(z)>=0) out.push('天乙贵人');
    if(WEN[dg2]===z) out.push('文昌');
    return out;
  }
  function csMean(cs){ const age=curAge; const M={'长生':'方生之机、事有开端','沐浴':(baziAgeStage(age)==='child'?'性情敏感、心志未定、易随境转':(age!=null&&age>=60?'渐入情态、宜稳守':'败地桃花、感情易动')),'冠带':'渐进有成','临官':'可任事、渐入佳境','帝旺':'极盛、宜守成','衰':'气渐退、宜稳','病':'多烦、健康宜顾','死':'无气、事多阻滞','墓':'收敛、宜蓄','绝':'困顿、宜蛰伏','胎':'酝酿、宜待','养':'滋养、渐复'}; return cs?M[cs]:''; }
  // 十二长生措辞：双字名（长生、沐浴、冠带、临官、帝旺）不加"地"，单字名（衰、病、死、墓、绝、胎、养）才加"地"
  function csDi(cs){ return (cs && cs.length===1) ? cs+'地' : (cs||''); }
  // 月柱：说明本层与月柱（取格之本）的真实干支关系
  function yueStab(F){ const yue=F.mingRels.find(r=>r.lab==='月柱'); if(!yue) return ''; const r=yue.rel; const bad=/冲|刑|克/.test(r), good=/合|生|比和/.test(r); const verdict=(r==='无')?'根基平稳':bad&&!good?'根基受冲击、宜稳中求进':good&&!bad?'根基得助、渐趋平稳':'根基稍有变动、宜先静观其变'; return `；月柱为取格之本，${verdict}`; }
  // ===== 各流派对单个所选干支的解读（真分化：每派用自己的方法论，不重复面板事实） =====
  // 应期落点：本层引动哪些宫位（被冲克刑害或合），应在哪类人事；每层独立输出（大运十年与流年每年粒度不同，不跨层去重）
  const YQ_GONG={'年柱':'长辈祖上','月柱':'父母兄弟与平台','日柱':'自身配偶','时柱':'子女晚景'};
  // 本层与命局的实质引动关系（排除纯比和/生克的中性事实）
  function mingRelReal(F){ return (F.mingRels||[]).filter(r=>/冲|刑|害|合|克|破/.test(r.rel||'')); }
  function yqLine(s,m){
    const rels=(stepFacts(s).mingRels||[]).filter(r=>/冲|刑|害|合|克|破/.test(r.rel||'')); if(!rels.length) return '';
    const labs=rels.map(r=>r.lab);
    const gongs=Array.from(new Set(labs.map(l=>(l==='日柱' && m && baziAgeStage(stepAgeOf(m))==='child')?'自身与同辈':(YQ_GONG[l]||l))));
    const LF_WORD={'大运':'大运力重','流年':'流年力中','流月':'流月力轻','流日':'流日力微'};
    return `引动落点${labs.join('、')}，主${gongs.join('、')}（${LF_WORD[s.lvl]||''}）。`; }
  // 增量版：月柱根基只在最上层交代一次；神煞、长生仅取本层新增
  function yueStabInc(s, F){ return upperOf(s)?'':yueStab(F); }
  // 神煞措辞按年龄门控：桃花/沐浴等成人情缘词对孩童转写，免"感情易动"落在小儿身上
  function shaMean(x){ const age=curAge; const A={'驿马':'主远行、变动、奔波','桃花':'感情易动、人际缘旺','天乙贵人':'得外力贵人之助','文昌':'利学业、文书、名声'}; if(baziAgeStage(age)!=='child'){ if(age!=null && age>=60 && x==='桃花') return ''; return A[x]||''; } const K={'驿马':'环境易变、家或居所易搬迁、出行增多','桃花':'人缘好、同伴相得、易得玩伴','天乙贵人':'得长辈外援之助','文昌':'利启蒙、记问、学业'}; return K[x]||A[x]||''; }
  function shaClauseInc(s){ const sh=stepSha(s.gz); if(!sh.length) return ''; const had=[]; underStack(s).forEach(o=>{ stepSha(o.gz).forEach(x=>{ if(had.indexOf(x)<0) had.push(x); }); }); const nw=sh.filter(x=>had.indexOf(x)<0); if(!nw.length) return ''; const age=curAge; const segs=nw.map(x=>{ const m=shaMean(x); if(!m) return ''; const lab=(x==='桃花'&&baziAgeStage(age)==='child')?'人缘':x; return lab+'，'+m; }).filter(Boolean); if(!segs.length) return ''; return '；'+s.lvl+'新逢'+segs.join('；'+s.lvl+'新逢'); }
  // 长生位与喜忌协调：判喜之步遇负面位（衰/病/死/绝）改写为中性蓄力语
  const CS_NEU={'衰':'气机渐敛、宜稳中求进','病':'小有烦扰、宜养宜顾','死':'气机暗伏、宜静守待转','绝':'气机收敛、宜蓄力待时'};
  // 长生位措辞：与宫位应事② 长生维度统一为运行XX地句式（墓→墓地、死→死地…）
  const CS_WORD={'墓':'墓库','死':'死地','绝':'绝地','病':'病地','衰':'衰地'};
  function csClauseInc(s, F, tag){ if(!F.cs) return ''; if(underStack(s).some(o=>o.gz[1]&&getChangSheng(dg,o.gz[1])===F.cs)) return ''; const base=csMean(F.cs); if(!base) return ''; const m=(tag==='喜'&&CS_NEU[F.cs])?CS_NEU[F.cs]:base; return '；'+s.lvl+'运行'+csDi(F.cs)+'，'+m; }
  // 盲派口诀综合：纳音 / 空亡 / 凶煞（羊刃，灾煞，劫煞）/ 犯太岁 / 与上层天克地冲相刑 ， 全链路 saidDuan 只述一次
  const NY_WX={'金':'其气刚健、主决断变革','木':'其气生发、主成长开拓','水':'其气流动、主智谋变通','火':'其气炎上、主明达外放','土':'其气厚重、主承载稳固'};
  const ZAI={'申':'午','子':'午','辰':'午','巳':'卯','酉':'卯','丑':'卯','寅':'子','午':'子','戌':'子','亥':'酉','卯':'酉','未':'酉'};
  const JIE={'申':'巳','子':'巳','辰':'巳','巳':'寅','酉':'寅','丑':'寅','寅':'亥','午':'亥','戌':'亥','亥':'申','卯':'申','未':'申'};
  const KONG_GONG={'年柱':'祖辈之事易悬而未决','月柱':'事业平台易虚浮难稳','日柱':'自身计划易落空多变','时柱':'子女晚辈之事易拖延难成'};
  function mangNayin(F){ if(!F.info||!F.info.wx||!NY_WX[F.info.wx]) return ''; const kt=`纳音${F.ny}，${NY_WX[F.info.wx]}`; if(saidDuan.has(kt)) return ''; saidDuan.add(kt); return '；'+kt; }

  // ===== 宫位应事，古籍断语：固定维度轴（①岁运应期/长生/纳音五行/十神临运/十神关系/神煞临运）=====
  // 直接复用 stepFacts / stepCtxOf 已算引擎数据，保证每步维度覆盖一致；各维有则出、无则标"无"，编号固定不跳号
  const CS_DUANYU={'长生':{t:'气运初萌、生机方启，宜蓄势待发。',s:'三命通会，论寿夭'},'沐浴':{t:'桃花临身、情志易浮动，宜守心持正。',s:'三命通会，论咸池'},'冠带':{t:'渐入佳境、声名始显，宜进德修业。',s:'滴天髓，论衰旺'},'临官':{t:'得地乘权、事业渐兴，宜乘势有为。',s:'三命通会，论正官'},'帝旺':{t:'气盛当权、锋芒毕露，宜防过亢持盈。',s:'滴天髓，论衰旺'},'衰':{t:'气渐收敛、事多迟回，宜养锐守成。',s:'三命通会，论寿夭'},'病':{t:'气血易滞、宜调摄。',s:'滴天髓，论疾病'},'死':{t:'气机敛藏、宜静不宜动。',s:'滴天髓，论疾病'},'墓':{t:'气归库藏、事宜收敛，宜蓄藏聚气。',s:'三命通会，论寿夭'},'绝':{t:'气运孤绝、宜避锋守静。',s:'滴天髓，论疾病'},'胎':{t:'气始萌蕴、宜静养待时。',s:'三命通会，论寿夭'},'养':{t:'气渐滋长、宜培元固本。',s:'三命通会，论寿夭'}};
  const WX_DUANYU={'木':'甲乙寅卯木受亏则主肝胆，宜护肝息风。','火':'丙丁巳午火受亏则主心火，宜养心安神。','土':'戊己辰戌丑未土受亏则主脾胃，宜调中理脾。','金':'庚辛申酉金受亏则主肺金，宜润肺清金。','水':'壬癸亥子水受亏则主肾水，宜滋水固肾。'};
  const TEN_DUANYU={'正官':'主贵气名位、宜守正持重。','七杀':'主威权压力、宜担责进取。','正印':'主荫庇文采、宜进学修德。','偏印':'主偏艺孤清、宜专精一技。','正财':'主财禄安稳、宜务实积聚。','偏财':'主外财交际、宜通达生财。','食神':'主福慧吐秀、宜宴乐抒怀。','伤官':'主才艺锋锐、宜显才守谦。','比肩':'主同辈助益、宜合作共济。','劫财':'主竞争耗散、宜防财被夺。'};
  const TEN_SRC={'正官':'三命通会，论正官','七杀':'三命通会，论偏官','正印':'三命通会，论正印','偏印':'三命通会，论偏印','正财':'三命通会，论正财','偏财':'三命通会，论偏财','食神':'三命通会，论食神','伤官':'三命通会，论伤官','比肩':'三命通会，论比肩','劫财':'三命通会，论比肩'};
  const SHA_DUANYU={'驿马':{t:'主远行变动、奔波。',s:'三命通会，论驿马'},'桃花':{t:'人际缘旺、情致易动。',s:'三命通会，论咸池'},'天乙贵人':{t:'得外力贵人之助。',s:'三命通会，论天乙贵人'},'文昌':{t:'利学业文书、声名。',s:'三命通会，论学堂词馆'}};
  function _tenTag(name, wx){ if(!name) return '中性'; const c=shenCat(name); if(geUseXiCats.indexOf(c)>=0) return '喜用'; if(geUseJiCats.indexOf(c)>=0) return '忌神'; const _sx=(A.synthesis&&A.synthesis.xiWxEff)||[], _sj=(A.synthesis&&A.synthesis.jiWxEff)||[]; if(_sx.indexOf(wx)>=0) return '喜用'; if(_sj.indexOf(wx)>=0) return '忌神'; const wv=wxVsYong(wx); if(wv==='用神'||wv==='喜神') return '喜用'; if(wv==='忌神') return '忌神'; return '中性'; }
  function _relLine(LVL, myTen, myTag, pillar, pTen, pTag, kind){
    const m=(myTag||'中性'), p=(pTag||'中性');
    if(kind==='合'){
      if(m==='喜用'&&p==='忌神') return `${LVL}${myTen}合${pillar}${pTen}，用神合绊忌神、去病得力`;
      if(m==='喜用') return `${LVL}${myTen}合${pillar}${pTen}，用神得助、吉气加临`;
      if(m==='忌神'&&p==='喜用') return `${LVL}${myTen}合${pillar}${pTen}，忌神合绊用神、吉气受牵`;
      if(m==='忌神') return `${LVL}${myTen}合${pillar}${pTen}，忌神被绊、其势稍缓`;
      return `${LVL}${myTen}合${pillar}${pTen}，气机交融、情意相投`;
    }
    // 克 / 冲：我方十神攻彼方十神，损益视双方喜忌（被攻方喜忌优先定吉凶）
    if(p==='忌神'){ if(m==='喜用') return `${LVL}${myTen}相${kind}${pillar}${pTen}，用神制忌、最为得力`; return `${LVL}${myTen}相${kind}${pillar}${pTen}，忌神受制、反为去病`; }
    if(p==='喜用'){ if(m==='忌神') return `${LVL}${myTen}相${kind}${pillar}${pTen}，忌神攻用、宜防其损`; return `${LVL}${myTen}相${kind}${pillar}${pTen}，用神受扰、宜防其损`; }
    if(m==='喜用') return `${LVL}${myTen}相${kind}${pillar}${pTen}，用神受扰、宜防其损`;
    if(m==='忌神') return `${LVL}${myTen}相${kind}${pillar}${pTen}，忌神受制、反为去病`;
    return `${LVL}${myTen}相${kind}${pillar}${pTen}，制化相争、宜审进退`;
  }
  function yunDuanyuByDim(s, BZ, A){
    const F=stepFacts(s);
    const sc=(window.stepCtxOf?window.stepCtxOf(s,BZ):null)||{};
    const LVL=s.lvl||'流年'; const dg=BZ.dayGan; const out=[];
    // ② 长生
    out.push('② 长生：'+(F.cs && CS_DUANYU[F.cs] ? LVL+'运行'+csDi(F.cs)+'，'+CS_DUANYU[F.cs].t+'（《'+CS_DUANYU[F.cs].s+'》）' : '无'));
    // ③ 纳音五行
    out.push('③ 纳音五行：'+(F.info && F.info.wx && WX_DUANYU[F.info.wx] ? LVL+'纳音属'+F.info.wx+'，'+WX_DUANYU[F.info.wx]+'（《滴天髓·论疾病》）' : '无'));
    // ③ 十神临运（天干 + 地支本气，各带喜忌）
    const tl=[];
    if(F.ganTen){ const tg=_tenTag(F.ganTen, GAN_WX[s.gz[0]]); tl.push(LVL+'天干'+s.gz[0]+'为'+F.ganTen+'（'+tg+'），'+String(TEN_DUANYU[F.ganTen]||'').replace(/[。；]+$/,'')); }
    if(F.zhiTen){ const tz=_tenTag(F.zhiTen, GAN_WX[zhiMain(s.gz[1])]); tl.push(LVL+'地支'+zhiMain(s.gz[1])+'（本气）为'+F.zhiTen+'（'+tz+'），'+String(TEN_DUANYU[F.zhiTen]||'').replace(/[。；]+$/,'')); }
    out.push('④ 十神临运（格局视角）：'+(tl.length?tl.join('；'):'无'));
    // ⑤ 十神关系（本步十神 与 命局四柱十神 生克合冲，损益视双方喜忌）
    const rl=[];
    (F.mingRels||[]).forEach(r=>{
      const pGT=tenGod(dg,r.gz[0]), pZT=tenGod(dg,zhiMain(r.gz[1]));
      const gr=r.ganRels||[], zr=r.zhiRels||[];
      const gHe=gr.some(x=>x.cls==='he'), zHe=zr.some(x=>x.w==='合'||x.w==='暗合'); // 合优先：同一柱天干/地支若既合又克，只取合，避免"得助"与"受扰"同现自相矛盾
      gr.forEach(x=>{ if(x.cls==='he') rl.push(_relLine(LVL,F.ganTen,_tenTag(F.ganTen,GAN_WX[s.gz[0]]),r.lab,pGT,_tenTag(pGT,GAN_WX[r.gz[0]]),'合')); else if(x.cls==='gchong') rl.push(_relLine(LVL,F.ganTen,_tenTag(F.ganTen,GAN_WX[s.gz[0]]),r.lab,pGT,_tenTag(pGT,GAN_WX[r.gz[0]]),'冲')); else if(x.cls==='ke'){ if(gHe) return; rl.push(_relLine(LVL,F.ganTen,_tenTag(F.ganTen,GAN_WX[s.gz[0]]),r.lab,pGT,_tenTag(pGT,GAN_WX[r.gz[0]]),'克')); } });
      zr.forEach(x=>{ if(x.w==='合'||x.w==='暗合') rl.push(_relLine(LVL,F.zhiTen,_tenTag(F.zhiTen,GAN_WX[zhiMain(s.gz[1])]),r.lab,pZT,_tenTag(pZT,GAN_WX[zhiMain(r.gz[1])]),'合')); else if(x.w==='冲'){ if(zHe) return; rl.push(_relLine(LVL,F.zhiTen,_tenTag(F.zhiTen,GAN_WX[zhiMain(s.gz[1])]),r.lab,pZT,_tenTag(pZT,GAN_WX[zhiMain(r.gz[1])]),'冲')); } else if(x.w==='刑') rl.push(`${LVL}地支${s.gz[1]}（${F.zhiTen}）与${r.lab}地支相刑，刑伤是非、宜防内耗（《玉照定真经》）`); else if(x.w==='害') rl.push(`${LVL}地支${s.gz[1]}（${F.zhiTen}）与${r.lab}地支相害，暗损阻隔、宜远是非（《玉照定真经》）`); else if(x.w==='破') rl.push(`${LVL}地支${s.gz[1]}（${F.zhiTen}）与${r.lab}地支相破，破耗离散、宜守不宜攻（《玉照定真经》）`); });
    });
    out.push('⑤ 十神关系：'+(rl.length?Array.from(new Set(rl)).slice(0,6).join('；'):'无'));
    // ⑥ 神煞临运：与"所选干支详情"表同源（pillarShaMerged，日干+年支主轴+年干/日支备轴+纳音轴），
    //    走与本表同一口径的全神煞表，避免"表格有神煞、解读却写无"。
    //    义释读 SHA_MEAN 顶层真源（bazi-data.js）base 字段（含古籍本义，去尾括注与句读）；SHAS 无义释者只报名不灌空话。
    //    年龄门控：child/late 档剔除婚恋情缘类（桃花/红艳/红鸾/天喜等），与 evGateSha/AGE_WORD.drop 同铁律。
    //    每条去尾句号再以分号连接,避免"。；"断裂致分号孤行
    let shaLine='无';
    let shaList=[];
    try{ shaList=pillarShaMerged({gz:s.gz, z:s.gz[1], gan:s.gz[0], isDay:false, isMonth:false, isYear:false, isTime:false}, CTX)||[]; }catch(e){ shaList=[]; }
    const _st6=baziAgeStage(curAge);
    if(_st6==='child'||_st6==='late') shaList=shaList.filter(x=>!/桃花|咸池|红艳|红鸾|天喜|孤鸾|八专|九丑|阴差阳错|童子/.test(x));
    if(shaList.length){
      const sl=shaList.map(sh=>{
        const _m=sh.replace(/（[^）]*）$/,'');
        const _sm=(typeof SHA_MEAN!=='undefined'&&SHA_MEAN[_m])?String(SHA_MEAN[_m].base||''):'';
        // 义释统一剥括注（出处括号不占解读行宽，与 ②③⑤ 各维同口径），再去尾句读；
        // 括注形如（《书名》）或（《书名》：释义），界至首个"）"
        return _sm ? `${LVL}逢${_m}，${_sm.replace(/（《[^）]*）|\([^）]*\)/g,'').replace(/[。；]+$/,'')}` : `${LVL}逢${_m}`;
      });
      shaLine=sl.join('；');
    }
    out.push('⑥ 神煞临运：'+shaLine);
    return out.join('。').replace(/（《[^）]*》）/g,'');
  }
  // 岁运应期断语：走断语库岁运类（太岁犯岁、冲克宫位、六亲并见、年龄运限），只取步触发条目。
  // ext={age,yunGz,yunLast} 由渲染层按 selMeta 实算传入；缺则相关字段为 null/false，条目自然不触发，不臆测。
  // 太岁诸条在 stepCtxOf 内仅流年层计算，大运/流月/流日天然不触发，杜绝串层。
  function yunSuiYunDuan(s, BZ, A, ext){
    if(typeof window==='undefined' || !window.matchDuanyuStep || !window.stepCtxOf) return '';
    let sc=null, list=[];
    try{ sc=window.stepCtxOf(s,BZ,ext); }catch(e){ return ''; }
    if(!sc) return '';
    try{ list=window.matchDuanyuStep('岁运',BZ,A,sc)||[]; }catch(e){ return ''; }
    // 按权重降序（重要断语优先输出），再进入跨层去重与截取
    list.sort((a, b) => ((b.w || 1) - (a.w || 1)));
    // 先按跨层去重集筛掉已述者，取够条数后才登记，避免被截断的条目被误标"已述"而在后续层永久消失
    const cand=[];
    list.forEach(x=>{ const t=(x.say||''); if(t && !saidDuan.has(t)) cand.push({t, s:x.src}); });
    const out=cand.slice(0,4).map(x=>{ saidDuan.add(x.t); return String(x.t).replace(/[。；]+$/,''); });
    if(out.length) return '① 岁运应期：'+out.join('；');
    // 无事件内容：四层一律列"无"（正答"①去哪里了"之疑）。事件类断语本论大运/流年之行运之体，
    // 流月只零星命中（冲克宫位/天合地合），流日天然不落事件；但 ①-⑥ 为固定维度轴编号，
    // 流月/流日缺号会从"②长生"起读，读者误以为漏了①；缺维统一补"无"占位，口径各层一致。
    return '① 岁运应期：无';
  }
  // ⑦ 分类应事（yunCatDuan）无独立维度：其 15 小类 step 条目为十神、纳音、长生、神煞的机制重述，
  // 已分别归入 ④、③、②、⑥ 固定维度；真实事件类（太岁、冲克宫位、六亲灾厄、年龄运限）走 ① 岁运应期。
  function mangKong(s){
    let kong=[]; try{ kong=kongOf(s.gz)||[]; }catch(e){ kong=[]; }
    if(!kong.length) return '';
    const hitP=BZ.zhis.map((z,i)=>kong.indexOf(z)>=0?['年柱','月柱','日柱','时柱'][i]:'').filter(Boolean);
    const gong=hitP.length?KONG_GONG[hitP[0]]:'';
    const kt=`落空亡（${kong.join('、')}）`+(gong?`，${hitP.join('、')}受空、${gong}`:'')+'，谋事宜扎实勿空悬';
    if(saidDuan.has(kt)) return ''; saidDuan.add(kt); return '；'+kt;
  }
  // 干支象（盲派灵魂）：天干十神象 + 地支本气十神象，主各自人事（段建业盲派重"象"）
  const TEN_IMAGE={'正官':'职位、权柄、上司','七杀':'压力、竞争、开拓','正财':'薪俸、正途之财','偏财':'外财、投资、众人之财','正印':'文书、学历、长辈','偏印':'偏门学识、证书','食神':'口才、才华、福气','伤官':'才艺、表现、名声','比肩':'同辈、兄弟、合作','劫财':'竞争、破耗、争夺'};
  function mangXiang(s, F){
    if(baziAgeStage(curAge)==='child') return '';   // 儿童不述成人象义（防"财官之事"落小儿）
    const g=s.gz[0], z=zhiMain(s.gz[1]);
    const iw=TEN_IMAGE[F.ganTen], iz=TEN_IMAGE[F.zhiTen];
    if(!iw&&!iz) return '';
    let o;
    if(F.ganTen===F.zhiTen&&iw) o=`；天干${g}、地支本气${z}皆为${F.ganTen}，主${iw}之事`;
    else o=(iw?`；天干${g}为${F.ganTen}，主${iw}之事`:'')+(iz?`；地支本气${z}为${F.zhiTen}，主${iz}之事`:'');
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return o;
  }
  // 墓库开闭（盲派特色）：岁运支逢财官之库，冲刑则库门洞开、库中物得用；未开则藏而待引
  function mangKu(s){
    const z=s.gz[1]; if(!['辰','戌','丑','未'].includes(z)) return '';
    const hid=HIDE[z]||[];
    const cai=hid.some(x=>{const t=tenGod(dg,x); return t==='正财'||t==='偏财';});
    const guan=hid.some(x=>{const t=tenGod(dg,x); return t==='正官'||t==='七杀';});
    if(!cai&&!guan) return '';
    const open=BZ.zhis.some(pz=>pairIn(z,pz,DIZHI_CHONG)||pairIn(z,pz,DIZHI_XING));
    const kw=cai&&guan?'财官':(cai?'财':'官');
    const o=open?`；支${z}为${kw}之库，逢冲刑库门洞开，库中${kw}得用、财官事有应`
                :`；支${z}为${kw}之库，库门未开，${kw}藏而待引，宜待冲开`;
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return o;
  }
  // 通根/虚透（盲派"虚透"概念）：该步天干在命局通根则力实，无根则气浮
  function mangRoot(s){
    const g=s.gz[0], gw=GAN_WX[g];
    const rootZ=BZ.zhis.filter(z=>(HIDE[z]||[]).some(x=>GAN_WX[x]===gw));
    if(!rootZ.length){
      const o=`；天干${g}虚透无根，气力浮泛，须岁运通根方实`;
      if(saidDuan.has(o)) return ''; saidDuan.add(o); return o;
    }
    return '';
  }
  function mangShaAll(s, F){
    const parts=[];
    // 吉神（仅本层新增）
    const sh=stepSha(s.gz);
    if(sh.length){
      const had=[]; underStack(s).forEach(o=>{ stepSha(o.gz).forEach(x=>{ if(had.indexOf(x)<0) had.push(x); }); });
      const segs=sh.filter(x=>had.indexOf(x)<0).map(x=>{ const m=shaMean(x); if(!m) return ''; return (x==='桃花'&&baziAgeStage(curAge)==='child'?'人缘':x)+'，'+m; }).filter(Boolean);
      if(segs.length) parts.push('新逢'+segs.join('；新逢'));
    }
    // 凶煞：羊刃 / 灾煞 / 劫煞（saidDuan 去重）
    const xiong=[];
    if(s.gz[1]===YANGREN[dg]) xiong.push('羊刃临运，财物易耗散、行事防凶灾破财，宜制刃守成');
    if(ZAI[BZ.yearZ]===s.gz[1]) xiong.push('带灾煞，防意外刑伤、血光之灾，出行谨慎');
    if(JIE[BZ.yearZ]===s.gz[1]) xiong.push('带劫煞，防财物劫夺、不测损耗');
    const xj=xiong.filter(x=>{ if(saidDuan.has(x)) return false; saidDuan.add(x); return true; });
    if(xj.length) parts.push(xj.join('；'));
    // 核心神煞补全（盲派重神煞）：红鸾/天喜（婚喜，非童）、将星/华盖（才能，非童）、血刃（血光，全龄）
    // 判据与全站一致：HONGLUAN 年日支查、将星华盖按年支三合局、血刃=羊刃对冲（bazi-data 同款）
    const stage=baziAgeStage(curAge);
    const JIANG={'申':'子','子':'子','辰':'子','寅':'午','午':'午','戌':'午','巳':'酉','酉':'酉','丑':'酉','亥':'卯','卯':'卯','未':'卯'};
    const GAI={'申':'辰','子':'辰','辰':'辰','寅':'戌','午':'戌','戌':'戌','巳':'丑','酉':'丑','丑':'丑','亥':'未','卯':'未','未':'未'};
    const coreSha=[];
    if(stage!=='child'){
      if(HONGLUAN[BZ.yearZ]===s.gz[1]||HONGLUAN[BZ.dayZ]===s.gz[1]) coreSha.push('红鸾临运，婚喜信号、缔缘之象');
      if(zhiOpp(HONGLUAN[BZ.yearZ])===s.gz[1]||zhiOpp(HONGLUAN[BZ.dayZ])===s.gz[1]) coreSha.push('天喜临运，喜事有应、家和事顺');
      if(JIANG[BZ.yearZ]===s.gz[1]) coreSha.push('将星临运，掌事得力、威望有增');
      if(GAI[BZ.yearZ]===s.gz[1]) coreSha.push('华盖临运，才思独运、宜静思深造');
    }
    if(zhiOpp(YANGREN[dg])===s.gz[1]) coreSha.push('血刃临运，防外伤血光、出行留意');
    // 禄（临官=禄，以日干查）
    const LU={'甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
    if(LU[dg]===s.gz[1]) coreSha.push('逢禄得禄，禄为财官之本，力有所归');
    const cj=coreSha.filter(x=>{ if(saidDuan.has(x)) return false; saidDuan.add(x); return true; });
    if(cj.length) parts.push(cj.join('；'));
    // 犯太岁（流年专属）
    if(F.ft&&F.ft.length){
      const ft=F.ft.join('、'); const items=[];
      if(/值/.test(ft)) items.push('值太岁（本命年），多主劳心费力、破耗增多、人事多磨');
      if(/冲/.test(ft)) items.push('冲太岁，多主居所变动、岗位更替、远行奔波');
      if(/刑/.test(ft)) items.push('刑太岁，多主口舌是非、健康多波折');
      if(/害/.test(ft)) items.push('害太岁，多主防人算计、人缘失和、财物暗耗');
      if(/破/.test(ft)) items.push('破太岁，多主破耗、关系失和、计划难成');
      if(items.length) parts.push(items.join('；')+'，凡事谨慎');
    }
    return parts.length?('；'+parts.join('；')):'';
  }
  // 盲派：做功方式（制>化>合>冲）+ 宾主（财官在宾位要去取；在主位是自身事）+ 宫位应事
  function mangZuo(s, F){
    const txt=[...F.mingRels.map(r=>r.rel), ...F.pairRels.map(r=>r.rel), ...F.special].join(' ');
    const zuo=/冲|刑|害/.test(txt)?'以冲刑害扫障、制去阻碍':/破/.test(txt)?'以相破冲开、破旧开新':/克/.test(txt)?'以天干相克、制而约束':/合/.test(txt)?'以合化引动或合绊留连、功细待引':/生/.test(txt)?'以生扶续气、非直接做功':'';
    const binRel=F.mingRels.find(r=>r.lab==='年柱'||r.lab==='月柱');
    const bin=binRel?(binRel.lab==='年柱'
      ?(baziAgeStage(curAge)==='child'?'功落宾位年柱，须借长辈之缘、家中有助':'功落宾位年柱，须往外去社会上取财官，多得长辈之缘')
      :(baziAgeStage(curAge)==='child'?'功落宾位月柱，须借父母之助、家中有援':'功落宾位月柱，须借父母兄弟之平台使力'))
      :(baziAgeStage(curAge)==='child'?'功落主位，应在自身、同学之事':'功落主位，应在自身、配偶、子女之事');
    return {zuo, bin};
  }
  // 盲派：非财官本位时，实算能否“借到”财官（支藏或与他柱合而带财官）
  function mangCanBorrow(s,F){ const z=s.gz[1]; const hid=HIDE[z]||[]; const hasCaiGuan=hid.some(x=>{const t=tenGod(dg,x); return t==='正财'||t==='偏财'||t==='正官'||t==='七杀';}); const heCG=(F.mingRels.concat(F.pairRels)).some(r=>/合/.test(r.rel)&&/财|官/.test(r.rel)); return hasCaiGuan||heCG; }
  // 内部枚举→可读词（避免 mix 等枚举值泄漏进用户文案）
  const CN_WORD={'喜':'得力','忌':'受扰','中':'平','mix':'喜忌相参'};
  const GE_WORD={'喜':'得力','忌':'受扰','中':'平','mix':'力半'};
  // 格局派：用神五行集合（由十神类反查四柱天干所属五行）+ 相神清浊
  function yongShenWx(){ const set=new Set(); geUseXiCats.forEach(cat=>{ BZ.gans.forEach(g=>{ if(shenCat(tenGod(dg,g))===cat) set.add(GAN_WX[g]); }); }); return set; }
  function xiangShenQing(){ const wxSet=yongShenWx(); if(!wxSet.size) return '未明、格待岁运引出'; let tou=0,youGen=0,he=0; BZ.gans.forEach((g,i)=>{ if(wxSet.has(GAN_WX[g])){ tou++; const z=BZ.zhis[i]; if(GAN_WX[zhiMain(z)]===GAN_WX[g]||(HIDE[z]||[]).some(x=>GAN_WX[x]===GAN_WX[g])) youGen++; if(ganRelations([g,BZ.gans[(i+1)%4]],BZ).some(r=>/合/.test(r.text))) he++; } }); if(tou&&youGen&&!he) return '透干得力、格清'; if(he) return '被合羁绊、格带浊'; if(tou&&!youGen) return '虚浮无根、格带浊'; return '未透、格待岁运引出'; }
  // 调候派：调候字状态（透干/坐支强根）+ 季节权重（冬夏权重最高、春秋退居辅助）
  function tiaoState(){ const wx=A.tiao.wx; let tou=0,gen=0; BZ.gans.forEach((g,i)=>{ if(GAN_WX[g]===wx){ tou++; const z=BZ.zhis[i]; if(GAN_WX[zhiMain(z)]===wx||(HIDE[z]||[]).some(x=>GAN_WX[x]===wx)) gen++; } }); if(tou&&gen) return '调候真得（透干坐强根）'; if(tou&&!gen) return '调候得半字（虚透无根）'; if(!tou) return '调候失度（原局不现）'; return '调候待岁运'; }
  function tiaoWeight(){ return (season==='冬'||season==='夏')?'调候权重最高、舒蹇全系于此':''; }
  function stripParen(t){ return String(t||'').replace(/（[^）]*）/g,'').trim(); }
  function fGe(s, F){ // 格局派：成格破格 + 相神清浊 + 救应 + 顺逆用（天干地支分判）
    const v=geVect(s.gz), tag=geTag(v), up=upperOf(s); let x='';
    const ux=stripParen(A.geUse.xi)||'用神', uj=stripParen(A.geUse.ji)||'忌神';
    if(!up){
      if(tag==='喜') x+=`${s.gz}引动格局用神${ux}，用神得力`+(baziAgeStage(curAge)==='child'?'、根基得养、宜顺护成长之机':'');
      else if(tag==='忌'){ x+=`${s.gz}触及格局忌神${uj}，用神受扰、恐有破格之虞`; x+= F.mingRels.some(r=>/生|合/.test(r.rel))?'；然宫位有生合之救，破格有救、格成而带疾':'；救神不显，破格无救、宜守成避锋'; }
      else if(tag==='mix') x+=`${s.gz}${(v.g==='喜')?'天干为用神而地支犯忌':'天干犯忌而地支为用神'}，格成而力半，用神得力处可进、忌神引动处宜防`;
      else x+=`${s.gz}与用神无大引动，仍以原局定调，宜守常勿妄动`;
    }else{
      x+=selfVerdictOf('子平格局派', s, tag);
      if(tag==='忌' && F.mingRels.some(r=>/生|合/.test(r.rel))) x+='；然宫位有生合之救、破格有救';
      x+=pairVerdict(s,F,'子平格局派')+pairFix(s,'子平格局派', tag);
    }
    x+=yueStabInc(s,F);
    // ---- 格局派补充（《子平真诠》维度补全）----
    x+=geYongHeChong(s);   // P1-① 岁运用神被合/被冲（格局大忌）
    x+=geXiangShen(s);     // P2-③ 相神护用（本层之气生用神方）
    x+=geQingZhuo(s, tag); // P2-④ 清浊随岁运（浊得清/清受扰）
    if(s.lvl==='流月') x+=geYueLing(s);   // P1-② 流月值月令（月令本气对格局损益）
    x+=geOuterClause(s, tag);             // P3-⑤ 外格顺逆
    if(s.lvl==='流日') x+=`（天干${s.gz[0]}为${F.ganTen}、地支本气${zhiMain(s.gz[1])}为${F.zhiTen}）`;  // P3-⑥ 流日点名十神
    return x+'。';
  }
  // P1-① 用神被合/被冲：命局用神字（天干/地支本气属用神十神类）被该步合走或冲根 → 格局派岁运大忌
  function geYongHeChong(s){
    if(!geUseXiCats.length) return '';
    const xiC=[], xiZ=[];
    BZ.gans.forEach(g=>{ if(geUseXiCats.includes(shenCat(tenGod(dg,g)))) xiC.push(g); });
    BZ.zhis.forEach(z=>{ if(geUseXiCats.includes(shenCat(tenGod(dg, zhiMain(z))))) xiZ.push(z); });
    const out=[];
    xiC.forEach(g=>{ if(tianGanHe(s.gz[0], g)) out.push(`用神${g}被合去、失用`); });
    xiZ.forEach(z=>{
      if(pairIn(s.gz[1], z, DIZHI_HE6)) out.push(`支${s.gz[1]}合用神之根${z}，用神被绊`);
      if(pairIn(s.gz[1], z, DIZHI_CHONG)) out.push(`支${s.gz[1]}冲用神之根${z}，用神根动、防破格`);
    });
    if(!out.length) return '';
    const o=out.filter(x=>{ if(saidDuan.has(x)) return false; saidDuan.add(x); return true; });
    return o.length?('；'+o.join('；')):'';
  }
  // P2-③ 相神护用：本层之气生用神五行（WX_SHENG 我生）→ 相神得助
  function geXiangShen(s){
    const wset=yongShenWx(); if(!wset.size) return '';
    const sw=GAN_WX[s.gz[0]], zw=ZHI_WX[s.gz[1]];
    if(![...wset].some(w=>WX_SHENG[sw]===w||WX_SHENG[zw]===w)) return '';
    const o=`${s.lvl}之气生用神之方，相神得助`;
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return '；'+o;
  }
  // P2-④ 清浊随岁运：本命格浊而引喜→得清层次可提；本命格清而引忌→受扰层次受损
  function geQingZhuo(s, tag){
    const clean=/清/.test(A.geQing)&&!/浊/.test(A.geQing);
    const turbid=/浊/.test(A.geQing)&&!/清/.test(A.geQing);
    let o='';
    if(turbid&&tag==='喜') o=`本命格带浊，${s.lvl}引喜、格浊得清，层次可提`;
    else if(clean&&tag==='忌') o=`本命格清，${s.lvl}引忌、清格受扰，宜防层次受损`;
    if(!o) return '';
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return '；'+o;
  }
  // P1-② 流月值月令：流月地支即当月月令，看其本气十神对格局用/忌的损益（格局派以月令为纲）
  function geYueLing(s){
    const mz=s.gz[1]; const mt=shenCat(tenGod(dg, zhiMain(mz)));
    let o='';
    if(geUseXiCats.includes(mt)) o=`值${mz}月，月令本气为${mt}（用神之方），用神得令、顺而有成`;
    else if(geUseJiCats.includes(mt)) o=`值${mz}月，月令本气为${mt}（忌神之方），用神受制、宜守勿进`;
    else o=`值${mz}月，月令本气为${mt}，与用神无涉、仍依原局`;
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return '；'+o;
  }
  // P3-⑤ 外格顺逆：从/专旺/化气/两气，顺其势则成、逆其气则破
  function geOuterClause(s, tag){
    const gn=A.geName||'';
    if(!/从|专旺|化气|两气/.test(gn)) return '';
    const o= tag==='喜'?`外格顺用，${s.lvl}引从神化神旺地，成格可期`
            : tag==='忌'?`外格忌逆用，${s.lvl}扶起日主或逆其气，恐有破格之虞、宜慎`
            : `${s.lvl}顺逆不显，随其气而行`;
    if(saidDuan.has(o)) return ''; saidDuan.add(o);
    return '；'+o;
  }
  function fMang(s, F){ // 盲派：做功方式 + 宾主 + 宫位应事（神煞、长生真看重）
    const zg=mangZuo(s,F), tag=mangXi(s.gz)?'喜':'中', up=upperOf(s); let x='';
    const zuoTxt=zg.zuo?zg.zuo+'，':'';
    if(!up){
      if(tag==='喜') x+=`${s.gz}见财官、做功直接，${zuoTxt}${zg.bin}`;
      else { const borrow=mangCanBorrow(s,F); x+=`${s.gz}非财官本位，${zuoTxt}做功偏浅，${borrow?'支中藏财官、可借合化引出，宜顺势接财官':'财官难借、宜踏实积累、勿贪快'}；${zg.bin}`; }
    }else{
      const uz=mangZuo(up, stepFacts(up));
      x+=selfVerdictOf('盲派', s, tag);
      if(zg.zuo&&zg.zuo!==uz.zuo) x+=`；做功之法转为${zg.zuo}`;
      if(zg.bin&&zg.bin!==uz.bin) x+=`；${zg.bin}`;
      x+=pairVerdict(s,F,'盲派')+pairFix(s,'盲派', tag);
    }
    x+=mangShaAll(s,F)+csClauseInc(s,F,tag)+mangNayin(F)+mangKong(s)+mangXiang(s,F)+mangKu(s)+mangRoot(s);
    return x+'。';
  }
  function fTiao(s, F){ // 调候派：寒暖燥湿 + 调候字状态；不堆神煞、不抢具体事件应期
    const tag=tagBy(s.gz, tiaoXi, tiaoJi), up=upperOf(s); let x='';
    if(!up){
      if(tag==='中') x+=`${s.gz}于寒暖燥湿无大碍，顺原局`;
      else { x+= tag==='喜'?`${s.gz}逢调候用神${A.tiao.wx}，寒暖燥湿得济、调候之急得解，身心舒坦、谋事顺`:`${s.gz}克调候之药${A.tiao.wx}，调候受损、寒热偏颇加重，健康情绪宜调护`; x+=(tiaoWeight()?('；'+tiaoWeight()):''); }
    }else{
      x+=selfVerdictOf('调候派', s, tag);
      x+=pairVerdict(s,F,'调候派')+pairFix(s,'调候派', tag);
    }
    x+=yueLingOf('调候派', s);
    return x+'。';
  }
  // 新派：天干、地支本气分判扶抑方向（一顺一逆不可硬塞一结论）
  function dirOf(t){ const c=shenCat(t); return xiSet.has(c)?'喜':(jiSet.has(c)?'忌':'中'); }
  function xinComb(gd,zd){ if(gd==='喜'&&zd==='喜')return '喜'; if(gd==='忌'&&zd==='忌')return '忌'; if((gd==='喜'&&zd==='忌')||(gd==='忌'&&zd==='喜'))return 'mix'; return (gd==='喜'||zd==='喜')?'喜':(gd==='忌'||zd==='忌')?'忌':'中'; }
  function fXin(s, F){ // 新派（民国）：十神旺衰直断 + 盘面出处式（点名哪几个字）+ 弃神煞纳音
    const g=s.gz[0], z=zhiMain(s.gz[1]), strong=A.strength.indexOf('弱')<0;
    const tc=tenCat(s.gz), gd=dirOf(tc.g), zd=dirOf(tc.z), up=upperOf(s); let x=`${s.gz}天干${g}为${F.ganTen}、地支本气${z}为${F.zhiTen}，`;
    function eff(dir){ if(dir==='喜') return strong?'耗泄':'增益'; if(dir==='忌') return strong?'增益':'耗泄'; return '无大损益'; }
    if(!up){
      const gx=`天干${g}${gd==='喜'?'为扶抑所喜、'+eff(gd)+'日主':gd==='忌'?'为扶抑所忌、'+eff(gd)+'日主':'动静相参、日主无大变'}`;
      const zx=`地支本气${z}${zd==='喜'?'为扶抑所喜、'+eff(zd)+'日主':zd==='忌'?'为扶抑所忌、'+eff(zd)+'日主':'动静相参、日主无大变'}`;
      if(gd==='喜'&&zd==='喜') x+=`二者皆喜，${eff('喜')}日主、扶抑得宜、日主趋衡，精力足、谋事顺`;
      else if(gd==='忌'&&zd==='忌') x+=`二者皆忌，${eff('忌')}日主、扶抑失当、日主愈偏，宜静守、防过犹不及`;
      else if(gd==='喜'&&zd==='忌') x+=`${gx}；${zx}，一顺一逆、喜忌相参`;
      else if(gd==='忌'&&zd==='喜') x+=`${gx}；${zx}，一逆一顺、喜忌相参`;
      else if(gd==='喜') x+=`${gx}，${eff('喜')}日主、扶抑得宜，日主趋衡`;
      else if(zd==='喜') x+=`${zx}，${eff('喜')}日主、扶抑得宜，日主趋衡`;
      else if(gd==='忌') x+=`${gx}，${eff('忌')}日主、扶抑失当，宜静守`;
      else if(zd==='忌') x+=`${zx}，${eff('忌')}日主、扶抑失当，宜静守`;
      else x+=`天干地支皆动静相参、日主无大变，宜常`;
    }else{
      const cn=xinComb(gd,zd);
      x+=selfVerdictOf('新派（民国）', s, cn);
      x+=pairVerdict(s,F,'新派（民国）')+pairFix(s,'新派（民国）', cn);
    }
    // 流月值月令（月令司权对旺衰的微调）
    x+=yueLingOf('新派（民国）', s);
    // 身弱遇财（旺衰视角，非儿童期）
    if(!strong && baziAgeStage(curAge)!=='child'){ const t2=tenCat(s.gz); if(shenCat(t2.g)==='财星'||shenCat(t2.z)==='财星') x+='；身弱遇财运，为钱财奔波劳心，宜量力而谋'; }
    return x+'。';
  }
  function fBing(s, F){ // 病药派：偏枯救药；神煞、长生与偏枯无关，不堆
    const hy=bingXi(s.gz), hb=bingJi(s.gz);
    const tag=(hy&&!hb)?'喜':((hb&&!hy)?'忌':'中'), up=upperOf(s); let x='';
    if(!up){
      if(hy&&!hb) x+=`${s.gz}引药神${A.bingYao.yao}、偏枯得解、诸事顺遂，困局渐解、改观可期`;
      else if(hb&&!hy) x+=`${s.gz}再逢病神${A.bingYao.bing}、偏枯更甚、宜制化宜避，偏枯之患易显`;
      else if(hy&&hb) x+=`${s.gz}病药同见、制中有生、吉凶相抵，宜权衡`;
      else x+=`${s.gz}与病药无大引动，仍看原局偏枯`;
    }else{
      x+=selfVerdictOf('病药派', s, tag);
      x+=pairVerdict(s,F,'病药派')+pairFix(s,'病药派', tag);
    }
    x+=yueLingOf('病药派', s);
    return x+'。';
  }

  const geLevelSays = (A.geLevel.indexOf('破格')>=0) ? '此局用神虚浮受破、格局已破，宜制化破格之力、借岁运扶用神方有转机。'
    : (A.geLevel.indexOf('特殊格')>=0) ? `此局为${A.geName}（特殊格），一气专凝、须顺其势，破格之患在岁运逆其势。`
    : (A.geLevel.indexOf('清纯')>=0) ? '此局成格清纯，成败全在用神是否被岁运引动。'
    : (A.geLevel.indexOf('半成格')>=0) ? '此局用神仅半透，格局半成，须岁运引出方全。'
    : '此局用神未透，格局待成，须岁运引动方立。';
  // 盲派“做功”明确结论（不写“得力则…无力则…”空话）：财官透干/有根且日主可担则做功得力
  const dgM=BZ.dayGan;
  const caiTouM=BZ.gans.filter(g=>{const t=tenGod(dgM,g);return t==='正财'||t==='偏财';});
  const guanTouM=BZ.gans.filter(g=>{const t=tenGod(dgM,g);return t==='正官'||t==='七杀';});
  const caiGuanTouM=caiTouM.length+guanTouM.length;
  const caiGuanRootM=BZ.zhis.filter(z=>{const h=HIDE[z]||[];return h.some(x=>{const t=tenGod(dgM,x);return t==='正财'||t==='偏财'||t==='正官'||t==='七杀';});});
  const mangCanHold=A.strength.indexOf('弱')<0;
  const mangDone=(caiGuanTouM>0||caiGuanRootM.length>0)&&mangCanHold;
  // 格局白话字典 + 用神白话：专业术语后跟大白话（解说层）
  const GE_BAI = {
    '羊刃格': '羊刃为日主旺极之位，主刚烈果决、性急敢为，过旺如无制则易刚愎冲动、招祸。',
    '建禄格': '日主得月令本气禄神，身强有根、精力充固。',
    '七杀格': '七杀为克身之官、性烈威重，成格则权威果决、能开创，无制则攻身太过。',
    '正官格': '正官为克身之正、性正循规，成格则端庄守法、有地位。',
    '食神格': '食神为日主所生、性宽和吐秀，成格则才思流淌、福泽绵长。',
    '伤官格': '伤官为日主所生而克官、性聪颖傲物，成格则才气纵横。',
    '正财格': '正财为日主所克、性务实守成，成格则勤恳聚财、家业安稳。',
    '偏财格': '偏财为日主所克之偏、性灵动善变，成格则外财机遇多、慷慨有风。',
    '偏印格': '偏印为生日主之偏、性冷峻多思，成格则善钻研、有特异之能。',
    '正印格': '正印为生日主之正、性仁厚护养，成格则得长辈荫庇、学业有靠。',
    '劫财格': '劫财与日主同气而异名、性刚烈争竞，成格则朋侪相助亦防分夺。',
    '比肩格': '比肩与日主同根、性平实互助，成格则手足同心、自力可恃。'
  };
  function geBaiOf(A){
    if(A.isZaGe) return (A.geZaGeNote?A.geZaGeNote.slice(0, A.geZaGeNote.indexOf('。')+1):'')||`以${A.geName}立格，日柱、时柱特殊格局，自成一体。`;
    if(GE_BAI[A.geName]) return GE_BAI[A.geName];
    if(A.geOuter && A.geOuterNote) return A.geOuterNote;
    return `以${A.geName}立格，用神为格局成败之关键。`;
  }
  const schools=[
    {name:'子平格局派', useSha:false, base:`本命以${A.geName}立格。${geBaiOf(A)}用神取${A.geUse.xi}、所忌${A.geUse.ji||'未明'}。行运宜顺用神之势：遇用神旺之大运流年则格局得力、诸事顺遂，遇忌神破格之运则宜守成、防根基动摇。${geLevelSays}相神${xiangShenQing()}。`, f:fGe},
    {name:'盲派', useSha:true, base:`重心法“做功”：本局${mangDone?'财官透干（或地支有根）、日主可担，做功得力、富贵可期':'财官虚浮无根、或日主偏弱，做功乏力、劳而少得，宜踏实积累、待岁运引出财官方见成效'}；能制化财官、为我所用，方是真得。`, f:fMang},
    {name:'调候派', useSha:false, base:`${season}生人，寒暖燥湿之偏以${A.tiao.wx}为${kXi('调候')}用神，调候之急为${tiaoGrade}；调候字状态：${tiaoState()}${tiaoWeight()?('，'+tiaoWeight()):''}；调候得宜则舒坦，失宜则乖蹇。`, f:fTiao},
    {name:'新派（民国）', useSha:false, base:`日主${A.strength}（旺衰评分 ${A.score.toFixed(1)}），扶抑以${fuXi.join('、')}为${kXi('喜')}、以${fuJi.join('、')||'无明忌'}为${kJi('忌')}；日主得衡则吉、失衡则凶。`, f:fXin},
    {name:'病药派', useSha:false, base:`偏枯之${kJi('病')}在${A.bingYao.bing}、救偏之${kXi('药')}在${A.bingYao.yao}。${A.structDisease&&A.structDisease.length?('本局结构'+kJi('病')+'：'+(A.structDisease.filter(d=>d.kind==='病').map(d=>d.rel).join('、')||'无')+'，结构'+kXi('药')+'：'+(A.structDisease.filter(d=>d.kind==='药').map(d=>d.rel).join('、')||'无')+'。'):'运岁引药则解、引病则重。'}`, f:fBing},
  ];
  // 单干支：五派对该步的喜、忌判定（与本命基调同源，但落到所选干支）
  function verdictOf(sc, s){ const tc=tenCat(s.gz); const gCat=shenCat(tc.g), zCat=shenCat(tc.z); const w=GAN_WX[s.gz[0]], zw=ZHI_WX[s.gz[1]];
    if(sc.name==='子平格局派'){ const v=geVect(s.gz); if(v.g==='喜'&&v.z==='喜') return '喜'; if(v.g==='忌'&&v.z==='忌') return '忌'; if((v.g==='喜'&&v.z==='忌')||(v.g==='忌'&&v.z==='喜')) return '中'; return (v.g==='喜'||v.z==='喜')?'喜':(v.g==='忌'||v.z==='忌')?'忌':'中'; }
    if(sc.name==='盲派'){ if(gCat==='财星'||gCat==='官杀'||zCat==='财星'||zCat==='官杀') return '喜'; return '中'; }
    if(sc.name==='调候派'){ if(w===A.tiao.wx||zw===A.tiao.wx) return '喜'; if(WX_KE[w]===A.tiao.wx||WX_KE[zw]===A.tiao.wx) return '忌'; return '中'; }
    if(sc.name==='新派（民国）'){ const t=tc.tag; if(t.indexOf('喜')>=0&&t.indexOf('忌')>=0) return '中'; if(t==='喜'||t==='喜喜') return '喜'; if(t==='忌'||t==='忌忌') return '忌'; return '中'; }
    if(sc.name==='病药派'){ const hitB=(w===A.bingYao.bing)||(zw===A.bingYao.bing); const hitY=(w===A.bingYao.yao)||(zw===A.bingYao.yao); if(hitB&&!hitY) return '忌'; if(hitY&&!hitB) return '喜'; return '中'; }
    return '中';
  }
  // 各派"自身判定句"：该层干支引动本派关注点→主调（四层通用；有上层时取代承转句）
  function selfVerdictOf(scName, s, tag){
    const g=s.gz[0], z=zhiMain(s.gz[1]);
    const tc=tenCat(s.gz), gc=shenCat(tc.g), zc=shenCat(tc.z);
    switch(scName){
      case '子平格局派': {
        const xi=[], ji=[];
        if(geUseXiCats.indexOf(gc)>=0) xi.push(gc);
        if(geUseXiCats.indexOf(zc)>=0 && xi.indexOf(zc)<0) xi.push(zc);
        if(geUseJiCats.indexOf(gc)>=0) ji.push(gc);
        if(geUseJiCats.indexOf(zc)>=0 && ji.indexOf(zc)<0) ji.push(zc);
        if(tag==='喜'&&xi.length) return `${s.gz}引动格局用神${xi.join('、')}，用神得力`;
        if(tag==='忌'&&ji.length) return `${s.gz}引动忌神${ji.join('、')}，用神受扰、恐有破格之虞`;
        if(tag==='mix') return `${s.gz}天干${g}（${gc}）、地支本气${z}（${zc}），一喜一忌、喜忌相参`;
        return `${s.gz}与用神无涉，主调平顺`;
      }
      case '盲派': {
        const cg=(gc==='财星'||gc==='官杀')?tc.g:'', cz=(zc==='财星'||zc==='官杀')?tc.z:'';
        const child=baziAgeStage(curAge)==='child';
        const inf=baziInfant(curAge);
        if(tag==='喜'){ const wx=cg||cz;
          return child?(inf?`${s.gz}见财官（${wx}），财官杀动、利成长启蒙`:`${s.gz}见财官（${wx}），财官杀动、利课业功名`):`${s.gz}见财官（${wx}），财官得引、事有可谋`;
        }
        return child?(inf?`${s.gz}不见财官，根基如常`:`${s.gz}不见财官，课业如常`):`${s.gz}不见财官，财官不显`;
      }
      case '调候派': {
        if(tag==='喜') return `${s.gz}引调候${A.tiao.wx}，寒暖得济`;
        if(tag==='忌') return `${s.gz}逆调候、寒暖失度`;
        return `${s.gz}与调候无涉，寒暖如常`;
      }
      case '新派（民国）': {
        const strong=A.strength.indexOf('弱')<0;
        function eff2(dir){ if(dir==='喜') return strong?'耗泄':'增益'; if(dir==='忌') return strong?'增益':'耗泄'; return '无大损益'; }
        const gd2=dirOf(tc.g), zd2=dirOf(tc.z);
        const gx=`天干${g}${gd2==='喜'?'为扶抑所喜、'+eff2(gd2)+'日主':gd2==='忌'?'为扶抑所忌、'+eff2(gd2)+'日主':'动静相参、日主无大变'}`;
        const zx=`地支本气${z}${zd2==='喜'?'为扶抑所喜、'+eff2(zd2)+'日主':zd2==='忌'?'为扶抑所忌、'+eff2(zd2)+'日主':'动静相参、日主无大变'}`;
        if(gd2==='喜'&&zd2==='喜') return `二者皆喜，日主${eff2('喜')}、扶抑得宜、日主趋衡`;
        if(gd2==='忌'&&zd2==='忌') return `二者皆忌，日主${eff2('忌')}、扶抑失当、日主愈偏，宜静守`;
        if(gd2==='喜'&&zd2==='忌') return `${gx}；${zx}，一顺一逆、喜忌相参`;
        if(gd2==='忌'&&zd2==='喜') return `${gx}；${zx}，一逆一顺、喜忌相参`;
        if(gd2==='喜') return `${gx}，日主${eff2('喜')}、扶抑得宜，日主趋衡`;
        if(zd2==='喜') return `${zx}，日主${eff2('喜')}、扶抑得宜，日主趋衡`;
        if(gd2==='忌') return `${gx}，扶抑失当，宜静守`;
        if(zd2==='忌') return `${zx}，扶抑失当，宜静守`;
        return `天干地支皆动静相参、日主无大变，宜常`;
      }
      case '病药派': {
        if(tag==='喜') return `${s.gz}引药神${A.bingYao.yao}，偏枯得解`;
        if(tag==='忌') return `${s.gz}引病神${A.bingYao.bing}，偏枯加重`;
        return `${s.gz}病药两无所引`;
      }
      default: return '';
    }
  }
  // 流月"值月令"：月令司权，当月五行旺衰随月令流转（调候看季节、新派看生扶克泄、病药看助病助药；格局已有 geYueLing、盲派不作月令论）
  function yueLingOf(scName, s){
    if(s.lvl!=='流月') return '';
    const z=s.gz[1];
    switch(scName){
      case '调候派': {
        const season={'寅':'春','卯':'春','辰':'春','巳':'夏','午':'夏','未':'夏','申':'秋','酉':'秋','戌':'秋','亥':'冬','子':'冬','丑':'冬'}[z];
        if(season==='冬') return `；值${z}月寒气当令，调候${A.tiao.wx}尤为要紧`;
        if(season==='夏') return `；值${z}月燥气当令，调候之水尤为要紧`;
        return '';
      }
      case '新派（民国）': {
        const mt=shenCat(tenGod(dg, zhiMain(z)));
        const strong=A.strength.indexOf('弱')<0;
        const sheng=(mt==='印星'||mt==='比劫');
        if(strong&&sheng) return `；值${z}月，月令${mt}当令生扶日主，身强再扶、旺势更盛，宜防过亢`;
        if(!strong&&!sheng) return `；值${z}月，月令${mt}当令克泄日主，日主更衰，宜防`;
        if(strong&&!sheng) return `；值${z}月，月令${mt}当令克泄日主，日主得衡`;
        return `；值${z}月，月令${mt}当令生扶日主，日主得扶`;
      }
      case '病药派': {
        const mw=ZHI_WX[z];
        if(mw===A.bingYao.bing) return `；值${z}月，月令${mw}气当令助病，药力须待岁运`;
        if(mw===A.bingYao.yao) return `；值${z}月，月令${mw}气当令助药，偏枯得缓`;
        return '';
      }
      default: return '';
    }
  }
  // 上层喜忌修正（描述式四态 + 更高层折冲）；本层为中（含 mix 归中）不出修正句
  function pairFix(s, scName, cur){
    if(cur!=='喜'&&cur!=='忌') return '';
    const up=upperOf(s); if(!up) return '';
    const ut=verdictOf({name:scName}, up), u=`${up.lvl}${up.gz}`;
    const parts=[];
    if(ut==='喜'||ut==='忌'){
      if(ut===cur) parts.push(`与${u}同${cur==='喜'?'喜':'忌'}，${cur==='喜'?'吉气相连、事顺可期':'凶气相连、宜守勿进'}`);
      else parts.push(`逢${cur==='喜'?'喜':'忌'}而${u}之${ut==='喜'?'喜':'忌'}在，${cur==='喜'?'喜中带滞、宜稳进':'凶中带缓、仅防小碍'}`);
    }
    const higher=(sel||[]).filter(o=>o!==s && o!==up && LV[o.lvl]<LV[s.lvl]);
    if(higher.length && (ut==='中'||ut===cur)){
      const opp=higher.filter(o=>{const t=verdictOf({name:scName},o); return t!=='中'&&t!==cur;});
      if(opp.length){
        const labs=opp.map(o=>o.lvl).join('、');
        parts.push(cur==='喜'?`然${labs}之忌在，喜力受制、宜稳进`:`然${labs}之喜在，凶中带缓、仅防小碍`);
      }
    }
    return parts.length?('；'+parts.join('；')):'';
  }
  function tally(s){ const v=schools.map(sc=>({n:sc.name, r:verdictOf(sc,s)})); return {v, xi:v.filter(x=>x.r==='喜').map(x=>x.n), ji:v.filter(x=>x.r==='忌').map(x=>x.n), mid:v.filter(x=>x.r==='中').map(x=>x.n)}; }
  // 共识与分歧：当前分布名单一次（单派"仅X"、多派"N派判X：名单"，禁括号包名单）+ 主调分析（较上层主调：仍/转；无上层：在）
  function mainOf(t){ const n=t.xi.length, j=t.ji.length, m=t.mid.length;
    if(n>=3) return '喜'; if(j>=3) return '忌'; if(m>=3) return '平'; return ''; }
  function gongChaOf(v, X, upMain){
    const xi=v.filter(x=>x.r==='喜').map(x=>x.n), ji=v.filter(x=>x.r==='忌').map(x=>x.n), mid=v.filter(x=>x.r==='中').map(x=>x.n);
    const n=xi.length, j=ji.length, m=mid.length;
    if(n===5) return `五派一致判${X}为日主所喜，共识明确`;
    if(j===5) return `五派一致判${X}为日主所忌，共识明确`;
    if(m===5) return `五派一致判${X}为平，无喜忌分歧`;
    const list=[];
    if(n===1) list.push(`仅${xi[0]}判喜`);
    else if(n) list.push(`${n}派判喜：${xi.join('、')}`);
    if(j===1) list.push(`仅${ji[0]}判忌`);
    else if(j) list.push(`${j}派判忌：${ji.join('、')}`);
    if(m===1) list.push(`仅${mid[0]}判平`);
    else if(m) list.push(`${m}派判平：${mid.join('、')}`);
    let t=list.join('；');
    const cur=mainOf({xi,ji,mid});
    if(cur){ if(upMain&&upMain!==cur) t+=`；主调由${upMain}转${cur}`; else if(upMain&&upMain===cur) t+=`；主调仍${cur}`; else t+=`；主调在${cur}`; }
    else t+=(n===j?'；喜忌相当、宜辨主次':'；主调不明、宜辨主次');
    return t;
  }
  // 分歧根源：子平（格局成败）与新派（旺衰扶抑）视角相左时，判定相反属方法论差异，短注点明
  function viewNoteOf(v){ const gp=v.find(x=>x.n==='子平格局派'), xp=v.find(x=>x.n==='新派（民国）');
    if(gp&&xp&&gp.r!=='中'&&xp.r!=='中'&&gp.r!==xp.r) return '（格局与扶抑视角相左故相反）'; return ''; }
  function consensusOf(s){ const up=upperOf(s);
    if(up){ const cu=tally(s), ut=tally(up), u=`${up.lvl}${up.gz}`;
      // 本层五派判定与上层全同：不重复名单，依上一层结论（名单/主调已在上层给出）
      if(cu.v.every((x,i)=>x.r===ut.v[i].r)) return `五派判定与${u}全同、无新变，仍依上一层结论。`;
      const vn=viewNoteOf(cu.v);
      return gongChaOf(cu.v, s.gz, mainOf(ut))+(vn?vn:'')+'。';
    }
    const v=schools.map(sc=>({n:sc.name, r:verdictOf(sc,s)}));
    const vn=viewNoteOf(v);
    return gongChaOf(v, s.gz, '')+(vn?vn:'')+'。';
  }
  // 人生四议：各流派对 事业财运 / 婚姻感情 / 家庭子女 / 性格健康 的精读（数据驱动，落到真实十神、宫位、神煞、关键事件）
  const AREA_CATS={'事业财运':['财星','官杀'],'婚姻感情':['财星','官杀'],'家庭子女':['印星','食伤'],'性格健康':['比劫','印星']};
  const GONG_PLAIN=['长辈祖上','父母兄弟同辈','配偶婚姻','子女晚辈'];
  const AREA_SHA={ '事业财运':['文昌','驿马','将星','华盖'], '婚姻感情':['桃花','红鸾','天喜','孤辰','寡宿','阴差阳错','咸池'], '家庭子女':['文昌','学堂','天厨','子女'], '性格健康':['羊刃','血刃','病符','劫煞','灾煞'] };
  // 各流派解读运势：每流派先给“流派视角”（sc.base / sc.f 已承载），再据此预判人生四议之方面与事件。
  // 按宫位（本命）或喜忌（岁运所选步）聚合，一句话交代完全，不复述前面面板已列事实。
  const AREA_SHORT={'事业财运':'事业','婚姻感情':'婚姻','家庭子女':'家宅','性格健康':'身心'};
  // 每领域关键事件：按“流派视角”取词（格局讲用神成败、盲派讲做功、调候讲寒暖、新派讲旺衰扶抑、病药讲偏枯救药），
  // 即便两派同判喜忌，措辞也因视角不同而各异，杜绝“五派后半段几乎一样”的问题。
  const AREA_EVENTS={
    '子平格局派':{
      '事业财运':{喜:'用神得力、事业顺遂有成',忌:'用神受冲、事业易破格生变',中:'用神无引动、事业守常'},
      '婚姻感情':{喜:'用神不损、婚姻和美',忌:'用神受损、婚姻易生波折',中:'格局无扰、感情如常'},
      '家庭子女':{喜:'格局安稳、家宅宁顺、子女缘厚',忌:'格局不稳、家宅或子女缘易生波折',中:'格局平稳、家宅如常'},
      '性格健康':{喜:'格局纯粹、心性舒展',忌:'格浊神乱、心性易执、健康宜调护',中:'格局无乱、心性平稳'}
    },
    '盲派':{
      '事业财运':{喜:'财官得用、进益可期',忌:'做功受损、宜守',中:'做功平平、宜踏实积累'},
      '婚姻感情':{喜:'财官成婚、配偶得力',忌:'财官受损、婚姻宜稳',中:'财官不显、婚姻宜稳'},
      '家庭子女':{喜:'做功有靠、家宅安稳',忌:'做功失据、家宅宜稳',中:'做功平平、家宅如常'},
      '性格健康':{喜:'日主可担、身心得养',忌:'日主难担、精力宜调护',中:'做功平和、精力如常'}
    },
    '调候派':{
      '事业财运':{喜:'寒暖得宜、事业舒坦有成',忌:'寒热偏颇、事业易乖蹇',中:'寒暖无碍、事业依原局定调'},
      '婚姻感情':{喜:'调候得宜、感情和顺',忌:'调候失宜、感情宜稳',中:'寒暖无偏、感情如常'},
      '家庭子女':{喜:'燥湿得平、家宅宁顺',忌:'燥湿失平、家宅易生波折',中:'燥湿无偏、家宅如常'},
      '性格健康':{喜:'寒暖调和、身心得养',忌:'寒热偏枯、健康宜调护',中:'寒暖平顺、身心如常'}
    },
    '新派（民国）':{
      '事业财运':{喜:'日主得助、事业顺遂',忌:'日主失衡、谋事易掣肘',中:'旺衰中和、事业平顺守常'},
      '婚姻感情':{喜:'扶抑得宜、婚姻和美',忌:'扶抑失当、婚姻易失和',中:'旺衰平顺、感情如常'},
      '家庭子女':{喜:'日主得衡、家宅宁顺',忌:'失衡失稳、家宅易生波折',中:'日主得平、家宅如常'},
      '性格健康':{喜:'旺衰得衡、身心舒展',忌:'旺衰失衡、健康宜调护',中:'旺衰得平、身心平稳'}
    },
    '病药派':{
      '事业财运':{喜:'引药见效、事业偏枯得解',忌:'引病加重、事业易乖',中:'病药无引动、事业平稳守常'},
      '婚姻感情':{喜:'药力得济、感情转顺',忌:'病重药轻、婚姻宜稳',中:'病药无引动、感情如常'},
      '家庭子女':{喜:'引药调和、家宅安稳',忌:'病显药隐、家宅易生波折',中:'病药不显、家宅如常'},
      '性格健康':{喜:'药力得济、身心得养',忌:'偏枯加重、健康宜调护',中:'病药无引动、身体如常'}
    }
  };
  // 冗余层折叠：某层五派判定与上层全同、且无新增神煞/长生/应期宫位，则不铺表、一行收掉
  function layerRedundant(s){
    const up=upperOf(s); if(!up) return false;
    const cu=tally(s), ut=tally(up); if(cu.v.some((x,i)=>x.r!==ut.v[i].r)) return false;
    if(stepSha(s.gz).some(x=>!stepSha(up.gz).includes(x))) return false;
    const F=stepFacts(s);
    if(F.cs && !underStack(s).some(o=>o.gz[1]&&getChangSheng(dg,o.gz[1])===F.cs)) return false;
    const curL=mingRelReal(F).map(r=>r.lab), uqL=mingRelReal(stepFacts(up)).map(r=>r.lab);
    if(curL.some(l=>uqL.indexOf(l)<0)) return false;
    return true;
  }

  // 年龄门控统一走 xuanji-lib.js 唯一体系；本模块仅持有运行时 curAge 并调用之
  // 大运/流年：各派末尾落“会遇到什么具体生活事件”，调用组合断语引擎，按流派喜忌切片，产出 宫位×十神类×引动×喜忌 的具体事象。
  // SC_OPT 仍为各派喜忌集（盲派财官为喜、调候/病药走五行、格局/新派走十神类别），用于引擎通用兜底；
  // 但本层“喜忌标签”由 areaNotes 直接以 verdictOf(sc,s) 经 forceTag 锁定，与“共识与分歧”完全同源，杜绝标签脱钩。
  const SC_OPT = {
    '子平格局派': { xiCats: Array.from(geUseXiCats), jiCats: Array.from(geUseJiCats) },
    '盲派':         { xiCats: ['财星','官杀'], jiCats: [] },
    '调候派':       { xiWx: [A.tiao.wx], jiWx: [keWxOf(A.tiao.wx)].filter(Boolean) },
    '新派（民国）': { xiCats: Array.from(xiSet), jiCats: Array.from(jiSet) },
    '病药派':       { xiWx: [A.bingYao.yao], jiWx: [A.bingYao.bing] }
  };
  // ===== 人话层：白话翻译 + 具体事件（中性客观）+ 关键事件 =====
  // 白话词典：各派把"术语结论"翻译成人话（按喜忌×年龄段）
  const BAIHUA={
    '子平格局派':{
      '喜':{base:'格局得用、根基稳，做事有靠',child:'格局得用、课业根基稳、师长肯扶持',late:'格局得用、晚景安、家宅名誉有靠'},
      '忌':{base:'格局受扰、事多掣肘，宜守不宜进',child:'格局受扰、课业易波动，宜稳扎稳打',late:'格局受扰、家事名誉宜守'},
      '中':{base:'格局无波澜，按部就班即可',child:'格局平稳、课业按部就班',late:'格局平顺、晚景如常'}
    },
    '盲派':{
      '喜':{base:'财官有力、事情易办成、能落到实利',child:'财官可用、家里对学业生活照应实在',late:'财官有依、家事易成、儿孙助力实在'},
      '中':{base:'财官不显、做事平淡、无大起落',child:'财官不显、日子平平',late:'财官不显、家事如常'}
    },
    '调候派':{
      '喜':{base:'寒暖得宜、身心舒坦、健康顺',child:'寒暖得宜、身体舒服、健康顺',late:'身安气顺、少病痛'},
      '忌':{base:'寒暖失调、身心易疲、宜调养',child:'易生病、换季要留意',late:'旧疾易发、宜温养'},
      '中':{base:'寒暖无偏、身心如常',child:'身体如常',late:'身体平稳'}
    },
    '新派（民国）':{
      '喜':{base:'旺衰得衡、做事有底、劳逸得当',child:'',late:'旺衰得衡、精力尚可'},
      '忌':{base:'日主失衡、易累易烦、宜劳逸结合',child:'精力不济、宜早睡多动',late:'精力有限、宜静养'},
      '中':{base:'旺衰中和、无大起伏',child:'状态平稳',late:'精力如常'}
    },
    '病药派':{
      '喜':{base:'病得药解、局面转顺',child:'病药得济、身心受惠、学业顺手',late:'偏枯得解、局面转顺'},
      '忌':{base:'病势偏重、宜稳守忌冒进',child:'偏枯在身、课业宜稳',late:'病重药轻、宜守宜防'},
      '中':{base:'病药无引动、平稳守常',child:'病药不显、如常',late:'偏枯不显、顺原局'}
    }
  };
  // 幼儿（<7）通用收尾白话：身心发育语境，不分流派（2 岁无课业/财官/事业可论）
  const INFANT_BAIHUA={'喜':'成长顺遂、身心发育良好，家宅福泽护持','忌':'宜多养护，防体弱易感，起居饮食留意','中':'按部就班、顺其自然成长'};
  function baiHuaOf(scName, tag, age){
    const B=BAIHUA[scName]; if(!B) return '';
    const t=B[tag==='喜'?'喜':tag==='忌'?'忌':'中']; if(!t) return '';
    const st=baziAgeStage(age);
    // 幼儿（<7）：流派收尾白话统一走"成长/养护"通用句，2 岁不谈课业考试、财官事业，只论身心发育
    if(baziInfant(age)) return INFANT_BAIHUA[tag==='喜'?'喜':tag==='忌'?'忌':'中']||'';
    if(scName==='新派（民国）'&&tag==='喜'&&st==='child')
      return (A.strength&&A.strength.indexOf('弱')<0)?'日主偏旺、精神头足、课业有余力':'日主得扶、课业有劲、师长助力明显';
    return (st==='child'&&t.child)?t.child:(st==='late'&&t.late)?t.late:t.base;
  }
  // 具体事件（中性客观）：各派讲自己关注的领域（格局/做功/寒暖/旺衰/病药），不吹不贬、用"易/宜/可能"
  function shiJianOf(sc, s, F, age, tag){
    if(baziInfant(age)) return [];   // 幼儿：具体事件（考试/功名/事业/姻缘）无现实对应，一律不输出
    const st=baziAgeStage(age); const child=st==='child', late=st==='late';
    const tc=tenCat(s.gz); const cats=[shenCat(tc.g), shenCat(tc.z)];
    const t3=tag==='喜'?'喜':tag==='忌'?'忌':'中';
    const ev=[]; const has=c=>cats.indexOf(c)>=0;
    if(sc.name==='子平格局派'){
      if(child){
        if(has('印星')) ev.push(t3==='喜'?'课业起步顺、师长印象好，考试易有佳绩':t3==='忌'?'课业易波动、师长关系需用心处':'');
        if(has('官杀')) ev.push(t3==='喜'?'纪律自觉、考试与升学节点顺':t3==='忌'?'课业压力偏大、易被批评，宜疏导':'');
        if(has('食伤')) ev.push(t3==='喜'?'兴趣展示机会多（比赛、表演、作品）':'话多易走神、易与同伴小摩擦');
        if(has('比劫')) ev.push(t3==='喜'?'同伴互助、小组合作顺':'同伴争竞、易有小别扭');
      } else if(late){
        if(has('印星')) ev.push(t3==='喜'?'家宅安宁、晚辈照应有靠':'家事文书宜核');
        if(has('官杀')) ev.push(t3==='喜'?'家事顺、声望稳':'家事压力偏重、宜宽心');
        if(has('食伤')) ev.push('含饴弄孙、技艺传习有乐');
      } else {
        if(has('官杀')) ev.push(t3==='喜'?'事业有进阶可能（晋升、项目、考试）':t3==='忌'?'工作压力偏大、易有责难，宜守成':'');
        if(has('财星')) ev.push(t3==='喜'?'进项机会多（奖金、副业、投资窗口）':t3==='忌'?'开销易增、防破财（借贷、担保）':'');
        if(has('印星')) ev.push(t3==='喜'?'文书证件、进修、长辈助力顺':t3==='忌'?'文书易误、长辈事牵绊':'长辈健康宜留意');
      }
    } else if(sc.name==='盲派'){
      if(child){
        if(has('财星')) ev.push('家中为学业与兴趣的开销易见增长（报班、文具、出游）');
        if(has('官杀')) ev.push(t3==='喜'?'考试、评级类事项易落实、名次可得':t3==='忌'?'名次易落、宜守勿争':'');
        if(has('印星')) ev.push('祖辈接送看护、学习开支能到位');
      } else if(late){
        if(has('财星')) ev.push('积蓄与家宅财务宜稳守、防大额支出');
        if(has('官杀')) ev.push(t3==='喜'?'家事易办成、子女事落实':t3==='忌'?'家事阻滞、宜缓办':'');
      } else {
        if(has('财星')) ev.push(t3==='喜'?'进项易落实（奖金、副业、款项回笼）':t3==='忌'?'破财防骗（借贷、担保、合伙）':'');
        if(has('官杀')) ev.push(t3==='喜'?'事情易办成、权责落实':t3==='忌'?'办事受阻、宜缓':'');
        if(has('比劫')) ev.push(t3==='喜'?'同辈助力、合作分利顺':t3==='忌'?'同辈争竞、合伙防分利':'');
      }
    } else if(sc.name==='调候派'){
      if(child){
        if(t3==='喜') ev.push('身体底子好、冬天不易病、精气神足，适合运动');
        if(t3==='忌') ev.push('睡眠或胃口宜留意');   // 与收尾"易生病、换季要留意"互补，不复述"换季生病"
        if(t3==='中') ev.push('注意饮食、作息');
      } else if(late){
        if(t3==='喜') ev.push('身安气顺、旧疾少发');
        if(t3==='忌') ev.push('旧疾易发、宜温养防寒');
      } else {
        if(t3==='喜') ev.push('身心舒坦、睡眠与精力状态佳');
        if(t3==='忌') ev.push('换季易感冒、睡眠易浅、情绪易烦躁');
        if(t3==='中') ev.push('注意饮食、作息');
      }
    } else if(sc.name==='新派（民国）'){
      if(child){
        if(t3==='喜') ev.push((A.strength&&A.strength.indexOf('弱')<0)?'精力足、课业有余力，可兼顾兴趣':'课业有劲、师长助力明显');
        if(t3==='忌') ev.push('精力不济、宜早睡多动、少耗神');
        if(t3==='中') ev.push('注意劳逸结合');
      } else if(late){
        if(t3==='忌') ev.push('精力有限、宜静养少操劳');
        else ev.push('精力尚可、作息宜规律');
      } else {
        if(t3==='喜') ev.push('做事有底、劳逸得当、压力可担');
        if(t3==='忌') ev.push('事倍功半、忙碌易出错漏');
        if(t3==='中') ev.push('注意劳逸结合');
      }
    } else {
      if(child){
        if(t3==='喜') ev.push('吃饭睡眠转稳、抵抗力渐增，旧疾少反复');
        if(t3==='忌') ev.push('换季易反复，作息饮食宜留心');
        if(t3==='中') ev.push('注意饮食、作息');
      } else if(late){
        if(t3==='喜') ev.push('旧疾渐安、药食调理见效');
        if(t3==='忌') ev.push('旧疾宜防、体检别省');
      } else {
        if(t3==='喜') ev.push('隐患渐除、身体调理见效');
        if(t3==='忌') ev.push('老毛病易反复、旧疾易抬头');
        if(t3==='中') ev.push('注意饮食、作息');
      }
    }
    return Array.from(new Set(ev)).filter(Boolean);
  }
  // ===== 本层断语（解读层，不复述表格数据）=====
  // 本层断语职责：纳音/长生→盲派（csClauseInc/mangNayin）、空亡/凶煞/太岁/层级冲合→盲派（mangShaAll/mangKong）、
  //         身弱遇财→新派（fXin）；与命局天克地冲/天合地合→与命局关系表已有、应事见共识行关键事件。
  // 本行只保留评分结论（曲线体系，非任何流派维度）。
  function gaiLan(s, F){
    const parts=[];
    if(s.lvl==='大运'){
      try{
        const sp=pillarScoreParts(s.gz, A);
        if(sp && sp.front!=null && sp.back!=null){
          if(sp.front>=sp.back) parts.push(`此运前五年${sp.front}分、后五年${sp.back}分、整运${sp.full}分（前后五分为侧重折算、整运为全量综合），走势下行，宜前半程把握机会、后半程守成蓄力`);
          else parts.push(`此运前五年${sp.front}分、后五年${sp.back}分、整运${sp.full}分（前后五分为侧重折算、整运为全量综合），走势上行，宜前期养精蓄锐、后期乘势进取`);
        }
      }catch(e){}
    }
    return parts.length?parts.join('。')+'。':'';
  }
  // 共识行关键事件（数据驱动：落点柱 × 关系类型 → 具体应事 + 应期；不用固定模板，避免每盘同样内容）
  // 单五行 vs 首选用神共识（五派用神共识，公共基准不绑定单派）→ 用神/喜神/忌神/中
  function wxVsYong(wx){
    const Y=(A.synthesis&&A.synthesis.primary&&A.synthesis.primary.wx)||'';
    if(!Y||!wx) return '';
    if(wx===Y) return '用神';
    if(WX_SHENG[wx]===Y) return '喜神';
    if(WX_KE[wx]===Y||WX_KE[Y]===wx) return '忌神';
    return '';
  }
  // 六亲星标注（与宫位分离，单独成句）：主导方十神 → 六亲（印母/财父/食伤子女/官杀女命夫/比劫兄弟），返回六亲字；日柱配偶宫单独处理
  function qinOf(gz, isZ){
    const g=tenGod(BZ.dayGan, isZ?zhiMain(gz[1]):gz[0]);
    if(g==='正印'||g==='偏印') return '母';
    if(g==='正财'||g==='偏财') return '父';
    if(g==='食神'||g==='伤官') return '子女';
    if(g==='比肩'||g==='劫财') return '兄弟';
    if((g==='正官'||g==='七杀') && !(BZ.sex===1||BZ.sex==='男'||BZ.sex===true)) return '夫';
    return '';
  }
  // 岁运步年龄：流月/流日按钮无"X岁"文本（baziStepAge 解析不到），退化为当前命主年龄（流年-出生年+1），保证年龄门控对低层岁运同样生效
  function stepAgeOf(m){
    let a=baziStepAge(m);
    if(a==null && BZ && BZ.curYear && BZ.birthYear) a=BZ.curYear-BZ.birthYear+1;
    return a;
  }
  function keyEventsOf(s, age){
    const st=baziAgeStage(age); const F=stepFacts(s);
    const ev=[];
    const ZHI_MONTH={'子':'十一月','丑':'十二月','寅':'正月','卯':'二月','辰':'三月','巳':'四月','午':'五月','未':'六月','申':'七月','酉':'八月','戌':'九月','亥':'十月'};
    (F.mingRels||[]).forEach(cur=>{
      const rel=cur.rel||'';
      // 仅强关系（冲刑害合克破、支半合/拱）生成具体应事；比和/相生等温和关系不落"引动…应兄弟"空话，仅关系表呈现
      const hasStrong=/冲|刑|害|合|克|破/.test(rel) || (cur.zhiRels||[]).some(x=>x.w==='半合'||x.w==='拱');
      if(!hasStrong) return;
      const gHe=(cur.ganRels||[]).some(x=>x.cls==='he');
      const gC=(cur.ganRels||[]).some(x=>x.cls==='gchong');
      const zHe=(cur.zhiRels||[]).some(x=>x.w==='合');
      const zC=(cur.zhiRels||[]).some(x=>x.w==='冲');
      const pillar=cur.lab;
      const gong=pillar==='年柱'?'长辈宫':pillar==='月柱'?'父母宫':pillar==='日柱'?'自身宫':(st==='child'?'晚辈宫':'子女宫');
      const who=pillar==='年柱'?'长辈':pillar==='月柱'?(st==='child'?'父母':'父母或工作平台'):pillar==='日柱'?'自身':(st==='child'?'同伴手足':'子女晚辈');
      // 该柱干支喜忌方向（vs 首选用神共识）：喜用受动宜防/忌神受动去病；六合绊住力减/暂缓。
      // 标注对象跟随主导关系方：天干有实质关系（合冲克）标天干，否则地支有实质关系（冲合半合刑害破暗合）标地支
      // ，防"天干无涉（如甲甲比肩）却被标'甲被合力减'"张冠李戴（被合的是地支子辰半合）
      const gAct=(cur.ganRels||[]).some(x=>x.cls==='he'||x.cls==='gchong'||x.cls==='ke');
      const zAct=(cur.zhiRels||[]).some(x=>['冲','合','半合','刑','害','破','暗合'].includes(x.w));
      const isZ=!gAct&&zAct;
      const mz=cur.gz;
      // 宫位与十神分离：宫名只标宫位（场所）；六亲星单独成句"引动X（十神）、应Y"（人物），避免"子女宫，应母"混写误解
      const tenN=tenGod(BZ.dayGan, isZ?zhiMain(mz[1]):mz[0]);
      let qinTxt='';
      if(pillar==='日柱'){ qinTxt = (st==='child') ? '' : '；引动日支、配偶宫动'; }   // 孩童（含婴幼儿）不谈配偶宫，避免"1岁引动配偶宫"突兀
      else if(tenN){ const q6=qinOf(cur.gz, isZ); qinTxt=q6?`；引动${tenN}、应${q6}`:`；引动${tenN}`; }
      // 局类关系（半合/拱）：合局成形、按化神五行判得失，非六合"绊住力减"（半合化神得势，拱虚待时）
      const juR=(cur.zhiRels||[]).find(x=>x.w==='半合');
      let xj='';
      if(juR && !gAct && /合/.test(rel)&&!/冲|刑|害/.test(rel)){
        const hua=juR.hua||'', jh=wxVsYong(hua);
        if(juR.kind==='gong') xj=hua?`，${hua}局虚拱、待时而发`:'';
        else if(jh==='用神'||jh==='喜神') xj=hua?`，${hua}局成形、喜气得势`:'';
        else if(jh==='忌神') xj=hua?`，${hua}局成形、忌气得势、宜防`:'';
        else xj=hua?`，${hua}局成形、与用神无涉`:'';
      } else {
        const mj=wxVsYong(isZ?ZHI_WX[mz[1]]:GAN_WX[mz[0]]);
        // 天干主导时只看天干是否合（丙庚克+寅午半合：丙是被克非被合，不标"被合力减"）；地支主导时看支合（六合/暗合）
        const isHe = gAct ? ((cur.ganRels||[]).some(x=>x.cls==='he')) : (/合/.test(rel)&&!/冲|刑|害/.test(rel));
        if(pillar==='日柱' && gAct){
          // 日主本人（日柱天干）被引动：受克=官杀压力、被合=合绊，日主是"我"，绝不套"忌神受制反为去病"（身强也不可把克身说成去病）
          xj = isHe ? '，日主被合、气机受绊' : '，日主受克、身气受压';
        } else {
          xj=mj==='用神'||mj==='喜神'?(isHe?`，${mz[isZ?1:0]}为${mj}、被合力减`:`，${mz[isZ?1:0]}为${mj}、受制宜防`)
             :mj==='忌神'?(isHe?`，${mz[isZ?1:0]}为忌神、被合暂缓`:`，${mz[isZ?1:0]}为忌神、受制反为去病`)
             :'';
        }
      }
      const P=t=>{ ev.push(t+qinTxt+xj); };
      // 特殊组合（与表2"特殊"行同源）：天合地合（干合+支合）/ 天克地冲（干冲+支冲），优先于单关系
      if(gHe&&zHe){ P(`${pillar}（${gong}）天合地合，干合支合、天地同合，${who}有大合喜事之象、事有重大转机`); return; }
      if(gC&&zC){ P(`${pillar}（${gong}）天克地冲，干冲支冲、天地同冲，${who}防突发变动、出行安危`); return; }
      const pz=pillar==='年柱'?BZ.zhis[0]:pillar==='月柱'?BZ.zhis[1]:pillar==='日柱'?BZ.zhis[2]:BZ.zhis[3];
      const ying=/冲/.test(rel)?(`，逢${ZHI_MONTH[pz]||''}留意`):'';
      if(cur.lab==='年柱'){
        if(/冲/.test(rel)) P(`${pillar}（${gong}）相冲，长辈防出行安危、健康起伏${ying}`);
        else if(/刑/.test(rel)) P(`${pillar}（${gong}）相刑，长辈防口舌是非、文书纠纷${ying}`);
        else if(/害/.test(rel)) P(`${pillar}（${gong}）相害，长辈防小人暗损、家宅不宁${ying}`);
        else if(/合/.test(rel)) P(`${pillar}（${gong}）相合，长辈或有喜事、家宅和睦`);
        else if(/克/.test(rel)) P(`${pillar}（${gong}）相克，长辈防劳心压力`);
        else if(/破/.test(rel)) P(`${pillar}（${gong}）相破，长辈防破耗、家宅有变`);
        else P(`${pillar}（${gong}）引动，长辈或家宅有应`);
      } else if(cur.lab==='月柱'){
        if(/冲/.test(rel)) P(st==='child'?`${pillar}（${gong}）相冲，父母或居所变动${ying}，留意孩子作息`:`${pillar}（${gong}）相冲，${who}变动${ying}`);
        else if(/刑/.test(rel)) P(`${pillar}（${gong}）相刑，父母防口舌官非、文书纠纷`);
        else if(/害/.test(rel)) P(`${pillar}（${gong}）相害，父母防小人暗损`);
        else if(/合/.test(rel)) P(`${pillar}（${gong}）相合，父母宫合、家宅和睦`);
        else if(/破/.test(rel)) P(`${pillar}（${gong}）相破，父母防破耗、家计有损`);
        else if(/克/.test(rel)) P(`${pillar}（${gong}）相克，父母防劳心压力`);
        else P(`${pillar}（${gong}）引动，父母或家宅有应`);
      } else if(cur.lab==='日柱'){
        if(/冲/.test(rel)) P(`${pillar}（${gong}）相冲，自身防健康起伏、情绪波动${ying}`);
        else if(/刑/.test(rel)) P(`${pillar}（${gong}）相刑，自身防口舌是非、身体劳损`);
        else if(/害/.test(rel)) P(`${pillar}（${gong}）相害，自身防小人暗损、琐事暗耗`);
        else if(/合/.test(rel)) P(`${pillar}（${gong}）相合，自身气机凝聚、事有转机`);
        else if(/破/.test(rel)) P(`${pillar}（${gong}）相破，自身防破耗、琐事损耗`);
        else if(/克/.test(rel)) P(st==='child'?`${pillar}（${gong}）相克，自身防耗损、易疲`: `${pillar}（${gong}）相克，自身防劳心压力`);
        else P(`${pillar}（${gong}）引动，自身或婚恋有应`);
      } else {
        if(/冲/.test(rel)) P(st==='child'?`${pillar}（${gong}）相冲，同伴或手足事宜留意${ying}`:`${pillar}（${gong}）相冲，${who}事宜留意${ying}`);
        else if(/刑/.test(rel)) P(st==='child'?`${pillar}（${gong}）相刑，同伴手足防口舌是非`:`${pillar}（${gong}）相刑，子女晚辈防口舌官非`);
        else if(/害/.test(rel)) P(st==='child'?`${pillar}（${gong}）相害，同伴手足防暗损`:`${pillar}（${gong}）相害，子女晚辈防小人暗损`);
        else if(/合/.test(rel)) P(st==='child'?`${pillar}（${gong}）相合，同伴相得、手足和睦`:`${pillar}（${gong}）相合，子女事有喜、家宅和睦`);
        else if(/破/.test(rel)) P(st==='child'?`${pillar}（${gong}）相破，同伴手足防破耗`:`${pillar}（${gong}）相破，子女晚辈防破耗`);
        else if(/克/.test(rel)) P(st==='child'?`${pillar}（${gong}）相克，同伴手足事多操心`:`${pillar}（${gong}）相克，子女晚辈防劳心压力`);
        else P(`${pillar}（${gong}）引动，晚辈或家宅有应`);
      }
    });
    return Array.from(new Set(ev));
  }
  // 岁运引动（表3所选干支间关系：本步 vs 上层所选干支的实质关系应事；非相邻跨层关系在表3 矩阵展示）
  // 实质分析：合法分级（天合地合/天干合/地支合/半合/拱）+ 合化五行喜忌（对首选用神共识）+ 对象喜忌（用神受冲宜防/忌神受冲去病）
  function yunYinOf(s, F){
    const up=upperOf(s); if(!up) return '';
    const pr=(F.pairRels||[]).find(o=>o.lab===up.lvl);
    if(!pr || !/冲|刑|害|合|克|破/.test(pr.rel||'')) return '';
    const u=`${up.lvl}${up.gz}`;
    const g=s.gz[0], uf=up.gz[0], z=s.gz[1], uz=up.gz[1];
    const hg=tianGanHe(g,uf);
    const hz6=(DIZHI_HE6.find(a=>(a[0]===z&&a[1]===uz)||(a[0]===uz&&a[1]===z))||[])[2]||'';
    const gC=pairIn(g,uf,TIANGAN_CHONG), zC=pairIn(z,uz,DIZHI_CHONG);
    const zBan=DIZHI_SANHE.find(a=>a.includes(z)&&a.includes(uz)&&z!==uz);
    // ， 合类（天合地合/天干合/地支合/半合/拱）：合化五行喜忌 ，
    if(hg||hz6||zBan){
      const comb=[];
      if(hg) comb.push(`${g}${uf}合化${hg}`);
      if(hz6) comb.push(`${z}${uz}合化${hz6}`);
      if(zBan){ const k=sanheKind(zBan,[z,uz]); comb.push(k==='gong'?`${z}${uz}拱${zBan[3]}局，虚拱待时`:`${z}${uz}半合${zBan[3]}局`); }
      const hws=[hg,hz6,zBan?zBan[3]:''].filter(Boolean);
      const ok=hws.some(w=>wxVsYong(w)==='用神'||wxVsYong(w)==='喜神'), bad=hws.some(w=>wxVsYong(w)==='忌神');
      const typ=hg&&hz6?'天合地合':hg?'天干相合':(zBan?'地支半合':'地支相合');
      const tail=ok&&bad?'，合气喜忌交参':ok?'，合气为喜用、主吉':bad?'，合气为忌神、主凶':'，合气与用神无涉';
      return `与${u}${typ}（${comb.join('、')}）${tail}`;
    }
    // ， 冲刑害破克类：对象喜忌（用神受冲宜防/忌神受冲去病），
    const objJ=wxVsYong(GAN_WX[uf])||wxVsYong(ZHI_WX[uz]);
    const w=gC&&zC?'天克地冲':(gC||zC?'相冲':(pairIn(z,uz,DIZHI_XING)?'相刑':(pairIn(z,uz,DIZHI_HAI)?'相害':(pairIn(z,uz,DIZHI_PO)?'相破':'相克'))));
    const tail=objJ==='用神'||objJ==='喜神'?`，${uf}为${objJ}、受${w==='相害'?'暗损':'冲制'}宜防`
               :objJ==='忌神'?`，${uf}为忌神、受${w==='相害'?'暗损':'冲制'}反为去病`
               :'';
    return `与${u}${w}${tail}`;
  }
  function areaNotes(sc, s, tag, m){
    const opt = SC_OPT[sc.name]; if(!opt) return '';
    let age = baziStepAge(m);
    if(age==null && BZ.curYear && BZ.birthYear) age = BZ.curYear - BZ.birthYear + 1;   // 流月/流日无 period 年龄时退化为当前年龄，保证年龄门控生效
    let evs;
    // forceTag=verdictOf 判定（与“共识与分歧”同源，杜绝标签脱钩）；school 启用 EV_SCHOOL 各派专属事象；大运/流年/流月/流日均适用。
    try { evs = buildEventPrototypes(BZ, [{ gz: s.gz, lvl: s.lvl, age: age, year: m.year }], Object.assign({}, opt, { school: sc.name, forceTag: tag })); }
    catch(e){ return ''; }
    if(!evs || !evs.length) return '';
    // 按 喜/中/忌 收集“去重后”的具体事象：引擎按十神类+喜忌出事件，与宫位无关，
    // 同一事件会因年/月/日/时多柱引动而重复，故跨宫位去重。
    const buckets = { '喜': new Set(), '中': new Set(), '忌': new Set() };
    const shas = (sc.name==='盲派') ? new Set() : null;   // 神煞门控：仅盲派引其事象
    // 神煞跨层去重：上层（大运/流年/流月）已述之神煞，本层跳过
    const prevSha=[];
    underStack(s).forEach(o=>{ try{ stepSha(o.gz).forEach(x=>{ if(prevSha.indexOf(x)<0) prevSha.push(x); }); }catch(e){} });
    // 事件词跨层去重：上层已述之词组本层不再输出（与神煞 prevSha 同口径），
    // 使流年只补大运未说之新事象、流月只补流年未说者，杜绝"（利）词逐字重抄上一层"；
    // 若过滤后该档全空则回退原第一词，保证喜忌标签不丢。
    const prevEvents=[];
    underStack(s).forEach(o=>{ try{
      buildEventPrototypes(BZ, [{gz:o.gz, lvl:o.lvl, age:age}], Object.assign({}, opt, {school:sc.name, forceTag:verdictOf(sc,o)}))
        .forEach(x=>(x.protos||[]).forEach(p=>(p.events||[]).filter(Boolean).forEach(it=>{ if(it&&prevEvents.indexOf(it)<0) prevEvents.push(it); })));
    }catch(e){} });
    evs.forEach(o => (o.protos||[]).forEach(p => {
      if(!buckets[p.tag]) return;
      if(baziAgeStage(age)==='child' && p.cat==='财星') return;   // 领域裁剪：儿童不涉财运，财星事件词一律不输出（年龄侧重=学业/健康/家庭）
      const raw=(p.events||[]).filter(Boolean);
      const fresh=raw.filter(it=>prevEvents.indexOf(it)<0);
      (fresh.length?fresh:raw.slice(0,1)).forEach(it=>buckets[p.tag].add(it));
      if(shas && (p.sha||[]).length) (p.sha||[]).forEach(x => { if(x && !prevSha.some(k=>x.indexOf(k)>=0)) shas.add(x); });
    }));
    const hasXi = buckets['喜'].size>0, hasJi = buckets['忌'].size>0, hasMid = buckets['中'].size>0;
    if(!hasXi && !hasJi && !hasMid) return '';
    // 量级裁剪：大运/流年列全，流月至多两件、流日仅取最轻一件，配合 EV_LVL 四层专属措辞，使大运/流年/流月/流日字数不同、措辞各不同；
    // 流月/流日另标“流月，/流日，”以明尺度（事件池本身已为月度/日内措辞，前缀不与池内“本月/当日”重复）。
    const cap = (s.lvl==='流日') ? 1 : (s.lvl==='流月') ? 2 : (s.lvl==='流年') ? 4 : 6;
    const lvlPre = (s.lvl==='流月') ? '流月' : (s.lvl==='流日') ? '流日' : '';
    const head = { '喜':'（利）', '中':'（平）', '忌':'（防）' };
    const order = ['喜','中','忌'];
    const parts = [];
    let any=false;
    order.forEach(t => {
      const set = buckets[t]; if(!set || !set.size) return;
      any=true;
      parts.push(head[t] + lvlPre + Array.from(set).slice(0, cap).join('、'));   // 每档至多 cap 件具体事，跨宫位已去重
    });
    if(!any) return '总体平稳、宜顺时而行';   // 真正空桶（年龄门控后全被滤掉）才回退通用语
    let res = parts.join('；');
    if(shas && shas.size){ const s2 = Array.from(shas).join('、'); if(s2) res += '；' + s2; }   // 盲派神煞事象附于末尾
    return res;
  }
  let curAge=null; // 神煞/长生年龄门控：渲染每步时按 selMeta.period 填入该步年龄，供 shaClauseInc/csMean 取用
  const saidDuan=new Set();   // 断语跨层去重：同一断语（身弱遇财/落空亡/相刑等）全链路只述一次
  const saidEv=new Set();     // 各派事件跨层去重：同派同事件只述一次，防流月流日重复
  // "流派"列长名的固定换行位：插入 <span class=sk-b>（移动端 block 断行、桌面 inline 单行），
  // 为解读列留出最大宽度。短名（盲派/调候派/病药派）不处理。
  const _skBr = t => ({'宫位应事':'宫位<span class="sk-b">应事</span>','子平格局派':'子平<span class="sk-b">格局派</span>','新派（民国）':'新派<span class="sk-b">（民国）</span>','共识与分歧':'共识<span class="sk-b">与分歧</span>'})[t] || t;
  let h=`<h4 class="det-h">各流派解读运势</h4>`;
  // 岁运断语所需的运段上下文：同屏所选大运干支（判岁运并临）、该大运末岁（判将交未交之末年）
  const _yunStep=(sel||[]).find(x=>x.lvl==='大运')||null;
  let _yunEndAge=null;
  if(_yunStep){ const _pm=/(\d+)\D+(\d+)\s*岁/.exec(((selMeta&&selMeta[(sel||[]).indexOf(_yunStep)])||{}).period||''); if(_pm) _yunEndAge=+_pm[2]; }
  // 各所选干支：每干支一张子表（流派：该干支解读），避免多列挤压
  (sel||[]).forEach((s,i)=>{
    const m=(selMeta&&selMeta[i])||{};
    if(layerRedundant(s)){ const up=upperOf(s); h+=`<div class="sub-note">${s.lvl} ${s.gz}${(m.period?' '+m.period:'')}：与${up.lvl}${up.gz}全同、无新引动，依上层结论。</div>`; return; }
    let title=`${s.lvl} ${s.gz}`;
    if(m.period) title+=` ${m.period}`;
    const badge=m.rating?(' '+yunStateBadge(m.rating)):'';
    h+=`<h4 class="det-h">${title}${badge}</h4>`;
    const F=stepFacts(s);
    const gl=gaiLan(s,F);
    if(gl) h+=`<div class="sub-note">${gl}</div>`;
    h+=`<table class="yun-tbl sk-sub"><thead><tr><th class="sk-c-name">流派</th><th class="sk-c-read">${s.lvl}解读</th></tr></thead><tbody>`;
    { const gw=[];
      const yq=yqLine(s,m); if(yq) gw.push(yq.replace(/。$/,''));
      keyEventsOf(s, stepAgeOf(m)).forEach(k=>gw.push(k));
      const yy=yunYinOf(s, F); if(yy) gw.push(yy);
      curAge=stepAgeOf(m); if(curAge==null){ let up=upperOf(s),g=0; while(up&&curAge==null&&g++<5){ const ui=sel.indexOf(up); curAge=stepAgeOf((selMeta&&selMeta[ui])||{}); up=upperOf(up); } }   // 前置：⑥神煞年龄门控随本步年龄，不悬到上一步
      // 安静步：无任何强引动时，区分完全无关系与只有温和比和/相生，各用一句平实说明，不灌空话
      if(!gw.length){
        const mild=(stepFacts(s).mingRels||[]).some(r=>/比和|相生/.test(r.rel||''));
        gw.push(mild?`${s.lvl}与命局天干比和、相生，气机和顺、无冲克引动，宫位平顺`:`${s.lvl}与命局四柱无冲合刑害破之引动，宫位无明应`);
      }
      // 古籍断语融入宫位应事栏：
      // ①~⑥ 为固定维度轴，编号恒按 ①②③④⑤⑥ 顺序排列：① 岁运应期（经典断语：犯太岁/天克地冲/天合地合/岁运并临/冲克宫位/六亲灾厄/年龄运限）恒列最前，
      //    命中列实、未命中标"① 岁运应期：无"（四层同口径，含流月/流日），其后依次 ②长生 ③纳音五行 ④十神临运 ⑤十神关系 ⑥神煞临运
      // ②-⑥ 固定维度（长生/纳音五行/十神临运/十神关系/神煞临运），按编号拆成独立条目逐行
      { const _age=stepAgeOf(m);
        const _ext={ age:_age, yunGz:(_yunStep&&_yunStep.gz)||'',
          yunLast:(s.lvl==='流年' && _age!=null && _yunEndAge!=null && _age===_yunEndAge) };
        const sy=yunSuiYunDuan(s,BZ,A,_ext);
        const dy=yunDuanyuByDim(s,BZ,A);
        const dyParts=dy?dy.split('。').map(x=>x.trim()).filter(Boolean):[];
        if(sy) gw.push(sy); /* ① 恒在最前：命中列实、未命中标"无"，序号①~⑥不乱序 */
        if(dyParts.length) dyParts.forEach(x=>gw.push(x));
      }
      // 宫位应事单元格：引动落点 / 各柱应事 / 古籍断语各维度 逐条一行（<br> 分段），不再一段数百字
      h+=`<tr><td class="sk-c-name">${_skBr('宫位应事')}</td><td class="sk-c-read">${gw.map(x=>{ const t=String(x||'').replace(/[。；]+$/,''); return t?t+'。':''; }).filter(Boolean).join('<br>')}</td></tr>`; }
    schools.forEach(sc=>{ const tag=verdictOf(sc,s);
      let cell=sc.f(s, F); const ageNow=curAge;
      const mrTxt=schoolMingRel(sc.name, s, F);
      // 流派机制解读 与 干支关系损益 分行（<br>），避免"机制；关系"密排一段
      if(mrTxt){ if(cell&&!/。$/.test(cell)) cell+='。'; cell=(cell?cell+'<br>':'')+mrTxt+'。'; }
      cell = baziAgeAdapt(null, cell, ageNow);   // 孩童/青年：统一走 xuanji-lib 年龄门控（事业转学业、婚姻转情缘等）
      // 人话层：术语判断后紧跟白话翻译 + 该派具体事件（中性客观），不分段、句号衔接成一段；
      // 词组级去重：used=术语+白话词组并集，事件词组不在 used 才保留，事件句之间亦互斥（防"课业平稳。课业平稳、纪律如常。"类句内自重复）
      const bh=baiHuaOf(sc.name, tag, ageNow);
      const sjRaw=shiJianOf(sc, s, F, ageNow, tag);
      const sj=sjRaw.filter(x=>{ const k=sc.name+'\u0001'+x; if(saidEv.has(k)) return false; saidEv.add(k); return true; });
      const used=new Set();
      cell.split(/[、，,；]/).forEach(x=>{ const t=x.trim(); if(t) used.add(t); });
      let bh2=bh;
      if(bh){
        const rest=bh.split(/[、，,；]/).map(x=>x.trim()).filter(x=>x&&!used.has(x));
        bh2=rest.length?rest.join('、'):bh;
        bh2.split(/[、，,；]/).forEach(x=>{ const t=x.trim(); if(t) used.add(t); });
      }
      const keep=[];
      sj.forEach(x=>{
        const seg=x.replace(/^[；、，]|[；。]$/g,'');
        if(bh2&&(bh2.indexOf(seg)>=0||seg.indexOf(bh2)>=0)) return;
        const rest=x.split(/[、，,；]/).map(w=>w.trim()).filter(w=>w&&!used.has(w));
        if(!rest.length) return;
        const joined=rest.join('、');
        keep.push(joined);
        rest.forEach(w=>used.add(w));
      });
      const tail=[bh2].concat(keep).filter(Boolean);
      // 白话 + 各事件 另起一行（<br>）与机制/关系段分开，事件之间亦逐条分行
      if(tail.length){
        if(!/。$/.test(cell)) cell+='。';
        cell+='<br>'+tail.map(x=>{ const t=String(x||'').replace(/[。；]+$/,''); return t?t+'。':''; }).filter(Boolean).join('<br>');
      }
      h+=`<tr><td class="sk-c-name">${_skBr(sc.name)}</td><td class="sk-c-read">${cell}</td></tr>`; });
    let consLine=consensusOf(s);
    // 评级仲裁：评分曲线（吉平中凶）与流派共识相左时，明示两口径来源，以流派判定为纲、曲线作参
    if(m&&m.rating){ const _t=tally(s);
      if(m.rating==='凶'&&_t.xi.length>=3) consLine+=`（曲线示低谷，然${_t.xi.length}派判喜，以流派判定为主）。`;
      else if(m.rating==='吉'&&_t.ji.length>=3) consLine+=`（曲线示上升，然${_t.ji.length}派判忌，以流派判定为主）。`;
      else if(m.rating==='平'&&_t.xi.length>=3) consLine+=`（曲线示平稳，然${_t.xi.length}派判喜，以流派判定为主）。`;
      else if(m.rating==='平'&&_t.ji.length>=3) consLine+=`（曲线示平稳，然${_t.ji.length}派判忌，以流派判定为主）。`;
    }
    h+=`<tr><td class="sk-c-name">${_skBr('共识与分歧')}</td><td class="sk-c-read">${consLine}</td></tr>`;
    h+=`</tbody></table>`;
  });
  return h;
}



/* ==================== 六、事件应期 ==================== */
/* 组合断语引擎（推断层）：把"岁运干支 × 命局"收敛为具体生活事件原型。
 *
 * 设计要点：
 *  - 具体事件 = 五维叠加：宫位(被引动的柱) × 十神类(岁运干支相对于日主的十神) × 喜忌 × 引动方式 × 旺衰/年龄。
 *  - 单维度必泛；本引擎做"组合查表"，确定性、无 LLM、可复现。
 *  - 流派切片：opt.school 命中 EV_SCHOOL 时按各派视角（格局用神/盲派做功/调候寒暖/新派旺衰/病药偏枯）出词；
 *    opt.forceTag 锁定本层喜忌标签，与页面 verdictOf 同源，避免共识判中而事件标利的脱钩。
 *  - 儿童与晚年同样按流派分化：EV_SCHOOL_CHILD / EV_SCHOOL_LATE 为年龄专用池，措辞随龄且随派而异。
 *  - 复用全局：bazi-data.js 的 tenGod / shenCat / getChangSheng / pairIn / tianGanHe / HIDE / GAN_WX /
 *    DIZHI_CHONG，HE6，XING，HAI，PO，ANHE / TIANGAN_CHONG；xuanji-lib.js 的 getAnalysis / baziAgeStage；
 *    本文件的 zhiMain / stripCat。
 *
 * 外部调用：buildEventPrototypes(BZ, sel, opt) → 事件原型数组。
 *   sel: [{gz, lvl, age, year}]（lvl 如 大运/流年/流月/流日；age/year 可选，用于年龄门控与应期）
 *   opt: {xiCats,jiCats,xiWx,jiWx} 可选，流派自定义喜忌；缺省用扶抑(A.fu / A.synthesis)。
 */

/* ============ 1. 宫位（四柱）与生活域映射 ============ */
const EV_PALACE = {
  '年': { life: '祖上、父母、远方、早年环境',
    emph: { 财星: '多涉长辈赠予、祖产变现或远地之财', 官杀: '多涉父辈荣誉或早年平台之压力',
            印星: '多涉祖荫、家风传承或早年学业', 食伤: '多涉早年才艺展示、远方发声', 比劫: '多涉同乡同族、早年伙伴分合' } },
  '月': { life: '父母、兄弟、事业平台、青年环境',
    emph: { 财星: '多借父母兄弟之平台生财', 官杀: '多涉职场上司、同事之竞争',
            印星: '多涉学业证书、单位文书', 食伤: '多涉技艺输出、同辈才艺', 比劫: '多涉兄弟朋友、同事之分合' } },
  '日': { life: '自身、配偶、居所家宅',
    emph: { 财星: '多通过配偶或家宅财务联动', 官杀: '多涉夫妻地位、自身权责',
            印星: '多涉居所文书、自我修养', 食伤: '多涉子女、自我表达', 比劫: '多涉夫妻间同辈关系、分合' } },
  '时': { life: '子女、晚景、外出、部下门生',
    emph: { 财星: '多涉子女财务、晚景积蓄', 官杀: '多涉子女功名、部下管理',
            印星: '多涉晚景安养、名声传承', 食伤: '多涉子女才艺、晚岁创作', 比劫: '多涉门生部下、晚年人际' } }
};

/* ============ 2. 引动方式 → 应期与形态 ============ */
const EV_REL = {
  '冲': '突发之象，当年或当月显应，宜速决、忌拖延反复',
  '刑': '内耗暗疾、纠缠反复，宜静守、防积怨成患',
  '害': '小人暗损、无形妨害，宜慎独、防背后是非',
  '破': '破坏离散、计划生变，宜留余地、防突发破耗',
  '合': '渐进成形、气机交合，宜徐图、忌操切冒进',
  '暗合': '暗中牵绊、私密联动，宜明察、防暧昧生事',
  '值': '伏吟静守、气机重叠，宜稳守、忌妄动',
  '干冲': '干头交战、明面冲突，宜避锋、防口舌',
  '干合': '干头羁绊、明面交合，宜借力、防合绊误事'
};

/* ============ 3. 十神类 × 喜忌 → 具体事件原型（核心查找表） ============ */
/* 每条为"具体生活场景"，非泛泛术语。年龄门控在 makeProto 处按关键词过滤，避免童年期谈婚育、晚年期谈晋升。 */
const EV_BASE = {
  '财星': {
    '喜': ['正财稳进、加薪或绩效奖金到账', '经商者客源拓展、成交增多、口碑渐起', '有购房、装修、安家置业之机', '偏财小投可获、礼金红包或意外之财'],
    '忌': ['开销陡增、人情往来或医疗方面破财', '投资慎防套牢、合约账目生纠纷', '合伙分利生隙、钱财易被分夺', '信贷周转受压、勿轻易担保借贷'],
    '中': ['财务平顺、进出相当、宜守不宜冒', '小进小出、收支平衡、无大风浪']
  },
  '官杀': {
    '喜': ['事业晋升、得权得位或获表彰', '岗位调动、重任委任、声名渐起', '考公考证、过关向前', '权责加重、管理幅度扩大'],
    '忌': ['压力陡增、上司责难或小人构陷', '官非诉讼、合同违约之风险', '职位动荡、降职或被动调整', '过劳耗身、旧疾易发须调护'],
    '中': ['职务平顺、按部就班、无大波澜', '权责相当、守成即可']
  },
  '印星': {
    '喜': ['学历提升、考证进修顺利', '得长辈荫庇、贵人提携', '文书契约顺遂、房产购置', '心性安定、学习吸收力强'],
    '忌': ['思多行少、犹豫拖延误事', '长辈健康或关系紧张、家事牵绊', '文书纰漏、合约藏陷阱', '印旺耗身、惰怠孤僻'],
    '中': ['学习平稳、按部就班', '贵人平常、无功无过']
  },
  '食伤': {
    '喜': ['才华展露、作品言论受认可', '子女缘厚、孕育添丁之喜', '投资创意、副业开张', '口才得利、表达销售顺畅'],
    '忌': ['言多必失、口舌是非', '食伤泄身过甚、精力不济', '投资冒进、创意难落地', '子女管教生烦、晚辈耗神'],
    '中': ['表达平顺、技艺渐进', '才思平常、无大起落']
  },
  '比劫': {
    '喜': ['得同辈朋友之助、合作分利', '团队协力、合伙有成', '人气旺、客源互介', '竞争得胜、脱颖而出'],
    '忌': ['比劫夺财、钱财被分或被骗', '同辈竞争、朋友反目', '合作生隙、账目不清', '冲动消费、跟风破耗'],
    '中': ['人际平顺、分合有常', '合作平淡、无大得失']
  }
};

/* 性别差异化：官杀对男命主事业权贵、亦指子女(七杀为子)；对女命兼指夫星。食伤对女命兼指子女。 */
function evGenderNote(cat, tag, isMale){
  if(cat!=='官杀' && cat!=='食伤') return '';
  if(cat==='官杀') return isMale ? '（男命兼主子女功名）' : '（女命兼主夫星感情）';
  return isMale ? '' : '（女命兼主子女）';
}

/* ============ 3b. 年龄阶段专用事件池（避免童年期谈婚育置业、晚年期谈晋升婚恋） ============ */
const EV_BASE_CHILD = {
  '财星': { '喜': ['压岁礼金、零用宽裕', '家庭财务改善、居所安稳', '长辈赠予、小有积蓄'],
            '忌': ['开销增多、易丢物破小财', '家宅财务波动、宜看管财物', '被人分利、钱财防骗'], '中': ['财务平顺、进出相当'] },
  '官杀': { '喜': ['学业进步、考试顺利', '纪律自觉、师长认可', '兴趣专长受鼓励'],
            '忌': ['学业压力大、课业吃力', '师长责难、纪律受批评', '体弱多病、宜护养'], '中': ['按部就班、无大波澜'] },
  '印星': { '喜': ['启蒙顺利、记问渐佳', '得长辈疼爱、家风熏陶', '好书相伴、心性安定'],
            '忌': ['疏于管教、惰怠贪玩', '长辈溺爱或多病、家事牵绊', '文书纰漏、合约藏陷阱'], '中': ['学习平稳、按部就班'] },
  '食伤': { '喜': ['才艺展露、比赛获奖', '表达活泼、同伴相得', '爱好得展、创意受赏'],
            '忌': ['言多招嫌、与同伴生隙', '精力不济、贪玩误学', '晚辈耗神、管教生烦'], '中': ['表达平顺、技艺渐进'] },
  '比劫': { '喜': ['同伴相得、合作游戏', '团队活动得利', '人气旺、客源互介'],
            '忌': ['同伴争抢、财物被分', '朋友反目、易起冲突', '冲动消费、跟风破耗'], '中': ['人际平顺、分合有常'] }
};
const EV_BASE_LATE = {
  '财星': { '喜': ['晚景积蓄安稳、利息分红', '子女奉养、家宅财务宽裕', '资产保值、宜稳守'],
            '忌': ['医疗开销、防盗防骗', '子孙耗财、宜节用', '投资失利、合约纠纷'], '中': ['财务平顺、进出相当'] },
  '官杀': { '喜': ['晚岁声名、子女功名可期', '权责虽退、威望犹存', '受人敬重、顾问之誉'],
            '忌': ['旧疾易发、宜调护', '官非宜避、合约谨慎', '晚景压力、家事牵绊'], '中': ['按部就班、无大波澜'] },
  '印星': { '喜': ['晚景安养、名声传承', '得晚辈敬重、书香传家', '心性安定、学习吸收力强'],
            '忌': ['思多行少、孤僻', '文书纰漏、合约藏陷阱', '长辈健康或关系紧张、家事牵绊'], '中': ['学习平稳、按部就班'] },
  '食伤': { '喜': ['晚岁创作、含饴弄孙', '技艺传习、口碑渐起', '口才得利、表达顺畅'],
            '忌': ['言多招嫌、口舌', '精力不济、晚辈耗神', '投资冒进、创意难落地'], '中': ['表达平顺、技艺渐进'] },
  '比劫': { '喜': ['旧友相聚、门生相助', '同辈扶持、合作平淡', '人气旺、客源互介'],
            '忌': ['同辈竞争、钱财防骗', '朋友反目、宜疏远', '冲动消费、跟风破耗'], '中': ['人际平顺、分合有常'] }
};

/* ============ 3c. 五派专属事象字典（school-aware，消除“五派吐同一串”的硬伤） ============ */
/* 设计：各派按自家视角（格局用神/盲派做功/调候寒暖/新派旺衰扶抑/病药偏枯）对同一十神类×喜忌给不同措辞。
 *  - 十神派（子平格局派/盲派/新派）按 十神类×喜忌 取词；
 *  - 五行派（调候派/病药派）按 标签(_TAG) 取词（其判定本就走五行，与十神类无关）。
 * 成人（16–59）走本字典；儿童走 EV_SCHOOL_CHILD、晚年走 EV_SCHOOL_LATE（措辞随龄、五派分化）。 */
const EV_SCHOOL = {
  '子平格局派': {
    '官杀': { '喜': ['成格得力、得名掌权之机', '格局清正、获表彰得位进阶', '官印相生、文书权责顺遂'],
              '忌': ['用神受冲、易破格失势', '格局受扰、职位易动荡', '官非之扰、权责宜慎'],
              '中': ['格局平稳、按部就班', '无破无成、守成即可'] },
    '财星': { '喜': ['财滋杀、财官相生进财得权', '用神得财、财源拓展', '因财得位、经营顺遂'],
              '忌': ['财坏印、用神受损财务宜慎', '财星破格、投资易损', '因财生波、合约须清'],
              '中': ['财务平顺、无大波澜', '财守常位、宜守不宜冒'] },
    '印星': { '喜': ['印绶护官、学业顺贵人提携', '用神得印、文书契约顺', '格局得辅、家宅宁心性安'],
              '忌': ['印重浊格、思多行少', '印被财伤、文书藏瑕', '用神受晦、宜防虚名'],
              '中': ['学习平稳、按部就班', '贵人平常、无破无成'] },
    '食伤': { '喜': ['食伤泄秀、才华受赏', '吐秀生财、作品言论得誉', '用神得秀、技艺开张'],
              '忌': ['食伤坏官、口舌是非', '秀气外泄、精力不济', '伤官见官、宜防争执'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、格局有依合作得力', '同辈相助、团队有成', '用神得朋、竞争得胜'],
              '忌': ['比劫夺财、用神被分', '同辈争锋、宜防分利', '比劫坏格、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '盲派': {
    '官杀': { '喜': ['财官得用、取官杀到手', '做功得力、事业交接换位', '制去阻碍、实利落实'],
              '忌': ['做功乏力、制不住反被制', '权位落空、宜守勿争', '压力难卸、宜防虚耗'],
              '中': ['做功平平、宜踏实', '官杀不显、顺其自然'] },
    '财星': { '喜': ['实财到手、宾位取财', '进财得机遇、经营得利', '财星做功、外财可获'],
              '忌': ['财虚做功、进财落空', '比劫分财、宜防被骗', '财来财去、落袋宜慎'],
              '中': ['财务平顺、按部就班', '财守常位、宜守'] },
    '印星': { '喜': ['印作资源、得长辈实惠', '文书落实、凭印得便', '印星做功、安稳有靠'],
              '忌': ['印虚无功、名实难符', '文书落空、宜防纰漏', '印被财伤、家事牵绊'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤生财、技术变现', '才艺换利、副业开张', '做功有靠、表达得利'],
              '忌': ['食伤无制、言多招损', '秀而不实、创意难落', '泄身过甚、精力不济'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身做功、同辈助力', '合作分利、团队有成', '宾位得朋、竞争得胜'],
              '忌': ['比劫夺财、实利被分', '同辈争锋、宜防反目', '做功被夺、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '新派（民国）': {
    '官杀': { '喜': ['日主堪任、担得起权责', '七杀耗身得宜、谋事顺遂', '制化得力、管理幅度得宜'],
              '忌': ['身弱不胜、压力大增', '官杀攻身、宜防责难', '日主失衡、职位易动荡'],
              '中': ['职务平顺、按部就班', '权责相当、守成即可'] },
    '财星': { '喜': ['日主担财、得财顺遂', '耗身得宜、进财顺遂', '财星得用、经营得利'],
              '忌': ['身弱财重、开销陡增', '财多累身、投资宜慎', '担财不足、防破财'],
              '中': ['财务平顺、进出相当', '小进小出、收支平衡'] },
    '印星': { '喜': ['印旺生身、学习顺贵人助', '身得生扶、资质受赏', '文书得力、契约顺'],
              '忌': ['印重滞身、思多行少', '生扶太过、惰怠孤僻', '文书藏瑕、宜防纰漏'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤泄秀得宜、才华受赏', '吐秀生财、表达得利', '身旺泄秀、技艺开张'],
              '忌': ['身弱泄甚、精力不济', '言多招损、口舌是非', '秀而不实、投资冒进'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、同辈助力', '身弱得朋、合作分利', '团队协力、竞争得胜'],
              '忌': ['比劫夺财、钱财被分', '同辈争锋、朋友反目', '身旺无依、冲动消费'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '调候派': { '_TAG': {
    '喜': ['寒暖得济、身心舒坦', '健康安和、诸事顺调', '调候得宜、谋求顺遂'],
    '中': ['于调候无大碍、顺原局', '寒暖平顺、宜守成', '燥湿无偏、按部就班'],
    '忌': ['寒暖失调、身心宜护', '燥湿乖违、事多乖蹇', '调候反伤、健康宜顾'] } },
  '病药派': { '_TAG': {
    '喜': ['引药见效、偏枯得解', '药力得济、困局渐解', '转机可期、偏枯得缓'],
    '中': ['病药无引动、平稳守常', '偏枯不显、顺原局', '无新病药、宜循常'],
    '忌': ['引病加重、偏枯复显', '病重药轻、困局难解', '偏枯加剧、事多乖舛'] } }
};
/* ============ 3d. 五派专属事象，儿童版（<16岁，school-aware，措辞随龄） ============ */
const EV_SCHOOL_CHILD = {
  '子平格局派': {
    '官杀': { '喜': ['用神得力、课业顺成', '格局清正、考试得名次、得师长赏识', '官印相生、纪律自觉受嘉许'],
              '忌': ['用神受冲、易破格失势、学业受扰', '格局受扰、名次易落', '官非之扰、纪律宜慎'],
              '中': ['格局平稳、按部就班', '无破无成、守成即可'] },
    '财星': { '喜': [], '忌': [], '中': [] },
    '印星': { '喜': ['印绶护格、启蒙得宜、得长辈赏识', '用神得印、好书相伴、心性安定', '格局得辅、学业有靠'],
              '忌': ['印重浊格、思多行少、惰怠', '印被财伤、作业藏瑕', '用神受晦、宜防虚名'],
              '中': ['学习平稳、按部就班', '贵人平常、无破无成'] },
    '食伤': { '喜': ['食伤泄秀、才艺受赏', '吐秀生财、义卖比赛得誉', '用神得秀、技艺开张'],
              '忌': ['食伤坏官、口舌是非、与同伴生隙', '秀气外泄、精力不济、贪玩误学', '伤官见官、宜防争执'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、格局有依、合作得力', '同辈相助、小组活动有成', '用神得朋、比赛竞争得胜'],
              '忌': ['比劫夺财、零用被分、易丢物', '同辈争锋、宜防分利', '比劫坏格、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '盲派': {
    '官杀': { '喜': ['做功得力、实利落实、学业有交接换位', '取官杀到手、名次资格得手', '制去阻碍、考试过关'],
              '忌': ['做功乏力、制不住反被制', '名次落空、宜守勿争', '压力难卸、宜防虚耗'],
              '中': ['做功平平、宜踏实', '官杀不显、顺其自然'] },
    '财星': { '喜': [], '忌': [], '中': [] },
    '印星': { '喜': ['印作资源、得长辈实惠、凭印得便、奖状证书可期', '文书落实、凭印得奖', '印星做功、安稳有靠'],
              '忌': ['印虚无功、名实难符', '作业落空、宜防纰漏', '印被财伤、家事牵绊'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤生财、义卖技术变现', '才艺换利、小创作开张', '做功有靠、表达得利'],
              '忌': ['食伤无制、言多招损、与同伴生隙', '秀而不实、创意难落', '泄身过甚、精力不济'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身做功、同辈助力', '合作分利、小组活动有成', '宾位得朋、比赛竞争得胜'],
              '忌': ['比劫夺财、零用被分', '同辈争锋、宜防反目', '做功被夺、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '新派（民国）': {
    '官杀': { '喜': ['日主堪任、担得起学业名次', '七杀耗身得宜、比赛竞争得利', '制化得力、考试顺'],
              '忌': ['身弱不胜、压力大增、课业吃力', '官杀攻身、宜防责难', '日主失衡、名次易落'],
              '中': ['纪律平顺、按部就班', '权责相当、守成即可'] },
    '财星': { '喜': [], '忌': [], '中': [] },
    '印星': { '喜': ['印旺生身、学习顺、资质受赏', '身得生扶、记问渐佳', '文书得力、作业顺'],
              '忌': ['印重滞身、思多行少、惰怠', '生扶太过、孤僻', '作业藏瑕、宜防纰漏'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤泄秀得宜、才艺受赏', '吐秀生财、表达得利', '身旺泄秀、技艺开张'],
              '忌': ['身弱泄甚、精力不济、贪玩误学', '言多招损、与同伴生隙', '秀而不实、小创作冒进'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、同辈助力', '身弱得朋、合作分利', '小组协力、比赛竞争得胜'],
              '忌': ['比劫夺财、零用被分、易丢物', '同辈争锋、朋友反目', '身旺无依、冲动消费'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  }
};
/* ============ 3e. 五派专属事象，晚年版（≥60岁，school-aware，措辞随龄） ============ */
const EV_SCHOOL_LATE = {
  '子平格局派': {
    '官杀': { '喜': ['晚岁声名、格局得彰、子女功名可期', '官印相生、顾问威望犹存', '成格之象、得社会敬重'],
              '忌': ['用神受冲、易破格失势、晚景宜稳', '格局受扰、家事牵绊', '官非之扰、权责宜慎'],
              '中': ['格局平稳、按部就班', '无破无成、守成即可'] },
    '财星': { '喜': ['财滋用神、晚景积蓄安稳', '财官相生、资产保值得宜', '因财得位、家宅财务宽裕'],
              '忌': ['财坏印、用神受损、财务宜慎', '财星破格、易损', '因财生波、合约须清'],
              '中': ['财务平顺、无大波澜', '财守常位、宜守不宜冒'] },
    '印星': { '喜': ['印绶护格、晚景安养、名声传承', '用神得印、书香传家', '格局得辅、得晚辈敬重'],
              '忌': ['印重浊格、思多行少', '印被财伤、文书藏瑕', '用神受晦、宜防虚名'],
              '中': ['学习平稳、按部就班', '贵人平常、无破无成'] },
    '食伤': { '喜': ['食伤泄秀、晚岁创作受赏', '吐秀生财、技艺传习得誉', '用神得秀、含饴弄孙'],
              '忌': ['食伤坏官、口舌是非', '秀气外泄、精力不济', '伤官见官、宜防争执'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、格局有依、旧友相助', '同辈相助、门生有成', '用神得朋、竞争得胜'],
              '忌': ['比劫夺财、子孙耗财、宜节用', '同辈争锋、宜防分利', '比劫坏格、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '盲派': {
    '官杀': { '喜': ['做功得力、实利落实、晚岁交接传承顺', '取官杀到手、子女功名得手', '制去阻碍、家事过关'],
              '忌': ['做功乏力、制不住反被制', '权位落空、宜守勿争', '压力难卸、宜防虚耗'],
              '中': ['做功平平、宜踏实', '官杀不显、顺其自然'] },
    '财星': { '喜': ['宾位取财、积蓄利息到手、实财落实', '财星做功、资产保值可获', '财星得用、晚景宽裕'],
              '忌': ['财虚做功、进财落空', '比劫分财、宜防被骗', '财来财去、落袋宜慎'],
              '中': ['财务平顺、按部就班', '财守常位、宜守'] },
    '印星': { '喜': ['印作资源、得晚辈实惠、凭印得便', '文书落实、凭印得安养', '印星做功、安稳有靠'],
              '忌': ['印虚无功、名实难符', '文书落空、宜防纰漏', '印被财伤、家事牵绊'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤生财、技艺变现', '才艺换利、晚岁开张', '做功有靠、表达得利'],
              '忌': ['食伤无制、言多招损', '秀而不实、创意难落', '泄身过甚、精力不济'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身做功、旧友助力', '合作分利、门生有成', '宾位得朋、竞争得胜'],
              '忌': ['比劫夺财、子孙耗财', '同辈争锋、宜防反目', '做功被夺、合作生隙'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  },
  '新派（民国）': {
    '官杀': { '喜': ['日主堪任、担得起声名权责', '七杀耗身得宜、晚景顺遂', '制化得力、威望得彰'],
              '忌': ['身弱不胜、压力大增、旧疾易发', '官杀攻身、宜防责难', '日主失衡、晚景宜稳'],
              '中': ['职务平顺、按部就班', '权责相当、守成即可'] },
    '财星': { '喜': ['日主担财、积蓄安稳', '耗身得宜、进财顺遂', '财星得用、资产保值'],
              '忌': ['身弱财重、医疗开销陡增', '财多累身、宜防破财', '担财不足、子孙耗财'],
              '中': ['财务平顺、进出相当', '小进小出、收支平衡'] },
    '印星': { '喜': ['印旺生身、晚景安养、得晚辈敬重', '身得生扶、名声传承', '文书得力、契约顺'],
              '忌': ['印重滞身、思多行少', '生扶太过、孤僻', '文书藏瑕、宜防纰漏'],
              '中': ['学习平稳、按部就班', '贵人平常、无功无过'] },
    '食伤': { '喜': ['食伤泄秀得宜、晚岁创作受赏', '吐秀生财、表达得利', '身旺泄秀、技艺传习'],
              '忌': ['身弱泄甚、精力不济', '言多招损、口舌', '秀而不实、冒进难成'],
              '中': ['表达平顺、技艺渐进', '才思平常、无大起落'] },
    '比劫': { '喜': ['比劫帮身、旧友助力', '身弱得朋、合作分利', '门生协力、竞争得胜'],
              '忌': ['比劫夺财、子孙耗财', '同辈争锋、朋友反目', '身旺无依、冲动消费'],
              '中': ['人际平顺、分合有常', '合作平淡、无大得失'] }
  }
};
/* ============ 3f. 层级专属事象（大运/流年/流月/流日 各一套措辞，杜绝“跨层同串、流日说开张”的量级错乱） ============ */
/* 设计：大运回退各池 base（最丰富，cap=6）；流年/流月/流日 取本层专属措辞（cap=4/2/1）。
 *  - 尺度词：流年“年内”写在池内；流月“流月”、流日“流日”由五派解读章节的 areaNotes 前缀统一提供，本池内不带尺度前缀。
 *  - 成人（adult）五派全 4 层；儿童/晚年（child/late）仅增 流月/流日 两层专属，大运/流年取年龄专用 base，使“掌权/置业”不落错龄。
 *  - 五行派（调候/病药）无年龄变体，adult 层即年龄中性，child/late 回退主库 base。 */
const EV_LVL = {
  'adult': {
    '子平格局派': {
      '流年': {
        '官杀': { '喜':['年内成格得力、得名掌权可期','格局清正、表彰得位有望','官印相生、文书权责顺'],
                  '忌':['年内用神受冲、易破格失势','格局受扰、职位易动荡','官非之扰、权责宜慎'],
                  '中':['年内格局平稳、按部就班','无破无成、守成即可'] },
        '财星': { '喜':['年内财滋杀、财官相生进财得权','用神得财、财源拓展','因财得位、经营顺遂'],
                  '忌':['年内财坏印、用神受损财务宜慎','财星破格、投资易损','因财生波、合约须清'],
                  '中':['年内财务平顺、无大波澜','财守常位、宜守不宜冒'] },
        '印星': { '喜':['年内印绶护官、学业顺贵人提携','用神得印、文书契约顺','格局得辅、家宅宁心性安'],
                  '忌':['年内印重浊格、思多行少','印被财伤、文书藏瑕','用神受晦、宜防虚名'],
                  '中':['年内学习平稳、按部就班','贵人平常、无破无成'] },
        '食伤': { '喜':['年内食伤泄秀、才华受赏','吐秀生财、作品言论得誉','用神得秀、技艺开张'],
                  '忌':['年内食伤坏官、口舌是非','秀气外泄、精力不济','伤官见官、宜防争执'],
                  '中':['年内表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['年内比劫帮身、格局有依合作得力','同辈相助、团队有成','用神得朋、竞争得胜'],
                  '忌':['年内比劫夺财、用神被分','同辈争锋、宜防分利','比劫坏格、合作生隙'],
                  '中':['年内人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流月': {
        '官杀': { '喜':['格局得力、得名之机渐显','清正进阶、小有嘉许','官印相生、文书顺手'],
                  '忌':['用神受冲、防破格失势','格局受扰、职位小动','官非之扰、权责宜慎'],
                  '中':['格局平稳、按部就班','无破无成、守成即可'] },
        '财星': { '喜':['财滋用神、财源有进','用神得财、小有进项','因财得位、经营顺手'],
                  '忌':['财坏印、财务宜慎','财星破格、投资宜慎','因财生波、合约须清'],
                  '中':['财务平顺、进出相当','财守常位、宜守'] },
        '印星': { '喜':['印绶护格、学业有进','用神得印、文书顺手','格局得辅、心境安宁'],
                  '忌':['印重浊格、思多行少','文书藏瑕、宜防纰漏','用神受晦、防虚名'],
                  '中':['学习平稳、按部就班','贵人平常、无破无成'] },
        '食伤': { '喜':['食伤泄秀、才艺小成','吐秀生财、创作顺手','用神得秀、技艺渐熟'],
                  '忌':['食伤坏官、口舌宜慎','秀气外泄、精力不济','宜防争执'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、合作得力','同辈相助、小组有成','竞争得胜'],
                  '忌':['比劫夺财、宜防分利','同辈争锋、合作生隙','宜防分利'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['格局小成、得名之机微露','清正有进','文书权责小顺'],
                  '忌':['用神受冲、防小失','格局受扰、宜稳','权责宜慎'],
                  '中':['格局平稳、按部就班','守成即可'] },
        '财星': { '喜':['财星当值、小有进项','用神得财、顺手','经营小顺'],
                  '忌':['财务宜慎、防小损','投资宜慎','合约须清'],
                  '中':['财务平顺、小进小出','守常即可'] },
        '印星': { '喜':['印绶护格、学有小得','用神得印、文书小顺','心境安宁'],
                  '忌':['思多行少、宜务实','文书宜核','防虚名'],
                  '中':['学习平稳、按部就班','平顺即可'] },
        '食伤': { '喜':['食伤泄秀、灵感闪现','才艺小成、表达得利','技艺小成'],
                  '忌':['言多宜慎、防口舌','精力宜养','宜防争执'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['同辈相助、小有合力','合作得力','竞争小胜'],
                  '忌':['同辈宜和、防分利','合作生隙','宜防争'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '盲派': {
      '流年': {
        '官杀': { '喜':['年内财官得用、取官杀到手','做功得力、事业交接换位','制去阻碍、实利落实'],
                  '忌':['年内做功乏力、制不住反被制','权位落空、宜守勿争','压力难卸、宜防虚耗'],
                  '中':['年内做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜':['年内实财到手、宾位取财','进财得机遇、经营得利','财星做功、外财可获'],
                  '忌':['年内财虚做功、进财落空','比劫分财、宜防被骗','财来财去、落袋宜慎'],
                  '中':['年内财务平顺、按部就班','财守常位、宜守'] },
        '印星': { '喜':['年内印作资源、得长辈实惠','文书落实、凭印得便','印星做功、安稳有靠'],
                  '忌':['年内印虚无功、名实难符','文书落空、宜防纰漏','印被财伤、家事牵绊'],
                  '中':['年内学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['年内食伤生财、技术变现','才艺换利、副业开张','做功有靠、表达得利'],
                  '忌':['年内食伤无制、言多招损','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['年内表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['年内比劫帮身做功、同辈助力','合作分利、团队有成','宾位得朋、竞争得胜'],
                  '忌':['年内比劫夺财、实利被分','同辈争锋、宜防反目','做功被夺、合作生隙'],
                  '中':['年内人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流月': {
        '官杀': { '喜':['财官得用、取官杀到手','做功得力、事业小交接','制去阻碍、实利落实'],
                  '忌':['做功乏力、宜守勿争','权位落空、宜稳','压力难卸、宜防虚耗'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜':['实财到手、宾位取财','进财得机遇、经营小利','财星做功、外财可期'],
                  '忌':['财虚做功、进财落空','比劫分财、宜防被骗','财来财去、落袋宜慎'],
                  '中':['财务平顺、按部就班','财守常位、宜守'] },
        '印星': { '喜':['印作资源、得长辈实惠','文书落实、凭印得便','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','文书落空、宜防纰漏','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤生财、技术小变现','才艺换利、副业小开','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身做功、同辈助力','合作分利、小组有成','宾位得朋、竞争得胜'],
                  '忌':['比劫夺财、实利被分','同辈争锋、宜防反目','做功被夺、合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['财官得用、小有进位','做功得力、事务顺手','制去阻碍、实利小落实'],
                  '忌':['做功乏力、宜守','权位落空、宜稳','压力宜卸'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜':['实财到手、小有进项','进财得机遇、经营小利','财星做功、外财可期'],
                  '忌':['财虚、进财落空','比劫分财、宜防骗','财来财去、落袋宜慎'],
                  '中':['财务平顺、小进小出','财守常位、宜守'] },
        '印星': { '喜':['印作资源、得长辈实惠','文书落实、凭印得便','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','文书落空、宜核','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤生财、技术小变现','才艺换利、随手开张','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常'] },
        '比劫': { '喜':['同辈助力、合作小成','宾位得朋、竞争小胜'],
                  '忌':['比劫夺财、宜防分','同辈争锋、宜防反目','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '新派（民国）': {
      '流年': {
        '官杀': { '喜':['年内日主堪任、担得起权责','七杀耗身得宜、谋事顺遂','制化得力、管理幅度得宜'],
                  '忌':['年内身弱不胜、压力大增','官杀攻身、宜防责难','日主失衡、职位易动荡'],
                  '中':['年内职务平顺、按部就班','权责相当、守成即可'] },
        '财星': { '喜':['年内日主担财、得财顺遂','耗身得宜、进财顺遂','财星得用、经营得利'],
                  '忌':['年内身弱财重、开销陡增','财多累身、投资宜慎','担财不足、防破财'],
                  '中':['年内财务平顺、进出相当','小进小出、收支平衡'] },
        '印星': { '喜':['年内印旺生身、学习顺贵人助','身得生扶、资质受赏','文书得力、契约顺'],
                  '忌':['年内印重滞身、思多行少','生扶太过、惰怠孤僻','文书藏瑕、宜防纰漏'],
                  '中':['年内学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['年内食伤泄秀得宜、才华受赏','吐秀生财、表达得利','身旺泄秀、技艺开张'],
                  '忌':['年内身弱泄甚、精力不济','言多招损、口舌是非','秀而不实、投资冒进'],
                  '中':['年内表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['年内比劫帮身、同辈助力','身弱得朋、合作分利','团队协力、竞争得胜'],
                  '忌':['年内比劫夺财、钱财被分','同辈争锋、朋友反目','身旺无依、冲动消费'],
                  '中':['年内人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流月': {
        '官杀': { '喜':['日主堪任、权责小进','七杀耗身得宜、谋事顺','制化得力、管理得宜'],
                  '忌':['身弱不胜、压力小增','官杀攻身、宜防责难','日主失衡、职位宜稳'],
                  '中':['职务平顺、按部就班','权责相当、守成即可'] },
        '财星': { '喜':['日主担财、小有进项','耗身得宜、进财顺手','财星得用、经营小利'],
                  '忌':['身弱财重、开销小增','财多累身、投资宜慎','担财不足、防破财'],
                  '中':['财务平顺、进出相当','小进小出、收支平衡'] },
        '印星': { '喜':['印旺生身、学有小得','身得生扶、资质受赏','文书得力、顺手'],
                  '忌':['印重滞身、思多行少','生扶太过、惰怠','文书藏瑕、宜核'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤泄秀得宜、才艺小成','吐秀生财、表达得利','身旺泄秀、技艺渐熟'],
                  '忌':['身弱泄甚、精力不济','言多招损、口舌宜慎','秀而不实、投资宜慎'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、同辈助力','身弱得朋、合作小成','竞争小胜'],
                  '忌':['比劫夺财、宜防分','同辈争锋、朋友反目','身旺无依、冲动消费'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['日主堪任、小有进位','七杀耗身得宜、谋事顺','制化得力、事务顺手'],
                  '忌':['身弱不胜、宜稳','官杀攻身、宜防责难','日主失衡、宜守'],
                  '中':['职务平顺、按部就班','权责相当、守成即可'] },
        '财星': { '喜':['日主担财、小有进项','耗身得宜、顺手','财星得用、经营小利'],
                  '忌':['身弱财重、开销小增','财多累身、宜慎','担财不足、防破财'],
                  '中':['财务平顺、小进小出','收支平衡'] },
        '印星': { '喜':['印旺生身、学有小得','身得生扶、资质受赏','文书得力、顺手'],
                  '忌':['印重滞身、宜务实','生扶太过、宜动','文书宜核'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤泄秀得宜、灵感闪现','吐秀生财、表达得利','身旺泄秀、技艺小成'],
                  '忌':['身弱泄甚、精力宜养','言多宜慎','秀而不实、宜守'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['同辈助力、合作小成','身弱得朋、小有合力','竞争小胜'],
                  '忌':['比劫夺财、宜防分','同辈争锋、宜防反目','身旺无依、宜稳'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '调候派': {
      '流年': { '_TAG': { '喜':['年内寒暖得济、身心舒坦','健康安和、诸事顺调','调候得宜、谋求顺遂'],
                '中':['年内于调候无大碍、顺原局','寒暖平顺、宜守成','燥湿无偏、按部就班'],
                '忌':['年内寒暖失调、身心宜护','燥湿乖违、事多乖蹇','调候反伤、健康宜顾'] } },
      '流月': { '_TAG': { '喜':['寒暖得济、身心舒坦','健康安和、诸事顺调','调候得宜、谋求顺遂'],
                '中':['于调候无大碍、顺原局','寒暖平顺、宜守成','燥湿无偏、按部就班'],
                '忌':['寒暖失调、身心宜护','燥湿乖违、事多乖蹇','调候反伤、健康宜顾'] } },
      '流日': { '_TAG': { '喜':['寒暖得济、身心舒坦','健康安和、诸事顺调','调候得宜、谋求顺遂'],
                '中':['于调候无大碍、顺原局','寒暖平顺、宜守成','燥湿无偏、按部就班'],
                '忌':['寒暖失调、身心宜护','燥湿乖违、事多乖蹇','调候反伤、健康宜顾'] } }
    },
    '病药派': {
      '流年': { '_TAG': { '喜':['年内引药见效、偏枯得解','药力得济、困局渐解','转机可期、偏枯得缓'],
                '中':['年内病药无引动、平稳守常','偏枯不显、顺原局','无新病药、宜循常'],
                '忌':['年内引病加重、偏枯复显','病重药轻、困局难解','偏枯加剧、事多乖舛'] } },
      '流月': { '_TAG': { '喜':['引药见效、偏枯得解','药力得济、困局渐解','转机可期、偏枯得缓'],
                '中':['病药无引动、平稳守常','偏枯不显、顺原局','无新病药、宜循常'],
                '忌':['引病加重、偏枯复显','病重药轻、困局难解','偏枯加剧、事多乖舛'] } },
      '流日': { '_TAG': { '喜':['引药见效、偏枯得解','药力得济、困局渐解','转机可期、偏枯得缓'],
                '中':['病药无引动、平稳守常','偏枯不显、顺原局','无新病药、宜循常'],
                '忌':['引病加重、偏枯复显','病重药轻、困局难解','偏枯加剧、事多乖舛'] } }
    }
  },
  'child': {
    '子平格局派': {
      '流月': {
        '官杀': { '喜':['用神得力、课业小成','格局清正、考试小得名次','官印相生、纪律受嘉许'],
                  '忌':['用神受冲、学业小扰','格局受扰、名次易落','纪律宜慎'],
                  '中':['格局平稳、按部就班','无破无成、守成即可'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印绶护格、启蒙得宜','用神得印、好书相伴','格局得辅、学业有靠'],
                  '忌':['印重浊格、思多行少','作业藏瑕','宜防虚名'],
                  '中':['学习平稳、按部就班','贵人平常、无破无成'] },
        '食伤': { '喜':['食伤泄秀、才艺小成','吐秀生财、义卖小得誉','用神得秀、技艺渐熟'],
                  '忌':['食伤坏官、口舌宜慎','精力不济、贪玩误学','宜防争执'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、合作小成','同辈相助、小组有成','比赛竞争小胜'],
                  '忌':['比劫夺财、零用被分','同辈争锋、宜防分利','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['用神得力、课业小得','格局清正、小有名次','纪律受嘉许'],
                  '忌':['用神受冲、宜稳','名次宜守','纪律宜慎'],
                  '中':['格局平稳、按部就班','守成即可'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印绶护格、启蒙得宜','用神得印、好书相伴','学业有靠'],
                  '忌':['思多行少、宜务实','作业宜核','宜防虚名'],
                  '中':['学习平稳、按部就班','平顺即可'] },
        '食伤': { '喜':['食伤泄秀、才艺小成','吐秀生财、义卖小得','技艺渐熟'],
                  '忌':['言多宜慎、防口舌','精力宜养','宜防争执'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['同辈相助、合作小成','小组有成','比赛小胜'],
                  '忌':['零用被分、宜防','同辈宜和','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '盲派': {
      '流月': {
        '官杀': { '喜':['做功得力、学业小交接','取官杀到手、名次资格小得','制去阻碍、考试过关'],
                  '忌':['做功乏力、宜守','名次落空、宜稳','压力难卸、宜防虚耗'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印作资源、得长辈实惠','文书落实、凭印得奖','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','作业落空、宜防纰漏','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤生财、义卖小变现','才艺换利、小创作开张','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身做功、同辈助力','合作分利、小组有成','宾位得朋、比赛小胜'],
                  '忌':['比劫夺财、零用被分','同辈争锋、宜防反目','做功被夺、合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['做功得力、学业小进','取官杀到手、小得名次','制去阻碍、考试小过关'],
                  '忌':['做功乏力、宜守','名次落空、宜稳','压力宜卸'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印作资源、得长辈实惠','文书落实、凭印得便','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','作业落空、宜核','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤生财、义卖小变现','才艺换利、随手开张','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常'] },
        '比劫': { '喜':['同辈助力、合作小成','宾位得朋、比赛小胜'],
                  '忌':['零用被分、宜防','同辈争锋、宜防反目','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '新派（民国）': {
      '流月': {
        '官杀': { '喜':['日主堪任、课业小成','七杀耗身得宜、比赛小得利','制化得力、考试顺'],
                  '忌':['身弱不胜、压力大增','官杀攻身、宜防责难','名次易落'],
                  '中':['纪律平顺、按部就班','权责相当、守成即可'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印旺生身、学有小得','身得生扶、记问渐佳','文书得力、作业顺'],
                  '忌':['印重滞身、思多行少','生扶太过、孤僻','作业藏瑕、宜核'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤泄秀得宜、才艺小成','吐秀生财、表达得利','身旺泄秀、技艺渐熟'],
                  '忌':['身弱泄甚、精力不济','言多招损、宜防','秀而不实、小创作宜慎'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、同辈助力','身弱得朋、合作小成','小组竞争小胜'],
                  '忌':['比劫夺财、零用被分','同辈争锋、朋友反目','身旺无依、宜稳'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['日主堪任、课业小得','七杀耗身得宜、比赛小利','制化得力、考试顺'],
                  '忌':['身弱不胜、宜稳','官杀攻身、宜防责难','名次宜守'],
                  '中':['纪律平顺、按部就班','守成即可'] },
        '财星': { '喜': [], '忌': [], '中': [] },
        '印星': { '喜':['印旺生身、学有小得','身得生扶、记问渐佳','作业顺'],
                  '忌':['印重滞身、宜务实','生扶太过、宜动','作业宜核'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤泄秀得宜、才艺小成','吐秀生财、表达得利','身旺泄秀、技艺小成'],
                  '忌':['身弱泄甚、精力宜养','言多宜慎','秀而不实、宜守'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['同辈助力、合作小成','身弱得朋、比赛小胜'],
                  '忌':['零用被分、宜防','同辈争锋、宜防反目','身旺无依、宜稳'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    }
  },
  'late': {
    '子平格局派': {
      '流月': {
        '官杀': { '喜':['晚岁声名、格局小彰','官印相生、顾问威望犹存','成格之象、得敬重'],
                  '忌':['用神受冲、晚景宜稳','格局受扰、家事牵绊','权责宜慎'],
                  '中':['格局平稳、按部就班','无破无成、守成即可'] },
        '财星': { '喜':['财滋用神、积蓄小进','财官相生、资产保值','家宅财务宽裕'],
                  '忌':['财坏印、财务宜慎','易损','合约须清'],
                  '中':['财务平顺、无大波澜','财守常位、宜守'] },
        '印星': { '喜':['印绶护格、晚景安养','用神得印、书香传家','得晚辈敬重'],
                  '忌':['印重浊格、思多行少','文书藏瑕','宜防虚名'],
                  '中':['学习平稳、按部就班','贵人平常、无破无成'] },
        '食伤': { '喜':['食伤泄秀、晚岁创作小成','吐秀生财、技艺传习','含饴弄孙'],
                  '忌':['食伤坏官、口舌宜慎','精力不济','宜防争执'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、旧友小助','同辈相助、门生有成','竞争小胜'],
                  '忌':['比劫夺财、子孙耗财','同辈争锋、宜防分利','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['晚岁声名、格局小彰','官印相生、威望犹存','得敬重'],
                  '忌':['用神受冲、宜稳','家事牵绊','权责宜慎'],
                  '中':['格局平稳、按部就班','守成即可'] },
        '财星': { '喜':['财滋用神、积蓄小进','财官相生、家宅宽裕','资产保值'],
                  '忌':['财务宜慎、防小损','易损','合约须清'],
                  '中':['财务平顺、小进小出','财守常位、宜守'] },
        '印星': { '喜':['印绶护格、晚景安养','用神得印、书香传家','得晚辈敬重'],
                  '忌':['思多行少、宜务实','文书宜核','宜防虚名'],
                  '中':['学习平稳、按部就班','平顺即可'] },
        '食伤': { '喜':['食伤泄秀、晚岁创作小成','吐秀生财、技艺传习','含饴弄孙'],
                  '忌':['口舌宜慎','精力宜养','宜防争执'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['旧友小助','同辈相助、门生有成','竞争小胜'],
                  '忌':['子孙耗财、宜节','同辈宜和','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '盲派': {
      '流月': {
        '官杀': { '喜':['做功得力、晚岁交接小顺','取官杀到手、子女功名小得','制去阻碍、家事小过关'],
                  '忌':['做功乏力、宜守','权位落空、宜稳','压力难卸、宜防虚耗'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜':['宾位取财、积蓄利息到手','财星做功、资产保值','晚景宽裕'],
                  '忌':['财虚做功、进财落空','比劫分财、宜防骗','财来财去、落袋宜慎'],
                  '中':['财务平顺、按部就班','财守常位、宜守'] },
        '印星': { '喜':['印作资源、得晚辈实惠','文书落实、凭印得安养','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','文书落空、宜防纰漏','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤生财、技艺小变现','才艺换利、晚岁小开','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身做功、旧友小助','合作分利、门生有成','宾位得朋、竞争小胜'],
                  '忌':['比劫夺财、子孙耗财','同辈争锋、宜防反目','做功被夺、合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['做功得力、晚岁小顺','取官杀到手、子女小得','制去阻碍、家事小过关'],
                  '忌':['做功乏力、宜守','权位落空、宜稳','压力宜卸'],
                  '中':['做功平平、宜踏实','官杀不显、顺其自然'] },
        '财星': { '喜':['宾位取财、利息到手','财星做功、资产保值','晚景宽裕'],
                  '忌':['财虚、进财落空','比劫分财、宜防骗','财来财去、宜慎'],
                  '中':['财务平顺、小进小出','财守常位、宜守'] },
        '印星': { '喜':['印作资源、得晚辈实惠','文书落实、凭印得便','印星做功、安稳有靠'],
                  '忌':['印虚无功、名实难符','文书落空、宜核','印被财伤、家事牵绊'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤生财、技艺小变现','才艺换利、随手开张','做功有靠、表达得利'],
                  '忌':['食伤无制、言多宜慎','秀而不实、创意难落','泄身过甚、精力不济'],
                  '中':['表达平顺、技艺渐进','才思平常'] },
        '比劫': { '喜':['旧友小助','门生有成、宾位得朋','竞争小胜'],
                  '忌':['子孙耗财、宜节','同辈宜和','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    },
    '新派（民国）': {
      '流月': {
        '官杀': { '喜':['日主堪任、晚岁声名小进','七杀耗身得宜、晚景顺','制化得力、威望得彰'],
                  '忌':['身弱不胜、压力小增','官杀攻身、宜防责难','晚景宜稳'],
                  '中':['职务平顺、按部就班','权责相当、守成即可'] },
        '财星': { '喜':['日主担财、积蓄安稳','耗身得宜、小有进项','财星得用、资产保值'],
                  '忌':['身弱财重、医疗小增','财多累身、宜防破财','子孙耗财'],
                  '中':['财务平顺、进出相当','小进小出、收支平衡'] },
        '印星': { '喜':['印旺生身、晚景安养','身得生扶、名声传家','文书得力、顺手'],
                  '忌':['印重滞身、思多行少','生扶太过、孤僻','文书藏瑕、宜核'],
                  '中':['学习平稳、按部就班','贵人平常、无功无过'] },
        '食伤': { '喜':['食伤泄秀得宜、晚岁创作小成','吐秀生财、表达得利','身旺泄秀、技艺传习'],
                  '忌':['身弱泄甚、精力不济','言多招损、口舌','秀而不实、宜守'],
                  '中':['表达平顺、技艺渐进','才思平常、无大起落'] },
        '比劫': { '喜':['比劫帮身、旧友小助','身弱得朋、合作小成','门生竞争小胜'],
                  '忌':['比劫夺财、子孙耗财','同辈争锋、朋友反目','身旺无依、宜稳'],
                  '中':['人际平顺、分合有常','合作平淡、无大得失'] }
      },
      '流日': {
        '官杀': { '喜':['日主堪任、声名小进','七杀耗身得宜、晚景顺','制化得力、威望得彰'],
                  '忌':['身弱不胜、宜稳','官杀攻身、宜防责难','晚景宜稳'],
                  '中':['职务平顺、按部就班','守成即可'] },
        '财星': { '喜':['日主担财、积蓄安稳','耗身得宜、小有进项','资产保值'],
                  '忌':['身弱财重、医疗小增','财多累身、宜慎','子孙耗财'],
                  '中':['财务平顺、小进小出','收支平衡'] },
        '印星': { '喜':['印旺生身、晚景安养','身得生扶、名声传家','文书得力、顺手'],
                  '忌':['印重滞身、宜务实','生扶太过、宜动','文书宜核'],
                  '中':['学习平稳、按部就班','贵人平常'] },
        '食伤': { '喜':['食伤泄秀得宜、晚岁小成','吐秀生财、表达得利','身旺泄秀、技艺传习'],
                  '忌':['身弱泄甚、精力宜养','言多宜慎','秀而不实、宜守'],
                  '中':['表达平顺、小有进益','才思平常'] },
        '比劫': { '喜':['旧友小助','身弱得朋、合作小成','门生小胜'],
                  '忌':['子孙耗财、宜节','同辈宜和','合作生隙'],
                  '中':['人际平顺、分合有常','合作平淡'] }
      }
    }
  }
};
function evSchoolEvents(school, catKey, tag, age, lvl){
  // 层级专属措辞：大运回退各池 base；流年/流月/流日 取本层专属池（evSchoolEvents 第四参 lvl 驱动），使四层措辞完全不同。
  if(lvl && lvl!=='大运'){
    const grp = baziAgeStage(age) || 'adult';
    const L = EV_LVL[grp] && EV_LVL[grp][school];
    if(L && L[lvl]){
      const ld = L[lvl];
      if(ld._TAG && ld._TAG[tag] && ld._TAG[tag].length) return ld._TAG[tag];
      if(ld[catKey] && ld[catKey][tag] && ld[catKey][tag].length) return ld[catKey][tag];
    }
  }
  let pick = EV_SCHOOL;
  if(baziAgeStage(age)==='child') pick = EV_SCHOOL_CHILD;
  else if(baziAgeStage(age)==='late') pick = EV_SCHOOL_LATE;
  let sd = pick[school];
  if(!sd) sd = EV_SCHOOL[school];   // 调候/病药无年龄变体，回退主库（_TAG 年龄中性）
  if(!sd) return null;
  if(sd._TAG) return (sd._TAG[tag] && sd._TAG[tag].length) ? sd._TAG[tag] : null;
  if(sd[catKey] && sd[catKey][tag] && sd[catKey][tag].length) return sd[catKey][tag];
  return null;
}
function evPoolFor(age){
  if(baziAgeStage(age)==='child') return EV_BASE_CHILD;
  if(baziAgeStage(age)==='late') return EV_BASE_LATE;
  return EV_BASE;
}
/* 晚年/童年门控：桃花情缘、夫妻配偶类神煞与宫位强调，对相应年龄段失真，须剔除 */
function evGateSha(sha, age){
  if(age==null) return sha;
  if(baziAgeStage(age)==='late') return sha.filter(s => !/桃花|情缘|夫妻|配偶/.test(s));
  return sha;
}
function evGateEmph(emph, age){
  if(!emph) return emph;
  if(age!=null && (baziAgeStage(age)==='child' || baziAgeStage(age)==='late') && /配偶|夫妻|情缘|桃花/.test(emph)) return '';
  // 童年期：剔除职场/婚育类宫位强调（事件池已用儿童专用，强调行亦须同步）
  if(age!=null && baziAgeStage(age)==='child' && /配偶|夫妻|情缘|桃花|职场|上司|部下|调动|平台|官非|诉讼|降职|晋升|考公|合伙人/.test(emph)) return '';
  return emph;
}

/* ============ 4. 神煞 → 事件（简化自 bazi-schools.stepSha） ============ */
function evStepSha(BZ, gz, age){
  const z = gz[1], dg = BZ.dayGan, dz = BZ.dayZ, yz = BZ.yearZ;
  const YIMA = {'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','亥':'巳','卯':'巳','未':'巳','巳':'亥','酉':'亥','丑':'亥'};
  const TAO = {'申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','亥':'子','卯':'子','未':'子','巳':'午','酉':'午','丑':'午'};
  const GUI = {'甲':'丑未','戊':'丑未','庚':'丑未','乙':'子申','己':'子申','丙':'亥酉','丁':'亥酉','壬':'卯巳','癸':'卯巳','辛':'午寅'};
  const WEN = {'甲':'巳','乙':'午','丙':'申','戊':'申','丁':'酉','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯'};
  const out = [];
  if(YIMA[dz]===z || YIMA[yz]===z) out.push(baziAgeStage(age)==='child' ? '驿马临运，环境易变、家或居所易搬迁、出行增多' : '驿马临运，主远行搬迁、岗位调动或出差频繁');
  if(TAO[dz]===z || TAO[yz]===z) out.push((baziAgeStage(age)==='child') ? '人缘好、同伴相得、易得玩伴' : '桃花临运，情缘信号显露、人际缘旺');
  if(GUI[dg] && GUI[dg].indexOf(z)>=0) out.push('天乙贵人临运，得外力贵人扶持、逢凶化吉');
  if(WEN[dg]===z) out.push(baziAgeStage(age)==='late' ? '文昌临运，利文书、名声、文墨之务' : '文昌临运，利学业、文书、名声、考试');
  return out;
}

/* ============ 5. 十二长生 → 阶段事象 ============ */
function evCsMean(cs, age){
  const M = {
    '长生': '方生之机、事有开端',
    '沐浴': baziAgeStage(age)==='child' ? '性情敏感、心志未定' : baziAgeStage(age)==='late' ? '渐入情态、宜稳守' : '败地桃花、感情易动',
    '冠带': '渐进有成', '临官': '可任事、渐入佳境', '帝旺': '极盛、宜守成', '衰': '气渐退、宜稳',
    '病': '多烦、健康宜顾', '死': '无气、事多阻滞', '墓': '收敛、宜蓄', '绝': '困顿、宜蛰伏',
    '胎': '酝酿、宜待', '养': '滋养、渐复'
  };
  return cs ? M[cs] : '';
}

/* ============ 6. 年龄门控：统一走 xuanji-lib.js 唯一体系（ageGateEvents，词表 AGE_WORD） ============ */

/* ============ 7. 工具：本层与命局各柱的引动关系 ============ */
function evTriggered(BZ, gz){
  const z = gz[1], g = gz[0];
  const out = [];
  const labs = ['年','月','日','时'];
  BZ.zhis.forEach((pz, idx) => {
    const lab = labs[idx];
    if(pz === z){ out.push({lab, rel:'值'}); return; }
    if(pairIn(z, pz, DIZHI_CHONG)) out.push({lab, rel:'冲'});
    else if(pairIn(z, pz, DIZHI_HE6)) out.push({lab, rel:'合'});
    else if(pairIn(z, pz, DIZHI_XING)) out.push({lab, rel:'刑'});
    else if(pairIn(z, pz, DIZHI_HAI)) out.push({lab, rel:'害'});
    else if(pairIn(z, pz, DIZHI_PO)) out.push({lab, rel:'破'});
    else if(pairIn(z, pz, DIZHI_ANHE)) out.push({lab, rel:'暗合'});
  });
  BZ.gans.forEach((pg, idx) => {
    const lab = labs[idx];
    if(pairIn(g, pg, TIANGAN_CHONG)) out.push({lab, rel:'干冲'});
    else if(tianGanHe(g, pg)) out.push({lab, rel:'干合'});
  });
  return out;
}

/* 喜忌判定：先按十神类别（扶抑/流派喜忌集合），未命中再按五行（合成 xiWxEff/jiWxEff，中和日主走此路） */
function evTag(cats, xiCats, jiCats, xiWx, jiWx, g, z){
  let hit = null;
  cats.forEach(c => { if(xiCats.has(c)) hit = hit || '喜'; else if(jiCats.has(c)) hit = '忌'; });
  if(hit) return hit;
  const wxs = [GAN_WX[g], ...((HIDE[z] || [z]).map(h => GAN_WX[h]))];
  let h2 = null;
  wxs.forEach(w => { if(xiWx.indexOf(w)>=0) h2 = h2 || '喜'; else if(jiWx.indexOf(w)>=0) h2 = '忌'; });
  return h2 || '中';
}

/* ============ 8. 单事件原型构造 ============ */
function evMakeProto(BZ, gz, dg, palace, rel, cats, tag, isMale, age, lvl, year, opt){
  const catKey = cats[0]; // 取天干十神类别为主轴（更显明）
  const pool = evPoolFor(age);
  // 流派专属事象：儿童/晚年用 EV_SCHOOL_CHILD/LATE 年龄分化专用池，成人用 EV_SCHOOL；均按各派自家视角出词。
  const useSchool = !!(opt && opt.school);
  let base;
  if(useSchool){
    const se = evSchoolEvents(opt.school, catKey, tag, age, lvl);
    base = se ? se : ((pool[catKey] && pool[catKey][tag]) ? pool[catKey][tag] : (EV_BASE[catKey] && EV_BASE[catKey][tag] ? EV_BASE[catKey][tag] : EV_BASE['比劫']['中']));
  } else {
    base = (pool[catKey] && pool[catKey][tag]) ? pool[catKey][tag] : (EV_BASE[catKey] && EV_BASE[catKey][tag] ? EV_BASE[catKey][tag] : EV_BASE['比劫']['中']);
  }
  let events = base.map(e => e);
  // 宫位强调（补一句落点语境）
  const pInfo = EV_PALACE[palace];
  const emph = evGateEmph(pInfo && pInfo.emph && pInfo.emph[catKey], age);
  // 年龄门控（再保险，统一走 xuanji-lib 唯一体系）
  events = ageGateEvents(events, age);
  // 神煞 / 长生 事象
  const sha = evGateSha(evStepSha(BZ, gz, age), age);
  const cs = getChangSheng(dg, gz[1]);
  const csM = evCsMean(cs, age);
  return {
    palace: palace,
    palaceLife: pInfo ? pInfo.life : '全局气机',
    rel: rel,
    relTiming: EV_REL[rel] || '',
    cat: catKey,
    catFull: cats.join('') || catKey,
    tag: tag,
    core: catKey + '得引为' + (tag==='喜' ? '喜、利于成事' : tag==='忌' ? '忌、宜防其损' : '中、平守无波'),
    events: events,
    palaceEmph: emph || '',
    genderNote: evGenderNote(catKey, tag, isMale),
    sha: sha,
    cs: cs ? (cs + (csM ? ('：' + csM) : '')) : '',
    yingqi: (year ? (lvl + ' ' + year + ' 年：') : (lvl + '：')) + (EV_REL[rel] || '气机静守')
  };
}

/* ============ 9. 主入口 ============ */
function buildEventPrototypes(BZ, sel, opt){
  if(!BZ) return [];
  opt = opt || {};
  const A = getAnalysis(BZ);
  const dg = BZ.dayGan;
  // 喜忌集合：opt 提供则用之（流派切片）；否则扶抑
  let xiCats, jiCats, xiWx, jiWx;
  if(opt.xiCats){
    xiCats = new Set(opt.xiCats); jiCats = new Set(opt.jiCats || []);
    xiWx = opt.xiWx || []; jiWx = opt.jiWx || [];
  } else {
    xiCats = new Set((A.fu.xiCats || []).filter(t => ['比劫','食伤','财星','官杀','印星'].indexOf(t)>=0));
    jiCats = new Set((A.fu.jiCats || []).filter(t => ['比劫','食伤','财星','官杀','印星'].indexOf(t)>=0));
    xiWx = A.synthesis.xiWxEff || []; jiWx = A.synthesis.jiWxEff || [];
  }
  const isMale = (BZ.sex === 1 || BZ.sex === '男' || BZ.sex === true);
  const out = [];
  (sel || []).forEach(s => {
    const gz = (typeof s === 'string') ? s : (s.gz || '');
    if(!gz || gz.length < 2) return;
    const age = (s && typeof s === 'object' && s.age != null) ? s.age : null;
    const lvl = (s && typeof s === 'object' && s.lvl) ? s.lvl : ((s && typeof s === 'object' && s.kind) ? s.kind : '岁运');
    const year = (s && typeof s === 'object' && s.year != null) ? s.year : null;
    const cats = [shenCat(tenGod(dg, gz[0])), shenCat(tenGod(dg, zhiMain(gz[1])))];
    const tag = opt.forceTag || evTag(cats, xiCats, jiCats, xiWx, jiWx, gz[0], gz[1]);
    const trigs = evTriggered(BZ, gz);
    if(!trigs.length){
      out.push({ gz: gz, lvl: lvl, age: age, year: year, tag: tag, cat: cats.join(''),
        palace: '全局', rel: '值', protos: [ evMakeProto(BZ, gz, dg, '日', '值', cats, tag, isMale, age, lvl, year, opt) ] });
    } else {
      trigs.forEach(t => {
        out.push({ gz: gz, lvl: lvl, age: age, year: year, tag: tag, cat: cats.join(''),
          palace: t.lab, rel: t.rel, protos: [ evMakeProto(BZ, gz, dg, t.lab, t.rel, cats, tag, isMale, age, lvl, year, opt) ] });
      });
    }
  });
  return out;
}


// 易理象数：纯展示层（非断语）。将"五行生克过程模型"与"四土象数"两种易理观点体系化呈现，
// 并以本盘五行旺衰、缺失、流通套入过程模型，给出个性化"本命五行阶段偏重"衔接段。
// 展示层：不进入 synthesis/喜忌/格局/断语引擎
function renderYiliModule(BZ){
  if(!BZ) return '';
  const WX5=['木','火','土','金','水'];
  const wxb=w=>`<b class="${WX_CLASS[w]||''}">${w}</b>`;
  // 数据派生（全局函数，与页面其他模块同源）
  const _es=(typeof window!=='undefined'&&window.wxElementScore)?window.wxElementScore(BZ):null;
  const total=_es?Object.values(_es).reduce((a,b)=>a+b,0):0;
  const avg=total/5||1;
  const tier=wx=>{
    const e=_es?(_es[wx]||0):0;
    if(e<=1e-6) return '缺';
    if(e>1.4*avg) return '过旺';
    if(e>0.7*avg) return '偏旺';
    if(e<0.4*avg) return '偏弱';
    return '中和';
  };
  const _fc=(typeof window!=='undefined'&&window.flowChain5)?window.flowChain5(BZ,_es||{}):null;
  const breaks=_fc?(_fc.breaks||[]):[];
  const A=(typeof getAnalysis==='function')?getAnalysis(BZ):null;
  const dg=BZ.dayGan, dwx=(typeof GAN_WX!=='undefined')?GAN_WX[dg]:'';
  const mukuNote=(A&&A.muku&&A.muku.note)?A.muku.note:'四柱无辰戌丑未墓库之地。';
  // 四库（五行墓于辰戌丑未）与四土之性
  const KU_WX={'辰':'水','戌':'火','丑':'金','未':'木'};
  const KU_LABEL={'辰':'水库','戌':'火库','丑':'金库','未':'木库'};
  const KU_TU={'辰':'湿土，蓄水涵润','戌':'燥土，炎燥藏火','丑':'湿土，寒凝藏金','未':'燥土，温暖藏木'};
  const KU_ZG={'辰':'戊、乙、癸','戌':'戊、辛、丁','丑':'己、癸、辛','未':'己、丁、乙'};
  const KU_NOTE={'辰':'水之墓库，收藏蓄积','戌':'火之墓库，归藏待发','丑':'金之墓库，凝炼收藏','未':'木之墓库，生养归藏'};
  // 四时运行：相生为五气递进转化，相克为五气制衡纠偏；五行配五德各主其性
  const RUN={'木':'生发','火':'长养','土':'化育','金':'收敛','水':'藏纳'};
  const SHENG=[['木','火','春木生发，引夏火之长养（曲直生炎上）','木多生火而火晦'],['火','土','夏火长养，归季夏土之化育（炎上生稼穑）','火多生土而土焦'],['土','金','土之化育，成秋金之收敛（稼穑生从革）','土多生金而金埋'],['金','水','秋金收敛，蓄冬水之藏纳（从革生润下）','金多生水而水泛'],['水','木','冬水藏纳，滋来春木之生发（润下生曲直）','水多生木而木漂']];
  const KE=[['木','土','生发太过则疏土之板结（曲直疏稼穑）','土多木折','木旺乘土'],['火','金','长养太过则炼金之刚硬（炎上革从革）','金多火熄','火旺乘金'],['土','水','化育太过则止水之泛滥（稼穑制润下）','水多土流','土旺乘水'],['金','木','收敛太过则伐木之过亢（从革伐曲直）','木多金缺','金旺乘木'],['水','火','藏纳太过则制火之炎烈（润下制炎上）','火多水干','水旺乘火']];
  const WUDE=[['木','仁','正直、好生、恻隐，曲而能直'],['火','礼','明达、热忱、文采，光明磊落'],['土','信','敦厚、诚信、包容，承载万物'],['金','义','刚毅、果决、重诺，敢断敢行'],['水','智','沉静、聪慧、善谋，涵容万象']];

  let html='';

  // ===== 模块总引：五行即五气运行 =====
  html+=`<p class="ly-zh-p">五行者，五气运行之序也：木曲直而生发，火炎上而长养，土稼穑而化育，金从革而收敛，水润下而藏纳。五气周流，生克制化，万物于是成焉。</p>`;

  // ===== 本命五行阶段偏重（本命旺衰套入五气运行，表格呈现；能量属数据，列序与五行生克易理一致，置于末列）=====
  const tiers=WX5.map(w=>({w,t:tier(w)}));
  const strong=tiers.filter(o=>o.t==='过旺'||o.t==='偏旺').map(o=>o.w);
  const weak=tiers.filter(o=>o.t==='缺'||o.t==='偏弱').map(o=>o.w);
  const runJudge=wx=>{
    const e=_es?(_es[wx]||0):0;
    const t=tier(wx);
    if(t==='过旺'||t==='偏旺') return `${wxb(wx)}偏旺、过旺，${RUN[wx]}之运行最显`;
    if(t==='缺'||t==='偏弱') return `${wxb(wx)}偏弱、缺，${RUN[wx]}之运行不足，须岁运或外缘引动`;
    return `${wxb(wx)}中和，${RUN[wx]}之运行平顺`;
  };
  const tierRows=WX5.map(w=>`<tr><td>${wxb(w)}</td><td>${runJudge(w)}</td><td>${(_es?(_es[w]||0):0).toFixed(1)}</td></tr>`).join('');
  const evenTxt=(!strong.length&&!weak.length)?'五行分布较为均衡，五气运行各阶段相对匀称。':'';
  const breakTxt=breaks.length?`五行流通在 ${breaks.map(b=>`${wxb(b.from)}生${wxb(b.to)}`).join('、')} 处中断，所缺之${breaks.map(b=>wxb(b.to)).join('、')}环节（${breaks.map(b=>RUN[b.to]).join('、')}）接续不上，该阶段运行易滞。`:'';
  const mukuTxt=`墓库：${mukuNote}`;

  html+=`<details class="zr-mod zr-quant" id="zrWuxingStage" open><summary><span class="zr-t">本命五行阶段偏重</span></summary><div class="zr-mod-b">`;
  html+=`<div class="qtab-scroll"><table class="qtab yili-tbl yili-tier"><thead><tr><th>五行</th><th>运行判读</th><th>能量</th></tr></thead><tbody>${tierRows}</tbody></table></div>`;
  if(evenTxt) html+=`<p class="sub-note">${evenTxt}</p>`;
  if(breakTxt) html+=`<p class="sub-note">${breakTxt}</p>`;
  html+=`<p class="sub-note">${mukuTxt}</p>`;
  html+=`</div></details>`;

  // ===== 五行生克易理（四时运行、五德性格）=====
  /* 能量列：展示该生/克环节两五行之本命能量（完整五行能量生克）；日主所在五行加（日主）标记；两五行间以空格分隔 */
  const _eOf=wx=>_es?(_es[wx]||0):0;
  const _enCell=(a,b)=>{ const ta=(a===dwx)?wxb(a)+'（日主） ':wxb(a)+' ', tb=(b===dwx)?wxb(b)+'（日主） ':wxb(b)+' '; return `${ta}${_eOf(a).toFixed(1)}  ${tb}${_eOf(b).toFixed(1)}`; };
  const shengRows=SHENG.map(p=>`<tr><td>${wxb(p[0])}生${wxb(p[1])}</td><td>${p[2]}</td><td>${p[3]}</td><td>${_enCell(p[0],p[1])}</td></tr>`).join('');
  const keRows=KE.map(p=>`<tr><td>${wxb(p[0])}克${wxb(p[1])}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td>${_enCell(p[0],p[1])}</td></tr>`).join('');
  const wudeRows=WUDE.map(p=>`<tr><td>${wxb(p[0])}</td><td>${p[1]}</td><td>${p[2]}</td><td>${_eOf(p[0]).toFixed(1)}</td></tr>`).join('');
  html+=`<details class="zr-mod zr-quant" id="zrWuxingLi" open><summary><span class="zr-t">五行生克易理</span></summary><div class="zr-mod-b">`;
  html+=`<p class="ly-zh-p">五行非五种器物，乃五气运行之五阶段。《洪范》以曰字立义：水曰润下、火曰炎上、木曰曲直、金曰从革、土爰稼穑，句眼皆在运行方式，故观五行当以运行过程为本。</p>`;
  // 相生表：正生（运行之象）+ 反生 母多灭子 + 能量
  html+=`<div class="qtab-scroll"><table class="qtab yili-tbl yili-sc"><thead><tr><th>相生环节</th><th>运行之象</th><th>反生 母多灭子</th><th>能量</th></tr></thead><tbody>${shengRows}</tbody></table></div>`;
  // 相克表：正克（制衡之义）+ 反侮 反克 / 相乘 过克 + 能量
  html+=`<div class="qtab-scroll"><table class="qtab yili-tbl yili-sc"><thead><tr><th>相克环节</th><th>制衡之义</th><th>反侮 反克</th><th>相乘 过克</th><th>能量</th></tr></thead><tbody>${keRows}</tbody></table></div>`;
  html+=`<div class="qtab-scroll"><table class="qtab yili-tbl"><thead><tr><th>五行</th><th>五德</th><th>性格之象</th><th>能量</th></tr></thead><tbody>${wudeRows}</tbody></table></div>`;
  // 对盘主断：日主五行所主运行 + 最旺五行之德 + 流通断口 + 显著生克（纯展示，不进断语引擎）
  const dgRun=RUN[dwx]||'运行';
  const dgWu=WUDE.find(x=>x[0]===dwx);
  let judgeParts=[];
  if(dwx) judgeParts.push(`本命日主${wxb(dwx)}，属${dgRun}之运行，${dgWu?`其德主${dgWu[1]}，${dgWu[2].split('，')[0]}`:`其性随五行而定`}`);
  // 本命最旺五行之德：性情得此德支配最显
  const topWx=strong[0]||null;
  if(topWx){
    const wu=WUDE.find(x=>x[0]===topWx);
    if(wu) judgeParts.push(`命局${wxb(topWx)}五行最旺，性得${wu[1]}德之显，${wu[2].split('，')[0]}`);
  }
  // 流通断口：所缺环节即该运行滞后
  if(breaks.length) judgeParts.push(`五行流通至${breaks.map(b=>`${wxb(b.from)}生${wxb(b.to)}`).join('、')}处中断，对应${breaks.map(b=>RUN[b.to]).join('、')}之运行接续不上`);
  // 能量显著的相克环
  const kS=[
    ['土','水',()=>tier('土')==='过旺'||tier('土')==='偏旺'],['水','火',()=>tier('水')==='过旺'||tier('水')==='偏旺'],
    ['火','金',()=>tier('火')==='过旺'||tier('火')==='偏旺'],['金','木',()=>tier('金')==='过旺'||tier('金')==='偏旺'],['木','土',()=>tier('木')==='过旺'||tier('木')==='偏旺']
  ];
  const kr=kS.filter(p=>p[2]()).map(p=>`${wxb(p[0])}克${wxb(p[1])}之制衡最显`);
  if(kr.length) judgeParts.push(kr.join('；'));
  if(judgeParts.length) html+=`<p class="sub-note">${judgeParts.join('。')}。</p>`;
  html+=`</div></details>`;

  // ===== 四土象数释义（库藏、土性、藏干、墓库）=====
  const kuRows=['辰','戌','丑','未'].map(z=>{
    const sw=KU_WX[z];
    const zg=(KU_ZG[z]||'').split('、').join(' '); // 藏干顿号改空格
    return `<tr><td>${z}</td><td>${KU_LABEL[z]}</td><td>${KU_TU[z]}</td><td>${zg}</td><td>${KU_NOTE[z]}</td></tr>`;
  }).join('');
  html+=`<details class="zr-mod zr-quant" id="zrSiTu" open><summary><span class="zr-t">四土象数释义</span></summary><div class="zr-mod-b">`;
  html+=`<div class="qtab-scroll"><table class="qtab yili-tbl"><thead><tr><th>地支</th><th>库藏</th><th>土性</th><th>藏干</th><th>墓库之义</th></tr></thead><tbody>${kuRows}</tbody></table></div>`;
  // 对盘：本命实际带库的开闭（纯展示，引用本命分析墓库结论）
  let kuParts=[];
  if(dwx) kuParts.push(`本命日主${wxb(dwx)}，五行归于所墓之库，其蓄藏发动关乎本命根基`);
  const kuList=(A&&A.muku&&A.muku.list)?A.muku.list:[];
  if(kuList.length){
    const kuTxt=kuList.map(m=>`${KU_LABEL[m.zhi]||m.sw}${m.opened?'，开库发动':(m.ju?'，库化于局、所藏随局显用':(m.locked?'，锁库收藏':'，闭库收藏'))}`).join('；');
    kuParts.push(`本命见库：${kuTxt}`);
  } else kuParts.push(`本命四柱无辰戌丑未库地，五行蓄发随岁运`);
  html+=`<p class="sub-note">${kuParts.join('。')}。</p>`;
  html+=`</div></details>`;

  return html;
}
