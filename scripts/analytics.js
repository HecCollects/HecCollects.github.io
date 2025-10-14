(() => {
  const root = document.documentElement;
  const enforceSingleTheme = () => {
    if (root.getAttribute('data-theme') !== 'dark') {
      root.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem('theme', 'dark');
    } catch {}
  };

  enforceSingleTheme();

  let refCode = '';
  let refComputed = false;
  const ensureRefCode = () => {
    if (refComputed) return refCode;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('ref')) {
        const ref = params.get('ref') || '';
        if (ref) {
          localStorage.setItem('ref', ref);
          refCode = ref;
        } else {
          localStorage.removeItem('ref');
          refCode = '';
        }
      } else {
        refCode = localStorage.getItem('ref') || '';
      }
    } catch {}
    refComputed = true;
    return refCode;
  };

  const updateShareLinks = () => {
    if (!refCode) return;
    document.querySelectorAll('a[data-share-link]').forEach(link => {
      try {
        const url = new URL(link.href, location.href);
        if (!url.searchParams.get('ref')) {
          url.searchParams.set('ref', refCode);
        }
        link.href = url.toString();
      } catch {}
    });
  };

  const setupSubscribeForm = () => {
    const subscribeForm = document.querySelector('#subscribe form');
    if (!subscribeForm) return;
    const refField = subscribeForm.querySelector('#referrer-field');
    try {
      if (refField && refCode) {
        refField.value = refCode;
      }
    } catch {}
    if (subscribeForm.dataset.analyticsBound === 'true') return;
    subscribeForm.dataset.analyticsBound = 'true';
    subscribeForm.addEventListener('submit', () => {
      if (refField && !refField.value) {
        try {
          refField.value = localStorage.getItem('ref') || '';
        } catch {}
      }
    });
  };

  const setupRecaptcha = () => {
    const recaptcha = document.querySelector('.g-recaptcha');
    if (!recaptcha) return;
    if (window.RECAPTCHA_SITE_KEY) {
      recaptcha.setAttribute('data-sitekey', window.RECAPTCHA_SITE_KEY);
      recaptcha.style.minHeight = '78px';
      recaptcha.style.minWidth = '302px';
    } else {
      recaptcha.classList.add('hidden');
    }
  };

  const setupPhoneLink = () => {
    const phoneLink = document.getElementById('phone-link');
    if (!phoneLink) return;
    if (window.PHONE_NUMBER) {
      phoneLink.href = `tel:${window.PHONE_NUMBER}`;
      phoneLink.classList.remove('hidden');
    } else {
      phoneLink.classList.add('hidden');
    }
  };

  const setupDetails = () => {
    document.querySelectorAll('details').forEach(d => {
      const summary = d.querySelector('summary');
      if (!summary) return;
      summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      if (d.dataset.analyticsDetailsBound === 'true') return;
      d.dataset.analyticsDetailsBound = 'true';
      d.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      });
    });
  };

  const setupTrackables = () => {
    document.querySelectorAll('[data-analytics]').forEach(link => {
      if (link.dataset.analyticsBound === 'true') return;
      link.dataset.analyticsBound = 'true';
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
  };

  const setupCookieBanner = () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieBtn = document.getElementById('cookie-btn');
    if (!cookieBanner || !cookieBtn) return;
    if (localStorage.getItem('cookieConsent')) {
      cookieBanner.remove();
      return;
    }
    if (cookieBanner.dataset.analyticsBound === 'true') return;
    cookieBanner.dataset.analyticsBound = 'true';
    const prevFocus = document.activeElement;
    cookieBanner.classList.remove('hidden');
    cookieBtn.focus();
    const trapFocus = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        cookieBtn.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    cookieBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'yes');
      document.removeEventListener('keydown', trapFocus);
      cookieBanner.remove();
      prevFocus?.focus?.();
      if (window.gtag) { window.gtag('event', 'cookie_consent'); }
    });
  };

  const scrollMarks = [25, 50, 75, 100];
  const seenMarks = new Set();
  const reportScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);
    scrollMarks.forEach(mark => {
      if (percent >= mark && !seenMarks.has(mark)) {
        seenMarks.add(mark);
        if (window.gtag) {
          window.gtag('event', 'scroll', {
            event_category: 'engagement',
            event_label: `${mark}%`,
          });
        }
      }
    });
    if (seenMarks.size === scrollMarks.length) {
      window.removeEventListener('scroll', reportScroll);
    }
  };
  let scrollBound = false;
  const bindScrollTracking = () => {
    if (scrollBound) return;
    scrollBound = true;
    window.addEventListener('scroll', reportScroll, { passive: true });
  };

  let timeBound = false;
  const bindTimeOnPage = () => {
    if (timeBound) return;
    timeBound = true;
    const start = performance.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const duration = Math.round((performance.now() - start) / 1000);
        if (window.gtag) {
          window.gtag('event', 'time_on_page', {
            event_category: 'engagement',
            value: duration,
          });
        }
      }
    });
  };

  const initAnalytics = () => {
    enforceSingleTheme();
    ensureRefCode();
    updateShareLinks();
    setupSubscribeForm();
    setupRecaptcha();
    setupPhoneLink();
    setupDetails();
    setupTrackables();
    setupCookieBanner();
    bindScrollTracking();
    bindTimeOnPage();
    return !!document.getElementById('nav-menu');
  };

  if (!initAnalytics()) {
    const onIncludesLoaded = () => {
      if (initAnalytics()) {
        document.removeEventListener('includes:loaded', onIncludesLoaded);
      }
    };
    document.addEventListener('includes:loaded', onIncludesLoaded);
  }
})();
