import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('scroll cues are visible but hidden from assistive tech', async ({ page }) => {
  await page.goto('file://' + filePath);
  const cues = page.locator('.scroll-cue');
  const count = await cues.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const cue = cues.nth(i);
    await expect(cue).toBeVisible();
    await expect(cue).toHaveAttribute('aria-hidden', 'true');
    await expect(cue).toHaveAttribute('role', 'presentation');
  }
});
