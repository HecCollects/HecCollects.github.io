# HecCollects.github.io

## Logo

The site uses a premium gradient “HC” emblem stored as SVG and base64-encoded PNGs for deployment.

## Development Setup

1. Ensure you have **Node.js 18+** installed.

2. Install dependencies:

   ```bash
   npm install
   ```

   This installs Playwright and downloads the necessary browser binaries.
    If browsers or system packages are missing, run `npx playwright install` and `npx playwright install-deps`.

3. Decode binary assets:

   ```bash
   node scripts/decode-font.js
   node scripts/decode-logo.js
   ```

   Fonts and images are stored in base64 form (`.b64`) and must be decoded before serving or testing.

4. Run the test suite:

   ```bash
   npm test
   ```

Playwright Test will execute the browser-based tests.

## Navbar Variants

The floating navbar layout is restored as the default via the `navbar--floating` class that ships with the shared header partial.
To force the compact layout without editing the markup, set `data-nav-variant="compact"` on either `<html>` or `<body>` before the includes script hydrates the partial:

```js
document.documentElement.setAttribute('data-nav-variant', 'compact');
```

Setting `data-nav-variant="floating"` (or the legacy `classic`) re-applies the floating modifier if a page needs to override a previously stored preference.
The Playwright specs follow this pattern so reviewers can toggle between layouts from the browser console without editing templates.

## Data Fetch Scripts

The Node utilities for fetching external data exit with a non-zero code if a required API request fails. Run them with:

- `npm run fetch-items`
- `npm run update-reviews`

In CI or other automated environments, these failures will surface in the build logs.

## Communications

The newsletter and membership signup flow has been retired. Visitors now connect directly through the
contact options on the landing page (email, Instagram, or concierge phone line). Serverless scripts and
Mailchimp integrations that previously handled subscriptions have been removed to simplify the stack.

Run `npm run build` before deploying so `env.js` receives the final analytics and contact values.

## Referral Codes

Visitors can share a `ref` code by appending `?ref=CODE` to the site URL. The code is stored in `localStorage` and appended to outbound links marked with `data-share-link` so referrals persist across sessions and when links are shared.

Visiting the site with an empty `?ref=` parameter clears any previously stored code.

Rewards can be granted when a referral leads to a purchase or concierge booking. For example, a user might earn a discount or credit after a set number of successful referrals.

## Configuration

`config.js` reads optional values from its `<script>` tag's `data-` attributes or existing `window` properties.
Provide these at deploy time by setting the attributes in HTML or defining globals before the script loads (for example via environment variables).

- `data-ga-id` or `window.GA_ID` – Google Analytics tracking ID.
- `data-recaptcha-site-key` or `window.RECAPTCHA_SITE_KEY` – reCAPTCHA site key.
- `data-phone-number` or `window.PHONE_NUMBER` – Contact number used for the phone link.

If left unset (or left as placeholder tokens like `%GA_ID%`), analytics is disabled, reCAPTCHA is hidden, and the phone link will be hidden.

Run `npm run build` before deploying to replace the `%GA_ID%`, `%RECAPTCHA_SITE_KEY%`, and `%PHONE_NUMBER%` tokens in `env.js` with the
values from the `GA_ID`, `RECAPTCHA_SITE_KEY`, and `PHONE_NUMBER` environment variables. The build step validates that no
placeholder tokens remain and fails otherwise.

## Animated Background Prototype

Evaluated libraries for a lightweight animated hero background:

- **Three.js** – full-featured 3D engine (~600 KB minified).
- **Vanta.js** – abstraction over Three.js with effect-specific builds (~13 KB) but requires Three.js.

The prototype uses `VANTA.NET` to render a low-poly particle network behind the hero section. Scripts load deferred and the animation respects `prefers-reduced-motion`, pausing when off‑screen to minimize performance impact.


## Theme Customization

Brand colors are centralized as CSS variables in `theme.css`. They follow a 60/30/10 distribution (neutrals/branding/accent) described in [DESIGN.md](DESIGN.md).

```css
:root {
  --brand-primary: #2563eb;
  --brand-secondary: #0f766e;
  --accent: #b45309;
}
```

Sections derive their backgrounds from these core colors using shared gradients, so updating any variable will update the styling across the site.

