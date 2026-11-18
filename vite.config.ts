import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const p = (x: string) => fileURLToPath(new URL(x, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': p('./src'), 'next/link': p('./src/shims/next-link.tsx') } },
  build: { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 2000 },
});
