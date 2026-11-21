import { defineConfig } from '@playwright/test';

// WP-1.6: isolated preview port 4178 — parallel builder agents run their own
// Vite preview servers; strictPort fails fast on any collision instead of
// silently testing a stranger's build. Only the WP-1.6 dock spec runs here.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/wp16-dock.spec.ts',
  workers: 1,
  retries: 1, // SwiftShader WebGL pages are load-sensitive; one retry absorbs contention flakes
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:4178',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4178 --strictPort',
    port: 4178,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
