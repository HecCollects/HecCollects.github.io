const fs = require('fs');
const path = require('path');

function decodeFile(srcPath) {
  const destPath = srcPath.replace(/\.b64$/, '');
  const base64 = fs.readFileSync(srcPath, 'utf8');
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(destPath, buffer);
  console.log(`Decoded ${destPath}`);
}

const dirs = [
  path.resolve(__dirname, '..', 'fonts'),
  path.resolve(__dirname, '..', 'vendor', 'fontawesome'),
  path.resolve(__dirname, '..', 'vendor', 'webfonts')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter(file => file.endsWith('.b64'))
      .forEach(file => decodeFile(path.join(dir, file)));
  }
});
