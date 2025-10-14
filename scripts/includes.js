(() => {
  const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const templates = {
    // IMPORTANT: Keep these fallbacks in sync with their partial files.
    // See tests/includes-fallback.spec.ts for the sync check.
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
        <li class="nav-item"><a href="#home" data-analytics="nav-hero" data-nav-link>Lead Magnet</a></li>
        <li class="nav-item"><a href="#story" data-analytics="nav-story" data-nav-link>Credibility</a></li>
        <li class="nav-item"><a href="#approach" data-analytics="nav-approach" data-nav-link>Guarantees</a></li>
        <li class="nav-item"><a href="#testimonials" data-analytics="nav-reviews" data-nav-link>Social Proof</a></li>
        <li class="nav-item"><a href="#ebay" data-analytics="nav-ebay" data-nav-link>eBay Vault</a></li>
        <li class="nav-item"><a href="#offerup" data-analytics="nav-offerup" data-nav-link>OfferUp Fast Pass</a></li>
        <li class="nav-item"><a href="#buyer-guides" data-analytics="nav-guides" data-nav-link>Buyer Guides</a></li>
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
        <a class="btn nav-cta" href="#contact" data-analytics="nav-contact-primary">Contact Hector</a>
      </div>
    </nav>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
      <span class="line" aria-hidden="true"></span>
      <span class="line" aria-hidden="true"></span>
      <span class="line" aria-hidden="true"></span>
    </button>
  </div>
</header>
`,
    'partials/footer.html': `<footer class="site-footer">
  <div class="footer-primary-links">
    <a href="#home" data-analytics="footer-home">Lead Magnet</a>
    <a href="#story" data-analytics="footer-credibility">Credibility</a>
    <a href="#approach" data-analytics="footer-guarantees">Guarantees</a>
    <a href="#contact" data-analytics="footer-concierge">Concierge</a>
  </div>
  <nav
    id="support-resources"
    class="support-links"
    aria-labelledby="support-resources-title"
  >
    <h2 id="support-resources-title" class="support-links__title">Need help?</h2>
    <ul class="support-links__list">
      <li>
        <a href="faq.html" data-analytics="footer-faq"
          >Browse our FAQ for quick answers</a
        >
      </li>
      <li>
        <a href="returns.html" data-analytics="footer-returns"
          >Understand our Returns process</a
        >
      </li>
      <li>
        <a href="privacy.html" data-analytics="footer-privacy"
          >Review our Privacy Policy</a
        >
      </li>
      <li>
        <a href="#buyer-guides" data-analytics="footer-guides"
          >Jump to Buyer Guides</a
        >
      </li>
      <li>
        <a href="#nurture" data-analytics="footer-nurture"
          >Understand post-purchase updates</a
        >
      </li>
    </ul>
  </nav>
</footer>
`,
    'partials/trust-hub.html': `<section id="nurture" class="trust-section">
  <div class="section-content">
    <div class="card reveal">
      <p class="heading-eyebrow">Post-Purchase Nurture</p>
      <h2 id="post-purchase">What happens after you click “Buy”</h2>
      <p class="heading-subtitle">Every order triggers concierge updates so you always know the status, care tips, and loyalty rewards applied.</p>
      <ol class="timeline">
        <li>
          <h3>Hour 0 – Confirmation</h3>
          <p>Instant email + SMS (opt-in) summarizing comps, authenticity photos, and loyalty points earned.</p>
        </li>
        <li>
          <h3>Hour 12 – Prep &amp; Packaging</h3>
          <p>Behind-the-scenes packout shots and a care guide specific to your category (cards, electronics, or memorabilia).</p>
        </li>
        <li>
          <h3>Delivery Day – Welcome Back</h3>
          <p>Automated check-in with setup tips, condition checklist reminders, and a concierge button for follow-up support.</p>
        </li>
        <li>
          <h3>Day 7 – Loyalty Boost</h3>
          <p>Personalized offer for your next milestone plus links to leave feedback or request a trade appraisal.</p>
        </li>
      </ol>
      <div class="links">
        <a href="returns.html#post-purchase-support" class="btn secondary-cta" data-analytics="nurture-support">Read the full support policy</a>
        <a href="#contact" class="btn secondary-cta" data-analytics="nurture-contact">Message Hector directly</a>
      </div>
    </div>
  </div>
</section>
`
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
