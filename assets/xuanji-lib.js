/* ============================================================
 * xuanji-lib.js 玄机排盘站点级共享支撑库（跨模块共享工具与常量）
 *   内容：地支六冲判定、五行干支纳音上色引擎、梅花易数先天数、
 *         十神象短语、湿燥土判定、公历闰年月长、真太阳时校正、十二支方位。
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
    if(inTag[i]){ out+=ch; continue; }            // 标签/属性原样保留
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

/* ---------- 某五行相对日主的关系（十神象短语）---------- */
function wxRelToDay(dwx, w){
  if(w === dwx) return '比和（比劫象）';
  if(WX_SHENG[w] === dwx) return '生日主（印象）';
  if(WX_SHENG[dwx] === w) return '日主所生（食伤象）';
  if(WX_KE[w] === dwx) return '克日主（官杀象）';
  if(WX_KE[dwx] === w) return '日主所克（财象）';
  return '';
}
window.wxRelToDay = wxRelToDay;

/* ---------- 关系词 → 十神象标签 ---------- */
function godLabel(rel){ return rel === '克日主' ? '官杀象' : rel === '生日主' ? '印象' : rel === '日主所生' ? '食伤象' : rel === '日主所克' ? '财象' : '比劫象'; }
window.godLabel = godLabel;

/* ---------- 湿土、燥土判定 ---------- */
function earthKind(z){ if(z==='辰'||z==='丑') return '湿土'; if(z==='戌'||z==='未') return '燥土'; return ''; }

window.earthKind = earthKind;

/* ---------- 公历闰年、月长（proleptic Gregorian 规则；兼容公元 1 年起，避免 new Date 把两位数年误映射到 1900-1999） ---------- */
function isLeapYear(yy){ return (yy%4===0 && yy%100!==0) || (yy%400===0); }
function daysOfMonth(yy, mo){
  if(mo===2) return isLeapYear(yy) ? 29 : 28;
  return [31,28,31,30,31,30,31,31,30,31,30,31][mo-1];
}

/* ---------- 真太阳时校正（本地天文算法，参考寿星天文历 EoT）----------
   真太阳时 = 平太阳时(北京时间) + 均时差(EoT) + (当地经度 - 120°)×4 分
   均时差采用 NOAA 标准公式（分钟）；不使用原生 new Date，
   避免公元 1-99 年被浏览器映射为 1900-1999 年。 */
function trueSolarTime(y,m,d,h,mi,lng){
  // 年内第几天（1-based），proleptic Gregorian 规则
  let doy = d;
  for(let mo=1; mo<m; mo++) doy += daysOfMonth(y, mo);
  const g = 2*Math.PI/365.24 * (doy - 1);
  const E = 229.18*(0.000075 + 0.001868*Math.cos(g) - 0.032077*Math.sin(g)
        - 0.014615*Math.cos(2*g) - 0.040849*Math.sin(2*g));
  const lngAdj = (lng - 120) * 4;
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
    totalAdj: Math.round(totalAdj*100)/100
  };
}

/* ===== 十二支方位（周公解梦、太岁、择日、风水等跨模块共用） =====
   口径：十二支归并八方位（子北、卯东、午南、酉西；丑寅东北、辰巳东南、未申西南、戌亥西北），
   与老黄历页岁煞行 ZHI_FANG、择日引擎 ZHI_BAGUA、风水页 taiSuiFang 口径一致；
   bazi-data.js 另有同名 const（八字域内部使用），加载顺序在 xuanji-lib 之前或之后的页面均以本表为跨模块消费真源 */
window.ZHI_FANG = window.ZHI_FANG || {子:'北',丑:'东北',寅:'东北',卯:'东',辰:'东南',巳:'东南',午:'南',未:'西南',申:'西南',酉:'西',戌:'西北',亥:'西北'};
