import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');
const sections = ['home', 'testimonials', 'story', 'approach', 'ebay', 'offerup', 'subscribe', 'contact'];

for (const section of sections) {
  test(`section ${section} is visible`, async ({ page }) => {
    await page.goto('file://' + filePath + `#${section}`);
    await page.waitForSelector(`#${section}`);
    await expect(page.locator(`#${section}`)).toBeVisible();
  });
}
