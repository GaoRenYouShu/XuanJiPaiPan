/* ============================================================
 * xuanji-lib.js 玄机排盘站点级共享支撑库（跨模块共享工具与常量）
 *   内容：地支六冲判定、五行干支纳音上色引擎、梅花易数先天数、
 *         湿燥土判定、公历闰年月长、真太阳时校正、十二支方位。
 * 加载顺序：须在 app.js（框架级五行、干支常量所在）之后，
 *           与 bazi-data.js（引擎）、gua.js（卦）同页加载。
 * ============================================================ */

/* ============================================================
 * 【站点级共享常量：地支六冲 DIZHI_CHONG、pairChong】
 *   全站唯一权威定义。pairChong(a,b)：判断两地支是否相冲，返回布尔。
 */
const DIZHI_CHONG = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
function pairChong(a,b){ return DIZHI_CHONG.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)); }

/* ============================================================
 * 【合婚六档判名与阈值】hehun 与 ziwei 两页共用；等级名与阈值只此一处。
 */
const XJ_HH_LV_NAMES=['冲克偏重、下等之配','磨合偏重、中下之配','需要磨合、中等之配','和中有益、中上之配','良缘相济、上等之配','天作之合、上上之配'];
function xjHhLvIndex(c){ return c>=86?5:(c>=75?4:(c>=68?3:(c>=56?2:(c>=45?1:0)))); }

/* ============================================================
 * 【上色引擎】五行、干支、纳音统一上色（站点级唯一入口）
 *   全站所有命理 HTML 注入处（八字主页、日历页、各术数页详情面板、弹窗）
 *   统一调用本段函数上色，着色规则如下。
 *   唯一对外入口：gzAllColorSpan(str)，对整段 HTML 文本逐字上色。
 *   上色原语：wxOfChar、wxSpan、wxColorSpan、gzColorSpan、
 *              nayinWx、nayinColorSpan，供需要“局部、单字”着色的调用点复用。
 *   颜色表 WX_CLASS 与干支五行表 GAN_WX、ZHI_WX 仍定义于 app.js
 *     （框架级常量，全站共享），本段直接引用其全局绑定。
 *   gzAllColorSpan 对纳音（NAYIN_INFO，来自 bazi-data.js）整体着色，
 *     并对 WX_WORD_DENY 封闭专有名词表豁免，从根本上避免误染与纳音被切断。
 *   规则要点：① 不触碰 <...> 标签与属性；② 已有 wx- span 不二次包裹；
 *           ③ 禁用词内部不上色；④ 纳音名以纯文本出现时整串同色。
 * ============================================================ */

/* 任意干支、五行字符 → 其五行名（木火土金水）。全站上色【唯一解析入口】 */
function wxOfChar(ch){
  return GAN_WX[ch] || ZHI_WX[ch] || (WX_CLASS[ch] ? ch : '');
}
function wxSpan(ch){
  const cls = WX_CLASS[wxOfChar(ch)]||'';
  return `<span class="${cls}">${ch}</span>`;
}
/* 给五行字（木、火、土、金、水）上对应五行色 */
function wxColorSpan(w){
  const cls = WX_CLASS[w]||'';
  return `<span class="${cls}">${w}</span>`;
}
/* 给一段干支字符串里的天干、地支按五行上色（年月日等汉字不上色） */
function gzColorSpan(str){
  return (str||'').replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g, ch=>{
    const cls = WX_CLASS[wxOfChar(ch)]||'';
    return cls?`<span class="${cls}">${ch}</span>`:ch;
  });
}
/* 纳音按五行上色：纳音末字即其五行（金木水火土） */
function nayinWx(ny){
  const last = (ny||'').slice(-1);
  return ({'木':'木','火':'火','土':'土','金':'金','水':'水'})[last]||'';
}
function nayinColorSpan(ny){
  const wx = nayinWx(ny);
  const cls = WX_CLASS[wx]||'';
  return cls?`<span class="${cls}">${ny}</span>`:ny;
}
const WX_WORD_DENY = [
  // 干支落进普通词：只列词、绝不单列单字，避免误杀命理孤干支
  '子女','子息','子孙','儿子','父子','子弟','子夜','子嗣','子民','子弹','子房','子句',
  '中午','午后','午夜','午休','午饭',
  '未来','未必','未知','未婚','未免','未尝','未曾','未央','未明显','未见','未及','未足','未能','未敢',
  '申请','申诉','申明','申冤','申城','申遗',
  '丑陋','丑闻','丑角','丑态',
  '星辰','辰星','时辰','生辰','辰光','北辰',
  '寅吃卯粮',
  '丁克','丁点','人丁','丁忧',
  '自己','己见','己任',
  '辛苦','辛勤','辛酸','辛劳',
  '戊戌变法','庚子赔款','庚子事变',
  '甲方','甲鱼','甲壳','甲板',
  '乙方',
  '丙烷','丙方',
  // 五行落进普通词
  '木讷','木马','木船','木然','木屋','木头','木床','麻木','草木','树木','木槿','木棉','木雕','木偶','果木','花木','木柴','木板',
  '火气','火山','火苗','火炉','火光','火把','火红','火舌','火海','火灾','火速','火候','火箭','火腿','火鸡','火夫',
  '土地','土气','土石','土路','土堆','土匪','土建','土壤','土产','土豪','土葬','土族','土块',
  '金融','金子','金库','金口','金牛','金毛','金石','金钱','金属','金星','金条','金戒','金矿','金店','金婚','金发','金领','金庸','金曲','金疮',
  '水平','水手','水货','水灾','水边','水田','水洼','水晶','水分','水果','水乡','水车','水草','水兵','水波','水彩','水池','水稻','水粉','水垢','水藻','水泽','水钻','水袖',
  // 自然语义词补（用户点名与扫描补充）
  '风水','亲子','子曰','子虚','子公司','子房',
  '金秋','金贵','金玉','金光','金鱼','金牌',
  '水星','火花',
  '土豆','土星','土黄','土话','土着','土城','土丘','土坡','土墙','土屋','土山','土司','土质','土造',
  '木匠','木本','木材','木刻','木炭','木箱','木叶','木鱼','木瓜','木兰','木星','木薯',
  '奖金','礼金','白金','木质','露水',
  // 神煞名：含五行、地支字的固定有限集合，整体豁免上色；覆盖 span 与纯文本两条渲染路径
  //   说明：神煞名里真正含干支、五行字的只有这 6 个（其余如“羊刃”的“羊”是生肖非地支，不会误染）；
  //   其余神煞名不含干支、五行字，本就不会被上色，无需列入。
  '金舆','孤辰','元辰','金神','金匮','天乙贵人',
  // 历法、天文、命理学派名：含五行、地支字的固定有限集合，整体豁免上色
  // 节气：二十四节气（仅“雨水”含“水”，但全部列入以防万一；其余不含干支、五行字，列入无害）
  '立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑',
  '立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒',
  // 星座：十二星座名（仅“金牛”含“金”、“水瓶”含“水”，但全部列入以防万一）
  '白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼',
  // 二十八宿（值日星宿全名，第 2 字恒为 木金土火水日月 之一，除日月外皆会被误染 → 全列豁免）
  '角木蛟','亢金龙','氐土貉','房日兔','心月狐','尾火虎','箕水豹','斗木獬','牛金牛','女土蝠',
  '虚日鼠','危月燕','室火猪','壁水㺄','奎木狼','娄金狗','胃土雉','昴日鸡','毕月乌','觜火猴',
  '参水猿','井木犴','鬼金羊','柳土獐','星日马','张月鹿','翼火蛇','轸水蚓',
  // 七政四余与行星（西洋星曜名，含五行字者列入；太阳、月亮不含，无需）
  '火星','金星','木星','水星','土星',
  // 命理学派与古籍：含“子”的“子平”系列，非干支用法，整体豁免
  '子平','子平格局派','子平真诠','渊海子平','邵子神数'
];
function gzAllColorSpan(str){
  if(!str) return str;
  const SET='甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥'.split('');
  const ZHISET='子丑寅卯辰巳午未申酉戌亥'.split('');
  const WXSET='木火土金水'.split('');
  const isGZ=c=>SET.indexOf(c)>=0;
  const isZHI=c=>ZHISET.indexOf(c)>=0;
  const isWX=c=>WXSET.indexOf(c)>=0;
  const isEl=c=>isGZ(c)||isWX(c);
  const chars=[...(''+str)];
  const n=chars.length;
  const inTag=new Array(n).fill(false);
  const srcWx=new Array(n).fill(0);   // 源码里已有的 wx-* 着色 span 深度（仅用于“防二次包裹”）
  const skip=new Array(n).fill(false); // 禁用词、命理专属名词（wx-skip）内部，不染色
  let tag=false, depth=0, skipDepth=0;
  for(let i=0;i<n;i++){
    const c=chars[i];
    if(c==='<'){
      tag=true;
      const rest=chars.slice(i,i+30).join('');
      // 命理专属名词（神煞名、卦名等）已用 class="...wx-skip" 标记，其内部字形绝不染色
      if(/^<span class="[^"]*wx-skip/.test(rest)) skipDepth++;
      else if(/^<span class="[^"]*wx-/.test(rest)) depth++;   // 任意含 wx- 的 span（含 "tip wx-shui" 这类前缀）均视为已着色，防二次包裹
      else if(/^<\/span>/.test(rest)){ if(depth>0) depth--; if(skipDepth>0) skipDepth--; }
    }
    inTag[i]=tag;
    srcWx[i]=depth;
    if(!tag) skip[i]=(skipDepth>0);   // 文本字符位于 wx-skip 名词内部 → 标记不染色
    if(c==='>') tag=false;
  }
  // 0.5) 纳音整体着色预处理：已知纳音名（有限集合，来自全局 NAYIN_INFO）若以纯文本出现，
  //      整串按其五行包一层 wx span，避免被逐字上色切断（如“天河水”整串同色，而非只染尾字“水”）。
  //      仅作用于“标签外、且源码未着色”的字符：已用 nayinColorSpan 包好的（srcWx>0）不重复包裹；
  //      位于标签内的（如 showTip 属性里的纳音名）绝不触碰，避免破坏 HTML 结构。
  //     由此从算法层面消除“纳音五行上色被逐字上色切断”的冲突。
  const nayinStart={};
  if(typeof NAYIN_INFO!=='undefined' && NAYIN_INFO){
    const keys=Object.keys(NAYIN_INFO);
    if(keys.length){
      const starts=new Set(keys.map(k=>k[0]));
      const byLen=keys.slice().sort((a,b)=>b.length-a.length);
      for(let i=0;i<n;i++){
        if(inTag[i]||srcWx[i]>0||!starts.has(chars[i])) continue;
        for(const k of byLen){
          if(str.slice(i,i+k.length)===k){
            let ok=true;
            for(let t=i;t<i+k.length;t++){ if(inTag[t]||srcWx[t]>0){ ok=false; break; } }
            if(ok){ nayinStart[i]={end:i+k.length, wx:wxOfChar(k.slice(-1))}; i=i+k.length-1; }
            break;
          }
        }
      }
    }
  }
  // 1) 标记禁用词内部的五行、干支位置（这些不染色）
  for(const w of WX_WORD_DENY){
    if(!w) continue;
    let p=str.indexOf(w);
    while(p>=0){
      let bad=false;
      for(let k=0;k<w.length;k++){ if(inTag[p+k]){ bad=true; break; } }
      if(!bad){ for(let k=0;k<w.length;k++){ if(isEl(chars[p+k])) skip[p+k]=true; } }
      p=str.indexOf(w, p+1);
    }
  }
  // 2) 上色：每个五行、干支字符，只要不在标签内、不是源码已着色的 span 内、不在禁用词内，就上色。
  //    注意：本函数自身新开的 <span> 不会抑制后续字符（用源码深度 srcWx 判定，而非运行中的开合），
  //    否则“甲木”“丁（火）”这类相邻字会被误判为“已在 span 内”而漏染。
  let out='';
  for(let i=0;i<n;i++){
    const ch=chars[i];
    if(inTag[i]){ out+=ch; continue; }            // 标签、属性原样保留
    if(srcWx[i]>0){ out+=ch; continue; }          // 源码已着色（如表格 wxSpan），不二次包裹
    if(nayinStart[i]){                            // 纳音名：整串按其五行上色（不逐字切断）
      const ns=nayinStart[i]; const cls=WX_CLASS[ns.wx]||'';
      out+= cls?`<span class="${cls}">${str.slice(i,ns.end)}</span>`:str.slice(i,ns.end);
      i=ns.end-1; continue;
    }
    if(skip[i]){ out+=ch; continue; }             // 禁用词内的字，不上色
    if(isEl(ch)){
      const cls=WX_CLASS[wxOfChar(ch)]||'';
      if(cls){
        // 地支稳健防误染：仅当相邻（前后任一文本字）为干支、五行、月令时辰字（月日时年运柱）时才上色，
        // 否则视为普通汉字（如“未明显”的“未”、“子女”的“子”、“申城”的“申”）不上色。
        // 天干与五行不受此限，以保留“金多木折”“甲木”等真实上色。
        if(isZHI(ch)){
          const zAllow=c=>isGZ(c)||isWX(c)||'月日时年运柱'.indexOf(c)>=0;
          const prev=i>0?chars[i-1]:''; const next=i<n-1?chars[i+1]:'';
          const prevOk=prev&&!inTag[i-1]&&!skip[i-1]&&zAllow(prev);
          const nextOk=next&&!inTag[i+1]&&!skip[i+1]&&zAllow(next);
          if(!(prevOk||nextOk)){ out+=ch; continue; }
        }
        out+=`<span class="${cls}">${ch}</span>`;
      } else out+=ch;
    } else {
      out+=ch;
    }
  }
  return out;
}

/* 跨脚本导出：经典脚本顶层 function、const 已全局可见，此处显式挂 window 便于按 window.xxx 调用 */
window.wxOfChar = wxOfChar;
window.wxSpan = wxSpan;
window.wxColorSpan = wxColorSpan;
window.gzColorSpan = gzColorSpan;
window.nayinWx = nayinWx;
window.nayinColorSpan = nayinColorSpan;
window.WX_WORD_DENY = WX_WORD_DENY;
window.gzAllColorSpan = gzAllColorSpan;

/* ============ 梅花易数先天数（终身卦、流年卦起数用） ============ */
const GAN_NUM={'甲':1,'乙':2,'丙':3,'丁':4,'戊':5,'己':6,'庚':7,'辛':8,'壬':9,'癸':10};
const ZHI_NUM={'子':1,'丑':2,'寅':3,'卯':4,'辰':5,'巳':6,'午':7,'未':8,'申':9,'酉':10,'戌':11,'亥':12};

/* ---------- 公历闰年、月长（proleptic Gregorian 规则；兼容公元 1 年起，避免 new Date 把两位数年误映射到 1900-1999） ---------- */
function isLeapYear(yy){ return (yy%4===0 && yy%100!==0) || (yy%400===0); }
function daysOfMonth(yy, mo){
  if(mo===2) return isLeapYear(yy) ? 29 : 28;
  return [31,28,31,30,31,30,31,31,30,31,30,31][mo-1];
}

/* ---------- 真太阳时校正（本地天文算法）----------
   真太阳时 = 当地标准时 + 均时差(EoT) + (当地经度 - 基准子午线)×4 分
   基准子午线缺省东经 120 度（东八区）；境外出生者由调用方按当地时区传 15° 乘偏移
   （如西五区传 -75），境内一律走缺省。
   均时差取 Meeus 天文算法式 28.3（黄赤交角、轨道偏心率与太阳平黄经入算，精度约数秒），
   儒略日按 proleptic Gregorian 直算；不使用原生 new Date，
   避免公元 1 至 99 年被浏览器映射为 1900 至 1999 年。 */
function _jdFromYmd(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
function eqOfTimeMin(y,m,d){
  const RAD=Math.PI/180;
  const T=(_jdFromYmd(y,m,d)-2451545)/36525;
  const L0=(280.46646+36000.76983*T+0.0003032*T*T)%360;
  const M=(357.52911+35999.05029*T-0.0001537*T*T)%360;
  const e=0.016708634-0.000042037*T-0.0000001267*T*T;
  const eps=(23.43929111-0.0130042*T-0.00000016*T*T+0.00000044*T*T*T)*RAD;
  const y2=Math.tan(eps/2)*Math.tan(eps/2);
  const E=y2*Math.sin(2*L0*RAD)-2*e*Math.sin(M*RAD)
        +4*e*y2*Math.sin(M*RAD)*Math.cos(2*L0*RAD)
        -0.5*y2*y2*Math.sin(4*L0*RAD)-1.25*e*e*Math.sin(2*M*RAD);
  return E/RAD*4;
}
function trueSolarTime(y,m,d,h,mi,lng,mode,baseLng){
  // 口径 mode：'true' 真太阳时（均时差＋经度差，默认）；'mean' 平太阳时（仅经度差，均时差取 0）
  // baseLng：校正基准子午线，缺省东经 120 度；境外出生按当地时区传 15° 乘偏移
  mode = mode || 'true';
  const base = (baseLng==null || isNaN(baseLng)) ? 120 : Number(baseLng);
  const E = mode==='mean' ? 0 : eqOfTimeMin(y,m,d);
  const lngAdj = (lng - base) * 4;
  const totalAdj = E + lngAdj;
  // 用分钟偏移校正，避免 Date；最大偏移约正负 120 分钟，跨日由 Solar.nextDay 处理
  let baseMinutes = h*60 + mi;
  let corrMinutes = baseMinutes + totalAdj;
  let dayOffset = 0;
  while(corrMinutes >= 1440){ corrMinutes -= 1440; dayOffset++; }
  while(corrMinutes < 0){ corrMinutes += 1440; dayOffset--; }
  let corrH = Math.floor(corrMinutes/60);
  let corrMi = Math.round(corrMinutes - corrH*60);
  if(corrMi >= 60){ corrMi -= 60; corrH++; }
  if(corrH >= 24){ corrH -= 24; dayOffset++; }
  let solar = Solar.fromYmd(y,m,d);
  if(dayOffset !== 0) solar = solar.nextDay(dayOffset);
  return {
    y: solar.getYear(), m: solar.getMonth(), d: solar.getDay(),
    h: corrH, mi: corrMi,
    E: Math.round(E*100)/100, lngAdj: Math.round(lngAdj*100)/100,
    totalAdj: Math.round(totalAdj*100)/100,
    mode: mode
  };
}

/* ---------- 中国夏令时段钟面折算（1986 年至 1991 年全国实行夏令时）----------
   夏令时段内钟面时间较标准时快一小时，排盘前须折回，否则时柱乃至日柱错一位。
   起讫为各年官方公布的夏令起讫日（钟面 02:00 起拨快、02:00 讫拨回）：
   1986 年 5 月 4 日至 9 月 14 日；1987 年 4 月 12 日至 9 月 13 日；1988 年 4 月 10 日至 9 月 11 日；
   1989 年 4 月 16 日至 9 月 17 日；1990 年 4 月 15 日至 9 月 16 日；1991 年 4 月 14 日至 9 月 15 日。
   讫日 01:00 至 02:00 的钟面当年两见（夏令读数与标准读数各一次），自动折算取夏令读数并标歧义，供人工改选。 */
const CN_DST_SPANS = [
  {y:1986, sm:5,  sd:4,  em:9,  ed:14},
  {y:1987, sm:4,  sd:12, em:9,  ed:13},
  {y:1988, sm:4,  sd:10, em:9,  ed:11},
  {y:1989, sm:4,  sd:16, em:9,  ed:17},
  {y:1990, sm:4,  sd:15, em:9,  ed:16},
  {y:1991, sm:4,  sd:14, em:9,  ed:15}
];
function _dstDoy(y, m, d){
  let n = d;
  for(let mo=1; mo<m; mo++) n += daysOfMonth(y, mo);
  return n;
}
/* 判钟面是否落在夏令时段内：返回 dst 是否在夏令、ambiguous 是否讫日钟面两见 */
function cnDstState(y, m, d, h, mi){
  const span = CN_DST_SPANS.find(s=>s.y===y);
  if(!span) return {dst:false, ambiguous:false};
  const t = _dstDoy(y,m,d) + (h*60+mi)/1440;
  const t0 = _dstDoy(y,span.sm,span.sd) + 2/24;
  const t1 = _dstDoy(y,span.em,span.ed) + 2/24;
  if(t < t0 || t >= t1) return {dst:false, ambiguous:false};
  return {dst:true, ambiguous: t >= t1 - 1/24};
}
/* 钟面加减分钟并滚动日界（借 Solar.nextDay 处理跨日，避开 Date 的两位数年陷阱） */
function shiftClockDay(y, m, d, h, mi, deltaMin){
  let total = h*60 + mi + deltaMin;
  let dayOffset = 0;
  while(total >= 1440){ total -= 1440; dayOffset++; }
  while(total < 0){ total += 1440; dayOffset--; }
  let solar = Solar.fromYmd(y, m, d);
  if(dayOffset !== 0) solar = solar.nextDay(dayOffset);
  return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay(), h: Math.floor(total/60), mi: total - Math.floor(total/60)*60 };
}
/* 夏令时折算主入口：mode 'auto' 命中夏令时段即折回、'on' 强制折回、'off' 不折。
   返回折算后时刻与提示句（applied 为是否折算、ambiguous 为讫日歧义）。 */
function applyDstCorrection(y, m, d, h, mi, mode){
  mode = mode || 'auto';
  if(mode === 'off') return {y, m, d, h, mi, applied:false, ambiguous:false, note:''};
  const st = cnDstState(y, m, d, h, mi);
  if(!st.dst && mode !== 'on') return {y, m, d, h, mi, applied:false, ambiguous:false, note:''};
  const out = shiftClockDay(y, m, d, h, mi, -60);
  const fmt = t => String(t).padStart(2,'0');
  let note = (st.dst ? '夏令时段内钟面 ' : '按夏令时口径钟面 ') + fmt(h) + ':' + fmt(mi) + ' 折为标准时 ' + fmt(out.h) + ':' + fmt(out.mi);
  if(st.ambiguous) note += '；讫日此钟面当年两见，若折算与实况不符请改选不校正';
  return {y:out.y, m:out.m, d:out.d, h:out.h, mi:out.mi, applied:true, ambiguous:st.ambiguous, note};
}

/* ===== 十二支方位（周公解梦、太岁、择日、风水等跨模块共用） =====
   口径：十二支归并八方位（子北、卯东、午南、酉西；丑寅东北、辰巳东南、未申西南、戌亥西北），
   与老黄历页岁煞行 ZHI_FANG、风水页 taiSuiFang 口径一致；
   bazi-data.js 另有同名 const（八字域内部使用），加载顺序在 xuanji-lib 之前或之后的页面均以本表为跨模块消费真源 */
window.ZHI_FANG = window.ZHI_FANG || {子:'正北',丑:'东北',寅:'东北',卯:'正东',辰:'东南',巳:'东南',午:'正南',未:'西南',申:'西南',酉:'正西',戌:'西北',亥:'西北'};

/* ===== 年家三煞（择日与风水共用）：申子辰煞南巳午未、寅午戌煞北亥子丑、
   巳酉丑煞东寅卯辰、亥卯未煞西申酉戌；第四位为方，前三支为劫煞灾煞岁煞 ===== */
window.SANSHA = window.SANSHA || {
  申:['巳','午','未','南'],子:['巳','午','未','南'],辰:['巳','午','未','南'],
  寅:['亥','子','丑','北'],午:['亥','子','丑','北'],戌:['亥','子','丑','北'],
  亥:['申','酉','戌','西'],卯:['申','酉','戌','西'],未:['申','酉','戌','西'],
  巳:['寅','卯','辰','东'],酉:['寅','卯','辰','东'],丑:['寅','卯','辰','东']
};

/* ===== 二十四气节与气之分（万年历、老黄历共用） =====
   十二节为节气月之始：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒；
   余十二为气。日历格角标与节气圆盘刻度同取此判据。 */
const JIE_QI_JIE = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
function jieQiIsJie(name){ return JIE_QI_JIE.indexOf(name) >= 0; }
window.jieQiIsJie = jieQiIsJie;

/* ===== 节日取数（万年历、老黄历共用） =====
   历法库把节日分作四族：公历节日、公历其他节日、农历节日、农历其他节日。
   holiday.js 的纪念日表（MEMORIAL）是本站策展的第五族，专收国家与民族层面的重大纪念日。
   日历格只出一节，日期详情与格上角标 title 列出该日全部节日；多名以空格相隔，随容器自然折行。 */
function festParts(solar, y, m, d){
  const lunar = solar.getLunar();
  const sf = solar.getFestivals() || [], sOf = solar.getOtherFestivals() || [];
  const lf = lunar.getFestivals() || [], lOf = lunar.getOtherFestivals() || [];
  const memList = (typeof memorialList === 'function') ? memorialList(y, m, d) : [];
  const mem = memList.join(' ');
  const all = [];
  sf.concat(lf).forEach(f => { if (all.indexOf(f) < 0) all.push(f); });
  memList.forEach(f => { if (all.indexOf(f) < 0) all.push(f); });
  lOf.concat(sOf).forEach(f => { if (all.indexOf(f) < 0) all.push(f); });
  const pick = sf[0] || lf[0] || memList[0] || lOf[0] || sOf[0]
    || (lunar.getDayInChinese() === '初一' ? lunar.getMonthInChinese() + '月' : '');
  /* hasMain 只认主节，hasAny 四族皆认：窄屏两槽隐去后由角标顶替，
     凡格上真有节日者一律点亮节字，只余初一月份名的日子不亮，免空标 */
  return {sf:sf, lf:lf, sOf:sOf, lOf:lOf, mem:mem, all:all, pick:pick,
    hasMain:!!(sf[0] || lf[0]), hasAny:!!(sf[0] || lf[0] || sOf[0] || lOf[0])};
}
window.festParts = festParts;

/* 节日行文本：多名以空格相隔，随容器宽度自然折行；格上角标 title 与日期详情同此一份 */
function festLine(list){ return list.join(' '); }
window.festLine = festLine;

/* ===== 周次（万年历、老黄历、道历共用；取数走 lunar.js 的 SolarWeek 与 SolarMonth） =====
   一周以周一起例，与三页日历格首列同为周一（getStart 即周首序数，周一为 1）。
   月内第几周按所在月计、年内第几周按所在年计，两途并存不取其一；
   跨月之周的首日有两种口径：getFirstDay 可跨出本月，getFirstDayInMonth 只取落在本月的第一天。 */
function weekLine(y, m, d){
  if(typeof Solar === 'undefined') return '';
  const w = Solar.fromYmd(y, m, d).getSolarWeek(1);
  return w.toFullString() + '　周首' + w.getStart() + '　年内第' + w.getIndexInYear() + '周'
    + '　本周起' + w.getFirstDay().toYmd() + '　本月内首日' + w.getFirstDayInMonth().toYmd()
    + '　本月占' + w.getDaysInMonth().length + '天';
}
/* 当月周数：取 SolarMonth.getWeeks，月首月尾各有一段跨月之周，故周数常比整周数多一 */
function monthWeekCount(y, m){
  if(typeof SolarMonth === 'undefined') return 0;
  return SolarMonth.fromYm(y, m).getWeeks(1).length;
}
window.weekLine = weekLine;
window.monthWeekCount = monthWeekCount;

/* ===== 日历页日期导航（今天、翻月翻年、点格带入；万年历系与老黄历系两形并存） =====
   历法分类多页共有的三样动作收此一件：填输入框、按月年平移、点日历格带入。
   平移走字符串改值再触发查询，日界由原生 Date 溢出归位（13 月归次年 1 月、31 日归下月 1 日），
   选中日超当月天数时收当月月尾，与输入型各页 shiftDate 同律。
   钩子：xjCalNav.onQuery 由页自装（页内有 query() 者装 query、有 jumpToDate 者装 jumpToDate），
   本件只管算出目标日期串，不替页决定刷新走哪条路。 */
const xjNav = (function(){
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function inputOf(){
    const el = document.getElementById('dInput');
    if (!el) return null;
    el.removeAttribute('readonly');
    return el;
  }
  function ymd(y, m, d){ return y + '-' + pad(m) + '-' + pad(d); }
  function fire(v){
    if (typeof xjNav.onQuery === 'function') xjNav.onQuery(v);
  }
  function today(){
    const el = inputOf(); if (!el) return;
    const n = new Date();
    const v = ymd(n.getFullYear(), n.getMonth() + 1, n.getDate());
    el.value = v;
    /* 时辰类页（太乙、铁板）另有 hInput/kInput：today 后由页内 xjNavAfter 回填当辰，
       本件只认 dInput 这一公共面，不越页去认各页私有输入。 */
    if (typeof xjNav.onToday === 'function') xjNav.onToday(v);
    fire(v);
  }
  function shift(dm, dy){
    const el = inputOf(); if (!el) return;
    const v = el.value; if (!v) return;
    let [y, m, d] = v.split('-').map(Number);
    y += dy; m += dm;
    while (m > 12) { m -= 12; y++; }
    while (m < 1) { m += 12; y--; }
    const dim = new Date(y, m, 0).getDate();
    if (d > dim) d = dim;
    const nv = ymd(y, m, d);
    el.value = nv;
    fire(nv);
  }
  function pick(key){
    const el = inputOf(); if (!el) return;
    el.value = key;
    fire(key);
  }
  /* 直达某日：只把日期串归一为补零的分日形状并写入输入框，刷新交由页内做。
     检索结果与外部传入的日期都走此口，免得各页各写一份补零与回填。 */
  function jump(v){
    if (!v) return '';
    const p = String(v).split('-').map(Number);
    if (!p[0] || !p[1]) return '';
    const key = ymd(p[0], p[1], p[2] || 1);
    const el = inputOf(); if (el) el.value = key;
    return key;
  }
  return { onQuery: null, onToday: null, today: today, shift: shift, pick: pick, jump: jump };
})();
window.xjCalNav = xjNav;
window.xjCalJump = function(v, setDate){
  const key = xjNav.jump(v); if (!key) return;
  const p = key.split('-').map(Number);
  if (setDate) setDate(p[0], p[1], p[2]);
  if (typeof window.render === 'function') window.render();
  if (typeof window.showDay === 'function') window.showDay(key);
};
window.xjNavToday = function(){ xjNav.today(); };
window.xjNavShift = function(dm, dy){ xjNav.shift(dm, dy); };
window.xjNavMonth = function(n){ xjNav.shift(n, 0); };
window.xjNavYear = function(n){ xjNav.shift(0, n); };
window.xjNavPick = function(key){ xjNav.pick(key); };

/* ===== 月历格骨架（五历页共用：题头、星期行、上下月补位、今日与周末两态） =====
   历法五页的月骨架收此一件：calTitle 题头、周一起始的星期行、上月头与下月尾补位，
   今日与周末的判据都由此出，页内只留一格一貌的取数与角标。
   cell 回调收 (日期, 是否补位格, 今日串, 前一格日期)，返回一整格 HTML；
   补位格画空壳还是画可点整格由各页自定，骨架不替页决定。
   slots 依真日期补位并逐格带出前一格日期，藏历重日与缺日须与前格比对即由此取。
   年月取公历 1 至 12；日期构造走 safeDate，公元 0 至 99 年不撞引擎偏移。 */
const xjGrid = (function(){
  function sd(y, m, d){
    return (typeof safeDate === 'function') ? safeDate(y, m, d) : new Date(y, m - 1, d);
  }
  function slots(y, m){
    const first = sd(y, m, 1);
    const dim = sd(y, m + 1, 0).getDate();
    const startWd = (first.getDay() + 6) % 7;   /* 周一起始：周一=0 … 周日=6 */
    const list = [];
    let i;
    for(i = 0; i < startWd; i++) list.push({ d: sd(y, m, 1 - (startWd - i)), other: true });
    for(i = 1; i <= dim; i++) list.push({ d: sd(y, m, i), other: false });
    const tail = (7 - (startWd + dim) % 7) % 7;
    for(i = 1; i <= tail; i++) list.push({ d: sd(y, m + 1, i), other: true });
    return list;
  }
  function render(y, m, opts){
    const ct = document.getElementById('calTitle');
    if (ct) ct.textContent = y + '年' + m + '月';
    const todayStr = (opts.today || new Date()).toDateString();
    const cells = ['一','二','三','四','五','六','日'].map(function(w){ return '<div class="wd">' + w + '</div>'; });
    let prev = null;
    slots(y, m).forEach(function(it){
      cells.push(opts.cell(it.d, it.other, todayStr, prev));
      prev = it.d;
    });
    document.getElementById('calGrid').innerHTML = cells.join('');
    if (typeof opts.after === 'function') opts.after();
  }
  return { slots: slots, render: render };
})();
window.xjCalGrid = xjGrid;

/* ===== 日历页检索与筛选（五历页共用） =====
   页给三样：逐日检索词、筛选项、逐日筛选判据；本件只管建查询行、跑前后三年、列命中与隐藏未命中格。
   查询结果与筛选行在日历格之外，不随分享导出；格隐藏走 xj-filtered 类，保留角标与格位。 */
const xjCalQuery = (function(){
  function esc(s){
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function init(o){
    const mount = document.getElementById(o.mount || 'xjQuery');
    if (!mount) return null;
    const gridId = o.grid || 'calGrid';
    const label = o.label || '内容检索';
    const ph = o.placeholder || '神名或节日名';
    const filterLabel = o.filterLabel || '筛选';
    mount.innerHTML = '<div class="form-row xj-query-row">'
      + '<div class="field"><label for="xjSearch">' + esc(label) + '</label><input type="text" id="xjSearch" class="xj-search-input" placeholder="' + esc(ph) + '" autocomplete="off"></div>'
      + '<button class="btn soft" type="button" id="xjSearchBtn">检索</button></div>'
      + '<div class="xj-filter-row" id="xjFilterRow"></div>'
      + '<div class="xj-search-out" id="xjSearchOut"></div>';
    const input = document.getElementById('xjSearch');
    const out = document.getElementById('xjSearchOut');
    const filterRow = document.getElementById('xjFilterRow');
    let timer = null, sel = [];
    function buildFilter(){
      let h = '<span class="xj-filter-cap">' + esc(filterLabel) + '</span><div class="xj-filter-opts">';
      (o.filters || []).forEach(function(f){
        h += '<label class="xj-chk"><input type="checkbox" value="' + esc(f.value) + '">' + esc(f.label) + '</label>';
      });
      h += '<button type="button" class="btn-mini xj-filter-clear" id="xjClear">清空</button><span class="xj-filter-info" id="xjFilterInfo"></span></div>';
      filterRow.innerHTML = h;
      filterRow.querySelectorAll('input[type=checkbox]').forEach(function(c){ c.addEventListener('change', apply); });
      document.getElementById('xjClear').addEventListener('click', clear);
    }
    function selected(){
      sel = Array.prototype.map.call(filterRow.querySelectorAll('input[type=checkbox]:checked'), function(c){ return c.value; });
      return sel;
    }
    function apply(){
      selected();
      const cells = document.querySelectorAll('#' + gridId + ' .cal-cell');
      let n = 0;
      cells.forEach(function(c){
        const key = c.getAttribute('data-date'); if (!key) return;
        const p = key.split('-').map(Number);
        const hit = !sel.length || (o.match ? !!o.match(p[0], p[1], p[2], sel) : true);
        c.classList.toggle('xj-filtered', !hit);
        if (hit) n++;
      });
      const info = document.getElementById('xjFilterInfo');
      if (info) info.textContent = sel.length ? ('命中 ' + n + ' 日') : '';
    }
    function clear(){
      filterRow.querySelectorAll('input[type=checkbox]').forEach(function(c){ c.checked = false; });
      apply();
    }
    function search(){
      const q = (input.value || '').trim();
      if (!q){ out.innerHTML = ''; return; }
      const y = o.getYear ? o.getYear() : new Date().getFullYear();
      const span = o.years || 3, limit = o.limit || 80, hits = [];
      for (let yy = y - span; yy <= y + span && hits.length < limit; yy++){
        for (let m = 1; m <= 12 && hits.length < limit; m++){
          const dim = new Date(yy, m, 0).getDate();
          for (let d = 1; d <= dim && hits.length < limit; d++){
            const labels = (o.searchDay ? o.searchDay(yy, m, d) : []) || [];
            const hit = labels.filter(function(n){ return String(n).indexOf(q) >= 0; });
            if (hit.length) hits.push({ date: yy + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'), text: hit.join('、') });
          }
        }
      }
      const cap = '检索范围 ' + y + ' 年前后三年，命中 ' + hits.length + ' 日' + (hits.length >= limit ? '（最多列 ' + limit + ' 日）' : '');
      out.innerHTML = '<div class="xj-search-cap">' + cap + '</div>'
        + (hits.length ? hits.map(function(h){
          return '<a href="#" class="xj-search-item" data-date="' + esc(h.date) + '">' + esc(h.date) + '　' + esc(h.text) + '</a>';
        }).join('') : '<div class="xj-search-empty">无命中</div>');
      out.querySelectorAll('.xj-search-item').forEach(function(a){
        a.addEventListener('click', function(e){
          e.preventDefault();
          if (o.onJump) o.onJump(a.getAttribute('data-date'));
        });
      });
    }
    function soon(){
      clearTimeout(timer);
      timer = setTimeout(search, 200);
    }
    function refresh(){
      apply();
      if ((input.value || '').trim()) search();
    }
    input.addEventListener('input', soon);
    document.getElementById('xjSearchBtn').addEventListener('click', search);
    document.addEventListener('xj:restmarks', refresh);
    buildFilter();
    apply();
    return { apply: apply, refresh: refresh };
  }
  return { init: init };
})();
window.xjCalQuery = xjCalQuery;

/* ===== 提示弹层遮罩（历法页共用） =====
   弹层遮罩的建立与复用收此一件：首次调用建壳并挂关层监听，其后按 id 复用。
   遮罩 id、正文容器 id 与关层函数名由页给，本件不越页去认各页私有命名；
   关层函数为页内全局函数，点关闭钮与点遮罩空白处两路同走它。 */
function xjTipMask(maskId, bodyId, closeFn){
  let mask = document.getElementById(maskId);
  if(!mask){
    mask = document.createElement('div');
    mask.id = maskId;
    mask.className = 'modal-mask';
    mask.setAttribute('role', 'dialog');
    mask.innerHTML = '<div class="modal"><span class="close" onclick="' + closeFn + '()" aria-label="关闭">×</span><div id="' + bodyId + '"></div></div>';
    mask.addEventListener('click', function(e){ if(e.target === mask) window[closeFn](); });
    document.body.appendChild(mask);
  }
  return mask;
}
window.xjTipMask = xjTipMask;

/* ===== 节气前后行（历法页共用） =====
   节与气分列两行，取前后各一气；本日正逢交节者在该气后标本日。
   行内只给日期，交节时刻归各页节气盘，不在此重出。 */
function xjJieqiLines(lunar){
  const md = function(x){ return x.getName() + ' ' + x.getSolar().toYmd(); };
  const j = lunar.getCurrentJie(), q = lunar.getCurrentQi();
  const pj = lunar.getPrevJie(), nj = lunar.getNextJie(), pq = lunar.getPrevQi(), nq = lunar.getNextQi();
  const tag = function(x, cur){ return md(x) + (cur && cur.getName() === x.getName() ? '（本日）' : ''); };
  return ['节：上 ' + md(pj) + '　下 ' + tag(nj, j), '气：上 ' + md(pq) + '　下 ' + tag(nq, q)];
}
window.xjJieqiLines = xjJieqiLines;

/* ===== 历法页飞星、太岁、年占与轮盘落点（五历页共用） =====
   飞星四层与九宫图、太岁犯冲刑害破文案、年占行与三处弹窗内容、轮盘落点几何收此一件；
   页内只留同名一行包装，页级差异（换行类、弹窗函数、轮盘半径、时辰文案函数）由页传入。 */
function xjYearStar(y){
  const C=180; const idx=(((y-1864)%C)+C)%C; const base=idx<60?1:(idx<120?4:7);
  const off=(((y-1864)%60)+60)%60; let s=(base-off)%9; if(s<=0)s+=9; return s;
}

function xjMonthStar(y,zhi,monthZhi){
  const base={子:8,午:8,卯:8,酉:8,辰:5,戌:5,丑:5,未:5,寅:2,申:2,巳:2,亥:2}[zhi];
  const MZ=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];  /* 节气月序：寅=正月 … 丑=十二月 */
  const mi=MZ.indexOf(monthZhi); /* 0 基 */
  let s=(base-mi)%9; if(s<=0)s+=9; return s;
}

/* 日白三元：阳遁三段与阴遁三段，当令之气取 getPrevQi；历法页共用此一件，页内只留同名包装 */
const XJ_BAI_YUAN={冬至:[1,1],大寒:[1,1],雨水:[7,1],春分:[7,1],谷雨:[4,1],小满:[4,1],
  夏至:[9,-1],大暑:[9,-1],处暑:[3,-1],秋分:[3,-1],霜降:[6,-1],小雪:[6,-1]};
function xjBaiSegment(y,m,d){
  const q=Solar.fromYmd(y,m,d).getLunar().getPrevQi(true);
  const v=XJ_BAI_YUAN[q.getName()]||XJ_BAI_YUAN.冬至;
  return {base:v[0],dir:v[1]};
}

function xjDayStar(y,m,d){
  const n=LunarUtil.getJiaZiIndex(Solar.fromYmd(y,m,d).getLunar().getDayInGanZhi())+1;
  const off=(n-1+60)%60;
  const seg=xjBaiSegment(y,m,d);
  let s=((seg.base-1+seg.dir*off)%9+9)%9+1; return s;
}

function xjHourStar(y,m,d){
  const dz=Solar.fromYmd(y,m,d).getLunar().getDayInGanZhi()[1];
  const g={子:0,午:0,卯:0,酉:0,辰:1,戌:1,丑:1,未:1,寅:2,申:2,巳:2,亥:2}[dz]||0;
  const si=(Math.floor((xjNowDate().getHours()+1)/2))%12;
  const asc=xjBaiSegment(y,m,d).dir===1;
  const start=asc?[1,4,7][g]:[9,6,3][g];
  let s=asc?((start-1+si)%9)+1:((start-1-si)%9+9)%9+1; return s;
}

/* 胎神：月胎神与日胎神各取引擎终值，闰月沿用同月表；历法页共用，页内只调本对函数 */
function xjTaiShenMonth(lunar){
  const s=lunar.getMonthPositionTai();
  if(s) return s;
  const m=lunar.getMonth();
  if(m<0 && typeof LunarUtil!=='undefined' && LunarUtil.POSITION_TAI_MONTH){
    return LunarUtil.POSITION_TAI_MONTH[Math.abs(m)-1]||'未载';
  }
  return '未载';
}
function xjTaiShenDay(lunar){ return lunar.getDayPositionTai()||'未载'; }
window.xjTaiShenMonth=xjTaiShenMonth;
window.xjTaiShenDay=xjTaiShenDay;

function xjFeiXingGrid(center){
  const order=[5,6,7,8,9,1,2,3,4];
  const pmap={1:[3,2],2:[1,3],3:[2,1],4:[1,1],5:[2,2],6:[3,3],7:[2,3],8:[3,1],9:[1,2]};
  const grid={};
  order.forEach((p,i)=>{ const star=((center-1+i)%9)+1; const pos=pmap[p]; grid[pos[0]+','+pos[1]]=star; });
  return grid;
}

function xjFeiGridHTML(center){
  const g=feiXingGrid(center); let h='<div class="fei-grid">';
  for(let r=1;r<=3;r++)for(let c=1;c<=3;c++){
    const n=g[r+','+c]||'';
    const s=feiStar(n);
    const t=s?(FEI_NAME[n]+s.getWuXing()):FEI_NAME[n];
    const w=s?('<span class="tip" onclick="showFeiTip('+n+')">'+feiLoc(s)+s.getNameInBeiDou()+'</span>'):FEI_WX[n];
    h+=`<div class="fei-cell fei-${n}"><span class="fei-n">${n}</span><span class="fei-t">${t}</span><span class="fei-w">${w}</span></div>`;
  }
  h+='</div>'; return h;
}

function xjYearZhanRow(y){
  const L=(typeof LunarYear!=='undefined')?LunarYear.fromYear(y):null;
  if(!L) return '';
  return [L.getCaoZi(),L.getDeJin(),L.getFenBing(),L.getGengTian(),L.getGongZhu(),L.getHuaShou(),
    L.getJiaTian(),L.getKanCan(),L.getQiangMi(),L.getRenBing(),L.getRenChu(),L.getTouLiang(),
    L.getTuoGu(),L.getZhiShui(),L.getYuan(),L.getYun()].join('　');
}

function xjTaiSuiText(ygz,yZhi,suiPo){
  const star=TAISUI_STAR[ygz]||'未载';
  const xing=(XING_TAI[yZhi]||[]).map(x=>ZHI_SHENG[x]).join('')||'无';
  const hai=ZHI_SHENG[HAI_TAI[yZhi]]||'无', po=ZHI_SHENG[PO_TAI[yZhi]]||'无';
  return `太岁神君：${star}大将军；犯太岁：值${ZHI_SHENG[yZhi]}冲${ZHI_SHENG[suiPo]}刑${xing}害${hai}破${po}`;
}

function xjShowFeiTip(n, showFn){
  const s=feiStar(n); if(!s) return;
  const men=s.getBaMenInQiMen(), song=s.getSongInTaiYi();
  const lines=[
    feiLoc(s)+s.getNameInBeiDou(),
    `玄空 ${s.getNameInXuanKong()}（${s.getLuckInXuanKong()}）`,
    `奇门 ${s.getNameInQiMen()}（${s.getLuckInQiMen()}${men?'　'+men+'门':''}　${s.getYinYangInQiMen()}）`,
    `太乙 ${s.getNameInTaiYi()}（${s.getTypeInTaiYi()}）`
  ];
  if(song) lines.push('太乙歌：'+song);
  showFn(FEI_NAME[n]+s.getWuXing()+s.getPosition(), lines.join('<br>'));
}

function xjShowYearZhanTip(y, showFn){
  const L=(typeof LunarYear!=='undefined')?LunarYear.fromYear(y):null;
  if(!L) return;
  const lines=Object.keys(YZ_RULE).map(function(k){
    const v=(typeof L[k]==='function')?L[k]():'';
    return v?('<b>'+v+'</b>　'+YZ_RULE[k]):'';
  }).filter(Boolean);
  showFn(y+'年（'+L.getGanZhi()+'）年占', lines.join('<br>'));
}

function xjShowDangLingTip(zhi, showFn){
  const j=(typeof SHILING_JINGLUO!=='undefined')?SHILING_JINGLUO.find(function(x){return x.zhi===zhi;}):null;
  if(!j) return;
  showFn(j.zhi+'时 '+j.jing, j.full+'，当令时段 '+j.range+'。宜 '+j.yi+'。');
}

function xjScData(t, i, last, yiText){
  const luck=(t.getTianShenLuck&&t.getTianShenLuck())||'';
  const h=+t.getMaxHm().slice(0,2)+1;
  return {name:i===0?'子时':(last?'夜子时':t.getGanZhi().substring(1)+'时'),
    gz:t.getGanZhi(), luck:luck, good:luck==='吉',
    shen:t.getTianShen?(''+t.getTianShen()):'',
    range:t.getMinHm()+'-'+(h<24?String(h).padStart(2,'0')+':00':'24:00'),
    yi:yiText(t.getYi&&t.getYi().slice(0,3))};
}

function xjWheelSpot(ids, dg, a0, a1, geo){
  const arc=document.getElementById(ids.arc);
  if(arc) arc.setAttribute('d',WHEEL.arc(geo.arc,a0,a1));
  const q0=WHEEL.px(geo.p0,dg), q1=WHEEL.px(geo.p1,dg);
  const ln=document.getElementById(ids.needle);
  if(ln){
    ln.setAttribute('x1',WHEEL.n(q0[0])); ln.setAttribute('y1',WHEEL.n(q0[1]));
    ln.setAttribute('x2',WHEEL.n(q1[0])); ln.setAttribute('y2',WHEEL.n(q1[1]));
  }
  const dt=document.getElementById(ids.dot);
  if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
}

/* ===== 历法页轮盘点选共通（时辰、圣诞、宿曜诸盘） =====
   点选后按同一序刷新：轮盘选中与标签、落点、盘心三行、详情。
   各盘差异收在页给的配置对象里：arr 为数据数组，setSel 写页内选中变量，
   wheel 为轮盘 id，lab 为标签序号换算，span 给区段角度，spot 画落点，
   c1 至 c3 为盘心三行的取值与色，detailId 与 detail 出详情。 */
function xjPickCommon(i, c){
  const arr = c.arr(); if(!arr || !arr[i]) return;
  c.setSel(i);
  const x = arr[i], sp = c.span(i);
  WHEEL.pick(c.wheel, i);
  WHEEL.lab(c.wheel, c.lab ? c.lab(i) : i);
  c.spot(x, sp, i);
  WHEEL.text(c.c1[0], c.c1[1](x));
  WHEEL.text(c.c2[0], c.c2[1](x), c.c2[2](x));
  WHEEL.text(c.c3[0], c.c3[1](x));
  const d = document.getElementById(c.detailId);
  if(d) d.innerHTML = c.detail(x, i);
}
window.xjPickCommon = xjPickCommon;

/* 飞星导出文案与阳宅玄空轮盘 SVG、详情：同体共通件 */
function xjFeiText(center){ const g=feiXingGrid(center); const out=[]; for(let r=1;r<=3;r++){ const row=[]; for(let c=1;c<=3;c++){ const n=g[r+','+c], s=feiStar(n); row.push(FEI_NAME[n]+(s?(s.getWuXing()+feiLoc(s)+s.getNameInBeiDou()):'('+FEI_WX[n]+')')); } out.push('  '+row.join(' ')); } return out.join('\n'); }

function xjFsXkWheelSvg(opts){
  const d=FS_XK_DATA; if(!d) return '';
  const yun=d.yun.yun, ax=opts.axis(), g=opts.geo;
  let s='';
  for(let i=0;i<8;i++) s+=`<path d="${WHEEL.arc(FW_ARC,i*45-22.5,i*45+22.5)}" class="w-arc"/>`;
  for(let i=0;i<8;i++){
    const a=WHEEL.px(FW_TICK0,i*45), c=WHEEL.px(FW_TICK1,i*45);
    s+=`<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
  }
  for(let i=0;i<8;i++){
    const bd=WHEEL.band(g.in,g.hit1,i*45-22.5,i*45+22.5);
    s+=`<path d="${bd}" class="w-hit${i===FS_XK_SEL?' is-on':''}" data-i="${i}" onclick="fsPickXk(${i})"/>`
      +`<path d="${bd}" class="w-sel"/>`;
  }
  s+=`<path id="fsXkCur" d="${WHEEL.arc(FW_ARC,FS_XK_SEL*45-22.5,FS_XK_SEL*45+22.5)}" class="w-arc w-arc-cur"/>`;
  /* 外签宫名与方位 */
  FS_ZB_ORDER.forEach((n,i)=>{
    const a=WHEEL.px(FW_LAB_OUT,i*45);
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_XK_SEL?' w-lab-cur':''}" data-i="${i}"`
      +` transform="rotate(${WHEEL.ring(i*45)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.NINE_BAGUA[n]}${FS.NINE_DIR[n]}</text>`;
  });
  /* 内签一：运星名，色取该星本身的吉凶 */
  FS_ZB_ORDER.forEach((n,i)=>{
    const r=fsXkRow(i), a=WHEEL.px(g.zw,i*45), f=fwJxFill(FS.STAR_JX[r.yun]);
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_XK_SEL?' w-lab-cur':''}" data-i="${i}"`
      +(f?` style="fill:${f}"`:'')
      +` transform="rotate(${WHEEL.radial(i*45)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${STAR_NAMES[r.yun]}</text>`;
  });
  /* 内签二：山星与向星同格左右并排，各按自己那一档旺衰着色 */
  FS_ZB_ORDER.forEach((n,i)=>{
    const r=fsXkRow(i);
    [[-12,'山'+r.sit,FS.starWangShuai(r.sit,yun)],[12,'向'+r.face,FS.starWangShuai(r.face,yun)]].forEach(pr=>{
      const ang=i*45+pr[0], a=WHEEL.px(g.sx,ang);
      s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_XK_SEL?' w-lab-cur':''}" data-i="${i}"`
        +` style="fill:${fwWangFill(pr[2])}"`
        +` transform="rotate(${WHEEL.radial(ang)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${pr[1]}</text>`;
    });
  });
  s+=`<circle cx="${g.c}" cy="${g.c}" r="${g.out}" class="w-ring"/>`
    +`<circle cx="${g.c}" cy="${g.c}" r="${g.in}" class="w-ring"/>`
    +`<circle cx="${g.c}" cy="${g.c}" r="${g.core}" class="w-core"/>`;
  const q0=WHEEL.px(g.p0,FS_XK_SEL*45), q1=WHEEL.px(g.p1,FS_XK_SEL*45);
  s+=`<line id="fsXkNeedle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
    +`<circle id="fsXkDot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
  const ct=fsXkCoreTxt(FS_XK_SEL);
  s+=`<text id="fsXkC1" x="${g.c}" y="${g.c-16}" class="w-c1">${ct[0]}</text>`
    +`<text id="fsXkC2" x="${g.c}" y="${g.c+14}" class="w-c2">${ct[1]}</text>`
    +`<text id="fsXkC3" x="${g.c}" y="${g.c+34}" class="w-c3" style="fill:${ct[3]}">${ct[2]}</text>`;
  return `<svg class="wheel" id="fsXkWheel" viewBox="0 0 440 440" role="img" aria-label="玄空飞星山向盘：外圈八宫方位，内两圈为运星与山向星，点选一宫看该宫山向旺衰与断事">${s}</svg>`;
}function xjFsXkDetail(){
  const d=FS_XK_DATA; if(!d) return;
  const b=getBase(), r=fsXkRow(FS_XK_SEL), yun=d.yun.yun;
  const sw=FS.starWangShuai(r.sit,yun), fw=FS.starWangShuai(r.face,yun);
  const dc=FS.gongDingCai(r.sit,r.face,yun), cj=FS.comboJx(r.sit,r.face);
  const jxCls=jx=>jx.indexOf('凶')>=0?'wd-x':(jx.indexOf('吉')>=0?'wd-g':'');
  const tag=(r.palace===FS_GUA_NUM[b.faceShan]?'向首宫 ':'')+(r.palace===FS_GUA_NUM[b.sitShan]?'坐山宫 ':'');
  fwDetail('fsXkDetail',
    `${FS.NINE_BAGUA[r.palace]}宫（${FS.NINE_DIR[r.palace]}方） ${tag}运星${r.yun} 山星${r.sit}（${sw}） 向星${r.face}（${fw}）`
    +`<span class="wd-br"></span>`
    +`丁财断 <span class="${jxCls(dc.jx)}">${dc.jx}</span> ${dc.mean}`
    +`<span class="wd-br"></span>`
    +`山向相会 <span class="${jxCls(cj.jx)}">${cj.jx}</span> ${cj.mean||'比和，随当令断'}`
    +`<span class="wd-br"></span>`
    +`中宫入中：运星${d.yun.yun}、山星${d.sitIn}、向星${d.faceIn} 旺山旺向为阳宅之上格，双星到向须向首有水、双星到山须坐后有山。`);
}

window.xjFeiText = xjFeiText;
window.xjFsXkWheelSvg = xjFsXkWheelSvg;
window.xjFsXkDetail = xjFsXkDetail;

/* 择日评级阈值骨架：五档阈值全站唯一，档名与释义由调用方传入 */
function xjJzGrade(s, grade){
  if(s>=88) return {t:grade.da, k:grade.daK, d:grade.daD};
  if(s>=76) return {t:grade.zhong, k:grade.zhongK, d:grade.zhongD};
  if(s>=60) return {t:grade.ping, k:grade.pingK, d:grade.pingD};
  if(s>=40) return {t:grade.xiong, k:grade.xiongK, d:grade.xiongD};
  return {t:grade.daXiong, k:grade.daXiongK, d:grade.daXiongD};
}
window.xjJzGrade = xjJzGrade;

/* 三合水法盘 SVG：两页同体，盘心 C2 色取 gongJx 吉凶 */
function xjFsShWheelSvg(){
  const d=FS_SH_DATA; if(!d) return '';
  let s='';
  for(let i=0;i<12;i++){
    const a=fsShDeg(i);
    s+=`<path d="${WHEEL.arc(FW_ARC,a-15,a+15)}" class="w-arc"/>`;
  }
  for(let i=0;i<12;i++){
    const a=fsShDeg(i), c=WHEEL.px(FW_TICK0,a), e=WHEEL.px(FW_TICK1,a);
    s+=`<line x1="${WHEEL.n(c[0])}" y1="${WHEEL.n(c[1])}" x2="${WHEEL.n(e[0])}" y2="${WHEEL.n(e[1])}" class="w-tick"/>`;
  }
  for(let i=0;i<12;i++){
    const a=fsShDeg(i), bd=WHEEL.band(FW_IN,FW_HIT1,a-15,a+15);
    s+=`<path d="${bd}" class="w-hit${i===FS_SH_SEL?' is-on':''}" data-i="${i}" onclick="fsPickSh(${i})"/>`
      +`<path d="${bd}" class="w-sel"/>`;
  }
  s+=`<path id="fsShCur" d="${WHEEL.arc(FW_ARC,fsShDeg(FS_SH_SEL)-15,fsShDeg(FS_SH_SEL)+15)}" class="w-arc w-arc-cur"/>`;
  /* 外签十二宫名：宫名二字与单字并存（衰病死墓绝胎养皆单字），一律沿圆周环布 */
  for(let i=0;i<12;i++){
    const a=WHEEL.px(FW_LAB_OUT,fsShDeg(i)), f=fwJxFill(d.gongJx[i]);
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i===FS_SH_SEL?' w-lab-cur':''}" data-i="${i}"`
      +(f?` style="fill:${f}"`:'')
      +` transform="rotate(${WHEEL.ring(fsShDeg(i))} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${d.gong[i].gong}</text>`;
  }
  /* 内签地支：单字走取字角，四正放正 */
  for(let i=0;i<12;i++){
    const a=WHEEL.px(FW_LAB_IN,fsShDeg(i));
    s+=`<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i===FS_SH_SEL?' w-lab-cur':''}" data-i="${i}"`
      +` transform="rotate(${WHEEL.dir(fsShDeg(i))} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${d.gong[i].zhi}</text>`;
  }
  s+=`<circle cx="${FW_C}" cy="${FW_C}" r="${FW_OUT}" class="w-ring"/>`
    +`<circle cx="${FW_C}" cy="${FW_C}" r="${FW_IN}" class="w-ring"/>`
    +`<circle cx="${FW_C}" cy="${FW_C}" r="${FW_CORE}" class="w-core"/>`;
  const q0=WHEEL.px(FW_P0,fsShDeg(FS_SH_SEL)), q1=WHEEL.px(FW_P1,fsShDeg(FS_SH_SEL));
  s+=`<line id="fsShNeedle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
    +`<circle id="fsShDot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
  const ct=fsShCoreTxt(FS_SH_SEL);
  s+=`<text id="fsShC1" x="${FW_C}" y="${FW_C-16}" class="w-c1">${ct[0]}</text>`
    +`<text id="fsShC2" x="${FW_C}" y="${FW_C+14}" class="w-c2" style="fill:${fwJxFill(d.gongJx[FS_SH_SEL])||'var(--wheel-ink2)'}">${ct[1]}</text>`
    +`<text id="fsShC3" x="${FW_C}" y="${FW_C+34}" class="w-c3">${ct[2]}</text>`;
  return `<svg class="wheel" id="fsShWheel" viewBox="0 0 440 440" role="img" aria-label="三合水法长生十二宫盘：外圈十二宫名，内圈地支方位，点选一宫看该宫断水">${s}</svg>`;
}
window.xjFsShWheelSvg = xjFsShWheelSvg;

/* ===== 生克判吉凶（全站共用） =====
   以人格为我：对方克我判凶，我克对方判半吉，相生与同气判吉。
   三才两轴与三运三格同此一判，各页只把视角折到我这一侧，不另立档位表。 */
function xjWxLuckSelf(code){
  return code === 'beike' ? 'xiong' : (code === 'ke' ? 'xj' : 'ji');
}
window.xjWxLuckSelf = xjWxLuckSelf;

/* ===== 姓名学音律取数（全站共用） =====
   拼音取值带调号，尾位数字是结构索引而非声调，故调由调号判、结构另由尾位取。
   声调、平仄、无调拼音只在此处判，页面与推荐引擎直取，不各存一份调号映射。
   平仄取一二声为平、三四声为仄，轻声与未载读作平，与音律表的档位一致。 */
var XJ_PY_MARKS = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
  'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i', 'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
  'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u', 'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' };
var XJ_PY_TONE = (function () {
  var m = {};
  [['āēīōūǖ', 1], ['áéíóúǘ', 2], ['ǎěǐǒǔǚ', 3], ['àèìòùǜ', 4]].forEach(function (p) {
    p[0].split('').forEach(function (c) { m[c] = p[1]; });
  });
  return m;
})();
function xjPyTone(v){
  var s = String(v == null ? '' : v);
  for (var i = 0; i < s.length; i++) { if (XJ_PY_TONE[s[i]]) return XJ_PY_TONE[s[i]]; }
  return 0;
}
function xjPyPlain(v){
  return String(v == null ? '' : v).replace(/[0-5]$/, '')
    .replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (m) { return XJ_PY_MARKS[m] || m; });
}
function xjPyPingZe(t){ return (t === 3 || t === 4) ? '仄' : '平'; }
/* 声母表（全站共用）：zh、ch、sh 在前，余单声母与 y、w 在后；取声母按最长前缀命中。
   姓名学音律评断与推荐排序同用此表，不各存一份。 */
var XJ_PY_INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
window.xjPyTone = xjPyTone;
window.xjPyPlain = xjPyPlain;
window.xjPyPingZe = xjPyPingZe;
window.XJ_PY_INITIALS = XJ_PY_INITIALS;
