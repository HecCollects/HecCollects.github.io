import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('preloader is removed and ripple cleans up', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await page.goto('file://' + filePath);
  await page.waitForLoadState('load');

  await page.waitForSelector('#preloader', { state: 'detached' });
  await expect(page.locator('#preloader')).toHaveCount(0);

  const btn = page.locator('.btn').first();
  await btn.click();

  const ripple = btn.locator('.ripple');
  await expect(ripple).toHaveCount(1);
  const start = Date.now();
  await expect(ripple).toHaveCount(0);
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(1000);
});
