import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

const navTargets = ['#home', '#ebay', '#offerup', '#about', '#contact'];

test('navigation links scroll to correct sections', async ({ page }) => {
  await page.goto('file://' + filePath);

  for (const target of navTargets) {
    await page.click('.nav-toggle');
    await page.locator('.nav-menu.open').waitFor();
    await page.evaluate((selector) => {
      (document.querySelector(`.nav-menu a[href="${selector}"]`) as HTMLElement).click();
    }, target);
    await page.waitForFunction(
      sel => Math.abs(window.scrollY - document.querySelector(sel).offsetTop) <= 1,
      target
    );

    const { scrollY, offsetTop } = await page.evaluate((selector) => {
      const el = document.querySelector(selector)! as HTMLElement;
      return { scrollY: window.scrollY, offsetTop: el.offsetTop };
    }, target);

    const diff = Math.abs(scrollY - offsetTop);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(1);
  }
});
