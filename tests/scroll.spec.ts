import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const filePath = path.resolve(__dirname, '../index.html');

const navTargets = ['#home', '#testimonials', '#story', '#approach', '#ebay', '#offerup', '#buyer-guides', '#contact'];

test('sections scroll into view correctly', async ({ page }) => {
  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  const headerAllowance = await page.evaluate(() => {
    const header = document.querySelector('header.navbar');
    return header ? header.getBoundingClientRect().height : 0;
  });
  const tolerance = Math.max(120, Math.ceil(headerAllowance) + 32);

  const extraAllowances = new Map<string, number>([
    ['#buyer-guides', 192]
  ]);

  for (const target of navTargets) {
    await page.evaluate((selector) => {
      document.querySelector(selector)?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'instant'
      });
    }, target);
    const diff = await page.evaluate((selector) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return Number.POSITIVE_INFINITY;
      return Math.abs(el.getBoundingClientRect().top);
    }, target);
    const allowed = Math.max(tolerance, extraAllowances.get(target) ?? 0);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(allowed);
  }
});
