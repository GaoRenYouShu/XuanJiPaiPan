
const LV_CLS={'上上':'lv-ji','上上签':'lv-ji','上上大吉签':'lv-ji','大吉':'lv-ji','上吉':'lv-ji','上吉签':'lv-ji','上平签':'lv-ji','上签':'lv-ji','上':'lv-ji','中吉':'lv-ji','中上签':'lv-ji','中平':'lv-ping','中平签':'lv-ping','中签':'lv-ping','中':'lv-ping','中下':'lv-xiong','下签':'lv-xiong','下下':'lv-xiong','下吉':'lv-xiong','下':'lv-xiong'};
let LAST=null, LAST_SET=null;
function curSet(){ return LQ_SETS[document.getElementById('lqSet').value]||LQ_SETS['三山国王灵签41签']; }
function fillSet(){
  const sel=document.getElementById('lqSet');
  sel.innerHTML=Object.keys(LQ_SETS).map(k=>`<option value="${k}">${k}</option>`).join('');
}
/* 签诗按两句一联装箱：联内随行高，联间另行取同组档，四句读作两联 */
function shiHtml(shi){
  const lian=[];
  for(let i=0;i<shi.length;i+=2) lian.push(shi.slice(i,i+2));
  return lian.map(rows=>`<div class="lq-lian">${rows.map(l=>`<div>${l}</div>`).join('')}</div>`).join('');
}
function show(sign, setKey){
  const set=LQ_SETS[setKey]||curSet();
  const cats=Object.keys(sign.fen||{});
  const fenHtml=cats.length?`<h3 class="rel-title">逐项解签</h3><div class="lq-info">${cats.map(k=>`<div class="lq-i"><span class="k">${k}</span><span class="v">${sign.fen[k]}</span></div>`).join('')}</div>`:'';
  const guHtml=sign.gu?`<p class="lq-gu">古人典故：${sign.gu}</p>`:'';
  const lvHtml=sign.lv?`<div class="lq-lv ${LV_CLS[sign.lv]||''}">${sign.lv}</div>`:'';
  const jieHtml=sign.jie?`<h4 class="det-h">解曰</h4><div class="lq-jie">${sign.jie.split('\n').filter(p=>p.trim()).map(p=>`<p>${p}</p>`).join('')}</div>`:'';
  const dianHtml=set.dian?`<details class="lq-ref" id="lqDian"><summary>${setKey}典故</summary><div class="lq-ref-b">${set.dian}</div></details>`:'';
  document.getElementById('out').innerHTML=`
  <div class="lq-slip">
    <div class="lq-head">
      <div class="lq-no">第 ${sign.no} 签</div>
      ${lvHtml}
    </div>
    <div class="lq-poem">${shiHtml(sign.shi)}</div>
    ${guHtml}
    ${jieHtml}
  </div>
  ${fenHtml}
  ${dianHtml}
  <p class="sub-note">※ 求签贵在诚心，一事一签，不宜反复重摇。切换签种可对比不同体系之签文。</p>`;
  xjApplyFold('lqFoldState','#out details[id]');
  LAST=sign; LAST_SET=setKey;
}
function draw(){
  const set=curSet(), key=document.getElementById('lqSet').value;
  const idx=Math.floor(Math.random()*set.signs.length);
  const box=document.getElementById('out');
  box.innerHTML='<div class="lq-shake">🎋 签筒摇动中…</div>';
  setTimeout(()=>{ show(set.signs[idx], key); lqSaveHist(key, set.signs[idx].no); },650);
}
function pickNo(){
  const key=document.getElementById('lqSet').value, set=curSet();
  const s=prompt('请输入签号（1 - '+set.signs.length+'）：');
  if(!s)return; const n=parseInt(s,10);
  const sign=set.signs.find(x=>x.no===n);
  if(sign){ show(sign, key); lqSaveHist(key, n); } else alert('暂无该签号（当前收录 1-'+set.signs.length+'）');
}
const LQ_SEL_KEY='lq_set_sel';
function saveSel(){ try{ localStorage.setItem(LQ_SEL_KEY, document.getElementById('lqSet').value); }catch(e){} }

/* 签文库检索：按当前签种筛签号、吉凶、典故、签诗、解曰、分项，命中即出签卡 */
function escLq(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&lt;').replace(/"/g,'&quot;'); }
function lqSearchText(sign){
  const parts=[String(sign.no), sign.lv||'', sign.gu||'', (sign.shi||[]).join(' '), sign.jie||''];
  if(sign.fen) for(const k in sign.fen) parts.push(k+sign.fen[k]);
  return parts.join(' ');
}
function lqRenderSearch(){
  const host=document.getElementById('lqSearchList');
  if(!host) return;
  const set=curSet();
  const kw=(document.getElementById('lqSearchInput').value||'').trim();
  const hits=set.signs.filter(s=>!kw||lqSearchText(s).indexOf(kw)>=0);
  document.getElementById('lqSearchCount').textContent=kw?('命中 '+hits.length+' 签'):('共 '+hits.length+' 签');
  const cap=kw?60:12;
  host.innerHTML=hits.slice(0,cap).map(s=>{
    const first=(s.shi&&s.shi[0]||'').slice(0,18);
    return '<div class="lq-sr-row" onclick="lqSearchGo('+s.no+')"><span class="lq-sr-no">第'+s.no+'签</span><span class="lq-sr-lv">'+escLq(s.lv||'未标吉凶')+'</span><span class="lq-sr-t">'+escLq((s.gu?s.gu+'　':'')+first)+'</span></div>';
  }).join('')+(hits.length>cap?'<div class="lq-sr-more">仅列前 '+cap+' 签，请加字缩小范围</div>':'');
}
function lqSearchGo(no){
  const key=document.getElementById('lqSet').value, set=curSet();
  const sign=set.signs.find(x=>x.no===no);
  if(sign){ show(sign, key); document.getElementById('out').scrollIntoView({behavior:'smooth'}); }
}

/* 求签历史：会话与刷新皆可回看，存签种与签号即按号重放，不存渲染文本 */
const LQ_HIST_KEY='lqHistory';
function lqSaveHist(setKey, no){
  try{
    const his=JSON.parse(localStorage.getItem(LQ_HIST_KEY)||'[]');
    const dup=his.findIndex(h=>h.s===setKey&&h.no===no);
    if(dup>=0) his.splice(dup,1);
    const n=new Date();
    his.unshift({t:n.toLocaleString(), s:setKey, no});
    localStorage.setItem(LQ_HIST_KEY, JSON.stringify(his.slice(0,9)));
  }catch(e){}
}
function showLqHistory(){
  let his=[];
  try{ his=JSON.parse(localStorage.getItem(LQ_HIST_KEY)||'[]'); }catch(e){}
  const mask=document.getElementById('lqHistMask');
  if(!mask){
    const m=document.createElement('div'); m.id='lqHistMask'; m.className='modal-mask';
    m.setAttribute('role','dialog'); m.setAttribute('aria-label','求签历史');
    m.innerHTML='<div class="modal lq-hist-modal"><span class="close" onclick="closeLqHist()" aria-label="关闭">×</span><div class="ly-hist-head">求签历史（最多9条）</div><div class="ly-hist-list" id="lqHistList"></div><div class="sub-note ly-hist-foot">点击回看还原该次签卡。数据保存在浏览器本地，按 ESC 关闭。</div></div>';
    m.addEventListener('click',function(e){ if(e.target===m) closeLqHist(); });
    document.body.appendChild(m);
  }
  const host=document.getElementById('lqHistList');
  if(!his.length){ host.innerHTML='<div class="lq-hist-empty">暂无求签历史。摇签后自动保存。</div>'; }
  else{
    host.innerHTML=his.map((h,i)=>{
      return '<div class="lq-hist-row"><span class="lq-hist-t">'+escLq(h.t)+'</span><span class="lq-hist-g">'+escLq(h.s)+' 第'+h.no+'签</span><span class="lq-hist-a"><button class="btn" aria-label="回看第'+(i+1)+'条" onclick="restoreLqHist('+i+')">回看</button><button class="btn lq-hist-del" aria-label="删除第'+(i+1)+'条" onclick="delLqHistory('+i+')">×</button></span></div>';
    }).join('');
  }
  document.getElementById('lqHistMask').classList.add('show');
}
function closeLqHist(){ const m=document.getElementById('lqHistMask'); if(m) m.classList.remove('show'); }
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLqHist(); });
function delLqHistory(i){
  try{
    const his=JSON.parse(localStorage.getItem(LQ_HIST_KEY)||'[]');
    if(i<0||i>=his.length) return;
    his.splice(i,1); localStorage.setItem(LQ_HIST_KEY, JSON.stringify(his));
    showLqHistory();
  }catch(e){}
}
function restoreLqHist(i){
  try{
    const his=JSON.parse(localStorage.getItem(LQ_HIST_KEY)||'[]');
    const h=his[i]; if(!h) return;
    const set=LQ_SETS[h.s]; if(!set) return;
    const sign=set.signs.find(x=>x.no===h.no); if(!sign) return;
    document.getElementById('lqSet').value=h.s;
    saveSel();
    show(sign, h.s);
    closeLqHist();
    document.getElementById('out').scrollIntoView({behavior:'smooth'});
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', function(){
  const sr=document.getElementById('lqSearchInput');
  if(sr) sr.addEventListener('input', lqRenderSearch);
  const ref=document.getElementById('lqSearchRef');
  if(ref) ref.addEventListener('toggle', function(){ if(ref.open) lqRenderSearch(); });
  if(ref && ref.open) lqRenderSearch();
});
