import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');
const includesPath = path.join(repoRoot, 'scripts', 'includes.js');
const includesSource = fs.readFileSync(includesPath, 'utf8');

const getFallbackTemplate = (file: string) => {
  const marker = `'${file}': \``;
  const start = includesSource.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing fallback template for ${file}`);
  }
  const remainder = includesSource.slice(start + marker.length);
  const end = remainder.indexOf('`');
  if (end === -1) {
    throw new Error(`Unterminated fallback template for ${file}`);
  }
  return remainder.slice(0, end);
};

const normalize = (html: string) => html.replace(/\r\n/g, '\n').trim();

['partials/navbar.html', 'partials/footer.html'].forEach(file => {
  test(`fallback template matches ${file}`, () => {
    const partial = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    expect(normalize(getFallbackTemplate(file))).toBe(normalize(partial));
  });
});
