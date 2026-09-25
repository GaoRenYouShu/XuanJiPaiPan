/* ============================================================
 * 姓名学引擎（assets/name-engine.js）
 * 纯算法：五格剖象 / 三才 / 三运 / 喜用匹配 / 综合评分。
 * 依赖：kangxi.js（getKangxiStroke / KANGXI_NAME / KANGXI_EXT）、jianfan.js、name-data.js。
 * 全部为纯函数，页面层负责输入校验与渲染。
 * ============================================================ */
window.NAME_ENGINE = (function(){
  'use strict';

  /* ---- 字的计画用字：与站内公共链路 getKangxiStroke 完全同源 ----
   * KANGXI_NAME 优先（处理姓氏与多义字），其次 JIANFAN 映射繁体，再次本字（简体已含于康熙库）。
   * 注意：KANGXI_EXT 为 kangxi.js 内部 const，未挂 window，此处一律经 getKangxiStroke 取数。
   * use 为实际计画的字形，与本字 c 可以不同（简转繁、用户改选），故分两字段返回。 */
  function planOf(c, u){
    var D = window.KANGXI_NAME || {};
    var get = window.getKangxiStroke || function(){ return 0; };
    if(D[u]) return {ch:c, use:u, strokes:D[u], via:'姓名学表'};
    var t = window.JIANFAN ? window.JIANFAN[u] : null;
    if(t){
      var nt = get(t);
      if(nt) return {ch:c, use:t, strokes:nt, via:'简转繁 '+t};
    }
    var n = get(u);
    if(n) return {ch:c, use:u, strokes:n, via:'本字'};
    return {ch:c, use:u, strokes:0, via:'未收录'};
  }
  /* 计画用字改选：简繁一对多时由用户指定字形（如 云→雲），指定后按该字形计画。
     未指定（缺省）即按本字计画，与改选前行为完全一致。 */
  var PLAN_OVERRIDE = {};
  function setPlanOverride(map){ PLAN_OVERRIDE = map || {}; }
  function planChar(c){
    var u = PLAN_OVERRIDE[c] || c;
    return planOf(c, u);
  }
  /* ---- 字档取数：统一字档为唯一真源（康熙笔画、简体笔画、部首号、读音） ----
   * 多音字取首个为常读音；姓氏位另走姓氏异读表，不按常读。
   * 语义层（字义五行、一句话本义、寓意标签）在语义片就位时一并带出；
   * 语义片未加载时对应字段为 null，不回落旧表——旧表取值属 T13 接线前行为。 */
  function getChar(c){
    var A = window.NAME_ARCHIVE_CORE ? window.NAME_ARCHIVE_CORE.chars : null;
    var v = A ? (A[c] || null) : null;
    if(!v) return null;
    var pys = String(v[3] || '').split(/\s+/).filter(Boolean);
    var S = window.NAME_ARCHIVE_SEMANTIC ? window.NAME_ARCHIVE_SEMANTIC.chars : null;
    var s = S ? (S[c] || null) : null;
    return {ch:c, kangxi:v[0], simple:v[1], radicalNo:v[2], pyDefault:pys[0] || '', pys:pys,
      yiyi:(s && s.y) || null, gloss:(s && s.g) || null, tags:(s && s.t) || null};
  }
  function getPhon(c, isSurname){
    var SR = window.NAME_ARCHIVE_SURNAME_READING ? window.NAME_ARCHIVE_SURNAME_READING.map : null;
    var py = (isSurname && SR && SR[c]) ? SR[c].py : ((getChar(c) || {}).pyDefault || '');
    if(!py) return null;
    var pv = (window.NAME_PHON || {})[c];
    var m = (typeof pv === 'string') ? pv.match(/([0-5])$/) : null;
    return {py:py, st:m ? parseInt(m[1], 10) : null};
  }

  /* ---- 五格计算 ---- */
  /* xing: 姓（1~2 字），ming: 名（1~2 字）；均已按字展开为笔画数组 */
  function calcWuge(xst, mst){
    var tian, ren, di, zong, wai;
    if(xst.length===1){ tian = xst[0]+1; } else { tian = xst[0]+xst[1]; }
    ren = xst[xst.length-1] + mst[0];
    if(mst.length===1){ di = mst[0]+1; } else { di = mst.reduce(function(a,b){return a+b;},0); }
    zong = xst.reduce(function(a,b){return a+b;},0) + mst.reduce(function(a,b){return a+b;},0);
    /* 外格（通行定义，按姓/名字数分情形，可延用至名 3~4 字；
       通用式：外格＝姓首成分（复姓取首字笔画，单姓取虚一 1）+名末成分（多字名取末字笔画，单名取虚一 1），
       与 总-人+1 简式仅在单姓双名/复姓单名时等值，复姓双名与长名须按本式） */
    if(xst.length===1 && mst.length===1){ wai = 2; }                    /* 单姓单名：虚一+虚一＝2 */
    else if(xst.length===1){ wai = mst[mst.length-1]+1; }               /* 单姓多字名：名末+虚一 */
    else if(mst.length===1){ wai = xst[0]+1; }                          /* 复姓单名：姓首+虚一 */
    else { wai = xst[0]+mst[mst.length-1]; }                            /* 复姓多字名：姓首+名末 */
    return {tian:tian, ren:ren, di:di, wai:wai, zong:zong};
  }
  function n81(n){
    /* 八十一数理：1~81 为定数；超过 81 者减 80 取模后查表（坊本通例，如 82 记 2、161 记 1） */
    if(n<=81) return n;
    var m=n%80;
    return m===0?80:m;
  }

  /* ---- 三才：天人地三格个位五行 ---- */
  function sancaiWx(w){ return window.NAME_DATA.WX_OF_NUM[w%10]; }

  /* ---- 三运关系 ---- */
  function relName(a, b){
    if(a===b) return '同我';
    var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
    var KE={木:'土',火:'金',土:'水',金:'木',水:'火'};
    if(SHENG[a]===b) return '我生';
    if(SHENG[b]===a) return '生我';
    if(KE[a]===b) return '我克';
    if(KE[b]===a) return '克我';
    return '';
  }

/* ---- 汉字五行双轨 ----
 * 数理五行：按康熙笔画个位取（1~2 木 3~4 火 5~6 土 7~8 金 9~0 水），为五格剖象派内生口径，
 *           只用于五格、三才、三运体系内部，与喜用匹配无关。
 * 义五行：按偏旁字义取（氵雨属水、木艹属木、火日属火、土山玉属土、钅刀属金），以 name-chars
 *           义五行字段为准；水字属水、淼字属水，无五行共识的字（婷、婉、尹一类）为空，按中性处理。
 * 喜用匹配、字五行展示一律以义五行为主口径，数理五行括注对照。 */
function yiWxOf(ch){
  var C = window.NAME_CHARS || {};
  return (C[ch] && C[ch][4]) || '';
}

/* ---- 综合分析入口 ----
 * xing/ming：汉字字符串；linkXi/linkJi：可选，八字喜用/忌神五行数组（['木','水']）。
 * 返回结构化结果；failed 数组非空表示含未收录字。 */
function analyze(xing, ming, linkXi, linkJi){
  var xchars=[...xing], mchars=[...ming];
  var plans=[], i, p, failed=[];
  xchars.concat(mchars).forEach(function(c){
    p=planChar(c); plans.push(p);
    if(!p.strokes) failed.push(c);
  });
  if(failed.length){
    return {ok:false, failed:failed, plans:plans};
  }
  var xst=plans.slice(0,xchars.length).map(function(p){return p.strokes;});
  var mst=plans.slice(xchars.length).map(function(p){return p.strokes;});
  var wg=calcWuge(xst,mst);
  var D=window.NAME_DATA;

  /* 各格数理信息（数理五行：五格体系内生口径，仅作体系内取用与括注对照） */
  function ge(n){
    var m=n81(n), info=D.NAME81[m-1];
    return {raw:n, num:m, luck:info.luck, key:info.key, tag:info.tag, wx:D.WX_OF_NUM[m%10]};
  }
  var tian=ge(wg.tian), ren=ge(wg.ren), di=ge(wg.di), wai=ge(wg.wai), zong=ge(wg.zong);

  /* 三才 */
  var st=sancaiWx(wg.tian), sr=sancaiWx(wg.ren), sd=sancaiWx(wg.di);
  var sc=D.SANCAI[st+sr+sd]||{luck:'xj', text:'（三才组合释义缺）'};

  /* 三运关系 */
  function yun(a,b){
    var r=relName(a, b), t=D.SANYUN_TEXT[r]||{def:''};
    var luck = r==='克我' ? 'xiong' : (r==='我克' ? 'xj' : 'ji');
    return {rel:r, luck:luck, text:t.ji||t.def||''};
  }
  var syc=yun(ren.wx,tian.wx), jic=yun(ren.wx,di.wx), shj=yun(ren.wx,wai.wx);

  /* 喜用匹配：义五行与数理五行双轨并判，避免厚此薄彼。
     姓不可改不入补益（名学通例为名补喜用），只对名字段匹配；
     无义五行共识的字不等于无判，数理五行仍参与。 */
  var xi=linkXi||[], ji=linkJi||[];
  var match=null;
  if(xi.length||ji.length){
    /* 各字双轨五行：义五行与数理五行并列 */
    var yiWx=plans.map(function(pp){ return yiWxOf(pp.ch); });
    var shuWx=plans.map(function(pp){ return D.WX_OF_NUM[pp.strokes%10]; });
    var good=[], bad=[], shuGood=[], shuBad=[], neutral=0;
    for(var mi=xchars.length; mi<plans.length; mi++){
      var w=yiWx[mi], sw=shuWx[mi];
      if(w){
        if(xi.indexOf(w)>=0 && good.indexOf(w)<0) good.push(w);
        if(ji.indexOf(w)>=0 && bad.indexOf(w)<0) bad.push(w);
      } else {
        neutral++;
      }
      /* 数理五行独立计一遍：与义五行并行，不偏废 */
      if(xi.indexOf(sw)>=0 && shuGood.indexOf(sw)<0) shuGood.push(sw);
      if(ji.indexOf(sw)>=0 && shuBad.indexOf(sw)<0) shuBad.push(sw);
    }
    var eff=mchars.length-neutral;
    var hit=good.length, miss=bad.length;
    /* 双轨合计：义五行一票、数理五行半票（义五行按字义是本源，数理按笔画是通行口径） */
    var score = hit*2 - miss*2 + shuGood.length - shuBad.length
      + (hit>0 && miss===0 && shuBad.length===0 ? 1 : 0);
    var lvl;
    if(eff===0 && shuGood.length===0 && shuBad.length===0) lvl=['名字无五行可参','neutral'];
    else if(score>=4) lvl=['双轨补益得力','ji'];
    else if(score>=2) lvl=['补益得力','ji'];
    else if(score>=1) lvl=['略有助益','xj'];
    else if(score<=-3) lvl=['双轨犯忌','xiong'];
    else if(score<=-2) lvl=['多与忌神同气','xiong'];
    else if(score<=-1) lvl=['略有妨碍','xj'];
    else lvl=['平淡','neutral'];
    match={good:good, bad:bad, shuGood:shuGood, shuBad:shuBad, score:score, label:lvl[0], luck:lvl[1],
           charWx:yiWx, shuWx:shuWx, neutral:neutral};
  }

  return {
    ok:true, plans:plans, wg:wg, n81:n81, xcharsLen:xchars.length,
    tian:tian, ren:ren, di:di, wai:wai, zong:zong,
    sancai:{tian:st, ren:sr, di:sd, luck:sc.luck, text:sc.text},
    sanyun:{chenggong:syc, jichu:jic, shejiao:shj},
    match:match
  };
}

/* ---- 综合评分（百分制，字义优先口径） ----
 * 分项及其满分取自 name-data.js 的 SCORE_W，合计 100，本处不另声明权重。
 * 各分项均为真实计算并给出可查的分析说明：
 *   音律＝名段平仄起伏与同音洁净（按 NAME_PHON 读音现算）；
 *   字义寓意＝名字段褒义寓意档案覆盖（按 NAME_YUYI/NAME_ETYM 现查）；
 *   组合意境＝姓与名相邻字对义类联动逐对分析（义类取 NAME_CHARS 档案）；
 *   字形＝结构变化/开合/疏密/轻重/繁简折算；数理配置＝五格三才三运打包折算。 */
/* 缺陷封顶：分项存在负向缺陷时不得给满分（每条缺陷压 capPer 分，保底 floor）。
 * 原则：有描述为'欠起伏/拗口/易混/平平/俗白/缺档案'等缺陷的分项，分数必须低于满分。 */
function capFlaws(full, flaws, capPer, floor){
  var n=flaws.length;
  if(!n) return full;
  return Math.max(floor, full - n*capPer);
}

function score(r){
  /* 数理配置：五格三才三运打包折算（85 分制比例压缩到 5 分，吉满凶不尽废） */
  function g8(l){return l==='ji'?8:(l==='xj'?5:1);}
  function g30(l){return l==='ji'?30:(l==='xj'?18:6);}
  function g5(l){return l==='xiong'?2:(l==='xj'?4:5);}
  var raw = g8(r.tian.luck)+g8(r.ren.luck)+g8(r.di.luck)+g8(r.wai.luck)+g8(r.zong.luck)
    + g30(r.sancai.luck)
    + g5(r.sanyun.chenggong.luck)+g5(r.sanyun.jichu.luck)+g5(r.sanyun.shejiao.luck);
  var shuli = Math.round(raw/85*5);

  var C = window.NAME_CHARS || {};
  var P = window.NAME_PHON || {};
  var Y = window.NAME_YUYI || {};
  var ET = window.NAME_ETYM || {};
  var allChars = r.plans.map(function(pp){return pp.ch;});
  var nameChars = allChars.slice(r.xcharsLen||1); /* 名字段：姓不可改，音义评断只论名（复姓按两字剔除） */

  /* 音律：名段声调起伏与同音洁净 */
  var yinlv=0, yinlvNote='';
  (function(){
    function toneOf(ch){
      var v0=P[ch]; if(!v0) return 0;
      var t=(v0.match(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/)||[null])[0];
      return t?({'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4})[t]:0;
    }
    var ts=nameChars.map(toneOf);
    if(!nameChars.length || ts.some(function(t){return !t;})){ yinlv=14; yinlvNote='读音档案不足，按中位计'; return; }
    var notes=[], v=10;
    var same=ts.every(function(t){return t===ts[0];});
    if(ts.length>=2 && same){ notes.push('名内'+ts.length+'字同调，欠起伏'); v-=2; }
    else if(ts.length>=2 && ts[0]!==ts[ts.length-1]){ notes.push('首尾平仄相异，读来起伏'); v+=4; }
    var plain=function(ch){ if(!P[ch]) return ''; return P[ch].replace(/[0-9]$/,'').replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g,function(m){return {'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e','ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o','ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v'}[m]||m;});};
    var pys=nameChars.map(plain), dup=false;
    for(var a=0;a<pys.length;a++) for(var b=a+1;b<pys.length;b++) if(pys[a]===pys[b]) dup=true;
    /* 叠字（名字两字同字）为有意重复，亲昵顺口，不作同音扣分，反加音律分 */
    var redup=(nameChars.length===2 && nameChars[0]===nameChars[1]);
    if(redup){ notes.push('叠音亲昵，读来顺口'); v+=3; }
    else if(dup){ notes.push('名内有同音字，口语易混'); v-=4; }
    /* 双声/叠韵/声母三连（与推荐引擎 soundScore 同规） */
    var NM_INI=['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'];
    function iniOf(p0){ for(var i=0;i<NM_INI.length;i++){ if(p0.indexOf(NM_INI[i])===0) return NM_INI[i]; } return ''; }
    var inis=nameChars.map(function(ch){ return P[ch]?iniOf(plain(ch)):''; });
    var finals=nameChars.map(function(ch){ if(!P[ch]) return ''; var p1=plain(ch); var ii=iniOf(p1); return ii?p1.slice(ii.length):p1; });
    var SONORANT=/^(l|m|n|r)$/; /* 流音鼻音类：双声为柔连之美（玲珑/绵绵），非声病 */
    var ini3=(inis.length>=3 && inis.every(function(x){return x===inis[0] && x;}));
    var ini2=(inis.length===2 && inis[0]===inis[1] && inis[0]);
    if(ini3 && SONORANT.test(inis[0])){ notes.push('声母连贯柔和（流音双声），读来清亮'); v+=2; }
    else if(ini3){ notes.push('三字声母雷同（塞擦音三连），拗口'); v-=5; }
    else if(ini2 && !redup && !SONORANT.test(inis[0])){ notes.push('名内两字声母相同（塞音双声），稍拗口'); v-=2; }
    var fin2=(finals.length===2 && finals[0]===finals[1] && finals[0]);
    if(fin2 && !redup){ notes.push('名内两字韵母相同（叠韵），稍拗口'); v-=2; }
    if(!notes.length) notes.push('声调错落，无同音之弊');
    yinlvNote=notes.join('；');
    /* 缺陷封顶：欠起伏/同音/拗口/叠韵任一存在即不得满分 */
    var FLAW=/欠起伏|同音|拗口|叠韵|雷同/;
    var flaws=notes.filter(function(x){ return FLAW.test(x); });
    yinlv=Math.max(4, Math.min(capFlaws(20, flaws, 3, 10), v*2));
  })();

  /* 俗白叠字判定（可泛化口径）：叠字用字属通用组扣档字（适用度<0，多为具象/方位/口语字根）
   * 时作大名显乳名感，雅致降档；雅义类字（才学/天象/吉祥/水泽…，适用度≥0）叠字不扣。
   * 吉庆白名单（多多/乐乐/满满/安安等吉利语叠字）豁免。 */
  var NM_REDUP_OK = '多乐满安圆年余喜';
  var ziyi=0, ziNote='';
  if(!nameChars.length){ ziyi=18; ziNote='无名字段'; }
  else{
    var cov=nameChars.filter(function(ch){ return !!Y[ch] || !!(ET[ch]&&ET[ch].length); }).length;
    ziyi=Math.round(25*cov/nameChars.length);
    ziNote = cov===nameChars.length
      ? '名 '+nameChars.length+' 字均具字义档案与褒义寓意（详见字义字源模块）'
      : '名内 '+(nameChars.length-cov)+' 字缺字义档案（'+nameChars.filter(function(ch){return !(Y[ch]||(ET[ch]&&ET[ch].length));}).join('')+'），酌减';
    /* 俗白叠字降雅致：通用组扣档字叠字（如水水），字本义虽无贬，作大名显小名感 */
    var plainRedup=(nameChars.length===2 && nameChars[0]===nameChars[1]
      && C[nameChars[0]] && (C[nameChars[0]][7]||0)<0 && NM_REDUP_OK.indexOf(nameChars[0])<0);
    if(plainRedup){
      ziyi=Math.max(4, ziyi-12);
      ziNote='叠字'+nameChars[0]+nameChars[0]+'用字日常俗白，作大名有小名感，雅致不足';
    }
    if(ziyi<8 && cov>0) ziyi=8;
    if(cov===0) ziyi=6;
  }

  /* 组合意境：姓与名相邻字对义类联动逐对分析（义类取字库档案） */
  var AFFIN={ '品德才学':2, '天象水泽':2, '草木水泽':2, '珍宝吉祥':2, '山岳草木':2,
    '才学气度':2, '容貌品德':2, '时令天象':2, '色彩珍宝':2, '吉祥品德':2,
    '天象吉祥':1, '水泽吉祥':1, '才学山岳':1, '气度山岳':1, '草木天象':1, '品德水泽':1 };
  var PARALLEL_OK={ '品德':1, '才学':1, '吉祥':1, '气度':1 };
  function semPair(a,b){
    if(!a||!b) return null;
    if(a==='虚词'||b==='虚词'){
      var other=a==='虚词'?b:a;
      return (other==='吉祥'||other==='品德')?{v:1,note:'虚实相生'}:{v:-2,note:'虚词泛用，实感不足'};
    }
    var k1=a+b, k2=b+a;
    if(AFFIN[k1]!==undefined) return {v:AFFIN[k1],note:'义类相映'};
    if(AFFIN[k2]!==undefined) return {v:AFFIN[k2],note:'义类相映'};
    if(a===b) return PARALLEL_OK[a]?{v:1,note:'同义并列，意蕴相承'}:{v:0,note:'同义类并列，观感平平'};
    return {v:1,note:'义类互补'};
  }
  var nameFull=([allChars[r.xcharsLen-1]]).concat(nameChars); /* 姓末字+名字段：意境看承接 */
  var cats=nameFull.map(function(ch){ return C[ch]?C[ch][5]:''; });
  var redupName=(allChars.length===3 && allChars[1]===allChars[2]);
  var redupPlain=redupName && C[allChars[1]] && (C[allChars[1]][7]||0)<0 && NM_REDUP_OK.indexOf(allChars[1])<0;
  var yj=0, pairs=[];
  for(var pi=0; pi<cats.length-1; pi++){
    var pr=semPair(cats[pi],cats[pi+1]);
    if(pr){ yj+=pr.v; pairs.push(nameFull[pi]+'（'+(cats[pi]||'无档案')+'）×'+nameFull[pi+1]+'（'+(cats[pi+1]||'无档案')+'）：'+pr.note); }
  }
  /* 按对数归一：多字名不因字对多而累计冲顶 */
  var avg = pairs.length ? yj/pairs.length : 0;
  /* 缺陷封顶：含'观感平平/泛用'缺陷对时，意境不得进 13/15 高档 */
  var YJ_FLAW=/观感平平|泛用/;
  var yjFlaws=pairs.filter(function(x){ return YJ_FLAW.test(x); });
  var yjFen = pairs.length===0 ? 8
    : avg>=2?15 : avg>=1.5?13 : avg>=1?11 : avg>=0.5?8 : avg>=0?5 : avg>=-0.5?3 : 1;
  if(yjFlaws.length && yjFen>11) yjFen=11;
  if(redupName && !redupPlain && yjFen<6) yjFen=6; /* 褒义叠字自成语感，意境兜底 */
  var yjNote = pairs.length===0 ? '用字缺义类档案，无组合分析，按中位计'
    : pairs.join('；');

  /* 字形：结构变化/轻重/繁简折算（真实计算） */
  var xing2, xingNote='';
  (function(){
    if(!nameChars.length){ xing2=3; xingNote='无名字段'; return; }
    var st=[],sc=[];
    nameChars.forEach(function(ch){
      var p0=P[ch]; st.push(p0?parseInt(p0.slice(-1),10):-1);
      var k=planChar(ch); sc.push(k.strokes||0);
    });
    var n=nameChars.length, v=3, notes=[];
    var cnt={};
    st.forEach(function(s){ if(s>=0) cnt[s]=(cnt[s]||0)+1; });
    var maxSame=0; Object.keys(cnt).forEach(function(s){ if(cnt[s]>maxSame) maxSame=cnt[s]; });
    if(n>=2&&maxSame===n){ v-=(n===2?1:2); notes.push('通篇同构，板滞少变'); }
    else if(n>=2&&maxSame===1&&Object.keys(cnt).length===n){ v+=1; notes.push('诸字结构各异'); }
    var mx=Math.max.apply(null,sc), mn=Math.min.apply(null,sc), gap=mx-mn;
    if(gap>=12){ v-=2; notes.push('笔画悬殊过甚'); }
    else if(gap<=3){ v+=1; notes.push('笔画轻重停匀'); }
    var sum=sc.reduce(function(a,b){return a+b;},0), avg=Math.round(sum/n*10)/10;
    if(avg>14){ notes.push('均 '+avg+' 画过繁'); } else if(avg<4){ notes.push('均 '+avg+' 画过简'); } else { notes.push('均 '+avg+' 画繁简适中'); }
    xingNote=notes.join('，');
    xing2=Math.max(1,Math.min(5,v));
  })();

  /* 喜用匹配：义五行与数理五行双轨并判取档（match.score 已含双轨） */
  var xiFen;
  if(r.match){
    var lk=r.match.luck;
    xiFen = lk==='ji'?15:(lk==='xj'?11:(lk==='xiong'?4:8));
  } else {
    xiFen=9; /* 未联动按中位折算 */
  }
  /* 义五行：名字段各字义五行与喜忌独立比对（match 里已算 good/bad） */
  var yiWxFen=0, yiWxNote='';
  if(r.match){
    var g2=r.match.good.length, b2=r.match.bad.length, n2=r.match.neutral;
    var m2=r.plans.length-1; /* 名字段字数 */
    yiWxFen = Math.max(0, Math.min(8, 5 + g2*2 - b2*2 - n2));
    yiWxNote = '名字段义五行'+(g2?(' '+r.match.good.join('、')+' 与喜用同气'):'与喜忌无交集')+(b2?('，'+r.match.bad.join('、')+' 犯忌神'):'')+(n2?('，'+n2+' 字无共识'):'');
    if(!g2 && !b2) yiWxNote='名字段义五行与喜忌无交集';
  } else {
    yiWxFen=5; yiWxNote='未联动，按中位计入';
  }
  /* 数理五行：名字段各字笔画五行与喜忌独立比对 */
  var shuFen=0, shuNote='';
  if(r.match){
    var sg=r.match.shuGood.length, sb=r.match.shuBad.length;
    shuFen = Math.max(0, Math.min(7, 4 + sg*2 - sb*2));
    shuNote = '名字段数理五行'+(sg?(' '+r.match.shuGood.join('、')+' 与喜用同气'):'与喜忌无交集')+(sb?('，'+r.match.shuBad.join('、')+' 犯忌神'):'');
    if(!sg && !sb) shuNote='名字段数理五行与喜忌无交集';
  } else {
    shuFen=4; shuNote='未联动，按中位计入';
  }

  var hasLink=!!(r.match);
  var total = yinlv + ziyi + yjFen + xing2 + xiFen + yiWxFen + shuFen + shuli;
  /* 分项满分与合计取自 name-data 的 SCORE_W，权重只在彼处声明一处，本表次序即分项盘的呈现次序 */
  var SW=(window.NAME_DATA||{}).SCORE_W||[], W={}, wSum=0;
  for(var wi=0; wi<SW.length; wi++){ W[SW[wi].k]=SW[wi].w; wSum+=SW[wi].w; }
  return {total:total, full:wSum, linked:hasLink, parts:[
    {k:'字义寓意', v:ziyi, full:W['字义寓意'], note:ziNote},
    {k:'组合意境', v:yjFen, full:W['组合意境'], note:yjNote},
    {k:'音律', v:yinlv, full:W['音律'], note:yinlvNote},
    {k:'喜用匹配', v:xiFen, full:W['喜用匹配'], note:r.match?(r.match.label+'（义五行与数理五行双轨并判）'):'未联动，按中位计入'},
    {k:'义五行', v:yiWxFen, full:W['义五行'], note:yiWxNote||'按偏旁字义五行与喜忌比对'},
    {k:'数理五行', v:shuFen, full:W['数理五行'], note:shuNote||'按笔画尾数五行与喜忌比对'},
    {k:'数理配置', v:shuli, full:W['数理配置'], note:'五格、三才、三运打包折算（天'+luckTxtWx(r.tian.luck)+'、人'+luckTxtWx(r.ren.luck)+'、地'+luckTxtWx(r.di.luck)+'、总'+luckTxtWx(r.zong.luck)+'）'},
    {k:'字形', v:xing2, full:W['字形'], note:xingNote}
  ]};
}
function luckTxtWx(l){ return l==='ji'?'吉':(l==='xj'?'半吉':'凶'); }

  /* ---- 长姓名（少数民族音译名等无汉姓结构）分析 ----
   * 专业口径：长译名为本名加父名等非汉姓结构，五格剖象的姓/名边界不存在，
   * 天格/人格/地格/外格公式前提不成立，故不排五格、不排三才三运，亦不评分。
   * 仅给站得住的内容：逐字康熙笔画（简转繁透明映射）+ 全名总笔画 → 总格 81 数理 + 各字义五行（数理对照）。
   * full: 汉字串（分隔符已由页面剔除）；linkXi/linkJi：八字联动五行（可选）。 */
  function analyzeLong(full, linkXi, linkJi){
    var chars=[...full];
    var plans=[], failed=[];
    chars.forEach(function(c){
      var p=planChar(c); plans.push(p);
      if(!p.strokes) failed.push(c);
    });
    if(failed.length) return {ok:false, failed:failed, plans:plans};
    var total=plans.reduce(function(a,p){return a+p.strokes;},0);
    var m=n81(total), info=window.NAME_DATA.NAME81[m-1];
    var zongGe={raw:total, num:m, luck:info.luck, key:info.key, tag:info.tag,
                wx:window.NAME_DATA.WX_OF_NUM[m%10]};
    /* 各字双轨五行：义五行为主（'—'为无共识），数理五行对照 */
    var yiWx=plans.map(function(p){ return yiWxOf(p.ch) || '—'; });
    var charWx=yiWx;
    var shuWx=plans.map(function(p){ return window.NAME_DATA.WX_OF_NUM[p.strokes%10]; });
    /* 八字联动：按义五行统计补忌（'—'中性不计），不下五格结论 */
    var match=null;
    var xi=linkXi||[], ji=linkJi||[];
    if(xi.length||ji.length){
      var good=[], bad=[];
      yiWx.forEach(function(w){
        if(w==='—') return;
        if(xi.indexOf(w)>=0 && good.indexOf(w)<0) good.push(w);
        if(ji.indexOf(w)>=0 && bad.indexOf(w)<0) bad.push(w);
      });
      var sc2=good.length-bad.length;
      var lvl = sc2>=2?['多与喜用同气','ji'] : sc2>=1?['略得补益','xj']
              : sc2<=-2?['多与忌神同气','xiong'] : sc2<=-1?['略有妨碍','xj'] : ['平淡','neutral'];
      match={good:good, bad:bad, label:lvl[0], luck:lvl[1], charWx:charWx, shuWx:shuWx};
    }
    return {ok:true, mode:'long', plans:plans, zongGe:zongGe, charWx:charWx, shuWx:shuWx, match:match};
  }

  return {
    planChar: planChar,
    setPlanOverride: setPlanOverride,
    getChar: getChar,
    getPhon: getPhon,
    calcWuge: calcWuge,
    n81: n81,
    sancaiWx: sancaiWx,
    relName: relName,
    analyze: analyze,
    analyzeLong: analyzeLong,
    score: score
  };
})();
