/* 云保存：把本页的输入与输出写成一份存档，存到外部并读回。
   两条通道：本地目录直存（File System Access，不经服务器）、直连 WebDAV（PROPFIND 与 PUT 与 GET）。
   坚果云不回跨域头，浏览器直连必败，故本地目录为兜底。CloudDrive2 原生 HTTP，
   在 HTTPS 站点下会被混合内容拦掉，须自备 HTTPS 反代。
   本件只做本页结果的保存与读回，不参与任何排盘推算。 */
(function () {
  'use strict';

  var DIR_KEY = 'xjCloudDirName';
  var CFG_KEY = 'xjCloudWebdav';
  var NO_PICKER_TIP = '此浏览器不支持直接选择文件夹，请用 Chrome 或 Edge；也可改用通道二的导出 JSON 与导入 JSON';
  var dirHandle = null;

  /* 目录句柄存 IndexedDB：刷新后不必重选，只在首次写入前要一次授权。
     Firefox 与 Safari 没有目录选择接口，走下载与导入那条路。 */
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('xjCloud', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('h'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }

  function idbSet(h) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction('h', 'readwrite');
        tx.objectStore('h').put(h, 'dir');
        tx.oncomplete = function () { res(true); };
        tx.onerror = function () { res(false); };
      });
    }).catch(function () { return false; });
  }

  function idbGet() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction('h', 'readonly');
        var q = tx.objectStore('h').get('dir');
        q.onsuccess = function () { res(q.result || null); };
        q.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  }

  function supported() { return typeof window.showDirectoryPicker === 'function'; }

  /* 取可用目录：内存有就用；否则从库中取回并核授权；未授权当场要一次 */
  function ensureDir() {
    if (dirHandle) return Promise.resolve(dirHandle);
    return idbGet().then(function (h) {
      if (!h) return null;
      return h.queryPermission({ mode: 'readwrite' }).then(function (st) {
        if (st === 'granted') { dirHandle = h; return h; }
        return h.requestPermission({ mode: 'readwrite' }).then(function (st2) {
          if (st2 === 'granted') { dirHandle = h; return h; }
          return null;
        });
      });
    }).catch(function () { return null; });
  }

  var PRESETS = [
    { id: '', name: '自选地址', url: '', note: '填 WebDAV 地址，须该服务允许跨域，否则浏览器读不到响应' },
    { id: 'clouddrive2', name: 'CloudDrive2', url: 'http://localhost:19799/dav', note: '默认 http://IP:19798/dav；页面以 HTTPS 打开时须走 HTTPS 地址，且反代需补 Access-Control-Allow-Origin' },
    { id: 'alist', name: 'Alist', url: 'http://127.0.0.1:5244/dav', note: '在其后台 设置 → 站点 打开 允许跨域；地址按该机实际端口填' },
    { id: 'cloudreve', name: 'Cloudreve', url: 'https://自有域名/dav', note: '需在反代上放开跨域头' },
    { id: 'sharelist', name: 'sharelist', url: 'https://自有域名/dav', note: '需在反代上放开跨域头' },
    { id: 'nextcloud', name: 'Nextcloud', url: 'https://域名/remote.php/dav/files/用户名/', note: '默认不发跨域头，须在反代加响应头' },
    { id: 'owncloud', name: 'ownCloud', url: 'https://域名/remote.php/dav/files/用户名/', note: '同 Nextcloud，默认不开跨域' },
    { id: 'seafile', name: 'Seafile', url: 'https://域名/seafdav/', note: '需放开跨域' },
    { id: 'synology', name: '群晖 WebDAV', url: 'https://NAS地址:5006/', note: '须用 5006 的 HTTPS 端口，并在反代上放开跨域' },
    { id: 'wsgidav', name: 'WsgiDAV', url: 'http://127.0.0.1:8080/', note: '本机自建，启动时放开跨域' },
    { id: 'rclone', name: 'rclone serve webdav', url: 'http://127.0.0.1:8080/', note: '本机自建，可自定监听地址与跨域设置' },
    { id: 'nginx', name: 'nginx dav 模块', url: 'https://域名/dav/', note: '自建，跨域头自行配置' },
    { id: 'pcloud', name: 'pCloud', url: 'https://webdav.pcloud.com/', note: '区域不同地址可能不同，以账号页为准' },
    { id: 'yandex', name: 'Yandex Disk', url: 'https://webdav.yandex.com/', note: '须用应用专用密码' },
    { id: 'infinicloud', name: 'InfiniCLOUD', url: 'https://服务器.teracloud.jp/dav/', note: '原 TeraCLOUD，地址以开通邮件为准' },
    { id: 'box', name: 'Box', url: 'https://dav.box.com/dav/', note: 'WebDAV 属付费功能' },
    { id: 'jianguoyun', name: '坚果云', url: 'https://dav.jianguoyun.com/dav/', note: '该服务不回跨域头，浏览器直连不通；可经 Alist 中转，或改用本地文件夹' }
  ];

  /* 直连必败的服务：给出中转引导，而不是让用户对着一句失败反复试 */
  var GUIDES = {
    jianguoyun: {
      why: '坚果云的 WebDAV 不回跨域头，网页发出请求会被浏览器在预检阶段拦下，填对账密也没用。',
      relay: [
        { name: 'Alist', url: 'http://127.0.0.1:5244/dav', how: '装好 Alist 后，在它的存储里添加坚果云（账号与应用密码照填），再回到这里用下面这个地址。' },
        { name: 'CloudDrive2', url: 'https://自有域名/dav', how: 'CloudDrive2 原生地址是 http://IP:19798/dav；页面以 HTTPS 打开时须先给它套一层 HTTPS 反代，再把反代地址填到这里；以 HTTP 打开可直接填原地址。' }
      ]
    }
  };

  function $(id) { return document.getElementById(id); }

  /* 选中直连必败的服务时，把中转的做法摊开，并给一个一键填入 */
  function renderGuide(id) {
    var box = $('csGuide');
    if (!box) return;
    var g = GUIDES[id];
    if (!g) { box.innerHTML = ''; box.style.display = 'none'; return; }
    var rows = g.relay.map(function (r) {
      return '<div class="ai-tip" style="margin-top:4px">'
        + '<b>' + esc(r.name) + '</b>　' + esc(r.how)
        + ' <button class="btn soft" data-relay="' + esc(r.url) + '">填入 ' + esc(r.url) + '</button>'
        + '</div>';
    }).join('');
    box.style.display = 'block';
    box.innerHTML = '<div class="ai-tip" style="margin-top:6px;color:#b4432f">' + esc(g.why) + '</div>'
      + '<div class="ai-tip" style="margin-top:4px">走本机中转即可用坚果云的账密存档：</div>'
      + rows
      + '<div class="ai-tip" style="margin-top:6px">不想装中转，就直接用上面的本地目录直存，一样能存能读。'
      + ' <button class="btn soft" id="csGoLocal">改用本地目录</button></div>';
    box.querySelectorAll('[data-relay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $('csUrl').value = this.getAttribute('data-relay');
        tip('已填入中转地址，接着点测试连接');
      });
    });
    var goLocal = $('csGoLocal');
    if (goLocal) goLocal.addEventListener('click', function () { $('csPick').focus(); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 提示只落在结果区一处；状态行只报当前目标，不重复消息 */
  function tip(msg, bad) {
    var box = $('csTip') || $('csOut');
    if (box) box.innerHTML = '<span' + (bad ? ' style="color:#b4432f"' : '') + '>' + esc(msg) + '</span>';
  }

  /* 通道一自带提示位：本通道的降级说明落在本通道内，不落面板底端 */
  function localTip(msg, bad) {
    var box = $('csLocalTip');
    if (box) box.innerHTML = '<span' + (bad ? ' style="color:#b4432f"' : '') + '>' + esc(msg) + '</span>';
  }

  function setState(msg) {
    var st = $('csStatus');
    if (st) st.textContent = msg;
  }

  function collectInputs() {
    var o = {};
    document.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.id || el.type === 'password' || el.type === 'file') return;
      if (el.type === 'checkbox' || el.type === 'radio') { o[el.id] = el.checked; return; }
      o[el.id] = el.value;
    });
    return o;
  }

  function collectOutput() {
    var ids = ['out', 'xxYanOut', 'xxMingOut', 'msNumOut', 'jsiMonth', 'detail', 'result'];
    var host = null;
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el && el.innerHTML && el.innerHTML.trim()) { host = el; break; }
    }
    if (!host) host = document.querySelector('.page');
    return host ? { html: host.innerHTML, text: (host.innerText || '').trim() } : { html: '', text: '' };
  }

  function aiChat() {
    if (typeof window.aiChatHistory === 'function') {
      try { return window.aiChatHistory(); } catch (e) { return []; }
    }
    return [];
  }

  function snapshot() {
    var snap = {
      schema: 'xj-snapshot/1',
      page: document.title || location.pathname,
      url: location.href,
      savedAt: new Date().toISOString(),
      inputs: collectInputs(),
      outputs: collectOutput(),
      note: ($('csNote') && $('csNote').value) || ''
    };
    if ($('csWithAi') && $('csWithAi').checked) snap.ai = aiChat();
    return snap;
  }

  function stamp() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  function fileName() {
    var base = (location.pathname.split('/').pop() || 'page').replace(/\.html?$/, '');
    var note = ($('csNote') && $('csNote').value || '').trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 20);
    return 'xj-' + base + '-' + stamp() + (note ? '-' + note : '') + '.json';
  }

  function pickDir() {
    if (!supported()) { localTip(NO_PICKER_TIP, true); return; }
    window.showDirectoryPicker({ mode: 'readwrite' }).then(function (h) {
      dirHandle = h;
      try { localStorage.setItem(DIR_KEY, h.name); } catch (e) {}
      idbSet(h);
      setState('已选 ' + h.name);
      tip('目录已就绪，可保存或查看存档');
    }).catch(function () { tip('未选择目录', true); });
  }

  /* 不支持目录选择的浏览器的通路：下载一份存档，或从文件读回 */
  function downloadSnap() {
    var snap = snapshot();
    if (!snap.outputs.text && !snap.outputs.html) { tip('本页尚无结果可存，请先排盘或起课', true); return; }
    var blob = new Blob([JSON.stringify(snap, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    tip('已下载 ' + a.download);
  }

  function importSnap(file) {
    if (!file) return;
    file.text().then(function (txt) { restoreSnap(JSON.parse(txt), file.name); })
      .catch(function (e) { tip('读取失败：' + (e && e.message ? e.message : e), true); });
  }

  /* 通道二：导出与复制沿用附加功能原钮；导入改由本件接收，读入后按存档输入重出结果。
     JSON 三键由 ai.js 在面板挂出后追加，故本件可重入：键未到位即返回，挂载点一变再试。 */
  function mountFileChannel() {
    var ch3 = $('csFile');
    if (!ch3 || ch3.dataset.done) return;
    var row = document.querySelectorAll('#aiBlock .ai-actions')[0];
    if (!row) return;
    var srcs = [];
    Array.prototype.slice.call(row.querySelectorAll('button')).forEach(function (b) {
      if (/JSON/.test((b.textContent || '').trim())) srcs.push(b);
    });
    if (!srcs.length) return;
    ch3.dataset.done = '1';
    srcs.forEach(function (src) {
      var label = (src.textContent || '').trim();
      src.style.display = 'none';
      if (/导入/.test(label)) return;
      var b = document.createElement('button');
      b.className = 'btn soft';
      b.textContent = label;
      b.addEventListener('click', function () { src.click(); });
      ch3.appendChild(b);
    });
    var file = document.createElement('input');
    file.type = 'file';
    file.accept = 'application/json,.json';
    file.style.display = 'none';
    file.addEventListener('change', function () { importSnap(this.files && this.files[0]); });
    ch3.appendChild(file);
    var imp = document.createElement('button');
    imp.className = 'btn soft';
    imp.textContent = '导入 JSON';
    imp.addEventListener('click', function () { file.click(); });
    ch3.appendChild(imp);
  }

  function saveLocal() {
    var snap = snapshot();
    if (!snap.outputs.text && !snap.outputs.html) { tip('本页尚无结果可存，请先排盘或起课', true); return; }
    var name = fileName();
    ensureDir().then(function (h) {
      if (!h) { tip('请先选择文件夹，或用下载存档', true); return; }
      return h.getFileHandle(name, { create: true })
        .then(function (fh) { return fh.createWritable(); })
        .then(function (w) { return w.write(JSON.stringify(snap, null, 1)).then(function () { return w.close(); }); })
        .then(function () { tip('已保存 ' + name + '，约 ' + Math.round(JSON.stringify(snap).length / 1024) + ' KB'); });
    }).catch(function (e) { tip('写入失败：' + (e && e.message ? e.message : e), true); });
  }

  function listFiles() {
    if (!dirHandle) { tip('请先选择文件夹', true); return Promise.resolve([]); }
    var names = [], it = dirHandle.entries();
    function step() {
      return it.next().then(function (r) {
        if (r.done) return names.sort().reverse();
        if (r.value[1].kind === 'file' && /^xj-.*\.json$/.test(r.value[0])) names.push(r.value[0]);
        return step();
      });
    }
    return step();
  }

  function restoreSnap(snap, name) {
    /* 兼容两种来源：本件存档的 inputs，与附加功能导出件的 data */
    var d = snap.inputs || snap.data || {};
    Object.keys(d).forEach(function (k) {
      var el = document.getElementById(k);
      if (!el) return;
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = d[k] === '1' || d[k] === true;
      else if (el.type !== 'file' && el.type !== 'password') el.value = d[k];
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
      try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    });
    var recast = window.xjRecast;
    if (typeof recast === 'function') {
      try {
        recast();
        tip('已按 ' + name + ' 还原，结果如上');
        scrollToResult();
        return;
      } catch (e) {}
    }
    /* 个别页未挂递归钩子，退回点本页主按钮 */
    var btn = document.querySelector('#lyCastBtn, #xxYanBtn, #msNumBtn, #jiDateBtn');
    if (btn) {
      btn.click();
      tip('已按 ' + name + ' 还原并触发排盘');
      scrollToResult();
      return;
    }
    tip('输入已按 ' + name + ' 填回，请点本页排盘按钮出结果');
  }

  /* 还原后把结果区送到眼前，免得以为没重排 */
  function scrollToResult() {
    var ids = ['out', 'xxYanOut', 'xxMingOut', 'msNumOut', 'jsiMonth'];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el && el.innerHTML && el.innerHTML.trim()) {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        return;
      }
    }
  }

  /* 存档管理做成一屏弹层：沿用站内历史记录的弹层与行结构，
     一行一份存档，右带读回与删除；下载与导入也收在这一屏里。 */
  function closeArchive() {
    var mask = $('csMask');
    if (mask) mask.classList.remove('show');
  }

  function openArchive(src) {
    src = src || 'local';
    var mask = $('csMask');
    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'csMask';
      mask.className = 'modal-mask';
      mask.setAttribute('role', 'dialog');
      mask.setAttribute('aria-label', '存档管理');
      mask.addEventListener('click', function (e) { if (e.target === mask) closeArchive(); });
      document.body.appendChild(mask);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeArchive(); });
    }
    mask.innerHTML = '<div class="modal hist-modal">'
      + '<span class="close" id="csMaskClose" aria-label="关闭">×</span>'
      + '<div class="ly-hist-head">' + (src === 'dav' ? '远端存档' : '本地存档') + '</div>'
      + '<div class="hist-list" id="csListBox"><div class="hist-empty">读取中</div></div>'
      + '<div class="sub-note hist-foot">点读回按该存档的输入重出结果；点叉号删除该存档。</div>'
      + '</div>';
    mask.classList.add('show');
    $('csMaskClose').addEventListener('click', closeArchive);
    loadArchiveList(src);
  }

  function renderArchive(rows) {
    var box = $('csListBox');
    if (!box) return;
    if (!rows.length) { box.innerHTML = '<div class="hist-empty">暂无存档。</div>'; return; }
    box.innerHTML = rows.map(function (r) {
      return '<div class="hist-row">'
        + '<span class="hist-t">' + esc(r.time || '') + (r.size ? '<br><span class="hist-q">' + esc(r.size) + '</span>' : '') + '</span>'
        + '<span class="hist-g">' + esc(r.name) + '</span>'
        + '<span class="hist-a">'
        + '<button class="btn hist-act" data-read="' + esc(r.name) + '">读回</button>'
        + '<button class="btn hist-del" data-del="' + esc(r.name) + '" aria-label="删除">×</button>'
        + '</span></div>';
    }).join('');
    box.querySelectorAll('[data-read]').forEach(function (b) {
      b.addEventListener('click', function () { readByName(this.getAttribute('data-read')); });
    });
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () { delByName(this.getAttribute('data-del')); });
    });
  }

  function loadArchiveList(src) {
    var box = $('csListBox');
    if (box) box.innerHTML = '<div class="hist-empty">读取中</div>';
    if (src === 'dav') { listDavRows(); return; }
    if (supported()) {
      ensureDir().then(function (h) {
        if (!h) { renderArchive([]); return; }
        listFiles().then(function (names) {
          if (!names.length) { renderArchive([]); return; }
          var rows = [], left = names.length;
          names.forEach(function (n) {
            h.getFileHandle(n).then(function (fh) { return fh.getFile(); })
              .then(function (f) { rows.push({ name: n, time: new Date(f.lastModified).toLocaleString(), size: Math.round(f.size / 1024) + ' KB' }); })
              .catch(function () { rows.push({ name: n, time: '', size: '' }); })
              .then(function () {
                if (--left === 0) { rows.sort(function (a, b) { return a.name < b.name ? 1 : -1; }); renderArchive(rows); }
              });
          });
        });
      }).catch(function (e) { tip('列目录失败：' + (e && e.message ? e.message : e), true); });
      return;
    }
    listDavRows();
  }

  function listDavRows() {
    var o = cfg();
    if (!o.url) { renderArchive([]); return; }
    fetch(o.url, { method: 'PROPFIND', headers: { Authorization: authHeader(o), Depth: '1' } })
      .then(function (r) { return r.ok || r.status === 207 ? r.text() : null; })
      .then(function (xml) {
        if (!xml) { renderArchive([]); return; }
        var names = [], re = /<[^>]*href[^>]*>([^<]+)</gi, m;
        while ((m = re.exec(xml))) {
          var b = decodeURIComponent(m[1]).split('/').pop();
          if (/^xj-.*\.json$/.test(b)) names.push(b);
        }
        names.sort().reverse();
        renderArchive(names.map(function (n) { return { name: n, time: '', size: '' }; }));
      })
      .catch(function () { renderArchive([]); });
  }

  function readByName(name) {
    if (name.indexOf('/') < 0 && dirHandle) return readLocal(name);
    return readDav(name);
  }

  function delByName(name) {
    if (supported()) {
      ensureDir().then(function (h) {
        if (!h) { tip('请先选择文件夹', true); return; }
        return h.removeEntry(name).then(function () {
          tip('已删除 ' + name);
          listLocal();
        });
      }).catch(function (e) { tip('删除失败：' + (e && e.message ? e.message : e), true); });
      return;
    }
    var o = cfg();
    if (!o.url) { tip('请先选择文件夹或填好 WebDAV 地址', true); return; }
    fetch(davUrl(name), { method: 'DELETE', headers: { Authorization: authHeader(o) } })
      .then(function (r) {
        if (r.ok || r.status === 204) { tip('已删除 ' + name); listDav(); return; }
        tip('删除失败：' + classify(null, r, o.url), true);
      })
      .catch(function (e) { tip(classify(e, null, o.url), true); });
  }

  function listLocal() {
    if (!supported()) { listDavRows(); return; }
    loadArchiveList();
  }

  function readLocal(name) {
    if (!name) { tip('请先在存档列表里选一份', true); return; }
    ensureDir().then(function (h) {
      if (!h) { tip('请先选择文件夹，或用导入存档', true); return; }
      return h.getFileHandle(name)
        .then(function (fh) { return fh.getFile(); })
        .then(function (f) { return f.text(); })
        .then(function (txt) { restoreSnap(JSON.parse(txt), name); });
    }).catch(function (e) { tip('读取失败：' + (e && e.message ? e.message : e), true); });
  }

  function cfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveCfg() {
    var o = {
      url: ($('csUrl') && $('csUrl').value || '').trim(),
      user: ($('csUser') && $('csUser').value || '').trim(),
      pass: ($('csPass') && $('csPass').value || '')
    };
    try { localStorage.setItem(CFG_KEY, JSON.stringify(o)); } catch (e) {}
    return o;
  }

  function clearCfg() {
    try { localStorage.removeItem(CFG_KEY); } catch (e) {}
    if ($('csPass')) $('csPass').value = '';
    tip('已清除本机保存的地址与凭据');
  }

  function authHeader(o) { return 'Basic ' + btoa(unescape(encodeURIComponent(o.user + ':' + o.pass))); }

  function classify(err, res, url) {
    if (location.protocol === 'https:' && /^http:\/\//i.test(url || '')) {
      return '被混合内容拦下：本站是 HTTPS，只能连 HTTPS 的 WebDAV 地址';
    }
    if (res && res.status === 401) return '认证失败：账号或应用密码不对';
    if (res && res.status === 403) return '无权限：该账号对此目录不可写';
    if (res && res.status === 404) return '路径不存在：检查地址末尾的目录是否已建好';
    if (res && res.status >= 500) return '服务端出错，状态 ' + res.status;
    if (err) return '跨域被拒或网络不通：对方服务器未放行本站来源，多数网盘如此，改用本地目录直存';
    return '未知错误';
  }

  function davUrl(name) {
    var o = cfg();
    var base = o.url || '';
    if (!base) return '';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    return base + encodeURIComponent(name);
  }

  /* 连不通时不留死路：先给一句话可做的事，再给替代通道 */
  function offerFallback(reason) {
    var box = $('csTip');
    if (!box) return;
    box.innerHTML = '<span class="cs-bad">' + esc(reason) + '</span>'
      + '<div class="ai-tip">该服务未允许跨域，浏览器不予读取其响应。可选两途：</div>'
      + '<div class="ai-tip">一、经中转服务接入：以 Alist 为例，在其后台 设置 之 站点 中开启 允许跨域，再将地址与账号改为中转服务的。</div>'
      + '<div class="ai-tip">二、改由通道一或通道二保存：存档写入本地文件夹，或导出为 JSON 文件。</div>'
      + '<div class="ai-actions">'
      + '<button class="btn soft" id="csFallbackLocal">改用本地文件夹</button>'
      + '<button class="btn soft" id="csFallbackRetry">我已开通，重试</button></div>';
    var a = $('csFallbackLocal'), b = $('csFallbackRetry');
    if (a) a.addEventListener('click', function () {
      var pk = $('csPick');
      if (pk) { pk.focus(); pk.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      tip('点选择文件夹，选一个本机目录即可存档与读回');
    });
    if (b) b.addEventListener('click', testDav);
  }

  function testDav() {
    var o = saveCfg();
    if (!o.url) { tip('请先填地址', true); return; }
    if (location.protocol === 'https:' && /^http:\/\//i.test(o.url)) {
      tip('被混合内容拦下：本站是 HTTPS，只能连 HTTPS 的 WebDAV 地址', true);
      return;
    }
    fetch(o.url, { method: 'PROPFIND', headers: { Authorization: authHeader(o), Depth: '0' } })
      .then(function (r) {
        if (r.status === 207) { tip('连接可用，对方回 207，是 WebDAV 服务'); return; }
        if (r.status === 200) { tip('该地址有响应但不像 WebDAV：探测未回 207，多半填成了网站根地址而非 WebDAV 目录', true); return; }
        tip('连接失败：' + classify(null, r, o.url), true);
      })
      .catch(function (e) { offerFallback('连不上：' + classify(e, null, o.url)); });
  }

  function saveDav() {
    var o = saveCfg();
    if (!o.url) { tip('请先填地址', true); return; }
    var snap = snapshot();
    if (!snap.outputs.text && !snap.outputs.html) { tip('本页尚无结果可存', true); return; }
    var name = fileName();
    if (location.protocol === 'https:' && /^http:\/\//i.test(o.url)) {
      tip('被混合内容拦下：本站是 HTTPS，只能连 HTTPS 的 WebDAV 地址', true);
      return;
    }
    fetch(davUrl(name), {
      method: 'PUT',
      headers: { Authorization: authHeader(o), 'Content-Type': 'application/json' },
      body: JSON.stringify(snap, null, 1)
    }).then(function (r) {
      var ok = r.ok || r.status === 201 || r.status === 204;
      tip(ok ? '已上传 ' + name : '上传失败：' + classify(null, r, o.url), !ok);
    }).catch(function (e) { tip(classify(e, null, o.url), true); });
  }

  function listDav() {
    if (!openArchiveIfClosed()) return;
    listDavRows();
  }

  /* 弹层没开就先开一屏，供远端列表与错误提示有处落脚 */
  function openArchiveIfClosed() {
    var mask = $('csMask');
    if (!mask || !mask.classList.contains('show')) { openArchive(); return true; }
    return true;
  }

  function readDav(name) {
    var o = saveCfg();
    if (!o.url) { tip('请先填地址', true); return; }
    if (!name) {
      /* 未指名则先取目录里最新的一份 */
      fetch(o.url, { method: 'PROPFIND', headers: { Authorization: authHeader(o), Depth: '1' } })
        .then(function (r) { return r.ok || r.status === 207 ? r.text() : null; })
        .then(function (xml) {
          if (!xml) { tip('列目录失败', true); return; }
          var names = [], re = /<[^>]*href[^>]*>([^<]+)</gi, m;
          while ((m = re.exec(xml))) {
            var b = decodeURIComponent(m[1]).split('/').pop();
            if (/^xj-.*\.json$/.test(b)) names.push(b);
          }
          if (!names.length) { tip('远端暂无存档', true); return; }
          names.sort().reverse();
          readDav(names[0]);
        })
        .catch(function (e) { tip(classify(e, null, o.url), true); });
      return;
    }
    fetch(davUrl(name), { method: 'GET', headers: { Authorization: authHeader(o) } })
      .then(function (r) {
        if (!r.ok) { tip('读取失败：' + classify(null, r, o.url), true); return null; }
        return r.text();
      })
      .then(function (txt) { if (txt) restoreSnap(JSON.parse(txt), name); })
      .catch(function (e) { tip(classify(e, null, o.url), true); });
  }

  function mount() {
    var block = document.getElementById('aiBlock');
    var body = block ? block.querySelector('.ai-body') : null;
    if (!body || document.getElementById('csBlock')) return;
    var opts = PRESETS.map(function (p) {
      return '<option value="' + p.id + '" data-url="' + esc(p.url) + '">' + esc(p.name) + '</option>';
    }).join('');
    var box = document.createElement('div');
    box.className = 'ai-cloud';
    box.id = 'csBlock';
    box.innerHTML = '<div class="cs-head"><b>数据存储</b></div>'
      + '<div class="cs-ch cs-common">'
      + '<div class="form-row"><div class="field" style="width:183px;flex:0 0 183px"><label for="csNote">备注</label><input type="text" id="csNote" placeholder="写入文件名" style="width:100%"></div>'
      + '<div class="field chk" style="width:auto;flex:0 0 auto"><input type="checkbox" id="csWithAi"><label for="csWithAi"><span>保存 AI 对话</span></label></div></div>'
      + '<div class="ai-tip">备注与保存 AI 对话，三个通道共用。</div>'
      + '</div>'
      + '<div class="cs-ch">'
      + '<div class="cs-ch-h">通道一　本地目录</div>'
      + '<div class="ai-actions"><button class="btn soft" id="csPick">选择文件夹</button>'
      + '<button class="btn soft" id="csSaveLocal">保存本次</button>'
      + '<button class="btn soft" id="csOpen">存档管理</button></div>'
      + '<div class="ai-tip" id="csLocalTip">存档写入选定文件夹，不经网络。<span id="csStatus">未选择目录</span></div>'
      + '</div>'
      + '<div class="cs-ch">'
      + '<div class="cs-ch-h">通道二　文件搬运</div>'
      + '<div class="ai-actions" id="csFile"></div>'
      + '<div class="ai-tip">导出文件可跨设备或分享；导入时按存档内的输入排出结果。</div>'
      + '</div>'
      + '<div class="cs-ch">'
      + '<div class="cs-ch-h">通道三　直连 WebDAV</div>'
      + '<div class="form-row"><div class="field"><label for="csPreset">服务</label><select id="csPreset">' + opts + '</select></div></div>'
      + '<div class="form-row"><div class="field" style="width:240px;max-width:100%;flex:0 0 240px"><label for="csUrl">地址</label><input type="text" id="csUrl" placeholder="https://.../dav/" style="width:100%"></div></div>'
      + '<div class="form-row">'
      + '<div class="field" style="width:240px;max-width:100%;flex:0 0 240px"><label for="csUser">账号</label><input type="text" id="csUser" style="width:100%"></div>'
      + '<div class="field" style="width:240px;max-width:100%;flex:0 0 240px"><label for="csPass">应用密码</label><input type="password" id="csPass" style="width:100%"></div>'
      + '</div>'
      + '<div class="ai-tip" id="csPresetNote"></div>'
      + '<div id="csGuide" style="display:none"></div>'
      + '<div class="ai-actions">'
      + '<button class="btn soft" id="csTest">测试连接</button>'
      + '<button class="btn soft" id="csSaveDav">上传本次</button>'
      + '<button class="btn soft" id="csListDav">远端存档</button>'
      + '<button class="btn soft" id="csClear">清除凭据</button></div>'
      + '<div class="ai-tip">须服务端允许跨域，浏览器方得读取响应；未开启时改用通道一或通道二。</div>'
      + '</div>'
      + '<div class="ai-tip" id="csTip"></div>';
    body.appendChild(box);

    $('csPick').addEventListener('click', pickDir);
    $('csSaveLocal').addEventListener('click', saveLocal);
    $('csOpen').addEventListener('click', function () { openArchive('local'); });
    /* 通道二：导出与复制沿用附加功能原钮；导入改由本件接收，读入后按存档输入重出结果 */
    mountFileChannel();
    $('csTest').addEventListener('click', testDav);
    $('csSaveDav').addEventListener('click', saveDav);
    $('csListDav').addEventListener('click', function () { openArchive('dav'); });
    $('csClear').addEventListener('click', clearCfg);

    $('csPreset').addEventListener('change', function () {
      var sel = this.options[this.selectedIndex];
      var id = this.value;
      var p = null;
      for (var i = 0; i < PRESETS.length; i++) { if (PRESETS[i].id === id) { p = PRESETS[i]; break; } }
      var url = sel.getAttribute('data-url') || '';
      if (url) $('csUrl').value = url;
      $('csPresetNote').textContent = p ? p.note : '';
      renderGuide(id);
    });

    var o = cfg();
    if (o.url) $('csUrl').value = o.url;
    if (o.user) $('csUser').value = o.user;
    var dn = '';
    try { dn = localStorage.getItem(DIR_KEY) || ''; } catch (e) {}
    if (dn) tip('上次用过目录 ' + dn + '，刷新后需重选');
  }

  window.cloudSnapshot = snapshot;
  /* 面板由 ai.js 挂出，挂出后可能再重挂一次；盯住挂载点，面板一换即把数据存储补回。 */
  function mountIfReady() {
    if (!document.querySelector('#aiBlock .ai-body')) return;
    if (document.getElementById('csBlock')) return;
    mount();
  }
  function watchHost() {
    var host = document.getElementById('aiMount');
    if (!host || host.__csWatch) return;
    host.__csWatch = true;
    try { new MutationObserver(function () { setTimeout(function () { mountIfReady(); mountFileChannel(); }, 0); }).observe(host, { childList: true, subtree: true }); } catch (e) {}
    setTimeout(function () { mountIfReady(); mountFileChannel(); }, 0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(watchHost, 0); });
  } else {
    setTimeout(watchHost, 0);
  }
  try { new MutationObserver(watchHost).observe(document.body, { childList: true }); } catch (e) {}
})();
