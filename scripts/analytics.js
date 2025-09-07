(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  let refCode = '';
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

  if (refCode) {
    document.querySelectorAll('a[data-share-link]').forEach(link => {
      try {
        const url = new URL(link.href, location.href);
        if (!url.searchParams.get('ref')) {
          url.searchParams.set('ref', refCode);
        }
        link.href = url.toString();
      } catch {}
    });
  }

  const subscribeForm = document.querySelector('#subscribe form');
  if (subscribeForm) {
    const refField = subscribeForm.querySelector('#referrer-field');
    try {
      if (refField && refCode) {
        refField.value = refCode;
      }
    } catch {}
    subscribeForm.addEventListener('submit', () => {
      if (refField && !refField.value) {
        try {
          refField.value = localStorage.getItem('ref') || '';
        } catch {}
      }
    });
  }

  const themes = ['light', 'dark', 'hc'];
  let storedTheme = 'light';
  try {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    storedTheme = localStorage.getItem('theme') || (systemDark ? 'dark' : 'light');
    if (!themes.includes(storedTheme)) storedTheme = 'light';
  } catch {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    storedTheme = systemDark ? 'dark' : 'light';
  }
  const nextIcon = {
    light: '🌙',
    dark: '🔳',
    hc: '☀️',
  };
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    if (themeToggle) {
      themeToggle.textContent = nextIcon[t];
      themeToggle.setAttribute('aria-pressed', t === 'light' ? 'false' : 'true');
    }
  };
  applyTheme(storedTheme);
  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const index = themes.indexOf(current);
    const next = themes[(index + 1) % themes.length];
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });

  const recaptchaEnabled = !!window.RECAPTCHA_SITE_KEY;
  const recaptcha = document.querySelector('.g-recaptcha');
  if (recaptcha) {
    if (recaptchaEnabled) {
      recaptcha.setAttribute('data-sitekey', window.RECAPTCHA_SITE_KEY);
      recaptcha.style.minHeight = '78px';
      recaptcha.style.minWidth = '302px';
    } else {
      recaptcha.classList.add('hidden');
    }
  }

  const phoneLink = document.getElementById('phone-link');
  if (phoneLink) {
    if (window.PHONE_NUMBER) {
      phoneLink.href = `tel:${window.PHONE_NUMBER}`;
      phoneLink.classList.remove('hidden');
    } else {
      phoneLink.classList.add('hidden');
    }
  }

  document.querySelectorAll('details').forEach(d => {
    const summary = d.querySelector('summary');
    if (!summary) return;
    summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    d.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    });
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
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieBtn = document.getElementById('cookie-btn');
  if (cookieBanner && cookieBtn) {
    if (localStorage.getItem('cookieConsent')) {
      cookieBanner.remove();
    } else {
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
    }
  }
  // Scroll depth tracking
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
  window.addEventListener('scroll', reportScroll, { passive: true });

  // Time-on-page tracking
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
})();
