import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: { ignoreHTTPSErrors: true },
  projects: [
    {
      name: 'desktop-chromium',
      use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-iphone',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 640 } },
    },
  ],
});
