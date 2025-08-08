(() => {
  const burger = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!burger || !navMenu) return;

  const links = Array.from(navMenu.querySelectorAll('a'));

  const openMenu = () => {
    burger.classList.add('open');
    navMenu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');
    links[0]?.focus();
  };

  const closeMenu = (focusBurger = true) => {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
    if (focusBurger) burger.focus();
  };

  burger.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (!navMenu.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeMenu();
    } else if (e.key === 'Tab' && links.length) {
      const first = links[0];
      const last = links[links.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Outbound click tracking
  const trackables = document.querySelectorAll('[data-analytics]');
  trackables.forEach(link => {
    link.addEventListener('click', () => {
      const label = link.getAttribute('data-analytics');
      if (window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'outbound',
          event_label: label,
        });
      }
    });
  });
})();
