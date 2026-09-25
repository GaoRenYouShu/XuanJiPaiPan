/* 藏历（时轮历）排算引擎 ， 唯一真源
   算法：Svante Janson《Tibetan Calendar Mathematics》(2007, rev.2014) 纯代数解，
         浦派 Phugpa 常数；蒙古新甘丹、不丹两派仅换历元与少数常数，同引擎承载。
   许可：移植自 MIT 项目 @hnw/date-tibetan（Copyright Yoshio HANAWA），常数与公式源自上引论文。
   单位约定：太阴日序 d 取 1 至 30；n 为自历元起的真月计数；角度以周为单位（1 = 360 度）。
   时区约定：各派历算以当地平太阳时为准，日界为当地天明（取真日期跨日判定），
             本引擎按 Janson 折算为 JD_OFFSET_STD_TIME + JD_OFFSET_DAY_START 两个常量偏移。
*/
/* 三派参数档：M* 为太阴月与太阴日常数，S* 为平太阳黄经，A* 为月近点，P0 为历元闰余 */
const ZL_SCHOOLS={
  'phugpa':{'name':'浦派','en':'Phugpa',
    'M0':2015501+4783/5656,'M1':167025/5656,'M2':11135/11312,
    'S0':743/804,'S1':65/804,'S2':13/4824,
    'A0':475/3528,'A1':253/3528,'A2':1/28,
    'P0':139/180,'epochYear':806,'tz':(6+4/60)/24,'bhutanLeap':false,'rabbyung':1027},
  'mongolian':{'name':'蒙古新甘丹','en':'Mongolian',
    'M0':2359237+2603/2828,'M1':167025/5656,'M2':11135/11312,
    'S0':397/402,'S1':65/804,'S2':13/4824,
    'A0':1523/1764,'A1':253/3528,'A2':1/28,
    'P0':209/270,'epochYear':1747,'tz':8/24,'bhutanLeap':false,'rabbyung':1027},
  'bhutan':{'name':'不丹','en':'Bhutanese',
    'M0':2361807+52/707,'M1':167025/5656,'M2':11135/11312,
    'S0':1+1/67,'S1':65/804,'S2':13/4824,
    'A0':17/147,'A1':253/3528,'A2':1/28,
    'P0':31/40,'epochYear':1754,'tz':6/24,'bhutanLeap':true,'rabbyung':1027},
  /* 楚尔派：Janson 附录 A.2 历元 E1732（儒略日 2353745，公历 1732 年 3 月 26 日），
     均行常数同浦派，仅历元值 m0、s0、a0 不同；闰余指数 beta* 取 59，即 beta 取 142，
     由 alpha = 12*(S0 - P0) = 19142/9045 推得（P0 = -25/108） */
  'tsurphu':{'name':'楚尔派','en':'Tsurphu',
    'M0':2353745+1795153/7635600,'M1':167025/5656,'M2':11135/11312,
    'S0':-5983/108540,'S1':65/804,'S2':13/4824,
    'A0':207/392,'A1':253/3528,'A2':1/28,
    'P0':-25/108,'epochYear':1732,'tz':(6+4/60)/24,'bhutanLeap':false,'rabbyung':1027},
  /* 迥孜非算法派，乃元素占星的年界定义：岁首取虎月即藏历十一月，算例全同浦派 */
  'jungtsi':{'name':'迥孜（岁首虎月）','en':'Jungtsi',
    'M0':2015501+4783/5656,'M1':167025/5656,'M2':11135/11312,
    'S0':743/804,'S1':65/804,'S2':13/4824,
    'A0':475/3528,'A1':253/3528,'A2':1/28,
    'P0':139/180,'epochYear':806,'tz':(6+4/60)/24,'bhutanLeap':false,'rabbyung':1027,'newYearMonth':11}
};
/* 月行、日行不均等的传统线性插值表（时轮历给定的分段折线） */
const ZL_MOON_TAB=[0,5,10,15,19,22,24,25];
const ZL_SUN_TAB=[0,6,10,11];

function zlSchool(k){ return ZL_SCHOOLS[k]||ZL_SCHOOLS['phugpa']; }

/* 公历 ↔ 儒略日数（JDN，整数，正午起算）：Janson 算法全程以 JDN 为输入输出 */
function zlGregToJdn(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
function zlJdnToGreg(jdn){
  const a=jdn+32044, b=Math.floor((4*a+3)/146097), c=a-Math.floor(146097*b/4);
  const d2=Math.floor((4*c+3)/1461), e=c-Math.floor(1461*d2/4), mo=Math.floor((5*e+2)/153);
  return {'y':100*b+d2-4800+Math.floor(mo/10),'m':mo+3-12*Math.floor(mo/10),'d':e-Math.floor((153*mo+2)/5)+1};
}
function zlToFixed(v,n){ return parseFloat(v.toFixed(n)); }

/* 闰月判定的两个中间量（Janson 式 C.12、C.19） */
function zlAlpha(sch){ return 12*(sch.S0-sch.P0); }
function zlBeta(sch){ return Math.ceil(67*zlAlpha(sch))-(sch.bhutanLeap?2:0); }

/* 折线插值：表以半周期为对称，过半周期反号（时轮历对月亮与太阳不均匀性的传统处理） */
function zlInterp(x,tab,half,period){
  let v=x%period; if(v<0) v+=period;
  let sign=1; const sym=half*2;
  if(v>=sym){ sign=-1; v-=sym; }
  if(v>half) v=sym-v;
  const i=Math.floor(v), f=v-i;
  let t;
  if(i<0) t=tab[0];
  else if(i>=tab.length-1) t=tab[tab.length-1];
  else t=tab[i]*(1-f)+tab[i+1]*f;
  return sign*t;
}

/* 真日期（gza' dag）：真月计数 n、太阴日序 d 所对应的太阳日时刻（Janson 第 7 节式 7.22） */
function zlTrueDate(sch,n,d){
  const meanDate=n*sch.M1+d*sch.M2+sch.M0;
  let meanSun=n*sch.S1+d*sch.S2+sch.S0; meanSun-=Math.floor(meanSun);
  let anomalyMoon=n*sch.A1+d*sch.A2+sch.A0; anomalyMoon-=Math.floor(anomalyMoon);
  const moonEqu=zlInterp(28*anomalyMoon,ZL_MOON_TAB,7,28);
  let anomalySun=meanSun-1/4; anomalySun-=Math.floor(anomalySun);
  const sunEqu=zlInterp(12*anomalySun,ZL_SUN_TAB,3,12);
  return meanDate+moonEqu/60-sunEqu/60;
}

/* 饶迥 ↔ 公历年：第 1 饶迥第 1 年为公元 1027 年 */
function zlCycleYearOf(gyear){
  return {'cycle':Math.floor((gyear-1027)/60)+1,'year':((gyear-1027)%60)+1};
}
/* 岁首月：常例为正月，迥孜为虎月即十一月 */
function zlNewYearMonth(sch){ return sch.newYearMonth||1; }
/* 该日所属年号：月序已达岁首月者归次年 */
function zlYearOf(sch,t){
  const nym=zlNewYearMonth(sch);
  return (nym>1&&t.month>=nym)?t.gyear+1:t.gyear;
}
/* 该派该年岁首（洛萨）公历日：迥孜岁首在上一藏历年的虎月初一 */
function zlLosar(schoolKey,gyear){
  const sch=zlSchool(schoolKey);
  const nym=zlNewYearMonth(sch);
  const y=(nym>1)?gyear-1:gyear;
  const cy=zlCycleYearOf(y);
  /* 岁首月若置闰，取在前的闰月（不丹闰月在后，仍取正月的第一个月）；
     初一日若逢重日，取重复对中的第一日 */
  const leap=(!sch.bhutanLeap)&&zlIsLeapMonth(schoolKey,y,nym);
  return zlToGregorian(schoolKey,cy.cycle,cy.year,nym,leap,1,true);
}
/* 真月计数 → 藏历年月（Janson 式 C.59） */
function zlMonthFromCount(sch,n){
  const beta=zlBeta(sch);
  const x=Math.ceil((65*n+beta)/67);
  let M=x%12; if(M===0) M=12;
  const Y=(x-M)/12+sch.epochYear;
  const leapX=Math.ceil((65*(sch.bhutanLeap?n-1:n+1)+beta)/67);
  const cy=zlCycleYearOf(Y);
  return {'cycle':cy.cycle,'year':cy.year,'gyear':Y,'month':M,'leapMonth':(x===leapX)};
}
/* 藏历年月 → 真月计数（Janson 式 C.25） */
function zlCountFromMonth(sch,gyear,month,leapMonth){
  const alpha=zlAlpha(sch);
  const Mp=12*(gyear-sch.epochYear)+month;
  const n=Math.floor(67*(Mp-alpha)/65);
  if(zlIsLeapMonthSch(sch,gyear,month)&&leapMonth) return n+(sch.bhutanLeap?1:-1);
  return n;
}
/* 该年该月是否置闰（Janson 式 C.27）：sch 为参数档，schoolKey 为档名 */
function zlIsLeapMonthSch(sch,gyear,month){
  const beta=zlBeta(sch);
  const Mp=12*(gyear-sch.epochYear)+month;
  const r=(Mp*2-beta)%65;
  const rr=(r<0)?r+65:r;
  return (rr===0||rr===1);
}
function zlIsLeapMonth(schoolKey,gyear,month){
  return zlIsLeapMonthSch(zlSchool(schoolKey),gyear,month);
}

/* 公历日 → 藏历：先估真月计数与日序，再用真日期迭代收敛（重日即两日同一日序） */
function zlFromJdnLocal(sch,jdnLocal){
  const jdn=Math.trunc(zlToFixed(jdnLocal,7));
  const sdf=jdn-sch.M0;
  let n=Math.floor(sdf/sch.M1);
  let day=Math.floor((sdf-n*sch.M1)/sch.M2);
  let leapDay=false;
  for(let i=0;i<3;i++){
    const td=zlTrueDate(sch,n,day);
    if(td>jdn+1){ leapDay=true; break; }   /* 日序重复：此日为闰日（重复对中的第一日） */
    if(td>jdn) break;
    day++;
  }
  if(day===0){ n--; day=30; }
  if(day>30){ n++; day-=30; }
  const mo=zlMonthFromCount(sch,n);
  return {'cycle':mo.cycle,'year':mo.year,'gyear':mo.gyear,'jyear':zlYearOf(sch,mo),'month':mo.month,
    'leapMonth':mo.leapMonth,'day':day,'leapDay':leapDay,'count':n,'jdn':jdn};
}
function zlFromGregorian(schoolKey,y,m,d){
  const sch=zlSchool(schoolKey);
  return zlFromJdnLocal(sch,zlGregToJdn(y,m,d));
}

/* 藏历 → 公历：反查真日期并判别重日、缺日（Janson 第 8 节式 8.1） */
function zlToJdn(schoolKey,cycle,year,month,leapMonth,day,leapDay){
  const sch=zlSchool(schoolKey);
  const gyear=1027+(cycle-1)*60+(year-1);
  const n=zlCountFromMonth(sch,gyear,month,leapMonth);
  const td=zlTrueDate(sch,n,day);
  let jdn=Math.floor(td);
  const prev=Math.floor(zlTrueDate(sch,n,day-1));
  const skipped=(jdn===prev);       /* 缺日：该日序无对应太阳日 */
  const repeated=(jdn===prev+2);    /* 重日：该日序占两个太阳日，闰日取其前一日 */
  if(repeated&&leapDay) jdn-=1;
  if(skipped) jdn+=1;
  const g=zlJdnToGreg(jdn);
  return {'jdn':jdn,'y':g.y,'m':g.m,'d':g.d,'skipped':skipped,'repeated':repeated};
}
function zlToGregorian(schoolKey,cycle,year,month,leapMonth,day,leapDay){
  return zlToJdn(schoolKey,cycle,year,month,leapMonth,day,leapDay);
}

/* 该年该月逐日排布：重日标闰、缺日留空，供日历网格与殊胜日表使用 */
function zlMonthDays(schoolKey,gyear,month,leapMonth){
  const sch=zlSchool(schoolKey);
  const n=zlCountFromMonth(sch,gyear,month,leapMonth);
  const cy=zlCycleYearOf(gyear);
  const out=[];
  for(let d=1;d<=30;d++){
    const r=zlToJdn(schoolKey,cy.cycle,cy.year,month,leapMonth,d,false);
    if(r.skipped) continue;
    /* 重日：闰日（重复对中的第一日）在前，正日在后 */
    if(r.repeated){
      const r2=zlToJdn(schoolKey,cy.cycle,cy.year,month,leapMonth,d,true);
      out.push({'day':d,'y':r2.y,'m':r2.m,'d':r2.d,'leapDay':true});
    }
    out.push({'day':d,'y':r.y,'m':r.m,'d':r.d,'repeated':r.repeated});
  }
  return out;
}
window.ZL_SCHOOLS=ZL_SCHOOLS;
window.zlFromGregorian=zlFromGregorian;
window.zlToGregorian=zlToGregorian;
window.zlMonthDays=zlMonthDays;
window.zlIsLeapMonth=zlIsLeapMonth;
window.zlGregToJdn=zlGregToJdn;
window.zlJdnToGreg=zlJdnToGreg;
window.zlLosar=zlLosar;
window.zlYearOf=zlYearOf;
window.zlCycleYearOf=zlCycleYearOf;
