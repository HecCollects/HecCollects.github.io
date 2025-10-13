import { test, expect } from '@playwright/test';
import path from 'path';

const pages = ['faq.html', 'returns.html', 'privacy.html'];

const requiredNavAnchors = [
  'index.html',
  'index.html#story',
  'index.html#approach',
  'index.html#testimonials',
  'index.html#ebay',
  'index.html#offerup',
  'index.html#buyer-guides',
];

test.describe('policy page navigation', () => {
  for (const pageName of pages) {
    test(`${pageName} keeps in-page anchors local`, async ({ page }) => {
      const filePath = path.resolve(__dirname, `../${pageName}`);
      await page.goto('file://' + filePath);

      await page.waitForSelector('header.navbar .brand');
      const header = page.locator('header.navbar');
      await expect(header).toHaveClass(/\bnavbar--compact\b/);
      await expect(header).not.toHaveClass(/\bnavbar--floating\b/);
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

      const navAnchorHrefs = await page.$$eval('.nav-menu a', anchors =>
        anchors.map(a => a.getAttribute('href'))
      );
      requiredNavAnchors.forEach(expectedHref => {
        expect(navAnchorHrefs).toContain(expectedHref);
      });
      expect(navAnchorHrefs).not.toContain('index.html#subscribe');

      const footerHomeHref = await page.getAttribute('footer.site-footer a', 'href');
      expect(footerHomeHref).toBe('index.html');
    });
  }
});
