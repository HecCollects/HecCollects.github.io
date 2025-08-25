import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

test('reCAPTCHA and phone link use provided window values', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).RECAPTCHA_SITE_KEY = 'SITE-KEY';
    (window as any).PHONE_NUMBER = '5551234';
  });

  await page.goto('file://' + filePath);

  const recaptcha = page.locator('.g-recaptcha');
  await expect(recaptcha).toBeVisible();
  await expect(recaptcha).toHaveAttribute('data-sitekey', 'SITE-KEY');

  const phoneLink = page.locator('#phone-link');
  await expect(phoneLink).toBeVisible();
  await expect(phoneLink).toHaveAttribute('href', 'tel:5551234');
});

test('phone link hidden when no phone number provided', async ({ page }) => {
  await page.goto('file://' + filePath);

  const phoneLink = page.locator('#phone-link');
  await expect(phoneLink).toBeHidden();
});
