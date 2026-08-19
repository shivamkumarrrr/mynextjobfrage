(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach(function (el) {
    el.style.animationPlayState = 'paused';
    obs.observe(el);
  });
})();
