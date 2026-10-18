import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: { name: 'Tech Library', short_name: 'TechLib', description: 'Et levende opslagsværk om moderne softwareudvikling', theme_color: '#111714', background_color: '#f3f1e9', display: 'standalone', start_url: '/', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] },
    workbox: { navigateFallback: '/index.html', runtimeCaching: [] }
  })],
  server: { proxy: { '/api': 'http://localhost:3001', '/health': 'http://localhost:3001' } },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
});
