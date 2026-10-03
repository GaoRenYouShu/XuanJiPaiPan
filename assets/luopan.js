/* ============================================================
   罗经仪共享库（luopan.js）
   用途：把罗盘渲染、模式编排、新手引导与实时指南针外壳从页面里抽出来，
        供罗经仪页与风水阳阴宅页统一调用，如同 fengshui-engine.js 之于风水页。
   依赖：FENGSHUI（fengshui-engine）、WHEEL（wheel）、FS_LUO（fs-luo）、FS_MAG（fs-mag）。
   本件只出几何、模式编排与引导文案，不写任何页面专属副本（页面文案由调用页以参数传入）。
   盘面配色只取本页主色分浓淡加吉凶二值（无第三色相），盘上不加图例，
   细目一律走 .wheel-detail（同句不盘上盘下双出）。
   罗盘层位与口径依《罗经透解》《催官篇》等通行坊本，流派分歧处由调用页指明取舍。
   ============================================================ */
(function (global) {
  'use strict';

  const LS_MODE = 'luopan_mode_v1';
  const LS_CAT = 'luopan_cat_v1';

  /* 通用层盘骨架（viewBox 440，与阴宅穿山透地盘同式）：外圈二十四山、内圈数据环。
     径向自盘心向外：盘心 78、内界圈 120、内圈数据带 146、外圈刻度 168、外环 182、外圈山名 206。
     外圈二十四山与测角同制式（子在下、午在上），盘面角为地理度加一百八十，落点取角与 fengshui-engine 一致。 */
  function layerDisk(o) {
    const FS = global.FENGSHUI;
    const {C,OUT,IN,CORE,LAB_OUT,LAB_IN,ARC,HIT1,TICK0,TICK1,P0,P1}=FS.GEO440;
    const sel = o.sel;
    let s = '';
    /* 外圈逐山弧与刻度 */
    for (let i = 0; i < 24; i++) {
      const d = rdShanDeg(i);
      s += `<path d="${WHEEL.arc(ARC, d - 7.5, d + 7.5)}" class="w-arc"/>`;
      const a = WHEEL.px(TICK0, d), c = WHEEL.px(TICK1, d);
      s += `<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
    }
    /* 外圈山名环布 */
    for (let i = 0; i < 24; i++) {
      const d = rdShanDeg(i);
      const a = WHEEL.px(LAB_OUT, d);
      const ba = o.bad && o.bad(i);
      s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
        + ` style="fill:${ba ? 'var(--wheel-bad)' : 'var(--wheel-ink)'};fill-opacity:${ba ? 1 : .9}"`
        + ` transform="rotate(${WHEEL.ring(d)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.SHAN_LIST[i]}</text>`;
    }
    /* 内圈数据环：调用页按山给每行 {text, deg, color, kong}。
       字号按格数与字数反推：二十四格取 .w-lab-lg 十三像素（通用段第 6 件），不再内联压小；
       取字角按字数定（单字 dir、双字 radial），二值语义走内联 fill 取吉凶色。 */
    if (o.inner) {
      const grid = [];
      let cnt = 0;
      for (let i = 0; i < 24; i++) { const g = o.inner(i, FS.SHAN_LIST[i]) || []; grid.push(g); cnt += g.length; }
      const arcIn = 2 * Math.PI * LAB_IN / Math.max(1, cnt);
      const maxCh = grid.reduce(function (m, g) { return g.reduce(function (q, r) { return Math.max(q, r.text.length); }, m); }, 1);
      /* 字不留白则相邻两格的字互相压死，故取弧长七成八除字数，与真实盘同口径 */
      const fit = Math.max(10, Math.min(13, Math.round(arcIn * 0.78 / maxCh * 10) / 10));
      const sz = fit >= 13 ? '' : 'font-size:' + fit + 'px;';
      /* 格密到字塞不进（分金百二十、穿山七十二、透地六十）时改刻度环：
         环面只标须取避之档（龟甲空亡取警示色长线、旺相取主色短线，孤虚不画），
         干支名号归盘下详情条。同站内罗经立向盘分金环口径，不把环面填成一片梳齿。 */
      if (fit <= 10.5) {
        /* 环厚取内圈字带三十，长线七成、短线四成半，居中于内圈字半径 */
        const TH = 30, LK = TH * 0.35, LW = TH * 0.225;
        for (let i = 0; i < 24; i++) {
          for (const r of grid[i]) {
            const h = r.kong ? LK : (r.wang === '旺' || r.wang === '相' ? LW : 0);
            if (!h) continue;
            const a = WHEEL.px(LAB_IN - h, r.deg), c = WHEEL.px(LAB_IN + h, r.deg);
            s += `<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}"`
              + ` style="stroke:${r.kong ? 'var(--wheel-bad)' : 'var(--wheel-arc)'};stroke-opacity:${r.kong ? .82 : .45};stroke-width:${r.kong ? 1.6 : 1}"/>`;
          }
        }
      } else {
        for (let i = 0; i < 24; i++) {
          for (const r of grid[i]) {
            const a = WHEEL.px(LAB_IN, r.deg);
            const fill = r.kong ? 'fill:var(--wheel-bad);' : (r.color ? 'fill:' + r.color + ';' : '');
            const rot = r.text.length === 1 ? WHEEL.dir(r.deg) : WHEEL.radial(r.deg);
            s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
              + (sz || fill ? ` style="${sz}${fill}"` : '')
              + ` transform="rotate(${rot} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${r.text}</text>`;
          }
        }
      }
    }
    /* 点选态：高亮弧、热区、悬停预览 */
    s += `<path id="${o.curId}" class="w-arc w-arc-cur" d="${WHEEL.arc(ARC, rdShanDeg(sel) - 7.5, rdShanDeg(sel) + 7.5)}"/>`;
    for (let i = 0; i < 24; i++) {
      const d = rdShanDeg(i);
      const bd = WHEEL.band(IN, HIT1, d - 7.5, d + 7.5);
      s += `<path d="${bd}" class="w-hit${i === sel ? ' is-on' : ''}" data-i="${i}" onclick="${o.pick}(${i})"/>`;
      s += `<path d="${bd}" class="w-sel"/>`;
    }
    /* 圈线、盘心、游标、盘心两行 */
    s += `<circle cx="${C}" cy="${C}" r="${OUT}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${IN}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${CORE}" class="w-core"/>`;
    const q0 = WHEEL.px(P0, rdShanDeg(sel)), q1 = WHEEL.px(P1, rdShanDeg(sel));
    s += `<line id="${o.id}Needle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
      + `<circle id="${o.id}Dot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
    const ct = o.core ? o.core(sel) : ['', '', '', ''];
    s += `<text id="${o.id}C1" x="${C}" y="${C - 16}" class="w-c1">${ct[0]}</text>`
      + `<text id="${o.id}C2" x="${C}" y="${C + 14}" class="w-c2" style="font-weight:700;fill:${ct[2] || 'var(--wheel-ink2)'}">${ct[1]}</text>`
      + `<text id="${o.id}C3" x="${C}" y="${C + 34}" class="w-c3">${ct[3] || ''}</text>`;
    return `<svg class="wheel wheel-luo" id="${o.id}" viewBox="0 0 440 440" role="img" aria-label="${o.label}">${s}</svg>`;
  }

  /* 各盘取角口径登记处：盘面绘制时自报，点选时按盘 id 取回。
     取角若散在调用页逐个手传，每加一盘都要传一次，漏传即回落二十四山角、
     十二宫一类的盘指针全指错；登记在盘上则不须传，也不会漏。 */
  const RD_DEG = {};
  function degReg(id, fn) { RD_DEG[id] = fn; }

  /* 点选三件套：热区 is-on、环名 w-lab-cur、当前弧 d、游标指向所选之山（按盘自报的角度）。 */
  function pick(o) {
    WHEEL.pick(o.id, o.i);
    WHEEL.lab(o.id, o.i);
    const root = document.getElementById(o.id);
    const cur = document.getElementById(o.curId);
    if (root && cur) {
      const arcs = root.querySelectorAll('.w-arc:not(.w-arc-cur)');
      if (arcs[o.i]) cur.setAttribute('d', arcs[o.i].getAttribute('d'));
    }
    if (root) {
      const ln = root.querySelector('#' + o.id + 'Needle'), dt = root.querySelector('#' + o.id + 'Dot');
      const f = o.degOf || RD_DEG[o.id];
      const d = f ? f(o.i) : global.FENGSHUI.fwShanDeg(o.i);
      if (ln && dt) {
        const q0 = WHEEL.px(82, d), q1 = WHEEL.px(116, d);
        ln.setAttribute('x1', WHEEL.n(q0[0])); ln.setAttribute('y1', WHEEL.n(q0[1]));
        ln.setAttribute('x2', WHEEL.n(q1[0])); ln.setAttribute('y2', WHEEL.n(q1[1]));
        dt.setAttribute('cx', WHEEL.n(q1[0])); dt.setAttribute('cy', WHEEL.n(q1[1]));
      }
    }
  }

  function detail(id, html) { const e = document.getElementById(id); if (e) e.innerHTML = html; }

  /* 分类输出两级。一级为真实罗盘与查询罗盘二大类：真实罗盘者仪器本体，
     以现场读数与对针为用；查询罗盘者各盘之查索，以坐向入各理气法为用。
     二级为各大类之下之细目：真实罗盘下是盘制（综合、三元、三合，本体无需二级分类，
     盘制与其底色诸钮同列工具条即其切换处），查询罗盘下是三盘三针、分金体系等九种盘。
     二级常态隐藏，点查询罗盘方展开，免得九钮常显占位而掩了核心件。 */
  const RD_CATS = {
    real: [],
    query: ['zhen', 'fen', 'sanhe', 'tianxing', 'bazhai', 'bagua', 'yun', 'xiu', 'decl']
  };
  let LP_CAT = 'real';
  let LP_MODE = 'zhen';
  function setCat(cat) {
    const c = RD_CATS[cat] ? cat : 'real';
    LP_CAT = c;
    document.querySelectorAll('.lp-cat-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-cat') === c);
    });
    document.querySelectorAll('[data-cat-block]').forEach(function (el) {
      el.hidden = (el.getAttribute('data-cat-block') !== c);
    });
    /* 入查询罗盘：二级钮随之显，所选之盘若不在其中则取首个（三盘三针） */
    setMode(RD_CATS[c].indexOf(LP_MODE) >= 0 ? LP_MODE : (RD_CATS[c][0] || LP_MODE));
    try { localStorage.setItem(LS_CAT, c); } catch (e) {}
  }
  /* 盘切换：切二级钮之 active 与 [data-mode-block] 显隐，localStorage 记忆。 */
  function setMode(mode) {
    const list = RD_CATS[LP_CAT] || [];
    const m = list.indexOf(mode) >= 0 ? mode : (list[0] || mode);
    LP_MODE = m;
    document.querySelectorAll('.lp-mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode') === m);
    });
    document.querySelectorAll('[data-mode-block]').forEach(function (el) {
      el.hidden = (el.getAttribute('data-mode-block') !== m);
    });
    try { localStorage.setItem(LS_MODE, m); } catch (e) {}
  }
  function restoreMode() {
    let c = 'real', m = 'zhen';
    try {
      const sc = localStorage.getItem(LS_CAT), sm = localStorage.getItem(LS_MODE);
      if (sc) c = sc;
      if (sm) m = sm;
    } catch (e) {}
    if (!RD_CATS[c]) c = 'real';
    if (RD_CATS[c].indexOf(m) < 0) m = RD_CATS[c][0] || m;
    setCat(c);
  }

  /* 新手引导五步：对针、定向、消砂、纳水、理气。每步只给白话与所看之层，不裁断吉凶。 */
  const GUIDE_STEPS = [
    { t: '对针', x: '双手托平罗盘，使盘面水平；先校磁偏角（所在地东偏为正、西偏为负），电子罗盘所读为磁北，按当地磁偏角折真北方得地理方位。勘前远离铁磁与电器，多次复测取稳。' },
    { t: '定向', x: '以地盘正针立向格龙：转动盘面使子午对齐，读坐山向首所落之山与正兼向。中线左右各四点五度为正向（下卦），逾此兼向须起替卦，压两山交界为骑缝空亡不可立。' },
    { t: '消砂', x: '以人盘中针消砂：中针较正针逆偏七点五度，看周围砂峰落在何山，与坐山论生克比和。中针专为拨砂而设，不与正针混用。' },
    { t: '纳水', x: '以天盘缝针纳水：缝针较正针顺偏七点五度，看来去水口落在何山，论生旺墓与三合水局。缝针专为纳水而设，不与正针混用。' },
    { t: '理气', x: '据坐向入各理气法：玄空飞星看当元运星与山向盘，八宅看东四西四与游年九星，三合看长生十二宫与四大局，天星看催官贵向。各法并陈，由所用主线自裁。' }
  ];
  function guide() {
    return '<div class="lp-guide">'
      + GUIDE_STEPS.map(function (s, i) {
        return `<div class="lp-guide-step"><span class="lp-guide-no">${i + 1}</span>`
          + `<div class="lp-guide-body"><b>${s.t}</b><span>${s.x}</span></div></div>`;
      }).join('')
      + '</div>';
  }

  /* 角度插值（0/360 环绕），EMA 平滑用 */
  function lerpAngle(a, b, k) {
    let d = ((b - a + 540) % 360) - 180;
    return (((a + d * k) % 360) + 360) % 360;
  }

  /* 十二宫盘（viewBox 440，与 layerDisk 同骨架）：外圈宫名环布带吉凶色、内圈地支取字角，
     三合水法长生十二宫与阳宅页同制式，宫位角由调用页给地支转度。 */
  function gongDisk(o) {
    const FS = global.FENGSHUI;
    const {C,OUT,IN,CORE,LAB_OUT,LAB_IN,ARC,HIT1,TICK0,TICK1,P0,P1}=FS.GEO440;
    const sel = o.sel || 0;
    const gong = o.gong || [], zhi = o.zhi || [];
    const cnt = gong.length || 12;
    const degOf = function (i) { return rdZhiDeg(FS.ZHI.indexOf(zhi[i])); };
    degReg(o.id, degOf);
    let s = '';
    for (let i = 0; i < cnt; i++) {
      const d = degOf(i);
      s += `<path d="${WHEEL.arc(ARC, d - 15, d + 15)}" class="w-arc"/>`;
      const a = WHEEL.px(TICK0, d), c = WHEEL.px(TICK1, d);
      s += `<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
    }
    for (let i = 0; i < cnt; i++) {
      const d = degOf(i), bd = WHEEL.band(IN, HIT1, d - 15, d + 15);
      s += `<path d="${bd}" class="w-hit${i === sel ? ' is-on' : ''}" data-i="${i}" onclick="${o.pick}(${i})"/>`
        + `<path d="${bd}" class="w-sel"/>`;
    }
    s += `<path id="${o.curId}" class="w-arc w-arc-cur" d="${WHEEL.arc(ARC, degOf(sel) - 15, degOf(sel) + 15)}"/>`;
    for (let i = 0; i < cnt; i++) {
      const d = degOf(i), a = WHEEL.px(LAB_OUT, d);
      const f = o.color ? o.color(i) : '';
      s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
        + ` style="fill:${f || 'var(--wheel-ink)'};fill-opacity:${f ? 1 : .9}"`
        + ` transform="rotate(${WHEEL.ring(d)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${gong[i]}</text>`;
    }
    for (let i = 0; i < cnt; i++) {
      const d = degOf(i), a = WHEEL.px(LAB_IN, d);
      s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-lg${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
        + ` transform="rotate(${WHEEL.dir(d)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${zhi[i]}</text>`;
    }
    s += `<circle cx="${C}" cy="${C}" r="${OUT}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${IN}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${CORE}" class="w-core"/>`;
    const q0 = WHEEL.px(P0, degOf(sel)), q1 = WHEEL.px(P1, degOf(sel));
    s += `<line id="${o.id}Needle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
      + `<circle id="${o.id}Dot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
    const ct = o.core ? o.core(sel) : ['', '', '', ''];
    s += `<text id="${o.id}C1" x="${C}" y="${C - 16}" class="w-c1">${ct[0]}</text>`
      + `<text id="${o.id}C2" x="${C}" y="${C + 14}" class="w-c2" style="font-weight:700;fill:${ct[2] || 'var(--wheel-ink2)'}">${ct[1]}</text>`
      + `<text id="${o.id}C3" x="${C}" y="${C + 34}" class="w-c3">${ct[3] || ''}</text>`;
    return `<svg class="wheel" id="${o.id}" viewBox="0 0 440 440" role="img" aria-label="${o.label || '十二宫盘'}">${s}</svg>`;
  }

  /* 二十八宿盘：照老黄历宿盘同制式。环向逆时针，角宿起于 135 度，
     二十八宿象序东、北、西、南，绕行即东方青龙落正右、北方玄武落正上、
     西方白虎落正左、南方朱雀落正下。外圈四象方位单字沿圆周环布，
     内圈宿名单字走 WHEEL.dir 散射；盘心三行：宿曜全名、吉凶、四象。
     宿曜吉凶依 LunarUtil.XIU_LUCK，罗盘此层只作周天度数与宿位对应，不参与吉凶裁断。 */
  const XIU_XIANG = [
    { nm: '青龙', full: '东方青龙', from: 0, to: 7, ch: '东', color: 'var(--wheel-ink)' },
    { nm: '玄武', full: '北方玄武', from: 7, to: 14, ch: '北', color: 'var(--wheel-ink)' },
    { nm: '白虎', full: '西方白虎', from: 14, to: 21, ch: '西', color: 'var(--wheel-ink)' },
    { nm: '朱雀', full: '南方朱雀', from: 21, to: 28, ch: '南', color: 'var(--wheel-ink)' }
  ];
  function xiuDisk(o) {
    const FS = global.FENGSHUI;
    const {C,OUT,IN,CORE,LAB_OUT,LAB_IN,ARC,HIT1,TICK0,TICK1,P0,P1}=FS.GEO440;
    const xs = FS.XIU_28, W = 360 / 28, A0 = 135;
    const span = function (i) { return [A0 - (i + 1) * W, A0 - i * W]; };
    const mid = function (i) { return A0 - (i + 0.5) * W; };
    const sel = o.sel;
    degReg(o.id, mid);
    let s = '';
    for (let i = 0; i < 28; i++) {
      const sp = span(i);
      s += `<path d="${WHEEL.arc(ARC, sp[0], sp[1])}" class="w-arc"/>`;
    }
    for (let i = 0; i < 28; i++) {
      const dg = mid(i), ta = WHEEL.px(TICK0, dg), tb = WHEEL.px(TICK1, dg);
      s += `<line x1="${WHEEL.n(ta[0])}" y1="${WHEEL.n(ta[1])}" x2="${WHEEL.n(tb[0])}" y2="${WHEEL.n(tb[1])}" class="w-tick"/>`;
    }
    for (let i = 0; i < 28; i++) {
      const sp = span(i);
      const bd = WHEEL.band(IN, HIT1, sp[0], sp[1]);
      s += `<path d="${bd}" class="w-hit${i === sel ? ' is-on' : ''}" data-i="${i}" onclick="${o.pick}(${i})"/>`;
      s += `<path d="${bd}" class="w-sel"/>`;
    }
    const spSel = span(sel);
    s += `<path id="${o.curId}" class="w-arc w-arc-cur" d="${WHEEL.arc(ARC, spSel[0], spSel[1])}"/>`;
    XIU_XIANG.forEach(function (x) {
      const dg = A0 - (x.from + x.to) / 2 * W, tp = WHEEL.px(LAB_OUT, dg);
      s += `<text x="${WHEEL.n(tp[0])}" y="${WHEEL.n(tp[1])}" class="w-lab w-lab-xl" style="fill:${x.color}"`
        + ` transform="rotate(${WHEEL.ring(dg)} ${WHEEL.n(tp[0])} ${WHEEL.n(tp[1])})">${x.ch}</text>`;
    });
    for (let i = 0; i < 28; i++) {
      const dg = mid(i), tp = WHEEL.px(LAB_IN, dg);
      s += `<text x="${WHEEL.n(tp[0])}" y="${WHEEL.n(tp[1])}" class="w-lab w-lab-lg${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
        + ` transform="rotate(${WHEEL.dir(dg)} ${WHEEL.n(tp[0])} ${WHEEL.n(tp[1])})">${xs[i]}</text>`;
    }
    s += `<circle cx="${C}" cy="${C}" r="${OUT}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${IN}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${CORE}" class="w-core"/>`;
    const dg = mid(sel), q0 = WHEEL.px(P0, dg), q1 = WHEEL.px(P1, dg);
    s += `<line id="${o.id}Needle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
      + `<circle id="${o.id}Dot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
    const ct = o.core ? o.core(sel) : ['', '', ''];
    s += `<text id="${o.id}C1" x="${C}" y="${C - 16}" class="w-c1">${ct[0]}</text>`
      + `<text id="${o.id}C2" x="${C}" y="${C + 14}" class="w-c2" style="${ct[2] ? 'font-weight:700;fill:' + ct[2] : ''}">${ct[1]}</text>`
      + `<text id="${o.id}C3" x="${C}" y="${C + 34}" class="w-c3">${ct[3] || ''}</text>`;
    return `<svg class="wheel wheel-luo" id="${o.id}" viewBox="0 0 440 440" role="img" aria-label="${o.label}">${s}</svg>`;
  }


  /* 实时指南针外壳：旋转给定罗盘 svg（使子恒指物理北），读数走调用页提供的元素。
     opts：{wheelId, read:{deg,shan,decl,true}, getDecl, onRead}
     getDecl 返回当地磁偏角（东正西负）或 null；onRead(deg,shan,decl,screenDeg,beta,gamma) 于每帧回调，
     末二参即水平仪横竖两向倾角（度），由调用页自行上屏。
     电子罗盘仅作参考，不取代传统格龙定针。 */
  function Compass(opts) {
    opts = opts || {};
    const FS = global.FENGSHUI;
    const wheel = opts.wheelId ? document.getElementById(opts.wheelId) : null;
    const R = opts.read || {};
    let raf = null, last = null, heading = 0, running = false, hasAbsolute = false, accMsg = '', lastBeta = 0, lastGamma = 0;
    function read(id) { return id ? document.getElementById(id) : null; }
    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (last == null) return;
      const decl = typeof opts.getDecl === 'function' ? opts.getDecl() : null;
      const trueDeg = (decl != null && isFinite(decl)) ? ((heading + decl) % 360 + 360) % 360 : heading;
      /* 屏角：横竖屏切换时屏面之上并非机身之顶，故须以屏角折算，使盘面零度仍对屏面之真北 */
      const sa = (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number')
        ? screen.orientation.angle : 0;
      const screenDeg = ((trueDeg - sa) % 360 + 360) % 360;
      const z = FS.zhenShan(trueDeg, 'zheng');
      const shan = z ? z.shan : '子';
      if (wheel) {
        /* 转盘旋转交由调用页 onRead 处理（真实罗盘页的转盘与缩放拖移叠加）；
           页面未接管时（opts.rotate!==false）才由本库旋转。 */
        if (opts.rotate !== false) {
          wheel.style.transform = 'rotate(' + (-screenDeg) + 'deg)';
          wheel.style.transformOrigin = '50% 50%';
        }
      }
      const d = read(R.deg); if (d) d.textContent = trueDeg.toFixed(1);
      const sn = read(R.shan); if (sn) sn.textContent = shan + '山';
      const dc = read(R.decl); if (dc) dc.textContent = (decl != null && isFinite(decl)) ? decl.toFixed(2) : '未取';
      const tr = read(R.true); if (tr) tr.textContent = trueDeg.toFixed(1);
      if (typeof opts.onRead === 'function') opts.onRead(trueDeg, shan, decl, screenDeg, lastBeta, lastGamma);
    }
    let lvHeng = 0, lvShu = 0;
    /* 方位角：苹果给 webkitCompassHeading（顺时针自北，即真方位角）；
       其余按设备方位规范取三百六十减 alpha（alpha 绕竖轴逆时针为正，绝对与相对同一轴向、同一符号，
       故绝对事件不得直取 alpha，否则东西相反而成镜像）。 */
    function onOrient(e) {
      /* 绝对方位优先：iOS 走 deviceorientation 带 webkitCompassHeading（已是以北顺时针的真方位角）。
         其余一律按设备方位规范取三百六十减 alpha：alpha 绕竖轴逆时针为正，故手机平放、
         屏幕朝西时 alpha 为九十，而其罗盘方位为西即二百七十，正是三百六十减九十。
         absolute 只表明读数是否绝对于地磁轴，不改变 alpha 的旋向，故绝对方位流亦须折算，
         直取 alpha 会使安卓机型东西镜像，与真方位差达一百八十度。 */
      let h;
      if (typeof e.webkitCompassHeading === 'number') { h = e.webkitCompassHeading; if (e.absolute) hasAbsolute = true; }
      else if (e.absolute) { h = (360 - (e.alpha || 0)) % 360; hasAbsolute = true; }
      else { if (hasAbsolute) return; h = (360 - (e.alpha || 0)) % 360; }
      if (h == null) return;
      /* 磁偏角精度门：iOS 低精度读数不可靠，仅给校准提示而不更新方位，免漂。 */
      if (typeof e.webkitCompassAccuracy === 'number' && (!isFinite(e.webkitCompassAccuracy) || e.webkitCompassAccuracy > 20)) {
        accMsg = '请做横8字校准';
      } else {
        accMsg = '';
        if (last == null) heading = h; else heading = lerpAngle(heading, h, 0.2);
        last = h;
      }
      lastBeta = e.beta || 0; lastGamma = e.gamma || 0;
      /* 水平仪两向倾角：beta 为前后俯仰（竖），gamma 为左右横滚（横），
         皆以度如实上报，零度即绝对水平，是否放平由读数人自判，库内不作阈值定夺。 */
      lvShu = lastBeta; lvHeng = lastGamma;
      if (!raf) frame();
    }
    /* 未获授权者挂一次性手势监听：用户任何一次触屏、按键或滚动即再试一次，不必去找按钮 */
    let armed = false;
    function arm() {
      if (armed) return; armed = true;
      const once = function () {
        armed = false;
        ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) { window.removeEventListener(ev, once, true); });
        start();
      };
      ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) { window.addEventListener(ev, once, true); });
    }
    function attach() {
      window.addEventListener('deviceorientation', onOrient, true);
      window.addEventListener('deviceorientationabsolute', onOrient, true);
      frame();
    }
    /* 开启：凡平台不设权限门者（安卓浏览器、桌面）即时启用，开页即用；
       苹果须由用户手势授权，故页面载入即试启一次，未获授权则挂一次性手势监听，
       用户任何一次触屏、按键或滚动即完成授权。 */
    function start() {
      if (running) return Promise.resolve(true);
      running = true;
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        return DeviceOrientationEvent.requestPermission().then(function (st) {
          if (st === 'granted') { attach(); if (typeof opts.onState === 'function') opts.onState(true); return true; }
          running = false; arm(); if (typeof opts.onState === 'function') opts.onState(false); return false;
        }).catch(function () {
          running = false; arm(); if (typeof opts.onState === 'function') opts.onState(false); return false;
        });
      }
      attach();
      if (typeof opts.onState === 'function') opts.onState(true);
      return Promise.resolve(true);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null; last = null;
      window.removeEventListener('deviceorientation', onOrient, true);
      window.removeEventListener('deviceorientationabsolute', onOrient, true);
    }
    return { start: start, stop: stop, getHeading: function () { return heading; }, getAccMsg: function () { return accMsg; },
             getLv: function () { return { heng: lvHeng, shu: lvShu }; } };
  }

  /* ============================================================
     真实罗盘（realDisk）：照真实罗经形制的高保真转盘。
     形制真源：罗经完全详解指南.md 十五层制与问真罗盘盘面实物。
     口径：
       度数以地盘子山中心为零度向东递增；盘面角为地理度加一百八十（子山在下），
       与站内测角同源。 rings 数组即自内向外的层序：首项紧挨天池为第一层，末项抵盘沿为末层；
       天池在最内，其外依次为先天八卦、后天八卦、二十四山、分金龙法诸层，
       最外的圆周正是周天三百六十度刻度圈，与真实罗经由内向外读数之序一致。
     三盘制层数为：三元三十二层、三合二十六层、三元三合综合三十八层，层数即环数。
     三底色（黑电木金字、黄铜黑字、白底黑字）走 CSS 令牌切换，不重画。
     盘面为仪器形制件，黑金红三色属罗经实物本色，与纸本页面以页级段例外口径区分。 
     ============================================================ */
  const RD_C = 1000;
  const YANG_SHAN = { 乾: 1, 坤: 1, 艮: 1, 巽: 1, 寅: 1, 申: 1, 巳: 1, 亥: 1, 甲: 1, 庚: 1, 壬: 1, 丙: 1 };
  const JIE_QI_24 = ['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪'];
  const GUA_SYMBOL = { 乾: '☰', 兑: '☱', 离: '☲', 震: '☳', 巽: '☴', 坎: '☵', 艮: '☶', 坤: '☷' };
  const GUA_BITS = { 乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0], 巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0] };
  const TRI_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  /* 先天八卦配洛书九宫数（《周易本义》卷首：乾九兑四离三震八巽二坎七艮六坤一），卦气卦运诸层所本 */
  const XT_LUOSHU = { 乾: 9, 兑: 4, 离: 3, 震: 8, 巽: 2, 坎: 7, 艮: 6, 坤: 1 };
  /* 先天八卦序（乾一兑二离三震四巽五坎六艮七坤八），先天方图行列所本 */
  const XT_XU = { 乾: 1, 兑: 2, 离: 3, 震: 4, 巽: 5, 坎: 6, 艮: 7, 坤: 8 };
  /* 八卦正体五行（乾兑金、震巽木、坎水、离火、艮坤土），挨星五行所本 */
  const BA_WX = { 乾: '金', 兑: '金', 离: '火', 震: '木', 巽: '木', 坎: '水', 艮: '土', 坤: '土' };
  /* 洛书九星：一贪狼、二巨门、三禄存、四文曲、五廉贞、六武曲、七破军、八左辅、九右弼 */
  const LUO_STAR = ['', '贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '左辅', '右弼'];
  const HZ_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const YAO_WEI = ['初', '二', '三', '四', '五', '上'];
  /* 二十八宿七曜五行：角宿起木，木金土日月火水七曜轮派四周，日属火、月属水；人盘赖公五行由此推衍 */
  const XIU_YAO_WX = ['木', '金', '土', '火', '水', '火', '水'];
  /* 净阴净阳二十四山（《协纪》引杨公纳甲口诀：乾甲坤乙壬寅午戌癸申子辰属阳，艮丙巽辛庚亥卯未丁巳酉丑属阴） */
  const JING_YANG = ['乾', '甲', '坤', '乙', '壬', '寅', '午', '戌', '癸', '申', '子', '辰'];
  /* 六十四卦标准卦名：周易本经之名，一至二字，与上方方图行列同序。
     盘面书此名，不书乾为天式四字别称，与罗盘刻法一致，亦免窄格挤字。 */
  const GUA64_SHORT = [
    ['乾', '履', '同人', '无妄', '姤', '讼', '遁', '否'],
    ['夬', '兑', '革', '随', '大过', '困', '咸', '萃'],
    ['大有', '睽', '离', '噬嗑', '鼎', '未济', '旅', '晋'],
    ['大壮', '归妹', '丰', '震', '恒', '解', '小过', '豫'],
    ['小畜', '中孚', '家人', '益', '巽', '涣', '渐', '观'],
    ['需', '节', '既济', '屯', '井', '坎', '蹇', '比'],
    ['大畜', '损', '贲', '颐', '蛊', '蒙', '艮', '剥'],
    ['泰', '临', '明夷', '复', '升', '师', '谦', '坤']
  ];
  const GUA64 = {
    '乾': ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
    '兑': ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
    '离': ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
    '震': ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
    '巽': ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
    '坎': ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
    '艮': ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
    '坤': ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地']
  };
  /* 三盘制：移动版三元盘二十层、三合盘二十二层、三元三合综合盘二十五层。
     综合盘只收两派共有之层，一派独有者各归本盘，故层数不为两盘之并而近其半；
     窄屏一圈之地有限，层数愈多则逐层愈窄，字愈小，此为移动端之制。
     层序照 罗经完全详解指南.md 四之二节三表。rings 数组自内向外排：
     天池为第一层在最内，末项为最外的大外圈；题名与详情条顺取串接，即得自天池向外之读序。 */
  const RD_RING_NAME_OF = function (mode, juKey) {
    const m = RD_SETS[mode] ? mode : 'zonghe';
    const names = {
      chi: '天池', xtGua: '先天八卦', htGua: '后天八卦象名盘',
      heLuo: '河图洛书九宫', bafang: '八方方位',
      basha: '八煞黄泉', jieYao: '劫曜煞', jieSha: '八路四路劫煞线',
      diMu: '地母九星翻卦', zheng: '地盘正针二十四山',
      chuan: '穿山七十二龙', fen: '一百二十分金', zhong: '人盘中针二十四山',
      laiGong: '赖公大五行催官诀', pingfen: '平分六十龙', tou: '透地六十龙',
      feng: '天盘缝针二十四山', najia: '郭璞纳甲净阴净阳', yingsuo: '盈缩六十龙',
      hongfan: '洪范双山五行', changsheng: '十二长生水法', cuiGuan: '催官贵人禄马圈',
      sanyuan24: '二十四山阴阳与三般卦', zhengSanYuan: '二十四山三元盘',
      sanyuan24c: '三元二十四山阴阳', aixing: '玄空大卦挨星五行',
      gua64: '六十四卦卦象名', yunShu: '先天方圆图卦运数', yuanQi: '先天圆图河图气数',
      fanFu: '反吟伏吟提示线', fumu: '三元父母大卦', chouYao: '抽爻换象吉凶线',
      jieqi: '二十四节气太阳到方', xiu: '二十八宿天星分度盘',
      deg: '周天三百六十度经纬度'
    };
    if (m === 'zonghe') names.xiu = '二十八宿双度分度盘';
    const FSe = global.FENGSHUI;
    const ju = juKey && FSe && FSe.SANHE_JU[juKey];
    if (ju) names.changsheng = '十二长生水法：' + ju.ju;
    return names;
  };
  const RD_SETS = {
    zonghe: { name: '三元三合综合盘', rings: ['chi','xtGua','htGua','heLuo','bafang','basha','jieSha','diMu','zheng','chuan','fen','zhong','laiGong','tou','feng','changsheng','sanyuan24c','aixing','gua64','yunShu','fanFu','chouYao','jieqi','xiu','deg'] },
    sanyuan: { name: '三元盘蒋盘', rings: ['chi','xtGua','htGua','heLuo','basha','diMu','zheng','sanyuan24','jieYao','zhengSanYuan','aixing','gua64','yunShu','yuanQi','fanFu','fumu','chouYao','jieqi','xiu','deg'] },
    sanhe: { name: '三合盘杨公盘', rings: ['chi','xtGua','htGua','bafang','basha','jieSha','diMu','zheng','chuan','fen','zhong','laiGong','tou','feng','najia','yingsuo','hongfan','changsheng','cuiGuan','jieqi','xiu','deg'] }
  };

  /* 环带定宽：天池恒占 0 至 96，指南针并入天池不另占带。各环带宽按所载内容定，分三类：
     卦画环只画线不写字，带宽按爻数定死；竖排环（七十二龙、六十分金、六十四卦名、二十八宿
     等格窄字多）沿半径竖排、字头朝外，带宽按字数乘字格定死，弧长不再限字高，故格再密也不相叠；
     横排环（二十四山、八卦名、方位、度数）沿圆周环布，带宽按字幅定下限，再均分余量，
     余量不足则各环按下限铺、外沿仍收在盘面之内。配属诸家不一之层不书内容，取较小下限，
     使余量尽归有字的环，密而不糊。 */
  /* 盘面字幅：全盘字号以二十二单位为顶（盘径二千），横排环另取带宽八成四，
     竖排环取带宽九成二除字数乘一点零八。故窄环之字不撑满、宽环之字不独大，
     一圈之内与圈环之间皆同档。
     盘面角：本盘上北下南，子山之心落盘面零度、向东顺时针递增，盘面角即地理度，
     与周天度数环、八方方位及地理测绘方位角同制。 */
  const RD_FS_MAX = 22;
  const RD_FS_BW = 0.84;
  function rdShanDeg(i) { return i * 15; }
  function rdZhiDeg(j) { return j * 30; }
  const RD_NOBAND = { chi: 1 };
  /* 定宽环：只画线或只作色块者，带宽写死，不随余量伸缩 */
  const RD_LINEW = {
    xtGua: 58, htGua: 58, gua64: 88,
    fanFu: 30, chouYao: 17, sanyuan24c: 15, jieYao: 26, jieSha: 19
  };
  /* [每格最多字数, 是否竖排] */
  const RD_CELL = {
    bafang: [2, 0], heLuo: [1, 0], diMu: [1, 0],
    zheng: [1, 0], zhong: [1, 0], feng: [1, 0], basha: [1, 0],
    zhengSanYuan: [1, 0], laiGong: [1, 0], aixing: [1, 0], najia: [1, 0], hongfan: [1, 0],
    yunShu: [1, 0], yuanQi: [1, 0],
    sanyuan24: [2, 1], fumu: [2, 1], cuiGuan: [2, 1],
    chuan: [2, 1], fen: [2, 1], pingfen: [2, 1], tou: [2, 1], yingsuo: [2, 1],
    changsheng: [2, 1], jieqi: [2, 1], xiu: [2, 1]
  };
  /* 横排环带宽下限：单字环按字幅定下限，色块环与线环取下限之半，使余量尽归有字之环 */
  const RD_HMIN = {
    bafang: 42, heLuo: 58, diMu: 38, zheng: 44, zhong: 40, feng: 40,
    basha: 34, zhengSanYuan: 26, laiGong: 38, aixing: 38, najia: 38, hongfan: 38,
    yunShu: 32, yuanQi: 32, deg: 50
  };
  /* 竖排环字格：每字一格，带宽为字数乘字格加余白，故格再密亦不相犯 */
  const RD_GAP = {
    chuan: 25, fen: 25, pingfen: 25, tou: 25, yingsuo: 25,
    changsheng: 20, jieqi: 20, sanyuan24: 20, fumu: 20, cuiGuan: 20, xiu: 22
  };
  /* 环带半径表：本件环带唯一真源，盘面绘制与实测检测同取此表。 */
  function rdBandsOf(mode) {
    const m = RD_SETS[mode] ? mode : 'zonghe';
    const rings = RD_SETS[m].rings;
    const fix = {}, hmin = {};
    let fixSum = 0, minSum = 0, horiz = 0;
    rings.forEach(function (k) {
      if (RD_NOBAND[k]) return;
      const c = RD_CELL[k] || [1, 0];
      if (RD_LINEW[k]) { fix[k] = RD_LINEW[k]; fixSum += RD_LINEW[k]; return; }
      if (c[1] || RD_GAP[k]) { fix[k] = c[0] * (RD_GAP[k] || 20) + 12; fixSum += fix[k]; return; }
      hmin[k] = RD_HMIN[k] || 44; minSum += hmin[k]; horiz++;
    });
    /* 定宽与下限合计超出余量则满盘同比例回缩，尚有余量则横排均分之；
       两途之外沿皆恰抵九八五，不越盘亦不留白。 */
    const span = 985 - 96;
    const sc = fixSum + minSum > span ? span / (fixSum + minSum) : 1;
    const hw = horiz && sc === 1 ? (span - fixSum - minSum) / horiz : 0;
    const out = { chi: [0, 96] };
    let acc = 96;
    rings.forEach(function (k) {
      if (RD_NOBAND[k]) return;
      const bw = fix[k] ? fix[k] * sc : (hmin[k] * sc + hw);
      out[k] = [acc, acc + bw]; acc += bw;
    });
    return out;
  }
  function rdPx(r, deg) { const a = (deg - 90) * Math.PI / 180; return [RD_C + r * Math.cos(a), RD_C + r * Math.sin(a)]; }
  /* 避煞线：自环内沿直出外沿引线一条，用于八煞、劫煞与空亡诸凶位，只标位不判吉凶。 */
  function rdShaLine(r0, r1, deg) {
    const p0 = rdPx(r0, deg), p1 = rdPx(r1, deg);
    return '<line x1="' + WHEEL.n(p0[0]) + '" y1="' + WHEEL.n(p0[1]) + '" x2="' + WHEEL.n(p1[0]) + '" y2="' + WHEEL.n(p1[1]) + '" class="rd-sha-line"/>';
  }
  /* 格心角：环上逐格首尾相接，末格归一处止角小于起角（跨零度），
     此时起止均值落到对面，故改按本格角宽之半加于起角，再归一周。 */
  function rdCellMid(a0, a1) { return (a0 + ((((a1 - a0) % 360) + 360) % 360) / 2) % 360; }
  function rdArc(r, a0, a1) {
    const p0 = rdPx(r, a0), p1 = rdPx(r, a1), lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + WHEEL.n(p0[0]) + ' ' + WHEEL.n(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + lg + ' 1 ' + WHEEL.n(p1[0]) + ' ' + WHEEL.n(p1[1]);
  }
  function rdBand(r0, r1, a0, a1) {
    const A = rdPx(r1, a0), B = rdPx(r1, a1), D = rdPx(r0, a1), E = rdPx(r0, a0), lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + WHEEL.n(A[0]) + ' ' + WHEEL.n(A[1]) + 'A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + WHEEL.n(B[0]) + ' ' + WHEEL.n(B[1])
      + 'L' + WHEEL.n(D[0]) + ' ' + WHEEL.n(D[1]) + 'A' + r0 + ' ' + r0 + ' 0 ' + lg + ' 0 ' + WHEEL.n(E[0]) + ' ' + WHEEL.n(E[1]) + 'Z';
  }
  /* 爻线：阳爻一段、阴爻两段，皆沿所在半径取弧。起角小于止角，弧恒走正向，
     不作近周之长弧；两段阴爻各取正向小弧，中间留断口。 */
  function rdYaoArc(r, a0, a1, cls) {
    const p0 = rdPx(r, a0), p1 = rdPx(r, a1);
    return '<path d="M' + WHEEL.n(p0[0]) + ' ' + WHEEL.n(p0[1]) + 'A' + WHEEL.n(r) + ' ' + WHEEL.n(r)
      + ' 0 0 1 ' + WHEEL.n(p1[0]) + ' ' + WHEEL.n(p1[1]) + '" class="' + cls + '"/>';
  }
  /* 三爻阴阳位串转卦名（一位为阳、零位为阴），供抽爻换象等爻变之算取卦名。 */
  function guaOfBits(bs) {
    for (const g of TRI_ORDER) if (GUA_BITS[g].join('') === bs.join('')) return g;
    return TRI_ORDER[0];
  }
  /* 河图洛书点数图：以点数示其数，白点为阳数之奇、黑点为阴数之偶。
     点列三行三列，中列居环带中心，点径随带宽定，行距取点径两点五倍，不与数字相犯。 */
  function rdDotCluster(r, deg, n, dotR, yang) {
    let g = '';
    const layout = n <= 3 ? [[n, 1]] : (n <= 6 ? [[3, 2]] : [[3, 3]]);
    const [cols, rws] = layout[0];
    const step = dotR * 2.5;
    let left = n;
    for (let row = 0; row < rws && left > 0; row++) {
      const cnt = Math.min(cols, left); left -= cnt;
      const rr = r + (row - (rws - 1) / 2) * step;
      for (let c = 0; c < cnt; c++) {
        const dd = deg + (c - (cnt - 1) / 2) * (step / Math.max(1, r) * 57.2958);
        const p = rdPx(rr, dd);
        g += '<circle cx="' + WHEEL.n(p[0]) + '" cy="' + WHEEL.n(p[1]) + '" r="' + WHEEL.n(dotR) + '" class="' + (yang ? 'rd-dot-yang' : 'rd-dot-yin') + '"/>';
      }
    }
    return g;
  }
  /* 一卦之爻沿环带径向叠排：两端各留带宽百分之八为余白，爻距随带宽自算，
     爻线取细，爻距恒大于线宽三倍，故窄带密爻亦不糊作一团。 */
  function rdYaoStack(r0, r1, deg, bits, cls, jw) {
    const n = bits.length, bw = r1 - r0;
    const pad = Math.max(1.5, bw * 0.08);
    const step = (bw - pad * 2) / Math.max(1, n - 1);
    let g = '';
    for (let y = 0; y < n; y++) {
      const rr = r0 + pad + y * step, b = bits[y], cut = jw * 0.22;
      if (b) g += rdYaoArc(rr, deg - jw, deg + jw, cls);
      else {
        g += rdYaoArc(rr, deg - jw, deg - cut, cls);
        g += rdYaoArc(rr, deg + cut, deg + jw, cls);
      }
    }
    return g;
  }
  function rdTxt(r, deg, txt, fs, cls, extra) {
    const p = rdPx(r, deg);
    return '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="' + cls + '"'
      + ' style="font-size:' + fs + 'px"' + (extra || '')
      + ' transform="rotate(' + WHEEL.ring(deg) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + txt + '</text>';
  }
  /* 竖排环字：字头朝外、字身沿半径，纯散射角不作四正正立（四正若正立，字串会横倒压向弧长） */
  function rdTxtRad(r, deg, txt, fs, cls, extra) {
    const p = rdPx(r, deg);
    return '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="' + cls + '"'
      + ' style="font-size:' + fs + 'px;letter-spacing:0"' + (extra || '')
      + ' transform="rotate(' + WHEEL.radial(deg) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + txt + '</text>';
  }
  /* 象地环字（四正正立、余沿半径），用于八卦大字与山名内环 */
  function rdTxtDir(r, deg, txt, fs, cls, extra) {
    const p = rdPx(r, deg);
    return '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="' + cls + '"'
      + ' style="font-size:' + fs + 'px"' + (extra || '')
      + ' transform="rotate(' + WHEEL.dir(deg) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + txt + '</text>';
  }

  /* 真实罗盘。opts：{id, sel(选中山序), mode(盘制 key), cross(天心十道 bool), pick}
     返回 svg 字符串。环系由盘心向外连续铺满、环间不留空带（照真实罗经盘面圈层紧排）。
     rings 数组自内向外，第一层天池恒在最内，末层周天三百六十度恒在外沿；
     切盘环组不同、观感立变。三底色走 CSS 令牌。 */
  function realDisk(o) {
    const FS = global.FENGSHUI;
    const mode = RD_SETS[o.mode] ? o.mode : 'zonghe';
    const rings = RD_SETS[mode].rings;
    const has = {}; rings.forEach(function (k) { has[k] = true; });
    const sel = o.sel || 0;
    const C = RD_C, ROUT = 985;
    const RB = rdBandsOf(mode);
    /* 本设坐向所属四大局：十二长生环依此局之长生位顺布十二宫，坐向未传者取水局。 */
    const JU_KEY = FS.SHAN_SANHE[o.sit] || '申子辰';
    /* 字号：竖排环字高取带宽除字数（字沿半径排，弧长不相犯）；
       横排环取带宽六成四与弧长七成八除字数的较小者。 */
    function rdFit(key, n, chars) {
      const b = RB[key]; if (!b) return 14;
      const bw = b[1] - b[0], rm = (b[0] + b[1]) / 2;
      const arc = 2 * Math.PI * rm / Math.max(1, n);
      const vert = (RD_CELL[key] || [1, 0])[1];
      /* 字号据实测定：本页字体汉字墨高为字号零点九二倍、字宽等于字号。
         竖排（字沿半径叠排）：整串径向长取带宽九成二，字距按一点零八倍字号计，
         故字号为带宽零点九二除以字数乘一点零八；字高沿弧不得过弧长九成。
         横排（字沿圆周环布）：墨高占带宽零点八四，故字号为带宽零点八四，
         字宽不得过弧长八成，二者取小，环宽与弧长两不相犯。 */
      if (vert) {
        return Math.max(9, Math.round(Math.min(bw * 0.92 / (Math.max(1, chars) * 1.08), arc * 0.9) * 10) / 10);
      }
      return Math.max(10, Math.round(Math.min(bw * 0.84, arc * 0.80 / Math.max(1, chars)) * 10) / 10);
    }
    /* 环上文字方向与字号：按格形自定，不预设方向。
       每格沿圆周之长为弧长、沿半径之宽为带宽，两向各算其可容之最大字号，取其大者：
       横排（字沿圆周环布）受带宽之墨高与弧长之字串两限；
       竖排（字沿半径叠排）受弧长之墨高与带宽之字串两限。
       故外圈弧长之地必横排，窄格密排之地必竖排，无需逐层手定。
       bwScale 供同环之内分幅用字（如卦名只占环带一段）缩小可容带宽；
       span 供不等分格（如二十八宿各宿宽窄不一）传入本格实占角宽，免按等分误算字号。 */
    function rdTxtAuto(r, deg, txt, key, n, cls, bwScale, span) {
      const b = RB[key]; if (!b) return '';
      const bw = (b[1] - b[0]) * (bwScale || 1);
      const arc = span ? 2 * Math.PI * r * span / 360 : 2 * Math.PI * r / Math.max(1, n);
      const chars = Math.max(1, String(txt).length);
      const fsH = Math.min(bw * RD_FS_BW, arc * 0.78 / chars, RD_FS_MAX);
      const fsV = Math.min(bw * 0.92 / (chars * 1.08), arc * 0.86, RD_FS_MAX);
      /* 方向按格形定，不按字号定：两向各算其格所能容之净宽净高，不含留白之幅比，
         弧长有余者横排、弧长不足者竖排。故一环之内方向齐一，不因字串一字两字而横竖杂出。 */
      const capH = Math.min(bw, arc / chars), capV = Math.min(bw / chars, arc);
      const useH = capH >= capV;
      const fs = Math.max(9, Math.round((useH ? fsH : fsV) * 10) / 10);
      return useH ? rdTxt(r, deg, txt, fs, cls) : rdTxtRad(r, deg, txt, fs, cls);
    }
    let s = '';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + ROUT + '" class="rd-face"/>';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + ROUT + '" class="rd-rim"/>';
    /* 周天三百六十度经纬度环：罗盘最外圈之绝对物理度数刻度面。
       零度落子山之心，向东顺时针递增，与地理测绘方位角及数字指南针同口径。
       每度一格、每五度一中线、每十度一长线并书度数；刻度自环外沿向内，
       长度只取带宽二成六，度数书于带内四成四处，刻度与数字两不相犯。 */
    if (has.deg) {
      const [r0, r1] = RB.deg;
      const bw = r1 - r0;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let d = 0; d < 360; d++) {
        const big = d % 10 === 0, mid = d % 5 === 0;
        const len = big ? bw * 0.26 : (mid ? bw * 0.18 : bw * 0.10);
        const a = rdPx(r1, d), b = rdPx(r1 - len, d);
        s += '<line x1="' + WHEEL.n(a[0]) + '" y1="' + WHEEL.n(a[1]) + '" x2="' + WHEEL.n(b[0]) + '" y2="' + WHEEL.n(b[1]) + '" class="' + (big ? 'rd-tick-j' : 'rd-tick') + '"/>';
      }
      for (let d = 0; d < 360; d += 10) {
        s += rdTxtAuto(r0 + bw * 0.44, d, String(d), 'deg', 36, 'rd-num', 0.72);
      }
    }
    /* 二十八宿天星分度盘：宿名、宿度五行与本表之度同格并列，宿名与五行居前、度居后。
       距度表合计三百五十五度，盘上按比例摊满周天，使末宿与首宿相接无缺。
       宿度五行取七曜本气（角木亢金氐土房日心月尾火箕水之类），
       与二十八宿七曜归属同源，即人盘赖公五行所本。开禧、时宪两度本站只收一套，故只刻其度。
       格宽设下限七点一度：觜鬼二宿本度不足容字，故补至下限，所补之度由余宿按度过下限之数摊还，
       全环仍合周天三百六十度。格内字数按本格实占弧长取，容不下者先省度、再省五行，只书宿名，
       故字不出格、格不盖字，二十八宿字号同档。 */
    if (has.xiu) {
      const [r0, r1] = RB.xiu;
      const names = FS.XIU_28, XMIN = 7.1;
      let total = 0;
      for (const nm of names) total += FS.XIU_DU_SHU[nm];
      const raw = names.map(function (nm) { return FS.XIU_DU_SHU[nm] / total * 360; });
      const need = raw.reduce(function (a, w) { return a + Math.max(0, XMIN - w); }, 0);
      const room = raw.reduce(function (a, w) { return a + Math.max(0, w - XMIN); }, 0);
      const ws = raw.map(function (w) { return w >= XMIN ? w - need * (w - XMIN) / room : XMIN; });
      let cum = 0;
      for (let i = 0; i < names.length; i++) {
        const nm = names[i], du = FS.XIU_DU_SHU[nm], w = ws[i];
        const a0 = cum, a1 = cum + w; cum = a1;
        const mid = (a0 + a1) / 2, rm = (r0 + r1) / 2;
        const arc = 2 * Math.PI * rm * w / 360;
        let txt = nm + XIU_YAO_WX[i % 7] + du;
        if (txt.length * RD_FS_MAX > arc * 0.78) txt = nm + XIU_YAO_WX[i % 7];
        if (txt.length * RD_FS_MAX > arc * 0.78) txt = nm;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        s += rdTxtAuto(rm, mid, txt, 'xiu', 28, 'rd-lab-red', 1, w * 0.94);
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 六十四卦卦象名环：卦画与卦名同在一格。内半为三字卦名竖排，外半为六爻卦画，
       一圈之内象与名相配。 */
    if (has.gua64 || has.gua64Hua || has.gua64Ming) {
      const rb = RB.gua64 || RB.gua64Ming || RB.gua64Hua;
      const r0 = rb[0], r1 = rb[1], bw = r1 - r0;
      const nmR = r0 + bw * 0.26, y0 = r0 + bw * 0.56, y1 = r1 - bw * 0.10;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, a1 = a0 + w, mid = a0 + w / 2;
        const up = Math.floor(k / 8), lo = k % 8;
        const nm = GUA64_SHORT[up][lo];
        const bits = GUA_BITS[TRI_ORDER[lo]].concat(GUA_BITS[TRI_ORDER[up]]);
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        s += rdTxtAuto(nmR, mid, nm, 'gua64', 64, 'rd-lab-gold', 0.46);
        s += rdYaoStack(y0, y1, mid, bits, 'rd-yao', w * 0.30);
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 三针三环：缝针、中针、正针，二十四山阳山红格 */
    const needleRings = [['feng', 7.5], ['zhong', -7.5], ['zheng', 0], ['zhengSanhe', 0]];
    for (const [key, off] of needleRings) {
      if (!has[key]) continue;
      const [r0, r1] = RB[key];
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i];
        const d = rdShanDeg(i) + off;
        const yang = YANG_SHAN[shan];
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        s += rdTxtAuto((r0 + r1) / 2, d, shan, key, 24, yang ? 'rd-shan-yang' : 'rd-shan-yin');
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 7.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 7.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 7.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 7.5)[1]) + '" class="rd-grid-j"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 穿山七十二龙：每龙五度，格内干支直书 */
    if (has.chuan) {
      const [r0, r1] = RB.chuan;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      const seen = {};
      FS.SHAN_LIST.forEach(function (sh) { FS.chuanShan72(sh).forEach(function (r) { seen[r.gz + '@' + r.start] = r; }); });
      const list = Object.keys(seen).map(function (k) { return seen[k]; })
        .sort(function (a, b) { return a.start - b.start; });
      for (const r of list) {
        const a0 = r.start, a1 = r.end;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        if (r.kong) s += rdShaLine(r0, r1, rdCellMid(a0, a1));
        s += rdTxtAuto((r0 + r1) / 2, rdCellMid(a0, a1), r.kong ? '空' : r.gz, 'chuan', 72, r.kong ? 'rd-lab-red' : 'rd-lab-sm');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 透地平分六十龙：每龙六度 */
    if (has.tou) {
      const [r0, r1] = RB.tou;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      const seen = {};
      FS.SHAN_LIST.forEach(function (sh) { FS.touDi60(sh).forEach(function (r) { seen[r.gz + '@' + Math.round(r.start * 2)] = r; }); });
      const list = Object.keys(seen).map(function (k) { return seen[k]; })
        .sort(function (a, b) { return a.start - b.start; });
      for (const r of list) {
        const a0 = r.start, a1 = r.end;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        if (r.wang === '龟甲') s += rdShaLine(r0, r1, rdCellMid(a0, a1));
        s += rdTxtAuto((r0 + r1) / 2, rdCellMid(a0, a1), r.gz, 'tou', 60, r.wang === '龟甲' ? 'rd-lab-red' : 'rd-lab-sm');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 百二十分金：每分三度，逐格短线；旺相金线、龟甲红线 */
    if (has.fen) {
      const [r0, r1] = RB.fen;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      const seen = {};
      FS.SHAN_LIST.forEach(function (sh) { FS.fenJin(sh).forEach(function (f) { seen[f.gz + '@' + f.start] = f; }); });
      const list = Object.keys(seen).map(function (k) { return seen[k]; })
        .sort(function (a, b) { return a.start - b.start; });
      for (const f of list) {
        const a0 = f.start, a1 = f.end;
        const kong = f.wang === '龟甲';
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        if (kong) s += rdShaLine(r0, r1, rdCellMid(a0, a1));
        s += rdTxtAuto((r0 + r1) / 2, rdCellMid(a0, a1), f.gz, 'fen', 120, kong ? 'rd-lab-red' : 'rd-lab-xs');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 河图洛书九宫环：八方各配洛书数（坎一坤二震三巽四乾六兑七艮八离九，五居中宫）。
       卦位取后天方位，坎一为北，落盘面零度，与二十四山诸环同轴。
       数字与黑白点图同格并列、各占全带：数在前、点图在后；白点为阳数之奇、
       黑点为阴数之偶，点数即其数。中五不在此环，居中宫盘心，故环上只布八数。
       阴阳按阳数奇阴数偶分：一三七九作朱格阳字，二四六八作素格阴字。 */
    if (has.luoshu || has.heLuo || has.luoTu) {
      const [r0, r1] = RB.heLuo || RB.luoTu || RB.luoshu;
      const LUO = { 坎: 1, 坤: 2, 震: 3, 巽: 4, 乾: 6, 兑: 7, 艮: 8, 离: 9 };
      const POS = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      const bw = r1 - r0, off = 10;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (const g in POS) {
        const d = POS[g], n = LUO[g];
        const yang = n % 2 === 1;
        s += '<path d="' + rdBand(r0, r1, d - 22.5, d + 22.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        s += rdTxtAuto((r0 + r1) / 2, d - off, String(n), 'heLuo', 8, yang ? 'rd-shan-yang' : 'rd-shan-yin', 1, 18);
        /* 点径一律取带宽十分之一，行距取点径两点五倍：点径不随点数变，八方点图同大；
           三行点群径向占带七成，一行二行更小，点不连片、亦不撑满圈层。 */
        const dr = bw / 10;
        s += rdDotCluster((r0 + r1) / 2, d + off, n, dr, yang);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 先天八卦环：乾南坤北离东坎西。乾为南，落盘面一百八十度，与二十四山诸环同轴。
       卦名与三爻卦画同格并列，名在前段、画在后段，各占全带；
       卦画只占带中四成六，爻线短而爻距密，不撑满圈层。
       阴阳按两仪分：阳仪乾兑离震作朱格阳字，阴仪巽坎艮坤作素格阴字。 */
    if (has.xtGua) {
      const [r0, r1] = RB.xtGua;
      const XT = { 乾: 180, 兑: 135, 离: 90, 震: 45, 巽: 315, 坎: 270, 艮: 225, 坤: 0 };
      const XT_YANG = { 乾: 1, 兑: 1, 离: 1, 震: 1 };
      const bw = r1 - r0, off = 10, nmR = (r0 + r1) / 2;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (const g in XT) {
        const d = XT[g], bits = GUA_BITS[g], yang = XT_YANG[g];
        s += '<path d="' + rdBand(r0, r1, d - 22.5, d + 22.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        s += rdTxtAuto(nmR, d - off, g, 'xtGua', 8, yang ? 'rd-shan-yang' : 'rd-shan-yin');
        s += rdYaoStack(nmR - bw * 0.23, nmR + bw * 0.23, d + off, bits, 'rd-yao-b', 7);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 后天八卦象名盘：坎北艮东北震东巽东南离南坤西南兑西乾西北。
       坎为北，落盘面零度，与二十四山诸环同轴。
       符号与汉字同在一格并列，名在前段、画在后段，各占全带；
       卦画只占带中四成六，爻线短而爻距密，不撑满圈层。
       阴阳按说卦传父母六子分：四阳卦乾震坎艮作朱格阳字，四阴卦坤巽离兑作素格阴字。 */
    if (has.htGua || has.htGuaEr) {
      const [r0, r1] = has.htGua ? RB.htGua : RB.htGuaEr;
      const HT = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      const HT_YANG = { 乾: 1, 震: 1, 坎: 1, 艮: 1 };
      const bw = r1 - r0, off = 10, nmR = (r0 + r1) / 2;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (const g in HT) {
        const d = HT[g], bits = GUA_BITS[g], yang = HT_YANG[g];
        s += '<path d="' + rdBand(r0, r1, d - 22.5, d + 22.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        s += rdTxtAuto(nmR, d - off, g, 'htGua', 8, yang ? 'rd-shan-yang' : 'rd-shan-yin');
        s += rdYaoStack(nmR - bw * 0.23, nmR + bw * 0.23, d + off, bits, 'rd-yao-b', 7);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 八煞黄泉环：只于八煞凶位拉红线示禁，余位留空不书；煞位不填格色，
       免与阳山、吉宫之红格同形混义，避煞一律用线。煞支由引擎 baSha 取
       （坎辰坤卯震申巽酉乾午兑巳艮寅离亥），不判吉凶。 */
    if (has.basha) {
      const [r0, r1] = RB.basha;
      const GB = { 坎: '辰', 坤: '卯', 震: '申', 巽: '酉', 乾: '午', 兑: '巳', 艮: '寅', 离: '亥' };
      const shaSet = {};
      for (const g in GB) shaSet[GB[g]] = g;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const hit = shaSet[shan];
        if (!hit) continue;
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        s += rdShaLine(r0, r1, d);
        s += rdTxtAuto((r0 + r1) / 2, d, shan + '煞', 'basha', 24, 'rd-lab-red');
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 劫煞线环：八煞黄泉之煞位与四路劫煞各引红线一条贯穿本环，只标线位不判吉凶。 */
    if (has.jieSha) {
      const [r0, r1] = RB.jieSha;
      const GB = { 坎: '辰', 坤: '卯', 震: '申', 巽: '酉', 乾: '午', 兑: '巳', 艮: '寅', 离: '亥' };
      const JIE4 = ['寅', '申', '巳', '亥'];
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (const g in GB) {
        const shan = GB[g];
        const d = rdShanDeg(FS.SHAN_LIST.indexOf(shan));
        if (d < 0) continue;
        s += rdShaLine(r0, r1, d);
      }
      for (const shan of JIE4) {
        const d = rdShanDeg(FS.SHAN_LIST.indexOf(shan));
        if (d < 0) continue;
        s += rdShaLine(r0, r1, d);
      }
    }
    /* 二十四节气环：每气十五度，冬至起子山中顺布；冬至者太阳到子，落盘面零度，
       与二十四山诸环同轴。 */
    if (has.jieqi) {
      const [r0, r1] = RB.jieqi;
      const JQ = ['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪'];
      for (let i = 0; i < 24; i++) {
        const d = i * 15;
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        s += rdTxtAuto((r0 + r1) / 2, d, JQ[i], 'jieqi', 24, 'rd-lab-sm');
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 7.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 7.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 7.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 7.5)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 地母九星翻卦环：八卦各配一星，八格各四十五度，格线分割，星名书全称。
       九星之吉凶随本卦翻得，非以星名自定，故格色一律不着吉凶色。 */
    if (has.diMu) {
      const [r0, r1] = RB.diMu;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      /* 地母九星：坤卦起伏位翻卦，翻卦序 伏生贪巨禄文廉武破，八卦各有所翻；通行掌诀：坤起辅、
         翻至对宫。本盘按通行翻卦定表（坤艮坎震巽离乾兑八宫各一星）。 */
      const DM = { 坤: '左辅', 巽: '贪狼', 乾: '巨门', 离: '禄存', 艮: '文曲', 坎: '廉贞', 震: '武曲', 兑: '破军' };
      const HTd = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      for (const g in DM) {
        const d = HTd[g], a0 = d - 22.5;
        s += '<path d="' + rdBand(r0, r1, a0, a0 + 45) + '" class="rd-cell"/>';
        s += rdTxtAuto((r0 + r1) / 2, d, DM[g], 'diMu', 8, 'rd-lab-gold');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 劫曜煞环：只于八卦宫曜煞支所落之山引红线（坎辰坤卯震申巽酉乾午兑巳艮寅离亥），
       余位留空，使凶方一眼可辨；此环与八煞黄泉同源而分画，便于单看劫煞，避煞皆用线不用格。 */
    if (has.jieYao) {
      const [r0, r1] = RB.jieYao;
      const GB = { 坎: '辰', 坤: '卯', 震: '申', 巽: '酉', 乾: '午', 兑: '巳', 艮: '寅', 离: '亥' };
      const shaSet = {};
      for (const g in GB) shaSet[GB[g]] = g;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        if (!shaSet[shan]) continue;
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        s += rdShaLine(r0, r1, d);
        s += rdTxtAuto((r0 + r1) / 2, d, shan + '煞', 'jieYao', 24, 'rd-lab-red');
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 七百二十分金环：每山三十位、每分零点五度，六十甲子纳音循环两轮；只画格线与龟甲红线位。 */
    if (has.fen720) {
      const [r0, r1] = RB.fen720 || RB.fen || [758, 800];
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let n2 = 0; n2 < 720; n2++) {
        const a0 = n2 * 0.5;
        const jiazi = n2 % 60;
        const gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][jiazi % 10];
        const kong = (gan === '戊' || gan === '己');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(kong ? r0 + (r1 - r0) * 0.7 : r0 + (r1 - r0) * 0.45, a0)[0]) + '" y2="' + WHEEL.n(rdPx(kong ? r0 + (r1 - r0) * 0.7 : r0 + (r1 - r0) * 0.45, a0)[1]) + '" style="stroke:' + (kong ? 'var(--rd-red)' : 'var(--rd-grid-j)') + ';stroke-width:1"/>';
      }
      for (let i = 0; i < 24; i++) {
        const d = rdShanDeg(i);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 7.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 7.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 7.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 7.5)[1]) + '" class="rd-grid-j"/>';
      }
    }
    /* 指南针：并入天池区（chi 环内画磁针与 NESW，即问真天池即指南针位）。 */
    if (has.zhizhen) { /* 磁针已在 chi 分支绘制，此环只为层名单独占位。 */ }
    /* 八方方位环：八向大字顺布一圈，北字落盘面零度，与二十四山诸环同轴。 */
    if (has.bafang && RB.bafang) {
      const [r0, r1] = RB.bafang;
      const ZHU = [{ d: 0, t: '北' }, { d: 45, t: '东北' }, { d: 90, t: '东' }, { d: 135, t: '东南' },
        { d: 180, t: '南' }, { d: 225, t: '西南' }, { d: 270, t: '西' }, { d: 315, t: '西北' }];
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (const z of ZHU) {
        const a0 = z.d - 22.5;
        s += '<path d="' + rdBand(r0, r1, a0, a0 + 45) + '" class="rd-cell"/>';
        s += rdTxtAuto((r0 + r1) / 2, z.d, z.t, 'bafang', 8, 'rd-gua-big');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 三爻卦画环：独立环带，三爻等距等长，跨角按半径定弦长；阳爻全长、阴爻两段。 */
    if (has.yao) {
      const [r0, r1] = RB.yao;
      const GUA_POS = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      for (const g in GUA_POS) {
        const d = GUA_POS[g], bits = GUA_BITS[g];
        s += rdYaoStack(r0, r1, d, bits, 'rd-yao-b', 9);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 透地盈缩六十龙：六十龙之宽依二十八宿宿度摊派，故各龙不等宽（最大余额法配六十分），
       与平分六十龙相对：平分者等分周天，盈缩者随宿度伸缩，故名。
       分母取本表宿度之合（三百五十五度），与二十八宿环同分母，故二环宿界相值、逐龙有字。 */
    function rdYingSuo(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      const names = FS.XIU_28;
      const total = names.reduce(function (a, nm) { return a + FS.XIU_DU_SHU[nm]; }, 0);
      const per = 60 / total;
      const quota = names.map(function (nm) { return FS.XIU_DU_SHU[nm] * per; });
      const cnt = quota.map(function (q) { return Math.floor(q); });
      let rest = 60 - cnt.reduce(function (a, c) { return a + c; }, 0);
      const order = quota.map(function (q, i) { return [i, q - Math.floor(q)]; })
        .sort(function (x, y) { return y[1] - x[1]; });
      for (let t = 0; t < order.length && rest > 0; t++) { cnt[order[t][0]]++; rest--; }
      let acc = 0, k = 0;
      for (let xi = 0; xi < names.length; xi++) {
        const w = FS.XIU_DU_SHU[names[xi]] / total * 360, step = w / Math.max(1, cnt[xi]);
        for (let j = 0; j < cnt[xi]; j++) {
          const a0 = acc + j * step, a1 = a0 + step;
          const gz = FS.gzAtIndex(k % 60); k++;
          g += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
          g += rdTxtAuto((r0 + r1) / 2, rdCellMid(a0, a1), gz, key, 60, 'rd-lab-sm');
          const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
          g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
        }
        acc += w;
      }
      return g;
    }
    /* 二十四山阴阳与三般卦：每山书阴阳与三般卦属，红格为阳山、常格为阴山。
       三般卦取三元龙归属（天元属南北卦、地元属江东卦、人元属江西卦），即江东、江西、南北八神，
       为飞星顺逆之据。卦名书全称，阴阳与卦名共四字一格，字号按本格弧长自算，不出格。 */
    function rdSanYuan24(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const yang = FS.shanYang(shan);
        const yuan = FS.yuanOf(shan);
        const san = yuan === '天' ? '南北卦' : (yuan === '地' ? '江东卦' : '江西卦');
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        g += rdTxtAuto((r0 + r1) / 2, d, (yang ? '阳' : '阴') + san, key, 24, yang ? 'rd-shan-yang' : 'rd-shan-yin');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid-j"/>';
      }
      return g;
    }
    /* 二十四山三元盘：只以红黑两色格示二十四山阴阳，不着一字，使色块自明。
       红格为阳山、常格为阴山，与三元龙阴阳同出一源（shanYang 自引擎）。 */
    function rdYinYangBlocks(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const yang = FS.shanYang(shan);
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid-j"/>';
      }
      return g;
    }
    /* 三元父母卦：每山所属天元、地元、人元，取三元龙归属（yuanOf 自引擎）。 */
    function rdFuMu(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, d, FS.yuanOf(shan) + '元', key, 24, 'rd-lab-gold');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 洪范双山五行：每山洪范五行（HONGFAN_WX）配双山四大局（SHAN_SANHE），二事同环分注。 */
    function rdHongFan(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const wx = FS.HONGFAN_WX[shan] || '';
        const ju = FS.SANHE_JU[FS.SHAN_SANHE[shan] || ''];
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, d, wx, key, 24, ju ? 'rd-lab-gold' : 'rd-lab-sm');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 十二长生水法：十二宫各占三十度，宫心落地盘本支山心，与十二支同轴，故读长生在申即申方；
       宫名依本设坐向所属四大局之长生位顺布十二宫，长生冠带临官帝旺四宫作吉色。
       四大局各有长生，一环只布一局，局名随环名注出，不在盘上另立图注。 */
    function rdChangSheng(key, juKey) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      const ju = FS.SANHE_JU[juKey] || FS.SANHE_JU['申子辰'];
      const zsIdx = FS.ZHI.indexOf(ju.zs);
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 12; k++) {
        const mid = rdZhiDeg(k);
        const nm = FS.SHENG_LONG_ORDER[(k - zsIdx + 12) % 12];
        const ji = '长生冠带临官帝旺'.indexOf(nm) >= 0 ? (nm === '帝旺' ? 2 : 1) : 0;
        g += '<path d="' + rdBand(r0, r1, mid - 15, mid + 15) + '" class="rd-cell' + (ji ? ' rd-yang' : '') + '"/>';
        g += rdTxtAuto((r0 + r1) / 2, mid, nm, key, 12, ji ? 'rd-shan-yang' : 'rd-lab-sm');
        const e0 = rdPx(r0, mid - 15), e1 = rdPx(r1, mid - 15);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid-j"/>';
      }
      return g;
    }
    /* 催官贵人禄马圈：坐山应天星者书其星名首称，无者留白；乌兔太阳之半环诸家不一，一并留白。 */
    function rdCuiGuan(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const t = FS.tianXingGui(shan);
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (t.gui ? ' rd-yang' : '') + '"/>';
        if (t.gui) g += rdTxtAuto((r0 + r1) / 2, d, t.star.split('、')[0], key, 24, 'rd-shan-yang');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 六十甲子配生年：周天六十等分，每格一甲子，自甲子起顺布。 */
    function rdJiaZi(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 60; k++) {
        const a0 = k * 6, a1 = a0 + 6;
        g += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, a0 + 3, FS.gzAtIndex(k), key, 60, 'rd-lab-sm');
        const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 二百四十分金：每山十格、每格一点五度，正针二十四山之下。
       格中天干以本山一百二十分金五子轮派（阳支配甲丙戊庚壬、阴支配乙丁己辛癸），
       戊己二子居山中线两侧，为龟甲空亡之位，故不着字、以红格示之。 */
    function rdFen240(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], c = rdShanDeg(i);
        const zhi = FS.SHAN_SHUANGZHI[shan] || shan;
        const yang = FS.ZHI.indexOf(zhi) % 2 === 0;
        const gans = yang ? ['甲', '丙', '戊', '庚', '壬'] : ['乙', '丁', '己', '辛', '癸'];
        for (let k = 0; k < 10; k++) {
          const a0 = c - 7.5 + k * 1.5, a1 = a0 + 1.5, mid = a0 + 0.75;
          const gan = gans[Math.floor(k / 2)];
          const kong = gan === '戊' || gan === '己';
          g += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
          if (kong) g += rdShaLine(r0, r1, mid);
          else g += rdTxtAuto((r0 + r1) / 2, mid, gan, key, 240, 'rd-lab-xs');
          const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
          g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
        }
      }
      return g;
    }
    /* 三百八十四爻：六十四卦各六爻，爻名以爻位配九六（阳爻称九、阴爻称六）。 */
    function rdYao384(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w;
        const up = TRI_ORDER[Math.floor(k / 8)], lo = TRI_ORDER[k % 8];
        const bits = GUA_BITS[lo].concat(GUA_BITS[up]);
        for (let y = 0; y < 6; y++) {
          const c0 = a0 + y * w / 6, mid = c0 + w / 12;
          g += '<path d="' + rdBand(r0, r1, c0, c0 + w / 6) + '" class="rd-cell"/>';
          g += rdTxtAuto((r0 + r1) / 2, mid, YAO_WEI[y] + (bits[y] ? '九' : '六'), key, 384, bits[y] ? 'rd-shan-yang' : 'rd-lab-xs');
          const e0 = rdPx(r0, c0), e1 = rdPx(r1, c0);
          g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
        }
      }
      return g;
    }
    /* 反吟伏吟：本卦与之爻爻相反者为反吟，本位即伏吟。只标其卦位，不判吉凶。 */
    function rdFanFu(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, mid = a0 + w / 2;
        const up = Math.floor(k / 8), lo = k % 8;
        const fan = (7 - up) * 8 + (7 - lo);
        const nm = GUA64_SHORT[Math.floor(fan / 8)][fan % 8];
        g += '<path d="' + rdBand(r0, r1, a0, a0 + w) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, mid, nm, key, 64, 'rd-lab-xs');
        const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid-j"/>';
      }
      return g;
    }
    /* 玄空大卦挨星五行：以本卦下卦之正体五行为体，书其五行。
       各门挨星口诀另有配数，此环只书本卦正体五行，不代各家之数。 */
    function rdAiXing(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, mid = a0 + w / 2;
        const lo = TRI_ORDER[k % 8];
        g += '<path d="' + rdBand(r0, r1, a0, a0 + w) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, mid, BA_WX[lo], key, 64, 'rd-lab-sm');
        const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 卦运卦气三环：方图卦运取先天卦序行列相交之位序；圆图卦运与卦气取上下卦
       先天序之和、洛书数之和，各化九取数（河图卦气本法）。三环皆由卦爻数理推得，
       与各门配运口诀并行不悖，故并书之以备参。 */
    function rdYunShu(key, how) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, mid = a0 + w / 2;
        const up = TRI_ORDER[Math.floor(k / 8)], lo = TRI_ORDER[k % 8];
        let v;
        if (how === 'fang') v = (XT_XU[up] - 1) * 8 + XT_XU[lo];
        else if (how === 'yun') v = ((XT_XU[up] + XT_XU[lo] - 1) % 9) || 9;
        else v = ((XT_LUOSHU[up] + XT_LUOSHU[lo] - 1) % 9) || 9;
        g += '<path d="' + rdBand(r0, r1, a0, a0 + w) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, mid, HZ_NUM[v] || String(v), key, 64, 'rd-lab-sm');
        const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 抽爻换象吉凶线：六十四卦各六爻、共三百八十四位，每位一爻。抽此爻则阴阳互变
       而成他卦，所得之卦与本卦相较，吉者为珠宝线、凶者为火坑线。
       盘上以绿格示珠宝、红格示火坑，只标线位，不着一字。
       判法：爻变之后所得之卦与本卦卦气数相同，或两卦气数相加为十（合十）者为珠宝；
       余者为火坑。此为玄空大卦抽爻换象之一式，诸家口诀另有出入。 */
    function rdChouYao(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w;
        const up = TRI_ORDER[Math.floor(k / 8)], lo = TRI_ORDER[k % 8];
        const bits = GUA_BITS[lo].concat(GUA_BITS[up]);
        const q0 = ((XT_LUOSHU[lo] + XT_LUOSHU[up] - 1) % 9) || 9;
        for (let y = 0; y < 6; y++) {
          const c0 = a0 + y * w / 6;
          const bt = bits.slice();
          bt[y] = bt[y] ? 0 : 1;
          const lo2 = guaOfBits(bt.slice(0, 3)), up2 = guaOfBits(bt.slice(3, 6));
          const q1 = ((XT_LUOSHU[lo2] + XT_LUOSHU[up2] - 1) % 9) || 9;
          const bao = q0 === q1 || q0 + q1 === 10;
          g += '<path d="' + rdBand(r0, r1, c0, c0 + w / 6) + '" class="rd-cell ' + (bao ? 'rd-jewel' : 'rd-pit') + '"/>';
        }
      }
      return g;
    }
    /* 玄空大卦九星盘：卦气化九配洛书九星，一贪二巨三禄四文五廉六武七破八辅九弼。 */
    function rdXuanXing(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, mid = a0 + w / 2;
        const up = TRI_ORDER[Math.floor(k / 8)], lo = TRI_ORDER[k % 8];
        const v = ((XT_LUOSHU[up] + XT_LUOSHU[lo] - 1) % 9) || 9;
        g += '<path d="' + rdBand(r0, r1, a0, a0 + w) + '" class="rd-cell"/>';
        g += rdTxtAuto((r0 + r1) / 2, mid, LUO_STAR[v], key, 64, 'rd-lab-sm');
        const e0 = rdPx(r0, a0), e1 = rdPx(r1, a0);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 赖公大五行催官诀：人盘消砂所用五行，由该山所隶二十八宿之七曜五行推衍，
       与正体五行、双山五行并为三套，不可互套。此为推衍一例，诸家配属另有出入。 */
    function rdLaiGong(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const xius = FS.SHAN_XIU[shan] || [];
        const idx = xius.length ? FS.XIU_28.indexOf(xius[0]) : -1;
        const wx = idx >= 0 ? XIU_YAO_WX[idx % 7] : '';
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        if (wx) g += rdTxtAuto((r0 + r1) / 2, d, wx, key, 24, 'rd-lab-sm');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    /* 郭璞纳甲净阴净阳：乾纳甲壬、坤纳乙癸、坎纳戊申子辰、离纳己寅午戌、
       震纳庚亥卯未、兑纳丁巳酉丑、艮纳丙、巽纳辛。阳山作阳色，阴山作常色。 */
    function rdNajia(key) {
      const b = RB[key]; if (!b) return '';
      const r0 = b[0], r1 = b[1];
      let g = '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i], d = rdShanDeg(i);
        const yang = JING_YANG.indexOf(shan) >= 0;
        g += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        g += rdTxtAuto((r0 + r1) / 2, d, yang ? '阳' : '阴', key, 24, yang ? 'rd-shan-yang' : 'rd-shan-yin');
        const e0 = rdPx(r0, d - 7.5), e1 = rdPx(r1, d - 7.5);
        g += '<line x1="' + WHEEL.n(e0[0]) + '" y1="' + WHEEL.n(e0[1]) + '" x2="' + WHEEL.n(e1[0]) + '" y2="' + WHEEL.n(e1[1]) + '" class="rd-grid"/>';
      }
      return g;
    }
    if (has.fanFu) s += rdFanFu('fanFu');
    if (has.aixing) s += rdAiXing('aixing');
    if (has.yunShu) s += rdYunShu('yunShu', 'yun');
    if (has.yuanQi) s += rdYunShu('yuanQi', 'qi');
    if (has.chouYao) s += rdChouYao('chouYao');
    if (has.laiGong) s += rdLaiGong('laiGong');
    if (has.najia) s += rdNajia('najia');
    if (has.yingsuo) s += rdYingSuo('yingsuo');
    if (has.sanyuan24) s += rdSanYuan24('sanyuan24');
    if (has.zhengSanYuan) s += rdYinYangBlocks('zhengSanYuan');
    if (has.sanyuan24c) s += rdYinYangBlocks('sanyuan24c');
    if (has.fumu) s += rdFuMu('fumu');
    if (has.hongfan) s += rdHongFan('hongfan');
    if (has.changsheng) s += rdChangSheng('changsheng', JU_KEY);
    if (has.cuiGuan) s += rdCuiGuan('cuiGuan');

        /* 天池与磁针：白圆（0至12%）、NESW 贴池沿、海底线、菱形磁针。
       形制真源 罗经完全详解指南.md 一之三：天池为中央圆槽、内置磁针与子午红线、
       且为内盘第一层，故绘于盘面之内，随盘面同转。
       池面四方字与磁针同轴：北字落盘面零度，磁针北端与之同位。
       磁针自有磁性，恒指南北；盘面转时针随之同转而针仍指南北，
       故读者由针与盘面零度之同位，知盘面所对之真方位。 */
    if (has.chi) {
      const [r0, r1] = RB.chi;
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-chi-rim"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + (r1 - 4) + '" class="rd-chi"/>';
      s += '<line x1="' + C + '" y1="' + (C - r1 + 8) + '" x2="' + C + '" y2="' + (C + r1 - 8) + '" class="rd-haixian"/>';
      const labs = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];
      for (const [t2, d] of labs) {
        const p = rdPx(r1 - 14, d);
        s += '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="rd-nesw" style="font-size:22px"'
          + ' transform="rotate(' + WHEEL.ring(d) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + t2 + '</text>';
      }
      const half = (r1 - 12), wid = half * 0.16;
      s += '<path d="M' + C + ' ' + (C - half) + 'L' + (C + wid) + ' ' + C + 'L' + C + ' ' + C + 'L' + (C - wid) + ' ' + C + 'Z" class="rd-needle-n"/>';
      s += '<path d="M' + C + ' ' + (C + half) + 'L' + (C + wid) + ' ' + C + 'L' + C + ' ' + C + 'L' + (C - wid) + ' ' + C + 'Z" class="rd-needle-s"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="6" class="rd-pin"/>';
    }
    /* 环间细线（连续环系逐环归一） */
    for (const k in RB) {
      if (!has[k]) continue;
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + RB[k][0] + '" class="rd-ring"/>';
    }
    /* 天心十道：随盘转则失其固定瞄准之意，故 overlay 模式下不绘于此旋转 svg，改由 realDiskOverlay 固定层出 */
    if (o.cross !== false && o.overlay !== true) {
      s += '<line x1="' + (C - ROUT) + '" y1="' + C + '" x2="' + (C + ROUT) + '" y2="' + C + '" class="rd-cross"/>';
      s += '<line x1="' + C + '" y1="' + (C - ROUT) + '" x2="' + C + '" y2="' + (C + ROUT) + '" class="rd-cross"/>';
    }
    /* 热区：全环带按地盘正针二十四山分格（除天池），点选任一环带同山皆选中 */
    const hitIn = has.chi ? RB.chi[1] : 96;
    const hitOut = RB.deg ? RB.deg[1] : ROUT;
    for (let i = 0; i < 24; i++) {
      const d = rdShanDeg(i);
      const bd = rdBand(hitIn, hitOut, d - 7.5, d + 7.5);
      s += '<path d="' + bd + '" class="w-hit' + (i === sel ? ' is-on' : '') + '" data-i="' + i + '" onclick="' + (o.pick || 'lpPickReal') + '(' + i + ')"/>';
      s += '<path d="' + bd + '" class="w-sel"/>';
    }
    /* 层名录 recorded rings 自内向外，题读亦自天池向外，故顺取串接 */
    const label = RD_SETS[mode].name + '共' + rings.length + '层：自天池向外依次为' + rings.map(function (k) { return RD_RING_NAME_OF(mode, JU_KEY)[k]; }).join('、') + '。';
    return '<svg class="wheel rd-wheel" id="' + o.id + '" viewBox="0 0 2000 2000" role="img" aria-label="' + label + '">' + s + '</svg>';
  }
  /* 固定层（不随盘转）：天心十道。
     形制真源 罗经完全详解指南.md 一之三：外盘方座四边设十字红线即天心十道，
     用以压线读数；又十字线交点对天池中心，读数时压于坐向线上。
     故十字线属外盘、为读数之基准参照，拨盘时恒定不动。
     天池与磁针属内盘（第一层），与盘面同转，已在 realDisk 内绘出，不在此层。 */
  function realDiskOverlay(o) {
    const C = RD_C, ROUT = 985;
    if (o.cross === false) {
      return '<svg class="wheel rd-wheel rd-overlay" id="' + (o.id || 'lpCrossFixed') + '" viewBox="0 0 2000 2000" aria-hidden="true"></svg>';
    }
    let s = '<line x1="' + (C - ROUT) + '" y1="' + C + '" x2="' + (C + ROUT) + '" y2="' + C + '" class="rd-cross"/>'
      + '<line x1="' + C + '" y1="' + (C - ROUT) + '" x2="' + C + '" y2="' + (C + ROUT) + '" class="rd-cross"/>';
    return '<svg class="wheel rd-wheel rd-overlay" id="' + (o.id || 'lpCrossFixed') + '" viewBox="0 0 2000 2000" aria-hidden="true">' + s + '</svg>';
  }

  global.LUOPAN = {
    GUIDE_STEPS: GUIDE_STEPS,
    LS_MODE: LS_MODE,
    wheelSvg: function () { return global.FS_LUO.wheelSvg.apply(global.FS_LUO, arguments); },
    layerDisk: layerDisk,
    gongDisk: gongDisk,
    xiuDisk: xiuDisk,
    XIU_XIANG: XIU_XIANG,
    realDisk: realDisk,
    realDiskOverlay: realDiskOverlay,
    RD_SETS: RD_SETS,
    RD_RING_NAME_OF: RD_RING_NAME_OF,
    rdBandsOf: rdBandsOf,
    pick: pick,
    detail: detail,
    setMode: setMode,
    setCat: setCat,
    restoreMode: restoreMode,
    guide: guide,
    lerpAngle: lerpAngle,
    Compass: Compass
  };
})(typeof window !== 'undefined' ? window : this);


