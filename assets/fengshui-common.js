/* 风水两页共用基础件：地理坐标取点、磁偏折算、坐向控件与取数。
   时间源由页给：fsDeclNow() 由各页定义，本件不认锚点口径。
   存储键由页给：fsGeoInit 的 manualKey 参数即各页的手填标记键。 */

function fsGeoCoord(){
  const lo=parseFloat((document.getElementById('fsLng')||{}).value);
  const la=parseFloat((document.getElementById('fsLat')||{}).value);
  if(isFinite(lo)&&isFinite(la)) return {lng:lo, lat:la};
  const sp=document.getElementById('fsProv'); if(!sp||!sp.value) return null;
  const sc=document.getElementById('fsCity'), sd=document.getElementById('fsDist');
  const lng=findLng(sp.value, sc&&sc.value, sd&&sd.value);
  const lat=findLat(sp.value, sc&&sc.value, sd&&sd.value);
  if(lng==null||lat==null) return null;
  return {lng, lat};
}

function fsMagTrue(deg){
  if(deg==null || !isFinite(deg)) return undefined;
  const d=parseFloat((document.getElementById('baseDecl')||{}).value);
  if(!isFinite(d)) return deg;
  return ((deg+d)%360+360)%360;
}

function fsSitFromDeg(){
  const dv=document.getElementById('baseDeg').value;
  const deg=fsMagTrue(dv===''?null:parseFloat(dv));
  if(deg===undefined) return;
  const z=FS.zhenShan(deg, 'zheng');
  if(!z) return;
  const sitEl=document.getElementById('baseSit'), faceEl=document.getElementById('baseFace');
  if(!sitEl) return;
  sitEl.value=z.shan;
  if(faceEl) faceEl.selectedIndex=(FS.SHAN_LIST.indexOf(z.shan)+12)%24;
}

function fsMagNote(){
  const el=document.getElementById('fsMagNote'); if(!el) return;
  const t=fsMagTrue(parseFloat(document.getElementById('baseDeg').value));
  if(t===undefined){ el.textContent=''; return; }
  const d=parseFloat(document.getElementById('baseDecl').value);
  el.textContent=isFinite(d)
    ? `已按当地磁偏角折算真北，折算后坐度 ${t.toFixed(1)}°`
    : '所填坐度按真北论，未作折算';
}

function fsSetLocalBase(which,el){
  if(which==='sit'){
    document.getElementById('baseSit').value=el.value;
    document.getElementById('baseFace').selectedIndex=(FS.SHAN_LIST.indexOf(el.value)+12)%24;
  }else if(which==='face') document.getElementById('baseFace').value=el.value;
  else if(which==='deg') document.getElementById('baseDeg').value=el.value;
  else document.getElementById('baseYear2').value=el.value;
  fsApplyBase();
}

function fsGeoPick(){
  const el=document.getElementById('baseDecl');
  if(el && !FS_DECL_TOUCH){
    const c=fsGeoCoord();
    el.value=c?FS_MAG.decl(c.lat, c.lng, fsDeclNow()).toFixed(2):'';
  }
  fsMagNote();
}

function fsMagOnline(){
  const btn=document.getElementById('fsMagBtn');
  const c=fsGeoCoord(); if(!c) return;
  if(btn){ btn.disabled=true; btn.textContent='取数中'; }
  let got=false;
  FS_MAG.online(c.lat, c.lng, fsDeclNow()).then(v=>{
    if(v==null) return;
    document.getElementById('baseDecl').value=v.toFixed(2);
    FS_DECL_TOUCH=true;
    got=true;
  }).catch(()=>{}).then(()=>{
    if(btn){ btn.disabled=false; btn.textContent='重新取当地磁偏角'; }
    if(got) fsApplyBase(); else fsMagNote();
  });
}

function fsGeoInit(manualKey){
  const sp=document.getElementById('fsProv'); if(!sp) return;
  const trio=fillPlaceTrio(sp, document.getElementById('fsCity'), document.getElementById('fsDist'), fsGeoPick);
  fsGeoPick();
  placeIpPrefill({manualKey: manualKey, group:document.getElementById('fsGeoGroup'), trio:trio, onDone:fsGeoPick});
}

/* 拣选共通：点选某一格后，轮盘选中与标签、指针、盘心与详情按同一序刷新。
   各盘差异收在页给的配置对象里：state 写页内选中变量，wheel 与 cur 为元素 id，
   needle、core、detail 为页内三个刷新函数，beforeCore 为个别盘的前置钩子。 */
function fsPickCommon(i, c){
  if(!c) return;
  c.state(i);
  WHEEL.pick(c.wheel, i);
  WHEEL.lab(c.wheel, i);
  c.needle(i);
  if(c.cur){
    const root=document.getElementById(c.wheel), cur=document.getElementById(c.cur);
    if(root&&cur){
      const arcs=root.querySelectorAll('.w-arc:not(.w-arc-cur)');
      if(arcs[i]) cur.setAttribute('d', arcs[i].getAttribute('d'));
    }
  }
  if(c.beforeCore) c.beforeCore(i);
  c.core(i);
  c.detail();
}

/* ===== 风水针盘与盘心共通（阳宅、阴宅两页） =====
   指针与圆点按角度落位，收此一件：needleId 与 dotId 由页给，deg 由页内换算函数出，
   embed 记针与点在轮盘 SVG 内（须先取根再找，找不到即退）。 */
function fsNeedleCommon(needleId, dotId, deg, embed, wheelId, geo){
  let ln = document.getElementById(needleId), dt = document.getElementById(dotId);
  if(embed){
    const root = document.getElementById(wheelId);
    if(!root) return;
    ln = root.querySelector('#' + needleId);
    dt = root.querySelector('#' + dotId);
    if(!ln || !dt) return;
  }
  const p0 = (geo && geo.p0) || FW_P0, p1 = (geo && geo.p1) || FW_P1;
  const a = WHEEL.px(p0, deg), b = WHEEL.px(p1, deg);
  if(ln){ ln.setAttribute('x1',WHEEL.n(a[0])); ln.setAttribute('y1',WHEEL.n(a[1])); ln.setAttribute('x2',WHEEL.n(b[0])); ln.setAttribute('y2',WHEEL.n(b[1])); }
  if(dt){ dt.setAttribute('cx',WHEEL.n(b[0])); dt.setAttribute('cy',WHEEL.n(b[1])); }
}
window.fsNeedleCommon = fsNeedleCommon;

/* 盘心四行按页内换算函数逐行写；颜色行由页给。 */
function fsCoreCommon(ids, txtFn){
  const t = txtFn();
  for(let k = 0; k < ids.length; k++){
    const col = (k === 3 && t[4] !== undefined) ? t[4] : undefined;
    WHEEL.text(ids[k], t[k], col);
  }
}
window.fsCoreCommon = fsCoreCommon;

/* ===== 节气日期拣选（风水两页共用） =====
   在年份前后一年里找该节气的公历日期（yyyymmdd 数）；after 为假取 ref 当日或之前最近一处，
   为真取 ref 之后最近一处。ref 为同形日期数。 */
function xjPickJQ(name, ref, after, y){
  const cand=[];
  for(const ly of [y-1,y,y+1]){
    const s=Solar.fromYmd(ly,1,1).getLunar().getJieQiTable()[name];
    if(s) cand.push(s.getYear()*10000+s.getMonth()*100+s.getDay());
  }
  cand.sort((a,b)=>a-b);
  if(!after){ let ch=null; for(const c of cand) if(c<=ref) ch=c; return ch||cand[0]; }
  for(const c of cand) if(c>ref) return c;
  return cand[cand.length-1];
}
window.xjPickJQ = xjPickJQ;

/* 三合盘详情：四段布局共通，数据由页给。 */
function fsShDetailCommon(){
  const d=FS_SH_DATA; if(!d) return;
  const i=FS_SH_SEL, g=d.gong[i], jx=d.gongJx[i];
  const bad=jx.indexOf('凶')>=0;
  fwDetail('fsShDetail',
    `${g.gong}宫 ${g.zhi}方 <span class="${bad?'wd-x':'wd-g'}">${jx}</span>`
    +`<span class="wd-br"></span>`
    +`${d.gongNote[i]}`
    +`<span class="wd-br"></span>`
    +`${d.ju}：${d.zs}起长生、帝旺在${d.miao}、墓库在${d.mu} 收山出煞：${d.shou}`
    +`<span class="wd-br"></span>`
    +`来水宜长生、冠带、临官、帝旺四宫，去水宜衰、墓、绝、胎四宫；沐浴来水不吉而宜去。`
    +`<span class="wd-br"></span>`
    +FS.SH_QUJIAO);
}
window.fsShDetailCommon = fsShDetailCommon;

/* 玄空盘数据行与盘心文案：两页同文，收此一件。 */
function fsXkRowCommon(i){
  const d=FS_XK_DATA, n=FS_ZB_ORDER[i];
  return {palace:n,
    yun:d.yunBoard.find(x=>x.palace===n).star,
    sit:d.sitBoard.find(x=>x.palace===n).star,
    face:d.faceBoard.find(x=>x.palace===n).star};
}
window.fsXkRowCommon = fsXkRowCommon;

function fsXkCoreTxtCommon(i){
  const d=FS_XK_DATA, r=fsXkRowCommon(i), cj=FS.comboJx(r.sit, r.face);
  return [STAR_NAMES[d.yun.yun],
    FS.NINE_BAGUA[r.palace]+FS.NINE_DIR[r.palace]+' 运'+r.yun,
    '山'+r.sit+'向'+r.face+' '+cj.jx,
    fwJxFill(cj.jx)||'var(--wheel-ink2)'];
}
window.fsXkCoreTxtCommon = fsXkCoreTxtCommon;

/* 坐向控件同步：把基础设定里各字段的值刷到页内全部同名字段控件；字段清单由页给。 */
function fsSyncLocalBase(fields){
  const v = function(id){ const e = document.getElementById(id); return e ? e.value : ''; };
  fields.forEach(function(f){
    document.querySelectorAll(f.sel).forEach(function(el){ el.value = v(f.src); });
  });
}
window.fsSyncLocalBase = fsSyncLocalBase;
