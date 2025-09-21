(() => {
  const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const templates = {
    'partials/navbar.html': `<header class="navbar">
  <a href="#home" class="brand" data-analytics="nav-home">
    <img src="logo.svg" alt="HecCollects logo" width="40" height="40">
  </a>
  <nav id="nav-menu" class="nav-menu">
        <a href="#testimonials" data-analytics="nav-reviews">Customer Reviews</a>
        <a href="#story" data-analytics="nav-story">Our Story</a>
        <a href="#approach" data-analytics="nav-approach">Built on Trust</a>
    <a href="#ebay" data-analytics="nav-ebay">eBay</a>
    <a href="#offerup" data-analytics="nav-offerup">OfferUp</a>
    <a href="#subscribe" data-analytics="nav-subscribe">Subscribe</a>
    <a href="#contact" data-analytics="nav-contact">Business Inquiries</a>
    <a href="sold.html" data-analytics="nav-sold">Sold Listings</a>
    <a href="faq.html" data-analytics="nav-faq">FAQ</a>
    <a href="returns.html" data-analytics="nav-returns">Returns</a>
    <a href="privacy.html" data-analytics="nav-privacy">Privacy Policy</a>
  </nav>
  <button id="theme-toggle" aria-label="Toggle theme" aria-pressed="false"></button>
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

  const includePromises = [];
  document.querySelectorAll('[data-include]').forEach(el => {
    const file = el.getAttribute('data-include');
    if (!file) return;

    // When running from the filesystem, fetch requests to local files
    // trigger CORS errors. Use the inline templates instead to avoid
    // noisy console errors that would fail tests.
    if (location.protocol === 'file:' && templates[file]) {
      el.outerHTML = templates[file];
      return;
    }

    const p = fetch(file)
      .then(resp => {
        if (resp.ok) {
          return resp.text().then(html => {
            el.outerHTML = html;
          });
        }
        if (templates[file]) {
          el.outerHTML = templates[file];
        } else {
          console.error('Failed to load include', file);
        }
      })
      .catch(() => {
        if (templates[file]) {
          el.outerHTML = templates[file];
        } else {
          console.error('Failed to load include', file);
        }
      });
    includePromises.push(p);
  });

  Promise.all(includePromises).then(() => {
    if (!isHome) {
      document
        .querySelectorAll('.navbar .brand[href^="#"], .nav-menu a[href^="#"], .site-footer a[href^="#"]')
        .forEach(a => {
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

    document.dispatchEvent(new CustomEvent('includes:loaded'));
  });
})();
