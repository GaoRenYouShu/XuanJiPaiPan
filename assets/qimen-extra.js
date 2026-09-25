/* 奇门遁甲扩展入口（qimen-extra.js）
   本文件为薄封装：对外暴露 window.QimenX.calculate，统一委托 qimen-engine.js 的 Qimen.calculate。
   家数（时/日/月/年/刻）、排法（转盘/飞盘）、门派（传统置闰/拆补/茅山）、天禽寄宫
   均由 qimen-engine.js 实现，输出结构一致（九宫含中宫寄宫）。 */
(function(global){
  function calculate(date, opts){
    if(global.Qimen && typeof global.Qimen.calculate === 'function'){
      return global.Qimen.calculate(date, opts);
    }
    return { error: true, message: '奇门引擎未加载' };
  }
  global.QimenX = { calculate };
})(typeof window !== 'undefined' ? window : this);
