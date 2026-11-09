


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    (function(){
    'use strict';

    /* ===== 0. 小工具 ===== */
    function $(id){ return document.getElementById(id); }
    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    var YEAR_MIN = 1900, YEAR_MAX = 2100;

    /* ===== 1. 七模块渲染（数据一律取 YQ.compute 真源） ===== */
    function renderYun(p, dateStr, bound){
      var boundTxt = bound === 'lichun' ? '立春换年' : '春节换年';
      var ov = '<div class="yq-ov">' + esc(dateStr) + '（' + boundTxt + '，属' + esc(p.gz) + '年）：岁运' + esc(p.yun.wx) + esc(p.yun.shuai) + '（' + esc(p.yun.wuyin) + '），司天' + esc(p.sitian.name) + '、在泉' + esc(p.zaiquan.name) + (p.tonghua.any ? '，运气同化见下方模块' : '，无天符岁会同化') + '</div>';
      var html = '<div class="yq-head">' + esc(dateStr) + '（属' + esc(p.gz) + '年）　岁运' + esc(p.yun.wx) + '（' + esc(p.yun.shuai) + '）</div>';
      html += '<div class="yq-tbl-wrap"><table class="yq-tbl"><tbody>';
      html += '<tr><td class="yq-c0">年干支</td><td>' + esc(p.gz) + '（' + esc(p.yun.yang ? '阳干阳支' : '阴干阴支') + '）</td></tr>';
      html += '<tr><td class="yq-c0">年界</td><td>' + boundTxt + (bound === 'lichun' ? '（立春为岁首）' : '（农历正月初一为界）') + '</td></tr>';
      html += '<tr><td class="yq-c0">化运</td><td>' + esc(p.yun.he) + '</td></tr>';
      html += '<tr><td class="yq-c0">岁运五行</td><td>' + esc(p.yun.wx) + '</td></tr>';
      html += '<tr><td class="yq-c0">五脏归属</td><td>' + esc(WX_ZANG[p.yun.wx] || '') + '脏</td></tr>';
      html += '<tr><td class="yq-c0">五音建运</td><td>' + esc(p.yun.wuyin) + '</td></tr>';
      html += '<tr><td class="yq-c0">盛衰</td><td>' + esc(p.yun.shuai) + '</td></tr>';
      html += '<tr><td class="yq-c0">交运</td><td>' + esc(p.yun.jiaoyun) + '</td></tr>';
      html += '<tr><td class="yq-c0">平气</td><td>' + (p.pingqi.hit ? '是（' + esc(p.pingqi.desc) + '）' : '否') + '</td></tr>';
      html += '<tr><td class="yq-c0">生肖</td><td>' + esc(p.sheng) + '</td></tr>';
      html += '<tr><td class="yq-c0">纳音</td><td>' + esc(p.nayin) + '</td></tr>';
      html += '</tbody></table></div>';
      var yx = WX_BAIHUA[p.yun.wx];
      var yunBai = yx ? (p.yun.shuai === '太过' ? yx.tai : yx.bu) : '';
      html += '<p class="sub-note">此年的年运是“' + esc(p.yun.wx) + esc(p.yun.shuai) + '”，' + esc(yunBai) + '。</p>';
      /* 四口径对照：天干正五行、地支正五行、化运（岁运）、纳音五行。
         四者分属三套体系，各有其司，本表并列照录、不合并折算，异同之辨见下表说明。 */
      var ganWx = GAN_WX[p.gan], zhiWx = ZHI_WX[p.zhi], nyWx = YQ.qiWx(p.nayin);
      html += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>口径</th><th>取值</th><th>所属体系</th></tr></thead><tbody>';
      html += '<tr><td class="yq-c0">天干正五行</td><td>' + esc(p.gan) + '属' + esc(ganWx) + '</td><td>干支本气</td></tr>';
      html += '<tr><td class="yq-c0">地支正五行</td><td>' + esc(p.zhi) + '属' + esc(zhiWx) + '</td><td>干支本气</td></tr>';
      html += '<tr><td class="yq-c0">化运（岁运）</td><td>' + esc(p.yun.he) + '，' + esc(p.yun.wx) + '运' + esc(p.yun.shuai) + '</td><td>五运化合</td></tr>';
      html += '<tr><td class="yq-c0">纳音五行</td><td>' + esc(p.nayin) + '，属' + esc(nyWx) + '</td><td>六十甲子纳音</td></tr>';
      html += '</tbody></table></div>';
      html += '<p class="sub-note">' + yunVoicesNote(p, ganWx, zhiWx, nyWx) + '</p>';
      /* 岁运三纪：五运各有平气、不及、太过三名与纲语，照录《素问·五常政大论》。
         平气之年取平气之纪，太过不及之年各取本纪，三纪名与纲语随年而变。 */
      var jiKey = p.pingqi.hit ? 'ping' : (p.yun.shuai === '太过' ? 'tai' : 'bu');
      html += '<div class="yq-head">岁运三纪　' + esc(YUN_JI[p.yun.wx][jiKey]) + '</div>';
      html += '<p class="sub-note">' + esc(YUN_JI_TXT[p.yun.wx][jiKey]) + '</p>';
      /* 气交之变：岁运太过不及之气候物候与脏气之应，照录《素问·气交变大论》；
         得平气之年不取太过不及之文，另注平气之义。 */
      if (jiKey === 'ping'){
        html += '<p class="sub-note">' + esc(p.pingqi.desc) + '，故本年为平气，不取太过不及之气交变文；平气之纪政令中和，物候以常为度（《素问·五常政大论》）。</p>';
      } else {
        html += '<p class="sub-note">' + esc(YUN_QJ[p.yun.wx][jiKey]) + '（《素问·气交变大论》照录，为古人对气候物候与人体相应之观察记录，属运气学说原文，不作诊断依据）</p>';
      }
      $('yqYunOut').innerHTML = ov + html;
    }

    /* 四口径异同：以岁运（化合之气）为纲，干支本气与纳音之象并列备参，三说并存不裁断 */
    function yunVoicesNote(p, ganWx, zhiWx, nyWx){
      var yun = p.yun.wx;
      var s = '四口径分属三套体系：干支正五行论年之本性，五运化合论岁运所统之气，纳音论干支之象，三者互不替代、不作合并折算。';
      if (ganWx === zhiWx) s += '本年天干' + p.gan + '、地支' + p.zhi + '皆属' + ganWx + '，干支同气；';
      else s += '本年天干' + p.gan + '属' + ganWx + '、地支' + p.zhi + '属' + zhiWx + '，干支异气；';
      if (yun === ganWx && yun === zhiWx) s += '岁运取化合之气为' + yun + '运' + p.yun.shuai + '，与干支本气同向；';
      else s += '岁运取化合之气为' + yun + '运' + p.yun.shuai + '，与干支本气不同向，此即干支论体、五运论用之别：论年之本性取干支，论岁运所统之气取化合；';
      if (nyWx === yun) s += '纳音' + p.nayin + '属' + nyWx + '，与岁运同气，二说于气化上互相印证。';
      else s += '纳音' + p.nayin + '属' + nyWx + '，与岁运异气；纳音自成一系，与五运六气不同源，并陈备参、不作合并。';
      return s;
    }

    function renderSitian(p){
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>位</th><th>六气</th><th>五行</th><th>主岁</th></tr></thead><tbody>';
      html += '<tr><td class="yq-c0">司天</td><td>' + esc(p.sitian.name) + '</td><td>' + esc(p.sitian.wx) + '</td><td>主上半年</td></tr>';
      html += '<tr><td class="yq-c0">在泉</td><td>' + esc(p.zaiquan.name) + '</td><td>' + esc(p.zaiquan.wx) + '</td><td>主下半年</td></tr>';
      html += '</tbody></table></div>';
      html += '<p class="sub-note">上半年由“' + esc(p.sitian.name) + '”主事，气候传统认为偏' + esc(WX_SE[p.sitian.wx] || p.sitian.wx) + '；下半年由“' + esc(p.zaiquan.name) + '”主事，偏' + esc(WX_SE[p.zaiquan.wx] || p.zaiquan.wx) + '。</p>';
      html += '<div class="yq-head">' + esc(p.sitian.name) + '司天之政</div>';
      html += '<p class="sub-note">' + esc(SITIAN_ZHENG[p.sitian.name]) + '（《素问·六元正纪大论》照录）</p>';
      $('yqSitianOut').innerHTML = html;
    }

    function renderZhu(p){
      var qiB = YQ.stepBounds(p.year, YQ.ZHU_QI_JIE);
      var curI = YQ.stepAt(YQ_LAST_DATE || '', qiB);
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>六步</th><th>六气</th><th>五行</th><th>起止节气与公历日</th></tr></thead><tbody>';
      for (var i=0;i<p.zhu.length;i++){
        var z = p.zhu[i];
        var b0 = qiB[i], b1 = qiB[i+1];
        var span = esc(z.start) + '（' + (b0 ? esc(b0.ymd) : '—') + '）起，' + esc(z.end) + '（' + (b1 ? esc(b1.ymd) : '—') + '）止';
        html += '<tr' + (i === curI ? ' class="yq-cur"' : '') + '><td class="yq-c0">' + esc(z.bu) + '</td><td>' + esc(z.qi) + '</td><td>' + esc(YQ.qiWx(z.qi)) + '</td><td>' + span + '</td></tr>';
      }
      html += '</tbody></table></div>';
      $('yqZhuOut').innerHTML = html;
    }

    /* 时令落步：输入日期所在的主气、客气、主运、客运四步与客主加临 */
    function renderStep(p){
      var d = YQ_LAST_DATE || '';
      var si = d ? YQ.stepInfo(d, p.year) : null;
      if (!si || !si.qi || !si.yun){
        $('yqStepOut').innerHTML = '<p class="sub-note">该日期未落在本运气年的步界内。</p>';
        return;
      }
      var jq = YQ.jieQiNameOf(d);
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>项目</th><th>当前所在</th><th>起止</th></tr></thead><tbody>';
      html += '<tr><td class="yq-c0">当日节气</td><td>' + esc(jq || '—') + '</td><td>' + esc(d) + '</td></tr>';
      html += '<tr><td class="yq-c0">主气</td><td>' + esc(si.qi.bu) + '　' + esc(si.qi.zhu) + '</td><td>' + esc(si.qi.start.ymd) + ' 起，' + esc(si.qi.end.ymd) + ' 止</td></tr>';
      html += '<tr><td class="yq-c0">客气</td><td>' + esc(si.qi.bu) + '　' + esc(si.qi.ke) + (si.qi.i === 2 ? '（司天）' : (si.qi.i === 5 ? '（在泉）' : '（间气）')) + '</td><td>' + esc(si.qi.start.ymd) + ' 起，' + esc(si.qi.end.ymd) + ' 止</td></tr>';
      html += '<tr><td class="yq-c0">主运</td><td>' + esc(si.yun.bu) + '　' + esc(si.yun.zhu.yin) + '（' + esc(si.yun.zhu.wx) + '）</td><td>' + esc(yqYunBoundTxt(si.yun.i)) + '（' + esc(si.yun.start.ymd) + '）起</td></tr>';
      html += '<tr><td class="yq-c0">客运</td><td>' + esc(si.yun.bu) + '　' + esc(si.yun.ke.yin) + '（' + esc(si.yun.ke.wx) + '）</td><td>' + esc(yqYunBoundTxt(si.yun.i)) + '（' + esc(si.yun.start.ymd) + '）起</td></tr>';
      if (si.jialin){
        var ok = si.jialin.pan === '相得';
        var jlTxt = (ok ? '相得' : ('不相得：' + si.jialin.du)) + (si.jialin.note ? '（' + si.jialin.note + '）' : '');
        html += '<tr class="' + (ok ? 'yq-good' : 'yq-bad') + '"><td class="yq-c0">客主加临</td><td>' + esc(si.jialin.rel) + '，' + esc(jlTxt) + '</td><td>' + esc(si.qi.bu) + ' 内</td></tr>';
      }
      html += '</tbody></table></div>';
      html += '<p class="sub-note">落步按节气真源：主气、客气六步以大寒、春分、小满、大暑、秋分、小雪为界；主运、客运五步以大寒、春分、芒种、处暑、立冬为界。</p>';
      $('yqStepOut').innerHTML = html;
    }

    /* 主运五步交司名（《类经图翼·各年五运交司时日》） */
    function yqYunBoundTxt(i){ return ['大寒', '春分后十三日', '芒种后十日', '处暑后七日', '立冬后四日'][i] || ''; }

    /* 主运客运五步：主运初运太少由中运上推，客运以岁运五音为初运，皆太少相生 */
    function renderZhuYun(p){
      var zy = YQ.zhuYunOf(p.gz), ky = YQ.keYunOf(p.yun.wuyin);
      var yunB = YQ.stepBounds(p.year, YQ.ZHU_YUN_JIE, YQ.ZHU_YUN_OFFSET);
      var curI = YQ.stepAt(YQ_LAST_DATE || '', yunB);
      $('yqWuyunWheelHost').innerHTML = '<div class="wheel-block"><h4>主运客运圆盘</h4>' + yqWuyunWheel(p)
        + '<div class="wheel-detail" id="yqWuyunDetail">' + yqWuyunDetailHTML(p, YQ_WY_SEL) + '</div></div>';
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>五步</th><th>主运</th><th>客运</th><th>起止节气与公历日</th></tr></thead><tbody>';
      for (var i = 0; i < 5; i++){
        var b0 = yunB[i], b1 = yunB[i+1];
        var span = esc(yqYunBoundTxt(i)) + '（' + (b0 ? esc(b0.ymd) : '—') + '）起，' + (i === 4 ? '大寒' : esc(yqYunBoundTxt(i+1))) + '（' + (b1 ? esc(b1.ymd) : '—') + '）止';
        html += '<tr' + (i === curI ? ' class="yq-cur"' : '') + '><td class="yq-c0">' + esc(zy[i].bu) + '</td><td>' + esc(zy[i].yin) + '（' + esc(zy[i].wx) + '）</td><td>' + esc(ky[i].yin) + '（' + esc(ky[i].wx) + '）</td><td>' + span + '</td></tr>';
      }
      html += '</tbody></table></div>';
      html += '<p class="sub-note">主运五步次序固定角、徵、宫、商、羽，初运太少由中运上推：甲乙丙壬癸太角起、丁戊己庚辛少角起，太少相生；客运以岁运五音为初运，沿五音相生太少相生（《类经图翼》）。每步七十三日零五刻，交司大寒、春分后十三日、芒种后十日、处暑后七日、立冬后四日。</p>';
      $('yqZhuYunOut').innerHTML = html;
    }

    /* 运气总图：六气外环、五运内环同盘，点六气步看该步加临 */
    function renderZongTu(p){
      $('yqZongTuWheelHost').innerHTML = '<div class="wheel-block"><h4>运气总图</h4>' + yqZongTuWheel(p)
        + '<div class="wheel-detail" id="yqZongTuDetail">' + yqZongTuDetailHTML(p, YQ_ZT_SEL) + '</div></div>';
    }

    function renderKe(p){
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>六步</th><th>客气</th><th>五行</th><th>注</th></tr></thead><tbody>';
      for (var i=0;i<p.zhu.length;i++){
        var bu = p.zhu[i].bu, qi = p.ke[i], note = '';
        if (i===2) note = '司天';
        if (i===5) note = '在泉';
        html += '<tr><td class="yq-c0">' + esc(bu) + '</td><td>' + esc(qi) + (note?'（'+esc(note)+'）':'') + '</td><td>' + esc(YQ.qiWx(qi)) + '</td><td>' + esc(note||'—') + '</td></tr>';
      }
      html += '</tbody></table></div>';
      $('yqKeOut').innerHTML = html;
      $('yqKeWheelHost').innerHTML = '<div class="wheel-block"><h4>客气六步定位盘</h4>' + yqKeWheel(p)
        + '<div class="wheel-detail" id="yqKeDetail">' + yqKeDetailHTML(p, YQ_KE_SEL) + '</div></div>';
    }

    function renderJialin(p){
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>六步</th><th>主气</th><th>客气</th><th>关系</th><th>断</th></tr></thead><tbody>';
      for (var i=0;i<p.jialin.length;i++){
        var r = p.jialin[i];
        var du = r.pan === '相得' ? '相得' : '不相得：' + r.du;
        if (r.note) du += '（' + r.note + '）';
        html += '<tr class="' + (r.pan==='相得'?'yq-good':'yq-bad') + '"><td class="yq-c0">' + esc(p.zhu[i].bu) + '</td><td>' + esc(r.zhu) + '</td><td>' + esc(r.ke) + '</td><td>' + esc(r.rel) + '</td><td>' + esc(du) + '</td></tr>';
      }
      html += '</tbody></table></div>';
      $('yqJialinOut').innerHTML = html;
      $('yqJialinWheelHost').innerHTML = '<div class="wheel-block"><h4>客主加临盘</h4>' + yqJlWheel(p)
        + '<div class="wheel-detail" id="yqJlDetail">' + yqJlDetailHTML(p, YQ_JL_SEL) + '</div></div>';
    }

    function renderTonghua(p){
      var th = p.tonghua;
      var rows = [
        ['天符（执法）', th.tianFu], ['岁会（行令）', th.suiHui], ['太乙天符（贵人）', th.taiYi],
        ['同天符', th.tongTianFu], ['同岁会', th.tongSuiHui]
      ];
      var hits = [];
      for (var i = 0; i < rows.length; i++){
        if (rows[i][1].hit) hits.push('<tr class="yq-good"><td class="yq-c0">' + esc(rows[i][0]) + '</td><td>成立</td><td>' + esc(rows[i][1].desc) + '</td></tr>');
      }
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr>' +
        '<th>名目</th><th>判定</th><th>说明</th></tr></thead><tbody>';
      if (hits.length){
        html += hits.join('');
        html += '</tbody></table></div>';
        html += '<p class="sub-note">执法、行令、贵人为《素问·六微旨大论》同化三档，病势徐疾有辨，此处仅列名目；传统视同化之年气交单纯、特点偏鲜明。</p>';
      } else {
        html += '</tbody></table></div>';
        html += '<p class="sub-note">' + esc(p.gz) + '年无天符、岁会等同化；执法、行令、贵人为《素问·六微旨大论》同化三档，本年不涉及。</p>';
      }
      $('yqTonghuaOut').innerHTML = html;
    }

    /* 运气学源流与流派：七篇篇目、历代注家、学说定位与分歧，均为陈说照录、随文注明出处 */
    function renderYuanliu(){
      var h = '<p class="sub-note">运气学说不出于一人一时：其推法在《素问》运气七篇，其入临床在金元，其图表集成于宋明，其辨难起于清代。以下照录篇目主旨、历代注家之说、六气标本中见与胜复、五郁之治与五郁之发、在泉淫胜之治，学说定位与分歧并列陈之，本页不作裁断。</p>';
      h += '<div class="yq-head">运气七篇大论</div>';
      h += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr><th>篇名</th><th>主旨</th></tr></thead><tbody>';
      for (var i = 0; i < YQ_PIAN.length; i++){
        h += '<tr><td class="yq-c0">' + esc(YQ_PIAN[i].name) + '</td><td>' + esc(YQ_PIAN[i].zhi) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      h += '<div class="yq-head">历代注家与流派</div>';
      h += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr><th>时代</th><th>人物与著作</th><th>所主</th></tr></thead><tbody>';
      for (var j = 0; j < YQ_SCHOOL.length; j++){
        h += '<tr><td class="yq-c0">' + esc(YQ_SCHOOL[j].era) + '</td><td>' + esc(YQ_SCHOOL[j].who) + '</td><td>' + esc(YQ_SCHOOL[j].zhu) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      h += '<div class="yq-head">学说定位与分歧</div>';
      h += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr><th>题</th><th>说</th></tr></thead><tbody>';
      for (var k = 0; k < YQ_POSITION.length; k++){
        h += '<tr><td class="yq-c0">' + esc(YQ_POSITION[k].k) + '</td><td>' + esc(YQ_POSITION[k].v) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      /* 六气标本中见与胜复：至真要大论原文照录 */
      h += '<div class="yq-head">六气标本中见</div>';
      h += '<p class="sub-note">' + esc(YQ_BIAOBEN) + '（《素问·至真要大论》照录）</p>';
      h += '<div class="yq-head">六气胜复</div>';
      h += '<p class="sub-note">' + esc(YQ_SHENG_FU) + '（《素问·至真要大论》照录：初气终三气天气主之，胜之常也；四气尽终气地气主之，复之常也）</p>';
      /* 五郁治则与五郁之发：六元正纪大论原文照录 */
      h += '<div class="yq-head">五郁之治与五郁之发</div>';
      h += '<p class="sub-note">' + esc(YQ_YU_ZHI) + '（《素问·六元正纪大论》照录）</p>';
      h += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr><th>郁发</th><th>气候物候之变（《素问·六元正纪大论》照录）</th></tr></thead><tbody>';
      for (var m = 0; m < YQ_YU_FA.length; m++){
        h += '<tr><td class="yq-c0">' + esc(YQ_YU_FA[m].yu) + '</td><td>' + esc(YQ_YU_FA[m].txt.replace(YQ_YU_FA[m].yu + '，', '')) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      /* 六气在泉淫胜治则：至真要大论六句照录；属医家治则，照录备参不作用药之荐 */
      h += '<div class="yq-head">六气在泉淫胜之治</div>';
      h += '<div class="yq-tbl-wrap"><table class="yq-tbl"><thead><tr><th>六气</th><th>治则（《素问·至真要大论》照录）</th></tr></thead><tbody>';
      for (var n = 0; n < YQ_YIN_ZHI.length; n++){
        h += '<tr><td class="yq-c0">' + esc(YQ_YIN_ZHI[n].qi) + '</td><td>' + esc(YQ_YIN_ZHI[n].txt) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      h += '<p class="sub-note">淫胜之治属医家药食治则，此处照录以备运气学说之全，不作用药依据。</p>';
      $('yqYuanliuOut').innerHTML = h;
    }

    /* ===== 1c. 圆盘（客气六步定位盘、客主加临盘） =====
       几何走 assets/wheel.js 的 WHEEL，颜色只绑 --wheel-* 令牌（见 .page-yq 主题段），本段不写死任何颜色。
       六步六格，每格六十度，格心落 i×60，初之气在正上，两盘同此一格。
       客气六步定位盘取两字外圈体系（环名 206、弧 188、外圈线 179、刻度 171 至 177），
       内界圈与盘心仍取单字体系（内圈字 148、内界圈 120、盘心 78、指针 82 至 116、热区外沿 194）。
       客主加临盘为三环同格：外签步名、内签一客气、内签二主气，客气按相得与否着吉凶二值色，
       三环同属一步，热区按格跨三环。圈数多于骨架，照阳宅流年飞星叠宅运盘之例把内界圈由 120 收到 104、
       内签拆成 152 与 120 两圈，外圈线 182、盘心 78、外签 206、弧 192、刻度 168 至 176、热区外沿 198 六处照骨架不动。 */
    var YQ_STEP = 60;
    var WQ_ARC=188, WQ_OUT=179, WQ_IN=120, WQ_CORE=78, WQ_LAB_OUT=206, WQ_LAB_IN=148,
        WQ_TICK0=171, WQ_TICK1=177, WQ_P0=82, WQ_P1=116, WQ_HIT1=WQ_ARC+6;
    /* 客主加临盘与运气总图与客气盘同制式：弧 188、外环 179、内界 120、盘心 78、
       字环 206 与 150、刻度 171 至 177、指针 82 至 116（恒在内界圈内）、热区外沿 194 */
    var WJ_ARC=188, WJ_OUT=179, WJ_IN=120, WJ_CORE=78, WJ_LAB_OUT=206, WJ_LAB_KE=150,
        WJ_TICK0=171, WJ_TICK1=177, WJ_P0=82, WJ_P1=116, WJ_HIT1=194;
    var YQ_LAST=null, YQ_LAST_DATE='', YQ_KE_SEL=0, YQ_JL_SEL=0;

    /* 该步客气在本年的角色：三之气为司天、终之气为在泉，其余四步为间气（《素问·至真要大论》） */
    function yqKeRole(i){ return i===2 ? '司天' : (i===5 ? '在泉' : '间气'); }
    function yqKeNote(i){ return i===2 ? '司天 主上半年' : (i===5 ? '在泉 主下半年' : '间气'); }
    /* 六气名皆“两字阴阳 + 两字气化”，盘上取后两字作简称（风木、君火、相火、湿土、燥金、寒水），
       全名在盘心第二行与盘下详情条给出 */
    function yqQiShort(qi){ return String(qi).slice(2); }

    function yqKeWheel(p){
      var n=p.ke.length;
      return WHEEL.render({
        id:'yqKeWheel', aria:'客气六步定位盘：初之气至终之气六步客气环列，三之气为司天、终之气为在泉',
        n:n,
        span:function(i){ return [i*YQ_STEP-YQ_STEP/2,i*YQ_STEP+YQ_STEP/2]; },
        mid:function(i){ return i*YQ_STEP; },
        arc:WQ_ARC, rIn:WQ_IN, hit1:WQ_HIT1, tick0:WQ_TICK0, tick1:WQ_TICK1, p0:WQ_P0, p1:WQ_P1, out:WQ_OUT, core:WQ_CORE,
        sel:YQ_KE_SEL,
        selId:'yqKeArc', needleId:'yqKeNeedle', dotId:'yqKeDot',
        onclick:'yqPickKe',
        tickAt:function(i){
          var dg=i*YQ_STEP, ta=WHEEL.px(WQ_TICK0,dg), tb=WHEEL.px(WQ_TICK1,dg);
          return '<line x1="'+WHEEL.n(ta[0])+'" y1="'+WHEEL.n(ta[1])+'" x2="'+WHEEL.n(tb[0])+'" y2="'+WHEEL.n(tb[1])+'" class="w-tick'+(i===YQ_KE_SEL?' w-tick-j':'')+'"/>';
        },
        labelsOut:function(i,dg){
          var tp=WHEEL.px(WQ_LAB_OUT,dg);
          var role = (i===2 || i===5) ? '<tspan class="w-lab-sm">（'+yqKeRole(i)+'）</tspan>' : '';
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_KE_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+esc(p.ke[i])+role+'</text>';
        },
        labelsIn:function(i,dg){
          var tp=WHEEL.px(WQ_LAB_IN,dg);
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab w-lab-lg" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.radial(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+yqKeRole(i)+'</text>';
        },
        center:[
          {y:WHEEL.C-16, cls:'w-c1', id:'yqKeC1', text:esc(p.zhu[YQ_KE_SEL].bu)},
          {y:WHEEL.C+14, cls:'w-c2', id:'yqKeC2', text:esc(p.ke[YQ_KE_SEL])},
          {y:WHEEL.C+34, cls:'w-c3', id:'yqKeC3', text:esc(yqKeNote(YQ_KE_SEL))}
        ]
      });
    }
    function yqKeDetailHTML(p,i){
      return esc(p.zhu[i].bu)+'，客气 '+esc(p.ke[i])+'（'+yqKeRole(i)+'），'+esc(YQ.qiWx(p.ke[i]))+'气当令'
        +'<span class="wd-br"></span>'+esc(p.zhu[i].start)+'起，'+esc(p.zhu[i].end)+'止'
        +'<span class="wd-br"></span>三之气为司天、终之气为在泉，其余四步为间气';
    }
    function yqPickKe(i){
      var p=YQ_LAST; if(!p||!p.ke[i]) return;
      YQ_KE_SEL=i;
      WHEEL.pick('yqKeWheel',i);
      WHEEL.lab('yqKeWheel',i);
      var a0=i*YQ_STEP-YQ_STEP/2, a1=i*YQ_STEP+YQ_STEP/2, dg=i*YQ_STEP;
      var arc=document.getElementById('yqKeArc'); if(arc) arc.setAttribute('d',WHEEL.arc(WQ_ARC,a0,a1));
      var q0=WHEEL.px(WQ_P0,dg), q1=WHEEL.px(WQ_P1,dg);
      var ln=document.getElementById('yqKeNeedle');
      if(ln){ ln.setAttribute('x1',WHEEL.n(q0[0])); ln.setAttribute('y1',WHEEL.n(q0[1]));
              ln.setAttribute('x2',WHEEL.n(q1[0])); ln.setAttribute('y2',WHEEL.n(q1[1])); }
      var dt=document.getElementById('yqKeDot');
      if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
      var ticks=document.querySelectorAll('#yqKeWheel .w-tick');
      for(var k=0;k<ticks.length;k++) ticks[k].classList.toggle('w-tick-j',k===i);
      WHEEL.text('yqKeC1',p.zhu[i].bu);
      WHEEL.text('yqKeC2',p.ke[i]);
      WHEEL.text('yqKeC3',yqKeNote(i));
      var d=document.getElementById('yqKeDetail'); if(d) d.innerHTML=yqKeDetailHTML(p,i);
    }

    function yqJlWheel(p){
      var n=p.jialin.length, r=p.jialin[YQ_JL_SEL], ok=(r.pan==='相得');
      return WHEEL.render({
        id:'yqJlWheel', aria:'客主加临盘：外环六步、中环客气、内环主气，客气色示相得与否',
        n:n,
        span:function(i){ return [i*YQ_STEP-YQ_STEP/2,i*YQ_STEP+YQ_STEP/2]; },
        mid:function(i){ return i*YQ_STEP; },
        arc:WJ_ARC, rIn:WJ_IN, hit1:WJ_HIT1, tick0:WJ_TICK0, tick1:WJ_TICK1, p0:WJ_P0, p1:WJ_P1, out:WJ_OUT, core:WJ_CORE,
        sel:YQ_JL_SEL,
        selId:'yqJlArc', needleId:'yqJlNeedle', dotId:'yqJlDot',
        onclick:'yqPickJl',
        tickAt:function(i){
          var dg=i*YQ_STEP, ta=WHEEL.px(WJ_TICK0,dg), tb=WHEEL.px(WJ_TICK1,dg);
          return '<line x1="'+WHEEL.n(ta[0])+'" y1="'+WHEEL.n(ta[1])+'" x2="'+WHEEL.n(tb[0])+'" y2="'+WHEEL.n(tb[1])+'" class="w-tick'+(i===YQ_JL_SEL?' w-tick-j':'')+'"/>';
        },
        labelsOut:function(i,dg){
          var tp=WHEEL.px(WJ_LAB_OUT,dg);
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_JL_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+esc(p.zhu[i].bu)+'</text>';
        },
        labelsMid:function(i,dg){
          var x=p.jialin[i], yes=(x.pan==='相得'), tp=WHEEL.px(WJ_LAB_KE,dg);
          var g='var(--wheel-good)', b='var(--wheel-bad)';
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_JL_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'
            +'<tspan x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" dy="-14" style="fill:'+(yes?g:b)+'">客'+esc(yqQiShort(x.ke))+'</tspan>'
            +'<tspan x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'">主'+esc(yqQiShort(x.zhu))+'</tspan>'
            +'<tspan x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" dy="14" class="w-lab-sm" style="fill:'+(yes?g:b)+'">'+(yes?'相得':'不相得')+'</tspan></text>';
        },
        center:[
          {y:WHEEL.C-16, cls:'w-c1', id:'yqJlC1', text:esc(p.zhu[YQ_JL_SEL].bu)},
          {y:WHEEL.C+14, cls:'w-c2', id:'yqJlC2', text:'主'+esc(yqQiShort(r.zhu))+' 客'+esc(yqQiShort(r.ke))},
          {y:WHEEL.C+34, cls:'w-c3', id:'yqJlC3', text:esc(ok?'相得':r.du), style:'fill:'+(ok?'var(--wheel-good)':'var(--wheel-bad)')}
        ]
      });
    }
    /* 加临详情共件：两盘详情条同源（withRole 加客气的司天在泉角色，tail 为各盘末注） */
    function yqJialinDetail(p,i,withRole,tail){
      var r=p.jialin[i], ok=(r.pan==='相得');
      var duTxt = ok ? '相得' : ('不相得：'+r.du);
      if (r.note) duTxt += '（'+r.note+'）';
      return esc(p.zhu[i].bu)+'，客气 '+esc(r.ke)+(withRole?'（'+yqKeRole(i)+'）':'')+'，主气 '+esc(r.zhu)+'，'+esc(r.rel)
        +'<span class="wd-br"></span><span class="'+(ok?'wd-g':'wd-x')+'">'+esc(duTxt)+'</span>'
        +'<span class="wd-br"></span>'+tail;
    }
    function yqJlDetailHTML(p,i){
      return yqJialinDetail(p, i, false, '主气六步年年不移，客气随司天在泉轮转；同气相生为相得，相克为不相得，客胜主为从、主胜客为逆；君火相火互临按君位臣顺、臣位君逆');
    }
    function yqPickJl(i){
      var p=YQ_LAST; if(!p||!p.jialin[i]) return;
      YQ_JL_SEL=i;
      WHEEL.pick('yqJlWheel',i);
      WHEEL.lab('yqJlWheel',i);
      var a0=i*YQ_STEP-YQ_STEP/2, a1=i*YQ_STEP+YQ_STEP/2, dg=i*YQ_STEP, k;
      var arc=document.getElementById('yqJlArc'); if(arc) arc.setAttribute('d',WHEEL.arc(WJ_ARC,a0,a1));
      var q0=WHEEL.px(WJ_P0,dg), q1=WHEEL.px(WJ_P1,dg);
      var ln=document.getElementById('yqJlNeedle');
      if(ln){ ln.setAttribute('x1',WHEEL.n(q0[0])); ln.setAttribute('y1',WHEEL.n(q0[1]));
              ln.setAttribute('x2',WHEEL.n(q1[0])); ln.setAttribute('y2',WHEEL.n(q1[1])); }
      var dt=document.getElementById('yqJlDot');
      if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
      var ticks=document.querySelectorAll('#yqJlWheel .w-tick');
      for(k=0;k<ticks.length;k++) ticks[k].classList.toggle('w-tick-j',k===i);
      var r=p.jialin[i], ok=(r.pan==='相得');
      WHEEL.text('yqJlC1',p.zhu[i].bu);
      WHEEL.text('yqJlC2','主'+yqQiShort(r.zhu)+' 客'+yqQiShort(r.ke));
      WHEEL.text('yqJlC3',ok?'相得':r.du,ok?'var(--wheel-good)':'var(--wheel-bad)');
      var d=document.getElementById('yqJlDetail'); if(d) d.innerHTML=yqJlDetailHTML(p,i);
    }

    /* 年份信息已并入岁运表，不另设模块 */

    /* ===== 1e. 五运盘与运气总图（同走 WHEEL，颜色字号只取令牌） ===== */
    var YQ_WY_SEL = 0, YQ_ZT_SEL = 0;

    /* 主运客运五步盘：外环五步、中环客运、内环主运，五格每格七十二度 */
    function yqWuyunWheel(p){
      var zy = YQ.zhuYunOf(p.gz), ky = YQ.keYunOf(p.yun.wuyin), n = 5;
      return WHEEL.render({
        id:'yqWuyunWheel', aria:'主运客运五步盘：外环五步、中环客运、内环主运',
        n:n,
        span:function(i){ return [i*72-36, i*72+36]; },
        mid:function(i){ return i*72; },
        arc:WQ_ARC, rIn:WQ_IN, hit1:WQ_HIT1, tick0:WQ_TICK0, tick1:WQ_TICK1, p0:WQ_P0, p1:WQ_P1, out:WQ_OUT, core:WQ_CORE,
        sel:YQ_WY_SEL,
        selId:'yqWuyunArc', needleId:'yqWuyunNeedle', dotId:'yqWuyunDot',
        onclick:'yqPickWuyun',
        tickAt:function(i){
          var dg=i*72, ta=WHEEL.px(WQ_TICK0,dg), tb=WHEEL.px(WQ_TICK1,dg);
          return '<line x1="'+WHEEL.n(ta[0])+'" y1="'+WHEEL.n(ta[1])+'" x2="'+WHEEL.n(tb[0])+'" y2="'+WHEEL.n(tb[1])+'" class="w-tick'+(i===YQ_WY_SEL?' w-tick-j':'')+'"/>';
        },
        labelsOut:function(i,dg){
          var tp=WHEEL.px(WQ_LAB_OUT,dg);
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_WY_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+esc(zy[i].bu)+'</text>';
        },
        labelsMid:function(i,dg){
          var tp=WHEEL.px(157,dg);
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_WY_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'
            +'<tspan x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'">客'+esc(ky[i].yin)+'</tspan>'
            +'<tspan x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" dy="14">主'+esc(zy[i].yin)+'</tspan></text>';
        },
        center:[
          {y:WHEEL.C-16, cls:'w-c1', id:'yqWuyunC1', text:esc(zy[YQ_WY_SEL].bu)},
          {y:WHEEL.C+14, cls:'w-c2', id:'yqWuyunC2', text:'主'+esc(zy[YQ_WY_SEL].yin)+' 客'+esc(ky[YQ_WY_SEL].yin)},
          {y:WHEEL.C+34, cls:'w-c3', id:'yqWuyunC3', text:'岁运'+esc(p.yun.wuyin)}
        ]
      });
    }
    function yqWuyunDetailHTML(p,i){
      var zy = YQ.zhuYunOf(p.gz), ky = YQ.keYunOf(p.yun.wuyin);
      var yb = YQ.stepBounds(p.year, YQ.ZHU_YUN_JIE, YQ.ZHU_YUN_OFFSET);
      var b = yb[i];
      return esc(zy[i].bu)+'，主运 '+esc(zy[i].yin)+'（'+esc(zy[i].wx)+'），客运 '+esc(ky[i].yin)+'（'+esc(ky[i].wx)+'）'
        +'<span class="wd-br"></span>起于 '+esc(yqYunBoundTxt(i))+'（'+(b?esc(b.ymd):'—')+'）'
        +'<span class="wd-br"></span>主运五步年年不移，客运以岁运为初运随年轮转；初运太少由中运上推，太少相生';
    }
    function yqPickWuyun(i){
      var p=YQ_LAST; if(!p) return;
      YQ_WY_SEL=i;
      WHEEL.pick('yqWuyunWheel',i);
      WHEEL.lab('yqWuyunWheel',i);
      var a0=i*72-36, a1=i*72+36, dg=i*72, k;
      var arc=document.getElementById('yqWuyunArc'); if(arc) arc.setAttribute('d',WHEEL.arc(WQ_ARC,a0,a1));
      var q0=WHEEL.px(WQ_P0,dg), q1=WHEEL.px(WQ_P1,dg);
      var ln=document.getElementById('yqWuyunNeedle');
      if(ln){ ln.setAttribute('x1',WHEEL.n(q0[0])); ln.setAttribute('y1',WHEEL.n(q0[1]));
              ln.setAttribute('x2',WHEEL.n(q1[0])); ln.setAttribute('y2',WHEEL.n(q1[1])); }
      var dt=document.getElementById('yqWuyunDot');
      if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
      var ticks=document.querySelectorAll('#yqWuyunWheel .w-tick');
      for(k=0;k<ticks.length;k++) ticks[k].classList.toggle('w-tick-j',k===i);
      var zy = YQ.zhuYunOf(p.gz), ky = YQ.keYunOf(p.yun.wuyin);
      WHEEL.text('yqWuyunC1',zy[i].bu);
      WHEEL.text('yqWuyunC2','主'+zy[i].yin+' 客'+ky[i].yin);
      WHEEL.text('yqWuyunC3','岁运'+p.yun.wuyin);
      var d=document.getElementById('yqWuyunDetail'); if(d) d.innerHTML=yqWuyunDetailHTML(p,i);
    }

    /* 运气总图：与客主加临盘同一制式（弧 188、外环 179、内界 120、盘心 78、指针 82 至 116）。
       外环客气六步字 206（标司天在泉）、主气六步字 168、五运五步字 138（客前主后一行，五格界刻度 120 至 132） */
    function yqZongTuWheel(p){
      var n=6, zy=YQ.zhuYunOf(p.gz), ky=YQ.keYunOf(p.yun.wuyin);
      return WHEEL.render({
        id:'yqZongTuWheel', aria:'运气总图：外环客气六步、二环主气六步、内环主运客运五步',
        n:n,
        span:function(i){ return [i*60-30, i*60+30]; },
        mid:function(i){ return i*60; },
        arc:WJ_ARC, rIn:WJ_IN, hit1:WJ_HIT1, tick0:WJ_TICK0, tick1:WJ_TICK1, p0:WJ_P0, p1:WJ_P1, out:WJ_OUT, core:WJ_CORE,
        sel:YQ_ZT_SEL,
        selId:'yqZtArc', needleId:'yqZtNeedle', dotId:'yqZtDot',
        onclick:'yqPickZt',
        tickAt:function(i){
          var dg=i*60, ta=WHEEL.px(WJ_TICK0,dg), tb=WHEEL.px(WJ_TICK1,dg);
          return '<line x1="'+WHEEL.n(ta[0])+'" y1="'+WHEEL.n(ta[1])+'" x2="'+WHEEL.n(tb[0])+'" y2="'+WHEEL.n(tb[1])+'" class="w-tick'+(i===YQ_ZT_SEL?' w-tick-j':'')+'"/>';
        },
        labelsOut:function(i,dg){
          var tp=WHEEL.px(WJ_LAB_OUT,dg);
          var role = (i===2 || i===5) ? '<tspan class="w-lab-sm">（'+yqKeRole(i)+'）</tspan>' : '';
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_ZT_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+esc(yqQiShort(p.ke[i]))+role+'</text>';
        },
        labelsMid:function(i,dg){
          var tp=WHEEL.px(160,dg);
          return '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab'+(i===YQ_ZT_SEL?' w-lab-cur':'')+'" data-i="'+i+'"'
            +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">'+esc(yqQiShort(p.zhu[i].qi))+'</text>';
        },
        extra:function(){
          var s='', i, dg, tp, a, b;
          /* 五运五步刻度：内界圈 120 到 128，与五运字环留净距，不切字 */
          for (i=0;i<5;i++){
            dg=i*72; a=WHEEL.px(120,dg); b=WHEEL.px(128,dg);
            s += '<line x1="'+WHEEL.n(a[0])+'" y1="'+WHEEL.n(a[1])+'" x2="'+WHEEL.n(b[0])+'" y2="'+WHEEL.n(b[1])+'" class="w-tick"/>';
          }
          /* 五运单行：168 为主气环，140 为五运环，客前主后一行，居中于五格 */
          for (i=0;i<5;i++){ dg=i*72; tp=WHEEL.px(140,dg);
            s += '<text x="'+WHEEL.n(tp[0])+'" y="'+WHEEL.n(tp[1])+'" class="w-lab"'
              +' transform="rotate('+WHEEL.ring(dg)+' '+WHEEL.n(tp[0])+' '+WHEEL.n(tp[1])+')">客'+esc(ky[i].yin)+' 主'+esc(zy[i].yin)+'</text>';
          }
          return s;
        },
        center:[
          {y:WHEEL.C-16, cls:'w-c1', id:'yqZtC1', text:esc(p.zhu[YQ_ZT_SEL].bu)},
          {y:WHEEL.C+14, cls:'w-c2', id:'yqZtC2', text:esc(p.ke[YQ_ZT_SEL])},
          {y:WHEEL.C+34, cls:'w-c3', id:'yqZtC3', text:esc(p.jialin[YQ_ZT_SEL].pan==='相得'?'相得':'不相得'), style:'fill:'+(p.jialin[YQ_ZT_SEL].pan==='相得'?'var(--wheel-good)':'var(--wheel-bad)')}
        ]
      });
    }
    function yqZongTuDetailHTML(p,i){
      return yqJialinDetail(p, i, true, '外环客气六步、二环主气六步、内环主运客运五步；六步每步六十度、五步每步七十二度，皆自大寒起算；逐格相得不相得见客主加临盘');
    }
    function yqPickZt(i){
      var p=YQ_LAST; if(!p||!p.ke[i]) return;
      YQ_ZT_SEL=i;
      WHEEL.pick('yqZongTuWheel',i);
      WHEEL.lab('yqZongTuWheel',i);
      var a0=i*60-30, a1=i*60+30, dg=i*60, k;
      var arc=document.getElementById('yqZtArc'); if(arc) arc.setAttribute('d',WHEEL.arc(WJ_ARC,a0,a1));
      var q0=WHEEL.px(WJ_P0,dg), q1=WHEEL.px(WJ_P1,dg);
      var ln=document.getElementById('yqZtNeedle');
      if(ln){ ln.setAttribute('x1',WHEEL.n(q0[0])); ln.setAttribute('y1',WHEEL.n(q0[1]));
              ln.setAttribute('x2',WHEEL.n(q1[0])); ln.setAttribute('y2',WHEEL.n(q1[1])); }
      var dt=document.getElementById('yqZtDot');
      if(dt){ dt.setAttribute('cx',WHEEL.n(q1[0])); dt.setAttribute('cy',WHEEL.n(q1[1])); }
      var ticks=document.querySelectorAll('#yqZongTuWheel .w-tick');
      for(k=0;k<ticks.length;k++) ticks[k].classList.toggle('w-tick-j',k===i);
      var r=p.jialin[i], ok=(r.pan==='相得');
      WHEEL.text('yqZtC1',p.zhu[i].bu);
      WHEEL.text('yqZtC2',p.ke[i]);
      WHEEL.text('yqZtC3',ok?'相得':'不相得',ok?'var(--wheel-good)':'var(--wheel-bad)');
      var d=document.getElementById('yqZongTuDetail'); if(d) d.innerHTML=yqZongTuDetailHTML(p,i);
    }

    /* ===== 1b. 浅释措辞（随各模块就地输出，不单设模块） ===== */
    var WX_BAIHUA = {
      '木': { tai: '风气偏盛，传统认为这一年生发之机偏旺、风象偏多', bu: '风气偏弱，传统认为这一年生发之机偏缓' },
      '火': { tai: '火热之气偏盛，传统认为这一年天气偏炎、物候偏早', bu: '火热之气偏弱，传统认为这一年热度偏平' },
      '土': { tai: '湿土之气偏盛，传统认为这一年雨湿偏多', bu: '湿土之气偏弱，传统认为这一年雨湿偏少' },
      '金': { tai: '燥金之气偏盛，传统认为这一年天气偏干、凉燥偏明显', bu: '燥金之气偏弱，传统认为这一年偏湿润温和' },
      '水': { tai: '寒水之气偏盛，传统认为这一年天气偏寒', bu: '寒水之气偏弱，传统认为这一年寒意偏平' }
    };
    var WX_ZANG = { '木': '肝', '火': '心', '土': '脾', '金': '肺', '水': '肾' };
    var WX_SE = { '木': '风', '火': '炎热', '土': '雨湿', '金': '干燥', '水': '寒冷' };

    /* ===== 1d. 运气学说典籍与历代注家（照录原文，出处随文注明） ===== */
    /* 天干正五行：干支本气一系，与五运化合之取气为两套并行口径 */
    var GAN_WX = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };

    /* 岁运三纪名（《素问·五常政大论》）：平气五名、不及五名、太过五名 */
    var YUN_JI = {
      '木': { ping:'敷和之纪', bu:'委和之纪', tai:'发生之纪' },
      '火': { ping:'升明之纪', bu:'伏明之纪', tai:'赫曦之纪' },
      '土': { ping:'备化之纪', bu:'卑监之纪', tai:'敦阜之纪' },
      '金': { ping:'审平之纪', bu:'从革之纪', tai:'坚成之纪' },
      '水': { ping:'静顺之纪', bu:'涸流之纪', tai:'流衍之纪' }
    };
    /* 岁运三纪纲语：取该纪首句至脏病一句，照录《素问·五常政大论》 */
    var YUN_JI_TXT = {
      '木': {
        ping: '敷和之纪，木德周行，阳舒阴布，五化宣平。其气端，其性随，其用曲直，其化生荣，其政发散，其候温和，其令风，其脏肝，其病里急支满。',
        bu: '委和之纪，是谓胜生，生气不政，化气乃扬，长气不平，收令乃早，凉雨时降，风云并兴，草木晚荣，苍干凋落。其气敛，其用聚，其脏肝，其病摇动注恐，从金化也。',
        tai: '发生之纪，是谓启陈，土疏泄，苍气达，阳和布化，阴气乃随，生气淳化，万物以荣。其化生，其气美，其政散，其令条舒，其脏肝脾，其病怒。'
      },
      '火': {
        ping: '升明之纪，正阳而治，德施周普，五化均衡。其气高，其性速，其用燔灼，其化蕃茂，其政明曜，其候炎暑，其令热，其脏心，其病瞤瘈。',
        bu: '伏明之纪，是谓胜长，长气不宣，藏气反布，收气自政，化令乃衡，寒清数举，暑令乃薄。其气郁，其用暴，其脏心，其病昏惑悲忘，从水化也。',
        tai: '赫曦之纪，是谓蕃茂，阴气内化，阳气外荣，炎暑施化，物得以昌。其化长，其气高，其政动，其令明显，其脏心肺，其病笑、疟、疮疡、血流、狂妄、目赤。'
      },
      '土': {
        ping: '备化之纪，气协天休，德流四政，五化齐修。其气平，其性顺，其用高下，其化丰满，其政安静，其候溽蒸，其令湿，其脏脾，其病否。',
        bu: '卑监之纪，是谓减化，化气不令，生政独彰，长气整，雨乃衍，收气平，风寒并兴，草木荣美，秀而不实。其气散，其用静定，其脏脾，其病留满否塞，从木化也。',
        tai: '敦阜之纪，是谓广化，厚德清静，顺长以盈，至阴内实，物化充成，烟埃朦郁，见于厚土，大雨时行，湿气乃用，燥政乃辟。其化圆，其气丰，其政静，其令周备，其脏脾肾，其病腹满，四肢不举。'
      },
      '金': {
        ping: '审平之纪，收而不争，杀而无犯，五化宣明。其气洁，其性刚，其用散落，其化坚敛，其政劲肃，其候清切，其令燥，其脏肺，其病咳。',
        bu: '从革之纪，是谓折收，收气乃后，生气乃扬，长化合德，火政乃宣，庶类以蕃。其气扬，其用躁切，其脏肺，其病嚏咳鼽衂，从火化也。',
        tai: '坚成之纪，是谓收引，天气洁，地气明，阳气随，阴治化，燥行其政，物以司成，收气繁布，化治不终。其化成，其气削，其政肃，其令锐切，其脏肺肝，其病喘喝、胸凭、仰息。'
      },
      '水': {
        ping: '静顺之纪，藏而勿害，治而善下，五化咸整。其气明，其性下，其用沃衍，其化凝坚，其政流演，其候凝肃，其令寒，其脏肾，其病厥。',
        bu: '涸流之纪，是谓反阳，藏令不举，化气乃昌，长气宣布，蛰虫不藏，土润水泉减，草木条茂，荣秀满盛。其气滞，其用渗泄，其脏肾，其病痿厥坚下，从土化也。',
        tai: '流衍之纪，是谓封藏，寒司物化，天地严凝，藏政以布，长令不扬。其化凛，其气坚，其政谧，其令流注，其脏肾心，其病胀。'
      }
    };
    /* 岁运太过不及之气交（《素问·气交变大论》照录，取该年之气候物候与民病首段） */
    var YUN_QJ = {
      '木': {
        tai: '岁木太过，风气流行，脾土受邪。民病飧泄，食减，体重，烦冤，肠鸣，腹支满，上应岁星。',
        bu: '岁木不及，燥乃大行，生气失应，草木晚荣，肃杀而甚，则刚木辟着，柔萎苍干，上应太白星。'
      },
      '火': {
        tai: '岁火太过，炎暑流行，金肺受邪。民病疟，少气，咳喘，血溢、血泄、注下，嗌燥，耳聋，中热、肩背热，上应荧惑星。',
        bu: '岁火不及，寒乃大行，长政不用，物荣而下，凝惨而甚，则阳气不化，乃折荣美，上应辰星。'
      },
      '土': {
        tai: '岁土太过，雨湿流行，肾水受邪。民病腹痛，清厥，意不乐，体重，烦冤，上应镇星。',
        bu: '岁土不及，风乃大行，化气不令，草木茂荣，飘扬而甚，秀而不实，上应岁星。'
      },
      '金': {
        tai: '岁金太过，燥气流行，肝木受邪。民病两胁下少腹痛，目赤痛，眦疡，耳无所闻。',
        bu: '岁金不及，炎火乃行，生气乃用，长气专胜，庶物以茂，燥烁以行，上应荧惑星。'
      },
      '水': {
        tai: '岁水太过，寒气流行，邪害心火。民病身热，烦心，躁悸，阴厥，上下中寒，谵妄，心痛，寒气早至，上应辰星。',
        bu: '岁水不及，湿乃大行，长气反用，其化乃速，暑雨数至，上应镇星。'
      }
    };
    /* 司天之政综述（《素问·六元正纪大论》“凡此某某司天之政”照录） */
    var SITIAN_ZHENG = {
      '太阳寒水': '凡此太阳司天之政，气化运行先天，天气肃，地气静，寒凝太虚，阳气不令，水土合德，上应辰星镇星。其谷玄黅，其政肃，其令徐。寒政大举，泽无阳焰，则火发待时。寒湿之气，持于气交。',
      '阳明燥金': '凡此阳明司天之政，气化运行后天，天气急，地气明，阳专其令，炎暑大行，物燥以坚，淳风乃治，风燥横运，流于气交，多阳少阴，云趋雨府，湿化乃敷。燥极而泽，金火合德，上应太白荧惑。其政切，其令暴，蛰虫乃见，流水不冰。',
      '少阳相火': '凡此少阳司天之政，气化运行先天，天气正，地气扰，风乃暴举，木偃沙飞，炎火乃流，阴行阳化，雨乃时应，火木同德，上应荧惑岁星。其谷丹苍，其政严，其令扰。故风热参布，云物沸腾，太阴横流，寒乃时至，凉雨并起。',
      '太阴湿土': '凡此太阴司天之政，气化运行后天，阴专其政，阳气退辟，大风时起，天气下降，地气上腾，原野昏霿，白埃四起，云奔南极，寒雨数至，物成于差夏。',
      '少阴君火': '凡此少阴司天之政，气化运行先天，地气肃，天气明，寒交暑，热加燥，云驰雨府，湿化乃行，时雨乃降，金火合德，上应荧惑太白。其政明，其令切，其谷丹白。水火寒热持于气交而为病始也。热病生于上，清病生于下，寒热凌犯而争于中。',
      '厥阴风木': '凡此厥阴司天之政，气化运行后天，诸同正岁，气化运行同天，天气扰，地气正，风生高远，炎热从之，云趋雨府，湿化乃行，风火同德，上应岁星荧惑。其政挠，其令速，其谷苍丹。风燥火热，胜复更作，蛰虫来见，流水不冰，热病行于下，风病行于上，风燥胜复形于中。'
    };
    /* 运气七篇大论：篇名与主旨（《素问》卷十九至二十二，王冰次注本） */
    var YQ_PIAN = [
      { name: '天元纪大论', zhi: '五运六气总纲：天干化五运、地支定六气，五运相袭、六气环转' },
      { name: '五运行大论', zhi: '五运六气之运行与天地阴阳相应，司天在泉之位与六气标本' },
      { name: '六微旨大论', zhi: '六气标本中见、客气环序、上下有位左右有纪，运气同化三档' },
      { name: '气交变大论', zhi: '岁运太过不及与气候物候之应，及五星灾应、胜复之纪' },
      { name: '五常政大论', zhi: '五运平气太过不及三纪之名与物候，兼论司天在泉与治法' },
      { name: '六元正纪大论', zhi: '六十年司天在泉与逐年气化之纪，六气十二变与五郁之发' },
      { name: '至真要大论', zhi: '六气胜复、客主加临之逆从、六气司天之政与治则药食所宜' }
    ];
    /* 历代注家与流派：运气学说自宋入临床，历代各有所主 */
    var YQ_SCHOOL = [
      { era: '宋代元符二年（1099）', who: '刘温舒《素问入式运气论奥》', zhu: '首部运气学专著，绘图立说，为运气入门之阶，后世运气图表多本此' },
      { era: '金代', who: '刘完素《素问玄机原病式》', zhu: '以亢害承制立论，倡六气皆从火化，为运气学说入临床之开派' },
      { era: '明代', who: '张介宾《类经》运气类', zhu: '以图说详运气之序，集明代运气研究之大成' },
      { era: '清代', who: '陆懋修《世补斋医书》运气辨', zhu: '主运气不可执一，谓当以病证为验；另倡大司天说' },
      { era: '今', who: '方药中《黄帝内经素问运气七篇讲解》', zhu: '逐篇讲解，为现代系统整理运气七篇之代表作' }
    ];
    /* 学说定位与分歧：本页取《素问》逐年司天通行例，异说并列备注 */
    var YQ_POSITION = [
      { k: '学说性质', v: '运气学说是《黄帝内经》中体系最完整、最具推算性的一部分：以干支推六十年气候与物候之周期，其推演链为干支定运气、运气定气化、气化应于物候与人体，性质属推步之学，与命理之推人不同科。' },
      { k: '七篇归属', v: '运气七篇大论为唐代王冰次注《素问》时所补入，宋代林亿等校正时已疑其文体不类《素问》他篇，后世称遗篇说；另一说以为《素问》原有而脱佚。两说并存，本页不裁断，篇文照录王冰次注本。' },
      { k: '司天口径', v: '本页取《素问》逐年司天通行例：年支定司天、对位定在泉，十二年一周。清代王丙、陆懋修一系另倡大司天说，以司天在泉各主六十年，与逐年司天不同科；本页主口径取逐年例，大司天说并列备注。' },
      { k: '验与不验', v: '运气之验历代有争：主验者以气化应物候为据，主不验者谓气候随地而异、不可执一。本页只陈典籍之推法与历代注家之说，不作验否之断。' }
    ];
    /* 六气标本中见 【定源】《素问·至真要大论》帝曰六气标本所从不同一段照录（该段在至真要大论，非六微旨大论，卷十九穷尽检索无此段） */
    var YQ_BIAOBEN = '帝曰：六气标本，所从不同，奈何。歧伯曰：气有从本者，有从标本者，有不从标本者也。少阳太阴从本，少阴太阳从本从标，阳明厥阴，不从标本，从乎中也。故从本者，化生于本，从标本者，有标本之化，从中者，以中气为化也。';
    /* 六气在泉淫胜治则 【定源】《素问·至真要大论》诸气在泉六句照录：司天在泉淫胜各有治则，此为在泉六淫于内之治 */
    var YQ_YIN_ZHI = [
      { qi: '风', txt: '风淫于内，治以辛凉，佐以苦，以甘缓之，以辛散之。' },
      { qi: '热', txt: '热淫于内，治以咸寒，佐以甘苦，以酸收之，以苦发之。' },
      { qi: '湿', txt: '湿淫于内，治以苦热，佐以酸淡，以苦燥之，以淡泄之。' },
      { qi: '火', txt: '火淫于内，治以咸冷，佐以苦辛，以酸收之，以苦发之。' },
      { qi: '燥', txt: '燥淫于内，治以苦温，佐以甘辛，以苦下之。' },
      { qi: '寒', txt: '寒淫于内，治以甘热，佐以苦辛，以咸泻之，以辛润之，以苦坚之。' }
    ];
    /* 五郁治则与五郁之发 【定源】《素问·六元正纪大论》郁之甚者一段与五郁之发五段照录（取维基文库本首句，屋发折木从维基文库本） */
    var YQ_YU_ZHI = '木郁达之，火郁发之，土郁夺之，金郁泄之，水郁折之，然调其气，过者折之，以其畏也，所谓泻之。';
    var YQ_YU_FA = [
      { yu: '木郁之发', txt: '木郁之发，太虚埃昏，云物以扰，大风乃至，屋发折木，木有变。' },
      { yu: '火郁之发', txt: '火郁之发，太虚肿翳，大明不彰，炎火行，大暑至，山泽燔燎，材木流津，广厦腾烟，土浮霜卤，止水乃减，蔓草焦黄，风行惑言，湿化乃后。' },
      { yu: '土郁之发', txt: '土郁之发，岩谷震惊，雷殷气交，埃昏黄黑，化为白气，飘骤高深，击石飞空，洪水乃从，川流漫衍，田牧土驹。' },
      { yu: '金郁之发', txt: '金郁之发，天洁地明，风清气切，大凉乃举，草树浮烟，燥气以行，霿雾数起，杀气来至，草木苍干，金乃有声。' },
      { yu: '水郁之发', txt: '水郁之发，阳气乃辟，阴气暴举，大寒乃至，川泽严凝，寒雰结为霜雪，甚则黄黑昏翳，流行气交，乃为霜杀，水乃见祥。' }
    ];
    /* 胜复 【定源】《素问·至真要大论》有胜则复一段照录 */
    var YQ_SHENG_FU = '初气终三气，天气主之，胜之常也。四气尽终气，地气主之，复之常也。有胜则复，无胜则否。';

    /* 六十年气化总表：逐年岁运、司天在泉、运气同化，全部取 YQ.compute 引擎终值
       【定源】《素问·六元正纪大论》六十年纪；年干支随农历正月初一界，与岁运模块同源。 */
    function renderTab60(){
      var g = $('yq60Gan').value, z = $('yq60Zhi').value;
      var html = '<div class="yq-tbl-wrap"><table class="yq-tbl yq-tbl-sm"><thead><tr>' +
        '<th>年</th><th>干支</th><th>岁运</th><th>司天</th><th>在泉</th><th>同化</th></tr></thead><tbody>';
      var shown = 0;
      for (var y = YEAR_MIN; y <= YEAR_MAX; y++){
        var p = YQ.compute(y);
        if (g && p.gan !== g) continue;
        if (z && p.zhi !== z) continue;
        var hits = [];
        if (p.tonghua.tianFu.hit) hits.push('天符');
        if (p.tonghua.suiHui.hit) hits.push('岁会');
        if (p.tonghua.taiYi.hit) hits.push('太乙天符');
        if (p.tonghua.tongTianFu.hit) hits.push('同天符');
        if (p.tonghua.tongSuiHui.hit) hits.push('同岁会');
        html += '<tr><td class="yq-c0">' + p.year + '</td><td>' + esc(p.gz) + '</td><td>' + esc(p.yun.wx + p.yun.shuai) +
          '</td><td>' + esc(p.sitian.name) + '</td><td>' + esc(p.zaiquan.name) + '</td><td>' + esc(hits.length ? hits.join('、') : '无') + '</td></tr>';
        shown++;
      }
      html += '</tbody></table></div>';
      html += '<p class="sub-note">共 ' + shown + ' 行，依《素问·六元正纪大论》六十年纪；年界随上方所选，与岁运模块一致。</p>';
      $('yqTabOut').innerHTML = html;
    }

    /* 干支反查年：一天干一地支，在 YEAR_MIN 至 YEAR_MAX 内反查，命中多时取首个并把年中日期带入日期框 */
    function gzLookup(){
      var v = String($('yqGz').value || '').replace(/^\s+|\s+$/g, '');
      if (!v) return null;
      if (!/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(v)) return -1;
      var out = [];
      for (var y = YEAR_MIN; y <= YEAR_MAX; y++){
        if (YQ.compute(y).gz === v) out.push(y);
      }
      return out;
    }

    /* 年界口径：春节换年或立春换年，决定该日期归入哪个运气年 */
    function yqBound(){
      return $('yqBound').value === 'lichun' ? 'lichun' : 'chunjie';
    }

    function renderAll(){
      var out = $('yqYunOut');
      var gzV = String($('yqGz').value || '').replace(/^\s+|\s+$/g, '');
      if (gzV){
        var gzHits = gzLookup();
        if (gzHits === -1){
          out.innerHTML = '<p class="yq-err">干支格式应为一天干一地支，如 丙午。</p>';
          return;
        }
        if (!gzHits.length){
          out.innerHTML = '<p class="yq-err">' + YEAR_MIN + ' 至 ' + YEAR_MAX + ' 年内无 ' + esc(gzV) + ' 年。</p>';
          return;
        }
        $('yqDate').value = gzHits[0] + '-06-01';
      }
      var dateStr = String($('yqDate').value || '').replace(/^\s+|\s+$/g, '');
      if (!window.xjValidDate(dateStr)){
        out.innerHTML = '<p class="yq-err">请输入合法的公历日期，如 2026-10-30。</p>';
        return;
      }
      /* 已排盘之日期即用户所定：标记手改，默认值续算不再回写，刷新亦按所定恢复 */
      $('yqDate').setAttribute('data-user-set', '1');
      $('yqBound').setAttribute('data-user-set', '1');
      var dp = dateStr.split('-').map(Number);
      var bound = yqBound();
      var effYear = YQ.yearOfDate(dp[0], dp[1], dp[2], bound);
      if (!(effYear >= YEAR_MIN && effYear <= YEAR_MAX)){
        out.innerHTML = '<p class="yq-err">该日期按所选年界属 ' + effYear + ' 年，超出 ' + YEAR_MIN + ' 至 ' + YEAR_MAX + ' 年范围。</p>';
        return;
      }
      var p = window.YQ.compute(effYear);
      YQ_LAST = p; YQ_LAST_DATE = dateStr; YQ_KE_SEL = 0; YQ_JL_SEL = 0;
      renderYun(p, dateStr, bound);
      renderSitian(p);
      renderZhu(p);
      renderKe(p);
      renderJialin(p);
      renderTonghua(p);
      renderStep(p);
      renderZhuYun(p);
      renderZongTu(p);
      renderYuanliu();
      renderTab60();
    }

    /* ===== 2. AI 上下文 ===== */
    function yqAiContext(){
      var dateStr = String($('yqDate').value || '').replace(/^\s+|\s+$/g, '');
      var bound = yqBound();
      var s = '【五运六气页】依《黄帝内经·素问》运气七篇大论通行例。四口径对照（天干正五行、地支正五行、化运、纳音）、岁运三纪（《五常政大论》）、气交之变（《气交变大论》）、司天之政（《六元正纪大论》）、标本中见与胜复（《至真要大论》）、五郁之治与五郁之发（《六元正纪大论》）随各模块就地输出，读盘三步与口径注见说明页。\n';
      var dp = dateStr.split('-').map(Number);
      var effYear = (dp.length === 3 && window.xjValidDate(dateStr)) ? YQ.yearOfDate(dp[0], dp[1], dp[2], bound) : NaN;
      if (window.YQ && effYear >= YEAR_MIN && effYear <= YEAR_MAX){
        var p = window.YQ.compute(effYear);
        s += '当前排盘：' + dateStr + '（年界' + (bound === 'lichun' ? '立春换年' : '春节换年') + '，属' + p.gz + '年，' + p.sheng + '肖，纳音' + p.nayin + '）。\n';
        s += '岁运：' + p.yun.wx + '，' + p.yun.shuai + '（' + p.yun.he + '）。\n';
        s += '司天：' + p.sitian.name + '（主上半年）；在泉：' + p.zaiquan.name + '（主下半年）。\n';
        s += '客气六步：' + p.ke.join('、') + '（三之气为司天，终之气为在泉）。\n';
        var de = [];
        for (var i=0;i<p.jialin.length;i++){
          var r = p.jialin[i];
          de.push(p.zhu[i].bu + ' ' + r.zhu + '/' + r.ke + ' ' + r.rel + ' ' + (r.pan==='相得'?'相得':'不相得：'+r.du) + (r.note ? '（' + r.note + '）' : ''));
        }
        s += '客主加临：' + de.join('；') + '（通行归纳：同气相生为相得，相克为不相得，客胜主为从、主胜客为逆）。\n';
        var hits = [];
        if (p.tonghua.tianFu.hit) hits.push('天符');
        if (p.tonghua.suiHui.hit) hits.push('岁会');
        if (p.tonghua.taiYi.hit) hits.push('太乙天符');
        if (p.tonghua.tongTianFu.hit) hits.push('同天符');
        if (p.tonghua.tongSuiHui.hit) hits.push('同岁会');
        s += '运气同化：' + (hits.length ? hits.join('、') : '无') + '。\n';
        var zy = window.YQ.zhuYunOf(p.gz), ky = window.YQ.keYunOf(p.yun.wuyin);
        s += '主运五步：' + zy.map(function(x){ return x.bu + x.yin; }).join('、') + '。\n';
        s += '客运五步：' + ky.map(function(x){ return x.bu + x.yin; }).join('、') + '。\n';
        var si = window.YQ.stepInfo(dateStr, effYear);
        if (si && si.qi && si.yun){
          s += '时令落步：' + dateStr + ' 在' + si.qi.bu + '（主气' + si.qi.zhu + '，客气' + si.qi.ke + '），' + si.yun.bu + '（主运' + si.yun.zhu.yin + '，客运' + si.yun.ke.yin + '），当日节气' + (window.YQ.jieQiNameOf(dateStr) || '未载') + '。\n';
        }
      }
      s += '运气学说出自《黄帝内经》，不作医学诊断依据。';
      return s;
    }

    /* ===== 3. 折叠模块开合与状态持久化（ES5） ===== */
    var YQ_MOD_KEY = 'yqModState';
    var yqModNavReady = false;
    function _yqAllModIds(){ try{ return Array.from(document.querySelectorAll('.mod[id]')).map(function(e){ return e.id; }); }catch(e){ return ['yqmod-yun']; } }
    function toggleMod(id){
      var el = document.getElementById(id); if (el) el.classList.toggle('collapsed');
      saveYqModState();
    }
    /* 折叠头走内联 onclick 只能触达全局：脚本求值即挂上，init 中任一附加模块异常都不再拖死开合 */
    window.toggleMod = toggleMod;
        function saveYqModState(){
      if (!yqModNavReady) return;
      try{
        var o = xjReadFold(YQ_MOD_KEY);
        _yqAllModIds().forEach(function(id){ var e = document.getElementById(id); if (e) o[id] = e.classList.contains('collapsed'); });
        var v = JSON.stringify(o);
        try{ localStorage.setItem(YQ_MOD_KEY, v); }catch(e){}
        try{ sessionStorage.setItem(YQ_MOD_KEY, v); }catch(e){}
      }catch(e){}
    }
    function applyYqModState(){
      var o = xjReadFold(YQ_MOD_KEY);
      try{
        _yqAllModIds().forEach(function(id){
          var e = document.getElementById(id); if (!e) return;
          /* 结果未出时不恢复展开态：空模块展开无内容，首屏保持静态折叠 */
          if (!YQ_LAST) return;
          if (o[id] === true) e.classList.add('collapsed');
          else if (o[id] === false) e.classList.remove('collapsed');
        });
      }catch(e){}
    }

    /* ===== 4. 初始化 ===== */
    function init(){
      $('yqBtn').addEventListener('click', function(){
        renderAll();
        /* 排盘按钮即出结果入口：岁运收起而结果已出时展开，落眼即所见 */
        var m = document.getElementById('yqmod-yun');
        if (m && m.classList.contains('collapsed') && document.querySelector('#yqYunOut .yq-ov')) toggleMod('yqmod-yun');
      });
      /* 六十年总表筛选器：年干年支选项填充与变更即重渲（表未渲染过则先渲染一次） */
      var GANS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
      var ZHIS = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      var gSel = $('yq60Gan'), zSel = $('yq60Zhi');
      var gOpts = '', zOpts = '', gi, zi;
      for (gi = 0; gi < GANS.length; gi++){ gOpts += '<option value="' + GANS[gi] + '">' + GANS[gi] + '</option>'; }
      for (zi = 0; zi < ZHIS.length; zi++){ zOpts += '<option value="' + ZHIS[zi] + '">' + ZHIS[zi] + '</option>'; }
      gSel.innerHTML += gOpts;
      zSel.innerHTML += zOpts;
      gSel.addEventListener('change', function(){ if (document.getElementById('yqTabOut').innerHTML) renderTab60(); });
      zSel.addEventListener('change', function(){ if (document.getElementById('yqTabOut').innerHTML) renderTab60(); });
      /* 干支反查输入框回车即排盘 */
      $('yqGz').addEventListener('keydown', function(ev){ if (ev.key === 'Enter') renderAll(); });
      if (window.mountAI) window.mountAI(yqAiContext, '五运六气', { share:{ page:"yunqi", title:"五运六气在线排盘", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ renderAll(); applyYqModState(); }); } } });
      /* 盘面分享与数据（全站附加功能模块）：表单快照为盘面，链接/JSON 均可还原并重排 */;
      applyYqModState();
      yqModNavReady = true;
      /* 四盘点选回调：内联 onclick 只能触达全局，故挂到 window */
      window.yqPickKe = yqPickKe;
      window.yqPickJl = yqPickJl;
      window.yqPickWuyun = yqPickWuyun;
      window.yqPickZt = yqPickZt;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* 共享壳件：顶栏、页脚与底部免责声明由 renderChrome 统一渲染 */
    renderChrome('yunqi.html');
    })();
  }, 0);
});
