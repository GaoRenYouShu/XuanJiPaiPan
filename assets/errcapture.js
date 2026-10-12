/* 前端错误捕获：线上 JS 报错进本地环形缓冲，DSN 非空时直投 Sentry。
 *
 * 为什么有这件：站点上线后前端报错全靠访客开口，报错本身无声消失。本件在每页最早
 *   挂上 window error 与 unhandledrejection 两类钩子，报错进 localStorage 环形缓冲
 *   （容量五十条，键 xuanji-errlog，控制台 XUANJI.errDump() 可导出）；
 *   DSN 配置非空时另以最小信封直投 Sentry ingest（自写约三十行，不引 80KB SDK）。
 *
 * 接入位（启用外发的唯一一步）：把下面 ERR_DSN 换成 Sentry 免费档的项目 DSN 即生效；
 *   空串（缺省）＝纯本地缓冲，零外发、零开销。启用后须同批做两件事，机器核核对不上即拦下：
 *   一、开源页的"站外数据服务"分组已有 sentry.io 条目：登记与页面文字只写服务域名，另把 DSN 里的端点 host 加进站外端点核对件的别名表（映射为 sentry.io），两端点由该件核对；
 *   二、确认本页 CSP 的 connect-src 放行该 host（现行 connect-src 放行全部 https，已覆盖）。
 *   详细步骤见运维手册（docs 目录下监控预览与回滚一档）。
 *
 * 限速：单次页面会话最多外发十条，防错误风暴打爆配额。上报字段：message、所在文件与
 *   行列号、页面地址、UA、时刻；不含任何排盘数据。堆栈缺省不发（ERR_STACK 开关）：
 *   堆栈里有内部文件名与函数名，属实现细节，按站点红线缺省不出站，深排疑难时临时打开。
 * 本件由 app.js 开头动态挂载（async=false 保序），装载失败静默，不碍任何排盘功能。
 */
'use strict';
(function () {
  var ERR_DSN = 'https://c1047a46ae75807aaf8344094f80bbe1@o4512235212111872.ingest.us.sentry.io/4512235818647552';   // Sentry 错误收件；置空串即回到纯本地缓冲
  var ERR_STACK = false;   // 堆栈外发开关，缺省关：堆栈含内部文件名与函数名，缺省不出站；深排疑难时临时置 true

  var KEY = 'xuanji-errlog';
  var CAP = 50;
  var SENT = 0;
  var LIMIT = 10;

  function ring(entry) {
    try {
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { arr = []; }
      arr.push(entry);
      while (arr.length > CAP) arr.shift();
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) { /* 隐私模式等存不进就算了 */ }
  }

  /* DSN 解析：取公钥、机构主机、项目号，拼 envelope 端点；解析不出即不外发 */
  function dsnEndpoint() {
    if (!ERR_DSN) return null;
    var m = /^https:\/\/([^@]+)@([^/]+)\/(\d+)/.exec(ERR_DSN);
    if (!m) return null;
    return { url: 'https://' + m[2] + '/api/' + m[3] + '/envelope/', pub: m[1], host: m[2] };
  }

  /* 外发范围与 cf-beacon 同口径：只在正式站外发（主机名与路径前缀两道判，预览站与
     正式站同主机名仅路径之别，须看 pathname）。非正式站报错只进本地环形缓冲，
     测试性报错不混进生产错误面板。 */
  function onLiveSite() {
    if (location.hostname !== 'gaorenyoushu.github.io') return false;
    var p = location.pathname;
    if (p.indexOf('/XuanJiPaiPan-preview') === 0) return false;
    return p.indexOf('/XuanJiPaiPan') === 0;
  }

  function send(entry) {
    if (!onLiveSite()) return;
    var ep = dsnEndpoint();
    if (!ep || SENT >= LIMIT) return;
    SENT++;
    var ex = { type: entry.type, value: entry.message };
    /* 堆栈与函数名按 ERR_STACK 判，缺省不出站；所在文件与行列号随报错走（文件名本就是
       开源页公开清单里的内容），供定位到行而不暴露调用结构 */
    if (ERR_STACK && entry.stack) {
      ex.stacktrace = { frames: [{ filename: entry.source, lineno: entry.line, colno: entry.col, function: String(entry.stack).split('\n')[1] || '' }] };
    }
    var event = {
      event_id: entry.id, timestamp: entry.at, platform: 'javascript',
      level: 'error', logger: 'errcapture',
      message: entry.message,
      request: { url: entry.page, headers: { 'User-Agent': entry.ua } },
      exception: { values: [ex] },
      extra: { source: entry.source, line: entry.line, col: entry.col }
    };
    var envelope = JSON.stringify({ event_id: entry.id, sent_at: entry.at, dsn: ERR_DSN }) + '\n'
      + JSON.stringify({ type: 'event' }) + '\n' + JSON.stringify(event) + '\n';
    try {
      fetch(ep.url, { method: 'POST', headers: { 'Content-Type': 'application/x-sentry-envelope', 'X-Sentry-Auth': 'Sentry sentry_version=7, sentry_key=' + ep.pub }, body: envelope, keepalive: true })
        .catch(function () { /* 网络失败静默：缓冲里还在 */ });
    } catch (e) { /* fetch 不存在的老环境静默 */ }
  }

  function capture(type, message, source, line, col, stack) {
    var entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: new Date().toISOString(), type: type || 'Error',
      message: String(message || '').slice(0, 500),
      source: String(source || '').slice(0, 300), line: line || 0, col: col || 0,
      stack: String(stack || '').slice(0, 2048),
      page: location.href, ua: navigator.userAgent
    };
    ring(entry);
    send(entry);
    return entry;
  }

  window.addEventListener('error', function (e) {
    if (e && e.message) capture('Error', e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    capture('UnhandledRejection', (r && (r.message || String(r))) || 'unhandled rejection', '', 0, 0, r && r.stack);
  });

  /* 诊断口：控制台 XUANJI.errDump() 导出本地缓冲，XUANJI.errTest() 造一条测试报错验链路 */
  window.XUANJI = window.XUANJI || {};
  window.XUANJI.errDump = function () {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  };
  window.XUANJI.errTest = function () { return capture('Test', 'errcapture 链路测试', location.href, 0, 0, new Error('test').stack); };
})();
