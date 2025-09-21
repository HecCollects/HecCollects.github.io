document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const ensureTransitions = () => {
    if (!body.classList.contains('js-has-transition')) {
      body.classList.add('js-has-transition');
    }
  };

  const show = () => {
    if (reducedMotion.matches) return;
    ensureTransitions();
    body.classList.remove('fade-out');
    body.classList.add('fade-in');
  };

  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      show();
    }
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const target = link.getAttribute('target');
    const href = link.getAttribute('href');
    const sameHost = link.host === window.location.host;
    if (sameHost && target !== '_blank' && href && !href.startsWith('#')) {
      link.addEventListener('click', e => {
        if (reducedMotion.matches) return;
        e.preventDefault();
        ensureTransitions();
        body.classList.remove('fade-in');
        body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });
    }
  });
});
