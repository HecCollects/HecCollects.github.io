import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: { ignoreHTTPSErrors: true },
  testIgnore: ['tests/navbar-visual.spec.ts'],
  projects: [
    {
      name: 'mobile-landscape',
      use: { ...devices['iPhone 12 landscape'] },
    },
  ],
});
