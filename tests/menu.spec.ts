import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('menu supports keyboard navigation', async ({ page }) => {
  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await page.click('.nav-toggle');
  await page.locator('.nav-menu.open').waitFor();

  const links = page.locator('.nav-menu a');
  const count = await links.count();

  await expect(links.first()).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();

  for (let i = 2; i < count; i++) {
    await page.keyboard.press('Tab');
  }
  await expect(links.nth(count - 1)).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(links.first()).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(links.nth(count - 1)).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('.nav-menu')).not.toHaveClass(/open/);
  await expect(page.locator('.nav-toggle')).toBeFocused();
});
