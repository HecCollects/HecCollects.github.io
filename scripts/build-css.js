const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fontPath = path.join(root, 'fonts', 'myfont.woff2.b64');
let fontData = '';
try {
  fontData = fs.readFileSync(fontPath, 'utf-8').trim();
} catch (err) {
  console.warn('Font base64 file not found, skipping font embedding');
}

let baseCss = '';
try {
  baseCss = fs.readFileSync(path.join(root, 'css', 'base.css'), 'utf-8');
} catch (err) {
  // ignore if missing
}

const fontFace = fontData
  ? `@font-face{font-family:'MyFont';src:url('data:font/woff2;base64,${fontData}') format('woff2');font-display:swap;}`
  : '';

const output = fontFace + '\n' + baseCss;
fs.writeFileSync(path.join(root, 'style.css'), output);
console.log('style.css built');
