import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/pwa/',

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  // Development server
  server: {
    port: 3000,
    open: true,
    host: true, // Allow access from network (for mobile testing)
  },

  // Preview server (for testing production build)
  preview: {
    port: 4000,
    open: true,
  },

  // Optimizations
  optimizeDeps: {
    include: ['marked', 'highlight.js', 'jspdf', 'docx'],
  },

  // Plugin for copying public files
  publicDir: 'public',
});
