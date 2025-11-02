document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TRANSITION_DELAY = 400;

  const ensureTransitions = () => {
    if (body && !body.classList.contains('js-has-transition')) {
      body.classList.add('js-has-transition');
    }
  };

  const startFadeIn = () => {
    ensureTransitions();
    body.classList.remove('fade-out');
    body.classList.remove('fade-in');
    if (reducedMotion.matches) return;
    requestAnimationFrame(() => body.classList.add('fade-in'));
  };

  const fadeTo = href => {
    ensureTransitions();
    body.classList.remove('fade-in');
    body.classList.add('fade-out');
    window.setTimeout(() => {
      window.location.href = href;
    }, TRANSITION_DELAY);
  };

  const shouldIntercept = link => {
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return false;
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;
    if (link.dataset.transition === 'false') return false;
    if (/^(?:mailto|tel|sms|javascript|data):/i.test(href)) return false;
    if ((link.getAttribute('rel') || '').split(/\s+/).includes('external')) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const bindLink = link => {
    if (link.dataset.transitionBound === 'true') return;
    if (!shouldIntercept(link)) return;
    link.dataset.transitionBound = 'true';
    link.addEventListener('click', event => {
      if (event.defaultPrevented) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (reducedMotion.matches) return;
      event.preventDefault();
      fadeTo(link.href);
    });
  };

  const bindLinks = (root = document) => {
    root.querySelectorAll('a[href]').forEach(bindLink);
  };

  bindLinks();
  document.addEventListener('includes:loaded', () => bindLinks());

  startFadeIn();

  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      startFadeIn();
    }
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      ensureTransitions();
      body.classList.remove('fade-out');
      body.classList.remove('fade-in');
    } else {
      startFadeIn();
    }
  });
});
