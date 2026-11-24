import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp61-academy.spec.ts',
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4186',
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true,
    actionTimeout: 20_000,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4186 --strictPort',
    port: 4186,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
