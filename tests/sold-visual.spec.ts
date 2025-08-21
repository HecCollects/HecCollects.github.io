import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../sold.html');

test('sold page layout should match snapshot', async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    const sample = {
      items: [
        { title: 'A', price: { value: 100, currency: 'USD' }, date: '2099-04-10', condition: 'Near Mint' },
        { title: 'B', price: { value: 80, currency: 'USD' }, date: '2099-04-01', condition: 'Near Mint' }
      ],
      listings: [
        { price: { value: 120, currency: 'USD' }, quantity: 2, sellerId: 'x' },
        { price: { value: 110, currency: 'USD' }, quantity: 3, sellerId: 'y' }
      ]
    };
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (typeof url === 'string' && url.endsWith('sold-items.json')) {
        return Promise.resolve(
          new Response(JSON.stringify(sample), {
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
  await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
  const main = page.locator('main');
  await main.waitFor();
  expect(await main.screenshot()).toMatchSnapshot('sold-layout.png', { maxDiffPixelRatio: 0.01 });
});
