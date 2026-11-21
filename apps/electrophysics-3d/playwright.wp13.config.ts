import { defineConfig } from '@playwright/test';

/**
 * WP-1.3 — isolated Playwright config for the `.eplab` project round-trip
 * suite. Runs ONLY `e2e/wp13-project.spec.ts` on preview port 4175 so
 * parallel agents on the shared 4173 port are never disturbed. The main
 * `playwright.config.ts` (all suites, port 4173) is untouched.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'wp13-project.spec.ts',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4175',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4175 --strictPort',
    port: 4175,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
