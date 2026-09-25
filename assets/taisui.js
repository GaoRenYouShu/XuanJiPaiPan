/* ============================================================
 * taisui.js：太岁生肖页逻辑（taisui.html 专用）
 * ------------------------------------------------------------
 * 判定真源：window.zhiRelTypes（bazi-rel.js，冲、害、破、暗合、合、刑
 * 单一真源，本页不重列关系表）。三合不在 zhiRelTypes 范围，
 * 另取 bazi-data.js 的 DIZHI_SANHE，经 taisui-data.js 末尾导出的
 * window.DIZHI_SANHE_EXP 消费。
 * 传记数据：TAISUI_BIO（taisui-data.js）。
 * 年界口径：太岁轮值与生肖以农历正月初一为界，与 lunar.js
 * getYearInGanZhi、getYearShengXiao 及 laohuangli taiSuiText 一致。
 * ============================================================ */
(function(){
'use strict';

/* ===== 0. 小工具 ===== */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ===== 1. 三合查询（消费 window.DIZHI_SANHE_EXP，形如 ['申','子','辰','水']） ===== */
function sanheOf(zhi){
  var SANHE = window.DIZHI_SANHE_EXP || [];
  for (var i=0;i<SANHE.length;i++){
    var g = SANHE[i];
    if (g[0]===zhi || g[1]===zhi || g[2]===zhi){
      return { hit:true, wu:g[3], group:g.slice(0,3).join('') };
    }
  }
  return { hit:false, wu:'', group:'' };
}

/* ===== 2. 犯太岁判定核心 =====
 * types 取值：值、冲、刑、害、破、合、暗合、三合。
 * yZhi=本命年支，suiZhi=流年支。关系类型一律取 window.zhiRelTypes 真源，
 * 本页不重列冲刑害破合表。 */
function judgeTaisui(yZhi, suiZhi){
  var types = [];
  if (yZhi === suiZhi){
    /* 值太岁：同支。自刑支（辰午酉亥）会由 zhiRelTypes 另得一刑 */
    types.push('值');
    var selfRel = (window.zhiRelTypes ? window.zhiRelTypes(yZhi, suiZhi) : []);
    for (var i=0;i<selfRel.length;i++){ if (types.indexOf(selfRel[i])<0) types.push(selfRel[i]); }
  } else {
    var rel = (window.zhiRelTypes ? window.zhiRelTypes(yZhi, suiZhi) : []);
    for (var j=0;j<rel.length;j++){ if (types.indexOf(rel[j])<0) types.push(rel[j]); }
  }
  /* 三合：本命支与流年支同入一局（不同支）记增益 */
  var a = sanheOf(yZhi), b = sanheOf(suiZhi);
  var sanhe = { hit:false, wu:'', group:'' };
  if (a.hit && b.hit && a.group===b.group && yZhi!==suiZhi){
    sanhe = { hit:true, wu:a.wu, group:a.group };
    types.push('三合');
  }
  return {
    types:types, sanhe:sanhe,
    zhi:types.indexOf('值')>=0, chong:types.indexOf('冲')>=0,
    xing:types.indexOf('刑')>=0, hai:types.indexOf('害')>=0,
    po:types.indexOf('破')>=0, he:types.indexOf('合')>=0,
    anhe:types.indexOf('暗合')>=0, sanheHit:types.indexOf('三合')>=0
  };
}

/* ===== 3. 年界判定 =====
 * 公历日期 → 农历年干支与生肖（lunar.js 真源）。 */
function lunarYearOf(dateStr){
  var m = String(dateStr||'').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  var y=+m[1], mo=+m[2], d=+m[3];
  if (mo<1||mo>12||d<1||d>31) return null;
  try {
    var l = Solar.fromYmd(y, mo, d).getLunar();
    var ygz = l.getYearInGanZhi();
    return { ygz:ygz, zhi:ygz.charAt(1), sheng:l.getYearShengXiao(), y:y, mo:mo, d:d };
  } catch(e){ return null; }
}


/* ===== 4. 五类应事模板（民俗通传梗概，页面已注明非古籍逐条定论） =====
 * 分项固定顺序：总体、事业、财运、感情、健康。空值一律写"无"。 */
var TS_TEMPLATES = {
  chong: {
    label:'冲太岁', w:'重',
    note:'冲者，对冲太岁，冲击、对撞之象。通传最重的犯太岁形态之一，变动、迁移、出行奔波之应较显。',
    total:'整体动荡，宜以静制动、稳字当头，勿主动求变。',
    career:'变动大：调动、外派、搬迁、转行等变动之应较显，主动小步求变好过被动大变。',
    wealth:'防冲动消费与跟风投资，大额支出与签约宜缓一缓。',
    love:'聚少离多、异地分居之象，沟通贵在主动与及时。',
    health:'注意交通出行安全，头部、四肢、筋骨旧疾易被激发，长途出行注意休息。'
  },
  zhi: {
    label:'值太岁', w:'重',
    note:'值太岁即坐太岁，本命年。与流年地支伏吟，情绪起伏与自我较劲之象。',
    total:'本命年伏吟，情绪易起伏，事多反复，宜守不宜攻。',
    career:'工作压力大，职责加重，变动念头多；跳槽、创业等大动作宜三思。',
    wealth:'收支平稳但易有计划外支出，忌高杠杆。',
    love:'易与伴侣较劲，聚少离多，宜多包容、少争对错。',
    health:'情绪与睡眠为先，宜规律作息，肠胃、情志之疾易起。'
  },
  xing: {
    label:'刑太岁', w:'中',
    note:'刑者，刑动、刑伤之象，未如冲之激烈但缠绵反复。寅巳申、丑戌未三刑齐会时力重，单支互刑力轻。',
    total:'事多纠缠反复、内耗之象，宜理清头绪、勿结新怨。',
    career:'流程、审批、文书、合同易生波折，细节决定成败，防小人是非。',
    wealth:'防债务纠纷与担保之累，账目合同逐条过目。',
    love:'易生猜疑内耗，感情怕拖泥带水，宜坦诚沟通。',
    health:'手术、外伤之应较显，慢性病复查勿拖，宜定期体检。'
  },
  hai: {
    label:'害太岁', w:'轻',
    note:'害者，穿害、妨害之象，为五类中最轻，多应人事摩擦、信任受损。',
    total:'多应人际摩擦、被拖累之象，防熟人之扰。',
    career:'协作、合伙之事多沟通留痕，防被熟人拖累背书。',
    wealth:'防借贷与代偿风险，垫资、代购、代持之类能免则免。',
    love:'防口舌是非，与异性同事、密友界限分明，家庭内部多体谅。',
    health:'脾胃、情绪类小恙，问题不大，规律饮食即可。'
  },
  po: {
    label:'破太岁', w:'中',
    note:'破者，破坏、突发之象，多为突然的损失或计划被打乱，应期急、去也快。',
    total:'计划易被打乱，突发状况多，预算留余地、随时准备备选方案。',
    career:'临时任务多打乱节奏，排期留缓冲，勿把日程排满。',
    wealth:'突发支出多，大额投资分批分仓，防临时挪用。',
    love:'情绪化争吵易伤感情，气头上勿作决定。',
    health:'意外小伤、突发病症，常备药备好，及时就医勿拖。'
  },
  sanhe: {
    label:'三合太岁', w:'吉',
    note:'本命支与流年支同入一局，得岁气之助，为增益之象。',
    total:'得流年岁气之助，做事顺遂度提升，适合推进此前搁置之事。',
    career:'贵人助力明显，合作与组队之事宜主动。',
    wealth:'财运平顺，稳健配置为主，顺势而为。',
    love:'感情升温，单身者社交运佳。',
    health:'状态平稳，趁势养成好习惯即可。'
  },
  anhe: {
    label:'暗合太岁', w:'小吉',
    note:'暗合者，地支藏干暗中相合，不显山露水之象，多为暗中机遇或暗中助力。',
    total:'暗中有机遇亦有暗耗，明面平稳、水面下有动作。',
    career:'合作洽谈宜低调推进，未落定前不声张。',
    wealth:'外快机会有，来源须正当，灰色地带一律不碰。',
    love:'暧昧、暗恋之象，关系未明前保持分寸。',
    health:'无明显之应，保持常规作息。'
  },
  he: {
    label:'六合', w:'小吉',
    note:'六合者，地支六合，和合之象，多为贵人缘与协作运佳，主和顺、得助，与暗合之"暗"不同，六合明面和合。',
    total:'和合之象，人际顺遂、贵人缘佳，宜协作合伙、广结善缘，事多逢迎。',
    career:'合作运佳，团队与合伙事宜推进，易得前辈同侪帮扶，谈判签约顺。',
    wealth:'财运平顺，人际带来机会，勿因人情滥作担保、忌合伙账目不清。',
    love:'感情和顺，单身者桃花运显，有伴者关系升温、少见争执。',
    health:'身心调和，无明显之应，保持常规作息即可。'
  },
  ping: {
    label:'平年', w:'平',
    note:'与流年太岁无值、冲、刑、害、破，亦无三合、暗合、六合，为无直接作用之象。',
    total:'与流年太岁无直接刑冲破害，为平常之象；流年吉凶由本命八字与流年大运另论，本页不代断。',
    career:'事业无明显太岁之应，按本命节奏推进即可，忌听风是雨。',
    wealth:'财运平稳，无特别吉凶，量入为出、稳健配置为上。',
    love:'感情平顺，无大风波，顺其自然、勿强求。',
    health:'身体无特别之应，规律作息、定期体检即可。'
  }
};

/* ===== 5. 六十甲子→太岁星君对照与化太岁仪轨（民俗通传照录） ===== */
var TS_RITUAL = [
  {t:'拜太岁', d:'正月初八或十五前，到供奉当年太岁星君的道观（或家中朝当年太岁方位）礼拜，报生辰、姓名、住址，祈太岁星君护佑一年平安，此谓"摄太岁"。年末冬至前后拜谢还愿。（当年太岁方位见太岁查询结果首行）'},
  {t:'安奉太岁符', d:'请正一道观太岁符，正月初一至十五安奉于家中清净处（客厅高处或神龛旁），年底冬至前后送化（焚化）送神，符来有处、去有归。'},
  {t:'穿红', d:'值太岁（本命年）民俗穿红内衣、红腰带、红绳，取"红色辟邪"之意；部分地区讲究由家人赠送而非自购。'},
  {t:'避冲', d:'冲太岁之年出行谨慎，避免探病问丧、赌气远行与高风险运动，诸事以稳为主。'},
  {t:'善行积德', d:'通传"一善解百灾"，行善布施、孝亲敬师、护生惜物，为化太岁之根本，前几项皆为辅助。'},
  {t:'立春躲春', d:'立春交节时刻前后约一小时静处不出、避见生人，民俗谓"躲太岁"，各地实践宽严不一，从其俗即可。'}
];

/* 刑名短注：zhiRelTypes 只给类型，展示所需刑名由本页按支补注 */
var XING_NAME = {
  '寅巳':'无恩之刑', '巳申':'无恩之刑', '寅申':'（相冲不论刑，冲力覆盖）',
  '丑戌':'恃势之刑', '戌未':'恃势之刑', '丑未':'恃势之刑',
  '子卯':'无礼之刑', '辰辰':'自刑', '午午':'自刑', '酉酉':'自刑', '亥亥':'自刑'
};
function xingNameOf(a,b){
  var k1=a+b, k2=b+a;
  if (a===b) return XING_NAME[a+a]||'自刑';
  return XING_NAME[k1]||XING_NAME[k2]||'';
}

/* ===== 6. 六十星君总表渲染 ===== */
function renderStarTable(){
  var rows = '';
  for (var i=0;i<window.TAISUI_BIO.length;i++){
    var b = window.TAISUI_BIO[i];
    rows += '<tr>' +
      '<td class="ts-c0">' + esc(b.gz) + '</td>' +
      '<td>' + esc(b.name) + (b.ben?'<span class="ts-alt">（本名'+esc(b.ben)+'）</span>':'') + '</td>' +
      '<td>' + esc(b.chao||'无') + '</td>' +
      '<td>' + esc(b.ji||'无') + '</td>' +
      '<td>' + esc(b.xing||'无') + '</td>' +
      '<td>' + esc(b.wu||'无') + '</td>' +
      '<td class="ts-ming">' + (b.ming?esc(b.ming):'无') + '</td>' +
      '</tr>';
  }
  $('tsTableBody').innerHTML = rows;
}

/* ===== 7. 传记卡片渲染 ===== */
/* summary 统一两行：第一行干支、星君名；第二行朝代、籍贯、生肖相、持物 */
function renderBioCards(){
  var html = '<div class="ts-bio-grid">';
  for (var i=0;i<window.TAISUI_BIO.length;i++){
    var b = window.TAISUI_BIO[i];
    var meta = [];
    meta.push(b.chao||'无');
    meta.push(b.ji||'无');
    meta.push(b.xing||'无');
    meta.push(b.wu||'无');
    html += '<details class="ts-bio" id="tsBio-' + esc(b.gz) + '" data-gz="' + esc(b.gz) + '">' +
      '<summary><span class="ts-bio-line1"><span class="ts-bio-gz">' + esc(b.gz) + '</span>' +
      '<span class="ts-bio-name">' + esc(b.name) + '</span></span>' +
      '<span class="ts-bio-tag">' + esc(meta.join('、')) + '</span></summary>' +
      '<div class="ts-bio-body">' +
      '<p class="ts-bio-meta">星君：' + esc(b.name) +
      (b.ben?'，本名'+esc(b.ben):'') +
      (b.zi?'，字'+esc(b.zi):'') +
      (b.hao?'，号'+esc(b.hao):'') +
      '。' + (b.chao?esc(b.chao)+'时人。':'') + (b.ji?esc(b.ji)+'人。':'') +
      (b.ming?'别本异名：'+esc(b.ming)+'。':'') + '</p>' +
      '<p class="ts-bio-text">' + esc(b.bio||'无') + '</p>' +
      '</div></details>';
  }
  html += '</div>';
  $('tsBioBody').innerHTML = html;
}

/* ===== 7b. 四柱参照系（流年太岁对本命四柱） =====
 * 装配唯一真源：window.buildBaziState（bazi-app.js，与八字页同源，禁另写构造链）。
 * 时辰未知传 12:00 占位仅为装配完整，时柱不判、标"未知时辰，未判"，禁整盘放弃。
 * 年界口径：四柱年柱按立春界（buildBaziState 真源），本页生肖与流年太岁按农历界，
 * 两界不同时渲染中注明。 */
var BP_LABELS = ['年柱','月柱','日柱','时柱'];
function baziStateOf(dateStr, hourVal){
  if (!window.buildBaziState) return null;
  try {
    return window.buildBaziState({
      date: dateStr, time: hourVal || '12:00',
      sex: 1, ziMode: 'late', useTrue: false, lng: 120, kongAxis: 'day'
    });
  } catch(e){ return null; }
}
/* 流年干对单柱干关系（真源：TIANGAN_HE、TIANGAN_CHONG、WX_SHENG、WX_KE、GAN_WX） */
function ganRelBrief(suiGan, colGan){
  var out = [];
  if (!GAN_WX[suiGan] || !GAN_WX[colGan]) return out;
  var he = tianGanHe(suiGan, colGan);
  if (he) out.push('干合化' + he);
  var i, p;
  for (i=0;i<TIANGAN_CHONG.length;i++){
    p = TIANGAN_CHONG[i];
    if ((p[0]===suiGan && p[1]===colGan) || (p[0]===colGan && p[1]===suiGan)){ out.push('干冲'); break; }
  }
  var sw = GAN_WX[suiGan], cw = GAN_WX[colGan];
  if (WX_KE[sw]===cw) out.push('岁克柱');
  else if (WX_KE[cw]===sw) out.push('柱克岁');
  else if (WX_SHENG[sw]===cw) out.push('岁生柱');
  else if (WX_SHENG[cw]===sw) out.push('柱生岁');
  else out.push('比和');
  return out;
}
/* 特殊判定：真太岁、天克地冲、日犯岁君。hasTime=false 时只判前三柱 */
function judgeSuiPillars(suiGan, suiZhi, BZ, hasTime){
  var res = { special: [], n: hasTime ? 4 : 3 };
  var i, g, z, rel;
  if (BZ.yearGan===suiGan && BZ.yearZ===suiZhi){
    res.special.push({t:'真太岁', d:'年柱' + BZ.yearGan + BZ.yearZ + '与流年干支全同，太岁临年柱，岁气笼罩一年之象。'});
  }
  for (i=0;i<res.n;i++){
    g = BZ.gans[i]; z = BZ.zhis[i];
    var ganKe = (GAN_WX[g] && GAN_WX[suiGan] && (WX_KE[GAN_WX[g]]===GAN_WX[suiGan] || WX_KE[GAN_WX[suiGan]]===GAN_WX[g]));
    rel = window.zhiRelTypes ? window.zhiRelTypes(z, suiZhi) : [];
    if (ganKe && rel.indexOf('冲')>=0){
      res.special.push({t:'天克地冲', d: BP_LABELS[i] + g + z + '与流年' + suiGan + suiZhi + '天干相克、地支相冲，为四柱关系中之重象。'});
    }
  }
  if (GAN_WX[BZ.dayGan] && GAN_WX[suiGan] && WX_KE[GAN_WX[BZ.dayGan]]===GAN_WX[suiGan]){
    res.special.push({t:'日犯岁君', d:'日干' + BZ.dayGan + '克流年天干' + suiGan + '，古谓"日犯岁君"，主与太岁相犯，宜谨言慎行、勿与岁争。'});
  }
  return res;
}
/* 四柱参照系渲染块（插在犯太岁判定卡之后） */
function renderBaziBlock(suiGan, suiZhi, BZ, hasTime, lunarZhi){
  var jp = judgeSuiPillars(suiGan, suiZhi, BZ, hasTime);
  var html = '<div class="ts-ys-head">四柱参照系（流年' + esc(suiGan+suiZhi) + '对本命四柱）</div>';
  html += '<div class="ts-tbl-wrap"><table class="ts-tbl"><thead><tr>' +
    '<th>柱</th><th>干支</th><th>与流年干</th><th>与流年支</th></tr></thead><tbody>';
  for (var i=0;i<4;i++){
    if (i>=jp.n){
      html += '<tr><td class="ts-c0">时柱</td><td>未知</td><td colspan="2">未知时辰，未判</td></tr>';
      continue;
    }
    var g = BZ.gans[i], z = BZ.zhis[i];
    var gRel = ganRelBrief(suiGan, g);
    var zRel = window.zhiRelTypes ? window.zhiRelTypes(z, suiZhi).slice() : [];
    if (z===suiZhi) zRel.unshift('值');
    html += '<tr><td class="ts-c0">' + BP_LABELS[i] + '</td><td>' + esc(g+z) + '</td>' +
      '<td>' + esc(gRel.length?gRel.join('、'):'无') + '</td>' +
      '<td>' + esc(zRel.length?zRel.join('、'):'无') + '</td></tr>';
  }
  html += '</tbody></table></div>';
  for (var j=0;j<jp.special.length;j++){
    html += '<div class="ts-judge-row"><span class="ts-judge-k">' + esc(jp.special[j].t) + '</span><span>' + esc(jp.special[j].d) + '</span></div>';
  }
  /* 年界差异提示：四柱年柱立春界与页面农历界不同时注明 */
  return html;
}

/* ===== 8. 个人查测渲染 ===== */
function renderCheck(){
  var out = $('tsCheckOut');
  var dateStr = $('tsDate').value.trim();
  var ly = lunarYearOf(dateStr);
  if (!ly){ out.innerHTML = '<p class="ts-err">请输入有效公历生日，格式 2026-09-05（yyyy-mm-dd，月日两位补零）。</p>'; return; }
  var suiLy = lunarYearOf($('tsSuiDate').value.trim()) || lunarYearOf(todayStr());
  var suiZhi = suiLy.zhi, suiGz = suiLy.ygz;
  var yZhi = ly.zhi;
  var r = judgeTaisui(yZhi, suiZhi);
  var star = window.TAISUI_STAR[suiGz]||'未载';
  var bio = bioOfGz(suiGz);

  var html = '';
  /* 头卡：本命与流年 */
  html += '<div class="ts-head-cards"><div class="ts-card">' +
    '<div class="ts-card-k">本命年支</div><div class="ts-card-v">' + esc(ly.ygz) + '</div>' +
    '<div class="ts-card-s">' + esc(ly.sheng) + '肖，公历 ' + esc(fmtYmd(ly)) + '；本命太岁' + esc(yZhi) + '宫居' + esc((window.ZHI_FANG||{})[yZhi] || '无') + '方</div></div>' +
    '<div class="ts-card ts-card-gold">' +
    '<div class="ts-card-k">流年太岁</div><div class="ts-card-v">' + esc(suiGz) + '</div>' +
    '<div class="ts-card-s">' + esc(star) + '大将军，' + esc(ZHI_SHENG[suiZhi]) + '年，' + esc(suiLy.y) + '年；太岁居' + esc((window.ZHI_FANG||{})[suiZhi] || '无') + '方</div></div></div>';

  /* 犯太岁判定卡 */
  var tags = '';
  if (r.types.length===0){
    tags = '<span class="ts-badge ts-ok">与流年太岁无刑冲破害</span>';
  } else {
    var order = ['值','冲','刑','害','破','合','暗合','三合'];
    for (var i=0;i<order.length;i++){
      if (r.types.indexOf(order[i])>=0){
        var cls = (order[i]==='三合'||order[i]==='暗合') ? 'ts-badge ts-good' : 'ts-badge ts-bad';
        tags += '<span class="' + cls + '">' + esc(order[i]) + '太岁</span>';
      }
    }
  }
  html += '<div class="ts-judge"><div class="ts-judge-row"><span class="ts-judge-k">判定</span>' + tags + '</div>';
  if (r.sanheHit){ html += '<div class="ts-judge-row"><span class="ts-judge-k">三合</span><span>本命' + esc(yZhi) + '与流年' + esc(suiZhi) + '同入' + esc(r.sanhe.group) + '局（' + esc(r.sanhe.wu) + '局），得岁气之助。</span></div>'; }
  if (r.xing){ html += '<div class="ts-judge-row"><span class="ts-judge-k">刑名</span><span>' + esc(xingNameOf(yZhi,suiZhi)||'刑') + '</span></div>'; }
  html += '</div>';

  /* 四柱参照系（与八字页同源 buildBaziState；装配失败时整块省略不阻断生肖参照系） */
  var hourVal = $('tsHour') ? $('tsHour').value : '';
  var hasTime = !!hourVal;
  var bzs = baziStateOf(dateStr, hourVal);
  if (bzs && bzs.BZ && bzs.BZ.gans){
    html += renderBaziBlock(suiGz.charAt(0), suiZhi, bzs.BZ, hasTime, ly.zhi);
  }

  /* 星君传卡 */
  if (bio){
      html += '<details class="ts-bio ts-bio-sui" id="tsBioSui" open><summary><span class="ts-bio-line1"><span class="ts-bio-gz">' + esc(bio.gz) + '</span>' +
      '<span class="ts-bio-name">' + esc(bio.name) + '大将军</span></span>' +
      '<span class="ts-bio-tag">' + esc((bio.chao||'无')+'，'+(bio.ji||'无')+'，'+(bio.xing||'无')+'，'+(bio.wu||'无')) + '</span></summary>' +
      '<div class="ts-bio-body"><p class="ts-bio-text">' + esc(bio.bio||'无') + '</p>' +
      (bio.ming?'<p class="ts-bio-meta">别本异名：'+esc(bio.ming)+'。</p>':'') +
      '</div></details>';
  }

  /* 应事分项卡（五分项） */
  html += renderYingshi(r, yZhi, suiZhi, ly.sheng);
  out.innerHTML = html;
  applyTsModState(); /* 本命星君卡随查询重出，重出后按存值复位开合 */
}

/* 按干支取传记对象 */
function bioOfGz(gz){
  for (var i=0;i<window.TAISUI_BIO.length;i++){ if (window.TAISUI_BIO[i].gz===gz) return window.TAISUI_BIO[i]; }
  return null;
}

/* 应事分项表格（犯类与得类分开渲染；多类并存时以最重者为主，余类并注） */
function renderYingshi(r, yZhi, suiZhi, sheng){
  var badKeys = [];
  if (r.chong) badKeys.push('chong');
  if (r.zhi)   badKeys.push('zhi');
  if (r.xing)  badKeys.push('xing');
  if (r.po)    badKeys.push('po');
  if (r.hai)   badKeys.push('hai');
  var goodKeys = [];
  if (r.sanheHit) goodKeys.push('sanhe');
  if (r.anhe)     goodKeys.push('anhe');

  var html = '';
  if (badKeys.length===0 && goodKeys.length===0){
    html += '<div class="ts-ys-head">本年无犯</div>' +
      '<p class="ts-ys-note">本命' + esc(sheng) + '肖与流年太岁无冲、刑、害、破，亦无三合暗合，为平年之象：流年干支不与本命年支直接作用，吉凶由本命八字与流年大运另论，本页不代断。</p>';
    return html;
  }
  var mainKey = badKeys.length ? badKeys[0] : goodKeys[0];
  var t = TS_TEMPLATES[mainKey];
  html += '<div class="ts-ys-head">' + esc(t.label) + '（力' + esc(t.w) + '）' +
    (badKeys.length>1?'<span class="ts-ys-sub">另有' + esc(badKeys.slice(1).map(function(k){return TS_TEMPLATES[k].label;}).join('、')) + '并见，应事叠加参看</span>':'') +
    '</div>';
  html += '<p class="ts-ys-note">' + esc(t.note) + '</p>';
  html += '<div class="ts-tbl-wrap"><table class="ts-tbl ts-ys-tbl"><thead><tr>' +
    '<th>分项</th><th>之象</th></tr></thead><tbody>';
  var items = [['总体','total'],['事业','career'],['财运','wealth'],['感情','love'],['健康','health']];
  for (var i=0;i<items.length;i++){
    html += '<tr><td class="ts-c0">' + esc(items[i][0]) + '</td><td>' + esc(t[items[i][1]]) + '</td></tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

/* ===== 9. 生肖太岁（按查询日期，年、月、日三张表分别解读） ===== */
/* 单支关系短句：犯类（值冲刑害破）、得类（三合暗合合）、平；取 zhiRelTypes 真源 */
function relBrief(z, refZhi){
  var r = judgeTaisui(z, refZhi);
  if (r.chong) return '冲';
  if (r.zhi)   return '值';
  if (r.xing)  return '刑';
  if (r.po)    return '破';
  if (r.hai)   return '害';
  if (r.sanheHit) return '三合';
  if (r.anhe)  return '暗合';
  if (r.he)    return '合';
  return '平';
}
/* 月、日层关系解读（各层语境不同：年论太岁一年之象，月论当月 30 天，日论当日） */
var REL_NOTES = {
  '值': '同支伏吟，本层气专而强，主事反复、自我较劲，吉凶皆加倍应。',
  '冲': '对冲本层之气，动荡之象最显，变动、出行、碰撞之应较急，宜以静制动。',
  '刑': '刑动纠缠，事多反复内耗，文书、口舌、暗伤之应，未如冲之激烈。',
  '破': '突发之破，计划易被打乱、小有损失，应期急去也快。',
  '害': '穿害妨损，多应人事摩擦、被拖累，为本层最轻之犯。',
  '三合': '同入三合局得本层气之助，顺遂增益，宜推进要事。',
  '暗合': '藏干暗中相合，不显山露水，暗中有机遇亦有暗耗。',
  '合': '六合相合，和合之象，贵人缘与协作运佳。',
  '平': '与本层支无直接刑冲破害，为平常之象，吉凶由本命八字另论。'
};
/* 单层生肖表：title 表标题、refZhi 本层地支、full 解读详略（年层全名+力+总体之象，月日层短句+本层之象） */
function renderLayerTable(title, refZhi, full){
  var order = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var html = '<div class="ts-year-head">' + esc(title) + '（本层支：' + esc(refZhi) + '，' + esc(ZHI_SHENG[refZhi]) + '）</div>';
  html += '<div class="ts-tbl-wrap"><table class="ts-tbl"><thead><tr>' +
    (full ? '<th>生肖</th><th>年支</th><th>关系</th><th>力</th><th>总体之象</th>'
          : '<th>生肖</th><th>本命支</th><th>关系</th><th>本层之象</th>') +
    '</tr></thead><tbody>';
  for (var i=0;i<order.length;i++){
    var z = order[i];
    if (full){
      var r = judgeTaisui(z, refZhi);
      var mainKey = r.chong?'chong':(r.zhi?'zhi':(r.xing?'xing':(r.po?'po':(r.hai?'hai':(r.he?'he':'')))));
      var relTxt, wTxt, sumTxt;
      if (mainKey){
        relTxt = TS_TEMPLATES[mainKey].label; wTxt = TS_TEMPLATES[mainKey].w; sumTxt = TS_TEMPLATES[mainKey].total;
      } else if (r.sanheHit){
        relTxt = '三合太岁'; wTxt = '吉'; sumTxt = TS_TEMPLATES.sanhe.total;
      } else if (r.anhe){
        relTxt = '暗合太岁'; wTxt = '小吉'; sumTxt = TS_TEMPLATES.anhe.total;
      } else {
        relTxt = '无犯'; wTxt = '平'; sumTxt = '与流年太岁无直接刑冲破害，为平年之象，吉凶由本命八字与流年大运另论。';
      }
      var cls = (wTxt==='吉'||wTxt==='小吉') ? ' class="ts-row-good"' : (wTxt==='平' ? '' : ' class="ts-row-bad"');
      html += '<tr' + cls + '><td class="ts-c0">' + esc(ZHI_SHENG[z]) + '</td><td>' + esc(z) + '</td>' +
        '<td>' + esc(relTxt) + '</td><td>' + esc(wTxt) + '</td><td>' + esc(sumTxt) + '</td></tr>';
    } else {
      var rel = relBrief(z, refZhi);
      var cls2 = (rel==='三合'||rel==='暗合'||rel==='合') ? ' class="ts-row-good"' : (rel==='平' ? '' : ' class="ts-row-bad"');
      html += '<tr' + cls2 + '><td class="ts-c0">' + esc(ZHI_SHENG[z]) + '</td><td>' + esc(z) + '</td>' +
        '<td>' + esc(rel) + '</td><td>' + esc(REL_NOTES[rel]) + '</td></tr>';
    }
  }
  html += '</tbody></table></div>';
  return html;
}
function renderYearView(){
  var out = $('tsYearOut');
  /* 优先取本模块查询日期，空则回落顶部流年参考日，再回落今天 */
  var q = $('tsYearDate').value.trim();
  var ly = lunarYearOf(q) || lunarYearOf($('tsSuiDate').value.trim()) || lunarYearOf(todayStr());
  if (!ly){
    out.innerHTML = '<p class="ts-err">请输入有效查询日期，格式 2026-09-05（yyyy-mm-dd，月日两位补零）。</p>';
    return;
  }
  /* 年、月、日三层干支（lunar.js 真源：月以节令为界、日按当日干支） */
  var l = Solar.fromYmd(ly.y, ly.mo, ly.d).getLunar();
  var mgz = l.getMonthInGanZhi(), dgz = l.getDayInGanZhi();
  var mZhi = mgz.charAt(1), dZhi = dgz.charAt(1);
  var suiGz = ly.ygz;
  var star = window.TAISUI_STAR[suiGz]||'未载';
  var html = '<div class="ts-year-head">查询日 ' + esc(fmtYmd(ly)) + '（' +
    esc(suiGz) + '年 ' + esc(mgz) + '月 ' + esc(dgz) + '日，' +
    esc(star) + '大将军当值）年、月、日三层十二生肖关系分列如下</div>';
  /* 年生肖表：太岁一年之象（全名+力+总体之象） */
  html += renderLayerTable('年生肖（太岁一层，论全年）', ly.zhi, true);
  /* 月生肖表：当月之象 */
  html += renderLayerTable('月生肖（' + esc(mgz) + '月一层，论当月）', mZhi, false);
  /* 日生肖表：当日之象 */
  html += renderLayerTable('日生肖（' + esc(dgz) + '日一层，论当日）', dZhi, false);
  out.innerHTML = html;
}

/* ===== 9b. 生肖年度、月度运程（关系派生，零年度维护） =====
 * 年度：12 肖本命支 × 流年太岁支 → relBrief 真源 → fortuneKeyOf → TS_TEMPLATES 维度文案。
 * 月度：12 肖本命支 × 十二月亮支（寅卯辰巳午未申酉戌亥子丑，以节令为界，序列固定）
 *       故月度关系跨年通用，作通用月度参考；单元格标关系、悬停看基调。
 * 本命生肖高亮：取顶部公历生日对应生肖支，行内注"（本命）"并以暖金底色标出。 */
function fortuneKeyOf(rel){
  switch(rel){
    case '值': return 'zhi';
    case '冲': return 'chong';
    case '刑': return 'xing';
    case '害': return 'hai';
    case '破': return 'po';
    case '三合': return 'sanhe';
    case '暗合': return 'anhe';
    case '合': return 'he';
    default: return 'ping';
  }
}
/* 月度基调短句（供矩阵单元格悬停，动作导向，较 REL_NOTES 更简短） */
var FORTUNE_GIST = {
  '值':'本命月，事多反复，宜守不宜攻。',
  '冲':'动荡之月，变动出行之应较急，以静制动。',
  '刑':'纠缠之月，文书口舌之应，理清头绪少结怨。',
  '破':'突发之月，计划易打乱，预算留余地、备方案。',
  '害':'摩擦之月，防人际拖累，界限分明。',
  '三合':'顺遂之月，得月气之助，宜推进要事。',
  '暗合':'暗动之月，机缘在水面下，低调推进。',
  '合':'和合之月，贵人协作运佳，广结善缘。',
  '平':'平常之月，无直接作用，按本命节奏推进。'
};
/* 十二月亮支（节令月，固定序列）与起始节令 */
var MONTH_ZHI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
var MONTH_JIE = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];

/* 年度运程：12 肖表（生肖 | 关系 | 事业 | 财运 | 感情 | 健康） */
function renderFortuneYear(){
  var q = $('tsFortuneDate').value.trim();
  var ly = lunarYearOf(q) || lunarYearOf(todayStr());
  if (!ly){ return '<p class="ts-err">请输入有效公历日期，格式 2026-09-05（yyyy-mm-dd，月日两位补零）。</p>'; }
  var suiZhi = ly.zhi, suiGz = ly.ygz;
  var star = window.TAISUI_STAR[suiGz]||'未载';
  /* 本命高亮：取顶部生日生肖支 */
  var benZhi = '';
  var dStr = $('tsDate').value.trim();
  if (dStr){ var bly = lunarYearOf(dStr); if (bly) benZhi = bly.zhi; }
  var order = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var html = '<div class="ts-year-head">' + esc(suiGz) + '年（' + esc(star) + '大将军当值）十二生肖年度运程</div>';
  html += '<div class="ts-tbl-wrap"><table class="ts-tbl"><thead><tr>' +
    '<th>生肖</th><th>关系</th><th>事业</th><th>财运</th><th>感情</th><th>健康</th></tr></thead><tbody>';
  for (var i=0;i<order.length;i++){
    var z = order[i];
    var rel = relBrief(z, suiZhi);
    var t = TS_TEMPLATES[fortuneKeyOf(rel)];
    var relLabel = t.label + '（力' + t.w + '）';
    var cls = (t.w==='吉'||t.w==='小吉') ? ' class="ts-row-good"' : (t.w==='平' ? '' : ' class="ts-row-bad"');
    var benMark = (z===benZhi) ? '（本命）' : '';
    var benStyle = (z===benZhi) ? ' style="background:rgba(138,106,30,.14)"' : '';
    html += '<tr' + cls + benStyle + '><td class="ts-c0">' + esc(ZHI_SHENG[z]) + benMark + '（' + esc(z) + '）</td>' +
      '<td>' + esc(relLabel) + '<br><span class="ts-ys-sub">' + esc(t.total) + '</span></td>' +
      '<td>' + esc(t.career) + '</td><td>' + esc(t.wealth) + '</td><td>' + esc(t.love) + '</td><td>' + esc(t.health) + '</td></tr>';
  }
  html += '</tbody></table></div>';
  return html;
}
/* 月度运程：12 肖 × 12 月矩阵 */
function renderFortuneMonth(){
  var order = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var html = '<div class="ts-year-head">十二生肖月度运程（生肖本命支 × 月支，月以节令为界）</div>';
  html += '<div class="ts-tbl-wrap"><table class="ts-tbl"><thead><tr><th>生肖</th>';
  for (var m=0;m<MONTH_ZHI.length;m++){
    html += '<th>' + esc(MONTH_ZHI[m]) + '<br><span class="ts-ys-sub">' + esc(MONTH_JIE[m]) + '</span></th>';
  }
  html += '</tr></thead><tbody>';
  for (var i=0;i<order.length;i++){
    var z = order[i];
    html += '<tr><td class="ts-c0">' + esc(ZHI_SHENG[z]) + '（' + esc(z) + '）</td>';
    for (var m2=0;m2<MONTH_ZHI.length;m2++){
      var rel = relBrief(z, MONTH_ZHI[m2]);
      var cls = (rel==='三合'||rel==='暗合'||rel==='合') ? ' class="ts-row-good"' : (rel==='平' ? '' : ' class="ts-row-bad"');
      var gist = FORTUNE_GIST[rel] || '';
      html += '<td' + cls + ' title="' + esc(gist) + '">' + esc(rel) + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}
/* 年度 + 月度合一渲染 */
function renderFortune(){
  var out = $('tsFortuneOut');
  if (!out) return;
  var q = $('tsFortuneDate').value.trim();
  if (!lunarYearOf(q)){
    out.innerHTML = '<p class="ts-err">请输入有效公历日期，格式 2026-09-05（yyyy-mm-dd，月日两位补零）。</p>';
    return;
  }
  out.innerHTML = renderFortuneYear() + renderFortuneMonth();
}

/* ===== 10. 化太岁仪轨渲染 ===== */
function renderRitual(){
  var html = '<div class="ts-ritual-grid">';
  for (var i=0;i<TS_RITUAL.length;i++){
    html += '<div class="ts-ritual"><div class="ts-ritual-t">' + esc(TS_RITUAL[i].t) + '</div><p>' + esc(TS_RITUAL[i].d) + '</p></div>';
  }
  html += '</div>';
  $('tsRitualBody').innerHTML = html;
}

/* ===== 11. 今日串与工具 ===== */
function todayStr(){
  var d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
}
/* 日期串规范输出：月与日两位补零，输出 YYYY-MM-DD 形态 */
function fmtYmd(o){ return o.y + '-' + pad2(o.mo) + '-' + pad2(o.d); }

/* ===== 12. AI 上下文 ===== */
function tsAiContext(){
  var suiLy = lunarYearOf($('tsSuiDate').value.trim()) || lunarYearOf(todayStr());
  var s = '【太岁生肖页】太岁为道教值年神，一年一换，共六十甲子星君。\n';
  s += '流年：' + suiLy.y + ' 年（' + suiLy.ygz + '年），太岁星君' + (window.TAISUI_STAR[suiLy.ygz]||'未载') + '大将军当值。\n';
  var dateStr = $('tsDate').value.trim();
  if (dateStr){
    var ly = lunarYearOf(dateStr);
    if (ly){
      var r = judgeTaisui(ly.zhi, suiLy.zhi);
      s += '用户本命：' + ly.ygz + '年（' + ly.sheng + '肖）。\n';
      s += '犯太岁判定：' + (r.types.length?r.types.join('、'):'无犯') + '。\n';
      s += '太岁方位：流年太岁' + suiLy.zhi + '宫居' + (window.ZHI_FANG ? (window.ZHI_FANG[suiLy.zhi] || '无') : '无') + '方；本命太岁' + ly.zhi + '宫居' + (window.ZHI_FANG ? (window.ZHI_FANG[ly.zhi] || '无') : '无') + '方。\n';
      if (r.sanheHit) s += '三合：本命' + ly.zhi + '与流年同入' + r.sanhe.group + '局。\n';
      var mainKey = r.chong?'chong':(r.zhi?'zhi':(r.xing?'xing':(r.po?'po':(r.hai?'hai':(r.he?'he':'')))));
      if (mainKey)       s += '主力形态：' + TS_TEMPLATES[mainKey].label + '（力' + TS_TEMPLATES[mainKey].w + '）。\n';
      var hourVal2 = $('tsHour') ? $('tsHour').value : '';
      var hasTime2 = !!hourVal2;
      var bzs2 = baziStateOf(dateStr, hourVal2);
      if (bzs2 && bzs2.BZ && bzs2.BZ.gans){
        var jp2 = judgeSuiPillars(suiLy.ygz.charAt(0), suiLy.zhi, bzs2.BZ, hasTime2);
        var pil = bzs2.BZ;
        s += '本命四柱：' + pil.gans[0] + pil.zhis[0] + '年、' + pil.gans[1] + pil.zhis[1] + '月、' + pil.gans[2] + pil.zhis[2] + '日' + (hasTime2 ? '、' + pil.gans[3] + pil.zhis[3] + '时' : '（未知时辰，未判）') + '。\n';
        s += '四柱参照系：年柱按立春界，本页太岁按农历界，两界不同时以八字排盘页为准。\n';
        if (jp2.special.length){
          for (var k2=0;k2<jp2.special.length;k2++){ s += '四柱特殊：' + jp2.special[k2].t + '，' + jp2.special[k2].d + '\n'; }
        } else {
          s += '四柱特殊：无真太岁、天克地冲、日犯岁君。\n';
        }
      }
    }
  }
  /* 生肖年度运程（用户本命生肖 × 流年） */
  var fLy = lunarYearOf($('tsFortuneDate').value.trim()) || suiLy;
  var fDateStr = $('tsDate').value.trim();
  if (fDateStr){
    var fb = lunarYearOf(fDateStr);
    if (fb){
      var fRel = relBrief(fb.zhi, fLy.zhi);
      var fKey = fortuneKeyOf(fRel);
      s += '本命生肖年度运程：' + fb.sheng + '肖与流年' + fLy.ygz + '为' + TS_TEMPLATES[fKey].label + '（力' + TS_TEMPLATES[fKey].w + '），总评：' + TS_TEMPLATES[fKey].total + '\n';
    }
  }
  s += '判定取全站地支关系唯一真源；五类应事与化太岁仪轨均为民俗通传照录，非古籍逐条定论，不作命理定论、不作灵验承诺。解读时保持文化视角，吉凶之断以八字原局与大运为主。';
  return s;
}

/* ===== 13. 共享状态（shareWait） ===== */
function tsCollect(){
  return { date:$('tsDate').value, hour:$('tsHour') ? $('tsHour').value : '', suiDate:$('tsSuiDate').value, yearDate:$('tsYearDate').value, fortuneDate:$('tsFortuneDate').value };
}
function tsRestore(s){
  if (!s) return;
  if (s.date){ $('tsDate').value = s.date; }
  if (s.hour && $('tsHour')){ $('tsHour').value = s.hour; }
  if (s.date || s.hour){ renderCheck(); }
  if (s.suiDate){ $('tsSuiDate').value = s.suiDate; renderCheck(); }
  if (s.yearDate){ $('tsYearDate').value = s.yearDate; }
  if (s.fortuneDate){ $('tsFortuneDate').value = s.fortuneDate; }
  renderYearView();
  renderFortune();
}

/* ===== 13b. 折叠模块开合与状态持久化（ES5） ===== */
var TS_MOD_KEY = 'tsModState';
var tsModNavReady = false;
function _tsAllModIds(){ try{ return Array.from(document.querySelectorAll('.mod[id]')).map(function(e){ return e.id; }); }catch(e){ return ['tsmod-check','tsmod-year','tsmod-ritual']; } }
function toggleMod(id){ var el = document.getElementById(id); if (el) el.classList.toggle('collapsed'); saveTsModState(); }
function readTsModState(){
  try{
    var raw = null;
    try{ raw = localStorage.getItem(TS_MOD_KEY); }catch(e){}
    if (!raw){ try{ raw = sessionStorage.getItem(TS_MOD_KEY); }catch(e){} }
    var o = raw ? JSON.parse(raw) : null;
    return (o && typeof o === 'object') ? o : {};
  }catch(e){ return {}; }
}
function saveTsModState(){
  if (!tsModNavReady) return; /* 初始化完成前不写，避免覆盖已保存状态 */
  try{
    /* 以已存为底、只覆盖此刻在场的件：复位本身会触发 toggle 回调本函数，
       整份重写会把此刻未渲染的件的键一并抹掉，下次刷新读不回来 */
    var o = readTsModState();
    _tsAllModIds().forEach(function(id){ var e = document.getElementById(id); if (e) o[id] = e.classList.contains('collapsed'); });
    /* 页内折叠块的 open 状态一并持久化（须带 id 方可定位） */
    try{
      var zr = (o._zr && typeof o._zr === 'object') ? o._zr : {};
      document.querySelectorAll('details[id]').forEach(function(d){ zr[d.id] = d.open; });
      if (Object.keys(zr).length) o._zr = zr;
    }catch(e){}
    var v = JSON.stringify(o);
    try{ localStorage.setItem(TS_MOD_KEY, v); }catch(e){}
    try{ sessionStorage.setItem(TS_MOD_KEY, v); }catch(e){}
  }catch(e){}
}
function applyTsModState(){
  var o = readTsModState();
  try{
    _tsAllModIds().forEach(function(id){
      var e = document.getElementById(id); if (!e) return;
      if (o[id] === true) e.classList.add('collapsed');
      else if (o[id] === false) e.classList.remove('collapsed');
    });
    if (o._zr && typeof o._zr === 'object'){
      try{ document.querySelectorAll('details[id]').forEach(function(d){ if (d.id in o._zr) d.open = !!o._zr[d.id]; }); }catch(e){}
    }
  }catch(e){}
}
/* 页内折叠块展开/收起即保存：toggle 事件不冒泡，用捕获阶段监听 */
try{ document.addEventListener('toggle', function(e){ if (e.target && e.target.tagName === 'DETAILS' && e.target.id) saveTsModState(); }, true); }catch(e){}
/* ===== 14. 初始化 ===== */
function init(){
  renderStarTable();
  renderBioCards();
  renderRitual();
  $('tsCheckBtn').addEventListener('click', renderCheck);
  $('tsYearBtn').addEventListener('click', renderYearView);
  /* 默认当天直接出结果：公历生日=今天、流年参考日=今天、生肖太岁查询日=今天 */
  $('tsDate').value = todayStr();
  $('tsSuiDate').value = todayStr();
  $('tsYearDate').value = todayStr();
  renderCheck();
  renderYearView();
  /* 生肖运程模块：默认当天出结果 */
  $('tsFortuneDate').value = todayStr();
  $('tsFortuneBtn').addEventListener('click', renderFortune);
  renderFortune();
  if (window.mountAI) window.mountAI(tsAiContext, '太岁生肖');
  applyTsModState(); /* 恢复折叠状态（渲染完成后） */
  tsModNavReady = true; /* 打标后才允许写持久化 */
  window.toggleMod = toggleMod;
  if (window.shareWait) window.shareWait({
    page:'taisui', title:'太岁生肖',
    collect:tsCollect, restore:tsRestore,
    recast:function(){ renderCheck(); renderYearView(); renderFortune(); }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
