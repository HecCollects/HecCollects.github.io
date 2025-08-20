import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('shows suggestions for matching input', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (typeof url === 'string' && url.endsWith('items.json')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              ebay: [
                { title: 'Magic Card', link: 'https://example.com/magic' },
                { title: 'Camera Lens', link: 'https://example.com/lens' }
              ]
            }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return originalFetch(url, options);
    };
  });

  await page.goto('file://' + filePath);
  await page.waitForTimeout(500);
  await page.fill('#product-search', 'mag');
  const options = page.locator('#search-suggestions li');
  await expect(options).toHaveCount(1);
  await expect(options.first()).toContainText('Magic Card');
});
