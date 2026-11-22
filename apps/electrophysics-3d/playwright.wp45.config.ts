import { defineConfig } from '@playwright/test';

/**
 * WP-4.5 — isolated Playwright config (port 4182, own webServer) for the
 * live-execution → 3D packet-flow suite. Parallel agents on the shared 4173
 * port are never disturbed.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp45-live-exec.spec.ts',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4182',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4182 --strictPort',
    port: 4182,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
