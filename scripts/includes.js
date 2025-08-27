(() => {
  const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const templates = {
    'partials/navbar.html': `<header class="navbar">
  <a href="#home" class="brand">
    <img src="logo.svg" alt="HecCollects logo" width="40" height="40">
  </a>
  <nav id="nav-menu" class="nav-menu" aria-hidden="true">
        <a href="#testimonials">Success Stories</a>
        <a href="#story">Our Story</a>
        <a href="#approach">Built on Trust</a>
    <a href="#ebay">eBay</a>
    <a href="#offerup">OfferUp</a>
    <a href="#subscribe">Subscribe</a>
    <a href="#contact">Business Inquiries</a>
    <a href="sold.html">Sold Listings</a>
    <a href="faq.html">FAQ</a>
    <a href="returns.html">Returns</a>
    <a href="privacy.html">Privacy Policy</a>
  </nav>
  <button id="theme-toggle" aria-label="Toggle theme"></button>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
    <span class="line" aria-hidden="true"></span>
    <span class="line" aria-hidden="true"></span>
    <span class="line" aria-hidden="true"></span>
  </button>
</header>`,
    'partials/footer.html': `<footer class="site-footer">
  <a href="#home">Home</a>
  <a href="sold.html">Sold Listings</a>
  <a href="faq.html">FAQ</a>
  <a href="returns.html">Returns</a>
  <a href="privacy.html">Privacy Policy</a>
</footer>`
  };

  document.querySelectorAll('[data-include]').forEach(el => {
    const file = el.getAttribute('data-include');
    if (!file) return;

    // When running from the filesystem, XHR requests to local files
    // trigger CORS errors. Use the inline templates instead to avoid
    // noisy console errors that would fail tests.
    if (location.protocol === 'file:' && templates[file]) {
      el.outerHTML = templates[file];
      return;
    }

    const xhr = new XMLHttpRequest();
    try {
      xhr.open('GET', file, false);
      xhr.send();
      if (xhr.status >= 200 && xhr.status < 300) {
        el.outerHTML = xhr.responseText;
      } else if (templates[file]) {
        el.outerHTML = templates[file];
      } else {
        console.error('Failed to load include', file);
      }
    } catch {
      if (templates[file]) {
        el.outerHTML = templates[file];
      } else {
        console.error('Failed to load include', file);
      }
    }
  });
  if (!isHome) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (href === '#home') {
        a.setAttribute('href', a.classList.contains('brand') ? 'index.html#home' : 'index.html');
      } else {
        a.setAttribute('href', `index.html${href}`);
      }
    });
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-menu a').forEach(a => {
      if (a.getAttribute('href') === currentPage) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }
})();
