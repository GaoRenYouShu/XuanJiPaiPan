
/* CBDB 派生名人分片：延迟取回，就地按行首锚点检索，不并入现库、不建索引、不落对象。
 * 现库 name-celebs.js 是唯一策展库（带 cat 与 neg），分片只在现库查无此名时补源；
 * 命中者按需回填现库，同一名字只检索一次，故常驻增量只随实际展示过的名字增长。
 * 全名库按全名首字分桶，先取桶再于桶内定位，单次检索的扫描量限于本桶；
 * 名索引为单条行文本，一次分析只取一两回，整篇扫描在微秒级，故不分桶。
 * 名同前贤候选由 NM_GIVEN_LIST 合并两源并重排：序表与 gen_name_celebs.js 的 CHRON 同源，
 * 表外朝代与无朝代者殿后（取序表长度，不用负数，否则会排到最前）。 */
window.NM_CELEB_CHRON=['夏','商','西周','春秋','战国','秦','秦末','汉','西汉','新','东汉','三国','西晋','东晋','十六国',
  '南北朝','南朝','北朝','隋','隋末','唐','五代','五代十国','辽','西夏','宋','北宋','金','南宋','元','明','清',
  '近现代','晚清','民国','现代','当代','外国'];
window.NM_CELEB=function(full){
  var base=window.NAME_CELEBS||{}, hit=base[full];
  if(hit) return hit;
  var B=window.NM_CBDB_FULL, b=B&&B[full.charAt(0)];
  if(!b) return null;
  var i=b.indexOf('\n'+full+'\t');
  if(i<0) return null;
  var f=b.slice(i+1, b.indexOf('\n', i+1)).split('\t');
  hit={dynasty:f[1]||'', note:f[2]||''};
  base[full]=hit;
  return hit;
};
window.NM_GIVEN_LIST=function(ming){
  var out=[], seen={}, i, p, arr=(window.NAME_CELEB_GIVEN||{})[ming];
  if(arr) for(i=0;i<arr.length;i++){ p=arr[i].p; if(p&&!seen[p]){ seen[p]=1; out.push(p); } }
  var T=window.NM_CBDB_GIVEN;
  if(T){
    var k=T.indexOf('\n'+ming+'\t');
    if(k>=0){
      var list=T.slice(k+1, T.indexOf('\n', k+1)).split('\t')[1].split(',');
      for(i=0;i<list.length;i++){ p=list[i]; if(p&&!seen[p]){ seen[p]=1; out.push(p); } }
    }
  }
  var dec=[];
  for(i=0;i<out.length;i++) dec.push([out[i], window.NM_CELEB_RK((window.NM_CELEB(out[i])||{}).dynasty)]);
  dec.sort(function(a,b){ return a[1]-b[1]; });
  for(i=0;i<out.length;i++) out[i]=dec[i][0];
  return out;
};
