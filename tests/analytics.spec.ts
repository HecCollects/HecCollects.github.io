import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

// Ensure the GA script tag is injected and no console errors occur.
test('GA script loads with integrity', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).GA_ID = 'G-TESTID';
  });

  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await page.waitForSelector(
    'script[src*="googletagmanager.com/gtag/js"][integrity]',
    { state: 'attached' }
  );
  const integrity = await page.getAttribute('script[src*="googletagmanager.com/gtag/js"]', 'integrity');
  expect(integrity).toBeTruthy();
});
