document.querySelectorAll('.acc-btn').forEach(function (btn) {
  var item = btn.closest('.acc-item');
  var body = item.querySelector('.acc-body');
  var inner = body.querySelector('.acc-content');

  body.setAttribute('aria-hidden', 'true');

  btn.addEventListener('click', function () {
    var open = item.classList.contains('open');
    if (open) {
      body.style.height = inner.offsetHeight + 'px';
      body.offsetHeight; // force reflow so the browser sees the start height before collapsing
      item.classList.remove('open');
      body.style.height = '0px';
      body.setAttribute('aria-hidden', 'true');
    } else {
      item.classList.add('open');
      body.style.height = inner.offsetHeight + 'px';
      body.setAttribute('aria-hidden', 'false');
    }
    btn.setAttribute('aria-expanded', !open);
  });

  body.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'height' && item.classList.contains('open')) {
      body.style.height = 'auto';
    }
  });
});
