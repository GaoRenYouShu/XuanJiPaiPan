document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('xiangdao.html');
    if (window.XD) {
      XD.mountAI();
    }
  }, 0);
});
