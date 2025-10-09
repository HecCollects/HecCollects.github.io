import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const filePath = path.resolve(__dirname, '../index.html');

const navTargets = ['#home', '#testimonials', '#story', '#approach', '#ebay', '#offerup', '#subscribe', '#contact'];

test('sections scroll into view correctly', async ({ page }) => {
  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  const headerAllowance = await page.evaluate(() => {
    const header = document.querySelector('header.navbar');
    return header ? header.getBoundingClientRect().height : 0;
  });
  const tolerance = Math.max(120, Math.ceil(headerAllowance) + 32);

  for (const target of navTargets) {
    await page.evaluate((selector) => {
      document.querySelector(selector)?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'instant'
      });
    }, target);
    const diff = await page.evaluate((selector) => {
      const el = document.querySelector(selector)! as HTMLElement;
      return Math.abs(window.scrollY - el.offsetTop);
    }, target);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(tolerance);
  }
});
