import { defineConfig } from '@playwright/test';

/**
 * WP-1.4 — isolated Playwright config (port 4177, own webServer) so parallel
 * agent suites never collide on the shared preview server.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp14-undo-redo.spec.ts',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  workers: 1,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4177',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4177 --strictPort',
    port: 4177,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
