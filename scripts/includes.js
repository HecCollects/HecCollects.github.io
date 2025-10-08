(() => {
  const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const templates = {
    'partials/navbar.html': `<header class="navbar navbar--floating" role="banner">
  <div class="navbar__surface">
    <a href="#home" class="brand" data-analytics="nav-home">
      <img src="logo.svg" alt="HecCollects logo" width="44" height="44">
      <span class="brand-text">
        <span class="brand-title">HecCollects</span>
        <span class="brand-tagline">Collectibles · Community · Care</span>
      </span>
    </a>
    <nav id="nav-menu" class="nav-menu" aria-label="Primary">
      <ul class="nav-links" role="list">
        <li class="nav-item"><a href="#testimonials" data-analytics="nav-reviews" data-nav-link>Customer Reviews</a></li>
        <li class="nav-item"><a href="#story" data-analytics="nav-story" data-nav-link>Our Story</a></li>
        <li class="nav-item"><a href="#approach" data-analytics="nav-approach" data-nav-link>Built on Trust</a></li>
        <li class="nav-item"><a href="#ebay" data-analytics="nav-ebay" data-nav-link>eBay</a></li>
        <li class="nav-item"><a href="#offerup" data-analytics="nav-offerup" data-nav-link>OfferUp</a></li>
        <li class="nav-item"><a href="#subscribe" data-analytics="nav-subscribe" data-nav-link>Subscribe</a></li>
        <li class="nav-item"><a href="#support-resources" data-analytics="nav-support" data-nav-link>Support</a></li>
        <li class="nav-item has-dropdown">
          <button class="dropdown-toggle" type="button" aria-expanded="false" aria-controls="resources-menu">
            Resources
            <span class="dropdown-icon" aria-hidden="true"></span>
          </button>
          <ul id="resources-menu" class="dropdown-menu" role="menu" hidden>
            <li role="none"><a role="menuitem" href="faq.html" data-analytics="nav-faq">FAQ</a></li>
            <li role="none"><a role="menuitem" href="returns.html" data-analytics="nav-returns">Returns</a></li>
            <li role="none"><a role="menuitem" href="privacy.html" data-analytics="nav-privacy">Privacy</a></li>
          </ul>
        </li>
      </ul>
      <div class="nav-actions">
        <a class="btn nav-cta" href="https://ebay.us/m/HoUY1I?utm_source=site&amp;utm_medium=referral" target="_blank" rel="noopener noreferrer" data-analytics="nav-shop">Shop eBay</a>
        <a class="nav-link-ghost" href="#contact" data-analytics="nav-contact" data-nav-link>Contact</a>
      </div>
    </nav>
    <button id="theme-toggle" aria-label="Toggle theme" aria-pressed="false"></button>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
      <span class="line" aria-hidden="true"></span>
      <span class="line" aria-hidden="true"></span>
      <span class="line" aria-hidden="true"></span>
    </button>
  </div>
</header>`,
    'partials/footer.html': `<footer class="site-footer">
  <a href="#home">Home</a>
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
    const navVariantAttr =
      document.body?.dataset.navVariant ||
      document.documentElement.dataset.navVariant;
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const variant =
        navVariantAttr === 'classic'
          ? 'floating'
          : navVariantAttr || navbar.dataset.navVariant || 'floating';

      navbar.classList.remove('navbar--floating', 'navbar--compact');

      if (variant === 'compact') {
        navbar.classList.add('navbar--compact');
      } else {
        navbar.classList.add('navbar--floating');
      }
    }

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
