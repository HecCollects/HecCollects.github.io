import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const pages = ['faq.html', 'returns.html', 'privacy.html'];

for (const name of pages) {
  test(`${name} h1 is below navbar`, async ({ page }) => {
    const filePath = path.resolve(__dirname, `../${name}`);
    await page.goto('file://' + filePath);
    await page.evaluate(() => (document as any).fonts.ready);

    const navBox = await page.locator('.navbar').boundingBox();
    const h1Box = await page.locator('h1').boundingBox();
    if (!navBox || !h1Box) throw new Error('Elements not found');
    expect(h1Box.y).toBeGreaterThanOrEqual(navBox.height);
  });
}
