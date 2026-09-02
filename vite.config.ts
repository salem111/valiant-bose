import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Vite serves only the frontend. Sensitive APIs (Agora tokens and Gemini) run
 * in server.ts, where Firebase authentication and rate limits are enforced.
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/targets': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/agency': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/diamonds': { target: 'http://127.0.0.1:4000', changeOrigin: true },
    },
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {
      ignored: ['**/android/**', '**/dist/**'],
    },
  },
});
