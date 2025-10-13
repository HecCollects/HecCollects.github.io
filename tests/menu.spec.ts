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

    await expect(page.locator('.nav-menu')).not.toHaveClass(/open/);
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

const isDesktopProject = (process.env.PLAYWRIGHT_TEST_PROJECT || '').includes('desktop');

test.describe('desktop floating navbar', () => {
  test.skip(!isDesktopProject, 'desktop-only behavior');
  test.use({ viewport: { width: 1440, height: 900 } });

  test('floating variant stays collapsed until toggled', async ({ page }) => {
    const filePath = path.resolve(__dirname, '../index.html');
    await page.goto('file://' + filePath);

    const header = page.locator('header.navbar');
    await expect(header).toHaveClass(/\bnavbar--floating\b/);

    const navMenu = page.locator('#nav-menu');
    const toggle = page.locator('.nav-toggle');

    await expect(toggle).toBeVisible();
    await expect(navMenu).not.toHaveClass(/open/);
    await expect(navMenu).toHaveAttribute('aria-hidden', 'true');

    const horizontalOverflow = async () => {
      return page.evaluate(() => {
        const { scrollWidth, clientWidth } = document.documentElement;
        return Math.abs(scrollWidth - clientWidth);
      });
    };

    expect(await horizontalOverflow()).toBeLessThanOrEqual(1);

    await toggle.click();
    await expect(navMenu).toHaveClass(/open/);
    await expect(navMenu).toHaveAttribute('aria-hidden', 'false');
    expect(await horizontalOverflow()).toBeLessThanOrEqual(1);

    const navLinksWrap = await page.locator('.nav-links').evaluate(el => {
      return getComputedStyle(el).flexWrap;
    });
    expect(navLinksWrap).toBe('wrap');

    await toggle.click();
    await expect(navMenu).not.toHaveClass(/open/);
    await expect(navMenu).toHaveAttribute('aria-hidden', 'true');
    expect(await horizontalOverflow()).toBeLessThanOrEqual(1);
  });
});
