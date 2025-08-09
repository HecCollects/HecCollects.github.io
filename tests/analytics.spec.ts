import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

async function runAnalyticsTest(page: Page) {
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
}

test.describe('outbound link analytics', () => {
  test('works without GA_ID', async ({ page }) => {
    await page.route('https://www.googletagmanager.com/gtag/js?*', route => {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });

    await page.goto(fileUrl);
    await runAnalyticsTest(page);
  });

  test('works with GA_ID', async ({ page }) => {
    await page.route('**/config.js', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.GA_ID="TEST";'
      });
    });
    await page.route('https://www.googletagmanager.com/gtag/js?*', route => {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });

    await page.goto(fileUrl);
    await runAnalyticsTest(page);
  });
});
