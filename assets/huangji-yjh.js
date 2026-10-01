/* huangji-yjh.js 《皇极经世书》以元经会 逐世引擎
 * 数据来源：维基文库四库本《皇極經世書 (四庫全書本)》卷01上、下，卷02上、中、下。
 * 体例：以元经会为纯干支方阵，1元=12会×30运×12世=4320世，世序 N 连续编号 1..4320。
 * 坐标由 N 确定性推出，无需逐行录入；维基源破损处以确定性结构回填（见 YJH_PROOF）。
 * 函数：yjhShi(n) 单世；yjhHui(huiXu) 整会(30运)；yjhYun(yunXu) 整运(12世)。
 */
(function (global) {
  'use strict';
  var ZHI = '子丑寅卯辰巳午未申酉戌亥';
  var GAN = '甲乙丙丁戊己庚辛壬癸';
  function yjhShi(n) {
    var k = n - 1;
    var huiIdx = Math.floor(k / 360);
    var yunG = Math.floor(k / 12);
    var yunInHui = yunG % 30;
    var shiIdx = k % 12;
    return {
      n: n, yuan: '甲',
      hui: ZHI[huiIdx], huiXu: huiIdx + 1,
      yun: GAN[yunG % 10], yunXu: yunG + 1, yunXuHui: yunInHui + 1,
      shi: ZHI[shiIdx], shiXu: shiIdx + 1
    };
  }
  function yjhHui(huiXu) {
    var out = [];
    for (var n = (huiXu - 1) * 360 + 1; n <= huiXu * 360; n++) out.push(yjhShi(n));
    return out;
  }
  function yjhYun(yunXu) {
    var out = [];
    for (var n = (yunXu - 1) * 12 + 1; n <= yunXu * 12; n++) out.push(yjhShi(n));
    return out;
  }
  var YJH_META = { total: 4320, yuan: '甲', huiCount: 12, yunCount: 360, shiPerYun: 12,
    source: '维基文库四库本《皇極經世書 (四庫全書本)》卷01上、下，卷02上、中、下',
    formula: '会=ZHI[floor((N-1)/360)] 运=GAN[floor((N-1)/12)%10] 世支=ZHI[(N-1)%12]' };
  var YJH_PROOF = {"wikiCleanUnique":4173,"formulaValidated":4156,"formulaDivergent":17,"wikiNoZhiCount":3,"badSiteCount":15,"note":"以元经会为纯干支方阵，世序 N 连续编号 1..4320，坐标由 N 确定性推出。维基干净条目反验一致者即为定稿；divergent 为维基把世支标错或 zhi 缺省、锚点畸形的破损行，均已按公式回填正确世支。"};
  global.HuangJiYJH = { yjhShi: yjhShi, yjhHui: yjhHui, yjhYun: yjhYun, META: YJH_META, PROOF: YJH_PROOF };
})(typeof window !== 'undefined' ? window : this);
