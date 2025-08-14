const fs = require('fs');
const path = require('path');

const files = [
  { src: 'logo.png.b64', dest: 'logo.png' },
  { src: 'logo-apple-touch.png.b64', dest: 'logo-apple-touch.png' }
];

files.forEach(({ src, dest }) => {
  const srcPath = path.resolve(__dirname, '..', src);
  if (fs.existsSync(srcPath)) {
    const destPath = path.resolve(__dirname, '..', dest);
    const base64 = fs.readFileSync(srcPath, 'utf8');
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(destPath, buffer);
    console.log(`Decoded ${destPath}`);
  }
});

