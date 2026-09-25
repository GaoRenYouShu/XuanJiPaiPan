/* 卦象共享库：八卦、六十四卦名、京房八宫定世应 */

/* 八卦：bits 为自下而上三爻 [初,中,上]，1=阳 0=阴 */
const TRIGRAMS = {
  '乾':{bits:[1,1,1],sym:'☰',xt:1},
  '兑':{bits:[1,1,0],sym:'☱',xt:2},
  '离':{bits:[1,0,1],sym:'☲',xt:3},
  '震':{bits:[1,0,0],sym:'☳',xt:4},
  '巽':{bits:[0,1,1],sym:'☴',xt:5},
  '坎':{bits:[0,1,0],sym:'☵',xt:6},
  '艮':{bits:[0,0,1],sym:'☶',xt:7},
  '坤':{bits:[0,0,0],sym:'☷',xt:8},
};
const XT2NAME={1:'乾',2:'兑',3:'离',4:'震',5:'巽',6:'坎',7:'艮',8:'坤'};

/* 六十四卦名 NAME[上卦][下卦]，顺序 乾兑离震巽坎艮坤 */
const _ORDER=['乾','兑','离','震','巽','坎','艮','坤'];
const _TBL={
'乾':['乾为天','天泽履','天火同人','天雷无妄','天风姤','天水讼','天山遁','天地否'],
'兑':['泽天夬','兑为泽','泽火革','泽雷随','泽风大过','泽水困','泽山咸','泽地萃'],
'离':['火天大有','火泽睽','离为火','火雷噬嗑','火风鼎','火水未济','火山旅','火地晋'],
'震':['雷天大壮','雷泽归妹','雷火丰','震为雷','雷风恒','雷水解','雷山小过','雷地豫'],
'巽':['风天小畜','风泽中孚','风火家人','风雷益','巽为风','风水涣','风山渐','风地观'],
'坎':['水天需','水泽节','水火既济','水雷屯','水风井','坎为水','水山蹇','水地比'],
'艮':['山天大畜','山泽损','山火贲','山雷颐','山风蛊','山水蒙','艮为山','山地剥'],
'坤':['地天泰','地泽临','地火明夷','地雷复','地风升','地水师','地山谦','坤为地'],
};
function guaName(upper,lower){
  return _TBL[upper][_ORDER.indexOf(lower)];
}
/* 由六爻bits(自下而上)取上、下卦名 */
function trigramName(bits3){
  const key=bits3.join('');
  for(const n in TRIGRAMS){ if(TRIGRAMS[n].bits.join('')===key) return n; }
  return '';
}
function hexInfo(bits6){
  const lower=trigramName(bits6.slice(0,3));
  const upper=trigramName(bits6.slice(3,6));
  return {name:guaName(upper,lower),upper,lower,
    usym:TRIGRAMS[upper].sym,lsym:TRIGRAMS[lower].sym};
}

/* 京房八宫：生成 code->{palace,world} */
const PALACE_MAP=(function(){
  const map={};
  const palaceOrder=['乾','坎','艮','震','巽','离','坤','兑'];
  palaceOrder.forEach(pn=>{
    const t=TRIGRAMS[pn].bits;
    const pure=t.concat(t);
    const genList=[];
    let cur=pure.slice();
    genList.push({bits:pure.slice(),world:6});
    cur=pure.slice();
    for(let k=1;k<=5;k++){cur[k-1]=cur[k-1]?0:1;genList.push({bits:cur.slice(),world:k});}
    const you=genList[5].bits.slice(); you[3]=you[3]?0:1;
    genList.push({bits:you.slice(),world:4});
    const gui=you.slice(); gui[0]=gui[0]?0:1;gui[1]=gui[1]?0:1;gui[2]=gui[2]?0:1;
    genList.push({bits:gui.slice(),world:3});
    genList.forEach((g,i)=>{
      map[g.bits.join('')]={palace:pn,world:g.world,
        type:['本宫','一世','二世','三世','四世','五世','游魂','归魂'][i]};
    });
  });
  return map;
})();
function palaceInfo(bits6){
  const info=PALACE_MAP[bits6.join('')]||{palace:'?',world:6,type:''};
  let ying=info.world+3; if(ying>6)ying-=6;
  return {palace:info.palace+'宫',world:info.world,ying:ying,type:info.type};
}

/* 六神：按日干起，自初爻向上 */
const SIX_GODS=['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
function sixGods(dayGan){
  let start={'甲':0,'乙':0,'丙':1,'丁':1,'戊':2,'己':3,'庚':4,'辛':4,'壬':5,'癸':5}[dayGan]||0;
  const r=[];
  for(let i=0;i<6;i++) r.push(SIX_GODS[(start+i)%6]);
  return r; /* r[0]=初爻 */
}
