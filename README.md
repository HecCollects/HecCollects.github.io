# HecCollects.github.io

## Development Setup

1. Ensure you have **Node.js 18+** installed.

2. Install dependencies:

   ```bash
   npm install
   ```

   This installs Playwright and downloads the necessary browser binaries.

3. Build the bundled stylesheet:

   ```bash
   npm run build:css
   ```

4. Run the test suite:

   ```bash
   npm test
   ```

Playwright Test will execute the browser-based tests.

`style.css` is generated from the CSS modules in the `css/` directory. Edit those sources and rerun `npm run build:css` rather than modifying `style.css` directly.

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

Brand gradients for major sections are centralized as CSS variables in `style.css`. Adjust the values in the `:root` block to tweak colors across the site:

```css
:root {
  --section-gradient-primary: linear-gradient(135deg, #1e3c72, #2a5298);
  --section-gradient-ebay: linear-gradient(135deg, #ff512f, #dd2476);
  --section-gradient-offerup: linear-gradient(135deg, #1d976c, #93f9b9);
  --section-gradient-about: linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b);
  --section-gradient-testimonials: linear-gradient(135deg, #20002c, #cbb4d4);
  --section-gradient-subscribe: linear-gradient(135deg, #f7971e, #ffd200);
  --section-gradient-contact: linear-gradient(135deg, #16222a, #3a6073);
}
```

Updating any of these variables will automatically update the corresponding section background without editing individual rules.

