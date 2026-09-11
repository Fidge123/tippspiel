import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './harness/ports';

export default defineConfig({
  testDir: './tests',
  globalSetup: './harness/global-setup.ts',
  // The suite shares one seeded database, so the flows run one after another.
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile\.spec\.ts|nojs\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL,
      },
    },
    {
      // The acceptance criterion for #85: every flow, with no JavaScript at
      // all. Flows join as their route moves to the Hono app.
      name: 'no-js',
      testMatch: /nojs\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL,
        javaScriptEnabled: false,
      },
    },
    {
      name: 'mobile',
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
