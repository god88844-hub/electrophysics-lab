import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    fs: { allow: [repoRoot] },
  },
  resolve: {
    alias: {
      '@reflib': path.join(repoRoot, 'data', 'reference-library'),
      '@physics': path.join(repoRoot, 'packages', 'physics-engine', 'src'),
      '@quantum': path.join(repoRoot, 'packages', 'quantum-engine', 'src'),
    },
  },
  worker: { format: 'es' },
  build: { target: 'esnext', chunkSizeWarningLimit: 1500 },
});
