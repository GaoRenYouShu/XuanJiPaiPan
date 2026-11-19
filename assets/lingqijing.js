/* 灵棋经起课：十二枚棋分上、中、下三组，各组数以零至四成课，
   三组计数查一百二十五课。底本《灵棋经》，不作命理改写。 */
(function (global) {
  'use strict';
  var D = global.LQ_DATA;
  var NUM = ['', '一', '二', '三', '四'];

  function counts(pieces) {
    return pieces.map(function (row) {
      return (row || []).reduce(function (n, x) { return n + (x ? 1 : 0); }, 0);
    });
  }
  function keyOf(c) {
    var s = (c[0] ? NUM[c[0]] + '上' : '')
      + (c[1] ? NUM[c[1]] + '中' : '')
      + (c[2] ? NUM[c[2]] + '下' : '');
    return s || '纯阴馒';
  }
  function randomPiece() {
    try {
      var a = new Uint8Array(1);
      (global.crypto || global.msCrypto).getRandomValues(a);
      return a[0] & 1;
    } catch (e) {
      return Math.random() < 0.5 ? 1 : 0;
    }
  }
  function cast() {
    return [0, 1, 2].map(function () {
      return [0, 1, 2, 3].map(function () { return randomPiece(); });
    });
  }
  function compute(pieces) {
    var c = counts(pieces);
    var key = keyOf(c);
    var entry = D && D.entries && D.entries[key];
    if (!entry) throw new Error('课目未收：' + key);
    return { pieces: pieces, counts: c, key: key, entry: entry };
  }
  global.Lingqijing = { cast: cast, compute: compute, counts: counts, keyOf: keyOf };
})(window);
