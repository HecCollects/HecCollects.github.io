const fs = require('fs');
const path = require('path');

// decode base64-encoded font so no binary files are tracked in git
const fontsDir = path.join(__dirname, 'fonts');
const b64Font = path.join(fontsDir, 'myfont.woff2.b64');
const fontOut = path.join(fontsDir, 'myfont.woff2');
if (fs.existsSync(b64Font)) {
  const b64 = fs.readFileSync(b64Font, 'utf8');
  fs.writeFileSync(fontOut, Buffer.from(b64.trim(), 'base64'));
  console.log('Font decoded to', fontOut);
}

const files = [
  path.join(__dirname, 'css', 'themes.css'),
  path.join(__dirname, 'css', 'layout.css'),
  path.join(__dirname, 'css', 'components.css'),
];

const outPath = path.join(__dirname, 'style.css');
const content = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
fs.writeFileSync(outPath, content);
console.log('CSS bundled to', outPath);
