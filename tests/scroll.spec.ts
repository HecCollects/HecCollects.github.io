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
    await page.waitForTimeout(1000);

    const { scrollTop, offsetTop, scrollMarginTop } = await page.evaluate((selector) => {
      const wrapper = document.querySelector('.wrapper') as HTMLElement;
      const el = document.querySelector(selector)! as HTMLElement;
      const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop || '0');
      return { scrollTop: wrapper.scrollTop, offsetTop: el.offsetTop, scrollMarginTop };
    }, target);

    const expected = Math.max(offsetTop - scrollMarginTop, 0);
    const diff = Math.abs(scrollTop - expected);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(1);
  }
});
