const fs = require('fs');
const path = require('path');

// Decode any Base64-encoded snapshot assets under the tests directory.
// Playwright stores visual snapshot files alongside their respective test
// suites (e.g., `navbar-visual.spec.ts-snapshots`). Previously this script
// only decoded files within a `__screenshots__` folder, which meant snapshots
// in other locations were missed and tests failed because the PNGs were
// absent at runtime.
const snapshotsDir = path.resolve(__dirname, '..', 'tests');

function decodeDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      decodeDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.png.b64')) {
      const dest = fullPath.replace(/\.b64$/, '');
      const base64 = fs.readFileSync(fullPath, 'utf8');
      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(dest, buffer);
      console.log(`Decoded ${dest}`);
    }
  }
}

if (fs.existsSync(snapshotsDir)) {
  decodeDir(snapshotsDir);
}
