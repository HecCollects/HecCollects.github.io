import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

const expected = ['Testimonials', 'About Me', 'eBay', 'OfferUp', 'Subscribe', 'Business Inquiries'];

test('navbar links are in expected order', async ({ page }) => {
  await page.goto('file://' + filePath);
  const texts = await page.$$eval('header.navbar nav a', links => links.slice(0, expected.length).map(l => l.textContent?.trim() || ''));
  expect(texts).toEqual(expected);
});
