window.GA_ID = window.GA_ID || "%GA_ID%";
window.RECAPTCHA_SITE_KEY = window.RECAPTCHA_SITE_KEY || "%RECAPTCHA_SITE_KEY%";
window.PHONE_NUMBER = window.PHONE_NUMBER || "%PHONE_NUMBER%";

(() => {
  const DEFAULT_SUBSCRIBE_ENDPOINT = 'https://heccollects-newsletter.netlify.app/.netlify/functions/subscribe';
  const configuredEndpoint = "%SUBSCRIBE_ENDPOINT%";
  const usableEndpoint = (/^%.*%$/.test(configuredEndpoint) ? '' : configuredEndpoint) || DEFAULT_SUBSCRIBE_ENDPOINT;
  window.SUBSCRIBE_ENDPOINT = window.SUBSCRIBE_ENDPOINT || usableEndpoint;
})();
