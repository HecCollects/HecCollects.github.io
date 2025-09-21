(() => {
  let sectionsObserved = false;

  const initSectionObserver = () => {
    if (sectionsObserved) return;
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    if (!sections.length || !navLinks.length) return;

    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
          if (entry.target.id === 'story') {
            entry.target.classList.add('story-bg-animate');
          } else if (entry.target.id === 'approach') {
            entry.target.classList.add('approach-bg-animate');
          }
        } else {
          if (entry.target.id === 'story') {
            entry.target.classList.remove('story-bg-animate');
          } else if (entry.target.id === 'approach') {
            entry.target.classList.remove('approach-bg-animate');
          }
        }
      });
    }, { threshold: 0.6 });

    sections.forEach(sec => sectionObs.observe(sec));
    sectionsObserved = true;
  };

  const initMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return false;

    navMenu.classList.add('nav-menu-ready');

    const burger = document.querySelector('.nav-toggle');
    if (!burger) return false;

    const links = Array.from(navMenu.querySelectorAll('a'));
    let currentLinkIndex = -1;
    const mql = window.matchMedia('(min-width: 1024px)');

    const openMenu = () => {
      burger.classList.add('open');
      navMenu.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      links[0]?.focus();
      currentLinkIndex = links.length ? 0 : -1;
      if (window.gtag) {
        window.gtag('event', 'menu_open');
      }
    };

    const closeMenu = (focusBurger = true) => {
      document.body.style.overflow = '';
      if (mql.matches) return;
      burger.classList.remove('open');
      navMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
      currentLinkIndex = -1;
      if (focusBurger) burger.focus();
      if (window.gtag) {
        window.gtag('event', 'menu_close');
      }
    };

    const handleBreakpoint = (e) => {
      if (e.matches) {
        document.body.style.overflow = '';
        navMenu.classList.add('open');
        navMenu.setAttribute('aria-hidden', 'false');
        burger.classList.add('hidden');
        burger.setAttribute('aria-hidden', 'true');
        burger.tabIndex = -1;
      } else {
        document.body.style.overflow = '';
        closeMenu(false);
        burger.classList.remove('hidden');
        burger.setAttribute('aria-hidden', 'false');
        burger.tabIndex = 0;
      }
    };

    handleBreakpoint(mql);

    if (navMenu.dataset.menuInitialized !== 'true') {
      navMenu.dataset.menuInitialized = 'true';

      burger.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      links.forEach((link, index) => {
        link.addEventListener('focus', () => {
          currentLinkIndex = index;
        });
        link.addEventListener('click', () => {
          closeMenu(false);
          if (window.gtag) {
            window.gtag('event', 'navigate', {
              event_category: 'nav',
              event_label: link.textContent?.trim() || ''
            });
          }
        });
      });

      document.addEventListener('keydown', (e) => {
        if (!navMenu.classList.contains('open') || mql.matches) return;

        if (e.key === 'Escape') {
          closeMenu();
        } else if (e.key === 'Tab' && links.length) {
          e.preventDefault();
          const activeIndex = currentLinkIndex >= 0 ? currentLinkIndex : links.findIndex(link => link === document.activeElement);

          if (e.shiftKey) {
            const prevIndex = activeIndex > 0 ? activeIndex - 1 : links.length - 1;
            links[prevIndex]?.focus();
            currentLinkIndex = prevIndex;
          } else {
            const nextIndex = activeIndex >= 0 && activeIndex < links.length - 1 ? activeIndex + 1 : 0;
            links[nextIndex]?.focus();
            currentLinkIndex = nextIndex;
          }
        }
      });

      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handleBreakpoint);
      } else if (mql.addListener) {
        mql.addListener(handleBreakpoint);
      }
    }

    initSectionObserver();
    return true;
  };

  if (!initMenu()) {
    const onIncludesLoaded = () => {
      if (initMenu()) {
        document.removeEventListener('includes:loaded', onIncludesLoaded);
      }
    };
    document.addEventListener('includes:loaded', onIncludesLoaded);
  }
})();
