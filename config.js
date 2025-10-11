(() => {
  // Google Analytics tracking ID. Inject via deployment environment or build-time replacement.
  // Existing value is preserved so tests or environment scripts can set it.
  const script = document.currentScript || document.querySelector('script[src$="config.js"]');
  const clean = (val) => (val && !/^%[A-Z_]+%$/.test(val)) ? val : '';
  const { gaId = '', recaptchaSiteKey = '', phoneNumber = '', subscribeEndpoint = '' } = script ? script.dataset : {};

  window.GA_ID = clean(window.GA_ID || gaId);
  // reCAPTCHA site key. Replace with a real key for production.
  window.RECAPTCHA_SITE_KEY = clean(window.RECAPTCHA_SITE_KEY || recaptchaSiteKey);
  // Leaving the key empty disables reCAPTCHA for tests or local builds.
  // Contact phone number without the tel: prefix. Inject via deployment environment or build-time replacement.
  window.PHONE_NUMBER = clean(window.PHONE_NUMBER || phoneNumber);
  window.SUBSCRIBE_ENDPOINT = clean(window.SUBSCRIBE_ENDPOINT || subscribeEndpoint);
})();
