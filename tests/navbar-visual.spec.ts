import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 1280, height: 720 } });

const filePath = path.resolve(__dirname, '../index.html');

test('navbar layout should match snapshot', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('file://' + filePath);
  await page.evaluate(() => (document as any).fonts.ready);
  await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
  const nav = page.locator('header.navbar');
  await nav.waitFor();
  expect(await nav.screenshot()).toMatchSnapshot('navbar.png', {
    maxDiffPixelRatio: 0.01,
  });
});
