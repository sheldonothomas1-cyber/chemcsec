/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Everything the learner needs is precached so the app works with zero data.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'ChemCSEC - CSEC Chemistry study',
        short_name: 'ChemCSEC',
        description: 'Lessons, practice, spaced review and mock exams for CXC CSEC Chemistry. Works offline.',
        theme_color: '#1257A8',
        background_color: '#F3F6F7',
        display: 'standalone',
        start_url: './',
        scope: './',
        // PNGs are what Android and iOS need to offer "Install"; the artwork keeps its
        // content inside the central safe zone, so the same files work as maskable icons.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  server: { port: 5173, strictPort: true },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
