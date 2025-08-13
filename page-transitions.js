document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const show = () => {
    body.classList.remove('fade-out');
    body.classList.add('fade-in');
  };

  show();
  window.addEventListener('pageshow', show);

  document.querySelectorAll('a[href]').forEach(link => {
    const target = link.getAttribute('target');
    const href = link.getAttribute('href');
    const sameHost = link.host === window.location.host;
    if (sameHost && target !== '_blank' && href && !href.startsWith('#')) {
      link.addEventListener('click', e => {
        if (reducedMotion.matches) return;
        e.preventDefault();
        body.classList.remove('fade-in');
        body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });
    }
  });
});
