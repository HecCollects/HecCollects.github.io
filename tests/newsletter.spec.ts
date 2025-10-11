import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../index.html');

const subscribeEndpoint = 'https://example.com/.netlify/functions/subscribe';

test('newsletter form handles successful serverless response', async ({ page }) => {
  await page.addInitScript((endpoint) => {
    window.SUBSCRIBE_ENDPOINT = endpoint;
    window.__newsletterRequests = [];
    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Subscription successful.' })
    };
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url === endpoint) {
        try {
          const raw = init?.body ? JSON.parse(init.body) : {};
          window.__newsletterRequests.push(raw);
        } catch (error) {
          console.error('Failed to parse newsletter payload', error);
        }
        return successResponse;
      }
      return originalFetch(input, init);
    };
  }, subscribeEndpoint);

  await page.goto('file://' + filePath);
  await page.waitForSelector('.subscribe-form');
  const emailInput = page.locator('#subscribe-email');
  await emailInput.fill('tester@example.com');

  const submitButton = page.locator('.subscribe-form button[type="submit"]');
  await expect(submitButton).toBeEnabled();

  const message = page.locator('#subscribe-msg');

  await submitButton.click();

  await expect(message).toHaveText(/Subscription/);
  const requests = await page.evaluate(() => window.__newsletterRequests || []);
  expect(requests.length).toBe(1);
  expect(requests[0].email_address).toBe('tester@example.com');
  expect(requests[0].honeypot).toBe('');
});
