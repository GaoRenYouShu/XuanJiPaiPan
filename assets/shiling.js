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
 *           shilingWuHou(lunar) → 物候带节气与候序，如 '秋分 二候 蛰虫坯户'；
 *           shilingWuHouInfo(lunar) → 物候分件 {jq, hou, wu, text}，供候名做成可点击；
 *           shilingHouInfo(候名) → 七十二候释义 {jq, n, hou, wu, mean}（释义本站归纳，非古籍原文）；
 *           shilingHouList(节气名) → 本节气三候候名数组；
 *           shilingRuleKeyOf(时令项) → 规则键 fushu|shujiu|meiyu；shilingRuleText(键) → 规则说明；
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

  /* 物候带节气与候序，如 '秋分 二候 蛰虫坯户'
   * getHou() 返回“秋分 二候”（节气名 + 候序），getWuHou() 返回候名（蛰虫坯户）；
   * 两者取不到其一也不留空串、不抛错。 */
  function shilingWuHou(lunar) {
    try {
      if (!lunar) return '';
      const wu = lunar.getWuHou() || '';
      let jq = '', hou = '';
      try { const p = (lunar.getHou() || '').split(' '); jq = p[0] || ''; hou = p[1] || ''; } catch (e) {}
      if (hou === wu) hou = '';
      return [jq, hou, wu].filter(Boolean).join(' ');
    } catch (e) { return ''; }
  }
  /* 物候分件版：供页面把候名做成可点击（弹释义），text 与 shilingWuHou 同值 */
  function shilingWuHouInfo(lunar) {
    const text = shilingWuHou(lunar);
    try {
      const wu = (lunar && lunar.getWuHou()) || '';
      const p = ((lunar && lunar.getHou()) || '').split(' ');
      return { jq: p[0] || '', hou: p[1] || '', wu: wu, text: text };
    } catch (e) { return { jq: '', hou: '', wu: '', text: text }; }
  }

  /* 子午流注纳支法：十二时辰配十二经。时支序与经络一一对应，子时跨日（23 时归子）。
     yi ＝该经当令时的宜做，取中医“因时摄养”的通行说法，只作日常起居参考。
     xing ＝循行概要（一行版，供详情第三行）、xingFull ＝循行全述（供点击弹窗）、
     shu ＝属络（属本经脏腑、络相表里脏腑）。循行与属络据《灵枢·经脉》十二经循行节述，
     非原文照录。详情行固定三行，概要须与宜做行同宽，全述入弹窗。
     🔴 文案里不得再出现“宜”字：详情条统一以“宜 ”起头，句内再带一个宜就成了“宜…宜…”。
     句式一律“动作，机理，收效”三节，顿号连并列动作。 */
  const JINGLUO = [
    { zhi: '子', jing: '胆经',   full: '足少阳胆经',   range: '23:00-01:00', yi: '入睡，胆经当令主决断，熟睡最能养胆气',
      xing: '起目外眦，循身侧下行至足四趾', xingFull: '起于目外眦，上头角，下耳后，循颈过肩入缺盆，沿身侧下行至足第四趾', shu: '属胆，络肝' },
    { zhi: '丑', jing: '肝经',   full: '足厥阴肝经',   range: '01:00-03:00', yi: '深睡，肝藏血主疏泄，安睡则肝血得养',
      xing: '起足大趾，循下肢内侧上行抵小腹', xingFull: '起于足大趾，沿下肢内侧上行，环阴器抵小腹，上贯膈布胁肋，连目系上出额', shu: '属肝，络胆' },
    { zhi: '寅', jing: '肺经',   full: '手太阴肺经',   range: '03:00-05:00', yi: '续睡，肺朝百脉，熟睡则气血得以重新分布',
      xing: '起中焦，循上肢内侧前缘至拇指', xingFull: '起于中焦，下络大肠，上膈属肺，出腋下沿上肢内侧前缘下行至拇指端', shu: '属肺，络大肠' },
    { zhi: '卯', jing: '大肠经', full: '手阳明大肠经', range: '05:00-07:00', yi: '起身排便、饮温水，大肠主传导，此时最利排浊',
      xing: '起食指，循上肢外侧前缘上肩至鼻旁', xingFull: '起于食指端，沿上肢外侧前缘上行，过肩入缺盆，上颈贯颊入下齿，终鼻旁', shu: '属大肠，络肺' },
    { zhi: '辰', jing: '胃经',   full: '足阳明胃经',   range: '07:00-09:00', yi: '进食早餐，胃主受纳，此时胃气最旺，饭食最易运化',
      xing: '起鼻旁，循胸腹下行至足次趾', xingFull: '起于鼻旁，入上齿环唇，沿颈入缺盆，下循胸腹至下肢外侧前缘，终足次趾', shu: '属胃，络脾' },
    { zhi: '巳', jing: '脾经',   full: '足太阴脾经',   range: '09:00-11:00', yi: '工作学习，脾主运化升清，此时脑力与体力最盛',
      xing: '起足大趾，循下肢内侧上行入腹连舌本', xingFull: '起于足大趾，沿下肢内侧前缘上行入腹，上膈挟咽，连舌本散舌下', shu: '属脾，络胃' },
    { zhi: '午', jing: '心经',   full: '手少阴心经',   range: '11:00-13:00', yi: '午餐后小憩，心主血脉神明，小睡片刻可养心气',
      xing: '起心中，循上肢内侧后缘至小指', xingFull: '起于心中，下膈络小肠，上肺出腋下，沿上肢内侧后缘下行至小指端', shu: '属心，络小肠' },
    { zhi: '未', jing: '小肠经', full: '手太阳小肠经', range: '13:00-15:00', yi: '适量饮水，小肠主泌别清浊，此时助其分清别浊',
      xing: '起小指，循上肢外侧后缘上肩至耳中', xingFull: '起于小指端，沿上肢外侧后缘上行，绕肩胛入缺盆，上颈颊至目外眦入耳中', shu: '属小肠，络心' },
    { zhi: '申', jing: '膀胱经', full: '足太阳膀胱经', range: '15:00-17:00', yi: '饮水与活动，膀胱经主一身之表，此时多饮水助代谢',
      xing: '起目内眦，夹脊两旁下行至足小趾', xingFull: '起于目内眦，上额交巅，下项夹脊两旁下行，过臀沿下肢后侧至足小趾', shu: '属膀胱，络肾' },
    { zhi: '酉', jing: '肾经',   full: '足少阴肾经',   range: '17:00-19:00', yi: '晚餐清淡、静息，肾藏精主水，此时最忌过劳',
      xing: '起足心，循下肢内侧后缘上行贯脊入肺', xingFull: '起于足小趾下，斜走足心，沿下肢内侧后缘上行贯脊，上贯肝膈入肺，挟舌本', shu: '属肾，络膀胱' },
    { zhi: '戌', jing: '心包经', full: '手厥阴心包经', range: '19:00-21:00', yi: '散步、舒缓情志，心包代心受邪，畅怀则气血自和',
      xing: '起胸中，循上肢内侧中线至中指', xingFull: '起于胸中，出属心包络，下膈历络三焦，沿上肢内侧中线下行至中指端', shu: '属心包，络三焦' },
    { zhi: '亥', jing: '三焦经', full: '手少阳三焦经', range: '21:00-23:00', yi: '洗漱安神，三焦通百脉，静待入睡以养元气',
      xing: '起无名指，循上肢外侧中线上肩至目外眦', xingFull: '起于无名指端，沿上肢外侧中线上行，过肩入缺盆，上项系耳后至目外眦', shu: '属三焦，络心包' }
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

  /* ============================================================
     七十二候释义表（万年历物候弹窗与节气圆盘三候共用，单一真源）
     候名照录 lunar.js 内置七十二候表（与《月令七十二候集解》通行本一致），
     故与 getWuHou() 返回值逐字对齐、可按键直查；释义为本站归纳白话，非古籍原文照录。
     每条：jq 所属节气、n 候序（1 初候 2 二候 3 三候）、wu 候名、mean 释义。
     ============================================================ */
  const HOU_TABLE = [
    { jq:'立春', n:1, wu:'东风解冻', mean:'东风送暖，冰封的大地开始解冻。冻结于冬，遇春风而散。' },
    { jq:'立春', n:2, wu:'蛰虫始振', mean:'蛰伏越冬的虫类开始苏醒活动。藏虫感阳气之动，始振而未出。' },
    { jq:'立春', n:3, wu:'鱼陟负冰', mean:'鱼儿上游近冰面，如背负碎冰。河冰渐解，鱼陟于上而游。' },
    { jq:'雨水', n:1, wu:'獭祭鱼', mean:'水獭捕鱼后陈列岸边，如陈物而祭。岁始渔猎之候。' },
    { jq:'雨水', n:2, wu:'候雁北', mean:'大雁开始向北回迁。候鸟知时，雁自南而北。' },
    { jq:'雨水', n:3, wu:'草木萌动', mean:'草木开始萌芽。天地之气交，万物萌发。' },
    { jq:'惊蛰', n:1, wu:'桃始华', mean:'桃花开始绽放。春气发而花信始。' },
    { jq:'惊蛰', n:2, wu:'仓庚鸣', mean:'黄鹂开始鸣叫。仓庚即黄鹂，感春阳而鸣。' },
    { jq:'惊蛰', n:3, wu:'鹰化为鸠', mean:'鹰隐而鸠出，古人以为鹰化为鸠。实为鹰匿育雏、鸠应时而鸣。' },
    { jq:'春分', n:1, wu:'玄鸟至', mean:'燕子归来。玄鸟即燕，春分而来、秋分而去。' },
    { jq:'春分', n:2, wu:'雷乃发声', mean:'开始打雷。阴阳相薄为雷，阳气渐盛而雷作。' },
    { jq:'春分', n:3, wu:'始电', mean:'开始出现闪电。雷雨之际，电光始见。' },
    { jq:'清明', n:1, wu:'桐始华', mean:'桐树开始开花。桐花为清明之信。' },
    { jq:'清明', n:2, wu:'田鼠化为鴽', mean:'田鼠隐而鹌鹑出，古人以为田鼠化为鴽。实为阴阳交替、物类更替之象。' },
    { jq:'清明', n:3, wu:'虹始见', mean:'彩虹开始出现。清明后雨霁，常见虹。' },
    { jq:'谷雨', n:1, wu:'萍始生', mean:'浮萍开始生长。雨水足而浮萍生。' },
    { jq:'谷雨', n:2, wu:'鸣鸠拂其羽', mean:'斑鸠鸣叫、拂动羽翼。催耕之鸟鸣，农事渐急。' },
    { jq:'谷雨', n:3, wu:'戴胜降于桑', mean:'戴胜鸟落在桑树上。桑事将兴，蚕月将至。' },
    { jq:'立夏', n:1, wu:'蝼蝈鸣', mean:'蛙类开始鸣叫。夏气至而蛙鸣。' },
    { jq:'立夏', n:2, wu:'蚯蚓出', mean:'蚯蚓钻出地面。阳气盛，蚯蚓出而松土。' },
    { jq:'立夏', n:3, wu:'王瓜生', mean:'王瓜开始生长。夏月瓜藤蔓生。' },
    { jq:'小满', n:1, wu:'苦菜秀', mean:'苦菜枝叶繁茂。苦菜感火气而秀。' },
    { jq:'小满', n:2, wu:'靡草死', mean:'细软的靡草枯死。阳气盛极，阴柔之草先萎。' },
    { jq:'小满', n:3, wu:'麦秋至', mean:'麦子成熟可收。麦熟于夏，谓之麦秋。' },
    { jq:'芒种', n:1, wu:'螳螂生', mean:'螳螂孵化出生。螳螂感阴气而生。' },
    { jq:'芒种', n:2, wu:'鵙始鸣', mean:'伯劳鸟开始鸣叫。鵙即伯劳，阴气微生而鸣。' },
    { jq:'芒种', n:3, wu:'反舌无声', mean:'反舌鸟停止鸣叫。感阴气而止鸣。' },
    { jq:'夏至', n:1, wu:'鹿角解', mean:'鹿角开始脱落。鹿属阳，夏至一阴生而阳角解。' },
    { jq:'夏至', n:2, wu:'蜩始鸣', mean:'知了开始鸣叫。蜩即蝉，夏至后鸣声始盛。' },
    { jq:'夏至', n:3, wu:'半夏生', mean:'半夏开始生长。半夏感阴气而生，时值夏之半。' },
    { jq:'小暑', n:1, wu:'温风至', mean:'热风开始吹来。小暑之日温风至，暑气渐盛。' },
    { jq:'小暑', n:2, wu:'蟋蟀居壁', mean:'蟋蟀避暑迁居墙缝。暑热渐盛，虫避于壁。' },
    { jq:'小暑', n:3, wu:'鹰始挚', mean:'鹰开始练习搏击。挚通鸷，猛气渐生，感暑极而近秋肃。' },
    { jq:'大暑', n:1, wu:'腐草为萤', mean:'腐草间飞出萤火虫，古人以为腐草所化。实为萤卵孵于草间。' },
    { jq:'大暑', n:2, wu:'土润溽暑', mean:'土地湿润、暑气蒸郁。湿热交蒸，盛夏之候。' },
    { jq:'大暑', n:3, wu:'大雨行时', mean:'大雨时行。雷雨频作，暑气渐退。' },
    { jq:'立秋', n:1, wu:'凉风至', mean:'凉风开始吹来。秋气渐至，暑气始退。' },
    { jq:'立秋', n:2, wu:'白露降', mean:'清晨草木凝露。昼夜温差渐大，露始降。' },
    { jq:'立秋', n:3, wu:'寒蝉鸣', mean:'寒蝉开始鸣叫。蝉感阴气而鸣声凄切。' },
    { jq:'处暑', n:1, wu:'鹰乃祭鸟', mean:'鹰捕鸟而陈列如祭。处暑之日鹰乃祭鸟。' },
    { jq:'处暑', n:2, wu:'天地始肃', mean:'天地间开始肃杀。暑气退而秋气肃。' },
    { jq:'处暑', n:3, wu:'禾乃登', mean:'庄稼开始成熟登仓。禾为谷熟之总称，秋收之候。' },
    { jq:'白露', n:1, wu:'鸿雁来', mean:'大雁南飞。白露之日鸿雁来，雁自北而南。' },
    { jq:'白露', n:2, wu:'玄鸟归', mean:'燕子南归。玄鸟春来秋归。' },
    { jq:'白露', n:3, wu:'群鸟养羞', mean:'群鸟开始储食备冬。羞同馐，蓄食以备冬。' },
    { jq:'秋分', n:1, wu:'雷始收声', mean:'雷声开始收敛。秋分后阴气盛，雷声渐止。' },
    { jq:'秋分', n:2, wu:'蛰虫坯户', mean:'蛰虫封堵洞口以备冬。坯户即培泥封穴。' },
    { jq:'秋分', n:3, wu:'水始涸', mean:'水域开始干涸。秋燥水落，湖泽渐涸。' },
    { jq:'寒露', n:1, wu:'鸿雁来宾', mean:'大雁最后一批南迁，如客而至。先至者为主，后至者为宾。' },
    { jq:'寒露', n:2, wu:'雀入大水为蛤', mean:'雀鸟少见而蛤蜊出现，古人以为雀化蛤。实为物候交替之象。' },
    { jq:'寒露', n:3, wu:'菊有黄花', mean:'菊花开放。菊感秋气而华。' },
    { jq:'霜降', n:1, wu:'豺乃祭兽', mean:'豺捕兽而陈列如祭。霜降之日豺乃祭兽。' },
    { jq:'霜降', n:2, wu:'草木黄落', mean:'草木枯黄凋落。秋尽而草木黄落。' },
    { jq:'霜降', n:3, wu:'蛰虫咸俯', mean:'蛰虫全部潜伏入穴。咸俯即皆藏不动，备冬。' },
    { jq:'立冬', n:1, wu:'水始冰', mean:'水面开始结冰。冬气至而水始冰。' },
    { jq:'立冬', n:2, wu:'地始冻', mean:'土地开始冻结。寒意渐深，土始冻。' },
    { jq:'立冬', n:3, wu:'雉入大水为蜃', mean:'雉鸡少见而海边蜃气现，古人以为雉化为蜃。实为物候交替之象。' },
    { jq:'小雪', n:1, wu:'虹藏不见', mean:'彩虹不再出现。阴阳不交，虹藏而不见。' },
    { jq:'小雪', n:2, wu:'天气上升地气下降', mean:'阳气上升、阴气下降。天地之气不交，万物闭藏。' },
    { jq:'小雪', n:3, wu:'闭塞而成冬', mean:'天地闭塞，进入寒冬。冬藏之象成矣。' },
    { jq:'大雪', n:1, wu:'鹖鴠不鸣', mean:'鹖鴠即寒号鸟，不再鸣叫。天寒之极，夜鸣之鸟亦止。' },
    { jq:'大雪', n:2, wu:'虎始交', mean:'老虎开始求偶。阴气极而阳气萌，虎感微阳而交。' },
    { jq:'大雪', n:3, wu:'荔挺出', mean:'荔草开始抽芽。感阳气之微动而挺出。' },
    { jq:'冬至', n:1, wu:'蚯蚓结', mean:'土中蚯蚓蜷曲成结。阴气尚盛，蚯蚓屈曲而藏。' },
    { jq:'冬至', n:2, wu:'麋角解', mean:'麋鹿之角开始脱落。麋属阴，冬至一阳生而阴气始退，角随之而解。' },
    { jq:'冬至', n:3, wu:'水泉动', mean:'地下泉水开始流动。一阳初动，地中阳气渐回。' },
    { jq:'小寒', n:1, wu:'雁北乡', mean:'大雁开始向北回迁。乡通向，雁感阳气之动，启程北归。' },
    { jq:'小寒', n:2, wu:'鹊始巢', mean:'喜鹊开始筑巢。鹊感阳气渐生，营巢以备春育。' },
    { jq:'小寒', n:3, wu:'雉始雊', mean:'雉鸡开始鸣叫求偶。雊为雌雄同鸣，鸟兽感时而应。' },
    { jq:'大寒', n:1, wu:'鸡始乳', mean:'母鸡开始孵小鸡。乳指孵育，鸡感阳气而始孵。' },
    { jq:'大寒', n:2, wu:'征鸟厉疾', mean:'鹰隼之类猛禽疾飞觅食。天寒食少，猛禽飞掠更急。' },
    { jq:'大寒', n:3, wu:'水泽腹坚', mean:'水域中央结冰坚实。寒之至也，冰层连底而坚。' }
  ];
  const HOU_MEAN = {};
  HOU_TABLE.forEach(function (h) { HOU_MEAN[h.wu] = h; });
  const HOU_N_NAME = { 1: '初候', 2: '二候', 3: '三候' };
  /* 候名释义：{jq, n, hou, wu, mean}；未收候名返回 null */
  function shilingHouInfo(wu) {
    const h = HOU_MEAN[wu];
    if (!h) return null;
    return { jq: h.jq, n: h.n, hou: HOU_N_NAME[h.n] || '', wu: h.wu, mean: h.mean };
  }
  /* 本节气三候（按 24 节气名取三条），如 shilingHouList('秋分') → ['雷始收声','蛰虫坯户','水始涸'] */
  function shilingHouList(jq) {
    return HOU_TABLE.filter(function (h) { return h.jq === jq; }).map(function (h) { return h.wu; });
  }

  /* 时令规则说明（点击时令项弹出）：三伏、数九、入梅出梅的算法口径，与上方实算同源 */
  const SHILING_RULE = {
    fushu: '三伏按干支推：夏至后第 3 个庚日为初伏首日，立秋后第 1 个庚日为末伏首日，两伏之间为中伏，出伏为末伏结束之次日。伏日多在小暑与处暑之间，为一年最热时段。',
    shujiu: '数九自冬至日起算：每 9 日为一九，依次至九九，共 81 日；冬至当日即入一九。三九四九多在小寒大寒前后，为一年最冷时段。',
    meiyu: '入梅出梅按干支推：芒种后第 1 个丙日入梅，小暑后第 1 个未日出梅。梅雨期湿热多雨，为江南一带时令。'
  };
  /* 时令项 → 规则键：伏日归 fushu、各九归 shujiu、梅日归 meiyu；其余返回空串 */
  function shilingRuleKeyOf(item) {
    const s = String(item || '');
    if (/^(入伏|初伏|中伏|末伏|出伏)/.test(s)) return 'fushu';
    if (/^[一二三四五六七八九]九/.test(s)) return 'shujiu';
    if (s === '入梅' || s === '出梅') return 'meiyu';
    return '';
  }
  function shilingRuleText(key) { return SHILING_RULE[key] || ''; }

  global.shilingNote = shilingNote;
  global.shilingWuHou = shilingWuHou;
  global.shilingWuHouInfo = shilingWuHouInfo;
  global.shilingHouInfo = shilingHouInfo;
  global.shilingHouList = shilingHouList;
  global.shilingRuleKeyOf = shilingRuleKeyOf;
  global.shilingRuleText = shilingRuleText;
  global.SHILING_RULE = SHILING_RULE;
  global.shilingDangLing = shilingDangLing;
  global.shilingJieQiYang = shilingJieQiYang;
  global.shilingJieQiDate = shilingJieQiDate;
  global.SHILING_JINGLUO = JINGLUO;
  global.SHILING_JIEQI_YANG = JIEQI_YANG;
  global._yearShiLing = yearShiLing;
})(typeof window !== 'undefined' ? window : globalThis);
