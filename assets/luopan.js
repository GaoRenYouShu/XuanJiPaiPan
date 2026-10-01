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

  /* 通用层盘骨架（viewBox 440，与阴宅穿山透地盘同式）：外圈二十四山、内圈数据环。
     径向自盘心向外：盘心 78、内界圈 120、内圈数据带 146、外圈刻度 168、外环 182、外圈山名 206。
     外圈二十四山与测角同制式（子在下、午在上），盘面角即地理度，落点取角与 fengshui-engine 一致。 */
  function layerDisk(o) {
    const FS = global.FENGSHUI;
    const C = 220, OUT = 182, TICK0 = 168, LAB_OUT = 206, IN = 120, DATA_R = 146, CORE = 78, ARC = 192;
    const sel = o.sel;
    let s = '';
    /* 外圈逐山弧与刻度 */
    for (let i = 0; i < 24; i++) {
      const d = FS.fwShanDeg(i);
      s += `<path d="${WHEEL.arc(ARC, d - 7.5, d + 7.5)}" class="w-arc"/>`;
      const a = WHEEL.px(TICK0, d), c = WHEEL.px(TICK0 - 8, d);
      s += `<line x1="${WHEEL.n(a[0])}" y1="${WHEEL.n(a[1])}" x2="${WHEEL.n(c[0])}" y2="${WHEEL.n(c[1])}" class="w-tick"/>`;
    }
    /* 外圈山名环布 */
    for (let i = 0; i < 24; i++) {
      const d = FS.fwShanDeg(i);
      const a = WHEEL.px(LAB_OUT, d);
      const ba = o.bad && o.bad(i);
      s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab w-lab-xl${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
        + ` style="fill:${ba ? 'var(--wheel-bad)' : 'var(--wheel-ink)'};fill-opacity:${ba ? 1 : .9}"`
        + ` transform="rotate(${WHEEL.ring(d)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${FS.SHAN_LIST[i]}</text>`;
    }
    /* 内圈数据环：调用页按山给每行 {text, deg, color, kong} */
    if (o.inner) {
      for (let i = 0; i < 24; i++) {
        const rows = o.inner(i, FS.SHAN_LIST[i]) || [];
        for (const r of rows) {
          if (r.kong) {
            const c = WHEEL.px(DATA_R - 12, r.deg), e = WHEEL.px(DATA_R + 12, r.deg);
            s += `<line x1="${WHEEL.n(c[0])}" y1="${WHEEL.n(c[1])}" x2="${WHEEL.n(e[0])}" y2="${WHEEL.n(e[1])}" style="stroke:var(--wheel-bad);stroke-width:1.4;stroke-opacity:.8"/>`;
            continue;
          }
          const a = WHEEL.px(DATA_R, r.deg);
          s += `<text x="${WHEEL.n(a[0])}" y="${WHEEL.n(a[1])}" class="w-lab${i === sel ? ' w-lab-cur' : ''}" data-i="${i}"`
            + ` style="font-size:10px;fill:${r.color || 'var(--wheel-ink)'};fill-opacity:.92"`
            + ` transform="rotate(${WHEEL.radial(r.deg)} ${WHEEL.n(a[0])} ${WHEEL.n(a[1])})">${r.text}</text>`;
        }
      }
    }
    /* 点选态：高亮弧、热区、悬停预览 */
    s += `<path id="${o.curId}" class="w-arc w-arc-cur" d="${WHEEL.arc(ARC, FS.fwShanDeg(sel) - 7.5, FS.fwShanDeg(sel) + 7.5)}"/>`;
    for (let i = 0; i < 24; i++) {
      const d = FS.fwShanDeg(i);
      const bd = WHEEL.band(IN, OUT, d - 7.5, d + 7.5);
      s += `<path d="${bd}" class="w-hit${i === sel ? ' is-on' : ''}" data-i="${i}" onclick="${o.pick}(${i})"/>`;
      s += `<path d="${bd}" class="w-sel"/>`;
    }
    /* 圈线、盘心、游标、盘心两行 */
    s += `<circle cx="${C}" cy="${C}" r="${OUT}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${IN}" class="w-ring"/>`
      + `<circle cx="${C}" cy="${C}" r="${CORE}" class="w-core"/>`;
    const q0 = WHEEL.px(CORE, FS.fwShanDeg(sel)), q1 = WHEEL.px(OUT, FS.fwShanDeg(sel));
    s += `<line id="${o.id}Needle" x1="${WHEEL.n(q0[0])}" y1="${WHEEL.n(q0[1])}" x2="${WHEEL.n(q1[0])}" y2="${WHEEL.n(q1[1])}" class="w-needle"/>`
      + `<circle id="${o.id}Dot" cx="${WHEEL.n(q1[0])}" cy="${WHEEL.n(q1[1])}" r="3.5" class="w-dot"/>`;
    const ct = o.core ? o.core(sel) : ['', ''];
    s += `<text id="${o.id}C1" x="${C}" y="${C - 24}" text-anchor="middle" dominant-baseline="central"`
      + ` style="font-size:13px;font-weight:700;fill:var(--wheel-deep)">${ct[0]}</text>`
      + `<text id="${o.id}C2" x="${C}" y="${C - 4}" text-anchor="middle" dominant-baseline="central"`
      + ` style="font-size:10px;fill:${ct[2] || 'var(--wheel-ink2)'}">${ct[1]}</text>`
      + `<text id="${o.id}C3" x="${C}" y="${C + 20}" text-anchor="middle" dominant-baseline="central"`
      + ` style="font-size:10px;fill:var(--wheel-ink2)">${ct[3] || '点选盘面任一山细读'}</text>`;
    return `<svg class="wheel wheel-luo" id="${o.id}" viewBox="0 0 440 440" role="img" aria-label="${o.label}">${s}</svg>`;
  }

  /* 点选三件套：热区 is-on、环名 w-lab-cur、当前弧 d、游标指向所选之山（按 degOf 取盘面角）。 */
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
      const d = o.degOf ? o.degOf(o.i) : global.FENGSHUI.fwShanDeg(o.i);
      if (ln && dt) {
        const q0 = WHEEL.px(78, d), q1 = WHEEL.px(182, d);
        ln.setAttribute('x1', WHEEL.n(q0[0])); ln.setAttribute('y1', WHEEL.n(q0[1]));
        ln.setAttribute('x2', WHEEL.n(q1[0])); ln.setAttribute('y2', WHEEL.n(q1[1]));
        dt.setAttribute('cx', WHEEL.n(q1[0])); dt.setAttribute('cy', WHEEL.n(q1[1]));
      }
    }
  }

  function detail(id, html) { const e = document.getElementById(id); if (e) e.innerHTML = html; }

  /* 模式切换：仿择日页，切 .lp-mode-btn.active 与 [data-mode-block] 显隐，localStorage 记忆。 */
  function setMode(mode) {
    LP_MODE = mode;
    document.querySelectorAll('.lp-mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });
    document.querySelectorAll('[data-mode-block]').forEach(function (el) {
      el.hidden = (el.getAttribute('data-mode-block') !== mode);
    });
    try { localStorage.setItem(LS_MODE, mode); } catch (e) {}
  }
  function restoreMode() {
    try { const m = localStorage.getItem(LS_MODE); if (m) setMode(m); } catch (e) {}
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

  /* 层白话卡：点任意层出此卡（该层是什么、看哪里、依何典籍）。内容为本库通用专业口径，不写页面专属副本。 */
  const LAYER_INFO = {
    zheng: { t: '地盘正针', x: '罗盘根本之盘，子山正中为周天零度，二十四山同刻。用于立向、格龙、乘气，余二盘皆以此为基准偏移。' },
    zhong: { t: '人盘中针', x: '较地盘逆偏七点五度（子山心落三百五十二点五度），用于消砂拨峰，论砂与坐山生克。' },
    feng: { t: '天盘缝针', x: '较地盘顺偏七点五度（子山心落七点五度），用于纳水，看水口与生旺墓三合。' },
    fen: { t: '百二十分金', x: '二十四山每山五分金、每分三度，丙丁庚辛为珠宝旺相可取，戊己龟甲空亡、甲乙壬癸孤虚不用。' },
    chuan: { t: '穿山七十二龙', x: '每龙五度，每山三龙，丙丁庚辛旺相为珠宝，戊己龟甲与八干四维正中大空亡皆不可用，用于格龙。' },
    tou: { t: '透地六十龙', x: '每龙六度，甲子起壬山之初，去十二大空亡重布，用于穿山之下定穴内之龙。' },
    bagua: { t: '先天后天八卦', x: '先天八卦（乾一兑二离三震四巽五坎六艮七坤八）定体，后天八卦（坎北离南）布用，合说卦方位。' },
    luoshu: { t: '洛书九宫', x: '戴九履一左三右七二四为肩六八为足五居中，合后天八卦方位，为玄空飞星与紫白之本。' },
    yun: { t: '三元九运', x: '一八六四甲子起上元一运，每运二十年，九运一周一百八十年；二〇二四至二〇四三为下元九运（九紫离）。' },
    xiu: { t: '二十八宿', x: '外圈四象方位、内圈二十八宿，环向逆时针，角宿起于东南；宿曜吉凶依通书值宿，罗盘此层只作周天宿位对应，不参与吉凶裁断。' },
    liugua: { t: '六十四卦观象', x: '先天方图圆图列六十四卦，只示卦象与先天方位，不配九运、不判吉凶（卦气配运诸家不一，本库不臆造）。' },
    sanhe: { t: '三合水法', x: '长生十二宫（长生沐浴冠临旺衰墓绝胎养）配双山五行，定水局生旺墓，四大局为金木水火。' },
    bazhai: { t: '八宅游年', x: '东四命（坎离震巽）西四命（乾坤艮兑），游年九星：生气延年天医伏位为吉，绝命五鬼祸害六煞为凶。' },
    tianxing: { t: '天星与消砂纳水', x: '赖公《催官篇》以二十四山配天星论贵贱（亥应紫微、艮应天市等）；赖公五行与宿度五行诸家不一，本库依师传口径，不臆造。' },
    decl: { t: '磁偏角校准', x: '真方位等于磁方位加磁偏角（东偏为正、西偏为负）；按所在地经纬度取当地磁偏角，方将电子罗盘所读磁北折为地理真北。' }
  };
  function layerCard(id) {
    const d = LAYER_INFO[id];
    if (!d) return '';
    return `<div class="lp-card"><b>${d.t}</b><span>${d.x}</span></div>`;
  }

  /* 角度插值（0/360 环绕），EMA 平滑用 */
  function lerpAngle(a, b, k) {
    let d = ((b - a + 540) % 360) - 180;
    return (((a + d * k) % 360) + 360) % 360;
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
    const C = 220, ARC = 192, OUT = 182, IN = 120, CORE = 78, LAB_OUT = 206, LAB_IN = 148, TICK0 = 168, TICK1 = 176, P0 = 82, P1 = 116;
    const xs = FS.XIU_28, W = 360 / 28, A0 = 135;
    const span = function (i) { return [A0 - (i + 1) * W, A0 - i * W]; };
    const mid = function (i) { return A0 - (i + 0.5) * W; };
    const sel = o.sel;
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
      const bd = WHEEL.band(IN, OUT, sp[0], sp[1]);
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
     opts：{wheelId, read:{deg,shan,decl,true,lvl}, getDecl, onRead}
     getDecl 返回当地磁偏角（东正西负）或 null；onRead(deg,shan,trueDeg) 于每帧回调。
     电子罗盘仅作参考，不取代传统格龙定针。 */
  function Compass(opts) {
    opts = opts || {};
    const FS = global.FENGSHUI;
    const wheel = opts.wheelId ? document.getElementById(opts.wheelId) : null;
    const R = opts.read || {};
    let raf = null, last = null, heading = 0, running = false;
    function read(id) { return id ? document.getElementById(id) : null; }
    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (last == null) return;
      const decl = typeof opts.getDecl === 'function' ? opts.getDecl() : null;
      const trueDeg = (decl != null && isFinite(decl)) ? ((heading + decl) % 360 + 360) % 360 : heading;
      const z = FS.zhenShan(trueDeg, 'zheng');
      const shan = z ? z.shan : '子';
      if (wheel) {
        /* 转盘旋转交由调用页 onRead 处理（真实罗盘页的转盘与缩放拖移叠加）；
           页面未接管时（opts.rotate!==false）才由本库旋转。 */
        if (opts.rotate !== false) {
          wheel.style.transform = 'rotate(' + (180 + heading) + 'deg)';
          wheel.style.transformOrigin = '50% 50%';
        }
      }
      const d = read(R.deg); if (d) d.textContent = trueDeg.toFixed(1);
      const sn = read(R.shan); if (sn) sn.textContent = shan + '山';
      const dc = read(R.decl); if (dc) dc.textContent = (decl != null && isFinite(decl)) ? decl.toFixed(2) : '未取';
      const tr = read(R.true); if (tr) tr.textContent = trueDeg.toFixed(1);
      const lv = read(R.lvl); if (lv) lv.textContent = lvMsg;
      if (typeof opts.onRead === 'function') opts.onRead(trueDeg, shan, decl);
    }
    let lvMsg = '已水平';
    function onOrient(e) {
      let h = (typeof e.webkitCompassHeading === 'number') ? e.webkitCompassHeading
        : (typeof e.alpha === 'number' ? (e.absolute ? e.alpha : (360 - e.alpha)) : null);
      if (h == null) return;
      if (last == null) heading = h; else heading = lerpAngle(heading, h, 0.2);
      last = h;
      const beta = Math.abs(e.beta || 0), gamma = Math.abs(e.gamma || 0);
      lvMsg = (beta > 30 || gamma > 30) ? '请将罗盘放平' : '已水平';
      if (!raf) frame();
    }
    function start() {
      if (running) return Promise.resolve(true);
      running = true;
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        return DeviceOrientationEvent.requestPermission().then(function (st) {
          if (st === 'granted') { window.addEventListener('deviceorientation', onOrient, true); frame(); return true; }
          running = false; return false;
        }).catch(function () { running = false; return false; });
      }
      window.addEventListener('deviceorientation', onOrient, true);
      window.addEventListener('deviceorientationabsolute', onOrient, true);
      frame();
      return Promise.resolve(true);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null; last = null;
      window.removeEventListener('deviceorientation', onOrient, true);
      window.removeEventListener('deviceorientationabsolute', onOrient, true);
    }
    return { start: start, stop: stop, getHeading: function () { return heading; } };
  }

  let LP_MODE = 'zong';

  /* ============================================================
     真实罗盘（realDisk）：照真实罗经形制的高保真转盘。
     形制真源：罗经完全详解指南.md 十五层制与问真罗盘盘面实物。
     口径：
       度数以地盘子山中心为零度向东递增；盘面角为地理度加一百八十（子山在下），
       与站内测角同源。环自外向内：周天度数、二十八宿（三百六十五点二五度不等分）、
       六十四卦（卦名与卦画，只观象不配运）、正兼向九度带、天盘缝针、人盘中针、
       地盘正针（二十四山阳山红格）、八方位八卦、天池（磁针与海底线）。
     四盘制环数（环由外向内裁）：入门十层、三合十五层、三元十九层、综合二十层。
     三底色（黑电木金字、黄铜黑字、白底黑字）走 CSS 令牌切换，不重画。
     盘面为仪器形制件，黑金红三色属罗经实物本色，与纸本页面以页级段例外口径区分。 
     ============================================================ */
  const RD_C = 1000;
  const YANG_SHAN = { 乾: 1, 坤: 1, 艮: 1, 巽: 1, 寅: 1, 申: 1, 巳: 1, 亥: 1, 甲: 1, 庚: 1, 壬: 1, 丙: 1 };
  const JIE_QI_24 = ['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪'];
  const GUA_SYMBOL = { 乾: '☰', 兑: '☱', 离: '☲', 震: '☳', 巽: '☴', 坎: '☵', 艮: '☶', 坤: '☷' };
  const GUA_BITS = { 乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0], 巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0] };
  const TRI_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
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
  /* 四盘制（问真制式）：入门十层、三合十五层、三元十九层、综合二十层。
     环组自外向内递增，切盘环组不同观感立变；环名照真实罗经层名。天池恒在最内。 */
  const RD_RING_NAME = {
    chi: '天池', zhizhen: '指南针', xtGua: '先天八卦卦象', xtName: '先天八卦卦名',
    bafang: '八方方位', heLuo: '河图洛书', htGua: '后天八卦卦象', htName: '后天八卦卦名',
    zheng: '二十四山三元盘', luoTu: '河图洛书数', htGuaEr: '后天八卦卦象', htNameEr: '后天八卦卦名',
    zhengSanhe: '二十四山地盘三合盘', zhong: '二十四山人盘三合盘', feng: '二十四山天盘三合盘',
    basha: '八煞黄泉', jieqi: '二十四节气', chuan: '穿山七十二龙', fen: '百二十分金',
    fen720: '七百二十分金', tou: '透地六十龙', diMu: '地母九星翻卦', tianXing: '二十四山天星',
    jieYao: '劫耀煞', gua64Hua: '六十四卦卦象', gua64Ming: '六十四卦卦名', xiu: '二十八星宿', deg: '周天360度'
  };
  const RD_SETS = {
    zonghe:  { name: '综合罗盘', n: 20, rings: ['chi','zhizhen','xtGua','xtName','bafang','heLuo','htGua','htName','zheng','luoTu','htGuaEr','htNameEr','zhengSanhe','zhong','feng','basha','jieqi','chuan','fen','gua64Hua','gua64Ming','xiu','deg'] },
    sanyuan: { name: '三元罗盘', n: 19, rings: ['chi','zhizhen','htGua','htName','heLuo','bafang','basha','diMu','tianXing','jieYao','zheng','jieqi','chuan','tou','fen','gua64Hua','gua64Ming','xiu','deg'] },
    sanhe:   { name: '三合罗盘', n: 15, rings: ['chi','zhizhen','htGua','htName','bafang','basha','diMu','zheng','chuan','fen720','zhong','tou','feng','xiu','deg'] }
  };

  function rdPx(r, deg) { const a = (deg - 90) * Math.PI / 180; return [RD_C + r * Math.cos(a), RD_C + r * Math.sin(a)]; }
  function rdArc(r, a0, a1) {
    const p0 = rdPx(r, a0), p1 = rdPx(r, a1), lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + WHEEL.n(p0[0]) + ' ' + WHEEL.n(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + lg + ' 1 ' + WHEEL.n(p1[0]) + ' ' + WHEEL.n(p1[1]);
  }
  function rdBand(r0, r1, a0, a1) {
    const A = rdPx(r1, a0), B = rdPx(r1, a1), D = rdPx(r0, a1), E = rdPx(r0, a0), lg = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + WHEEL.n(A[0]) + ' ' + WHEEL.n(A[1]) + 'A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + WHEEL.n(B[0]) + ' ' + WHEEL.n(B[1])
      + 'L' + WHEEL.n(D[0]) + ' ' + WHEEL.n(D[1]) + 'A' + r0 + ' ' + r0 + ' 0 ' + lg + ' 0 ' + WHEEL.n(E[0]) + ' ' + WHEEL.n(E[1]) + 'Z';
  }
  function rdTxt(r, deg, txt, fs, cls, extra) {
    const p = rdPx(r, deg);
    return '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="' + cls + '"'
      + ' style="font-size:' + fs + 'px"' + (extra || '')
      + ' transform="rotate(' + WHEEL.ring(deg) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + txt + '</text>';
  }
  /* 象地环字（四正正立、余沿半径），用于八卦大字与山名内环 */
  function rdTxtDir(r, deg, txt, fs, cls, extra) {
    const p = rdPx(r, deg);
    return '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="' + cls + '"'
      + ' style="font-size:' + fs + 'px"' + (extra || '')
      + ' transform="rotate(' + WHEEL.dir(deg) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + txt + '</text>';
  }

  /* 真实罗盘。opts：{id, sel(选中山序), mode(盘制 key), cross(天心十道 bool), pick}
     返回 svg 字符串。环系自外向内连续铺满、环间不留空带（照真实罗经盘面圈层紧排）。
     四盘制固定层数：入门十层、三合十五层、三元十九层、综合二十层（含天池），
     层数即环数，切盘环组不同、观感立变。三底色走 CSS 令牌。 */
  function realDisk(o) {
    const FS = global.FENGSHUI;
    const mode = RD_SETS[o.mode] ? o.mode : 'zonghe';
    const rings = RD_SETS[mode].rings;
    const has = {}; rings.forEach(function (k) { has[k] = true; });
    const sel = o.sel || 0;
    const C = RD_C, ROUT = 985;
    /* 环系半径（自外向内连续、零空带；各环 [内沿,外沿]，相邻环外沿＝下一环内沿）。 */
    const RB = {
      deg:   [916, 976],   /* 周天度数 */
      xiu:   [856, 916],   /* 二十八宿（365.25 度不等分） */
      gua64: [766, 856],   /* 六十四卦（卦名＋卦画） */
      fen:   [722, 766],   /* 百二十分金（每分三度） */
      tou:   [678, 722],   /* 透地平分六十龙（每龙六度） */
      chuan: [634, 678],   /* 穿山七十二龙（每龙五度） */
      jian:  [598, 634],   /* 正兼向九度带 */
      feng:  [520, 598],   /* 天盘缝针二十四山 */
      zhong: [442, 520],   /* 人盘中针二十四山 */
      zheng: [364, 442],   /* 地盘正针二十四山（阳山红格） */
      luoshu:[280, 364],   /* 洛书九宫数（自天池第五圈，配卦名注记） */
      bagua: [214, 280],   /* 八方位八卦大字 */
      yao:   [150, 214],   /* 三爻卦画环 */
      zhu:   [90,  150],   /* 八方位注记环（红块白字方位） */
      chi:   [0,   90]     /* 天池（白圆、磁针、海底线、NESW 贴池沿） */
    };
    let s = '';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + ROUT + '" class="rd-face"/>';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + ROUT + '" class="rd-rim"/>';
    /* 周天度数环 */
    if (has.deg) {
      const [r0, r1] = RB.deg;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let d = 0; d < 360; d++) {
        const big = d % 10 === 0, mid = d % 5 === 0;
        const r2 = big ? r0 + 22 : (mid ? r0 + 14 : r0 + 8);
        const a = rdPx(r1, d), b = rdPx(r2, d);
        s += '<line x1="' + WHEEL.n(a[0]) + '" y1="' + WHEEL.n(a[1]) + '" x2="' + WHEEL.n(b[0]) + '" y2="' + WHEEL.n(b[1]) + '" class="' + (big ? 'rd-tick-j' : 'rd-tick') + '"/>';
      }
      for (let d = 0; d < 360; d += 10) {
        const p = rdPx((r0 + r1) / 2 + 14, d);
        s += '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="rd-num" style="font-size:21px"'
          + ' transform="rotate(' + WHEEL.ring(d) + ' ' + WHEEL.n(p[0]) + ' ' + WHEEL.n(p[1]) + ')">' + d + '</text>';
      }
    }
    /* 二十八宿环 */
    if (has.xiu) {
      const FS_DU = 365.25;
      const [r0, r1] = RB.xiu;
      let cum = 0;
      for (let i = 0; i < FS.XIU_28.length; i++) {
        const nm = FS.XIU_28[i], du = FS.XIU_DU_SHU[nm], w = du / FS_DU * 360;
        const a0 = cum, a1 = cum + w; cum = a1;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        const mid = (a0 + a1) / 2;
        const shao = du % 10 !== 0;
        s += rdTxt((r0 + r1) / 2, mid, nm + du + (shao ? '少' : '太'), 20, 'rd-lab-red');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 六十四卦环：外半带卦名、内半带卦画（环状满环） */
    if (has.gua64) {
      const [r0, r1] = RB.gua64;
      const nmR = (r0 + r1) / 2 + 24, drawR0 = r0 + 6, drawW = (r1 - r0) / 2 - 18;
      for (let k = 0; k < 64; k++) {
        const w = 360 / 64, a0 = k * w, a1 = a0 + w, mid = a0 + w / 2;
        const up = Math.floor(k / 8), lo = k % 8;
        const nm = GUA64[TRI_ORDER[up]][lo];
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell"/>';
        s += rdTxt(nmR, mid, nm.length > 3 ? nm.slice(0, 2) : nm, 19, 'rd-lab-gold');
        /* 卦画：六爻横线沿半径排布，阳爻全长、阴爻两段 */
        const bits = GUA_BITS[TRI_ORDER[lo]].concat(GUA_BITS[TRI_ORDER[up]]);
        for (let y = 0; y < 6; y++) {
          const rr = drawR0 + drawW - 4 - y * (drawW / 7.0);
          const jw = w * 0.30;
          if (bits[y]) {
            const p1 = rdPx(rr, mid - jw), p2 = rdPx(rr, mid + jw);
            s += '<line x1="' + WHEEL.n(p1[0]) + '" y1="' + WHEEL.n(p1[1]) + '" x2="' + WHEEL.n(p2[0]) + '" y2="' + WHEEL.n(p2[1]) + '" class="rd-yao"/>';
          } else {
            for (const sg of [-1, 1]) {
              const p1 = rdPx(rr, mid + sg * jw * 0.18), p2 = rdPx(rr, mid + sg * jw);
              s += '<line x1="' + WHEEL.n(p1[0]) + '" y1="' + WHEEL.n(p1[1]) + '" x2="' + WHEEL.n(p2[0]) + '" y2="' + WHEEL.n(p2[1]) + '" class="rd-yao"/>';
            }
          }
        }
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 正兼向九度带 */
    if (has.jian) {
      const [r0, r1] = RB.jian;
      s += '<path d="' + rdBand(r0, r1, 0, 359.999) + '" class="rd-band"/>';
      for (let i = 0; i < 24; i++) {
        const d = FS.fwShanDeg(i);
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 7.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 7.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 7.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 7.5)[1]) + '" class="rd-grid-j"/>';
        s += '<line x1="' + WHEEL.n(rdPx(r0, d)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d)[1]) + '" class="rd-tick"/>';
        for (const k of [-4.5, 4.5]) {
          s += '<line x1="' + WHEEL.n(rdPx(r0, d + k)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d + k)[1]) + '" x2="' + WHEEL.n(rdPx((r0 + r1) / 2, d + k)[0]) + '" y2="' + WHEEL.n(rdPx((r0 + r1) / 2, d + k)[1]) + '" class="rd-tick"/>';
        }
      }
    }
    /* 三针三环：缝针、中针、正针，二十四山阳山红格 */
    const needleRings = [['feng', 7.5], ['zhong', -7.5], ['zheng', 0]];
    for (const [key, off] of needleRings) {
      if (!has[key]) continue;
      const [r0, r1] = RB[key];
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i];
        const d = FS.fwShanDeg(i) + off;
        const yang = YANG_SHAN[shan];
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell' + (yang ? ' rd-yang' : '') + '"/>';
        s += rdTxtDir((r0 + r1) / 2 + 2, d, shan, 40, yang ? 'rd-shan-yang' : 'rd-shan-yin');
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
        const a0 = r.start + 180, a1 = r.end + 180;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell' + (r.kong ? ' rd-kong' : '') + '"/>';
        s += rdTxt((r0 + r1) / 2, (a0 + a1) / 2, r.kong ? '空' : r.gz, 19, r.kong ? 'rd-lab-red' : 'rd-lab-sm');
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
        const a0 = r.start + 180, a1 = r.end + 180;
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell' + (r.wang === '龟甲' ? ' rd-kong' : '') + '"/>';
        s += rdTxt((r0 + r1) / 2, (a0 + a1) / 2, r.gz, 19, r.wang === '龟甲' ? 'rd-lab-red' : 'rd-lab-sm');
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
        const a0 = f.start + 180, a1 = f.end + 180;
        const kong = f.wang === '龟甲';
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell' + (kong ? ' rd-kong' : '') + '"/>';
        s += rdTxt((r0 + r1) / 2, (a0 + a1) / 2, f.gz, 17, kong ? 'rd-lab-red' : 'rd-lab-xs');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
    }
    /* 洛书九宫数环（自天池第五圈）：每山所属洛书宫数大字、配后天卦名小注，白底细格照样本。 */
    if (has.luoshu) {
      const [r0, r1] = RB.luoshu;
      const numR = (r0 + r1) / 2 + 14, noteR = (r0 + r1) / 2 - 18;
      for (let i = 0; i < 24; i++) {
        const shan = FS.SHAN_LIST[i];
        const d = FS.fwShanDeg(i);
        const g = FS.SHAN_BAZI[shan] || 5;
        const gua = FS.SHAN_BAGUA[shan];
        s += '<path d="' + rdBand(r0, r1, d - 7.5, d + 7.5) + '" class="rd-cell"/>';
        s += rdTxtDir(numR, d, String(g), 34, 'rd-luoshu-num');
        s += rdTxt(noteR, d, gua, 15, 'rd-lab-dim');
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 7.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 7.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 7.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 7.5)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 八方位注记环：红块白字方位，照问真池外红块。 */
    if (has.zhu) {
      const [r0, r1] = RB.zhu;
      const ZHU = [{ d: 0, t: '北' }, { d: 45, t: '东北' }, { d: 90, t: '东' }, { d: 135, t: '东南' },
        { d: 180, t: '南' }, { d: 225, t: '西南' }, { d: 270, t: '西' }, { d: 315, t: '西北' }];
      for (const z of ZHU) {
        const wide = z.t.length > 1;
        const a0 = z.d - (wide ? 22.5 : 15), a1 = z.d + (wide ? 22.5 : 15);
        s += '<path d="' + rdBand(r0, r1, a0, a1) + '" class="rd-cell rd-yang"/>';
        s += rdTxt((r0 + r1) / 2, z.d, z.t, 20, 'rd-zhu-txt');
        s += '<line x1="' + WHEEL.n(rdPx(r0, a0)[0]) + '" y1="' + WHEEL.n(rdPx(r0, a0)[1]) + '" x2="' + WHEEL.n(rdPx(r1, a0)[0]) + '" y2="' + WHEEL.n(rdPx(r1, a0)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 三爻卦画环：独立环带，三爻等距等长，跨角按半径定弦长；阳爻全长、阴爻两段。 */
    if (has.yao) {
      const [r0, r1] = RB.yao;
      const GUA_POS = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      const yaoR = [r0 + 14, r0 + 32, r0 + 50];
      for (const g in GUA_POS) {
        const d = GUA_POS[g], bits = GUA_BITS[g];
        for (let y = 0; y < 3; y++) {
          const rr = yaoR[y], b = bits[y];
          const jw = 9;
          if (b) {
            const p1 = rdPx(rr, d - jw), p2 = rdPx(rr, d + jw);
            s += '<line x1="' + WHEEL.n(p1[0]) + '" y1="' + WHEEL.n(p1[1]) + '" x2="' + WHEEL.n(p2[0]) + '" y2="' + WHEEL.n(p2[1]) + '" class="rd-yao-b"/>';
          } else {
            for (const sg of [-1, 1]) {
              const p1 = rdPx(rr, d + sg * 2.2), p2 = rdPx(rr, d + sg * jw);
              s += '<line x1="' + WHEEL.n(p1[0]) + '" y1="' + WHEEL.n(p1[1]) + '" x2="' + WHEEL.n(p2[0]) + '" y2="' + WHEEL.n(p2[1]) + '" class="rd-yao-b"/>';
            }
          }
        }
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 八方位八卦大字环：卦名字 44px 居环心，环带无爻线，字不挤压。 */
    if (has.bagua) {
      const [r0, r1] = RB.bagua;
      const GUA_POS = { 坎: 0, 艮: 45, 震: 90, 巽: 135, 离: 180, 坤: 225, 兑: 270, 乾: 315 };
      for (const g in GUA_POS) {
        const d = GUA_POS[g];
        s += '<path d="' + rdBand(r0, r1, d - 22.5, d + 22.5) + '" class="rd-cell"/>';
        s += rdTxtDir((r0 + r1) / 2, d, g, 44, 'rd-gua-big');
        s += '<line x1="' + WHEEL.n(rdPx(r0, d - 22.5)[0]) + '" y1="' + WHEEL.n(rdPx(r0, d - 22.5)[1]) + '" x2="' + WHEEL.n(rdPx(r1, d - 22.5)[0]) + '" y2="' + WHEEL.n(rdPx(r1, d - 22.5)[1]) + '" class="rd-grid"/>';
      }
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-ring"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r0 + '" class="rd-ring"/>';
    }
    /* 天池：白圆（0至12%）、NESW 贴池沿、海底线、菱形磁针。 */
    if (has.chi) {
      const [r0, r1] = RB.chi;
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + r1 + '" class="rd-chi-rim"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="' + (r1 - 4) + '" class="rd-chi"/>';
      s += '<line x1="' + C + '" y1="' + (C - r1 + 8) + '" x2="' + C + '" y2="' + (C + r1 - 8) + '" class="rd-haixian"/>';
      const labs = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];
      for (const [t2, d] of labs) {
        const p = rdPx(r1 - 14, d);
        s += '<text x="' + WHEEL.n(p[0]) + '" y="' + WHEEL.n(p[1]) + '" class="rd-nesw" style="font-size:15px"'
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
    /* 天心十道 */
    if (o.cross !== false) {
      s += '<line x1="' + (C - ROUT) + '" y1="' + C + '" x2="' + (C + ROUT) + '" y2="' + C + '" class="rd-cross"/>';
      s += '<line x1="' + C + '" y1="' + (C - ROUT) + '" x2="' + C + '" y2="' + (C + ROUT) + '" class="rd-cross"/>';
    }
    /* 热区：全环带按地盘正针二十四山分格（除天池），点选任一环带同山皆选中 */
    const hitIn = has.chi ? RB.chi[1] : RB.bagua[0];
    const hitOut = has.deg ? RB.deg[1] : ROUT;
    for (let i = 0; i < 24; i++) {
      const d = FS.fwShanDeg(i);
      const bd = rdBand(hitIn, hitOut, d - 7.5, d + 7.5);
      s += '<path d="' + bd + '" class="w-hit' + (i === sel ? ' is-on' : '') + '" data-i="' + i + '" onclick="' + (o.pick || 'lpPickReal') + '(' + i + ')"/>';
      s += '<path d="' + bd + '" class="w-sel"/>';
    }
    const label = '真实罗盘' + RD_SETS[mode].name + RD_SETS[mode].n + '层：自外向内依次为' + rings.map(function (k) { return RD_RING_NAME[k]; }).join('、') + '。';
    return '<svg class="wheel rd-wheel" id="' + o.id + '" viewBox="0 0 2000 2000" role="img" aria-label="' + label + '">' + s + '</svg>';
  }

  global.LUOPAN = {
    GUIDE_STEPS: GUIDE_STEPS,
    LAYER_INFO: LAYER_INFO,
    LS_MODE: LS_MODE,
    wheelSvg: function () { return global.FS_LUO.wheelSvg.apply(global.FS_LUO, arguments); },
    layerDisk: layerDisk,
    xiuDisk: xiuDisk,
    XIU_XIANG: XIU_XIANG,
    realDisk: realDisk,
    RD_SETS: RD_SETS,
    RD_RING_NAME: RD_RING_NAME,
    pick: pick,
    detail: detail,
    setMode: setMode,
    restoreMode: restoreMode,
    guide: guide,
    layerCard: layerCard,
    lerpAngle: lerpAngle,
    Compass: Compass
  };
})(typeof window !== 'undefined' ? window : this);


