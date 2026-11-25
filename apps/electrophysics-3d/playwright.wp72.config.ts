import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp72-pbr-geometry.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 240_000,
  expect: { timeout: 25_000 },
  outputDir: process.env.EP_WP72_ARTIFACTS || join(tmpdir(), 'ep-wp72-playwright'),
  use: {
    baseURL: 'http://localhost:4188',
    viewport: { width: 1280, height: 720 },
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: process.env.EP_WP72_DESKTOP_CDP ? undefined : {
    command: 'npm run build && npm run preview -- --port 4188 --strictPort',
    port: 4188,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
