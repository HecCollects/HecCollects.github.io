import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('feature marquee duplicates items for seamless scrolling', async ({ page }) => {
  await page.goto('file://' + filePath);
  const marquee = page.locator('.feature-marquee');
  await expect(marquee).toBeVisible();
  const items = marquee.locator('li');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  expect(count % 2).toBe(0);
  const texts = await items.allInnerTexts();
  const half = count / 2;
  expect(texts.slice(0, half)).toEqual(texts.slice(half));
});
