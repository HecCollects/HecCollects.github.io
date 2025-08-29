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

  let storedTheme = 'dark';
  try {
    storedTheme = localStorage.getItem('theme') || 'dark';
  } catch {}
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    if (themeToggle) {
      themeToggle.textContent = t === 'light' ? '🌙' : '☀️';
    }
  };
  applyTheme(storedTheme);
  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(current);
    try {
      localStorage.setItem('theme', current);
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
  if(cookieBanner && cookieBtn){
    if(localStorage.getItem('cookieConsent')){
      cookieBanner.remove();
    }else{
      cookieBanner.classList.remove('hidden');
      cookieBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent','yes');
        cookieBanner.remove();
        if(window.gtag){ window.gtag('event','cookie_consent'); }
      });
    }
  }
})();
