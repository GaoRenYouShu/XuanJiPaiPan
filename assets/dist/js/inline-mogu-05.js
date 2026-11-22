document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    (function () {
      'use strict';

      function $(id) { return document.getElementById(id); }
      function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

      var D = window.MG_DATA;
      if (!D) return;
      var BM = {}, FM = {}, i, j;
      for (i = 0; i < D.bones.length; i++) BM[D.bones[i].key] = D.bones[i];
      for (i = 0; i < D.forms.length; i++) FM[D.forms[i].key] = D.forms[i];
      var CN_NO = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

      function renderCheckForm() {
        var h = '<div class="form-row">';
        for (i = 0; i < D.checkKeys.length; i++) {
          var b = BM[D.checkKeys[i]];
          if (!b) continue;
          h += '<div class="field"><label for="mogu-' + b.key + '">' + esc(b.name) + '</label>'
            + '<select id="mogu-' + b.key + '" aria-label="' + esc(b.name) + '形态"><option value="" selected>未选择</option>';
          for (j = 0; j < D.forms.length; j++) {
            h += '<option value="' + D.forms[j].key + '">' + esc(D.forms[j].t) + '</option>';
          }
          h += '</select></div>';
        }
        h += '</div>';
        var el = $('moguCheckForm');
        if (el) el.innerHTML = h;
      }

      function resultHtml(title, body) {
        return '<div class="mogu-result"><h4>' + esc(title) + '</h4>' + body + '</div>';
      }

      function moguGo() {
        var out = $('moguOut');
        if (!out) return;
        var bk = $('moguBone') ? $('moguBone').value : '';
        var fk = $('moguForm') ? $('moguForm').value : '';
        var b = BM[bk], f = FM[fk];
        if (!b || !f) {
          out.innerHTML = resultHtml('骨法查询', '<p>请选择骨位与骨形。</p>');
          return;
        }
        var cls = f.v === '得势' ? ' class="yi"' : (f.v === '平常' ? '' : ' class="ji"');
        var cut = b.note.indexOf('。');
        var pos = cut > 0 ? b.note.slice(0, cut) : b.note;
        var method = cut > 0 ? b.note.slice(cut + 1) : '';
        var body = '<p>所主：' + esc(b.role) + '</p>';
        body += '<p>典籍：“' + esc(b.quote) + '”<span class="sub-note">' + esc(b.src) + '</span></p>';
        body += '<p>' + esc(f.t) + '（' + esc(f.d.replace(/。$/, '')) + '）：<span' + cls + '>' + esc(f.v) + '</span>，' + esc(b.r && b.r[fk] ? b.r[fk] : f.e) + '</p>';
        body += '<p>位置：' + esc(pos) + '。</p>';
        body += '<p>方法：' + esc(method) + '</p>';
        out.innerHTML = resultHtml(b.name + '，' + f.t, body);
      }
      window.moguGo = moguGo;

      function moguCheck() {
        var out = $('moguCheckOut');
        if (!out) return;
        var lines = '', counts = {}, missing = '', k, v, strong = 0, flat = 0, weak = 0;
        for (k = 0; k < D.forms.length; k++) counts[D.forms[k].key] = 0;
        for (i = 0; i < D.checkKeys.length; i++) {
          var key = D.checkKeys[i], b = BM[key], el = $('mogu-' + key);
          v = el ? el.value : '';
          if (!v) { if (!missing) missing = b.name; continue; }
          counts[v] = (counts[v] || 0) + 1;
          if (v === 'feng') strong++;
          else if (v === 'ping') flat++;
          else weak++;
          var f = FM[v];
          var read = b.r && b.r[v] ? b.r[v] : f.d;
          lines += '<p>' + CN_NO[i] + ' ' + esc(b.name) + ' ' + esc(f.t) + '（' + esc(f.v) + '）：' + esc(read) + '</p>';
        }
        if (missing) {
          out.innerHTML = resultHtml('骨相自查', '<p>未选满：先从“' + esc(missing) + '”开始选择。</p>');
          return;
        }
        var sum = [];
        for (j = 0; j < D.forms.length; j++) {
          var ff = D.forms[j];
          sum.push(ff.t + ' ' + counts[ff.key]);
        }
        var overall;
        if (strong >= 5) overall = '骨格偏强：根基较厚，任事有力；忌刚而过露，宜留余。';
        else if (weak >= 5) overall = '骨格偏弱：根基偏薄，事多先难后易；宜积学借力，不宜躁进。';
        else if (flat >= 5) overall = '骨格平稳：守成有余，进取须借后天；宜守正渐进。';
        else overall = '骨格参差：强弱互见，一生起伏；须看具体骨位与后天修为。';
        var body = '<p>' + esc(overall) + '</p>' + lines;
        body += '<p class="sub-note">九骨计数：' + esc(sum.join('、')) + '。</p>';
        body += '<p class="sub-note">九骨合参，不以一骨定论；骨相只是传统相术的一支，后天修为与选择更重。</p>';
        out.innerHTML = resultHtml('九骨简评', body);
        moguSave();
      }
      window.moguCheck = moguCheck;

      function moguClear() {
        for (i = 0; i < D.checkKeys.length; i++) {
          var el = $('mogu-' + D.checkKeys[i]);
          if (el) el.value = '';
        }
        var out = $('moguCheckOut');
        if (out) out.innerHTML = '';
      }
      window.moguClear = moguClear;

      function moguSnap() {
        var o = {};
        for (i = 0; i < D.checkKeys.length; i++) {
          var key = D.checkKeys[i], el = $('mogu-' + key);
          o[key] = el ? el.value : '';
        }
        return o;
      }

      var MG_SAVED_CFG = {
        mask: 'mgSavedMask', list: 'mgSavedList', key: 'mgMoguLog', title: '历史记录（最多9条）',
        restoreFn: 'mgRestoreSaved', delFn: 'mgDelSaved',
        row: function (h) { return { t: h.t || '', main: h.g || '', sub: h.s || '' }; }
      };

      function moguSave() {
        if (!window.xjHist) return;
        var d = moguSnap(), counts = {}, parts = [], k, v, jj;
        for (k = 0; k < D.forms.length; k++) counts[D.forms[k].key] = 0;
        for (k = 0; k < D.checkKeys.length; k++) {
          v = d[D.checkKeys[k]];
          if (v) counts[v] = (counts[v] || 0) + 1;
        }
        for (jj = 0; jj < D.forms.length; jj++) {
          var ff = D.forms[jj];
          if (counts[ff.key]) parts.push(ff.t + ' ' + counts[ff.key]);
        }
        var e = { t: xjHist.time(), g: '骨相自查', s: parts.join('、') || '九骨未选', d: d };
        xjHist.push(MG_SAVED_CFG.key, e, function (h, o) { return JSON.stringify(h.d) === JSON.stringify(o.d); });
        if (document.getElementById('mgSavedList')) xjHist.render(MG_SAVED_CFG);
      }

      function mgShowSaved() { if (window.xjHist) xjHist.open(MG_SAVED_CFG); }
      function mgDelSaved(i) { if (window.xjHist) xjHist.del(MG_SAVED_CFG, i); }
      function mgRestoreSaved(i) {
        if (!window.xjHist) return;
        var e = xjHist.get(MG_SAVED_CFG.key, i);
        if (!e || !e.d) return;
        for (var k in e.d) {
          var el = $('mogu-' + k);
          if (el) el.value = e.d[k] || '';
        }
        moguCheck();
        xjHist.close();
        var out = $('moguCheckOut');
        if (out && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      window.mgRestoreSaved = mgRestoreSaved;
      window.mgDelSaved = mgDelSaved;
      if ($('moguHistBtn')) $('moguHistBtn').addEventListener('click', mgShowSaved);

      function moguAiContext() {
        var bk = $('moguBone') ? $('moguBone').value : '';
        var fk = $('moguForm') ? $('moguForm').value : '';
        var b = BM[bk], f = FM[fk];
        var s = '【摸骨页】当前骨位查询。\n';
        if (b && f) {
          s += '骨位：' + b.name + '；骨形：' + f.t + '（' + f.v + '）。\n';
          s += '骨位义：' + b.meaning + '\n';
          s += '合参：' + (b.r && b.r[fk] ? b.r[fk] : f.e) + '\n';
          s += '所主：' + b.role + '就其得势者言。\n';
          s += '原文：' + b.quote + '（' + b.src + '）\n';
          s += '骨形：' + f.d + '\n';
          s += '今形：' + f.e + '\n';
          if (b.variant) s += '异文：' + b.variant + '\n';
        } else {
          s += '骨位与骨形尚未选满，未出查询结果。\n';
        }
        var d = moguSnap(), counts = {}, parts = [], k, v, jj;
        for (k = 0; k < D.forms.length; k++) counts[D.forms[k].key] = 0;
        for (k = 0; k < D.checkKeys.length; k++) {
          v = d[D.checkKeys[k]];
          if (v) counts[v] = (counts[v] || 0) + 1;
        }
        for (jj = 0; jj < D.forms.length; jj++) {
          var ff = D.forms[jj];
          if (counts[ff.key]) parts.push(ff.t + ' ' + counts[ff.key]);
        }
        s += '九骨自查：' + (parts.length ? parts.join('、') : '未选') + '。\n';
        s += '相术为传统民俗文化，仅供文化研究与娱乐，不作人格评判与医疗依据。';
        return s;
      }

      function moguRecast() {
        var bk = $('moguBone') ? $('moguBone').value : '';
        var fk = $('moguForm') ? $('moguForm').value : '';
        if (bk && fk) { moguGo(); return; }
        var d = moguSnap(), any = false;
        for (var k in d) { if (d[k]) { any = true; break; } }
        if (any) moguCheck();
      }
      window.moguRecast = moguRecast;

      renderCheckForm();
      renderChrome('mogu.html');
      if (window.mountAI) {
        window.mountAI(moguAiContext, '摸骨', {
          share: {
            page: 'mogu', title: '摸骨在线查询', result: '#moguOut',
            collect: xjShareCollect, restore: xjShareRestore,
            recast: function () { xjShareRecast(function () { moguRecast(); }); }
          }
        });
      }
    })();
  }, 0);
});
