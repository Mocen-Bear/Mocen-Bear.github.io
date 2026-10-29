(function () {
  function init () {
    var marker = document.getElementById('home-marker');
    var header = document.getElementById('page-header');
    if (!marker || !header || document.getElementById('scroll-down-lotso')) return;
    var d = document.createElement('div');
    d.id = 'scroll-down-lotso';
    d.innerHTML = '<i class="scroll-down-effects fas fa-angle-down"></i>';
    d.addEventListener('click', function () {
      var target = document.getElementById('content-inner') || document.body;
      target.scrollIntoView({ behavior: 'smooth' });
    });
    header.appendChild(d);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();