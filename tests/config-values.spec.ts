import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('hero CTA directs to concierge and phone link uses provided window values', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).PHONE_NUMBER = '5551234';
  });

  await page.goto('file://' + filePath);

  const heroCta = page.locator('[data-analytics="hero-concierge"]');
  await expect(heroCta).toHaveAttribute('href', '#contact');
  await expect(heroCta).toContainText('Talk with Hector');

  const contactPromo = page.locator('#contact .promo');
  await expect(contactPromo).toContainText('Drop your tag');

  const phoneLink = page.locator('#phone-link');
  await expect(phoneLink).toBeVisible();
  await expect(phoneLink).toHaveAttribute('href', 'tel:5551234');
});

test('phone link hidden when no phone number provided', async ({ page }) => {
  await page.goto('file://' + filePath);

  const phoneLink = page.locator('#phone-link');
  await expect(phoneLink).toBeHidden();
});
