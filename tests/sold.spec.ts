import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../sold.html');

test('sold page defaults to last 90 days and shows platform column', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (typeof url === 'string' && url.endsWith('sold-items.json')) {
        return Promise.resolve(
          new Response('[]', {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }
      return originalFetch(url, options);
    };
    window.Chart = function () {
      return {
        data: { labels: [], datasets: [{ data: [] }] },
        update() {},
        destroy() {}
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  await expect(page.locator('#date-filter')).toHaveValue('90');
  await expect(page.locator('#sold-table thead th').nth(3)).toHaveText('Platform');
});
