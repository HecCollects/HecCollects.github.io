const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'logo.png.b64');
const dest = path.resolve(__dirname, '..', 'logo.png');

const base64 = fs.readFileSync(src, 'utf8');
const buffer = Buffer.from(base64, 'base64');
fs.writeFileSync(dest, buffer);

console.log(`Decoded ${dest}`);
