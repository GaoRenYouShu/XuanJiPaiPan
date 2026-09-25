/* ============================================================
   磁偏角 fs-mag.js（WMM2025 世界地磁模型）
   用途：风水两页按所在地经纬度求当地磁偏角，供罗盘实测坐度折算真北。
   主源：本件内置 WMM2025 球谐系数，离线即可算，模型有效期 2025.0 至 2030.0。
   备源：BGS（英国地质调查局）WMM 接口，供校验与模型过期后取值；取不到即静默回退离线值。
   口径：东偏为正、西偏为负（中国东部为负，新疆一带为正）；真方位＝磁方位＋磁偏角；
        海拔按 0 公里计；年变率随系数逐年外推，不另存年变表。
   数据来源：NOAA 发布的世界地磁模型 WMM2025 系数（公有领域）；球谐展开依 NOAA 技术报告算法，
        与 magvar 2.2.0（MIT，Darren Yeates）同构。
   取数：经纬度一律经 assets/latlng.js 的 findLng、findLat、coordOf，本件不另维护坐标表。
   ============================================================ */
(function (global) {
  'use strict';

  const MAX_N = 12, SIZE = MAX_N + 1;
  const DEG = Math.PI / 180, RAD = 180 / Math.PI;

  /* WGS84 椭球长短半轴与球谐展开用平均半径（公里） */
  const EA = 6378.137, EB = 6356.7523142, R0 = 6371.2;

  /* WMM2025 主系数（nT） */
  const GNM = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-29351.8, -1410.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-2556.6, 2951.1, 1649.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1361.0, -2404.1, 1243.8, 453.6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [895.0, 799.5, 55.7, -281.1, 12.1, 0, 0, 0, 0, 0, 0, 0, 0],
    [-233.2, 368.9, 187.2, -138.7, -142.0, 20.9, 0, 0, 0, 0, 0, 0, 0],
    [64.4, 63.8, 76.9, -115.7, -40.9, 14.9, -60.7, 0, 0, 0, 0, 0, 0],
    [79.5, -77.0, -8.8, 59.3, 15.8, 2.5, -11.1, 14.2, 0, 0, 0, 0, 0],
    [23.2, 10.8, -17.5, 2.0, -21.7, 16.9, 15.0, -16.8, 0.9, 0, 0, 0, 0],
    [4.6, 7.8, 3.0, -0.2, -2.5, -13.1, 2.4, 8.6, -8.7, -12.9, 0, 0, 0],
    [-1.3, -6.4, 0.2, 2.0, -1.0, -0.6, -0.9, 1.5, 0.9, -2.7, -3.9, 0, 0],
    [2.9, -1.5, -2.5, 2.4, -0.6, -0.1, -0.6, -0.1, 1.1, -1.0, -0.2, 2.6, 0],
    [-2.0, -0.2, 0.3, 1.2, -1.3, 0.6, 0.6, 0.5, -0.1, -0.4, -0.2, -1.3, -0.7]
  ];
  const HNM = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4545.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -3133.6, -815.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -56.6, 237.5, -549.5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 278.6, -133.9, 212.0, -375.6, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 45.4, 220.2, -122.9, 43.0, 106.1, 0, 0, 0, 0, 0, 0, 0],
    [0, -18.4, 16.8, 48.8, -59.8, 10.9, 72.7, 0, 0, 0, 0, 0, 0],
    [0, -48.9, -14.4, -1.0, 23.4, -7.4, -25.1, -2.3, 0, 0, 0, 0, 0],
    [0, 7.1, -12.6, 11.4, -9.7, 12.7, 0.7, -5.2, 3.9, 0, 0, 0, 0],
    [0, -24.8, 12.2, 8.3, -3.3, -5.2, 7.2, -0.6, 0.8, 10.0, 0, 0, 0],
    [0, 3.3, 0.0, 2.4, 5.3, -9.1, 0.4, -4.2, -3.8, 0.9, -9.1, 0, 0],
    [0, 0, 2.9, -0.6, 0.2, 0.5, -0.3, -1.2, -1.7, -2.9, -1.8, -2.3, 0],
    [0, -1.3, 0.7, 1.0, -1.4, 0.0, 0.6, -0.1, 0.8, 0.1, -1.0, 0.1, 0.2]
  ];
  /* WMM2025 年变率（nT/年） */
  const GTNM = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [12.0, 9.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-11.6, -5.2, -8.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-1.3, -4.2, 0.4, -15.6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-1.6, -2.4, -6.0, 5.6, -7.0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.6, 1.4, 0.0, 0.6, 2.2, 0.9, 0, 0, 0, 0, 0, 0, 0],
    [-0.2, -0.4, 0.9, 1.2, -0.9, 0.3, 0.9, 0, 0, 0, 0, 0, 0],
    [0, -0.1, -0.1, 0.5, -0.1, -0.8, -0.8, 0.8, 0, 0, 0, 0, 0],
    [-0.1, 0.2, 0.0, 0.5, -0.1, 0.3, 0.2, 0, 0.2, 0, 0, 0, 0],
    [0, -0.1, 0.1, 0.3, -0.3, 0, 0.3, -0.1, 0.1, -0.1, 0, 0, 0],
    [0.1, 0.0, 0.1, 0.1, 0, -0.3, 0, -0.1, -0.1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, -0.1, 0, 0, -0.1, -0.1, -0.1, -0.1, 0],
    [0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, -0.1, 0, -0.1]
  ];
  const HTNM = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -21.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -27.7, -12.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4.0, -0.3, -4.1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -1.1, 4.1, 1.6, -4.4, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -0.5, 2.2, 0.4, 1.7, 1.9, 0, 0, 0, 0, 0, 0, 0],
    [0, 0.3, -1.6, -0.4, 0.9, 0.7, 0.9, 0, 0, 0, 0, 0, 0],
    [0, 0.6, 0.5, -0.8, 0.0, -1.0, 0.6, -0.2, 0, 0, 0, 0, 0],
    [0, -0.2, 0.5, -0.4, 0.4, -0.5, -0.6, 0.3, 0.2, 0, 0, 0, 0],
    [0, -0.3, 0.3, -0.3, 0.3, 0.2, -0.1, -0.2, 0.4, 0.1, 0, 0, 0],
    [0, 0, 0, -0.2, 0.1, -0.1, 0.1, 0.0, -0.1, 0.2, 0, 0, 0],
    [0, 0, 0.1, 0, 0.1, 0, 0, 0.1, 0, 0, 0, 0, 0],
    [0, 0, 0, -0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, -0.1]
  ];

  const EPOCH = 2025.0, VALID_UNTIL = 2030.0;

  /* 递推系数：只算一次，与调用次数无关 */
  const P = [], DP = [], GN = [], HN = [], SM = [], CM = [], ROOT = [], ROOTS = [];
  (function initTables(){
    for (let i = 0; i < SIZE; i++) {
      P.push(new Array(SIZE).fill(0)); DP.push(new Array(SIZE).fill(0));
      GN.push(new Array(SIZE).fill(0)); HN.push(new Array(SIZE).fill(0));
      ROOTS.push(new Array(SIZE).fill(0).map(function(){ return [0, 0]; }));
    }
    for (let i = 0; i < SIZE; i++) { SM.push(0); CM.push(0); ROOT.push(0); }
    for (let n = 2; n <= MAX_N; n++) ROOT[n] = Math.sqrt((2 * n - 1) / (2 * n));
    for (let m = 0; m <= MAX_N; m++) {
      const mm = m * m;
      for (let n = Math.max(m + 1, 2); n <= MAX_N; n++) {
        ROOTS[m][n][0] = Math.sqrt((n - 1) * (n - 1) - mm);
        ROOTS[m][n][1] = 1 / Math.sqrt(n * n - mm);
      }
    }
  })();

  /* 主系数按年外推：真值＝主系数＋（小数年－基准年）×年变率 */
  let cachedYear = NaN;
  function secular(decimalYear){
    if (decimalYear === cachedYear) return;
    cachedYear = decimalYear;
    const t = decimalYear - EPOCH;
    for (let n = 1; n <= MAX_N; n++) {
      for (let m = 0; m <= n; m++) {
        GN[n][m] = GNM[n][m] + t * GTNM[n][m];
        HN[n][m] = HNM[n][m] + t * HTNM[n][m];
      }
    }
  }

  /* 小数年：接受 Date、四位年数或小数年，缺省取当前时刻（UTC） */
  function decimalYear(when){
    if (when == null) when = new Date();
    if (typeof when === 'number' && isFinite(when)) return when;
    const d = when instanceof Date ? when : new Date(when);
    const y = d.getUTCFullYear();
    const t0 = Date.UTC(y, 0, 1), t1 = Date.UTC(y + 1, 0, 1);
    return y + (d.getTime() - t0) / (t1 - t0);
  }

  /* 日期串：供在线接口用，YYYY-MM-DD */
  function dateStr(when){
    let d;
    if (when instanceof Date) d = when;
    else if (typeof when === 'number' && isFinite(when)) {
      d = new Date(Date.UTC(Math.floor(when), 0, 1));
      d = new Date(d.getTime() + (when - Math.floor(when)) * 365.25 * 86400000);
    } else if (when == null) d = new Date();
    else d = new Date(when);
    const p2 = function(v){ return (v < 10 ? '0' : '') + v; };
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate());
  }

  /* 磁偏角与磁倾角（度）：地心球谐展开，返回 {decl, incl, decimalYear} */
  function field(lat, lng, when, altKm){
    const dy = decimalYear(when);
    secular(dy);
    const h = altKm || 0;
    const latRad = lat * DEG, lonRad = lng * DEG;
    const sinLat = Math.sin(latRad), cosLat = Math.cos(latRad);
    const sr = Math.sqrt(EA * EA * cosLat * cosLat + EB * EB * sinLat * sinLat);
    const theta = Math.atan2(cosLat * (h * sr + EA * EA), sinLat * (h * sr + EB * EB));
    const r = Math.sqrt(h * h + 2 * h * sr +
      (EA * EA * EA * EA - (EA * EA * EA * EA - EB * EB * EB * EB) * sinLat * sinLat) /
      (EA * EA - (EA * EA - EB * EB) * sinLat * sinLat));
    const c = Math.cos(theta), s = Math.sin(theta);
    const invS = 1 / (s === 0 ? 1e-8 : s);

    P[0][0] = 1; P[1][1] = s; DP[0][0] = 0; DP[1][1] = c; P[1][0] = c; DP[1][0] = -s;
    for (let n = 2; n <= MAX_N; n++) {
      P[n][n] = P[n - 1][n - 1] * s * ROOT[n];
      DP[n][n] = (DP[n - 1][n - 1] * s + P[n - 1][n - 1] * c) * ROOT[n];
    }
    for (let m = 0; m <= MAX_N; m++) {
      for (let n = Math.max(m + 1, 2); n <= MAX_N; n++) {
        P[n][m] = (P[n - 1][m] * c * (2 * n - 1) - P[n - 2][m] * ROOTS[m][n][0]) * ROOTS[m][n][1];
        DP[n][m] = ((DP[n - 1][m] * c - P[n - 1][m] * s) * (2 * n - 1) - DP[n - 2][m] * ROOTS[m][n][0]) * ROOTS[m][n][1];
      }
    }
    for (let m = 0; m <= MAX_N; m++) { SM[m] = Math.sin(m * lonRad); CM[m] = Math.cos(m * lonRad); }

    let BR = 0, BTheta = 0, BPhi = 0;
    const fn0 = R0 / r;
    let fn = fn0 * fn0;
    for (let n = 1; n <= MAX_N; n++) {
      let c1 = 0, c2 = 0, c3 = 0;
      for (let m = 0; m <= n; m++) {
        const tmp = GN[n][m] * CM[m] + HN[n][m] * SM[m];
        c1 += tmp * P[n][m];
        c2 += tmp * DP[n][m];
        c3 += m * (GN[n][m] * SM[m] - HN[n][m] * CM[m]) * P[n][m];
      }
      fn *= fn0;
      BR += (n + 1) * c1 * fn;
      BTheta -= c2 * fn;
      BPhi += c3 * fn * invS;
    }

    const psi = theta - (Math.PI / 2 - latRad);
    const sinPsi = Math.sin(psi), cosPsi = Math.cos(psi);
    const bx = -BTheta * cosPsi - BR * sinPsi;
    const by = BPhi;
    const bz = BTheta * sinPsi - BR * cosPsi;
    const bh = Math.hypot(bx, by);
    const decl = (bx !== 0 || by !== 0) ? Math.atan2(by, bx) * RAD : 0;
    const incl = (bh !== 0 || bz !== 0) ? Math.atan2(bz, bh) * RAD : 0;
    return { decl: Math.round(decl * 100) / 100, incl: Math.round(incl * 100) / 100, decimalYear: dy };
  }

  /* 磁偏角（度）：东偏为正、西偏为负 */
  function decl(lat, lng, when, altKm){ return field(lat, lng, when, altKm).decl; }

  /* 模型是否仍在有效期内 */
  function inRange(when){
    const dy = decimalYear(when);
    return dy >= EPOCH && dy < VALID_UNTIL;
  }

  /* BGS 在线接口：同一服务另有 wmm/2020 版本，本件只取 2025 版 */
  const ONLINE = 'https://geomag.bgs.ac.uk/web_service/GMModels/wmm/2025/';
  function online(lat, lng, when){
    const url = ONLINE + '?latitude=' + lat + '&longitude=' + lng +
      '&altitude=0&date=' + dateStr(when) + '&format=json';
    return fetch(url, { credentials: 'omit' })
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(j){
        const f = j && j['geomagnetic-field-model-result'] && j['geomagnetic-field-model-result']['field-value'];
        const v = f && f.declination ? f.declination.value : null;
        return (typeof v === 'number' && isFinite(v)) ? v : null;
      });
  }

  global.FS_MAG = {
    decl: decl,
    field: field,
    online: online,
    inRange: inRange,
    dateStr: dateStr,
    decimalYear: decimalYear,
    EPOCH: EPOCH,
    VALID_UNTIL: VALID_UNTIL,
    SOURCE: 'WMM2025'
  };
})(window);
