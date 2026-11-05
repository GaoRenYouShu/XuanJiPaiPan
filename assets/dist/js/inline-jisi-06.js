document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    renderChrome('jisi.html');
    if (window.JISI) JISI.init();
  }, 0);
});
