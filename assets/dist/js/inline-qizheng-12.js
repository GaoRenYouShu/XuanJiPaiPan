


document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('qizheng.html');
    qzBindPlace('qz');
    qzBindPlace('qzB');
    qzSyncOverseas();
    mountAI(function(){ return __qz || ''; }, '七政四余', {
      share:{ page:"qizheng", title:"七政四余在线排盘", collect:xjShareCollect, restore:xjShareRestore, recast:function(){ xjShareRecast(function(){ qzSyncOverseas(); qzPai(); }); } }
    });
  }, 0);
});
