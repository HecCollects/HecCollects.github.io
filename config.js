// Google Analytics tracking ID. Inject via deployment environment or build-time replacement.
// Existing value is preserved so tests or environment scripts can set it.
window.GA_ID = window.GA_ID || '';
// reCAPTCHA site key. Replace with a real key for production.
window.RECAPTCHA_SITE_KEY = window.RECAPTCHA_SITE_KEY || '';
// Leaving the key empty disables reCAPTCHA for tests or local builds.
// Contact phone number without the tel: prefix. Inject via deployment environment or build-time replacement.
window.PHONE_NUMBER = window.PHONE_NUMBER || '';
