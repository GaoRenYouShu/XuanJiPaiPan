/* 七政四余排盘引擎（qizheng-engine.js）
   依赖：lunar.js（干支）、astronomy-engine.min.js（星历）、xz-ephem.js（星历适配层）、qizheng-data.js（数据）。
   算法口径（与页面"算法与流派说明"一致）：
   - 七政黄经：astronomy-engine VSOP87 真黄经（xz_lons10）；
   - 四余取"平行度"古典口径：罗睺=平交点（Meeus 48.1，xz_meanNode）、计都=罗+180、
     月孛=月亮平远点（平近点黄经 π + 180，Meeus 级数 83.3532465 + 4069.0137287T）；
   - 紫炁为古典虚点：以 J2000 黄经 0° 为历元、周期 17282.6224 日（日行 0.0208311°）；
   - 过宫：定气=太阳真黄经 30° 分割；恒气=平太阳黄经 30° 分割（中心差方程）；
   - 安命：太阳躔宫起生时、顺数至卯（宫级）；命度双法：果老度级=太阳度−k×30°，天文=ASC；
   - 二十八宿：角宿一（J2000 黄经 203.84°）定界 + 岁差每年东移 50.288 角秒前推；
   - 庙旺按宫曜五行生克：同宫庙、宫生曜旺、曜生宫乐、曜克宫闲、宫克曜陷。 */
'use strict';

/* 角度原语 XZ_DEG、XZ_RAD、xz_norm360 由 assets/xz-ephem.js 提供，本页加载顺序在前 */
function qz_norm360(x){ return ((x % 360) + 360) % 360; }
function qz_norm180(x){ x = qz_norm360(x); return x > 180 ? x - 360 : x; }

function qz_toJd(y, m, d, hh, mi, tz){
  const dt = new Date(0);
  dt.setUTCFullYear(y, m - 1, d);
  dt.setUTCHours(hh, mi, 0, 0);
  return (dt.getTime() - tz * 3600000) / 86400000 + 2440587.5;
}

/* ===== 真太阳时：NOAA 均时差（分钟）+ 经度差 4 分/度 =====
   经度差相对所取时区的中央经线（tz×15°，东八区即 120°E），境外时区同样适用 */
function qz_trueSolar(y, m, d, hh, mi, lon, tz){
  const utc0 = Date.UTC(y, 0, 1);
  const doy = Math.floor((Date.UTC(y, m - 1, d) - utc0) / 86400000) + 1;
  const g = 2 * Math.PI / 365 * (doy - 1 + (hh - 12) / 24);
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const lngAdj = (lon - tz * 15) * 4;
  let tot = hh * 60 + mi + eot + lngAdj;
  let dayShift = 0;
  while(tot < 0){ tot += 1440; dayShift--; }
  while(tot >= 1440){ tot -= 1440; dayShift++; }
  const nh = Math.floor(tot / 60), nm = Math.round(tot % 60);
  return {hh: nh, mi: nm, eot, lngAdj, dayShift, text: '均时差 ' + (eot >= 0 ? '+' : '') + eot.toFixed(1) + ' 分、经度差 ' + (lngAdj >= 0 ? '+' : '') + lngAdj.toFixed(1) + ' 分'};
}

/* ===== 时辰（23-1 子时）===== */
function qz_shiIdx(hh, mi){
  const h = hh + mi / 60;
  return Math.floor(((h + 1) % 24) / 2);
}

/* ===== 太阳中心差（度），恒气过宫用平黄经 = 真黄经 − 中心差 ===== */
function qz_sunEqCenter(T){
  const M = qz_norm360(357.5291092 + 35999.0502909 * T) * QZ_DEG;
  return (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
}

/* ===== 十一曜黄经（平行度四余） ===== */
const QZ_QI_RATE = 360 / 17282.6224; /* 紫炁日行 */
function qz_lons(jd, nodeMode){
  const l = xz_lons10(jd);
  const T = (jd - 2451545.0) / 36525;
  const out = {sun: l.sun, moon: l.moon, mercury: l.mercury, venus: l.venus,
               mars: l.mars, jupiter: l.jupiter, saturn: l.saturn};
  /* 罗睺口径：平交点（古法，默认）或真交点（天文） */
  out.rahu = nodeMode === 'true' ? xz_moonNodes(jd).rahu : xz_meanNode(jd);
  out.ketu = qz_norm360(out.rahu + 180);
  /* 月亮平近点黄经（Meeus）：π = 83.3532465 + 4069.0137287T − 0.0103200T² − T³/80053 + T⁴/18999000 */
  const perigee = 83.3532465 + 4069.0137287 * T - 0.0103200 * T * T
    - T * T * T / 80053 + T * T * T * T / 18999000;
  out.apogee = qz_norm360(perigee + 180);
  out.qi = qz_norm360((jd - 2451545.0) * QZ_QI_RATE);
  return out;
}

/* 顺逆留（七政）：差分 ±0.5 日 */
function qz_speeds(jd){
  const a = xz_lons10(jd - 0.5), b = xz_lons10(jd + 0.5);
  const sp = {};
  ['sun','moon','mercury','venus','mars','jupiter','saturn'].forEach(k => {
    let d = b[k] - a[k];
    if(d > 180) d -= 360; else if(d < -180) d += 360;
    sp[k] = d;
  });
  return sp;
}

/* ===== 过宫：定气（真黄经）/ 恒气（平黄经）30° 分割 ===== */
function qz_gongIdx(lon, qiHeng, jd){
  let x = lon;
  if(qiHeng === 'heng'){
    const T = (jd - 2451545.0) / 36525;
    x = lon - qz_sunEqCenter(T); /* 仅太阳受中心差影响；其余曜随黄道同移，误差 <2° */
  }
  return Math.floor(qz_norm360(x) / 30);
}
/* 宫内入度（过宫口径下重算宫界偏移）：定气=真黄经；恒气以平黄经分割 */
function qz_gongDeg(lon, qiHeng, jd){
  let x = lon;
  if(qiHeng === 'heng'){ const T = (jd - 2451545.0) / 36525; x = lon - qz_sunEqCenter(T); }
  return qz_norm360(x) % 30;
}

/* ===== 上升点 / 中天（Meeus 解析公式，同星占页已验证实现） ===== */
function qz_ascCalc(jd, lon, lat){
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  const lst = qz_norm360(gmst + lon);              /* RAMC */
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const er = eps * QZ_DEG, fr = lat * QZ_DEG, lstR = lst * QZ_DEG;
  const y = Math.cos(lstR);
  const x = -(Math.sin(lstR) * Math.cos(er) + Math.tan(fr) * Math.sin(er));
  const ascLon = qz_norm360(Math.atan2(y, x) * QZ_RAD);
  const mcLon = qz_norm360(Math.atan2(Math.sin(lstR), Math.cos(lstR) * Math.cos(er)) * QZ_RAD);
  return {lon: ascLon, mc: mcLon, ramc: lst, eps};
}

/* ===== 昼夜：太阳地平高度（>0 昼） ===== */
function qz_sunAlt(jd, sunLon, lon, lat){
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const eR = eps * QZ_DEG, lR = sunLon * QZ_DEG, fR = lat * QZ_DEG;
  const dec = Math.asin(Math.sin(eR) * Math.sin(lR));
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  const lst = qz_norm360(gmst + lon) * QZ_DEG;
  const ra = Math.atan2(Math.cos(eR) * Math.sin(lR), Math.cos(lR));
  const H = lst - ra;
  return Math.asin(Math.sin(fR) * Math.sin(dec) + Math.cos(fR) * Math.cos(dec) * Math.cos(H)) * QZ_RAD;
}

/* ===== 安命（宫级）+ 果老度级命度 =====
   sunGongIdx 为太阳躔宫（按所选过宫制）；shiIdx 时辰序（子=0）。
   以太阳躔宫起生时，顺数至卯：时辰顺行（未→申→酉…）每宫一位、宫沿黄经减少方向，
   自生时数至卯共 k = (卯序−生时序) mod 12 步；
   命宫 = 太阳宫逆行（黄经减）k 宫；命度 = 太阳躔度 − k×30°（果老度级法）。
   验证：卯时生人命度即太阳躔度（日出东方，与天文上升点吻合）。 */
function qz_ming(sunGongIdx, sunLon, shiIdx){
  const k = ((3 - shiIdx) % 12 + 12) % 12;
  return {k, gongIdx: ((sunGongIdx - k) % 12 + 12) % 12, du: qz_norm360(sunLon - k * 30)};
}

/* ===== 二十八宿：距星实测黄经定界（SIMBAD J2000 历表值，岁差前推） =====
   觜参倒置：实测参距星黄经已先于觜距星，按距星黄经升序定界，觜参次序随实测对调
   （清《仪象考成》同以实测调整觜参次序）。 */
function qz_xiuBounds(year){
  const t = QZ_PRECESSION * (year - 2000);
  return QZ_XIU28.map((s, i) => ({lon: qz_norm360(s.lon + t), i}))
    .sort((a, b) => a.lon - b.lon);
}
function qz_xiu(lon, year){
  const b = qz_xiuBounds(year);
  const rel = qz_norm360(lon - b[0].lon);
  let cum = 0, chosen = b.length - 1;
  for(let j = 0; j < b.length; j++){
    const end = j === b.length - 1 ? b[0].lon + 360 : b[j + 1].lon;
    if(rel < cum + (end - b[j].lon)){ chosen = j; break; }
    cum += end - b[j].lon;
  }
  const host = QZ_XIU28[b[chosen].i];
  const inDu = qz_norm360(rel - cum);
  const du = Math.floor(inDu) + 1;
  /* 度主轮起：宿属五行起轮；日宿从火起、月宿从水起（与日属火、月属水口径一致） */
  const startWx = host.wx === '日' ? '火' : host.wx === '月' ? '水' : host.wx;
  const idx0 = QZ_DUZHU_CYCLE.indexOf(startWx);
  const next = b[(chosen + 1) % b.length].lon + (chosen === b.length - 1 ? 360 : 0);
  return {nm: host.n, q: host.q, wx: host.wx, total: qz_norm360(next - b[chosen].lon), inDu, du,
          duzhu: QZ_DUZHU_CYCLE[(idx0 + du - 1) % 5],
          txt: host.n + host.q + '宿第' + du + '度'};
}

/* ===== 庙旺：宫曜五行生克 ===== */
const QZ_WX_SHENG = {木:'火', 火:'土', 土:'金', 金:'水', 水:'木'};      /* 我生 */
const QZ_WX_KE   = {木:'土', 土:'水', 水:'火', 火:'金', 金:'木'};      /* 我克 */
function qz_state(lumWx, gongWx){
  if(lumWx === gongWx) return '庙';
  if(QZ_WX_SHENG[gongWx] === lumWx) return '旺';   /* 宫生曜 */
  if(QZ_WX_SHENG[lumWx] === gongWx) return '乐';   /* 曜生宫 */
  if(QZ_WX_KE[lumWx] === gongWx) return '闲';      /* 曜克宫 */
  return '陷';                                     /* 宫克曜 */
}

/* ===== 神煞表（年干支起，落宫为地支宫） ===== */
function qz_sha(gan, zhi){
  const ziIdx = QZ_ZHI.indexOf(zhi);
  const arr = [];
  const push = (nm, z, note) => arr.push({nm, zhi: z, txt: QZ_SHA_TXT[note || nm] || ''});
  const gr = QZ_GUIREN[gan];
  push('天乙贵人（昼）', gr[0], '天乙贵人'); push('天乙贵人（夜）', gr[1], '天乙贵人');
  push('天官贵人', QZ_TIANGUAN[gan]);
  push('禄勋', QZ_LUXUN[gan]);
  const hl = ((3 - ziIdx) % 12 + 12) % 12;
  push('红鸾', QZ_ZHI[hl]); push('天喜', QZ_ZHI[(hl + 6) % 12]);
  const gg = QZ_GUGUA[zhi];
  push('孤辰', gg[0]); push('寡宿', gg[1]);
  for(let i = 0; i < 12; i++) push(QZ_TAISUI12[i], QZ_ZHI[(ziIdx + i) % 12]);
  return arr;
}

/* ===== 格局判定：每条返回判定依据文字，null=不成立 ===== */
const QZ_GEJU_RULES = {
  '日月合璧': c => c.pl.sun.gIdx === c.pl.moon.gIdx
    ? '太阳居' + c.gName(c.pl.sun.gIdx) + '、太阴同宫' : null,
  '日月并明': c => {
    const s = c.dayNight === '昼' ? qz_state('火', c.gWx(c.pl.sun.gIdx)) : qz_state('水', c.gWx(c.pl.moon.gIdx));
    return (s === '庙' || s === '旺') ? (c.dayNight + '生人，' + (c.dayNight === '昼' ? '太阳' : '太阴') + '得地（' + s + '）') : null;
  },
  '五星连珠': c => {
    const five = ['mercury','venus','mars','jupiter','saturn'];
    return five.every(k => c.pl[k].gIdx === c.pl[five[0]].gIdx)
      ? '金木水火土同躔' + c.gName(c.pl[five[0]].gIdx) : null;
  },
  '木火通明': c => c.pl.jupiter.gIdx === c.pl.mars.gIdx
    ? '木星与火星同宫' + c.gName(c.pl.jupiter.gIdx) : null,
  '木月清辉': c => c.pl.jupiter.gIdx === c.pl.moon.gIdx
    ? '木星与太阴同宫' + c.gName(c.pl.jupiter.gIdx) : null,
  '金水相涵': c => c.pl.venus.gIdx === c.pl.mercury.gIdx
    ? '金星与水星同宫' + c.gName(c.pl.venus.gIdx) : null,
  '金水会日月': c => {
    const hit = ['venus','mercury'].filter(k => c.pl[k].gIdx === c.pl.sun.gIdx || c.pl[k].gIdx === c.pl.moon.gIdx);
    return hit.length ? hit.map(k => QZ_LUM_MAP[k].nm).join('、') + '与' +
      (c.pl.venus.gIdx === c.pl.sun.gIdx ? '太阳' : '太阴') + '同宫' : null;
  },
  '水火既济': c => c.pl.mercury.gIdx === c.pl.mars.gIdx
    ? '水星与火星同宫' + c.gName(c.pl.mars.gIdx) : null,
  '日月夹命': c => {
    const a = ((c.mingIdx + 1) % 12 + 12) % 12, b = ((c.mingIdx - 1) % 12 + 12) % 12;
    const ok = [c.pl.sun.gIdx, c.pl.moon.gIdx].every(g => g === a || g === b)
      && c.pl.sun.gIdx !== c.pl.moon.gIdx;
    return ok ? '日月分居' + c.gName(a) + '、' + c.gName(b) + '夹辅命宫' : null;
  },
  '命主入命': c => c.pl[QZ_GONG[c.mingIdx].zhu].gIdx === c.mingIdx
    ? '命主' + QZ_LUM_MAP[QZ_GONG[c.mingIdx].zhu].nm + '入命宫' : null,
  '身命同宫': c => c.pl.moon.gIdx === c.mingIdx
    ? '太阴躔命宫，身命同宫' : null,
  '身居闲极': c => c.pl.moon.gIdx === ((c.mingIdx + 2) % 12 + 12) % 12
    ? '身宫（太阴）落兄弟宫（闲极）' : null,
  '禄主朝元': c => c.pl[c.hua0].gIdx === c.mingIdx
    ? '年干天禄之曜（' + QZ_LUM_MAP[c.hua0].nm + '）入命宫' : null,
  '官福朝阳': c => {
    const guan = ((c.mingIdx + 9) % 12 + 12) % 12, fu = ((c.mingIdx + 10) % 12 + 12) % 12;
    const zg = QZ_GONG[guan].zhu, zf = QZ_GONG[fu].zhu;
    if(c.pl[zg].gIdx === c.pl.sun.gIdx) return '官禄宫主' + QZ_LUM_MAP[zg].nm + '与太阳同宫（朝阳）';
    if(c.pl[zf].gIdx === c.pl.sun.gIdx) return '福德宫主' + QZ_LUM_MAP[zf].nm + '与太阳同宫（朝阳）';
    return null;
  },
  '田财互垣': c => {
    const tian = ((c.mingIdx + 3) % 12 + 12) % 12, cai = ((c.mingIdx + 1) % 12 + 12) % 12;
    const zt = QZ_GONG[tian].zhu, zc = QZ_GONG[cai].zhu;
    return (c.pl[zt].gIdx === cai && c.pl[zc].gIdx === tian)
      ? '田宅主' + QZ_LUM_MAP[zt].nm + '入财帛宫、财帛主' + QZ_LUM_MAP[zc].nm + '入田宅宫' : null;
  },
  '命坐禄勋': c => QZ_GONG[c.mingIdx].zhi === c.luxun ? '禄勋在' + c.luxun + '，恰为命宫' : null,
  '身坐禄勋': c => QZ_GONG[c.pl.moon.gIdx].zhi === c.luxun ? '身宫坐禄勋（' + c.luxun + '宫）' : null,
  '命主飞禄': c => QZ_GONG[c.mingIdx].zhu === c.hua0
    ? '命主星' + QZ_LUM_MAP[c.hua0].nm + '即年干天禄之曜' : null,
  '火金失位': c => c.pl.mars.gIdx === c.pl.venus.gIdx
    ? '火星与金星同宫' + c.gName(c.pl.mars.gIdx) : null,
  '土罗相会': c => c.pl.saturn.gIdx === c.pl.rahu.gIdx
    ? '土星与罗睺同宫' + c.gName(c.pl.saturn.gIdx) : null,
  '计孛同宫': c => c.pl.ketu.gIdx === c.pl.apogee.gIdx
    ? '计都与月孛同宫' + c.gName(c.pl.ketu.gIdx) : null,
  '罗计截断': c => {
    const rel = ['sun','moon','mercury','venus','mars','jupiter','saturn'].map(k => qz_norm360(c.pl[k].lon - c.pl.rahu.lon));
    const allBelow = rel.every(x => x < 180), allAbove = rel.every(x => x > 180);
    return (allBelow || allAbove)
      ? '七政尽聚于罗计一侧（' + (allBelow ? '罗睺后' : '罗睺前') + '半盘）' : null;
  },
  '蚀神临照': c => {
    const hits = ['sun','moon'].map(k => ({k, d: Math.min(Math.abs(qz_norm180(c.pl[k].lon - c.pl.rahu.lon)), Math.abs(qz_norm180(c.pl[k].lon - c.pl.ketu.lon)))}))
      .filter(o => o.d <= 15);
    return hits.length ? hits.map(o => QZ_LUM_MAP[o.k].nm + '距罗计仅 ' + o.d.toFixed(1) + '°').join('、') : null;
  }
};

/* ===== 洞微大限：宫限（命宫起逆行十二宫，含庙旺加减）+ 度级行限 =====
   加减口径（通行简化，页面注明）：宫内每有一庙旺星加 1 年、每有一失陷星减 1 年，
   合计上下限 ±3 年，限年最低 3 年；四余同参。 */
function qz_xianStages(mingIdx, pl){
  const arr = [];
  let age = 0;
  for(let i = 0; i < 12; i++){
    const gIdx = ((mingIdx - i) % 12 + 12) % 12;
    const base = QZ_XIAN_YEARS[QZ_XIAN_ORDER[i]];
    let yrs = base, adj = 0;
    if(pl){
      QZ_LUM.forEach(l => {
        if(pl[l.k].gIdx === gIdx){
          if(pl[l.k].state === '庙') adj += 1;
          else if(pl[l.k].state === '陷') adj -= 1;
        }
      });
      adj = Math.max(-3, Math.min(3, adj));
      yrs = Math.max(3, base + adj);
    }
    arr.push({nm: QZ_XIAN_ORDER[i], gIdx, gong: QZ_GONG[gIdx], from: age, to: age + yrs, yrs, zhu: QZ_GONG[gIdx].zhu, base, adj: pl ? adj : null});
    age += yrs;
  }
  return arr;
}
/* 度级行限年表：限沿黄经减少方向行进（限序逆行十二宫），每年行 30/年限 度 */
const QZ_XIAN_GOOD = {jupiter:'吉', venus:'吉', mercury:'吉', qi:'吉', sun:'吉', moon:'吉',
                      mars:'厉', saturn:'缓', rahu:'凶', ketu:'凶', apogee:'凶'};
function qz_xianRows(stages, lumLon, birthYear, curAge){
  const rows = [];
  stages.forEach(s => {
    const rate = 30 / s.yrs;
    const upper = QZ_GONG[s.gIdx].from + 30;
    for(let e = 0; e < s.yrs; e++){
      const lam = qz_norm360(upper - rate * e);
      const xi = qz_xiu(lam, birthYear);
      const hits = Object.keys(lumLon).filter(k => Math.abs(qz_norm180(lumLon[k] - lam)) <= 1)
        .map(k => QZ_LUM_MAP[k].gl + QZ_LUM_MAP[k].nm + (QZ_XIAN_GOOD[k] ? '（' + QZ_XIAN_GOOD[k] + '）' : ''));
      rows.push({age: s.from + e, gong: s.nm, lam, xiu: xi, hits,
                 cur: curAge >= s.from + e && curAge < s.from + e + 1});
    }
  });
  return rows;
}

/* ===== 总排盘 ===== */
function qz_compute(o){
  /* o: y,m,d,hh,mm,sex,tz,lon,lat,qiHeng('ding'|'heng'),mingFa('guolao'|'asc'),trueSolar */
  let hh = o.hh, mi = o.mm, tsInfo = null;
  if(o.trueSolar){
    tsInfo = qz_trueSolar(o.y, o.m, o.d, o.hh, o.mm, o.lon, o.tz);
    hh = tsInfo.hh; mi = tsInfo.mi;
    if(tsInfo.dayShift !== 0){
      const dt = new Date(0); dt.setUTCFullYear(o.y, o.m - 1, o.d);
      dt.setUTCDate(dt.getUTCDate() + tsInfo.dayShift);
      o.y = dt.getUTCFullYear(); o.m = dt.getUTCMonth() + 1; o.d = dt.getUTCDate();
    }
  }
  const shiIdx = qz_shiIdx(hh, mi);
  const jd = qz_toJd(o.y, o.m, o.d, hh, mi, o.tz);
  const nodeMode = o.nodeMode === 'true' ? 'true' : 'mean';
  const lons = qz_lons(jd, nodeMode);
  const nodeMean = nodeMode === 'true' ? xz_meanNode(jd) : lons.rahu;
  const nodeTrue = nodeMode === 'true' ? lons.rahu : xz_moonNodes(jd).rahu;
  const spd = qz_speeds(jd);
  const year = o.y;

  /* 十二宫与庙旺 */
  const gIdxOf = lon => qz_gongIdx(lon, o.qiHeng, jd);
  const gDeg = lon => qz_gongDeg(lon, o.qiHeng, jd);
  const pl = {};
  QZ_LUM.forEach(l => {
    const gIdx = gIdxOf(lons[l.k]);
    const st = qz_state(l.wx, QZ_GONG[gIdx].zwx);
    const xi = qz_xiu(lons[l.k], year);
    let motion = '';
    if(!l.yu){
      const v = spd[l.k];
      motion = (l.k === 'sun' || l.k === 'moon') ? '顺' : (Math.abs(v) < 0.05 ? '留' : (v < 0 ? '逆' : '顺'));
    } else {
      motion = (l.k === 'rahu' || l.k === 'ketu') ? '逆（平行度）' : '顺（平行度）';
    }
    pl[l.k] = {k: l.k, lon: lons[l.k], gIdx, gong: QZ_GONG[gIdx], deg: gDeg(lons[l.k]), state: st, xiu: xi, motion, spd: l.yu ? null : spd[l.k], yu: l.yu};
  });

  /* 昼夜、ASC/MC */
  const alt = qz_sunAlt(jd, lons.sun, o.lon, o.lat);
  const dayNight = alt > 0 ? '昼' : '夜';
  const asc = qz_ascCalc(jd, o.lon, o.lat);

  /* 安命安身 */
  const sunGIdx = pl.sun.gIdx;
  const mg = qz_ming(sunGIdx, lons.sun, shiIdx);
  const mingIdx = mg.gongIdx;
  const mingDu = o.mingFa === 'asc' ? asc.lon : mg.du;
  const mingDuAlt = o.mingFa === 'asc' ? mg.du : asc.lon;
  const mingDuXiu = qz_xiu(mingDu, year);
  const shenIdx = pl.moon.gIdx;
  const shenDuXiu = qz_xiu(lons.moon, year);

  /* 干支（lunar.js，年柱按立春交接 Exact） */
  const solar = Solar.fromYmdHms(o.y, o.m, o.d, hh, mi, 0);
  const lunar = solar.getLunar();
  const yGZ = lunar.getYearInGanZhiExact();
  const gan = yGZ[0], zhi = yGZ[1];

  /* 化曜与神煞 */
  const hua = QZ_HUA10[gan];
  const hua0 = hua[0];
  const shas = qz_sha(gan, zhi);
  const shaByGong = {};
  shas.forEach(s => {
    const gi = QZ_GONG_MAP[s.zhi].idx;
    (shaByGong[gi] = shaByGong[gi] || []).push(s);
  });

  /* 蚀神临照 */
  const eclipse = ['sun','moon'].map(k => ({k, d: Math.min(Math.abs(qz_norm180(lons[k] - lons.rahu)), Math.abs(qz_norm180(lons[k] - lons.ketu)))})).filter(x => x.d <= 15);

  /* 格局 */
  const c = {
    pl, mingIdx, dayNight, gan, zhi, hua0,
    luxun: QZ_LUXUN[gan],
    gName: i => QZ_GONG[((i % 12) + 12) % 12].zhi + '宫' + QZ_GONG[((i % 12) + 12) % 12].nm,
    gWx: i => QZ_GONG[((i % 12) + 12) % 12].zwx
  };
  const geju = QZ_GEJU.map(g => {
    const basis = QZ_GEJU_RULES[g.nm] ? QZ_GEJU_RULES[g.nm](c) : null;
    return basis ? Object.assign({}, g, {basis}) : null;
  }).filter(Boolean);

  /* 限运（启用庙旺加减） */
  const xian = qz_xianStages(mingIdx, pl);
  const now = new Date();
  const ageNow = Math.max(0, (now - new Date(o.y, o.m - 1, o.d, hh, mi)) / (365.25 * 86400000));
  const xianRows = qz_xianRows(xian, lons, year, ageNow);
  const curXian = xian.find(s => ageNow >= s.from && ageNow < s.to) || xian[0];

  /* 六亲专项（父母=相貌宫，余按人盘宫序） */
  const qinIdx = {父母: 11, 兄弟: 2, 妻妾: 6, 子女: 4, 财帛: 1, 官禄: 9};
  const qin = QZ_QIN_KEYS.map(nm => {
    const hi = ((mingIdx + qinIdx[nm]) % 12 + 12) % 12;
    const g = QZ_GONG[hi];
    const zhu = g.zhu;
    const inner = QZ_LUM.filter(l => pl[l.k].gIdx === hi).map(l => l.nm);
    const sha = shaByGong[hi] || [];
    return {nm, gIdx: hi, gong: g, zhu, zhuPl: pl[zhu], inner, sha,
            txt: QZ_QIN[nm][zhu]};
  });

  return {
    y: o.y, m: o.m, d: o.d, hh: o.hh, mm: o.mm, sex: o.sex, tz: o.tz, lon: o.lon, lat: o.lat,
    trueSolar: o.trueSolar, tsInfo, shiIdx, shiNm: QZ_SHICHEN[shiIdx],
    qiHeng: o.qiHeng, mingFa: o.mingFa,
    jd, lons, pl, dayNight, sunAlt: alt, asc, mingIdx, mingDu, mingDuAlt, mingDuXiu,
    nodeMode, nodeMean, nodeTrue, nodeDiff: Math.abs(qz_norm180(nodeTrue - nodeMean)),
    mgK: mg.k, shenIdx, shenDuXiu, yGZ, gan, zhi,
    mGZ: lunar.getMonthInGanZhiExact(), dGZ: lunar.getDayInGanZhi(), hGZ: lunar.getTimeInGanZhi(),
    hua, shas, shaByGong, geju, eclipse, xian, xianRows, ageNow, curXian, qin,
    lunarStr: '农历' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese()
  };
}

/* ===== 流年盘（以流年立春交节时刻天象，对照本命十二宫） =====
   流年曜入本命宫释义直接复用曜×宫释义（QZ_YAO_GONG）；宫界随本命过宫制。 */
function qz_liunian(c, year){
  const baseLunar = Solar.fromYmd(year, 2, 1).getLunar();
  const jq = baseLunar.getJieQiTable();
  const lq = jq['立春'];
  if(!lq) return null;
  const jd = qz_toJd(lq.getYear(), lq.getMonth(), lq.getDay(), lq.getHour(), lq.getMinute(), 8);
  const lons = qz_lons(jd, c.nodeMode);
  const lLunar = Solar.fromYmdHms(lq.getYear(), lq.getMonth(), lq.getDay(), lq.getHour(), lq.getMinute(), 0).getLunar();
  const yGZ = lLunar.getYearInGanZhiExact();
  const hua = QZ_HUA10[yGZ[0]];
  const shas = qz_sha(yGZ[0], yGZ[1]);
  const items = QZ_LUM.map(l => {
    const gIdx = qz_gongIdx(lons[l.k], c.qiHeng, jd);
    const hi = ((gIdx - c.mingIdx) % 12 + 12) % 12;
    const g = QZ_GONG[gIdx];
    return {k: l.k, nm: l.nm, gl: l.gl, yu: l.yu, lon: lons[l.k],
            gIdx, gZhi: g.zhi, gNm: g.nm, house: QZ_HOUSES[hi], houseIdx: hi,
            state: l.yu ? '' : qz_state(l.wx, g.zwx), txt: QZ_YAO_GONG[l.k][g.zhi]};
  });
  const conj = [];
  items.forEach(it => {
    QZ_LUM.forEach(p => {
      if(p.k !== it.k && Math.abs(qz_norm180(c.lons[p.k] - it.lon)) <= 1)
        conj.push('流' + it.nm + '会本命' + p.nm);
    });
  });
  return {year, yGZ, gan: yGZ[0], zhi: yGZ[1], jd,
          liChun: lq.getYear() + ' 年 ' + lq.getMonth() + ' 月 ' + lq.getDay() + ' 日 ' + lq.getHour() + ':' + String(lq.getMinute()).padStart(2, '0'),
          hua, shas, items, conj,
          hua0Nm: QZ_LUM_MAP[hua[0]].nm};
}

/* ===== 七政择时（天象格局 + 庙旺评分扫描） =====
   评分口径：吉格每格 +10、忌格每格 −8；七政每庙 +3、每旺 +2、每陷 −2；
   日月犯蚀神临照 −6。两段扫描：粗扫 120 分钟一步，候选取前 24 再以 20 分钟细化。
   限 60 日内。择时无命宫，仅取不依赖安命的格局。 */
const QZ_ZS_GEJU = ['日月合璧','五星连珠','木火通明','木月清辉','金水相涵','金水会日月','水火既济','火金失位','土罗相会','计孛同宫'];
/* 择时快速星历：只需日月五星（5 次 GeoVector）+ 公式化四余，跳过天海冥与黄纬，速度约快 4 倍 */
function qz_lons7(jd){
  const t = Astronomy.MakeTime(xz_jdToDate(jd));
  const out = {};
  out.sun = xz_norm360(Astronomy.SunPosition(t).elon);
  out.moon = xz_norm360(Astronomy.EclipticGeoMoon(t).lon);
  const bodies = {mercury:'Mercury', venus:'Venus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturn'};
  for(const k in bodies){
    const g = Astronomy.GeoVector(Astronomy.Body[bodies[k]], t, true);
    out[k] = xz_norm360(Astronomy.Ecliptic(g).elon);
  }
  out.rahu = xz_meanNode(jd);
  out.ketu = qz_norm360(out.rahu + 180);
  const T = (jd - 2451545.0) / 36525;
  const perigee = 83.3532465 + 4069.0137287 * T - 0.0103200 * T * T - T * T * T / 80053 + T * T * T * T / 18999000;
  out.apogee = qz_norm360(perigee + 180);
  out.qi = qz_norm360((jd - 2451545.0) * QZ_QI_RATE);
  return out;
}
function qz_zejiLite(jd, qiHeng){
  const lons = qz_lons7(jd);
  const pl = {};
  QZ_LUM.forEach(l => {
    const gIdx = qz_gongIdx(lons[l.k], qiHeng, jd);
    pl[l.k] = {k: l.k, lon: lons[l.k], gIdx, state: l.yu ? '闲' : qz_state(l.wx, QZ_GONG[gIdx].zwx), yu: l.yu};
  });
  const c = {pl, dayNight: '昼',
             gName: i => QZ_GONG[((i % 12) + 12) % 12].zhi + '宫' + QZ_GONG[((i % 12) + 12) % 12].nm,
             gWx: i => QZ_GONG[((i % 12) + 12) % 12].zwx};
  const hits = [];
  let score = 0;
  QZ_ZS_GEJU.forEach(nm => {
    const r = QZ_GEJU_RULES[nm](c);
    if(r){
      const g = QZ_GEJU.find(x => x.nm === nm);
      score += g.ji ? -8 : 10;
      hits.push({nm, ji: g.ji, basis: r});
    }
  });
  QZ_LUM.filter(l => !l.yu).forEach(l => {
    const st = pl[l.k].state;
    if(st === '庙'){ score += 3; } else if(st === '旺'){ score += 2; } else if(st === '陷'){ score -= 2; }
  });
  const ecl = ['sun','moon'].some(k => Math.min(Math.abs(qz_norm180(lons[k] - lons.rahu)), Math.abs(qz_norm180(lons[k] - lons.ketu))) <= 15);
  if(ecl) score -= 6;
  const alt = qz_sunAlt(jd, lons.sun, 116.41, 39.9); /* 昼夜仅作标注，不参与评分 */
  return {jd, score, hits, ecl, dayNight: alt > 0 ? '昼' : '夜',
          strong: QZ_LUM.filter(l => !l.yu && (pl[l.k].state === '庙' || pl[l.k].state === '旺')).map(l => l.nm)};
}
function qz_zejiScan(y1, m1, d1, y2, m2, d2, qiHeng){
  const jd1 = qz_toJd(y1, m1, d1, 0, 0, 8), jd2 = qz_toJd(y2, m2, d2, 23, 59, 8);
  if(jd2 <= jd1) return {err: '结束日期须晚于开始日期'};
  if(jd2 - jd1 > 61) return {err: '日期跨度请控制在 60 日以内'};
  const coarse = [];
  for(let jd = jd1; jd <= jd2; jd += 180 / 1440){
    coarse.push(qz_zejiLite(jd, qiHeng));
  }
  coarse.sort((a, b) => b.score - a.score);
  const refined = [];
  coarse.slice(0, 16).forEach(c0 => {
    for(let t = -2; t <= 2; t += 20 / 1440){
      if(t === 0) continue;
      const jd = c0.jd + t;
      if(jd < jd1 || jd > jd2) continue;
      refined.push(qz_zejiLite(jd, qiHeng));
    }
  });
  const all = coarse.concat(refined).sort((a, b) => b.score - a.score);
  const seen = {}, top = [];
  for(const c of all){
    const d = xz_jdToDate(c.jd);
    const local = new Date(d.getTime() + 8 * 3600000);
    const key = local.getUTCFullYear() + '-' + (local.getUTCMonth() + 1) + '-' + local.getUTCDate();
    if(seen[key]) continue;
    seen[key] = 1;
    top.push({score: c.score, hits: c.hits, ecl: c.ecl, dayNight: c.dayNight,
              y: local.getUTCFullYear(), m: local.getUTCMonth() + 1, d: local.getUTCDate(),
              hm: String(local.getUTCHours()).padStart(2, '0') + ':' + String(local.getUTCMinutes()).padStart(2, '0')});
    if(top.length >= 12) break;
  }
  return {top};
}

/* ===== 双人对照盘 ===== */
const QZ_REL_TXT = {
  '同宫': '命宫同躔，气性相投，成败同频，宜同心共事。',
  '三合': '命宫三合，气味相投而各展其长，助力绵长。',
  '对冲': '命宫对冲，互补互吸亦互磨，聚散分明，贵在互让。',
  '相隔': '命宫相隔，气场平行，宜以事合不以情拘。'
};
function qz_rel(cA, cB){
  const diff = ((cB.mingIdx - cA.mingIdx) % 12 + 12) % 12;
  const relKey = diff === 0 ? '同宫' : (diff === 4 || diff === 8) ? '三合' : diff === 6 ? '对冲' : '相隔';
  const relTxt = relKey === '相隔' ? QZ_REL_TXT['相隔'].replace('相隔', '相隔' + diff + '位') : QZ_REL_TXT[relKey];
  const zhuTo = (zhuK, dst) => {
    const gIdx = dst.pl[zhuK].gIdx;
    const hi = ((gIdx - dst.mingIdx) % 12 + 12) % 12;
    const g = QZ_GONG[gIdx];
    return {nm: QZ_LUM_MAP[zhuK].nm, gZhi: g.zhi, gNm: g.nm, house: QZ_HOUSES[hi], txt: QZ_YAO_GONG[zhuK][g.zhi]};
  };
  const yuRows = [];
  QZ_LUM.filter(l => l.yu).forEach(l => {
    const gA = QZ_GONG[cA.pl[l.k].gIdx], gB = QZ_GONG[cB.pl[l.k].gIdx];
    const hB = ((cA.pl[l.k].gIdx - cB.mingIdx) % 12 + 12) % 12;
    const hA = ((cB.pl[l.k].gIdx - cA.mingIdx) % 12 + 12) % 12;
    yuRows.push({nm: l.nm,
                 toB: '入对方' + QZ_HOUSES[hB] + '（' + gB.zhi + '宫' + gB.nm + '）',
                 toBTxt: QZ_YAO_GONG[l.k][gB.zhi],
                 toA: '入对方' + QZ_HOUSES[hA] + '（' + gA.zhi + '宫' + gA.nm + '）',
                 toATxt: QZ_YAO_GONG[l.k][gA.zhi]});
  });
  const guiA = cA.shas.filter(s => s.nm.indexOf('天乙贵人') === 0);
  const guiB = cB.shas.filter(s => s.nm.indexOf('天乙贵人') === 0);
  return {diff, relKey, relTxt, mingZhuA: mingZhuText(cA, cB), mingZhuB: mingZhuText(cB, cA),
          shenA: zhuTo('moon', cB), shenB: zhuTo('moon', cA),
          guiA: guiA.map(s => ({nm: s.nm, zhi: s.zhi, house: QZ_HOUSES[((QZ_GONG_MAP[s.zhi].idx - cB.mingIdx) % 12 + 12) % 12]})),
          guiB: guiB.map(s => ({nm: s.nm, zhi: s.zhi, house: QZ_HOUSES[((QZ_GONG_MAP[s.zhi].idx - cA.mingIdx) % 12 + 12) % 12]})),
          yuRows,
          dayA: cA.dayNight, dayB: cB.dayNight};
}
function mingZhuText(src, dst){
  const zhuK = QZ_GONG[src.mingIdx].zhu;
  const gIdx = dst.pl[zhuK].gIdx;
  const hi = ((gIdx - dst.mingIdx) % 12 + 12) % 12;
  const g = QZ_GONG[gIdx];
  return {nm: QZ_LUM_MAP[zhuK].nm, st: src.pl[zhuK].state, gZhi: g.zhi, gNm: g.nm, house: QZ_HOUSES[hi], txt: QZ_YAO_GONG[zhuK][g.zhi]};
}
