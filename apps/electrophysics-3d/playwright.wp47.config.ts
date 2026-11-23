import { defineConfig } from '@playwright/test';

/**
 * WP-4.7 — isolated Playwright config (port 4183, own webServer) for the
 * tile drill-down → Layer-1 stress suite. Parallel agents on the shared
 * 4173/4182 ports are never disturbed.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp47-drilldown.spec.ts',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4183',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4183 --strictPort',
    port: 4183,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
