


document.addEventListener('DOMContentLoaded', function () {
  ({C:XT_C,ARC:XT_ARC,OUT:XT_OUT,IN:XT_IN,CORE:XT_CORE,LAB_OUT:XT_LAB_OUT,LAB_IN:XT_LAB_IN,HIT1:XT_HIT1,TICK0:XT_TICK0,TICK1:XT_TICK1,P0:XT_P0,P1:XT_P1}=WHEEL.GEO440);
  setTimeout(function () {
    renderChrome('huangji.html');
    initDefault();
    renderTermGloss();
    hjShixuRender();
    (function(){
        const el=document.getElementById('biguaRef'); if(!el)return;
        let h='<table class="hj-np"><thead><tr><th>会</th><th>辟卦（民间移配）</th><th>原书值五卦</th><th>象</th></tr></thead><tbody>';
        for(let i=0;i<12;i++){
        const g=HJ.huiGua(i), gi=HJ.guaInfo(HJ.fullGuaName(g));
        const five=HJ.huiGua5(i).map(n=>HJ.shortGuaName(n)).join('、');
        h+='<tr><td>'+HJ.CONST.HUI_ZHI[i]+'会</td><td>'+g+'</td><td>'+five+'</td><td>'+(gi?gi.ci:'')+'</td></tr>';
        }
        el.innerHTML=h+'</tbody></table>'
          +'<div class="sub-note">辟卦与值五卦分属两序列：辟卦本配十二月、言阴阳消息，后世移配十二会；值五卦出先天圆图去乾坤坎离，各主六运。十二会中仅子会之复、午会之姤两会同名，其余十会各异，故见同名不可径以为同卦，两序列彼此不可互推。</div>';
        })();
    document.addEventListener('toggle',function(e){
      const t=e.target;
      if(t && t.tagName==='DETAILS' && t.id) xjSaveFold('hjFoldState','details[id]');
    },true);
    xjApplyFold('hjFoldState','details[id]');
    mountAI(function(){
      if(!LAST) return '';
      const L=LAST.L;
      const yunImpl=HJ.yunGua(L), yrImpl=HJ.yearGua(L), ybImpl=HJ.yunGuaBian(L), sbImpl=HJ.shiGuaBian(L);
      let s='皇极经世推演（邵雍元会运世体系）\n';
      s+='【所选年份】'+HJ.fmtYear(L.A)+'（'+L.gz+'岁）'+(LAST.note?'　口径：'+LAST.note:'')+'\n';
      s+='【元】第'+L.yuanNo+'元（1元=129600年）\n';
      s+='【会】'+L.hui.zhi+'会，起止'+HJ.fmtYear(L.hui.start)+'至'+HJ.fmtYear(L.hui.end)+'，会内第'+L.hui.inYear+'年\n';
      s+='【运】全元第'+L.yun.noG+'运（会内第'+L.yun.noH+'运），原书标注经运之'+L.yun.gan+'（十干轮运），起止'+HJ.fmtYear(L.yun.start)+'至'+HJ.fmtYear(L.yun.end)+'，运内第'+L.yun.inYear+'年\n';
      s+='【世】全元第'+L.shi.noG+'世（运内第'+L.shi.noY+'世），原书标注经世之'+L.shi.zhi+'（十二支轮世），起止'+HJ.fmtYear(L.shi.start)+'至'+HJ.fmtYear(L.shi.end)+'，世内第'+L.shi.inYear+'年\n';
      s+='【卦气】'+L.hui.zhi+'会值五卦：'+HJ.huiGua5(L.hui.idx).map(n=>HJ.shortGuaName(n)).join('、')
        +'（各主六运，原书口径）；本运值'+yunImpl.name+'；运卦（后世爻变）'+HJ.shortGuaName(ybImpl.name)+'（值卦第'+ybImpl.yao+'爻变）；世卦（后世爻变）'+HJ.shortGuaName(sbImpl.name)+'（一爻二世六十年）；中卦'+HJ.shortGuaName(HJ.zhongGua(L.hui.idx))+'当会之中；闰卦'+HJ.leapGua(L.hui.idx)+'（四正卦不用值运）';
      if(yrImpl) s+='；值年卦（民间）：'+yrImpl.name+'（一年一卦，按通行六十卦序，1984年值火风鼎）';
      const xA=HJ.xunGuaJia(L);
      s+='；旬卦'+xA.name+'（'+HJ.fmtYear(xA.from)+'至'+HJ.fmtYear(xA.to)+'，世卦'+HJ.shortGuaName(xA.base)+'第'+xA.yao+'爻变，一爻主十年）';
      const kaiA=HJ.kaiwuA(), biA=HJ.biwuA();
      const kaiState=(L.A<kaiA)?'所推年在开物之前':((L.A>biA)?'所推年在闭物之后':'今在开物之后、闭物之前');
      s+='\n【开物闭物】开物于寅会之中（约公元前40017年前后）、闭物于戌会之中（约公元46384年前后）；'+kaiState+'。\n';
      s+='【原书逐年表】以运经世原文覆盖前2357至公元959共3316年（有记事1539年）；原书纪年从殷历长纪年，克商店己卯（公元前1122），与断代工程前1046相差76年。\n';
      s+='\n【锚点校验】唐尧即位（公元前2357，甲辰）值巳会第180运（经运之癸）第2156世（经世之未）第11年；午会起于公元前2217年（甲子）。\n';
      return s;
    }, '皇极经世', { share:{ page:"huangji", title:"皇极经世在线推演", recast:function(){ try{ query(); }catch(e){} } } });
  }, 0);
});
