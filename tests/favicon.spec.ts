import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

// Verify that the favicon link is set and the image loads successfully.
test('favicon loads', async ({ page }) => {
  await page.goto('file://' + filePath);

  const href = await page.getAttribute('link[rel="icon"]', 'href');
  expect(href).toBe('favicon.svg');

  const loaded = await page.evaluate(() => {
    return new Promise<boolean>(resolve => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      const img = document.createElement('img');
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = link.href;
    });
  });

  expect(loaded).toBe(true);
});
