import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('static logo is shown when texture fails to load', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).WebGLRenderingContext = undefined;
  });

  await page.goto('file://' + filePath);

  await expect(page.locator('#package-anim')).toHaveClass(/show-logo/);
  await expect(page.locator('#package-anim canvas')).toHaveCount(0);
});
