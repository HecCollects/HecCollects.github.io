import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const variants = [
  {
    name: 'floating',
    expectedClass: 'navbar--floating',
    file: '../index.html',
  },
  {
    name: 'compact',
    expectedClass: 'navbar--compact',
    file: '../faq.html',
  },
];

for (const variant of variants) {
  test(`menu supports keyboard navigation (${variant.name})`, async ({ page }) => {
    const filePath = path.resolve(__dirname, variant.file);
    await page.goto('file://' + filePath);

    page.on('console', msg => {
      if (msg.type() === 'error') {
        throw new Error(msg.text());
      }
    });

    await expect(page.locator('header.navbar')).toHaveClass(
      new RegExp(`\\b${variant.expectedClass}\\b`)
    );

    await page.click('.nav-toggle');
    await page.locator('.nav-menu.open').waitFor();

    const focusable = page.locator('.nav-menu a, .nav-menu .dropdown-toggle');
    const count = await focusable.count();

    await expect(focusable.first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(focusable.nth(1)).toBeFocused();

    for (let i = 2; i < count; i++) {
      await page.keyboard.press('Tab');
      await expect(focusable.nth(i)).toBeFocused();
    }

    await page.keyboard.press('Tab');
    await expect(focusable.first()).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(focusable.nth(count - 1)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('.nav-menu')).not.toHaveClass(/open/);
    await expect(page.locator('.nav-toggle')).toBeFocused();
  });
}

test.describe('desktop floating navbar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('floating variant stays within viewport width', async ({ page }) => {
    const filePath = path.resolve(__dirname, '../index.html');
    await page.goto('file://' + filePath);

    const header = page.locator('header.navbar');
    await expect(header).toHaveClass(/\bnavbar--floating\b/);

    const hasOverflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return scrollWidth - clientWidth;
    });
    expect(Math.abs(hasOverflow)).toBeLessThanOrEqual(1);

    const navLinksWrap = await page.locator('.nav-links').evaluate(el => {
      return getComputedStyle(el).flexWrap;
    });
    expect(navLinksWrap).toBe('wrap');
  });
});
