import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../sold.html');

test('sold page defaults to last 90 days and 3 month range, allows range change', async ({ page }) => {
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
  await expect(page.locator('#range-3m')).toHaveClass(/active/);
  await page.click('#range-1m');
  await expect(page.locator('#range-1m')).toHaveClass(/active/);
  await expect(page.locator('#sold-table thead th').nth(3)).toHaveText('Platform');
});

test('renders price points when data available', async ({ page }) => {
  await page.addInitScript(() => {
    const sample = {
      items: [
        {
          title: 'A',
          price: { value: 100, currency: 'USD' },
          date: '2099-04-10',
          condition: 'Near Mint'
        },
        {
          title: 'B',
          price: { value: 80, currency: 'USD' },
          date: '2099-04-01',
          condition: 'Near Mint'
        }
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
        destroy() {},
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  await expect(page.locator('#price-points .price-card')).toHaveCount(5);
  await expect(page.locator('#condition-comparison .condition-card')).toHaveCount(1);
  const card = page.locator('#condition-comparison .condition-card').first();
  await expect(card.locator('h3')).toHaveText('Near Mint');
  await expect(card.locator('p')).toHaveText('$90.00');
  await expect(page.locator('#avg-price')).toHaveText('Average price: $90.00');
  await expect(page.locator('#monthly-sales li').first()).toHaveText(
    'April 2099: $180.00'
  );
});

test('three month snapshot reflects recent sales', async ({ page }) => {
  await page.addInitScript(() => {
    const sample = [
      { title: 'A', price: { value: 20, currency: 'USD' }, date: '2099-05-20' },
      { title: 'B', price: { value: 10, currency: 'USD' }, date: '2099-05-10' },
      { title: 'C', price: { value: 5, currency: 'USD' }, date: '2000-01-01' }
    ];
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
        destroy() {},
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  const cards = page.locator('#three-month-snapshot .snapshot-card');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0).locator('h3')).toHaveText('Low Price');
  await expect(cards.nth(0).locator('p')).toHaveText('$10.00');
  await expect(cards.nth(1).locator('h3')).toHaveText('High Sale Price');
  await expect(cards.nth(1).locator('p')).toHaveText('$20.00');
  await expect(cards.nth(2).locator('h3')).toHaveText('Total Sold');
  await expect(cards.nth(2).locator('p')).toHaveText('2');
});

test('filters listings by selected platform', async ({ page }) => {
  await page.addInitScript(() => {
    const sample = [
      {
        title: 'Ebay Item',
        price: { value: 10, currency: 'USD' },
        date: '2099-01-01',
        platform: 'ebay',
        location: ''
      },
      {
        title: 'TCG Item',
        price: { value: 15, currency: 'USD' },
        date: '2099-01-02',
        platform: 'tcgplayer',
        location: ''
      }
    ];
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
        destroy() {},
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  const options = page.locator('#platform-filter option');
  await expect(options).toHaveCount(3);
  await expect(options.nth(1)).toHaveText('eBay');
  await expect(options.nth(2)).toHaveText('TCGplayer');

  const rows = page.locator('#sold-table tbody tr');
  await expect(rows).toHaveCount(2);
  await page.selectOption('#platform-filter', 'tcgplayer');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().locator('td').nth(3)).toHaveText('TCGplayer');
});

test('renders links with rel and plain text when link absent', async ({ page }) => {
  await page.addInitScript(() => {
    const sample = [
      {
        title: 'Has Link',
        link: 'https://example.com',
        price: { value: 10, currency: 'USD' },
        date: '2099-01-01'
      },
      {
        title: 'No Link',
        price: { value: 5, currency: 'USD' },
        date: '2099-01-02'
      }
    ];
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
        destroy() {},
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  const rows = page.locator('#sold-table tbody tr');
  const firstLink = rows.nth(0).locator('td').first().locator('a');
  await expect(firstLink).toHaveAttribute('href', 'https://example.com');
  await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');

  const secondCell = rows.nth(1).locator('td').first();
  await expect(secondCell.locator('a')).toHaveCount(0);
  await expect(secondCell).toContainText('No Link');
});

test('debounces render on rapid search input', async ({ page }) => {
  await page.addInitScript(() => {
    const sample = [
      {
        title: 'A',
        price: { value: 10, currency: 'USD' },
        date: '2099-01-01',
        platform: 'ebay',
        location: ''
      }
    ];
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
        destroy() {},
      };
    };
  });

  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);

  await page.evaluate(() => {
    const tbody = document.querySelector('#sold-table tbody');
    (window as any).__renderCallCount = 0;
    new MutationObserver(() => (window as any).__renderCallCount++)
      .observe(tbody, { childList: true });
  });

  await page.type('#sold-search', 'abc', { delay: 50 });
  await page.waitForFunction(() => (window as any).__renderCallCount === 1);
  const count = await page.evaluate(() => (window as any).__renderCallCount);
  expect(count).toBe(1);
});
