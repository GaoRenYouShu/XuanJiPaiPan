/* ============================================================
 * heluo.js：河洛理数引擎与渲染。
 * 算法口径为多源互校后的通行排法。四柱取 lunar.js
 * 立春界年干支、节气月支；卦名爻位复用 gua.js；卦辞爻辞直读
 * jingwen.js 顶层 GUA_CI、YAO_CI，不另录经文。
 * ============================================================ */

/* ---------- 0. 基础工具 ---------- */
const HL_STATE={'calc':null,'yunValid':false};
const HL_ZHI_ORDER=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const HL_YUE_NAMES=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const HL_YAO_POS=['初','二','三','四','五','上'];
const HL_MIN_YEAR=1900,HL_MAX_YEAR=2099;

function hlEsc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
/* 卦名到六爻bits（自下而上，与 gua.js hexInfo 同约定：下卦在前）总表 */
const HL64_BITS=(function(){
  const ord=['乾','兑','离','震','巽','坎','艮','坤'],map={};
  ord.forEach(function(up){ord.forEach(function(lo){
    map[guaName(up,lo)]=TRIGRAMS[lo].bits.concat(TRIGRAMS[up].bits);
  });});
  return map;
})();
function hlFlip(bits,pos){ const b=bits.slice(); b[pos-1]=b[pos-1]?0:1; return b; }
function hlYangCount(bits){ let n=0; for(let i=0;i<6;i++) if(bits[i]) n++; return n; }
/* 卦中自下而上第 n 个阳爻（yang=1）或阴爻（yang=0）的爻位 */
function hlNthYao(bits,yang,n){
  let c=0;
  for(let i=0;i<6;i++){ if((bits[i]?1:0)===yang){ c++; if(c===n) return i+1; } }
  return 0;
}
/* 爻位称谓：初九、六二、九五、上六 */
function hlYaoLabel(bits,pos){
  const yao=bits[pos-1]===1?'九':'六';
  if(pos===1) return '初'+yao;
  if(pos===6) return '上'+yao;
  return yao+'二三四五'[pos-2];
}
/* 元堂取爻：按行取该时爻位；防错约束，两至逆表在纯乾、纯坤的缺类
 * 时辰（如纯乾之阴爻位）不立，此时回通行基础表并出注，避免空爻位 */
function hlYtPick(bits,row,baseRow,hourIdx){
  const cell=row[hourIdx],pos=hlNthYao(bits,cell[0]==='阳'?1:0,+cell.slice(1));
  if(pos>0) return {'pos':pos,'note':''};
  const cell2=baseRow[hourIdx];
  return {'pos':hlNthYao(bits,cell2[0]==='阳'?1:0,+cell2.slice(1)),'note':'该时两至逆表爻位不立，从通行基础表'};
}
/* 化简取卦数：反复减基准（天数二十五、地数三十）至不大于基准，
 * 再整除十取商、否则取个位（25 得 5 中宫、30 得 3 坤） */
function hlSimplify(v,base){
  while(v>base) v-=base;
  return v%10===0 ? v/10 : v%10;
}
/* 爻辞、卦辞与象辞读取（jingwen.js 顶层 const，词法共享；未加载时静默为空） */
function hlGci(name){ return (typeof GUA_CI!=='undefined'&&GUA_CI[name])||''; }
function hlYci(name,pos){ return (typeof YAO_CI!=='undefined'&&YAO_CI[name+HL_YAO_POS[pos-1]])||''; }
function hlDax(name){ return (typeof GUA_DAXIANG!=='undefined'&&GUA_DAXIANG[name])||''; }
function hlXiaox(name,pos){ return (typeof YAO_XIAOXIANG!=='undefined'&&YAO_XIAOXIANG[name+HL_YAO_POS[pos-1]])||''; }

/* ---------- 0.1 卦画与卦气 ---------- */
/* 六爻自下而上成卦，画爻自上而下排（上爻居顶），故六爻倒序输出 */
function hlGuaDraw(bits,pos){
  let s='<div class="hl-draw">';
  for(let p=6;p>=1;p--){
    const yang=bits[p-1]===1;
    s+='<div class="hl-yao'+(pos===p?' hl-yao-cur':'')+'">'
      +'<span class="yb'+(yang?'':' gap')+'" role="img" aria-label="'+(yang?'阳爻':'阴爻')+'">'
      +(yang?'':'<span></span><span></span>')+'</span>'
      +'<span class="hl-yao-name">'+hlYaoLabel(bits,p)+'</span></div>';
  }
  return s+'</div>';
}
/* 卦气旺相休囚死：以卦之上下卦五行对月令各判一次；
 * 命卦先天后天用生月，值日卦与合参用值月，流年卦不单出卦气 */
function hlGuaQi(info,monthZhi,label){
  const zw=(typeof ZHI_WX!=='undefined'&&ZHI_WX)||{};
  const mw=zw[monthZhi]||'土';
  const up=HL_TRIGRAM_WX[info.upper],lo=HL_TRIGRAM_WX[info.lower];
  return '<span class="hl-qi">上卦'+info.upper+'属'+up+'，'+HL_wxState(up,mw)
    +'；下卦'+info.lower+'属'+lo+'，'+HL_wxState(lo,mw)+'（'+(label||'生')+monthZhi+'月，月令属'+mw+'，'+hlTipSpan('旺相休囚死')+'）</span>';
}

/* ---------- 1. 日期与节气工具 ---------- */
function hlMs(solar){
  return new Date(solar.getYear(),solar.getMonth()-1,solar.getDay(),solar.getHour(),solar.getMinute()).getTime();
}
/* 收集某节气名（含重复键）在目标公历年前后三个农历年的全部时刻，升序去重 */
function hlJieqiAll(name,gy){
  const seen={},out=[];
  [gy-1,gy,gy+1].forEach(function(y){
    const tbl=Lunar.fromYmd(y,6,1).getJieQiTable();
    for(const k in tbl){
      if(k.indexOf(name)>=0){
        const ms=hlMs(tbl[k]);
        if(!seen[ms]){ seen[ms]=1; out.push(ms); }
      }
    }
  });
  return out.sort(function(a,b){return a-b;});
}
/* 时刻之前（含当时）最近的一次节气时刻，无则 null */
function hlJieqiPrev(name,gy,ms){
  let best=null;
  hlJieqiAll(name,gy).forEach(function(t){ if(t<=ms) best=t; });
  return best;
}
/* 二至二分四段：以不晚于该时刻的最近一个节气为当前段，段表由 HL_HUA_GONG 一处持有；
 * 元堂两至逆表与四正段化工同取此一处，季月另按中气前后分 */
function hlSeasonSeg(gy,ms){
  let hit=null,hitT=-1;
  HL_HUA_GONG.forEach(function(s){
    const t=hlJieqiPrev(s.jie,gy,ms);
    if(t!==null&&t>hitT){ hitT=t; hit=s; }
  });
  return hit;
}
function hlFmtMs(ms){
  const d=new Date(ms);
  return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
}
/* 立春界公历年号：取不晚于出生时刻的最近一次立春所在之年。
 * 与节气月定位同用 hlJieYearOf 一处真源，立春前出生归上一年 */
function hlLichunYearNum(solar){
  const y=hlJieYearOf(hlMs(solar));
  return y===null?solar.getYear():y;
}
/* 解析公历日期串，非法给中文报错 */
function hlParseDate(str){
  const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((str||'').trim());
  if(!m) throw new Error('日期格式应为 公历年-月-日，如 2026-09-08');
  const y=+m[1],mo=+m[2],d=+m[3];
  if(y<HL_MIN_YEAR||y>HL_MAX_YEAR) throw new Error('本页支持 '+HL_MIN_YEAR+' 至 '+HL_MAX_YEAR+' 年');
  if(mo<1||mo>12) throw new Error('月份须在 1 至 12 之间');
  if(d<1||d>31) throw new Error('日须在 1 至 31 之间');
  const dt=new Date(y,mo-1,d);
  if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d) throw new Error('该日期不存在，请核对');
  return {'y':y,'mo':mo,'d':d};
}
/* 时辰下拉值到时支序（0 子 至 11 亥），空为未知。下拉值即该时辰中点钟点 */
function hlHourIdx(v){
  const map={'00:00':0,'02:00':1,'04:00':2,'06:00':3,'08:00':4,'10:00':5,
             '12:00':6,'14:00':7,'16:00':8,'18:00':9,'20:00':10,'22:00':11};
  return map[v]==null?-1:map[v];
}
/* 出生地经度：手动经度优先，其次省市区三级经度真源；两处皆未定返回空，不按他地兜底 */
function hlBirthLng(){
  const v=document.getElementById('hlLng').value;
  if(String(v||'').trim()!==''&&isFinite(Number(v))) return parseFloat(v);
  if(typeof findLng==='function') return findLng(document.getElementById('hlProv').value,document.getElementById('hlCity').value,document.getElementById('hlDist').value);
  return null;
}
function hlFmtClock(t){ return t.y+'年'+t.mo+'月'+t.d+'日 '+('0'+t.h).slice(-2)+':'+('0'+t.mi).slice(-2); }

/* ---------- 2. 核心推算 ---------- */
/* 时刻链：钟面时刻 → 夏令时折算 → 太阳时校正 → 子时日界 → 四柱与元堂。
 * 太阳时缺省不校正；校正须有出生地经度，无经度即不校，不按他地经度兜底 */
function calcHeluo(y,mo,d,h,mi,male,opt){
  opt=opt||{};
  const ziMode=opt.ziMode==='early'?'early':'late';
  const sunMode=(opt.sunMode==='true'||opt.sunMode==='mean')?opt.sunMode:'off';
  const dstMode=(opt.dst==='on'||opt.dst==='off')?opt.dst:'auto';
  const lng=(opt.lng==null||!isFinite(opt.lng))?null:Number(opt.lng);
  /* 境外出生：baseLng 为当地标准时区基准子午线，localDst 为当地夏令时；
     两项由共享件 placeTimeOptsOf 给出，境内缺省东经 120 度与不折 */
  const baseLng=(opt.baseLng==null||!isFinite(opt.baseLng))?null:Number(opt.baseLng);
  const localDst=!!opt.localDst;
  const clock={'y':y,'mo':mo,'d':d,'h':h,'mi':mi};
  let cy=y,cm=mo,cd=d,ch=h,cmi=mi,dstApplied=false,dstNote='';
  if(baseLng==null&&typeof applyDstCorrection==='function'){
    const ds=applyDstCorrection(cy,cm,cd,ch,cmi,dstMode);
    dstApplied=!!ds.applied; dstNote=ds.note||'';
    if(ds.applied){ cy=ds.y; cm=ds.m; cd=ds.d; ch=ds.h; cmi=ds.mi; }
  }
  if(localDst&&typeof shiftClockDay==='function'){
    const ld=shiftClockDay(cy,cm,cd,ch,cmi,-60);
    const p2=function(n){ return ('0'+n).slice(-2); };
    dstNote=(dstNote?dstNote+'；':'')+'当地夏令时：钟面 '+p2(ch)+':'+p2(cmi)+' 折为标准时 '+p2(ld.h)+':'+p2(ld.mi);
    cy=ld.y; cm=ld.m; cd=ld.d; ch=ld.h; cmi=ld.mi; dstApplied=true;
  }
  let usedTrue=false,adj=0,adjE=0,adjLng=0;
  if(sunMode!=='off'&&lng!=null&&typeof trueSolarTime==='function'){
    const ts=trueSolarTime(cy,cm,cd,ch,cmi,lng,sunMode,baseLng==null?120:baseLng);
    usedTrue=true; adj=ts.totalAdj; adjE=ts.E; adjLng=ts.lngAdj;
    cy=ts.y; cm=ts.m; cd=ts.d; ch=ts.h; cmi=ts.mi;
  }
  const trueTime={'y':cy,'mo':cm,'d':cd,'h':ch,'mi':cmi};
  const hourIdx=Math.floor(((ch+1)%24)/2);
  if(hourIdx===0){
    if(ziMode==='late'&&ch===23){
      const nx=new Date(cy,cm-1,cd+1);
      cy=nx.getFullYear(); cm=nx.getMonth()+1; cd=nx.getDate();
    }
    ch=0; cmi=0;
  }
  const solar=Solar.fromYmdHms(cy,cm,cd,ch,cmi,0);
  const lunar=solar.getLunar();
  const gzY=lunar.getYearInGanZhiByLiChun();
  const gzM=lunar.getMonthInGanZhiExact();
  const gzD=lunar.getDayInGanZhi();
  const yearGan=gzY[0],monthZhi=lunar.getMonthZhiExact();
  const yangYear='甲丙戊庚壬'.indexOf(yearGan)>=0;
  const lichunYear=hlLichunYearNum(solar);
  const yuan=HL_sanyuanOf(lichunYear);
  const cyS=solar.getYear();

  /* 干支取数：四柱 4 干各 1 数、4 支各 2 数 */
  const pillars=[{'tag':'年','gz':gzY},{'tag':'月','gz':gzM},{'tag':'日','gz':gzD},{'tag':'时','gz':lunar.getTimeInGanZhi()}];
  let tian=0,di=0;
  pillars.forEach(function(p){
    const g=HL_GAN_NUM[p.gz[0]],z=HL_ZHI_NUM[p.gz[1]];
    p.gn=g; p.zn=z;
    if(g%2===1) tian+=g; else di+=g;
    z.forEach(function(n){ if(n%2===1) tian+=n; else di+=n; });
  });

  /* 化简与中宫寄卦 */
  const tianNum=hlSimplify(tian,25),diNum=hlSimplify(di,30);
  const zhongTian=tianNum===5?HL_zhonggong(yuan,yangYear,male):null;
  const zhongDi=diNum===5?HL_zhonggong(yuan,yangYear,male):null;
  const tianGua=tianNum===5?zhongTian:HL_HELUO_GUA[tianNum];
  const diGua=diNum===5?zhongDi:HL_HELUO_GUA[diNum];

  /* 先天本命卦：阳命男、阴命女，天数卦为上卦、地数卦为下卦；
   * 阳命女、阴命男，地数卦为上卦、天数卦为下卦 */
  const tianUp=(yangYear===male);
  const upName=tianUp?tianGua:diGua,loName=tianUp?diGua:tianGua;
  const xianBits=TRIGRAMS[loName].bits.concat(TRIGRAMS[upName].bits);
  const xianName=guaName(upName,loName);

  /* 元堂（高精度版）：阳时取阳爻、阴时取阴爻，查基础表；
   * 女命先天得乾生于冬至后夏至前、男命先天得坤生于夏至后冬至前，用两至逆表 */
  const baseRow=HL_YT_TABLE[hlYangCount(xianBits)];
  let ytRow=baseRow,refineNote='';
  const birthMs=hlMs(solar);
  const season=hlSeasonSeg(cyS,birthMs);
  if(!male&&xianName==='乾为天'&&season&&(season.jie==='冬至'||season.jie==='春分')){
    ytRow=HL_YT_REV_FEMALE_QIAN;
    refineNote='女命先天得乾、生于冬至后夏至前，元堂用两至逆表（自上而下逆数）';
  }else if(male&&xianName==='坤为地'&&season&&(season.jie==='夏至'||season.jie==='秋分')){
    ytRow=HL_YT_REV_MALE_KUN;
    refineNote='男命先天得坤、生于夏至后冬至前，元堂用两至逆表（自上而下逆数）';
  }
  const xianPick=hlYtPick(xianBits,ytRow,baseRow,hourIdx);
  const xianYtPos=xianPick.pos;
  if(xianPick.note) refineNote=refineNote?refineNote+'；'+xianPick.note:xianPick.note;

  /* 后天卦：变元堂爻、上下互换；至尊卦（先天坎、屯、蹇，元堂九五、上六）
   * 按生月阴阳从特例表取（阳月为节气月支寅、辰、午、申、戌，余为阴月） */
  const yangMonth='寅辰午申戌'.indexOf(monthZhi)>=0;
  const yueYinYang=yangMonth?'阳':'阴';
  let houName='',houBits=null,zhizunNote='';
  const zhizunShort={'坎为水':'坎','水雷屯':'屯','水山蹇':'蹇'};
  const short=(xianYtPos===5||xianYtPos===6)?zhizunShort[xianName]:null;
  if(short){
    const key=xianYtPos===5?'九五':'上六';
    houName=HL_ZHIZUN[short][key][yueYinYang];
    houBits=HL64_BITS[houName];
    const swap=(xianYtPos===5&&yangMonth)||(xianYtPos===6&&!yangMonth);
    zhizunNote='先天'+xianName+'系至尊卦，元堂在'+key+'，生'+yueYinYang+'月（'+monthZhi+'月），依特例变爻'+(swap?'且上下互换':'不互换')+'得后天卦';
  }else{
    const flipped=hlFlip(xianBits,xianYtPos);
    houBits=flipped.slice(3).concat(flipped.slice(0,3));
    houName=hexInfo(houBits).name;
  }

  /* 后天卦元堂：同一生时查同一张表（两至逆表条件随先天卦同用） */
  const houRow=refineNote?((xianName==='乾为天')?HL_YT_REV_FEMALE_QIAN:HL_YT_REV_MALE_KUN):HL_YT_TABLE[hlYangCount(houBits)];
  const houYtPos=hlYtPick(houBits,houRow,HL_YT_TABLE[hlYangCount(houBits)],hourIdx).pos;

  /* 元气自年柱取（干为天元气、支为地元气），反元气为其反卦；
   * 化工自月令节气取（四正段或季月中气前后），反化工随之 */
  const qiTian=HL_YUAN_QI[yearGan],qiDi=HL_YUAN_QI[gzY[1]];
  const fanTian=HL_FAN_GUA[qiTian],fanDi=HL_FAN_GUA[qiDi];
  const hasGua=function(g){ return g!=null&&(upName===g||loName===g); };
  let hgGua=null,hgFan=null,hgDesc='';
  const jiYue=HL_JI_YUE[monthZhi];
  if(jiYue){
    const jieMs=hlJieqiPrev(jiYue.jie,cyS,birthMs);
    let zhongMs=null;
    if(jieMs!==null){
      hlJieqiAll(jiYue.zhong,cyS).forEach(function(t){
        if(t>jieMs&&t<=birthMs&&(zhongMs===null||t<zhongMs)) zhongMs=t;
      });
    }
    const before=zhongMs===null;
    hgGua=before?'坤':'艮'; hgFan=before?'乾':'兑';
    hgDesc=monthZhi+'月'+jiYue.zhong+(before?'前':'后');
  }else if(season){
    hgGua=season.gua; hgFan=season.fan; hgDesc=season.jie+'后'+season.next+'前';
  }

  /* 大运：阳爻九年、阴爻六年，虚岁计；先天自元堂起、后天自其元堂续，
   * 各自下而上回环行六爻 */
  const dayuns=[];
  function pushDayun(gname,bits,startPos,tag){
    let pos=startPos;
    let age=dayuns.length?dayuns[dayuns.length-1].to+1:1;
    for(let k=0;k<6;k++){
      const yangG=bits[pos-1]===1,dur=yangG?9:6;
      /* 段首岁之年干阴阳：流年链首岁的阳年阴年之分只由这一段的首岁定一次，
       * 段内其余各岁的卦皆由此链进，不再逐年另判 */
      const segYang='甲丙戊庚壬'.indexOf(hlYearGanZhi(lichunYear+age-1)[0])>=0;
      dayuns.push({'n':dayuns.length+1,'tag':tag,'gua':gname,'bits':bits,'pos':pos,
        'yang':yangG,'yangYear':segYang,'from':age,'to':age+dur-1});
      age+=dur; pos=pos%6+1;
    }
  }
  pushDayun(xianName,xianBits,xianYtPos,'先天');
  pushDayun(houName,houBits,houYtPos,'后天');

  return {'y':y,'mo':mo,'d':d,'hourIdx':hourIdx,'male':male,'ziMode':ziMode,
    'clock':clock,'trueTime':trueTime,'usedTrue':usedTrue,'adj':adj,'adjE':adjE,'adjLng':adjLng,
    'sunMode':sunMode,'lng':lng,'dstApplied':dstApplied,'dstNote':dstNote,
    'gzY':gzY,'gzM':gzM,'gzD':gzD,'gzT':lunar.getTimeInGanZhi(),
    'yearGan':yearGan,'yangYear':yangYear,'monthZhi':monthZhi,'lichunYear':lichunYear,'yuan':yuan,
    'pillars':pillars,'tian':tian,'di':di,'tianNum':tianNum,'diNum':diNum,
    'tianGua':tianGua,'diGua':diGua,'zhongTian':zhongTian,'zhongDi':zhongDi,
    'upName':upName,'loName':loName,'tianUp':tianUp,
    'xianName':xianName,'xianBits':xianBits,'xianYtPos':xianYtPos,'refineNote':refineNote,
    'houName':houName,'houBits':houBits,'houYtPos':houYtPos,'zhizunNote':zhizunNote,
    'qiTian':qiTian,'qiDi':qiDi,'fanTian':fanTian,'fanDi':fanDi,
    'hasQiTian':hasGua(qiTian),'hasQiDi':hasGua(qiDi),
    'hasFanTian':hasGua(fanTian),'hasFanDi':hasGua(fanDi),
    'hgGua':hgGua,'hgFan':hgFan,'hgDesc':hgDesc,'hasHg':hasGua(hgGua),'hasHgFan':hasGua(hgFan),
    'dayuns':dayuns};
}

/* ---------- 3. 流年 ---------- */
/* 大运段内第 i 岁的流年卦：阳爻运初岁阳年本卦不变、阴年变大运爻，二岁变应爻，
 * 三岁复变元堂位，四岁起自大运爻上一位逐爻回环上行；阴爻运初岁变大运爻，
 * 二至六岁自大运爻上一位逐爻回环上行。当年新变之爻即流年卦元堂 */
function hlLiuNianChain(seg,i,yangYear){
  let bits=seg.bits.slice(),prevPos=null;
  for(let k=1;k<=i;k++){
    let p;
    if(seg.yang){
      if(k===1) p=seg.pos;
      else if(k===2||k===3) p=HL_ying(prevPos);
      else p=((seg.pos-1+(k-3))%6)+1;
    }else{
      if(k===1) p=seg.pos;
      else p=((seg.pos-1+(k-1))%6)+1;
    }
    if(!(seg.yang&&k===1&&yangYear)) bits=hlFlip(bits,p);
    prevPos=p;
  }
  return {'bits':bits,'pos':prevPos};
}
function hlFindSeg(dayuns,sui){
  for(let i=0;i<dayuns.length;i++){
    if(sui>=dayuns[i].from&&sui<=dayuns[i].to) return dayuns[i];
  }
  return null;
}
function hlYearGanZhi(Y){
  return Solar.fromYmdHms(Y,6,1,12,0,0).getLunar().getYearInGanZhiByLiChun();
}
/* 流年查询：Y 为立春界公历年。yangYear 为当年年干阴阳，供展示；
 * segYangYear 为该段首岁年干阴阳，流年链只由后者一次定初岁变与不变 */
function hlLiuNian(h,Y){
  const sui=Y-h.lichunYear+1;
  const seg=hlFindSeg(h.dayuns,sui);
  if(!seg) return null;
  const i=sui-seg.from+1;
  const gz=hlYearGanZhi(Y);
  const yearYang='甲丙戊庚壬'.indexOf(gz[0])>=0;
  const r=hlLiuNianChain(seg,i,seg.yangYear);
  return {'Y':Y,'sui':sui,'seg':seg,'i':i,'gz':gz,'yangYear':yearYang,'segYangYear':seg.yangYear,
    'bits':r.bits,'name':hexInfo(r.bits).name,'pos':r.pos};
}
/* 大运段全序列（每岁卦名与元堂） */
function hlLiuNianSeg(h,seg){
  const rows=[];
  for(let s=seg.from;s<=seg.to;s++){
    const Y=h.lichunYear+s-1,i=s-seg.from+1;
    const gz=hlYearGanZhi(Y);
    const r=hlLiuNianChain(seg,i,seg.yangYear);
    rows.push({'sui':s,'Y':Y,'gz':gz,'name':hexInfo(r.bits).name,'bits':r.bits,'pos':r.pos});
  }
  return rows;
}

/* ---------- 4. 流月 ---------- */
/* 以流年卦为本：正月变元堂上一位起，单月（正、三、五、七、九、十一月）
 * 挨次向上变去；双月取对应单月卦元堂之应爻变之。月卦元堂即当年所变之爻 */
function hlLiuYueList(nianBits,nianPos){
  const out=[];
  for(let m=1;m<=12;m++){
    if(m%2===1){
      const p=((nianPos-1+(m+1)/2)%6)+1;
      const bits=hlFlip(nianBits,p);
      out.push({'m':m,'bits':bits,'name':hexInfo(bits).name,'pos':p});
    }else{
      const prev=out[out.length-1],p=HL_ying(prev.pos);
      const bits=hlFlip(prev.bits,p);
      out.push({'m':m,'bits':bits,'name':hexInfo(bits).name,'pos':p});
    }
  }
  return out;
}
/* 立春界年 Y 的十二节界（寅月起于立春，丑月止于次年立春前一日） */
function hlYueBounds(Y){
  const jie=['惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
  let prev=null;
  hlJieqiAll('立春',Y).forEach(function(t){
    if(new Date(t).getFullYear()===Y&&(prev===null||t<prev)) prev=t;
  });
  const starts=[prev];
  for(let i=0;i<12;i++){
    const name=i<11?jie[i]:'立春';
    let t=null;
    hlJieqiAll(name,Y).forEach(function(x){ if(x>prev&&(t===null||x<t)) t=x; });
    starts.push(t); prev=t;
  }
  const out=[];
  for(let i=0;i<12;i++){
    out.push({'m':i+1,'zhi':HL_ZHI_ORDER[(i+2)%12],'start':starts[i],'end':starts[i+1]-1});
  }
  return out;
}

/* ---------- 5. 流日 ---------- */
/* 以流月卦为本，一卦管六日、五卦三十日，日数自节气日起算。每日变一爻，
 * 自月卦元堂上一位起逐日上行回环，起始位对齐日辰阴阳（奇日变阳位、
 * 偶日变阴位）；日卦逐日链变，新变之爻即日卦元堂 */
function hlDayStartK(yuePos,day1Odd){
  for(let k=1;k<=6;k++){
    const p=((yuePos-1+k)%6)+1;
    if((p%2===1)===day1Odd) return k;
  }
  return 1;
}
function hlDayGua(yueBits,yuePos,dd){
  /* 起始位只对齐第 1 日（节入首日序数为奇、阳位），此后逐日链进自守阴阳 */
  const startK=hlDayStartK(yuePos,true);
  let bits=yueBits.slice(),r=null;
  for(let n=1;n<=dd;n++){
    const p=((yuePos-1+startK+(n-1))%6)+1;
    bits=hlFlip(bits,p);
    r={'bits':bits,'name':hexInfo(bits).name,'pos':p};
  }
  return r;
}
/* 节气年：不晚于该日的最近一次立春所在的公历年（立春前日子属上一节气年） */
function hlJieYearOf(ms){
  const gy=new Date(ms).getFullYear();
  let best=null;
  [gy-1,gy].forEach(function(y){
    hlJieqiAll('立春',y).forEach(function(t){ if(t<=ms&&(best===null||t>best)) best=t; });
  });
  return best===null?null:new Date(best).getFullYear();
}
function hlLocateMonth(ms){
  const Y=hlJieYearOf(ms);
  if(Y===null) return null;
  const bounds=hlYueBounds(Y);
  for(let i=0;i<12;i++){
    if(ms>=bounds[i].start&&ms<=bounds[i].end){
      return {'Y':Y,'m':bounds[i].m,'zhi':bounds[i].zhi,
        'dd':Math.floor((ms-bounds[i].start)/86400000)+1};
    }
  }
  return null;
}

/* 邻近某日的值日卦：按该日自属的节气月取月卦与日序，跨月即换月卦；
 * 与 hlQueryLoc 同按日终定位，节入当日归新节 */
function hlDayAt(h,dv,k){
  const loc=hlLocateMonth(new Date(dv.y,dv.mo-1,dv.d+k,23,59,59).getTime());
  if(!loc) return null;
  const ln=hlLiuNian(h,loc.Y);
  if(!ln) return null;
  const yue=hlLiuYueList(ln.bits,ln.pos)[loc.m-1];
  const g=hlDayGua(yue.bits,yue.pos,loc.dd);
  return {'dd':loc.dd,'zhi':loc.zhi,'name':g.name,'bits':g.bits,'pos':g.pos};
}

/* ---------- 6. 流时 ---------- */
/* 值日卦元堂定基准：阳时自元堂上一位起进数变去，阴时自元堂下一位起
 * 退数变去，半日内逐时递进回环，新变之爻即时卦元堂（原书两法判前法为优） */
function hlShiGua(riBits,riPos,shiIdx){
  let bits=riBits.slice(),p=riPos;
  const steps=shiIdx<6?shiIdx:shiIdx-6;
  for(let k=0;k<=steps;k++){
    p=shiIdx<6?((riPos-1+1+k)%6)+1:((riPos-1-1-k+12)%6)+1;
    bits=hlFlip(bits,p);
  }
  return {'bits':bits,'name':hexInfo(bits).name,'pos':p};
}

/* ---------- 7. 渲染 ---------- */
/* 卦卡：卦题 → 卦画与卦气 → 本卦含义 → 卦曰象曰 → 六爻表 → 此爻阶段。
   两句白话由已排出的卦名与爻位派生，读者先见白话、再见经文，时辰未知时元堂不立、该句不出 */
function hlGuaCard(name,bits,pos,title,monthZhi,qiLabel){
  const info=hexInfo(bits),gci=hlGci(name),sense=hlHexSense(name),dax=hlDax(name);
  let rows='';
  for(let p=1;p<=6;p++){
    const cur=pos===p;
    rows+='<tr'+(cur?' class="hl-cur"':'')+'><td>'+hlYaoLabel(bits,p)+'</td><td>'
      +hlEsc(hlYci(name,p))+'</td>'+(cur?'<td class="hl-tag">元堂</td>':'<td></td>')+'</tr>';
  }
  const xx=pos>=1?hlXiaox(name,pos):'';
  return '<div class="hl-gua-card"><h4>'+hlEsc(title||'')+'：'+hlEsc(name)+'（'+info.upper+'上'+info.lower+'下）</h4>'
    +'<div class="hl-gua-top">'+hlGuaDraw(bits,pos)
    +(monthZhi?'<div class="hl-qi-line">'+hlGuaQi(info,monthZhi,qiLabel)+'</div>':'')+'</div>'
    +(sense?hlJd('本卦含义：'+sense+'。'):'')
    +(gci?'<p class="hl-gci">卦曰：'+hlEsc(gci)+'</p>':'')
    +(dax?'<p class="hl-gci">'+hlTipSpan('大象')+'：'+hlEsc(dax)+'</p>':'')
    +'<table class="hl-tbl hl-yao-tbl"><tbody>'+rows+'</tbody></table>'
    +(pos>=1?hlJd('此爻阶段：元堂在'+hlYaoLabel(bits,pos)+'，'+HL_YAO_WEI[pos]+'。'+(xx?hlTipSpan('小象')+'：'+hlEsc(xx)+'。':'')):'')
    +'</div>';
}
function hlTable(headers,rows,curRow){
  let h='<div class="hl-tbl-wrap"><table class="hl-tbl"><thead><tr>';
  headers.forEach(function(x){ h+='<th>'+x+'</th>'; });
  h+='</tr></thead><tbody>';
  rows.forEach(function(r,i){
    h+='<tr'+(curRow===i?' class="hl-cur"':'')+'>';
    r.forEach(function(c){ h+='<td>'+c+'</td>'; });
    h+='</tr>';
  });
  return h+'</tbody></table></div>';
}
/* 白话解读助手：全部由已排出的卦名与爻位派生，字典在数据文件 */
function hlHexSense(name){ return (typeof HL64_SENSE!=='undefined'&&HL64_SENSE[name])||''; }
function hlJd(s){ return '<p class="sub-note hl-jd">'+s+'</p>'; }

/* ---------- 术语释义弹窗 ---------- */
/* 术语在释义表（heluo-terms.js）内即可点，点开弹该词释义；未收者原样输出，不误导。
 * 弹窗用站内 .modal-mask 与 .modal 全局样式，与佛历、万年历各页同制式，各页自成一份 */
function hlTipSpan(name,show){
  if(typeof heluoMean!=='function') return show||name;
  if(!heluoMean(name)) return show||name;
  return '<span class="tip" onclick="hlShowTip(\''+name+'\')">'+(show||name)+'</span>';
}
function hlCloseTip(){ const m=document.getElementById('hlMask'); if(m) m.classList.remove('show'); }
function hlShowTip(name){
  let mask=document.getElementById('hlMask');
  if(!mask){
    mask=document.createElement('div'); mask.id='hlMask'; mask.className='modal-mask';
    mask.setAttribute('role','dialog');
    mask.innerHTML='<div class="modal"><span class="close" onclick="hlCloseTip()" aria-label="关闭">×</span><div id="hlTipBody"></div></div>';
    mask.addEventListener('click',function(e){ if(e.target===mask) hlCloseTip(); });
    document.body.appendChild(mask);
  }
  const o=heluoMean(name);
  document.getElementById('hlTipBody').innerHTML='<h3 class="tip-title">'+(o?o.t:name)+'</h3>'
    +'<div class="tip-body">'+(o?o.d:'（暂无说明）')+'</div>';
  mask.classList.add('show');
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') hlCloseTip(); });

/* 起卦模块 */
function renderQigua(){
  const out=document.getElementById('hlQgOut');
  try{
    const dv=hlParseDate(document.getElementById('hlDate').value);
    const timeVal=document.getElementById('hlTime').value;
    const tm=/^(\d{1,2}):(\d{2})$/.exec(String(timeVal||'').trim());
    if(!tm) throw new Error('请填写出生时间（时:分）');
    const male=document.getElementById('hlSex').value!=='2';
    const ziEl=document.getElementById('hlZi');
    const ziMode=(ziEl&&ziEl.value)||'late';
    const sunMode=document.getElementById('hlSun').value||'off';
    const dst=document.getElementById('hlDst').value||'auto';
    const lng=hlBirthLng();
    if(sunMode!=='off'&&lng==null) throw new Error('太阳时校正已开，但未定出生地：请选择省市区或填写经度；若出生地无考，把太阳时改为不校正');
    const _pto=placeTimeOptsOf({prov:'hlProv',city:'hlCity',lng:'hlLng',tz:'hlTzOff',dst:'hlLocalDst'});
    const h=calcHeluo(dv.y,dv.mo,dv.d,parseInt(tm[1],10),parseInt(tm[2],10),male,{'ziMode':ziMode,'sunMode':sunMode,'dst':_pto.overseas?'off':dst,'lng':lng,'baseLng':_pto.overseas?_pto.baseLng:null,'localDst':_pto.localDst});
    HL_STATE.calc=h;
    const yuanName=['上元','中元','下元'][h.yuan];
    let s='<div class="hl-bazi-line">公历 '+h.y+'年'+h.mo+'月'+h.d+'日'+HL_ZHI_ORDER[h.hourIdx]+'时，'+(h.male?'男命':'女命')
      +(h.hourIdx===0?'（'+(h.ziMode==='late'?'晚子时，日柱归次日':'早子时，日柱归当日')+'）':'')+'</div>';
    if(h.usedTrue){
      const sunLabel=h.sunMode==='mean'?'平太阳时':'真太阳时';
      s+='<p class="sub-note">'+hlTipSpan(sunLabel)+'：钟面 '+hlFmtClock(h.clock)+'，校正 '+h.adj+' 分（均时差 '+h.adjE+'、经度差 '+h.adjLng+'），得 '+hlFmtClock(h.trueTime)+'，归'+HL_ZHI_ORDER[h.hourIdx]+'时。</p>';
    }
    if(h.dstApplied&&h.dstNote) s+='<p class="sub-note">'+hlEsc(h.dstNote)+'</p>';
    s+='<p class="sub-note">四柱：年柱 '+h.gzY+'、月柱 '+h.gzM+'、日柱 '+h.gzD+'、时柱 '+h.gzT+'。';
    if(h.refineNote) s+=hlEsc(h.refineNote)+'。';
    s+='</p>';
    const rows=h.pillars.map(function(p){
      return [p.tag+'柱 '+p.gz,'干取数 '+p.gn,'支取数 '+p.zn[0]+'、'+p.zn[1]];
    });
    s+=hlTable(['四柱','干取数','支取数'],rows);
    s+='<div class="hl-info">'
      +'<div class="hl-i"><span class="k">'+hlTipSpan('天数')+'</span><span class="v">'+h.tian+'，化简得 '+h.tianNum+(h.tianNum===5?'，中宫寄'+h.tianGua:'，为'+h.tianGua)+'</span></div>'
      +'<div class="hl-i"><span class="k">'+hlTipSpan('地数')+'</span><span class="v">'+h.di+'，化简得 '+h.diNum+(h.diNum===5?'，中宫寄'+h.diGua:'，为'+h.diGua)+'</span></div>'
      +'</div>';
    s+='<p class="sub-note">取数口径：天干取洛书纳甲之数、地支取河图之数，奇数并入天数、偶数并入地数，再以二十五、三十化简；铁板神数页的河洛起卦模块另取太玄数法，以天干太玄和定上卦、地支太玄和定下卦，不化简、不寄卦，与本页纳甲取数法为两套体系，两页各依本页所载之法，卦数不必相同。</p>';
    if(h.tianNum===5||h.diNum===5){
      s+='<p class="sub-note">'+h.lichunYear+'年属'+yuanName+'（'+(1864+h.yuan*60)+'至'+(1923+h.yuan*60)+'年）。'+hlTipSpan('中宫寄卦')+'：'+yuanName+'为'+hlTipSpan('三元')+'之一，'+(h.yuan===1?(h.yangYear===h.male?'阳男阴女':'阴男阳女'):(h.male?'男':'女'))+'寄'+(h.tianNum===5?h.zhongTian:h.zhongDi)+'。</p>';
    }
    s+=hlGuaCard(h.xianName,h.xianBits,h.xianYtPos,'先天本命卦',h.monthZhi);
    s+='<p class="sub-note">'+(h.tianUp?'天数卦为上卦、地数卦为下卦':'地数卦为上卦、天数卦为下卦')+'（'+(h.yangYear?'阳年':'阴年')+(h.male?'男':'女')+'命）。'+hlTipSpan('元堂')+'在'+hlYaoLabel(h.xianBits,h.xianYtPos)+'（第'+h.xianYtPos+'爻，'+hlTipSpan('爻位',HL_YAO_WEI[h.xianYtPos])+'）。</p>';
    s+=hlJd(hlTipSpan('先天卦')+'是全盘的根基，示禀赋与一生气象的底色。上卦'+h.upName+'（'+HL_TRIGRAM_SENSE[h.upName]+'），下卦'+h.loName+'（'+HL_TRIGRAM_SENSE[h.loName]+'），两卦相叠成'+h.xianName+'。元堂一爻是气数聚焦之处，其后大运流年皆由此爻推出。');
    if(h.zhizunNote) s+='<p class="sub-note hl-zz">'+hlTipSpan('至尊卦')+'：'+hlEsc(h.zhizunNote)+'。</p>';
    s+=hlGuaCard(h.houName,h.houBits,h.houYtPos,'后天卦',h.monthZhi);
    s+='<p class="sub-note">'+(h.zhizunNote?'（本命系至尊卦，从特例）':'')+'元堂以同一生时重查，在'+hlYaoLabel(h.houBits,h.houYtPos)+'。</p>';
    s+=hlJd(hlTipSpan('后天卦')+'示先天禀赋落入现实之后的走向：变元堂一爻、上下两卦互换，喻境遇既易、气质随之而转，其元堂与先天同以生时重查。');
    s+='<h4 class="det-h">元气与化工</h4>';
    s+='<p class="sub-note">'+hlTipSpan('元气')+'自年柱取：天元气（年干'+h.gzY[0]+'）得 '+h.qiTian+'，命中卦'+(h.hasQiTian?'得之，为有元气':'不得')+'；地元气（年支'+h.gzY[1]+'）得 '+h.qiDi+'，命中卦'+(h.hasQiDi?'得之，为有元气':'不得')+'。'+hlTipSpan('反元气')+'为 '+h.fanTian+'（天）、'+h.fanDi+'（地），命中卦'+((h.hasFanTian||h.hasFanDi)?'得之':'不得')+'。</p>';
    if(h.hgGua){
      s+='<p class="sub-note">'+hlTipSpan('化工')+'自月令取：生在'+hlEsc(h.hgDesc)+'，化工为 '+h.hgGua+'，命中卦'+(h.hasHg?'得之，为有化工':'不得')+'；'+hlTipSpan('反化工')+'为 '+h.hgFan+'，命中卦'+(h.hasHgFan?'得之':'不得')+'。</p>';
    }
    s+=hlJd('元气取自年柱干支所化之卦，'+(h.hasQiTian||h.hasQiDi?'命中卦得之者，根基受扶、禀气厚实，行事多底气。':'命中卦不得，非不美，仅示先天助力较薄，根基更多系于自身。')+'化工取自出生月令之气，'+(h.hasHg?'命中卦得之者，行事合时、易得境遇之助。':'命中卦不得，示与生月之气联系较疏，成败更多系于后天经营。')+'反元气、反化工为消散之气，命中得之宜防虚耗。得与不得只述气数厚薄，不定吉凶。');
    out.innerHTML=s;
    renderDayun();
  }catch(e){
    HL_STATE.calc=null;
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
    renderDayun();
  }
}

/* 命卦重排后运程失效：清空运程输出，等查运程再算 */
function hlClearYun(){
  HL_STATE.yunValid=false;
  renderLiuNian(); renderLiuYue(); renderLiuRiShi(); renderHeCan();
}

/* 大运模块 */
function renderDayun(){
  const out=document.getElementById('hlDyOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦。</p>'; return; }
  const rows=h.dayuns.map(function(d){
    return [d.tag,d.from+' 至 '+d.to+'（共'+(d.to-d.from+1)+'年）',d.gua,hlYaoLabel(d.bits,d.pos),d.yang?'阳爻九年':'阴爻六年'];
  });
  const curSui=hlCurLichunYear()-h.lichunYear+1;
  const curSeg=hlFindSeg(h.dayuns,curSui);
  const curIdx=curSeg?h.dayuns.indexOf(curSeg):-1;
  out.innerHTML=hlTable(['段','虚岁','卦','起爻','行度'],rows,curIdx)
    +hlJd(hlTipSpan('大运')+'以阳爻一运管九年、阴爻一运管六年，阳运行度舒缓、阴运行度紧凑，故各段长短不同。先天段循本命卦展开，多关禀赋根基；后天段循后天卦展开，多关转向之后的发展。段内行至哪一爻，便以该爻的爻位义看这段运的着力处。'
      +(curSeg?'按今年推，当前虚岁 '+curSui+'，行'+curSeg.tag+'卦 '+curSeg.gua+' '+hlYaoLabel(curSeg.bits,curSeg.pos)+'爻运（'+curSeg.from+'至'+curSeg.to+'岁），'+HL_YAO_WEI[curSeg.pos]+'。':''));
}

/* 统一查询日期：一个日期框驱动流年、流月、流日、流时四层，年份取立春界。
 * 日期框只给到日，节气月与流年按当日日终定位，节入当日即归新节，与流日自节气日起算同例 */
function hlQueryLoc(){
  const dv=hlParseDate(document.getElementById('hlQDate').value);
  const loc=hlLocateMonth(new Date(dv.y,dv.mo-1,dv.d,23,59,59).getTime());
  if(!loc) throw new Error('未能定位该日所属节气月');
  return {'dv':dv,'loc':loc};
}

/* 流年模块 */
function renderLiuNian(){
  const out=document.getElementById('hlNianOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦。</p>'; return; }
  if(!HL_STATE.yunValid){ out.innerHTML='<p class="sub-note">命卦已排，点查运程看流年流月流日流时。</p>'; return; }
  try{
    const q=hlQueryLoc(),Y=q.loc.Y;
    const ln=hlLiuNian(h,Y);
    if(!ln){
      const last=h.dayuns[h.dayuns.length-1].to;
      throw new Error('该年在命主大运之外（大运起于 1 岁、止于 '+last+' 岁）');
    }
    let s='<div class="hl-bazi-line">'+Y+'年（'+ln.gz+'，'+(ln.yangYear?'阳年':'阴年')+'），虚岁 '+ln.sui+'，行'+ln.seg.tag+'卦 '+ln.seg.gua+' '+hlYaoLabel(ln.seg.bits,ln.seg.pos)+'爻运，段内第 '+ln.i+' 岁'
      +(q.dv.y!==Y?'（所查日期在立春前，归上一年流年）':'')+'</div>';
    s+=hlGuaCard(ln.name,ln.bits,ln.pos,'流年卦','');
    s+='<p class="sub-note">当年新变之爻即'+hlTipSpan('流年')+'卦元堂，在'+hlYaoLabel(ln.bits,ln.pos)+'（'+hlTipSpan('爻位',HL_YAO_WEI[ln.pos])+'）。</p>';
    const rows=hlLiuNianSeg(h,ln.seg).map(function(r,idx){
      return [r.sui+' 岁',r.Y+'年（'+r.gz+'）',r.name,hlYaoLabel(r.bits,r.pos)];
    });
    s+='<h4 class="det-h">本段大运流年全序列</h4>'+hlTable(['虚岁','流年','流年卦','元堂'],rows,ln.i-1);
    s+=hlJd('流年卦示'+Y+'年一年的总体气象。当年新变之爻即流年卦元堂，是一年气数所聚；看某年运势即以此卦此爻参详：卦名看全年气象的大方向，元堂爻位看气数落在哪一层，是根基、内里、交接、辅佐、主事还是收束。');
    out.innerHTML=s;
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* 流月模块 */
function renderLiuYue(){
  const out=document.getElementById('hlYueOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦。</p>'; return; }
  if(!HL_STATE.yunValid){ out.innerHTML='<p class="sub-note">命卦已排，点查运程看流月。</p>'; return; }
  try{
    const q=hlQueryLoc();
    const Y=q.loc.Y,mSel=q.loc.m;
    const ln=hlLiuNian(h,Y);
    if(!ln) throw new Error('该年在命主大运之外');
    const months=hlLiuYueList(ln.bits,ln.pos);
    const bounds=hlYueBounds(Y);
    const rows=months.map(function(mm,i){
      return [HL_YUE_NAMES[mm.m-1],bounds[i].zhi+'月',hlFmtMs(bounds[i].start)+' 起',mm.name,hlYaoLabel(mm.bits,mm.pos)];
    });
    out.innerHTML=hlTable(['月','月支','节入','月卦','元堂'],rows,mSel-1)
      +hlJd('一年十二个月的卦都从'+hlTipSpan('流年')+'卦逐爻变出：单月自元堂上一位起挨次上行，双月取对应单月元堂的'+hlTipSpan('应爻')+'，月月不同。看某月运势，即以该月卦与其元堂'+hlTipSpan('爻位')+'参详，元堂所在即当月气数焦点。'
        +(function(){ const nowLoc=hlLocateMonth(Date.now()); if(nowLoc&&nowLoc.Y===Y){ const cm=months[nowLoc.m-1]; return '按节气，当前正值'+HL_YUE_NAMES[nowLoc.m-1]+'（'+nowLoc.zhi+'月），月卦 '+cm.name+'，元堂'+hlYaoLabel(cm.bits,cm.pos)+'。'; } return ''; })());
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* 流日流时模块 */
function renderLiuRiShi(){
  const out=document.getElementById('hlRiOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦。</p>'; return; }
  if(!HL_STATE.yunValid){ out.innerHTML='<p class="sub-note">命卦已排，点查运程看流日流时。</p>'; return; }
  try{
    const q=hlQueryLoc(),dv=q.dv,loc=q.loc;
    const ln=hlLiuNian(h,loc.Y);
    if(!ln) throw new Error('该日所属流年在命主大运之外');
    const yue=hlLiuYueList(ln.bits,ln.pos)[loc.m-1];
    const ri=hlDayGua(yue.bits,yue.pos,loc.dd);
    let s='<div class="hl-bazi-line">'+loc.Y+'年流年卦 '+ln.name+'；'+HL_YUE_NAMES[loc.m-1]+'（'+loc.zhi+'月）月卦 '+yue.name+'，元堂'+hlYaoLabel(yue.bits,yue.pos)+'；查询日为节入后第 '+loc.dd+' 日'
      +(dv.y!==loc.Y?'（所查日期在立春前，归上一年流年）':'')+'</div>';
    s+=hlGuaCard(ri.name,ri.bits,ri.pos,'值日卦',loc.zhi,'值');
    s+='<p class="sub-note">新变之爻即'+hlTipSpan('值日卦')+'元堂，在'+hlYaoLabel(ri.bits,ri.pos)+'。</p>';
    const near=[],curIdx={i:0};
    for(let k=-3;k<=3;k++){
      const d=hlDayAt(h,dv,k);
      if(!d) continue;
      if(k===0) curIdx.i=near.length;
      near.push(['第 '+d.dd+' 日（'+d.zhi+'月）',d.name,hlYaoLabel(d.bits,d.pos)]);
    }
    s+='<h4 class="det-h">邻近日卦</h4>'+hlTable(['日序','日卦','元堂'],near,curIdx.i);
    const shiIdx=hlHourIdx(document.getElementById('hlRiHour').value);
    const shiRows=[];
    for(let t=0;t<12;t++){
      const g=hlShiGua(ri.bits,ri.pos,t);
      shiRows.push([HL_ZHI_ORDER[t]+'时',g.name,hlYaoLabel(g.bits,g.pos)]);
    }
    s+='<h4 class="det-h">十二时卦</h4>'
      +(shiIdx<0?'<p class="sub-note">未选时辰，列全日十二时卦。</p>':'')
      +hlTable(['时辰','时卦','元堂'],shiRows,shiIdx);
    if(shiIdx>=0){
      const cur=hlShiGua(ri.bits,ri.pos,shiIdx);
      s+='<p class="sub-note">'+HL_ZHI_ORDER[shiIdx]+'时为'+(shiIdx<6?'阳时':'阴时')+'，'+hlTipSpan('时卦')+' '+cur.name+'，元堂在'+hlYaoLabel(cur.bits,cur.pos)+'。</p>';
    }
    s+=hlJd('值日卦示查询当日的气象，日卦元堂即当日气数所聚。时卦再细分到时辰，一卦管六日、每日又分十二时，层层变出，愈细者愈近当下，宜先看日卦定基调，再看所选时辰的卦与爻定缓急。');
    out.innerHTML=s;
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* ---------- 7.5 合参结论 ---------- */
/* 大运、流年、流月三层同参：大运定这一段的大势，流年定这一年，流月定当月。
 * 三层元堂所落位段（初二为根基、三四为人事、五上为成局）定气数是聚是散、是进是收；
 * 宜忌由当月元堂爻位与当月卦气各取一条合成，着力点由当月爻位给出。皆从已排出的卦爻派生 */
function hlYaoTier(pos){
  return pos<=2?{'n':'下段','d':'根基与内里','i':0}
    :pos<=4?{'n':'中段','d':'交接与人事','i':1}
    :{'n':'上段','d':'成局与收束','i':2};
}
/* 卦气：当月卦的上下卦五行各对月令判一次，取较盛的一条为该月卦气 */
function hlQiStateOf(bits,monthZhi){
  const info=hexInfo(bits),zw=(typeof ZHI_WX!=='undefined'&&ZHI_WX)||{};
  const mw=zw[monthZhi]||'土',rank=['旺','相','休','囚','死'];
  const us=HL_wxState(HL_TRIGRAM_WX[info.upper],mw),ls=HL_wxState(HL_TRIGRAM_WX[info.lower],mw);
  return {'up':us,'lo':ls,'best':rank.indexOf(us)<=rank.indexOf(ls)?us:ls};
}
function renderHeCan(){
  const out=document.getElementById('hlHeOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦，再查合参结论。</p>'; return; }
  if(!HL_STATE.yunValid){ out.innerHTML='<p class="sub-note">命卦已排，点查运程看合参结论。</p>'; return; }
  try{
    const q=hlQueryLoc(),Y=q.loc.Y,mSel=q.loc.m;
    const ln=hlLiuNian(h,Y);
    if(!ln) throw new Error('该年在命主大运之外，合参不立');
    const yue=hlLiuYueList(ln.bits,ln.pos)[mSel-1];
    const seg=ln.seg;
    const tS=hlYaoTier(seg.pos),tN=hlYaoTier(ln.pos),tY=hlYaoTier(yue.pos);
    const qs=hlQiStateOf(yue.bits,q.loc.zhi);
    const yj=HL_YAO_YIJI[yue.pos],qy=HL_QI_YIJI[qs.best];

    /* 三层位段同参：同段则气聚，逐层上行则事进，逐层下行则事收，两层同段则先升后平或先降后平，错落则宜择一而专 */
    let tend;
    if(tS.i===tN.i&&tN.i===tY.i) tend='三层元堂同落'+tS.n+'（'+tS.d+'），气数聚在一处，这一年宜集中办成一件事，不宜分散用力。';
    else if(tS.i<tN.i&&tN.i<tY.i) tend='三层元堂自'+tS.n+'向'+tY.n+'逐层上行，事在推进之中，宜顺势加力，把已起的事推到成局。';
    else if(tS.i>tN.i&&tN.i>tY.i) tend='三层元堂自'+tS.n+'向'+tY.n+'逐层回收，事在收束之中，宜知止而退，把成果落到地、为下一局留余地。';
    else if(tS.i<tN.i&&tN.i===tY.i) tend='三层元堂自'+tS.n+'上行至'+tY.n+'，流年与流月同处'+tY.n+'，气数先升后平，宜在'+tY.d+'上稳住，不再加码。';
    else if(tS.i>tN.i&&tN.i===tY.i) tend='三层元堂自'+tS.n+'回落至'+tY.n+'，流年与流月同处'+tY.n+'，气数先降后平，宜在'+tY.d+'上收束，不急于再起。';
    else tend='三层元堂错落（大运'+tS.n+'、流年'+tN.n+'、流月'+tY.n+'），气数分散于'+tY.d+'与'+tS.d+'之间，宜择一事专攻，忌同时铺开多头。';
    /* 元堂重位：流年与大运同爻则本爻当令，流月与流年同爻或应爻则当月即全年气数所聚 */
    let focus='';
    if(ln.pos===seg.pos) focus='流年元堂与大运爻同在'+hlYaoLabel(ln.bits,ln.pos)+'，大运本爻当令，这一年是该段运里最吃劲的一年。';
    else if(yue.pos===ln.pos) focus='流月元堂与流年元堂同在'+hlYaoLabel(yue.bits,yue.pos)+'，当月即全年气数所聚之月。';
    else focus='流月元堂'+hlYaoLabel(yue.bits,yue.pos)+'与流年元堂'+hlYaoLabel(ln.bits,ln.pos)+(HL_ying(yue.pos)===ln.pos?'恰为应爻，内外呼应，当月之事与全年之气互相牵动。':'各居其位，当月在全年之外另起一头，宜当月事当月了。');

    let s='<div class="hl-bazi-line">'+Y+'年'+HL_YUE_NAMES[mSel-1]+'（'+q.loc.zhi+'月）：行'+seg.tag+'卦 '+seg.gua+' '+hlYaoLabel(seg.bits,seg.pos)+'爻运，流年'+ln.name+'，流月'+yue.name+'</div>';
    const rows=[
      [hlTipSpan('大运')+'（'+seg.from+'至'+seg.to+'岁）',seg.gua,hlYaoLabel(seg.bits,seg.pos),HL_YAO_WEI[seg.pos]],
      [hlTipSpan('流年')+'（'+Y+'年）',ln.name,hlYaoLabel(ln.bits,ln.pos),HL_YAO_WEI[ln.pos]],
      [hlTipSpan('流月')+'（'+HL_YUE_NAMES[mSel-1]+'）',yue.name,hlYaoLabel(yue.bits,yue.pos),HL_YAO_WEI[yue.pos]]
    ];
    s+=hlTable(['层','卦','元堂','爻位义'],rows,2);
    s+=hlJd(tend+focus+'底色上，'+(h.hasQiTian||h.hasQiDi?'命卦得'+hlTipSpan('元气')+'，根基受扶、行事有底气；':'命卦未得'+hlTipSpan('元气')+'，根基更多系于自身；')+(h.hasHg?'得'+hlTipSpan('化工')+'，行事合时、易得境遇之助。':'未得'+hlTipSpan('化工')+'，成败更多系于后天经营。'));
    s+='<div class="hl-info wide">'
      +'<div class="hl-i"><span class="k">当月卦气</span><span class="v">'+qs.best+'（上卦'+qs.up+'、下卦'+qs.lo+'，值'+q.loc.zhi+'月）</span></div>'
      +'<div class="hl-i"><span class="k">宜</span><span class="v">'+yj['宜']+'；'+qy['宜']+'。</span></div>'
      +'<div class="hl-i"><span class="k">忌</span><span class="v">'+yj['忌']+'；'+qy['忌']+'。</span></div>'
      +'</div>';
    s+=hlJd('着力点：'+HL_YAO_LI[yue.pos]+'。当月元堂在'+hlYaoLabel(yue.bits,yue.pos)+'，'+HL_YAO_WEI[yue.pos]+'；卦气'+qs.best+'，'+(qs.best==='旺'||qs.best==='相'?'气盛可用，宜把要事排在前头。':'气衰宜守，宜把力气用在养蓄与整理上。'));
    out.innerHTML=s;
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* ---------- 8. AI 上下文与共享状态 ---------- */
function heluoAiContext(){
  const h=HL_STATE.calc;
  if(!h) return '尚未排盘。';
  let s='河洛理数排盘。公历 '+h.y+'年'+h.mo+'月'+h.d+'日'+HL_ZHI_ORDER[h.hourIdx]+'时，'+(h.male?'男命':'女命')
    +(h.hourIdx===0?'，'+(h.ziMode==='late'?'晚子时':'早子时'):'')+'。';
  if(h.usedTrue) s+='太阳时：钟面 '+hlFmtClock(h.clock)+'，校正 '+h.adj+' 分（均时差 '+h.adjE+'、经度差 '+h.adjLng+'），得 '+hlFmtClock(h.trueTime)+'，归'+HL_ZHI_ORDER[h.hourIdx]+'时。';
  if(h.dstApplied&&h.dstNote) s+=h.dstNote;
  s+='四柱：年柱 '+h.gzY+'、月柱 '+h.gzM+'、日柱 '+h.gzD+'、时柱 '+h.gzT+'。';
  s+='天数 '+h.tian+' 化简得 '+h.tianNum+(h.tianNum===5?'，中宫寄'+h.tianGua:'，为'+h.tianGua)+'；地数 '+h.di+' 化简得 '+h.diNum+(h.diNum===5?'，中宫寄'+h.diGua:'，为'+h.diGua)+'。';
  s+='先天本命卦 '+h.xianName+'（'+h.upName+'上'+h.loName+'下）';
  s+='，元堂'+hlYaoLabel(h.xianBits,h.xianYtPos)+'；后天卦 '+h.houName+'，元堂'+hlYaoLabel(h.houBits,h.houYtPos)+'。';
  s+='大运：'+h.dayuns.map(function(d){return d.tag+d.gua+' '+hlYaoLabel(d.bits,d.pos)+' '+d.from+'至'+d.to+'岁';}).join('，')+'。';
  try{
    const q=hlQueryLoc(),Y=q.loc.Y,dv=q.dv,loc=q.loc;
    const ln=hlLiuNian(h,Y);
    if(ln) s+='所查流年 '+Y+'年（'+ln.gz+'）虚岁 '+ln.sui+'，流年卦 '+ln.name+'，元堂'+hlYaoLabel(ln.bits,ln.pos)+'。';
    if(loc){
      const lnn=hlLiuNian(h,loc.Y);
      if(lnn){
        const yue=hlLiuYueList(lnn.bits,lnn.pos)[loc.m-1];
        const ri=hlDayGua(yue.bits,yue.pos,loc.dd);
        s+='所查日 '+dv.y+'年'+dv.mo+'月'+dv.d+'日属'+loc.zhi+'月第 '+loc.dd+' 日，月卦 '+yue.name+'，值日卦 '+ri.name+'，元堂'+hlYaoLabel(ri.bits,ri.pos)+'。';
        s+='三层合参：大运'+lnn.seg.gua+' '+hlYaoLabel(lnn.seg.bits,lnn.seg.pos)+'，流年'+lnn.name+' '+hlYaoLabel(lnn.bits,lnn.pos)+'，流月'+yue.name+' '+hlYaoLabel(yue.bits,yue.pos)
          +'；当月宜 '+HL_YAO_YIJI[yue.pos]['宜']+'，忌 '+HL_YAO_YIJI[yue.pos]['忌']+'，着力在 '+HL_YAO_LI[yue.pos]+'。';
      }
    }
  }catch(e){}
  s+='元气：天元气'+(h.hasQiTian?' '+h.qiTian+'（命中卦得之）':' '+h.qiTian+'（命中卦不得）')+'，地元气'+(h.hasQiDi?' '+h.qiDi+'（命中卦得之）':' '+h.qiDi+'（命中卦不得）')+'；化工'+(h.hgGua?' '+h.hgDesc+'得 '+h.hgGua+(h.hasHg?'（命中卦得之）':'（命中卦不得）'):'未定')+'。';
  return s;
}
function hlCollect(){
  return {'hlDate':document.getElementById('hlDate').value,
    'hlTime':document.getElementById('hlTime').value,
    'hlSex':document.getElementById('hlSex').value,
    'hlZi':document.getElementById('hlZi').value,
    'hlDst':document.getElementById('hlDst').value,
    'hlSun':document.getElementById('hlSun').value,
    'hlTzOff':document.getElementById('hlTzOff').value,
    'hlLocalDst':document.getElementById('hlLocalDst').checked,
    'hlProv':document.getElementById('hlProv').value,
    'hlCity':document.getElementById('hlCity').value,
    'hlDist':document.getElementById('hlDist').value,
    'hlLng':document.getElementById('hlLng').value,
    'hlQDate':document.getElementById('hlQDate').value,
    'hlRiHour':document.getElementById('hlRiHour').value};
}
function hlRestore(d){
  if(!d) return;
  ['hlDate','hlTime','hlSex','hlZi','hlDst','hlSun','hlTzOff','hlLocalDst','hlLng','hlQDate','hlRiHour'].forEach(function(k){
    if(d[k]!=null&&d[k]!==''){
      const el=document.getElementById(k); if(!el) return;
      if(el.type==='checkbox'){ el.checked=!!d[k]; return; }
      /* 下拉框：存档值不在选项内时跳过，保住默认当前年，不出现空选 */
      if(el.tagName==='SELECT'&&!Array.prototype.some.call(el.options,function(o){return o.value===d[k];})) return;
      el.value=d[k];
    }
  });
  if(d.hlProv!=null&&window.hlPlaceTrio) window.hlPlaceTrio.set(d.hlProv,d.hlCity||'',d.hlDist||'');
  renderQigua();
  HL_STATE.yunValid=true;
  renderLiuNian(); renderLiuYue(); renderLiuRiShi(); renderHeCan();
}

/* ---------- 9. 初始化 ---------- */
function hlTodayStr(){
  const t=new Date();
  return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);
}
function hlCurLichunYear(){
  const t=new Date();
  return hlLichunYearNum(Solar.fromYmdHms(t.getFullYear(),t.getMonth()+1,t.getDate(),12,0,0));
}
/* ===== 折叠模块开合与状态持久化 =====
   模块 id 从 DOM 取（.mod[id]），新增模块自动纳入折叠与持久化；hlInitDone 打标前不写回，防覆盖已存偏好 */
var HL_MOD_KEY='hlModState';
var hlInitDone=false;
function _hlAllModIds(){ try{ return Array.from(document.querySelectorAll('.mod[id]')).map(function(e){ return e.id; }); }catch(e){ return []; } }
function toggleMod(id){ var el=document.getElementById(id); if(el) el.classList.toggle('collapsed'); hlSaveModState(); }
function hlSaveModState(){ xjSaveEngineModState(HL_MOD_KEY, function(){ return hlInitDone; }, _hlAllModIds); }
function hlApplyModState(){ xjApplyEngineModState(HL_MOD_KEY, _hlAllModIds); }
/* 页内 details 折叠块展开、收起即保存：toggle 事件不冒泡，用捕获阶段监听 */
try{ document.addEventListener('toggle',function(e){ if(e.target&&e.target.tagName==='DETAILS'&&e.target.id) hlSaveModState(); },true); }catch(e){}

/* 境外出生地界面同步：选到境外城市时挂出时区与当地夏令时、收起中国夏令时并写说明行；
   境内还原。显隐与文案由共享件 syncOverseasFields 一处判。 */
function hlSyncOverseas(){
  syncOverseasFields({prov:'hlProv',city:'hlCity',lng:'hlLng',tz:'hlTzOff',dst:'hlLocalDst',
    tzField:'hlTzOffField',dstField:'hlLocalDstField',note:'hlOverseasNote',chinaDstField:'hlDstField'});
}
/* 境外时区或当地夏令时改动后重排命卦，运程随命卦失效 */
function hlOverseasChange(){
  hlSyncOverseas();
  if(HL_STATE.calc){ renderQigua(); hlClearYun(); }
}

function hlInit(){
  document.getElementById('hlDate').value=hlTodayStr();
  document.getElementById('hlQDate').value=hlTodayStr();
  const tzSel=document.getElementById('hlTzOff');
  if(tzSel&&typeof overseasTzOptions==='function') tzSel.innerHTML=overseasTzOptions();
  if(typeof fillPlaceTrio==='function'){
    window.hlPlaceTrio=fillPlaceTrio(document.getElementById('hlProv'),document.getElementById('hlCity'),document.getElementById('hlDist'),function(){ hlSyncOverseas(); });
  }
  hlSyncOverseas();
  hlClearYun();
  document.getElementById('hlBtn').addEventListener('click',function(){
    renderQigua();
    hlClearYun();
  });
  document.getElementById('hlNianBtn').addEventListener('click',function(){
    if(HL_STATE.calc) HL_STATE.yunValid=true;
    renderLiuNian(); renderLiuYue(); renderLiuRiShi(); renderHeCan();
  });
  if(window.mountAI) window.mountAI(heluoAiContext,'河洛理数',{
    'share':{
      'page':'heluo','title':'河洛理数','result':'#hlQgOut',
      'collect':hlCollect,'restore':hlRestore,
      'recast':function(){ renderQigua(); renderLiuNian(); renderLiuYue(); renderLiuRiShi(); renderHeCan(); }
    }
  });
  const jwHost=document.getElementById('hlJwBody'),jwFold=document.getElementById('hlJwFold');
  if(jwHost&&jwFold&&window.jwRenderInto){
    jwFold.addEventListener('toggle',function(){
      if(this.open&&!jwHost.dataset.done){ window.jwRenderInto(jwHost); jwHost.dataset.done='1'; }
    });
  }
  /* 渲染完成：打标后折叠状态才允许写回，并恢复已存折叠偏好 */
  hlInitDone=true;
  hlApplyModState();
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',hlInit); } else { hlInit(); }

/* 对外导出（供跨脚本与调试取用） */
window.calcHeluo=calcHeluo; window.hlLiuNian=hlLiuNian; window.hlLiuNianChain=hlLiuNianChain;
window.hlLiuNianSeg=hlLiuNianSeg; window.hlLiuYueList=hlLiuYueList; window.hlDayGua=hlDayGua;
window.hlShiGua=hlShiGua; window.hlLocateMonth=hlLocateMonth; window.hlYueBounds=hlYueBounds;
window.hlSimplify=hlSimplify; window.hlYaoLabel=hlYaoLabel; window.HL64_BITS=HL64_BITS;
/* 内联 onclick 走全局作用域：显式挂 window，保证各环境可用 */
window.toggleMod=toggleMod;
