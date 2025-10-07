import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const filePath = path.resolve(__dirname, '../index.html');

test('menu supports keyboard navigation', async ({ page }) => {
  await page.addInitScript(() => {
    document.documentElement.setAttribute('data-nav-variant', 'compact');
  });
  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

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
