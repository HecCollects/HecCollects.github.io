(() => {
  // Google Analytics tracking ID. Inject via deployment environment or build-time replacement.
  // Existing value is preserved so tests or environment scripts can set it.
  const script = document.currentScript || document.querySelector('script[src$="config.js"]');
  const clean = (val) => (val && !/^%[A-Z_]+%$/.test(val)) ? val : '';
  const { gaId = '', recaptchaSiteKey = '', phoneNumber = '' } = script ? script.dataset : {};

  window.GA_ID = window.GA_ID || clean(gaId);
  // reCAPTCHA site key. Replace with a real key for production.
  window.RECAPTCHA_SITE_KEY = window.RECAPTCHA_SITE_KEY || clean(recaptchaSiteKey);
  // Leaving the key empty disables reCAPTCHA for tests or local builds.
  // Contact phone number without the tel: prefix. Inject via deployment environment or build-time replacement.
  window.PHONE_NUMBER = window.PHONE_NUMBER || clean(phoneNumber);
})();
