import { test, expect } from '@playwright/test';
import path from 'path';

test.use({ viewport: { width: 375, height: 667 } });

const filePath = path.resolve(__dirname, '../index.html');

const navTargets = ['#home', '#ebay', '#offerup', '#about', '#testimonials', '#subscribe', '#contact'];

test('navigation links scroll to correct sections', async ({ page }) => {
  await page.goto('file://' + filePath);

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(msg.text());
    }
  });

  for (const target of navTargets) {
    await page.click('.nav-toggle');
    await page.locator('.nav-menu.open').waitFor();
    await page.evaluate((selector) => {
      (document.querySelector(`.nav-menu a[href="${selector}"]`) as HTMLElement).click();
    }, target);
    // Wait until the window is scrolled close to the target element
    await page.evaluate(selector => {
      return new Promise<void>(resolve => {
        const el = document.querySelector(selector) as HTMLElement;
        const check = () => {
          if (Math.abs(window.scrollY - el.offsetTop) <= 1) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }, target);

    const { scrollY, offsetTop } = await page.evaluate((selector) => {
      const el = document.querySelector(selector)! as HTMLElement;
      return { scrollY: window.scrollY, offsetTop: el.offsetTop };
    }, target);

    const diff = Math.abs(scrollY - offsetTop);
    expect(diff, `${target} is off by ${diff}px`).toBeLessThanOrEqual(1);
  }
});
