import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

const expected = ['Testimonials', 'Why', 'How', 'eBay', 'OfferUp', 'Subscribe', 'Business Inquiries'];

test('navbar links are in expected order', async ({ page }) => {
  await page.goto('file://' + filePath);
  const texts = await page.$$eval(
    'header.navbar nav a',
    (links, len) => links.slice(0, len).map(l => l.textContent?.trim() || ''),
    expected.length
  );
  expect(texts).toEqual(expected);
});
