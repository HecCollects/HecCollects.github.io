import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('static logo is shown when texture fails to load', async ({ page }) => {
  await page.route('**/logo.png', route => route.abort());

  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await expect(page.locator('#package-anim')).toHaveClass(/show-logo/);
  await expect(page.locator('#package-anim canvas')).toHaveCount(0);
});
