import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

const mailchimpEndpoint = /https:\/\/.*\.api\.mailchimp\.com\/.*/;

test('newsletter form handles successful Mailchimp response', async ({ page }) => {
  let requestHandled = false;
  await page.route(mailchimpEndpoint, async route => {
    requestHandled = true;
    const request = route.request();
    const payload = JSON.parse(request.postData() || '{}');
    expect(payload.email_address).toBe('tester@example.com');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'test-id' })
    });
  });

  await page.addInitScript(() => {
    window.MAILCHIMP_API_KEY = 'test-key';
  });

  await page.goto('file://' + filePath);
  await page.waitForSelector('.subscribe-form');

  const emailInput = page.locator('#subscribe-email');
  await emailInput.fill('tester@example.com');

  const submitButton = page.locator('.subscribe-form button[type="submit"]');
  await expect(submitButton).toBeEnabled();

  const message = page.locator('#subscribe-msg');

  await submitButton.click();

  await expect(message).toHaveText('Thanks for subscribing!');
  expect(requestHandled).toBeTruthy();
});
