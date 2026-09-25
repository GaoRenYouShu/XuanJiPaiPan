/* ============================================================
 * heluo.js：河洛理数引擎与渲染。
 * 算法口径为多源互校后的通行排法。四柱取 lunar.js
 * 立春界年干支、节气月支；卦名爻位复用 gua.js；卦辞爻辞直读
 * jingwen.js 顶层 GUA_CI、YAO_CI，不另录经文。
 * ============================================================ */

/* ---------- 0. 基础工具 ---------- */
const HL_STATE={'calc':null};
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
/* 爻辞、卦辞读取（jingwen.js 顶层 const，词法共享；未加载时静默为空） */
function hlGci(name){ return (typeof GUA_CI!=='undefined'&&GUA_CI[name])||''; }
function hlYci(name,pos){ return (typeof YAO_CI!=='undefined'&&YAO_CI[name+HL_YAO_POS[pos-1]])||''; }

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
/* 时刻之后（不含当时）最近的一次节气时刻，无则 null */
function hlJieqiNext(name,gy,ms){
  let best=null;
  hlJieqiAll(name,gy).forEach(function(t){ if(t>ms&&best===null) best=t; });
  return best;
}
function hlFmtMs(ms){
  const d=new Date(ms);
  return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
}
/* 立春界公历年号：出生在该年立春前归前一年 */
function hlLichunYearNum(solar){
  const y=solar.getYear(),ms=hlMs(solar);
  const hasLc=hlJieqiAll('立春',y).some(function(t){return t<=ms;});
  return hasLc?y:y-1;
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
/* 时辰下拉值到时支序（0 子 至 11 亥），空为未知 */
function hlHourIdx(v){
  const map={'00:30':0,'02:00':1,'04:00':2,'06:00':3,'08:00':4,'10:00':5,
             '12:00':6,'14:00':7,'16:00':8,'18:00':9,'20:00':10,'22:00':11};
  return map[v]==null?-1:map[v];
}

/* ---------- 2. 核心推算 ---------- */
function calcHeluo(y,mo,d,hourIdx,male){
  const hourKnown=hourIdx>=0;
  /* 出生时刻取该时辰中段（子 01 时、丑 03 时依此类推；未知用正午） */
  const solar=Solar.fromYmdHms(y,mo,d,hourKnown?hourIdx*2+1:12,0,0);
  const lunar=solar.getLunar();
  const gzY=lunar.getYearInGanZhiByLiChun();
  const gzM=lunar.getMonthInGanZhiExact();
  const gzD=lunar.getDayInGanZhi();
  const yearGan=gzY[0],monthZhi=lunar.getMonthZhiExact();
  const yangYear='甲丙戊庚壬'.indexOf(yearGan)>=0;
  const lichunYear=hlLichunYearNum(solar);
  const yuan=HL_sanyuanOf(lichunYear);

  /* 干支取数：四柱 4 干各 1 数、4 支各 2 数；时辰未知按时柱不入取数推 */
  const pillars=[{'tag':'年','gz':gzY},{'tag':'月','gz':gzM},{'tag':'日','gz':gzD}];
  if(hourKnown) pillars.push({'tag':'时','gz':lunar.getTimeInGanZhi()});
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
  if(hourKnown){
    const dongZhiPrev=hlJieqiPrev('冬至',y,birthMs);
    const xiaZhiNext=hlJieqiNext('夏至',y,birthMs);
    const xiaZhiPrev=hlJieqiPrev('夏至',y,birthMs);
    const dongZhiNext=hlJieqiNext('冬至',y,birthMs);
    const afterDong=dongZhiPrev!==null&&dongZhiPrev<=birthMs,beforeXia=xiaZhiNext!==null&&birthMs<xiaZhiNext;
    const afterXia=xiaZhiPrev!==null&&xiaZhiPrev<=birthMs,beforeDong=dongZhiNext!==null&&birthMs<dongZhiNext;
    if(!male&&xianName==='乾为天'&&afterDong&&beforeXia){
      ytRow=HL_YT_REV_FEMALE_QIAN;
      refineNote='女命先天得乾、生于冬至后夏至前，元堂用两至逆表（自上而下逆数）';
    }else if(male&&xianName==='坤为地'&&afterXia&&beforeDong){
      ytRow=HL_YT_REV_MALE_KUN;
      refineNote='男命先天得坤、生于夏至后冬至前，元堂用两至逆表（自上而下逆数）';
    }
  }
  let xianYtPos=0;
  if(hourKnown){
    const pick=hlYtPick(xianBits,ytRow,baseRow,hourIdx);
    xianYtPos=pick.pos;
    if(pick.note) refineNote=refineNote?refineNote+'；'+pick.note:pick.note;
  }

  /* 后天卦：变元堂爻、上下互换；至尊卦（先天坎、屯、蹇，元堂九五、上六）
   * 按生月阴阳从特例表取（阳月为节气月支寅、辰、午、申、戌，余为阴月） */
  const yangMonth='寅辰午申戌'.indexOf(monthZhi)>=0;
  const yueYinYang=yangMonth?'阳':'阴';
  let houName='',houBits=null,zhizunNote='';
  if(hourKnown){
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
  }

  /* 后天卦元堂：同一生时查同一张表（两至逆表条件随先天卦同用） */
  let houYtPos=0;
  if(hourKnown){
    const row=refineNote?((xianName==='乾为天')?HL_YT_REV_FEMALE_QIAN:HL_YT_REV_MALE_KUN):HL_YT_TABLE[hlYangCount(houBits)];
    houYtPos=hlYtPick(houBits,row,HL_YT_TABLE[hlYangCount(houBits)],hourIdx).pos;
  }

  /* 元气自年柱取（干为天元气、支为地元气），反元气为其反卦；
   * 化工自月令节气取（四正段或季月中气前后），反化工随之 */
  const qiTian=HL_YUAN_QI[yearGan],qiDi=HL_YUAN_QI[monthZhi];
  const fanTian=HL_FAN_GUA[qiTian],fanDi=HL_FAN_GUA[qiDi];
  const hasGua=function(g){ return g!=null&&(upName===g||loName===g); };
  let hgGua=null,hgFan=null,hgDesc='';
  const jiZhong=HL_JI_YUE[monthZhi];
  if(jiZhong){
    const zhongMs=hlJieqiPrev(jiZhong,y,birthMs);
    const before=zhongMs===null;
    hgGua=before?'坤':'艮'; hgFan=before?'乾':'兑';
    hgDesc=monthZhi+'月'+jiZhong+(before?'前':'后');
  }else{
    const segs=[
      {'jie':'冬至','next':'春分','gua':'坎','fan':'离'},
      {'jie':'春分','next':'夏至','gua':'震','fan':'巽'},
      {'jie':'夏至','next':'秋分','gua':'离','fan':'坎'},
      {'jie':'秋分','next':'冬至','gua':'兑','fan':'艮'}
    ];
    let hit=null,hitT=-1;
    segs.forEach(function(s){
      const t=hlJieqiPrev(s.jie,y,birthMs);
      if(t!==null&&t>hitT){ hitT=t; hit=s; }
    });
    if(hit){ hgGua=hit.gua; hgFan=hit.fan; hgDesc=hit.jie+'后'+hit.next+'前'; }
  }

  /* 大运：阳爻九年、阴爻六年，虚岁计；先天自元堂起、后天自其元堂续，
   * 各自下而上回环行六爻 */
  const dayuns=[];
  function pushDayun(gname,bits,startPos,tag){
    let pos=startPos;
    let age=dayuns.length?dayuns[dayuns.length-1].to+1:1;
    for(let k=0;k<6;k++){
      const yangG=bits[pos-1]===1,dur=yangG?9:6;
      dayuns.push({'n':dayuns.length+1,'tag':tag,'gua':gname,'bits':bits,'pos':pos,
        'yang':yangG,'from':age,'to':age+dur-1});
      age+=dur; pos=pos%6+1;
    }
  }
  if(hourKnown){
    pushDayun(xianName,xianBits,xianYtPos,'先天');
    pushDayun(houName,houBits,houYtPos,'后天');
  }

  return {'y':y,'mo':mo,'d':d,'hourIdx':hourIdx,'hourKnown':hourKnown,'male':male,
    'gzY':gzY,'gzM':gzM,'gzD':gzD,'gzT':hourKnown?lunar.getTimeInGanZhi():'',
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
/* 流年查询：Y 为立春界公历年 */
function hlLiuNian(h,Y){
  if(!h.hourKnown) return null;
  const sui=Y-h.lichunYear+1;
  const seg=hlFindSeg(h.dayuns,sui);
  if(!seg) return null;
  const i=sui-seg.from+1;
  const gz=hlYearGanZhi(Y);
  const yangYear='甲丙戊庚壬'.indexOf(gz[0])>=0;
  const r=hlLiuNianChain(seg,i,yangYear);
  return {'Y':Y,'sui':sui,'seg':seg,'i':i,'gz':gz,'yangYear':yangYear,
    'bits':r.bits,'name':hexInfo(r.bits).name,'pos':r.pos};
}
/* 大运段全序列（每岁卦名与元堂） */
function hlLiuNianSeg(h,seg){
  const rows=[];
  for(let s=seg.from;s<=seg.to;s++){
    const Y=h.lichunYear+s-1,i=s-seg.from+1;
    const gz=hlYearGanZhi(Y);
    const yangYear='甲丙戊庚壬'.indexOf(gz[0])>=0;
    const r=hlLiuNianChain(seg,i,yangYear);
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
/* 查询时刻所在节气月：返回立春界年 Y、月序、月支、节入后日序 */
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
/* 卦卡：卦题 → 本卦含义 → 卦曰 → 六爻表 → 此爻阶段。
   两句白话由已排出的卦名与爻位派生，读者先见白话、再见经文，时辰未知时元堂不立、该句不出 */
function hlGuaCard(name,bits,pos,title){
  const info=hexInfo(bits),gci=hlGci(name),sense=hlHexSense(name);
  let rows='';
  for(let p=1;p<=6;p++){
    const cur=pos===p;
    rows+='<tr'+(cur?' class="hl-cur"':'')+'><td>'+hlYaoLabel(bits,p)+'</td><td>'
      +hlEsc(hlYci(name,p))+'</td>'+(cur?'<td class="hl-tag">元堂</td>':'<td></td>')+'</tr>';
  }
  return '<div class="hl-gua-card"><h4>'+hlEsc(title||'')+'：'+hlEsc(name)+'（'+info.upper+'上'+info.lower+'下）</h4>'
    +(sense?hlJd('本卦含义：'+sense+'。'):'')
    +(gci?'<p class="hl-gci">卦曰：'+hlEsc(gci)+'</p>':'')
    +'<table class="hl-tbl hl-yao-tbl"><tbody>'+rows+'</tbody></table>'
    +(pos>=1?hlJd('此爻阶段：元堂在'+hlYaoLabel(bits,pos)+'，'+HL_YAO_WEI[pos]+'。'):'')
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

/* 起卦模块 */
function renderQigua(){
  const out=document.getElementById('hlQgOut');
  try{
    const dv=hlParseDate(document.getElementById('hlDate').value);
    const hourIdx=hlHourIdx(document.getElementById('hlHour').value);
    const male=document.getElementById('hlSex').value!=='2';
    const h=calcHeluo(dv.y,dv.mo,dv.d,hourIdx,male);
    HL_STATE.calc=h;
    const yuanName=['上元','中元','下元'][h.yuan];
    let s='<div class="hl-bazi-line">公历 '+h.y+'年'+h.mo+'月'+h.d+'日'+(h.hourKnown?HL_ZHI_ORDER[h.hourIdx]+'时':'（未知时辰）')+'，'+(h.male?'男命':'女命')+'</div>';
    s+=hlJd('此盘宜问一生禀赋与性情底色，以及某段岁月的气数偏向（大运、流年、流月、流日、流时逐层变爻）；不宜问具体事件的成败与应期。河洛理数排出的是气的节律与着力处，不是事件的判决。');
    s+='<p class="sub-note">四柱：年柱 '+h.gzY+'、月柱 '+h.gzM+'、日柱 '+h.gzD+(h.hourKnown?'、时柱 '+h.gzT+'。':'、时柱未知（按时柱不入取数推）。');
    if(h.refineNote) s+=hlEsc(h.refineNote)+'。';
    s+='</p>';
    const rows=h.pillars.map(function(p){
      return [p.tag+'柱 '+p.gz,'干取数 '+p.gn,'支取数 '+p.zn[0]+'、'+p.zn[1]];
    });
    s+=hlTable(['四柱','干取数','支取数'],rows);
    s+='<div class="hl-sum-line">天数（奇数之和）'+h.tian+'，化简得 '+h.tianNum+(h.tianNum===5?'，中宫寄'+h.tianGua:'，为'+h.tianGua)+'；地数（偶数之和）'+h.di+'，化简得 '+h.diNum+(h.diNum===5?'，中宫寄'+h.diGua:'，为'+h.diGua)+'</div>';
    if(h.tianNum===5||h.diNum===5){
      s+='<p class="sub-note">'+h.lichunYear+'年属'+yuanName+'（'+(1864+h.yuan*60)+'至'+(1923+h.yuan*60)+'年）。中宫寄卦：'+yuanName+(h.yuan===1?(h.yangYear===h.male?'阳男阴女':'阴男阳女'):(h.male?'男':'女'))+'寄'+(h.tianNum===5?h.zhongTian:h.zhongDi)+'。</p>';
    }
    s+=hlGuaCard(h.xianName,h.xianBits,h.xianYtPos,'先天本命卦');
    s+='<p class="sub-note">'+(h.tianUp?'天数卦为上卦、地数卦为下卦':'地数卦为上卦、天数卦为下卦')+'（'+(h.yangYear?'阳年':'阴年')+(h.male?'男':'女')+'命）。'+(h.hourKnown?'元堂在'+hlYaoLabel(h.xianBits,h.xianYtPos)+'（第'+h.xianYtPos+'爻）。':'时辰未知，元堂不立。')+'</p>';
    s+=hlJd('先天本命卦是全盘的根基，示禀赋与一生气象的底色。上卦'+h.upName+'（'+HL_TRIGRAM_SENSE[h.upName]+'），下卦'+h.loName+'（'+HL_TRIGRAM_SENSE[h.loName]+'），两卦相叠成'+h.xianName+'。'+(h.hourKnown?'元堂一爻是气数聚焦之处，其后大运流年皆由此爻推出。':'时辰未知则元堂不立，仅见命卦大体，补全生时即可细断。'));
    if(h.hourKnown){
      if(h.zhizunNote) s+='<p class="sub-note hl-zz">'+hlEsc(h.zhizunNote)+'。</p>';
      s+=hlGuaCard(h.houName,h.houBits,h.houYtPos,'后天卦');
      s+='<p class="sub-note">'+(h.zhizunNote?'（本命系至尊卦，从特例）':'')+'元堂以同一生时重查，在'+hlYaoLabel(h.houBits,h.houYtPos)+'。</p>';
      s+=hlJd('后天卦示先天禀赋落入现实之后的走向：变元堂一爻、上下两卦互换，喻境遇既易、气质随之而转，其元堂与先天同以生时重查。');
    }
    s+='<h4 class="det-h">元气与化工</h4>';
    s+='<p class="sub-note">元气自年柱取：天元气（年干'+h.gzY[0]+'）得 '+h.qiTian+'，命中卦'+(h.hasQiTian?'得之，为有元气':'不得')+'；地元气（年支'+h.gzY[1]+'）得 '+h.qiDi+'，命中卦'+(h.hasQiDi?'得之，为有元气':'不得')+'。反元气为 '+h.fanTian+'（天）、'+h.fanDi+'（地），命中卦'+((h.hasFanTian||h.hasFanDi)?'得之':'不得')+'。</p>';
    if(h.hgGua){
      s+='<p class="sub-note">化工自月令取：生在'+hlEsc(h.hgDesc)+'，化工为 '+h.hgGua+'，命中卦'+(h.hasHg?'得之，为有化工':'不得')+'；反化工为 '+h.hgFan+'，命中卦'+(h.hasHgFan?'得之':'不得')+'。</p>';
    }
    s+=hlJd('元气取自年柱干支所化之卦，'+(h.hasQiTian||h.hasQiDi?'命中卦得之者，根基受扶、禀气厚实，行事多底气。':'命中卦不得，非不美，仅示先天助力较薄，根基更多系于自身。')+'化工取自出生月令之气，'+(h.hasHg?'命中卦得之者，行事合时、易得境遇之助。':'命中卦不得，示与生月之气联系较疏，成败更多系于后天经营。')+'反元气、反化工为消散之气，命中得之宜防虚耗。得与不得只述气数厚薄，不定吉凶。');
    out.innerHTML=s;
    renderDayun();
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* 大运模块 */
function renderDayun(){
  const out=document.getElementById('hlDyOut');
  const h=HL_STATE.calc;
  if(!h){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦。</p>'; return; }
  if(!h.hourKnown){ out.innerHTML='<p class="sub-note">时辰未知，大运不立。</p>'; return; }
  const rows=h.dayuns.map(function(d){
    return [d.tag,d.from+' 至 '+d.to+'（共'+(d.to-d.from+1)+'年）',d.gua,hlYaoLabel(d.bits,d.pos),d.yang?'阳爻九年':'阴爻六年'];
  });
  const curSui=hlCurLichunYear()-h.lichunYear+1;
  const curSeg=hlFindSeg(h.dayuns,curSui);
  const curIdx=curSeg?h.dayuns.indexOf(curSeg):-1;
  out.innerHTML=hlTable(['段','虚岁','卦','起爻','行度'],rows,curIdx)
    +hlJd('阳爻一运管九年、阴爻一运管六年，阳运行度舒缓、阴运行度紧凑，故各段长短不同。先天段循本命卦展开，多关禀赋根基；后天段循后天卦展开，多关转向之后的发展。段内行至哪一爻，便以该爻的爻位义看这段运的着力处。'
      +(curSeg?'按今年推，当前虚岁 '+curSui+'，行'+curSeg.tag+'卦 '+curSeg.gua+' '+hlYaoLabel(curSeg.bits,curSeg.pos)+'爻运（'+curSeg.from+'至'+curSeg.to+'岁），'+HL_YAO_WEI[curSeg.pos]+'。':''));
}

/* 统一查询日期：一个日期框驱动流年、流月、流日、流时四层，年份取立春界 */
function hlQueryLoc(){
  const dv=hlParseDate(document.getElementById('hlQDate').value);
  const loc=hlLocateMonth(new Date(dv.y,dv.mo-1,dv.d).getTime());
  if(!loc) throw new Error('未能定位该日所属节气月');
  return {'dv':dv,'loc':loc};
}

/* 流年模块 */
function renderLiuNian(){
  const out=document.getElementById('hlNianOut');
  const h=HL_STATE.calc;
  if(!h||!h.hourKnown){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦并给出生时。</p>'; return; }
  try{
    const Y=hlQueryLoc().loc.Y;
    const ln=hlLiuNian(h,Y);
    if(!ln){
      const last=h.dayuns[h.dayuns.length-1].to;
      throw new Error('该年在命主大运之外（大运起于 1 岁、止于 '+last+' 岁）');
    }
    let s='<div class="hl-bazi-line">'+Y+'年（'+ln.gz+'，'+(ln.yangYear?'阳年':'阴年')+'），虚岁 '+ln.sui+'，行'+ln.seg.tag+'卦 '+ln.seg.gua+' '+hlYaoLabel(ln.seg.bits,ln.seg.pos)+'爻运，段内第 '+ln.i+' 岁</div>';
    s+=hlGuaCard(ln.name,ln.bits,ln.pos,'流年卦');
    s+='<p class="sub-note">当年新变之爻即流年卦元堂，在'+hlYaoLabel(ln.bits,ln.pos)+'。</p>';
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
  if(!h||!h.hourKnown){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦并给出生时。</p>'; return; }
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
      +hlJd('一年十二个月的卦都从流年卦逐爻变出：单月自元堂上一位起挨次上行，双月取对应单月元堂的应爻，月月不同。看某月运势，即以该月卦与其元堂爻位参详，元堂所在即当月气数焦点。'
        +(function(){ const nowLoc=hlLocateMonth(Date.now()); if(nowLoc&&nowLoc.Y===Y){ const cm=months[nowLoc.m-1]; return '按节气，当前正值'+HL_YUE_NAMES[nowLoc.m-1]+'（'+nowLoc.zhi+'月），月卦 '+cm.name+'，元堂'+hlYaoLabel(cm.bits,cm.pos)+'。'; } return ''; })());
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* 流日流时模块 */
function renderLiuRiShi(){
  const out=document.getElementById('hlRiOut');
  const h=HL_STATE.calc;
  if(!h||!h.hourKnown){ out.innerHTML='<p class="sub-note">先在起卦模块排出命卦并给出生时。</p>'; return; }
  try{
    const q=hlQueryLoc(),dv=q.dv,loc=q.loc;
    const ln=hlLiuNian(h,loc.Y);
    if(!ln) throw new Error('该日所属流年在命主大运之外');
    const yue=hlLiuYueList(ln.bits,ln.pos)[loc.m-1];
    const ri=hlDayGua(yue.bits,yue.pos,loc.dd);
    let s='<div class="hl-bazi-line">'+loc.Y+'年流年卦 '+ln.name+'；'+HL_YUE_NAMES[loc.m-1]+'（'+loc.zhi+'月）月卦 '+yue.name+'，元堂'+hlYaoLabel(yue.bits,yue.pos)+'；查询日为节入后第 '+loc.dd+' 日</div>';
    s+=hlGuaCard(ri.name,ri.bits,ri.pos,'值日卦');
    s+='<p class="sub-note">新变之爻即日卦元堂，在'+hlYaoLabel(ri.bits,ri.pos)+'。</p>';
    const near=[],curIdx={i:0};
    for(let k=-3;k<=3;k++){
      const dd=loc.dd+k;
      if(dd<1) continue;
      const g=hlDayGua(yue.bits,yue.pos,dd);
      if(k===0) curIdx.i=near.length;
      near.push(['第 '+dd+' 日',g.name,hlYaoLabel(g.bits,g.pos)]);
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
      s+='<p class="sub-note">'+HL_ZHI_ORDER[shiIdx]+'时为'+(shiIdx<6?'阳时':'阴时')+'，时卦 '+cur.name+'，元堂在'+hlYaoLabel(cur.bits,cur.pos)+'。</p>';
    }
    s+=hlJd('值日卦示查询当日的气象，日卦元堂即当日气数所聚。时卦再细分到时辰，一卦管六日、每日又分十二时，层层变出，愈细者愈近当下，宜先看日卦定基调，再看所选时辰的卦与爻定缓急。');
    out.innerHTML=s;
  }catch(e){
    out.innerHTML='<p class="hl-err">'+hlEsc(e.message)+'</p>';
  }
}

/* ---------- 8. AI 上下文与共享状态 ---------- */
function heluoAiContext(){
  const h=HL_STATE.calc;
  if(!h) return '尚未排盘。';
  let s='河洛理数排盘。公历 '+h.y+'年'+h.mo+'月'+h.d+'日'+(h.hourKnown?HL_ZHI_ORDER[h.hourIdx]+'时':'（未知时辰）')+'，'+(h.male?'男命':'女命')+'。';
  s+='四柱：年柱 '+h.gzY+'、月柱 '+h.gzM+'、日柱 '+h.gzD+(h.hourKnown?'、时柱 '+h.gzT+'。':'（时柱未知，按时柱不入取数推）。');
  s+='天数 '+h.tian+' 化简得 '+h.tianNum+(h.tianNum===5?'，中宫寄'+h.tianGua:'，为'+h.tianGua)+'；地数 '+h.di+' 化简得 '+h.diNum+(h.diNum===5?'，中宫寄'+h.diGua:'，为'+h.diGua)+'。';
  s+='先天本命卦 '+h.xianName+'（'+h.upName+'上'+h.loName+'下）';
  if(h.hourKnown){
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
        }
      }
    }catch(e){}
  }else{
    s+='；时辰未知，元堂、后天卦、大运与流年不立。';
  }
  s+='元气：天元气'+(h.hasQiTian?' '+h.qiTian+'（命中卦得之）':' '+h.qiTian+'（命中卦不得）')+'，地元气'+(h.hasQiDi?' '+h.qiDi+'（命中卦得之）':' '+h.qiDi+'（命中卦不得）')+'；化工'+(h.hgGua?' '+h.hgDesc+'得 '+h.hgGua+(h.hasHg?'（命中卦得之）':'（命中卦不得）'):'未定')+'。';
  return s;
}
function hlCollect(){
  return {'hlDate':document.getElementById('hlDate').value,
    'hlHour':document.getElementById('hlHour').value,
    'hlSex':document.getElementById('hlSex').value,
    'hlQDate':document.getElementById('hlQDate').value,
    'hlRiHour':document.getElementById('hlRiHour').value};
}
function hlRestore(d){
  if(!d) return;
  ['hlDate','hlHour','hlSex','hlQDate','hlRiHour'].forEach(function(k){
    if(d[k]!=null&&d[k]!==''){
      const el=document.getElementById(k); if(!el) return;
      /* 下拉框：存档值不在选项内时跳过，保住默认当前年，不出现空选 */
      if(el.tagName==='SELECT'&&!Array.prototype.some.call(el.options,function(o){return o.value===d[k];})) return;
      el.value=d[k];
    }
  });
  renderQigua(); renderLiuNian(); renderLiuYue(); renderLiuRiShi();
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
function hlReadModState(){
  try{
    var raw=null;
    try{ raw=localStorage.getItem(HL_MOD_KEY); }catch(e){}
    if(!raw){ try{ raw=sessionStorage.getItem(HL_MOD_KEY); }catch(e){} }  /* localStorage 不可用（隐私模式）时回退 sessionStorage */
    var o=raw?JSON.parse(raw):null;
    return (o&&typeof o==='object')?o:{};
  }catch(e){ return {}; }
}
function toggleMod(id){ var el=document.getElementById(id); if(el) el.classList.toggle('collapsed'); hlSaveModState(); }
function hlSaveModState(){
  if(!hlInitDone) return;
  try{
    /* 以已存为底、只覆盖此刻在场的件：恢复折叠态本身会触发 toggle 回调本函数，不在场的件若整份重写就会被抹掉 */
    var o=hlReadModState();
    _hlAllModIds().forEach(function(id){ var e=document.getElementById(id); if(e) o[id]=e.classList.contains('collapsed'); });
    /* 页内 details 折叠块（经文检索等）的 open 状态一并持久化 */
    try{
      var zr=(o._zr&&typeof o._zr==='object')?o._zr:{};
      document.querySelectorAll('details[id]').forEach(function(d){ zr[d.id]=d.open; });
      if(Object.keys(zr).length) o._zr=zr;
    }catch(e){}
    var v=JSON.stringify(o);
    try{ localStorage.setItem(HL_MOD_KEY,v); }catch(e){}   /* 普通模式持久化 */
    try{ sessionStorage.setItem(HL_MOD_KEY,v); }catch(e){} /* 隐私/无痕模式兜底：同一会话刷新保留 */
  }catch(e){}
}
function hlApplyModState(){
  var o=hlReadModState();
  try{
    _hlAllModIds().forEach(function(id){
      var e=document.getElementById(id); if(!e) return;
      if(o[id]===true) e.classList.add('collapsed');
      else if(o[id]===false) e.classList.remove('collapsed');
    });
    /* 恢复内部折叠块 open 状态（须在模块展开后执行，DOM 已就绪） */
    if(o._zr&&typeof o._zr==='object'){
      Object.keys(o._zr).forEach(function(id){ var d=document.getElementById(id); if(d&&d.tagName==='DETAILS') d.open=(o._zr[id]===true); });
    }
  }catch(e){}
}
/* 页内 details 折叠块展开/收起即保存：toggle 事件不冒泡，用捕获阶段监听 */
try{ document.addEventListener('toggle',function(e){ if(e.target&&e.target.tagName==='DETAILS'&&e.target.id) hlSaveModState(); },true); }catch(e){}

function hlInit(){
  document.getElementById('hlDate').value=hlTodayStr();
  document.getElementById('hlQDate').value=hlTodayStr();
  renderQigua(); renderLiuNian(); renderLiuYue(); renderLiuRiShi();
  document.getElementById('hlBtn').addEventListener('click',function(){
    renderQigua(); renderLiuNian(); renderLiuYue(); renderLiuRiShi();
  });
  document.getElementById('hlNianBtn').addEventListener('click',function(){
    renderLiuNian(); renderLiuYue(); renderLiuRiShi();
  });
  if(window.mountAI) window.mountAI(heluoAiContext,'河洛理数');
  if(window.shareWait) window.shareWait({
    'page':'heluo','title':'河洛理数',
    'collect':hlCollect,'restore':hlRestore,
    'recast':function(){ renderQigua(); renderLiuNian(); renderLiuYue(); renderLiuRiShi(); }
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
