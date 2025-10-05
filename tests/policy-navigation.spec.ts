import { test, expect } from '@playwright/test';
import path from 'path';

const pages = ['faq.html', 'returns.html', 'privacy.html'];

const expectedNavAnchors = [
  'index.html#testimonials',
  'index.html#story',
  'index.html#approach',
  'index.html#ebay',
  'index.html#offerup',
  'index.html#subscribe',
  'index.html#support-resources',
];

test.describe('policy page navigation', () => {
  for (const pageName of pages) {
    test(`${pageName} keeps in-page anchors local`, async ({ page }) => {
      const filePath = path.resolve(__dirname, `../${pageName}`);
      await page.addInitScript(() => {
        document.documentElement.setAttribute('data-nav-variant', 'floating');
      });
      await page.goto('file://' + filePath);

      await page.waitForSelector('header.navbar .brand');
      await page.waitForFunction(() => {
        const brand = document.querySelector<HTMLAnchorElement>('header.navbar .brand');
        return brand?.getAttribute('href')?.startsWith('index.html');
      });

      const skipHref = await page.getAttribute('.skip-link', 'href');
      expect(skipHref).toBe('#main');

      const tocHrefs = await page.$$eval('.policy-toc a, .toc a', anchors => anchors.map(a => a.getAttribute('href')));
      expect(tocHrefs.length).toBeGreaterThan(0);
      tocHrefs.forEach(href => expect(href).toBeTruthy());
      tocHrefs.forEach(href => expect(href?.startsWith('#')).toBeTruthy());

      const brandHref = await page.getAttribute('header.navbar .brand', 'href');
      expect(brandHref).toBe('index.html#home');

      const navAnchorHrefs = await page.$$eval('.nav-menu a', (anchors, count) => {
        return anchors.slice(0, count).map(a => a.getAttribute('href'));
      }, expectedNavAnchors.length);
      expect(navAnchorHrefs).toEqual(expectedNavAnchors);

      const footerHomeHref = await page.getAttribute('footer.site-footer a', 'href');
      expect(footerHomeHref).toBe('index.html');
    });
  }
});
