import { defineConfig } from '@playwright/test';

/**
 * WP-2.6 — isolated Playwright config (port 4180, own webServer) for the
 * forensic-loop suite: breakdown → dock → slow-mo scrub → AI Fix. Parallel
 * agents on the shared 4173 port are never disturbed.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp26-forensics.spec.ts',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4180',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4180 --strictPort',
    port: 4180,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
