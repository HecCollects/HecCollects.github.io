import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('sets theme-color meta tag', async ({ page }) => {
  await page.goto('file://' + filePath);
  const themeColor = page.locator('meta[name="theme-color"]');
  await expect(themeColor).toHaveAttribute('content', '#1e3c72');
});
