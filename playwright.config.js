// @ts-check
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'https://staging.beequip.com';
const httpCredentials = {
  username: 'beequip-site-staging',
  password: 'X6T*JvQeKfYW6q*HCyFrUot9HRRm_Y-v'
};

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    httpCredentials,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1366, height: 900 }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } }
    // { name: 'firefox',  use: { ...devices['Desktop Firefox'] } }
  ]
});
