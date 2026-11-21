import { defineConfig } from '@playwright/test';

// WP-1.5: isolated preview port 4176 — parallel builder agents run their own
// Vite preview servers; strictPort fails fast on any collision instead of
// silently testing a stranger's build.
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes // WebGL/SwiftShader pages are resource-bound — serial for determinism
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4176',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4176 --strictPort',
    port: 4176,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
