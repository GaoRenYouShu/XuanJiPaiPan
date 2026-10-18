/* 八宅游年共享件：大游年歌八卦吉凶四星与游年星查询。
 *
 * 定位：八宅一法只用到八卦游年一表，风水引擎其余诸法（紫白、玄空、三合、分金、峦头）与八字、合婚两页无关。
 *   本件把该表与查询函数单列，凡只需八宅者装本件即可，不必整装风水引擎。
 *   同一份表由风水引擎 re-export，两处取值一字不二，口径只此一处。
 *
 * 【定源】八宅大游年歌（《八宅明镜》《阳宅三要》通行，歌诀定游年九星落宫）：
 *   乾六天五祸绝延生，坎五天生延绝祸六，艮六绝祸生延天五，震延生祸绝五天六，
 *   巽天五六祸生绝延，离六五绝延祸生天，坤天延绝生祸五六，兑生祸延绝六五天。
 *   锚点：坎：艮五鬼、震天医、巽生气、离延年、坤绝命、兑祸害、乾六煞；兑生气在乾；离延年在坎；乾绝命在离。
 *
 * 对外：window.FENGSHUI.BAZHAI / GUA_DIR / baZhai / youXing（与风水引擎同键，消费方无需分辨来源）。
 */
(function (global) {
  'use strict';

  const BAZHAI={
    坎:{group:'东四命',ji:{生气:'巽',延年:'离',天医:'震',伏位:'坎'},xiong:{绝命:'坤',五鬼:'艮',祸害:'兑',六煞:'乾'}},
    震:{group:'东四命',ji:{生气:'离',延年:'巽',天医:'坎',伏位:'震'},xiong:{绝命:'兑',五鬼:'乾',祸害:'坤',六煞:'艮'}},
    巽:{group:'东四命',ji:{生气:'坎',延年:'震',天医:'离',伏位:'巽'},xiong:{绝命:'艮',五鬼:'坤',祸害:'乾',六煞:'兑'}},
    离:{group:'东四命',ji:{生气:'震',延年:'坎',天医:'巽',伏位:'离'},xiong:{绝命:'乾',五鬼:'兑',祸害:'艮',六煞:'坤'}},
    乾:{group:'西四命',ji:{生气:'兑',延年:'坤',天医:'艮',伏位:'乾'},xiong:{绝命:'离',五鬼:'震',祸害:'巽',六煞:'坎'}},
    坤:{group:'西四命',ji:{生气:'艮',延年:'乾',天医:'兑',伏位:'坤'},xiong:{绝命:'坎',五鬼:'巽',祸害:'震',六煞:'离'}},
    艮:{group:'西四命',ji:{生气:'坤',延年:'兑',天医:'乾',伏位:'艮'},xiong:{绝命:'巽',五鬼:'坎',祸害:'离',六煞:'震'}},
    兑:{group:'西四命',ji:{生气:'乾',延年:'艮',天医:'坤',伏位:'兑'},xiong:{绝命:'震',五鬼:'离',祸害:'坎',六煞:'巽'}}
  };
  const GUA_DIR={坎:'北',震:'东',巽:'东南',离:'南',乾:'西北',坤:'西南',艮:'东北',兑:'西'};

  function baZhai(gua){
    const b=BAZHAI[gua];
    if(!b) return null;
    return {
      gua, group:b.group,
      ji:Object.keys(b.ji).map(k=>({name:k, gua:b.ji[k], dir:GUA_DIR[b.ji[k]]})),
      xiong:Object.keys(b.xiong).map(k=>({name:k, gua:b.xiong[k], dir:GUA_DIR[b.xiong[k]]}))
    };
  }

  /* 游年星：from 卦起游年，to 卦落何星（阳宅三要主断用） */
  function youXing(from, to){
    const b=BAZHAI[from];
    if(!b) return null;
    if(from===to) return '伏位';
    for(const k in b.ji){ if(b.ji[k]===to) return k; }
    for(const k in b.xiong){ if(b.xiong[k]===to) return k; }
    return null;
  }

  global.FENGSHUI = global.FENGSHUI || {};
  global.FENGSHUI.BAZHAI = BAZHAI;
  global.FENGSHUI.GUA_DIR = GUA_DIR;
  global.FENGSHUI.baZhai = baZhai;
  global.FENGSHUI.youXing = youXing;
})(typeof window!=='undefined'?window:this);
