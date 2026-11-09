document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('shiliao.html');
    if (window.SL) {
      SL.mountAI();
    }
  }, 0);
});
