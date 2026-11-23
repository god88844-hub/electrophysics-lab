import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp64-bundle.spec.ts',
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4185',
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4185 --strictPort',
    port: 4185,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
