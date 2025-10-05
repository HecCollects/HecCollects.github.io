(() => {
  let sectionsObserved = false;

  const initSectionObserver = () => {
    if (sectionsObserved) return;
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a[data-nav-link]');
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

    const focusableItems = Array.from(navMenu.querySelectorAll('a, button.dropdown-toggle'));
    const links = focusableItems.filter(el => el.tagName.toLowerCase() === 'a');
    const dropdownToggles = Array.from(navMenu.querySelectorAll('.dropdown-toggle'));
    let currentLinkIndex = -1;
    const mql = window.matchMedia('(min-width: 1024px)');

    const closeDropdowns = (exception) => {
      dropdownToggles.forEach(toggle => {
        if (exception && toggle === exception) return;
        toggle.setAttribute('aria-expanded', 'false');
        const menuId = toggle.getAttribute('aria-controls');
        if (!menuId) return;
        const menu = document.getElementById(menuId);
        if (menu && !menu.hasAttribute('hidden')) {
          menu.setAttribute('hidden', '');
        }
      });
    };

    dropdownToggles.forEach(toggle => {
      const menuId = toggle.getAttribute('aria-controls');
      const menu = menuId ? document.getElementById(menuId) : null;
      if (menu && !menu.hasAttribute('hidden')) {
        menu.setAttribute('hidden', '');
      }
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          toggle.setAttribute('aria-expanded', 'false');
          menu?.setAttribute('hidden', '');
        } else {
          closeDropdowns(toggle);
          toggle.setAttribute('aria-expanded', 'true');
          menu?.removeAttribute('hidden');
        }
      });
      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeDropdowns();
          toggle.blur();
        }
      });
    });

    const handleDocumentClick = (event) => {
      if (!navMenu.contains(event.target)) {
        closeDropdowns();
      }
    };

    const openMenu = () => {
      burger.classList.add('open');
      navMenu.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeDropdowns();
      focusableItems[0]?.focus();
      currentLinkIndex = focusableItems.length ? 0 : -1;
      if (window.gtag) {
        window.gtag('event', 'menu_open');
      }
    };

    const closeMenu = (focusBurger = true) => {
      document.body.style.overflow = '';
      closeDropdowns();
      currentLinkIndex = -1;
      if (mql.matches) return;
      burger.classList.remove('open');
      navMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
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

      focusableItems.forEach((item, index) => {
        item.addEventListener('focus', () => {
          currentLinkIndex = index;
        });
      });

      links.forEach(link => {
        link.addEventListener('focus', () => {
          currentLinkIndex = focusableItems.indexOf(link);
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
        if (!navMenu.classList.contains('open') || mql.matches) {
          if (e.key === 'Escape') {
            closeDropdowns();
          }
          return;
        }

        if (e.key === 'Escape') {
          closeMenu();
        } else if (e.key === 'Tab' && links.length) {
          e.preventDefault();
          const activeIndex = currentLinkIndex >= 0 ? currentLinkIndex : focusableItems.findIndex(item => item === document.activeElement);

          if (e.shiftKey) {
            const prevIndex = activeIndex > 0 ? activeIndex - 1 : focusableItems.length - 1;
            focusableItems[prevIndex]?.focus();
            currentLinkIndex = prevIndex;
          } else {
            const nextIndex = activeIndex >= 0 && activeIndex < focusableItems.length - 1 ? activeIndex + 1 : 0;
            focusableItems[nextIndex]?.focus();
            currentLinkIndex = nextIndex;
          }
        }
      });

      document.addEventListener('click', handleDocumentClick);

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
