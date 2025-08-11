import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of viewports) {
  test(`hero title gradient visible on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('file://' + filePath);
    const heroTitle = page.locator('h1.hero-title');
    await expect(heroTitle).toBeVisible();
    const styles = await heroTitle.evaluate(el => {
      const cs = getComputedStyle(el);
      return {
        backgroundImage: cs.backgroundImage,
        color: cs.color,
        clip: (cs as any).webkitBackgroundClip || (cs as any).backgroundClip,
      };
    });
    expect(styles.backgroundImage).toContain('linear-gradient');
    expect(styles.color).toBe('rgba(0, 0, 0, 0)');
    expect(styles.clip).toBe('text');
  });
}
