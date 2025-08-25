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

## Updating Sold Items

`scripts/update-sold.js` pulls recent sales data from eBay and TCGplayer and
writes `sold-items.json`.

Each entry in `sold-items.json` contains:

- `title` – item title.
- `image` – thumbnail image URL.
- `url` – link to the listing.
- `price` – object with `value` and `currency`.
- `date` – sale completion date.
- `location` – item location.
- `platform` – source marketplace (`ebay` or `tcgplayer`).
- `condition` – item condition when available.
- `quantitySold` – number of units sold when available.
- `sellerCount` – number of sellers offering the item if provided by the API, otherwise `null`.

Set the following environment variables before running the script:

- `EBAY_APP_ID` – eBay developer application ID.
- `TCG_PUBLIC_KEY` and `TCG_PRIVATE_KEY` – TCGplayer API credentials.
- `SOLD_SEARCH_TERM` – optional keyword to search for (default `collectible`).
- `SOLD_LIMIT` – optional maximum number of results to fetch (default `10`).

Run the script with:

```bash
npm run update-sold
```

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

Brand colors are centralized as CSS variables in `style.css`. Adjust the values in the `:root` block to tweak colors across the site:

```css
:root {
  --color-primary: #1e3c72;
  --color-secondary: #2a5298;
  --color-accent: #f28c2f;
}
```

Sections derive their backgrounds from these core colors using shared gradients, so updating any variable will update the styling across the site.

