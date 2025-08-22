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

test('allows keyboard navigation of suggestions', async ({ page }) => {
  let assigned;
  await page.exposeFunction('recordNavigate', url => {
    assigned = url;
  });

  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (typeof url === 'string' && url.endsWith('items.json')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              ebay: [
                { title: 'Magic Card', link: 'https://example.com/magic' }
              ]
            }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return originalFetch(url, options);
    };
    document.addEventListener('search-navigate', e => {
      // @ts-ignore
      window.recordNavigate(e.detail);
    });
  });

  await page.goto('file://' + filePath);
  await page.waitForTimeout(500);
  await page.fill('#product-search', 'mag');
  await page.keyboard.press('ArrowDown');
  const active = page.locator('#search-suggestions li.active');
  await expect(active).toHaveText('Magic Card');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  expect(assigned).toBe('https://example.com/magic');
});
