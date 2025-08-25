import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const filePath = path.resolve(__dirname, '../index.html');
const itemsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../items.json'), 'utf-8'));

test('featured items are in viewport and clickable', async ({ page }) => {
  await page.goto('file://' + filePath);

  // Inject items since they do not load over the file protocol
  await page.evaluate((items) => {
    const build = (key: string, containerId: string) => {
      const container = document.getElementById(containerId);
      if (!container || !items[key]) return;
      items[key].forEach((item: any) => {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const img = document.createElement('img');
        const small = item.imageSmall || item.imageLarge;
        const large = item.imageLarge || item.imageSmall;
        const getWidth = (u: string) => {
          try {
            return parseInt(new URL(u).searchParams.get('width') || '0', 10);
          } catch {
            return 0;
          }
        };
        const smallW = getWidth(small);
        const largeW = getWidth(large);
        img.src = small;
        img.alt = item.alt;
        if (smallW && largeW) {
          img.srcset = `${small} ${smallW}w, ${large} ${largeW}w`;
          img.sizes = `(max-width: ${largeW}px) 100vw, ${largeW}px`;
        }
        container.appendChild(link);
        link.appendChild(img);
      });
    };
    build('ebay', 'ebay-items');
    build('offerup', 'offerup-items');
  }, itemsData);
  await page.evaluate(() => {
    document.querySelectorAll('.featured-items').forEach(el => {
      (el as HTMLElement).style.justifyContent = 'flex-start';
    });
  });

  const anchors = page.locator('.featured-items a');
  const count = await anchors.count();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (let i = 0; i < count; i++) {
    const link = anchors.nth(i);
    // Ensure link is visible and clickable
    await expect(link).toBeVisible();

    // Ensure non-empty href
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();

    // Ensure image has alt text
    const alt = await link.locator('img').getAttribute('alt');
    expect(alt).toBeTruthy();

    // Ensure element allows pointer events
    await expect(link).not.toHaveCSS('pointer-events', 'none');

    // Verify the link is fully within viewport bounds
    await link.evaluate(el => {
      (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      const parent = (el as HTMLElement).parentElement as HTMLElement | null;
      parent?.scrollTo({ left: (el as HTMLElement).offsetLeft, behavior: 'instant' });
    });
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    if (box && viewport) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
  }
});
