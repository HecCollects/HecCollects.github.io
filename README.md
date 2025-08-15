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

## Configuration

`config.js` reads optional values from the global `window` object.
Provide these at deploy time by defining them before the script loads or by
replacing them during your build (for example via environment variables).

- `window.GA_ID` – Google Analytics tracking ID.
- `window.PHONE_NUMBER` – Contact number used for the phone link.

If left unset, analytics is disabled and the phone link will be hidden.

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

