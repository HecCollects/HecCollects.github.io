# HecCollects.github.io

## Development Setup

1. Ensure you have **Node.js 18+** installed.

2. Install dependencies:

   ```bash
   npm install
   ```

   This installs Playwright and downloads the necessary browser binaries.

3. Generate the bundled CSS and decode fonts:

   ```bash
   npm run build:css
   ```

   This script reconstructs the `myfont.woff2` file from its Base64 source and
   writes the concatenated `style.css`.

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

