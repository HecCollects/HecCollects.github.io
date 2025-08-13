import { test, expect } from '@playwright/test';
import path from 'path';

const pages = ['index.html', 'faq.html', 'returns.html', 'privacy.html'];

for (const name of pages) {
  test(`apple icon and meta tags exist on ${name}`, async ({ page }) => {
    const filePath = path.resolve(__dirname, `../${name}`);
    await page.goto('file://' + filePath);

    const icon = page.locator('link[rel="apple-touch-icon"]');
    await expect(icon).toHaveAttribute('href', /logo\.svg$/);

    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveCount(1);
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveCount(1);
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveCount(1);
  });
}

