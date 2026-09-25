/* 占星术 VSOP87 星历适配层（基于 astronomy-engine，MIT）
   提供地心黄经：太阳（SunPosition）+ 其余九星（GeoVector→atan2）。
   输入儒略日（UT）与出生参数，输出 0..360 地心黄经（瞬时黄道 true ecliptic of date）。
   本层自包含角度原语 XZ_DEG、XZ_RAD、xz_norm360，供本层与上层排盘引擎共用。 */
'use strict';

/* 角度原语：度弧互化常量、任意角归一到 0..360 */
const XZ_DEG = Math.PI / 180, XZ_RAD = 180 / Math.PI;
function xz_norm360(x){ return ((x % 360) + 360) % 360; }

/* 儒略日 → Date（UT）。astronomy-engine 的 MakeTime 接受 Date 对象（UTC 语义）。 */
function xz_jdToDate(jd){
  const ms = (jd - 2440587.5) * 86400000;
  return new Date(ms);
}

/* 儒略日 ← Date（UT） */
function xz_dateToJd(date){
  return date.getTime() / 86400000 + 2440587.5;
}

/* 月亮黄纬（度）。黄纬由负转正处即升交点（罗睺）。 */
function xz_moonLat(jd){
  return Astronomy.EclipticGeoMoon(Astronomy.MakeTime(xz_jdToDate(jd))).lat;
}

/* 平均升交点黄经（Meeus 48.1），用作数值求解失败时的兜底 */
function xz_meanNode(jd){
  const T = (jd - 2451545.0) / 36525;
  const o = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T
    + T * T * T / 467441 - T * T * T * T / 60616000;
  return ((o % 360) + 360) % 360;
}

/* 二分细化黄纬过零点：a 端黄纬为负、b 端非负 */
function xz_latCross(a, b){
  for(let i = 0; i < 40; i++){
    const m = (a + b) / 2;
    if(xz_moonLat(m) < 0) a = m; else b = m;
  }
  return (a + b) / 2;
}

/* 月亮交点（罗睺 Rahu / 计都 Ketu）。
   在出生时刻前后各约 15 天扫描黄纬过零点取最近者，以该时刻月亮黄经为交点黄经，
   再按交点每日退行 0.0529539° 平移回出生时刻，得真交点近似。 */
function xz_moonNodes(jd){
  const step = 0.5, span = 15.5;
  const cross = [];
  let pj = jd - span, pl = xz_moonLat(pj);
  for(let j = pj + step; j <= jd + span; j += step){
    const l = xz_moonLat(j);
    if(pl < 0 && l >= 0) cross.push(xz_latCross(pj, j));
    pj = j; pl = l;
  }
  if(!cross.length) return {rahu: xz_meanNode(jd), ketu: (xz_meanNode(jd) + 180) % 360};
  let jn = cross[0];
  for(const c of cross) if(Math.abs(c - jd) < Math.abs(jn - jd)) jn = c;
  const e = Astronomy.EclipticGeoMoon(Astronomy.MakeTime(xz_jdToDate(jn)));
  const rahuAtNode = ((e.lon % 360) + 360) % 360;
  const rahu = xz_norm360(rahuAtNode - 0.0529539 * (jd - jn));
  return {rahu, ketu: xz_norm360(rahu + 180)};
}

/* 十星地心黄道坐标（黄经+黄纬）。GeoVector 返回 J2000 赤道坐标，
   须经 Ecliptic 转为真黄道 of date；太阳用 SunPosition、月亮用 EclipticGeoMoon 同帧。 */
function xz_ephem_eclip(jd){
  const t = Astronomy.MakeTime(xz_jdToDate(jd));
  const out = {};
  const sun = Astronomy.SunPosition(t);
  out.sun = {lon: xz_norm360(sun.elon), lat: sun.elat};
  const moon = Astronomy.EclipticGeoMoon(t);
  out.moon = {lon: xz_norm360(moon.lon), lat: moon.lat};
  const bodies = {
    mercury:'Mercury', venus:'Venus', mars:'Mars',
    jupiter:'Jupiter', saturn:'Saturn', uranus:'Uranus', neptune:'Neptune', pluto:'Pluto'
  };
  for(const k in bodies){
    const g = Astronomy.GeoVector(Astronomy.Body[bodies[k]], t, true);
    const e = Astronomy.Ecliptic(g);
    out[k] = {lon: xz_norm360(e.elon), lat: e.elat};
  }
  return out;
}

/* 十星（太阳与八大行星）地心黄经，不含月亮交点，供黄经输出与速度差分复用 */
function xz_lons10(jd){
  const e = xz_ephem_eclip(jd);
  const out = {};
  for(const k in e) out[k] = e[k].lon;
  return out;
}

/* 单颗星体地心黄经（度）。行运时间线二分求精确日时只需一颗星的黄经，
   单独计算避免每次迭代都跑十星全量星历。key 取 sun..pluto 同 xz_lons10。 */
function xz_planetLon(jd, key){
  const t = Astronomy.MakeTime(xz_jdToDate(jd));
  if(key === 'sun') return xz_norm360(Astronomy.SunPosition(t).elon);
  if(key === 'moon') return xz_norm360(Astronomy.EclipticGeoMoon(t).lon);
  const names = {
    mercury:'Mercury', venus:'Venus', mars:'Mars',
    jupiter:'Jupiter', saturn:'Saturn', uranus:'Uranus', neptune:'Neptune', pluto:'Pluto'
  };
  const g = Astronomy.GeoVector(Astronomy.Body[names[key]], t, true);
  return xz_norm360(Astronomy.Ecliptic(g).elon);
}

/* 计算十星地心黄经，并补月亮交点（罗睺、计都）。jd 为出生时刻的儒略日（UT）。 */
function xz_ephem_longitudes(jd){
  const out = xz_lons10(jd);
  const nodes = xz_moonNodes(jd);
  out.rahu = nodes.rahu;
  out.ketu = nodes.ketu;
  return out;
}

/* 十星视运动速度（度/日）：取出生时刻前后各半日的黄经差分，
   差值按 360° 环绕归一到 -180..180，负值即西行（逆行）。 */
function xz_ephem_speeds(jd){
  const a = xz_lons10(jd - 0.5), b = xz_lons10(jd + 0.5);
  const sp = {};
  for(const k in a){
    let d = b[k] - a[k];
    if(d > 180) d -= 360; else if(d < -180) d += 360;
    sp[k] = d;
  }
  return sp;
}

/* 十星地心赤纬（度）：由黄经黄纬转赤道，sinδ = sinβcosε + cosβsinε sinλ。
   出界判定基准为当前黄赤交角 ε（度，太阳可达的最大赤纬）。 */
function xz_ephem_declinations(jd){
  const e = xz_ephem_eclip(jd);
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const epsR = eps * XZ_DEG;
  const out = {};
  for(const k in e){
    const b = e[k].lat * XZ_DEG, l = e[k].lon * XZ_DEG;
    out[k] = Math.asin(Math.sin(b) * Math.cos(epsR) + Math.cos(b) * Math.sin(epsR) * Math.sin(l)) * XZ_RAD;
  }
  return {dec: out, eps};
}
