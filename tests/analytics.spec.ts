import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

// Ensure test passes whether GA_ID is defined or not by stubbing network and gtag.
test('outbound links dispatch analytics events', async ({ page }) => {
  // Stub GA script in case GA_ID is set.
  await page.route('https://www.googletagmanager.com/gtag/js?*', route => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });

  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  await page.evaluate(() => {
    (window as any).__gtagCalls = [];
    (window as any).gtag = (...args: any[]) => {
      (window as any).__gtagCalls.push(args);
    };
    document.querySelectorAll('[data-analytics]').forEach(link => {
      link.addEventListener('click', e => e.preventDefault());
    });
  });

  const labels = await page.$$eval('[data-analytics]', els =>
    els.map(el => el.getAttribute('data-analytics'))
  );

  for (const label of labels) {
    await page.click(`[data-analytics="${label}"]`);
  }

  const calls = await page.evaluate(() => (window as any).__gtagCalls);
  const expected = labels.map(label => [
    'event',
    'click',
    { event_category: 'outbound', event_label: label },
  ]);

  expect(calls).toEqual(expected);
});
