/* 玄机排盘对 lunar-javascript 的站内改写集中于此，不改上游库本体。
   库升级只替换 assets/lunar.js，本件按上游 API 复核。
   四组改写：冲煞括注全角、道历腊月廿四祭灶王、佛历纪元与闰月宿序、民俗节日补录。 */
(function (g) {
  'use strict';
  var Lunar = g.Lunar, LunarUtil = g.LunarUtil, Foto = g.Foto, FotoUtil = g.FotoUtil, TaoUtil = g.TaoUtil;
  if (!Lunar || !LunarUtil || !Foto || !FotoUtil || !TaoUtil) return;

  /* 一、日冲与时辰冲的干支括注取全角，与全站括号字形一致 */
  function patchLunar(o) {
    if (!o || typeof o.getDayChongDesc !== 'function') return o;
    o.getDayChongDesc = function () {
      return '（' + this.getDayChongGan() + this.getDayChong() + '）' + this.getDayChongShengXiao();
    };
    o.getTimeChongDesc = function () {
      return '（' + this.getTimeChongGan() + this.getTimeChong() + '）' + this.getTimeChongShengXiao();
    };
    return o;
  }
  ['fromYmdHms', 'fromYmd', 'fromDate', 'fromSolar'].forEach(function (k) {
    var orig = Lunar[k];
    if (typeof orig !== 'function') return;
    Lunar[k] = function () { return patchLunar(orig.apply(Lunar, arguments)); };
  });

  /* 二、道历腊月廿四祭灶王，与廿三并列，南北两说同出 */
  if (!TaoUtil.FESTIVAL['12-24']) {
    var src = TaoUtil.FESTIVAL['12-23'] && TaoUtil.FESTIVAL['12-23'][0];
    var it = {};
    if (src) {
      for (var key in src) { if (Object.prototype.hasOwnProperty.call(src, key)) it[key] = src[key]; }
    } else {
      it.getName = function () { return this._p.name; };
      it.getResult = function () { return this._p.result; };
      it.isEveryMonth = function () { return this._p.everyMonth; };
      it.getRemark = function () { return this._p.remark; };
      it.toString = function () { return this._p.name; };
      it.toFullString = function () {
        var l = [this._p.name];
        if (this._p.result) l.push(this._p.result);
        if (this._p.remark) l.push(this._p.remark);
        return l.join(' ');
      };
    }
    it._p = { name: '祭灶王', result: '', everyMonth: false, remark: '南方以腊月廿四祭灶，与北方廿三并列' };
    TaoUtil.FESTIVAL['12-24'] = [it];
  }

  /* 三、佛历：纪元随农历年界，宿序按闰月承接，二十七宿逐日不断序 */
  var X27 = FotoUtil.XIU_27;
  function xiuOffset(m) { return X27.indexOf(FotoUtil.getXiu(m, 1)); }
  FotoUtil.getXiuByLunar = function (lunar) {
    var y = lunar.getYear(), m = lunar.getMonth(), d = lunar.getDay(), idx;
    if (m < 0) {
      var rm = g.LunarMonth.fromYm(y, -m);
      idx = (xiuOffset(-m) + (rm ? rm.getDayCount() : 30)) % X27.length;
    } else {
      idx = xiuOffset(m);
      var months = g.LunarYear.fromYear(y).getMonths();
      for (var i = 0; i < months.length; i++) {
        var mm = months[i].getMonth();
        if (mm < 0 && -mm < m) idx = (idx + months[i].getDayCount()) % X27.length;
      }
    }
    return X27[(idx + d - 1) % X27.length];
  };
  function patchFoto(o) {
    if (!o) return o;
    o.getYear = function () { return this.getLunar().getYear() - Foto.DEAD_YEAR; };
    o.getXiu = function () { return FotoUtil.getXiuByLunar(this.getLunar()); };
    return o;
  }
  var fh = Foto.fromYmdHms;
  Foto.fromYmdHms = function (y, m, d, h, mi, s) { return patchFoto(fh.call(Foto, y + 1, m, d, h, mi, s)); };
  var fy = Foto.fromYmd;
  Foto.fromYmd = function (y, m, d) { return patchFoto(fy.call(Foto, y + 1, m, d)); };
  var fl = Foto.fromLunar;
  Foto.fromLunar = function (l) { return patchFoto(fl.call(Foto, l)); };

  /* 四、民俗节日补录：正月初五迎财神与破五、四月初八浴佛节入农历其他族；
     小年按南北两说分列主节，北方腊月廿三、南方腊月廿四 */
  var FOLK = {
    '1-5': { head: ['迎财神', '破五'] },
    '4-8': { tail: ['浴佛节'] }
  };
  Object.keys(FOLK).forEach(function (k) {
    var cur = (LunarUtil.OTHER_FESTIVAL[k] || []).slice();
    var head = (FOLK[k].head || []).filter(function (n) { return cur.indexOf(n) < 0; });
    var tail = (FOLK[k].tail || []).filter(function (n) { return cur.indexOf(n) < 0; });
    LunarUtil.OTHER_FESTIVAL[k] = head.concat(cur, tail);
  });
  if (!LunarUtil.FESTIVAL['12-23']) LunarUtil.FESTIVAL['12-23'] = '北方小年';
  if (!LunarUtil.FESTIVAL['12-24']) LunarUtil.FESTIVAL['12-24'] = '南方小年';
})(typeof window !== 'undefined' ? window : globalThis);
