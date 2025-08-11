import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

// Ensure the GA script tag is injected and analytics configuration runs.
test('GA script loads and configures GA', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).GA_ID = 'G-TESTID';
  });

  await page.route('https://www.googletagmanager.com/**', route => {
    route.fulfill({ status: 200, body: '' });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await page.goto('file://' + filePath);

  await page.waitForSelector(
    'script[src*="googletagmanager.com/gtag/js"]',
    { state: 'attached' }
  );

  const { gtagDefined, configEvent } = await page.evaluate(() => {
    const dataLayer = (window as any).dataLayer || [];
    return {
      gtagDefined: typeof (window as any).gtag === 'function',
      configEvent: dataLayer.some((entry: any[]) => entry[0] === 'config' && entry[1] === 'G-TESTID'),
    };
  });

  expect(gtagDefined).toBe(true);
  expect(configEvent).toBe(true);
});
