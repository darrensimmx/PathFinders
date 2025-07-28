import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // This ensures proper routing base in production
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // Optional: ensure dist is used correctly
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // optional: allows @/ imports
    },
  },
});
