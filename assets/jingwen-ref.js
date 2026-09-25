/* 周易经文速查共享组件（六爻、梅花、测字、铁板四处共用）
   依赖：assets/gua.js（TRIGRAMS、_ORDER、_TBL、palaceInfo）、
        assets/jingwen.js（GUA_CI、GUA_TUAN、GUA_DAXIANG、YAO_CI、YAO_XIAOXIANG）
   对外接口：window.jwRenderInto(宿主) 渲染六十四卦经文卡并绑定检索与展开；
            window.mountJingWenRef(配置) 在附加功能面板之前插入折叠框，首次展开才渲染 */
(function () {
  if (typeof TRIGRAMS === 'undefined' || typeof _TBL === 'undefined' || typeof GUA_CI === 'undefined') return;
  var YAO_POS = ['初', '二', '三', '四', '五', '上'];

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* 爻题：位名配九六，阳爻称九、阴爻称六 */
  function yaoLabel(pos, bit) { return pos + (bit ? '九' : '六'); }
  function row(label, text) {
    return '<div class="jw-row"><span class="jw-n">' + label + '</span><span class="jw-t">' + esc(text) + '</span></div>';
  }

  function buildHTML() {
    var out = '';
    _ORDER.forEach(function (up) {
      _ORDER.forEach(function (lo, idx) {
        var name = _TBL[up][idx];
        var bits = TRIGRAMS[lo].bits.concat(TRIGRAMS[up].bits);
        var pi = palaceInfo(bits);
        var ci = GUA_CI[name] || '', tuan = GUA_TUAN[name] || '', dax = GUA_DAXIANG[name] || '';
        var rows = '';
        if (tuan) rows += row('彖', tuan);
        if (dax) rows += row('大象', dax);
        var yaos = '';
        YAO_POS.forEach(function (p, i) {
          var t = YAO_CI[name + p];
          if (!t) return;
          var xx = YAO_XIAOXIANG[name + p];
          yaos += t + (xx ? xx : '');
          rows += '<div class="jw-row"><span class="jw-n">' + yaoLabel(p, bits[i]) + '</span><span class="jw-t">' +
            esc(t) + (xx ? '<i class="jw-xx">象曰：' + esc(xx) + '</i>' : '') + '</span></div>';
        });
        out += '<div class="jw-item" data-key="' + esc(name + ' ' + ci + ' ' + tuan + ' ' + dax + ' ' + yaos) + '">' +
          '<div class="jw-top"><span class="jw-sym">' + TRIGRAMS[up].sym + TRIGRAMS[lo].sym + '</span>' +
          '<span class="jw-name">' + name + '</span>' +
          '<span class="jw-palace">' + pi.palace + ' ' + pi.type + '</span></div>' +
          '<div class="jw-ci">' + esc(ci) + '</div>' +
          '<div class="jw-detail">' + rows + '</div></div>';
      });
    });
    return '<div class="jw-wrap">' +
      '<div class="jw-search"><input class="jw-input" type="text" placeholder="检索卦名或经文关键字，如 乾、利贞、潜龙" aria-label="经文检索">' +
      '<span class="jw-count"></span></div>' +
      '<div class="jw-grid">' + out + '</div></div>';
  }

  function renderInto(host) {
    if (!host || host.children.length) return;
    host.innerHTML = buildHTML();
    var input = host.querySelector('.jw-input');
    var count = host.querySelector('.jw-count');
    var items = [].slice.call(host.querySelectorAll('.jw-item'));
    function filter() {
      var k = (input.value || '').trim(), n = 0;
      items.forEach(function (it) {
        var hit = !k || it.getAttribute('data-key').indexOf(k) >= 0;
        it.style.display = hit ? '' : 'none';
        if (hit) n++;
      });
      count.textContent = k ? ('命中 ' + n + ' 卦') : ('共 ' + n + ' 卦');
    }
    input.addEventListener('input', filter);
    filter();
    host.addEventListener('click', function (e) {
      var top = e.target.closest ? e.target.closest('.jw-top') : null;
      if (!top || top.parentNode.className.indexOf('jw-item') < 0) return;
      top.parentNode.classList.toggle('jw-open');
    });
  }

  window.jwRenderInto = renderInto;
  window.mountJingWenRef = function (opt) {
    opt = opt || {};
    if (opt.host) {
      renderInto(typeof opt.host === 'string' ? document.getElementById(opt.host) : opt.host);
      return;
    }
    var page = document.querySelector('.page') || document.body;
    var d = document.createElement('details');
    d.className = (opt.cls || 'mh-ref') + ' jw-ref';
    d.id = opt.id || 'jwRef';
    d.innerHTML = '<summary>' + (opt.summary || '周易经文速查（卦辞 彖传 大象 爻辞）') + '</summary>' +
      '<div class="jw-host"></div>';
    var ai = document.getElementById('aiMount');
    if (ai && ai.parentNode === page) page.insertBefore(d, ai); else page.appendChild(d);
    if (opt.open) d.open = true;
    d.addEventListener('toggle', function () { if (d.open) renderInto(d.querySelector('.jw-host')); });
    if (d.open) renderInto(d.querySelector('.jw-host'));
  };
})();
