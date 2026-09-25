/* ============================================================
 * 统一字档分片加载器（assets/name-archive-loader.js）
 * 依赖：NAME_ARCHIVE_MANIFEST（name-archive-manifest.js）
 * 机制：
 *   - script 注入按需加载（CSP 无 unsafe-eval 亦可；file:// 双击可用）
 *   - 同会话内已注入/已在内存的分片不重复注入
 *   - IndexedDB 台账记录分片版本（命中仅作记录与快速跳过；不可用静默降级）
 *   - 收藏功能由页面底部附加功能模块承担，本器不做收藏（T16 复核修正）
 * ============================================================ */
window.NAME_ARCHIVE_LOADER = (function () {
  'use strict';

  var injected = {};   // file → true（本会话已注入）
  var pending = {};    // file → Promise

  function manifest() { return window.NAME_ARCHIVE_MANIFEST || null; }
  function shardOf(id) {
    var m = manifest(); if (!m) return null;
    for (var i = 0; i < m.shards.length; i++) if (m.shards[i].id === id) return m.shards[i];
    return null;
  }
  function present(shard) { return !!window[shard.global]; }

  function inject(shard) {
    return new Promise(function (resolve) {
      try {
        var s = document.createElement('script');
        s.src = 'assets/' + shard.file;
        s.onload = function () { injected[shard.file] = true; ledgerPut(shard); resolve(present(shard)); };
        s.onerror = function () { injected[shard.file] = true; resolve(false); };
        (document.head || document.documentElement).appendChild(s);
      } catch (e) { resolve(false); }
    });
  }

  /* ---- IndexedDB 台账（可选增强；任何异常静默降级） ---- */
  var DB = 'xuanji-archive', STORE = 'shards';
  function idbOpen() {
    return new Promise(function (resolve) {
      try {
        if (!window.indexedDB) return resolve(null);
        var rq = window.indexedDB.open(DB, 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE, { keyPath: 'file' }); };
        rq.onsuccess = function () { resolve(rq.result); };
        rq.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }
  function ledgerPut(shard) {
    idbOpen().then(function (db) {
      if (!db) return;
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ file: shard.file, version: shard.bytes + '@' + (window.NAME_ARCHIVE_MANIFEST.built || ''), ts: Date.now() });
      } catch (e) { /* 降级 */ }
    });
  }
  function ledgerAll() {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve) {
        if (!db) return resolve([]);
        try {
          var rq = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
          rq.onsuccess = function () { resolve(rq.result || []); };
          rq.onerror = function () { resolve([]); };
        } catch (e) { resolve([]); }
      });
    });
  }

  /* ensure('semantic') / ensure(['semantic','chars-ab']) → Promise<boolean>（全部分片就绪） */
  function ensure(ids) {
    var m = manifest();
    if (!m) return Promise.resolve(false);
    if (!Array.isArray(ids)) ids = [ids];
    var jobs = ids.map(function (id) {
      var shard = shardOf(id);
      if (!shard) return Promise.resolve(false);
      if (present(shard)) return Promise.resolve(true);              // 已在内存
      if (pending[shard.file]) return pending[shard.file];           // 注入中
      injected[shard.file] = false;
      var p = inject(shard);
      pending[shard.file] = p;
      return p;
    });
    return Promise.all(jobs).then(function (r) { return r.every(Boolean); });
  }

  return { ensure: ensure, ledgerAll: ledgerAll, _injected: injected };
})();
