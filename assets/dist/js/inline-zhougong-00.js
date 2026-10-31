
/* 折叠态属交互态：页体折叠块的开合由本页记忆，键按页独立，localStorage 主存、sessionStorage 隐私兜底 */
var zgBadge = { 1:'吉', '-1':'凶', 0:'兼' };
var ZG_ON_CAT = 0;
function zgLuckBadge(luck){
  var cls = luck === 1 ? 'zg-j' : (luck === -1 ? 'zg-x' : 'zg-jian');
  return '<i class="zg-badge ' + cls + '">' + zgBadge[String(luck)] + '</i>';
}
function zgCard(r){
  return '<div class="zg-card">' +
    '<div class="zg-card-top"><span class="zg-cat-chip">' + r.catName + '：' + r.sub + '</span>' + zgLuckBadge(r.luck) + '</div>' +
    '<div class="zg-entry"><span class="zg-img">' + r.img + '</span>' +
    (r.omen ? '<span class="zg-omen">' + r.omen + '</span>' : '') + '</div>' +
    '</div>';
}
/* 断梦秘书：同名梦象索引（去"梦"字头后与通行本梦象比对），键为规范化梦象 */
var ZG_DM_DUI = {};
var ZG_DM_NORM = {};
/* 断梦秘书同象两见索引：同一梦象在书中出现两次以上者，卡片标注并存不删 */
var ZG_DM_DUP = {};
/* 原书两见标注：释文详略或占断不同，各存其真 */
function zgDmDupHtml(img){
  if ((ZG_DM_DUP[img] || 0) < 2) return '';
  return '<div class="zd-dup">此象原书两见，前后释文详略有别，各存其真，未加删并。</div>';
}
/* 断梦条目卡：占辞为释义原文，无吉凶标签，小节名随卡显示；两书同名梦象时附通行本对照行 */
function zgDmCard(r){
  return '<div class="zg-card">' +
    '<div class="zg-card-top"><span class="zg-cat-chip">' + ZG_DM_CATS[r[0] * 2 - 1] + '：' + r[1].replace(/^梦/, '') + '</span></div>' +
    '<div class="zg-entry"><span class="zg-img">' + r[2] + '</span>' +
    '<span class="zg-omen">' + r[3] + '</span></div>' +
    zgDmDupHtml(r[2]) +
    zgDmDuiHtml(r[2]) +
    '</div>';
}
/* 通行本同名条目占辞对照行：以断梦本梦象去"梦"字头在通行本条目中精确匹配 */
function zgDmDuiHtml(img){
  var bare = img.replace(/^梦/, '');
  var list = ZG_ROWS.filter(function(x){ return x.img === bare; });
  if (!list.length) return '';
  return '<div class="zd-dui"><b>通行本对照</b>：' + list.map(function(x){
    return x.catName + '：' + x.img + '，' + x.omen;
  }).join('；') + '</div>';
}
/* 断梦秘书对照行：检索通行本命中条目时，查同名梦象的断梦占辞并列 */
function zgDuiReverseHtml(img){
  var dm = ZG_DM_DUI[img];
  if (!dm || !dm.length) return '';
  return '<div class="zd-dui"><b>断梦秘书对照</b>：' + dm.map(function(r){
    return ZG_DM_CATS[r[0] * 2 - 1] + '：' + r[2] + '，' + r[3];
  }).join('；') + '</div>';
}
/* 通行本卡（含断梦对照）：结构与 zgCard 同形，对照行收在卡片内 */
function zgCardDui(r){
  return '<div class="zg-card">' +
    '<div class="zg-card-top"><span class="zg-cat-chip">' + r.catName + '：' + r.sub + '</span>' + zgLuckBadge(r.luck) + '</div>' +
    '<div class="zg-entry"><span class="zg-img">' + r.img + '</span>' +
    (r.omen ? '<span class="zg-omen">' + r.omen + '</span>' : '') + '</div>' +
    zgDuiReverseHtml(r.img) +
    '</div>';
}
function zgRenderSearch(){
  var q = document.getElementById('zgQ').value;
  var out = document.getElementById('zgOut');
  var list = zgSearch(q);
  if (!q) { out.innerHTML = ''; return; }
  if (!list.length) {
    var kRaw = q.replace(/^梦(见|到|了)?/, '').replace(/^\s+|\s+$/g, '');
    var k = escapeHtml(kRaw);
    var near = zgNeighbors(q);
    var mg = zgModernMatch(kRaw);
    var html = '<div class="zg-empty"><b>底本无“' + k + '”之象。</b></div>';
    if (mg) {
      html += '<div class="zg-empty zg-mtip">可参古象：'
        + mg.terms.map(function(t){ return '<button type="button" class="zg-tip-q" data-q="' + t + '">' + t + '</button>'; }).join('、')
        + '。' + mg.why + '（今人推类，非底本文；检得者为古象本占，非“' + k + '”之占）</div>';
    }
    if (near.length) {
      html += '<div class="zg-loose">以下条目仅与所问字面相关（文字重合），并非“' + k + '”之占；'
        + '吉凶徽标属该条目本身，与所问无涉，不可据以断所问之吉凶。</div>' + near.map(zgCard).join('');
    }
    out.innerHTML = html;
    return;
  }
  var shown = Math.min(list.length, 60);
  var head = '检得 ' + list.length + ' 条';
  if (list.length > shown) head += '，显示前 ' + shown + ' 条';
  out.innerHTML = '<div class="zg-count">' + head + '</div>' + list.map(zgCardDui).join('');
}
function zgRenderCats(){
  var counts = zgCatCounts();
  var html = '';
  ZG_CATS.forEach(function(name, i){
    html += '<button type="button" class="zg-chip" data-cat="' + (i + 1) + '">' + name + ' <b>' + counts[i + 1] + '</b></button>';
  });
  document.getElementById('zgCats').innerHTML = html;
}
function zgRenderCat(cat){
  var groups = zgCatGroups(cat);
  var html = '<h3 class="zg-cat-h">' + ZG_CATS[cat - 1] + '（第' + ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','二十一','二十二','二十三','二十四','二十五','二十六','二十七'][cat - 1] + '类）</h3>';
  html += groups.map(function(g){
    return '<div class="zg-sub"><div class="zg-sub-h">' + g.sub + '（' + g.items.length + '）</div>' +
      g.items.map(zgCard).join('') + '</div>';
  }).join('');
  document.getElementById('zgBrowse').innerHTML = html;
}
function zgRenderStats(){
  var s = zgStats();
  var dmTotal = ZG_DM_SETS.length;
  document.getElementById('zgStats').innerHTML =
    '<span class="zg-stat"><b>' + s.cats + '</b>门类</span>' +
    '<span class="zg-stat"><b>' + s.total + '</b>句占辞</span>' +
    '<span class="zg-stat zg-sj"><b>' + s.ji + '</b>吉</span>' +
    '<span class="zg-stat zg-sx"><b>' + s.xiong + '</b>凶</span>' +
    '<span class="zg-stat zg-sjian"><b>' + s.jian + '</b>吉凶兼</span>' +
    '<span class="zg-stat"><b>' + dmTotal + '</b>断梦秘书条</span>' +
    '<span class="zg-stat"><b>' + ZG_DM_DUI_COUNT + '</b>同名异文</span>';
}

function zgRenderNotes(){
  var tb = document.querySelector('#zgNotes tbody');
  tb.innerHTML = ZG_NOTES.map(function(n){
    return '<tr><td>' + n[0] + '</td><td>' + n[1] + '</td></tr>';
  }).join('');
  document.getElementById('zgNotesSum').textContent = '底本用字说明（' + ZG_NOTES.length + ' 条）';
}
/* 断梦秘书：地支类 chip 渲染、某类按小节分组浏览 */
var ZG_DM_ON_CAT = 0;
var ZG_DM_CAT_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申'];
function zgDmRenderCats(){
  var counts = {};
  ZG_DM_SETS.forEach(function(r){ counts[r[0]] = (counts[r[0]] || 0) + 1; });
  var html = '';
  ZG_DM_CAT_ORDER.forEach(function(zhi, i){
    html += '<button type="button" class="zg-chip zd-chip" data-dmcat="' + (i + 1) + '">' + zhi + ' ' + ZG_DM_CATS[i * 2 + 1] + ' <b>' + (counts[i + 1] || 0) + '</b></button>';
  });
  document.getElementById('zgDmCats').innerHTML = html;
}
function zgDmRenderCat(cat){
  var rows = ZG_DM_SETS.filter(function(r){ return r[0] === cat; });
  var groups = [], idx = {};
  rows.forEach(function(r){
    if (!idx[r[1]]) { idx[r[1]] = { sub: r[1], items: [] }; groups.push(idx[r[1]]); }
    idx[r[1]].items.push(r);
  });
  var zhi = ZG_DM_CAT_ORDER[cat - 1];
  var html = '<h3 class="zg-cat-h">' + zhi + ' ' + ZG_DM_CATS[cat * 2 - 1] + '（' + rows.length + ' 条）</h3>';
  html += groups.map(function(g){
    return '<div class="zg-sub"><div class="zg-sub-h">' + g.sub + '（' + g.items.length + '）</div>' +
      g.items.map(zgDmCard).join('') + '</div>';
  }).join('');
  document.getElementById('zgDmBrowse').innerHTML = html;
}
function zgAiContext(){
  var luckName = { '1':'吉', '-1':'凶', '0':'吉凶兼' };
  var s = '周公解梦（通行本《周公解梦》二十七类九百五十一句占辞，托名周公旦，隋唐以降民间占梦材料辑录）\n';
  if (ZG_DM_ON_CAT){
    var dmRows = ZG_DM_SETS.filter(function(r){ return r[0] === ZG_DM_ON_CAT; });
    s += '另附《断梦秘书》当前浏览类别：' + ZG_DM_CAT_ORDER[ZG_DM_ON_CAT - 1] + ' '
      + ZG_DM_CATS[ZG_DM_ON_CAT * 2 - 1] + '（全类 ' + dmRows.length + ' 条）\n';
    var dmLim = 4000, dmUsed = 0, dmCut = false;
    for (var di = 0; di < dmRows.length; di++){
      var dmLine = dmRows[di][2] + '：' + dmRows[di][3] + '\n';
      if (dmUsed + dmLine.length > dmLim) { dmCut = true; break; }
      s += dmLine; dmUsed += dmLine.length;
    }
    if (dmCut) s += '（以上为节选，已按字数截断；全类共 ' + dmRows.length
      + ' 条，如需其余条目，请提示用户输入具体梦象关键词检索，勿臆造未列出的条目）\n';
    return s;
  }
  if (ZG_ON_CAT){
    s += '当前浏览类别：' + ZG_CATS[ZG_ON_CAT - 1] + '\n';
    zgCatGroups(ZG_ON_CAT).forEach(function(g){
      s += '\n【' + g.sub + '】\n' + g.items.map(function(r){ return r.img + '：' + (r.omen || ''); }).join('\n');
    });
    return s;
  }
  var q = document.getElementById('zgQ').value;
  if (q){
    var list = zgSearch(q);
    if (list.length){
      s += '检索梦象：' + q + '\n检得条目（括注为吉凶判读）：\n' + list.map(function(r){
        return r.catName + '：' + r.img + '，' + (r.omen || '') + '（' + luckName[String(r.luck)] + '）';
      }).join('\n');
    } else {
      s += '检索梦象：' + q + '，底本无此象。以下仅为字面相关条目（文字重合），非此象占辞，'
        + '严禁据此推断所问梦象的吉凶，须明确告知用户底本无文：\n' + zgNeighbors(q).map(function(r){
        return r.catName + '：' + r.img + '，' + (r.omen || '');
      }).join('\n');
      var mg = zgModernMatch(q);
      if (mg) s += '\n古象推类线索（今人推类，非底本文）：可参' + mg.terms.join('、') + '，' + mg.why;
    }
    return s;
  }
  return s + '当前未检索或未选择类别，请提示用户输入梦象关键词（如蛇、掉牙、河水），或点选分类浏览某一类。';
}
function zgRenderPoem(){
  /* 按句号切分、每行四句：硬切 16 字会把"庄周虚化蝶"从短语中间断开 */
  var parts = ZG_POEM.match(/[^。]+。/g) || [ZG_POEM];
  var line1 = parts.slice(0, 4).join('');
  var line2 = parts.slice(4).join('');
  document.getElementById('zgPoem').innerHTML = '诗曰：' + line1 + '<br>' + line2;
}


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) xjSaveFold('zgFoldState','details[id]');
    },true);
    renderChrome('zhougong.html');
    xjApplyFold('zgFoldState','details[id]');
    ZG_DM_SETS.forEach(function(r){
      var bare = r[2].replace(/^梦/, '');
      if (!ZG_DM_DUI.hasOwnProperty(bare)) { ZG_DM_DUI[bare] = []; ZG_DM_NORM[bare] = r[2]; }
      ZG_DM_DUI[bare].push(r);
    });
    ZG_DM_SETS.forEach(function(r){ ZG_DM_DUP[r[2]] = (ZG_DM_DUP[r[2]] || 0) + 1; });
    (function(){
      var ZG_DM_DUI_COUNT = (function(){
      var imgs = {};
      ZG_ROWS.forEach(function(x){ imgs[x.img] = 1; });
      var seen = {};
      ZG_DM_SETS.forEach(function(r){
        var b = r[2].replace(/^梦/, '');
        if (imgs[b] && !seen[b]) { seen[b] = 1; }
      });
      return Object.keys(seen).length;
    })();
      window.ZG_DM_DUI_COUNT = ZG_DM_DUI_COUNT;
    })();
    document.getElementById('zgDmCats').addEventListener('click', function(e){
      var btn = e.target.closest('.zd-chip');
      if (!btn) return;
      var cat = +btn.getAttribute('data-dmcat');
      var browse = document.getElementById('zgDmBrowse');
      if (btn.classList.contains('on')) {
        btn.classList.remove('on');
        ZG_DM_ON_CAT = 0;
        browse.innerHTML = '';
        return;
      }
      document.querySelectorAll('.zd-chip').forEach(function(c){ c.classList.remove('on'); });
      btn.classList.add('on');
      ZG_DM_ON_CAT = cat;
      zgDmRenderCat(cat);
      if (browse.scrollIntoView) browse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    document.getElementById('zgBtn').addEventListener('click', zgRenderSearch);
    document.getElementById('zgQ').addEventListener('keydown', function(e){
      if (e.key === 'Enter') zgRenderSearch();
    });
    document.getElementById('zgOut').addEventListener('click', function(e){
      var b = e.target.closest('.zg-tip-q');
      if (!b) return;
      document.getElementById('zgQ').value = b.getAttribute('data-q');
      zgRenderSearch();
    });
    document.getElementById('zgCats').addEventListener('click', function(e){
      var btn = e.target.closest('.zg-chip');
      if (!btn) return;
      var cat = +btn.getAttribute('data-cat');
      var browse = document.getElementById('zgBrowse');
      if (btn.classList.contains('on')) {
        btn.classList.remove('on');
        ZG_ON_CAT = 0;
        browse.innerHTML = '';
        return;
      }
      document.querySelectorAll('.zg-chip').forEach(function(c){ c.classList.remove('on'); });
      btn.classList.add('on');
      ZG_ON_CAT = cat;
      zgRenderCat(cat);
      if (browse.scrollIntoView) browse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    /* 诗文与分类已是页面终值，data-built 记写出当日，访问日与所记不同才重出。 */
    var zgBuilt = document.querySelector('.page-zg');
    zgBuilt = zgBuilt ? zgBuilt.getAttribute('data-built') : '';
    if (zgBuilt !== xjNowStr().slice(0, 10)) {
      zgRenderPoem();
      zgRenderCats();
      zgDmRenderCats();
    }
    zgRenderStats();
    zgRenderNotes();
    mountAI(zgAiContext, '周公解梦', { share:{
      page: 'zhougong',
      title: '周公解梦在线查询', result: '#zgOut',
      collect: function(){
        var d = shareDefaultCollect();
        d.__zgCat = ZG_ON_CAT ? String(ZG_ON_CAT) : '';
        d.__zgDmCat = ZG_DM_ON_CAT ? String(ZG_DM_ON_CAT) : '';
        return d;
      },
      restore: function(d){
        ZG_ON_CAT = 0;
        ZG_DM_ON_CAT = 0;
        document.querySelectorAll('.zg-chip').forEach(function(c){ c.classList.remove('on'); });
        document.querySelectorAll('.zd-chip').forEach(function(c){ c.classList.remove('on'); });
        document.getElementById('zgBrowse').innerHTML = '';
        document.getElementById('zgDmBrowse').innerHTML = '';
        shareDefaultRestore(d);
        if (d && d.__zgDmCat){
          var dmcat = +d.__zgDmCat;
          if (dmcat >= 1 && dmcat <= 9){
            ZG_DM_ON_CAT = dmcat;
            var db = document.querySelector('.zd-chip[data-dmcat="' + dmcat + '"]');
            if (db) db.classList.add('on');
            zgDmRenderCat(dmcat);
            return;
          }
        }
        if (d && d.__zgCat){
          var cat = +d.__zgCat;
          if (cat >= 1 && cat <= 27){
            ZG_ON_CAT = cat;
            var b = document.querySelector('.zg-chip[data-cat="' + cat + '"]');
            if (b) b.classList.add('on');
            zgRenderCat(cat);
            return;
          }
        }
        if (document.getElementById('zgQ').value) zgRenderSearch();
      },
      /* 刷新重出：全站顶层机制回填输入后按此钩子重排结果，无关键词则不动 */
      recast:function(){ if (document.getElementById('zgQ').value) zgRenderSearch(); }
    } });
  }, 0);
});
