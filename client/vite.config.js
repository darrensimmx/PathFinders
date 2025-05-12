// client/vite.config.js
import { defineConfig } from 'vite';
import react        from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // proxy all /api requests to your backend on port 4000
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
