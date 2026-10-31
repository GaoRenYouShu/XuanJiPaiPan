/* 默认结果即页面终值，data-built 记生成当日；访问日与所记不同才按今日重排。 */
function hlInitDefault(){
  const pad=function(x){return String(x).padStart(2,'0');};
  const n=new Date();
  const key=n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate());
  const field=document.getElementById('hlDate');
  if(!field) return;
  const built=field.closest('[data-built]');
  if(!built||built.getAttribute('data-built')===key) return;
  if(typeof renderQigua==='function') renderQigua();
  if(typeof hlClearYun==='function') hlClearYun();
}
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('heluo.html');
    hlInitDefault();
  }, 0);
});
