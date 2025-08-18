(() => {
  if (window.RECAPTCHA_SITE_KEY && location.protocol !== 'file:') {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }
})();
