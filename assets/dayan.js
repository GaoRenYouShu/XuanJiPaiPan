/* 大衍筮法引擎：四十九策三变成爻、十八变成卦，按动爻数取辞。
   揲蓍从朱熹《筮仪》每变挂一之说；取辞据《易学启蒙·考变占》。 */
(function () {
  'use strict';

  var D = window.DAYAN_DATA || {};
  var POS = ['初', '二', '三', '四', '五', '上'];

  function rnd(n) { return Math.floor(Math.random() * n); }

  /* 一变：四十九策或余策 n，分二、挂一、揲四、归奇。
     左堆取一至 n 减二策，右堆为其余；右堆先取一策挂于指间，两堆各以四数之。 */
  function bian(n) {
    var left = 1 + rnd(n - 2);
    var right = n - left - 1;
    var rl = left % 4 === 0 ? 4 : left % 4;
    var rr = right % 4 === 0 ? 4 : right % 4;
    var guai = rl + rr + 1;
    return { left: left, right: right, guai: guai, remain: n - guai };
  }

  /* 一爻：三变，余策除以四得六至九 */
  function yao() {
    var n = 49, list = [], i;
    for (i = 0; i < 3; i++) {
      var b = bian(n);
      list.push(b);
      n = b.remain;
    }
    return { num: n / 4, remain: n, bians: list };
  }

  /* 六爻，自初爻至上爻 */
  function cast() {
    var out = [], i;
    for (i = 0; i < 6; i++) out.push(yao());
    return out;
  }

  /* 爻题：阳爻称九，阴爻称六；初与上位名在前，二至五数在前 */
  function titleOf(pos, yang) {
    var s = yang ? '九' : '六';
    if (pos === 0) return '初' + s;
    if (pos === 5) return '上' + s;
    return s + POS[pos];
  }

  /* 由六爻得数构卦并取辞 */
  function build(nums) {
    var bits = [], move = [], i, n;
    for (i = 0; i < 6; i++) {
      n = Number(nums[i]);
      bits.push((n === 7 || n === 9) ? 1 : 0);
      move.push(n === 9 || n === 6);
    }
    var bianBits = bits.map(function (b, k) { return move[k] ? (b ? 0 : 1) : b; });
    var ben = hexInfo(bits);
    var bian = hexInfo(bianBits);
    var yaoList = [];
    for (i = 0; i < 6; i++) {
      n = Number(nums[i]);
      var meta = D.nums[n] || D.nums[7];
      var yang = !meta.yin;
      var title = titleOf(i, yang);
      var key = ben.name + POS[i];
      yaoList.push({
        pos: i,
        num: n,
        name: meta.name,
        yin: meta.yin,
        move: meta.move,
        title: title,
        ci: (typeof YAO_CI !== 'undefined' && YAO_CI[key]) ? YAO_CI[key] : '',
        xiaoxiang: (typeof YAO_XIAOXIANG !== 'undefined' && YAO_XIAOXIANG[key]) ? YAO_XIAOXIANG[key] : ''
      });
    }
    var moving = [];
    for (i = 0; i < 6; i++) if (move[i]) moving.push(i);
    var rule = (D.bian || [])[moving.length] || null;
    return {
      nums: nums.map(Number),
      yao: yaoList,
      bits: bits,
      bianBits: bianBits,
      ben: ben,
      bian: bian,
      moving: moving,
      nMove: moving.length,
      rule: rule,
      picks: pickOf(yaoList, ben, bian, moving),
      guaCi: (typeof GUA_CI !== 'undefined' && GUA_CI[ben.name]) ? GUA_CI[ben.name] : '',
      tuan: (typeof GUA_TUAN !== 'undefined' && GUA_TUAN[ben.name]) ? GUA_TUAN[ben.name] : '',
      daxiang: (typeof GUA_DAXIANG !== 'undefined' && GUA_DAXIANG[ben.name]) ? GUA_DAXIANG[ben.name] : '',
      bianCi: (typeof GUA_CI !== 'undefined' && GUA_CI[bian.name]) ? GUA_CI[bian.name] : '',
      bianTuan: (typeof GUA_TUAN !== 'undefined' && GUA_TUAN[bian.name]) ? GUA_TUAN[bian.name] : '',
      bianDaxiang: (typeof GUA_DAXIANG !== 'undefined' && GUA_DAXIANG[bian.name]) ? GUA_DAXIANG[bian.name] : '',
      yong: (D.yong && D.yong[ben.name]) ? D.yong[ben.name] : ''
    };
  }

  /* 取辞：按动爻数分七条 */
  function pickOf(yaoList, ben, bian, moving) {
    var picks = [], m = moving.length, i;
    if (m === 0) {
      picks.push({ label: '本卦卦辞', text: (typeof GUA_CI !== 'undefined' && GUA_CI[ben.name]) ? GUA_CI[ben.name] : '', note: '内卦为贞，外卦为悔', main: false });
    } else if (m === 1) {
      var y1 = yaoList[moving[0]];
      picks.push({ label: y1.title + '爻辞', text: y1.ci, note: y1.xiaoxiang ? '小象：' + y1.xiaoxiang : '', main: true });
    } else if (m === 2) {
      var a = moving[0], b = moving[1];
      picks.push({ label: yaoList[a].title + '爻辞', text: yaoList[a].ci, note: yaoList[a].xiaoxiang ? '小象：' + yaoList[a].xiaoxiang : '', main: false });
      picks.push({ label: yaoList[b].title + '爻辞', text: yaoList[b].ci, note: yaoList[b].xiaoxiang ? '小象：' + yaoList[b].xiaoxiang : '', main: true });
    } else if (m === 3) {
      /* 三爻变二十卦：初爻变者为前十卦，主贞；初爻不变者为后十卦，主悔 */
      var qian = moving.indexOf(0) >= 0;
      picks.push({ label: '本卦卦辞', text: (typeof GUA_CI !== 'undefined' && GUA_CI[ben.name]) ? GUA_CI[ben.name] : '', note: qian ? '前十卦，主贞' : '本卦为贞', main: qian });
      picks.push({ label: '之卦卦辞', text: (typeof GUA_CI !== 'undefined' && GUA_CI[bian.name]) ? GUA_CI[bian.name] : '', note: qian ? '之卦为悔' : '后十卦，主悔', main: !qian });
    } else if (m === 4 || m === 5) {
      var still = [];
      for (i = 0; i < 6; i++) if (moving.indexOf(i) < 0) still.push(i);
      for (i = 0; i < still.length; i++) {
        var k = still[i];
        var key = bian.name + POS[k];
        var ci = (typeof YAO_CI !== 'undefined' && YAO_CI[key]) ? YAO_CI[key] : '';
        var xx = (typeof YAO_XIAOXIANG !== 'undefined' && YAO_XIAOXIANG[key]) ? YAO_XIAOXIANG[key] : '';
        picks.push({
          label: '之卦' + titleOf(k, !yaoList[k].yin) + '爻辞',
          text: ci,
          note: (xx ? '小象：' + xx : ''),
          main: (m === 4) ? (i === 0) : true
        });
      }
    } else {
      var yongText = (D.yong && D.yong[ben.name]) ? D.yong[ben.name] : '';
      if (yongText) {
        picks.push({ label: ben.name === '乾为天' ? '用九' : '用六', text: yongText, note: '六爻皆变，乾坤占二用', main: true });
      } else {
        picks.push({ label: '之卦卦辞', text: (typeof GUA_CI !== 'undefined' && GUA_CI[bian.name]) ? GUA_CI[bian.name] : '', note: '六爻皆变，余卦占之卦卦辞', main: true });
      }
    }
    return picks;
  }

  /* 查一卦全文：卦辞、彖传、大象、六爻爻辞与小象 */
  function lookup(name) {
    if (!name) return null;
    var info = null;
    var order = (D.order || []);
    if (order.indexOf(name) < 0) return null;
    var bits = bitsOfName(name);
    if (bits) info = hexInfo(bits);
    var yao = [], i, key, pos;
    for (i = 0; i < 6; i++) {
      pos = POS[i];
      key = name + pos;
      yao.push({
        title: titleOf(i, bits ? !!bits[i] : true),
        ci: (typeof YAO_CI !== 'undefined' && YAO_CI[key]) ? YAO_CI[key] : '',
        xiaoxiang: (typeof YAO_XIAOXIANG !== 'undefined' && YAO_XIAOXIANG[key]) ? YAO_XIAOXIANG[key] : ''
      });
    }
    return {
      name: name,
      upper: info ? info.upper : '',
      lower: info ? info.lower : '',
      guaCi: (typeof GUA_CI !== 'undefined' && GUA_CI[name]) ? GUA_CI[name] : '',
      tuan: (typeof GUA_TUAN !== 'undefined' && GUA_TUAN[name]) ? GUA_TUAN[name] : '',
      daxiang: (typeof GUA_DAXIANG !== 'undefined' && GUA_DAXIANG[name]) ? GUA_DAXIANG[name] : '',
      yao: yao
    };
  }

  /* 卦名反查六爻：卦名取上象、下象、卦名三字，纯卦作某为某；象与八卦对应 */
  var XIANG = { '天': '乾', '地': '坤', '雷': '震', '风': '巽', '水': '坎', '火': '离', '山': '艮', '泽': '兑' };
  function bitsOfName(name) {
    if (typeof TRIGRAMS === 'undefined' || !name || name.length < 3) return null;
    var upper, lower;
    if (name.charAt(1) === '为') {
      upper = name.charAt(0);
      lower = upper;
    } else {
      upper = XIANG[name.charAt(0)];
      lower = XIANG[name.charAt(1)];
    }
    if (!upper || !lower || !TRIGRAMS[upper] || !TRIGRAMS[lower]) return null;
    return TRIGRAMS[lower].bits.concat(TRIGRAMS[upper].bits);
  }

  /* 逐步揲蓍：一次点按行一变，三变成一爻，十八变成卦。
     state 记录当前爻序、变序与已得六爻，n 为当前爻的余策。 */
  var stepState = null;
  function stepReset() {
    stepState = { nums: [], bians: [], n: 49, cur: [], yao: 0, bian: 0 };
    return { yao: 0, bian: 0, done: false, nums: [], bians: [] };
  }
  function stepNext() {
    if (!stepState || stepState.yao >= 6) stepReset();
    var st = stepState;
    var b = bian(st.n);
    st.n = b.remain;
    st.cur.push(b);
    st.bian++;
    var out = { yao: st.yao, bian: st.bian, b: b, done: false };
    if (st.cur.length === 3) {
      var yaoObj = { num: st.n / 4, remain: st.n, bians: st.cur.slice() };
      out.yaoNum = yaoObj.num;
      out.yaoBians = yaoObj;
      st.nums.push(yaoObj.num);
      st.bians.push(yaoObj);
      st.cur = [];
      st.bian = 0;
      st.yao++;
      st.n = 49;
      out.done = st.yao >= 6;
    }
    out.state = { yao: st.yao, bian: st.bian, done: out.done, nums: st.nums.slice(), bians: st.bians.slice() };
    return out;
  }

  window.DAYAN = {
    bian: bian,
    yao: yao,
    cast: cast,
    build: build,
    lookup: lookup,
    titleOf: titleOf,
    stepReset: stepReset,
    stepNext: stepNext
  };
})();
