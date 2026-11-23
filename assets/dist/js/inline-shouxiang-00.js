


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    (function(){
    'use strict';
    function $(id){ return document.getElementById(id); }
    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    var SHOU = window.XS_SHOU;

    /* 手部全息反射区：现代手诊、反射学与全息诊疗法之说，非古籍条文；
       三系分区各本不一，只列通行较一致者，不混拼第三值。 */
    var SX_REFLEX = {
      zones: [
        { pos: '十指指腹与指尖', tcm: '头面、五官', reflex: '头、脑、鼻窦、眼、耳' },
        { pos: '拇指根与掌指关节', tcm: '颈项、咽喉', reflex: '头颈、甲状腺' },
        { pos: '食指根至虎口', tcm: '肝、胆', reflex: '肺、大肠' },
        { pos: '中指根下', tcm: '心、小肠', reflex: '心、循环' },
        { pos: '无名指根下', tcm: '肺、大肠', reflex: '肝、胆' },
        { pos: '小指根下', tcm: '肾、膀胱', reflex: '肾、膀胱' },
        { pos: '大鱼际中部', tcm: '脾、胃', reflex: '胸、心、呼吸' },
        { pos: '掌心明堂', tcm: '心、胃', reflex: '腹腔神经丛、胃、肠' },
        { pos: '小鱼际下部', tcm: '肾、膀胱、生殖', reflex: '下腹、肠道' },
        { pos: '掌根正中', tcm: '肾、生殖、泌尿', reflex: '盆腔、生殖器官' },
        { pos: '腕横纹', tcm: '未载', reflex: '盆腔、下肢' },
        { pos: '手背', tcm: '未载', reflex: '脊柱、腰背' }
      ],
      zonesNote: '现代手诊与反射学之说，非古籍条文；两系对应各本不一，只列通行较一致者；不作诊疗依据。',
      points: [
        { name: '头穴', loc: '第二掌骨桡侧，近指端', body: '头、眼、耳、鼻、口' },
        { name: '颈穴', loc: '头穴之后', body: '颈项、咽喉' },
        { name: '上肢穴', loc: '颈穴之后', body: '上肢、肩肘' },
        { name: '心肺穴', loc: '上肢穴之后', body: '心、肺、胸' },
        { name: '肝穴', loc: '心肺穴之后', body: '肝、胆' },
        { name: '胃穴', loc: '肝穴之后', body: '胃、脘腹' },
        { name: '十二指肠穴', loc: '胃穴之后', body: '十二指肠、小肠' },
        { name: '肾穴', loc: '十二指肠穴之后', body: '肾、泌尿' },
        { name: '腰穴', loc: '肾穴之后', body: '腰、背' },
        { name: '下腹穴', loc: '腰穴之后', body: '下腹、盆腔' },
        { name: '腿穴', loc: '下腹穴之后', body: '下肢' },
        { name: '足穴', loc: '近腕端', body: '足、踝' }
      ],
      pointsNote: '张颖清所立，十二穴自指端向腕端；另有心肺分作肺、心两穴的十三穴异文。通行说，不作诊疗依据。',
      states: [
        { k: '色泽（古典五色）', biao: '青、赤、黄、白、黑', mean: '青应肝、赤应心、黄应脾、白应肺、黑应肾', note: '五色配属同本页掌色表，属传统五行配属。' },
        { k: '色泽（现代手诊）', biao: '白', mean: '炎症', note: '现代流行手诊说，与古典五色配属分属两系。' },
        { k: '色泽（现代手诊）', biao: '红', mean: '炎症较重或出血', note: '同上。' },
        { k: '色泽（现代手诊）', biao: '青、绿', mean: '循环不良', note: '同上。' },
        { k: '色泽（现代手诊）', biao: '褐', mean: '久病、慢性', note: '同上。' },
        { k: '色泽（现代手诊）', biao: '黑', mean: '危重', note: '同上。' },
        { k: '形态', biao: '凹陷', mean: '相应脏腑气虚', note: '通行手诊说，未逐条对标准核。' },
        { k: '形态', biao: '凸起', mean: '气滞、痰湿、郁结', note: '同上。' },
        { k: '形态', biao: '结节', mean: '久病、瘀滞', note: '同上。' },
        { k: '青筋', biao: '明显', mean: '寒湿、瘀滞', note: '同上。' },
        { k: '温度', biao: '偏热', mean: '热证', note: '同上。' },
        { k: '温度', biao: '偏凉', mean: '寒证、阳虚', note: '同上。' },
        { k: '压痛', biao: '明显', mean: '该体系主张对应部位有异', note: '全息诊疗法与反射学均以压痛为察点。' }
      ],
      statesNote: '现代手诊通行说，各本解释不一；只作形态参考，不作病名之断。',
      wangLines: [
        { no: '1线', name: '远端横曲线、感情线、天线', loc: '自手掌尺侧伸向食指与中指之间下方，弧形反向抛物状', zhu: '主胃肠、呼吸、生殖系统；长度与走向反映消化功能。' },
        { no: '2线', name: '近端横曲线、小鱼际抛物线、智慧线、心线', loc: '起于食指近节关节腔边缘，向小鱼际抛行，止于无名指中线', zhu: '主神经精神、心血管、智力与外伤。' },
        { no: '3线', name: '大鱼际曲线、大鱼际抛物线、生命线、地线', loc: '包绕整个拇指球', zhu: '主体质、精力、能力、健康及疾病。' },
        { no: '4线', name: '健康线', loc: '起于大鱼际，以不接触3线为原则，斜向小指，可到小指根部1线', zhu: '劳心、体弱者，肝肾功能差或慢性呼吸系统病多见。' },
        { no: '5线', name: '玉柱线、事业线', loc: '自手掌下方经掌心明堂直达中指下方，宜浅细笔直', zhu: '越长至中指下，健康越差；主心肺功能减退、中晚年心脑血管病。' },
        { no: '6线', name: '干扰线、障碍线', loc: '横切各主线或辅助线的不正常纹线，位置不固定', zhu: '深长超过1cm才有临床价值。' },
        { no: '7线', name: '太阳线', loc: '5线的副线，位于无名指下，比5线短', zhu: '临床少见。' },
        { no: '8线', name: '放纵线', loc: '月丘下方稍低处，粗长丑陋，向3线延伸', zhu: '生活不规律、熬夜、体力过度消耗、性生活过度、嗜酒、长期服安眠药或麻醉品。' },
        { no: '9线', name: '金星线', loc: '食指与中指指缝下缘向无名指与小指指缝下连接的弧线', zhu: '过敏体质；不孕症夫妻双方均有9线须查抗体。' },
        { no: '10线', name: '土星线', loc: '中指基底部弧形半月圆', zhu: '性格孤僻，与近视家族史有关。' },
        { no: '11线', name: '性线', loc: '小指根部、1线之上的短线，约近小指根一半', zhu: '多数人两三条；主泌尿生殖功能。' },
        { no: '12线', name: '肝病线、酒线', loc: '起于1线与小指根线中部，斜行连到1线无名指下方', zhu: '嗜酒或一饮即醉、肝脏解毒力下降、酒精中毒型肝硬化；慢性肝炎、接触毒品者多见。' },
        { no: '13线', name: '悉尼线', loc: '2线变异一直延伸到手掌尺侧缘', zhu: '肝癌、血液病、牛皮癣患者可见；部分后天形成，有岛纹意义更大。' },
        { no: '14线', name: '通贯掌', loc: '1线消失、2线与3线合并', zhu: '遗传倾向极强。' }
      ],
      wangLinesNote: '王晨霞掌纹诊病十四线，由三条主线与十一条辅助线组成；现代通行说，线名与顺序取通行名单，未逐条对原书核；不作诊疗依据。',
      wangMarks: [
        { name: '十字纹', shape: '交叉短线', loc: '掌中任意处', zhu: '预知早期病症；器官功能紊乱或炎症，浮浅色红多急性，深暗多慢性。' },
        { name: '井字纹', shape: '四条短线组成四角形', loc: '掌中', zhu: '辨识实质病变；慢性炎症，发展较慢；胆区者炎症无结石。' },
        { name: '米字纹', shape: '三、四条短纹交叉', loc: '掌中', zhu: '提示脏器淤血；胆区者可见结石，心区者提示心绞痛。' },
        { name: '三角纹', shape: '短线与主线相交成三角形', loc: '主线旁', zhu: '显示病症变化；冠心病隐患，程度比十字纹重、比井字纹轻。' },
        { name: '方格纹', shape: '四条线围成长方形或正方形', loc: '手术或外伤疤痕处', zhu: '代表病情稳定；手术或外伤疤痕，有向好转归之意。' },
        { name: '五角星纹', shape: '五角星形', loc: '掌中', zhu: '关注脑部病变；较少见，缺血性脑血管意外。' },
        { name: '岛纹', shape: '形如小岛', loc: '主线之上', zhu: '警示肿瘤癌变；肿瘤或炎性肿块，纹越小越需留意。' },
        { name: '环形纹', shape: '圆环状', loc: '掌中', zhu: '代表外伤撞击；较重外伤可在掌上留下环形纹。' }
      ],
      wangMarksNote: '王晨霞掌纹诊病八种异常纹，现代通行说；不同资料顺序不一，本表只列名目；与本页辅助线纹与标记的通行名目分属两系，同名不同义者各随本系；不作病名之断。',
      wangZones: [
        { zone: '肺二区', loc: '大鱼际桡侧，拇指掌指褶纹中点与腕纹中点连线外侧', organ: '肺', sign: '未载' },
        { zone: '肺一区', loc: '中指与无名指根部', organ: '肺', sign: '1线出现方格纹，表示感染。' },
        { zone: '心一区', loc: '中指、无名指根部掌纹与1线之间', organ: '心', sign: '纹理杂乱，提示心脏功能受损。' },
        { zone: '心二区', loc: '2线上劳宫穴周围', organ: '心', sign: '出现十字纹，提示心律不齐、心悸、心脏神经官能症。' },
        { zone: '心三区', loc: '大鱼际除震位与肺二区所余部分', organ: '心', sign: '压之松软塌陷、指印久不消，提示微循环差、心功能衰弱；青黄色更重。' },
        { zone: '胃一区', loc: '虎口，拇指掌指褶纹内侧端平行线至3线以上所包围的面积', organ: '胃', sign: '树叶状岛纹提示慢性胃炎；岛纹隆起为肥厚性，塌陷为萎缩性。' },
        { zone: '胆一区', loc: '食指根部巽位', organ: '胆', sign: '隆起提示胆固醇偏高、血脂血压偏高；塌陷松软、黄白杂现提示胆道功能受损；十字纹、井字纹提示胆囊炎、胆管炎；米字纹提示胆囊结石或息肉。' },
        { zone: '脾一区', loc: '无名指下，以1线为中轴向下画半圆弧所包围的面积', organ: '脾', sign: '未载' },
        { zone: '脾二区', loc: '3线上胰腺区下方，约小指指甲盖大小', organ: '脾、胰腺', sign: '黄暗色斑点、青暗斑，提示脾大。' },
        { zone: '肝区', loc: '2线与3线之间，拇指掌侧一带', organ: '肝', sign: '十字纹或6线较多提示肝疲劳；米字纹提示肝瘀气滞；3线较大岛纹提示肝大；脂肪隆起提示脂肪肝。' },
        { zone: '膀胱一区', loc: '小指根部，与前列腺二区坤位重叠', organ: '膀胱、前列腺', sign: '未载' },
        { zone: '前列腺一区', loc: '腕横纹中部上1厘米，靠近大鱼际边缘', organ: '前列腺', sign: '未载' },
        { zone: '子宫区', loc: '腕横纹中部上1厘米，靠近大鱼际边缘', organ: '子宫', sign: '未载' },
        { zone: '下肢关节区', loc: '腕横纹中部上0.5厘米', organ: '下肢关节', sign: '未载' },
        { zone: '颈椎区', loc: '拇指掌指褶纹处', organ: '颈椎', sign: '提示颈椎增生。' },
        { zone: '艮位', loc: '大鱼际下部', organ: '未载', sign: '青暗色提示感冒；暗紫色提示流感。' },
        { zone: '震位', loc: '大鱼际上部、虎口', organ: '未载', sign: '提示慢性胃炎。' },
        { zone: '离位', loc: '中指、无名指下方，掌心上部', organ: '未载', sign: '提示心肌供血不足。' },
        { zone: '坤位', loc: '小指根部下方，小鱼际上部', organ: '前列腺、生殖', sign: '大量竖纹提示慢性前列腺炎；淡红色为炎症，青黄色为性病。' },
        { zone: '乾位', loc: '小鱼际下部尺侧', organ: '前列腺', sign: '十字纹提示前列腺炎。' },
        { zone: '兑位', loc: '小鱼际上部', organ: '肺、支气管', sign: '十字纹提示支气管炎。' },
        { zone: '坎位', loc: '掌根正中，腕横纹上方', organ: '未载', sign: '5线起于坎位，越长健康状况越差。' }
      ],
      wangZonesNote: '王晨霞掌纹诊病掌部脏腑分区，现代通行说；分区与对应各本不一，只列通行名单；表现意义为该体系主张，未逐条对原书核；不作诊疗依据。'
    };

    function sxToggleMod(id){ var el = $(id); if (el) el.classList.toggle('collapsed'); }
    window.sxToggleMod = sxToggleMod;

    function qtabWrap(inner){ return '<div class="qtab-scroll"><table class="qtab">' + inner + '</table></div>'; }
    function qtabNote(inner, note){ return '<div class="sx-tbl-group">' + qtabWrap(inner) + '<p class="sx-note">' + esc(note) + '</p></div>'; }
    function sign(n){ return n > 0 ? '+' + n : String(n); }
    /* 档位阈值：满分十四分，七分及以上为吉档，负三分及以下为需留意档，余为平档 */
    function bandOf(n){ return n >= 7 ? '吉档' : (n <= -3 ? '需留意档' : '平档'); }

    /* 模块一：手相三大主线（经文出处统一在此注明，不逐条重复） */
    function renderHand(){
      var h = '<div class="info-box"><h4>三才纹总诀</h4><p>' + esc(SHOU.jing) + '</p></div>';
      h += '<p class="sx-note">总诀与三条经文节录' + esc(SHOU.jingSrc) + '，见《古今图书集成》艺术典卷640，止于三纹莹净句；坊本题作《麻衣相法·论掌纹》；走向与变体断语为通行归纳。</p>';
      var t = '<thead><tr><th>主线</th><th>别名</th><th>走向</th><th>经文</th><th>常见变体通行断语</th></tr></thead><tbody>';
      var ls = SHOU.lines;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], vs = [];
        for (var j = 0; j < L.variants.length; j++){ if (L.variants[j].neutral) continue; vs.push(esc(L.variants[j].k) + '：' + esc(L.variants[j].duan)); }
        t += '<tr><td class="lbl">' + esc(L.name) + '</td><td>' + esc(L.alias) + '</td><td>' + esc(L.loc) + '</td><td>' + esc(L.jing) + '</td><td>' + vs.join('；') + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHandBody').innerHTML = h;
    }

    /* 模块二：手相九宫八丘（宫位取通行掌相说、丘名为中西对照称谓，口径统一注明，不逐条重复） */
    function renderGong(){
      var h = '<p class="sx-note">掌心八卦之分见于《玉掌记》（《古今图书集成》艺术典卷640）先看八卦、次察五行；九宫逐位布掌为通行掌相说，古籍未见逐位排列；九宫与西洋掌丘的逐一对应未见古籍，各本不一，本页只作合参对照；断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>宫位</th><th>方位</th><th>所对掌丘或部位</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var gs = SHOU.gong;
      for (var i = 0; i < gs.length; i++){
        var g = gs[i];
        t += '<tr data-key="' + esc(g.key) + '"><td class="lbl">' + esc(g.gong) + '</td><td>' + esc(g.fang) + '</td><td>' + esc(g.qiu) + '</td><td>' + esc(g.zhu.replace(/^主/, '')) + '</td><td>' + esc(g.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<p class="sx-note">图版名目录自《手相学》第十二、十三图原件标注：有通行释义者取通行释义，其余存原件名目、释义未详；火星野为掌中火星平原，与第一、第二火星丘非一名。</p>';
      var t2 = '<thead><tr><th>图版名目</th><th>释义</th></tr></thead><tbody>';
      var pn = SHOU.plateNames;
      for (var j = 0; j < pn.length; j++){
        t2 += '<tr><td class="lbl">' + esc(pn[j].name) + '</td><td>' + esc(pn[j].def) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxGongBody').innerHTML = h;
    }

    function renderHills(){
      var h = '<p class="sx-note">八丘名目为通行坊本中西对照称谓，古籍无载；位置与所主依掌纹分区通行说，丰隆断语系本站归纳，宁缺勿造。</p>';
      var t = '<thead><tr><th>丘名</th><th>位置</th><th>所主</th><th>丰隆断语</th></tr></thead><tbody>';
      var hs = SHOU.hills;
      for (var i = 0; i < hs.length; i++){
        var q = hs[i];
        t += '<tr data-key="' + esc(q.key) + '"><td class="lbl">' + esc(q.name) + '</td><td>' + esc(q.loc) + '</td><td>' + esc(q.zhu.replace(/^主/, '')) + '</td><td>' + esc(q.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxHillBody').innerHTML = h;
    }

    /* 模块三：辅助线纹与标记（通行之说，统一注明一次） */
    function renderAux(){
      var h = '<p class="sx-note">辅助线纹与特殊标记为通行坊本中西合参称谓，古籍无载；名目、走向与断语均为通行归纳，不作典籍条文；健康线起止与凯罗原书方向相反，本页从坊本图。</p>';
      var t = '<thead><tr><th>线名</th><th>走向</th><th>主事</th><th>通行断语</th></tr></thead><tbody>';
      var as = SHOU.aux;
      for (var i = 0; i < as.length; i++){
        var a = as[i];
        t += '<tr><td class="lbl">' + esc(a.name) + '</td><td>' + esc(a.loc) + '</td><td>' + esc(a.zhu) + '</td><td>' + esc(a.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>标记</th><th>形状</th><th>常见位置</th><th>通行断语</th></tr></thead><tbody>';
      var ms = SHOU.marks;
      for (var j = 0; j < ms.length; j++){
        var m = ms[j];
        t2 += '<tr><td class="lbl">' + esc(m.name) + '</td><td>' + esc(m.shape) + '</td><td>' + esc(m.loc) + '</td><td>' + esc(m.duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxAuxBody').innerHTML = h;
    }

    /* 模块四：手部全息反射区（现代手诊、反射学与全息诊疗法三系并列，每表与其注同组，注在表下） */
    function renderReflex(){
      var h = '';
      var t = '<thead><tr><th>手部位置</th><th>中医手诊所候</th><th>反射学所应</th></tr></thead><tbody>';
      for (var i = 0; i < SX_REFLEX.zones.length; i++){
        var z = SX_REFLEX.zones[i];
        t += '<tr><td class="lbl">' + esc(z.pos) + '</td><td>' + esc(z.tcm) + '</td><td>' + esc(z.reflex) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabNote(t, SX_REFLEX.zonesNote);
      var t2 = '<thead><tr><th>穴名</th><th>定位（自指端向腕端）</th><th>所应部位</th></tr></thead><tbody>';
      for (var j = 0; j < SX_REFLEX.points.length; j++){
        var p = SX_REFLEX.points[j];
        t2 += '<tr><td class="lbl">' + esc(p.name) + '</td><td>' + esc(p.loc) + '</td><td>' + esc(p.body) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabNote(t2, SX_REFLEX.pointsNote);
      var t3 = '<thead><tr><th>所察</th><th>表现</th><th>通行意义</th><th>说明</th></tr></thead><tbody>';
      for (var k = 0; k < SX_REFLEX.states.length; k++){
        var s = SX_REFLEX.states[k];
        t3 += '<tr><td class="lbl">' + esc(s.k) + '</td><td>' + esc(s.biao) + '</td><td>' + esc(s.mean) + '</td><td>' + esc(s.note) + '</td></tr>';
      }
      t3 += '</tbody>';
      h += qtabNote(t3, SX_REFLEX.statesNote);
      var t4 = '<thead><tr><th>序号</th><th>线名</th><th>位置与走向</th><th>所主</th></tr></thead><tbody>';
      for (var w = 0; w < SX_REFLEX.wangLines.length; w++){
        var L = SX_REFLEX.wangLines[w];
        t4 += '<tr><td class="lbl">' + esc(L.no) + '</td><td>' + esc(L.name) + '</td><td>' + esc(L.loc) + '</td><td>' + esc(L.zhu) + '</td></tr>';
      }
      t4 += '</tbody>';
      h += qtabNote(t4, SX_REFLEX.wangLinesNote);
      var t5 = '<thead><tr><th>纹名</th><th>形态</th><th>常见位置</th><th>所主</th></tr></thead><tbody>';
      for (var q = 0; q < SX_REFLEX.wangMarks.length; q++){
        var M = SX_REFLEX.wangMarks[q];
        t5 += '<tr><td class="lbl">' + esc(M.name) + '</td><td>' + esc(M.shape) + '</td><td>' + esc(M.loc) + '</td><td>' + esc(M.zhu) + '</td></tr>';
      }
      t5 += '</tbody>';
      h += qtabNote(t5, SX_REFLEX.wangMarksNote);
      var t6 = '<thead><tr><th>分区</th><th>位置</th><th>对应脏腑</th><th>表现意义</th></tr></thead><tbody>';
      for (var n = 0; n < SX_REFLEX.wangZones.length; n++){
        var Z = SX_REFLEX.wangZones[n];
        t6 += '<tr><td class="lbl">' + esc(Z.zone) + '</td><td>' + esc(Z.loc) + '</td><td>' + esc(Z.organ) + '</td><td>' + esc(Z.sign) + '</td></tr>';
      }
      t6 += '</tbody>';
      h += qtabNote(t6, SX_REFLEX.wangZonesNote);
      $('sxReflexBody').innerHTML = h;
    }

    /* 模块一：掌形与掌色（掌形七类为通行坊本中西合参称谓，古籍无载；掌色配属出医相通说，统一注明一次） */
    function renderZhi(){
      var h = '<p class="sx-note">掌形七类为通行坊本中西合参称谓，古籍无载；形态与断语均为通行归纳，不作典籍条文。</p>';
      var t = '<thead><tr><th>掌形</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var ps = SHOU.palms;
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        t += '<tr><td class="lbl">' + esc(p.name) + '</td><td>' + esc(p.feat) + '</td><td>' + esc(p.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      $('sxZhiBody').innerHTML = h;
    }

    function renderZhangse(){
      var h = '<p class="sx-note">掌色五色配属出传统医相通说，吉凶等级为通行归纳；五色生死句源出《素问·五藏生成篇》，页面按通行相书简作吉凶，青如枯草、赤如丹砂、赤如赭土为通行改写，原文分别作草兹、鸡冠、瘀血；掌质四目为通行之说。掌色随四时与起居而变，只宜当时参照，不作久远之断。</p>';
      var t = '<thead><tr><th>掌色</th><th>五行</th><th>五脏</th><th>本位</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var zs = SHOU.zhangse;
      for (var i = 0; i < zs.length; i++){
        var z = zs[i];
        t += '<tr><td class="lbl">' + esc(z.name) + '</td><td>' + esc(z.wx) + '</td><td>' + esc(z.zang) + '</td><td>' + esc(z.season) + '</td><td>' + esc(z.zhu) + '</td><td>' + esc(z.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>掌质</th><th>通行断语</th></tr></thead><tbody>';
      var qs = SHOU.zhangzhi;
      for (var j = 0; j < qs.length; j++){
        t2 += '<tr><td class="lbl">' + esc(qs[j].name) + '</td><td>' + esc(qs[j].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxSeBody').innerHTML = h;
    }

    /* 模块三：五指与指甲（五指五行所主为传统配属，指端、指纹与指甲断语为通行之说，统一注明一次） */
    function renderWuZhi(){
      var h = '<p class="sx-note">五指五行所主为传统配属；指端四形（尖、方、圆、铲）为通行归纳；指纹三型取皮纹学通行说，指节纹为通行掌相说，古籍无载，只作形态参考，不作命运定论；指甲形色与反甲、纵纹、横纹取医家手诊通行说，只论形色之常变，不作病名之断。</p>';
      var t = '<thead><tr><th>手指</th><th>五行</th><th>所主</th><th>通行断语</th></tr></thead><tbody>';
      var fs = SHOU.fingers;
      for (var j = 0; j < fs.length; j++){
        var f = fs[j];
        t += '<tr><td class="lbl">' + esc(f.name) + '</td><td>' + esc(f.wx) + '</td><td>' + esc(f.zhu) + '</td><td>' + esc(f.duan) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>指端</th><th>通行断语</th></tr></thead><tbody>';
      var ts = SHOU.tips;
      for (var k = 0; k < ts.length; k++){
        t2 += '<tr><td class="lbl">' + esc(ts[k].name) + '</td><td>' + esc(ts[k].duan) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      var t3 = '<thead><tr><th>指纹</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var fps = SHOU.fingerprints;
      for (var m = 0; m < fps.length; m++){
        t3 += '<tr><td class="lbl">' + esc(fps[m].name) + '</td><td>' + esc(fps[m].feat) + '</td><td>' + esc(fps[m].duan) + '</td></tr>';
      }
      t3 += '</tbody>';
      h += qtabWrap(t3);
      var t3b = '<thead><tr><th>指节纹</th><th>特征</th><th>通行断语</th></tr></thead><tbody>';
      var kns = SHOU.knuckles;
      for (var kn = 0; kn < kns.length; kn++){
        t3b += '<tr><td class="lbl">' + esc(kns[kn].name) + '</td><td>' + esc(kns[kn].feat) + '</td><td>' + esc(kns[kn].duan) + '</td></tr>';
      }
      t3b += '</tbody>';
      h += qtabWrap(t3b);
      var t4 = '<thead><tr><th>指甲</th><th>通行断语</th></tr></thead><tbody>';
      var ns = SHOU.nails;
      for (var n = 0; n < ns.length; n++){
        t4 += '<tr><td class="lbl">' + esc(ns[n].name) + '</td><td>' + esc(ns[n].duan) + '</td></tr>';
      }
      t4 += '</tbody>';
      h += qtabWrap(t4);
      $('sxWuZhiBody').innerHTML = h;
    }

    /* 模块七：手相理论流派（四派名目并列，各注源流与判法，不作优劣之断） */
    function renderLiupai(){
      var h = '<p class="sx-note">手相之学源出中国、印度、西洋三支，另有医学健康一支；四派并列存其名目，各注源出与判法。</p>';
      var t = '<thead><tr><th>流派</th><th>源流</th><th>代表典籍、人物或学科</th><th>核心要素与判法</th></tr></thead><tbody>';
      var ls = SHOU.liupai;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i];
        t += '<tr><td class="lbl">' + esc(L.school) + '</td><td>' + esc(L.origin) + '</td><td>' + esc(L.book) + '</td><td>' + esc(L.method) + '</td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      var t2 = '<thead><tr><th>题</th><th>述</th></tr></thead><tbody>';
      var ds = SHOU.dingwei;
      for (var j = 0; j < ds.length; j++){
        t2 += '<tr><td class="lbl">' + esc(ds[j].topic) + '</td><td>' + esc(ds[j].text) + '</td></tr>';
      }
      t2 += '</tbody>';
      h += qtabWrap(t2);
      $('sxLpBody').innerHTML = h;
    }

    /* 模块五：手相自查（三线形态与八丘丰隆计分） */
    function renderShouForm(){
      var h = '<div class="form-row"><label class="field"><span>所察之手</span><select id="sxHand" aria-label="所察之手"><option value="left">左手（先天之基）</option><option value="right">右手（后天之运）</option><option value="both">双手合参</option></select></label></div>';
      h += '<div class="form-row"><label class="field"><span>掌形对照</span><select id="sxPalm" aria-label="掌形对照"><option value="">未选择</option>';
      var ps = SHOU.palms;
      for (var p = 0; p < ps.length; p++) h += '<option value="' + p + '">' + esc(ps[p].name) + '</option>';
      h += '</select></label><label class="field"><span>掌色对照</span><select id="sxSeColor" aria-label="掌色对照"><option value="">未选择</option>';
      var zs = SHOU.zhangse;
      for (var z = 0; z < zs.length; z++) h += '<option value="' + z + '">' + esc(zs[z].name) + '</option>';
      h += '</select></label></div>';
      var t = '<thead><tr><th>主线</th><th>形态</th></tr></thead><tbody>';
      var ls = SHOU.lines;
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], o = '';
        for (var j = 0; j < L.variants.length; j++){
          var v = L.variants[j];
          o += '<option value="' + j + '"' + (j === 0 ? ' selected' : '') + '>' + esc(v.k) + '（' + sign(v.w) + '）</option>';
        }
        t += '<tr><td class="lbl">' + esc(L.name) + '</td><td class="vmd"><div class="field"><select id="sxLine-' + L.key + '" aria-label="' + esc(L.name) + '形态">' + o + '</select></div></td></tr>';
      }
      t += '</tbody>';
      h += qtabWrap(t);
      h += '<div class="form-row" id="sxHillChk">';
      var hs = SHOU.hills;
      for (var k = 0; k < hs.length; k++){
        h += '<label class="field chk"><input type="checkbox" id="sxHill-' + hs[k].key + '"><span>' + esc(hs[k].name) + '</span></label>';
      }
      h += '</div>';
      h += '<p class="sx-note">计分口径：三线按形态 +2、+1、0、-1、-2，八丘丰隆每丘 +1、未勾不计；合计七分及以上为吉档，负三分及以下为需留意档，余为平档，本站归纳。掌形、掌色只作对照，不计分。</p>';
      $('sxShouForm').innerHTML = h;
    }
    function sxShouGo(){
      var out = $('sxShouOut'), ls = SHOU.lines, hs = SHOU.hills, total = 0, lines = '';
      var handEl = $('sxHand');
      var hand = handEl ? handEl.value : 'left';
      var handText = hand === 'right' ? '右手（后天之运）' : (hand === 'both' ? '双手合参' : '左手（先天之基）');
      lines += '<p>所察：' + esc(handText) + '</p>';
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], v = L.variants[+($('sxLine-' + L.key) || {}).value || 0];
        total += v.w;
        lines += '<p>' + esc(L.name) + ' ' + sign(v.w) + '：' + esc(v.duan) + '（' + esc(v.k) + '）</p>';
      }
      for (var k = 0; k < hs.length; k++){
        var q = hs[k], ck = $('sxHill-' + q.key);
        if (ck && ck.checked){
          total += 1;
          lines += '<p>' + esc(q.name) + ' +1：' + esc(q.duan) + '</p>';
        }
      }
      var palmEl = $('sxPalm'), seEl = $('sxSeColor');
      var palm = palmEl && palmEl.value !== '' ? SHOU.palms[+palmEl.value] : null;
      var se = seEl && seEl.value !== '' ? SHOU.zhangse[+seEl.value] : null;
      if (palm) lines += '<p>掌形：' + esc(palm.name) + '，' + esc(palm.duan) + '（非计分）</p>';
      if (se) lines += '<p>掌色：' + esc(se.name) + '，' + esc(se.duan) + '（非计分）</p>';
      var h = '<div class="info-box"><h4>逐项短断（本站归纳）</h4>' + lines + '</div>';
      h += '<p class="sx-note">三线八丘合计 ' + total + ' 分，归' + bandOf(total) + '。未勾选之丘不计分。</p>';
      out.innerHTML = h;
      sxSave();
    }
    window.sxShouGo = sxShouGo;

    /* 自查多记录：接站内共享历史弹层 xjHist，存表单原值与总分档位，重开按原值重算 */
    var SX_SAVED_CFG = {
      mask: 'sxSavedMask', list: 'sxSavedList', key: 'sxShouLog', title: '历史记录（最多9条）',
      restoreFn: 'sxRestoreSaved', delFn: 'sxDelSaved',
      row: function (h) { return { t: h.t || '', main: h.g || '', sub: h.s || '' }; }
    };
    function sxSnap() {
      var s = { hand: $('sxHand') ? $('sxHand').value : 'left', palm: $('sxPalm') ? $('sxPalm').value : '', se: $('sxSeColor') ? $('sxSeColor').value : '', lines: {}, hills: [] };
      SHOU.lines.forEach(function (L) { s.lines[L.key] = $('sxLine-' + L.key) ? $('sxLine-' + L.key).value : '0'; });
      SHOU.hills.forEach(function (q) { if ($('sxHill-' + q.key) && $('sxHill-' + q.key).checked) s.hills.push(q.key); });
      return s;
    }
    function sxTotalOf(s) {
      var t = 0;
      SHOU.lines.forEach(function (L) { var v = L.variants[+(s.lines[L.key] || 0)]; if (v) t += v.w; });
      return t + s.hills.length;
    }
    function sxHandText(s) {
      return s.hand === 'right' ? '右手（后天之运）' : (s.hand === 'both' ? '双手合参' : '左手（先天之基）');
    }
    function showSxSaved() { if (window.xjHist) xjHist.open(SX_SAVED_CFG); }
    function sxSave() {
      if (!window.xjHist) return;
      var s = sxSnap(), total = sxTotalOf(s);
      var e = { t: xjHist.time(), g: sxHandText(s), s: '合计 ' + total + ' 分，' + bandOf(total), d: s };
      xjHist.push(SX_SAVED_CFG.key, e, function (h, o) { return JSON.stringify(h.d) === JSON.stringify(o.d); });
      if (document.getElementById('sxSavedList')) xjHist.render(SX_SAVED_CFG);
    }
    function sxDelSaved(i) { if (window.xjHist) xjHist.del(SX_SAVED_CFG, i); }
    function sxRestoreSaved(i) {
      if (!window.xjHist) return;
      var e = xjHist.get(SX_SAVED_CFG.key, i); if (!e || !e.d) return;
      var s = e.d;
      if ($('sxHand')) $('sxHand').value = s.hand || 'left';
      if ($('sxPalm')) $('sxPalm').value = s.palm || '';
      if ($('sxSeColor')) $('sxSeColor').value = s.se || '';
      SHOU.lines.forEach(function (L) { var el = $('sxLine-' + L.key); if (el) el.value = s.lines[L.key] || '0'; });
      SHOU.hills.forEach(function (q) { var el = $('sxHill-' + q.key); if (el) el.checked = s.hills.indexOf(q.key) >= 0; });
      sxShouGo();
      xjHist.close();
      var out = $('sxShouOut'); if (out && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    window.sxRestoreSaved = sxRestoreSaved;
    window.sxDelSaved = sxDelSaved;
    if ($('sxHistoryBtn')) $('sxHistoryBtn').addEventListener('click', showSxSaved);

    /* 渲染次序：整体（掌形掌色）、局部（九宫八丘、五指指甲）、细节（三大主线、辅助线纹、全息反射区），末为自查与流派 */
    renderZhi();
    renderZhangse();
    renderGong();
    renderHills();
    renderWuZhi();
    renderHand();
    renderAux();
    renderReflex();
    renderShouForm();
    renderLiupai();

    /* 图与表联动：点九宫、八丘图中的宫丘名，定位并高亮对应表行 */
    var SX_GONG_KEYS = { '巽': 'xun', '离': 'li', '坤': 'kun', '震': 'zhen', '明堂': 'zhong', '兑': 'dui', '艮': 'gen', '坎': 'kan', '乾': 'qian' };
    var SX_HILL_KEYS = { '木星丘': 'muxing', '土星丘': 'tuxing', '太阳丘': 'taiyang', '水星丘': 'shuixing', '火星丘': 'huoxing', '金星丘': 'jinxing', '月丘': 'yuexing', '地丘': 'diqiu' };
    function sxHitRow(host, key){
      var row = host ? host.querySelector('tr[data-key="' + key + '"]') : null;
      if (!row) return;
      var old = document.querySelectorAll('.sx-hit');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('sx-hit');
      row.classList.add('sx-hit');
      try { row.scrollIntoView({ block: 'center' }); } catch (e) {}
      setTimeout(function(){ row.classList.remove('sx-hit'); }, 2400);
    }
    function sxBindFig(){
      var figs = document.querySelectorAll('.sx-jg');
      for (var i = 0; i < figs.length; i++){
        var texts = figs[i].querySelectorAll('text');
        for (var j = 0; j < texts.length; j++){
          (function(t){
            var name = (t.textContent || '').replace(/\s+/g, '');
            var isGong = Object.prototype.hasOwnProperty.call(SX_GONG_KEYS, name);
            var key = isGong ? SX_GONG_KEYS[name] : SX_HILL_KEYS[name];
            if (!key) return;
            var host = isGong ? $('sxGongBody') : $('sxHillBody');
            t.setAttribute('tabindex', '0');
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', '查看' + name + '释义');
            var go = function(){ sxHitRow(host, key); };
            t.addEventListener('click', go);
            t.addEventListener('keydown', function(e){
              if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); }
            });
          })(texts[j]);
        }
      }
    }
    var SX_GONG_NAMES = {}, SX_HILL_NAMES = {};
    Object.keys(SX_GONG_KEYS).forEach(function(n){ SX_GONG_NAMES[SX_GONG_KEYS[n]] = n; });
    Object.keys(SX_HILL_KEYS).forEach(function(n){ SX_HILL_NAMES[SX_HILL_KEYS[n]] = n; });
    function sxHitFig(key, isGong){
      var name = isGong ? SX_GONG_NAMES[key] : SX_HILL_NAMES[key];
      if (!name) return;
      var texts = document.querySelectorAll('.sx-jg text'), hit = [], fig = null;
      for (var i = 0; i < texts.length; i++){
        if ((texts[i].textContent || '').replace(/\s+/g, '') === name){
          hit.push(texts[i]);
          if (!fig && texts[i].closest) fig = texts[i].closest('figure');
        }
      }
      if (!hit.length) return;
      var old = document.querySelectorAll('.sx-fig-hit');
      for (var j = 0; j < old.length; j++) old[j].classList.remove('sx-fig-hit');
      for (var k = 0; k < hit.length; k++) hit[k].classList.add('sx-fig-hit');
      if (fig){ try { fig.scrollIntoView({ block: 'center' }); } catch (e) {} }
      setTimeout(function(){ for (var m = 0; m < hit.length; m++) hit[m].classList.remove('sx-fig-hit'); }, 2400);
    }
    function sxBindRows(){
      [['sxGongBody', true], ['sxHillBody', false]].forEach(function(g){
        var host = $(g[0]);
        if (!host) return;
        host.addEventListener('click', function(e){
          var tr = e.target && e.target.closest ? e.target.closest('tr[data-key]') : null;
          if (tr) sxHitFig(tr.getAttribute('data-key'), g[1]);
        });
      });
    }
    sxBindFig();
    sxBindRows();

    /* AI 上下文：当前自查设定与计分口径 */
    function sxAiContext(){
      var ls = SHOU.lines, hs = SHOU.hills, total = 0, lineParts = [], hillParts = [];
      var handEl = $('sxHand');
      var hand = handEl ? handEl.value : 'left';
      var handText = hand === 'right' ? '右手（后天之运）' : (hand === 'both' ? '双手合参' : '左手（先天之基）');
      for (var i = 0; i < ls.length; i++){
        var L = ls[i], v = L.variants[+($('sxLine-' + L.key) || {}).value || 0];
        total += v.w;
        lineParts.push(L.name + '：' + v.k + '（' + sign(v.w) + '）');
      }
      for (var k = 0; k < hs.length; k++){
        var q = hs[k], ck = $('sxHill-' + q.key);
        if (ck && ck.checked){ total += 1; hillParts.push(q.name); }
      }
      var palmEl = $('sxPalm'), seEl = $('sxSeColor');
      var palm = palmEl && palmEl.value !== '' ? SHOU.palms[+palmEl.value] : null;
      var se = seEl && seEl.value !== '' ? SHOU.zhangse[+seEl.value] : null;
      var s = '【手相页】所察：' + handText + '。\n';
      s += '三线：' + lineParts.join('；') + '。\n';
      s += hillParts.length ? '八丘已勾：' + hillParts.join('、') + '。\n' : '八丘均未勾选。\n';
      if (palm) s += '掌形参照（非计分）：' + palm.name + '，' + palm.duan + '。\n';
      if (se) s += '掌色参照（非计分）：' + se.name + '，' + se.duan + '。\n';
      s += '合计 ' + total + ' 分，归' + bandOf(total) + '。\n';
      s += '计分口径：三线按形态 +2、+1、0、-1、-2，八丘丰隆每丘 +1，本站归纳。\n';
      s += '手相是传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。';
      return s;
    }

    /* 页面装配：共享壳件与免责声明 */
    renderChrome('shouxiang.html');
    if (window.mountAI) window.mountAI(sxAiContext, '手相', { share:{ page:'shouxiang', title:'手相在线自查', result:'#sxShouOut', collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ sxShouGo(); }); } } });
    /* 分享与数据：表单快照即盘面，链接与 JSON 还原后重出自查。 */
    })();
  }, 0);
});
