(() => {
  const burger = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (burger && navMenu) {
    const links = Array.from(navMenu.querySelectorAll('a'));
    const mql = window.matchMedia('(min-width: 1024px)');

    const openMenu = () => {
      burger.classList.add('open');
      navMenu.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      links[0]?.focus();
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
      if (focusBurger) burger.focus();
      if (window.gtag) {
        window.gtag('event', 'menu_close');
      }
    };

    burger.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.forEach(link => {
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
        navMenu.classList.remove('open');
        navMenu.setAttribute('aria-hidden', 'true');
        burger.classList.remove('hidden');
        burger.setAttribute('aria-hidden', 'false');
        burger.tabIndex = 0;
      }
    };
    handleBreakpoint(mql);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleBreakpoint);
    } else if (mql.addListener) {
      mql.addListener(handleBreakpoint);
    }
  }

  // Active nav link
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
        if(entry.target.id === 'story'){
          entry.target.classList.add('story-bg-animate');
        } else if(entry.target.id === 'approach'){
          entry.target.classList.add('approach-bg-animate');
        }
      } else {
        if(entry.target.id === 'story'){
          entry.target.classList.remove('story-bg-animate');
        } else if(entry.target.id === 'approach'){
          entry.target.classList.remove('approach-bg-animate');
        }
      }
    });
  }, { threshold:0.6 });
  sections.forEach(sec => sectionObs.observe(sec));
})();
