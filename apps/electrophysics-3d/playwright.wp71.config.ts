import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const desktop = Boolean(process.env.EP_WP71_DESKTOP_CDP);

export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp71-studio-lighting.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  outputDir: process.env.EP_WP71_ARTIFACTS || join(tmpdir(), 'ep-wp71-playwright'),
  use: {
    baseURL: 'http://localhost:4187',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.25,
  },
  webServer: desktop ? undefined : {
    command: 'npm run build && npm run preview -- --port 4187 --strictPort',
    port: 4187,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
