


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('xingzhan.html');
    xzBindPlace('xz');
    xzBindPlace('xzB');
    xzSyncOverseas();
    mountAI(function(){ return __xz || ''; }, '占星术', { share:{ page:"xingzhan", title:"在线占星排盘", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ xzSyncOverseas(); xzPai(); }); } } });
  }, 0);
});
