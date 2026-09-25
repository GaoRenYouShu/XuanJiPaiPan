/* ============================================================
 * 测字引擎（assets/cezi-engine.js）
 * 供 cezi.html 使用；纯计算不碰 DOM，依赖全局：
 *   CEZI_DATA(cezi-data.js) / NAME_DATA(name-data.js) / NAME_CHARS(name-chars.js)
 *   getKangxiStroke(kangxi.js) / JIANBI(jianbi.js)
 *   TRIGRAMS / guaName / palaceInfo(gua.js) / lunar(lunar.js 的 Lunar 实例)
 * 口径：
 *   起卦与 meihua.html 字占同源：上卦=康熙笔画%8（余0取8）、下卦=(笔画%8)+1（余0取8）、
 *   动爻=笔画×2%6（余0取6）；动爻在上卦（>3）则体=下卦、用=上卦，反之体=上卦、用=下卦。
 *   数理走 NAME_DATA.NAME81（超 81 减 80 取模），拆解/卦象/旺衰喜用按本页权重加权评级。
 * ============================================================ */
window.CEZI_ENGINE = (function(){
  'use strict';

  /* ---- 五行关系（梅花通行口径） ---- */
  const SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};   /* A 生 B */
  const KE    = {木:'土',土:'水',水:'火',火:'金',金:'木'};   /* A 克 B */
  const WX_ALL = ['木','火','土','金','水'];
  const WX_COLOR = {木:'#4f8a3d',火:'#c0392b',土:'#8a6d3b',金:'#b8860b',水:'#2c5f8a'};

  /* 月建旺衰：季节 → 五行旺衰 */
  const SEASON_OF_MONTH = {寅:'春',卯:'春',辰:'春',巳:'夏',午:'夏',未:'夏',申:'秋',酉:'秋',戌:'秋',亥:'冬',子:'冬',丑:'冬'};
  const WX_LING = {春:'木',夏:'火',秋:'金',冬:'水',四季:'土'};
  const WANG_LABEL = {旺:'旺',相:'相',休:'休',囚:'囚',死:'死'};
  /* 体卦五行相对月建的旺相休囚死 */
  function wangOf(tiWx, lingWx){
    if(tiWx===lingWx) return {label:'旺',v:1.0,txt:'当令气盛'};
    if(SHENG[lingWx]===tiWx) return {label:'相',v:0.9,txt:'得月建之生，气次旺'};
    if(SHENG[tiWx]===lingWx) return {label:'休',v:0.65,txt:'气泄于月建'};
    if(KE[lingWx]===tiWx) return {label:'死',v:0.4,txt:'受月建所克'};
    return {label:'囚',v:0.5,txt:'力克月建而受牵制'};
  }

  /* 八卦五行（起卦体用、互变参断共用） */
  const TRI_WX = {'乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土'};
  /* 体用生克：名称/分值/断语 */
  const TIYONG_SCORE = {'比和':1.0,'用生体':0.95,'体克用':0.8,'体生用':0.55,'用克体':0.3};
  function tiYongRel(tiWx,yongWx){
    if(tiWx===yongWx) return {rel:'比和', v:TIYONG_SCORE['比和'],   txt:'体用同心，事多遂意'};
    if(SHENG[yongWx]===tiWx) return {rel:'用生体', v:TIYONG_SCORE['用生体'], txt:'外力相助，其象大吉'};
    if(KE[tiWx]===yongWx)    return {rel:'体克用', v:TIYONG_SCORE['体克用'], txt:'事可成而费力'};
    if(SHENG[tiWx]===yongWx) return {rel:'体生用', v:TIYONG_SCORE['体生用'], txt:'耗己成事，宜量力'};
    return {rel:'用克体', v:TIYONG_SCORE['用克体'], txt:'外势相迫，宜守'};
  }

  /* 字形结构名（NAME_CHARS 结构 0~5） */
  const STRUCT_NAMES = ['左右形','上下形','包围形','全包围','独体形','品字形'];
  function structName(c){
    const nc = window.NAME_CHARS && NAME_CHARS[c];
    if(nc) return STRUCT_NAMES[nc[3]];
    const e = CEZI_DATA.CEZI[c];
    if(e && e.c[0]){
      const p = e.c[0].p;
      if(p === c) return '独体形';
      const LEFT = ['氵','亻','扌','忄','纟','钅','饣','礻','衤','犭','讠','阝','彳'];
      const TOPS = ['宀','艹','竹','雨','⺌','丷','艸'];
      const parts = Array.from(p);
      for(const pc of parts){ if(LEFT.indexOf(pc)>=0) return '左右形'; }
      for(const pc of parts){ if(TOPS.indexOf(pc)>=0) return '上下形'; }
      if(p.indexOf('囗')>=0||p.indexOf('冂')>=0) return '全包围';
      return '多部件形';
    }
    return '';
  }
  function pinyinOf(c){
    const nc = window.NAME_CHARS && NAME_CHARS[c];
    if(nc) return nc[0] + '（' + ['一','二','三','四'][nc[1]-1] + '声）';
    const e = CEZI_DATA.CEZI[c];
    if(e && e.py) return e.py;
    if(e && e.c[0] && e.c[0].py) return e.c[0].py;
    return '';
  }
  function yiWxOf(c){
    const nc = window.NAME_CHARS && NAME_CHARS[c];
    if(nc && nc[4]) return nc[4];
    /* 独体基础字义五行（民俗通行归法） */
    const WX_MAP = {'一':'水','二':'木','三':'火','口':'木','水':'水','土':'土','王':'土','大':'火','天':'火','木':'木','火':'火','金':'金','日':'火','月':'水','山':'土','石':'金','田':'土','马':'火','牛':'土','犬':'木','女':'水','子':'水','目':'水','耳':'火','手':'金','足':'水','走':'水','门':'木','卜':'水','心':'火','云':'水','雨':'水','风':'水','行':'水','言':'火','立':'火','生':'木','之':'水','人':'金','入':'水','八':'水','七':'金','九':'金','十':'金','千':'金','丁':'火','刀':'金','力':'火','又':'金','乃':'水','几':'木','气':'水','爪':'金','爻':'火','囗':'土','尸':'金','巾':'木','巳':'火','彐':'金','彳':'火','龟':'水','兔':'金','象':'金','面':'木','骨':'木','鬼':'水','食':'土','音':'土','页':'金','飞':'水','鱼':'水','鸟':'火','龙':'火','幺':'水','毋':'水','聿':'木','艮':'土','禹':'土','臼':'金','羊':'土','羽':'土','老':'火','考':'木','者':'火','高':'木','黄':'土','黑':'水','齐':'金','齿':'金','豆':'土','亥':'水','聿2':'木'};
    if(WX_MAP[c]) return WX_MAP[c];
    const e = CEZI_DATA.CEZI[c];
    if(e && e.c[0]){
      const wxCnt = {};
      const GX2 = {'乾':'金','坤':'土','震':'木','巽':'木','坎':'水','离':'火','艮':'土','兑':'金'};
      Array.from(e.c[0].p).forEach(function(pc){
        const pt = CEZI_DATA.PARTS[pc];
        if(pt && pt.w) { wxCnt[pt.w] = (wxCnt[pt.w]||0)+1; return; }
        /* 部件是独体基础字：WX_MAP（优先，防递归抢跑） */
        if(WX_MAP[pc]) { wxCnt[WX_MAP[pc]] = (wxCnt[WX_MAP[pc]]||0)+1; return; }
        /* 部件是 CEZI 收录字：用其首拆法部件五行（一层递归） */
        const ce = CEZI_DATA.CEZI[pc];
        if(ce && ce.c[0]){
          Array.from(ce.c[0].p).forEach(function(pc2){
            const pt2 = CEZI_DATA.PARTS[pc2];
            if(pt2 && pt2.w) wxCnt[pt2.w] = (wxCnt[pt2.w]||0)+1;
            else if(WX_MAP[pc2]) wxCnt[WX_MAP[pc2]] = (wxCnt[WX_MAP[pc2]]||0)+1;
          });
          return;
        }
        /* 八卦归象五行 */
        const gong = CEZI_DATA.GONG_MAP && CEZI_DATA.GONG_MAP[pc];
        if(gong && GX2[gong]) { wxCnt[GX2[gong]] = (wxCnt[GX2[gong]]||0)+1; }
      });
      let best='',bn=0;
      ['木','火','土','金','水'].forEach(function(w){ if((wxCnt[w]||0)>bn){ best=w; bn=wxCnt[w]; } });
      if(best) return best;
    }
    /* 最终回退：按康熙部首五行 */
    const BS_WX = {'卩':'金','靑':'木','麥':'木','黃':'土','飛':'水','齒':'金','長':'金','門':'木','韋':'金','魚':'水','鳥':'火','車':'金','馬':'火','貝':'金','攴':'金','頁':'金','見':'水','襾':'金','网':'水','赤':'火','无':'水','癶':'火','豸':'金','夊':'火','禸':'火','巛':'水','身':'水','豕':'水','匸':'土','戶':'水','士':'土','亅':'木','乙':'木','丶':'木','丨':'木','丿':'木','艸':'木','一':'木','二':'火','三':'火','亠':'土','人':'金','儿':'金','入':'水','八':'水','冂':'土','冖':'土','冫':'水','几':'木','凵':'土','刀':'金','力':'火','勹':'土','匕':'金','匚':'土','十':'金','卜':'水','厂':'土','厶':'土','又':'金','口':'木','囗':'土','土':'土','夕':'金','大':'火','女':'水','子':'水','宀':'土','寸':'土','小':'金','尢':'火','尸':'金','屮':'木','山':'土','工':'土','己':'土','巾':'木','干':'木','幺':'水','广':'土','廴':'土','廾':'木','弋':'金','弓':'木','彐':'金','彡':'水','彳':'火','心':'火','戈':'金','手':'金','支':'木','攵':'金','文':'水','斗':'土','斤':'金','方':'水','日':'火','曰':'土','月':'水','木':'木','欠':'火','止':'火','歹':'火','殳':'金','毋':'水','比':'水','毛':'木','氏':'火','气':'水','水':'水','火':'火','爪':'金','父':'火','爻':'火','爿':'木','片':'木','牙':'木','牛':'土','犬':'木','玄':'水','玉':'土','瓜':'木','瓦':'土','甘':'木','生':'木','用':'土','田':'土','疋':'火','疒':'水','白':'金','皮':'水','皿':'土','目':'水','矛':'金','矢':'金','石':'金','示':'火','禾':'木','穴':'土','立':'火','竹':'木','米':'木','糸':'木','缶':'土','羊':'土','羽':'土','老':'火','而':'水','耒':'木','耳':'火','聿':'木','肉':'土','臣':'金','自':'火','至':'火','臼':'金','舌':'火','舟':'木','艮':'土','色':'金','虍':'木','虫':'火','血':'水','行':'水','衣':'木','角':'金','言':'火','谷':'水','豆':'土','贝':'金','车':'金','辛':'金','辰':'土','辵':'水','邑':'土','酉':'金','釆':'火','里':'土','金':'金','长':'金','门':'木','阜':'土','隶':'火','隹':'火','雨':'水','青':'木','非':'水','面':'木','革':'金','韭':'木','音':'土','页':'金','风':'水','飞':'水','食':'土','首':'金','香':'水','马':'火','骨':'木','高':'木','鬥':'火','鬼':'水','鱼':'水','鸟':'火','鹿':'火','麻':'木','黄':'土','黍':'木','黑':'水','黹':'火','鼎':'金','鼓':'木','鼠':'水','鼻':'金','齐':'金','齿':'金','龙':'火','龟':'水','龠':'土'};
    if(e && e.bs){
      if(BS_WX[e.bs]) return BS_WX[e.bs];
      /* bs 记号：本形>字形变体（如 水>氵、玉>王、馬>马），逐级回退，避免变形部首落空 */
      var _b = e.bs.split('>');
      if(BS_WX[_b[0]]) return BS_WX[_b[0]];
      if(_b[1] && BS_WX[_b[1]]) return BS_WX[_b[1]];
    }
    return '土';
  }

  /* ---- 拆解五行主气：按拆法部件五行计数取众数 ---- */
  function chaiMainWx(pstr){
    const cnt = {};
    Array.from(pstr).forEach(function(pc){
      const pt = CEZI_DATA.PARTS[pc];
      const w = pt ? pt.w : '';
      if(w) cnt[w] = (cnt[w]||0) + 1;
    });
    let best='', bn=0;
    WX_ALL.forEach(function(w){ if((cnt[w]||0)>bn){ best=w; bn=cnt[w]; } });
    return best;
  }

  /* ---- 拆解：精编拆法（随问取拆，cats 事类优先、CAT_TAG 字级次之）；未收录如实提示 ---- */
  function chaiOf(ch, shuliV, catKey){
    const e = CEZI_DATA.CEZI[ch];
    if(e){
      const list = e.c.map(function(x, i){
        let cats = x.cats;
        if(!cats && i===0 && CEZI_DATA.CAT_TAG && CEZI_DATA.CAT_TAG[ch]) cats = [CEZI_DATA.CAT_TAG[ch]];
        return { p:x.p, note:x.n, tag:x.t, fa:x.f||'', src:x.src||'', ge:x.ge||'', geSrc:x.geSrc||'', bm:x.bm||'', bmSrc:x.bmSrc||'', shuang:x.shuang||'', shuangSrc:x.shuangSrc||'', luck:x.l, lx:x.lx||'', gm:x.gm||null, cats:cats||[],
          parts: Array.from(x.p).map(function(pc){
            const pt = CEZI_DATA.PARTS[pc];
            if(pt) return {p:pc, yi:pt.y, wx:pt.w, gong:(CEZI_DATA.GONG_MAP&&CEZI_DATA.GONG_MAP[pc])||'', sang:(CEZI_DATA.SANG_MAP&&CEZI_DATA.SANG_MAP[pc])||null};
            const ce = CEZI_DATA.CEZI[pc];
            if(ce && ce.c[0]) return {p:pc, yi:ce.c[0].n, wx:chaiMainWx(ce.c[0].p), gong:(CEZI_DATA.GONG_MAP&&CEZI_DATA.GONG_MAP[pc])||'', sang:(CEZI_DATA.SANG_MAP&&CEZI_DATA.SANG_MAP[pc])||null};
            return {p:pc, yi:'', wx:'', gong:''};
          })
        };
      });
      let pick = 0;
      for(let i=0;i<list.length;i++){ if(list[i].cats.indexOf(catKey)>=0){ pick=i; break; } }
      return { source:'cezi', bs:e.bs, pick:pick, list:list };
    }
    /* 未收录：如实提示，不编造拆解（引擎纪律，依《测字_规划》第四节） */
    return { source:'none', bs:'', pick:0, list:[] };
  }

  /* ---- 数理（姓名学通行口径） ---- */
  function shuliOf(ks){
    const idx = ks>81 ? ks-80 : ks;
    const n = NAME_DATA.NAME81[idx-1] || {luck:'xj', key:'', tag:''};
    return { num:ks, idx:idx, luck:n.luck, key:n.key, tag:n.tag,
      label:NAME_DATA.LUCK_LABEL[n.luck]||'',
      wx:(function(){ const t=NAME_DATA.WX_OF_NUM[ks%10]; return t||''; })(),
      v: n.luck==='ji'?1.0 : n.luck==='xj'?0.75 : 0.35 };
  }

  /* ---- 梅花字占起卦（与 meihua.html 完全同源） ---- */
  function guaOf(ks){
    const M=8;
    let up = ks%M; up = up||M;
    let low = ((ks%M)+1)%M; low = low||M;
    let dong = (ks*2)%6; dong = dong||6;
    const bits = function(n){ const g=TRIGRAMS[Object.keys(TRIGRAMS).find(k=>TRIGRAMS[k].xt===n)]; return g?g.bits.slice():[1,1,1]; };
    const upBits = bits(up), lowBits = bits(low);
    const benBits = lowBits.concat(upBits);
    const dongInUpper = dong>3;
    const triName = function(b){ return Object.keys(TRIGRAMS).find(k=>TRIGRAMS[k].bits.join('')===b.join('')); };
    const upName = triName(upBits), lowName = triName(lowBits);
    const tiName  = dongInUpper ? lowName : upName;
    const yongName= dongInUpper ? upName : lowName;
    const tiSym   = TRIGRAMS[tiName].sym, yongSym = TRIGRAMS[yongName].sym;
    const tiWx    = TRI_WX[tiName];
    const yongWx  = TRI_WX[yongName];
    const rel = tiYongRel(tiWx, yongWx);
    const ben = guaName(upName, lowName);
    const YAO_POS = ['初','二','三','四','五','上'];
    /* 互卦（二三四爻为下、三四五爻为上，事之中机）与变卦（动爻翻转，事之终应） */
    const huLowBits = [benBits[1],benBits[2],benBits[3]], huUpBits = [benBits[2],benBits[3],benBits[4]];
    const bianBits = benBits.slice(); bianBits[dong-1] = bianBits[dong-1]?0:1;
    const huUpName = triName(huUpBits), huLowName = triName(huLowBits);
    const huName = guaName(huUpName, huLowName);
    const bianUpName = triName(bianBits.slice(3)), bianLowName = triName(bianBits.slice(0,3));
    const bianName = guaName(bianUpName, bianLowName);
    const bianYongName = dongInUpper ? bianUpName : bianLowName;
    const bianYongWx = TRI_WX[bianYongName];
    const bianRel = tiYongRel(tiWx, bianYongWx);
    const huUpWx = TRI_WX[huUpName];
    const huRel = tiYongRel(tiWx, huUpWx);
    const pal = palaceInfo(benBits);
    return { up:up, low:low, upName:upName, lowName:lowName,
      upSym:TRIGRAMS[upName].sym, lowSym:TRIGRAMS[lowName].sym,
      benName:ben, dong:dong, dongInUpper:dongInUpper,
      tiName:tiName, yongName:yongName, tiSym:tiSym, yongSym:yongSym,
      tiWx:tiWx, yongWx:yongWx, rel:rel.rel, relTxt:rel.txt, relV:rel.v,
      yi:(CEZI_DATA.GUA_YI && CEZI_DATA.GUA_YI[ben]) || '',
      ci:(typeof GUA_CI!=='undefined' && GUA_CI[ben]) || '',
      yaoCi:(typeof YAO_CI!=='undefined' && YAO_CI[ben+YAO_POS[dong-1]]) || '',
      yaoKey:ben+YAO_POS[dong-1],
      huName:huName, bianName:bianName,
      huUpName:huUpName, huUpWx:huUpWx,
      huRel:huRel.rel, huRelTxt:huRel.txt,
      bianYongName:bianYongName, bianYongWx:bianYongWx,
      bianRel:bianRel.rel, bianRelTxt:bianRel.txt,
      palace:pal.palace, world:pal.world, ying:pal.ying, palType:pal.type };
  }

  /* ---- 应期与方位 ---- */
  const YINGQI = {
    木:{day:'甲乙寅卯之日',season:'春月',fang:'东'},
    火:{day:'丙丁巳午之日',season:'夏月',fang:'南'},
    土:{day:'戊己辰戌丑未之日',season:'四季之月',fang:'中宫与四隅'},
    金:{day:'庚辛申酉之日',season:'秋月',fang:'西'},
    水:{day:'壬癸亥子之日',season:'冬月',fang:'北'}
  };
  /* 字气五行所值地支与对冲（应期细化：逢值逢冲之日） */
  const YINGQI_ZHI = {木:['寅','卯'],火:['巳','午'],土:['辰','戌','丑','未'],金:['申','酉'],水:['亥','子']};
  const ZHI_CHONG = {子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'};
  /* 从起测日起 60 日内，算首个值日（体卦五行所值地支）与首个冲日 */
  function zhiChongDays(mainWx, solar){
    if(!solar || !solar.next) return {zhi:'', chong:''};
    const zhis = YINGQI_ZHI[mainWx] || YINGQI_ZHI.土;
    const chongs = zhis.map(function(z){ return ZHI_CHONG[z]; });
    const out = {zhi:'', chong:''};
    try{
      for(let i=1; i<=60 && (!out.zhi || !out.chong); i++){
        const s = solar.next(i);
        const gz = s.getLunar().getDayInGanZhi();
        const zhi = gz.charAt(1);
        if(!out.zhi && zhis.indexOf(zhi)>=0) out.zhi = (s.getMonth()+'月'+s.getDay()+'日（'+gz+'，值'+zhi+'）');
        if(!out.chong && chongs.indexOf(zhi)>=0) out.chong = (s.getMonth()+'月'+s.getDay()+'日（'+gz+'，冲'+ZHI_CHONG[zhi]+'）');
      }
    }catch(e){}
    return out;
  }

  /* ---- 事类喜用契合度 ---- */
  function xiScore(mainWx, xi){
    if(!xi || !xi.length) return {v:0.7, txt:'总论无偏喜，以中和论'};
    if(mainWx===xi[0]) return {v:1.0, txt:'字气正合事类喜用（'+xi[0]+'），其象最切'};
    if(mainWx===xi[1]) return {v:0.85, txt:'字气次合喜用（'+xi[1]+'），其象相宜'};
    if(SHENG[mainWx]===xi[0]) return {v:0.6, txt:mainWx+'生'+xi[0]+'，泄己济事，力有耗'};
    if(SHENG[xi[0]]===mainWx) return {v:0.7, txt:xi[0]+'生'+mainWx+'，得事类之气相滋'};
    if(KE[mainWx]===xi[0])    return {v:0.45, txt:mainWx+'克'+xi[0]+'，与事类喜用相逆'};
    if(KE[xi[0]]===mainWx)    return {v:0.35, txt:xi[0]+'克'+mainWx+'，事类之气相迫'};
    return {v:0.5, txt:'字气与事类喜用不涉，以平论'};
  }

  /* ---- 综合评级 ---- */
  const LEVELS = [
    {min:80, name:'大吉', cls:'lv-ss'},
    {min:66, name:'吉',   cls:'lv-ss'},
    {min:52, name:'平',   cls:'lv-zp'},
    {min:38, name:'谨',   cls:'lv-zx'},
    {min:0,  name:'凶',   cls:'lv-xx'}
  ];
  const LUCK_V = {ji:1.0, ping:0.6, xiong:0.3};
  /* 互变参断三态分组：比和/用生体为吉，体克用/体生用为可成，用克体为阻 */
  function relGroup(rel){ return (rel==='比和'||rel==='用生体') ? 'ji' : (rel==='用克体') ? 'zu' : 'cheng'; }

  /* ============================================================
   * 主入口：analyze(char, catKey, lunar, solar)
   * char 已校验的单个汉字；catKey 为 CEZI_DATA.CATS 键；
   * lunar/solar 为 lunar-javascript 实例（当前起测时刻）。
   * ============================================================ */
  function analyze(ch, catKey, lunar, solar){
    const cat = CEZI_DATA.CATS[catKey] || CEZI_DATA.CATS.zong;
    const ks = (typeof getKangxiStroke==='function') ? getKangxiStroke(ch) : 0;
    const js = (window.JIANBI && JIANBI[ch]) ? JIANBI[ch] : 0;
    const shuli = shuliOf(ks || js || 1);
    const chai = chaiOf(ch, shuli.v, catKey);
    const chaiPick = chai.list[chai.pick] || { p:ch, note:'拆解未收录', tag:'未收录', fa:'', src:'', luck:'ping', cats:[], parts:[], gm:null };
    /* 摘字：ZHAI 有此字条目且所摘部件在主断拆法中（十法之摘字，查表不派生） */
    const zhaiRaw = (CEZI_DATA.ZHAI && CEZI_DATA.ZHAI[ch]) || null;
    const jia = (CEZI_DATA.JIAs && CEZI_DATA.JIAs[ch]) || null;
    const zhua = (CEZI_DATA.ZHUA && CEZI_DATA.ZHUA[ch]) || null;
    const zhai = (zhaiRaw && chai.source==='cezi' && chaiPick.p.indexOf(zhaiRaw.zhai)>=0) ? zhaiRaw : null;
    const xiesheng = (function(){
      if (!(window.NAME_CHARS && NAME_CHARS[ch])) return null;
      const py = NAME_CHARS[ch][0].replace(/[0-9]/g, '');
      if (!py) return null;
      const same = Object.keys(NAME_CHARS).filter(function(k){
        return k !== ch && NAME_CHARS[k][0].replace(/[0-9]/g, '') === py;
      }).slice(0, 6);
      return same.length ? same : null;
    })();
    const geObj = chai.list.filter(function(x){ return x.ge; }).find(function(x){ return x.cats.indexOf(catKey)>=0; }) || chai.list.find(function(x){ return x.ge; }) || null;
    const shObj = chai.list.find(function(x){ return x.shuang; }) || null;
    const chaiWx = chai.source==='cezi' ? chaiMainWx(chaiPick.p) : '';
    const mainWx = chaiWx || yiWxOf(ch) || shuli.wx || '土';
    const huoRaw = (CEZI_DATA.HUO && CEZI_DATA.HUO[ch]) || [];
    const huo = huoRaw.filter(function(h){ return h.cats && h.cats.indexOf(catKey)>=0; })
      .concat(huoRaw.filter(function(h){ return !(h.cats && h.cats.indexOf(catKey)>=0); }));

    const gua = guaOf(ks || js || 1);
    const yaoJie = (CEZI_DATA.YAO_JIE && CEZI_DATA.YAO_JIE[gua.yaoKey]) || null;

    /* 时辰外应：月建旺衰 + 日干支 + 时支 */
    let wai = { season:'', lingWx:'', wang:'', dayGZ:'', shiZhi:'', shiWx:'' };
    if(lunar){
      const mz = lunar.getMonthZhi();
      const season = SEASON_OF_MONTH[mz] || '春';
      const lingWx = WX_LING[season==='春'?'春':season==='夏'?'夏':season==='秋'?'秋':season==='冬'?'冬':'四季'];
      const wang = wangOf(mainWx, lingWx);
      let shiZhi='', dayGZ='';
      try{ dayGZ = lunar.getDayInGanZhi(); }catch(e){}
      try{ shiZhi = lunar.getTimeZhi(); }catch(e){}
      const shiWx = (typeof ZHI_WX!=='undefined' && ZHI_WX[shiZhi]) || '';
      wai = { season:season, lingWx:lingWx, wang:wang, dayGZ:dayGZ, shiZhi:shiZhi, shiWx:shiWx };
    }

    const xi = xiScore(mainWx, cat.xi);

    /* 四项加权 */
    const vChai  = chai.source==='cezi' ? (LUCK_V[chaiPick.luck]!==undefined ? LUCK_V[chaiPick.luck] : 0.6) : shuli.v;
    const items = [
      {name:'拆解吉凶', w:30, v:vChai,        desc: chai.source==='cezi' ? (chai.pick>0?'随问取拆，以'+chaiPick.p+'之象为主断':'精选拆法'+chaiPick.p+'之象') : '无精编拆法，以数理代评'},
      {name:'数理吉凶', w:25, v:shuli.v,      desc: shuli.num+'数，'+(shuli.key||shuli.label)},
      {name:'卦象体用', w:25, v:gua.relV,     desc: '体'+gua.tiName+'（'+gua.tiWx+'）对用'+gua.yongName+'（'+gua.yongWx+'），'+gua.rel},
      {name:'旺衰喜用', w:20, v:(function(){ return (wai.wang ? wai.wang.v : 0.7)*0.5 + xi.v*0.5; })(),
        desc: (wai.wang? mainWx+'行'+wai.wang.label+'（'+wai.wang.txt+'）' : '无时辰参断') + '；' + xi.txt}
    ];
    const total = Math.round(items.reduce(function(s,it){ return s + it.w*it.v; },0));
    const level = LEVELS.find(function(l){ return total>=l.min; }) || LEVELS[4];

    /* 断语：吉/平/凶 档位映射 */
    const luckKey = (level.name==='大吉'||level.name==='吉') ? 'ji' : (level.name==='平' ? 'ping' : 'xiong');
    const ying = YINGQI[mainWx] || YINGQI.土;
    const yingNear = wai.wang ? (wai.wang.label==='旺'||wai.wang.label==='相' ? '期近' : '期缓') : '期不定';
    const tpl = cat.tpl[luckKey];
    const duan = tpl
      .replace('{zi}', ch)
      .replace('{chai}', chaiPick.note)
      .replace('{shuli}', shuli.key || shuli.label || shuli.num+'数')
      .replace('{ying}', ying.season)
      .replace('{fang}', ying.fang);

    return {
      char:ch, catKey:catKey, catName:cat.name,
      py:pinyinOf(ch), ks:ks, js:js, struct:structName(ch)||'未详', bs:chai.bs||'未详',
      yiWx:yiWxOf(ch)||'未详', shuWx:shuli.wx||'未详', mainWx:mainWx,
      chai:chai, shuli:shuli, gua:gua, wai:wai, xi:xi, huo:huo, yaoJie:yaoJie, zhai:zhai, ge:geObj?{duan:geObj.ge,src:geObj.geSrc}:null, shuang:shObj?{duan:shObj.shuang,src:shObj.shuangSrc}:null, xiesheng:xiesheng, jia:jia, zhuan:zhua,
      huJie:{rel:gua.huRel, txt:cat.hu ? (cat.hu[relGroup(gua.huRel)]||'') : ''},
      bianJie:{rel:gua.bianRel, txt:cat.bian ? (cat.bian[relGroup(gua.bianRel)]||'') : ''},
      items:items, total:total, level:level, luckKey:luckKey,
      ying:(function(){
        const zc = zhiChongDays(mainWx, solar);
        return { day:ying.day, season:ying.season, fang:ying.fang, near:yingNear, zhi:zc.zhi, chong:zc.chong };
      })(),
      duan:duan,
      ts:Date.now()
    };
  }

  /* 随机拈字：拈字池 = 精编拆字库收录字 */
  function pickRandom(){
    const keys = Object.keys(CEZI_DATA.CEZI);
    return keys[Math.floor(Math.random()*keys.length)];
  }

  /* 纯文本上下文（AI 解读用） */
  function contextText(r){
    let s = '测字：'+r.char+'，读音'+(r.py||'未详')+'\n';
    s += '所问：'+r.catName+'\n';
    s += '笔画：康熙'+r.ks+'画，数理'+r.shuli.num+'（'+r.shuli.label+'，'+r.shuli.key+'）\n';
    s += '拆解：'+(r.chai.source==='cezi' ? ('主断第'+(r.chai.pick+1)+'拆，'+r.chai.list.map(x=>'"'+x.p+'"（'+x.fa+'），'+x.note).join('；')) : '未收录精编拆解，如实以待，以数理卦象外应参断')+'\n';
    if(r.huo && r.huo.length) s += '活拆变象：'+r.huo.map(x=>x.f+x.a+(x.f==='加'?'成':'为')+x.r+'，'+x.n).join('；')+'\n';
    s += '卦象：'+r.gua.benName+'，上'+r.gua.upName+r.gua.upSym+'下'+r.gua.lowName+r.gua.lowSym+'，动第'+r.gua.dong+'爻，体'+r.gua.tiName+r.gua.tiWx+'用'+r.gua.yongName+r.gua.yongWx+r.gua.rel+(r.gua.yi?'，卦义：'+r.gua.yi:'')+'\n';
    if(r.gua.ci) s += '卦辞：'+r.gua.ci+'\n';
    if(r.gua.yaoCi) s += '动爻爻辞：'+r.gua.yaoCi+'\n';
    if(r.yaoJie) s += '爻解：'+r.yaoJie.yi+'；于'+r.catName+'：'+(r.yaoJie.duan[r.catKey]||'')+'\n';
    if(r.chai.source==='cezi' && r.chai.list[r.chai.pick] && r.chai.list[r.chai.pick].gm){
      const gm=r.chai.list[r.chai.pick].gm;
      s += '观梅字象：形，'+gm.x+'；神气，'+gm.sh+'\n';
    }
    if(r.zhai) s += '摘字：'+r.zhai.zhai+'，'+r.zhai.n+'\n';
    if(r.ge) s += '取格（秘牒卷三已验）：'+r.ge.duan+'\n';
    const bmObj = (r.chai.source==='cezi'&&r.chai.list[r.chai.pick]&&r.chai.list[r.chai.pick].bm)?r.chai.list[r.chai.pick]:null;
    if(bmObj) s += '观梅底本释义：'+bmObj.bm+'\n';
    if(r.wai.dayGZ) s += '外应：'+r.wai.dayGZ+'日'+(r.wai.shiZhi?r.wai.shiZhi+'时':'')+'，'+r.mainWx+'行'+r.wai.wang.label+'\n';
    s += '互卦：'+r.gua.huName+'（事之中机），'+r.gua.huRel+'，'+(r.huJie&&r.huJie.txt?r.huJie.txt+'；':'')+'变卦：'+r.gua.benName+'之'+r.gua.bianName+'（事之终应），'+r.gua.bianRel+'，'+(r.bianJie&&r.bianJie.txt?r.bianJie.txt+'；':'')+'变后用卦'+r.gua.bianYongName+r.gua.bianYongWx+'与体'+r.gua.bianRel+'，'+r.gua.bianRelTxt+'（参断）\n';
    s += '应期：宜候'+r.ying.day+'，应于'+r.ying.season+'，方位利'+r.ying.fang+(r.ying.zhi?'，值日'+r.ying.zhi:'')+(r.ying.chong?'，冲日'+r.ying.chong:'')+'\n';
    s += '综合：'+r.level.name+'（'+r.total+'分）\n断曰：'+r.duan;
    return s;
  }

  return { analyze:analyze, pickRandom:pickRandom, contextText:contextText,
    SHENG:SHENG, KE:KE, YINGQI:YINGQI, TIYONG_SCORE:TIYONG_SCORE };
})();
