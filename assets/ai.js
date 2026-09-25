/* 全站 AI 解析模块：多模型对比、MD 渲染、对话、跨页配置同步
   配置存 localStorage + window.name 双通道：localStorage 同源跨页持久，window.name 兜底 file:// 同标签页。
   每页通过 mountAI(getContext, pageTitle) 挂载面板
   历史记录：每条消息带 models 数组，标明该消息归属哪些模型，实现各模型对话独立显示。 */

const AI_CFG_KEY = 'xuanji_ai_cfg_v3';
const ENC_MARKER = '__ai_enc';

/* ========== API Key 本地加密存储 ==========
   公网部署场景：API Key 存 localStorage/window.name 时以 AES-GCM 加密，防爬虫/XSS 扫明文。
   两种密钥模式任选其一（同一时刻只用一种，存储结构以 __ai_enc 字段区分，互不冲突）：
   1) 设备绑定（默认）：密钥由 location.origin + 浏览器 UA 片段经 SHA-256 派生，同源同浏览器自动解密；
      清浏览器数据、换设备、换浏览器、换域名后密钥失效，API Key 无法解密，需重新填写。
   2) 本地口令：用户自设口令，PBKDF2（SHA-256，10 万次迭代）派生密钥；salt 存 localStorage 保证同站点多页面共用，
      派生密钥仅驻 sessionStorage 内存，关闭标签页即丢失，重开需重新验证口令（或重填 Key）。
   3) 不支持 crypto.subtle 的环境（非 HTTPS/localhost 旧浏览器）退化为 XOR+Base64 弱混淆，仅防 grep 明文。
   内存中 apiKey 仍为明文（fetch 需 Bearer 原文），安全边界在落盘/跨窗口传递链路。 */

const AI_PW_SALT_KEY = 'xuanji_ai_pwsalt';
const AI_PW_SESS = 'xuanji_ai_pwsess';
const ENC_DEVICE = 1; // 设备绑定模式密文
const ENC_PASSWORD = 2; // 本地口令模式密文

function _b64encode(buf){
  const s = String.fromCharCode.apply(null, new Uint8Array(buf));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function _b64decode(str){
  str = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const s = atob(str);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}
const _CRYPTO_OK = !!(window.crypto && window.crypto.subtle && window.crypto.subtle.importKey && window.crypto.subtle.encrypt);
const _TEXT_ENC = new TextEncoder();
const _TEXT_DEC = new TextDecoder();

/* 设备绑定密钥材料：同源+浏览器稳定，用作默认加密密钥源 */
function _deviceKeyMaterial(){
  return _TEXT_ENC.encode('xuanji-ai-v3::' + (location.origin || 'file') + '::' + (navigator.userAgent || '').slice(0, 80));
}

/* 口令派生密钥：PBKDF2 100k 次，随机 salt */
async function _keyFromPassword(pass, salt){
  const pw = _TEXT_ENC.encode(pass);
  const base = await crypto.subtle.importKey('raw', pw, {name:'PBKDF2'}, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' },
    base,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}

/* 默认设备绑定密钥（非口令） */
let _deviceKeyPromise = null;
function _deviceKey(){
  if (_deviceKeyPromise) return _deviceKeyPromise;
  _deviceKeyPromise = (async () => {
    if (!_CRYPTO_OK) return null;
    const mat = _deviceKeyMaterial();
    const d = await crypto.subtle.digest('SHA-256', mat);
    return crypto.subtle.importKey('raw', d, {name:'AES-GCM'}, false, ['encrypt','decrypt']);
  })();
  return _deviceKeyPromise;
}

/* 本地口令模式：派生密钥仅驻内存（sessionStorage 仅作“本标签页已验证”标记），关页即失 */
let _passwordKeyPromise = null;
let _passwordSalt = null; // 持久化在 localStorage，供同站点多页面共享同一派生参数
function _hasPasswordSession(){ try { return !!sessionStorage.getItem(AI_PW_SESS); }catch(e){ return false; } }
function _loadSalt(){
  try {
    const s = localStorage.getItem(AI_PW_SALT_KEY);
    if (s) return _b64decode(s);
  }catch(e){}
  return null;
}
function _saveSalt(salt){
  try { localStorage.setItem(AI_PW_SALT_KEY, _b64encode(salt)); }catch(e){}
}
async function ensurePasswordMode(pass){
  if (!_CRYPTO_OK) throw new Error('当前环境不支持加密（需 HTTPS 或 localhost）');
  let salt = _loadSalt();
  if (!salt){
    salt = crypto.getRandomValues(new Uint8Array(16));
    _saveSalt(salt);
  }
  _passwordSalt = salt;
  _passwordKeyPromise = _keyFromPassword(pass, salt);
  // 标记本标签页已验证口令（仅标记，不存口令本身）
  try { sessionStorage.setItem(AI_PW_SESS, '1'); }catch(e){}
  return _passwordKeyPromise;
}
function exitPasswordMode(){
  _passwordKeyPromise = null;
  _passwordSalt = null;
  try { sessionStorage.removeItem(AI_PW_SESS); }catch(e){}
  try { localStorage.removeItem(AI_PW_SALT_KEY); }catch(e){}
}
/* 当前是否处于口令模式（已派生且 session 存在） */
function isPasswordMode(){
  return _CRYPTO_OK && _passwordKeyPromise && _hasPasswordSession();
}

/* 加密字符串：mode 缺省取当前模式（设备绑定/口令），降级时走弱混淆 */
async function _encryptStr(plain, mode){
  if (plain == null) return null;
  if (!_CRYPTO_OK){
    const k = _deviceKeyMaterial();
    const u = _TEXT_ENC.encode(String(plain));
    const r = new Uint8Array(u.length);
    for (let i = 0; i < u.length; i++) r[i] = u[i] ^ k[i % k.length];
    return { [ENC_MARKER]: 0, data: _b64encode(r) };
  }
  const usePw = (mode === ENC_PASSWORD) || (!mode && isPasswordMode());
  const key = usePw ? await _passwordKeyPromise : await _deviceKey();
  const encTag = usePw ? ENC_PASSWORD : ENC_DEVICE;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, _TEXT_ENC.encode(String(plain)));
  return { [ENC_MARKER]: encTag, v: 1, iv: _b64encode(iv), ct: _b64encode(ct) };
}

/* 解密字符串；enc=1 设备密钥，enc=2 口令密钥，enc=0 弱混淆；返回明文或 null */
async function _decryptStr(blob){
  if (blob == null) return null;
  if (typeof blob === 'string') return blob; // 明文格式
  if (typeof blob !== 'object') return null;
  if (!blob[ENC_MARKER] && typeof blob.ct === 'string') blob[ENC_MARKER] = ENC_DEVICE; // 容错
  if (blob[ENC_MARKER] === 0){
    const k = _deviceKeyMaterial();
    try {
      const u = _b64decode(blob.data);
      const r = new Uint8Array(u.length);
      for (let i = 0; i < u.length; i++) r[i] = u[i] ^ k[i % k.length];
      return _TEXT_DEC.decode(r);
    }catch(e){ return null; }
  }
  if ((blob[ENC_MARKER] === ENC_DEVICE || blob[ENC_MARKER] === ENC_PASSWORD) && blob.iv && blob.ct){
    try {
      let key;
      if (blob[ENC_MARKER] === ENC_PASSWORD){
        // 口令模式密文：需要本标签页已验证口令
        if (!_passwordKeyPromise || !_hasPasswordSession()) return null;
        key = await _passwordKeyPromise;
      } else {
        key = await _deviceKey();
      }
      const iv = _b64decode(blob.iv);
      const ct = _b64decode(blob.ct);
      const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
      return _TEXT_DEC.decode(pt);
    }catch(e){ return null; }
  }
  return null;
}

/* 加密配置中的所有 apiKey 字段（返回新对象，不改原对象） */
async function _encryptCfg(cfg){
  if (!cfg || typeof cfg !== 'object') return cfg;
  const out = Array.isArray(cfg) ? cfg.slice() : Object.assign({}, cfg);
  if (Array.isArray(out.models)){
    out.models = await Promise.all(out.models.map(async (m) => {
      if (!m || typeof m !== 'object') return m;
      const nm = Object.assign({}, m);
      if (typeof nm.apiKey === 'string' && nm.apiKey.length > 0){
        nm.apiKey = await _encryptStr(nm.apiKey);
      }
      return nm;
    }));
  }
  // 加密版本标记
  out._v = 3;
  return out;
}

/* 解密配置中的所有 apiKey 字段；自动把旧明文配置视为已解密 */
async function _decryptCfg(cfg){
  if (!cfg || typeof cfg !== 'object') return cfg;
  const out = Array.isArray(cfg) ? cfg.slice() : Object.assign({}, cfg);
  let anyPlain = false;
  if (Array.isArray(out.models)){
    out.models = await Promise.all(out.models.map(async (m) => {
      if (!m || typeof m !== 'object') return m;
      const nm = Object.assign({}, m);
      if (nm.apiKey && typeof nm.apiKey === 'object' && (ENC_MARKER in nm.apiKey)){
        nm.apiKey = await _decryptStr(nm.apiKey);
      } else if (typeof nm.apiKey === 'string'){
        anyPlain = true; // 旧明文
      }
      return nm;
    }));
  }
  out._plainMigrated = anyPlain;
  return out;
}

/* 读取配置：优先 localStorage，window.name 作为同标签页兜底、互补
   文件协议、隐私模式、localStorage 被禁等场景下，window.name 仍可跨页传递。
   解密在读取时一次性完成；返回值中 apiKey 为明文（内存中）。 */
/* 内存缓存：getAiCfg 同步从缓存读；初始化与写入时异步解密/加密 */
let __aiCfgCache = null;
let __aiCfgReady = null; // Promise：初始加载完成后 resolve
let __aiWriteQ = Promise.resolve(); // 串行写队列，避免并发覆盖

function _readRawEncrypted(key){
  // 读取加密 blob（localStorage 或 window.name 内的 raw JSON 字符串）
  let ls = null; try { ls = localStorage.getItem(key); }catch(e){}
  if (ls){ try { const o = JSON.parse(ls); if (o && typeof o === 'object') return { src:'ls', raw: o }; }catch(e){} }
  let wn = null;
  try { const n = JSON.parse(window.name || '{}'); if (n && n.__xuanji_ai) wn = n.__xuanji_ai; }catch(e){}
  if (!wn && window.top && window.top !== window){
    try { const n = JSON.parse(window.top.name || '{}'); if (n && n.__xuanji_ai) wn = n.__xuanji_ai; }catch(e){}
  }
  if (!wn && window.opener && window.opener !== window){
    try { const n = JSON.parse(window.opener.name || '{}'); if (n && n.__xuanji_ai) wn = n.__xuanji_ai; }catch(e){}
  }
  if (wn && typeof wn === 'object') return { src:'wn', raw: wn };
  return { src:'none', raw: {} };
}

async function _loadCfgOnce(){
  const fresh = _readRawEncrypted(AI_CFG_KEY);
  let chosen = (fresh.raw && typeof fresh.raw === 'object') ? fresh.raw : {};
  const dec = await _decryptCfg(chosen);
  if (dec._plainMigrated){
    // 存储不变量：落盘的 apiKey 一律为密文；读到明文即重写为密文
    delete dec._plainMigrated;
    setAiCfg(dec, true);
  }
  __aiCfgCache = dec;
  return dec;
}

function getAiCfg(){
  if (__aiCfgCache) return __aiCfgCache;
  // 首次同步调用：异步解密未完成时，返回空壳避免把加密对象泄漏给业务 fetch
  if (!__aiCfgReady){
    __aiCfgCache = {};
    __aiCfgReady = _loadCfgOnce();
  }
  return __aiCfgCache;
}

function setAiCfg(c, silent){
  c = c || {};
  c.ts = Date.now();
  c._v = 3;
  // 同步更新内存缓存（apiKey 在内存中保持明文，业务无感知）
  __aiCfgCache = c;
  // 异步加密写盘（串行化）
  __aiWriteQ = __aiWriteQ.then(async () => {
    try {
      const enc = await _encryptCfg(c);
      const encStr = JSON.stringify(enc);
      // localStorage
      try { localStorage.setItem(AI_CFG_KEY, encStr); }catch(e){}
      // window.name 同标签页兜底
      try {
        let n = {}; try { n = JSON.parse(window.name || '{}'); }catch(e){ n = {}; }
        n.__xuanji_ai = enc;
        window.name = JSON.stringify(n);
      }catch(e){}
      // iframe 顶层
      try {
        if (window.top && window.top !== window){
          let n = {}; try { n = JSON.parse(window.top.name || '{}'); }catch(e){ n = {}; }
          n.__xuanji_ai = enc;
          window.top.name = JSON.stringify(n);
        }
      }catch(e){}
      // 互相备份
      try {
        const ls = localStorage.getItem(AI_CFG_KEY);
        const nameObj = JSON.parse(window.name || '{}');
        const nameCfg = nameObj.__xuanji_ai;
        if (!ls && nameCfg){
          try { localStorage.setItem(AI_CFG_KEY, JSON.stringify(nameCfg)); }catch(e){}
        } else if (ls && !nameCfg){
          nameObj.__xuanji_ai = JSON.parse(ls); window.name = JSON.stringify(nameObj);
        }
      }catch(e){}
    }catch(e){ /* 加密失败时不阻塞业务 */ }
  });
}

/* 页面加载时触发初始解密；setAiCfg 内部会在解密后自动双写备份 */
(function migrateAiCfg(){
  __aiCfgReady = _loadCfgOnce().catch(e => { __aiCfgCache = {}; return {}; });
})();

/* 跨标签页、窗口广播同步：配置保存后自动通知其它已打开的页面 */
(function listenAiBroadcast(){
  try {
    if (typeof BroadcastChannel !== 'undefined'){
      const bc = new BroadcastChannel('xuanji_ai');
      bc.onmessage = function(ev){
        try {
          const data = JSON.parse(ev.data);
          if (data && data.type === 'xuanji_ai_cfg' && data.cfg && data.cfg.models){
            setAiCfg(data.cfg, true);
            document.querySelectorAll('.ai-status').forEach(refreshAiStatus);
            try { refreshAiPanel(true); }catch(e){}
          }
        }catch(e){}
      };
    }
  }catch(e){}
})();

function aiModels(){ const c = getAiCfg(); return c.models || []; }
function normBase(u){ return (u || '').trim().replace(/\/+$/, ''); }

/* ---- 简易 Markdown → HTML ---- */
function md2html(md){
  if (!md) return '';
  let h = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code>${code.trim()}</code></pre>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  h = h.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/\*(.+?)\*/g, '<i>$1</i>');
  h = h.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  h = h.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  const paras = h.split(/\n{2,}/);
  h = paras.map(p => {
    if (/^<(h[2-4]|ul|pre|li|code)/.test(p.trim())) return p.trim();
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  return h;
}
function escapeHtml(s){
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---- 配置弹窗（多模型管理）---- */
function ensureAiModal(){
  if (document.getElementById('aiCfgMask')) return;
  const div = document.createElement('div');
  div.className = 'modal-mask'; div.id = 'aiCfgMask';
  div.innerHTML = `<div class="modal ai-cfg">
    <div class="ai-form" id="aiCfgForm">
    <header class="ai-cfg-head">
      <span class="close" onclick="closeAiConfig()">×</span>
      <h3>AI 解析配置<i></i><em>多模型管理</em></h3>
      <p>填写任意 OpenAI 兼容服务，多模型可并行对比；Key 仅存本机浏览器，不上传服务器。</p>
    </header>

    <section class="ai-sec">
      <div class="ai-sec-t"><span class="ai-sec-no">壹</span>服务商</div>
      <label>已存服务商（快速填入）
        <select id="aiQuick" onchange="quickFillProvider()"><option value="">选择已存服务商</option></select>
      </label>
      <div class="row">
        <label>模型昵称
          <input id="aiNick" placeholder="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        </label>
        <label>服务商名称
          <input id="aiProvider" placeholder="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        </label>
      </div>
      <label>接口地址 Base URL
        <input id="aiBase" placeholder="https://api.xxxxx.com/v1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </label>
    </section>

    <section class="ai-sec">
      <div class="ai-sec-t"><span class="ai-sec-no">贰</span>密钥与加密</div>
      <label>API Key
        <input id="aiKey" type="password" placeholder="sk-..." autocomplete="new-password" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-form-type="other">
      </label>
      <div class="ai-enc">
        <span id="aiEncModeTip">本地加密：设备绑定（默认）</span>
        <button class="btn soft" onclick="setLocalPassword()">设置本地口令加密</button>
        <button class="btn soft" id="aiClearPwBtn" style="display:none" onclick="clearLocalPassword()">清除口令（恢复设备绑定）</button>
      </div>
      <details class="ai-help">
        <summary>加密机制与本地代理说明</summary>
        <p>设备绑定加密下，Key 仅在本机当前浏览器可解；清除浏览器数据、更换浏览器或访问域名变化后需重填。口令加密的口令仅存于当前标签页，关闭即失。</p>
        <p>本地 file:// 或服务商禁 CORS 时，改用 https 部署，或自建一个转发到上游的本地代理，再把 Base URL 填为该代理地址。</p>
      </details>
    </section>

    <section class="ai-sec">
      <div class="ai-sec-t"><span class="ai-sec-no">叁</span>模型</div>
      <div class="row">
        <label>模型名
          <select id="aiModel"><option value="">（先获取或手填）</option></select>
        </label>
        <button class="btn gold" onclick="fetchAiModels()">获取模型</button>
      </div>
      <label>或手动输入
        <input id="aiModelManual" placeholder="">
      </label>
      <div id="aiCfgMsg" class="ai-tip"></div>
    </section>

    <div class="ai-actions">
      <div class="ai-act-main">
        <button class="btn gold" onclick="testAiConfig()">测试连接</button>
        <button class="btn" onclick="saveAiConfig()">保存此模型</button>
        <button class="btn soft" onclick="broadcastAiConfig()">一键应用到所有页面</button>
      </div>
      <div class="ai-act-file">
        <button class="btn soft" onclick="exportAiConfig(false)">导出配置（不含Key）</button>
        <button class="btn soft" onclick="exportAiConfig(true)" title="加密导出包含 API Key，导入时需输入同一口令">加密导出（含Key）</button>
        <button class="btn soft" onclick="importAiConfig()">导入配置</button>
        <input type="file" id="aiCfgFile" style="display:none" accept="application/json,.json" onchange="handleImportAiConfig(this)">
      </div>
    </div>

    <section class="ai-sec ai-saved">
      <div class="ai-sec-t"><span class="ai-sec-no">肆</span>已保存模型<span class="ai-sec-note">勾选启用，排盘时并行对比</span></div>
      <div id="aiModelList"></div>
    </section>
    </div>
  </div>`;
  document.body.appendChild(div);
}
function renderModelList(){
  const list = aiModels();
  const el = document.getElementById('aiModelList');
  if (!el) return;
  el.innerHTML = list.length ? list.map((m, i) => `<div class="ai-model-row">
    <input type="checkbox" class="ai-model-chk" data-idx="${i}" ${m.enabled !== false ? 'checked' : ''} onchange="toggleModel(${i},this.checked)">
    <span class="ai-model-name" title="${escapeHtml(m.provider || '')} ${escapeHtml(m.model || '')}">${escapeHtml(m.name || m.model || '')}</span>
    <button class="ai-model-del" onclick="removeModel(${i})">删除</button>
  </div>`).join('') : '<div style="font-size:12px;color:var(--ink2)">（尚未保存任何模型）</div>';
}

function toggleModel(idx, on){
  const c = getAiCfg(); if (!c.models) c.models = [];
  if (c.models[idx]) c.models[idx].enabled = on;
  setAiCfg(c);
}

function removeModel(idx){
  const c = getAiCfg(); if (!c.models) return;
  c.models.splice(idx, 1); setAiCfg(c);
  renderModelList();
}

function openAiConfig(){
  ensureAiModal();
  const models = aiModels();
  if (models.length && !document.getElementById('aiBase').value){
    const last = models[models.length - 1];
    document.getElementById('aiProvider').value = last.provider || '';
    document.getElementById('aiBase').value = last.baseUrl || '';
    document.getElementById('aiKey').value = last.apiKey || '';
  }
  document.getElementById('aiCfgMsg').textContent = '';
  const seen = {}, provs = [];
  models.forEach(m => {
    const k = m.baseUrl + '||' + (m.apiKey || '').slice(0, 8);
    if (!seen[k]){
      seen[k] = true;
      provs.push({ name: m.provider || '无', baseUrl: m.baseUrl, apiKey: m.apiKey || '' });
    }
  });
  const sel = document.getElementById('aiQuick');
  sel.innerHTML = '<option value="">选择已存服务商</option>' + provs.map((p, i) => `<option value="${i}">${escapeHtml(p.name)} ${escapeHtml(p.baseUrl)}</option>`).join('');
  window.__aiQuickProvs = provs;
  renderModelList();
  refreshEncModeTip();
  document.getElementById('aiCfgMask').classList.add('show');
}

function quickFillProvider(){
  const idx = parseInt(document.getElementById('aiQuick').value, 10);
  if (isNaN(idx) || !window.__aiQuickProvs || !window.__aiQuickProvs[idx]) return;
  const p = window.__aiQuickProvs[idx];
  document.getElementById('aiProvider').value = p.name;
  document.getElementById('aiBase').value = p.baseUrl;
  document.getElementById('aiKey').value = p.apiKey;
}
function closeAiConfig(){ const m = document.getElementById('aiCfgMask'); if (m) m.classList.remove('show'); }

/* 刷新弹窗内“本地加密模式”提示与按钮可见性 */
function refreshEncModeTip(){
  const tip = document.getElementById('aiEncModeTip');
  const clearBtn = document.getElementById('aiClearPwBtn');
  if (!tip) return;
  if (isPasswordMode()){
    tip.textContent = '本地加密：口令模式（关页即失，重开需重设）';
    if (clearBtn) clearBtn.style.display = 'inline-block';
  } else {
    tip.textContent = '本地加密：设备绑定（默认）';
    if (clearBtn) clearBtn.style.display = 'none';
  }
}

/* 设置本地口令加密：弹出口令 → PBKDF2 派生 → 当前及后续保存的 Key 以口令加密落盘 */
async function setLocalPassword(){
  if (!_CRYPTO_OK){ alert('当前环境不支持加密（需 HTTPS 或 localhost）'); return; }
  const pass = prompt('设置本地加密口令（至少 4 位，仅停留当前标签页，关闭即失，请牢记）：');
  if (!pass) return;
  if (pass.length < 4){ alert('口令至少 4 位'); return; }
  try {
    await ensurePasswordMode(pass);
    // 若已有配置，立即按口令模式重写落盘（不改动内存明文，仅加密落盘）
    const cfg = getAiCfg();
    if (cfg && cfg.models && cfg.models.length){
      setAiCfg(cfg, true);
    }
    refreshEncModeTip();
    const msg = document.getElementById('aiCfgMsg');
    if (msg) msg.textContent = '已启用本地口令加密，当前及后续保存的 Key 以口令加密。';
  }catch(e){ alert('设置失败：' + e.message); }
}

/* 清除本地口令加密：退出口令模式，恢复设备绑定（已有 Key 立即按设备绑定重写落盘） */
function clearLocalPassword(){
  exitPasswordMode();
  const cfg = getAiCfg();
  if (cfg && cfg.models && cfg.models.length){
    setAiCfg(cfg, true);
  }
  refreshEncModeTip();
  const msg = document.getElementById('aiCfgMsg');
  if (msg) msg.textContent = '已清除口令加密，恢复设备绑定模式。';
}

async function fetchAiModels(){
  const base = normBase(document.getElementById('aiBase').value);
  const key = document.getElementById('aiKey').value.trim();
  const msg = document.getElementById('aiCfgMsg');
  if (!base || !key){ msg.textContent = '请先填写接口地址与 API Key'; return; }
  msg.textContent = '正在获取模型列表…';
  try{
    const r = await fetch(base + '/models', { headers: { 'Authorization': 'Bearer ' + key } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const list = (j.data || j.models || []).map(m => m.id || m.name).filter(Boolean).sort();
    if (!list.length) throw new Error('返回空列表');
    const sel = document.getElementById('aiModel');
    sel.innerHTML = list.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    msg.textContent = '已获取 ' + list.length + ' 个模型，请选择。';
  }catch(e){ msg.textContent = '获取失败：' + aiErrText(e) + '（可在下方手动输入）'; }
}
function aiErrText(e){
  const m = (e && e.message) || '';
  if (/NetworkError|Failed to fetch|load failed|TypeError/i.test(m)){
    let s = '网络、跨域被拦截。';
    if (typeof location !== 'undefined' && location.protocol === 'file:') s += ' 你正以 file:// 打开页面，会被 CORS 拦截。请改用 https 部署，或自建本地转发代理。';
    else s += ' 请确认 Base URL 正确且可访问。';
    return s;
  }
  return m || '未知错误';
}
function collectCfg(){
  const manual = document.getElementById('aiModelManual').value.trim();
  return {
    name: document.getElementById('aiNick').value.trim() || manual || document.getElementById('aiModel').value,
    provider: document.getElementById('aiProvider').value.trim(),
    baseUrl: normBase(document.getElementById('aiBase').value),
    apiKey: document.getElementById('aiKey').value.trim(),
    model: manual || document.getElementById('aiModel').value,
    enabled: true
  };
}
function saveAiConfig(){
  const m = collectCfg();
  const msg = document.getElementById('aiCfgMsg');
  if (!m.baseUrl || !m.apiKey || !m.model){ msg.textContent = '接口地址、API Key、模型均为必填'; return; }
  const c = getAiCfg(); if (!c.models) c.models = [];
  c.models.push(m); setAiCfg(c);
  broadcastAiConfig(c);
  msg.textContent = '已保存 ✓ 当前共 ' + c.models.length + ' 个模型（表单信息保留，可直接保存该服务商的其它模型）';
  renderModelList();
  document.querySelectorAll('.ai-status').forEach(refreshAiStatus);
  try { refreshAiPanel(true); }catch(e){}
}
async function testAiConfig(){
  const c = collectCfg();
  const msg = document.getElementById('aiCfgMsg');
  if (!c.baseUrl || !c.apiKey || !c.model){ msg.textContent = '接口地址、API Key、模型均为必填'; return; }
  msg.textContent = '正在测试…';
  try{
    const r = await fetch(c.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.apiKey },
      body: JSON.stringify({ model: c.model, messages: [{ role: 'user', content: '回复两个字：正常' }], max_tokens: 16, stream: false })
    });
    if (!r.ok){ const t = await r.text(); throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 120)); }
    const j = await r.json();
    const txt = (j.choices && j.choices[0] && (j.choices[0].message || {}).content) || '（空）';
    msg.textContent = '连接成功 ✓ 回复：' + txt.slice(0, 30);
  }catch(e){ msg.textContent = '测试失败：' + aiErrText(e); }
}

async function exportAiConfig(withKey){
  const c = getAiCfg();
  let out = JSON.parse(JSON.stringify(c));
  if (!withKey){
    // 默认导出：Key 脱敏为 ***
    if (Array.isArray(out.models)){
      out.models = out.models.map(m => Object.assign({}, m, { apiKey: m.apiKey ? '***' : '' }));
    }
    out._noKey = true;
  } else {
    // 加密导出：弹出口令输入，Key 字段以口令加密
    const pass = prompt('请输入加密口令（请牢记，导入时需同一口令）：');
    if (!pass) return;
    if (pass.length < 4){ const msg=document.getElementById('aiCfgMsg'); if(msg) msg.textContent='口令至少 4 位'; return; }
    const salt = crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(16)) : new Uint8Array(16);
    try {
      const key = await _keyFromPassword(pass, salt);
      out._exportEnc = 1;
      out._salt = _b64encode(salt);
      for (const m of (out.models||[])){
        if (m && typeof m.apiKey === 'string' && m.apiKey){
          const iv = crypto.getRandomValues(new Uint8Array(12));
          const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, _TEXT_ENC.encode(m.apiKey));
          m.apiKey = { [ENC_MARKER]:2, v:1, iv:_b64encode(iv), ct:_b64encode(ct) };
        }
      }
    }catch(e){
      const msg=document.getElementById('aiCfgMsg'); if(msg) msg.textContent='加密失败：' + e.message; return;
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = withKey ? 'xuanji_ai_config_encrypted.json' : 'xuanji_ai_config.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  const msg = document.getElementById('aiCfgMsg');
  if (msg) msg.textContent = withKey ? '已加密导出配置（含Key）' : '已导出配置（不含Key，Key 已脱敏）';
}
function importAiConfig(){ const el = document.getElementById('aiCfgFile'); if (el) el.click(); }
async function handleImportAiConfig(input){
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e){
    try {
      const c = JSON.parse(e.target.result);
      if (!c.models || !Array.isArray(c.models)) throw new Error('缺少 models 数组');
      // 1) 默认导出（含 ***）：需要用户重填 Key
      if (c._noKey){
        const need = c.models.filter(m => m.apiKey === '***' || m.apiKey === '').length;
        if (need > 0){
          if (!confirm(`此导出文件不含 API Key（${need} 个模型需重新填写 Key 才能使用），是否继续导入？`)){ input.value=''; return; }
          c.models.forEach(m => { if (m.apiKey === '***') m.apiKey = ''; });
        }
      }
      // 2) 加密导出（含 _exportEnc）：弹口令解密
      if (c._exportEnc === 1 && c._salt){
        const pass = prompt('此为加密导出，请输入口令以解密 API Key：');
        if (!pass){ input.value=''; return; }
        try {
          const salt = _b64decode(c._salt);
          const key = await _keyFromPassword(pass, salt);
          for (const m of c.models){
            if (m && m.apiKey && typeof m.apiKey === 'object' && m.apiKey[ENC_MARKER] === 2){
              const iv = _b64decode(m.apiKey.iv);
              const ct = _b64decode(m.apiKey.ct);
              const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
              m.apiKey = _TEXT_DEC.decode(pt);
            }
          }
        }catch(err){
          const msg=document.getElementById('aiCfgMsg'); if(msg) msg.textContent='口令错误或文件损坏：' + err.message;
          input.value=''; return;
        }
        delete c._exportEnc; delete c._salt;
      }
      // apiKey 为字符串时直接使用，清除版本标记
      delete c._noKey; delete c._v;
      setAiCfg(c);
      renderModelList();
      document.querySelectorAll('.ai-status').forEach(refreshAiStatus);
      try { refreshAiPanel(true); }catch(err){}
      const msg = document.getElementById('aiCfgMsg'); if (msg) msg.textContent = '已导入 ' + c.models.length + ' 个模型 ✓';
    } catch(err) {
      const msg = document.getElementById('aiCfgMsg'); if (msg) msg.textContent = '导入失败：' + err.message;
    }
    input.value = '';
  };
  reader.readAsText(file);
}

/* 一键将当前配置广播到同域其它已打开的标签页、窗口，并同步 parent/opener */
function broadcastAiConfig(c){
  c = c || getAiCfg();
  if (!c || !c.models || !c.models.length) return;
  const payload = JSON.stringify({ type: 'xuanji_ai_cfg', cfg: c });
  try {
    if (typeof BroadcastChannel !== 'undefined'){
      const bc = new BroadcastChannel('xuanji_ai');
      bc.postMessage(payload);
      bc.close();
    }
  }catch(e){}
  try {
    if (window.opener && window.opener !== window){
      let n = {}; try { n = JSON.parse(window.opener.name || '{}'); }catch(e){ n = {}; }
      n.__xuanji_ai = c; window.opener.name = JSON.stringify(n);
    }
  }catch(e){}
  try {
    if (window.top && window.top !== window){
      let n = {}; try { n = JSON.parse(window.top.name || '{}'); }catch(e){ n = {}; }
      n.__xuanji_ai = c; window.top.name = JSON.stringify(n);
    }
  }catch(e){}
  try { localStorage.setItem(AI_CFG_KEY, JSON.stringify(c)); }catch(e){}
  const msg = document.getElementById('aiCfgMsg'); if (msg) msg.textContent = '已一键应用到所有已打开页面、标签页 ✓';
}

/* ---- 页面内 AI 面板 ---- */
function refreshAiStatus(el){
  if (!el) return;
  const models = aiModels();
  if (models.length){ el.textContent = '已配置：' + models.filter(m => m.enabled !== false).length + '/' + models.length + ' 个模型'; el.classList.add('is-configured'); }
  else { el.textContent = '未配置（点 ⚙ AI 设置）'; el.classList.remove('is-configured'); }
}

/* ---- 访问者地理位置（页脚免责声明之下，居中） ----
   四源顺序兜底：中文源优先，逐源失败再切下一源；全部失败则静默不显示，不影响任何排盘功能。
   单源超时 4 秒，避免某一源无响应时页脚长时间空着。
   结果按会话缓存（sessionStorage），同一标签页只请求一次，避免逐页重复外发请求。
   隐私：请求发往第三方 IP 定位服务，由其按来访 IP 反查归属地；本站不上传任何排盘数据，
   亦不带 cookie（credentials: omit），仅取归属地文本用于展示。 */
const GEO_CACHE_KEY = 'xj:geo';
const GEO_SOURCES = [
  'https://myip.ipip.net/json',            // 主源：ipip.net 专业地址库，归属地返回中文
  'https://uapis.cn/api/v1/network/myip',  // 备源一：国内聚合服务，归属地返回中文
  'https://api.ip.sb/geoip',               // 备源二：国内可达，跨域开放，归属地返回英文
  'https://ipwho.is/'                      // 备源三：国际源，归属地返回英文
];

/* 各家字段名不一（country/country_name、province/region、location 数组等），此处统一归一 */
function geoPick(d){
  if (!d || typeof d !== 'object') return null;
  /* ipip.net 把归属地放在 data.location 数组：[国家, 省, 市, 区, 运营商] */
  if (d.data && Array.isArray(d.data.location)){
    const L = d.data.location;
    return { ip: String(d.data.ip || ''), country: L[0] || '', region: L[1] || '', city: L[2] || '' };
  }
  const ip = d.ip || (d.ipinfo && d.ipinfo.text) || '';
  const country = d.country || d.country_name || (d.ipdata && d.ipdata.info1) || '';
  const region = d.province || d.region || (d.ipdata && d.ipdata.info2) || '';
  const city = d.city || (d.ipdata && d.ipdata.info3) || '';
  if (!ip && !country) return null;
  return { ip: String(ip), country: String(country), region: String(region), city: String(city) };
}

/* 省市区去重拼接，如“中国 广东省 深圳市”；国家名与省名重复时只留一次 */
function geoText(g){
  return [g.country, g.region, g.city].filter(function(s, i, a){ return s && a.indexOf(s) === i; }).join(' ');
}

function geoFetchOne(url){
  return new Promise(function(res, rej){
    if (typeof fetch !== 'function'){ rej(new Error('no fetch')); return; }
    let done = false;
    const fin = function(fn, v){ if (done) return; done = true; clearTimeout(timer); fn(v); };
    const timer = setTimeout(function(){ fin(rej, new Error('timeout')); }, 4000);
    try {
      fetch(url, { method: 'GET', cache: 'no-store', credentials: 'omit' })
        .then(function(r){ return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); })
        .then(function(d){ const g = geoPick(d); g ? fin(res, g) : fin(rej, new Error('unparsable')); })
        .catch(function(e){ fin(rej, e); });
    } catch (e){ fin(rej, e); }
  });
}

/* 依次尝试各源，任一成功即返回 */
function geoLookup(){
  let p = Promise.reject(new Error('no source'));
  GEO_SOURCES.forEach(function(u){ p = p.catch(function(){ return geoFetchOne(u); }); });
  return p;
}

function renderGeo(el, g){
  const txt = geoText(g);
  if (!txt) return;
  el.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8c2.3 0 4.2 1.9 4.2 4.2 0 3-4.2 8.2-4.2 8.2S3.8 9 3.8 6C3.8 3.7 5.7 1.8 8 1.8z"/><circle cx="8" cy="6" r="1.6"/></svg><span></span>';
  el.querySelector('span').textContent = txt;
  el.title = 'IP ' + (g.ip || '未知') + '（由 IP 定位服务反查，仅供参考）';
  el.classList.add('on');
}

/* 挂载点：#footer 内、免责声明 .dis 之后（页脚由 app.js renderChrome 生成，故可能晚于本函数调用） */
function geoHost(){
  const f = document.getElementById('footer');
  if (!f) return null;
  let w = f.querySelector('.wrap');
  if (!w){ w = document.createElement('div'); w.className = 'wrap'; f.appendChild(w); }
  let el = w.querySelector('.geo-foot');
  if (!el){
    el = document.createElement('div'); el.className = 'geo-foot';
    const dis = w.querySelector('.dis');
    w.insertBefore(el, dis ? dis.nextSibling : null);
  }
  return el;
}

function mountGeo(){
  const el = geoHost();
  if (!el){
    /* 页脚尚未生成：等 load 后再试一次 */
    if (!mountGeo.__retried){
      mountGeo.__retried = true;
      try { window.addEventListener('load', function(){ mountGeo(); }, { once: true }); } catch (e){}
    }
    return;
  }
  if (el.__geoDone) return;
  el.__geoDone = true;
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(GEO_CACHE_KEY) || 'null'); } catch (e){}
  if (cached && cached.ip){ renderGeo(el, cached); return; }
  geoLookup().then(function(g){
    try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(g)); } catch (e){}
    renderGeo(el, g);
  }).catch(function(){ /* 两源皆失败：保持隐藏，不提示、不报错 */ });
}

/* 页脚地理定位自启：挂了附加功能面板的页由 mountAI 触发；未挂面板的页（如首页）在此自启。
   重复调用由 el.__geoDone 拦下，不会重复外发请求。 */
try {
  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete') mountGeo();
    else window.addEventListener('load', function(){ mountGeo(); }, { once: true });
  }
} catch (e){}

function normalizeHistory(h){
  if (!Array.isArray(h)) return [];
  return h.map(m => {
    if (!m || typeof m !== 'object') return null;
    if (!('role' in m) || !('content' in m)) return null;
    if (!Array.isArray(m.models)) m.models = [];
    return m;
  }).filter(Boolean);
}

/* ================= 盘面分享与数据 =================
   全站排盘页通用：复制分享链接、导出 JSON、复制 JSON、导入 JSON。
   通过 mountAI(getContext, pageTitle, { share: { page, title, collect, restore, recast } }) 启用；
   collect/restore/recast 可用页面专属实现，缺省抓取/回填全部带 id 的表单控件。
   分享链接格式：当前地址 + #xj=<base64url(JSON{p,d})>，仅存在于链接中，不写入存储。 */
function shareB64e(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function shareB64d(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='='; return decodeURIComponent(escape(atob(s))); }
function shareCopyText(text){
  return new Promise(function(res,rej){
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(res,function(){ fb(); }); } else fb();
    function fb(){ try{ var ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); var ok=document.execCommand('copy'); document.body.removeChild(ta); ok?res():rej(new Error('copy failed')); }catch(e){ rej(e); } }
  });
}
function shareDefaultCollect(){
  const d={}; const els=document.querySelectorAll('input[id],select[id],textarea[id]');
  for(let i=0;i<els.length;i++){ const el=els[i]; if(el.type==='file'||el.type==='button'||el.type==='submit') continue; d[el.id]=(el.type==='checkbox'||el.type==='radio')?(el.checked?'1':'0'):el.value; }
  return d;
}
function shareDefaultRestore(d){
  Object.keys(d||{}).forEach(function(k){ const el=document.getElementById(k); if(!el) return; if(el.type==='checkbox'||el.type==='radio') el.checked=d[k]==='1'; else el.value=d[k]; try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){} try{ el.dispatchEvent(new Event('input',{bubbles:true})); }catch(e){} });
}
/* 在面板内注入四个分享按钮 + 隐藏文件输入 + 通知行，并绑定交互与 #xj= 分享链接还原 */
function injectShare(host, share){
  share = share || {};
  const page = share.page || (location.pathname.split('/').pop()||'pan').replace(/\.html$/,'');
  const title = share.title || (document.title.trim()||'排盘');
  const collect = share.collect || shareDefaultCollect;
  const restore = share.restore || shareDefaultRestore;
  const recast = share.recast || null;
  /* 挂给全站顶层刷新机制复用：刷新恢复输入后由顶层按此钩子重出结果 */
  if(recast){ try{ window.xjRecast=recast; }catch(e){} }
  const toastMsg = function(msg, ok){
    noticeEl.textContent=msg; noticeEl.style.display='block'; noticeEl.style.color=ok===false?'#c0392b':'';
    clearTimeout(noticeEl.__t); noticeEl.__t=setTimeout(function(){ noticeEl.style.display='none'; },6000);
  };
  const payloadJson = function(){ return JSON.stringify({page,title,time:new Date().toISOString(),data:collect()},null,2); };
  const applyShared = function(data){ (restore)(data.d); if(recast){ try{ recast(); }catch(e){} } };

  const mk=function(label,act){ const b=document.createElement('button'); b.type='button'; b.className='btn soft'; b.textContent=label; b.setAttribute('data-xj',act); return b; };
  host.appendChild(mk('复制分享链接','link'));
  host.appendChild(mk('导出 JSON','dl'));
  host.appendChild(mk('复制 JSON','copy'));
  host.appendChild(mk('导入 JSON','imp'));
  const file=document.createElement('input');
  file.type='file'; file.accept='.json,application/json'; file.style.display='none'; file.setAttribute('data-xj-file','1');
  host.appendChild(file);
  const noticeEl=document.createElement('div');
  noticeEl.style.cssText='display:none;flex:1 1 100%;font-size:12px;line-height:1.5;margin-top:4px;color:#2e8b57';
  host.appendChild(noticeEl);

  host.addEventListener('click',function(e){
    const b=e.target&&e.target.closest?e.target.closest('[data-xj]'):null; if(!b) return;
    e.preventDefault(); const act=b.getAttribute('data-xj');
    if(act==='link'){
      const url=location.origin+location.pathname+location.search+'#xj='+shareB64e(JSON.stringify({p:page,d:collect()}));
      shareCopyText(url).then(function(){ toastMsg('分享链接已复制，对方打开即自动还原盘面：'+url.slice(0,80)+(url.length>80?'…':''),true); },function(){ toastMsg('复制失败，请手动复制地址栏链接',false); });
    } else if(act==='dl'){
      const blob=new Blob([payloadJson()],{type:'application/json'}); const a=document.createElement('a');
      a.href=URL.createObjectURL(blob); a.download=page+'-pan-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500);
      toastMsg('已导出 '+a.download,true);
    } else if(act==='copy'){
      shareCopyText(payloadJson()).then(function(){ toastMsg('盘面 JSON 已复制到剪贴板',true); },function(){ toastMsg('复制失败',false); });
    } else if(act==='imp'){ file.click(); }
  });
  file.addEventListener('change',function(){
    const f=file.files&&file.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=function(){ try{ const obj=JSON.parse(r.result); applyShared({d:obj&&obj.data?obj.data:obj}); toastMsg('导入成功，盘面已还原',true); }catch(e){ toastMsg('导入失败：不是有效的盘面 JSON',false); } };
    r.readAsText(f); file.value='';
  });

  const m=(location.hash||'').match(/#xj=([A-Za-z0-9\-_]+)/);
  if(m){ try{ const data=JSON.parse(shareB64d(m[1])); if(data&&data.d){ applyShared(data); toastMsg('已从分享链接还原盘面'+(data.p?('（来源：'+data.p+'）'):'')+'。',true); } try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }catch(e){ toastMsg('分享链接解析失败',false); } }
}
/* 等待附加功能面板按钮行出现后注入分享工具（供各页在 mountAI 之后调用） */
function shareWait(share){
  let n=0;
  (function tryInject(){
    const a=document.querySelector('#aiMount .ai-actions')||document.querySelector('.ai-actions');
    if(a){ injectShare(a, share); return; }
    if(++n<=20) setTimeout(tryInject,200);
  })();
}

/* 附加功能面板默认收起（低频工具区），只在用户主动发起解析时展开，
   刷新恢复与重出一律不动其开合态（重出函数不得改交互态）。 */
function openAiBlock(){
  const b = document.getElementById('aiBlock');
  if (b) b.open = true;
}

function mountAI(getContext, pageTitle, opts){
  opts = opts || {};
  const sysCustom = opts.systemPrompt || '';
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.7;
  let host = document.getElementById('aiMount');
  if (!host){ host = document.createElement('div'); host.id = 'aiMount'; (document.querySelector('.page') || document.body).appendChild(host); }
  host.innerHTML = `<details class="ai-block" id="aiBlock">
    <summary class="ai-head"><h3>附加功能</h3><span class="ai-status"></span></summary>
    <div class="ai-body">
      <div class="ai-actions">
        <button class="btn" id="aiRunBtn" onclick="runAiAnalyze()">AI 解析</button>
        <button class="btn gold" onclick="openAiConfig()">配置模型</button>
        <button class="btn soft" onclick="refreshAiPanel(true)">刷新模型</button>
        <button class="btn soft" id="aiStopBtn" onclick="stopAiAnalyze()" disabled>停止</button>
        <button class="btn soft" id="aiExportBtn" onclick="exportAiChat()">导出AI对话</button>
        <button class="btn soft" id="aiClearBtn" onclick="clearAiChat()">清除AI对话</button>
        <button class="btn soft" onclick="copyAiData()">复制排盘数据</button>
        <button class="btn soft" onclick="printPage()">打印存为PDF</button>
      </div>
      <div class="ai-tip" id="aiReparseTip" style="display:none;margin-top:4px">点“重新解析”会清空历史对话并按新盘面重新生成。如有需要请先点击“导出AI对话”。</div>
      <div id="aiOutWrap"></div>
    </div>
  </details>`;
  const st = host.querySelector('.ai-status'); refreshAiStatus(st);
  try { mountGeo(); } catch (e){}
  window.__aiGetContext = getContext; window.__aiTitle = pageTitle;
  const histKey = 'ai_history_' + pageTitle;
  try {
    const raw = sessionStorage.getItem(histKey);
    window.__aiHistory = raw ? normalizeHistory(JSON.parse(raw)) : [];
  }catch(e){ window.__aiHistory = []; }
  window.__aiHistKey = histKey;
  try { setTimeout(() => { refreshAiPanel(true); restoreAiChat(); }, 50); }catch(e){}
  window.addEventListener('storage', function(e){
    if (e.key === AI_CFG_KEY){ document.querySelectorAll('.ai-status').forEach(refreshAiStatus); refreshAiPanel(true); }
  });
  window.addEventListener('focus', function(){
    document.querySelectorAll('.ai-status').forEach(refreshAiStatus);
    refreshAiPanel(true);
  });
}

/* 构建多模型面板 HTML：每个模型一个标签页 + 对话模型选择复选框 */
function buildAiPanelHtml(models, readyMsg){
  const activeIdx = 0;
  let tabs = '', pans = '';
  models.forEach((m, i) => { tabs += `<button class="ai-tab${i === activeIdx ? ' active' : ''}" onclick="switchAiTab(${i})">${escapeHtml(m.name || m.model)}</button>`; });
  models.forEach((m, i) => { pans += `<div class="ai-pane${i === activeIdx ? ' active' : ''}" id="aiPane${i}"><div class="ai-chat" id="aiChat${i}"><div class="ai-out show" id="aiOut${i}">${readyMsg}</div></div></div>`; });
  const chks = models.map((m, i) => `<label style="font-size:12px;display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" class="ai-chk-model" data-idx="${i}" checked onchange="onAiChkChange()"> ${escapeHtml(m.name || m.model)}</label>`).join('');
  return `<div class="ai-tabs">${tabs}</div><div class="ai-panes">${pans}</div>
    <div class="ai-follow" style="margin-top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <span style="font-size:13px;color:var(--ink2);white-space:nowrap">本次对话（结果集中在当前标签页）：</span>
      <label style="font-size:12px;display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" id="aiChkAll" onchange="toggleAllAiChk(this)"> 全选</label>
      <span id="aiModelChk" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${chks}</span>
    </div>
    <div class="ai-follow" style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input id="aiFollowQ" placeholder="输入对话内容…" style="flex:1;min-width:120px;padding:5px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px;font-family:inherit;background:#fff">
      <button class="btn gold" style="font-weight:400" onclick="sendAiFollow()">发送</button>
    </div>`;
}

function getActiveTabIdx(){
  const tabs = document.querySelectorAll('.ai-tab');
  for (let i = 0; i < tabs.length; i++) if (tabs[i].classList.contains('active')) return i;
  return 0;
}

function getSelectedModelIdx(){
  const out = [];
  document.querySelectorAll('.ai-chk-model').forEach(cb => { if (cb.checked) out.push(Number(cb.getAttribute('data-idx'))); });
  return out;
}
function toggleAllAiChk(chk){
  const on = chk.checked;
  document.querySelectorAll('.ai-chk-model').forEach(cb => cb.checked = on);
}
function onAiChkChange(){
  const all = document.querySelectorAll('.ai-chk-model');
  const checked = document.querySelectorAll('.ai-chk-model:checked');
  const allChk = document.getElementById('aiChkAll');
  if (allChk) allChk.checked = all.length > 0 && checked.length === all.length;
}
function setAiCheckboxes(idxs){
  idxs = idxs || [];
  document.querySelectorAll('.ai-chk-model').forEach(cb => {
    cb.checked = idxs.indexOf(Number(cb.getAttribute('data-idx'))) !== -1;
  });
  onAiChkChange();
}

/* 刷新模型面板：force 为 true 时，仅在没有聊天或模型数量变化时才重建，避免破坏历史。 */
function refreshAiPanel(force){
  document.querySelectorAll('.ai-status').forEach(refreshAiStatus);
  const all = aiModels();
  const models = all.filter(m => m.enabled !== false);
  const wrap = document.getElementById('aiOutWrap');
  if (!wrap) return;
  const chatExists = wrap.querySelector('.ai-chat');
  if (!force && chatExists) return;
  if (force && chatExists){
    const currentTabs = document.querySelectorAll('.ai-tab').length;
    if (currentTabs === models.length) return;
  }
  if (!models.length){
    /* 面板未配置模型时只出这一句可操作提示 */
    wrap.innerHTML = '<div class="ai-tip">尚未配置或启用任何模型，请点"配置模型"进行设置。</div>';
    return;
  }
  wrap.innerHTML = buildAiPanelHtml(models, '模型已就绪，默认全选，点击"AI 解析"前可取消勾选任意模型。');
  try { restoreAiChat(); }catch(e){}
  const exp = document.getElementById('aiExportBtn');
  if (exp) exp.style.display = 'inline-block';
}

/* 将 sessionStorage 中的对话历史恢复到各模型标签页 */
function restoreAiChat(){
  const hist = window.__aiHistory || [];
  if (!hist.length) return;
  const allModels = aiModels().filter(m => m.enabled !== false);
  const allIdx = allModels.map((_, i) => i);
  if (!allModels.length) return;
  allIdx.forEach(i => {
    const chat = document.getElementById('aiChat' + i);
    if (!chat) return;
    chat.innerHTML = '';
    hist.forEach(msg => {
      let models = msg.models || [];
      // 旧格式没有 models 时，默认显示到所有模型标签页
      if (!models.length) models = allIdx;
      if (models.indexOf(i) === -1) return;
      if (msg.role === 'user') chat.insertAdjacentHTML('beforeend', `<div class="ai-bubble user">${escapeHtml(msg.content)}</div>`);
      else if (msg.role === 'assistant') chat.insertAdjacentHTML('beforeend', `<div class="ai-bubble assistant"><b style="color:var(--gold2)">AI 助手：</b>${md2html(msg.content)}</div>`);
    });
  });
  setRunStarted();
}

function setRunStarted(){
  const btn = document.getElementById('aiRunBtn');
  if (btn){ btn.textContent = '重新解析'; btn.disabled = false; btn.title = '点“重新解析”会清空历史对话并按新盘面重新生成。如有需要请先点击“导出AI对话”。'; }
  const tip = document.getElementById('aiReparseTip');
  if (tip) tip.style.display = 'block';
}

let __aiAbort = null;
function stopAiAnalyze(){ if (__aiAbort){ __aiAbort.abort(); __aiAbort = null; } const stop = document.getElementById('aiStopBtn'); if (stop) stop.disabled = true; }

function copyAiData(){
  let ctx = ''; try { ctx = (window.__aiGetContext && window.__aiGetContext()) || ''; }catch(e){ ctx = ''; }
  if (!ctx){ alert('请先完成排盘，再复制数据'); return; }
  const title = window.__aiTitle || '命理';
  const text = `【${title}】\n${ctx}\n\n（以上为玄机排盘导出的结构化盘面数据）`;
  const done = () => showCopyTip('已复制 ' + text.length + ' 字');
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done){
  const ta = document.createElement('textarea'); ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); done(); }catch(e){ alert('复制失败'); }
  document.body.removeChild(ta);
}
function showCopyTip(msg){
  let t = document.getElementById('aiCopyTip');
  if (!t){ t = document.createElement('div'); t.id = 'aiCopyTip'; t.className = 'ai-copy-tip'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__copyTipT);
  window.__copyTipT = setTimeout(() => t.classList.remove('show'), 1900);
}

/* ---- 多模型并行解析 + 对话 ----
   每条历史消息都带 models 数组，标出它属于哪些模型；
   首次解析 / 重新解析：使用面板中勾选的模型，清空历史并重新生成；
   对话：勾选哪些模型，就由哪些模型回答，全部输出集中在当前活动标签页。 */
async function runAiAnalyze(question, selectedIdx){
  openAiBlock();
  const allModels = aiModels().filter(m => m.enabled !== false);
  if (!allModels.length){ openAiConfig(); return; }

  const title = window.__aiTitle || '命理';
  let ctx = ''; try { ctx = (window.__aiGetContext && window.__aiGetContext()) || ''; }catch(e){ ctx = ''; }
  if (!ctx){ alert('请先完成排盘再进行 AI 解析'); return; }

  const wrap = document.getElementById('aiOutWrap');
  const btn = document.getElementById('aiRunBtn'), stop = document.getElementById('aiStopBtn');
  if (btn) btn.disabled = true; if (stop) stop.disabled = false;

  const sysBase = `你是一位资深的中国传统命理与术数分析师，精通八字、紫微斗数、六爻、梅花、奇门、六壬、太乙、择日、塔罗、雷诺曼与灵签解签。请基于给定盘面信息，用简体中文做条理清晰、专业而通俗的解读，分点说明，避免绝对化断语，末尾提示仅供参考。`;
  const sys = sysCustom ? (sysBase + '\n' + sysCustom) : sysBase;
  const allIdx = allModels.map((_, i) => i);

  let targetIdx = [];
  let messages = [];
  let outMap = {};

  if (!question){
    // 首次解析或重新解析时，使用面板勾选的模型生成回复
    targetIdx = getSelectedModelIdx();
    if (!targetIdx.length) targetIdx = allIdx;
    // 清空现有聊天内容，并重新放入生成占位
    allIdx.forEach(i => {
      const chat = document.getElementById('aiChat' + i);
      if (chat) chat.innerHTML = `<div class="ai-out show" id="aiOut${i}">⏳ 正在生成…</div>`;
    });
    messages = [{ role: 'system', content: sys, models: allIdx }];
    const user = `【术数类型】${title}\n【盘面信息】\n${ctx}\n\n请给出解读。`;
    messages.push({ role: 'user', content: user, models: allIdx });
    window.__aiHistory = messages.slice();
    window.__aiLastContext = ctx;
  } else {
    // 对话：使用传入的 selectedIdx，未传则默认当前活动标签
    if (Array.isArray(selectedIdx)){
      targetIdx = selectedIdx.filter(i => i >= 0 && i < allModels.length);
    } else if (typeof selectedIdx === 'number'){
      if (selectedIdx >= 0 && selectedIdx < allModels.length) targetIdx = [selectedIdx];
    } else if (selectedIdx === 'all' || selectedIdx === '*'){
      targetIdx = allIdx;
    } else if (selectedIdx !== undefined && selectedIdx !== null && selectedIdx !== ''){
      const n = Number(selectedIdx);
      if (!isNaN(n) && n >= 0 && n < allModels.length) targetIdx = [n];
    }
    if (!targetIdx.length) targetIdx = [getActiveTabIdx()];
    const activeTab = getActiveTabIdx();
    const userMsg = { role: 'user', content: question, models: [activeTab] };
    window.__aiHistory.push(userMsg);
    messages = window.__aiHistory.slice();
    // 对话：所有选中模型的回答集中在当前活动标签页，其它标签页不生成
    const chat = document.getElementById('aiChat' + activeTab);
    const ts = Date.now();
    if (chat){
      chat.insertAdjacentHTML('beforeend', `<div class="ai-bubble user"><b style="color:var(--gold2)">对话：</b>${escapeHtml(question)}</div>`);
      targetIdx.forEach(mi => {
        const id = 'aiOut' + mi + '_' + ts;
        outMap[mi] = id;
        const modelName = escapeHtml(allModels[mi].name || allModels[mi].model);
        chat.insertAdjacentHTML('beforeend', `<div class="ai-out show" id="${id}"><div class="ai-model-h" style="font-size:12px;color:var(--ink2);margin-bottom:4px">${modelName}</div><div class="ai-model-c">⏳ 正在生成…</div></div>`);
      });
    }
  }

  const models = targetIdx.map(i => allModels[i]);

  try { sessionStorage.setItem(window.__aiHistKey || 'ai_history', JSON.stringify(window.__aiHistory)); }catch(e){}
  const exp = document.getElementById('aiExportBtn'); if (exp) exp.style.display = 'inline-block';

  __aiAbort = new AbortController();
  const results = [];
  function curOut(modelIdx){
    if (outMap[modelIdx]) return document.getElementById(outMap[modelIdx]);
    const els = document.querySelectorAll('[id^="aiOut' + modelIdx + '_"]');
    return els[els.length - 1] || document.getElementById('aiOut' + modelIdx);
  }
  function curContent(out){ return out ? (out.querySelector('.ai-model-c') || out) : null; }

  const apiMessages = messages.map(({role, content}) => ({role, content}));

  const tasks = models.map((m) => {
    return (async () => {
      const mi = allModels.indexOf(m);
      const out = curOut(mi); if (!out) return;
      const contentEl = curContent(out);
      try{
        const r = await fetch(m.baseUrl + '/chat/completions', {
          method: 'POST', signal: __aiAbort.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + m.apiKey },
          body: JSON.stringify({ model: m.model, stream: true, temperature: temperature, messages: apiMessages })
        });
        if (!r.ok){ const t = await r.text(); throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 200)); }
        if (!r.body) throw new Error('无流式数据');
        const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '', full = '';
        while (true){
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n'); buf = lines.pop();
          for (const ln of lines){
            const s = ln.trim(); if (!s.startsWith('data:')) continue;
            const data = s.slice(5).trim(); if (data === '[DONE]') continue;
            try {
              const j = JSON.parse(data);
              const delta = (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || '';
              if (delta){ full += delta; if (contentEl) contentEl.innerHTML = md2html(full); }
            }catch(e){}
          }
        }
        if (contentEl) contentEl.innerHTML = full === '' ? '<span style="color:var(--ink2)">模型未返回内容</span>' : md2html(full);
        results.push({ idx: mi, name: m.name, ok: true, text: full });
      }catch(e){
        if (e.name !== 'AbortError'){
          const out2 = curOut(mi); const contentEl2 = curContent(out2);
          if (contentEl2) contentEl2.innerHTML = `<div style="color:var(--red)">[出错] ${escapeHtml(aiErrText(e))}</div>`;
          results.push({ idx: mi, name: m.name, ok: false, err: aiErrText(e) });
        }
      }
    })();
  });
  await Promise.allSettled(tasks);

  // 首次解析：每个模型回复归自己标签页；对话：全部集中在当前活动标签页
  results.forEach(r => {
    if (r.ok) window.__aiHistory.push({ role: 'assistant', content: r.text, models: question ? [getActiveTabIdx()] : [r.idx] });
  });
  try { sessionStorage.setItem(window.__aiHistKey || 'ai_history', JSON.stringify(window.__aiHistory)); }catch(e){}

  if (btn){
    if (results.some(r => r.ok)){
      setRunStarted();
      // 首次解析完成后，默认切换到第一个有结果的模型标签页，并只勾选该模型用于后续对话
      if (!question){
        const firstOk = results.find(r => r.ok);
        if (firstOk){
          switchAiTab(firstOk.idx);
          setAiCheckboxes([firstOk.idx]);
        }
      }
    }
    else { btn.disabled = false; btn.textContent = 'AI 解析'; }
  }
  if (stop) stop.disabled = true; __aiAbort = null;
}

function switchAiTab(idx){
  document.querySelectorAll('.ai-tab').forEach((t, i) => { t.classList.toggle('active', i === idx); });
  document.querySelectorAll('.ai-pane').forEach((p, i) => { p.classList.toggle('active', i === idx); });
  // 若对话已开始，切换标签页后默认只让当前标签模型参与下次对话
  if (window.__aiHistory && window.__aiHistory.some(m => m.role === 'assistant')){
    document.querySelectorAll('.ai-chk-model').forEach(cb => cb.checked = Number(cb.getAttribute('data-idx')) === idx);
    onAiChkChange();
  }
}

function sendAiFollow(){
  const q = document.getElementById('aiFollowQ'); if (!q) return;
  const text = q.value.trim(); if (!text) return;
  q.value = '';
  let idx = getSelectedModelIdx();
  const active = getActiveTabIdx();
  if (idx.indexOf(active) === -1) idx.push(active);
  if (!idx.length) idx = [active];
  runAiAnalyze(text, idx);
}

/* 导出对话为文本文件：注明每条消息由哪些模型参与、生成 */
function exportAiChat(){
  const hist = window.__aiHistory || [];
  if (!hist.length){ alert('暂无对话记录'); return; }
  const title = window.__aiTitle || '命理';
  const allModels = aiModels();
  function modelNames(arr){
    if (!arr || !arr.length) return '';
    return arr.map(i => (allModels[i] && (allModels[i].name || allModels[i].model)) || '?').join('、');
  }
  let txt = `# ${title} AI 对话记录\n# ${new Date().toLocaleString()}\n\n`;
  hist.forEach((m) => {
    const tag = m.role === 'user' ? '用户' : (m.role === 'assistant' ? 'AI 助手' : '系统');
    const models = modelNames(m.models);
    const header = models ? `【${tag} ${models}】` : `【${tag}】`;
    txt += `${header}\n${m.content}\n\n`;
  });
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title}_AI对话_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* 清除本页全部 AI 对话记录（阅后即焚、隐私保护）
   对话仅保存在 sessionStorage（关闭标签页即自动清空，且从不向服务器上传），
   此按钮提供主动即时清除，清空后不可恢复。 */
function clearAiChat(){
  const hist = window.__aiHistory || [];
  if (!hist.length){
    const wrap = document.getElementById('aiOutWrap');
    if (wrap){
      const models = aiModels().filter(m => m.enabled !== false);
      wrap.innerHTML = models.length
        ? buildAiPanelHtml(models, '模型已就绪，默认全选，点击“AI 解析”前可取消勾选任意模型。')
        : '<div class="ai-tip">尚未配置或启用任何模型，请点“配置模型”进行设置。</div>';
    }
    return;
  }
  if (!window.confirm('确定清除本页所有 AI 对话记录？\n此操作不可恢复，用于阅后即焚、保护隐私。')) return;
  window.__aiHistory = [];
  try { sessionStorage.removeItem(window.__aiHistKey || 'ai_history'); }catch(e){}
  const wrap = document.getElementById('aiOutWrap');
  if (wrap){
    const models = aiModels().filter(m => m.enabled !== false);
    wrap.innerHTML = models.length
      ? buildAiPanelHtml(models, '模型已就绪，默认全选，点击“AI 解析”前可取消勾选任意模型。')
      : '<div class="ai-tip">尚未配置或启用任何模型，请点“配置模型”进行设置。</div>';
  }
  const btn = document.getElementById('aiRunBtn');
  if (btn){ btn.textContent = 'AI 解析'; btn.disabled = false; btn.title = ''; }
  const tip = document.getElementById('aiReparseTip'); if (tip) tip.style.display = 'none';
  const exp = document.getElementById('aiExportBtn'); if (exp) exp.style.display = 'none';
  showCopyTip('已清除本页全部对话记录');
}

/* ===== 打印存PDF：通用实现，全站排盘页共用 =====
   导出目标：默认 #out（全站排盘内容统一渲染进 #out），可用 [data-export-target] 覆盖，以适配后续扩展模块。 */

function printPage(){
  // 打印前强制展开全部 details 与折叠模块，确保整页（含后续扩展模块）完整输出；打印后还原
  var ds = Array.prototype.slice.call(document.querySelectorAll('details'));
  var prev = ds.map(function(d){ return d.open; });
  ds.forEach(function(d){ d.open = true; });
  var mods = Array.prototype.slice.call(document.querySelectorAll('.mod.collapsed'));
  mods.forEach(function(m){ m.classList.remove('collapsed'); });
  function restore(){
    ds.forEach(function(d, i){ if (!prev[i]) d.open = false; });
    mods.forEach(function(m){ m.classList.add('collapsed'); });
    window.removeEventListener('afterprint', restore);
  }
  window.addEventListener('afterprint', restore);
  window.print();
}
