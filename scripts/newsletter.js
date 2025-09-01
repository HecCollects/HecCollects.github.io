(() => {
  const form = document.querySelector('.subscribe-form');
  if (!form) return;

  const msg = document.getElementById('subscribe-msg');
  const btn = form.querySelector('button[type="submit"]');
  const originalBtnHTML = btn?.innerHTML || '';
  const disableBtn = () => { if (btn) btn.disabled = true; };
  disableBtn();
  window.enableSubscribe = () => { if (btn) btn.disabled = false; };
  window.disableSubscribe = disableBtn;

  const recaptchaEnabled = !!window.RECAPTCHA_SITE_KEY;
  if (!recaptchaEnabled) {
    window.enableSubscribe();
    if (msg) {
      msg.textContent = 'reCAPTCHA disabled in test/local builds.';
      msg.className = 'form-msg';
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (msg) {
      msg.textContent = '';
      msg.className = 'form-msg';
    }
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>';
    }

    const hp = form.querySelector('input[name="hp"]');
    if (hp && hp.value) {
      if (msg) {
        msg.textContent = 'Submission rejected.';
        msg.className = 'form-msg error';
      }
      console.warn('Newsletter honeypot triggered');
      if (window.gtag) { window.gtag('event', 'subscribe_error'); }
      if (btn) { btn.innerHTML = originalBtnHTML; }
      return;
    }

    let token = '';
    if (recaptchaEnabled) {
      token = window.grecaptcha?.getResponse();
      if (!token) {
        if (msg) {
          msg.textContent = 'Please complete the captcha.';
          msg.className = 'form-msg error';
        }
        console.warn('Captcha missing');
        if (window.gtag) { window.gtag('event', 'subscribe_error'); }
        if (btn) { btn.innerHTML = originalBtnHTML; }
        return;
      }
    }

    const formData = new FormData(form);
    const payload = {
      email_address: formData.get('email'),
      status: 'subscribed',
      source: formData.get('source') || 'website',
      interests: formData.getAll('interests')
    };
    if (recaptchaEnabled) {
      payload['g-recaptcha-response'] = token;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (window.MAILCHIMP_API_KEY) {
      headers['Authorization'] = 'Basic ' + btoa('any:' + window.MAILCHIMP_API_KEY);
    }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (msg) {
          msg.textContent = 'Thanks for subscribing!';
          msg.className = 'form-msg success';
        }
        console.info('Subscription successful');
        if (window.gtag) {
          window.gtag('event', 'subscribe_success');
        }
        form.reset();
        disableBtn();
        if (recaptchaEnabled) {
          window.grecaptcha?.reset();
        }
      } else {
        if (msg) {
          msg.textContent = 'Submission failed. Please try again later.';
          msg.className = 'form-msg error';
        }
        console.warn('Subscription failed with status', res.status);
        if (window.gtag) { window.gtag('event', 'subscribe_error'); }
      }
    } catch {
      if (msg) {
        msg.textContent = 'Submission failed. Please try again later.';
        msg.className = 'form-msg error';
      }
      console.warn('Subscription request errored');
      if (window.gtag) { window.gtag('event', 'subscribe_error'); }
    }
    if (btn) {
      btn.innerHTML = originalBtnHTML;
    }
  });
})();
