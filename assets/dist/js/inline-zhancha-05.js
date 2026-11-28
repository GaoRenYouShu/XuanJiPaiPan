document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('zhancha.html');
    ZC.init();
    mountAI(function () { return ZC.aiContext(); }, '占察木轮', {
      share: {
        page: 'zhancha',
        title: '占察木轮在线占察',
        collect: ZC.shareCollect,
        restore: ZC.shareRestore
      }
    });
  }, 0);
});
