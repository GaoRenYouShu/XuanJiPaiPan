


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('daliuren.html');
    fillShichen();
    fillDlSchool();
    dlrApplySchoolPreset();
    document.getElementById('dlSchool').addEventListener('change', function(){ dlrApplySchoolPreset(); query(); });
    document.getElementById('dlDay').addEventListener('change', query);
    document.getElementById('dlJiang').addEventListener('change', query);
    document.addEventListener('toggle', function(e){
      const t = e.target;
      if(t && t.tagName === 'DETAILS' && t.id && t.closest('#out')) xjSaveModState('dlrModState','#out details[id]','__dlrInitDone');
    }, true);
    (function(){const n=new Date();document.getElementById('dInput').value=`${n.getFullYear()}-${pad2(n.getMonth()+1)}-${pad2(n.getDate())}`;document.getElementById('shichen').value=Math.floor(((n.getHours()+1)%24)/2);window.__dlrInitDone=true;})();
    mountAI(function(){
      if(!LAST||!LAST.tian) return '';
      const sk=LAST.school, o=LAST.o||{};
      let td='天地盘（天盘=月将加时，地盘=十二支本位）：\n';
      ZHI.forEach(dz=>{
        const tp=LAST.tian[ZHI.indexOf(dz)];
        const jn=LAST.jiangOnTian[tp]||'';
        td+=`${dz}（地） → ${tp}（天）${jn?' 、天将'+jn:''}\n`;
      });
      const keStr=LAST.ke.map(k=>`${k.lbl}：${k.u}（天）、${k.d}（地）`).join('\n');
      const c=LAST.chuan;
      const tj=z=>LAST.jiangOnTian[z]||'';
      const wx=z=>ZHI_WX[z]||'';
      const chuan=`三传（${c.method}）：\n初传 ${c.chu} ${tj(c.chu)}（${wx(c.chu)}）\n中传 ${c.zhong} ${tj(c.zhong)}（${wx(c.zhong)}）\n末传 ${c.mo} ${tj(c.mo)}（${wx(c.mo)}）`;
      const read = LAST.o ? baihua(LAST.o).replace(/<br>/g,'\n').replace(/<\/p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,'') : '';
      const sha=LAST.o&&LAST.o.sha?`\n神煞：驿马${LAST.o.sha.yima||'-'}，天马${LAST.o.sha.tianma||'-'}，天喜${LAST.o.sha.tianxi||'-'}，天医${LAST.o.sha.tianyi||'-'}，劫煞${LAST.o.sha.jiesha||'-'}，灾煞${LAST.o.sha.zaisha||'-'}，亡神${LAST.o.sha.wangshen||'-'}，破碎${LAST.o.sha.posui||'-'}`:'';
      const benLine = (LAST.o&&LAST.o.benMing&&LAST.o.xingNian)?`\n本命：${LAST.o.benMing.gan}${LAST.o.benMing.zhi}、${LAST.o.sex}、虚岁${LAST.o.xingNian.age}、行年${LAST.o.xingNian.zhi}`:'';
      return `大六壬起课（流派：${sk}）\n日干支：${LAST.dgz}　占时：${LAST.shiZhi}　月将：${LAST.jiang}（${JIANG_NAME[ZHI.indexOf(LAST.jiang)]||''}，${o.jiangKey||''}）\n起贵口诀：${o.guiMode||''}　昼夜分界：${o.dayKey||''}（贵人${LAST.guiZhi}，${LAST.day?'昼占阳贵':'夜占阴贵'}；贵人临地盘${ZHI[o.guiDiIdx]||''}位，天将${LAST.o&&LAST.o.shun?'顺':'逆'}布）\n发用法则：${o.faYong==='shehai'?'涉害优先':'贼克比用'}\n${td}\n四课：\n${keStr}\n${chuan}${benLine}${sha}\n\n【综合判断】\n${read}`;
    }, '大六壬', { share:{ page:"daliuren", title:"大六壬在线排盘", recast:function(){ try{ query(); }catch(e){} } } });
  }, 0);
});
