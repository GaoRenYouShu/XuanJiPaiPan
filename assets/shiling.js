/* 玄机排盘 传统时令公共模块（万年历 / 老黄历共用，单一真源）
 *
 * 三伏：初伏＝夏至后第 3 个庚日，末伏＝立秋后第 1 个庚日，中伏＝初伏末至末伏前；
 *       出伏＝末伏结束后次日（末伏第 10 天当天仍标“末伏第10天”）。
 * 数九：冬至起每 9 日一九，至九九共 81 天；各九均带“第N天”。
 * 入梅、出梅：芒种后第 1 个丙日入梅，小暑后第 1 个未日出梅。
 * 七十二候：节气起每五日为一候，初候、二候、三候共三候。
 *           候名取 lunar.getHou()（返回“节气 候名”，本模块只留候名），物候名取 lunar.getWuHou()。
 * 子午流注：十二时辰各配一经，取纳支法歌诀“肺寅大卯胃辰宫，脾巳心午小未中，申膀酉肾心包戌，亥焦子胆丑肝通”。
 *           当令即该时辰气血所注之经，随时钟推移，不随日期变化。
 * 时令养生：经络“当令宜做”逐条挂在 SHILING_JINGLUO 的 yi 字段；节气“宜做”另立 SHILING_JIEQI_YANG
 *           （24 条，按节气名索引）。两表都取中医时令养生的通行口径：经络依子午流注纳支法，
 *           节气依二十四节气起居饮食调摄之说，只作日常起居参考，不作诊疗依据。
 * 全部基于 lunar.js 节气表与当日干支动态推算，不写死年份。
 * 依赖：assets/lunar.js 须先于本文件加载。
 * 对外接口：shilingNote(y, m, d) → 表述数组，如 ['中伏第3天','三九第2天','入梅']；
 *           shilingWuHou(lunar) → 物候带候名，如 '二候 玄鸟归'；
 *           shilingDangLing(when) → 当令经络对象 {zhi, jing, full, range, yi, text}，text 形如“戌时 心包经”；
 *           SHILING_JINGLUO → 十二时辰经络全表（12 条，按时支序，每条带 yi 当令宜做）；
 *           shilingJieQiYang(name) → 某节气的宜做（字符串，取不到返空串）；
 *           shilingJieQiDate(y, name) → 某年某节气的公历交节日期（Date，取不到返 null）；
 *           SHILING_JIEQI_YANG → 二十四节气宜做全表（24 条，按节气名索引）。
 */
(function (global) {
  'use strict';

  const GAN_IDX = {甲:0,乙:1,丙:2,丁:3,戊:4,己:5,庚:6,辛:7,壬:8,癸:9};
  const ZHI_IDX = {子:0,丑:1,寅:2,卯:3,辰:4,巳:5,午:6,未:7,申:8,酉:9,戌:10,亥:11};
  const JIU_NAMES = ['一九','二九','三九','四九','五九','六九','七九','八九','九九'];

  const addDays = (s, n) => { const d = new Date(s.getFullYear(), s.getMonth(), s.getDate()); d.setDate(d.getDate() + n); return d; };
  const isoOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const ganOf = d => Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate()).getLunar().getDayInGanZhi()[0];
  const zhiOf = d => Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate()).getLunar().getDayInGanZhi()[1];

  /* 取 y 年 name 节气的公历日期（扫年中表+次年初表，取年份恰为 y 者，冬至跨年端点亦正确） */
  function jieQiDate(y, name) {
    try {
      for (const P of [Solar.fromYmd(y, 6, 1), Solar.fromYmd(y + 1, 1, 1)]) {
        const v = P.getLunar().getJieQiTable()[name];
        if (v && v.getYear() === y) return new Date(v.getYear(), v.getMonth() - 1, v.getDay(), v.getHour ? v.getHour() : 0, v.getMinute ? v.getMinute() : 0);
      }
      return null;
    } catch (e) { return null; }
  }

  /* 对外版：某年某节气的公历交节时刻（Date，含时、分，寿星天文历口径；取不到返 null）。万年历节气圆盘的“交节 X月X日 hh:mm”
     走此单一真源，免得页面另写一套节气表推算。 */
  function shilingJieQiDate(y, name) { return jieQiDate(y, name); }

  /* 从 start 起第 skip 个满足 pred 的日期 */
  function nthMatch(start, pred, skip) {
    let f = 0;
    for (let o = 0; o < 40; o++) {
      const dt = addDays(start, o);
      if (pred(dt)) { f++; if (f === skip) return dt; }
    }
    return null;
  }

  /* y 年时令关键日：{初伏,末伏,中伏天数,出伏,入梅,出梅} */
  function yearShiLing(year) {
    const xz = jieQiDate(year, '夏至'), lq = jieQiDate(year, '立秋');
    if (!xz || !lq) return null;
    const cf = nthMatch(xz, d => GAN_IDX[ganOf(d)] === 6, 3);
    const mf = nthMatch(lq, d => GAN_IDX[ganOf(d)] === 6, 1);
    if (!cf || !mf) return null;
    const mz = jieQiDate(year, '芒种'), xs = jieQiDate(year, '小暑');
    return {
      初伏: cf, 末伏: mf, 中伏天数: Math.round((mf - cf) / 86400000) - 10,
      出伏: addDays(mf, 10),                       // 末伏结束后次日（主流口径）
      入梅: mz ? nthMatch(mz, d => GAN_IDX[ganOf(d)] === 2, 1) : null,
      出梅: xs ? nthMatch(xs, d => ZHI_IDX[zhiOf(d)] === 7, 1) : null
    };
  }

  /* y 年 m 月 d 日的时令表述数组，如 ['中伏第3天','三九第2天'] */
  function shilingNote(y, m, d) {
    const day = new Date(y, m - 1, d);
    const out = [];
    try {
      const sl = yearShiLing(y);
      if (sl && sl.初伏) {
        const iso = isoOf(day);
        const inD = Math.floor((day - sl.初伏) / 86400000);
        const zhongFu = sl.中伏天数;
        if (iso === isoOf(sl.初伏)) out.push('入伏');
        else if (inD >= 0 && inD < 10) out.push('初伏第' + (inD + 1) + '天');
        else if (inD >= 10 && inD < 10 + zhongFu) out.push('中伏第' + (inD - 9) + '天');
        else if (inD >= 10 + zhongFu && inD < 20 + zhongFu) out.push('末伏第' + (inD - 9 - zhongFu) + '天');
        if (iso === isoOf(sl.出伏)) out.push('出伏');
        if (sl.入梅 && iso === isoOf(sl.入梅)) out.push('入梅');
        if (sl.出梅 && iso === isoOf(sl.出梅)) out.push('出梅');
      }
      /* 数九：取该日所属冬季的冬至（当年冬至前属上年冬至）；各九统一带“第N天” */
      const dzNow = jieQiDate(y, '冬至'), dzPrev = jieQiDate(y - 1, '冬至');
      const dongZhi = (dzNow && day >= dzNow) ? dzNow : ((dzPrev && day >= dzPrev) ? dzPrev : null);
      if (dongZhi) {
        const dd = Math.floor((day - dongZhi) / 86400000);
        if (dd >= 0 && dd < 81) {
          const jiu = Math.floor(dd / 9), c = dd % 9 + 1;
          out.push(JIU_NAMES[jiu] + '第' + c + '天');
        }
      }
    } catch (e) {}
    return out;
  }

  /* 物候带候名，如 '二候 玄鸟归'
   * getHou() 返回“白露 二候”（节气名 + 候名），getWuHou() 返回物候名（玄鸟归）；
   * 本函数只做拼接与兜底：两者取不到其一也不留空串、不抛错。 */
  function shilingWuHou(lunar) {
    try {
      if (!lunar) return '';
      const wu = lunar.getWuHou() || '';
      let hou = '';
      try { hou = (lunar.getHou() || '').split(' ').pop() || ''; } catch (e) {}
      if (hou === wu) hou = '';
      return [hou, wu].filter(Boolean).join(' ');
    } catch (e) { return ''; }
  }

  /* 子午流注纳支法：十二时辰配十二经。时支序与经络一一对应，子时跨日（23 时归子）。
     yi ＝该经当令时的宜做，取中医“因时摄养”的通行说法，只作日常起居参考。
     🔴 文案里不得再出现“宜”字：详情条统一以“宜 ”起头，句内再带一个宜就成了“宜…宜…”。
     句式一律“动作，机理，收效”三节，顿号连并列动作。 */
  const JINGLUO = [
    { zhi: '子', jing: '胆经',   full: '足少阳胆经',   range: '23:00-01:00', yi: '入睡，胆经当令主决断，熟睡最能养胆气' },
    { zhi: '丑', jing: '肝经',   full: '足厥阴肝经',   range: '01:00-03:00', yi: '深睡，肝藏血主疏泄，安睡则肝血得养' },
    { zhi: '寅', jing: '肺经',   full: '手太阴肺经',   range: '03:00-05:00', yi: '续睡，肺朝百脉，熟睡则气血得以重新分布' },
    { zhi: '卯', jing: '大肠经', full: '手阳明大肠经', range: '05:00-07:00', yi: '起身排便、饮温水，大肠主传导，此时最利排浊' },
    { zhi: '辰', jing: '胃经',   full: '足阳明胃经',   range: '07:00-09:00', yi: '进食早餐，胃主受纳，此时胃气最旺，饭食最易运化' },
    { zhi: '巳', jing: '脾经',   full: '足太阴脾经',   range: '09:00-11:00', yi: '工作学习，脾主运化升清，此时脑力与体力最盛' },
    { zhi: '午', jing: '心经',   full: '手少阴心经',   range: '11:00-13:00', yi: '午餐后小憩，心主血脉神明，小睡片刻可养心气' },
    { zhi: '未', jing: '小肠经', full: '手太阳小肠经', range: '13:00-15:00', yi: '适量饮水，小肠主泌别清浊，此时助其分清别浊' },
    { zhi: '申', jing: '膀胱经', full: '足太阳膀胱经', range: '15:00-17:00', yi: '饮水与活动，膀胱经主一身之表，此时多饮水助代谢' },
    { zhi: '酉', jing: '肾经',   full: '足少阴肾经',   range: '17:00-19:00', yi: '晚餐清淡、静息，肾藏精主水，此时最忌过劳' },
    { zhi: '戌', jing: '心包经', full: '手厥阴心包经', range: '19:00-21:00', yi: '散步、舒缓情志，心包代心受邪，畅怀则气血自和' },
    { zhi: '亥', jing: '三焦经', full: '手少阳三焦经', range: '21:00-23:00', yi: '洗漱安神，三焦通百脉，静待入睡以养元气' }
  ];

  /* 二十四节气宜做：按节气名索引，取二十四节气起居饮食调摄的通行说法，只作日常参考。
     立春居首，与万年历节气圆盘 JIEQI_24 同序（该序即太阳黄经每 15 度一气）。
     文案同样不得含“宜”字（详情条已以“宜 ”起头），句式一律“调摄，饮食，起居”三节。 */
  const JIEQI_YANG = {
    '立春': '护肝舒展，饮食少酸增甘，早睡早起以助阳气生发',
    '雨水': '健脾祛湿，饮食减酸增甘，春捂勿早脱衣',
    '惊蛰': '润燥防春困，饮食清淡，早睡以养肝',
    '春分': '调平阴阳，饮食寒热相配，作息早睡早起',
    '清明': '疏肝解郁，踏青舒展，饮食清淡忌厚味',
    '谷雨': '健脾祛湿，少食生冷，防湿邪困脾',
    '立夏': '养心，午间小憩，饮食清淡少油腻',
    '小满': '清热祛湿，饮食清淡，防湿郁化热',
    '芒种': '清淡防暑湿，多饮温水，勿过食生冷',
    '夏至': '养心护阳，避开烈日，午休以养心气',
    '小暑': '消暑生津，少贪凉饮冷，护住脾胃',
    '大暑': '防暑补气，饮食清淡，避免久曝烈日',
    '立秋': '润燥养肺，饮食减辛增酸，早晚添衣',
    '处暑': '润肺防秋燥，早睡早起，少食辛辣',
    '白露': '润肺，夜卧勿露身，饮食温润',
    '秋分': '养阴平补，饮食平和，早睡以敛阳气',
    '寒露': '养阴防燥，足部保暖，少食辛辣',
    '霜降': '平补脾胃，饮食温润，注意保暖',
    '立冬': '温补藏阳，早卧晚起，饮食可稍增厚味',
    '小雪': '温补防寒，多食温热，腰足尤须保暖',
    '大雪': '温阳补肾，早卧晚起，进补取温和',
    '冬至': '温补养藏，早睡晚起，饮食温热',
    '小寒': '温补护阳，注意保暖，饮食温热',
    '大寒': '温补防寒，早卧晚起，饮食温和'
  };
  function shilingJieQiYang(name) {
    try { return (name && JIEQI_YANG[name]) || ''; } catch (e) { return ''; }
  }

  /* 此刻当令之经：时支序 = floor(((h + 1) % 24) / 2)，使 23 时与 0 时同归子时
   * text 形如“戌时 心包经”（时辰在前、经名在后，与“经络当令：”连读即“经络当令：戌时 心包经”）。 */
  function shilingDangLing(when) {
    const t = (when instanceof Date) ? when : new Date();
    let idx = 0;
    try { idx = Math.floor(((t.getHours() + 1) % 24) / 2); } catch (e) { idx = 0; }
    const j = JINGLUO[idx] || JINGLUO[0];
    return { zhi: j.zhi, jing: j.jing, full: j.full, range: j.range, yi: j.yi, text: j.zhi + '时 ' + j.jing };
  }

  global.shilingNote = shilingNote;
  global.shilingWuHou = shilingWuHou;
  global.shilingDangLing = shilingDangLing;
  global.shilingJieQiYang = shilingJieQiYang;
  global.shilingJieQiDate = shilingJieQiDate;
  global.SHILING_JINGLUO = JINGLUO;
  global.SHILING_JIEQI_YANG = JIEQI_YANG;
  global._yearShiLing = yearShiLing;
})(typeof window !== 'undefined' ? window : globalThis);
