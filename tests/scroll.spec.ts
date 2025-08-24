import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const filePath = path.resolve(__dirname, '../index.html');

const navTargets = ['#home', '#testimonials', '#about', '#ebay', '#offerup', '#subscribe', '#contact'];

test('sections scroll into view correctly', async ({ page }) => {
  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  for (const target of navTargets) {
    await page.locator(target).scrollIntoViewIfNeeded();
    const diff = await page.evaluate((selector) => {
      const el = document.querySelector(selector)! as HTMLElement;
      return Math.abs(window.scrollY - el.offsetTop);
    }, target);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(100);
  }
});
